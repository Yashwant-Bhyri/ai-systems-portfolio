"use client";

import { ANSWER_STREAMS, overlapStudy, type OverlapLane } from "../scheduling-overlap-model";
import { ease, prog } from "../../exhibit/engine";
import { makeImpact, type ArcBeat, type SceneProps } from "../stagecraft/module-arc";

/* CPU/GPU overlap, as a full circle. Every interval is the lab's overlap model
   (balanced host: prepare 3 ms, GPU step 8 ms, deliver 2 ms; four decode steps). */
const S = overlapStudy("balanced", 4), SLOW = overlapStudy("host-bound", 4), NONE = overlapStudy("negligible", 4);
const C = { prep: "#8fb4ff", gpu: "#b8e986", send: "#63d4df", idle: "#ff8f86", ink: "#eef2f6" };
const X0 = 200, PX = 16, END = S.baseline.finish;
const x = (ms: number) => X0 + ms * PX;
const PROBLEM_MS = 11000, MECH_MS = 12500;

function Lanes({ lane, now, overlapped }: { lane: OverlapLane; now: number; overlapped: boolean }) {
  const block = (a: number, b: number, y: number, col: string, label: string, key: string) => {
    const r = Math.min(b, now);
    if (r <= a) return null;
    return <g key={key}>
      <rect x={x(a) + 1} y={y} width={Math.max(0, (r - a) * PX - 2)} height={44} rx={4} fill={col} opacity={0.88} />
      {r >= b && (b - a) * PX >= 24 && <text x={(x(a) + x(b)) / 2} y={y + 28} textAnchor="middle" className="ma-l" style={{ fill: "#0b1016" }}>{(b - a) * PX >= 72 ? label : label.split(" ")[1]}</text>}
    </g>;
  };
  const idle = lane.gaps.concat(lane.steps[0].gpu.start > 0 ? [{ start: 0, end: lane.steps[0].gpu.start }] : [], [{ start: lane.steps.at(-1)!.gpu.end, end: lane.finish }]);
  const idleSoFar = idle.reduce((a, g) => a + Math.max(0, Math.min(g.end, now) - g.start), 0);
  const words = ANSWER_STREAMS[0].words;
  return <g>
    <text x={0} y={128} className="ma-k">CPU</text>
    <text x={0} y={148} className="ma-l">prepares · delivers</text>
    <text x={0} y={228} className="ma-k">GPU</text>
    <text x={0} y={248} className="ma-l">runs the model</text>
    <text x={0} y={330} className="ma-k">The user sees</text>
    <path d={`M${X0} 166H${x(END)}M${X0} 266H${x(END)}`} className="ma-grid" />
    {lane.steps.map((s) => [
      block(s.prepare.start, s.prepare.end, 110, C.prep, `prep ${s.index + 1}`, `p${s.index}`),
      block(s.gpu.start, s.gpu.end, 210, C.gpu, `step ${s.index + 1}`, `g${s.index}`),
      block(s.deliver.start, s.deliver.end, 110, C.send, `send ${s.index + 1}`, `d${s.index}`),
    ])}
    {idle.filter((g) => g.end > g.start && now > g.start).map((g, i) => (
      <rect key={i} x={x(g.start) + 1} y={212} width={Math.max(0, (Math.min(g.end, now) - g.start) * PX - 2)} height={40} rx={3} fill="none" stroke={C.idle} strokeDasharray="4 3" strokeWidth={1.5} />
    ))}
    {lane.steps.map((s) => now >= s.deliver.end && (
      <text key={s.index} x={x(s.deliver.end)} y={334} textAnchor="middle" className="ma-word" style={{ fill: C.ink }}>{words[s.index]}</text>
    ))}
    <path d={`M${x(now)} 96V350`} stroke="#eef2f6" strokeOpacity={0.35} />
    <text x={x(END)} y={380} textAnchor="end" className="ma-l">{Math.round(now)} ms</text>
    <g transform="translate(860 40)">
      <text x={0} y={0} className="ma-l">GPU idle so far</text>
      <text x={0} y={36} className="ma-big" style={{ fill: idleSoFar > 6 ? C.idle : C.gpu }}>{Math.round(idleSoFar)}<tspan className="ma-l" dx={8}>ms</tspan></text>
    </g>
    {overlapped && lane.steps.slice(0, -1).map((s, i) => now >= lane.steps[i + 1].prepare.end && (
      <path key={i} d={`M${x(lane.steps[i + 1].prepare.end)} 156C${x(lane.steps[i + 1].prepare.end)} 190 ${x(s.gpu.end)} 180 ${x(s.gpu.end)} 208`} fill="none" stroke={C.prep} strokeOpacity={0.6} strokeWidth={1.3} />
    ))}
    {[["prepare the next step", C.prep], ["GPU decode step", C.gpu], ["deliver the token", C.send], ["GPU waiting", C.idle]].map(([l, c], i) => (
      <g key={l} transform={`translate(${X0 + i * 200} 412)`}>
        <rect width={14} height={14} rx={2} fill={i === 3 ? "none" : c} stroke={i === 3 ? c : "none"} strokeDasharray="3 2" />
        <text x={22} y={12} className="ma-l">{l}</text>
      </g>
    ))}
  </g>;
}

const sweep = (t: number, ms: number, end: number) => ease.io(prog(t, 600, ms - 2600)) * end;

function Problem({ t }: SceneProps) {
  return <svg viewBox="0 0 1100 430" role="img" aria-label="Baseline: the CPU prepares and delivers each step while the GPU waits; 20 of 52 milliseconds idle">
    <Lanes lane={S.baseline} now={sweep(t, PROBLEM_MS, END)} overlapped={false} />
  </svg>;
}
function Mechanism({ t }: SceneProps) {
  return <svg viewBox="0 0 1100 430" role="img" aria-label="Overlapped: the CPU prepares step n+1 while the GPU runs step n; the GPU steps run back to back">
    <Lanes lane={S.overlapped} now={sweep(t, MECH_MS, S.overlapped.finish)} overlapped />
  </svg>;
}

/** The same four steps on three hosts: the gain is the CPU time it can hide. */
function Hosts({ t }: SceneProps) {
  const k = ease.out(prog(t, 500, 2200));
  const rows: [string, number, number][] = [["balanced host", S.baseline.finish, S.overlapped.finish], ["slower CPU", SLOW.baseline.finish, SLOW.overlapped.finish], ["no CPU overhead", NONE.baseline.finish, NONE.overlapped.finish]];
  return <svg viewBox="0 0 560 150" role="img" aria-label="Elapsed time for four decode steps, before and after overlap, on three hosts">
    <text x={0} y={14} className="ma-l">four decode steps, ms: in series → overlapped</text>
    {rows.map(([label, a, b], i) => (
      <g key={label} transform={`translate(0 ${34 + i * 38})`}>
        <text x={0} y={16} className="ma-l">{label}</text>
        <rect x={150} y={0} width={(a / 90) * 300 * k} height={9} rx={2} fill="#9cc5f5" opacity={0.8} />
        <rect x={150} y={11} width={(b / 90) * 300 * k} height={9} rx={2} fill={C.gpu} opacity={0.9} />
        <text x={470} y={16} className="ma-l" style={{ fill: C.ink }}>{a} → {b}</text>
      </g>
    ))}
  </svg>;
}

export const OVERLAP_ARC: { problem: ArcBeat; mechanism: ArcBeat; impact: ArcBeat; systemTitle: string } = {
  problem: { label: "Problem", title: "The GPU waits while the CPU prepares each step and hands back its token", ms: PROBLEM_MS, Scene: Problem },
  mechanism: { label: "How it works", title: "Overlap: the CPU prepares step n+1 while the GPU is still running step n", ms: MECH_MS, Scene: Mechanism },
  systemTitle: "Two answer streams on our serving clock",
  impact: {
    label: "Impact", title: "The same GPU work, finished sooner", ms: 9000,
    Scene: makeImpact({
      from: S.baseline.finish, to: S.overlapped.finish, unit: "ms", digits: 0,
      what: "Four decode steps for two answer streams",
      cause: `The CPU's ${S.inputs.prepare} ms of preparation and ${S.inputs.deliver} ms of delivery now hide under the GPU's ${S.inputs.gpu} ms step; GPU idle time falls from ${S.baseline.gpuIdle} to ${S.overlapped.gpuIdle} ms.`,
      base: "CPU and GPU in series", optimized: "Overlapped",
      Figure: Hosts,
    }),
  },
};
