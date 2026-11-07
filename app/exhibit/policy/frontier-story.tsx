"use client";

import { useCallback, useRef } from "react";
import { attrs, ease, lerp, prog, useSceneFrame } from "../engine";
import type { RoomProps } from "../shell";
import { CONSTELLATION, FRONTIER, FRONTIER_COST, f2 } from "./data";
import { Surface, TALL_W, VB } from "./parts";
import { useTr } from "../i18n";

/* The frontier, told hop by hop: each move names what was done and what it bought.
   Training moves the point up; serving moves every point left. */

// GPU-s per correct answer for each hop, read from the frontier itself
const hop = (a: number, b: number) => `${f2(a)} → ${f2(b)}`;
const HOPS = [
  { verb: "SFT · LoRA", did: "Imitate verified traces", gain: "+18 solved", cost: hop(FRONTIER[0].slow, FRONTIER[1].slow) },
  { verb: "GRPO", did: "Reward what passes the tests", gain: "+11 −2", cost: hop(FRONTIER[1].slow, FRONTIER[2].slow) },
  { verb: "4× thinking budget", did: "Reason longer with the same weights", gain: "+27 solved", cost: hop(FRONTIER[2].slow, FRONTIER[3].slow) },
  { verb: "Lean RL", did: "Penalize wasted tokens", gain: "same 82", cost: hop(FRONTIER[3].slow, FRONTIER[4].slow) },
  { verb: "Serving", did: "Reuse prefixes, batch, fuse kernels", gain: "same 82", cost: hop(FRONTIER_COST.policy, FRONTIER_COST.runtime) },
] as const;

const WIDE = {
  vb: VB, p: { x0: 120, x1: 1020, y0: 640, y1: 80 },
  ledger: { x: 1110, y: 96, row: 104 },
};
const TALL = {
  vb: { w: TALL_W, h: 1180 }, p: { x0: 70, x1: 570, y0: 560, y1: 70 },
  ledger: { x: 24, y: 660, row: 100 },
};
const CMAX = FRONTIER_COST.axisMax, AMIN = 20, AMAX = 100;
const T0 = 1000, HOP = 2600, T_SHIFT = T0 + 4 * HOP + 400, T_RING = T_SHIFT + 2000;
export const FRONTIER_STORY_MS = T_RING + 3200;
const first = FRONTIER[0], last = FRONTIER[FRONTIER.length - 1];

export function PolicyFrontierStory({ active, clock, tall }: RoomProps) {
  const L = tall ? TALL : WIDE, P = L.p;
  const tr = useTr();
  const X = useCallback((c: number) => P.x0 + (c / CMAX) * (P.x1 - P.x0), [P]);
  const Y = useCallback((a: number) => P.y0 - ((a - AMIN) / (AMAX - AMIN)) * (P.y0 - P.y1), [P]);
  const segs = useRef<(SVGPathElement | null)[]>([]);
  const dots = useRef<(SVGCircleElement | null)[]>([]);
  const fast = useRef<(SVGCircleElement | null)[]>([]);
  const fastTags = useRef<(SVGTextElement | null)[]>([]);
  const shifts = useRef<(SVGPathElement | null)[]>([]);
  const tags = useRef<(SVGGElement | null)[]>([]);
  const rows = useRef<(SVGGElement | null)[]>([]);
  const ring = useRef<SVGCircleElement>(null);
  const field = useRef<SVGGElement>(null);
  const hero = useRef<SVGGElement>(null);

  const draw = useCallback((t: number) => {
    attrs(field.current, { opacity: ease.out(prog(t, 0, 900)) });
    const current = t < T0 ? -1 : t < T_SHIFT ? Math.min(3, Math.floor((t - T0) / HOP)) : 4;
    FRONTIER.forEach((pt, i) => {
      const appear = i === 0 ? ease.out(prog(t, 300, T0)) : ease.io(prog(t, T0 + (i - 1) * HOP, T0 + (i - 1) * HOP + 1000));
      const sh = ease.io(prog(t, T_SHIFT + i * 120, T_SHIFT + 1500 + i * 120));
      attrs(dots.current[i], { opacity: (i === 0 ? appear : appear > 0.98 ? 1 : 0) * (1 - 0.55 * sh) });
      attrs(fast.current[i], { cx: lerp(X(pt.slow), X(pt.fast), sh), opacity: sh > 0.01 ? (i === FRONTIER.length - 1 ? 1 : 0.7) : 0 });
      attrs(fastTags.current[i], { opacity: sh > 0.95 ? (i === FRONTIER.length - 1 ? 1 : 0.85) : 0 });
      attrs(shifts.current[i], { d: `M${X(pt.slow) - 11} ${Y(pt.pass1)}H${lerp(X(pt.slow) - 11, X(pt.fast) + 11, sh)}`, opacity: sh > 0.01 ? 0.85 : 0 });
      if (i > 0) {
        const prev = FRONTIER[i - 1];
        const x = lerp(X(prev.slow), X(pt.slow), appear), y = lerp(Y(prev.pass1), Y(pt.pass1), appear);
        const lit = current === i - 1 || current === 4 || t > T_RING;
        attrs(segs.current[i], { d: `M${X(prev.slow)} ${Y(prev.pass1)}L${x} ${y}`, opacity: appear > 0 ? (lit ? 1 : 0.38) : 0 });
        attrs(tags.current[i], { opacity: current === i - 1 ? ease.out(prog(t, T0 + (i - 1) * HOP + 700, T0 + (i - 1) * HOP + 1200)) : 0 });
      }
    });
    HOPS.forEach((_, k) => {
      const shown = k <= current ? 1 : 0.14;
      attrs(rows.current[k], { opacity: k === current ? 1 : shown * (current === -1 ? 0 : 0.42) });
    });
    const rg = ease.out(prog(t, T_RING, T_RING + 800));
    attrs(ring.current, { r: 22 + 24 * (1 - rg), opacity: rg });
    attrs(hero.current, { opacity: ease.out(prog(t, T_RING + 300, T_RING + 1300)) });
  }, [X, Y]);
  useSceneFrame(active, clock.readTime, draw);

  const tagPos = (i: number): [number, number, "start" | "end"] => {
    const a = FRONTIER[i - 1], b = FRONTIER[i];
    const mx = (X(a.slow) + X(b.slow)) / 2, my = (Y(a.pass1) + Y(b.pass1)) / 2;
    return b.slow < a.slow ? [mx - 18, my - 4, "end"] : [mx + 18, my + 4, "start"];
  };

  return (
    <Surface vb={L.vb} label={`Five moves from 28 to 82 of 96 solved; serving then cuts GPU-seconds per correct answer from ${f2(FRONTIER_COST.policy)} to ${f2(FRONTIER_COST.runtime)}`}>
      <g ref={field} opacity={0}>
        <path d={`M${P.x0} ${P.y1}V${P.y0}H${P.x1}`} fill="none" stroke="var(--ex-line-2)" />
        {[40, 60, 80, 100].map((a) => (
          <g key={a}><path d={`M${P.x0} ${Y(a)}H${P.x1}`} stroke="var(--ex-line)" /><text x={P.x0 - 12} y={Y(a) + 5} className="ex-ann" textAnchor="end">{a}%</text></g>
        ))}
        {Array.from({ length: Math.floor(CMAX / 10) + 1 }, (_, k) => k * 10).map((c) => <text key={c} x={X(c)} y={P.y0 + 26} className="ex-ann" textAnchor="middle">{c}</text>)}
        <text x={P.x1} y={P.y0 + 56} className="ex-m" textAnchor="end">{tr("GPU-s per correct answer")} ←</text>
        <text x={P.x0} y={P.y1 - 22} className="ex-m">{tr("Tasks solved")} ↑</text>
        {CONSTELLATION.map((pt, i) => <circle key={i} cx={X(pt.slow)} cy={Y(pt.pass1)} r={2.6} fill="var(--ex-ink-3)" opacity={0.35} />)}
      </g>
      {FRONTIER.map((pt, i) => (
        <g key={pt.key}>
          {i > 0 && <path ref={(e) => { segs.current[i] = e; }} fill="none" stroke="var(--ex-rose)" strokeWidth={3} strokeLinecap="round" opacity={0} />}
          <path ref={(e) => { shifts.current[i] = e; }} fill="none" stroke="var(--ex-amber)" strokeWidth={2} strokeDasharray="2 7" strokeLinecap="round" opacity={0} />
          <circle ref={(e) => { dots.current[i] = e; }} cx={X(pt.slow)} cy={Y(pt.pass1)} r={8} fill="var(--ex-void)" stroke="var(--ex-rose)" strokeWidth={2.4} opacity={0} />
          <circle ref={(e) => { fast.current[i] = e; }} cx={X(pt.slow)} cy={Y(pt.pass1)} r={7} fill="var(--ex-amber)" opacity={0} />
          <text ref={(e) => { fastTags.current[i] = e; }} x={i === FRONTIER.length - 1 ? X(pt.fast) + 26 : X(pt.fast)} y={i === FRONTIER.length - 1 ? Y(pt.pass1) + 34 : Y(pt.pass1) - 16} textAnchor={i === FRONTIER.length - 1 ? "start" : "middle"} className="ex-ann-acc" style={{ fill: "var(--ex-amber)", fontSize: i === FRONTIER.length - 1 ? 18 : 14 }} opacity={0} data-focus-spot>−{Math.round((100 * (pt.slow - pt.fast)) / pt.slow)}%{i === FRONTIER.length - 1 ? ` · ${f2(pt.fast)} GPU-s` : ""}</text>
        </g>
      ))}
      {FRONTIER.map((pt, i) => {
        if (!i) return null;
        const [x, y, anchor] = tagPos(i);
        return (
          <g key={`tag-${pt.key}`} ref={(e) => { tags.current[i] = e; }} opacity={0}>
            <text x={x} y={y} textAnchor={anchor} className="ex-ann-acc" style={{ fontSize: tall ? 18 : 15 }}>{tr(HOPS[i - 1].verb)}</text>
            <text x={x} y={y + 22} textAnchor={anchor} className="ex-m-ink" style={{ fontSize: tall ? 20 : 17 }}>{tr(HOPS[i - 1].gain)}</text>
          </g>
        );
      })}
      <circle ref={ring} cx={X(last.fast)} cy={Y(last.pass1)} r={22} fill="none" stroke="var(--ex-amber)" strokeWidth={2.4} opacity={0} />
      <text x={X(first.slow) + 14} y={Y(first.pass1) + 24} className="ex-node">{tr("base")} · 28 / 96</text>
      <g transform={`translate(${L.ledger.x} ${L.ledger.y})`}>
        {HOPS.map((h, k) => (
          <g key={h.verb} ref={(e) => { rows.current[k] = e; }} transform={`translate(0 ${k * L.ledger.row})`} opacity={0}>
            <text className="ex-ann" style={{ fontSize: tall ? 17 : 13 }}>{String(k + 1).padStart(2, "0")}</text>
            <text x={38} className="ex-ann-acc" style={{ fontSize: tall ? 18 : 14, fill: k === 4 ? "var(--ex-amber)" : "var(--ex-rose)" }}>{tr(h.verb)}</text>
            <text x={38} y={30} className="ex-node" style={{ fontSize: tall ? 21 : 18, fill: "var(--ex-ink)" }}>{tr(h.did)}</text>
            <text x={38} y={58} className="ex-m" style={{ fontSize: tall ? 18 : 14 }}><tspan fill="var(--ex-ink)">{tr(h.gain)}</tspan>{"  ·  "}{h.cost}</text>
          </g>
        ))}
      </g>
      <g ref={hero} opacity={0} transform={tall ? `translate(${P.x0 + 10} ${Y(74)})` : `translate(${P.x0 + 40} ${Y(75)})`}>
        {/* three times the correct answers, for about the same GPU time per correct answer */}
        <text className="ex-m">{tr("Solved, of 96")}</text>
        <text y={50} className="ex-num-xl" style={{ fontSize: 44 }}>28 <tspan fill="var(--ex-amber)">→ 82</tspan></text>
        <text y={84} className="ex-m">{tr("GPU-s per correct answer")} {f2(first.slow)} → {f2(last.fast)}</text>
      </g>
    </Surface>
  );
}
