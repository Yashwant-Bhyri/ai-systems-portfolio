"use client";

import Image from "next/image";
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
  annotation: string;
  annotationHighlights: readonly string[];
  signals: readonly string[];
  maturity?: string;
  input: string;
  operation: string;
  output: string;
  stack: readonly string[];
  proof?: string;
};

type ConclusionMetric = {
  label: string;
  value: string;
  detail: string;
};

type OverviewComponent = ComponentType<{ active: number; onSelect: (index: number) => void }>;
type VisualComponent = ComponentType<{ active: number }>;

const PROJECTS = [
  {
    id: "antigravity",
    number: "01",
    brand: "ANTIGRAVITY",
    category: "Real-time AI-Native Interviewing Platform",
    badge: "PRODUCTION-GRADE SOFTWARE PRODUCT",
    summary: "Production-grade AI interview software built with a multi-agent orchestration and decision engine. It automates technical interviews at scale, adapts the live question path, and turns each turn into evidence-linked recruiter intelligence.",
    proof: ["250+ completed interviews", "dual-lane agent runtime", "evidence-linked reports"],
    architecture: ["Live voice turn", "Adaptive interview graph", "Agent convergence", "Recruiter evidence"],
    accent: "lime",
  },
  {
    id: "filmora",
    number: "02",
    brand: "WONDERSHARE FILMORA",
    category: "End-to-End Multimodal AI Production System",
    badge: "AI APPLICATION ENGINEERING INTERNSHIP",
    summary: "An end-to-end multimodal AI production runtime integrated into Filmora Enterprise. It combines real-time market research and product intelligence with memory, retrieval, function calling, and multimodal agent-planning graphs to produce editable media assets under guardrails and human approval.",
    proof: ["research + product intelligence", "multimodal agent planning graph", "editable Filmora workflow"],
    architecture: ["Research intelligence", "Memory + retrieval", "Multimodal agent graph", "Editable Filmora timeline"],
    accent: "violet",
  },
  {
    id: "mindscape",
    number: "03",
    brand: "MINDSCAPE",
    category: "Medical AI Clinician-Support Product",
    badge: "MEDICAL AI R&D PROJECT",
    summary: "A medical AI assistant for evidence-grounded, clinician-controlled mental-health screening and diagnostic review. It combines multimodal perception, longitudinal memory, clinical retrieval, validated reasoning, and traceable human review while the clinician retains final judgment.",
    proof: ["traceable session evidence", "hybrid clinical retrieval", "clinician-controlled decisions"],
    architecture: ["Session evidence", "Clinical retrieval", "Validated reasoning", "Clinician review"],
    accent: "cyan",
  },
  {
    id: "research",
    number: "04",
    brand: "RESEARCH ENGINEERING",
    category: "Open-Source, Research & R&D Experience",
    badge: "OPEN SOURCE · RESEARCH · R&D",
    summary: "Six focused builds across open-source benchmark engineering, research internships, corporate R&D, browser-native perception, controlled generative video, and embedded intelligence—each presented through its mechanism, constraints, and evaluation evidence.",
    proof: ["open-source benchmark contribution", "2 research experiences", "3 engineering internships"],
    architecture: ["Problem + constraints", "Model or runtime", "Evaluation harness", "Engineering evidence"],
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

const GALAXY_ANCHORS = [
  ["AI Systems Engineer", 64, 34],
  ["Production Observability", 78, 28],
  ["Reinforcement Learning", 88, 39],
  ["Agent Memory", 72, 49],
  ["Multimodal Reasoning", 88, 53],
  ["Model Routing", 61, 57],
] as const;

const ANTIGRAVITY_STEPS: readonly StoryStep[] = [
  {
    label: "Live interview",
    title: "The candidate speaks inside a controlled technical interview—not a chat form.",
    explanation: "The actual room owns turn-taking, microphone state, interruption recovery, and the visible exchange between candidate and AI interviewer.",
    annotation: "WebRTC audio and WebSocket turn events share one session state, so interruption recovery resumes the microphone, active question, and interviewer response together.",
    annotationHighlights: ["WebRTC audio", "interruption recovery"],
    signals: ["WebRTC", "WebSocket", "TurnState", "InterruptionRecovery", "FastAPI"],
    maturity: "PRODUCTION RUNTIME",
    input: "Active question + live candidate voice",
    operation: "Voice turn captured with session state",
    output: "Audio stream + committed turn metadata",
    stack: ["WebRTC", "WebSocket", "React", "FastAPI"],
    proof: "Real product surface",
  },
  {
    label: "Streaming STT",
    title: "Partial transcripts arrive while the candidate is still speaking.",
    explanation: "Deepgram streams partial hypotheses while the candidate speaks, then commits a stable transcript. Early text can warm the next-turn pipeline without entering the evidence record.",
    annotation: "Deepgram partials warm next-turn processing while the candidate speaks; only the confidence-scored final transcript writes to interview state and recruiter evidence.",
    annotationHighlights: ["Deepgram partials", "confidence-scored final transcript"],
    signals: ["Deepgram", "StreamingSTT", "PartialHypotheses", "FinalCommit", "EvidenceLineage"],
    maturity: "PRODUCTION RUNTIME",
    input: "16 kHz voice frames",
    operation: "Partial recognition → revision → final commit",
    output: "Stable transcript + entities + turn ID",
    stack: ["Deepgram", "ASR / STT", "partial + final events"],
    proof: "Live partials, final turn lock",
  },
  {
    label: "Question path",
    title: "The interview map keeps the current question, evidence gaps, and prepared probes in one live graph.",
    explanation: "The foreground path selects the next legal question while a deeper reasoning path continues updating the future interview route.",
    annotation: "The fast path selects the current question from the live interview graph; background agents reason deeper and promote a guardrail-checked packet into a future branch.",
    annotationHighlights: ["fast path selects the current question from the live interview graph", "guardrail-checked packet"],
    signals: ["InterviewGraph", "SemanticRouting", "StateGuards", "QuestionPacket", "FutureBranch"],
    maturity: "PRODUCTION RUNTIME",
    input: "Transcript + trajectory state",
    operation: "Score graph branches and route guards",
    output: "Current question + prepared future path",
    stack: ["interview graph", "semantic routing", "state guards"],
    proof: "One map, two questioning paths",
  },
  {
    label: "Dual-lane runtime",
    title: "The ⟪foreground lane returns the next question in about 900 ms⟫ while deeper interview reasoning continues.",
    explanation: "The low-latency route asks the immediate question. In parallel, specialist agents prepare a richer packet; only policy-validated packets enter the future interview map.",
    annotation: "An LLM gateway routes the live question to a low-latency model in about 900 ms while deeper agents build and validate the next-turn packet off the critical path.",
    annotationHighlights: ["LLM gateway", "about 900 ms", "off the critical path"],
    signals: ["LLMGateway", "ModelRouting", "900msPath", "QuestionGuardrails", "RedisFallback"],
    maturity: "PRODUCTION RUNTIME",
    input: "Committed turn + prepared packet",
    operation: "Route by latency budget + question policy",
    output: "About 900 ms reply + prepared question packet",
    stack: ["LLM gateway", "model routing", "question guardrails", "Redis + fallback"],
    proof: "Deeper analysis stays off the critical response path",
  },
  {
    label: "Evidence agents",
    title: "Four specialist agents inspect the same answer from different angles.",
    explanation: "Concept coverage, weakness detection, résumé-claim discrepancy, and observable reasoning behavior run concurrently and emit typed findings.",
    annotation: "Concept, weakness, discrepancy, and reasoning agents execute concurrently, emitting typed, turn-linked findings into the shared interview state.",
    annotationHighlights: ["execute concurrently", "typed, turn-linked findings"],
    signals: ["MultiAgent", "ParallelInference", "ConceptAgent", "DiscrepancyAgent", "TypedOutputs"],
    maturity: "PRODUCTION RUNTIME",
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
    annotation: "Answer state, coverage gaps, and parallel findings converge in the orchestrator, which ranks evidence gain and emits one policy-valid probe through a structured contract.",
    annotationHighlights: ["ranks evidence gain", "policy-valid probe", "structured contract"],
    signals: ["AsyncOrchestration", "EvidenceGain", "RoutePolicy", "StateCheckpoint", "StructuredOutput"],
    maturity: "PRODUCTION RUNTIME",
    input: "Interview state + parallel findings",
    operation: "Evidence convergence and route selection",
    output: "One legal adaptive follow-up",
    stack: ["async orchestration", "state checkpoints", "route policy", "structured outputs"],
    proof: "Fast foreground, deep next-turn analysis",
  },
  {
    label: "Voice response",
    title: "Prepared response audio starts the next turn without waiting for fresh synthesis.",
    explanation: "The selected question first checks prepared audio, then routes synthesis through a timed provider gateway. Cache, provider fallback, and an acknowledgement bridge keep the voice turn recoverable.",
    annotation: "A prepared-audio cache serves known questions first; misses enter a timeout-bound TTS router with automatic provider failover and a recovery acknowledgement.",
    annotationHighlights: ["prepared-audio cache", "timeout-bound TTS router", "automatic provider failover"],
    signals: ["TTSGateway", "PreparedAudio", "ProviderFailover", "LatencyBudget", "RecoveryBridge"],
    maturity: "PRODUCTION RUNTIME",
    input: "Selected next question",
    operation: "Prepared-audio lookup and playback",
    output: "Adaptive interviewer voice response",
    stack: ["TTS gateway", "prepared audio cache", "provider fallback", "latency budget"],
    proof: "Pre-generated / cached response audio",
  },
  {
    label: "Recruiter report",
    title: "The interview ends as an evidence record—not an unexplained score.",
    explanation: "Turn evidence assembles into demonstrated depth, claim credibility, coverage, strengths, risks, uncertainty, and explicitly untested dimensions.",
    annotation: "The evidence ledger maps every hiring signal to its transcript timestamp, confidence, and coverage, including dimensions the interview never tested.",
    annotationHighlights: ["evidence ledger", "transcript timestamp, confidence, and coverage"],
    signals: ["EvidenceLedger", "TimestampLineage", "Coverage", "Uncertainty", "RecruiterIntelligence"],
    maturity: "PRODUCTION OUTPUT",
    input: "Turn-level evidence ledger",
    operation: "Aggregate evidence by assessment dimension",
    output: "Inspectable recruiter intelligence report",
    stack: ["evidence ledger", "report V2", "coverage", "uncertainty"],
    proof: "250+ completed interviews",
  },
  {
    label: "Evaluation loop",
    title: "Post-interview traces expose where the agent was too hard, vague, leading, or punitive.",
    explanation: "Telemetry, agent evaluations, route-policy checks, token and latency traces, and recruiter feedback drive an offline refinement loop. Regression suites gate every prompt, route, and policy update.",
    annotation: "Agent evaluations score question value, coverage, route quality, tone, tokens, and latency; RL candidates must pass replay, regression, and human approval.",
    annotationHighlights: ["Agent evaluations", "RL candidates", "replay, regression, and human approval"],
    signals: ["AgentEvaluation", "RLRefinement", "RegressionReplay", "TokenOptimization", "LatencyTracing", "HumanGate"],
    maturity: "OFFLINE REFINEMENT",
    input: "Interview traces + evaluator signals",
    operation: "Score agent behavior and replay regressions",
    output: "Safer, faster interview policy versions",
    stack: ["agent evaluations", "observability", "token optimization", "reinforcement-learning refinement"],
    proof: "Question quality and runtime behavior remain inspectable",
  },
];

const FILMORA_STEPS: readonly StoryStep[] = [
  {
    label: "Creative brief",
    title: "A product brief is grounded in audience, market, and creative context before generation begins.",
    explanation: "Format, audience, product truth, duration, mood, platform, and approval constraints become one structured production contract.",
    annotation: "An underspecified product brief becomes a typed production contract that drives research, retrieval, multimodal tool calls, and editable Filmora timeline assembly.",
    annotationHighlights: ["typed production contract", "multimodal tool calls", "editable Filmora timeline assembly"],
    signals: ["SchemaContract", "ProductTruth", "AudienceConstraints", "ApprovalGate", "FilmoraEnterprise"],
    maturity: "INTERNSHIP SYSTEM",
    input: "Underspecified creative prompt",
    operation: "Normalize intent and constraints",
    output: "Typed production requirements",
    stack: ["Python", "TypeScript", "schema contracts"],
  },
  {
    label: "Market + product intelligence",
    title: "Real-time market research and product intelligence become retrievable production context.",
    explanation: "Cross-platform research, product facts, and creative analytics are distilled into hooks, audio, themes, palettes, tempo, caption behavior, and effects that can guide the current brief.",
    annotation: "Research agents scan six content surfaces, deduplicate and brief-score patterns, then package 700+ product-linked creative signals for retrieval.",
    annotationHighlights: ["scan six content surfaces", "deduplicate and brief-score patterns", "700+ product-linked creative signals"],
    signals: ["ResearchAgent", "ProductIntelligence", "700Signals", "FeatureExtraction", "BriefScoring"],
    maturity: "INTERNSHIP SYSTEM",
    input: "Cross-platform creative trends",
    operation: "Extract, cluster, and package patterns",
    output: "Ranked research context + reusable artifacts",
    stack: ["research agent", "product intelligence", "memory retrieval", "feature extraction"],
    proof: "700+ creative signals operationalized",
  },
  {
    label: "Skill compilation",
    title: "Raw signals compile into durable, versioned skill files.",
    explanation: "Trend evidence becomes reusable playbooks, design rules, and editor parameters that the production agents can execute consistently.",
    annotation: "A signal compiler turns ranked evidence into versioned skill files, design rules, and Filmora-native parameters that agents reuse across briefs.",
    annotationHighlights: ["signal compiler", "versioned skill files", "Filmora-native parameters"],
    signals: ["SkillCompiler", "VersionedSkills", "DesignRules", "FilmoraParams", "ReusableMemory"],
    maturity: "INTERNSHIP SYSTEM",
    input: "Market, product, and creative signals",
    operation: "Compile evidence into skill artifacts",
    output: "trend-skill.md · design.md · params",
    stack: ["skill files", "design rules", "Filmora params", "versioning"],
    proof: "Reused across briefs",
  },
  {
    label: "Memory + recommendation",
    title: "The current brief retrieves relevant memory, then a recommendation layer ranks creative choices.",
    explanation: "The query activates skill files, context packets, design knowledge, and Filmora parameters before producing a context-aware creative recipe.",
    annotation: "Embeddings retrieve matching skills, product context, and editor presets; reranking selects the hook, audio, and edit recipe for the current brief.",
    annotationHighlights: ["Embeddings retrieve", "reranking selects", "hook, audio, and edit recipe"],
    signals: ["Embeddings", "VectorRetrieval", "Reranking", "Recommendation", "CreativeMemory"],
    maturity: "INTERNSHIP SYSTEM",
    input: "Brief + live trend context",
    operation: "Vectorize, retrieve, rank, recommend",
    output: "Hook + audio + edit recipe",
    stack: ["vector retrieval", "embeddings", "reranking", "recommendation layer"],
  },
  {
    label: "Context compiler",
    title: "Intent and context compile into executable, schema-bound instructions.",
    explanation: "User intent, recommendations, agent output, and production state are normalized into versioned tool contracts and dependencies.",
    annotation: "Brief intent, market evidence, retrieved memory, and live timeline state compile into schema-validated function calls with explicit dependencies.",
    annotationHighlights: ["schema-validated function calls", "explicit dependencies"],
    signals: ["FunctionCalling", "SchemaValidation", "PromptTuning", "DependencyGraph", "VersionedContracts"],
    maturity: "INTERNSHIP SYSTEM",
    input: "Intent + context + production state",
    operation: "Resolve constraints and bind schemas",
    output: "Executable agent/tool contracts",
    stack: ["function calling", "schema validation", "prompt tuning", "versioned contracts"],
  },
  {
    label: "Production graph",
    title: "Specialist agents generate independent media assets in a coordinated DAG.",
    explanation: "Video, music, dialogue/TTS, captions, transitions, effects, and editor assembly execute with handoffs, checkpoints, retries, and approval gates.",
    annotation: "An LLM gateway routes six specialist agents; typed tool calls run in parallel where dependencies allow, with schema, safety, retry, and checkpoint gates.",
    annotationHighlights: ["LLM gateway routes six specialist agents", "typed tool calls run in parallel", "schema, safety, retry, and checkpoint gates"],
    signals: ["MultiAgentDAG", "LLMGateway", "ToolCalling", "Checkpointing", "Retries", "Guardrails"],
    maturity: "REPRESENTATIVE ABSTRACTION",
    input: "Compiled production graph",
    operation: "Parallel tool calls and governed handoffs",
    output: "Editable media assets",
    stack: ["multi-agent orchestration", "LLM gateway", "tool calling", "state checkpoints"],
  },
  {
    label: "Editor timeline",
    title: "Generated assets arrive as an editor-ready timeline—not one opaque video blob.",
    explanation: "Video, dialogue, music, captions, transitions, effects, and metadata remain individually editable inside the production timeline.",
    annotation: "The tool graph keeps video, music, dialogue, captions, effects, and metadata separate, then assembles them behind a human gate into editable Filmora tracks.",
    annotationHighlights: ["metadata separate", "human gate", "editable Filmora tracks"],
    signals: ["EditableAssets", "TimelineAssembly", "MultimodalIO", "HumanApproval", "ToolInspector"],
    maturity: "INTERNSHIP OUTPUT",
    input: "Completed media artifacts",
    operation: "Align dependencies and editor parameters",
    output: "Filmora-ready timeline tracks",
    stack: ["Filmora parameters", "timeline assembly", "editable assets"],
  },
  {
    label: "Evaluation + RL refinement",
    title: "Every handoff exposes model choice, tokens, latency, retries, guardrails, and creative quality.",
    explanation: "Runtime traces and agent evaluations feed a reinforcement-learning refinement loop across prompts, model routes, tool policies, token budgets, and regression suites before human approval.",
    annotation: "Span-level telemetry attributes model route, tokens, tool cost, latency, retries, and creative scores; RL candidates pass regression, guardrail, and human-release gates.",
    annotationHighlights: ["Span-level telemetry", "RL candidates", "regression, guardrail, and human-release gates"],
    signals: ["Observability", "AgentEvaluation", "RLRefinement", "TokenCost", "LatencyTracing", "ModelRouting"],
    maturity: "INTERNSHIP RESULT",
    input: "Runtime traces + agent evaluations",
    operation: "Attribute, compare, regress, optimize",
    output: "Lower-cost, observable workflow versions",
    stack: ["observability", "agent evaluations", "token optimization", "model routing intelligence"],
    proof: "Reduced API cost and token overhead",
  },
];

const MINDSCAPE_STEPS: readonly StoryStep[] = [
  {
    label: "Capture",
    title: "Patient-language fragments become traceable, time-aligned analysis packets.",
    explanation: "A synthetic voice session enters a rolling buffer so language, event, and affect models inspect the same moment and retain the words that produced each packet.",
    annotation: "A one-second WebRTC rolling buffer emits timestamped packets that retain the exact source words, keeping every downstream signal traceable to the session.",
    annotationHighlights: ["one-second WebRTC rolling buffer", "exact source words", "traceable to the session"],
    signals: ["WebRTC", "RollingBuffer", "16kHz", "TimestampLineage", "SourceWords"],
    maturity: "IMPLEMENTED LOCAL ENGINE",
    input: "Synthetic 16 kHz mono audio",
    operation: "Rolling temporal buffering",
    output: "Timestamped analysis frames",
    stack: ["WebRTC", "rolling buffer", "16 kHz audio"],
  },
  {
    label: "Perception",
    title: "One audio stream becomes language, event, and affect representations.",
    explanation: "Transcript content, SenseVoice paralinguistic tokens, and Emotion2Vec+ affect features remain synchronized but independently inspectable.",
    annotation: "ASR captures language, SenseVoice extracts speech events, and Emotion2Vec+ encodes affect on one shared timeline while each signal remains independently inspectable.",
    annotationHighlights: ["SenseVoice extracts speech events", "Emotion2Vec+ encodes affect", "shared timeline"],
    signals: ["SenseVoice", "Emotion2Vec", "ASR", "EventDetection", "SharedTimeline"],
    maturity: "R&D PROTOTYPE",
    input: "Buffered speech frames",
    operation: "Multimodal perception across three branches",
    output: "Text + event + affect vectors",
    stack: ["SenseVoice", "Emotion2Vec+", "ASR / event detection"],
  },
  {
    label: "State fusion",
    title: "Gated multimodal fusion creates a reusable Behavioral State Vector.",
    explanation: "Linguistic, paralinguistic, acoustic-affect, and longitudinal signals propagate through a fusion network into one patient-state representation.",
    annotation: "A Gated Multimodal Unit weights linguistic, paralinguistic, acoustic, and longitudinal vectors into one Behavioral State Vector reused downstream.",
    annotationHighlights: ["Gated Multimodal Unit", "Behavioral State Vector"],
    signals: ["GMU", "MultimodalFusion", "LongitudinalState", "BehavioralStateVector", "FeatureGating"],
    maturity: "FULL ARCHITECTURE",
    input: "Aligned modality vectors",
    operation: "Cross-modal gating and representation fusion",
    output: "Behavioral State Vector",
    stack: ["GMU fusion", "MedCPT features", "patient-state representation"],
  },
  {
    label: "Clinical retrieval",
    title: "A retrieval agent traverses clinical references, finds supporting passages, and reranks the strongest evidence.",
    explanation: "Dense and lexical retrieval run together, merge their candidates, and return a grounded source set for validation and clinician review.",
    annotation: "MedCPT and HNSW dense search run beside BM25 lexical search; RRF merges candidates and BioLinkBERT reranks five source-linked passages.",
    annotationHighlights: ["MedCPT and HNSW dense search", "BM25 lexical search", "BioLinkBERT reranks"],
    signals: ["MedCPT", "HNSW", "BM25", "RRF", "BioLinkBERT", "HybridRetrieval"],
    maturity: "FULL RETRIEVAL ARCHITECTURE",
    input: "State-aware clinical query",
    operation: "HNSW + BM25 → RRF → cross-encoder rerank",
    output: "Top-five grounded evidence set",
    stack: ["MedCPT", "HNSW / FAISS", "BM25", "RRF", "BioLinkBERT"],
  },
  {
    label: "Grounded reasoning",
    title: "Ranked evidence becomes a structured hypothesis with visible uncertainty.",
    explanation: "The reasoning layer attaches evidence to a bounded hypothesis, preserves conflicting or missing context, and emits targeted follow-up questions.",
    annotation: "A retrieval-grounded LLM emits a structured hypothesis only with linked session evidence, cited references, visible uncertainty, conflicts, and follow-up questions.",
    annotationHighlights: ["retrieval-grounded LLM", "structured hypothesis", "visible uncertainty"],
    signals: ["RAG", "StructuredOutput", "EvidenceCitations", "Uncertainty", "FollowUpGeneration"],
    maturity: "R&D PROTOTYPE",
    input: "Ranked clinical evidence + session context",
    operation: "Evidence-grounded structured reasoning",
    output: "Hypothesis + uncertainty + follow-ups",
    stack: ["RAG-grounded LLM", "structured output", "evidence citations"],
  },
  {
    label: "Validation",
    title: "Independent model and deterministic rule gates challenge unsupported output.",
    explanation: "DeBERTa-v3 NLI checks claim support while DSM-aligned deterministic rules block unsupported diagnostic language before review.",
    annotation: "DeBERTa-v3 NLI tests every claim against its citations; DSM-aligned deterministic rules block unsupported diagnostic language before review.",
    annotationHighlights: ["DeBERTa-v3 NLI", "DSM-aligned deterministic rules", "block unsupported diagnostic language"],
    signals: ["DeBERTaV3", "NLI", "DSMRules", "ConfidenceGate", "ClaimBlocking"],
    maturity: "VALIDATION DESIGN TARGET",
    input: "Structured claims + cited evidence",
    operation: "NLI entailment + explicit rule validation",
    output: "Supported review packet with warnings",
    stack: ["DeBERTa-v3 NLI", "DSM-aligned rules", "confidence gate"],
  },
  {
    label: "Clinician review",
    title: "The clinician receives the source, supported claim, uncertainty, warning state, and suggested follow-up together.",
    explanation: "Every recommendation remains editable and reviewable, and clinical judgment stays outside the model boundary.",
    annotation: "The review UI binds each observation to its source, validation state, and uncertainty; the clinician can edit, ask a follow-up, or hold.",
    annotationHighlights: ["source, validation state, and uncertainty", "edit, ask a follow-up, or hold"],
    signals: ["ClinicianInTheLoop", "SourceLinked", "EditableReview", "Uncertainty", "HumanJudgment"],
    maturity: "HUMAN-OWNED PROTOTYPE",
    input: "Validated review packet",
    operation: "Human review, edit, and governed action",
    output: "Clinician-owned decision-support workflow",
    stack: ["clinician UI", "longitudinal state", "governed feedback", "monitoring hook"],
    proof: "Decision support—not autonomous diagnosis",
  },
  {
    label: "Governed RL refinement",
    title: "Clinician feedback enters an offline evaluation queue, never a live self-training loop.",
    explanation: "Approved review outcomes, retrieval quality, safety-gate behavior, latency, and subgroup monitoring feed offline reinforcement-learning refinement. Regression and human review gate every future release.",
    annotation: "Approved, de-identified clinician actions enter an offline RL and evaluation queue; grounding, subgroup, safety, regression, and human-release gates govern each candidate.",
    annotationHighlights: ["Approved, de-identified clinician actions", "offline RL and evaluation queue", "human-release gates"],
    signals: ["OfflineRL", "DeidentifiedFeedback", "SafetyRegression", "SubgroupMonitoring", "HumanRelease"],
    maturity: "R&D DESIGN TARGET",
    input: "Approved review feedback + runtime traces",
    operation: "Evaluate, refine, and replay safety regressions",
    output: "Versioned future workflow candidates",
    stack: ["offline RL refinement", "observability", "safety regression", "human release gate"],
    proof: "No online learning from clinician actions",
  },
];


const RESEARCH = [
  {
    badge: "EMBEDDED AI INTERNSHIP",
    title: "Embedded Audio Intelligence Model",
    meta: "OPTEK MICROELECTRONICS · 2025",
    copy: "Optimized an embedded audio-intelligence pipeline for constrained hardware, connecting MediaPipe Audio features, TFLM INT8 inference, structured pruning, and an edge deployment toolchain in one measurable path.",
    signals: [
      { label: "accuracy", value: "95%+" },
      { label: "inference", value: "sub-10 ms" },
      { label: "compression", value: "4×" },
      { label: "runtime", value: "200 KB" },
    ],
    stack: ["MediaPipe Audio", "TFLM INT8", "structured pruning", "Edge Impulse", "edge SoC"],
    tone: "blue",
    visual: 0,
  },
  {
    badge: "OPEN-SOURCE CONTRIBUTION",
    title: "BIRD-SQL Research Workflow",
    meta: "HKU × GOOGLE CLOUD · OFFICIAL BIRD-SQL BENCHMARK",
    copy: "Contributed to an execution-grounded text-to-SQL research workflow associated with BIRD-SQL, emphasizing schema-aware generation, database execution, and failure diagnosis rather than surface-form matching.",
    signals: [
      { label: "context", value: "official benchmark" },
      { label: "question-SQL pairs", value: "12,751" },
      { label: "databases", value: "95" },
    ],
    stack: ["BIRD-SQL", "Text-to-SQL", "execution accuracy", "schema grounding", "failure analysis"],
    tone: "open",
    visual: 1,
  },
  {
    badge: "RESEARCH INTERNSHIP",
    title: "SLM Distillation & Evaluation",
    meta: "CUHK-SZ NLP GROUP · 2024",
    copy: "Built a distillation and evaluation workflow that filters synthetic data with an LLM judge, trains on accepted samples, and exposes factuality and response-quality behavior through paired evaluation.",
    signals: [
      { label: "factual errors", value: "31% fewer" },
      { label: "evaluation pairs", value: "200+" },
    ],
    stack: ["TRL", "LLM-as-judge", "distillation", "factuality", "paired evaluation"],
    tone: "blue",
    visual: 2,
  },
  {
    badge: "CORPORATE R&D COLLABORATION",
    title: "Logistics AI Ops Platform / Lalamove R&D Project",
    meta: "LALAMOVE · FLASK + MYSQL · BOUNDED AI OPERATIONS",
    copy: "Built role-based customer, driver, and administrator workflows with weather and geospatial route-risk scoring, plus a bounded AI operations copilot restricted to approved intents, parameterized queries, and human-owned actions.",
    signals: [
      { label: "collaboration", value: "Lalamove" },
      { label: "query controls", value: "bounded contracts" },
      { label: "action owner", value: "human-owned" },
    ],
    stack: ["Flask", "MySQL", "JWT", "geospatial risk", "bounded AI copilot"],
    tone: "lalamove",
    visual: 5,
    logo: "https://www.lalamove.com/hubfs/Lalamove%20Website%202020/Newsroom/Lalamove%20Logo.png",
  },
  {
    badge: "BROWSER-NATIVE PERCEPTION R&D",
    title: "webGLR Browser Perception Engine",
    meta: "PERCEPTION → TEMPORAL CONTROL → WEBGL SHADER",
    copy: "Built a browser-native perception-to-shader engine that fuses SAM segmentation masks with INT8-quantized Depth Anything V2 Small maps and compiles them into five GPU texture controls. A low-latency live lane drives subject lift and background falloff while an HQ lane performs scene-aware sampling, cut guards, cache blending, and memory-budgeted analysis.",
    signals: [
      { label: "segmentation", value: "SAM" },
      { label: "depth", value: "INT8 Depth Anything V2" },
      { label: "shader contract", value: "five textures" },
      { label: "runtime lanes", value: "live + HQ" },
    ],
    stack: ["SAM", "Depth Anything V2 Small", "INT8 quantization", "five GPU textures", "WebGL"],
    tone: "webglr",
    visual: 3,
  },
  {
    badge: "CONTROLLED GENERATIVE VIDEO R&D",
    title: "COL-VEO Controlled Video Orchestration",
    meta: "PROMPT STEERING · SEED-AWARE REGENERATION · CONTROL LAYER",
    copy: "Built a FastAPI creative-control prototype that compiles a 15-control style surface into structured per-shot Veo prompts. Soft regeneration reuses the seed for style-safe changes; hard regeneration assigns a new seed for structural changes. Exact prompt preview, lifecycle gates, sequential shot extension, and browser WebGL Post-FX keep the loop inspectable.",
    signals: [
      { label: "control", value: "deterministic prompt compiler" },
      { label: "soft regeneration", value: "same seed" },
      { label: "hard regeneration", value: "new seed" },
      { label: "provider output", value: "best-effort" },
    ],
    stack: ["FastAPI", "prompt compiler", "style-axis ranking", "seed control", "WebGL post-FX"],
    tone: "colveo",
    visual: 4,
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
  const [pointerActive, setPointerActive] = useState(false);

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
    if (!pointerSelector) return;
    const node = rootRef.current?.querySelector<HTMLElement>(pointerSelector);
    if (!node) return;
    const pause = () => setPointerActive(true);
    const resume = () => setPointerActive(false);
    node.addEventListener("pointerenter", pause);
    node.addEventListener("pointerleave", resume);
    node.addEventListener("focusin", pause);
    node.addEventListener("focusout", resume);
    return () => {
      node.removeEventListener("pointerenter", pause);
      node.removeEventListener("pointerleave", resume);
      node.removeEventListener("focusin", pause);
      node.removeEventListener("focusout", resume);
    };
  }, [pointerSelector, rootRef]);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (!sequence.requestedPlay || !visible || !pageVisible || reducedMotion || pointerActive) return;
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
  }, [count, interval, loop, pageVisible, pointerActive, reducedMotion, sequence.index, sequence.requestedPlay, visible]);

  const choose = useCallback((nextIndex: number) => {
    const boundedIndex = Math.max(0, Math.min(count - 1, nextIndex));
    setSequence((current) => ({
      index: boundedIndex,
      requestedPlay: current.requestedPlay,
      visitedMask: current.visitedMask | (1 << boundedIndex),
    }));
  }, [count]);
  const next = useCallback(() => {
    setSequence((current) => {
      const nextIndex = loop ? (current.index + 1) % count : Math.min(current.index + 1, count - 1);
      return { index: nextIndex, requestedPlay: current.requestedPlay, visitedMask: current.visitedMask | (1 << nextIndex) };
    });
  }, [count, loop]);
  const previous = useCallback(() => {
    setSequence((current) => {
      const nextIndex = loop ? (current.index - 1 + count) % count : Math.max(current.index - 1, 0);
      return { index: nextIndex, requestedPlay: current.requestedPlay, visitedMask: current.visitedMask | (1 << nextIndex) };
    });
  }, [count, loop]);
  const toggle = useCallback(() => {
    if (reducedMotion) return;
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
    playing: sequence.requestedPlay && visible && pageVisible && !pointerActive && !reducedMotion,
    autoplayEnabled: sequence.requestedPlay,
    complete: sequence.visitedMask === (1 << count) - 1,
    motionDisabled: reducedMotion,
    choose,
    next,
    previous,
    toggle,
  };
}

type HeroHighlight = {
  phrase: string;
  kind: "signal" | "university" | "proof" | "metric";
  crest?: boolean;
};

type HeroStatement = {
  full: string;
  compact: string;
  highlights: readonly HeroHighlight[];
  compactHighlights: readonly HeroHighlight[];
};

const HERO_STATEMENTS: readonly HeroStatement[] = [
  {
    full: "Hi, welcome to my portfolio. I am Yashwant Bhyri, a Year 4 Computer Science and AI student at CUHK-Shenzhen (CUHK · QS World #18).",
    compact: "Year 4 Computer Science and AI student at CUHK-Shenzhen (CUHK · QS World #18).",
    highlights: [
      { phrase: "Computer Science and AI", kind: "signal" },
      { phrase: "CUHK-Shenzhen", kind: "university", crest: true },
      { phrase: "(CUHK · QS World #18)", kind: "proof" },
    ],
    compactHighlights: [
      { phrase: "Computer Science and AI", kind: "signal" },
      { phrase: "CUHK-Shenzhen", kind: "university", crest: true },
      { phrase: "(CUHK · QS World #18)", kind: "proof" },
    ],
  },
  {
    full: "I have 1+ years of experience building advanced AI applications spanning agent and multi-agent orchestration, deep reasoning, multimodal I/O, advanced memory and retrieval, production observability, and agent reinforcement-learning observability and refinement.",
    compact: "1+ years spanning agent and multi-agent orchestration, deep reasoning, multimodal I/O, advanced memory + retrieval, production observability, and agent RL observability + refinement.",
    highlights: [
      { phrase: "1+ years", kind: "metric" },
      { phrase: "agent and multi-agent orchestration", kind: "signal" },
      { phrase: "deep reasoning", kind: "signal" },
      { phrase: "multimodal I/O", kind: "signal" },
      { phrase: "advanced memory and retrieval", kind: "proof" },
      { phrase: "production observability", kind: "proof" },
      { phrase: "agent reinforcement-learning observability and refinement", kind: "signal" },
    ],
    compactHighlights: [
      { phrase: "1+ years", kind: "metric" },
      { phrase: "agent and multi-agent orchestration", kind: "signal" },
      { phrase: "deep reasoning", kind: "signal" },
      { phrase: "multimodal I/O", kind: "signal" },
      { phrase: "advanced memory + retrieval", kind: "proof" },
      { phrase: "production observability", kind: "proof" },
      { phrase: "RL observability + refinement systems", kind: "signal" },
    ],
  },
  {
    full: "My engineering record spans 3 internships and 2 research experiences across applied AI systems.",
    compact: "3 engineering internships and 2 research experiences across applied AI systems.",
    highlights: [
      { phrase: "3 internships", kind: "metric" },
      { phrase: "2 research experiences", kind: "metric" },
    ],
    compactHighlights: [
      { phrase: "3 engineering internships", kind: "metric" },
      { phrase: "2 research experiences", kind: "metric" },
    ],
  },
] as const;

function HeroHighlightedText({
  text,
  cursor,
  highlights,
}: {
  text: string;
  cursor: number;
  highlights: readonly HeroHighlight[];
}) {
  const visibleEnd = Math.min(cursor, text.length);
  const ranges = highlights
    .map((highlight) => {
      const start = text.indexOf(highlight.phrase);
      return start < 0 ? null : { ...highlight, start, end: start + highlight.phrase.length };
    })
    .filter((range): range is HeroHighlight & { start: number; end: number } => Boolean(range))
    .sort((a, b) => a.start - b.start);

  const segments: React.ReactNode[] = [];
  let position = 0;
  ranges.forEach((range, index) => {
    if (position < range.start && position < visibleEnd) {
      segments.push(<span key={`plain-${index}`}>{text.slice(position, Math.min(range.start, visibleEnd))}</span>);
    }
    if (visibleEnd > range.start) {
      segments.push(
        <em
          key={`${range.phrase}-${index}`}
          className="vx-hero-highlight"
          data-kind={range.kind}
          data-complete={visibleEnd >= range.end}
        >
          {range.crest ? (
            <Image
              className="vx-cuhk-inline-logo"
              src="/brands/cuhk.png"
              alt=""
              aria-hidden="true"
              width={32}
              height={22}
              unoptimized
            />
          ) : null}
          {text.slice(range.start, Math.min(range.end, visibleEnd))}
        </em>,
      );
    }
    position = range.end;
  });
  if (position < visibleEnd) segments.push(<span key="plain-tail">{text.slice(position, visibleEnd)}</span>);
  return <>{segments}</>;
}

function useHeroChoreography(reducedMotion: boolean) {
  const [statement, setStatement] = useState(0);
  const [cursor, setCursor] = useState(0);
  const [resolved, setResolved] = useState(0);
  const [phase, setPhase] = useState<"boot" | "typing" | "holding" | "deleting" | "split" | "deck" | "ready">("boot");
  const text = HERO_STATEMENTS[statement].full;

  const skip = useCallback(() => {
    setStatement(HERO_STATEMENTS.length - 1);
    setCursor(0);
    setResolved(HERO_STATEMENTS.length);
    setPhase("ready");
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      const timer = window.setTimeout(skip, 0);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setPhase("typing"), 180);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, skip]);

  useEffect(() => {
    if (phase !== "typing") return;
    const timer = window.setTimeout(() => {
      if (cursor >= text.length) setPhase("holding");
      else setCursor((value) => Math.min(text.length, value + 1));
    }, cursor >= text.length ? 0 : 18 + (cursor % 5) * 3);
    return () => window.clearTimeout(timer);
  }, [cursor, phase, text.length]);

  useEffect(() => {
    if (phase !== "holding") return;
    const timer = window.setTimeout(() => setPhase("deleting"), 1180);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "deleting") return;
    const timer = window.setTimeout(() => {
      if (cursor > 0) {
        setCursor((value) => Math.max(0, value - 2));
        return;
      }
      setResolved((value) => Math.max(value, statement + 1));
      if (statement === HERO_STATEMENTS.length - 1) {
        setPhase("split");
      } else {
        setStatement((value) => value + 1);
        setPhase("typing");
      }
    }, cursor > 0 ? 11 : 90);
    return () => window.clearTimeout(timer);
  }, [cursor, phase, statement]);

  useEffect(() => {
    if (phase !== "split") return;
    const timer = window.setTimeout(() => setPhase("deck"), 620);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "deck") return;
    const timer = window.setTimeout(() => setPhase("ready"), 520);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const collapsed = phase === "split" || phase === "deck" || phase === "ready";

  return {
    text,
    visible: text.slice(0, cursor),
    cursor,
    statement,
    phase,
    resolved,
    ready: phase === "ready",
    collapsed,
    deckVisible: phase === "deck" || phase === "ready",
    contactVisible: phase === "ready",
    deleting: phase === "deleting",
    skip,
  };
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
            const bright = inPrimary && ti === cycle % cluster.terms.length;
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
        {GALAXY_ANCHORS.map(([term, x, y], index) => (
          <span
            key={term}
            className="vx-galaxy-anchor"
            data-visible="true"
            data-bright={index === cycle % GALAXY_ANCHORS.length}
            style={{
              "--x": `${x}%`,
              "--y": `${y}%`,
              "--dx": `${index % 2 === 0 ? 3 : -4}px`,
              "--dy": `${index % 2 === 0 ? -2 : 4}px`,
              "--term-delay": `${index * -2.1}s`,
            } as CSSProperties}
          >
            <i />{term}
          </span>
        ))}
      </div>
      <div className="vx-galaxy-mask" />
    </div>
  );
}

function HeroProjectDeck({ reducedMotion, ready }: { reducedMotion: boolean; ready: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  // The deck flips on its own, always — only hovering the controls pauses it,
  // never merely resting the cursor on the cards.
  const deck = useAutoplaySequence(PROJECTS.length, 2800, ref, reducedMotion || !ready, {
    loop: true,
    pointerSelector: ".vx-deck-controls",
  });
  return (
    <div ref={ref} className="vx-hero-deck" data-ready={ready} data-motion-paused={!deck.playing} aria-hidden={!ready}>
      <div className="vx-deck-status"><i className={deck.playing ? "is-live" : ""} /> SELECTED SYSTEMS <span>{String(deck.index + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")}</span></div>
      <div className="vx-deck-stage">
        {PROJECTS.map((project, index) => {
          const offset = (index - deck.index + PROJECTS.length) % PROJECTS.length;
          const active = offset === 0;
          return (
            <a
              key={project.id}
              href={`#${project.id}`}
              className={`vx-deck-card vx-accent-${project.accent}`}
              data-position={offset}
              tabIndex={ready && active ? 0 : -1}
              aria-hidden={!active}
            >
              <span>{project.number} · {project.brand}</span>
              <i className="vx-deck-badge">{project.badge}</i>
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

const CONTACT_CHANNELS = [
  {
    label: "University email",
    value: "123040005@link.cuhk.edu.cn",
    href: "mailto:123040005@link.cuhk.edu.cn",
  },
  {
    label: "Phone",
    value: "+86 159 1412 2353",
    href: "tel:+8615914122353",
  },
  {
    label: "Personal email",
    value: "bvyashwantkumar900@gmail.com",
    href: "mailto:bvyashwantkumar900@gmail.com",
  },
  {
    label: "LinkedIn",
    value: "Venkata Yashwant Kumar Bhyri",
    href: "https://hk.linkedin.com/in/venkata-yashwant-kumar-bhyri-31a50636a",
  },
  {
    label: "WeChat",
    value: "Yashwant_Bhyri",
    href: "weixin://dl/chat?Yashwant_Bhyri",
  },
] as const;

const SHORT_CALL_HREF =
  "mailto:123040005@link.cuhk.edu.cn?subject=Portfolio%20opportunity%20or%2015-minute%20call";

function ContactChannels({ compact = false }: { compact?: boolean }) {
  return (
    <div className="vx-contact-channels" data-compact={compact}>
      {CONTACT_CHANNELS.map((channel) => (
        <a key={channel.label} href={channel.href}>
          <span>{channel.label}</span>
          <strong>{channel.value}</strong>
        </a>
      ))}
    </div>
  );
}

function Hero({ reducedMotion }: { reducedMotion: boolean }) {
  const hero = useHeroChoreography(reducedMotion);
  return (
    <section id="top" className="vx-hero vx-page" data-vx-page data-phase={hero.phase}>
      <GalaxyField reducedMotion={reducedMotion} />
      <div className="vx-hero-shell">
        <div className="vx-hero-credentials">
          <div className="vx-terminal-label">
            <i />
            <span>YASHWANT / AI SYSTEMS PORTFOLIO</span>
            <small>{hero.ready ? "READY" : hero.deleting ? "BACKSPACING" : "WRITING"}</small>
          </div>
          {!hero.collapsed ? (
            <div className="vx-hero-central-intro">
              <h1 className="vx-hero-script" aria-label={hero.text} data-statement={hero.statement}>
                <span className="vx-hero-script-measures" aria-hidden="true">
                  {HERO_STATEMENTS.map((item, index) => (
                    <span key={item.full} data-statement={index}>
                      <HeroHighlightedText
                        text={item.full}
                        cursor={item.full.length}
                        highlights={item.highlights}
                      />
                    </span>
                  ))}
                </span>
                <span className="vx-hero-script-live" data-statement={hero.statement} aria-hidden="true">
                  <HeroHighlightedText
                    text={hero.text}
                    cursor={hero.cursor}
                    highlights={HERO_STATEMENTS[hero.statement].highlights}
                  />
                  <i data-deleting={hero.deleting} />
                </span>
              </h1>
            </div>
          ) : (
            <div className="vx-hero-capsule-content">
              <p className="vx-hero-intro">Hi, I&apos;m</p>
              <h1>Yashwant Bhyri.</h1>
              <ul className="vx-credential-list" aria-label="Profile summary">
                {HERO_STATEMENTS.map((item, index) => (
                  <li key={item.compact} style={{ "--credential-delay": `${index * 90}ms` } as CSSProperties}>
                    <i aria-hidden="true">✦</i>
                    <span>
                      <HeroHighlightedText
                        text={item.compact}
                        cursor={item.compact.length}
                        highlights={item.compactHighlights}
                      />
                    </span>
                    <small>{String(index + 1).padStart(2, "0")}</small>
                  </li>
                ))}
              </ul>
              <div className="vx-hero-actions">
                <a className="vx-primary-action" href="#projects">Explore my projects <i>↓</i></a>
                <a href="/yashwant-bhyri-resume.pdf" target="_blank" rel="noreferrer">View my résumé ↗</a>
                <a href="https://github.com/Yashwant-Bhyri" target="_blank" rel="noreferrer">Open GitHub ↗</a>
                <a href="#hero-contact">Contact me ↘</a>
              </div>
            </div>
          )}
        </div>
        {hero.contactVisible ? (
          <aside id="hero-contact" className="vx-hero-contact" aria-label="Contact Yashwant">
            <div>
              <span>OPEN TO RELEVANT AI ROLES</span>
              <strong>Have a position or a system worth building?</strong>
            </div>
            <ContactChannels compact />
            <a className="vx-short-call" href={SHORT_CALL_HREF}>Request a 15-minute call <i>↗</i></a>
          </aside>
        ) : null}
        <HeroProjectDeck reducedMotion={reducedMotion} ready={hero.deckVisible} />
      </div>
      {!hero.ready ? <button type="button" className="vx-skip-intro" onClick={hero.skip} data-hero-skip-ignore>Skip introduction →</button> : <a className="vx-scroll-cue" href="#projects"><i /> Scroll into the systems</a>}
    </section>
  );
}

/** Types text once the element scrolls into view. Returns visible slice + done. */
function useTypeOnView(
  ref: React.RefObject<HTMLElement | null>,
  text: string,
  cps = 34,
) {
  const reducedMotion = useReducedMotion();
  const [started, setStarted] = useState(false);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setStarted(true);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [reducedMotion, ref]);
  useEffect(() => {
    if (reducedMotion || !started || n >= text.length) return;
    const timer = window.setTimeout(() => setN((v) => v + 1), 1000 / cps);
    return () => window.clearTimeout(timer);
  }, [started, n, text.length, cps, reducedMotion]);
  return {
    visible: reducedMotion ? text : text.slice(0, n),
    done: reducedMotion || n >= text.length,
    started: reducedMotion || started,
  };
}

/** Spotlight cycle for the project cards: one quick lap, then a slow lap, looping. */
const SPOT_DURATIONS = [3600, 3600, 3600, 3600];

const INDEX_SUB = "Four systems, each introduced in human terms before the architecture goes deep.";

function ProjectIndex() {
  const reducedMotion = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hook = useTypeOnView(headingRef, "So, what did I build?", 22);
  const [subN, setSubN] = useState(0);
  useEffect(() => {
    if (reducedMotion) return;
    if (!hook.done || subN >= INDEX_SUB.length) return;
    const timer = window.setTimeout(() => setSubN((v) => v + 1), 24);
    return () => window.clearTimeout(timer);
  }, [hook.done, reducedMotion, subN]);
  const visibleSubN = reducedMotion ? INDEX_SUB.length : subN;
  const sub = { visible: INDEX_SUB.slice(0, visibleSubN), done: visibleSubN >= INDEX_SUB.length };
  const [spot, setSpot] = useState(-1);
  const [manualSpot, setManualSpot] = useState<number | null>(null);
  useEffect(() => {
    if (!sub.done) return;
    if (reducedMotion) return;
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
  }, [reducedMotion, sub.done]);
  const currentSpot = manualSpot ?? (reducedMotion ? 0 : spot < 0 ? 0 : spot);
  return (
    <section id="projects" className="vx-project-index vx-section-shell vx-page" data-vx-page>
      <div className="vx-section-heading">
        <span>SELECTED WORK / FOUR SYSTEMS</span>
        <h2 ref={headingRef} className={`vx-typed-h ${hook.done ? "is-done" : ""}`} aria-label="So, what did I build?">
          <span className="vx-typed-live" aria-hidden="true">
            <em className="vx-paint-target">{hook.visible}</em>
            {hook.started && !hook.done ? <i className="vx-type-caret" /> : null}
          </span>
          <b className="vx-typed-ghost" aria-hidden="true">So, what did I build?</b>
        </h2>
        <p className="vx-typed-sub">
          <span className="vx-typed-live" aria-hidden="true">
            {hook.done ? sub.visible : ""}
            {hook.done && !sub.done ? <i className="vx-type-caret" /> : null}
          </span>
          <b className="vx-typed-ghost" aria-hidden="true">{INDEX_SUB}</b>
        </p>
        <p>The walkthrough starts automatically when a project reaches the viewport. Pause only when you want to inspect a state.</p>
      </div>
      <div className="vx-project-grid">
        {PROJECTS.map((project, cardIdx) => {
          const active = currentSpot === cardIdx;
          return (
            <a
              href={`#${project.id}`}
              key={project.id}
              className={`vx-project-card vx-accent-${project.accent} ${active ? "is-spotlit" : ""}`}
              data-active={active}
              onPointerEnter={() => setManualSpot(cardIdx)}
              onPointerLeave={() => setManualSpot(null)}
              onFocus={() => setManualSpot(cardIdx)}
              onBlur={() => setManualSpot(null)}
            >
              <div className="vx-project-meta"><span>{project.number}</span><i>{project.brand}</i></div>
              <small className="vx-project-badge">{project.badge}</small>
              <h3>{project.category}</h3>
              <div className="vx-project-card-switch" data-face={active ? "summary" : "architecture"}>
                <div className="vx-project-card-summary" aria-hidden={!active}>
                  <p>{project.summary}</p>
                  <div className="vx-project-proof">{project.proof.map((item) => <span key={item}>{item}</span>)}</div>
                </div>
                <div className="vx-project-mini-architecture" aria-hidden={active}>
                  <span>COMPRESSED SYSTEM FLOW</span>
                  <ol>
                    {project.architecture.map((node, index) => (
                      <li key={node}><i>{String(index + 1).padStart(2, "0")}</i><strong>{node}</strong><b /></li>
                    ))}
                  </ol>
                </div>
              </div>
              <div className="vx-project-topology" aria-hidden="true"><i /><i /><i /><i /><b /></div>
              <strong>Explore architecture <i>↘</i></strong>
            </a>
          );
        })}
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

type SignalTickerEntry = {
  label: string;
  value?: string;
};

function signalHashtag(label: string) {
  return `#${label.replace(/[^a-zA-Z0-9+#]+/g, "")}`;
}

function SignalTicker({
  items,
  label,
  active,
  reducedMotion,
  variant = "tags",
  cycleMs = 7600,
}: {
  items: readonly SignalTickerEntry[];
  label: string;
  active: boolean;
  reducedMotion: boolean;
  variant?: "tags" | "metrics";
  cycleMs?: number;
}) {
  const [centerIndex, setCenterIndex] = useState(0);
  const slotMs = Math.max(640, Math.min(2200, Math.floor(cycleMs / Math.max(1, items.length))));
  const itemWidth = variant === "metrics" ? 210 : 144;
  const starWidth = variant === "metrics" ? 22 : 18;

  useEffect(() => {
    if (!active || reducedMotion || items.length < 2) return;
    const timer = window.setInterval(() => {
      setCenterIndex((current) => (current + 1) % items.length);
    }, slotMs);
    return () => window.clearInterval(timer);
  }, [active, items.length, reducedMotion, slotMs]);

  if (items.length === 0) return null;

  const renderCycle = (cycle: number, accessible: boolean) => items.flatMap((item, index) => [
    <li
      key={`${cycle}-${item.label}-${item.value ?? "tag"}`}
      aria-hidden={accessible ? undefined : true}
      data-center={index === centerIndex}
      data-signal-index={index}
    >
      {variant === "tags" ? (
        <span aria-label={item.label}>{signalHashtag(item.label)}</span>
      ) : (
        <>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </>
      )}
    </li>,
    <li key={`${cycle}-${item.label}-star`} className="vx-signal-ticker-star" aria-hidden="true">✦</li>,
  ]);
  const tickerStyle = {
    "--vx-signal-count": items.length,
    "--vx-signal-index": centerIndex,
    "--vx-signal-slot-ms": `${slotMs}ms`,
    "--vx-signal-cycle-ms": `${cycleMs}ms`,
    "--vx-signal-item-width": `${itemWidth}px`,
    "--vx-signal-star-width": `${starWidth}px`,
    "--vx-signal-offset": `${-(centerIndex * (itemWidth + starWidth) + itemWidth / 2)}px`,
  } as CSSProperties;

  return (
    <div
      className={`vx-signal-ticker vx-signal-ticker-${variant}`}
      data-active={active}
      data-running={active && !reducedMotion}
      data-reduced-motion={reducedMotion}
      style={tickerStyle}
    >
      <div className="vx-signal-ticker-viewport">
        <ul className="vx-signal-ticker-track vx-signal-ticker-track-base" aria-label={label} role="list">
          {renderCycle(0, true)}
          {renderCycle(1, false)}
        </ul>
        <ul className="vx-signal-ticker-track vx-signal-ticker-track-mask" aria-hidden="true" role="presentation">
          {renderCycle(0, false)}
          {renderCycle(1, false)}
        </ul>
        <i className="vx-signal-ticker-center-lens" aria-hidden="true" />
      </div>
    </div>
  );
}

function HighlightedStageAnnotation({
  text,
  cursor,
  highlights,
}: {
  text: string;
  cursor: number;
  highlights: readonly string[];
}) {
  const visibleEnd = Math.min(cursor, text.length);
  const ranges = highlights
    .map((phrase) => {
      const start = text.indexOf(phrase);
      return start < 0 ? null : { phrase, start, end: start + phrase.length };
    })
    .filter((range): range is { phrase: string; start: number; end: number } => Boolean(range))
    .sort((a, b) => a.start - b.start);
  const segments: React.ReactNode[] = [];
  let position = 0;

  ranges.forEach((range, index) => {
    if (range.start < position) return;
    if (position < range.start && position < visibleEnd) {
      segments.push(<span key={`plain-${index}`}>{text.slice(position, Math.min(range.start, visibleEnd))}</span>);
    }
    if (visibleEnd > range.start) {
      segments.push(
        <em
          key={`${range.phrase}-${index}`}
          className="vx-stage-annotation-emphasis"
          data-complete={visibleEnd >= range.end}
        >
          {text.slice(range.start, Math.min(range.end, visibleEnd))}
        </em>,
      );
    }
    position = range.end;
  });
  if (position < visibleEnd) segments.push(<span key="plain-tail">{text.slice(position, visibleEnd)}</span>);
  return <>{segments}</>;
}

function StageSignalConsole({ step, active }: { step: StoryStep; active: boolean }) {
  const reducedMotion = useReducedMotion();
  const [cursor, setCursor] = useState(reducedMotion ? step.annotation.length : 0);
  const tickerItems = useMemo(() => Array.from(new Set([...step.signals, ...step.stack])).map((label) => ({ label })), [step.signals, step.stack]);
  const visibleCursor = reducedMotion ? step.annotation.length : cursor;

  useEffect(() => {
    if (reducedMotion || cursor >= step.annotation.length) return;
    const timer = window.setTimeout(() => setCursor((value) => Math.min(step.annotation.length, value + 1)), 12);
    return () => window.clearTimeout(timer);
  }, [cursor, reducedMotion, step.annotation.length]);

  return (
    <section
      className="vx-stage-signal-console"
      data-typing={visibleCursor < step.annotation.length}
      aria-label={`Implementation signal for ${step.label}`}
    >
      <div className="vx-stage-signal-micro-row" aria-hidden="true">
        <span><i />IMPLEMENTATION SIGNAL</span>
        <small>{step.label}</small>
      </div>
      <i className="vx-stage-signal-diagonal-sweep" aria-hidden="true" />
      <div className="vx-stage-annotation" aria-label={step.annotation}>
        <span className="vx-stage-annotation-live" aria-hidden="true">
          <HighlightedStageAnnotation text={step.annotation} cursor={visibleCursor} highlights={step.annotationHighlights} />
          {visibleCursor < step.annotation.length ? <i /> : null}
        </span>
        <b className="vx-stage-annotation-ghost" aria-hidden="true">{step.annotation}</b>
      </div>
      <SignalTicker
        items={tickerItems}
        label={`${step.label} technologies and engineering capabilities`}
        active={active}
        reducedMotion={reducedMotion}
      />
    </section>
  );
}

function ProjectConclusion({
  name,
  metrics,
  extra,
}: {
  name: string;
  metrics: readonly ConclusionMetric[];
  extra?: React.ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [completedCycle, setCompletedCycle] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setTimeout(() => {
      setActive((current) => {
        const next = (current + 1) % metrics.length;
        if (current === metrics.length - 1) setCompletedCycle(true);
        return next;
      });
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [active, metrics.length, reducedMotion]);

  const metric = metrics[active];

  return (
    <div className="vx-project-conclusion" data-complete={completedCycle || reducedMotion}>
      <div className="vx-conclusion-heading">
        <span>SYSTEM CONCLUSION</span>
        <strong>{name}, resolved into the signals that matter.</strong>
      </div>
      <div className="vx-conclusion-focus" key={`${metric.label}-${active}`}>
        <span>{String(active + 1).padStart(2, "0")} / {String(metrics.length).padStart(2, "0")} · {metric.label}</span>
        <strong>{metric.value}</strong>
        <p>{metric.detail}</p>
      </div>
      <div className="vx-conclusion-rail" role="group" aria-label={`${name} conclusion signals`}>
        {metrics.map((item, index) => (
          <button
            key={item.label}
            type="button"
            aria-pressed={index === active}
            data-active={index === active}
            onClick={() => {
              setActive(index);
              if (index === metrics.length - 1) setCompletedCycle(true);
            }}
          >
            <i>{String(index + 1).padStart(2, "0")}</i>
            <span>{item.label}</span>
            <b />
          </button>
        ))}
      </div>
      {extra ? <div className="vx-conclusion-extra">{extra}</div> : null}
    </div>
  );
}

function SystemWalkthrough({
  name,
  steps,
  controller,
  Visual,
  accent,
  proof,
  conclusionExtra,
}: {
  name: string;
  steps: readonly StoryStep[];
  controller: SequenceController;
  Visual: VisualComponent;
  accent: "lime" | "violet" | "cyan";
  proof: readonly ConclusionMetric[];
  conclusionExtra?: React.ReactNode;
}) {
  const isConclusion = controller.index === steps.length;
  const componentStep = steps[Math.min(controller.index, steps.length - 1)];
  const step: StoryStep = isConclusion
    ? {
        label: "Conclusion",
        title: "The complete system resolves into six recruiter-ready signals.",
        explanation: "Product, contribution, runtime, output, impact, and reliability take the stage one at a time for a fast final revision.",
        annotation: "The completed walkthrough resolves its strongest product, runtime, output, impact, and reliability evidence into one recruiter-ready summary.",
        annotationHighlights: ["recruiter-ready summary"],
        signals: ["Product", "Contribution", "Runtime", "Output", "Impact", "Reliability"],
        input: "Complete component walkthrough",
        operation: "Consolidate the strongest engineering evidence",
        output: "One legible project narrative",
        stack: ["product", "contribution", "runtime", "output", "impact", "reliability"],
        proof: "Final component-microscope stage",
      }
    : componentStep;
  return (
    <div
      className={`vx-walkthrough vx-accent-${accent}`}
      data-motion-paused={!controller.playing}
      data-stage-kind={isConclusion ? "conclusion" : "component"}
    >
      <aside className="vx-story-panel">
        <div className="vx-story-kicker"><span>COMPONENT MICROSCOPE</span><i className={controller.playing ? "is-live" : ""} /></div>
        <div className="vx-stage-rail" role="group" aria-label={`${name} walkthrough stages`}>
          {steps.map((item, index) => (
            <button
              key={item.label}
              type="button"
              onClick={() => controller.choose(index)}
              aria-pressed={controller.index === index}
              data-active={controller.index === index}
              data-stage-kind="component"
            >
              <i>{String(index + 1).padStart(2, "0")}</i>
              <span>{item.label}</span>
              <b />
            </button>
          ))}
          <button
            type="button"
            onClick={() => controller.choose(steps.length)}
            aria-pressed={isConclusion}
            data-active={isConclusion}
            data-stage-kind="conclusion"
          >
            <i>{String(steps.length + 1).padStart(2, "0")}</i>
            <span>Conclusion</span>
            <b />
          </button>
        </div>
        <div className="vx-story-copy">
          <span>{step.label}</span>
          <h3><Emph text={step.title} /></h3>
          <p>{step.explanation}</p>
          {step.proof ? <strong className="vx-proof-chip"><i />{step.proof}</strong> : null}
        </div>
        <StageControls controller={controller} total={steps.length + 1} />
      </aside>
      <div className="vx-operational-stage" aria-label={`${name}: ${step.title}`}>
        <div className="vx-stage-top">
          <span>{isConclusion ? "SYSTEM REVISION" : "OPERATIONAL GRAPHIC"}</span>
          <strong>{step.label}</strong>
          {step.maturity ? <em>{step.maturity}</em> : null}
          <i>{controller.playing ? "AUTOPLAY" : "MANUAL"}</i>
        </div>
        {!isConclusion ? (
          <StageSignalConsole
            key={`${name}-${step.label}`}
            step={step}
            active={controller.playing}
          />
        ) : null}
        <div className="vx-visual-window">
          {isConclusion ? (
            <ProjectConclusion name={name} metrics={proof} extra={conclusionExtra} />
          ) : (
            <Visual active={controller.index} />
          )}
        </div>
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

function useChapterHandoff({
  overviewRef,
  microscopeRef,
  overviewComplete,
  reducedMotion,
}: {
  overviewRef: React.RefObject<HTMLElement | null>;
  microscopeRef: React.RefObject<HTMLElement | null>;
  overviewComplete: boolean;
  reducedMotion: boolean;
}) {
  const handedOff = useRef(false);

  useEffect(() => {
    const microscope = microscopeRef.current;
    if (!microscope) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.28) handedOff.current = true;
    }, { threshold: [0.28] });
    observer.observe(microscope);
    return () => observer.disconnect();
  }, [microscopeRef]);

  useEffect(() => {
    if (!overviewComplete || reducedMotion || handedOff.current) return;
    const timer = window.setTimeout(() => {
      const overview = overviewRef.current;
      const microscope = microscopeRef.current;
      if (!overview || !microscope || handedOff.current) return;
      const rect = overview.getBoundingClientRect();
      const stillReadingOverview = rect.top < window.innerHeight * 0.45 && rect.bottom > window.innerHeight * 0.55;
      if (!stillReadingOverview) return;
      handedOff.current = true;
      microscope.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 2300);
    return () => window.clearTimeout(timer);
  }, [microscopeRef, overviewComplete, overviewRef, reducedMotion]);

  return useCallback(() => {
    handedOff.current = true;
    microscopeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [microscopeRef]);
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
  const titleRef = useRef<HTMLHeadingElement>(null);
  const typedTitle = useTypeOnView(titleRef, title, 46);
  return (
    <div className={`vx-case-heading vx-accent-${accent}`}>
      <span>{number} / {brand}</span>
      <small>{category}</small>
      <h2 ref={titleRef} className="vx-typed-h" aria-label={title}>
        <span className="vx-typed-live" aria-hidden="true">
          {typedTitle.visible}
          {typedTitle.started && !typedTitle.done ? <i className="vx-type-caret" /> : null}
        </span>
        {/* reserves final height so the layout never jumps while typing */}
        <b className="vx-typed-ghost" aria-hidden="true">{title}</b>
      </h2>
      <aside className="vx-contribution-tile">
        <span>MY CONTRIBUTION</span>
        <p><Emph text={copy} /></p>
        <i aria-hidden="true" />
      </aside>
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
  architecturePath,
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
  architecturePath: readonly number[];
  children?: React.ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  const overviewRef = useRef<HTMLElement>(null);
  const microscopeRef = useRef<HTMLElement>(null);
  const overviewController = useAutoplaySequence(architecturePath.length, 2200, overviewRef, reducedMotion, {
    observeSelector: ".vx-overview-shell",
  });
  const controller = useAutoplaySequence(steps.length + 1, 11800, microscopeRef, reducedMotion, {
    observeSelector: ".vx-walkthrough",
  });
  const moveToMicroscope = useChapterHandoff({
    overviewRef,
    microscopeRef,
    overviewComplete: overviewController.complete,
    reducedMotion,
  });

  const selectArchitectureNode = useCallback((index: number) => {
    controller.choose(index);
    moveToMicroscope();
  }, [controller, moveToMicroscope]);

  return (
    <>
      <section
        ref={overviewRef}
        id={id}
        className={`vx-case-overview-page vx-case-${id} vx-accent-${accent} vx-page`}
        data-vx-page
        data-chapter={id}
      >
        <div className="vx-section-shell">
          <CaseHeading number={number} brand={brand} category={category} title={title} copy={copy} accent={accent} />
          <div className="vx-overview-shell">
            <div className="vx-overview-top">
              <span>HIGH-LEVEL ARCHITECTURE</span>
              <strong>Follow the signal from input to outcome.</strong>
              <i>{overviewController.playing ? "AUTOPLAY" : "READY"}</i>
            </div>
            <Overview
              active={architecturePath[overviewController.index] ?? 0}
              onSelect={selectArchitectureNode}
            />
          </div>
          <button type="button" className="vx-architecture-handoff" onClick={moveToMicroscope}>
            <span>Architecture complete</span>
            <strong>Continue into the component microscope</strong>
            <i>↓</i>
          </button>
        </div>
      </section>
      <section
        ref={microscopeRef}
        id={`${id}-microscope`}
        className={`vx-case-microscope-page vx-case-${id} vx-accent-${accent} vx-page`}
        data-vx-page
        data-chapter={`${id}-microscope`}
      >
        <div className="vx-section-shell">
          <div className="vx-microscope-identity">
            <span>{number} / {brand}</span>
            <strong>{title}</strong>
            <small>{category}</small>
          </div>
          <SystemWalkthrough
            name={brand}
            steps={steps}
            controller={controller}
            Visual={Visual}
            accent={accent}
            proof={proof}
            conclusionExtra={children}
          />
        </div>
      </section>
    </>
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
      category="PRODUCTION-GRADE SOFTWARE PRODUCT · REAL-TIME AI-NATIVE INTERVIEWING PLATFORM"
      title="Production-grade AI interview software for automating technical interviews at scale."
      copy="I built the ⟪multi-agent orchestration and decision engine⟫ behind Antigravity. It conducts live technical interviews, reasons over candidate responses, adapts the question graph, interacts through a real-time voice layer, and assembles ⟪evidence-backed recruiter reports⟫ for hiring decisions."
      accent="lime"
      steps={ANTIGRAVITY_STEPS}
      Overview={AntigravityOverview}
      Visual={LiveAntigravityVisual}
      architecturePath={[0, 1, 5, 6]}
      proof={[
        { label: "PRODUCT", value: "Voice-native technical interviewing", detail: "Adaptive interviews designed to operate at screening scale" },
        { label: "MY CONTRIBUTION", value: "Multi-agent orchestration + decision engine", detail: "Question routing, agent convergence, guarded prepared-question promotion, and report logic" },
        { label: "RUNTIME", value: "Guarded dual-lane interview graph", detail: "Latency-aware foreground routing while deeper next-turn analysis continues" },
        { label: "OUTPUT", value: "Evidence-linked recruiter report", detail: "Ability, credibility, coverage, uncertainty, and untested dimensions" },
        { label: "IMPACT", value: "250+ completed interviews", detail: "A deployed workflow with a real three-turn portfolio replay" },
        { label: "RELIABILITY", value: "Fallbacks + offline agent evaluation", detail: "Prepared audio, state recovery, telemetry, regression replay, and versioned route policies" },
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
      brand="WONDERSHARE FILMORA"
      category="AI APPLICATION ENGINEERING INTERNSHIP · MULTIMODAL AI PRODUCTION SYSTEM"
      title="An end-to-end multimodal AI production runtime integrated into Filmora Enterprise."
      copy="During my Wondershare Filmora internship, I built an ⟪end-to-end multimodal AI production runtime integrated into Filmora Enterprise⟫. It combines real-time market research and product intelligence with memory, retrieval, function calling, and multimodal agent-planning graphs across video, audio, dialogue, captions, effects, and editable timeline assembly. ⟪Guardrails, observability, reinforcement-learning refinement, cost controls, and human approval⟫ govern the workflow."
      accent="violet"
      steps={FILMORA_STEPS}
      Overview={FilmoraOverview}
      Visual={LiveFilmoraVisual}
      architecturePath={[0, 1, 4, 5, 6]}
      proof={[
        { label: "PRODUCT", value: "End-to-end multimodal AI production runtime", detail: "Research, planning, generation, editable assembly, and human review integrated into Filmora Enterprise" },
        { label: "MY CONTRIBUTION", value: "Research-to-production orchestration layer", detail: "Memory, retrieval, function contracts, agent handoffs, guardrails, tracing, and evaluation" },
        { label: "INPUT", value: "Research + product intelligence", detail: "700+ reusable signals become ranked production context and executable skills" },
        { label: "OUTPUT", value: "Editable multimodal timeline", detail: "Video, music, dialogue, captions, effects, and metadata stay separable" },
        { label: "IMPACT", value: "Trace-led cost + latency optimization", detail: "Token, route, retry, and generation traces expose cost and latency at every handoff" },
        { label: "RELIABILITY", value: "Guarded human-in-the-loop runtime", detail: "Fallbacks, checkpoints, model routing, agent evaluations, regression, and final approval" },
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
      category="MEDICAL AI R&D PROJECT · CLINICIAN-SUPPORT PRODUCT"
      title="A medical AI assistant for evidence-grounded, clinician-controlled mental-health screening and diagnostic review."
      copy="I built a medical AI R&D product that turns live session signals into a ⟪traceable mental-health screening and diagnostic-review workflow⟫. Multimodal perception, longitudinal memory, hybrid clinical retrieval, grounded reasoning, independent validation, and human review remain inspectable from source evidence to final action. ⟪The clinician retains final judgment⟫."
      accent="cyan"
      steps={MINDSCAPE_STEPS}
      Overview={MindScapeOverview}
      Visual={LiveMindScapeVisual}
      architecturePath={[0, 1, 2, 3, 4, 5, 6]}
      proof={[
        { label: "PRODUCT", value: "Medical AI clinician-support R&D product", detail: "A synthetic-data prototype for traceable review, not production clinical software" },
        { label: "MY CONTRIBUTION", value: "Inspectable session-to-review workflow", detail: "Capture, perception, fusion, retrieval, reasoning, validation, review, and governed RL refinement" },
        { label: "RUNTIME", value: "Streaming session-to-review path", detail: "Time-aligned packets preserve the words and signals behind each state" },
        { label: "GROUNDING", value: "Dense + lexical + rerank", detail: "Clinical evidence is retrieved, merged, reranked, and attached to claims" },
        { label: "SAFETY", value: "Model + deterministic validation", detail: "Unsupported language is challenged before the review surface" },
        { label: "OUTPUT", value: "Clinician-owned review packet", detail: "Source, claim, uncertainty, warnings, follow-up, and governed feedback stay together" },
      ]}
    >
      <div className="vx-safety-note"><span>SYNTHETIC CLINICAL WORKFLOW</span><small>Research and decision support only: not autonomous diagnosis, medical advice, emergency dispatch, or production clinical software.</small></div>
    </FlagshipChapter>
  );
}

type ResearchItem = (typeof RESEARCH)[number];

function ResearchCard({
  item,
  index,
  active,
  seen,
  reducedMotion,
  playing,
  setRef,
  onSelect,
}: {
  item: ResearchItem;
  index: number;
  active: boolean;
  seen: boolean;
  reducedMotion: boolean;
  playing: boolean;
  setRef: (node: HTMLElement | null) => void;
  onSelect: () => void;
}) {
  return (
    <article
      ref={setRef}
      data-tone={item.tone}
      data-active={active}
      data-seen={seen}
      aria-current={active ? "step" : undefined}
      tabIndex={0}
      role="button"
      aria-label={`Show research record ${index + 1}: ${item.title}`}
      onFocus={onSelect}
      onClick={onSelect}
      onPointerEnter={onSelect}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onSelect();
      }}
    >
      <div className="vx-research-card-top">
        <span>{String(index + 1).padStart(2, "0")} · {item.badge}</span>
        {"logo" in item ? (
          <Image
            className="vx-lalamove-logo"
            src={item.logo}
            alt="Lalamove"
            width={164}
            height={42}
            unoptimized
          />
        ) : null}
        <small>{item.meta}</small>
      </div>
      <div className="vx-research-card-visual">
        <LiveResearchMini index={item.visual} active={active} />
      </div>
      <div className="vx-research-card-copy">
        <h3>{item.title}</h3>
        <p>{item.copy}</p>
        <div className="vx-research-card-signals">
          <SignalTicker
            items={item.stack.map((technology) => ({ label: technology }))}
            label={`${item.title} technologies`}
            active={active && playing}
            reducedMotion={reducedMotion}
            variant="tags"
            cycleMs={7600}
          />
          <SignalTicker
            items={item.signals}
            label={`${item.title} engineering metrics`}
            active={active && playing}
            reducedMotion={reducedMotion}
            variant="metrics"
            cycleMs={7600}
          />
        </div>
      </div>
      <i className="vx-research-progress" aria-hidden="true" />
    </article>
  );
}

function ResearchSection() {
  const reducedMotion = useReducedMotion();
  const sequenceRef = useRef<HTMLDivElement>(null);
  const secondPageRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const node = sequenceRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "-10% 0px -10%",
      threshold: 0.05,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !playing || reducedMotion) return;
    const timer = window.setTimeout(() => {
      if (active < RESEARCH.length - 1) {
        const next = active + 1;
        setActive(next);
        if (next === 3) {
          secondPageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }
      setPlaying(false);
      document.querySelector<HTMLElement>("#contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 7600);
    return () => window.clearTimeout(timer);
  }, [active, playing, reducedMotion, visible]);

  const controls = (
    <div className="vx-research-sequence-controls" aria-label="Research walkthrough playback">
      <span>{String(active + 1).padStart(2, "0")} / {String(RESEARCH.length).padStart(2, "0")}</span>
      <button type="button" disabled={reducedMotion} onClick={() => setPlaying((value) => !value)}>
        <i data-playing={playing && !reducedMotion} />
        {reducedMotion ? "Static view" : playing ? "Pause sequence" : "Resume sequence"}
      </button>
    </div>
  );

  const cards = (start: number, end: number) => (
    <div className="vx-research-grid" data-page={start === 0 ? "one" : "two"}>
      {RESEARCH.slice(start, end).map((item, localIndex) => {
        const index = start + localIndex;
        return (
          <ResearchCard
            key={item.title}
            item={item}
            index={index}
            active={active === index}
            seen={index <= active}
            reducedMotion={reducedMotion}
            playing={playing}
            setRef={(node) => {
              cardRefs.current[index] = node;
            }}
            onSelect={() => setActive(index)}
          />
        );
      })}
    </div>
  );

  return (
    <div ref={sequenceRef} className="vx-research-sequence" data-motion-paused={!playing}>
      <section id="research" className="vx-research vx-research-page vx-section-shell vx-page" data-vx-page>
        <div className="vx-research-heading">
          <span>04 / OPEN SOURCE · RESEARCH · R&amp;D</span>
          <h2>Open-source, research, internship, and R&amp;D work—six systems with the mechanism visible.</h2>
          <div>
            <p>Each record shows what ran, how it was evaluated, and what the work produced.</p>
            {controls}
          </div>
        </div>
        {cards(0, 3)}
      </section>
      <section
        ref={secondPageRef}
        id="research-cont"
        className="vx-research vx-research-page vx-section-shell vx-page"
        data-vx-page
      >
        <div className="vx-research-heading vx-research-heading-cont">
          <span>04–06 / LOGISTICS · BROWSER PERCEPTION · CONTROLLED GENERATION</span>
          <h2>Applied R&amp;D across operational AI, browser perception, and controlled generation.</h2>
          <div>
            <p>The sequence continues automatically through the final three records.</p>
            {controls}
          </div>
        </div>
        {cards(3, 6)}
      </section>
    </div>
  );
}

function ContactDock() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const frame = window.requestAnimationFrame(() => {
      drawerRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    });
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", closeOnEscape);
      trigger?.focus();
    };
  }, [open]);

  return (
    <aside className="vx-contact-dock" data-open={open} aria-label="Contact Yashwant">
      {open ? (
        <div
          ref={drawerRef}
          id="vx-contact-panel"
          className="vx-contact-drawer"
          role="dialog"
          aria-labelledby="vx-contact-panel-title"
        >
          <div>
            <span>CONTACT</span>
            <strong id="vx-contact-panel-title">Let&apos;s discuss the role, the system, or the research.</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close contact panel">×</button>
          </div>
          <ContactChannels />
          <a className="vx-short-call" href={SHORT_CALL_HREF}>Request a 15-minute call <i aria-hidden="true">↗</i></a>
        </div>
      ) : null}
      <button
        ref={triggerRef}
        type="button"
        className="vx-contact-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="vx-contact-panel"
        aria-label={open ? "Close contact panel" : "Open contact panel"}
      >
        <i aria-hidden="true" />
        <span>{open ? "Close contact" : "Contact me"}</span>
        <b aria-hidden="true">{open ? "×" : "↗"}</b>
      </button>
    </aside>
  );
}

function ContactSection() {
  return (
    <section id="contact" className="vx-contact-page vx-page" data-vx-page>
      <div className="vx-section-shell">
        <div className="vx-contact-page-copy">
          <span>OPEN TO AI SYSTEMS, AGENT, AND APPLICATION ENGINEERING ROLES</span>
          <h2>If the work is technically ambitious, I&apos;d like to hear about it.</h2>
          <p>Reach me directly for a relevant role, an applied AI system, a research collaboration, or a short technical conversation.</p>
          <div className="vx-contact-page-actions">
            <a className="vx-primary-action" href={SHORT_CALL_HREF}>Request a 15-minute call ↗</a>
            <a href="/yashwant-bhyri-resume.pdf" target="_blank" rel="noreferrer">Open résumé ↗</a>
            <a href="https://github.com/Yashwant-Bhyri" target="_blank" rel="noreferrer">Open GitHub ↗</a>
          </div>
        </div>
        <div className="vx-contact-page-card">
          <ContactChannels />
          <small>WeChat: Yashwant_Bhyri · QR available on request.</small>
        </div>
        <footer className="vx-contact-footer">
          <div><strong>Yashwant Bhyri</strong><span>AI Systems · AI Agents · Full-Stack AI / ML</span></div>
          <p>Built to make the engineering visible.</p>
          <a href="#top">Return to the introduction ↑</a>
        </footer>
      </div>
    </section>
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
    <>
      <a className="vx-skip-link" href="#profile">Skip to portfolio content</a>
      <main ref={shellRef} className="vx-shell">
        <div className="vx-progress" aria-hidden="true"><i /></div>
        <div className="vx-cursor-light" aria-hidden="true" />
        <header className="vx-header">
          <a href="#top" className="vx-brand" aria-label="Yashwant Bhyri, portfolio home"><span>YB</span><div><strong>Yashwant Bhyri</strong><small>AI systems &amp; application engineer</small></div></a>
          <nav aria-label="Portfolio navigation"><a href="#profile">Profile</a><a href="#projects">Projects</a><a href="#antigravity">Interview AI</a><a href="#filmora">Filmora</a><a href="#mindscape">Medical AI</a><a href="#research">Research</a><a href="#contact">Contact</a></nav>
          <a className="vx-header-resume" href="/yashwant-bhyri-resume.pdf" target="_blank" rel="noreferrer">Résumé ↗</a>
        </header>
        <Hero reducedMotion={reducedMotion} />
        <ProfileSection />
        <ProjectIndex />
        <AntigravityChapter />
        <FilmoraChapter />
        <MindScapeChapter />
        <ResearchSection />
        <ContactSection />
        <ContactDock />
      </main>
    </>
  );
}
