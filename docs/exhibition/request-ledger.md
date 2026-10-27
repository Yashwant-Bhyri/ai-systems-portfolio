# Request ledger: every ask across Yash's messages, with status (2026-10-26)

Rebuilt by re-reading all messages in the session transcript. Status: **Done** · **Partly** · **Open** (and why).

## Direction and principles
| Ask | Status |
|---|---|
| Keep Astra's layout; elevate sleekness and attention inside it | Done. The block shell is optional; the reel orientations keep the original stage at full size. |
| No text blocks or IT-dashboard chrome; museum feel (titles, names, numbers) | Partly. Captions, caveats, sub-step rows and links were removed; a few Astra panels still carry prose. |
| Denser, more profound content, but no vague one-liners ("prepare, execute, deliver", "a queued request cannot use an idle worker") | Done for Part 1, Part 2 and the post-training titles; every Δ states unit, meaning and cause. |
| No disclaimer banners; show our claims; never caption simulated numbers as real Qwen3-4B runs | Done. "Synthetic" appears only in units; caveats live in the scenario record. |
| Light and developer modes (round 1) | Open. They exist in the old exhibit wings, not in the current lab. |

## Attention and motion
| Ask | Status |
|---|---|
| One thing lit, the rest matte but still moving; highlight the architecture component by component, without fading the rest completely | Done. |
| Baseline and optimized must not animate at once | Done: scheduling, KV reuse, execution, prefill/decode, overlap, cache routing and queue each narrate one lane at a time. |
| Nothing pauses unless pause is pressed | Done. |
| Auto-cursor demonstrates hidden controls: replay sweep over 96 requests, p50 → p95 → p99, speculative views, post-training explorers | Done. |
| CPU/GPU overlap freezes on the first red idle patch | Done (verified 2026-10-26). |
| Latency dot plot: a cursor scans ranks while Δ grows | Done. |

## Numbers
| Ask | Status |
|---|---|
| Star and shine on numbers, more widely, more pronounced | Done. Tier 1: every earned result gets a bright sweep, glow and two stars. Tier 2: every prominent number gets a soft staggered sweep. SVG figure numbers glint. |
| Every gain states Δ, unit, what it is a Δ of, and its cause; explain "Δ ms" and "8 ms" | Done. |
| Graphs show baseline vs optimized as overlays | Partly. The Queue rank scan shades the gap between the two curves, and the runtime ladder shows the steps; there is no overlay in every module yet. |

## Navigation and structure
| Ask | Status |
|---|---|
| Two branches instead of Part 1 / Part 2; the fork names techniques, not GPU-s | Done. |
| Reel ("Go deeper") kept as it was, on top or on the side, not squeezing the lab | Done as live options: A reel on top (sticky, condensing), B side column, C docked below, plus D compact block. Switch with `?labnav=` or the tab at the left edge. |
| Lab as one block, no scrolling between modules | Done in D; A, B and C trade a single screen for a full-size stage while keeping the reel always in reach. |
| Dedupe Part 1, Part 2 and post-training | Done. Policy × runtime keeps only the combined lens; the overview time-lapses the three mechanisms shown in full elsewhere; "Where the 96 tasks land" moved to post-training. |
| Two-tier projects: overview first, then HLA → LLA → lab | Prototype at `/overview`. Each card deep-links to its module (`/#inference-study/draft`). |

## Module-specific
| Ask | Status |
|---|---|
| Baseline titles concrete ("Follow request 7…"), and chapter tabs that steal attention | Done. Chapters are quiet pills. |
| Worker scheduling liked; keep it | Kept. It now follows request 7, with a time-gain hero. |
| Speculative decoding: one model guesses, another verifies, as agents | Done. It adds a result card (Δ 9 calls) and a pause control. |
| Queue & latency spacing; the p50/p95/p99 tour | Done. |
| Policy × runtime dynamics | Done (combined lens, cycling). |
| Glossary should "sprout" into the project | Done. Cards open the microscope. |
| £120 shipping example removed; firstItem code task kept | Done (now spelled `first_item`). |
| Frontier explains each step (what we did, what it bought) | Done. Chapter titles state each step's computed result. |
| Hot inference terms woven in (SSE, KV sizing, PagedAttention, FlashAttention, continuous batching, chunked prefill, prefix caching, routing, ITL, speculative decoding, quantization, observability, engines, autoscaling) | Done via the glossary and the serving modules. |
| "For serving under load, some things are coming back" | Interpreted as repetition; the overview's repeated beats are now a 4.5 s time-lapse. |

## References
| Ask | Status |
|---|---|
| Brain Scan clip (local file): redo it as close as possible, as a separate piece | Done at `/brain-scan`: flat token × layer field, lit 3D relief, answer ribbon, confidence bars, one synchronised scan, on our first_item answer. |
| QwenGyre: review how well it was done | Reviewed. The scene existed but was unmounted. It now spotlights the first barrier (GPUs idle behind the slowest rollout) and shows hero metrics, and it is mounted as the post-training module "Elastic RL on 64 GPUs". Harness at `/fleet-review`. |
| DeepInfer (DeepSeek) | Its CPU/GPU overlap and draft-verification ideas are in. Not built: the decode Pareto plot (per-user tokens/s vs per-GPU throughput by concurrency), a candidate new serving module. |

## Still open
- Phone variant that shows one lane at a time (reviewer M34).
- One colour system across all modules: baseline slate-blue, optimized green, violet = Δ only, coral = waste (M32).
- Number formatting inside Astra components: separators, minus signs, percent precision, round ticks (m5–m10).
- Architecture sections are a few px taller than 900 (M35, Astra's section).
- Light and developer modes for the lab.

## Round 9 (2026-10-27): fit, focus, communication
Target viewport: the user's MacBook (3024×1964 Retina, which "looks like" 1512×982); Chrome at 100% shows about **1512×860**. Also verify at 1440×900 and 1280×800.

| # | Ask | Status |
|---|---|---|
| 1 | The results lab behaves like the architecture and microscope pages: it fills the screen and stays pinned, with nothing important below the fold | Open |
| 2 | Remove the gap above "Inference optimization" that pushes the content down | Open |
| 3 | Every module fits one full screen. Track the page start and cutoff, and measure each component's use of the central 75% | Open |
| 4 | No tiny words, and no robotic letter-spaced labels | Open |
| 5 | Highlighted numbers get a focus mode: dim or desaturate the rest; baseline, optimized, Δ and cause shine vividly | Open |
| 6 | Guides are not text blocks at the bottom. Use a one-line live meter in the most visible place ("draft model drafting…") | Open |
| 7 | Lab intro: branch 1 expands, then blurs; branch 2, renamed **Optimized serving under load**, expands and the cursor walks its titles (3–4 s) and returns. Then the opening line "First: how we serve the same intelligence with *cheaper execution*" | Open |
| 8 | Serving arcs: the "In our system" beats overflow the page with wasted space, so make them fit | Open |
| 9 | Problem beat is labelled **Problem / Bottleneck**. State the bottleneck centrally and highlight it (e.g. "12 calls for 12 tokens: serialized computation, a bottleneck at scale") | Open |
| 10 | How it works shows **Optimized solution** on top and names the real draft model | Open |
| 11 | Use the empty right space: a tracker of where we started and where we ended up (baseline → now) | Open |
| 12 | No vague wording | Open |
| 13 | Cache routing "In our system": the request-C panel is small and diffuse, with no focus | Open |
| 14 | CPU/GPU overlap "In our system" is the gold standard; redo the others like it | Open |
| 15 | Impact beats state what you learn, not just three numbers | Open |
| 16 | Serving glossary: start empty; each of the nine cards (3×3) expands for about 1 s under the cursor, then settles. This ends "serving under load" | Open |
| 17 | Cheaper execution feels repetitive and has no problem intro. Open with "the same intelligence at cheaper execution depends on N things", then pick one | Open |
| 18 | Film spacing: fit one screen. Prefix reuse has floating text blocks; use focus and blur instead | Open |
| 19 | Policy × runtime: annotate the curve itself (base → RL checkpoint: SFT + correctness RL; KV reuse + execution rate), with gains in pp and GPU-s, in focus mode | Open |
| 20 | Replay: per-request differences look small. Show where it matters (latency), plus a paired baseline-vs-optimized cluster plot with median and mean | Open |
| 21 | Post-training intro: the goal is a smarter model on math and coding (accuracy, then efficiency) | Open |
| 22 | Show how the agent learns first: a reasoning trace and a reward critiquing it, like speculative's How it works | Open |
| 23 | Starting point and SFT+LoRA pages: too much text; the "6-value calculation" box does nothing. Keep the six output coordinates, frozen matrices and loss graph | Open |
| 24 | GRPO title text is unreadable as data; show it visually. Iterations: pink deepens and the curve tightens | Open |
| 25 | "Give it more thought": label budgets as thinking budget, not accuracy. The request text is bad; keep the app → payment-provider graph. The guide at the bottom gets missed | Open |
| 26 | Lean RL is undefined; give it a short mechanism | Open |
| 27 | Capability terrain loops: say what changes, and place it after SFT/GRPO are explained | Open |
| 28 | Frontier: highlight the orange (runtime) dots with their gains; replace "moves it up / moves it left" | Open |
| 29 | Inside the model: context for what improved it | Open |
| 30 | "What did the model learn": arrows from each step to its result (e.g. where 69.8 came from) | Open |
| 31 | Where the 96 tasks land: reimagine the graph | Open |
| 32 | Elastic RL: explain elastic RL and the QwenGyre idea; impact communicated | Open |
| 33 | Regression audit: communicate, not just represent | Open |
