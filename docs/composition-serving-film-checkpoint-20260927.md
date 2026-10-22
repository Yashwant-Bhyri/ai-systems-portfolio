# Composition and the live-answer film, September 27

## Scope and intent

Direct main-agent implementation following the user's rejection of Sol's rigid overview and explicit reminder to continue unfinished Part 1. No agents were dispatched. This checkpoint advances two bounded components, not the whole inference laboratory or post-training project.

The same standard governs both: preserve identity, isolate the changed mechanism, expose the exact difference in the picture, connect it to a request-level consequence, and keep evidence inspectable. Use motion to teach the comparison, not to decorate a result dashboard. The existing architecture, microscope, execution, prefix and scheduling films are preserved.

## Part 1: Composition in Explore the figures

New files: `app/compute/composition-comparison.ts`, `composition-explorer.tsx`, `composition-explorer.css`, `tests/composition-comparison.test.mjs`. Integration: `app/compute/lab-results.tsx`.

Three controlled lenses:

1. Runtime changes while checkpoint, task identity, output tokens and outcomes stay fixed.
2. Policy changes at the same runtime, retaining both task gains and negative flips.
3. Both compose through a policy leg followed by a runtime leg; each leg remains visible.

The four points stay in context. Cost and accuracy projections connect through matching Δ anchors to the corresponding result. The finite baseline/intervention/difference comparison holds each for 3.5 seconds. Direct point, dimension and phase selection pause playback. Hover/focus can expose a dimension without changing the selected evidence record. Reduced motion retains manual phase access.

The comparison uses the existing 96-task scenario. There is no new data fit. Runtime attribution distinguishes a shared-prefix hit case from the no-matching-prefix case; scheduling is fixed across these four conditions. Policy comparison exposes total work and correct-answer denominators. Equal accuracy is not called the same correct set unless the paired outcomes agree.

The Composition explorer is not the five-chapter film's composition finale. Execution replay, Load & latency and the old narrated figure tour remain follow-up work.

## Part 2: Protect the live answer

New files: `app/compute/serving-pressure-state.ts`, `serving-pressure-film.tsx`, `serving-pressure-film.css`, `tests/serving-pressure.test.mjs`. Integration and state transfer: `serving-under-load.tsx`, `stream-continuity.tsx`.

The default Part 2 surface now follows four requests on two synchronized machines. Request 1 is already streaming when requests 3 and 4 bring more input. Each machine exposes the same document, current KV reservations, current iteration's input/output allocation, delivered answer tokens and timestamp marks. The current service cursor drives all of them. Memory, input, compute and token elements open focused inspections with keyboard support.

The authored sequence establishes the stream, brings in the document, isolates baseline interruption, reveals chunked input with decode in the loop, compares the longest token gap, then exposes the new request's first-token tradeoff. Diagram brackets connect to the paired consequence rows. The underlying trace is the existing `stream-continuity-model.ts`, unchanged. Tiles are schematic, not a hardware profile.

At 24 reserved pages:

| Chunked token budget | Existing stream gap, baseline → chunked | New document first token, baseline → chunked |
| --- | --- | --- |
| 16 | 56 → 10.25 ms | 58 → 105.25 ms |
| 32 | 56 → 13.5 ms | 58 → 79 ms |
| 64 | 56 → 21.5 ms | 58 → 68 ms |

At 12 pages, both existing-stream gaps are 6 ms because the long document waits for admission. The new request still pays a first-token tradeoff. All values are additive illustrative event costs, not measured GPU timings or production SLOs. The stream gap includes the input-priority effects of both arriving requests, not only request 3. The model reserves whole-request capacity, not a physical paged allocator.

The deeper inspector receives the exact token budget, page pool and film cursor, paused. A second transfer after changing settings remounts it with the new configuration. The old serving-system overview remains a secondary surface and is not credited as an accepted redesign.

## Verification

- 154 selected compute/model/presentation tests pass, including 10 new composition tests and 13 new operational-state tests. They cover all supported workload/budget comparisons, all six serving configurations, event conservation, bounded reservations, exact token emissions, reverse seeking, invariants, changed denominators and zero deltas.
- TypeScript and targeted ESLint pass for the changed sources.
- Production build passes with the existing >500 kB chunk warning. Three relevant portfolio server-render tests pass. No full legacy test-suite claim is made.
- Desktop 1440×1050: reviewed moving input/decode divergence, held gap comparison, first-token tradeoff, all six memory/budget result combinations and direct plot-to-result connectors. Playback advances; explicit pause freezes the cursor and the picture.
- Narrow 390×844: no page-level overflow in the new Composition or serving-film views; diagrams remain contained horizontal inspection regions and consequence panels stack. Wide connectors are omitted on stacked layouts.
- Composition keyboard point selection opens the matching evidence record; Escape closes it. Policy comparison preserves a cost increase rather than painting every intervention as a saving.
- Serving keyboard Enter opens memory inspection; Escape closes it and restores the originating SVG focus. Deep handoffs verified at 64 tokens / 24 pages / 26 s and then 64 / 12 / 26 s, paused. Returning to the film preserves its state.
- Reduced motion disables autoplay/play, retaining a meaningful settled state and manual controls. No browser errors reported in the QA session.

Browser HMR occasionally left a nested lazy boundary waiting after source/build updates. A fresh hydrated page loads it correctly; final handoff checks used that fresh page. Do not mistake pre-hydration clicks or a stale HMR session for a verified production failure. Conversely, do not claim that a fresh load proves every long-lived development session is healthy.

Representative captures: `/tmp/composition-policy-repaint-sep27.png`, `/tmp/composition-combined-mobile-sep27.png`, `/tmp/serving-pressure-live-sep27.png`, `/tmp/serving-pressure-final-gap-sep27.png`, `/tmp/serving-pressure-mobile-tradeoff-sep27.png`.

## Recovery

Baselines are under `/Users/yash/Portfolio/backups/portfolio-elite-bilingual-2026-09-21/`:

- `explore-before-causal-composition-20260927.tar.gz`, SHA-256 `9044cb7c5b531d7b85bc7ca7f4a2adada83d5d5285a7e0b729c38cb8a80ec650`.
- `serving-overview-before-direct-redesign-20260927.tar.gz`, SHA-256 `1e06be9cab8ed0c8b49a3c3898e1504d88d97147b0dbbccebd52846f1f05b6c7`.
- Preceding Part 1 checkpoint: `part1-connected-capacity-checkpoint-20260927.tar.gz`, SHA-256 `9d7b0a91ebc795fc7c242e689755bfa3e80156ad9ff0b110fc9c659eed860e70`.

The new checkpoint is `composition-live-answer-checkpoint-20260927.tar.gz`, with a sibling manifest containing its hash and file scope. Extract only into a separate comparison directory. The working tree includes many pre-existing tracked and untracked user changes; no reset, broad staging or destructive restore was performed.

## Next bounded passes

1. Part 1: bring Execution replay and Load & latency exploration up to the same direct comparison standard. Avoid a second redesign of the already-understood execution machine.
2. Finish prefix/scheduling result connections with their own units and causal attribution. Review opening workload and the film's final composition separately from the new explorer.
3. Part 2: extend the authored experience to admission/locality and the broader serving loop, using the current film's continuity and tradeoff discipline, not its exact template. Speculation, precision, placement and lifecycle require their own bounded scenes and honest modeling boundaries.
4. Later, apply the learned grammar to post-training; preserve frozen-policy versus training-update distinctions and paired task regressions.

Keep both parts in scope. Do not dispatch Sol or call the broader serving-map candidate complete. See `visual-consequence-playbook.md` for the transferable decisions and `inference-feedback-register.md` for the user's ideas and their delivery status.
