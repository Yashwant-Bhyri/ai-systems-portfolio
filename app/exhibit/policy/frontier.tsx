"use client";

import { useCallback, useRef } from "react";
import { attrs, ease, lerp, prog, useSceneFrame } from "../engine";
import type { RoomProps } from "../shell";
import { CONSTELLATION, FRONTIER, FRONTIER_COST, f2 } from "./data";
import { Surface, TALL_W, VB } from "./parts";
import { useTr } from "../i18n";

/* P8 · pass@1 against GPU-seconds per correct answer: training moves points up, the runtime moves them left. */

const WIDE = { vb: VB, p: { x0: 150, x1: 1150, y0: 620, y1: 70 }, head: [1230, 130] as const, axis: "GPU-SECONDS PER CORRECT ANSWER ← CHEAPER" };
const TALL = { vb: { w: TALL_W, h: 1000 }, p: { x0: 84, x1: 570, y0: 560, y1: 90 }, head: [24, 680] as const, axis: "GPU-S / CORRECT" };
const CMAX = FRONTIER_COST.axisMax, AMIN = 20, AMAX = 100;
const STEP = 1000, T_PATH = 1200, T_SHIFT = 6900, T_RING = 9200;
const last = FRONTIER[FRONTIER.length - 1], first = FRONTIER[0];

export function PolicyFrontier({ active, mode, clock, tall }: RoomProps) {
  const L = tall ? TALL : WIDE, P = L.p;
  const tr = useTr();
  const X = useCallback((c: number) => P.x0 + (c / CMAX) * (P.x1 - P.x0), [P]);
  const Y = useCallback((a: number) => P.y0 - ((a - AMIN) / (AMAX - AMIN)) * (P.y0 - P.y1), [P]);
  const trail = useRef<SVGPathElement>(null);
  const dots = useRef<(SVGCircleElement | null)[]>([]);
  const fast = useRef<(SVGCircleElement | null)[]>([]);
  const shifts = useRef<(SVGPathElement | null)[]>([]);
  const labels = useRef<(SVGTextElement | null)[]>([]);
  const ring = useRef<SVGCircleElement>(null);
  const head = useRef<SVGGElement>(null);
  const field = useRef<SVGGElement>(null);

  const draw = useCallback((t: number) => {
    attrs(field.current, { opacity: ease.out(prog(t, 0, 1200)) });
    let d = "";
    FRONTIER.forEach((pt, i) => {
      const appear = i === 0 ? ease.out(prog(t, T_PATH - 400, T_PATH)) : ease.out(prog(t, T_PATH + i * STEP - 600, T_PATH + i * STEP));
      const prev = FRONTIER[Math.max(0, i - 1)];
      const x = lerp(X(prev.slow), X(pt.slow), i ? appear : 1), y = lerp(Y(prev.pass1), Y(pt.pass1), i ? appear : 1);
      if (appear > 0) d += `${d ? "L" : "M"}${x} ${y}`;
      const sh = ease.io(prog(t, T_SHIFT + i * 140, T_SHIFT + 1600 + i * 140));
      attrs(dots.current[i], { cx: X(pt.slow), cy: Y(pt.pass1), opacity: appear * (1 - 0.5 * sh) });
      attrs(fast.current[i], { cx: lerp(X(pt.slow), X(pt.fast), sh), cy: Y(pt.pass1), opacity: sh > 0.01 ? (i === FRONTIER.length - 1 ? 1 : 0.8) : 0 });
      attrs(shifts.current[i], { d: `M${X(pt.slow) - 12} ${Y(pt.pass1)}H${lerp(X(pt.slow) - 12, X(pt.fast) + 12, sh)}`, opacity: sh > 0.01 ? 0.9 : 0 });
      attrs(labels.current[i], { opacity: appear * (1 - 0.75 * sh) });
    });
    attrs(trail.current, { d });
    const rg = ease.out(prog(t, T_RING, T_RING + 800));
    attrs(ring.current, { cx: X(last.fast), cy: Y(last.pass1), r: 24 + 26 * (1 - rg), opacity: rg });
    attrs(head.current, { opacity: ease.out(prog(t, T_RING + 400, T_RING + 1400)) });
  }, [X, Y]);
  useSceneFrame(active, clock.readTime, draw);

  const labelPos = (i: number): [number, number, "start" | "end"] => {
    const pt = FRONTIER[i];
    if (i === 3) return [X(pt.slow) + 16, Y(pt.pass1) - 18, "start"];
    if (i === 4) return [X(pt.slow) - 16, Y(pt.pass1) - 18, "end"];
    return pt.slow > 32 ? [X(pt.slow) + 16, Y(pt.pass1) + 6, "start"] : [X(pt.slow) - 16, Y(pt.pass1) + 6, "end"];
  };
  return (
    <Surface vb={L.vb} label={`Accuracy against GPU-seconds per correct answer: from 28 of 96 at ${f2(FRONTIER_COST.start)} to 82 of 96 at ${f2(FRONTIER_COST.runtime)}`}>
      <g ref={field} opacity={0}>
        <path d={`M${P.x0} ${P.y1}V${P.y0}H${P.x1}`} fill="none" stroke="var(--ex-line-2)" />
        {[40, 60, 80, 100].map((a) => (
          <g key={a}><path d={`M${P.x0} ${Y(a)}H${P.x1}`} stroke="var(--ex-line)" /><text x={P.x0 - 14} y={Y(a) + 5} className="ex-ann" textAnchor="end">{a}%</text></g>
        ))}
        {[0, 10, 20, 30, 40].map((c) => <text key={c} x={X(c)} y={P.y0 + 26} className="ex-ann" textAnchor="middle">{c}</text>)}
        <text x={P.x1} y={P.y0 + 58} className="ex-m" textAnchor="end">{tr(L.axis)}{tall ? " ←" : ""}</text>
        <text x={P.x0} y={P.y1 - 22} className="ex-m">{tr("PASS@1 ↑")}</text>
        {CONSTELLATION.map((pt, i) => (
          <g key={i}>
            <path d={`M${X(pt.slow)} ${Y(pt.pass1)}H${X(pt.fast)}`} stroke="var(--ex-line)" />
            <circle cx={X(pt.slow)} cy={Y(pt.pass1)} r={3} fill="var(--ex-rose)" opacity={0.28} />
            <circle cx={X(pt.fast)} cy={Y(pt.pass1)} r={3} fill="var(--ex-amber)" opacity={0.28} />
          </g>
        ))}
      </g>
      <path ref={trail} fill="none" stroke="var(--ex-rose)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {FRONTIER.map((pt, i) => {
        const [lx, ly, anchor] = labelPos(i);
        return (
          <g key={pt.key}>
            <path ref={(e) => { shifts.current[i] = e; }} fill="none" stroke="var(--ex-amber)" strokeWidth={2} strokeDasharray="2 7" strokeLinecap="round" opacity={0} />
            <circle ref={(e) => { dots.current[i] = e; }} r={8} fill="var(--ex-void)" stroke="var(--ex-rose)" strokeWidth={2.4} opacity={0} />
            <circle ref={(e) => { fast.current[i] = e; }} r={7} fill="var(--ex-amber)" opacity={0} />
            <text ref={(e) => { labels.current[i] = e; }} x={lx} y={ly} textAnchor={anchor} className="ex-node" opacity={0}>
              {tr(pt.name)}{mode === "dev" && !tall ? ` · ${pt.pass1.toFixed(1)}% · ${pt.slow.toFixed(2)}` : ""}
            </text>
          </g>
        );
      })}
      <circle ref={ring} r={24} fill="none" stroke="var(--ex-amber)" strokeWidth={2.4} opacity={0} />
      <g ref={head} opacity={0} transform={`translate(${L.head[0]} ${L.head[1]})`}>
        <text className="ex-m">{tr("GPU-S / CORRECT")}</text>
        <text y={52} className="ex-num-xl" style={{ fontSize: 46 }}>{first.slow.toFixed(2)}</text>
        <text y={110} className="ex-num-xl" style={{ fontSize: 46, fill: "var(--ex-amber)" }}>→ {last.fast.toFixed(2)}</text>
        <g transform={tall ? "translate(300 -2)" : "translate(0 170)"}>
          <text className="ex-m">{tr("SOLVED")}</text>
          <text y={44} className="ex-num-l">28 → 82</text>
        </g>
        <g transform={tall ? "translate(0 170)" : "translate(0 290)"}>
          <rect width={14} height={3} y={-5} fill="var(--ex-rose)" /><text x={24} className="ex-m">{tr("post-training ↑ pass@1")}</text>
          <rect width={14} height={3} y={23} fill="var(--ex-amber)" /><text x={24} y={28} className="ex-m">{tr("serving ← GPU-s / correct")}</text>
        </g>
        {mode === "dev" && <text y={tall ? 250 : 370} className="ex-ann">16 policy × budget points</text>}
      </g>
    </Surface>
  );
}
