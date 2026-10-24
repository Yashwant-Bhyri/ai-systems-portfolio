/** Presentation direction only. The numerical example lives in policy-film-math. */
export const ADAPTER_DURATION = 32000;
export const ADAPTER_MOMENTS = [2500, 8500, 15500, 21500, 30000] as const;
export const ADAPTER_LABELS = [
  "Frozen starting weights",
  "First adapter update",
  "Both factors learn",
  "Output error changes",
  "Supervised answer tokens",
] as const;
const ramp = (t: number, a: number, b: number) =>
  Math.max(0, Math.min(1, (t - a) / (b - a)));
const ease = (t: number) => 1 - (1 - t) ** 4;
export function adapterDirection(rawTime: number) {
  const time = Math.max(
    0,
    Math.min(ADAPTER_DURATION, Number.isFinite(rawTime) ? rawTime : 0),
  );
  const beat =
    time < 4000
      ? 0
      : time < 10000
        ? 1
        : time < 18000
          ? 2
          : time < 24000
            ? 3
            : 4;
  // Each real update has a move and a hold. Displayed values are recomputed
  // from interpolated factors, never independently tweened output numbers.
  const position =
    ease(ramp(time, 4700, 7400)) +
    ease(ramp(time, 10500, 12000)) +
    ease(ramp(time, 13000, 14500)) +
    ease(ramp(time, 15500, 17000));
  return {
    time,
    beat,
    position,
    comparison: ramp(time, 18000, 18700),
    example: ramp(time, 24000, 24600),
    targetProgress: ramp(time, 25100, 28900),
  };
}
