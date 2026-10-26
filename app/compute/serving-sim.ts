import {
  MAX_BATCH, STEP_OVERHEAD, bandwidth, decodeStepSeconds, kvBytesPerToken, kvCapacityTokens, prefillSeconds, weightBytes,
} from "./calibration.ts";

/**
 * An iteration-level serving simulator in the style of Vidur: each engine
 * iteration's duration comes from the calibrated roofline (calibration.ts), the
 * scheduler decides which requests share it, and every second of GPU time is
 * attributed to the requests that used it. Event-driven: between admissions and
 * completions, decode steps form an arithmetic series and are summed in closed form.
 */
export type SimRequest = {
  id: number;
  arrival: number; // s
  input: number; // prompt tokens
  output: number; // generated tokens
  group: number | null; // shared-prefix group
  shared: number; // prompt tokens shared within the group
};
export type SimConfig = {
  scheduler: "continuous" | "barrier";
  reuse: boolean;
  fast: boolean; // FP8 weights and KV, faster attention kernels
  replicas: number;
};
export type SimResult = {
  id: number;
  replica: number;
  admitted: number;
  firstToken: number;
  finish: number;
  prefillGpu: number; // GPU-s attributed to reading the prompt
  decodeGpu: number; // GPU-s attributed to generating
  cacheHit: boolean;
  computedInput: number;
};

type Live = { r: SimRequest; res: SimResult; ctx: number; left: number; reserved: number; prefilled: boolean };

function runReplica(reqs: SimRequest[], cfg: SimConfig, replica: number): SimResult[] {
  const kvb = kvBytesPerToken(cfg.fast), W = weightBytes(cfg.fast), BW = bandwidth();
  const capacity = kvCapacityTokens(cfg.fast);
  const queue = [...reqs].sort((a, b) => a.arrival - b.arrival);
  const out: SimResult[] = [];
  const running: Live[] = [];
  const cacheReady = new Map<number, number>(); // group → time its prefix pages are ready on this replica
  let used = 0, t = 0;
  const sharedResident = new Set<number>();
  const reserve = (r: SimRequest, hit: boolean) => {
    const pooled = cfg.reuse && r.group !== null;
    // with reuse the shared prefix is held once per group; each request reserves only its own tokens
    const own = (pooled ? r.input - r.shared : r.input) + r.output;
    const extra = pooled && !sharedResident.has(r.group!) ? r.shared : 0;
    return { own, extra, hit };
  };

  while (queue.length || running.length) {
    // ── admission ──
    const admitted: Live[] = [];
    if (cfg.scheduler === "barrier") {
      if (!running.length && queue.length) {
        const pair = queue.splice(0, 2);
        t = Math.max(t, ...pair.map((p) => p.arrival)); // the pair waits for both arrivals
        for (const r of pair) admitted.push(admit(r));
      }
    } else {
      while (queue.length && queue[0].arrival <= t && running.length + admitted.length < MAX_BATCH) {
        const r = queue[0];
        const hit = cfg.reuse && r.group !== null && (cacheReady.get(r.group) ?? Infinity) <= t;
        const { own, extra } = reserve(r, hit);
        if (used + own + extra > capacity) break;
        queue.shift();
        admitted.push(admit(r));
      }
    }
    if (!admitted.length && !running.length) { t = Math.max(t, queue[0].arrival); continue; }

    if (admitted.length) {
      // one iteration: read the new prompts, and advance every running answer by one token
      const decoders = running.filter((l) => l.prefilled);
      const kvTokens = decoders.reduce((a, l) => a + l.ctx, 0);
      const dstep = decodeStepSeconds(decoders.length, kvTokens, cfg.fast);
      const pre = admitted.map((l) => prefillSeconds(l.res.computedInput, l.r.input - l.res.computedInput, cfg.fast));
      const parts = admitted.length + decoders.length;
      t += STEP_OVERHEAD + pre.reduce((a, b) => a + b, 0) + dstep;
      admitted.forEach((l, i) => { l.res.prefillGpu += pre[i] + STEP_OVERHEAD / parts; });
      const weightShare = W / Math.max(1, decoders.length);
      const total = W + kvTokens * kvb;
      decoders.forEach((l) => { l.res.decodeGpu += STEP_OVERHEAD / parts + (dstep * (weightShare + l.ctx * kvb)) / total; step(l, 1); });
      for (const l of admitted) {
        l.prefilled = true;
        l.res.firstToken = t; // the prefill emits the first token
        l.ctx = l.r.input + 1;
        l.left = l.r.output - 1;
        if (cfg.reuse && l.r.group !== null && !cacheReady.has(l.r.group)) cacheReady.set(l.r.group, t);
        running.push(l);
      }
      retire();
      continue;
    }

    // ── a run of identical decode steps, summed in closed form ──
    const b = running.length;
    const K = running.reduce((a, l) => a + l.ctx, 0);
    const A = STEP_OVERHEAD + (W + K * kvb) / BW, B = (b * kvb) / BW;
    const S = (k: number) => k * A + (B * k * (k - 1)) / 2;
    let k = Math.min(...running.map((l) => l.left));
    if (cfg.scheduler === "continuous" && queue.length && running.length < MAX_BATCH) {
      const next = queue[0];
      const dt = next.arrival - t;
      if (dt > 0) {
        // steps until the arrival: smallest k with S(k) ≥ dt
        const ka = B > 0 ? Math.ceil((-(A - B / 2) + Math.sqrt((A - B / 2) ** 2 + 2 * B * dt)) / B) : Math.ceil(dt / A);
        k = Math.min(k, Math.max(1, ka));
      }
    }
    k = Math.max(1, k);
    const dur = S(k);
    for (const l of running) {
      l.res.decodeGpu += k * (STEP_OVERHEAD / b + W / (b * BW) + (l.ctx * kvb) / BW) + (kvb / BW) * (k * (k - 1)) / 2;
    }
    t += dur;
    for (const l of running) step(l, k);
    retire();
  }
  return out;

  function admit(r: SimRequest): Live {
    const hit = cfg.reuse && r.group !== null && (cacheReady.get(r.group) ?? Infinity) <= t;
    const { own, extra } = reserve(r, hit);
    used += own + extra;
    if (extra) sharedResident.add(r.group!);
    const res: SimResult = { id: r.id, replica, admitted: t, firstToken: 0, finish: 0, prefillGpu: 0, decodeGpu: 0, cacheHit: hit, computedInput: hit ? r.input - r.shared : r.input };
    out.push(res);
    return { r, res, ctx: 0, left: r.output, reserved: own, prefilled: false };
  }
  function step(l: Live, k: number) { l.ctx += k; l.left -= k; }
  function retire() {
    for (let i = running.length - 1; i >= 0; i--) {
      if (running[i].left <= 0) { running[i].res.finish = t; used -= running[i].reserved; running.splice(i, 1); }
    }
  }
}

/**
 * The static baseline: requests run in synchronised pairs, one per replica and
 * alone on it; a pair starts once both have arrived and both replicas are free.
 */
function runPairs(sorted: SimRequest[], cfg: SimConfig): SimResult[] {
  const kvb = kvBytesPerToken(cfg.fast), W = weightBytes(cfg.fast), BW = bandwidth();
  const out: SimResult[] = [];
  let free = 0;
  for (let i = 0; i < sorted.length; i += cfg.replicas) {
    const pair = sorted.slice(i, i + cfg.replicas);
    const start = Math.max(free, ...pair.map((r) => r.arrival));
    const ends = pair.map((r, k) => {
      const pre = prefillSeconds(r.input, 0, cfg.fast);
      const first = start + STEP_OVERHEAD + pre;
      const steps = r.output - 1, A = STEP_OVERHEAD + (W + (r.input + 1) * kvb) / BW, B = kvb / BW;
      const decode = steps * A + (B * steps * (steps - 1)) / 2;
      out.push({ id: r.id, replica: k, admitted: start, firstToken: first, finish: first + decode, prefillGpu: STEP_OVERHEAD + pre, decodeGpu: decode, cacheHit: false, computedInput: r.input });
      return first + decode;
    });
    free = Math.max(...ends);
  }
  return out;
}

/** Continuous batching spreads requests round-robin across replicas in arrival order. */
export function simulateServing(reqs: readonly SimRequest[], cfg: SimConfig): SimResult[] {
  const sorted = [...reqs].sort((a, b) => a.arrival - b.arrival || a.id - b.id);
  if (cfg.scheduler === "barrier") return runPairs(sorted, cfg).sort((a, b) => a.id - b.id);
  const per = Array.from({ length: cfg.replicas }, (_, r) => sorted.filter((_, i) => i % cfg.replicas === r));
  return per.flatMap((list, r) => runReplica(list, cfg, r)).sort((a, b) => a.id - b.id);
}
