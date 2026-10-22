"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { CompositionPlot } from "./result-plots";
import {
  CapabilityShiftPlot,
  ExecutionReplayPlot,
  LabScalingPlot,
  RegressionAuditPlot,
  TailLatencyPlot,
} from "./lab-result-plots";
import {
  labComposition,
  simulateLab,
  POLICIES,
  type LabRun,
} from "./lab-simulation";
import { useStudyPlayback } from "./use-study-playback";
import {
  INFERENCE_FIGURE_STORY,
  TRAINING_FIGURE_STORY,
  type FigureBeat,
} from "./figure-story-data";
import "./figure-presentation.css";

const DURATIONS = [3200, 8000, 4200] as const;
export function FigurePresentation({
  training,
  onExit,
  evidence,
}: {
  training: boolean;
  onExit: (beat: FigureBeat, task?: number) => void;
  evidence: (run: LabRun, pause: () => void) => ReactNode;
}) {
  const beats = training ? TRAINING_FIGURE_STORY : INFERENCE_FIGURE_STORY;
  const { ref, ...player } = useStudyPlayback(beats.length * 3, 0, {
    finite: true,
    durations: DURATIONS,
  });
  const index = Math.floor(player.step / 3),
    phase = player.step % 3,
    beat = beats[index],
    id = useId();
  const playButton = useRef<HTMLButtonElement>(null);
  const chapterRail = useRef<HTMLElement>(null);
  useEffect(() => {
    const rail = chapterRail.current;
    const current = rail?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!rail || !current || rail.scrollWidth <= rail.clientWidth) return;
    rail.scrollTo({
      left: current.offsetLeft - (rail.clientWidth - current.offsetWidth) / 2,
      behavior: player.reduced ? "instant" : "smooth",
    });
  }, [index, player.reduced]);
  const points = labComposition(beat.workload, beat.budget);
  const run = training
    ? simulateLab(beat.policy, beat.budget)
    : points[beat.policy];
  const base = training
    ? simulateLab(0, beat.budget)
    : simulateLab(run.policyIndex, beat.budget, false, beat.workload);
  const optimized = simulateLab(
    run.policyIndex,
    beat.budget,
    true,
    beat.workload,
  );
  const jump = (i: number) => {
    player.select(i * 3);
    player.resume();
  };
  const dismiss = () => {
    playButton.current?.focus();
    player.select(index * 3 + 2);
    player.resume();
  };
  const toggle = () => {
    if (player.finished) player.replay();
    else player.toggle();
  };
  const exit = () => onExit(beat);
  return (
    <article
      ref={ref}
      className="fp-presentation"
      data-running={player.running}
      data-phase={phase}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          if (phase === 1) dismiss();
          else player.pause();
        }
      }}
    >
      <header className="fp-header">
        <div>
          <span>
            FIGURE STORY · {String(index + 1).padStart(2, "0")} / {beats.length}
          </span>
          <h3>{beat.name}</h3>
        </div>
        <button type="button" onClick={exit}>
          Exit to free exploration ↗
        </button>
      </header>
      <nav
        ref={chapterRail}
        className="fp-beats"
        aria-label="Figure story chapters"
      >
        {beats.map((b, i) => (
          <button
            type="button"
            key={b.name}
            aria-label={`Figure chapter ${i + 1}: ${b.name}`}
            aria-current={i === index ? "step" : undefined}
            onClick={() => jump(i)}
          >
            <i />
            <span>{b.name}</span>
          </button>
        ))}
      </nav>
      <p className="fp-scroll-hint">
        Swipe the figure to follow its full range ↔
      </p>
      <div className="fp-chart-stage">
        <div
          className="fp-plot-scroll"
          tabIndex={0}
          role="region"
          inert={phase === 1 && !player.reduced}
          onFocusCapture={player.pause}
          onPointerDown={player.pause}
          aria-label="Narrated figure, horizontally scrollable on narrow screens"
        >
          <div className="fp-plot" key={beat.view}>
            {training ? (
              beat.view === 0 ? (
                <CapabilityShiftPlot
                  before={base}
                  after={run}
                  selectedTask={-1}
                  onTask={(task) => onExit(beat, task)}
                />
              ) : beat.view === 1 ? (
                <LabScalingPlot
                  policy={beat.policy}
                  budget={beat.budget}
                  onSelect={(policy, budget) =>
                    onExit({ ...beat, policy, budget })
                  }
                />
              ) : (
                <RegressionAuditPlot before={base} after={run} />
              )
            ) : beat.view === 0 ? (
              <CompositionPlot
                points={points}
                selected={beat.policy}
                beat={beat.policy >= 2 ? 2 : 0}
                onSelect={(policy) => onExit({ ...beat, policy })}
              />
            ) : beat.view === 1 ? (
              <ExecutionReplayPlot baseline={base} optimized={optimized} />
            ) : (
              <TailLatencyPlot baseline={base} optimized={optimized} />
            )}
          </div>
        </div>
        <div
          className="fp-explanation"
          data-open={phase === 1}
          aria-hidden={phase !== 1}
          inert={phase !== 1}
        >
          <section
            aria-labelledby={`${id}-title`}
            className="fp-focus-card"
            onFocusCapture={player.pause}
            onPointerEnter={player.pause}
          >
            <div className="fp-focus-top">
              <span>THE MECHANISM → THE EXPERIENCE</span>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Return to the figure"
              >
                ✕
              </button>
            </div>
            <h4 id={`${id}-title`}>{beat.title}</h4>
            <div className="fp-two-lenses">
              <div>
                <span>Inside the system</span>
                <p>{beat.mechanism}</p>
              </div>
              <div>
                <span>For the person asking</span>
                <p>{beat.behavior}</p>
              </div>
            </div>
            <button type="button" className="fp-hold" onClick={dismiss}>
              ▷ Return to the figure
            </button>
          </section>
        </div>
        <div className="fp-focus-caption" aria-live="off">
          <i />
          {beat.focus}
        </div>
      </div>
      <div className="fp-result-strip">
        <span>
          {training
            ? POLICIES[run.policyIndex].name
            : points[beat.policy].label}{" "}
          · {beat.budget}× cap
        </span>
        <strong>
          {run.accuracy.toFixed(1)}% <small>task accuracy</small>
        </strong>
        <strong>
          {run.correctCost!.toFixed(2)} <small>GPU-s / correct</small>
        </strong>
        <strong>
          {run.p95.toFixed(1)} s <small>p95, with queue</small>
        </strong>
      </div>
      <footer className="fp-controls">
        <div>
          <button
            type="button"
            disabled={index === 0}
            onClick={() => jump(index - 1)}
            aria-label="Previous figure chapter"
          >
            ←
          </button>
          <button
            ref={playButton}
            type="button"
            disabled={player.reduced}
            onClick={toggle}
          >
            {player.reduced
              ? "Reduced motion"
              : player.playing
                ? "Ⅱ Pause figure story"
                : player.finished
                  ? "▷ Watch figure story again"
                  : "▷ Play figure story"}
          </button>
          <button
            type="button"
            disabled={index === beats.length - 1}
            onClick={() => jump(index + 1)}
            aria-label="Next figure chapter"
          >
            →
          </button>
          <button type="button" onClick={player.replay}>
            ↺ Replay
          </button>
        </div>
        <div className="fp-phase-label" role="status">
          {
            [
              "01 Reveal the change",
              "02 Explain the mechanism",
              "03 Compare the consequence",
            ][phase]
          }
        </div>
        {evidence(run, player.pause)}
      </footer>
      {player.reduced && (
        <div className="fp-reduced-note">
          <strong>{beat.title}</strong>
          <p>
            {beat.mechanism} {beat.behavior}
          </p>
        </div>
      )}
    </article>
  );
}
