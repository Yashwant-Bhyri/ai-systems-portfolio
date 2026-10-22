import type { LabRun } from "./lab-simulation";

export const RUNTIME_GAINS_DURATION = 38000;
export const RUNTIME_GAINS_MOMENTS = [
  0, 7500, 14500, 21500, 28000, 35500,
] as const;
export const RUNTIME_GAINS_LABELS = [
  "Baseline costs",
  "Worker scheduling",
  "KV prefix reuse",
  "Execution rates",
  "All 96 requests",
  "Combined reduction",
] as const;
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (v: number) => {
  const t = clamp(v);
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const close = (a: number, b: number) => Math.abs(a - b) < 1e-7;

/** Ordered counterfactuals, never independent savings added across incompatible runs. */
export function runtimeGainsStudy(runs: readonly LabRun[]) {
  if (runs.length < 4)
    throw new Error("Runtime gains require four ordered runs");
  const selected = runs.slice(0, 4);
  const base = selected[0];
  const tuples = [
    ["barrier", false, false],
    ["continuous", false, false],
    ["continuous", true, false],
    ["continuous", true, true],
  ];
  for (const [i, run] of selected.entries()) {
    const m = run.mechanisms;
    if (
      m.scheduler !== tuples[i][0] ||
      m.reuse !== tuples[i][1] ||
      m.fastKernels !== tuples[i][2]
    )
      throw new Error("Unexpected runtime intervention order");
    if (
      run.n !== base.n ||
      run.policy !== base.policy ||
      run.budget !== base.budget ||
      run.workload !== base.workload ||
      run.correct !== base.correct ||
      !run.correct ||
      run.tasks.length !== base.tasks.length
    )
      throw new Error(
        "Runtime comparison must preserve the cognition contract",
      );
    run.tasks.forEach((task, j) => {
      const original = base.tasks[j];
      if (
        task.id !== original.id ||
        task.tokens !== original.tokens ||
        task.correct !== original.correct ||
        task.arrival !== original.arrival ||
        task.inputTokens !== original.inputTokens
      )
        throw new Error(
          "Runtime comparison changed task identity or cognition",
        );
    });
  }
  const requests = selected.map((run) => run.tasks.find((t) => t.id === 6));
  if (requests.some((q) => !q))
    throw new Error("Request 7 is required for narrative continuity");
  const q = requests.map((task) => task!);
  const cohort = selected.map((run) => ({
    prefill: run.tasks.reduce((sum, t) => sum + t.prefill, 0) / run.correct,
    decode: run.tasks.reduce((sum, t) => sum + t.decode, 0) / run.correct,
    total: run.gpuSeconds / run.correct,
  }));
  if (!close(cohort[0].total, cohort[1].total))
    throw new Error("Scheduling must not remove GPU work");
  if (!close(cohort[1].decode, cohort[2].decode))
    throw new Error("Prefix reuse must preserve decode work");
  if (
    selected[2].tasks.some(
      (t, i) => t.cacheHit !== selected[3].tasks[i].cacheHit,
    )
  )
    throw new Error("Execution comparison changed cache outcomes");
  const savings = [
    0,
    0,
    cohort[1].total - cohort[2].total,
    cohort[2].total - cohort[3].total,
  ];
  return {
    runs: selected,
    requests: q,
    cohort,
    savings,
    n: base.n,
    correct: base.correct,
    requestWaitSaved: q[0].queueSeconds - q[1].queueSeconds,
    requestReuseSaved: q[1].gpuSeconds - q[2].gpuSeconds,
    requestExecutionSaved: q[2].gpuSeconds - q[3].gpuSeconds,
    totalSaved: cohort[0].total - cohort[3].total,
    percentSaved: (1 - cohort[3].total / cohort[0].total) * 100,
    hits: selected[2].tasks.filter((t) => t.cacheHit).length,
  };
}
export type RuntimeGainsStudy = ReturnType<typeof runtimeGainsStudy>;

/** One film cursor controls morphing geometry, focus, readouts and settled holds. */
export function runtimeGainsFrame(ms: number, study: RuntimeGainsStudy) {
  const time = Math.min(RUNTIME_GAINS_DURATION, Math.max(0, ms));
  const beat =
    time < 4000
      ? 0
      : time < 11000
        ? 1
        : time < 18000
          ? 2
          : time < 25000
            ? 3
            : time < 30000
              ? 4
              : 5;
  const progress = [
    1,
    ease((time - 4000) / 3000),
    ease((time - 11000) / 3000),
    ease((time - 18000) / 3000),
  ];
  const rows = study.requests.map((q, i) => {
    const previous = study.requests[Math.max(0, i - 1)];
    const t = progress[i];
    const queue = mix(previous.queueSeconds, q.queueSeconds, t);
    const prefill = mix(previous.prefill, q.prefill, t);
    const decode = mix(previous.decode, q.decode, t);
    return {
      queue,
      prefill,
      decode,
      work: prefill + decode,
      visible: i === 0 || time >= [0, 4000, 11000, 18000][i],
    };
  });
  return {
    time,
    beat,
    rows,
    progress,
    cohortMix: ease((time - 25000) / 2000),
    combined: ease((time - 30000) / 3500),
  };
}
