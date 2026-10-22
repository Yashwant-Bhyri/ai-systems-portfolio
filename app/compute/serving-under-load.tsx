"use client";

import { lazy, Suspense, useRef, useState } from "react";
import { ServingLoadOverview } from "./serving-load-overview";
import { ServingPressureFilm } from "./serving-pressure-film";
import type { StreamInspectorInitial } from "./stream-continuity";
import "./serving-under-load.css";

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
  const [view, setView] = useState<"pressure" | "loop" | "continuity">(
    "pressure",
  );
  const [opened, setOpened] = useState(false);
  const [explorer, setExplorer] = useState<
    "map" | "draft" | "cache" | "overlap"
  >("draft");
  const [draftOpened, setDraftOpened] = useState(false);
  const [cacheOpened, setCacheOpened] = useState(false);
  const [overlapOpened, setOverlapOpened] = useState(false);
  const [inspection, setInspection] = useState<{
    initial?: StreamInspectorInitial;
    revision: number;
  }>({ revision: 0 });
  const root = useRef<HTMLDivElement>(null);
  const continuityButton = useRef<HTMLButtonElement>(null);
  const openContinuity = (
    fromDiagram = false,
    initial?: StreamInspectorInitial,
  ) => {
    if (initial)
      setInspection((old) => ({ initial, revision: old.revision + 1 }));
    setOpened(true);
    setView("continuity");
    if (fromDiagram)
      requestAnimationFrame(() => {
        continuityButton.current?.focus({ preventScroll: true });
        root.current?.scrollIntoView({ block: "start", behavior: "instant" });
      });
  };
  return (
    <div className="sul-root" ref={root}>
      <div
        className="sul-nav"
        role="group"
        aria-label="Serving investigation depth"
      >
        <button
          type="button"
          aria-pressed={view === "pressure"}
          onClick={() => setView("pressure")}
        >
          <strong>Prefill/decode scheduling</strong>
          <small>Watch the comparison</small>
        </button>
        <button
          type="button"
          aria-pressed={view === "loop"}
          onClick={() => {
            setDraftOpened(true);
            setView("loop");
          }}
        >
          <strong>Explore the serving system</strong>
          <small>Routing, verification & execution</small>
        </button>
        <button
          ref={continuityButton}
          type="button"
          aria-pressed={view === "continuity"}
          onClick={() => openContinuity()}
        >
          <strong>Inspect token continuity</strong>
          <small>Adjust memory & token budget</small>
        </button>
      </div>
      <div hidden={view !== "pressure"}>
        <ServingPressureFilm
          onInspectTrace={(initial) => openContinuity(true, initial)}
        />
      </div>
      <div hidden={view !== "loop"}>
        <div
          className="sul-explorer-nav"
          role="group"
          aria-label="Serving mechanisms"
        >
          <span>Investigate a mechanism</span>
          <button
            type="button"
            aria-pressed={explorer === "draft"}
            onClick={() => {
              setDraftOpened(true);
              setExplorer("draft");
            }}
          >
            Speculative draft / verify
          </button>
          <button
            type="button"
            aria-pressed={explorer === "cache"}
            onClick={() => {
              setCacheOpened(true);
              setExplorer("cache");
            }}
          >
            KV capacity & routing
          </button>
          <button
            type="button"
            aria-pressed={explorer === "overlap"}
            onClick={() => {
              setOverlapOpened(true);
              setExplorer("overlap");
            }}
          >
            CPU/GPU scheduling overlap
          </button>
          <button
            type="button"
            aria-pressed={explorer === "map"}
            onClick={() => setExplorer("map")}
          >
            Serving system overview
          </button>
        </div>
        {draftOpened && (
          <div hidden={explorer !== "draft"}>
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
          </div>
        )}
        {cacheOpened && (
          <div hidden={explorer !== "cache"}>
            <Suspense
              fallback={
                <p className="ip-loading" role="status">
                  Opening cache-aware routing…
                </p>
              }
            >
              <CacheRouting active={view === "loop" && explorer === "cache"} />
            </Suspense>
          </div>
        )}
        {overlapOpened && (
          <div hidden={explorer !== "overlap"}>
            <Suspense
              fallback={
                <p className="ip-loading" role="status">
                  Opening CPU/GPU scheduling…
                </p>
              }
            >
              <SchedulingOverlap
                active={view === "loop" && explorer === "overlap"}
                onBack={() => setExplorer("map")}
              />
            </Suspense>
          </div>
        )}
        <div hidden={explorer !== "map"}>
          <ServingLoadOverview
            active={view === "loop" && explorer === "map"}
            onOpenOverlap={() => {
              setOverlapOpened(true);
              setExplorer("overlap");
            }}
            onOpenContinuity={() => openContinuity(true)}
            onOpenDraft={() => {
              setDraftOpened(true);
              setExplorer("draft");
            }}
            onOpenCache={() => {
              setCacheOpened(true);
              setExplorer("cache");
            }}
          />
        </div>
      </div>
      {opened && (
        <div hidden={view !== "continuity"}>
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
        </div>
      )}
    </div>
  );
}
