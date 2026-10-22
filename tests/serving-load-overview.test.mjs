import assert from "node:assert/strict";
import test from "node:test";
import {
  SERVING_BEATS,
  SERVING_OVERVIEW_DURATION_MS,
  SERVING_OVERVIEW_VERSION,
  servingOverviewFrame,
} from "../app/compute/serving-load-overview-model.ts";

const ids = ["A", "B", "C", "D"];
const routes = ["warm", "cold"];
const eventTimes = [
  0,
  4_200,
  6_500,
  9_000,
  13_600,
  14_800,
  15_600,
  17_300,
  19_000,
  21_300,
  22_300,
  22_600,
  23_000,
  24_800,
  26_000,
  26_600,
  27_000,
  28_200,
  30_000,
  43_000,
  56_000,
  78_000,
  82_300,
  88_000,
  SERVING_OVERVIEW_DURATION_MS,
];
const sampleTimes = [
  ...new Set([
    ...Array.from(
      { length: SERVING_OVERVIEW_DURATION_MS / 100 + 1 },
      (_, index) => index * 100,
    ),
    ...eventTimes.flatMap((at) => [
      Math.max(0, at - 1),
      at,
      Math.min(SERVING_OVERVIEW_DURATION_MS, at + 1),
    ]),
  ]),
].sort((a, b) => a - b);

function owners(frame, replica, owner) {
  return frame.pages[replica].filter((entry) => entry === owner).length;
}

test("the published unit is an authored story cursor, with finite bounded beats", () => {
  assert.equal(SERVING_OVERVIEW_VERSION, "serving-overview-schematic-v2");
  assert.equal(SERVING_BEATS.length, 10);
  assert.deepEqual(
    SERVING_BEATS.map((beat) => beat.at),
    [0, 6_000, 12_000, 18_000, 24_000, 30_000, 43_000, 56_000, 78_000, 88_000],
  );
  assert.equal(servingOverviewFrame(-1).storyMs, 0);
  assert.equal(servingOverviewFrame(Number.NaN).storyMs, 0);
  assert.equal(servingOverviewFrame(Number.POSITIVE_INFINITY).storyMs, 0);
  assert.equal(
    servingOverviewFrame(SERVING_OVERVIEW_DURATION_MS + 1).storyMs,
    SERVING_OVERVIEW_DURATION_MS,
  );
  assert.throws(() => servingOverviewFrame(0, "third-replica"), RangeError);
  for (const beat of SERVING_BEATS)
    assert.equal(servingOverviewFrame(beat.at).beat, beat.id);
});

for (const route of routes) {
  test(`${route}: every sampled frame conserves reservations and request identity`, () => {
    for (const at of sampleTimes) {
      const frame = servingOverviewFrame(at, route);
      assert.equal(frame.storyMs, at);
      assert.equal(frame.route, route);
      assert.deepEqual(Object.keys(frame.requests), ids);
      assert.equal(frame.pages.one.length, 8);
      assert.equal(frame.pages.two.length, 8);
      for (const replica of ["one", "two"]) {
        const pages = frame.pages[replica];
        assert.ok(
          pages.every(
            (owner) => owner === null || [...ids, "B-prefix"].includes(owner),
          ),
        );
        assert.ok(pages.filter(Boolean).length <= 8);
      }
      for (const id of ids) {
        const request = frame.requests[id];
        assert.equal(request.id, id);
        assert.ok(
          !(owners(frame, "one", id) && owners(frame, "two", id)),
          `${id} appears on two replicas at ${at}`,
        );
        if (["future", "queued", "held"].includes(request.phase))
          assert.equal(request.replica, null);
        if (["prefill", "decode"].includes(request.phase))
          assert.ok(request.replica);
      }
      assert.equal(owners(frame, "one", "A"), at < 24_800 ? 3 : 0);
      assert.equal(
        owners(frame, "one", "B"),
        at >= 9_000 && at < 17_300 ? 4 : 0,
      );
      assert.equal(owners(frame, "one", "B-prefix"), at >= 17_300 ? 2 : 0);
      assert.equal(owners(frame, "two", "B-prefix"), 0);
      assert.equal(frame.prefixReady, at >= 17_300);
      assert.equal(
        owners(frame, route === "warm" ? "one" : "two", "C"),
        at >= 21_300 && at < 28_200 ? (route === "warm" ? 1 : 3) : 0,
      );
      assert.equal(owners(frame, route === "warm" ? "two" : "one", "C"), 0);
      assert.equal(
        owners(frame, "one", "D"),
        at >= (route === "warm" ? 26_000 : 23_000) && at < 82_300 ? 3 : 0,
      );
      assert.equal(owners(frame, "two", "D"), 0);
      assert.ok(frame.requests.D.tokens.length === 0);
      assert.equal(frame.events.at(-1), frame.latestEvent);
      assert.ok(
        frame.events.every(
          (event, index) =>
            event.at <= at &&
            (index === 0 || event.at >= frame.events[index - 1].at),
        ),
      );
      if (frame.gate.request) {
        assert.equal(
          frame.gate.tokenPass,
          frame.gate.tokenUsed + frame.gate.tokenNeed <= frame.gate.tokenBudget,
        );
        assert.equal(
          frame.gate.memoryPass,
          frame.gate.memoryUsed + frame.gate.memoryNeed <=
            frame.gate.memoryCapacity,
        );
      } else {
        assert.equal(
          frame.gate.memoryUsed,
          frame.pages.one.filter(Boolean).length,
        );
      }
    }
  });

  test(`${route}: seeking backward reconstructs the same event and ownership state`, () => {
    for (const at of eventTimes) {
      const before = servingOverviewFrame(at, route);
      servingOverviewFrame(SERVING_OVERVIEW_DURATION_MS, route);
      servingOverviewFrame(Math.max(0, at - 1), route);
      assert.deepEqual(servingOverviewFrame(at, route), before);
    }
  });
}

test("the two admission checks show the rejected whole prefill and fitting chunk", () => {
  const whole = servingOverviewFrame(6_500);
  assert.equal(whole.requests.B.phase, "held");
  assert.equal(whole.requests.B.replica, null);
  assert.equal(whole.gate.request, "B");
  assert.equal(whole.gate.tokenPass, false);
  assert.equal(whole.gate.memoryPass, true);
  assert.equal(whole.gate.tokenUsed + whole.gate.tokenNeed, 8);
  const chunk = servingOverviewFrame(9_000);
  assert.equal(chunk.requests.B.phase, "prefill");
  assert.equal(chunk.gate.tokenUsed + chunk.gate.tokenNeed, 5);
  assert.equal(chunk.gate.memoryUsed + chunk.gate.memoryNeed, 7);
  assert.equal(chunk.gate.tokenPass && chunk.gate.memoryPass, true);
  assert.equal(chunk.requests.A.phase, "decode");
});

test("cold C repeats prefill while warm C references only replica one's retained prefix", () => {
  const warm = servingOverviewFrame(23_000, "warm");
  const cold = servingOverviewFrame(23_000, "cold");
  assert.equal(warm.requests.C.replica, "one");
  assert.equal(warm.requests.C.sharedPrefix, true);
  assert.equal(cold.requests.C.replica, "two");
  assert.equal(cold.requests.C.sharedPrefix, false);
  assert.equal(warm.gate.request, "D");
  assert.equal(warm.gate.memoryUsed + warm.gate.memoryNeed, 9);
  assert.equal(warm.gate.memoryPass, false);
  assert.equal(warm.requests.D.phase, "held");
  assert.equal(cold.gate.memoryUsed + cold.gate.memoryNeed, 8);
  assert.equal(cold.gate.memoryPass, true);
  assert.equal(cold.requests.D.phase, "prefill");
  assert.deepEqual(warm.requests.C.tokens, cold.requests.C.tokens);
});

test("A release admits held D; D cancellation releases only D-owned tiles", () => {
  const before = servingOverviewFrame(24_799, "warm");
  const released = servingOverviewFrame(24_800, "warm");
  const admitted = servingOverviewFrame(26_000, "warm");
  const cancelled = servingOverviewFrame(82_300, "warm");
  assert.equal(before.gate.memoryPass, false);
  assert.equal(released.gate.memoryPass, true);
  assert.equal(released.requests.D.phase, "held");
  assert.equal(admitted.requests.D.phase, "prefill");
  assert.equal(owners(admitted, "one", "D"), 3);
  assert.equal(cancelled.requests.D.phase, "cancelled");
  assert.equal(cancelled.gate.request, null);
  assert.equal(owners(cancelled, "one", "D"), 0);
  assert.equal(owners(cancelled, "one", "B-prefix"), 2);
  assert.equal(owners(cancelled, "one", "A"), 0);
  assert.equal(owners(cancelled, "one", "C"), 0);
  assert.equal(
    owners(servingOverviewFrame(82_300, "cold"), "one", "B-prefix"),
    2,
  );
});

test("the authored output reveal follows readiness and remains separate from service measurements", () => {
  assert.deepEqual(servingOverviewFrame(8_999).requests.B.tokens, []);
  assert.deepEqual(servingOverviewFrame(15_599).requests.B.tokens, []);
  assert.deepEqual(servingOverviewFrame(15_600).requests.B.tokens, ["B1"]);
  assert.equal(servingOverviewFrame(26_599).requests.C.phase, "prefill");
  assert.equal(servingOverviewFrame(26_600).requests.C.phase, "decode");
  assert.deepEqual(servingOverviewFrame(26_999).requests.C.tokens, []);
  assert.deepEqual(servingOverviewFrame(28_200).requests.C.tokens, [
    "C1",
    "C2",
    "C3",
  ]);
  assert.equal(servingOverviewFrame(28_200).requests.C.phase, "complete");
});
