/** Arithmetic fixtures for the overview microscope. Not device timings. */
export const FUSION_INPUT = [-1.25, -0.5, 0.5, 1.25] as const;
export const FUSION_BIAS = 0.25;
export const WEIGHT_FIXTURE = [
  -1.1, -0.34, 0.27, 1.8, 0.72, -0.91, 0.18, -0.45, 1.27, 0.09, -1.62, 0.58,
  -0.23, 1.06, -0.77, 0.39,
] as const;
export const DOT_INPUT = [1, -0.5, 0.75, 0.25] as const;
export type HardwareTopology = "replicas" | "tensor" | "pipeline" | "moe";
export const unit = (x: number) => Math.max(0, Math.min(1, x));

export function fusionFixture() {
  const intermediate = FUSION_INPUT.map((x) => x + FUSION_BIAS);
  const output = intermediate.map((x) => Math.max(0, x));
  const bytes = FUSION_INPUT.length * 4;
  return {
    input: [...FUSION_INPUT],
    intermediate,
    output,
    baseline: { launches: 2, reads: bytes * 2, writes: bytes * 2 },
    fused: { launches: 1, reads: bytes, writes: bytes },
    avoidedBytes: bytes * 2,
  };
}

/** Symmetric signed range with ties to even; the scale is stored as FP32. */
export function roundEven(x: number) {
  const floor = Math.floor(x),
    remainder = x - floor;
  if (remainder < 0.5) return floor;
  if (remainder > 0.5) return floor + 1;
  return floor % 2 === 0 ? floor : floor + 1;
}
export function quantizationFixture(bits: 4 | 8) {
  if (bits !== 4 && bits !== 8)
    throw new RangeError("Use four or eight signed bits");
  const limit = 2 ** (bits - 1) - 1;
  const scale = Math.fround(Math.max(...WEIGHT_FIXTURE.map(Math.abs)) / limit);
  const quantized = WEIGHT_FIXTURE.map((w) =>
    Math.max(-limit, Math.min(limit, roundEven(w / scale))),
  );
  const reconstructed = quantized.map((q) => q * scale);
  const error = reconstructed.map((w, i) => w - WEIGHT_FIXTURE[i]);
  const dot = WEIGHT_FIXTURE.slice(0, 4).reduce(
    (sum, w, i) => sum + w * DOT_INPUT[i],
    0,
  );
  const reconstructedDot = reconstructed
    .slice(0, 4)
    .reduce((sum, w, i) => sum + w * DOT_INPUT[i], 0);
  return {
    bits,
    limit,
    scale,
    weights: [...WEIGHT_FIXTURE],
    quantized,
    reconstructed,
    error,
    sourceBytes: WEIGHT_FIXTURE.length * 4,
    payloadBytes: (WEIGHT_FIXTURE.length * bits) / 8,
    scaleBytes: 4,
    totalBytes: (WEIGHT_FIXTURE.length * bits) / 8 + 4,
    maxError: Math.max(...error.map(Math.abs)),
    dot,
    reconstructedDot,
  };
}

export function tensorFixture() {
  // Partition one row's input dimension; an all-reduce sums partial outputs.
  const weights = [1, 2, -1, 0.5];
  const input = [2, 1, 3, 4];
  const products = weights.map((w, i) => w * input[i]);
  const partials = [products[0] + products[1], products[2] + products[3]];
  return {
    weights,
    input,
    products,
    partials,
    output: partials[0] + partials[1],
  };
}

export function pipelineFixture() {
  const stages = 3,
    requests = 3,
    slots = stages + requests - 1;
  const cells = Array.from({ length: stages }, (_, stage) =>
    Array.from({ length: slots }, (_, slot) => {
      const request = slot - stage;
      return request >= 0 && request < requests ? request + 1 : null;
    }),
  );
  return {
    stages,
    requests,
    slots,
    cells,
    busy: stages * requests,
    bubbles: stages * slots - stages * requests,
  };
}

export function hardwareFrame(
  storyMs: number,
  override: HardwareTopology | null = null,
) {
  if (!Number.isFinite(storyMs))
    throw new RangeError("Presentation time must be finite");
  const time = Math.max(0, storyMs);
  const topology =
    override ??
    (time < 62000 ? "replicas" : time < 69000 ? "tensor" : "pipeline");
  const start =
    topology === "replicas" ? 56000 : topology === "tensor" ? 62000 : 69000;
  return {
    fusion: unit((time - 30000) / 13000),
    precision: unit((time - 43000) / 13000),
    topology,
    placement: override
      ? 1
      : unit(
          (time - start) /
            (topology === "replicas"
              ? 3800
              : topology === "tensor"
                ? 4500
                : 6000),
        ),
    lifecycle: unit((time - 78000) / 10000),
  };
}
