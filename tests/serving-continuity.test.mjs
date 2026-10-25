import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import {
  SERVING_BEATS,
  servingOverviewFrame,
} from "../app/compute/serving-load-overview-model.ts";
import {
  localityFrame,
  verificationFrame,
} from "../app/compute/serving-continuity-model.ts";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier === "./serving-load-overview-model" &&
      context.parentURL?.endsWith("/serving-overview-playback.ts")
    )
      return nextResolve(`${specifier}.ts`, context);
    return nextResolve(specifier, context);
  },
});
const {
  OVERVIEW_PACING,
  OVERVIEW_PLAYBACK_DURATION_MS,
  overviewTraceTime,
  overviewPresentationTime,
} = await import("../app/compute/serving-overview-playback.ts");

test("one 98.5-second presentation clock preserves the 94-second underlying trace", () => {
  assert.equal(OVERVIEW_PLAYBACK_DURATION_MS, 98500);
  assert.equal(overviewTraceTime(0), 0);
  assert.equal(overviewTraceTime(98500), 94000);
  assert.equal(overviewTraceTime(-1), 0);
  assert.equal(overviewTraceTime(98501), 94000);
  assert.throws(() => overviewTraceTime(NaN), RangeError);
  assert.throws(() => overviewPresentationTime(Infinity), RangeError);
});

test("presentation is monotone; every trace position is reversibly seekable", () => {
  let previous = 0;
  for (let t = 0; t <= 98500; t += 50) {
    const trace = overviewTraceTime(t);
    assert.ok(trace >= previous);
    assert.ok(
      Math.abs(overviewTraceTime(overviewPresentationTime(trace)) - trace) <
        1e-8,
    );
    previous = trace;
  }
  for (const beat of SERVING_BEATS)
    assert.equal(
      servingOverviewFrame(overviewTraceTime(overviewPresentationTime(beat.at)))
        .beat,
      beat.id,
    );
});

test("held consequences are frozen states, not additional service work", () => {
  for (const cue of OVERVIEW_PACING.filter((c) => c.from === c.to)) {
    const middle = overviewPresentationTime(cue.from);
    const before = servingOverviewFrame(cue.from);
    for (const offset of [-cue.durationMs / 2, -1, 0, 1, cue.durationMs / 2])
      assert.deepEqual(
        servingOverviewFrame(overviewTraceTime(middle + offset)),
        before,
      );
  }
});

test("the repeated mechanisms pass as a time-lapse; the rest plays at authored pace", () => {
  assert.equal(
    overviewPresentationTime(30000) - overviewPresentationTime(12000),
    4500,
  );
  assert.equal(
    overviewPresentationTime(43000) - overviewPresentationTime(30000),
    13000,
  );
  assert.equal(
    overviewPresentationTime(88000) - overviewPresentationTime(78000),
    10000,
  );
});

test("C is not allocated before admission and its block map references actual pages", () => {
  for (const route of ["warm", "cold"]) {
    const before = localityFrame(servingOverviewFrame(21299, route));
    assert.equal(before.admitted, false);
    const raw = servingOverviewFrame(21950, route),
      f = localityFrame(raw);
    assert.equal(f.admitted, true);
    assert.equal(f.newPages + f.reusedPages, 3);
    assert.equal(new Set(f.blockTable).size, 3);
    const owners = f.blockTable.map((i) => raw.pages[f.selectedReplica][i]);
    assert.deepEqual(
      owners,
      route === "warm" ? ["B-prefix", "B-prefix", "C"] : ["C", "C", "C"],
    );
  }
});

test("each delivery explanation has a settled authored hold before the next lens", () => {
  const starts = [88000, 89000, 90200, 91500, 92600, 94000];
  const durations = starts
    .slice(1)
    .map(
      (end, i) =>
        overviewPresentationTime(end) - overviewPresentationTime(starts[i]),
    );
  assert.deepEqual(durations, [4000, 4800, 5200, 4400, 5600]);
  // The 200 ms reveal in trace coordinates consumes 800 ms of presentation.
  assert.ok(durations.every((duration) => duration - 800 >= 3200));
});

test("warm C reuses pages but D cannot fit on the same replica", () => {
  const f = localityFrame(servingOverviewFrame(23700, "warm"));
  assert.equal(f.retained, 2);
  assert.equal(f.newPages, 1);
  assert.equal(f.dDecision, true);
  assert.equal(f.freeAtDecision, 2);
  assert.equal(f.dNeeds, 3);
  assert.equal(f.dShortfall, 1);
  assert.equal(f.dAdmitted, false);
});

test("cold C leaves exactly enough space for D, without erasing B's cache", () => {
  const raw = servingOverviewFrame(23700, "cold"),
    f = localityFrame(raw);
  assert.equal(f.newPages, 3);
  assert.equal(f.freeAtDecision, 3);
  assert.equal(f.dShortfall, 0);
  assert.equal(f.dAdmitted, true);
  assert.equal(raw.pages.one.filter(Boolean).length, 8);
  assert.equal(raw.pages.two.filter(Boolean).length, 3);
  assert.equal(f.retained, 2);
});

test("drafting and target checks cannot precede C's completed prefill", () => {
  for (const t of [24000, 25000, 26599]) {
    const f = verificationFrame(servingOverviewFrame(t), "accepted");
    assert.equal(f.ready, false);
    assert.equal(f.checked, false);
    assert.equal(f.verifyReveal, 0);
    assert.equal(f.delivered, 0);
    assert.equal(f.retained, 0);
  }
  assert.equal(
    verificationFrame(servingOverviewFrame(26600), "accepted").ready,
    true,
  );
  assert.equal(
    verificationFrame(servingOverviewFrame(26899), "accepted").checked,
    false,
  );
  assert.equal(
    verificationFrame(servingOverviewFrame(26900), "accepted").checked,
    true,
  );
});

test("an accepted prefix retains two proposals and corrects the first rejection", () => {
  const f = verificationFrame(servingOverviewFrame(26950), "accepted");
  assert.deepEqual(f.proposals, ["C1", "C2", "Cx"]);
  assert.deepEqual(f.checks, ["C1", "C2", "C3"]);
  assert.equal(f.retained, 2);
  assert.equal(f.discarded, 1);
  assert.equal(f.correction, "C3");
  assert.equal(
    f.delivered,
    0,
    "verified candidates are not silently emitted early",
  );
});

test("first mismatch invalidates the suffix instead of testing it independently", () => {
  const f = verificationFrame(servingOverviewFrame(26950), "loss");
  assert.deepEqual(f.checks, ["C1", null, null]);
  assert.equal(f.retained, 0);
  assert.equal(f.discarded, 3);
  assert.equal(f.correction, "C1");
});

for (const agreement of ["accepted", "loss"]) {
  test(`${agreement}: committed tokens and provenance match C's persistent stream`, () => {
    for (const [t, count] of [
      [26999, 0],
      [27000, 1],
      [27600, 2],
      [28200, 3],
      [28900, 3],
    ]) {
      const raw = servingOverviewFrame(t),
        f = verificationFrame(raw, agreement);
      assert.equal(f.delivered, count);
      assert.deepEqual(
        f.committed.map((c) => c.token),
        raw.requests.C.tokens,
      );
      assert.deepEqual(
        f.committed.map((c) => c.origin),
        Array.from({ length: count }, (_, i) =>
          agreement === "accepted" && i < 2 ? "draft" : "target",
        ),
      );
      assert.equal(f.retained + f.discarded, 3);
      assert.ok(
        f.committed.every((c) => !["Cx", "Cy", "Cz"].includes(c.token)),
      );
    }
  });
}

test("locality and verification remain pure under forward/backward inspection", () => {
  for (let t = 18000; t < 30000; t += 79) {
    const source = servingOverviewFrame(t),
      original = JSON.stringify(source);
    const l = localityFrame(source),
      v = verificationFrame(source, "accepted");
    localityFrame(servingOverviewFrame(94000));
    verificationFrame(servingOverviewFrame(94000), "loss");
    assert.deepEqual(localityFrame(source), l);
    assert.deepEqual(verificationFrame(source, "accepted"), v);
    assert.equal(JSON.stringify(source), original);
    for (const x of [
      l.routeReveal,
      l.consequenceReveal,
      v.verifyReveal,
      v.completeReveal,
    ])
      assert.ok(x >= 0 && x <= 1);
  }
});
