/**
 * A deterministic RL-step scheduler model for 64 GPUs (design after QwenGyre's elastic cells).
 * Rollout lengths are long-tailed; training is data-parallel over whichever GPUs are free.
 * Colocated: every GPU waits for the slowest rollout, then all train, then sync.
 * Elastic: a GPU that finishes its rollout joins training at once; stragglers keep generating
 * and their trajectories land in the next step's batch (one step of staleness).
 */
import { rng } from "../engine";

export const GPUS = 64;
export const STEPS = 4;
export const TRAIN_WORK = GPUS * 0.5; // GPU-minutes of optimizer work per step
export const SYNC = 0.08; // minutes to broadcast new weights
export const SWITCH = 0.04; // minutes for a GPU to change role

export type Segment = { gpu: number; kind: "rollout" | "train" | "sync" | "idle"; start: number; end: number; step: number };

export function rolloutLengths(step: number) {
  const r = rng(9001 + step * 104729);
  return Array.from({ length: GPUS }, () => {
    const x = r();
    return 0.55 + 0.7 * r() + 2.4 * Math.pow(x, 6);
  });
}

export function colocated(steps = STEPS) {
  const segs: Segment[] = [];
  let t = 0;
  const stepEnds: number[] = [];
  for (let s = 0; s < steps; s++) {
    const d = rolloutLengths(s), longest = Math.max(...d);
    d.forEach((len, g) => {
      segs.push({ gpu: g, kind: "rollout", start: t, end: t + len, step: s });
      if (len < longest) segs.push({ gpu: g, kind: "idle", start: t + len, end: t + longest, step: s });
    });
    const trainStart = t + longest, trainEnd = trainStart + TRAIN_WORK / GPUS;
    for (let g = 0; g < GPUS; g++) {
      segs.push({ gpu: g, kind: "train", start: trainStart, end: trainEnd, step: s });
      segs.push({ gpu: g, kind: "sync", start: trainEnd, end: trainEnd + SYNC, step: s });
    }
    t = trainEnd + SYNC;
    stepEnds.push(t);
  }
  return { segs, stepEnds, total: t };
}

export function elastic(steps = STEPS) {
  const segs: Segment[] = [];
  const free = new Array(GPUS).fill(0); // when each GPU can take new work
  let t = 0;
  const stepEnds: number[] = [];
  for (let s = 0; s < steps; s++) {
    const d = rolloutLengths(s);
    // each GPU starts this step's rollout when it is free (stragglers from the last step finish first)
    const done = d.map((len, g) => {
      const start = Math.max(t, free[g]);
      segs.push({ gpu: g, kind: "rollout", start, end: start + len, step: s });
      return start + len;
    });
    // training proceeds at the rate of GPUs that have finished; integrate until the work is done
    const order = done.map((x, g) => [x, g] as const).sort((a, b) => a[0] - b[0]);
    let work = 0, pool = 0, clock = order[0][0] + SWITCH, end = clock;
    const joined: number[] = [];
    for (let i = 0; i < order.length; i++) {
      const [at, g] = order[i];
      const next = i + 1 < order.length ? order[i + 1][0] + SWITCH : Infinity;
      joined.push(g);
      pool++;
      clock = Math.max(clock, at + SWITCH);
      const need = TRAIN_WORK - work;
      if (pool * (next - clock) >= need) { end = clock + need / pool; work = TRAIN_WORK; break; }
      work += pool * (next - clock);
      clock = next;
    }
    joined.forEach((g) => {
      const start = done[g] + SWITCH;
      if (start < end) segs.push({ gpu: g, kind: "train", start, end, step: s });
      segs.push({ gpu: g, kind: "sync", start: end, end: end + SYNC, step: s });
      free[g] = end + SYNC;
    });
    // GPUs still generating keep their rollout; they rejoin when it completes
    for (let g = 0; g < GPUS; g++) if (!joined.includes(g)) free[g] = done[g];
    t = end + SYNC;
    stepEnds.push(t);
  }
  return { segs, stepEnds, total: t };
}

export function busyShare(segs: Segment[], total: number) {
  const busy = segs.filter((s) => s.kind === "rollout" || s.kind === "train").reduce((a, s) => a + Math.min(s.end, total) - s.start, 0);
  return busy / (GPUS * total);
}

export const FLEET = (() => {
  const a = colocated(STEPS), b = elastic(STEPS * 2 + 1);
  const span = a.total;
  const doneB = b.stepEnds.filter((e) => e <= span).length;
  const b4 = elastic(STEPS);
  return {
    colocated: a, elastic: b, span, doneA: STEPS, doneB,
    stepA: a.total / STEPS, stepB: b4.total / STEPS,
    utilA: busyShare(a.segs, a.total), utilB: busyShare(b.segs, span),
  };
})();
