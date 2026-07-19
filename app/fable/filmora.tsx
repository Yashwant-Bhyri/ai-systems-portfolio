"use client";

import { ChapterShell, type StepDef } from "./chapter-shell";
import { useSim, ph, eph, pulse, noise, bez, typed, caret, rise, q } from "./live";

/* Live scenes — every graphic is the runtime actually working. */

const SPIN = ["◐", "◓", "◑", "◒"];

/* ---------- 1 · THE RUNTIME — one full production run ---------- */

const RUN_LOG = [
  { at: 2400, name: "research.trends", ms: "1.2 s" },
  { at: 3400, name: "memory.retrieve", ms: "0.3 s" },
  { at: 4100, name: "compile.prompt", ms: "0.2 s" },
  { at: 4800, name: "agents.dispatch ×6", ms: "3.8 s" },
];
const CLIPS = [86, 118, 74, 132, 96];

function RuntimeGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 11000;
  const t = el % L;
  const cyc = Math.floor(el / L) % 2;
  const prompt = cyc === 0 ? "cut a 30-second beach travel reel" : "make a 15-second product teaser";
  const ptyped = typed(prompt, t, 300, 2200);
  const ring = eph(t, 2400, 9200);

  let acc = 0;
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      {/* the prompt being typed by the user */}
      <g className="lv-box hot">
        <rect x={30} y={30} width={340} height={54} rx={11} />
        <text x={46} y={52} className="svg-sub">USER PROMPT</text>
        <text x={46} y={72} className="svg-mono small">“{ptyped}{t < 2300 ? caret(t) : ""}”</text>
      </g>

      {/* runtime status ring */}
      <circle cx={470} cy={57} r={22} className="lv-ring track" />
      <circle cx={470} cy={57} r={22} className="lv-ring" pathLength={100} strokeDasharray={`${ring * 100} 100`} transform="rotate(-90 470 57)" />
      <text x={470} y={61} textAnchor="middle" className="svg-mono tinytext">{Math.round(ring * 100)}%</text>
      <text x={510} y={53} className="svg-sub">agent runtime</text>
      <text x={510} y={68} className="svg-mono tinytext">{ring < 1 ? "producing…" : "done ✓"}</text>

      {/* live agent log */}
      <g className="lv-box">
        <rect x={30} y={104} width={340} height={150} rx={12} />
        <text x={48} y={130} className="svg-sub">RUNTIME LOG · live</text>
        {RUN_LOG.map((r, i) => {
          const started = t > r.at;
          const done = t > r.at + 800;
          if (!started) return null;
          return (
            <g key={r.name} style={rise(eph(t, r.at, r.at + 250), 6)}>
              <text x={48} y={154 + i * 24} className="svg-mono tinytext">{done ? "✓" : SPIN[Math.floor(t / 140) % 4]} {r.name}</text>
              <text x={352} y={154 + i * 24} textAnchor="end" className="svg-mono tinytext">{done ? r.ms : "…"}</text>
            </g>
          );
        })}
      </g>

      {/* timeline assembling inside the editor */}
      <text x={30} y={296} className="svg-sub">FILMORA TIMELINE · assembling</text>
      <g transform="translate(30,306)">
        {CLIPS.map((w, i) => {
          const x = acc;
          acc += w + 6;
          const p = eph(t, 6000 + i * 620, 6500 + i * 620);
          return <rect key={i} x={q(x)} y={0} width={q(w * p)} height={42} rx={6} className="lv-bar" style={{ opacity: 0.35 + 0.65 * p }} />;
        })}
        <rect x={0} y={50} width={q(acc * eph(t, 8600, 9300))} height={13} rx={5} className="lv-bar warm" />
      </g>
      <g className="lv-stamp" style={rise(eph(t, 9500, 9900), 6)}>
        <rect x={440} y={330} width={180} height={38} rx={9} />
        <text x={530} y={354} textAnchor="middle" className="svg-label small">editable edit ✓</text>
      </g>
      <text x={30} y={402} className="svg-note">
        One sentence in — a runtime of cooperating agents researches, plans, and assembles the edit in front of you.
      </text>
    </svg>
  );
}

/* ---------- 2 · TREND RESEARCH — feeds scroll, signals harvest ---------- */

const PLATFORMS = ["TikTok", "Douyin", "Xiaohongshu", "Instagram", "WeChat", "Facebook"];

function TrendGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 10000;
  const t = el % L;
  const raw = Math.round(723 * eph(t, 600, 8200));
  const activeIdx = Math.floor(t / 1400) % 6;
  const hp = (t % 1400) / 1400;

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <defs>
        <clipPath id="feedclip">
          <rect x={0} y={0} width={170} height={86} rx={8} />
        </clipPath>
      </defs>
      {PLATFORMS.map((p, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 34 + col * 196;
        const y = 34 + row * 148;
        const isActive = i === activeIdx;
        return (
          <g key={p}>
            <g className={`lv-node ${isActive ? "is-live" : ""}`}>
              <rect x={x} y={y} width={178} height={126} rx={12} />
            </g>
            <text x={x + 14} y={y + 24} className="svg-label small">{p}</text>
            {isActive && <text x={x + 164} y={y + 24} textAnchor="end" className="svg-mono tinytext">reading…</text>}
            {/* genuinely scrolling feed */}
            <g transform={`translate(${x + 14},${y + 34})`} clipPath="url(#feedclip)">
              {[0, 1, 2, 3, 4, 5].map((j) => {
                const cycleH = 132;
                const yy = q((((j * 22 - t / 14 - i * 31) % cycleH) + cycleH) % cycleH - 22);
                return (
                  <g key={j}>
                    <rect x={0} y={yy} width={q(92 + noise(i * 7 + j, 0) * 56)} height={10} rx={5} className="lv-feedbar" />
                    <rect x={0} y={yy + 13} width={40} height={5} rx={2.5} className="lv-feedbar dim" />
                  </g>
                );
              })}
            </g>
            {/* harvest pulse from the active platform */}
            {isActive && hp > 0.15 && hp < 0.95 && (
              <circle
                cx={q(bez((hp - 0.15) / 0.8, [x + 89, y + 63], [320, 160], [320, 196])[0])}
                cy={q(bez((hp - 0.15) / 0.8, [x + 89, y + 63], [320, 160], [320, 196])[1])}
                r={4.5}
                className="lv-pulse"
              />
            )}
          </g>
        );
      })}

      {/* live signal counter */}
      <g className="lv-stamp big">
        <rect x={216} y={172} width={208} height={58} rx={12} />
        <text x={320} y={198} textAnchor="middle" className="lv-counter mid">{raw >= 700 ? "700+" : raw}</text>
        <text x={320} y={218} textAnchor="middle" className="svg-sub tiny">creative signals · deduplicated live</text>
      </g>

      <text x={34} y={344} className="svg-note">
        Six feeds, actually moving — every pulse you see is a signal harvested, deduplicated, and distilled for the brief.
      </text>
    </svg>
  );
}

/* ---------- 3 · SKILL COMPILATION — files being written, live ---------- */

const SKILL_FILES = [
  {
    name: "trend-skill.md",
    start: 1400,
    lines: ["- hook in the first 0.8 s", "- vertical 9:16 only", "- street-interview cutaways"],
  },
  {
    name: "design.md",
    start: 4000,
    lines: ["- pace: 12 cuts / 30 s", "- captions: kinetic, zh+en", "- palette: warm, high-key"],
  },
  {
    name: "filmora-params.json",
    start: 6600,
    lines: ['{ "transition": 7,', '  "beat_sync": true,', '  "caption_style": "pop" }'],
  },
];

function SkillGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 10600;
  const t = el % L;

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      {/* raw signals streaming into the compiler */}
      <text x={30} y={44} className="svg-sub">RAW SIGNALS · 700+</text>
      {[0, 1, 2, 3, 4].map((k) => {
        const xx = q(30 + ((t / 8 + k * 44) % 190));
        return (
          <rect key={k} x={xx} y={58 + k * 16} width={34} height={7} rx={3.5} className="lv-feedbar" style={{ opacity: 0.9 - (xx - 30) / 220 }} />
        );
      })}
      <g className="lv-node is-live">
        <rect x={236} y={72} width={116} height={64} rx={12} />
        <text x={294} y={99} textAnchor="middle" className="svg-label small">SKILL</text>
        <text x={294} y={116} textAnchor="middle" className="svg-label small">COMPILER</text>
      </g>
      <circle cx={294} cy={146} r={3.5} className="lv-pulse" style={{ opacity: 0.4 + 0.6 * pulse(t, 600) }} />

      {/* files being written */}
      {SKILL_FILES.map((f, i) => {
        const y = 44 + i * 120;
        const done = t > f.start + 2200;
        const writing = t > f.start && !done;
        return (
          <g key={f.name}>
            <path
              d={`M 352 104 C 390 104 390 ${y + 44} 408 ${y + 44}`}
              className="lv-edge"
              style={{ opacity: writing ? 0.85 : 0.2 }}
            />
            {writing && (
              <circle
                cx={q(bez(((t - f.start) % 500) / 500, [352, 104], [390, (104 + y + 44) / 2], [408, y + 44])[0])}
                cy={q(bez(((t - f.start) % 500) / 500, [352, 104], [390, (104 + y + 44) / 2], [408, y + 44])[1])}
                r={3.6}
                className="lv-pulse"
              />
            )}
            <g className={`lv-node ${writing ? "is-live" : ""}`}>
              <rect x={408} y={y} width={216} height={96} rx={10} />
            </g>
            <text x={424} y={y + 22} className="svg-mono small">{f.name}</text>
            {done && <text x={608} y={y + 22} textAnchor="end" className="tick ok">✓ v13</text>}
            {writing && <text x={608} y={y + 22} textAnchor="end" className="svg-sub tiny">writing…</text>}
            {f.lines.map((ln, j) => (
              <text key={ln} x={424} y={y + 44 + j * 18} className="svg-mono tinytext">
                {typed(ln, t, f.start + 200 + j * 650, f.start + 750 + j * 650)}
                {writing && t > f.start + 200 + j * 650 && t < f.start + 750 + j * 650 ? caret(t) : ""}
              </text>
            ))}
          </g>
        );
      })}

      <text x={30} y={402} className="svg-note">
        Raw signals are useless to an agent — watch them get compiled into durable, versioned skill files.
      </text>
    </svg>
  );
}

/* ---------- 4 · MEMORY + RECO — retrieval actually lighting up ---------- */

const MEM_HITS = [
  { label: "skill: beach-reel pacing", score: 0.91 },
  { label: "context: golden-hour LUTs", score: 0.87 },
  { label: "params: beat-sync preset", score: 0.79 },
  { label: "b-roll: rainy street pack", score: 0.22 },
];
const RANKED = ["1 · surf transition pack", "2 · golden-hour LUT", "3 · beat-sync cut preset"];

function MemoryGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 10200;
  const t = el % L;
  const qq = typed("beach reel, fast cuts, golden hour", t, 200, 1500);
  const probe = eph(t, 2600, 3200);

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <g className="lv-box hot">
        <rect x={30} y={30} width={280} height={50} rx={10} />
        <text x={44} y={50} className="svg-sub">QUERY</text>
        <text x={44} y={68} className="svg-mono small">“{qq}{t < 1600 ? caret(t) : ""}”</text>
      </g>

      {/* embedding vector computes */}
      <text x={30} y={116} className="svg-sub">embedded</text>
      {[0.9, 0.4, 0.75, 0.25, 0.85, 0.5, 0.65, 0.35].map((v, i) => {
        const p = eph(t, 1500 + i * 90, 1900 + i * 90);
        return <rect key={i} x={100 + i * 15} y={q(122 - 26 * v * p)} width={10} height={q(26 * v * p + 4)} rx={2} className="lv-bar" />;
      })}

      {/* probe travels to the store */}
      <path d="M 230 116 C 280 116 280 150 320 156" className="lv-edge" style={{ opacity: probe > 0 ? 0.8 : 0.2 }} />
      {probe > 0 && probe < 1 && (
        <circle cx={q(bez(probe, [230, 116], [280, 133], [320, 156])[0])} cy={q(bez(probe, [230, 116], [280, 133], [320, 156])[1])} r={4.5} className="lv-pulse" />
      )}
      <g className="lv-db">
        <ellipse cx={356} cy={150} rx={40} ry={12} />
        <path d="M 316 150 v 74 a 40 12 0 0 0 80 0 v -74" />
        <text x={356} y={246} textAnchor="middle" className="svg-sub">vector store</text>
        {probe === 1 && <ellipse cx={356} cy={150} rx={q(40 + 14 * ((t / 500) % 1))} ry={q(12 + 5 * ((t / 500) % 1))} className="lv-ripple" style={{ opacity: 1 - ((t / 500) % 1) }} />}
      </g>

      {/* hits light up with live scores — the irrelevant one never does */}
      {MEM_HITS.map((h, i) => {
        const p = eph(t, 3300 + i * 450, 4900);
        const val = h.score * p;
        const hit = h.score > 0.5;
        return (
          <g key={h.label} style={{ opacity: Math.max(0.2, p) }}>
            <text x={430} y={64 + i * 26} className={`svg-mono tinytext ${hit ? "" : "dim"}`}>{hit && p > 0.9 ? "✦ " : "  "}{h.label}</text>
            <text x={624} y={64 + i * 26} textAnchor="end" className={hit ? "svg-mono tinytext" : "svg-mono tinytext dim"}>{val.toFixed(2)}</text>
          </g>
        );
      })}

      {/* reco network fires, ranked list emerges */}
      {[0, 1, 2].map((i) => {
        const p = ph(t, 5400 + i * 260, 6100 + i * 260);
        const y0 = 64 + i * 26;
        return (
          <g key={i}>
            <path d={`M 430 ${y0 + 90} C 380 ${y0 + 120} 300 290 260 300`} className="lv-edge" style={{ opacity: p > 0 ? 0.5 : 0.12 }} />
            {p > 0 && p < 1 && <circle cx={q(bez(p, [430, y0 + 90], [340, (y0 + 380) / 2], [260, 300])[0])} cy={q(bez(p, [430, y0 + 90], [340, (y0 + 380) / 2], [260, 300])[1])} r={3.6} className="lv-pulse" />}
          </g>
        );
      })}
      <g className="lv-node is-live">
        <circle cx={220} cy={310} r={38} />
        <text x={220} y={306} textAnchor="middle" className="svg-label small">RECO</text>
        <text x={220} y={322} textAnchor="middle" className="svg-sub tiny">{t > 6400 ? "ranking ✓" : "network"}</text>
      </g>
      {RANKED.map((r, i) => (
        <g key={r} className="lv-chip" style={rise(eph(t, 6600 + i * 450, 7100 + i * 450))}>
          <rect x={300} y={286 + i * 34} width={220} height={28} rx={8} />
          <text x={314} y={305 + i * 34} className="svg-mono tinytext">{r}</text>
        </g>
      ))}

      <text x={30} y={404} className="svg-note">
        Retrieval, not storage: only what matches the query lights up — and only that feeds the ranking.
      </text>
    </svg>
  );
}

/* ---------- 5 · SEMANTIC PROMPT COMPILER — three streams converge ---------- */

const BRIEF_LINES = [
  "scene: beach · golden hour",
  "pace: 12 cuts / 30 s",
  "music: rising, drop @ 8 s",
  "captions: kinetic, zh+en",
  "params: filmora.transition[7]",
];
const TOKENS = [
  { word: "beach reel", from: 0, at: 2000 },
  { word: "golden hour", from: 1, at: 2700 },
  { word: "12 cuts/30 s", from: 1, at: 3400 },
  { word: "drop @ 8 s", from: 1, at: 4100 },
  { word: "zh+en", from: 0, at: 4800 },
  { word: "transition[7]", from: 2, at: 5500 },
];
const PANES = [
  { label: "USER INTENT", sub: "“beach reel, fast cuts”", y: 40 },
  { label: "TREND CONTEXT", sub: "700+ live signals", y: 160 },
  { label: "PRODUCTION STATE", sub: "timeline: 2 clips placed", y: 280 },
];

function CompilerGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 10000;
  const t = el % L;

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      {PANES.map((p2, i) => (
        <g key={p2.label}>
          <g className={`lv-node ${TOKENS.some((tk) => tk.from === i && t > tk.at && t < tk.at + 700) ? "is-live" : ""}`}>
            <rect x={30} y={p2.y} width={190} height={78} rx={11} />
          </g>
          <text x={46} y={p2.y + 26} className="svg-label small">{p2.label}</text>
          <text x={46} y={p2.y + 48} className="svg-mono tinytext">{p2.sub}</text>
          <circle cx={46} cy={p2.y + 64} r={3} className="lv-pulse" style={{ opacity: 0.3 + 0.7 * pulse(t + i * 300, 900) }} />
        </g>
      ))}

      {/* compiled brief */}
      <g className="lv-box">
        <rect x={340} y={70} width={280} height={220} rx={12} />
        <text x={358} y={98} className="svg-sub">COMPILED INSTRUCTION</text>
        {BRIEF_LINES.map((ln, i) => {
          const landAt = TOKENS[Math.min(i, TOKENS.length - 1)].at + 650;
          return (
            <text key={ln} x={358} y={128 + i * 26} className="svg-mono small" style={rise(eph(t, landAt, landAt + 350), 6)}>
              {ln}
            </text>
          );
        })}
      </g>

      {/* tokens physically flying into the brief */}
      {TOKENS.map((tk) => {
        const p = ph(t, tk.at, tk.at + 650);
        if (p <= 0 || p >= 1) return null;
        const src: [number, number] = [220, PANES[tk.from].y + 39];
        const dst: [number, number] = [358, 122 + Math.min(TOKENS.indexOf(tk), 4) * 26];
        const [x, y] = bez(p, src, [290, (src[1] + dst[1]) / 2 - 30], dst);
        return (
          <g key={tk.word} className="lv-chip" transform={`translate(${q(x)},${q(y)})`}>
            <rect x={-40} y={-11} width={80} height={20} rx={7} />
            <text x={0} y={3} textAnchor="middle" className="svg-mono tinytext">{tk.word}</text>
          </g>
        );
      })}

      {/* determinism check */}
      <g style={rise(eph(t, 7400, 7900), 6)}>
        <text x={358} y={320} className="svg-mono tinytext">recompile with same inputs…</text>
        <text x={358} y={340} className="tick ok" style={{ opacity: eph(t, 8200, 8600) }}>✓ byte-identical brief — deterministic</text>
      </g>

      <text x={30} y={404} className="svg-note">
        What they asked, what the platforms reward, what's on the timeline — bound into one executable brief.
      </text>
    </svg>
  );
}

/* ---------- 6 · ORCHESTRATION — a live Gantt with hand-offs ---------- */

const GANTT = [
  { name: "research", start: 600, end: 2400 },
  { name: "script", start: 2400, end: 4200 },
  { name: "visuals", start: 4200, end: 6600 },
  { name: "music", start: 4400, end: 6200 },
  { name: "captions", start: 6600, end: 8000 },
  { name: "assembly", start: 8000, end: 9600 },
];
const HANDOFFS = [
  { at: 2400, fromRow: 0, toRow: 1 },
  { at: 4200, fromRow: 1, toRow: 2 },
  { at: 4400, fromRow: 1, toRow: 3 },
  { at: 6600, fromRow: 2, toRow: 4 },
  { at: 8000, fromRow: 4, toRow: 5 },
];
const GX = (ms: number) => 150 + (ms - 600) * 0.05;

function OrchestrationGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 11000;
  const t = el % L;
  const clock = Math.max(0, Math.min(9600, t) - 600) / 1000;

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <text x={40} y={40} className="lv-phase small">ONE PRODUCTION RUN · LIVE</text>
      <text x={600} y={40} textAnchor="end" className="lv-counter mid">{clock.toFixed(1)} s</text>

      {GANTT.map((g, i) => {
        const w = Math.max(0, Math.min(g.end, t) - g.start) * 0.05;
        const running = t > g.start && t < g.end;
        return (
          <g key={g.name}>
            <text x={140} y={76 + i * 42} textAnchor="end" className={`svg-mono small ${running ? "" : "dim"}`}>{g.name}</text>
            <rect x={GX(g.start)} y={62 + i * 42} width={q((g.end - g.start) * 0.05)} height={20} rx={6} className="lv-track" />
            {w > 0 && <rect x={GX(g.start)} y={62 + i * 42} width={q(w)} height={20} rx={6} className={`lv-bar ${i % 2 ? "bg" : ""}`} />}
            {running && <circle cx={q(GX(g.start) + w)} cy={72 + i * 42} r={3.6} className="lv-pulse" />}
            {t >= g.end && <text x={q(GX(g.end) + 8)} y={76 + i * 42} className="tick ok">✓</text>}
          </g>
        );
      })}

      {/* hand-off chips physically jumping row to row */}
      {HANDOFFS.map((h) => {
        const p = ph(t, h.at, h.at + 420);
        if (p <= 0 || p >= 1) return null;
        const src: [number, number] = [GX(h.at), 72 + h.fromRow * 42];
        const dst: [number, number] = [GX(h.at), 72 + h.toRow * 42];
        const [x, y] = bez(p, src, [src[0] + 26, (src[1] + dst[1]) / 2], dst);
        return (
          <g key={h.at} className="lv-chip win" transform={`translate(${q(x)},${q(y)})`}>
            <rect x={-30} y={-10} width={60} height={18} rx={6} />
            <text x={0} y={3} textAnchor="middle" className="svg-mono tinytext">hand-off</text>
          </g>
        );
      })}

      {/* orchestrator overhead row — the ≈2% */}
      <text x={140} y={342} textAnchor="end" className="svg-mono small">orchestrator</text>
      {HANDOFFS.map((h) => (
        <rect key={h.at} x={GX(h.at)} y={330} width={9} height={14} rx={3} className="lv-bar warm" style={{ opacity: t > h.at ? 1 : 0.15 }} />
      ))}
      <text x={GX(9600) + 10} y={342} className="svg-sub tiny" style={{ opacity: t > 8200 ? 1 : 0 }}>≈2% of total latency</text>

      <text x={40} y={396} className="svg-note">
        Agents hand off, they don't queue — the orchestrator's own cost is the thin amber slivers, ≈2% of the run.
      </text>
    </svg>
  );
}

/* ---------- 7 · OUTPUT + OBSERVABILITY — playhead scrubs, trace follows ---------- */

const OUT_CLIPS = [92, 128, 84, 140, 96];
const TRACES = [
  ["research.trends", "1.2 s"],
  ["memory.retrieve", "0.3 s"],
  ["compile.prompt", "0.2 s"],
  ["orchestrate.e2e", "≈2% of total"],
];

function OutputGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 9800;
  const t = el % L;
  const totalW = OUT_CLIPS.reduce((s, w) => s + w + 6, -6);
  const head = totalW * eph(t, 600, 5400);
  const cost = Math.round(28 * eph(t, 5800, 8200));

  let acc = 0;
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <text x={40} y={44} className="svg-sub">FINAL TIMELINE · fully editable — the playhead is moving through it</text>
      <g transform="translate(40,56)">
        {OUT_CLIPS.map((w, i) => {
          const x = acc;
          acc += w + 6;
          const litClip = head > x && head < x + w;
          return <rect key={i} x={x} y={0} width={w} height={40} rx={6} className={`lv-bar ${litClip ? "" : "bg"}`} style={{ opacity: litClip ? 1 : 0.5 }} />;
        })}
        <rect x={0} y={48} width={q(totalW)} height={12} rx={5} className="lv-track" />
        <rect x={0} y={48} width={q(head)} height={12} rx={5} className="lv-bar warm" />
        <line x1={q(head)} y1={-6} x2={q(head)} y2={66} className="lv-playhead" />
      </g>

      {/* trace waterfall follows the playhead */}
      <g className="lv-box">
        <rect x={40} y={150} width={330} height={160} rx={12} />
        <text x={58} y={176} className="svg-sub">TRACE · every agent call</text>
        {TRACES.map((r, i) => {
          const at = 1300 + i * 1050;
          if (t < at) return null;
          return (
            <g key={r[0]} style={rise(eph(t, at, at + 300), 6)}>
              <text x={58} y={202 + i * 26} className="svg-mono tinytext">{r[0]}</text>
              <text x={300} y={202 + i * 26} textAnchor="end" className="svg-mono tinytext">{r[1]}</text>
              <text x={352} y={202 + i * 26} textAnchor="end" className="tick ok">✓</text>
            </g>
          );
        })}
      </g>

      {/* API cost drawing itself down 28% */}
      <g className="lv-box">
        <rect x={400} y={150} width={220} height={160} rx={12} />
        <text x={418} y={176} className="svg-sub">API COST · after tracing</text>
        <polyline
          points={[0, 1, 2, 3, 4, 5, 6, 7, 8]
            .filter((i) => i / 8 <= eph(t, 5800, 8200))
            .map((i) => `${q(424 + i * 22)},${q(232 - 0 * i)}`)
            .map((pt, i) => {
              const drop = [0, 1, 2, 5, 9, 14, 20, 25, 28][i] || 0;
              const [x] = pt.split(",");
              return `${x},${q(206 + drop * 2.2)}`;
            })
            .join(" ")}
          className="lv-line"
        />
        <text x={510} y={296} textAnchor="middle" className="lv-counter mid">−{cost}%</text>
      </g>

      <text x={40} y={352} className="svg-note">
        Never a black-box render: the edit lands editable, and the trace that produced it is on screen —
      </text>
      <text x={40} y={370} className="svg-note">
        which is exactly how the runtime's API usage was cut by 28%. You can only optimize what you can see.
      </text>
    </svg>
  );
}

/* ---------- chapter ---------- */

const STEPS: StepDef[] = [
  {
    label: "The runtime",
    sub: "high-level architecture",
    pilotTitle: "One prompt in, one finished edit out",
    pilotBody:
      "You're watching a full production run: the prompt is typed, the runtime log streams as research, memory, and compilation fire, and the timeline assembles itself inside Filmora — clip by clip, still editable. Built during the Wondershare internship.",
    metrics: [
      { k: "input", v: "one prompt" },
      { k: "output", v: "editable edit" },
      { k: "where", v: "Wondershare Filmora" },
    ],
    graphic: (a) => <RuntimeGraphic a={a} />,
  },
  {
    label: "Trend research agent",
    sub: "what works, right now",
    pilotTitle: "Six platforms, streamed into evidence",
    pilotBody:
      "The feeds you see scrolling are the agent's actual working surface — TikTok, Douyin, Xiaohongshu, Instagram, WeChat, Facebook. Each pulse is a signal harvested; the counter climbs as the noise collapses into 700+ deduplicated creative signals per brief.",
    metrics: [
      { k: "platforms", v: "6" },
      { k: "signals per brief", v: "700+" },
      { k: "refresh", v: "continuous" },
    ],
    graphic: (a) => <TrendGraphic a={a} />,
  },
  {
    label: "Skill compilation",
    sub: "signals → skills",
    pilotTitle: "Evidence becomes executable knowledge",
    pilotBody:
      "Watch the compiler write the files: trend playbooks, design rules, Filmora-native parameter presets — line by line, versioned on completion. The agents don't re-learn the platform every run; they execute against durable skills.",
    metrics: [
      { k: "artifacts", v: "skill.md · design.md · params" },
      { k: "reuse", v: "across briefs" },
      { k: "format", v: "editor-native" },
    ],
    graphic: (a) => <SkillGraphic a={a} />,
  },
  {
    label: "Memory + recommendation",
    sub: "retrieval, not storage",
    pilotTitle: "The query lights up only what's relevant",
    pilotBody:
      "The intent is embedded — you can see the vector compute — and probed against the store. Three memories light up with live similarity scores; the rainy-street pack stays dark at 0.22. Only the matches feed the network that ranks assets for this brief.",
    metrics: [
      { k: "lookup", v: "embedding search" },
      { k: "store", v: "skills + context + params" },
      { k: "output", v: "ranked candidates" },
    ],
    graphic: (a) => <MemoryGraphic a={a} />,
  },
  {
    label: "Semantic prompt compiler",
    sub: "three streams, one brief",
    pilotTitle: "Intent, trend, and timeline state converge",
    pilotBody:
      "Tokens fly out of three live sources — what the user asked, what the platforms reward, what's already on the timeline — and slot into one compiled instruction. Then the proof: recompile with the same inputs, get a byte-identical brief. Deterministic enough for software, expressive enough for taste.",
    metrics: [
      { k: "inputs", v: "intent · trends · state" },
      { k: "output", v: "one executable brief" },
      { k: "property", v: "deterministic" },
    ],
    graphic: (a) => <CompilerGraphic a={a} />,
  },
  {
    label: "Multi-agent orchestration",
    sub: "hand-offs, not queues",
    pilotTitle: "Six specialists, one conductor",
    pilotBody:
      "A live Gantt of the run: research feeds script, script splits into visuals and music, captions follow, assembly receives everything editable. The chips jumping between rows are the hand-offs; the thin amber slivers are the orchestrator's entire overhead — ≈2% of the run.",
    metrics: [
      { k: "agents", v: "6 specialists" },
      { k: "pattern", v: "orchestrated hand-off" },
      { k: "overhead", v: "≈2% of total latency" },
    ],
    graphic: (a) => <OrchestrationGraphic a={a} />,
  },
  {
    label: "Output + observability",
    sub: "the receipt",
    pilotTitle: "A finished edit — and the trace that produced it",
    pilotBody:
      "The playhead scrubs the finished timeline while the trace waterfall fills in beneath it — every agent call, timed and checked. That visibility is how API usage was cut by 28%: the cost line draws itself down in front of you.",
    metrics: [
      { k: "API cost", v: "−28%" },
      { k: "orchestration overhead", v: "≈2% of e2e" },
      { k: "result", v: "editable, traced" },
    ],
    graphic: (a) => <OutputGraphic a={a} />,
  },
];

export function FilmoraChapter() {
  return (
    <ChapterShell
      id="filmora"
      accent="#ff8fb2"
      kicker="PROJECT 02 · WONDERSHARE INTERNSHIP"
      title="Filmora Agent Runtime"
      subtitle="A multi-agent media production system — one prompt becomes a finished, editable video edit."
      steps={STEPS}
      stepMs={9800}
    />
  );
}
