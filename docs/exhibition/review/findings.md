# Results laboratory: design and copy review (2026-10-25)

The reviewer agent captured all 25 lab modules plus both architecture and microscope sections against the dev server on :3290. Every module was shot at 1440×900 at 3–9 moments, and key modules were spot-checked at 1280×800, 1920×1080 and 390×844. The agent also swept the toggles for overflow and measured frame-to-frame motion.

Artifacts:
- `shots/<module>-<vw>-<t>s.jpg`
- `text/v-*.md`
- `scripts/`: `film.mjs`, `watch.mjs`, `toggles.mjs`, `spec3.mjs`

Paths below are relative to `app/`.

Counts: **10 Blocker · 36 Major · 41 Minor · 16 Polish** (103 findings). A **Status** column records what was applied; see `findings-status.md`.

---

## 1. Verdict per module

### Inference: above the lab
- **Architecture (#inference).**
  - Works: the hero claim, and the five-stage strip with a live diagram.
  - Fails:
    - The section is 924 px tall in a 900 px viewport.
    - The stage labels are verbs only.
    - One triad of vague lines ("Many requests. Shared computation. Separate state.").
    - CONTACT ME covers the corner of the MY CONTRIBUTION box.
    - "−20 ms warm route" repeats the cache-routing result.
- **Component microscope (inference).**
  - Works: confident editorial.
  - Fails:
    - Its nine chapters re-teach the Part-2 modules.
    - Two pause buttons.
    - The ghost tooltip "And back" sits over a step label.

### Inference Part 1
- **01 Baseline serving.**
  - Works: the best module. It follows one request with correct lit/matte attention.
  - Fails:
    - The 10 s title overclaims the barrier.
    - The labels "9.83 GPU-s13.92 GPU-s" collide.
    - Two clocks.
- **02 Worker scheduling.**
  - Works: the lanes on one axis, and the red idle marks.
  - Fails:
    - It drops request 7 for 6 requests and follows request 5.
    - The hero is worker-s, not a time gain.
    - "100% less idle" is trivially true.
    - The final beat pushes the transport off-screen.
- **03 KV prefix reuse.**
  - Works: a strong mechanism film.
  - Fails:
    - A third header grammar.
    - Jargon (θ fixed, prefix identity lookup, softmax).
    - "decode work retained" is wrong.
    - Both lanes are lit at 22 s.
    - s and GPU-s are mixed.
- **04 Prefill & decode execution.**
  - Works: four honest views, and the final Δ is starred correctly.
  - Fails:
    - Three navigation levels.
    - Baseline values in the hero slot ("157.9 s", "306 requests").
    - Hero and sentence collide.
    - "1 requests".
    - m:ss mixed with seconds.
    - The transport jumps, and text goes down to 7.5 px.
- **05 Combined runtime gains.**
  - Works: the ladder, and the final 36.61 → 19.29 (−47.31%) with its causes.
  - Fails:
    - Count-ups show wrong values.
    - The right-panel numbers have no units.
    - The leader line crosses the transport chip.
    - Disclaimer and link chrome.
- **Policy × runtime.**
  - Works: it auto-cycles its lenses, and the scatter is legible.
  - Fails:
    - Four rows of controls.
    - Two names for one checkpoint.
    - "≈ −12.59".
    - Its lenses repeat chapter 05 and the post-training lab.
- **Where the 96 tasks land.**
  - Works: the ability-line metaphor.
  - Fails:
    - It belongs in post-training.
    - No transport, and it stops after about 9 s.
    - Cause/Next text box.
    - The label overlaps the dots, and the bracket crosses the axis title.
    - Its glyph prints "28 → 82".
- **Execution replay.**
  - Works: the request strip, and the Δ + cause sentence.
  - Fails:
    - Five control rows.
    - It looks stopped at "20 / 20 s".
    - Plot at a third of the width, with 7 px labels.
    - It repeats request 7 a third time.
- **Queue & latency.**
  - Works: the rank scan with the shaded saved area, and the named cause.
  - Fails:
    - Odd ticks.
    - Empty ordering panel.
    - "Δ 1 fewer requests waiting".
    - The tab p95 disagrees with the module.
    - The ghost's p50 ending contradicts the chip.
    - The idle ghost parks mid-stage.

### Inference Part 2
- **Prefill / decode scheduling.**
  - Works: an honest tradeoff.
  - Fails:
    - Both lanes lit for the whole film.
    - The Δ is not the hero.
    - Two selects and three links.
    - The beat title equals the module name.
    - 9 px labels.
- **Speculative decoding.**
  - Works: the agents film is calm.
  - Fails:
    - No transport and no hero number, and "12 → 3" never appears.
    - The ghost never opens the accounting view, which overflows about 384 px with "…".
    - The sentence baseline wobbles.
    - Real model names on an illustration.
- **Cache-aware routing.**
  - Works: the causal equation and the crossover chart.
  - Fails:
    - A cramped page-slot diagram.
    - A control-panel header.
    - The star lands on the loss case.
    - Jargon.
- **CPU / GPU overlap.**
  - Works: clean arithmetic, and one lane at a time.
  - Fails:
    - "output units".
    - Boxed chips.
    - A legend line.
    - The "5 ms" label is crammed.
    - The right card is narrow.
- **Serving system overview.**
  - Works: rich, correct content.
  - Fails:
    - Six rows of chrome.
    - 5–7 px text, and a small schematic.
    - "… B".
    - "11 mechanisms" vs 10 beats.
    - Duplicates its siblings.
- **Serving glossary.**
  - Works: a tidy grid.
  - Fails:
    - 5 px illustration text.
    - "See it in the microscope ↗" ×8.
    - One card has no number.
    - Mixed sources, and TPOT vs ITL.
    - "61 → 6 s" is unexplained.

### Post-training
- **Architecture.**
  - Works: the headline and diagram.
  - Fails:
    - 943 px tall.
    - "Qwen3-4B" / "held-out accuracy" beside synthetic numbers.
- **Microscope.**
  - Works: the LoRA mechanism.
  - Fails:
    - Its chapters repeat lab chapters 02/03/04 and the audit.
    - Empty typing band.
    - "RTX 4090".
- **01 The starting point.**
  - Works: concrete crash copy.
  - Fails:
    - Aphorism title.
    - 7 px labels.
    - The header says 4× while the chapter runs at 1×.
    - "+0 · −0".
- **02 SFT + LoRA.**
  - Works: faithful adapter math.
  - Fails:
    - Five sub-tabs and two transports.
    - firstItem vs first_item.
    - A disclaimer line.
- **03 Learn from outcomes.**
  - Works: the rollout grid.
  - Fails:
    - Mono jargon (π, Â, r̄).
    - Mid-count mismatch (53/96 vs 57.3%).
- **04 Give it more thought.**
  - Works: the best PT chapter.
  - Fails:
    - Giant buttons, an extra slider and a formula.
    - At 1280 the chart text is 6 px.
- **05 Make thought count.**
  - Works: token bars, same 82 solved, −31% tokens.
  - Fails:
    - The counts overshoot.
    - Aphorism title.
    - "+3/−3" is unexplained.
- **06 The frontier.**
  - Works: "Training moves it up. Serving moves it left."
  - Fails:
    - Its numbers don't reconcile with chapters 01–05.
    - The hero floats on the grid.
    - The "fuse kernels" claim.
- **Capability map / Compute curves / Regression audit.**
  - Fails:
    - Frozen (0.0–0.4% motion), with no ghost and a "Pause" label.
    - An empty 180 px band.
    - Tab values contradict the views.
    - The same right panel ×3.
    - They duplicate "Where the 96 tasks land".

---

## 2. Findings by severity

### Blocker
- **B1. Speculative decoding, "Round-by-round accounting" view.**
  - Problem: the stage overflows 659/1043. The transport and chart sit below the fold, beside disclaimer paragraphs. The result card shows "… accepted / + … target bonus / = … sent to the user".
  - Fix: make it a two-column plate: figure about 560 px, and a result card with a starred "12 → 3 target calls" and "Δ 9 calls · cause: 3 rounds accept 3–5 words each". Move the paragraphs to the record, and render 0 instead of "…".
  - Files: `compute/draft-verification.tsx` (around line 961), `.css`.
- **B2. Worker scheduling, 32–35 s.**
  - Problem: two extra ledger lines grow the panel, and the transport is pushed half off-screen.
  - Fix: reserve `min-height` on `.sq-ledger-result` and use one line.
  - Files: `compute/scheduling-ledger.tsx:120–133`.
- **B3. Execution 36 s and Queue 40 s at 1280×800.**
  - Problem: the transport is pushed out. The execution transport also moves between beats at 1440 (y 845/787/861/839/800).
  - Fix: films use grid rows `auto minmax(0,1fr) auto`, with the transport pinned and the figure in the flexible row.
- **B4. Serving overview, quantization beat.**
  - Problem: the hero renders "… B".
  - Fix: show a starred "12 B" with "stored per 16 weights, incl. scale (was 64 B)".
  - File: `compute/serving-hardware-scenes.tsx` (around line 549).
- **B5. Capability map / Compute curves / Regression audit.**
  - Problem: frozen, with no ghost and a "Pause" label.
  - Fix: a scripted tour (checkpoints, then thought caps) with the hero Δ updating, and ▷ when idle.
- **B6. Cross-lab: incompatible numbers for "the same 96 tasks".**
  - Problem:
    - Inference shows 43 → 67 and 36.61 → 19.29; PT shows 28 → 82 and 43.69 → 14.94.
    - SFT is 60.4% in one place and 47.9% in another.
    - The "Where the 96 tasks land" glyph prints "28 → 82".
    - The PT tab values (+54, 88 at 8×, 59/5) contradict the default views (+24, +26/−2 at 2×).
  - Fix: put the checkpoint and thought allowance in every count, compute tab values from the views, give the module its own glyph, and state the inference checkpoint once in the head.
- **B7. Honesty.**
  - Problem:
    - "Qwen3-4B pipeline" and "held-out accuracy" sit beside synthetic results.
    - The microscope says "A pretrained Qwen3-4B learns…" with "RTX 4090".
    - The draft film names Qwen3-0.6B and Qwen3-4B.
  - Fix:
    - Say "synthetic" in the unit.
    - Objective: "Raise verified accuracy per GPU-second across thought allowances (synthetic 96-task cohort)".
    - Agents: "Draft model / Target model".
    - Drop "RTX 4090".
- **B8. Module bar hides modules.**
  - Problem:
    - At 1440, "Queue & latency" is off-bar while the pills are open.
    - Part 2's last tabs are cut.
    - At 1280, nothing shows after "Where the 96 tasks land".
    - At 390 the active tab can be off-screen.
    - No fade or chevron.
  - Fix: chapter pills shrink to numbers, move the workload select into the stage, add edge fades with a "+N" chevron, and keep the current tab in view.
- **B9. CONTACT ME overlaps.**
  - Problem: it overlaps the PT bar at 1280, the fork subtitles, the MY CONTRIBUTION boxes, and the phone title.
  - Fix: reserve a gutter, or dock it into the nav below 1500 px.
- **B10. Serving overview legibility and chrome.**
  - Problem: 6.7 px text (5.2 px at 1280), six control rows, and a schematic that fills about 30% of the stage.
  - Fix: remove the sub-step row and deep link, merge the beats into transport chips, scale the schematic to fill the stage, and set an 11 px floor.

### Major
- **M1. Two lanes lit at once.**
  - Where: Prefill/decode scheduling (whole film); Execution "Request execution"; KV at 22 s; Worker scheduling at 33 s (R5 in both lanes).
  - Fix: use the `data-focus` matte pattern, and light only the Δ bracket on the paired beat.
- **M2. The hero slot holds the baseline (Execution).**
  - Problem: "157.9 s Baseline finishes…", "306 requests Baseline spends…", "24.03 GPU-s…".
  - Fix: the hero is always the Δ.
- **M3. Stars on trivial or wrong numbers.**
  - Where: `.bo-measure` (the waiting counter), `.cr-delta` on the loss case (with a detached ✦), all nine `.gb-value`, all `.mb-value`.
  - Fix: star only `[data-hero]`, favorable, settled results, one per view.
- **M4. Count-ups show wrong values.**
  - Where:
    - Combined: Δ 0.07 s, Δ 3.19, 20.57.
    - Where-96: 8.3 vs 8.2.
    - Make thought count: 5,500 −35% and 17.86 −31.4%.
    - GRPO: 53/96 beside 57.3%.
  - Fix: count-ups at most 600 ms, after the bars settle, with no overshoot.
- **M5. Baseline title overclaims.**
  - Fix: "Request 7 waits 64.32 s; the last stretch with worker 2 idle behind the barrier".
- **M6. Worker scheduling abandons request 7 and the time gain.**
  - Fix: use 8 requests and follow request 7. Hero: "Δ 7.65 s less waiting for request 7 · cause: a free worker starts the next request without waiting for its pair". The worker-s ledger becomes secondary.
- **M7. The request-7 Δ appears four ways** (9.37, 9.36, 9.47, 12.42/12.2).
  - Fix: one rounding source, and label the Replay input lens "reuse + faster rates".
- **M8. One intervention has five names.**
  - Fix: adopt the canonical names in §4.1.
- **M9. Fork overclaims "kernels".**
  - Fix: "Faster prefill & decode rates", and the frontier says "prefix reuse + faster rates".
- **M10. Repetition map.**
  - Problem:
    - The chapter 05 result is repeated in the Policy runtime lens.
    - Request 7 appears three times.
    - +24 appears in five places.
    - Test-time scaling appears three times; LoRA, GRPO, chunked prefill, draft/verify and locality appear twice or more.
    - The glossary points back to the microscope.
  - Fix:
    - Microscope = mechanism only, lab = result.
    - Overview beats 3–5 are cut, or it becomes a map.
    - Where-96 moves to PT.
    - Policy keeps only the Combine lens.
- **M11. IT-dashboard rows of controls.**
  - Where: Policy, Replay (five rows), Prefill/decode (selects), Cache (toggles and slider), Overlap, PT thought row.
  - Fix: one text-styled control per view, scenario switches in the lab head once, and one record link per lab.
- **M12. On-stage disclaimer lines** (adapter-reveal 575/590, serving-continuity 619, serving-hardware 549/744/1261, "Absolute error … not a task-accuracy measurement", execution-scale 520, the runtime-gains accounting details).
  - Fix: move them to the scenario record.
- **M13. Text below 10 px.**
  - Where: Overview 6.7 px, glossary 5.2 px, Replay 7.0, Cache 7.1, Execution 7.5, PT 8.0. At 1280: 6.0 and 5.2.
  - Fix: an 11 px floor; scale the figure, not the type.
- **M14. Bloat (small figures, big voids).**
  - Where: PT explorers (180 px band), Execution (about 80 px), Speculative (right 400 px), Replay plot (370 px wide), Queue ordering panel, 1920 (about 100 px under the transport).
  - Fix: the figure row is `1fr`, and SVGs fill it.
- **M15. Two clocks and mixed formats.**
  - Where: Baseline 100.08 s vs 27.12/28 s; Queue workload clock vs 49/49 s; Execution 3:05 vs 185 s, and 64:37 / 80:47.
  - Fix: one clock, and seconds only.
- **M16. Δ without unit, meaning or cause.**
  - Where: chapter 05 panel "−12.59 / −4.74"; "≈"; "/ correct"; "4 / 11.7 worker-s removed" with no cause; "Δ 1 fewer requests waiting"; "Δ 30 fewer…" with no cause; the glossary's 61 → 6 s, KV util 82% and TPOT.
- **M17. Speculative decoding has no result, transport, or demo of its second view.**
  - Fix: add an 8th beat "12 words · 3 target calls instead of 12" (starred), plus a transport, and the ghost switches views.
- **M18. Prefill/decode: the Δ is not the hero.**
  - Fix: a starred "Δ 45.75 ms" with "shorter worst pause in request 1's stream · cause: request 3's 128-token input runs in 16-token chunks". The TTFT Δ goes in the cost color, without a star.
- **M19. Beat titles repeat module names.**
  - Where: "Prefill/decode scheduling", "KV capacity & cache-aware routing", "CPU/GPU scheduling overlap", "Request execution".
- **M20. Post-training chapter titles are aphorisms.**
  - File: `compute/lab-story-data.ts:59–109`.
- **M21. Post-training chapter 06 numbers don't reconcile with chapters 01–05, and the header shows 4× during chapters 01–03.**
- **M22. Tab values contradict modules.**
  - Where: Queue 1,081 → 445 vs 1,005.5 → 445.4; "11 mechanisms" vs 10 beats; a glossary card without a number; 11.65 vs 11.7.
- **M23. Queue end state.**
  - Problem: the ghost's p50 doesn't match the "p95 comparison" chip, the idle ghost parks mid-stage, and a tooltip covers "Baseline".
- **M24. Execution replay looks stopped (20 / 20 s ▷).**
  - Fix: replay the draw-in after each ghost change.
- **M25. Replay content errors.**
  - Problem: "8,192 input tokens computed" shows in the answer-only lens, and "20.41 s · since worker start" duplicates the card.
- **M26. Where the 96 tasks land.**
  - Problem: motionless, a text box, the label over the dots, the bracket crossing the axis title, and "2.7× longer" vs 2.2×.
- **M27. Policy: two names for one checkpoint, and "Selected:" shows during KV-only.**
- **M28. Post-training film: a different layout per chapter, and two transports.**
- **M29. firstItem vs first_item.**
- **M30. Part 1 chapter headers use four grammars.**
- **M31. The transport has five designs.**
- **M32. Color meaning drifts.**
  - Rule to adopt: baseline is slate-blue, optimized is green, violet is Δ only, coral is waste only.
- **M33. Cache-routing wording and jargon.**
  - Where: "#0 · 0 ref", "selected state", and the instruction line.
- **M34. Phone: labs are 1.5–2.3 screens tall, with sideways-scrolled figures.**
- **M35. Architecture sections are 924 and 943 px tall at 900.**
- **M36. Vague architecture and microscope copy.**
  - Where: the triad line, verb-only stage labels, the INPUT/OPERATION/OUTPUT footer, "cognition request".

### Minor (m1–m41) and Polish (p1–p16)
See the reviewer's report in the session transcript (summarized):
- Plurals: "1 requests", "1 fewer requests".
- Missing or glued spaces: "0GPU-s", "35s", "157.9 sBaseline…".
- Thousands separators, minus signs (use U+2212), and percent and decimal precision.
- Request naming (Request 7 vs R7 vs Req 7).
- Non-round ticks.
- Heading periods and kicker style.
- "+9 / −0".
- CPU/GPU spacing.
- "output units" / "token units".
- worker-s vs s.
- s plus GPU-s added together.
- Jargon to gloss (θ, softmax, Â, r̄, π, TPOT, ITL, TTFT, block table, KV util).
- KV copy: "decode work retained", "Contract context", the three-line text box.
- Runtime "Same task identities".
- Queue ordering copy and "Amber points…".
- Agent labels and "Four words for one call…".
- Default selected task.
- Case consistency.
- A triple-stated idea in Baseline.
- "Locate the three costs".
- Legend lines → direct labels.
- Instruction copy in the microscope.
- Glossary subtitle.
- "Story position" / "Scrub the reveal" labels.
- Deep links inside films.
- Marker collision on "1,000".
- Speculative sentence wobble.
- An extra slider under Execution chapter 04.
- A pre-hydration bar flash.
- The empty mini chart in the capacity card.
- Polish:
  - centering and gutters;
  - the leader line crossing chips;
  - the Policy bracket over a tick;
  - hero/sentence collisions;
  - touching labels in Baseline;
  - the overlap label inside the red bar;
  - a floating ✦;
  - the frontier hero on the grid;
  - CONTACT ME outside the column at 1920;
  - tooltip offsets;
  - the empty typing band;
  - the clock straddling a border;
  - faint glyphs;
  - the narrow overlap card.

---

## 3. Rewrite table
The full 122-row table is reproduced in `rewrites.tsv` (current → proposed, with file:line).

## 4. Cross-cutting

### 4.1 Canonical names

| Concept | Use | Retire |
|---|---|---|
| Free-worker admission | Continuous batching | Worker scheduling, first available worker, Admit the next request sooner |
| Prefix KV reuse | Prefix reuse | KV prefix reuse, KV reuse, ready-prefix reuse, Paged KV + prefix reuse |
| Rate change | Faster prefill & decode | Fused … kernels, Execution rates, Faster execution, faster token rates |
| Post-trained checkpoint | RL checkpoint | Post-trained, Correctness RL, SFT + RL, Correctness-trained checkpoint |
| Efficient checkpoint | Lean RL | Efficiency-aware RL, Length-aware RL |
| Budget | thought ("4× thought") | cap, allowance, budget |
| Workload | One shared document / Different documents | Shared-prefix burst / Interactive |
| Outcome change | gained / lost | — |
| Stream gap | worst token gap | TPOT, Maximum inter-token latency |
| Request id | Request 7 in prose, R7 in bars | — |

### 4.2 Units vocabulary
- GPU-s = GPU work. s = wall clock. worker-s = the scheduling ledger only. ms = Part 2 toy scales. tokens, never "units".
- Δ format: "Δ <n> <unit> <less/sooner/more> · cause: <mechanism>".
- One decimal for percents. Use the U+2212 minus.

### 4.3 One result, one home
- The runtime result belongs to chapter 05.
- The post-training result belongs to the post-training lab.
- Mechanisms belong to the microscope.
- The overview becomes a map.
- Request 7 is the protagonist of Part 1.

### 4.4 One plate grammar
- Header: one sentence with numbers, plus one meta line.
- Figure: `1fr`, with an 11 px floor.
- Result card: one starred Δ, plus unit and cause lines.
- One shared transport, pinned.
- At most one control, demoed by the ghost.
- Every view auto-tours.

### 4.5 Viewports
- 1440: B1 and B2.
- 1280: B3, B9, and 5–6 px text.
- 1920: about 100 px voids.
- 390: M34.
