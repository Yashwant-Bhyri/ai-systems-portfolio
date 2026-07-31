"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";

type Heat = readonly [0 | 1 | 2 | 3, 0 | 1 | 2 | 3, 0 | 1 | 2 | 3];
type RoleId = "systems" | "agents" | "full-stack";

type RoleLens = {
  id: RoleId;
  title: string;
  short: string;
  fit: string;
  priorities: readonly [string, string, string];
};

const ROLES: readonly RoleLens[] = [
  {
    id: "systems",
    title: "AI Systems Engineer",
    short: "Systems architecture",
    fit: "I build the runtime around the model: orchestration, memory, evaluation, routing, latency, and release controls.",
    priorities: ["Design the system", "Control the runtime", "Measure production behavior"],
  },
  {
    id: "agents",
    title: "AI Agent & Application Developer",
    short: "Agents + applications",
    fit: "I turn model capability into a usable product through agent graphs, function calls, voice interaction, memory, and validation.",
    priorities: ["Plan agent behavior", "Connect tools and memory", "Ship the interaction"],
  },
  {
    id: "full-stack",
    title: "Full-Stack AI / ML Engineer",
    short: "Product to deployment",
    fit: "I connect interface, API, model runtime, evaluation, optimization, and deployment as one observable product system.",
    priorities: ["Own the product path", "Integrate model services", "Deploy and optimize"],
  },
] as const;

type Skill = {
  id: string;
  label: string;
  domain: "agents" | "retrieval" | "reliability" | "performance" | "delivery";
  heat: Heat;
};

const SKILLS: readonly Skill[] = [
  { id: "agent-engineering", label: "Agent engineering + orchestration", domain: "agents", heat: [3, 3, 2] },
  { id: "function-calling", label: "Function calling", domain: "agents", heat: [2, 3, 2] },
  { id: "voice-agents", label: "Voice agents", domain: "agents", heat: [2, 3, 2] },
  { id: "prompt-tuning", label: "Prompt tuning", domain: "agents", heat: [1, 3, 2] },
  { id: "vector-retrieval", label: "Vector retrieval + embeddings", domain: "retrieval", heat: [2, 3, 3] },
  { id: "reranking", label: "Reranking + retrieval", domain: "retrieval", heat: [2, 3, 2] },
  { id: "memory", label: "Long-term + working memory", domain: "retrieval", heat: [3, 3, 2] },
  { id: "loop-harness", label: "Loop / harness engineering", domain: "reliability", heat: [3, 2, 2] },
  { id: "evaluations", label: "LLM + agent evaluations", domain: "reliability", heat: [3, 2, 3] },
  { id: "guardrails", label: "Guardrails + security", domain: "reliability", heat: [3, 3, 2] },
  { id: "validation", label: "Validation engines", domain: "reliability", heat: [2, 3, 2] },
  { id: "observability", label: "Observability", domain: "reliability", heat: [3, 2, 3] },
  { id: "token-optimization", label: "Token optimization", domain: "performance", heat: [2, 2, 3] },
  { id: "latency", label: "Latency engineering", domain: "performance", heat: [3, 2, 3] },
  { id: "runtime-optimization", label: "Runtime optimization", domain: "performance", heat: [3, 2, 3] },
  { id: "model-routing", label: "LLM gateways + model routing intelligence", domain: "performance", heat: [3, 3, 3] },
  { id: "deployment", label: "Deployment + Kubernetes", domain: "delivery", heat: [3, 1, 3] },
  { id: "apis", label: "APIs", domain: "delivery", heat: [2, 2, 3] },
  { id: "ux-research", label: "UI / UX research", domain: "delivery", heat: [1, 2, 3] },
  { id: "product-research", label: "Product research", domain: "delivery", heat: [1, 2, 3] },
] as const;

type CapabilityDomain = {
  id: Skill["domain"];
  label: string;
  description: string;
  heat: Heat;
};

const CAPABILITY_DOMAINS: readonly CapabilityDomain[] = [
  { id: "agents", label: "Agent runtime", description: "Agents, tools, voice, prompts", heat: [3, 3, 2] },
  { id: "retrieval", label: "Retrieval + memory", description: "Context that stays useful", heat: [3, 3, 2] },
  { id: "reliability", label: "Evaluation + control", description: "Evaluation, safety, traces", heat: [3, 3, 3] },
  { id: "performance", label: "Performance + routing", description: "Tokens, latency, gateways", heat: [3, 2, 3] },
  { id: "delivery", label: "Delivery + product", description: "APIs, deployment, product", heat: [2, 2, 3] },
] as const;

type Evidence = {
  id: string;
  role: RoleId;
  source: string;
  title: string;
  proof: string;
  domains: readonly Skill["domain"][];
};

const EVIDENCE: readonly Evidence[] = [
  {
    id: "systems-voice-runtime",
    role: "systems",
    source: "ANTI-GRAVITY · PRODUCTION SOFTWARE",
    title: "Voice-native decision runtime",
    proof: "Built dual-lane multi-agent interview orchestration with adaptive routing, prepared-audio fallback, agent evaluation, and evidence-linked recruiter output.",
    domains: ["agents", "reliability", "performance"],
  },
  {
    id: "systems-production-graph",
    role: "systems",
    source: "FILMORA · AI ENGINEERING INTERNSHIP",
    title: "Observable multimodal production graph",
    proof: "Integrated market research, product intelligence, retrieval, function calls, specialist media agents, guardrails, cost controls, and human approval into Filmora Enterprise.",
    domains: ["retrieval", "reliability", "performance"],
  },
  {
    id: "systems-clinical-control",
    role: "systems",
    source: "MEDICAL AI · R&D PROJECT",
    title: "Grounded clinician-review pipeline",
    proof: "Designed hybrid clinical retrieval, evidence validation, clinician-controlled review, observability, and an offline RL refinement and release loop.",
    domains: ["retrieval", "reliability", "delivery"],
  },
  {
    id: "agents-question-graph",
    role: "agents",
    source: "ANTI-GRAVITY · PRODUCTION SOFTWARE",
    title: "Adaptive interview agent graph",
    proof: "The live agent interprets answers, fires specialist analysis, updates the future question map, and responds through a real-time voice channel.",
    domains: ["agents", "retrieval", "performance"],
  },
  {
    id: "agents-media-tools",
    role: "agents",
    source: "FILMORA · AI ENGINEERING INTERNSHIP",
    title: "Multimodal tool orchestration",
    proof: "Compiled brief and research context into typed tool contracts for video, audio, dialogue, captions, effects, and an editable Filmora timeline.",
    domains: ["agents", "retrieval", "delivery"],
  },
  {
    id: "agents-grounded-memory",
    role: "agents",
    source: "MEDICAL AI · R&D PROJECT",
    title: "Memory, retrieval, and validation loop",
    proof: "Linked longitudinal session memory to clinical retrieval, grounded reasoning, independent validation, and a clinician-owned review surface.",
    domains: ["retrieval", "reliability", "agents"],
  },
  {
    id: "fullstack-edge-browser",
    role: "full-stack",
    source: "EMBEDDED + BROWSER-NATIVE PERCEPTION R&D",
    title: "Model delivery across edge and browser runtimes",
    proof: "Worked with TFLM INT8 inference, SAM segmentation, quantized depth, GPU texture contracts, latency profiling, and deployable APIs.",
    domains: ["performance", "delivery"],
  },
  {
    id: "fullstack-evaluation",
    role: "full-stack",
    source: "BIRD-SQL + SLM RESEARCH",
    title: "Execution-grounded model evaluation",
    proof: "Built evaluation workflows around schema-aware text-to-SQL execution, failure diagnosis, distillation quality, factuality, and smaller-model tradeoffs.",
    domains: ["reliability", "performance", "delivery"],
  },
  {
    id: "fullstack-controlled-generation",
    role: "full-stack",
    source: "COL-VEO + LOGISTICS R&D",
    title: "Controlled generation and operational APIs",
    proof: "Connected prompt steering, seed-aware regeneration, lifecycle gates, role-based operations, data services, and observable runtime behavior.",
    domains: ["agents", "performance", "delivery"],
  },
] as const;

const ROLE_ADVANCE_MS = 9600;
const DOMAIN_ADVANCE_MS = 1800;

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
  const [activeDomain, setActiveDomain] = useState(0);
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
      setActiveDomain((value) => (value + 1) % CAPABILITY_DOMAINS.length);
    }, DOMAIN_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [playing, reducedMotion, visible]);

  useEffect(() => {
    if (!visible || !playing || reducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveRole((value) => (value + 1) % ROLES.length);
      setActiveDomain(0);
    }, ROLE_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [playing, reducedMotion, visible]);

  const role = ROLES[activeRole];
  const roleEvidence = EVIDENCE.filter((item) => item.role === role.id);
  const strongSkillCount = SKILLS.filter((skill) => skill.heat[activeRole] >= 2).length;
  const autoplaying = playing && !reducedMotion;

  function selectRole(index: number) {
    setActiveRole(index);
    setActiveDomain(0);
  }

  function replay() {
    setActiveRole(0);
    setActiveDomain(0);
    setPlaying(true);
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
      <header className="vx-profile-map-header">
        <div>
          <h2>What I&apos;m built for.</h2>
          <p>Choose a role. The capability system and build evidence recompose around it.</p>
        </div>
        <div className="vx-profile-map-controls" aria-label="Role lens playback">
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
          <button type="button" className="vx-map-replay" onClick={replay}>Replay roles</button>
        </div>
      </header>

      <div className="vx-role-lens-layout">
        <nav className="vx-role-lens-rail" aria-label="Target roles">
          <span className="vx-lens-label">Target role</span>
          <div
            ref={roleRailRef}
            className="vx-role-lens-tabs"
            role="tablist"
            aria-orientation="vertical"
            onKeyDown={handleRoleKeys}
          >
            {ROLES.map((item, index) => (
              <button
                key={item.id}
                id={`vx-role-lens-${item.id}`}
                type="button"
                role="tab"
                aria-selected={index === activeRole}
                aria-controls="vx-capability-board"
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
          <div className="vx-role-fit">
            <span>Why I fit</span>
            <strong>{role.fit}</strong>
            <ol>
              {role.priorities.map((priority) => <li key={priority}>{priority}</li>)}
            </ol>
          </div>
        </nav>

        <section
          id="vx-capability-board"
          className="vx-capability-board"
          role="tabpanel"
          aria-labelledby={`vx-role-lens-${role.id}`}
        >
          <header>
            <span>Capability system · 20 production skills</span>
            <strong>{role.title}</strong>
            <small>{strongSkillCount} high-relevance signals</small>
          </header>
          <div className="vx-capability-domains">
            {CAPABILITY_DOMAINS.map((domain, domainIndex) => {
              const strength = domain.heat[activeRole];
              const active = domainIndex === activeDomain;
              const skills = SKILLS.filter((skill) => skill.domain === domain.id);
              return (
                <article
                  key={domain.id}
                  data-active={active}
                  data-strength={strength}
                  style={{ "--domain-strength": strength / 3 } as CSSProperties}
                >
                  <div className="vx-domain-axis">
                    <i aria-hidden="true" />
                    <span>{String(domainIndex + 1).padStart(2, "0")}</span>
                    <strong>{domain.label}</strong>
                    <small>{domain.description}</small>
                  </div>
                  <ul aria-label={`${domain.label} skills for ${role.title}`}>
                    {skills.map((skill) => {
                      const skillStrength = skill.heat[activeRole];
                      return (
                        <li
                          key={skill.id}
                          data-strength={skillStrength}
                          aria-label={`${skill.label}, relevance ${skillStrength} of 3`}
                        >
                          <i aria-hidden="true" />
                          <span>{skill.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <i className="vx-domain-scan" data-playing={active && autoplaying} aria-hidden="true" />
                </article>
              );
            })}
          </div>
        </section>

        <aside className="vx-applied-evidence" aria-label={`Applied evidence for ${role.title}`}>
          <header>
            <span>Applied evidence</span>
            <strong>What I have actually built</strong>
          </header>
          <div>
            {roleEvidence.map((item, index) => {
              const active = item.domains.includes(CAPABILITY_DOMAINS[activeDomain].id);
              return (
                <article key={item.id} data-active={active}>
                  <small>{item.source}</small>
                  <strong>{item.title}</strong>
                  <p>{item.proof}</p>
                  <div>
                    {item.domains.map((domain) => (
                      <span key={domain}>{CAPABILITY_DOMAINS.find((itemDomain) => itemDomain.id === domain)?.label}</span>
                    ))}
                  </div>
                  <i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>
                </article>
              );
            })}
          </div>
        </aside>
      </div>

      <output style={SR_ONLY_STYLE} aria-live="polite">
        {role.title}. {strongSkillCount} high-relevance capabilities and three applied build records shown.
      </output>
    </section>
  );
}
