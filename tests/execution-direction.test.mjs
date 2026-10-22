import assert from "node:assert/strict";
import test from "node:test";
import {
  executionDirection,
  executionPresentationTime,
  EXECUTION_FILM_DURATION,
  EXECUTION_FILM_MOMENTS,
} from "../app/compute/execution-direction.ts";

test("authored execution holds one result while spotlighting baseline, optimized and difference", () => {
  for (const [start, modelTime] of [
    [18000, 18000],
    [33500, 25000],
    [57500, 35700],
  ]) {
    for (const [offset, focus] of [
      [1000, "baseline"],
      [4500, "optimized"],
      [8000, "difference"],
    ]) {
      assert.deepEqual(executionDirection(start + offset).focus, focus);
      assert.equal(executionDirection(start + offset).modelTime, modelTime);
    }
  }
});
test("execution film and origin zoom are bounded, monotone, seekable and deterministic", () => {
  let last = 0;
  for (let ms = 0; ms <= EXECUTION_FILM_DURATION; ms += 10) {
    const a = executionDirection(ms);
    assert.deepEqual(a, executionDirection(ms));
    assert.ok(a.modelTime >= last && a.modelTime <= 42000);
    assert.ok(a.origin >= 0 && a.origin <= 1);
    last = a.modelTime;
  }
  assert.equal(executionDirection(-1).modelTime, 0);
  assert.equal(executionDirection(Infinity).modelTime, 42000);
  assert.equal(executionDirection(44000).origin, 0);
  assert.equal(executionDirection(48500).origin, 1);
  assert.equal(executionDirection(48500).modelTime, 27200);
  assert.equal(EXECUTION_FILM_MOMENTS.length, 6);
});
test("manual compute and elapsed-time controls return to the moving trace exactly", () => {
  for (const [start, end] of [
    [20800, 25000],
    [27200, 35700],
    [37000, 37700],
  ]) {
    for (let t = start; t <= end; t += 10) {
      assert.ok(
        Math.abs(
          executionDirection(executionPresentationTime(t)).modelTime - t,
        ) < 1e-7,
        `round trip ${t}`,
      );
    }
  }
});
