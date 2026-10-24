"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SequenceController = {
  index: number;
  playing: boolean;
  motionDisabled: boolean;
  choose: (index: number) => void;
  toggle: () => void;
};

const PROJECTS = [
  {
    id: "antigravity",
    number: "01",
    name: "Antigravity",
    type: "AI-native technical interviewing",
    summary: "A live voice interviewer that converts each answer into the next evidence-seeking question.",
    accent: "lime",
  },
  {
    id: "filmora",
    number: "02",
    name: "Filmora Agent Runtime",
    type: "Multimodal AIGC orchestration",
    summary: "A multi-agent production graph that turns one creative brief into editable video, audio, dialogue, captions, and effects.",
    accent: "violet",
  },
  {
    id: "mindscape",
    number: "03",
    name: "MindScape",
    type: "Multimodal clinical intelligence",
    summary: "A clinician-support prototype that keeps speech, affect, retrieved evidence, and uncertainty inspectable.",
    accent: "cyan",
  },
  {
    id: "logistics",
    number: "04",
    name: "Logistics AI Ops",
    type: "Role-based operations + bounded copilot",
    summary: "An operations platform where AI can query business data only through approved, parameterized routes.",
    accent: "amber",
  },
  {
    id: "research",
    number: "05",
    name: "Research & Systems",
    type: "Multimodal ML · TinyML · evaluation",
    summary: "Applied research across Text-to-SQL, embedded audio, model distillation, and evidence-oriented evaluation.",
    accent: "blue",
  },
] as const;

const GALAXY_TERMS = [
  ["Agentic systems", 8, 17, 0, 19], ["Multimodal AI", 72, 11, 1, 23], ["Retrieval", 45, 19, 2, 18],
  ["RAG", 89, 27, 3, 21], ["Evaluation", 13, 39, 4, 17], ["Observability", 66, 37, 5, 24],
  ["Tool calling", 31, 49, 6, 20], ["Model serving", 82, 53, 7, 22], ["Vector search", 5, 67, 8, 25],
  ["Fine-tuning", 48, 70, 9, 19], ["Guardrails", 91, 74, 10, 23], ["Memory", 24, 81, 11, 18],
  ["Structured outputs", 61, 86, 12, 26], ["Human-in-the-loop", 77, 92, 13, 20], ["Inference", 15, 94, 14, 22],
  ["Data pipelines", 38, 8, 15, 24], ["Embeddings", 94, 43, 16, 19], ["Speech AI", 21, 25, 17, 21],
  ["Computer vision", 53, 31, 18, 25], ["NLP", 36, 92, 19, 17], ["Agent evaluation", 58, 57, 20, 23],
  ["State machines", 18, 58, 21, 20], ["Async runtimes", 70, 68, 22, 26], ["Semantic search", 35, 33, 23, 18],
] as const;

const ANTIGRAVITY_STEPS = [
  {
    label: "Voice answer",
    title: "The candidate speaks naturally—not into a form.",
    body: "The locked interview room owns turn-taking, silence confirmation, interruption recovery, and the visible conversation state.",
  },
  {
    label: "Streaming STT",
    title: "Deepgram streams partial and final transcript snapshots.",
    body: "Named entities and rolling transcript snapshots can start speculative preparation before the final utterance is committed.",
  },
  {
    label: "Fast lane",
    title: "A prepared question is selected without waiting for deep analysis.",
    body: "The foreground lane chooses a staged probe, map-backed question, or bounded recovery route. A recorded smoke run served turns in 0.55–0.67 seconds at this boundary.",
  },
  {
    label: "Parallel analysis",
    title: "Four evidence agents examine the committed answer in parallel.",
    body: "Concept extraction, weakness detection, résumé discrepancy checking, and reasoning evaluation run concurrently while the conversation continues.",
  },
  {
    label: "Route decision",
    title: "The orchestrator decides what the next turn must investigate.",
    body: "Agenda state, coverage, fatigue, application transfer, contradictions, and staged evidence resolve into one legal next-question route.",
  },
  {
    label: "Voice response",
    title: "The next question is staged—and its audio is prepared early.",
    body: "TTS is pre-generated in the background and served from cache when available; a short acknowledgement bridges the hand-off into playback.",
  },
  {
    label: "Evidence report",
    title: "The interview ends as an evidence record, not a mystery score.",
    body: "The report separates demonstrated ability, claim credibility, coverage, uncertainty, risks, and explicitly untested dimensions for human review.",
  },
] as const;

const FILMORA_STEPS = [
  { label: "Brief", title: "One creative request enters the production runtime." },
  { label: "Research", title: "The trend agent reads cross-platform creative signals." },
  { label: "Distill", title: "Signals become retrievable context and reusable skill artifacts." },
  { label: "Compile", title: "Intent and context compile into schema-bound tool instructions." },
  { label: "Orchestrate", title: "Specialist agents generate independent, editable media assets." },
  { label: "Assemble", title: "Assets land on a Filmora-native editing timeline." },
  { label: "Evaluate", title: "Traces expose cost, latency, failures, and creative quality." },
] as const;

const MINDSCAPE_STEPS = [
  { label: "Capture", title: "A simulated voice session enters a rolling audio buffer." },
  { label: "Perceive", title: "Speech, paralinguistic events, and acoustic affect split into synchronized branches." },
  { label: "Fuse", title: "Cross-modal gating creates a reusable Behavioral State Vector." },
  { label: "Retrieve", title: "Semantic and lexical retrieval assemble ranked clinical evidence." },
  { label: "Reason", title: "Evidence becomes a structured hypothesis with uncertainty and follow-up questions." },
  { label: "Validate", title: "Designed NLI and deterministic rule gates reject unsupported output." },
  { label: "Review", title: "A clinician reviews evidence, uncertainty, and feedback in one surface." },
] as const;

const RESEARCH = [
  {
    title: "Embedded Audio Intelligence",
    meta: "Optek Microelectronics · 2025",
    copy: "Built a TinyML audio-classification pipeline for a 700 MHz DSP / 16 MB SoC using DSP features, a YAMNet-derived network, INT8 quantization, pruning, and C++ operator tuning.",
    proof: "93%+ accuracy · <10 ms · 14× compression",
  },
  {
    title: "Multimodal Text-to-SQL",
    meta: "HKU × Google Cloud · BIRD-SQL",
    copy: "Reconstructed an OCR-grounded VQA and Text-to-SQL evaluation framework with schema-aware prompting, hybrid SQL, FAISS-indexed context, and execution-accuracy diagnosis.",
    proof: "12,751+ pairs · 95+ databases",
  },
  {
    title: "SLM Distillation & Evaluation",
    meta: "CUHK-SZ NLP Group · 2024",
    copy: "Automated TRL distillation pipelines and an LLM-as-judge filter, then built interactive evaluation views over factuality, BERTScore, and ROUGE.",
    proof: "31% fewer factual errors · 200+ response pairs",
  },
] as const;

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

function useAutoplaySequence(
  count: number,
  interval: number,
  rootRef: React.RefObject<HTMLElement | null>,
  reducedMotion: boolean,
): SequenceController {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(!reducedMotion);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "8% 0px 8%",
      threshold: 0.18,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootRef]);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (reducedMotion || !playing || !visible || !pageVisible) return;
    const timer = window.setTimeout(() => setIndex((value) => (value + 1) % count), interval);
    return () => window.clearTimeout(timer);
  }, [count, index, interval, pageVisible, playing, reducedMotion, visible]);

  const choose = useCallback((next: number) => setIndex(next), []);
  const toggle = useCallback(() => {
    if (reducedMotion) return;
    setPlaying((value) => !value);
  }, [reducedMotion]);

  return { index, playing: playing && visible && pageVisible && !reducedMotion, motionDisabled: reducedMotion, choose, toggle };
}

function useTypedIntroduction(reducedMotion: boolean) {
  const finalText = "Hi, welcome to my personal portfolio.\nI’m Yashwant Bhyri.";
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;

    let cancelled = false;
    let timer = 0;
    const typo = "Hi, welcome to my personal portfoloi";
    const corrected = "Hi, welcome to my personal portfolio.";
    const secondLine = "\nI’m Yashwant Bhyri.";
    let phase: "typo" | "pause" | "erase" | "correct" | "second" = "typo";
    let cursor = 0;

    const tick = () => {
      if (cancelled) return;
      if (phase === "typo") {
        cursor += 1;
        setText(typo.slice(0, cursor));
        if (cursor >= typo.length) {
          phase = "pause";
          timer = window.setTimeout(tick, 520);
          return;
        }
        timer = window.setTimeout(tick, 32 + (cursor % 4) * 9);
        return;
      }
      if (phase === "pause") {
        phase = "erase";
        cursor = typo.length;
      }
      if (phase === "erase") {
        cursor -= 1;
        setText(typo.slice(0, cursor));
        if (cursor <= typo.length - 2) {
          phase = "correct";
          cursor = typo.length - 2;
        }
        timer = window.setTimeout(tick, 74);
        return;
      }
      if (phase === "correct") {
        const suffix = corrected.slice(typo.length - 2);
        cursor += 1;
        setText(typo.slice(0, typo.length - 2) + suffix.slice(0, cursor - (typo.length - 2)));
        if (cursor >= corrected.length) {
          phase = "second";
          cursor = 0;
          timer = window.setTimeout(tick, 420);
          return;
        }
        timer = window.setTimeout(tick, 45);
        return;
      }
      cursor += 1;
      setText(corrected + secondLine.slice(0, cursor));
      if (cursor >= secondLine.length) {
        setDone(true);
        return;
      }
      timer = window.setTimeout(tick, 18 + (cursor % 5) * 5);
    };

    timer = window.setTimeout(tick, 260);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [reducedMotion]);

  return {
    text: reducedMotion ? finalText : text,
    done: reducedMotion || done,
    finalText,
  };
}

function GalaxyField() {
  const stars = useMemo(
    () => Array.from({ length: 64 }, (_, index) => ({
      x: (index * 37 + 11) % 100,
      y: (index * 61 + 7) % 100,
      size: 1 + (index % 4) * 0.65,
      delay: (index % 13) * -0.37,
    })),
    [],
  );
  return (
    <div className="xp-galaxy" aria-hidden="true">
      <div className="xp-nebula xp-nebula-a" />
      <div className="xp-nebula xp-nebula-b" />
      <div className="xp-starfield">
        {stars.map((star, index) => (
          <i key={index} style={{ "--x": `${star.x}%`, "--y": `${star.y}%`, "--size": `${star.size}px`, "--delay": `${star.delay}s` } as React.CSSProperties} />
        ))}
      </div>
      <div className="xp-termfield">
        {GALAXY_TERMS.map(([term, x, y, delay, duration]) => (
          <span
            key={term}
            style={{
              "--x": `${x}%`,
              "--y": `${y}%`,
              "--delay": `${delay * -0.8}s`,
              "--duration": `${duration}s`,
            } as React.CSSProperties}
          >
            <i />{term}
          </span>
        ))}
      </div>
      <div className="xp-orbit xp-orbit-a" />
      <div className="xp-orbit xp-orbit-b" />
    </div>
  );
}

function SequenceControls({ controller, labels, name }: { controller: SequenceController; labels: readonly string[]; name: string }) {
  return (
    <div className="xp-sequence-controls">
      <div className="xp-sequence-rail" role="group" aria-label={`${name} stages`}>
        {labels.map((label, index) => (
          <button
            key={label}
            type="button"
            aria-pressed={controller.index === index}
            className={controller.index === index ? "is-active" : index < controller.index ? "is-past" : ""}
            onClick={() => controller.choose(index)}
          >
            <i>{String(index + 1).padStart(2, "0")}</i><span>{label}</span>
          </button>
        ))}
      </div>
      <button className="xp-play-control" type="button" onClick={controller.toggle} disabled={controller.motionDisabled}>
        {controller.motionDisabled ? "Reduced motion" : controller.playing ? "Pause story" : "Play story"}
      </button>
    </div>
  );
}

function HeroProjectDeck({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const deck = useAutoplaySequence(PROJECTS.length, 3200, ref, reducedMotion);
  return (
    <div ref={ref} className="xp-hero-deck" data-active={deck.index}>
      <div className="xp-deck-status"><i className={deck.playing ? "is-live" : ""} /> PROJECT INDEX <span>{String(deck.index + 1).padStart(2, "0")}/{String(PROJECTS.length).padStart(2, "0")}</span></div>
      <div className="xp-deck-stage">
        {PROJECTS.map((project, index) => {
          const offset = (index - deck.index + PROJECTS.length) % PROJECTS.length;
          return (
            <a
              href={`#${project.id}`}
              key={project.id}
              className={`xp-deck-card xp-accent-${project.accent}`}
              data-position={offset}
              onFocus={() => deck.choose(index)}
            >
              <span>{project.number} / {project.type}</span>
              <strong>{project.name}</strong>
              <p>{project.summary}</p>
              <small>Open project <i>↘</i></small>
            </a>
          );
        })}
      </div>
      <div className="xp-deck-dots">
        {PROJECTS.map((project, index) => <button key={project.id} type="button" className={index === deck.index ? "is-active" : ""} onClick={() => deck.choose(index)} aria-label={`Show ${project.name}`} />)}
      </div>
    </div>
  );
}

function ProjectIndex() {
  return (
    <section id="projects" className="xp-project-index xp-section-shell">
      <div className="xp-section-heading">
        <span>SELECTED WORK / 05 SYSTEMS</span>
        <h2>Choose a system—or let each one explain itself as you scroll.</h2>
        <p>The portfolio is ordered by the work most relevant to AI application and agent engineering roles.</p>
      </div>
      <div className="xp-project-grid">
        {PROJECTS.map((project) => (
          <a key={project.id} href={`#${project.id}`} className={`xp-project-card xp-accent-${project.accent}`}>
            <span>{project.number}</span>
            <div><small>{project.type}</small><strong>{project.name}</strong><p>{project.summary}</p></div>
            <i>↘</i>
          </a>
        ))}
      </div>
    </section>
  );
}

function PersonNode({ role, label, active }: { role: "candidate" | "interviewer"; label: string; active: boolean }) {
  return (
    <div className={`xp-person-node xp-person-${role} ${active ? "is-active" : ""}`}>
      <div className="xp-person-avatar"><i /><i /><span /></div>
      <small>{role === "candidate" ? "HUMAN / CANDIDATE" : "AI / INTERVIEWER"}</small>
      <strong>{label}</strong>
      <div className="xp-person-wave">{Array.from({ length: 14 }, (_, index) => <i key={index} />)}</div>
    </div>
  );
}

function AntigravityCase() {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const runtime = useAutoplaySequence(ANTIGRAVITY_STEPS.length, 3800, ref, reducedMotion);
  const [launchState, setLaunchState] = useState<"idle" | "starting" | "fallback">("idle");
  const active = ANTIGRAVITY_STEPS[runtime.index];

  const launchReplay = useCallback(async () => {
    const local = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const appBase = local ? "http://localhost:3010" : "https://antigravity-gz2r.vercel.app";
    const apiBase = local ? "http://localhost:8000/api" : `${appBase}/api`;
    setLaunchState("starting");
    try {
      const startResponse = await fetch(`${apiBase}/portfolio_demo/start`, {
        method: "POST",
      });
      if (!startResponse.ok) throw new Error("Replay could not start");
      const started = await startResponse.json() as { session_id?: string };
      if (!started.session_id) throw new Error("Replay session missing");
      window.location.assign(`${appBase}/interview-room/${encodeURIComponent(started.session_id)}?autoplay=1&source=portfolio`);
    } catch {
      setLaunchState("fallback");
    }
  }, []);

  return (
    <section ref={ref} id="antigravity" className="xp-case xp-antigravity">
      <div className="xp-section-shell">
        <div className="xp-case-heading">
          <span>01 / ANTIGRAVITY · AI-NATIVE TECHNICAL INTERVIEWING</span>
          <h2>What I built: a voice interviewer that investigates <em>how an engineer actually thinks.</em></h2>
          <p>Antigravity prepares a role- and résumé-grounded interview map, conducts a real-time technical conversation, adapts every follow-up to evidence from the previous answer, and assembles a hiring report that preserves both proof and uncertainty.</p>
        </div>

        <div className="xp-runtime-cinema" data-scene={runtime.index}>
          <div className="xp-cinema-bar">
            <div><i className={runtime.playing ? "is-live" : ""} /> LIVE SYSTEM EXPLAINER</div>
            <span>TWO-TRACK VOICE RUNTIME · REAL IMPLEMENTATION</span>
            <strong>{String(runtime.index + 1).padStart(2, "0")} / {String(ANTIGRAVITY_STEPS.length).padStart(2, "0")}</strong>
          </div>
          <SequenceControls controller={runtime} labels={ANTIGRAVITY_STEPS.map((step) => step.label)} name="Antigravity runtime" />

          <div className="xp-runtime-stage">
            <div className="xp-runtime-focus">
              <span>{active.label}</span>
              <h3>{active.title}</h3>
              <p>{active.body}</p>
              <div className="xp-runtime-truth"><i />Foreground answer now · background intelligence for the next turn</div>
            </div>

            <div className="xp-runtime-map">
              <PersonNode role="candidate" label="Voice answer" active={runtime.index === 0} />
              <div className={`xp-flow-node xp-stt-node ${runtime.index === 1 ? "is-active" : ""}`}>
                <span>STREAMING STT</span><strong>Deepgram</strong><small>partial snapshots → final transcript</small>
                <div>{["entity", "rolling text", "turn id"].map((item) => <i key={item}>{item}</i>)}</div>
              </div>
              <div className="xp-lane-split"><i /><span>FAST</span><span>SLOW</span></div>
              <div className={`xp-fast-lane ${runtime.index === 2 ? "is-active" : ""}`}>
                <span>FOREGROUND / FAST LANE</span>
                <div><i>staged probe</i><i>trajectory map</i><i>route guards</i></div>
                <strong>Visible question selected</strong>
                <small>Recorded process-turn smoke: 553–668 ms</small>
              </div>
              <div className={`xp-agent-lane ${runtime.index === 3 ? "is-active" : ""}`}>
                <span>BACKGROUND / PARALLEL ANALYSIS</span>
                <div className="xp-agent-grid">
                  <i><b>Concept</b><small>technical entities</small></i>
                  <i className="is-alert"><b>Weakness</b><small>ownership gap</small></i>
                  <i><b>Discrepancy</b><small>claim check</small></i>
                  <i><b>Reasoning</b><small>causal depth</small></i>
                </div>
              </div>
              <div className={`xp-orchestrator-node ${runtime.index === 4 ? "is-active" : ""}`}>
                <div className="xp-core-rings"><i /><i /><i /></div>
                <span>ORCHESTRATOR</span><strong>One legal next route</strong>
                <small>agenda · coverage · fatigue · evidence</small>
              </div>
              <div className={`xp-tts-node ${runtime.index === 5 ? "is-active" : ""}`}>
                <span>VOICE RESPONSE</span><strong>Pre-generated TTS</strong><small>cache hit → acknowledgement → question</small>
                <div className="xp-audio-bars">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div>
              </div>
              <PersonNode role="interviewer" label="Adaptive follow-up" active={runtime.index === 5} />
              <div className={`xp-report-node ${runtime.index === 6 ? "is-active" : ""}`}>
                <span>REPORT V2</span><strong>Evidence, not inference</strong>
                <div><i style={{ "--fill": "82%" } as React.CSSProperties} /><i style={{ "--fill": "64%" } as React.CSSProperties} /><i style={{ "--fill": "47%" } as React.CSSProperties} /></div>
                <small>strengths · risks · coverage · untested</small>
              </div>
              <div className="xp-runtime-packet" aria-hidden="true"><i /></div>
            </div>
          </div>
        </div>

        <div className="xp-case-proofbar">
          <div><span>Product result</span><strong>250+ candidate reports</strong><small>Technical screening after the ATS layer</small></div>
          <div><span>Runtime design</span><strong>Fast + slow tracks</strong><small>Prepared response, deeper next-turn analysis</small></div>
          <div><span>Decision boundary</span><strong>Human-owned hiring</strong><small>Evidence support—not autonomous employment decisions</small></div>
          <button type="button" onClick={launchReplay} disabled={launchState === "starting"}>
            <span>{launchState === "starting" ? "Starting the real room…" : launchState === "fallback" ? "Replay unavailable · retry" : "Run the 12-second real replay"}</span>
            <small>{launchState === "fallback" ? "The portfolio stayed here—no fake fallback was opened." : "Actual room → three turns → recruiter report · zero LLM ↗"}</small>
          </button>
        </div>
      </div>
    </section>
  );
}

function FilmoraCase() {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const film = useAutoplaySequence(FILMORA_STEPS.length, 4200, ref, reducedMotion);
  const active = FILMORA_STEPS[film.index];
  const sources = ["TikTok", "Douyin", "Xiaohongshu", "Instagram", "WeChat", "Facebook"];

  return (
    <section ref={ref} id="filmora" className="xp-case xp-filmora">
      <div className="xp-section-shell">
        <div className="xp-case-heading">
          <span>02 / WONDERSHARE FILMORA · AIGC ALGORITHMS</span>
          <h2>One prompt becomes a <em>multimodal production graph.</em></h2>
          <p>I built the orchestration layer that combines creative intent with trend intelligence, compiles the result into tool-ready contracts, and coordinates editable video, music, dialogue, captions, effects, and editor assembly.</p>
        </div>

        <div className="xp-film-cinema" data-scene={film.index}>
          <div className="xp-cinema-bar">
            <div><i className={film.playing ? "is-live" : ""} /> AUTOPLAY PRODUCT FILM</div>
            <span>REPRESENTATIVE SYSTEM VIEW · CONFIDENTIAL INTERNALS ABSTRACTED</span>
            <strong>{String(film.index + 1).padStart(2, "0")} / 07</strong>
          </div>
          <SequenceControls controller={film} labels={FILMORA_STEPS.map((step) => step.label)} name="Filmora production" />
          <div className="xp-film-stage">
            <div className="xp-film-caption"><span>{active.label}</span><h3>{active.title}</h3><p>The complete architecture remains visible; focus travels through it like a product launch film.</p></div>
            <div className="xp-film-map">
              <button type="button" className="xp-film-module xp-brief-module" data-active={film.index === 0} onClick={() => film.choose(0)}>
                <span>CREATIVE BRIEF</span><strong>Create a premium launch reel for a foldable phone.</strong><div className="xp-type-line">vertical · kinetic · product-led<i /></div>
              </button>
              <button type="button" className="xp-film-module xp-research-module" data-active={film.index === 1} onClick={() => film.choose(1)}>
                <span>TREND RESEARCH AGENT</span>
                <div className="xp-phone-wall">{sources.map((source, index) => <i key={source} style={{ "--source-index": index } as React.CSSProperties}><b>{source}</b><small>hook · audio · palette</small><em>#{["reveal", "新品创意", "数码美学", "productfilm", "新品首发", "newtech"][index]}</em></i>)}</div>
                <strong>700+ creative signals</strong>
              </button>
              <button type="button" className="xp-film-module xp-distill-module" data-active={film.index === 2} onClick={() => film.choose(2)}>
                <span>MEMORY + RECOMMENDATION</span>
                <div className="xp-neural-cluster"><b>ML</b>{["hook", "tempo", "audio", "style", "caption", "FX"].map((item) => <i key={item}>{item}</i>)}</div>
                <div className="xp-context-files"><i>trend-skill.md</i><i>context.packet.json</i><i>filmora.params</i></div>
              </button>
              <button type="button" className="xp-film-module xp-compiler-module" data-active={film.index === 3} onClick={() => film.choose(3)}>
                <span>SEMANTIC PROMPT COMPILER</span>
                <div><i>user_intent</i><b>+</b><i>trend_context</i><b>+</b><i>production_state</i></div>
                <code>tool_contract → schema-bound instructions</code>
              </button>
              <button type="button" className="xp-film-module xp-agents-module" data-active={film.index === 4} onClick={() => film.choose(4)}>
                <span>MULTI-AGENT ORCHESTRATOR</span>
                <div className="xp-agent-orbit"><b>Planner</b>{["Video API", "Music API", "Dialogue / TTS", "Captions", "Effects", "Editor"].map((item, index) => <i key={item} style={{ "--orbit-index": index } as React.CSSProperties}>{item}</i>)}</div>
                <small>handoffs · checkpoints · approval gates</small>
              </button>
              <button type="button" className="xp-film-module xp-editor-module" data-active={film.index === 5} onClick={() => film.choose(5)}>
                <span>FILMORA EDITOR ASSEMBLY</span>
                <div className="xp-editor-preview"><i /><strong>PRODUCT REVEAL</strong><small>00:08 / 00:18</small></div>
                <div className="xp-editor-tracks"><i>video</i><i>dialogue</i><i>music</i><i>captions + FX</i></div>
              </button>
              <button type="button" className="xp-film-module xp-observe-module" data-active={film.index === 6} onClick={() => film.choose(6)}>
                <span>OBSERVABILITY + EVALUATION</span>
                <div className="xp-trace-line"><i /><i /><i /><i /><i /></div>
                <div><strong>−28%<small>API cost</small></strong><strong>2%<small>orchestration share of E2E latency</small></strong></div>
                <small>tool traces · evals · regressions · guardrails · cost attribution</small>
              </button>
              <div className="xp-film-packet" aria-hidden="true"><i /></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MindScapeCase() {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const mind = useAutoplaySequence(MINDSCAPE_STEPS.length, 4200, ref, reducedMotion);
  const active = MINDSCAPE_STEPS[mind.index];
  const layers = [
    ["L1", "Capture", "WebRTC · 16 kHz"],
    ["L2", "Perceive", "SenseVoice + Emotion2Vec+"],
    ["L3", "Fuse", "Behavioral State Vector"],
    ["L4", "Retrieve", "MedCPT · HNSW · BM25 · RRF"],
    ["L5", "Reason", "Evidence-grounded hypothesis"],
    ["L6", "Validate", "NLI + deterministic rules"],
    ["L7", "Review", "Clinician evidence surface"],
  ] as const;

  return (
    <section ref={ref} id="mindscape" className="xp-case xp-mindscape">
      <div className="xp-section-shell">
        <div className="xp-case-heading">
          <span>03 / MINDSCAPE · MULTIMODAL CLINICAL DECISION SUPPORT</span>
          <h2>From voice and affect to an <em>inspectable clinical evidence trail.</em></h2>
          <p>MindScape is a clinician-support prototype that decomposes a simulated psychiatric conversation into language, events, acoustic affect, retrieved context, structured hypotheses, and visible uncertainty. It does not issue an autonomous diagnosis.</p>
        </div>

        <div className="xp-mind-cinema" data-scene={mind.index}>
          <div className="xp-cinema-bar">
            <div><i className={mind.playing ? "is-live" : ""} /> SEVEN-LAYER SYSTEM EXPLAINER</div>
            <span>IMPLEMENTED, PROTOTYPE, AND TARGET LAYERS REMAIN VISUALLY DISTINCT</span>
            <strong>{String(mind.index + 1).padStart(2, "0")} / 07</strong>
          </div>
          <SequenceControls controller={mind} labels={MINDSCAPE_STEPS.map((step) => step.label)} name="MindScape architecture" />
          <div className="xp-mind-stage">
            <div className="xp-mind-focus"><span>{active.label}</span><h3>{active.title}</h3><p>{[
              "WebRTC audio enters a 500–1000 ms rolling buffer as 16 kHz mono packets.",
              "SenseVoice yields transcripts and event tokens while Emotion2Vec+ models valence and arousal on the synchronized acoustic branch.",
              "Text, event, and affect representations converge through cross-modal gating into a reusable patient-state representation.",
              "The designed hybrid path combines dense semantic retrieval, lexical retrieval, reciprocal-rank fusion, and cross-encoder reranking.",
              "Ranked evidence is mapped to a structured hypothesis, uncertainty, and follow-up questions—without presenting hidden chain-of-thought.",
              "The target safety layer validates support with NLI and deterministic DSM-aligned rules before a confidence gate releases output.",
              "The clinician remains the decision-maker, with evidence, uncertainty, fairness monitoring, and feedback visible together.",
            ][mind.index]}</p></div>
            <div className="xp-mind-pipeline">
              {layers.map(([number, title, detail], index) => (
                <button key={number} type="button" data-active={mind.index === index} data-status={index < 3 || index === 4 ? "implemented" : index === 5 ? "target" : "prototype"} onClick={() => mind.choose(index)}>
                  <span>{number}</span><strong>{title}</strong><small>{detail}</small>
                  {index === 0 ? <div className="xp-mini-wave">{Array.from({ length: 16 }, (_, waveIndex) => <i key={waveIndex} />)}</div> : null}
                  {index === 1 ? <div className="xp-event-row"><i>&lt;silence&gt;</i><i>&lt;breath&gt;</i><i>&lt;laughter&gt;</i></div> : null}
                  {index === 3 ? <div className="xp-rank-row"><i>01</i><i>02</i><i>03</i><i>04</i><i>05</i></div> : null}
                </button>
              ))}
              <div className="xp-bsv-packet" aria-hidden="true">BSV<i /></div>
            </div>
          </div>
          <div className="xp-maturity-legend"><span><i data-status="implemented" />Implemented path</span><span><i data-status="prototype" />Prototype / designed</span><span><i data-status="target" />Target safety layer</span><strong>Decision support—not diagnosis</strong></div>
        </div>
      </div>
    </section>
  );
}

function LogisticsCase() {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const sequence = useAutoplaySequence(3, 3000, ref, reducedMotion);
  const state = sequence.index;
  return (
    <section ref={ref} id="logistics" className="xp-case xp-logistics">
      <div className="xp-section-shell xp-logistics-layout">
        <div className="xp-case-heading">
          <span>04 / LOGISTICS AI OPS · BOUNDED COPILOT</span>
          <h2>Operational AI with <em>explicit authority boundaries.</em></h2>
          <p>Customers track shipments, drivers execute routes, and administrators assign resources. The copilot never receives unrestricted database access: it selects an approved intent, a handler executes a parameterized query, and the model summarizes only returned rows.</p>
          <a href="https://github.com/Yashwant-Bhyri/logistics-company" target="_blank" rel="noreferrer">View repository ↗</a>
        </div>
        <div className="xp-ops-console" data-state={state}>
          <div className="xp-ops-header"><span>CONTROL TOWER / AI OPERATIONS</span><i className={sequence.playing ? "is-live" : ""} /></div>
          <div className="xp-ops-prompt">Which routes are at highest risk today?<i /></div>
          <div className="xp-ops-flow">
            <button type="button" className={state >= 0 ? "is-active" : ""} onClick={() => sequence.choose(0)}><span>01</span><small>CLASSIFY INTENT</small><strong>high_risk_condition_reports</strong></button>
            <button type="button" className={state >= 1 ? "is-active" : ""} onClick={() => sequence.choose(1)}><span>02</span><small>EXECUTE CONTRACT</small><strong>Parameterized query</strong></button>
            <button type="button" className={state >= 2 ? "is-active" : ""} onClick={() => sequence.choose(2)}><span>03</span><small>COMPOSE ANSWER</small><strong>Evidence + next action</strong></button>
          </div>
          <div className={`xp-ops-result ${state === 2 ? "is-visible" : ""}`}><span>ROUTE R-104 · HIGH ATTENTION</span><p>Weather and condition reports indicate elevated delay risk. Review the latest driver report before changing the assignment.</p><small>The model saw returned rows—not the database.</small></div>
        </div>
      </div>
    </section>
  );
}

function ResearchSection() {
  return (
    <section id="research" className="xp-research xp-section-shell">
      <div className="xp-section-heading"><span>05 / RESEARCH & ENGINEERING RECORD</span><h2>Systems work beyond the flagship projects.</h2><p>Research, embedded ML, and evaluation work that shows breadth without hiding the engineering mechanism.</p></div>
      <div className="xp-research-grid">
        {RESEARCH.map((item, index) => <article key={item.title}><span>{String(index + 1).padStart(2, "0")} · {item.meta}</span><h3>{item.title}</h3><p>{item.copy}</p><strong>{item.proof}</strong></article>)}
      </div>
      <div className="xp-profile-strip">
        <div><span>EDUCATION</span><strong>B.Eng. Computer Science & Engineering</strong><p>The Chinese University of Hong Kong, Shenzhen · 2023–2027 · Full Admission Excellence Scholarship</p></div>
        <div><span>FOCUS</span><strong>AI Agent Engineer · AI Application Engineer</strong><p>Also open to applied AI, multimodal systems, AI infrastructure, and solutions architecture roles.</p></div>
        <div className="xp-profile-actions"><a href="/yashwant-bhyri-resume.pdf" target="_blank" rel="noreferrer">Résumé ↗</a><a href="https://github.com/Yashwant-Bhyri" target="_blank" rel="noreferrer">GitHub ↗</a></div>
      </div>
    </section>
  );
}

export function PortfolioExperience() {
  const reducedMotion = useReducedMotion();
  const typed = useTypedIntroduction(reducedMotion);
  const shellRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell || reducedMotion || window.matchMedia("(pointer: coarse)").matches) return;
    let frame = 0;
    const move = (event: PointerEvent) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        shell.style.setProperty("--cursor-x", `${event.clientX}px`);
        shell.style.setProperty("--cursor-y", `${event.clientY}px`);
        frame = 0;
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
    };
  }, [reducedMotion]);

  return (
    <main ref={shellRef} className="xp-shell">
      <div className="xp-cursor-light" aria-hidden="true" />
      <header className="xp-header">
        <a href="#top" className="xp-brand" aria-label="Yashwant Bhyri, home"><span>YB</span><div><strong>Yashwant Bhyri</strong><small>AI agent & application engineer</small></div></a>
        <nav aria-label="Portfolio navigation"><a href="#projects">Projects</a><a href="#research">Research</a><a href="/yashwant-bhyri-resume.pdf" target="_blank" rel="noreferrer">Résumé ↗</a></nav>
        <span className="xp-availability"><i /> Open to 2027 roles</span>
      </header>

      <section id="top" className="xp-hero">
        <GalaxyField />
        <div className="xp-hero-shell">
          <div className="xp-hero-copy">
            <div className="xp-terminal-label"><i /><span>YASHWANT / PERSONAL PORTFOLIO</span><small>{typed.done ? "READY" : "TYPING"}</small></div>
            <h1 aria-label={typed.finalText}><span aria-hidden="true">{typed.text}</span><i className={typed.done ? "is-idle" : ""} aria-hidden="true" /></h1>
            <p>Computer Science &amp; Engineering at CUHK-Shenzhen. I build AI systems that listen, retrieve, reason, create, evaluate, and operate under real constraints—with the engineering left visible.</p>
            <div className="xp-hero-actions">
              <a className="xp-primary-action" href="#projects">Explore my projects <i>↓</i></a>
              <a href="/yashwant-bhyri-resume.pdf" target="_blank" rel="noreferrer">View my résumé ↗</a>
              <a href="https://github.com/Yashwant-Bhyri" target="_blank" rel="noreferrer">Open GitHub ↗</a>
            </div>
            <div className="xp-hero-meta"><span>CUHK-Shenzhen</span><span>B.Eng. CSE · 2027</span><span>Wondershare Filmora · AIGC R&D</span></div>
          </div>
          <HeroProjectDeck reducedMotion={reducedMotion} />
        </div>
        <a className="xp-scroll-cue" href="#projects"><i /> Scroll into the systems</a>
      </section>

      <ProjectIndex />
      <AntigravityCase />
      <FilmoraCase />
      <MindScapeCase />
      <LogisticsCase />
      <ResearchSection />

      <footer className="xp-footer"><div><strong>Yashwant Bhyri</strong><span>AI Agent · AI Application · Applied AI Engineering</span></div><p>Built to show the systems—not just list them.</p><a href="#top">Return to orbit ↑</a></footer>
    </main>
  );
}
