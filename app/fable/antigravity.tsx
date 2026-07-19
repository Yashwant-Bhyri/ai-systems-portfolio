"use client";

import { ChapterShell, type StepDef } from "./chapter-shell";
import { useSim, ph, eph, ez, pulse, noise, bez, script, typed, caret, rise, Wave, fmtMs, q } from "./live";

/* =====================================================================
   Every graphic here is a LIVE scene: a scripted operation replayed on a
   sim clock. Nothing is a static diagram — text streams, counters count,
   lanes race, decisions fire. Pausing the tour freezes the whole scene.
   ===================================================================== */

/* ---------- 1 · THE LOOP — one real turn, replayed live ---------- */

function LoopGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 9600;
  const t = el % L;
  const turn = 7 + (Math.floor(el / L) % 40);
  const ring = "M 140 210 C 140 90 500 90 500 210 C 500 330 140 330 140 210 Z";

  const listening = t < 2600;
  const deciding = t >= 2600 && t < 3800;
  const speaking = t >= 3800 && t < 6600;
  const closed = t >= 6600;
  const decideMs = 940 * eph(t, 2600, 3540);
  const arc = ph(t, 200, 6600) * 100;

  const partial = script(
    [
      { at: 700, end: 1700, text: "“i sharded the red is state”" },
      { at: 1900, end: 2500, text: "“i sharded the redis state by session”" },
    ],
    t,
  );
  const q = typed("“what happens when one shard dies mid-interview?”", t, 4000, 6300);

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <path d={ring} className="lv-ring track" />
      <path d={ring} className="lv-ring" pathLength={100} strokeDasharray={`${arc} 100`} />
      {arc > 1 && arc < 99 && (
        <path d={ring} className="lv-ring tip" pathLength={100} strokeDasharray="1.6 100" strokeDashoffset={-(arc - 1.6)} />
      )}

      {/* candidate */}
      <g className={`lv-node ${listening ? "is-live" : ""}`}>
        <rect x={44} y={172} width={170} height={72} rx={12} />
        <text x={129} y={198} textAnchor="middle" className="svg-label">CANDIDATE</text>
        <text x={129} y={216} textAnchor="middle" className="svg-sub">{listening ? "speaking now" : "listening"}</text>
      </g>
      <Wave x={54} y={252} w={150} h={26} t={t} on={listening ? 1 : 0.06} />

      {/* STT */}
      <g className={`lv-node ${listening && t > 600 ? "is-live" : ""}`}>
        <rect x={244} y={40} width={190} height={54} rx={12} />
        <text x={339} y={62} textAnchor="middle" className="svg-label">STREAMING STT</text>
        <text x={339} y={80} textAnchor="middle" className="svg-sub">voice → text, live</text>
      </g>
      <text x={339} y={116} textAnchor="middle" className="svg-mono small">{partial}{listening && partial ? caret(t) : ""}</text>

      {/* orchestrator */}
      <g className={`lv-node ${deciding ? "is-live" : ""}`}>
        <rect x={432} y={172} width={172} height={72} rx={12} />
        <text x={518} y={198} textAnchor="middle" className="svg-label">ORCHESTRATOR</text>
        <text x={518} y={216} textAnchor="middle" className="svg-sub">
          {deciding ? "fusing 5 signals…" : t >= 3800 ? "follow-up chosen ✓" : "fast + background lanes"}
        </text>
      </g>

      {/* TTS */}
      <g className={`lv-node ${speaking ? "is-live" : ""}`}>
        <rect x={244} y={318} width={190} height={54} rx={12} />
        <text x={339} y={340} textAnchor="middle" className="svg-label">VOICE OUT · TTS</text>
        <text x={339} y={358} textAnchor="middle" className="svg-sub">{speaking ? "speaking the next question" : "idle"}</text>
      </g>
      <Wave x={452} y={286} w={140} h={24} t={t} on={speaking ? 1 : 0.06} />
      <text x={339} y={396} textAnchor="middle" className="svg-mono small">{q}{speaking ? caret(t) : ""}</text>

      {/* live center readout */}
      <g>
        <text x={320} y={168} textAnchor="middle" className="lv-phase">
          {listening ? "LISTENING" : deciding ? "DECIDING" : speaking ? "SPEAKING" : "TURN CLOSED"}
        </text>
        {deciding && (
          <text x={320} y={206} textAnchor="middle" className="lv-counter">{fmtMs(decideMs)}</text>
        )}
        {closed && (
          <g style={rise(eph(t, 6600, 7100))}>
            <text x={320} y={206} textAnchor="middle" className="lv-counter">0.94 s</text>
            <text x={320} y={230} textAnchor="middle" className="svg-sub">full loop · under a second ✓</text>
          </g>
        )}
        {(listening || speaking) && (
          <text x={320} y={206} textAnchor="middle" className="svg-sub">turn #{turn} · live replay</text>
        )}
      </g>
    </svg>
  );
}

/* ---------- 2 · STREAMING STT — partials mutate, finals commit ---------- */

const STT_FINAL_1 = ["I", "sharded", "the", "Redis", "state", "by", "session."];
const STT_CONF_1 = [0.98, 0.94, 0.97, 0.92, 0.96, 0.99, 0.95];

function SttGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 8600;
  const t = el % L;
  const talking = (t >= 300 && t < 3100) || (t >= 4400 && t < 7000);

  const partial = script(
    [
      { at: 500, end: 1500, text: "i shard it the red" },
      { at: 1700, end: 2400, text: "i sharded the redis state" },
      { at: 2500, end: 3100, text: "i sharded the redis state by sess" },
      { at: 3300, end: 3650, text: "" },
      { at: 4600, end: 5500, text: "so each interview no" },
      { at: 5600, end: 6300, text: "so each interview node keeps its own state" },
      { at: 7000, end: 7350, text: "" },
    ],
    t,
  );

  const lat = 168 + Math.round(noise(Math.floor(t / 420) % 23, 999) * 34);
  const final1 = eph(t, 3350, 3750);
  const final2 = eph(t, 7050, 7450);

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      {/* live mic feed */}
      <text x={40} y={52} className="svg-sub">LIVE AUDIO · 16 kHz</text>
      <Wave x={40} y={64} w={220} h={56} bars={26} t={t} on={talking ? 1 : 0.05} />
      <text x={40} y={150} className="svg-mono small">{talking ? "● capturing" : "○ endpoint detected"}</text>

      {/* latency ticker */}
      <g className="lv-chip">
        <rect x={452} y={40} width={158} height={46} rx={10} />
        <text x={466} y={59} className="svg-sub">partial → screen</text>
        <text x={466} y={78} className="svg-mono">{lat} ms</text>
      </g>

      {/* partial hypothesis lane — text mutates live */}
      <g className="lv-box hot">
        <rect x={300} y={104} width={310} height={58} rx={10} />
        <text x={314} y={126} className="svg-sub">PARTIAL HYPOTHESIS · revised as you speak</text>
        <text x={314} y={148} className="svg-mono">{partial}{partial ? caret(t) : ""}</text>
      </g>

      {/* committed transcript log */}
      <g className="lv-box">
        <rect x={40} y={190} width={570} height={170} rx={12} />
        <text x={58} y={216} className="svg-sub">COMMITTED TRANSCRIPT · endpoint-tuned finals</text>
        <text x={58} y={244} className="svg-mono small dim">…and the interviewer keeps the session context warm.</text>
        {final1 > 0 && (
          <g style={rise(final1)}>
            {STT_FINAL_1.map((w, i) => {
              const p = eph(t, 3450 + i * 90, 3750 + i * 90);
              return (
                <g key={w} style={{ opacity: p }}>
                  <text x={58 + i * 78} y={278} className="svg-mono">{w}</text>
                  <rect x={58 + i * 78} y={286} width={Math.max(24, w.length * 8)} height={4} rx={2} className="lv-conf" style={{ opacity: STT_CONF_1[i] }} />
                  <text x={58 + i * 78} y={304} className="svg-sub tiny">{STT_CONF_1[i].toFixed(2)}</text>
                </g>
              );
            })}
          </g>
        )}
        {final2 > 0 && (
          <g style={rise(final2)}>
            <text x={58} y={334} className="svg-mono">So each interview node keeps its own state.</text>
            <text x={520} y={334} className="tick ok" style={{ opacity: final2 }}>✓ final</text>
          </g>
        )}
      </g>

      <text x={40} y={396} className="svg-note">
        Watch the hypothesis correct itself mid-word — the room hears you the way a person does.
      </text>
    </svg>
  );
}

/* ---------- 3 · TRAJECTORY MAP — built live, then routed live ---------- */

const TRAJ_CLAIMS = ["Redis sharding", "dual-lane design", "“led team of 8”", "Playwright e2e"];
const TRAJ_ROUTES = [
  { label: "go deeper", y: 64, score: 0.87 },
  { label: "clarify", y: 134, score: 0.41 },
  { label: "pivot topic", y: 204, score: 0.22 },
];

function TrajectoryGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 11000;
  const t = el % L;
  const ans = typed("“we hash sessions across shards, so a dead node only loses its own turns…”", t, 3400, 5200);
  const win = eph(t, 6600, 7200);

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      {/* résumé source */}
      <g className="lv-node is-live">
        <rect x={30} y={48} width={120} height={128} rx={12} />
        <text x={90} y={74} textAnchor="middle" className="svg-label">RÉSUMÉ</text>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={46} y={88 + i * 16} width={88 - (i % 3) * 14} height={6} rx={3} className="lv-docline" style={{ opacity: 0.6 }} />
        ))}
      </g>
      <text x={90} y={196} textAnchor="middle" className="svg-sub">{t < 2400 ? "parsing claims…" : "4 claims parsed ✓"}</text>

      {/* claims extracted one by one */}
      {TRAJ_CLAIMS.map((c, i) => (
        <g key={c} className="lv-chip" style={rise(eph(t, 400 + i * 450, 850 + i * 450))}>
          <rect x={26} y={218 + i * 40} width={140} height={30} rx={8} />
          <text x={96} y={238 + i * 40} textAnchor="middle" className="svg-mono small">{c}</text>
        </g>
      ))}

      {/* probe tree */}
      {[
        { y: 64, label: "Q1 · Redis state", sub: "claim probe" },
        { y: 148, label: "Q2 · dual-lane", sub: "depth probe" },
        { y: 232, label: "Q3 · failure modes", sub: "pressure probe" },
      ].map((n, i) => {
        const grow = eph(t, 1600 + i * 380, 2400 + i * 380);
        return (
          <g key={n.label}>
            <path
              d={`M 150 112 C 200 112 200 ${n.y + 26} 246 ${n.y + 26}`}
              className="lv-edge"
              pathLength={100}
              strokeDasharray="100 100"
              strokeDashoffset={100 - grow * 100}
            />
            <g className={`lv-node ${i === 0 && t > 3400 ? "is-live" : ""}`} style={{ opacity: Math.max(0.12, grow) }}>
              <rect x={246} y={n.y} width={160} height={52} rx={10} />
              <text x={326} y={n.y + 22} textAnchor="middle" className="svg-label small">{n.label}</text>
              <text x={326} y={n.y + 39} textAnchor="middle" className="svg-sub">{n.sub}</text>
            </g>
          </g>
        );
      })}

      {/* live answer being routed */}
      <g className="lv-box hot" style={{ opacity: t > 3200 ? 1 : 0 }}>
        <rect x={186} y={318} width={424} height={54} rx={10} />
        <text x={200} y={338} className="svg-sub">LIVE ANSWER · being scored against every branch</text>
        <text x={200} y={358} className="svg-mono small">{ans}{t > 3400 && t < 5400 ? caret(t) : ""}</text>
      </g>

      {/* similarity-scored routing edges */}
      {TRAJ_ROUTES.map((r, i) => {
        const p = eph(t, 4600 + i * 150, 6300);
        const val = r.score * p;
        const chosen = i === 0 && t > 6600;
        return (
          <g key={r.label}>
            <path
              d={`M 406 90 C 450 90 452 ${r.y + 20} 486 ${r.y + 20}`}
              className={`lv-edge ${chosen ? "win" : ""}`}
              style={{ opacity: 0.25 + 0.75 * val, strokeWidth: 1.5 + 3 * val }}
            />
            <g className={`lv-node ${chosen ? "is-live" : ""}`} style={{ opacity: Math.max(0.25, p) }}>
              <rect x={486} y={r.y} width={128} height={40} rx={9} />
              <text x={550} y={r.y + 17} textAnchor="middle" className="svg-label small">{r.label}</text>
              <text x={550} y={r.y + 33} textAnchor="middle" className="svg-mono small">sim {val.toFixed(2)}</text>
            </g>
          </g>
        );
      })}
      {win > 0 && (
        <circle
          cx={406 + (486 - 406) * win}
          cy={90 + (84 - 90) * win}
          r={5}
          className="lv-pulse"
        />
      )}
      {/* frontier expands after routing */}
      <g className="lv-chip win" style={rise(eph(t, 7400, 7900))}>
        <rect x={470} y={262} width={158} height={34} rx={9} />
        <text x={549} y={284} textAnchor="middle" className="svg-mono small">next: Q4 · shard failover</text>
      </g>

      <text x={26} y={402} className="svg-note">
        Edges are scored by semantic similarity to the live answer — the strongest branch wins, and the map grows.
      </text>
    </svg>
  );
}

/* ---------- 4 · DUAL-LANE — a real race, per turn ---------- */

function FastLaneGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 10200;
  const t = el % L;
  const SC = 1 / 7.2; // px per sim-ms on the ruler

  // turn 1: starts 600 — fast completes 900ms, bg completes 3600ms
  const f1 = Math.min(900, Math.max(0, t - 600));
  const b1 = Math.min(3600, Math.max(0, t - 600));
  const replyFly = eph(t, 1500, 2150);
  const pkgFly = eph(t, 4200, 4900);
  // turn 2: queue consumed, fast lane fires again
  const consume = eph(t, 5600, 6250);
  const f2 = Math.min(900, Math.max(0, t - 6400));

  const laneX = 60;
  const fastY = 128;
  const bgY = 236;

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      {/* time ruler */}
      {[0, 500, 1000, 1500, 2000, 2500, 3000, 3500].map((ms) => (
        <g key={ms}>
          <line x1={laneX + ms * SC} y1={70} x2={laneX + ms * SC} y2={78} className="lv-tick" />
          <text x={laneX + ms * SC} y={62} textAnchor="middle" className="svg-sub tiny">{ms}</text>
        </g>
      ))}
      <text x={608} y={62} textAnchor="end" className="svg-sub tiny">ms</text>

      {/* FAST LANE */}
      <text x={laneX} y={112} className="svg-sub">FAST LANE · answers the candidate now</text>
      <rect x={laneX} y={fastY} width={520} height={24} rx={7} className="lv-track" />
      {(t < 5600 ? f1 : 0) > 0 && (
        <>
          <rect x={laneX} y={fastY} width={f1 * SC} height={24} rx={7} className="lv-bar" />
          <text x={laneX + f1 * SC + 8} y={fastY + 16} className="svg-mono small">{f1 < 900 ? fmtMs(f1) : "reply out · 900 ms"}</text>
        </>
      )}
      {t >= 6400 && (
        <>
          <rect x={laneX} y={fastY} width={f2 * SC} height={24} rx={7} className="lv-bar" />
          <text x={laneX + f2 * SC + 8} y={fastY + 16} className="svg-mono small">{f2 < 900 ? fmtMs(f2) : "reply out · 900 ms"}</text>
        </>
      )}

      {/* reply chip flies to the candidate */}
      {replyFly > 0 && replyFly < 1 && (
        <g className="lv-chip win" transform={`translate(${bez(replyFly, [laneX + 900 * SC, fastY + 12], [400, 40], [520, 84])[0]},${bez(replyFly, [laneX + 900 * SC, fastY + 12], [400, 40], [520, 84])[1]})`}>
          <rect x={-32} y={-12} width={64} height={22} rx={7} />
          <text x={0} y={3} textAnchor="middle" className="svg-mono small">REPLY</text>
        </g>
      )}
      <g style={{ opacity: t > 2100 ? 1 : 0.35 }}>
        <text x={558} y={90} textAnchor="middle" className="svg-sub">🗣 candidate hears it</text>
        {t > 2100 && t < 5600 && <text x={558} y={106} textAnchor="middle" className="tick ok">✓ 0.9 s</text>}
      </g>

      {/* BACKGROUND LANE */}
      <text x={laneX} y={220} className="svg-sub">BACKGROUND LANE · builds the NEXT question in parallel</text>
      <rect x={laneX} y={bgY} width={520} height={24} rx={7} className="lv-track" />
      {b1 > 0 && t < 5600 && (
        <>
          <rect x={laneX} y={bgY} width={b1 * SC} height={24} rx={7} className="lv-bar bg" />
          <text x={laneX + b1 * SC + 8} y={bgY + 16} className="svg-mono small">
            {b1 < 3600 ? `${fmtMs(b1)} · analyzing` : "package ready"}
          </text>
        </>
      )}

      {/* ready queue */}
      <g className="lv-box">
        <rect x={470} y={296} width={150} height={74} rx={12} />
        <text x={545} y={318} textAnchor="middle" className="svg-sub">READY QUEUE</text>
        {pkgFly === 1 && consume === 0 && (
          <g className="lv-chip">
            <rect x={488} y={330} width={114} height={26} rx={7} />
            <text x={545} y={347} textAnchor="middle" className="svg-mono small">NEXT-Q pkg</text>
          </g>
        )}
        {pkgFly === 1 && consume > 0 && consume < 1 && <text x={545} y={347} textAnchor="middle" className="svg-sub tiny">consuming…</text>}
        {consume === 1 && <text x={545} y={347} textAnchor="middle" className="tick ok">consumed ✓</text>}
      </g>
      {pkgFly > 0 && pkgFly < 1 && (
        <g className="lv-chip" transform={`translate(${bez(pkgFly, [laneX + 3600 * SC, bgY + 12], [600, 280], [545, 343])[0]},${bez(pkgFly, [laneX + 3600 * SC, bgY + 12], [600, 280], [545, 343])[1]})`}>
          <rect x={-42} y={-12} width={84} height={22} rx={7} />
          <text x={0} y={3} textAnchor="middle" className="svg-mono small">NEXT-Q pkg</text>
        </g>
      )}
      {consume > 0 && consume < 1 && (
        <g className="lv-chip" transform={`translate(${bez(consume, [545, 343], [220, 400], [laneX + 12, fastY + 12])[0]},${bez(consume, [545, 343], [220, 400], [laneX + 12, fastY + 12])[1]})`}>
          <rect x={-42} y={-12} width={84} height={22} rx={7} />
          <text x={0} y={3} textAnchor="middle" className="svg-mono small">NEXT-Q pkg</text>
        </g>
      )}

      <text x={laneX} y={334} className="lv-phase small">{t < 5600 ? "TURN N" : "TURN N+1 · prepared while you spoke"}</text>
      <text x={laneX} y={398} className="svg-note">
        The fast lane replies in 0.9 s while the heavy analysis keeps running — depth never costs latency.
      </text>
    </svg>
  );
}

/* ---------- 5 · AGENT PANEL — four analysts, working concurrently ---------- */

const AGENTS = [
  { name: "CONCEPT", find: "explains consistent hashing correctly", val: 0.82, done: 3400 },
  { name: "WEAKNESS", find: "no mention of the failover path", val: 0.61, done: 4300 },
  { name: "REASONING", find: "reasons from constraints, not recall", val: 0.78, done: 5200 },
];
const CLAIMS = [
  { label: "Redis session sharding", ok: true },
  { label: "Dual-lane orchestration", ok: true },
  { label: "“Led team of 8”", ok: false },
  { label: "Playwright e2e suite", ok: true },
];

function AgentsGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 9800;
  const t = el % L;
  const answer = typed("“we hash sessions across shards, so a dead node only loses its own turns”", t, 200, 1400);

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <g className="lv-box hot">
        <rect x={30} y={26} width={580} height={40} rx={9} />
        <text x={44} y={51} className="svg-mono small">{answer}{t < 1500 ? caret(t) : ""}</text>
      </g>

      {/* three scoring agents, live */}
      {AGENTS.map((ag, i) => {
        const start = 1500 + i * 220;
        const p = eph(t, start, ag.done);
        const finding = typed(ag.find, t, start + 300, ag.done - 200);
        const complete = t > ag.done;
        return (
          <g key={ag.name}>
            <g className={`lv-node ${!complete && t > start ? "is-live" : ""}`}>
              <rect x={30} y={86 + i * 86} width={280} height={74} rx={11} />
            </g>
            <circle cx={50} cy={106 + i * 86} r={4} className={complete ? "lv-dot ok" : "lv-dot"} style={{ opacity: complete ? 1 : 0.3 + 0.7 * pulse(t, 700) }} />
            <text x={62} y={110 + i * 86} className="svg-label small">{ag.name} AGENT</text>
            <text x={296} y={110 + i * 86} textAnchor="end" className="svg-mono small">{complete ? ag.val.toFixed(2) : (ag.val * p).toFixed(2)}</text>
            <text x={46} y={130 + i * 86} className="svg-mono tinytext">{finding}{t > start + 300 && !complete ? caret(t) : ""}</text>
            <rect x={46} y={140 + i * 86} width={248} height={5} rx={2.5} className="lv-track thin" />
            <rect x={46} y={140 + i * 86} width={248 * ag.val * p} height={5} rx={2.5} className="lv-bar" />
            {complete && (
              <circle cx={330 + ((t - ag.done) / 3) % 280} cy={123 + i * 86} r={3.4} className="lv-pulse" style={{ opacity: 0.7 }} />
            )}
          </g>
        );
      })}

      {/* discrepancy agent: live claim-by-claim check */}
      <g className="lv-box">
        <rect x={330} y={86} width={280} height={244} rx={12} />
        <text x={348} y={112} className="svg-label small">DISCREPANCY AGENT</text>
        <text x={348} y={130} className="svg-sub">holds the résumé · checks every claim</text>
        {CLAIMS.map((c, i) => {
          const s = 2200 + i * 1050;
          const scanning = t >= s && t < s + 780;
          const stamped = t >= s + 780;
          return (
            <g key={c.label}>
              {scanning && <rect x={342} y={142 + i * 40} width={256} height={32} rx={7} className="scanline" style={{ opacity: 0.4 + 0.5 * pulse(t, 420) }} />}
              <text x={352} y={163 + i * 40} className="svg-mono tinytext">{c.label}</text>
              {scanning && <text x={594} y={163 + i * 40} textAnchor="end" className="svg-sub tiny">probing…</text>}
              {stamped && (
                <text x={594} y={163 + i * 40} textAnchor="end" className={c.ok ? "tick ok" : "tick bad"} style={rise(eph(t, s + 780, s + 1000), 4)}>
                  {c.ok ? "✓ verified" : "✗ unverified"}
                </text>
              )}
            </g>
          );
        })}
        <text x={348} y={318} className="svg-sub" style={{ opacity: t > 6600 ? 1 : 0 }}>3 of 4 claims held under live probing</text>
      </g>

      {/* converging output */}
      <line x1={40} y1={368} x2={600} y2={368} className="lv-edge" style={{ opacity: 0.35 }} />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={40 + ((t / 4 + i * 140) % 560)} cy={368} r={3.2} className="lv-pulse" style={{ opacity: t > 3400 ? 0.8 : 0 }} />
      ))}
      <text x={320} y={392} textAnchor="middle" className="svg-sub">every signal streams to the orchestrator, every turn</text>
    </svg>
  );
}

/* ---------- 6 · ORCHESTRATOR — signals land, reasoning types, decision fires ---------- */

const ORCH_IN = [
  { label: "LIVE ANSWER", v: "0.87" },
  { label: "CONCEPT", v: "0.82" },
  { label: "WEAKNESS", v: "0.61" },
  { label: "DISCREPANCY", v: "1 flag" },
  { label: "REASONING", v: "0.78" },
];

function OrchestratorGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 9000;
  const t = el % L;
  const cycle = Math.floor(el / L) % 2; // alternate decisions
  const landed = ORCH_IN.filter((_, i) => t > 900 + i * 480 + 700).length;
  const reason =
    cycle === 0
      ? "depth reached on retrieval claim → ask the prepared follow-up"
      : "failover gap + weakness signal → escalate to a deeper probe";
  const reasonTxt = typed(reason, t, 3400, 5700);
  const decided = t > 6000;
  const chosen = cycle === 0 ? 0 : 1;

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      {ORCH_IN.map((s, i) => {
        const y = 48 + i * 62;
        const fireAt = 900 + i * 480;
        const p = ph(t, fireAt, fireAt + 700);
        const [px, py] = bez(ez(p), [172, y], [262, (y + 190) / 2 + 30], [330, 192]);
        const hasLanded = t > fireAt + 700;
        return (
          <g key={s.label}>
            <g className={`lv-node ${t > fireAt - 250 && !hasLanded ? "is-live" : ""}`}>
              <rect x={30} y={y - 20} width={142} height={40} rx={9} />
              <text x={44} y={y - 2} className="svg-label small">{s.label}</text>
              <text x={158} y={y + 14} textAnchor="end" className="svg-mono tinytext" style={{ opacity: t > fireAt - 250 ? 1 : 0.35 }}>{s.v}</text>
            </g>
            <path d={`M 172 ${y} Q 262 ${(y + 190) / 2 + 30} 330 192`} className="lv-edge" style={{ opacity: hasLanded ? 0.55 : 0.18 }} />
            {p > 0 && p < 1 && <circle cx={px} cy={py} r={4.4} className="lv-pulse" />}
          </g>
        );
      })}

      {/* fusion core with live internals */}
      <g className="lv-core" style={{ opacity: 0.45 + (landed / 5) * 0.55 }}>
        <circle cx={372} cy={192} r={46} className="lv-corering" />
        {[0, 1, 2].map((i) => {
          const ang = t / 320 + (i * Math.PI * 2) / 3;
          return <circle key={i} cx={q(372 + Math.cos(ang) * 30)} cy={q(192 + Math.sin(ang) * 30)} r={3.4} className="lv-pulse" />;
        })}
        <text x={372} y={188} textAnchor="middle" className="svg-label">ORCH.</text>
        <text x={372} y={204} textAnchor="middle" className="svg-sub">{landed < 5 ? `${landed}/5 signals` : "resolving"}</text>
      </g>

      {/* decision routes */}
      {["ASK NOW", "ESCALATE"].map((d, i) => {
        const y = i === 0 ? 96 : 288;
        const isChosen = decided && chosen === i;
        const p = eph(t, 6000, 6500);
        const [px, py] = bez(p, [416, 192 + (i === 0 ? -18 : 18)], [480, y + 40 * (i === 0 ? 1 : -1)], [520, y + 22]);
        return (
          <g key={d}>
            <path d={`M 416 ${192 + (i === 0 ? -18 : 18)} Q 480 ${y + 40 * (i === 0 ? 1 : -1)} 520 ${y + 22}`} className={`lv-edge ${isChosen ? "win" : ""}`} style={{ opacity: isChosen ? 0.9 : 0.2 }} />
            {isChosen && p > 0 && p < 1 && <circle cx={px} cy={py} r={5} className="lv-pulse" />}
            <g className={`lv-node ${isChosen ? "is-live" : ""}`} style={{ opacity: isChosen || !decided ? 1 : 0.35 }}>
              <rect x={520} y={y} width={104} height={44} rx={10} />
              <text x={572} y={y + 19} textAnchor="middle" className="svg-label small">{d}</text>
              <text x={572} y={y + 35} textAnchor="middle" className="svg-sub tiny">{i === 0 ? "fast lane" : "deeper probe"}</text>
            </g>
          </g>
        );
      })}

      {/* live reasoning trace */}
      <g className="lv-box">
        <rect x={186} y={330} width={438} height={58} rx={10} />
        <text x={200} y={352} className="svg-sub">ORCHESTRATOR REASONING · logged every turn</text>
        <text x={200} y={372} className="svg-mono tinytext">{reasonTxt}{t > 3400 && t < 5800 ? caret(t) : ""}</text>
      </g>
      <text x={30} y={382} className="svg-sub" style={{ opacity: decided ? 1 : 0 }}>
        decision:{" "}
      </text>
      <text x={30} y={400} className="svg-mono small" style={{ opacity: decided ? 1 : 0 }}>
        {chosen === 0 ? "ASK NOW ✓" : "ESCALATE ✓"}
      </text>
    </svg>
  );
}

/* ---------- 7 · VOICE OUT — the 940 ms budget, replayed in slow-mo ---------- */

function VoiceOutGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 10600;
  const t = el % L;
  const cycle = Math.floor(el / L) % 2; // odd cycles: Cartesia fails over
  const SLOW = 4;
  const rows = [
    { label: "STT partial", ms: 180, start: 600 },
    { label: "orchestrate", ms: 240, start: 600 + 180 * SLOW },
    { label: "TTS first byte", ms: 320, start: 600 + 420 * SLOW },
  ];
  const failAt = rows[2].start + 320 * SLOW * 0.35;
  const failed = cycle === 1 && t > failAt;
  const fbStart = failAt + 250;
  const fbMs = 290;
  const doneAt = cycle === 0 ? rows[2].start + 320 * SLOW : fbStart + fbMs * SLOW;

  let total = 0;
  for (const r of rows) {
    if (cycle === 1 && r.label === "TTS first byte") {
      total += 320 * 0.35 * ph(t, r.start, failAt);
    } else {
      total += r.ms * ph(t, r.start, r.start + r.ms * SLOW);
    }
  }
  if (cycle === 1) total += fbMs * ph(t, fbStart, fbStart + fbMs * SLOW);

  const speakStart = doneAt + 500;
  const speaking = t > speakStart && t < speakStart + 2800;
  const qText = typed("“walk me through what happens when a shard dies.”", t, speakStart, speakStart + 2400);

  const SCX = 0.55;
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <text x={40} y={44} className="lv-phase small">ONE REAL TURN · REPLAYED AT 0.25× SPEED</text>
      <g className="lv-chip">
        <rect x={470} y={26} width={140} height={44} rx={10} />
        <text x={484} y={44} className="svg-sub">running total</text>
        <text x={484} y={62} className="svg-mono">{fmtMs(total)}</text>
      </g>

      {rows.map((r, i) => {
        const isTts = r.label === "TTS first byte";
        const prog = cycle === 1 && isTts ? Math.min(0.35, ph(t, r.start, failAt) * 0.35) : ph(t, r.start, r.start + r.ms * SLOW);
        const x0 = 200 + rows.slice(0, i).reduce((s, q) => s + q.ms * SCX, 0);
        return (
          <g key={r.label}>
            <text x={190} y={106 + i * 52} textAnchor="end" className="svg-mono small">{cycle === 1 && isTts ? "Cartesia TTS" : r.label}</text>
            <rect x={x0} y={92 + i * 52} width={r.ms * SCX} height={20} rx={6} className="lv-track" />
            <rect x={x0} y={92 + i * 52} width={r.ms * SCX * prog} height={20} rx={6} className={`lv-bar ${cycle === 1 && isTts && failed ? "bad" : ""}`} />
            {prog > 0 && prog < 1 && !(cycle === 1 && isTts && failed) && (
              <text x={x0 + r.ms * SCX * prog + 6} y={106 + i * 52} className="svg-mono tinytext">{fmtMs(r.ms * prog)}</text>
            )}
            {cycle === 1 && isTts && failed && (
              <text x={x0 + r.ms * SCX * 0.35 + 8} y={106 + i * 52} className="tick bad">✗ 400 ms cap hit</text>
            )}
          </g>
        );
      })}

      {/* automatic fallback route, odd cycles */}
      {cycle === 1 && t > fbStart - 200 && (
        <g style={rise(eph(t, fbStart - 200, fbStart + 300))}>
          <text x={190} y={106 + 3 * 52} textAnchor="end" className="svg-mono small">ElevenLabs</text>
          <rect x={200 + 420 * SCX} y={92 + 3 * 52} width={fbMs * SCX} height={20} rx={6} className="lv-track" />
          <rect x={200 + 420 * SCX} y={92 + 3 * 52} width={fbMs * SCX * ph(t, fbStart, fbStart + fbMs * SLOW)} height={20} rx={6} className="lv-bar warm" />
          <text x={196 + 420 * SCX} y={126 + 3 * 52} className="svg-sub tiny">automatic fallback — no human, no retry logic exposed</text>
        </g>
      )}

      {/* verdict stamp */}
      {t > doneAt + 150 && (
        <g className="lv-stamp" style={rise(eph(t, doneAt + 150, doneAt + 550), 6)}>
          <rect x={440} y={196 + (cycle === 1 ? 52 : 0)} width={180} height={40} rx={9} />
          <text x={530} y={214 + (cycle === 1 ? 52 : 0)} textAnchor="middle" className="svg-label small">
            {cycle === 0 ? "740 ms · ✓ in budget" : "852 ms · ✓ in budget"}
          </text>
          <text x={530} y={229 + (cycle === 1 ? 52 : 0)} textAnchor="middle" className="svg-sub tiny">
            {cycle === 0 ? "260 ms headroom" : "fallback fired, budget held"}
          </text>
        </g>
      )}

      {/* the voice actually speaks */}
      <text x={40} y={320} className="svg-sub">SPOKEN TO CANDIDATE</text>
      <Wave x={40} y={330} w={200} h={34} bars={24} t={t} on={speaking ? 1 : 0.05} />
      <text x={260} y={352} className="svg-mono small">{qText}{speaking ? caret(t) : ""}</text>
      <text x={40} y={400} className="svg-note">
        Every cycle you watch is one turn's real budget — and on alternating replays, the fallback path itself.
      </text>
    </svg>
  );
}

/* ---------- 8 · EVIDENCE REPORT — assembled from moments, live ---------- */

const MOMENTS = [
  { at: "14:22", quote: "consistent hashing answer" },
  { at: "18:05", quote: "failover probe recovery" },
  { at: "22:41", quote: "claim check: 3 of 4 held" },
  { at: "27:19", quote: "clear under 2 escalations" },
];
const REPORT_ROWS = [
  ["Distributed state design", "evidence: 3 answers, depth 4/5"],
  ["Failure-mode reasoning", "evidence: live probe, recovered well"],
  ["Claim verification", "3 of 4 résumé claims held under probing"],
  ["Communication under pressure", "clear at 2 escalations"],
];

function ReportGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 10800;
  const t = el % L;
  const count = 208 + Math.round(43 * eph(t, 800, 8200));

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <text x={30} y={40} className="svg-sub">INTERVIEW TRANSCRIPT · moments</text>
      {MOMENTS.map((m, i) => (
        <g key={m.at} className="lv-chip" style={rise(eph(t, 400 + i * 420, 800 + i * 420))}>
          <rect x={26} y={56 + i * 74} width={182} height={56} rx={10} />
          <text x={40} y={78 + i * 74} className="svg-mono tinytext">t = {m.at}</text>
          <text x={40} y={96 + i * 74} className="svg-sub tiny">{m.quote}</text>
        </g>
      ))}

      {/* report assembling */}
      <g className="lv-box">
        <rect x={252} y={32} width={368} height={356} rx={14} />
        <text x={276} y={64} className="svg-label big">CANDIDATE EVIDENCE REPORT</text>
        <text x={276} y={84} className="svg-sub">interview #{count} · not a vibe score — a ledger</text>
        {REPORT_ROWS.map((r, i) => {
          const s = 2300 + i * 1300;
          const p = eph(t, s, s + 500);
          const link = eph(t, s - 350, s + 100);
          return (
            <g key={r[0]}>
              {link > 0 && (
                <path
                  d={`M 208 ${84 + i * 74} C 232 ${84 + i * 74} 236 ${112 + i * 60} 252 ${114 + i * 60}`}
                  className="lv-edge win"
                  pathLength={100}
                  strokeDasharray="100 100"
                  strokeDashoffset={100 - link * 100}
                  style={{ opacity: 0.7 }}
                />
              )}
              <g style={rise(p, 8)}>
                <text x={276} y={118 + i * 60} className="svg-mono small">{r[0]}</text>
                <text x={276} y={136 + i * 60} className="svg-sub tiny">{r[1]}</text>
                <text x={596} y={124 + i * 60} textAnchor="end" className="tick ok">✓</text>
              </g>
            </g>
          );
        })}
        <g
          className="lv-stamp big"
          style={{
            opacity: eph(t, 8600, 8900),
            transform: `scale(${1 + (1 - eph(t, 8600, 9000)) * 0.7})`,
            transformOrigin: "460px 356px",
          }}
        >
          <rect x={356} y={336} width={208} height={40} rx={9} />
          <text x={460} y={361} textAnchor="middle" className="svg-label">250+ INTERVIEWS</text>
        </g>
      </g>
    </svg>
  );
}

/* ---------- chapter ---------- */

const STEPS: StepDef[] = [
  {
    label: "The loop",
    sub: "high-level architecture",
    pilotTitle: "A voice-to-voice interview loop that closes in under a second",
    pilotBody:
      "You're watching a real turn replay: the candidate speaks, their words become streaming text, an orchestrator decides the next move, and a synthesized voice answers back — a complete loop, every turn, fast enough to feel like a person. Everything that follows lives inside this loop.",
    metrics: [
      { k: "turn loop", v: "< 1 s" },
      { k: "interviews run", v: "250+" },
      { k: "mode", v: "voice ↔ voice" },
    ],
    graphic: (a) => <LoopGraphic a={a} />,
  },
  {
    label: "Streaming STT",
    sub: "hearing, live",
    pilotTitle: "Words land as they're spoken, not after",
    pilotBody:
      "Deepgram streaming transcription with tuned endpointing feeds the system partial text every ~180 ms — watch the hypothesis revise itself mid-word before finals commit with per-word confidence. The interview never waits for silence to start thinking.",
    metrics: [
      { k: "partial latency", v: "~180 ms" },
      { k: "transcription accuracy", v: "95%+" },
      { k: "endpointing", v: "room-tuned" },
    ],
    graphic: (a) => <SttGraphic a={a} />,
  },
  {
    label: "Trajectory map",
    sub: "the interview plan",
    pilotTitle: "The résumé is compiled into a map of probes before the first question",
    pilotBody:
      "Claims are parsed out of the résumé, validated, and expanded into a branching question tree — then you watch a live answer get scored against every branch by semantic similarity. The strongest edge wins, and the map grows a new frontier.",
    metrics: [
      { k: "built from", v: "résumé claims" },
      { k: "routing signal", v: "semantic similarity" },
      { k: "hydration", v: "async, non-blocking" },
    ],
    graphic: (a) => <TrajectoryGraphic a={a} />,
  },
  {
    label: "Dual-lane engine",
    sub: "why it feels instant",
    pilotTitle: "Reply now; think in parallel",
    pilotBody:
      "Watch the race: the fast lane completes its reply at 900 ms while the background lane is still analyzing. The heavy lane finishes seconds later and drops a ready-made next-question package into the queue — consumed the instant the next turn starts.",
    metrics: [
      { k: "fast-lane reply", v: "< 900 ms" },
      { k: "state", v: "Redis + in-memory fallback" },
      { k: "models", v: "multi-tier via OpenRouter" },
    ],
    graphic: (a) => <FastLaneGraphic a={a} />,
  },
  {
    label: "Agent panel",
    sub: "background lane",
    pilotTitle: "Four analysts listen to every answer",
    pilotBody:
      "Concept, weakness, and reasoning agents score the turn concurrently — you can watch their findings being written. The discrepancy agent holds the résumé the whole time, probing claim after claim until every one is verified or flagged.",
    metrics: [
      { k: "agents per turn", v: "4 + evaluator" },
      { k: "claim checks", v: "per-claim ✓/✗" },
      { k: "telemetry", v: "JSONL, per turn" },
    ],
    graphic: (a) => <AgentsGraphic a={a} />,
  },
  {
    label: "Orchestrator",
    sub: "signals converge",
    pilotTitle: "A network of judgments, resolved into one next move",
    pilotBody:
      "Five signals land on the fusion core one by one, its reasoning writes itself out in real time, and the decision fires — ask now, or escalate. Watch two replays and you'll see both branches taken, because the decision depends on the evidence.",
    metrics: [
      { k: "inputs fused", v: "5 signals" },
      { k: "decision", v: "ask / escalate / pivot" },
      { k: "reasoning", v: "logged, replayable" },
    ],
    graphic: (a) => <OrchestratorGraphic a={a} />,
  },
  {
    label: "Voice out",
    sub: "closing the loop",
    pilotTitle: "The whole turn fits inside a one-second budget",
    pilotBody:
      "A real turn's latency budget, replayed at quarter speed: streaming partials, orchestration, first byte of speech — with the running total on screen. On alternating replays Cartesia hits its cap and you watch the ElevenLabs fallback fire automatically. The budget still holds.",
    metrics: [
      { k: "TTS route", v: "Cartesia → ElevenLabs" },
      { k: "first byte", v: "~320 ms" },
      { k: "total loop", v: "< 1 s" },
    ],
    graphic: (a) => <VoiceOutGraphic a={a} />,
  },
  {
    label: "Evidence report",
    sub: "the output",
    pilotTitle: "An interview that ends in evidence, not impressions",
    pilotBody:
      "The report assembles itself from the transcript in front of you — each conclusion draws a visible line back to the moment that earned it. Which claims held, where depth was reached, how reasoning behaved under pressure. Run across 250+ interviews, backed by contract tests and Playwright end-to-end suites.",
    metrics: [
      { k: "interviews", v: "250+" },
      { k: "report", v: "evidence-linked" },
      { k: "tests", v: "contract + e2e" },
    ],
    graphic: (a) => <ReportGraphic a={a} />,
  },
];

export function AntigravityChapter() {
  return (
    <ChapterShell
      id="antigravity"
      accent="#7ee0ff"
      kicker="PROJECT 01 · FLAGSHIP"
      title="Antigravity"
      subtitle="An AI-native technical interviewer — a real-time voice system that turns a candidate's answers into evidence."
      steps={STEPS}
      stepMs={9800}
      footer={
        <div className="chapter-cta" id="antigravity-demo">
          <p className="cta-lead">This system is real and running. Don't take the replay's word for it —</p>
          <div className="cta-row">
            <a className="btn btn-primary" href="https://antigravity-gz2r.vercel.app" target="_blank" rel="noreferrer">
              ▶ Watch a real interview replay
            </a>
            <a className="btn" href="https://github.com/Yashwant-Bhyri" target="_blank" rel="noreferrer">
              Open the code
            </a>
          </div>
        </div>
      }
    />
  );
}
