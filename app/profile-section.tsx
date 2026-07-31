"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import "./live-scenes.css";

type RoleId = "systems" | "agents" | "full-stack";

type TargetRole = {
  id: RoleId;
  lines: readonly [string, string];
  short: string;
  /** Short reasoning fragments that roll continuously under the map. */
  reasoning: readonly string[];
};

const ROLES: readonly TargetRole[] = [
  {
    id: "systems",
    lines: ["AI Systems", "Engineer"],
    short: "runtime systems & reliability",
    reasoning: [
      "I build the runtime around the model, not just the prompt in front of it.",
      "I have shipped a dual-lane multi-agent orchestration engine and run it in production.",
      "Evaluation, tracing and guardrails are designed in from the start, never bolted on after.",
      "I treat latency, throughput and token cost as engineering budgets with an owner.",
      "Model serving, gateways and intelligent routing have to hold up under real load.",
      "Caching, fallbacks and recovery paths are mine end to end, not someone else's problem.",
      "Regression suites mean a prompt change cannot silently break behaviour.",
      "The system stays inspectable after it ships, not only while it is being built.",
    ],
  },
  {
    id: "agents",
    lines: ["AI Agent &", "Application Engineer"],
    short: "agentic systems as products",
    reasoning: [
      "Every agent system I have built shipped with a real product surface on it.",
      "I coordinate planning, reasoning and specialist agents in production, not in a notebook.",
      "Tool use and function calling run through typed, validated actions.",
      "State machines, hand-offs and async execution keep agent behaviour predictable.",
      "Retrieval and memory keep the agent grounded in something real.",
      "Human-in-the-loop approval sits wherever the stakes justify it.",
      "I build real-time voice and streaming loops, not another chat box.",
      "I own the interface as much as the engine running behind it.",
    ],
  },
  {
    id: "full-stack",
    lines: ["Full-Stack", "AI / ML Engineer"],
    short: "data to deployment pipeline",
    reasoning: [
      "I carry a system from raw data all the way to a running service.",
      "I handle distillation, quantization and evaluation on the model side.",
      "I build the backend services, APIs and workflows that serve those models.",
      "Ingestion pipelines keep the models fed and their behaviour measurable.",
      "I have built retrieval and recommendation systems end to end.",
      "Cloud deployment comes with CI/CD, monitoring and cost control attached.",
      "Evaluation harnesses and failure analysis run before anything reaches production.",
      "One owner from the dataset through to the service in front of users.",
    ],
  },
] as const;

type Area = {
  id: string;
  /** Own accent so the five areas are told apart at a glance. */
  accent: string;
  label: readonly [string, string];
  /** The curated, concrete skills this engineering area actually covers. */
  skills: readonly string[];
  /** Which target roles call on this area. */
  roles: readonly [boolean, boolean, boolean];
  /** One short operation name per capability — the figure steers to it. */
  focus: readonly string[];
  /** Where this layer was actually built. Only shown in the full map, which
   *  sits after the project chapters, so the names mean something by then. */
  evidence: string;
};

const AREAS: readonly Area[] = [
  {
    id: "application",
    accent: "var(--vx-violet)",
    label: ["AI application &", "product engineering"],
    skills: [
      "AI-native application architecture",
      "backend APIs & model integrations",
      "full-stack AI product delivery",
      "structured outputs & schema contracts",
      "human-in-the-loop product workflows",
    ],
    roles: [false, true, true],
    focus: ["architecture", "api call", "delivery", "schema", "human gate"],
    evidence: "Filmora · Lalamove R&D",
  },
  {
    id: "runtime",
    accent: "var(--vx-lime)",
    label: ["Agent runtime &", "orchestration"],
    skills: [
      "agent & workflow orchestration",
      "planning, reasoning & specialist agents",
      "tool use, function calling & structured actions",
      "state machines, hand-offs & async execution",
      "real-time voice & streaming agent runtimes",
    ],
    roles: [true, true, false],
    focus: ["orchestrate", "reason", "tool call", "hand-off", "stream"],
    evidence: "Antigravity · Filmora",
  },
  {
    id: "knowledge",
    accent: "var(--vx-cyan)",
    label: ["Knowledge, memory", "& retrieval"],
    skills: [
      "embeddings, vector search & indexing",
      "hybrid retrieval, reranking & grounding",
      "RAG & knowledge systems",
      "working, long-term & longitudinal memory",
      "data ingestion & knowledge pipelines",
    ],
    roles: [true, true, true],
    focus: ["index", "rerank", "ground", "memory", "ingest"],
    evidence: "MindScape · Filmora",
  },
  {
    id: "control",
    accent: "var(--vx-amber)",
    label: ["Evaluation, safety", "& observability"],
    skills: [
      "LLM & agent evaluation harnesses",
      "regression testing & failure analysis",
      "guardrails, validation & policy control",
      "RL-style observability & refinement",
      "OpenTelemetry & distributed tracing",
    ],
    roles: [true, true, true],
    focus: ["evals", "regression", "guardrails", "rl loop", "tracing"],
    evidence: "Antigravity · SLM distillation",
  },
  {
    id: "platform",
    accent: "var(--vx-blue)",
    label: ["Inference platform", "& production systems"],
    skills: [
      "model serving, gateways & intelligent routing",
      "latency, throughput, token & cost optimization",
      "caching, fallbacks & runtime reliability",
      "quantization, distillation & efficient inference",
      "cloud deployment, containers & CI/CD",
    ],
    roles: [true, false, true],
    focus: ["routing", "latency", "cache", "quantize", "deploy"],
    evidence: "Optek embedded · Antigravity",
  },
] as const;

const ROLE_ADVANCE_MS = 10400;

/* --- The section renders twice.
   "brief" sits right after the hero: roles → the five engineering areas →
   their operational figures. No capability lists, bigger type, lots of air.
   "full" sits just before Contact, once the projects have been seen: the same
   spine plus all 25 capabilities, the rotating highlights, and the evidence
   behind each layer. --- */
const FIGURE_W = 172;
const FIGURE_H = 92;

type Geometry = {
  viewBox: string;
  headerY: number;
  roleX: number; roleW: number; roleH: number; roleY: readonly number[];
  areaX: number; areaW: number; areaH: number; areaY: readonly number[];
  figureX: number;
  skillX: number; skillW: number; skillTop: number; skillPitch: number;
};

const BRIEF: Geometry = {
  // aspect ~2.0 so the map fits its container by height instead of
  // overflowing and clipping the last row; header owns its own band
  viewBox: "0 0 1010 456",
  headerY: 15,
  roleX: 8, roleW: 280, roleH: 96, roleY: [87, 183, 279],
  areaX: 372, areaW: 416, areaH: 74, areaY: [22, 108, 194, 280, 366],
  figureX: 806,
  skillX: 0, skillW: 0, skillTop: 0, skillPitch: 0,
};

const FULL: Geometry = {
  viewBox: "0 0 1320 602",
  headerY: 18,
  roleX: 8, roleW: 240, roleH: 104, roleY: [146, 256, 366],
  areaX: 296, areaW: 300, areaH: 104, areaY: [38, 150, 262, 374, 486],
  figureX: 1112,
  skillX: 640, skillW: 452, skillTop: 20, skillPitch: 18,
};


/** One mark per engineering area: recognised before it is read. */
function AreaGlyph({ id, x, y }: { id: string; x: number; y: number }) {
  const g = (children: React.ReactNode) => (
    <g transform={`translate(${x},${y})`} className="vx-map-glyph">{children}</g>
  );
  if (id === "application") {
    return g(<>
      <rect x={0} y={1} width={20} height={16} rx={2.5} />
      <line x1={0} y1={6} x2={20} y2={6} />
      <line x1={4} y1={11} x2={11} y2={11} />
    </>);
  }
  if (id === "runtime") {
    return g(<>
      <circle cx={3} cy={4} r={2.6} /><circle cx={3} cy={15} r={2.6} />
      <circle cx={17} cy={9.5} r={2.6} />
      <line x1={5} y1={5} x2={15} y2={9} /><line x1={5} y1={14} x2={15} y2={10} />
    </>);
  }
  if (id === "knowledge") {
    return g(<>
      <ellipse cx={10} cy={4} rx={9} ry={3} />
      <path d="M1 4v5c0 1.7 4 3 9 3s9-1.3 9-3V4" />
      <path d="M1 10v5c0 1.7 4 3 9 3s9-1.3 9-3v-5" />
    </>);
  }
  if (id === "control") {
    return g(<>
      <path d="M10 1 18 4v6c0 4.4-3.4 7.4-8 8.6C5.4 17.4 2 14.4 2 10V4Z" />
      <path d="M6.6 9.6 9 12l4.6-4.6" />
    </>);
  }
  return g(<>
    <rect x={1} y={1} width={18} height={5} rx={1.5} />
    <rect x={1} y={8} width={18} height={5} rx={1.5} />
    <rect x={1} y={15} width={18} height={4} rx={1.5} />
  </>);
}

/** Three highlights at a time, each from a DIFFERENT engineering area, chosen
 *  across the whole capability set. Integer LCG, so SSR and the client agree
 *  on the first frame — no float drift, no hydration mismatch. */
function pickHighlights(tick: number, areas: readonly Area[]): Map<string, number> {
  const picked = new Map<string, number>();
  if (areas.length === 0) return picked;
  // Math.imul keeps the multiply exact at 32 bits. Plain `*` overflows the
  // safe-integer range and starts repeating, which silently dropped a pick.
  let seed = (Math.imul(tick + 1, 7919) + 13) & 0x7fffffff;
  const next = () => {
    seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
    return seed;
  };
  const want = Math.min(3, areas.length);
  for (let guard = 0; guard < 64 && picked.size < want; guard += 1) {
    const area = areas[next() % areas.length];
    if (picked.has(area.id)) continue;
    picked.set(area.id, next() % area.skills.length);
  }
  return picked;
}

/** Every capability draws its OWN operation. Areas 1-3 dispatch a distinct
 *  figure per capability (orchestration vs tool calling vs streaming are not
 *  the same picture); areas 4-5 keep one figure that steers by capability.
 *  Box is FIGURE_W x FIGURE_H centred on (x, y). All motion is CSS. */
function AreaFigure({ id, x, y, variant, focus }: { id: string; x: number; y: number; variant: number; focus: string }) {
  const top = y - FIGURE_H / 2;
  const mid = top + 52;
  const v = variant;
  const wrap = (label: string, children: React.ReactNode) => (
    <g className="vx-map-figure" aria-hidden="true">
      <rect x={x} y={top} width={FIGURE_W} height={FIGURE_H} rx={7} className="vx-fig-plate" />
      <text x={x + 9} y={top + 14} className="vx-fig-tag start">{label}</text>
      <text x={x + FIGURE_W - 9} y={top + 14} className="vx-fig-focus">{focus}</text>
      {children}
    </g>
  );
  const flow = (d: string, delay = 0, slow = false) => (
    <circle r={2.8} className={slow ? "vx-fig-orbit slow" : "vx-fig-orbit"}
      style={{ offsetPath: `path("${d}")`, animationDelay: `${delay}s` } as CSSProperties} />
  );

  /* ---------- 1 · AI application & product engineering ---------- */
  if (id === "application") {
    if (v === 0) return wrap("layered app", <>
      {["ui", "api", "data"].map((tier, i) => (
        <g key={tier}>
          <rect x={x + 24} y={mid - 26 + i * 22} width={92} height={17} rx={3} className={i === 0 ? "vx-fig-frame lit" : "vx-fig-frame"} />
          <text x={x + 32} y={mid - 14 + i * 22} className="vx-fig-axis">{tier}</text>
          <rect x={x + 66} y={mid - 21 + i * 22} width={42 - i * 10} height={5} rx={2.5} className={i === 0 ? "vx-fig-bar" : "vx-fig-bar dim"} style={{ animationDelay: `${i * 0.3}s` } as CSSProperties} />
        </g>
      ))}
      <path d={`M ${x + 130} ${mid - 18} L ${x + 130} ${mid + 22}`} className="vx-fig-spoke is-on" />
      {flow(`M ${x + 130} ${mid - 18} L ${x + 130} ${mid + 22}`)}
    </>);
    if (v === 1) return wrap("api boundary", <>
      <rect x={x + 10} y={mid - 18} width={34} height={36} rx={4} className="vx-fig-frame lit" />
      <rect x={x + 128} y={mid - 18} width={34} height={36} rx={4} className="vx-fig-frame" />
      <text x={x + 145} y={mid + 4} className="vx-fig-tag">svc</text>
      <path d={`M ${x + 46} ${mid - 8} L ${x + 126} ${mid - 8}`} className="vx-fig-spoke is-on" />
      <path d={`M ${x + 126} ${mid + 10} L ${x + 46} ${mid + 10}`} className="vx-fig-spoke" />
      {flow(`M ${x + 46} ${mid - 8} L ${x + 126} ${mid - 8}`)}
      {flow(`M ${x + 126} ${mid + 10} L ${x + 46} ${mid + 10}`, 0, true)}
    </>);
    if (v === 2) return wrap("build · ship", <>
      {["build", "test", "ship"].map((stage, i) => (
        <g key={stage}>
          <rect x={x + 12 + i * 52} y={mid - 12} width={40} height={24} rx={4} className={i === 2 ? "vx-fig-frame lit" : "vx-fig-frame"} />
          <text x={x + 32 + i * 52} y={mid + 3} className="vx-fig-tag">{stage}</text>
          {i < 2 ? <path d={`M ${x + 54 + i * 52} ${mid} L ${x + 62 + i * 52} ${mid}`} className="vx-fig-spoke is-on" /> : null}
        </g>
      ))}
      {flow(`M ${x + 12} ${mid} L ${x + 156} ${mid}`)}
    </>);
    if (v === 3) return wrap("schema check", <>
      <rect x={x + 14} y={mid - 24} width={96} height={50} rx={4} className="vx-fig-frame lit" />
      <text x={x + 22} y={mid - 12} className="vx-fig-axis">{"{ }"}</text>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={x + 42} y={mid - 18 + i * 14} width={38} height={5} rx={2.5} className="vx-fig-bar dim" style={{ animationDelay: `${i * 0.25}s` } as CSSProperties} />
          <path d={`M ${x + 88} ${mid - 16 + i * 14} l 3 3 l 6 -6`} className="vx-fig-check" />
        </g>
      ))}
      <rect x={x + 122} y={mid - 8} width={36} height={16} rx={3} className="vx-fig-chip pass" />
      <text x={x + 140} y={mid + 4} className="vx-fig-tag">valid</text>
    </>);
    return wrap("human gate", <>
      <rect x={x + 14} y={mid - 24} width={80} height={48} rx={4} className="vx-fig-frame" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={x + 24} y={mid - 14 + i * 12} width={58 - i * 14} height={5} rx={2.5} className="vx-fig-bar dim" style={{ animationDelay: `${i * 0.25}s` } as CSSProperties} />
      ))}
      <rect x={x + 106} y={mid - 20} width={52} height={18} rx={4} className="vx-fig-chip pass" />
      <text x={x + 132} y={mid - 8} className="vx-fig-tag">approve</text>
      <rect x={x + 106} y={mid + 4} width={52} height={18} rx={4} className="vx-fig-chip" />
      <text x={x + 132} y={mid + 16} className="vx-fig-tag">hold</text>
    </>);
  }

  /* ---------- 2 · Agent runtime & orchestration ---------- */
  if (id === "runtime") {
    if (v === 0) return wrap("workflow dag", <>
      <rect x={x + 10} y={mid - 12} width={30} height={24} rx={4} className="vx-fig-frame lit" />
      <text x={x + 25} y={mid + 4} className="vx-fig-tag">plan</text>
      <path d={`M ${x + 42} ${mid} L ${x + 54} ${mid}`} className="vx-fig-spoke is-on" />
      <path d={`M ${x + 54} ${mid - 24} L ${x + 54} ${mid + 24}`} className="vx-fig-spoke is-on" />
      {[-24, 0, 24].map((dy, i) => (
        <g key={i}>
          <path d={`M ${x + 54} ${mid + dy} L ${x + 66} ${mid + dy}`} className="vx-fig-spoke is-on" />
          <rect x={x + 68} y={mid + dy - 9} width={44} height={18} rx={3} className="vx-fig-frame" />
          <circle cx={x + 78} cy={mid + dy} r={3} className="vx-fig-node is-on" style={{ animationDelay: `${i * 0.45}s` } as CSSProperties} />
          <rect x={x + 86} y={mid + dy - 2} width={18} height={4} rx={2} className="vx-fig-bar dim" style={{ animationDelay: `${i * 0.45}s` } as CSSProperties} />
          <path d={`M ${x + 114} ${mid + dy} L ${x + 126} ${mid + dy}`} className="vx-fig-spoke" />
        </g>
      ))}
      <path d={`M ${x + 126} ${mid - 24} L ${x + 126} ${mid + 24}`} className="vx-fig-spoke" />
      <path d={`M ${x + 126} ${mid} L ${x + 138} ${mid}`} className="vx-fig-spoke is-on" />
      <circle cx={x + 148} cy={mid} r={8} className="vx-fig-hub" />
      {flow(`M ${x + 42} ${mid} L ${x + 54} ${mid} L ${x + 54} ${mid - 24} L ${x + 66} ${mid - 24}`)}
    </>);
    if (v === 1) return wrap("reasoning chain", <>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <circle cx={x + 24 + i * 40} cy={mid} r={9} className={i < 3 ? "vx-fig-node is-on" : "vx-fig-node"} style={{ animationDelay: `${i * 0.45}s` } as CSSProperties} />
          <text x={x + 24 + i * 40} y={mid + 3} className="vx-fig-tag">{i + 1}</text>
          {i < 3 ? <path d={`M ${x + 34 + i * 40} ${mid} L ${x + 55 + i * 40} ${mid}`} className="vx-fig-spoke is-on" /> : null}
        </g>
      ))}
      {flow(`M ${x + 24} ${mid} L ${x + 144} ${mid}`)}
      <text x={x + 9} y={top + 84} className="vx-fig-axis">step by step</text>
    </>);
    if (v === 2) return wrap("tool call", <>
      <rect x={x + 10} y={mid - 16} width={44} height={32} rx={4} className="vx-fig-frame lit" />
      <text x={x + 32} y={mid + 3} className="vx-fig-tag">agent</text>
      <rect x={x + 112} y={mid - 16} width={50} height={32} rx={4} className="vx-fig-frame" />
      <text x={x + 137} y={mid + 3} className="vx-fig-tag">tool</text>
      <path d={`M ${x + 56} ${mid - 8} L ${x + 110} ${mid - 8}`} className="vx-fig-spoke is-on" />
      <text x={x + 83} y={mid - 13} className="vx-fig-axis" style={{ textAnchor: "middle" } as CSSProperties}>call</text>
      <path d={`M ${x + 110} ${mid + 9} L ${x + 56} ${mid + 9}`} className="vx-fig-spoke" />
      <text x={x + 83} y={mid + 21} className="vx-fig-axis" style={{ textAnchor: "middle" } as CSSProperties}>typed result</text>
      {flow(`M ${x + 56} ${mid - 8} L ${x + 110} ${mid - 8}`)}
      {flow(`M ${x + 110} ${mid + 9} L ${x + 56} ${mid + 9}`, 0, true)}
    </>);
    if (v === 3) return wrap("hand-off", <>
      <rect x={x + 12} y={mid - 16} width={46} height={32} rx={4} className="vx-fig-frame lit" />
      <text x={x + 35} y={mid + 3} className="vx-fig-tag">A</text>
      <rect x={x + 114} y={mid - 16} width={46} height={32} rx={4} className="vx-fig-frame" />
      <text x={x + 137} y={mid + 3} className="vx-fig-tag">B</text>
      <path d={`M ${x + 60} ${mid} L ${x + 112} ${mid}`} className="vx-fig-spoke is-on" />
      <rect x={x + 78} y={mid - 20} width={18} height={9} rx={2} className="vx-fig-chip" />
      <text x={x + 87} y={mid - 13} className="vx-fig-tag">ctx</text>
      {flow(`M ${x + 60} ${mid} L ${x + 112} ${mid}`)}
    </>);
    return wrap("voice loop", <>
      <text x={x + 10} y={mid - 22} className="vx-fig-axis">mic</text>
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={i} x={x + 10 + i * 8} y={mid - 14 + (7 - [4, 9, 5, 12, 7, 14, 6, 11, 4, 9, 13, 6, 10, 5][i]) / 2}
          width={4} height={[4, 9, 5, 12, 7, 14, 6, 11, 4, 9, 13, 6, 10, 5][i]} rx={2}
          className="vx-fig-bar" style={{ animationDelay: `${i * 0.09}s` } as CSSProperties} />
      ))}
      <rect x={x + 10} y={mid + 4} width={100} height={14} rx={3} className="vx-fig-frame lit" />
      <text x={x + 16} y={mid + 14} className="vx-fig-axis">partial → final</text>
      <path d={`M ${x + 114} ${mid + 11} L ${x + 130} ${mid + 11}`} className="vx-fig-spoke is-on" />
      <circle cx={x + 146} cy={mid + 11} r={9} className="vx-fig-hub" />
      <text x={x + 146} y={mid + 14} className="vx-fig-tag">tts</text>
      {flow(`M ${x + 114} ${mid + 11} L ${x + 130} ${mid + 11}`)}
    </>);
  }

  /* ---------- 3 · Knowledge, memory & retrieval ---------- */
  if (id === "knowledge") {
    if (v === 0) {
      const layers = [
        { label: "L2", ly: top + 32, xs: [22, 62, 104, 146] },
        { label: "L1", ly: top + 54, xs: [16, 42, 68, 94, 120, 150] },
        { label: "L0", ly: top + 76, xs: [12, 30, 48, 66, 84, 102, 120, 138, 156] },
      ];
      const path: [number, number][] = [[0, 2], [1, 3], [2, 5]];
      return wrap("hnsw index", <>
        {layers.map((layer, li) => (
          <g key={layer.label}>
            <text x={x + 4} y={layer.ly + 3} className="vx-fig-axis">{layer.label}</text>
            <line x1={x + 14} y1={layer.ly} x2={x + FIGURE_W - 8} y2={layer.ly} className="vx-fig-rule" />
            {layer.xs.map((px, ni) => {
              const on = path.some(([pl, pn]) => pl === li && pn === ni) || (li === 2 && (ni === 5 || ni === 6));
              return <circle key={ni} cx={x + px} cy={layer.ly} r={on ? 3.4 : 1.9} className={on ? "vx-fig-node is-on" : "vx-fig-node"} style={{ animationDelay: `${li * 0.3}s` } as CSSProperties} />;
            })}
          </g>
        ))}
        {path.slice(1).map(([pl, pn], k) => {
          const [al, an] = path[k];
          return <line key={k} x1={x + layers[al].xs[an]} y1={layers[al].ly} x2={x + layers[pl].xs[pn]} y2={layers[pl].ly} className="vx-fig-spoke is-on" />;
        })}
        {flow(`M ${x + layers[0].xs[2]} ${layers[0].ly} L ${x + layers[1].xs[3]} ${layers[1].ly} L ${x + layers[2].xs[5]} ${layers[2].ly}`)}
      </>);
    }
    if (v === 1) return wrap("rerank", <>
      {[
        { w: 74, cls: "vx-fig-rank-down", rank: "1", lit: false },
        { w: 108, cls: "vx-fig-rank-up", rank: "2", lit: true },
        { w: 86, cls: "", rank: "3", lit: false },
        { w: 58, cls: "", rank: "4", lit: false },
      ].map((row, i) => (
        <g key={i} className={row.cls}>
          <text x={x + 12} y={mid - 15 + i * 15} className="vx-fig-axis">{row.rank}</text>
          <rect x={x + 26} y={mid - 22 + i * 15} width={row.w} height={9} rx={3}
            className={row.lit ? "vx-fig-bar" : "vx-fig-bar dim"} style={{ animationDelay: `${i * 0.2}s` } as CSSProperties} />
        </g>
      ))}
      <text x={x + FIGURE_W - 8} y={top + 84} className="vx-fig-axis end">cross-encoder reorder</text>
    </>);
    if (v === 2) return wrap("grounding", <>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={x + 12} y={mid - 24 + i * 17} width={42} height={13} rx={3} className={i === 1 ? "vx-fig-frame lit" : "vx-fig-frame"} />
          <text x={x + 33} y={mid - 15 + i * 17} className="vx-fig-tag">doc</text>
          <path d={`M ${x + 56} ${mid - 18 + i * 17} L ${x + 104} ${mid}`} className={i === 1 ? "vx-fig-spoke is-on" : "vx-fig-spoke"} />
        </g>
      ))}
      <rect x={x + 106} y={mid - 14} width={56} height={28} rx={4} className="vx-fig-frame lit" />
      <text x={x + 134} y={mid + 3} className="vx-fig-tag">cited</text>
      {flow(`M ${x + 56} ${mid - 1} L ${x + 104} ${mid}`)}
    </>);
    if (v === 3) return wrap("session recall", <>
      <line x1={x + 12} y1={mid + 18} x2={x + 122} y2={mid + 18} className="vx-fig-line" />
      {["s1", "s2", "s3"].map((label, i) => (
        <g key={label}>
          <rect x={x + 12 + i * 38} y={mid - 6} width={30} height={18} rx={3} className="vx-fig-frame" />
          <text x={x + 27 + i * 38} y={mid + 7} className="vx-fig-tag">{label}</text>
          <circle cx={x + 27 + i * 38} cy={mid + 18} r={2.6} className="vx-fig-node is-on" style={{ animationDelay: `${i * 0.35}s` } as CSSProperties} />
        </g>
      ))}
      <rect x={x + 128} y={mid - 10} width={34} height={26} rx={4} className="vx-fig-frame lit" />
      <text x={x + 145} y={mid + 6} className="vx-fig-tag">now</text>
      <path d={`M ${x + 27} ${mid - 8} Q ${x + 88} ${mid - 30}, ${x + 145} ${mid - 12}`} className="vx-fig-spoke is-on" />
      {flow(`M ${x + 27} ${mid - 8} Q ${x + 88} ${mid - 30}, ${x + 145} ${mid - 12}`)}
      <text x={x + 12} y={top + 84} className="vx-fig-axis">longitudinal recall</text>
    </>);
    return wrap("ingest pipeline", <>
      {["src", "chunk", "embed"].map((stage, i) => (
        <g key={stage}>
          <rect x={x + 12 + i * 50} y={mid - 24} width={40} height={20} rx={3} className={i === 2 ? "vx-fig-frame lit" : "vx-fig-frame"} />
          <text x={x + 32 + i * 50} y={mid - 11} className="vx-fig-tag">{stage}</text>
          {i < 2 ? <path d={`M ${x + 53 + i * 50} ${mid - 14} L ${x + 61 + i * 50} ${mid - 14}`} className="vx-fig-spoke is-on" /> : null}
        </g>
      ))}
      <path d={`M ${x + 132} ${mid - 4} L ${x + 132} ${mid + 8}`} className="vx-fig-spoke is-on" />
      <g className="vx-fig-store">
        <ellipse cx={x + 86} cy={mid + 14} rx={48} ry={6} className="vx-fig-frame lit" />
        <path d={`M ${x + 38} ${mid + 14} v 10 a 48 6 0 0 0 96 0 v -10`} className="vx-fig-frame lit" />
        <text x={x + 86} y={mid + 26} className="vx-fig-tag">vector store</text>
      </g>
      {flow(`M ${x + 12} ${mid - 14} L ${x + 132} ${mid - 14} L ${x + 132} ${mid + 8}`)}
    </>);
  }

  /* ---------- 4 · Evaluation, safety & observability ---------- */
  if (id === "control") {
    if (v === 0) return wrap("eval harness", <>
      {["accuracy", "coverage", "tone"].map((metric, i) => (
        <g key={metric}>
          <text x={x + 12} y={mid - 12 + i * 18} className="vx-fig-axis">{metric}</text>
          <rect x={x + 74} y={mid - 20 + i * 18} width={76} height={7} rx={3.5} className="vx-fig-track" />
          <rect x={x + 74} y={mid - 20 + i * 18} width={[68, 52, 61][i]} height={7} rx={3.5}
            className="vx-fig-bar" style={{ animationDelay: `${i * 0.25}s` } as CSSProperties} />
        </g>
      ))}
      <text x={x + FIGURE_W - 8} y={top + 84} className="vx-fig-axis end">llm-judge scored</text>
    </>);
    if (v === 1) return wrap("regression suite", <>
      {Array.from({ length: 24 }).map((_, i) => (
        <rect key={i} x={x + 12 + (i % 8) * 18} y={mid - 24 + Math.floor(i / 8) * 15} width={13} height={11} rx={2.5}
          className={i === 13 ? "vx-fig-cell bad" : "vx-fig-cell"} style={{ animationDelay: `${i * 0.05}s` } as CSSProperties} />
      ))}
      <text x={x + 12} y={mid + 30} className="vx-fig-axis">23 pass</text>
      <text x={x + FIGURE_W - 8} y={mid + 30} className="vx-fig-axis end">1 caught</text>
    </>);
    if (v === 2) return wrap("policy gate", <>
      <line x1={x + 8} y1={mid} x2={x + 118} y2={mid} className="vx-fig-line" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={x + 30 + i * 28} y={mid - 14} width={4} height={28} rx={2}
          className={i === 2 ? "vx-fig-gate is-on" : "vx-fig-gate"} style={{ animationDelay: `${i * 0.5}s` } as CSSProperties} />
      ))}
      <line x1={x + 122} y1={mid - 24} x2={x + 122} y2={mid + 24} className="vx-fig-gateline" />
      <rect x={x + 130} y={mid - 9} width={32} height={18} rx={4} className="vx-fig-chip block" />
      <path d={`M ${x + 141} ${mid - 4} l 9 9 M ${x + 150} ${mid - 4} l -9 9`} className="vx-fig-check block" />
      {flow(`M ${x + 8} ${mid} L ${x + 118} ${mid}`)}
      <text x={x + 8} y={top + 84} className="vx-fig-axis">unsupported claim blocked</text>
    </>);
    if (v === 3) return wrap("rl refinement", <>
      {/* a closed loop: traces feed scoring, scoring updates the policy */}
      <ellipse cx={x + 62} cy={mid} rx={44} ry={26} className="vx-fig-loop" />
      <circle r={3.4} className="vx-fig-orbit" style={{ offsetPath: `path("M ${x + 106} ${mid} A 44 26 0 1 1 ${x + 18} ${mid} A 44 26 0 1 1 ${x + 106} ${mid}")` } as CSSProperties} />
      <rect x={x + 34} y={mid - 34} width={56} height={16} rx={3} className="vx-fig-frame lit" />
      <text x={x + 62} y={mid - 23} className="vx-fig-tag">traces</text>
      <rect x={x + 34} y={mid + 18} width={56} height={16} rx={3} className="vx-fig-frame" />
      <text x={x + 62} y={mid + 29} className="vx-fig-tag">policy</text>
      <rect x={x + 118} y={mid - 9} width={44} height={18} rx={3} className="vx-fig-chip pass" />
      <text x={x + 140} y={mid + 4} className="vx-fig-tag">gated</text>
      <path d={`M ${x + 106} ${mid} L ${x + 116} ${mid}`} className="vx-fig-spoke is-on" />
    </>);
    const spans = [{ off: 0, len: 74 }, { off: 12, len: 46 }, { off: 30, len: 58 }, { off: 52, len: 34 }];
    return wrap("otel trace", <>
      {spans.map((span, i) => (
        <g key={i}>
          <rect x={x + 10 + span.off} y={mid - 26 + i * 14} width={span.len} height={7} rx={3.5}
            className={i === 0 ? "vx-fig-bar" : "vx-fig-bar dim"} style={{ animationDelay: `${i * 0.24}s` } as CSSProperties} />
          <text x={x + 6 + span.off} y={mid - 20 + i * 14} className="vx-fig-axis end">·</text>
        </g>
      ))}
      <line x1={x + 10} y1={mid + 22} x2={x + 162} y2={mid + 22} className="vx-fig-rule" />
      <text x={x + 10} y={top + 84} className="vx-fig-axis">4 spans · 1 trace</text>
      {flow(`M ${x + 10} ${mid - 22} L ${x + 84} ${mid - 22}`)}
    </>);
  }

  /* ---------- 5 · Inference platform & production systems ---------- */
  if (v === 1) return wrap("latency budget", <>
    {[{ k: "p50", w: 44 }, { k: "p95", w: 88 }, { k: "cost", w: 62 }].map((row, i) => (
      <g key={row.k}>
        <text x={x + 12} y={mid - 12 + i * 18} className="vx-fig-axis">{row.k}</text>
        <rect x={x + 46} y={mid - 20 + i * 18} width={104} height={7} rx={3.5} className="vx-fig-track" />
        <rect x={x + 46} y={mid - 20 + i * 18} width={row.w} height={7} rx={3.5}
          className={i === 1 ? "vx-fig-bar warn" : "vx-fig-bar"} style={{ animationDelay: `${i * 0.25}s` } as CSSProperties} />
      </g>
    ))}
    <line x1={x + 132} y1={mid - 26} x2={x + 132} y2={mid + 26} className="vx-fig-gateline" />
    <text x={x + FIGURE_W - 8} y={top + 84} className="vx-fig-axis end">budget</text>
  </>);
  if (v === 2) return wrap("cache · fallback", <>
    <rect x={x + 10} y={mid - 16} width={40} height={32} rx={4} className="vx-fig-frame lit" />
    <text x={x + 30} y={mid + 3} className="vx-fig-tag">cache</text>
    <path d={`M ${x + 52} ${mid - 8} L ${x + 116} ${mid - 8}`} className="vx-fig-spoke is-on" />
    <text x={x + 84} y={mid - 13} className="vx-fig-axis" style={{ textAnchor: "middle" } as CSSProperties}>hit</text>
    <path d={`M ${x + 52} ${mid + 10} L ${x + 116} ${mid + 10}`} className="vx-fig-spoke" />
    <text x={x + 84} y={mid + 22} className="vx-fig-axis" style={{ textAnchor: "middle" } as CSSProperties}>miss → fallback</text>
    <rect x={x + 118} y={mid - 18} width={44} height={16} rx={3} className="vx-fig-chip pass" />
    <text x={x + 140} y={mid - 6} className="vx-fig-tag">served</text>
    <rect x={x + 118} y={mid + 2} width={44} height={16} rx={3} className="vx-fig-chip" />
    <text x={x + 140} y={mid + 14} className="vx-fig-tag">backup</text>
    {flow(`M ${x + 52} ${mid - 8} L ${x + 116} ${mid - 8}`)}
  </>);
  if (v === 3) return wrap("compression", <>
    <rect x={x + 12} y={mid - 26} width={52} height={52} rx={5} className="vx-fig-frame" />
    <text x={x + 38} y={mid + 3} className="vx-fig-tag">fp32</text>
    <path d={`M ${x + 68} ${mid} L ${x + 96} ${mid}`} className="vx-fig-spoke is-on" />
    <text x={x + 82} y={mid - 6} className="vx-fig-axis" style={{ textAnchor: "middle" } as CSSProperties}>4×</text>
    <rect x={x + 100} y={mid - 13} width={26} height={26} rx={4} className="vx-fig-frame lit" />
    <text x={x + 113} y={mid + 4} className="vx-fig-tag">int8</text>
    <rect x={x + 132} y={mid - 9} width={30} height={18} rx={3} className="vx-fig-chip pass" />
    <text x={x + 147} y={mid + 4} className="vx-fig-tag">edge</text>
    {flow(`M ${x + 68} ${mid} L ${x + 96} ${mid}`)}
  </>);
  if (v === 4) return wrap("ci/cd deploy", <>
    {["ci", "img", "prod"].map((stage, i) => (
      <g key={stage}>
        <rect x={x + 10 + i * 46} y={mid - 22} width={38} height={18} rx={3} className={i === 2 ? "vx-fig-frame lit" : "vx-fig-frame"} />
        <text x={x + 29 + i * 46} y={mid - 10} className="vx-fig-tag">{stage}</text>
        {i < 2 ? <path d={`M ${x + 49 + i * 46} ${mid - 13} L ${x + 55 + i * 46} ${mid - 13}`} className="vx-fig-spoke is-on" /> : null}
      </g>
    ))}
    {[0, 1, 2].map((i) => (
      <rect key={i} x={x + 106 + i * 20} y={mid + 8} width={16} height={16} rx={3}
        className="vx-fig-cell" style={{ animationDelay: `${i * 0.3}s` } as CSSProperties} />
    ))}
    <text x={x + 10} y={mid + 20} className="vx-fig-axis">replicas</text>
    {flow(`M ${x + 10} ${mid - 13} L ${x + 146} ${mid - 13}`)}
  </>);
  const lanes = [
    { dy: -22, w: 58, tag: "fast" },
    { dy: 0, w: 40, tag: "deep" },
    { dy: 22, w: 26, tag: "fallback" },
  ].map((lane, i) => ({ ...lane, lit: i === 0 }));
  return wrap("model routing", <>
    <rect x={x + 8} y={mid - 14} width={26} height={28} rx={4} className="vx-fig-frame lit" />
    <text x={x + 21} y={mid + 3} className="vx-fig-tag">gw</text>
    {lanes.map((lane, i) => (
      <g key={i}>
        <path d={`M ${x + 35} ${mid} Q ${x + 52} ${mid}, ${x + 62} ${mid + lane.dy}`} className={lane.lit ? "vx-fig-spoke is-on" : "vx-fig-spoke"} />
        <rect x={x + 64} y={mid + lane.dy - 7} width={lane.w} height={14} rx={3} className={lane.lit ? "vx-fig-lane is-on" : "vx-fig-lane"} />
        <rect x={x + 66} y={mid + lane.dy - 5} width={lane.w - 10} height={10} rx={2}
          className={lane.lit ? "vx-fig-bar" : "vx-fig-bar dim"} style={{ animationDelay: `${i * 0.32}s` } as CSSProperties} />
        <text x={x + 66 + lane.w + 6} y={mid + lane.dy + 4} className="vx-fig-axis">{lane.tag}</text>
      </g>
    ))}
    {flow(`M ${x + 35} ${mid} Q ${x + 52} ${mid}, ${x + 62} ${mid - 22}`)}
  </>);
}

const SR_ONLY_STYLE: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export function ProfileSection({ variant = "full" }: { variant?: "brief" | "full" } = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [compactHead, setCompactHead] = useState(false);
  const [activeRole, setActiveRole] = useState(0);
  const [spotTick, setSpotTick] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "-14% 0px -14%",
      threshold: 0.08,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // The title states the question, then gets out of the way of the answer.
  useEffect(() => {
    if (!visible) return;
    if (reducedMotion) {
      setCompactHead(true);
      return;
    }
    const timer = window.setTimeout(() => setCompactHead(true), 2200);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, visible]);

  const autoplaying = playing && !reducedMotion;
  const running = visible && autoplaying;

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setActiveRole((value) => (value + 1) % ROLES.length);
    }, ROLE_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [running]);

  // Three capabilities stay lit at a time and move every few seconds, so the
  // chain role → area → capability keeps drawing the eye along itself.
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setSpotTick((value) => value + 1), 3000);
    return () => window.clearInterval(timer);
  }, [running]);

  const brief = variant === "brief";
  const G = brief ? BRIEF : FULL;
  const role = ROLES[activeRole];
  const liveAreas = AREAS.filter((area) => area.roles[activeRole]);
  // Three highlights, three different areas, re-rolled every few seconds.
  const highlights = pickHighlights(spotTick, liveAreas);
  const skillCount = liveAreas.reduce((sum, area) => sum + area.skills.length, 0);

  function handleRoleKeys(event: KeyboardEvent<SVGSVGElement>) {
    if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") setActiveRole(0);
    else if (event.key === "End") setActiveRole(ROLES.length - 1);
    else if (event.key === "ArrowDown") setActiveRole((value) => (value + 1) % ROLES.length);
    else setActiveRole((value) => (value - 1 + ROLES.length) % ROLES.length);
  }

  return (
    <section
      ref={sectionRef}
      id={brief ? "profile" : "capabilities"}
      className="vx-profile vx-section-shell vx-accent-lime vx-page"
      data-vx-page
      data-role={role.id}
      data-playing={autoplaying}
    >
      <header className="vx-profile-head" data-compact={compactHead}>
        <div>
          <h2>{brief ? "What roles am I targeting?" : "Every capability, and where I built it."}</h2>
          <p>{brief ? "Three roles — and the five engineering layers I build them on." : "All five layers in full: every capability, and the work that proves it."}</p>
        </div>
        <div className="vx-profile-head-meta">
          <strong>{liveAreas.length}<i>areas</i></strong>
          {brief ? null : <strong>{skillCount}<i>skills</i></strong>}
          <button
            type="button"
            className="vx-map-pause"
            aria-pressed={!autoplaying}
            disabled={reducedMotion}
            onClick={() => setPlaying((value) => !value)}
          >
            <i data-playing={autoplaying} aria-hidden="true" />
            {reducedMotion ? "Static" : autoplaying ? "Pause" : "Resume"}
          </button>
        </div>
      </header>

      <div className="vx-role-map">
        <svg
          viewBox={G.viewBox}
          className="op-svg"
          role="tablist"
          aria-label="Target roles mapped to engineering areas and skills"
          tabIndex={0}
          onKeyDown={handleRoleKeys}
        >
          <text x={G.roleX} y={G.headerY} className="vx-map-col">TARGET ROLES</text>
          <line x1={G.roleX} y1={G.headerY + 8} x2={G.roleX + G.roleW} y2={G.headerY + 8} className="vx-map-col-rule" />
          <line x1={G.areaX} y1={G.headerY + 8} x2={G.areaX + G.areaW} y2={G.headerY + 8} className="vx-map-col-rule" />
          <line x1={brief ? G.figureX : G.skillX} y1={G.headerY + 8} x2={brief ? G.figureX + FIGURE_W : G.skillX + G.skillW} y2={G.headerY + 8} className="vx-map-col-rule" />
          <text x={G.areaX} y={G.headerY} className="vx-map-col">HOW I BUILD AI SYSTEMS</text>
          {brief
            ? <text x={G.figureX} y={G.headerY} className="vx-map-col">HOW EACH LAYER RUNS</text>
            : <text x={G.skillX} y={G.headerY} className="vx-map-col">MY CORE CAPABILITIES IN EACH AREA</text>}

          {/* Only the active role's edges are drawn: role → its engineering areas. */}
          {AREAS.map((area, areaIndex) => {
            if (!area.roles[activeRole]) return null;
            const roleCy = G.roleY[activeRole] + G.roleH / 2;
            const areaCy = G.areaY[areaIndex] + G.areaH / 2;
            const from = G.roleX + G.roleW;
            const path = `M ${from} ${roleCy} C ${from + 44} ${roleCy}, ${G.areaX - 44} ${areaCy}, ${G.areaX} ${areaCy}`;
            return (
              <g key={`edge-${area.id}`}>
                <path d={path} className="vx-map-beam" />
                {!reducedMotion ? (
                  <circle
                    r={3.6}
                    className="vx-map-pulse"
                    style={{ offsetPath: `path("${path}")`, animationDelay: `${-areaIndex * 0.44}s` } as CSSProperties}
                  />
                ) : null}
              </g>
            );
          })}

          {ROLES.map((item, index) => {
            const active = index === activeRole;
            const y = G.roleY[index];
            return (
              <g
                key={item.id}
                role="tab"
                aria-selected={active}
                tabIndex={-1}
                onClick={() => setActiveRole(index)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={G.roleX}
                  y={y}
                  width={G.roleW}
                  height={G.roleH}
                  rx={10}
                  className={active ? "vx-map-box is-on" : "vx-map-box"}
                />
                <rect x={G.roleX} y={y} width={3} height={G.roleH} className={active ? "vx-map-spine is-on" : "vx-map-spine"} />
                <text x={G.roleX + 18} y={y + 26} className="vx-map-num">{String(index + 1).padStart(2, "0")}</text>
                {item.lines.map((line, lineIndex) => (
                  <text
                    key={line}
                    x={G.roleX + 18}
                    y={y + 50 + lineIndex * 20}
                    className={active ? "vx-map-role is-on" : "vx-map-role"}
                  >
                    {line}
                  </text>
                ))}
                <text x={G.roleX + 18} y={y + 86} className="vx-map-sub">{item.short}</text>
              </g>
            );
          })}

          {AREAS.map((area, areaIndex) => {
            const on = area.roles[activeRole];
            const highlightIndex = on ? highlights.get(area.id) : undefined;
            const spot = highlightIndex !== undefined;
            const rotate = (spotTick + areaIndex * 2) % area.skills.length;
            const figureVariant = brief ? rotate : highlightIndex ?? 0;
            const y = G.areaY[areaIndex];
            return (
              <g
                key={area.id}
                data-on={on}
                data-spot={spot}
                /* spot = holds one highlight · on = in the role, resting ·
                   off = not called on by this role at all */
                data-tier={spot ? "spot" : on ? "on" : "off"}
                style={{ "--area": area.accent } as CSSProperties}
              >
                {/* engineering area */}
                <rect x={G.areaX} y={y} width={G.areaW} height={G.areaH} rx={9} className={on ? "vx-map-box is-on" : "vx-map-box"} />
                <AreaGlyph id={area.id} x={G.areaX + 16} y={y + G.areaH / 2 - (brief ? 10 : 22)} />
                {brief ? (
                  <>
                    <text x={G.areaX + 54} y={y + G.areaH / 2 - 4} className="vx-map-area is-on">{area.label.join(" ")}</text>
                    {/* one capability at a time; the figure beside it follows */}
                    <text key={rotate} x={G.areaX + 54} y={y + G.areaH / 2 + 17} className="vx-map-float">{area.skills[rotate]}</text>
                  </>
                ) : (
                  area.label.map((line, lineIndex) => (
                    <text
                      key={line}
                      x={G.areaX + 54}
                      y={y + 38 + lineIndex * 22}
                      className={on ? "vx-map-area is-on" : "vx-map-area"}
                    >
                      {line}
                    </text>
                  ))
                )}
                {/* area → skills connector (full map only) */}
                {brief ? null : <>
                <path d={`M ${G.areaX + G.areaW} ${y + G.areaH / 2} L ${G.skillX} ${y + G.areaH / 2}`} className={on ? "vx-map-wire is-on" : "vx-map-wire"} />

                {/* the skills themselves */}
                <rect x={G.skillX} y={y} width={G.skillW} height={G.areaH} rx={9} className={on ? "vx-map-panel is-on" : "vx-map-panel"} />
                {area.skills.map((skill, skillIndex) => {
                  const sx = G.skillX + 16;
                  const sy = y + G.skillTop + skillIndex * G.skillPitch;
                  return (
                    <g key={skill} data-lit={skillIndex === highlightIndex}>
                      {skillIndex === highlightIndex ? (
                        /* monospace, so the paint width is exact from the glyph count */
                        <rect
                          x={sx + 11}
                          y={sy - 11}
                          width={skill.length * 6.9 + 12}
                          height={15}
                          rx={3}
                          className="vx-map-skill-paint"
                        />
                      ) : null}
                      <circle cx={sx + 3} cy={sy - 4} r={skillIndex === highlightIndex ? 4.2 : 2.8} className="vx-map-dot" />
                      <text x={sx + 16} y={sy} className="vx-map-skill">{skill}</text>
                    </g>
                  );
                })}
                </>}
                <text x={G.areaX + 46} y={y + 84} className="vx-map-src" style={{ opacity: brief ? 0 : 1 }}>{area.evidence}</text>
                {spot || brief ? (
                  <g transform={brief ? `translate(${G.figureX},${y + G.areaH / 2}) scale(0.86) translate(${-G.figureX},${-(y + G.areaH / 2)})` : undefined}>
                    <AreaFigure id={area.id} x={G.figureX} y={y + G.areaH / 2} variant={figureVariant} focus={area.focus[figureVariant]} />
                  </g>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      {/* The reasoning rolls continuously under the map. */}
      <div className="vx-reason-bar" data-motion-paused={!autoplaying} aria-label={`Why ${role.lines.join(" ")}`}>
        <span className="vx-lens-label">Why this role</span>
        <div className="vx-reason-viewport">
          <div className="vx-reason-track" key={role.id}>
            {[0, 1].map((copy) => (
              <div className="vx-reason-run" key={copy} aria-hidden={copy === 1}>
                {role.reasoning.map((line) => (
                  <span key={line}><i aria-hidden="true">✦</i>{line}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <output style={SR_ONLY_STYLE} aria-live="polite">
        {role.lines.join(" ")}: {liveAreas.length} engineering areas, {skillCount} skills.
      </output>
    </section>
  );
}
