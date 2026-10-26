"use client";

import { FLEET, GPUS, colocated, elastic, type Segment } from "../../exhibit/policy/fleet-model";
import { ease, prog } from "../../exhibit/engine";
import { makeImpact, type ArcBeat, type SceneProps } from "../stagecraft/module-arc";

/* Elastic RL on 64 GPUs, as a full circle: the barrier problem, QwenGyre's idea
   (arXiv 2609.33848: a device keeps its identity while its role changes), what
   we built on that idea, and the result. Every segment is the lab's fleet model. */
const C = { rollout: "#f3a0bc", train: "#ffc267", sync: "#63d4df", idle: "#ff8f86", ink: "#eef2f6" };
const A = colocated(), B = elastic();
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

/** Where the fleet's time goes, on one wall clock. */
function Busy({ t }: SceneProps) {
  const k = ease.out(prog(t, 500, 2200));
  const rows: [string, number, string][] = [["synchronous", FLEET.utilA, "#9cc5f5"], ["elastic", FLEET.utilB, "#b8e986"]];
  return <svg viewBox="0 0 560 120" role="img" aria-label="Share of GPU time spent generating or training">
    <text x={0} y={14} className="ma-l">GPU time spent generating or training</text>
    {rows.map(([l, v, c], i) => <g key={l} transform={`translate(0 ${34 + i * 36})`}>
      <text x={0} y={15} className="ma-l">{l}</text>
      <rect x={130} y={0} width={300} height={20} rx={3} fill="rgba(255,255,255,.04)" />
      <rect x={130} y={0} width={300 * v * k} height={20} rx={3} fill={c} opacity={0.88} />
      <text x={560} y={15} textAnchor="end" className="ma-l" style={{ fill: C.ink }}>{Math.round(v * 100)}%</text>
    </g>)}
  </svg>;
}

export const FLEET_LABELS = ["Problem", "The QwenGyre idea", "What we built", "Impact"] as const;
export const FLEET_ARC: { problem: ArcBeat; mechanism: ArcBeat; impact: ArcBeat; systemTitle: string; systemMs: number; labels: readonly string[] } = {
  labels: FLEET_LABELS,
  problem: { label: "Problem", title: "Synchronous RL: every GPU waits for the slowest rollout before anyone trains", ms: PROBLEM_MS, Scene: Problem },
  mechanism: { label: "The QwenGyre idea", title: "Each GPU keeps its identity and changes role the moment its own rollout ends", ms: IDEA_MS, Scene: Idea },
  systemTitle: "What we built: 64 GPUs on one wall clock",
  systemMs: (13100 + 2600) * 2,
  impact: {
    label: "Impact", title: "Almost twice the RL steps in the same wall-clock time", ms: 9000,
    Scene: makeImpact({
      from: FLEET.doneA, to: FLEET.doneB, unit: "RL steps", digits: 0,
      what: `RL steps completed by 64 GPUs in ${FLEET.span.toFixed(0)} minutes`,
      cause: `No GPU idles at the barrier: a finished GPU trains at once, so a step takes ${FLEET.stepB.toFixed(2)} instead of ${FLEET.stepA.toFixed(2)} minutes (${(FLEET.stepA / FLEET.stepB).toFixed(2)}×).`,
      base: "Synchronous barrier", optimized: "Elastic roles",
      cost: { what: "Cost: a straggler's rollout trains one step late (policy staleness)", from: 0, to: 1, unit: "step", digits: 0 },
      Figure: Busy,
    }),
  },
};
