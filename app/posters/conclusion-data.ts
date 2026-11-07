import { inferenceStoryRuns } from "../compute/lab-story-data";
import { compareTasks, simulateLab } from "../compute/lab-simulation";
import { rateCard, fmtMs } from "../compute/calibration";
import { OVERLAP, PRESSURE_GAP, CACHE_DELTA } from "../compute/serving-rail-meta";
import { FRONTIER_COST } from "../exhibit/policy/data.ts";
import type { ConclusionSpec } from "../conclusion-board";

/* Every number comes from the same model as the laboratory. */
const f = (v: number, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const R = inferenceStoryRuns("shared-prefix");
const meanPrefillMs = (r: (typeof R)[number]) => (1000 * r.tasks.reduce((a, t) => a + t.prefill, 0)) / r.tasks.length;
const pct = Math.round(100 * (1 - R[3].correctCost! / R[0].correctCost!));

export const INFERENCE_CONCLUSION: ConclusionSpec = {
  verdict: `The same ${R[0].correct} correct answers from the same model, with *${pct}% less GPU time per answer*, and the slowest requests answered ${f(R[0].p95 - R[3].p95)} s sooner`,
  measures: [
    { label: "GPU time per correct answer", from: f(R[0].correctCost!, 2), to: f(R[3].correctCost!, 2), unit: "GPU-s" },
    { label: "Slowest 5% of requests", from: f(R[0].p95), to: f(R[3].p95), unit: "seconds to answer" },
    { label: "Correct answers", from: String(R[0].correct), to: String(R[3].correct), unit: "of 96, none lost" },
  ],
  groups: [
    { title: "Cheaper execution", rows: [
      { what: "Free-worker scheduling", how: "no worker idles while a request waits", result: `${f(R[0].p95)} → ${f(R[1].p95)} s` },
      { what: "Prefix reuse", how: "a shared document is read once", result: `${f(meanPrefillMs(R[1]))} → ${f(meanPrefillMs(R[2]))} ms` },
      { what: "FP8 weights and KV", how: `${fmtMs(rateCard(false).outputMs)} → ${fmtMs(rateCard(true).outputMs)} ms per token`, result: `${f(R[2].correctCost!, 2)} → ${f(R[3].correctCost!, 2)} GPU-s` },
    ] },
    { title: "Serving under load", rows: [
      { what: "Chunked prefill", how: "worst pause in a live answer", result: `${f(PRESSURE_GAP.whole)} → ${f(PRESSURE_GAP.chunked, 1)} ms` },
      { what: "Speculative decoding", how: "serial calls of the large model", result: "12 → 3" },
      { what: "Cache-aware routing", how: "first token on the warm replica", result: `−${CACHE_DELTA} ms` },
      { what: "CPU/GPU overlap", how: "four decode steps", result: `${OVERLAP.baseline.finish} → ${OVERLAP.overlapped.finish} ms` },
    ] },
  ],
  learned: "Each lever moves a different number: scheduling removes the wait, reuse removes the prompt read, and only faster decode moves the bill, because writing answers is where the GPU time goes.",
  note: "96 synthetic requests; costs from a roofline calibrated on published H100 specs",
  links: [{ title: "Watch the results", href: "/inference#inference-study" }],
};

const T = { base: simulateLab(0, 1), sft: simulateLab(1, 1), rl: simulateLab(2, 1), rl4: simulateLab(2, 4), lean: simulateLab(3, 4) };
const perTask = (r: typeof T.base) => r.tokens / r.n;
const fewer = Math.round(100 * (1 - perTask(T.lean) / perTask(T.rl4)));
const runtimeCut = Math.round((100 * (FRONTIER_COST.policy - FRONTIER_COST.runtime)) / FRONTIER_COST.policy);
const flips = compareTasks(simulateLab(0, 2), simulateLab(2, 2));

export const TRAINING_CONCLUSION: ConclusionSpec = {
  verdict: `One 4B base model went from *${T.base.correct} to ${T.lean.correct} of 96 tasks solved*, then kept them with ${fewer}% fewer tokens`,
  measures: [
    { label: "Tasks solved", from: String(T.base.correct), to: String(T.lean.correct), unit: "of 96" },
    { label: "Tokens per task, after lean RL", from: f(perTask(T.rl4)), to: f(perTask(T.lean)), unit: `same ${T.lean.correct} solved` },
    { label: "GPU time per correct answer", from: f(FRONTIER_COST.policy, 2), to: f(FRONTIER_COST.runtime, 2), unit: `GPU-s, ${runtimeCut}% less on the serving runtime` },
  ],
  groups: [
    { title: "Making it smarter", rows: [
      { what: "SFT + LoRA", how: "imitates verified reasoning", result: `${T.base.correct} → ${T.sft.correct}` },
      { what: "Correctness RL (GRPO)", how: "learns from outcomes its tests check", result: `${T.sft.correct} → ${T.rl.correct}` },
      { what: "4× thinking budget", how: "same weights, more room to reason", result: `${T.rl.correct} → ${T.rl4.correct}` },
    ] },
    { title: "Making it affordable", rows: [
      { what: "Lean RL", how: "charges for every token", result: `−${fewer}% tokens` },
      { what: "Elastic RL on 64 GPUs", how: "RL steps in the same 14 minutes", result: "4 → 7" },
      { what: "Regression audit", how: "tasks gained and lost, each one named", result: `+${flips.gained.length} / −${flips.lost.length}` },
    ] },
  ],
  learned: "Training raises what the model can do, the thinking budget lets it use that ability, and lean RL makes it affordable. Accuracy and cost have to be read together, so every step reports both.",
  note: "96 synthetic tasks on a simulated model; not a measured Qwen3-4B run",
  links: [{ title: "Watch the results", href: "/post-training#post-training-study" }],
};
