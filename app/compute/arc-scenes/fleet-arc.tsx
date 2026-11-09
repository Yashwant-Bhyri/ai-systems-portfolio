"use client";

import { FLEET, GPUS, colocated, elastic, type Segment } from "../../exhibit/policy/fleet-model";
import { ease, prog } from "../../exhibit/engine";
import { makeImpact, type ArcBeat, type ArcLedger, type SceneProps } from "../stagecraft/module-arc";

/* Elastic RL on 64 GPUs, as a full circle: the barrier problem, the idea (a device keeps its
   identity while its role changes), what
   we built on that idea, and the result. Every segment is the lab's fleet model. */
const C = { rollout: "#f3a0bc", train: "#ffc267", sync: "#63d4df", idle: "#ff8f86", ink: "#eef2f6" };
const A = colocated(), B = elastic(9);
/** Eight of the 64 GPUs, including the slowest rollout of the first step. */
const SLOWEST = A.segs.filter((s) => s.step === 0 && s.kind === "rollout").reduce((a, b) => (b.end > a.end ? b : a)).gpu;
const ROWS = [0, 1, 2, 3, 4, 5, 6, SLOWEST];
const X0 = 230, SPAN = 4.4, PX = 660 / SPAN;
const x = (m: number) => X0 + m * PX;
/** Each of the first two beats opens on a worked example, then shows the GPUs. */
const EXAMPLE_MS = 8000;
const PROBLEM_MS = 11500 + EXAMPLE_MS, IDEA_MS = 12500 + EXAMPLE_MS;
/* ── The worked example: four agents, four environments, one RL step ──
   Each agent acts in its own environment until its task is done; the episode is its rollout. The
   environments need very different numbers of steps. A synchronous update needs every rollout, so the
   agents that finish early wait; with elastic roles a GPU trains the moment its rollout is in. */
const ENVS = [
  { name: "Maths checker", what: "answer, then check", steps: 3 },
  { name: "Code sandbox", what: "write, run the tests, fix", steps: 5 },
  { name: "Tool use", what: "search, read, call, answer", steps: 8 },
  { name: "Long proof", what: "many steps of reasoning", steps: 12 },
] as const;
const STEP = 0.42, EX0 = 0.6, TRAIN = 1.3;
function EnvExample({ t, elastic: el }: { t: number; elastic: boolean }) {
  const s = t / 1000, X0 = 250, X1 = 560, tx = (k: number, n: number) => X0 + (k / n) * (X1 - X0);
  const doneAt = ENVS.map((e) => EX0 + e.steps * STEP), allIn = Math.max(...doneAt);
  const inNow = doneAt.filter((d) => s >= d).length;
  const syncTrain = prog(s, allIn, allIn + TRAIN), publish = prog(s, allIn + TRAIN, allIn + TRAIN + 0.6);
  const caption = el
    ? s < allIn ? "Elastic roles: a GPU that finishes its rollout starts training at once" : "The slow rollout is not waited for: it joins the next update"
    : s < doneAt[0] ? "Each agent acts in its own environment until its task is done: that episode is its rollout"
    : s < allIn ? "The update needs every rollout, so the agents that finished early sit idle"
    : s < allIn + TRAIN ? "Only now can training start: one update learns from all four rollouts" : "The new weights go back to every agent, and the next step begins";
  return <g>
    <text x={0} y={30} className="ma-k" style={{ fontSize: 20 }}>{el ? "The same four agents, elastic roles" : "Four agents, four environments, one RL step"}</text>
    <text x={0} y={58} className="ma-l" style={{ fill: C.ink, fontSize: 17 }}>{caption}</text>
    {ENVS.map((e, i) => {
      const y = 108 + i * 84, d = doneAt[i], k = Math.max(0, Math.min(e.steps, Math.floor((s - EX0) / STEP))), done = s >= d;
      const training = el && done && s < d + TRAIN, waiting = !el && done && s < allIn + TRAIN;
      return <g key={e.name}>
        <rect x={0} y={y - 24} width={230} height={60} rx={10} fill="rgba(255,255,255,.03)" stroke="rgba(230,237,244,.16)" />
        <text x={14} y={y} className="ma-n" style={{ fontSize: 19 }}>{e.name}</text>
        <text x={14} y={y + 22} className="ma-l" style={{ fontSize: 14 }}>{e.steps} steps: {e.what}</text>
        {/* the episode: one tick per step in the environment */}
        <path d={`M${X0} ${y + 6}H${X1}`} stroke="rgba(230,237,244,.14)" />
        {Array.from({ length: e.steps + 1 }, (_, j) => <circle key={j} cx={tx(j, e.steps)} cy={y + 6} r={4} fill={j <= k ? C.rollout : "rgba(230,237,244,.2)"} />)}
        {!done && s > EX0 && <circle cx={tx(Math.min(e.steps, (s - EX0) / STEP), e.steps)} cy={y + 6} r={9} fill={C.rollout} />}
        {/* finished: its GPU waits, or trains at once */}
        {waiting && <g><rect x={X1 + 16} y={y - 10} width={130} height={32} rx={6} fill="none" stroke={C.idle} strokeDasharray="4 3" /><text x={X1 + 81} y={y + 11} textAnchor="middle" className="ma-l" style={{ fill: C.idle, fontSize: 15 }}>idle, waiting</text></g>}
        {training && <g><rect x={X1 + 16} y={y - 10} width={130} height={32} rx={6} fill={C.train} opacity={0.9} /><text x={X1 + 81} y={y + 11} textAnchor="middle" className="ma-l" style={{ fill: "#0b1016", fontSize: 15 }}>training</text></g>}
        {el && !done && i === ENVS.length - 1 && s > doneAt[2] && <text x={X1 + 16} y={y + 11} className="ma-l" style={{ fill: C.rollout, fontSize: 14 }}>joins the next step</text>}
      </g>;
    })}
    {/* the trainer */}
    {!el && <g transform="translate(740 130)">
      <rect width={170} height={220} rx={14} fill="rgba(255,255,255,.03)" stroke={syncTrain > 0 ? C.train : "rgba(230,237,244,.2)"} strokeWidth={syncTrain > 0 ? 2 : 1} />
      <text x={85} y={36} textAnchor="middle" className="ma-n" style={{ fontSize: 20 }}>Update</text>
      <text x={85} y={60} textAnchor="middle" className="ma-l" style={{ fontSize: 14 }}>needs every rollout</text>
      <text x={85} y={120} textAnchor="middle" className="ma-n" style={{ fontSize: 40, fill: inNow === 4 ? C.train : C.ink }}>{inNow} of 4</text>
      <text x={85} y={146} textAnchor="middle" className="ma-l" style={{ fontSize: 14 }}>rollouts in</text>
      <rect x={20} y={168} width={130 * syncTrain} height={10} rx={5} fill={C.train} />
      {publish > 0 && <text x={85} y={202} textAnchor="middle" className="ma-l" style={{ fill: C.sync, fontSize: 14 }} opacity={publish}>publish new weights</text>}
    </g>}
  </g>;
}
const ROLE = {
  rollout: ["generating rollouts", "an agent works its task"],
  train: ["training", "one update from all rollouts"],
  sync: ["publishing weights", "new policy to every GPU"],
} as const;

function Rows({ segs, now, note }: { segs: Segment[]; now: number; note: (gpu: number) => string | null }) {
  return <g>
    {ROWS.map((g, r) => {
      const y = 70 + r * 38;
      return <g key={g}>
        <text x={X0 - 14} y={y + 19} textAnchor="end" className="ma-l" style={{ fill: g === SLOWEST ? C.idle : undefined }}>GPU {g + 1}</text>
        {segs.filter((s) => s.gpu === g && s.start < Math.min(now, SPAN)).map((s, i) => {
          const b = Math.min(s.end, now, SPAN);
          const w = Math.max(0, (b - s.start) * PX - 1.5);
          return s.kind === "idle"
            ? <rect key={i} x={x(s.start) + 1} y={y + 3} width={w} height={22} rx={3} fill="none" stroke={C.idle} strokeDasharray="4 3" />
            : <rect key={i} x={x(s.start) + 1} y={y + 2} width={w} height={24} rx={3} fill={C[s.kind]} opacity={0.88} />;
        })}
        {note(g) && now > 1 && <text x={x(SPAN) + 10} y={y + 19} className="ma-l" opacity={prog(now, 1, 1.6)}>{note(g)}</text>}
      </g>;
    })}
    <path d={`M${x(Math.min(now, SPAN))} 60V${70 + ROWS.length * 38 + 4}`} stroke="#eef2f6" strokeOpacity={0.35} />
    {[0, 1, 2, 3, 4].map((m) => <text key={m} x={x(m)} y={70 + ROWS.length * 38 + 26} textAnchor="middle" className="ma-l">{m} min</text>)}
    {/* What each role is, in a few words, so the idle time has a reason. */}
    {(["rollout", "train", "sync"] as const).map((k, i) => <g key={k} transform={`translate(${X0 + i * 215} 412)`}><rect width={14} height={14} rx={2} fill={C[k]} /><text x={22} y={12} className="ma-l" style={{ fill: C.ink }}>{ROLE[k][0]}</text><text x={22} y={28} className="ma-l">{ROLE[k][1]}</text></g>)}
    <g transform={`translate(${X0 + 3 * 215} 412)`}><rect width={14} height={14} rx={2} fill="none" stroke={C.idle} strokeDasharray="3 2" /><text x={22} y={12} className="ma-l" style={{ fill: C.ink }}>waiting</text><text x={22} y={28} className="ma-l">finished, waiting for all</text></g>
  </g>;
}

const sweep = (t: number, ms: number) => ease.io(prog(t, 600, ms - 2600)) * SPAN;

function Problem({ t: t0 }: SceneProps) {
  if (t0 < EXAMPLE_MS) return <svg viewBox="0 0 920 460" role="img" aria-label="Four agents in four environments: the update needs every rollout, so agents that finish early wait"><EnvExample t={t0} elastic={false} /></svg>;
  const t = t0 - EXAMPLE_MS;
  const now = sweep(t, PROBLEM_MS - EXAMPLE_MS);
  const barrier = A.segs.find((s) => s.gpu === SLOWEST && s.kind === "rollout" && s.step === 0)!.end;
  return <svg viewBox="0 0 1100 450" role="img" aria-label="Synchronous RL: every GPU waits for the slowest rollout before anyone trains">
    <text x={0} y={30} className="ma-k">8 of 64 GPUs · one RL step</text>
    {/* Why they wait, said as the clock reaches each part. */}
    <text x={0} y={52} className="ma-l" style={{ fill: C.ink }}>{now < barrier * 0.85
      ? "Rollouts differ in length: some tasks take an agent many more steps in its environment"
      : "Training can start only when every rollout is in: one update learns from all of them together"}</text>
    <Rows segs={A.segs} now={now} note={() => null} />
    {now >= barrier && <g opacity={prog(now, barrier, barrier + 0.3)}>
      <path d={`M${x(barrier)} 56V${70 + ROWS.length * 38}`} stroke={C.idle} strokeWidth={2} />
      <text x={x(barrier) + 8} y={78 + ROWS.length * 38} className="ma-n" style={{ fill: C.idle }}>{GPUS - 1} GPUs wait for GPU {SLOWEST + 1}</text>
    </g>}
  </svg>;
}

function Idea({ t: t0 }: SceneProps) {
  if (t0 < EXAMPLE_MS) return <svg viewBox="0 0 920 460" role="img" aria-label="The same agents with elastic roles: a GPU trains as soon as its rollout is in"><EnvExample t={t0} elastic /></svg>;
  const t = t0 - EXAMPLE_MS;
  const now = sweep(t, IDEA_MS - EXAMPLE_MS);
  return <svg viewBox="0 0 1100 450" role="img" aria-label="Elastic roles: each GPU joins training the moment its own rollout ends; the straggler keeps generating for the next step">
    <text x={0} y={30} className="ma-k">The same 8 GPUs, elastic roles</text>
    <Rows segs={B.segs} now={now} note={(g) => (g === SLOWEST ? "lands in the next step" : null)} />
  </svg>;
}

/** All 64 GPUs on one wall clock: every row a GPU, every colour a role. */
function Raster({ t }: SceneProps) {
  const k = ease.io(prog(t, 300, 3800));
  const L = 240, R = 1170, span = FLEET.span, sx = (m: number) => L + (m / span) * (R - L), now = k * span, rh = 2.3;
  const panel = (segs: Segment[], stepEnds: number[], y: number, title: string, share: number) => <g>
    <text x={0} y={y + 20} className="ma-k">{title}</text>
    <text x={0} y={y + 40} className="ma-l">{Math.round(share * 100)}% of GPU time</text>
    <text x={0} y={y + 58} className="ma-l">generating or training</text>
    {segs.filter((sg) => sg.start < now && sg.start < span).map((sg, i) => (
      <rect key={i} x={sx(sg.start)} y={y + sg.gpu * rh} width={Math.max(0.5, sx(Math.min(sg.end, now, span)) - sx(sg.start))} height={rh - 0.4}
        fill={sg.kind === "idle" ? C.idle : C[sg.kind]} opacity={sg.kind === "idle" ? 0.35 : 0.9} />
    ))}
    {stepEnds.filter((e) => e <= Math.min(now, span)).map((e, i) => <g key={i}>
      <path d={`M${sx(e)} ${y - 4}V${y + 64 * rh + 2}`} stroke="#eef2f6" strokeOpacity={0.5} />
      <text x={sx(e)} y={y - 8} textAnchor="middle" className="ma-l" style={{ fill: C.ink }}>{i + 1}</text>
    </g>)}
  </g>;
  return <svg viewBox="0 0 1200 380" role="img" aria-label="All 64 GPUs over 14 minutes: the synchronous fleet idles at every barrier; the elastic fleet stays busy and completes more RL steps">
    {panel(A.segs, A.stepEnds, 26, "Synchronous", FLEET.utilA)}
    {panel(B.segs.filter((sg) => sg.start < span), B.stepEnds.filter((e) => e <= span), 206, "Elastic roles", FLEET.utilB)}
    <path d={`M${L} 362H${R}`} className="ma-axis" />
    {Array.from({ length: Math.floor(span / 2) + 1 }, (_, i) => i * 2).map((m) => <text key={m} x={sx(m)} y={376} textAnchor="middle" className="ma-l">{m} min</text>)}
    <text x={0} y={398} className="ma-l">numbered lines: an RL step completes</text>
  </svg>;
}

export const FLEET_LABELS = ["Problem / Bottleneck", "Elastic RL: the idea", "What we built", "Impact"] as const;
const idlePct = Math.round(100 * (1 - FLEET.utilA)), busyB = Math.round(100 * FLEET.utilB);
export const FLEET_ARC: { problem: ArcBeat; mechanism: ArcBeat; impact: ArcBeat; systemTitle: string; systemMs: number; labels: readonly string[]; ledger?: ArcLedger } = {
  labels: FLEET_LABELS,
  problem: {
    label: "Problem / Bottleneck", title: "Synchronous RL: every GPU waits for the slowest rollout before anyone trains", ms: PROBLEM_MS, Scene: Problem,
    meter: [[0, "Four agents, four environments: every episode is a rollout, and they differ in length"], [EXAMPLE_MS, "Each GPU writes its rollouts; answers vary a lot in length"], [EXAMPLE_MS + 3200, "Faster GPUs finish first, and then they wait"], [EXAMPLE_MS + 7200, `GPU ${SLOWEST + 1} is the slowest, so 63 GPUs wait for it`]],
    bottleneck: { at: PROBLEM_MS - 3200, headline: `64 GPUs sit idle *${idlePct}% of the time*`, effect: "One barrier per step: the slowest rollout sets the pace for all of them" },
  },
  mechanism: {
    label: "Elastic RL: the idea", title: "Elastic RL: a GPU that finishes its rollout starts training at once", ms: IDEA_MS, Scene: Idea,
    meter: [[0, "Elastic roles: a GPU that finishes its rollout trains at once"], [EXAMPLE_MS, "No barrier: each GPU keeps its identity and changes role"], [EXAMPLE_MS + 3000, "A finished GPU moves straight from writing rollouts to training"], [EXAMPLE_MS + 7000, "Weights are published to the fleet as they are ready"], [EXAMPLE_MS + 9500, "A straggler's rollout simply lands in the next step"]],
  },
  systemTitle: "What we built: 64 GPUs on one wall clock",
  systemMs: (13100 + 2600) * 2,
  ledger: { metric: "One RL step, 64 GPUs", unit: "min", baseline: FLEET.stepA, optimized: FLEET.stepB, digits: 2, baselineLabel: "Synchronous", optimizedLabel: "Elastic" },
  impact: {
    label: "Impact", title: "Almost twice the RL steps in the same wall-clock time", ms: 9000,
    meter: [[0, `${FLEET.doneA} → ${FLEET.doneB} RL steps in ${FLEET.span.toFixed(0)} minutes`], [3600, "The price: some rollouts are trained one step late"]],
    Scene: makeImpact({
      lesson: `The same 64 GPUs go from ${Math.round(100 * FLEET.utilA)}% to ${busyB}% busy, so training gets ${(FLEET.stepA / FLEET.stepB).toFixed(2)}× the RL steps per hour without one more GPU.`,
      from: FLEET.doneA, to: FLEET.doneB, unit: "RL steps", digits: 0,
      what: `RL steps completed by 64 GPUs in ${FLEET.span.toFixed(0)} minutes`,
      cause: `No GPU idles at the barrier: a finished GPU trains at once, so a step takes ${FLEET.stepB.toFixed(2)} instead of ${FLEET.stepA.toFixed(2)} minutes (${(FLEET.stepA / FLEET.stepB).toFixed(2)}×).`,
      base: "Synchronous barrier", optimized: "Elastic roles",
      cost: { what: "Cost: a straggler's rollout trains one step late (policy staleness)", to: 1, unit: "step of staleness", digits: 0 },
      Figure: Raster,
    }),
  },
};
