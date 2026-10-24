import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";
import { simulateLab } from "../app/compute/lab-simulation.ts";
import { readFileSync } from "node:fs";

registerHooks({
  resolve(specifier, context, next) {
    if (
      specifier.startsWith("./") &&
      !specifier.endsWith(".ts") &&
      context.parentURL?.includes("/app/compute/")
    )
      return next(`${specifier}.ts`, context);
    return next(specifier, context);
  },
});
const { baselineStudy, baselineFrame, BASELINE_DURATION, BASELINE_MOMENTS } =
  await import("../app/compute/baseline-study.ts");
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
for (const workload of ["shared-prefix", "interactive"]) {
  const run = simulateLab(2, 2, false, workload, {
    scheduler: "barrier",
    reuse: false,
    fastKernels: false,
  });
  const study = baselineStudy(run),
    q = study.request;
  test(`${workload}: opening preserves request identity, schedule and original workload`, () => {
    assert.equal(q, run.tasks[6]);
    assert.deepEqual(study.tasks, run.tasks.slice(0, 8));
    assert.equal(study.cohortSize, 96);
    assert.equal(study.shared, workload === "shared-prefix");
    assert.ok(study.tasks.every((t) => !t.cacheHit));
  });
  test(`${workload}: idle-worker hold has arrived work waiting, never active execution`, () => {
    const { time, state, beat } = baselineFrame(7800, study);
    assert.equal(beat, 1);
    assert.ok(state.waiting.includes(q));
    assert.ok(!state.active.some((t) => t.worker === study.gap.worker));
    assert.ok(time > study.gap.start && time < study.gap.finish);
  });
  test(`${workload}: cursor is monotone and conserved, scrubbing reconstructs the same state`, () => {
    let previous = -1;
    for (let ms = 0; ms <= BASELINE_DURATION; ms += 37) {
      const f = baselineFrame(ms, study);
      assert.ok(f.time >= previous);
      previous = f.time;
      assert.equal(
        f.state.active.length +
          f.state.waiting.length +
          f.state.done.length +
          f.state.future.length,
        8,
      );
      assert.ok(f.state.active.length <= 2);
      assert.equal(
        new Set(f.state.active.map((t) => t.worker)).size,
        f.state.active.length,
      );
      close(f.wait + f.prefill + f.decode, f.elapsed);
      close(f.prefill + f.decode, f.busy);
      close(f.elapsed, Math.max(0, Math.min(q.latency, f.time - q.arrival)));
      assert.ok(
        Number.isInteger(f.tokens) && f.tokens >= 0 && f.tokens <= q.tokens,
      );
      if (f.time <= q.start + q.prefill) assert.equal(f.tokens, 0);
    }
    const f = baselineFrame(7800, study);
    baselineFrame(BASELINE_DURATION, study);
    assert.deepEqual(baselineFrame(7800, study), f);
  });
  test(`${workload}: input and completed answer have three-second holds with exact endpoint accounting`, () => {
    for (const ms of [14000, 15000, 16999]) {
      const f = baselineFrame(ms, study);
      close(f.prefill, q.prefill);
      close(f.time, q.start + q.prefill);
      close(f.decode, 0);
      assert.equal(f.beat, 2);
    }
    for (const ms of [21000, 23999, BASELINE_DURATION]) {
      const f = baselineFrame(ms, study);
      close(f.time, q.finish);
      close(f.elapsed, q.latency);
      close(f.busy, q.gpuSeconds);
      close(f.wait, q.queueSeconds);
      assert.equal(f.tokens, q.tokens);
      assert.ok(f.state.done.includes(q));
    }
    assert.deepEqual(
      BASELINE_MOMENTS.map((ms) => baselineFrame(ms, study).beat),
      [0, 1, 2, 3, 4],
    );
  });
}
test("opening rejects a changed runtime instead of mislabelling it baseline", () => {
  assert.throws(() => baselineStudy(simulateLab(2, 2, true)), /baseline/);
});
test("opening has its own chapter duration, lazy boundary, named controls and no default cohort sidebar", () => {
  const parent = readFileSync(
    new URL("../app/compute/lab-story.tsx", import.meta.url),
    "utf8",
  );
  const scene = readFileSync(
    new URL("../app/compute/baseline-reveal.tsx", import.meta.url),
    "utf8",
  );
  const css = readFileSync(
    new URL("../app/compute/baseline-reveal.css", import.meta.url),
    "utf8",
  );
  assert.match(parent, /BASELINE_DURATION,\s*SCHEDULING_DURATION/);
  assert.match(parent, /const BaselineReveal = lazy/);
  assert.match(scene, /Scrub baseline introduction/);
  assert.match(scene, /onChapter\(item.chapter\)/);
  assert.match(scene, /data-bo-source/);
  assert.match(scene, /data-bo-target/);
  assert.match(css, /data-feature="baseline".*> \.ls-outcomes/);
  assert.match(css, /prefers-reduced-motion/);
});
