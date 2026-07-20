"use client";

/**
 * Operator Profile — the positioning layer (session-7 plan in the ledger).
 *
 * Three tiers, one narrative:
 *   ROLES   — what I'm aiming at (each card carries a domain-weight meter and
 *             evidence anchors into the proof chapters; no floating claims)
 *   DOMAINS — the five capability clusters behind every role — the SAME five
 *             clusters floating in the hero galaxy
 *   TRAY    — one curated line of elite expertise keywords, flaring gently
 *
 * Self-driving like the rest of the site: the spotlight tours the roles, the
 * lit domain advances on its own cadence, and everything stays clickable.
 */

import { useEffect, useRef, useState } from "react";

type Role = {
  n: string;
  title: string;
  line: string;
  /** weight per domain D1..D5: 0 quiet · 1 supporting · 2 core */
  weights: [number, number, number, number, number];
  evidence: { label: string; href: string }[];
};

const ROLES: Role[] = [
  {
    n: "01",
    title: "AI Systems Engineer",
    line: "Realtime runtimes, latency budgets, reliability under load.",
    weights: [2, 1, 2, 1, 2],
    evidence: [
      { label: "Antigravity", href: "#antigravity" },
      { label: "MindScape", href: "#mindscape" },
    ],
  },
  {
    n: "02",
    title: "AI Agent & Application Developer",
    line: "Enterprise agent orchestration, shipped as product surface.",
    weights: [2, 2, 1, 2, 1],
    evidence: [
      { label: "Antigravity", href: "#antigravity" },
      { label: "Filmora", href: "#filmora" },
    ],
  },
  {
    n: "03",
    title: "Full-Stack AI Engineer",
    line: "Model to interface — one owner, no hand-off gaps.",
    weights: [1, 2, 2, 2, 1],
    evidence: [
      { label: "MindScape", href: "#mindscape" },
      { label: "Research", href: "#research" },
    ],
  },
  {
    n: "04",
    title: "AI/ML Engineer",
    line: "Distillation, quantization, and evaluation discipline.",
    weights: [1, 2, 1, 1, 2],
    evidence: [{ label: "Research bench", href: "#research" }],
  },
];

type Domain = {
  name: string;
  kws: string[];
  proof: string;
  glyph: "net" | "vault" | "wave" | "ship" | "loop";
};

const DOMAINS: Domain[] = [
  {
    name: "Agentic Systems & Orchestration",
    kws: ["enterprise agent networks", "decision engines", "async state & hand-offs"],
    proof: "Antigravity dual-lane · Filmora DAG",
    glyph: "net",
  },
  {
    name: "Memory, Retrieval & Data Engineering",
    kws: ["robust memory pipelines", "hybrid retrieval + rerank", "vector infrastructure"],
    proof: "MindScape HNSW→RRF→rerank · Filmora memory",
    glyph: "vault",
  },
  {
    name: "Multimodal & Realtime AI",
    kws: ["voice AI · < 1 s loops", "vision AI", "streaming perception"],
    proof: "Antigravity voice loop · webGLR · MindScape affect",
    glyph: "wave",
  },
  {
    name: "Application, Product & Enterprise Integration",
    kws: ["full-stack AI products", "AI inside legacy enterprise software", "production deployment"],
    proof: "Filmora @ Wondershare · Logistics ops",
    glyph: "ship",
  },
  {
    name: "Evaluation, Observability & Optimization",
    kws: ["eval harnesses · RL-style feedback", "tracing · cost & latency optimization", "advanced prompt & context engineering"],
    proof: "Filmora −28% API cost · SLM distillation gate",
    glyph: "loop",
  },
];

const TRAY = [
  "LLMs",
  "enterprise agent networks",
  "memory & retrieval pipelines",
  "voice AI",
  "vision AI",
  "legacy-enterprise AI integration",
  "RL feedback loops",
  "prompt & context engineering",
];

const HEADING = "What I'm built for.";

function DomainGlyph({ kind, lit }: { kind: Domain["glyph"]; lit: boolean }) {
  const cls = `vx-domain-glyph ${lit ? "is-lit" : ""}`;
  if (kind === "net")
    return (
      <svg viewBox="0 0 44 44" className={cls}>
        {[[8, 10], [8, 34], [22, 22]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.6} className="mg-dot" />)}
        <path d="M 10 11 L 20 20 M 10 33 L 20 24 M 25 22 L 34 22" className="mg-edge" />
        <circle cx={36} cy={22} r={4} className="mg-core-ring" />
      </svg>
    );
  if (kind === "vault")
    return (
      <svg viewBox="0 0 44 44" className={cls}>
        <ellipse cx={22} cy={12} rx={12} ry={4.5} className="mg-window" />
        <path d="M 10 12 v 18 a 12 4.5 0 0 0 24 0 v -18" className="mg-window" />
        <path d="M 16 22 h 12 M 16 28 h 8" className="mg-lines lit" />
      </svg>
    );
  if (kind === "wave")
    return (
      <svg viewBox="0 0 44 44" className={cls}>
        {[10, 20, 30, 24, 14, 26, 16].map((h, i) => (
          <rect key={i} x={6 + i * 4.6} y={22 - h / 2} width={3} height={h} rx={1.5} className="mg-bar" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </svg>
    );
  if (kind === "ship")
    return (
      <svg viewBox="0 0 44 44" className={cls}>
        <rect x={6} y={10} width={22} height={24} rx={3} className="mg-window" />
        <path d="M 11 17 h 12 M 11 23 h 12 M 11 29 h 7" className="mg-lines" />
        <rect x={24} y={16} width={14} height={12} rx={3} className="mg-chip lit" />
      </svg>
    );
  return (
    <svg viewBox="0 0 44 44" className={cls}>
      <path d="M 22 8 a 14 14 0 1 1 -10 4" fill="none" className="mg-path" />
      <path d="M 8 8 l 4 4 l -6 2 Z" className="mg-core" />
      <circle cx={22} cy={22} r={2.4} className="mg-core" />
    </svg>
  );
}

export function ProfileSection() {
  const ref = useRef<HTMLElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  const [typedN, setTypedN] = useState(0);
  const [role, setRole] = useState(0);
  const [pinned, setPinned] = useState<number | null>(null);
  const [domain, setDomain] = useState(0);
  const [flare, setFlare] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!onScreen || typedN >= HEADING.length) return;
    const t = window.setTimeout(() => setTypedN((v) => v + 1), 34);
    return () => window.clearTimeout(t);
  }, [onScreen, typedN]);

  useEffect(() => {
    if (!onScreen) return;
    const a = window.setInterval(() => setRole((v) => (v + 1) % ROLES.length), 2800);
    const b = window.setInterval(() => setDomain((v) => (v + 1) % DOMAINS.length), 3200);
    const c = window.setInterval(() => setFlare((v) => (v + 1) % TRAY.length), 1700);
    return () => {
      window.clearInterval(a);
      window.clearInterval(b);
      window.clearInterval(c);
    };
  }, [onScreen]);

  const litRole = pinned ?? role;

  return (
    <section ref={ref} id="profile" className="vx-profile vx-section-shell vx-accent-lime">
      <div className="vx-section-heading">
        <span>PROFILE / THE ENGINEER YOU'D BE HIRING</span>
        <h2 className="vx-typed-h" aria-label={HEADING}>
          <span className="vx-typed-live" aria-hidden="true">
            {HEADING.slice(0, typedN)}
            {onScreen && typedN < HEADING.length ? <i className="vx-type-caret" /> : null}
          </span>
          <b className="vx-typed-ghost" aria-hidden="true">{HEADING}</b>
        </h2>
        <p>
          Four roles I'm aiming at, five domains that power them — the same five clusters
          you've been watching float behind this page. Every claim links down into a chapter that proves it.
        </p>
      </div>

      <div className="vx-profile-grid">
        {/* T1 — target roles, touring themselves */}
        <div className="vx-role-rail" role="list" aria-label="Target roles">
          <span className="vx-profile-tier">TARGET ROLES</span>
          {ROLES.map((r, i) => (
            <button
              key={r.n}
              type="button"
              role="listitem"
              className={`vx-role-card ${litRole === i ? "is-lit" : ""}`}
              onClick={() => setPinned(pinned === i ? null : i)}
              aria-pressed={litRole === i}
            >
              <span>{r.n}</span>
              <strong>{r.title}</strong>
              <p>{r.line}</p>
              <div className="vx-role-weights" aria-label="Domain weights">
                {r.weights.map((w, di) => (
                  <i key={di} data-w={w} title={DOMAINS[di].name} />
                ))}
              </div>
              <div className="vx-role-evidence">
                {r.evidence.map((e) => (
                  <a key={e.label} href={e.href} onClick={(ev) => ev.stopPropagation()}>
                    {e.label} ↓
                  </a>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* T2 — the five domains, one lit at a time */}
        <div className="vx-domain-stack" role="list" aria-label="Capability domains">
          <span className="vx-profile-tier">FIVE DOMAINS · THE GALAXY, MAPPED</span>
          {DOMAINS.map((d, i) => {
            const lit = domain === i;
            const emphasized = ROLES[litRole].weights[i] === 2;
            return (
              <div key={d.name} role="listitem" className={`vx-domain-row ${lit ? "is-lit" : ""} ${emphasized ? "is-weighted" : ""}`}>
                <DomainGlyph kind={d.glyph} lit={lit} />
                <div>
                  <strong>D{i + 1} · {d.name}</strong>
                  <div className="vx-domain-kws">
                    {d.kws.map((k) => <i key={k}>{k}</i>)}
                  </div>
                  <small>{lit ? `proof: ${d.proof}` : " "}</small>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* T3 — the curated keyword tray */}
      <div className="vx-kw-tray" aria-label="Core expertise">
        <span>CORE EXPERTISE — THE SHORT LIST</span>
        <div>
          {TRAY.map((k, i) => (
            <em key={k} data-flare={i === flare || i === (flare + 4) % TRAY.length}>{k}</em>
          ))}
        </div>
      </div>
    </section>
  );
}
