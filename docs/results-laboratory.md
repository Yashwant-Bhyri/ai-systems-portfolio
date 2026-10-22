# Results laboratory · synthetic scenario v1

The third act of each compute chapter answers a different question from the architecture and microscope: **what changes at the output, and what does it cost?** It remains inside the established dark, live-system visual language. It does not replace the first two acts.

## Six linked visual components

The default entry is now a five-chapter guided experiment; the six figures below remain under **Explore the figures**. See [the interaction thesis](./laboratory-interaction-thesis.md). `lab-story.tsx` orchestrates finite, visibility-aware playback and reserved-space inspection. `lab-story-scenes.tsx` provides request lanes, a prefix reference diagram, proportional work accounting, conceptual reasoning routes, a linked cost–accuracy trail and task-level outcomes.

`lab-story-data.ts` generates the intervention ladder from the same simulator. Inference starts with a declared paired-batch barrier, then changes scheduler, ready-prefix reuse and execution coefficients independently. The final chapter is a summary, not another speedup; its comparison button returns to the initial state. The six older result figures retain their original continuous-scheduler baseline. Records export the exact mechanism tuple, including mixed reuse-on/static-rate states. Interactive prompts get no fictitious reuse dividend.

Training holds the nominal cap at 1× through Base/SFT/RL, then holds the RL policy fixed while changing its allowance, before comparing the efficiency-aware policy at that allowance. Choosing 1× explicitly shows no extra work, with coincident curve points merged into one labelled marker. Conceptual branches are not captured trajectories. Actual simulated cost per task is shown numerically beside accuracy.

| Project / view | Visual argument | Inspectable control |
|---|---|---|
| Inference / Composition | Horizontal runtime arrows preserve accuracy; a policy move changes quality; only non-dominated points form the frontier. | Four conditions, two workload traces |
| Inference / Execution replay | Prefill and decode occupy proportional work lanes; the correct-answer set stays identical. | Same checkpoint under both runtimes |
| Inference / Load & latency | A 96-request trace exposes queue growth and both p95 levels. | Interactive arrivals versus shared-prefix burst |
| Training / Capability map | Each task has a paired before/after square; new successes and negative flips are distinct. | Checkpoint, allowance, selected task |
| Training / Compute curves | Four policies at four allowances show quality against calculated work, not evenly spaced nominal budgets. | Any curve point, checkpoint, allowance |
| Training / Regression audit | Weighted flows preserve all 96 task identities across correct/incorrect states. | Checkpoint and allowance |

Manual exploration holds the selected condition while local motion continues. Pause freezes motion; replay restarts the narrated condition sequence. Reduced-motion users retain all data without animation. Small screens keep diagrams readable in labelled horizontal inspection regions and stack the exact-value readout underneath. A native range input provides keyboard access to all 96 task outcomes without requiring 192 tiny SVG tab stops.

## Explicitly synthetic, not manufactured evidence

`app/compute/lab-simulation.ts` is the entire data model. It executes no neural network. Ninety-six deterministic hashed difficulties are partitioned into three toy families. Policy-specific skill, growth, work multipliers and rare-regression rules generate outcomes and modelled token counts. They are declared design assumptions, not fitted estimates or perturbed published numbers.

- Nominal thought allowances: 1×, 2×, 4×, 8×. Modelled token work grows with `1 + log2(allowance)`, so allowance is not actual GPU cost.
- Synthetic work: prefill plus decode time, summed over every task including incorrect outcomes. Static coefficients: 1.2 ms/input token and 2.8 ms/output token. Optimized: 0.95 ms/input token and 2.25 ms/output token.
- Interactive trace: 2,048 input tokens, one request every 22 seconds. Shared-prefix burst: 8,192 input tokens, one request every 2 seconds, six prefix groups. First use is charged; reuse leaves 384 tokens to prefill.
- Two abstract serial workers; earliest-available assignment. End-to-end latency includes queueing. Nearest-rank p95 is the 92nd ordered latency of 96.
- Cost/correct = total simulated busy-work divided by correct outcomes. It is not a measurement of allocated device time and excludes idle allocation and verifier work.
- The same correctness and output-token vectors are used for both runtimes. Execution optimization cannot silently improve accuracy.
- New successes minus negative flips equals the change in correct outcomes. No smoothing, monotonic envelope or hidden removal of failed tasks.
- Pareto dominance maximizes synthetic accuracy and minimizes synthetic cost/correct, with at least one strict improvement.

The generated record includes all tasks, outcomes, tokens, timings, arrivals, worker assignments, cache decisions and assumptions. Prefix reuse is only credited when cached prefill is ready at request start. No model hash, runtime version, physical GPU, held-out dataset, independent verifier or confidence interval is fabricated. Those are missing real evidence, stated explicitly. Synthetic axes say task accuracy, not verified accuracy: outcomes come from a toy correctness rule, not an independent verifier. The real Qwen3-4B program remains pending.

## Research stays attributed and separate

The closed inspector links primary work on post-training, shared-prefix execution and test-time scaling. Published scores are not used to calibrate the synthetic model. `study-data.ts` retains explicitly attributed reference transcriptions for research audit only. `s1-reference.json` retains six pinned runs with per-task outcomes and retokenized thinking lengths; the adjacent reproduction script loads released samples and a tokenizer, never model weights. Neither fixture is an input to the public simulator.

## Verification

`tests/compute-study.test.mjs` covers all 64 simulator combinations, conservation of totals, deterministic identities, matched-runtime outcomes, cache warm-up, p95, paired flips, independent composition factors, Pareto dominance, unequal-cost AUC arithmetic, and the research-fixture boundary. `tests/rendered-html.test.mjs` checks server-rendered chapter navigation and all six laboratory controls.

Validated on 2026-09-21: production build, TypeScript, targeted ESLint, 21 compute/motion tests, and all three server-rendering tests passed. The separate legacy source-shape test still fails because it expects `const ROLES` in the independently refactored profile component; that unrelated implementation was left intact.

Live browser checks covered all six views, both workload traces, budget extremes, direct curve selection, keyboard task inspection, the native evidence dialog and Escape, JSON aggregation, and the 390px responsive layout. Mobile cap controls are 44px high and figure overflow stays inside the labelled horizontal region. Emulated reduced motion disabled playback and removed figure animations; the temporary media and viewport overrides were reset afterward. A Luna xhigh audit checked the numerical invariants independently; its findings led to explicit GPU-work units, nominal-cap wording, rule-based accuracy labels, and cache-ready timing.

Backup archives are outside the repository at `/Users/yash/Portfolio/backups/portfolio-elite-bilingual-2026-09-21/`, including the pre-redesign state and the intermediate published-reference presentation.

The current pre-causal-story checkpoint is `pre-causal-laboratory.tar.gz`. Added `tests/lab-story.test.mjs` verifies all 64 legacy defaults against explicit settings, barrier recurrence, no worker overlap, cognition conservation, prefix readiness and workload dependence, isolated token-rate changes, final composition equivalence and checkpoint/budget separation. Public Chartosaur and Distill references informed focused interventions and linked explanations, not the portfolio's visual identity or quantitative results.
