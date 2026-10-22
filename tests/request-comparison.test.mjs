import assert from "node:assert/strict";
import test from "node:test";
import { simulateLab } from "../app/compute/lab-simulation.ts";
import { matchedRequestComparison, requestComparisonFrame, requestMeasure, requestMeasureParts, requestMeasureUnits, requestTokensAt, REQUEST_FILM_MS } from "../app/compute/request-comparison.ts";

for (const workload of ["interactive", "shared-prefix"]) for (const policy of [0, 2]) for (const budget of [1, 2, 4, 8]) {
  test(`${workload}, checkpoint ${policy}, ${budget}x: four lenses have exact distinct execution scopes`, () => {
    for (const optimized of [false, true]) for (const task of simulateLab(policy, budget, optimized, workload).tasks) {
      for (const metric of ["service", "prefill", "decode", "latency"]) {
        const parts = requestMeasureParts(task, metric), duration = requestMeasure(task, metric);
        assert.ok(Math.abs(parts.reduce((sum, part) => sum + part.length, 0) - duration) < 1e-8);
        assert.equal(parts[0].start, 0);
        if (metric === "prefill" || metric === "decode") assert.deepEqual(parts.map(p => p.key), [metric]);
        if (metric !== "latency") assert.ok(parts.every(part => part.key !== "queue"));
        assert.equal(requestMeasureUnits(task, metric, 0).count, 0);
        const end = requestMeasureUnits(task, metric, duration);
        assert.equal(end.count, end.total);
        assert.equal(end.total, metric === "prefill" ? task.computedInputTokens : task.tokens);
      }
    }
  });
  test(`${workload}, checkpoint ${policy}, ${budget}x: individual gains reconcile without counting queueing as GPU work`, () => {
    const baseline = simulateLab(policy, budget, false, workload);
    for (const mechanisms of [{ reuse: true, fastKernels: true }, { reuse: true, fastKernels: false }, { reuse: false, fastKernels: true }]) {
      const optimized = simulateLab(policy, budget, true, workload, mechanisms);
      for (let id = 0; id < baseline.n; id++) {
        const result = matchedRequestComparison(baseline, optimized, id);
        assert.ok(Math.abs(result.prefill + result.decode - result.service) < 1e-8);
        assert.ok(Math.abs(result.queue + result.service - result.latency) < 1e-8);
        assert.equal(requestMeasure(result.before, "service"), result.before.gpuSeconds);
        if (!mechanisms.fastKernels) assert.equal(result.decode, 0);
        if (!mechanisms.reuse) assert.equal(result.avoidedInput, 0);
        if (workload === "interactive" && !mechanisms.fastKernels) assert.equal(result.service, 0);
        for (const delivery of [false, true]) {
          const a = delivery ? result.before.latency : result.before.gpuSeconds;
          const b = delivery ? result.after.latency : result.after.gpuSeconds;
          let prior = -1;
          for (const time of [0, 1500, 5000, 8500, 10000, 12000, 15000, 16000, REQUEST_FILM_MS]) {
            const frame = requestComparisonFrame(time, a, b);
            assert.ok(frame.cursor >= prior && frame.cursor <= Math.max(a, b) + 1e-9);
            prior = frame.cursor;
            for (const task of [result.before, result.after]) {
              const tokens = requestTokensAt(task, frame.cursor, delivery);
              assert.ok(Number.isInteger(tokens) && tokens >= 0 && tokens <= task.tokens);
              if (time === REQUEST_FILM_MS) assert.equal(tokens, task.tokens);
            }
          }
          assert.equal(requestComparisonFrame(8500, a, b).cursor, Math.min(a, b));
          assert.equal(requestComparisonFrame(12000, a, b).cursor, Math.min(a, b));
        }
      }
    }
  });
}

test("mismatched checkpoints, output lengths and missing requests are rejected", () => {
  const baseline = simulateLab(0, 2);
  assert.throws(() => matchedRequestComparison(baseline, simulateLab(2, 2), 0), RangeError);
  assert.throws(() => matchedRequestComparison(baseline, baseline, 96), RangeError);
  const changed = { ...baseline, tasks: baseline.tasks.map((task, index) => index ? task : { ...task, tokens: task.tokens + 1 }) };
  assert.throws(() => matchedRequestComparison(baseline, changed, 0), RangeError);
});

test("reverse seeking reconstructs the same hold, including equal or slower target fixtures", () => {
  for (const [a, b] of [[10, 5], [10, 10], [5, 10]]) {
    assert.equal(requestComparisonFrame(-10, a, b).cursor, 0);
    assert.equal(requestComparisonFrame(30000, a, b).cursor, Math.max(a, b));
    assert.deepEqual(requestComparisonFrame(10000, a, b), { cursor: Math.min(a, b), focus: "first" });
  }
});
