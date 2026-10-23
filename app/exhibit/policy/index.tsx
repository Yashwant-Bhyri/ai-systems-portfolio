"use client";

import { Wing, type Room } from "../shell";
import { PolicyAudit } from "./audit";
import { PolicyBase } from "./base";
import { PolicyFleet } from "./fleet";
import { PolicyFrontier } from "./frontier";
import { PolicyGrpo } from "./grpo";
import { PolicyLean } from "./lean";
import { PolicyMap } from "./map";
import { PolicySft } from "./sft";
import { PolicyThink } from "./think";

const ROOMS: Room[] = [
  {
    id: "map", label: "System",
    kicker: "System map · fleet · weights · eval",
    title: <>From 28 to 82 of 96 solved. <em>Then a third cheaper per task.</em></>,
    metric: { value: <>85.4<small>%</small></>, label: "pass@1 · 96 tasks" },
    duration: 13000, beats: [0, 2600, 5200, 7800, 10400], zh: { label: "系统", kicker: "系统总览 · 集群 · 权重 · 评估", title: <>96 题中从 28 题到 82 题。<em>每题成本再降三分之一。</em></>, metricLabel: "pass@1 · 96 个任务" },
    dev: { rows: [["policies", "base → SFT → GRPO → 4× → lean 4×"], ["pass@1", "29.2 → 47.9 → 57.3 → 85.4 → 85.4"], ["GPU-s/task", "5.37 → 6.10 → 10.32 → 26.04 → 17.31"], ["fleet", "64 GPU · elastic roles"]], source: "lab-simulation.ts · simulateLab(policy, budget)" },
    Scene: PolicyMap,
  },
  {
    id: "base", label: "Baseline",
    kicker: "Eval suite · 96 held-out tasks · pass@1",
    title: <>Base checkpoint. <em>28 of 96.</em></>,
    metric: { value: <>29.2<small>%</small></>, label: "pass@1 · 1,040 tokens / task" },
    duration: 8600, beats: [700, 5600, 7000], zh: { label: "基线", kicker: "评估集 · 96 个留出任务 · pass@1", title: <>基础检查点：<em>96 题解出 28 题。</em></>, metricLabel: "pass@1 · 每题 1,040 token" },
    dev: { rows: [["solved", "28 / 96"], ["by family", "11 · 9 · 8 of 32"], ["tokens/task", "1,040"], ["GPU-s/task", "5.37"], ["budget", "1× · greedy"]], source: "simulateLab(0, 1)" },
    Scene: PolicyBase,
  },
  {
    id: "sft", label: "SFT · LoRA",
    kicker: "SFT · LoRA r = 16 · verified reasoning traces",
    title: <>0.82% of the weights train. <em>18 more tasks pass.</em></>,
    metric: { value: <>47.9<small>%</small></>, label: "pass@1 · +18 / −0" },
    duration: 10000, beats: [1400, 3600, 6600], zh: { label: "SFT · LoRA", kicker: "SFT · LoRA r = 16 · 已验证推理轨迹", title: <>只训练 0.82% 的权重，<em>多解出 18 题。</em></>, metricLabel: "pass@1 · +18 / −0" },
    dev: { rows: [["adapter", "r 16 · q k v o gate up down · 36 layers"], ["trainable", "33.0M / 4.02B"], ["flips", "+18 / −0"], ["tokens/task", "1,040 → 1,300"], ["GPU-s/task", "5.37 → 6.10"]], source: "simulateLab(1, 1) · data.ts LORA" },
    Scene: PolicySft,
  },
  {
    id: "grpo", label: "GRPO",
    kicker: "GRPO · G = 8 · verifiable rewards",
    title: <>Every rollout is scored <em>against its own group.</em></>,
    metric: { value: <>57.3<small>%</small></>, label: "pass@1 · +11 / −2" },
    duration: 13500, beats: [600, 3200, 4400, 5800, 7400, 9800], zh: { label: "GRPO", kicker: "GRPO · G = 8 · 可验证奖励", title: <>每次采样都与<em>同组样本比较打分。</em></>, metricLabel: "pass@1 · +11 / −2" },
    dev: { rows: [["group", "G = 8 · 8 prompts"], ["dropped", "2 groups · σ = 0"], ["Â", "(r − r̄) / σ · ε 0.2 · KL β"], ["flips", "+11 / −2"], ["tokens/task", "1,300 → 2,808"]], source: "simulateLab(2, 1) · grpo.tsx batch" },
    Scene: PolicyGrpo,
  },
  {
    id: "fleet", label: "Elastic RL",
    kicker: "Rollout ↔ train · 64 GPUs · long-tail rollouts",
    title: <>No GPU waits for the slowest rollout. <em>1.96× the RL steps.</em></>,
    metric: { value: <>4 → 7</>, label: "RL steps in 14 min" },
    duration: 10500, beats: [300, 9200], zh: { label: "弹性 RL", kicker: "采样 ↔ 训练 · 64 GPU · 长尾采样", title: <>没有 GPU 等待最慢的采样。<em>RL 步数提升 1.96 倍。</em></>, metricLabel: "14 分钟内 RL 步数" },
    dev: { rows: [["step", "3.51 → 1.79 min"], ["busy", "49% → 82%"], ["rollout", "p50 1.05 · p90 2.56 · max 3.33 min"], ["switch · sync", "0.04 · 0.08 min"], ["staleness", "≤ 1 step"]], source: "fleet-model.ts · after QwenGyre (arXiv 2609.33848)" },
    Scene: PolicyFleet,
  },
  {
    id: "think", label: "Test-time",
    kicker: "Test-time compute · θ frozen · verifier-selected",
    title: <>Same weights. Four times the search. <em>82 of 96.</em></>,
    metric: { value: <>85.4<small>%</small></>, label: "pass@1 at 4× · 26.04 GPU-s / task" },
    duration: 12400, beats: [1200, 3700, 6200, 8700, 11200], zh: { label: "测试时计算", kicker: "测试时计算 · θ 冻结 · 验证器选择", title: <>权重不变，搜索量 4 倍：<em>解出 82 题。</em></>, metricLabel: "4× 时 pass@1 · 每题 26.04 GPU 秒" },
    dev: { rows: [["1×", "55 · 10.32 GPU-s"], ["2×", "67 · 18.18"], ["4×", "82 · 26.04"], ["8×", "88 · 33.91"], ["selection", "best-of-N · verifier"]], source: "simulateLab(2, budget) · RL_BY_BUDGET" },
    Scene: PolicyThink,
  },
  {
    id: "lean", label: "Lean RL",
    kicker: "Length-aware RL · 4× allowance",
    title: <>Same 82 solved. <em>37% fewer tokens.</em></>,
    metric: { value: <>17.31</>, label: "GPU-s / task · was 26.04" },
    duration: 8000, beats: [2600, 3600, 6200], zh: { label: "精简 RL", kicker: "长度感知 RL · 4× 预算", title: <>同样解出 82 题，<em>token 减少 37%。</em></>, metricLabel: "GPU 秒 / 任务 · 原为 26.04" },
    dev: { rows: [["tokens/task", "8,423 → 5,304"], ["GPU-s/task", "26.04 → 17.31"], ["work multiplier", "2.7 → 1.7"], ["flips", "+3 / −3"]], source: "simulateLab(3, 4) vs simulateLab(2, 4)" },
    Scene: PolicyLean,
  },
  {
    id: "audit", label: "Audit",
    kicker: "Paired regression audit · 5 checkpoints × 96 tasks",
    title: <>59 gains, 5 regressions. <em>Every one named.</em></>,
    metric: { value: <>−5</>, label: "regressions · 96 tasks" },
    duration: 9000, beats: [600, 4200, 7000], zh: { label: "审计", kicker: "成对回归审计 · 5 个检查点 × 96 个任务", title: <>59 处提升，5 处退化，<em>逐一标注。</em></>, metricLabel: "退化 · 96 个任务" },
    dev: { rows: [["base→SFT", "+18 / −0"], ["SFT→GRPO", "+11 / −2"], ["GRPO→4×", "+27 / −0"], ["4×→lean", "+3 / −3"], ["regressed", "#76 #86 #8 #32 #39"]], source: "data.ts flips(a, b) · per task id" },
    Scene: PolicyAudit,
  },
  {
    id: "frontier", label: "Frontier",
    kicker: "Frontier · policy × runtime",
    title: <>Training moves it up. <em>Serving moves it left.</em></>,
    metric: { value: <>14.94</>, label: "GPU-s / correct · was 43.69" },
    duration: 11000, beats: [1200, 6900, 9200], zh: { label: "前沿", kicker: "前沿 · 策略 × 运行时", title: <>训练让它向上，<em>推理服务让它向左。</em></>, metricLabel: "GPU 秒 / 正确答案 · 原为 43.69" },
    dev: { rows: [["start", "base · 29.2% · 43.69"], ["policy", "lean 4× · 85.4% · 28.89"], ["+ runtime", "85.4% · 14.94"], ["workload", "shared-prefix"]], source: "simulateLab(p, b, optimized, \"shared-prefix\")" },
    Scene: PolicyFrontier,
  },
];

export function PolicyWing() {
  return <Wing id="post-training" number="05" name="Post-training" accent="rose" rooms={ROOMS} />;
}
