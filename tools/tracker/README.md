# Stage tracker

Measures what is actually on screen in the laboratory, in viewport coordinates.

- `inject.js` — in-page recorder: `__track.snapshot(sel)` (layout blocks, every text line with its rendered px, opacity and clipping, every SVG/canvas graphic), `overlay(sel, issues)`, `startJank()` / `stopJank()` (frame times, layout shifts with the nodes that moved, long tasks).
- `analyze.mjs` — text over text, text crossed by a graphic, clipped / truncated / small text, largest empty area, block movement between frames.
- `track.mjs all [layout] [seconds]` — every module; `out/summary-<layout>.md`, a JSON report and an annotated screenshot per module.
- `jank.mjs [layout]` — smoothness of the title show: auto-advance, card clicks, hover, condensing, branch switches.
- `liveness.mjs [module] [branch] [layout] [seconds] [selector]` — are the small figures moving and are their labels readable.
- `filmstrip.mjs <name> <auto|click:<label>|branch:<n>>` — a transition as a sheet of frames 40 ms apart.

Needs the `exhibit-lab` dev server on :3290.
