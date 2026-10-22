import { SERVING_OVERVIEW_DURATION_MS } from "./serving-load-overview-model";

/** Holds and slow close-ups on one authored clock, never added service time. */
export const OVERVIEW_PACING = [
  { from: 17900, to: 17900, durationMs: 2000, reason: "retained prefix" },
  {
    from: 21950,
    to: 21950,
    durationMs: 3000,
    reason: "C's selected placement",
  },
  {
    from: 23700,
    to: 23700,
    durationMs: 3000,
    reason: "D's admission consequence",
  },
  {
    from: 26600,
    to: 27000,
    durationMs: 3400,
    reason: "prefill-ready draft verification",
  },
  {
    from: 27000,
    to: 28200,
    durationMs: 3200,
    reason: "committed token delivery",
  },
  { from: 28900, to: 28900, durationMs: 3000, reason: "committed answer" },
  {
    from: 88000,
    to: 94000,
    durationMs: 24000,
    reason: "completion and delivery qualification",
  },
] as const;
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
