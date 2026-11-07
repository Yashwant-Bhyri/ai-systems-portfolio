"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ease, prog } from "../../exhibit/engine";
import { useTr } from "../../exhibit/i18n";
import { POLICIES, TASKS, simulateLab } from "../lab-simulation";
import { emitFocus, emitMeter } from "./stage-meter";

/**
 * Where the 96 tasks land. The tasks stack up by difficulty, easiest on the
 * left. Each checkpoint has an ability, drawn as a line: a task it passes is
 * solved, and the dot lights up. Training moves the line to the right; one
 * pass, then the result is held. A red ring is a regression: the line has
 * passed the task, but the answer is still wrong.
 */
const VB = { w: 980, h: 470 };
const P = { x0: 40, x1: 950, y0: 400, top: 150 };
const R = 7.5, BIN = 0.04;
const STEPS = [
  { policy: 0, name: "Base", how: "the model as it comes" },
  { policy: 1, name: "SFT + LoRA", how: "imitates verified reasoning" },
  { policy: 2, name: "GRPO", how: "learns from test outcomes" },
] as const;
const HOLD = 1800, MOVE = 2600, GAP = 900;
const BLUE = "#8fb4ff", ROSE = "#f3a0bc", RED = "#ff8176", MUTED = "#3b4651";

export function TaskLanding({ budget, active }: { budget: number; active: boolean }) {
  const tr = useTr();
  const root = useRef<HTMLDivElement>(null);
  const data = useMemo(() => {
    const thought = Math.log2(budget);
    const runs = STEPS.map((s) => simulateLab(s.policy, budget));
    const abilities = STEPS.map((s) => Math.min(0.94, POLICIES[s.policy].skill + POLICIES[s.policy].growth * thought));
    const diff = TASKS.map((t) => t.difficulty + t.family * 0.025);
    const dMax = Math.max(...diff) + BIN;
    const stacks = new Map<number, number>();
    const dots = TASKS.map((t, i) => {
      const bin = Math.floor(diff[i] / BIN), level = stacks.get(bin) ?? 0;
      stacks.set(bin, level + 1);
      return { i, d: diff[i], bin, level, solved: runs.map((r) => r.tasks[i].correct) };
    });
    return { runs, abilities, dots, dMax, tallest: Math.max(...stacks.values()) };
  }, [budget]);
  const X = (d: number) => P.x0 + (d / data.dMax) * (P.x1 - P.x0);
  const [t, setT] = useState(0);
  const total = HOLD + (STEPS.length - 1) * (MOVE + GAP) + 1000;
  useEffect(() => {
    if (!active) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { const id = window.setTimeout(() => setT(total), 0); return () => window.clearTimeout(id); }
    let raf = 0; const start = performance.now();
    const tick = (now: number) => { const v = now - start; setT(Math.min(total, v)); if (v < total) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, total]);

  // which checkpoint we are at, and how far the line has travelled towards it
  const span = MOVE + GAP;
  const reached = t < HOLD ? 0 : Math.min(STEPS.length - 1, 1 + Math.floor((t - HOLD) / span));
  const k = t < HOLD ? 1 : ease.io(prog((t - HOLD) % span, 0, MOVE));
  const atEnd = t >= HOLD + (STEPS.length - 1) * span;
  const from = atEnd ? STEPS.length - 1 : Math.max(0, reached - 1);
  const to = atEnd ? STEPS.length - 1 : reached;
  const ability = data.abilities[from] + (data.abilities[to] - data.abilities[from]) * (atEnd ? 1 : k);
  const settled = atEnd || k >= 0.98 ? to : from;
  const run = data.runs[settled];
  const gain = run.correct - data.runs[0].correct;

  const line = t < HOLD ? `Base: the ability line passes ${data.runs[0].correct} of 96 tasks`
    : atEnd ? `${data.runs[0].correct} → ${run.correct} tasks solved: the line moved from ${data.abilities[0].toFixed(2)} to ${ability.toFixed(2)}`
    : `${STEPS[to].name} ${STEPS[to].how}: the line moves right`;
  useEffect(() => { if (active) emitMeter({ text: line, step: settled + 1, total: STEPS.length, tone: atEnd ? "delta" : "optimized" }); }, [active, line, settled, atEnd]);
  useEffect(() => {
    if (!active || !atEnd) return;
    const a = data.runs[0], b = data.runs[STEPS.length - 1];
    emitFocus({
      headline: `Training lifted ${b.correct - a.correct} tasks over the line`,
      parts: [{ label: "base", value: `${a.correct} of 96`, tone: "baseline" }, { label: "after SFT and GRPO", value: `${b.correct} of 96`, tone: "optimized" }, { label: "median cost", value: `${(a.tokens / a.n / 1000).toFixed(1)}k → ${(b.tokens / b.n / 1000).toFixed(1)}k tokens`, tone: "delta" }],
      cause: "the model got more able, and it now spends more tokens per answer to do it",
      place: "bottom",
    });
    const id = window.setTimeout(() => { emitFocus(null); root.current?.dispatchEvent(new CustomEvent("lab:module-round", { bubbles: true })); }, 6000);
    return () => { window.clearTimeout(id); emitFocus(null); };
    // the focus reads settled values once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, atEnd]);

  return (
    <div ref={root} className="tl-root tl-ladder">
      <header className="tl-head">
        <h3>{tr("Where the 96 tasks land")}</h3>
        <ol className="tl-steps">
          {STEPS.map((s, i) => (
            <li key={s.name} data-on={i === settled || undefined} data-done={i < settled || undefined}>
              <strong>{s.name}</strong>
              <span>{i <= settled ? `${data.runs[i].correct} of 96` : "?"}</span>
            </li>
          ))}
        </ol>
      </header>
      <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="tl-svg" role="img" aria-label={`Tasks stacked by difficulty. The ability line moves right from ${data.abilities[0].toFixed(2)} to ${data.abilities[STEPS.length - 1].toFixed(2)}, and solved tasks go from ${data.runs[0].correct} to ${data.runs[STEPS.length - 1].correct} of 96.`}>
        <rect x={P.x0} y={P.top - 40} width={Math.max(0, X(ability) - P.x0)} height={P.y0 - P.top + 40} fill={ROSE} opacity={0.05} />
        <path d={`M${P.x0} ${P.y0 + 6}H${P.x1}`} className="tl-axis" />
        {data.dots.map((d) => {
          const passed = d.d < ability;
          const solved = passed && d.solved[settled];
          const regressed = passed && !d.solved[settled];
          const gained = solved && !d.solved[0];
          const cx = X((d.bin + 0.5) * BIN), cy = P.y0 - R - d.level * (2 * R + 2.5);
          return <circle key={d.i} cx={cx} cy={cy} r={R} fill={solved ? (gained ? ROSE : BLUE) : "none"} stroke={regressed ? RED : solved ? (gained ? ROSE : BLUE) : MUTED} strokeWidth={regressed ? 2 : 1.3} style={{ transition: "fill .25s, stroke .25s" }} data-focus-spot={solved ? "" : undefined} />;
        })}
        <g data-focus-spot>
          <path d={`M${X(ability)} ${P.top - 40}V${P.y0 + 12}`} stroke={ROSE} strokeWidth={3} />
          <text x={X(ability) + (ability > data.dMax * 0.7 ? -10 : 10)} y={P.top - 22} textAnchor={ability > data.dMax * 0.7 ? "end" : "start"} className="tl-line-label">{tr("Ability")} {ability.toFixed(2)}</text>
          <text x={X(ability) + (ability > data.dMax * 0.7 ? -10 : 10)} y={P.top - 2} textAnchor={ability > data.dMax * 0.7 ? "end" : "start"} className="tl-line-sub">{tr("tasks it has passed are solved")}</text>
        </g>
        <text x={P.x0} y={P.y0 + 34} className="tl-axis-label">{tr("← easier tasks")}</text>
        <text x={P.x1} y={P.y0 + 34} textAnchor="end" className="tl-axis-label">{tr("harder tasks →")}</text>
        <g transform={`translate(${P.x0} ${P.y0 + 52})`}>
          {[[BLUE, "solved by the base model", false], [ROSE, "newly solved", false], [RED, "regression: passed, still wrong", true]].map(([c, l, ring], i) => (
            <g key={String(l)} transform={`translate(${[0, 230, 400][i]} 0)`}><circle cx={7} cy={0} r={6} fill={ring ? "none" : String(c)} stroke={String(c)} strokeWidth={2} /><text x={20} y={5} className="tl-axis-label">{String(l)}</text></g>
          ))}
        </g>
        <g transform={`translate(${P.x1} 40)`} data-focus-spot>
          <text textAnchor="end" className="tl-count">{run.correct}<tspan className="tl-count-unit"> {tr("of 96 solved")}</tspan></text>
          {gain > 0 && <text y={30} textAnchor="end" className="tl-gain">+{gain} {tr("on the base model")}</text>}
        </g>
      </svg>
    </div>
  );
}
