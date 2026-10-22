# Teaching-comparison verification, September 24

## Scope and checkpoint

Before editing, saved `pre-teaching-pass-20260924.tar.gz` outside the repo, including the existing tracked/untracked source. gzip and SHA-256 verified. Earlier execution, prefix and scheduling checkpoints remain untouched. No commit, deployment, reset or unrelated cleanup performed.

Story under test: select an inference chapter → one authored presentation clock drives a deterministic event trace → matching SVG and result ledger → downloadable comparison record. No external API, model or physical GPU is involved.

## Source and numerical checks

- TypeScript and targeted ESLint pass for the scheduling, execution direction, scale, reveal, parent story and origin components.
- 100 tests pass across compute-study, compute-motion, cinematic-film, lab-story, playback-clock, policy-film, execution-study, prefix-study, scheduling-study and execution-direction.
- Three relevant server-render tests pass. This is not a claim that the legacy full-repository source-assertion suite passes.
- Production build completes all five phases and prerenders two routes. Existing Node module-registration deprecation only.
- Idle-with-waiting is independently derived from event intervals. An idle worker with no arrived queued work contributes nothing. Idle time after the six-request cohort finishes contributes nothing. Both workloads have zero optimized avoidable idle intervals.
- Presentation holds do not mutate service events. Inverse controls round-trip through the moving clock; the exact burst endpoint remains in the burst scene, rather than jumping prematurely to the cost scene.
- Camera tests prevent selection of hidden or clipped requests. Difference shading is pointer-transparent.

## Browser review

- Desktop at 1440 × 1050: reviewed scheduling comparison; execution waterfall; fixed allowance; origin at 0, 0.4, 0.7 and 1; and burst completion difference.
- The 10-agent view connects requests to intake. The final origin retains a small view of agents 1–10, grouped population key and routing into two workers per runtime. Grouping does not imply extra hardware.
- Keyboard arrival selection pins the request and pauses; Escape releases. The request-2 counterexample accurately shows zero delivery gain when its start is unchanged.
- 390 × 844 viewport: page width remains 390; scheduling inspection region is 356 with a 660-wide diagram; execution region is 356 with a 620-wide diagram. Result card fits without page overflow.
- Reduced motion disables autoplay and retains manual seeking. The burst End key reaches scene time 69,500 ms, with both runtimes exactly at 1,000 completions and zero outstanding requests.
- A pointer hit at the highlighted waterfall interval resolves to the underlying request-18 selection, confirming the overlay cannot block it.
- Downloaded execution v4 JSON includes the selected presentation/model time, seed/specifications, trace and both 1,000-completion endpoint states. Status remains illustrative, not measured hardware execution.
- Scoped axe checks: zero violations in both changed films. SVG/gradient contrast remains an automated incomplete category; text was reviewed on its actual surfaces. Not a full-site accessibility certification.
- Follow-up playback review: the scheduling request-latency inset is now inspection-only. Autoplay no longer reveals that final comparison before its intervention. The heading and ledger result reserve stable space through the compare sequence. Native keyboard Play advances the shared clock; pause freezes it. This is a behavior check, not an FPS benchmark.

## Review discipline

Sol Ultra owned only two new files. It passed its own tsc/lint, then the parent reviewed and amended the visual/integration. A separate read-only audit found three concrete defects; all were fixed before verification. Screenshots and model accounting are required in addition to subagent output.

The opening workload, final composition and post-training improvements remain future work, not delivered by this pass.
