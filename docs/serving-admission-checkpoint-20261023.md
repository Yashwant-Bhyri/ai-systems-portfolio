# Serving overview: admission opening

## Delivered scope

The first three chapters of the serving-system overview now share a dedicated, persistent admission stage. This replaces the dense opening map for 0–18 presentation seconds only. The 94-second clock, A/B/C/D event trace, routing branches, accepted hardware close-ups, and detailed scheduling/cache/draft investigations remain intact.

The scene follows a concrete conflict:

1. A is generating an answer and owns three KV pages.
2. B arrives with seven input-work units. A's one decode unit plus B's seven exceed the six-unit scheduling budget. Its four-page reservation would fit the eight-page memory pool.
3. A four-unit input chunk passes both checks. The other three input units are visibly assigned to later steps, not discarded.
4. A's next token waits while B processes input. Passing admission is distinct from keeping output delivery continuous.
5. A resumes. When B finishes, its private pages are released and two reusable prefix pages remain for the next matching request.

Token-work snapshots and live memory ownership have explicit separate labels. After input processing completes, all seven input cells become processed; the interface no longer presents the remaining three as pending. The final consequence points to the two retained prefix cells rather than displaying an unexplained total occupancy figure.

## Interaction and direction

- Arrival, chunk separation, token reveals, and consequence leaders derive from the same reversible presentation cursor. There are no independent looping animations.
- Token budget, KV memory and output stream are inspectable with pointer or keyboard. Enter/Space pins and pauses; Escape releases. A transport revision invalidates old inspections even when returning to the same timestamp.
- Chapter-local moment controls expose the whole input, admitted chunk, waiting token, resumed stream and retained prefix. Manual Stream pause selection starts at a readable paused-token moment rather than freezing an undrawn connector.
- Reduced motion disables autoplay and selects settled chapter states. Mobile retains readable SVG geometry in a contained scroller with explicit mechanism/comparison pan controls.
- The JSON export includes the current admission state and its underlying overview frame. Presentation pacing is not relabeled as measured GPU service time.

## Verification on October 23

- Eight new admission-model tests pass, covering both resource gates, deferred input, the separate stream interruption, prefill completion, page retention, reversible motion, non-mutation, settled manual moments and identical opening decisions on both routing branches.
- The full selected model/presentation regression set passes: 307 tests. Three targeted rendered-HTML checks pass.
- TypeScript, scoped ESLint, production build and Git whitespace check pass. The build reports an existing Node module-registration deprecation warning, not a build failure.
- Desktop browser inspection at 1440 × 1050 covered the held token-budget failure, admitted chunk, waiting stream and retained-prefix conclusion. Consequence-card text bounds stay inside its panel. Application error output is empty.
- A fresh-browser live replay observed all opening state transitions and the return to Locality at approximately 18.016 presentation seconds. An earlier long-running browser evaluation stalled during a refresh and is not counted as successful verification.
- Keyboard pinning paused correctly; seeking away and back to 17.9 seconds did not resurrect the old pin.
- Reduced motion stopped at 94,000 ms with Play disabled. Selecting Admission settled at 11,900 ms with the full consequence leader visible.
- Mobile at 390 × 844 retained document width 390 px. The diagram stayed 1,000 px within its 358 px viewport; Show comparison reached the exact 642 px horizontal limit. Both mobile views were inspected visually.
- Export at 17,900 ms contained five occupied pages, two retained prefix pages, seven pages at admission, five admitted token-work units and three units deferred at admission. No new benchmark or performance result was added.

Screenshots are included with the external checkpoint; see its manifest for exact filenames and checksum. The preserved pre-edit baseline is `serving-hardware-verified-20261023.tar.gz` in `/Users/yash/Portfolio/backups/portfolio-elite-bilingual-2026-09-21/`.

## Next scope, not completion

The overview's Locality / Draft-verify connective presentation and Delivery criteria conclusion still use the older whole-system layout. Give those their own directed treatment while preserving the detailed cache-routing and draft-verification investigations. Do not spend another cycle restarting the admission opening or accepted execution machinery. Whole-inference acceptance and post-training remain pending. The goal stays active; no delegation, commits, resets, deployment or automation changes were made.
