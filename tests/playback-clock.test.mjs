import assert from "node:assert/strict";
import test from "node:test";
import { PlaybackClock } from "../app/compute/playback-clock.ts";

test("pause preserves the remaining scene time", () => {
  const clock = new PlaybackClock();
  clock.configure("0:0", 3200);
  assert.equal(clock.resume(100), 3200);
  clock.pause(2100);
  assert.equal(clock.resume(10000), 1200);
});

test("repeated holds neither double-count time nor reset progress", () => {
  const clock = new PlaybackClock();
  clock.configure("0:0", 8000);
  clock.resume(0);
  clock.pause(2000);
  clock.pause(5000);
  clock.configure("0:0", 8000);
  assert.equal(clock.resume(10000), 6000);
  assert.equal(clock.resume(11000), 5000);
  clock.pause(12000);
  assert.equal(clock.resume(15000), 4000);
});

test("offscreen and background time do not consume the narrative", () => {
  const clock = new PlaybackClock();
  clock.configure("1:0", 8000);
  clock.resume(100);
  clock.pause(2600);
  assert.equal(clock.resume(100000), 5500);
  clock.pause(100500);
  assert.equal(clock.resume(900000), 5000);
});

test("replay restarts even when the first scene is already playing", () => {
  const clock = new PlaybackClock();
  clock.configure("0:0", 3200);
  clock.resume(0);
  clock.pause(2400);
  clock.configure("0:1", 3200);
  assert.equal(clock.resume(2400), 3200);
});

test("each scene receives its own duration instead of the prior remainder", () => {
  const clock = new PlaybackClock();
  clock.configure("0:0", 3200);
  clock.resume(0);
  clock.pause(1000);
  clock.configure("1:0", 8000);
  assert.equal(clock.resume(1000), 8000);
  clock.pause(3000);
  clock.configure("2:0", 4200);
  assert.equal(clock.resume(3000), 4200);
});

test("Strict Mode setup-cleanup-setup does not restart a scene", () => {
  const clock = new PlaybackClock();
  clock.configure("0:0", 3200);
  clock.resume(100);
  clock.pause(101);
  clock.configure("0:0", 3200);
  assert.equal(clock.resume(102), 3199);
});

test("a delayed timeout cannot produce a negative remaining duration", () => {
  const clock = new PlaybackClock();
  clock.configure("0:0", 3200);
  clock.resume(0);
  clock.pause(5000);
  assert.equal(clock.resume(6000), 0);
  clock.pause(6000);
  clock.configure("0:1", 3200);
  assert.equal(clock.resume(6000), 3200);
});
