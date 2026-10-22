/** Presentation holds never alter service events. Every visual shares this mapping. */
export const EXECUTION_FILM_DURATION = 80500;
export const EXECUTION_FILM_MOMENTS = [
  0, 8200, 25500, 42000, 66000, 78500,
] as const;
export type ComparisonFocus = "both" | "baseline" | "optimized" | "difference";
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ramp = (ms: number, from: number, to: number, a: number, b: number) =>
  a + (b - a) * clamp((ms - from) / (to - from));
const focusAt = (ms: number, start: number): ComparisonFocus =>
  ms < start
    ? "both"
    : ms < start + 3500
      ? "baseline"
      : ms < start + 7000
        ? "optimized"
        : "difference";

export function executionDirection(time: number) {
  const ms = Math.max(0, Math.min(EXECUTION_FILM_DURATION, time));
  const modelTime =
    ms < 18000
      ? ms
      : ms < 28500
        ? 18000
        : ms < 33500
          ? ramp(ms, 28500, 33500, 20000, 25000)
          : ms < 44000
            ? 25000
            : ms < 48500
              ? ramp(ms, 44000, 48500, 26000, 27200)
              : ms < 57500
                ? ramp(ms, 48500, 57500, 27200, 35700)
                : ms < 68000
                  ? 35700
                  : ms < 70000
                    ? ramp(ms, 68000, 69500, 37000, 37700)
                    : ramp(ms, 70000, 80500, 38000, 42000);
  const focus =
    ms >= 70000
      ? focusAt(ms, 70000)
      : ms >= 68000
        ? "difference"
        : ms >= 44000
          ? focusAt(ms, 57500)
          : ms >= 28500
            ? focusAt(ms, 33500)
            : focusAt(ms, 18000);
  return { modelTime, focus, origin: clamp((ms - 44000) / 4500) };
}

/** Choose the moving portion, not a held frame, for manual parameter inspection. */
export function executionPresentationTime(modelTime: number) {
  if (modelTime <= 18000) return modelTime;
  if (modelTime <= 25000) return 28500 + ((modelTime - 20000) / 5000) * 5000;
  if (modelTime <= 27200) return 44000 + ((modelTime - 26000) / 1200) * 4500;
  if (modelTime <= 35700) return 48500 + ((modelTime - 27200) / 8500) * 9000;
  if (modelTime <= 37700) return 68000 + ((modelTime - 37000) / 700) * 1500;
  return 70000 + ((modelTime - 38000) / 4000) * 10500;
}
