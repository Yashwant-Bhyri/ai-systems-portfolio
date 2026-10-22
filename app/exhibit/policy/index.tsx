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
    kicker: "Post-training · system map",
    title: <>From 28 to 82 of 96 solved. <em>Then a third cheaper per task.</em></>,
    metric: { value: <>85.4<small>%</small></>, label: "pass@1 · 96 tasks" },
    duration: 13000, beats: [0, 2600, 5200, 7800, 10400], Scene: PolicyMap,
  },
  {
    id: "base", label: "Baseline",
    kicker: "Eval suite · 96 held-out tasks · pass@1",
    title: <>Base checkpoint. <em>28 of 96.</em></>,
    metric: { value: <>29.2<small>%</small></>, label: "pass@1 · 1,040 tokens / task" },
    duration: 8600, beats: [700, 5600, 7000], Scene: PolicyBase,
  },
  {
    id: "sft", label: "SFT · LoRA",
    kicker: "SFT · LoRA r = 16 · verified reasoning traces",
    title: <>0.82% of the weights train. <em>18 more tasks pass.</em></>,
    metric: { value: <>47.9<small>%</small></>, label: "pass@1 · +18 / −0" },
    duration: 10000, beats: [1400, 3600, 6600], Scene: PolicySft,
  },
  {
    id: "grpo", label: "GRPO",
    kicker: "GRPO · G = 8 · verifiable rewards",
    title: <>Every rollout is scored <em>against its own group.</em></>,
    metric: { value: <>57.3<small>%</small></>, label: "pass@1 · +11 / −2" },
    duration: 13500, beats: [600, 3200, 4400, 5800, 7400, 9800], Scene: PolicyGrpo,
  },
  {
    id: "fleet", label: "Elastic RL",
    kicker: "Rollout ↔ train · 64 GPUs · long-tail rollouts",
    title: <>No GPU waits for the slowest rollout. <em>1.96× the RL steps.</em></>,
    metric: { value: <>4 → 7</>, label: "RL steps in 14 min" },
    duration: 10500, beats: [300, 9200], Scene: PolicyFleet,
  },
  {
    id: "think", label: "Test-time",
    kicker: "Test-time compute · θ frozen · verifier-selected",
    title: <>Same weights. Four times the search. <em>82 of 96.</em></>,
    metric: { value: <>85.4<small>%</small></>, label: "pass@1 at 4× · 26.04 GPU-s / task" },
    duration: 12400, beats: [1200, 3700, 6200, 8700, 11200], Scene: PolicyThink,
  },
  {
    id: "lean", label: "Lean RL",
    kicker: "Length-aware RL · 4× allowance",
    title: <>Same 82 solved. <em>37% fewer tokens.</em></>,
    metric: { value: <>17.31</>, label: "GPU-s / task · was 26.04" },
    duration: 8000, beats: [2600, 3600, 6200], Scene: PolicyLean,
  },
  {
    id: "audit", label: "Audit",
    kicker: "Paired regression audit · 5 checkpoints × 96 tasks",
    title: <>59 gains, 5 regressions. <em>Every one named.</em></>,
    metric: { value: <>−5</>, label: "regressions · 96 tasks" },
    duration: 9000, beats: [600, 4200, 7000], Scene: PolicyAudit,
  },
  {
    id: "frontier", label: "Frontier",
    kicker: "Frontier · policy × runtime",
    title: <>Training moves it up. <em>Serving moves it left.</em></>,
    metric: { value: <>14.94</>, label: "GPU-s / correct · was 43.69" },
    duration: 11000, beats: [1200, 6900, 9200], Scene: PolicyFrontier,
  },
];

export function PolicyWing() {
  return <Wing id="post-training" number="05" name="Post-training" accent="rose" rooms={ROOMS} />;
}
