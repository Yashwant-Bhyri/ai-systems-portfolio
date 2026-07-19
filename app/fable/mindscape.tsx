"use client";

import { ChapterShell, type StepDef } from "./chapter-shell";
import { useSim, ph, eph, pulse, noise, bez, typed, caret, rise, Wave, LiveNet, q } from "./live";

/* Live scenes — a session actually flowing through the clinical pipeline.
   Best-of-both merge (D7): V2's domain depth, rendered as live operations. */

/* ---------- 1 · THE PIPELINE — a session traverses; an ungrounded claim is blocked ---------- */

const STAGES = ["CAPTURE", "PERCEIVE", "FUSE", "RETRIEVE", "REASON", "VALIDATE", "REVIEW"];

export function PipelineGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 10400;
  const t = el % L;
  const y = 176;
  const stageX = (i: number) => 24 + i * 86 + 36;

  const seg = Math.min(6, Math.floor(Math.max(0, t - 600) / 1000));
  const segP = seg >= 6 ? 1 : ph(t, 600 + seg * 1000, 600 + seg * 1000 + 1000);
  const mainX = seg >= 6 ? stageX(6) : stageX(seg) + (stageX(seg + 1) - stageX(seg)) * segP;
  const active = Math.min(6, seg + (segP > 0.5 ? 1 : 0));

  const sSeg = Math.min(5, Math.floor(Math.max(0, t - 2200) / 1000));
  const sP = ph(t, 2200 + sSeg * 1000, 3200 + sSeg * 1000);
  const blocked = t > 2200 + 5 * 1000 - 400 && sSeg >= 4;
  const sX = blocked ? stageX(5) - 18 : stageX(sSeg) + (stageX(sSeg + 1) - stageX(sSeg)) * sP;
  const dropP = eph(t, 7000, 7700);

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <text x={24} y={120} className="svg-sub">SESSION AUDIO · TEXT · CHECK-INS</text>
      <text x={616} y={120} textAnchor="end" className="svg-sub">CLINICIAN HANDOFF</text>

      {STAGES.map((s, i) => {
        const isActive = t > 600 && i === active && t < 7600;
        return (
          <g key={s}>
            {i > 0 && <line x1={stageX(i - 1) + 36} y1={y + 24} x2={stageX(i) - 36} y2={y + 24} className="lv-edge" style={{ opacity: 0.35 }} />}
            <g className={`lv-node ${isActive ? "is-live" : ""}`}>
              <rect x={24 + i * 86} y={isActive ? y - 6 : y} width={72} height={isActive ? 60 : 48} rx={9} />
            </g>
            <text x={stageX(i)} y={y + 28} textAnchor="middle" className="svg-label small">{s}</text>
            {isActive && [0, 1, 2].map((d) => (
              <circle key={d} cx={q(stageX(i) - 14 + d * 14)} cy={y + 44} r={2.6} className="lv-pulse" style={{ opacity: 0.25 + 0.75 * pulse(t + d * 220, 660) }} />
            ))}
          </g>
        );
      })}

      {t > 600 && t < 8400 && <circle cx={q(mainX)} cy={y - 18} r={6} className="lv-pulse" />}
      {t > 600 && t < 8400 && <text x={q(mainX)} y={y - 32} textAnchor="middle" className="svg-sub tiny">session</text>}
      {t >= 8400 && (
        <g className="lv-stamp" style={rise(eph(t, 8400, 8800), 6)}>
          <rect x={470} y={252} width={150} height={38} rx={9} />
          <text x={545} y={276} textAnchor="middle" className="svg-label small">validated ✓</text>
        </g>
      )}

      {t > 2200 && dropP < 1 && (
        <g style={{ opacity: 1 - dropP }}>
          <circle cx={q(sX)} cy={q(y + 66 + dropP * 60)} r={5} className="lv-pulse bad" />
          <text x={q(sX)} y={q(y + 84 + dropP * 60)} textAnchor="middle" className="svg-sub tiny">{blocked ? "ungrounded claim" : "draft claim"}</text>
        </g>
      )}
      {blocked && dropP < 1 && (
        <text x={stageX(5)} y={y + 110} textAnchor="middle" className="tick bad" style={rise(eph(t, 6600, 7000), 4)}>✗ blocked at the gate</text>
      )}

      <text x={24} y={356} className="svg-note">
        Watch two travelers: the validated session reaches the clinician; the ungrounded claim is stopped
      </text>
      <text x={24} y={374} className="svg-note">
        at the gate and never crosses. Seven stages, in order, every time.
      </text>
    </svg>
  );
}

/* ---------- 2 · CAPTURE — WebRTC audio in a rolling buffer, packets shipping ---------- */

export function CaptureGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 8800;
  const t = el % L;
  const k = Math.floor(el / 1100); // lifetime packet counter
  const flyP = (el % 1100) / 1100;

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <g className="lv-node is-live">
        <rect x={30} y={40} width={168} height={78} rx={12} />
        <text x={114} y={68} textAnchor="middle" className="svg-label small">SIMULATED SESSION</text>
        <text x={114} y={86} textAnchor="middle" className="svg-mono tinytext">WebRTC audio</text>
        <text x={114} y={102} textAnchor="middle" className="svg-sub tiny">16 kHz mono</text>
      </g>
      <circle cx={48} cy={58} r={4} className="lv-pulse bad" style={{ opacity: 0.4 + 0.6 * pulse(t, 900) }} />

      {/* rolling buffer — the wave IS the last second of audio */}
      <g className="lv-box hot">
        <rect x={30} y={140} width={580} height={110} rx={12} />
        <text x={48} y={164} className="svg-sub">ROLLING BUFFER · last 1000 ms, always live</text>
        <Wave x={48} y={172} w={520} h={48} bars={42} t={t} on={1} />
        {["−1000", "−750", "−500", "−250", "NOW"].map((m2, i) => (
          <text key={m2} x={48 + i * 130} y={242} className="svg-sub tiny">{m2}{i < 4 ? " ms" : ""}</text>
        ))}
        <line x1={568} y1={168} x2={568} y2={224} className="lv-playhead" style={{ opacity: 0.5 + 0.5 * pulse(t, 700) }} />
      </g>

      {/* packets shipping downstream every ~1.1 s */}
      {flyP < 1 && (
        <g className="lv-chip" transform={`translate(${q(bez(flyP, [568, 196], [560, 290], [402, 310])[0])},${q(bez(flyP, [568, 196], [560, 290], [402, 310])[1])})`}>
          <rect x={-26} y={-11} width={52} height={22} rx={7} />
          <text x={0} y={4} textAnchor="middle" className="svg-mono tinytext">A-{184 + (k % 600)}</text>
        </g>
      )}
      {[1, 2, 3].map((j) => {
        const idx = k - j;
        if (idx < 0) return null;
        return (
          <g key={j} className="lv-chip" style={{ opacity: 1 - j * 0.25 }}>
            <rect x={376 - j * 62} y={299} width={52} height={22} rx={7} />
            <text x={402 - j * 62} y={314} textAnchor="middle" className="svg-mono tinytext">A-{184 + (idx % 600)}</text>
          </g>
        );
      })}
      <text x={30} y={314} className="svg-sub tiny">→ perception</text>

      <text x={30} y={380} className="svg-note">
        Nothing waits for the session to end — audio ships downstream in one-second packets while the patient is still talking.
      </text>
    </svg>
  );
}

/* ---------- 3 · PERCEIVE — one voice splits into three live channels ---------- */

const EVENT_TOKENS = [
  { tok: "<silence>", at: 1600 },
  { tok: "<breath>", at: 3600 },
  { tok: "<sigh>", at: 5800 },
];

export function PerceiveGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 9600;
  const t = el % L;
  // affect point drifts toward low valence / rising arousal over the loop
  const drift = eph(t, 1000, 8600);
  const ax = 70 - 34 * drift + 7 * Math.sin(t / 700);
  const ay = 62 - 30 * drift + 6 * Math.cos(t / 900);

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <text x={40} y={40} className="svg-sub">SYNCHRONIZED AUDIO · one stream, three perceptions</text>
      <Wave x={40} y={50} w={250} h={30} bars={26} t={t} on={t % 3400 < 2500 ? 1 : 0.1} />

      {/* branch edges firing */}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M 290 65 C 340 65 ${120 + i * 190} 90 ${130 + i * 190} 112`} className="lv-edge" style={{ opacity: 0.25 + 0.5 * pulse(t + i * 380, 1150) }} />
      ))}

      {/* linguistic */}
      <g className="lv-box">
        <rect x={40} y={112} width={180} height={166} rx={11} />
        <text x={54} y={136} className="svg-sub tiny">LINGUISTIC</text>
        <text x={54} y={162} className="svg-mono tinytext">“{typed("I haven't slept", t, 900, 2400)}</text>
        <text x={54} y={180} className="svg-mono tinytext">{typed("well since the", t, 2400, 3900)}</text>
        <text x={54} y={198} className="svg-mono tinytext">{typed("move…”", t, 3900, 4900)}{t > 900 && t < 5100 ? caret(t) : ""}</text>
        <text x={54} y={262} className="svg-sub tiny">transcript embeddings</text>
      </g>

      {/* event tokens */}
      <g className="lv-box">
        <rect x={230} y={112} width={180} height={166} rx={11} />
        <text x={244} y={136} className="svg-sub tiny">EVENT TOKENS</text>
        {EVENT_TOKENS.map((e2, i) => {
          const p = eph(t, e2.at, e2.at + 400);
          return (
            <g key={e2.tok} style={rise(p, 8)}>
              <g className={`lv-chip ${t > e2.at && t < e2.at + 1100 ? "win" : ""}`}>
                <rect x={244} y={148 + i * 34} width={94} height={26} rx={8} />
                <text x={291} y={165 + i * 34} textAnchor="middle" className="svg-mono tinytext">{e2.tok}</text>
              </g>
            </g>
          );
        })}
        <text x={244} y={262} className="svg-sub tiny">SenseVoice events</text>
      </g>

      {/* acoustic affect — live point on the valence/arousal plane */}
      <g className="lv-box">
        <rect x={420} y={112} width={180} height={166} rx={11} />
        <text x={434} y={136} className="svg-sub tiny">ACOUSTIC AFFECT</text>
        <g transform="translate(450,148)">
          <rect x={0} y={0} width={124} height={92} rx={6} className="lv-track" />
          <line x1={62} y1={0} x2={62} y2={92} className="lv-tick" style={{ opacity: 0.4 }} />
          <line x1={0} y1={46} x2={124} y2={46} className="lv-tick" style={{ opacity: 0.4 }} />
          {/* ghost trail */}
          {[4, 3, 2, 1].map((g2) => {
            const td = t - g2 * 260;
            const dr = eph(td, 1000, 8600);
            return <circle key={g2} cx={q(70 - 34 * dr + 7 * Math.sin(td / 700))} cy={q(62 - 30 * dr + 6 * Math.cos(td / 900))} r={2.4} className="lv-pulse" style={{ opacity: 0.12 * (5 - g2) }} />;
          })}
          <circle cx={q(ax)} cy={q(ay)} r={4.4} className="lv-pulse" />
          <text x={4} y={88} className="svg-sub tiny">valence →</text>
          <text x={4} y={12} className="svg-sub tiny">arousal ↑</text>
        </g>
        <text x={434} y={262} className="svg-sub tiny">Emotion2Vec+ space</text>
      </g>

      <text x={40} y={320} className="svg-sub" style={{ opacity: eph(t, 8600, 9100) }}>alignment tick ✓ — three channels, one clock → fusion</text>
      <text x={40} y={380} className="svg-note">
        What was said, how it was said, and what the voice betrayed — split live, timestamped together.
      </text>
    </svg>
  );
}

/* ---------- 4 · FUSE — gated multimodal net → Behavioral State Vector ---------- */

export function FuseGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 9200;
  const t = el % L;

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <text x={30} y={40} className="svg-sub">GATED MULTIMODAL FUSION · edges firing layer to layer</text>
      <LiveNet
        x={30}
        y={54}
        w={580}
        h={168}
        inputs={[
          { label: "text", value: "768d" },
          { label: "events", value: "sparse" },
          { label: "affect", value: "1024d" },
          { label: "longitudinal", value: "state" },
        ]}
        hidden={6}
        core="GMU"
        outputs={["BSV"]}
        t={t}
        start={600}
      />

      {/* the BSV, updating live */}
      <g className="lv-box hot">
        <rect x={30} y={252} width={580} height={104} rx={12} />
        <text x={48} y={278} className="svg-sub">BEHAVIORAL STATE VECTOR · one reusable patient-state representation</text>
        {Array.from({ length: 18 }).map((_, i) => {
          const v = 0.2 + 0.7 * noise(i * 2 + 1, t / 2.4);
          const settled = t > 2800;
          return (
            <rect
              key={i}
              x={48 + i * 30}
              y={q(340 - 50 * v)}
              width={18}
              height={q(50 * v + 4)}
              rx={3}
              className="lv-bar"
              style={{ opacity: settled ? 0.9 : 0.25 + 0.65 * eph(t, 1400 + i * 80, 2000 + i * 80) }}
            />
          );
        })}
      </g>

      <text x={30} y={392} className="svg-note">
        A shaky voice, a missed check-in, and last month's baseline fuse into one vector — the state every later stage reasons over.
      </text>
    </svg>
  );
}

/* ---------- 5 · RETRIEVE — HNSW scatter + BM25 bars race, RRF, rerank ---------- */

const HNSW_PTS: [number, number][] = [
  [24, 30], [58, 18], [92, 44], [130, 26], [40, 66], [78, 78], [116, 62], [150, 80],
  [30, 104], [66, 112], [104, 96], [142, 118], [20, 138], [56, 146], [96, 132], [138, 148],
];
const HNSW_HITS = [2, 7, 10];
const BM25_ROWS: [string, number][] = [["“sleep disruption”", 88], ["“anxiety episode”", 73], ["check-in log terms", 61], ["note 2026-05-12", 48], ["clinic intake", 39]];
const MERGED = ["DSM-5 §300.02 GAD", "“sleep disruption”", "session 11, turn 8", "check-in log terms", "affect baseline"];

export function RetrievalGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 11000;
  const t = el % L;
  const qtext = typed("sleep disruption + affect change", t, 200, 1300);
  const probeR = 90 * eph(t, 1600, 3400);
  const mergeP = eph(t, 5000, 6200);
  const scanStart = 6600;
  const scanRow = Math.min(4, Math.floor(Math.max(0, t - scanStart) / 480));

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <g className="lv-box hot">
        <rect x={30} y={24} width={330} height={44} rx={10} />
        <text x={44} y={42} className="svg-sub">QUERY STATE · BSV + transcript</text>
        <text x={44} y={59} className="svg-mono tinytext">“{qtext}{t < 1400 ? caret(t) : ""}”</text>
      </g>

      {/* DENSE lane: HNSW neighborhood, probe expanding, hits lighting */}
      <g style={{ opacity: mergeP > 0 ? Math.max(0.3, 1 - mergeP) : 1 }}>
        <text x={30} y={96} className="svg-sub tiny">DENSE · MedCPT over HNSW/Faiss</text>
        <g transform="translate(36,106)">
          <rect x={0} y={0} width={172} height={162} rx={10} className="lv-track" />
          {probeR > 0 && probeR < 90 && <circle cx={86} cy={82} r={q(probeR)} className="lv-ripple" />}
          {HNSW_PTS.map(([px, py], i) => {
            const isHit = HNSW_HITS.includes(i);
            const litAt = 2000 + HNSW_HITS.indexOf(i) * 500;
            const lit = isHit && t > litAt;
            return (
              <g key={i}>
                <circle cx={px + 8} cy={py} r={lit ? 4.4 : 2.6} className={lit ? "lv-pulse" : "lv-hidnode"} style={{ opacity: lit ? 1 : 0.5 }} />
                {lit && <text x={px + 16} y={py + 4} className="svg-sub tiny">{[0.92, 0.85, 0.77][HNSW_HITS.indexOf(i)].toFixed(2)}</text>}
              </g>
            );
          })}
        </g>
      </g>

      {/* LEXICAL lane: BM25 score bars filling */}
      <g style={{ opacity: mergeP > 0 ? Math.max(0.3, 1 - mergeP) : 1 }}>
        <text x={232} y={96} className="svg-sub tiny">LEXICAL · BM25 exact terms</text>
        {BM25_ROWS.map(([label, v], i) => {
          const p = eph(t, 1800 + i * 320, 2600 + i * 320);
          return (
            <g key={label}>
              <text x={232} y={122 + i * 30} className="svg-mono tinytext">{label}</text>
              <rect x={232} y={128 + i * 30} width={150} height={7} rx={3.5} className="lv-track thin" />
              <rect x={232} y={128 + i * 30} width={q(150 * (v / 100) * p)} height={7} rx={3.5} className="lv-bar" />
              <text x={392} y={136 + i * 30} textAnchor="end" className="svg-sub tiny">{Math.round(v * p)}</text>
            </g>
          );
        })}
      </g>
      <text x={215} y={190} textAnchor="middle" className="lv-phase small" style={{ opacity: t > 1600 && t < 5000 ? 1 : 0 }}>RACING</text>

      {/* RRF merge → rerank sweep → top-k */}
      <text x={430} y={96} className="svg-sub tiny">RRF MERGE → BioLinkBERT RERANK</text>
      {MERGED.map((m, i) => {
        const p = eph(t, 5100 + i * 240, 5500 + i * 240);
        if (p <= 0) return null;
        const scanning = scanRow === i && t > scanStart && t < scanStart + 5 * 480;
        const promoted = i === 3 && t > scanStart + 4 * 480;
        const yy = promoted ? 106 + 2 * 32 : 106 + i * 32 + (i === 2 && t > scanStart + 4 * 480 ? 32 : 0);
        return (
          <g key={m} className={`lv-chip ${i < 3 && t > 9200 ? "win" : ""}`} style={{ opacity: p }}>
            {scanning && <rect x={424} y={q(yy - 2)} width={200} height={30} rx={8} className="scanline" style={{ opacity: 0.5 + 0.4 * pulse(t, 300) }} />}
            <rect x={430} y={q(yy)} width={188} height={26} rx={8} />
            <text x={438} y={q(yy + 17)} className="svg-mono tinytext">{m}</text>
          </g>
        );
      })}
      <text x={430} y={288} className="svg-sub tiny" style={{ opacity: t > 9200 ? 1 : 0 }}>top-k evidence → reasoning ✓</text>

      <text x={30} y={330} className="svg-note">Two philosophies fire at once — a vector neighborhood probe and exact clinical terms.</text>
      <text x={30} y={348} className="svg-note">Reciprocal-rank fusion interleaves them; the biomedical reranker sweeps and reorders.</text>
      <text x={30} y={366} className="svg-note">Recall without noise, live.</text>
    </svg>
  );
}

/* ---------- 6 · REASON — evidence lights up as the words appear ---------- */

const DRAFT = "Sleep disruption pattern consistent with reported anxiety episodes.";
const EVIDENCE = [
  { label: "check-in log · 5 of last 7 nights", trigger: 1900, y: 198 },
  { label: "DSM-5 criteria §300.02 · retrieval hit", trigger: 3600, y: 250 },
  { label: "session transcript · turn 14", trigger: 5300, y: 302 },
];

export function ReasonGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 9800;
  const t = el % L;
  const draft = typed(DRAFT, t, 600, 6100);

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <g className="lv-box hot">
        <rect x={40} y={46} width={560} height={84} rx={12} />
        <text x={58} y={74} className="svg-sub">DRAFT CLINICAL OBSERVATION · being written</text>
        <text x={58} y={104} className="svg-mono">“{draft}{t < 6200 ? caret(t) : ""}”</text>
      </g>

      {EVIDENCE.map((e2, i) => {
        const lit = t > e2.trigger;
        const p = eph(t, e2.trigger, e2.trigger + 450);
        return (
          <g key={e2.label}>
            <path
              d={`M ${170 + i * 130} 130 C ${170 + i * 130} 166 ${200} ${e2.y + 16} 186 ${e2.y + 16}`}
              className={`lv-edge ${lit ? "win" : ""}`}
              pathLength={100}
              strokeDasharray="100 100"
              strokeDashoffset={100 - p * 100}
            />
            <g className={`lv-chip ${lit && t < e2.trigger + 900 ? "win" : ""}`} style={{ opacity: Math.max(0.25, p) }}>
              <rect x={186} y={e2.y} width={330} height={34} rx={9} />
              <text x={202} y={e2.y + 22} className="svg-mono tinytext">↳ {e2.label}</text>
            </g>
            {lit && <text x={530} y={e2.y + 22} className="tick ok" style={rise(p, 4)}>✓</text>}
          </g>
        );
      })}

      {/* structured output lands: hypothesis · uncertainty · follow-ups */}
      {[
        ["hypothesis", "bounded"],
        ["uncertainty", "visible"],
        ["follow-ups", "3 questions"],
      ].map(([k2, v], i) => (
        <g key={k2} className="lv-chip win" style={rise(eph(t, 6800 + i * 380, 7250 + i * 380), 8)}>
          <rect x={60 + i * 180} y={352} width={164} height={34} rx={9} />
          <text x={74 + i * 180} y={366} className="svg-mono tinytext">{k2}</text>
          <text x={74 + i * 180} y={380} className="svg-sub tiny">{v}</text>
        </g>
      ))}

      <text x={40} y={412} className="svg-note">
        The sentence and its sources appear together — and what ships is a bounded hypothesis, never a diagnosis.
      </text>
    </svg>
  );
}

/* ---------- 7 · VALIDATE — claims scanned live; one is stopped ---------- */

const V_CLAIMS = [
  { text: "sleep ↔ anxiety pattern", entail: 0.94, at: 800, ok: true },
  { text: "“responding well to CBT”", entail: 0.31, at: 3600, ok: false },
  { text: "adherence improving", entail: 0.88, at: 6400, ok: true },
];

export function ValidateGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 10400;
  const t = el % L;
  const gateX = 330;

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <rect x={gateX} y={60} width={16} height={220} rx={6} className="lv-gate" />
      <text x={gateX + 8} y={46} textAnchor="middle" className="svg-sub">NLI GATE · DeBERTa</text>

      {V_CLAIMS.map((c, i) => {
        const approach = eph(t, c.at, c.at + 900);
        const scanning = t > c.at + 900 && t < c.at + 1700;
        const decided = t > c.at + 1700;
        const passP = eph(t, c.at + 1700, c.at + 2400);
        const cx = c.ok
          ? 60 + (gateX - 130) * approach + (decided ? 200 * passP : 0)
          : 60 + (gateX - 130) * approach;
        const cy = 84 + i * 72 + (!c.ok && decided ? 90 * passP : 0);
        const score = c.entail * (scanning ? ph(t, c.at + 900, c.at + 1650) : decided ? 1 : 0);
        return (
          <g key={c.text} style={{ opacity: !c.ok && decided ? Math.max(0, 1 - passP * 0.8) : 1 }}>
            <g className={`lv-chip ${decided && c.ok ? "win" : ""}`} transform={`translate(${q(cx)},${q(cy)})`}>
              <rect x={0} y={0} width={166} height={34} rx={9} />
              <text x={10} y={22} className="svg-mono tinytext">{c.text}</text>
            </g>
            {scanning && (
              <rect x={q(cx - 4)} y={q(cy - 4)} width={174} height={42} rx={10} className="scanline" style={{ opacity: 0.4 + 0.5 * pulse(t, 340) }} />
            )}
            {(scanning || decided) && (
              <text x={q(cx + 176)} y={q(cy + 22)} className={decided ? (c.ok ? "tick ok" : "tick bad") : "svg-mono tinytext"}>
                {decided ? (c.ok ? `${c.entail.toFixed(2)} entailed ✓` : `${c.entail.toFixed(2)} ✗ blocked`) : `entail ${score.toFixed(2)}…`}
              </text>
            )}
          </g>
        );
      })}

      <g className="lv-box">
        <rect x={400} y={286} width={220} height={92} rx={10} />
        <text x={416} y={310} className="svg-sub">DETERMINISTIC GATES</text>
        <text x={416} y={334} className="svg-mono tinytext">DSM-5 criteria check {t % 2600 < 1300 ? "…" : " ✓"}</text>
        <text x={416} y={356} className="svg-mono tinytext">risk-language screen {t % 2600 < 1900 ? "…" : " ✓"}</text>
      </g>
      <g className="lv-chip">
        <rect x={30} y={300} width={210} height={72} rx={10} />
        <text x={44} y={322} className="svg-sub tiny">this replay</text>
        <text x={44} y={340} className="svg-mono tinytext">passed 2 · blocked 1</text>
        <text x={44} y={360} className="tick ok" style={{ opacity: eph(t, 8600, 9000) }}>released with uncertainty ✓</text>
      </g>

      <text x={30} y={402} className="svg-note">
        Unsupported language is removed, not softened — the model never negotiates with the gate.
      </text>
    </svg>
  );
}

/* ---------- 8 · REVIEW — handoff assembles; radar + Nancy keep it alive ---------- */

const CHAT = [
  { who: "nancy", text: "how did you sleep last night?", at: 1200 },
  { who: "patient", text: "better — about six hours", at: 3200 },
  { who: "nancy", text: "that's two nights improving ✓", at: 5200 },
];
const HANDOFF_ROWS = [
  "Timeline of 14 sessions",
  "3 flagged patterns, each sourced",
  "Nancy async check-in digest",
  "Suggested — never automatic — actions",
];

export function ReviewGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 9800;
  const t = el % L;
  const sparkN = 3 + CHAT.filter((c) => t > c.at + 600).length * 2;
  const radarVals = [0.7, 0.5, 0.8, 0.55].map((v, i) => v * (0.85 + 0.15 * noise(i * 4 + 2, t / 3)));
  const sweep = (t / 2400) % 1;

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <g className="lv-box">
        <rect x={30} y={36} width={320} height={300} rx={14} />
        <text x={54} y={68} className="svg-label big">HANDOFF SUMMARY</text>
        <text x={54} y={88} className="svg-sub">assembled for the clinician, not the model</text>
        {HANDOFF_ROWS.map((r, i) => (
          <g key={r} style={rise(eph(t, 900 + i * 900, 1400 + i * 900), 7)}>
            <text x={54} y={122 + i * 34} className="svg-mono tinytext">• {r}</text>
          </g>
        ))}
        <text x={54} y={286} className="svg-sub tiny">status: clinician-support MVP · synthetic data</text>
        <text x={54} y={314} className="tick ok" style={{ opacity: eph(t, 4800, 5300) }}>clinician stays the decision-maker ✓</text>
      </g>

      {/* Nancy's async loop */}
      <g className="lv-box hot">
        <rect x={380} y={36} width={240} height={168} rx={12} />
        <text x={398} y={62} className="svg-sub">NANCY · between-session check-in</text>
        {CHAT.map((c, i) => {
          const p = eph(t, c.at, c.at + 450);
          if (p <= 0) return null;
          const left = c.who === "patient";
          return (
            <g key={c.at} style={rise(p, 8)}>
              <rect x={left ? 396 : 436} y={72 + i * 42} width={172} height={28} rx={10} className={left ? "lv-bubble" : "lv-bubble nancy"} />
              <text x={left ? 406 : 446} y={90 + i * 42} className="svg-mono tinytext">{typed(c.text, t, c.at, c.at + 900)}</text>
            </g>
          );
        })}
      </g>

      {/* behavioral radar + growing timeline */}
      <g className="lv-box">
        <rect x={380} y={224} width={240} height={132} rx={12} />
        <text x={398} y={248} className="svg-sub tiny">BEHAVIORAL STATE</text>
        <g transform="translate(432,306)">
          {[12, 24, 36].map((r) => (
            <circle key={r} cx={0} cy={0} r={r} className="lv-ring track" style={{ opacity: 0.5 }} />
          ))}
          <line x1={0} y1={0} x2={q(36 * Math.cos(sweep * Math.PI * 2))} y2={q(36 * Math.sin(sweep * Math.PI * 2))} className="lv-edge" style={{ opacity: 0.5 }} />
          <polygon
            points={radarVals
              .map((v, i) => {
                const ang = (i / 4) * Math.PI * 2 - Math.PI / 2;
                return `${q(36 * v * Math.cos(ang))},${q(36 * v * Math.sin(ang))}`;
              })
              .join(" ")}
            className="lv-radar"
          />
        </g>
        <text x={492} y={266} className="svg-sub tiny">timeline · growing</text>
        <polyline
          points={Array.from({ length: sparkN })
            .map((_, i) => `${q(492 + i * 14)},${q(330 - 26 * noise(i * 2 + 3, 1000) - (i > 5 ? 8 : 0))}`)
            .join(" ")}
          className="lv-line"
        />
        {t > 5800 && <circle cx={q(492 + (sparkN - 1) * 14)} cy={q(330 - 26 * noise((sparkN - 1) * 2 + 3, 1000) - 8)} r={3.4} className="lv-pulse" style={{ opacity: 0.4 + 0.6 * pulse(t, 800) }} />}
      </g>

      <text x={30} y={392} className="svg-note">
        The loop keeps running between sessions — each check-in you watched lands on the same validated timeline the clinician reads.
      </text>
    </svg>
  );
}

/* ---------- chapter ---------- */

const STEPS: StepDef[] = [
  {
    label: "The pipeline",
    sub: "high-level architecture",
    pilotTitle: "Seven gates between a session and a clinician's desk",
    pilotBody:
      "MindScape turns raw psychiatric sessions and between-session signals into a clinician-ready timeline. Watch a session travel capture → perceive → fuse → retrieve → reason → validate → review — and watch an ungrounded claim get stopped at the gate, in the same replay.",
    metrics: [
      { k: "stages", v: "7, ordered" },
      { k: "stack", v: "FastAPI + Next.js" },
      { k: "role", v: "clinician support" },
    ],
    graphic: (a) => <PipelineGraphic a={a} />,
  },
  {
    label: "Capture",
    sub: "the rolling buffer",
    pilotTitle: "The session is already data while the patient is still talking",
    pilotBody:
      "WebRTC audio lands in a one-second rolling buffer — the waveform you see is the buffer, live — and ships downstream as timestamped packets. No batch upload at the end of the hour; the pipeline starts at second one.",
    metrics: [
      { k: "transport", v: "WebRTC · 16 kHz mono" },
      { k: "buffer", v: "rolling 1000 ms" },
      { k: "cadence", v: "~1 packet / s" },
    ],
    graphic: (a) => <CaptureGraphic a={a} />,
  },
  {
    label: "Perception",
    sub: "one voice, three channels",
    pilotTitle: "What was said, how it was said, and what the voice betrayed",
    pilotBody:
      "One synchronized stream splits live into three perceptions: the transcript writing itself, SenseVoice event tokens — a silence, a breath, a sigh — popping as they're detected, and an Emotion2Vec+ affect point drifting across the valence–arousal plane. All three share one clock.",
    metrics: [
      { k: "linguistic", v: "transcript embeddings" },
      { k: "events", v: "SenseVoice tokens" },
      { k: "affect", v: "Emotion2Vec+ v/a" },
    ],
    graphic: (a) => <PerceiveGraphic a={a} />,
  },
  {
    label: "Gated fusion",
    sub: "streams → state",
    pilotTitle: "A neural gate decides what each stream contributes",
    pilotBody:
      "Text at 768 dimensions, sparse event tokens, 1024-dimensional affect, and the longitudinal baseline fire through a gated multimodal unit — edges firing layer to layer in front of you — and out comes the Behavioral State Vector: one reusable representation of the patient's state, updating live.",
    metrics: [
      { k: "fusion", v: "GMU, gated" },
      { k: "inputs", v: "768d + sparse + 1024d" },
      { k: "output", v: "BSV" },
    ],
    graphic: (a) => <FuseGraphic a={a} />,
  },
  {
    label: "Hybrid retrieval",
    sub: "recall without noise",
    pilotTitle: "A vector neighborhood and exact terms, racing",
    pilotBody:
      "The query fires both lanes at once — a probe expanding through the MedCPT/HNSW neighborhood lights its nearest neighbors while BM25 scores exact clinical terms bar by bar. Reciprocal-rank fusion interleaves the lists in front of you; the BioLinkBERT sweep reorders them. What survives is top-k evidence.",
    metrics: [
      { k: "dense", v: "MedCPT · HNSW/Faiss" },
      { k: "lexical", v: "BM25 → RRF" },
      { k: "rerank", v: "BioLinkBERT" },
    ],
    graphic: (a) => <RetrievalGraphic a={a} />,
  },
  {
    label: "Grounded reasoning",
    sub: "every claim, sourced",
    pilotTitle: "Conclusions you can trace backwards",
    pilotBody:
      "The draft observation writes itself word by word — and as each phrase lands, the evidence that licenses it lights up and links in. What ships is structured: a bounded hypothesis, visible uncertainty, and three follow-up questions. Never a diagnosis.",
    metrics: [
      { k: "grounding", v: "retrieval-first" },
      { k: "lineage", v: "per sentence" },
      { k: "output", v: "hypothesis + uncertainty" },
    ],
    graphic: (a) => <ReasonGraphic a={a} />,
  },
  {
    label: "Validation gates",
    sub: "the hard stop",
    pilotTitle: "Unsupported claims don't get softened — they get stopped",
    pilotBody:
      "Three claims approach the gate. The DeBERTa NLI scan runs on each — entailment scores computing live — and the one that can't find its evidence is blocked and drops away, while deterministic DSM-5 and risk-language rules run alongside. What's released is released with its uncertainty attached.",
    metrics: [
      { k: "NLI check", v: "DeBERTa entailment" },
      { k: "rules", v: "DSM-5, deterministic" },
      { k: "on failure", v: "block, don't hedge" },
    ],
    graphic: (a) => <ValidateGraphic a={a} />,
  },
  {
    label: "Clinician review",
    sub: "the handoff",
    pilotTitle: "The clinician stays the decision-maker",
    pilotBody:
      "The handoff assembles row by row; the behavioral radar holds the fused state; Nancy, the async companion, runs a real check-in exchange — and each exchange lands as a new point on the validated timeline. Framed honestly: a clinician-support MVP on synthetic data, built to production discipline.",
    metrics: [
      { k: "output", v: "handoff summary" },
      { k: "async loop", v: "Nancy companion" },
      { k: "status", v: "MVP · synthetic data" },
    ],
    graphic: (a) => <ReviewGraphic a={a} />,
  },
];

export function MindscapeChapter() {
  return (
    <ChapterShell
      id="mindscape"
      accent="#8ef0c0"
      kicker="PROJECT 03 · CLINICAL AI"
      title="MindScape"
      subtitle="A clinical AI workflow engine — psychiatric sessions become validated, clinician-ready intelligence."
      steps={STEPS}
      stepMs={9200}
    />
  );
}
