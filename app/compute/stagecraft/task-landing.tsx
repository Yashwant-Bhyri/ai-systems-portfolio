"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { attrs, ease, lerp, prog } from "../../exhibit/engine";
import { useTr } from "../../exhibit/i18n";
import { POLICIES, TASKS, simulateLab } from "../lab-simulation";

/**
 * Where the 96 tasks land. Each dot is one task: its height is the task's
 * difficulty (plus the small per-family offset the model uses), its x is the
 * GPU-seconds the checkpoint spends on it. A task is solved when it sits below
 * the checkpoint's ability line. Post-training lifts the line, so more tasks
 * fall under it, and longer reasoning moves every dot to the right.
 */

const VB = { w: 820, h: 560 };
const P = { x0: 70, x1: 790, y0: 500, y1: 40 };
const T = { base: 1400, move: [2200, 5600] as const, hold: 9800, back: [12600, 14200] as const };
const LOOP = 15000;
const BLUE = "#8fb4ff", ROSE = "#f3a0bc", RED = "#ff8176", MUTED = "#4c5864";
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b), m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export function TaskLanding({ budget, active }: { budget: number; active: boolean }) {
  const tr = useTr();
  const data = useMemo(() => {
    const base = simulateLab(0, budget), post = simulateLab(2, budget);
    const thought = Math.log2(budget);
    const ability = (p: number) => Math.min(0.94, POLICIES[p].skill + POLICIES[p].growth * thought);
    const rows = TASKS.map((t, i) => ({
      y: t.difficulty + t.family * 0.025,
      bx: base.tasks[i].gpuSeconds, px: post.tasks[i].gpuSeconds,
      b: base.tasks[i].correct, p: post.tasks[i].correct,
      regression: post.tasks[i].correct === false && t.difficulty + t.family * 0.025 < ability(2),
    }));
    const maxX = Math.max(...rows.map((r) => Math.max(r.bx, r.px)));
    return {
      rows, maxX: Math.ceil(maxX / 5) * 5,
      baseAbility: ability(0), postAbility: ability(2),
      baseSolved: base.correct, postSolved: post.correct,
      baseMedian: median(rows.map((r) => r.bx)), postMedian: median(rows.map((r) => r.px)),
    };
  }, [budget]);
  const X = useCallback((v: number) => P.x0 + (v / data.maxX) * (P.x1 - P.x0), [data.maxX]);
  const Y = useCallback((d: number) => P.y0 - Math.min(1, d) * (P.y0 - P.y1), []);

  const dots = useRef<(SVGCircleElement | null)[]>([]);
  const ghosts = useRef<(SVGCircleElement | null)[]>([]);
  const zone = useRef<SVGRectElement>(null), abilityPath = useRef<SVGPathElement>(null);
  const lineLabel = useRef<SVGTextElement>(null);
  const medB = useRef<SVGGElement>(null), medP = useRef<SVGGElement>(null), bracket = useRef<SVGGElement>(null);
  const solved = useRef<HTMLSpanElement>(null), med = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState(0);
  const phaseRef = useRef(0);

  const draw = useCallback((t: number) => {
    const fwd = ease.io(prog(t, T.move[0], T.move[1])), backP = ease.io(prog(t, T.back[0], T.back[1]));
    const k = fwd * (1 - backP);
    const ab = lerp(data.baseAbility, data.postAbility, k);
    attrs(zone.current, { y: Y(ab), height: P.y0 - Y(ab) });
    attrs(abilityPath.current, { d: `M${P.x0} ${Y(ab)}H${P.x1}` });
    attrs(lineLabel.current, { y: Y(ab) - 8 });
    if (lineLabel.current) lineLabel.current.textContent = `${tr("ability")} ${ab.toFixed(2)} · ${tr("below the line = solved")}`;
    data.rows.forEach((r, i) => {
      const x = lerp(X(r.bx), X(r.px), k);
      const isSolved = k < 0.5 ? r.b && r.y < ab + 1e-9 : r.p;
      const lit = r.y < ab && !(r.regression && k > 0.5);
      const gained = lit && !r.b && k > 0.05;
      attrs(dots.current[i], {
        cx: x, fill: lit ? (gained ? ROSE : BLUE) : "none",
        stroke: r.regression && k > 0.5 ? RED : lit ? (gained ? ROSE : BLUE) : MUTED,
        "fill-opacity": isSolved ? 0.9 : 0, r: gained ? 4.4 : 3.6,
      });
      attrs(ghosts.current[i], { opacity: 0.35 * k });
    });
    const mx = lerp(data.baseMedian, data.postMedian, k);
    attrs(medB.current, { opacity: 0.9 });
    attrs(medP.current, { transform: `translate(${X(mx) - X(data.baseMedian)} 0)`, opacity: k > 0.02 ? 1 : 0 });
    attrs(bracket.current, { opacity: ease.out(prog(t, T.move[1], T.move[1] + 800)) * (1 - backP) });
    if (solved.current) solved.current.textContent = String(Math.round(lerp(data.baseSolved, data.postSolved, k)));
    if (med.current) med.current.textContent = mx.toFixed(1);
    const ph = t < T.move[0] ? 0 : t < T.move[1] ? 1 : t < T.back[0] ? 2 : 3;
    if (ph !== phaseRef.current) { phaseRef.current = ph; setPhase(ph); }
  }, [data, X, Y, tr]);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !active) { draw(T.hold); return; }
    let raf = 0; const start = performance.now();
    const tick = (now: number) => { draw((now - start) % LOOP); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, draw]);

  const ticksX = Array.from({ length: Math.floor(data.maxX / 10) + 1 }, (_, i) => i * 10);
  const gain = data.postSolved - data.baseSolved;
  const medGain = data.postMedian - data.baseMedian;
  return (
    <div className="tl-root">
      <div className="tl-figure">
        <header className="tl-head">
          <h3>{tr(phase === 0 ? "Base checkpoint: 96 tasks by difficulty and cost" : phase === 1 ? "SFT + RL lifts the ability line" : phase === 2 ? `${gain} more tasks fall below the line` : "Back to the base checkpoint")}</h3>
          <span>{tr("one dot = one task · filled = solved · same 96 tasks, same runtime")}</span>
        </header>
        <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="tl-svg" role="img" aria-label={`Base solves ${data.baseSolved} of 96 at a median of ${data.baseMedian.toFixed(1)} GPU-seconds per task; SFT plus RL solves ${data.postSolved} at ${data.postMedian.toFixed(1)}.`}>
          <path d={`M${P.x0} ${P.y1}V${P.y0}H${P.x1}`} className="tl-axis" />
          {[0, 0.25, 0.5, 0.75, 1].map((d) => <g key={d}><path d={`M${P.x0} ${Y(d)}H${P.x1}`} className="tl-grid" /><text x={P.x0 - 10} y={Y(d) + 4} textAnchor="end" className="tl-tick">{d.toFixed(2)}</text></g>)}
          {ticksX.map((v) => <text key={v} x={X(v)} y={P.y0 + 20} textAnchor="middle" className="tl-tick">{v}</text>)}
          <text x={P.x0} y={P.y1 - 16} className="tl-axis-label">{tr("task difficulty ↑")}</text>
          <text x={P.x1} y={P.y0 + 44} textAnchor="end" className="tl-axis-label">{tr("GPU-seconds spent on the task →")}</text>
          {/* the ability line: everything below it is solved */}
          <rect ref={zone} x={P.x0} y={Y(data.baseAbility)} width={P.x1 - P.x0} height={P.y0 - Y(data.baseAbility)} className="tl-solved-zone" />
          <path ref={abilityPath} d={`M${P.x0} ${Y(data.baseAbility)}H${P.x1}`} className="tl-ability" />
          <text ref={lineLabel} x={P.x1 - 4} y={Y(data.baseAbility) - 8} textAnchor="end" className="tl-ability-label" />
          {data.rows.map((r, i) => <circle key={`g${i}`} ref={(e) => { ghosts.current[i] = e; }} cx={X(r.bx)} cy={Y(r.y)} r={2.4} className="tl-ghost" opacity={0} />)}
          {data.rows.map((r, i) => <circle key={i} ref={(e) => { dots.current[i] = e; }} cx={X(r.bx)} cy={Y(r.y)} r={3.6} strokeWidth={1.3} />)}
          {/* medians on the cost axis, with the shift between them */}
          <g ref={medB}><path d={`M${X(data.baseMedian)} ${P.y0}v-14`} className="tl-median tl-median-base" /><text x={X(data.baseMedian)} y={P.y0 - 20} textAnchor="middle" className="tl-median-label">{tr("base median")}</text></g>
          <g ref={medP} opacity={0}><path d={`M${X(data.baseMedian)} ${P.y0}v-14`} className="tl-median tl-median-post" /><text x={X(data.baseMedian)} y={P.y0 - 20} textAnchor="middle" className="tl-median-label tl-post">{tr("SFT + RL median")}</text></g>
          <g ref={bracket} opacity={0}>
            <path d={`M${X(data.baseMedian)} ${P.y0 + 30}v6H${X(data.postMedian)}v-6`} className="tl-bracket" />
          </g>
        </svg>
      </div>
      <aside className="tl-plate" aria-live="off">
        <span className="tl-label">{tr("Base → SFT + RL · same 96 tasks · static runtime")}</span>
        <h4>{tr("Post-training buys accuracy with longer reasoning")}</h4>
        <div className="tl-row"><span>{tr("Tasks solved")}</span><strong><span ref={solved}>{data.baseSolved}</span><small> / 96</small></strong></div>
        <p className="tl-hero"><b className="cx-hero-num">+{gain}</b> <span className="cx-hero-unit">{tr("tasks solved")}</span></p>
        <div className="tl-row"><span>{tr("Median GPU-s per task")}</span><strong><span ref={med}>{data.baseMedian.toFixed(1)}</span><small> GPU-s</small></strong></div>
        <p className="tl-delta-line">+{medGain.toFixed(1)} GPU-s {tr("per task")} <em>({data.baseMedian.toFixed(1)} → {data.postMedian.toFixed(1)})</em></p>
        <p className="tl-cause"><b>{tr("Cause")}</b> {tr("SFT on verified traces raises the ability line from")} {data.baseAbility.toFixed(2)} {tr("to")} {Math.min(0.94, POLICIES[1].skill + POLICIES[1].growth * Math.log2(budget)).toFixed(2)}; {tr("correctness RL raises it to")} {data.postAbility.toFixed(2)}. {tr("RL answers are")} {POLICIES[2].work}× {tr("longer, so each task costs more.")}</p>
        <p className="tl-cause"><b>{tr("Next")}</b> {tr("Serving cuts the cost back: see Policy × runtime.")}</p>
      </aside>
    </div>
  );
}
