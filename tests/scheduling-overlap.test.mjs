import test from "node:test";
import assert from "node:assert/strict";
import {
  HOST_PROFILES,
  OVERLAP_DURATION,
  overlapStudy,
  overlapFrame,
  overlapRecord,
} from "../app/compute/scheduling-overlap-model.ts";

test("balanced overlap removes inter-step waiting, not device arithmetic", () => {
  const s = overlapStudy();
  assert.deepEqual(
    s.baseline.steps.map((x) => x.deliver.end),
    [13, 26, 39, 52],
  );
  assert.deepEqual(
    s.overlapped.steps.map((x) => x.deliver.end),
    [13, 21, 29, 37],
  );
  assert.equal(s.savedElapsed, 15);
  assert.equal(s.baseline.gpuBusy, 32);
  assert.equal(s.overlapped.gpuBusy, 32);
  assert.equal(s.baseline.cpuBusy, 20);
  assert.equal(s.overlapped.cpuBusy, 20);
  assert.equal(s.baseline.gpuIdle, 20);
  assert.equal(s.overlapped.gpuIdle, 5);
  assert.equal(s.overlapped.gaps.length, 0);
});

for (const profile of Object.keys(HOST_PROFILES)) {
  for (const count of [1, 2, 4, 8, 32]) {
    test(`${profile}, ${count} steps: resources and dependencies remain feasible`, () => {
      const s = overlapStudy(profile, count);
      assert.ok(s.savedElapsed >= 0);
      for (const lane of [s.baseline, s.overlapped]) {
        const cpu = lane.steps
          .flatMap((x) => [x.prepare, x.deliver])
          .filter((x) => x.end > x.start)
          .sort((a, b) => a.start - b.start);
        cpu.forEach((x, i) => {
          if (i) assert.ok(x.start >= cpu[i - 1].end);
        });
        lane.steps.forEach((x, i) => {
          assert.equal(x.gpu.end - x.gpu.start, s.inputs.gpu);
          assert.equal(x.prepare.end - x.prepare.start, s.inputs.prepare);
          assert.equal(x.deliver.end - x.deliver.start, s.inputs.deliver);
          assert.ok(x.gpu.start >= x.prepare.end);
          assert.ok(x.deliver.start >= x.gpu.end);
          if (i) {
            assert.ok(x.gpu.start >= lane.steps[i - 1].gpu.end);
            assert.ok(x.deliver.start >= lane.steps[i - 1].deliver.end);
          }
        });
        assert.equal(lane.gpuBusy + lane.gpuIdle, lane.finish);
        assert.equal(lane.steps.at(-1).deliver.end, lane.finish);
      }
      assert.equal(s.baseline.gpuBusy, s.overlapped.gpuBusy);
      assert.equal(s.baseline.cpuBusy, s.overlapped.cpuBusy);
      if (count === 1 || profile === "negligible")
        assert.equal(s.savedElapsed, 0);
    });
  }
}

test("CPU bottleneck retains visible gaps even with overlap", () => {
  const s = overlapStudy("host-bound");
  assert.ok(s.overlapped.gaps.length > 0);
  assert.ok(s.overlapped.gaps.reduce((sum, x) => sum + x.end - x.start, 0) > 0);
});

test("presentation holds do not add service time or completed tokens", () => {
  const s = overlapStudy();
  for (const [a, b] of [
    [8000, 9900],
    [17000, 20999],
    [25000, 28000],
  ]) {
    const x = overlapFrame(a, s),
      y = overlapFrame(b, s);
    assert.equal(x.serviceMs, y.serviceMs);
    assert.deepEqual(x.baseline, y.baseline);
    assert.deepEqual(x.overlapped, y.overlapped);
  }
  assert.equal(overlapFrame(19500, s).overlapped.completed, 4);
  assert.equal(overlapFrame(19500, s).baseline.completed, 2);
  assert.equal(overlapFrame(19500, s).serviceMs, 37);
});

test("every profile supports deterministic, monotonic and reversible seeking", () => {
  for (const profile of Object.keys(HOST_PROFILES)) {
    const s = overlapStudy(profile);
    let prev = 0;
    for (let t = 0; t <= OVERLAP_DURATION; t += 100) {
      const f = overlapFrame(t, s);
      assert.ok(f.serviceMs >= prev);
      assert.ok(f.serviceMs <= s.baseline.finish);
      assert.ok(f.baseline.gpuBusy <= s.baseline.gpuBusy);
      assert.ok(f.overlapped.gpuBusy <= s.overlapped.gpuBusy);
      overlapFrame(OVERLAP_DURATION, s);
      assert.deepEqual(overlapFrame(t, s), f);
      prev = f.serviceMs;
    }
    const f = overlapFrame(OVERLAP_DURATION, s);
    assert.equal(f.baseline.completed, s.count);
    assert.equal(f.overlapped.completed, s.count);
  }
});

test("invalid controls fail explicitly and exported data preserves both clocks", () => {
  assert.throws(() => overlapStudy("unknown"), RangeError);
  for (const count of [0, -1, 1.5, 33, NaN])
    assert.throws(() => overlapStudy("balanced", count), RangeError);
  for (const t of [NaN, Infinity])
    assert.throws(() => overlapFrame(t, overlapStudy()), RangeError);
  assert.equal(overlapFrame(-1, overlapStudy()).serviceMs, 0);
  const record = JSON.parse(
    JSON.stringify(overlapRecord(overlapStudy(), 19500, 2)),
  );
  assert.equal(record.frame.presentationMs, 19500);
  assert.equal(record.frame.serviceMs, 37);
  assert.equal(record.selectedStep, 2);
  assert.equal(record.study.baseline.gpuBusy, record.study.overlapped.gpuBusy);
  assert.match(record.evidence, /not a measured/);
});
