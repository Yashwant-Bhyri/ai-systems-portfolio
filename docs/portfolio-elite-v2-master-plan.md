# Portfolio Elite V2 — Master Plan, Requirements Ledger, and Progress Log

Status: implementation in progress on a new V2 surface  
Owner: Yashwant Bhyri  
Working site: `/Users/yash/Documents/Resume/portfolio`  
Frozen rollback baseline: `/Users/yash/Documents/Resume/portfolio-baselines/2026-07-18-baseline-v1`  
Baseline date: 2026-07-18  

This is the persistent source of truth for the next portfolio iteration. It is intentionally detailed enough that work can resume after interruption without reinterpreting the original prompt.

---

## 0. Working contract

1. Never replace or mutate the frozen baseline.
2. Treat the current `portfolio` directory as the V2 working copy.
3. Update this document at the end of every implementation phase with decisions, completed work, verification, blockers, and next action.
4. Use confirmed résumé and project results confidently. Do not present invented precision as a measured result; unverified telemetry must be qualitative or unmistakably illustrative.
5. Do not call a component complete until desktop, tablet, mobile, keyboard, reduced-motion, and copy-readability checks pass.
6. Finish one subsection to its acceptance gate before moving to the next.
7. Preserve the strongest current ideas: dark technical identity, project deck, five-project index, project deep links, real Antigravity replay, and evidence-oriented writing.
8. Replace any visual that merely decorates a technical term. Every deep-dive visual must show input, transformation, and output.

### Baseline integrity

The baseline was copied without `.git`, `node_modules`, `.next`, `.open-next`, `dist`, or `coverage`. A checksum dry run reported no differences immediately after creation.

Key baseline SHA-256 values:

- `app/portfolio-experience.tsx`: `a8e66d89cb3afe8ef43f61e96027193c1d940453e7fc4c80e16c9e66903bb79d`
- `app/experience.css`: `dd1915f3ffe2c0e814b85dd25a81eb376e7d4a4277163c2cbfd37fd7589f3f20`
- `app/page.tsx`: `7f66950e92e97324e7adbc6c00b08464e2a1db4075c5fdbaf555e49ca911a304`
- `app/layout.tsx`: `d942ee4520bfb2e6ce5ff730fcee1df67ab9453ee1b76e892f41b5edc0c5da57`
- `tests/rendered-html.test.mjs`: `db113ba84e0bcd065d460ce66cf9456b6c81a5377e12b4f8252ef6b1007203f8`
- résumé PDF: `b7fbfa081493947e67de65191c8e19425422d805d9757e8b548982a6854b0f72`

---

## 1. North-star outcome

The portfolio must work as two experiences at once:

1. A recruiter can identify Yashwant's positioning, three flagship systems, strongest evidence, and real demo within 60–90 seconds.
2. A technical reviewer can inspect the architecture of each flagship without leaving the page.

Every project must answer, in this order:

1. What is the product in plain language?
2. Who uses it and what problem does it solve?
3. What did Yashwant personally build?
4. What enters the system?
5. How does the complete system work?
6. What happens inside each component?
7. Why was it engineered that way?
8. What exits the system?
9. What proof exists?
10. Which capabilities are deployed, implemented, prototype, designed, or target?
11. Where can the reviewer see the real artifact?

Central rule:

> Every branded or internal term must first become understandable in plain language, and every subsystem must be demonstrated through an accurate operational visual rather than merely described in a text box.

---

## 2. Complete prompt signal inventory

### Process requirements

- Deconstruct the full prompt before changing UI.
- Resolve overlaps and contradictions rather than silently choosing the most impressive wording.
- Plan globally, then finish each subsection to the final tile before starting the next.
- Research page transitions, spacing, card packing, borders, motion, technical graphics, and mascot behavior.
- Maintain a resumable log.
- Preserve a safe baseline.
- Complete the V2 iteration end to end rather than stopping at high-level polish.

### Global experience requirements

- The site remains one continuous portfolio but feels like distinct chapters.
- Transitions should orient the visitor; they must not hijack the wheel or trap scrolling.
- Each flagship begins with a high-level system map, followed by a low-level chronological microscope.
- Exactly one component is active at a time.
- The full system remains spatially understandable while the active component expands.
- Every component gets purpose-built graphics and readable supporting text.
- Automatic guidance must let a visitor sit back, but pause, previous, next, scrub, skip, and reduced-motion must remain available.
- Empty space must be intentional, not caused by fixed-height cards with insufficient content.
- All important labels must be readable at normal zoom.

### Hero requirements

- Intro begins centered, not in the final split layout.
- The complete professional introduction types quickly.
- A soft neon phrase highlight follows the typed text.
- When complete, the intro moves to the left.
- The project deck emerges from depth on the right only after typing completes.
- The deck continues cycling.
- Background AI keywords float like a restrained star field.
- More role-relevant keywords are required.
- Only one or two keywords should brighten at a time.
- General keyword visibility should rise around 10–15% relative to the baseline without competing with the foreground.

### Project index requirements

- Preserve the existing clickable five-project concept.
- Replace ambiguous project-first hierarchy with plain-language category-first hierarchy.
- Replace “Choose a system—or let each one explain itself as you scroll” with literal recruiter-facing wording.
- A visitor unfamiliar with the résumé must understand every card without decoding Antigravity, MindScape, or internal names.

### Mascot requirements

- Use an original interactive doodle/character, not an emoji.
- It introduces the portfolio, provides optional guidance, bridges chapters, summarizes each deep dive, and points to relevant actions.
- It never blocks text or becomes the only source of information.
- It must be dismissible, minimizable, keyboard accessible, touch accessible, and silent by default.

### Antigravity requirements

- Lead with “AI-native technical interviewing platform,” then the Antigravity name.
- Establish the complete candidate → voice bridge → orchestration → voice response → candidate loop.
- Explain “foreground question path” before the internal term “fast lane.”
- Show streaming STT as a live capability, with Deepgram as implementation detail.
- Show partial transcripts becoming final transcript state.
- Show a trajectory-map tree and how one prepared question becomes selected.
- Give concept, weakness, discrepancy, and reasoning-behavior agents distinct graphics.
- Show those agents running in parallel.
- Show their structured findings converging into a decision switchboard.
- Show the selected next question returning to the foreground path.
- Show prepared/cached TTS honestly; do not depict streaming generation unless verified.
- Finish with the real evidence-backed recruiter report and verified product impact.
- CTA copy must be “Start the real interview,” not “room.”

### Filmora requirements

- Lead with a plain-language multimodal AI video-production framing.
- Show creative brief → orchestration → editor-ready output at high level.
- Show six platform streams: TikTok, Douyin, Xiaohongshu, Instagram, WeChat, and Facebook.
- Use multiple representative media thumbnails per platform and animate the streams.
- After scanning, blur media while extracted signals remain sharp.
- Branch output into skill files, `design.md`, context/parameter artifacts, and Filmora-ready parameters, subject to factual verification.
- Replace the current weak memory/recommendation graphic.
- Show query vectorization, retrieval, ranked artifacts, recommendation, and output.
- Use a learned-network visual only if the recommendation system is genuinely learned; otherwise use a ranking lattice.
- Show user intent, trend context, and production state compiling into schema-bound instructions.
- Show the actual multimodal production DAG, human approval/checkpoints, editor timeline, and observability waterfall.

### MindScape requirements

- Apply the same high-level/low-level grammar.
- Cover capture, perception, fusion, retrieval, reasoning, validation, and clinician review.
- Use technically appropriate graphics: rolling buffer, event timeline, affect plane, gated fusion, HNSW/BM25 retrieval, rank fusion, evidence workspace, NLI/rule gates, and clinician interface where truthful.
- Keep implemented, prototype, architecture, and target layers visually and verbally distinct.
- State that it is decision support using synthetic data, not diagnosis or medical advice.

### Supporting work requirements

- Logistics and Research remain part of the five-project narrative.
- They require clearer names, improved density, consistent navigation, and truthful maturity.
- The three named flagships receive the full cinematic microscope in V2.
- Logistics receives a verified compact architecture dossier unless a later scope decision expands it.
- Research uses a method/evaluation grammar, not a fake product-orchestration graphic.

---

## 3. Baseline audit: what is strong and what fails the new bar

### Preserve

- Strong dark technical identity.
- Clear lime/violet/cyan project differentiation.
- Useful project deep links.
- Five-project deck and index.
- Real Antigravity replay integration.
- Honest “decision support, not diagnosis” and “human-owned hiring” boundaries.
- Existing auto-pause when a scene is offscreen or the tab is hidden.
- Existing reduced-motion hook.

### Reject or redesign

1. The hero starts in its final split state instead of staging the centered introduction first.
2. The intentional `portfoloi` typo is a gimmick and conflicts with “perfection to the core.”
3. The typed content omits the full recruiter positioning.
4. Background keywords all animate concurrently; there is no controlled visibility or highlight budget.
5. Project cards visually prioritize the unfamiliar brand name over the understandable product category.
6. Architecture scenes change on timers while a reader may still be reading.
7. Many essential labels are only 6.5–10px.
8. Mobile diagrams are 780–820px desktop canvases scaled to about 0.48 and cropped. This cannot pass readability.
9. Hero carousel dots do not provide a 44px touch target.
10. Overlapping inactive hero cards need to become inert and leave the accessibility tree.
11. The same generic “full architecture with one glowing box” treatment is being reused without enough component-specific internal behavior.
12. No mascot/guide exists.
13. MindScape portfolio copy currently communicates a designed seven-layer architecture more strongly than the local repository’s MVP maturity truth.
14. Filmora trend streams lack real/representative media, retrieval mechanics, and recommendation behavior.

Baseline geometry at 1280×720:

- Hero: 720px.
- Project index: 1068px.
- Antigravity: 1626px.
- Filmora: 1521px.
- MindScape: 1459px.
- Logistics: 818px.
- Research: 1047px.
- Total document: 8371px.

The V2 goal is not simply “less height.” It is more information value per viewport and clearer pacing.

---

## 4. Experience architecture

### Chapter model

1. Hero / identity boot sequence.
2. Five-system recruiter index.
3. Antigravity introduction.
4. Antigravity high-level system loop.
5. Antigravity low-level component microscope.
6. Antigravity evidence/report/real-demo handoff.
7. Filmora introduction.
8. Filmora high-level production loop.
9. Filmora low-level component microscope.
10. Filmora outcome/observability handoff.
11. MindScape introduction.
12. MindScape high-level evidence loop.
13. MindScape low-level component microscope.
14. MindScape safety/review handoff.
15. Logistics compact dossier.
16. Applied research and edge inference record.
17. Education, focus, résumé, GitHub, and contact close.

### Scrolling behavior

- Native scrolling always remains authoritative.
- Use `scroll-snap-type: y proximity` only on desktop viewports at least 1024px wide and 720px tall.
- Snap only chapter openings/endings, never every low-level beat.
- Disable snapping on mobile, short laptop viewports, and reduced-motion mode.
- Never intercept wheel, touch, Page Down, Space, Home, or End.
- Set `scroll-padding-top` and every anchor’s `scroll-margin-top` to the fixed header plus 16px.
- Use sticky visual canvases with normal-flow narrative beats for deep dives.
- Intersection Observer changes the active component only after one beat clearly dominates.
- Optional “Play walkthrough” may advance stages automatically; user input pauses it immediately.

### Two review depths

- Recruiter tour: system map + strongest four to six beats + outcome, roughly 45–60 seconds per flagship.
- Technical deep dive: every component, roughly 90–150 seconds, manually inspectable.
- Each flagship includes “Skip to outcome” and “Inspect every component.”

### Persistent viewport anatomy

- Top 10–12%: project identity, maturity, progress, play/pause, and stage count.
- Left 30–34%: plain-language narration, technical facts, status, and engineering takeaway.
- Right 66–70%: the active operational graphic.
- Lower edge: a persistent miniature system map.
- Paragraphs never sit inside the architecture canvas.

---

## 5. Readability and density system

### Typography minimums

- Hero title: `clamp(52px, 5.4vw, 76px)` desktop; 38–52px mobile.
- Section title: 48–68px desktop; 34–46px mobile.
- Stage title: 28–38px desktop; 24–30px mobile.
- Body: 16–18px desktop; minimum 15px mobile.
- Card body: minimum 15px.
- Technical labels: 12–14px; never below 11px.
- Metadata may use 11px only if nonessential and high contrast.
- Body measure: 55–68 characters; never over 75.

### Spacing tokens

- Base unit: 4px.
- Internal gaps: 8, 12, 16, 24, and 32px.
- Card padding: 24–28px desktop; 20px mobile.
- Card gaps: 16–20px.
- Section padding: 104–128px desktop; 72–88px tablet; 56–72px mobile.
- Heading to summary: 20–28px.
- Section introduction to visual: 48–64px.

### Surface rules

- One strong border maximum per card.
- One soft ambient tint maximum.
- One active accent maximum.
- Hover translation around 2px.
- Never use fixed card height to manufacture prestige.
- Every flagship card contains identity, mechanism, proof/maturity, and action.
- If content is short, card height shrinks.
- Inactive geometry can dim to 20–30%, but inactive labels stay 55–65% and retain 4.5:1 contrast.
- No essential meaning depends only on color.

### Mobile rule

Never scale a desktop diagram down. Mobile receives a separate composition:

1. Mini-map.
2. Active graphic at native mobile width.
3. Explanation and facts.
4. 44px stage controls.

---

## 6. Hero implementation specification

### Canonical copy draft

> Welcome to my portfolio.  
> I’m Yashwant Bhyri—a final-year CSE student at CUHK-Shenzhen with 1+ years building AI applications, agent runtimes, and multimodal systems.

“Final-year” remains a copy gate until confirmed. The date range 2023–2027 and current date support “entering final year” or “fourth-year,” but the final wording must be explicit.

### State sequence

| State | Target time | Behavior |
|---|---:|---|
| `boot` | 0–180ms | Low-energy galaxy, no competing foreground motion |
| `typing` | 180–2900ms | Centered 8-column intro types at roughly 13–16ms/character |
| `resolve` | 2900–3350ms | Last highlight settles and the completed statement holds |
| `split` | 3350–4150ms | Copy moves into left 5 columns; deck enters right 7 columns |
| `ready` | 4150ms onward | Actions, deck cycling, and optional guide invitation become available |

Any navigation, wheel, touch, Enter, Page Down, or Skip action resolves immediately to `ready`. Returning in the same session starts in `ready`. Final content must already exist in the DOM; the typing is visual presentation only.

### Phrase highlight

- Highlight the current phrase rather than imitating opaque browser selection.
- Lag typed text by 80–110ms.
- Hold phrase highlight 220–320ms.
- Lime at 18–24% opacity behind white text.
- Prioritize name, university, `1+ years`, AI applications, agent runtimes, and multimodal systems.
- Never invert text or reduce contrast.

### Split and deck entrance

- Container maximum 1280px, 12-column grid.
- Copy 5 columns, approximately 520px readable width.
- Deck 7 columns, minimum 520px.
- Gutter 48–72px.
- Cards enter from `opacity: 0`, `scale: .94`, `translateY(24px)`, and `blur(6px)`.
- Resolve over roughly 620ms with the primary emphasized easing.
- Stagger visible layers by 90ms.
- Keep rotation below one degree.
- Only active-card text remains fully visible.
- Auto-advance every 4.8–5.2 seconds.
- Hover, focus, manual selection, hidden tab, reduced motion, and reading interaction pause cycling.
- Manual selection suspends cycling at least 12 seconds.
- Only the active overlapping card is interactive and announced.
- Dots get 44px hit areas even when the visible line is smaller.

### Hero acceptance

- Full recruiter positioning visible by 4.2 seconds.
- Intro can be skipped without layout jump.
- Layout shift remains under 0.05.
- All actions remain usable throughout.
- 1280×720 and 390×844 pass without clipping.
- Reduced-motion renders the final split immediately.

---

## 7. Keyword galaxy specification

### Role anchors

- AI Agent Engineer.
- AI Application Engineer.
- AI Systems Engineer.

### Supporting pool

Orchestration, multimodal AI, retrieval, evaluation, observability, semantic search, speech AI, memory, tool calling, model serving, guardrails, data pipelines, TinyML, agent evaluation, embeddings, state machines, structured outputs, ranking, RAG, prompt compilation, human review, tracing, vision, audio intelligence, inference, and deployment.

### Visibility budget

- Desktop: 9–12 visible from 24–30 terms.
- Mobile: 4–6 visible.
- Base opacity 0.16–0.24.
- Active opacity 0.52–0.68.
- Exactly one or two active terms.
- Highlight cadence 2.2–2.8 seconds.
- Fade 500–650ms, hold 900–1300ms, fade 500–650ms.
- Drift only 8–18px over 20–38 seconds.
- Pointer parallax 2–8px maximum, disabled for coarse pointers.
- Scroll depth 12–28px maximum.
- Maintain a foreground exclusion mask behind hero copy and actions.
- Synchronize key term highlights with typed phrases where useful.
- Pause all ambient motion when the page is hidden.

---

## 8. Project index specification

### Heading

> Five AI systems, explained from user input to deployed outcome.

Supporting line:

> Choose a project, or keep scrolling for a guided architecture walkthrough.

### Card hierarchy

1. Project number, brand, and maturity.
2. Large plain-language product category.
3. One-sentence input-to-outcome mechanism.
4. Two or three verified proof/status points.
5. Explicit “Explore” action.

### Naming

| Brand | Primary card title |
|---|---|
| Antigravity | AI-native technical interviewing platform |
| Filmora Agent Runtime | Multimodal AI video-production runtime |
| MindScape | Multimodal clinical decision-support prototype |
| Logistics AI Ops | Role-aware logistics operations copilot |
| Research & Systems | Applied AI research and edge inference |

### Grid

- Three flagships: equal four-column cards around 320–350px, with real information density.
- Two supporting cards: equal six-column horizontal cards around 220–260px.
- Tablet: two columns.
- Mobile: one column.
- MindScape must not appear visually secondary solely because of grid placement.

---

## 9. Mascot system

### Direction

Use one original guide with project-specific modes rather than unrelated characters. Working name: **Orbit**.

Visual concept: three connected luminous nodes inside a flexible ring. It changes accent and small internal features by project:

- Neutral: orbit ring and guide eye.
- Antigravity: waveform visor.
- Filmora: director lens/slate notch.
- MindScape: evidence halo.

This can be built from CSS/canvas primitives so it remains crisp, lightweight, and interactive without copying an existing brand mascot.

### States

- `dormant`: small corner node.
- `invite`: hero introduction.
- `guided`: one message at a meaningful transition.
- `minimized`: visitor is exploring freely.
- `dismissed`: hidden for the session.
- `action`: project-ending CTA.
- `replay`: manual “show tip again.”

### Initial choice

Message:

> Welcome—I can guide you through what each system does and where the evidence lives.

Actions: `Guide me` and `Explore freely`.

### Dialogue budget

- Maximum one automatic bubble per chapter.
- 16–22 words, two or three lines maximum.
- Dismissible immediately.
- Never overlaps headings, diagrams, or CTAs.
- Desktop: fixed lower-right safe area, 280–320px bubble.
- Mobile: 48px corner trigger with compact bottom sheet.
- No pointer chasing, bouncing, or autoplay audio.
- If guidance is enabled, use a polite live region; do not announce passive ambient movement.

### Script anchors

- Index: “Choose any project, or continue scrolling. I’ll explain each architecture in order.”
- Antigravity opening: “Follow one candidate answer from voice to an evidence-backed report.”
- Antigravity close: “You’ve seen the runtime. Start the real interview, or continue to Filmora.”
- Filmora opening: “Watch one creative brief become research context, coordinated agent work, and an editor-ready timeline.”
- MindScape opening: “Here, perception, evidence, reasoning, and safety remain separate and inspectable.”

---

## 10. Reusable flagship visual grammar

### High-level system map

Every map contains:

- Input.
- Ingress/perception.
- Intelligence/orchestration.
- Output.
- Evidence/feedback.

The map draws once, then becomes a persistent mini-map.

### Component microscope

For every stage:

1. Current high-level node enlarges.
2. Other geometry dims while labels remain readable.
3. A signal enters.
4. The real internal transformation executes.
5. A concrete artifact exits.
6. The artifact travels to the next system node.
7. A short engineering takeaway explains why the component matters.

### Semantic object language

| Role | Object | Motion |
|---|---|---|
| Human/input | Rounded live surface | Responds to real activity |
| Streaming data | Segmented ribbon | Packets and partial states move continuously |
| Agent | Worker node with task label | Receives evidence and emits a typed finding |
| Deterministic transform | Processing chamber | Input visibly changes form |
| Learned model | Layered activation field | Activations propagate across layers |
| Storage/index | Spatial vault or graph | Query activates retrieved neighbors |
| Orchestrator | Switchboard or state junction | Inputs converge; one route wins |
| Validation | Matrix or threshold gate | Pass, warn, or block with written reason |
| Final artifact | Faithful product surface | Components assemble into it |
| Feedback | Return rail | Governed evidence travels backward |

### Motion rhythm

1. Context hold: 0.7s.
2. Node focus: 0.4s.
3. Component execution: 3–5s.
4. Result/readability hold: 2–3s.
5. Artifact handoff: 0.6s.

### Motion tokens

- Micro feedback: 160–200ms.
- UI state: 240–320ms.
- Architecture focus: 320–420ms.
- Chapter entrance: 550–700ms.
- Hero split: 780–850ms.
- Ambient drift: 20–38s.
- Primary easing: `cubic-bezier(.16,1,.3,1)`.
- Scene easing: `cubic-bezier(.65,0,.35,1)`.
- At most one primary foreground animation and two ambient loops at a time.

---

## 11. Antigravity detailed specification

### Recruiter framing

Title:

> Antigravity — AI-native technical interviewing platform

Supporting line:

> A real-time interviewer that converts each answer into evidence and selects the next question accordingly.

Primary takeaway: this is a functioning voice-interview product, not a chatbot reading a static list.

### High-level map

Candidate speaks → streaming speech-to-text → real-time interview orchestrator → prepared response audio → candidate.

Secondary evidence rail:

Turn evidence → competency assessment → recruiter report.

Use a faithful miniature of the actual Antigravity room at the input/output boundary. A waveform becomes transcript state, fans into orchestration, returns as audio, and adds evidence to a growing ledger.

### Low-level stages

#### A1. Candidate answer

- Graphic: faithful room miniature with current question, microphone state, live waveform, and answer timeline.
- Input: active interview question.
- Transformation: candidate owns the floor and speaks.
- Output: continuous voice signal plus turn/session state.
- Verify: exact WebRTC/WebSocket responsibilities and public-demo fidelity.

#### A2. Streaming speech-to-text

- Primary label: Streaming speech-to-text.
- Secondary label: `Deepgram · partial and final transcripts`, because source confirms the provider and event types.
- Graphic: waveform frames create translucent provisional tokens; revised partials replace earlier tokens; final tokens lock into a structured answer card.
- Input: voice signal.
- Transformation: partial transcript updates and final utterance commit.
- Output: stable transcript plus turn metadata.
- Do not publish 70ms, 100ms, 98ms, or 98% claims until benchmark evidence exists.
- Safe public wording: “Partial transcripts arrive while the candidate is speaking.”

#### A3. Foreground question path

- Explain the concept before the internal name “fast lane.”
- Graphic: current question, candidate answer state, multiple prepared probes, trajectory branches, actual route guards, and one selected next question.
- Input: stable transcript plus interview state.
- Transformation: select a prepared legal question without waiting for deeper parallel analysis.
- Output: prepared next-question packet.
- Use semantic edge scores only if route selection actually exposes them; otherwise show verified rule/state criteria.
- The local smoke-test range 553–668ms may be shown only as “recorded local process-turn smoke,” never as a production SLA.

#### A4. Trajectory map microscope

- Root: current interview focus/question.
- Middle: representative answer scenarios or route conditions.
- Leaves: staged question candidates.
- One branch illuminates and the selected question moves into the prepared slot.
- Required source audit: exact map schema, focus areas, route kinds, and selection mechanism.

#### A5. Concept agent

- Graphic: evidence-bearing phrases connect to concept nodes such as architecture, latency, evaluation, trade-offs, and failure handling.
- Output: covered, partial, and missing concept surfaces.
- Use fictional demonstration content, not a real applicant record.

#### A6. Weakness agent

- Graphic: answer-to-rubric coverage scanner with evidence phrases, unsupported areas, missing implementation detail, and an explicitly labeled finding.
- Example: “Missing evidence: no concrete failure-recovery mechanism described.”
- Never animate a generic 92% weakness score without calibrated runtime evidence.

#### A7. Discrepancy agent

- Graphic: résumé claim ↔ interview evidence ledger.
- States: Supported, Uncertain, Needs verification, Contradicted.
- Pair icon, text, and color.
- Include claimed versus demonstrated ownership/depth where the real schema supports it.

#### A8. Reasoning-behavior agent

- Graphic: observable rubric for assumptions, alternatives, trade-offs, edge cases, and self-correction.
- Do not expose hidden chain-of-thought.
- Output structured behavior tags and evidence references.

#### A9. Parallel analysis handoff

- Concept, weakness, discrepancy, and reasoning packets leave concurrently.
- Different arrival times make the parallel architecture visible.
- Required source audit: exact agent names, schemas, concurrency, and confidence semantics.

#### A10. Orchestrator decision

- Use a decision switchboard, not a generic neural network.
- Inputs: answer, trajectory state, concept coverage, weakness, discrepancy, reasoning behavior, agenda, coverage, fatigue, and route guards where verified.
- Center card: what was demonstrated, what remains uncertain, selected probe, and bounded rationale.
- Output: one legal next route and updated prepared question.
- The rationale is a structured decision summary, not model chain-of-thought.

#### A11. Prepared response audio

- Primary label: Prepared response audio.
- Secondary label: Pre-generated/cached TTS.
- Graphic: prepared audio packets and cache slots; selected question activates a corresponding waveform and begins playback.
- Do not depict token-by-token/phoneme streaming unless source evidence changes.
- Verify provider, cache scope, and onset measurements before publishing a latency claim.

#### A12. Evidence-backed recruiter report

- Reuse the real Antigravity report language and layout motifs.
- Show demonstrated evidence, coverage, confidence, observed strength, claim risk, and explicitly untested areas.
- Interview evidence cards physically assemble into the report.
- Scores must always retain context and limitations.

#### A13. Impact and demo

- Restrained evidence strip: deployment state, interview/report volume, real replay, and human decision boundary.
- CTA: **Start the real interview**.
- Supporting line: **Actual room → three interview turns → recruiter report**.
- The current sanitized fictional replay remains the public-safe path.

---

## 12. Filmora detailed specification

### Recruiter framing

Title:

> Filmora multi-agent AIGC production system

Supporting line:

> A production runtime that turns a creative brief and trend context into editor-ready video, audio, captions, effects, and timeline instructions.

### High-level map

Creative brief → trend intelligence and retrieval → semantic prompt compiler → multi-agent production DAG → Filmora-ready timeline → observability/evaluation.

Telemetry runs beneath the whole pipeline.

### Low-level stages

#### F1. Creative brief

- Graphic: a realistic prompt surface decomposes desired content, audience, format, mood, platform, duration, and constraints.
- Input: underspecified human request.
- Transformation: intent becomes typed production requirements.
- Output: structured brief packet.
- Never show a confidential customer prompt.

#### F2. Trend research agent

- Six platform streams: TikTok, Douyin, Xiaohongshu, Instagram, WeChat, and Facebook.
- Three or four local optimized thumbnails per stream.
- An investigative lens extracts hook, audio, style, palette, caption, tempo, and effect chips.
- At scan completion, platform media blurs while extracted signals remain sharp.
- Signals branch into `trend-skill.md`, `design.md`, context packet, and Filmora parameters only where the names are confirmed safe/public.
- Use owned, licensed/CC0, attributed, or original representative media. Never scrape or hotlink personal content.
- Clarify whether “700+ signals” means posts, features, observations, or aggregated records.

#### F3. Memory retrieval

- Current brief becomes a query/embedding packet.
- Query enters a spatial memory vault.
- Relevant skill files, context packets, JSON state, prior guidance, and editing parameters illuminate.
- Top results exit with readable relevance ordering.
- Show lexical/metadata filters only if actually used.
- Verify vector database, embedding model, schema, and whether this was production or prototype.

#### F4. Recommendation

- Live trend signals, current brief, and retrieved artifacts feed candidate production choices.
- Outputs: audio style, visual treatment, hook, effects, rhythm, caption pattern.
- Candidate recipes reorder based on ranking.
- Use activated neural layers only if a learned ML recommender genuinely performs the operation; otherwise use a scoring/rank lattice.

#### F5. Semantic prompt/context compiler

- Inputs: user intent, trend/recommendation context, and current production state.
- Visible phases: normalize intent, resolve constraints, bind schemas, build agent-specific instructions, emit executable production graph.
- Output is structured: tool contracts, dependencies, asset slots, approval gates, and agent instructions.
- Verify schema technology, exact contracts, prompt versioning, and conflict handling.

#### F6. Multi-agent production DAG

- Distinct workers: video, visual/image, AI music, dialogue/TTS, captions, transitions/effects, and editor assembly where verified.
- Show dependencies, parallel work, handoffs, tool calls, checkpoints, retries/regeneration, and human approval.
- A failed node retries or waits for approval; it must not simply glow red.
- Do not represent deterministic orchestration as a neural brain.

#### F7. Filmora-ready timeline

- Completed artifacts physically enter video, music, dialogue, caption, transition, effect, and metadata tracks.
- A playhead scrubs only after dependencies are satisfied.
- The result must read as editor-native assets, not a floating generated video.
- Clarify which pieces were integrated, prototyped, or designed.

#### F8. Observability and evaluation

- Real trace-waterfall visual: request root, agent spans, tool calls, handoffs, retries, guardrails, latency, and cost.
- Feedback loop: trace → evaluation → regression comparison → prompt/config change → next run.
- Show 28% API cost as baseline-versus-optimized with methodology context, not as an isolated floating number.
- Qualify 2% as orchestration’s share of end-to-end generation latency and record measurement semantics.
- “RL-style” must remain “RL-style evaluation feedback loop,” not online reinforcement learning.

### Confidentiality boundary

Label the chapter as a representative system visualization with confidential internals abstracted. Do not publish proprietary Filmora screens, prompts, provider contracts, or customer data without permission.

---

## 13. MindScape detailed specification

### Recruiter framing

Title:

> MindScape — multimodal clinical decision-support system

Supporting line:

> A synthetic-data clinical workflow MVP that converts behavioral signals into retrievable evidence, structured hypotheses, and clinician review.

Always visible:

> Research and decision support — not autonomous diagnosis, medical advice, emergency dispatch, or production clinical software.

### Repository truth

The local repository explicitly states:

- Session analysis, local runtime persistence, and the async-care foundation are the strongest real flows.
- Several product surfaces are prototype or mock-backed.
- Authentication/authorization is not production-ready.
- Live Nancy voice is not fully integrated.
- The full heavy diagnosis path is disabled in the default public demo.
- Current code comments indicate MedCPT loading was removed for memory constraints and some retrieval behavior may be BM25-only in the present runtime.

Therefore V2 must visually separate **current MVP**, **implemented local engine**, **prototype**, **full architecture**, and **design target**. The aspirational seven-layer architecture cannot be presented as one uniformly deployed pipeline.

### High-level map

Synthetic clinical audio/signals → multimodal perception → behavioral-state fusion → evidence retrieval → grounded reasoning → independent validation → clinician review/feedback.

### Low-level stages

#### M1. Capture and rolling context

- Graphic: microphone waveform enters a rolling buffer; older frames leave as new frames enter.
- Show overlapping analysis windows.
- Verify 16kHz mono, 500–1000ms buffer, and transport before publishing.

#### M2. Linguistic/event perception

- Timestamped transcript tokens align to the waveform.
- SenseVoice event tokens such as silence, breath, cough, laughter, or crying appear only if supported by the exact vocabulary.
- Use synthetic input only.

#### M3. Affect perception

- Emotion2Vec+ output moves across a valence–arousal plane and temporal curve.
- If dominance is part of the implementation, include it as a separate visible measure.
- Verify model version, dimensions, and fine-tuning.

#### M4. Optional visual/paralinguistic branch

- Show facial/action-unit or vision signals only if the current architecture genuinely uses them.
- Use an abstract synthetic face/action-unit mesh, never patient imagery.

#### M5. Behavioral-state fusion

- Linguistic, event, and affect vectors enter separate gates.
- Gate activations weight modalities before creating a behavioral-state fingerprint.
- A neural activation visual is appropriate only if the Gated Multimodal Unit/cross-modal gate is implemented or clearly labeled architecture.
- Verify MedCPT’s exact role, vector dimensions, longitudinal state, and fusion mechanism.

#### M6. Hybrid clinical retrieval

- Dense rail: MedCPT query enters an HNSW/FAISS neighbor graph.
- Lexical rail: key terms enter a BM25 inverted-index wall.
- RRF rail: dense and lexical ranks merge into a common board.
- Rerank rail: query/evidence pairs receive BioLinkBERT cross-encoder scores and reorder.
- Final output: cited top evidence packet.
- Present this as the full architecture only where accurate; present current-runtime limitations alongside it.

#### M7. Evidence-grounded reasoning

- Hypothesis-and-evidence workspace with supporting evidence, conflicting evidence, unresolved information, citations, uncertainty, and follow-up questions.
- Never expose hidden chain-of-thought.
- If an LLM council exists, show compared candidate assessments against common evidence, not private reasoning transcripts.

#### M8. Independent validation and rules

- NLI graphic: claim-evidence matrix with Entailed, Neutral, or Contradicted states.
- Rule graphic: deterministic state machine with Satisfied, Insufficient evidence, Conflict, or Escalation states.
- Confidence gate always routes to clinician review; no path ends in autonomous diagnosis.
- Verify DeBERTa version, thresholds, rule implementation, and clinical evaluation.

#### M9. Clinician review and feedback

- Show finding, evidence, provenance, uncertainty, validator status, and accept/revise/escalate controls.
- Feedback enters a governed queue, not uncontrolled real-time retraining.
- Show fairness monitoring only if real subgroup metrics/data exist; otherwise label it a designed monitoring hook.

### Product-level handoff

After the technical engine, show how the result persists into the synthetic patient timeline and clinician workspace. This connects the architecture requested in the prompt to the local repository’s strongest actual product flow.

---

## 14. Logistics and research handling

### Logistics

Provisional compact story, pending code inventory:

Operator request → role policy → bounded copilot intent → approved parameterized query → returned rows → evidence-backed response → audit trail.

Do not invent autonomous operations. Preserve the central claim that the model sees returned rows rather than unrestricted database access.

### Research

Use this grammar per item:

Research question → dataset/benchmark → method → experiment → evaluation → finding → limitation.

Required artifacts:

- Dataset scale.
- Method diagram.
- Evaluation protocol.
- Measured result.
- Limitation.
- Code/paper status.

Do not force research into an agent-orchestration diagram.

---

## 15. Claim and maturity ledger

Every claim receives:

- Exact copy.
- Classification.
- Source.
- Environment.
- Sample size.
- Date/version.
- Safe public wording.
- Disclosure status.

### Current ledger

| Claim | Current status | Safe handling |
|---|---|---|
| Name is Yashwant Bhyri | Verified by current portfolio/résumé context | Use consistently; ignore dictated name variants |
| Final-year/fourth-year student | Needs wording confirmation | Use “B.Eng. CSE, 2023–2027” until confirmed |
| 1+ years internships/research | User-provided summary; needs date normalization | Use only after calendar calculation/copy review |
| Deepgram live ASR | Confirmed in Antigravity source | Show as implementation detail |
| Partial and final transcripts | Confirmed in Antigravity source | Show without invented cadence |
| 70ms/100ms transcript cadence | Unverified and conflicting | Do not show |
| 98% STT accuracy / implied WER | Unverified and conceptually conflated | Do not show |
| 98ms latency | Prompt appears mistranscribed | Do not infer |
| 553–668ms process-turn | Reproduced local smoke range from prior audit | Label exactly as local smoke, not SLA |
| TTS is pre-generated/cached | Confirmed by prior source audit | Use this; do not depict streaming generation |
| 250+ candidates/interviews/reports | User-provided, noun conflicts | Confirm exact unit and source before final copy |
| Antigravity production deployed | Product appears deployed; production-grade scope needs definition | Qualify deployment separately from maturity |
| 700+ Filmora creative signals | Locked résumé claim | Use as internship result; define signal unit if possible |
| 28% Filmora API-cost reduction | Locked résumé claim | Show baseline-versus-optimized and label internship result |
| 2% orchestration latency share | Locked résumé claim | Preserve exact “share of E2E generation latency” wording |
| Filmora internals | Confidential | Use representative abstraction only |
| MindScape is production clinical AI | Explicitly false in local docs | Never claim |
| MindScape is synthetic-data MVP | Verified in local docs | Always show |
| MindScape session analysis core is real | Verified in local docs | Show as strongest implemented engine |
| MindScape MedCPT/HNSW/RRF/BioLinkBERT full runtime | Architecture/resume claim; current runtime has limitations | Present as full architecture with current-runtime distinction |
| DeBERTa/DSM gate | Needs exact implementation audit | Label target/prototype until verified |
| OAuth2/JWT/Kubernetes | Needs repository evidence | Do not show as implemented until verified |
| Weakness risk 92% | Example only | Never style as measured production fact |

### Maturity labels

- **Measured**: reproduced from telemetry/test with environment stated.
- **Production result**: supported by production records or locked professional evidence.
- **Implemented**: works in source/runtime but has no performance claim.
- **Prototype**: implemented experiment or incomplete workflow.
- **Architecture**: designed system component, possibly partially implemented.
- **Design target**: future goal; never shown as achieved.

---

## 16. Research decisions and sources

### Adopted principles

- Apple’s motion guidance: motion must be purposeful, brief, precise, optional, cancellable, and never overshadow content.
- Material motion: preserve a focal point and visual continuity; one shared element should anchor complex transitions.
- Deepgram product storytelling: lead with the human-visible live transcription behavior, then vendor/model details and honest latency context.
- Scrollytelling research: native scrolling can guide chronology while preserving user control.
- Baymard/web typography: keep body copy near 50–75 characters per line.
- W3C: provide pause/reduced-motion alternatives for nonessential movement; do not make animation the only information channel.

### References

- Apple HIG Motion: https://developer.apple.com/design/human-interface-guidelines/motion
- Apple MacBook Pro product storytelling: https://www.apple.com/macbook-pro/
- Deepgram Speech-to-Text product: https://deepgram.com/product/speech-to-text
- Deepgram streaming latency measurement: https://developers.deepgram.com/docs/measuring-streaming-latency
- Material choreography: https://m1.material.io/motion/choreography.html
- Material duration/easing: https://m1.material.io/motion/duration-easing.html
- Baymard line-length research: https://baymard.com/blog/line-length-readability
- Web.dev typography: https://web.dev/learn/design/typography
- W3C animation from interactions: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions
- ScrollyVis paper: https://arxiv.org/abs/2207.03616
- Awwwards transition reference: https://www.awwwards.com/inspiration/page-transition-mael-ruffini-portfolio-2025

### Media sourcing rule

Filmora trend streams will use owned, licensed, Creative Commons/CC0, or original representative media. Assets must be downloaded where permitted, optimized, provenance-recorded, and free of personal data. No hotlinking or arbitrary scraped user posts.

---

## 17. Execution plan and definition of done

### Phase 0 — Baseline and planning

Status: complete.

- Frozen rollback copy created.
- Prompt decomposed.
- Current UI inspected.
- Current code architecture inspected.
- Antigravity and MindScape truth conflicts identified.
- Research principles recorded.
- Master plan created.

### Phase 1 — Content and claim freeze

- Use the confirmed academic wording: “fourth-year student.”
- Use the confirmed Antigravity impact unit: “250+ completed interviews.”
- Audit Antigravity trajectory and agent schemas.
- Audit MindScape component maturity.
- Define safe Filmora public names and media.
- Freeze all section copy before visual polish.

Done when no displayed numeric/maturity claim lacks a ledger entry.

### Phase 2 — Global design foundation

- Implement spacing/type/motion tokens.
- Implement chapter wrappers and proximity snapping.
- Implement responsive architecture primitives.
- Implement accessible stage controls.
- Implement mobile-native graphic layout.
- Implement reduced-motion and session preferences.

Done when a neutral sample chapter passes desktop/mobile/keyboard/reduced-motion.

### Phase 3 — Hero and galaxy

- Implement centered type/highlight/split sequence.
- Implement skip/session behavior.
- Rebuild deck entrance, inert states, timing, and hit targets.
- Rebuild controlled keyword visibility/highlight system.
- Validate copy exclusion zone and contrast.

Done when hero passes all acceptance tests at 1280×720, 1440×900, 1024×768, 390×844, and 320×568.

### Phase 4 — Project index and mascot

- Reframe cards category-first.
- Add maturity/proof/action layers.
- Tune grid/density.
- Implement Orbit guide and opt-in state model.
- Validate nonblocking mobile bottom-sheet behavior.

Done when a five-second unfamiliar-reader test succeeds and every action is keyboard/touch accessible.

### Phase 5 — Antigravity deep dive

- Build high-level loop.
- Build all verified low-level microscopes.
- Integrate real room visual language and report.
- Preserve real sanitized replay.
- Rename CTA.
- Validate every stage and full autoplay/manual flow.

Done when a reviewer can answer all ten recruiter questions without prior résumé context.

### Phase 6 — Filmora deep dive

- Source and optimize representative media.
- Build trend scan and artifact branching.
- Build memory retrieval and recommendation as distinct mechanics.
- Build compiler, production DAG, editor timeline, and trace/eval loop.
- Validate confidentiality labels and claims.

Done when the chapter makes Yashwant’s orchestration contribution unmistakable without implying proprietary detail.

### Phase 7 — MindScape deep dive

- Build current-MVP/full-architecture maturity framing.
- Build capture, perception, affect, fusion, retrieval, reasoning, validation, and review microscopes.
- Connect engine to actual clinician workflow/persistence.
- Validate medical-safety copy.

Done when architecture depth and implementation truth remain simultaneously clear.

### Phase 8 — Logistics, research, and closing

- Audit Logistics repository and refine bounded-copilot dossier.
- Reframe research around question/method/evaluation/limitation.
- Improve education/focus/contact closing.
- Verify résumé and GitHub actions.

### Phase 9 — Project-manager acceptance

- Content proofread and terminology consistency.
- Desktop, tablet, mobile, 200% zoom, and 400% reflow.
- Keyboard and focus order.
- Screen-reader names and live-region discipline.
- Contrast and non-color status encoding.
- Reduced motion.
- Autoplay pause/stop/skip.
- No layout clipping in every stage.
- No horizontal page overflow at 320px.
- Deep links and fixed-header offsets.
- Real Antigravity replay end to end.
- Console, build, lint, unit/render tests.
- Performance target: LCP <2.5s, CLS <0.05, INP <200ms on a realistic mobile profile.
- Media provenance and asset weight review.

---

## 18. Recruiter acceptance test

For each flagship, an unfamiliar reviewer must be able to answer:

1. What is this product?
2. Who uses it?
3. What enters the system?
4. What leaves the system?
5. What did Yashwant personally engineer?
6. What is the main architectural decision?
7. What evidence proves it works?
8. Which claims are measured versus proposed?
9. Where can the real artifact/demo be viewed?
10. Can all of this be understood without manually clicking every stage?

If any answer requires guessing, the chapter is not complete.

---

## 19. Resolved decisions and remaining source evidence

1. Resolved: hero academic wording is “fourth-year student.”
2. Resolved: Antigravity impact is “250+ completed interviews.”
3. Whether the 70/100ms STT cadence and 98% accuracy have reproducible evidence. Default: omit.
4. Whether Filmora’s `design.md`, skill-file names, vector retrieval stack, and internal parameter names are safe and exact.
5. Resolved for V2: use one coherent Orbit guide with project-specific modes.
6. Whether Logistics should remain a compact verified dossier or receive a later full microscope.

Neural-network and signal-convergence visuals may be used as cinematic metaphors where they explain the operation. Model names, algorithms, providers, and measured results remain tied to the résumé or project evidence.

---

## 20. Append-only progress log

### 2026-07-18 — Planning gate

- Created frozen baseline at `/Users/yash/Documents/Resume/portfolio-baselines/2026-07-18-baseline-v1`.
- Verified the snapshot matched the working site immediately after copy, excluding generated/dependency directories.
- Inspected current component structure and 2600-line experience stylesheet.
- Inspected desktop hero, project index, Antigravity, Filmora, and MindScape surfaces.
- Recorded current section heights and total document height.
- Identified essential-label typography below the readability floor.
- Identified mobile scale/crop architecture as a blocking flaw.
- Researched Apple motion, Material choreography, Deepgram capability presentation, typography, scrollytelling, and motion accessibility.
- Inspected Antigravity source signals and MindScape repository truth documents.
- Resolved current TTS representation to pre-generated/cached, not streaming generation.
- Defined category-first project semantics, Orbit guide direction, and reusable component-microscope grammar.
- No implementation code changed during this planning gate.

Next action: resolve the six open decisions, then begin Phase 1 content/claim freeze.

### 2026-07-18 — V2 implementation started

- Locked “fourth-year student” and “250+ completed interviews.”
- Locked an 18-term keyword pool with 10 visible and two bright on desktop; mobile reduces to five visible.
- Locked one coherent MindScape architecture rather than a visually fragmented MVP-versus-target story.
- Approved neural activation and signal-network metaphors wherever they clarify fusion, recommendation, or agent convergence.
- Created a new V2 page surface and a dedicated operational-graphics module beside the preserved implementation.
- Reframed every project card category-first and every flagship stage around input → operation → output.
- Added a centered typing-to-split hero choreography, autonomous project deck, Orbit guide state model, high-level interactive system maps, and bespoke component microscopes in source.

Next action: complete the V2 visual system, then build and perform desktop/mobile/readability verification.

### 2026-07-18 — V2 implementation and acceptance pass

- Completed the centered introduction → split identity → autonomous selected-systems deck choreography.
- Completed the 18-term AI keyword galaxy with ten visible and two bright signals on desktop, reduced density on mobile, continuous drift, and cursor-reactive lighting on fine pointers.
- Completed category-first project navigation and a persistent, dismissible Orbit guide.
- Completed interactive high-level maps plus seven-stage component microscopes for Antigravity, Filmora, and MindScape.
- Completed bespoke Antigravity visuals for the room, streaming STT, prepared question path, evidence agents, orchestrator convergence, prepared audio, and recruiter report.
- Completed bespoke Filmora visuals for the creative brief, six-source trend scan, memory/recommendation network, semantic compiler, production DAG, editor timeline, and observability/evaluation loop.
- Completed bespoke MindScape visuals for capture, multimodal perception, gated state fusion, dense/lexical retrieval and reranking, grounded reasoning, validation gates, and clinician review.
- Completed the bounded Logistics operations dossier and three research-to-measurement specimens.
- Wired the portfolio CTA to the existing Antigravity `portfolio_demo/start` endpoint and verified the actual interview room auto-runs three fictional turns before landing on the recruiter report.
- Verified desktop at 1440×900 and mobile at 390×844; mobile page width equals client width with no horizontal overflow, and diagrams reflow natively rather than scaling a desktop canvas.
- Verified autoplay changes operational stages while visible, manual selection pauses it, controls remain usable, and reduced-motion logic preserves a complete static experience.
- Verified browser console has no warnings or errors.
- Verified `npm run lint` passes.
- Verified production build and all three rendered/source tests pass.
- Preserved the frozen baseline at `/Users/yash/Documents/Resume/portfolio-baselines/2026-07-18-baseline-v1`.

Current state: implementation complete; awaiting only final independent PM/UX/graphics audit responses.

### 2026-07-18 — Final PM, UX, and visual acceptance

- Closed the remaining project-manager language gaps: the project index now promises an engineering outcome rather than implying every system is deployed, and MindScape is consistently presented as a clinical decision-support architecture prototype.
- Kept Filmora’s visible `ML recommendation layer` language because it is explicitly supported by the locked résumé; the operational neural mesh remains a visualization of retrieval, ranking, and recommendation rather than a claim of training a model from scratch.
- Rebuilt the Antigravity fictional visual trace around one coherent public-replay candidate, Jordan Lee, from the opening voice turn through STT, trajectory routing, evidence agents, the failure-signal probe, prepared audio, and the final recruiter report.
- Changed flagship and Logistics autoplay to observe the storytelling surface rather than the full chapter, pause only on intentional inspection surfaces, stop on the final stage, and reveal a completion-gated Orbit handoff instead of looping silently.
- Removed the synchronous visited-state effect and folded stage, play, and completion state into one transition path; the React lint gate is clean.
- Simplified mobile hero controls to previous / pause / next while retaining the visible project counter, preserving 44px targets without horizontal pressure.
- Preserved named inputs and outputs in the mobile signal-convergence graphics using a native three-column reflow, edge-anchored nodes, and an 11px label floor, including the higher-specificity Filmora memory visual.
- Authored a static reduced-motion Filmora state that shows all six source platforms and all four distilled artifacts without relying on paused keyframes.
- Added the completion-gated Logistics → Research handoff so the five-system guided journey resolves continuously.
- Reverified the live page at 1440×900: current copy and visual labels render correctly, Jordan Lee’s report is internally consistent, the completed project handoff resolves, and document width equals viewport width.
- Reverified final source quality: `git diff --check`, `npm run lint`, production build, and all three rendered/source tests pass.
- Independent requirements/claim, UX architecture, and operational-graphics agents all returned `PASS` after their findings were addressed.
- The actual Antigravity CTA remains wired to the existing local/public replay runtime; the previously verified three-turn fictional room → recruiter-report flow was not replaced with an imitation.
- No deployment was performed in this pass. The working local prototype remains available at `http://localhost:3001/` and the frozen baseline remains at `/Users/yash/Documents/Resume/portfolio-baselines/2026-07-18-baseline-v1`.

Final state: accepted local prototype; ready for Yashwant’s visual review and a later explicit deployment pass.
