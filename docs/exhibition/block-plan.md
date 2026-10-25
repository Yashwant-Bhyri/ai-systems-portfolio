# Results laboratory as one block: plan (round 4)

## Requirements from Yash's brief

| # | Requirement | Decision |
|---|---|---|
| R1 | The fork shows what we did, not a GPU-s number | Branch 1: continuous batching · paged KV and prefix reuse · fused prefill/decode kernels. Branch 2: chunked prefill · token-budget admission · speculative decoding · cache-aware routing · CPU/GPU overlap. The root is renamed "Inference optimization". |
| R2 | The "Go deeper" reel is not at the bottom | It becomes a vertical rail on the left, with the active module expanded. The film's chapters live inside the rail, not as a tab bar above the stage. |
| R3 | Block-wise: no scrolling up and down between modules | The section is one viewport (`100svh − header`). Header row = title and fork. Body = rail plus stage. Every module is tuned to fit about 1140 × 720 at 1440 × 900. |
| R4 | Baseline chapters pull attention; vague one-liners | The chapter tab bar moves into the rail. Baseline headings and card titles are rewritten as measured statements. |
| R5 | More numbers starred, stronger shine | Brighter sweep plus a text glow and a second sparkle, applied to every hero and every final value. |
| R6 | Repetition across Part 1 and Part 2 | Remove Figure story, which replays the same figures. Fold token continuity into prefill/decode scheduling. Speculative decoding shows the agent film, with Astra's round accounting behind a toggle. The serving glossary becomes a module of its own on the stage. |
| R7 | The agent style is liked | Reuse it where a mechanism has two actors (draft vs target). |
| R8 | Every gain names its Δ, unit, meaning and cause | Every plate: Δ number + unit + "of what" + a "cause:" line. |
| R9 | Bloat: small text, big gaps, vague words | Density pass per module; plate type scale; a wording pass. |
| R10 | Where the 96 tasks land | New module: difficulty (y) × GPU-s per task (x). The ability line rises base → SFT+RL, solved tasks light up, and the medians and Δ are drawn. |
| R11 | Baseline and optimized animate at once | Use each component's own `data-focus` to dim the lane that is not being narrated. |
| R12 | Latency plot: a cursor scans ranks while Δ grows | After the ranking, a scan line moves across ranks 1 to 96, with a running Δ bracket and label. |
| R14 | Spacing and wording, verified by screenshots | Every module is captured at 1440 × 900 and checked to fit one block. |
| R15 | Post-training comes later | It shares the block shell, so it must not break; no content changes yet. |

## Module map after dedupe

- **Branch 1 (same intelligence, cheaper execution):**
  - The experiment (5 chapters)
  - Policy × runtime
  - Where the 96 tasks land
  - Execution replay
  - Queue & latency
- **Branch 2 (serving under load):**
  - Prefill/decode scheduling
  - Speculative decoding
  - Cache-aware routing
  - CPU/GPU overlap
  - Serving system overview
  - Serving glossary
- **Post-training:**
  - The experiment (6 chapters)
  - Capability map
  - Compute curves
  - Regression audit

## Technical notes

- No CSS transforms on ancestors of Astra's components: their leader lines measure with `getBoundingClientRect`. Fit modules with density, layout and `max-height` on SVGs instead.
- Chapters and Part 2 rail items are portalled into the rail slot.
