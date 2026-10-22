/**
 * A reversible presentation trace, not a serving simulator or hardware profile.
 * The timestamps space authored camera moves. They are not request service time.
 */
export const SERVING_OVERVIEW_VERSION = "serving-overview-schematic-v2";
export const SERVING_OVERVIEW_DURATION_MS = 94_000;

export const SERVING_BEATS = [
  {
    id: "arrivals",
    at: 0,
    label: "Arrivals",
    title: "Requests enter a busy engine",
    detail:
      "The four identities stay in view as demand reaches the same serving loop.",
  },
  {
    id: "admission",
    at: 6_000,
    label: "Admission",
    title: "Token and memory admission",
    detail:
      "The gate checks scheduled tokens and reserved KV space before B enters.",
  },
  {
    id: "interference",
    at: 12_000,
    label: "Stream pause",
    title: "Prefill interrupts token delivery",
    detail:
      "The amber prefill occupies the shared engine; A's answer resumes afterward.",
  },
  {
    id: "locality",
    at: 18_000,
    label: "Locality",
    title: "Route to reusable KV state",
    detail:
      "Only the warm replica holds B's compatible prefix; D has no match.",
  },
  {
    id: "verification",
    at: 24_000,
    label: "Draft / verify",
    title: "Draft tokens, verify the prefix",
    detail: "Rejected draft work consumes slots without entering C's answer.",
  },
  {
    id: "execution",
    at: 30_000,
    label: "Kernel fusion",
    title: "Kernel fusion removes memory traffic",
    detail:
      "A four-value operation shows exactly which reads, writes and launches fusion removes.",
  },
  {
    id: "precision",
    at: 43_000,
    label: "Weight quantization",
    title: "Weight storage versus numerical error",
    detail:
      "Inspect the weight payload, scale overhead and reconstruction error together.",
  },
  {
    id: "placement",
    at: 56_000,
    label: "Parallel execution",
    title: "Parallel execution across GPUs",
    detail:
      "Device ownership changes the communication path. More GPUs do not imply a fixed speedup.",
  },
  {
    id: "lifecycle",
    at: 78_000,
    label: "Cancellation",
    title: "Cancellation and memory reclamation",
    detail:
      "D leaves at a safe iteration boundary. B's reusable prefix remains in the pool.",
  },
  {
    id: "outcome",
    at: 88_000,
    label: "Delivery criteria",
    title: "Latency and validity gates",
    detail:
      "Latency targets and an independent validity check are both required.",
  },
] as const;

export type ServingBeatId = (typeof SERVING_BEATS)[number]["id"];
export type ServingRequestId = "A" | "B" | "C" | "D";
export type ServingReplicaId = "one" | "two";
export type ServingRoute = "warm" | "cold";
export type ServingPhase =
  | "future"
  | "queued"
  | "held"
  | "prefill"
  | "decode"
  | "complete"
  | "cancelled";
export type ServingPageOwner = ServingRequestId | "B-prefix" | null;

export const SERVING_REQUESTS: Record<
  ServingRequestId,
  {
    name: string;
    short: string;
    role: string;
    color: string;
  }
> = {
  A: { name: "Request A", short: "A", role: "Live answer", color: "#9cc5f5" },
  B: { name: "Request B", short: "B", role: "Long document", color: "#ffc267" },
  C: {
    name: "Request C",
    short: "C",
    role: "Matching prefix",
    color: "#b8e986",
  },
  D: {
    name: "Request D",
    short: "D",
    role: "Unrelated prompt",
    color: "#b8a8dc",
  },
};

export type ServingEventKind =
  | "start"
  | "arrival"
  | "held"
  | "admit"
  | "resume"
  | "ready"
  | "first"
  | "complete"
  | "decision"
  | "cancel";
export type ServingEvent = {
  id: string;
  at: number;
  request: ServingRequestId;
  kind: ServingEventKind;
  label: string;
};

const BASE_EVENTS: readonly ServingEvent[] = [
  {
    id: "a-start",
    at: 0,
    request: "A",
    kind: "start",
    label: "A owns three KV tiles and is streaming",
  },
  {
    id: "b-arrives",
    at: 4_200,
    request: "B",
    kind: "arrival",
    label: "B's long document reaches admission",
  },
  {
    id: "b-held",
    at: 6_500,
    request: "B",
    kind: "held",
    label: "B's whole prefill exceeds the step token budget",
  },
  {
    id: "b-admit",
    at: 9_000,
    request: "B",
    kind: "admit",
    label: "A smaller B prefill chunk fits both checks",
  },
  {
    id: "a-resume",
    at: 13_600,
    request: "A",
    kind: "resume",
    label: "A's token stream resumes after B's prefill slice",
  },
  {
    id: "b-ready",
    at: 14_800,
    request: "B",
    kind: "ready",
    label: "B finishes prefill on replica one",
  },
  {
    id: "b-first",
    at: 15_600,
    request: "B",
    kind: "first",
    label: "B emits its first answer token",
  },
  {
    id: "b-complete",
    at: 17_300,
    request: "B",
    kind: "complete",
    label: "B completes; two compatible prefix tiles remain on replica one",
  },
  {
    id: "c-arrives",
    at: 19_000,
    request: "C",
    kind: "arrival",
    label: "C arrives with a compatible B prefix",
  },
  {
    id: "c-admit",
    at: 21_300,
    request: "C",
    kind: "admit",
    label: "C is routed to a selected replica",
  },
  {
    id: "d-arrives",
    at: 22_300,
    request: "D",
    kind: "arrival",
    label: "D arrives with no matching prefix",
  },
  {
    id: "d-decision",
    at: 22_600,
    request: "D",
    kind: "decision",
    label: "D checks the remaining reservation capacity",
  },
  {
    id: "d-admit-cold",
    at: 23_000,
    request: "D",
    kind: "admit",
    label: "On C's cold route, D fits replica one's remaining tiles",
  },
  {
    id: "a-complete",
    at: 24_800,
    request: "A",
    kind: "complete",
    label: "A completes and releases its three owned tiles",
  },
  {
    id: "d-admit-warm",
    at: 26_000,
    request: "D",
    kind: "admit",
    label: "Released A tiles admit D on the warm route",
  },
  {
    id: "c-ready",
    at: 26_600,
    request: "C",
    kind: "ready",
    label: "C finishes its illustrative prefill path",
  },
  {
    id: "c-first",
    at: 27_000,
    request: "C",
    kind: "first",
    label: "C emits its first visible token",
  },
  {
    id: "c-complete",
    at: 28_200,
    request: "C",
    kind: "complete",
    label: "C completes and releases its own suffix or cold-prefill tiles",
  },
  {
    id: "d-cancel",
    at: 82_300,
    request: "D",
    kind: "cancel",
    label:
      "D cancellation is observed at an iteration boundary; only its pages are released",
  },
];

export type ServingRequestFrame = {
  id: ServingRequestId;
  phase: ServingPhase;
  replica: ServingReplicaId | null;
  sharedPrefix: boolean;
  tokens: readonly string[];
};
export type ServingGate = {
  request: "B" | "D" | null;
  mode: string;
  tokenUsed: number;
  tokenNeed: number;
  tokenBudget: number;
  memoryUsed: number;
  memoryNeed: number;
  memoryCapacity: number;
  tokenPass: boolean;
  memoryPass: boolean;
};
export type ServingFrame = {
  storyMs: number;
  beat: ServingBeatId;
  route: ServingRoute;
  requests: Record<ServingRequestId, ServingRequestFrame>;
  pages: Record<ServingReplicaId, readonly ServingPageOwner[]>;
  gate: ServingGate;
  prefixReady: boolean;
  events: readonly ServingEvent[];
  latestEvent: ServingEvent;
};

const A_TOKENS = [0, 2_000, 4_000, 13_600, 17_000, 20_000, 23_000, 24_700];
const B_TOKENS = [15_600, 17_000];
const C_TOKENS = [27_000, 27_600, 28_200];

function reserve(
  pages: ServingPageOwner[],
  indexes: readonly number[],
  owner: ServingPageOwner,
) {
  for (const index of indexes) {
    if (pages[index] !== null)
      throw new Error(`reservation collision at tile ${index}`);
    pages[index] = owner;
  }
}

function release(
  pages: ServingPageOwner[],
  indexes: readonly number[],
  owner: ServingPageOwner,
) {
  for (const index of indexes) {
    if (pages[index] !== owner)
      throw new Error(`release without ${owner} ownership at tile ${index}`);
    pages[index] = null;
  }
}

export function servingOverviewFrame(
  storyMs: number,
  route: ServingRoute = "warm",
): ServingFrame {
  if (route !== "warm" && route !== "cold")
    throw new RangeError("route must be warm or cold");
  const t = Math.max(
    0,
    Math.min(
      SERVING_OVERVIEW_DURATION_MS,
      Number.isFinite(storyMs) ? storyMs : 0,
    ),
  );
  const one: ServingPageOwner[] = Array(8).fill(null);
  const two: ServingPageOwner[] = Array(8).fill(null);
  const initialRequest = (id: ServingRequestId): ServingRequestFrame => ({
    id,
    phase: "future",
    replica: null,
    sharedPrefix: false,
    tokens: [],
  });
  const requests: Record<ServingRequestId, ServingRequestFrame> = {
    A: initialRequest("A"),
    B: initialRequest("B"),
    C: initialRequest("C"),
    D: initialRequest("D"),
  };
  const events = BASE_EVENTS.filter(
    (event) =>
      event.at <= t &&
      (event.id !== "d-admit-warm" || route === "warm") &&
      (event.id !== "d-admit-cold" || route === "cold"),
  );
  for (const event of events) {
    const request = requests[event.request];
    switch (event.id) {
      case "a-start":
        request.phase = "decode";
        request.replica = "one";
        reserve(one, [0, 1, 2], "A");
        break;
      case "b-arrives":
        request.phase = "queued";
        break;
      case "b-held":
        request.phase = "held";
        break;
      case "b-admit":
        request.phase = "prefill";
        request.replica = "one";
        reserve(one, [3, 4, 5, 6], "B");
        break;
      case "b-ready":
        request.phase = "decode";
        break;
      case "b-complete":
        request.phase = "complete";
        release(one, [5, 6], "B");
        one[3] = "B-prefix";
        one[4] = "B-prefix";
        break;
      case "c-arrives":
        request.phase = "queued";
        break;
      case "c-admit":
        request.phase = "prefill";
        request.replica = route === "warm" ? "one" : "two";
        request.sharedPrefix = route === "warm";
        reserve(
          route === "warm" ? one : two,
          route === "warm" ? [5] : [0, 1, 2],
          "C",
        );
        break;
      case "d-arrives":
        request.phase = "queued";
        break;
      case "d-decision":
        if (route === "warm") request.phase = "held";
        break;
      case "d-admit-cold":
        request.phase = "prefill";
        request.replica = "one";
        reserve(one, [5, 6, 7], "D");
        break;
      case "a-complete":
        request.phase = "complete";
        release(one, [0, 1, 2], "A");
        break;
      case "d-admit-warm":
        request.phase = "prefill";
        request.replica = "one";
        reserve(one, [0, 1, 2], "D");
        break;
      case "c-ready":
        request.phase = "decode";
        break;
      case "c-complete":
        request.phase = "complete";
        release(
          route === "warm" ? one : two,
          route === "warm" ? [5] : [0, 1, 2],
          "C",
        );
        break;
      case "d-cancel":
        request.phase = "cancelled";
        release(one, route === "warm" ? [0, 1, 2] : [5, 6, 7], "D");
        break;
    }
  }
  requests.A.tokens = A_TOKENS.filter((at) => at <= t).map(
    (_, index) => `A${index + 1}`,
  );
  requests.B.tokens = B_TOKENS.filter((at) => at <= t).map(
    (_, index) => `B${index + 1}`,
  );
  requests.C.tokens = C_TOKENS.filter((at) => at <= t).map(
    (_, index) => `C${index + 1}`,
  );
  const beat = [...SERVING_BEATS]
    .reverse()
    .find((candidate) => candidate.at <= t)!.id;
  const prefixReady = one.includes("B-prefix");
  const dGate = t >= 22_300 && t < 82_300;
  const bGate = t >= 4_200 && t < 17_300;
  const used = one.filter(Boolean).length;
  // Admission readouts are snapshots of the decision, not live pool occupancy.
  // After D is admitted, retain the pre-admission baseline shown at that decision.
  const dMemoryUsed = route === "cold" ? 5 : t < 24_800 ? 6 : 3;
  const gate: ServingGate = dGate
    ? {
        request: "D",
        mode: "Cold request",
        tokenUsed: 2,
        tokenNeed: 1,
        tokenBudget: 6,
        memoryUsed: dMemoryUsed,
        memoryNeed: 3,
        memoryCapacity: 8,
        tokenPass: 2 + 1 <= 6,
        memoryPass: dMemoryUsed + 3 <= 8,
      }
    : bGate
      ? {
          request: "B",
          mode: t < 9_000 ? "Whole prefill" : "Bounded chunk",
          tokenUsed: 1,
          tokenNeed: t < 9_000 ? 7 : 4,
          tokenBudget: 6,
          memoryUsed: 3,
          memoryNeed: 4,
          memoryCapacity: 8,
          tokenPass: 1 + (t < 9_000 ? 7 : 4) <= 6,
          memoryPass: 3 + 4 <= 8,
        }
      : {
          request: null,
          mode: "No pending check",
          tokenUsed: 0,
          tokenNeed: 0,
          tokenBudget: 6,
          memoryUsed: used,
          memoryNeed: 0,
          memoryCapacity: 8,
          tokenPass: true,
          memoryPass: true,
        };
  return {
    storyMs: t,
    beat,
    route,
    requests,
    pages: { one, two },
    gate,
    prefixReady,
    events,
    latestEvent: events[events.length - 1],
  };
}
