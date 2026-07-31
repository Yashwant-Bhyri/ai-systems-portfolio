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
      "the runtime around the model is where my depth is",
      "I have built and run a dual-lane multi-agent orchestration engine",
      "evaluation, tracing and guardrails designed in, not bolted on",
      "latency, throughput and token budgets treated as engineering",
      "model serving, gateways and intelligent routing under real load",
      "caching, fallbacks and recovery paths owned end to end",
      "regression testing so a prompt change cannot silently break behaviour",
      "the system stays inspectable after it ships, not just before",
    ],
  },
  {
    id: "agents",
    lines: ["AI Agent &", "Application Engineer"],
    short: "agentic systems as products",
    reasoning: [
      "every agent system I built shipped with a real product surface on it",
      "planning, reasoning and specialist agents coordinated in production",
      "tool use and function calling with structured, validated actions",
      "state machines, hand-offs and async execution that stay predictable",
      "grounded in retrieval and memory so the agent stays honest",
      "human-in-the-loop approval wherever the stakes justify it",
      "real-time voice and streaming runtimes, not a chat box",
      "I own the interface as well as the engine behind it",
    ],
  },
  {
    id: "full-stack",
    lines: ["Full-Stack", "AI / ML Engineer"],
    short: "data to deployment pipeline",
    reasoning: [
      "I carry the path from data and models through to deployment",
      "ingestion and knowledge pipelines that keep models fed and measurable",
      "embeddings, vector search and indexing built and tuned by hand",
      "quantization, distillation and efficient inference on constrained targets",
      "backend APIs and model integrations on the product side",
      "cloud deployment with containers, CI/CD and cost control",
      "evaluation harnesses and failure analysis before anything ships",
      "one owner from the dataset through to the running service",
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
  /** Supplementary only, and by number: the projects are introduced later. */
  appliedIn: string;
  /** Which target roles call on this area. */
  roles: readonly [boolean, boolean, boolean];
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
    appliedIn: "applied in projects 02 · 04",
    roles: [false, true, true],
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
    appliedIn: "applied in projects 01 · 02",
    roles: [true, true, false],
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
    appliedIn: "applied in projects 02 · 03",
    roles: [true, true, true],
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
      "OpenTelemetry, distributed tracing & production traces",
    ],
    appliedIn: "applied in projects 01 · 04",
    roles: [true, true, true],
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
    appliedIn: "applied in projects 01 · 04",
    roles: [true, false, true],
  },
] as const;

const ROLE_ADVANCE_MS = 10400;

/* --- map geometry (viewBox 1340 × 528) --- */
const ROLE_X = 8;
const ROLE_W = 282;
const ROLE_H = 104;
const ROLE_Y = [112, 224, 336];
const AREA_X = 358;
const AREA_W = 352;
const AREA_H = 100;
const AREA_Y = [4, 108, 212, 316, 420];
const SKILL_X = 748;
const SKILL_W = 584;


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

export function ProfileSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [compactHead, setCompactHead] = useState(false);
  const [activeRole, setActiveRole] = useState(0);
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

  const role = ROLES[activeRole];
  const liveAreas = AREAS.filter((area) => area.roles[activeRole]);
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
      id="profile"
      className="vx-profile vx-section-shell vx-accent-lime vx-page"
      data-vx-page
      data-role={role.id}
      data-playing={autoplaying}
    >
      <header className="vx-profile-head" data-compact={compactHead}>
        <div>
          <h2>What I&apos;m built for.</h2>
          <p>Three target roles — and the engineering areas and skills behind each one.</p>
        </div>
        <div className="vx-profile-head-meta">
          <strong>{liveAreas.length}<i>areas</i></strong>
          <strong>{skillCount}<i>skills</i></strong>
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
          viewBox="0 0 1340 528"
          className="op-svg"
          role="tablist"
          aria-label="Target roles mapped to engineering areas and skills"
          tabIndex={0}
          onKeyDown={handleRoleKeys}
        >
          <text x={ROLE_X} y={16} className="vx-map-col">TARGET ROLES</text>
          <text x={AREA_X} y={16} className="vx-map-col">HOW I BUILD AI SYSTEMS</text>
          <text x={SKILL_X} y={16} className="vx-map-col">MY CORE CAPABILITIES IN EACH AREA</text>

          {/* Only the active role's edges are drawn: role → its engineering areas. */}
          {AREAS.map((area, areaIndex) => {
            if (!area.roles[activeRole]) return null;
            const roleCy = ROLE_Y[activeRole] + ROLE_H / 2;
            const areaCy = AREA_Y[areaIndex] + AREA_H / 2;
            const from = ROLE_X + ROLE_W;
            const path = `M ${from} ${roleCy} C ${from + 44} ${roleCy}, ${AREA_X - 44} ${areaCy}, ${AREA_X} ${areaCy}`;
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
            const y = ROLE_Y[index];
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
                  x={ROLE_X}
                  y={y}
                  width={ROLE_W}
                  height={ROLE_H}
                  rx={10}
                  className={active ? "vx-map-box is-on" : "vx-map-box"}
                />
                <rect x={ROLE_X} y={y} width={3} height={ROLE_H} className={active ? "vx-map-spine is-on" : "vx-map-spine"} />
                <text x={ROLE_X + 18} y={y + 26} className="vx-map-num">{String(index + 1).padStart(2, "0")}</text>
                {item.lines.map((line, lineIndex) => (
                  <text
                    key={line}
                    x={ROLE_X + 18}
                    y={y + 50 + lineIndex * 20}
                    className={active ? "vx-map-role is-on" : "vx-map-role"}
                  >
                    {line}
                  </text>
                ))}
                <text x={ROLE_X + 18} y={y + 86} className="vx-map-sub">{item.short}</text>
              </g>
            );
          })}

          {AREAS.map((area, areaIndex) => {
            const on = area.roles[activeRole];
            const y = AREA_Y[areaIndex];
            return (
              <g key={area.id} data-on={on} style={{ "--area": area.accent } as CSSProperties}>
                {/* engineering area */}
                <rect x={AREA_X} y={y} width={AREA_W} height={AREA_H} rx={9} className={on ? "vx-map-box is-on" : "vx-map-box"} />
                <AreaGlyph id={area.id} x={AREA_X + 18} y={y + 20} />
                {area.label.map((line, lineIndex) => (
                  <text
                    key={line}
                    x={AREA_X + 52}
                    y={y + 32 + lineIndex * 21}
                    className={on ? "vx-map-area is-on" : "vx-map-area"}
                  >
                    {line}
                  </text>
                ))}
                <text x={AREA_X + 52} y={y + 82} className="vx-map-src">{area.appliedIn}</text>

                {/* area → skills connector */}
                <path d={`M ${AREA_X + AREA_W} ${y + AREA_H / 2} L ${SKILL_X} ${y + AREA_H / 2}`} className={on ? "vx-map-wire is-on" : "vx-map-wire"} />

                {/* the skills themselves */}
                <rect x={SKILL_X} y={y} width={SKILL_W} height={AREA_H} rx={9} className={on ? "vx-map-panel is-on" : "vx-map-panel"} />
                {area.skills.map((skill, skillIndex) => {
                  const sx = SKILL_X + 22;
                  const sy = y + 24 + skillIndex * 18;
                  return (
                    <g key={skill}>
                      <circle cx={sx + 3} cy={sy - 4} r={3} className={on ? "vx-map-dot is-on" : "vx-map-dot"} />
                      <text x={sx + 16} y={sy} className={on ? "vx-map-skill is-on" : "vx-map-skill"}>{skill}</text>
                    </g>
                  );
                })}
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
