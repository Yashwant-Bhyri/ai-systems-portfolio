"use client";

import { useEffect, useRef } from "react";
import { useTour, useStepper, useOnScreen } from "./director";
import { useSim, eph, pulse, noise, bez, typed, caret, rise, Wave, q } from "./live";

/* ---------- live research minis (V2's mini-pipeline language, made live) ---------- */

export function BenchMini({ idx, t }: { idx: number; t: number }) {
  if (idx === 0) {
    // Optek TinyML: audio → log-Mel cells → tiny net firing → INT8 on the SoC
    const sweep = Math.floor(t / 140) % 18;
    return (
      <g>
        <text x={10} y={18} className="svg-sub tiny">EMBEDDED AUDIO INTELLIGENCE · LIVE</text>
        <Wave x={10} y={30} w={50} h={30} bars={10} t={t} on={1} />
        <text x={66} y={50} className="svg-sub tiny">→</text>
        {Array.from({ length: 18 }).map((_, c) => {
          const cx = 78 + (c % 6) * 10;
          const cy = 30 + Math.floor(c / 6) * 11;
          const lit = c === sweep;
          return <rect key={c} x={cx} y={cy} width={9} height={9} rx={2} className="lv-bar" style={{ opacity: lit ? 1 : 0.2 + 0.5 * noise(c * 3 + 1, t / 2) }} />;
        })}
        <text x={78} y={78} className="svg-sub tiny">log-Mel features</text>
        <text x={146} y={50} className="svg-sub tiny">→</text>
        {[0, 1, 2, 3, 4, 5].map((n) => {
          const nx = 164 + (n % 2) * 20;
          const ny = 30 + Math.floor(n / 2) * 14;
          return <circle key={n} cx={nx} cy={ny} r={3.4} className="lv-hidnode" style={{ opacity: 0.35 + 0.65 * noise(n * 5 + 2, t / 1.5) }} />;
        })}
        <text x={158} y={78} className="svg-sub tiny">pruned model</text>
        <text x={207} y={50} className="svg-sub tiny">→</text>
        <g className={`lv-chip ${Math.floor(t / 1600) % 2 ? "win" : ""}`}>
          <rect x={220} y={32} width={88} height={30} rx={7} />
          <text x={264} y={45} textAnchor="middle" className="svg-mono tinytext">TFLM INT8</text>
          <text x={264} y={57} textAnchor="middle" className="svg-sub tiny">edge SoC</text>
        </g>
        {[["95%+ accuracy", 10], ["sub-10 ms", 112], ["4× compression", 208]].map(([v, x]) => (
          <text key={String(v)} x={Number(x)} y={112} className="svg-mono tinytext">{v}</text>
        ))}
        <text x={10} y={136} className="svg-sub tiny">inference {fmtTick(t)} · {Math.floor(t / 800) % 2 ? "keyword detected ✓" : "listening…"}</text>
      </g>
    );
  }
  if (idx === 1) {
    // webGLR: SAM mask + INT8 monocular depth → five-texture shader
    const live = (t % 1000) / 1000;
    const hq = (t % 3200) / 3200;
    return (
      <g>
        <text x={8} y={15} className="svg-sub tiny">SAM + INT8 DEPTH → 5-TEXTURE WEBGL CONTRACT</text>
        <rect x={8} y={24} width={58} height={48} rx={6} className="lv-track" />
        <circle cx={q(22 + 31 * (0.5 + 0.5 * Math.sin(t / 800)))} cy={q(43 + 8 * Math.cos(t / 1100))} r={4.5} className="lv-pulse" />
        <text x={37} y={66} textAnchor="middle" className="svg-sub tiny">CAMERA</text>
        <text x={71} y={51} className="svg-sub tiny">→</text>
        <rect x={82} y={24} width={58} height={48} rx={6} className="lv-track" />
        {[0, 1, 2].map((b2) => (
          <rect key={b2} x={87 + b2 * 15} y={29} width={11} height={28} rx={3} className="lv-bar" style={{ opacity: 0.3 + 0.6 * noise(b2 * 7 + 3, t / 2) }} />
        ))}
        <text x={111} y={66} textAnchor="middle" className="svg-sub tiny">SAM MASK</text>
        <text x={145} y={51} className="svg-sub tiny">→</text>
        <rect x={156} y={24} width={58} height={48} rx={6} className="lv-track" />
        {[0, 1, 2, 3].map((d2) => (
          <rect key={d2} x={161} y={28 + d2 * 6} width={48} height={5} rx={2.5} className="lv-bar bg" style={{ opacity: 0.9 - d2 * 0.2 }} />
        ))}
        <text x={185} y={61} textAnchor="middle" className="svg-sub tiny">DEPTH V2</text>
        <text x={185} y={70} textAnchor="middle" className="svg-sub tiny">INT8</text>
        <text x={219} y={51} className="svg-sub tiny">→</text>
        <g className="lv-chip win">
          <rect x={230} y={24} width={82} height={48} rx={8} />
          <text x={271} y={44} textAnchor="middle" className="svg-mono tinytext">GPU CONTRACT</text>
          <text x={271} y={59} textAnchor="middle" className="svg-sub tiny">5 TEXTURES</text>
        </g>
        <text x={8} y={92} className="svg-mono tinytext">LIVE LANE</text>
        <rect x={70} y={85} width={160} height={7} rx={3.5} className="lv-track thin" />
        <rect x={70} y={85} width={q(160 * live)} height={7} rx={3.5} className="lv-bar" />
        <text x={312} y={92} textAnchor="end" className="svg-sub tiny">SUBJECT LIFT</text>
        <text x={8} y={115} className="svg-mono tinytext">HQ LANE</text>
        <rect x={70} y={108} width={160} height={7} rx={3.5} className="lv-track thin" />
        <rect x={70} y={108} width={q(160 * hq)} height={7} rx={3.5} className="lv-bar warm" />
        <text x={312} y={115} textAnchor="end" className="svg-sub tiny">SCENE CACHE</text>
        <text x={160} y={140} textAnchor="middle" className="svg-sub tiny">CUT GUARD ✦ CACHE BLEND ✦ MEMORY BUDGET</text>
      </g>
    );
  }
  if (idx === 2) {
    // COL-VEO: deterministic prompt compilation and provider-best-effort output
    const frame = Math.floor(t / 900) % 4;
    const regen = Math.floor(t / 3600) % 2 === 1;
    return (
      <g>
        <text x={10} y={18} className="svg-sub tiny">CONTROLLED VIDEO R&D · {regen ? "REGEN BRANCH" : "PROMPT STEERING"}</text>
        {[0, 1, 2, 3].map((f2) => (
          <g key={f2} className={`lv-node ${frame === f2 ? "is-live" : ""}`}>
            <rect x={10 + f2 * 70} y={30} width={60} height={44} rx={7} />
            <text x={40 + f2 * 70} y={50} textAnchor="middle" className="svg-mono tinytext">S{f2 + 1}</text>
            <text x={40 + f2 * 70} y={64} textAnchor="middle" className="svg-sub tiny">{["hook", "reveal", "detail", "cta"][f2]}</text>
          </g>
        ))}
        <circle cx={q(40 + frame * 70 + 70 * ((t % 900) / 900) * (frame < 3 ? 1 : 0))} cy={84} r={3.4} className="lv-pulse" />
        <g className={`lv-chip ${regen ? "win" : ""}`}>
          <rect x={10} y={96} width={140} height={25} rx={8} />
          <text x={80} y={112} textAnchor="middle" className="svg-mono tinytext">SOFT · reuse seed 4271</text>
        </g>
        <g className={`lv-chip ${regen ? "" : "win"}`}>
          <rect x={160} y={96} width={148} height={25} rx={8} />
          <text x={234} y={112} textAnchor="middle" className="svg-mono tinytext">HARD · assign new seed</text>
        </g>
        <text x={10} y={136} className="svg-sub tiny">typed control layer · provider output remains best-effort</text>
        <text x={10} y={148} className="svg-mono tinytext">PROJECT + SHOT STYLE + GLOBAL CONSISTENCY</text>
      </g>
    );
  }
  // GraphRAG · BIRD-SQL · SLM distillation
  const sql = typed("SELECT route_id FROM evidence\nWHERE risk = ?", t % 5200, 400, 2600);
  const exOk = (t % 5200) > 3000;
  const judge = Math.floor(t / 700) % 3;
  return (
    <g>
      <text x={10} y={18} className="svg-sub tiny">EXECUTION-GROUNDED SQL · + DISTILL GATE</text>
      <rect x={10} y={28} width={170} height={58} rx={8} className="lv-track" />
      <text x={20} y={48} className="svg-mono tinytext">{sql.split("\n")[0]}</text>
      <text x={20} y={64} className="svg-mono tinytext">{sql.split("\n")[1] || ""}{(t % 5200) < 2700 ? caret(t) : ""}</text>
      <text x={20} y={100} className={exOk ? "tick ok" : "svg-sub tiny"}>{exOk ? "EX ✓ executed on live DB" : "compiling…"}</text>
      {["s01", "s02", "s03"].map((s2, i) => (
        <g key={s2} className="lv-chip">
          <rect x={200 + i * 38} y={30} width={32} height={20} rx={6} style={{ opacity: judge === i ? 1 : 0.45 }} />
          <text x={216 + i * 38} y={44} textAnchor="middle" className="svg-sub tiny">{s2}</text>
        </g>
      ))}
      <text x={200} y={70} className="svg-mono tinytext">judge: {judge === 1 ? "✗ reject" : "✓ accept"}</text>
      <g className="lv-chip win">
        <rect x={200} y={80} width={70} height={22} rx={7} />
        <text x={235} y={95} textAnchor="middle" className="svg-mono tinytext">→ SLM</text>
      </g>
      <text x={10} y={126} className="svg-mono tinytext">12,751+ pairs · 95+ DBs</text>
      <text x={10} y={142} className="svg-mono tinytext">31% fewer factual errors</text>
    </g>
  );
}

function fmtTick(t: number) {
  return `${(6 + 3 * noise(Math.floor(t / 600) % 17, 500)).toFixed(1)} ms`;
}

const ROLE_REQS = [
  { role: "ADMIN", req: "GET /admin/fleet" },
  { role: "DRIVER", req: "POST /driver/route/12" },
  { role: "CUSTOMER", req: "GET /orders/track/88" },
];
const WEATHER = ["☀ clear", "🌧 storm cell", "🌫 fog", "☀ clear"];

const MINI_ENDPOINTS = ["/fleet", "/route/12", "/track/88"];
const MINI_WEATHER = ["CLEAR", "STORM", "FOG", "CLEAR"];

/**
 * Card-scale version of the full logistics simulation. It preserves the same
 * 11-second role, weather, bounded-query, and refusal timeline without
 * shrinking the 640×320 operational graphic into unreadable card text.
 */
export function LogisticsMiniGraphic({ t: elapsed }: { t: number }) {
  const t = elapsed % 11000;
  const pulses = ROLE_REQS.map((_, index) => {
    const local = (t + index * 1150) % 3400;
    return { progress: local < 700 ? local / 700 : -1, landed: local >= 700 && local < 1500 };
  });
  const lastLanded = pulses.findIndex((item) => item.landed);
  const weatherIndex = Math.floor(t / 2750) % MINI_WEATHER.length;
  const storm = weatherIndex === 1;
  const risk = storm ? 0.55 + 0.35 * eph(t % 2750, 200, 1400) : 0.35 + 0.1 * pulse(t, 2400);
  const rerouted = storm && risk > 0.75;
  const refusalPhase = t >= 5200;
  const refused = t >= 7400;
  const prompt = refusalPhase
    ? typed("> export customer records", t, 5600, 7000)
    : typed("> late deliveries · Kowloon", t, 800, 2400);
  const promptTyping = (!refusalPhase && t >= 800 && t < 2500) || (refusalPhase && t >= 5600 && t < 7100);
  const status = refused
    ? "✕ INTENT REFUSED · NO SQL"
    : refusalPhase
      ? "POLICY CHECK · EXPORT_ALL"
      : t >= 2700
        ? "✓ APPROVED HANDLER · BOUND SQL"
        : "WAITING FOR APPROVED INTENT";
  const statusClass = refused ? "tick bad" : t >= 2700 && !refusalPhase ? "tick ok" : "svg-sub tiny";

  return (
    <g>
      <text x={8} y={15} className="svg-sub tiny">LALAMOVE R&amp;D · BOUNDED AI OPERATIONS</text>
      <text x={312} y={15} textAnchor="end" className="svg-sub tiny">{MINI_WEATHER[weatherIndex]}</text>

      {ROLE_REQS.map((request, index) => {
        const y = 25 + index * 25;
        const progress = pulses[index].progress;
        const [px, py] = progress >= 0
          ? bez(progress, [64, y + 11], [72, (y + 78) / 2], [82, 66])
          : [0, 0];
        return (
          <g key={request.role}>
            <g className={`lv-node ${pulses[index].landed ? "is-live" : ""}`}>
              <rect x={8} y={y} width={56} height={22} rx={6} />
            </g>
            <text x={36} y={y + 10} textAnchor="middle" className="svg-mono tinytext">{request.role}</text>
            <text x={36} y={y + 19} textAnchor="middle" className="svg-sub tiny">JWT</text>
            <path d={`M 64 ${y + 11} Q 72 ${(y + 78) / 2} 82 66`} className="lv-edge" style={{ opacity: 0.32 }} />
            {progress > 0 && progress < 1 ? <circle cx={q(px)} cy={q(py)} r={3.2} className="lv-pulse" /> : null}
          </g>
        );
      })}

      <g className="lv-node is-live">
        <rect x={82} y={45} width={66} height={42} rx={8} />
      </g>
      <text x={115} y={60} textAnchor="middle" className="svg-label small">FLASK API</text>
      <text x={115} y={75} textAnchor="middle" className="svg-sub tiny">
        {lastLanded >= 0 ? MINI_ENDPOINTS[lastLanded] : "ROLE GATE"}
      </text>
      <path d="M 148 58 L 158 51" className="lv-edge" />
      <path d="M 148 74 L 235 62" className="lv-edge" />

      <g className={`lv-chip ${rerouted ? "win" : ""}`}>
        <rect x={158} y={25} width={68} height={62} rx={8} />
        <text x={192} y={39} textAnchor="middle" className="svg-sub tiny">ROUTE RISK</text>
        <text x={192} y={61} textAnchor="middle" className="lv-counter mid">{Math.round(risk * 100)}</text>
        <text x={192} y={76} textAnchor="middle" className={rerouted ? "tick ok" : "svg-sub tiny"}>
          {rerouted ? "REROUTE ✓" : MINI_WEATHER[weatherIndex]}
        </text>
      </g>

      <g className={`lv-chip ${refused ? "" : "win"}`}>
        <rect x={235} y={25} width={77} height={62} rx={8} />
        <text x={273.5} y={40} textAnchor="middle" className="svg-sub tiny">OPS COPILOT</text>
        <text x={273.5} y={58} textAnchor="middle" className="svg-mono tinytext">
          {refusalPhase ? "EXPORT ALL" : "BOUND QUERY"}
        </text>
        <text x={273.5} y={74} textAnchor="middle" className={refused ? "tick bad" : "tick ok"}>
          {refused ? "REFUSED ✕" : "RUNNING ✓"}
        </text>
      </g>

      <g className="lv-box">
        <rect x={82} y={94} width={230} height={39} rx={7} />
        <text x={92} y={109} className="svg-mono tinytext">{prompt}{promptTyping ? caret(t) : ""}</text>
        <text x={92} y={126} className={statusClass}>{status}</text>
      </g>
      <text x={8} y={145} className="svg-sub tiny">BOUND SQL ✦ VISIBLE REFUSALS ✦ HUMAN ACTION</text>
    </g>
  );
}

export function LogisticsGraphic({ a }: { a: boolean }) {
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
        {t > 2800 && <text x={414} y={96} className="tick ok" style={rise(eph(t, 2800, 3100), 4)}>intent: delivery_status ✓ → parameterized query</text>}
        {t > 3400 && <text x={414} y={116} className="svg-mono tinytext" style={rise(eph(t, 3400, 3700), 4)}>KLN-204 · 41 min late · storm</text>}
        {t > 3900 && <text x={414} y={134} className="svg-mono tinytext" style={rise(eph(t, 3900, 4200), 4)}>KLN-217 · 12 min late</text>}
        {t > 4400 && <text x={414} y={150} className="svg-sub tiny" style={rise(eph(t, 4400, 4700), 4)}>4 rows returned · 0 unrestricted queries</text>}
        <text x={414} y={168} className="svg-mono tinytext">{q2}{t > 5600 && t < 7100 ? caret(t) : ""}</text>
        {t > 7400 && <text x={414} y={186} className="tick bad" style={rise(eph(t, 7400, 7700), 4)}>✗ intent not whitelisted — refused</text>}
        {t > 8200 && <text x={414} y={204} className="svg-sub tiny" style={rise(eph(t, 8200, 8500), 4)}>bounded AI · approved handlers only</text>}
      </g>

      <text x={24} y={306} className="svg-note">
        Role-gated APIs · weather-aware route risk · bounded copilot with visible refusals
      </text>
    </svg>
  );
}

const BENCH = [
  {
    name: "Optek TinyML Audio",
    what: "Keyword inference on custom silicon",
    stats: "95%+ accuracy · <10 ms latency · 4× compression · 200 KB runtime",
  },
  {
    name: "webGLR",
    what: "Browser-native perception-to-shader R&D",
    stats: "Segmentation + depth fused live · dual live/HQ lanes · zero build step",
  },
  {
    name: "COL-VEO",
    what: "Controlled generative video R&D",
    stats: "15-axis prompt steering · same-seed soft regen · new-seed structural regen",
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
    stepMs: 5400,
    startDelayMs: 4500,
    onFirstCycle: () => chapterDone("systems"),
  });
  const el = useSim(onScreen);

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
          <div className="bench-mini-stage" key={lit}>
            <svg viewBox="0 0 320 150" className="op-svg bench-mini" aria-label="Live micro-visual of the selected research project">
              <BenchMini idx={lit} t={el} />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
