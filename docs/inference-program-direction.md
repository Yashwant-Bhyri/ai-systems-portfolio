# Inference program: scope and component gates

September 24, 2026. Our revisable direction, not an adoption of the external agent transcript.

## The argument

Improve the reasoning policy, and deliver its capability with less wasted execution while meeting the user's latency needs. Architecture shows the full design space; the microscope explains mechanisms; the laboratory makes chosen mechanisms and tradeoffs inspectable. The current five chapters are first principles, not a complete production engine simulation.

## Two parts, explicitly separated

The user's latest direction takes precedence over the earlier idea of adding a third laboratory mode.

1. **Same intelligence, cheaper execution.** Primary thesis and current finishing priority. Preserve the controlled comparisons and existing films. Scheduling, reuse and execution get their own direct consequences before composition. This part retains the GPU-cost-per-valid-correct-answer anchor.
2. **Serving under load.** A broader operational investigation: arrivals → admission/continuous batching → KV capacity → prefix locality → prefill/decode scheduling → draft/verify → kernels/precision → parallelism → routing/lifecycle → goodput within latency and quality constraints. Explain the coupled decisions, without claiming that all ten mechanisms are numerically implemented or each requires a full laboratory.

Part two is being planned in `docs/serving-under-load-direction.md` by a separate Sol Ultra agent. The four-file stream-continuity candidate is its first potential detailed branch, not a replacement for part one. Keep that candidate unmounted until reviewed and until the two-part entry is deliberately designed. The parent remains focused on the primary thesis. Named systems belong in implementation lineage only when their identity and relevance are verified; mentioning them does not establish project implementation.

Current numerical coverage: two serial workers, fixed-pair versus FIFO scheduling, ready-prefix reuse, declared prefill/decode rates. The scale replay adds varied request sizes and arrival bursts, not token-level continuous batching or physical distributed capacity. Preserve these lessons without pretending they already model missing mechanisms.

## Metric hierarchy

- Cross-project anchor: GPU-seconds per valid correct answer, explicit cost boundary and independent quality gate. Busy-work scenarios do not supply measured allocated-GPU figures.
- Scene-local metric: the consequence the intervention directly changes. Scheduling uses waiting, execution uses service work/completion, stream interference uses inter-token gaps and time to first token.
- System acceptance: goodput under explicit latency SLOs, queue distributions, memory capacity, allocation cost and output quality together. Throughput without its denominator is insufficient.

Do not replace the north star solely because an external agent suggested a headline. Use the appropriate local lens without losing the scientific program.

## Coverage map

| Component | Dedicated narrative | Model and counterexample required | Status |
|---|---|---|---|
| Demand | Who asks, how much context, why does a queue form? Preserve agent → request → output identity. | Arrival trace, prompt/output mix, bounded concurrency; quiet workload. | Opening needs direction; separate 1,000-agent execution replay exists. |
| Scheduling | Why is a free worker waiting? Move equal service bars; accumulate red idle ledger. | Work/arrival conservation, actual idle-with-waiting; requests that do not improve. | Verified two-worker lesson, not iteration-level batching. |
| Prefill/decode coexistence | Why did an answer stop streaming when another user uploaded a long document? | Token budget, decode set, chunk policy, step overhead, TTFT/ITL tradeoff. | Next bounded build, manual below. |
| KV capacity/paging | Why wait despite execution capacity? Show ownership, available slots, admission/reclamation. | Allocation versus reservation, no freeing live pages, rejection/deadlock boundaries. | Microscope exists; coupled lab absent. Next model begins with explicit reservation only. |
| Prefix/locality | Which work is avoided, when can retained state be used? | Cold cost, ready time, prefix match, ownership, eviction, replica locality. | Verified ready-prefix service; pressure/locality remain future. |
| Kernel/runtime | Where did the same token's execution time go? | Kernel/transfer trace or calibrated model; launch/bandwidth limits. | Rate-sensitivity film, not CUDA attribution. |
| Quantization | What fits/moves differently, what quality changes? | Memory, dequantization, independent quality check; regressions. | Architecture/microscope only. Never assume identical outputs. |
| Speculation | Does draft work save more target work than it adds? | Draft/verify cost, acceptance, fallback, corrected sampling, loss case. | Planned conditional experiment. |
| Routing/parallelism | Does moving work help after communication and locality costs? | Replicas versus tensor/pipeline/expert sharding; KV transfer, links, hot replicas. | Planned. Agent groups are not hardware nodes. |
| Profiling/lifecycle | Can we identify constraints, cancel safely and return capacity? | Trace events, admission/release/cancel, warmup/allocation boundaries. | Instrumentation accompanies each model; no decorative profiling claims. |
| Composition | Which gains compose under identical workload and quality constraints? | Paired interventions with interactions, SLO failures, losses. | Existing additive miniature; revisit after coupled models earn it. |

## Resource discipline

Only the next component gets detailed timing, geometry, controls, equations and acceptance tests. Do not batch all rows into a giant implementation. Main agent owns narrative, integration and final judgment; Sol owns a bounded implementation. Prototypes are replaceable and opt-in until reviewed.

Next: [Stream continuity manual](manual-stream-continuity.md).

## Primary references checked September 24

- [vLLM chunked prefill](https://docs.vllm.ai/en/latest/configuration/optimization/): decode-prioritized iterations use remaining token budget for prefill chunks; tuning affects TTFT/ITL. Borrow mechanisms, not benchmark numbers.
- [vLLM prefix caching design](https://docs.vllm.ai/en/latest/design/prefix_caching/): references, allocation and eviction are distinct from computation avoidance.
- [SGLang / RadixAttention](https://www.lmsys.org/blog/2024-01-17-sglang/): prefix sharing and scheduling motivate later locality work.
- [DistServe](https://arxiv.org/abs/2401.09670): phase interference motivates separate TTFT/TPOT analysis.
- [TensorRT-LLM disaggregation](https://nvidia.github.io/TensorRT-LLM/features/disagg-serving.html): separate phase resources incur KV exchange/coordination. Chunking is not disaggregation.
- [FlashInfer](https://arxiv.org/abs/2501.01005): kernel research is lineage, not proof of our rate coefficients.
- [vLLM speculation](https://docs.vllm.ai/en/latest/features/speculative_decoding/): later acceptance/cost branch; recheck version-specific claims before implementation.

Sources justify questions, not numerical project achievements. Never perturb published measurements and relabel them as portfolio runs.
