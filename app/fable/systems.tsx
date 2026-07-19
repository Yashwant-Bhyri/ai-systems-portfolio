"use client";

import { useEffect, useRef } from "react";
import { useTour, useStepper, useOnScreen } from "./director";
import { useSim, ph, eph, pulse, bez, typed, caret, rise, q } from "./live";

const ROLE_REQS = [
  { role: "ADMIN", req: "GET /admin/fleet" },
  { role: "DRIVER", req: "POST /driver/route/12" },
  { role: "CUSTOMER", req: "GET /orders/track/88" },
];
const WEATHER = ["☀ clear", "🌧 storm cell", "🌫 fog", "☀ clear"];

function LogisticsGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 11000;
  const t = el % L;

  // recurring role → API request pulses
  const pulses = ROLE_REQS.map((_, i) => {
    const local = (t + i * 1150) % 3400;
    return { p: local < 700 ? local / 700 : -1, landed: local >= 700 && local < 1500 };
  });
  const lastLanded = pulses.findIndex((p2) => p2.landed);

  // weather cycles; risk follows
  const wIdx = Math.floor(t / 2750) % 4;
  const storm = wIdx === 1;
  const risk = storm ? 0.55 + 0.35 * eph(t % 2750, 200, 1400) : 0.35 + 0.1 * pulse(t, 2400);

  // copilot terminal script
  const q1 = typed("> show late deliveries in Kowloon", t, 800, 2400);
  const q2 = typed("> export all customer records", t, 5600, 7000);

  return (
    <svg viewBox="0 0 640 320" className="op-svg">
      {ROLE_REQS.map((r, i) => {
        const y = 46 + i * 64;
        const pp = pulses[i].p;
        const [px, py] = pp >= 0 ? bez(pp, [140, y + 16], [200, (y + 150) / 2], [252, 150]) : [0, 0];
        return (
          <g key={r.role}>
            <g className={`lv-node ${pulses[i].landed ? "is-live" : ""}`}>
              <rect x={24} y={y} width={116} height={34} rx={9} />
            </g>
            <text x={82} y={y + 15} textAnchor="middle" className="svg-label small">{r.role}</text>
            <text x={82} y={y + 29} textAnchor="middle" className="svg-sub tiny">JWT role</text>
            <path d={`M 140 ${y + 16} Q 200 ${(y + 150) / 2} 252 150`} className="lv-edge" style={{ opacity: 0.3 }} />
            {pp > 0 && pp < 1 && <circle cx={q(px)} cy={q(py)} r={3.8} className="lv-pulse" />}
          </g>
        );
      })}

      {/* API core with live request readout */}
      <g className="lv-node is-live">
        <rect x={252} y={120} width={120} height={60} rx={11} />
      </g>
      <text x={312} y={144} textAnchor="middle" className="svg-label small">FLASK API</text>
      <text x={312} y={162} textAnchor="middle" className="svg-mono tinytext">
        {lastLanded >= 0 ? ROLE_REQS[lastLanded].req : "role-gated"}
      </text>

      {/* live risk gauge reacting to weather */}
      <g transform="translate(300,246)">
        <path d="M -60 0 A 60 60 0 0 1 60 0" className="lv-ring track" />
        <path d="M -60 0 A 60 60 0 0 1 60 0" className={`lv-ring ${risk > 0.7 ? "hotline" : ""}`} pathLength={100} strokeDasharray={`${q(risk * 100)} 100`} />
        <text x={0} y={-14} textAnchor="middle" className="lv-counter mid">{Math.round(risk * 100)}</text>
        <text x={0} y={2} textAnchor="middle" className="svg-sub tiny">route risk</text>
        <text x={0} y={22} textAnchor="middle" className="svg-mono tinytext">{WEATHER[wIdx]}</text>
      </g>
      {storm && risk > 0.75 && (
        <g className="lv-chip win" style={rise(eph(t % 2750, 1500, 1900), 6)}>
          <rect x={382} y={236} width={104} height={26} rx={8} />
          <text x={434} y={253} textAnchor="middle" className="svg-mono tinytext">re-routed ✓</text>
        </g>
      )}

      {/* the copilot terminal: one allowed query, one refusal */}
      <g className="lv-box">
        <rect x={400} y={30} width={224} height={186} rx={11} />
        <text x={414} y={52} className="svg-sub">AI COPILOT · whitelisted intents only</text>
        <text x={414} y={76} className="svg-mono tinytext">{q1}{t > 800 && t < 2500 ? caret(t) : ""}</text>
        {t > 2800 && <text x={414} y={96} className="tick ok" style={rise(eph(t, 2800, 3100), 4)}>intent: delivery_status ✓ whitelisted</text>}
        {t > 3400 && <text x={414} y={116} className="svg-mono tinytext" style={rise(eph(t, 3400, 3700), 4)}>KLN-204 · 41 min late · storm</text>}
        {t > 3900 && <text x={414} y={134} className="svg-mono tinytext" style={rise(eph(t, 3900, 4200), 4)}>KLN-217 · 12 min late</text>}
        <text x={414} y={162} className="svg-mono tinytext">{q2}{t > 5600 && t < 7100 ? caret(t) : ""}</text>
        {t > 7400 && <text x={414} y={182} className="tick bad" style={rise(eph(t, 7400, 7700), 4)}>✗ intent not whitelisted — refused</text>}
        {t > 8200 && <text x={414} y={202} className="svg-sub tiny" style={rise(eph(t, 8200, 8500), 4)}>bounded AI · parameterized SQL only</text>}
      </g>

      <text x={24} y={306} className="svg-note">
        Live ops: role-gated requests, weather-reactive risk scoring — and a copilot that visibly refuses what it wasn't approved to do.
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
          <LogisticsGraphic a={onScreen} />
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
