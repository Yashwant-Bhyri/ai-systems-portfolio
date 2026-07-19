# Fable Build Ledger — append-only

Purpose: resumable log of plans, decisions, changes, and verification evidence for
Fable's independent build in `/Users/yash/Documents/Resume/portfolio-fable`.
If a session dies, read this file top-to-bottom, then continue from "NEXT ACTIONS".

Read order for a cold start:
1. `/Users/yash/Documents/Resume/FABLE_V2_FORK_MEGA_PROMPT.md` (the brief — read Section 6 first)
2. `/Users/yash/Documents/Resume/PROJECT_CONTEXT_FOR_RESUME_AGENT.md` (grounded facts per project)
3. `/Users/yash/Documents/Resume/PORTFOLIO_EXPERIENCE_BLUEPRINT.md` (Codex synthesis — prior art, not ground truth)
4. This file.

---

## 2026-07-19 — Session 1 (Fable, fresh build)

### Requirements distilled (from raw user prompts, not Codex's synthesis)

1. **The site drives itself.** Sit-back guided tour — the site takes the visitor
   through everything; visitor can interrupt/resume. Most repeated requirement.
2. **Hero:** intro text typed live with backspace corrections + a neon highlight
   bar sweeping the text as it types. When done, the text block collapses to the
   left; project cards emerge from the background on the right. Page-by-page
   sections inside one experience.
3. **Keyword galaxy:** 15–20 AI keywords floating in the background, ~9–10 visible
   at any time, 1–2 shining bright at any moment, brightness +10–15% over V2, never
   overwhelming.
4. **Project index:** 5 projects, each named AND explained ("Antigravity — AI-native
   technical interviewing platform"), no empty-space-heavy boxes.
5. **Mascot:** doodle tour-guide character (ChatGPT "pet" vibe). Introduces itself,
   narrates each chapter, hands off between sections. (Blueprint says "no mascot" —
   OVERRIDDEN by the later 2026-07-18 spec which explicitly demands it.)
6. **Per-project chapters:** high-level architecture loop FIRST (graphical loop of
   cards, not text), then low-level component-by-component reveal — one box
   highlighted at a time, chronological, with a purpose-built operational graphic
   per component (Deepgram-style: the graphic depicts the mechanism) + a pilot box
   with confident, specific numbers. Metrics always live next to their mechanism.
7. **Antigravity chapter:** loop candidate → streaming STT → orchestrator (fast
   lane + background lane) → TTS → candidate, "< 1 second" as the hook. Background
   lane agents: concept, weakness, discrepancy (resume claims with pass/fail
   ticks), reasoning. Orchestrator = neural network of agent signals + visible
   reasoning box. Trajectory map = tree graphic with semantic-similarity edges.
   Report = evidence + 250+ interviews. Then mascot CTA to the REAL replay —
   never a fake room. Real app: local http://localhost:3010, deployed
   https://antigravity-gz2r.vercel.app.
8. **Filmora chapter:** prompt → orchestration → output high level; then research
   trend agent (platform cards: TikTok, Douyin, Xiaohongshu, Instagram, WeChat,
   Facebook, scrolling content, then blur → "700+ creative signals"), skill files /
   design.md / Filmora parameters, memory+recommendation (query → vectorized → DB →
   skill files light up → neural-net input/output), semantic prompt compiler
   (intent + trend context + production state converge), multi-agent orchestration,
   final product, observability. 28% API cost reduction lives inside the mechanism.
9. **MindScape chapter:** capture → perceive → fusion → retrieval → reasoning →
   validation → review, same one-box-at-a-time treatment; neural-net graphics where
   edges fire layer-to-layer. Hybrid retrieval stack: MedCPT dense, HNSW/Faiss,
   BM25, RRF, BioLinkBERT rerank, DeBERTa NLI validation, DSM-5 safety gates.
   Framed as clinician-support MVP, not production clinical software.
10. **Creative liberty (binding):** confident specific presentation numbers are
    wanted (latency, accuracy, 250+ interviews, 700+ signals, 28% cost). Don't
    hedge. Don't misrepresent what categories of system exist.
11. **Readability of every word; no dead whitespace; perfection at the low level.**
12. **This ledger** — keep appending.

### Facts pool (grounded)
- Yashwant Bhyri — Year 4 CS & AI, Chinese University of Hong Kong; 1+ yr
  internships/research; targets AI Application Engineer / AI Agent Engineer /
  AI Systems roles. GitHub: github.com/Yashwant-Bhyri. Resume PDF already at
  `public/yashwant-bhyri-resume.pdf`.
- Antigravity: dual-lane turn architecture, Deepgram STT, Cartesia→ElevenLabs TTS,
  OpenRouter multi-tier routing, Redis + in-memory fallback, resume→trajectory map,
  agents (weakness/discrepancy/reasoning/follow-up/evaluation), JSONL telemetry,
  Playwright e2e, 250+ candidates. Flagship.
- Filmora (Wondershare internship): multi-agent AIGC production graph, 700+ trend
  signals, 28% API cost reduction, orchestration latency ≈2% of end-to-end time.
- MindScape: FastAPI + Next.js, session intake, Nancy companion loop, handoffs,
  timeline; retrieval stack above.
- Logistics: Flask + MySQL + JWT roles, weather/geo risk scoring, whitelisted-intent
  AI copilot.
- Research strip: Optek TinyML audio (93%+ acc, <10 ms, 14× compression, 700 MHz
  DSP + 16 MB SoC NPU), BIRD-SQL, SLM distillation, GraphRAG, webGLR, COL-VEO.

### Decisions
- **D1 — Rebuild, don't patch.** Baseline `app/*` is Codex's rejected V2 (~10K
  lines). Both prior failures were execution-fidelity failures. New code lives in
  `app/fable/`; `app/page.tsx` repointed. Old files left in place (git history has
  the baseline; never deleted so diffing stays possible).
- **D2 — SVG/canvas operational graphics, no speculative Three.js scenes.** The
  brief's core demand is mechanism-legible graphics + verified autoplay. Codex's 3D
  repeatedly degraded into "generic mesh." Precision-animated SVG (edges firing,
  packets traveling on paths) + canvas keyword galaxy + CSS depth deliver the
  Deepgram-style clarity with verifiable behavior.
- **D3 — Director model.** A single tour director: chapter-level auto-advance
  (auto-scroll page by page) + per-chapter internal step timelines that cycle
  automatically ALWAYS (even in manual mode — "interactive means it moves itself").
  Any user scroll/keydown pauses chapter auto-advance; floating "Resume tour"
  re-engages. Every automated behavior must be watched live in a browser before
  being declared done (mega prompt §6).
- **D4 — Real Antigravity linkage.** CTA buttons link to the deployed
  https://antigravity-gz2r.vercel.app (primary) — never a rebuilt fake room.
- **D5 — Mascot** is a hand-drawn-style SVG "spark/orb with a face" character named
  Volt, fixed bottom-left, speech-bubble narration per chapter, hand-off animation
  between chapters.

### File plan
- `app/fable/fable.css` — all styles for the new experience
- `app/fable/galaxy.tsx` — canvas keyword galaxy
- `app/fable/mascot.tsx` — mascot + narration lines
- `app/fable/director.tsx` — tour state, autoplay hooks, progress rail
- `app/fable/hero.tsx` — typed intro + collapse + cards
- `app/fable/index-chapter.tsx` — project index
- `app/fable/antigravity.tsx`, `app/fable/filmora.tsx`, `app/fable/mindscape.tsx`
- `app/fable/systems.tsx` — Logistics + research strip
- `app/fable/closing.tsx` — control room / contact
- `app/fable/experience.tsx` — composition root
- `app/page.tsx` — repoint to FableExperience

### NEXT ACTIONS
1. npm install (running in background)
2. Build files per plan above
3. `npm run dev`, watch full autoplay cycle in browser, screenshot each chapter
4. Fix visibility/contrast issues found on screen (not in code)
5. git commit; append verification evidence here

### VERIFICATION — 2026-07-19 (on-screen, browser at 1400×880)

Built the full experience. Files created under `app/fable/`: director.tsx (tour
state + useStepper autoplay engine), galaxy.tsx (canvas keyword galaxy), mascot.tsx
(Volt/Ohm/Pix/Sage/Torq per-chapter guides), hero.tsx (typed intro + collapse +
cards), index-chapter.tsx, chapter-shell.tsx (one-box-at-a-time engine), svg-bits.tsx,
antigravity.tsx, filmora.tsx, mindscape.tsx, systems.tsx, closing.tsx, experience.tsx,
fable.css. `app/page.tsx` and `app/layout.tsx` repointed to the Fable experience
(old portfolio-v2.* left in place, unreferenced).

Confirmed ON SCREEN (screenshots, not code-reading — per mega prompt §6):
- HERO: typed intro types with backspace correction, neon highlight sweep on fresh
  chars, collapses left, 5 project cards emerge on the right and auto-flip one at a
  time. Keyword galaxy legibly visible behind (15–20 keywords, 1–2 flaring gold). ✓
- AUTOPLAY: verified the per-chapter stepper advances on its own (polled: "The loop"
  → "Streaming STT" after ~7.8s unattended). One component lit at a time, graphic +
  pilot swap together. ✓
- ANTIGRAVITY: 8-step rail, fast-lane/background-lane operational graphic with
  traveling packets, pilot metrics, real-replay CTA to antigravity-gz2r.vercel.app. ✓
- FILMORA (rose), MINDSCAPE (green), SYSTEMS (amber), CLOSING (control room) — all
  render with correct accent theming, mechanism graphics, and pilot metrics. ✓
- MASCOT HANDOFF: guide changes per chapter (Volt→Ohm→Pix→Sage→Torq→Volt) with
  distinct accent + accessory + narration. Pause/Resume button works (pausing the
  tour flips the bubble to "Resume the tour"). ✓
- Director auto-advances chapter-to-chapter after each chapter completes one full
  internal cycle; any wheel/touch/arrow input pauses; "Resume the tour" re-engages. ✓

Known notes / candidates for future tuning:
- Screenshot tool renders black for any scrollY>0 in this vinext/CF-worker dev setup
  (capture limitation, NOT a site bug — DOM inspection confirmed content present at
  all scroll positions). Workaround used: temporarily `display:none` preceding
  sections so the target sits at scroll 0, where capture works.
- Mobile breakpoint is 940px; the collapsed single-column layout is correct below it.
- Per-chapter dwell is ~one full step cycle (antigravity ≈57s across 8 steps). Long
  but intentional for "sit back and watch"; user can scrub via rail/scroll anytime.
  Tune stepMs in each chapter file if a faster tour is wanted.

STATUS: complete and verified. Committed to git.

---

## 2026-07-19 — Session 2 (Fable): OPERATIONAL GRAPHICS REDO

### User feedback triggering this session
The operational graphics were flagged as still being "simple flow charts / text-based
architecture maps." Requirement restated: REAL, LIVE, DYNAMIC, operation-depicting
graphics — the graphic must look like the system actually running, not a labeled
diagram of it. Work on the fork (do not restart from scratch). Fix ALL operational
graphics in this pass.

### Diagnosis of current state (commit 4cafae8)
All graphics in antigravity/filmora/mindscape/systems are built from `svg-bits.tsx`
(Node = labeled rect, Packet = dot on animateMotion path) + CSS animationDelay.
They are diagrams-with-decoration: nothing streams, counts, races, decides, or
changes state over time. This is exactly the failure the user is flagging.

### Decision D6 — Sim-clock live graphics (supersedes the visual half of D2; keeps SVG)
Every operational graphic becomes a pure function of a requestAnimationFrame sim
clock (`useSim(active)` → elapsed ms). A scripted scenario loop (6–11 s) derives ALL
visual state from t: streaming text w/ backspace revisions, live ms counters,
progress races, score count-ups, chips that fly and re-sort, gates that scan and
block, stamps that land. Benefits: pausing the tour freezes the whole scene
coherently; loops are deterministic; alternate cycles can show branch behavior
(e.g. orchestrator ASK vs ESCALATE, Cartesia→ElevenLabs fallback firing).
New shared engine: `app/fable/live.tsx` (useSim, phase/ease helpers, retype/script
typing engine, Wave, noise). `svg-bits.tsx` kept only where a plain node is still
the right call inside a live scene.

### Scene scripts (what each graphic now DEPICTS — the operation, live)
ANTIGRAVITY: 1 loop=one real turn replayed (speak→transcribe→decide→speak, live ms
counter, phase arc); 2 STT=partials mutating w/ revisions→finals committing to a
log w/ per-word confidence, live latency ticker; 3 trajectory=map builds from
résumé claims, then live answer routes along similarity-scored edges (scores count
up, winner glows, frontier expands); 4 dual-lane=real race per turn, fast lane
completes @~900 ms while background keeps filling→package into READY queue,
consumed next turn; 5 agents=4 cards processing concurrently (typing findings,
score bars), discrepancy ledger checks claims one-by-one live; 6 orchestrator=
signal pulses land w/ values, reasoning types, decision fires (ASK/ESCALATE
alternating by cycle); 7 voice-out=0.25× slow-mo waterfall of the 940 ms budget w/
cumulative counter; odd cycles show Cartesia timeout→ElevenLabs fallback actually
taking over; 8 report=report assembles from transcript moments w/ evidence link
lines, 250+ stamp.
FILMORA: 1 runtime=prompt types→agent log w/ spinners→timeline clips assemble;
2 trend=feeds genuinely scrolling per platform, harvest pulses, counter →700+;
3 skills=signal stream compiling INTO files (lines typed live, version bump, ✓);
4 memory=query embeds (bars sweep)→DB probe→hits score-count & re-sort→reco ranks;
5 compiler=token chips fly from 3 live panes into the brief, determinism check;
6 orchestration=live Gantt w/ hand-off chips, overhead slices ≈2%, running clock;
7 output=playhead scrubs timeline, trace waterfall follows, cost line draws −28%.
MINDSCAPE: 1 pipeline=session packet traverses stages (active stage works), shadow
ungrounded packet gets BLOCKED at validate; 2 perceive=3 streams on a moving shared
time axis fusing into a live state vector; 3 retrieval=dense vs BM25 race→RRF
interleave (chips physically merge)→rerank sweep re-orders→top-k; 4 reasoning=draft
sentence types, evidence chips light + lineage lines draw IN SYNC with the words;
5 validate=claims conveyor into NLI gate, scan beam, entail scores, pass/block live;
6 review=handoff rows + Nancy chat pinging, each exchange extends the timeline
sparkline. SYSTEMS/logistics=role requests pulse the API live, risk gauge reacts to
weather cycle, copilot terminal runs a whitelisted query then visibly REFUSES a
non-whitelisted one.

### Plan
1. live.tsx engine  2. antigravity graphics  3. CSS live-scene section
4. verify antigravity on screen  5. filmora  6. mindscape  7. systems
8. full on-screen verification (watch text change between polls = liveness proof)
9. commit + verification evidence below. Copy/steps/shell/director untouched.
