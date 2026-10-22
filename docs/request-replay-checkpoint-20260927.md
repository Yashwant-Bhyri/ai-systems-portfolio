# Matched request replay checkpoint, September 27

## Delivered

Part 1 → Explore the figures → Execution replay now provides a controlled, selectable request comparison rather than a mean-cost graphic with a separate single-condition sidebar. This follows `composition-serving-film-checkpoint-20260927.md`; all its work remains intact. Main-agent implementation only.

New: `app/compute/request-comparison.ts`, `request-replay-explorer.tsx`, `request-replay-explorer.css`, `tests/request-comparison.test.mjs`. Integration: `lab-results.tsx`. A small serving-film CSS correction preserves label contrast while muting inactive geometry.

The same 96-task simulator supplies baseline and selected mechanism runs. Select Base or Post-trained; isolate prefix reuse, faster declared execution rates, or both; select a request from the paired cohort strip. GPU work, input processing, answer generation and wait-plus-execution are separate result lenses. Same input/output and outcome are enforced. No simulator constants changed and no real-run claim was added.

## Playback and geometric contract

- One finite 20-second clock establishes the request, advances to first completion, holds it, exposes residual work, then settles into the comparison.
- Both lanes share the same service-relative clock, or the same arrival-relative clock when queueing is included. The model's queue and work intervals are not mixed.
- Live result rows count output tokens using declared uniform decode interpolation. The final result appears after the residual interval, or immediately on explicit inspection.
- Input and total-work endpoints project to an exact difference bracket and connect to the card. Decode durations get an explicitly aligned local-zero comparison because their original start offsets differ.
- The red residual interval appears while one lane still has work; it does not keep tinting the completed comparison. Labels stay legible while geometry is quieted.
- Native range selection and roving SVG keyboard focus both access all 96 requests. Selecting a request or metric pauses at its complete comparison. Direct first-completion and final-comparison controls remain available.
- The scenario record exports the selected mechanism flags, not the parent composition condition's default optimized flags.

## Verified cases

- Shared-prefix request 7 at Post-trained / 2×: baseline 23.7548 GPU-s, reuse-only 14.3852, combined 11.55405. Same 4,973 output tokens. Combined completion time from arrival: 80.4244 → 54.5025 s. Display values are rounded independently; exact arithmetic is available in inspection.
- Shared-prefix request 1, reuse only: 25.8128 → 25.8128 GPU-s, no prefix hit and no saving.
- Interactive request 7, reuse only: 16.3820 → 16.3820 GPU-s, no matching prefix and no saving.
- Rate-only evidence contains `reuse: false`, `fastKernels: true`, continuous scheduling, 96 tasks and no cache hits.
- At the combined request 7's first completion, the optimized lane has 4,973 tokens and a released worker; baseline has 615 interpolated tokens and is still executing.

## Verification

172 selected model/presentation tests pass, including 18 new tests. Coverage spans both workloads, both exposed policies, all four modeled budgets, every request and all three mechanism configurations. Input plus decode differences reconcile to work; queue plus work differences reconcile to completion time. Equal and slower-target fixtures, boundaries, reverse seeks and invalid comparisons are covered.

TypeScript, targeted ESLint, production build and three relevant server-render tests pass. The existing >500 kB build warning remains. `git diff --check` reports no whitespace errors in tracked changes; no full legacy test suite is claimed.

Browser review at 1440×1050 and 390×844: service/decode/queue views, direct Δ leader, warm/cold/no-hit cases, exact evidence flags, keyboard End to request 96, reduced-motion disabled autoplay/manual controls, no page-level horizontal overflow, no reported browser errors. Playback was observed advancing and then holding its cursor unchanged after explicit pause. A long-lived development browser evaluation took longer than its requested short timer while tooling was busy; a fresh session loaded and operated normally. The development server was restarted after port 3000 stopped listening and was confirmed listening again at handoff.

Captures: `/tmp/request-replay-service-sep27.png`, `/tmp/request-replay-decode-sep27.png`, `/tmp/request-replay-delivery-sep27.png`, `/tmp/request-replay-mobile-sep27.png`, `/tmp/request-replay-first-completion-sep27.png`. Early captures precede the last duplicate-divider and inactive-label contrast corrections; use the live view for final styling.

## Recovery and remaining scope

Recoverable preceding checkpoint: `/Users/yash/Portfolio/backups/portfolio-elite-bilingual-2026-09-21/composition-live-answer-checkpoint-20260927.tar.gz`, SHA-256 `d4a763732934cc66637e6550d5265fc885f654fdcef524a0ad511e31b2f2d89f`.

New source checkpoint: `matched-request-replay-checkpoint-20260927.tar.gz` alongside it, with a sibling manifest containing the hash and scope. No user changes were reset or broadly staged. Extract only into a separate comparison directory.

Next: Explore's Load & latency and its older figure-story tour; prefix/scheduling result links and the Part 1 opening/finale; broader authored Part 2 admission/locality/speculation/placement/lifecycle. Post-training remains later. The old mean execution plot is retained for the existing figure tour, which still needs a dedicated update. Neither the whole laboratory nor the broader serving overview is declared complete.
