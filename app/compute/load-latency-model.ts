import type { LabRun } from "./lab-simulation";

export const LOAD_FILM_MS = 49000;
export const LOAD_MOMENTS = { arrivals: 0, queue: 11500, complete: 24000, sort: 28000, baseline: 31000, optimized: 35000, scan: 38000, difference: 47000 } as const;
/** The scan sweeps rank 1 → n, then glides back to the selected percentile. */
const SCAN = { start: 37000, end: 44000, settle: 45000 } as const;
export function loadState(run: LabRun, time: number) {
  const arrived = run.tasks.filter(task => task.arrival <= time);
  const waiting = arrived.filter(task => task.start > time);
  const running = arrived.filter(task => task.start <= time && task.finish > time);
  const completed = arrived.filter(task => task.finish <= time);
  return { time, arrived, waiting, running, completed };
}

export function loadEvents(run: LabRun) {
  return [...new Set([0, ...run.tasks.flatMap(task => [task.arrival, task.start, task.finish])])]
    .sort((a, b) => a - b).map(time => {
      const state = loadState(run, time);
      return { time, waiting: state.waiting.length, running: state.running.length, completed: state.completed.length };
    });
}

export function latencyDistribution(run: LabRun, percentile: number) {
  if (!Number.isFinite(percentile) || percentile <= 0 || percentile > 100 || !run.tasks.length)
    throw new RangeError("A latency percentile requires observations and a percentile in (0, 100]");
  const tasks = [...run.tasks].sort((a, b) => a.latency - b.latency || a.id - b.id);
  const rank = Math.ceil(percentile / 100 * tasks.length);
  const threshold = tasks[rank - 1];
  const rankById = new Map(tasks.map((task, index) => [task.id, index]));
  return { tasks, rank, rankById, threshold,
    atOrBelow: tasks.filter(task => task.latency <= threshold.latency).length,
    above: tasks.filter(task => task.latency > threshold.latency).length };
}

export function assertMatchedLoad(before: LabRun, after: LabRun) {
  if (before.policy !== after.policy || before.budget !== after.budget || before.workload !== after.workload ||
    before.n !== after.n || before.mechanisms.scheduler !== after.mechanisms.scheduler ||
    before.tasks.some((task, index) => {
      const other = after.tasks[index];
      return !other || task.id !== other.id || task.arrival !== other.arrival || task.inputTokens !== other.inputTokens || task.tokens !== other.tokens || task.correct !== other.correct;
    })) throw new RangeError("Load comparison requires matched requests, arrivals, policy, budget and scheduler");
}

/** The queue clock completes before the responses are reordered into a distribution. */
export function loadFilmFrame(filmMs: number, lastArrival: number, lastFinish: number) {
  const time = Math.max(0, Math.min(LOAD_FILM_MS, filmMs));
  const elapsed = time <= 1000 ? 0 : time < 10000 ? lastArrival * (time - 1000) / 9000
    : time < 13500 ? lastArrival : time < 22000 ? lastArrival + (lastFinish - lastArrival) * (time - 13500) / 8500 : lastFinish;
  const sorting = Math.max(0, Math.min(1, (time - 26500) / 3500));
  const easedSort = sorting * sorting * (3 - 2 * sorting);
  return {
    elapsed,
    horizon: Math.max(1, lastFinish),
    phase: time < 10000 ? "arrivals" : time < 13500 ? "queue" : time < 22000 ? "drain" : time < 26000 ? "complete" : "latency",
    tail: time >= 26000,
    sort: easedSort,
    focus: time < 30000 ? "both" : time < 33500 ? "baseline" : time < SCAN.start ? "optimized" : time < SCAN.settle ? "scan" : "difference",
    /** Sweep progress across ranks (0 → 1), then the glide back to the percentile (0 → 1). */
    scan: Math.max(0, Math.min(1, (time - SCAN.start) / (SCAN.end - SCAN.start))),
    settle: Math.max(0, Math.min(1, (time - SCAN.end) / (SCAN.settle - SCAN.end))),
    fade: time < 25500 ? 1 : time < 26000 ? 1 - .75 * (time - 25500) / 500 : Math.min(1, .25 + .75 * (time - 26000) / 500),
  } as const;
}
