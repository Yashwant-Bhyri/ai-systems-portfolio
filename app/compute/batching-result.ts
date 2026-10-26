import { simulateServing } from "./serving-sim.ts";
import { POLICIES, TASKS, simulateLab } from "./lab-simulation.ts";

/**
 * Iteration-level batching on the laboratory's own cohort: the RL checkpoint at 2×
 * thought, 96 requests over one shared document, two H100 replicas. The lab's
 * workers run one request at a time; here every engine step carries every running
 * request, so each 8 GB weight read is shared. From the calibrated serving
 * simulator, not a hardware measurement.
 */
export const BATCHING = (() => {
  const policy = POLICIES[2];
  const reqs = TASKS.map((t) => ({ id: t.id, arrival: t.id * 2, input: 8192, output: Math.round(t.baseTokens * policy.work * 2), group: t.prefixGroup, shared: 8192 - 384 }));
  const lab = simulateLab(2, 2, false, "shared-prefix");
  const batched = simulateServing(reqs, { scheduler: "continuous", reuse: false, fast: false, replicas: 2 });
  const gpu = batched.reduce((a, r) => a + r.prefillGpu + r.decodeGpu, 0);
  const lat = batched.map((r) => r.finish - reqs[r.id].arrival).sort((a, b) => a - b);
  return { serialPerCorrect: lab.correctCost!, batchedPerCorrect: gpu / lab.correct, batchedP95: lat[Math.ceil(0.95 * lat.length) - 1] };
})();
