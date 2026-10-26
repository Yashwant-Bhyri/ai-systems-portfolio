import { inferenceStoryRuns } from "../compute/lab-story-data";
import { compareTasks, simulateLab } from "../compute/lab-simulation";
import { latencyDistribution } from "../compute/load-latency-model";
import { BATCHING } from "../compute/batching-result";
import { PRESSURE_GAP } from "../compute/serving-rail-meta";
import { cacheRoutingStudy } from "../compute/cache-routing-model";
const CACHE = cacheRoutingStudy();
import { fmtMs, rateCard } from "../compute/calibration";

/** Every number on the posters comes from the lab model the laboratory uses. */
const runs = inferenceStoryRuns("shared-prefix");
const p95 = (r: (typeof runs)[number]) => latencyDistribution(r, 95).threshold.latency;
export const COST = {
  base: runs[0].correctCost!, batching: runs[1].correctCost!, reuse: runs[2].correctCost!, kernels: runs[3].correctCost!,
  p95Base: runs[0].p95, p95Batching: runs[1].p95,
};
const base = simulateLab(0, 2, false, "shared-prefix"), rlStatic = simulateLab(2, 2, false, "shared-prefix"), rlFast = simulateLab(2, 2, true, "shared-prefix");
export const LAB = {
  correctBase: base.correct, correctRl: rlFast.correct,
  replay: [rlStatic.tasks[6].gpuSeconds, rlFast.tasks[6].gpuSeconds] as const,
  p95: [p95(rlStatic), p95(rlFast)] as const,
  gantt: { before: rlStatic.tasks.map((t) => [t.start, t.finish] as const), after: rlFast.tasks.map((t) => [t.start, t.finish] as const) },
};

export type PosterCard = { key: string; title: string; from: string; to: string; unit: string; cause: string };
export const UNDER_LOAD: readonly (PosterCard & { a: number; b: number })[] = [
  { key: "pressure", title: "Prefill / decode scheduling", from: PRESSURE_GAP.whole.toFixed(0), to: PRESSURE_GAP.chunked.toFixed(1), unit: "ms worst pause in a live answer", cause: "an 8,192-token prompt is read in slices beside the answers", a: PRESSURE_GAP.whole, b: PRESSURE_GAP.chunked },
  { key: "draft", title: "Speculative decoding", from: "12", to: "3", unit: "serial large-model calls", cause: "a small model drafts, the large one checks in one pass", a: 12, b: 3 },
  { key: "cache", title: "Cache-aware routing", from: `${CACHE.cold.firstToken}`, to: `${CACHE.warm.firstToken}`, unit: "ms to the first token", cause: "the request goes where its prefix is cached", a: CACHE.cold.firstToken, b: CACHE.warm.firstToken },
  { key: "overlap", title: "CPU / GPU overlap", from: "52", to: "37", unit: "ms for four decode steps", cause: "the CPU prepares the next step during this one", a: 52, b: 37 },
];
const f = (v: number, d = 2) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
export const ALSO: readonly { key: string; title: string; value: string }[] = [
  { key: "composition", title: "Policy × runtime", value: `${LAB.correctBase} → ${LAB.correctRl} correct, cheaper per answer` },
  { key: "replay", title: "Execution replay", value: `${f(LAB.replay[0])} → ${f(LAB.replay[1])} GPU-s for request 7` },
  { key: "latency", title: "Queue & latency", value: `${f(LAB.p95[0], 0)} → ${f(LAB.p95[1], 0)} s p95 response` },
  { key: "map", title: "Serving overview", value: "ten mechanisms on one clock" },
  { key: "glossary", title: "Serving glossary", value: "nine terms, each with its number" },
];
/** The deep route for each project: architecture → component microscope → laboratory. */
export const DEPTH = { inference: "/inference", training: "/post-training" } as const;
/** Where an inference card opens. */
export const labHref = (key: string) => `${DEPTH.inference}#inference-study/${key}`;
export const fmt = f;

import type { LedgerSpec } from "./posters";
const PCT = Math.round(100 * (1 - COST.kernels / COST.base));
export const INFERENCE_LEDGER: LedgerSpec = {
  domain: "inference", mode: "shrink",
  title: "Inference optimization engine",
  claim: `Qwen3-4B on H100s, same answers, ${PCT}% less GPU work per correct answer. Costs come from a roofline calibrated on published specs.`,
  cta: "Explore the engine in depth",
  scale: COST.base, start: COST.base, end: COST.kernels, digits: 2,
  unit: "GPU-seconds per correct answer, 96 requests over one shared document, one request per H100 at a time",
  slices: [
    { key: "film", title: "FP8 weights and KV", delta: `−${f(COST.reuse - COST.kernels)} GPU-s`, cause: `half the bytes per decode step: ${fmtMs(rateCard(false).outputMs)} → ${fmtMs(rateCard(true).outputMs)} ms a token`, from: COST.kernels, to: COST.reuse, color: "#ffc267" },
    { key: "film", title: "Prefix reuse", delta: `−${f(COST.batching - COST.reuse)} GPU-s`, cause: "prompt reading −89%; answers dominate", from: COST.reuse, to: COST.base, color: "#63d4df" },
  ],
  note: { title: "Continuous batching", text: `a free worker starts the next request at once: p95 ${f(COST.p95Base, 0)} → ${f(COST.p95Batching, 0)} s. Sharing each step across requests goes further: ${f(BATCHING.batchedPerCorrect)} GPU-s per correct answer in the serving simulator.` },
  measuresTitle: "Under load",
  measures: UNDER_LOAD,
  also: ALSO,
};

const T = [simulateLab(0, 1), simulateLab(1, 1), simulateLab(2, 1), simulateLab(2, 4), simulateLab(3, 4)];
const perTask = (r: (typeof T)[number]) => Math.round(r.tokens / r.n);
const flips = compareTasks(simulateLab(0, 2), simulateLab(2, 2));
export const TRAINING_LEDGER: LedgerSpec = {
  domain: "training", mode: "grow",
  title: "Advanced post-training",
  claim: `A 4B model goes from ${T[0].correct} to ${T[3].correct} of 96 tasks, then keeps them with ${Math.round(100 * (1 - perTask(T[4]) / perTask(T[3])))}% fewer tokens.`,
  cta: "Explore the training in depth",
  scale: 96, start: T[0].correct, end: T[3].correct, digits: 0,
  unit: "of 96 synthetic tasks solved, base model to RL with 4× thought",
  slices: [
    { key: "film", title: "SFT + LoRA", delta: `+${T[1].correct - T[0].correct} tasks`, cause: "trained on verified worked solutions", from: T[0].correct, to: T[1].correct, color: "#c7a6ff" },
    { key: "film", title: "Correctness RL", delta: `+${T[2].correct - T[1].correct}`, cause: "rewarded for answers that pass", from: T[1].correct, to: T[2].correct, color: "#f3a0bc" },
    { key: "film", title: "4× thought", delta: `+${T[3].correct - T[2].correct} tasks`, cause: "more room to reason at test time", from: T[2].correct, to: T[3].correct, color: "#ffc267" },
  ],
  note: { title: "Base Qwen3-4B", text: `${T[0].correct} tasks solved before any training` },
  measuresTitle: "Inside the training",
  measures: [
    { key: "fleet", title: "Elastic RL on 64 GPUs", from: "4", to: "7", unit: "RL steps in the same 14 minutes", a: 4, b: 7 },
    { key: "film", title: "Lean RL", from: f(perTask(T[3]), 0), to: f(perTask(T[4]), 0), unit: `tokens per task, still ${T[4].correct} solved`, a: perTask(T[3]), b: perTask(T[4]) },
    { key: "inside", title: "Inside the model", to: "7 of 50", unit: "words the base model would have written differently" },
    { key: "audit", title: "Regression audit", to: `+${flips.gained.length} / −${flips.lost.length}`, unit: "tasks gained and lost at 2× thought" },
  ],
  also: [
    { key: "terrain", title: "Capability terrain", value: "96 tasks rising across six checkpoints" },
    { key: "map", title: "Capability map", value: "every task, every checkpoint" },
    { key: "curves", title: "Compute curves", value: "1× to 8× thought" },
    { key: "tasks", title: "Where the 96 tasks land", value: "difficulty against GPU-s" },
  ],
};
