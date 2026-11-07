"use client";

import { inferenceStoryRuns } from "../lab-story-data";
import { STEP_OVERHEAD, fmtMs, kvBytesPerToken, prefillSeconds, rateCard, weightBytes } from "../calibration";
import { BATCHING } from "../batching-result";
import type { LabRun, Workload } from "../lab-simulation";
import { ease, prog } from "../../exhibit/engine";
import { makeImpact, type ArcBeat, type ArcLedger, type SceneProps } from "../stagecraft/module-arc";

/* The cheaper-execution pathway's three techniques, each told around its film
   chapter: how it works (a general scene) before the chapter, the measured
   impact (the lab model's own runs) after it. */
const C = { a: "#8fb4ff", b: "#b8e986", c: "#63d4df", doc: "#ffc267", q: "#f3a0bc", idle: "#ff8f86", ink: "#eef2f6", slate: "#4a5662" };
const sweep = (t: number, ms: number, end: number) => ease.io(prog(t, 700, ms - 2600)) * end;
const RUNS: Record<Workload, LabRun[]> = { "shared-prefix": inferenceStoryRuns("shared-prefix"), interactive: inferenceStoryRuns("interactive") };
const fmt = (v: number, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

/* ── Continuous batching ─────────────────────────────────────────────── */
type Job = { id: number; w: 0 | 1; a: number; b: number };
const STATIC: Job[] = [{ id: 1, w: 0, a: 0, b: 6 }, { id: 2, w: 1, a: 0, b: 3 }, { id: 3, w: 0, a: 6, b: 10 }, { id: 4, w: 1, a: 6, b: 13 }, { id: 5, w: 0, a: 13, b: 15 }, { id: 6, w: 1, a: 13, b: 18 }];
const CONT: Job[] = [{ id: 1, w: 0, a: 0, b: 6 }, { id: 2, w: 1, a: 0, b: 3 }, { id: 3, w: 1, a: 3, b: 7 }, { id: 4, w: 0, a: 6, b: 13 }, { id: 5, w: 1, a: 7, b: 9 }, { id: 6, w: 1, a: 9, b: 14 }];
const PAL = [C.a, C.b, C.c, C.doc, C.q, "#c7a6ff"];
const BX = 300, BPX = 42;
function Workers({ jobs, y, now, title, note, finish }: { jobs: Job[]; y: number; now: number; title: string; note: string; finish: number }) {
  const ends = [0, 1].map((w) => jobs.filter((j) => j.w === w));
  const idles = ends.flatMap((list) => list.slice(1).flatMap((j, i) => (j.a > list[i].b ? [{ w: j.w, a: list[i].b, b: j.a }] : [])))
    .concat(ends.flatMap((list) => (list.at(-1)!.b < finish ? [{ w: list[0].w, a: list.at(-1)!.b, b: finish }] : [])));
  return <g>
    <text x={0} y={y + 26} className="ma-k">{title}</text>
    <text x={0} y={y + 46} className="ma-l">{note}</text>
    {[0, 1].map((w) => <text key={w} x={BX - 14} y={y + 26 + w * 50} textAnchor="end" className="ma-l">worker {w + 1}</text>)}
    {jobs.map((j) => {
      const r = Math.min(j.b, now);
      if (r <= j.a) return null;
      return <g key={j.id}>
        <rect x={BX + j.a * BPX + 1} y={y + 8 + j.w * 50} width={Math.max(0, (r - j.a) * BPX - 2)} height={30} rx={4} fill={PAL[j.id - 1]} opacity={0.88} />
        {r >= j.b && <text x={BX + ((j.a + j.b) / 2) * BPX} y={y + 28 + j.w * 50} textAnchor="middle" className="ma-l" style={{ fill: "#0b1016" }}>R{j.id}</text>}
      </g>;
    })}
    {idles.filter((g) => now > g.a).map((g, i) => <rect key={i} x={BX + g.a * BPX + 1} y={y + 9 + g.w * 50} width={Math.max(0, (Math.min(g.b, now) - g.a) * BPX - 2)} height={28} rx={3} fill="none" stroke={C.idle} strokeDasharray="4 3" />)}
    {now >= finish && <text x={BX + finish * BPX} y={y - 4} textAnchor="end" className="ma-n" style={{ fill: C.ink }}>all done at {finish}</text>}
  </g>;
}
function Batching({ t }: SceneProps) {
  const now = sweep(t, BATCH_MS, 18);
  return <svg viewBox="0 0 1100 400" role="img" aria-label="Six requests on two workers: fixed pairs leave a worker idle until its partner finishes; giving the next request to the first free worker finishes at 14 instead of 18">
    <Workers jobs={STATIC} y={40} now={now} title="Fixed pairs" note="next pair waits for both" finish={18} />
    <Workers jobs={CONT} y={210} now={now} title="First free worker" note="next request starts at once" finish={14} />
    <path d={`M${BX + now * BPX} 16V320`} stroke="#eef2f6" strokeOpacity={0.35} />
    <g transform={`translate(${BX} 352)`}>
      <rect width={14} height={14} rx={2} fill="none" stroke={C.idle} strokeDasharray="3 2" /><text x={22} y={12} className="ma-l">a worker waiting while requests queue</text>
      <text x={0} y={36} className="ma-l">same requests, same work: only their start times move</text>
    </g>
  </svg>;
}

/* ── Prefix reuse ─────────────────────────────────────────────────────── */
const DOC = 8, QN = 1.5, RX = 270, RPX = 27;
function ReuseRow({ y, now, reuse, title, note }: { y: number; now: number; reuse: boolean; title: string; note: string }) {
  // three requests in series on one worker: [document][question] each, or document once then questions only
  const segs: { a: number; b: number; kind: "doc" | "q" | "ref"; r: number }[] = [];
  let at = 0;
  for (let r = 0; r < 3; r++) {
    if (!reuse || r === 0) { segs.push({ a: at, b: at + DOC, kind: "doc", r }); at += DOC; }
    else segs.push({ a: at, b: at, kind: "ref", r });
    segs.push({ a: at, b: at + QN, kind: "q", r }); at += QN;
  }
  return <g>
    <text x={0} y={y + 26} className="ma-k">{title}</text>
    <text x={0} y={y + 46} className="ma-l">{note}</text>
    {segs.map((s, i) => {
      if (s.kind === "ref") return now >= s.a && <g key={i}>
        <path d={`M${RX + (DOC / 2) * RPX} ${y + 4}C${RX + (DOC / 2) * RPX} ${y - 22} ${RX + s.a * RPX} ${y - 22} ${RX + s.a * RPX} ${y + 4}`} fill="none" stroke={C.c} strokeDasharray="4 3" strokeWidth={1.5} />
      </g>;
      const r = Math.min(s.b, now);
      if (r <= s.a) return null;
      return <rect key={i} x={RX + s.a * RPX + 1} y={y + 8} width={Math.max(0, (r - s.a) * RPX - 2)} height={36} rx={4} fill={s.kind === "doc" ? C.doc : C.q} opacity={0.88} />;
    })}
    {reuse && now >= DOC && <g transform={`translate(${RX} ${y + 58})`}>{Array.from({ length: 8 }, (_, i) => <rect key={i} x={i * 20} width={16} height={12} rx={2} fill={C.c} opacity={0.85} />)}<text x={172} y={11} className="ma-l" style={{ fill: C.c }}>the document&rsquo;s KV pages, kept</text></g>}
    {now >= at && (reuse
      ? <text x={RX + at * RPX + 16} y={y + 33} className="ma-n" style={{ fill: C.ink }}>1 document + 3 questions</text>
      : <text x={RX + at * RPX} y={y - 6} textAnchor="end" className="ma-n" style={{ fill: C.ink }}>3 documents + 3 questions</text>)}
  </g>;
}
function Reuse({ t }: SceneProps) {
  const now = sweep(t, REUSE_MS, 3 * (DOC + QN));
  return <svg viewBox="0 0 1100 400" role="img" aria-label="Three requests over the same document: without reuse each one reads the document again; with reuse the first one's KV pages are kept and the others read only their question">
    <ReuseRow y={50} now={now} reuse={false} title="Without reuse" note="every request reads the document" />
    <ReuseRow y={210} now={now} reuse title="With prefix reuse" note="read once, referenced after" />
    <g transform={`translate(${RX} 372)`}>
      <rect width={14} height={14} rx={2} fill={C.doc} /><text x={22} y={12} className="ma-l">reading the shared document (prefill)</text>
      <rect x={330} width={14} height={14} rx={2} fill={C.q} /><text x={352} y={12} className="ma-l">reading each question</text>
    </g>
  </svg>;
}

/* ── Faster prefill & decode (FP8) ─────────────────────────────────────
   Real proportions from the calibration: an 8,192-token prompt is read in one
   compute-bound pass; each output token is a memory-bound step. */
const IN = 8192, OUT = 32, FX = 270;
const RATE_ROWS = [false, true].map((fast) => {
  const pre = (STEP_OVERHEAD + prefillSeconds(IN, 0, fast)) * 1000;
  const dec = rateCard(fast).outputMs;
  return { fast, pre, dec, end: pre + OUT * dec, card: rateCard(fast) };
});
const FPX = (1060 - FX) / RATE_ROWS[0].end;
function RateRow({ y, now, r, title }: { y: number; now: number; r: (typeof RATE_ROWS)[number]; title: string }) {
  const pk = Math.min(1, now / r.pre);
  const cells = 64, cw = (r.pre * FPX - 12) / 16;
  return <g>
    <text x={0} y={y + 22} className="ma-k">{title}</text>
    <text x={0} y={y + 42} className="ma-l">{fmtMs(r.card.inputMs)} ms per input token</text>
    <text x={0} y={y + 60} className="ma-l">{fmtMs(r.dec)} ms per output token</text>
    <rect x={FX} y={y + 6} width={Math.max(0, Math.min(now, r.pre) * FPX - 2)} height={50} rx={4} fill={C.doc} opacity={0.22} />
    {Array.from({ length: cells }, (_, i) => <rect key={i} x={FX + 6 + (i % 16) * cw} y={y + 11 + Math.floor(i / 16) * 10.5} width={Math.max(1, cw - 2)} height={8} rx={1.5} fill={C.doc} opacity={0.15 + 0.8 * Math.min(1, Math.max(0, pk * cells - i))} />)}
    {Array.from({ length: OUT }, (_, i) => {
      const a = r.pre + i * r.dec, b = a + r.dec, k = prog(now, a, b);
      return k > 0 && <rect key={i} x={FX + a * FPX + 1} y={y + 6} width={Math.max(0, k * r.dec * FPX - 2)} height={50} rx={2} fill={C.b} opacity={0.88} />;
    })}
    {now >= r.end && <text x={FX + r.end * FPX} y={y - 6} textAnchor="end" className="ma-n" style={{ fill: C.ink }}>done in {fmt(r.end, 0)} ms</text>}
  </g>;
}
function Rates({ t }: SceneProps) {
  const now = sweep(t, RATES_MS, RATE_ROWS[0].end);
  return <svg viewBox="0 0 1100 400" role="img" aria-label="The same 8,192-token prompt and 32 output tokens with BF16 and with FP8 weights and KV on one H100">
    <RateRow y={50} now={now} r={RATE_ROWS[0]} title="BF16 weights and KV" />
    <RateRow y={200} now={now} r={RATE_ROWS[1]} title="FP8 weights and KV" />
    <g transform={`translate(${FX} 352)`}>
      <rect width={14} height={14} rx={2} fill={C.doc} /><text x={22} y={12} className="ma-l">8,192 input tokens, read in one pass (compute-bound)</text>
      <rect y={24} width={14} height={14} rx={2} fill={C.b} /><text x={22} y={36} className="ma-l">32 output tokens, one step each: every step re-reads the weights (memory-bound)</text>
    </g>
  </svg>;
}

/* ── Result figures, full width ───────────────────────────────────────── */

/** Continuous batching: every request's response time, ranked, before and after; and what sharing each step would do. */
function batchingFigure(w: Workload) {
  const [a, b] = [RUNS[w][0], RUNS[w][1]];
  const ranked = (r: LabRun) => r.tasks.map((x) => x.latency).sort((p, q) => p - q);
  const A = ranked(a), B = ranked(b), maxL = Math.max(A[95], B[95]);
  function Fig({ t }: SceneProps) {
    const k = ease.io(prog(t, 300, 3200));
    const L = 70, W = 600, top = 50, H = 270, sx = (i: number) => L + (i / 95) * W, sy = (v: number) => top + H - (v / maxL) * H;
    const n = Math.round(k * 95);
    const line = (arr: number[]) => arr.slice(0, n + 1).map((v, i) => `${i ? "L" : "M"}${sx(i)} ${sy(v)}`).join("");
    const p95 = Math.ceil(0.95 * 96) - 1;
    const bars: [string, number, string][] = [["one request per worker (this film)", BATCHING.serialPerCorrect, "#9cc5f5"], ["every running request in each step", BATCHING.batchedPerCorrect, C.b]];
    return <svg viewBox="0 0 1200 380" role="img" aria-label="Response time of all 96 requests ranked, before and after; and GPU-seconds per correct answer with iteration-level batching">
      <text x={L} y={24} className="ma-l">response time of each of the 96 requests, ranked (s)</text>
      <path d={`M${L} ${top + H}H${L + W}M${L} ${top}V${top + H}`} className="ma-axis" />
      {[0, 0.5, 1].map((f) => <text key={f} x={L - 8} y={sy(f * maxL) + 4} textAnchor="end" className="ma-l">{fmt(f * maxL, 0)}</text>)}
      <path d={line(A)} fill="none" stroke="#9cc5f5" strokeWidth={2.5} />
      <path d={line(B)} fill="none" stroke={C.b} strokeWidth={2.5} />
      {k >= 1 && <g>
        <path d={`M${sx(p95)} ${sy(A[p95])}V${sy(B[p95])}`} stroke="#c7a6ff" strokeWidth={2} strokeDasharray="4 3" />
        <text x={L + 20} y={top + 24} className="ma-n" style={{ fill: "#9cc5f5" }}>fixed pairs · p95 {fmt(A[p95], 0)} s</text>
        <text x={L + 20} y={top + 50} className="ma-n" style={{ fill: C.b }}>first free worker · p95 {fmt(B[p95], 0)} s</text>
      </g>}
      <text x={L + W / 2} y={top + H + 30} textAnchor="middle" className="ma-l">requests, fastest to slowest</text>
      <g transform="translate(760 40)">
        <text x={0} y={0} className="ma-k">Going further: share each step</text>
        <text x={0} y={22} className="ma-l">serving simulator, same cohort, GPU-s per correct answer</text>
        {bars.map(([l, v, c], i) => <g key={l} transform={`translate(0 ${60 + i * 92})`}>
          <text x={0} y={0} className="ma-l">{l}</text>
          <rect x={0} y={12} width={(v / BATCHING.serialPerCorrect) * 400 * k} height={30} rx={3} fill={c} opacity={0.88} />
          <text x={0} y={66} className="ma-n" style={{ fill: C.ink }}>{fmt(v, 2)}</text>
        </g>)}
        <text x={0} y={262} className="ma-l">one 8 GB weight read serves every running answer,</text>
        <text x={0} y={282} className="ma-l">and p95 falls to {fmt(BATCHING.batchedP95, 0)} s</text>
      </g>
    </svg>;
  }
  return Fig;
}

/** Prefix reuse: each request's prompt work, before and after, and where the GPU time actually goes. */
function reuseFigure(w: Workload) {
  const [a, b] = [RUNS[w][1], RUNS[w][2]];
  const maxP = Math.max(...a.tasks.map((x) => x.prefill));
  const share = (r: LabRun) => r.tasks.reduce((x, q) => x + q.prefill, 0) / r.gpuSeconds;
  function Fig({ t }: SceneProps) {
    const k = ease.io(prog(t, 300, 3000));
    const L = 140, W = 700, bw = W / 96;
    const lane = (r: LabRun, y: number, label: string, col: string) => <g>
      <text x={0} y={y - 24} className="ma-k">{label}</text>
      <path d={`M${L} ${y}H${L + W}`} className="ma-axis" />
      {r.tasks.slice(0, Math.round(k * 96)).map((q, i) => <rect key={i} x={L + i * bw + 0.5} y={y - (q.prefill / maxP) * 110} width={Math.max(1, bw - 1.5)} height={(q.prefill / maxP) * 110} fill={q.cacheHit ? C.c : col} opacity={0.88} />)}
    </g>;
    return <svg viewBox="0 0 1200 380" role="img" aria-label="Prompt-reading GPU time of each request, before and after reuse, and the share of all GPU time it represents">
      <text x={L} y={22} className="ma-l">prompt-reading time of each of the 96 requests (tallest = {fmt(maxP * 1000, 0)} ms)</text>
      {lane(a, 170, "Read every time", C.doc)}
      {lane(b, 340, "Read once, reuse", C.doc)}
      <text x={L + W + 8} y={336} className="ma-l" style={{ fill: C.c }}>cyan: cache hit</text>
      <g transform="translate(900 70)">
        <text x={0} y={0} className="ma-k">Where the GPU time goes</text>
        {[["before", share(a)], ["after", share(b)]].map(([l, v], i) => <g key={String(l)} transform={`translate(0 ${40 + i * 110})`}>
          <text x={0} y={0} className="ma-l">{l}</text>
          <rect x={0} y={12} width={260} height={28} rx={3} fill={C.b} opacity={0.35} />
          <rect x={0} y={12} width={Math.max(2, 260 * Number(v)) * k} height={28} rx={3} fill={C.doc} />
          <text x={0} y={62} className="ma-l" style={{ fill: C.ink }}>reading prompts {(100 * Number(v)).toFixed(1)}% · answering {(100 - 100 * Number(v)).toFixed(1)}%</text>
        </g>)}
      </g>
    </svg>;
  }
  return Fig;
}

/** FP8: what one decode step reads, in bytes and in milliseconds, and the whole ladder. */
function Bytes({ t }: SceneProps) {
  const k = ease.io(prog(t, 300, 3000));
  const ctx = 10_000;
  const rows = [false, true].map((fast) => ({ fast, weights: weightBytes(fast), kv: ctx * kvBytesPerToken(fast), ms: rateCard(fast).outputMs }));
  const maxB = rows[0].weights + rows[0].kv, W = 520, gb = (v: number) => (v / 1e9).toFixed(2);
  const runs = RUNS["shared-prefix"], names = ["paired baseline", "+ first free worker", "+ prefix reuse", "+ FP8 weights and KV"], max = runs[0].correctCost!;
  return <svg viewBox="0 0 1200 380" role="img" aria-label="Bytes read by one decode step in BF16 and FP8, and GPU-seconds per correct answer after each technique">
    <text x={0} y={22} className="ma-l">one decode step at a 10k-token context reads the weights and the request&rsquo;s KV cache</text>
    {rows.map((r, i) => <g key={String(r.fast)} transform={`translate(0 ${60 + i * 120})`}>
      <text x={0} y={18} className="ma-k">{r.fast ? "FP8" : "BF16"}</text>
      <rect x={90} y={0} width={(r.weights / maxB) * W * k} height={30} rx={3} fill={r.fast ? C.b : "#9cc5f5"} opacity={0.9} />
      <rect x={90 + (r.weights / maxB) * W * k} y={0} width={(r.kv / maxB) * W * k} height={30} rx={3} fill={C.c} opacity={0.75} />
      <text x={90} y={52} className="ma-l">weights {gb(r.weights)} GB + KV {gb(r.kv)} GB</text>
      <text x={90 + W} y={52} textAnchor="end" className="ma-n" style={{ fill: C.ink }}>{fmtMs(r.ms)} ms a token</text>
    </g>)}
    <g transform="translate(700 40)">
      <text x={0} y={0} className="ma-l">GPU-s per correct answer, one shared document</text>
      {names.map((n, i) => <g key={n} transform={`translate(0 ${30 + i * 70})`}>
        <text x={0} y={0} className="ma-l">{n}</text>
        <rect x={0} y={10} width={(runs[i].correctCost! / max) * 380 * k} height={24} rx={3} fill={i === 3 ? C.b : "#9cc5f5"} opacity={0.85} />
        <text x={480} y={28} textAnchor="end" className="ma-n" style={{ fill: C.ink }}>{fmt(runs[i].correctCost!, 2)}</text>
      </g>)}
    </g>
  </svg>;
}

const BATCH_MS = 11500, REUSE_MS = 11000, RATES_MS = 10500;

export type FilmArc = { name: string; mechanism: ArcBeat; impact: (workload: Workload) => ArcBeat };
/** Keyed by the film chapter each technique belongs to. */
export const FILM_ARCS: Record<number, FilmArc> = {
  1: {
    name: "Continuous batching",
    mechanism: { label: "How it works", title: "Continuous batching, first step: a free worker takes the next request at once", ms: BATCH_MS, Scene: Batching },
    impact: (w) => {
      const [a, b] = [RUNS[w][0], RUNS[w][1]];
      return { label: "Impact", title: "Less waiting, the same GPU work", ms: 8500, Scene: makeImpact({
        from: a.p95, to: b.p95, unit: "s", digits: w === "interactive" ? 1 : 0, what: "p95 response time across the 96 requests",
        cause: `Requests no longer wait for a partner to finish; each still runs alone on its H100, so the GPU work is unchanged at ${fmt(b.gpuSeconds)} GPU-s. Sharing each step across requests is what cuts the work (below).`,
        base: "Fixed pairs", optimized: "First free worker",
        Figure: batchingFigure(w),
      }) };
    },
  },
  2: {
    name: "Prefix reuse",
    mechanism: { label: "How it works", title: "Prefix reuse: read a shared document once, keep its KV pages, reference them after", ms: REUSE_MS, Scene: Reuse },
    impact: (w) => {
      const [a, b] = [RUNS[w][1], RUNS[w][2]];
      const pre = (r: LabRun) => r.tasks.reduce((x, t) => x + t.prefill, 0);
      const share = (100 * (pre(a) - pre(b))) / a.gpuSeconds;
      return { label: "Impact", title: w === "interactive" ? "Nothing shared, nothing to reuse" : "Prompt reading nearly gone; answers still cost what they cost", ms: 8500, Scene: makeImpact({
        from: pre(a), to: pre(b), unit: "GPU-s of prompt reading", digits: 1, what: "Prefill work for the 96 requests",
        cause: w === "interactive" ? "Every request brings a different document, so no prefix is ready to reuse; the work is unchanged." : `The shared document is prefilled once per group; later requests reference its KV pages and read only their 384-token question. That is ${share.toFixed(1)}% of all GPU time here: the ~5,600-token answers dominate. Reuse pays most when prompts are long and answers short.`,
        base: "Read every time", optimized: "Read once, reuse",
        Figure: reuseFigure(w),
      }) };
    },
  },
  3: {
    name: "Faster prefill & decode",
    mechanism: { label: "How it works", title: "FP8 weights and KV: every decode step moves half the bytes", ms: RATES_MS, Scene: Rates },
    impact: (w) => {
      const [a, b] = [RUNS[w][2], RUNS[w][3]];
      return { label: "Impact", title: "The same answers, cheaper per answer", ms: 8500, Scene: makeImpact({
        from: a.correctCost!, to: b.correctCost!, unit: "GPU-s per correct answer", digits: 2, what: "Cost of each correct answer",
        cause: `Decode reads the weights every step: 8.04 GB in BF16, 4.02 GB in FP8, so an output token falls from ${fmtMs(rateCard(false).outputMs)} to ${fmtMs(rateCard(true).outputMs)} ms on one H100. Same tokens, same answers.`,
        base: "BF16", optimized: "FP8 weights and KV",
        Figure: Bytes,
      }) };
    },
  },
};
