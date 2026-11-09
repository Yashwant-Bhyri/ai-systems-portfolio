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
/** Before the Summary only percentages are shown; the raw values live inside each module. */
export const less = (from: number, to: number) => `−${Math.round(100 * (1 - to / from))}%`;
export type ServingKey = "pressure" | "draft" | "cache" | "overlap" | "map" | "glossary";
export const SERVING_RAIL: readonly { key: ServingKey; title: string; term: string; value: string; unit: string; Glyph: ComponentType }[] = [
  { key: "pressure", title: "Chunked prefill", term: "Long prompts, no stalls", value: less(PRESSURE_GAP.whole, PRESSURE_GAP.chunked), unit: "worst pause in a streaming answer", Glyph: GlyphChunked },
  { key: "draft", title: "Speculative decoding", term: "A draft model writes ahead", value: less(12, 3), unit: "serial target-model calls", Glyph: GlyphDraft },
  { key: "cache", title: "Cache-aware routing", term: "Go where the prompt is cached", value: less(CACHE.cold.firstToken, CACHE.warm.firstToken), unit: "time to the first token", Glyph: GlyphCacheRoute },
  { key: "overlap", title: "CPU/GPU overlap", term: "No idle GPU between steps", value: less(OVERLAP.baseline.finish, OVERLAP.overlapped.finish), unit: "time for four decode steps", Glyph: GlyphOverlap },
  { key: "map", title: "System map", term: "The whole serving path", value: "10", unit: "mechanisms on one serving clock", Glyph: GlyphServingMap },
  { key: "glossary", title: "System glossary", term: "Every serving component", value: "9", unit: "serving terms, each linked to the microscope", Glyph: GlyphKVSizing },
];
