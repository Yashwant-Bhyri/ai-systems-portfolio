import { simulateLab, type Workload } from "./lab-simulation";

export const INFERENCE_STORY = [
  {
    name: "Baseline serving",
    verb: "WAIT",
    title: "An answer can be correct. And expensive.",
    detail:
      "Follow the same 96 requests. Repeated context consumes work; fixed pairs leave workers waiting.",
    mechanism: "Static paired batches",
    inspect:
      "Two requests launch together. The next pair waits for both workers and both arrivals. Empty lane space is idle time—not extra token computation.",
  },
  {
    name: "Worker scheduling",
    verb: "SCHEDULE",
    title: "A finished worker should not wait for its neighbour.",
    detail:
      "Keep every request intact. Give the next one to the first available worker.",
    mechanism: "Independent worker scheduling",
    inspect:
      "The service bars keep their lengths. Only their starting positions change. This toy scheduler can reduce queueing without changing busy GPU-seconds.",
  },
  {
    name: "KV prefix reuse",
    verb: "REUSE",
    title: "Read shared context once. Reference it again.",
    detail:
      "A warm prefix becomes shared state. Only the new suffix needs another prefill.",
    mechanism: "Ready-prefix reuse",
    inspect:
      "The first prefix is computed and charged. A later request can reuse it only after it is ready. Paged KV allocation enables flexible memory sharing; allocation alone does not remove compute.",
  },
  {
    name: "Prefill & decode execution",
    verb: "EXECUTE",
    title: "The same tokens. Less work per token.",
    detail:
      "Keep the model, output length and answers fixed. Change the declared token execution cost.",
    mechanism: "Faster token execution",
    inspect:
      "This intervention changes only the assumed prefill and decode rates. The illustration is not a measured CUDA or TensorRT speedup.",
  },
  {
    name: "Combined runtime gains",
    verb: "COMPOSE",
    title: "Keep the cognition. Change the cost of delivery.",
    detail:
      "Scheduling shortens waiting; reuse removes repeated work; execution efficiency lowers the cost of the work that remains.",
    mechanism: "The controlled comparison",
    inspect:
      "All stages share task identity, policy, allowance, logical inputs, output-token counts and correctness. Cost includes synthetic busy-work, not idle device allocation or verifier execution.",
  },
] as const;
export const TRAINING_STORY = [
  {
    name: "The starting point",
    verb: "BASE",
    title: "A useful answer needs a useful reasoning path.",
    detail:
      "One cohort, one starting policy. The outcome map is the reference we will carry forward.",
    mechanism: "Base policy",
    inspect:
      "Each square retains the same task identity throughout the story. Outlined squares are incorrect; filled squares are correct. The branching sketch explains a mechanism, not an observed model trace.",
  },
  {
    name: "SFT + LoRA",
    verb: "SFT",
    title: "Good demonstrations make good paths easier to find.",
    detail:
      "Supervised reasoning examples teach a pattern: decompose, solve, check. The policy changes; the allowance stays at 1×.",
    mechanism: "Supervised fine-tuning",
    inspect:
      "SFT imitates curated demonstrations. LoRA can make that weight update parameter-efficient; it does not itself guarantee a quality gain. The plotted gain comes from the declared synthetic policy.",
  },
  {
    name: "Learn from outcomes",
    verb: "GRPO",
    title: "Compare attempts. Reinforce the ones that work.",
    detail:
      "A verifier scores a group of trajectories. Relative rewards shift the policy toward useful attempts.",
    mechanism: "Relative policy optimization",
    inspect:
      "GRPO-style training compares group-relative rewards. A verifier supplies a correctness signal, not ground truth by magic. Independent checks and reward-hacking audits are still required.",
  },
  {
    name: "Give it more thought",
    verb: "SEARCH",
    title: "Keep the weights. Spend more time exploring.",
    detail:
      "At inference time, a larger allowance can recover problems the same policy missed. Watch the cost move too.",
    mechanism: "Inference-time search",
    inspect:
      "This step makes no weight update. More candidates or longer reasoning can improve coverage, but selection needs a reliable verifier. The toy outcome law is monotone in budget by construction, not evidence of a real scaling law.",
  },
  {
    name: "Make thought count",
    verb: "REFINE",
    title: "Better reasoning is not simply longer reasoning.",
    detail:
      "Compare an efficiency-aware policy at the same allowance. Inspect what it keeps, what it gains and what it loses.",
    mechanism: "Efficiency-aware policy",
    inspect:
      "Equal nominal allowances are not equal GPU costs. The efficiency policy uses a lower declared work multiplier. Inspect actual cost and paired negative flips rather than treating token length as intelligence.",
  },
] as const;
export function inferenceStoryRuns(workload: Workload) {
  return [
    { scheduler: "barrier" as const, reuse: false, fastKernels: false },
    { scheduler: "continuous" as const, reuse: false, fastKernels: false },
    { scheduler: "continuous" as const, reuse: true, fastKernels: false },
    { scheduler: "continuous" as const, reuse: true, fastKernels: true },
    { scheduler: "continuous" as const, reuse: true, fastKernels: true },
  ].map((mechanisms) =>
    simulateLab(2, 2, mechanisms.fastKernels, workload, mechanisms),
  );
}
export function trainingStoryRuns(budget: number) {
  return [
    simulateLab(0, 1),
    simulateLab(1, 1),
    simulateLab(2, 1),
    simulateLab(2, budget),
    simulateLab(3, budget),
  ];
}
