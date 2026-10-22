# Serving overview: locality, verification and delivery

## Delivered scope

The remaining overview connections now have dedicated scenes. The accepted admission, hardware, Part 1 and detailed cache/draft/stream investigations remain intact. This is a component checkpoint, not acceptance of the complete inference portfolio.

### Locality has an admission consequence

Request C's logical prefix/suffix blocks reference actual pages on the selected replica. A warm placement references B's two retained prefix pages and allocates one new suffix page. A cold placement builds all three pages on replica 2. A's live state and B's retained cache do not disappear when the route changes.

D is explicitly assigned to replica 1 in this bounded comparison. At its decision, warm C leaves only two free pages for D's three-page reservation. The third missing page is isolated and connected to the one-page-short consequence. Cold C leaves three free pages on replica 1, so D fits. This is a placement/memory example, not a measured routing-latency comparison. The detailed cache-routing experiment remains linked separately.

### Verification controls what reaches the answer

C's prefill must finish before drafting and verification appear. Two agreeing proposals become committed C1/C2; the first mismatch becomes the target's C3 correction. In the zero-agreement branch, the first mismatch invalidates the remaining draft suffix. Later target tokens are drawn sequentially, not as independently verified suffix proposals. Both branches retain the same C1/C2/C3 answer and the same original delivery events. No speedup is inferred from acceptance alone.

### Completion is not qualified delivery

The closing scene first retains the original A/B/C/D identities and actual emitted tokens: A/B/C complete; D cancels. It then explicitly introduces a separate five-request worked example with a fixed 500 ms observation window. It never treats the authored A–D clock as measured latency.

- R1: first token 40 ms, maximum token gap 20 ms, valid answer.
- R2: first token 160 ms; output is otherwise continuous and valid.
- R3: first token 40 ms, then a 100 ms inter-token stall; valid answer.
- R4: fast and continuous, but fails the declared independent validity check.
- R5: cancels without output and stays in the offered cohort.

TTFT targets of 100/180 ms and max-ITL targets of 60/120 ms change qualification, not the request traces. Default qualification is 1/5, relaxing either target admits exactly its affected request, and relaxing both gives 3/5. Four requests complete in every setting. Completed-request rate is 8/s; qualifying completion rate is 2/4/6 per second over the same 0.5 s window. These are worked-example arithmetic, not production goodput or project benchmark claims. Maximum ITL is not mean TPOT.

The active interval or quality marker connects directly to its consequence card. Request rows support keyboard focus, Enter/Space selection and Escape release. A transport revision invalidates old selections. All five rows and both rates remain visible; no excluded outcome silently disappears.

## One clock, deliberately paced

`serving-overview-playback.ts` maps a 128,000 ms presentation onto the unchanged 94,000 ms underlying trace. Holds preserve retained prefix, placement, admission and committed-answer states. Slow close-ups let verification and commitment finish visibly. The final five views receive 4, 4.8, 5.2, 4.4 and 5.6 seconds respectively, including at least 3.2 seconds after their reveal.

Seeking remains reversible, and direct chapter/moment controls select the same state as playback. Hardware and cancellation trace timings are unchanged. JSON v2 includes both clock coordinates, pacing, branch settings, the current frame and the independent delivery example. File: `serving-overview-exploration.json`.

The obsolete overview renderer and its unused inspection state were removed (1,348 lines). All ten overview chapters now use dedicated scenes. Chapter navigation reveals the selected chapter after viewport resizing as well as chapter changes. Narrow screens keep the diagram readable in a contained horizontal scroller with explicit mechanism/comparison shortcuts.

## Verification

- 330 selected model/presentation regression tests pass, including 23 new continuity, delivery and pacing checks.
- TypeScript, scoped ESLint and whitespace checks pass.
- Production build and three targeted rendered-HTML tests pass. An earlier SSR run overlapped the build and saw an incomplete generated manifest; the sequenced post-build run passes. The build's existing Node module-registration deprecation warning remains.
- Desktop screenshots reviewed warm/cold placement, accepted and rejected drafts, committed output, the latency intervals, qualification and pinned inspection. Connector/label intersections and selected-row annotation spacing were corrected.
- Live playback observed Locality at presentation 20 s, verification at approximately 32.03 s, and hardware execution at approximately 46.03 s. Placement and memory-decision holds stay at trace 21.95 s and 23.7 s. C's verified output follows its original event sequence.
- Keyboard inspection pauses and Escape releases. Latency-target controls change the qualified count 1 → 2 → 3 while invalid/cancelled requests remain excluded.
- Reduced motion reaches presentation 128,000 / trace 94,000 with Play disabled and the settled qualification view available. Browser media emulation requires a rendered frame before its change event is delivered; immediate pre-render reads were not treated as verification.
- Mobile 390 × 844: document width remains 390; a 1,000 px diagram is contained within 358 px; comparison pan reaches 642 px. The selected Delivery criteria tab stays visible after resize. The actual mobile comparison card was inspected, not just the controls above it.
- Export inspected at the reduced-motion endpoint: schema v2, both clock coordinates, pacing array, five offered requests, four completions and one qualifying completion at the default targets.

## Recovery and next scope

Pre-edit checkpoint: `/Users/yash/Portfolio/backups/portfolio-elite-bilingual-2026-09-21/serving-admission-verified-20261023.tar.gz`, SHA-256 `d65dda59f55168ba9d1b9f62aed17cbd95cfe3443a2144b7ae42f3d53bfc0fbf`. It remains untouched. The new source-and-visual checkpoint is named `serving-continuity-delivery-verified-20261023.tar.gz`; see its sibling manifest for contents and checksum.

Next is a bounded whole-inference integration review: discovery and navigation between Part 1's film/figures and Part 2's three exploration routes, return-state behavior, and a few representative transition/zero-benefit states. Do not restart accepted execution or stretch this delivery fixture into a production simulator. Fix concrete findings, then ask for user acceptance before treating inference as finished and transferring the established direction to post-training. Main-agent implementation continues; no Sol delegation, commits, resets, deployment or automation changes.
