"use client";

import { lazy, Suspense, useId, useRef, useState } from "react";
import { ServingLoadOverview } from "./serving-load-overview";
import { ServingPressureFilm } from "./serving-pressure-film";
import type { StreamInspectorInitial } from "./stream-continuity";
import { RetainedLabPanel } from "./retained-lab-panel";
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
    </div>
  );
}
