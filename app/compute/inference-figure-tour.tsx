"use client";

import {
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  type ReactNode,
  type Ref,
} from "react";
import { CompositionExplorer } from "./composition-explorer";
import { RequestReplayExplorer } from "./request-replay-explorer";
import { LoadLatencyExplorer } from "./load-latency-explorer";
import { labComposition, type LabRun } from "./lab-simulation";
import {
  FIGURE_TOUR_CHAPTERS,
  FIGURE_TOUR_MS,
  figureChapterTime,
  inferenceFigureFrame,
} from "./inference-figure-tour-model";
import type {
  InferenceFigureContext,
  InferenceFigureHandoff,
  InferenceFigureSelection,
} from "./explorer-state";
import { useStudyPlayback } from "./use-study-playback";
import { useFilmTime } from "./use-film-time";
import { compositionMoment } from "./composition-comparison";
import "./inference-figure-tour.css";

export type InferenceTourHandle = { resume: () => void };

export function InferenceFigureTour({
  context,
  initialTime,
  onInspect,
  evidence,
  ref: handleRef,
}: {
  ref?: Ref<InferenceTourHandle>;
  context: InferenceFigureContext;
  initialTime?: number;
  onInspect: (handoff: InferenceFigureHandoff) => void;
  evidence: (run: LabRun, pause: () => void) => ReactNode;
}) {
  const { ref, ...player } = useStudyPlayback(1, 0, {
    finite: true,
    interval: FIGURE_TOUR_MS,
    initialTime,
  });
  const film = useFilmTime(
    player.readTime,
    player.running,
    player.reduced,
    FIGURE_TOUR_MS,
    player.seek,
    initialTime,
  );
  const frame = inferenceFigureFrame(film.time, context);
  const selection = frame.selection;
  const rail = useRef<HTMLElement>(null),
    id = useId();
  const points = useMemo(
    () => labComposition(context.workload, context.budget),
    [context.workload, context.budget],
  );
  const baseline = points[context.policy === 0 ? 0 : 2],
    optimized = points[context.policy === 0 ? 1 : 3];
  const inspect = (next: InferenceFigureSelection = selection) => {
    player.pause();
    onInspect({ ...context, time: frame.cursor, selection: next });
  };
  const replay = () => {
    film.seek(0);
    player.replay();
  };
  useImperativeHandle(handleRef, () => ({
    resume: () => {
      if (player.reduced) return;
      if (film.time >= FIGURE_TOUR_MS) replay();
      else player.resume();
    },
  }));
  useEffect(() => {
    const node = rail.current,
      current = node?.querySelector<HTMLElement>('[aria-current="step"]');
    if (node && current && node.scrollWidth > node.clientWidth)
      node.scrollTo({
        left: current.offsetLeft - (node.clientWidth - current.offsetWidth) / 2,
        behavior: player.reduced ? "instant" : "smooth",
      });
  }, [frame.chapterIndex, player.reduced]);

  return (
    <article
      ref={ref}
      className="ift-tour"
      aria-labelledby={`${id}-title`}
      data-chapter={frame.chapterIndex}
      data-running={player.running}
      onKeyDown={(event) => {
        if (
          event.key === "Escape" &&
          !(event.target as HTMLElement).closest("dialog")
        )
          player.pause();
      }}
    >
      <header className="ift-heading">
        <div>
          <span>
            {selection.view === 1
              ? "One request → its execution work"
              : selection.view === 2
                ? "The same workload → its waiting line"
                : "Four conditions → two optimization effects"}
          </span>
          <h3 id={`${id}-title`}>{frame.chapter.name}</h3>
        </div>
        <button type="button" className="ift-inspect" onClick={() => inspect()}>
          Inspect this moment ↗
        </button>
      </header>
      <nav
        ref={rail}
        className="ift-chapters"
        aria-label="Inference figure tour chapters"
      >
        {FIGURE_TOUR_CHAPTERS.map((chapter, index) => (
          <button
            key={chapter.name}
            type="button"
            aria-current={index === frame.chapterIndex ? "step" : undefined}
            onClick={() => film.seek(figureChapterTime(index, player.reduced))}
          >
            <span>{chapter.name}</span>
            <i aria-hidden="true">
              <b
                style={{
                  transform: `scaleX(${Math.max(0, Math.min(1, (frame.cursor - chapter.start) / (chapter.end - chapter.start)))})`,
                }}
              />
            </i>
          </button>
        ))}
      </nav>
      <div className="ift-context">
        <span>
          96 matched tasks ·{" "}
          {context.workload === "shared-prefix"
            ? "shared-prefix burst"
            : "interactive arrivals"}
        </span>
        <span>
          {selection.view === 0 && selection.state.lens !== "runtime"
            ? "Base ↔ post-trained"
            : context.policy
              ? "RL checkpoint"
              : "Base checkpoint"}{" "}
          · {context.budget}× thought
        </span>
      </div>
      <div
        className="ift-stage"
        onPointerDown={player.pause}
        onFocusCapture={player.pause}
      >
        {selection.view === 1 ? (
          <RequestReplayExplorer
            baseline={baseline}
            onPolicy={() => inspect()}
            evidence={evidence}
            presentation={{
              time: frame.localTime,
              pause: player.pause,
              inspect: (state) => inspect({ view: 1, state }),
            }}
          />
        ) : selection.view === 2 ? (
          <LoadLatencyExplorer
            baseline={baseline}
            optimized={optimized}
            onPolicy={() => inspect()}
            evidence={evidence}
            presentation={{
              time: frame.localTime,
              pause: player.pause,
              inspect: (state) => inspect({ view: 2, state }),
            }}
          />
        ) : (
          <CompositionExplorer
            points={points}
            selected={selection.selected}
            evidence={evidence}
            onSelect={(selected) =>
              inspect({
                view: 0,
                selected,
                state: {
                  ...selection.state,
                  phase: 4,
                  time: compositionMoment(4),
                },
              })
            }
            presentation={{
              time: frame.localTime,
              state: selection.state,
              pause: player.pause,
              inspect: (state) => inspect({ ...selection, state }),
            }}
          />
        )}
      </div>
      <footer className="ift-transport">
        <button
          type="button"
          disabled={player.reduced}
          aria-label={
            player.running
              ? "Pause inference figure tour"
              : "Play inference figure tour"
          }
          onClick={() =>
            player.running
              ? player.pause()
              : film.time >= FIGURE_TOUR_MS
                ? replay()
                : player.toggle()
          }
        >
          {player.running ? "Ⅱ" : "▷"}
        </button>
        <input
          type="range"
          min={0}
          max={FIGURE_TOUR_MS}
          step={10}
          value={film.time}
          aria-label="Scrub the inference figure tour"
          onChange={(event) => film.seek(Number(event.target.value))}
        />
        <time>
          {(film.time / 1000).toFixed(1)} / {FIGURE_TOUR_MS / 1000} s
        </time>
        <button
          type="button"
          onClick={() =>
            player.reduced ? film.seek(figureChapterTime(0, true)) : replay()
          }
        >
          ↺ Restart
        </button>
      </footer>
      <p className="ift-status">
        {player.reduced
          ? "Reduced motion: choose a chapter or scrub to inspect."
          : player.running
            ? "Playing · select any chapter to hold it"
            : film.time >= FIGURE_TOUR_MS
              ? "Tour complete · inspect either optimization effect"
              : "Paused · resume or inspect this moment"}
      </p>
    </article>
  );
}
