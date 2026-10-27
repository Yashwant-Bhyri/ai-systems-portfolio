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
import { useStageHold } from "./stagecraft/stage-hold";
import { useStageFit } from "./stagecraft/stage-fit";
import { FocusCaption, StageMeter } from "./stagecraft/stage-meter";
import "./stagecraft/viewport.css";
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
import "./stagecraft/lab-flow.css";
import "./stagecraft/legibility.css";
import { ModuleBar, type RailItem } from "./stagecraft/side-rail";
import { ExplorationReel, type ReelItem } from "./stagecraft/reel";
import { LabNavSwitcher, useLabNav } from "./stagecraft/lab-nav";
import { LabLanding, TitleRail, type Pathway, type ShowItem } from "./stagecraft/title-show";
import { SERVING_RAIL } from "./serving-rail-meta";
import { INFERENCE_STORY, TRAINING_STORY } from "./lab-story-data";
import { TaskLanding } from "./stagecraft/task-landing";
import { FleetModule } from "./stagecraft/fleet-module";
import { ModuleArc } from "./stagecraft/module-arc";
import { FLEET_ARC } from "./arc-scenes/fleet-arc";
import { InsideScan } from "./stagecraft/scan/inside-scan";
import { CapabilityTerrain } from "./stagecraft/scan/capability-terrain";
import { useTr } from "../exhibit/i18n";
import { GhostCursor, type CursorStep } from "./stagecraft/ghost-cursor";
import {
  GlyphAudit,
  GlyphCapability,
  GlyphComposition,
  GlyphCurves,
  GlyphExperiment,
  GlyphFleet,
  GlyphInside,
  GlyphTerrain,
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
  { target: ".rr-measure-chapters button:nth-child(2)", label: "Input only", hold: 8200 },
  { target: ".rr-measure-chapters button:nth-child(3)", label: "Answer only", hold: 8200 },
  { target: ".rr-measure-chapters button:nth-child(4)", label: "Wait + execute", hold: 8200 },
  { target: ".rr-measure-chapters button:nth-child(1)", label: "Total GPU work", hold: 8200 },
]
const LATENCY_DEMO: readonly CursorStep[] = [
  // The film plays to its end (ranking, then the rank scan); only then does the cursor walk the percentiles.
  { target: ".ll-explorer[data-done=\"true\"] .ll-percentiles button:nth-child(3)", label: "p99 · the slowest few", hold: 3600, waitFor: 70000 },
  { target: ".ll-percentiles button:nth-child(1)", label: "p50 · the median", hold: 3600 },
  { target: ".ll-percentiles button:nth-child(2)", label: "p95 · the slow tail", hold: 4200 },
]

/**
 * Bring what the visitor just opened into view. The one-screen block aligns
 * flush with the viewport; the flow layouts glide only when the stage's top
 * is off screen, and land it just below the sticky reel, never under it.
 */
function alignBlock(inside: Element | null) {
  const block = inside?.closest(".lab-block, .lab-flow-show");
  const stage = inside?.closest(".lf-stage");
  let top: number;
  if (block) {
    top = block.getBoundingClientRect().top;
    if (Math.abs(top) < 4) return;
  } else if (stage) {
    // Site header (78) plus, on top, the condensed reel that sits over the stage once the glide ends.
    const cover = stage.closest(".lab-flow-top") ? 78 + 152 + 8 : 90;
    const rect = stage.getBoundingClientRect();
    if (rect.top >= cover - 4 && rect.top < window.innerHeight * 0.45) return;
    top = rect.top - cover;
  } else return;
  // Page snapping would fight the glide; lift it until the glide ends.
  const html = document.documentElement, snap = html.style.scrollSnapType;
  html.style.scrollSnapType = "none";
  window.scrollTo({ top: top + window.scrollY, behavior: "smooth" });
  window.setTimeout(() => { html.style.scrollSnapType = snap; }, 1400);
}

/* Post-training explorers tour themselves: every checkpoint, then every thought allowance. */
const TRAINING_DEMO: readonly CursorStep[] = [
  { target: ".rs-policy-strip button:nth-of-type(1)", label: "Base checkpoint", hold: 4200 },
  { target: ".rs-policy-strip button:nth-of-type(2)", label: "After SFT", hold: 4200 },
  { target: ".rs-policy-strip button:nth-of-type(3)", label: "RL checkpoint", hold: 4600 },
  { target: ".rs-policy-strip button:nth-of-type(4)", label: "Lean RL", hold: 4600 },
  { target: ".rs-context-bar .rs-segmented button:nth-of-type(1)", label: "1× thought", hold: 3800 },
  { target: ".rs-context-bar .rs-segmented button:nth-of-type(3)", label: "4× thought", hold: 3800 },
  { target: ".rs-context-bar .rs-segmented button:nth-of-type(4)", label: "8× thought", hold: 3800 },
  { target: ".rs-context-bar .rs-segmented button:nth-of-type(2)", label: "Back to 2×", hold: 2600 },
  { target: ".rs-policy-strip button:nth-of-type(3)", label: "RL checkpoint", hold: 2600 },
]

const INFERENCE_VIEWS = [
  { name: "Policy × runtime", detail: "Compare cost & accuracy", symbol: "↖" },
  {
    name: "Execution replay",
    detail: "Inspect any of 96 requests",
    symbol: "⇉",
  },
  { name: "Queue & latency", detail: "Compare waiting & p95", symbol: "⌁" },
];
const TRAINING_VIEWS = [
  { name: "Capability map", detail: "See which tasks change", symbol: "⊞" },
  { name: "Compute curves", detail: "Compare all four policies", symbol: "⌁" },
  { name: "Regression audit", detail: "Follow gains and losses", symbol: "⇄" },
  { name: "Where the 96 tasks land", detail: "Base vs RL checkpoint", symbol: "⁘" },
  { name: "Elastic RL on 64 GPUs", detail: "Rollout and training roles per GPU", symbol: "≋" },
  { name: "Inside the model", detail: "Base vs RL checkpoint, token × layer", symbol: "▦" },
  { name: "Capability terrain", detail: "96 tasks × six checkpoints", symbol: "⛰" },
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
              {POLICIES[run.policyIndex].name} · {run.budget}× thought
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

const INFERENCE_PATHWAYS: readonly Pathway[] = [
  { n: "01", title: "Same intelligence, cheaper execution", short: "Cheaper execution", techniques: ["Free-worker scheduling", "Prefix reuse (KV cache)", "Faster prefill & decode rates"] },
  { n: "02", title: "Optimized serving under load", short: "Optimized serving under load", techniques: ["Chunked prefill", "Speculative decoding", "Cache-aware routing", "CPU/GPU overlap"] },
];
const TRAINING_PATHWAYS: readonly Pathway[] = [
  { n: "01", title: "What did the model learn?", short: "Post-training", techniques: ["SFT + LoRA", "Correctness RL", "More thought", "Lean RL", "Elastic RL"] },
];
/** Modules without a scripted demonstration stay on stage this long before the show moves on. */
const DWELL: Record<string, number> = { composition: 26000, map: 100000, glossary: 24000, tasks: 22000, inside: 40000, terrain: 36000 };
/** The next module's ring fills over this long once the current one has told its story. */
const COUNTDOWN = 5200;

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
  const stageRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  // Title show: the landing (inference only), the flight from it, and which module is telling its story.
  const [landingPhase, setLandingPhase] = useState<"on" | "leaving" | "off">(training ? "off" : "on");
  const [servingKey, setServingKey] = useState("pressure");
  const [chapter, setChapter] = useState("");
  const [status, setStatus] = useState<{ key: string; phase: "running" | "done" | "taken" }>({ key: "", phase: "running" });
  const [labInView, setLabInView] = useState(false);
  const [filmRun, setFilmRun] = useState(0);
  const tr = useTr();
  const labNav = useLabNav();
  useStageFit(stageRef, fitRef, labNav === "show");
  // In the top orientation the reel condenses once the visitor scrolls into the stage.
  const [scrolledIn, setScrolledIn] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      setScrolledIn(top < -120 && top > -el.offsetHeight + 300);
    };
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); };
  }, [ref]);
  const condensed = labNav === "top" && scrolledIn;
  useStageHold(stageRef, `${inferencePart}|${mode}|${view}|${labNav}`);
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
        { key: "film", title: "The experiment", term: "base → SFT → RL → 4× thought → lean RL", value: "28 → 82", unit: "of 96 synthetic tasks", Glyph: GlyphFrontier, onOpen: openFilm, current: mode === "watch", children: chapterSlot },
        { key: "inside", title: "Inside the model", term: "base → RL checkpoint · 36 layers × 50 tokens", value: "7 of 50", unit: "words the base model would have written differently", Glyph: GlyphInside, onOpen: () => openView(5), current: mode === "explore" && view === 5 },
        { key: "terrain", title: "Capability terrain", term: "96 tasks × six checkpoints", value: `+${simulateLab(3, 4).correct - simulateLab(0, 1).correct}`, unit: "tasks raised above the line, base → lean RL", Glyph: GlyphTerrain, onOpen: () => openView(6), current: mode === "explore" && view === 6 },
        { key: "map", title: "Capability map", term: "every task, every checkpoint", value: `+${solvedGain}`, unit: `net tasks · RL checkpoint at ${budget}× thought`, Glyph: GlyphCapability, onOpen: () => openView(0), current: mode === "explore" && view === 0 },
        { key: "curves", title: "Compute curves", term: "1× · 2× · 4× · 8× thought", value: `${simulateLab(2, 8).correct}`, unit: "of 96 · RL checkpoint at 8× thought", Glyph: GlyphCurves, onOpen: () => openView(1), current: mode === "explore" && view === 1 },
        { key: "tasks", title: "Where the 96 tasks land", term: "difficulty × GPU-s per task", value: `+${solvedGain}`, unit: `tasks solved · base → RL checkpoint at ${budget}× thought`, Glyph: GlyphTasks, onOpen: () => openView(3), current: mode === "explore" && view === 3 },
        { key: "fleet", title: "Elastic RL on 64 GPUs", term: "rollout ↔ training role per GPU · after QwenGyre", value: "4 → 7", unit: "RL steps in 14 min · 1.96×", Glyph: GlyphFleet, onOpen: () => openView(4), current: mode === "explore" && view === 4 },
        { key: "audit", title: "Regression audit", term: "gains beside losses", value: `${rlFlips.gained.length} / ${rlFlips.lost.length}`, unit: `gained / lost at ${budget}× thought`, Glyph: GlyphAudit, onOpen: () => openView(2), current: mode === "explore" && view === 2 },
      ]
    : [
        { key: "film", title: "The experiment", term: "free-worker scheduling → prefix reuse → faster rates", value: `${fmt(rlStatic.correctCost!)} → ${fmt(rlFast.correctCost!)}`, unit: "GPU-s per correct answer", Glyph: GlyphExperiment, onOpen: openFilm, current: mode === "watch", children: chapterSlot },
        { key: "composition", title: "Policy × runtime", term: "training lifts accuracy · serving cuts cost · both at once", value: `${simulateLab(0, budget, false, workload).correct} → ${rlFast.correct}`, unit: (() => { const pct = Math.round(reductionPercent(simulateLab(0, budget, false, workload).correctCost!, rlFast.correctCost!)!); return `of 96 correct · ${Math.abs(pct)}% ${pct >= 0 ? "less" : "more"} GPU-s per correct answer`; })(), Glyph: GlyphComposition, onOpen: () => openView(0), current: mode === "explore" && view === 0 },
        { key: "replay", title: "Execution replay", term: "any of the 96 requests", value: `${fmt(rlStatic.tasks[6].gpuSeconds)} → ${fmt(rlFast.tasks[6].gpuSeconds)}`, unit: "GPU-s · request 7", Glyph: GlyphReplay, onOpen: () => openView(1), current: mode === "explore" && view === 1 },
        { key: "latency", title: "Queue & latency", term: "arrival → completion, ranked", value: `${fmt(p95(rlStatic), 0)} → ${fmt(p95(rlFast), 0)}`, unit: "s · p95 response", Glyph: GlyphLatency, onOpen: () => openView(2), current: mode === "explore" && view === 2 },
      ];
  // Deep links from the project overview: #inference-study/replay opens that module.
  const railRef = useRef(railItems);
  useEffect(() => { railRef.current = railItems; });
  useEffect(() => {
    const sectionId = training ? "post-training-study" : "inference-study";
    const SERVING = ["pressure", "draft", "cache", "overlap", "map", "glossary"];
    const open = () => {
      const [id, key] = window.location.hash.slice(1).split("/");
      if (id !== sectionId || !key) return;
      setLandingPhase("off");
      if (!training && SERVING.includes(key)) {
        setInferencePart("load");
        // Part 2 loads lazily; repeat the request until it has mounted (opening is idempotent).
        [400, 1400, 3000].forEach((ms) => window.setTimeout(() => window.dispatchEvent(new CustomEvent("lab:serving-open", { detail: key })), ms));
      } else {
        if (!training) setInferencePart("cheaper");
        railRef.current.find((item) => item.key === key)?.onOpen();
      }
      window.setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: "instant", block: "start" }), 60);
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, [training]);
  // ── Title show ──
  const show = labNav === "show";
  const pathways = training ? TRAINING_PATHWAYS : INFERENCE_PATHWAYS;
  const showItems: ShowItem[] = [
    ...railItems.map((m) => ({
      key: m.key, title: m.title, term: m.term, value: m.value, unit: m.unit, Glyph: m.Glyph, pathway: 0,
      chapters: m.key === "film" ? (training ? TRAINING_STORY : INFERENCE_STORY).map((c) => c.name) : undefined,
    })),
    ...(training ? [] : SERVING_RAIL.map((m) => ({ ...m, pathway: 1 }))),
  ];
  const currentKey = !training && inferencePart === "load" ? servingKey : railItems.find((i) => i.current)?.key ?? "film";
  const order = showItems.map((i) => i.key);
  const nextKey = order[(order.indexOf(currentKey) + 1) % order.length];
  const phase = status.key === currentKey ? status.phase : "running";
  const nowLabel = currentKey === "film" ? chapter || "The experiment" : showItems.find((i) => i.key === currentKey)?.title ?? "";
  const openSeq = useRef(0);
  const openKey = (key: string) => {
    const seq = ++openSeq.current;
    setLandingPhase((p) => (p === "on" ? "off" : p));
    if (key === "film" && currentKey !== "film") setFilmRun((n) => n + 1);
    if (!training && SERVING_RAIL.some((m) => m.key === key)) {
      setInferencePart("load");
      // The serving lab loads lazily; ask until it has mounted, unless the visitor has moved on.
      [0, 400, 1400, 3000].forEach((ms) => window.setTimeout(() => {
        if (openSeq.current === seq) window.dispatchEvent(new CustomEvent("lab:serving-open", { detail: key }));
      }, ms));
    } else {
      if (!training) setInferencePart("cheaper");
      railRef.current.find((item) => item.key === key)?.onOpen();
    }
  };
  const openKeyRef = useRef(openKey);
  const currentRef = useRef(currentKey);
  useEffect(() => { openKeyRef.current = openKey; currentRef.current = currentKey; });
  const startShow = (key: string) => {
    setLandingPhase("leaving");
    openKey(key);
    window.setTimeout(() => setLandingPhase((p) => (p === "leaving" ? "off" : p)), 480);
  };
  useEffect(() => {
    const onServing = (e: Event) => setServingKey((e as CustomEvent<string>).detail);
    const onChapter = (e: Event) => {
      const d = (e as CustomEvent<{ training: boolean; name?: string }>).detail;
      if (d.training === training && d.name) setChapter(d.name);
    };
    window.addEventListener("lab:serving-current", onServing);
    window.addEventListener("lab:film-chapter", onChapter);
    return () => { window.removeEventListener("lab:serving-current", onServing); window.removeEventListener("lab:film-chapter", onChapter); };
  }, [training]);
  // A module has told its story when its demonstration completes a pass; operating it hands it to the visitor.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const done = () => setStatus((s) => (s.key === currentRef.current && s.phase === "taken" ? s : { key: currentRef.current, phase: "done" }));
    const taken = () => setStatus({ key: currentRef.current, phase: "taken" });
    el.addEventListener("lab:module-round", done);
    el.addEventListener("lab:module-taken", taken);
    const io = new IntersectionObserver(([e]) => setLabInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => { el.removeEventListener("lab:module-round", done); el.removeEventListener("lab:module-taken", taken); io.disconnect(); };
  }, [ref]);
  useEffect(() => {
    const ms = DWELL[currentKey];
    if (!show || landingPhase === "on" || !ms) return;
    const id = window.setTimeout(() => setStatus((s) => (s.key === currentKey && s.phase === "taken" ? s : { key: currentKey, phase: "done" })), ms);
    return () => window.clearTimeout(id);
  }, [show, landingPhase, currentKey]);
  useEffect(() => {
    if (!show || landingPhase === "on" || phase !== "done" || !labInView) return;
    const id = window.setTimeout(() => openKeyRef.current(nextKey), COUNTDOWN);
    return () => window.clearTimeout(id);
  }, [show, landingPhase, phase, labInView, nextKey]);
  const landingOn = show && landingPhase === "on";

  // The reel orientations keep the stage at its natural size; "bar" is the one-screen block.
  const block = labNav === "bar";
  const reelItems: readonly ReelItem[] = railItems;
  const navLabel = labNav === "side" ? "Go deeper" : training ? "Go deeper · post-training laboratory" : "Go deeper · same intelligence, cheaper execution";
  const navNode = block ? (
    <div className="lb-bar">
      {training || inferencePart === "cheaper" ? (
        <ModuleBar label={training ? "Post-training laboratory" : "Same intelligence, cheaper execution"} items={railItems} />
      ) : (
        <div id="inference-serving-rail" className="lb-bar-slot" />
      )}
    </div>
  ) : show ? (
    <div className="lf-nav">
      <TitleRail
        items={showItems}
        pathways={pathways}
        current={currentKey}
        now={nowLabel}
        next={nextKey}
        phase={phase}
        countdownMs={COUNTDOWN}
        onOpen={openKey}
        onLanding={training ? undefined : () => setLandingPhase("on")}
      />
    </div>
  ) : (
    <div className="lf-nav" data-condensed={condensed || undefined}>
      {training || inferencePart === "cheaper" ? (
        <ExplorationReel label={navLabel} items={reelItems} orientation={labNav === "side" ? "column" : "row"} compact={labNav === "dock" || (labNav === "top" && condensed)} note="Hover to hold · click to put it on the stage" />
      ) : (
        <div id="inference-serving-rail" className="lf-nav-slot" />
      )}
    </div>
  );
  return (
    <section
      ref={ref}
      id={training ? "post-training-study" : "inference-study"}
      data-vx-page
      data-running={playback.running}
      data-nav={labNav}
      className={`cs-study rs-laboratory ${block ? "lab-block" : `lab-flow lab-flow-${labNav}`} vx-section-shell vx-accent-${training ? "rose" : "amber"}`}
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
        {show && <StageMeter moduleKey={`${currentKey}|${chapter}`} />}
        {!training && (
          <div className="br-fork" role="group" aria-label={tr("Two branches of inference optimization")}>
            {([
              ["cheaper", "01", "Same intelligence, cheaper execution", ["Free-worker scheduling", "Prefix reuse (KV cache)", "Faster prefill & decode rates"]],
              ["load", "02", "Optimized serving under load", ["Chunked prefill", "Speculative decoding", "Cache-aware routing", "CPU/GPU overlap"]],
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
      <div className={block ? "lb-body" : "lf-body"} data-landing={landingOn || undefined}>
        {show && landingPhase !== "off" && (
          <LabLanding pathways={pathways} items={showItems} leaving={landingPhase === "leaving"} onStart={startShow} />
        )}
        {labNav !== "dock" && !landingOn && navNode}
        <div ref={stageRef} className={block ? "lb-stage" : "lf-stage"} hidden={landingOn}>
          {!block && (training || inferencePart === "cheaper") && mode === "watch" && <div className="lf-chapters">{chapterSlot}</div>}
        {show && <FocusCaption moduleKey={`${currentKey}|${chapter}`} />}
        <div ref={fitRef} className="lf-fit">
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
            key={filmRun}
            training={training}
            onFinish={() => {
              if (show) {
                setStatus((s) => (s.key === "film" && s.phase === "taken" ? s : { key: "film", phase: "done" }));
                return;
              }
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
              data-view={view}
              data-training={training || undefined}
              ref={exhibitRef}
              tabIndex={-1}
              aria-label={views[view].name}
            >
              {training && (
                <GhostCursor root={exhibitRef} script={TRAINING_DEMO} enabled={mode === "explore" && view < 3} startDelay={2500} restDelay={2200} />
              )}
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
                          {b}× thought
                        </button>
                      ))
                    : (["shared-prefix", "interactive"] as const).map((w) => (
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
                            ? "Different documents"
                            : "One shared document"}
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
                </>
              ) : view === 3 ? (
                <TaskLanding budget={budget} active={mode === "explore"} />
              ) : view === 5 ? (
                <InsideScan active={mode === "explore" && view === 5} />
              ) : view === 6 ? (
                <CapabilityTerrain active={mode === "explore" && view === 6} />
              ) : view === 4 ? (
                <ModuleArc active={mode === "explore" && view === 4} {...FLEET_ARC}><FleetModule active={mode === "explore"} /></ModuleArc>
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
                          ? `${budget}× thought`
                          : `${workload === "interactive" ? "Different documents" : "One shared document"} · ${budget}× thought`}
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
          label="Optimized serving under load"
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
        {labNav === "dock" && navNode}
      </div>
      {!training && <LabNavSwitcher />}
    </section>
  );
}
