import type { LabRun, LabTask } from "./lab-simulation";

export type RequestMeasure = "service" | "prefill" | "decode" | "latency";
export const REQUEST_FILM_MS = 20000;

export function matchedRequestComparison(
  baseline: LabRun,
  optimized: LabRun,
  taskId: number,
) {
  if (
    baseline.policy !== optimized.policy ||
    baseline.budget !== optimized.budget ||
    baseline.workload !== optimized.workload ||
    baseline.n !== optimized.n ||
    baseline.mechanisms.scheduler !== optimized.mechanisms.scheduler
  )
    throw new RangeError(
      "Request comparison needs a matched policy, workload, allowance and scheduling rule",
    );
  const before = baseline.tasks.find((task) => task.id === taskId);
  const after = optimized.tasks.find((task) => task.id === taskId);
  if (
    !before ||
    !after ||
    before.tokens !== after.tokens ||
    before.inputTokens !== after.inputTokens ||
    before.arrival !== after.arrival ||
    before.correct !== after.correct
  )
    throw new RangeError(
      "Request comparison needs the same request, logical input, output and outcome",
    );
  return {
    before,
    after,
    prefill: before.prefill - after.prefill,
    decode: before.decode - after.decode,
    queue: before.queueSeconds - after.queueSeconds,
    service: before.gpuSeconds - after.gpuSeconds,
    latency: before.latency - after.latency,
    avoidedInput: before.computedInputTokens - after.computedInputTokens,
  };
}

export function requestMeasure(task: LabTask, metric: RequestMeasure) {
  return metric === "service" ? task.gpuSeconds : task[metric];
}

/** Each lens has its own zero and duration; a prefill replay does not run decode. */
export function requestMeasureParts(task: LabTask, metric: RequestMeasure) {
  if (metric === "prefill" || metric === "decode")
    return [{ key: metric, start: 0, length: task[metric] }];
  const wait = metric === "latency" ? task.queueSeconds : 0;
  return [
    { key: "queue", start: 0, length: wait },
    { key: "prefill", start: wait, length: task.prefill },
    { key: "decode", start: wait + task.prefill, length: task.decode },
  ].filter((part) => part.length > 0);
}

export function requestMeasureUnits(
  task: LabTask,
  metric: RequestMeasure,
  cursor: number,
) {
  const total = metric === "prefill" ? task.computedInputTokens : task.tokens;
  const count =
    metric === "prefill" || metric === "decode"
      ? Math.min(
          total,
          Math.max(0, Math.floor((total * (cursor + 1e-9)) / task[metric])),
        )
      : requestTokensAt(task, cursor, metric === "latency");
  return { count, total };
}

/** Model time advances, holds at first completion, then exposes the residual interval. */
export function requestComparisonFrame(
  filmMs: number,
  before: number,
  after: number,
) {
  const time = Math.max(0, Math.min(REQUEST_FILM_MS, filmMs));
  const first = Math.min(before, after),
    last = Math.max(before, after);
  const cursor =
    time <= 1500
      ? 0
      : time < 8500
        ? (first * (time - 1500)) / 7000
        : time < 12000
          ? first
          : time < 16000
            ? first + ((last - first) * (time - 12000)) / 4000
            : last;
  return {
    cursor,
    focus:
      time < 8500
        ? "both"
        : time < 12000
          ? "first"
          : time < 16000
            ? "remaining"
            : "delta",
  } as const;
}

export function requestTokensAt(
  task: LabTask,
  elapsed: number,
  includeQueue: boolean,
) {
  const start = (includeQueue ? task.queueSeconds : 0) + task.prefill;
  if (elapsed >= start + task.decode - 1e-9) return task.tokens;
  return Math.max(
    0,
    Math.min(
      task.tokens,
      Math.floor(((elapsed - start) / task.decode) * task.tokens),
    ),
  );
}
