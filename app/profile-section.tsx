"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";

/** Which of the three target roles a capability is called on for. */
type RoleFit = readonly [boolean, boolean, boolean];
type RoleId = "systems" | "agents" | "full-stack";

type RoleLens = {
  id: RoleId;
  title: string;
  short: string;
  /** What the role asks for — stated as the role, not as me. */
  asks: string;
  /** How I hold it. */
  holds: string;
};

const ROLES: readonly RoleLens[] = [
  {
    id: "systems",
    title: "AI Systems Engineer",
    short: "Runtime + reliability",
    asks: "Owning the runtime around the model: orchestration, state, retrieval, evaluation, and the latency and release control that keeps it dependable.",
    holds: "I built and ran exactly this loop end to end — a dual-lane multi-agent runtime with guardrails, tracing, and an offline refinement cycle.",
  },
  {
    id: "agents",
    title: "AI Agent & Application Developer",
    short: "Agents as products",
    asks: "Turning model capability into a product people can use: agent graphs, tool and function calling, real-time interaction, grounded memory, and validation.",
    holds: "Every agent system I shipped had a real surface on it — a live voice interview room, an editor timeline, a clinician review workflow.",
  },
  {
    id: "full-stack",
    title: "Full-Stack AI / ML Engineer",
    short: "Data to deployment",
    asks: "Carrying the whole path: data and models, the backend services and APIs that serve them, and deployment with monitoring and cost control.",
    holds: "I have worked at both ends — distillation and quantization on one side, role-based backends and cloud deployment on the other.",
  },
] as const;

type Capability = {
  id: string;
  label: string;
  fit: RoleFit;
};

type CapabilityArea = {
  id: string;
  label: string;
  /** Light attribution — where the area was built or learned. Never the headline. */
  learnedIn: string;
  skills: readonly Capability[];
};

/** Twenty capabilities across five areas. This is the claim the section makes;
 *  the projects underneath it are attribution, not the subject. */
const AREAS: readonly CapabilityArea[] = [
  {
    id: "agents",
    label: "Agentic systems & orchestration",
    learnedIn: "Antigravity · Filmora",
    skills: [
      { id: "multi-agent", label: "multi-agent orchestration", fit: [true, true, true] },
      { id: "decision-engines", label: "decision engines & agent graphs", fit: [true, true, false] },
      { id: "tool-calling", label: "tool & function calling", fit: [true, true, true] },
      { id: "voice-agents", label: "real-time voice agents", fit: [true, true, false] },
    ],
  },
  {
    id: "retrieval",
    label: "Memory, retrieval & data engineering",
    learnedIn: "MindScape · Filmora",
    skills: [
      { id: "vector-search", label: "vector search & embeddings", fit: [true, true, true] },
      { id: "reranking", label: "hybrid retrieval & reranking", fit: [true, true, true] },
      { id: "memory", label: "long-term & agent memory", fit: [true, true, false] },
      { id: "pipelines", label: "data pipelines & ETL", fit: [true, false, true] },
    ],
  },
  {
    id: "reliability",
    label: "Evaluation, guardrails & observability",
    learnedIn: "Antigravity · SLM distillation",
    skills: [
      { id: "evaluation", label: "LLM & agent evaluation", fit: [true, true, true] },
      { id: "guardrails", label: "guardrails & policy gates", fit: [true, true, false] },
      { id: "tracing", label: "tracing & observability", fit: [true, false, true] },
      { id: "rl-refinement", label: "RL-style refinement", fit: [true, false, true] },
    ],
  },
  {
    id: "performance",
    label: "Performance, routing & optimization",
    learnedIn: "Optek · Antigravity",
    skills: [
      { id: "latency", label: "latency & token budgets", fit: [true, true, true] },
      { id: "routing", label: "LLM gateways & model routing", fit: [true, true, true] },
      { id: "quantization", label: "quantization & distillation", fit: [true, false, true] },
      { id: "inference", label: "inference optimization", fit: [true, false, true] },
    ],
  },
  {
    id: "delivery",
    label: "Full-stack delivery, cloud & product",
    learnedIn: "Lalamove · webGLR",
    skills: [
      { id: "backend", label: "backend services & APIs", fit: [true, true, true] },
      { id: "cloud", label: "cloud deployment · Docker · K8s · CI/CD", fit: [true, false, true] },
      { id: "interfaces", label: "full-stack product interfaces", fit: [false, true, true] },
      { id: "product", label: "product & UX research", fit: [false, true, true] },
    ],
  },
] as const;

const ALL_SKILLS = AREAS.flatMap((area) => area.skills);

const ROLE_ADVANCE_MS = 9600;
const AREA_SPOTLIGHT_MS = 2400;

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
  const roleRailRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeRole, setActiveRole] = useState(0);
  const [spotlight, setSpotlight] = useState(0);
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

  useEffect(() => {
    if (!visible || !playing || reducedMotion) return;
    const timer = window.setInterval(() => {
      setSpotlight((value) => (value + 1) % AREAS.length);
    }, AREA_SPOTLIGHT_MS);
    return () => window.clearInterval(timer);
  }, [playing, reducedMotion, visible]);

  useEffect(() => {
    if (!visible || !playing || reducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveRole((value) => (value + 1) % ROLES.length);
      setSpotlight(0);
    }, ROLE_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [playing, reducedMotion, visible]);

  const role = ROLES[activeRole];
  const covered = ALL_SKILLS.filter((skill) => skill.fit[activeRole]).length;
  const autoplaying = playing && !reducedMotion;

  function selectRole(index: number) {
    setActiveRole(index);
    setSpotlight(0);
  }

  function handleRoleKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let next = activeRole;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = ROLES.length - 1;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (activeRole + 1) % ROLES.length;
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (activeRole - 1 + ROLES.length) % ROLES.length;
    selectRole(next);
    roleRailRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
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
        <div className="vx-profile-head-copy">
          <span className="vx-lens-label">What I&apos;m built for</span>
          <h2>Twenty capabilities across five areas.</h2>
          <p className="vx-profile-sub">These are the three roles that sit inside them.</p>
        </div>
        <div className="vx-profile-roles">
          <div ref={roleRailRef} className="vx-role-tabs" role="tablist" onKeyDown={handleRoleKeys}>
            {ROLES.map((item, index) => (
              <button
                key={item.id}
                id={`vx-role-lens-${item.id}`}
                type="button"
                role="tab"
                aria-selected={index === activeRole}
                aria-controls="vx-capability-surface"
                tabIndex={index === activeRole ? 0 : -1}
                data-active={index === activeRole}
                data-playing={index === activeRole && autoplaying}
                onClick={() => selectRole(index)}
              >
                <small>{String(index + 1).padStart(2, "0")}</small>
                <strong>{item.title}</strong>
                <span>{item.short}</span>
                <i aria-hidden="true" />
              </button>
            ))}
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
        </div>
      </header>

      {/* The link: what the role asks for, and how I hold it. */}
      <div className="vx-role-brief" key={role.id}>
        <div>
          <span className="vx-lens-label">The role asks for</span>
          <p>{role.asks}</p>
        </div>
        <div>
          <span className="vx-lens-label">How I hold it</span>
          <p>{role.holds}</p>
        </div>
        <div className="vx-role-coverage">
          <strong>{covered}<i>/{ALL_SKILLS.length}</i></strong>
          <small>capabilities this role calls on</small>
        </div>
      </div>

      <div
        id="vx-capability-surface"
        className="vx-capability-surface"
        role="tabpanel"
        aria-labelledby={`vx-role-lens-${role.id}`}
      >
        {AREAS.map((area, index) => {
          const used = area.skills.filter((skill) => skill.fit[activeRole]).length;
          return (
            <article key={area.id} data-spotlit={index === spotlight}>
              <div className="vx-area-head">
                <i>{String(index + 1).padStart(2, "0")}</i>
                <strong>{area.label}</strong>
                <b>{used}/{area.skills.length}</b>
              </div>
              {/* The skills are the subject of this section — biggest type here. */}
              <p className="vx-area-skills">
                {area.skills.map((skill, skillIndex) => (
                  <span key={skill.id} data-on={skill.fit[activeRole]}>
                    {skillIndex > 0 ? <i aria-hidden="true"> · </i> : null}
                    {skill.label}
                  </span>
                ))}
              </p>
              <small className="vx-area-source">{area.learnedIn}</small>
            </article>
          );
        })}
      </div>

      <output style={SR_ONLY_STYLE} aria-live="polite">
        {role.title}: {covered} of {ALL_SKILLS.length} capabilities apply.
      </output>
    </section>
  );
}
