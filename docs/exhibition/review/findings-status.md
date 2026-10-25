# Review findings: what was applied (2026-10-25)

Commits: `c17fc41` → current `main` in design-lab. Tag `lab-topbar-v1` = state before the review.
Verification after applying:
- All 24 lab modules fit one block at 1440×900, 1280×800 and 1920×1080, and the long films fit throughout their runtime.
- The phone layout has no horizontal overflow.
- Tests are 365/366; the one failure (`const ROLES`) also fails in Astra's repo.
- tsc and eslint are clean.

## Blockers
| # | Status |
|---|---|
| B1 Speculative accounting overflow, "…" | **Fixed.** The view fits at every moment; placeholders render 0. The agents film gained a result card (starred "Δ 9 large-model calls", 12 → 3, cause) and a pause control. The cursor opens the accounting view after two loops. |
| B2 Worker scheduling transport pushed off | **Fixed.** The ledger has a constant height. |
| B3 Transport off-screen at 1280; jumps between beats | **Fixed** for overflow (execution and queue fit throughout at 1280×800). The transport still shifts by a few px between execution beats. |
| B4 "… B" | **Fixed.** The final value is shown, with the unit line. |
| B5 Post-training explorers frozen | **Fixed.** A cursor tour runs Base → SFT → RL → Lean, then 1× → 4× → 8× → 2×. The idle Pause label is removed. |
| B6 Cross-lab numbers | **Fixed** in every tab value: computed from the module's default state, with checkpoint and thought allowance in the unit. "Where the 96 tasks land" has its own glyph. The post-training *film's* numbers (28 → 82 at 1×/4×) are unchanged, by design: they now say their allowance. |
| B7 Honesty | **Fixed.** "Draft model / Target model" replace the Qwen names in the illustration. The objective now reads "(synthetic 96-task cohort)", and the architecture strip says "of 96 synthetic tasks". Yash's own "MY CONTRIBUTION" claims are left as written. |
| B8 Module bar hides modules | **Fixed.** The open tab is always scrolled into view; edge fades and "+N" chevrons mark tabs beyond the edge; the workload select moved into the film. |
| B9 Contact pill overlap | **Fixed** for the lab head and the phone title. The architecture boxes are untouched (Astra's section). |
| B10 Overview chrome and legibility | **Fixed.** Kicker, sub-step rows and deep links are removed; the schematic is larger, with 14 px inner text. |

## Majors
- **Applied:**
  - M1: one lane at a time in Prefill/decode, KV reuse, Execution, overlap, cache and queue.
  - M2: the Δ is the hero; lane values are quiet pairs.
  - M3: stars only on settled, favorable results.
  - M4: plates show settled values (runtime gains, task landing, lean, GRPO, SFT).
  - M5, M6: Worker scheduling follows request 7 across 8 requests, with "Δ 7.65 s less waiting · cause".
  - M8: canonical names: RL checkpoint, Lean RL, thought, One shared document / Different documents, continuous batching, prefix reuse, faster prefill & decode.
  - M9: "rates", not "kernels", in the lab.
  - M12: on-stage caveats moved off.
  - M13: text floor inside scaled figures (Replay, Cache, Execution, Overview).
  - M15: one clock per film.
  - M16: units and causes on every Δ.
  - M17: speculative result.
  - M18, M19: prefill/decode hero; concrete titles.
  - M22: tab values computed (10 mechanisms, p95 1,006 → 445).
  - M23: percentile tour ends on p95; the cursor never idles mid-stage.
  - M24: replay re-lands each measure.
  - M25: cause copy; answer-only labels.
  - M26: task landing.
  - M27: one checkpoint name.
  - M29: first_item.
  - M33: cache jargon.
  - M36: architecture headline and research objective.
- **Partly applied:**
  - M7: tab and chapter values now come from the same simulation; the 9.36/9.37 rounding differs by display precision only.
  - M11: workload and thought labels unified; one control row per explorer remains.
  - M14: explorers fill the stage.
  - M30, M31: headers and transports share one layout row grammar in the block; not one shared component.
- **Needs Yash's decision (not changed):**
  - M10 deduplication:
    - move "Where the 96 tasks land" into post-training?
    - cut the overview beats Stream pause / Locality / Draft-verify?
    - drop the Policy × runtime lenses that repeat chapter 05 and the post-training lab?
    - microscope = mechanism only?
  - M20, M21, M28: post-training chapter titles, frontier reconciliation, one plate grammar. Deferred: post-training comes later.
  - M32: one color system (baseline slate-blue, optimized green, violet = Δ only, coral = waste).
  - M34: a phone variant that shows one lane at a time.
  - M35: architecture sections are 924/943 px at a 900 px viewport (Astra's section).

## Minors and polish
- **Applied:**
  - plurals ("1 requests", "1 fewer request");
  - unit spacing in Worker scheduling;
  - "0 GPU-s · baseline";
  - "tokens", not "output units";
  - seconds only (no m:ss);
  - "Add up the three costs";
  - KV copy (Contract · N tokens, "Reused: the contract's keys and values, not its answer", "answer still decoded");
  - "Same 96 requests / Request 7 highlighted";
  - the queue ordering and amber copy;
  - the "Four words from one large-model call…" caption;
  - the glossary subtitle and quieter links;
  - legend lines in Worker scheduling and overlap;
  - "Story position" label removed;
  - ability label moved off the dots;
  - axis-title collision in task landing;
  - the floating "Event trace" / "Scheduling trace" / "Service replay" / "Execution trace" labels.
- **Not yet:**
  - thousands separators, minus signs and percent precision across every Astra component (m5–m8);
  - round axis ticks (m10);
  - kicker style in post-training (m12);
  - remaining polish items p1–p16 that live inside Astra's SVG layouts.
