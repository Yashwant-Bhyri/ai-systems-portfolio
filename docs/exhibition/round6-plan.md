# Round 6 plan: two levels, a side title show, full-circle modules (2026-10-26)

## What the tracker measured first
- Title show: each card click shifted the layout by CLS 1.06–1.33. The click glided the stage under the sticky header, the reel condensed mid-glide (−124 px) and the stage collapsed while the next module loaded. **Fixed**: CLS 0.11–0.18, the glide lands at the same spot every time.
- Serving glossary: an unscoped rule hid every label in the figures (0 of 7 shown); KV sizing had no motion; the engines card changed 3 times in 8 s. **Fixed**: nine new figures, 13/13 labels shown, all moving, restarted together on view.
- Still open, per module (out/summary-top.md): CPU/GPU overlap has 12 labels crossed by links and one clipped ("= CPU + GPU + CPU, in series"); Execution replay's Δ label is crossed by its own path; post-training's first chapters use 8–9 px labels; Speculative decoding and "Make thought count" leave 43–52% of the stage empty.

## 1 · Two levels
- **Main portfolio, per project.** Page 1: the high-level architecture (Astra's section, unchanged). Page 2: "Details": the title show as a card spread (every card with its live figure and one starred number: the experiment, Policy × runtime, Execution replay, Queue & latency, Prefill/decode scheduling, Speculative decoding, Cache-aware routing, CPU/GPU overlap, Serving overview, Serving glossary). No low-level architecture here. One CTA: "Explore in depth".
- **Deep route** (`/inference`, `/post-training`): HLA → LLA (component microscope) → results laboratory.
- Filmora leaves the nav and the page (kept in git for later).

## 2 · Lab landing and the side title show
- Landing: "Inference optimization", both pathways side by side with all their cards on one page.
  - 01 Same intelligence, cheaper execution: continuous batching · prefix reuse · faster prefill & decode.
  - 02 Serving under load: chunked prefill · speculative decoding · cache-aware routing · CPU/GPU overlap.
- Selecting a pathway: its cards fly into a left column (about 260 px), the other pathway fades out, and the stage takes the remaining width.
  - "The experiment" is pinned at the top, in colour.
  - The rest sit in shadow mode (blurred, grey) and drift slowly.
  - The next module's card is expanded, with a thin progress ring. When the current module's story ends, the ring completes and the stage moves to it. Hover or click overrides.
  - After the last module of pathway 1, pathway 2 starts the same way.
- Engineering, so it stays smooth:
  - fixed slots; the expanded card is an overlay that moves by transform (FLIP), never by reflow;
  - the stage holds its height across swaps (already in);
  - no scroll jumps (already in).
  - Acceptance, measured by `jank.mjs`: CLS < 0.05 per switch, p95 frame ≤ 17 ms.

## 3 · Every important module as a full circle
Speculative decoding is the template. Four beats, as quiet pills at the top of the stage:
1. **Problem**: the baseline failure, one lane lit.
2. **Mechanism**: how the technique works in general.
3. **In our system**: our configuration and our numbers on Qwen3-4B.
4. **Impact**: Δ with unit and cause, plus the result visualization.

Order: prefill/decode scheduling → continuous batching → prefix reuse → faster prefill & decode → CPU/GPU overlap → cache-aware routing → finish speculative decoding.

Elastic RL follows the same arc: what QwenGyre is → what we did (64 GPUs, elastic rollout/training roles) → results (the fleet scene, 4 → 7 steps, 1.96×).

## 4 · Brain Scan
- **Primary home: post-training**, as "What changed inside". The same first_item answer scanned through the base model and the RL checkpoint: per token × layer, where the policy changed and where the answer flipped. It answers the section's own question, "What did the model learn?".
- **Inference:** only quantization drift (BF16 vs INT4) is an honest fit, so it appears small, inside the quantization card and the LLA, not as a lab chapter.
- Same visual language for other components:
  - KV occupancy relief (tokens × layers over time) for prefix reuse;
  - batch occupancy surface (slots × iterations) for continuous batching;
  - token-gap terrain (requests × time) for prefill/decode scheduling.
- Simulated fields say "simulated" in their units.

## 5 · Working order (one thing, finished, then the next)
1. Lab landing + side title show (closes the transition bug for good).
2. Module arcs, one by one, each passing the tracker: no crossings or overlaps, text ≥ 11 px, largest empty area < 25% of the stage.
3. Brain Scan in post-training.
4. Two levels + Filmora removal.
5. Full tracker pass, twice.
