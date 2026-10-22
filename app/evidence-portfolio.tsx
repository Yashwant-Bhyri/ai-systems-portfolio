"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ViewMode = "recruiter" | "engineer";
type CaseLayer = "product" | "runtime" | "evidence";
type ReplaySurface = "interview" | "trace" | "report";

type ReplayCase = {
  case_id: string;
  label: string;
  target_role: string;
  turn_count: number;
  map_available: boolean;
  report_available: boolean;
};

const NAV_ITEMS = [
  { id: "antigravity", label: "Antigravity" },
  { id: "filmora", label: "Filmora" },
  { id: "mindscape", label: "MindScape" },
  { id: "logistics", label: "AI Ops" },
  { id: "profile", label: "Profile" },
] as const;

const TOUR_STOPS = ["top", "antigravity", "filmora", "mindscape", "logistics", "profile"];

const DEMO_STEPS = [
  {
    label: "Candidate claim",
    title: "The candidate describes a system they built.",
    detail:
      "“I designed the orchestration layer that coordinates planning, generation, and editor assembly.”",
  },
  {
    label: "Signal extraction",
    title: "The answer becomes structured evidence.",
    detail: "Concepts, ownership language, implementation specificity, and reasoning evidence are extracted in parallel.",
  },
  {
    label: "Agent analysis",
    title: "Four agents examine a different failure surface.",
    detail: "Concept depth, weakness, résumé discrepancy, and reasoning evidence are compared against the interview map.",
  },
  {
    label: "Routing decision",
    title: "The system chooses what to investigate next.",
    detail: "Ownership remains ambiguous, so the orchestrator selects a targeted ownership probe instead of a generic question.",
  },
  {
    label: "Adaptive follow-up",
    title: "The next question is earned by the previous answer.",
    detail:
      "“Pick one handoff you personally designed. What state crossed that boundary, and how did you recover from a failed tool call?”",
  },
  {
    label: "Hiring evidence",
    title: "The conversation becomes an inspectable decision record.",
    detail: "Claim credibility, engineering signal, coverage, risk, and untested dimensions remain separate—not compressed into one opaque score.",
  },
] as const;

const AGENT_OUTPUTS = [
  { name: "Concept agent", state: "complete", output: "Orchestration · tool routing · state checkpoints" },
  { name: "Weakness agent", state: "attention", output: "Ownership boundary is still ambiguous" },
  { name: "Discrepancy agent", state: "clear", output: "No direct contradiction detected" },
  { name: "Reasoning agent", state: "complete", output: "Concrete mechanism required next" },
] as const;

const REPLAY_TURNS = [
  {
    turn: 2,
    phase: "Project defense",
    route: "Sprint seed",
    focus: "Metric definition",
    question: "A launch dashboard shows a conversion drop. What would you verify before treating it as a real customer-behavior change?",
    answer: "I would compare event versions, cohort definitions, release windows, and the dashboard grain before recommending a product response.",
    concepts: ["event version", "cohort", "release window", "metric grain"],
    weakness: "The validation order is useful, but the candidate has not yet named a decisive test.",
    discrepancy: "No direct conflict",
    reasoning: "Evidence-aware answer · decision threshold required",
    decision: "Probe the instrumentation test",
  },
  {
    turn: 5,
    phase: "Applied engineering",
    route: "Coverage surface",
    focus: "Instrumentation",
    question: "Which query would tell you whether the drop came from the product or from a broken event pipeline?",
    answer: "I would compare raw event counts by client version against warehouse ingestion and inspect the first release where the ratio diverged.",
    concepts: ["raw events", "client version", "warehouse ingestion", "release cohort"],
    weakness: "The query path is concrete, but alert thresholds remain unclear.",
    discrepancy: "Ownership signal uncertain",
    reasoning: "Concrete diagnostic path · ownership probe required",
    decision: "Ask what the candidate personally implemented",
  },
  {
    turn: 6,
    phase: "System design",
    route: "Coverage surface",
    focus: "Experiment design",
    question: "How would you separate a seasonal shift from a release-induced conversion change?",
    answer: "I would use comparable pre-release cohorts, segment by acquisition source, and test whether the change begins at rollout exposure.",
    concepts: ["control cohort", "segmentation", "rollout exposure"],
    weakness: "The comparison is valid, but the stopping rule is not specified.",
    discrepancy: "No direct conflict",
    reasoning: "Confounders recognized · evaluation rule incomplete",
    decision: "Request a falsifiable decision rule",
  },
  {
    turn: 7,
    phase: "Failure analysis",
    route: "Coverage depth probe",
    focus: "Decision communication",
    question: "What would you tell a product lead if the evidence remained inconclusive after the first analysis?",
    answer: "I would separate what is known from what is suspected, recommend a temporary monitoring window, and define the next evidence needed.",
    concepts: ["uncertainty", "monitoring window", "next evidence"],
    weakness: "The communication is calibrated, but the operational owner is not assigned.",
    discrepancy: "No direct conflict",
    reasoning: "Calibrated judgment · execution owner missing",
    decision: "Probe ownership and handoff",
  },
  {
    turn: 12,
    phase: "Evidence check",
    route: "Depth probe",
    focus: "Monitoring evidence",
    question: "Which metric would prove that the instrumentation fix—not ordinary traffic recovery—restored the dashboard?",
    answer: "The raw-to-warehouse event ratio should recover exactly when the corrected client version reaches exposed cohorts, while unaffected events remain stable.",
    concepts: ["event ratio", "client version", "exposed cohort", "control signal"],
    weakness: "The evidence chain is strong; long-term regression monitoring is still untested.",
    discrepancy: "Claim partially substantiated",
    reasoning: "Evidence-based diagnosis · residual monitoring gap",
    decision: "Preserve strength and unresolved risk separately",
  },
] as const;

const REPLAY_REPORT = {
  score: 7.2,
  recommendation: "MAYBE",
  confidence: "Illustrative",
  coverage: "Fictionalized",
  summary: "This synthetic report demonstrates how Antigravity separates observed evidence, uncertainty, coverage, and follow-up needs.",
  strengths: [
    "Tests instrumentation before acting on a metric",
    "Separates evidence from uncertainty",
    "Communicates a concrete diagnostic sequence",
  ],
  risks: [
    "Decision thresholds remain underspecified",
    "Operational ownership needs follow-up",
    "Regression monitoring remains untested",
  ],
  untested: ["SQL execution", "Dashboard implementation", "Stakeholder delivery", "Production monitoring"],
} as const;

const TREND_SOURCES = [
  { name: "TikTok", handle: "For You / Technology", tag: "#productreveal", hook: "Fast product reveal", signal: "beat-led cut" },
  { name: "Douyin / ByteDance", handle: "Creative commerce", tag: "#新品创意", hook: "Detail → full product reveal", signal: "speed ramp · hard light" },
  { name: "Xiaohongshu", handle: "Design discovery", tag: "#数码美学", hook: "Caption-led comparison", signal: "editorial contrast" },
  { name: "Instagram", handle: "Reels / Design", tag: "#productfilm", hook: "Match-cut through use cases", signal: "snap transition · vertical" },
  { name: "WeChat", handle: "Channels / Launches", tag: "#新品首发", hook: "Benefit-led product detail", signal: "voice hook · captions" },
  { name: "Facebook", handle: "Video discovery", tag: "#newtech", hook: "Benefit-led opening", signal: "large type · paced edit" },
] as const;

const FILMORA_SCENES = [
  { label: "Prompt", title: "A creator describes the outcome—not every tool call.", duration: 3400 },
  { label: "Dispatch", title: "The request enters a shared planning state.", duration: 2100 },
  { label: "Research", title: "A trend agent reads creative patterns across representative source adapters.", duration: 5200 },
  { label: "Context", title: "Signals become retrievable production context.", duration: 4400 },
  { label: "Compile", title: "Intent and context compile into schema-bound instructions.", duration: 4000 },
  { label: "Execute", title: "Specialist agents return editable media assets.", duration: 5300 },
  { label: "Assemble", title: "Every output lands on an editor-ready timeline.", duration: 3400 },
  { label: "Evaluate", title: "Traces expose cost, latency, failures, and quality.", duration: 4800 },
] as const;

const MINDSCAPE_SCENES = [
  { label: "Capture", title: "Buffer a simulated 16 kHz voice session.", duration: 3300 },
  { label: "Perceive", title: "Separate words, affect, and paralinguistic events.", duration: 4400 },
  { label: "Fuse", title: "Build a reusable behavioral state representation.", duration: 3800 },
  { label: "Retrieve", title: "Merge semantic and lexical clinical evidence.", duration: 5200 },
  { label: "Reason", title: "Map hypotheses to evidence and uncertainty.", duration: 4400 },
  { label: "Validate", title: "The designed safety layer would gate unsupported results.", duration: 4400 },
  { label: "Review", title: "The designed clinician interface keeps evidence and uncertainty together.", duration: 3800 },
] as const;

const FILMORA_DURATIONS = FILMORA_SCENES.map((item) => item.duration);
const MINDSCAPE_DURATIONS = MINDSCAPE_SCENES.map((item) => item.duration);

const EXPERIENCE = [
  {
    date: "2026",
    role: "AI Agent Development Engineer Intern",
    org: "Wondershare Filmora · R&D, AIGC Algorithms",
    copy: "Built multi-agent orchestration, trend-context packaging, semantic prompt compilation, and workflow observability for editable AIGC media generation.",
  },
  {
    date: "2025",
    role: "AI Model Engineer · Audio Algorithms",
    org: "Optek Microelectronics",
    copy: "Built an audio-classification pipeline for a 700 MHz DSP / 16 MB SoC; achieved 93%+ accuracy, <10 ms latency, and 14× compression through INT8 quantization, pruning, and C++ tuning.",
  },
  {
    date: "2025",
    role: "Research Assistant · Multimodal LLMs",
    org: "HKU × Google Cloud · BIRD-SQL",
    copy: "Rebuilt an OCR-grounded VQA/Text-to-SQL evaluation pipeline for 12,751+ question-SQL pairs across 95+ databases, with schema-aware prompting and execution-accuracy analysis.",
  },
  {
    date: "2024",
    role: "Research Assistant · NLP Benchmark Optimization",
    org: "CUHK-SZ NLP Group",
    copy: "Automated SLM-distillation and LLM-as-judge filtering; reduced factual errors by 31% and built evaluation dashboards across 200+ response pairs.",
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

function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <p className="section-label">
      <span>{index}</span>
      {children}
    </p>
  );
}

function ModeSwitch({ mode, onChange }: { mode: ViewMode; onChange: (mode: ViewMode) => void }) {
  return (
    <div className="mode-switch" aria-label="Portfolio detail level">
      <button
        type="button"
        className={mode === "recruiter" ? "is-active" : ""}
        onClick={() => onChange("recruiter")}
      >
        Recruiter view
      </button>
      <button
        type="button"
        className={mode === "engineer" ? "is-active" : ""}
        onClick={() => onChange("engineer")}
      >
        Engineering view
      </button>
    </div>
  );
}

const TECH_TERMS = [
  ["Agentic systems", 7, 15, 0], ["Multimodal AI", 69, 10, 1], ["Retrieval", 42, 18, 2],
  ["RAG", 85, 26, 0], ["Evaluation", 13, 37, 2], ["Observability", 62, 38, 1],
  ["Tool use", 32, 50, 0], ["Model serving", 79, 52, 2], ["Vector search", 5, 65, 1],
  ["Fine-tuning", 48, 67, 0], ["Guardrails", 88, 72, 1], ["Memory", 25, 79, 2],
  ["Structured outputs", 59, 84, 1], ["Human-in-the-loop", 76, 91, 0], ["Inference", 16, 94, 2],
  ["Data pipelines", 38, 8, 1], ["Embeddings", 93, 42, 2], ["Speech AI", 20, 24, 0],
  ["Computer vision", 52, 30, 2], ["NLP", 36, 91, 1],
] as const;

function AmbientTechField() {
  return (
    <div className="tech-field" aria-hidden="true">
      <div className="tech-field-base">
        {TECH_TERMS.map(([term, x, y, depth], index) => <span key={`${term}-base`} className={`depth-${depth} term-${index}`} style={{ left: `${x}%`, top: `${y}%` }}>{term}</span>)}
      </div>
      <div className="tech-field-reveal">
        {TECH_TERMS.map(([term, x, y, depth], index) => <span key={`${term}-reveal`} className={`depth-${depth} term-${index}`} style={{ left: `${x}%`, top: `${y}%` }}>{term}</span>)}
      </div>
    </div>
  );
}

function useCinematicAutoplay(durations: readonly number[], reducedMotion: boolean, rootRef: React.RefObject<HTMLDivElement | null>) {
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(!reducedMotion);
  const [manual, setManual] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => typeof document === "undefined" ? true : !document.hidden);
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.intersectionRatio >= 0.42), { threshold: [0, 0.42, 0.65] });
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootRef]);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (reducedMotion || manual || !playing || !visible || !pageVisible) return;
    const timer = window.setTimeout(() => {
      if (scene >= durations.length - 1) {
        setPlaying(false);
        return;
      }
      setScene(scene + 1);
    }, durations[scene]);
    return () => window.clearTimeout(timer);
  }, [durations, manual, pageVisible, playing, reducedMotion, scene, visible]);

  const choose = (index: number) => {
    setScene(index);
    setManual(true);
    setPlaying(false);
  };

  const toggle = () => {
    if (reducedMotion) return;
    setManual(false);
    if (!playing && scene >= durations.length - 1) setScene(0);
    setPlaying((value) => !value);
  };

  return { scene, playing: playing && visible && !reducedMotion, choose, toggle, motionDisabled: reducedMotion };
}

function HeroStack({ reducedMotion }: { reducedMotion: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [front, setFront] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reducedMotion || paused) return;
    const timer = window.setTimeout(() => setFront((value) => (value + 1) % 3), 3800);
    return () => window.clearTimeout(timer);
  }, [front, paused, reducedMotion]);

  const move = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion || !rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      rootRef.current.style.setProperty("--hero-rx", `${(-y * 4).toFixed(2)}deg`);
      rootRef.current.style.setProperty("--hero-ry", `${(x * 6).toFixed(2)}deg`);
    },
    [reducedMotion],
  );

  const reset = useCallback(() => {
    rootRef.current?.style.setProperty("--hero-rx", "0deg");
    rootRef.current?.style.setProperty("--hero-ry", "0deg");
  }, []);

  return (
    <div ref={rootRef} className="hero-stack" onPointerMove={move} onPointerLeave={() => { reset(); setPaused(false); }} onPointerEnter={() => setPaused(true)}>
      <div className="hero-stack-context"><span>Antigravity</span><strong>A real-time technical interviewing platform</strong><small>Listen → investigate → report</small></div>
      <div className="hero-stack-grid" />
      {[0, 1, 2].map((item) => {
        const position = (item - front + 3) % 3;
        return (
          <a key={item} href="/antigravity-experience" className={`stack-card stack-position-${position}`} onFocus={() => { setPaused(true); setFront(item); }}>
            {item === 0 ? <><span>01 / LIVE CONVERSATION</span><strong>Listen and extract evidence</strong><div className="stack-wave" aria-hidden="true">{Array.from({ length: 22 }, (_, index) => <i key={index} />)}</div><p>Voice answer → transcript → structured signals</p></> : null}
            {item === 1 ? <><span>02 / ADAPTIVE ROUTING</span><strong>Investigate what remains unclear</strong><p>Ownership probe selected from the answer—not a fixed script.</p><div className="stack-agent-row"><span>Concept</span><span>Weakness</span><span>Reasoning</span></div></> : null}
            {item === 2 ? <><span>03 / HIRING REPORT</span><strong>Preserve evidence and uncertainty</strong><div className="mini-bars"><i style={{ width: "78%" }} /><i style={{ width: "62%" }} /><i style={{ width: "88%" }} /></div><p>Strengths · risks · coverage · untested areas</p></> : null}
          </a>
        );
      })}
      <div className="stack-pagination">{[0, 1, 2].map((item) => <button type="button" key={item} className={front === item ? "is-active" : ""} onClick={() => { setFront(item); setPaused(true); }} aria-label={`Show Antigravity stage ${item + 1}`} />)}</div>
    </div>
  );
}

function GuidedReview({
  running,
  index,
  onStart,
  onStop,
}: {
  running: boolean;
  index: number;
  onStart: () => void;
  onStop: () => void;
}) {
  const progress = running ? ((index + 1) / TOUR_STOPS.length) * 100 : 0;
  return (
    <aside className={`guided-review ${running ? "is-running" : ""}`} aria-live="polite">
      <div className="guided-progress"><i style={{ width: `${progress}%` }} /></div>
      <div>
        <span>{running ? `Guided review · ${String(index + 1).padStart(2, "0")}/${String(TOUR_STOPS.length).padStart(2, "0")}` : "Recruiter walkthrough"}</span>
        <strong>{running ? "Moving through the engineering record" : "Let the portfolio present itself"}</strong>
      </div>
      <button type="button" onClick={running ? onStop : onStart}>
        {running ? "Pause" : "Start · 45 sec"}
      </button>
    </aside>
  );
}

// Retained as the presentation adapter for a future sanitized saved-artifact route.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ReplayStatus({ cases, connected }: { cases: ReplayCase[]; connected: boolean }) {
  const summary = useMemo(() => {
    if (!cases.length) return { total: 13, turns: 7, reports: 6 };
    let turns = 0;
    let reports = 0;
    for (const item of cases) {
      if (item.turn_count > 0) turns += 1;
      if (item.report_available) reports += 1;
    }
    return { total: cases.length, turns, reports };
  }, [cases]);

  return (
    <div className="replay-status">
      <div className="replay-status-head">
        <span><i className={connected ? "is-live" : ""} /> Runtime replay library</span>
        <small>{connected ? "Connected locally" : "Prototype dataset"}</small>
      </div>
      <div className="replay-stats">
        <div><strong>{summary.total}</strong><span>Saved cases</span></div>
        <div><strong>{summary.turns}</strong><span>Turn replays</span></div>
        <div><strong>{summary.reports}</strong><span>Full reports</span></div>
      </div>
    </div>
  );
}

// Retained until the real Antigravity report components replace this local fallback.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function AntigravityReplayWorkspace({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [surface, setSurface] = useState<ReplaySurface>("interview");
  const [turnIndex, setTurnIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reportState, setReportState] = useState<"ready" | "generating" | "complete">("ready");
  const current = REPLAY_TURNS[turnIndex];
  const closeWorkspace = useCallback(() => {
    setPlaying(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setTurnIndex((value) => {
        if (value >= REPLAY_TURNS.length - 1) {
          window.clearInterval(timer);
          setPlaying(false);
          return value;
        }
        return value + 1;
      });
    }, 3200);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeWorkspace();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [closeWorkspace, open]);

  const generateReport = () => {
    setReportState("generating");
    window.setTimeout(() => {
      setReportState("complete");
      setSurface("report");
    }, 1500);
  };

  if (!open) return null;

  return (
    <div className="replay-overlay" role="dialog" aria-modal="true" aria-label="Antigravity fictionalized interview walkthrough">
      <div className="replay-workspace">
        <header className="workspace-topbar">
          <div>
            <span className="workspace-brand"><i /> ANTIGRAVITY</span>
            <small>Public product walkthrough · fictionalized scenario</small>
          </div>
          <div className="workspace-top-actions">
            <span>Zero live model calls</span>
            <button type="button" onClick={closeWorkspace} aria-label="Close replay workspace">Close ×</button>
          </div>
        </header>

        <div className="workspace-grid">
          <aside className="workspace-sidebar">
            <div className="candidate-card">
              <span>Candidate 042</span>
              <strong>Product analyst · fictionalized</strong>
              <small>Synthetic evaluation · 5 illustrative turns</small>
            </div>
            <nav aria-label="Replay workspace views">
              {(["interview", "trace", "report"] as ReplaySurface[]).map((item, index) => (
                <button
                  key={item}
                  type="button"
                  className={surface === item ? "is-active" : ""}
                  onClick={() => setSurface(item)}
                >
                  <i>{String(index + 1).padStart(2, "0")}</i>
                  <span>{item === "interview" ? "Interview room" : item === "trace" ? "Agent trace" : "Hiring report"}</span>
                </button>
              ))}
            </nav>
            <div className="trajectory-mini">
              <span>Interview trajectory</span>
              {["Metric definition", "Instrumentation", "Experiment design", "Decision communication", "Monitoring evidence"].map((item, index) => (
                <button
                  key={item}
                  type="button"
                  className={turnIndex === index ? "is-active" : index < turnIndex ? "is-done" : ""}
                  onClick={() => { setTurnIndex(index); setPlaying(false); }}
                >
                  <i />{item}
                </button>
              ))}
            </div>
          </aside>

          <main className="workspace-main">
            {surface === "interview" ? (
              <div className="workspace-interview">
                <div className="room-status">
                  <span><i /> Fictionalized voice-room walkthrough</span>
                  <small>Turn {current.turn} · {current.phase}</small>
                </div>
                <div className="room-question">
                  <div className="interviewer-mark"><i /><i /><i /></div>
                  <div><span>Antigravity asks</span><h3>{current.question}</h3></div>
                </div>
                <div className="room-answer">
                  <div className="candidate-avatar">C42</div>
                  <div><span>Synthetic transcript</span><p>{current.answer}</p></div>
                </div>
                <div className="workspace-playback">
                  <button type="button" onClick={() => setPlaying((value) => !value)}>{playing ? "Pause" : "Play replay"}</button>
                  <div className="playback-track">
                    {REPLAY_TURNS.map((item, index) => <button key={item.turn} type="button" className={index <= turnIndex ? "is-active" : ""} onClick={() => { setTurnIndex(index); setPlaying(false); }} aria-label={`Replay turn ${item.turn}`}><i /></button>)}
                  </div>
                  <span>{String(turnIndex + 1).padStart(2, "0")} / {String(REPLAY_TURNS.length).padStart(2, "0")}</span>
                </div>
              </div>
            ) : null}

            {surface === "trace" ? (
              <div className="workspace-trace">
                <div className="trace-heading"><span>Multi-agent answer analysis</span><h3>One answer. Four independent evidence surfaces.</h3><small>Turn {current.turn} · {current.focus}</small></div>
                <div className="trace-flow">
                  <article><span>01 · Concepts</span><div>{current.concepts.map((item) => <i key={item}>{item}</i>)}</div><strong>Extracted in parallel</strong></article>
                  <article><span>02 · Weakness</span><p>{current.weakness}</p><strong>Probe required</strong></article>
                  <article><span>03 · Discrepancy</span><p>{current.discrepancy}</p><strong>Claim ledger preserved</strong></article>
                  <article><span>04 · Reasoning</span><p>{current.reasoning}</p><strong>Behavioural signal</strong></article>
                </div>
                <div className="trace-route"><span>Orchestrator route</span><strong>{current.decision}</strong><small>{current.route} → next-question compiler</small></div>
              </div>
            ) : null}

            {surface === "report" ? (
              <div className="workspace-report">
                {reportState !== "complete" ? (
                  <div className={`report-generator ${reportState === "generating" ? "is-generating" : ""}`}>
                    <span>Multi-pass report assembly</span>
                    <h3>{reportState === "generating" ? "Separating evidence, confidence, coverage, and risk…" : "Generate the hiring intelligence report."}</h3>
                    <div className="generation-passes"><i>Evidence ledger</i><i>Coverage portrait</i><i>Verdict calibration</i><i>Untested dimensions</i></div>
                    <button type="button" onClick={generateReport} disabled={reportState === "generating"}>{reportState === "generating" ? "Generating report…" : "Generate illustrative report"}</button>
                  </div>
                ) : (
                  <div className="final-report">
                    <div className="report-verdict">
                      <div><span>Recommendation</span><strong>{REPLAY_REPORT.recommendation}</strong><small>{REPLAY_REPORT.confidence} confidence</small></div>
                      <div className="score-ring"><strong>{REPLAY_REPORT.score}</strong><span>/ 10</span></div>
                      <div><span>Coverage</span><strong>{REPLAY_REPORT.coverage}</strong><small>Expected dimensions addressed</small></div>
                    </div>
                    <p className="report-summary">{REPLAY_REPORT.summary}</p>
                    <div className="report-columns">
                      <article><span>Strengths</span>{REPLAY_REPORT.strengths.map((item) => <p key={item}><i />{item}</p>)}</article>
                      <article><span>Risk flags</span>{REPLAY_REPORT.risks.map((item) => <p key={item}><i />{item}</p>)}</article>
                      <article><span>Explicitly untested</span>{REPLAY_REPORT.untested.map((item) => <p key={item}><i />{item}</p>)}</article>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </main>

          <aside className="workspace-inspector">
            <span>Evidence inspector</span>
            <div><small>Current focus</small><strong>{current.focus}</strong></div>
            <div><small>Route kind</small><strong>{current.route}</strong></div>
            <div><small>Evidence state</small><strong>{turnIndex === REPLAY_TURNS.length - 1 ? "Partially substantiated" : "Probe required"}</strong></div>
            <div className="inspector-boundary"><small>System boundary</small><p>This public walkthrough uses synthetic content. It does not call an LLM, load saved artifacts, or evaluate a real applicant.</p></div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function AntigravityCase({ mode }: { mode: ViewMode }) {
  const [layer, setLayer] = useState<CaseLayer>(mode === "engineer" ? "runtime" : "product");
  const [demoStep, setDemoStep] = useState(0);
  const [demoRunning, setDemoRunning] = useState(false);

  useEffect(() => {
    if (!demoRunning) return;
    let nextStep = 0;
    const timer = window.setInterval(() => {
      nextStep += 1;
      setDemoStep(nextStep);
      if (nextStep >= DEMO_STEPS.length - 1) {
        window.clearInterval(timer);
        setDemoRunning(false);
      }
    }, 2100);
    return () => window.clearInterval(timer);
  }, [demoRunning]);

  const runDemo = () => {
    setDemoStep(0);
    setDemoRunning(true);
  };

  return (
    <section id="antigravity" className="case-section case-antigravity" data-tour-stop>
      <div className="section-shell">
        <div className="case-intro reveal-block">
          <SectionLabel index="01">Antigravity · AI-native technical interviewing platform</SectionLabel>
          <h2>A real-time AI interviewer that turns candidate answers into <em>evidence.</em></h2>
          <p className="case-lead">
            Antigravity prepares a role-specific interview map from a candidate’s résumé, runs a live voice interview,
            adapts follow-ups to each answer, and produces a report that separates demonstrated strengths, risks,
            coverage, and untested areas. It has generated reports for 250+ candidates and hiring teams.
          </p>
          <div className="case-actions">
            <button type="button" className="button-primary" onClick={runDemo}>
              {demoRunning ? "Simulation running" : "Run the 12-second simulation"}
            </button>
            <a className="button-secondary" href="/antigravity-experience">Launch full product walkthrough ↗</a>
          </div>
          <p className="local-note">Built from Antigravity’s existing interactive visualizer. It replays a fictionalized scenario with zero live model calls and no applicant data. Antigravity supports technical screening; the hiring team owns every employment decision.</p>
        </div>

        <div className="case-stage reveal-block">
          <div className="case-window">
            <div className="case-window-bar">
              <div><i /><i /><i /></div>
              <span>ANTIGRAVITY / INTERVIEW RUNTIME</span>
              <small>Illustrative replay</small>
            </div>
            <div className="layer-tabs" role="tablist" aria-label="Antigravity case study layers">
              {(["product", "runtime", "evidence"] as CaseLayer[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={layer === item}
                  className={layer === item ? "is-active" : ""}
                  onClick={() => setLayer(item)}
                >
                  {item === "product" ? "01 Product" : item === "runtime" ? "02 Runtime" : "03 Evidence"}
                </button>
              ))}
            </div>

            {layer === "product" ? (
              <div className="product-layer layer-panel">
                <div className="interview-context">
                  <div><span>Target role</span><strong>AI Application Engineer</strong></div>
                  <div><span>Interview sprint</span><strong>Project Defense</strong></div>
                  <div><span>Question</span><strong>04 / 15</strong></div>
                </div>
                <div className="conversation-stage">
                  <div className="interviewer-orb"><i /><i /><i /></div>
                  <div className="conversation-copy">
                    <span>Antigravity asks</span>
                    <h3>{DEMO_STEPS[Math.min(demoStep, DEMO_STEPS.length - 1)].title}</h3>
                    <p>{DEMO_STEPS[Math.min(demoStep, DEMO_STEPS.length - 1)].detail}</p>
                  </div>
                </div>
                <div className="demo-timeline">
                  {DEMO_STEPS.map((step, index) => (
                    <button
                      key={step.label}
                      type="button"
                      className={index <= demoStep ? "is-complete" : ""}
                      onClick={() => { setDemoRunning(false); setDemoStep(index); }}
                      aria-label={`Show ${step.label}`}
                    >
                      <i />
                      <span>{step.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {layer === "runtime" ? (
              <div className="runtime-layer layer-panel">
                <div className="runtime-map">
                  <div className="runtime-source">
                    <span>Accepted answer</span>
                    <strong>Turn 04</strong>
                  </div>
                  <div className="runtime-lines" aria-hidden="true"><i /><i /><i /><i /></div>
                  <div className="agent-grid">
                    {AGENT_OUTPUTS.map((agent) => (
                      <article key={agent.name} className={`agent-card state-${agent.state}`}>
                        <div><i /><span>{agent.name}</span></div>
                        <p>{agent.output}</p>
                      </article>
                    ))}
                  </div>
                  <div className="route-decision">
                    <span>Orchestrator decision</span>
                    <strong>Ownership probe</strong>
                    <small>Selected from evidence, not a fixed script</small>
                  </div>
                </div>
              </div>
            ) : null}

            {layer === "evidence" ? (
            <div className="evidence-layer layer-panel">
                <div className="report-head">
                  <div>
                    <span>Interview evidence report</span>
                    <h3>What was demonstrated—and what remains untested.</h3>
                  </div>
                  <b>REPORT / 04</b>
                </div>
                <div className="evidence-ledger">
                  <article><span>Engineering signal</span><strong>Architecture ownership</strong><p>One component boundary substantiated; failure recovery still under test.</p></article>
                  <article><span>Claim credibility</span><strong>Evidence required</strong><p>The system preserves the claim and the unresolved question separately.</p></article>
                  <article><span>Coverage</span><strong>4 dimensions tested</strong><p>Project depth, fundamentals, trade-offs, and operational reasoning.</p></article>
                  <article><span>Untested</span><strong>Explicitly retained</strong><p>Coding performance is not inferred from a voice conversation.</p></article>
                </div>
              </div>
            ) : null}
          </div>

          <div className="replay-status">
            <div className="replay-status-head"><span><i /> Product evidence</span><small>Public walkthrough uses fictionalized data</small></div>
            <div className="replay-stats"><div><strong>250+</strong><span>Candidate reports</span></div><div><strong>4</strong><span>Evaluation modules</span></div><div><strong>0</strong><span>Applicant records exposed</span></div></div>
          </div>
        </div>

        <div className="ownership-strip reveal-block">
          <span>What I built</span>
          <p>Async interview runtime · résumé-grounded interview maps · adaptive question routing · multi-agent answer analysis · voice interaction · replay infrastructure · report-generation pipeline</p>
        </div>
      </div>
    </section>
  );
}

function FilmoraCase({ mode }: { mode: ViewMode }) {
  const reducedMotion = useReducedMotion();
  const filmRef = useRef<HTMLDivElement>(null);
  const film = useCinematicAutoplay(FILMORA_DURATIONS, reducedMotion, filmRef);
  const sceneState = (target: number) => target === film.scene ? "active" : Math.abs(target - film.scene) <= 1 ? "adjacent" : "distant";
  const scene = FILMORA_SCENES[film.scene];

  return (
    <section id="filmora" className="case-section case-filmora" data-tour-stop>
      <div className="section-shell">
        <div className="split-heading reveal-block">
          <div>
            <SectionLabel index="02">Wondershare Filmora · AI Agent Development Engineer Intern</SectionLabel>
            <h2>I built the orchestration layer that turns one media brief into an <em>editable multimodal production graph.</em></h2>
          </div>
          <p>
            The workflow combines user intent with trend-agent context, compiles both into schema-bound tool instructions,
            and coordinates video, music, dialogue, captions, effects, and editor assembly with checkpoints and human approval gates.
          </p>
        </div>

        <div ref={filmRef} className="filmora-cinema reveal-block" data-scene={film.scene}>
          <div className="cinema-topbar">
            <div><i className={film.playing ? "is-live" : ""} /> FILMORA / AIGC PRODUCTION FILM</div>
            <span>Illustrative system view · confidential internals abstracted</span>
            <button type="button" onClick={film.toggle} disabled={film.motionDisabled}>{film.motionDisabled ? "Reduced motion" : film.playing ? "Pause" : "Play sequence"}</button>
          </div>

          <div className="cinema-rail" role="group" aria-label="Filmora system scenes">
            {FILMORA_SCENES.map((item, index) => <button key={item.label} type="button" aria-pressed={film.scene === index} className={film.scene === index ? "is-active" : index < film.scene ? "is-past" : ""} onClick={() => film.choose(index)}><i>{String(index + 1).padStart(2, "0")}</i><span>{item.label}</span></button>)}
          </div>

          <div className="cinema-viewport">
            <div className="cinema-map" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
            <button type="button" className="cinema-module prompt-scene" data-scene-state={sceneState(film.scene <= 1 ? film.scene : 0)} onClick={() => film.choose(0)}>
              <span className="cinema-kicker">01 · CREATIVE BRIEF</span>
              <strong>Create a launch reel for a foldable phone—premium, kinetic, and native to short-form video.</strong>
              <span className="prompt-submit">Send request <i>→</i></span>
            </button>

            <div className={`request-capsule request-position-${film.scene}`} aria-hidden="true"><i /> creative_request</div>

            <button type="button" className="cinema-module research-scene" data-scene-state={sceneState(2)} onClick={() => film.choose(2)}>
              <span className="cinema-kicker">02 · TREND RESEARCH AGENT <small>Illustrative creative signals</small></span>
              <div className="reel-lanes">
                {TREND_SOURCES.map((source, index) => <div className={`reel-lane lane-${index}`} key={source.name}><b>{source.name}</b><div className="reel-strip"><i><em>{source.tag}</em><small>{source.hook}</small></i><i><em>{source.signal}</em><small>hook · caption · transition</small></i><i><em>{source.handle}</em><small>audio · palette · tempo</small></i></div></div>)}
              </div>
              <div className="signal-chips"><i>hook</i><i>audio</i><i>palette</i><i>tempo</i><i>caption</i><i>transition</i></div>
              <div className="signal-total"><strong>700+</strong><span>real-time creative signals operationalized</span></div>
            </button>

            <button type="button" className="cinema-module context-scene" data-scene-state={sceneState(3)} onClick={() => film.choose(3)}>
              <span className="cinema-kicker">03 · CONTEXT + RECOMMENDATION</span>
              <div className="context-network"><i>hook</i><i>audio</i><i>style</i><b>ML<br />recommend</b><i>caption</i><i>tempo</i><i>FX</i></div>
              <div className="context-methods"><span>Semantic memory</span><span>ML recommendation</span><span>Creative-quality ranking</span></div>
              <div className="context-assets"><i>Context packet</i><i>Trend skill</i><i>Design guidance</i><i>Filmora parameters</i></div>
            </button>

            <button type="button" className="cinema-module compiler-scene" data-scene-state={sceneState(4)} onClick={() => film.choose(4)}>
              <span className="cinema-kicker">04 · SEMANTIC PROMPT COMPILER</span>
              <div className="compiler-inputs"><i>User intent</i><b>+</b><i>Trend context</i><b>+</b><i>Production constraints</i><b>+</b><i>Prior agent state</i></div>
              <div className="schema-contract"><span>EXECUTABLE PRODUCTION CONTRACT</span><code>opening_hook: creative direction</code><code>visual_direction: style + transition</code><code>audio_direction: music + dialogue</code><code>required_assets: video · audio · captions · FX</code></div>
            </button>

            <button type="button" className="cinema-module agents-scene" data-scene-state={sceneState(5)} onClick={() => film.choose(5)}>
              <span className="cinema-kicker">05 · MULTI-AGENT EXECUTION</span>
              <div className="planner-core"><i /><strong>Planner + shared state</strong><small>checkpoints · schemas · handoffs</small></div>
              <div className="agent-orbit">{["Video generation", "Music generation", "Dialogue / TTS", "Captions", "Effects", "Editor assembly"].map((item, index) => <i key={item} style={{ "--agent-index": index } as React.CSSProperties}><b>{String(index + 1).padStart(2, "0")}</b>{item}<small>tool call ↔ asset</small></i>)}</div>
              <div className="approval-gate">Human approval / regenerate gate</div>
            </button>

            <button type="button" className="cinema-module editor-scene" data-scene-state={sceneState(6)} onClick={() => film.choose(6)}>
              <span className="cinema-kicker">06 · EDITOR ASSEMBLY</span>
              <div className="asset-deck">{["Video asset", "Music asset", "Dialogue asset", "Caption track", "Effects parameters"].map((item, index) => <i key={item} style={{ "--asset-index": index } as React.CSSProperties}>{item}</i>)}</div>
              <div className="editor-timeline"><span><i />video</span><span><i />dialogue</span><span><i />music</span><span><i />captions + FX</span></div>
            </button>

            <button type="button" className="cinema-module observe-scene" data-scene-state={sceneState(7)} onClick={() => film.choose(7)}>
              <span className="cinema-kicker">07 · OBSERVABILITY + EVALUATION</span>
              <div className="cinema-traces"><i>trend agent</i><i>context compile</i><i>generation tools</i><i>editor assembly</i></div>
              <div className="cinema-metrics"><span><strong>−28%</strong>API cost after trace-led optimization</span><span><strong>2%</strong>orchestration share of E2E latency</span></div>
              <div className="eval-signals"><i>agent evals</i><i>tool-call traces</i><i>guardrail events</i><i>regression tests</i><i>cost attribution</i></div>
            </button>
          </div>

          <div className="cinema-caption" aria-live={film.playing ? "off" : "polite"}><span>{String(film.scene + 1).padStart(2, "0")} / {String(FILMORA_SCENES.length).padStart(2, "0")}</span><div><strong>{scene.title}</strong><p>{mode === "engineer" ? [
            "The accessible request remains intact while the visual layer reveals it as a typed brief.",
            "The planner creates research and production branches against one recoverable shared state.",
            "The trend agent converts audio patterns, hooks, styles, palettes, captions, transitions, and effects into reusable context.",
            "Semantic retrieval and ML recommendation package volatile creative signals for reuse downstream.",
            "The compiler is the interoperability boundary: schema-bound contracts turn context into executable tool instructions.",
            "Tool routing, handoffs, checkpoints, prompt versions, and approval gates keep a long-running graph recoverable.",
            "Generated media remains editable because each returned asset is assembled into Filmora-native timeline parameters.",
            "Tool-call, handoff, latency, error, evaluation, and cost traces exposed where the workflow spent time and API budget.",
          ][film.scene] : "One request moves through research, context, execution, editor assembly, and measurable runtime feedback."}</p></div><div className="cinema-next"><button type="button" onClick={() => film.choose((film.scene - 1 + FILMORA_SCENES.length) % FILMORA_SCENES.length)}>←</button><button type="button" onClick={() => film.choose((film.scene + 1) % FILMORA_SCENES.length)}>→</button></div></div>
        </div>

        <div className="contextual-proof reveal-block">
          <button type="button" onClick={() => film.choose(2)}><span>Trend research surface</span><strong>700+ creative signals</strong><p>Audio patterns, hooks, styles, palettes, transitions, captions, and effects became reusable production context.</p></button>
          <button type="button" onClick={() => film.choose(7)}><span>What observability changed</span><strong>28% lower API cost</strong><p>Tracing tool calls, handoffs, latency, failures, and spend exposed where the workflow could be optimized.</p></button>
          <div><span>Runtime constraint</span><strong>2% orchestration overhead</strong><p>Coordination stayed small relative to long-running end-to-end media generation.</p></div>
        </div>
      </div>
    </section>
  );
}

function MindScapeCase({ mode }: { mode: ViewMode }) {
  const reducedMotion = useReducedMotion();
  const mindRef = useRef<HTMLDivElement>(null);
  const mind = useCinematicAutoplay(MINDSCAPE_DURATIONS, reducedMotion, mindRef);
  const layerStatus = ["implemented", "implemented", "implemented", "prototype", "implemented", "target", "prototype"] as const;
  const sceneDetail = [
    "WebRTC audio enters a 500–1000 ms rolling buffer as 16 kHz mono packets.",
    "SenseVoice produces transcript and event tokens while Emotion2Vec+ models acoustic affect on a synchronized branch.",
    "Text, event, and affect representations converge through a cross-modal gate into a Behavioral State Vector.",
    "The designed retrieval layer combines MedCPT + HNSW semantic search with BM25 lexical retrieval, reciprocal-rank fusion, and BioLinkBERT reranking.",
    "Top-ranked evidence is mapped to structured hypotheses, uncertainty, and follow-up questions—without exposing private chain-of-thought.",
    "In the target architecture, DeBERTa-v3 NLI and deterministic DSM-5 rules would validate support before a confidence gate releases the output.",
    "The designed clinician interface brings evidence, uncertainty, follow-ups, fairness monitoring, and clinician feedback into one review surface.",
  ] as const;

  return (
    <section id="mindscape" className="case-section case-mindscape" data-tour-stop>
      <div className="section-shell">
        <div className="split-heading reveal-block">
          <div>
            <SectionLabel index="03">MindScape · Multimodal clinical decision-support prototype</SectionLabel>
            <h2>Patient language, vocal affect, and retrieved clinical evidence remain visible in <em>one inspectable evidence trail.</em></h2>
          </div>
          <p>
            MindScape transcribes a simulated session, extracts paralinguistic events and acoustic-affect features,
            retrieves clinical context, and generates a clinician-facing hypothesis with visible supporting evidence. It is decision support—not diagnosis.
          </p>
        </div>

        <div ref={mindRef} className="mindscape-cinema reveal-block" data-scene={mind.scene}>
          <div className="cinema-topbar">
            <div><i className={mind.playing ? "is-live" : ""} /> MINDSCAPE / DESIGNED ARCHITECTURE</div>
            <span>Simulated input · clinician-support prototype · not autonomous diagnosis</span>
            <button type="button" onClick={mind.toggle} disabled={mind.motionDisabled}>{mind.motionDisabled ? "Reduced motion" : mind.playing ? "Pause" : "Play sequence"}</button>
          </div>
          <div className="cinema-rail mind-rail" role="group" aria-label="MindScape architecture layers">
            {MINDSCAPE_SCENES.map((item, index) => <button key={item.label} type="button" aria-pressed={mind.scene === index} data-status={layerStatus[index]} className={mind.scene === index ? "is-active" : index < mind.scene ? "is-past" : ""} onClick={() => mind.choose(index)}><i>{String(index + 1).padStart(2, "0")}</i><span>{item.label}</span></button>)}
          </div>

          <div className="mind-architecture">
            <div className="mind-packet" aria-hidden="true" style={{ "--mind-step": mind.scene } as React.CSSProperties}>BSV</div>
            <button type="button" className="mind-layer capture-layer" data-status={layerStatus[0]} data-active={mind.scene === 0} onClick={() => mind.choose(0)}><span>L1 · CLIENT CAPTURE</span><strong>WebRTC audio</strong><small>16 kHz mono · rolling buffer</small><div className="mini-wave">{Array.from({ length: 20 }, (_, index) => <i key={index} />)}</div></button>
            <button type="button" className="mind-layer perceive-layer" data-status={layerStatus[1]} data-active={mind.scene === 1} onClick={() => mind.choose(1)}><span>L2 · MULTIMODAL PERCEPTION</span><div><i><b>SenseVoice</b><small>ASR + event tokens</small></i><i><b>Emotion2Vec+</b><small>valence + arousal</small></i></div></button>
            <button type="button" className="mind-layer fusion-layer" data-status={layerStatus[2]} data-active={mind.scene === 2} onClick={() => mind.choose(2)}><span>L3 · BEHAVIORAL STATE FUSION</span><div className="fusion-inputs"><i>MedCPT text</i><i>event vector</i><i>affect embedding</i></div><strong>Cross-modal attention gate</strong><small>→ Behavioral State Vector</small></button>
            <button type="button" className="mind-layer retrieval-layer" data-status={layerStatus[3]} data-active={mind.scene === 3} onClick={() => mind.choose(3)}><span>L4 · HYBRID CLINICAL RETRIEVAL</span><div className="dual-retrieval"><i><b>MedCPT → HNSW</b><small>semantic path</small></i><i><b>BM25</b><small>lexical path · active MVP</small></i></div><strong>RRF → BioLinkBERT rerank</strong><div className="evidence-rank"><i>01</i><i>02</i><i>03</i><i>04</i><i>05</i></div></button>
            <button type="button" className="mind-layer reason-layer" data-status={layerStatus[4]} data-active={mind.scene === 4} onClick={() => mind.choose(4)}><span>L5 · GROUNDED REASONING</span><strong>Evidence → structured hypothesis</strong><div><i>supporting evidence</i><i>uncertainty</i><i>follow-up questions</i></div><small>Concise rationale summaries—not hidden chain-of-thought</small></button>
            <button type="button" className="mind-layer safety-layer" data-status={layerStatus[5]} data-active={mind.scene === 5} onClick={() => mind.choose(5)}><span>L6 · TARGET SAFETY GATE</span><div><i><b>DeBERTa-v3</b><small>NLI verifier</small></i><i><b>DSM-5 rules</b><small>deterministic gate</small></i></div><strong>Designed confidence gate: green / amber / reject</strong></button>
            <button type="button" className="mind-layer clinician-layer" data-status={layerStatus[6]} data-active={mind.scene === 6} onClick={() => mind.choose(6)}><span>L7 · DESIGNED CLINICIAN INTERFACE</span><div className="clinician-screen"><i>Hypothesis</i><i>Evidence</i><i>Uncertainty</i><i>Follow-ups</i></div><strong>Fairness monitor ↔ clinician feedback</strong></button>

            <div className="mind-focus-card">
              <span>{String(mind.scene + 1).padStart(2, "0")} / 07 · {MINDSCAPE_SCENES[mind.scene].label}</span>
              <h3>{MINDSCAPE_SCENES[mind.scene].title}</h3>
              <p>{sceneDetail[mind.scene]}</p>
              {mind.scene === 1 ? <div className="event-tokens"><i>&lt;crying&gt;</i><i>&lt;coughing&gt;</i><i>&lt;laughter&gt;</i><i>&lt;breathing&gt;</i><i>&lt;silence&gt;</i></div> : null}
              {mind.scene === 6 ? <div className="clinical-boundary">Evidence remains inspectable. The interface does not issue an autonomous diagnosis.</div> : null}
              <div className="cinema-next"><button type="button" onClick={() => mind.choose((mind.scene - 1 + MINDSCAPE_SCENES.length) % MINDSCAPE_SCENES.length)}>←</button><button type="button" onClick={() => mind.choose((mind.scene + 1) % MINDSCAPE_SCENES.length)}>→</button></div>
            </div>
          </div>
        </div>

        <div className="truth-boundary reveal-block">
          <div><span><i className="status-solid" /> Current MVP path</span><p>Audio/event extraction · Emotion2Vec+ · multimodal context · BM25 clinical retrieval · evidence-grounded synthesis · visible evidence</p></div>
          <div><span><i className="status-outline" /> Designed / prototype layers</span><p>{mode === "engineer" ? "The codebase includes dense-retrieval and NLI-verification paths, but the current MVP runs BM25-only retrieval and skips NLI for runtime performance." : "The full architecture is visible, while prototype and target layers are deliberately styled differently from the active MVP path."}</p></div>
        </div>
      </div>
    </section>
  );
}

function LogisticsCase({ mode }: { mode: ViewMode }) {
  const [queryState, setQueryState] = useState<"idle" | "classified" | "executed">("idle");

  const runQuery = () => {
    setQueryState("classified");
    window.setTimeout(() => setQueryState("executed"), 900);
  };

  return (
    <section id="logistics" className="case-section case-logistics" data-tour-stop>
      <div className="section-shell">
        <div className="split-heading reveal-block">
          <div>
            <SectionLabel index="04">Logistics AI Ops Platform · role-based operations + bounded copilot</SectionLabel>
            <h2>A logistics copilot that can query operations data only through <em>approved routes.</em></h2>
          </div>
          <p>
            Customers create and track shipments, drivers execute routes and submit condition reports, and administrators assign resources.
            The copilot classifies questions into whitelisted intents; handlers run parameterized queries; the model summarizes only returned facts.
          </p>
        </div>

        <div className="ops-console reveal-block">
          <div className="ops-sidebar">
            <strong>CONTROL TOWER</strong>
            {['Overview', 'Routes', 'Drivers', 'Conditions', 'AI Operations'].map((item, index) => <span key={item} className={index === 4 ? 'is-active' : ''}>{item}<i /></span>)}
          </div>
          <div className="ops-main">
            <div className="ops-query">
              <span>Operations copilot</span>
              <p>Which routes are at highest risk today, and what should dispatch investigate first?</p>
              <button type="button" onClick={runQuery}>{queryState === "idle" ? "Run bounded query" : queryState === "classified" ? "Classifying intent…" : "Run again"}</button>
            </div>
            <div className="intent-flow">
              <article className={queryState !== "idle" ? "is-active" : ""}><i>01</i><span>Classify intent</span><strong>high_risk_condition_reports</strong></article>
              <article className={queryState === "executed" ? "is-active" : ""}><i>02</i><span>Execute contract</span><strong>Parameterized query</strong></article>
              <article className={queryState === "executed" ? "is-active" : ""}><i>03</i><span>Compose answer</span><strong>Evidence + next action</strong></article>
            </div>
            <div className={`ops-result ${queryState === "executed" ? "is-visible" : ""}`}>
              <div><span>Route R-104</span><strong>High attention</strong></div>
              <p>Weather and condition reports indicate elevated delay risk. Review the last driver report before changing assignment.</p>
              <small>{mode === "engineer" ? "The model never emits executable SQL. Whitelisted handlers own every database operation." : "The model receives returned rows—not unrestricted database access."}</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfileSection() {
  return (
    <section id="profile" className="profile-section" data-tour-stop>
      <div className="section-shell">
        <div className="profile-heading reveal-block">
          <SectionLabel index="05">Engineering record</SectionLabel>
          <h2>Experience across agent systems, multimodal ML, and <em>production deployment.</em></h2>
          <p>B.Eng. Computer Science and Engineering · The Chinese University of Hong Kong, Shenzhen · 2023–2027</p>
        </div>

        <div className="experience-grid reveal-block">
          {EXPERIENCE.map((item) => (
            <article key={`${item.date}-${item.role}`}>
              <span>{item.date}</span>
              <div><h3>{item.role}</h3><strong>{item.org}</strong><p>{item.copy}</p></div>
            </article>
          ))}
        </div>

        <div className="capability-grid reveal-block">
          <article><span>Agent systems</span><p>Planning · tool routing · memory · handoffs · checkpoints · evaluation · human approval</p></article>
          <article><span>Multimodal intelligence</span><p>Audio · vision · language · ASR/TTS · affect modelling · multimodal retrieval</p></article>
          <article><span>Production foundations</span><p>Python · FastAPI · TypeScript · Redis · SQL · Docker · observability · testing</p></article>
          <article><span>Recognition</span><p>Full Admission Excellence Scholarship · Guangdong Government Outstanding International Student Scholarship</p></article>
        </div>

        <div className="profile-cta reveal-block">
          <div><span>Currently targeting</span><h3>AI Agent Engineer · AI Application Engineer · Applied AI Engineer</h3><p>Also open to multimodal systems, AI infrastructure, and AI systems or solutions engineering.</p></div>
          <div className="profile-links">
            <a href="https://github.com/Yashwant-Bhyri" target="_blank" rel="noreferrer">GitHub ↗</a>
            <a href="/yashwant-bhyri-resume.pdf" target="_blank" rel="noreferrer">Résumé ↗</a>
            <a href="#antigravity">Review Antigravity ↑</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EvidencePortfolio() {
  const [mode, setMode] = useState<ViewMode>("recruiter");
  const [activeSection, setActiveSection] = useState("top");
  const [tourRunning, setTourRunning] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const shellRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell || reducedMotion || window.matchMedia("(pointer: coarse)").matches) return;
    let targetX = -500;
    let targetY = -500;
    let x = targetX;
    let y = targetY;
    let frame = 0;
    let idleTimer = 0;
    const animate = () => {
      x += (targetX - x) * 0.14;
      y += (targetY - y) * 0.14;
      shell.style.setProperty("--pointer-x", `${x}px`);
      shell.style.setProperty("--pointer-y", `${y}px`);
      if (Math.abs(targetX - x) > .15 || Math.abs(targetY - y) > .15) frame = window.requestAnimationFrame(animate);
      else frame = 0;
    };
    const move = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      shell.style.setProperty("--pointer-visible", "1");
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => shell.style.setProperty("--pointer-visible", "0"), 900);
      if (!frame) frame = window.requestAnimationFrame(animate);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(idleTimer);
      window.removeEventListener("pointermove", move);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-tour-stop]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-30% 0px -50%", threshold: [0.08, 0.25, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const blocks = Array.from(document.querySelectorAll<HTMLElement>(".reveal-block"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );
    blocks.forEach((block) => observer.observe(block));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    const render = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const value = max > 0 ? window.scrollY / max : 0;
      progressRef.current?.style.setProperty("transform", `scaleX(${value})`);
      frame = 0;
    };
    const update = () => { if (!frame) frame = window.requestAnimationFrame(render); };
    render();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;
      if (event.key.toLowerCase() === "g") setTourRunning((value) => !value);
      if (event.key.toLowerCase() === "e") setMode((value) => value === "engineer" ? "recruiter" : "engineer");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!tourRunning) return;
    const target = document.getElementById(TOUR_STOPS[tourIndex]);
    target?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    const timer = window.setTimeout(() => {
      if (tourIndex >= TOUR_STOPS.length - 1) {
        setTourRunning(false);
        return;
      }
      setTourIndex((value) => value + 1);
    }, 7200);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, tourIndex, tourRunning]);

  const startTour = () => {
    setTourIndex(0);
    setTourRunning(true);
  };

  const changeMode = (nextMode: ViewMode) => {
    startTransition(() => setMode(nextMode));
  };

  return (
    <main ref={shellRef} className={`portfolio-shell mode-${mode}`}>
      <div className="page-progress" aria-hidden="true"><i ref={progressRef} /></div>
      <div className="pointer-aura" aria-hidden="true" />
      <header className="site-header">
        <a className="brand-lockup" href="#top" aria-label="Yashwant Bhyri, home">
          <span>YB</span>
          <div><strong>Yashwant Bhyri</strong><small>AI Agent & Application Engineer</small></div>
        </a>
        <nav aria-label="Case studies">
          {NAV_ITEMS.map((item) => <a key={item.id} className={activeSection === item.id ? "is-active" : ""} href={`#${item.id}`}>{item.label}</a>)}
        </nav>
        <ModeSwitch mode={mode} onChange={changeMode} />
      </header>

      <section id="top" className="hero-section" data-tour-stop>
        <div className="hero-ambient" />
        <AmbientTechField />
        <div className="hero-content reveal-block is-visible">
          <div className="hero-copy">
            <SectionLabel index="00">AI agent & application engineering · CUHK-Shenzhen</SectionLabel>
            <h1>I build AI systems—from real-time interviews to <em>multimodal creative and clinical intelligence.</em></h1>
            <p>
              Computer Science and Engineering student at CUHK-Shenzhen. Below are four systems spanning real-time interviewing,
              multimodal audio and NLP, agent orchestration, retrieval, evaluation, and production APIs.
            </p>
            <div className="hero-actions">
              <a className="button-primary" href="/antigravity-experience">Watch the Antigravity walkthrough</a>
              <a className="button-secondary" href="#antigravity">Explore projects</a>
              <a className="button-secondary" href="/yashwant-bhyri-resume.pdf" target="_blank" rel="noreferrer">View résumé ↗</a>
            </div>
            <div className="hero-credentials">
              <span><i /> Wondershare Filmora · AIGC R&D</span>
              <span>CUHK-SZ · B.Eng. CSE</span>
              <span>2027 graduation</span>
            </div>
          </div>
          <HeroStack reducedMotion={reducedMotion} />
        </div>
        <div className="hero-index">
          <span>Selected systems</span>
          <div><a href="#antigravity">Antigravity <i>Automated technical interviewing</i></a><a href="#filmora">Filmora <i>Multi-agent AIGC</i></a><a href="#mindscape">MindScape <i>Multimodal clinical support</i></a></div>
        </div>
      </section>

      <AntigravityCase key={mode} mode={mode} />
      <FilmoraCase mode={mode} />
      <MindScapeCase mode={mode} />
      <LogisticsCase mode={mode} />
      <ProfileSection />

      <footer className="site-footer">
        <span>Yashwant Bhyri · 2026</span>
        <p>Available for AI agent, application, and applied AI engineering roles.</p>
        <a href="#top">Return to top ↑</a>
      </footer>

      <GuidedReview
        running={tourRunning}
        index={tourIndex}
        onStart={startTour}
        onStop={() => setTourRunning(false)}
      />
    </main>
  );
}
