"use client";

import { ChapterShell, type StepDef } from "./chapter-shell";
import { Node, Packet } from "./svg-bits";

/* ---------- step graphics ---------- */

function PipelineGraphic() {
  const stages = ["CAPTURE", "PERCEIVE", "FUSE", "RETRIEVE", "REASON", "VALIDATE", "REVIEW"];
  const y = 190;
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      {stages.map((s, i) => {
        const x = 24 + i * 86;
        return (
          <g key={s}>
            {i > 0 && <path d={`M ${x - 14} ${y + 24} L ${x} ${y + 24}`} className="svg-rail hot" />}
            <g className={`svg-node chip ${i === 0 ? "is-lit" : ""}`} style={{ animationDelay: `${i * 0.2}s` }}>
              <rect x={x} y={y} width={72} height={48} rx={9} />
              <text x={x + 36} y={y + 28} textAnchor="middle" className="svg-label small">
                {s}
              </text>
            </g>
          </g>
        );
      })}
      <Packet path={`M 30 ${y + 24} L 610 ${y + 24}`} dur={5.2} />
      <text x={24} y={130} className="svg-sub">SESSION AUDIO · TEXT · CHECK-INS</text>
      <text x={548} y={130} textAnchor="end" className="svg-sub">CLINICIAN HANDOFF</text>
      <text x={24} y={330} className="svg-note">
        Seven stages between a patient session and a clinician's desk — and nothing crosses the last
      </text>
      <text x={24} y={348} className="svg-note">
        gate without being retrieved, grounded, and validated first.
      </text>
    </svg>
  );
}

function PerceiveGraphic() {
  const streams = [
    { y: 60, label: "transcript", d: "words, phrasing, silences" },
    { y: 140, label: "acoustic tokens", d: "tone, pace, hesitation" },
    { y: 220, label: "check-in events", d: "sleep, mood, adherence" },
  ];
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      {streams.map((s, i) => {
        const d = `M 230 ${s.y + 26} C 320 ${s.y + 26} 320 170 400 168`;
        return (
          <g key={s.label}>
            <Node x={40} y={s.y} w={190} h={52} label={s.label.toUpperCase()} sub={s.d} lit={i === 0} />
            <path d={d} className="nn-edge" style={{ animationDelay: `${i * 0.4}s` }} />
            <Packet path={d} dur={2.4} delay={i * 0.4} cls="cold" />
          </g>
        );
      })}
      <g className="svg-node is-lit">
        <rect x={400} y={130} width={200} height={76} rx={12} />
        <text x={500} y={162} textAnchor="middle" className="svg-label">STATE VECTOR</text>
        <text x={500} y={184} textAnchor="middle" className="svg-sub">one aligned representation</text>
      </g>
      <text x={40} y={360} className="svg-note">
        Gated multimodal fusion: streams are aligned in time first, then fused — so a shaky voice and a
        missed check-in land in the same behavioral state, not separate spreadsheets.
      </text>
    </svg>
  );
}

function RetrievalGraphic() {
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <Node x={40} y={40} w={180} h={52} label="MedCPT · dense" sub="HNSW / Faiss" lit />
      <Node x={40} y={120} w={180} h={52} label="BM25 · lexical" sub="exact clinical terms" />
      {["M 220 66 C 290 66 290 130 350 130", "M 220 146 C 290 146 290 140 350 136"].map((d, i) => (
        <g key={d}>
          <path d={d} className="nn-edge" style={{ animationDelay: `${i * 0.3}s` }} />
          <Packet path={d} dur={2} delay={i * 0.3} cls="cold" />
        </g>
      ))}
      <Node x={350} y={104} w={130} h={56} label="RRF FUSION" sub="rank merge" />
      <path d="M 480 132 L 520 132" className="svg-rail" />
      <Packet path="M 480 132 L 520 132" dur={1.2} />
      <Node x={520} y={104} w={100} h={56} label="RERANK" sub="BioLinkBERT" lit />
      {/* candidate funnel */}
      <g transform="translate(80,240)">
        <text x={0} y={-6} className="svg-sub">candidates</text>
        {[220, 140, 60, 24].map((w, i) => (
          <rect key={i} x={(240 - w) / 2} y={i * 26} width={w} height={16} rx={8} className="funnel-bar" style={{ animationDelay: `${i * 0.35}s` }} />
        ))}
        <text x={120} y={130} textAnchor="middle" className="svg-sub">top-k evidence, DSM-5 aligned</text>
      </g>
      <text x={360} y={280} className="svg-note">Two search philosophies — meaning-based</text>
      <text x={360} y={298} className="svg-note">and term-exact — fused, then reranked by a</text>
      <text x={360} y={316} className="svg-note">biomedical model. Recall without noise.</text>
    </svg>
  );
}

function ReasonGraphic() {
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <g className="compiled-block">
        <rect x={40} y={50} width={560} height={90} rx={12} />
        <text x={58} y={80} className="svg-sub">DRAFT CLINICAL OBSERVATION</text>
        <text x={58} y={110} className="svg-mono">
          &quot;Sleep disruption pattern consistent with reported anxiety episodes.&quot;
        </text>
      </g>
      {[
        "session transcript, turn 14",
        "check-in log, 5 of last 7 nights",
        "DSM-5 criteria §300.02 retrieval hit",
      ].map((src, i) => {
        const y = 220 + i * 56;
        const d = `M 320 140 C 320 180 200 ${y + 18} 180 ${y + 18}`;
        return (
          <g key={src}>
            <path d={d} className="tree-edge" style={{ animationDelay: `${i * 0.45}s` }} />
            <g className="evidence-chip" style={{ animationDelay: `${i * 0.45}s` }}>
              <rect x={180} y={y} width={330} height={36} rx={8} />
              <text x={196} y={y + 23} className="svg-mono small">↳ {src}</text>
            </g>
          </g>
        );
      })}
      <text x={40} y={410} className="svg-note">
        Every sentence the system drafts is chained to its sources — an evidence lineage a clinician can audit line by line.
      </text>
    </svg>
  );
}

function ValidateGraphic() {
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <Node x={30} y={80} w={170} h={56} label="DRAFT CLAIM A" sub="supported by evidence" lit />
      <Node x={30} y={230} w={170} h={56} label="DRAFT CLAIM B" sub="no grounding found" />
      {/* gate */}
      <g className="gate">
        <rect x={300} y={60} width={18} height={260} rx={6} />
        <text x={309} y={44} textAnchor="middle" className="svg-sub">NLI GATE</text>
      </g>
      <path d="M 200 108 L 300 108" className="svg-rail hot" />
      <Packet path="M 200 108 L 460 108" dur={2.6} />
      <path d="M 318 108 L 460 108" className="svg-rail hot" />
      <path d="M 200 258 L 296 258" className="svg-rail" />
      <g className="blocked-packet">
        <circle cx={296} cy={258} r={5} />
        <text x={296} y={286} textAnchor="middle" className="tick bad">✗ blocked</text>
      </g>
      <Node x={460} y={82} w={150} h={52} label="PASSES" sub="DeBERTa NLI: entailed" />
      <g transform="translate(360,220)">
        <rect x={0} y={0} width={250} height={90} rx={10} className="ledger-box" />
        <text x={14} y={26} className="svg-sub">DETERMINISTIC GATES</text>
        <text x={14} y={50} className="svg-mono small">DSM-5 criteria check      ✓</text>
        <text x={14} y={72} className="svg-mono small">risk-language screen      ✓</text>
      </g>
      <text x={30} y={390} className="svg-note">
        A claim without evidence doesn't get softened — it gets stopped. NLI entailment plus
        deterministic DSM-5 rules stand between the model and the clinician.
      </text>
    </svg>
  );
}

function ReviewGraphic() {
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <g className="report-card-g">
        <rect x={60} y={40} width={320} height={300} rx={14} className="report-card" />
        <text x={84} y={76} className="svg-label big">HANDOFF SUMMARY</text>
        <text x={84} y={98} className="svg-sub">assembled for the clinician, not the model</text>
        {["Timeline of 14 sessions", "3 flagged patterns, each sourced", "Nancy async check-in digest", "Suggested — never automatic — actions"].map(
          (line, i) => (
            <g key={line} className="ledger-row" style={{ animationDelay: `${0.4 + i * 0.5}s` }}>
              <text x={84} y={134 + i * 34} className="svg-mono small">• {line}</text>
            </g>
          ),
        )}
        <text x={84} y={300} className="svg-sub">status: clinician-support MVP · synthetic data</text>
      </g>
      {/* async loop */}
      <g transform="translate(420,80)">
        <path d="M 90 40 C 170 40 170 160 90 160 C 10 160 10 40 90 40" className="svg-rail" />
        <Packet path="M 90 40 C 170 40 170 160 90 160 C 10 160 10 40 90 40" dur={4.5} cls="cold" />
        <text x={90} y={92} textAnchor="middle" className="svg-sub">patient ↔ Nancy</text>
        <text x={90} y={112} textAnchor="middle" className="svg-sub">async care loop</text>
      </g>
      <text x={60} y={390} className="svg-note">
        The loop keeps running between sessions — the AI companion checks in, and everything flows
        back into the same validated timeline.
      </text>
    </svg>
  );
}

/* ---------- chapter ---------- */

const STEPS: StepDef[] = [
  {
    label: "The pipeline",
    sub: "high-level architecture",
    pilotTitle: "Seven gates between a session and a clinician's desk",
    pilotBody:
      "MindScape turns raw psychiatric sessions and between-session signals into a clinician-ready timeline. Capture, perceive, fuse, retrieve, reason, validate, review — in that order, every time, with the safety gate last.",
    metrics: [
      { k: "stages", v: "7, ordered" },
      { k: "stack", v: "FastAPI + Next.js" },
      { k: "role", v: "clinician support" },
    ],
    graphic: () => <PipelineGraphic />,
  },
  {
    label: "Perception + fusion",
    sub: "many streams, one state",
    pilotTitle: "What was said, how it was said, and what happened since",
    pilotBody:
      "Transcript, acoustic cues, and check-in events are aligned in time and fused through gates into a single behavioral state vector — so a shaky voice and a week of missed sleep register as one picture, not three files.",
    metrics: [
      { k: "streams fused", v: "3+" },
      { k: "alignment", v: "temporal, gated" },
      { k: "output", v: "state vector" },
    ],
    graphic: () => <PerceiveGraphic />,
  },
  {
    label: "Hybrid retrieval",
    sub: "recall without noise",
    pilotTitle: "Two search philosophies, fused and reranked",
    pilotBody:
      "MedCPT dense vectors over HNSW/Faiss find meaning; BM25 finds exact clinical terms. Reciprocal-rank fusion merges them and BioLinkBERT reranks — so the evidence that reaches reasoning is both relevant and precise.",
    metrics: [
      { k: "dense", v: "MedCPT · HNSW/Faiss" },
      { k: "lexical", v: "BM25 → RRF" },
      { k: "rerank", v: "BioLinkBERT" },
    ],
    graphic: () => <RetrievalGraphic />,
  },
  {
    label: "Grounded reasoning",
    sub: "every claim, sourced",
    pilotTitle: "Conclusions you can trace backwards",
    pilotBody:
      "The reasoning layer drafts observations only on top of retrieved evidence, and each sentence keeps its lineage — the session turn, the check-in log, the DSM-5 retrieval hit that supports it. Auditable line by line.",
    metrics: [
      { k: "grounding", v: "retrieval-first" },
      { k: "lineage", v: "per sentence" },
      { k: "audit", v: "clinician-facing" },
    ],
    graphic: () => <ReasonGraphic />,
  },
  {
    label: "Validation gates",
    sub: "the hard stop",
    pilotTitle: "Unsupported claims don't get softened — they get stopped",
    pilotBody:
      "A DeBERTa NLI model checks that every draft claim is entailed by its evidence, then deterministic DSM-5 and risk-language rules run on top. What fails a gate is blocked, visibly — the model never negotiates with the gate.",
    metrics: [
      { k: "NLI check", v: "DeBERTa entailment" },
      { k: "rules", v: "DSM-5, deterministic" },
      { k: "on failure", v: "block, don't hedge" },
    ],
    graphic: () => <ValidateGraphic />,
  },
  {
    label: "Clinician review",
    sub: "the handoff",
    pilotTitle: "The clinician stays the decision-maker",
    pilotBody:
      "What ships is a handoff summary — timeline, sourced patterns, the Nancy companion's async check-in digest, and suggested (never automatic) actions. Framed honestly: a clinician-support MVP on synthetic data, built to production discipline.",
    metrics: [
      { k: "output", v: "handoff summary" },
      { k: "async loop", v: "Nancy companion" },
      { k: "status", v: "MVP · synthetic data" },
    ],
    graphic: () => <ReviewGraphic />,
  },
];

export function MindscapeChapter() {
  return (
    <ChapterShell
      id="mindscape"
      accent="#8ef0c0"
      kicker="PROJECT 03 · CLINICAL AI"
      title="MindScape"
      subtitle="A clinical AI workflow engine — psychiatric sessions become validated, clinician-ready intelligence."
      steps={STEPS}
      stepMs={7000}
    />
  );
}
