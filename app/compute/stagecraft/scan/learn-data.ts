import { TOKENS } from "../../../brain-scan/scan-data";

/**
 * "Inside the model": the RL checkpoint's answer to first_item([]), fed token by
 * token to both checkpoints. The field is a deterministic simulation of how far
 * the RL checkpoint's internal state has moved from the base model's on each
 * token at each of 36 layers: small in early layers (shared knowledge), largest
 * in the late-middle layers on the tokens where behaviour changed.
 */
export { TOKENS };
export const LAYERS = 36;

/** Where the base model, given the same prefix, would have written another word. */
export const BASE_WOULD: ReadonlyMap<number, string> = new Map([
  [2, "returns"],
  [7, "."],
  [17, "It"],
  [19, "check"],
  [22, "len"],
  [26, "xs"],
  [40, "fail"],
]);
/** Tokens that carry the new behaviour even where both checkpoints agree. */
const REASONING = new Set([8, 9, 11, 12, 21, 25, 29, 38, 44, 45, 46, 48]);

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

export type LearnScan = { change: number[][]; agree: number[]; max: number };

export function buildLearnScan(): LearnScan {
  const r = rand(20261027);
  const bias = TOKENS.map((tok, t) => {
    const punct = /^[\s.,:[\]()⏎_]+$/.test(tok) ? -0.1 : 0;
    return punct + (BASE_WOULD.has(t) ? 0.55 : REASONING.has(t) ? 0.24 : 0) + (r() - 0.5) * 0.12;
  });
  const change = TOKENS.map((_, t) =>
    Array.from({ length: LAYERS }, (_, l) => {
      const depth = l / (LAYERS - 1);
      // behaviour lives late-middle: a broad bump around layer ~25 of 36
      const bump = Math.exp(-(((depth - 0.7) / 0.2) ** 2));
      const base = 0.03 + 0.09 * depth + 0.11 * bump;
      const spike = Math.max(0, bias[t]) * (0.15 + 1.25 * bump);
      return Math.max(0, base + spike + (r() - 0.5) * 0.07 * (0.4 + depth));
    }),
  );
  // the base model's probability of the RL checkpoint's token: low where it would have written another word
  const agree = TOKENS.map((_, t) => (BASE_WOULD.has(t) ? 0.08 + r() * 0.16 : REASONING.has(t) ? 0.45 + r() * 0.25 : 0.78 + r() * 0.2));
  const sorted = change.flat().sort((a, b) => a - b);
  const q = sorted[Math.floor(sorted.length * 0.985)];
  return { change: change.map((col) => col.map((v) => Math.min(1.41, (v / q) * 1.41))), agree, max: 1.41 };
}

/** Rose ramp for post-training: unchanged → near-black violet, changed → rose, the most changed → white. */
export function changeColor(v: number, max = 1.41): [number, number, number] {
  const x = Math.max(0, Math.min(1, v / max));
  const stops: [number, [number, number, number]][] = [
    [0, [20, 12, 22]],
    [0.25, [74, 30, 62]],
    [0.5, [176, 72, 122]],
    [0.75, [243, 160, 188]],
    [1, [255, 240, 246]],
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
