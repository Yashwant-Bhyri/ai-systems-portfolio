"use client";

import type { ReactNode } from "react";
import "./system-board.css";

/**
 * "In our system", drawn the way the CPU/GPU overlap module draws it: baseline
 * above optimized on one shared clock, the active lane lit, and one large
 * consequence on the right that the evidence connects to.
 */
export type Phase = "baseline" | "optimized" | "both";
export const phaseOf = (t: number, a: number, b: number): Phase => (t < a ? "baseline" : t < b ? "optimized" : "both");
/** Lane opacity: the lane not being told steps back; at the end both are lit. */
export const laneOpacity = (phase: Phase, lane: "baseline" | "optimized") => (phase === "both" || phase === lane ? 1 : 0.28);

export function SystemBoard({ heading, sub, clock, unit, figure, children, phase }: {
  heading: string; sub: string; clock: string; unit: string; figure: ReactNode; children: ReactNode; phase: Phase;
}) {
  return (
    <div className="sb-board" data-phase={phase}>
      <header className="sb-head">
        <div><h3>{heading}</h3><p>{sub}</p></div>
        <time>{clock}<small> {unit}</small></time>
      </header>
      <div className="sb-body">
        <div className="sb-figure">{figure}</div>
        <aside className="sb-side">{children}</aside>
      </div>
    </div>
  );
}

export function SideTitle({ kicker, title }: { kicker: string; title: string }) {
  return <div className="sb-title"><span>{kicker}</span><h4>{title}</h4></div>;
}

/** One measure, baseline then optimized; the optimized value waits for its lane. */
export function SideRow({ label, base, opt, unit, on }: { label: string; base: string; opt: string; unit?: string; on: boolean }) {
  return (
    <div className="sb-row">
      <span>{label}</span>
      <b><em data-tone="base">{base}</em><i>→</i><em data-tone="opt" data-on={on || undefined}>{on ? opt : "?"}</em>{unit && <small> {unit}</small>}</b>
    </div>
  );
}

/** The consequence. `spot` lets the focus moment light it. */
export function SideDelta({ value, what, on }: { value: string; what: string; on: boolean }) {
  return (
    <div className="sb-delta" data-on={on || undefined} data-focus-spot data-result-target>
      <strong>{value}</strong>
      <span>{what}</span>
    </div>
  );
}
