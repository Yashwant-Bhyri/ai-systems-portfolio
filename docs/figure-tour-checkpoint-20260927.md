# Inference figure tour checkpoint — September 27

## Delivered and why

The inference `Play the figure story` entry previously bypassed the three recently redesigned explorers and opened older mean/latency plots with prose overlays. It now uses the accepted components themselves under a finite shared director. The tour explains one request's work, its workload's queue consequence, then the distinct policy/runtime effects. This is a Part 1 integration pass, not a redesign of the main Execute efficiently film or completion of Part 2.

New files: `app/compute/inference-figure-tour.tsx`, `inference-figure-tour-model.ts`, `inference-figure-tour.css`, `explorer-state.ts`, `tests/inference-figure-tour.test.mjs`.

Updated integration: `lab-results.tsx`, all three inference explorer components, `use-study-playback.ts`, `use-film-time.ts`. Composition arrows that change accuracy now route beside the point labels rather than crossing them. The older `FigurePresentation` remains mounted for post-training; its old inference branch is no longer the inference entry point.

## Direction and invariants

| Tour interval | Scene | What changes |
| --- | --- | --- |
| 0–20 s | One request | Request 7's input and output work, first completion, residual interval and final difference |
| 20–53 s | The waiting line | The same cohort arrives, queues, completes, then reorders into latency ranks |
| 53–63.5 s | Execution cost | Static → optimized under the selected checkpoint |
| 63.5–74 s | Policy quality | Base → Post-trained under static execution |
| 74–84.5 s | Both together | Base/Static → Post-trained/Static → Post-trained/Optimized |

The tour retains the current workload and budget. Request/queue/runtime scenes use the selected starting checkpoint. The final policy comparisons intentionally introduce the other checkpoint, with both conditions named on the figure. No simulation coefficients, outcomes, GPU claims or research-derived numbers changed.

The request and queue use their established local film projections. Each composition scene has 3.5-second reference, intervention and difference holds. One active director owns time; nested clocks are disabled in presentation mode. Reverse seeking reconstructs state rather than triggering a series of CSS animations. Scenario data and encoded evidence remain stable between frames.

## Inspection is a continuation

`Inspect this moment` passes a discriminated selection with workload, budget, starting policy and global time, plus the component's local state:

- Request: local time, request ID, mechanism and measure.
- Load: local time, percentile and optional matched request ID.
- Composition: selected condition, comparison lens, metric and reading phase.

The corresponding explorer mounts paused at that state. Metric/percentile/point selection from the tour opens the requested settled inspection. Keyboard focus moves to the exploration region. `Resume the figure story` returns to the saved global moment; it resumes the authored sequence, not a newly invented story based on subsequent free-form inspection. Changing workload or result tab clears the saved tour context.

The playback hooks gained optional initial cursor/autoplay settings; existing callers retain their previous defaults. Reduced-motion chapter shortcuts land 10 ms before each chapter end, aligned to the range step and still inside the intended chapter. Manual scrubbing remains possible. The transport stays reachable at the viewport bottom while the tour is tall.

## Verification

209 selected model/presentation tests pass, including 18 new tests. New coverage spans both workloads, both exposed starting checkpoints, all four modeled budgets, every scene boundary, three comparison holds, context serialization, reverse seeks, reduced-motion chapter endpoints and initialization of a paused clock. Existing playback, request, load, composition, serving, policy, prefix and scheduling suites remain passing.

TypeScript, targeted ESLint, production build and three relevant rendered-HTML checks pass. Existing large-chunk and Node module-registration warnings remain. No full legacy test suite or measured GPU execution claim is made.

Browser checks at 1440×1050 and 390×844:

- At tour 10 s: Request 7 shows baseline 615 / 4973 tokens versus optimized 4973 / 4973 and the released worker. Inspect opens the same request at local 10 s, paused, with the first-completion phase retained.
- At tour 40.5 s: queue investigation is sorting; Inspect opens local 20.5 s with ordering active and the p95 result still hidden. It does not jump to its final state.
- At tour 49 s: selecting p99 opens the settled load inspection at local 33 s with rank 96 / 96, paused. Both evidence records retain the same RL checkpoint, 2× budget, shared-prefix workload and 96 tasks; only runtime flags differ. Resume retains the authored tour cursor of 49 s.
- At tour 70.5 s: policy chapter compares Base/Static with Post-trained/Static; metric is accuracy and phase is difference. All three are retained in exploration. The policy tradeoff remains visible: more cost per correct answer in this fixture, not an invented all-axis gain.
- Reduced-motion queue chapter lands at global 52.99 s. Inspection opens at local 32.99 s, paused; returning retains global 52.99 s and disabled autoplay.
- Keyboard Enter on the Post-trained/Static point opens that selected evidence condition with the intended composition lens and metric; focus returns to the exploration region.
- Observed automatic playback crossing from 19.8 s into later chapters without resetting the director. It reached 83.08 s before explicit pause. Separate subsequent inspection found the cursor still at 83.08 s.
- Only one visible range transport exists within the directed request scene. Mobile has no page-level horizontal overflow; technical plots remain readable in contained horizontal regions. The inspect button was moved clear of the persistent contact trigger.
- No browser application errors were reported. An idle automation session later returned `about:blank`; reopening the local page restored the session. This was not treated as application verification.

Screenshots: `/tmp/figure-tour-request.png`, `/tmp/figure-tour-sorting.png`, `/tmp/figure-tour-policy.png`, `/tmp/figure-tour-mobile.png`. Captures are included in the archive. Request and policy captures were refreshed after the compact-height and arrow-routing corrections. The final production build was repeated successfully after the context-header correction.

## Recovery and remaining scope

Verified prior checkpoint: `/Users/yash/Portfolio/backups/portfolio-elite-bilingual-2026-09-21/load-latency-checkpoint-20260927.tar.gz`, SHA-256 `e087be52782396e2e757f9879dda50fb8f56706191c3b74bb5442f54036f10ee`.

New checkpoint: `inference-figure-tour-checkpoint-20260927.tar.gz` in the same directory, with a sibling manifest containing its hash and scope. Extract only into a separate comparison directory. No unrelated user work was reverted or broadly staged.

Next: finite finishing pass on prefix/scheduling result connections, Part 1 opening/finale, then broader authored Part 2 serving mechanisms. Preserve the accepted operational SVGs and the existing detailed execution film. Post-training, including its old figure tour, remains later. The user's rejection of further Sol delegation still governs. This checkpoint completes the inference tour connection, not the whole laboratory.
