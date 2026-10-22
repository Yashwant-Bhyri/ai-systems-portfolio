import assert from "node:assert/strict";
import test from "node:test";
import { simulateStream, streamFilmFrame } from "../app/compute/stream-continuity-model.ts";
import { servingPressureState } from "../app/compute/serving-pressure-state.ts";

for (const capacityPages of [12, 24]) for (const tokenBudget of [16, 32, 64]) {
  const pair = Object.fromEntries(["whole", "chunked"].map(policy => [policy, simulateStream({ policy, capacityPages, tokenBudget })]));
  test(`${capacityPages} pages, ${tokenBudget} tokens: operational state agrees with every event`, () => {
    for (const trace of Object.values(pair)) {
      const cursors = [...new Set([0, ...trace.steps.flatMap(step => [step.startMs, (step.startMs + step.endMs) / 2, step.endMs]), trace.finishMs + 100])];
      for (const cursor of cursors) {
        const state = servingPressureState(trace, cursor);
        assert.ok(state.reserved <= capacityPages && state.reserved >= 0);
        assert.ok(state.progress >= 0 && state.progress <= 1);
        assert.equal(state.requests.reduce((sum, r) => sum + r.count, 0), trace.steps.filter(step => step.endMs <= cursor).reduce((sum, step) => sum + step.emitted.length, 0));
        for (const request of state.requests) {
          assert.equal(request.count, request.tokenMs.filter(at => at <= cursor).length);
          assert.ok(request.inputDone >= 0 && request.inputDone + request.allocated <= request.promptTokens);
          assert.ok(!(request.waiting && request.active));
          assert.ok(!(request.done && request.active));
        }
        if (state.step) assert.equal(state.reserved, state.step.reservationStartPages);
      }
      const done = servingPressureState(trace, trace.finishMs);
      assert.equal(done.reserved, 0);
      assert.equal(done.step, null);
      assert.ok(done.requests.every(request => request.done && request.count === request.outputTokens && request.inputDone === request.promptTokens));
    }
  });
  test(`${capacityPages} pages, ${tokenBudget} tokens: film seek reconstructs the same request state`, () => {
    for (const ms of [36000, 31000, 26000, 22500, 18500, 10000, 8000, 5000, 0]) {
      const frame = streamFilmFrame(ms, pair);
      for (const trace of Object.values(pair)) assert.deepEqual(servingPressureState(trace, frame.serviceMs), servingPressureState(trace, streamFilmFrame(ms, pair).serviceMs));
      assert.ok(frame.serviceMs <= 300, "shared visual axis contains every supported configuration");
    }
  });
}

test("the practical scene exposes the interruption rather than manufacturing faster hardware", () => {
  const whole = simulateStream({ policy: "whole", tokenBudget: 16, capacityPages: 24 });
  const chunked = simulateStream({ policy: "chunked", tokenBudget: 16, capacityPages: 24 });
  const a = servingPressureState(whole, 70), b = servingPressureState(chunked, 70);
  assert.equal(a.decode, 0);
  assert.equal(a.prefill, 128);
  assert.ok(b.decode > 0);
  assert.ok(b.requests[0].count > a.requests[0].count);
  assert.equal(whole.totalInputTokens, chunked.totalInputTokens);
  assert.equal(whole.totalOutputTokens, chunked.totalOutputTokens);
});
