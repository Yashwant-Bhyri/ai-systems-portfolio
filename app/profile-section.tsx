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
    short: "runtime · reliability",
    reasoning: [
      "the runtime around the model is where my depth is",
      "I built and ran a dual-lane multi-agent orchestration engine",
      "evaluation, tracing and guardrails designed in — not bolted on",
      "latency and token budgets treated as engineering, not afterthoughts",
      "model routing and failover under a real production load",
    ],
  },
  {
    id: "agents",
    lines: ["AI Agent &", "Application Developer"],
    short: "agents as products",
    reasoning: [
      "every agent system I built shipped with a real product surface on it",
      "orchestration graphs, reasoning agents and tool calling in production",
      "grounded in retrieval and memory so the agent stays honest",
      "human-in-the-loop approval wherever the stakes justify it",
      "a live voice interview room, an editor timeline, a clinician workflow",
    ],
  },
  {
    id: "full-stack",
    lines: ["Full-Stack", "AI / ML Engineer"],
    short: "data to deployment",
    reasoning: [
      "I carry the path from data and models through to deployment",
      "distillation, quantization and evaluation on the model side",
      "backend services, APIs and workflow management on the product side",
      "retrieval and recommendation systems built end to end",
      "cloud deployment with CI/CD, monitoring and cost control",
    ],
  },
] as const;

type Area = {
  id: string;
  label: readonly [string, string];
  /** The curated, concrete skills this engineering area actually covers. */
  skills: readonly string[];
  /** Supplementary only: where these were built. Never the headline. */
  learnedIn: string;
  /** Which target roles call on this area. */
  roles: readonly [boolean, boolean, boolean];
};

const AREAS: readonly Area[] = [
  {
    id: "application",
    label: ["AI application &", "product engineering"],
    skills: [
      "API integrations & management",
      "full-stack AI application delivery",
      "workflow management systems",
      "structured JSON & schema contracts",
      "product & UX research",
    ],
    learnedIn: "Filmora · Lalamove",
    roles: [false, true, true],
  },
  {
    id: "runtime",
    label: ["Agent runtime &", "orchestration"],
    skills: [
      "multi-agent orchestration graphs",
      "reasoning agents",
      "function calling & tool use",
      "agent hand-offs & state machines",
      "real-time voice agent runtime",
    ],
    learnedIn: "Antigravity · Filmora",
    roles: [true, true, false],
  },
  {
    id: "knowledge",
    label: ["Knowledge, memory", "& retrieval"],
    skills: [
      "vector search & embeddings",
      "hybrid retrieval & reranking",
      "recommendation systems",
      "long-term agent memory",
      "data & knowledge pipelines",
    ],
    learnedIn: "MindScape · Filmora",
    roles: [true, true, true],
  },
  {
    id: "control",
    label: ["Evaluation, safety", "& observability"],
    skills: [
      "agent & LLM evaluation harnesses",
      "guardrails & policy control",
      "human-in-the-loop workflows",
      "RL-style observability & refinement",
      "OpenTelemetry tracing",
    ],
    learnedIn: "Antigravity · SLM distillation",
    roles: [true, true, true],
  },
  {
    id: "platform",
    label: ["Inference platform", "& production systems"],
    skills: [
      "model routing intelligence",
      "LLM gateways",
      "latency & token optimization",
      "quantization & distillation",
      "cloud deployment & CI/CD",
    ],
    learnedIn: "Optek · Antigravity",
    roles: [true, false, true],
  },
] as const;

const ROLE_ADVANCE_MS = 10400;

/* --- map geometry (viewBox 1320 × 470) --- */
const ROLE_X = 8;
const ROLE_W = 220;
const ROLE_H = 94;
const ROLE_Y = [92, 198, 304];
const AREA_X = 350;
const AREA_W = 280;
const AREA_H = 80;
const AREA_Y = [30, 118, 206, 294, 382];
const SKILL_X = 650;
const SKILL_W = 662;

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
      <header className="vx-profile-head">
        <div>
          <span className="vx-lens-label">What I&apos;m built for</span>
          <h2>Three target roles, and the engineering areas and skills behind each one.</h2>
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
          viewBox="0 0 1320 470"
          className="op-svg"
          role="tablist"
          aria-label="Target roles mapped to engineering areas and skills"
          tabIndex={0}
          onKeyDown={handleRoleKeys}
        >
          <text x={ROLE_X} y={16} className="vx-map-col">TARGET ROLE</text>
          <text x={AREA_X} y={16} className="vx-map-col">ENGINEERING AREAS</text>
          <text x={SKILL_X} y={16} className="vx-map-col">THE SKILLS EACH AREA COVERS</text>

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
              <g key={area.id} data-on={on}>
                {/* engineering area */}
                <rect x={AREA_X} y={y} width={AREA_W} height={AREA_H} rx={9} className={on ? "vx-map-box is-on" : "vx-map-box"} />
                {area.label.map((line, lineIndex) => (
                  <text
                    key={line}
                    x={AREA_X + 16}
                    y={y + 28 + lineIndex * 19}
                    className={on ? "vx-map-area is-on" : "vx-map-area"}
                  >
                    {line}
                  </text>
                ))}
                <text x={AREA_X + 16} y={y + 68} className="vx-map-src">{area.learnedIn}</text>

                {/* area → skills connector */}
                <path d={`M ${AREA_X + AREA_W} ${y + AREA_H / 2} L ${SKILL_X} ${y + AREA_H / 2}`} className={on ? "vx-map-wire is-on" : "vx-map-wire"} />

                {/* the skills themselves */}
                <rect x={SKILL_X} y={y} width={SKILL_W} height={AREA_H} rx={9} className={on ? "vx-map-panel is-on" : "vx-map-panel"} />
                {area.skills.map((skill, skillIndex) => (
                  <text
                    key={skill}
                    x={SKILL_X + 20 + Math.floor(skillIndex / 3) * 330}
                    y={y + 26 + (skillIndex % 3) * 21}
                    className={on ? "vx-map-skill is-on" : "vx-map-skill"}
                  >
                    {skill}
                  </text>
                ))}
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
