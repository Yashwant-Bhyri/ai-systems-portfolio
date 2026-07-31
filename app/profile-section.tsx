"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import "./live-scenes.css";

/** How heavily a target role draws on an engineering pillar. */
type Draw = 1 | 2 | 3;
type DrawByRole = readonly [Draw, Draw, Draw];

type TargetRole = {
  id: string;
  lines: readonly [string, string];
  short: string;
  /** Why this is a target role — always argued from the capabilities. */
  why: string;
};

const ROLES: readonly TargetRole[] = [
  {
    id: "systems",
    lines: ["AI Systems", "Engineer"],
    short: "runtime · reliability",
    why: "Agent runtime, evaluation and the inference platform are where most of my capabilities concentrate — so owning a production AI system end to end is the role that fits.",
  },
  {
    id: "agents",
    lines: ["AI Agent &", "Application Developer"],
    short: "agents as products",
    why: "My depth sits in agent orchestration, knowledge and the product surface — the role is turning that into agents people can actually use.",
  },
  {
    id: "full-stack",
    lines: ["Full-Stack", "AI / ML Engineer"],
    short: "data to deployment",
    why: "Knowledge and modeling, the inference platform and the application path are all covered — so I can carry an AI feature from data through to deployment.",
  },
] as const;

type Pillar = {
  id: string;
  label: string;
  /** Broad capability names, never narrowed to a single vendor or tool. */
  skills: readonly string[];
  draw: DrawByRole;
};

/** Five engineering pillars, twenty capabilities. This is the evidence for the
 *  role claim above it — the mapping IS the argument. */
const PILLARS: readonly Pillar[] = [
  {
    id: "application",
    label: "AI application & product engineering",
    skills: ["full-stack AI applications", "API & service design", "structured JSON contracts", "product & UX research"],
    draw: [1, 3, 2],
  },
  {
    id: "runtime",
    label: "Agent runtime & orchestration",
    skills: ["multi-agent orchestration", "agent graphs & hand-offs", "tool & function calling", "real-time voice runtime"],
    draw: [3, 3, 1],
  },
  {
    id: "knowledge",
    label: "Knowledge, memory & retrieval",
    skills: ["vector search & embeddings", "hybrid retrieval & reranking", "long-term agent memory", "data & knowledge pipelines"],
    draw: [2, 3, 3],
  },
  {
    id: "control",
    label: "Evaluation, safety & observability",
    skills: ["agent & LLM evaluation", "guardrails & policy control", "OpenTelemetry observability", "RL refinement frameworks"],
    draw: [3, 2, 3],
  },
  {
    id: "platform",
    label: "Inference platform & production systems",
    skills: ["model routing intelligence", "latency & token optimization", "quantization & distillation", "cloud deployment & CI/CD"],
    draw: [3, 1, 3],
  },
] as const;

const TOTAL_SKILLS = PILLARS.reduce((sum, pillar) => sum + pillar.skills.length, 0);
const ROLE_ADVANCE_MS = 9600;

/* --- map geometry (viewBox 1320 x 440) --- */
const ROLE_X = 14;
const ROLE_W = 290;
const ROLE_H = 94;
const ROLE_Y = [66, 186, 306];
const PILLAR_X = 560;
const PILLAR_W = 746;
const PILLAR_H = 76;
const PILLAR_Y = [28, 110, 192, 274, 356];
const EDGE_FROM = ROLE_X + ROLE_W;
const EDGE_TO = PILLAR_X;

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
  const mapRef = useRef<SVGSVGElement>(null);
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
  const drawn = PILLARS.reduce(
    (sum, pillar) => sum + (pillar.draw[activeRole] >= 2 ? pillar.skills.length : 0),
    0,
  );

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
          <h2>These are the roles I am targeting — and the capabilities that put me there.</h2>
        </div>
        <button
          type="button"
          className="vx-map-pause"
          aria-pressed={!autoplaying}
          disabled={reducedMotion}
          onClick={() => setPlaying((value) => !value)}
        >
          <i data-playing={autoplaying} aria-hidden="true" />
          {reducedMotion ? "Static view" : autoplaying ? "Pause" : "Resume"}
        </button>
      </header>

      {/* The argument, stated before the map demonstrates it. */}
      <div className="vx-role-why" key={role.id}>
        <span className="vx-lens-label">Why this role</span>
        <p>{role.why}</p>
        <strong>{drawn}<i>/{TOTAL_SKILLS}</i><small>capabilities drawn on</small></strong>
      </div>

      <div className="vx-role-map" data-motion-paused={!autoplaying}>
        <svg
          ref={mapRef}
          viewBox="0 0 1320 440"
          className="op-svg"
          role="tablist"
          aria-label="Target roles mapped to engineering pillars"
          tabIndex={0}
          onKeyDown={handleRoleKeys}
        >
          <text x={ROLE_X} y={18} className="lv-phase small">TARGET ROLES</text>
          <text x={PILLAR_X} y={18} className="lv-phase small">
            FIVE ENGINEERING PILLARS · {TOTAL_SKILLS} CAPABILITIES
          </text>

          {/* Only the active role's edges are ever drawn — five lines, never fifteen. */}
          {PILLARS.map((pillar, pillarIndex) => {
            const weight = pillar.draw[activeRole];
            const roleCy = ROLE_Y[activeRole] + ROLE_H / 2;
            const pillarCy = PILLAR_Y[pillarIndex] + PILLAR_H / 2;
            const path = `M ${EDGE_FROM} ${roleCy} C ${EDGE_FROM + 82} ${roleCy}, ${EDGE_TO - 82} ${pillarCy}, ${EDGE_TO} ${pillarCy}`;
            return (
              <g key={pillar.id}>
                <path
                  d={path}
                  className={weight === 3 ? "lv-edge win" : "lv-edge"}
                  style={{ strokeWidth: 0.9 + weight * 0.85, opacity: 0.28 + weight * 0.24 }}
                />
                {weight >= 2 && !reducedMotion ? (
                  <circle
                    r={weight === 3 ? 4.2 : 3.2}
                    className="lv-pulse vx-map-pulse"
                    style={{ offsetPath: `path("${path}")`, animationDelay: `${-pillarIndex * 0.36}s` } as CSSProperties}
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
                <g className={`lv-node ${active ? "is-live" : ""}`}>
                  <rect x={ROLE_X} y={y} width={ROLE_W} height={ROLE_H} rx={10} style={{ opacity: active ? 1 : 0.5 }} />
                </g>
                <rect
                  x={ROLE_X}
                  y={y}
                  width={3}
                  height={ROLE_H}
                  className="lv-bar"
                  style={{ opacity: active ? 1 : 0.15 }}
                />
                <text x={ROLE_X + 18} y={y + 24} className="svg-sub" style={{ opacity: active ? 1 : 0.55 }}>
                  {String(index + 1).padStart(2, "0")}
                </text>
                {item.lines.map((line, lineIndex) => (
                  <text
                    key={line}
                    x={ROLE_X + 18}
                    y={y + 48 + lineIndex * 20}
                    className="svg-label"
                    style={{ fontSize: 17, opacity: active ? 1 : 0.5 }}
                  >
                    {line}
                  </text>
                ))}
                <text x={ROLE_X + 18} y={y + 84} className="svg-sub tiny" style={{ opacity: active ? 0.9 : 0.4 }}>
                  {item.short}
                </text>
              </g>
            );
          })}

          {PILLARS.map((pillar, pillarIndex) => {
            const weight = pillar.draw[activeRole];
            const y = PILLAR_Y[pillarIndex];
            return (
              <g key={pillar.id}>
                <g className={`lv-node ${weight === 3 ? "is-live" : ""}`}>
                  <rect x={PILLAR_X} y={y} width={PILLAR_W} height={PILLAR_H} rx={10} style={{ opacity: weight === 1 ? 0.62 : 1 }} />
                </g>
                <text x={PILLAR_X + 18} y={y + 26} className="svg-label" style={{ fontSize: 15, opacity: weight === 1 ? 0.68 : 1 }}>
                  {pillar.label}
                </text>
                {/* Degree of responsibility this role places on the pillar. */}
                {[0, 1, 2].map((segment) => (
                  <rect
                    key={segment}
                    x={PILLAR_X + PILLAR_W - 62 + segment * 16}
                    y={y + 15}
                    width={11}
                    height={5}
                    rx={2.5}
                    className={segment < weight ? "lv-bar" : "lv-bar bg"}
                    style={{ opacity: segment < weight ? 1 : 0.3 }}
                  />
                ))}
                {pillar.skills.map((skill, skillIndex) => (
                  <text
                    key={skill}
                    x={PILLAR_X + 18 + (skillIndex % 2) * 372}
                    y={y + 48 + Math.floor(skillIndex / 2) * 18}
                    className="svg-mono tinytext"
                    style={{ fontSize: 12.5, opacity: weight === 1 ? 0.5 : weight === 2 ? 0.8 : 1 }}
                  >
                    {skill}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      <output style={SR_ONLY_STYLE} aria-live="polite">
        {role.lines.join(" ")}: draws on {drawn} of {TOTAL_SKILLS} capabilities.
      </output>
    </section>
  );
}
