import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";
import { STEP_OVERHEAD, bandwidth, kvBytesPerToken, prefillSeconds, weightBytes } from "../app/compute/calibration.ts";
// Expected costs come from the calibrated roofline itself, not from pinned constants.
const prefillOf = (input, computed, fast) => STEP_OVERHEAD + prefillSeconds(computed, input - computed, fast);
const decodeOf = (input, tokens, fast) => {
  const steps = Math.max(0, tokens - 1), kvb = kvBytesPerToken(fast), bw = bandwidth();
  return steps * (STEP_OVERHEAD + (weightBytes(fast) + (input + 1) * kvb) / bw) + ((kvb / bw) * steps * (steps - 1)) / 2;
};

import { simulateLab, TASKS } from "../app/compute/lab-simulation.ts";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier === "./lab-simulation" &&
      context.parentURL?.endsWith("/prefix-study-math.ts")
    )
      return nextResolve(`${specifier}.ts`, context);
    return nextResolve(specifier, context);
  },
});
const {
  prefixStudy,
  prefixFrame,
  prefixServiceAt,
  prefixComparisonFrame,
  PREFIX_DURATION,
  PREFIX_MOMENTS,
  PREFIX_HANDOFF,
} = await import("../app/compute/prefix-study-math.ts");

const pair = (workload) => [
  simulateLab(2, 2, false, workload),
  simulateLab(2, 2, false, workload, { reuse: true }),
];
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);

for (const workload of ["interactive", "shared-prefix"]) {
  const [before, after] = pair(workload);
  const study = prefixStudy(before, after);

  test(`${workload}: paired prefix service conserves work and exposes exact completion`, () => {
    for (const seconds of [
      0,
      study.request.prefill,
      study.reference.prefill,
      study.request.gpuSeconds,
      study.reference.gpuSeconds,
      1000,
    ]) {
      const frame = prefixServiceAt(study, seconds);
      for (const [lane, task] of [
        [frame.baseline, study.reference],
        [frame.optimized, study.request],
      ]) {
        close(lane.work, Math.min(seconds, task.gpuSeconds));
        close(lane.work, lane.prefillWork + lane.decodeWork);
        assert.ok(lane.outputTokens >= 0 && lane.outputTokens <= task.tokens);
        if (seconds < task.prefill) assert.equal(lane.outputTokens, 0);
        if (lane.done) assert.equal(lane.outputTokens, task.tokens);
      }
      if (workload === "interactive")
        assert.deepEqual(frame.baseline, frame.optimized);
    }
    const release = prefixServiceAt(study, study.request.gpuSeconds);
    assert.equal(release.optimized.done, true);
    if (workload === "shared-prefix") {
      assert.equal(release.baseline.done, false);
      close(release.remaining, study.savedWork);
      assert.equal(release.baseline.phase, "decode");
      assert.ok(release.baseline.outputTokens < release.optimized.outputTokens);
    }
    assert.throws(() => prefixServiceAt(study, -1));
    assert.throws(() => prefixServiceAt(study, NaN));
    assert.throws(() => prefixServiceAt(study, Infinity));
  });

  test(`${workload}: prefix film holds the early completion and reconstructs after seeking`, () => {
    close(prefixComparisonFrame(10400, study).seconds, 0);
    const held = prefixComparisonFrame(21800, study);
    assert.deepEqual(prefixComparisonFrame(23800, study), held);
    assert.deepEqual(prefixComparisonFrame(25800, study), held);
    assert.deepEqual(
      prefixComparisonFrame(29400, study),
      prefixComparisonFrame(PREFIX_DURATION, study),
    );
    assert.equal(
      prefixComparisonFrame(PREFIX_DURATION, study).baseline.done,
      true,
    );
    const earlier = prefixComparisonFrame(13000, study);
    prefixComparisonFrame(19000, study);
    assert.deepEqual(prefixComparisonFrame(13000, study), earlier);
  });

  test(`${workload}: reuse isolates input work and retains task identity`, () => {
    assert.equal(study.reference.id, study.request.id);
    after.tasks.forEach((task, i) => {
      const reference = before.tasks[i];
      assert.equal(task.arrival, reference.arrival);
      assert.equal(task.inputTokens, reference.inputTokens);
      assert.equal(task.correct, reference.correct);
      assert.equal(task.tokens, reference.tokens);
      assert.equal(task.decode, reference.decode);
      close(task.prefill, prefillOf(task.inputTokens, task.computedInputTokens, false));
      close(reference.prefill, prefillOf(reference.inputTokens, reference.computedInputTokens, false));
      if (task.cacheHit) {
        const group = TASKS[task.id].prefixGroup;
        assert.ok(
          after.tasks.some(
            (producer) =>
              !producer.cacheHit &&
              TASKS[producer.id].prefixGroup === group &&
              producer.start + producer.prefill <= task.start,
          ),
        );
      } else assert.equal(task.computedInputTokens, task.inputTokens);
    });
    close(
      study.totalSaved,
      after.tasks.reduce(
        (sum, task, i) => sum + before.tasks[i].prefill - task.prefill,
        0,
      ),
    );
    assert.equal(study.hits + study.coldReads, after.n);
    if (workload === "shared-prefix") {
      assert.equal(study.hits, 90);
      assert.equal(study.coldReads, 6);
      assert.equal(study.savedTokens, 7808);
      assert.ok(study.readyAt <= study.request.start);
      close(study.savedWork, prefillOf(8192, 8192, false) - prefillOf(8192, 384, false));
      close(study.totalSaved, 90 * (prefillOf(8192, 8192, false) - prefillOf(8192, 384, false)));
    } else {
      assert.equal(study.hits, 0);
      assert.equal(study.savedTokens, 0);
      assert.equal(study.savedWork, 0);
      assert.equal(study.totalSaved, 0);
    }
  });

  test(`${workload}: readiness, lookup, suffix and answer share one reversible clock`, () => {
    assert.deepEqual(
      PREFIX_MOMENTS.map((t) => prefixFrame(t, study).beat),
      [0, 1, 2, 3, 4, 5],
    );
    assert.equal(prefixFrame(0, study).coldTokens, 0);
    assert.equal(prefixFrame(5500, study).ready, false);
    assert.equal(prefixFrame(7400, study).ready, true);
    assert.equal(prefixFrame(10399, study).avoidedTokens, 0);
    assert.equal(
      prefixFrame(10400, study).matched,
      workload === "shared-prefix",
    );
    assert.equal(
      prefixFrame(12800, study).newTokens,
      study.request.computedInputTokens,
    );
    assert.equal(prefixFrame(12800, study).outputTokens, 0);
    assert.equal(
      prefixFrame(PREFIX_DURATION, study).outputTokens,
      study.request.tokens,
    );
    const prior = prefixFrame(6700, study);
    prefixFrame(PREFIX_DURATION, study);
    assert.deepEqual(prefixFrame(6700, study), prior);
    for (let ms = -1000; ms <= PREFIX_DURATION + 1000; ms += 50) {
      const frame = prefixFrame(ms, study);
      for (const key of ["cold", "store", "lookup", "suffix", "decode"])
        assert.ok(frame[key] >= 0 && frame[key] <= 1);
      if (frame.decode > 0) assert.equal(frame.suffix, 1);
      if (frame.matched) assert.equal(frame.ready, true);
      if (workload === "interactive") assert.equal(frame.avoidedTokens, 0);
    }
  });

  test(`${workload}: camera handoff preserves service, input and output state`, () => {
    const first = prefixComparisonFrame(PREFIX_HANDOFF[0], study);
    assert.ok(first.optimized.outputTokens > 0);
    assert.equal(first.optimized.done, false);
    for (let ms = PREFIX_HANDOFF[0]; ms <= PREFIX_HANDOFF[1]; ms += 50) {
      assert.deepEqual(prefixComparisonFrame(ms, study), first);
      const mechanism = prefixFrame(ms, study);
      assert.equal(mechanism.newTokens, first.optimized.inputTokens);
      assert.equal(mechanism.outputTokens, first.optimized.outputTokens);
    }
    assert.equal(prefixFrame(PREFIX_HANDOFF[0], study).handoff, 0);
    assert.equal(prefixFrame(PREFIX_HANDOFF[1], study).handoff, 1);
    let prior = 0;
    for (let ms = 0; ms <= PREFIX_DURATION; ms += 50) {
      const service = prefixComparisonFrame(ms, study);
      assert.ok(service.seconds >= prior);
      assert.equal(
        prefixFrame(ms, study).outputTokens,
        service.optimized.outputTokens,
      );
      prior = service.seconds;
    }
    // Suffix and attention are now visible before leaving the mechanism.
    assert.equal(prefixFrame(12800, study).suffix, 1);
    assert.ok(prefixFrame(14500, study).decode > 0);
    assert.equal(prefixFrame(14500, study).handoff, 0);
  });
}

test("comparison rejects a changed checkpoint, workload, schedule or cognition", () => {
  const [before, after] = pair("shared-prefix");
  for (const change of [
    (run) => {
      run.policy = "base";
    },
    (run) => {
      run.budget = 4;
    },
    (run) => {
      run.workload = "interactive";
    },
    (run) => {
      run.mechanisms.scheduler = "barrier";
    },
    (run) => {
      run.mechanisms.fastKernels = true;
    },
    (run) => {
      run.mechanisms.reuse = false;
    },
    (run) => {
      run.tasks[0].tokens += 1;
    },
    (run) => {
      run.tasks[0].inputTokens += 1;
    },
    (run) => {
      run.tasks[0].arrival += 1;
    },
    (run) => {
      run.tasks[0].decode += 1;
    },
    (run) => {
      run.tasks[0].correct = !run.tasks[0].correct;
    },
    (run) => {
      run.tasks.pop();
    },
  ]) {
    const altered = structuredClone(after);
    change(altered);
    assert.throws(() => prefixStudy(before, altered));
  }
  const tooEarly = structuredClone(after);
  tooEarly.tasks[6].start = 0;
  assert.throws(
    () => prefixStudy(before, tooEarly),
    /previously computed state/,
  );
  assert.throws(
    () => prefixStudy({ ...before, tasks: [] }, { ...after, tasks: [] }),
    /needs a request/,
  );
});
