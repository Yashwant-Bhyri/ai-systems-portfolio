"use client";

import { useState } from "react";
import { ChapterShell, type StepDef } from "./chapter-shell";
import { useSim, ph, eph, pulse, noise, bez, typed, caret, rise, q, LiveNet } from "./live";

/* Live scenes — every graphic is the runtime actually working. */

const SPIN = ["◐", "◓", "◑", "◒"];
const FILMORA_STEP_MS = 11600;

/* ---------- 1 · THE RUNTIME — one full production run ---------- */

const RUN_LOG = [
  { at: 2400, name: "market.research", ms: "1.2 s", kind: "feed" },
  { at: 3400, name: "memory.retrieve", ms: "0.3 s", kind: "vector" },
  { at: 4100, name: "brief.compile", ms: "0.2 s", kind: "converge" },
  { at: 4800, name: "tool.call · specialists ×6", ms: "3.8 s", kind: "fanout" },
];
const CLIPS = [86, 118, 74, 132, 96];
const CLIP_GAP = 6;
const CLIP_LAYOUT = CLIPS.map((width, index) => ({
  width,
  x: CLIPS.slice(0, index).reduce((sum, clipWidth) => sum + clipWidth + CLIP_GAP, 0),
}));
const CLIP_TRACK_WIDTH = CLIPS.reduce((sum, width) => sum + width, 0) + CLIP_GAP * (CLIPS.length - 1);

/** tiny live operation glyph for a runtime-log row — each stage has its own */
function MicroGlyph({ kind, t, live }: { kind: string; t: number; live: boolean }) {
  const o = live ? 1 : 0.45;
  if (kind === "feed")
    return (
      <g style={{ opacity: o }}>
        {[0, 1, 2].map((j) => (
          <rect key={j} x={0} y={q((((j * 7 - t / 40) % 18) + 18) % 18 - 3)} width={q(11 - j * 2)} height={3} rx={1.5} className="lv-feedbar" />
        ))}
      </g>
    );
  if (kind === "vector")
    return (
      <g style={{ opacity: o }}>
        {[0, 1, 2, 3].map((j) => {
          const hgt = q(4 + 9 * noise(j * 3 + 1, live ? t : 0));
          return <rect key={j} x={j * 5} y={q(13 - hgt)} width={3.4} height={hgt} rx={1.5} className="lv-bar" />;
        })}
      </g>
    );
  if (kind === "converge") {
    const p = live ? (t % 900) / 900 : 0.5;
    return (
      <g style={{ opacity: o }}>
        {[0, 1, 2].map((j) => (
          <circle key={j} cx={q(1 + (14 - 1) * p)} cy={q(1 + j * 6 + (7 - (1 + j * 6)) * p)} r={2} className="lv-pulse" />
        ))}
        <circle cx={16} cy={7} r={2.6} className="lv-hidnode" />
      </g>
    );
  }
  // fanout
  const p2 = live ? (t % 900) / 900 : 0.5;
  return (
    <g style={{ opacity: o }}>
      <circle cx={1} cy={7} r={2.6} className="lv-hidnode" />
      {[0, 1, 2].map((j) => (
        <circle key={j} cx={q(1 + 14 * p2)} cy={q(7 + (j - 1) * 6 * p2)} r={2} className="lv-pulse" />
      ))}
    </g>
  );
}

export function RuntimeGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = FILMORA_STEP_MS;
  const t = el % L;
  const cyc = Math.floor(el / L) % 2;
  const prompt = cyc === 0 ? "cut a 30-second beach travel reel" : "make a 15-second product teaser";
  const ptyped = typed(prompt, t, 300, 2200);
  const ring = eph(t, 2400, 9200);

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
              <g transform={`translate(268,${143 + i * 24})`}>
                <MicroGlyph kind={r.kind} t={t + i * 260} live={!done} />
              </g>
              <text x={352} y={154 + i * 24} textAnchor="end" className="svg-mono tinytext">{done ? r.ms : "…"}</text>
            </g>
          );
        })}
      </g>

      {/* timeline assembling inside the editor */}
      <text x={30} y={296} className="svg-sub">FILMORA TIMELINE · assembling</text>
      <g transform="translate(30,306)">
        {CLIP_LAYOUT.map(({ width, x }, i) => {
          const p = eph(t, 6000 + i * 620, 6500 + i * 620);
          return <rect key={i} x={q(x)} y={0} width={q(width * p)} height={42} rx={6} className="lv-bar" style={{ opacity: 0.35 + 0.65 * p }} />;
        })}
        <rect x={0} y={50} width={q(CLIP_TRACK_WIDTH * eph(t, 8600, 9300))} height={13} rx={5} className="lv-bar warm" />
      </g>
      <g className="lv-stamp" style={rise(eph(t, 9500, 9900), 6)}>
        <rect x={418} y={232} width={202} height={42} rx={9} />
        <text x={519} y={258} textAnchor="middle" className="svg-label small">editable Filmora timeline ✓</text>
      </g>
      <text x={30} y={402} className="svg-note">
        Market context, memory, and specialist tools resolve into an editable Filmora timeline.
      </text>
    </svg>
  );
}

/* ---------- 2 · TREND RESEARCH — feeds scroll, signals harvest ---------- */

const PLATFORMS = ["TikTok", "Douyin", "Xiaohongshu", "Instagram", "WeChat", "Facebook"];
/** brand-evocative badge marks (abstracted logos — recognizable, not trademarks) */
const PLAT_BADGES: { glyph: string; bg: string; fg: string }[] = [
  { glyph: "♪", bg: "#0f0f14", fg: "#7ee9ec" },
  { glyph: "抖", bg: "#16121c", fg: "#ff7188" },
  { glyph: "红", bg: "#ff2e4d", fg: "#ffffff" },
  { glyph: "◎", bg: "#3a1440", fg: "#ff9d66" },
  { glyph: "微", bg: "#0c2f18", fg: "#4fd166" },
  { glyph: "f", bg: "#122a52", fg: "#7aa9ff" },
];

const PLAT_FILES = ["tiktok", "douyin", "xiaohongshu", "instagram", "wechat", "facebook"];

function PlatBadge({ i, x, y, s = 16 }: { i: number; x: number; y: number; s?: number }) {
  const b = PLAT_BADGES[i];
  return (
    <g className="lv-platbadge" transform={`translate(${x},${y})`}>
      <rect width={s} height={s} rx={4.5} fill={b.bg} stroke="rgba(255,255,255,0.22)" strokeWidth={0.8} />
      {/* the real platform mark, downloaded into /public/brands */}
      <image href={`/brands/${PLAT_FILES[i]}.svg`} x={2.5} y={2.5} width={s - 5} height={s - 5} />
    </g>
  );
}

const TREND_MOTIFS = ["device", "macro", "type", "audio", "transition", "palette"];
const TREND_TAGS = ["#launch", "#新品", "#aesthetic", "#creator", "#tech", "#reveal"];

export function TrendGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = FILMORA_STEP_MS;
  const t = el % L;
  const raw = Math.round(723 * eph(t, 600, 7000));
  const activeIdx = Math.floor(t / 1200) % 6;
  const hp = (t % 1200) / 1200;
  // The evidence result takes the stage, then contracts so the research surface
  // becomes inspectable again before the sequence loops.
  const focusIn = eph(t, 7000, 7800);
  const focusOut = eph(t, 9000, 9800);
  const focus = focusIn * (1 - focusOut);
  const expandedLabel = Math.max(0, Math.min(1, (focus - 0.82) / 0.18));
  const boxWidth = 136 + 174 * focus;
  const boxHeight = 46 + 38 * focus;
  const scrolling = t < 7000 || t >= 9800;

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <defs>
        <clipPath id="feedclip">
          <rect x={0} y={0} width={150} height={84} rx={8} />
        </clipPath>
      </defs>
      <g style={{ filter: focus > 0 ? `blur(${q(focus * 4.5)}px)` : undefined, opacity: 1 - focus * 0.62 }}>
        {PLATFORMS.map((p, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const x = 34 + col * 196;
          const y = 34 + row * 148;
          const isActive = scrolling && i === activeIdx;
          return (
            <g key={p}>
              <g className={`lv-node ${isActive ? "is-live" : ""}`}>
                <rect x={x} y={y} width={178} height={126} rx={12} />
              </g>
              <PlatBadge i={i} x={x + 12} y={y + 10} />
              <text x={x + 34} y={y + 23} className="svg-label small">{p}</text>
              {isActive && <text x={x + 164} y={y + 23} textAnchor="end" className="svg-mono tinytext">reading…</text>}
              {/* real trend posters, genuinely scrolling */}
              <g transform={`translate(${x + 14},${y + 32})`} clipPath="url(#feedclip)">
                {[0, 1, 2, 3].map((j) => {
                  const cycleH = 176;
                  const yy = q((((j * 44 - t / 16 - i * 37) % cycleH) + cycleH) % cycleH - 44);
                  const motif = (i + j) % 6;
                  return (
                    <g key={j}>
                      <svg x={0} y={yy} width={26} height={38} viewBox="0 0 120 180">
                        <use href={`/trend-media.svg#${TREND_MOTIFS[motif]}`} />
                      </svg>
                      <rect x={32} y={yy + 8} width={q(70 + noise(i * 7 + j, 0) * 40)} height={8} rx={4} className="lv-feedbar" />
                      <text x={32} y={yy + 30} className="svg-sub tiny">{TREND_TAGS[motif]}</text>
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
      </g>

      {/* The live counter expands into the 700+ evidence result, holds focus,
          then returns to its compact state as the surrounding feeds recover. */}
      <g className={focus > 0.45 ? "lv-stamp big" : "lv-chip"}>
        <rect
          x={q(320 - boxWidth / 2)}
          y={q(201 - boxHeight / 2)}
          width={q(boxWidth)}
          height={q(boxHeight)}
          rx={12 + focus * 3}
        />
        <g style={{ opacity: 1 - expandedLabel }}>
          <text x={320} y={198} textAnchor="middle" className="lv-counter mid">{raw}</text>
          <text x={320} y={215} textAnchor="middle" className="svg-sub">
            {scrolling ? "scoring signals" : "ranked signals"}
          </text>
        </g>
        <g style={{ opacity: expandedLabel }}>
          <text x={320} y={194} textAnchor="middle" className="lv-counter mid">700+ creative signals</text>
          <text x={320} y={216} textAnchor="middle" className="svg-sub">deduplicated · scored · brief-linked</text>
        </g>
      </g>
      {t > 8200 && (
        <g style={rise(eph(t, 8200, 8600), 6)}>
          {["market evidence ✓", "product context ✓", "creative rules ✓"].map((f, i) => (
            <g key={f} className="lv-chip win">
              <rect x={130 + i * 135} y={330} width={125} height={26} rx={8} />
              <text x={192 + i * 135} y={347} textAnchor="middle" className="svg-mono tinytext">{f}</text>
            </g>
          ))}
        </g>
      )}

      <text x={34} y={396} className="svg-note">
        Live market and product signals become ranked evidence for the production plan.
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

const SNIPPETS = ["♪ audio hook", "▶ clip motif", "# tag set"];

export function SkillGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = FILMORA_STEP_MS;
  const t = el % L;
  const scanIdx = Math.floor(t / 1400) % 6;
  const scanP = (t % 1400) / 1400;

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      {/* the six platforms, scanned one by one */}
      <text x={30} y={40} className="svg-sub">MARKET + PRODUCT SIGNALS · compiling reusable execution rules</text>
      {PLATFORMS.map((p, i) => {
        const scanning = i === scanIdx;
        return (
          <g key={p}>
            <g className={`lv-node ${scanning ? "is-live" : ""}`}>
              <rect x={30} y={52 + i * 46} width={150} height={38} rx={9} />
            </g>
            <PlatBadge i={i} x={40} y={62 + i * 46} />
            <text x={64} y={75 + i * 46} className="svg-label small">{p}</text>
            {scanning && (
              <rect x={30} y={q(52 + i * 46 + 34 * scanP)} width={150} height={3} rx={1.5} className="scanline" style={{ opacity: 0.9 }} />
            )}
          </g>
        );
      })}

      {/* extracted famous snippets fly to the compiler */}
      {SNIPPETS.map((s2, j) => {
        const p = ph(scanP, 0.3 + j * 0.2, 0.55 + j * 0.2);
        if (p <= 0 || p >= 1) return null;
        const src: [number, number] = [180, 71 + scanIdx * 46];
        const [px, py] = bez(p, src, [230, (src[1] + 104) / 2], [236, 104]);
        return (
          <g key={s2} className="lv-chip" transform={`translate(${q(px)},${q(py)})`}>
            <rect x={-36} y={-10} width={72} height={20} rx={7} />
            <text x={0} y={4} textAnchor="middle" className="svg-sub tiny">{s2}</text>
          </g>
        );
      })}

      <g className="lv-node is-live">
        <rect x={236} y={72} width={116} height={64} rx={12} />
        <text x={294} y={99} textAnchor="middle" className="svg-label small">SIGNAL</text>
        <text x={294} y={116} textAnchor="middle" className="svg-label small">COMPILER</text>
      </g>
      <circle cx={294} cy={146} r={3.5} className="lv-pulse" style={{ opacity: 0.4 + 0.6 * pulse(t, 600) }} />
      <text x={294} y={166} textAnchor="middle" className="svg-sub">research + product context</text>

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
            {writing && <text x={608} y={y + 22} textAnchor="end" className="svg-sub">writing…</text>}
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
        Ranked evidence compiles into versioned creative rules and Filmora tool parameters.
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
export function MemoryGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = FILMORA_STEP_MS;
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

      {/* recommendation: a live layered net — hits feed it, ranks come out */}
      <text x={30} y={252} className="svg-sub">RETRIEVAL + RECOMMENDATION · live similarity and ranking</text>
      <LiveNet
        x={30}
        y={262}
        w={580}
        h={116}
        inputs={[
          { label: "market ctx", value: "700+" },
          { label: "brief", value: "0.91" },
          { label: "memory hits", value: "×3" },
        ]}
        hidden={5}
        core="RECO"
        outputs={["surf transition", "golden-hour LUT", "beat-sync cuts"]}
        t={t}
        start={5200}
      />
      {t > 7600 && (
        <text x={610} y={252} textAnchor="end" className="tick ok" style={rise(eph(t, 7600, 7950), 4)}>ranked ✓</text>
      )}

      <text x={30} y={404} className="svg-note">
        Retrieval grounds the plan in relevant skills, product context, and editor presets.
      </text>
    </svg>
  );
}

/* ---------- 5 · SEMANTIC PROMPT COMPILER — four contexts converge ---------- */

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
  { word: "beat-sync skill", from: 2, at: 3400 },
  { word: "drop @ 8 s", from: 1, at: 4100 },
  { word: "LUT preset", from: 2, at: 4800 },
  { word: "transition[7]", from: 3, at: 5500 },
];
const PANES = [
  { label: "PRODUCT BRIEF", sub: "beach reel · campaign goal", y: 34 },
  { label: "MARKET EVIDENCE", sub: "700+ scored creative signals", y: 124 },
  { label: "RETRIEVED MEMORY", sub: "3 skills · 2 presets", y: 214 },
  { label: "TIMELINE STATE", sub: "2 clips · tools ready", y: 304 },
];

export function CompilerGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = FILMORA_STEP_MS;
  const t = el % L;

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      {PANES.map((p2, i) => (
        <g key={p2.label}>
          <g className={`lv-node ${TOKENS.some((tk) => tk.from === i && t > tk.at && t < tk.at + 700) ? "is-live" : ""}`}>
            <rect x={30} y={p2.y} width={190} height={72} rx={11} />
          </g>
          <text x={46} y={p2.y + 26} className="svg-label small">{p2.label}</text>
          <text x={46} y={p2.y + 48} className="svg-mono tinytext">{p2.sub}</text>
          <circle cx={46} cy={p2.y + 58} r={3} className="lv-pulse" style={{ opacity: 0.3 + 0.7 * pulse(t + i * 300, 900) }} />
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
        const tokenWidth = Math.max(80, tk.word.length * 6.2 + 18);
        return (
          <g key={tk.word} className="lv-chip" transform={`translate(${q(x)},${q(y)})`}>
            <rect x={q(-tokenWidth / 2)} y={-11} width={q(tokenWidth)} height={20} rx={7} />
            <text x={0} y={3} textAnchor="middle" className="svg-mono tinytext">{tk.word}</text>
          </g>
        );
      })}

      {/* determinism check */}
      <g style={rise(eph(t, 7400, 7900), 6)}>
        <text x={358} y={320} className="svg-mono tinytext">validate compile fingerprint…</text>
        <text x={358} y={340} className="tick ok" style={{ opacity: eph(t, 8200, 8600) }}>✓ stable plan for identical inputs</text>
      </g>

      <text x={30} y={404} className="svg-note">
        Brief, market evidence, memory, and timeline state compile into one tool-ready plan.
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

export function OrchestrationGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = FILMORA_STEP_MS;
  const t = el % L;
  const clock = Math.max(0, Math.min(9600, t) - 600) / 1000;

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <text x={40} y={40} className="lv-phase small">MODEL-ROUTED AGENT RUN · REPRESENTATIVE REPLAY</text>
      <text x={600} y={40} textAnchor="end" className="lv-counter mid">trace +{clock.toFixed(1)} s</text>

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
            <text x={0} y={3} textAnchor="middle" className="svg-mono tinytext">tool result</text>
          </g>
        );
      })}

      {/* governed checkpoints remain visible beneath the specialist lanes */}
      <text x={140} y={342} textAnchor="end" className="svg-mono small">guardrail gates</text>
      {HANDOFFS.map((h) => (
        <rect key={h.at} x={GX(h.at)} y={330} width={9} height={14} rx={3} className="lv-bar warm" style={{ opacity: t > h.at ? 1 : 0.15 }} />
      ))}
      <text x={600} y={362} textAnchor="end" className="svg-sub" style={{ opacity: t > 8200 ? 1 : 0 }}>schema · safety · retry</text>

      <text x={40} y={396} className="svg-note">
        The router runs tools in parallel; traced guardrails validate each handoff.
      </text>
    </svg>
  );
}

/* ---------- 6.5 · EDITOR TIMELINE — tracks assemble, still editable ---------- */

/** The real production DAG: nodes, dependencies, live execution, inspectable. */
type DagNode = {
  id: string; label: string; x: number; y: number;
  api: string; file: string; ms: string; start: number; dur: number; deps: string[]; async?: boolean;
};
const DAG: DagNode[] = [
  { id: "brief", label: "BRIEF", x: 48, y: 150, api: "intent parser", file: "brief.json", ms: "0.2 s", start: 300, dur: 500, deps: [] },
  { id: "planner", label: "PLANNER", x: 134, y: 150, api: "model router + tools", file: "prod.graph", ms: "0.4 s", start: 900, dur: 600, deps: ["brief"] },
  { id: "script", label: "SCRIPT", x: 222, y: 60, api: "script agent", file: "script.md", ms: "1.1 s", start: 1600, dur: 900, deps: ["planner"] },
  { id: "music", label: "MUSIC", x: 222, y: 150, api: "AI Music", file: "music.wav", ms: "4.1 s", start: 1600, dur: 2600, deps: ["planner"], async: true },
  { id: "dialogue", label: "DIALOGUE", x: 222, y: 240, api: "TTS API", file: "dialogue.wav", ms: "1.8 s", start: 1600, dur: 1300, deps: ["planner"], async: true },
  { id: "storyboard", label: "STORYBOARD", x: 310, y: 60, api: "storyboard agent", file: "frames.json", ms: "0.9 s", start: 2600, dur: 900, deps: ["script"] },
  { id: "captions", label: "CAPTIONS", x: 310, y: 240, api: "caption agent", file: "captions.srt", ms: "0.9 s", start: 3000, dur: 900, deps: ["dialogue"] },
  { id: "video", label: "VIDEO", x: 398, y: 60, api: "Video API", file: "video.mp4", ms: "6.2 s", start: 3600, dur: 2300, deps: ["storyboard"], async: true },
  { id: "fx", label: "FX / TRANS", x: 398, y: 150, api: "FX agent", file: "effects.json", ms: "0.6 s", start: 4300, dur: 900, deps: ["music", "video"] },
  { id: "qa", label: "QA · EVAL", x: 486, y: 105, api: "guardrail + eval", file: "qa.report", ms: "0.8 s", start: 6000, dur: 900, deps: ["video", "fx"] },
  { id: "human", label: "HUMAN GATE", x: 486, y: 195, api: "approval gate", file: "approved ✓", ms: "—", start: 7000, dur: 800, deps: ["qa", "captions"] },
  { id: "assembly", label: "ASSEMBLY", x: 574, y: 150, api: "editor agent", file: "timeline.proj", ms: "1.2 s", start: 7900, dur: 1200, deps: ["human"] },
];

export function EditorGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = FILMORA_STEP_MS;
  const t = el % L;
  const [focus, setFocus] = useState<string | null>(null);
  const node = (id: string) => DAG.find((n) => n.id === id)!;
  const stateOf = (n: DagNode) => (t < n.start ? "wait" : t < n.start + n.dur ? "run" : "done");
  const focused = focus ? node(focus) : DAG.find((n) => stateOf(n) === "run") ?? DAG[DAG.length - 1];

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <text x={30} y={32} className="svg-sub">MULTIMODAL TOOL GRAPH · MODEL-ROUTED RUN — select a node to inspect</text>

      {/* dependency edges, tokens travelling on the active ones */}
      {DAG.flatMap((n) =>
        n.deps.map((d) => {
          const a2 = node(d);
          const running = stateOf(n) === "run" || (stateOf(a2) === "done" && stateOf(n) === "wait" && t > a2.start + a2.dur - 300);
          const p = stateOf(n) === "run" ? ((t - n.start) % 600) / 600 : 0;
          return (
            <g key={`${d}-${n.id}`}>
              <path d={`M ${a2.x + 42} ${a2.y} C ${(a2.x + n.x) / 2 + 16} ${a2.y} ${(a2.x + n.x) / 2 - 16} ${n.y} ${n.x - 42} ${n.y}`} className={`lv-edge ${running ? "win" : ""}`} style={{ opacity: running ? 0.8 : 0.25 }} />
              {p > 0 && <circle cx={q(bez(p, [a2.x + 42, a2.y], [(a2.x + n.x) / 2, (a2.y + n.y) / 2], [n.x - 42, n.y])[0])} cy={q(bez(p, [a2.x + 42, a2.y], [(a2.x + n.x) / 2, (a2.y + n.y) / 2], [n.x - 42, n.y])[1])} r={3.4} className="lv-pulse" />}
            </g>
          );
        }),
      )}

      {/* nodes */}
      {DAG.map((n) => {
        const st = stateOf(n);
        const isFocus = focused.id === n.id;
        return (
          <g
            key={n.id}
            role="button"
            tabIndex={0}
            aria-label={`Inspect ${n.label} node`}
            onClick={() => setFocus(n.id)}
            onFocus={() => setFocus(n.id)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              setFocus(n.id);
            }}
            style={{ cursor: "pointer" }}
          >
            <g className={`lv-node ${st === "run" || isFocus ? "is-live" : ""}`}>
              <rect x={n.x - 42} y={n.y - 20} width={84} height={40} rx={9} style={{ opacity: st === "wait" ? 0.5 : 1 }} />
            </g>
            <text x={n.x} y={n.y - 2} textAnchor="middle" className="svg-sub" style={{ fill: "var(--text-hi)" }}>{n.label}</text>
            <text x={n.x} y={n.y + 13} textAnchor="middle" className={st === "done" ? "tick ok" : "svg-sub"}>
              {st === "done" ? "✓ " + n.ms : st === "run" ? (n.async ? "async…" : "running…") : "queued"}
            </text>
            {st === "run" && <rect x={n.x - 36} y={n.y + 17} width={q(72 * ((t - n.start) / n.dur))} height={3} rx={1.5} className="lv-bar" />}
          </g>
        );
      })}

      {/* inspector card for the focused / running node */}
      <g className="lv-box hot">
        <rect x={30} y={300} width={580} height={72} rx={12} />
        <text x={48} y={324} className="svg-sub">TOOL-CALL INSPECTOR · {focused.label}</text>
        <text x={48} y={346} className="svg-mono tinytext">api: {focused.api}</text>
        <text x={250} y={346} className="svg-mono tinytext">out: {focused.file}</text>
        <text x={470} y={346} className="svg-mono tinytext">latency: {focused.ms}</text>
        <text x={48} y={362} className="svg-sub">
          deps: {focused.deps.length ? focused.deps.join(" + ") : "none"} · {focused.async ? "async lane" : "sync"} · retries: 0
        </text>
      </g>

      <text x={30} y={400} className="svg-note">
        Video, audio, dialogue, captions, and effects converge behind a human approval gate.
      </text>
    </svg>
  );
}

/* ---------- 7 · OUTPUT + OBSERVABILITY — playhead scrubs, trace follows ---------- */

/** the optimization loop, as stations on an orbit */
const LOOP_STATIONS = [
  { name: "ROUTE + COST TRACE", sub: "model, token, tool spans", work: "tracing route cost…" },
  { name: "OUTPUT EVALUATION", sub: "creative + factual scores", work: "scoring outputs…" },
  { name: "RL REFINEMENT", sub: "reinforcement-learning", work: "ranking policy updates…" },
  { name: "GUARDRAIL TESTS", sub: "safety + regression suite", work: "replaying guardrails…" },
  { name: "HUMAN APPROVAL", sub: "review before release", work: "reviewing candidate…" },
  { name: "MODEL GATEWAY", sub: "versioned route config", work: "shipping v-next…" },
];

export function OutputGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const STATION_MS = FILMORA_STEP_MS / LOOP_STATIONS.length;
  const lap = LOOP_STATIONS.length * STATION_MS; // one optimization cycle
  const t = el % lap;
  const cycle = Math.floor(el / lap);
  const stIdx = Math.floor(t / STATION_MS) % LOOP_STATIONS.length;
  const stP = (t % STATION_MS) / STATION_MS;
  const cx = 320;
  const cy = 188;
  const rx = 240;
  const ry = 96;
  const ang = (i: number) => (i / LOOP_STATIONS.length) * Math.PI * 2 - Math.PI / 2;
  // the packet orbits continuously, station to station
  const pAng = ang(stIdx) + (ang(stIdx + 1) - ang(stIdx)) * stP;
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <text x={40} y={34} className="lv-phase small">OBSERVABILITY + GOVERNED RL REFINEMENT</text>
      <text x={600} y={34} textAnchor="end" className="svg-mono tinytext">cycle #{cycle + 1}</text>

      {/* orbit */}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} className="lv-ring track" />
      <circle cx={q(cx + rx * Math.cos(pAng))} cy={q(cy + ry * Math.sin(pAng))} r={5.5} className="lv-pulse" />

      {/* stations — each does visible work when the packet arrives */}
      {LOOP_STATIONS.map((st, i) => {
        const sx = cx + rx * Math.cos(ang(i));
        const sy = cy + ry * Math.sin(ang(i));
        const activeSt = i === stIdx;
        return (
          <g key={st.name}>
            <g className={`lv-node ${activeSt ? "is-live" : ""}`}>
              <rect x={q(sx - 80)} y={q(sy - 24)} width={160} height={48} rx={10} />
            </g>
            <text x={q(sx)} y={q(sy - 6)} textAnchor="middle" className="svg-label small">{st.name}</text>
            <text x={q(sx)} y={q(sy + 12)} textAnchor="middle" className="svg-sub">
              {activeSt ? st.work : st.sub}
            </text>
            {activeSt && (
              <rect x={q(sx - 68)} y={q(sy + 17)} width={q(136 * stP)} height={3} rx={1.5} className="lv-bar" />
            )}
          </g>
        );
      })}

      {/* center: what one governed lap produces */}
      <text x={cx} y={cy - 8} textAnchor="middle" className="svg-sub">trace → evaluate → RL update</text>
      <text x={cx} y={cy + 8} textAnchor="middle" className="svg-sub">guardrail → approve → version</text>

      {/* operational evidence remains visible without implying unsupported gains */}
      {[
        { k: "ROUTE COST", v: "traced", s: "model · token · tool" },
        { k: "LATENCY", v: "spans", s: "agent · route · API" },
        { k: "RELEASE", v: "gated", s: "eval · guardrail · human" },
      ].map((m, i) => (
        <g key={m.k} className="lv-chip win">
          <rect x={40 + i * 196} y={324} width={184} height={56} rx={10} />
          <text x={56 + i * 196} y={344} className="svg-sub">{m.k}</text>
          <text x={56 + i * 196} y={366} className="lv-counter mid">{m.v}</text>
          <text x={218 + i * 196} y={376} textAnchor="end" className="svg-sub">{m.s}</text>
        </g>
      ))}

      <text x={40} y={404} className="svg-note">
        Evaluation drives RL refinement; guardrails and human approval gate each release.
      </text>
    </svg>
  );
}

/* ---------- chapter ---------- */

const STEPS: StepDef[] = [
  {
    label: "The runtime",
    sub: "high-level architecture",
    pilotTitle: "One product brief becomes an editable Filmora timeline",
    pilotBody:
      "Built during the Wondershare internship, this end-to-end system integrates market research, product intelligence, retrieval, multimodal planning, and specialist tool calls into Filmora Enterprise. The output remains editable in the native timeline.",
    metrics: [
      { k: "input", v: "product brief" },
      { k: "output", v: "editable timeline" },
      { k: "integration", v: "Filmora Enterprise" },
    ],
    graphic: (a) => <RuntimeGraphic a={a} />,
  },
  {
    label: "Market + product intelligence",
    sub: "live research → ranked evidence",
    pilotTitle: "Live market research becomes product intelligence",
    pilotBody:
      "Research spans six live content surfaces. Creative patterns are deduplicated, scored against the product brief, and consolidated into a 700+ signal evidence set that the planning system can use.",
    metrics: [
      { k: "research surfaces", v: "6" },
      { k: "ranked signals", v: "700+" },
      { k: "output", v: "brief-linked evidence" },
    ],
    graphic: (a) => <TrendGraphic a={a} />,
  },
  {
    label: "Skill compilation",
    sub: "evidence → execution rules",
    pilotTitle: "Evidence compiles into reusable production skills",
    pilotBody:
      "The compiler converts ranked evidence into versioned creative rules, reusable retrieval assets, and Filmora-native parameter files. Agents can execute against stable production knowledge instead of rebuilding context for every brief.",
    metrics: [
      { k: "artifacts", v: "skills · rules · parameters" },
      { k: "lifecycle", v: "versioned + reusable" },
      { k: "target", v: "Filmora tool calls" },
    ],
    graphic: (a) => <SkillGraphic a={a} />,
  },
  {
    label: "Memory + recommendation",
    sub: "grounded retrieval + ranking",
    pilotTitle: "Retrieval grounds each production decision",
    pilotBody:
      "The product brief is embedded and matched against creative skills, product context, and editor presets. Only relevant memories feed the recommendation network, which ranks candidate assets and parameters for the current plan.",
    metrics: [
      { k: "retrieval", v: "embedding similarity" },
      { k: "memory", v: "skills · context · presets" },
      { k: "decision", v: "ranked candidates" },
    ],
    graphic: (a) => <MemoryGraphic a={a} />,
  },
  {
    label: "Semantic prompt compiler",
    sub: "four contexts → one plan",
    pilotTitle: "Four contexts compile into one tool-ready plan",
    pilotBody:
      "Product intent, market evidence, retrieved memory, and live timeline state converge in a semantic compiler. It emits a structured production plan with stable instructions and parameters for downstream agent tools.",
    metrics: [
      { k: "contexts", v: "brief · market · memory · state" },
      { k: "output", v: "tool-ready plan" },
      { k: "validation", v: "stable compile fingerprint" },
    ],
    graphic: (a) => <CompilerGraphic a={a} />,
  },
  {
    label: "Multi-agent orchestration",
    sub: "model routing + governed handoffs",
    pilotTitle: "A routed agent graph executes the plan",
    pilotBody:
      "A model router dispatches six specialist agents through typed function and tool calls for script, visuals, music, dialogue, captions, and assembly. Results pass traced schema, safety, and retry gates before the next dependency can run.",
    metrics: [
      { k: "agents", v: "6 specialists" },
      { k: "execution", v: "parallel + dependency-aware" },
      { k: "governance", v: "guardrails + retries" },
    ],
    graphic: (a) => <OrchestrationGraphic a={a} />,
  },
  {
    label: "Output + observability",
    sub: "trace → evaluate → govern",
    pilotTitle: "Every release is traced, evaluated, and governed",
    pilotBody:
      "Span-level telemetry attributes model routes, token and tool cost, and latency across the graph. Output evaluation drives reinforcement-learning refinement; regression tests, guardrails, and human approval gate each version before release.",
    metrics: [
      { k: "observability", v: "route · cost · latency" },
      { k: "refinement", v: "evaluation + RL" },
      { k: "release", v: "guardrailed + human-gated" },
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
      title="Filmora Multimodal Agent Runtime"
      subtitle="An end-to-end multimodal AI production system combining live market research, product intelligence, memory, and agent-planned tool execution — integrated into Filmora Enterprise."
      steps={STEPS}
      stepMs={FILMORA_STEP_MS}
    />
  );
}
