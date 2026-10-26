import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";
import { STEP_OVERHEAD, bandwidth, kvBytesPerToken, prefillSeconds, weightBytes } from "../app/compute/calibration.ts";
// Expected costs come from the calibrated roofline itself, not from pinned constants.
const prefillOf = (input, computed, fast) => STEP_OVERHEAD + prefillSeconds(computed, input - computed, fast);
const decodeOf = (input, tokens, fast) => {
  const steps = Math.max(0, tokens - 1), kvb = kvBytesPerToken(fast), bw = bandwidth();
  return steps * (STEP_OVERHEAD + (weightBytes(fast) + (input + 1) * kvb) / bw) + ((kvb / bw) * steps * (steps - 1)) / 2;
};

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
const { inferenceStoryRuns } = await import("../app/compute/lab-story-data.ts");
const {
  runtimeGainsStudy,
  runtimeGainsFrame,
  RUNTIME_GAINS_DURATION,
  RUNTIME_GAINS_MOMENTS,
} = await import("../app/compute/runtime-gains-study.ts");
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
for (const workload of ["shared-prefix", "interactive"]) {
  const runs = inferenceStoryRuns(workload),
    study = runtimeGainsStudy(runs);
  test(`${workload}: runtime finale preserves request 7 and the whole cohort`, () => {
    study.requests.forEach((q, i) => assert.equal(q, runs[i].tasks[6]));
    assert.equal(study.n, 96);
    assert.equal(study.correct, runs[0].correct);
    assert.equal(study.hits, workload === "shared-prefix" ? 90 : 0);
  });
  test(`${workload}: scheduling savings stay out of GPU-cost contributions`, () => {
    assert.ok(study.requestWaitSaved > 0);
    close(study.cohort[0].total, study.cohort[1].total);
    close(study.savings[1], 0);
    close(study.savings[2] + study.savings[3], study.totalSaved);
    close(study.cohort[0].total - study.totalSaved, study.cohort[3].total);
  });
  test(`${workload}: all work, including unsuccessful requests, enters the numerator`, () => {
    study.cohort.forEach((row, i) => {
      close(row.prefill + row.decode, row.total);
      close(
        row.total,
        runs[i].tasks.reduce((s, t) => s + t.gpuSeconds, 0) / study.correct,
      );
      assert.ok(
        row.total >
          runs[i].tasks
            .filter((t) => t.correct)
            .reduce((s, t) => s + t.gpuSeconds, 0) /
            study.correct,
      );
    });
    close(study.cohort[1].decode, study.cohort[2].decode);
    close(study.requestReuseSaved, workload === "shared-prefix" ? prefillOf(8192, 8192, false) - prefillOf(8192, 384, false) : 0);
  });
  test(`${workload}: each intervention settles for four seconds before the next begins`, () => {
    for (const [i, start] of [
      [1, 7000],
      [2, 14000],
      [3, 21000],
    ]) {
      for (const ms of [start, start + 1500, start + 3999]) {
        const f = runtimeGainsFrame(ms, study),
          q = study.requests[i];
        assert.equal(f.beat, i);
        close(f.rows[i].queue, q.queueSeconds);
        close(f.rows[i].prefill, q.prefill);
        close(f.rows[i].decode, q.decode);
        close(f.progress[i], 1);
      }
    }
    assert.equal(runtimeGainsFrame(33499, study).beat, 5);
    close(runtimeGainsFrame(33500, study).combined, 1);
    close(runtimeGainsFrame(RUNTIME_GAINS_DURATION, study).combined, 1);
  });
  test(`${workload}: scrubbing reconstructs stable geometry and exact endpoints`, () => {
    assert.deepEqual(
      RUNTIME_GAINS_MOMENTS.map((t) => runtimeGainsFrame(t, study).beat),
      [0, 1, 2, 3, 4, 5],
    );
    const f = runtimeGainsFrame(12340, study);
    runtimeGainsFrame(RUNTIME_GAINS_DURATION, study);
    assert.deepEqual(runtimeGainsFrame(12340, study), f);
    for (let time = 0; time <= RUNTIME_GAINS_DURATION; time += 113) {
      const frame = runtimeGainsFrame(time, study);
      assert.ok(frame.cohortMix >= 0 && frame.cohortMix <= 1);
      frame.rows.forEach((row, i) => {
        close(row.work, row.prefill + row.decode);
        assert.ok(row.queue >= 0 && row.work > 0);
        const a = study.requests[Math.max(0, i - 1)],
          b = study.requests[i];
        assert.ok(row.work <= Math.max(a.gpuSeconds, b.gpuSeconds) + 1e-8);
        assert.ok(row.work >= Math.min(a.gpuSeconds, b.gpuSeconds) - 1e-8);
      });
    }
  });
}
test("runtime finale rejects reordered or non-matched comparisons", () => {
  const runs = inferenceStoryRuns("shared-prefix");
  assert.throws(() => runtimeGainsStudy(runs.slice(0, 3)), /four/);
  assert.throws(
    () => runtimeGainsStudy([runs[1], runs[0], ...runs.slice(2)]),
    /order/,
  );
  const changed = structuredClone(runs);
  changed[3].tasks[6].tokens++;
  assert.throws(() => runtimeGainsStudy(changed), /cognition/);
  const cache = structuredClone(runs);
  cache[3].tasks[6].cacheHit = false;
  assert.throws(() => runtimeGainsStudy(cache), /cache/);
});
test("runtime finale replaces the generic film, has a shared duration and accessible moments", () => {
  const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
  const parent = read("../app/compute/lab-story.tsx"),
    scene = read("../app/compute/runtime-gains-reveal.tsx"),
    css = read("../app/compute/runtime-gains-reveal.css");
  assert.match(parent, /const RuntimeGainsReveal = lazy/);
  assert.match(parent, /EXECUTION_DURATION,\s*RUNTIME_GAINS_DURATION/);
  assert.doesNotMatch(parent, /<InferenceFilm/);
  assert.match(scene, /Scrub runtime gains film/);
  assert.match(scene, /data-rg-target/);
  assert.match(scene, /runtimeGainsFrame\(film.time, study\)/);
  assert.match(scene, /aria-current=\{beat === i/);
  assert.match(css, /data-feature="runtime-gains".*> \.ls-outcomes/);
  assert.match(css, /prefers-reduced-motion/);
});
