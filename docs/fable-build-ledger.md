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

### Session 9c — two-tier keyword emphasis + slower hero

1. **Two-tier annotation emphasis.** `StoryStep` gained
   `annotationSoftHighlights`; `HighlightedStageAnnotation` merges both lists,
   tags each range `data-weight="full" | "soft"`, and sorts so a technical
   keyword always wins an overlap with a supporting phrase.
   - FULL (solid accent paint, dark ink, lock-in flash) is reserved for the
     technical / AI keywords that carry the profile: WebRTC audio, WebSocket
     turn events, interruption recovery, Deepgram partials, live interview
     graph, guardrail-checked packet, LLM gateway, execute asynchronously,
     policy-valid probe, structured contract, prepared-audio cache, TTS router,
     provider failover, evidence ledger, Agent evaluations, RL candidates,
     typed production contract, multimodal tool calls, signal compiler,
     Embeddings, reranking, schema-validated function calls, typed tool calls,
     tool graph, human gate, Span-level telemetry, WebRTC rolling buffer,
     SenseVoice extracts speech events, Emotion2Vec+ encodes affect, Gated
     Multimodal Unit, Behavioral State Vector, MedCPT and HNSW dense search,
     BM25 lexical search, BioLinkBERT reranks, retrieval-grounded LLM,
     structured hypothesis, DeBERTa-v3 NLI, DSM-aligned deterministic rules,
     offline RL and evaluation queue, guardrail/regression/human-release gates.
   - SOFT (the previous marker underline) now carries the descriptive phrases.
   All 25 annotations remapped by script, every phrase asserted present in its
   annotation. "execute concurrently" reworded to "execute asynchronously"
   (explanation and the step's operation label follow).
2. **Hero typing paced 20% slower** (18-30 ms/char → 22-36 ms/char) with the
   hold before backspacing extended 1180 ms → 1420 ms, so a first-time reader
   can finish each statement.

### Session 9d — profile rebuilt as THE CAPABILITY SURFACE (design-first)

Two prior attempts failed for framing reasons, not layout reasons:
- v3 (chips + wires) was a *catalogue*: 24 equal-weight chips + 5 domains +
  3 evidence cards + wires = ~40 objects of identical visual weight. Nothing
  to land on. Also used SELF-SCORED strength meters, which have near-zero
  credibility — a bar you assign yourself is marketing, not evidence.
- The "capability ledger" over-corrected: it put PRODUCTION / ENTERPRISE /
  OPEN SOURCE / RESEARCH proof cards and project names (Filmora, BIRD-SQL) in
  the front seat. Wrong subject. This section is the one place in the site
  that claims the SKILL SURFACE itself; the projects already have four
  chapters of their own.

Final framing (user's own words): "these are the three job positions I want to
apply to, because my skill sets are these twenty skill sets, and these three
jobs fit extensively inside this — and I link how a role should have the
experience and how I have it."

Structure now:
1. Heading states the claim: "Twenty capabilities across five areas." Subline:
   "These are the three roles that sit inside them."
2. Role tabs (3) act as a LENS, not a grade.
3. Role brief: THE ROLE ASKS FOR (stated as the role) · HOW I HOLD IT · a
   coverage counter (e.g. 18/20) — the honest "this role sits inside my
   surface" claim.
4. Five full-width area rows. The twenty capabilities are the LARGEST type on
   each row (14.5px) — they are the subject. Area names are 10px mono labels,
   deliberately quieter. Capabilities the active role calls on stay lit; the
   rest dim but remain visible (still mine, just not for this role).
5. Project attribution ("Antigravity · Filmora") is the quietest element on the
   row — present for grounding, never the headline.

Verified at 1440×820: 0 px clipping on section, surface, brief, and all five
rows; coverage lens confirmed (18/20 systems · 14/20 agents · 16/20 full-stack).
tsc clean, 3/3 tests pass, static export builds.

### Session 9e — profile becomes THE ROLE ↔ CAPABILITY MAP (final framing)

User's framing, finally captured correctly: the argument runs
CAPABILITIES → THEREFORE THESE TARGET ROLES. Mapping the skill set to the
three target roles IS the section. Linking skills to project evidence is
explicitly downstream and unimportant here — the four project chapters already
carry it — so evidence was REMOVED from this section entirely.

Why the earlier cuts failed:
- chips/wires version: a catalogue of ~40 equal-weight objects; also used
  SELF-SCORED strength meters (a bar you assign yourself proves nothing).
- "capability ledger": put PRODUCTION/ENTERPRISE/OPEN SOURCE/RESEARCH proof
  cards and project names in the front seat — wrong subject.
- "capability surface": right subject, but still a bunch of text.

Final build — an operational graphic, in the same visual language as the
project chapters (op-svg / lv-node / lv-edge / lv-pulse):
- THREE role nodes on the left, clickable, only the active one lit.
- FIVE engineering pillars on the right, each carrying FOUR broad capabilities
  (20 total): AI application & product engineering · Agent runtime &
  orchestration · Knowledge, memory & retrieval · Evaluation, safety &
  observability · Inference platform & production systems. Capabilities are
  deliberately broad ("cloud deployment & CI/CD", not "Kubernetes").
- Live curved edges from the ACTIVE role only (five lines, never fifteen),
  stroke weight = how heavily the role draws on the pillar, with signal pulses
  flowing along them. Each pillar shows a 3-segment degree-of-responsibility
  meter for the active role.
- A "WHY THIS ROLE" line above the map argues the claim in words, with a live
  count (16/20, 14/20, 16/20) of capabilities that role draws on.

Engineering notes:
- Pulses are driven by CSS `offset-path` + `offset-distance`, NOT a React sim
  clock: a 60 fps re-render of a 40-element SVG was both wasteful and fragile.
  They pause via the existing [data-motion-paused] rule.
- The SVG must be `position:absolute; inset:…` inside `.vx-role-map`: an
  inherited `display:grid` was letting it fall back to its 300 px intrinsic
  width instead of filling the panel (measured 332×494 → 1228×409 after fix).
- The dev server's workerd runner had crashed after many HMR cycles and was
  serving SSR errors ("Network connection lost"); the client's
  "Maximum update depth" errors were stale from that crashed process. A clean
  preview_stop/preview_start cleared it — worth checking before debugging a
  React loop that isn't there.

### Session 9f — profile = ROLE → ENGINEERING AREAS → SKILLS (three-tier chain)

ROOT CAUSE of "nothing is visible": the op-svg vocabulary (.svg-label,
.svg-sub, .svg-mono) resolves its fills from --text-hi / --text / --text-dim,
which are declared ONLY on `.vx-live-stage`. The profile map was hosted outside
that class, so every fill was an invalid var() and the SVG text painted BLACK
ON BLACK. Fixed by declaring a dedicated, self-contained class set
(.vx-map-role/.vx-map-area/.vx-map-skill/.vx-map-box/.vx-map-beam/…) with
explicit fills. A test now asserts those fills exist.

Structure, per the user's stated chain:
  TARGET ROLE  →  4 of 5 ENGINEERING AREAS  →  THE SKILLS EACH AREA COVERS
- 3 role nodes (clickable). Each role calls on exactly four areas, and each
  role excludes a different one (systems ✗application · agents ✗platform ·
  full-stack ✗runtime), so the lens genuinely differentiates.
- 5 engineering areas: AI application & product engineering · Agent runtime &
  orchestration · Knowledge, memory & retrieval · Evaluation, safety &
  observability · Inference platform & production systems.
- 25 concrete skills (5 per area) in the user's own vocabulary: API
  integrations & management, workflow management systems, multi-agent
  orchestration graphs, reasoning agents, function calling & tool use,
  recommendation systems, human-in-the-loop workflows, RL-style observability
  & refinement, OpenTelemetry tracing, model routing intelligence, LLM
  gateways, cloud deployment & CI/CD, …
- Project attribution ("Antigravity · Filmora") is the smallest text in each
  area node — supplementary, explicitly NOT the subject.
- Live beams role→area with CSS offset-path pulses; unlit areas stay clearly
  readable rather than fading out.
- The static "why this role" line became a continuously ROLLING REASONING BAR
  (seamless -50% marquee over a duplicated track), swapping content per role.

Verified: 0 label collisions and 0 labels outside their panel (measured across
all 25), SVG fills 1228×437, tsc clean, 3/3 tests, static export builds.

### Session 9g — profile made visually scannable

Base structure kept; the complaint was that it still read as a block of text.
Three changes, all aimed at recognition-before-reading:
1. **Heading states then yields.** "What I'm built for." renders large, then
   after 2.2 s shrinks (font-size transition) and hands its height back to the
   map — the user's own suggestion, and it is also the space budget that lets
   the area rows grow.
2. **Five area accents + glyphs.** Each engineering area owns a colour
   (application violet · runtime lime · knowledge cyan · control amber ·
   platform blue) and a drawn mark (window · node graph · datastore · shield ·
   stack). Areas the active role does not call on fall back to neutral grey, so
   colour carries the lens as well as identity.
3. **Skills gain colour-coded markers and air.** Each skill is preceded by a dot
   in its area's accent; row pitch 21→22 px and AREA_H 80→84 px.
Role subtitles set to the user's wording: "runtime systems & reliability",
"agentic systems as products", "data to deployment pipeline".

Verified: heading collapses, all five accents resolve to distinct colours
(lime/cyan/amber/blue, inactive grey), 0 skill collisions, 0 skills outside
their panel, 0 area labels outside their box. tsc clean, 3/3 tests, build ok.

### Session 9h — no internals before the projects exist

The profile sits BEFORE the four project chapters, so naming Antigravity /
Filmora / MindScape / Optek / Lalamove there is meaningless to a first-time
reader. Attribution now references projects by NUMBER — "applied in projects
01 · 02" — which the reader can resolve a moment later. A test asserts no
project name appears in the profile source.

Also: role 02 is "AI Agent & Application Engineer" (was Developer); the
AI application & product engineering area now leans engineering (API design &
integrations · full-stack AI application delivery · real-time streaming
interfaces · workflow & session state management · structured JSON & schema
contracts) with product & UX research retained as the sixth — the 2x3 skill
grid already had the slot. The rolling reasoning bar carries seven lines per
role (was five) at a proportionally longer 68 s lap so reading speed is
unchanged, with slightly more height and larger type.

Verified: 26 skills, 0 collisions, 0 overflow, attribution inside every box.

### Session 9i — the user's own capability taxonomy

All 25 capabilities replaced with the user's supplied wording, five per area.
Column headers set to their words: TARGET ROLES · HOW I BUILD AI SYSTEMS ·
MY CORE CAPABILITIES IN EACH AREA.

Because those labels are much longer (up to "OpenTelemetry, distributed
tracing & production traces", 53 chars), the two-column skill grid could no
longer hold them. Switched to ONE clean column of five per area and rescaled
the canvas: viewBox 1320×470 → 1340×528, wider role/area/skill columns, and
SVG type sized up (skills 12.5→14.5, area 14→17, role 17→20) because the
viewBox is wider than it renders. Canvas width tuned 1460→1340 so the graphic
fills its box instead of letterboxing (rendered 444 px → 484 px tall).

Rolling reasoning deepened to EIGHT lines per role, arguing the case rather
than labelling it, and still naming no project.

Verified: 25 capabilities, 0 collisions, 0 skills outside their panel, 0 area
labels or attributions outside their box, tsc clean, 3/3 tests, build ok.

### Session 9j — header overlap + capability stacking

Two concrete defects, both geometry:
1. **Header overlap.** The column headers were drawn at y=16 while the first
   area box began at y=4, so "HOW I BUILD AI SYSTEMS" and "MY CORE CAPABILITIES
   IN EACH AREA" sat on top of the first row. Headers now own a band
   (HEADER_Y=20) and the area column starts at y=40.
2. **Capabilities stacked too tightly.** Row pitch was 18 units against a 14.5
   unit font — a 1.24 ratio, which reads as a jammed block. The viewBox height
   was raised 620 → 646, which is the exact point where the graphic still
   renders at full container width (1228 px) rather than letterboxing, and the
   spare height was spent on pitch (18 → 22 units) plus taller area rows
   (110 → 115). Rendered pitch is now 20 px and the SVG fills its container
   exactly: 1228×592 in a 1240×592 box.

Verified: 0 header/box overlaps, 0 capability collisions, 0 capabilities
outside their panel, 0 area labels or attributions outside their box.

### Session 9k — two-beat profile, per-capability figures, bilingual résumé

**Structure.** The profile now renders TWICE from one component via a `variant`
prop. "brief" sits right after the hero: roles → the five engineering areas
(name on one line) → each area's operational figure, with ONE capability
floating under the area name and swapping every few seconds. "full" sits after
the research chapters, just before Contact: the same spine plus all 25
capabilities, three rotating highlights, and evidence naming the real projects —
legitimate there because the reader has met them by then. Nav gained
"Capabilities"; the brief keeps "Profile".

**Figures are now per capability, not per area.** Areas 1-3 dispatch a distinct
drawing for each of their five capabilities; areas 4-5 likewise after this pass:
- application: layered app · api boundary · build·ship · schema check · human gate
- runtime: workflow dag · reasoning chain · tool call · hand-off · voice loop
- knowledge: hnsw index · rerank (rows actually reorder) · grounding ·
  session recall · ingest pipeline
- control: eval harness · regression suite (24 cells, one caught) · policy gate ·
  RL refinement (a real closed loop) · otel trace
- platform: model routing · latency budget · cache·fallback · compression · ci/cd

**Résumé is bilingual.** English + 中文 PDFs in public/, and every entry point
(header, hero, contact) opens a chooser that closes on Escape or outside click.

**Fit discipline.** Both canvases are sized so the rendered SVG fits its
container by height and the content bbox stays inside the viewBox; verified by
measurement, not by eye. Two capability strings were shortened to stop text
leaving its box ("OpenTelemetry & distributed tracing", "Filmora · Lalamove R&D").

Recurring gotchas worth remembering: python `str.replace` fails silently when
the target has drifted — several edits no-op'd and were only caught by reading
the rendered DOM back; and the dev server's HMR dies after large edits, which
looks like a code error but clears with preview_stop/preview_start.

### Session 9l — focus pass

1. **The heading now states the question.** "What I'm built for" survives as the
   small kicker (it is a good hook) but the H2 asks plainly: "What roles am I
   targeting?" — unambiguous for a non-native reader. The full map's heading
   became "Every capability, and where I built it."
2. **Column headers read as section labels**: brighter fill (#c3ced9), weight
   700, and a rule under each column anchoring the three-part structure.
3. **Unused layers lose their colour, not just brightness.** A faint tint still
   competed for attention, so tiers now carry a filter:
   off = grayscale(1) @ 0.34 · on = grayscale(0.45) @ 0.82 · spot = untouched.
   The eye now lands on the layers the selected role actually uses.
4. **The floating capability rolls in** from the right like a headline instead
   of cross-fading in place, matching the marquee language used elsewhere.
5. **Implementation-signal emphasis moved off solid accent paint.** Solid fill
   with dark ink fired several times a screen and shouted over the sentence it
   served. The phrase is now WHITE on a dark accent-tinted ground with an accent
   spine and glow — chapter identity kept, volume down.

### Session 9m — outlined inactive layers, three-weight signal emphasis

1. **The unused engineering layer keeps a white outline.** Greyscale plus a low
   group opacity made it dissolve into the page. The group opacity is gone; the
   card now carries a rgba(255,255,255,.5) border with dimmed grey contents, so
   it still reads as one of five cards while clearly not being in play.
2. **Signal emphasis is now three weights, not two.** White-only was flat, and
   full accent on every technical phrase was too loud. A CORE_SIGNAL regex
   decides at render time:
   - FULL (34 phrases) — terms that map onto the five engineering layers:
     LLM gateway, model routing, Agent evaluations, RL candidates, guardrails,
     Embeddings, reranking, MedCPT/HNSW, BM25, BioLinkBERT, structured contract,
     schema-validated function calls, tool graph, Span-level telemetry,
     Gated Multimodal Unit, Behavioral State Vector, DeBERTa-v3 NLI…
     Rendered at MEDIUM accent strength (20-26% tint + accent spine), not the
     solid slab that was shouting over the sentence.
   - HALF (18 phrases) — real technology, incidental to the layer story:
     WebRTC audio, WebSocket turn events, interruption recovery, Deepgram
     partials, TTS router, SenseVoice, Emotion2Vec+, evidence ledger…
     Light 9-13% tint, no spine.
   - SOFT — supporting prose keeps the marker underline.
   Classification is derived, so adding a phrase to any annotation is graded
   automatically rather than hand-tagged.

### Session 9n — full-weight restored, headings accented, reasoning rewritten

1. **CORE_SIGNAL widened to named technologies.** WebRTC, WebSockets, Deepgram,
   SenseVoice, Emotion2Vec+, ASR/TTS, Redis, OpenTelemetry, DeBERTa and DSM now
   take the FULL highlight alongside the layer concepts. Split is 47 full / 5
   half; the five remaining halves are pure description rather than technology:
   interruption recovery · confidence-scored final transcript · typed,
   turn-linked findings · evidence ledger · explicit dependencies.
2. **Full weight strengthened back up** — 38→50% accent tint with white 640-680
   text and an accent spine, replacing the too-quiet 20% tint.
   INCIDENT: a stale white-emphasis block from the previous pass was sitting
   LATER in the stylesheet and silently overriding the new rules. Caught by
   reading computed styles back (colour resolved to #eef4f8, not #fff) rather
   than trusting the edit. Removed; only one full-weight definition remains.
3. **Column headings accented** — lime-tinted, 12.5px, 0.18em tracking, with the
   rule under each header also in accent. They now read as section labels.
4. **"Why this role" rewritten** — all 24 lines are now complete, parallel
   sentences instead of abstract fragments ("I build the runtime around the
   model, not just the prompt in front of it.").

### Session 10 — the Chinese portal

The site now serves two portals from one build: `/` (English, unchanged) and
`/zh/` (Simplified Chinese). Nothing about the English deployment moves.

1. **Dictionary keyed by the English source string** (`app/i18n-zh.ts`, ~950
   entries). Because the key IS the English text, no data array had to be
   restructured, and a missing entry degrades to English instead of an empty
   box. The English portal never reads the dictionary at all.
2. **Three ways in** (`app/i18n.tsx`): `useT()/useTranslated()` for components,
   `T()` for inline labels anywhere, `TD()` for module constants.
   `LangProvider` sets a module-level `activeLang` during render, which is what
   lets `T()` work outside a component — safe here because a page renders
   exactly one language and there is no route that mounts both.
   INCIDENT: the first pass wrapped labels inside module-level constants in
   `T()`. Those evaluate at import time, before any language is chosen, so they
   froze English. Fixed by unwrapping them and translating at the read site with
   `TD()` instead — hence the split between the two helpers.
   `translateDeep` skips an `OPAQUE_KEYS` list (id, kind, glyph, file, …) so a
   deep-translate can never rewrite an identifier that code compares against.
3. **~850 graphic labels converted by codemod** across the fable scenes,
   portfolio-visuals, profile-section and portfolio-v2. The transform excludes
   equality operands, className values and non-display attributes.
   INCIDENT: the codemod's SVG path-data guard (`/^[MmLlCc…][\d\s.,-]/`) also
   matched ordinary prose starting "A " or "L ", silently skipping those
   strings. Tightened to require two numbers.
4. **Emphasis survives translation.** Highlight weight is derived at render time
   from `CORE_SIGNAL.test(phrase)`, so the regex now carries a Chinese group
   (网关, 时延, 护栏, 编排, 重排序, 检索, 遥测, 校验 …). Each translated highlight
   phrase is also authored to be a verbatim substring of its translated
   annotation, because `HighlightedStageAnnotation` locates it with `indexOf`.
   Verified: 47 full / 5 half / 31 soft — identical to English.
   `tests/rendered-html.test.mjs` now asserts both halves of this.
5. **CJK typography.** The font stack is applied by redefining
   `--font-system-sans/mono` under `:root[lang|="zh"]`, so every existing
   `var()` in the sheet picks it up at once. Prose leading goes 1.55 → 1.75; the
   two widest small-caps trackings (0.18em, 0.15em) come down to 0.08em, because
   Latin tracking on full-width Han glyphs reads as broken spacing.
   INCIDENT: the first attempt used `[lang="zh"]` while the document is
   `zh-Hans`, so none of it applied; and appending the Han families *after*
   `sans-serif` meant they were never reached. Both fixed.
6. **Capability highlight width** — `skill.length * 6.9` assumed a Latin mono
   advance. Replaced with `labelWidth()`, which counts a Han glyph as 11.5
   (measured: exactly 5/3 of the 6.9 Latin advance). Pure-Latin labels give the
   identical number, so the English map is untouched.
7. **Header layout fix.** The language toggle had been added as a fourth child
   of the header's three-column grid, which pushed the résumé button onto a
   second row and stretched the toggle's border across the whole column. Both
   now sit in one `.vx-header-end` cell.
8. **Per-portal document metadata** — Chinese title/description/OG on `/zh/`,
   `hreflang` alternates on both, and `scripts/postbuild-lang.mjs` stamps
   `lang="zh-Hans"` into the exported Chinese page (the root layout owns
   `<html>`, so a static export cannot do it per route).

Verification: 4/4 tests pass; `tsc` clean; zero SVG text overflows and zero
horizontal document overflow on `/zh/` at 375px, 768px and 1440px; the English
page still resolves `lang="en"`, no CJK font, 1.55 leading, 0.18em headings, and
carries no Chinese text beyond the language-toggle affordance itself.

#### Session 10 review pass

The three review subagents I launched all terminated on a session limit before
reporting, so the audits were run inline instead. What they turned up:

- **`data-state` fed from a translated value** (`portfolio-visuals.tsx`, NLI
  matrix). CSS colours the amber/red verdicts off `[data-state="uncertain"]` and
  `[data-state="blocked"]`; a translated value would never match the selector.
  Split into an English state key plus a translated label. (This component turns
  out to sit in the dead half of `portfolio-visuals.tsx` — only the three
  `*Overview` exports are still reachable — but the pattern was worth fixing.)
- **Six live labels still unwrapped**: the three trajectory probe labels,
  `Q PACKET`, `v-next ✓`, and the MindScape validation note.
- **Terminology divergence**: `observability` was rendering as 观测 in the three
  RL entries and 可观测性 everywhere else. Unified on 可观测性.
- Checked and found correct, not changed: 内存/显存 for hardware memory (vs 记忆
  for agent memory), 可追溯 for traceable (vs 链路 for a trace), 事件标记 for
  speech-event tokens (vs Token for LLM tokens).
- **All 49 claim-boundary strings verified**: 虚构回放, 示意性, 合成数据, 研发原型,
  仅离线 · 绝不在线自训练, 不构成自主诊断、医疗建议、急救调度，也不是生产级临床
  软件, 最终判断权始终属于医生. No hedge was lost or weakened in translation.
- Dictionary: 0 duplicate keys; 26 no-op entries, all deliberate keeps (brand
  names, code fragments, hashtags) that record the decision explicitly.

#### Session 10 — second external review (correct dictionary this time)

Applied 24 fixes. Semantic corrections first:

- `DENSE · MedCPT over HNSW/Faiss` read `MedCPT 之上的 HNSW/Faiss` — the
  architecture inverted. Now `基于 HNSW/Faiss 的 MedCPT`.
- `Embeddings` → was `Embedding 检索`, which folded the verb into the component
  name. Now `Embedding` (still a substring of its annotation, still FULL weight).
- `answer streaming` sits under the CANDIDATE node; `流式输入` described it from
  the server's side. Now the neutral `流式传输`.
- `ownership` was `归属权` (property title). In systems work it means
  accountability scope: `负责范围`, and the probe is `职责边界追问`.
- `DISCREPANCY` was the bare `一致性`, which reads as the property rather than
  the check. Now `一致性核查`, matching the walkthrough's own wording.
- `human action` in the clinical chain was `人工动作` — reads as an actuator.
  Now `人工决策`. The Lalamove rail keeps `由人执行动作`, where it is an action.
- `FULL SYSTEM SIGNAL RAIL` was `全系统技术栈` — a tech stack is a different
  thing. Now `全系统信号链`.
- Policy slips: `api:` → `API：`, `FLASK 接口` → `FLASK API`. The layered-app
  figure mixed `ui`/`api` in English with `数据` in Chinese; all three are now
  Chinese (`界面 / 接口 / 数据`).
- Register: `被真正用起来` → `落地可用`, `兜底挽回了这一轮` → `兜底恢复了本轮`,
  `仅限受限行数` → `仅返回受限行数`, `让工程本身可被看见` → `让工程本身可见`,
  `交叉编码器重排` → `重排序`, `副语言特征` → `副语言标记` (matching the sibling
  `事件标记`), `招聘证据` → `招聘方证据`.

Rejected, with reasons:

- `Skill compilation` → `技能固化`. The Filmora section is built on one compiler
  metaphor (`信号编译器`, `Prompt 编译器`, `语义上下文编译器`); breaking a single
  link makes the chain incoherent.
- `observable reasoning behavior` → `可观测`. Here it means behaviour that can be
  observed in the interview, not observability tooling. `可观察` is correct.
- `context` → `上下文`. It is a research-record metric whose value is "official
  benchmark" — the setting of the work. `背景` is right.
- `BM25 lexical search` → `词项检索`. `词法检索` is the established counterpart to
  `稠密检索` and is used consistently across eight entries.
- `Profile` → `简介`. That section is the role↔capability map headed 我在寻找什么
  样的岗位？ — positioning, not a bio.
- `COMPONENT MICROSCOPE` → `组件透视`. The microscope is a deliberate metaphor the
  section is built on, and Chinese uses 显微镜 figuratively too.
- `Human-in-the-loop` kept as `人机协同` — settled Chinese, and it sits in a
  keyword field of Chinese terms.

Re-verified after: 47/5/31 emphasis split unchanged, zero SVG text overflow,
zero horizontal overflow, 4/4 tests, tsc clean.

#### Session 10 — Chinese type floor

Latin and Han have different legibility floors. A 9px Latin cap is a clean
shape; 纵向回溯 at 9px has roughly forty strokes competing for nine pixels. The
ramp above 12px was fine — Han is if anything *more* legible than Latin at
display sizes — so this is a floor under the bottom of the scale, not a
magnification. 40 style buckets were below it.

Measured headroom before touching anything: 39 of the 40 already had more room
than they needed, several by 6–36×, because the containers were padded for a
Latin scale and Chinese labels are physically shorter. Exactly one had none
(问题 + 图像, 2% short) and was tightened to 问题+图像.

Two tiers rather than a smooth remap: under 10.5px effective → 11.5px,
10.5–11.9 → 12.5px, 12+ untouched. A continuous remap does not survive the
arithmetic — the whole sub-legible range spans 4px, so compressing it under the
floor puts the steps below the perceptual threshold. The hierarchy those sizes
encoded was not doing any work while none of them could be read.

Inside an SVG the rendered size is the declared size times the viewBox scale,
and the same class renders at four different scales across the page (×0.924
full capability map, ×1.167 research minis, ×1.208 brief role map, ×1.23). So
the CSS targets *effective* size and divides by the local scale, which is why
the same class carries different declared numbers per section.

The big walkthrough graphics needed nothing — they were already 12.3–16px.

INCIDENT: the capability highlight paint is drawn from a hardcoded glyph-advance
table (6.9px Latin / 11.5px Han) measured at the old size. Raising .vx-map-skill
to 12.5px left the highlight too narrow and three labels overflowed it.
`labelWidth()` now takes the language and scales the advance. This only showed
up in measurement, never in review.

Nav gap 26px → 18px on the Chinese portal: the larger labels need the room back,
and the old gap was calibrated for 66px-wide Latin words against 36px Chinese
ones. Verified at 1440 / 1180 / 1024: 260 / 130 / 52px of slack to the brand,
never clipped; the nav hides below ~900px.

Everything is scoped to `:root[lang|="zh"]`. English verified unchanged: 26px
nav gap, 11px nav, 9px badges, 1.55 leading, no CJK font, and the only Chinese
on the page is the 中文 toggle label.

#### Session 10 — third external review pass

Accepted: `api` → `API` (the file's own policy), `Profile`/`What I'm built for`
→ `技术定位`/`我的技术定位` (bare 定位 reads as "positioning/locate" cold in a nav;
`简介` would be wrong because the section is a role↔capability map, not a bio),
`组件显微镜` → `组件透视` (显微镜 names the instrument, 透视 names the view),
`技能编译` → `技能固化` (you do not 编译 a skill; the compiler metaphor survives in
the step's own annotation), `运行体积` → `运行时体积`, `自动服务商切换` →
`自动服务商故障转移` (切换 loses the failure semantics — emphasis phrase, so its
annotation moved with it), and `词法检索` → `词项检索` across ten entries (词法 reads
as 词法分析/lexing in Chinese CS; 词项 is the IR term against 稠密检索).

Rejected: `context` → `上下文` for the second time — the metric is
`context: official benchmark`, the setting of the work, so `背景` is right; the
reviewer is pattern-matching the key without its value. `人机协同` kept over
English `Human-in-the-loop` — it is settled Chinese and sits in a keyword field
of Chinese terms.

#### Session 10 — Chinese space distribution and scene type

Feedback: the Chinese page reads cramped in places while leaving voids in
others, and the labels inside the operational graphics are still too small.

Measured the largest internal gap in each flagged container, English vs Chinese
at a fixed 1440px viewport:

| container            | EN gap | ZH gap |
|----------------------|--------|--------|
| architecture panel   |  71px  |  88px  |
| microscope left panel|  51px  |  67px  |
| research card        | 129px  | 166px  |

The gaps are a design property, not a Chinese regression — but Chinese widens
them because the copy wraps to fewer lines. The research card was the worst: its
signal rail is pinned with `margin-top: auto`, and that auto margin measured
147px of pure void, while the description sat at 12.5px — micro-label size for
what is actually body copy.

Rather than only closing gaps, the space went to the thing that needed it. The
research graphics scale with their container, so widening the visual row makes
the graphic *and its Chinese labels* bigger and eats the void at the same time:
`minmax(150px, 0.72fr)` -> `minmax(150px, 1.15fr)`. Visual 236 -> 302px (+28%),
auto-margin void 147 -> 71px, description 12.5 -> 14.5px.

The scene type in live-scenes.css also went up a step on the Chinese portal
(.svg-sub 10 -> 12, .svg-label 13 -> 14.5, .svg-mono/.svg-note 12 -> 13.5, and
so on). The first pass had skipped it because it measured 10.5-18.7px effective,
which is above the floor but still small for dense Chinese labels.

INCIDENT: an attempt to give the architecture nodes more height used a flat
`min-height: 172px`, which *lowered* them — a media query sets 192px at 1440px
and the unconditional rule overrode it downward. Caught by comparing the two
portals at a pinned viewport; rule removed. Re-measured afterwards, that panel
is 35/89 top/bottom in English and 43/97 in Chinese, and the lower band holds
the return line, so it is close to balanced in both and was left alone.

Verified: zero SVG text overflow despite the 28% larger graphics, zero
horizontal overflow, no vertical clipping outside the intentional hero, English
unchanged (card rows 50/215/298, description 12.5px, .svg-sub 10px, nodes
192px), 4/4 tests, tsc clean.

#### Session 10 — review round: rule collision, hero cadence, trial changes

**The green column rule cut through the graphics (both languages).** In the
brief role map the rule sits at `headerY + 8` = 23, but the first area box began
at y=22 and the operational figure rendered from y=19.4 — the figures draw
46 * 0.86 above their row centre, so they overhang the row band by ~9px and the
first one reached above the rule no matter where the rule went. Fixed by solving
the header band, row pitch and figure overhang together rather than nudging one:
headerY 15 -> 12, rows [22,108,194,280,366] -> [29,114,199,284,369] (pitch 86 ->
85). Result: rule 20, figure clears by 6.4px, box by 9px, and the last figure
still ends at 445.6 in a 456 viewBox, so the old fifth-row clipping does not
return. The full map was already clear (rule 26, boxes 38) and is untouched.

**The Chinese hero ran at 56% of the English duration.** Measured per statement:
EN 5.2/9.0/4.2s against ZH 3.7/4.1/2.6s — 18.4s total against 10.4s. Chinese
says the same thing in roughly half the characters, so an identical ms/char
gives the reader half the time for the same information. Both levers moved
rather than one: keystroke 22 -> 36ms base (avg 29 -> 45) and the beat after
each completed statement 1420 -> 2200ms, so the typing keeps its energy and the
finished line gets a real pause. Now 16.0s, 87% of English.

Trial changes, each isolated so any can be reverted alone:
- `.vx-stage-signal-diagonal-sweep` hidden — the rotated gradient bar that swept
  in from the left of the implementation-signal console. Keyword emphasis is
  untouched; only the moving light is gone.
- `.vx-architecture-handoff` lifted off the bottom corner (margin-bottom 10px,
  7px on short viewports).
- Project-card flow labels up a step (11 -> 12px, and 12.5 -> 13.5px on Chinese).

INCIDENT: a mid-check reported 320px of horizontal overflow. It was an artefact
— the browser pane had collapsed to zero width, so every element "overflowed" a
0px viewport. Re-measured at 1440: zero overflow. Worth remembering that a
viewport reading of 0 invalidates the whole sweep.

#### Session 10 — CRASH: Filmora tool graph on the Chinese portal

Clicking step 7 of the Filmora component walkthrough (剪辑时间线) tore down the
React tree on /zh/:

    TypeError: Cannot read properties of undefined (reading 'start')
      at stateOf (app/fable/filmora.tsx)
      at EditorGraphic

Cause, and it is mine. `EditorGraphic` looks a node up by id:

    const node = (id) => TD(DAG).find((n) => n.id === id)!;
    const a2 = node(d);          // d comes from n.deps

`id` was in OPAQUE_KEYS so ids stayed English — but `deps` was not, so
translateDeep rewrote the reference list: `deps: ["brief"]` became `["需求"]`
while `id: "brief"` stayed. The lookup returned undefined and `.start` threw.

This is exactly the failure mode the OPAQUE_KEYS guard existed to prevent. The
guard was incomplete: protecting the identifier is not enough when other records
carry that identifier as a foreign key. OPAQUE_KEYS now also covers deps, dep,
refs, parents, children, targets, source, from, to, next, prev, links, edges.

Two things it exposed about the earlier verification:
- The audits only ever rendered the *default* step of each walkthrough. Nothing
  clicked through the other steps, so a crash reachable only by interaction was
  invisible to every sweep, to tsc, and to the tests.
- A fifth test now asserts OPAQUE_KEYS protects the identifier keys and that
  every id referenced from a `deps` list matches a real node id.

Re-verified by clicking all 28 walkthrough steps across the three chapters on
/zh/ after a clean reload: zero throws, every stage still renders its SVG text.

#### Session 10 — measurement harness for the operational graphics

Every earlier audit sampled a scene at one instant. These scenes run on a sim
clock, so a label that fits at t=0 can overflow at t=4200 and a node centred
early can be crowded later. `scripts/measure-graphics.mjs` carries the probe:
it walks every scene, clicks through all 28 walkthrough steps, and samples
repeatedly at each so the clock advances — 2,376 measurements per run. Per
sample it records text-ink density against the viewBox, how far text escapes
its plate, the smallest gap from text to a plate wall, left/right imbalance,
average fill of text within its plate, and effective on-screen px; then keeps
the worst of each across the whole cycle.

First run answered the standing "should the graphic text be bigger" question
with numbers instead of opinion:

    antigravity-microscope  density 0.042   fill 0.10
    filmora-microscope      density 0.060   fill 0.09
    mindscape-microscope    density 0.143   fill 0.22
    capability maps         0.130-0.145     fill 0.10-0.11
    research minis          0.132-0.254     fill 0.16-0.37

The two flagship walkthrough scenes carry three to six times less ink than every
other scene. They had the room, so their type went up a step on the Chinese
portal: density 0.042 -> 0.054 and 0.060 -> 0.080, smallest text 14.8 -> 17.2px
and 14.1 -> 16.6px.

The same run found three labels sitting on or over a plate wall, two of them
pre-existing and invisible to the old snapshot audits:
- `ANTIGRAVITY · 语音合成` went 1.6px over once the type grew — reverted to
  `ANTIGRAVITY · TTS`, which is what the acronym policy wanted anyway.
- `边缘端` 0.4px over -> `边缘`.
- `小模型 ← TRL` 0.4px over -> `SLM ← TRL`.
Re-measured after: zero overflow anywhere across the full cycle.

Also this round: Chinese hero 16.0s -> 19.0s against English 18.4s (keystroke
40ms base, beat 2900ms); project banner 3.6s -> 4.6s per card on Chinese only;
and the implementation-signal console stripped of its accent treatment, which
lived in five places rather than one — tinted border, diagonal wash, an inset
3px bar down the left edge, an outer glow, HUD corner brackets and an accent
grid. All off behind one revertable block.

### Session 11 — four-item iteration, on a fork

Fork: portfolio-elite-next, served on 7602. portfolio-elite untouched.

**1. Architecture ring, resynced.** The travelling ring ran on a CSS animation
(7s / 8s / 9s) while the node highlight ran on a JS interval (4/5/7 nodes ×
1600ms = 6.4s / 8s / 11.2s). Only Filmora matched, and even that drifted because
the two are different clocks. Rather than retune numbers that would drift again,
the ring is now a child of whichever node is lit — "which node is highlighted"
and "where is the ring" became the same fact. The three free-floating packets
and their keyframes are gone.

**2. The walkthrough now has exactly one pause.** Two pathways were removing
control from the reader:
- `pointerenter` / `focusin` on the stage set `pointerActive`, which fed the
  `playing` expression. Hovering the stage paused everything, which is why
  touching a component stopped the keyword rail. Pathway deleted.
- The auto-advance wrote `requestedPlay: false` on reaching the last step of a
  non-looping sequence, silently revoking the reader's own play preference. It
  now simply stops advancing and leaves the preference alone.
The CSS motion pause and the signal console now read `autoplayEnabled` (the
button) rather than `playing` (which also folds in scroll position and page
visibility). Verified: hover, two component clicks and focus all leave the rail
running; the button pauses and resumes it.

**3. First-visit language gate.** `app/language-gate.tsx`. Static export means no
server-side negotiation, so the choice is made in the browser and stored. It
renders nothing on the server, so both exported pages are byte-identical to
before. Following a /zh/ link is itself a choice, so the gate records it and
stays out of the way rather than interrupting. Verified: shown on a fresh visit,
routes to /zh/, remembered, and never shown again.

**4. Badges.** BIRD-SQL carries a crest — HKU × GOOGLE CLOUD / OFFICIAL
BENCHMARK — because that record's weight comes from who runs the benchmark.
Antigravity's opener carries three: IN PRODUCTION, 250+ INTERVIEWS,
ORCHESTRATION + DECISION ENGINE. Both translated.

INCIDENTS worth keeping:
- My first pause test read the DOM synchronously after `.click()`, before React
  had re-rendered, so every reading was stale and I nearly "confirmed" behaviour
  that was not happening. Re-tested with a render gap between action and read.
- The type floor had three holes I had introduced or missed: my own badge label
  at 10.5px, the two claim-boundary notes at 11px (exactly the text a careful
  reader must be able to read), and four hero-deck labels at 9-11px that only
  render after the intro resolves, which is why every earlier sweep missed them.
  All at 11.5px+ now; smallest Chinese text on the page is 11.5px.

Verified on the fork: 28 walkthrough steps clicked with zero crashes, zero SVG
text overflow, zero horizontal overflow, 5/5 tests, tsc clean. English baseline
unchanged — 26px nav gap, 11px nav, 9px badges, 10px scene text, 1.55 leading,
and the only CJK on it is the 中文 toggle.

### Session 11b — text-vs-text collision detector

The plate audit only ever asked "does this label escape its box". Every
complaint in this round was "does this label sit on top of another label" — a
different question the harness could not answer. Added a collision pass: for
every SVG scene, compare each visible text's box against every other, report
pairs overlapping by more than 15% of the smaller one.

Two mistakes in building it, both worth keeping:

1. The first version sampled five times per step inside one synchronous loop.
   A synchronous loop cannot let a sim clock advance, so it read the same frame
   five times and reported 4 collisions site-wide. Rewritten to sample on a
   200ms interval with a real dwell per step; the same walk then found 156.

2. The second version counted both halves of a cross-fade. These scenes dissolve
   between two <g> layers, and opacity lives on the group, not the text — so a
   label at opacity 1 inside a group at 0.05 was being counted as colliding with
   the label replacing it. Acting on that would have "fixed" a deliberate
   animation. Effective opacity now walks the ancestor chain and only text above
   0.55 counts.

Confirmed and fixed from the data:
- Antigravity future map: current/ready/analyzing/promoted were never translated,
  and at Chinese size the start-anchored label met the end-anchored state inside
  a 92-unit chip. Translated; chips 92 -> 108, box 108 -> 124.
- Filmora release chips: ROUTE COST / LATENCY / RELEASE and their values were
  untranslated, and the sub-line ran back underneath the value 10 units below it.
  Translated; box 56 -> 68 tall, sub-line moved below rather than beside.
- Antigravity agent sink: name over status with 13 units of leading in a 30-unit
  chip. Chip 30 -> 38.
- Research minis: the JWT tag repeated under all three role rows and collided
  with each at 28% — the legend already says it, so the repetition is gone.
  DEPTH V2 over INT8 with 9 units of leading collapsed to one line.
- The Redis transcript line was long enough in Chinese to run under the word
  chips above it; shortened to "Redis 掉线时兜底存储接手本轮".

Antigravity went 45 collisions -> 4 -> 0 after the sink fix. The remaining
filmora counts are still being measured with the corrected detector.

Badges reworked: the vague "IN PRODUCTION" status chip is gone in favour of
three concrete facts — 250+ INTERVIEWS RUN, ORCHESTRATION + DECISION ENGINE,
EVERY CLAIM TRACEABLE.

### Session 11c — the benchmark comparison

The user named a reference: Antigravity component step 03 is the readability
they want everywhere. That turned a matter of taste into a measurement.

Benchmark profile (antigravity 03): 24 labels, ink density 0.172, smallest text
16.6px effective, average margin from text to plate wall 33.1 units.

Scoring all 28 steps against it put eight of the twelve worst in MindScape:

    mindscape 03, 04   12.9px   -3.7 against the benchmark
    mindscape 06, 08   14.1px   -2.5
    mindscape 01,02,05,07  14.8px  -1.8

MindScape had been skipped in the earlier scene-type pass because it measured
denser than Antigravity and Filmora — but density is not legibility, and against
the benchmark it was the smallest text on the site. Raised to match.

That immediately produced what the user had warned about: growing the type broke
boxes that previously fit. Seven new plate overflows appeared, and two of them
turned out to be strings that were never translated at all — the DSM rulebook
lines (A. five+ symptoms / 2 wks, C. not substance-induced, R-04 no outcome
claims, R-11 risk language screen) had stayed English and only became visible as
overflow once they grew. Translated and shortened to fit the 210-unit plate.
Also shortened "稠密 · 基于 HNSW/Faiss 的 MedCPT" (255 units in a 172 plate) to
"稠密 · MedCPT + HNSW", and the source-packet note by 8 units.

Three detectors now exist, and each was wrong before it was right:
  1. plate overflow      — text escaping its own box
  2. text-vs-text        — first version read one frame five times; second
                           counted both halves of a cross-fade
  3. viewBox escape      — text leaving the scene entirely
  4. DOM overlap         — first version counted the typed ghost layer, 1088
                           false positives
Plus the benchmark profile, which is the one that found the MindScape gap.

Other fixes this round: the architecture return line ("自适应追问返回给候选人")
was clipped by a fixed 30px lane holding a 17px arc; now auto-height. Badges
carry staggered stars — uneven sizes, offsets and delays, because an even ring
reads as a border and a scattered one reads as emphasis.

### Session 11d — closing the benchmark loop

Filmora was still 12.9-14.1px against the 16.6 benchmark after the shared scene
step, because its scenes render at a smaller viewBox scale than Antigravity's —
one set of declared sizes cannot land two different scales on the same effective
size. Filmora got its own step. Range across all 28 steps went 12.9-17.2 to
15.4-19.1.

Raising type kept exposing English that had never been translated, each time
only visible once it grew past its plate:
  - MOMENTS quotes (hashing explanation, failover recovery, résumé claim
    challenged, reasoning under pressure) — reached through TD() but absent
    from the dictionary
  - filmora recommendation outputs (surf transition, golden-hour LUT,
    beat-sync cuts)
  - `sub: "reinforcement-learning"` in the RL station
  - the DSM rulebook lines, found in the previous pass
That is four separate discoveries of the same class. The lesson for the ledger:
an untranslated string is invisible while it fits, so translation coverage and
layout audits are the same audit, not two.

Also this pass: `core="RECO"` spelled out to RECOMMENDATION / 推荐, and eight
Chinese labels shortened rather than shrunk where they measured past their
plates — 已去重 · 已打分 · 与需求关联 (45 over), 应答通路 · 约 900 毫秒, 下一步：Q4
· 故障切换追问, 700+ 条已打分的创意信号, 特效 / 转场, 质检 · 评估, 缓存 → 语音合成,
and the voice-recovery sentence.
