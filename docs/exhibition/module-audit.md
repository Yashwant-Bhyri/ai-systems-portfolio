# Module audit: space, spacing and wording (2026-10-26)

Yash asked for a clear note on every module: how much empty space each picture has, whether that space is used, and where the spacing or wording is "just not it".

**Method.** `tools/tracker/audit-shots.mjs` captured 37 states at 1440 × 900:
- every arc beat;
- every film chapter, 9 s in;
- every explorer.

`sheets.mjs` tiled them four per sheet (`out/audit/sheet-NN.jpg`). Each module was read for three things: empty area, spacing, and wording.

**Status key:** **Fixed** = changed in this pass; **Noted** = acceptable or deliberate, with the reason; **Open** = worth doing next.

## Inference

### Arc modules (Problem → How it works → In our system → Impact)

| Module · beat | Space | Spacing / wording | Status |
|---|---|---|---|
| **Prefill/decode · Problem, How it works** | The figure fills the stage. | "first token · 228.54 ms after arrival" was **clipped** at the right edge. | **Fixed:** the label sits under the marker, right-anchored. |
| **Prefill/decode · In our system** | Dense; the two schedulers are stacked. | — | Noted |
| **Speculative · Problem** | About 90 px of unused top above the model card. | — | Noted: the card and call row are the whole story. |
| **Speculative · How it works** | Right third empty. | The ledger's "4 words · 1 call of the large model" faded in at the far bottom-right, away from the bar it describes; it read as a ghost label. | **Fixed:** the label sits beside its row and moves to round 2 with it. |
| **Cache routing · Problem, How it works** | Small empty band under the replicas. | The time-to-first-token chart was small next to the replica cards, and its screen-reader labels still said 62 / 42 ms. | **Fixed:** 40 px bars, large values, an `ms` unit, and the clock line hides at the end. The labels read from the study (125 / 65 ms). |
| **Cache routing · In our system** | Dense explorer. | — | Noted |
| **CPU/GPU overlap · Problem** | Empty band between the stage header and the CPU row. | — | Noted |
| **CPU/GPU overlap · How it works** | The right 30% was empty: the overlapped run ends at 16.5 ms on the baseline's 24 ms scale. | The emptiness *was* the result, but nothing said so. | **Fixed:** a dashed "baseline finished here · 24 ms" line and a "7.5 ms sooner" bracket now use that space. |
| **CPU/GPU overlap · In our system** | Dense. | The overlapped panel is dimmed until its turn. | Noted (deliberate) |

### The experiment (film)

| Chapter | Space | Spacing / wording | Status |
|---|---|---|---|
| **01 Baseline serving** | Used. | After calibration, prefill is a 0.17 s sliver on a 72 s timeline, so "Prefill" and "Decode" (and their values) printed on top of each other. The tracker counted 15 overlaps. | **Fixed:** a sliver prefill is labelled just before its segment; the tracker now counts 0. |
| **04 Prefill & decode execution, beat 2** | Big gap under the heading; the whole machine was very faint. | Three dimming rules stacked: beat dim (0.65) × lens dim (0.58) × focus dim. The heading "Worker release" was jargon and did not match the chapter name. | **Fixed:** the beat-level dim is removed and the lens dim lifted to 0.72. The heading now says what to look at, on one line: "Done sooner: the faster run frees its worker". |
| **05 Combined runtime gains** | Used. | The heading began "Continuous batching:", but the method note says the two-worker model is *not* continuous batching. The chapter also never said it was cumulative. | **Fixed:** "Step 1, free-worker scheduling: …", "Step 2, prefix reuse: …", "Step 3, faster prefill & decode: …". The same rename applies to the lab card techniques and the scheduling chapter heading. |

### Explorers

| Module | Note | Status |
|---|---|---|
| **Composition** | Good use of space. The result reads 23.65 → 26.62 GPU-s per correct: the RL checkpoint on the fast runtime is more accurate (44.8 → 69.8%) and slightly costlier per correct answer. The poster's "cheaper per answer" claim was therefore false after calibration. | **Fixed:** the poster states both numbers. |
| **Replay** | Dense and readable. | Noted |
| **Latency** | Dense; the lower chart continues below the fold. | Noted |
| **Serving map** | The densest module. Every row is used, but small type dominates. | **Open:** a calmer default chapter. |
| **Glossary** | Two columns; fine. | Noted |

## Post-training

| Module | Space | Spacing / wording | Status |
|---|---|---|---|
| **Film 01 "The starting point"** | The "How the policy changes" panel was **blank**. `.ls-mechanism` used `justify-content: space-between`, and the tall result column on the right pushed the picture to the bottom, below the fold. | — | **Fixed:** the scene takes the free height and starts under its label. About 370 px of free space remains below the scrubber when the result column is tall. |
| **Film 02 SFT + LoRA** | Used. | — | Noted |
| **Film 03 Learn from outcomes** | Used. | — | Noted |
| **Film 04 Give it more thought** | Used. | The 4× and 8× points ran **off the chart**: the axis was fixed at 36 GPU-s, and calibrated RL at 8× costs 55.5. | **Fixed:** the axis is computed from the runs. |
| **Film 06 The frontier** | The chart is sparse and dim while it builds. | The ledger still showed **pre-calibration costs** (43.69 → 28.11 …) and the closing hero "43.69 → 14.94". With calibrated prefill the base model is cheap per correct answer (18.34), so the old "cost falls" headline no longer holds. The true headline is three times the solved tasks for about the same GPU time per correct answer. | **Fixed:** every hop cost and the axis come from `FRONTIER`. The hero now reads "28 → 82 solved · 18.34 → 20.52 GPU-s per correct"; the chapter detail and the exhibit metric say the same. |
| **Fleet · Problem** | Empty band under the legend. | — | Noted: the 8-GPU strip is the point. |
| **Fleet · How it works, In our system** | Used well; the raster fills the stage. | — | Noted |
| **Inside the model** | Used. | The "6 of 7" counter sat under the fixed Contact pill. | **Fixed:** the counter now sits beside the title. |
| **Capability terrain** | The terrain filled only about a third of its panel (a wide, shallow field under a fixed camera). | "82 of 96" was hidden by the Contact pill. | **Fixed:** the stage is taller (up to 480 px), the camera zooms 1.25×, and the counter sits beside the title. |
| **Test-time curves** | The plot was shallow (about 250 px); the RL line ran past the 36 GPU-s axis. | — | **Fixed:** the plot is 34% taller and the axis is computed (to 60). |
| **Task map** | Fine; empty below the module. | — | Noted |
| **Tasks scatter** | Good. | — | Noted |
| **Regression audit** | Fine. | — | Noted |

## Other numbers that calibration had left stale
- The Architecture page nodes, all now computed from the lab:
  - Schedule "1,081 → 1,006 s" is now 1,307 → 1,162;
  - Accelerate "−4.74" is now −14.56;
  - Distribute "−20 ms" is now −60;
  - Serve "36.61 → 19.29" is now 41.40 → 26.62.
- `app/exhibit/runtime/index.tsx` (the old Runtime wing) still quotes pre-calibration numbers. It is not imported by any route, so it is left as is; delete it or wire it to the lab before reuse.

## Open items, in order
1. Post-training film: the result column sets the panel height. Either shorten it, or give the space under the scrubber a second view (the per-task flips).
2. Serving map: a calmer default.
3. The film's chapter 4, beat 2: the page scrolls the heading under the site header at 1440 × 900 (seen in the capture). Check `useStageHold`'s target for this film.
