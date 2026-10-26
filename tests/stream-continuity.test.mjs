import assert from "node:assert/strict";
import test from "node:test";
import {
  STREAM_MODEL_VERSION,
  STREAM_REQUESTS,
  STREAM_FILM_DURATION_MS,
  STREAM_COSTS,
  longestTokenGap,
  reservedPages,
  simulateStream,
  streamFilmFrame,
} from "../app/compute/stream-continuity-model.ts";

const close = (actual, expected) =>
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.01, `${actual} != ${expected}`);
const run = (policy, tokenBudget = 16, capacityPages = 24, requests) =>
  simulateStream({ policy, tokenBudget, capacityPages, requests });

test("fixture, page reservation, and model version remain explicit", () => {
  assert.deepEqual(STREAM_REQUESTS.map((r) => [r.arrivalMs, r.promptTokens, r.outputTokens]), [
    [0, 4, 24],
    [0, 4, 24],
    [40, 128, 12],
    [46, 32, 8],
  ]);
  assert.deepEqual(STREAM_REQUESTS.map(reservedPages), [2, 2, 9, 3]);
  assert.equal(run("whole").version, STREAM_MODEL_VERSION);
  assert.equal(run("whole").status, "illustrative");
});

for (const capacityPages of [12, 24]) {
  for (const tokenBudget of [16, 32, 64]) {
    for (const policy of ["whole", "chunked"]) {
      test(`${policy}, ${tokenBudget} tokens, ${capacityPages} pages: exact event and resource conservation`, () => {
        const trace = run(policy, tokenBudget, capacityPages);
        assert.deepEqual(trace, run(policy, tokenBudget, capacityPages));
        assert.equal(trace.totalInputTokens, 168);
        assert.equal(trace.totalOutputTokens, 68);
        assert.equal(trace.finalReservationPages, 0);
        assert.ok(trace.peakReservationPages <= capacityPages);
        assert.ok(trace.steps.length > 0);
        const input = trace.steps.flatMap((step) => step.prefill);
        const output = trace.steps.flatMap((step) => step.decode);
        assert.equal(input.reduce((sum, entry) => sum + entry.tokens, 0), 168);
        assert.equal(output.reduce((sum, entry) => sum + entry.tokens, 0), 68);
        close(trace.iterationTimeMs, trace.steps.reduce((sum, step) => sum + step.durationMs, 0));
        close(trace.overheadMs, trace.steps.length * STREAM_COSTS.overheadMs);
        let reserved = 0;
        for (const [index, step] of trace.steps.entries()) {
          assert.equal(step.index, index);
          assert.ok(step.endMs > step.startMs);
          if (index) assert.ok(step.startMs >= trace.steps[index - 1].endMs);
          reserved += step.admitted.reduce((sum, entry) => sum + entry.pages, 0);
          assert.equal(step.reservationStartPages, reserved);
          assert.ok(reserved <= capacityPages);
          reserved -= step.released.reduce((sum, entry) => sum + entry.pages, 0);
          assert.equal(step.reservationEndPages, reserved);
          const prefillTokens = step.prefill.reduce((sum, entry) => sum + entry.tokens, 0);
          const decodeTokens = step.decode.reduce((sum, entry) => sum + entry.tokens, 0);
          // every step decomposes into overhead + calibrated prefill blocks + one memory-bound decode step
          close(step.durationMs, STREAM_COSTS.overheadMs + STREAM_COSTS.prefillMsPerBlock * prefillTokens + step.decodeMs);
          assert.equal(step.overheadMs, STREAM_COSTS.overheadMs);
          assert.equal(step.decodeMs > 0, decodeTokens > 0);
          if (policy === "whole" && prefillTokens) assert.equal(decodeTokens, 0);
          if (policy === "chunked") assert.ok(prefillTokens + decodeTokens <= tokenBudget);
          for (const emission of step.emitted) {
            assert.equal(emission.atMs, step.endMs);
            assert.ok(step.decode.some((entry) => entry.id === emission.id));
          }
          for (const entry of step.prefill)
            assert.ok(!step.decode.some((decode) => decode.id === entry.id),
              `request ${entry.id} decoded during its prefill step`);
        }
        assert.equal(reserved, 0);
        for (const request of trace.requests) {
          assert.ok(request.admissionMs >= request.arrivalMs);
          assert.ok(request.prefillEndMs >= request.admissionMs);
          assert.equal(request.tokenMs.length, request.outputTokens);
          assert.ok(request.tokenMs[0] > request.prefillEndMs);
          assert.ok(request.tokenMs.every((t, i) => i === 0 || t > request.tokenMs[i - 1]));
          assert.equal(request.completionMs, request.tokenMs.at(-1));
          assert.equal(request.ttftMs, request.tokenMs[0] - request.arrivalMs);
          assert.equal(request.interTokenGapsMs.length, request.outputTokens - 1);
          close(request.maxGapMs, Math.max(...request.interTokenGapsMs));
          assert.equal(trace.steps.filter((step) => step.released.some((e) => e.id === request.id)).length, 1);
        }
        assert.equal(trace.finishMs, Math.max(...trace.requests.map((r) => r.completionMs)));
      });
    }
  }
}

test("24-page comparison exposes the pause versus first-token tradeoff", () => {
  const whole = run("whole");
  const chunked = run("chunked");
  // calibrated (Qwen3-4B, H100): reading an 8,192-token document in one step stalls a live answer
  near(whole.requests[2].admissionMs, 44.02);
  near(chunked.requests[2].admissionMs, 44.02);
  near(whole.requests[0].maxGapMs, 224.52);
  near(chunked.requests[0].maxGapMs, 23.47);
  near(whole.requests[2].ttftMs, 228.54);
  near(chunked.requests[2].ttftMs, 261.26);
  assert.ok(chunked.overheadMs > whole.overheadMs);
  assert.ok(chunked.finishMs > whole.finishMs);
  const gap = longestTokenGap(whole.requests[0].tokenMs);
  near(gap.startMs, 44.02);
  near(gap.endMs, 268.54);
  near(gap.durationMs, 224.52);
  assert.ok(whole.steps.some((step) => step.prefill.some((e) => e.id === 3 && e.tokens === 128)));
  assert.ok(chunked.steps.filter((step) => step.prefill.some((e) => e.id === 3)).length > 1);
});

test("12 pages hold the long request until release, while decode keeps progressing", () => {
  for (const policy of ["whole", "chunked"]) {
    const trace = run(policy, 16, 12);
    const firstRelease = Math.min(trace.requests[0].completionMs, trace.requests[1].completionMs);
    assert.ok(trace.requests[2].admissionMs >= firstRelease);
    assert.ok(trace.requests[3].admissionMs >= trace.requests[2].admissionMs);
    assert.ok(trace.steps.some((step) =>
      step.waitingIds.includes(3) && step.decode.some((entry) => entry.id === 1 || entry.id === 2)));
    near(trace.requests[0].maxGapMs, 4.53);
    assert.equal(trace.peakReservationPages, 12);
  }
  const baseline = run("whole", 16, 12);
  const chunked = run("chunked", 16, 12);
  assert.equal(chunked.requests[0].maxGapMs, baseline.requests[0].maxGapMs);
  // with no live answer left to protect, chunking changes the document's first token little either way
  assert.ok(Math.abs(chunked.requests[2].ttftMs - baseline.requests[2].ttftMs) < 0.1 * baseline.requests[2].ttftMs);
  assert.ok(chunked.overheadMs > baseline.overheadMs);
});

test("the authored film clock never reverses for any capacity or budget", () => {
  for (const capacityPages of [12, 24]) for (const tokenBudget of [16, 32, 64]) {
    const pair = {
      whole: run("whole", tokenBudget, capacityPages),
      chunked: run("chunked", tokenBudget, capacityPages),
    };
    const finish = Math.max(pair.whole.finishMs, pair.chunked.finishMs);
    let prior = -Infinity;
    for (let filmMs = 0; filmMs <= STREAM_FILM_DURATION_MS; filmMs += 100) {
      const frame = streamFilmFrame(filmMs, pair);
      assert.ok(frame.serviceMs >= prior, `${capacityPages} pages, ${tokenBudget} tokens reversed at ${filmMs}`);
      assert.ok(frame.serviceMs <= finish);
      prior = frame.serviceMs;
    }
    close(streamFilmFrame(STREAM_FILM_DURATION_MS, pair).serviceMs, finish);
    assert.ok(streamFilmFrame(5_000, pair).serviceMs <= streamFilmFrame(10_000, pair).serviceMs);
  }
});

test("invalid settings and an individually impossible reservation fail before scheduling", () => {
  for (const config of [
    { policy: "unknown", tokenBudget: 16, capacityPages: 24 },
    { policy: "chunked", tokenBudget: 0, capacityPages: 24 },
    { policy: "chunked", tokenBudget: 20, capacityPages: 24 },
    { policy: "chunked", tokenBudget: 16, capacityPages: 0 },
    { policy: "whole", tokenBudget: 16, capacityPages: 12, requests: [] },
    { policy: "whole", tokenBudget: 16, capacityPages: 12, requests: [{ id: 1, arrivalMs: 0, promptTokens: 192, outputTokens: 24 }] },
    { policy: "whole", tokenBudget: 16, capacityPages: 24, requests: [{ id: 1, arrivalMs: -1, promptTokens: 1, outputTokens: 1 }] },
  ]) assert.throws(() => simulateStream(config));
});

test("isolated request after idle time advances the service clock without charging idle work", () => {
  const trace = run("chunked", 16, 24, [
    { id: 7, arrivalMs: 0, promptTokens: 1, outputTokens: 1 },
    { id: 8, arrivalMs: 100, promptTokens: 1, outputTokens: 1 },
  ]);
  assert.equal(trace.requests[1].admissionMs, 100);
  assert.equal(trace.finalReservationPages, 0);
  assert.ok(trace.iterationTimeMs < trace.finishMs);
});
