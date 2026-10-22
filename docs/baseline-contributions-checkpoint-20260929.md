# Baseline journey, plotted contributions and distinct replay sections

## Scope and review

The latest human review rejected contributions that lived only in the purple card, competing cost/accuracy emphasis, jittery transitions, and a request-number heading hiding four different replay measures. It also reiterated that the opening and the main-film combined-runtime finale were weak. This pass implements the opening and the first three specific corrections. **The main-film combined-runtime finale remains the next dedicated component, not completed by these changes.** No Sol delegation, automation changes, coefficient changes or physical run claims.

## Baseline serving

`baseline-study.ts` projects the first eight existing requests, focusing request 7. The 28-second opening establishes arrivals and two workers, holds an idle-worker/queued-request conflict, advances through prefill and decode, then separates waiting from busy GPU work. The original request's identity, timestamps, input, output and worker assignment are preserved. Matching input is only identified in the shared-prefix workload. A free-worker hold is chosen from actual idle-with-waiting intervals; not all queue time is described as avoidable.

`baseline-reveal.tsx` replaces the opening's generic scheduling diagram/full-cohort sidebar. Its machine, counts, tokens, request timeline and linked readout share the parent clock. Directly selectable moments and three mechanism links lead into existing chapters. Reduced motion opens the settled accounting view. Detailed limits are collapsed rather than repeatedly narrated. The accepted scheduling/prefix/execution components are untouched.

Browser review found a hydration mismatch caused by multiple children in an SVG title. The title is now a single interpolated string; a fresh page load no longer reports that error. Do not suppress hydration errors to mask such defects.

## Contributions belong on the plot

Each composition now has five 3.5-second stages: baseline, contribution one, contribution two, final condition, and full comparison. Runtime shows a KV-reuse-only intermediate operating point, then faster prefill/decode. Policy shows an SFT checkpoint between Base and correctness RL. Combined shows policy first and runtime second. Intermediate values are calculated by the existing ordered counterfactuals, not borrowed benchmarks.

The active segment, named annotation, intermediate marker, projected delta, card values and contribution row describe the same before/after pair. Accuracy steps prioritize accuracy and de-emphasize cost without erasing its tradeoff. Cost steps do the reverse. Baseline and final holds focus a single operating point and its metric projection. Metric hover no longer advances the story. Reserved readout heights keep the plot stationary between SFT/RL holds (identical stage height and plot top in browser checks).

The linked figure tour is now **113.5 seconds**; its three composition chapters are each **17.5 seconds**. Queue film remains 41 seconds, request replay 20 seconds. Handoffs use phase 0–4; final comparison is phase 4, not the old phase 2. All durations derive from shared constants.

## Replay has four actual sections

Full-width navigation exposes Total GPU work, Input processing, Answer generation and Response latency, with scope and units. The heading names the selected metric; request identity is supporting metadata. `requestMeasureParts` and `requestMeasureUnits` give prefill and decode independent local clocks and phase-only geometry. Prefill completion does not release the worker or claim that the answer is complete. Its progress counts computed input tokens, while decode counts output tokens. Full work and arrival-relative latency retain their separate accounting. The existing 96-request picker remains intact.

## Verification

- 236 selected model/presentation tests pass, including ten new opening tests, sixteen lens-scope cases spanning both workloads/checkpoints/all budgets, and five-stage composition timing coverage. Event conservation, bounded counters, exact endpoints, unchanged inputs and reversible seeking are checked.
- TypeScript, targeted ESLint, production build and three relevant SSR checks pass in this pass. Existing large-bundle and Node module-registration warnings remain; no full legacy-suite or physical benchmark claim.
- Desktop browser: new opening's idle hold at 74.77 workload seconds connects 62.77 seconds of request-7 waiting to its card. Prefill and decode remain zero at that cursor. SFT and RL holds maintain the same stage bounds. Runtime and policy contributions select their intermediate points and dimension-specific values.
- Prefill replay at its first-completion hold: baseline has processed 304/8192 input tokens while optimized has processed 384/384; the card says prefill complete, not answer complete. Final input-work comparison is 9.8304 versus 0.3648 GPU-s for this fixture.
- At 390×844, all four replay sections are visible, page scroll width equals 390, and reduced motion disables autoplay without removing controls. The 113.5-second tour opens at its settled phase-4 comparison under reduced motion.

Screenshots in `/tmp`: `baseline-verified-wait.png`, `composition-kv-step.png`, `composition-sft-step.png`, `replay-prefill-section.png`, `replay-sections-mobile.png`. Some captures precede the final small label/focus treatment changes.

## Recovery and continuation

Pre-edit source checkpoint: `/Users/yash/Portfolio/backups/portfolio-elite-bilingual-2026-09-21/pre-baseline-opening-20260929.tar.gz`, gzip verified. Final archive and hash are in the sibling baseline-contributions manifest. Restore only into a separate directory. These scoped archives exclude dependencies, build output, public assets and `.git`; they are not standalone distributions.

Preview remains `http://localhost:3001/#inference-study`; port 3000 is a different checkout. No existing server was killed or replaced.

Next: main-film combined-runtime gains. It must carry the same workload through scheduling (waiting), reuse (repeated input work), and execution rates (remaining work). Do not conflate it with Explore's policy/runtime composition. Then revisit prefix finishing and the wider Part 2 mechanisms. Post-training remains a later milestone. Visually review motion and pacing again; passing tests are not user acceptance of the complete laboratory.
