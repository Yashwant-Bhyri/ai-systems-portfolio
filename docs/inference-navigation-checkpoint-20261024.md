# Inference navigation and return-state checkpoint — October 24

## Delivered

This is an integration pass over the accepted scenes, not another mechanism or a change to the experiment results.

- Part 1's experiment, figure story and three figure workspaces retain their selected chapter, request, metric and cursor when a visitor leaves and returns.
- Figure-story inspection intentionally initializes the corresponding explorer at the selected moment, even if that explorer was visited before. “Resume the figure story” returns to its retained cursor instead of restarting the tour. A changed workload/checkpoint remains a new experiment context.
- Part 2's “Explore the serving system” opens the full overview first. The four available investigations are explicitly named, with brief descriptions and associated controlled regions.
- Overview drilldowns to cache routing, draft verification and CPU/GPU scheduling overlap expose “Back to [chapter]”. Returning restores the paused overview position and keyboard focus to the opening control. The prefill/decode film has the same return contract for token inspection.
- Switching between Part 1 and Part 2 no longer discards the selected investigation or host profile. Unvisited panels remain unmounted; visited hidden panels retain state but disconnect their effects. Hidden playback does not consume elapsed time.
- Reduced-motion manual inspection survives a hide/reveal. Both custom clocks had to distinguish entering reduced motion from reconnecting effects under an unchanged preference.
- Narrow screens use a three-choice top navigation and two-column mechanism grid, reducing the height of the navigation without shrinking the diagrams or hiding destinations. Existing horizontal diagram inspection remains.

`RetainedLabPanel` uses React 19.2's Activity boundary, plus a lazy first-visit gate and hidden/inert wrapper. No new dependency. Experimental inputs, hardware assumptions, model equations and accepted scene geometry are unchanged. The older post-training figure presentation keeps its original mount-on-entry behavior; this is not the post-training redesign.

## Evidence

`node scripts/verify-lab-navigation-browser.mjs <owned-CDP-port> <absolute-output-directory>` tests an already-running QA browser on the port-3001 portfolio. It does not launch or attach to an arbitrary user browser.

The final browser run covers twelve groups: story round-trip, figure selections, tour-to-inspection handoff and resume, overview return and focus, whole-part return, cache/draft drilldowns, hidden clock suspension, reduced-motion continuity, reduced-motion overview, prefill/decode return, mobile containment/control targets, and runtime exceptions.

Representative checks:

- Request 24, answer-generation metric and 7-second figure cursor survive visiting both other figures.
- A tour inspection at 12 seconds opens Request 7 with the tour's total-work metric; resume continues near 12 seconds, not zero.
- Kernel fusion at trace time 46,000 ms returns unchanged after overlap inspection. Its reduced-motion settled trace position, 58,900 ms, also survives.
- Cache and draft drilldowns return to 20,000 and 32,000 ms, respectively, while preserving their own 12-second manual positions on revisiting.
- The hidden overlap cursor stays exactly fixed during a 700 ms wait, then advances only after returning.
- The token inspector retains its manually selected 11-second cursor under reduced motion.
- At 390 px viewport width, document width remains 390 px; all visible aria-controls targets resolve.
- No uncaught runtime exceptions in the browser run. Three captured desktop/mobile screenshots were visually reviewed. These checks are representative, not exhaustive device or assistive-technology coverage.

TypeScript, scoped ESLint and production build pass. The full suite remains **354 passing / 355 tests**. The sole failure is the pre-existing Profile source assertion expecting `const ROLES` in `tests/rendered-html.test.mjs`; all three SSR checks pass. Profile and its test remain byte-identical to the previous archive, SHA-256 `f5be60212be573094939f22e785273aa19530d7240535c3b18b2f8456737177f` and `7b5ad08c6edad18ed47035be74c18fd840e9639724f6af09d2817abad246e58f`. Do not claim the whole suite is green.

Scoped accessibility audit reported zero violations. Its manual-review item exposed an unnamed-role playback group; that role was corrected. SVG/overlapping-background contrast remains incomplete in automated analysis, not certified by this pass. Existing palette and explicit keyboard focus styles are retained.

## Recovery and next decision

Previous verified snapshot: `scheduling-overlap-verified-20261024.tar.gz`, SHA-256 `1ce046702751957c0d15f091e0049bb3c0075c008b5ae6905dada7becc408cff`. It remains untouched in `/Users/yash/Portfolio/backups/portfolio-elite-bilingual-2026-09-21/`.

New source-and-evidence snapshot: `inference-navigation-verified-20261024.tar.gz` in the same directory, with a separate manifest and checksum. Restore to a separate comparison folder, never over the active dirty checkout.

This is a reviewable inference checkpoint. Ask for the user's assessment of the full journey before declaring inference finished or expanding post-training. Do not restart the NetSphere source hunt, copy DeepInfer benchmark values, or indefinitely enlarge the overlap fixture. Reference directions remain in `visual-reference-direction-20261023.md`; the implemented overlap is recorded in `scheduling-overlap-checkpoint-20261024.md`. No deployment, delegation, Git reset/stage/commit or automation changes.
