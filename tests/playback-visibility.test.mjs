import test from "node:test";
import assert from "node:assert/strict";
import { latestPlaybackVisibility } from "../app/compute/playback-visibility.ts";

test("coalesced offscreen then onscreen observations resume the visible film", () => {
  assert.equal(
    latestPlaybackVisibility([
      { time: 100, isIntersecting: false },
      { time: 101, isIntersecting: true },
    ]),
    true,
  );
  // Chromium may batch entries at the same timestamp during viewport changes.
  assert.equal(
    latestPlaybackVisibility([
      { time: 100, isIntersecting: false },
      { time: 100, isIntersecting: true },
    ]),
    true,
  );
});
test("the latest offscreen observation still suspends hidden work", () => {
  assert.equal(
    latestPlaybackVisibility([
      { time: 100, isIntersecting: true },
      { time: 101, isIntersecting: false },
    ]),
    false,
  );
  assert.equal(
    latestPlaybackVisibility([
      { time: 100, isIntersecting: true },
      { time: 100, isIntersecting: false },
    ]),
    false,
  );
});
test("empty batches keep prior state and older observations cannot override new ones", () => {
  assert.equal(latestPlaybackVisibility([]), undefined);
  assert.equal(
    latestPlaybackVisibility([
      { time: 120, isIntersecting: true },
      { time: 110, isIntersecting: false },
    ]),
    true,
  );
});
