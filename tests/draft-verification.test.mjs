import assert from "node:assert/strict";
import test from "node:test";
import {
  draftStudy,
  draftFrame,
  draftRoundMoment,
  DRAFT_DURATION,
  DRAFT_MOMENTS,
} from "../app/compute/draft-verification-model.ts";

for (const mode of ["mixed", "aligned", "miss"])
  for (const length of [2, 4]) {
    const study = draftStudy(mode, length);
    test(`${mode}/${length}: every commit preserves the exact target prefix`, () => {
      const output = [];
      for (const r of study.rounds) {
        assert.equal(r.start, output.length);
        assert.equal(r.accepted + r.rejected, r.proposal.length);
        assert.ok(r.committed.length > 0);
        assert.equal(r.evaluated, r.committed.length + r.discardedPositions);
        if (r.correction)
          assert.equal(r.committed.at(-1), study.target[r.start + r.accepted]);
        if (r.rejected) assert.equal(r.bonus, null);
        if (r.bonus) assert.equal(r.rejected, 0);
        output.push(...r.committed);
        assert.deepEqual(output, study.target.slice(0, r.end));
      }
      assert.deepEqual(output, study.target);
      assert.equal(study.outputOrigins.length, study.target.length);
      assert.equal(
        study.outputOrigins.filter((origin) => origin === "accepted").length,
        study.acceptedTokens,
      );
      for (const r of study.rounds) {
        assert.deepEqual(study.outputOrigins.slice(r.start, r.end), [
          ...Array(r.accepted).fill("accepted"),
          ...(r.correction ? ["correction"] : r.bonus ? ["bonus"] : []),
        ]);
      }
      assert.equal(study.callsAvoided + study.targetCalls, study.baselineCalls);
      assert.equal(
        study.targetPositions,
        study.baselineCalls + study.discardedPositions,
      );
      assert.equal(
        study.draftTokens,
        study.rounds.reduce((n, r) => n + r.proposal.length, 0),
      );
      if (mode === "miss") {
        assert.equal(study.callsAvoided, 0);
        assert.equal(study.acceptedTokens, 0);
        assert.ok(study.discardedPositions > 0);
      }
    });
    test(`${mode}/${length}: finite replay is monotone, reversible and exposes every round`, () => {
      let committed = 0,
        calls = 0;
      for (let ms = 0; ms <= DRAFT_DURATION; ms += 20) {
        const f = draftFrame(ms, study);
        assert.ok(f.committed >= committed);
        assert.ok(f.calls >= calls);
        assert.ok(f.committed <= study.target.length);
        assert.ok(f.proposed <= f.round.proposal.length);
        if (f.commit > 0) assert.equal(f.verdict, true);
        if (f.verdict) assert.equal(f.proposed, f.round.proposal.length);
        committed = f.committed;
        calls = f.calls;
        const earlier = draftFrame(ms, study);
        draftFrame(DRAFT_DURATION, study);
        assert.deepEqual(draftFrame(ms, study), earlier);
      }
      assert.equal(committed, study.target.length);
      assert.equal(calls, study.targetCalls);
      for (const r of study.rounds) {
        const f = draftFrame(draftRoundMoment(r.index, study), study);
        assert.equal(f.round.index, r.index);
        assert.equal(f.committed, r.end);
      }
      assert.deepEqual(
        draftFrame(27000, study).round,
        draftFrame(DRAFT_DURATION, study).round,
      );
    });
  }
test("mixed four-token example makes rejection and the bonus explicit", () => {
  const s = draftStudy();
  assert.equal(s.rounds[0].accepted, 2);
  assert.equal(s.rounds[0].rejected, 2);
  assert.equal(s.rounds[0].correction, "is");
  assert.equal(s.rounds[1].bonus, "fees,");
  assert.equal(s.targetCalls, 3);
  assert.equal(s.callsAvoided, 9);
  assert.equal(s.draftTokens, 12);
  assert.equal(s.targetPositions, 14);
  assert.deepEqual(
    DRAFT_MOMENTS.map((t) => draftFrame(t, s).beat),
    [0, 1, 2, 3, 4, 5],
  );
  assert.equal(draftFrame(10000, s).committed, 0);
  assert.equal(draftFrame(13000, s).committed, 0);
  assert.equal(draftFrame(16500, s).committed, 3);
});
test("invalid controls fail without inventing a result", () => {
  assert.throws(() => draftStudy("unknown"));
  assert.throws(() => draftStudy("mixed", 3));
  assert.throws(() => draftFrame(NaN, draftStudy()));
  assert.throws(() => draftRoundMoment(-1, draftStudy()));
  assert.throws(() => draftRoundMoment(12, draftStudy()));
});
