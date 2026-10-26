import { STEP_OVERHEAD, decodeBytes, bandwidth, prefillSeconds } from "./calibration.ts";

/**
 * A bounded admission/locality experiment on calibrated costs (calibration.ts):
 * Qwen3-4B on one H100, KV pages of 1,024 tokens. Prefill per page and decode per
 * token are rounded to whole milliseconds. Derived from published specs, not telemetry.
 */
export const BLOCK_TOKENS = 1024;
export const CACHE_ROUTING_DURATION = 44000;
export const CACHE_ROUTING_MOMENTS = [
  0, 6500, 12500, 18000, 24000, 30000, 44000,
] as const;
export const CACHE_ROUTING_LABELS = [
  "Locate the prefix",
  "Check KV capacity",
  "Release and admit",
  "First token delivered",
  "Compare the delay",
  "Find the routing crossover",
  "Inspect released pages",
] as const;
export type CacheRoutingConfig = {
  retained: boolean;
  occupied: 4 | 8;
  releaseMs: number;
};
export const CACHE_ROUTING_DEFAULT: CacheRoutingConfig = {
  retained: true,
  occupied: 8,
  releaseMs: 20,
};
const CAPACITY = 12,
  PREFIX = 4,
  SUFFIX = 2,
  OUTPUT = 2;
/** One 1,024-token page of prompt, compute-bound. */
const PREFILL_MS = Math.round((prefillSeconds(6 * BLOCK_TOKENS, 0, false) / 6) * 1000),
  /** One output token at a ~6k-token context, memory-bound, plus the step overhead. */
  TOKEN_MS = Math.round((STEP_OVERHEAD + decodeBytes(6 * BLOCK_TOKENS, false) / bandwidth()) * 1000),
  OUTPUT_TOKENS = 32;
export type CacheRoute = "warm" | "cold";
export type CachePage = {
  id: number;
  kind: "free" | "resident" | "prefix" | "private";
  refs: number;
  logical: number | null;
  ready: boolean;
};

export function cacheRoutingStudy(
  config: CacheRoutingConfig = CACHE_ROUTING_DEFAULT,
) {
  if (
    typeof config.retained !== "boolean" ||
    ![4, 8].includes(config.occupied) ||
    !Number.isFinite(config.releaseMs) ||
    config.releaseMs < 0 ||
    config.releaseMs > 100
  )
    throw new RangeError("Invalid cache-routing configuration");
  const make = (id: CacheRoute) => {
    const hit = id === "warm" && config.retained;
    const resident = id === "warm" ? config.occupied : 0;
    const release = id === "warm" ? config.releaseMs : 0;
    const reuse = hit ? PREFIX : 0;
    const newBlocks = PREFIX + SUFFIX + OUTPUT - reuse;
    const headroom = CAPACITY - resident - reuse;
    const start = newBlocks > headroom ? release : 0;
    const pinnedAtAdmission = start < release ? resident : 0;
    const reusableIds = hit ? [0, 1, 2, 3] : [];
    const free = Array.from({ length: CAPACITY }, (_, i) => i).filter(
      (i) =>
        !reusableIds.includes(i) &&
        !(i >= PREFIX && i < PREFIX + pinnedAtAdmission),
    );
    const allocated = free.slice(0, newBlocks);
    const blockTable = [...reusableIds, ...allocated];
    const prefillBlocks = PREFIX + SUFFIX - reuse;
    const prefillEnd = start + prefillBlocks * PREFILL_MS;
    return {
      id,
      hit,
      resident,
      release,
      reuse,
      newBlocks,
      headroom,
      start,
      allocated,
      blockTable,
      prefillBlocks,
      prefillEnd,
      firstToken: prefillEnd + TOKEN_MS,
      complete: prefillEnd + OUTPUT_TOKENS * TOKEN_MS,
    };
  };
  const warm = make("warm"),
    cold = make("cold");
  const delta = cold.firstToken - warm.firstToken;
  return {
    version: "cache-routing-v1",
    status: "illustrative",
    config: { ...config },
    capacity: CAPACITY,
    blockTokens: BLOCK_TOKENS,
    promptBlocks: PREFIX + SUFFIX,
    outputBlocks: OUTPUT,
    prefillMsPerBlock: PREFILL_MS,
    decodeMsPerToken: TOKEN_MS,
    outputTokens: OUTPUT_TOKENS,
    warm,
    cold,
    delta,
    winner: delta > 0 ? "warm" : delta < 0 ? "cold" : "tie",
    workAvoided: cold.prefillBlocks - warm.prefillBlocks,
    horizon: Math.max(warm.complete, cold.complete, config.releaseMs) + 10,
    crossover:
      warm.newBlocks > warm.headroom
        ? (cold.prefillBlocks - warm.prefillBlocks) * PREFILL_MS
        : null,
  } as const;
}
export type CacheRoutingStudy = ReturnType<typeof cacheRoutingStudy>;

export function cacheRouteState(
  study: CacheRoutingStudy,
  id: CacheRoute,
  milliseconds: number,
) {
  if (!Number.isFinite(milliseconds))
    throw new RangeError("Service time must be finite");
  const time = Math.max(-1, Math.min(study.horizon, milliseconds));
  const route = study[id];
  const admitted = time >= route.start,
    completed = time >= route.complete;
  const emitted = Math.max(
    0,
    Math.min(
      OUTPUT_TOKENS,
      Math.floor((time - route.prefillEnd) / TOKEN_MS + 1e-9),
    ),
  );
  const prefilled = Math.max(
    0,
    Math.min(route.prefillBlocks, (time - route.start) / PREFILL_MS),
  );
  const pages: CachePage[] = Array.from({ length: CAPACITY }, (_, i) => {
    if (
      i >= PREFIX &&
      i < PREFIX + route.resident &&
      Math.max(0, time) < route.release
    )
      return { id: i, kind: "resident", refs: 1, logical: null, ready: true };
    const logical = route.blockTable.indexOf(i);
    if (logical >= 0 && admitted) {
      if (logical < PREFIX)
        return {
          id: i,
          kind: "prefix",
          refs: completed ? 0 : 1,
          logical,
          ready: route.hit || prefilled >= logical + 1,
        };
      if (!completed)
        return {
          id: i,
          kind: "private",
          refs: 1,
          logical,
          ready:
            logical < PREFIX + SUFFIX
              ? prefilled >= logical - route.reuse + 1
              : emitted >= (logical - PREFIX - SUFFIX + 1) * 16,
        };
    }
    if (route.hit && i < PREFIX)
      return { id: i, kind: "prefix", refs: 0, logical: i, ready: true };
    return { id: i, kind: "free", refs: 0, logical: null, ready: false };
  });
  return {
    time,
    route,
    pages,
    admitted,
    completed,
    emitted,
    prefilled,
    phase:
      time < 0
        ? "arriving"
        : !admitted
          ? "waiting for KV"
          : time < route.prefillEnd
            ? "processing input"
            : !completed
              ? "streaming answer"
              : "request complete",
    free: pages.filter((p) => p.kind === "free").length,
    retained: pages.filter(
      (p) => p.kind === "prefix" && p.refs === 0 && p.ready,
    ).length,
    owned: pages.filter((p) => p.refs > 0).length,
    workMs:
      Math.min(
        Math.max(0, time - route.start),
        route.prefillBlocks * PREFILL_MS,
      ) +
      Math.min(Math.max(0, time - route.prefillEnd), OUTPUT_TOKENS * TOKEN_MS),
  };
}

/** The crossover for a full warm replica: the four prefix pages of prefill it avoids. */
export const PROBE_TIE = PREFIX * PREFILL_MS;
export const PROBE_COLD = Math.min(100, PROBE_TIE + 20);
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const mix = (a: number, b: number, t: number) => a + (b - a) * clamp(t);
export function cacheRoutingFrame(ms: number, study: CacheRoutingStudy) {
  if (!Number.isFinite(ms)) throw new RangeError("Film time must be finite");
  const time = Math.max(0, Math.min(CACHE_ROUTING_DURATION, ms));
  const early = Math.min(study.warm.firstToken, study.cold.firstToken);
  const late = Math.max(study.warm.firstToken, study.cold.firstToken);
  const service =
    time < 10000
      ? -1
      : time < 17000
        ? mix(0, early, (time - 10000) / 7000)
        : time < 19500
          ? early
          : time < 23000
            ? mix(early, late, (time - 19500) / 3500)
            : time < 25000
              ? late
              : time < 30000
                ? mix(late, study.horizon, (time - 25000) / 5000)
                : study.horizon;
  const beat =
    time >= 41500
      ? 6
      : time >= 30000
        ? 5
        : time >= 23000
          ? 4
          : time >= 17000
            ? 3
            : time >= 10000
              ? 2
              : time >= 5000
                ? 1
                : 0;
  return {
    time,
    service,
    beat,
    chart: time >= 30000 && time < 41500,
    // A separate, explicitly labelled sensitivity sweep. Never advances the
    // original request's events or mutates its selected configuration.
    // Hold at the crossover (where reuse and waiting cancel), then past it, where the cold route wins.
    probeReleaseMs:
      time < 31000 || time >= 41500
        ? study.config.releaseMs
        : time < 33000
          ? mix(study.config.releaseMs, PROBE_TIE, (time - 31000) / 2000)
          : time < 35000
            ? PROBE_TIE
            : time < 38000
              ? mix(PROBE_TIE, PROBE_COLD, (time - 35000) / 3000)
              : time < 40000
                ? PROBE_COLD
                : mix(PROBE_COLD, study.config.releaseMs, (time - 40000) / 1500),
    warm: cacheRouteState(study, "warm", service),
    cold: cacheRouteState(study, "cold", service),
  };
}

export function cacheRoutingSweep(config: CacheRoutingConfig) {
  return Array.from({ length: 11 }, (_, i) => {
    const s = cacheRoutingStudy({ ...config, releaseMs: i * 10 });
    return {
      releaseMs: i * 10,
      warm: s.warm.firstToken,
      cold: s.cold.firstToken,
    };
  });
}
