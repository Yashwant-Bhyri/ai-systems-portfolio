/** Exact small teaching examples, independent of the synthetic result cohort. */
export const TOY_X = [1, 0.6, -0.4, 0.8, -0.3, 0.5];
export const TOY_TARGET = [0.8, -0.5, 0.7, 0.2, -0.6, 0.4];
export const TOY_W = Array.from({ length: 6 }, (_, r) =>
  Array.from({ length: 6 }, (_, c) => Math.sin((r + 1) * (c + 2)) * 0.15),
);
const dot = (a: number[], b: number[]) =>
  a.reduce((s, v, i) => s + v * b[i], 0);
const mv = (a: number[][], x: number[]) => a.map((row) => dot(row, x));
export function adapterForward(a: number[][], b: number[][]) {
  const z = mv(a, TOY_X),
    base = mv(TOY_W, TOY_X);
  const output = mv(b, z).map((v, i) => v + base[i]);
  const error = output.map((v, i) => v - TOY_TARGET[i]);
  return {
    z,
    output,
    error,
    loss: dot(error, error) / 2,
    delta: b.map((row) =>
      TOY_X.map((_, c) => row.reduce((s, v, k) => s + v * a[k][c], 0)),
    ),
  };
}
export function adapterSnapshots() {
  let a = Array.from({ length: 2 }, (_, r) =>
    Array.from({ length: 6 }, (_, c) => Math.cos((r + 1) * (c + 1)) * 0.25),
  );
  let b = Array.from({ length: 6 }, () => [0, 0]);
  const frames = [];
  for (let step = 0; step <= 4; step++) {
    const f = adapterForward(a, b);
    const gradB = f.error.map((e) => f.z.map((z) => e * z));
    const gradA = a.map((_, k) =>
      TOY_X.map(
        (x) =>
          dot(
            b.map((row) => row[k]),
            f.error,
          ) * x,
      ),
    );
    frames.push({ step, a, b, ...f, gradA, gradB });
    a = a.map((row, r) => row.map((v, c) => v - 0.35 * gradA[r][c]));
    b = b.map((row, r) => row.map((v, c) => v - 0.35 * gradB[r][c]));
  }
  return frames;
}
export function relativePolicy(progress: number, efficiency = false) {
  const correct = [0, 1, 0, 1],
    cost = [0.5, 1, 0.8, 0.4];
  const reward = correct.map((r, i) => r - (efficiency ? 0.25 * cost[i] : 0));
  const mean = reward.reduce((s, v) => s + v, 0) / 4;
  const sd = Math.sqrt(reward.reduce((s, v) => s + (v - mean) ** 2, 0) / 4);
  const advantage = reward.map((r) => (sd ? (r - mean) / sd : 0));
  const weights = advantage.map((a) =>
    Math.exp(0.7 * Math.max(0, Math.min(1, progress)) * a),
  );
  const sum = weights.reduce((s, v) => s + v, 0);
  return {
    correct,
    cost,
    reward,
    mean,
    advantage,
    probability: weights.map((v) => v / sum),
  };
}

/** Interpolate the parameters for motion, then recompute the exact product. */
const MOTION_FRAMES = adapterSnapshots();
export function adapterFrame(position: number) {
  const bounded = Math.max(
    0,
    Math.min(4, Number.isFinite(position) ? position : 0),
  );
  const lo = MOTION_FRAMES[Math.floor(bounded)],
    hi = MOTION_FRAMES[Math.ceil(bounded)];
  const mix = bounded - Math.floor(bounded);
  const a = lo.a.map((row, r) => row.map((v, c) => v + (hi.a[r][c] - v) * mix));
  const b = lo.b.map((row, r) => row.map((v, c) => v + (hi.b[r][c] - v) * mix));
  const forward = adapterForward(a, b);
  const gradB = forward.error.map((e) => forward.z.map((z) => e * z));
  const gradA = a.map((_, k) =>
    TOY_X.map(
      (x) =>
        dot(
          b.map((row) => row[k]),
          forward.error,
        ) * x,
    ),
  );
  return { ...lo, a, b, ...forward, gradA, gradB, position: bounded };
}

/** One output identity, shared by the matrix selection and its error plot. */
export function adapterOutput(position: number, output: number) {
  if (!Number.isInteger(output) || output < 0 || output >= 6)
    throw new RangeError("Select one of the six output coordinates");
  const frame = adapterFrame(position);
  const base = dot(TOY_W[output], TOY_X);
  const terms = frame.b[output].map((value, k) => value * frame.z[k]);
  return {
    frame,
    base,
    terms,
    adapted: frame.output[output],
    target: TOY_TARGET[output],
    beforeError: Math.abs(base - TOY_TARGET[output]),
    afterError: Math.abs(frame.error[output]),
  };
}

export function adapterRecord(
  position: number,
  output: number,
  presentationMs: number,
) {
  const selected = adapterOutput(position, output);
  return {
    schema: "low-rank-adapter-calculation/v1",
    evidence:
      "Exact teaching arithmetic, not a model checkpoint or measured benchmark",
    presentationMs,
    optimizerPosition: selected.frame.position,
    selectedOutput: output + 1,
    input: TOY_X,
    target: TOY_TARGET,
    frozenWeights: TOY_W,
    rank: 2,
    learningRate: 0.35,
    adapterScale: 1,
    objective: "0.5 * sum(((W + B A) x - target)^2)",
    current: selected,
    optimizerSteps: adapterSnapshots(),
    limits: [
      "Fractional positions interpolate factors for presentation, not extra optimizer steps.",
      "Language SFT uses token loss; the demonstrated answer is a separate teaching example.",
      "The six output coordinates are not model tokens, activations or benchmark scores.",
      "This calculation does not supply the 96-task cohort results.",
    ],
  };
}
