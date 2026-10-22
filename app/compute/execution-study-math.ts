import type { LabRun, LabTask } from "./lab-simulation";
import { clamp01, decodeAt, windowProgress } from "./inference-film-math";

/** Representative machine activity uses the same service cursor as the ledger. */
export function machineState(task: LabTask, time: number) {
  const elapsed = Math.max(0, Math.min(time, task.gpuSeconds));
  const done = time >= task.gpuSeconds;
  const tokens = done ? task.tokens : decodeAt(task, elapsed);
  const fraction = tokens / task.tokens;
  return {
    elapsed,
    tokens,
    fraction,
    done,
    active: time > 0 && !done,
    prefill: time < task.prefill,
    cycle: fraction * 32,
  };
}

/** Exact integer teaching example; these are not model parameters. */
export const TILE_WEIGHTS = [
  [1, 2, -1, 0],
  [0, -1, 2, 1],
  [2, 0, 1, -1],
  [-1, 1, 0, 2],
] as const;
export const TILE_INPUT = [2, 1, 3, -1] as const;
export function tileProjection(row: number, terms: number) {
  if (
    !Number.isInteger(row) ||
    row < 0 ||
    row > 3 ||
    !Number.isInteger(terms) ||
    terms < 0 ||
    terms > 4
  )
    throw new RangeError("Select an output row and 0–4 accumulated terms");
  const products = TILE_WEIGHTS[row].map((w, j) => w * TILE_INPUT[j]);
  return {
    products,
    partial: products.slice(0, terms).reduce((a, b) => a + b, 0),
    output: TILE_WEIGHTS.map((weights) =>
      weights.reduce<number>((sum, w, j) => sum + w * TILE_INPUT[j], 0),
    ),
  };
}

export const EXECUTION_DURATION = 42000;
export const EXECUTION_MOMENTS = [0, 8200, 14500, 24000, 33000, 40000] as const;
export const LOAD_LEVELS = [
  0.4, 0.55, 0.7, 0.85, 1, 1.1, 1.2, 1.35, 1.5,
] as const;

/** This study isolates token rates. It must not quietly count a cache change. */
export function matchedExecution(before: LabRun, after: LabRun) {
  if (
    before.policy !== after.policy ||
    before.budget !== after.budget ||
    before.workload !== after.workload ||
    before.tasks.length !== after.tasks.length ||
    !before.tasks.length
  )
    throw new Error("Execution comparison requires paired tasks");
  before.tasks.forEach((task, i) => {
    const other = after.tasks[i];
    if (
      task.id !== other.id ||
      task.tokens !== other.tokens ||
      task.correct !== other.correct ||
      task.computedInputTokens !== other.computedInputTokens ||
      task.inputTokens !== other.inputTokens ||
      task.cacheHit !== other.cacheHit
    )
      throw new Error(
        "Execution comparison changed the cognition or cache state",
      );
  });
  const reference = before.tasks.find((t) => t.cacheHit) ?? before.tasks[0];
  return { reference, optimized: after.tasks[before.tasks.indexOf(reference)] };
}

/** Piecewise direction slows the residual interval without changing event order. */
export function executionFrame(
  ms: number,
  reference: LabTask,
  optimized: LabTask,
) {
  const time =
    ms < 6000
      ? optimized.gpuSeconds * windowProgress(ms, 1200, 6000)
      : optimized.gpuSeconds +
        (reference.gpuSeconds - optimized.gpuSeconds) *
          windowProgress(ms, 6000, 9300);
  const beat =
    ms < 6000
      ? 0
      : ms < 11000
        ? 1
        : ms < 20000
          ? 2
          : ms < 26000
            ? 3
            : ms < 38000
              ? 4
              : 5;
  const count = Math.round(1 + 999 * windowProgress(ms, 20800, 25000));
  const loadIndex = Math.min(
    LOAD_LEVELS.length - 1,
    Math.floor(windowProgress(ms, 19200, 24200) * LOAD_LEVELS.length),
  );
  return {
    time,
    beat,
    count,
    loadIndex,
    referenceDone: time >= reference.gpuSeconds,
    optimizedDone: time >= optimized.gpuSeconds,
    tail: clamp01(
      (time - optimized.gpuSeconds) /
        Math.max(1e-9, reference.gpuSeconds - optimized.gpuSeconds),
    ),
  };
}

export function repeatedWork(
  reference: LabTask,
  optimized: LabTask,
  count: number,
) {
  if (!Number.isInteger(count) || count < 1 || count > 1000)
    throw new RangeError("Repeat count must be 1–1,000");
  const a = reference.gpuSeconds * count,
    b = optimized.gpuSeconds * count;
  return { count, reference: a, optimized: b, saved: a - b };
}

/** Fixed-service FIFO sensitivity replay. Cache outcomes are pinned, not resimulated. */
export function replayServiceProfiles(
  tasks: readonly LabTask[],
  arrivalRate: number,
  count = 1000,
  workers = 2,
) {
  if (
    !tasks.length ||
    !Number.isFinite(arrivalRate) ||
    arrivalRate <= 0 ||
    !Number.isInteger(count) ||
    count < 1 ||
    count > 10000 ||
    !Number.isInteger(workers) ||
    workers < 1 ||
    workers > 64
  )
    throw new RangeError("Invalid service replay parameters");
  const available = Array<number>(workers).fill(0);
  const requests = Array.from({ length: count }, (_, id) => {
    const profile = tasks[id % tasks.length];
    const arrival = id / arrivalRate;
    const worker = available.indexOf(Math.min(...available));
    const start = Math.max(arrival, available[worker]);
    const finish = start + profile.gpuSeconds;
    available[worker] = finish;
    return {
      id,
      profile: profile.id,
      worker,
      arrival,
      start,
      finish,
      service: profile.gpuSeconds,
      wait: start - arrival,
      latency: finish - arrival,
    };
  });
  const quantile = (key: "latency" | "wait") =>
    requests.map((r) => r[key]).sort((a, b) => a - b)[
      Math.ceil(count * 0.95) - 1
    ];
  return {
    arrivalRate,
    workers,
    count,
    p95: quantile("latency"),
    p95Wait: quantile("wait"),
    busy: requests.reduce((sum, r) => sum + r.service, 0),
    requests,
  };
}

export function executionLoadSweep(before: LabRun, after: LabRun) {
  matchedExecution(before, after);
  const capacity = 2 / before.meanCost;
  const optimizedCapacity = 2 / after.meanCost;
  return {
    capacity,
    optimizedCapacity,
    points: LOAD_LEVELS.map((load) => ({
      load,
      rate: load * capacity,
      reference: replayServiceProfiles(before.tasks, load * capacity),
      optimized: replayServiceProfiles(after.tasks, load * capacity),
    })),
  };
}

/** Simultaneous demand, fixed service profiles, FIFO serial workers. Not GPU batching. */
export function replayBurst(
  tasks: readonly Pick<LabTask, "id" | "gpuSeconds">[],
  count = 1000,
  workers = 2,
) {
  if (
    !tasks.length ||
    tasks.some(
      (task) => !Number.isFinite(task.gpuSeconds) || task.gpuSeconds <= 0,
    ) ||
    !Number.isInteger(count) ||
    count < 1 ||
    count > 10000 ||
    !Number.isInteger(workers) ||
    workers < 1 ||
    workers > 64
  )
    throw new RangeError("Invalid burst replay parameters");
  const available = Array<number>(workers).fill(0);
  const requests = Array.from({ length: count }, (_, id) => {
    const profile = tasks[id % tasks.length];
    const worker = available.indexOf(Math.min(...available));
    const start = available[worker];
    const finish = start + profile.gpuSeconds;
    available[worker] = finish;
    return {
      id,
      profile: profile.id,
      worker,
      start,
      finish,
      service: profile.gpuSeconds,
    };
  });
  return {
    requests,
    workers,
    count,
    finish: Math.max(...available),
    busy: requests.reduce((sum, r) => sum + r.service, 0),
  };
}

export function burstAt(replay: ReturnType<typeof replayBurst>, time: number) {
  if (!Number.isFinite(time) || time < 0)
    throw new RangeError("Burst time must be finite and nonnegative");
  const completed = replay.requests.filter((r) => r.finish <= time).length;
  const active = replay.requests.filter(
    (r) => r.start <= time && r.finish > time,
  );
  return {
    time,
    completed,
    active,
    queued: replay.count - completed - active.length,
  };
}

export function executionBurst(before: LabRun, after: LabRun) {
  matchedExecution(before, after);
  return {
    reference: replayBurst(before.tasks),
    optimized: replayBurst(after.tasks),
    horizon: 300,
  };
}

/** A request-order waterfall: one serial worker in each paired lane. */
export function executionWaterfall(before: LabRun, after: LabRun) {
  const { reference } = matchedExecution(before, after);
  const start = before.tasks.indexOf(reference);
  const ordered = (run: LabRun) =>
    Array.from(
      { length: Math.min(12, run.tasks.length) },
      (_, i) => run.tasks[(start + i) % run.tasks.length],
    );
  const baseline = replayBurst(
    ordered(before),
    Math.min(12, before.tasks.length),
    1,
  );
  const optimized = replayBurst(
    ordered(after),
    Math.min(12, after.tasks.length),
    1,
  );
  return { baseline, optimized };
}

export function waterfallFrame(
  ms: number,
  trace: ReturnType<typeof executionWaterfall>,
  firstTime: number,
) {
  const three =
    trace.baseline.requests[Math.min(2, trace.baseline.count - 1)].finish;
  const zoom = windowProgress(ms, 13500, 18000);
  const ease = 1 - Math.pow(1 - zoom, 3);
  const time =
    ms < 11000
      ? firstTime
      : ms < 13500
        ? trace.baseline.requests[0].finish +
          (three - trace.baseline.requests[0].finish) *
            windowProgress(ms, 11000, 13500)
        : three + (trace.baseline.finish - three) * zoom;
  const firstRows = Math.min(3, trace.baseline.count);
  return {
    time,
    horizon: three + (trace.baseline.finish - three) * ease,
    rows: firstRows + (trace.baseline.count - firstRows) * ease,
    zoom,
  };
}

/** Do not narrate a request before both of its bars fit the visible camera. */
export function waterfallSelection(
  trace: ReturnType<typeof executionWaterfall>,
  frame: ReturnType<typeof waterfallFrame>,
) {
  const visible = trace.baseline.requests.findLastIndex(
    (request, index) =>
      frame.rows - index > 0.9 && request.finish <= frame.horizon + 1e-8,
  );
  const completed = trace.optimized.requests.filter(
    (r) => r.finish <= frame.time,
  ).length;
  return Math.max(0, Math.min(visible, completed - 1));
}

/** Declared varied token workload. Hashes choose task lengths, never add noise to chart values. */
export function executionDemand(before: LabRun, after: LabRun) {
  matchedExecution(before, after);
  const hash = (n: number) => {
    let x = n | 0;
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
  };
  const specifications = Array.from({ length: 1000 }, (_, id) => {
    const inputTokens = 1024 + Math.floor(hash(id + 1907) * 15361);
    const tokens = 96 + Math.floor(Math.pow(hash(id + 8141), 1.6) * 6049);
    const cacheHit =
      before.workload === "shared-prefix" && hash(id + 3149) < 0.8;
    const computedInputTokens = cacheHit
      ? Math.min(inputTokens - 128, 128 + Math.floor(hash(id + 9763) * 1409))
      : inputTokens;
    return { id, inputTokens, computedInputTokens, tokens, cacheHit };
  });
  const make = (run: LabRun) =>
    specifications.map((spec) => {
      const sample = run.tasks[0];
      const prefill =
        (spec.computedInputTokens * sample.prefill) /
        sample.computedInputTokens;
      const decode = (spec.tokens * sample.decode) / sample.tokens;
      return { ...spec, prefill, decode, gpuSeconds: prefill + decode };
    });
  const baselineProfiles = make(before),
    optimizedProfiles = make(after);
  return {
    seed: "token-mix-v1:1907/8141/3149/9763",
    specifications,
    baselineProfiles,
    optimizedProfiles,
    reference: replayBurst(baselineProfiles),
    optimized: replayBurst(optimizedProfiles),
  };
}

/** Fixed aggregate work allowance in FIFO order, independent of a wall-clock deadline. */
export function budgetCapacity(
  demand: ReturnType<typeof executionDemand>,
  allowance: number,
) {
  if (!Number.isFinite(allowance) || allowance < 0)
    throw new RangeError("Allowance must be finite and nonnegative");
  const fit = (tasks: readonly Pick<LabTask, "gpuSeconds">[]) => {
    let completed = 0,
      used = 0;
    for (const task of tasks) {
      if (used + task.gpuSeconds > allowance + 1e-9) break;
      used += task.gpuSeconds;
      completed++;
    }
    return { completed, used, remaining: Math.max(0, allowance - used) };
  };
  const baseline = fit(demand.baselineProfiles),
    optimized = fit(demand.optimizedProfiles);
  return {
    allowance,
    baseline,
    optimized,
    extra: optimized.completed - baseline.completed,
  };
}

export function demandTime(
  ms: number,
  demand: ReturnType<typeof executionDemand>,
) {
  const first = Math.min(300, demand.optimized.finish);
  if (ms >= 37000)
    return (
      demand.optimized.finish +
      windowProgress(ms, 37000, 37700) *
        (demand.reference.finish - demand.optimized.finish)
    );
  return ms < 30000
    ? windowProgress(ms, 27200, 30000) * first
    : first +
        windowProgress(ms, 30000, 35700) * (demand.optimized.finish - first);
}

/** Inverse of the authored service clock. Scrubbing never creates a second trace. */
export function demandSeek(
  time: number,
  demand: ReturnType<typeof executionDemand>,
) {
  const target = Math.max(0, Math.min(demand.reference.finish, time));
  const first = Math.min(300, demand.optimized.finish);
  if (target <= first) return 27200 + (target / first) * 2800;
  if (target <= demand.optimized.finish)
    return (
      30000 + ((target - first) / (demand.optimized.finish - first)) * 5700
    );
  return (
    37000 +
    ((target - demand.optimized.finish) /
      (demand.reference.finish - demand.optimized.finish)) *
      700
  );
}
