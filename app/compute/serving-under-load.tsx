"use client";

import { lazy, Suspense, useEffect, useId, useRef, useState } from "react";
import { ServingLoadOverview } from "./serving-load-overview";
import { ServingPressureFilm } from "./serving-pressure-film";
import type { StreamInspectorInitial } from "./stream-continuity";
import { RetainedLabPanel } from "./retained-lab-panel";
import "./serving-under-load.css";
import "./stagecraft/stagecraft.css";
import "./stagecraft/plates.css";
import "./stagecraft/quiet.css";
import type { ReelItem } from "./stagecraft/reel";
import { ModuleBar, type RailItem } from "./stagecraft/side-rail";
import { ExplorationReel } from "./stagecraft/reel";
import { useLabNav } from "./stagecraft/lab-nav";
import { GlossaryBoard } from "./stagecraft/glossary-board";
import { useStageHold } from "./stagecraft/stage-hold";
import { ModuleArc } from "./stagecraft/module-arc";
import { PRESSURE_ARC } from "./arc-scenes/pressure-arc";
import { createPortal } from "react-dom";
import { useSlot } from "./stagecraft/use-slot";
import { DraftFilm } from "./stagecraft/draft-film";
import { GhostCursor, type CursorStep } from "./stagecraft/ghost-cursor";

/* Each investigation's own switches, performed: the counterexample is one click away, so show it. */
const DEMOS: Record<string, readonly CursorStep[]> = {
  pressure: [
    { target: ".sp-controls label:nth-of-type(2) select", action: "select", value: "12", label: "Smaller KV pool", hold: 7000 },
    { target: ".sp-controls label:nth-of-type(2) select", action: "select", value: "24", label: "Back to 24 pages", hold: 6000 },
  ],
  draftSwitch: [
    { target: ".df-switch button:nth-of-type(2)", label: "Round by round", hold: 600 },
  ],
  draft: [
    { target: "[aria-label='Draft agreement'] button:nth-of-type(2)", label: "Every guess right", hold: 6500 },
    { target: "[aria-label='Draft agreement'] button:nth-of-type(3)", label: "Every guess wrong", hold: 6500 },
    { target: "[aria-label='Draft agreement'] button:nth-of-type(1)", label: "Partial match", hold: 5000 },
  ],
  cache: [
    { target: "[aria-label='Prefix on replica A'] button:nth-of-type(2)", label: "Prefix evicted", hold: 7000 },
    { target: "[aria-label='Prefix on replica A'] button:nth-of-type(1)", label: "Prefix ready", hold: 6000 },
  ],
  overlap: [
    { target: ".so-controls button:nth-of-type(2)", label: "Slower CPU", hold: 7000 },
    { target: ".so-controls button:nth-of-type(3)", label: "No CPU overhead", hold: 7000 },
    { target: ".so-controls button:nth-of-type(1)", label: "Balanced host", hold: 5000 },
  ],
};
import { SERVING_RAIL, type ServingKey } from "./serving-rail-meta";
import { FigAutoscale, FigBatching, FigEngines, FigFlash, FigKVSizing, FigObserve, FigPaged, FigQuant, FigSSE } from "./stagecraft/glossary-figures";

/* Serving terms each get one silhouette and one number; values come from the
   lab's own model or from Qwen3-4B arithmetic (36 layers, 8 KV heads × 128). */
const microscope = (step: number) => () => window.dispatchEvent(new CustomEvent("cx:microscope", { detail: { chapter: "inference", step } }));
const IN_MICROSCOPE = "In the microscope ↗";
const GLOSSARY: ReelItem[] = [
  { key: "sse", title: "Streaming over SSE", term: "one event per token", value: "0", unit: "pages held after a disconnect", Glyph: FigSSE, onOpen: microscope(7), openLabel: IN_MICROSCOPE },
  { key: "kv", title: "KV cache sizing", term: "2 × 36 layers × 8 KV heads × 128 × 2 B", value: "144 KiB", unit: "per token · 12 users at 32k on 80 GB", Glyph: FigKVSizing },
  { key: "paged", title: "PagedAttention", term: "16-token pages · block table", value: "≤ 15", unit: "tokens wasted per sequence", Glyph: FigPaged, onOpen: microscope(1), openLabel: IN_MICROSCOPE },
  { key: "flash", title: "FlashAttention", term: "tiled · online softmax", value: "0", unit: "N × N score writes to HBM", Glyph: FigFlash, onOpen: microscope(2), openLabel: IN_MICROSCOPE },
  { key: "batch", title: "Continuous batching", term: "admit at every iteration", value: "11.65 → 0", unit: "worker-s idle with work waiting", Glyph: FigBatching, onOpen: microscope(0), openLabel: IN_MICROSCOPE },
  { key: "quant", title: "Quantization", term: "FP8 · INT4 AWQ", value: "8.04 → 2.01", unit: "GB of weights per decode step", Glyph: FigQuant, onOpen: microscope(3), openLabel: IN_MICROSCOPE },
  { key: "observe", title: "Observability", term: "time to first token · worst token gap · prefix hits", value: "93.8%", unit: "prefix hit · 90 of 96", Glyph: FigObserve, onOpen: microscope(6), openLabel: IN_MICROSCOPE },
  { key: "engines", title: "vLLM · TRT-LLM · SGLang", term: "paged KV · compiled FP8 · radix prefix tree", Glyph: FigEngines, onOpen: microscope(2), openLabel: IN_MICROSCOPE },
  { key: "scale", title: "GPU autoscaling", term: "scale on queue depth · warm pool", Glyph: FigAutoscale, onOpen: microscope(7), openLabel: IN_MICROSCOPE },
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
  const [view, setView] = useState<"pressure" | "loop" | "continuity" | "glossary">(
    "pressure",
  );
  const [draftDetail, setDraftDetail] = useState(false);
  const railSlot = useSlot("inference-serving-rail");
  const labNav = useLabNav();
  // Deep links (#inference-study/draft) arrive as an event from the laboratory.
  const railRef = useRef<readonly RailItem[]>([]);
  useEffect(() => {
    const open = (e: Event) => railRef.current.find((item) => item.key === (e as CustomEvent<string>).detail)?.onOpen();
    window.addEventListener("lab:serving-open", open);
    return () => window.removeEventListener("lab:serving-open", open);
  }, []);
  const [explorer, setExplorer] = useState<
    "map" | "draft" | "cache" | "overlap"
  >("map");
  const [inspection, setInspection] = useState<{
    initial?: StreamInspectorInitial;
    revision: number;
  }>({ revision: 0 });
  const root = useRef<HTMLDivElement>(null);
  const pressureHost = useRef<HTMLDivElement>(null), draftHost = useRef<HTMLDivElement>(null), draftSwitchHost = useRef<HTMLDivElement>(null),
    cacheHost = useRef<HTMLDivElement>(null), overlapHost = useRef<HTMLDivElement>(null);
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
  const show = (next: "pressure" | "loop" | "continuity" | "glossary", ex?: typeof explorer) => {
    setOrigin(null);
    if (ex) setExplorer(ex);
    if (next === "continuity") openContinuity();
    else setView(next);
  };
  const isCurrent = (key: ServingKey) =>
    key === "pressure" ? view === "pressure" || view === "continuity" : key === "glossary" ? view === "glossary" : view === "loop" && explorer === key;
  const openKey = (key: ServingKey) => (key === "pressure" || key === "glossary" ? show(key) : show("loop", key));
  const railItems: RailItem[] = SERVING_RAIL.map((m) => ({ ...m, onOpen: () => openKey(m.key), current: isCurrent(m.key) }));
  useEffect(() => { railRef.current = railItems; });
  useStageHold(root, `${view}|${explorer}`);
  // The title show follows whichever serving module is on the stage.
  const currentKey = view === "pressure" || view === "continuity" ? "pressure" : view === "glossary" ? "glossary" : explorer;
  useEffect(() => { window.dispatchEvent(new CustomEvent("lab:serving-current", { detail: currentKey })); }, [currentKey]);
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
        <ModuleArc active={view === "pressure"} {...PRESSURE_ARC}>
          <div ref={pressureHost} className="gc-host">
            <GhostCursor root={pressureHost} script={DEMOS.pressure} enabled={view === "pressure"} startDelay={38000} />
            <ServingPressureFilm
              onInspectTrace={(initial) => openContinuity(true, initial)}
            />
          </div>
        </ModuleArc>
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
            <div ref={draftSwitchHost} className="gc-host">
              {/* After two loops of the agents film, the cursor opens the accounting view. */}
              <GhostCursor root={draftSwitchHost} script={DEMOS.draftSwitch} enabled={view === "loop" && explorer === "draft" && !draftDetail} startDelay={36000} />
              <div className="df-switch" role="group" aria-label="Speculative decoding view">
                <button type="button" aria-pressed={!draftDetail} onClick={() => setDraftDetail(false)}>Draft and target, as agents</button>
                <button type="button" aria-pressed={draftDetail} onClick={() => setDraftDetail(true)}>Round-by-round accounting</button>
              </div>
              {!draftDetail && <DraftFilm active={view === "loop" && explorer === "draft" && !draftDetail} />}
            </div>
            <div ref={draftHost} className="gc-host" hidden={!draftDetail}>
              <GhostCursor root={draftHost} script={DEMOS.draft} enabled={view === "loop" && explorer === "draft" && draftDetail} startDelay={9000} />
              <DraftVerification
                active={view === "loop" && explorer === "draft" && draftDetail}
              />
            </div>
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
            <div ref={cacheHost} className="gc-host">
              <GhostCursor root={cacheHost} script={DEMOS.cache} enabled={view === "loop" && explorer === "cache"} startDelay={46000} />
              <CacheRouting active={view === "loop" && explorer === "cache"} />
            </div>
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
            <div ref={overlapHost} className="gc-host">
              <GhostCursor root={overlapHost} script={DEMOS.overlap} enabled={view === "loop" && explorer === "overlap"} startDelay={30000} />
              <SchedulingOverlap
                active={view === "loop" && explorer === "overlap"}
              />
            </div>
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
      <RetainedLabPanel active={view === "glossary"} id={`${id}-glossary`} label="Serving glossary">
        <GlossaryBoard items={GLOSSARY.map((g) => (g.key === "kv" ? { ...g, onOpen: () => show("loop", "cache"), openLabel: "Open the KV capacity study ↗" } : g))} />
      </RetainedLabPanel>
      {railSlot && createPortal(labNav === "bar"
        ? <ModuleBar label="Serving under load" items={railItems} />
        : <ExplorationReel
            label={labNav === "side" ? "Go deeper" : "Go deeper · serving under load"}
            items={railItems}
            orientation={labNav === "side" ? "column" : "row"}
            compact={labNav === "dock"}
            note="Hover to hold · click to put it on the stage"
          />, railSlot)}
    </div>
  );
}
