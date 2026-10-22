# Speculative draft verification checkpoint

October 9, 2026. Main-agent implementation, no delegation. Preview: `http://localhost:3001/#inference-study` → Part 2 → Explore the serving system → Speculative draft / verify.

## What this component teaches

The small draft proposes a continuation. The target checks its causal positions together. Only the consecutive matching prefix survives; a target correction replaces the first mismatch, and every later proposal is discarded. When all proposals match and output remains, the same target pass supplies a bonus unit. The next round begins at the exact committed prefix, not the rejected draft.

The operation carries into a user-visible output ribbon. The finale then separates fewer serial calls from wider verification and extra drafting. It does not turn a call-count reduction into an invented GPU speedup.

## Authored sequence and interaction

- 0–6.5 s: provisional proposals accumulate while the answer remains unchanged.
- 6.5–9.5 s: one target pass evaluates the causal positions together.
- 9.5–13.5 s: hold the match/mismatch boundary and target correction.
- 13.5–17 s: accepted and target-supplied units move into the persistent output ribbon.
- 17–27 s: repeat from the committed prefix. Stable narration prevents fast-forwarded rounds from cycling headlines.
- 27–31 s: the operation becomes a per-round accounting figure. The saved-call bracket connects directly to the result card.
- 31–38 s: retain the call saving, emphasize the extra target positions and draft units, then stop.

Partial/all/no agreement and two/four-unit proposals recompute the complete trace. Six moment shortcuts, a scrubber and round selection make the film reversible. The round-accounting groups also open the corresponding operation. Keyboard inspection pauses; Escape returns focus. A narrow screen keeps a readable, locally scrollable diagram with a stacked card and an advance scroll hint. Reduced motion disables automatic play and retains manual inspection. The module loads on first use and keeps its state when another serving view is selected.

## Exact accounting boundary

Twelve word-sized teaching units stand in for a greedy target continuation. This is not a checkpoint tokenizer, stochastic sampling implementation, GPU measurement or acceptance benchmark. The authored 38 seconds is presentation time, not device time.

| Four-unit proposal case | Baseline calls | Verification calls | Target positions | Draft units |
| --- | ---: | ---: | ---: | ---: |
| Partial match | 12 | 3 | 14 | 12 |
| All match | 12 | 3 | 12 | 10 |
| No match | 12 | 12 | 50 | 42 |

The partial case commits 3, then 5, then 4 units. Its first rejection discards two evaluated positions; the second round includes a target bonus. Every output unit retains its accepted-draft/correction/bonus origin through the finale. The no-match fixture earns no gain connector. Prefill, KV rollback cost, batching, routing, stochastic correction and load-dependent latency are outside this local model. No new credit is added to Part 1's cost results.

Research used for the mechanism and boundary: [Leviathan et al., ICML 2023](https://proceedings.mlr.press/v202/leviathan23a.html), [vLLM speculative decoding documentation](https://docs.vllm.ai/en/latest/features/speculative_decoding/). No published benchmark numbers were relabeled as portfolio measurements.

## Files and verification

New: `app/compute/draft-verification-model.ts`, `draft-verification.tsx`, `draft-verification.css`, `tests/draft-verification.test.mjs`. Scoped integration: `serving-under-load.tsx/.css`, `serving-load-overview.tsx`. Accepted prefill/decode and token-continuity implementations are unchanged. The older whole-system map remains reachable, including a handoff into this investigation.

Fourteen new tests check six control combinations, exact output-prefix conservation, output provenance, per-round cost conservation, all-match bonus, zero-acceptance behavior, reverse seeking, invalid inputs and every round shortcut. The selected regression suite has 264 checks; three relevant rendered-HTML checks are separate. TypeScript, scoped ESLint, production build and whitespace checks are included in the checkpoint verification.

Browser review at 1440×1050 covered the first mismatch, committed bonus, full 38-second replay, pause and Escape inspection, final accounting, no-match/zero-gain, and exported JSON matching the selected trace and cursor. The sampled desktop card stayed 462 px high through replay. At 390×844 the document width stays 390 px; the 730 px diagram scrolls inside its own region. Reduced-motion play is disabled and manual state remains available. Browser automation occasionally delayed commands; only subsequently observed states are counted as evidence. This is scoped component verification, not user acceptance or full-site accessibility certification.

## Recovery and next scope

Pre-edit archive: `/Users/yash/Portfolio/backups/portfolio-elite-bilingual-2026-09-21/pre-draft-verification-20261009.tar.gz`. Final archive and hashes are recorded in the sibling checkpoint manifest. Restore to a separate comparison directory, never over the dirty active checkout.

Next dedicated Part 2 mechanism: KV capacity and prefix locality under routing pressure. Show one request's actual allocation, local hit/miss, waiting or placement consequence and reclamation, with the same causal rigor. Do not convert this draft investigation into a generic template or expand the old map into ten static cards. Broader Part 2 still needs coupled coverage, whole-lab acceptance remains open, and post-training is the later milestone. Preserve Part 1 and the accepted serving film/inspector. No Sol delegation.
