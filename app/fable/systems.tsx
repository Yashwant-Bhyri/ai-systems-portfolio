"use client";

import { useEffect, useRef } from "react";
import { useTour, useStepper, useOnScreen } from "./director";
import { Node, Packet } from "./svg-bits";

function LogisticsGraphic() {
  return (
    <svg viewBox="0 0 640 300" className="op-svg">
      {["ADMIN", "DRIVER", "CUSTOMER"].map((role, i) => {
        const y = 40 + i * 80;
        const d = `M 170 ${y + 24} C 240 ${y + 24} 240 140 300 140`;
        return (
          <g key={role}>
            <Node x={40} y={y} w={130} h={48} label={role} sub="JWT role" lit={i === 0} />
            <path d={d} className="nn-edge" style={{ animationDelay: `${i * 0.3}s` }} />
            <Packet path={d} dur={2.2} delay={i * 0.35} cls="warm" />
          </g>
        );
      })}
      <Node x={300} y={108} w={150} h={64} label="FLASK API" sub="role-gated routes" lit />
      <path d="M 450 140 L 500 140" className="svg-rail" />
      <Packet path="M 450 140 L 500 140" dur={1.3} />
      <Node x={500} y={78} w={120} h={52} label="RISK SCORE" sub="weather + geo" />
      <Node x={500} y={150} w={120} h={52} label="AI COPILOT" sub="whitelisted intents" />
      <text x={40} y={282} className="svg-note">
        The copilot can only execute pre-approved query intents — bounded AI, parameterized SQL, no surprises.
      </text>
    </svg>
  );
}

const BENCH = [
  {
    name: "Optek TinyML Audio",
    what: "Keyword inference on custom silicon",
    stats: "93%+ accuracy · <10 ms latency · 14× model compression · 700 MHz DSP + 16 MB SoC NPU",
  },
  {
    name: "webGLR",
    what: "Browser perception-to-shader pipeline",
    stats: "Segmentation + depth fused live · dual live/HQ lanes · zero build step",
  },
  {
    name: "COL-VEO",
    what: "Deterministic AI video orchestration",
    stats: "Storyboard state machine · 15-axis prompt control · seed-safe regeneration",
  },
  {
    name: "GraphRAG · BIRD-SQL · SLM distillation",
    what: "Retrieval and reasoning research",
    stats: "Graph-structured retrieval · text-to-SQL benchmarks · small-model distillation",
  },
];

export function SystemsChapter() {
  const { registerSection, chapterDone } = useTour();
  const sectionRef = useRef<HTMLElement>(null);
  const onScreen = useOnScreen(sectionRef);

  useEffect(() => {
    registerSection("systems", sectionRef.current);
  }, [registerSection]);

  const [lit, setLit] = useStepper(BENCH.length, {
    active: onScreen,
    stepMs: 3200,
    startDelayMs: 4500,
    onFirstCycle: () => chapterDone("systems"),
  });

  return (
    <section ref={sectionRef} data-chapter="systems" id="systems" className="fable-section systems-chapter" style={{ "--accent": "#ffd166" } as React.CSSProperties}>
      <header className="chapter-head">
        <p className="chapter-kicker">PROJECT 04 + THE BENCH</p>
        <h2 className="chapter-title">Heavy machinery &amp; research bench</h2>
        <p className="chapter-sub">
          The same discipline, applied to operations software and to research prototypes.
        </p>
      </header>
      <div className="systems-grid">
        <div className="systems-main">
          <h3 className="systems-name">Logistics AI-Ops Platform</h3>
          <p className="systems-plain">
            Role-gated logistics operations — admin, driver, and customer workflows over MySQL, with weather- and
            geo-aware route risk scoring and an AI copilot that is deliberately allowed to do very few things.
          </p>
          <LogisticsGraphic />
        </div>
        <div className="systems-bench">
          <h3 className="systems-name">Research bench</h3>
          <ul className="bench-list">
            {BENCH.map((b, i) => (
              <li key={b.name}>
                <button className={`bench-row ${lit === i ? "is-lit" : ""}`} onMouseEnter={() => setLit(i)} onClick={() => setLit(i)}>
                  <span className="bench-name">{b.name}</span>
                  <span className="bench-what">{b.what}</span>
                  <span className="bench-stats">{b.stats}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
