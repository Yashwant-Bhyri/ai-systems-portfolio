import type { ComponentType } from "react";
import { simulateStream } from "./stream-continuity-model";
import { cacheRoutingStudy } from "./cache-routing-model";
import { overlapStudy } from "./scheduling-overlap-model";
import { GlyphCacheRoute, GlyphChunked, GlyphDraft, GlyphKVSizing, GlyphOverlap, GlyphServingMap } from "./stagecraft/glyphs";

/**
 * The serving-under-load modules, described once: the lab's own navigation and
 * the title show (which needs them before this lab has loaded) both read here.
 */
/** Prefill/decode values come from the calibrated stream model, not a pinned string. */
const gap = (policy: "whole" | "chunked") => simulateStream({ policy, tokenBudget: 16, capacityPages: 24 }).requests[0].maxGapMs!;
export const PRESSURE_GAP = { whole: gap("whole"), chunked: gap("chunked") };
export const OVERLAP = overlapStudy("balanced", 4);
export const CACHE_DELTA = cacheRoutingStudy().delta;
export type ServingKey = "pressure" | "draft" | "cache" | "overlap" | "map" | "glossary";
export const SERVING_RAIL: readonly { key: ServingKey; title: string; term: string; value: string; unit: string; Glyph: ComponentType }[] = [
  { key: "pressure", title: "Prefill / decode scheduling", term: "chunked prefill · per-iteration token budget", value: `${PRESSURE_GAP.whole.toFixed(0)} → ${PRESSURE_GAP.chunked.toFixed(1)} ms`, unit: "worst token gap in request 1's stream", Glyph: GlyphChunked },
  { key: "draft", title: "Speculative decoding", term: "draft model guesses · target model verifies", value: "12 → 3", unit: "serial target-model calls", Glyph: GlyphDraft },
  { key: "cache", title: "Cache-aware routing", term: "warm prefix vs. memory pressure", value: `−${CACHE_DELTA} ms`, unit: "first token on the warm replica", Glyph: GlyphCacheRoute },
  { key: "overlap", title: "CPU / GPU overlap", term: "host prepares step n+1 during step n", value: `${OVERLAP.baseline.finish} → ${OVERLAP.overlapped.finish} ms`, unit: "four decode steps, two streams", Glyph: GlyphOverlap },
  { key: "map", title: "Serving system overview", term: "requests A–D on one serving clock", value: "10", unit: "mechanisms on one serving clock", Glyph: GlyphServingMap },
  { key: "glossary", title: "Serving glossary", term: "SSE · KV sizing · PagedAttention · …", value: "9", unit: "serving terms, each linked to the microscope", Glyph: GlyphKVSizing },
];
