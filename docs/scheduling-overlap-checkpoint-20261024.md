# CPU/GPU scheduling overlap: October 24 checkpoint

## Delivered experience

Part 2 → Explore the serving system → **CPU/GPU scheduling overlap** is an original 28-second investigation. The overview's Kernel fusion chapter links to it as a distinct scheduling mechanism. Returning preserves the overview cursor. Existing Part 1 and other Part 2 investigations are unchanged except for this entry point.

One batch passes through CPU preparation, GPU execution and two output streams. The film exposes a GPU waiting interval, then highlights CPU preparation happening during GPU work. Only after explaining the overlap does the card reveal earlier final delivery. Exact brackets, endpoint guides and leaders connect the drawing to the consequence. A four-second early-completion hold leaves baseline visibly unfinished. Busy GPU work remains equal.

This adapts DeepInfer's asynchronous-scheduling explanation and the local Brain Scan clip's linked-representation principle. No assets or benchmark values were copied; no further NetSphere source search was performed. QwenGyre and the other reference applications remain proposals.

## Event model

One serial CPU and one serial GPU process a fixed two-stream batch for four decode steps. Each GPU step produces one illustrative output unit per stream. Next-step membership is known, sampled IDs remain on-device, and host delivery is not required before the next GPU step. The preceding GPU sample is still a dependency. CPU preparation and collection never overlap each other.

| Profile | Prepare / GPU / deliver per step | Final delivery, baseline → overlap | Busy GPU work, both | Tradeoff |
| --- | --- | --- | --- | --- |
| Balanced | 3 / 8 / 2 ms | 52 → 37 ms | 32 ms | Earlier delivery, not less arithmetic |
| Slower CPU | 10 / 8 / 4 ms | 88 → 60 ms | 32 ms | First output worsens: 22 → 24 ms |
| No CPU overhead | 0 / 8 / 0 ms | 32 → 32 ms | 32 ms | No gap and no gain |

These are declared teaching inputs, not device measurements. Fill/drain and residual CPU gaps remain. The allocated-device interval ends at final host delivery; it is not a billing measurement. Dynamic membership, network, cancellation, variable kernels and verification are out of scope. Words are illustrative units, not real tokenization or quality evaluation. These totals are not added to the independent 96-task cohort.

The presentation maps monotonically onto the selected millisecond schedule. Holds at 8–10, 10–12, 17–21 and 25–28 presentation seconds add no execution time. Shortcuts, reverse seeking and JSON use that same map. The overlap close-up is the intersection of preparation for step 3 with GPU step 2: 3 ms balanced, 4 ms slower CPU, zero without host overhead.

## Interaction and verification

- Selecting a GPU step or output selects the same identity in both lanes. Hover/focus previews; click/Enter/Space pins; Escape releases. Geometry quiets without muting the labels. Selected delivery deltas, equality and the first-output regression connect to the card.
- Playback pauses during inspection and in hidden panels. The overview drilldown returned to its tested 58,900 ms cursor. Reduced motion disables Play, opens a settled comparison and retains manual selection.
- Mobile 390 × 844 retains document width 390; the 1,000 px diagram is contained in 356 px. Comparison pan reaches 644 px. The current moment remains visible after resize.
- Actual downloaded JSON retained selected step 2, presentation 28,000 ms, execution 52 ms, equal 32 ms busy work, all intervals and assumptions.
- **21 model tests pass:** resource serialization, dependencies, conserved work, host bottlenecks, first-output regression, zero gain, reversible seeking and holds.
- TypeScript, scoped ESLint and production build pass. The full suite is **354 passing / 355 tests**, with one pre-existing failure: the source assertion in `tests/rendered-html.test.mjs` expects `const ROLES` from an older Profile implementation. Profile and this test are byte-identical to the previous archive: SHA-256 `f5be60212be573094939f22e785273aa19530d7240535c3b18b2f8456737177f` and `7b5ad08c6edad18ed47035be74c18fd840e9639724f6af09d2817abad246e58f`. They were not edited or bypassed. The three SSR checks pass; do not describe the full suite as green.
- Scoped axe reported zero violations, with SVG/gradient contrast incomplete. Manual palette checks put the lowest tested text/background pairing above 5:1. This does not establish exhaustive accessibility coverage.
- Eight desktop/mobile screenshots were reviewed. Label/leader collisions and card overflow were corrected. Browser assertions verify held execution time, hover pause/resume, the red later-output case, zero benefit, finite completion, reduced motion and mobile panning.

`scripts/verify-scheduling-overlap-browser.mjs <owned-CDP-port> <absolute-output-directory>` reproduces these checks against an already-open QA Chrome on the port-3001 portfolio. It captures eight PNGs and `verification.json`. It does not launch a server or attach to an arbitrary user browser. One earlier CLI evaluation overlapped hot reload and was discarded; the final assertion-based run completed after edits settled.

## Recovery and next scope

Previous baseline remains `/Users/yash/Portfolio/backups/portfolio-elite-bilingual-2026-09-21/serving-continuity-delivery-verified-20261023.tar.gz`, SHA-256 `07ca42c97b2d45b2cb3c7dd60d165c226951986abb5dab5a25a2902034d0a031`. The new checkpoint is `scheduling-overlap-verified-20261024.tar.gz` with a sibling manifest. Restore into a separate comparison directory, not over the dirty checkout.

This is a component checkpoint, not whole-inference acceptance. Next: bounded discovery/navigation/return-state review across Part 1's film and figures and Part 2's investigations, plus representative transitions. Then seek user assessment before declaring inference complete and expanding to post-training. Do not indefinitely enlarge this fixture. No Sol delegation, reset, deployment or automation edits.
