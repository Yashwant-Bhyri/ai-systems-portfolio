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
import { AuditLedger } from "./stagecraft/audit-ledger";
import { FocusCaption, StageMeter, highlight, useSummaryPause } from "./stagecraft/stage-meter";
import "./stagecraft/viewport.css";
import { useStudyPlayback } from "./use-study-playback";
import { LabStory } from "./lab-story";
import { inferenceStoryRuns } from "./lab-story-data";
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
import "./stagecraft/polish.css";
import { ModuleBar, type RailItem } from "./stagecraft/side-rail";
import { ExplorationReel, type ReelItem } from "./stagecraft/reel";
import { LabNavSwitcher, useLabNav } from "./stagecraft/lab-nav";
import { LabLanding, TitleRail, type IntroStep, type Pathway, type ShowItem } from "./stagecraft/title-show";
import { ChoiceCard, LineCard, ModuleBrief, moduleBriefs } from "./stagecraft/module-brief";
import { BigPicture } from "./stagecraft/big-picture";
import { Manifold } from "./stagecraft/manifold";
import { ServingRace } from "./stagecraft/serving-race";
import { SERVING_RAIL } from "./serving-rail-meta";
import { TaskLanding } from "./stagecraft/task-landing";
import { FleetModule } from "./stagecraft/fleet-module";
import { ModuleArc } from "./stagecraft/module-arc";
import { FLEET_ARC } from "./arc-scenes/fleet-arc";
import { InsideScan } from "./stagecraft/scan/inside-scan";
import { CapabilityTerrain } from "./stagecraft/scan/capability-terrain";
import { ExhibitScene } from "./stagecraft/exhibit-host";
import { PolicyGrpo } from "../exhibit/policy/grpo";
import { PolicyFrontierStory, FRONTIER_STORY_MS } from "../exhibit/policy/frontier-story";
import { useTr } from "../exhibit/i18n";
import { GhostCursor, type CursorStep } from "./stagecraft/ghost-cursor";
import {
  GlyphAudit,
  GlyphBigPicture,
  GlyphManifold,
  GlyphRace,
  GlyphLearn,
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
// The opening measure plays its full 20 seconds first (the cursor's start delay); each one after does too.
const REPLAY_MS = 20600;
const REPLAY_DEMO: readonly CursorStep[] = [
  { target: ".rr-measure-chapters button:nth-child(2)", label: "Total GPU work", hold: REPLAY_MS },
  { target: ".rr-measure-chapters button:nth-child(3)", label: "Input only", hold: REPLAY_MS },
  { target: ".rr-measure-chapters button:nth-child(4)", label: "Answer only", hold: REPLAY_MS },
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

/* Post-training explorers tour themselves, briskly: every checkpoint, then every thinking budget. */
const TRAINING_DEMO: readonly CursorStep[] = [
  { target: ".rs-policy-strip button:nth-of-type(1)", label: "Base checkpoint", hold: 1500 },
  { target: ".rs-policy-strip button:nth-of-type(2)", label: "After SFT", hold: 1500 },
  { target: ".rs-policy-strip button:nth-of-type(3)", label: "RL checkpoint", hold: 1700 },
  { target: ".rs-policy-strip button:nth-of-type(4)", label: "Lean RL", hold: 1700 },
  { target: ".rs-context-bar .rs-segmented button:nth-of-type(1)", label: "1× thinking budget", hold: 1500 },
  { target: ".rs-context-bar .rs-segmented button:nth-of-type(3)", label: "4× thinking budget", hold: 1500 },
  { target: ".rs-context-bar .rs-segmented button:nth-of-type(4)", label: "8× thinking budget", hold: 1500 },
  { target: ".rs-context-bar .rs-segmented button:nth-of-type(2)", label: "Back to 2×", hold: 1200 },
  { target: ".rs-policy-strip button:nth-of-type(3)", label: "RL checkpoint", hold: 1200 },
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
  { name: "Learning from outcomes", detail: "GRPO, iteration by iteration", symbol: "↗" },
  { name: "The frontier", detail: "Accuracy against GPU time per answer", symbol: "↖" },
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
              {POLICIES[run.policyIndex].name} · {run.budget}× thinking budget
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
  { n: "01", title: "Serving the same intelligence at cheaper execution", short: "Cheaper execution", techniques: [] },
  { n: "02", title: "Optimized serving under load", short: "Optimized serving under load", techniques: [] },
];
const TRAINING_PATHWAYS: readonly Pathway[] = [
  { n: "01", title: "What did the model learn?", short: "In detail", techniques: [] },
];
const INFERENCE_INTRO: readonly IntroStep[] = [
  { kind: "line", text: "Inference optimization can be done in *two ways*", ms: 2800 },
  { kind: "path", index: 0 },
  { kind: "path", index: 1 },
  { kind: "line", text: "First, the *summary*", ms: 2200 },
];
const TRAINING_INTRO: readonly IntroStep[] = [
  { kind: "line", text: "One base model, made *smarter* on maths and coding", ms: 3000 },
  { kind: "path", index: 0 },
  { kind: "line", text: "First, the *summary*", ms: 2200 },
];
/**
 * The summary: 2–3 minutes through the strongest moments, in the order the story is told,
 * on the real figures, with its own back, pause and forward. The modules after it are the depth.
 */
type Clip = { key?: string; title?: string; ms: number; line?: string; card?: string; beat?: number; film?: { step: number; at?: number; frame?: boolean }; seek?: number };
const T_ = { base: simulateLab(0, 1), sft: simulateLab(1, 1), rl: simulateLab(2, 1), rl4: simulateLab(2, 4), lean: simulateLab(3, 4) };
const FEWER = Math.round(100 * (1 - T_.lean.tokens / T_.lean.n / (T_.rl4.tokens / T_.rl4.n)));
const R_ = inferenceStoryRuns("shared-prefix");
const PCT_LESS = Math.round(100 * (1 - R_[3].correctCost! / R_[0].correctCost!));
const INFERENCE_CLIPS: readonly Clip[] = [
  { key: "race", ms: 22000, line: "The same 96 requests on one clock: the baseline above, optimized below" },
  { card: `First: serving the same intelligence with *${PCT_LESS}% less compute*`, ms: 2800 },
  { key: "setup", ms: 12500, seek: 7000, line: "Three levers act on all 96 requests, and not one answer changes" },
  { key: "setup", ms: 13000, seek: 22000, line: "Where each lever works in the serving path" },
  { key: "replay", ms: 15000, line: "One request, before and after: when the prompt is read, when tokens start" },
  { key: "composition", ms: 15000, seek: 3000, line: "Training raises accuracy; faster serving takes back most of the extra cost" },
  { key: "latency", ms: 14000, seek: 12000, line: "Under a queue the saving compounds, most of all for the slowest requests" },
  { card: "Second: *optimized serving under load*", ms: 2800 },
  { key: "pressure", ms: 9500, beat: 0, line: "Problem: one long prompt freezes every answer streaming on that GPU" },
  { key: "pressure", ms: 7500, beat: 2, line: "Chunked prefill: read the prompt in chunks, so answers keep streaming" },
  { key: "draft", ms: 9000, beat: 0, line: "Problem: the large model writes one word per full pass" },
  { key: "draft", ms: 8000, beat: 1, line: "Speculative decoding: a small draft model predicts tokens, the large one verifies them" },
  { key: "cache", ms: 9000, beat: 0, line: "Problem: routing by load ignores what is already in memory" },
  { key: "cache", ms: 7500, beat: 2, line: "Cache-aware routing: send each request to where its prefix is cached" },
  { key: "overlap", ms: 9000, beat: 0, line: "Problem: the GPU waits while the CPU prepares the next step" },
  { key: "overlap", ms: 7500, beat: 1, line: "CPU/GPU overlap: prepare the next step during this one" },
  { key: "map", ms: 9000, line: "All of it, working together on one serving clock" },
  { key: "glossary", ms: 10000, line: "And the vocabulary behind it" },
];
const TRAINING_CLIPS: readonly Clip[] = [
  { card: "The goal: the same model, more *correct answers* on maths and coding", ms: 2800 },
  { key: "manifold", ms: 21000, line: "Every task, three models, six dimensions: turn it and each view tells a different truth" },
  { key: "inside", ms: 15500, line: "On one coding task: the layers that moved, and the words that changed" },
  { key: "learn", ms: 16800, line: `Learning from outcomes: the tests decide which attempts survive, ${T_.sft.correct} → ${T_.rl.correct} of 96` },
  { key: "terrain", ms: 13500, line: `Each thing it learned becomes skill: ${T_.base.correct} → ${T_.lean.correct} of 96 across six checkpoints` },
  { key: "frontier", ms: 17000, line: "Accuracy against GPU time per correct answer, move by move" },
  { key: "curves", ms: 13000, line: "What more thinking buys each checkpoint" },
  { key: "film", title: "Lean RL", ms: 12000, film: { step: 4 }, line: `Lean RL: the same ${T_.lean.correct} answers, ${FEWER}% fewer tokens` },
  { key: "fleet", ms: 9000, beat: 0, line: "Problem: 64 GPUs wait at a barrier on every RL step" },
  { key: "fleet", ms: 9000, beat: 1, line: "Elastic RL: any free GPU takes any role" },
  { key: "map", ms: 10000, line: "Task by task: which ones changed" },
  { key: "audit", ms: 9000, line: "And the ones that got worse, each one named" },
];
/** The Summary part of the rail: each distinct moment, in order. */
const summaryTiles = (clips: readonly Clip[]) => clips.reduce<{ key: string; title?: string; first: number }[]>((out, c, i) => {
  if (c.key && out.at(-1)?.key !== c.key) out.push({ key: c.key, title: c.title, first: i });
  return out;
}, []);
/** A standalone exhibit on its own clock, as a module of the laboratory. */
function ExhibitModule({ Scene, duration, label, active }: { Scene: React.ComponentProps<typeof ExhibitScene>["Scene"]; duration: number; label: string; active: boolean }) {
  const { ref, ...p } = useStudyPlayback(1, 0, { finite: true, interval: duration, enabled: active });
  const host = useRef<HTMLDivElement>(null);
  useSummaryPause(p.pause, p.resume, active);
  useEffect(() => {
    if (p.finished) host.current?.dispatchEvent(new CustomEvent("lab:module-round", { bubbles: true }));
  }, [p.finished]);
  return (
    <section ref={ref} className="ex-module">
      <div ref={host}>
        <ExhibitScene Scene={Scene} label={label} readTime={p.readTime} playing={p.running} reduced={p.reduced} duration={duration} onSeek={p.seek} onToggle={() => (p.finished ? p.replay() : p.toggle())} />
      </div>
    </section>
  );
}
/** Modules without a scripted demonstration stay on stage this long before the show moves on. */
const DWELL: Record<string, number> = { manifold: 44000, race: 30000, setup: 46000, replay: 96000, composition: 30000, latency: 92000, map: 40000, glossary: 32000, tasks: 30000, inside: 22000, learn: 22000, terrain: 24000, frontier: 22000, curves: 34000, audit: 24000, fleet: 90000, pressure: 90000, draft: 90000, cache: 90000, overlap: 90000 };
/** The next module's ring fills over this long once the current one has told its story. */
const COUNTDOWN = 3200;
const clockNow = () => performance.now();
/** After the visitor last touched the stage, a finished or abandoned module moves on after this long. */
const IDLE_MOVE_ON = 30000;

export function ComputeLabStudy({
  domain,
}: {
  domain: "inference" | "training";
}) {
  const training = domain === "training",
    [inferencePart, setInferencePart] = useState<"cheaper" | "load">("cheaper"),
    [mode, setMode] = useState<"manifold" | "setup" | "watch" | "explore" | "present">("manifold"),
    [view, setView] = useState(training ? 5 : 1),
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
  const [landingPhase, setLandingPhase] = useState<"on" | "leaving" | "off">("on");
  // Before a module opens for the first time, the whole screen says what it is.
  const [briefKey, setBriefKey] = useState<string | null>(null);
  const pendingOpen = useRef<{ key: string; auto: boolean } | null>(null);
  const briefed = useRef(new Set<string>());
  // A module that has finished once is the visitor's on any later visit: it never hurries them on.
  const seen = useRef(new Set<string>());
  const [resumed, setResumed] = useState(0);
  // Where the story pauses to ask: study this in detail, or go on. And the line that opens a new part.
  const [fork, setFork] = useState<string | null>(null);
  const [lineCard, setLineCard] = useState<string | null>(null);
  const carded = useRef(false);
  // The summary: which clip is on stage, and whether it is held.
  const [clip, setClip] = useState<number | null>(null);
  const [clipHeld, setClipHeld] = useState(false);
  const [servingKey, setServingKey] = useState("pressure");
  const [chapter, setChapter] = useState("");
  const [status, setStatus] = useState<{ key: string; phase: "running" | "done" | "taken" }>({ key: "", phase: "running" });
  const [labInView, setLabInView] = useState(false);
  const [filmRun, setFilmRun] = useState(0);
  const tr = useTr();
  const labNav = useLabNav();
  useStageFit(stageRef, fitRef, labNav === "show", `${mode}|${view}|${inferencePart}|${servingKey}`);
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
    // Coming back to a figure starts it from its beginning, never from where its clock happened to stop.
    if (!training && !(mode === "explore" && view === i)) setFigureRevisions((old) => old.map((r, k) => (k === i ? r + 1 : r)));
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
  const openManifold = () => {
    setMode("manifold");
    toStage();
  };
  const openSetup = () => {
    setMode("setup");
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
  // The modules are the story, in the order it should be told. Each title says what improves.
  // Each project's one opening picture: post-training's manifold, inference's race on one clock.
  const manifoldItem: RailItem = training
    ? { key: "manifold", title: "The manifold", term: "Every dimension at once", value: "6 dimensions", unit: "96 tasks, three models", Glyph: GlyphManifold, onOpen: openManifold, current: mode === "manifold" }
    : { key: "race", title: "The serving race", term: "Two runs, one clock", value: `${fmt(rlStatic.correctCost!)} → ${fmt(rlFast.correctCost!)}`, unit: "GPU-s per correct answer", Glyph: GlyphRace, onOpen: openManifold, current: mode === "manifold" };
  const railItems: RailItem[] = training
    ? [
        manifoldItem,
        { key: "inside", title: "What changed inside the model", term: "Layer by layer", value: "7 of 50", unit: "words the base model would have written differently", Glyph: GlyphInside, onOpen: () => openView(5), current: mode === "explore" && view === 5 },
        { key: "learn", title: "Learning from outcomes", term: "GRPO", value: `${simulateLab(1, 1).correct} → ${simulateLab(2, 1).correct}`, unit: "of 96 tasks solved", Glyph: GlyphLearn, onOpen: () => openView(7), current: mode === "explore" && view === 7 },
        { key: "terrain", title: "Skill gained at each step", term: "96 tasks, six checkpoints", value: `+${simulateLab(3, 4).correct - simulateLab(0, 1).correct}`, unit: "tasks solved, base to lean RL", Glyph: GlyphTerrain, onOpen: () => openView(6), current: mode === "explore" && view === 6 },
        { key: "frontier", title: "Accuracy against GPU cost", term: "The frontier", value: "28 → 82", unit: "of 96 tasks solved", Glyph: GlyphFrontier, onOpen: () => openView(8), current: mode === "explore" && view === 8 },
        { key: "curves", title: "What more thinking buys", term: "Compute curves", value: `${simulateLab(2, 8).correct}`, unit: "of 96 · RL checkpoint at 8× thinking budget", Glyph: GlyphCurves, onOpen: () => openView(1), current: mode === "explore" && view === 1 },
        { key: "fleet", title: "Training twice as fast on 64 GPUs", term: "Elastic RL", value: "4 → 7", unit: "RL steps in 14 min", Glyph: GlyphFleet, onOpen: () => openView(4), current: mode === "explore" && view === 4 },
        { key: "map", title: "Task by task", term: "Capability map", value: `+${solvedGain}`, unit: `net tasks at ${budget}× thinking budget`, Glyph: GlyphCapability, onOpen: () => openView(0), current: mode === "explore" && view === 0 },
        { key: "film", title: "Training, step by step", term: "The experiment", value: "28 → 82", unit: "of 96 synthetic tasks", Glyph: GlyphExperiment, onOpen: openFilm, current: mode === "watch", children: chapterSlot },
        { key: "tasks", title: "Which tasks it can now solve", term: "Easiest to hardest", value: `+${solvedGain}`, unit: `tasks solved at ${budget}× thinking budget`, Glyph: GlyphTasks, onOpen: () => openView(3), current: mode === "explore" && view === 3 },
        { key: "audit", title: "What got worse", term: "Regression audit", value: `${rlFlips.gained.length} / ${rlFlips.lost.length}`, unit: `gained / lost at ${budget}× thinking budget`, Glyph: GlyphAudit, onOpen: () => openView(2), current: mode === "explore" && view === 2 },
      ]
    : [
        manifoldItem,
        { key: "setup", title: "The big picture", term: "Three levers on all 96 requests", value: `${fmt(rlStatic.correctCost!)} → ${fmt(rlFast.correctCost!)}`, unit: "GPU-s per correct answer", Glyph: GlyphBigPicture, onOpen: openSetup, current: mode === "setup" },
        { key: "replay", title: "Execution replay", term: "Any of the 96 requests", value: `${fmt(rlStatic.tasks[6].gpuSeconds)} → ${fmt(rlFast.tasks[6].gpuSeconds)}`, unit: "GPU-s · request 7", Glyph: GlyphReplay, onOpen: () => openView(1), current: mode === "explore" && view === 1 },
        { key: "composition", title: "Policy × runtime", term: "Training and serving together", value: `${simulateLab(0, budget, false, workload).correct} → ${rlFast.correct}`, unit: "of 96 correct", Glyph: GlyphComposition, onOpen: () => openView(0), current: mode === "explore" && view === 0 },
        { key: "latency", title: "Queue & latency", term: "Arrival to completion", value: `${fmt(p95(rlStatic), 0)} → ${fmt(p95(rlFast), 0)}`, unit: "s · slowest 5%", Glyph: GlyphLatency, onOpen: () => openView(2), current: mode === "explore" && view === 2 },
        { key: "film", title: "The experiment", term: "One lever at a time", value: "3 levers", unit: "one at a time", Glyph: GlyphExperiment, onOpen: openFilm, current: mode === "watch", children: chapterSlot },
      ];
  // Deep links from the project overview: #inference-study/replay opens that module.
  const railRef = useRef(railItems);
  useEffect(() => { railRef.current = railItems; });
  useEffect(() => {
    const sectionId = training ? "post-training-study" : "inference-study";
    const SERVING = ["pressure", "draft", "cache", "overlap", "map", "glossary"];
    const open = () => {
      const [id, key] = window.location.hash.slice(1).split("/");
      if (id !== sectionId) return;
      // Arriving at the laboratory itself: bring it into view, and its opening plays.
      if (!key) { window.setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: "instant", block: "start" }), 60); return; }
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
    ...railItems.map((m) => ({ key: m.key, title: m.title, term: m.term, value: m.value, unit: m.unit, Glyph: m.Glyph, pathway: 0 })),
    ...(training ? [] : SERVING_RAIL.map((m) => ({ ...m, pathway: 1 }))),
  ];
  const currentKey = clip !== null ? "summary" : !training && inferencePart === "load" ? servingKey : railItems.find((i) => i.current)?.key ?? railItems[0].key;
  const order = showItems.map((i) => i.key);
  const nextKey = order[(order.indexOf(currentKey) + 1) % order.length];
  const lastModule = order.indexOf(currentKey) === order.length - 1;
  const phase = status.key === currentKey ? status.phase : "running";
  const briefs = useMemo(() => moduleBriefs(training, budget), [training, budget]);
  const openSeq = useRef(0);
  const touched = useRef(0);
  const reveal = (key: string, auto: boolean) => {
    const seq = ++openSeq.current;
    setLandingPhase((p) => (p === "on" ? "off" : p));
    if (key === "film" && currentKey !== "film") setFilmRun((n) => n + 1);
    void auto;
    setStatus({ key, phase: "running" });
    touched.current = 0;
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
  const clips = training ? TRAINING_CLIPS : INFERENCE_CLIPS;
  const lastClipKey = useRef<string | null>(null);
  const playClip = (c: Clip, n: number) => {
    if (!c.key) return; // a line across the screen; the previous figure rests under the blur
    const seq = ++openSeq.current;
    if (lastClipKey.current !== c.key) {
      lastClipKey.current = c.key;
      if (!training && SERVING_RAIL.some((m) => m.key === c.key)) {
        setInferencePart("load");
        [0, 400, 1400].forEach((ms) => window.setTimeout(() => { if (openSeq.current === seq) window.dispatchEvent(new CustomEvent("lab:serving-open", { detail: c.key })); }, ms));
      } else {
        if (!training) setInferencePart("cheaper");
        railRef.current.find((item) => item.key === c.key)?.onOpen();
      }
    }
    const send = () => {
      if (openSeq.current !== seq) return;
      if (c.beat !== undefined) window.dispatchEvent(new CustomEvent("lab:arc-go", { detail: { id: `${n}-${seq}`, beat: c.beat } }));
      if (c.film) window.dispatchEvent(new CustomEvent("lab:film-go", { detail: { training, ...c.film } }));
      if (c.seek !== undefined) window.dispatchEvent(new CustomEvent("lab:figure-seek", { detail: c.seek }));
    };
    [260, 900, 1700, 3000].forEach((ms) => window.setTimeout(() => { if (ms === 260 || c.beat !== undefined) send(); }, ms));
  };
  /** Back, forward or a tick on the summary's bar. */
  const goClip = (n: number) => {
    const to = Math.max(0, Math.min(clips.length - 1, n));
    // jumping restarts the figure from the clip's own moment
    lastClipKey.current = clip !== null && clips[clip].key === clips[to].key ? clips[to].key ?? null : null;
    if (clipHeld) { setClipHeld(false); window.dispatchEvent(new Event("lab:release")); }
    setClip(to);
  };
  const toggleClipHold = () => {
    window.dispatchEvent(new Event(clipHeld ? "lab:release" : "lab:hold"));
    setClipHeld(!clipHeld);
  };
  const openKey = (key: string, auto = false) => {
    if (key === "summary") { setLandingPhase((p) => (p === "on" ? "off" : p)); setBriefKey(null); setFork(null); setClipHeld(false); lastClipKey.current = null; setClip(0); return; }
    setClip(null);
    setFork(null);
    // The second part opens on one line across the screen.
    if (!training && key === "pressure" && !carded.current) {
      carded.current = true;
      setLineCard("Second: *optimized serving under load*");
      window.setTimeout(() => { setLineCard(null); openKeyRef.current(key, auto); }, 2800);
      return;
    }
    if (show && briefs[key] && !briefed.current.has(key)) {
      briefed.current.add(key);
      pendingOpen.current = { key, auto };
      setBriefKey(key);
      return;
    }
    reveal(key, auto);
  };
  const endBrief = () => {
    const p = pendingOpen.current;
    pendingOpen.current = null;
    setBriefKey(null);
    if (p) reveal(p.key, p.auto);
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
    const done = () => { if (currentRef.current !== "summary") setStatus((s) => (s.key === currentRef.current && s.phase === "taken" ? s : { key: currentRef.current, phase: "done" })); };
    el.addEventListener("lab:module-round", done);
    const io = new IntersectionObserver(([e]) => setLabInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => { el.removeEventListener("lab:module-round", done); io.disconnect(); };
  }, [ref]);
  // Using the stage holds the show while the visitor is there. Only "Stay on this one" holds it for good;
  // a module that was used and then left alone moves on, so the show never just stops.
  const [touchTick, setTouchTick] = useState(0);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !show) return;
    const touch = (e: Event) => { if (e.isTrusted) { touched.current = performance.now(); setTouchTick((n) => n + 1); } };
    stage.addEventListener("pointerdown", touch, true);
    stage.addEventListener("keydown", touch, true);
    // Not on "input": re-rendering in the middle of a slider's event resets its value before React reads it.
    return () => { stage.removeEventListener("pointerdown", touch, true); stage.removeEventListener("keydown", touch, true); };
  }, [show]);
  useEffect(() => {
    if (!show || landingPhase === "on" || phase !== "running" || !touched.current) return;
    const id = window.setTimeout(() => setStatus((s) => (s.key === currentKey && s.phase === "taken" ? s : { key: currentKey, phase: "done" })), IDLE_MOVE_ON);
    return () => window.clearTimeout(id);
  }, [show, landingPhase, phase, currentKey, touchTick]);
  useEffect(() => { if (phase === "done") seen.current.add(currentKey); }, [phase, currentKey]);
  useEffect(() => {
    const ms = DWELL[currentKey];
    if (!show || landingPhase === "on" || !ms) return;
    const id = window.setTimeout(() => setStatus((s) => (s.key === currentKey && s.phase === "taken" ? s : { key: currentKey, phase: "done" })), ms);
    return () => window.clearTimeout(id);
  }, [show, landingPhase, currentKey, resumed]);
  useEffect(() => {
    if (!show || landingPhase === "on" || phase !== "done" || !labInView || briefKey || fork || lineCard) return;
    // The show ends on its last module; it does not loop back to the start.
    if (lastModule) return;
    // A recent touch gives the visitor time before the show moves on.
    const wait = Math.max(COUNTDOWN, touched.current ? IDLE_MOVE_ON * 0.8 - (clockNow() - touched.current) : 0);
    const id = window.setTimeout(() => openKeyRef.current(nextKey, true), wait);
    return () => window.clearTimeout(id);
  }, [show, landingPhase, phase, labInView, nextKey, briefKey, lastModule, touchTick, fork, lineCard]);
  const playClipRef = useRef(playClip);
  useEffect(() => { playClipRef.current = playClip; });
  useEffect(() => {
    if (clip === null || !show) return;
    playClipRef.current(clips[clip], clip);
    // the clip list is fixed for one laboratory
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clip, show]);
  useEffect(() => {
    if (clip === null || !show || clipHeld || !labInView) return;
    const id = window.setTimeout(() => {
      if (clip + 1 < clips.length) setClip(clip + 1);
      else { setClip(null); seen.current.add("summary"); setFork("summary"); }
    }, clips[clip].ms);
    return () => window.clearTimeout(id);
    // see above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clip, show, clipHeld, labInView]);
  const stayHere = () => setStatus({ key: currentKey, phase: "taken" });
  const keepPlaying = () => {
    setStatus({ key: currentKey, phase: "running" });
    touched.current = 0;
    setResumed((n) => n + 1);
    window.dispatchEvent(new Event("lab:resume"));
  };
  const diveDeeper = () => {
    const key = clip !== null ? clips[clip].key ?? currentKey : currentKey;
    setClip(null);
    setStatus({ key, phase: "taken" });
    window.dispatchEvent(new Event("lab:dive"));
  };
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
        groups={[
          { key: "summary", label: "Summary", onOpen: () => openKey("summary"), items: summaryTiles(clips).map((c) => ({ key: c.key, title: c.title ?? showItems.find((i) => i.key === c.key)?.title ?? c.key })) },
          { key: "detail", label: "In detail", onOpen: () => openKey(order[0]), items: showItems.map((i) => ({ key: i.key, title: i.title, section: training ? undefined : pathways[i.pathway].short })) },
        ]}
        active={clip !== null || fork ? "summary" : "detail"}
        current={clip !== null ? clips.slice(0, clip + 1).reverse().find((c) => c.key)?.key ?? "" : currentKey}
        next={clip !== null ? (clips[clip + 1]?.title ?? showItems.find((i) => i.key === clips[clip + 1]?.key)?.title ?? "In detail") : showItems.find((i) => i.key === nextKey)?.title ?? ""}
        phase={clip !== null ? (clipHeld ? "taken" : "running") : phase}
        held={clipHeld}
        last={clip === null && lastModule}
        afterLast={training ? { title: "Inference optimization", href: "/#inference" } : { title: "Medical AI", href: "/#mindscape" }}
        countdownMs={COUNTDOWN}
        onItem={(key) => {
          if (clip !== null) { const t = summaryTiles(clips).find((c) => c.key === key); if (t) goClip(t.first); return; }
          openKey(key);
        }}
        onNext={() => { if (clip !== null) { if (clip + 1 < clips.length) goClip(clip + 1); else { setClip(null); setFork("summary"); } } else openKey(nextKey); }}
        onLanding={() => { setFork(null); setClip(null); setLandingPhase("on"); }}
        onStay={() => { if (clip !== null) toggleClipHold(); else stayHere(); }}
        onKeepPlaying={() => { if (clip !== null) toggleClipHold(); else keepPlaying(); }}
        onDive={diveDeeper}
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
        {show && landingPhase !== "on" && (() => {
          // during a line across the screen, the head stays on the module before it
          const key = clip !== null ? clips.slice(0, clip + 1).reverse().find((c) => c.key)?.key ?? clips.find((c) => c.key)!.key! : currentKey;
          const item = showItems.find((i) => i.key === key);
          const brief = briefs[key];
          return (
            <div className="sm-head" key={`${key}|${clip}`}>
              <p className="sm-title">
                {clip !== null && clips[clip].line ? <strong>{tr(clips[clip].line!)}</strong> : <>
                  <strong>{tr(brief?.does ?? item?.title ?? "")}</strong>
                  {brief && <span>{highlight(tr(brief.impact))}</span>}
                </>}
              </p>
              <div className="sm-sub">
                <span className="sm-name">{tr(item?.title ?? "")}</span>
                {clip === null && <StageMeter moduleKey={`${currentKey}|${chapter}`} rest={brief ? tr(brief.why) : undefined} />}
              </div>
            </div>
          );
        })()}
        {show && clip !== null && (
          <div className="sb-bar" role="group" aria-label={tr("Summary controls")}>
            <button type="button" onClick={() => goClip(clip - 1)} disabled={clip === 0} aria-label={tr("Back one moment")}>◂</button>
            <button type="button" onClick={toggleClipHold} aria-label={tr(clipHeld ? "Keep playing" : "Pause")}>{clipHeld ? "▷" : "Ⅱ"}</button>
            <button type="button" onClick={() => goClip(clip + 1)} disabled={clip === clips.length - 1} aria-label={tr("Forward one moment")}>▸</button>
            <span className="sb-ticks">
              {clips.map((c, i) => (
                <button key={i} type="button" data-on={i === clip || undefined} data-done={i < clip || undefined} aria-label={`${tr("Moment")} ${i + 1}`} onClick={() => goClip(i)}>
                  {i === clip && <i key={`${clip}-${clipHeld}`} style={{ animationDuration: `${c.ms}ms`, animationPlayState: clipHeld ? "paused" : "running" }} />}
                </button>
              ))}
            </span>
          </div>
        )}
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
          <LabLanding pathways={pathways} items={showItems} leaving={landingPhase === "leaving"} script={training ? TRAINING_INTRO : INFERENCE_INTRO} onStart={startShow} onEnd={() => startShow("summary")} />
        )}
        {briefKey && briefs[briefKey] && (
          <ModuleBrief
            item={showItems.find((i) => i.key === briefKey)!}
            brief={briefs[briefKey]}
            path={pathways[showItems.find((i) => i.key === briefKey)?.pathway ?? 0].short}
            onDone={endBrief}
          />
        )}
        {show && lineCard && <LineCard text={lineCard} />}
        {show && clip !== null && clips[clip].card && <LineCard text={clips[clip].card!} />}
        {show && fork && (
          <ChoiceCard
            auto
            headline={training ? "That is *post-training*, in summary" : "That is *inference optimization*, in summary"}
            study={{ title: "Go through it in detail", detail: training ? "Every module in full: the figures, the methods and the training data" : "Every module in full: the figures and the method, then optimized serving under load", onPick: () => openKey(order[0]) }}
            onward={training
              ? { title: "Next project: Inference optimization", detail: "The same intelligence served for less, and optimized under load", href: "/#inference" }
              : { title: "Next project: Medical AI", detail: "An evidence-grounded assistant for clinicians", href: "/#mindscape" }}
          />
        )}
        {labNav !== "dock" && !landingOn && navNode}
        <div ref={stageRef} className={block ? "lb-stage" : "lf-stage"} hidden={landingOn}>
          {!block && (training || inferencePart === "cheaper") && mode === "watch" && <div className="lf-chapters">{chapterSlot}</div>}
        {show && <FocusCaption moduleKey={`${currentKey}|${chapter}|${clip}`} />}
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
        <RetainedLabPanel active={mode === "manifold"} id={`${domain}-manifold`} label="The manifold">
          <div className="lf-manifold">
            {training
              ? <Manifold dwell={clip !== null ? 5200 : 9000} active={mode === "manifold" && landingPhase === "off" && !briefKey && labInView} onRound={() => ref.current?.dispatchEvent(new CustomEvent("lab:module-round", { bubbles: true }))} />
              : <ServingRace active={mode === "manifold" && landingPhase === "off" && !briefKey && labInView} onRound={() => ref.current?.dispatchEvent(new CustomEvent("lab:module-round", { bubbles: true }))} />}
          </div>
        </RetainedLabPanel>
        {!training && (
          <RetainedLabPanel active={mode === "setup"} id={`${domain}-big-picture`} label="The big picture">
            <BigPicture active={mode === "setup" && landingPhase === "off" && labInView && inferencePart === "cheaper"} />
          </RetainedLabPanel>
        )}
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
                <GhostCursor root={exhibitRef} script={TRAINING_DEMO} enabled={mode === "explore" && view < 3} startDelay={2500} restDelay={2200} loop={!show} />
              )}
              <div className={training ? "rs-context-bar rs-budget-bar" : "rs-context-bar"} hidden={training && view >= 4}>
                <span className="rs-status rs-status-scenario">
                  {training
                    ? "Thinking budget"
                    : "One cohort · 96 tasks"}
                </span>
                <div
                  className="rs-segmented"
                  role="group"
                  aria-label={training ? "Thinking budget" : "Workload trace"}
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
                          {b}×
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
                      <div key={figureRevisions[1]} ref={replayHost} className="gc-host">
                      <GhostCursor root={replayHost} script={REPLAY_DEMO} enabled={mode === "explore" && view === 1} startDelay={clip !== null ? 1400 : REPLAY_MS + 5000} loop={!show} />
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
                      <div key={figureRevisions[2]} ref={latencyHost} className="gc-host">
                      <GhostCursor root={latencyHost} script={LATENCY_DEMO} enabled={mode === "explore" && view === 2} startDelay={1000} restDelay={1800} loop={!show} />
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
                <InsideScan active={mode === "explore" && view === 5 && landingPhase === "off" && !briefKey} />
              ) : view === 6 ? (
                <CapabilityTerrain active={mode === "explore" && view === 6 && !briefKey} />
              ) : view === 7 ? (
                <ExhibitModule key="learn" Scene={PolicyGrpo} duration={16800} label="Learning from outcomes" active={mode === "explore" && view === 7 && !briefKey} />
              ) : view === 8 ? (
                <ExhibitModule key="frontier" Scene={PolicyFrontierStory} duration={FRONTIER_STORY_MS} label="The frontier" active={mode === "explore" && view === 8 && !briefKey} />
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
                          <>
                            <RegressionAuditPlot before={base} after={run} />
                            <AuditLedger active={show && mode === "explore" && view === 2} />
                          </>
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
