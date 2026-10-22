import assert from "node:assert/strict";
import test from "node:test";
import { nearestPlotPoint } from "../app/compute/plot-hit-test.ts";
import {
  adapterForward,
  adapterSnapshots,
  relativePolicy,
  TOY_W,
  TOY_X,
} from "../app/compute/policy-film-math.ts";
import {
  INFERENCE_FIGURE_STORY,
  TRAINING_FIGURE_STORY,
} from "../app/compute/figure-story-data.ts";
import { labComposition, simulateLab } from "../app/compute/lab-simulation.ts";
const close = (a, b, tolerance = 1e-8) =>
  assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);

test("dense curve selection follows distance rather than paint order", () => {
  const points = [
    { x: 100, y: 100, value: "SFT-8" },
    { x: 112, y: 103, value: "Efficiency-4" },
  ];
  assert.equal(nearestPlotPoint(100, 100, points), "SFT-8");
  assert.equal(nearestPlotPoint(100, 100, [...points].reverse()), "SFT-8");
  assert.equal(nearestPlotPoint(114, 105, points), "Efficiency-4");
  assert.equal(nearestPlotPoint(200, 200, points), undefined);
  const actual = [0,1,2,3].flatMap(policy => [1,2,4,8].map(budget => {
    const run = simulateLab(policy,budget);
    return {x:86+run.meanCost/36*950,y:311-run.accuracy*2.5,value:`${policy}-${budget}`};
  }));
  for (const point of actual) {
    assert.equal(nearestPlotPoint(point.x,point.y,actual),point.value);
    assert.equal(nearestPlotPoint(point.x,point.y,[...actual].reverse()),point.value);
  }
});

test("adapter film preserves W and starts with an exactly zero delta", () => {
  const original = structuredClone(TOY_W),
    frames = adapterSnapshots();
  assert.deepEqual(TOY_W, original);
  assert.ok(frames[0].delta.flat().every((v) => v === 0));
  assert.ok(frames[0].gradA.flat().every((v) => v === 0));
  assert.ok(frames[0].gradB.flat().some((v) => v !== 0));
  assert.equal(frames.length, 5);
});
test("every displayed matrix product and gradient step reconciles", () => {
  const f = adapterSnapshots();
  for (const frame of f) {
    for (let r = 0; r < 6; r++)
      for (let c = 0; c < 6; c++)
        close(
          frame.delta[r][c],
          frame.b[r][0] * frame.a[0][c] + frame.b[r][1] * frame.a[1][c],
        );
    for (let r = 0; r < 6; r++)
      close(
        frame.output[r],
        TOY_X.reduce((s, x, c) => s + (TOY_W[r][c] + frame.delta[r][c]) * x, 0),
      );
    if (frame.step) {
      const prev = f[frame.step - 1];
      assert.ok(frame.loss < prev.loss);
      frame.a.forEach((row, r) =>
        row.forEach((v, c) => close(v, prev.a[r][c] - 0.35 * prev.gradA[r][c])),
      );
      frame.b.forEach((row, r) =>
        row.forEach((v, c) => close(v, prev.b[r][c] - 0.35 * prev.gradB[r][c])),
      );
    }
  }
});
test("analytic adapter gradients match finite differences", () => {
  const f = adapterSnapshots()[2],
    epsilon = 1e-5;
  for (const name of ["a", "b"]) {
    f[name].forEach((row, r) =>
      row.forEach((_, c) => {
        const plus = { a: structuredClone(f.a), b: structuredClone(f.b) },
          minus = structuredClone(plus);
        plus[name][r][c] += epsilon;
        minus[name][r][c] -= epsilon;
        const numerical =
          (adapterForward(plus.a, plus.b).loss -
            adapterForward(minus.a, minus.b).loss) /
          (2 * epsilon);
        close(numerical, f[name === "a" ? "gradA" : "gradB"][r][c], 1e-7);
      }),
    );
  }
});
test("group-relative teaching probabilities conserve mass and reward ordering", () => {
  for (const efficiency of [false, true])
    for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
      const p = relativePolicy(progress, efficiency);
      close(
        p.probability.reduce((s, v) => s + v, 0),
        1,
      );
      close(
        p.advantage.reduce((s, v) => s + v, 0),
        0,
      );
      assert.ok(p.probability.every((v) => v > 0 && v < 0.5));
      if (!progress) assert.deepEqual(p.probability, [0.25, 0.25, 0.25, 0.25]);
      else assert.ok(p.probability[1] > p.probability[0]);
      if (efficiency && progress)
        assert.ok(p.probability[3] > p.probability[1]);
    }
});
test("figure stories cover all views with valid, inspectable run states", () => {
  for (const [training, beats] of [
    [false, INFERENCE_FIGURE_STORY],
    [true, TRAINING_FIGURE_STORY],
  ]) {
    assert.deepEqual([...new Set(beats.map((b) => b.view))].sort(), [0, 1, 2]);
    for (const b of beats) {
      const r = training
        ? simulateLab(b.policy, b.budget)
        : labComposition(b.workload, b.budget)[b.policy];
      assert.ok(r.correctCost > 0 && r.accuracy >= 0 && r.accuracy <= 100);
      assert.ok(b.mechanism && b.behavior && b.focus);
    }
  }
});
test("narrated inference execution move conserves quality and workload", () => {
  const [a, b] = INFERENCE_FIGURE_STORY;
  assert.equal(a.workload, b.workload);
  assert.equal(a.budget, b.budget);
  const points = labComposition(a.workload, a.budget);
  assert.equal(points[a.policy].accuracy, points[b.policy].accuracy);
  assert.ok(points[b.policy].correctCost < points[a.policy].correctCost);
});
test("narrated extra-thought transition freezes the policy", () => {
  const [a, b] = TRAINING_FIGURE_STORY.slice(3, 5);
  assert.equal(a.policy, b.policy);
  assert.equal(a.workload, b.workload);
  assert.equal(a.budget, 1);
  assert.equal(b.budget, 4);
  assert.ok(
    simulateLab(a.policy, b.budget).meanCost >
      simulateLab(a.policy, a.budget).meanCost,
  );
});
