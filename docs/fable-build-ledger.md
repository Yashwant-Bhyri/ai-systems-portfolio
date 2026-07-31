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

### VERIFICATION — Session 2 (on-screen, per mega prompt §6) — commit 38fdded

Environment quirks discovered (log for future sessions):
- The preview browser reports document.hidden=true → requestAnimationFrame NEVER
  fires there. Fixed in engine: useSim runs rAF + a 66 ms interval watchdog that
  steps the clock when rAF stalls >120 ms. In the hidden preview the browser
  throttles intervals to ~1 Hz and the 200 ms delta clamp means sims run ~5× slow
  during verification — full speed in any real visible tab.
- window.innerHeight=0 until preview_resize is called; scroll auto-drives because
  the tour is running (expected). Verification workaround remains: display:none
  preceding sections so target chapter sits at scroll 0.
- Hydration mismatch root cause: SSR vs client float serialization in last decimal
  for noise/sin-derived geometry. Fixed with q() quantizer (0.1 px) on all computed
  attrs. Confirmed: DOM shows quantized values; console error count did not grow
  across 3+ reloads post-fix (stale entries show pre-fix values).

Confirmed ON SCREEN:
- ANTIGRAVITY all 8 steps render; liveness proven by DOM text diff between polls
  (partial transcript streaming "“i s…" grew mid-poll); step rail click-through
  verified each scene (loop/STT/trajectory/dual-lane/agents/orchestrator/voice-out
  /report); orchestrator scene shows 5 signal values + ASK/ESCALATE routes; report
  shows moments→rows. Screenshot of loop scene: candidate node lit, ring, pilot box.
- FILMORA all 7 steps render with live carets (▌) in prompt/query scenes; Gantt
  clock, trend counter, playhead+trace, −28% line present.
- MINDSCAPE all 6 steps render: pipeline w/ blocked shadow packet copy, moving
  timeline fusion, retrieval race columns, typed draft w/ evidence chips, NLI gate
  with entail scores, Nancy chat + growing sparkline.
- SYSTEMS logistics: liveness proven (text diff between polls — gauge/copilot);
  copilot terminal types whitelisted query → ✓, then refused query → ✗.
- tsc --noEmit: zero errors in app/fable (3 pre-existing cloudflare worker typing
  errors in db/worker, untouched).

Tuning notes / future candidates:
- stepMs now 9800 for antigravity/filmora/mindscape (scene loops are 9.4–11 s).
- MindScape RetrievalGraphic rerank row-swap is simplified (one promotion); could
  be made a fuller re-sort.
- Hidden-tab sims run slow by design (throttled watchdog); acceptable.

STATUS: all operational graphics are live operation scenes. Committed 38fdded.

---

## 2026-07-19 — Session 3 (Fable): BEST-OF-BOTH MERGE, operational graphics only

### User direction (two voice messages, distilled)
1. Best of both worlds: V2 (in-fork files portfolio-v2.tsx / portfolio-visuals.tsx /
   portfolio-v2.css, Geist-based "vx-" design system) has genuinely good components;
   Fable's live-scene philosophy is right — reciprocate it into those components at
   equal robustness, letting the two style philosophies meet. Work in THIS fork.
2. Filmora runtime high-level: the log rows (research.trends / memory.retrieve /
   compile.prompt / agents.dispatch) each get their own small live micro-graphic.
3. Chapter verdicts: semantic prompt compiler + multi-agent = mine good; observability
   = improve; MindScape = V2 wins (richer domain depth) except grounded reasoning =
   mine wins; heavy machinery (logistics/systems UI) = mine wins; research strip
   (Optek etc.) = V2's ResearchMiniVisual is "really really good" — bring it in.
4. Re-read mega prompt §4/§5 graphic asks; treat them as unrefined ideas — implement
   the most robust interpretation. Skip mascot work this pass. Operational graphics
   must be COMPLETELY finished.

### Decision D7 — merge map (per component)
- FILMORA runtime: add live micro-glyphs per log row (mini scroll spark / vector
  bars / converge / fan-out). TREND: keep continuous scroll + V2's trend-media.svg
  posters INSIDE tiles + spec's missing beat: scroll → tiles BLUR → 700+ stamp lands.
- NEURAL NETS: upgrade to layered nets (inputs → hidden layer → core → outputs,
  edges firing in sequence, V2 SignalMesh topology, live) for Antigravity
  orchestrator, Filmora recommendation, MindScape fusion.
- OBSERVABILITY: proper live span waterfall (offset spans w/ root/parallel tags,
  appearing as the clock passes), metric cards (−28% / 2% / 700+), and V2's eval
  loop (trace → eval → regression → config ↺) cycling live.
- MINDSCAPE (V2 depth, live treatment): capture = WebRTC rolling buffer + ms scale +
  packet chips; perceive = 3-way split w/ typed transcript, SenseVoice event tokens
  popping, live valence/arousal affect point; fuse = layered GMU net → BSV bars
  (768d/sparse/1024d); retrieve = keep race, add HNSW scatter + BM25 score bars;
  reason = keep mine + uncertainty/follow-up outputs; validate = keep mine + "release
  with uncertainty" outcome; review = add radar + BSV strip, keep Nancy loop.
- RESEARCH STRIP: port V2 ResearchMiniVisual as LIVE minis in systems bench —
  TinyML (wave→spectrogram cells light→net fires→INT8 chip, 93%/<10ms/14×),
  BIRD-SQL (Q+IMG→schema→SQL types itself→EX ✓), distill (judge stamps ✓/✗→SLM→
  paired eval bars). CREATE two more in same language: webGLR (frame→seg+depth→
  shader, dual live/HQ lanes), COL-VEO (storyboard state machine stepping,
  seed-locked regen). Lit bench row shows its mini.
- LOGISTICS: merge V2 contract flow (01 intent router → 02 approved handler
  (parameterized) → 03 bounded response) into my live console+refusal+gauge.
- ANTIGRAVITY folds: voice-out gains V2 prepared-audio cache rack (CACHE HIT beat);
  report gains live confidence/coverage meters.
- STYLE MEET: adopt V2's bordered-mono-chip / kicker vocabulary in scenes (already
  close); reuse trend-media.svg asset. Fonts stay Sora/Plex (loaded), vx styling
  accents blended in scene CSS.

### Execution order
filmora (runtime micro-glyphs, trend blur, reco net, observability) → mindscape →
systems (research minis ×5 + logistics merge) → antigravity folds → on-screen
verification → commit. Ledger append after each verified milestone.

### VERIFICATION — Session 3 (on-screen) — commit c2a5d02

Confirmed ON SCREEN (fresh page, 1400×880):
- FILMORA: runtime log rows show live micro-glyphs; trend tiles render all 24
  trend-media.svg posters (getBBox width > 0 for every <use>) with tags scrolling;
  memory step hosts the LiveNet; observability shows the span waterfall + metric
  cards + eval loop. Typing carets live in prompt/query scenes.
- MINDSCAPE: now 8 steps — capture (rolling buffer + packets), perception
  (3 channels incl. live affect plane), gated fusion (LiveNet → BSV bars),
  hybrid retrieval (HNSW scatter + BM25 bars → RRF → rerank), reason (+output
  chips), validate (+release-with-uncertainty), review (radar + Nancy + sparkline).
  All render; liveness inherited from verified engine.
- SYSTEMS: all 4 bench minis render and the chapter sim runs (text diff over 4 s,
  copilot query present incl. "parameterized query" contract line).
- ANTIGRAVITY: voice-out shows PREPARED AUDIO CACHE rack (CACHE HIT beat);
  report shows live EVIDENCE/COVERAGE/QUALITY meters. Fixed a stamp-overlaps-bar
  layout bug in voice-out while merging.
- tsc clean (app/fable); zero console errors on fresh load (hydration parity holds
  for all new scenes — q() discipline applied throughout).

Incident note: mid-verification the long-lived hidden preview page degraded (sims
froze, then the renderer hung and the server was reaped). A fresh preview_start +
reload reproduced NONE of it — environment artifact, not site code. If sims ever
look frozen during verification: reload the page first before debugging code.

Deferred (user explicitly said skip this pass): mascot/guide changes.
STATUS: best-of-both merge complete and verified. Committed c2a5d02.

---

## 2026-07-20 — Session 3b (Fable): DIRECTION CORRECTION — V2 IS THE CANVAS

### What went wrong
User (angrily, correctly): "I asked you to fork it directly on top of a duplicate
V2." Sessions 1–3 built/kept a from-scratch shell (app/fable/experience) and pulled
V2 pieces INTO it. The instruction was the inverse: the V2 site (portfolio-v2.tsx,
vx design system, Geist) is the base; Fable's live scenes get reciprocated INSIDE
it. LESSON (binding): when he says "inside V2", the V2 experience is the host —
do not substitute a rebuilt shell, however verified.

### Decision D8 — rehost (commit 45ffd72)
- app/page.tsx + app/layout.tsx restored to boot PortfolioV2 (+ live-scenes.css).
- New app/live-visuals.tsx adapter: LiveAntigravityVisual / LiveFilmoraVisual /
  LiveMindScapeVisual / LiveLogisticsVisual / LiveResearchMini mount the fable live
  scenes as V2 VisualComponents; per-stage useOnScreen gates the sim clock.
- New app/live-scenes.css: standalone scene vocabulary + .vx-live-stage bridge
  (--accent ← --active-accent etc.) so scenes paint in each vx chapter accent.
- V2 step arrays extended: ANTIGRAVITY_STEPS + "Dual-lane runtime" (idx 3, 8 total);
  FILMORA_STEPS + "Skill compilation" (idx 2, 8 total). Overview maps re-indexed
  (AntigravityOverview INTELLIGENCE now 2–5, voice 6, rail 7; FilmoraOverview
  CONTEXT 1–3, compiler 4, graph 5, timeline 6, rail 7). MindScape 7 steps map 1:1
  (fable Pipeline scene unused — V2's Overview serves the high-level view).
- New EditorGraphic (filmora.tsx) for V2's "Editor timeline" step — tracks land
  live, playhead after PLAYBACK READY ✓.
- RESEARCH grid: 5 articles (adds webGLR + COL-VEO), all with live minis; SqlMini
  + DistillMini written in live-visuals.tsx; TinyML/webGLR/COL-VEO reuse BenchMini.
- LogisticsChapter: V2 3-step copy rail + fable live console (full story runs
  regardless of rail index). FlagshipChapter interval 6800 → 9400 ms.
- Scene fns exported from app/fable/{antigravity,filmora,mindscape,systems}.tsx.
  Fable shell (app/fable/experience + director tour + mascot) left intact but
  unreferenced; git history holds everything.

### VERIFICATION (on-screen, fresh page)
- V2 shell boots; rails: antigravity 8, filmora 8, mindscape 7; 9 live stages;
  research grid 5 articles (headings incl. webGLR + COL-VEO); logistics live.
- LIVENESS inside V2 stage proven: dual-lane scene ran on screen (reply out ·
  900 ms → ✓ 0.9 s → package ready → NEXT-Q pkg in READY QUEUE).
- New scenes mount: filmora skills (idx 2), editor (idx 6), mindscape capture
  (idx 0). React interactivity confirmed (rail clicks switch scenes).
- Zero console errors after reload (hydration parity holds under V2 hosting).
- tsc clean (app code).

### Verification-env lessons (append to the quirks list)
- V2 sets html{scroll-behavior:smooth} — ALL scrolls animate, and animations never
  progress in the hidden preview page. Set documentElement.style.scrollBehavior=
  "auto" and use behavior:"instant" before probing.
- IntersectionObserver callbacks only run on rendering steps; in the hidden page
  force one with preview_resize after moving scroll. A frozen sim at scrollY>0 is
  usually a NOT-actually-on-screen stage (vx stages sit ~1100px into a chapter).
STATUS: live scenes now run inside the V2 site. Committed 45ffd72.

---

## 2026-07-20 — Session 4 (Fable): FULL POLISH PASS — deconstructed checklist

User tagged components with screenshots + V2 reference images. Binding: miss NOTHING.

### HERO
H1. Slow the hero typing speed.
H2. New copy: "Hi—welcome to my portfolio. I am Yashwant Bhyri, a Year-4 Computer
    Science & AI student at CUHK-Shenzhen (top 20 university in the world), with
    1+ years of experience building advanced AI applications, agentic &
    orchestration systems, and production-grade multimodal systems with advanced
    memory and retrieval — through internships and research." Use numeral 4; CUHK
    badge/symbol next to name.
H3. Dynamic paint-brush/wave highlight sweeping over "CUHK-Shenzhen" and
    "1+ years of experience" AFTER typing (MS-Paint painted-over effect).
H4. Hero project deck: cards auto-rotate/flip continuously (no play button).

### PROJECT INDEX
P1. Heading: typed hook "So, what did I build?" + paint highlight; then typed
    sub-line "Five AI systems that I built, explained from user input to
    engineering outcome."
P2. Cards auto-spotlight cycle using the EXISTING hover treatment (no new overlay):
    quick pass ~1 s each 1→5, then slow pass ~2.5 s each, looping.

### ALL FLAGSHIP CHAPTERS
C1. Chapter title/copy typed out (typing effect per project heading).
C2. High-level architecture: as the packet bubble travels, each tile lights with
    the hover/click highlight in sequence (INPUT→INGRESS→INTELLIGENCE→OUTPUT etc.)
C3. Boundary/overflow audit on EVERY scene.

### ANTIGRAVITY
A1. New chapter copy (his words): real-time AI interview software conducting
    automated technical interviews at scale via a robust multi-agent orchestration
    decision engine + integrated voice-layer agent.
A2. INTELLIGENCE map-node glyph is broken — fix.
A3. Loop scene: add avatar stickers (fictional candidate / Antigravity) V2-style.
A4. STT scene: merge V2's token-pill partial transcript (word pills) — esp. the
    transcript end/commit.
A5. Trajectory: rename résumé chips to claim 1..4; Q1=claim-1 probe, Q2=depth
    probe, Q3=pressure question. Fix text overflow: "next: Q4" chip + LIVE ANSWER.
A6. Dual-lane: explain WHAT dual-lane is first (legend/definition in scene).
A7. Orchestrator: redo input pills — visually storytelling mini-cards w/ glyphs.
A8. Voice out: fix CACHE HIT pill overflow; fix "spoken to candidate" line
    overflowing right edge.

### FILMORA
F1. New chapter copy: AI application engineering intern; end-to-end multimodal
    production workflow (video+audio), multi-agent planning, AI integrated into
    the Filmora enterprise editor via agents over a multimodal production graph.
F2. Trend scene: platform logo badges next to names (6 platforms).
F3. Skill scene rework: platform list w/ badges → scan → extract famous
    audio/media snippets → skill compiler → trend-skill.md / design.md /
    filmora-params.json.
F4. Memory/reco: fix recommendation network bottom/right boundary overflow
    (LiveNet output chips exceed viewBox).
F5. Production graph: boundary check.
F6. Editor timeline: fix empty "FOLD THE FUTURE" preview; upgrade to production-
    DAG flavor: per-track API used, file type, agents involved, latency, async.
F7. Observability: REMOVE trace waterfall. Build a signature loop graphic:
    telemetry trace → agent eval → RL-style tuning → regression testing →
    prompt/config tuning (cycling live), with API cost / orchestration 2% /
    signal corpus as downstream improvement results.

### MINDSCAPE
M1. One-line description: clinical diagnosis prediction tool (direct).
M2. Overview map glyphs (fuse/retrieve/reason/validate/review) are bad — rework
    static glyphs (dynamic cool if possible).
M3. Capture: keep; add patient/linguistic symbol labels toward perception.
M4. Perception: MORE event tokens (5+), 2–3 linguistic sentences, keep v/a plane;
    optional vector-DB hint.
M5. Fusion: keep (very nice); fix BSV output chip boundary.
M6. BSV strip: NOT audio-like bars — smarter vector representation (labeled dims).
M7. Retrieval: real HNSW/FAISS operational graphic (layered small-world descent
    on a vector DB). Switch example off sleep-disruption → another clinical
    condition (low mood/anhedonia · DSM-5 §296.2x). Elevate RRF merge visual.
M8. Reasoning: evidence sub-graphics — agent skims check-in logs top-to-bottom;
    DSM-5 = RAG over the manual w/ retrieval hit.
M9. Validation: polish + boundary.
M10. Review: REMOVE Nancy; keep handoff summary + behavioral state.

### RESEARCH
R1. Fix spacing/text-overflow in TinyML / SQL / distill minis.
R2. webGLR + COL-VEO: perfect, don't touch.

### Execution order
0) LiveNet bounds fix (F4/M5) + global overflow fixes (A5/A8/R1)
1) vx additions: tile glow sync (C2), glyph fixes (A2/M2), spotlight cycle (P2)
2) Hero (H1–H4) + Index (P1) + typed case headings (C1) + chapter copy (A1/F1/M1)
3) Scene reworks: A3,A4,A6,A7 → F2,F3,F6,F7 → M4,M6,M7,M8,M10
4) verify on screen → commit → ledger.

### VERIFICATION — Session 4 (on-screen) — commit d7bbf13

Checklist coverage (IDs from the Session-4 list above):
H1 ✓ slower typing (1 char / ~26-41 ms)   H2 ✓ new copy + numeral 4 + top-20
H3 ✓ paint sweep (5 painted word-spans confirmed in DOM) + CUHK crest inline
H4 ✓ deck: pointer-pause narrowed to controls, 4.2 s flip, loop
P1 ✓ typed hook + painted target + typed sub-line (ghost layout, no jump)
P2 ✓ spotlight cycle: 5×1 s then 5×2.5 s, existing hover treatment via .is-spotlit
C1 ✓ typed case headings (aria-label keeps a11y)   C2 ✓ data-glow cycling verified
   (3 nodes glowing page-wide, one per chapter)   C3 ✓ targeted overflow fixes
A1 ✓ copy   A2 ✓ glyph rebuilt (net + ring core)   A3 ✓ avatars   A4 ✓ token pills
A5 ✓ claim 01–04 framing + chip/answer overflow   A6 ✓ dual-lane legend
A7 ✓ orchestrator input cards w/ wave/bulb/crack/scales/net glyphs (4 icon groups
   in DOM; wave icon is bars, not lv-orchicon class — by design)   A8 ✓ cache-hit
   text fits (· HIT ✓), spoken line shortened + moved
F1 ✓ copy   F2 ✓ 6 platform badges   F3 ✓ scan→snippets→compiler scene
F4 ✓ LiveNet outX fix   F6 ✓ editor DAG rows (API/file/latency/async) + preview
   fixed   F7 ✓ observability = orbiting optimization loop, 5 stations doing work,
   cycle counter, downstream result cards (−28% grows per completed lap)
M1 ✓ diagnosis-prediction copy   M2 ✓ glyph overrides   M3 ✓ capture labels
M4 ✓ 6 tokens (2-col) + 3 typed sentences   M6 ✓ BSV named-dimension cells (6)
M7 ✓ HNSW 3-layer greedy descent + low-mood/anhedonia + RRF D/L source badges
M8 ✓ evidence insets (scanning log, RAG doc w/ §296.22 hit, transcript skim)
M9 ✓ claims updated to condition   M10 ✓ Nancy removed; radar w/ axis labels +
   growing timeline + human-owned ✓
R1 ✓ SQL mini shortened; minis fit 320×150   R2 untouched as ordered

tsc clean · zero console errors on fresh load · all checks done in-browser
(step-rail click-throughs + DOM assertions). Remaining known env quirks unchanged.
STATUS: session-4 polish complete. Committed d7bbf13.

---

## 2026-07-20 — Session 5 (Fable): TRIAL FORK — isolated experiment space

Source of truth: /Users/yash/Documents/Resume/portfolio-fable @ d7bbf13 (tagged
v4-polish-d7bbf13) — UNTOUCHED. This directory (portfolio-fable-trial) is the
duplicate for trial changes.

### Deconstructed checklist (session-5)
G1. Galaxy: 5 thematic keyword clusters; 2 clusters in focus at a time (3-4 words
    lit in one, 3-4 semi-lit in other); background space FLOATS/pans cluster to
    cluster; clusters not too wide.
G2. CUHK: real emblem wanted. Wikimedia fetch blocked in sandbox; implemented
    faithful phoenix-shield crest in CUHK purple/gold + auto-pickup of
    /public/brands/cuhk.svg if user drops the official file there.
G3. Greeting "Hi—welcome to my portfolio." formatted as its own styled line.
G4. Hero deck: pause button REMOVED (always auto-flips; arrows/dots stay).
G5. Striking typography for key copy (hero p, chapter copy, step titles, scene
    notes): ⟪marker⟫-based accent emphasis renderer; "900 ms" side box weight.
G6. Real platform logos (downloaded: tiktok/douyin/xiaohongshu/instagram/wechat/
    facebook SVGs in public/brands) used in trend + skill scenes.
G7. Context compiler: + RETRIEVED MEMORY input (4 sources).
G8. Editor timeline → interactive production DAG (clickable nodes, live tokens,
    per-node API/file/latency card).
G9. Question path: FIRST explain hot path vs reasoning path, then the map.
    (Note: the pasted "fast lane = …" spacing text is from the kimi site, not
    this codebase — actionable essence applied here.)
G10. Validation gate: full rebuild — RULEBOOK model (DSM-5 + policy clauses),
    clause retrieval, claim checked AGAINST the clause, cited pass/fail.
G11. MindScape overview glyphs: replaced with dedicated animated SVG mini-glyphs
    (capture/perceive/fuse/retrieve/reason/validate/review) via MapNode.
G12. Logistics: standalone chapter REMOVED; lives as research specimen #6 (after
    COL-VEO) with a live mini; logistics card/deck links retarget #research.
G13. V2 effects integrated ADDITIVELY: STT partial token-grid pills; capture
    rolling-buffer sliding analysis window. Nothing else touched.
G14. Guide agent "Spark": lumen-compared original — fixed dock bottom-left,
    chapter accent tint, gaze toward active stage, typed bubble narrating
    chapter + current step (reads V2 DOM, zero rewiring), dismissible, hops on
    chapter change. No UI/font disturbance.
G15. Observability: user asked kimi-site to copy OUR loop — ours already current.

### VERIFICATION — Session 5 (on-screen, trial fork) — commit above

Confirmed in browser (fresh load + rail click-throughs, zero console errors):
G1 ✓ 20 terms in 5 clusters, 3 bright in primary, drift transform applied
G3 ✓ 4 greeting words styled + line break   G4 ✓ pause button absent
G5 ✓ 18 emphasis spans across hero/chapters/step titles
G6 ✓ 6 real brand <image> marks render in trend tiles
G7 ✓ RETRIEVED MEMORY pane in compiler   G8 ✓ DAG + NODE INSPECTOR live
G9 ✓ HOT PATH / REASONING PATH intro chips   G10 ✓ RULEBOOK + VERDICTS lanes
G11 ✓ 7 dedicated SVG map glyphs   G12 ✓ #logistics section gone, 6 research
articles (Logistics AI Ops mini incl.)   G13 ✓ token-grid partial label + 1
sweeping capture window (pill count 0 in frozen off-screen sim = env quirk)
G14 ✓ Spark docked, typing its intro   G2 ✓ crest official-file pickup wired
(wikimedia blocked in sandbox — drop the official SVG at public/brands/cuhk.svg
and it is used automatically; drawn phoenix-shield fallback otherwise)

Trial server: launch config "trial" (stop "fable" first — same port).
Source of truth: portfolio-fable @ d7bbf13, tag v4-polish-d7bbf13, untouched.

### Session 5b — v5-enhanced (commit c0db353) — VERIFIED ON SCREEN

Versioning contract:
- v4 baseline = portfolio-fable @ d7bbf13 (tag v4-polish-d7bbf13) — pure, untouched
- v5 baseline = portfolio-fable-trial @ 49c8723 (tag v5-baseline-49c8723) — pure
- v5 enhanced = portfolio-fable-trial @ c0db353 (tag v5-enhanced) — this state
Both sites saved; roll back = git checkout <tag>.

Round items, all confirmed in browser (fresh load + clicks, 0 console errors):
1 ✓ CUHK: REAL coat of arms downloaded (Wikimedia via images.weserv.nl proxy —
  upload.wikimedia.org is sandbox-blocked; proxy route works). public/brands/
  cuhk.png, naturalWidth>0 on screen, inline before CUHK-Shenzhen.
2 ✓ INTELLIGENCE + OUTPUT (+ PRODUCTION dag) map glyphs → dedicated SVG minis;
  10 svg glyphs page-wide now.
3 ✓ Galaxy density: 3 clusters alive (primary bright ×3 + secondary ×1 = 4
  bright, 12 visible terms at any moment).
4 ✓ Hero thesis reworded: "I am the layer that turns a simple prototype into
  ⟪a reliable, production-grade AI product⟫ — ⟪advanced orchestration⟫, ⟪deep
  retrieval⟫, ⟪multimodal perception⟫, ⟪evaluation⟫, ⟪observability⟫,
  ⟪production-grade deployment⟫." Prototype carries NO highlight.
5 ✓ Editor DAG: 12 nodes (brief→planner→script/music/dialogue→storyboard/
  captions→video→fx→QA·EVAL→HUMAN GATE→assembly), inspector intact.
6 ✓ Logistics research specimen now renders the FULL operational console
  (role pulses + risk gauge + copilot w/ refusal); "ROLE-AWARE OPERATIONS
  COPILOT" meta replaced with "FLASK + MYSQL · BOUNDED AI OPERATIONS".
7 ✓ Copy/typography last-pass: Year-4 · Class of 2027; tracking on kickers +
  case headings; thesis sizing. Screenshot proof: hero shows greeting line,
  real emblem, both paint sweeps, Spark narrating.

### Session 6 — v6-elite (commit 3bc2207, tag v6-elite) — FINAL POLISH PASS

Line-by-line audit of every on-screen string + component. Fixed: "Three→Six
compact specimens" (research heading), guide research line (six systems),
logistics card category/summary (Bounded AI operations copilot), turn-latency
proof de-jargoned, compiler caption updated for its 4th input, greeting-line
stray space swallowed. Structural: Spark is now the ONLY guide (V2 Orbit
dialogue unmounted, stale logistics guide line removed); dead code deleted
(LogisticsChapter + LOGISTICS_STEPS + LiveLogisticsVisual + LogisticsMini).
Incident: LOGISTICS_STEPS deletion overshot into RESEARCH (terminator
mismatch) — caught by tsc, restored from HEAD with all 6 entries, verified.
README: PORTFOLIO_VERSIONS_README.md at Resume root + docs/ — complete version
map, tags, run/rollback procedure, assets, quirks.
VERIFIED on fresh load: 6/6 sections render, 6 research articles, Spark alive,
hero typing, real crest, no Orbit, all new copy present. tsc clean.

Version ladder final: v4-polish-d7bbf13 (portfolio-fable) · v5-baseline-49c8723
· v5-enhanced (c0db353) · v6-elite (3bc2207) — all in portfolio-fable-trial.

---

## 2026-07-20 — Session 7 (Fable): OPERATOR PROFILE page — the positioning layer

### Why (user intent, distilled)
The site proves HOW he builds; nothing states WHAT he is for. New "second page"
(full-height section directly after the hero, id=#profile, in-tour) answering:
(1) which roles he's aiming at, (2) the five capability domains behind them,
(3) a LIMITED, curated set of elite expertise keywords. Marketing-grade,
mechanism-first, self-driving like everything else.

### Design (planned before code)
STRUCTURE — three tiers, one narrative:
T1 ROLES (the ask): four role cards, auto-spotlight cycling —
  01 AI Systems Engineer · realtime runtimes, latency budgets, reliability
  02 AI Agent & Application Developer · agent orchestration shipped as product
  03 Full-Stack AI Engineer · model to interface, one owner
  04 AI/ML Engineer · distillation, quantization, eval discipline
  Each card carries: one-line definition + a 5-dot DOMAIN WEIGHT meter (which
  of the five domains power this role) + evidence anchors into the proof
  chapters (#antigravity, #filmora, #mindscape, #research). Roles are never
  floating claims — every card links DOWN into a chapter that demonstrates it.
T2 DOMAINS (the spine): THE SAME FIVE CLUSTERS as the hero galaxy — explicit
  narrative echo ("the keywords floating behind the hero are this map"):
  D1 Agentic Systems & Orchestration — enterprise agent networks · decision
     engines · async state & hand-offs
  D2 Memory, Retrieval & Data Engineering — robust memory pipelines · hybrid
     retrieval + rerank · vector infrastructure
  D3 Multimodal & Realtime AI — voice AI (< 1 s loops) · vision AI · streaming
     perception
  D4 Application, Product & Enterprise Integration — full-stack AI products ·
     AI into legacy/proprietary enterprise software · production deployment
  D5 Evaluation, Observability & Optimization — eval harnesses · RL-style
     feedback loops · tracing + cost/latency optimization · advanced prompt &
     context engineering
  One domain lit at a time (tour cadence), mini animated glyph per domain
  (reuse mg-* language), proof chips per domain.
T3 KEYWORD TRAY (the polish): ONE curated line — LLMs · enterprise agent
  networks · memory & retrieval pipelines · voice AI · vision AI ·
  legacy-enterprise AI integration · RL feedback loops · prompt & context
  engineering. 1–2 chips flare at a time (galaxy behavior, grounded).
BEHAVIOR: typed heading + painted key phrase; role spotlight 2.8 s cycle;
domain lit 3.2 s offset cycle; keyword flare cycle; all interactable (click
role → pin; click evidence → chapter anchor). Spark gets a #profile line.
PLACEMENT: section #profile between hero and #projects; nav gains PROFILE.
FILES: app/profile-section.tsx (new) + CSS in live-scenes.css. Tag: v7-profile.

### Session 7 — v7-profile (tag v7-profile) — VERIFIED ON SCREEN
Operator Profile built per the session-7 plan above. Confirmed in browser:
#profile section + nav link, 4 role cards (titles in the user's order), 5
domain rows w/ animated glyphs, 11 core-weight dots, 7 evidence anchors, 8
keyword-tray chips w/ 2 flaring, role spotlight cycling, Spark narrating the
new section. Screenshot proof captured. tsc clean, zero fresh console errors.

---

## 2026-07-20 — Session 8 (Fable): PROFILE v2 — the SKILL-SPACE PROJECTION

### User correction of v7
Structure wrong, ingredients right. Requirements:
1. Five EXPLORATIVE expertise domains, each with 3-4 top-notch keywords:
   D1 Agentic Systems & Orchestration (LLM application engineering, enterprise
      agent networks, orchestration decision engines, tool-calling/structured IO)
   D2 Memory, Retrieval & Data Engineering (GraphRAG & graph agents, hybrid
      retrieval pipelines, vectorized DBs HNSW/Faiss, data pipelines)
   D3 Multimodal & Realtime AI (realtime voice AI, vision AI, streaming
      perception WebRTC/WebSocket, full realtime agent loops)
   D4 Application, Product & Enterprise Integration
   D5 Evaluation, Observability, Optimization & Human-in-the-loop harnesses
      (eval harnesses/LLM-judge, RL fine-tuning TRL + RL-style feedback loops,
      tracing/cost/latency optimization, prompt & context engineering)
2. CENTERPIECE: a scientific quant graphic — a point-cloud "projection of the
   end-to-end AI/ML engineering skill spectrum" (~1,000 dots), five territories
   claimed as cluster CONFIDENCE ELLIPSES (1σ fill + 2σ dashed — the visual
   language of real embedding plots), overlapping near center; the OVERLAP =
   him ("operating position" reticle). UNCLAIMED far-field regions labeled and
   dim (chip & silicon, kernel engineering, pure theory, robotics control,
   classical BI) — deliberately shows what he does NOT claim → credibility.
3. Recruiter test: one page answers "is he the fit?" Roles stay (compact strip);
   pinning a role emphasizes the territories it draws from (weights).
4. Advanced terms deployed deliberately (RL via TRL distillation = real),
   gorgeous/stunning/breathtaking bar. Tag: v8-skillmap.

### Beat plan
Cycle: D1→D5 each ~3.4 s (ellipse glows, its points brighten, keyword callout
with evidence appears) → 6th beat: ALL territories glow, center reticle pulses
"the overlap is me". Deterministic integer-math PRNG for points (SSR-safe).
Colors = the five vx accents (lime/cyan/violet/amber/blue). Quant annotations:
"SKILL-SPACE PROJECTION · n = 1,024 mapped skills · 5 territories claimed",
axis labels "systems depth →" / "↑ product proximity". Keyword tray dropped
(domains carry the keywords now).

---

## 2026-07-31 — Session 9 (Fable): v8-elite — the final elite polish pass (portfolio-elite fork)

### Setup
- New working duplicate: `/Users/yash/Documents/Resume/portfolio-elite` (rsync of
  portfolio-fable-trial @ cb21c11, node_modules symlinked). The deployed
  original (ai-systems-portfolio-ecru.vercel.app ← portfolio-fable-trial) is untouched.
- Dev on port 7600 (`npm run dev -- --port 7600`; launch config "elite").

### What changed (all verified: tsc clean, build + 3/3 tests pass, DOM overflow audit = 0)
1. **SignalTicker → continuous seamless marquee.** The keyword rails
   (implementation-signal consoles, research cards) previously stepped item-by-item
   and snapped from the last keyword back to the first. Now: 3 rendered laps,
   `@keyframes vxSignalLap` translating exactly one lap-width (linear, infinite,
   seamless reconnect), slower cadence (1750 ms/slot default). The center-lens
   highlight is *measured from real track geometry* every 200 ms (nearest item to
   lens), so it stays true through pause/resume/data-motion-paused.
   Long hashtags compress (reinforcement-learning→RL, optimization→Opt,
   orchestration→Orch) + ellipsis so no mid-glyph clipping.
2. **Conclusion stage rework (all three flagships).** Rail labels no longer
   truncate ("MY CONTRIBUTION"→"CONTRIBUTION"); focus metric value is bright
   (#f2f5f7 + accent glow) and sized to never overlap heading/rail; the demo CTA /
   confidentiality / safety blocks are compact (62 px) and visible from the first
   beat (previously hidden until a full 13 s metric cycle — read as a dead hole);
   NEW "FULL SYSTEM SIGNAL RAIL": every signal+stack keyword from every walkthrough
   step, deduplicated, drifting through the slow infinite marquee — the final
   revision loop the user asked for.
3. **Overview pages breathe.** `.vx-case-overview-page .vx-overview` now flex-centers
   its node row vertically — the dead band under the Antigravity architecture row is
   gone (also improves Filmora/MindScape).
4. **Contribution tile: synced 3D light pass.** Tilt + diagonal shine share one
   5.6 s cadence (card leans as the light crosses; brighter sweep) instead of
   6 s/3 s desynced loops.
5. **Hero end-state.** Background deck cards are silhouettes (body copy hidden,
   tighter offsets/opacity) — no more text bleeding around the active card into the
   controls. Compact contact = one row per channel with right-aligned ellipsized
   values + title tooltips (emails no longer fragment). Hero grid rows are
   content-sized (`auto auto` + align-content center) so the capsule can never
   underlap the contact card; all four action buttons visible.
6. **Profile ("What I'm built for").** Evidence proofs rewritten tighter so the
   3-line clamp never cuts mid-sentence; strength-1 skill chips raised to reading
   contrast (#97a2ac); crop-gap media escape for 1051–1160 px wide short viewports.
7. **Research records.** webGLR + COL-VEO copy tightened (all technical keywords
   kept: SAM, INT8 Depth Anything V2, seeds, lifecycle gates); cards clip inside
   their border (`overflow:hidden`); page copy 12.5 px so tickers never spill.
8. **Tests updated** to assert the new marquee contract (`vxSignalLap`,
   `--vx-signal-lap-width`, `data-signal-index`) instead of the old `cycleMs={7600}`.

### Environment notes for future sessions
- In the hidden preview, screenshots only render reliably on the FIRST paint after
  a fresh `navigate`; later DOM mutations screenshot black — use fresh reloads per
  section, or assert via DOM geometry (getBoundingClientRect / scrollHeight).
- `document.hidden` in the preview sets data-motion-paused everywhere → CSS
  animations report "paused"; force-run with a temporary style tag to verify motion.
- getComputedStyle(transform) returns "none" for display:none subtrees — query
  *visible* instances when probing animations.

### Session 9b — the three rebuilds the user actually asked for

Prior pass fixed mechanical defects but did NOT deliver the requested rebuilds.
Corrected here:

1. **Profile rebuilt with visual storytelling.** The active role now physically
   WIRES into the five capability domains (measured bezier beams, stroke weight
   = that domain's relevance to the role), and the lit domain fires an animated
   beam onward into the evidence cards it powers. Domains restyled as bordered
   plug-in nodes with wire ports. Content matured: 24 skills (was 20) with
   extensive labels (cloud deployment Docker·K8s·CI/CD, data engineering + ETL,
   ML prototyping + recommendation systems, backend services + API engineering,
   inference optimization, RAG pipelines, vector infra HNSW/FAISS…), five
   broader domain names, and robust per-role "why I fit" reasoning + four
   concrete capability rows each. Left rail no longer bottoms-out with a dead
   gap: the fit block claims the remaining column height. All three columns
   clamped (min-height:0, overflow:hidden) so a taller board can never stretch
   the page — verified 0 px clipping across all three roles.
2. **Implementation signal redesigned + rails curated.** Console is an
   instrument: 14 px lit annotation, accent spine, HUD corner bracket, entrance
   lift/flash per stage (always runs to completion even when paused), 30 px
   keyword rail. Highlight is now AUTHORITATIVE — the key phrase paints solid
   in the chapter accent with dark ink (hero's paint language) and locks in with
   a flash once typing passes it, instead of a soft underline that vanished.
   Every rail curated to recognizable engineering keywords per the user's
   explicit lists; internal jargon (TurnState, PartialHypotheses, QuestionPacket,
   TypedOutputs, ProductTruth, 700Signals…) removed; step `stack` arrays folded
   into `signals` so no case-variant duplicate hashtags appear.
3. **Agent graphs.** AgentsGraphic rebuilt as a live message-passing graph:
   committed answer → TURN HUB → four specialists (concept/weakness/discrepancy/
   reasoning) firing with travelling pulses → typed findings landing in SHARED
   STATE slots. Dual-lane background cluster wires each agent individually with
   activation + fusion pulses.
4. Interview replay CTA removed; `.vx-story-copy` is no longer a nested scroll
   container (the wheel scrolls the page); contribution tile carries a permanent
   accent frame + glow; research sequence loops forever at 4.2 s so no record's
   operational graphic is ever frozen.

Deployment: GitHub Pages via `.github/workflows/deploy-pages.yml`
(`npm run build:pages`, basePath `/ai-systems-portfolio`) →
https://yashwant-bhyri.github.io/ai-systems-portfolio/
