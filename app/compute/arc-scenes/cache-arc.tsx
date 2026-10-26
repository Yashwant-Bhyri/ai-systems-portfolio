"use client";

import { cacheRoutingStudy } from "../cache-routing-model";
import { ease, prog } from "../../exhibit/engine";
import { makeImpact, type ArcBeat, type SceneProps } from "../stagecraft/module-arc";

/* Cache-aware routing, as a full circle. Pages, waits and first-token times are
   the lab's cache-routing model on calibrated costs: 12 KV pages of 1,024 tokens
   per replica, a 4,096-token shared prefix, a 2,048-token question, ~20 ms of
   prefill per page (Qwen3-4B, one H100), 20 ms until pages free. */
const S = cacheRoutingStudy();
const C = { prefix: "#63d4df", q: "#ffc267", other: "#4a5662", free: "rgba(255,255,255,.03)", wait: "#ff8f86", ink: "#eef2f6", out: "#b8e986" };
const PROBLEM_MS = 11000, MECH_MS = 12500, HORIZON = Math.ceil((S.cold.firstToken + 10) / 20) * 20;
const T0 = 740, TPX = 320 / HORIZON; // timeline: 0..HORIZON ms
const tx = (ms: number) => T0 + ms * TPX;

function Replica({ y, title, note, pages, highlight }: { y: number; title: string; note: string; pages: (string | null)[]; highlight?: number[] }) {
  return <g transform={`translate(270 ${y})`}>
    <rect width={400} height={150} rx={12} fill="rgba(255,255,255,.02)" stroke="#3f4a55" />
    <text x={18} y={30} className="ma-k">{title}</text>
    <text x={18} y={50} className="ma-l">{note}</text>
    {pages.map((p, i) => (
      <rect key={i} x={18 + (i % 6) * 62} y={64 + Math.floor(i / 6) * 40} width={54} height={32} rx={4}
        fill={p ?? C.free} stroke={highlight?.includes(i) ? "#eef2f6" : "#3f4a55"} strokeWidth={highlight?.includes(i) ? 2 : 1} />
    ))}
  </g>;
}

function Timeline({ now, warm, ghost }: { now: number; warm: boolean; ghost?: boolean }) {
  const row = (r: typeof S.warm, y: number, label: string, faint: boolean) => {
    const vis = (a: number, b: number) => Math.max(0, Math.min(b, now) - a);
    return <g opacity={faint ? 0.35 : 1}>
      <text x={T0 - 16} y={y + 18} textAnchor="end" className="ma-l">{label}</text>
      {r.start > 0 && <rect x={tx(0)} y={y} width={vis(0, r.start) * TPX} height={26} rx={3} fill="none" stroke={C.wait} strokeDasharray="4 3" />}
      <rect x={tx(r.start)} y={y} width={vis(r.start, r.prefillEnd) * TPX} height={26} rx={3} fill={C.q} opacity={0.85} />
      {now >= r.firstToken && <g><path d={`M${tx(r.firstToken)} ${y - 2}l7 15-7 15-7-15z`} fill={C.out} /><text x={tx(r.firstToken) + 12} y={y + 18} className="ma-l" style={{ fill: C.out }}>{r.firstToken} ms</text></g>}
    </g>;
  };
  return <g>
    <text x={T0} y={120} className="ma-l">time to first token</text>
    <path d={`M${tx(0)} 222H${tx(HORIZON)}`} className="ma-axis" />
    {[0, 40, 80, 120].filter((v) => v <= HORIZON).map((v) => <text key={v} x={tx(v)} y={242} textAnchor="middle" className="ma-l">{v}</text>)}
    {warm ? row(S.warm, 140, "A", false) : row(S.cold, 140, "B", false)}
    {ghost && row(S.cold, 180, "B", true)}
    <path d={`M${tx(Math.min(now, HORIZON))} 128V226`} stroke="#eef2f6" strokeOpacity={0.35} />
  </g>;
}

function Request({ k }: { k: number }) {
  return <g transform="translate(0 170)" opacity={k}>
    <text x={0} y={0} className="ma-k">New request</text>
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={i * 34} y={14} width={30} height={30} rx={4} fill={i < 4 ? C.prefix : C.q} opacity={0.9} />)}
    <text x={0} y={66} className="ma-l" style={{ fill: C.prefix }}>shared prefix · 4,096 tokens</text>
    <text x={0} y={86} className="ma-l" style={{ fill: C.q }}>its question · 2,048 tokens</text>
  </g>;
}

const route = (t: number) => ease.io(prog(t, 900, 1900));
const sim = (t: number, ms: number) => ease.io(prog(t, 2000, ms - 2400)) * HORIZON;
const A_FULL = [C.prefix, C.prefix, C.prefix, C.prefix, ...Array(8).fill(C.other)];

function Problem({ t }: SceneProps) {
  const r = route(t), now = sim(t, PROBLEM_MS);
  const filled = Math.min(8, Math.floor((now / S.cold.prefillEnd) * 6) + (now >= S.cold.prefillEnd ? 2 : 0));
  const B = Array.from({ length: 12 }, (_, i) => (i < filled ? (i < 4 ? C.prefix : i < 6 ? C.q : C.out) : null));
  return <svg viewBox="0 0 1100 420" role="img" aria-label="Least-loaded routing sends the request to the empty replica, which recomputes the whole prompt; first token at 62 ms">
    <Request k={1} />
    <Replica y={30} title="Replica A · warm" note="already holds the prefix · no free pages" pages={A_FULL} />
    <Replica y={230} title="Replica B · cold" note={filled ? "recomputing the whole prompt" : "empty · no prefix"} pages={B} highlight={now > 0 && now < 60 ? [Math.min(5, filled)] : undefined} />
    <path d={`M210 199C240 199 240 ${305} ${210 + 60 * r} 305`} fill="none" stroke={C.q} strokeWidth={2} opacity={r} />
    <text x={210} y={404} className="ma-l" opacity={r}>router: least-loaded → B</text>
    <Timeline now={now} warm={false} />
  </svg>;
}

function Mechanism({ t }: SceneProps) {
  const r = route(t), now = sim(t, MECH_MS);
  const released = now >= S.warm.release;
  const pre = Math.max(0, Math.min(2, Math.floor((now - S.warm.start) / S.prefillMsPerBlock)));
  const A = A_FULL.map((c, i) => (i >= 4 && i < 8 ? (released ? (i - 4 < pre ? C.q : i - 4 < (now >= S.warm.prefillEnd ? 4 : pre) ? C.out : null) : c) : c));
  return <svg viewBox="0 0 1100 420" role="img" aria-label="Cache-aware routing sends the request to the replica holding its prefix, reuses four pages, waits 20 ms for space, prefills two blocks; first token at 42 ms">
    <Request k={1} />
    <Replica y={30} title="Replica A · warm" note={!released && now > 0 ? "waiting for pages to free" : now > 0 ? "reusing 4 prefix pages" : "already holds the prefix · no free pages"} pages={A} highlight={now > 0 ? [0, 1, 2, 3] : undefined} />
    <Replica y={230} title="Replica B · cold" note="empty · no prefix" pages={Array(12).fill(null)} />
    <path d={`M210 199C240 199 240 ${105} ${210 + 60 * r} 105`} fill="none" stroke={C.prefix} strokeWidth={2} opacity={r} />
    <text x={210} y={404} className="ma-l" opacity={r}>router: where the prefix lives → A</text>
    <Timeline now={now} warm ghost />
  </svg>;
}

/** The result: both routes on one clock, and where routing to the warm replica stops paying. */
function Crossover({ t }: SceneProps) {
  const k = ease.io(prog(t, 300, 3200));
  // left: the two routes on one clock
  const L = 150, Wd = 420, H = Math.max(S.cold.firstToken, S.warm.firstToken) + 20, sx = (ms: number) => L + (ms / H) * Wd, now = k * H;
  const lane = (r: typeof S.warm, y: number, label: string, col: string) => {
    const vis = (a: number, b: number) => Math.max(0, Math.min(b, now) - a);
    return <g>
      <text x={0} y={y + 20} className="ma-k">{label}</text>
      {r.start > 0 && <rect x={sx(0)} y={y} width={(vis(0, r.start) / H) * Wd} height={30} rx={3} fill="none" stroke={C.wait} strokeDasharray="4 3" />}
      {r.start > 0 && now > r.start && <text x={sx(r.start / 2)} y={y + 50} textAnchor="middle" className="ma-l" style={{ fill: C.wait }}>wait {r.start} ms</text>}
      <rect x={sx(r.start)} y={y} width={(vis(r.start, r.prefillEnd) / H) * Wd} height={30} rx={3} fill={C.q} opacity={0.85} />
      {now >= r.prefillEnd && <text x={(sx(r.start) + sx(r.prefillEnd)) / 2} y={y + 20} textAnchor="middle" className="ma-l" style={{ fill: "#1a1205" }}>{r.prefillBlocks} pages read</text>}
      {now >= r.firstToken && <g><path d={`M${sx(r.firstToken)} ${y - 4}l8 19-8 19-8-19z`} fill={col} /><text x={sx(r.firstToken) + 12} y={y + 20} className="ma-n" style={{ fill: col }}>{r.firstToken} ms</text></g>}
    </g>;
  };
  // right: first token against the wait for free pages
  const X0 = 700, XW = 470, px = (ms: number) => X0 + (ms / 100) * XW, maxY = 150, py = (v: number) => 330 - (v / maxY) * 280;
  const W = (ms: number) => cacheRoutingStudy({ retained: true, occupied: 8, releaseMs: ms }).warm.firstToken;
  const pts = Array.from({ length: 21 }, (_, i) => i * 5).filter((ms) => ms <= 100 * k);
  return <svg viewBox="0 0 1200 380" role="img" aria-label="Both routes on one clock, and first-token time against the wait for free pages with the crossover marked">
    <text x={0} y={30} className="ma-l">the same request, routed two ways</text>
    {lane(S.cold, 70, "Cold replica", "#9cc5f5")}
    {lane(S.warm, 170, "Warm replica", C.out)}
    <path d={`M${sx(0)} 262H${sx(H)}`} className="ma-axis" />
    {[0, 40, 80, 120].filter((v) => v <= H).map((v) => <text key={v} x={sx(v)} y={282} textAnchor="middle" className="ma-l">{v} ms</text>)}
    <text x={0} y={330} className="ma-k" style={{ fill: C.out }}>{S.delta} ms sooner</text>
    <text x={0} y={352} className="ma-l">{S.warm.reuse} of {S.promptBlocks} prompt pages were already cached</text>
    <text x={X0} y={30} className="ma-l">first token (ms) against the warm replica&rsquo;s wait for pages (ms)</text>
    <path d={`M${X0} 330H${px(100)}M${X0} 330V50`} className="ma-axis" />
    {[0, 50, 100, 150].map((v) => <text key={v} x={X0 - 8} y={py(v) + 4} textAnchor="end" className="ma-l">{v}</text>)}
    {[0, 20, 40, 60, 80, 100].map((v) => <text key={v} x={px(v)} y={352} textAnchor="middle" className="ma-l">{v}</text>)}
    <path d={`M${px(0)} ${py(S.cold.firstToken)}H${px(100)}`} stroke="#9cc5f5" strokeWidth={2} strokeDasharray="6 4" fill="none" />
    <text x={px(0) + 6} y={py(S.cold.firstToken) - 10} className="ma-l" style={{ fill: "#9cc5f5" }}>cold route</text>
    {pts.length > 1 && <path d={pts.map((ms, i) => `${i ? "L" : "M"}${px(ms)} ${py(W(ms))}`).join("")} stroke={C.prefix} strokeWidth={2.5} fill="none" />}
    <text x={px(12)} y={py(W(12)) + 24} className="ma-l" style={{ fill: C.prefix }}>warm route</text>
    {S.crossover !== null && k >= 0.85 && <g><circle cx={px(S.crossover)} cy={py(S.cold.firstToken)} r={6} fill="#c7a6ff" /><text x={px(S.crossover) - 14} y={py(S.cold.firstToken) - 16} textAnchor="end" className="ma-n" style={{ fill: "#c7a6ff" }}>crossover · {S.crossover} ms wait</text></g>}
  </svg>;
}

export const CACHE_ARC: { problem: ArcBeat; mechanism: ArcBeat; impact: ArcBeat; systemTitle: string } = {
  problem: { label: "Problem", title: "Least-loaded routing recomputes a prefix another replica already holds", ms: PROBLEM_MS, Scene: Problem },
  mechanism: { label: "How it works", title: "Cache-aware routing: go where the prefix lives, even if that means a short wait", ms: MECH_MS, Scene: Mechanism },
  systemTitle: "Warm prefix versus memory pressure, in our cache model",
  impact: {
    label: "Impact", title: "A faster first token, until the wait for space outgrows the reuse", ms: 9000,
    Scene: makeImpact({
      from: S.cold.firstToken, to: S.warm.firstToken, unit: "ms", digits: 0,
      what: "Time to the first token for the same request",
      cause: `${S.warm.reuse} of ${S.promptBlocks} prompt blocks were already cached on replica A, so only ${S.warm.prefillBlocks} needed prefill, even after waiting ${S.warm.release} ms for free pages.`,
      base: "Least-loaded (cold)", optimized: "Cache-aware (warm)",
      cost: { what: "Cost: waiting for free KV pages on the warm replica", from: 0, to: S.warm.start, unit: "ms", digits: 0 },
      Figure: Crossover,
    }),
  },
};
