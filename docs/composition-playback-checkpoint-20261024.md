# Part 1 composition playback checkpoint

## Why this pass

The user explicitly asked for the contribution to register on the graph, not only in the result card, and for playback to feel authored rather than a succession of changed states. Review found that an entire intervention line appeared at once, the eventual optimized point could remain emphasized before its intervention, and “Play comparison” restarted instead of resuming. The different-document fixture also exposed overlapping condition labels.

This pass changes the presentation of the existing Policy × runtime figure. Its four conditions, intermediate runs, cohort, arithmetic and evidence boundary are unchanged. It is not a new benchmark or the later full Intelligence Efficiency Frontier product.

## Delivered behavior

- One 17.5-second presentation clock owns both the standalone explorer and its directed figure-story representation. The five existing phases and overall tour duration are unchanged.
- Each intervention has a 350 ms orientation pause, a 1,100 ms eased trace from before to after, then a 350 ms result reveal and a 1,700 ms fully settled hold. The cursor is a presentation marker, not an interpolated experimental run. Actual condition points and numerical results never move or interpolate.
- The origin remains emphasized while the intervention traces. The destination receives its ring on arrival; unrelated conditions remain visible. The final optimized point no longer gets premature emphasis during the intermediate KV-only step.
- A signed cost value is printed beside the actual horizontal bracket, and the accuracy delta sits beside its vertical projection. The same reveal drives the graph, exact delta and connecting line to the card. No independent CSS opacity timer trails the event clock.
- Each manual mechanism shortcut opens a settled comparison immediately. A range control supports reversible inspection. Continue resumes from that position; completed playback exposes Replay. The final frame explicitly resolves to 17,500 ms, fixing a timer/rAF race that otherwise left it a fraction of a frame short.
- A figure-story handoff now includes the exact composition sub-phase time. Inspecting midway through the trace preserves the cursor and reveal state rather than rounding to a whole chapter. Older phase-only initial state still resolves to a settled shortcut.
- Condition names sit beside their corresponding points, resolving the tight-spacing collision in the different-document case. The redundant final detour connector is removed; completed intervention segments retain the actual point-to-point geometry.
- A zero-length KV intervention has no moving cursor or duplicate intermediate diamond. The graph says “No shared prefix: every prompt still needs prefill” and “No cost change.” No invented reuse credit.
- Keyboard mechanism activation, visible slider focus, a spoken seconds value, reduced-motion manual inspection and horizontally inspectable mobile geometry remain available.

Impeccable's motion and brand guidance shaped the reveal order, result hold, sparse connectors and identity preservation. The React review kept the mechanism derivation memoized and introduced no new library or hidden independent animation loop.

## Verification

`scripts/verify-composition-motion-browser.mjs <owned-CDP-port> <absolute-output-directory>` uses an already-open owned QA browser on localhost:3001. It verifies nine groups: runtime trace/result ordering, SFT/RL and combined dimension focus, keyboard activation, no-prefix equality, pause/resume/finite end, exact tour handoff, reduced-motion return, mobile containment and uncaught runtime errors. Eight screenshots cover moving and settled desktop states, the counterexample and mobile inspection. The new before/after emphasis is tested without changing any condition's coordinates; the result reveal does not change stage height.

The whole-laboratory navigation script is rerun separately so this clock change cannot silently break the preceding integration checkpoint. Its twelve groups cover retained state and return paths across both parts.

Two additional model tests verify trace-before-result ordering, monotonic bounded reveal, readable holds, settled manual shortcuts, reversible seeking and invalid-input rejection. Existing tour tests now assert exact composition sub-phase time in every workload, checkpoint and allowance combination.

TypeScript, scoped ESLint and production build pass. Full suite: **356 passing / 357 tests**. The one older failure still expects `const ROLES` in the Profile source. Profile and its test are unchanged; this pass does not alter or bypass that unrelated assertion. The three rendering/route checks pass. Browser and screenshot checks are representative, not an exhaustive device or assistive-technology certification.

The final scoped axe audit reports zero violations; contrast remains incomplete because of layered/graphical backgrounds. The audit's skipped heading level and labeled container without a role were corrected. A two-second desktop animation sample recorded 120 frame intervals, mean 16.805 ms, p95 16.8 ms, one interval above 33 ms. This is a local smoothness spot-check, not a cross-device performance guarantee.

## Recovery and scope

Untouched prior snapshot: `/Users/yash/Portfolio/backups/portfolio-elite-bilingual-2026-09-21/inference-navigation-verified-20261024.tar.gz`, SHA-256 `482a311fd3bfb199888f935abb9a0460c9b5257e27d316486ff2f86bd62e9144`.

New snapshot: `composition-playback-verified-20261024.tar.gz` in the same directory, with a sibling checksum manifest. It includes source, regression logs and browser evidence. Restore to a separate comparison directory, never over the dirty checkout.

This closes the identified composition motion defects, not the full portfolio objective. Preserve accepted Part 1 mechanism films and Part 2 investigations. The integrated inference checkpoint still needs the user's visual assessment; broader post-training presentation remains pending. Do not restart the reference hunt or indefinitely add detail to this one figure. No deployment, delegation, Git stage/reset/commit or automation changes.
