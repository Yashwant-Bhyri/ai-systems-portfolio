"use client";

import { T, TD } from "../i18n";

import { ChapterShell, type StepDef } from "./chapter-shell";
import { useSim, ph, eph, pulse, noise, bez, typed, caret, rise, Wave, LiveNet, q } from "./live";

/* Live scenes — a session actually flowing through the clinical pipeline.
   Best-of-both merge (D7): V2's domain depth, rendered as live operations. */

/* ---------- 1 · THE PIPELINE — a session traverses; an ungrounded claim is blocked ---------- */

const STAGES = ["CAPTURE", "PERCEIVE", "FUSE", "RETRIEVE", "REASON", "VALIDATE", "REVIEW"];
const MINDSCAPE_STEP_MS = 11800;

export function PipelineGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = MINDSCAPE_STEP_MS;
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
      <text x={24} y={120} className="svg-sub">{T("SESSION AUDIO · TEXT · CHECK-INS")}</text>
      <text x={616} y={120} textAnchor="end" className="svg-sub">{T("CLINICIAN HANDOFF")}</text>

      {TD(STAGES).map((s, i) => {
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
      {t > 600 && t < 8400 && <text x={q(mainX)} y={y - 32} textAnchor="middle" className="svg-sub tiny">{T("session")}</text>}
      {t >= 8400 && (
        <g className="lv-stamp" style={rise(eph(t, 8400, 8800), 6)}>
          <rect x={470} y={252} width={150} height={38} rx={9} />
          <text x={545} y={276} textAnchor="middle" className="svg-label small">{T("validated ✓")}</text>
        </g>
      )}

      {t > 2200 && dropP < 1 && (
        <g style={{ opacity: 1 - dropP }}>
          <circle cx={q(sX)} cy={q(y + 66 + dropP * 60)} r={5} className="lv-pulse bad" />
          <text x={q(sX)} y={q(y + 84 + dropP * 60)} textAnchor="middle" className="svg-sub">{blocked ? T("ungrounded claim") : T("draft claim")}</text>
        </g>
      )}
      {blocked && dropP < 1 && (
        <text x={stageX(5)} y={y + 110} textAnchor="middle" className="tick bad" style={rise(eph(t, 6600, 7000), 4)}>{T("✗ blocked at the gate")}</text>
      )}

      <text x={24} y={356} className="svg-note">
        {T("The session advances only when each stage can support the next one.")}
      </text>
      <text x={24} y={374} className="svg-note">
        {T("Unsupported claims stop at validation; only traceable context reaches clinician review.")}
      </text>
    </svg>
  );
}

/* ---------- 2 · CAPTURE — WebRTC audio in a rolling buffer, packets shipping ---------- */

const CAPTURE_MOMENTS = [
  { words: "“I could not sleep well last night.”", cue: "sleep cue" },
  { words: "“I have felt low for most of this week.”", cue: "mood trend" },
  { words: "“Things I normally enjoy feel distant.”", cue: "interest change" },
  { words: "“It has been harder to focus at work.”", cue: "focus change" },
  { words: "“I cancelled plans again this weekend.”", cue: "activity change" },
];

function sessionClock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

export function CaptureGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = MINDSCAPE_STEP_MS;
  const t = el % L;
  const k = Math.floor(el / 1100); // lifetime packet counter
  const flyP = (el % 1100) / 1100;
  const latestPacket = 196 + (k % 600);
  // The chip in flight is `latestPacket`; the ledger shows the three packets
  // that have already landed. When k advances, the prior chip becomes row 3.
  const traceablePackets = [3, 2, 1].map((offset) => {
    const packetId = latestPacket - offset;
    const moment = TD(CAPTURE_MOMENTS)[((packetId % CAPTURE_MOMENTS.length) + CAPTURE_MOMENTS.length) % CAPTURE_MOMENTS.length];
    return {
      tag: `A-${packetId}`,
      words: moment.words,
      signal: `${sessionClock(18 + packetId - 196)} · ${T(moment.cue)}`,
    };
  });

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <g className="lv-node is-live">
        <rect x={30} y={40} width={168} height={78} rx={12} />
        <text x={114} y={68} textAnchor="middle" className="svg-label small">{T("SIMULATED SESSION")}</text>
        <text x={114} y={86} textAnchor="middle" className="svg-mono">{T("WebRTC audio")}</text>
        <text x={114} y={102} textAnchor="middle" className="svg-sub">{T("16 kHz mono")}</text>
      </g>
      <circle cx={48} cy={58} r={4} className="lv-pulse bad" style={{ opacity: 0.4 + 0.6 * pulse(t, 900) }} />

      {/* rolling buffer — the wave IS the last second of audio */}
      <g className="lv-box hot">
        <rect x={30} y={140} width={580} height={110} rx={12} />
        <text x={48} y={164} className="svg-sub">{T("ROLLING BUFFER · last 1000 ms, always live")}</text>
        <Wave x={48} y={172} w={520} h={48} bars={42} t={t} on={1} />
        {["−1000", "−750", "−500", "−250", T("NOW")].map((m2, i) => (
          <text key={m2} x={48 + i * 130} y={242} className="svg-sub">{m2}{i < 4 ? T(" ms") : ""}</text>
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
        <g className="lv-chip" transform={`translate(${q(bez(flyP, [568, 196], [612, 234], [574, 258])[0])},${q(bez(flyP, [568, 196], [612, 234], [574, 258])[1])})`}>
          <rect x={-26} y={-11} width={52} height={22} rx={7} />
          <text x={0} y={4} textAnchor="middle" className="svg-mono">A-{latestPacket}</text>
        </g>
      )}
      <text x={30} y={282} className="svg-sub">{T("SOURCE-LINKED PACKETS · DERIVED SIGNALS RETAIN THE SPOKEN WORDS")}</text>
      {traceablePackets.map((packet, index) => (
        <g key={packet.tag} className={`lv-chip ${index === 2 && k > 0 && flyP < 0.28 ? "win" : ""}`}>
          <rect x={30} y={292 + index * 28} width={580} height={24} rx={7} />
          <rect x={38} y={296 + index * 28} width={54} height={16} rx={5} className="lv-srcbadge dense" />
          <text x={65} y={308 + index * 28} textAnchor="middle" className="svg-mono">{packet.tag}</text>
          <text x={104} y={309 + index * 28} className="svg-mono">{packet.words}</text>
          <text x={594} y={309 + index * 28} textAnchor="end" className="svg-sub">{packet.signal}</text>
        </g>
      ))}

      <text x={30} y={394} className="svg-note">{T("New packets replace older rows as the session advances.")}</text>
      <text x={30} y={410} className="svg-note">{T("Every derived signal remains linked to its timestamped source words.")}</text>
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
  const L = MINDSCAPE_STEP_MS;
  const t = el % L;
  // affect point drifts toward low valence / rising arousal over the loop
  const drift = eph(t, 1000, 8600);
  const ax = 70 - 34 * drift + 7 * Math.sin(t / 700);
  const ay = 62 - 30 * drift + 6 * Math.cos(t / 900);

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <text x={40} y={40} className="svg-sub">{T("SYNCHRONIZED AUDIO · SIMULATED STREAM · THREE SIGNALS")}</text>
      <Wave x={40} y={50} w={250} h={30} bars={26} t={t} on={t % 3400 < 2500 ? 1 : 0.1} />

      {/* branch edges firing */}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M 290 65 C 340 65 ${120 + i * 190} 90 ${130 + i * 190} 112`} className="lv-edge" style={{ opacity: 0.25 + 0.5 * pulse(t + i * 380, 1150) }} />
      ))}

      {/* linguistic — a real stretch of session language */}
      <g className="lv-box">
        <rect x={40} y={112} width={180} height={166} rx={11} />
        <text x={54} y={136} className="svg-sub">{T("LINGUISTIC")}</text>
        {TD(LINGUISTIC).map((ln, i) => (
          <text key={ln.text} x={54} y={160 + i * 26} className="svg-mono small">
            {typed(ln.text, t, ln.at, ln.at + 1900)}
            {t > ln.at && t < ln.at + 2000 ? caret(t) : ""}
          </text>
        ))}
        <text x={54} y={240} className="svg-sub" style={{ opacity: t > 7800 ? 1 : 0.4 }}>{T("→ embedded per sentence")}</text>
        <text x={54} y={262} className="svg-sub">{T("transcript embeddings")}</text>
      </g>

      {/* event tokens — the paralinguistic stream */}
      <g className="lv-box">
        <rect x={230} y={112} width={180} height={166} rx={11} />
        <text x={244} y={136} className="svg-sub">{T("EVENT TOKENS")}</text>
        {TD(EVENT_TOKENS).map((e2, i) => {
          const p = eph(t, e2.at, e2.at + 400);
          const col = i % 2;
          const row = Math.floor(i / 2);
          return (
            <g key={e2.tok} style={rise(p, 8)}>
              <g className={`lv-chip ${t > e2.at && t < e2.at + 1100 ? "win" : ""}`}>
                <rect x={242 + col * 80} y={148 + row * 32} width={76} height={24} rx={8} />
                <text x={280 + col * 80} y={164 + row * 32} textAnchor="middle" className="svg-sub">{e2.tok}</text>
              </g>
            </g>
          );
        })}
        <text x={244} y={262} className="svg-sub">{T("SenseVoice events")}</text>
      </g>

      {/* acoustic affect — live point on the valence/arousal plane */}
      <g className="lv-box">
        <rect x={420} y={112} width={180} height={166} rx={11} />
        <text x={434} y={136} className="svg-sub">{T("ACOUSTIC AFFECT")}</text>
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
          <text x={4} y={88} className="svg-sub">{T("valence →")}</text>
          <text x={4} y={12} className="svg-sub">{T("arousal ↑")}</text>
        </g>
        <text x={434} y={262} className="svg-sub">{T("Emotion2Vec+ space")}</text>
      </g>

      <text x={40} y={320} className="svg-sub" style={{ opacity: eph(t, 8600, 9100) }}>{T("alignment tick ✓ — three channels, one clock → fusion")}</text>
      <text x={40} y={380} className="svg-note">
        {T("Three timestamped channels describe the same moment; none is treated as a diagnosis on its own.")}
      </text>
    </svg>
  );
}

/* ---------- 4 · FUSE — gated multimodal net → Behavioral State Vector ---------- */

export function FuseGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = MINDSCAPE_STEP_MS;
  const t = el % L;

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <text x={30} y={40} className="svg-sub">{T("GATED MULTIMODAL FUSION · edges firing layer to layer")}</text>
      <LiveNet
        x={30}
        y={54}
        w={580}
        h={168}
        inputs={[
          { label: T("text"), value: "768d" },
          { label: T("events"), value: T("sparse") },
          { label: T("affect"), value: "1024d" },
          { label: T("longitudinal"), value: "state" },
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
        <text x={48} y={276} className="svg-sub">{T("BEHAVIORAL STATE VECTOR · SIMULATED SESSION STATE")}</text>
        {[T("sleep debt"), T("affect"), T("speech"), T("adherence"), T("energy"), T("risk")].map((dim, i) => {
          const v = 0.25 + 0.65 * noise(i * 3 + 1, t / 2.6);
          const on2 = eph(t, 1400 + i * 150, 2100 + i * 150);
          return (
            <g key={dim} style={{ opacity: 0.3 + 0.7 * on2 }}>
              <rect x={48 + i * 94} y={286} width={86} height={40} rx={7} className="lv-bsvcell" style={{ fillOpacity: q(0.12 + 0.5 * v * on2) }} />
              <text x={91 + i * 94} y={302} textAnchor="middle" className="svg-sub">{dim}</text>
              <text x={91 + i * 94} y={319} textAnchor="middle" className="svg-mono">{(v * on2).toFixed(2)}</text>
            </g>
          );
        })}
        <text x={48} y={346} className="svg-sub">{T("One session-state representation is reused by retrieval, reasoning, and review.")}</text>
      </g>

      <text x={30} y={392} className="svg-note">
        {T("Fusion weighs each synchronized signal before evidence retrieval begins.")}
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
  { label: "DSM-5 criteria", src: "D1" },
  { label: "“anhedonia”", src: "L1" },
  { label: "session 9 · turn 4", src: "D2" },
  { label: "“low mood”", src: "L2" },
  { label: "PHQ-9 trend ↑", src: "D3" },
];

export function RetrievalGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = MINDSCAPE_STEP_MS;
  const t = el % L;
  const qtext = typed(T("persistent low mood + anhedonia"), t, 200, 1300);
  const mergeP = eph(t, 5000, 6200);
  const scanStart = 6600;
  const scanRow = Math.min(4, Math.floor(Math.max(0, t - scanStart) / 480));
  const hop = Math.min(HNSW_PATH.length - 1, Math.floor(Math.max(0, t - 1600) / 550));

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <g className="lv-box hot">
        <rect x={30} y={24} width={330} height={44} rx={10} />
        <text x={44} y={42} className="svg-sub">{T("QUERY STATE · BSV + transcript")}</text>
        <text x={44} y={59} className="svg-mono">“{qtext}{t < 1400 ? caret(t) : ""}”</text>
      </g>

      <g className="lv-box">
        <rect x={380} y={24} width={240} height={54} rx={10} />
        <text x={392} y={42} className="svg-sub">{T("RETRIEVAL AGENT · TRUSTED CORPUS")}</text>
        <text x={392} y={62} className="svg-sub">{T("references + session notes")}</text>
        {Array.from({ length: 5 }).map((_, index) => {
          const active = index === Math.floor(t / 260) % 5;
          return (
            <g key={index} style={{ opacity: active ? 1 : 0.3 }}>
              <rect x={546 + index * 13} y={49} width={9} height={14} rx={2} className={active ? "lv-bar" : "lv-track"} />
              <line x1={548 + index * 13} y1={53} x2={553 + index * 13} y2={53} className="lv-tick" />
              <line x1={548 + index * 13} y1={58} x2={553 + index * 13} y2={58} className="lv-tick" />
            </g>
          );
        })}
      </g>

      {/* DENSE lane: HNSW descent — coarse top layer, greedy hops, dense floor */}
      <g style={{ opacity: mergeP > 0 ? Math.max(0.3, 1 - mergeP) : 1 }}>
        <text x={30} y={96} className="svg-sub">{T("DENSE · MedCPT")}</text>
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
          <text x={86} y={156} textAnchor="middle" className="svg-sub">
            {t < 1600 ? T("vector index ready") : hop < 4 ? T("descending layers…") : T("2 source-linked neighbors")}
          </text>
        </g>
      </g>

      {/* LEXICAL lane: BM25 score bars filling */}
      <g style={{ opacity: mergeP > 0 ? Math.max(0.3, 1 - mergeP) : 1 }}>
        <text x={232} y={96} className="svg-sub">{T("LEXICAL · BM25 SAMPLE RANKING")}</text>
        {TD(BM25_ROWS).map(([label, v], i) => {
          const p = eph(t, 1800 + i * 320, 2600 + i * 320);
          return (
            <g key={label}>
              <text x={232} y={122 + i * 30} className="svg-mono">{label}</text>
              <rect x={232} y={128 + i * 30} width={150} height={7} rx={3.5} className="lv-track thin" />
              <rect x={232} y={128 + i * 30} width={q(150 * (v / 100) * p)} height={7} rx={3.5} className="lv-bar" />
              <text x={392} y={136 + i * 30} textAnchor="end" className="svg-sub">{Math.round(v * p)}</text>
            </g>
          );
        })}
      </g>
      {/* RRF merge — ranked lists visibly interleave (D=dense, L=lexical) → rerank sweep */}
      <text x={412} y={96} className="svg-sub">{T("RRF → BioLinkBERT")}</text>
      {TD(MERGED).map((m, i) => {
        const p = eph(t, 5100 + i * 240, 5500 + i * 240);
        if (p <= 0) return null;
        const scanning = scanRow === i && t > scanStart && t < scanStart + 5 * 480;
        const promoted = i === 3 && t > scanStart + 4 * 480;
        const yy = promoted ? 106 + 2 * 32 : 106 + i * 32 + (i === 2 && t > scanStart + 4 * 480 ? 32 : 0);
        const isFinalTop = t > 9200 && (i === 0 || i === 1 || i === 3);
        return (
          <g key={m.label} className={`lv-chip ${isFinalTop ? "win" : ""}`} style={{ opacity: p }}>
            {scanning && <rect x={424} y={q(yy - 2)} width={204} height={30} rx={8} className="scanline" style={{ opacity: 0.5 + 0.4 * pulse(t, 300) }} />}
            <rect x={430} y={q(yy)} width={192} height={26} rx={8} />
            <rect x={434} y={q(yy + 4)} width={20} height={18} rx={5} className={m.src.startsWith("D") ? "lv-srcbadge dense" : "lv-srcbadge"} />
            <text x={444} y={q(yy + 17)} textAnchor="middle" className="svg-sub">{m.src}</text>
            <text x={460} y={q(yy + 17)} className="svg-mono">{m.label}</text>
          </g>
        );
      })}
      <text x={430} y={288} className="svg-sub" style={{ opacity: t > 9200 ? 1 : 0 }}>{T("evidence set → reasoning ✓")}</text>

      <text x={30} y={330} className="svg-note">{T("Dense retrieval finds related session context; lexical search finds exact clinical language.")}</text>
      <text x={30} y={348} className="svg-note">{T("Rank fusion and biomedical reranking return a compact, source-linked evidence set.")}</text>
    </svg>
  );
}

/* ---------- 6 · REASON — evidence lights up as the words appear ---------- */

const DRAFT = "Recent low-mood pattern warrants clinician follow-up.";
const EVIDENCE = [
  { label: "check-ins · 7-night pattern", trigger: 1900, y: 178, kind: "log" },
  { label: "clinical reference · excerpt", trigger: 3600, y: 236, kind: "rag" },
  { label: "transcript · source turn 14", trigger: 5300, y: 294, kind: "skim" },
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
        <text x={52} y={16} className="svg-sub">{T("criteria")}</text>
        <text x={52} y={30} className="tick ok">{T("matched ✓")}</text>
      </g>
    );
  }
  const u = (((t / 16) % 56) + 56) % 56;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={12} className="svg-sub">{T("“nothing feels fun”")}</text>
      <rect x={0} y={18} width={q(Math.min(56, u) * 1.9)} height={3} rx={1.5} className="lv-bar" />
      <text x={0} y={36} className="svg-sub">{T("turn 14 matched")}</text>
    </g>
  );
}

export function ReasonGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = MINDSCAPE_STEP_MS;
  const t = el % L;
  const draft = typed(DRAFT, t, 600, 6100);

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <g className="lv-box hot">
        <rect x={40} y={46} width={560} height={84} rx={12} />
        <text x={58} y={74} className="svg-sub">{T("DRAFT CLINICAL OBSERVATION · SOURCE-LINKED AS IT IS WRITTEN")}</text>
        <text x={58} y={104} className="svg-mono">“{draft}{t < 6200 ? caret(t) : ""}”</text>
      </g>

      {TD(EVIDENCE).map((e2, i) => {
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
              <text x={202} y={e2.y + 22} className="svg-mono">↳ {e2.label}</text>
              <EvidenceInset kind={e2.kind} x={470} y={e2.y + 4} t={t} lit={lit} />
            </g>
            {lit && <text x={600} y={e2.y + 30} className="tick ok" style={rise(p, 4)}>✓</text>}
          </g>
        );
      })}

      {/* structured output lands: hypothesis · uncertainty · follow-ups */}
      {[
        [T("hypothesis"), T("bounded")],
        [T("uncertainty"), T("visible")],
        [T("follow-ups"), T("3 questions")],
      ].map(([k2, v], i) => (
        <g key={k2} className="lv-chip win" style={rise(eph(t, 6800 + i * 380, 7250 + i * 380), 8)}>
          <rect x={60 + i * 180} y={358} width={164} height={34} rx={9} />
          <text x={74 + i * 180} y={372} className="svg-mono">{k2}</text>
          <text x={74 + i * 180} y={386} className="svg-sub">{v}</text>
        </g>
      ))}

      <text x={40} y={412} className="svg-note">
        {T("Every observation retains evidence and uncertainty; the system does not issue a diagnosis.")}
      </text>
    </svg>
  );
}

/* ---------- 7 · VALIDATE — claims scanned live; one is stopped ---------- */

const V_CLAIMS = [
  { text: "low mood ↔ anhedonia", clause: "criterion A1+A2", verdict: "pass", at: 900 },
  { text: "“CBT is working”", clause: "R-04 outcome rule", verdict: "block", at: 4300 },
  { text: "adherence improving", clause: "course criterion B", verdict: "pass", at: 7700 },
];
const RULEBOOK_LINES = ["A. five+ symptoms / 2 wks", "B. functional impairment", "C. not substance-induced", "R-04 no outcome claims", "R-11 risk language screen"];

export function ValidateGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = MINDSCAPE_STEP_MS;
  const t = el % L;
  const active = TD(V_CLAIMS).findIndex((c) => t >= c.at && t < c.at + 3200);
  const clauseFor = active >= 0 ? TD(V_CLAIMS)[active] : null;
  // which rulebook line the retrieval lands on, per claim
  const clauseLine = active === 0 ? 0 : active === 1 ? 3 : 1;

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <text x={30} y={32} className="lv-phase small">{T("VALIDATION REPLAY · EVIDENCE SUPPORT + FIXED SAFETY RULES")}</text>

      {/* claims queue, left */}
      {TD(V_CLAIMS).map((c, i) => {
        const phase = t < c.at ? "wait" : t < c.at + 1100 ? "retrieve" : t < c.at + 2300 ? "check" : "done";
        return (
          <g key={c.text}>
            <g className={`lv-chip ${phase === "retrieve" || phase === "check" ? "win" : ""}`} style={{ opacity: phase === "wait" ? 0.4 : 1 }}>
              <rect x={30} y={54 + i * 58} width={190} height={44} rx={10} />
              <text x={44} y={73 + i * 58} className="svg-mono">{c.text}</text>
              <text x={44} y={90 + i * 58} className="svg-sub">
                {phase === "wait" ? T("queued") : phase === "retrieve" ? T("finding evidence…") : phase === "check" ? T("checking support…") : c.verdict === "pass" ? `✓ ${c.clause}` : `✗ ${c.clause}`}
              </text>
            </g>
            {(phase === "retrieve" || phase === "check") && (
              <path d={`M 220 ${76 + i * 58} C 260 ${76 + i * 58} 260 150 296 150`} className="lv-edge win" style={{ opacity: 0.8 }} />
            )}
          </g>
        );
      })}

      {/* THE RULEBOOK — DSM-5 + policy, an actual open book being consulted */}
      <g className="lv-box hot">
        <rect x={296} y={54} width={210} height={200} rx={12} />
        <text x={312} y={78} className="svg-sub">{T("TRUSTED REFERENCES + POLICY")}</text>
        {TD(RULEBOOK_LINES).map((ln, i) => {
          const hit = clauseFor && i === clauseLine && t > TD(V_CLAIMS)[active].at + 500;
          return (
            <g key={ln}>
              {hit && <rect x={306} y={88 + i * 30} width={190} height={24} rx={6} className="scanline" style={{ opacity: 0.5 + 0.4 * pulse(t, 400) }} />}
              <text x={314} y={104 + i * 30} className={hit ? "svg-mono" : "svg-mono dim"}>{ln}</text>
            </g>
          );
        })}
        <text x={312} y={246} className="svg-sub">{clauseFor && t > TD(V_CLAIMS)[active].at + 500 ? `matched: ${clauseFor.clause}` : T("awaiting claim…")}</text>
      </g>

      {/* verdict lane, right */}
      <g className="lv-box">
        <rect x={528} y={54} width={92} height={200} rx={12} />
        <text x={574} y={78} textAnchor="middle" className="svg-sub">{T("VERDICTS")}</text>
        {TD(V_CLAIMS).map((c, i) => {
          const done = t > c.at + 2300;
          return (
            <g key={c.text} style={rise(done ? 1 : 0, 6)}>
              <text x={574} y={106 + i * 44} textAnchor="middle" className={c.verdict === "pass" ? "tick ok" : "tick bad"}>{c.verdict === "pass" ? T("✓ pass") : T("✗ block")}</text>
              <text x={574} y={120 + i * 44} textAnchor="middle" className="svg-sub">{c.verdict === "pass" ? T("cited") : T("removed")}</text>
            </g>
          );
        })}
      </g>

      {/* the double gate beneath: model check + deterministic rules */}
      <g className="lv-box">
        <rect x={30} y={274} width={476} height={72} rx={10} />
        <text x={46} y={296} className="svg-sub">{T("TWO RELEASE GATES")}</text>
        <text x={46} y={316} className="svg-mono">{T("1 · NLI evidence-support check")}</text>
        <text x={490} y={316} textAnchor="end" className="tick ok">{t % 3000 < 1600 ? T("checking…") : T("scored ✓")}</text>
        <text x={46} y={334} className="svg-mono">{T("2 · deterministic criteria + risk-language rules")}</text>
        <text x={490} y={334} textAnchor="end" className="tick ok">{t % 3000 < 2300 ? T("checking…") : T("enforced ✓")}</text>
      </g>
      <g className="lv-chip">
        <rect x={528} y={274} width={92} height={72} rx={10} />
        <text x={574} y={300} textAnchor="middle" className="svg-mono">2 ✓ · 1 ✗</text>
        <text x={574} y={318} textAnchor="middle" className="svg-sub">{T("this replay")}</text>
        <text x={574} y={336} textAnchor="middle" className="tick ok" style={{ opacity: eph(t, 10200, 10700) }}>{T("cited ✓")}</text>
      </g>

      <text x={30} y={376} className="svg-note">{T("A claim passes only when evidence and fixed rules support it.")}</text>
      <text x={30} y={394} className="svg-note">{T("Failed claims are removed before review; the clinician still owns the final judgment.")}</text>
    </svg>
  );
}

/* ---------- 8 · REVIEW — source-linked context stays under clinician control ---------- */

export function ReviewGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = MINDSCAPE_STEP_MS;
  const t = el % L;
  const reviewStep = Math.min(2, Math.floor(t / 2200));
  const sources = [
    { id: "A-197", lines: [T("“I have felt low"), T("most of this week.”")], support: T("session evidence") },
    { id: "R-04", lines: [T("Low-mood pattern"), T("requires follow-up.")], support: T("retrieved reference") },
    { id: "V-02", lines: [T("Evidence supports a"), T("bounded observation.")], support: T("validation gate") },
  ];

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <g className="lv-box hot">
        <rect x={24} y={20} width={592} height={42} rx={10} />
        <text x={40} y={39} className="svg-label small">{T("CLINICIAN REVIEW SURFACE")}</text>
        <text x={40} y={54} className="svg-sub">{T("source → supported claim → uncertainty → human action")}</text>
        <text x={600} y={46} textAnchor="end" className="tick ok">{T("HUMAN-OWNED ✓")}</text>
      </g>

      <g className="lv-box">
        <rect x={24} y={78} width={260} height={258} rx={12} />
        <text x={40} y={101} className="svg-sub">{T("TRACEABLE SOURCE PACKET")}</text>
        {sources.map((source, index) => (
          <g key={source.id} className={`lv-chip ${reviewStep >= index ? "win" : ""}`} style={rise(eph(t, 500 + index * 700, 1050 + index * 700), 6)}>
            <rect x={38} y={114 + index * 64} width={232} height={54} rx={8} />
            <rect x={46} y={122 + index * 64} width={42} height={18} rx={5} className="lv-srcbadge dense" />
            <text x={67} y={135 + index * 64} textAnchor="middle" className="svg-mono">{source.id}</text>
            <text x={96} y={131 + index * 64} className="svg-mono">{source.lines[0]}</text>
            <text x={96} y={146 + index * 64} className="svg-mono">{source.lines[1]}</text>
            <text x={96} y={160 + index * 64} className="svg-sub">{source.support}</text>
          </g>
        ))}
        <text x={40} y={320} className="svg-sub">{T("Every claim opens its source packet.")}</text>
      </g>

      <g className="lv-box hot">
        <rect x={300} y={78} width={316} height={158} rx={12} />
        <text x={318} y={101} className="svg-sub">{T("SUPPORTED REVIEW STATEMENT")}</text>
        <text x={318} y={126} className="svg-label">{T("Recent sessions show a persistent")}</text>
        <text x={318} y={143} className="svg-label">{T("low-mood pattern for follow-up.")}</text>
        <text x={318} y={162} className="svg-mono">{T("evidence linked · uncertainty retained")}</text>
        <text x={318} y={178} className="svg-mono">{T("longitudinal context")}</text>
        <g className="lv-chip win">
          <rect x={318} y={188} width={132} height={25} rx={7} />
          <text x={384} y={204} textAnchor="middle" className="tick ok">{T("SUPPORTED ✓")}</text>
        </g>
        <g className="lv-chip">
          <rect x={460} y={188} width={138} height={25} rx={7} />
          <text x={529} y={204} textAnchor="middle" className="svg-sub">{T("UNCERTAINTY SHOWN")}</text>
        </g>
        <text x={318} y={228} className="svg-sub">{T("No autonomous diagnosis · clinician decides.")}</text>
      </g>

      <g className="lv-box">
        <rect x={300} y={250} width={316} height={86} rx={12} />
        <text x={318} y={273} className="svg-sub">{T("CLINICIAN ACTIONS")}</text>
        {[
          { x: 318, label: T("EDIT NOTE") },
          { x: 410, label: T("ASK FOLLOW-UP") },
          { x: 516, label: T("HOLD") },
        ].map((action, index) => (
          <g key={action.label} className={`lv-chip ${reviewStep === index ? "win" : ""}`}>
            <rect x={action.x} y={286} width={index === 1 ? 98 : 82} height={30} rx={7} />
            <text x={action.x + (index === 1 ? 49 : 41)} y={305} textAnchor="middle" className={reviewStep === index ? "tick ok" : "svg-sub"}>{action.label}</text>
          </g>
        ))}
      </g>

      <path d="M 284 198 C 292 198 292 144 300 144 M 284 262 C 292 262 292 294 300 294" className="lv-edge win" style={{ opacity: 0.65 }} />
      <text x={24} y={374} className="svg-note">{T("Source, support, uncertainty, and available clinician actions stay together.")}</text>
      <text x={24} y={396} className="svg-note">{T("Synthetic-data support prototype: the system proposes context; the clinician decides.")}</text>
    </svg>
  );
}

/* ---------- 9 · GOVERNED REFINEMENT — feedback cannot self-train live ---------- */

export function ClinicalRefinementGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = MINDSCAPE_STEP_MS;
  const t = el % L;
  const queueP = eph(t, 500, 2400);
  const evalP = eph(t, 2200, 5200);
  const candidateP = eph(t, 5000, 6900);
  const gateP = eph(t, 6800, 8600);
  const releaseP = eph(t, 8500, 9400);

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <text x={24} y={28} className="lv-phase small">{T("GOVERNED RL REFINEMENT · OFFLINE ONLY")}</text>
      <g className="lv-chip">
        <rect x={476} y={10} width={142} height={28} rx={8} />
        <text x={547} y={28} textAnchor="middle" className="svg-mono">{T("R&amp;D DESIGN TARGET")}</text>
      </g>

      <g className="lv-box hot">
        <rect x={24} y={58} width={152} height={170} rx={11} />
        <text x={100} y={82} textAnchor="middle" className="svg-label small">{T("CLINICIAN ACTION")}</text>
        {[T("accept context"), T("revise note"), T("request evidence"), T("escalate")].map((label, index) => (
          <g key={label} className={`lv-chip ${queueP > (index + 1) / 5 ? "win" : ""}`}>
            <rect x={38} y={96 + index * 29} width={124} height={22} rx={6} />
            <text x={100} y={111 + index * 29} textAnchor="middle" className="svg-mono small">{label}</text>
          </g>
        ))}
      </g>

      <g className={`lv-node ${queueP > 0 && evalP < 0.2 ? "is-live" : ""}`}>
        <rect x={208} y={58} width={154} height={78} rx={11} />
        <text x={285} y={83} textAnchor="middle" className="svg-label small">{T("GOVERNED QUEUE")}</text>
        <text x={285} y={103} textAnchor="middle" className="svg-sub">{T("approved · de-ID")}</text>
        <text x={285} y={121} textAnchor="middle" className="tick ok">{T("offline only ✓")}</text>
      </g>
      <path d="M 176 142 C 190 142 194 98 208 98" className="lv-edge win" style={{ opacity: queueP }} />

      <g className="lv-box">
        <rect x={208} y={154} width={154} height={154} rx={11} />
        <text x={285} y={178} textAnchor="middle" className="svg-label small">{T("OFFLINE RL + EVAL")}</text>
        {[T("retrieval grounding"), T("safety behavior"), T("latency + drift"), T("subgroup review")].map((label, index) => {
          const rowP = eph(t, 2600 + index * 480, 3300 + index * 480);
          return (
            <g key={label} style={{ opacity: 0.25 + rowP * 0.75 }}>
              <text x={222} y={205 + index * 25} className="svg-mono small">{label}</text>
              <text x={348} y={205 + index * 25} textAnchor="end" className="tick ok">{rowP > 0.8 ? "✓" : "·"}</text>
            </g>
          );
        })}
      </g>

      <g className={`lv-node ${candidateP > 0 && gateP === 0 ? "is-live" : ""}`}>
        <rect x={400} y={58} width={216} height={112} rx={11} />
        <text x={508} y={82} textAnchor="middle" className="svg-label small">{T("VERSION CANDIDATE")}</text>
        {[T("prompt policy"), T("retrieval path"), T("safety rules"), T("review UI")].map((label, index) => (
          <g key={label} className={`lv-chip ${candidateP > (index + 1) / 5 ? "win" : ""}`}>
            <rect x={414 + (index % 2) * 96} y={96 + Math.floor(index / 2) * 32} width={90} height={24} rx={6} />
            <text x={459 + (index % 2) * 96} y={112 + Math.floor(index / 2) * 32} textAnchor="middle" className="svg-mono small">{label}</text>
          </g>
        ))}
      </g>
      <path d="M 362 232 C 388 232 382 116 400 116" className="lv-edge win" style={{ opacity: candidateP }} />

      <g className="lv-box hot">
        <rect x={400} y={194} width={216} height={114} rx={11} />
        <text x={508} y={218} textAnchor="middle" className="svg-label small">{T("SAFETY + REGRESSION GATE")}</text>
        {[T("unsupported claims"), T("retrieval grounding"), T("clinical boundary"), T("human review")].map((label, index) => (
          <g key={label} style={{ opacity: 0.28 + gateP * 0.72 }}>
            <text x={416} y={243 + index * 17} className="svg-mono small">
              {gateP > (index + 1) / 5 ? "✓ " : "… "}{label}
            </text>
          </g>
        ))}
      </g>

      <g className="lv-box">
        <rect x={24} y={334} width={592} height={58} rx={10} />
        <text x={42} y={358} className="svg-sub">{T("NO LIVE WEIGHT UPDATES FROM CLINICIAN ACTIONS")}</text>
        <text x={42} y={377} className="svg-mono small">{T("approved feedback → offline RL/eval → regression suite → human release")}</text>
        <g className={`lv-stamp ${releaseP > 0 ? "big" : ""}`} style={rise(releaseP, 6)}>
          <rect x={476} y={344} width={124} height={36} rx={8} />
          <text x={538} y={367} textAnchor="middle" className="tick ok">{T("FUTURE RELEASE ✓")}</text>
        </g>
      </g>

      <path d="M 508 308 C 508 326 538 326 538 344" className="lv-edge win" style={{ opacity: releaseP }} />
      <text x={24} y={414} className="svg-note">{T("Offline evaluation and a human release board decide whether a candidate ships.")}</text>
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
      "MindScape converts live session signals into source-linked context for clinician review. Capture, perception, fusion, retrieval, reasoning, and validation run in order; unsupported claims stop before the handoff.",
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
      "WebRTC audio enters a one-second rolling buffer and leaves as timestamped analysis packets. Each new packet carries the exact source words forward, so later signals remain traceable to the live session.",
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
    pilotTitle: "One voice becomes three synchronized, bounded signals",
    pilotBody:
      "One synchronized stream becomes three bounded signals: transcript meaning, speech-event tokens, and an acoustic affect representation. Shared timestamps let the system compare them without treating any single signal as clinical proof.",
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
      "A gated multimodal unit weighs transcript, speech-event, acoustic, and longitudinal context. It produces one Behavioral State Vector that gives retrieval, reasoning, and review the same synchronized session context.",
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
      "Dense retrieval finds semantically related session context while BM25 finds exact language in trusted clinical references and prior notes. Rank fusion and biomedical reranking reduce both result sets to compact, source-linked evidence.",
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
      "The reasoning layer writes a bounded clinical observation only after linking it to session evidence and trusted references. Its output keeps uncertainty visible and proposes follow-up questions; it does not issue a diagnosis.",
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
      "Every draft claim must pass an evidence-support check and deterministic clinical-safety rules. Supported claims retain their source and uncertainty; failed claims are removed before a clinician sees them.",
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
      "The review surface keeps each supported statement beside its source, uncertainty, and available clinician actions. The system can propose context or follow-ups, but the clinician edits, holds, or advances the case.",
    metrics: [
      { k: "output", v: "source-linked review" },
      { k: "decision owner", v: "clinician" },
      { k: "status", v: "MVP · synthetic data" },
    ],
    graphic: (a) => <ReviewGraphic a={a} />,
  },
  {
    label: "Governed RL refinement",
    sub: "offline improvement loop",
    pilotTitle: "Feedback can improve a future version—not rewrite the live system",
    pilotBody:
      "Approved, de-identified clinician feedback enters an offline reinforcement-learning and evaluation harness. Candidate changes must pass grounding, safety, subgroup, and regression checks before a human release board can approve them.",
    metrics: [
      { k: "feedback", v: "approved + de-identified" },
      { k: "refinement", v: "offline RL + evaluation" },
      { k: "release", v: "regression + human gate" },
    ],
    graphic: (a) => <ClinicalRefinementGraphic a={a} />,
  },
];

export function MindscapeChapter() {
  return (
    <ChapterShell
      id="mindscape"
      accent="#8ef0c0"
      kicker={T("PROJECT 03 · MEDICAL AI R&D")}
      title={T("MindScape")}
      subtitle="A medical AI assistant for evidence-grounded, clinician-controlled mental-health screening and diagnostic review."
      steps={TD(STEPS)}
      stepMs={MINDSCAPE_STEP_MS}
    />
  );
}
