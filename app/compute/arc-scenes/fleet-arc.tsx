"use client";

import type React from "react";
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
const X0 = 160, SPAN = 4.4, PX = 820 / SPAN;
const x = (m: number) => X0 + m * PX;
/** Each of the first two beats opens on a worked example, then shows 8 of the 64 GPUs. */
const EXAMPLE_MS = 11000;
const PROBLEM_MS = 11500 + EXAMPLE_MS, IDEA_MS = 12500 + EXAMPLE_MS;

/* ── The worked example: four GPUs, each running one agent in its own environment, one RL step ──
   An agent's episode is its rollout: one block per step it takes in its environment. The environments
   need 3, 5, 8 and 12 steps. Synchronous RL waits at a barrier for all four, then one update trains on
   them; elastic RL lets a GPU train the moment its own rollout is in, and the slowest rollout simply
   joins the next update. Time runs on one clock: one step = UNIT seconds of the scene. */
const ENVS = [
  { name: "Maths checker", steps: 3 },
  { name: "Code sandbox", steps: 5 },
  { name: "Tool use", steps: 8 },
  { name: "Long proof", steps: 12 },
] as const;
const UNIT = 0.5, START = 0.6, HORIZON = 18;
const SYNC = { barrier: 12, update: [12, 15], publish: [15, 16] } as const;
const ELASTIC = { update: [3, 10], publish: [10, 11], late: 12 } as const;
const LX = 230, LW = 640, u = LW / HORIZON, ux = (k: number) => LX + k * u;
const LANE0 = 104, PITCH = 84, BAR = 44;
const laneY = (i: number) => LANE0 + i * PITCH;
const LANES_END = laneY(ENVS.length - 1) + BAR;
const SYNC_IDLE = Math.round((100 * ENVS.reduce((a, e) => a + (SYNC.barrier - e.steps), 0)) / (ENVS.length * SYNC.barrier));

/** A bar that grows with the clock, from k0 to k1 (in steps). */
function Grow({ k0, k1, clock, y, h = BAR, fill, stroke, dash, opacity = 1, children }: { k0: number; k1: number; clock: number; y: number; h?: number; fill?: string; stroke?: string; dash?: string; opacity?: number; children?: React.ReactNode }) {
  if (clock <= k0) return null;
  const w = Math.max(0, (Math.min(clock, k1) - k0) * u - 3);
  return <g opacity={opacity}>
    <rect x={ux(k0) + 1.5} y={y} width={w} height={h} rx={5} fill={fill ?? "none"} stroke={stroke} strokeDasharray={dash} strokeWidth={stroke ? 1.6 : undefined} />
    {clock >= k1 && children}
  </g>;
}

function EnvExample({ t, elastic: el }: { t: number; elastic: boolean }) {
  const clock = Math.max(0, Math.min(HORIZON, (t / 1000 - START) / UNIT));
  const top = LANE0 - 14, bottom = LANES_END + 14;
  const firstUpdate = el ? ELASTIC.publish[1] : SYNC.publish[1];
  const said = clock >= firstUpdate;
  return <g>
    <text x={LX} y={44} className="ma-k" style={{ fontSize: 18 }}>{el ? "The same four GPUs, elastic roles" : "Four GPUs, one agent each, one RL step"}</text>
    <text x={LX + LW} y={44} textAnchor="end" className="ma-l" style={{ fontSize: 14 }}>time →</text>
    {ENVS.map((e, i) => {
      const y = laneY(i), done = e.steps;
      return <g key={e.name}>
        <text x={0} y={y + 19} className="ma-n" style={{ fontSize: 18 }}>GPU {i + 1}</text>
        <text x={0} y={y + 40} className="ma-l" style={{ fontSize: 14 }}>{e.name} · {e.steps} steps</text>
        <rect x={LX} y={y} width={LW} height={BAR} rx={6} fill="rgba(255,255,255,.025)" />
        {/* the rollout: one block per step the agent takes in its environment */}
        {Array.from({ length: e.steps }, (_, j) => <Grow key={j} k0={j} k1={j + 1} clock={clock} y={y + 6} h={BAR - 12} fill={C.rollout} opacity={0.9} />)}
        {!el && <>
          <Grow k0={done} k1={SYNC.barrier} clock={clock} y={y + 4} h={BAR - 8} stroke={C.idle} dash="5 4">
            {(SYNC.barrier - done) * u > 70 && <text x={(ux(done) + ux(SYNC.barrier)) / 2} y={y + 28} textAnchor="middle" className="ma-l" style={{ fill: C.idle, fontSize: 15 }}>waiting</text>}
          </Grow>
          <Grow k0={SYNC.publish[1]} k1={HORIZON} clock={clock} y={y + 6} h={BAR - 12} fill={C.rollout} opacity={0.3} />
        </>}
        {el && i < 3 && <>
          <Grow k0={done} k1={ELASTIC.update[1]} clock={clock} y={y + 6} h={BAR - 12} fill={C.train} opacity={0.92}>
            {i === 0 && <text x={(ux(done) + ux(ELASTIC.update[1])) / 2} y={y + 28} textAnchor="middle" className="ma-l" style={{ fill: "#0b1016", fontSize: 15 }}>trains at once</text>}
          </Grow>
          <Grow k0={ELASTIC.publish[0]} k1={ELASTIC.publish[1]} clock={clock} y={y + 6} h={BAR - 12} fill={C.sync} />
          <Grow k0={ELASTIC.publish[1]} k1={HORIZON} clock={clock} y={y + 6} h={BAR - 12} fill={C.rollout} opacity={0.3} />
        </>}
        {el && i === 3 && <>
          <Grow k0={ELASTIC.late} k1={HORIZON} clock={clock} y={y + 6} h={BAR - 12} fill={C.train} opacity={0.55}>
            <text x={(ux(ELASTIC.late) + ux(HORIZON)) / 2} y={y + 28} textAnchor="middle" className="ma-l" style={{ fill: "#0b1016", fontSize: 15 }}>joins update 2</text>
          </Grow>
        </>}
      </g>;
    })}
    {/* synchronous: one barrier, then one update across every GPU, then the new weights */}
    {!el && clock >= SYNC.barrier && <g opacity={prog(clock, SYNC.barrier, SYNC.barrier + 0.6)}>
      <path d={`M${ux(SYNC.barrier)} ${top}V${bottom}`} stroke={C.idle} strokeWidth={2.5} />
      <text x={ux(SYNC.barrier) - 10} y={top - 10} textAnchor="end" className="ma-l" style={{ fill: C.idle, fontSize: 15 }}>barrier: the update needs all four rollouts</text>
    </g>}
    {!el && clock > SYNC.update[0] && <g>
      <rect x={ux(SYNC.update[0]) + 2} y={LANE0} width={Math.max(0, (Math.min(clock, SYNC.update[1]) - SYNC.update[0]) * u - 4)} height={LANES_END - LANE0} rx={8} fill={C.train} opacity={0.92} />
      {clock >= SYNC.update[1] - 0.4 && <>
        <text x={(ux(SYNC.update[0]) + ux(SYNC.update[1])) / 2} y={(LANE0 + LANES_END) / 2 - 6} textAnchor="middle" className="ma-n" style={{ fill: "#0b1016", fontSize: 17 }}>update</text>
        <text x={(ux(SYNC.update[0]) + ux(SYNC.update[1])) / 2} y={(LANE0 + LANES_END) / 2 + 16} textAnchor="middle" className="ma-l" style={{ fill: "#0b1016", fontSize: 13 }}>4 rollouts</text>
      </>}
    </g>}
    {!el && clock > SYNC.publish[0] && <rect x={ux(SYNC.publish[0]) + 2} y={LANE0} width={Math.max(0, (Math.min(clock, SYNC.publish[1]) - SYNC.publish[0]) * u - 4)} height={LANES_END - LANE0} rx={6} fill={C.sync} />}
    {el && clock >= 3 && <text x={ux(3)} y={top - 10} className="ma-l" style={{ fill: C.train, fontSize: 15 }} opacity={prog(clock, 3, 3.6)}>no barrier: a finished GPU starts training</text>}
    {/* the result of this example, once its first update is out */}
    <g opacity={said ? prog(clock, firstUpdate, firstUpdate + 0.8) : 0}>
      <text x={LX} y={LANES_END + 62} className="ma-n" style={{ fontSize: 30, fill: el ? "#b8e986" : C.idle }}>{el ? "0%" : `${SYNC_IDLE}%`}</text>
      <text x={LX + 70} y={LANES_END + 52} className="ma-l" style={{ fill: C.ink, fontSize: 15 }}>of GPU time spent waiting in this step</text>
      <text x={LX + 70} y={LANES_END + 72} className="ma-l" style={{ fontSize: 14 }}>{el ? `update 1 is out at step ${ELASTIC.publish[1]}, not ${SYNC.publish[1]}` : `update 1 is out at step ${SYNC.publish[1]}`}</text>
    </g>
    {/* one legend line, every item spaced so nothing touches */}
    {([["rollout step", C.rollout, false], ["waiting", C.idle, true], ["training", C.train, false], ["new weights", C.sync, false]] as const).map(([k, c, dashed], i) => (
      <g key={k} transform={`translate(${LX + i * 160} ${LANES_END + 104})`}>
        <rect width={16} height={16} rx={3} fill={dashed ? "none" : c} stroke={dashed ? c : undefined} strokeDasharray={dashed ? "3 2" : undefined} />
        <text x={24} y={13} className="ma-l" style={{ fill: C.ink, fontSize: 14 }}>{k}</text>
      </g>
    ))}
  </g>;
}

const ROLE_KEY = [["rollout", "generating a rollout"], ["train", "training"], ["sync", "publishing weights"]] as const;
/** 8 of the 64 GPUs on the lab's fleet model. Labels sit above the rows and the key on one line beneath the axis. */
function Rows({ segs, now, note }: { segs: Segment[]; now: number; note: (gpu: number) => string | null }) {
  const RY = 84, RP = 36, axisY = RY + ROWS.length * RP + 22;
  return <g>
    {ROWS.map((g, r) => {
      const y = RY + r * RP;
      return <g key={g}>
        <text x={X0 - 14} y={y + 19} textAnchor="end" className="ma-l" style={{ fontSize: 15, fill: g === SLOWEST ? C.idle : undefined }}>GPU {g + 1}</text>
        {segs.filter((sg) => sg.gpu === g && sg.start < Math.min(now, SPAN)).map((sg, i) => {
          const b = Math.min(sg.end, now, SPAN);
          const w = Math.max(0, (b - sg.start) * PX - 1.5);
          return sg.kind === "idle"
            ? <rect key={i} x={x(sg.start) + 1} y={y + 3} width={w} height={22} rx={3} fill="none" stroke={C.idle} strokeDasharray="4 3" />
            : <rect key={i} x={x(sg.start) + 1} y={y + 2} width={w} height={24} rx={3} fill={C[sg.kind]} opacity={0.88} />;
        })}
        {note(g) && now > 1 && <text x={x(SPAN) + 10} y={y + 19} className="ma-l" style={{ fontSize: 14 }} opacity={prog(now, 1, 1.6)}>{note(g)}</text>}
      </g>;
    })}
    <path d={`M${x(Math.min(now, SPAN))} ${RY - 8}V${RY + ROWS.length * RP}`} stroke="#eef2f6" strokeOpacity={0.35} />
    {[0, 1, 2, 3, 4].map((m) => <text key={m} x={x(m)} y={axisY} textAnchor="middle" className="ma-l" style={{ fontSize: 14 }}>{m} min</text>)}
    {[...ROLE_KEY, ["idle", "finished, waiting"] as const].map(([k, label], i, all) => (
      // each item starts after the one before it: its swatch, its words at 14 px mono, and a gap
      <g key={k} transform={`translate(${X0 + all.slice(0, i).reduce((w, [, l]) => w + 24 + l.length * 8.6 + 40, 0)} ${axisY + 30})`}>
        <rect width={16} height={16} rx={3} fill={k === "idle" ? "none" : C[k as "rollout" | "train" | "sync"]} stroke={k === "idle" ? C.idle : undefined} strokeDasharray={k === "idle" ? "3 2" : undefined} />
        <text x={24} y={13} className="ma-l" style={{ fill: C.ink, fontSize: 14 }}>{label}</text>
      </g>
    ))}
  </g>;
}

const sweep = (t: number, ms: number) => ease.io(prog(t, 600, ms - 2600)) * SPAN;

function Problem({ t: t0 }: SceneProps) {
  if (t0 < EXAMPLE_MS) return <svg viewBox="0 0 900 520" role="img" aria-label="Four GPUs, one agent each: the update needs every rollout, so the GPUs that finish early wait at a barrier"><EnvExample t={t0} elastic={false} /></svg>;
  const t = t0 - EXAMPLE_MS;
  const now = sweep(t, PROBLEM_MS - EXAMPLE_MS);
  const barrier = A.segs.find((sg) => sg.gpu === SLOWEST && sg.kind === "rollout" && sg.step === 0)!.end;
  return <svg viewBox="0 0 1100 470" role="img" aria-label="Synchronous RL: every GPU waits for the slowest rollout before anyone trains">
    <text x={X0} y={30} className="ma-k" style={{ fontSize: 18 }}>8 of the 64 GPUs · one RL step</text>
    <Rows segs={A.segs} now={now} note={() => null} />
    {now >= barrier && <g opacity={prog(now, barrier, barrier + 0.3)}>
      <path d={`M${x(barrier)} 66V${84 + ROWS.length * 36}`} stroke={C.idle} strokeWidth={2} />
      <text x={x(barrier) - 10} y={60} textAnchor="end" className="ma-l" style={{ fill: C.idle, fontSize: 15 }}>{GPUS - 1} GPUs wait for GPU {SLOWEST + 1}</text>
    </g>}
  </svg>;
}

function Idea({ t: t0 }: SceneProps) {
  if (t0 < EXAMPLE_MS) return <svg viewBox="0 0 900 520" role="img" aria-label="The same four GPUs with elastic roles: a GPU trains as soon as its rollout is in, and the slowest rollout joins the next update"><EnvExample t={t0} elastic /></svg>;
  const t = t0 - EXAMPLE_MS;
  const now = sweep(t, IDEA_MS - EXAMPLE_MS);
  return <svg viewBox="0 0 1100 470" role="img" aria-label="Elastic roles: each GPU joins training the moment its own rollout ends; the straggler keeps generating for the next step">
    <text x={X0} y={30} className="ma-k" style={{ fontSize: 18 }}>The same 8 GPUs, elastic roles</text>
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
    meter: [[0, "Each GPU runs one agent in its own environment; the agent's episode is its rollout"], [2600, "The environments need 3, 5, 8 and 12 steps, so the rollouts finish at different times"], [5600, "The update needs every rollout: the GPUs that finished early wait at the barrier"], [7000, "Then one update trains on all four; the new weights go to every GPU"], [EXAMPLE_MS, "The same on 8 of the 64 GPUs: rollouts vary a lot in length"], [EXAMPLE_MS + 3200, "Faster GPUs finish first, and then they wait"], [EXAMPLE_MS + 7200, `GPU ${SLOWEST + 1} is the slowest, so 63 GPUs wait for it`]],
    bottleneck: { at: PROBLEM_MS - 3200, headline: `64 GPUs sit idle *${idlePct}% of the time*`, effect: "One barrier per step: the slowest rollout sets the pace for all of them" },
  },
  mechanism: {
    label: "Elastic RL: the idea", title: "Elastic RL: a GPU that finishes its rollout starts training at once", ms: IDEA_MS, Scene: Idea,
    meter: [[0, "Elastic roles: the same four GPUs, no barrier"], [2200, "A GPU whose rollout is in starts training at once, on the rollouts already in"], [6200, "Update 1 is out at step 11, not 16; the long proof's rollout joins update 2"], [EXAMPLE_MS, "No barrier: each GPU keeps its identity and changes role"], [EXAMPLE_MS + 3000, "A finished GPU moves straight from writing rollouts to training"], [EXAMPLE_MS + 7000, "Weights are published to the fleet as they are ready"], [EXAMPLE_MS + 9500, "A straggler's rollout simply lands in the next step"]],
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
