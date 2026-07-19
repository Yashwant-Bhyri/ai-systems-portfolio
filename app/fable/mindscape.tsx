"use client";

import { ChapterShell, type StepDef } from "./chapter-shell";
import { useSim, ph, eph, pulse, noise, bez, typed, caret, rise, Wave, q } from "./live";

/* Live scenes — a session actually flowing through the clinical pipeline. */

/* ---------- 1 · THE PIPELINE — a session packet traverses; an ungrounded one is blocked ---------- */

const STAGES = ["CAPTURE", "PERCEIVE", "FUSE", "RETRIEVE", "REASON", "VALIDATE", "REVIEW"];

function PipelineGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 10400;
  const t = el % L;
  const y = 176;
  const stageX = (i: number) => 24 + i * 86 + 36;

  // main packet: one stage per second from 600
  const seg = Math.min(6, Math.floor(Math.max(0, t - 600) / 1000));
  const segP = seg >= 6 ? 1 : ph(t, 600 + seg * 1000, 600 + seg * 1000 + 1000);
  const mainX = seg >= 6 ? stageX(6) : stageX(seg) + (stageX(seg + 1) - stageX(seg)) * segP;
  const active = Math.min(6, seg + (segP > 0.5 ? 1 : 0));

  // shadow packet: launched later, blocked at VALIDATE (stage 5)
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

      {/* the session moving through */}
      {t > 600 && t < 8400 && <circle cx={q(mainX)} cy={y - 18} r={6} className="lv-pulse" />}
      {t > 600 && t < 8400 && <text x={q(mainX)} y={y - 32} textAnchor="middle" className="svg-sub tiny">session</text>}
      {t >= 8400 && (
        <g className="lv-stamp" style={rise(eph(t, 8400, 8800), 6)}>
          <rect x={470} y={252} width={150} height={38} rx={9} />
          <text x={545} y={276} textAnchor="middle" className="svg-label small">validated ✓</text>
        </g>
      )}

      {/* the ungrounded claim that doesn't make it */}
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

/* ---------- 2 · PERCEPTION + FUSION — three live streams, one state ---------- */

const CHECKINS = [
  { at: 1400, label: "sleep 4.2 h" },
  { at: 3800, label: "mood 3/10" },
  { at: 6200, label: "missed check-in" },
];

function PerceiveGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 9600;
  const t = el % L;
  const words = "…I haven't really been sleeping since the move, maybe four hours…".split(" ");

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      {/* shared moving time axis */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const xx = q(40 + (((i * 90 - t / 24) % 540) + 540) % 540);
        return <line key={i} x1={xx} y1={44} x2={xx} y2={264} className="lv-tick" style={{ opacity: 0.35 }} />;
      })}
      <text x={40} y={36} className="svg-sub">SHARED CLINICAL TIMELINE · aligned before fusion</text>

      {/* transcript stream */}
      <text x={40} y={78} className="svg-mono tinytext">transcript</text>
      {words.map((w, i) => {
        const appear = 500 + i * 380;
        if (t < appear) return null;
        const xx = q(130 + ((i * 52 - (t - appear) / 40) % 470));
        return (
          <text key={i} x={xx} y={78} className="svg-mono tinytext" style={{ opacity: Math.max(0, 1 - (t - appear) / 6000) }}>
            {w}
          </text>
        );
      })}

      {/* acoustic stream — a real waveform */}
      <text x={40} y={136} className="svg-mono tinytext">acoustics</text>
      <Wave x={130} y={116} w={440} h={34} bars={40} t={t} on={t % 3200 < 2300 ? 1 : 0.12} />
      <text x={570} y={136} textAnchor="end" className="svg-sub tiny">{t % 3200 < 2300 ? "tremor ↑ · pace ↓" : "silence"}</text>

      {/* check-in events dropping in */}
      <text x={40} y={196} className="svg-mono tinytext">check-ins</text>
      {CHECKINS.map((c) => (
        <g key={c.label} className="lv-chip" style={rise(eph(t, c.at, c.at + 400), 8)}>
          <rect x={130 + (c.at / L) * 400} y={178} width={104} height={26} rx={8} />
          <text x={182 + (c.at / L) * 400} y={195} textAnchor="middle" className="svg-mono tinytext">{c.label}</text>
        </g>
      ))}

      {/* gated fusion into the state vector */}
      {[78, 126, 191].map((sy, i) => (
        <path key={sy} d={`M 580 ${sy} C 610 ${sy} 606 ${236} 620 ${252}`} className="lv-edge" style={{ opacity: 0.25 + 0.5 * pulse(t + i * 400, 1200) }} />
      ))}
      <g className="lv-box hot">
        <rect x={150} y={252} width={340} height={104} rx={12} />
        <text x={168} y={278} className="svg-sub">BEHAVIORAL STATE VECTOR · updating live</text>
        {["sleep debt", "affect", "speech tremor", "adherence", "risk"].map((d, i) => {
          const v = 0.25 + 0.65 * noise(i * 3 + 1, t / 2.2);
          return (
            <g key={d}>
              <text x={168} y={302 + i * 12} className="svg-sub tiny">{d}</text>
              <rect x={250} y={295 + i * 12} width={220} height={6} rx={3} className="lv-track thin" />
              <rect x={250} y={295 + i * 12} width={q(220 * v)} height={6} rx={3} className="lv-bar" />
            </g>
          );
        })}
      </g>

      <text x={40} y={396} className="svg-note">
        A shaky voice, four hours of sleep, and a missed check-in land in ONE state — not three spreadsheets.
      </text>
    </svg>
  );
}

/* ---------- 3 · HYBRID RETRIEVAL — two searches race, fuse, rerank ---------- */

const DENSE_HITS = [
  { label: "DSM-5 §300.02 GAD", s: 0.92 },
  { label: "session 11, turn 8", s: 0.85 },
  { label: "sleep-anxiety review", s: 0.77 },
];
const BM25_HITS = [
  { label: "“sleep disruption”", s: 0.88 },
  { label: "check-in log w/ terms", s: 0.81 },
  { label: "note 2026-05-12", s: 0.7 },
];
const MERGED = ["DSM-5 §300.02 GAD", "“sleep disruption”", "session 11, turn 8", "check-in log w/ terms", "sleep-anxiety review"];

function RetrievalGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 10600;
  const t = el % L;
  const qtext = typed("sleep disruption with anxiety episodes", t, 200, 1400);
  const mergeP = eph(t, 4600, 5800);
  const scanY = 6200;
  const scanRow = Math.min(4, Math.floor(Math.max(0, t - scanY) / 480));

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <g className="lv-box hot">
        <rect x={30} y={26} width={330} height={44} rx={10} />
        <text x={44} y={44} className="svg-sub">QUERY</text>
        <text x={44} y={61} className="svg-mono tinytext">“{qtext}{t < 1500 ? caret(t) : ""}”</text>
      </g>

      {/* two lanes fire simultaneously */}
      {[
        { title: "DENSE · MedCPT + HNSW", hits: DENSE_HITS, x: 30 },
        { title: "LEXICAL · BM25", hits: BM25_HITS, x: 220 },
      ].map((lane, li) => (
        <g key={lane.title} style={{ opacity: mergeP > 0 ? Math.max(0.25, 1 - mergeP) : 1 }}>
          <text x={lane.x} y={100} className="svg-sub tiny">{lane.title}</text>
          {lane.hits.map((h, i) => {
            const at = 1700 + i * 420 + li * 180;
            const p = eph(t, at, at + 380);
            return (
              <g key={h.label} className="lv-chip" style={rise(p, 8)}>
                <rect x={lane.x} y={110 + i * 34} width={172} height={28} rx={8} />
                <text x={lane.x + 8} y={128 + i * 34} className="svg-mono tinytext">{h.label}</text>
                <text x={lane.x + 164} y={128 + i * 34} textAnchor="end" className="svg-mono tinytext">{(h.s * p).toFixed(2)}</text>
              </g>
            );
          })}
        </g>
      ))}
      <text x={205} y={128} textAnchor="middle" className="lv-phase small" style={{ opacity: t > 1700 && t < 4600 ? 1 : 0 }}>RACING</text>

      {/* RRF merge — one interleaved column */}
      <text x={430} y={100} className="svg-sub tiny">RRF MERGE → BioLinkBERT RERANK</text>
      {MERGED.map((m, i) => {
        const p = eph(t, 4700 + i * 240, 5100 + i * 240);
        if (p <= 0) return null;
        const scanning = scanRow === i && t > scanY && t < scanY + 5 * 480;
        const promoted = i === 3 && t > scanY + 4 * 480; // rerank pulls the log up
        const yy = promoted ? 110 + 2 * 34 : 110 + i * 34 + (promoted ? 0 : i === 2 && t > scanY + 4 * 480 ? 34 : 0);
        return (
          <g key={m} className={`lv-chip ${i < 3 && t > 8600 ? "win" : ""}`} style={{ opacity: p, transform: `translateY(${(1 - p) * 8}px)` }}>
            {scanning && <rect x={424} y={q(yy - 2)} width={200} height={32} rx={8} className="scanline" style={{ opacity: 0.5 + 0.4 * pulse(t, 300) }} />}
            <rect x={430} y={q(yy)} width={188} height={28} rx={8} />
            <text x={438} y={q(yy + 18)} className="svg-mono tinytext">{m}</text>
          </g>
        );
      })}
      <text x={430} y={296} className="svg-sub tiny" style={{ opacity: t > 8600 ? 1 : 0 }}>top-k → reasoning · DSM-5 aligned ✓</text>

      <text x={30} y={340} className="svg-note">Two search philosophies fire at once — meaning-based and term-exact.</text>
      <text x={30} y={358} className="svg-note">Reciprocal-rank fusion interleaves them; a biomedical reranker sweeps the list.</text>
      <text x={30} y={376} className="svg-note">Recall without noise, live.</text>
    </svg>
  );
}

/* ---------- 4 · GROUNDED REASONING — evidence lights up as the words appear ---------- */

const DRAFT = "Sleep disruption pattern consistent with reported anxiety episodes.";
const EVIDENCE = [
  { label: "check-in log · 5 of last 7 nights", trigger: 1900, y: 210 },
  { label: "DSM-5 criteria §300.02 · retrieval hit", trigger: 3600, y: 266 },
  { label: "session transcript · turn 14", trigger: 5300, y: 322 },
];

function ReasonGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 9400;
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
              d={`M ${170 + i * 130} 130 C ${170 + i * 130} 170 ${200} ${e2.y + 16} 186 ${e2.y + 16}`}
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

      <text x={40} y={396} className="svg-note">
        The sentence and its sources appear together — as each phrase lands, the evidence that licenses it lights up.
      </text>
    </svg>
  );
}

/* ---------- 5 · VALIDATION GATES — claims scanned live; one is stopped ---------- */

const V_CLAIMS = [
  { text: "sleep ↔ anxiety pattern", entail: 0.94, at: 800, ok: true },
  { text: "“responding well to CBT”", entail: 0.31, at: 3600, ok: false },
  { text: "adherence improving", entail: 0.88, at: 6400, ok: true },
];

function ValidateGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 10400;
  const t = el % L;
  const gateX = 330;

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      {/* the gate */}
      <rect x={gateX} y={60} width={16} height={220} rx={6} className="lv-gate" />
      <text x={gateX + 8} y={46} textAnchor="middle" className="svg-sub">NLI GATE · DeBERTa</text>

      {V_CLAIMS.map((c, i) => {
        const approach = eph(t, c.at, c.at + 900); // slide to the gate
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

      {/* deterministic gates panel */}
      <g className="lv-box">
        <rect x={400} y={286} width={220} height={92} rx={10} />
        <text x={416} y={310} className="svg-sub">DETERMINISTIC GATES</text>
        <text x={416} y={334} className="svg-mono tinytext">DSM-5 criteria check {t % 2600 < 1300 ? "…" : " ✓"}</text>
        <text x={416} y={356} className="svg-mono tinytext">risk-language screen {t % 2600 < 1900 ? "…" : " ✓"}</text>
      </g>
      <g className="lv-chip">
        <rect x={30} y={300} width={190} height={56} rx={10} />
        <text x={44} y={322} className="svg-sub tiny">this replay</text>
        <text x={44} y={342} className="svg-mono tinytext">passed 2 · blocked 1</text>
      </g>

      <text x={30} y={402} className="svg-note">
        A claim without evidence doesn't get softened — you just watched it get stopped. The model never negotiates with the gate.
      </text>
    </svg>
  );
}

/* ---------- 6 · CLINICIAN REVIEW — the handoff assembles; Nancy keeps the loop alive ---------- */

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

function ReviewGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 9800;
  const t = el % L;
  const sparkN = 3 + CHAT.filter((c) => t > c.at + 600).length * 2;

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

      {/* Nancy's async loop — actual messages */}
      <g className="lv-box hot">
        <rect x={380} y={36} width={240} height={190} rx={12} />
        <text x={398} y={62} className="svg-sub">NANCY · between-session check-in</text>
        {CHAT.map((c, i) => {
          const p = eph(t, c.at, c.at + 450);
          if (p <= 0) return null;
          const left = c.who === "patient";
          return (
            <g key={c.at} style={rise(p, 8)}>
              <rect x={left ? 396 : 436} y={76 + i * 44} width={172} height={30} rx={10} className={left ? "lv-bubble" : "lv-bubble nancy"} />
              <text x={left ? 406 : 446} y={95 + i * 44} className="svg-mono tinytext">{typed(c.text, t, c.at, c.at + 900)}</text>
            </g>
          );
        })}
      </g>

      {/* every exchange extends the validated timeline */}
      <g className="lv-box">
        <rect x={380} y={246} width={240} height={110} rx={12} />
        <text x={398} y={272} className="svg-sub">VALIDATED TIMELINE · growing</text>
        <polyline
          points={Array.from({ length: sparkN })
            .map((_, i) => `${q(400 + i * 24)},${q(330 - 28 * noise(i * 2 + 3, 1000) - (i > 5 ? 8 : 0))}`)
            .join(" ")}
          className="lv-line"
        />
        {t > 5800 && <circle cx={q(400 + (sparkN - 1) * 24)} cy={q(330 - 28 * noise((sparkN - 1) * 2 + 3, 1000) - 8)} r={3.6} className="lv-pulse" style={{ opacity: 0.4 + 0.6 * pulse(t, 800) }} />}
      </g>

      <text x={30} y={396} className="svg-note">
        The loop keeps running between sessions — each check-in you watched lands as a new point on the same validated timeline.
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
    label: "Perception + fusion",
    sub: "many streams, one state",
    pilotTitle: "What was said, how it was said, and what happened since",
    pilotBody:
      "Three live streams on one moving clinical timeline: the transcript scrolling past, the acoustic waveform carrying tremor and pace, check-in events dropping in. They're aligned in time and fused through gates into one behavioral state vector — you can watch it update.",
    metrics: [
      { k: "streams fused", v: "3+" },
      { k: "alignment", v: "temporal, gated" },
      { k: "output", v: "state vector" },
    ],
    graphic: (a) => <PerceiveGraphic a={a} />,
  },
  {
    label: "Hybrid retrieval",
    sub: "recall without noise",
    pilotTitle: "Two search philosophies, fused and reranked",
    pilotBody:
      "The query fires both lanes at once — MedCPT dense vectors over HNSW/Faiss find meaning while BM25 pins exact clinical terms. Reciprocal-rank fusion interleaves the two ranked lists in front of you, then the BioLinkBERT reranker sweeps down and reorders. What survives is top-k evidence.",
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
      "The draft observation writes itself word by word — and as each phrase lands, the evidence that licenses it lights up and links in: the check-in log, the DSM-5 retrieval hit, the session turn. The sentence and its lineage are never separate.",
    metrics: [
      { k: "grounding", v: "retrieval-first" },
      { k: "lineage", v: "per sentence" },
      { k: "audit", v: "clinician-facing" },
    ],
    graphic: (a) => <ReasonGraphic a={a} />,
  },
  {
    label: "Validation gates",
    sub: "the hard stop",
    pilotTitle: "Unsupported claims don't get softened — they get stopped",
    pilotBody:
      "Three claims approach the gate. The DeBERTa NLI scan runs on each — entailment scores computing live — and the one that can't find its evidence is blocked and drops away in front of you, while deterministic DSM-5 and risk-language rules run alongside. The model never negotiates with the gate.",
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
      "The handoff summary assembles row by row while Nancy, the async companion, runs a real check-in exchange — and each exchange you watch lands as a new point on the validated timeline. Framed honestly: a clinician-support MVP on synthetic data, built to production discipline.",
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
      stepMs={9800}
    />
  );
}
