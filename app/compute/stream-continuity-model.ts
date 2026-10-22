/** A deterministic teaching loop. Times are illustrative milliseconds, not GPU telemetry. */
export const STREAM_MODEL_VERSION = "stream-continuity-v1";
export const STREAM_FILM_DURATION_MS = 36_000;
export const STREAM_REQUESTS = [
  { id: 1, arrivalMs: 0, promptTokens: 16, outputTokens: 24 },
  { id: 2, arrivalMs: 0, promptTokens: 16, outputTokens: 24 },
  { id: 3, arrivalMs: 40, promptTokens: 128, outputTokens: 12 },
  { id: 4, arrivalMs: 46, promptTokens: 32, outputTokens: 8 },
] as const satisfies readonly StreamInput[];

export type StreamInput = {
  id: number;
  arrivalMs: number;
  promptTokens: number;
  outputTokens: number;
};
export type StreamPolicy = "whole" | "chunked";
export type StreamConfig = {
  policy: StreamPolicy;
  tokenBudget: 16 | 32 | 64;
  capacityPages: 12 | 24;
  requests?: readonly StreamInput[];
};
export type StreamAllocation = { id: number; tokens: number };
export type StreamStep = {
  index: number;
  startMs: number;
  endMs: number;
  durationMs: number;
  overheadMs: number;
  prefill: StreamAllocation[];
  decode: StreamAllocation[];
  emitted: { id: number; token: number; atMs: number }[];
  admitted: { id: number; pages: number }[];
  released: { id: number; pages: number }[];
  reservationStartPages: number;
  reservationEndPages: number;
  waitingIds: number[];
};
export type StreamRequestResult = StreamInput & {
  pages: number;
  admissionMs: number | null;
  prefillEndMs: number | null;
  tokenMs: number[];
  completionMs: number | null;
  ttftMs: number | null;
  interTokenGapsMs: number[];
  maxGapMs: number | null;
};
export type StreamTrace = {
  version: typeof STREAM_MODEL_VERSION;
  status: "illustrative";
  policy: StreamPolicy;
  tokenBudget: 16 | 32 | 64;
  capacityPages: 12 | 24;
  requests: StreamRequestResult[];
  steps: StreamStep[];
  totalInputTokens: number;
  totalOutputTokens: number;
  iterationTimeMs: number;
  overheadMs: number;
  finishMs: number;
  peakReservationPages: number;
  finalReservationPages: number;
};
export type StreamPair = { whole: StreamTrace; chunked: StreamTrace };
export type StreamFilmFocus =
  | "streams" | "entry" | "interference" | "whole"
  | "chunked" | "gap" | "first-token";

type MutableRequest = StreamInput & {
  pages: number;
  admissionMs: number | null;
  prefillEndMs: number | null;
  prefillRemaining: number;
  tokenMs: number[];
  completionMs: number | null;
};

const PAGE_TOKENS = 16;
const OVERHEAD_MS = 4;
const PREFILL_MS_PER_TOKEN = 0.25;
const DECODE_MS_PER_TOKEN = 1;
const validInteger = (value: number, minimum: number) =>
  Number.isSafeInteger(value) && value >= minimum;

export function reservedPages(request: StreamInput): number {
  return Math.ceil((request.promptTokens + request.outputTokens) / PAGE_TOKENS);
}

export function longestTokenGap(tokens: readonly number[]): {
  startMs: number;
  endMs: number;
  durationMs: number;
} | null {
  if (tokens.length < 2) return null;
  let startMs = tokens[0];
  let endMs = tokens[1];
  for (let i = 2; i < tokens.length; i++) {
    if (tokens[i] - tokens[i - 1] > endMs - startMs) {
      startMs = tokens[i - 1];
      endMs = tokens[i];
    }
  }
  return { startMs, endMs, durationMs: endMs - startMs };
}

/** Reversible film camera. Its holds are presentation time, never service work. */
export function streamFilmFrame(
  filmMs: number,
  pair: StreamPair,
): { serviceMs: number; focus: StreamFilmFocus } {
  const t = Math.max(0, Math.min(STREAM_FILM_DURATION_MS, filmMs));
  const request1 = pair.whole.requests.find((r) => r.id === 1);
  const document = pair.whole.requests.find((r) => r.id === 3);
  if (!request1 || !document || document.admissionMs === null || request1.completionMs === null)
    throw new RangeError("film requires completed requests 1 and 3");
  const gap = longestTokenGap(request1.tokenMs);
  const memoryBlocked = document.admissionMs >= request1.completionMs;
  const entryTarget = memoryBlocked
    ? document.admissionMs + 12
    : Math.max(40, gap?.endMs ?? 40);
  const finish = Math.max(pair.whole.finishMs, pair.chunked.finishMs);
  const interpolate = (a: number, b: number, fraction: number) =>
    a + (b - a) * Math.max(0, Math.min(1, fraction));
  const serviceMs = t < 5_000
    ? interpolate(23, 40, t / 5_000)
    : t < 10_000
      ? interpolate(40, Math.min(entryTarget, finish), (t - 5_000) / 5_000)
      : t < 18_000
        ? interpolate(Math.min(entryTarget, finish), finish, (t - 10_000) / 8_000)
        : finish;
  const focus: StreamFilmFocus =
    t < 5_000 ? "streams" :
    t < 7_000 ? "entry" :
    t < 18_000 ? "interference" :
    t < 21_500 ? "whole" :
    t < 25_000 ? "chunked" :
    t < 28_500 ? "gap" : "first-token";
  return { serviceMs, focus };
}

export function simulateStream(config: StreamConfig): StreamTrace {
  if (!config || !["whole", "chunked"].includes(config.policy))
    throw new RangeError("policy must be whole or chunked");
  if (![16, 32, 64].includes(config.tokenBudget))
    throw new RangeError("tokenBudget must be 16, 32 or 64 tokens");
  if (![12, 24].includes(config.capacityPages))
    throw new RangeError("capacityPages must be 12 or 24 pages");
  const inputs = config.requests ?? STREAM_REQUESTS;
  if (inputs.length === 0) throw new RangeError("at least one request is required");
  const seen = new Set<number>();
  const requests: MutableRequest[] = inputs.map((input) => {
    if (
      !validInteger(input.id, 1) ||
      seen.has(input.id) ||
      !validInteger(input.arrivalMs, 0) ||
      !validInteger(input.promptTokens, 1) ||
      !validInteger(input.outputTokens, 1)
    )
      throw new RangeError("request IDs, arrivals and token counts must be valid integers");
    seen.add(input.id);
    const pages = reservedPages(input);
    if (!Number.isSafeInteger(pages) || pages > config.capacityPages)
      throw new RangeError(`request ${input.id} cannot fit the reserved KV capacity`);
    return {
      id: input.id,
      arrivalMs: input.arrivalMs,
      promptTokens: input.promptTokens,
      outputTokens: input.outputTokens,
      pages,
      admissionMs: null,
      prefillEndMs: null,
      prefillRemaining: input.promptTokens,
      tokenMs: [],
      completionMs: null,
    };
  });
  requests.sort((a, b) => a.arrivalMs - b.arrivalMs || a.id - b.id);

  let clock = 0;
  let reserved = 0;
  let peakReservationPages = 0;
  let nextToAdmit = 0;
  const steps: StreamStep[] = [];
  const maxSteps = requests.reduce(
    (sum, request) => sum + request.promptTokens + request.outputTokens,
    0,
  ) + requests.length + 8;

  while (requests.some((request) => request.completionMs === null)) {
    if (steps.length >= maxSteps) throw new Error("simulation failed to make progress");
    if (
      nextToAdmit < requests.length &&
      requests.every((request) => request.admissionMs === null || request.completionMs !== null) &&
      requests[nextToAdmit].arrivalMs > clock
    ) {
      // Idle device time is not charged to iteration work.
      clock = requests[nextToAdmit].arrivalMs;
    }

    const admitted: StreamStep["admitted"] = [];
    while (
      nextToAdmit < requests.length &&
      requests[nextToAdmit].arrivalMs <= clock &&
      reserved + requests[nextToAdmit].pages <= config.capacityPages
    ) {
      const request = requests[nextToAdmit++];
      request.admissionMs = clock;
      reserved += request.pages;
      admitted.push({ id: request.id, pages: request.pages });
      peakReservationPages = Math.max(peakReservationPages, reserved);
    }

    const active = requests.filter(
      (request) => request.admissionMs !== null && request.completionMs === null,
    );
    if (active.length === 0) {
      if (nextToAdmit < requests.length && requests[nextToAdmit].arrivalMs > clock)
        continue;
      throw new Error("KV capacity deadlock: no admitted work can release pages");
    }

    const prefill: StreamAllocation[] = [];
    const decode: StreamAllocation[] = [];
    const readyAtStart = active.filter((request) => request.prefillRemaining === 0);
    if (config.policy === "whole") {
      const pending = active.filter((request) => request.prefillRemaining > 0);
      if (pending.length) {
        for (const request of pending)
          prefill.push({ id: request.id, tokens: request.prefillRemaining });
      } else {
        for (const request of readyAtStart) decode.push({ id: request.id, tokens: 1 });
      }
    } else {
      for (const request of readyAtStart) decode.push({ id: request.id, tokens: 1 });
      let remaining = config.tokenBudget - decode.length;
      if (remaining < 0)
        throw new RangeError("tokenBudget cannot fit all ready decode sequences");
      for (const request of active) {
        if (request.prefillRemaining === 0 || remaining === 0) continue;
        const tokens = Math.min(request.prefillRemaining, remaining);
        prefill.push({ id: request.id, tokens });
        remaining -= tokens;
      }
    }
    const prefillTokens = prefill.reduce((sum, entry) => sum + entry.tokens, 0);
    const decodeTokens = decode.reduce((sum, entry) => sum + entry.tokens, 0);
    if (prefillTokens + decodeTokens === 0)
      throw new Error("simulation step has no work to perform");
    const startMs = clock;
    const durationMs = OVERHEAD_MS +
      prefillTokens * PREFILL_MS_PER_TOKEN +
      decodeTokens * DECODE_MS_PER_TOKEN;
    const endMs = startMs + durationMs;
    for (const entry of prefill) {
      const request = requests.find((r) => r.id === entry.id)!;
      request.prefillRemaining -= entry.tokens;
      if (request.prefillRemaining === 0) request.prefillEndMs = endMs;
    }
    const emitted: StreamStep["emitted"] = [];
    const released: StreamStep["released"] = [];
    for (const entry of decode) {
      const request = requests.find((r) => r.id === entry.id)!;
      request.tokenMs.push(endMs);
      emitted.push({ id: request.id, token: request.tokenMs.length, atMs: endMs });
      if (request.tokenMs.length === request.outputTokens) {
        request.completionMs = endMs;
        released.push({ id: request.id, pages: request.pages });
      }
    }
    const reservationStartPages = reserved;
    for (const entry of released) reserved -= entry.pages;
    steps.push({
      index: steps.length,
      startMs,
      endMs,
      durationMs,
      overheadMs: OVERHEAD_MS,
      prefill,
      decode,
      emitted,
      admitted,
      released,
      reservationStartPages,
      reservationEndPages: reserved,
      waitingIds: requests
        .slice(nextToAdmit)
        .filter((request) => request.arrivalMs <= startMs)
        .map((request) => request.id),
    });
    clock = endMs;
  }

  return {
    version: STREAM_MODEL_VERSION,
    status: "illustrative",
    policy: config.policy,
    tokenBudget: config.tokenBudget,
    capacityPages: config.capacityPages,
    requests: requests.map((request) => {
      const interTokenGapsMs = request.tokenMs.slice(1).map((time, i) => time - request.tokenMs[i]);
      return {
        id: request.id,
        arrivalMs: request.arrivalMs,
        promptTokens: request.promptTokens,
        outputTokens: request.outputTokens,
        pages: request.pages,
        admissionMs: request.admissionMs,
        prefillEndMs: request.prefillEndMs,
        tokenMs: request.tokenMs,
        completionMs: request.completionMs,
        ttftMs: request.tokenMs.length ? request.tokenMs[0] - request.arrivalMs : null,
        interTokenGapsMs,
        maxGapMs: longestTokenGap(request.tokenMs)?.durationMs ?? null,
      };
    }),
    steps,
    totalInputTokens: requests.reduce((sum, request) => sum + request.promptTokens, 0),
    totalOutputTokens: requests.reduce((sum, request) => sum + request.outputTokens, 0),
    iterationTimeMs: steps.reduce((sum, step) => sum + step.durationMs, 0),
    overheadMs: steps.length * OVERHEAD_MS,
    finishMs: Math.max(...requests.map((request) => request.completionMs!)),
    peakReservationPages,
    finalReservationPages: reserved,
  };
}
