import assert from "node:assert/strict";
import test from "node:test";
import { simulateLab } from "../app/compute/lab-simulation.ts";
import { registerHooks } from "node:module";
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier === "./inference-film-math" &&
      context.parentURL?.endsWith("/execution-study-math.ts")
    )
      return nextResolve(`${specifier}.ts`, context);
    return nextResolve(specifier, context);
  },
});
const {
  executionFrame,
  executionLoadSweep,
  executionWaterfall,
  waterfallFrame,
  waterfallSelection,
  executionDemand,
  budgetCapacity,
  demandTime,
  demandSeek,
  matchedExecution,
  repeatedWork,
  replayServiceProfiles,
  EXECUTION_DURATION,
  machineState,
  tileProjection,
  TILE_WEIGHTS,
  TILE_INPUT,
  replayBurst,
  burstAt,
  executionBurst,
} = await import("../app/compute/execution-study-math.ts");

const pair = (workload) => [
  simulateLab(2, 2, false, workload, { reuse: true, fastKernels: false }),
  simulateLab(2, 2, true, workload),
];

for (const workload of ["interactive", "shared-prefix"]) {
  const [before, after] = pair(workload);
  test(`${workload}: a fixed-time burst counts completed work without inventing workers`, () => {
    const burst = executionBurst(before, after);
    for (const replay of [burst.reference, burst.optimized]) {
      const initial = burstAt(replay, 0);
      assert.equal(initial.completed, 0);
      assert.equal(initial.active.length, 2);
      assert.equal(initial.queued, 998);
      const checkpoints = [
        ...new Set([
          0,
          replay.finish,
          ...Array.from({ length: 101 }, (_, i) => (replay.finish * i) / 100),
          ...replay.requests.flatMap((r) => [r.start, r.finish]),
        ]),
      ].sort((a, b) => a - b);
      for (const t of checkpoints) {
        const state = burstAt(replay, t);
        assert.equal(
          state.completed + state.active.length + state.queued,
          1000,
        );
        assert.ok(state.active.length <= 2);
        assert.equal(
          new Set(state.active.map((r) => r.worker)).size,
          state.active.length,
        );
        assert.equal(
          state.completed,
          replay.requests.filter((r) => r.finish <= t).length,
        );
      }
      for (let worker = 0; worker < 2; worker++) {
        const lane = replay.requests.filter((r) => r.worker === worker);
        lane.forEach((r, i) =>
          assert.equal(r.start, i ? lane[i - 1].finish : 0),
        );
      }
      const end = burstAt(replay, replay.finish);
      assert.equal(end.completed, 1000);
      assert.equal(end.active.length, 0);
      assert.equal(end.queued, 0);
      assert.ok(
        Math.abs(
          replay.busy - replay.requests.reduce((sum, r) => sum + r.service, 0),
        ) < 1e-8,
      );
    }
    const a = burstAt(burst.reference, 300),
      b = burstAt(burst.optimized, 300);
    assert.ok(b.completed > a.completed);
    assert.deepEqual(
      burstAt(burst.reference, 150),
      burstAt(burst.reference, 150),
    );
    burst.reference.requests.forEach((r, i) =>
      assert.equal(r.profile, burst.optimized.requests[i].profile),
    );
    assert.throws(() => replayBurst([], 1000));
    assert.throws(() => replayBurst(before.tasks, 0));
    assert.throws(() => replayBurst(before.tasks, 1000, 0));
    assert.throws(() => burstAt(burst.reference, NaN));
    assert.throws(() => burstAt(burst.reference, -1));
  });
  test(`${workload}: execution-only comparison preserves the cognition and cache state`, () => {
    const { reference, optimized } = matchedExecution(before, after);
    assert.equal(reference.tokens, optimized.tokens);
    assert.equal(reference.computedInputTokens, optimized.computedInputTokens);
    assert.ok(optimized.gpuSeconds < reference.gpuSeconds);
    const changed = structuredClone(after);
    changed.tasks[0].computedInputTokens += 1;
    assert.throws(() => matchedExecution(before, changed));
  });
  test(`${workload}: the authored clock exposes completion before accumulating work`, () => {
    const { reference: a, optimized: b } = matchedExecution(before, after);
    assert.equal(EXECUTION_DURATION, 42000);
    assert.equal(executionFrame(0, a, b).time, 0);
    assert.equal(executionFrame(6000, a, b).time, b.gpuSeconds);
    assert.equal(executionFrame(6000, a, b).optimizedDone, true);
    assert.equal(executionFrame(8200, a, b).referenceDone, false);
    assert.equal(executionFrame(9300, a, b).referenceDone, true);
    assert.ok(executionFrame(24900, a, b).count < 1000);
    assert.equal(executionFrame(25000, a, b).count, 1000);
    for (const [ms, beat] of [
      [0, 0],
      [6000, 1],
      [11000, 2],
      [20000, 3],
      [26000, 4],
      [38000, 5],
      [EXECUTION_DURATION, 5],
    ])
      assert.equal(executionFrame(ms, a, b).beat, beat);
    assert.deepEqual(executionFrame(8200, a, b), executionFrame(8200, a, b));
    for (const n of [1, 10, 100, 1000]) {
      const work = repeatedWork(a, b, n);
      assert.equal(work.reference, a.gpuSeconds * n);
      assert.equal(work.saved, work.reference - work.optimized);
    }
  });
  test(`${workload}: load changes waiting, not the sum of pinned service work`, () => {
    const sweep = executionLoadSweep(before, after);
    const initial = sweep.points[0];
    assert.ok(sweep.optimizedCapacity > sweep.capacity);
    for (const point of sweep.points) {
      assert.equal(point.reference.busy, initial.reference.busy);
      assert.equal(point.optimized.busy, initial.optimized.busy);
      assert.ok(point.optimized.p95 <= point.reference.p95);
      const all = point.reference.requests
        .map((r) => r.latency)
        .sort((a, b) => a - b);
      assert.equal(point.reference.p95, all[949]);
      point.reference.requests.forEach((r, i) => {
        const matched = point.optimized.requests[i];
        assert.equal(r.arrival, matched.arrival);
        assert.equal(r.profile, matched.profile);
        assert.ok(r.start >= r.arrival);
        assert.ok(r.wait >= 0);
        assert.ok(Math.abs(r.latency - r.wait - r.service) < 1e-8);
      });
    }
    assert.ok(sweep.points.at(-1).rate > sweep.optimizedCapacity);
    assert.ok(sweep.points.at(-1).optimized.p95Wait > 0);
  });
  test(`${workload}: machine activity, emitted groups and completion share the service clock`, () => {
    const { reference: a, optimized: b } = matchedExecution(before, after);
    assert.equal(machineState(a, 0).active, false);
    assert.equal(machineState(a, 0).tokens, 0);
    assert.equal(machineState(a, a.prefill / 2).tokens, 0);
    const gap = executionFrame(8200, a, b);
    assert.equal(machineState(a, gap.time).active, true);
    assert.equal(machineState(b, gap.time).active, false);
    assert.equal(machineState(b, gap.time).tokens, b.tokens);
    assert.equal(machineState(b, gap.time).cycle, 32);
    assert.equal(machineState(a, gap.time).done, false);
    assert.equal(machineState(a, a.gpuSeconds).tokens, a.tokens);
    assert.equal(machineState(a, a.gpuSeconds + 100).elapsed, a.gpuSeconds);
    assert.deepEqual(machineState(a, gap.time), machineState(a, gap.time));
  });

  test(`${workload}: waterfall lanes serialize the same real cohort identities`, () => {
    const trace = executionWaterfall(before, after);
    const { reference } = matchedExecution(before, after);
    const offset = before.tasks.indexOf(reference);
    assert.equal(trace.baseline.requests[0].profile, reference.id);

    for (const [run, replay] of [
      [before, trace.baseline],
      [after, trace.optimized],
    ]) {
      assert.equal(replay.count, 12);
      assert.equal(replay.workers, 1);
      replay.requests.forEach((request, i) => {
        const task = run.tasks[(offset + i) % run.tasks.length];
        assert.equal(request.profile, task.id);
        assert.equal(request.service, task.gpuSeconds);
        assert.equal(request.worker, 0);
        assert.equal(request.start, i ? replay.requests[i - 1].finish : 0);
        assert.equal(request.finish, request.start + request.service);
      });
      assert.equal(replay.finish, replay.requests.at(-1).finish);
    }
    assert.deepEqual(
      trace.baseline.requests.map((request) => request.profile),
      trace.optimized.requests.map((request) => request.profile),
    );
  });

  test(`${workload}: waterfall camera stays within deterministic trace bounds`, () => {
    const trace = executionWaterfall(before, after);
    const first = trace.baseline.requests[0].finish;
    const third = trace.baseline.requests[2].finish;
    const finish = trace.baseline.finish;
    const boundaries = [
      [0, first, third, 3],
      [10999, first, third, 3],
      [11000, first, third, 3],
      [13500, third, third, 3],
      [
        15750,
        third + (finish - third) * 0.5,
        third + (finish - third) * 0.875,
        3 + 9 * 0.875,
      ],
      [18000, finish, finish, 12],
      [42000, finish, finish, 12],
    ];
    for (const [
      ms,
      expectedTime,
      expectedHorizon,
      expectedRows,
    ] of boundaries) {
      const frame = waterfallFrame(ms, trace, first);
      assert.equal(frame.time, expectedTime);
      assert.equal(frame.horizon, expectedHorizon);
      assert.equal(frame.rows, expectedRows);
      assert.deepEqual(frame, waterfallFrame(ms, trace, first));
    }
    for (let ms = 0; ms <= 42000; ms += 250) {
      const frame = waterfallFrame(ms, trace, first);
      assert.ok(frame.time >= first && frame.time <= finish);
      assert.ok(frame.horizon >= third && frame.horizon <= finish);
      assert.ok(frame.rows >= 3 && frame.rows <= trace.baseline.count);
      assert.ok(frame.zoom >= 0 && frame.zoom <= 1);
      const selected = waterfallSelection(trace, frame);
      assert.ok(frame.rows - selected > 0.9);
      assert.ok(
        trace.baseline.requests[selected].finish <= frame.horizon + 1e-8,
      );
    }
  });

  test(`${workload}: varied deterministic demand keeps paired rates and cohort fields`, () => {
    const demand = executionDemand(before, after);
    const repeated = executionDemand(before, after);
    assert.equal(demand.seed, "token-mix-v1:1907/8141/3149/9763");
    assert.deepEqual(demand.specifications, repeated.specifications);
    assert.deepEqual(demand.baselineProfiles, repeated.baselineProfiles);
    assert.deepEqual(demand.optimizedProfiles, repeated.optimizedProfiles);
    assert.deepEqual(demand.reference.requests, repeated.reference.requests);
    assert.deepEqual(demand.optimized.requests, repeated.optimized.requests);
    assert.equal(demand.specifications.length, 1000);
    assert.equal(demand.reference.count, 1000);
    assert.equal(demand.optimized.count, 1000);
    assert.ok(
      new Set(demand.specifications.map((spec) => spec.inputTokens)).size > 1,
    );
    assert.ok(
      new Set(demand.specifications.map((spec) => spec.tokens)).size > 1,
    );
    assert.ok(
      demand.specifications.slice(96).some((spec, i) => {
        const earlier = demand.specifications[i % 96];
        return (
          spec.inputTokens !== earlier.inputTokens ||
          spec.tokens !== earlier.tokens ||
          spec.cacheHit !== earlier.cacheHit
        );
      }),
    );
    if (workload === "shared-prefix") {
      assert.ok(demand.specifications.some((spec) => spec.cacheHit));
      assert.ok(demand.specifications.some((spec) => !spec.cacheHit));
    } else {
      assert.ok(demand.specifications.every((spec) => !spec.cacheHit));
    }

    const baselineSample = before.tasks[0];
    const optimizedSample = after.tasks[0];
    for (const [i, spec] of demand.specifications.entries()) {
      const baseline = demand.baselineProfiles[i];
      const optimized = demand.optimizedProfiles[i];
      for (const profile of [baseline, optimized]) {
        for (const field of [
          "id",
          "inputTokens",
          "computedInputTokens",
          "tokens",
          "cacheHit",
        ])
          assert.equal(profile[field], spec[field]);
      }
      assert.equal(
        baseline.prefill,
        (spec.computedInputTokens * baselineSample.prefill) /
          baselineSample.computedInputTokens,
      );
      assert.equal(
        baseline.decode,
        (spec.tokens * baselineSample.decode) / baselineSample.tokens,
      );
      assert.equal(baseline.gpuSeconds, baseline.prefill + baseline.decode);
      assert.equal(
        optimized.prefill,
        (spec.computedInputTokens * optimizedSample.prefill) /
          optimizedSample.computedInputTokens,
      );
      assert.equal(
        optimized.decode,
        (spec.tokens * optimizedSample.decode) / optimizedSample.tokens,
      );
      assert.equal(optimized.gpuSeconds, optimized.prefill + optimized.decode);
      assert.equal(demand.reference.requests[i].profile, spec.id);
      assert.equal(demand.optimized.requests[i].profile, spec.id);
    }
    for (const record of [
      demand,
      ...demand.specifications,
      ...demand.baselineProfiles,
      ...demand.optimizedProfiles,
    ])
      for (const field of [
        "accuracy",
        "correct",
        "quality",
        "score",
        "measured",
      ])
        assert.equal(field in record, false);
    assert.equal(
      demand.reference.busy,
      demand.baselineProfiles.reduce(
        (sum, profile) => sum + profile.gpuSeconds,
        0,
      ),
    );
    assert.equal(
      demand.optimized.busy,
      demand.optimizedProfiles.reduce(
        (sum, profile) => sum + profile.gpuSeconds,
        0,
      ),
    );
  });

  test(`${workload}: aggregate budgets consume exact FIFO service allowances`, () => {
    const demand = executionDemand(before, after);
    const zero = budgetCapacity(demand, 0);
    assert.deepEqual(zero, {
      allowance: 0,
      baseline: { completed: 0, used: 0, remaining: 0 },
      optimized: { completed: 0, used: 0, remaining: 0 },
      extra: 0,
    });

    const fifoProfiles = [2, 2, 1].map((gpuSeconds) => ({ gpuSeconds }));
    const fifoDemand = {
      baselineProfiles: fifoProfiles,
      optimizedProfiles: fifoProfiles,
    };
    assert.deepEqual(budgetCapacity(fifoDemand, 3), {
      allowance: 3,
      baseline: { completed: 1, used: 2, remaining: 1 },
      optimized: { completed: 1, used: 2, remaining: 1 },
      extra: 0,
    });
    assert.deepEqual(budgetCapacity(fifoDemand, 4), {
      allowance: 4,
      baseline: { completed: 2, used: 4, remaining: 0 },
      optimized: { completed: 2, used: 4, remaining: 0 },
      extra: 0,
    });

    const baselineTotal = demand.baselineProfiles.reduce(
      (sum, profile) => sum + profile.gpuSeconds,
      0,
    );
    const optimizedTotal = demand.optimizedProfiles.reduce(
      (sum, profile) => sum + profile.gpuSeconds,
      0,
    );
    const exhausted = budgetCapacity(
      demand,
      Math.max(baselineTotal, optimizedTotal),
    );
    assert.equal(exhausted.baseline.completed, 1000);
    assert.equal(exhausted.baseline.used, baselineTotal);
    assert.equal(exhausted.optimized.completed, 1000);
    assert.equal(exhausted.optimized.used, optimizedTotal);
    for (const invalid of [-1, -Infinity, Infinity, NaN])
      assert.throws(() => budgetCapacity(demand, invalid), RangeError);
  });

  test(`${workload}: demand scrub is inverse to service time and finishes both queues`, () => {
    const demand = executionDemand(before, after);
    const first = Math.min(300, demand.optimized.finish);
    const services = [
      0,
      first / 2,
      first,
      (first + demand.optimized.finish) / 2,
      demand.optimized.finish,
      (demand.optimized.finish + demand.reference.finish) / 2,
      demand.reference.finish,
    ];
    for (const service of services) {
      const ms = demandSeek(service, demand);
      assert.ok(Math.abs(demandTime(ms, demand) - service) < 1e-8);
    }
    for (const ms of [35700, 36000, 36999, 37000])
      assert.equal(demandTime(ms, demand), demand.optimized.finish);
    assert.equal(demandTime(37700, demand), demand.reference.finish);
    assert.ok(
      burstAt(demand.reference, demandTime(37699, demand)).completed < 1000,
    );
    for (const replay of [demand.optimized, demand.reference]) {
      const end = burstAt(replay, demandTime(37700, demand));
      assert.equal(end.completed, 1000);
      assert.equal(end.active.length, 0);
      assert.equal(end.queued, 0);
    }
  });

  test(`${workload}: varied demand conserves workers, population and budget boundaries`, () => {
    const demand = executionDemand(before, after);
    for (const replay of [demand.reference, demand.optimized]) {
      for (let fraction = 0; fraction <= 100; fraction++) {
        const time = (replay.finish * fraction) / 100;
        const state = burstAt(replay, time);
        assert.equal(
          state.completed + state.active.length + state.queued,
          1000,
        );
        assert.ok(state.active.length <= 2);
        assert.equal(
          new Set(state.active.map((r) => r.worker)).size,
          state.active.length,
        );
      }
      for (const worker of [0, 1]) {
        const lane = replay.requests.filter((r) => r.worker === worker);
        lane.forEach((r, i) =>
          assert.equal(r.start, i ? lane[i - 1].finish : 0),
        );
      }
    }
    for (let allowance = 100; allowance <= 3000; allowance += 10) {
      const result = budgetCapacity(demand, allowance);
      assert.ok(result.extra >= 0);
      for (const [state, profiles] of [
        [result.baseline, demand.baselineProfiles],
        [result.optimized, demand.optimizedProfiles],
      ]) {
        assert.ok(state.used <= allowance + 1e-9);
        assert.ok(
          state.used + profiles[state.completed].gpuSeconds > allowance,
        );
        assert.ok(Math.abs(state.used + state.remaining - allowance) < 1e-8);
      }
    }
  });
}
test("tile inspection exposes exact partial products without changing operands", () => {
  const original = JSON.stringify([TILE_WEIGHTS, TILE_INPUT]);
  for (let row = 0; row < 4; row++) {
    for (let terms = 0; terms <= 4; terms++) {
      const result = tileProjection(row, terms);
      assert.deepEqual(result.output, [1, 4, 8, -3]);
      assert.equal(
        result.partial,
        TILE_WEIGHTS[row]
          .slice(0, terms)
          .reduce((sum, w, j) => sum + w * TILE_INPUT[j], 0),
      );
    }
  }
  assert.equal(JSON.stringify([TILE_WEIGHTS, TILE_INPUT]), original);
  assert.throws(() => tileProjection(-1, 4));
  assert.throws(() => tileProjection(0, 5));
  assert.throws(() => tileProjection(1.5, 2));
});
test("replay rejects invalid dimensions and repeat counts", () => {
  const [before] = pair("interactive"),
    task = before.tasks[0];
  assert.throws(() => repeatedWork(task, task, 0));
  assert.throws(() => repeatedWork(task, task, 1001));
  assert.throws(() => replayServiceProfiles([], 1));
  assert.throws(() => replayServiceProfiles(before.tasks, 0));
  assert.throws(() => replayServiceProfiles(before.tasks, 1, 1000, 0));
});
