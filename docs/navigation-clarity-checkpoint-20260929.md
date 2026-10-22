# Navigation and causal meaning, September 29

## Human feedback and scope

The user positively accepted Part 2's scheduling film and continuity inspector, but found names vague and navigation undiscoverable. The falling queue, first execution delta, mechanism attribution and main-film opening/finale still failed to communicate clearly. Every idea is registered in `feedback-20260929.md`. This pass responds to navigation, timing and attribution; it does not claim to finish the opening/finale or the whole laboratory.

## Implemented

- Part 1's two modes describe their contents. Figure navigation and its play control share a compact row on desktop. Chapter labels name scheduling, KV prefix reuse and prefill/decode execution. The workload select lives inside the chapter rail, replacing the extra full-width row.
- Part 2 names prefill/decode scheduling, system-map exploration and token continuity, with a short action description for each. TTFT and maximum ITL are explicit; the token inspector explains why maximum ITL is not mean TPOT.
- Execution replay visibly labels model checkpoint, runtime intervention and comparison measure. Its accepted 96-request picker is unchanged. Mobile checkpoint labels wrap above their controls, clear of the persistent contact trigger.
- Scheduling work and red idle-with-waiting segments have sum anchors and links to their corresponding ledger bars. Baseline/optimized/difference focus controls those links; no separate motion clock was introduced. On stacked layouts the matching sum anchors remain without a crossing leader.
- The first execution machine labels its difference as GPU-seconds saved **per request**, identifies faster prefill/decode with cache reuse unchanged, and explains the red remaining baseline interval after optimized completion. Existing machine geometry and downstream capacity scenes are preserved.
- Composition now shows ordered runtime contributions (reuse first, then faster rates) and training contributions (SFT then correctness RL). Contributions derive from the same model and reconcile with total cost/accuracy deltas. Accuracy includes its 96-task denominator and equally sized task families. No named benchmark or physical run is invented. The accounting disclosure states the conditional order and outcome-law boundary. Rounded component values have an approximation sign.
- Policy arrows route around point labels using rounded elbows rather than crossing the labels. Four-condition selection, evidence and comparison invariants remain intact.
- The load chart's x-axis is fixed to the full workload horizon. It labels the last arrival and queue-drain phase. At completion, endpoint markers and a horizontal delta connect to elapsed completion times in the card; it no longer displays two zero queues as the conclusion. The four-second completion hold precedes latency sorting.

## Updated timing

Load scene: 0–10 s arrivals; 10–13.5 s queue hold; 13.5–22 s drain; 22–26 s completion hold; 26–30 s transition/sort; 30–33.5 s baseline; 33.5–37 s optimized; 37–41 s difference.

The figure tour derives its load duration from `LOAD_FILM_MS`; total duration is now 92.5 s. Its transport reads the same constant. Request and subsequent composition holds retain their durations. Typed handoffs carry the updated local/global cursors. No task coefficients or request events were changed.

## Verification

- 209 selected model/presentation tests pass. Extended coverage verifies fixed queue coordinates, all-request completion before sorting, the four-second hold, exact ordered contribution sums, zero reuse contribution without matching inputs, unchanged scheduler, policy and task outcomes under runtime-only changes, and tour boundaries derived from chapter definitions.
- TypeScript, targeted ESLint, production build and three relevant SSR tests pass after final source changes. Two source/SSR expectations required updates for the explicitly requested label changes; evidence assertions remain unchanged. Existing bundle-size and Node module-registration warnings remain.
- Browser at 1440×1050: scheduling baseline holds connect only baseline work/idle to the ledger. Load scene at 18 s gives a 741.9-second workload clock with the drain explanation; at 24 s both runs have completed 96 requests and the linked endpoint comparison is 1232.5 → 648.5 seconds, 584 seconds earlier for this fixture.
- Global tour 44 s inspection opens local load 24 s at the completion hold, paused, with keyboard focus on the exploration region. Ordinary resume continues the authored clock. Reduced-motion queue selection lands at global 60.99 s, opens local 40.99 s and returns to global 60.99 s without autoplay.
- Keyboard Enter selects post-training comparison. Its contributions display +15.6 pp SFT and +9.4 pp correctness RL, summing to the fixture's +25 pp; runtime cost tradeoffs remain visible.
- At first execution divergence, the machine shows 2.83 GPU-s saved per request, with optimized completion and baseline residual work on the same service clock. This is not a new measured speedup.
- At 390×844 there is no page-level horizontal overflow; technical figures remain contained scroll regions. Part 2's three paths and TTFT/ITL labels are discoverable. Reduced-motion playback is disabled but seeking and controls remain available. No browser application errors were reported.

Screenshots: `/tmp/clarity-scheduling.png`, `clarity-navigation.png`, `clarity-completion.png`, `clarity-drain.png`, `clarity-mobile-request.png`, `clarity-part2-mobile.png`, `clarity-first-delta.png`, `clarity-policy-final.png`. Some early captures precede the final small connector/spacing corrections; the final policy capture includes corrected routing.

## Preview and recovery

Port 3000 is a different checkout: `/Users/yash/Documents/Resume/portfolio-elite` (PID 50975). Correct project was already running on **http://localhost:3001/#inference-study**, PID 51700. A duplicate launch briefly chose 3002 and was explicitly stopped (session 80770); both pre-existing servers were left untouched. Verify process cwd again on continuation.

Before editing: `pre-navigation-pass-20260929.tar.gz` in `/Users/yash/Portfolio/backups/portfolio-elite-bilingual-2026-09-21/`, gzip verified, SHA-256 `58c1af31e8431350a0d2067ccb009d2d20e9f0441b2b4eda87758e8dbbc03350`. Final scoped checkpoint is `navigation-clarity-checkpoint-20260929.tar.gz` in the same directory; sibling manifest gives its verified hash. Extract only into a separate comparison directory. No user changes were reset, broadly staged or committed.

## Still open

1. Main-film **Baseline serving**: replace the poorly understood opening with a focused workload-pressure scene using the accepted visual language. The title changed, not its underlying scene.
2. Main-film **Combined runtime gains**: teach accumulated scheduling, reuse and execution effects in their correct units; this is separate from Explore's policy/runtime composition figure.
3. Composition could go further by highlighting individual intervention arrows and corresponding contribution rows in sequence. Rows expose the arithmetic now, but are not yet a complete per-mechanism authored animation.
4. Prefix finishing and remaining broader Part 2 mechanisms. Preserve the accepted scheduling/continuity core.
5. Post-training only after inference is robust. No Sol delegation. No changes to the paused legacy automation.
