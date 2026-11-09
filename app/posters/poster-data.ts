import { inferenceStoryRuns } from "../compute/lab-story-data";
import { compareTasks, simulateLab } from "../compute/lab-simulation";
import { latencyDistribution } from "../compute/load-latency-model";
import { BATCHING } from "../compute/batching-result";
import { OVERLAP, PRESSURE_GAP } from "../compute/serving-rail-meta";
import { cacheRoutingStudy } from "../compute/cache-routing-model";
const CACHE = cacheRoutingStudy();

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
  costBase: base.correctCost!, costRl: rlFast.correctCost!,
  replay: [rlStatic.tasks[6].gpuSeconds, rlFast.tasks[6].gpuSeconds] as const,
  p95: [p95(rlStatic), p95(rlFast)] as const,
  gantt: { before: rlStatic.tasks.map((t) => [t.start, t.finish] as const), after: rlFast.tasks.map((t) => [t.start, t.finish] as const) },
};

export type PosterCard = { key: string; title: string; from: string; to: string; unit: string; cause: string };
/** Before the laboratory's Summary, results are percentages; the raw values live inside each module. */
const less = (from: number, to: number) => `−${Math.round(100 * (1 - to / from))}%`;
export const UNDER_LOAD: readonly (PosterCard & { a: number; b: number })[] = [
  { key: "pressure", title: "Chunked prefill", from: "", to: less(PRESSURE_GAP.whole, PRESSURE_GAP.chunked), unit: "worst pause in a live answer", cause: "a long prompt is read in slices beside the answers", a: PRESSURE_GAP.whole, b: PRESSURE_GAP.chunked },
  { key: "draft", title: "Speculative decoding", from: "", to: less(12, 3), unit: "serial large-model calls", cause: "a small model drafts, the large one checks in one pass", a: 12, b: 3 },
  { key: "cache", title: "Cache-aware routing", from: "", to: less(CACHE.cold.firstToken, CACHE.warm.firstToken), unit: "time to the first token", cause: "the request goes where its prefix is cached", a: CACHE.cold.firstToken, b: CACHE.warm.firstToken },
  { key: "overlap", title: "CPU / GPU overlap", from: "", to: less(OVERLAP.baseline.finish, OVERLAP.overlapped.finish), unit: "time for four decode steps", cause: "the CPU prepares the next step during this one", a: OVERLAP.baseline.finish, b: OVERLAP.overlapped.finish },
];
const f = (v: number, d = 2) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
export const ALSO: readonly { key: string; title: string; value: string }[] = [
  { key: "composition", title: "Policy × runtime", value: `${Math.round((100 * LAB.correctBase) / 96)}% → ${Math.round((100 * LAB.correctRl) / 96)}% accuracy, ${less(LAB.costBase, LAB.costRl)} GPU time each` },
  { key: "replay", title: "Execution replay", value: `${less(LAB.replay[0], LAB.replay[1])} GPU time for one request` },
  { key: "latency", title: "Queue & latency", value: `${less(LAB.p95[0], LAB.p95[1])} wait for the slowest 5%` },
  { key: "map", title: "System map", value: "ten mechanisms on one clock" },
  { key: "glossary", title: "Serving glossary", value: "nine terms, each with its number" },
];
/** The deep route for each project: architecture → component microscope → laboratory. */
export const DEPTH = { inference: withBase("/inference"), training: withBase("/post-training") } as const;
/** Where an inference card opens. */
export const labHref = (key: string) => `${DEPTH.inference}#inference-study/${key}`;
export const fmt = f;
/** A count of the 96 tasks as a whole percentage. */
const Pc = (n: number) => Math.round((100 * n) / 96);

import type { LedgerSpec } from "./posters";
import { withBase } from "../base-path";
const PCT = Math.round(100 * (1 - COST.kernels / COST.base));
/** GPU time as a share of the starting setup: 100% before, the rest after. */
const Rel = (v: number) => (100 * v) / COST.base;
export const INFERENCE_LEDGER: LedgerSpec = {
  domain: "inference", mode: "shrink",
  title: "Inference optimization engine",
  claim: `Qwen3-4B on H100s, same answers, ${PCT}% less GPU work per correct answer. Costs come from a roofline calibrated on published specs.`,
  cta: "Explore the engine in depth",
  scale: 100, start: 100, end: Math.round(Rel(COST.kernels)), digits: 0, suffix: "%",
  unit: "GPU time per correct answer, as a share of the starting setup: the same model and the same answers",
  slices: [
    { key: "film", title: "FP8 weights and KV", delta: `−${Math.round(Rel(COST.reuse) - Rel(COST.kernels))}%`, cause: "half the bytes per decode step", from: Rel(COST.kernels), to: Rel(COST.reuse), color: "#ffc267" },
    { key: "film", title: "Prefix reuse", delta: `−${Math.round(Rel(COST.batching) - Rel(COST.reuse))}%`, cause: "prompt reading −89%; answers dominate", from: Rel(COST.reuse), to: 100, color: "#63d4df" },
  ],
  note: { title: "Continuous batching", text: `a free worker starts the next request at once: the slowest 5% wait ${less(COST.p95Base, COST.p95Batching)}. Sharing each step across requests goes further: ${less(COST.base, BATCHING.batchedPerCorrect)} GPU time per correct answer in the serving simulator.` },
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
  claim: `A 4B model goes from ${Pc(T[0].correct)}% to ${Pc(T[3].correct)}% accuracy, then keeps it with ${Math.round(100 * (1 - perTask(T[4]) / perTask(T[3])))}% fewer tokens.`,
  cta: "Explore the training in depth",
  // On the home page, accuracy in percent: never a count out of 96.
  scale: 100, start: Pc(T[0].correct), end: Pc(T[3].correct), digits: 0, suffix: "%",
  unit: "accuracy on the synthetic maths and coding tasks",
  slices: [
    { key: "film", title: "SFT + LoRA", delta: `+${Pc(T[1].correct) - Pc(T[0].correct)} points`, cause: "trained on verified worked solutions", from: Pc(T[0].correct), to: Pc(T[1].correct), color: "#c7a6ff" },
    { key: "film", title: "GRPO", delta: `+${Pc(T[2].correct) - Pc(T[1].correct)} points`, cause: "rewarded for answers that pass", from: Pc(T[1].correct), to: Pc(T[2].correct), color: "#f3a0bc" },
    { key: "film", title: "Test-time scaling", delta: `+${Pc(T[3].correct) - Pc(T[2].correct)} points`, cause: "more room to reason at test time", from: Pc(T[2].correct), to: Pc(T[3].correct), color: "#ffc267" },
  ],
  note: { title: "Base Qwen3-4B", text: `${Pc(T[0].correct)}% accuracy before any training` },
  measuresTitle: "Inside the training",
  measures: [
    { key: "fleet", title: "Elastic RL on 64 GPUs", from: "", to: "+75%", unit: "RL steps in the same time", a: 4, b: 7 },
    { key: "film", title: "Lean RL", from: "", to: less(perTask(T[3]), perTask(T[4])), unit: "tokens per task, the same accuracy", a: perTask(T[3]), b: perTask(T[4]) },
    { key: "inside", title: "Inside the model", to: "14%", unit: "of the words the base model would have written differently" },
    { key: "audit", title: "Regression audit", to: `+${Pc(flips.gained.length)}% / −${Pc(flips.lost.length)}%`, unit: "of tasks gained and lost, base vs RL at the same 2× budget" },
  ],
  also: [
    { key: "terrain", title: "Capability terrain", value: "every task, rising across six checkpoints" },
    { key: "map", title: "Capability map", value: "every task, every checkpoint" },
    { key: "curves", title: "Compute curves", value: "1× to 8× thought" },
    { key: "tasks", title: "Where the tasks land", value: "difficulty against GPU time" },
  ],
};
