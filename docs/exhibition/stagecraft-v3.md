# Stagecraft on Astra's layout (2026-10-25)

Astra's chapter structure stays: architecture → component microscope → results laboratory, Part 1 / Part 2, five-chapter films. This pass changes how attention moves through it.

## Tools (app/compute/stagecraft/)

| File | What it does |
| --- | --- |
| `spot.ts` + `.cx-spot` | One lit region, the rest matte (grey, soft blur, still moving). |
| `ghost-cursor.tsx` | A scripted cursor that clicks a component's own controls. It stops for good on the first real pointer or key press and offers "Show me". |
| `reel.tsx` + `glyphs.tsx` | The exploration reel. Every deeper investigation stays visible as a moving silhouette, and one tile at a time opens in full colour. Clicking a tile puts it on the stage. |
| `plates.css` | Consequence cards lose their tinted box. One hero value carries a light sweep (`cx-shine`). |
| `film-spot.css` | Per-moment spotlights inside film chapters, controls that recede while a film plays, and focus pulls on camera handoffs. |
| `microscope.css` | Compute microscope only: the signal console and I/O rail are unboxed, and the explanatory paragraph is removed. |
| `exhibit-host.tsx` | Plays an exhibit scene (my GRPO, lean RL and frontier rooms) inside a lab chapter, on that chapter's clock. |
| `draft-film.tsx` | Speculative-decoding opener: ghost words, one verify sweep, a crack at the first mismatch, and the call ledger. |

## Where they are used

- **Architecture overview (both chapters).** The five cards walk the diagram on a loop, 3.6 s each. The lit component gets a moving focus frame and the rest goes matte. A one-line caption shows the term of art, three chips and one number.
- **Results laboratory.** The Watch/Explore toggles and the explorer tabs are replaced by the reel under the stage.
  - Part 2's three nav buttons and four investigation buttons are replaced by two reels: investigations, and the serving glossary (SSE, KV sizing, PagedAttention, FlashAttention, continuous batching, quantization, observability, engines, autoscaling).
- **Ghost cursor.**
  - Execution replay: request picker and the four measure tabs.
  - Queue & latency: ranking, p50/p95/p99, and inspecting one request.
  - Policy × runtime: the three lenses.
  - Microscope: flips each mechanism's switch at the same moment, without restarting.
- **Post-training film.**
  - Chapter 03 is my GRPO room.
  - Chapter 05 is the lean-RL room.
  - New chapter 06, "The frontier", draws the path hop by hop. A side ledger names what each move did and what it bought.
  - The £120 discount example is now `firstItem([])` with unit tests as the verifier.
- **Chapter clicks play the chapter.** They no longer pause it at t = 0.

## Numbers added

The KV sizing is arithmetic from the Qwen3-4B config. The quantized weight sizes are 4.02 B parameters × bytes per weight. The other glossary values come from the lab's own model, except two:

- KV utilization of 82% (observability glyph)
- 61 → 6 s cold versus warm start (autoscaling)

These two are scenario values, not measurements.
