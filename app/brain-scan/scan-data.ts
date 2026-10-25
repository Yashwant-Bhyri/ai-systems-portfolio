/**
 * The scan's data: one answer, tokenised, and a drift field over 36 layers.
 * The field is a deterministic simulation of how far an INT4 copy of the model
 * drifts from BF16 on each token at each layer (rising with depth and along the
 * sentence, spiking on tokens where the copy would pick a different word).
 */

export const LAYERS = 36;

// The post-training task the portfolio follows: first_item([]) crashes.
export const TOKENS: readonly string[] = [
  "The", " function", " reads", " xs", "[", "0", "]", " before", " checking", " that", " the", " list", " has", " an", " item", ".",
  "⏎", "Add", " a", " guard", ":", " if", " not", " xs", ":", " return", " None", ".", "⏎",
  "Then", " return", " xs", "[", "0", "]", ".", "⏎",
  "Both", " tests", " now", " pass", ",", " and", " first", "_item", "([", "])", " returns", " None", ".",
];

/** Tokens where the INT4 copy would have chosen a different word. */
export const FLIPS = new Set([2, 8, 19, 26, 38, 43, 47]);

function rand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Scan = { drift: number[][]; confidence: number[]; max: number };

export function buildScan(): Scan {
  const r = rand(20261026);
  const T = TOKENS.length;
  const tokenBias = TOKENS.map((tok, t) => {
    const punct = /^[\s.,:[\]()⏎_]+$/.test(tok) ? -0.08 : 0;
    const digit = /\d/.test(tok) ? 0.12 : 0;
    return punct + digit + (FLIPS.has(t) ? 0.34 : 0) + (r() - 0.5) * 0.16;
  });
  const drift = TOKENS.map((_, t) =>
    Array.from({ length: LAYERS }, (_, l) => {
      const depth = l / (LAYERS - 1);
      const along = t / (T - 1);
      const base = 0.14 + 0.66 * depth ** 1.45 + 0.26 * along * (0.45 + depth);
      const spike = tokenBias[t] * (0.35 + 0.9 * depth);
      const band = 0.05 * Math.sin(l * 0.9 + t * 0.35);
      return Math.max(0, base + spike + band + (r() - 0.5) * 0.09 * (0.5 + depth));
    }),
  );
  const confidence = TOKENS.map((_, t) => (FLIPS.has(t) ? 0.18 + r() * 0.2 : 0.72 + r() * 0.28));
  // Scale so the brightest few percent reach white, as in the reference; the rest spread across the teal ramp.
  const sorted = drift.flat().sort((a, b) => a - b);
  const q = sorted[Math.floor(sorted.length * 0.985)];
  return { drift: drift.map((col) => col.map((v) => Math.min(1.41, (v / q) * 1.41))), confidence, max: 1.41 };
}

/** Teal ramp: identical (0) → black-green, drifted → bright teal, the maximum → white. */
export function driftColor(v: number, max = 1.41): [number, number, number] {
  const x = Math.max(0, Math.min(1, v / max));
  const stops: [number, [number, number, number]][] = [
    [0, [10, 24, 22]],
    [0.22, [24, 84, 72]],
    [0.45, [48, 182, 156]],
    [0.7, [108, 250, 222]],
    [1, [236, 255, 250]],
  ];
  for (let i = 1; i < stops.length; i++) {
    if (x <= stops[i][0]) {
      const [a, ca] = stops[i - 1], [b, cb] = stops[i];
      const k = (x - a) / (b - a);
      return [0, 1, 2].map((j) => Math.round(ca[j] + (cb[j] - ca[j]) * k)) as [number, number, number];
    }
  }
  return stops[stops.length - 1][1];
}
