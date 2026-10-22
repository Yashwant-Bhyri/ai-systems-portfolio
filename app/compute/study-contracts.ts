/** Public experiment definitions, not run records or inferred measurements. */
export type EvidenceStatus = "implemented" | "profiled" | "measured" | "planned" | "illustrative";
export const STATUS_DEFINITIONS: Record<EvidenceStatus,string> = {
  implemented: "An inspectable implementation is linked.",
  profiled: "A workload-specific runtime trace is linked.",
  measured: "A controlled result and reproducible analysis are linked.",
  planned: "An experiment or checkpoint proposed for evaluation.",
  illustrative: "An explanatory model, not evidence of a benchmark result.",
};
export const INFERENCE_GATE = ["Checkpoint", "Prompt / template", "Candidate count", "Token budget", "Verifier", "Output quality", "Workload trace"];
export const INTEGRITY_GATE = ["No held-out feedback", "Independent verifier", "Reward-hacking audit", "Negative-flip analysis", "Confirmatory replication"];
export const FRONTIER_CONDITIONS = ["Base / Static", "Base / Optimized", "Post-trained / Static", "Post-trained / Optimized"];
export const CHECKPOINT_LADDER = ["Base", "SFT", "Correctness RLVR / GRPO", "Efficiency-aware RLVR"];
export const REQUIRED_RUN_FIELDS = [
  ["Model / checkpoint", "Exact revision and checkpoint hash not attached"],
  ["Runtime", "Version, flags, precision and scheduler config not attached"],
  ["Hardware", "GPU model/count and measurement boundary not attached"],
  ["Dataset / split", "Dataset version, held-out split and task IDs not attached"],
  ["Verifier / correctness oracle", "Selection verifier and independent final evaluator versions not attached"],
  ["Sample size / uncertainty", "Task counts, paired intervals and confirmatory repetitions not attached"],
  ["Prompt / template", "Template version and decoding parameters not attached"],
  ["Random seed", "Seed list and replication count not attached"],
  ["Budget", "Candidate/token caps and actual GPU-seconds not attached"],
  ["Workload trace", "Arrival times, concurrency, prefix distribution and cache/warm-up policy not attached"],
  ["Raw result artifact", "Per-task outputs, checks and cost records not attached"],
  ["Analysis script", "Versioned aggregation and uncertainty calculation not attached"],
  ["Known limitations", "No verified run bundle is available in this portfolio"],
] as const;
export const REPORTED_CLAIMS = [
  {area:"Mathematical reasoning",value:"+27%"},
  {area:"Multi-step logical reasoning",value:"+31%"},
  {area:"Repository understanding",value:"+46%"},
] as const;
