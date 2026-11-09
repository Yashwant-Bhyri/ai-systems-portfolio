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
import { TitleBoard, TitleRail, boardRects, railRects, type Pathway, type Rects, type ShowItem } from "./stagecraft/title-show";
import { ChoiceCard, IntroCard, ModuleBrief, PurposeCard, moduleBriefs } from "./stagecraft/module-brief";
import { BigPicture } from "./stagecraft/big-picture";
import { Manifold } from "./stagecraft/manifold";
import { ServingDial } from "./stagecraft/serving-dial";
import { CACHE_DELTA, OVERLAP, PRESSURE_GAP, SERVING_RAIL } from "./serving-rail-meta";
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
  GlyphDial,
  GlyphLean,
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
  { target: ".ll-explorer[data-done=\"true\"] .ll-percentiles button:nth-child(3)", label: "p99 · the single slowest", hold: 3600, waitFor: 70000 },
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
/** Each figure gets its own walk, slow enough to read, ending on what that figure is for. */
const PICK = (n: number) => `.rs-policy-strip button:nth-of-type(${n})`, BUDGET = (n: number) => `.rs-context-bar .rs-segmented button:nth-of-type(${n})`;
// Curves: more thinking for the RL checkpoint, then the same answers from Lean RL for less.
const CURVES_DEMO: readonly CursorStep[] = [
  { target: PICK(3), label: "RL checkpoint", hold: 2600 },
  { target: BUDGET(1), label: "1× thinking budget", hold: 2600 },
  { target: BUDGET(3), label: "4× thinking budget", hold: 2600 },
  { target: BUDGET(4), label: "8× thinking budget", hold: 3200 },
  { target: PICK(4), label: "Lean RL: the same answers, less GPU time", hold: 4500 },
];
// Map: each training step's squares, one at a time, ending on the RL checkpoint the head line describes.
const MAP_DEMO: readonly CursorStep[] = [
  { target: PICK(2), label: "After SFT", hold: 3200 },
  { target: PICK(4), label: "Lean RL", hold: 3200 },
  { target: PICK(3), label: "RL checkpoint: which tasks changed", hold: 4500 },
];
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
            ? `${accuracyDelta >= 0 ? "+" : ""}${accuracyDelta.toFixed(1)} points vs Base`
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

const T_ = { base: simulateLab(0, 1), sft: simulateLab(1, 1), rl: simulateLab(2, 1), rl4: simulateLab(2, 4), lean: simulateLab(3, 4) };
const FEWER = Math.round(100 * (1 - T_.lean.tokens / T_.lean.n / (T_.rl4.tokens / T_.rl4.n)));
const R_ = inferenceStoryRuns("shared-prefix");
const PCT_LESS = Math.round(100 * (1 - R_[3].correctCost! / R_[0].correctCost!));
const cost2 = (v: number) => v.toFixed(2);
/** Share of the 96 tasks, as a percentage: easier to hold than a count. */
const pct = (n: number) => `${Math.round((100 * n) / 96)}%`;
const n0 = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 0 });
const n2 = (v: number) => v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const FINISH = (r: (typeof R_)[number]) => Math.max(...r.tasks.map((t) => t.finish));
const P95 = (r: (typeof R_)[number]) => latencyDistribution(r, 95).threshold.latency;
const BASE_CORRECT = simulateLab(0, 2, false, "shared-prefix").correct;
const FLIPS2 = compareTasks(simulateLab(0, 2), simulateLab(2, 2));
const LEAN_1X = simulateLab(3, 1).correct, LEAN_8X = simulateLab(3, 8).correct;
const INFERENCE_PATHWAYS: readonly Pathway[] = [
  { n: "01", title: "Same intelligence at cheaper cost", short: "Same intelligence at cheaper cost", techniques: [], lead: `The same ${R_[3].correct} correct answers from the same model, with *${PCT_LESS}% less compute*: ${cost2(R_[0].correctCost!)} → ${cost2(R_[3].correctCost!)} GPU-seconds per correct answer` },
  { n: "02", title: "Serving under load", short: "Serving under load", techniques: [], lead: "Many requests share one GPU: *four techniques* keep every answer streaming, and the whole path on one clock" },
];
const INFERENCE_OPENING = ["Inference optimization is *two problems*", "One: the same intelligence at cheaper cost. Two: serving under load"];
const TRAINING_OPENING = ["In this project, we took a small model, Qwen3-4B, and applied *advanced post-training* to see how its behaviour scales on maths and coding", "Two aims: *more intelligence*, through SFT, GRPO and test-time scaling, and *less computation*, through Lean RL and Elastic RL"];
const TRAINING_PATHWAYS: readonly Pathway[] = [
  { n: "01", title: "What did the model learn?", short: "In detail", techniques: [], lead: `One small model, trained step by step on maths and coding: accuracy *${pct(T_.base.correct)} → ${pct(T_.lean.correct)}*, and every result is here` },
];
/**
 * The Summary. Every module is introduced, then plays through to the end of what it has to say:
 * no clip leaves before its figure has finished, so these lengths follow the figures' own clocks.
 * Inference is two sections; between them the laboratory returns to the title board.
 */
type Clip = { key?: string; title?: string; ms: number; line?: string; intro?: string; labels?: readonly string[]; purpose?: boolean; board?: boolean; beat?: number; speed?: number; film?: { step: number; at?: number; frame?: boolean }; seek?: number; metric?: string };
const ARC_SPEED = 1.25, INTRO_MS = 3400;
/** Long enough to read: the time follows the words. */
const intro = (key: string, text: string, title?: string, labels?: readonly string[]): Clip => ({ key, title, intro: text, labels, ms: Math.max(INTRO_MS, 1800 + 150 * text.split(/\s+/).length) + 2600 + (labels?.length ?? 0) * 900 });
/** Problem, solution and impact, each to its end. A film keeps its own pace; drawn scenes play a little quicker. */
const arcClips = (key: string, [problem, solution, impact]: readonly [string, string, string], [a, b, c]: readonly [number, number, number], filmB = false): Clip[] => [
  { key, beat: 0, speed: ARC_SPEED, ms: a / ARC_SPEED + 500, line: problem },
  { key, beat: 1, speed: ARC_SPEED, ms: (filmB ? b : b / ARC_SPEED) + 500, line: solution },
  { key, beat: 3, speed: ARC_SPEED, ms: c / ARC_SPEED + 500, line: impact },
];
const INFERENCE_CLIPS: readonly Clip[] = [
  intro("flow", "One full turn of the dial is the baseline's whole run. *Every request is drawn in colour, by what it is doing*", undefined, ["Waiting for a GPU", "Reading the prompt", "Reasoning", "Writing the answer"]),
  { key: "flow", ms: 42200, line: `${PCT_LESS}% less compute for the same answers: every request answered by ${n0(FINISH(R_[3]))} s instead of ${n0(FINISH(R_[0]))} s` },
  intro("setup", "Three levers decide what every answer costs. *Watch whether any answer changes*", undefined, ["Continuous batching: a free worker takes the next request", "Prefix caching: a shared document is read once", "FP8 prefill and decode: half the bytes per step"]),
  { key: "setup", ms: 32400, seek: 7000, line: "Three levers act on every request, and not one answer changes" },
  intro("replay", "One request from arrival to last word, before and after, *measured four ways*", undefined, ["Response latency", "Total GPU work", "Input processing", "Answer generation"]),
  { key: "replay", ms: 25000, metric: "latency", line: `Response latency, request 7: ${n2(R_[1].tasks[6].latency)} → ${n2(R_[3].tasks[6].latency)} s` },
  { key: "replay", ms: 13000, metric: "service", seek: 12000, line: `Total GPU work, request 7: ${n2(R_[1].tasks[6].gpuSeconds)} → ${n2(R_[3].tasks[6].gpuSeconds)} GPU-s` },
  { key: "replay", ms: 13000, metric: "prefill", seek: 12000, line: `Input processing, request 7: ${R_[1].tasks[6].prefill.toFixed(3)} → ${R_[3].tasks[6].prefill.toFixed(3)} GPU-s; the shared prefix is already in memory` },
  { key: "replay", ms: 13000, metric: "decode", seek: 12000, line: `Answer generation, request 7: ${n2(R_[1].tasks[6].decode)} → ${n2(R_[3].tasks[6].decode)} GPU-s; every step moves half the bytes` },
  intro("composition", "Two separate levers: *what the model knows, and how it is served*"),
  { key: "composition", ms: 27000, seek: 0, line: `Accuracy ${pct(BASE_CORRECT)} → ${pct(R_[3].correct)}: training raises it, and faster serving takes back the extra cost` },
  intro("latency", "Every request ranked by how long it took. *Look at the slowest 5%*"),
  { key: "latency", ms: 24500, seek: 27000, line: `The slowest 5% of requests: ${n0(P95(R_[1]))} → ${n0(P95(R_[3]))} s` },
  { board: true, ms: 0 },
  intro("pressure", "When a long prompt arrives, *what happens to the answers already streaming?*"),
  ...arcClips("pressure", ["Problem: one long prompt freezes every answer streaming on that GPU", "Chunked prefill: read the prompt in chunks, so answers keep streaming", `Impact: worst pause ${PRESSURE_GAP.whole.toFixed(1)} → ${PRESSURE_GAP.chunked.toFixed(1)} ms; the long prompt's first token comes later`], [11500, 13500, 9000]),
  intro("draft", "The large model writes one token per full pass. *Can it check many tokens at once?*"),
  ...arcClips("draft", ["Problem: the large model writes one token per full pass", "Speculative decoding: a small draft model guesses ahead, the large one checks every guess in one pass", "Impact: 12 → 3 serial large-model calls, while the guesses are good"], [10500, 19000, 9000], true),
  intro("cache", "Several replicas could take this request. *One already has its prompt in memory*"),
  ...arcClips("cache", ["Problem: routing by load ignores what is already in memory", "Cache-aware routing: send each request to where its prefix is cached", `Impact: first token ${CACHE_DELTA} ms sooner, until the wait for space outgrows the reuse`], [11000, 12500, 9000]),
  intro("overlap", "Between two GPU steps, the CPU prepares the next one. *The GPU waits for it*"),
  ...arcClips("overlap", ["Problem: the GPU waits while the CPU prepares the next step", "CPU/GPU overlap: prepare the next step during this one", `Impact: four decode steps in ${OVERLAP.baseline.finish} → ${OVERLAP.overlapped.finish} ms, the same GPU work`], [11000, 12500, 9000]),
  intro("glossary", "Every component of the serving system, *one term at a time*"),
  { key: "glossary", ms: 25500, line: "The whole serving system: every component, each tied to this project" },
];
const TOK = (r: { tokens: number; n: number }) => Math.round(r.tokens / r.n);
const BASE4 = simulateLab(0, 4);
/** Post-training's purpose, before any figure: the model as released, then after post-training. */
const PURPOSE = {
  headline: "A small model, Qwen3-4B: first *higher accuracy*, then the same answers for *fewer GPU-seconds*",
  before: { title: "Qwen3-4B, as released", rows: [
    { label: "Tasks solved", value: pct(T_.base.correct), note: "96 synthetic maths, logic and coding tasks" },
    { label: "With 4× more thinking", value: pct(BASE4.correct), note: "more test-time compute, no training" },
  ] },
  after: { title: "After advanced post-training", rows: [
    { label: "Tasks solved, at 4× thinking", value: pct(T_.lean.correct), note: `+${Math.round((100 * (T_.lean.correct - BASE4.correct)) / 96)} points over the base model with the same thinking` },
    { label: "Over the model as released", value: `+${Math.round((100 * (T_.lean.correct - T_.base.correct)) / 96)} pts` },
    { label: "Then, thinking less", value: `${TOK(T_.rl4).toLocaleString("en-US")} → ${TOK(T_.lean).toLocaleString("en-US")}`, note: `tokens per task: Lean RL keeps the RL checkpoint's answers with ${FEWER}% fewer` },
  ] },
  techniques: [
    { title: "More intelligence: higher accuracy", items: ["SFT + LoRA", "GRPO", "Test-time scaling"] },
    { title: "Less computation: fewer GPU-seconds", items: ["Lean RL", "Elastic RL on 64 GPUs"] },
  ],
};
const TRAINING_CLIPS: readonly Clip[] = [
  { purpose: true, ms: 15000, line: `The goal: accuracy ${pct(T_.base.correct)} → ${pct(T_.lean.correct)}, then the same answers for ${FEWER}% fewer tokens` },
  intro("manifold", "Each point is one task; each model is a cloud. *Lines join the same task across the three models*, and each view asks one question", undefined, ["The skill", "The cost of thinking", "Lean RL", "The families"]),
  { key: "manifold", ms: 21600, line: `A 3D view of every task across three models: accuracy ${pct(T_.base.correct)} → ${pct(T_.lean.correct)}` },
  intro("inside", "One coding task, watched *layer by layer* inside the model as it answers"),
  { key: "inside", ms: 20500, line: "On one coding task: the layers training changed, and the words they changed" },
  intro("learn", "Eight attempts at one task. *The tests decide which ones survive*"),
  { key: "learn", ms: 17200, line: `GRPO: the tests decide which attempts survive. Accuracy ${pct(T_.sft.correct)} → ${pct(T_.rl.correct)}` },
  intro("terrain", "Each ridge is one stage of training. *Where a ridge stands above a task, that task is solved*"),
  { key: "terrain", ms: 21000, line: `Six stages of training: accuracy ${pct(T_.base.correct)} → ${pct(T_.lean.correct)}` },
  intro("frontier", "Accuracy up the side, *GPU time per correct answer* along the bottom"),
  { key: "frontier", ms: 17400, line: `Five moves: accuracy ${pct(T_.base.correct)} → ${pct(T_.lean.correct)}, and the cost per correct answer brought back down` },
  intro("curves", "Each checkpoint, given *more and more thinking* at answer time"),
  { key: "curves", ms: 21500, line: `Test-time scaling: Lean RL ${pct(LEAN_1X)} → ${pct(LEAN_8X)} accuracy from a 1× to an 8× thinking budget` },
  intro("film", "Reward correct answers, *charge for every token past a target*", "Lean RL"),
  { key: "film", title: "Lean RL", ms: 31000, film: { step: 4, frame: true }, line: `Lean RL: the same accuracy, ${pct(T_.lean.correct)}, with ${FEWER}% fewer tokens` },
  intro("fleet", "RL on 64 GPUs: every rollout must finish before training can start. *Who waits for whom?*"),
  ...arcClips("fleet", ["Problem: training needs every rollout, so 64 GPUs wait for the slowest one", "Elastic RL: a GPU that finishes its rollout trains or publishes at once", "Impact: almost twice the RL steps in the same time"], [11500, 12500, 9000]),
  intro("map", "One square per task: *which ones changed, not only the score*"),
  { key: "map", ms: 21000, line: `Task by task: ${FLIPS2.gained.length} newly correct, ${FLIPS2.lost.length} lost, at a 2× thinking budget` },
  intro("audit", "A better score can hide a task that broke. *Each one is named*"),
  { key: "audit", ms: 21000, line: `Regression audit: ${FLIPS2.lost.length} tasks got worse on the way, each one named` },
];
const boardAt = (clips: readonly Clip[]) => clips.findIndex((c) => c.board);
/** The board itself still belongs to the first section: its titles fly out of the first section's rail. */
const sectionOf = (clips: readonly Clip[], i: number) => { const b = boardAt(clips); return b >= 0 && i > b ? 1 : 0; };
/** The Summary part of the rail: each distinct moment, in order. */
const summaryTiles = (clips: readonly Clip[]) => clips.reduce<{ key: string; title?: string; first: number; section: number }[]>((out, c, i) => {
  if (c.key && out.at(-1)?.key !== c.key) out.push({ key: c.key, title: c.title, first: i, section: sectionOf(clips, i) });
  return out;
}, []);
/** From this clip: the next different module, and how long is left until it. */
const upNext = (clips: readonly Clip[], i: number) => {
  const c = clips[i];
  let first = i;
  while (first > 0 && clips[first - 1].key === c.key && !clips[first - 1].board) first--;
  let to = i + 1;
  while (to < clips.length && clips[to].key === c.key) to++;
  return { next: clips[to] ?? null, span: clips.slice(first, to).reduce((a, x) => a + x.ms, 0), elapsed: clips.slice(first, i).reduce((a, x) => a + x.ms, 0) };
};
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
const DWELL: Record<string, number> = { manifold: 44000, flow: 46000, setup: 46000, replay: 96000, composition: 30000, latency: 92000, map: 100000, glossary: 32000, tasks: 30000, inside: 22000, learn: 22000, terrain: 24000, frontier: 22000, curves: 34000, audit: 24000, fleet: 90000, pressure: 90000, draft: 90000, cache: 90000, overlap: 90000 };
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
  const [landingPhase, setLandingPhase] = useState<"on" | "off">("on");
  // The title board over the laboratory, between its two sections; and where the rail's titles fly in from.
  const [board, setBoard] = useState<{ from: Rects | null; then: () => void } | null>(null);
  const [railFrom, setRailFrom] = useState<Rects | null>(null);
  // Before a module opens for the first time, the whole screen says what it is.
  const [briefKey, setBriefKey] = useState<string | null>(null);
  const pendingOpen = useRef<{ key: string; auto: boolean } | null>(null);
  const briefed = useRef(new Set<string>());
  // A module that has finished once is the visitor's on any later visit: it never hurries them on.
  const seen = useRef(new Set<string>());
  const [resumed, setResumed] = useState(0);
  // Where the story pauses to ask: study this in detail, or go on. And the line that opens a new part.
  const [fork, setFork] = useState<string | null>(null);
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
    ? { key: "manifold", title: "The manifold", term: "Every task in 3D", value: `${pct(simulateLab(0, 1).correct)} → ${pct(simulateLab(3, 4).correct)}`, unit: "accuracy, three models", Glyph: GlyphManifold, onOpen: openManifold, current: mode === "manifold" }
    : { key: "flow", title: "Serving timeline", term: "Every request, phase by phase", value: `${n0(FINISH(R_[0]))} → ${n0(FINISH(R_[3]))} s`, unit: "to answer all 96", Glyph: GlyphDial, onOpen: openManifold, current: mode === "manifold" };
  const railItems: RailItem[] = training
    ? [
        manifoldItem,
        { key: "inside", title: "The layers that changed", term: "Inside the model", value: "7 of 50", unit: "words rewritten by training", Glyph: GlyphInside, onOpen: () => openView(5), current: mode === "explore" && view === 5 },
        { key: "learn", title: "GRPO", term: "Learning from test outcomes", value: `${pct(simulateLab(1, 1).correct)} → ${pct(simulateLab(2, 1).correct)}`, unit: "accuracy", Glyph: GlyphLearn, onOpen: () => openView(7), current: mode === "explore" && view === 7 },
        { key: "terrain", title: "Skill gained at each step", term: "Six stages of training", value: `${pct(simulateLab(0, 1).correct)} → ${pct(simulateLab(3, 4).correct)}`, unit: "accuracy, base to Lean RL", Glyph: GlyphTerrain, onOpen: () => openView(6), current: mode === "explore" && view === 6 },
        { key: "frontier", title: "Accuracy against GPU cost", term: "The frontier", value: `${pct(simulateLab(0, 1).correct)} → ${pct(simulateLab(3, 4).correct)}`, unit: "accuracy", Glyph: GlyphFrontier, onOpen: () => openView(8), current: mode === "explore" && view === 8 },
        { key: "curves", title: "Test-time scaling", term: "Compute curves", value: pct(simulateLab(2, 8).correct), unit: "accuracy · RL checkpoint at 8× thinking", Glyph: GlyphCurves, onOpen: () => openView(1), current: mode === "explore" && view === 1 },
        { key: "fleet", title: "Elastic RL on 64 GPUs", term: "No barrier between steps", value: "4 → 7", unit: "RL steps in 14 min", Glyph: GlyphFleet, onOpen: () => openView(4), current: mode === "explore" && view === 4 },
        { key: "map", title: "Task by task", term: "Capability map", value: `+${solvedGain}`, unit: `net tasks at ${budget}× thinking budget`, Glyph: GlyphCapability, onOpen: () => openView(0), current: mode === "explore" && view === 0 },
        { key: "film", title: "Four training moves, measured", term: "The experiment", value: `${pct(simulateLab(0, 1).correct)} → ${pct(simulateLab(3, 4).correct)}`, unit: "accuracy, synthetic tasks", Glyph: GlyphExperiment, onOpen: openFilm, current: mode === "watch", children: chapterSlot },
        { key: "tasks", title: "Harder tasks within reach", term: "Easiest to hardest", value: `${pct(baseRun.correct)} → ${pct(rlRun.correct)}`, unit: `accuracy at a ${budget}× thinking budget`, Glyph: GlyphTasks, onOpen: () => openView(3), current: mode === "explore" && view === 3 },
        { key: "audit", title: "Regression audit", term: "What got worse", value: `${rlFlips.gained.length} / ${rlFlips.lost.length}`, unit: `gained / lost at ${budget}× thinking budget`, Glyph: GlyphAudit, onOpen: () => openView(2), current: mode === "explore" && view === 2 },
      ]
    : [
        manifoldItem,
        { key: "setup", title: "Batching, prefix caching, FP8", term: "Three levers, the same answers", value: `${fmt(rlStatic.correctCost!)} → ${fmt(rlFast.correctCost!)}`, unit: "GPU-s per correct answer", Glyph: GlyphBigPicture, onOpen: openSetup, current: mode === "setup" },
        { key: "replay", title: "Request replay", term: "One request, four measures", value: `${fmt(rlStatic.tasks[6].gpuSeconds)} → ${fmt(rlFast.tasks[6].gpuSeconds)}`, unit: "GPU-s · request 7", Glyph: GlyphReplay, onOpen: () => openView(1), current: mode === "explore" && view === 1 },
        { key: "composition", title: "Policy × runtime", term: "Training meets serving", value: `${pct(simulateLab(0, budget, false, workload).correct)} → ${pct(rlFast.correct)}`, unit: "accuracy", Glyph: GlyphComposition, onOpen: () => openView(0), current: mode === "explore" && view === 0 },
        { key: "latency", title: "Tail latency (p95)", term: "The slowest 5% of requests", value: `${fmt(p95(rlStatic), 0)} → ${fmt(p95(rlFast), 0)}`, unit: "s, arrival to last word", Glyph: GlyphLatency, onOpen: () => openView(2), current: mode === "explore" && view === 2 },
        { key: "film", title: "Lever ablation", term: "One lever at a time", value: "3 levers", unit: "each measured on every request", Glyph: GlyphExperiment, onOpen: openFilm, current: mode === "watch", children: chapterSlot },
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
      if (!key) { [60, 700, 1800].forEach((ms) => window.setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: "instant", block: "start" }), ms)); return; }
      setLandingPhase("off");
      if (!training && SERVING.includes(key)) {
        setInferencePart("load");
        // Part 2 loads lazily; repeat the request until it has mounted (opening is idempotent).
        [400, 1400, 3000].forEach((ms) => window.setTimeout(() => window.dispatchEvent(new CustomEvent("lab:serving-open", { detail: key })), ms));
      } else {
        if (!training) setInferencePart("cheaper");
        railRef.current.find((item) => item.key === key)?.onOpen();
      }
      // On a cold load the page above is still settling: land again once it has.
      [60, 700, 1800].forEach((ms) => window.setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: "instant", block: "start" }), ms));
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
  // Cheap: a handful of 96-task runs, read fresh so the head always matches the figure as set.
  const briefs = moduleBriefs(training, budget, { policy: run.policyIndex, workload });
  const openSeq = useRef(0);
  const touched = useRef(0);
  const reveal = (key: string, auto: boolean) => {
    const seq = ++openSeq.current;
    setLandingPhase((p) => (p === "on" ? "off" : p));
    if (key === "film" && currentKey !== "film") setFilmRun((n) => n + 1);
    void auto;
    setStatus({ key, phase: "running" });
    touched.current = 0;
    // A module opens playing, whatever was paused before it.
    window.dispatchEvent(new Event("lab:resume"));
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
    // The title board has its own clock, and moves the Summary on when it ends.
    if (c.board) { setBoard((b) => b ?? { from: railRects(), then: () => { setRailFrom(boardRects()); setBoard(null); setClip((i) => (i === null ? i : i + 1)); } }); return; }
    setBoard(null);
    if (!c.key) return;
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
      if (c.beat !== undefined) window.dispatchEvent(new CustomEvent("lab:arc-go", { detail: { id: `${n}-${seq}`, beat: c.beat, speed: c.speed } }));
      if (c.film) window.dispatchEvent(new CustomEvent("lab:film-go", { detail: { training, ...c.film } }));
      if (c.seek !== undefined && !c.metric) window.dispatchEvent(new CustomEvent("lab:figure-seek", { detail: c.seek }));
      if (c.metric) window.dispatchEvent(new CustomEvent("lab:replay-metric", { detail: { id: `${n}-${seq}`, metric: c.metric, seek: c.seek } }));
    };
    // The introduction opens the module under the blur; the module plays once the introduction has gone.
    if (c.intro) return;
    [260, 900, 1700, 3000].forEach((ms) => window.setTimeout(() => { if (ms === 260 || c.beat !== undefined || c.metric) send(); }, ms));
  };
  /** Back, forward or a tick on the summary's bar. */
  // Only the pause button stops anything. Every other move (a step, a jump, a module from the rail)
  // plays, and lets go of a pause the figures were told about.
  const letGo = () => { if (clipHeld) { setClipHeld(false); window.dispatchEvent(new Event("lab:release")); } };
  const goClip = (n: number) => {
    letGo();
    const to = Math.max(0, Math.min(clips.length - 1, n));
    // jumping restarts the figure from the clip's own moment
    lastClipKey.current = clip !== null && clips[clip].key === clips[to].key ? clips[to].key ?? null : null;
    setClip(to);
  };
  // Holding during an introduction skips the introduction: the visitor is held on the figure, not on a blurred screen.
  const toggleClipHold = () => {
    window.dispatchEvent(new Event(clipHeld ? "lab:release" : "lab:hold"));
    if (!clipHeld && clip !== null && (clips[clip].intro || clips[clip].purpose)) setClip(clip + 1);
    setClipHeld(!clipHeld);
  };
  const summaryRef = useRef({ on: false, held: false, hold: () => {} });
  useEffect(() => { summaryRef.current = { on: clip !== null, held: clipHeld, hold: () => { window.dispatchEvent(new Event("lab:hold")); if (clip !== null && (clips[clip].intro || clips[clip].purpose)) setClip(clip + 1); setClipHeld(true); } }; });
  const openKey = (key: string, auto = false) => {
    letGo();
    if (key === "summary") { setLandingPhase((p) => (p === "on" ? "off" : p)); setBriefKey(null); setFork(null); setBoard(null); lastClipKey.current = null; setClip(0); return; }
    setClip(null);
    setFork(null);
    // The second section opens on the title board: the first folds to the left, the second takes the space.
    if (!training && key === "pressure" && !carded.current) {
      carded.current = true;
      setBoard({ from: railRects(), then: () => openKeyRef.current(key, auto) });
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
  const startShow = (key: string, from: Rects | null = boardRects()) => {
    setRailFrom(from);
    setLandingPhase("off");
    setBoard(null);
    openKey(key);
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
    // Opening a module's own explorer hands it to the visitor, as "Stay on this one" does.
    const taken = () => { if (currentRef.current !== "summary") setStatus({ key: currentRef.current, phase: "taken" }); };
    el.addEventListener("lab:module-taken", taken);
    const io = new IntersectionObserver(([e]) => setLabInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => { el.removeEventListener("lab:module-round", done); el.removeEventListener("lab:module-taken", taken); io.disconnect(); };
  }, [ref]);
  // Using the stage holds the show while the visitor is there. Only "Stay on this one" holds it for good;
  // a module that was used and then left alone moves on, so the show never just stops.
  const [touchTick, setTouchTick] = useState(0);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !show) return;
    // In the Summary a hand on the stage holds it there; elsewhere it gives the visitor time.
    // A hand on the stage gives the visitor time; it never stops anything.
    const touch = (e: Event) => { if (!e.isTrusted || summaryRef.current.on) return; touched.current = performance.now(); setTouchTick((n) => n + 1); };
    stage.addEventListener("pointerdown", touch, true);
    stage.addEventListener("keydown", touch, true);
    // Not on "input": re-rendering in the middle of a slider's event resets its value before React reads it.
    return () => { stage.removeEventListener("pointerdown", touch, true); stage.removeEventListener("keydown", touch, true); };
  }, [show]);
  useEffect(() => {
    if (!show || landingPhase === "on" || phase !== "running" || !touched.current || clip !== null) return;
    const id = window.setTimeout(() => setStatus((s) => (s.key === currentKey && s.phase === "taken" ? s : { key: currentKey, phase: "done" })), IDLE_MOVE_ON);
    return () => window.clearTimeout(id);
  }, [show, landingPhase, phase, currentKey, touchTick, clip]);
  useEffect(() => { if (phase === "done") seen.current.add(currentKey); }, [phase, currentKey]);
  useEffect(() => {
    const ms = DWELL[currentKey];
    if (!show || landingPhase === "on" || !ms) return;
    const id = window.setTimeout(() => setStatus((s) => (s.key === currentKey && s.phase === "taken" ? s : { key: currentKey, phase: "done" })), ms);
    return () => window.clearTimeout(id);
  }, [show, landingPhase, currentKey, resumed]);
  useEffect(() => {
    if (!show || landingPhase === "on" || phase !== "done" || !labInView || briefKey || fork || board || clip !== null) return;
    // The show ends on its last module; it does not loop back to the start.
    if (lastModule) return;
    // A recent touch gives the visitor time before the show moves on.
    const wait = Math.max(COUNTDOWN, touched.current ? IDLE_MOVE_ON * 0.8 - (clockNow() - touched.current) : 0);
    const id = window.setTimeout(() => openKeyRef.current(nextKey, true), wait);
    return () => window.clearTimeout(id);
  }, [show, landingPhase, phase, labInView, nextKey, briefKey, lastModule, touchTick, fork, board, clip]);
  const playClipRef = useRef(playClip);
  useEffect(() => { playClipRef.current = playClip; });
  useEffect(() => {
    if (clip === null || !show) return;
    playClipRef.current(clips[clip], clip);
    // the clip list is fixed for one laboratory
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clip, show]);
  useEffect(() => {
    if (clip === null || !show || clipHeld || !labInView || clips[clip].board) return;
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
  // Under an introduction or a title board, a module waits to begin.
  const veiled = !!briefKey || !!board || (clip !== null && (!!clips[clip].intro || !!clips[clip].purpose));

  // The reel orientations keep the stage at its natural size; "bar" is the one-screen block.
  const block = labNav === "bar";
  const reelItems: readonly ReelItem[] = railItems;
  const navLabel = labNav === "side" ? "Go deeper" : training ? "Go deeper · post-training laboratory" : "Go deeper · same intelligence, cheaper execution";
  const summaryTicks = clip !== null ? (
    <span className="sb-ticks" role="group" aria-label={tr("Summary progress")}>
      {clips.map((c, i) => c.intro || c.board ? null : (
        <button key={i} type="button" title={tr(c.line ?? "")} data-module={clips[i - 1]?.key !== c.key || undefined} data-section={clips[i - 1]?.board || clips[i - 2]?.board || undefined} data-on={i === clip || undefined} data-done={i < clip || undefined} aria-label={`${tr("Moment")} ${i + 1}`} onClick={() => goClip(i)}>
          {i === clip && <i key={`${clip}-${clipHeld}`} style={{ animationDuration: `${c.ms}ms`, animationPlayState: clipHeld ? "paused" : "running" }} />}
        </button>
      ))}
    </span>
  ) : null;
  const railSection = clip !== null ? sectionOf(clips, clip) : 0, twoSections = boardAt(clips) >= 0;
  const clipNext = clip !== null ? upNext(clips, clip).next : null;
  const railNext = clip === null
    ? showItems.find((i) => i.key === nextKey)?.title ?? ""
    : !clipNext ? "In detail, or the next project"
    : clipNext.board ? pathways[1].short
    : clipNext.title ?? showItems.find((i) => i.key === clipNext.key)?.title ?? "";
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
        from={railFrom}
        ringKey={clip ?? undefined}
        ringDelay={clip !== null ? upNext(clips, clip).elapsed : 0}
        groups={[
          { key: "summary", label: "Summary", onOpen: () => openKey("summary"), items: summaryTiles(clips).filter((c) => c.section === railSection).map((c) => ({ key: c.key, title: c.title ?? showItems.find((i) => i.key === c.key)?.title ?? c.key, section: twoSections ? pathways[railSection].short : undefined, Glyph: c.title === "Lean RL" ? GlyphLean : showItems.find((i) => i.key === c.key)?.Glyph })), also: twoSections ? { label: pathways[1 - railSection].short, onOpen: () => goClip(railSection === 0 ? boardAt(clips) : 0) } : undefined, alsoFirst: railSection === 1, count: summaryTiles(clips).length },
          { key: "detail", label: "In detail", onOpen: () => openKey(order[0]), items: showItems.map((i) => ({ key: i.key, title: i.title, section: training ? undefined : pathways[i.pathway].short, Glyph: i.Glyph })) },
        ]}
        active={clip !== null || fork ? "summary" : "detail"}
        current={clip !== null ? clips.slice(0, clip + 1).reverse().find((c) => c.key)?.key ?? "" : currentKey}
        next={railNext}
        phase={clip !== null ? (clipHeld ? "taken" : "running") : phase}
        held={clipHeld}
        summary={clip !== null ? { held: clipHeld, first: clip === 0, last: clip === clips.length - 1, onBack: () => goClip(clip - 1), onToggle: toggleClipHold, onForward: () => goClip(clip + 1) } : undefined}
        last={clip === null && lastModule}
        afterLast={training ? { title: "Inference optimization", href: "/#inference" } : { title: "Medical AI", href: "/#mindscape" }}
        countdownMs={clip !== null ? upNext(clips, clip).span : COUNTDOWN}
        onItem={(key) => {
          if (clip !== null) { const t = summaryTiles(clips).find((c) => c.key === key); if (t) goClip(t.first); return; }
          openKey(key);
        }}
        onNext={() => { if (clip !== null) { const u = upNext(clips, clip); if (u.next) goClip(clips.indexOf(u.next)); else { setClip(null); setFork("summary"); } } else openKey(nextKey); }}
        onLanding={() => { setFork(null); setClip(null); setBoard(null); carded.current = false; setLandingPhase("on"); }}
        onStay={() => stayHere()}
        onKeepPlaying={() => keepPlaying()}
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
      data-clip={clip ?? undefined}
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
            <div className="sm-head" key={`${key}|${clip}`} style={board ? { visibility: "hidden" } : undefined}>
              <p className="sm-title">
                {clip !== null ? <strong>{tr(clips[clip].line ?? clips.slice(clip).find((c) => c.line)?.line ?? "")}</strong> : <>
                  <strong>{tr(brief?.does ?? item?.title ?? "")}</strong>
                  {brief && <span>{highlight(tr(brief.impact))}</span>}
                </>}
              </p>
              <div className="sm-sub">
                <span className="sm-name">{tr(clip !== null ? clips.slice(0, clip + 1).reverse().find((c) => c.title)?.key === key && clips[clip].title ? clips[clip].title! : item?.title ?? "" : item?.title ?? "")}{item?.term && <i> · {tr(item.term)}</i>}</span>
                {clip === null && <StageMeter moduleKey={`${currentKey}|${chapter}`} rest={brief ? tr(brief.why) : undefined} />}
                {summaryTicks}
              </div>
            </div>
          );
        })()}
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
        {show && landingOn && (
          <TitleBoard pathways={pathways} items={showItems} lines={training ? TRAINING_OPENING : INFERENCE_OPENING} onStart={(key, from) => startShow(key, from)} onEnd={() => startShow("summary")} />
        )}
        {show && board && (
          <TitleBoard overlay quick start={1} threshold={0.2} from={board.from} pathways={pathways} items={showItems} onStart={(key, from) => { setRailFrom(from); setBoard(null); openKey(key); }} onEnd={() => board.then()} />
        )}
        {briefKey && briefs[briefKey] && (
          <ModuleBrief
            item={showItems.find((i) => i.key === briefKey)!}
            brief={briefs[briefKey]}
            path={pathways[showItems.find((i) => i.key === briefKey)?.pathway ?? 0].short}
            away={!labInView} onDone={endBrief}
          />
        )}
        {show && clip !== null && clips[clip].purpose && labInView && !clipHeld && <PurposeCard key={clip} ms={clips[clip].ms} {...PURPOSE} />}
        {show && clip !== null && clips[clip].intro && (() => {
          const c = clips[clip], item = showItems.find((i) => i.key === c.key);
          // Only while the lab is on screen and playing: a fixed blur must never outlive its moment.
          return item && labInView && !clipHeld ? <IntroCard labels={c.labels} brief={c.title ? undefined : briefs[c.key!]} key={clip} item={c.title ? { ...item, title: c.title, term: "Shorter traces, the same answers", Glyph: c.title === "Lean RL" ? GlyphLean : item.Glyph } : item} text={c.intro!} ms={c.ms} /> : null;
        })()}
        {show && fork && (
          <ChoiceCard
            away={!labInView}
            auto
            headline={training ? `Post-training, in summary: accuracy *${pct(T_.base.correct)} → ${pct(T_.lean.correct)}*` : "That is the whole system, *two ways*: where would you like to go?"}
            study={training
              ? { title: "Go through it in detail", detail: "Every module in full: the figures, the methods and the training data", onPick: () => openKey(order[0]) }
              : { title: "Same intelligence at cheaper cost, in detail", detail: "The dial, the three levers, one request, the slowest requests", onPick: () => openKey(order[0]) }}
            also={training ? [] : [
              { title: "Serving under load, in detail", detail: "Chunked prefill, speculative decoding, cache-aware routing, CPU/GPU overlap", onPick: () => { carded.current = true; openKey("pressure"); } },
              { title: "Each component, in the microscope", detail: "Follow one request through the serving engine, part by part", href: "/inference#inference-microscope" },
            ]}
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
              ? <Manifold dwell={clip !== null ? 5200 : 9000} active={mode === "manifold" && landingPhase === "off" && !veiled && labInView} onRound={() => ref.current?.dispatchEvent(new CustomEvent("lab:module-round", { bubbles: true }))} />
              : <ServingDial active={mode === "manifold" && landingPhase === "off" && !veiled && labInView} onRound={() => ref.current?.dispatchEvent(new CustomEvent("lab:module-round", { bubbles: true }))} />}
          </div>
        </RetainedLabPanel>
        {!training && (
          <RetainedLabPanel active={mode === "setup"} id={`${domain}-big-picture`} label="The big picture">
            <BigPicture active={mode === "setup" && landingPhase === "off" && !veiled && labInView && inferencePart === "cheaper"} />
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
                <GhostCursor key={view} root={exhibitRef} script={view === 1 ? CURVES_DEMO : MAP_DEMO} enabled={mode === "explore" && (view === 0 || view === 1) && !veiled} startDelay={2500} restDelay={2200} loop={!show} />
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
                      <GhostCursor root={replayHost} script={REPLAY_DEMO} enabled={mode === "explore" && view === 1 && clip === null} startDelay={REPLAY_MS + 5000} loop={!show} />
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
                      <GhostCursor root={latencyHost} script={LATENCY_DEMO} enabled={mode === "explore" && view === 2 && clip === null} startDelay={1000} restDelay={1800} loop={!show} />
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
                <InsideScan active={mode === "explore" && view === 5 && landingPhase === "off" && !veiled} />
              ) : view === 6 ? (
                <CapabilityTerrain active={mode === "explore" && view === 6 && !veiled} />
              ) : view === 7 ? (
                <ExhibitModule key="learn" Scene={PolicyGrpo} duration={16800} label="Learning from outcomes" active={mode === "explore" && view === 7 && !veiled} />
              ) : view === 8 ? (
                <ExhibitModule key="frontier" Scene={PolicyFrontierStory} duration={FRONTIER_STORY_MS} label="The frontier" active={mode === "explore" && view === 8 && !veiled} />
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
