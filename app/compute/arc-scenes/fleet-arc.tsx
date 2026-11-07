"use client";

import { FLEET, GPUS, colocated, elastic, type Segment } from "../../exhibit/policy/fleet-model";
import { ease, prog } from "../../exhibit/engine";
import { makeImpact, type ArcBeat, type ArcLedger, type SceneProps } from "../stagecraft/module-arc";

/* Elastic RL on 64 GPUs, as a full circle: the barrier problem, QwenGyre's idea
   (arXiv 2609.33848: a device keeps its identity while its role changes), what
   we built on that idea, and the result. Every segment is the lab's fleet model. */
const C = { rollout: "#f3a0bc", train: "#ffc267", sync: "#63d4df", idle: "#ff8f86", ink: "#eef2f6" };
const A = colocated(), B = elastic(9);
/** Eight of the 64 GPUs, including the slowest rollout of the first step. */
const SLOWEST = A.segs.filter((s) => s.step === 0 && s.kind === "rollout").reduce((a, b) => (b.end > a.end ? b : a)).gpu;
const ROWS = [0, 1, 2, 3, 4, 5, 6, SLOWEST];
const X0 = 230, SPAN = 4.4, PX = 660 / SPAN;
const x = (m: number) => X0 + m * PX;
const PROBLEM_MS = 11500, IDEA_MS = 12500;

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
    {(["rollout", "train", "sync"] as const).map((k, i) => <g key={k} transform={`translate(${X0 + i * 215} 418)`}><rect width={14} height={14} rx={2} fill={C[k]} /><text x={22} y={12} className="ma-l">{k === "rollout" ? "generating rollouts" : k === "train" ? "training" : "publishing weights"}</text></g>)}
    <g transform={`translate(${X0 + 3 * 215} 418)`}><rect width={14} height={14} rx={2} fill="none" stroke={C.idle} strokeDasharray="3 2" /><text x={22} y={12} className="ma-l">waiting</text></g>
  </g>;
}

const sweep = (t: number, ms: number) => ease.io(prog(t, 600, ms - 2600)) * SPAN;

function Problem({ t }: SceneProps) {
  const now = sweep(t, PROBLEM_MS);
  const barrier = A.segs.find((s) => s.gpu === SLOWEST && s.kind === "rollout" && s.step === 0)!.end;
  return <svg viewBox="0 0 1100 440" role="img" aria-label="Synchronous RL: every GPU waits for the slowest rollout before anyone trains">
    <text x={0} y={30} className="ma-k">8 of 64 GPUs · one RL step</text>
    <Rows segs={A.segs} now={now} note={() => null} />
    {now >= barrier && <g opacity={prog(now, barrier, barrier + 0.3)}>
      <path d={`M${x(barrier)} 56V${70 + ROWS.length * 38}`} stroke={C.idle} strokeWidth={2} />
      <text x={x(barrier) - 8} y={48} textAnchor="end" className="ma-n" style={{ fill: C.idle }}>{GPUS - 1} GPUs wait for GPU {SLOWEST + 1}</text>
    </g>}
  </svg>;
}

function Idea({ t }: SceneProps) {
  const now = sweep(t, IDEA_MS);
  return <svg viewBox="0 0 1100 440" role="img" aria-label="Elastic roles: each GPU joins training the moment its own rollout ends; the straggler keeps generating for the next step">
    <text x={0} y={30} className="ma-k">The same 8 GPUs, elastic roles</text>
    <text x={0} y={52} className="ma-l">after QwenGyre · arXiv 2609.33848</text>
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
    <text x={0} y={376} className="ma-l">numbered lines: an RL step completes</text>
  </svg>;
}

export const FLEET_LABELS = ["Problem / Bottleneck", "Elastic RL: the idea", "What we built", "Impact"] as const;
const idlePct = Math.round(100 * (1 - FLEET.utilA)), busyB = Math.round(100 * FLEET.utilB);
export const FLEET_ARC: { problem: ArcBeat; mechanism: ArcBeat; impact: ArcBeat; systemTitle: string; systemMs: number; labels: readonly string[]; ledger?: ArcLedger } = {
  labels: FLEET_LABELS,
  problem: {
    label: "Problem / Bottleneck", title: "Synchronous RL: every GPU waits for the slowest rollout before anyone trains", ms: PROBLEM_MS, Scene: Problem,
    meter: [[0, "Each GPU writes its rollouts; answers vary a lot in length"], [3200, "Faster GPUs finish first, and then they wait"], [7200, `GPU ${SLOWEST + 1} is the slowest, so 63 GPUs wait for it`]],
    bottleneck: { at: PROBLEM_MS - 3200, headline: `RL is sequential at the fleet level: 64 GPUs sit idle ${idlePct}% of the time`, effect: "one barrier per step means the slowest rollout sets the pace for every GPU, and that gets worse as the fleet grows" },
  },
  mechanism: {
    label: "Elastic RL: the idea", title: "Elastic RL, after QwenGyre (arXiv 2609.33848): a GPU that finishes its rollout starts training at once", ms: IDEA_MS, Scene: Idea,
    meter: [[0, "No barrier: each GPU keeps its identity and changes role"], [3000, "A finished GPU moves straight from writing rollouts to training"], [7000, "Weights are published to the fleet as they are ready"], [9500, "A straggler's rollout simply lands in the next step"]],
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
