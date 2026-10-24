"use client";

import { useEffect, useRef } from "react";
import { useTour, useStepper, useOnScreen } from "./director";

/**
 * The floor map: every project named AND explained in plain language,
 * with the spotlight walking the list on its own.
 */
const PROJECTS = [
  {
    no: "01",
    name: "Antigravity",
    plain: "An AI-native technical interviewing platform",
    detail:
      "A real-time voice interviewer that turns a candidate's answers into evidence — multi-agent analysis on every turn, sub-second response loop, evidence-backed reports.",
    tags: ["Realtime voice", "Multi-agent", "250+ interviews"],
    href: "#antigravity",
  },
  {
    no: "02",
    name: "Filmora Agent Runtime",
    plain: "A multi-agent media production system · Wondershare internship",
    detail:
      "One user prompt becomes a finished, editable video edit: trend research across six platforms, compiled skill files, agent orchestration, full observability.",
    tags: ["AIGC", "700+ signals", "28% cost cut"],
    href: "#filmora",
  },
  {
    no: "03",
    name: "MindScape",
    plain: "A clinical AI workflow engine for psychiatric care",
    detail:
      "Session capture to clinician handoff: multimodal perception, hybrid medical retrieval, grounded reasoning, and deterministic safety gates before anything reaches a doctor.",
    tags: ["Hybrid retrieval", "Safety gates", "FastAPI + Next.js"],
    href: "#mindscape",
  },
  {
    no: "04",
    name: "Logistics AI-Ops",
    plain: "A role-gated logistics operations platform",
    detail:
      "Admin, driver, and customer workflows over MySQL with JWT roles, weather- and geo-aware route risk scoring, and an AI copilot restricted to whitelisted intents.",
    tags: ["RBAC", "Risk scoring", "Bounded copilot"],
    href: "#systems",
  },
  {
    no: "05",
    name: "Research Bench",
    plain: "Applied research: edge AI, retrieval, rendering",
    detail:
      "TinyML audio on custom silicon, GraphRAG and BIRD-SQL experiments, browser-native perception-to-shader rendering, deterministic AI video orchestration.",
    tags: ["TinyML", "GraphRAG", "WebGL"],
    href: "#systems",
  },
];

export function IndexChapter() {
  const { registerSection, chapterDone } = useTour();
  const sectionRef = useRef<HTMLElement>(null);
  const onScreen = useOnScreen(sectionRef);

  useEffect(() => {
    registerSection("index", sectionRef.current);
  }, [registerSection]);

  const [lit, setLit] = useStepper(PROJECTS.length, {
    active: onScreen,
    stepMs: 3400,
    startDelayMs: 900,
    onFirstCycle: () => chapterDone("index"),
  });

  return (
    <section ref={sectionRef} data-chapter="index" id="index" className="fable-section index-chapter">
      <header className="chapter-head">
        <p className="chapter-kicker">THE FLOOR MAP</p>
        <h2 className="chapter-title">Five systems, one method</h2>
        <p className="chapter-sub">
          Perceive → orchestrate → reason → validate → ship. Each project runs the same discipline in a different domain.
        </p>
      </header>
      <ol className="index-list">
        {PROJECTS.map((p, i) => (
          <li key={p.no}>
            <a href={p.href} className={`index-row ${lit === i ? "is-lit" : ""}`} onMouseEnter={() => setLit(i)}>
              <span className="ir-no">{p.no}</span>
              <span className="ir-main">
                <span className="ir-name">{p.name}</span>
                <span className="ir-plain">{p.plain}</span>
                <span className="ir-detail">{p.detail}</span>
              </span>
              <span className="ir-tags">
                {p.tags.map((t) => (
                  <span key={t} className="ir-tag">
                    {t}
                  </span>
                ))}
              </span>
              <span className="ir-arrow" aria-hidden="true">
                →
              </span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
