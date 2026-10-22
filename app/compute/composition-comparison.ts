import {
  compareTasks,
  simulateLab,
  type LabRun,
  type labComposition,
} from "./lab-simulation";

export type CompositionLens = "runtime" | "policy" | "combined";
export type CompositionRuns = ReturnType<typeof labComposition>;
export const COMPOSITION_HOLD_MS = 3500;
export const COMPOSITION_FILM_MS = COMPOSITION_HOLD_MS * 5;
export function compositionPhase(time: number) {
  return Math.max(0, Math.min(4, Math.floor(time / COMPOSITION_HOLD_MS)));
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
      step("Correctness RL", sft, target, "accuracy"),
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
