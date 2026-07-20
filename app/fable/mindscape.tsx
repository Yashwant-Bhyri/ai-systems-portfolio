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
        {/* V2's analysis window, sweeping the buffer */}
        {(() => {
          const wx = 48 + (((t / 9) % 440) + 440) % 440;
          return (
            <g>
              <rect x={q(wx)} y={166} width={80} height={62} rx={4} className="lv-window" />
              <line x1={q(wx)} y1={166} x2={q(wx)} y2={228} className="lv-windowedge" />
              <line x1={q(wx + 80)} y1={166} x2={q(wx + 80)} y2={228} className="lv-windowedge" />
            </g>
          );
        })()}
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
      <text x={30} y={314} className="svg-sub tiny">patient audio → linguistic · event · affect perception</text>

      <text x={30} y={380} className="svg-note">
        Nothing waits for the session to end — audio ships downstream in one-second packets while the patient is still talking.
      </text>
    </svg>
  );
}

/* ---------- 3 · PERCEIVE — one voice splits into three live channels ---------- */

const EVENT_TOKENS = [
  { tok: "<silence>", at: 1200 },
  { tok: "<breath>", at: 2400 },
  { tok: "<sigh>", at: 3600 },
  { tok: "<tremor>", at: 4800 },
  { tok: "<pause>", at: 6000 },
  { tok: "<pace↓>", at: 7200 },
];
const LINGUISTIC = [
  { text: "“I haven't slept well…”", at: 900 },
  { text: "“work feels heavier…”", at: 3300 },
  { text: "“I cancel plans a lot…”", at: 5700 },
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

      {/* linguistic — a real stretch of session language */}
      <g className="lv-box">
        <rect x={40} y={112} width={180} height={166} rx={11} />
        <text x={54} y={136} className="svg-sub tiny">LINGUISTIC</text>
        {LINGUISTIC.map((ln, i) => (
          <text key={ln.text} x={54} y={160 + i * 26} className="svg-mono tinytext">
            {typed(ln.text, t, ln.at, ln.at + 1900)}
            {t > ln.at && t < ln.at + 2000 ? caret(t) : ""}
          </text>
        ))}
        <text x={54} y={240} className="svg-sub tiny" style={{ opacity: t > 7800 ? 1 : 0.4 }}>→ embedded per sentence</text>
        <text x={54} y={262} className="svg-sub tiny">transcript embeddings</text>
      </g>

      {/* event tokens — the paralinguistic stream */}
      <g className="lv-box">
        <rect x={230} y={112} width={180} height={166} rx={11} />
        <text x={244} y={136} className="svg-sub tiny">EVENT TOKENS</text>
        {EVENT_TOKENS.map((e2, i) => {
          const p = eph(t, e2.at, e2.at + 400);
          const col = i % 2;
          const row = Math.floor(i / 2);
          return (
            <g key={e2.tok} style={rise(p, 8)}>
              <g className={`lv-chip ${t > e2.at && t < e2.at + 1100 ? "win" : ""}`}>
                <rect x={242 + col * 80} y={148 + row * 32} width={76} height={24} rx={8} />
                <text x={280 + col * 80} y={164 + row * 32} textAnchor="middle" className="svg-sub tiny">{e2.tok}</text>
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

      {/* the BSV — named dimensions with live magnitudes, not an audio bar */}
      <g className="lv-box hot">
        <rect x={30} y={252} width={580} height={104} rx={12} />
        <text x={48} y={276} className="svg-sub">BEHAVIORAL STATE VECTOR · one reusable patient-state representation</text>
        {["sleep debt", "affect", "speech", "adherence", "energy", "risk"].map((dim, i) => {
          const v = 0.25 + 0.65 * noise(i * 3 + 1, t / 2.6);
          const on2 = eph(t, 1400 + i * 150, 2100 + i * 150);
          return (
            <g key={dim} style={{ opacity: 0.3 + 0.7 * on2 }}>
              <rect x={48 + i * 94} y={286} width={86} height={40} rx={7} className="lv-bsvcell" style={{ fillOpacity: q(0.12 + 0.5 * v * on2) }} />
              <text x={91 + i * 94} y={302} textAnchor="middle" className="svg-sub tiny">{dim}</text>
              <text x={91 + i * 94} y={319} textAnchor="middle" className="svg-mono tinytext">{(v * on2).toFixed(2)}</text>
            </g>
          );
        })}
        <text x={48} y={346} className="svg-sub tiny">re-used by retrieval, reasoning, and review — the same state, everywhere</text>
      </g>

      <text x={30} y={392} className="svg-note">
        A shaky voice, a missed check-in, and last month's baseline fuse into one vector — the state every later stage reasons over.
      </text>
    </svg>
  );
}

/* ---------- 5 · RETRIEVE — HNSW scatter + BM25 bars race, RRF, rerank ---------- */

/** HNSW layers: sparse top layer → dense bottom; the search descends. */
const HNSW_LAYERS: { y: number; xs: number[] }[] = [
  { y: 26, xs: [40, 92, 140] },
  { y: 72, xs: [24, 62, 96, 128, 156] },
  { y: 122, xs: [16, 38, 60, 82, 104, 126, 148, 164] },
];
/** the descent path: [layer, node-index] hops */
const HNSW_PATH: [number, number][] = [[0, 1], [1, 2], [1, 3], [2, 5], [2, 6]];
const BM25_ROWS: [string, number][] = [["“anhedonia”", 88], ["“low mood”", 73], ["PHQ-9 mentions", 61], ["note 2026-06-02", 48], ["clinic intake", 39]];
const MERGED = [
  { label: "DSM-5 §296.22 MDD", src: "D1" },
  { label: "“anhedonia”", src: "L1" },
  { label: "session 9 · turn 4", src: "D2" },
  { label: "“low mood”", src: "L2" },
  { label: "PHQ-9 trend ↑", src: "D3" },
];

export function RetrievalGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 11000;
  const t = el % L;
  const qtext = typed("persistent low mood + anhedonia", t, 200, 1300);
  const mergeP = eph(t, 5000, 6200);
  const scanStart = 6600;
  const scanRow = Math.min(4, Math.floor(Math.max(0, t - scanStart) / 480));
  const hop = Math.min(HNSW_PATH.length - 1, Math.floor(Math.max(0, t - 1600) / 550));

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <g className="lv-box hot">
        <rect x={30} y={24} width={330} height={44} rx={10} />
        <text x={44} y={42} className="svg-sub">QUERY STATE · BSV + transcript</text>
        <text x={44} y={59} className="svg-mono tinytext">“{qtext}{t < 1400 ? caret(t) : ""}”</text>
      </g>

      {/* DENSE lane: HNSW descent — coarse top layer, greedy hops, dense floor */}
      <g style={{ opacity: mergeP > 0 ? Math.max(0.3, 1 - mergeP) : 1 }}>
        <text x={30} y={96} className="svg-sub tiny">DENSE · MedCPT over HNSW/Faiss</text>
        <g transform="translate(36,106)">
          <rect x={0} y={0} width={172} height={162} rx={10} className="lv-track" />
          {HNSW_LAYERS.map((ly, li) => (
            <g key={li}>
              <text x={4} y={ly.y - 8} className="svg-sub tiny" style={{ opacity: 0.55 }}>L{2 - li}</text>
              <line x1={8} y1={ly.y - 14} x2={164} y2={ly.y - 14} className="lv-tick" style={{ opacity: 0.25 }} />
              {ly.xs.map((px, ni) => {
                const onPath = HNSW_PATH.some(([pl, pn], k) => pl === li && pn === ni && k <= hop && t > 1600);
                const isFinal = t > 1600 + 4 * 550 && li === 2 && (ni === 5 || ni === 6);
                return (
                  <circle
                    key={ni}
                    cx={px}
                    cy={ly.y}
                    r={isFinal ? 4.6 : onPath ? 3.8 : 2.4}
                    className={onPath || isFinal ? "lv-pulse" : "lv-hidnode"}
                    style={{ opacity: onPath || isFinal ? 1 : 0.45 }}
                  />
                );
              })}
            </g>
          ))}
          {/* the greedy hops, drawn as the search descends */}
          {HNSW_PATH.slice(0, hop + 1).map(([pl, pn], k) => {
            if (k === 0 || t < 1600) return null;
            const [al, an] = HNSW_PATH[k - 1];
            return (
              <line
                key={k}
                x1={HNSW_LAYERS[al].xs[an]}
                y1={HNSW_LAYERS[al].y}
                x2={HNSW_LAYERS[pl].xs[pn]}
                y2={HNSW_LAYERS[pl].y}
                className="lv-edge win"
                style={{ opacity: 0.8 }}
              />
            );
          })}
          <text x={86} y={156} textAnchor="middle" className="svg-sub tiny">
            {t < 1600 ? "vector index idle" : hop < 4 ? "descending layers…" : "2 nearest found · 0.92 / 0.85"}
          </text>
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

      {/* RRF merge — ranked lists visibly interleave (D=dense, L=lexical) → rerank sweep */}
      <text x={430} y={96} className="svg-sub tiny">RRF MERGE → BioLinkBERT RERANK</text>
      {MERGED.map((m, i) => {
        const p = eph(t, 5100 + i * 240, 5500 + i * 240);
        if (p <= 0) return null;
        const scanning = scanRow === i && t > scanStart && t < scanStart + 5 * 480;
        const promoted = i === 3 && t > scanStart + 4 * 480;
        const yy = promoted ? 106 + 2 * 32 : 106 + i * 32 + (i === 2 && t > scanStart + 4 * 480 ? 32 : 0);
        return (
          <g key={m.label} className={`lv-chip ${i < 3 && t > 9200 ? "win" : ""}`} style={{ opacity: p }}>
            {scanning && <rect x={424} y={q(yy - 2)} width={204} height={30} rx={8} className="scanline" style={{ opacity: 0.5 + 0.4 * pulse(t, 300) }} />}
            <rect x={430} y={q(yy)} width={192} height={26} rx={8} />
            <rect x={434} y={q(yy + 4)} width={20} height={18} rx={5} className={m.src.startsWith("D") ? "lv-srcbadge dense" : "lv-srcbadge"} />
            <text x={444} y={q(yy + 17)} textAnchor="middle" className="svg-sub tiny">{m.src}</text>
            <text x={460} y={q(yy + 17)} className="svg-mono tinytext">{m.label}</text>
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

const DRAFT = "Low-mood pattern with anhedonia, consistent across sessions.";
const EVIDENCE = [
  { label: "check-in log · agent skims 7 nights", trigger: 1900, y: 178, kind: "log" },
  { label: "RAG over DSM-5 · §296.22 retrieved", trigger: 3600, y: 236, kind: "rag" },
  { label: "session transcript · turn 14 skim", trigger: 5300, y: 294, kind: "skim" },
];

/** mini operation inside each evidence panel */
function EvidenceInset({ kind, x, y, t, lit }: { kind: string; x: number; y: number; t: number; lit: boolean }) {
  if (!lit) return null;
  if (kind === "log") {
    const scanY = 4 + (((t / 14) % 34) + 34) % 34;
    return (
      <g transform={`translate(${x},${y})`}>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={0} y={4 + i * 9} width={q(52 - (i % 2) * 12)} height={4} rx={2} className="lv-feedbar" />
        ))}
        <rect x={-3} y={q(scanY)} width={60} height={5} rx={2.5} className="scanline" style={{ opacity: 0.85 }} />
        <circle cx={62} cy={q(scanY + 2)} r={3} className="lv-pulse" />
      </g>
    );
  }
  if (kind === "rag") {
    const hitOn = Math.floor(t / 700) % 2 === 0;
    return (
      <g transform={`translate(${x},${y})`}>
        <rect x={0} y={0} width={44} height={42} rx={4} className="lv-track" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={5} y={6 + i * 9} width={i === 2 ? 34 : 26} height={4} rx={2} className={i === 2 ? "lv-bar" : "lv-feedbar"} style={i === 2 ? { opacity: hitOn ? 1 : 0.5 } : undefined} />
        ))}
        <text x={52} y={16} className="svg-sub tiny">§296.22</text>
        <text x={52} y={30} className="tick ok">hit ✓</text>
      </g>
    );
  }
  const u = (((t / 16) % 56) + 56) % 56;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={12} className="svg-sub tiny">“…nothing feels fun…”</text>
      <rect x={0} y={18} width={q(Math.min(56, u) * 1.9)} height={3} rx={1.5} className="lv-bar" />
      <text x={0} y={36} className="svg-sub tiny">skimming turn 14</text>
    </g>
  );
}

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
              d={`M ${170 + i * 130} 130 C ${170 + i * 130} 160 ${200} ${e2.y + 24} 186 ${e2.y + 24}`}
              className={`lv-edge ${lit ? "win" : ""}`}
              pathLength={100}
              strokeDasharray="100 100"
              strokeDashoffset={100 - p * 100}
            />
            <g className={`lv-chip ${lit && t < e2.trigger + 900 ? "win" : ""}`} style={{ opacity: Math.max(0.25, p) }}>
              <rect x={186} y={e2.y} width={400} height={50} rx={10} />
              <text x={202} y={e2.y + 22} className="svg-mono tinytext">↳ {e2.label}</text>
              <EvidenceInset kind={e2.kind} x={470} y={e2.y + 4} t={t} lit={lit} />
            </g>
            {lit && <text x={600} y={e2.y + 30} className="tick ok" style={rise(p, 4)}>✓</text>}
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
          <rect x={60 + i * 180} y={358} width={164} height={34} rx={9} />
          <text x={74 + i * 180} y={372} className="svg-mono tinytext">{k2}</text>
          <text x={74 + i * 180} y={386} className="svg-sub tiny">{v}</text>
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
  { text: "low mood ↔ anhedonia", clause: "§296.22 · A1+A2", verdict: "pass", entail: 0.94, at: 900 },
  { text: "“responding well to CBT”", clause: "policy R-04 · outcome claims", verdict: "block", entail: 0.31, at: 4300 },
  { text: "adherence improving", clause: "§B-criteria · course", verdict: "pass", entail: 0.88, at: 7700 },
];
const RULEBOOK_LINES = ["A. five+ symptoms / 2 wks", "B. functional impairment", "C. not substance-induced", "R-04 no outcome claims", "R-11 risk language screen"];

export function ValidateGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 11400;
  const t = el % L;
  const active = V_CLAIMS.findIndex((c) => t >= c.at && t < c.at + 3200);
  const clauseFor = active >= 0 ? V_CLAIMS[active] : null;
  // which rulebook line the retrieval lands on, per claim
  const clauseLine = active === 0 ? 0 : active === 1 ? 3 : 1;

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <text x={30} y={32} className="lv-phase small">VALIDATION = CHECK THE CLAIM AGAINST THE RULEBOOK — NEVER AGAINST A VIBE</text>

      {/* claims queue, left */}
      {V_CLAIMS.map((c, i) => {
        const phase = t < c.at ? "wait" : t < c.at + 1100 ? "retrieve" : t < c.at + 2300 ? "check" : "done";
        return (
          <g key={c.text}>
            <g className={`lv-chip ${phase === "retrieve" || phase === "check" ? "win" : ""}`} style={{ opacity: phase === "wait" ? 0.4 : 1 }}>
              <rect x={30} y={54 + i * 58} width={190} height={44} rx={10} />
              <text x={44} y={73 + i * 58} className="svg-mono tinytext">{c.text}</text>
              <text x={44} y={90 + i * 58} className="svg-sub tiny">
                {phase === "wait" ? "queued" : phase === "retrieve" ? "finding its clause…" : phase === "check" ? `entail ${(c.entail * ph(t, c.at + 1100, c.at + 2100)).toFixed(2)}…` : c.verdict === "pass" ? `✓ ${c.clause}` : `✗ ${c.clause}`}
              </text>
            </g>
            {phase !== "wait" && (
              <path d={`M 220 ${76 + i * 58} C 260 ${76 + i * 58} 260 150 296 150`} className={`lv-edge ${phase !== "done" ? "win" : ""}`} style={{ opacity: phase === "done" ? 0.25 : 0.8 }} />
            )}
          </g>
        );
      })}

      {/* THE RULEBOOK — DSM-5 + policy, an actual open book being consulted */}
      <g className="lv-box hot">
        <rect x={296} y={54} width={210} height={200} rx={12} />
        <text x={312} y={78} className="svg-sub">RULEBOOK · DSM-5 + policy</text>
        {RULEBOOK_LINES.map((ln, i) => {
          const hit = clauseFor && i === clauseLine && t > V_CLAIMS[active].at + 500;
          return (
            <g key={ln}>
              {hit && <rect x={306} y={88 + i * 30} width={190} height={24} rx={6} className="scanline" style={{ opacity: 0.5 + 0.4 * pulse(t, 400) }} />}
              <text x={314} y={104 + i * 30} className={hit ? "svg-mono tinytext" : "svg-mono tinytext dim"}>{ln}</text>
            </g>
          );
        })}
        <text x={312} y={246} className="svg-sub tiny">{clauseFor && t > V_CLAIMS[active].at + 500 ? `retrieved: ${clauseFor.clause}` : "awaiting claim…"}</text>
      </g>

      {/* verdict lane, right */}
      <g className="lv-box">
        <rect x={528} y={54} width={92} height={200} rx={12} />
        <text x={574} y={78} textAnchor="middle" className="svg-sub tiny">VERDICTS</text>
        {V_CLAIMS.map((c, i) => {
          const done = t > c.at + 2300;
          return (
            <g key={c.text} style={rise(done ? 1 : 0, 6)}>
              <text x={574} y={106 + i * 44} textAnchor="middle" className={c.verdict === "pass" ? "tick ok" : "tick bad"}>{c.verdict === "pass" ? "✓ pass" : "✗ block"}</text>
              <text x={574} y={120 + i * 44} textAnchor="middle" className="svg-sub tiny">{c.verdict === "pass" ? "cited" : "removed"}</text>
            </g>
          );
        })}
      </g>

      {/* the double gate beneath: model check + deterministic rules */}
      <g className="lv-box">
        <rect x={30} y={274} width={476} height={72} rx={10} />
        <text x={46} y={296} className="svg-sub tiny">TWO GATES, IN ORDER</text>
        <text x={46} y={316} className="svg-mono tinytext">1 · DeBERTa NLI — is the claim entailed by its evidence? {t % 3000 < 1600 ? "checking…" : "scored ✓"}</text>
        <text x={46} y={334} className="svg-mono tinytext">2 · deterministic clauses — DSM-5 + risk language {t % 3000 < 2300 ? "…" : "enforced ✓"}</text>
      </g>
      <g className="lv-chip">
        <rect x={528} y={274} width={92} height={72} rx={10} />
        <text x={574} y={300} textAnchor="middle" className="svg-mono tinytext">2 ✓ · 1 ✗</text>
        <text x={574} y={318} textAnchor="middle" className="svg-sub tiny">this replay</text>
        <text x={574} y={336} textAnchor="middle" className="tick ok" style={{ opacity: eph(t, 10200, 10700) }}>cited ✓</text>
      </g>

      <text x={30} y={382} className="svg-note">
        Every verdict carries its clause — a claim passes with a citation, or it is removed. The model never negotiates with the book.
      </text>
    </svg>
  );
}

/* ---------- 8 · REVIEW — handoff assembles; radar + Nancy keep it alive ---------- */

const HANDOFF_ROWS = [
  "Timeline of 14 sessions",
  "3 flagged patterns, each sourced",
  "Between-session check-in digest",
  "Suggested — never automatic — actions",
];
const RADAR_AXES = ["affect", "language", "events", "Δ baseline"];

export function ReviewGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 9800;
  const t = el % L;
  const sparkN = Math.min(10, 3 + Math.floor(t / 1200));
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

      {/* behavioral state — the fused vector the clinician actually reads */}
      <g className="lv-box hot">
        <rect x={380} y={36} width={240} height={300} rx={12} />
        <text x={398} y={62} className="svg-sub">BEHAVIORAL STATE · live</text>
        <g transform="translate(500,150)">
          {[16, 32, 48].map((r) => (
            <circle key={r} cx={0} cy={0} r={r} className="lv-ring track" style={{ opacity: 0.5 }} />
          ))}
          <line x1={0} y1={0} x2={q(48 * Math.cos(sweep * Math.PI * 2))} y2={q(48 * Math.sin(sweep * Math.PI * 2))} className="lv-edge" style={{ opacity: 0.5 }} />
          <polygon
            points={radarVals
              .map((v, i) => {
                const ang = (i / 4) * Math.PI * 2 - Math.PI / 2;
                return `${q(48 * v * Math.cos(ang))},${q(48 * v * Math.sin(ang))}`;
              })
              .join(" ")}
            className="lv-radar"
          />
          {RADAR_AXES.map((ax, i) => {
            const ang = (i / 4) * Math.PI * 2 - Math.PI / 2;
            return (
              <text key={ax} x={q(60 * Math.cos(ang))} y={q(60 * Math.sin(ang) + 3)} textAnchor="middle" className="svg-sub tiny">{ax}</text>
            );
          })}
        </g>
        <text x={398} y={244} className="svg-sub tiny">validated timeline · growing each session</text>
        <polyline
          points={Array.from({ length: sparkN })
            .map((_, i) => `${q(398 + i * 21)},${q(290 - 26 * noise(i * 2 + 3, 1000) - (i > 5 ? 8 : 0))}`)
            .join(" ")}
          className="lv-line"
        />
        {t > 3600 && <circle cx={q(398 + (sparkN - 1) * 21)} cy={q(290 - 26 * noise((sparkN - 1) * 2 + 3, 1000) - (sparkN - 1 > 5 ? 8 : 0))} r={3.4} className="lv-pulse" style={{ opacity: 0.4 + 0.6 * pulse(t, 800) }} />}
        <text x={398} y={324} className="tick ok" style={{ opacity: eph(t, 6200, 6700) }}>human-owned decision ✓</text>
      </g>

      <text x={30} y={392} className="svg-note">
        Everything the pipeline computed lands in one inspectable surface — and the decision stays with the clinician.
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
