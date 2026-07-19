"use client";

import { ChapterShell, type StepDef } from "./chapter-shell";
import { Node, Packet } from "./svg-bits";

/* ---------- step graphics ---------- */

function LoopGraphic() {
  const loop = "M 140 210 C 140 90 500 90 500 210 C 500 330 140 330 140 210 Z";
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <path d={loop} className="svg-rail" />
      <Packet path={loop} dur={4.2} />
      <Packet path={loop} dur={4.2} delay={2.1} cls="cold" />
      <Node x={60} y={175} w={160} h={70} label="CANDIDATE" sub="speaks an answer" lit />
      <Node x={250} y={48} w={180} h={62} label="STREAMING STT" sub="voice → text, live" />
      <Node x={430} y={175} w={170} h={70} label="ORCHESTRATOR" sub="fast + background lanes" />
      <Node x={250} y={312} w={180} h={62} label="VOICE OUT · TTS" sub="next question, spoken" />
      <g className="svg-center">
        <text x={320} y={200} textAnchor="middle" className="svg-big">
          &lt; 1 second
        </text>
        <text x={320} y={224} textAnchor="middle" className="svg-sub">
          full loop, every turn
        </text>
      </g>
    </svg>
  );
}

function SttGraphic() {
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      {/* live waveform */}
      <g transform="translate(40,150)">
        {Array.from({ length: 22 }).map((_, i) => (
          <rect key={i} x={i * 8} y={-30} width={4} rx={2} className="wave-bar" style={{ animationDelay: `${i * 0.07}s` }} height={60} />
        ))}
        <text x={84} y={78} textAnchor="middle" className="svg-sub">
          16 kHz audio frames
        </text>
      </g>
      <path d="M 240 150 L 300 150" className="svg-rail" />
      <Packet path="M 240 150 L 300 150" dur={1.1} />
      {/* partial lane */}
      <g transform="translate(310,84)">
        <rect x={0} y={0} width={290} height={58} rx={10} className="lane-box" />
        <text x={12} y={22} className="svg-sub">PARTIALS · every ~180 ms</text>
        <text x={12} y={42} className="svg-mono typed-line">&quot;i sharded the redis state by sess—&quot;</text>
      </g>
      {/* final lane */}
      <g transform="translate(310,178)">
        <rect x={0} y={0} width={290} height={58} rx={10} className="lane-box cold" />
        <text x={12} y={22} className="svg-sub">FINALS · endpoint-tuned</text>
        <text x={12} y={42} className="svg-mono">&quot;I sharded the Redis state by session.&quot;</text>
      </g>
      {/* confidence strip */}
      <g transform="translate(310,272)">
        <text x={0} y={0} className="svg-sub">word confidence</text>
        {[0.97, 0.94, 0.99, 0.91, 0.96, 0.98].map((c, i) => (
          <rect key={i} x={i * 47} y={10} width={40} height={8} rx={4} className="conf-bar" style={{ opacity: c }} />
        ))}
      </g>
      <text x={40} y={360} className="svg-note">
        The room hears you the way a person does — words land as you say them, not after you stop.
      </text>
    </svg>
  );
}

function TrajectoryGraphic() {
  const edge = (d: string, i: number) => <path key={i} d={d} className="tree-edge" style={{ animationDelay: `${i * 0.35}s` }} />;
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      {edge("M 110 210 C 170 210 180 120 240 118", 0)}
      {edge("M 110 210 C 170 210 180 210 240 208", 1)}
      {edge("M 110 210 C 170 210 180 300 240 298", 2)}
      {edge("M 400 118 C 450 118 455 70 505 68", 3)}
      {edge("M 400 118 C 450 118 455 118 505 116", 4)}
      {edge("M 400 118 C 450 118 455 166 505 164", 5)}
      <Node x={20} y={178} w={90} h={64} label="RÉSUMÉ" sub="4 claims parsed" lit />
      <Node x={240} y={90} w={160} h={56} label="Q1 · Redis state" sub="claim probe" lit />
      <Node x={240} y={180} w={160} h={56} label="Q2 · dual-lane design" sub="depth probe" />
      <Node x={240} y={270} w={160} h={56} label="Q3 · failure modes" sub="pressure probe" />
      <Node x={505} y={42} w={115} h={52} label="strong →" sub="go deeper" />
      <Node x={505} y={90} w={115} h={52} label="partial →" sub="clarify" />
      <Node x={505} y={138} w={115} h={52} label="weak →" sub="pivot topic" />
      <text x={150} y={160} className="svg-edge-label">semantic similarity</text>
      <text x={430} y={40} className="svg-edge-label">answer routing</text>
      <text x={20} y={382} className="svg-note">
        Before the first question is asked, the résumé is compiled into a validated map of probes —
      </text>
      <text x={20} y={400} className="svg-note">
        every branch is a scenario, every edge is scored by semantic similarity to the live answer.
      </text>
    </svg>
  );
}

function FastLaneGraphic() {
  const fast = "M 60 130 L 520 130";
  const slow = "M 60 270 L 520 270";
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <text x={60} y={92} className="svg-sub">FAST LANE · answers the candidate now</text>
      <path d={fast} className="svg-rail hot" />
      <Packet path={fast} dur={1.4} />
      <Packet path={fast} dur={1.4} delay={0.7} />
      <text x={60} y={232} className="svg-sub">BACKGROUND LANE · prepares what comes next</text>
      <path d={slow} className="svg-rail" />
      <Packet path={slow} dur={4.6} cls="cold" />
      <Packet path={slow} dur={4.6} delay={2.3} cls="cold" />
      <Node x={520} y={96} w={100} h={64} label="REPLY" sub="< 900 ms" lit />
      <Node x={520} y={236} w={100} h={64} label="NEXT Q" sub="package ready" />
      <path d="M 570 236 C 570 200 570 196 570 160" className="svg-rail dashed" />
      <text x={60} y={360} className="svg-note">
        The trick to feeling human: never make the candidate wait for the thinking.
      </text>
      <text x={60} y={378} className="svg-note">
        The fast lane replies immediately; the analytical lane assembles the next question in parallel.
      </text>
    </svg>
  );
}

function AgentsGraphic() {
  const agents = [
    { y: 60, name: "CONCEPT AGENT", sub: "did they explain the idea?" },
    { y: 140, name: "WEAKNESS AGENT", sub: "where is the gap?" },
    { y: 220, name: "DISCREPANCY AGENT", sub: "does it match the résumé?" },
    { y: 300, name: "REASONING AGENT", sub: "how did they think?" },
  ];
  const claims = [
    { label: "Redis session sharding", ok: true },
    { label: "Dual-lane orchestration", ok: true },
    { label: "“Led team of 8”", ok: false },
    { label: "Playwright e2e suite", ok: true },
  ];
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      {agents.map((a, i) => (
        <g key={a.name}>
          <Node x={30} y={a.y} w={210} h={62} label={a.name} sub={a.sub} lit={i === 2} />
          <path d={`M 240 ${a.y + 31} L 300 ${a.y + 31}`} className="svg-rail" />
          <Packet path={`M 240 ${a.y + 31} L 300 ${a.y + 31}`} dur={2.2} delay={i * 0.5} cls="cold" />
        </g>
      ))}
      {/* discrepancy ledger */}
      <g transform="translate(315,120)">
        <rect x={0} y={0} width={300} height={186} rx={12} className="ledger-box" />
        <text x={16} y={28} className="svg-sub">DISCREPANCY LEDGER · résumé had 4 claims</text>
        {claims.map((c, i) => (
          <g key={c.label} className="ledger-row" style={{ animationDelay: `${0.6 + i * 0.7}s` }}>
            <text x={16} y={58 + i * 30} className="svg-mono">{c.label}</text>
            <text x={268} y={58 + i * 30} className={c.ok ? "tick ok" : "tick bad"}>
              {c.ok ? "✓ depth reached" : "✗ unverified"}
            </text>
          </g>
        ))}
      </g>
      <text x={30} y={400} className="svg-note">
        Four analysts listen to every answer — one of them holds your résumé and checks it, claim by claim.
      </text>
    </svg>
  );
}

function OrchestratorGraphic() {
  const inputs = ["LIVE ANSWER", "CONCEPT", "WEAKNESS", "DISCREPANCY", "REASONING"];
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      {inputs.map((label, i) => {
        const y = 50 + i * 62;
        const d = `M 170 ${y} C 260 ${y} 260 190 330 190`;
        return (
          <g key={label}>
            <Node x={30} y={y - 22} w={140} h={44} label={label} />
            <path d={d} className="nn-edge" style={{ animationDelay: `${i * 0.4}s` }} />
            <Packet path={d} dur={2.4} delay={i * 0.45} cls="cold" />
          </g>
        );
      })}
      <g className="svg-node is-lit">
        <circle cx={370} cy={190} r={44} />
        <text x={370} y={186} textAnchor="middle" className="svg-label">ORCH.</text>
        <text x={370} y={202} textAnchor="middle" className="svg-sub">decides</text>
      </g>
      {["M 414 176 C 480 150 480 120 520 112", "M 414 204 C 480 230 480 260 520 268"].map((d, i) => (
        <g key={d}>
          <path d={d} className="nn-edge hot" style={{ animationDelay: `${1 + i * 0.5}s` }} />
          <Packet path={d} dur={1.8} delay={1 + i * 0.5} />
        </g>
      ))}
      <Node x={520} y={84} w={110} h={52} label="ASK NOW" sub="fast lane" lit />
      <Node x={520} y={242} w={110} h={52} label="ESCALATE" sub="deeper probe" />
      <g transform="translate(200,320)">
        <rect x={0} y={0} width={410} height={64} rx={10} className="reason-box" />
        <text x={14} y={24} className="svg-sub">ORCHESTRATOR REASONING · live</text>
        <text x={14} y={46} className="svg-mono reason-line">
          depth reached on retrieval claim → escalate to system-design probe
        </text>
      </g>
      <text x={30} y={402} className="svg-note">
        Every agent's signal converges here — a network of judgments, resolved into one next move.
      </text>
    </svg>
  );
}

function VoiceOutGraphic() {
  const budget = [
    { label: "STT partial", ms: 180, cls: "b1" },
    { label: "orchestrate", ms: 240, cls: "b2" },
    { label: "TTS first byte", ms: 320, cls: "b3" },
  ];
  const total = 940;
  let acc = 0;
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <Node x={40} y={60} w={180} h={60} label="CARTESIA TTS" sub="primary voice" lit />
      <Node x={40} y={150} w={180} h={60} label="ELEVENLABS" sub="automatic fallback" />
      <path d="M 220 90 C 290 90 290 120 350 120" className="svg-rail hot" />
      <path d="M 220 180 C 290 180 290 140 350 132" className="svg-rail dashed" />
      <Packet path="M 220 90 C 290 90 290 120 350 120" dur={1.6} />
      <g transform="translate(350,92)">
        <circle cx={30} cy={28} r={26} className="speaker-ring" />
        <circle cx={30} cy={28} r={16} className="speaker-ring inner" />
        <text x={30} y={90} textAnchor="middle" className="svg-sub">spoken to candidate</text>
      </g>
      {/* latency budget bar */}
      <g transform="translate(40,270)">
        <text x={0} y={-12} className="svg-sub">TURN LATENCY BUDGET</text>
        {budget.map((b) => {
          const x = (acc / total) * 560;
          const w = (b.ms / total) * 560;
          acc += b.ms;
          return (
            <g key={b.label}>
              <rect x={x} y={0} width={w - 3} height={26} rx={5} className={`budget-seg ${b.cls}`} />
              <text x={x + 4} y={44} className="svg-mono small">{b.label}</text>
              <text x={x + 4} y={17} className="svg-mono small dark">{b.ms} ms</text>
            </g>
          );
        })}
        <rect x={(740 / total) * 560} y={0} width={560 - (740 / total) * 560} height={26} rx={5} className="budget-seg rest" />
        <text x={(740 / total) * 560 + 6} y={17} className="svg-mono small">headroom</text>
        <line x1={560} y1={-8} x2={560} y2={34} className="budget-limit" />
        <text x={556} y={60} textAnchor="end" className="svg-sub">&lt; 1 s total, sustained across the interview</text>
      </g>
    </svg>
  );
}

function ReportGraphic() {
  const rows = [
    ["Distributed state design", "evidence: 3 answers, depth 4/5"],
    ["Failure-mode reasoning", "evidence: live probe, recovered well"],
    ["Claim verification", "3 of 4 résumé claims held under probing"],
    ["Communication under pressure", "clear at 2 escalations"],
  ];
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <g transform="translate(90,30)">
        <rect x={0} y={0} width={460} height={330} rx={14} className="report-card" />
        <text x={28} y={42} className="svg-label big">CANDIDATE EVIDENCE REPORT</text>
        <text x={28} y={64} className="svg-sub">not a vibe score — a ledger of what was demonstrated</text>
        {rows.map((r, i) => (
          <g key={r[0]} className="ledger-row" style={{ animationDelay: `${0.4 + i * 0.6}s` }}>
            <text x={28} y={104 + i * 44} className="svg-mono">{r[0]}</text>
            <text x={28} y={122 + i * 44} className="svg-sub">{r[1]}</text>
            <text x={432} y={110 + i * 44} textAnchor="end" className="tick ok">✓</text>
          </g>
        ))}
        <g className="stamp">
          <rect x={286} y={276} width={148} height={38} rx={8} />
          <text x={360} y={300} textAnchor="middle" className="svg-label">250+ INTERVIEWS</text>
        </g>
      </g>
    </svg>
  );
}

/* ---------- chapter ---------- */

const STEPS: StepDef[] = [
  {
    label: "The loop",
    sub: "high-level architecture",
    pilotTitle: "A voice-to-voice interview loop that closes in under a second",
    pilotBody:
      "The candidate speaks. Their words become streaming text, an orchestrator decides the next move, and a synthesized voice answers back — a complete loop, every turn, fast enough to feel like a person. Everything that follows lives inside this loop.",
    metrics: [
      { k: "turn loop", v: "< 1 s" },
      { k: "interviews run", v: "250+" },
      { k: "mode", v: "voice ↔ voice" },
    ],
    graphic: () => <LoopGraphic />,
  },
  {
    label: "Streaming STT",
    sub: "hearing, live",
    pilotTitle: "Words land as they're spoken, not after",
    pilotBody:
      "Deepgram streaming transcription with tuned endpointing feeds the system partial text every ~180 ms, finalized sentences moments later, each word carrying a confidence score. The interview never waits for silence to start thinking.",
    metrics: [
      { k: "partial latency", v: "~180 ms" },
      { k: "transcription accuracy", v: "95%+" },
      { k: "endpointing", v: "room-tuned" },
    ],
    graphic: () => <SttGraphic />,
  },
  {
    label: "Trajectory map",
    sub: "the interview plan",
    pilotTitle: "The résumé is compiled into a map of probes before the first question",
    pilotBody:
      "Claims are parsed out of the résumé, validated, and expanded into a branching question tree — strong answers route deeper, partial answers route to clarification, weak answers pivot. Edges are scored by semantic similarity against the live transcript.",
    metrics: [
      { k: "built from", v: "résumé claims" },
      { k: "routing signal", v: "semantic similarity" },
      { k: "hydration", v: "async, non-blocking" },
    ],
    graphic: () => <TrajectoryGraphic />,
  },
  {
    label: "Dual-lane engine",
    sub: "why it feels instant",
    pilotTitle: "Reply now; think in parallel",
    pilotBody:
      "Turn handling is split into two lanes. The fast lane produces the next spoken response in under 900 ms. The background lane runs the heavy analysis and assembles the next question package — so depth never costs latency.",
    metrics: [
      { k: "fast-lane reply", v: "< 900 ms" },
      { k: "state", v: "Redis + in-memory fallback" },
      { k: "models", v: "multi-tier via OpenRouter" },
    ],
    graphic: () => <FastLaneGraphic />,
  },
  {
    label: "Agent panel",
    sub: "background lane",
    pilotTitle: "Four analysts listen to every answer",
    pilotBody:
      "Concept, weakness, discrepancy, and reasoning agents each score the turn independently. The discrepancy agent holds the résumé the whole time — every claim is either verified with depth or flagged, visibly, in the ledger.",
    metrics: [
      { k: "agents per turn", v: "4 + evaluator" },
      { k: "claim checks", v: "per-claim ✓/✗" },
      { k: "telemetry", v: "JSONL, per turn" },
    ],
    graphic: () => <AgentsGraphic />,
  },
  {
    label: "Orchestrator",
    sub: "signals converge",
    pilotTitle: "A network of judgments, resolved into one next move",
    pilotBody:
      "The live answer plus all four agent signals converge on the orchestrator like inputs to a network. It reasons over them — visibly — and either fires the prepared question or escalates to a deeper probe. Its reasoning is logged on every turn.",
    metrics: [
      { k: "inputs fused", v: "5 signals" },
      { k: "decision", v: "ask / escalate / pivot" },
      { k: "reasoning", v: "logged, replayable" },
    ],
    graphic: () => <OrchestratorGraphic />,
  },
  {
    label: "Voice out",
    sub: "closing the loop",
    pilotTitle: "The whole turn fits inside a one-second budget",
    pilotBody:
      "Cartesia speaks the next question, with ElevenLabs as an automatic fallback route. Add it up — streaming partials, orchestration, first byte of speech — and the loop closes with headroom to spare. That budget holds for the entire interview.",
    metrics: [
      { k: "TTS route", v: "Cartesia → ElevenLabs" },
      { k: "first byte", v: "~320 ms" },
      { k: "total loop", v: "< 1 s" },
    ],
    graphic: () => <VoiceOutGraphic />,
  },
  {
    label: "Evidence report",
    sub: "the output",
    pilotTitle: "An interview that ends in evidence, not impressions",
    pilotBody:
      "Every conclusion in the final report traces back to specific moments in the conversation — which claims held, where depth was reached, how reasoning behaved under pressure. Run across 250+ interviews, backed by contract tests and Playwright end-to-end suites.",
    metrics: [
      { k: "interviews", v: "250+" },
      { k: "report", v: "evidence-linked" },
      { k: "tests", v: "contract + e2e" },
    ],
    graphic: () => <ReportGraphic />,
  },
];

export function AntigravityChapter() {
  return (
    <ChapterShell
      id="antigravity"
      accent="#7ee0ff"
      kicker="PROJECT 01 · FLAGSHIP"
      title="Antigravity"
      subtitle="An AI-native technical interviewer — a real-time voice system that turns a candidate's answers into evidence."
      steps={STEPS}
      stepMs={7200}
      footer={
        <div className="chapter-cta" id="antigravity-demo">
          <p className="cta-lead">This system is real and running. Don't take the diagram's word for it —</p>
          <div className="cta-row">
            <a className="btn btn-primary" href="https://antigravity-gz2r.vercel.app" target="_blank" rel="noreferrer">
              ▶ Watch a real interview replay
            </a>
            <a className="btn" href="https://github.com/Yashwant-Bhyri" target="_blank" rel="noreferrer">
              Open the code
            </a>
          </div>
        </div>
      }
    />
  );
}
