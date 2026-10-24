"use client";

import { lazy, Suspense, useId, useRef, useState } from "react";
import { ServingLoadOverview } from "./serving-load-overview";
import { ServingPressureFilm } from "./serving-pressure-film";
import type { StreamInspectorInitial } from "./stream-continuity";
import { RetainedLabPanel } from "./retained-lab-panel";
import "./serving-under-load.css";
import "./stagecraft/stagecraft.css";
import "./stagecraft/plates.css";
import { ExplorationReel, type ReelItem } from "./stagecraft/reel";
import {
  GlyphAutoscale, GlyphBatching, GlyphCacheRoute, GlyphChunked, GlyphContinuity, GlyphDraft,
  GlyphEngines, GlyphFlash, GlyphKVSizing, GlyphObserve, GlyphOverlap, GlyphPaged, GlyphQuant,
  GlyphSSE, GlyphServingMap,
} from "./stagecraft/glyphs";

/* Serving terms each get one silhouette and one number; values come from the
   lab's own model or from Qwen3-4B arithmetic (36 layers, 8 KV heads × 128). */
const GLOSSARY: ReelItem[] = [
  { key: "sse", title: "Streaming over SSE", term: "one event per token", value: "0", unit: "pages held after a disconnect", Glyph: GlyphSSE },
  { key: "kv", title: "KV cache sizing", term: "2 × 36 layers × 8 KV heads × 128 × 2 B", value: "144 KiB", unit: "per token · 12 users at 32k on 80 GB", Glyph: GlyphKVSizing },
  { key: "paged", title: "PagedAttention", term: "16-token pages · block table", value: "≤ 15", unit: "tokens wasted per sequence", Glyph: GlyphPaged },
  { key: "flash", title: "FlashAttention", term: "tiled · online softmax", value: "0", unit: "N × N score writes to HBM", Glyph: GlyphFlash },
  { key: "batch", title: "Continuous batching", term: "admit at every iteration", value: "11.65 → 0", unit: "worker-s idle with work waiting", Glyph: GlyphBatching },
  { key: "quant", title: "Quantization", term: "FP8 · INT4 AWQ", value: "8.04 → 2.01", unit: "GB of weights per decode step", Glyph: GlyphQuant },
  { key: "observe", title: "Observability", term: "TTFT · TPOT · KV util · prefix hit", value: "93.8%", unit: "prefix hit · 90 of 96", Glyph: GlyphObserve },
  { key: "engines", title: "vLLM · TRT-LLM · SGLang", term: "paged KV · compiled FP8 · radix prefix tree", Glyph: GlyphEngines },
  { key: "scale", title: "GPU autoscaling", term: "scale on queue depth · warm pool", value: "61 → 6", unit: "s to serve · cold vs warm replica", Glyph: GlyphAutoscale },
];

const StreamContinuity = lazy(() =>
  import("./stream-continuity").then((module) => ({
    default: module.StreamContinuity,
  })),
);
const DraftVerification = lazy(() =>
  import("./draft-verification").then((module) => ({
    default: module.DraftVerification,
  })),
);
const CacheRouting = lazy(() =>
  import("./cache-routing").then((module) => ({
    default: module.CacheRouting,
  })),
);
const SchedulingOverlap = lazy(() =>
  import("./scheduling-overlap").then((module) => ({
    default: module.SchedulingOverlap,
  })),
);

export function ServingUnderLoad() {
  const id = useId().replaceAll(":", "");
  const [view, setView] = useState<"pressure" | "loop" | "continuity">(
    "pressure",
  );
  const [explorer, setExplorer] = useState<
    "map" | "draft" | "cache" | "overlap"
  >("map");
  const [inspection, setInspection] = useState<{
    initial?: StreamInspectorInitial;
    revision: number;
  }>({ revision: 0 });
  const root = useRef<HTMLDivElement>(null);
  const continuityButton = useRef<HTMLButtonElement>(null);
  const returnButton = useRef<HTMLButtonElement>(null);
  const [origin, setOrigin] = useState<{
    view: "pressure" | "loop";
    explorer: typeof explorer;
    label: string;
  } | null>(null);
  const originElement = useRef<HTMLElement | null>(null);
  const rememberOrigin = () => {
    originElement.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const chapter = root.current?.querySelector(
      '.slo-beats [aria-pressed="true"]',
    )?.textContent;
    setOrigin({
      view: view === "pressure" ? "pressure" : "loop",
      explorer,
      label:
        view === "pressure"
          ? "Prefill/decode scheduling"
          : chapter || "Serving system overview",
    });
    requestAnimationFrame(() =>
      returnButton.current?.focus({ preventScroll: true }),
    );
  };
  const goBack = () => {
    if (!origin) return;
    setView(origin.view);
    setExplorer(origin.explorer);
    setOrigin(null);
    requestAnimationFrame(() => {
      const button = originElement.current;
      if (button?.isConnected) {
        button.focus({ preventScroll: true });
        button.scrollIntoView({ block: "nearest", behavior: "instant" });
      }
    });
  };
  const openContinuity = (
    fromDiagram = false,
    initial?: StreamInspectorInitial,
  ) => {
    if (fromDiagram) rememberOrigin();
    else setOrigin(null);
    if (initial)
      setInspection((old) => ({ initial, revision: old.revision + 1 }));
    setView("continuity");
    if (fromDiagram)
      requestAnimationFrame(() => {
        returnButton.current?.focus({ preventScroll: true });
        returnButton.current?.scrollIntoView({
          block: "nearest",
          behavior: "instant",
        });
      });
  };
  const show = (next: "pressure" | "loop" | "continuity", ex?: typeof explorer) => {
    setOrigin(null);
    if (ex) setExplorer(ex);
    if (next === "continuity") openContinuity();
    else setView(next);
    requestAnimationFrame(() => root.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const investigations: ReelItem[] = [
    { key: "pressure", title: "Prefill / decode scheduling", term: "chunked prefill keeps streams alive", value: "56 → 10.25", unit: "ms longest token gap", Glyph: GlyphChunked, onOpen: () => show("pressure"), current: view === "pressure" },
    { key: "map", title: "Serving system overview", term: "A · B · C · D through one loop", value: "11", unit: "mechanisms, one clock", Glyph: GlyphServingMap, onOpen: () => show("loop", "map"), current: view === "loop" && explorer === "map" },
    { key: "draft", title: "Speculative decoding", term: "draft · verify · commit", value: "12 → 3", unit: "target-model calls", Glyph: GlyphDraft, onOpen: () => show("loop", "draft"), current: view === "loop" && explorer === "draft" },
    { key: "cache", title: "Cache-aware routing", term: "warm prefix vs memory pressure", value: "−20", unit: "ms TTFT on the warm route", Glyph: GlyphCacheRoute, onOpen: () => show("loop", "cache"), current: view === "loop" && explorer === "cache" },
    { key: "overlap", title: "CPU / GPU overlap", term: "prepare while the GPU executes", value: "52 → 37", unit: "ms for four decode steps", Glyph: GlyphOverlap, onOpen: () => show("loop", "overlap"), current: view === "loop" && explorer === "overlap" },
    { key: "continuity", title: "Token continuity", term: "token budget × memory pool", value: "6", unit: "ms gap when admission holds", Glyph: GlyphContinuity, onOpen: () => show("continuity"), current: view === "continuity" },
  ];
  return (
    <div className="sul-root" ref={root}>
      <div
        hidden
        className="sul-nav"
        role="group"
        aria-label="Serving investigation depth"
      >
        <button
          type="button"
          aria-pressed={view === "pressure"}
          aria-controls={`${id}-pressure`}
          onClick={() => {
            setOrigin(null);
            setView("pressure");
          }}
        >
          <strong>Prefill/decode scheduling</strong>
          <small>Watch the comparison</small>
        </button>
        <button
          type="button"
          aria-pressed={view === "loop"}
          aria-controls={`${id}-loop`}
          onClick={() => {
            setOrigin(null);
            setView("loop");
          }}
        >
          <strong>Explore the serving system</strong>
          <small>Overview + three mechanism close-ups</small>
        </button>
        <button
          ref={continuityButton}
          type="button"
          aria-pressed={view === "continuity"}
          aria-controls={`${id}-continuity`}
          onClick={() => openContinuity()}
        >
          <strong>Inspect token continuity</strong>
          <small>Adjust memory & token budget</small>
        </button>
      </div>
      {origin && (
        <div className="sul-return-path">
          <button type="button" ref={returnButton} onClick={goBack}>
            ← Back to {origin.label}
          </button>
          <span>Continue from the same moment</span>
        </div>
      )}
      <RetainedLabPanel
        active={view === "pressure"}
        id={`${id}-pressure`}
        label="Prefill and decode scheduling"
      >
        <ServingPressureFilm
          onInspectTrace={(initial) => openContinuity(true, initial)}
        />
      </RetainedLabPanel>
      <RetainedLabPanel
        active={view === "loop"}
        id={`${id}-loop`}
        label="Serving system investigations"
      >
        <div
          hidden
          className="sul-explorer-nav"
          role="group"
          aria-label="Serving mechanisms"
        >
          <span>Investigations</span>
          <button
            type="button"
            aria-pressed={explorer === "map"}
            aria-controls={`${id}-overview`}
            onClick={() => {
              setOrigin(null);
              setExplorer("map");
            }}
          >
            <strong>Serving system overview</strong>
            <small>Follow the full request lifecycle</small>
          </button>
          <button
            type="button"
            aria-pressed={explorer === "draft"}
            aria-controls={`${id}-draft`}
            onClick={() => {
              setOrigin(null);
              setExplorer("draft");
            }}
          >
            <strong>Speculative draft / verify</strong>
            <small>Propose, verify, commit</small>
          </button>
          <button
            type="button"
            aria-pressed={explorer === "cache"}
            aria-controls={`${id}-cache`}
            onClick={() => {
              setOrigin(null);
              setExplorer("cache");
            }}
          >
            <strong>KV capacity & routing</strong>
            <small>Reuse versus memory pressure</small>
          </button>
          <button
            type="button"
            aria-pressed={explorer === "overlap"}
            aria-controls={`${id}-overlap`}
            onClick={() => {
              setOrigin(null);
              setExplorer("overlap");
            }}
          >
            <strong>CPU/GPU scheduling overlap</strong>
            <small>Prepare while the GPU executes</small>
          </button>
        </div>
        <RetainedLabPanel
          active={explorer === "draft"}
          id={`${id}-draft`}
          label="Speculative draft verification"
        >
          <Suspense
            fallback={
              <p className="ip-loading" role="status">
                Opening draft verification…
              </p>
            }
          >
            <DraftVerification
              active={view === "loop" && explorer === "draft"}
            />
          </Suspense>
        </RetainedLabPanel>
        <RetainedLabPanel
          active={explorer === "cache"}
          id={`${id}-cache`}
          label="KV capacity and routing"
        >
          <Suspense
            fallback={
              <p className="ip-loading" role="status">
                Opening cache-aware routing…
              </p>
            }
          >
            <CacheRouting active={view === "loop" && explorer === "cache"} />
          </Suspense>
        </RetainedLabPanel>
        <RetainedLabPanel
          active={explorer === "overlap"}
          id={`${id}-overlap`}
          label="CPU and GPU scheduling overlap"
        >
          <Suspense
            fallback={
              <p className="ip-loading" role="status">
                Opening CPU/GPU scheduling…
              </p>
            }
          >
            <SchedulingOverlap
              active={view === "loop" && explorer === "overlap"}
            />
          </Suspense>
        </RetainedLabPanel>
        <RetainedLabPanel
          active={explorer === "map"}
          id={`${id}-overview`}
          label="Serving system overview"
        >
          <ServingLoadOverview
            active={view === "loop" && explorer === "map"}
            onOpenOverlap={() => {
              rememberOrigin();
              setExplorer("overlap");
            }}
            onOpenContinuity={() => openContinuity(true)}
            onOpenDraft={() => {
              rememberOrigin();
              setExplorer("draft");
            }}
            onOpenCache={() => {
              rememberOrigin();
              setExplorer("cache");
            }}
          />
        </RetainedLabPanel>
      </RetainedLabPanel>
      <RetainedLabPanel
        active={view === "continuity"}
        id={`${id}-continuity`}
        label="Token continuity inspector"
      >
        <Suspense
          fallback={
            <p className="ip-loading" role="status">
              Opening the shared-clock comparison…
            </p>
          }
        >
          <StreamContinuity
            key={inspection.revision}
            initial={inspection.initial}
          />
        </Suspense>
      </RetainedLabPanel>
      <ExplorationReel label="Go deeper · serving under load" note="Hover to hold · click to put it on the stage" items={investigations} />
      <ExplorationReel label="Serving glossary" note="Every term, one number" items={GLOSSARY} step={2600} />
    </div>
  );
}
