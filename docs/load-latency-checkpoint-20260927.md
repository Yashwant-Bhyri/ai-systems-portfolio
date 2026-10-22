# Load & latency checkpoint — September 27

## Delivered

Part 1 → Explore the figures → Load & latency now explains how a queue becomes a latency distribution. This is the third direct-ownership explorer pass, after Composition and matched-request Execution replay. The main execution film, post-training and the older narrated figure tour were not redesigned in this pass.

New files: `app/compute/load-latency-model.ts`, `load-latency-explorer.tsx`, `load-latency-explorer.css`, `tests/load-latency.test.mjs`. Integration: `lab-results.tsx`. Full-run evidence JSON is memoized rather than reserialized on every presentation frame. Existing simulator coefficients, tasks and outcome counts are unchanged.

## The visual argument

1. The same requests arrive at two workers per runtime. Waiting request marks, occupied workers, request identities and completed counts all come from exact service events.
2. A staircase counts arrived requests still waiting. At the last arrival, the clock holds for 3.5 seconds; a bracket connects the actual queue-count difference to its result card.
3. The remaining queue drains. Only after every request completes does the full-cohort latency distribution appear.
4. Each request moves from arrival position to its independently sorted latency rank. Its latency and identity do not change during this presentation transform. The consequence card holds a short ordering cue; percentile values, controls and the Δ stay hidden until ordering settles, without collapsing the card's layout.
5. Baseline, optimized and difference each receive a 3.5-second settled reading. The selected boundary projects to an exact Δ bracket and the card. Responses slower than that boundary are amber.

The film is finite at 33 seconds, reversible by its slider, and has direct queue/sort/final controls. Its workload clock and film clock have different labels. Reduced motion starts at the final comparison and preserves manual inspection.

## What the comparison means

This view compares no reuse/static rates with ready-prefix reuse/faster declared rates, with the same policy, budget, arrival trace, logical input/output, outcomes, two workers and scheduling rule. It is not a new scheduling algorithm comparison. All values are illustrative calculations, not real GPU or LLM measurements.

p50/p95/p99 use nearest rank in each run. With 96 requests, p95 is rank 92 and p99 is rank 96. The two percentile endpoints can belong to different requests. Clicking a point, using arrow/Home/End keys or using the request slider switches to a matched-request comparison; its two ranks may differ. This state exposes queue time plus execution time for that request.

Ties count all responses at or below the selected latency, not just the nominal rank. Queue conservation is arrived = waiting + running + completed. Running requests do not count as waiting. Sparse arrivals can show no queue reduction. Interactive/shared-prefix presets change input lengths and arrival spacing together; the workload switch is not an isolated arrival-rate experiment.

## Checked fixtures

- Post-trained / 2× / shared-prefix, at the last arrival (190 s): 78 baseline requests waiting versus 64 optimized; 16 versus 30 complete; two workers running in each lane. Δ = 14 fewer waiting, not 14 extra concurrent workers.
- Same fixture p95: 1005.4899999999998 → 445.3590999999998 s, a 560.1309 s difference. Both selected boundaries happen to be request 92; four responses in each run take longer. The code does not assume equal boundary identities.
- Both exported records retain policy `rl`, budget 2, shared-prefix workload, 96 requests and 67 correct outcomes. Baseline flags are reuse off / fast rates off; optimized flags are on / on; both use continuous scheduling.
- Base / 2× / interactive, at last arrival: no waiting requests in either run. The card displays equality, not a gain. The queue axis has distinct integer ticks even in this zero-queue case.
- Keyboard Home selects the fastest baseline request (request 2 in the shared-prefix fixture), not blindly request 1. End selects request 96. Both lanes then retain that selected identity.

## Verification

191 selected model/presentation tests pass, including 19 new load/latency tests. New coverage spans both exposed policies, both workloads and all four modeled budgets, every queue event and between-event states, two-worker conservation, percentile identities/ties, invalid comparisons, zero queue and monotone/reversible film projection. TypeScript, targeted ESLint, production build and three relevant rendered-HTML checks pass. Existing >500 kB chunk and Node module-registration deprecation warnings remain. No full legacy-suite or GPU benchmark claim is made.

Browser review: 1440×1050 desktop and 390×844 mobile. Checked queue and percentile links, point and native-slider inspection, keyboard Home/End, both scenario exports, reduced-motion disabled autoplay with manual queue selection, and no page-level horizontal overflow. Narrow screens use a contained horizontally scrollable plot and stacked result; the cross-panel leader is suppressed. The sorting scene preserves 192 marks and hides the comparison leader until coordinates settle. The browser reported no application errors.

A long-lived browser automation session stalled during an asynchronous timer evaluation after multiple HMR/build changes. A fresh session loaded and operated normally. Separate observations confirmed playback advanced to 11.49 s and remained at exactly 11.49 s after pause through later inspections. Do not interpret the stalled automation command as a passed timing test; the fresh-session check is the verification.

Screenshots: `/tmp/load-queue-desktop.png`, `/tmp/load-sorting-desktop.png`, `/tmp/load-tail-desktop.png`, `/tmp/load-tail-mobile.png`, `/tmp/load-zero-queue.png`. The zero-queue capture precedes the integer-tick correction; use the live source for final ticks. The dev server was confirmed listening on port 3000 after the build.

## Recovery and next work

Verified preceding checkpoint: `/Users/yash/Portfolio/backups/portfolio-elite-bilingual-2026-09-21/matched-request-replay-checkpoint-20260927.tar.gz`, SHA-256 `747ce8b02dabf90648f96530c31ee80cf82c5e88cb7d693801f7afe9b9605caf`.

New checkpoint: `load-latency-checkpoint-20260927.tar.gz` in the same directory; the sibling manifest records its final hash and scope. Extract into a separate comparison directory, never over the working tree. No unrelated user changes were reset, committed or broadly staged.

Next: update the older FigurePresentation tour so it does not use outdated generic plots alongside the new explorers. Preserve the separate Part 1 prefix/scheduling-link and opening/finale backlog, broader authored Part 2 mechanisms, and later post-training. The user rejected further Sol delegation. These three explorer passes are a bounded checkpoint, not acceptance of the entire inference laboratory.
