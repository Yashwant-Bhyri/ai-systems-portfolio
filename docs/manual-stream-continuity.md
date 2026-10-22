# Direction manual: keep an answer streaming

Main agent owns direction and acceptance. GPT-6 Sol Ultra builds the bounded candidate. This is one component, not permission to replace the portfolio or current simulator.

## Thesis

A new long prompt can interrupt answers already being generated. Limiting prefill per iteration can shorten interruptions, but may delay the new first token and add repeated-step overhead. Teach both sides, not universal acceleration.

Latest user direction: keep this candidate unmounted while the primary cheaper-execution part is finished. After review, it may become a detailed branch inside the separate **Serving under load** part, not a third peer mode or a replacement for the existing film. Declare a new workload, not a continuation of the 96-task cohort. No prefix reuse, speculation, quantization, network or measured GPU claim here.

## Write scope

Only create/edit:

- `app/compute/stream-continuity-model.ts`
- `app/compute/stream-continuity.tsx`
- `app/compute/stream-continuity.css`
- `tests/stream-continuity.test.mjs`

Parent handles lazy mounting/global integration. No packages, routes, old math changes or cleanup. Read applicable skills, PRODUCT.md/DESIGN.md and current rich execution/scheduling SVGs. Existing Geist, blue-black stage, blue baseline, lime optimized, amber prefill, coral stream interruption. No KPI-card grid. Export `StreamContinuity` with no required props.

## Concrete deterministic model

Four requests, one abstract execution device, per-iteration event trace. Units are declared illustrative milliseconds, not hardware measurements.

| ID | Arrival ms | Prompt tokens | Output tokens | User behavior |
|---|---:|---:|---:|---|
| 1 | 0 | 16 | 24 | Existing answer stream |
| 2 | 0 | 16 | 24 | Existing answer stream |
| 3 | 40 | 128 | 12 | New document arrives |
| 4 | 46 | 32 | 8 | Short following request |

Change fixture only if a causal demonstration cannot emerge, explaining why.

**Baseline: Read the whole prompt.** At iteration boundary, pending/admitted prefill runs in full before decoding. Otherwise decode each ready active sequence by one token. A specific declared prefill-priority baseline, not every production engine.

**Chunked: Read smaller pieces.** At each iteration, allocate one decode token to every ready active sequence, then fill remaining token budget with prefill from the FIFO request, continuing across steps. Budget options 16/32/64. No sequence decodes in the same step its prefill completes. All token emissions land at step end, not before mixed prefill magically finishes.

Duration = 4 ms overhead + 0.25 ms per prefill token + 1 ms per decode token. Simple additive teaching cost, not a hardware overlap model. Emit exact starts/ends, allocations, counters/states. No fit points or speedup multipliers.

Memory guard: 16 tokens/page, reserve `ceil((prompt + output)/16)` pages at admission; release on completion. Capacity choices 24 (room) and 12 (long request can wait for release). Label **reserved KV slots**, not physical block allocation/reuse. No eviction. Reject individually impossible requests and invalid parameters, never loop indefinitely. Keep decoding when admission cannot fit. No unsupported preemption.

Derive request arrival/admission/prefill end, every token timestamp, completion; TTFT = first token minus arrival; inter-token gaps and maximum gap; iteration-time sum; total input/output tokens; peak reservation. Missing values null. Preserve tokens across policies. For four tasks show individual gaps, not theatrical p95.

## Spatial argument

One continuous stage, roughly 65% mechanism / 35% consequence.

- Long amber request-3 prompt enters with “Read this longer document.” Requests 1/2 already emit token marks.
- Baseline / Read the whole prompt and Chunked / Read smaller pieces use one absolute time axis.
- In each band, iteration rectangles show amber prefill and blue/green decode. Below, request-1 token events expose the interruption. Request-3 first-token marker shares that axis.
- Reserved-slot rail follows admission/release events. Iteration selection exposes exact allocations/overhead in a compact inspector, not a paragraph dump.
- Baseline's stream visibly stops during long prefill. Chunked pieces leave more frequent emissions. Brackets attach to actual token timestamps, never an invented waveform.
- Consequence first shows paired zero-origin bars for **longest pause in request 1's answer**, then **request 3: time until first token**. Regression stays amber. Final comparison retains both measures. No fake assistant text or correctness grid.

## Direction and interaction

One requestAnimationFrame or existing playback clock; every geometry/readout derived from it. Memoize simulation on cap/capacity. Pause offscreen and hidden. Reduced motion opens settled scene; manual scrubbing remains.

Suggested 36 seconds, using event-derived service-clock targets so all parameter settings work:

1. 0–5s: establish real streams before request 3 arrival.
2. 5–10s: enter request 3, isolate baseline's growing output gap with localized coral bracket.
3. 10–18s: both policies traverse interference; identities/axis persist.
4. 18–28.5s: held trace, 3.5 seconds each baseline → chunked → difference. Highlight main picture and result card together. Labels stay readable.
5. 28.5–36s: request-3 TTFT and repeated-step overhead tradeoff; settle on both consequences.

If memory prevents overlap, explain admission/memory dominates; never force a chunking win. Narrative duration isn't service duration.

Native play/pause, replay, scrubber; budget16/32/64 and capacity12/24; pointer/keyboard request or iteration inspection. Interaction pauses before changing parameters. Focusable horizontal scroll region preserves 680px SVG on 390px screens without page overflow. Visible concise “Illustrative serving loop.” Collapsed assumptions/full-trace JSON, model version, all inputs. Research links in disclosure only, not borrowed performance claims.

## Acceptance

Tests: determinism; sorted/nonoverlapping steps; no pre-arrival/pre-prefill generation; no decode+prefill completion shortcut; matched token totals; finite completion; reservation bounds and final zero; exact allocation accounting; invalid config rejection; 12-page boundary; all caps. Demonstrate actual gap/TTFT/overhead tradeoff, do not invent it.

Visual review: initial streams, document entry, baseline interruption, chunked stream, final tradeoff. Metrics attach to request and unit. Seek/replay/keyboard/reduced-motion stable. Keep complex operational graphics, not tiny decorative boxes or essays. Old films unchanged.

Return four paths, tests, actual derived metric table and compromises. Do not claim integration/visual acceptance, which belong to parent review.
