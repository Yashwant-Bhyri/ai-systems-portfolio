import type { ServingFrame } from "./serving-load-overview-model";

export type DeliveryLens =
  "completion" | "first" | "gap" | "validity" | "qualified";
export type DeliveryTargets = { firstTokenMs: 100 | 180; maxGapMs: 60 | 120 };
export const DELIVERY_HORIZON_MS = 500;
export const DELIVERY_EXAMPLE = [
  {
    id: "R1",
    tokens: [40, 60, 80, 100],
    completeMs: 110,
    cancelMs: null,
    valid: true,
  },
  {
    id: "R2",
    tokens: [160, 180, 200, 220],
    completeMs: 230,
    cancelMs: null,
    valid: true,
  },
  {
    id: "R3",
    tokens: [40, 60, 160, 180],
    completeMs: 190,
    cancelMs: null,
    valid: true,
  },
  {
    id: "R4",
    tokens: [40, 60, 80, 100],
    completeMs: 110,
    cancelMs: null,
    valid: false,
  },
  { id: "R5", tokens: [], completeMs: null, cancelMs: 90, valid: null },
] as const;

/** Independent, declared five-request example. Never use A–D story times as latency. */
export function deliveryStudy(targets: DeliveryTargets) {
  if (
    ![100, 180].includes(targets.firstTokenMs) ||
    ![60, 120].includes(targets.maxGapMs)
  )
    throw new RangeError("unsupported delivery targets");
  const requests = DELIVERY_EXAMPLE.map((request) => {
    const firstToken = request.tokens.length ? request.tokens[0] : null;
    const gaps = request.tokens.slice(1).map((end, i) => ({
      start: request.tokens[i],
      end,
      ms: end - request.tokens[i],
    }));
    const longestGap = gaps.length
      ? gaps.reduce((a, b) => (a.ms >= b.ms ? a : b))
      : null;
    const completed =
      request.completeMs !== null && request.completeMs <= DELIVERY_HORIZON_MS;
    const firstPass = firstToken !== null && firstToken <= targets.firstTokenMs;
    const gapPass = longestGap !== null && longestGap.ms <= targets.maxGapMs;
    const qualityPass = request.valid === true;
    const qualified = completed && firstPass && gapPass && qualityPass;
    return {
      ...request,
      firstToken,
      gaps,
      longestGap,
      completed,
      firstPass,
      gapPass,
      qualityPass,
      qualified,
    };
  });
  const completed = requests.filter((r) => r.completed).length;
  const qualified = requests.filter((r) => r.qualified).length;
  return {
    evidence: "separate worked example, not a project benchmark" as const,
    targets,
    horizonMs: DELIVERY_HORIZON_MS,
    offered: requests.length,
    requests,
    completed,
    qualified,
    completionRate: completed / (DELIVERY_HORIZON_MS / 1000),
    qualifiedRate: qualified / (DELIVERY_HORIZON_MS / 1000),
  };
}

export function deliveryFrame(frame: ServingFrame) {
  const time = frame.storyMs;
  const lens: DeliveryLens =
    time < 89000
      ? "completion"
      : time < 90200
        ? "first"
        : time < 91500
          ? "gap"
          : time < 92600
            ? "validity"
            : "qualified";
  const start =
    lens === "first"
      ? 89000
      : lens === "gap"
        ? 90200
        : lens === "validity"
          ? 91500
          : lens === "qualified"
            ? 92600
            : 88000;
  const p = Math.max(0, Math.min(1, (time - start) / 200));
  return {
    lens,
    reveal: 1 - (1 - p) ** 4,
    storyCompleted: Object.values(frame.requests)
      .filter((r) => r.phase === "complete")
      .map((r) => r.id),
    storyCancelled: Object.values(frame.requests)
      .filter((r) => r.phase === "cancelled")
      .map((r) => r.id),
  };
}
