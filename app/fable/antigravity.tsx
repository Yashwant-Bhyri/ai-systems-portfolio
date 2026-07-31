"use client";

import { ChapterShell, type StepDef } from "./chapter-shell";
import { useSim, ph, eph, ez, pulse, noise, bez, script, typed, caret, rise, Wave, fmtMs, q } from "./live";

/* =====================================================================
   Every graphic here is a LIVE scene: a scripted operation replayed on a
   sim clock. Nothing is a static diagram — text streams, counters count,
   lanes race, decisions fire. Pausing the tour freezes the whole scene.
   ===================================================================== */

/* ---------- 1 · THE LOOP — one real turn, replayed live ---------- */

export function LoopGraphic({ a }: { a: boolean }) {
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

      {/* candidate — with an actual person in the room */}
      <g className={`lv-node ${listening ? "is-live" : ""}`}>
        <rect x={44} y={172} width={170} height={72} rx={12} />
        <g className="lv-avatar">
          <circle cx={72} cy={198} r={13} />
          <circle cx={72} cy={193} r={5} />
          <path d="M 63 205 a 9 7 0 0 1 18 0" />
        </g>
        <text x={144} y={198} textAnchor="middle" className="svg-label small">CANDIDATE</text>
        <text x={144} y={216} textAnchor="middle" className="svg-sub">
          {listening ? "answer streaming" : deciding ? "route pending" : speaking ? "hearing question" : "turn complete"}
        </text>
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
          {deciding ? "evaluating the turn…" : t >= 3800 ? "next question ready ✓" : "two reasoning lanes"}
        </text>
      </g>

      {/* TTS — the AI interviewer avatar */}
      <g className={`lv-node ${speaking ? "is-live" : ""}`}>
        <rect x={244} y={318} width={190} height={54} rx={12} />
        <g className="lv-avatar bot">
          <circle cx={268} cy={345} r={13} />
          <rect x={261} y={338} width={14} height={11} rx={3} />
          <circle cx={265.5} cy={343} r={1.6} className="lv-avatar-eye" />
          <circle cx={270.5} cy={343} r={1.6} className="lv-avatar-eye" />
        </g>
        <text x={352} y={340} textAnchor="middle" className="svg-label small">ANTIGRAVITY · TTS</text>
        <text x={352} y={358} textAnchor="middle" className="svg-sub">{speaking ? "next question" : "standby"}</text>
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
            <text x={320} y={206} textAnchor="middle" className="lv-counter">≈ 0.9 s</text>
            <text x={320} y={230} textAnchor="middle" className="svg-sub">answer → decision → voice · under one second ✓</text>
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

export function SttGraphic({ a }: { a: boolean }) {
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
      { at: 4600, end: 5500, text: "the fallback store keeps the turn al" },
      { at: 5600, end: 6300, text: "the fallback store keeps the turn alive if redis drops" },
      { at: 7000, end: 7350, text: "" },
    ],
    t,
  );

  const final1 = eph(t, 3350, 3750);
  const final2 = eph(t, 7050, 7450);

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      {/* live mic feed */}
      <text x={40} y={52} className="svg-sub">LIVE AUDIO · 16 kHz</text>
      <Wave x={40} y={64} w={220} h={56} bars={26} t={t} on={talking ? 1 : 0.05} />
      <text x={40} y={150} className="svg-mono small">{talking ? "● listening live" : "○ final transcript ready"}</text>

      {/* latency ticker */}
      <g className="lv-chip">
        <rect x={452} y={40} width={158} height={46} rx={10} />
        <text x={466} y={59} className="svg-sub">LIVE TRANSCRIPT</text>
        <text x={466} y={78} className="svg-mono tinytext">while speaking</text>
      </g>

      {/* live transcript lane — words may revise until the turn is committed */}
      <g className="lv-box hot">
        <rect x={300} y={96} width={310} height={76} rx={10} />
        <text x={314} y={116} className="svg-sub">WORDS REVISE WHILE THE CANDIDATE SPEAKS</text>
        {partial && <text x={598} y={116} textAnchor="end" className="svg-sub tiny">LIVE{caret(t)}</text>}
        {(() => {
          const words = partial.replace(/[“”]/g, "").split(" ").filter(Boolean);
          const layout = words.reduce<{
            nextX: number;
            y: number;
            tokens: Array<{ word: string; x: number; y: number; width: number; provisional: boolean }>;
          }>((state, word, index) => {
            const width = word.length * 6.4 + 12;
            const wraps = state.nextX + width > 596;
            const x = wraps ? 314 : state.nextX;
            const y = wraps ? state.y + 24 : state.y;
            return {
              nextX: x + width + 6,
              y,
              tokens: [...state.tokens, { word, x, y, width, provisional: index >= words.length - 2 }],
            };
          }, { nextX: 314, y: 134, tokens: [] });
          return layout.tokens.map(({ word, x, y, width, provisional }, index) => {
            return (
              <g key={`${word}-${index}`}>
                <rect x={q(x)} y={y - 13} width={q(width)} height={19} rx={5} className="lv-tokenpill" style={{ opacity: provisional ? 0.55 : 0.95 }} />
                <text x={q(x + width / 2)} y={y} textAnchor="middle" className="svg-mono tinytext">{word}</text>
              </g>
            );
          });
        })()}
      </g>

      {/* committed transcript log */}
      <g className="lv-box">
        <rect x={40} y={190} width={570} height={170} rx={12} />
        <text x={58} y={216} className="svg-sub">COMMITTED TRANSCRIPT · STABLE INPUT FOR REASONING</text>
        <text x={58} y={244} className="svg-mono small dim">…the interview state retains the full turn context.</text>
        {final1 > 0 && (
          <g style={rise(final1)}>
            {STT_FINAL_1.map((w, i) => {
              const p = eph(t, 3450 + i * 90, 3750 + i * 90);
              const pw = w.length * 6.8 + 16;
              const px = 58 + STT_FINAL_1.slice(0, i).reduce((s, ww) => s + ww.length * 6.8 + 16 + 8, 0);
              return (
                <g key={w} style={{ opacity: p }}>
                  <rect x={q(px)} y={262} width={q(pw)} height={22} rx={6} className="lv-tokenpill" style={{ opacity: 0.4 + 0.6 * STT_CONF_1[i] }} />
                  <text x={q(px + pw / 2)} y={277} textAnchor="middle" className="svg-mono small">{w}</text>
                  <text x={q(px + pw / 2)} y={300} textAnchor="middle" className="svg-sub tiny">{STT_CONF_1[i].toFixed(2)}</text>
                </g>
              );
            })}
          </g>
        )}
        {final2 > 0 && (
          <g style={rise(final2)}>
            <text x={58} y={334} className="svg-mono">In-memory fallback keeps the turn running if Redis drops.</text>
            <text x={520} y={334} className="tick ok" style={{ opacity: final2 }}>✓ final</text>
          </g>
        )}
      </g>

      <text x={40} y={396} className="svg-note">
        Reasoning can start early, but only the stable final is stored as interview evidence.
      </text>
    </svg>
  );
}

/* ---------- 3 · TRAJECTORY MAP — built live, then routed live ---------- */

const TRAJ_CLAIMS = ["claim 01", "claim 02", "claim 03", "claim 04"];
const TRAJ_ROUTES = [
  { label: "go deeper", y: 64, score: 0.87 },
  { label: "clarify", y: 134, score: 0.41 },
  { label: "pivot topic", y: 204, score: 0.22 },
];

export function TrajectoryGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 11000;
  const t = el % L;
  const ans = typed("“we hash sessions across shards; only that node's turns die…”", t, 3400, 5200);
  const win = eph(t, 6600, 7200);

  const introP = eph(t, 200, 900);
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      {/* first: the two paths every turn runs on */}
      <g style={{ opacity: introP }}>
        <g className="lv-chip win">
          <rect x={186} y={14} width={200} height={30} rx={9} />
          <text x={286} y={33} textAnchor="middle" className="svg-mono tinytext">CURRENT TURN · choose now</text>
        </g>
        <g className="lv-chip">
          <rect x={398} y={14} width={216} height={30} rx={9} />
          <text x={506} y={33} textAnchor="middle" className="svg-mono tinytext">FUTURE PATH · analyze deeper</text>
        </g>
      </g>
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
        { y: 64, label: "Q1 · claim-1 probe", sub: "verify claim 01" },
        { y: 148, label: "Q2 · depth probe", sub: "depth on claim 01" },
        { y: 232, label: "Q3 · pressure question", sub: "claim 01 under stress" },
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
        <text x={200} y={338} className="svg-sub">LIVE ANSWER · MATCHING THE NEXT VALID PROBE</text>
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
        <rect x={466} y={262} width={162} height={34} rx={9} />
        <text x={547} y={284} textAnchor="middle" className="svg-mono tinytext">next: Q4 · failover probe</text>
      </g>

      <text x={26} y={402} className="svg-note">
        The strongest valid branch becomes the next probe; deeper findings extend the future path.
      </text>
    </svg>
  );
}

/* ---------- 4 · DUAL-LANE — a real race, per turn ---------- */

export function FastLaneGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 9800;
  const t = el % L;
  const fastP = eph(t, 500, 2300);
  const deepP = eph(t, 900, 4700);
  const packetP = eph(t, 4200, 5200);
  const promoteP = eph(t, 5400, 6600);
  const fastNodes = [
    { label: "MODEL ROUTER", sub: "fast model", x: 138 },
    { label: "TURN GUARD", sub: "state + policy", x: 254 },
    { label: "NEXT QUESTION", sub: "ready now", x: 370 },
    { label: "VOICE OUT", sub: "cache → TTS", x: 486 },
  ];
  const agentNodes = [
    { label: "CONCEPT", x: 132, y: 196, at: 1100 },
    { label: "WEAKNESS", x: 228, y: 196, at: 1380 },
    { label: "DISCREPANCY", x: 132, y: 242, at: 1660 },
    { label: "REASONING", x: 228, y: 242, at: 1940 },
  ];

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <text x={22} y={26} className="lv-phase small">ONE ANSWER · TWO COORDINATED PATHS</text>
      <g className="lv-chip win">
        <rect x={474} y={10} width={144} height={28} rx={8} />
        <text x={546} y={28} textAnchor="middle" className="svg-mono tinytext">REPLY PATH · ~900 ms</text>
      </g>

      <g className="lv-node is-live">
        <rect x={22} y={70} width={96} height={62} rx={10} />
        <text x={70} y={92} textAnchor="middle" className="svg-sub">CURRENT TURN</text>
        <text x={70} y={110} textAnchor="middle" className="svg-mono tinytext">answer + state</text>
        <text x={70} y={126} textAnchor="middle" className="tick ok">committed ✓</text>
      </g>

      <text x={138} y={56} className="svg-sub">FOREGROUND · RETURN A SAFE NEXT QUESTION NOW</text>
      {fastNodes.map((node, index) => {
        const live = fastP >= index / fastNodes.length;
        const previousX = index === 0 ? 118 : fastNodes[index - 1].x + 104;
        return (
          <g key={node.label}>
            <path d={`M ${previousX} 101 L ${node.x} 101`} className="lv-edge win" style={{ opacity: 0.3 + fastP * 0.7 }} />
            <g className={`lv-node ${live ? "is-live" : ""}`}>
              <rect x={node.x} y={72} width={104} height={58} rx={9} />
              <text x={node.x + 52} y={96} textAnchor="middle" className="svg-label small">{node.label}</text>
              <text x={node.x + 52} y={116} textAnchor="middle" className="svg-sub">{node.sub}</text>
            </g>
          </g>
        );
      })}
      {fastP > 0 && fastP < 1 && (
        <circle cx={q(118 + fastP * 472)} cy={101} r={4.5} className="lv-pulse" />
      )}

      <text x={132} y={172} className="svg-sub">BACKGROUND · ANALYZE DEPTH AND PREPARE A FUTURE PROBE</text>
      <path d="M 70 132 C 70 188 96 226 118 226" className="lv-edge" style={{ opacity: 0.25 + deepP * 0.45 }} />
      {agentNodes.map((node, index) => {
        const live = t > node.at && t < 4300;
        return (
          <g key={node.label}>
            <path d={`M 118 226 Q 124 ${node.y + 17} ${node.x} ${node.y + 17}`} className="lv-edge" style={{ opacity: deepP * 0.4 }} />
            <g className={`lv-node ${live ? "is-live" : ""}`}>
              <rect x={node.x} y={node.y} width={86} height={34} rx={9} />
              <text x={node.x + 43} y={node.y + 21} textAnchor="middle" className="svg-sub">{node.label}</text>
            </g>
            {live && <circle cx={node.x + 76} cy={node.y + 9} r={2.5 + pulse(t + index * 140, 600) * 2} className="lv-pulse" />}
          </g>
        );
      })}

      <g className="lv-core" style={{ opacity: deepP > 0.45 ? 1 : 0.58 }}>
        <circle cx={354} cy={233} r={37} className="lv-corering" />
        <text x={354} y={229} textAnchor="middle" className="svg-label small">FUSE</text>
        <text x={354} y={247} textAnchor="middle" className="svg-sub">rank signals</text>
      </g>
      {agentNodes.map((node) => (
        <path key={`fusion-${node.label}`} d={`M ${node.x + 86} ${node.y + 17} Q 326 233 320 233`} className="lv-edge" style={{ opacity: deepP * 0.42 }} />
      ))}

      <g className={`lv-node ${packetP > 0 && promoteP === 0 ? "is-live" : ""}`}>
        <rect x={398} y={194} width={94} height={78} rx={10} />
        <text x={445} y={216} textAnchor="middle" className="svg-label small">Q PACKET</text>
        <text x={445} y={236} textAnchor="middle" className="svg-mono tinytext">probe + link</text>
        <text x={445} y={256} textAnchor="middle" className="svg-sub">guarded ✓</text>
      </g>
      <path d="M 388 233 L 398 233" className="lv-edge win" style={{ opacity: packetP }} />

      <g className="lv-box hot">
        <rect x={512} y={178} width={108} height={132} rx={11} />
        <text x={566} y={199} textAnchor="middle" className="svg-label small">FUTURE MAP</text>
        {[
          { y: 220, label: "Q5", state: "current" },
          { y: 254, label: "Q6", state: "ready" },
          { y: 288, label: "Q7", state: promoteP === 1 ? "promoted" : "analyzing" },
        ].map((node, index) => (
          <g key={node.label} className={`lv-chip ${index === 0 || (index === 2 && promoteP === 1) ? "win" : ""}`}>
            <rect x={520} y={node.y - 12} width={92} height={24} rx={7} />
            <text x={528} y={node.y + 3} className="svg-mono tinytext">{node.label}</text>
            <text x={606} y={node.y + 3} textAnchor="end" className="svg-sub">{node.state}</text>
          </g>
        ))}
      </g>
      <path d="M 492 233 C 510 246 510 278 528 288" className="lv-edge win" style={{ opacity: promoteP * 0.65 }} />

      {promoteP > 0 && promoteP < 1 && (
        <g transform={`translate(${bez(promoteP, [492, 233], [510, 252], [528, 288])[0]},${bez(promoteP, [492, 233], [510, 252], [528, 288])[1]})`}>
          <circle cx={0} cy={0} r={5} className="lv-pulse" />
        </g>
      )}

      {[
        ["MODEL ROUTING", "fast · deep · fallback"],
        ["QUESTION GUARD", "state · scope · policy"],
        ["RUNTIME", "cache · token caps · traces"],
      ].map(([label, value], index) => (
        <g key={label} className="lv-chip">
          <rect x={22 + index * 200} y={348} width={190} height={48} rx={9} />
          <text x={34 + index * 200} y={367} className="svg-sub">{label}</text>
          <text x={34 + index * 200} y={386} className="svg-mono tinytext">{value}</text>
        </g>
      ))}
      <text x={22} y={414} className="svg-note">The foreground question ships now; the validated deep-analysis packet updates a later turn.</text>
    </svg>
  );
}

/* ---------- 5 · AGENT PANEL — four analysts, working concurrently ---------- */

const AGENTS = [
  { name: "CONCEPT", find: "consistent hashing is explained", val: 0.82, done: 3400 },
  { name: "WEAKNESS", find: "failover mechanism is missing", val: 0.61, done: 4300 },
  { name: "REASONING", find: "reasoning follows system constraints", val: 0.78, done: 5200 },
];
const CLAIMS = [
  { label: "Redis session sharding", ok: true },
  { label: "Dual-lane orchestration", ok: true },
  { label: "Team-of-eight ownership", ok: false },
  { label: "Playwright e2e suite", ok: true },
];

export function AgentsGraphic({ a }: { a: boolean }) {
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
          </g>
        );
      })}

      {/* discrepancy agent: live claim-by-claim check */}
      <g className="lv-box">
        <rect x={330} y={86} width={280} height={244} rx={12} />
        <text x={348} y={112} className="svg-label small">DISCREPANCY AGENT</text>
        <text x={348} y={130} className="svg-sub">checks résumé claims against live answers</text>
        {CLAIMS.map((c, i) => {
          const s = 2200 + i * 1050;
          const scanning = t >= s && t < s + 780;
          const stamped = t >= s + 780;
          return (
            <g key={c.label}>
              {scanning && <rect x={342} y={142 + i * 40} width={256} height={32} rx={7} className="scanline" style={{ opacity: 0.4 + 0.5 * pulse(t, 420) }} />}
              <text x={352} y={163 + i * 40} className="svg-mono tinytext">{c.label}</text>
              {scanning && <text x={594} y={163 + i * 40} textAnchor="end" className="svg-sub">probing…</text>}
              {stamped && (
                <text x={594} y={163 + i * 40} textAnchor="end" className={c.ok ? "tick ok" : "tick bad"} style={rise(eph(t, s + 780, s + 1000), 4)}>
                  {c.ok ? "✓ verified" : "✗ unverified"}
                </text>
              )}
            </g>
          );
        })}
        <text x={348} y={318} className="svg-sub" style={{ opacity: t > 6600 ? 1 : 0 }}>Claim status links to transcript evidence.</text>
      </g>

      {/* converging output */}
      <line x1={40} y1={368} x2={600} y2={368} className="lv-edge" style={{ opacity: 0.35 }} />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={40 + ((t / 4 + i * 140) % 560)} cy={368} r={3.2} className="lv-pulse" style={{ opacity: t > 3400 ? 0.8 : 0 }} />
      ))}
      <text x={320} y={392} textAnchor="middle" className="svg-sub">Concurrent findings converge into the next-question decision.</text>
    </svg>
  );
}

/* ---------- 6 · ORCHESTRATOR — signals land, reasoning types, decision fires ---------- */

const ORCH_IN = [
  { label: "LIVE ANSWER", v: "0.87", icon: "wave" },
  { label: "CONCEPT", v: "0.82", icon: "bulb" },
  { label: "WEAKNESS", v: "0.61", icon: "crack" },
  { label: "DISCREPANCY", v: "1 flag", icon: "scales" },
  { label: "REASONING", v: "0.78", icon: "net" },
];

/** tiny storytelling glyph for each orchestrator input */
function OrchIcon({ icon, x, y, t }: { icon: string; x: number; y: number; t: number }) {
  if (icon === "wave")
    return (
      <g transform={`translate(${x},${y})`}>
        {[0, 1, 2].map((i) => {
          const h = q(5 + 8 * noise(i * 4 + 2, t));
          return <rect key={i} x={i * 5} y={q(8 - h / 2)} width={3.2} height={h} rx={1.5} className="lv-bar" />;
        })}
      </g>
    );
  if (icon === "bulb")
    return (
      <g transform={`translate(${x},${y})`} className="lv-orchicon">
        <circle cx={7} cy={7} r={5} />
        <line x1={7} y1={14} x2={7} y2={17} />
        <line x1={0} y1={2} x2={2.5} y2={4} />
        <line x1={14} y1={2} x2={11.5} y2={4} />
      </g>
    );
  if (icon === "crack")
    return (
      <g transform={`translate(${x},${y})`} className="lv-orchicon">
        <path d="M 7 0 L 4 6 L 9 9 L 5 16" fill="none" />
      </g>
    );
  if (icon === "scales")
    return (
      <g transform={`translate(${x},${y})`} className="lv-orchicon">
        <line x1={7} y1={1} x2={7} y2={14} />
        <line x1={0} y1={4} x2={14} y2={4} />
        <circle cx={1.5} cy={9} r={3} />
        <circle cx={12.5} cy={9} r={3} />
      </g>
    );
  return (
    <g transform={`translate(${x},${y})`} className="lv-orchicon">
      <circle cx={2} cy={3} r={2} />
      <circle cx={2} cy={13} r={2} />
      <circle cx={12} cy={8} r={2.6} />
      <line x1={4} y1={4} x2={10} y2={7} />
      <line x1={4} y1={12} x2={10} y2={9} />
    </g>
  );
}

export function OrchestratorGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 9000;
  const t = el % L;
  const cycle = Math.floor(el / L) % 2; // alternate decisions
  const landed = ORCH_IN.filter((_, i) => t > 900 + i * 480 + 700).length;
  const reason =
    cycle === 0
      ? "retrieval depth confirmed → use the prepared follow-up"
      : "failover gap detected → promote a deeper probe";
  const reasonTxt = typed(reason, t, 3400, 5700);
  const decided = t > 6000;
  const chosen = cycle === 0 ? 0 : 1;

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <text x={320} y={18} textAnchor="middle" className="svg-sub">SPECIALIST AGENTS FIRE IN PARALLEL · ONE GOVERNED DECISION</text>
      {ORCH_IN.map((s, i) => {
        const y = 48 + i * 62;
        const fireAt = 900 + i * 480;
        const p = ph(t, fireAt, fireAt + 700);
        const [px, py] = bez(ez(p), [172, y], [262, (y + 190) / 2 + 30], [330, 192]);
        const hasLanded = t > fireAt + 700;
        return (
          <g key={s.label}>
            <g className={`lv-node ${t > fireAt - 250 && !hasLanded ? "is-live" : ""}`}>
              <rect x={30} y={y - 22} width={142} height={44} rx={9} />
              <OrchIcon icon={s.icon} x={40} y={y - 12} t={t} />
              <text x={62} y={y - 4} className="svg-label small">{s.label}</text>
              <text x={162} y={y + 14} textAnchor="end" className="svg-mono tinytext" style={{ opacity: t > fireAt - 250 ? 1 : 0.35 }}>{s.v}</text>
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
        <text x={372} y={188} textAnchor="middle" className="svg-label">DECIDE</text>
        <text x={372} y={204} textAnchor="middle" className="svg-sub">{landed < 5 ? `${landed}/5 inputs` : "route ready"}</text>
      </g>

      {/* decision routes */}
      {["ASK NEXT", "DEEPER PROBE"].map((d, i) => {
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
              <text x={572} y={y + 35} textAnchor="middle" className="svg-sub">{i === 0 ? "ready question" : "future path"}</text>
            </g>
          </g>
        );
      })}

      {/* live reasoning trace */}
      <g className="lv-box">
        <rect x={186} y={338} width={438} height={56} rx={10} />
        <text x={200} y={359} className="svg-sub">WHY THIS ROUTE · REVIEWABLE AFTER THE INTERVIEW</text>
        <text x={200} y={379} className="svg-mono tinytext">{reasonTxt}{t > 3400 && t < 5800 ? caret(t) : ""}</text>
      </g>
      <text x={30} y={382} className="svg-sub" style={{ opacity: decided ? 1 : 0 }}>
        decision:{" "}
      </text>
      <text x={30} y={400} className="svg-mono small" style={{ opacity: decided ? 1 : 0 }}>
        {chosen === 0 ? "ASK NEXT ✓" : "DEEPER PROBE ✓"}
      </text>
    </svg>
  );
}

/* ---------- 7 · VOICE OUT — the 940 ms budget, replayed in slow-mo ---------- */

export function VoiceOutGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 10600;
  const t = el % L;
  const SLOW = 4;
  const rows = [
    { key: "stt", label: "live transcript", ms: 180, start: 600 },
    { key: "route", label: "question route", ms: 240, start: 600 + 180 * SLOW },
    { key: "tts", label: "primary speech", ms: 320, start: 600 + 420 * SLOW },
  ];
  const failAt = rows[2].start + 320 * SLOW * 0.35;
  const failed = t > failAt;
  const fbStart = failAt + 250;
  const fbMs = 290;
  const doneAt = fbStart + fbMs * SLOW;

  let total = 0;
  for (const r of rows) {
    if (r.key === "tts") {
      total += 320 * 0.35 * ph(t, r.start, failAt);
    } else {
      total += r.ms * ph(t, r.start, r.start + r.ms * SLOW);
    }
  }
  total += fbMs * ph(t, fbStart, fbStart + fbMs * SLOW);

  const speakStart = doneAt + 500;
  const speaking = t > speakStart && t < speakStart + 2800;
  const qText = typed("“what happens when a shard dies?”", t, speakStart, speakStart + 2400);

  const SCX = 0.55;
  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <text x={40} y={44} className="lv-phase small">VOICE DELIVERY · CACHE-FIRST WITH PROVIDER RECOVERY</text>
      <g className="lv-chip">
        <rect x={452} y={26} width={158} height={44} rx={10} />
        <text x={466} y={44} className="svg-sub">MODEL ROUTER</text>
        <text x={466} y={62} className="svg-mono tinytext">
          {t > doneAt ? "fallback delivered" : failed ? "fallback engaged" : total > 0 ? "primary active" : "fallback armed"}
        </text>
      </g>

      {rows.map((r, i) => {
        const isTts = r.key === "tts";
        const prog = isTts ? Math.min(0.35, ph(t, r.start, failAt) * 0.35) : ph(t, r.start, r.start + r.ms * SLOW);
        const x0 = 200 + rows.slice(0, i).reduce((s, q) => s + q.ms * SCX, 0);
        return (
          <g key={r.label}>
            <text x={190} y={106 + i * 52} textAnchor="end" className="svg-mono small">{r.label}</text>
            <rect x={x0} y={92 + i * 52} width={r.ms * SCX} height={20} rx={6} className="lv-track" />
            <rect x={x0} y={92 + i * 52} width={r.ms * SCX * prog} height={20} rx={6} className={`lv-bar ${isTts && failed ? "bad" : ""}`} />
            {prog > 0 && prog < 1 && !(isTts && failed) && (
              <text x={x0 + r.ms * SCX * prog + 6} y={106 + i * 52} className="svg-mono tinytext">{fmtMs(r.ms * prog)}</text>
            )}
            {isTts && failed && (
              <text x={x0 + r.ms * SCX * 0.35 + 8} y={106 + i * 52} className="tick bad">✗ timeout → reroute</text>
            )}
          </g>
        );
      })}

      {/* automatic fallback route after the primary provider crosses its cap */}
      {t > fbStart - 200 && (
        <g style={rise(eph(t, fbStart - 200, fbStart + 300))}>
          <text x={190} y={106 + 3 * 52} textAnchor="end" className="svg-mono small">fallback speech</text>
          <rect x={200 + 420 * SCX} y={92 + 3 * 52} width={fbMs * SCX} height={20} rx={6} className="lv-track" />
          <rect x={200 + 420 * SCX} y={92 + 3 * 52} width={fbMs * SCX * ph(t, fbStart, fbStart + fbMs * SLOW)} height={20} rx={6} className="lv-bar warm" />
          <text x={196 + 420 * SCX} y={126 + 3 * 52} className="svg-sub">automatic provider recovery</text>
        </g>
      )}

      {/* verdict stamp — clear of the waterfall rows */}
      {t > doneAt + 150 && (
        <g className="lv-stamp" style={rise(eph(t, doneAt + 150, doneAt + 550), 6)}>
          <rect x={40} y={244} width={180} height={40} rx={9} />
          <text x={130} y={262} textAnchor="middle" className="svg-label small">
            WITHIN TURN BUDGET ✓
          </text>
          <text x={130} y={277} textAnchor="middle" className="svg-sub">fallback recovered the turn</text>
        </g>
      )}

      {/* prepared-audio cache — likely future questions are synthesized in advance */}
      <text x={40} y={302} className="svg-sub">PREPARED AUDIO CACHE · CHECKED BEFORE A PROVIDER CALL</text>
      {["arch probe", "ownership", "failure probe", "stale-state"].map((c2, i) => {
        const hit = i === 2 && t > rows[1].start + 240 * SLOW;
        return (
          <g key={c2} className={`lv-chip ${hit ? "win" : ""}`}>
            <rect x={40 + i * 150} y={310} width={144} height={24} rx={7} style={{ opacity: hit ? 1 : 0.55 }} />
            <text x={112 + i * 150} y={326} textAnchor="middle" className="svg-mono tinytext">
              {hit ? `${c2} · HIT ✓` : c2}
            </text>
          </g>
        );
      })}

      {/* the voice actually speaks */}
      <text x={40} y={362} className="svg-sub">VOICE RESPONSE TO CANDIDATE</text>
      <Wave x={200} y={346} w={130} h={26} bars={18} t={t} on={speaking ? 1 : 0.05} />
      <text x={344} y={364} className="svg-mono tinytext">{qText}{speaking ? caret(t) : ""}</text>
      <text x={40} y={400} className="svg-note">
        Cache hit, primary synthesis, or fallback recovery all return through one guarded voice route.
      </text>
    </svg>
  );
}

/* ---------- 8 · EVIDENCE REPORT — assembled from moments, live ---------- */

const MOMENTS = [
  { at: "14:22", quote: "hashing explanation" },
  { at: "18:05", quote: "failover recovery" },
  { at: "22:41", quote: "résumé claim challenged" },
  { at: "27:19", quote: "reasoning under pressure" },
];
const REPORT_ROWS = [
  ["Distributed-systems depth", "Linked to the answer and its follow-up probe."],
  ["Failure-mode reasoning", "Linked to the failover probe and recovery."],
  ["Résumé claim verification", "Claim status linked to the transcript."],
  ["Reasoning under pressure", "Escalation turns remain directly reviewable."],
];

export function ReportGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 10800;
  const t = el % L;
  const count = 208 + Math.round(43 * eph(t, 800, 8200));

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <text x={30} y={40} className="svg-sub">SOURCE MOMENTS · TIMESTAMPS</text>
      {MOMENTS.map((m, i) => (
        <g key={m.at} className="lv-chip" style={rise(eph(t, 400 + i * 420, 800 + i * 420))}>
          <rect x={26} y={56 + i * 74} width={182} height={56} rx={10} />
          <text x={40} y={78 + i * 74} className="svg-mono tinytext">t = {m.at}</text>
          <text x={40} y={96 + i * 74} className="svg-sub">{m.quote}</text>
        </g>
      ))}

      {/* report assembling */}
      <g className="lv-box">
        <rect x={252} y={32} width={368} height={356} rx={14} />
        <text x={276} y={64} className="svg-label big">CANDIDATE EVIDENCE REPORT</text>
        <text x={276} y={84} className="svg-sub">interview #{count} · timestamp-linked evidence</text>
        {/* completion checks — process state rather than invented scoring */}
        {[
          ["TRACE LINKS", "mapped"],
          ["SKILL COVERAGE", "mapped"],
          ["CLAIM STATUS", "checked"],
        ].map(([k2, status], i) => {
          const p = eph(t, 1600 + i * 300, 3400 + i * 300);
          const x = 276 + i * 106;
          return (
            <g key={String(k2)}>
              <text x={x} y={103} className="svg-sub">{k2}</text>
              <text x={x + 96} y={118} textAnchor="end" className="svg-mono tinytext">{p === 1 ? status : "linking"}</text>
              <rect x={x} y={123} width={96} height={5} rx={2.5} className="lv-track thin" />
              <rect x={x} y={123} width={q(96 * p)} height={5} rx={2.5} className="lv-bar" />
            </g>
          );
        })}
        {REPORT_ROWS.map((r, i) => {
          const s = 2300 + i * 1300;
          const p = eph(t, s, s + 500);
          const link = eph(t, s - 350, s + 100);
          return (
            <g key={r[0]}>
              {link > 0 && (
                <path
                  d={`M 208 ${84 + i * 74} C 232 ${84 + i * 74} 236 ${142 + i * 54} 252 ${144 + i * 54}`}
                  className="lv-edge win"
                  pathLength={100}
                  strokeDasharray="100 100"
                  strokeDashoffset={100 - link * 100}
                  style={{ opacity: 0.7 }}
                />
              )}
              <g style={rise(p, 8)}>
                <text x={276} y={148 + i * 54} className="svg-mono small">{r[0]}</text>
                <text x={276} y={165 + i * 54} className="svg-sub">{r[1]}</text>
                <text x={596} y={154 + i * 54} textAnchor="end" className="tick ok">✓</text>
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
          <text x={460} y={361} textAnchor="middle" className="svg-label">RECRUITER READY</text>
        </g>
      </g>
    </svg>
  );
}

/* ---------- 9 · OFFLINE EVALUATION — traces become guarded revisions ---------- */

const INTERVIEW_EVALS = [
  ["QUESTION VALUE", "CHECKED"],
  ["EVIDENCE COVERAGE", "CHECKED"],
  ["ROUTE QUALITY", "CHECKED"],
  ["TONE + SAFETY", "PASS"],
] as const;

export function EvaluationLoopGraphic({ a }: { a: boolean }) {
  const el = useSim(a);
  const L = 10400;
  const t = el % L;
  const traceP = eph(t, 500, 2200);
  const evalP = eph(t, 1900, 4800);
  const candidateP = eph(t, 4600, 6500);
  const regressionP = eph(t, 6400, 8200);
  const releaseP = eph(t, 8100, 9000);

  return (
    <svg viewBox="0 0 640 420" className="op-svg">
      <text x={24} y={28} className="lv-phase small">OFFLINE RL OBSERVABILITY + REFINEMENT</text>
      <text x={616} y={28} textAnchor="end" className="svg-sub">human-gated · never live self-training</text>

      <g className={`lv-node ${traceP < 1 ? "is-live" : ""}`}>
        <rect x={24} y={58} width={138} height={116} rx={11} />
        <text x={93} y={82} textAnchor="middle" className="svg-label small">COMPLETED RUN</text>
        {["turn traces", "route decisions", "token + latency", "report evidence"].map((label, index) => (
          <g key={label}>
            <circle cx={40} cy={105 + index * 18} r={2.7} className="lv-pulse" style={{ opacity: traceP }} />
            <text x={50} y={109 + index * 18} className="svg-mono tinytext">{label}</text>
          </g>
        ))}
      </g>

      <path d="M 162 116 C 184 116 190 116 210 116" className="lv-edge win" style={{ opacity: traceP }} />
      {traceP > 0 && traceP < 1 && <circle cx={q(162 + traceP * 48)} cy={116} r={4.2} className="lv-pulse" />}

      <g className="lv-box hot">
        <rect x={210} y={58} width={194} height={202} rx={12} />
        <text x={228} y={82} className="svg-label small">AGENT EVALUATION HARNESS</text>
        {INTERVIEW_EVALS.map(([label, value], index) => {
          const rowP = eph(t, 2100 + index * 480, 2900 + index * 480);
          return (
            <g key={label} style={{ opacity: 0.28 + rowP * 0.72 }}>
              <text x={228} y={111 + index * 34} className="svg-sub">{label}</text>
              <rect x={228} y={119 + index * 34} width={116} height={5} rx={2.5} className="lv-track thin" />
              <rect x={228} y={119 + index * 34} width={116 * rowP} height={5} rx={2.5} className="lv-bar" />
              <text x={392} y={123 + index * 34} textAnchor="end" className="tick ok">{value}</text>
            </g>
          );
        })}
        <text x={228} y={242} className="svg-sub" style={{ opacity: evalP }}>QUALITY FLAGS</text>
        <text x={228} y={255} className="svg-mono tinytext" style={{ opacity: evalP }}>difficulty · clarity · bias · tone</text>
      </g>

      <g className={`lv-node ${candidateP > 0 && regressionP === 0 ? "is-live" : ""}`}>
        <rect x={438} y={58} width={178} height={202} rx={12} />
        <text x={527} y={82} textAnchor="middle" className="svg-label small">REVISION CANDIDATES</text>
        {[
          ["PROMPT", "probe wording v18"],
          ["ROUTER", "fast/deep threshold"],
          ["POLICY", "tone + guard rules"],
          ["CONFIG", "token envelope"],
        ].map(([label, value], index) => (
          <g key={label} className={`lv-chip ${candidateP > (index + 1) / 5 ? "win" : ""}`}>
            <rect x={452} y={96 + index * 36} width={150} height={28} rx={7} />
            <text x={462} y={107 + index * 36} className="svg-sub">{label}</text>
            <text x={594} y={120 + index * 36} textAnchor="end" className="svg-mono tinytext">{value}</text>
          </g>
        ))}
      </g>
      <path d="M 404 158 L 438 158" className="lv-edge win" style={{ opacity: candidateP }} />

      <g className="lv-box">
        <rect x={24} y={292} width={476} height={92} rx={11} />
        <text x={42} y={316} className="svg-label small">REGRESSION RELEASE GATE</text>
        {["contract tests", "candidate-safe replay", "latency + token budget", "question-policy checks"].map((label, index) => (
          <g key={label} className={`lv-chip ${regressionP > (index + 1) / 5 ? "win" : ""}`}>
            <rect x={42 + (index % 2) * 216} y={328 + Math.floor(index / 2) * 28} width={202} height={22} rx={6} />
            <text x={52 + (index % 2) * 216} y={343 + Math.floor(index / 2) * 28} className="svg-mono tinytext">
              {regressionP > (index + 1) / 5 ? "✓ " : "… "}{label}
            </text>
          </g>
        ))}
      </g>

      <g className={`lv-stamp ${releaseP > 0 ? "big" : ""}`} style={rise(releaseP, 7)}>
        <rect x={520} y={292} width={96} height={92} rx={11} />
        <text x={568} y={321} textAnchor="middle" className="svg-sub">HUMAN-GATED</text>
        <text x={568} y={344} textAnchor="middle" className="svg-label small">VERSION</text>
        <text x={568} y={363} textAnchor="middle" className="tick ok">v-next ✓</text>
      </g>

      <path d="M 568 292 C 568 270 527 270 527 260" className="lv-edge" style={{ opacity: releaseP * 0.55 }} />
      <text x={24} y={408} className="svg-note">Trace → evaluate → refine → replay → approve. Behavior remains inspectable across versions.</text>
    </svg>
  );
}

/* ---------- chapter ---------- */

const STEPS: StepDef[] = [
  {
    label: "The loop",
    sub: "high-level architecture",
    pilotTitle: "A live answer becomes the next question in one continuous loop",
    pilotBody:
      "Speech is transcribed as it arrives. The multi-agent decision engine evaluates the turn, selects the next question, and returns it over the real-time voice channel — the complete runtime behind each interview turn.",
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
    pilotTitle: "Reasoning starts while the candidate is still speaking",
    pilotBody:
      "Deepgram streams a live transcript while the answer is in progress, then commits a stable final with word-level confidence. Downstream analysis starts early, but only committed text enters interview state and recruiter evidence.",
    metrics: [
      { k: "partial latency", v: "~180 ms" },
      { k: "transcription accuracy", v: "95%+" },
      { k: "state write", v: "stable finals" },
    ],
    graphic: (a) => <SttGraphic a={a} />,
  },
  {
    label: "Trajectory map",
    sub: "the interview plan",
    pilotTitle: "Every answer updates a structured interview path",
    pilotBody:
      "Résumé claims seed an interview map before the session begins. Each live answer is matched to valid probe branches; the best route becomes the next question while deeper findings expand the future path.",
    metrics: [
      { k: "built from", v: "résumé claims" },
      { k: "routing signal", v: "semantic similarity" },
      { k: "map build", v: "async, non-blocking" },
    ],
    graphic: (a) => <TrajectoryGraphic a={a} />,
  },
  {
    label: "Dual-lane engine",
    sub: "why it feels instant",
    pilotTitle: "The next question ships while deeper analysis continues",
    pilotBody:
      "The foreground path routes a safe next question in about 900 ms. In parallel, concept, weakness, discrepancy, and reasoning agents build a validated question packet and promote it into a later branch of the interview map.",
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
    pilotTitle: "Four specialist agents inspect the same answer in parallel",
    pilotBody:
      "Concept depth, weaknesses, reasoning quality, and résumé consistency are evaluated concurrently. Their findings remain linked to the turn that produced them and feed the next-question decision.",
    metrics: [
      { k: "agents per turn", v: "4 + evaluator" },
      { k: "claim checks", v: "per-claim ✓/✗" },
      { k: "observability", v: "per-turn traces" },
    ],
    graphic: (a) => <AgentsGraphic a={a} />,
  },
  {
    label: "Orchestrator",
    sub: "signals converge",
    pilotTitle: "Specialist findings resolve into one governed next move",
    pilotBody:
      "The decision graph fuses the live answer with specialist findings, applies question-policy and state guardrails, and routes the turn to ask next, probe deeper, or pivot. Its decision trace stays reviewable after the interview.",
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
    pilotTitle: "Voice delivery stays recoverable when a provider slows or fails",
    pilotBody:
      "The runtime checks prepared audio first, routes uncached speech to the primary TTS provider, and automatically switches to the fallback when the primary crosses its timeout. Both paths rejoin the same guarded voice response.",
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
    pilotTitle: "The recruiter receives conclusions that can be traced back",
    pilotBody:
      "Every hiring signal links to a transcript timestamp: where technical depth was demonstrated, how failure modes were handled, and which résumé claims held under probing. The report supports inspection instead of relying on an aggregate impression.",
    metrics: [
      { k: "interviews", v: "250+" },
      { k: "report", v: "evidence-linked" },
      { k: "tests", v: "contract + e2e" },
    ],
    graphic: (a) => <ReportGraphic a={a} />,
  },
  {
    label: "RL observability",
    sub: "governed improvement",
    pilotTitle: "Interview behavior improves through an offline, human-gated loop",
    pilotBody:
      "Completed-run traces are evaluated for question value, evidence coverage, route quality, tone, and safety. Prompt, router, policy, or token-envelope revisions must pass replay and regression gates before a human approves the next version — never through live self-training.",
    metrics: [
      { k: "evaluation", v: "trace-level" },
      { k: "release", v: "human-gated" },
      { k: "training", v: "offline only" },
    ],
    graphic: (a) => <EvaluationLoopGraphic a={a} />,
  },
];

export function AntigravityChapter() {
  return (
    <ChapterShell
      id="antigravity"
      accent="#7ee0ff"
      kicker="PROJECT 01 · FLAGSHIP"
      title="Antigravity"
      subtitle="Production-grade interview software built on a multi-agent decision engine: it automates technical interviews, adapts the question path in real time, and produces evidence-linked recruiter intelligence."
      steps={STEPS}
      stepMs={11600}
      footer={
        <div className="chapter-cta" id="antigravity-demo">
          <p className="cta-lead">This system is real and running. Don&apos;t take the replay&apos;s word for it —</p>
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
