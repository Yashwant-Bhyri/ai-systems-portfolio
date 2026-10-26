/**
 * Calibration: where every timing in the laboratory comes from.
 *
 * Three kinds of number, kept apart on purpose:
 *  - published: read from a vendor datasheet or the model's own config file;
 *  - derived: computed from published numbers with a stated roofline formula and a
 *    stated efficiency factor (the approach of GPU-free serving simulators such as
 *    Microsoft Vidur and LLMServingSim);
 *  - needs a real run: anything about what the model writes or gets right. Those
 *    stay synthetic in this lab and are labelled so.
 */

export type Provenance = "published" | "derived" | "assumed" | "needs a real run";
export type Constant = { value: number; unit: string; kind: Provenance; source: string };

/** Qwen3-4B, from its Hugging Face config.json. */
export const MODEL = {
  name: "Qwen3-4B",
  params: { value: 4.02e9, unit: "parameters", kind: "published", source: "Qwen3 technical report / model card: 4.0 B parameters (3.6 B non-embedding)" },
  layers: { value: 36, unit: "layers", kind: "published", source: "config.json num_hidden_layers" },
  hidden: { value: 2560, unit: "", kind: "published", source: "config.json hidden_size" },
  qHeads: { value: 32, unit: "heads", kind: "published", source: "config.json num_attention_heads" },
  kvHeads: { value: 8, unit: "heads", kind: "published", source: "config.json num_key_value_heads (grouped-query attention)" },
  headDim: { value: 128, unit: "", kind: "published", source: "config.json head_dim" },
} as const satisfies Record<string, Constant | string>;

/** NVIDIA H100 SXM5 80 GB, dense (no sparsity) figures from the datasheet. */
export const GPU = {
  name: "NVIDIA H100 SXM5 80 GB",
  bf16: { value: 989.4e12, unit: "FLOP/s", kind: "published", source: "H100 datasheet: BF16 Tensor Core, dense" },
  fp8: { value: 1978.9e12, unit: "FLOP/s", kind: "published", source: "H100 datasheet: FP8 Tensor Core, dense" },
  hbm: { value: 3.35e12, unit: "B/s", kind: "published", source: "H100 datasheet: HBM3 bandwidth" },
  memory: { value: 80e9, unit: "B", kind: "published", source: "H100 datasheet: 80 GB HBM3" },
} as const satisfies Record<string, Constant | string>;

/** How much of the peak a well-tuned engine achieves; stated, not measured. */
export const EFFICIENCY = {
  prefillMfu: { value: 0.5, unit: "of peak FLOP/s", kind: "assumed", source: "typical model-FLOPs utilisation for long-prompt prefill in vLLM / SGLang" },
  prefillMfuFast: { value: 0.55, unit: "of peak FLOP/s", kind: "assumed", source: "FP8 GEMMs and FlashAttention-3 kernels" },
  bandwidth: { value: 0.8, unit: "of peak HBM bandwidth", kind: "assumed", source: "achieved bandwidth of a memory-bound decode step" },
  stepOverhead: { value: 0.0015, unit: "s per iteration", kind: "assumed", source: "scheduler, sampling and launch overhead per engine iteration with CUDA graphs" },
  activationReserve: { value: 6e9, unit: "B", kind: "assumed", source: "memory held back for activations and the CUDA context" },
  maxBatch: { value: 64, unit: "sequences", kind: "assumed", source: "engine cap on concurrently decoding sequences" },
} as const satisfies Record<string, Constant>;

const m = (c: Constant) => c.value;
/** Weights read once per decode step. */
export const weightBytes = (fp8: boolean) => m(MODEL.params) * (fp8 ? 1 : 2);
/** K and V for one token across all layers: 2 × layers × KV heads × head_dim × bytes. */
export const kvBytesPerToken = (fp8: boolean) => 2 * m(MODEL.layers) * m(MODEL.kvHeads) * m(MODEL.headDim) * (fp8 ? 1 : 2);
/** Attention width of the query projection (32 heads × 128). */
const dq = m(MODEL.qHeads) * m(MODEL.headDim);

/** Seconds to prefill `n` new tokens that follow `start` tokens already in the cache. */
export function prefillSeconds(n: number, start: number, fast: boolean) {
  if (n <= 0) return 0;
  const linear = 2 * m(MODEL.params) * n;
  const attention = 4 * m(MODEL.layers) * dq * (n * start + (n * n) / 2); // causal QKᵀ and PV
  const rate = (fast ? m(GPU.fp8) * m(EFFICIENCY.prefillMfuFast) : m(GPU.bf16) * m(EFFICIENCY.prefillMfu));
  return (linear + attention) / rate;
}
/** Bytes one decode step moves: the weights once, plus every running sequence's KV cache. */
export const decodeBytes = (kvTokens: number, fast: boolean) => weightBytes(fast) + kvTokens * kvBytesPerToken(fast);
export const bandwidth = () => m(GPU.hbm) * m(EFFICIENCY.bandwidth);
/** Seconds for one decode step over `batch` sequences holding `kvTokens` in total (memory-bound). */
export function decodeStepSeconds(batch: number, kvTokens: number, fast: boolean) {
  if (batch <= 0) return 0;
  const memory = decodeBytes(kvTokens, fast) / bandwidth();
  const compute = (2 * m(MODEL.params) * batch + 4 * m(MODEL.layers) * dq * kvTokens) / ((fast ? m(GPU.fp8) : m(GPU.bf16)) * m(EFFICIENCY.prefillMfu));
  return Math.max(memory, compute);
}
/** KV tokens one replica can hold beside its weights. */
export const kvCapacityTokens = (fast: boolean) => Math.floor((m(GPU.memory) - weightBytes(fast) - m(EFFICIENCY.activationReserve)) / kvBytesPerToken(fast));
export const STEP_OVERHEAD = m(EFFICIENCY.stepOverhead);
export const MAX_BATCH = m(EFFICIENCY.maxBatch);

/** Per-token costs for copy: input tokens over an 8,192-token prompt, output tokens at a 10k-token context, batch 1. */
export function rateCard(fast: boolean) {
  return {
    inputMs: (prefillSeconds(8192, 0, fast) / 8192) * 1000,
    outputMs: (STEP_OVERHEAD + decodeBytes(10_000, fast) / bandwidth()) * 1000,
  };
}
export const fmtMs = (v: number) => (v < 0.1 ? v.toFixed(3) : v < 1 ? v.toFixed(2) : v.toFixed(1));
