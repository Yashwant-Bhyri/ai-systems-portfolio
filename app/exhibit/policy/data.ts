import { FAMILIES, simulateLab } from "../../compute/lab-simulation";

/** Every number in the Policy wing comes from the shared 96-task model, computed once. */
export type Checkpoint = {
  key: string;
  name: string;
  short: string;
  policy: number;
  budget: number;
  correct: number;
  pass1: number;
  costPerTask: number;
  costPerCorrect: number;
  tokensPerTask: number;
  solved: boolean[];
  tokens: number[];
};

function checkpoint(key: string, name: string, short: string, policy: number, budget: number): Checkpoint {
  const r = simulateLab(policy, budget);
  return {
    key, name, short, policy, budget,
    correct: r.correct,
    pass1: r.accuracy,
    costPerTask: r.meanCost,
    costPerCorrect: r.correctCost ?? 0,
    tokensPerTask: r.tokens / r.n,
    solved: r.tasks.map((t) => t.correct),
    tokens: r.tasks.map((t) => t.tokens),
  };
}

export const CK = {
  base: checkpoint("base", "Base checkpoint", "base", 0, 1),
  sft: checkpoint("sft", "SFT · LoRA", "SFT", 1, 1),
  rl: checkpoint("rl", "GRPO", "GRPO", 2, 1),
  rl4: checkpoint("rl4", "GRPO · 4× thinking", "4× think", 2, 4),
  eff4: checkpoint("eff4", "Lean RL · 4×", "lean 4×", 3, 4),
} as const;
export const PATH = [CK.base, CK.sft, CK.rl, CK.rl4, CK.eff4] as const;

export const BUDGETS = [1, 2, 4, 8] as const;
export const CURVES = [0, 1, 2, 3].map((policy) =>
  BUDGETS.map((budget) => {
    const r = simulateLab(policy, budget);
    return { budget, pass1: r.accuracy, costPerTask: r.meanCost, correct: r.correct };
  }),
);

/** Accuracy against GPU-seconds per correct answer, on the shared-document serving workload. */
export const FRONTIER = PATH.map((c) => {
  const slow = simulateLab(c.policy, c.budget, false, "shared-prefix");
  const fast = simulateLab(c.policy, c.budget, true, "shared-prefix");
  return { key: c.key, name: c.short, pass1: c.pass1, slow: slow.correctCost ?? 0, fast: fast.correctCost ?? 0 };
});
export const CONSTELLATION = [0, 1, 2, 3].flatMap((policy) =>
  BUDGETS.map((budget) => {
    const slow = simulateLab(policy, budget, false, "shared-prefix");
    const fast = simulateLab(policy, budget, true, "shared-prefix");
    return { policy, budget, pass1: slow.accuracy, slow: slow.correctCost ?? 0, fast: fast.correctCost ?? 0 };
  }),
);

export const FAMILY_NAMES = FAMILIES;
export const familyOf = (task: number) => Math.floor(task / 32);

export function flips(a: Checkpoint, b: Checkpoint) {
  const gained: number[] = [], lost: number[] = [];
  a.solved.forEach((s, i) => {
    if (!s && b.solved[i]) gained.push(i);
    if (s && !b.solved[i]) lost.push(i);
  });
  return { gained, lost };
}

/** Qwen3-4B adapter arithmetic: LoRA r = 16 on q, k, v, o, gate, up, down across 36 layers. */
export const LORA = (() => {
  const r = 16, hidden = 2560, q = 4096, kv = 1024, mlp = 9728, layers = 36;
  const perLayer = r * ((hidden + q) * 2 + (hidden + kv) * 2 + (hidden + mlp) * 3);
  const trainable = perLayer * layers;
  const total = 4.02e9;
  return { r, trainable, total, share: trainable / total };
})();

export const pct = (x: number, d = 1) => `${x.toFixed(d)}%`;

/** The GRPO checkpoint's solved set at each test-time allowance (θ fixed). */
export const RL_BY_BUDGET = BUDGETS.map((budget) => {
  const r = simulateLab(2, budget);
  return { budget, solved: r.tasks.map((t) => t.correct), pass1: r.accuracy, costPerTask: r.meanCost, tokensPerTask: r.tokens / r.n, correct: r.correct };
});
