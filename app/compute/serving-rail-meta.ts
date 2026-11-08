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
export const CACHE = cacheRoutingStudy();
export const CACHE_DELTA = CACHE.delta;
export type ServingKey = "pressure" | "draft" | "cache" | "overlap" | "map" | "glossary";
export const SERVING_RAIL: readonly { key: ServingKey; title: string; term: string; value: string; unit: string; Glyph: ComponentType }[] = [
  { key: "pressure", title: "Long prompts, no stalls", term: "Chunked prefill", value: `${PRESSURE_GAP.whole.toFixed(1)} → ${PRESSURE_GAP.chunked.toFixed(1)} ms`, unit: "worst pause in request 1's answer", Glyph: GlyphChunked },
  { key: "draft", title: "A draft model writes ahead", term: "Speculative decoding", value: "12 → 3", unit: "serial target-model calls", Glyph: GlyphDraft },
  { key: "cache", title: "Go where the prompt is cached", term: "Cache-aware routing", value: `${CACHE.cold.firstToken} → ${CACHE.warm.firstToken} ms`, unit: "to the first token, warm replica", Glyph: GlyphCacheRoute },
  { key: "overlap", title: "No idle GPU between steps", term: "CPU/GPU overlap", value: `${OVERLAP.baseline.finish} → ${OVERLAP.overlapped.finish} ms`, unit: "four decode steps, two streams", Glyph: GlyphOverlap },
  { key: "map", title: "The whole serving path", term: "System map", value: "10", unit: "mechanisms on one serving clock", Glyph: GlyphServingMap },
  { key: "glossary", title: "Serving vocabulary", term: "Serving glossary", value: "9", unit: "serving terms, each linked to the microscope", Glyph: GlyphKVSizing },
];
