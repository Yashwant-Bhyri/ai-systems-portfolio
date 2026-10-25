import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  INFERENCE_GATE,
  INTEGRITY_GATE,
  FRONTIER_CONDITIONS,
  CHECKPOINT_LADDER,
  REQUIRED_RUN_FIELDS,
  STATUS_DEFINITIONS,
} from "../app/compute/study-contracts.ts";
import {
  COMPUTE_PROJECTS,
  INFERENCE_STEPS,
  TRAINING_STEPS,
  TRAINING_PROOF,
} from "../app/compute-projects.ts";
import {
  MIMO_BENCHMARKS,
  MIMO_CHECKPOINTS,
  SGLANG_REFERENCE,
  mimoEvidence,
} from "../app/compute/study-data.ts";
import {
  costPerCorrect,
  paretoFrontier,
  reductionPercent,
  normalizedAuc,
} from "../app/compute/study-math.ts";
import {
  BUDGETS,
  POLICIES,
  TASKS,
  LAB_ASSUMPTIONS,
  compareTasks,
  labComposition,
  simulateLab,
} from "../app/compute/lab-simulation.ts";

test("composition keeps checkpoint and execution as independent factors", () => {
  assert.deepEqual(FRONTIER_CONDITIONS, [
    "Base / Static",
    "Base / Optimized",
    "Post-trained / Static",
    "Post-trained / Optimized",
  ]);
  assert.equal(CHECKPOINT_LADDER.at(-1), "Efficiency-aware RLVR");
  assert.equal(INFERENCE_GATE.length, 7);
  assert.equal(INTEGRITY_GATE.length, 5);
});
test("all sixteen mechanisms have an explicit illustrative evidence status", () => {
  assert.equal(INFERENCE_STEPS.length + TRAINING_STEPS.length, 16);
  for (const step of [...INFERENCE_STEPS, ...TRAINING_STEPS])
    assert.equal(step.maturity, "ILLUSTRATIVE");
  assert.deepEqual(Object.keys(STATUS_DEFINITIONS), [
    "implemented",
    "profiled",
    "measured",
    "planned",
    "illustrative",
  ]);
});
test("unverified percentage claims cannot appear as headline or conclusion proof", () => {
  assert.doesNotMatch(JSON.stringify(COMPUTE_PROJECTS), /\+(27|31|46)%/);
  assert.doesNotMatch(JSON.stringify(TRAINING_PROOF), /\+(27|31|46)%/);
  assert.equal(REQUIRED_RUN_FIELDS.length, 13);
  assert.ok(
    REQUIRED_RUN_FIELDS.some(([name]) => name === "Raw result artifact"),
  );
  assert.ok(
    REQUIRED_RUN_FIELDS.some(
      ([name]) => name === "Verifier / correctness oracle",
    ),
  );
});
test("six linked result views declare their synthetic evidence boundary", async () => {
  const source = await readFile(
    new URL("../app/compute/lab-results.tsx", import.meta.url),
    "utf8",
  );
  for (const name of [
    "Policy × runtime",
    "Execution replay",
    "Queue & latency",
    "Capability map",
    "Compute curves",
    "Regression audit",
  ])
    assert.ok(source.includes(name));
  // The page carries no disclaimer banner; the boundary lives in the scenario record.
  // Modules are reached from the laboratory's module bar.
  assert.match(source, /<ModuleBar/);
  assert.match(source, /Illustrative, not measured/);
  assert.match(source, /Real Qwen3-4B runs/);
  assert.match(source, /No physical GPU or LLM run/);
  assert.match(source, /onInspect=\{playback.pause\}/);
  assert.match(source, /Download synthetic run JSON/);
  assert.match(source, /type="range"/);
  assert.match(
    JSON.stringify(LAB_ASSUMPTIONS),
    /not calibrated hardware measurements/,
  );
});
test("MiMo transcription preserves Table 5 values and branching lineage", () => {
  assert.deepEqual(MIMO_BENCHMARKS[0].scores, [32.9, 58.7, 56.4, 68.2]);
  assert.deepEqual(MIMO_BENCHMARKS[1].scores, [24.3, 44.3, 46.3, 55.4]);
  assert.deepEqual(MIMO_BENCHMARKS[2].scores, [32.9, 52.3, 49.1, 57.8]);
  assert.deepEqual(
    MIMO_CHECKPOINTS.map((p) => p.parent),
    [null, 0, 0, 1],
  );
  assert.ok(
    mimoEvidence(3, 0).some(([, value]) =>
      value.includes("not matched actual compute"),
    ),
  );
});
test("runtime ratios preserve published measurements without inventing correctness", () => {
  assert.deepEqual(SGLANG_REFERENCE.throughput, [82665, 158596]);
  assert.deepEqual(SGLANG_REFERENCE.cacheHit, [20, 75]);
  const ratio = 82665 / 158596;
  assert.ok(Math.abs(ratio - 0.52123) < 0.00001);
  assert.ok(Math.abs(reductionPercent(1, ratio) - 47.877) < 0.001);
});
test("cost accounting is denominator-aware and rejects undefined results", () => {
  assert.equal(costPerCorrect(1000, 50), 20);
  assert.equal(costPerCorrect(0, 50), 0);
  for (const pair of [
    [100, 0],
    [100, -1],
    [-1, 20],
    [NaN, 1],
    [1, Infinity],
  ])
    assert.equal(costPerCorrect(...pair), null);
});
test("all 64 synthetic conditions conserve aggregates and deterministic task identities", () => {
  assert.equal(TASKS.length, 96);
  for (let policy = 0; policy < POLICIES.length; policy++)
    for (const budget of BUDGETS)
      for (const workload of ["interactive", "shared-prefix"])
        for (const optimized of [false, true]) {
          const r = simulateLab(policy, budget, optimized, workload);
          assert.deepEqual(r, simulateLab(policy, budget, optimized, workload));
          assert.deepEqual(
            r.tasks.map((t) => t.id),
            Array.from({ length: 96 }, (_, i) => i),
          );
          assert.equal(r.correct, r.tasks.filter((t) => t.correct).length);
          assert.ok(
            Math.abs(
              r.gpuSeconds -
                r.tasks.reduce((s, t) => s + t.prefill + t.decode, 0),
            ) < 1e-9,
          );
          assert.equal(
            r.tokens,
            r.tasks.reduce((s, t) => s + t.tokens, 0),
          );
          assert.equal(r.accuracy, (r.correct / 96) * 100);
          assert.equal(r.correctCost, r.gpuSeconds / r.correct);
          assert.equal(r.status, "illustrative");
          const workerFinish = [0, 0];
          const prefixReady = new Map();
          for (const t of r.tasks) {
            assert.ok(t.start >= workerFinish[t.worker]);
            assert.equal(t.queueSeconds, t.start - t.arrival);
            assert.equal(
              t.computedInputTokens,
              t.cacheHit ? 384 : t.inputTokens,
            );
            if (t.cacheHit)
              assert.ok(prefixReady.get(TASKS[t.id].prefixGroup) <= t.start);
            if (!t.cacheHit)
              prefixReady.set(
                TASKS[t.id].prefixGroup,
                Math.min(
                  prefixReady.get(TASKS[t.id].prefixGroup) ?? Infinity,
                  t.start + t.prefill,
                ),
              );
            workerFinish[t.worker] = t.finish;
          }
          assert.ok(
            r.tasks.every((t) => t.start >= t.arrival && t.finish >= t.start),
          );
          assert.ok(
            r.tasks.every(
              (t) => Math.abs(t.latency - (t.finish - t.arrival)) < 1e-9,
            ),
          );
          assert.equal(
            r.p95,
            r.tasks.map((t) => t.latency).sort((a, b) => a - b)[91],
          );
        }
  assert.throws(() => simulateLab(-1, 2), RangeError);
  assert.throws(() => simulateLab(2, 3), RangeError);
  assert.throws(() => simulateLab(2, NaN), RangeError);
});
test("runtime pairs preserve cognition, account for warm-up, and reduce work", () => {
  for (let policy = 0; policy < 4; policy++)
    for (const budget of BUDGETS)
      for (const workload of ["interactive", "shared-prefix"]) {
        const a = simulateLab(policy, budget, false, workload),
          b = simulateLab(policy, budget, true, workload);
        assert.deepEqual(
          a.tasks.map((t) => [t.id, t.correct, t.tokens, t.arrival]),
          b.tasks.map((t) => [t.id, t.correct, t.tokens, t.arrival]),
        );
        assert.equal(a.correct, b.correct);
        assert.ok(b.correctCost < a.correctCost);
        assert.ok(b.p95 < a.p95);
        assert.equal(
          b.tasks.filter((t) => t.cacheHit).length,
          workload === "shared-prefix" ? 90 : 0,
        );
        assert.ok(b.tasks.slice(0, 6).every((t) => !t.cacheHit));
        assert.ok(a.tasks.every((t) => !t.cacheHit));
      }
});
test("paired flips reconcile net changes across all checkpoint/budget conditions", () => {
  for (const budget of BUDGETS)
    for (let p = 0; p < 4; p++) {
      const a = simulateLab(0, budget),
        b = simulateLab(p, budget),
        flips = compareTasks(a, b);
      assert.equal(
        flips.gained.length - flips.lost.length,
        b.correct - a.correct,
      );
      assert.ok(flips.gained.every((id) => !flips.lost.includes(id)));
    }
  const pair = compareTasks(simulateLab(0, 2), simulateLab(2, 2));
  assert.equal(pair.gained.length, 26);
  assert.equal(pair.lost.length, 2);
});
test("composition is the same data model as the checkpoint lab, not pasted scores", () => {
  for (const budget of BUDGETS)
    for (const workload of ["interactive", "shared-prefix"]) {
      const p = labComposition(workload, budget);
      assert.deepEqual(
        p.map((q) => q.label),
        FRONTIER_CONDITIONS,
      );
      assert.equal(p[0].accuracy, p[1].accuracy);
      assert.equal(p[2].accuracy, p[3].accuracy);
      assert.equal(p[2].accuracy, simulateLab(2, budget).accuracy);
      for (const q of p)
        assert.ok(
          Math.abs(q.correctCost - q.taskCost / (q.accuracy / 100)) < 1e-10,
        );
    }
});
test("Pareto changes between a trade-off and a single dominating point", () => {
  const tradeoff = paretoFrontier(labComposition("shared-prefix", 2));
  assert.deepEqual(
    tradeoff.map((p) => p.id),
    ["base-optimized", "trained-optimized"],
  );
  const dominant = paretoFrontier([
    { id: "base", accuracy: 40, correctCost: 20 },
    { id: "trained-optimized", accuracy: 60, correctCost: 15 },
  ]);
  assert.deepEqual(
    dominant.map((p) => p.id),
    ["trained-optimized"],
  );
  const duplicate = [
    { accuracy: 50, correctCost: 10 },
    { accuracy: 50, correctCost: 10 },
  ];
  assert.equal(paretoFrontier(duplicate).length, 2);
});
test("s1 research fixture reconciles pinned raw samples and remains separate from the simulator", async () => {
  const fixture = JSON.parse(
    await readFile(
      new URL("../app/compute/s1-reference.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(fixture.runs.length, 6);
  assert.deepEqual(
    fixture.runs.map((r) => r.correct),
    [4, 9, 13, 15, 17, 17],
  );
  for (const r of fixture.runs) {
    assert.equal(r.samples.length, 30);
    assert.deepEqual(
      r.samples.map((t) => t.docId),
      Array.from({ length: 30 }, (_, i) => i),
    );
    assert.equal(
      r.samples.reduce((s, t) => s + t.correct, 0),
      r.correct,
    );
    assert.equal(
      r.samples.reduce((s, t) => s + t.thinkingTokens, 0),
      r.thinkingTokensSum,
    );
    assert.ok(r.artifact.includes(fixture.datasetRevision));
  }
  const simulator = await readFile(
    new URL("../app/compute/lab-simulation.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(simulator, /^import /m);
});
test("AUC uses actual unequal x intervals, not nominal budget weighting", () => {
  assert.equal(
    normalizedAuc([
      { cost: 1, accuracy: 20 },
      { cost: 2, accuracy: 40 },
      { cost: 8, accuracy: 60 },
    ]),
    330 / 7,
  );
  assert.equal(normalizedAuc([{ cost: 1, accuracy: 20 }]), null);
  assert.equal(
    normalizedAuc([
      { cost: 1, accuracy: 20 },
      { cost: 1, accuracy: 30 },
    ]),
    null,
  );
});
