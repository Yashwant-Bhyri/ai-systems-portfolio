import {
  compareTasks,
  simulateLab,
  type LabRun,
  type labComposition,
} from "./lab-simulation";

export type CompositionLens = "runtime" | "policy" | "combined";
export type CompositionRuns = ReturnType<typeof labComposition>;
export const COMPOSITION_HOLD_MS = 3500;
/** The baseline is only where the comparison starts: it is shown briefly, then the first lever moves. */
export const COMPOSITION_OPEN_MS = 1200;
/** When each of the five phases begins. */
export const COMPOSITION_PHASE_START = [0, 1, 2, 3, 4].map((p) => (p === 0 ? 0 : COMPOSITION_OPEN_MS + (p - 1) * COMPOSITION_HOLD_MS));
export const COMPOSITION_FILM_MS = COMPOSITION_OPEN_MS + COMPOSITION_HOLD_MS * 4;
export function compositionPhase(time: number) {
  let p = 0;
  for (let i = 1; i < 5; i++) if (time >= COMPOSITION_PHASE_START[i]) p = i;
  return p;
}

/** Authored presentation only: intermediate cursor locations are not additional runs. */
export function compositionMotion(time: number) {
  if (!Number.isFinite(time))
    throw new RangeError("Composition time must be finite");
  const cursor = Math.max(0, Math.min(COMPOSITION_FILM_MS, time));
  const phase = compositionPhase(cursor);
  const local = cursor - COMPOSITION_PHASE_START[phase];
  const ramp = (start: number, end: number) =>
    Math.max(0, Math.min(1, (local - start) / (end - start)));
  const intervention = phase === 1 || phase === 2;
  const traceProgress = intervention ? 1 - (1 - ramp(350, 1450)) ** 5 : 1;
  const resultReveal = intervention
    ? ramp(1450, 1800)
    : phase === 4
      ? ramp(0, 450)
      : 0;
  return {
    cursor,
    phase,
    traceProgress,
    resultReveal,
    arrived: traceProgress === 1,
  };
}

/** Shortcuts settle a step; scrubbing and narrated handoff retain the exact time. */
export function compositionMoment(phase: number) {
  if (!Number.isInteger(phase) || phase < 0 || phase > 4)
    throw new RangeError("Unknown composition phase");
  return phase === 0 ? COMPOSITION_OPEN_MS / 2 : COMPOSITION_PHASE_START[phase] + 2200;
}

/** Ordered counterfactuals, not independent percentages that can be summed in any order. */
export function compositionMechanisms(
  points: CompositionRuns,
  selected: number,
  lens: CompositionLens,
) {
  const { reference, target } = compositionComparison(points, selected, lens);
  const step = (
    name: string,
    before: LabRun,
    after: LabRun,
    metric: "cost" | "accuracy",
  ) => ({
    name,
    before,
    after,
    metric,
    delta:
      metric === "cost"
        ? before.correctCost! - after.correctCost!
        : after.accuracy - before.accuracy,
  });
  if (lens === "runtime") {
    const reuse = simulateLab(
      reference.policyIndex,
      reference.budget,
      false,
      reference.workload,
      { ...reference.mechanisms, reuse: true },
    );
    return [
      step("KV prefix reuse", reference, reuse, "cost"),
      step("Faster prefill + decode", reuse, target, "cost"),
    ];
  }
  if (lens === "policy") {
    const sft = simulateLab(
      1,
      reference.budget,
      reference.optimized,
      reference.workload,
      reference.mechanisms,
    );
    return [
      step("Supervised fine-tuning", reference, sft, "accuracy"),
      step("RL", sft, target, "accuracy"),
    ];
  }
  return [
    step("SFT + correctness RL", points[0], points[2], "accuracy"),
    step("KV reuse + execution rates", points[2], points[3], "cost"),
  ];
}

/** Compare a declared pair, never the highlighted point against an unrelated denominator. */
export function compositionComparison(
  points: CompositionRuns,
  selected: number,
  lens: CompositionLens,
) {
  if (points.length !== 4 || !Number.isInteger(selected) || !points[selected])
    throw new RangeError(
      "Composition requires four conditions and a valid selection",
    );
  const referenceIndex =
    lens === "runtime"
      ? points[selected].trained
        ? 2
        : 0
      : lens === "policy"
        ? points[selected].optimized
          ? 1
          : 0
        : 0;
  const targetIndex =
    lens === "runtime"
      ? referenceIndex + 1
      : lens === "policy"
        ? referenceIndex + 2
        : 3;
  const reference = points[referenceIndex],
    target = points[targetIndex];
  const costSaved = reference.correctCost - target.correctCost;
  const flips = compareTasks(reference, target);
  return {
    referenceIndex,
    targetIndex,
    reference,
    target,
    costSaved,
    costPercent:
      reference.correctCost > 0
        ? (100 * costSaved) / reference.correctCost
        : null,
    accuracyPoints: target.accuracy - reference.accuracy,
    correctDelta: target.correct - reference.correct,
    taskWorkDelta: target.meanCost - reference.meanCost,
    unchangedTasks: reference.n - flips.gained.length - flips.lost.length,
    gained: flips.gained.length,
    lost: flips.lost.length,
    path: lens === "combined" ? [0, 2, 3] : [referenceIndex, targetIndex],
  };
}
