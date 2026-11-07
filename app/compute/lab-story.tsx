"use client";

import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { FilmInterlude } from "./stagecraft/module-arc";
import { FILM_ARCS } from "./arc-scenes/film-arcs";
import { FLOW_ZOOMS } from "./stagecraft/flow-board";
import { useFreezeMoments, type FreezeMoment } from "./stagecraft/stage-meter";
import { LEARN_ARCS } from "./arc-scenes/learn-arcs";
import { useTr } from "../exhibit/i18n";
import { createPortal } from "react-dom";
import { useSlot } from "./stagecraft/use-slot";
import {
  BUDGETS,
  compareTasks,
  type LabRun,
  type Workload,
} from "./lab-simulation";
import {
  INFERENCE_STORY,
  TRAINING_STORY,
  inferenceStoryRuns,
  trainingStoryRuns,
} from "./lab-story-data";
import {
  AccuracyCostTrail,
  CohortMap,
  taskInspection,
  type Inspection,
} from "./lab-story-scenes";
import { useStudyPlayback } from "./use-study-playback";
import { PolicyFilm } from "./policy-film";
import { FilmTransition } from "./film-transition";
import { TestTimeReveal } from "./test-time-reveal";
import { AdapterReveal } from "./adapter-reveal";
import { ADAPTER_DURATION } from "./adapter-study";
import { ExecutionReveal } from "./execution-reveal";
import { SCHEDULING_DURATION } from "./scheduling-study-math";
import { BASELINE_DURATION } from "./baseline-study";
import { RUNTIME_GAINS_DURATION } from "./runtime-gains-study";
import { PrefixReuseReveal } from "./prefix-reuse-reveal";
import { PREFIX_DURATION } from "./prefix-study-math";
import { EXECUTION_FILM_DURATION as EXECUTION_DURATION } from "./execution-direction";
import { ExhibitScene } from "./stagecraft/exhibit-host";
import { PolicyGrpo } from "../exhibit/policy/grpo";
import { PolicyLean } from "../exhibit/policy/lean";
import { PolicyFrontierStory } from "../exhibit/policy/frontier-story";
import "./lab-story.css";

const SchedulingReveal = lazy(() =>
  import("./scheduling-reveal").then((module) => ({
    default: module.SchedulingReveal,
  })),
);
const BaselineReveal = lazy(() => import("./baseline-reveal").then(module => ({ default: module.BaselineReveal })));
const RuntimeGainsReveal = lazy(() => import("./runtime-gains-reveal").then(module => ({ default: module.RuntimeGainsReveal })));

const ROOM_CHAPTERS = new Set([2, 4, 5]);

/* Each framing scene plays once per visit: going back to a chapter goes straight to the chapter. */
type Interlude = { step: number; kind: "flow" | "mechanism" | "impact" };
const SEEN_FRAMES = new Set<string>();
const fm = (v: number, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
/** Each chapter freezes once on its result. Prefix reuse has its own focus moment. */
function chapterMoments(training: boolean, step: number, duration: number, runs: readonly LabRun[]): FreezeMoment[] {
  const at = duration * 0.86;
  if (training) {
    const [b, s, r, r4, l] = runs;
    const tokens = (x: LabRun) => x.tokens / x.n;
    if (step === 1) return [{ at, headline: `Imitating verified reasoning: *${b.correct} → ${s.correct} of 96*`, parts: [{ label: "base", value: `${b.accuracy.toFixed(1)}%`, tone: "baseline" }, { label: "after SFT + LoRA", value: `${s.accuracy.toFixed(1)}%`, tone: "optimized" }] }];
    if (step === 2) return [{ at, headline: `Learning from outcomes: *${s.correct} → ${r.correct} of 96*`, parts: [{ label: "after SFT", value: `${s.accuracy.toFixed(1)}%`, tone: "baseline" }, { label: "after GRPO", value: `${r.accuracy.toFixed(1)}%`, tone: "optimized" }] }];
    if (step === 3) return [{ at, headline: `More thinking budget, same weights: *${r.correct} → ${r4.correct} of 96*`, cause: `each task now costs ${fm(r4.meanCost - r.meanCost, 2)} GPU-s more` }];
    if (step === 4) return [{ at, headline: `Same ${l.correct} tasks, *${Math.round(100 * (1 - tokens(l) / tokens(r4)))}% fewer tokens*`, parts: [{ label: "tokens per task before", value: fm(tokens(r4)), tone: "baseline" }, { label: "after lean RL", value: fm(tokens(l)), tone: "optimized" }] }];
    return [];
  }
  const [a, b, , d] = runs;
  if (step === 0) return [{ at, headline: `Today each correct answer costs *${fm(a.correctCost!, 2)} GPU-s*`, cause: `and the slowest 5% wait ${fm(a.p95)} s` }];
  if (step === 1) return [{ at, headline: `Same GPU work, slowest 5% *${fm(a.p95 - b.p95)} s sooner*`, parts: [{ label: "fixed pairs", value: `${fm(a.p95)} s`, tone: "baseline" }, { label: "free worker", value: `${fm(b.p95)} s`, tone: "optimized" }] }];
  if (step === 3) return [{ at: duration * 0.93, headline: `Same tokens, *${fm(runs[2].correctCost!, 2)} → ${fm(d.correctCost!, 2)} GPU-s* per correct answer` }];
  if (step === 4) return [{ at, headline: `All three levers: *${fm(a.correctCost!, 2)} → ${fm(d.correctCost!, 2)} GPU-s* each`, parts: [{ label: "correct answers", value: `${d.correct} of 96`, tone: "delta" }, { label: "slowest 5%", value: `${fm(a.p95)} → ${fm(d.p95)} s`, tone: "optimized" }] }];
  return [];
}
const frameKey = (training: boolean, f: Interlude) => `${training}-${f.step}-${f.kind}`;
const unseen = (training: boolean, list: Interlude[]) => list.filter((f) => !SEEN_FRAMES.has(frameKey(training, f)));

export function LabStory({
  training,
  evidence,
  explore,
  onFinish,
}: {
  training: boolean;
  onFinish?: () => void;
  evidence: (run: LabRun, pause: () => void) => ReactNode;
  explore: () => void;
}) {
  const tr = useTr();
  const [hover, setHover] = useState<Inspection | null>(null),
    [pinned, setPinned] = useState<Inspection | null>(null);
  const [undo, setUndo] = useState(false),
    [budget, setBudget] = useState(4),
    [workload, setWorkload] = useState<Workload>("shared-prefix");
  // A chapter is framed by where it works and how before it, and by its impact after it; the film holds meanwhile.
  const [interludes, setInterludes] = useState<Interlude[]>(() => unseen(training, training ? [] : [{ step: 0, kind: "flow" }]));
  const { ref, ...playback } = useStudyPlayback(5, 0, {
    // Hovering or pinning an inspection explains; it never stops the film.
    held: undo || interludes.length > 0,
    finite: true,
    interval: 12000,
    durations: training
      ? [10000, ADAPTER_DURATION, 16800, 21000, 8000]
      : [
          BASELINE_DURATION,
          SCHEDULING_DURATION,
          PREFIX_DURATION,
          EXECUTION_DURATION,
          RUNTIME_GAINS_DURATION,
        ],
  });
  // The frontier has its own module near the top of post-training.
  const steps = training ? TRAINING_STORY.slice(0, 5) : INFERENCE_STORY;
  const [seenStep, setSeenStep] = useState(playback.step);
  if (seenStep !== playback.step) {
    const prev = seenStep, next = playback.step;
    setSeenStep(next);
    if (training) setInterludes(unseen(true, LEARN_ARCS[next] ? [{ step: next, kind: "mechanism" }] : []));
    else
      setInterludes(unseen(false, [
        ...(FILM_ARCS[prev] && next === prev + 1 ? [{ step: prev, kind: "impact" as const }] : []),
        ...(FLOW_ZOOMS[next] ? [{ step: next, kind: "flow" as const }] : []),
        ...(FILM_ARCS[next] ? [{ step: next, kind: "mechanism" as const }] : []),
      ]));
  }
  const interlude = interludes[0];
  const interludeBeat = useMemo(
    () => (!interlude ? null
      : interlude.kind === "flow" ? FLOW_ZOOMS[interlude.step]
      : training ? LEARN_ARCS[interlude.step].mechanism
      : interlude.kind === "mechanism" ? FILM_ARCS[interlude.step].mechanism : FILM_ARCS[interlude.step].impact(workload)),
    [interlude, workload, training],
  );
  useEffect(() => { if (interlude) SEEN_FRAMES.add(frameKey(training, interlude)); }, [interlude, training]);
  const slotId = training ? "training-chapters-slot" : "inference-chapters-slot";
  const slot = useSlot(slotId);
  // When the last chapter ends, hand over to whatever comes next (the second branch).
  const finishedRef = useRef(onFinish);
  useEffect(() => { finishedRef.current = onFinish; });
  useEffect(() => {
    if (!playback.finished) return;
    const id = window.setTimeout(() => finishedRef.current?.(), 3500);
    return () => window.clearTimeout(id);
  }, [playback.finished]);
  // The title show names the chapter on stage.
  const chapterName = steps[playback.step]?.name;
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("lab:film-chapter", { detail: { training, n: playback.step, name: chapterName } }));
  }, [training, playback.step, chapterName]);
  const runs = useMemo(
    () => (training ? trainingStoryRuns(budget) : inferenceStoryRuns(workload)),
    [training, budget, workload],
  );
  useFreezeMoments(
    useMemo(() => chapterMoments(training, playback.step, playback.duration, runs), [training, playback.step, playback.duration, runs]),
    playback.readTime, playback.running, playback.pause, playback.resume, playback.sceneKey,
  );
  const step = playback.step,
    index = undo ? (!training && step === 4 ? 0 : Math.max(0, step - 1)) : step;
  const runIndex = Math.min(index, runs.length - 1);
  const run = runs[runIndex],
    previous = runs[Math.max(0, runIndex - 1)],
    baseline = runs[0];
  const room = training && ROOM_CHAPTERS.has(index);
  const story =
    training && step === 3
      ? {
          ...steps[step],
          detail:
            "Move from 1× to 8×, follow the assistant's investigation, then return to the selected allowance for the next policy comparison.",
        }
      : steps[step];
  const active = pinned ?? hover,
    changes = compareTasks(previous, run);
  const inspect = {
    active: active?.key,
    preview: setHover,
    pin: (item: Inspection) =>
      setPinned((p) => (p?.key === item.key ? null : item)),
  };
  const clear = () => {
    setHover(null);
    setPinned(null);
  };
  // Choosing a chapter plays it: an exhibit never waits on a second click.
  const select = (n: number) => {
    clear();
    setUndo(false);
    playback.select(n);
    if (!playback.reduced) playback.resume();
  };
  // Opening a record or inspector explains the moment; the film keeps running.
  const pause = () => {
    clear();
  };
  const replay = () => {
    clear();
    setUndo(false);
    playback.replay();
  };
  const [task, setTask] = useState(0);
  const deltaCost =
    ((baseline.correctCost! - run.correctCost!) / baseline.correctCost!) * 100;
  const isWatching = playback.playing && playback.cycling;
  const toggleStory = () => {
    clear();
    setUndo(false);
    // A finished film replays the chapter on screen, not the whole film from its first chapter.
    if (playback.finished) { playback.select(step); playback.resume(); }
    else if (!isWatching) playback.resume();
    else playback.pause();
  };
  // Dive deeper: stop here with the scrubber free. Keep playing: carry on from here.
  const pauseRef = useRef(playback.pause), resumeRef = useRef(() => {});
  useEffect(() => {
    pauseRef.current = playback.pause;
    resumeRef.current = () => { if (playback.finished) playback.select(step); playback.resume(); };
  });
  useEffect(() => {
    const dive = () => { setInterludes([]); pauseRef.current(); };
    const resume = () => resumeRef.current();
    window.addEventListener("lab:dive", dive);
    window.addEventListener("lab:resume", resume);
    return () => { window.removeEventListener("lab:dive", dive); window.removeEventListener("lab:resume", resume); };
  }, []);
  // The chapter list lives in the laboratory's side rail when the rail is present.
  const chaptersNav = (
    <nav
          className="ls-chapters"
          aria-label={
            training ? "Learning story chapters" : "Execution story chapters"
          }
        >
          {steps.map((s, i) => (
            <button
              key={s.verb}
              type="button"
              aria-current={step === i ? "step" : undefined}
              aria-label={`Chapter ${i + 1}: ${s.name}`}
              onClick={() => select(i)}
              data-complete={i < step}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <strong>{s.name}</strong>
              {step === i && (
                <i
                  key={playback.progressKey}
                  className="ls-progress"
                  aria-hidden="true"
                  style={{
                    animationDuration: `${playback.duration}ms`,
                    animationDelay: `${-playback.progressOffset}ms`,
                  }}
                />
              )}
            </button>
          ))}
          
        </nav>
  );
  return (
    <article
      ref={ref}
      className={`ls-story ${training ? "ls-training" : "ls-inference"}`}
      data-running={playback.running}
      data-play-intent={playback.playing}
      data-in-viewport={playback.inViewport}
      data-reduced={playback.reduced}
      data-cycling={playback.cycling}
      data-held={!!active || undo}
      data-adapter={training && index === 1}
      data-interlude={interlude ? true : undefined}
      data-directed-execution={!training && index === 3}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          clear();
          setUndo(false);
        }
      }}
    >
      {interlude && interludeBeat && (
        <FilmInterlude
          key={`${interlude.step}-${interlude.kind}-${workload}`}
          beat={interludeBeat}
          kicker={interlude.kind === "flow" ? steps[interlude.step].name : training ? LEARN_ARCS[interlude.step].name : FILM_ARCS[interlude.step].name}
          doneLabel={interlude.kind === "flow" ? "Continue ▸" : training ? "Skip to the results ▸" : undefined}
          live={playback.inViewport && playback.playing}
          onDone={() => setInterludes((q) => q.slice(1))}
        />
      )}
      {!training && (
        <div className="ls-workload-switch" role="group" aria-label="Story workload">
          {([["shared-prefix", "One shared document"], ["interactive", "Different documents"]] as const).map(([value, label]) => (
            <button key={value} type="button" aria-pressed={workload === value} onClick={() => { setWorkload(value); select(step); }}>{tr(label)}</button>
          ))}
        </div>
      )}
      <div className="ls-topline" hidden={!training}>
        {training && (
          <span>
            <i aria-hidden="true" /> A GUIDED EXPERIMENT{" "}
            <small>
              {training ? "6 chapters · ~105 seconds" : "5 chapters · ~100 seconds"}
            </small>
          </span>
        )}
        <div
          role="group"
          aria-label={training ? "Story thought allowance" : "Story workload"}
          className="ls-switches"
          style={training && step === 3 ? { visibility: "hidden" } : undefined}
        >
          {training && <span className="ls-switch-label">Thinking budget</span>}
          {training
            ? BUDGETS.map((b) => (
                <button
                  key={b}
                  type="button"
                  // chapters 01–03 run at 1× thought; the selected allowance applies from chapter 04
                  aria-pressed={step < 3 ? b === 1 : budget === b}
                  onClick={() => {
                    setBudget(b);
                    select(Math.max(3, step));
                  }}
                >
                  {b}×
                </button>
              ))
            : (["interactive", "shared-prefix"] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  aria-pressed={workload === w}
                  onClick={() => {
                    setWorkload(w);
                    select(step);
                  }}
                >
                  {w === "interactive"
                    ? "Different documents"
                    : "Shared document"}
                </button>
              ))}
        </div>
      </div>
      {slot ? createPortal(chaptersNav, slot) : chaptersNav}
      {training && (
        <header className="ls-story-heading">
          <div>
            <span className="ls-eyebrow">
              {undo
                ? "Previous state"
                : `${String(step + 1).padStart(2, "0")} / ${story.verb}`}
            </span>
            <h3>
              {!training && index === 3
                ? "Execute efficiently"
                : undo
                  ? steps[index].title
                  : story.title}
            </h3>
            {(training || index !== 3) && (
              <p>{undo ? steps[index].detail : story.detail}</p>
            )}
          </div>
          <button
            type="button"
            className="ls-undo"
            aria-pressed={undo}
            disabled={step === 0}
            onClick={() => {
              clear();
              setUndo((v) => !v);
            }}
          >
            ⇄{" "}
            {undo
              ? "Restore intervention"
              : !training && step === 4
                ? "Compare starting point"
                : "Undo this step"}
          </button>
        </header>
      )}
      <div
        className="ls-theater"
        data-feature={
          room ? "room" : training && index === 1 ? "adapter" : index === 3
            ? training
              ? "scaling"
              : "execution"
            : !training && index === 2
              ? "prefix"
              : !training && index === 1
                ? "scheduling"
                : !training && index === 0 ? "baseline" : !training && index === 4 ? "runtime-gains" : undefined
        }
      >
        <div className="ls-mechanism">
          {training && (
            <div className="ls-figure-label">
              <span>
                {training
                  ? index === 3
                    ? "How inference-time search changes"
                    : "How the policy changes"
                  : "Where the efficiency comes from"}
              </span>
              <small>
                {training
                  ? "Inspectable teaching model"
                  : "Deterministic execution trace"}
              </small>
            </div>
          )}
          <p className="ls-scroll-hint">
            Swipe the mechanism to inspect every detail ↔
          </p>
          <div
            className="ls-scene-scroll"
            tabIndex={0}
            role="region"
            aria-label="Mechanism illustration; scroll horizontally on small screens"
          >
            <Suspense
              fallback={
                <div role="status" style={{ minHeight: 510, padding: 24 }}>
                  Preparing request trace…
                </div>
              }
            >
              <FilmTransition
                sceneKey={`${training}-${index}-${budget}-${workload}-${playback.sceneKey}`}
              >
                {!training && index === 0 ? (
                  <BaselineReveal run={runs[0]} playing={playback.running} reduced={playback.reduced || undo} readTime={playback.readTime} onSeek={playback.seek} onToggle={toggleStory} onChapter={select} />
                ) : !training && index === 1 ? (
                  <SchedulingReveal
                    before={runs[0]}
                    after={runs[1]}
                    playing={playback.running}
                    reduced={playback.reduced || undo}
                    readTime={playback.readTime}
                    onSeek={playback.seek}
                    onToggle={toggleStory}
                  />
                ) : !training && index === 2 ? (
                  <PrefixReuseReveal
                    before={runs[1]}
                    after={runs[2]}
                    playing={playback.running}
                    reduced={playback.reduced || undo}
                    readTime={playback.readTime}
                    onSeek={playback.seek}
                    onToggle={toggleStory}
                    inspect={inspect}
                  />
                ) : !training && index === 3 ? (
                  <ExecutionReveal
                    before={runs[2]}
                    after={runs[3]}
                    playing={playback.running}
                    reduced={playback.reduced || undo}
                    readTime={playback.readTime}
                    onSeek={playback.seek}
                    onToggle={toggleStory}
                  />
                ) : room ? (
                  <ExhibitScene
                    Scene={index === 2 ? PolicyGrpo : index === 4 ? PolicyLean : PolicyFrontierStory}
                    label={steps[index].name}
                    readTime={playback.readTime}
                    playing={playback.running}
                    reduced={playback.reduced || undo}
                    duration={playback.duration}
                    onSeek={playback.seek}
                    onToggle={toggleStory}
                  />
                ) : training && index === 1 ? (
                  <AdapterReveal playing={playback.running} reduced={playback.reduced || undo} readTime={playback.readTime} onSeek={playback.seek} onToggle={toggleStory} />
                ) : training && index === 3 ? (
                  <TestTimeReveal
                    comparisonBudget={budget}
                    evidence={evidence}
                    onPause={pause}
                    playing={playback.running}
                    reduced={playback.reduced || undo}
                    readTime={playback.readTime}
                    onSeek={playback.seek}
                    onToggle={toggleStory}
                  />
                ) : training ? (
                  <PolicyFilm
                    step={index}
                    budget={run.budget}
                    inspect={inspect}
                    playing={playback.running}
                    reduced={playback.reduced || undo}
                    readTime={playback.readTime}
                    onSeek={playback.seek}
                    duration={playback.duration}
                    onToggle={toggleStory}
                  />
                ) : (
                  <RuntimeGainsReveal
                    runs={runs}
                    playing={playback.running}
                    reduced={playback.reduced || undo}
                    readTime={playback.readTime}
                    onSeek={playback.seek}
                    onToggle={toggleStory}
                    onReplay={() => { clear(); playback.select(4); playback.resume(); }}
                    onExplore={explore}
                  />
                )}
              </FilmTransition>
            </Suspense>
          </div>
          {training && index !== 1 && !room && (
            <div className="ls-causal-chain" aria-label="Cause and effect">
              <button
                type="button"
                onMouseEnter={() =>
                  setHover({
                    key: "mechanism",
                    title: steps[index].mechanism,
                    body: steps[index].inspect,
                  })
                }
                onMouseLeave={() => setHover(null)}
                onFocus={() =>
                  setHover({
                    key: "mechanism",
                    title: steps[index].mechanism,
                    body: steps[index].inspect,
                  })
                }
                onBlur={() => setHover(null)}
                onClick={() =>
                  inspect.pin({
                    key: "mechanism",
                    title: steps[index].mechanism,
                    body: steps[index].inspect,
                  })
                }
              >
                {steps[index].mechanism} <span>ⓘ</span>
              </button>
              <span aria-hidden="true">→</span>
              <strong>
                {training
                  ? index < 3
                    ? "Different policy"
                    : index === 3
                      ? "More search, same weights"
                      : "Less work per attempt"
                  : index === 1
                    ? "Less waiting, same work"
                    : index === 2
                      ? workload === "shared-prefix"
                        ? "Less repeated prefill"
                        : "No matching prefix"
                      : index >= 3
                        ? "Less cost, same answers"
                        : "Work + idle gaps"}
              </strong>
            </div>
          )}
        </div>
        <aside className="ls-outcomes" aria-label="Linked story outcomes">
          <div className="ls-figure-label">
            <span>Result on all 96 tasks</span>
            <small>Same 96 tasks</small>
          </div>
          <div className="ls-main-result" aria-live="off">
            <div>
              <strong>
                {training
                  ? run.accuracy.toFixed(1)
                  : run.correctCost!.toFixed(2)}
                <small>{training ? "%" : " GPU-s"}</small>
              </strong>
              <span>{training ? "task accuracy" : "per correct answer"}</span>
            </div>
            <div className="ls-result-delta">
              <b>
                {training
                  ? `${run.accuracy - baseline.accuracy > 0 ? "+" : ""}${(run.accuracy - baseline.accuracy).toFixed(1)} pp`
                  : `${deltaCost > 0 ? "−" : deltaCost < 0 ? "+" : ""}${Math.abs(deltaCost).toFixed(1)}%`}
              </b>
              <span>from starting point</span>
            </div>
          </div>
          {training ? (
            <>
              <div className="ls-budget-account">
                <span>
                  Cost / task <small>previous → current</small>
                </span>
                <strong>
                  {previous.meanCost.toFixed(2)} <i>→</i>{" "}
                  {run.meanCost.toFixed(2)} <small>GPU-s</small>
                </strong>
              </div>
              <AccuracyCostTrail runs={runs} index={runIndex} inspect={inspect} />
              <div className="ls-cohort-heading">
                <span>Task by task</span>
                <small>
                  +{changes.gained.length} gained · −{changes.lost.length} lost
                </small>
              </div>
              <CohortMap before={previous} after={run} inspect={inspect} />
              <label className="ls-task-control">
                Inspect task{" "}
                <input
                  type="range"
                  min="1"
                  max="96"
                  value={task + 1}
                  aria-label="Inspect story task"
                  aria-valuetext={`Task ${task + 1}`}
                  onChange={(e) => {
                    const n = Number(e.target.value) - 1;
                    setTask(n);
                    setPinned(taskInspection(previous, run, n));
                  }}
                />
                <span>{String(task + 1).padStart(2, "0")}</span>
              </label>
            </>
          ) : (
            <>
              <div
                className="ls-cost-stair"
                role="group"
                aria-label="Cost after each intervention"
              >
                {runs.slice(0, 4).map((r, i) => (
                  <button
                    type="button"
                    key={i}
                    aria-label={`Inspect cost after ${steps[i].name}`}
                    onMouseEnter={() =>
                      setHover({
                        key: `stage-${i}`,
                        title: steps[i].mechanism,
                        body: `${r.gpuSeconds.toFixed(1)} busy GPU-s ÷ ${r.correct} correct = ${r.correctCost!.toFixed(2)} GPU-s per correct answer. ${steps[i].inspect}`,
                      })
                    }
                    onMouseLeave={() => setHover(null)}
                    onFocus={() =>
                      setHover({
                        key: `stage-${i}`,
                        title: steps[i].mechanism,
                        body: steps[i].inspect,
                      })
                    }
                    onBlur={() => setHover(null)}
                    onClick={() => select(i)}
                    data-current={index === i || (index === 4 && i === 3)}
                  >
                    <span>
                      {
                        [
                          "Starting point",
                          "+ Scheduling",
                          "+ Prefix reuse",
                          "+ Execution",
                        ][i]
                      }
                    </span>
                    <div>
                      <i
                        style={{
                          width: `${(r.correctCost! / baseline.correctCost!) * 100}%`,
                        }}
                        data-future={i > index}
                      />
                    </div>
                    <b>{r.correctCost!.toFixed(2)}</b>
                  </button>
                ))}
              </div>
              <div className="ls-guardrails">
                <div>
                  <span>
                    p95 latency <small>queue included</small>
                  </span>
                  <strong>
                    {baseline.p95.toFixed(1)} <i>→</i> {run.p95.toFixed(1)} s
                  </strong>
                </div>
                <div>
                  <span>
                    Correctness <small>non-regression gate</small>
                  </span>
                  <strong>
                    {baseline.correct} <i>→</i> {run.correct} / 96{" "}
                    <em>Unchanged</em>
                  </strong>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
      {((training && index !== 1) || active) && (
        <div className="ls-inspector" data-pinned={!!pinned} data-idle={!active}>
          <div className="ls-inspector-marker" aria-hidden="true">
            {pinned ? "⌖" : active ? "↗" : "◎"}
          </div>
          <div>
            <span>
              {pinned
                ? "Pinned inspection"
                : active
                  ? "Inspecting, story held"
                  : "THE MECHANISM, IN PLAIN SIGHT"}
            </span>
            <strong>{active?.title ?? steps[index].mechanism}</strong>
            <p>{active?.body ?? steps[index].inspect}</p>
          </div>
          {pinned ? (
            <button
              type="button"
              onClick={clear}
              aria-label="Release pinned inspection"
            >
              ✕ Release
            </button>
          ) : training ? (
            <small>
              Hover or focus to inspect
              <br />
              Click a diagram detail to pin
            </small>
          ) : null}
        </div>
      )}
      {training && (
        <footer className="ls-footer">
          <div className="ls-transport">
            <button
              type="button"
              aria-label="Previous story chapter"
              disabled={step === 0}
              onClick={() => select(step - 1)}
            >
              ←
            </button>
            <button
              type="button"
              className="ls-play"
              disabled={playback.reduced}
              onClick={toggleStory}
            >
              {playback.reduced
                ? "Reduced motion"
                : isWatching
                  ? "Ⅱ Pause story"
                  : playback.finished
                    ? "▷ Watch again"
                    : "▷ Continue story"}
            </button>
            <button
              type="button"
              aria-label="Next story chapter"
              disabled={step === 4}
              onClick={() => select(step + 1)}
            >
              →
            </button>
            <button type="button" onClick={replay}>
              ↺ Replay
            </button>
          </div>
          <span className="ls-play-state" role="status">
            {undo
              ? "Comparing previous state"
              : pinned
                ? "Inspection pinned"
                : hover
                  ? "Held while you inspect"
                  : playback.reduced
                    ? "Manual chapters available"
                    : !isWatching
                      ? playback.finished
                        ? "Story complete · explore the details"
                        : "Paused · choose a chapter or continue"
                      : "Watch the change, then inspect it"}
          </span>
          <div className="ls-footer-actions">
            {!(training && index === 3) && evidence(run, pause)}
            <button type="button" onClick={explore}>
              Explore all figures ↗
            </button>
          </div>
        </footer>
      )}
      {(!training || index === 1) && (
        <details className="ls-records">
          <summary>{training ? "Separate cohort results" : "Experiment records"}</summary>
          {evidence(run, pause)}
          <button type="button" onClick={explore}>
            Explore figures ↗
          </button>
        </details>
      )}
    </article>
  );
}
