import test from "node:test";
import assert from "node:assert/strict";
import {
  fusionFixture,
  hardwareFrame,
  pipelineFixture,
  quantizationFixture,
  roundEven,
  tensorFixture,
} from "../app/compute/serving-hardware-model.ts";

test("fusion keeps output values while removing one intermediate write and read", () => {
  const f = fusionFixture();
  assert.deepEqual(f.intermediate, [-1, -0.25, 0.75, 1.5]);
  assert.deepEqual(f.output, [0, 0, 0.75, 1.5]);
  assert.deepEqual(
    f.output,
    f.input.map((x) => Math.max(0, x + 0.25)),
  );
  assert.equal(f.baseline.reads + f.baseline.writes, 64);
  assert.equal(f.fused.reads + f.fused.writes, 32);
  assert.equal(f.avoidedBytes, f.input.length * 4 * 2);
  assert.equal(f.baseline.launches - f.fused.launches, 1);
});

test("quantization rounds positive and negative ties to even", () => {
  assert.deepEqual(
    [0.5, 1.5, 2.5, -0.5, -1.5, -2.5].map(roundEven),
    [0, 2, 2, 0, -2, -2],
  );
  assert.equal(roundEven(-1.51), -2);
  assert.equal(roundEven(-1.49), -1);
  assert.throws(() => quantizationFixture(16), RangeError);
});

for (const bits of [4, 8]) {
  test(`INT${bits}: packed payload includes scale and reports reconstruction error`, () => {
    const f = quantizationFixture(bits);
    assert.equal(f.sourceBytes, 64);
    assert.equal(f.payloadBytes, bits * 2);
    assert.equal(f.scaleBytes, 4);
    assert.equal(f.totalBytes, bits * 2 + 4);
    assert.equal(Math.fround(f.scale), f.scale);
    assert.ok(f.maxError > 0);
    assert.ok(f.maxError <= f.scale / 2 + 1e-7);
    f.quantized.forEach((q, i) => {
      assert.ok(Number.isInteger(q));
      assert.ok(q >= -f.limit && q <= f.limit);
      assert.equal(f.reconstructed[i], q * f.scale);
      assert.equal(f.error[i], f.reconstructed[i] - f.weights[i]);
    });
    assert.notEqual(f.dot, f.reconstructedDot);
    assert.ok(Math.abs(f.dot - -0.2775) < 1e-10);
    assert.equal(
      f.reconstructedDot,
      f.reconstructed
        .slice(0, 4)
        .reduce((sum, w, i) => sum + w * [1, -0.5, 0.75, 0.25][i], 0),
    );
  });
}

test("more precision improves this fixture, not an inferred benchmark score", () => {
  assert.ok(quantizationFixture(4).maxError > quantizationFixture(8).maxError);
  assert.ok(
    quantizationFixture(4).totalBytes < quantizationFixture(8).totalBytes,
  );
});

test("tensor shards reduce to the unpartitioned dot product", () => {
  const f = tensorFixture();
  assert.deepEqual(f.partials, [4, -1]);
  assert.equal(f.output, 3);
  assert.equal(
    f.output,
    f.weights.reduce((sum, w, i) => sum + w * f.input[i], 0),
  );
});

test("pipeline preserves request order, layer order, fill and drain bubbles", () => {
  const f = pipelineFixture();
  assert.deepEqual(f.cells, [
    [1, 2, 3, null, null],
    [null, 1, 2, 3, null],
    [null, null, 1, 2, 3],
  ]);
  assert.equal(f.busy, 9);
  assert.equal(f.bubbles, 6);
  assert.equal(f.busy + f.bubbles, f.stages * f.slots);
  for (let r = 1; r <= f.requests; r++) {
    f.cells.forEach((row, stage) =>
      assert.equal(row.indexOf(r), r - 1 + stage),
    );
  }
});

test("one presentation clock controls close-ups and remains reversible", () => {
  assert.throws(() => hardwareFrame(NaN), RangeError);
  assert.throws(() => hardwareFrame(Infinity), RangeError);
  assert.equal(hardwareFrame(-100).fusion, 0);
  assert.equal(hardwareFrame(43000).fusion, 1);
  assert.equal(hardwareFrame(43000).precision, 0);
  assert.equal(hardwareFrame(56000).precision, 1);
  assert.equal(hardwareFrame(61999).topology, "replicas");
  assert.equal(hardwareFrame(62000).topology, "tensor");
  assert.equal(hardwareFrame(69000).topology, "pipeline");
  assert.equal(hardwareFrame(88000).lifecycle, 1);
  for (const t of [
    0, 30000, 34000, 43000, 51000, 56000, 62000, 69000, 78000, 82300, 94000,
  ]) {
    const before = hardwareFrame(t);
    hardwareFrame(94000);
    assert.deepEqual(hardwareFrame(t), before);
    for (const key of ["fusion", "precision", "placement", "lifecycle"])
      assert.ok(before[key] >= 0 && before[key] <= 1);
  }
});

test("manual topology inspection settles independently of the authored tour", () => {
  for (const topology of ["replicas", "tensor", "pipeline", "moe"]) {
    assert.equal(hardwareFrame(56000, topology).topology, topology);
    assert.equal(hardwareFrame(56000, topology).placement, 1);
  }
  assert.equal(hardwareFrame(56000).placement, 0);
});
