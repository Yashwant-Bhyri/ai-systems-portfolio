/** Transparent presentation arithmetic. None of these functions manufactures a run. */
export type FrontierPoint = {
  id: string;
  label: string;
  accuracy: number;
  taskCost: number;
  correctCost: number;
  optimized: boolean;
  trained: boolean;
};

export function costPerCorrect(
  gpuSeconds: number,
  correctAnswers: number,
): number | null {
  if (
    !Number.isFinite(gpuSeconds) ||
    !Number.isFinite(correctAnswers) ||
    gpuSeconds < 0 ||
    correctAnswers <= 0
  )
    return null;
  return gpuSeconds / correctAnswers;
}


/** Maximize quality, minimize cost. Equal points do not dominate one another. */
export function paretoFrontier<
  T extends { accuracy: number; correctCost: number },
>(points: readonly T[]): T[] {
  return points
    .filter(
      (p) =>
        !points.some(
          (q) =>
            q.accuracy >= p.accuracy &&
            q.correctCost <= p.correctCost &&
            (q.accuracy > p.accuracy || q.correctCost < p.correctCost),
        ),
    )
    .sort((a, b) => a.correctCost - b.correctCost);
}

export function reductionPercent(
  baseline: number,
  optimized: number,
): number | null {
  return baseline > 0 && Number.isFinite(baseline) && Number.isFinite(optimized)
    ? (1 - optimized / baseline) * 100
    : null;
}

/** Piecewise-linear area on the supplied, measured x axis. Never relabel tokens as GPU time. */
export function normalizedAuc(
  points: readonly { cost: number; accuracy: number }[],
): number | null {
  if (
    points.length < 2 ||
    points.some((p) => !Number.isFinite(p.cost) || !Number.isFinite(p.accuracy))
  )
    return null;
  const sorted = [...points].sort((a, b) => a.cost - b.cost);
  const range = sorted.at(-1)!.cost - sorted[0].cost;
  if (
    range <= 0 ||
    sorted.some((p, i) => i > 0 && p.cost === sorted[i - 1].cost)
  )
    return null;
  return (
    sorted
      .slice(1)
      .reduce(
        (area, p, i) =>
          area +
          ((p.cost - sorted[i].cost) * (p.accuracy + sorted[i].accuracy)) / 2,
        0,
      ) / range
  );
}
