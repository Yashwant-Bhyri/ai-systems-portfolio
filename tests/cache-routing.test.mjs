import assert from "node:assert/strict";
import test from "node:test";
import {
  cacheRoutingStudy,
  cacheRouteState,
  cacheRoutingFrame,
  cacheRoutingSweep,
  CACHE_ROUTING_DURATION,
  CACHE_ROUTING_MOMENTS,
} from "../app/compute/cache-routing-model.ts";

for (const retained of [true, false])
  for (const occupied of [4, 8])
    for (const releaseMs of [0, 20, 40, 80, 100]) {
      const config = { retained, occupied, releaseMs };
      test(`page conservation and exact events: ${JSON.stringify(config)}`, () => {
        const s = cacheRoutingStudy(config);
        for (const key of ["warm", "cold"]) {
          const r = s[key];
          assert.equal(new Set(r.blockTable).size, 8);
          assert.equal(r.blockTable.length, 8);
          assert.equal(r.allocated.length + r.reuse, 8);
          assert.equal(r.firstToken - r.prefillEnd, s.decodeMsPerToken);
          assert.equal(r.complete - r.prefillEnd, 32 * s.decodeMsPerToken);
          assert.equal(r.prefillEnd - r.start, r.prefillBlocks * s.prefillMsPerBlock);
          assert.equal(r.start, r.newBlocks > r.headroom ? r.release : 0);
          for (let t = -1; t <= s.horizon; t += 0.5) {
            const f = cacheRouteState(s, key, t);
            assert.equal(f.pages.length, 12);
            assert.equal(f.free + f.retained + f.owned, 12);
            assert.ok(f.owned <= 12);
            if (t < r.start) {
              assert.equal(f.emitted, 0);
              assert.equal(f.prefilled, 0);
            }
            for (const page of f.pages) {
              if (page.kind === "resident") assert.ok(t < r.release);
              if (page.logical !== null)
                assert.equal(r.blockTable[page.logical], page.id);
              if (page.kind === "private")
                assert.ok(t >= r.start && t < r.complete);
            }
            if (t >= r.firstToken) assert.ok(f.emitted >= 1);
            else assert.equal(f.emitted, 0);
            if (t >= r.complete) {
              assert.equal(f.emitted, 32);
              assert.equal(
                f.pages.filter((p) => p.kind === "private").length,
                0,
              );
            }
          }
          const end = cacheRouteState(s, key, s.horizon);
          assert.equal(end.retained, 4);
          assert.equal(end.free, 8);
          assert.equal(end.owned, 0);
          assert.equal(end.workMs, r.prefillBlocks * s.prefillMsPerBlock + 32 * s.decodeMsPerToken);
        }
        assert.equal(s.delta, s.cold.firstToken - s.warm.firstToken);
        assert.equal(s.delta, s.workAvoided * s.prefillMsPerBlock - s.warm.start);
      });
    }
test("routing crossover separates saved work from first-token latency", () => {
  const light = cacheRoutingStudy();
  // calibrated: 20 ms per 1,024-token page of prefill, 5 ms per output token (Qwen3-4B, one H100)
  assert.equal(light.warm.firstToken, 65);
  assert.equal(light.cold.firstToken, 125);
  assert.equal(light.delta, 60);
  const hot = cacheRoutingStudy({ retained: true, occupied: 8, releaseMs: 100 });
  assert.equal(hot.workAvoided, 4);
  assert.equal(hot.delta, -20);
  assert.equal(hot.winner, "cold");
  const tie = cacheRoutingStudy({ retained: true, occupied: 8, releaseMs: 80 });
  assert.equal(tie.delta, 0);
  assert.equal(tie.winner, "tie");
  assert.equal(hot.crossover, 80);
  const available = cacheRoutingStudy({
    retained: true,
    occupied: 4,
    releaseMs: 100,
  });
  assert.equal(available.warm.start, 0);
  assert.equal(available.crossover, null);
  const evicted = cacheRoutingStudy({
    retained: false,
    occupied: 4,
    releaseMs: 80,
  });
  assert.equal(evicted.workAvoided, 0);
  assert.equal(evicted.warm.start, 0);
  assert.equal(evicted.delta, 0);
  assert.deepEqual(
    cacheRoutingSweep(hot.config).map((p) => p.warm),
    Array.from({ length: 11 }, (_, i) => 45 + 10 * i),
  );
});

test("reuse references the existing pages and never releases a different request's pages", () => {
  const s = cacheRoutingStudy({ retained: true, occupied: 4, releaseMs: 100 });
  assert.deepEqual(s.warm.blockTable, [0, 1, 2, 3, 8, 9, 10, 11]);
  const admitted = cacheRouteState(s, "warm", 0);
  assert.deepEqual(
    admitted.pages
      .filter((p) => p.kind === "prefix")
      .map((p) => [p.id, p.refs, p.ready]),
    [
      [0, 1, true],
      [1, 1, true],
      [2, 1, true],
      [3, 1, true],
    ],
  );
  // while the warm request streams, the other request's pages stay resident and untouched
  const during = cacheRouteState(s, "warm", 99);
  assert.deepEqual(
    during.pages.filter((p) => p.kind === "resident").map((p) => p.id),
    [4, 5, 6, 7],
  );
  assert.equal(during.owned, 12);
  assert.equal(cacheRouteState(s, "warm", 100).pages.filter((p) => p.kind === "resident").length, 0);
  const complete = cacheRouteState(s, "warm", s.warm.complete);
  assert.equal(complete.retained, 4);
  assert.equal(complete.free, 8);
  assert.equal(complete.owned, 0);
  const releasedAtArrival = cacheRoutingStudy({
    retained: true,
    occupied: 8,
    releaseMs: 0,
  });
  assert.equal(cacheRouteState(releasedAtArrival, "warm", -1).owned, 0);
  assert.equal(cacheRouteState(releasedAtArrival, "warm", -1).free, 8);
});

test("allocated capacity is not presented as already-computed KV", () => {
  const s = cacheRoutingStudy();
  assert.equal(cacheRouteState(s, "cold", 19).pages[0].ready, false);
  assert.equal(cacheRouteState(s, "cold", 20).pages[0].ready, true);
  assert.equal(cacheRouteState(s, "cold", 20).pages[1].ready, false);
  const first = cacheRouteState(s, "cold", 125);
  assert.equal(first.emitted, 1);
  assert.equal(first.pages[6].ready, false);
  const fullOutputPage = cacheRouteState(s, "cold", 200);
  assert.equal(fullOutputPage.emitted, 16);
  assert.equal(fullOutputPage.pages[6].ready, true);
  assert.equal(fullOutputPage.pages[7].ready, false);
});
test("replay is reversible, holds both first-token events, and ends in reclamation", () => {
  for (const releaseMs of [0, 20, 40, 80, 100]) {
    const s = cacheRoutingStudy({ retained: true, occupied: 8, releaseMs });
    let prior = -1;
    for (let t = 0; t <= CACHE_ROUTING_DURATION; t += 100) {
      const f = cacheRoutingFrame(t, s);
      assert.ok(f.service >= prior);
      prior = f.service;
      const copy = cacheRoutingFrame(t, s);
      cacheRoutingFrame(CACHE_ROUTING_DURATION, s);
      assert.deepEqual(cacheRoutingFrame(t, s), copy);
    }
    assert.equal(
      cacheRoutingFrame(17000, s).service,
      Math.min(s.warm.firstToken, s.cold.firstToken),
    );
    assert.equal(
      cacheRoutingFrame(19000, s).service,
      cacheRoutingFrame(17000, s).service,
    );
    assert.equal(
      cacheRoutingFrame(23000, s).service,
      Math.max(s.warm.firstToken, s.cold.firstToken),
    );
    assert.equal(
      cacheRoutingFrame(24800, s).service,
      cacheRoutingFrame(23000, s).service,
    );
    assert.deepEqual(
      CACHE_ROUTING_MOMENTS.map((t) => cacheRoutingFrame(t, s).beat),
      [0, 1, 2, 3, 4, 5, 6],
    );
    const final = cacheRoutingFrame(CACHE_ROUTING_DURATION, s);
    assert.equal(final.chart, false);
    assert.equal(final.warm.retained, 4);
    assert.equal(final.cold.retained, 4);
  }
});
test("invalid controls do not invent a placement", () => {
  for (const bad of [
    { retained: true, occupied: 12, releaseMs: 0 },
    { retained: true, occupied: 8, releaseMs: -1 },
    { retained: true, occupied: 8, releaseMs: 101 },
    { retained: true, occupied: 8, releaseMs: NaN },
  ])
    assert.throws(() => cacheRoutingStudy(bad));
  assert.throws(() => cacheRoutingFrame(NaN, cacheRoutingStudy()));
  assert.throws(() => cacheRouteState(cacheRoutingStudy(), "warm", Infinity));
});

test("sensitivity sweep holds the crossover and the cold-route win, then restores the selected trace", () => {
  const s = cacheRoutingStudy();
  assert.equal(cacheRoutingFrame(30000, s).probeReleaseMs, 20);
  for (const t of [33000, 34000, 35000])
    assert.equal(cacheRoutingFrame(t, s).probeReleaseMs, s.crossover ?? 80);
  for (const t of [38000, 39000, 40000])
    assert.equal(cacheRoutingFrame(t, s).probeReleaseMs, 100);
  assert.equal(cacheRoutingFrame(41500, s).probeReleaseMs, 20);
  assert.equal(cacheRoutingFrame(41500, s).chart, false);
  assert.equal(s.config.releaseMs, 20);
  assert.equal(
    cacheRoutingStudy({ ...s.config, releaseMs: 100 }).winner,
    "cold",
  );
});
