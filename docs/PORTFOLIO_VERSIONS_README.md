# Portfolio — Complete Version Guide

**Owner:** Yashwant Bhyri · **Last updated:** 2026-07-20 (v6-elite)
This is the single document to keep. It explains every version of the portfolio,
where it lives, how to run it, how to roll back, and where the full history is logged.

---

## 1. The map — every directory, what it is

| Directory (under `/Users/yash/Documents/Resume/`) | What it is | State |
|---|---|---|
| `portfolio` | **V2 live** — Codex's accepted V2 baseline | Read-only reference. Never edited by Fable. |
| `portfolio-v3` | Codex's parallel V3 experiment | Read-only reference. |
| `portfolio-fable` | **Fable's main fork** (duplicated from the frozen V2 baseline) | Holds v1→v4 of Fable's work. Frozen at **v4**. |
| `portfolio-fable-trial` | **Isolated trial fork** (duplicated from portfolio-fable @ v4) | Holds v5, v5-enhanced, **v6-elite (current best)**. |
| `/Users/yash/Documents/kimi/workspace/portfolio-kimi` | The kimi/Lumen stream (separate agent's build, port 7100) | Reference only (Lumen guide studied for Spark). |

## 2. The versions — what each tag means

All version switching is done with git tags. Both forks keep full history.

### In `portfolio-fable` (the main fork)
| Tag / commit | Name | What it contains |
|---|---|---|
| `2862b80` | fork baseline | Exact duplicate of the accepted V2 site. |
| `4cafae8` | Fable v1 | Self-driving standalone experience (app/fable shell: typed hero, galaxy, mascot, autoplay director). Superseded. |
| `38fdded` | Fable v2 | All operational graphics replaced with live sim-clock operation scenes (D6). |
| `c2a5d02` | Fable v3 | Best-of-both merge: V2's depth reciprocated into live scenes (D7). |
| `45ffd72` | — | **Direction correction: the V2 experience becomes the canvas**; live scenes mounted inside V2's walkthroughs (D8). |
| `d7bbf13` · tag **`v4-polish-d7bbf13`** | **v4 (pure baseline)** | Full polish pass: typed hero w/ paint highlights, self-flipping deck, typed index hook, overview glow tours, avatars, token pills, claim framing, orchestrator glyph cards, platform badges, skill-scan scene, editor DAG v1, observability loop, HNSW descent, evidence insets, radar review. |

### In `portfolio-fable-trial` (the experiment fork)
| Tag / commit | Name | What it contains |
|---|---|---|
| `49c8723` · tag **`v5-baseline-49c8723`** | **v5 (pure baseline)** | Clustered drifting keyword galaxy, Spark tour guide, interactive Filmora DAG, rulebook validation gate, logistics dissolved into research, real platform brand SVGs, ⟪emphasis⟫ copy system, greeting line, pause button removed. |
| `c0db353` · tag **`v5-enhanced`** | v5-enhanced | Real CUHK coat of arms (downloaded), dedicated SVG glyphs for INTELLIGENCE/OUTPUT/PRODUCTION map nodes, 12-node production DAG with QA + human gates, denser galaxy (3 clusters alive), reworded hero thesis, full logistics console in research, typography pass. |
| tag **`v6-elite`** | **v6 (final polish)** | Line-by-line elite pass: every stale/clunky string fixed ("six specimens", measured-latency proof, bounded-copilot card), dead code removed (old logistics chapter/visual/mini), single guide (Spark replaces V2's Orbit), caption corrections, greeting spacing detail. |

## 3. How to run any version

```bash
# 1) go to the fork that has the version you want
cd /Users/yash/Documents/Resume/portfolio-fable        # for v4 and earlier
cd /Users/yash/Documents/Resume/portfolio-fable-trial  # for v5 / v5-enhanced / v6-elite

# 2) check out the tag you want (or stay on the latest)
git checkout v6-elite          # or v5-enhanced, v5-baseline-49c8723, v4-polish-d7bbf13, …
git checkout main 2>/dev/null || git checkout -        # to come back to latest

# 3) run it (both forks already have node_modules installed)
npm run dev                    # serves on http://localhost:3000
```

**Important:** both forks use port 3000 — stop one dev server before starting the other.
Claude Code launch configs exist in `/Users/yash/Portfolio/.claude/launch.json`:
`fable` → portfolio-fable, `trial` → portfolio-fable-trial.

## 4. To see a version list at any time

```bash
git -C /Users/yash/Documents/Resume/portfolio-fable tag        # v4 lineage
git -C /Users/yash/Documents/Resume/portfolio-fable-trial tag  # v5/v6 lineage
git -C /Users/yash/Documents/Resume/portfolio-fable-trial log --oneline  # full history
```

## 5. Where everything is written down

- **Build ledger (the full story):** `docs/fable-build-ledger.md` in each fork —
  append-only log of every requirement, decision (D1–D8), plan, verification, and
  environment quirk since day one. Read top-to-bottom to resume cold.
- **The brief:** `/Users/yash/Documents/Resume/FABLE_V2_FORK_MEGA_PROMPT.md`
  (read §6 first), plus `PROJECT_CONTEXT_FOR_RESUME_AGENT.md` (grounded facts).
- **This file:** the version map. Keep it with the résumé.

## 6. Assets worth knowing about

- `public/brands/` (trial fork): real platform marks — tiktok, douyin, xiaohongshu,
  instagram, wechat, facebook (SVG) — and **`cuhk.png`, the actual CUHK coat of
  arms** (Wikimedia Commons, fetched via the images.weserv.nl proxy because direct
  wikimedia is blocked in the sandbox). The hero uses `cuhk.png` automatically.
- `public/trend-media.svg`: V2's trend poster motifs, reused in the trend scene.
- Résumé PDF: `public/yashwant-bhyri-resume.pdf` (linked from hero + research strip).

## 7. Linked real systems

- Antigravity (real product): https://antigravity-gz2r.vercel.app (local: http://localhost:3010)
  — the "Start the real interview" button in the Antigravity chapter launches a real replay.
- GitHub: https://github.com/Yashwant-Bhyri

## 8. Known environment quirks (for future agent sessions)

- The Claude preview browser runs pages **hidden**: rAF never fires (the sim engine
  has an interval watchdog; scenes run ~5× slow there, full speed in a real tab),
  IntersectionObserver only updates on rendering steps (force one with a resize),
  and smooth scrolling never completes (set `scroll-behavior:auto` before probing).
- Screenshots render black at scrollY>0 in this dev setup — hide preceding
  sections to capture a chapter at scroll 0.
- SSR/client float precision differs in the last decimal — all computed SVG
  geometry goes through the `q()` quantizer in `app/fable/live.tsx`.

## 9. What I'd do next (when you're ready)

- Mascot/guide deepening (per-chapter Spark accessories, step-aware pointing).
- Deploy a chosen version (Vercel/Cloudflare — the repo is wrangler-ready).
- Mobile-specific pass on the walkthrough stages.
