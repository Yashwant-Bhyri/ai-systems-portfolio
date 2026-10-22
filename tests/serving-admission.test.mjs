import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { servingOverviewFrame } from "../app/compute/serving-load-overview-model.ts";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier === "./serving-load-overview-model" &&
      context.parentURL?.endsWith("/serving-admission-model.ts")
    )
      return nextResolve(`${specifier}.ts`, context);
    return nextResolve(specifier, context);
  },
});
const { servingAdmissionFrame } =
  await import("../app/compute/serving-admission-model.ts");
const at = (time) => servingAdmissionFrame(servingOverviewFrame(time));

test("opening uses the existing A stream without admitting the future B request", () => {
  for (const time of [0, 2000, 4199]) {
    const f = at(time);
    assert.equal(f.arrived, false);
    assert.equal(f.admitted, false);
    assert.equal(f.proposed, 0);
    assert.equal(f.tokenTotal, 1);
    assert.equal(f.occupied, 3);
    assert.equal(f.defaultFocus, "stream");
    assert.equal(
      f.delivered,
      servingOverviewFrame(time).requests.A.tokens.length,
    );
  }
});

test("whole input fits KV memory but exceeds the token budget", () => {
  for (const time of [4200, 5000, 6500, 7500, 8999]) {
    const f = at(time);
    assert.equal(f.arrived, true);
    assert.equal(f.admitted, false);
    assert.equal(f.tokenTotal, 8);
    assert.equal(f.tokenLimit, 6);
    assert.equal(f.tokenPass, false);
    assert.equal(f.memoryTotalAtAdmission, 7);
    assert.equal(f.memoryLimit, 8);
    assert.equal(f.memoryPass, true);
    assert.equal(f.occupied, 3, "proposed pages are not yet owned by B");
    assert.equal(f.defaultFocus, "tokens");
  }
});

test("chunking admits four input units and defers three without losing input", () => {
  const f = at(9000);
  assert.equal(f.admitted, true);
  assert.equal(f.tokenTotal, 5);
  assert.equal(f.tokenPass, true);
  assert.equal(f.proposed + f.deferredAtAdmission, 7);
  assert.equal(f.occupied, 7);
  assert.equal(f.inputFinished, false);
  assert.equal(f.defaultFocus, "tokens");
});

test("passing admission is distinct from a continuous output stream", () => {
  const before = at(11999),
    waiting = at(12500),
    resumed = at(13600);
  assert.equal(before.defaultFocus, "tokens");
  assert.equal(waiting.defaultFocus, "stream");
  assert.equal(waiting.tokenPass, true);
  assert.equal(waiting.memoryPass, true);
  assert.equal(waiting.paused, true);
  assert.equal(waiting.delivered, 3);
  assert.equal(resumed.paused, false);
  assert.equal(resumed.delivered, 4);
  assert.equal(resumed.inputFinished, false);
});

test("completed prefill and released pages do not masquerade as pending input", () => {
  assert.equal(at(14799).inputFinished, false);
  assert.equal(at(14800).inputFinished, true);
  const f = at(17500);
  assert.equal(f.finished, true);
  assert.equal(f.inputFinished, true);
  assert.equal(f.retained, 2);
  assert.equal(f.occupied, 5);
  assert.equal(f.defaultFocus, "memory");
  assert.equal(
    f.tokenTotal,
    5,
    "last admission snapshot is preserved, not current token use",
  );
  assert.equal(
    f.memoryTotalAtAdmission,
    7,
    "reservation snapshot is separate from current ownership",
  );
});

test("all visual reveals derive from the cursor and reverse without stale state", () => {
  for (let t = 0; t < 18000; t += 113) {
    const source = servingOverviewFrame(t);
    const serialized = JSON.stringify(source);
    const f = servingAdmissionFrame(source);
    at(17999);
    assert.deepEqual(at(t), f);
    assert.equal(JSON.stringify(source), serialized);
    for (const p of [
      f.arrivalReveal,
      f.chunkReveal,
      f.focusReveal,
      ...f.tokenReveals,
    ])
      assert.ok(p >= 0 && p <= 1);
    assert.ok(f.delivered <= 8);
    assert.ok(f.occupied <= f.memoryLimit);
  }
  assert.equal(at(4200).arrivalReveal, 0);
  assert.equal(at(4850).arrivalReveal, 1);
  assert.equal(at(9000).chunkReveal, 0);
  assert.equal(at(9650).chunkReveal, 1);
  assert.equal(at(13600).tokenReveals[3], 0);
  assert.equal(at(13980).tokenReveals[3], 1);
});

test("warm and cold routing branches have identical opening decisions", () => {
  for (const time of [0, 5000, 7500, 10000, 12500, 14500, 17500])
    assert.deepEqual(
      servingAdmissionFrame(servingOverviewFrame(time, "warm")),
      servingAdmissionFrame(servingOverviewFrame(time, "cold")),
    );
});

test("manual moments never strand the consequence connector mid-reveal", () => {
  for (const time of [5000, 7500, 10000, 12700, 14500, 17900])
    assert.equal(at(time).focusReveal, 1, `settled consequence at ${time}`);
  assert.equal(at(0).tokenReveals[0], 1, "A is already streaming at entry");
});
