# Where the laboratory's numbers come from (calibrated lab v2, 2026-10-26)

Yash asked for numbers that make the lab coherent and believable, using the LLM inference simulation note (Downloads, `LLM Inference Simulation.pages`). That note surveys GPU-free serving simulators: NVIDIA Dynamo's simulator/Mocker, the llm-d inference simulator, Microsoft Vidur, LLMServingSim and ServingStudio. It also makes the key distinction: serving behaviour can be simulated without a GPU, but what a model writes and gets right needs the model itself.

The lab now follows that distinction. Every number belongs to one of four kinds:

| Kind | Meaning | Where |
|---|---|---|
| **Published** | read from a datasheet or the model's config | `app/compute/calibration.ts` (`MODEL`, `GPU`) |
| **Derived** | computed from published numbers with a stated roofline formula | `calibration.ts` (`prefillSeconds`, `decodeStepSeconds`, `kvBytesPerToken`) |
| **Assumed** | an efficiency factor or workload choice, stated with its reasoning | `calibration.ts` (`EFFICIENCY`), each model's header |
| **Needs a real run** | accuracy, answers, what the model learned | the post-training cohort: still synthetic and labelled as such |

## Published inputs
- **Qwen3-4B:** 4.02 B parameters, 36 layers, hidden 2,560, 32 query heads, 8 KV heads (grouped-query attention), head dim 128.
  - BF16 weights are 8.04 GB.
  - KV cache per token: 2 × 36 × 8 × 128 × 2 B = **144 KiB**.
- **NVIDIA H100 SXM5 80 GB:** 989 TFLOPS dense BF16, 1,979 dense FP8, 3.35 TB/s HBM3.

## Assumptions (stated, typical of tuned engines)
- Prefill reaches 50% of peak FLOP/s (55% with FP8 kernels).
- Decode reaches 80% of peak bandwidth.
- 1.5 ms of scheduler and launch overhead per engine step.
- 6 GB is reserved for activations and the CUDA context.
- At most 64 sequences decode at once.

## Derived rates (batch 1)
- **Prefill:** an 8,192-token prompt takes **0.173 s**, which is 0.021 ms per input token (BF16) or 0.010 ms (FP8).
- **Decode:** about **5.05 ms per output token** at a 10k-token context in BF16, and 3.28 ms with FP8 weights and KV.
  - That is roughly 200 tokens/s, in line with what batch-1 Qwen3-4B achieves on an H100.
- **KV capacity per H100:** 447k tokens in BF16, 949k in FP8.

## The laboratory's results, before and after calibration

### Cheaper execution (the film; 96 requests over one shared document, RL checkpoint at 2× thought)
| Step | GPU-s per correct answer | p95 response |
|---|---|---|
| Paired baseline | 36.61 → **41.40** | 1,081 → **1,307 s** |
| + first free worker | unchanged, **41.40** (scheduling moves waiting, not work) | **1,162 s** |
| + prefix reuse | was 24.03; now **41.18** | **1,155 s** |
| + FP8 weights and KV | was 19.29; now **26.62** | **683 s** |

The biggest change in the story is prefix reuse. Prompt reading falls 16.8 → **2.1 GPU-s (−88%)**, but that is now a small share of the work: answers average about 5,600 tokens, so decode dominates. The old "−34%" came from charging 1.2 ms per input token, about 50× too slow. Reuse matters most when prompts are long and answers short; the lab now says so.

**Iteration-level batching** (`serving-sim.ts`, an event-driven, Vidur-style simulator) is reported separately. The cohort lab keeps one request per GPU, so that "latency = waiting + service" and "each mechanism moves one component" stay exactly true. On the same cohort, batching every running request into each step gives **8.32 GPU-s per correct answer** (from 41.40) and a 124 s p95.

### Serving under load
| Module | Before | Calibrated |
|---|---|---|
| Prefill/decode: worst pause in a live answer | 56 → 10.25 ms (a "128-token" document) | **224.5 → 23.5 ms** (8,192-token document, 1,024-token chunks) |
| Its cost: the document's first token | 58 → 105.25 ms | **228.5 → 261.3 ms** |
| Cache-aware routing: first token | 62 → 42 ms | **125 → 65 ms** (20 ms prefill per 1,024-token page) |
| Its crossover (wait for free pages) | 40 ms | **80 ms** |
| CPU/GPU overlap: four decode steps | 52 → 37 ms (8 ms GPU step) | **24 → 16.5 ms** (3.5 ms GPU step; host 1.5 + 1 ms) |
| Speculative decoding: large-model calls | 12 → 3 | unchanged (a counting model, no timing claimed) |

## What would need a real run
- Accuracy on the 96 tasks, and every post-training checkpoint's solved count. The cohort is synthetic, so these stay labelled "synthetic tasks".
- "Inside the model": the token × layer difference field is simulated. Teacher-forcing the base and RL checkpoints on the `first_item` answer would make it real; this needs the two checkpoints and one GPU.
- Speculative acceptance rates depend on the actual draft/target pair.
- **To confirm the serving numbers on hardware:** run vLLM or SGLang with Qwen3-4B on one H100 under the same cohort (AIPerf or the llm-d harness, as the note suggests) and compare against `calibration.ts`.

## Tests
The tests no longer pin magic numbers. They derive expected costs from `calibration.ts` and check the decompositions:
- latency = waiting + service;
- a step = overhead + prefill + decode;
- reuse changes only prefill.

366 tests; the one failure is the `const ROLES` source-marker check that also fails in Astra's tree.
