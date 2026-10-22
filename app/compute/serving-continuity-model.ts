import type { ServingFrame } from "./serving-load-overview-model";

const unit = (value: number) => Math.max(0, Math.min(1, value));
export const reveal = (time: number, start: number, duration = 550) =>
  1 - (1 - unit((time - start) / duration)) ** 4;

/** C's page map and D's decision are projections of the original A/B/C/D trace. */
export function localityFrame(frame: ServingFrame) {
  const warm = frame.route === "warm";
  const arrived = frame.requests.C.phase !== "future";
  const admitted = ["prefill", "decode", "complete"].includes(
    frame.requests.C.phase,
  );
  const dArrived = frame.requests.D.phase !== "future";
  const dDecision = frame.events.some((event) => event.id === "d-decision");
  const dAdmitted = ["prefill", "decode", "complete"].includes(
    frame.requests.D.phase,
  );
  const freeAtDecision =
    frame.gate.request === "D"
      ? frame.gate.memoryCapacity - frame.gate.memoryUsed
      : 8 - frame.pages.one.filter(Boolean).length;
  return {
    warm,
    arrived,
    admitted,
    dArrived,
    dDecision,
    dAdmitted,
    retained: frame.pages.one.filter((owner) => owner === "B-prefix").length,
    newPages: warm ? 1 : 3,
    reusedPages: warm ? 2 : 0,
    blockTable: warm ? [3, 4, 5] : [0, 1, 2],
    selectedReplica: warm ? ("one" as const) : ("two" as const),
    freeAtDecision,
    dNeeds: 3,
    dShortfall: Math.max(0, 3 - freeAtDecision),
    arrivalReveal: reveal(frame.storyMs, 19000),
    routeReveal: reveal(frame.storyMs, 19000, 2300),
    consequenceReveal: reveal(
      frame.storyMs,
      dDecision ? 22600 : admitted ? 21300 : 18000,
    ),
  };
}

export type OverviewDraftCase = "accepted" | "loss";
/** Greedy proposal verification; the output ribbon follows actual C emission events. */
export function verificationFrame(
  frame: ServingFrame,
  agreement: OverviewDraftCase,
) {
  if (agreement !== "accepted" && agreement !== "loss")
    throw new RangeError("unknown draft case");
  const ready = frame.events.some((event) => event.id === "c-ready");
  const checked = ready && frame.storyMs >= 26900;
  const retained = checked && agreement === "accepted" ? 2 : 0;
  return {
    agreement,
    retained,
    discarded: checked ? 3 - retained : 0,
    proposals:
      agreement === "accepted" ? ["C1", "C2", "Cx"] : ["Cx", "Cy", "Cz"],
    // After the first mismatch, later positions are conditioned on a rejected prefix.
    checks: agreement === "accepted" ? ["C1", "C2", "C3"] : ["C1", null, null],
    correction: agreement === "accepted" ? "C3" : "C1",
    ready,
    checked,
    delivered: frame.requests.C.tokens.length,
    committed: frame.requests.C.tokens.map((token, index) => ({
      token,
      origin: index < retained ? ("draft" as const) : ("target" as const),
    })),
    verifyReveal: reveal(frame.storyMs, 26700, 200),
    decisionReveal: reveal(frame.storyMs, 26900, 100),
    completeReveal: reveal(frame.storyMs, 28200),
  };
}
