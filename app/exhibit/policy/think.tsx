"use client";

import { useCallback, useEffect, useRef } from "react";
import { attrs, ease, fitCanvas, fmt, lerp, prog, readTokens, rng, useSceneFrame, type Tokens } from "../engine";
import type { RoomProps } from "../shell";
import { CURVES, RL_BY_BUDGET } from "./data";
import { Surface, TaskField, VB, tileXY, type FieldHandle } from "./parts";

/* P5 · test-time compute: the GRPO weights stay frozen while each task gets 1, 2, 4, then 8 search paths. */

const LAT = { x: 40, y: 92, n: 16, cell: 13, gap: 3 };
const LSIDE = LAT.n * 16 - 3;
const F = { x: 360, y: 100, cell: 34, gap: 7 };
const PLOT = { x0: 1080, x1: 1540, y0: 420, y1: 92, cmax: 36, amin: 20, amax: 100 };
const PX = (c: number) => PLOT.x0 + (c / PLOT.cmax) * (PLOT.x1 - PLOT.x0);
const PY = (a: number) => PLOT.y0 - ((a - PLOT.amin) / (PLOT.amax - PLOT.amin)) * (PLOT.y0 - PLOT.y1);
const STAGE = [1200, 3700, 6200, 8700];
const HOLD_4X = 11200;
const stageAt = (t: number) => (t >= HOLD_4X ? 2 : STAGE.reduce((k, s, i) => (t >= s ? i : k), 0));
const angles = Array.from({ length: 96 }, (_, i) => {
  const g = rng(i * 97 + 13);
  return Array.from({ length: 8 }, () => (g() - 0.5) * 1.6);
});
const curveColour = ["--ex-ink-3", "--ex-blue", "--ex-rose", "--ex-green"];

export function PolicyThink({ active, mode, clock }: RoomProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const field = useRef<FieldHandle>(null);
  const dot = useRef<SVGCircleElement>(null);
  const seg = useRef<(SVGGElement | null)[]>([]);
  const vals = useRef<Record<string, SVGTextElement | null>>({});
  const tok = useRef<Tokens | null>(null);

  const draw = useCallback((t: number) => {
    const el = canvas.current;
    if (!el) return;
    const T = (tok.current ??= readTokens(el));
    const ctx = fitCanvas(el, VB.w, VB.h);
    const k = stageAt(t), stage = RL_BY_BUDGET[k], prev = RL_BY_BUDGET[Math.max(0, k - 1)];
    const local = t - (t >= HOLD_4X ? HOLD_4X : STAGE[k]);
    const grow = ease.out(prog(local, 0, 1300));

    // θ under glass: identical in every frame of this room
    for (let i = 0; i < LAT.n; i++) for (let j = 0; j < LAT.n; j++) {
      ctx.fillStyle = `rgba(${T.inkRgb},${(0.1 + 0.08 * Math.sin(i * 2.1 + j * 1.3)).toFixed(3)})`;
      ctx.fillRect(LAT.x + j * 16, LAT.y + i * 16, LAT.cell, LAT.cell);
    }
    ctx.strokeStyle = `rgba(${T.inkRgb},0.55)`;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(LAT.x - 8, LAT.y - 8, LSIDE + 16, LSIDE + 16);

    // a search tree in every task: paths fan out with the allowance; the verifier keeps one
    const paths = stage.budget;
    for (let i = 0; i < 96; i++) {
      const [x, y] = tileXY(i, F.x, F.y, F.cell, F.gap);
      const ox = x + F.cell / 2, oy = y + F.cell - 4;
      const solvedNow = stage.solved[i];
      for (let p = 0; p < paths; p++) {
        const born = p < prev.budget ? 1 : grow;
        if (born <= 0) continue;
        const a = angles[i][p], len = (F.cell - 10) * born;
        const winner = solvedNow && p === (i % paths);
        ctx.strokeStyle = winner ? `rgba(${T.roseRgb},0.95)` : `rgba(${T.inkRgb},${(0.16 + 0.1 * born).toFixed(3)})`;
        ctx.lineWidth = winner ? 1.8 : 1;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.quadraticCurveTo(ox + a * 6, oy - len * 0.55, ox + a * 11, oy - len);
        ctx.stroke();
      }
    }
    const newly = (i: number) => stage.solved[i] && !prev.solved[i];
    field.current?.paint(
      (i) => (newly(i) && grow > i / 96 ? "gained" : (stage.solved[i] && !newly(i)) || (newly(i) && grow > i / 96) ? "on" : "off"),
      T, T.rose, () => prog(local, 1300, 2300), 0.16,
    );

    // operating point on the GRPO cost-accuracy curve
    const c = ease.out(prog(local, 0, 1300));
    const cost = lerp(prev.costPerTask, stage.costPerTask, k && t < HOLD_4X ? c : 1), acc = lerp(prev.pass1, stage.pass1, k && t < HOLD_4X ? c : 1);
    attrs(dot.current, { cx: PX(cost), cy: PY(acc) });
    seg.current.forEach((g, i) => attrs(g, { opacity: i === k ? 1 : 0.38 }));
    const set = (key: string, s: string) => { const e = vals.current[key]; if (e && e.textContent !== s) e.textContent = s; };
    set("budget", `${stage.budget}×`);
    set("solved", `${Math.round(lerp(prev.correct, stage.correct, k && t < HOLD_4X ? c : 1))} / 96`);
    set("pass", `${fmt(acc, 1)}%`);
    set("cost", fmt(cost));
    set("tok", Math.round(lerp(prev.tokensPerTask, stage.tokensPerTask, k && t < HOLD_4X ? c : 1)).toLocaleString("en-US"));
  }, []);
  useSceneFrame(active, clock.readTime, draw);
  useEffect(() => { tok.current = null; }, [mode]);

  return (
    <Surface ref={canvas} label="With the weights frozen, more search paths per task raise the solved count from 55 to 82 while cost per task rises">
      <text x={LAT.x} y={LAT.y - 30} className="ex-m">θ · GRPO · FROZEN</text>
      <g transform={`translate(${LAT.x + LSIDE / 2} ${LAT.y + LSIDE + 44})`}>
        <rect x={-14} y={-12} width={28} height={22} rx={4} fill="none" stroke="var(--ex-ink-2)" strokeWidth={1.6} />
        <path d="M-8 -12V-18a8 8 0 0 1 16 0V-12" fill="none" stroke="var(--ex-ink-2)" strokeWidth={1.6} />
        <text y={44} className="ex-ann" textAnchor="middle">no weight update</text>
      </g>
      <text x={F.x} y={F.y - 46} className="ex-m">SEARCH PER TASK · VERIFIER-SELECTED</text>
      <TaskField ref={field} x={F.x} y={F.y} cell={F.cell} gap={F.gap} />
      <g transform={`translate(${F.x} 490)`}>
        <text className="ex-m">ALLOWANCE</text>
        {RL_BY_BUDGET.map((b, i) => (
          <g key={b.budget} ref={(e) => { seg.current[i] = e; }} transform={`translate(${i * 78} 14)`}>
            <rect width={70} height={34} rx={6} fill="none" stroke="var(--ex-rose)" />
            <text x={35} y={23} className="ex-m-ink" textAnchor="middle">{b.budget}×</text>
          </g>
        ))}
        <text x={360} className="ex-m">SOLVED</text>
        <text ref={(e) => { vals.current.solved = e; }} x={360} y={42} className="ex-num-l" />
        <text x={540} className="ex-m">PASS@1</text>
        <text ref={(e) => { vals.current.pass = e; }} x={540} y={42} className="ex-num-l" style={{ fill: "var(--ex-rose)" }} />
        <text y={104} className="ex-m">GPU-S / TASK</text>
        <text ref={(e) => { vals.current.cost = e; }} y={138} className="ex-num-l" style={{ fontSize: 26 }} />
        <text x={180} y={104} className="ex-m">TOKENS / TASK</text>
        <text ref={(e) => { vals.current.tok = e; }} x={180} y={138} className="ex-num-l" style={{ fontSize: 26 }} />
        <text ref={(e) => { vals.current.budget = e; }} x={0} y={0} opacity={0} />
      </g>
      <text x={PLOT.x0} y={PLOT.y1 - 30} className="ex-m">PASS@1 vs GPU-S / TASK · 1× 2× 4× 8×</text>
      <path d={`M${PLOT.x0} ${PLOT.y1}V${PLOT.y0}H${PLOT.x1}`} fill="none" stroke="var(--ex-line-2)" />
      {[40, 60, 80, 100].map((a) => (
        <g key={a}><path d={`M${PLOT.x0} ${PY(a)}H${PLOT.x1}`} stroke="var(--ex-line)" /><text x={PLOT.x0 - 10} y={PY(a) + 5} className="ex-ann" textAnchor="end">{a}%</text></g>
      ))}
      {[0, 10, 20, 30].map((c) => <text key={c} x={PX(c)} y={PLOT.y0 + 24} className="ex-ann" textAnchor="middle">{c}</text>)}
      {CURVES.map((curve, p) => (
        <g key={p} opacity={p === 2 ? 1 : 0.45}>
          <path d={curve.map((pt, i) => `${i ? "L" : "M"}${PX(pt.costPerTask)} ${PY(pt.pass1)}`).join("")} fill="none" stroke={`var(${curveColour[p]})`} strokeWidth={p === 2 ? 2.4 : 1.4} />
          {curve.map((pt) => <circle key={pt.budget} cx={PX(pt.costPerTask)} cy={PY(pt.pass1)} r={p === 2 ? 4.5 : 3} fill={`var(${curveColour[p]})`} />)}
        </g>
      ))}
      <circle ref={dot} r={10} fill="none" stroke="var(--ex-rose)" strokeWidth={2.4} />
      <g transform={`translate(${PLOT.x0} ${PLOT.y0 + 60})`}>
        {["base", "SFT", "GRPO", "lean RL"].map((n, i) => (
          <g key={n} transform={`translate(${i * 112} 0)`}><rect y={-10} width={18} height={3} fill={`var(${curveColour[i]})`} /><text x={26} className="ex-m">{n}</text></g>
        ))}
      </g>
      {mode === "dev" && (
        <g>
          <text x={PLOT.x0} y={PLOT.y0 + 100} className="ex-eq">best-of-N · unit-test / exact-match verifier</text>
          <text x={PLOT.x0} y={PLOT.y0 + 124} className="ex-eq">cost ∝ sampled tokens · θ fixed across 1×–8×</text>
        </g>
      )}
    </Surface>
  );
}
