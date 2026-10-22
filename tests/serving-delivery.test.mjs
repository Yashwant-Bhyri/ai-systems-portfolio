import test from "node:test";
import assert from "node:assert/strict";
import {
  deliveryStudy,
  deliveryFrame,
  DELIVERY_EXAMPLE,
} from "../app/compute/serving-delivery-model.ts";
import { servingOverviewFrame } from "../app/compute/serving-load-overview-model.ts";

test("worked example keeps arrivals, cancellations and completions separate", () => {
  const study = deliveryStudy({ firstTokenMs: 100, maxGapMs: 60 });
  assert.equal(study.offered, 5);
  assert.equal(study.completed, 4);
  assert.equal(study.qualified, 1);
  assert.equal(study.horizonMs, 500);
  assert.equal(study.completionRate, 8);
  assert.equal(study.qualifiedRate, 2);
  assert.deepEqual(
    study.requests.filter((r) => r.qualified).map((r) => r.id),
    ["R1"],
  );
  assert.ok(study.evidence.includes("separate worked example"));
});

test("first token uses arrival, while max ITL uses adjacent output tokens", () => {
  const [r1, r2, r3] = deliveryStudy({
    firstTokenMs: 100,
    maxGapMs: 60,
  }).requests;
  assert.equal(r1.firstToken, 40);
  assert.equal(r1.longestGap.ms, 20);
  assert.equal(r2.firstToken, 160);
  assert.equal(r2.firstPass, false);
  assert.equal(r2.gapPass, true);
  assert.deepEqual(r3.longestGap, { start: 60, end: 160, ms: 100 });
  assert.equal(r3.firstPass, true);
  assert.equal(r3.gapPass, false);
});

for (const firstTokenMs of [100, 180])
  for (const maxGapMs of [60, 120]) {
    test(`independent targets ${firstTokenMs}/${maxGapMs} change qualification, never the trace`, () => {
      const before = JSON.stringify(DELIVERY_EXAMPLE);
      const s = deliveryStudy({ firstTokenMs, maxGapMs });
      assert.equal(
        s.qualified,
        1 + Number(firstTokenMs === 180) + Number(maxGapMs === 120),
      );
      assert.equal(s.completed, 4);
      assert.equal(s.qualifiedRate, s.qualified / 0.5);
      for (const [i, r] of s.requests.entries()) {
        assert.deepEqual(r.tokens, DELIVERY_EXAMPLE[i].tokens);
        assert.equal(r.completeMs, DELIVERY_EXAMPLE[i].completeMs);
        assert.equal(r.valid, DELIVERY_EXAMPLE[i].valid);
        assert.equal(
          r.qualified,
          r.completed && r.firstPass && r.gapPass && r.qualityPass,
        );
      }
      const invalid = s.requests[3],
        cancelled = s.requests[4];
      assert.equal(invalid.qualified, false);
      assert.equal(invalid.qualityPass, false);
      assert.equal(cancelled.qualified, false);
      assert.equal(cancelled.firstToken, null);
      assert.equal(cancelled.longestGap, null);
      assert.equal(JSON.stringify(DELIVERY_EXAMPLE), before);
    });
  }

test("unsupported target inputs are rejected", () => {
  assert.throws(
    () => deliveryStudy({ firstTokenMs: 0, maxGapMs: 60 }),
    RangeError,
  );
  assert.throws(
    () => deliveryStudy({ firstTokenMs: 100, maxGapMs: NaN }),
    RangeError,
  );
});

test("the original cohort closes before switching to the separately labeled example", () => {
  const original = deliveryFrame(servingOverviewFrame(88500));
  assert.equal(original.lens, "completion");
  assert.deepEqual(original.storyCompleted, ["A", "B", "C"]);
  assert.deepEqual(original.storyCancelled, ["D"]);
  for (const [time, lens] of [
    [89300, "first"],
    [90500, "gap"],
    [91800, "validity"],
    [93200, "qualified"],
  ]) {
    const f = deliveryFrame(servingOverviewFrame(time));
    assert.equal(f.lens, lens);
    assert.equal(f.reveal, 1);
    assert.deepEqual(f.storyCompleted, original.storyCompleted);
    assert.deepEqual(f.storyCancelled, original.storyCancelled);
  }
});

test("delivery direction is reversible and target-independent", () => {
  for (let t = 88000; t <= 94000; t += 37) {
    const raw = servingOverviewFrame(t),
      before = JSON.stringify(raw),
      f = deliveryFrame(raw);
    deliveryFrame(servingOverviewFrame(94000));
    deliveryStudy({ firstTokenMs: 180, maxGapMs: 120 });
    assert.deepEqual(deliveryFrame(raw), f);
    assert.equal(JSON.stringify(raw), before);
    assert.ok(f.reveal >= 0 && f.reveal <= 1);
  }
});
