import test from "node:test";
import assert from "node:assert/strict";
import {
  adapterDirection,
  ADAPTER_DURATION,
  ADAPTER_MOMENTS,
} from "../app/compute/adapter-study.ts";
import {
  adapterOutput,
  adapterSnapshots,
  adapterFrame,
  adapterRecord,
  adapterForward,
  TOY_W,
  TOY_X,
} from "../app/compute/policy-film-math.ts";
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-10, `${a} != ${b}`);

test("adapter direction has four real updates, held comparisons and a separate language example", () => {
  assert.deepEqual(
    ADAPTER_MOMENTS.map((t) => adapterDirection(t).beat),
    [0, 1, 2, 3, 4],
  );
  assert.deepEqual(
    [2500, 8500, 12500, 15000, 17500, 21500, 32000].map(
      (t) => adapterDirection(t).position,
    ),
    [0, 1, 2, 3, 4, 4, 4],
  );
  assert.equal(adapterDirection(17999).comparison, 0);
  assert.equal(adapterDirection(21500).comparison, 1);
  assert.equal(adapterDirection(23999).example, 0);
  assert.equal(adapterDirection(30000).example, 1);
  assert.equal(adapterDirection(30000).targetProgress, 1);
  assert.deepEqual(adapterDirection(Infinity), adapterDirection(0));
  assert.equal(adapterDirection(-1000).time, 0);
  assert.equal(
    adapterDirection(ADAPTER_DURATION + 1000).time,
    ADAPTER_DURATION,
  );
});
test("all linked outputs reconcile with frozen W and both rank-channel contributions", () => {
  const original = structuredClone(TOY_W);
  for (let t = 0; t <= ADAPTER_DURATION; t += 127) {
    const position = adapterDirection(t).position;
    for (let r = 0; r < 6; r++) {
      const v = adapterOutput(position, r);
      close(
        v.base,
        TOY_W[r].reduce((s, w, i) => s + w * TOY_X[i], 0),
      );
      close(v.adapted, v.base + v.terms.reduce((s, n) => s + n, 0));
      close(v.afterError, Math.abs(v.adapted - v.target));
      close(v.frame.loss, v.frame.error.reduce((s, n) => s + n * n, 0) / 2);
    }
  }
  assert.deepEqual(TOY_W, original);
});
test("first update changes B only; later updates change both factors", () => {
  const frames = adapterSnapshots();
  assert.deepEqual(frames[0].a, frames[1].a);
  assert.notDeepEqual(frames[0].b, frames[1].b);
  assert.notDeepEqual(frames[1].a, frames[2].a);
  assert.notDeepEqual(frames[1].b, frames[2].b);
  for (let r = 0; r < 6; r++) {
    const end = adapterOutput(4, r);
    assert.ok(end.afterError < end.beforeError);
    assert.ok(
      end.afterError > 0,
      "Do not depict complete learning after four updates",
    );
  }
});
test("seeking backwards reconstructs the exact same parameter state", () => {
  const before = adapterOutput(adapterDirection(6100).position, 2);
  adapterOutput(adapterDirection(30000).position, 5);
  assert.deepEqual(adapterOutput(adapterDirection(6100).position, 2), before);
  assert.deepEqual(adapterFrame(NaN), adapterFrame(0));
  for (const row of [-1, 6, NaN, 0.5])
    assert.throws(() => adapterOutput(2, row), RangeError);
});

test("export describes the selected calculation, not a substituted cohort result", () => {
  const direction = adapterDirection(6100);
  const record = adapterRecord(direction.position, 4, direction.time);
  assert.equal(record.presentationMs, 6100);
  assert.equal(record.selectedOutput, 5);
  assert.equal(record.optimizerSteps.length, 5);
  assert.deepEqual(record.current, adapterOutput(direction.position, 4));
  assert.deepEqual(record.frozenWeights, TOY_W);
  assert.match(record.evidence, /not a model checkpoint/);
  assert.ok(record.limits.some((text) => text.includes("96-task")));
  assert.deepEqual(
    JSON.parse(JSON.stringify(record)).current.terms,
    record.current.terms,
  );
});

test("fractional-frame gradients describe those exact displayed factors", () => {
  const frame = adapterFrame(2.35),
    epsilon = 1e-5;
  for (const name of ["a", "b"]) {
    frame[name].forEach((row, r) =>
      row.forEach((_, c) => {
        const plus = {
          a: structuredClone(frame.a),
          b: structuredClone(frame.b),
        };
        const minus = structuredClone(plus);
        plus[name][r][c] += epsilon;
        minus[name][r][c] -= epsilon;
        const numerical =
          (adapterForward(plus.a, plus.b).loss -
            adapterForward(minus.a, minus.b).loss) /
          (2 * epsilon);
        assert.ok(
          Math.abs(numerical - frame[name === "a" ? "gradA" : "gradB"][r][c]) <
            1e-7,
        );
      }),
    );
  }
});
