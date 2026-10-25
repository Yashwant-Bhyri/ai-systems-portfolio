import { SERVING_OVERVIEW_DURATION_MS } from "./serving-load-overview-model";

/** Holds and slow close-ups on one authored clock, never added service time. */
export const OVERVIEW_PACING: readonly { from: number; to: number; durationMs: number; reason: string }[] = [
  {
    // Stream pause, locality and draft/verify each have their own module in this
    // branch, so the overview passes through them as a short time-lapse.
    from: 12000,
    to: 30000,
    durationMs: 4500,
    reason: "time-lapse through mechanisms shown in full elsewhere",
  },
  {
    from: 88000,
    to: 94000,
    durationMs: 24000,
    reason: "completion and delivery qualification",
  },
];
export const OVERVIEW_PLAYBACK_DURATION_MS =
  SERVING_OVERVIEW_DURATION_MS +
  OVERVIEW_PACING.reduce(
    (total, cue) => total + cue.durationMs - (cue.to - cue.from),
    0,
  );

export function overviewTraceTime(presentationMs: number) {
  if (!Number.isFinite(presentationMs))
    throw new RangeError("finite presentation time required");
  const time = Math.max(
    0,
    Math.min(OVERVIEW_PLAYBACK_DURATION_MS, presentationMs),
  );
  let trace = 0,
    presentation = 0;
  for (const cue of OVERVIEW_PACING) {
    const start = presentation + cue.from - trace;
    if (time < start) return trace + time - presentation;
    if (time <= start + cue.durationMs)
      return cue.from + ((time - start) / cue.durationMs) * (cue.to - cue.from);
    presentation = start + cue.durationMs;
    trace = cue.to;
  }
  return trace + time - presentation;
}

/** Seek into a settled hold when its exact state is selected manually. */
export function overviewPresentationTime(traceMs: number) {
  if (!Number.isFinite(traceMs))
    throw new RangeError("finite trace time required");
  const time = Math.max(0, Math.min(SERVING_OVERVIEW_DURATION_MS, traceMs));
  let trace = 0,
    presentation = 0;
  for (const cue of OVERVIEW_PACING) {
    const start = presentation + cue.from - trace;
    if (time < cue.from) return presentation + time - trace;
    if (time <= cue.to)
      return (
        start +
        (cue.from === cue.to
          ? cue.durationMs / 2
          : ((time - cue.from) / (cue.to - cue.from)) * cue.durationMs)
      );
    presentation = start + cue.durationMs;
    trace = cue.to;
  }
  return presentation + time - trace;
}
