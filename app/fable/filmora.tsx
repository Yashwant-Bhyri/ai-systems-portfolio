"use client";

import { ChapterShell, type StepDef } from "./chapter-shell";
import { Node, Packet } from "./svg-bits";

/* ---------- step graphics ---------- */

function HighLevelGraphic() {
  const p1 = "M 170 210 L 250 210";
  const p2 = "M 430 210 L 510 210";
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <Node x={30} y={172} w={140} h={76} label="ONE PROMPT" sub={'"cut a travel reel"'} lit />
      <path d={p1} className="svg-rail hot" />
      <Packet path={p1} dur={1.4} />
      <g className="svg-node is-lit">
        <rect x={250} y={140} width={180} height={140} rx={14} />
        <text x={340} y={186} textAnchor="middle" className="svg-label">AGENT RUNTIME</text>
        <text x={340} y={208} textAnchor="middle" className="svg-sub">research · memory · compile</text>
        <text x={340} y={226} textAnchor="middle" className="svg-sub">orchestrate · observe</text>
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={296 + i * 44} cy={252} r={5} className="runtime-dot" style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
      </g>
      <path d={p2} className="svg-rail hot" />
      <Packet path={p2} dur={1.4} delay={0.7} />
      <Node x={510} y={172} w={110} h={76} label="FINISHED EDIT" sub="editable timeline" />
      <text x={30} y={360} className="svg-note">
        Built during the Wondershare Filmora internship: the user describes the video they want —
      </text>
      <text x={30} y={378} className="svg-note">
        a runtime of cooperating agents researches, plans, and assembles it inside the editor.
      </text>
    </svg>
  );
}

function TrendGraphic() {
  const platforms = ["TikTok", "Douyin", "Xiaohongshu", "Instagram", "WeChat", "Facebook"];
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      {platforms.map((p, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 40 + col * 190;
        const y = 40 + row * 150;
        return (
          <g key={p} className="platform-tile">
            <rect x={x} y={y} width={170} height={128} rx={12} className="lane-box" />
            <text x={x + 14} y={y + 26} className="svg-label small">{p}</text>
            {/* scrolling content bars */}
            <g clipPath="url(#tclip)">
              {[0, 1, 2, 3].map((j) => (
                <rect
                  key={j}
                  x={x + 14}
                  y={y + 40 + j * 22}
                  width={100 + ((i * 37 + j * 53) % 40)}
                  height={12}
                  rx={6}
                  className="feed-bar"
                  style={{ animationDelay: `${(i * 4 + j) * 0.18}s` }}
                />
              ))}
            </g>
          </g>
        );
      })}
      <g className="signal-stamp">
        <rect x={150} y={168} width={340} height={64} rx={12} />
        <text x={320} y={196} textAnchor="middle" className="svg-label big">700+ creative signals</text>
        <text x={320} y={218} textAnchor="middle" className="svg-sub">collected, deduplicated, distilled per brief</text>
      </g>
    </svg>
  );
}

function SkillGraphic() {
  const files = [
    { y: 60, name: "trend-skill.md", sub: "what works, per platform" },
    { y: 160, name: "design.md", sub: "pacing, framing, typography" },
    { y: 260, name: "filmora-params.json", sub: "editor-native parameters" },
  ];
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <Node x={30} y={160} w={160} h={80} label="700+ SIGNALS" sub="raw trend evidence" lit />
      {files.map((f, i) => {
        const d = `M 190 200 C 260 200 260 ${f.y + 34} 330 ${f.y + 34}`;
        return (
          <g key={f.name}>
            <path d={d} className="tree-edge" style={{ animationDelay: `${i * 0.4}s` }} />
            <Packet path={d} dur={2.4} delay={i * 0.5} cls="warm" />
            <g className="file-card">
              <rect x={330} y={f.y} width={270} height={70} rx={10} />
              <text x={348} y={f.y + 30} className="svg-mono">{f.name}</text>
              <text x={348} y={f.y + 52} className="svg-sub">{f.sub}</text>
            </g>
          </g>
        );
      })}
      <text x={30} y={390} className="svg-note">
        Raw signals are useless to an agent. They're compiled into skill files — durable, reusable
        knowledge the runtime can execute against.
      </text>
    </svg>
  );
}

function MemoryGraphic() {
  const inPaths = [0, 1, 2].map((i) => `M 300 ${120 + i * 60} C 350 ${120 + i * 60} 350 190 400 186`);
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <Node x={20} y={60} w={150} h={56} label="USER QUERY" sub='"beach reel, fast cuts"' lit />
      {/* vectorization */}
      <g transform="translate(50,150)">
        <text x={0} y={-8} className="svg-sub">vectorized</text>
        {[0.9, 0.4, 0.7, 0.2, 0.8, 0.5, 0.6].map((v, i) => (
          <rect key={i} x={i * 14} y={(1 - v) * 34} width={9} height={v * 34 + 6} rx={2} className="vec-bar" style={{ animationDelay: `${i * 0.12}s` }} />
        ))}
      </g>
      <path d="M 95 128 L 95 140" className="svg-rail" />
      <path d="M 160 170 C 200 170 200 190 230 190" className="svg-rail" />
      <Packet path="M 160 170 C 200 170 200 190 230 190" dur={1.6} />
      {/* vector DB */}
      <g className="db-shape">
        <ellipse cx={265} cy={150} rx={38} ry={12} />
        <path d="M 227 150 v 80 a 38 12 0 0 0 76 0 v -80" />
        <text x={265} y={200} textAnchor="middle" className="svg-sub">vector DB</text>
      </g>
      {/* lit memories */}
      {["skill files", "context packets", "param presets"].map((m, i) => (
        <g key={m} className="mem-hit" style={{ animationDelay: `${0.8 + i * 0.4}s` }}>
          <rect x={230} y={100 + i * 60} width={4} height={0} />
          <text x={318} y={120 + i * 60} className="svg-mono small">{m} ✦</text>
        </g>
      ))}
      {inPaths.map((d, i) => (
        <g key={d}>
          <path d={d} className="nn-edge" style={{ animationDelay: `${1.2 + i * 0.3}s` }} />
          <Packet path={d} dur={2} delay={1.2 + i * 0.3} cls="cold" />
        </g>
      ))}
      {/* recommendation net */}
      <g className="svg-node is-lit">
        <circle cx={440} cy={186} r={40} />
        <text x={440} y={182} textAnchor="middle" className="svg-label">RECO</text>
        <text x={440} y={198} textAnchor="middle" className="svg-sub">network</text>
      </g>
      <path d="M 480 186 L 540 186" className="svg-rail hot" />
      <Packet path="M 480 186 L 540 186" dur={1.4} delay={0.3} />
      <Node x={540} y={150} w={90} h={72} label="RANKED" sub="assets & styles" />
      <text x={20} y={390} className="svg-note">
        Memory is retrieval, not storage: the query is embedded, relevant skills light up in the store,
        and only those feed the recommendation network.
      </text>
    </svg>
  );
}

function CompilerGraphic() {
  const streams = [
    { y: 70, label: "USER INTENT", sub: "what they asked for" },
    { y: 170, label: "TREND CONTEXT", sub: "what works right now" },
    { y: 270, label: "PRODUCTION STATE", sub: "what's on the timeline" },
  ];
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      {streams.map((s, i) => {
        const d = `M 200 ${s.y + 28} C 280 ${s.y + 28} 280 190 350 190`;
        return (
          <g key={s.label}>
            <Node x={30} y={s.y} w={170} h={56} label={s.label} sub={s.sub} lit={i === 0} />
            <path d={d} className="nn-edge" style={{ animationDelay: `${i * 0.4}s` }} />
            <Packet path={d} dur={2.2} delay={i * 0.4} cls="warm" />
          </g>
        );
      })}
      <g className="compiled-block">
        <rect x={350} y={110} width={260} height={160} rx={12} />
        <text x={366} y={140} className="svg-sub">COMPILED INSTRUCTION</text>
        {["scene: beach · golden hour", "pace: 12 cuts / 30 s", "music: rising, drop @ 8 s", "captions: kinetic, zh+en", "params: filmora.transition[7]"].map(
          (line, i) => (
            <text key={line} x={366} y={166 + i * 22} className="svg-mono small compile-line" style={{ animationDelay: `${0.8 + i * 0.35}s` }}>
              {line}
            </text>
          ),
        )}
      </g>
      <text x={30} y={390} className="svg-note">
        The semantic prompt compiler binds three live streams into one executable brief —
        deterministic enough for software, expressive enough for taste.
      </text>
    </svg>
  );
}

function OrchestrationGraphic() {
  const agents = [
    { x: 60, y: 60, name: "RESEARCH" },
    { x: 240, y: 40, name: "SCRIPT" },
    { x: 420, y: 60, name: "VISUALS" },
    { x: 60, y: 300, name: "MUSIC" },
    { x: 240, y: 320, name: "CAPTIONS" },
    { x: 420, y: 300, name: "ASSEMBLY" },
  ];
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      {agents.map((a, i) => {
        const d = `M ${a.x + 60} ${a.y + 24} L 320 190`;
        return (
          <g key={a.name}>
            <path d={d} className="nn-edge" style={{ animationDelay: `${i * 0.3}s` }} />
            <Packet path={d} dur={2.6} delay={i * 0.35} cls={i % 2 ? "cold" : "warm"} />
            <Node x={a.x} y={a.y} w={120} h={48} label={a.name} lit={i === 5} />
          </g>
        );
      })}
      <g className="svg-node is-lit">
        <circle cx={320} cy={190} r={46} />
        <text x={320} y={186} textAnchor="middle" className="svg-label">ORCH.</text>
        <text x={320} y={202} textAnchor="middle" className="svg-sub">hand-offs</text>
      </g>
      <text x={60} y={395} className="svg-note">
        Agents don't queue — they hand off. The orchestrator sequences work so research feeds script,
        script feeds visuals, and assembly receives everything editable.
      </text>
    </svg>
  );
}

function OutputGraphic() {
  const clips = [70, 130, 90, 150, 110];
  let acc = 0;
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <text x={40} y={60} className="svg-sub">FINAL TIMELINE · lands inside the editor, fully editable</text>
      <g transform="translate(40,80)">
        {clips.map((w, i) => {
          const x = acc;
          acc += w + 6;
          return <rect key={i} x={x} y={0} width={w} height={44} rx={6} className="clip-bar" style={{ animationDelay: `${i * 0.25}s` }} />;
        })}
        <rect x={0} y={54} width={acc - 6} height={16} rx={5} className="clip-audio" />
      </g>
      {/* observability */}
      <g transform="translate(40,210)">
        <rect x={0} y={0} width={560} height={150} rx={12} className="ledger-box" />
        <text x={18} y={30} className="svg-sub">OBSERVABILITY · every agent call traced</text>
        {[
          ["research.trends", "1.2 s", "ok"],
          ["memory.retrieve", "0.3 s", "ok"],
          ["compile.prompt", "0.2 s", "ok"],
          ["orchestrate.e2e", "≈2% of total latency", "ok"],
        ].map((r, i) => (
          <g key={r[0]} className="ledger-row" style={{ animationDelay: `${0.5 + i * 0.5}s` }}>
            <text x={18} y={58 + i * 24} className="svg-mono small">{r[0]}</text>
            <text x={330} y={58 + i * 24} className="svg-mono small">{r[1]}</text>
            <text x={520} y={58 + i * 24} className="tick ok">✓</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ---------- chapter ---------- */

const STEPS: StepDef[] = [
  {
    label: "The runtime",
    sub: "high-level architecture",
    pilotTitle: "One prompt in, one finished edit out",
    pilotBody:
      "A user describes the video they want in a sentence. A runtime of cooperating agents — research, memory, compilation, orchestration — does the entire production pass and returns an editable timeline inside Filmora. Built during the Wondershare internship.",
    metrics: [
      { k: "input", v: "one prompt" },
      { k: "output", v: "editable edit" },
      { k: "where", v: "Wondershare Filmora" },
    ],
    graphic: () => <HighLevelGraphic />,
  },
  {
    label: "Trend research agent",
    sub: "what works, right now",
    pilotTitle: "Six platforms, streamed into evidence",
    pilotBody:
      "The research agent reads what's actually performing across TikTok, Douyin, Xiaohongshu, Instagram, WeChat, and Facebook — then collapses the noise into 700+ deduplicated creative signals for the brief at hand.",
    metrics: [
      { k: "platforms", v: "6" },
      { k: "signals per brief", v: "700+" },
      { k: "refresh", v: "continuous" },
    ],
    graphic: () => <TrendGraphic />,
  },
  {
    label: "Skill compilation",
    sub: "signals → skills",
    pilotTitle: "Evidence becomes executable knowledge",
    pilotBody:
      "Raw signals are compiled into skill files — trend playbooks, design rules, and Filmora-native parameter presets. The agents don't re-learn the platform every run; they execute against durable, versioned skills.",
    metrics: [
      { k: "artifacts", v: "skill.md · design.md · params" },
      { k: "reuse", v: "across briefs" },
      { k: "format", v: "editor-native" },
    ],
    graphic: () => <SkillGraphic />,
  },
  {
    label: "Memory + recommendation",
    sub: "retrieval, not storage",
    pilotTitle: "The query lights up only what's relevant",
    pilotBody:
      "The user's intent is embedded and run against a vector store of skills, context packets, and parameter presets. Only the matches light up — and only they feed the recommendation network that ranks assets and styles for this brief.",
    metrics: [
      { k: "lookup", v: "embedding search" },
      { k: "store", v: "skills + context + params" },
      { k: "output", v: "ranked candidates" },
    ],
    graphic: () => <MemoryGraphic />,
  },
  {
    label: "Semantic prompt compiler",
    sub: "three streams, one brief",
    pilotTitle: "Intent, trend, and timeline state converge",
    pilotBody:
      "What the user asked for, what the platforms reward right now, and what's already on the timeline are bound into one compiled instruction — deterministic enough for software to execute, expressive enough to carry taste.",
    metrics: [
      { k: "inputs", v: "intent · trends · state" },
      { k: "output", v: "one executable brief" },
      { k: "property", v: "deterministic" },
    ],
    graphic: () => <CompilerGraphic />,
  },
  {
    label: "Multi-agent orchestration",
    sub: "hand-offs, not queues",
    pilotTitle: "Six specialists, one conductor",
    pilotBody:
      "Script, visuals, music, captions, effects, and assembly agents work as a network with the orchestrator sequencing hand-offs — research feeds script, script feeds visuals, and the assembly agent receives everything still editable.",
    metrics: [
      { k: "agents", v: "6 specialists" },
      { k: "pattern", v: "orchestrated hand-off" },
      { k: "overhead", v: "≈2% of total latency" },
    ],
    graphic: () => <OrchestrationGraphic />,
  },
  {
    label: "Output + observability",
    sub: "the receipt",
    pilotTitle: "A finished edit — and the trace that produced it",
    pilotBody:
      "The result lands as an editable timeline, never a black-box render. Every agent call is traced, which is how the runtime's API usage was cut by 28% — you can only optimize what you can see.",
    metrics: [
      { k: "API cost", v: "−28%" },
      { k: "orchestration overhead", v: "≈2% of e2e" },
      { k: "result", v: "editable, traced" },
    ],
    graphic: () => <OutputGraphic />,
  },
];

export function FilmoraChapter() {
  return (
    <ChapterShell
      id="filmora"
      accent="#ff8fb2"
      kicker="PROJECT 02 · WONDERSHARE INTERNSHIP"
      title="Filmora Agent Runtime"
      subtitle="A multi-agent media production system — one prompt becomes a finished, editable video edit."
      steps={STEPS}
      stepMs={7000}
    />
  );
}
