/**
 * Small, manually verified transcriptions of primary publications.
 * These are external reference measurements, never the portfolio author's runs.
 * Keep raw values unchanged; arithmetic belongs in study-math.ts.
 */
export const MIMO_SOURCE = {
  title: "Xiaomi MiMo technical report · Table 5",
  url: "https://arxiv.org/html/2505.07608v2#S3.T5",
  card: "https://huggingface.co/XiaomiMiMo/MiMo-7B-SFT#iii-evaluation-results",
  repo: "https://github.com/XiaomiMiMo/MiMo",
  revision: "arXiv:2505.07608v2 · 5 June 2025",
};
export const MIMO_CHECKPOINTS = [
  {
    name: "MiMo-7B-Base",
    short: "Base",
    note: "Pretrained checkpoint",
    parent: null,
  },
  {
    name: "MiMo-7B-SFT",
    short: "SFT",
    note: "Supervised from Base",
    parent: 0,
  },
  {
    name: "MiMo-7B-RL-Zero",
    short: "Direct RL",
    note: "RL from Base, not from SFT",
    parent: 0,
  },
  { name: "MiMo-7B-RL", short: "SFT → RL", note: "RL from SFT", parent: 1 },
] as const;
export const MIMO_BENCHMARKS = [
  {
    name: "AIME 2024",
    metric: "Pass@1",
    scores: [32.9, 58.7, 56.4, 68.2],
    repetitions: 32,
    split: "AIME 2024",
  },
  {
    name: "AIME 2025",
    metric: "Pass@1",
    scores: [24.3, 44.3, 46.3, 55.4],
    repetitions: 32,
    split: "AIME 2025",
  },
  {
    name: "LiveCodeBench v5",
    metric: "Pass@1",
    scores: [32.9, 52.3, 49.1, 57.8],
    repetitions: 8,
    split: "v5 · 2024-08-01 to 2025-02-01",
  },
] as const;

export type EvidenceField = readonly [string, string];
export const SGLANG_REFERENCE = {
  title: "SGLang v0.4 · cache-aware load balancer",
  url: "https://www.lmsys.org/blog/2024-12-04-sglang-v0-4/#cache-aware-load-balancer",
  throughput: [82665, 158596],
  cacheHit: [20, 75],
  gpuCount: 8,
  names: ["SGLang v0.3", "SGLang v0.4"],
} as const;
export const SGLANG_EVIDENCE: EvidenceField[] = [
  [
    "Evidence status",
    "Published by the SGLang team, 4 December 2024; not reproduced here",
  ],
  ["Model / hardware", "Meta-Llama-3.1-8B-Instruct; 8 × A100 80GB; dp-size=8"],
  [
    "Runtime",
    "SGLang v0.3 baseline vs v0.4 cache-aware router; not a single-feature ablation",
  ],
  [
    "Workload",
    "Generated shared-prefix workload with balanced long-prefix groups",
  ],
  [
    "Published throughput",
    "82,665 → 158,596 token/s; source does not clarify input/output/total-token counting",
  ],
  ["Cache hit rate", "20% → 75%"],
  [
    "Derived cost proxy",
    "For equal GPU count and equal counted-token work: relative GPU time = 82,665 / 158,596. Not cost per correct answer.",
  ],
  [
    "p95 / correctness / uncertainty",
    "Not supplied in the source table; no correctness-adjusted efficiency claim",
  ],
  [
    "Prompt / seeds / exact runtime hash",
    "Not supplied for the table; benchmark commands linked in source",
  ],
  [
    "Raw result artifact / analysis",
    "Published table and reproduction commands; arithmetic is an exact ratio, no rescaling of measured values",
  ],
  [
    "Known limitations",
    "Workload-specific; no interactive-workload generalization and no transfer of this speedup to MiMo or Qwen3",
  ],
];
export function mimoEvidence(
  checkpoint: number,
  benchmark: number,
): EvidenceField[] {
  const model = MIMO_CHECKPOINTS[checkpoint],
    bench = MIMO_BENCHMARKS[benchmark];
  return [
    [
      "Evidence status",
      "Published reference, reported by Xiaomi; not independently replicated here",
    ],
    [
      "Model / checkpoint",
      `${model.name}; exact evaluation checkpoint hash not supplied in Table 5`,
    ],
    [
      "Runtime / hardware",
      "Evaluation runtime version and GPU configuration not specified for these scores",
    ],
    ["Dataset / split", bench.split],
    [
      "Metric / repetitions",
      `${bench.metric}; ${bench.repetitions} repetitions averaged; exact task count not attached to the table`,
    ],
    [
      "Prompt / sampling",
      "Temperature 0.6; top-p 0.95; exact prompt/template revision not attached",
    ],
    [
      "Budget",
      "32,768 maximum output tokens; actual tokens and GPU-seconds not reported",
    ],
    [
      "Random seed / interval",
      "Seed list and confidence intervals not reported",
    ],
    [
      "Verifier / independence",
      "Source evaluation; independent replication and evaluator audit not established here",
    ],
    [
      "Raw result artifact",
      "Aggregate Table 5; no per-task output bundle attached to this transcription",
    ],
    [
      "Analysis script",
      "Displayed delta = selected score minus Base score; no re-estimation of source metrics",
    ],
    [
      "Known limitations",
      "Not Qwen3-4B; not matched actual compute; includes proprietary training data; no GPU-cost frontier inferred",
    ],
  ];
}
