import type { LabRun } from "./lab-simulation";
import { clamp01, decodeAt, windowProgress } from "./inference-film-math";
import { idleWithWaiting, schedulingAt } from "./scheduling-study-math";

export const BASELINE_DURATION = 28000;
export const BASELINE_MOMENTS = [0, 7800, 15000, 21500, 25000] as const;

/** The opening inspects existing events; it never generates a second workload. */
export function baselineStudy(run: LabRun) {
  if (
    run.tasks.length < 8 ||
    run.mechanisms.scheduler !== "barrier" ||
    run.mechanisms.reuse ||
    run.mechanisms.fastKernels
  )
    throw new Error("The opening requires the unchanged paired-batch baseline");
  const tasks = run.tasks.slice(0, 8),
    request = tasks[6];
  const gaps = idleWithWaiting(tasks);
  const gap = gaps.find(
    (g) =>
      g.start >= request.arrival && Math.abs(g.finish - request.start) < 1e-8,
  );
  if (!gap)
    throw new Error("Missing arrived-work idle interval before request 7");
  return {
    tasks,
    request,
    gaps,
    gap,
    shared: run.workload === "shared-prefix",
    cohortSize: run.n,
  };
}

export function baselineFrame(
  ms: number,
  study: ReturnType<typeof baselineStudy>,
) {
  const { request: q, gap } = study;
  const hold = (gap.start + gap.finish) / 2;
  const time =
    ms < 4000
      ? q.arrival * windowProgress(ms, 600, 4000)
      : ms < 7000
        ? q.arrival + (hold - q.arrival) * windowProgress(ms, 4000, 7000)
        : ms < 10000
          ? hold
          : ms < 11000
            ? hold + (q.start - hold) * windowProgress(ms, 10000, 11000)
            : ms < 14000
              ? q.start + q.prefill * windowProgress(ms, 11000, 14000)
              : ms < 17000
                ? q.start + q.prefill
                : ms < 21000
                  ? q.start +
                    q.prefill +
                    q.decode * windowProgress(ms, 17000, 21000)
                  : q.finish;
  const beat =
    ms < 5500 ? 0 : ms < 11000 ? 1 : ms < 17000 ? 2 : ms < 24000 ? 3 : 4;
  const wait = Math.max(0, Math.min(q.queueSeconds, time - q.arrival));
  const prefill = q.prefill * clamp01((time - q.start) / q.prefill);
  const decode = q.decode * clamp01((time - q.start - q.prefill) / q.decode);
  return {
    time,
    beat,
    wait,
    prefill,
    decode,
    tokens: time >= q.finish ? q.tokens : decodeAt(q, time - q.start),
    state: schedulingAt(study.tasks, time),
    elapsed: wait + prefill + decode,
    busy: prefill + decode,
  };
}
