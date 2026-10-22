import assert from "node:assert/strict";
import test from "node:test";
import { simulateLab } from "../app/compute/lab-simulation.ts";
import {
  traceAt,
  decodeAt,
  clamp01,
  windowProgress,
} from "../app/compute/inference-film-math.ts";
import {
  adapterFrame,
  adapterForward,
  adapterSnapshots,
  TOY_W,
} from "../app/compute/policy-film-math.ts";
import { PlaybackClock } from "../app/compute/playback-clock.ts";

test("the cinematic trace derives every state from real scenario timestamps", () => {
  const run = simulateLab(2, 2, false, "shared-prefix", {
    scheduler: "continuous",
    reuse: false,
    fastKernels: false,
  });
  for (const time of [0, 2, 10, 25.67, 40, 80]) {
    for (const t of traceAt(run, time)) {
      assert.equal(
        t.state,
        time >= t.finish
          ? "done"
          : time >= t.start
            ? "running"
            : time >= t.arrival
              ? "waiting"
              : "future",
      );
      assert.ok(t.progress >= 0 && t.progress <= 1);
      assert.ok(t.worked >= 0 && t.worked <= t.gpuSeconds);
      assert.ok(Math.abs(t.worked - t.progress * t.gpuSeconds) < 1e-8);
    }
  }
  const final = traceAt(run, 1000);
  assert.equal(final.filter((t) => t.state === "done").length, 6);
  assert.ok(final.every((t) => t.progress === 1));
});

test("token replay keeps the workload and charges prefill before decoding", () => {
  const a = simulateLab(2, 2, false, "shared-prefix");
  const b = simulateLab(2, 2, true, "shared-prefix");
  for (const t of a.tasks) {
    const fast = b.tasks[t.id];
    assert.equal(t.tokens, fast.tokens);
    assert.equal(decodeAt(t, 0), 0);
    assert.equal(decodeAt(t, t.prefill), 0);
    assert.equal(decodeAt(t, t.gpuSeconds + 1), t.tokens);
    for (const time of [1, 5, 10, 20]) {
      assert.ok(decodeAt(fast, time) >= decodeAt(t, time));
      assert.ok(decodeAt(fast, time) <= t.tokens);
    }
  }
});

test("interpolated LoRA frames retain an exact W + BA product", () => {
  const original = structuredClone(TOY_W);
  for (const position of [0, 0.1, 0.8, 1, 1.4, 2.9, 3.5, 4]) {
    const frame = adapterFrame(position),
      exact = adapterForward(frame.a, frame.b);
    assert.deepEqual(frame.delta, exact.delta);
    assert.equal(frame.loss, exact.loss);
    assert.deepEqual(frame.output, exact.output);
  }
  for (const frame of adapterSnapshots()) {
    assert.deepEqual(adapterFrame(frame.step).a, frame.a);
    assert.deepEqual(adapterFrame(frame.step).b, frame.b);
  }
  assert.deepEqual(TOY_W, original);
});

test("film seeking and chapter advancement share the same remaining time", () => {
  const clock = new PlaybackClock();
  clock.configure("film", 12000);
  clock.resume(100);
  assert.equal(clock.elapsed(3100), 3000);
  clock.seek(8000);
  assert.equal(clock.elapsed(4000), 8000);
  assert.equal(clock.resume(5000), 4000);
  assert.equal(clock.elapsed(6500), 9500);
  clock.pause(6500);
  assert.equal(clock.elapsed(99000), 9500);
  assert.equal(clock.resume(100000), 2500);
  clock.seek(-100);
  assert.equal(clock.elapsed(100000), 0);
  clock.seek(999999);
  assert.equal(clock.elapsed(100000), 12000);
});

test("film windows remain bounded during scrubbing", () => {
  assert.equal(clamp01(-1), 0);
  assert.equal(clamp01(2), 1);
  assert.equal(windowProgress(0.1, 0.2, 0.8), 0);
  assert.ok(Math.abs(windowProgress(0.5, 0.2, 0.8) - 0.5) < 1e-8);
  assert.equal(windowProgress(0.9, 0.2, 0.8), 1);
});
