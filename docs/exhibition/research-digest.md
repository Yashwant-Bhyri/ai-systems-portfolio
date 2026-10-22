# Research digest: compute wings (23 Oct 2026)

Two Haiku research passes, plus reference-site captures in `tools/exhibition/refs/`. Numbers are as reported by the agents from primary pages. Verify against the PDF before quoting one as a citation.

## Visual direction (from the reference captures)

- **Modal:** dense lattices of tiny lit cells. Trainer, inference and sandbox grids are joined by thin connectors, and a hex cube is made of LED dots. It is dark, calm and enormous. This is the closest match to "something profound is running" inside our dark observatory.
- **netsphere:** mono display type and an amber accent. Every card leads with a number pair ("42.6 → 98.4 tok/s") plus a two-line receipt. Results are the hero, not the prose.
- **Groq:** huge stacked typographic statements, one idea per line.
- **Brain Scan (netsphere tools):** one signal stays connected across three views: grid, relief, and text.
- **Apple and Raycast:** one object per frame, cinematic light, negative space.

## Inference (serving) material

| Mechanism | Animation moment | Numbers (source) |
|---|---|---|
| CPU/GPU overlap (SGLang zero-overhead, DeepInfer async) | Two lanes; white GPU gaps close; CPU runs one step ahead | SGLang v0.4: 1.1× over v0.3, 1.3× over others; Nsight shows "no single idle time" (lmsys.org/blog/2024-12-04-sglang-v0-4). vLLM V1: GPU step ~5 ms on Llama-8B/H100, so CPU overhead dominates |
| PagedAttention | Grey reserved slabs dissolve into packed blocks; more requests fit | 2–4× throughput vs FT/Orca (arXiv 2309.06180) |
| Prefix caching / RadixAttention | Tree trunk glows on hit; prefill bars shrink to nothing | SGLang cache-aware LB: 82,665 → 158,596 tok/s, hit rate 20% → 75% |
| Chunked prefill / token budget | Fixed-height step bars with decode stripes plus a prefill chunk; ITL stops spiking | vLLM V1 up to 1.7× over V0 |
| PD disaggregation, goodput | Prefill furnace; KV parcel shipped to the decode pool | DistServe 7.4× requests or 12.6× tighter SLO |
| DeepSeek EP + dual-batch overlap | Two microbatches ping-pong; comm blocks hide under compute | Prefill EP32 / decode EP144; per H800 node ~73.7k input and ~14.8k output tok/s; 56.3% of input from on-disk KV cache (open-infra-index day 6) |
| KV tiering (LMCache, Mooncake) | A block sinks down tiers and rises on a hit | LMCache TTFT 1.20 s → 0.39 s |
| Speculative (EAGLE-3, MTP, Medusa, suffix) | Ghost tokens solidify or dissolve; acceptance counter | EAGLE-3 up to 6.5×; DeepSeek-V3 MTP second-token acceptance 85–90%, 1.8× TPS |
| FlashAttention-3 | Two warp-group lanes ping-pong GEMM and softmax | 740 TFLOPs/s FP16 (75%), ~1.2 PFLOPs/s FP8 |
| NVFP4 | 16-value blocks shrink to ~4.5 bits; freed memory becomes KV headroom | ~3.5× memory vs FP16, ~1.8× vs FP8 |
| CUDA graphs | A train of tiny launch ticks collapses into one block | — |
| Pareto frontier / goodput | Dominated configs fade; frontier draws; interactivity slider moves a dot | Blackwell vs Hopper up to 4.3× (vLLM InferenceMAX blog) |

**Narrative spine used by top teams:**
- **Headline metrics:** tokens/s/GPU, TTFT, TPOT/ITL, goodput, $/M tokens, tokens/s/user (the Pareto x-axis).
- **Room order:** memory → reuse → stop waiting (overlap, graphs, chunking) → split phases → guess ahead → cheaper ops → scoreboard (Pareto).

## Post-training material

| Mechanism | Animation moment | Numbers (source) |
|---|---|---|
| QwenGyre elastic GPU cells | K cell blocks flip role colour (rollout ↔ train) one by one; a waterlevel drains; dedup tree greys duplicates | NL2RepoBench 52.48 → 58.54 in 48 steps; 75.42 h vs 134.55 h async vs 91.47 h colocate; role switch 8.52 s / 3.46 s (arXiv 2609.33848) |
| Colocated vs async RL | Sawtooth handover vs conveyor with version tags; stale tokens fade | verl 1.53–20.57×; AReaL up to 2.77× |
| GRPO | One prompt fans to 16; green/red; advantage bars around zero; critic column fades | R1: AIME24 79.8, MATH-500 97.3; R1-Zero AIME 71.0 / cons@64 86.7 |
| DAPO | Dead groups drop out and refill; staircase of AIME bars | Naive GRPO 30 → overlong filter 36 → clip-higher 38 → soft overlong 41 → token-level loss 42 → dynamic sampling 50 |
| Dr. GRPO | Wrong answers inflate like balloons under GRPO, flat under Dr. GRPO | Oat-Zero-7B AIME24 43.3 |
| GSPO | Per-token ratio jitter collapses to one sequence bar; ~10% expert routing flicker | clip ranges 3e-4/4e-4 vs 0.2/0.27 |
| Spurious rewards | Gate opens on coin flips | Qwen2.5-Math-7B MATH-500 +21.4 random vs +29.1 true |
| LoRA for RL | RL drips one bit per episode; rank-1 fits | LoRA LR ≈ 10× full-FT LR (thinkingmachines.ai/blog/lora) |
| Curated SFT (s1, LIMO, OpenThoughts) | Funnel of ~1M candidates down to 1,000 | LIMO AIME24 63.3 vs 6.5 with 1% of data |
| Budget forcing / thinking budget | A ring timer; "Wait" extends; the stop phrase collapses into an answer | s1 AIME24 50 → 57; Qwen3-4B AIME24 73.8 thinking vs 25.0 non-thinking |
| Best-of-N, PRM, compute-optimal TTS | Coverage climbs log-linearly while the verifier line flattens | compute-optimal >4× more efficient than BoN; SWE-bench Lite 15.9% → 56% at 250 samples |
| Efficient reasoning (ThinkPrune, L1) | A truncation line tightens; the dead tail after the first correct answer greys out | ThinkPrune halves length at −2% AIME24 |
| pass@k crossover | RL above base at k=1, below at large k | arXiv 2504.13837 |
| Negative flips | Grid with green gains and red flips | MUSCLE up to 40% fewer flips |

**Narrative spine:**
1. The base and the thinking switch.
2. Teach the shape (curated SFT, LoRA).
3. Reward the answer (GRPO → DAPO staircase).
4. Scale the machine (verl, Gyre cells).
5. Spend thinking (budget, best-of-N).
6. Spend less (ThinkPrune).
7. Audit (pass@k crossover, flips).
