/**
 * Synthetic lab v1. No model is run and no physical GPU timing is measured.
 * All values are generated from these explicit assumptions, not perturbed paper results.
 * Literature informs the mechanisms, never the numerical outputs of this simulator.
 */
export const LAB_VERSION = "synthetic-lab-v1";
export const BUDGETS = [1, 2, 4, 8] as const;
export const POLICIES = [
  {
    id: "base",
    name: "Base",
    skill: 0.34,
    growth: 0.105,
    work: 1,
    color: "#a9b6c7",
  },
  {
    id: "sft",
    name: "SFT",
    skill: 0.48,
    growth: 0.12,
    work: 1.25,
    color: "#78a8ff",
  },
  {
    id: "rl",
    name: "Correctness RL",
    skill: 0.61,
    growth: 0.125,
    work: 2.7,
    color: "#f3a0bc",
  },
  {
    id: "efficient",
    name: "Efficiency-aware RL",
    skill: 0.59,
    growth: 0.128,
    work: 1.7,
    color: "#b8e986",
  },
] as const;
export const FAMILIES = [
  "Mathematics",
  "Multi-step logic",
  "Repository tasks",
] as const;
export type Workload = "interactive" | "shared-prefix";
export type RuntimeMechanisms = {
  reuse: boolean;
  fastKernels: boolean;
  scheduler: "continuous" | "barrier";
};
export function hashTask(index: number) {
  let v = (index + 71) * 2654435761;
  v = Math.imul(v ^ (v >>> 16), 2246822507);
  return (v ^ (v >>> 13)) >>> 0;
}
export const TASKS = Array.from({ length: 96 }, (_, id) => ({
  id,
  family: Math.floor(id / 32),
  difficulty: (hashTask(id) % 1000) / 1000,
  baseTokens: 600 + (hashTask(id + 211) % 850),
  prefixGroup: id % 6,
}));
export type LabTask = {
  id: number;
  family: number;
  correct: boolean;
  tokens: number;
  prefill: number;
  decode: number;
  gpuSeconds: number;
  latency: number;
  arrival: number;
  start: number;
  finish: number;
  cacheHit: boolean;
  inputTokens: number;
  computedInputTokens: number;
  worker: number;
  queueSeconds: number;
};
export function simulateLab(
  policyIndex: number,
  budget: number,
  optimized = false,
  workload: Workload = "interactive",
  overrides: Partial<RuntimeMechanisms> = {},
) {
  if (!POLICIES[policyIndex] || !BUDGETS.includes(budget as 1 | 2 | 4 | 8))
    throw new RangeError("Unknown scenario policy or budget");
  const mechanisms: RuntimeMechanisms = {
    reuse: optimized,
    fastKernels: optimized,
    scheduler: "continuous",
    ...overrides,
  };
  let barrier = 0;
  const policy = POLICIES[policyIndex],
    thought = Math.log2(budget),
    available = [0, 0],
    cache = new Map<number, number>();
  const tasks: LabTask[] = TASKS.map((task) => {
    const ability = Math.min(
      0.94,
      policy.skill + policy.growth * thought - task.family * 0.025,
    );
    // Explicit rare regressions keep the illustration from asserting universal improvement.
    const regression =
      policyIndex > 0 && hashTask(task.id + policyIndex * 37) % 47 === 0;
    const correct = task.difficulty < ability && !regression;
    const tokens = Math.round(task.baseTokens * policy.work * (1 + thought));
    const arrival = task.id * (workload === "interactive" ? 22 : 2);
    // A pedagogical two-job batch barrier, not a model of a production engine.
    if (mechanisms.scheduler === "barrier" && task.id % 2 === 0)
      barrier = Math.max(
        ...available,
        (task.id + 1) * (workload === "interactive" ? 22 : 2),
      );
    const worker =
      mechanisms.scheduler === "barrier"
        ? task.id % 2
        : available[0] <= available[1]
          ? 0
          : 1;
    const start =
      mechanisms.scheduler === "barrier"
        ? barrier
        : Math.max(arrival, available[worker]);
    const cacheHit =
      mechanisms.reuse &&
      workload === "shared-prefix" &&
      (cache.get(task.prefixGroup) ?? Infinity) <= start;
    const inputTokens = workload === "shared-prefix" ? 8192 : 2048;
    const computedInputTokens = cacheHit ? 384 : inputTokens;
    const prefill =
      computedInputTokens * (mechanisms.fastKernels ? 0.00095 : 0.0012);
    if (mechanisms.reuse && workload === "shared-prefix") {
      cache.set(
        task.prefixGroup,
        Math.min(cache.get(task.prefixGroup) ?? Infinity, start + prefill),
      );
    }
    const decode = tokens * (mechanisms.fastKernels ? 0.00225 : 0.0028);
    const gpuSeconds = prefill + decode;
    const finish = start + gpuSeconds;
    available[worker] = finish;
    return {
      id: task.id,
      family: task.family,
      correct,
      tokens,
      prefill,
      decode,
      gpuSeconds,
      latency: finish - arrival,
      arrival,
      start,
      finish,
      cacheHit,
      inputTokens,
      computedInputTokens,
      worker,
      queueSeconds: start - arrival,
    };
  });
  const correct = tasks.filter((t) => t.correct).length,
    gpuSeconds = tasks.reduce((s, t) => s + t.gpuSeconds, 0),
    latencies = tasks.map((t) => t.latency).sort((a, b) => a - b);
  return {
    version: LAB_VERSION,
    status: "illustrative" as const,
    policy: policy.id,
    policyIndex,
    budget,
    optimized,
    mechanisms,
    workload,
    n: tasks.length,
    correct,
    accuracy: (correct / tasks.length) * 100,
    gpuSeconds,
    meanCost: gpuSeconds / tasks.length,
    correctCost: correct ? gpuSeconds / correct : null,
    p95: latencies[Math.ceil(0.95 * tasks.length) - 1],
    tokens: tasks.reduce((s, t) => s + t.tokens, 0),
    tasks,
  };
}
export type LabRun = ReturnType<typeof simulateLab>;
export function labComposition(workload: Workload = "interactive", budget = 2) {
  return [0, 2].flatMap((policy) =>
    [false, true].map((optimized) => {
      const run = simulateLab(policy, budget, optimized, workload);
      return {
        ...run,
        id: `${policy ? "trained" : "base"}-${optimized ? "optimized" : "static"}`,
        label: `${policy ? "Post-trained" : "Base"} / ${optimized ? "Optimized" : "Static"}`,
        trained: policy !== 0,
        taskCost: run.meanCost,
        correctCost: run.correctCost!,
      };
    }),
  );
}
export function compareTasks(before: LabRun, after: LabRun) {
  const gained = after.tasks
    .filter((t, i) => t.correct && !before.tasks[i].correct)
    .map((t) => t.id);
  const lost = after.tasks
    .filter((t, i) => !t.correct && before.tasks[i].correct)
    .map((t) => t.id);
  return { gained, lost };
}
export const LAB_ASSUMPTIONS = [
  [
    "Cost boundary",
    "Sum of synthetic prefill and decode busy-work across tasks. Excludes idle allocation and verifier work. A real allocated-GPU cost experiment needs separate device instrumentation and full-run accounting.",
  ],
  [
    "Status",
    "Synthetic lab scenario. Not model inference, not GPU measurements, not a reported project achievement.",
  ],
  [
    "Cohort",
    "96 deterministic synthetic tasks, 32 per family. Difficulty comes from a fixed integer hash, not a held-out dataset.",
  ],
  [
    "Quality model",
    "Correct if task difficulty < policy skill + growth × log2(budget) minus a domain offset. An explicit rare-regression rule allows negative flips.",
  ],
  [
    "Work model",
    "Output tokens = rounded base task length × policy work multiplier × (1 + log2(budget)). Allowance labels are relative to each policy's 1× work; 1×/2×/4×/8× caps use 1/2/3/4 times its output work. They are not actual cost multipliers. No text is generated.",
  ],
  [
    "GPU timing assumptions",
    "Static: 1.2 ms/input token and 2.8 ms/output token. Optimized: 0.95 ms/input token and 2.25 ms/output token. These are declared simulation constants, not calibrated hardware measurements.",
  ],
  [
    "Workload / cache",
    "Interactive: 2,048 input tokens, 22-second arrivals. Shared-prefix: 8,192 tokens in six prefix groups, 2-second arrivals. A hit leaves 384 input tokens; first-use warm-up is charged.",
  ],
  [
    "Scheduler / latency",
    "Two abstract serial GPU workers. Default: first available worker, FIFO arrivals. The guided story also declares a paired-batch barrier: each pair waits for both arrivals and the preceding pair to finish. The exact scheduler is exported in mechanisms. p95 is nearest-rank end-to-end latency, including queueing. This is not a vLLM performance model.",
  ],
  [
    "Quality gate",
    "Runtime pairs share checkpoint, budget, task trace, logical input, output-token counts and correct/incorrect outcomes. Optimization changes timing and the amount of input work recomputed after prefix reuse.",
  ],
  [
    "Missing real evidence",
    "No physical GPU, runtime version, real checkpoint hash, evaluation dataset, verifier, independent audit or confidence interval exists for this scenario.",
  ],
] as const;
