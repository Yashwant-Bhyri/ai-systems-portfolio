"use client";

import {
  lazy,
  Suspense,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { InferenceFigureHandoff } from "./explorer-state";
import {
  CapabilityShiftPlot,
  LabScalingPlot,
  RegressionAuditPlot,
} from "./lab-result-plots";
import {
  BUDGETS,
  FAMILIES,
  LAB_ASSUMPTIONS,
  LAB_VERSION,
  POLICIES,
  compareTasks,
  labComposition,
  simulateLab,
  type LabRun,
  type Workload,
} from "./lab-simulation";
import { reductionPercent } from "./study-math";
import { useStudyPlayback } from "./use-study-playback";
import { LabStory } from "./lab-story";
import { FigurePresentation } from "./figure-presentation";
import { RetainedLabPanel } from "./retained-lab-panel";
import type { InferenceTourHandle } from "./inference-figure-tour";
import "../compute-study.css";
import "./inference-program.css";
import "./stagecraft/stagecraft.css";
import "./stagecraft/plates.css";
import "./stagecraft/film-spot.css";
import "./stagecraft/quiet.css";
import "./stagecraft/explorers.css";
import "./stagecraft/block.css";
import { ModuleBar, type RailItem } from "./stagecraft/side-rail";
import { TaskLanding } from "./stagecraft/task-landing";
import { useTr } from "../exhibit/i18n";
import { GhostCursor, type CursorStep } from "./stagecraft/ghost-cursor";
import {
  GlyphAudit,
  GlyphCapability,
  GlyphComposition,
  GlyphCurves,
  GlyphExperiment,
  GlyphFrontier,
  GlyphLatency,
  GlyphReplay,
  GlyphTasks,
} from "./stagecraft/glyphs";
import { latencyDistribution } from "./load-latency-model";

const ServingUnderLoad = lazy(() =>
  import("./serving-under-load").then((module) => ({
    default: module.ServingUnderLoad,
  })),
);
const CompositionExplorer = lazy(() =>
  import("./composition-explorer").then((module) => ({
    default: module.CompositionExplorer,
  })),
);
const RequestReplayExplorer = lazy(() =>
  import("./request-replay-explorer").then((module) => ({
    default: module.RequestReplayExplorer,
  })),
);
const LoadLatencyExplorer = lazy(() =>
  import("./load-latency-explorer").then((module) => ({
    default: module.LoadLatencyExplorer,
  })),
);
const InferenceFigureTour = lazy(() =>
  import("./inference-figure-tour").then((module) => ({
    default: module.InferenceFigureTour,
  })),
);

/* The cursor performs each figure's own controls, so nobody has to discover them. */
const REPLAY_DEMO: readonly CursorStep[] = [
  { target: ".rr-cohort-plot", action: "sweep", drive: ".rr-request-slider input", from: 1, to: 96, duration: 9000, label: "All 96 requests", hold: 900 },
  { target: ".rr-request-slider input", action: "range", value: 7, label: "Request 7 · shared prefix", hold: 6000 },
  { target: ".rr-measure-chapters button:nth-child(2)", label: "Input only", hold: 3600 },
  { target: ".rr-measure-chapters button:nth-child(3)", label: "Answer only", hold: 3600 },
  { target: ".rr-measure-chapters button:nth-child(4)", label: "Wait + execute", hold: 3600 },
  { target: ".rr-measure-chapters button:nth-child(1)", label: "Total GPU work", hold: 2400 },
]
const LATENCY_DEMO: readonly CursorStep[] = [
  // The film plays to its end (ranking, then the rank scan); only then does the cursor walk the percentiles.
  { target: ".ll-explorer[data-done=\"true\"] .ll-percentiles button:nth-child(1)", label: "p50 · median response", hold: 3200, waitFor: 70000 },
  { target: ".ll-percentiles button:nth-child(2)", label: "p95 · the slow tail", hold: 3600 },
  { target: ".ll-percentiles button:nth-child(3)", label: "p99 · the slowest few", hold: 3600 },
  { target: ".ll-percentiles button:nth-child(2)", label: "Back to p95", hold: 2600 },
]

/** Bring the laboratory block flush with the viewport; a no-op when it already is. */
function alignBlock(inside: Element | null) {
  const block = inside?.closest(".lab-block") ?? inside;
  if (!block) return;
  const top = block.getBoundingClientRect().top;
  if (Math.abs(top) < 4) return;
  // Page snapping would fight the glide; lift it until the glide ends.
  const html = document.documentElement, snap = html.style.scrollSnapType;
  html.style.scrollSnapType = "none";
  window.scrollTo({ top: top + window.scrollY, behavior: "smooth" });
  window.setTimeout(() => { html.style.scrollSnapType = snap; }, 1400);
}

const INFERENCE_VIEWS = [
  { name: "Policy × runtime", detail: "Compare cost & accuracy", symbol: "↖" },
  {
    name: "Execution replay",
    detail: "Inspect any of 96 requests",
    symbol: "⇉",
  },
  { name: "Queue & latency", detail: "Compare waiting & p95", symbol: "⌁" },
  { name: "Where the 96 tasks land", detail: "Base vs post-trained", symbol: "⁘" },
];
const TRAINING_VIEWS = [
  { name: "Capability map", detail: "See which tasks change", symbol: "⊞" },
  { name: "Compute curves", detail: "Compare all four policies", symbol: "⌁" },
  { name: "Regression audit", detail: "Follow gains and losses", symbol: "⇄" },
];
const RESEARCH = [
  {
    title: "Post-training mechanisms & evaluation",
    url: "https://arxiv.org/html/2505.07608v2",
  },
  {
    title: "Shared-prefix serving research",
    url: "https://www.lmsys.org/blog/2024-12-04-sglang-v0-4/",
  },
  {
    title: "Test-time scaling methods & artifacts",
    url: "https://github.com/simplescaling/s1",
  },
];

function LabEvidence({
  run,
  onInspect,
}: {
  run: LabRun;
  onInspect: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    id = useId();
  const runtimeIdentity = `${run.mechanisms.scheduler}-reuse-${run.mechanisms.reuse ? "on" : "off"}-rates-${run.mechanisms.fastKernels ? "fast" : "static"}`;
  const recordUrl = useMemo(
    () =>
      `data:application/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(
          {
            ...run,
            disclaimer: "Synthetic scenario only. No physical GPU or LLM run.",
            assumptions: LAB_ASSUMPTIONS,
          },
          null,
          2,
        ),
      )}`,
    [run],
  );
  return (
    <>
      <button
        type="button"
        className="rs-evidence-trigger"
        onClick={() => {
          onInspect();
          ref.current?.showModal();
        }}
      >
        Inspect scenario record <span aria-hidden="true">↗</span>
      </button>
      <dialog
        ref={ref}
        className="rs-evidence-dialog"
        aria-labelledby={id}
        onKeyDown={(event) => {
          // Native Escape closes this dialog, not the paused story behind it.
          if (event.key === "Escape") event.stopPropagation();
        }}
      >
        <header>
          <div>
            <span>Illustrative, not measured</span>
            <h3 id={id}>
              {POLICIES[run.policyIndex].name} · {run.budget}× nominal cap
            </h3>
          </div>
          <button
            type="button"
            autoFocus
            aria-label="Close scenario record"
            onClick={() => ref.current?.close()}
          >
            ✕
          </button>
        </header>
        <div className="rs-evidence-body">
          <nav aria-label="Scenario artifacts">
            <a
              href={recordUrl}
              download={`${LAB_VERSION}-${run.policy}-${run.budget}x-${run.workload}-${runtimeIdentity}.json`}
            >
              Download synthetic run JSON ↗
            </a>
          </nav>
          <dl>
            <div>
              <dt>Scenario identity</dt>
              <dd>
                {LAB_VERSION} · {run.policy} · {run.workload} ·{" "}
                {runtimeIdentity}
              </dd>
            </div>
            <div>
              <dt>Exact aggregation</dt>
              <dd>
                {run.gpuSeconds.toFixed(3)} simulated GPU-seconds ÷{" "}
                {run.correct} correct outcomes ={" "}
                {run.correctCost?.toFixed(3) ?? "undefined"} GPU-seconds per
                correct answer.
              </dd>
            </div>
            <div>
              <dt>Runtime interventions</dt>
              <dd>
                {run.mechanisms.scheduler === "barrier"
                  ? "Static paired batch barrier"
                  : "First available worker"}{" "}
                · prefix reuse {run.mechanisms.reuse ? "on" : "off"} · faster
                token rates {run.mechanisms.fastKernels ? "on" : "off"}. Story
                comparisons explicitly include the barrier starting point; the
                four-condition composition figure uses continuous scheduling
                throughout.
              </dd>
            </div>
            {LAB_ASSUMPTIONS.map(([name, value]) => (
              <div key={name}>
                <dt>{name}</dt>
                <dd>{value}</dd>
              </div>
            ))}
            <div>
              <dt>Analysis implementation</dt>
              <dd>
                app/compute/lab-simulation.ts. The download contains every
                synthetic task, outcome, token count, cache decision, queue time
                and cost.
              </dd>
            </div>
          </dl>
          <h4>Research behind the mechanisms</h4>
          <p className="rs-research-boundary">
            These sources inform the experiment design. Their benchmark numbers
            are not copied, perturbed or presented as this lab’s measurements.
          </p>
          <p className="rs-research-boundary">
            Real Qwen3-4B runs require checkpoint identities, hardware timings
            and independently verified evaluation artifacts. Those are not
            present in this synthetic scenario.
          </p>
          <nav aria-label="Research references">
            {RESEARCH.map((r) => (
              <a key={r.url} href={r.url} target="_blank" rel="noreferrer">
                {r.title} ↗
              </a>
            ))}
          </nav>
        </div>
      </dialog>
    </>
  );
}

function LabMetrics({
  run,
  baseline,
  training,
}: {
  run: LabRun;
  baseline: LabRun;
  training: boolean;
}) {
  const change = reductionPercent(baseline.correctCost!, run.correctCost!)!,
    accuracyDelta = run.accuracy - baseline.accuracy;
  return (
    <div className="rs-lab-metrics">
      <div>
        <span>
          {training ? "Accuracy" : "Cost / correct"}
        </span>
        <strong>
          {training ? run.accuracy.toFixed(1) : run.correctCost!.toFixed(2)}
          <small>{training ? "%" : " GPU-s"}</small>
        </strong>
        <i>
          {training
            ? `${run.correct} / ${run.n} tasks`
            : `${run.gpuSeconds.toFixed(1)} GPU-s ÷ ${run.correct} correct`}
        </i>
      </div>
      <div>
        <span>{training ? "Cost / task" : "Accuracy"}</span>
        <strong>
          {training ? run.meanCost.toFixed(2) : run.accuracy.toFixed(1)}
          <small>{training ? " GPU-s" : "%"}</small>
        </strong>
        <i>
          {training
            ? `${accuracyDelta >= 0 ? "+" : ""}${accuracyDelta.toFixed(1)} pp vs Base`
            : run.optimized
              ? `${change >= 0 ? "−" : "+"}${Math.abs(change).toFixed(1)}% cost vs matched static`
              : "Matched static reference"}
        </i>
      </div>
    </div>
  );
}

function TaskReadout({
  run,
  taskId,
  onTask,
}: {
  run: LabRun;
  taskId: number;
  onTask: (id: number) => void;
}) {
  const task = run.tasks[taskId],
    base = simulateLab(0, run.budget).tasks[taskId];
  return (
    <div className="rs-task-readout">
      <span>Selected task · {String(taskId + 1).padStart(2, "0")}</span>
      <input
        type="range"
        min="1"
        max="96"
        step="1"
        value={taskId + 1}
        aria-label="Inspect synthetic task"
        aria-valuetext={`Task ${taskId + 1}, ${FAMILIES[task.family]}, ${task.correct ? "correct" : "incorrect"}`}
        onChange={(e) => onTask(Number(e.target.value) - 1)}
      />
      <strong>{FAMILIES[task.family]}</strong>
      <div>
        <i data-correct={base.correct}>{base.correct ? "✓" : "×"} Base</i>
        <span>→</span>
        <i data-correct={task.correct}>
          {task.correct ? "✓ Correct" : "× Incorrect"}
        </i>
      </div>
    </div>
  );
}

export function ComputeLabStudy({
  domain,
}: {
  domain: "inference" | "training";
}) {
  const training = domain === "training",
    [inferencePart, setInferencePart] = useState<"cheaper" | "load">("cheaper"),
    [mode, setMode] = useState<"watch" | "explore" | "present">("watch"),
    [view, setView] = useState(0),
    { ref, ...playback } = useStudyPlayback(4, training ? 2 : 3, {
      enabled: mode === "explore" && training,
    }),
    [budget, setBudget] = useState(2),
    [workload, setWorkload] = useState<Workload>("shared-prefix"),
    [selectedTask, setSelectedTask] = useState(0),
    [figureHandoff, setFigureHandoff] = useState<InferenceFigureHandoff | null>(
      null,
    );
  const exhibitRef = useRef<HTMLElement>(null);
  const tr = useTr();
  const replayHost = useRef<HTMLDivElement>(null),
    latencyHost = useRef<HTMLDivElement>(null);
  const tourRef = useRef<InferenceTourHandle>(null);
  const [figureRevisions, setFigureRevisions] = useState([0, 0, 0]);
  const [tourVisited, setTourVisited] = useState(false);
  useEffect(() => {
    if (mode === "explore" && figureHandoff)
      exhibitRef.current?.focus({ preventScroll: true });
  }, [mode, figureHandoff]);
  const points = labComposition(workload, budget),
    selected = playback.step,
    run = training ? simulateLab(selected, budget) : points[selected],
    base = training
      ? simulateLab(0, budget)
      : simulateLab(run.policyIndex, budget, false, workload),
    optimized = simulateLab(run.policyIndex, budget, true, workload),
    flips = compareTasks(base, run),
    views = training ? TRAINING_VIEWS : INFERENCE_VIEWS;
  const inspected = (task: number) => {
    setSelectedTask(task);
    playback.select(selected);
  };
  const selectCurve = (policy: number, b: number) => {
    setBudget(b);
    playback.select(policy);
  };
  const label = training ? POLICIES[selected].name : points[selected].label;
  const inferenceCaption = [
    [
      "Quality and execution are separate moves.",
      "The same synthetic cohort drives all four conditions. Up changes capability; left changes the cost of delivering it.",
    ],
    [
      "Same questions. Same answers. Less execution work.",
      "Compare identical output tokens and correctness outcomes. Prefix reuse and faster token execution remove cost, not reasoning.",
    ],
    [
      "The tail exposes the capacity limit.",
      "Switch workloads to see isolated requests become a queue. Lower GPU cost is useful only with acceptable delivery latency.",
    ],
  ][view];
  const trainingCaption = [
    [
      "A higher score should mean identifiable new successes.",
      "Each square is one synthetic task. See which task families improve, and select a square to inspect its outcome.",
    ],
    [
      "Which policy makes better use of more thought?",
      "Compare four checkpoints at 1×, 2×, 4× and 8× allowances. Positions use simulated work, not equally spaced budget labels.",
    ],
    [
      "Net improvement can hide a regression.",
      "Follow the same tasks through both checkpoints. Newly solved cases and old-correct → new-wrong cases stay visible together.",
    ],
  ][view];
  const caption = training ? trainingCaption : inferenceCaption;
  // The laboratory is one block: whatever the rail opens appears on the stage in place.
  // Only when the block is not already aligned does the page glide to it.
  const toStage = () =>
    requestAnimationFrame(() => alignBlock(document.getElementById(`${domain}-cost-lab`)));
  const openView = (i: number) => {
    setView(i);
    setFigureHandoff(null);
    playback.select(selected);
    setMode("explore");
    toStage();
  };
  const openFilm = () => {
    setMode("watch");
    toStage();
  };
  const chapterSlot = <div id={`${domain}-chapters-slot`} className="sr-chapters" />;
  // Every tab value is computed from the same scenario its module opens on:
  // the RL checkpoint at the lab's thought allowance.
  const baseRun = simulateLab(0, budget), rlRun = simulateLab(2, budget);
  const rlFlips = compareTasks(baseRun, rlRun);
  const solvedGain = rlRun.correct - baseRun.correct;
  const rlStatic = simulateLab(2, budget, false, workload), rlFast = simulateLab(2, budget, true, workload);
  const p95 = (r: LabRun) => latencyDistribution(r, 95).threshold.latency;
  const fmt = (v: number, d = 2) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const railItems: RailItem[] = training
    ? [
        { key: "film", title: "The experiment", Glyph: GlyphFrontier, onOpen: openFilm, current: mode === "watch", children: chapterSlot },
        { key: "map", title: "Capability map", term: "every task, every checkpoint", value: `+${solvedGain}`, unit: `net tasks · RL checkpoint at ${budget}× thought`, Glyph: GlyphCapability, onOpen: () => openView(0), current: mode === "explore" && view === 0 },
        { key: "curves", title: "Compute curves", term: "1× · 2× · 4× · 8× thought", value: `${simulateLab(2, 8).correct}`, unit: "of 96 · RL checkpoint at 8× thought", Glyph: GlyphCurves, onOpen: () => openView(1), current: mode === "explore" && view === 1 },
        { key: "audit", title: "Regression audit", term: "gains beside losses", value: `${rlFlips.gained.length} / ${rlFlips.lost.length}`, unit: `gained / lost at ${budget}× thought`, Glyph: GlyphAudit, onOpen: () => openView(2), current: mode === "explore" && view === 2 },
      ]
    : [
        { key: "film", title: "The experiment", Glyph: GlyphExperiment, onOpen: openFilm, current: mode === "watch", children: chapterSlot },
        { key: "composition", title: "Policy × runtime", term: "training lifts accuracy · serving cuts cost", value: `−${Math.round(reductionPercent(rlStatic.correctCost!, rlFast.correctCost!)!)}%`, unit: "GPU-s per correct answer", Glyph: GlyphComposition, onOpen: () => openView(0), current: mode === "explore" && view === 0 },
        { key: "tasks", title: "Where the 96 tasks land", term: "difficulty × GPU-s per task", value: `+${solvedGain}`, unit: `tasks solved · base → RL checkpoint at ${budget}× thought`, Glyph: GlyphTasks, onOpen: () => openView(3), current: mode === "explore" && view === 3 },
        { key: "replay", title: "Execution replay", term: "any of the 96 requests", value: `${fmt(rlStatic.tasks[6].gpuSeconds)} → ${fmt(rlFast.tasks[6].gpuSeconds)}`, unit: "GPU-s · request 7", Glyph: GlyphReplay, onOpen: () => openView(1), current: mode === "explore" && view === 1 },
        { key: "latency", title: "Queue & latency", term: "arrival → completion, ranked", value: `${fmt(p95(rlStatic), 0)} → ${fmt(p95(rlFast), 0)}`, unit: "s · p95 response", Glyph: GlyphLatency, onOpen: () => openView(2), current: mode === "explore" && view === 2 },
      ];
  return (
    <section
      ref={ref}
      id={training ? "post-training-study" : "inference-study"}
      data-vx-page
      data-running={playback.running}
      className={`cs-study rs-laboratory lab-block vx-section-shell vx-accent-${training ? "rose" : "amber"}`}
      aria-labelledby={`${domain}-study-title`}
    >
      <div className="lb-head">
        <nav
          className="rs-chapter-path"
          aria-label={`${training ? "Post-training" : "Inference"} chapter pages`}
        >
          <a href={training ? "#post-training" : "#inference"}>Architecture</a>
          <span>→</span>
          <a href={training ? "#post-training-microscope" : "#inference-microscope"}>
            Component microscope
          </a>
          <span>→</span>
          <strong>Results laboratory</strong>
        </nav>
        <h2 id={`${domain}-study-title`}>
          {training ? tr("What did the model learn?") : tr("Inference optimization")}
        </h2>
        {!training && (
          <div className="br-fork" role="group" aria-label={tr("Two branches of inference optimization")}>
            {([
              ["cheaper", "01", "Same intelligence, cheaper execution", ["Continuous batching", "Prefix reuse (KV cache)", "Faster prefill & decode rates"]],
              ["load", "02", "Serving under load", ["Chunked prefill", "Speculative decoding", "Cache-aware routing", "CPU/GPU overlap"]],
            ] as const).map(([key, n, title, techniques]) => (
              <button
                key={key}
                type="button"
                className="br-branch"
                aria-pressed={inferencePart === key}
                aria-controls={key === "cheaper" ? "inference-cost-lab" : "inference-serving-lab"}
                onClick={() => setInferencePart(key)}
              >
                <i>{n}</i>
                <strong>{tr(title)}</strong>
                <span className="br-techniques">{techniques.map((t) => <em key={t}>{tr(t)}</em>)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="lb-body">
        <div className="lb-bar">
          {training || inferencePart === "cheaper" ? (
            <ModuleBar label={training ? "Post-training laboratory" : "Same intelligence, cheaper execution"} items={railItems} />
          ) : (
            <div id="inference-serving-rail" className="lb-bar-slot" />
          )}
        </div>
        <div className="lb-stage">
      <RetainedLabPanel
        active={training || inferencePart === "cheaper"}
        id={`${domain}-cost-lab`}
        label={
          training
            ? "Post-training laboratory"
            : "Same intelligence, cheaper execution"
        }
      >
        <div
          hidden
          className="rs-mode-switch"
          role="group"
          aria-label={`${training ? "Training" : "Inference"} laboratory mode`}
        >
          <button
            type="button"
            aria-pressed={mode === "watch"}
            aria-controls={`${domain}-experiment`}
            onClick={() => setMode("watch")}
          >
            <strong>▷ Watch the experiment</strong>
            {!training && <small>Scheduling → cache reuse → execution</small>}
          </button>
          <button
            type="button"
            aria-pressed={mode !== "watch"}
            aria-controls={`${domain}-figures`}
            onClick={() => setMode("explore")}
          >
            <strong>⌁ Explore the figures</strong>
            {!training && (
              <small>Policy × runtime · request replay · latency</small>
            )}
          </button>
          {training && <span>Watch → intervene → inspect</span>}
        </div>
        <RetainedLabPanel
          active={mode === "watch"}
          id={`${domain}-experiment`}
          label="Watch the experiment"
        >
          <LabStory
            training={training}
            onFinish={() => {
              if (!training && mode === "watch") {
                setInferencePart("load");
                requestAnimationFrame(() => alignBlock(document.getElementById("inference-study")));
              }
            }}
            evidence={(storyRun, pauseStory) => (
              <LabEvidence run={storyRun} onInspect={pauseStory} />
            )}
            explore={() => setMode("explore")}
          />
        </RetainedLabPanel>
        <RetainedLabPanel
          active={mode === "present"}
          id={`${domain}-figure-story`}
          label="Figure story"
        >
          {!training ? (
            <Suspense
              fallback={
                <p className="ip-loading" role="status">
                  Opening the linked figure tour…
                </p>
              }
            >
              <InferenceFigureTour
                key={`${workload}-${budget}-${figureHandoff?.policy ?? base.policyIndex}`}
                ref={tourRef}
                context={
                  figureHandoff ?? {
                    workload,
                    budget,
                    policy: base.policyIndex as 0 | 2,
                  }
                }
                initialTime={figureHandoff?.time}
                onInspect={(handoff) => {
                  setFigureHandoff(handoff);
                  setFigureRevisions((old) =>
                    old.map((revision, index) =>
                      index === handoff.selection.view
                        ? revision + 1
                        : revision,
                    ),
                  );
                  setView(handoff.selection.view);
                  setBudget(handoff.budget);
                  setWorkload(handoff.workload);
                  playback.select(
                    handoff.selection.view === 0
                      ? handoff.selection.selected
                      : handoff.policy === 0
                        ? 1
                        : 3,
                  );
                  playback.pause();
                  setMode("explore");
                }}
                evidence={(storyRun, pauseStory) => (
                  <LabEvidence run={storyRun} onInspect={pauseStory} />
                )}
              />
            </Suspense>
          ) : mode === "present" ? (
            <FigurePresentation
              training={training}
              onExit={(beat, task) => {
                setView(beat.view);
                setBudget(beat.budget);
                setWorkload(beat.workload);
                if (task !== undefined) setSelectedTask(task);
                playback.select(beat.policy);
                playback.pause();
                setMode("explore");
              }}
              evidence={(storyRun, pauseStory) => (
                <LabEvidence run={storyRun} onInspect={pauseStory} />
              )}
            />
          ) : null}
        </RetainedLabPanel>
        <RetainedLabPanel
          active={mode === "explore"}
          id={`${domain}-figures`}
          label="Explore the figures"
        >
          <>
            <div hidden className={!training ? "rs-explore-tools" : undefined}>
              <div className="rs-film-invite">
                {training && (
                  <p>
                    Follow the change, pause on the mechanism, then inspect the
                    consequence.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setTourVisited(true);
                    setMode("present");
                    requestAnimationFrame(() => tourRef.current?.resume());
                  }}
                >
                  {tourVisited && !training
                    ? "▷ Resume the figure story"
                    : "▷ Play the figure story"}
                </button>
              </div>
              <div
                className="rs-lab-views"
                role="group"
                aria-label={`${training ? "Post-training" : "Inference"} result components`}
              >
                {views.map((v, i) => (
                  <button
                    type="button"
                    key={v.name}
                    aria-pressed={view === i}
                    aria-controls={
                      !training ? `${domain}-figure-${i}` : undefined
                    }
                    onClick={() => {
                      setView(i);
                      setFigureHandoff(null);
                      playback.select(selected);
                    }}
                  >
                    <span aria-hidden="true">{v.symbol}</span>
                    <strong>{v.name}</strong>
                    <small>{v.detail}</small>
                  </button>
                ))}
              </div>
            </div>
            <article
              className="rs-exhibit"
              ref={exhibitRef}
              tabIndex={-1}
              aria-label={views[view].name}
            >
              <div className="rs-context-bar">
                <span className="rs-status rs-status-scenario">
                  {training
                    ? "96 tasks · thought allowance"
                    : "One cohort · 96 tasks"}
                </span>
                <div
                  className="rs-segmented"
                  role="group"
                  aria-label={training ? "Thought allowance" : "Workload trace"}
                >
                  {training
                    ? BUDGETS.map((b) => (
                        <button
                          type="button"
                          key={b}
                          aria-pressed={budget === b}
                          onClick={() => {
                            setBudget(b);
                            playback.select(selected);
                          }}
                        >
                          {b}× cap
                        </button>
                      ))
                    : (["interactive", "shared-prefix"] as const).map((w) => (
                        <button
                          type="button"
                          key={w}
                          aria-pressed={workload === w}
                          onClick={() => {
                            setWorkload(w);
                            setFigureHandoff(null);
                            playback.select(selected);
                          }}
                        >
                          {w === "interactive"
                            ? "Interactive"
                            : "Shared-prefix burst"}
                        </button>
                      ))}
                </div>
              </div>
              {!training ? (
                <>
                  <RetainedLabPanel
                    active={view === 0}
                    id={`${domain}-figure-0`}
                    label="Policy and runtime comparison"
                  >
                    <Suspense
                      fallback={
                        <p className="ip-loading" role="status">
                          Opening the controlled comparison…
                        </p>
                      }
                    >
                      <CompositionExplorer
                        key={`composition-${workload}-${budget}-${figureRevisions[0]}`}
                        points={points}
                        selected={selected}
                        onSelect={playback.select}
                        initial={
                          figureHandoff?.selection.view === 0
                            ? figureHandoff.selection.state
                            : undefined
                        }
                        evidence={(selectedRun, pause) => (
                          <LabEvidence run={selectedRun} onInspect={pause} />
                        )}
                      />
                    </Suspense>
                  </RetainedLabPanel>
                  <RetainedLabPanel
                    active={view === 1}
                    id={`${domain}-figure-1`}
                    label="Matched request replay"
                  >
                    <Suspense
                      fallback={
                        <p className="ip-loading" role="status">
                          Opening the matched request replay…
                        </p>
                      }
                    >
                      <div ref={replayHost} className="gc-host">
                      <GhostCursor root={replayHost} script={REPLAY_DEMO} enabled={mode === "explore" && view === 1} />
                      <RequestReplayExplorer
                        key={`${base.policyIndex}-${budget}-${workload}-${figureRevisions[1]}`}
                        baseline={base}
                        initial={
                          figureHandoff?.selection.view === 1
                            ? figureHandoff.selection.state
                            : undefined
                        }
                        onPolicy={(policy) => {
                          setFigureHandoff(null);
                          playback.select(policy === 0 ? 1 : 3);
                        }}
                        evidence={(selectedRun, pause) => (
                          <LabEvidence run={selectedRun} onInspect={pause} />
                        )}
                      />
                      </div>
                    </Suspense>
                  </RetainedLabPanel>
                  <RetainedLabPanel
                    active={view === 2}
                    id={`${domain}-figure-2`}
                    label="Queue and response latency"
                  >
                    <Suspense
                      fallback={
                        <p className="ip-loading" role="status">
                          Opening the queue and latency investigation…
                        </p>
                      }
                    >
                      <div ref={latencyHost} className="gc-host">
                      <GhostCursor root={latencyHost} script={LATENCY_DEMO} enabled={mode === "explore" && view === 2} startDelay={1000} restDelay={1800} />
                      <LoadLatencyExplorer
                        key={`${base.policyIndex}-${budget}-${workload}-${figureRevisions[2]}`}
                        baseline={base}
                        optimized={optimized}
                        initial={
                          figureHandoff?.selection.view === 2
                            ? figureHandoff.selection.state
                            : undefined
                        }
                        onPolicy={(policy) => {
                          setFigureHandoff(null);
                          playback.select(policy === 0 ? 1 : 3);
                        }}
                        evidence={(selectedRun, pause) => (
                          <LabEvidence run={selectedRun} onInspect={pause} />
                        )}
                      />
                      </div>
                    </Suspense>
                  </RetainedLabPanel>
                  <RetainedLabPanel
                    active={view === 3}
                    id={`${domain}-figure-3`}
                    label="Where the 96 tasks land"
                  >
                    <TaskLanding budget={budget} active={mode === "explore" && view === 3} />
                  </RetainedLabPanel>
                </>
              ) : (
                <>
                  <p className="rs-pan-hint">
                    Scroll the figure sideways to inspect every detail →
                  </p>
                  <div className="rs-stage">
                    <div
                      className="rs-chart-region"
                      role="region"
                      tabIndex={0}
                      aria-label="Interactive synthetic results graphic; horizontally scrollable on narrow screens"
                    >
                      {training ? (
                        view === 0 ? (
                          <CapabilityShiftPlot
                            before={base}
                            after={run}
                            onTask={inspected}
                            selectedTask={selectedTask}
                          />
                        ) : view === 1 ? (
                          <LabScalingPlot
                            policy={selected}
                            budget={budget}
                            onSelect={selectCurve}
                          />
                        ) : (
                          <RegressionAuditPlot before={base} after={run} />
                        )
                      ) : null}
                    </div>
                    <aside
                      className="rs-readout"
                      aria-label="Selected synthetic result"
                    >
                      <span className="rs-readout-label">
                        {training
                          ? `${budget}× nominal cap`
                          : `${workload} · ${budget}× allowance`}
                      </span>
                      <h3>{label}</h3>
                      <LabMetrics
                        run={run}
                        baseline={base}
                        training={training}
                      />
                      {training ? (
                        view === 0 ? (
                          <TaskReadout
                            run={run}
                            taskId={selectedTask}
                            onTask={inspected}
                          />
                        ) : (
                          <div className="rs-flip-readout">
                            <span>
                              <b>+{flips.gained.length}</b> newly correct
                            </span>
                            <span>
                              <b>−{flips.lost.length}</b> negative flips
                            </span>
                          </div>
                        )
                      ) : (
                        <div className="rs-latency-readout">
                          <span>Simulated p95 latency</span>
                          <strong>
                            {base.p95.toFixed(1)} → {optimized.p95.toFixed(1)} s
                          </strong>
                          <small>
                            {view === 2
                              ? "Queue time included"
                              : "Static → optimized, matched checkpoint"}
                          </small>
                        </div>
                      )}
                      <LabEvidence run={run} onInspect={playback.pause} />
                    </aside>
                  </div>
                  <div className="rs-policy-strip">
                    <div
                      role="group"
                      aria-label={
                        training ? "Checkpoint" : "Composition condition"
                      }
                    >
                      {(training
                        ? POLICIES.map((p) => p.name)
                        : points.map((p) => p.label)
                      ).map((name, i) => (
                        <button
                          type="button"
                          aria-pressed={selected === i}
                          key={name}
                          onClick={() => playback.select(i)}
                        >
                          <i
                            style={{
                              background: training
                                ? POLICIES[i].color
                                : ["#a9b6c7", "#ffc267", "#f3a0bc", "#b8e986"][
                                    i
                                  ],
                            }}
                          />
                          {name}
                        </button>
                      ))}
                    </div>
                    <div className="rs-playback">
                      <button
                        type="button"
                        disabled={playback.reduced}
                        aria-label={
                          playback.playing
                            ? "Pause lab walkthrough"
                            : "Play lab walkthrough"
                        }
                        onClick={playback.toggle}
                      >
                        {playback.reduced
                          ? "Reduced motion"
                          : playback.playing
                            ? "Ⅱ Pause"
                            : "▷ Play"}
                      </button>
                      <button
                        type="button"
                        disabled={playback.reduced}
                        aria-label="Replay lab walkthrough"
                        onClick={playback.replay}
                      >
                        ↺
                      </button>
                    </div>
                  </div>
                  <div className="rs-story-caption">
                    <strong>{caption[0]}</strong>
                    <span>{caption[1]}</span>
                  </div>
                  <div className="rs-gate-strip">
                    <span>
                      {training ? "Quality gate" : "Cognition gate"}{" "}
                      <b>
                        {training
                          ? "paired gains + negative flips"
                          : "identical tasks, output tokens & outcomes"}
                      </b>
                    </span>
                  </div>
                </>
              )}
            </article>
          </>
        </RetainedLabPanel>
      </RetainedLabPanel>
      {!training && (
        <RetainedLabPanel
          active={inferencePart === "load"}
          id="inference-serving-lab"
          label="Serving under load"
        >
          <Suspense
            fallback={
              <p className="ip-loading" role="status">
                Opening the serving investigation…
              </p>
            }
          >
            <ServingUnderLoad />
          </Suspense>
        </RetainedLabPanel>
      )}
        </div>
      </div>
    </section>
  );
}
