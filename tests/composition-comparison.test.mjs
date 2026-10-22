import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";
registerHooks({ resolve(specifier, context, next) {
  if (specifier === "./lab-simulation" && context.parentURL?.endsWith("/composition-comparison.ts")) return next(`${specifier}.ts`, context);
  return next(specifier, context);
} });
const { labComposition } = await import("../app/compute/lab-simulation.ts");
const { compositionComparison, compositionMechanisms, compositionPhase, COMPOSITION_FILM_MS } = await import("../app/compute/composition-comparison.ts");
test("five held composition stages expose each contribution before the final comparison", () => {
  assert.equal(COMPOSITION_FILM_MS, 17500);
  assert.deepEqual([0, 3500, 7000, 10500, 14000, 17500].map(compositionPhase), [0, 1, 2, 3, 4, 4]);
  assert.equal(compositionPhase(-10), 0);
});

for (const workload of ["interactive", "shared-prefix"]) {
  for (const budget of [1, 2, 4, 8]) {
    test(`${workload}, ${budget}x: every selected point has a controlled comparison`, () => {
      const points = labComposition(workload, budget);
      for (let selected = 0; selected < 4; selected++) {
        const runtime = compositionComparison(points, selected, "runtime");
        assert.equal(runtime.reference.policyIndex, runtime.target.policyIndex);
        assert.equal(runtime.reference.optimized, false);
        assert.equal(runtime.target.optimized, true);
        assert.equal(runtime.accuracyPoints, 0);
        assert.equal(runtime.unchangedTasks, 96);
        assert.equal(runtime.gained + runtime.lost, 0);
        assert.ok(runtime.costSaved > 0);
        assert.deepEqual(runtime.reference.tasks.map(t => [t.id, t.tokens, t.correct]), runtime.target.tasks.map(t => [t.id, t.tokens, t.correct]));
        const policy = compositionComparison(points, selected, "policy");
        assert.equal(policy.reference.optimized, policy.target.optimized);
        assert.equal(policy.reference.policyIndex, 0);
        assert.equal(policy.target.policyIndex, 2);
        assert.equal(policy.gained - policy.lost, policy.correctDelta);
        assert.equal(policy.gained + policy.lost + policy.unchangedTasks, 96);
        assert.ok(policy.taskWorkDelta > 0, "training cost tradeoff must remain visible");
        const combined = compositionComparison(points, selected, "combined");
        assert.deepEqual(combined.path, [0, 2, 3]);
        assert.equal(combined.costSaved, points[0].correctCost - points[3].correctCost);
        assert.equal(combined.accuracyPoints, points[3].accuracy - points[0].accuracy);
        const leg1 = compositionComparison(points, 0, "policy");
        const leg2 = compositionComparison(points, 2, "runtime");
        assert.ok(Math.abs(leg1.costSaved + leg2.costSaved - combined.costSaved) < 1e-10);
        const runtimeSteps = compositionMechanisms(points, selected, "runtime");
        assert.ok(Math.abs(runtimeSteps.reduce((sum, step) => sum + step.delta, 0) - runtime.costSaved) < 1e-9);
        assert.equal(runtimeSteps[0].after.mechanisms.fastKernels, false);
        assert.equal(runtimeSteps[0].after.mechanisms.reuse, true);
        for (const step of runtimeSteps) {
          assert.equal(step.before.mechanisms.scheduler, step.after.mechanisms.scheduler);
          assert.equal(step.before.policy, step.after.policy);
          assert.equal(step.before.correct, step.after.correct);
        }
        if (workload === "interactive") assert.equal(runtimeSteps[0].delta, 0, "unrelated inputs cannot receive a reuse dividend");
        const trainingSteps = compositionMechanisms(points, selected, "policy");
        assert.ok(Math.abs(trainingSteps.reduce((sum, step) => sum + step.delta, 0) - policy.accuracyPoints) < 1e-9);
        assert.equal(trainingSteps[0].after.policyIndex, 1);
        assert.equal(trainingSteps[1].after.policyIndex, 2);
        for (const step of trainingSteps) assert.deepEqual(step.before.mechanisms, step.after.mechanisms);
      }
    });
  }
}
test("equal fixtures expose zero deltas and never manufacture a percent gain", () => {
  const points = labComposition();
  const equal = points.map(point => ({ ...points[0], id: point.id, trained: point.trained, optimized: point.optimized }));
  const result = compositionComparison(equal, 3, "combined");
  assert.equal(result.costSaved, 0);
  assert.equal(result.costPercent, 0);
  assert.equal(result.accuracyPoints, 0);
  assert.equal(result.gained + result.lost, 0);
});
test("invalid composition selection fails instead of silently comparing unrelated runs", () => {
  assert.throws(() => compositionComparison(labComposition(), -1, "runtime"), RangeError);
  assert.throws(() => compositionComparison(labComposition(), 4, "policy"), RangeError);
  assert.throws(() => compositionComparison(labComposition().slice(0, 3), 0, "combined"), RangeError);
});
