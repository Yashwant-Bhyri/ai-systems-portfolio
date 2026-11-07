import { STEP_OVERHEAD, bandwidth, kvBytesPerToken, weightBytes } from "./calibration.ts";
import type { LabRun, LabTask } from "./lab-simulation.ts";

/**
 * Where one request's time went, split the way the lab's own model builds it: waiting for a GPU,
 * reading the prompt (prefill), then decode. Decode is split by the thinking budget: at budget B the
 * model writes (1 + log2 B) times the tokens, so the extra share is reasoning and the rest is the answer.
 * Reasoning comes first, so it is the cheaper part per token: the KV cache has not grown yet.
 */
export type Phases = { id: number; worker: number; correct: boolean; arrival: number; start: number; finish: number; wait: number; read: number; reason: number; write: number };

export function servingPhases(run: LabRun): Phases[] {
  const thought = Math.log2(run.budget), share = thought / (1 + thought);
  const fast = run.mechanisms.fastKernels, kvb = kvBytesPerToken(fast), bw = bandwidth();
  return run.tasks.map((q: LabTask) => {
    const stepA = STEP_OVERHEAD + (weightBytes(fast) + (q.inputTokens + 1) * kvb) / bw;
    const steps = Math.max(0, q.tokens - 1), k = Math.round(steps * share);
    const reason = k * stepA + ((kvb / bw) * k * (k - 1)) / 2;
    return { id: q.id, worker: q.worker, correct: q.correct, arrival: q.arrival, start: q.start, finish: q.finish, wait: q.queueSeconds, read: q.prefill, reason, write: q.decode - reason };
  });
}
export const phaseTotals = (p: readonly Phases[]) => p.reduce((s, q) => ({ wait: s.wait + q.wait, read: s.read + q.read, reason: s.reason + q.reason, write: s.write + q.write }), { wait: 0, read: 0, reason: 0, write: 0 });
