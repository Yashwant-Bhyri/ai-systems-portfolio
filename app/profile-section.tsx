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
  priorities: readonly string[];
};

const ROLES: readonly RoleLens[] = [
  {
    id: "systems",
    title: "AI Systems Engineer",
    short: "Systems architecture",
    fit: "I build the production runtime around the model — multi-agent orchestration, state and memory, retrieval infrastructure, evaluation harnesses, model routing, and latency budgets — and I keep it observable and controllable once it is live.",
    priorities: [
      "Architect multi-agent runtimes and decision engines",
      "Own state, memory, and retrieval infrastructure",
      "Instrument evaluation, tracing, and RL-style refinement",
      "Engineer latency, token cost, and failover budgets",
    ],
  },
  {
    id: "agents",
    title: "AI Agent & Application Developer",
    short: "Agents + applications",
    fit: "I turn model capability into a product people actually use — agent graphs, tool and function calling, real-time voice loops, grounded memory, and validation gates, wrapped in an interface that makes the system's reasoning legible.",
    priorities: [
      "Design agent graphs, tool contracts, and hand-offs",
      "Ship real-time voice and streaming interaction loops",
      "Ground behavior in retrieval, memory, and guardrails",
      "Build the product surface around the agent",
    ],
  },
  {
    id: "full-stack",
    title: "Full-Stack AI / ML Engineer",
    short: "Data to deployment",
    fit: "I carry a system end to end — data modeling and pipelines, ML, retrieval and recommendation prototypes, the backend services and APIs that serve them, then cloud deployment with CI/CD, monitoring, and cost control.",
    priorities: [
      "Model data, build pipelines, train and distill models",
      "Prototype ML, retrieval, and recommendation systems",
      "Engineer backend services, APIs, and data layers",
      "Deploy to cloud with CI/CD, monitoring, and cost control",
    ],
  },
] as const;

type Skill = {
  id: string;
  label: string;
  domain: "agents" | "retrieval" | "reliability" | "performance" | "delivery";
  heat: Heat;
};

const SKILLS: readonly Skill[] = [
  { id: "agent-orchestration", label: "Multi-agent orchestration + decision engines", domain: "agents", heat: [3, 3, 2] },
  { id: "function-calling", label: "Tool / function calling + structured outputs", domain: "agents", heat: [2, 3, 2] },
  { id: "voice-agents", label: "Real-time voice agents (sub-second loops)", domain: "agents", heat: [2, 3, 2] },
  { id: "context-engineering", label: "Prompt + context engineering", domain: "agents", heat: [2, 3, 2] },
  { id: "agent-state", label: "Agent state machines + async hand-offs", domain: "agents", heat: [3, 3, 2] },
  { id: "vector-infra", label: "Vector databases + embeddings (HNSW / FAISS)", domain: "retrieval", heat: [2, 3, 3] },
  { id: "hybrid-retrieval", label: "Hybrid retrieval + cross-encoder reranking", domain: "retrieval", heat: [2, 3, 3] },
  { id: "memory", label: "Long-term, working + longitudinal memory", domain: "retrieval", heat: [3, 3, 2] },
  { id: "rag", label: "RAG pipelines + knowledge grounding", domain: "retrieval", heat: [2, 3, 3] },
  { id: "data-engineering", label: "Data engineering + ETL pipelines", domain: "retrieval", heat: [2, 1, 3] },
  { id: "evaluations", label: "LLM + agent evaluation harnesses", domain: "reliability", heat: [3, 2, 3] },
  { id: "guardrails", label: "Guardrails, safety gates + policy control", domain: "reliability", heat: [3, 3, 2] },
  { id: "validation", label: "Validation engines (NLI · schema · rules)", domain: "reliability", heat: [2, 3, 2] },
  { id: "observability", label: "Distributed tracing + production observability", domain: "reliability", heat: [3, 2, 3] },
  { id: "rl-refinement", label: "RL-style refinement + regression replay", domain: "reliability", heat: [3, 2, 3] },
  { id: "latency", label: "Latency engineering + budget control", domain: "performance", heat: [3, 2, 3] },
  { id: "token-optimization", label: "Token cost + context-window optimization", domain: "performance", heat: [2, 2, 3] },
  { id: "model-routing", label: "LLM gateways + model routing intelligence", domain: "performance", heat: [3, 3, 3] },
  { id: "inference-optimization", label: "Inference optimization (quantization · distillation)", domain: "performance", heat: [3, 1, 3] },
  { id: "backend", label: "Backend services + API engineering", domain: "delivery", heat: [2, 2, 3] },
  { id: "cloud-deployment", label: "Cloud deployment (Docker · Kubernetes · CI/CD)", domain: "delivery", heat: [3, 1, 3] },
  { id: "ml-prototyping", label: "ML prototyping + recommendation systems", domain: "delivery", heat: [1, 2, 3] },
  { id: "full-stack-product", label: "Full-stack product interfaces", domain: "delivery", heat: [1, 2, 3] },
  { id: "product-research", label: "Product + UX research", domain: "delivery", heat: [1, 2, 3] },
] as const;

type CapabilityDomain = {
  id: Skill["domain"];
  label: string;
  description: string;
  heat: Heat;
};

const CAPABILITY_DOMAINS: readonly CapabilityDomain[] = [
  { id: "agents", label: "Agentic systems & orchestration", description: "Multi-agent runtimes, tools, realtime voice", heat: [3, 3, 2] },
  { id: "retrieval", label: "Memory, retrieval & data engineering", description: "Vector infrastructure, hybrid search, pipelines", heat: [3, 3, 3] },
  { id: "reliability", label: "Evaluation, guardrails & observability", description: "Evals, safety gates, tracing, RL refinement", heat: [3, 3, 3] },
  { id: "performance", label: "Performance, routing & optimization", description: "Latency, tokens, gateways, inference", heat: [3, 2, 3] },
  { id: "delivery", label: "Full-stack delivery, cloud & product", description: "Backend, APIs, cloud deployment, product", heat: [2, 2, 3] },
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
    proof: "Dual-lane multi-agent orchestration: adaptive routing, prepared-audio fallback, agent evaluation, and evidence-linked recruiter output.",
    domains: ["agents", "reliability", "performance"],
  },
  {
    id: "systems-production-graph",
    role: "systems",
    source: "FILMORA · AI ENGINEERING INTERNSHIP",
    title: "Observable multimodal production graph",
    proof: "Research, product intelligence, retrieval, function calling, media agents, guardrails, and human approval integrated into Filmora Enterprise.",
    domains: ["retrieval", "reliability", "performance"],
  },
  {
    id: "systems-clinical-control",
    role: "systems",
    source: "MEDICAL AI · R&D PROJECT",
    title: "Grounded clinician-review pipeline",
    proof: "Hybrid clinical retrieval, evidence validation, clinician-controlled review, and an offline RL refinement and release loop.",
    domains: ["retrieval", "reliability", "delivery"],
  },
  {
    id: "agents-question-graph",
    role: "agents",
    source: "ANTI-GRAVITY · PRODUCTION SOFTWARE",
    title: "Adaptive interview agent graph",
    proof: "Interprets answers live, fires specialist agents, updates the future question map, and responds over a real-time voice channel.",
    domains: ["agents", "retrieval", "performance"],
  },
  {
    id: "agents-media-tools",
    role: "agents",
    source: "FILMORA · AI ENGINEERING INTERNSHIP",
    title: "Multimodal tool orchestration",
    proof: "Brief and research context compile into typed tool contracts for video, audio, dialogue, captions, effects, and an editable timeline.",
    domains: ["agents", "retrieval", "delivery"],
  },
  {
    id: "agents-grounded-memory",
    role: "agents",
    source: "MEDICAL AI · R&D PROJECT",
    title: "Memory, retrieval, and validation loop",
    proof: "Longitudinal memory linked to clinical retrieval, grounded reasoning, independent validation, and a clinician-owned review surface.",
    domains: ["retrieval", "reliability", "agents"],
  },
  {
    id: "fullstack-edge-browser",
    role: "full-stack",
    source: "EMBEDDED + BROWSER-NATIVE PERCEPTION R&D",
    title: "Model delivery across edge and browser runtimes",
    proof: "TFLM INT8 inference, SAM segmentation, quantized depth, GPU texture contracts, latency profiling, and deployable APIs.",
    domains: ["performance", "delivery"],
  },
  {
    id: "fullstack-evaluation",
    role: "full-stack",
    source: "BIRD-SQL + SLM RESEARCH",
    title: "Execution-grounded model evaluation",
    proof: "Evaluation workflows for schema-aware text-to-SQL execution, failure diagnosis, distillation quality, and factuality tradeoffs.",
    domains: ["reliability", "performance", "delivery"],
  },
  {
    id: "fullstack-controlled-generation",
    role: "full-stack",
    source: "COL-VEO + LOGISTICS R&D",
    title: "Controlled generation and operational APIs",
    proof: "Prompt steering, seed-aware regeneration, lifecycle gates, role-based operations, and observable runtime behavior.",
    domains: ["agents", "performance", "delivery"],
  },
] as const;

const ROLE_ADVANCE_MS = 9600;
const DOMAIN_ADVANCE_MS = 2400;

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

type Wire = {
  d: string;
  kind: "role" | "evidence";
  strength: number;
  lit: boolean;
};

export function ProfileSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const roleRailRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const roleTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const domainRefs = useRef<Array<HTMLElement | null>>([]);
  const evidenceRefs = useRef<Array<HTMLElement | null>>([]);
  const [visible, setVisible] = useState(false);
  const [activeRole, setActiveRole] = useState(0);
  const [activeDomain, setActiveDomain] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [wires, setWires] = useState<Wire[]>([]);
  const [wireBox, setWireBox] = useState({ w: 0, h: 0 });

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

  // The storytelling layer: measure the real positions of the active role tab,
  // the five domain nodes, and the evidence cards, then draw bezier wires
  // between them. Role -> domain wire weight mirrors the domain's relevance to
  // the role; the currently lit domain wires onward into the evidence it powers.
  useEffect(() => {
    const compute = () => {
      const layout = layoutRef.current;
      const roleTab = roleTabRefs.current[activeRole];
      if (!layout || !roleTab) return;
      const box = layout.getBoundingClientRect();
      if (box.width < 700) {
        setWires([]);
        return;
      }
      const next: Wire[] = [];
      const tab = roleTab.getBoundingClientRect();
      const startX = tab.right - box.left;
      const startY = tab.top + tab.height / 2 - box.top;
      CAPABILITY_DOMAINS.forEach((domain, index) => {
        const node = domainRefs.current[index]?.getBoundingClientRect();
        if (!node) return;
        const endX = node.left - box.left;
        const endY = node.top + node.height / 2 - box.top;
        const bendX = startX + (endX - startX) * 0.55;
        next.push({
          d: `M ${startX.toFixed(1)} ${startY.toFixed(1)} C ${bendX.toFixed(1)} ${startY.toFixed(1)}, ${bendX.toFixed(1)} ${endY.toFixed(1)}, ${endX.toFixed(1)} ${endY.toFixed(1)}`,
          kind: "role",
          strength: domain.heat[activeRole],
          lit: index === activeDomain,
        });
      });
      const litDomain = domainRefs.current[activeDomain]?.getBoundingClientRect();
      if (litDomain) {
        const sX = litDomain.right - box.left;
        const sY = litDomain.top + litDomain.height / 2 - box.top;
        roleEvidence.forEach((item, index) => {
          if (!item.domains.includes(CAPABILITY_DOMAINS[activeDomain].id)) return;
          const card = evidenceRefs.current[index]?.getBoundingClientRect();
          if (!card) return;
          const eX = card.left - box.left;
          const eY = card.top + card.height / 2 - box.top;
          const bendX = sX + (eX - sX) * 0.55;
          next.push({
            d: `M ${sX.toFixed(1)} ${sY.toFixed(1)} C ${bendX.toFixed(1)} ${sY.toFixed(1)}, ${bendX.toFixed(1)} ${eY.toFixed(1)}, ${eX.toFixed(1)} ${eY.toFixed(1)}`,
            kind: "evidence",
            strength: 3,
            lit: true,
          });
        });
      }
      setWireBox({ w: box.width, h: box.height });
      setWires(next);
    };
    compute();
    const settle = window.setTimeout(compute, 420);
    window.addEventListener("resize", compute);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("resize", compute);
    };
  }, [activeRole, activeDomain, roleEvidence]);
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
          <p>Pick a target role — the skill system rewires live to show what powers it and what proves it.</p>
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

      <div ref={layoutRef} className="vx-role-lens-layout" data-wired="true">
        <svg
          className="vx-profile-wires"
          viewBox={`0 0 ${Math.max(1, wireBox.w)} ${Math.max(1, wireBox.h)}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {wires.map((wire, index) => (
            <path
              key={`${wire.kind}-${index}`}
              d={wire.d}
              data-kind={wire.kind}
              data-strength={wire.strength}
              data-lit={wire.lit}
            />
          ))}
        </svg>
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
                ref={(node) => {
                  roleTabRefs.current[index] = node;
                }}
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
            <span>Capability system · {SKILLS.length} production skills</span>
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
                  ref={(node) => {
                    domainRefs.current[domainIndex] = node;
                  }}
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
                <article
                  key={item.id}
                  ref={(node) => {
                    evidenceRefs.current[index] = node;
                  }}
                  data-active={active}
                >
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
