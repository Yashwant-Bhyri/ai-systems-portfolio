import assert from "node:assert/strict";
import test from "node:test";
import { simulateLab } from "../app/compute/lab-simulation.ts";
import { assertMatchedLoad, latencyDistribution, loadEvents, loadState, loadFilmFrame, LOAD_FILM_MS, LOAD_MOMENTS } from "../app/compute/load-latency-model.ts";

for (const workload of ["interactive", "shared-prefix"]) for (const policy of [0, 2]) for (const budget of [1, 2, 4, 8]) {
  test(`${workload}, checkpoint ${policy}, ${budget}x: queue, workers and completions conserve the entire cohort`, () => {
    const runs = [false, true].map(optimized => simulateLab(policy, budget, optimized, workload));
    assert.doesNotThrow(() => assertMatchedLoad(...runs));
    for (const run of runs) {
      const events = loadEvents(run);
      const times = [0, ...events.flatMap((event, index) => [event.time, index ? (events[index - 1].time + event.time) / 2 : 0])];
      for (const time of times) {
        const state = loadState(run, time);
        assert.equal(state.arrived.length, state.waiting.length + state.running.length + state.completed.length);
        assert.ok(state.running.length <= 2);
        assert.equal(new Set(state.running.map(task => task.worker)).size, state.running.length);
        assert.deepEqual(state.waiting.map(task => task.id), run.tasks.filter(task => task.arrival <= time && task.start > time).map(task => task.id));
        const event = events.findLast(event => event.time <= time);
        assert.equal(event.waiting, state.waiting.length);
        assert.equal(event.running, state.running.length);
        assert.equal(event.completed, state.completed.length);
      }
      const last = events.at(-1);
      assert.equal(last.completed, run.n);
      assert.equal(last.waiting + last.running, 0);
      const p95 = latencyDistribution(run, 95);
      assert.equal(p95.threshold.latency, run.p95);
      assert.equal(p95.rank, 92);
      assert.equal(p95.atOrBelow + p95.above, run.n);
      assert.ok(p95.atOrBelow >= p95.rank);
      assert.deepEqual([...p95.rankById.keys()].sort((a, b) => a - b), run.tasks.map(task => task.id));
      assert.equal(latencyDistribution(run, 99).threshold.latency, Math.max(...run.tasks.map(task => task.latency)));
    }
    const lastArrival = runs[0].tasks.at(-1).arrival;
    const lastFinish = Math.max(...runs.flatMap(run => run.tasks.map(task => task.finish)));
    let lastClock = -1, lastSort = -1;
    for (let time = 0; time <= LOAD_FILM_MS; time += 50) {
      const frame = loadFilmFrame(time, lastArrival, lastFinish);
      assert.ok(frame.elapsed >= lastClock && frame.elapsed <= lastFinish + 1e-9);
      assert.ok(frame.sort >= lastSort && frame.sort <= 1);
      assert.ok(frame.elapsed <= frame.horizon + 1e-9);
      assert.equal(frame.horizon, lastFinish, "queue coordinates must not rescale during the drain");
      assert.ok(frame.fade >= .25 && frame.fade <= 1);
      if (frame.tail) assert.equal(frame.elapsed, lastFinish);
      lastClock = frame.elapsed; lastSort = frame.sort;
    }
    assert.equal(loadFilmFrame(11500, lastArrival, lastFinish).elapsed, lastArrival);
    assert.equal(loadFilmFrame(LOAD_MOMENTS.difference, lastArrival, lastFinish).focus, "difference");
    assert.equal(loadFilmFrame(LOAD_MOMENTS.baseline, lastArrival, lastFinish).focus, "baseline");
    assert.equal(loadFilmFrame(LOAD_MOMENTS.optimized, lastArrival, lastFinish).focus, "optimized");
    for (const at of [22000, 24000, 25999]) {
      const completion = loadFilmFrame(at, lastArrival, lastFinish);
      assert.equal(completion.phase, "complete");
      assert.equal(completion.tail, false, "conclude completion before switching charts");
      assert.equal(completion.elapsed, lastFinish);
      runs.forEach(run => assert.equal(loadState(run, completion.elapsed).completed.length, 96));
    }
    assert.equal(loadFilmFrame(LOAD_MOMENTS.sort, lastArrival, lastFinish).tail, true);
    assert.ok(loadFilmFrame(LOAD_MOMENTS.sort, lastArrival, lastFinish).sort > 0);
  });
}

test("ties preserve request identity and count all observations at the percentile boundary", () => {
  const run = simulateLab(0, 2);
  const tied = { ...run, tasks: [...run.tasks].reverse().map(task => ({ ...task, latency: 17 })) };
  const result = latencyDistribution(tied, 95);
  assert.equal(result.threshold.id, 91);
  assert.equal(result.atOrBelow, 96);
  assert.equal(result.above, 0);
  assert.equal(tied.tasks[0].id, 95, "sorting must not mutate source records");
});

test("sparse arrivals are a real no-queue counterexample", () => {
  for (const optimized of [false, true]) {
    const run = simulateLab(0, 1, optimized, "interactive");
    assert.ok(loadEvents(run).every(event => event.waiting === 0));
  }
});

test("invalid percentiles and unmatched arrivals cannot enter a controlled comparison", () => {
  const baseline = simulateLab(0, 2);
  for (const percentile of [0, -1, NaN, 101]) assert.throws(() => latencyDistribution(baseline, percentile), RangeError);
  assert.throws(() => latencyDistribution({ ...baseline, tasks: [] }, 95), RangeError);
  assert.throws(() => assertMatchedLoad(baseline, simulateLab(0, 2, true, "shared-prefix")), RangeError);
  assert.throws(() => assertMatchedLoad(baseline, simulateLab(2, 2)), RangeError);
  const changed = { ...baseline, tasks: baseline.tasks.map((task, i) => i ? task : { ...task, arrival: 3 }) };
  assert.throws(() => assertMatchedLoad(baseline, changed), RangeError);
});
