# Compute chapters: motion-first storyboard

The MindScape and Filmora reference scenes are small explanatory films, not diagrams with animated edges. Their objects have identity, move through the mechanism, and leave evidence behind. The new chapters use the same principle.

## Direction

One question per scene. Establish the initial state, visibly perform an operation, then hold the consequence. Tokens keep their identity/color across queue, compute, cache and output. For learning, separate frozen parameters, forward activations, backward gradients, and verified outcomes. Motion is deterministic and scrubbable, with no invented live measurements.

The most valuable public-facing demonstrations are the ones where a viewer can predict the consequence of a control. Batching must show idle capacity being recovered. Prefix reuse must avoid duplicate allocation. LoRA must visibly leave W unchanged. GRPO must derive the update from rewards. A larger search budget must cost more work and can still fail.

| Scene | Question | Visual operation | Intervention |
|---|---|---|---|
| Scheduling | Why does continuous batching matter? | Token rows advance; a short request exits; the queued request physically occupies its slot. | Continuous vs fixed batch |
| KV memory | What is actually reused? | Matching prefix blocks converge onto the same physical pages; references increment; one request releases while the other's reference survives. | Shared vs distinct prefix |
| GPU work | Where does computation happen? | Matrix tiles load, accumulate along a wavefront, and write output; launch gaps collapse in the fused view. | Separate vs fused kernels |
| Quantization | What is the memory/precision tradeoff? | Weight points snap to a quantization lattice and storage words pack into fewer bytes. | 16/8/4 bits |
| Speculation | What happens to a wrong draft? | Tokens grow in the draft lane, descend to target verification, accepted prefix moves to output, rejected suffix drops away. | Early vs late mismatch |
| Parallel execution | What crosses the device boundary? | Tensor shards combine partial results; pipeline microbatches travel through a space-time diagram. | Tensor vs pipeline |
| Profiling | Which wait is on the critical path? | Cursor resolves dispatch, transfer, compute and first-token dependencies in aligned traces. | Baseline vs overlap |
| Serving | Why is cleanup part of performance? | Capacity-aware routing, token streaming, backpressure/cancel signal, and physical page return. | Complete vs cancel |
| Dataset | What gets to become supervision? | Records move through validation; invalid and duplicate samples peel away; a holdout remains outside training. | Math vs code examples |
| SFT/LoRA | How does a small adapter alter a frozen model? | x splits through W and A/B; outputs sum; loss sends gradients backward only into adapters; matrix cells update. | Rank 2 vs rank 4 (toy layer) |
| Rollouts | What is a group of reasoning trajectories? | One concrete prompt branches into token-by-token derivations; verifier marks distinct outcomes. | Math vs code prompt |
| GRPO | How do rewards become a policy update? | Reward points center at the mean, become signed advantages, then reshape next-policy probability bars. | Mixed rewards vs all tied |
| DPO | What does a preference pair teach? | Chosen/rejected likelihoods compare with a frozen reference; reference-relative margin separates and loss falls. | Either answer preferred |
| Verifier search | How does checking steer search? | Frontier expands, a failed branch visibly terminates, passing branches return a result. | 2/4/8 checks |
| Test-time compute | What changes without training? | Independent candidates consume a fixed budget, finish at different times, and enter selection. Model weights do not change. | 2/4/8 candidates |
| Evaluation | What makes a claim eligible for release? | Planned matched checkpoints feed a run-record audit; missing baseline, split, uncertainty, compute and evaluator context remain visible. No gains are plotted. | Math/logic/code focus |

## Playback contract

- Selecting a chapter stage holds the chapter selection, but does **not** freeze its operation.
- Each operation owns play/pause, replay, a scrubber, and three accessible beat shortcuts.
- Changing a mechanism restarts its local story and keeps it running. It does not restart the chapter tour.
- Only visible scenes animate; hidden tabs and reduced-motion preferences stop the clock.
- Reduced motion shows a complete explanatory state, with controls still available.
- All toy numerical examples are labelled. Earlier author-reported gains are confined to an unverified claim register; study plots remain empty until measurements exist.

## Technical references

- [vLLM prefix-cache allocation, references and eviction](https://docs.vllm.ai/en/latest/design/prefix_caching/)
- [LoRA: frozen weights and trainable rank decomposition](https://arxiv.org/abs/2106.09685)
- [Speculative sampling](https://arxiv.org/abs/2302.01318). The graphic uses a labelled greedy-verification example, not a claim about general stochastic acceptance.
- [TRL GRPO](https://huggingface.co/docs/trl/main/en/grpo_trainer), [TRL DPO](https://huggingface.co/docs/trl/main/en/dpo_trainer)
