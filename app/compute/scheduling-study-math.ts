import type { LabRun, LabTask } from "./lab-simulation";
import { windowProgress } from "./inference-film-math";

export const SCHEDULING_DURATION = 35000;
export const SCHEDULING_MOMENTS = [0, 8500, 19000, 31500] as const;

/** Count only idle workers for whom an arrived request is still waiting.
 * No-demand idle time and post-completion time are intentionally excluded. */
export function idleWithWaiting(tasks: LabTask[]) {
  const events = [
    ...new Set([0, ...tasks.flatMap((t) => [t.arrival, t.start, t.finish])]),
  ].sort((a, b) => a - b);
  return [0, 1].flatMap((worker) => {
    const gaps: { worker: number; start: number; finish: number }[] = [];
    for (let i = 1; i < events.length; i++) {
      const start = events[i - 1],
        finish = events[i],
        midpoint = (start + finish) / 2;
      if (!tasks.some((t) => t.arrival <= midpoint && t.start > midpoint))
        continue;
      if (
        tasks.some(
          (t) =>
            t.worker === worker && t.start <= midpoint && t.finish > midpoint,
        )
      )
        continue;
      const previous = gaps.at(-1);
      if (previous?.finish === start) previous.finish = finish;
      else gaps.push({ worker, start, finish });
    }
    return gaps;
  });
}

export function idleAt(gaps: ReturnType<typeof idleWithWaiting>, time: number) {
  return gaps.reduce(
    (sum, g) => sum + Math.max(0, Math.min(time, g.finish) - g.start),
    0,
  );
}

/** Scheduling may move starts and workers, never shorten the work or change arrivals. */
export function schedulingStudy(before: LabRun, after: LabRun) {
  if (
    before.mechanisms.scheduler !== "barrier" ||
    after.mechanisms.scheduler !== "continuous" ||
    before.policy !== after.policy ||
    before.budget !== after.budget ||
    before.workload !== after.workload ||
    before.tasks.length !== after.tasks.length ||
    before.tasks.length < 6
  )
    throw new Error(
      "Scheduling requires a paired barrier / independent comparison",
    );
  before.tasks.forEach((task, i) => {
    const other = after.tasks[i];
    if (
      [
        "id",
        "arrival",
        "tokens",
        "inputTokens",
        "computedInputTokens",
        "prefill",
        "decode",
        "gpuSeconds",
        "correct",
        "cacheHit",
      ].some(
        (key) => task[key as keyof LabTask] !== other[key as keyof LabTask],
      )
    )
      throw new Error("Scheduling changed task work or arrival identity");
  });
  const baseline = before.tasks.slice(0, 6),
    optimized = after.tasks.slice(0, 6);
  const horizon = Math.max(
    ...baseline.map((t) => t.finish),
    ...optimized.map((t) => t.finish),
  );
  const gaps = idleWithWaiting(baseline),
    optimizedGaps = idleWithWaiting(optimized);
  return {
    baseline,
    optimized,
    gaps,
    optimizedGaps,
    horizon,
    work: baseline.reduce((sum, t) => sum + t.gpuSeconds, 0),
  };
}

export function schedulingFrame(
  ms: number,
  study: ReturnType<typeof schedulingStudy>,
) {
  const admission = study.optimized[2].start;
  const comparison = (study.optimized[2].start + study.baseline[2].start) / 2;
  const later = study.optimized[4].finish;
  const time =
    ms < 5500
      ? admission * windowProgress(ms, 700, 5500)
      : ms < 7000
        ? admission + (comparison - admission) * windowProgress(ms, 5500, 7000)
        : ms < 10500
          ? comparison
          : ms < 18000
            ? comparison +
              (later - comparison) * windowProgress(ms, 10500, 18000)
            : ms < 20700
              ? later
              : later +
                (study.horizon - later) * windowProgress(ms, 20700, 23500);
  return {
    time,
    beat: ms < 5500 ? 0 : ms < 13000 ? 1 : ms < 22000 ? 2 : 3,
    selected: ms < 13000 ? 2 : 4,
    focus:
      ms < 23500
        ? "both"
        : ms < 27000
          ? "baseline"
          : ms < 30500
            ? "optimized"
            : "difference",
  };
}

export function schedulingAt(tasks: LabTask[], time: number) {
  const done = tasks.filter((t) => t.finish <= time);
  const active = tasks.filter((t) => t.start <= time && t.finish > time);
  const waiting = tasks.filter((t) => t.arrival <= time && t.start > time);
  const future = tasks.filter((t) => t.arrival > time);
  const work = tasks.reduce(
    (sum, t) => sum + Math.max(0, Math.min(t.gpuSeconds, time - t.start)),
    0,
  );
  return { done, active, waiting, future, work };
}
