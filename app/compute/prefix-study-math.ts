import { TASKS, type LabRun } from "./lab-simulation";

export const PREFIX_DURATION = 34000;
export const PREFIX_MOMENTS = [0, 7400, 12800, 16600, 21800, 29400] as const;
export const PREFIX_HANDOFF = [16000, 16600] as const;
const unit = (x: number) => Math.max(0, Math.min(1, x));
const ramp = (t: number, a: number, b: number) => unit((t - a) / (b - a));

/** Derive the close-up from the existing cohort, never from a second result fixture. */
export function prefixStudy(before: LabRun, after: LabRun) {
  if (
    before.policy !== after.policy ||
    before.budget !== after.budget ||
    before.workload !== after.workload ||
    before.tasks.length !== after.tasks.length ||
    before.mechanisms.fastKernels !== after.mechanisms.fastKernels ||
    before.mechanisms.scheduler !== after.mechanisms.scheduler ||
    before.mechanisms.reuse ||
    !after.mechanisms.reuse
  )
    throw new Error("Prefix study must isolate reuse on a paired workload");
  after.tasks.forEach((task, i) => {
    const original = before.tasks[i];
    if (
      task.id !== original.id ||
      task.tokens !== original.tokens ||
      task.correct !== original.correct ||
      task.inputTokens !== original.inputTokens ||
      task.arrival !== original.arrival ||
      task.decode !== original.decode
    )
      throw new Error("Prefix study changed cognition or decode work");
  });
  const request =
    after.tasks.find((t) => t.cacheHit) ?? after.tasks[6] ?? after.tasks[0];
  if (!request) throw new Error("Prefix study needs a request");
  const reference = before.tasks.find((t) => t.id === request.id)!;
  const group = TASKS.find((t) => t.id === request.id)?.prefixGroup;
  const producer = request.cacheHit
    ? after.tasks.find(
        (t) =>
          TASKS.find((original) => original.id === t.id)?.prefixGroup ===
            group &&
          !t.cacheHit &&
          t.start + t.prefill <= request.start,
      )
    : after.tasks[0];
  if (!producer) throw new Error("A hit needs previously computed state");
  const savedTokens = request.inputTokens - request.computedInputTokens;
  const savedWork = reference.prefill - request.prefill;
  const hits = after.tasks.filter((t) => t.cacheHit).length;
  return {
    request,
    reference,
    producer,
    group,
    savedTokens,
    savedWork,
    hits,
    readyAt: producer.start + producer.prefill,
    totalSaved: before.gpuSeconds - after.gpuSeconds,
    coldReads: after.tasks.length - hits,
  };
}

/** Authored time expands the short warm prefill, while retaining exact work accounting. */
export function prefixFrame(ms: number, study: ReturnType<typeof prefixStudy>) {
  const cold = ramp(ms, 1000, 5500);
  const store = ramp(ms, 5500, 7400);
  const lookup = ramp(ms, 8200, 10400);
  // The mechanism and paired lanes read exactly the same service clock.
  const service = prefixComparisonFrame(ms, study);
  const suffix = unit(service.optimized.prefillWork / study.request.prefill);
  const decode = unit(service.optimized.decodeWork / study.request.decode);
  const ready = store === 1;
  const matched = ready && lookup === 1 && study.request.cacheHit;
  return {
    cold,
    store,
    lookup,
    suffix,
    decode,
    ready,
    matched,
    beat:
      ms < 5500
        ? 0
        : ms < 10400
          ? 1
          : ms < 16000
            ? 2
            : ms < 21800
              ? 3
              : ms < 29400
                ? 4
                : 5,
    handoff: ramp(ms, ...PREFIX_HANDOFF),
    coldTokens: Math.round(study.producer.computedInputTokens * cold),
    newTokens: service.optimized.inputTokens,
    outputTokens: service.optimized.outputTokens,
    avoidedTokens: matched ? study.savedTokens : 0,
  };
}

/** Paired service, with warm state already available. Queue waiting is excluded. */
export function prefixServiceAt(
  study: ReturnType<typeof prefixStudy>,
  seconds: number,
) {
  if (!Number.isFinite(seconds) || seconds < 0)
    throw new Error("Prefix service time must be finite and nonnegative");
  const lanes = [study.reference, study.request].map((task) => {
    const prefillWork = Math.min(seconds, task.prefill);
    const decodeWork = Math.min(
      Math.max(0, seconds - task.prefill),
      task.decode,
    );
    return {
      prefillWork,
      decodeWork,
      inputTokens: Math.floor(
        task.computedInputTokens * unit(prefillWork / task.prefill),
      ),
      outputTokens: Math.floor(task.tokens * unit(decodeWork / task.decode)),
      work: prefillWork + decodeWork,
      done: seconds >= task.gpuSeconds,
      phase:
        seconds >= task.gpuSeconds
          ? "complete"
          : seconds < task.prefill
            ? "prefill"
            : "decode",
    };
  });
  return {
    seconds,
    baseline: lanes[0],
    optimized: lanes[1],
    remaining: Math.max(0, study.reference.gpuSeconds - seconds),
  };
}

/** Hold on the exact early completion, then let the baseline finish. */
export function prefixComparisonFrame(
  ms: number,
  study: ReturnType<typeof prefixStudy>,
) {
  const early = study.request.gpuSeconds;
  const prefill = study.request.prefill;
  const handoffTime = prefill + study.request.decode * 0.25;
  // Expand warm prefill, show attention, then freeze both views during the
  // camera handoff. No request restarts when the comparison becomes visible.
  const time =
    ms <= 12800
      ? ramp(ms, 10600, 12800) * prefill
      : ms <= PREFIX_HANDOFF[0]
        ? prefill + ramp(ms, 12800, PREFIX_HANDOFF[0]) * (handoffTime - prefill)
        : ms <= PREFIX_HANDOFF[1]
          ? handoffTime
          : ms <= 21800
            ? handoffTime +
              ramp(ms, PREFIX_HANDOFF[1], 21800) * (early - handoffTime)
            : ms <= 25800
              ? early
              : early + ramp(ms, 25800, 29400) * study.savedWork;
  return prefixServiceAt(study, time);
}
