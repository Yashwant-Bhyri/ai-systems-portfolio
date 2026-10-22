import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";

// Match the bundler's extensionless local TS resolution without a test dependency.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier === "./lab-simulation" &&
      context.parentURL?.endsWith("/lab-story-data.ts")
    )
      return nextResolve(`${specifier}.ts`, context);
    return nextResolve(specifier, context);
  },
});
const { inferenceStoryRuns, trainingStoryRuns } =
  await import("../app/compute/lab-story-data.ts");
const { simulateLab, BUDGETS } =
  await import("../app/compute/lab-simulation.ts");
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);

test("all legacy defaults equal their explicit mechanism tuples", () => {
  for (let p = 0; p < 4; p++)
    for (const b of BUDGETS)
      for (const w of ["interactive", "shared-prefix"])
        for (const optimized of [false, true])
          assert.deepEqual(
            simulateLab(p, b, optimized, w),
            simulateLab(p, b, optimized, w, {
              reuse: optimized,
              fastKernels: optimized,
              scheduler: "continuous",
            }),
          );
});
test("inference chapters conserve cognition and export exact interventions", () => {
  for (const workload of ["interactive", "shared-prefix"]) {
    const runs = inferenceStoryRuns(workload),
      base = runs[0];
    for (const r of runs) {
      assert.deepEqual(
        r.tasks.map((t) => [
          t.id,
          t.correct,
          t.tokens,
          t.inputTokens,
          t.arrival,
        ]),
        base.tasks.map((t) => [
          t.id,
          t.correct,
          t.tokens,
          t.inputTokens,
          t.arrival,
        ]),
      );
      close(
        r.gpuSeconds,
        r.tasks.reduce((s, t) => s + t.prefill + t.decode, 0),
      );
      close(r.correctCost, r.gpuSeconds / r.correct);
      const available = [0, 0];
      for (const t of r.tasks) {
        assert.ok(t.start >= available[t.worker]);
        assert.ok(t.start >= t.arrival);
        close(t.latency, t.queueSeconds + t.gpuSeconds);
        available[t.worker] = t.finish;
      }
      close(r.p95, r.tasks.map((t) => t.latency).sort((a, b) => a - b)[91]);
    }
    assert.deepEqual(runs[3], runs[4]);
    assert.equal(runs[2].mechanisms.reuse, true);
    assert.equal(runs[2].mechanisms.fastKernels, false);
  }
});
test("paired barriers change queueing but do not invent GPU busy-work", () => {
  for (const w of ["interactive", "shared-prefix"]) {
    const [barrier, continuous] = inferenceStoryRuns(w);
    let previousFinish = 0;
    for (let i = 0; i < 96; i += 2) {
      const a = barrier.tasks[i],
        b = barrier.tasks[i + 1];
      const release = Math.max(a.arrival, b.arrival, previousFinish);
      assert.equal(a.start, release);
      assert.equal(b.start, release);
      previousFinish = Math.max(a.finish, b.finish);
    }
    assert.deepEqual(
      barrier.tasks.map((t) => t.gpuSeconds),
      continuous.tasks.map((t) => t.gpuSeconds),
    );
    close(barrier.gpuSeconds, continuous.gpuSeconds);
    assert.ok(continuous.p95 < barrier.p95);
  }
});
test("reuse charges warm-up, honors readiness and leaves decode unchanged", () => {
  for (const w of ["interactive", "shared-prefix"]) {
    const [, noReuse, reuse] = inferenceStoryRuns(w),
      ready = new Map();
    assert.equal(
      reuse.tasks.filter((t) => t.cacheHit).length,
      w === "shared-prefix" ? 90 : 0,
    );
    for (const [i, t] of reuse.tasks.entries()) {
      close(t.decode, noReuse.tasks[i].decode);
      if (t.cacheHit) {
        assert.ok(ready.get(i % 6) <= t.start);
        assert.equal(t.computedInputTokens, 384);
      } else assert.equal(t.computedInputTokens, t.inputTokens);
      ready.set(
        i % 6,
        Math.min(ready.get(i % 6) ?? Infinity, t.start + t.prefill),
      );
    }
    if (w === "interactive") close(noReuse.gpuSeconds, reuse.gpuSeconds);
    else assert.ok(reuse.gpuSeconds < noReuse.gpuSeconds);
  }
});
test("fast execution changes rates, not the remaining token work", () => {
  for (const w of ["interactive", "shared-prefix"]) {
    const [, , old, next] = inferenceStoryRuns(w);
    for (let i = 0; i < 96; i++) {
      assert.equal(
        old.tasks[i].computedInputTokens,
        next.tasks[i].computedInputTokens,
      );
      assert.equal(old.tasks[i].cacheHit, next.tasks[i].cacheHit);
      close(next.tasks[i].prefill / old.tasks[i].prefill, 0.00095 / 0.0012);
      close(next.tasks[i].decode / old.tasks[i].decode, 0.00225 / 0.0028);
    }
  }
});
test("learning and extra thought remain independent interventions", () => {
  for (const b of BUDGETS) {
    const runs = trainingStoryRuns(b);
    assert.deepEqual(
      runs.map((r) => r.policyIndex),
      [0, 1, 2, 2, 3],
    );
    assert.deepEqual(
      runs.map((r) => r.budget),
      [1, 1, 1, b, b],
    );
    if (b === 1) assert.deepEqual(runs[2], runs[3]);
    else {
      assert.ok(runs[3].gpuSeconds > runs[2].gpuSeconds);
      assert.ok(runs[3].correct >= runs[2].correct);
    }
    assert.ok(runs[4].gpuSeconds < runs[3].gpuSeconds);
  }
});
