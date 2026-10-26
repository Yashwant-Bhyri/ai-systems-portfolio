# Page 2 · project poster: three directions (2026-10-26)

**Brief.** Page 2 of each flagship project on the main portfolio. One screen, read in about five seconds by a hiring manager or ML-infra engineer. It must *entice* (Yash: "a very heavily fitted poster … impact generating") and hold the title cards (the experiment, Policy × runtime, Execution replay, Queue & latency, Prefill/decode, Speculative decoding, Cache-aware routing, CPU/GPU overlap, Serving overview, Glossary). One action: explore the project in depth (HLA → LLA → laboratory).

**Rejected (round 6).** `/overview`: copy column + three hero numbers + a fanned card deck. It reads as a dashboard, and the cards were the subject instead of the result.

**Fixed tokens (the portfolio's own, not reinvented).**
- Ground `rgb(6,9,12)`; ink `#eef2f6`; secondary ink `#9aa6b2`.
- Inference amber `#ffc267`, post-training rose `#f3a0bc`; baseline slate-blue `#9cc5f5`; optimized green `#b8e986`; Δ violet `#c7a6ff`.
- Type: Geist Sans for words, Geist Mono for numbers. The numbers are the display face.

The skill's warning applies: a near-black ground with one accent is a default look. Here it is the site's established identity, so the distinctiveness has to come from **composition**, not colour.

## A · The ledger (the cost bar is the poster)
```
┌──────────────────────────────────────────────────────────────┐
│ Inference optimization engine          Explore the engine ▸  │
│                                                              │
│ 36.61 ███████████████████████████████████████████████████    │  ← one bar, full bleed
│        [prefix reuse −12.59][kernels −4.74]  ← slices fall away
│ 19.29 ███████████████████████████████                        │
│ GPU-seconds per correct answer · same model, same answers    │
│──────────────────────────────────────────────────────────────│
│ under load:  56→10.25 ms   12→3 calls   62→42 ms   52→37 ms  │  ← four small multiples
└──────────────────────────────────────────────────────────────┘
```
Memorable thing: the bar physically losing its two slices; each slice *is* a title card (its name, Δ and cause ride on the falling piece).

## B · The machine (the architecture is the poster)
```
┌──────────────────────────────────────────────────────────────┐
│ 36.61 → 19.29 GPU-s per correct answer                       │
│   requests ─▶ [router] ─▶ [scheduler]─▶[KV pages]─▶[GPU]─▶ tokens │
│                 ▲ −20ms      ▲ 56→10ms   ▲ −34%    ▲ 52→37ms │
│                            [draft model] 12→3 calls          │
│   a spotlight tours the machine; each pin opens to its card  │
└──────────────────────────────────────────────────────────────┘
```
Memorable thing: every number pinned to the physical part that earns it.

## C · The wipe (before and after are the poster)
```
┌───────────────────────────╱──────────────────────────────────┐
│ 96 requests, baseline    ╱   the same 96, optimized          │
│ ▬▬▬▬▬▬░░▬▬▬▬▬▬▬▬░░░▬▬   ╱    ▬▬▬ ▬▬ ▬▬▬                      │
│ (long, idle gaps, red)  ╱     (short, packed, green)          │
│      the seam sweeps; technique names surface along it        │
└─────────────────────────╱────────────────────────────────────┘
```
Memorable thing: one seam crossing the whole run, with the techniques appearing exactly where the seam passes.

## Review against the brief
- **A** is the most legible in five seconds and the most "poster". Risk: it shows only the cost story, so the under-load row must not shrink into a stats strip. The four small multiples therefore keep their own before/after bars, not bare numbers.
- **B** best connects page 1 (architecture) to page 2. Risk: it repeats page 1's diagram. Mitigation: no boxes-and-arrows chrome; the machine is drawn as a single horizontal pipe and the numbers dominate it.
- **C** has the strongest motion but the weakest names; techniques read as captions. Keep it as the comparison point.
- Removed from all three: all-caps eyebrows, middle-dot meta strings in headings, numbered markers (the cards are not a sequence).
