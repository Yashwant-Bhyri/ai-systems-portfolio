import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";
import { simulateLab } from "../app/compute/lab-simulation.ts";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier === "./inference-film-math" &&
      context.parentURL?.endsWith("/scheduling-study-math.ts")
    )
      return nextResolve(`${specifier}.ts`, context);
    return nextResolve(specifier, context);
  },
});

const {
  schedulingStudy,
  schedulingFrame,
  schedulingAt,
  SCHEDULING_DURATION,
  SCHEDULING_MOMENTS,
  idleAt,
  idleWithWaiting,
} = await import("../app/compute/scheduling-study-math.ts");

const pair = (workload) => [
  simulateLab(2, 2, false, workload, {
    reuse: false,
    fastKernels: false,
    scheduler: "barrier",
  }),
  simulateLab(2, 2, false, workload, {
    reuse: false,
    fastKernels: false,
    scheduler: "continuous",
  }),
];
const close = (actual, expected, epsilon = 1e-8) =>
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `${actual} is not within ${epsilon} of ${expected}`,
  );

for (const workload of ["interactive", "shared-prefix"]) {
  const [before, after] = pair(workload);
  const study = schedulingStudy(before, after);
  const baseline = study.baseline;
  const optimized = study.optimized;

  test(`${workload}: scheduler comparison preserves six task identities and service work`, () => {
    assert.equal(baseline.length, 6);
    assert.equal(optimized.length, 6);
    assert.deepEqual(
      baseline.map((task) => task.id),
      [0, 1, 2, 3, 4, 5],
    );
    assert.deepEqual(
      optimized.map((task) => task.id),
      baseline.map((task) => task.id),
    );
    const baselineWork = baseline.reduce(
      (sum, task) => sum + task.gpuSeconds,
      0,
    );
    const optimizedWork = optimized.reduce(
      (sum, task) => sum + task.gpuSeconds,
      0,
    );
    close(study.work, baselineWork);
    close(study.work, optimizedWork);
    baseline.forEach((task, i) => {
      const other = optimized[i];
      assert.equal(other.arrival, task.arrival);
      close(other.gpuSeconds, task.gpuSeconds);
      close(other.prefill, task.prefill);
      close(other.decode, task.decode);
    });
    assert.equal(
      study.horizon,
      Math.max(
        ...baseline.map((task) => task.finish),
        ...optimized.map((task) => task.finish),
      ),
    );
  });

  test(`${workload}: reported baseline gaps are idle intervals with arrived work waiting`, () => {
    assert.ok(study.gaps.length > 0);
    for (const gap of study.gaps) {
      assert.ok(gap.start < gap.finish);
      const midpoint = (gap.start + gap.finish) / 2;
      assert.equal(
        baseline.some(
          (task) =>
            task.worker === gap.worker &&
            task.start <= midpoint &&
            task.finish > midpoint,
        ),
        false,
        `worker ${gap.worker} is active at gap midpoint ${midpoint}`,
      );
      assert.ok(
        baseline.some(
          (task) => task.arrival <= midpoint && task.start > midpoint,
        ),
        `no arrived task is waiting at gap midpoint ${midpoint}`,
      );
    }
  });

  test(`${workload}: both schedules use the same two serial workers`, () => {
    for (const tasks of [baseline, optimized]) {
      assert.deepEqual(
        [...new Set(tasks.map((task) => task.worker))].sort(),
        [0, 1],
      );
      for (const worker of [0, 1]) {
        const lane = tasks
          .filter((task) => task.worker === worker)
          .sort((a, b) => a.start - b.start);
        assert.ok(lane.length > 0);
        lane.forEach((task, i) => {
          assert.ok(task.start >= task.arrival);
          if (i) assert.ok(task.start >= lane[i - 1].finish);
        });
      }
    }
  });

  test(`${workload}: authored clock boundaries are exact and time never moves backward`, () => {
    assert.equal(SCHEDULING_DURATION, 35000);
    assert.deepEqual(SCHEDULING_MOMENTS, [0, 8500, 19000, 31500]);
    assert.deepEqual(
      SCHEDULING_MOMENTS.map((ms) => schedulingFrame(ms, study).beat),
      [0, 1, 2, 3],
    );
    const admission = optimized[2].start;
    const comparison = (optimized[2].start + baseline[2].start) / 2;
    const later = optimized[4].finish;
    assert.equal(schedulingFrame(0, study).time, 0);
    assert.equal(schedulingFrame(700, study).time, 0);
    assert.equal(schedulingFrame(5500, study).time, admission);
    assert.equal(schedulingFrame(7000, study).time, comparison);
    assert.equal(schedulingFrame(10500, study).time, comparison);
    assert.equal(schedulingFrame(18000, study).time, later);
    assert.equal(schedulingFrame(20700, study).time, later);
    assert.equal(schedulingFrame(23500, study).time, study.horizon);
    assert.equal(schedulingFrame(26000, study).time, study.horizon);
    assert.equal(schedulingFrame(12999, study).selected, 2);
    assert.equal(schedulingFrame(13000, study).selected, 4);
    assert.equal(schedulingFrame(21999, study).beat, 2);
    assert.equal(schedulingFrame(22000, study).beat, 3);

    let previous = -Infinity;
    for (let ms = 0; ms <= SCHEDULING_DURATION; ms += 10) {
      const frame = schedulingFrame(ms, study);
      assert.ok(frame.time >= previous, `clock moved backward at ${ms} ms`);
      previous = frame.time;
    }
  });

  test(`${workload}: every request is accounted for and service work stays bounded`, () => {
    const checkpoints = new Set([0, study.horizon]);
    for (const task of [...baseline, ...optimized]) {
      for (const time of [task.arrival, task.start, task.finish])
        checkpoints.add(time);
    }
    for (let time = 0; time <= study.horizon; time += 0.25)
      checkpoints.add(time);

    for (const tasks of [baseline, optimized]) {
      let previousWork = 0;
      for (const time of [...checkpoints].sort((a, b) => a - b)) {
        const state = schedulingAt(tasks, time);
        assert.equal(
          state.done.length +
            state.active.length +
            state.waiting.length +
            state.future.length,
          6,
        );
        assert.ok(state.work >= 0);
        assert.ok(state.work <= study.work + 1e-8);
        const expectedWork = tasks.reduce(
          (sum, task) =>
            sum + Math.max(0, Math.min(task.gpuSeconds, time - task.start)),
          0,
        );
        close(state.work, expectedWork);
        assert.ok(state.work >= previousWork);
        previousWork = state.work;
      }
    }
  });

  test(`${workload}: the endpoint finishes all six tasks on both lanes`, () => {
    const frame = schedulingFrame(SCHEDULING_DURATION, study);
    assert.equal(frame.time, study.horizon);
    for (const tasks of [baseline, optimized]) {
      const state = schedulingAt(tasks, frame.time);
      assert.equal(state.done.length, 6);
      assert.equal(state.active.length, 0);
      assert.equal(state.waiting.length, 0);
      assert.equal(state.future.length, 0);
      close(state.work, study.work);
    }
  });

  test(`${workload}: ledger counts idle-with-waiting, not all unallocated time`, () => {
    assert.deepEqual(study.gaps, idleWithWaiting(baseline));
    assert.deepEqual(study.optimizedGaps, []);
    const exact = study.gaps.reduce((sum, g) => sum + g.finish - g.start, 0);
    close(idleAt(study.gaps, study.horizon), exact);
    close(idleAt(study.gaps, study.horizon + 1000), exact);
    assert.equal(idleAt(study.gaps, 0), 0);
    let previous = 0;
    for (let t = 0; t <= study.horizon; t += 0.1) {
      const now = idleAt(study.gaps, t);
      assert.ok(now >= previous && now <= exact + 1e-8);
      previous = now;
    }
    for (const [ms, focus] of [
      [24500, "baseline"],
      [28000, "optimized"],
      [31500, "difference"],
    ]) {
      const frame = schedulingFrame(ms, study);
      assert.equal(frame.focus, focus);
      assert.equal(frame.time, study.horizon);
    }
  });

  test(`${workload}: Q3 and Q5 latency includes arrival wait plus service`, () => {
    for (const id of [2, 4]) {
      for (const task of [baseline[id], optimized[id]]) {
        assert.ok(task.start >= task.arrival);
        close(task.queueSeconds, task.start - task.arrival);
        close(task.gpuSeconds, task.finish - task.start);
        close(task.latency, task.finish - task.arrival);
        close(task.latency, task.queueSeconds + task.gpuSeconds);
      }
    }
  });
}

test("scheduling comparison rejects mismatched arrival, service work, model, and workload", () => {
  const [before, after] = pair("interactive");
  const mutations = [
    (run) => {
      run.tasks[0].arrival += 1;
    },
    (run) => {
      run.tasks[0].gpuSeconds += 1;
    },
    (run) => {
      run.policy = "base";
    },
    (run) => {
      run.budget = 4;
    },
    (run) => {
      run.workload = "shared-prefix";
    },
  ];
  for (const mutate of mutations) {
    const altered = structuredClone(after);
    mutate(altered);
    assert.throws(() => schedulingStudy(before, altered));
  }
});
