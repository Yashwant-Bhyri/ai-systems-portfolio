"use client";

import { ANSWER_STREAMS, overlapStudy, type OverlapLane } from "../scheduling-overlap-model";
import { ease, prog } from "../../exhibit/engine";
import { makeImpact, type ArcBeat, type ArcLedger, type SceneProps } from "../stagecraft/module-arc";

/* CPU/GPU overlap, as a full circle. Every interval is the lab's overlap model
   (balanced host: prepare 3 ms, GPU step 8 ms, deliver 2 ms; four decode steps). */
const S = overlapStudy("balanced", 4), SLOW = overlapStudy("host-bound", 4), NONE = overlapStudy("negligible", 4);
const C = { prep: "#8fb4ff", gpu: "#b8e986", send: "#63d4df", idle: "#ff8f86", ink: "#eef2f6" };
const X0 = 200, END = S.baseline.finish, PX = (1040 - X0) / END;
const x = (ms: number) => X0 + ms * PX;
const PROBLEM_MS = 11000, MECH_MS = 12500;
const HOST_MAX = Math.max(S.baseline.finish, SLOW.baseline.finish, NONE.baseline.finish);

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
      <rect key={i} data-focus-spot x={x(g.start) + 1} y={212} width={Math.max(0, (Math.min(g.end, now) - g.start) * PX - 2)} height={40} rx={3} fill="none" stroke={C.idle} strokeDasharray="4 3" strokeWidth={1.5} />
    ))}
    {lane.steps.map((s) => now >= s.deliver.end && (
      <text key={s.index} x={x(s.deliver.end)} y={334} textAnchor="middle" className="ma-word" style={{ fill: C.ink }}>{words[s.index]}</text>
    ))}
    <path d={`M${x(now)} 96V350`} stroke="#eef2f6" strokeOpacity={0.35} />
    <text x={x(END)} y={380} textAnchor="end" className="ma-l">{Math.round(now)} ms</text>
    <g transform="translate(860 40)" data-focus-spot>
      <text x={0} y={0} className="ma-l">GPU idle so far</text>
      <text x={0} y={36} className="ma-big" style={{ fill: idleSoFar > 6 ? C.idle : C.gpu }}>{Math.round(idleSoFar)}<tspan className="ma-l" dx={8}>ms</tspan></text>
    </g>
    {/* overlapped: the space the baseline still needed is the saving, so mark it */}
    {overlapped && now >= lane.finish - 0.05 && (
      <g>
        <path d={`M${x(S.baseline.finish)} 96V350`} stroke={C.idle} strokeOpacity={0.55} strokeDasharray="4 4" />
        <text x={x(S.baseline.finish) - 8} y={300} textAnchor="end" className="ma-l" style={{ fill: C.idle }}>baseline finished here · {S.baseline.finish} ms</text>
        <path d={`M${x(lane.finish)} 224V214H${x(S.baseline.finish)}V224`} fill="none" stroke={C.gpu} strokeWidth={2} />
        <text x={(x(lane.finish) + x(S.baseline.finish)) / 2} y={248} textAnchor="middle" className="ma-n" style={{ fill: C.gpu }}>{S.baseline.finish - lane.finish} ms sooner</text>
      </g>
    )}
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
  return <svg viewBox="0 0 1100 430" role="img" aria-label={`Baseline: the CPU prepares and delivers each step while the GPU waits; ${S.baseline.gpuIdle} of ${S.baseline.finish} milliseconds idle`}>
    <Lanes lane={S.baseline} now={sweep(t, PROBLEM_MS, END)} overlapped={false} />
  </svg>;
}
function Mechanism({ t }: SceneProps) {
  return <svg viewBox="0 0 1100 430" role="img" aria-label="Overlapped: the CPU prepares step n+1 while the GPU runs step n; the GPU steps run back to back">
    <Lanes lane={S.overlapped} now={sweep(t, MECH_MS, S.overlapped.finish)} overlapped />
  </svg>;
}

/** The result: the GPU's own lane, in series and overlapped, on three hosts. Busy is green, waiting is red. */
function Hosts({ t }: SceneProps) {
  const k = ease.io(prog(t, 300, 3400));
  const L = 230, R = 1100, span = HOST_MAX, sx = (ms: number) => L + (ms / span) * (R - L), now = k * span;
  const gpuLane = (lane: OverlapLane, y: number, label: string) => {
    const busy = lane.steps.map((st) => st.gpu);
    const idle = lane.gaps.concat(lane.steps[0].gpu.start > 0 ? [{ start: 0, end: lane.steps[0].gpu.start }] : [], [{ start: lane.steps.at(-1)!.gpu.end, end: lane.finish }]).filter((g) => g.end > g.start);
    return <g>
      <text x={L - 12} y={y + 15} textAnchor="end" className="ma-l">{label}</text>
      {busy.filter((g) => g.start < now).map((g, i) => <rect key={`b${i}`} x={sx(g.start) + 0.5} y={y} width={Math.max(0, sx(Math.min(g.end, now)) - sx(g.start) - 1)} height={20} rx={2} fill={C.gpu} opacity={0.88} />)}
      {idle.filter((g) => g.start < now).map((g, i) => <rect key={`i${i}`} x={sx(g.start) + 0.5} y={y + 1} width={Math.max(0, sx(Math.min(g.end, now)) - sx(g.start) - 1)} height={18} rx={2} fill="none" stroke={C.idle} strokeDasharray="3 2" />)}
      {now >= lane.finish && <text x={sx(lane.finish) + 8} y={y + 15} className="ma-l" style={{ fill: C.ink }}>{lane.finish} ms</text>}
    </g>;
  };
  const hosts: [string, string, typeof S][] = [["Balanced host", "modern engine: 1.5 ms prepare, 1 ms deliver", S], ["Slower CPU", "Python scheduler: 4 ms prepare, 2 ms deliver", SLOW], ["No CPU overhead", "nothing to hide", NONE]];
  return <svg viewBox="0 0 1200 380" role="img" aria-label="The GPU lane for four decode steps, in series and overlapped, on three hosts">
    <text x={0} y={22} className="ma-l">the GPU&rsquo;s lane for the same four decode steps · green busy, red waiting on the CPU</text>
    {hosts.map(([name, note, st], i) => <g key={name} transform={`translate(0 ${48 + i * 108})`}>
      <text x={0} y={18} className="ma-k">{name}</text>
      {gpuLane(st.baseline, 4, "in series")}
      {gpuLane(st.overlapped, 32, "overlapped")}
      <text x={L} y={76} className="ma-l">{note}</text>
      {now >= st.baseline.finish && <text x={R + 4} y={60} textAnchor="end" className="ma-n" style={{ fill: st.savedElapsed > 0 ? C.gpu : "#8794a1" }}>{st.savedElapsed > 0 ? `−${st.savedElapsed} ms` : "no gain"}</text>}
    </g>)}
  </svg>;
}

export const OVERLAP_ARC: { problem: ArcBeat; mechanism: ArcBeat; impact: ArcBeat; systemTitle: string; ledger?: ArcLedger } = {
  problem: {
    label: "Problem / Bottleneck", title: "The GPU waits while the CPU prepares each step and hands back its token", ms: PROBLEM_MS, Scene: Problem,
    meter: [[0, "CPU prepares step 1 while the GPU waits"], [1500, "GPU runs step 1"], [3200, "CPU delivers the token, then prepares step 2: the GPU waits again"]],
    bottleneck: { at: PROBLEM_MS - 3000, headline: `The GPU sits idle ${S.baseline.gpuIdle} of every ${S.baseline.finish} ms, waiting for the CPU`, effect: `each decode step pays ${S.inputs.prepare + S.inputs.deliver} ms of host work in series, so an expensive GPU loses throughput to CPU bookkeeping` },
  },
  mechanism: {
    label: "Optimized solution", title: "Optimized solution, overlap: the CPU prepares step n+1 while the GPU is still running step n", ms: MECH_MS, Scene: Mechanism,
    meter: [[0, "CPU prepares step 2 while the GPU runs step 1"], [3000, "The GPU moves straight from step to step"], [MECH_MS - 2800, `Four steps finish in ${S.overlapped.finish} ms instead of ${S.baseline.finish} ms`]],
  },
  ledger: { metric: "Four decode steps, two answer streams", unit: "ms", baseline: S.baseline.finish, optimized: S.overlapped.finish, digits: 1, baselineLabel: "In series", optimizedLabel: "Overlapped" },
  systemTitle: "Two answer streams on our serving clock",
  impact: {
    label: "Impact", title: "The same GPU work, finished sooner", ms: 9000,
    meter: [[0, `Four decode steps: ${S.baseline.finish} → ${S.overlapped.finish} ms`], [3600, "The gain tracks host cost: no CPU overhead means nothing to hide"]],
    Scene: makeImpact({
      lesson: `The GPU does exactly the same work but waits ${S.baseline.gpuIdle - S.overlapped.gpuIdle} ms less, so each token is ${Math.round((100 * S.savedElapsed) / S.baseline.finish)}% cheaper in time. The slower the host, the bigger the gain.`,
      from: S.baseline.finish, to: S.overlapped.finish, unit: "ms", digits: 1,
      what: "Four decode steps for two answer streams",
      cause: `The CPU's ${S.inputs.prepare} ms of preparation and ${S.inputs.deliver} ms of delivery now hide under the GPU's ${S.inputs.gpu} ms step; GPU idle time falls from ${S.baseline.gpuIdle} to ${S.overlapped.gpuIdle} ms.`,
      base: "CPU and GPU in series", optimized: "Overlapped",
      Figure: Hosts,
    }),
  },
};
