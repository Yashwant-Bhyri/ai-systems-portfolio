import assert from "node:assert/strict";
import { test } from "node:test";
import { simulateLab } from "../app/compute/lab-simulation.ts";
import { phaseTotals, servingPhases } from "../app/compute/serving-phases.ts";

const runs = [simulateLab(2, 2, false, "shared-prefix"), simulateLab(2, 2, true, "shared-prefix")];

test("the phases add up to the model's own decode, prefill and queue time", () => {
  for (const run of runs) {
    servingPhases(run).forEach((p, i) => {
      const q = run.tasks[i];
      assert.ok(Math.abs(p.reason + p.write - q.decode) < 1e-9);
      assert.equal(p.read, q.prefill);
      assert.equal(p.wait, q.queueSeconds);
      assert.ok(p.reason > 0 && p.write > 0);
    });
    const t = phaseTotals(servingPhases(run));
    assert.ok(Math.abs(t.read + t.reason + t.write - run.gpuSeconds) < 1e-6);
  }
});
test("no thinking budget means no reasoning share", () => {
  for (const p of servingPhases(simulateLab(2, 1))) assert.equal(p.reason, 0);
});
