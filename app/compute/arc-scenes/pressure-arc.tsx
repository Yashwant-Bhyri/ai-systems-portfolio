"use client";

import { simulateStream, type StreamTrace } from "../stream-continuity-model";
import { ease, prog } from "../../exhibit/engine";
import { makeImpact, type ArcBeat, type SceneProps } from "../stagecraft/module-arc";

/* Prefill / decode scheduling, as a full circle. Every block and tick is the
   lab's own stream model (four requests, 16-token budget, 24 KV pages). */
const WHOLE = simulateStream({ policy: "whole", tokenBudget: 16, capacityPages: 24 });
const CHUNKED = simulateStream({ policy: "chunked", tokenBudget: 16, capacityPages: 24 });
const C = { ov: "#3a4550", doc: "#ffc267", other: "#8fa9d9", dec: "#b8e986", red: "#ff8f86", ink: "#e9edf2", slate: "#5e6a76" };
const X0 = 190, PX = 3.9, END = 232;
const x = (ms: number) => X0 + ms * PX;

function worstGap(trace: StreamTrace) {
  const t = trace.requests[0].tokenMs;
  let best = { a: 0, b: 0 };
  for (let i = 1; i < t.length; i++) if (t[i] - t[i - 1] > best.b - best.a) best = { a: t[i - 1], b: t[i] };
  return best;
}

function Lanes({ trace, now, chunked }: { trace: StreamTrace; now: number; chunked: boolean }) {
  const gap = worstGap(trace);
  const r1 = trace.requests[0], r3 = trace.requests[2];
  const gapShown = prog(now, gap.b, gap.b + 12);
  const firstToken = r3.arrivalMs + (r3.ttftMs ?? 0);
  return (
    <g>
      {/* lane labels */}
      <text x={0} y={68} className="ma-k">GPU iterations</text>
      <text x={0} y={88} className="ma-l">one step at a time</text>
      <text x={0} y={196} className="ma-k">Request 1&rsquo;s answer</text>
      <text x={0} y={216} className="ma-l">streaming to a user</text>
      <text x={0} y={306} className="ma-k">Request 3</text>
      <text x={0} y={326} className="ma-l">a 128-token document</text>
      <path d={`M${X0} 118H${x(END)}M${X0} 240H${x(END)}M${X0} 350H${x(END)}`} className="ma-grid" />

      {/* iterations: overhead, then the work the scheduler packed into the step */}
      {trace.steps.filter((s) => s.startMs <= now).map((s) => {
        const vis = Math.min(s.endMs, now);
        const segs: [number, string][] = [[s.overheadMs, C.ov]];
        const dec = s.decode.reduce((a, d) => a + d.tokens, 0) * 1;
        const pre = s.prefill.map((p) => [p.tokens * 0.25, p.id === 3 ? C.doc : C.other] as [number, string]);
        if (chunked) segs.push([dec, C.dec], ...pre); else segs.push(...pre, [dec, C.dec]);
        let at = s.startMs;
        const docTokens = s.prefill.find((p) => p.id === 3)?.tokens;
        return (
          <g key={s.index}>
            {segs.filter(([w]) => w > 0).map(([w, col], i) => {
              const a = at; at += w;
              const right = Math.min(at, vis);
              if (right <= a) return null;
              return <rect key={i} x={x(a) + 0.5} y={52} width={Math.max(0.5, (right - a) * PX - 1)} height={62} rx={2} fill={col} opacity={col === C.ov ? 0.9 : 0.92} />;
            })}
            {docTokens && vis >= s.endMs && <text x={x((s.startMs + s.endMs) / 2)} y={44} textAnchor="middle" className="ma-l" style={{ fill: C.doc }}>{docTokens}</text>}
          </g>
        );
      })}

      {/* request 1's tokens, as they reach the user */}
      {r1.tokenMs.filter((ms) => ms <= now).map((ms) => <rect key={ms} x={x(ms) - 1.5} y={176} width={3} height={36} rx={1.5} fill={C.dec} />)}
      {gapShown > 0 && (
        <g opacity={gapShown}>
          <path d={`M${x(gap.a)} 162V154H${x(gap.b)}V162`} fill="none" stroke={chunked ? C.dec : C.red} strokeWidth={2} />
          <rect x={x(gap.a) + 2} y={178} width={(gap.b - gap.a) * PX - 4} height={32} fill={chunked ? C.dec : C.red} opacity={0.1} />
          <text x={(x(gap.a) + x(gap.b)) / 2} y={144} textAnchor="middle" className="ma-n" style={{ fill: chunked ? C.dec : C.red }}>
            {chunked ? `worst gap ${(gap.b - gap.a).toFixed(2)} ms` : `${gap.b - gap.a} ms without a token`}
          </text>
        </g>
      )}

      {/* request 3: arrives, is read, answers */}
      {now >= r3.arrivalMs && (
        <g>
          <rect x={x(r3.arrivalMs) - 9} y={282} width={18} height={24} rx={2} fill="none" stroke={C.doc} strokeWidth={1.5} />
          <path d={`M${x(r3.arrivalMs) - 5} 290h10M${x(r3.arrivalMs) - 5} 295h10M${x(r3.arrivalMs) - 5} 300h6`} stroke={C.doc} strokeWidth={1} />
          <rect x={x(r3.arrivalMs) + 14} y={288} width={Math.max(0, (Math.min(now, r3.prefillEndMs ?? 0) - r3.arrivalMs) * PX - 14)} height={12} rx={2} fill={C.doc} opacity={0.3} />
          {now >= firstToken && (
            <g>
              <path d={`M${x(firstToken)} 284l7 10-7 10-7-10z`} fill={C.doc} />
              <text x={x(firstToken) + 12} y={299} className="ma-l" style={{ fill: C.doc }}>first token · {(r3.ttftMs ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })} ms after arrival</text>
            </g>
          )}
        </g>
      )}

      {/* the shared clock */}
      <path d={`M${x(now)} 36V352`} stroke="#eef2f6" strokeOpacity={0.35} strokeWidth={1} />
      <text x={x(END)} y={378} textAnchor="end" className="ma-l">{Math.round(now)} ms</text>

      {/* legend */}
      {[["fixed step overhead", C.ov], ["the document's input", C.doc], ["other requests' input", C.other], ["answer tokens (decode)", C.dec]].map(([l, c], i) => (
        <g key={l} transform={`translate(${X0 + i * 215} 400)`}>
          <rect width={14} height={14} rx={2} fill={c} />
          <text x={22} y={12} className="ma-l">{l}</text>
        </g>
      ))}
    </g>
  );
}

const sweep = (t: number, ms: number) => ease.io(prog(t, 700, ms - 2800)) * END;

function Problem({ t }: SceneProps) {
  return <svg viewBox="0 0 1100 420" role="img" aria-label="Baseline: the whole 128-token document is read in one step, and request 1's answer stops for 56 milliseconds">
    <Lanes trace={WHOLE} now={sweep(t, PROBLEM_MS)} chunked={false} />
  </svg>;
}

function Mechanism({ t }: SceneProps) {
  const now = sweep(t, MECH_MS);
  const rule = prog(t, 200, 900);
  return <svg viewBox="0 0 1100 460" role="img" aria-label="Chunked prefill: each step decodes every live answer first, then reads at most 16 input tokens">
    <Lanes trace={CHUNKED} now={now} chunked />
    <text opacity={rule} x={X0} y={448} className="ma-k" style={{ fill: C.dec }}>The rule: each step decodes every live answer first, then reads at most 16 input tokens.</text>
  </svg>;
}

/** The two streams side by side: the result in one picture. */
function Streams({ t }: SceneProps) {
  const k = ease.out(prog(t, 600, 2600));
  const row = (trace: StreamTrace, y: number, label: string, col: string) => {
    const g = worstGap(trace);
    const sx = (ms: number) => 120 + ms * 1.9;
    return <g>
      <text x={0} y={y + 16} className="ma-l">{label}</text>
      {trace.requests[0].tokenMs.filter((ms) => ms <= k * END).map((ms) => <rect key={ms} x={sx(ms) - 1} y={y} width={2.5} height={22} fill={col} />)}
      {k >= 1 && <rect x={sx(g.a)} y={y - 3} width={(g.b - g.a) * 1.9} height={28} fill="none" stroke={col === C.dec ? C.dec : C.red} strokeWidth={1.5} rx={3} />}
    </g>;
  };
  return <svg viewBox="0 0 560 96" role="img" aria-label="Request 1's tokens under both schedulers, worst gap outlined">
    {row(WHOLE, 10, "baseline", "#9cc5f5")}
    {row(CHUNKED, 58, "chunked", C.dec)}
  </svg>;
}

const PROBLEM_MS = 11500, MECH_MS = 13500;
const gapW = worstGap(WHOLE), gapC = worstGap(CHUNKED);

export const PRESSURE_ARC: { problem: ArcBeat; mechanism: ArcBeat; impact: ArcBeat; systemTitle: string } = {
  problem: { label: "Problem", title: "A long new prompt stalls an answer that is already streaming", ms: PROBLEM_MS, Scene: Problem },
  mechanism: { label: "How it works", title: "Chunked prefill: answers first, then a small slice of the new input", ms: MECH_MS, Scene: Mechanism },
  systemTitle: "The same four requests in our serving model",
  impact: {
    label: "Impact", title: "A smoother stream, paid for with a later first token", ms: 9000,
    Scene: makeImpact({
      from: gapW.b - gapW.a, to: gapC.b - gapC.a, unit: "ms", what: "Worst pause in request 1's answer",
      cause: "Request 3's document is read 14 tokens at a time beside request 1's decoding, instead of in one 36 ms step.",
      base: "Whole prefill", optimized: "Chunked prefill",
      cost: { what: "Cost: request 3's first token arrives later", from: WHOLE.requests[2].ttftMs ?? 0, to: CHUNKED.requests[2].ttftMs ?? 0, unit: "ms" },
      Figure: Streams,
    }),
  },
};
