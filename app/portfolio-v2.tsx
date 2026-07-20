"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from "react";
import {
  AntigravityOverview,
  FilmoraOverview,
  MindScapeOverview,
} from "./portfolio-visuals";
import { GuideSpark } from "./guide-spark";
import { ProfileSection } from "./profile-section";
import {
  LiveAntigravityVisual,
  LiveFilmoraVisual,
  LiveMindScapeVisual,
  LiveResearchMini,
} from "./live-visuals";

type SequenceController = {
  index: number;
  playing: boolean;
  autoplayEnabled: boolean;
  complete: boolean;
  motionDisabled: boolean;
  choose: (index: number) => void;
  next: () => void;
  previous: () => void;
  toggle: () => void;
};

type StoryStep = {
  label: string;
  title: string;
  explanation: string;
  input: string;
  operation: string;
  output: string;
  stack: readonly string[];
  proof?: string;
};

type OverviewComponent = ComponentType<{ active: number; onSelect: (index: number) => void }>;
type VisualComponent = ComponentType<{ active: number }>;

const PROJECTS = [
  {
    id: "antigravity",
    number: "01",
    brand: "ANTIGRAVITY",
    category: "AI-native technical interviewing platform",
    summary: "Live candidate answers become evidence-seeking follow-ups and an inspectable recruiter report.",
    proof: ["250+ completed interviews", "voice-to-voice runtime", "real product replay"],
    accent: "lime",
  },
  {
    id: "filmora",
    number: "02",
    brand: "WONDERSHARE FILMORA",
    category: "Multimodal AI video-production runtime",
    summary: "One creative brief becomes coordinated video, music, dialogue, captions, effects, and an editor-ready timeline.",
    proof: ["700+ creative signals", "28% API-cost reduction", "multi-agent production DAG"],
    accent: "violet",
  },
  {
    id: "mindscape",
    number: "03",
    brand: "MINDSCAPE",
    category: "Multimodal clinical decision-support architecture",
    summary: "Voice, paralinguistic events, affect, and clinical retrieval converge into evidence-grounded clinician support.",
    proof: ["7-layer architecture", "hybrid clinical RAG", "NLI + rule validation"],
    accent: "cyan",
  },
  {
    id: "logistics",
    number: "04",
    brand: "LOGISTICS AI OPS",
    category: "Bounded AI operations copilot",
    summary: "An AI copilot with explicit authority: approved intents, parameterized queries, and visible refusals for everything else.",
    proof: ["role-based workflows", "bounded query contracts", "human-owned actions"],
    accent: "amber",
  },
  {
    id: "research",
    number: "05",
    brand: "RESEARCH & SYSTEMS",
    category: "Applied AI research and edge inference",
    summary: "TinyML audio, multimodal Text-to-SQL, SLM distillation, and evaluation systems built around measurable behavior.",
    proof: ["93%+ TinyML accuracy", "12,751+ SQL pairs", "31% fewer factual errors"],
    accent: "blue",
  },
] as const;

/** Five thematic keyword clusters. Each term sits near its cluster centre
 *  (tight spread) and the space slowly drifts from cluster to cluster. */
const GALAXY_CLUSTERS: { cx: number; cy: number; terms: [string, number, number][] }[] = [
  { cx: 16, cy: 20, terms: [["AI Application Engineer", -6, -8], ["Structured Outputs", 7, 2], ["Tool Calling", -4, 10], ["Human-in-the-loop", 6, -2]] },
  { cx: 80, cy: 16, terms: [["AI Agent Engineer", -7, -6], ["Agent Orchestration", 6, 3], ["Async Runtimes", -3, 11], ["Model Serving", 8, -1]] },
  { cx: 14, cy: 74, terms: [["Retrieval-Augmented Generation", -5, -7], ["Vector Search", 8, 0], ["Embeddings", -3, 9], ["Semantic Memory", 7, -3]] },
  { cx: 82, cy: 72, terms: [["Multimodal AI", -6, -7], ["Speech AI", 7, 1], ["Streaming STT", -4, 9], ["Realtime Voice", 8, -2]] },
  { cx: 48, cy: 44, terms: [["Evaluation", -7, -6], ["Observability", 7, 2], ["Agent Evaluation", -4, 10], ["Guardrails", 8, -3]] },
];

const ANTIGRAVITY_STEPS: readonly StoryStep[] = [
  {
    label: "Live interview",
    title: "The candidate speaks inside a controlled technical interview—not a chat form.",
    explanation: "The actual room owns turn-taking, microphone state, interruption recovery, and the visible exchange between candidate and AI interviewer.",
    input: "Active question + live candidate voice",
    operation: "Voice turn captured with session state",
    output: "Audio stream + committed turn metadata",
    stack: ["WebRTC", "WebSocket", "React", "FastAPI"],
    proof: "Real product surface",
  },
  {
    label: "Streaming STT",
    title: "Partial transcripts arrive while the candidate is still speaking.",
    explanation: "Deepgram emits provisional and final transcript events. Rolling text can start preparing the next turn before the answer is formally committed.",
    input: "16 kHz voice frames",
    operation: "Partial recognition → revision → final commit",
    output: "Stable transcript + entities + turn ID",
    stack: ["Deepgram", "ASR / STT", "partial + final events"],
    proof: "Live partials, final turn lock",
  },
  {
    label: "Question path",
    title: "A trajectory map keeps the foreground response fast and legally bounded.",
    explanation: "Prepared probes are evaluated against current interview state. One valid question is selected while deeper evidence analysis continues in parallel.",
    input: "Transcript + trajectory state",
    operation: "Evaluate staged probes and route guards",
    output: "Prepared next-question packet",
    stack: ["trajectory map", "semantic routing", "state guards"],
    proof: "553–668 ms measured turn latency, local",
  },
  {
    label: "Dual-lane runtime",
    title: "The ⟪fast lane replies in 900 ms⟫ while the ⟪heavy analysis keeps running⟫.",
    explanation: "Turn handling races on two lanes: the foreground lane speaks now, the background lane finishes seconds later and drops a ready-made next-question package into the queue—consumed the instant the next turn starts.",
    input: "Committed turn + prepared packet",
    operation: "Fast reply now · deep analysis in parallel",
    output: "Reply < 900 ms + next-question package",
    stack: ["fast lane", "background lane", "Redis + fallback", "OpenRouter tiers"],
    proof: "Depth never costs latency",
  },
  {
    label: "Evidence agents",
    title: "Four specialist agents inspect the same answer from different angles.",
    explanation: "Concept coverage, weakness detection, résumé-claim discrepancy, and observable reasoning behavior run concurrently and emit typed findings.",
    input: "Committed candidate answer",
    operation: "Parallel evidence extraction",
    output: "Four structured evidence packets",
    stack: ["concept agent", "weakness agent", "discrepancy agent", "reasoning agent"],
    proof: "Parallel background intelligence",
  },
  {
    label: "Orchestrator",
    title: "The system converges on the single next probe with the highest evidence value.",
    explanation: "Answer state, trajectory position, agent findings, coverage, and agenda converge into a bounded route decision and updated interview state.",
    input: "Interview state + parallel findings",
    operation: "Evidence convergence and route selection",
    output: "One legal adaptive follow-up",
    stack: ["async orchestration", "state checkpoints", "route policy", "structured outputs"],
    proof: "Fast foreground, deep next-turn analysis",
  },
  {
    label: "Voice response",
    title: "Prepared response audio starts the next turn without waiting for fresh synthesis.",
    explanation: "The selected question activates its pre-generated or cached audio asset; an acknowledgement can bridge the hand-off into playback.",
    input: "Selected next question",
    operation: "Prepared-audio lookup and playback",
    output: "Adaptive interviewer voice response",
    stack: ["TTS", "audio cache", "prepared questions"],
    proof: "Pre-generated / cached response audio",
  },
  {
    label: "Recruiter report",
    title: "The interview ends as an evidence record—not an unexplained score.",
    explanation: "Turn evidence assembles into demonstrated depth, claim credibility, coverage, strengths, risks, uncertainty, and explicitly untested dimensions.",
    input: "Turn-level evidence ledger",
    operation: "Aggregate evidence by assessment dimension",
    output: "Inspectable recruiter intelligence report",
    stack: ["evidence ledger", "report V2", "coverage", "uncertainty"],
    proof: "250+ completed interviews",
  },
];

const FILMORA_STEPS: readonly StoryStep[] = [
  {
    label: "Creative brief",
    title: "One natural-language request becomes a structured production brief.",
    explanation: "Format, audience, duration, mood, platform, and constraints are extracted before any generation tool is called.",
    input: "Underspecified creative prompt",
    operation: "Normalize intent and constraints",
    output: "Typed production requirements",
    stack: ["Python", "TypeScript", "schema contracts"],
  },
  {
    label: "Trend intelligence",
    title: "A research agent turns cross-platform creative behavior into reusable signals.",
    explanation: "TikTok, Douyin, Xiaohongshu, Instagram, WeChat, and Facebook streams are scanned for hooks, audio, themes, palettes, tempo, captions, and effects.",
    input: "Cross-platform creative trends",
    operation: "Extract, cluster, and package patterns",
    output: "Trend context + reusable artifacts",
    stack: ["research agent", "memory retrieval", "creative feature extraction"],
    proof: "700+ creative signals operationalized",
  },
  {
    label: "Skill compilation",
    title: "Raw signals compile into durable, versioned skill files.",
    explanation: "Trend evidence becomes trend playbooks, design rules, and Filmora-native parameter presets—knowledge the agents execute against instead of re-learning the platform on every run.",
    input: "700+ deduplicated signals",
    operation: "Compile evidence into skill artifacts",
    output: "trend-skill.md · design.md · params",
    stack: ["skill files", "design rules", "Filmora params", "versioning"],
    proof: "Reused across briefs",
  },
  {
    label: "Memory + recommendation",
    title: "The current brief retrieves relevant memory, then a recommendation layer ranks creative choices.",
    explanation: "The query activates skill files, context packets, design knowledge, and Filmora parameters before producing a context-aware creative recipe.",
    input: "Brief + live trend context",
    operation: "Vectorize, retrieve, rank, recommend",
    output: "Hook + audio + edit recipe",
    stack: ["RAG / memory", "ML recommendation layer", "ranked artifacts"],
  },
  {
    label: "Context compiler",
    title: "Intent and context compile into executable, schema-bound instructions.",
    explanation: "User intent, recommendations, agent output, and production state are normalized into versioned tool contracts and dependencies.",
    input: "Intent + context + production state",
    operation: "Resolve constraints and bind schemas",
    output: "Executable agent/tool contracts",
    stack: ["semantic prompt compiler", "Pydantic-style schemas", "prompt versioning"],
  },
  {
    label: "Production graph",
    title: "Specialist agents generate independent media assets in a coordinated DAG.",
    explanation: "Video, music, dialogue/TTS, captions, transitions, effects, and editor assembly execute with handoffs, checkpoints, retries, and approval gates.",
    input: "Compiled production graph",
    operation: "Parallel tool calls and governed handoffs",
    output: "Editable media assets",
    stack: ["multi-agent orchestration", "AIGC APIs", "human approval", "state checkpoints"],
  },
  {
    label: "Editor timeline",
    title: "Generated assets arrive as an editor-ready timeline—not one opaque video blob.",
    explanation: "Video, dialogue, music, captions, transitions, effects, and metadata remain individually editable inside the production timeline.",
    input: "Completed media artifacts",
    operation: "Align dependencies and editor parameters",
    output: "Filmora-ready timeline tracks",
    stack: ["Filmora parameters", "timeline assembly", "editable assets"],
  },
  {
    label: "Observability",
    title: "Every handoff becomes a traceable optimization surface.",
    explanation: "Agent spans, tool calls, retries, regressions, guardrails, latency, creative evals, and cost attribution feed an RL-style evaluation feedback loop.",
    input: "Runtime traces + agent evaluations",
    operation: "Attribute, compare, regress, optimize",
    output: "Lower-cost, observable workflow versions",
    stack: ["OpenTelemetry-style traces", "agent evals", "regression tests", "cost attribution"],
    proof: "28% API-cost reduction · orchestration = 2% of E2E latency",
  },
];

const MINDSCAPE_STEPS: readonly StoryStep[] = [
  {
    label: "Capture",
    title: "A synthetic voice session enters a rolling temporal buffer.",
    explanation: "WebRTC audio is segmented into synchronized analysis frames so downstream linguistic, event, and affect models inspect the same moment.",
    input: "Synthetic 16 kHz mono audio",
    operation: "Rolling temporal buffering",
    output: "Timestamped analysis frames",
    stack: ["WebRTC", "rolling buffer", "16 kHz audio"],
  },
  {
    label: "Perception",
    title: "One audio stream becomes language, event, and affect representations.",
    explanation: "Transcript content, SenseVoice paralinguistic tokens, and Emotion2Vec+ affect features remain synchronized but independently inspectable.",
    input: "Buffered speech frames",
    operation: "Multimodal perception across three branches",
    output: "Text + event + affect vectors",
    stack: ["SenseVoice", "Emotion2Vec+", "ASR / event detection"],
  },
  {
    label: "State fusion",
    title: "Gated multimodal fusion creates a reusable Behavioral State Vector.",
    explanation: "Linguistic, paralinguistic, acoustic-affect, and longitudinal signals propagate through a fusion network into one patient-state representation.",
    input: "Aligned modality vectors",
    operation: "Cross-modal gating and representation fusion",
    output: "Behavioral State Vector",
    stack: ["GMU fusion", "MedCPT features", "patient-state representation"],
  },
  {
    label: "Clinical retrieval",
    title: "Dense and lexical retrieval compete, merge, and rerank clinical evidence.",
    explanation: "MedCPT semantic neighbors and BM25 lexical hits converge through reciprocal-rank fusion, then BioLinkBERT reranks the strongest evidence.",
    input: "State-aware clinical query",
    operation: "HNSW + BM25 → RRF → cross-encoder rerank",
    output: "Top-five grounded evidence set",
    stack: ["MedCPT", "HNSW / FAISS", "BM25", "RRF", "BioLinkBERT"],
  },
  {
    label: "Grounded reasoning",
    title: "Ranked evidence becomes a structured hypothesis with visible uncertainty.",
    explanation: "The reasoning layer attaches evidence to a bounded hypothesis, preserves conflicting or missing context, and emits targeted follow-up questions.",
    input: "Ranked clinical evidence + session context",
    operation: "Evidence-grounded structured reasoning",
    output: "Hypothesis + uncertainty + follow-ups",
    stack: ["RAG-grounded LLM", "structured output", "evidence citations"],
  },
  {
    label: "Validation",
    title: "Independent model and deterministic rule gates challenge unsupported output.",
    explanation: "DeBERTa-v3 NLI checks claim support while DSM-aligned deterministic rules block unsupported diagnostic language before review.",
    input: "Structured claims + cited evidence",
    operation: "NLI entailment + explicit rule validation",
    output: "Supported review packet with warnings",
    stack: ["DeBERTa-v3 NLI", "DSM-aligned rules", "confidence gate"],
  },
  {
    label: "Clinician review",
    title: "Evidence, uncertainty, state, and follow-up remain visible in one human-owned surface.",
    explanation: "The final interface makes the complete evidence trail inspectable and keeps clinical judgment outside the model boundary.",
    input: "Validated review packet",
    operation: "Human review, edit, and governed action",
    output: "Clinician-owned decision-support workflow",
    stack: ["clinician UI", "longitudinal state", "feedback loop", "fairness monitor"],
    proof: "Decision support—not autonomous diagnosis",
  },
];


const RESEARCH = [
  {
    title: "Embedded Audio Intelligence",
    meta: "OPTEK MICROELECTRONICS · 2025",
    copy: "Built an end-to-end TinyML audio-classification pipeline for a 700 MHz DSP / 16 MB SoC: DSP features, a YAMNet-derived network, INT8 quantization, pruning, and C++ operator tuning.",
    proof: "93%+ accuracy · <10 ms · 14× compression",
  },
  {
    title: "Multimodal Text-to-SQL",
    meta: "HKU × GOOGLE CLOUD · BIRD-SQL",
    copy: "Reconstructed an OCR-grounded VQA and Text-to-SQL evaluation framework with schema-aware prompting, hybrid SQL, FAISS context, and execution-accuracy failure diagnosis.",
    proof: "12,751+ question-SQL pairs · 95+ databases",
  },
  {
    title: "SLM Distillation & Evaluation",
    meta: "CUHK-SZ NLP GROUP · 2024",
    copy: "Automated TRL distillation pipelines, filtered synthetic data with an LLM-as-judge framework, and exposed factuality, BERTScore, and ROUGE behavior through interactive evaluation views.",
    proof: "31% fewer factual errors · 200+ response pairs",
  },
  {
    title: "webGLR Perception Pipeline",
    meta: "BROWSER PERCEPTION → SHADER",
    copy: "A zero-build browser pipeline that fuses live segmentation and depth into on-canvas shaders, with a fast live lane and a slower high-quality lane running side by side.",
    proof: "Segmentation + depth fused live · dual live/HQ lanes",
  },
  {
    title: "COL-VEO Video Orchestration",
    meta: "DETERMINISTIC AI VIDEO",
    copy: "A storyboard state machine drives AI video generation with 15-axis prompt control and seed-locked regeneration—the same seed reproduces identical frames by construction.",
    proof: "Storyboard state machine · seed-safe regeneration",
  },
  {
    title: "Logistics AI Ops",
    meta: "FLASK + MYSQL · BOUNDED AI OPERATIONS",
    copy: "Role-gated logistics workflows over Flask + MySQL with weather- and geo-aware route risk—and a bounded AI copilot that answers only through approved intents and parameterized queries.",
    proof: "Bounded query contracts · visible refusals · human-owned actions",
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
  options: { loop?: boolean; observeSelector?: string; pointerSelector?: string } = {},
): SequenceController {
  const { loop = false, observeSelector, pointerSelector } = options;
  const [sequence, setSequence] = useState({ index: 0, requestedPlay: true, visitedMask: 1 });
  // Keep the user's autoplay preference independent from temporary gates such
  // as the hero intro. This lets the project deck begin moving the moment the
  // intro resolves instead of being permanently initialized as paused.
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [interactionPaused, setInteractionPaused] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observedSurface = observeSelector ? node.querySelector<HTMLElement>(observeSelector) : node;
    if (!observedSurface) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "-12% 0px -12%",
      // Flagship chapters become intentionally tall after the operational
      // graphics stack on mobile. A small non-zero threshold keeps autoplay
      // tied to genuine viewport presence without making a 16%-of-section
      // intersection mathematically impossible on narrow screens.
      threshold: 0.02,
    });
    observer.observe(observedSurface);
    return () => observer.disconnect();
  }, [observeSelector, rootRef]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const pointerSurface = pointerSelector
      ? node.querySelector<HTMLElement>(pointerSelector) ?? node
      : node.querySelector<HTMLElement>(".vx-story-panel") ?? node;
    const pause = () => setInteractionPaused(true);
    const resume = () => setInteractionPaused(false);
    const handleFocusOut = (event: FocusEvent) => {
      if (!node.contains(event.relatedTarget as Node | null)) resume();
    };
    // Hover-pausing belongs to the explanatory controls, not the entire tall
    // chapter. The operational canvas can therefore keep telling its story
    // while the visitor simply leaves the cursor over the page.
    pointerSurface.addEventListener("pointerenter", pause);
    pointerSurface.addEventListener("pointerleave", resume);
    node.addEventListener("focusin", pause);
    node.addEventListener("focusout", handleFocusOut);
    return () => {
      pointerSurface.removeEventListener("pointerenter", pause);
      pointerSurface.removeEventListener("pointerleave", resume);
      node.removeEventListener("focusin", pause);
      node.removeEventListener("focusout", handleFocusOut);
    };
  }, [pointerSelector, rootRef]);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (!sequence.requestedPlay || !visible || !pageVisible || reducedMotion || interactionPaused) return;
    const timer = window.setTimeout(() => {
      setSequence((current) => {
        const nextIndex = loop ? (current.index + 1) % count : Math.min(current.index + 1, count - 1);
        const reachedEnd = !loop && nextIndex === count - 1;
        return {
          index: nextIndex,
          requestedPlay: reachedEnd ? false : current.requestedPlay,
          visitedMask: current.visitedMask | (1 << nextIndex),
        };
      });
    }, interval);
    return () => window.clearTimeout(timer);
  }, [count, interactionPaused, interval, loop, pageVisible, reducedMotion, sequence.index, sequence.requestedPlay, visible]);

  const choose = useCallback((nextIndex: number) => {
    const boundedIndex = Math.max(0, Math.min(count - 1, nextIndex));
    setSequence((current) => ({
      index: boundedIndex,
      requestedPlay: false,
      visitedMask: current.visitedMask | (1 << boundedIndex),
    }));
  }, [count]);
  const next = useCallback(() => {
    setSequence((current) => {
      const nextIndex = loop ? (current.index + 1) % count : Math.min(current.index + 1, count - 1);
      return { index: nextIndex, requestedPlay: false, visitedMask: current.visitedMask | (1 << nextIndex) };
    });
  }, [count, loop]);
  const previous = useCallback(() => {
    setSequence((current) => {
      const nextIndex = loop ? (current.index - 1 + count) % count : Math.max(current.index - 1, 0);
      return { index: nextIndex, requestedPlay: false, visitedMask: current.visitedMask | (1 << nextIndex) };
    });
  }, [count, loop]);
  const toggle = useCallback(() => {
    if (reducedMotion) return;
    setInteractionPaused(false);
    setSequence((current) => {
      const enabling = !current.requestedPlay;
      const restart = enabling && !loop && current.index === count - 1;
      return {
        index: restart ? 0 : current.index,
        requestedPlay: enabling,
        visitedMask: restart ? current.visitedMask | 1 : current.visitedMask,
      };
    });
  }, [count, loop, reducedMotion]);

  return {
    index: sequence.index,
    playing: sequence.requestedPlay && visible && pageVisible && !reducedMotion && !interactionPaused,
    autoplayEnabled: sequence.requestedPlay,
    complete: sequence.visitedMask === (1 << count) - 1,
    motionDisabled: reducedMotion,
    choose,
    next,
    previous,
    toggle,
  };
}

function useHeroChoreography(reducedMotion: boolean) {
  const text = "Hi—welcome to my portfolio. I am Yashwant Bhyri, a Year-4 Computer Science & AI student at CUHK-Shenzhen (top 20 university in the world), with 1+ years of experience building advanced AI applications, agentic & orchestration systems, and production-grade multimodal systems with advanced memory and retrieval — through internships and research.";
  const [cursor, setCursor] = useState(0);
  const [phase, setPhase] = useState<"boot" | "typing" | "resolve" | "split" | "ready">("boot");

  const skip = useCallback(() => {
    setCursor(text.length);
    setPhase("ready");
    try { window.sessionStorage.setItem("yb-portfolio-intro", "seen"); } catch { /* no-op */ }
  }, [text.length]);

  useEffect(() => {
    if (reducedMotion) {
      const timer = window.setTimeout(skip, 0);
      return () => window.clearTimeout(timer);
    }
    try {
      if (window.sessionStorage.getItem("yb-portfolio-intro") === "seen") {
        const timer = window.setTimeout(skip, 0);
        return () => window.clearTimeout(timer);
      }
    } catch { /* no-op */ }
    const timer = window.setTimeout(() => setPhase("typing"), 180);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, skip]);

  useEffect(() => {
    if (phase !== "typing") return;
    // Deliberately slower cadence — the intro should read as writing, not loading.
    const timer = window.setTimeout(() => {
      if (cursor >= text.length) setPhase("resolve");
      else setCursor((value) => Math.min(text.length, value + 1));
    }, cursor >= text.length ? 0 : 26 + (cursor % 5) * 3);
    return () => window.clearTimeout(timer);
  }, [cursor, phase, text.length]);

  useEffect(() => {
    if (phase !== "resolve") return;
    const timer = window.setTimeout(() => setPhase("split"), 420);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "split") return;
    const timer = window.setTimeout(() => {
      setPhase("ready");
      try { window.sessionStorage.setItem("yb-portfolio-intro", "seen"); } catch { /* no-op */ }
    }, 820);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "ready") return;
    const handleIntent = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-hero-skip-ignore]")) return;
      skip();
    };
    window.addEventListener("wheel", handleIntent, { passive: true });
    window.addEventListener("touchstart", handleIntent, { passive: true });
    window.addEventListener("keydown", handleIntent);
    return () => {
      window.removeEventListener("wheel", handleIntent);
      window.removeEventListener("touchstart", handleIntent);
      window.removeEventListener("keydown", handleIntent);
    };
  }, [phase, skip]);

  return { text, cursor, phase, ready: phase === "ready", skip };
}

/** phrases that get the painted-over highlight once typing completes */
const PAINT_PHRASES = ["CUHK-Shenzhen", "1+ years of experience"];

function CuhkCrest() {
  // The actual CUHK coat of arms (Wikimedia Commons, fetched 2026-07-20)
  // at /public/brands/cuhk.png; drawn fallback only if the file is missing.
  const [official, setOfficial] = useState(true);
  if (official) {
    return (
      <img
        className="vx-cuhk-crest vx-cuhk-img"
        src="/brands/cuhk.png"
        alt="CUHK"
        onError={() => setOfficial(false)}
      />
    );
  }
  return (
    <svg className="vx-cuhk-crest" viewBox="0 0 20 24" aria-label="CUHK" role="img">
      <path d="M2 1.5 h16 v13.5 c0 4.4 -4.2 6.6 -8 7.8 c-3.8 -1.2 -8 -3.4 -8 -7.8 Z" fill="#4B2E83" stroke="#D3A94C" strokeWidth="1.3" />
      <path d="M10 5 c-2.4 1.5 -3.4 3.4 -3.2 5.4 c1 -1 2 -1.5 3.2 -1.6 c1.2 0.1 2.2 0.6 3.2 1.6 c0.2 -2 -0.8 -3.9 -3.2 -5.4 Z" fill="#D3A94C" />
      <path d="M6.6 12.6 c1 1.4 2.2 2.1 3.4 2.1 c1.2 0 2.4 -0.7 3.4 -2.1" fill="none" stroke="#D3A94C" strokeWidth="1.1" strokeLinecap="round" />
      <circle cx="10" cy="17.2" r="1" fill="#D3A94C" />
    </svg>
  );
}

/** Renders copy with ⟪accent⟫ markers as striking emphasised spans. */
function Emph({ text }: { text: string }) {
  const parts = text.split(/⟪|⟫/);
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <em key={i} className="vx-emph">{part}</em> : <span key={i}>{part}</span>))}
    </>
  );
}

function TypedWords({ text, cursor }: { text: string; cursor: number }) {
  const segments = useMemo(() => {
    const paintRanges = PAINT_PHRASES.map((p) => {
      const at = text.indexOf(p);
      return at < 0 ? null : ([at, at + p.length] as const);
    }).filter(Boolean) as (readonly [number, number])[];
    const parts = text.split(/(\s+)/);
    let paintIdx = -1;
    return parts.map((segment, index) => {
      const start = parts.slice(0, index).join("").length;
      const end = start + segment.length;
      const painted = !/^\s+$/.test(segment) && paintRanges.some(([a, b]) => start >= a && end <= b + 1);
      if (painted) paintIdx += 1;
      return { segment, start, end, painted, paintIdx: painted ? paintIdx : -1 };
    });
  }, [text]);
  return (
    <>
      {segments.map(({ segment, start, end, painted, paintIdx }, index) => {
        const visible = cursor <= start ? "" : segment.slice(0, Math.min(segment.length, cursor - start));
        const active = !/^\s+$/.test(segment) && cursor > start && cursor < end;
        const greetLen = text.indexOf(".") + 1;
        const isGreet = end <= greetLen && !/^\s+$/.test(segment);
        const cls = [
          active ? "is-typing" : cursor >= end && !/^\s+$/.test(segment) ? "is-complete" : "",
          painted ? "is-paint" : "",
          isGreet ? "vx-greet" : "",
          isGreet && end === greetLen ? "vx-greet-end" : "",
        ].join(" ").trim();
        return (
          <span key={`${segment}-${index}`} className={cls} style={painted ? ({ "--paint-delay": `${0.25 + paintIdx * 0.16}s` } as CSSProperties) : undefined}>
            {segment === "CUHK-Shenzhen" && cursor >= end ? <CuhkCrest /> : null}
            {visible}
          </span>
        );
      })}
    </>
  );
}

function GalaxyField({ reducedMotion }: { reducedMotion: boolean }) {
  const [cycle, setCycle] = useState(0);
  const stars = useMemo(() => Array.from({ length: 76 }, (_, index) => ({
    x: (index * 37 + 11) % 100,
    y: (index * 61 + 7) % 100,
    size: 1 + (index % 4) * 0.55,
    delay: (index % 15) * -0.41,
  })), []);

  useEffect(() => {
    if (reducedMotion) return;
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        if (!document.hidden) setCycle((value) => value + 1);
        schedule();
      }, 3400);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  // three clusters alive at once: primary bright, secondary lit, tertiary ambient
  const primary = cycle % GALAXY_CLUSTERS.length;
  const secondary = (cycle + 2) % GALAXY_CLUSTERS.length;
  const tertiary = (cycle + 4) % GALAXY_CLUSTERS.length;
  // the space itself drifts toward the primary cluster
  const pc = GALAXY_CLUSTERS[primary];
  const driftX = (50 - pc.cx) * 0.22;
  const driftY = (50 - pc.cy) * 0.22;

  return (
    <div className="vx-galaxy" aria-hidden="true">
      <div className="vx-nebula vx-nebula-a" /><div className="vx-nebula vx-nebula-b" />
      <div className="vx-starfield" style={{ transform: `translate(${driftX * 0.5}%, ${driftY * 0.5}%)`, transition: "transform 3.2s cubic-bezier(.4,0,.2,1)" }}>{stars.map((star, index) => <i key={index} style={{ "--x": `${star.x}%`, "--y": `${star.y}%`, "--size": `${star.size}px`, "--delay": `${star.delay}s` } as CSSProperties} />)}</div>
      <div className="vx-termfield" style={{ transform: `translate(${driftX}%, ${driftY}%)`, transition: "transform 3.2s cubic-bezier(.4,0,.2,1)" }}>
        {GALAXY_CLUSTERS.map((cluster, ci) =>
          cluster.terms.map(([term, dx, dy], ti) => {
            const inPrimary = ci === primary;
            const inSecondary = ci === secondary;
            const inTertiary = ci === tertiary;
            const bright = (inPrimary && ti !== (cycle % 2 === 0 ? 3 : 1)) || (inSecondary && ti === cycle % 4);
            const visible = inPrimary || inSecondary || inTertiary;
            return (
              <span
                key={term}
                data-visible={visible}
                data-bright={bright}
                data-mobile={inPrimary}
                style={{ "--x": `${cluster.cx + dx}%`, "--y": `${cluster.cy + dy}%`, "--dx": `${(dx % 3) * 4}px`, "--dy": `${(dy % 3) * 4}px`, "--term-delay": `${(ci * 4 + ti) * -1.7}s` } as CSSProperties}
              ><i />{term}</span>
            );
          }),
        )}
      </div>
      <div className="vx-galaxy-mask" />
    </div>
  );
}

function HeroProjectDeck({ reducedMotion, ready }: { reducedMotion: boolean; ready: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  // The deck flips on its own, always — only hovering the controls pauses it,
  // never merely resting the cursor on the cards.
  const deck = useAutoplaySequence(PROJECTS.length, 4200, ref, reducedMotion || !ready, {
    loop: true,
    pointerSelector: ".vx-deck-controls",
  });
  return (
    <div ref={ref} className="vx-hero-deck" data-ready={ready} data-motion-paused={!deck.playing} aria-hidden={!ready}>
      <div className="vx-deck-status"><i className={deck.playing ? "is-live" : ""} /> SELECTED SYSTEMS <span>{String(deck.index + 1).padStart(2, "0")} / 05</span></div>
      <div className="vx-deck-stage">
        {PROJECTS.map((project, index) => {
          const offset = (index - deck.index + PROJECTS.length) % PROJECTS.length;
          const active = offset === 0;
          return (
            <a
              key={project.id}
              href={project.id === "logistics" ? "#research" : `#${project.id}`}
              className={`vx-deck-card vx-accent-${project.accent}`}
              data-position={offset}
              tabIndex={ready && active ? 0 : -1}
              aria-hidden={!active}
            >
              <span>{project.number} · {project.brand}</span>
              <strong>{project.category}</strong>
              <p>{project.summary}</p>
              <div>{project.proof.slice(0, 2).map((item) => <i key={item}>{item}</i>)}</div>
              <small>Explore this system <b>↘</b></small>
            </a>
          );
        })}
      </div>
      <div className="vx-deck-controls">
        <button type="button" onClick={deck.previous} aria-label="Previous project" disabled={!ready}>←</button>
        <div>{PROJECTS.map((project, index) => <button key={project.id} type="button" className={deck.index === index ? "is-active" : ""} onClick={() => deck.choose(index)} aria-label={`Show ${project.category}`} disabled={!ready} />)}</div>
        <button type="button" onClick={deck.next} aria-label="Next project" disabled={!ready}>→</button>
      </div>
    </div>
  );
}

function Hero({ reducedMotion }: { reducedMotion: boolean }) {
  const hero = useHeroChoreography(reducedMotion);
  return (
    <section id="top" className="vx-hero" data-phase={hero.phase}>
      <GalaxyField reducedMotion={reducedMotion} />
      <div className="vx-hero-shell">
        <div className="vx-hero-copy">
          <div className="vx-terminal-label"><i /><span>YASHWANT / PERSONAL PORTFOLIO</span><small>{hero.ready ? "READY" : hero.phase === "resolve" ? "RESOLVING" : "INTRO"}</small></div>
          <h1 aria-label={hero.text}>
            <span className="vx-hero-measure" aria-hidden="true">{hero.text}</span>
            <span className="vx-hero-typed" aria-hidden="true"><TypedWords text={hero.text} cursor={hero.cursor} /><i /></span>
          </h1>
          <p className="vx-hero-thesis"><Emph text="I am the layer that turns a simple prototype into ⟪a reliable, production-grade AI product⟫ — ⟪advanced orchestration⟫, ⟪deep retrieval⟫, ⟪multimodal perception⟫, ⟪evaluation⟫, ⟪observability⟫, and ⟪production-grade deployment⟫." /></p>
          <div className="vx-hero-actions">
            <a className="vx-primary-action" href="#projects">Explore my projects <i>↓</i></a>
            <a href="/yashwant-bhyri-resume.pdf" target="_blank" rel="noreferrer">View my résumé ↗</a>
            <a href="https://github.com/Yashwant-Bhyri" target="_blank" rel="noreferrer">Open GitHub ↗</a>
          </div>
          <div className="vx-hero-meta"><span>CUHK-Shenzhen · B.Eng. CSE</span><span>Year-4 · Class of 2027</span><span>Wondershare Filmora · AIGC R&amp;D</span></div>
        </div>
        <HeroProjectDeck reducedMotion={reducedMotion} ready={hero.ready} />
      </div>
      {!hero.ready ? <button type="button" className="vx-skip-intro" onClick={hero.skip} data-hero-skip-ignore>Skip introduction →</button> : <a className="vx-scroll-cue" href="#projects"><i /> Scroll into the systems</a>}
    </section>
  );
}

/** Types text once the element scrolls into view. Returns visible slice + done. */
function useTypeOnView(text: string, cps = 34) {
  const ref = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setStarted(true);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!started || n >= text.length) return;
    const timer = window.setTimeout(() => setN((v) => v + 1), 1000 / cps);
    return () => window.clearTimeout(timer);
  }, [started, n, text.length, cps]);
  return { ref, visible: text.slice(0, n), done: n >= text.length, started };
}

/** Spotlight cycle for the project cards: one quick lap, then a slow lap, looping. */
const SPOT_DURATIONS = [1000, 1000, 1000, 1000, 1000, 2500, 2500, 2500, 2500, 2500];

const INDEX_SUB = "Five AI systems that I built, explained from user input to engineering outcome.";

function ProjectIndex() {
  const hook = useTypeOnView("So — what did I build?", 22);
  const [subN, setSubN] = useState(0);
  useEffect(() => {
    if (!hook.done || subN >= INDEX_SUB.length) return;
    const timer = window.setTimeout(() => setSubN((v) => v + 1), 24);
    return () => window.clearTimeout(timer);
  }, [hook.done, subN]);
  const sub = { visible: INDEX_SUB.slice(0, subN), done: subN >= INDEX_SUB.length };
  const [spot, setSpot] = useState(-1);
  useEffect(() => {
    if (!sub.done) return;
    let step = 0;
    let timer = 0;
    const tick = () => {
      setSpot(step % PROJECTS.length);
      timer = window.setTimeout(() => {
        step += 1;
        tick();
      }, SPOT_DURATIONS[step % SPOT_DURATIONS.length]);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, [sub.done]);
  return (
    <section id="projects" className="vx-project-index vx-section-shell">
      <div className="vx-section-heading">
        <span>SELECTED WORK / FIVE SYSTEMS</span>
        <h2 ref={hook.ref as React.RefObject<HTMLHeadingElement>} className={`vx-typed-h ${hook.done ? "is-done" : ""}`} aria-label="So — what did I build?">
          <span className="vx-typed-live" aria-hidden="true">
            <em className="vx-paint-target">{hook.visible}</em>
            {hook.started && !hook.done ? <i className="vx-type-caret" /> : null}
          </span>
          <b className="vx-typed-ghost" aria-hidden="true">So — what did I build?</b>
        </h2>
        <p className="vx-typed-sub">
          <span className="vx-typed-live" aria-hidden="true">
            {hook.done ? sub.visible : ""}
            {hook.done && !sub.done ? <i className="vx-type-caret" /> : null}
          </span>
          <b className="vx-typed-ghost" aria-hidden="true">{INDEX_SUB}</b>
        </p>
        <p>Choose a project, or keep scrolling for a guided architecture walkthrough.</p>
      </div>
      <div className="vx-project-grid">
        {PROJECTS.map((project, cardIdx) => (
          <a
            href={project.id === "logistics" ? "#research" : `#${project.id}`}
            key={project.id}
            className={`vx-project-card vx-accent-${project.accent} ${spot === cardIdx ? "is-spotlit" : ""}`}
          >
            <div className="vx-project-meta"><span>{project.number}</span><i>{project.brand}</i></div>
            <h3>{project.category}</h3>
            <p>{project.summary}</p>
            <div className="vx-project-proof">{project.proof.map((item) => <span key={item}>{item}</span>)}</div>
            <div className="vx-project-topology" aria-hidden="true"><i /><i /><i /><i /><b /></div>
            <strong>Explore architecture <i>↘</i></strong>
          </a>
        ))}
      </div>
    </section>
  );
}

function StageControls({ controller, total }: { controller: SequenceController; total: number }) {
  return (
    <div className="vx-stage-controls">
      <button type="button" onClick={controller.previous} aria-label="Previous stage">←</button>
      <button type="button" className="vx-play" onClick={controller.toggle} disabled={controller.motionDisabled}>
        {controller.motionDisabled ? "Static view" : controller.autoplayEnabled ? "Pause walkthrough" : "Play walkthrough"}
      </button>
      <span>{String(controller.index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
      <button type="button" onClick={controller.next} aria-label="Next stage">→</button>
    </div>
  );
}

function SystemWalkthrough({
  name,
  steps,
  controller,
  Visual,
  accent,
}: {
  name: string;
  steps: readonly StoryStep[];
  controller: SequenceController;
  Visual: VisualComponent;
  accent: "lime" | "violet" | "cyan";
}) {
  const step = steps[controller.index];
  return (
    <div className={`vx-walkthrough vx-accent-${accent}`} data-motion-paused={!controller.playing}>
      <aside className="vx-story-panel">
        <div className="vx-story-kicker"><span>COMPONENT MICROSCOPE</span><i className={controller.playing ? "is-live" : ""} /></div>
        <div className="vx-stage-rail" role="group" aria-label={`${name} walkthrough stages`}>
          {steps.map((item, index) => <button key={item.label} type="button" onClick={() => controller.choose(index)} aria-pressed={controller.index === index} data-active={controller.index === index}><i>{String(index + 1).padStart(2, "0")}</i><span>{item.label}</span><b /></button>)}
        </div>
        <div className="vx-story-copy">
          <span>{step.label}</span>
          <h3><Emph text={step.title} /></h3>
          <p>{step.explanation}</p>
          <div className="vx-tech-stack">{step.stack.map((item) => <i key={item}>{item}</i>)}</div>
          {step.proof ? <strong className="vx-proof-chip"><i />{step.proof}</strong> : null}
        </div>
        <StageControls controller={controller} total={steps.length} />
      </aside>
      <div className="vx-operational-stage" aria-label={`${name}: ${step.title}`}>
        <div className="vx-stage-top"><span>OPERATIONAL GRAPHIC</span><strong>{step.label}</strong><i>{controller.playing ? "AUTOPLAY" : "MANUAL"}</i></div>
        <div className="vx-visual-window"><Visual active={controller.index} /></div>
        <div className="vx-io-rail">
          <div><span>INPUT</span><strong>{step.input}</strong></div>
          <i aria-hidden="true" />
          <div><span>OPERATION</span><strong>{step.operation}</strong></div>
          <i aria-hidden="true" />
          <div><span>OUTPUT</span><strong>{step.output}</strong></div>
        </div>
      </div>
    </div>
  );
}

function CaseHeading({
  number,
  brand,
  category,
  title,
  copy,
  accent,
}: {
  number: string;
  brand: string;
  category: string;
  title: string;
  copy: string;
  accent: "lime" | "violet" | "cyan";
}) {
  const typedTitle = useTypeOnView(title, 46);
  return (
    <div className={`vx-case-heading vx-accent-${accent}`}>
      <span>{number} / {brand}</span>
      <small>{category}</small>
      <h2 ref={typedTitle.ref as React.RefObject<HTMLHeadingElement>} className="vx-typed-h" aria-label={title}>
        <span className="vx-typed-live" aria-hidden="true">
          {typedTitle.visible}
          {typedTitle.started && !typedTitle.done ? <i className="vx-type-caret" /> : null}
        </span>
        {/* reserves final height so the layout never jumps while typing */}
        <b className="vx-typed-ghost" aria-hidden="true">{title}</b>
      </h2>
      <p><Emph text={copy} /></p>
    </div>
  );
}

function FlagshipChapter({
  id,
  number,
  brand,
  category,
  title,
  copy,
  accent,
  steps,
  Overview,
  Visual,
  proof,
  children,
}: {
  id: string;
  number: string;
  brand: string;
  category: string;
  title: string;
  copy: string;
  accent: "lime" | "violet" | "cyan";
  steps: readonly StoryStep[];
  Overview: OverviewComponent;
  Visual: VisualComponent;
  proof: readonly { label: string; value: string; detail: string }[];
  children?: React.ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const controller = useAutoplaySequence(steps.length, 9400, ref, reducedMotion, {
    observeSelector: ".vx-walkthrough",
    pointerSelector: ".vx-story-panel",
  });
  const handoffs: Record<string, { copy: string; href: string; action: string }> = {
    antigravity: { copy: "You have followed a live answer all the way to recruiter evidence. The actual three-turn room and report are ready below.", href: "#antigravity-demo", action: "Launch the real replay ↓" },
    filmora: { copy: "You have followed one brief through research, compilation, agent production, assembly, and evaluation.", href: "#mindscape", action: "Continue to clinical intelligence ↓" },
    mindscape: { copy: "You have followed one synthetic voice state through perception, retrieval, validation, and human review.", href: "#logistics", action: "Continue to bounded AI operations ↓" },
  };
  const handoff = handoffs[id];
  return (
    <section ref={ref} id={id} className={`vx-case vx-case-${id} vx-accent-${accent}`}>
      <div className="vx-section-shell">
        <CaseHeading number={number} brand={brand} category={category} title={title} copy={copy} accent={accent} />
        <div className="vx-overview-shell">
          <div className="vx-overview-head"><div><span>HIGH-LEVEL ARCHITECTURE</span><strong>Follow one signal through the complete system.</strong></div><small>Choose any node to inspect it</small></div>
          <Overview active={controller.index} onSelect={controller.choose} />
        </div>
        <SystemWalkthrough name={brand} steps={steps} controller={controller} Visual={Visual} accent={accent} />
        {handoff && controller.complete ? <div className="vx-project-handoff" role="status"><i className="vx-handoff-orbit" aria-hidden="true"><b /><b /><b /></i><div><span>ORBIT / PROJECT COMPLETE</span><strong>{handoff.copy}</strong></div><a href={handoff.href}>{handoff.action}</a></div> : null}
        <div className="vx-outcome-strip">
          {proof.map((item) => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong><small>{item.detail}</small></div>)}
          {children}
        </div>
      </div>
    </section>
  );
}

function AntigravityChapter() {
  const [launchState, setLaunchState] = useState<"idle" | "starting" | "fallback">("idle");
  const launchReplay = useCallback(async () => {
    const local = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const appBase = local ? "http://localhost:3010" : "https://antigravity-gz2r.vercel.app";
    const apiBase = local ? "http://localhost:8000/api" : `${appBase}/api`;
    setLaunchState("starting");
    try {
      const response = await fetch(`${apiBase}/portfolio_demo/start`, { method: "POST" });
      if (!response.ok) throw new Error("Replay could not start");
      const started = await response.json() as { session_id?: string };
      if (!started.session_id) throw new Error("Session missing");
      window.location.assign(`${appBase}/interview-room/${encodeURIComponent(started.session_id)}?autoplay=1&source=portfolio`);
    } catch {
      setLaunchState("fallback");
    }
  }, []);

  return (
    <FlagshipChapter
      id="antigravity"
      number="01"
      brand="ANTIGRAVITY"
      category="AI-NATIVE TECHNICAL INTERVIEWING PLATFORM"
      title="Real-time AI interview software that conducts automated technical interviews at scale."
      copy="I built the ⟪real-time voice layer⟫ and the robust ⟪multi-agent orchestration decision engine⟫ behind it: streaming speech, evidence-seeking route logic, and the recruiter intelligence layer that turns a live technical conversation into a ⟪defensible hiring artifact⟫."
      accent="lime"
      steps={ANTIGRAVITY_STEPS}
      Overview={AntigravityOverview}
      Visual={LiveAntigravityVisual}
      proof={[
        { label: "PRODUCT IMPACT", value: "250+ completed interviews", detail: "Automated technical screening after the ATS layer" },
        { label: "RUNTIME", value: "Two-track agent architecture", detail: "Fast foreground response · deep next-turn analysis" },
        { label: "OUTPUT", value: "Evidence-backed recruiter report", detail: "Demonstrated ability, uncertainty, and coverage" },
      ]}
    >
      <button id="antigravity-demo" className="vx-demo-action" type="button" onClick={launchReplay} disabled={launchState === "starting"}>
        <span>{launchState === "starting" ? "Starting the real interview…" : launchState === "fallback" ? "Interview replay unavailable · retry" : "Start the real interview"}</span>
        <small>Actual Antigravity room → three fictional turns → recruiter report ↗</small>
      </button>
    </FlagshipChapter>
  );
}

function FilmoraChapter() {
  return (
    <FlagshipChapter
      id="filmora"
      number="02"
      brand="WONDERSHARE FILMORA · AIGC R&D"
      category="MULTIMODAL AI VIDEO-PRODUCTION RUNTIME"
      title="An end-to-end multimodal production workflow, built into the Filmora enterprise editor."
      copy="As an AI application engineering intern at Wondershare, I built ⟪agents into the Filmora enterprise software⟫: ⟪multi-agent planning⟫ over a ⟪multimodal production graph⟫ — video, audio, dialogue, captions, effects — with live trend intelligence, ⟪memory⟫, schema-bound prompting, and ⟪workflow observability⟫."
      accent="violet"
      steps={FILMORA_STEPS}
      Overview={FilmoraOverview}
      Visual={LiveFilmoraVisual}
      proof={[
        { label: "TREND INTELLIGENCE", value: "700+ creative signals", detail: "Hooks, audio, themes, palettes, tempo, captions, and effects" },
        { label: "COST", value: "28% API-cost reduction", detail: "Trace-led workflow optimization and attribution" },
        { label: "LATENCY", value: "2% orchestration share", detail: "Of end-to-end generation latency" },
      ]}
    >
      <div className="vx-confidentiality"><span>REPRESENTATIVE SYSTEM VISUALIZATION</span><small>Confidential Filmora internals and source media are abstracted.</small></div>
    </FlagshipChapter>
  );
}

function MindScapeChapter() {
  return (
    <FlagshipChapter
      id="mindscape"
      number="03"
      brand="MINDSCAPE"
      category="MULTIMODAL CLINICAL DECISION-SUPPORT ARCHITECTURE · PROTOTYPE"
      title="A clinical diagnosis-prediction tool that keeps every step of its reasoning inspectable."
      copy="MindScape ⟪predicts and supports clinical assessment⟫ from a patient session: ⟪seven inspectable layers⟫ — perception, state fusion, retrieval, reasoning, validation, clinician review — connected as one decision-support workflow. ⟪The clinician always owns the decision.⟫"
      accent="cyan"
      steps={MINDSCAPE_STEPS}
      Overview={MindScapeOverview}
      Visual={LiveMindScapeVisual}
      proof={[
        { label: "STATE MODEL", value: "7-layer behavioral pipeline", detail: "Speech, events, affect, fusion, retrieval, reasoning, review" },
        { label: "GROUNDING", value: "Dense + lexical + rerank", detail: "MedCPT · HNSW · BM25 · RRF · BioLinkBERT" },
        { label: "SAFETY", value: "NLI + deterministic gates", detail: "Evidence support and DSM-aligned rule validation" },
      ]}
    >
      <div className="vx-safety-note"><span>SYNTHETIC CLINICAL WORKFLOW</span><small>Decision support for clinician review—not autonomous diagnosis or medical advice.</small></div>
    </FlagshipChapter>
  );
}

function ResearchSection() {
  return (
    <section id="research" className="vx-research vx-section-shell">
      <div className="vx-section-heading"><span>05 / RESEARCH & ENGINEERING RECORD</span><h2>Research that ends in an operational measurement.</h2><p>Six compact specimens — each one shows the transformation, the deployment constraint, and the measured result. Never just a model name.</p></div>
      <div className="vx-research-grid">
        {RESEARCH.map((item, index) => <article key={item.title}><span>{String(index + 1).padStart(2, "0")} · {item.meta}</span><LiveResearchMini index={index} /><h3>{item.title}</h3><p>{item.copy}</p><strong>{item.proof}</strong></article>)}
      </div>
      <div className="vx-profile-strip">
        <div><span>EDUCATION</span><strong>B.Eng. Computer Science &amp; Engineering</strong><p>The Chinese University of Hong Kong, Shenzhen · 2023–2027 · Full Admission Excellence Scholarship</p></div>
        <div><span>PRIMARY DIRECTION</span><strong>AI Application Engineer · AI Agent Engineer</strong><p>Also targeting applied AI, multimodal systems, AI infrastructure, and AI architecture roles.</p></div>
        <div className="vx-profile-actions"><a href="/yashwant-bhyri-resume.pdf" target="_blank" rel="noreferrer">Résumé ↗</a><a href="https://github.com/Yashwant-Bhyri" target="_blank" rel="noreferrer">GitHub ↗</a></div>
      </div>
    </section>
  );
}

const GUIDE_MESSAGES: Record<string, string> = {
  top: "Welcome. I can guide you through what each system does—and where the evidence lives.",
  projects: "These five systems are ordered for AI application and agent-engineering roles. Choose one, or keep scrolling.",
  antigravity: "Follow one candidate answer from live voice to the next probe, then into the recruiter report.",
  filmora: "Watch one creative brief become trend context, coordinated agent work, and an editor-ready timeline.",
  mindscape: "Here, multimodal perception, evidence retrieval, reasoning, and validation remain separately inspectable.",
  research: "The final chapter compresses six research systems into mechanism, constraint, and measured result.",
};

function useActiveChapter() {
  const [active, setActive] = useState("top");
  useEffect(() => {
    const ids = Object.keys(GUIDE_MESSAGES);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActive(visible.target.id);
    }, { rootMargin: "-28% 0px -52%", threshold: [0, 0.15, 0.35, 0.6] });
    ids.forEach((id) => { const node = document.getElementById(id); if (node) observer.observe(node); });
    return () => observer.disconnect();
  }, []);
  return active;
}

function OrbitGuide() {
  const active = useActiveChapter();
  const [mode, setMode] = useState<"invite" | "guided" | "minimized" | "dismissed">("invite");
  const [eligible, setEligible] = useState(false);
  useEffect(() => {
    let modeTimer = 0;
    let revealTimer = 0;
    try {
      const saved = window.sessionStorage.getItem("yb-orbit-guide");
      if (saved === "guided" || saved === "minimized" || saved === "dismissed") {
        modeTimer = window.setTimeout(() => setMode(saved), 0);
      }
      const introSeen = window.sessionStorage.getItem("yb-portfolio-intro") === "seen";
      revealTimer = window.setTimeout(() => setEligible(true), introSeen ? 700 : 4600);
    } catch { /* no-op */ }
    if (!revealTimer) revealTimer = window.setTimeout(() => setEligible(true), 4600);
    return () => { window.clearTimeout(modeTimer); window.clearTimeout(revealTimer); };
  }, []);
  const updateMode = (next: typeof mode) => {
    setMode(next);
    try { window.sessionStorage.setItem("yb-orbit-guide", next); } catch { /* no-op */ }
  };
  if (!eligible || mode === "dismissed") return null;
  const open = mode === "invite" || mode === "guided";
  return (
    <aside className={`vx-orbit-guide vx-orbit-${active}`} data-open={open} aria-label="Portfolio guide">
      {open ? <div className="vx-orbit-dialogue" role={mode === "guided" ? "status" : undefined} aria-live={mode === "guided" ? "polite" : "off"}><button type="button" onClick={() => updateMode("dismissed")} aria-label="Dismiss guide">×</button><span>ORBIT / SYSTEM GUIDE</span><p>{GUIDE_MESSAGES[active] ?? GUIDE_MESSAGES.top}</p>{mode === "invite" ? <div><button type="button" onClick={() => updateMode("guided")}>Guide me</button><button type="button" onClick={() => updateMode("minimized")}>Explore freely</button></div> : <small>Chapter {Object.keys(GUIDE_MESSAGES).indexOf(active) + 1} / {Object.keys(GUIDE_MESSAGES).length}</small>}</div> : null}
      <button className="vx-orbit-character" type="button" onClick={() => updateMode(open ? "minimized" : "guided")} aria-expanded={open} aria-label={open ? "Minimize portfolio guide" : "Open portfolio guide"}><i /><i /><i /><b /><span>ORBIT</span></button>
    </aside>
  );
}

function useExperienceMotion(shellRef: React.RefObject<HTMLElement | null>, reducedMotion: boolean) {
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const updateScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      shell.style.setProperty("--scroll-progress", `${Math.min(1, window.scrollY / max)}`);
    };
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, [shellRef]);

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
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener("pointermove", move); };
  }, [reducedMotion, shellRef]);
}

export function PortfolioV2() {
  const reducedMotion = useReducedMotion();
  const shellRef = useRef<HTMLElement>(null);
  useExperienceMotion(shellRef, reducedMotion);
  return (
    <main ref={shellRef} className="vx-shell">
      <div className="vx-progress" aria-hidden="true"><i /></div>
      <div className="vx-cursor-light" aria-hidden="true" />
      <header className="vx-header">
        <a href="#top" className="vx-brand" aria-label="Yashwant Bhyri, portfolio home"><span>YB</span><div><strong>Yashwant Bhyri</strong><small>AI agent &amp; application engineer</small></div></a>
        <nav aria-label="Portfolio navigation"><a href="#profile">Profile</a><a href="#projects">Projects</a><a href="#antigravity">Antigravity</a><a href="#filmora">Filmora</a><a href="#mindscape">MindScape</a><a href="#research">Research</a></nav>
        <a className="vx-header-resume" href="/yashwant-bhyri-resume.pdf" target="_blank" rel="noreferrer">Résumé ↗</a>
      </header>
      <Hero reducedMotion={reducedMotion} />
      <ProfileSection />
      <ProjectIndex />
      <AntigravityChapter />
      <FilmoraChapter />
      <MindScapeChapter />
      <ResearchSection />
      <GuideSpark />
      <footer className="vx-footer"><div><strong>Yashwant Bhyri</strong><span>AI Agent · AI Application · Applied AI Engineering</span></div><p>Built to make the engineering visible.</p><a href="#top">Return to orbit ↑</a></footer>
    </main>
  );
}
