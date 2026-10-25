# Two-tier projects: overview first, depth on request (draft, 2026-10-25)

## Yash's idea
Visitors should not get every project expanded to full depth by default.
- **Tier 1 (the portfolio scroll):** for each project, one page. It shows the high-level architecture and, in the same page or the next, a summary of the components and results (glossary, the experiment, Policy × runtime, replay, queue, figure story). The summary uses the overlapping-card effect, and asks: "View everything in detail?"
- **Tier 2 (on request):** the visitor flies into the high-level architecture, then the low-level architecture (component microscope), then the results laboratory.

## Proposed design

### Tier 1: the project spread (one viewport per project)

```
┌───────────────────────────────────────────────────────────────────────────┐
│ 04 · INFERENCE OPTIMIZATION ENGINE                                        │
│ Same model, same answers, half the GPU work.                              │
│                                                                           │
│  ┌───────────────── high-level architecture (live walk) ────────────────┐ │
│  │  request → scheduler → KV cache → prefill/decode kernels → stream    │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ✦ −47%            ✦ 1,081 → 445 s       ✦ 11 mechanisms                  │
│  GPU-s per correct  p95 response          in one serving loop             │
│                                                                           │
│  ╭──╮╭──╮╭──╮╭──╮╭──╮╭──╮╭──╮   ← fanned, overlapping result cards       │
│  │  ││  ││  ││  ││  ││  ││  │     (glyph + one starred number each);     │
│  ╰──╯╰──╯╰──╯╰──╯╰──╯╰──╯╰──╯     hover lifts a card and names it        │
│                                                                           │
│                 [ Explore the engine in depth → ]                         │
└───────────────────────────────────────────────────────────────────────────┘
```

- The architecture is the existing one (Astra's), compacted to about 40% of the height, still auto-walking.
- There are three starred headline numbers, at most.
- The card deck is the same family as the glossary and go-deeper tiles. It is overlapping and fanned, with one card lifted at a time on an auto cycle; the visitor can hover to take over. Each card deep-links straight into its module in tier 2.
- One primary call to action. The other projects (Interview AI, Filmora, Medical AI) get the same spread, so the portfolio becomes one page per project.

### Tier 2: the deep dive (a dedicated route per project)
- Route: `/projects/inference` (and `/projects/post-training`).
- The page sequence uses the same block pages that exist now: high-level architecture → component microscope → results laboratory (one block per stage), with a slim progress indicator (HLA · LLA · Lab) and a "← Back to portfolio" link that returns to the project's spread.
- Opening from a card lands directly on that module in the laboratory, with the progress indicator showing where you are.
- The transition is a fly-in: the clicked card scales into the stage frame (a View Transition API cross-document transition where supported; otherwise a plain fade).

### Why a route rather than in-page expansion
- The main scroll stays short and fast. Heavy laboratory bundles load only on request.
- A deep dive gets its own URL, so it can be shared ("look at the inference lab").
- Back and forward behave as visitors expect.

## Open questions for Yash
1. Should the spread include the "Research objective" claim line, or only the title and the three numbers?
2. Should the deep dive open in the same tab (route) or as a full-screen layer over the portfolio?
3. Should the non-compute projects get the same two-tier treatment now, or later?
