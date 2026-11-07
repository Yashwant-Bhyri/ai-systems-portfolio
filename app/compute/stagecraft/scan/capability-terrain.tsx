"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTr } from "../../../exhibit/i18n";
import { POLICIES, TASKS, hashTask, simulateLab } from "../../lab-simulation";
import { mountRelief } from "./relief";
import { emitMeter } from "../stage-meter";
import "./scan.css";

/**
 * Capability terrain: the 96 tasks, hardest on the right, and one ridge row per
 * checkpoint, from the base model at the front to lean RL at the back. Height is
 * the lab model's own margin (ability − difficulty) where a task is solved; a
 * scan raises the terrain one checkpoint at a time, so training reads as land rising.
 */
const STAGES = [
  { label: "Base", policy: 0, budget: 1 },
  { label: "SFT", policy: 1, budget: 1 },
  { label: "RL", policy: 2, budget: 1 },
  { label: "RL · 2× budget", policy: 2, budget: 2 },
  { label: "RL · 4× budget", policy: 2, budget: 4 },
  { label: "Lean RL · 4×", policy: 3, budget: 4 },
] as const;
const RISE = 13500;
const ORDER = [...TASKS].sort((a, b) => a.difficulty - b.difficulty).map((t) => t.id);

function margin(policyIndex: number, budget: number, taskId: number) {
  const p = POLICIES[policyIndex], task = TASKS[taskId];
  const ability = Math.min(0.94, p.skill + p.growth * Math.log2(budget) - task.family * 0.025);
  const regression = policyIndex > 0 && hashTask(task.id + policyIndex * 37) % 47 === 0;
  return { m: ability - task.difficulty, regression };
}

export function CapabilityTerrain({ active }: { active: boolean }) {
  const tr = useTr();
  const relief = useRef<HTMLDivElement>(null);
  const labels = useRef<SVGSVGElement>(null);
  const [stage, setStage] = useState(0);
  const field = useMemo(() => STAGES.map((s) => ORDER.map((id) => {
    const { m, regression } = margin(s.policy, s.budget, id);
    const solved = m > 0 && !regression;
    return { h: solved ? 0.22 + Math.min(0.5, m) * 1.7 : regression ? 0.14 : 0.02, solved, regression };
  })), []);
  const solvedCounts = useMemo(() => STAGES.map((s) => simulateLab(s.policy, s.budget).correct), []);

  useEffect(() => {
    const host = relief.current;
    if (!host || !active) return;
    // every checkpoint is its own ridge, with a flat valley before the next
    const ROWS = STAGES.length * 2 - 1;
    const stageOf = (row: number) => (row % 2 ? -1 : row / 2);
    const r = mountRelief(host, {
      cols: ORDER.length, rows: ROWS, max: 1.4, sub: 1,
      size: { w: 10.6, d: 4.8, h: 1.9 },
      value: (c, row) => (stageOf(row) < 0 ? 0 : field[stageOf(row)][c].h),
      color: (v, c, row) => {
        const s = stageOf(Math.max(0, Math.min(ROWS - 1, row)));
        if (s < 0 || v < 0.05) return [30, 24, 34];
        const cell = field[s][Math.max(0, Math.min(ORDER.length - 1, c))];
        if (cell.regression) return [255, 120, 110];
        if (!cell.solved) return [34, 30, 38];
        const x = Math.min(1, v / 1.1);
        return [Math.round(120 + 123 * x), Math.round(40 + 120 * x), Math.round(80 + 108 * x)];
      },
      ground: 0x120d13, light: 0xf3a0bc, zoom: 1.25,
    });
    const svg = labels.current;
    svg?.querySelectorAll<SVGTextElement>("text[data-row]").forEach((el) => {
      const j = Number(el.dataset.row) * 2;
      const p = r.project(ORDER.length + 1, 0.5 - j / (ROWS - 1));
      el.setAttribute("x", String(p.x + 10));
      el.setAttribute("y", String(p.y + 4));
    });
    const ends = [r.project(0, 0.54), r.project(ORDER.length - 1, 0.54)];
    svg?.querySelector("[data-easy]")?.setAttribute("x", String(ends[0].x));
    svg?.querySelector("[data-easy]")?.setAttribute("y", String(ends[0].y + 18));
    svg?.querySelector("[data-hard]")?.setAttribute("x", String(ends[1].x));
    svg?.querySelector("[data-hard]")?.setAttribute("y", String(ends[1].y + 18));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, last = -1;
    const start = performance.now();
    const tick = (now: number) => {
      // One pass: each checkpoint rises in turn, and the finished terrain holds.
      const t = reduced ? RISE : Math.min(RISE, now - start);
      const k = Math.min(STAGES.length, (t / RISE) * STAGES.length);
      // each checkpoint row rises in turn, sweeping from easy to hard tasks
      r.update((c, row) => (stageOf(row) < 0 ? 1 : Math.min(1, Math.max(0, (k - stageOf(row)) * 1.6 - (c / ORDER.length) * 0.6))));
      r.render();
      const n = Math.min(STAGES.length - 1, Math.floor(k));
      if (n !== last) { last = n; setStage(n); }
      if (!reduced && now - start < RISE) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); r.dispose(); };
  }, [field, active]);

  const stageLine = stage === 0 ? `Base: ${solvedCounts[0]} of 96 tasks rise above the ground` : `${STAGES[stage].label}: ${solvedCounts[stage - 1]} → ${solvedCounts[stage]} tasks solved`;
  useEffect(() => { if (active) emitMeter({ text: stageLine, step: stage + 1, total: STAGES.length, tone: "optimized" }); }, [active, stageLine, stage]);
  return (
    <div className="sc-root sc-rose">
      <header className="sc-head">
        <div>
          <span className="sc-kicker">{tr("96 synthetic tasks · six checkpoints")}</span>
          <h3>{tr("Capability terrain: each training step raises more of the land")}</h3>
        </div>
        <div className="sc-count">
          <b className="cx-hero-num" data-hero={stage === STAGES.length - 1 || undefined}>{solvedCounts[stage]}</b>
          <small>{tr(`of 96 solved · ${STAGES[stage].label}`)}</small>
        </div>
      </header>
      <div className="sc-stage sc-terrain">
        <div ref={relief} className="sc-relief" />
        <svg ref={labels} className="sc-labels" aria-hidden="true">
          {STAGES.map((s, i) => <text key={s.label} data-row={i} opacity={i <= stage ? 1 : 0.25} style={{ fill: i === stage ? "#f3a0bc" : undefined }}>{tr(s.label)}</text>)}
          <text data-easy>{tr("easiest")}</text>
          <text data-hard textAnchor="end">{tr("hardest")}</text>
        </svg>
      </div>
      <footer className="sc-legend">
        <span>{tr("height = how far the checkpoint's ability clears the task's difficulty")}</span>
        <span style={{ color: "#ff8f86" }}>{tr("red = a regression: ability clears the task, the answer still fails")}</span>
        <span>{tr("synthetic task set · simulated margins")}</span>
      </footer>
    </div>
  );
}
