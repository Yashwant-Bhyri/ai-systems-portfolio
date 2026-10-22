# Prefix reuse: complete mechanism, continuous comparison

## Delivery boundary

This is a finishing pass for Part 1's **KV prefix reuse** chapter. It preserves the existing detailed cold-prefill, stored-KV, suffix and attention graphics. It does not replace execution, scheduling, the new baseline/finale, analytical figures, or the accepted Part 2 prefill/decode film and token inspector. No Sol delegation, result-coefficient changes, new benchmark or physical GPU run.

The previous film switched from the mechanism at 10.4 seconds, although suffix computation started at 10.6 seconds and attention at 12.8. Those operations existed in code but were invisible during playback. The early-completion hold was only 1.7 seconds, followed by a rushed final comparison. The result card had a decorative arrow, not a connection to the interval.

## The revised sequence

| Authored time | Visible action | Continuity |
| --- | --- | --- |
| 0–5.5 s | First document read | Cold prefill is charged |
| 5.5–10.4 s | Retain KV; find a matching prefix | Reuse requires ready state |
| 10.6–12.8 s | Compute the new suffix | Exact warm-prefill work |
| 12.8–16 s | Attention reads retained context; answer starts | Same selected request, 25% of its decode by the handoff |
| 16–16.6 s | Crossfade into the paired lanes | Service cursor and output count hold, not restart |
| 16.6–21.8 s | Compare both executions | Same service clock, same output length and decode rate |
| 21.8–25.8 s | Reuse complete; baseline still running | Four-second exact early-completion hold |
| 25.8–29.4 s | Baseline finishes | Remaining work accrues visibly |
| 29.4–34 s | Final GPU-work comparison | Stable total, percentage and connected bracket |

Six named moment buttons allow direct inspection. The parent film consumes the exported 34-second duration. Mechanism output counts and the paired service view now come from the same `prefixComparisonFrame`/`prefixServiceAt` functions. Seeking backwards reconstructs both. Reduced motion uses the settled comparison and discrete camera switching, while manual moment controls remain available.

## What the image teaches

- A ready prefix removes repeated **input** computation, not answer generation. The selected shared-document request references 7,808 input tokens and computes 384 new ones.
- At reuse completion, the baseline is visibly still decoding. The same model trace gives 4,973 completed output tokens versus 1,626 at that instant.
- The remaining interval is 9.3696 seconds on the baseline's serial worker. Under this study's one-worker-per-lane service accounting, that corresponds to 9.3696 GPU-s of avoided work.
- The exact interval bracket connects to Δ 9.37 GPU-s in the result card. The card names KV prefix reuse, rather than a generic optimization. Mini work bars reproduce the same extra-work portion.
- Both workers have spent equal time **so far** at the first completion. The card therefore distinguishes running accumulation from total work per request. Final totals are 23.7548 versus 14.3852 GPU-s; the 39.4% reduction appears only after the baseline completes.
- Different documents give two equal 16.382-GPU-s lanes, zero matching tokens and zero savings. There is no gain connector or gain interval for this case.

The concise illustrative marker and collapsed assumptions remain. These are existing deterministic scenario results, not measured hardware telemetry. Queue delays, allocation/idle time, cache lookup overhead, eviction, memory pressure and transfer cost remain outside this service close-up.

## UX and engineering

The stage reserves geometry across representations, and the result card reserves room across its live/finished states. The cross-panel connector reads layout only on phase/layout changes or local scrolling, not on every animation frame. It is pointer-transparent and omitted in stacked layouts. Hidden scenes are inert and `aria-hidden`; SVG titles are single strings. The premature final percentage is hidden from accessibility as well as sight. Opening computation assumptions pauses playback.

At narrow widths the diagrams retain readable local scrolling; the card stacks and a visible scroll cue tells the visitor how to inspect the full pair. Reduced motion avoids leaving a half-faded mechanism/comparison on an intermediate manual seek. No new dependencies or independent animation loop were introduced.

## Verification

- **250 targeted tests pass**, including the two new prefix handoff/conservation tests. All eleven prefix tests cover both workloads, exact holds, readiness, cognition invariants, monotone service time, reverse seeking and cross-view token identity.
- TypeScript, targeted ESLint, production build, three relevant rendered-HTML checks and whitespace validation pass. Build retains the existing Node `module.register()` deprecation warning. No physical benchmark or entire legacy test suite was run.
- Desktop 1440×1050: sampled actual playback from 16.6 seconds through the final hold and onward into execution. The four-second early-completion hold retained the same 1,626/4,973 output counts and 14.39-second service cursor. Sampled chapter height stayed 820.84375 px; no layout jumps in that run.
- Opening methods while playing froze the cursor at 17,959.7 ms; it remained unchanged on the subsequent sample. Enter on the new-suffix moment selected 12,800 ms and paused.
- Reduced motion opened 34,000 ms with autoplay disabled and selectable moments. At 390×844, document width remained 390 px; the 316-px card stayed within the viewport. The diagram scrolls locally and the cross-panel line is omitted when stacked.
- Different-document inspection showed Δ 0, equal costs, and no connector. Browser reported no page errors during the checked flow.

Screenshots: `/tmp/prefix-finish-attention.png`, `/tmp/prefix-finish-early-final.png`, `/tmp/prefix-finish-mobile.png`, `/tmp/prefix-finish-no-match.png`. The mobile capture precedes the last scroll-cue addition; its card/layout are unchanged. The older `/tmp/prefix-finish-early.png` and `/tmp/prefix-finish-final-desktop.png` precede the clarified total-cost readout and are not final acceptance references.

## Recovery and next scope

Pre-edit archive: `/Users/yash/Portfolio/backups/portfolio-elite-bilingual-2026-09-21/pre-prefix-finish-20260929.tar.gz`, SHA-256 `f06e6374f0e78f003f2685b034a6e811fc10ea257aa7ff4179f9f5436513e9fa`. Saved before edits; checksum and gzip integrity rechecked October 1. Final source checkpoint and checksum are recorded in the sibling `prefix-finishing-checkpoint-20261001.manifest.md`. Restore into a separate directory. Public assets, dependencies, build output and Git metadata are intentionally excluded.

Preview remains `http://localhost:3001/#inference-study`; the existing server is retained and port 3000 was not touched. No automation configuration or Git staging changed.

Next dedicated component: **Part 2 / Explore the serving system**. Its older map needs an authored mechanism-level experience, not another blanket restyle. Preserve the accepted prefill/decode film and token inspector, choose one next serving mechanism and explicitly show its operational consequence and tradeoff before expanding. Post-training remains later. This checkpoint is not acceptance of the entire inference laboratory.
