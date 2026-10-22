import {
  servingOverviewFrame,
  type ServingFrame,
} from "./serving-load-overview-model";

export type AdmissionFocus = "tokens" | "memory" | "stream";
const CHUNK_DECISION = servingOverviewFrame(9000).gate;
const progress = (time: number, start: number, duration = 650) => {
  const p = Math.max(0, Math.min(1, (time - start) / duration));
  return 1 - (1 - p) ** 4;
};
const TOKEN_EVENTS = [0, 2000, 4000, 13600, 17000, 20000, 23000, 24700];

/** View state derived from the existing trace; no new service timings or workload. */
export function servingAdmissionFrame(frame: ServingFrame) {
  const arrived = frame.requests.B.phase !== "future";
  const admitted = ["prefill", "decode", "complete"].includes(
    frame.requests.B.phase,
  );
  const finished = frame.requests.B.phase === "complete";
  const inputFinished = frame.events.some((event) => event.id === "b-ready");
  const decision = frame.gate.request === "B" ? frame.gate : CHUNK_DECISION;
  const paused =
    admitted && !frame.events.some((event) => event.id === "a-resume");
  const retained = frame.pages.one.filter(
    (owner) => owner === "B-prefix",
  ).length;
  const occupied = frame.pages.one.filter(Boolean).length;
  const defaultFocus: AdmissionFocus = !arrived
    ? "stream"
    : !admitted
      ? "tokens"
      : finished
        ? "memory"
        : frame.beat === "admission"
          ? "tokens"
          : "stream";
  return {
    arrived,
    admitted,
    finished,
    inputFinished,
    paused,
    retained,
    occupied,
    defaultFocus,
    delivered: frame.requests.A.tokens.length,
    proposed: arrived ? decision.tokenNeed : 0,
    tokenTotal: arrived ? decision.tokenUsed + decision.tokenNeed : 1,
    tokenLimit: decision.tokenBudget,
    tokenPass: !arrived || decision.tokenPass,
    memoryTotalAtAdmission: decision.memoryUsed + decision.memoryNeed,
    memoryLimit: decision.memoryCapacity,
    memoryPass: decision.memoryPass,
    deferredAtAdmission: admitted ? 7 - CHUNK_DECISION.tokenNeed : 0,
    arrivalReveal: progress(frame.storyMs, 4200),
    chunkReveal: progress(frame.storyMs, 9000),
    focusReveal: progress(
      frame.storyMs,
      finished
        ? 17300
        : frame.beat === "interference"
          ? paused
            ? 12000
            : 13600
          : admitted
            ? 9000
            : arrived
              ? 4200
              : 0,
      finished ? 500 : 650,
    ),
    tokenReveals: TOKEN_EVENTS.map((at, index) =>
      index === 0 ? 1 : progress(frame.storyMs, at, 380),
    ),
  };
}
