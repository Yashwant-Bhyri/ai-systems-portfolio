import assert from "node:assert/strict";
import test from "node:test";
import { labComposition, simulateLab } from "../app/compute/lab-simulation.ts";
import { registerHooks } from "node:module";
import { requestComparisonFrame, matchedRequestComparison } from "../app/compute/request-comparison.ts";
import { loadFilmFrame, loadState } from "../app/compute/load-latency-model.ts";
import { PlaybackClock } from "../app/compute/playback-clock.ts";
registerHooks({ resolve(specifier, context, next) {
  if (specifier === "./lab-simulation" && context.parentURL?.endsWith("/composition-comparison.ts") || ["./load-latency-model", "./composition-comparison"].includes(specifier) && context.parentURL?.endsWith("/inference-figure-tour-model.ts")) return next(`${specifier}.ts`, context);
  return next(specifier, context);
} });
const { COMPOSITION_PHASE_START } = await import("../app/compute/composition-comparison.ts");
const { compositionComparison } = await import("../app/compute/composition-comparison.ts");
const { FIGURE_TOUR_CHAPTERS, FIGURE_TOUR_MS, figureChapterTime, inferenceFigureFrame } = await import("../app/compute/inference-figure-tour-model.ts");

for (const workload of ["interactive", "shared-prefix"]) for (const policy of [0, 2]) for (const budget of [1, 2, 4, 8]) {
  test(`${workload}, ${policy}, ${budget}x: tour and inspection reconstruct the same experiment`, () => {
    const context = { workload, policy, budget };
    const baseline = simulateLab(policy, budget, false, workload), target = simulateLab(policy, budget, true, workload);
    const points = labComposition(workload, budget);
    for (const time of FIGURE_TOUR_CHAPTERS.flatMap(chapter => [chapter.start, chapter.start + 3500, chapter.start + 7000, chapter.end - 1, chapter.end])) {
      const frame = inferenceFigureFrame(time, context), selection = frame.selection;
      const copy = JSON.parse(JSON.stringify({ ...context, time: frame.cursor, selection }));
      assert.deepEqual(inferenceFigureFrame(copy.time, copy), frame, "resuming a handoff must recover the original directed frame");
      assert.equal(selection.view, frame.chapter.view);
      if (selection.view === 1) {
        assert.equal(selection.state.time, frame.localTime);
        const compare = matchedRequestComparison(baseline, target, selection.state.taskId);
        assert.deepEqual(requestComparisonFrame(frame.localTime, compare.before.gpuSeconds, compare.after.gpuSeconds), requestComparisonFrame(copy.selection.state.time, compare.before.gpuSeconds, compare.after.gpuSeconds));
        assert.equal(compare.before.tokens, compare.after.tokens);
        assert.equal(selection.state.mechanism, "both");
      } else if (selection.view === 2) {
        assert.equal(selection.state.time, frame.localTime);
        const last = Math.max(...baseline.tasks.map(task => task.arrival)), finish = Math.max(...baseline.tasks.map(task => task.finish), ...target.tasks.map(task => task.finish));
        const directed = loadFilmFrame(frame.localTime, last, finish), inspected = loadFilmFrame(copy.selection.state.time, last, finish);
        assert.deepEqual(loadState(baseline, directed.elapsed), loadState(baseline, inspected.elapsed));
        assert.equal(selection.state.percentile, 95);
      } else {
        assert.equal(selection.state.time, frame.localTime, "composition inspection preserves sub-phase motion, not just chapter index");
        const result = compositionComparison(points, selection.selected, selection.state.lens);
        if (selection.state.lens === "runtime") {
          assert.equal(result.reference.policyIndex, policy);
          assert.equal(result.accuracyPoints, 0);
          assert.equal(result.gained + result.lost, 0);
        } else if (selection.state.lens === "policy") {
          assert.equal(result.reference.optimized, false);
          assert.equal(result.target.optimized, false);
          assert.equal(selection.state.metric, "accuracy");
        } else assert.deepEqual(result.path, [0, 2, 3]);
      }
    }
  });
}

test("one contiguous clock holds baseline, both mechanisms, final condition and comparison", () => {
  const context = { workload: "shared-prefix", policy: 2, budget: 2 };
  FIGURE_TOUR_CHAPTERS.forEach((chapter, index) => {
    assert.equal(chapter.start, index ? FIGURE_TOUR_CHAPTERS[index - 1].end : 0);
    assert.equal(inferenceFigureFrame(chapter.start, context).chapterIndex, index);
    assert.equal(inferenceFigureFrame(chapter.end - 1, context).chapterIndex, index);
    if (chapter.view === 0) for (let phase = 0; phase < 5; phase++) {
      const at = COMPOSITION_PHASE_START[phase], next = phase < 4 ? COMPOSITION_PHASE_START[phase + 1] : chapter.end - chapter.start;
      assert.equal(inferenceFigureFrame(chapter.start + at, context).selection.state.phase, phase);
      assert.equal(inferenceFigureFrame(chapter.start + next - 1, context).selection.state.phase, phase);
    }
    const settled = inferenceFigureFrame(figureChapterTime(index, true), context);
    assert.equal(settled.chapterIndex, index);
    if (chapter.view === 0) assert.equal(settled.selection.state.phase, 4);
    assert.equal(figureChapterTime(index, false), chapter.start);
  });
  assert.equal(inferenceFigureFrame(-1, context).cursor, 0);
  assert.equal(inferenceFigureFrame(FIGURE_TOUR_MS + 1, context).cursor, FIGURE_TOUR_MS);
  assert.throws(() => inferenceFigureFrame(NaN, context), RangeError);
  assert.throws(() => figureChapterTime(5, true), RangeError);
  for (const time of [81000, 20000, 10000, 40500, 0]) assert.equal(inferenceFigureFrame(time, context).cursor, time, "reverse seeking must not carry stale chapter state");
});

test("an inspected local cursor can initialize paused and resume without restarting", () => {
  const clock = new PlaybackClock();
  clock.configure("inspection", 33000);
  clock.seek(20500);
  assert.equal(clock.elapsed(100000), 20500);
  clock.configure("inspection", 33000);
  assert.equal(clock.elapsed(200000), 20500);
  assert.equal(clock.resume(200000), 12500);
  clock.pause(201500);
  assert.equal(clock.elapsed(205000), 22000);
});
