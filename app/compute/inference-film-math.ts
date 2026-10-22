import type { LabRun } from "./lab-simulation";

export const FILM_DURATION = 12000;
export const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
export const windowProgress = (p: number, start: number, end: number) =>
  clamp01((p - start) / (end - start));
export const easeFilm = (t: number) => t * t * (3 - 2 * t);

/** A trace cursor, not an animation-only estimate of completions or GPU work. */
export function traceAt(run: LabRun, time: number, count = 6) {
  const tasks = run.tasks.slice(0, count);
  return tasks.map((task) => ({
    ...task,
    state:
      time >= task.finish
        ? "done"
        : time >= task.start
          ? "running"
          : time >= task.arrival
            ? "waiting"
            : "future",
    progress: clamp01((time - task.start) / task.gpuSeconds),
    worked: Math.max(0, Math.min(task.gpuSeconds, time - task.start)),
  }));
}

/** Token completion at a declared runtime's rate, retaining prefill latency. */
export function decodeAt(task: LabRun["tasks"][number], time: number) {
  return Math.floor(task.tokens * clamp01((time - task.prefill) / task.decode));
}
