"use client";

import { useCallback, useEffect, useRef } from "react";
import { ease, fitCanvas, fmt, prog, readTokens, useSceneFrame, type Tokens } from "../engine";
import type { RoomProps } from "../shell";
import { FLEET, GPUS, SWITCH, SYNC, type Segment } from "./fleet-model";
import { Surface, VB } from "./parts";

/* P4 · 64 GPUs on one wall clock: colocated RL waits for the slowest rollout; elastic cells never do. */

const AX = { x0: 150, x1: 1540 };
const PANELS = [
  { key: "colocated", y: 86, label: "COLOCATED · BARRIER PER STEP", data: FLEET.colocated },
  { key: "elastic", y: 404, label: "ELASTIC CELLS · ROLE PER GPU", data: FLEET.elastic },
] as const;
const ROWH = 3.3;
const SWEEP = 9200;
const X = (m: number) => AX.x0 + (m / FLEET.span) * (AX.x1 - AX.x0);

export function PolicyFleet({ active, mode, clock }: RoomProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const vals = useRef<Record<string, SVGTextElement | null>>({});
  const tok = useRef<Tokens | null>(null);

  const draw = useCallback((t: number) => {
    const el = canvas.current;
    if (!el) return;
    const T = (tok.current ??= readTokens(el));
    const ctx = fitCanvas(el, VB.w, VB.h);
    const now = FLEET.span * ease.sine(prog(t, 300, SWEEP));
    const colour: Record<Segment["kind"], string> = {
      rollout: `rgba(${T.roseRgb},0.85)`,
      train: `rgba(${T.cyanRgb},0.85)`,
      sync: `rgba(${T.amberRgb},0.95)`,
      idle: `rgba(${T.inkRgb},0.07)`,
    };
    let stepsA = 0, stepsB = 0;
    PANELS.forEach((panel, pi) => {
      const segs = panel.data.segs;
      for (const s of segs) {
        if (s.start > now || s.start > FLEET.span) continue;
        const end = Math.min(s.end, now, FLEET.span);
        const y = panel.y + s.gpu * ROWH;
        ctx.fillStyle = colour[s.kind];
        ctx.fillRect(X(s.start), y, Math.max(0.6, X(end) - X(s.start)), ROWH - 1);
        if (s.kind === "idle") {
          ctx.fillStyle = `rgba(${T.redRgb},0.22)`;
          ctx.fillRect(X(s.start), y + ROWH - 2, Math.max(0.6, X(end) - X(s.start)), 1);
        }
      }
      // step boundaries
      panel.data.stepEnds.forEach((e) => {
        if (e > now || e > FLEET.span) return;
        if (pi === 0) stepsA++; else stepsB++;
        ctx.fillStyle = `rgba(${T.inkRgb},0.5)`;
        ctx.fillRect(X(e), panel.y - 10, 1.2, GPUS * ROWH + 14);
      });
      // playhead
      ctx.fillStyle = `rgba(${T.inkRgb},0.85)`;
      ctx.fillRect(X(now), panel.y - 14, 1.5, GPUS * ROWH + 22);
    });
    const set = (k: string, s: string) => { const e = vals.current[k]; if (e && e.textContent !== s) e.textContent = s; };
    set("clock", `${fmt(now, 2)} min`);
    set("stepsA", `${stepsA}`);
    set("stepsB", `${stepsB}`);
    const done = ease.out(prog(t, SWEEP, SWEEP + 900));
    set("step", done > 0 ? `${fmt(FLEET.stepA)} → ${fmt(FLEET.stepB)}` : "");
    set("busy", done > 0 ? `${Math.round(FLEET.utilA * 100)}% → ${Math.round(FLEET.utilB * 100)}%` : "");
    set("ratio", done > 0 ? `${(FLEET.stepA / FLEET.stepB).toFixed(2)}×` : "");
  }, []);
  useSceneFrame(active, clock.readTime, draw);
  useEffect(() => { tok.current = null; }, [mode]);

  return (
    <Surface ref={canvas} label="Sixty-four GPUs over fourteen minutes: colocated scheduling completes four RL steps, elastic cells complete seven">
      {PANELS.map((p, i) => (
        <g key={p.key}>
          <text x={AX.x0} y={p.y - 24} className="ex-m">{p.label}</text>
          <text x={AX.x0 - 16} y={p.y + 10} className="ex-ann" textAnchor="end">gpu 0</text>
          <text x={AX.x0 - 16} y={p.y + GPUS * ROWH} className="ex-ann" textAnchor="end">gpu 63</text>
          <text x={AX.x1 - 48} y={p.y - 24} className="ex-m" textAnchor="end">STEPS DONE</text>
          <text ref={(e) => { vals.current[i ? "stepsB" : "stepsA"] = e; }} x={AX.x1} y={p.y - 22} className="ex-num-l" textAnchor="end" style={{ fontSize: 28, fill: i ? "var(--ex-rose)" : "var(--ex-ink-2)" }} />
        </g>
      ))}
      <path d={`M${AX.x0} 640H${AX.x1}`} stroke="var(--ex-line-2)" />
      {[0, 2, 4, 6, 8, 10, 12, 14].map((m) => m <= FLEET.span && (
        <text key={m} x={X(m)} y={662} className="ex-ann" textAnchor="middle">{m}</text>
      ))}
      <text x={AX.x0} y={694} className="ex-m">WALL CLOCK · MIN</text>
      <text ref={(e) => { vals.current.clock = e; }} x={AX.x0 + 220} y={694} className="ex-m-ink" />
      <g transform="translate(150 0)">
        {[["rollout", "var(--ex-rose)"], ["train", "var(--ex-cyan)"], ["weight sync", "var(--ex-amber)"], ["idle", "rgba(255,129,118,.6)"]].map(([l, c], i) => (
          <g key={l} transform={`translate(${520 + i * 140} 682)`}><rect y={2} width={12} height={12} rx={3} fill={c} /><text x={20} y={13} className="ex-m">{l}</text></g>
        ))}
      </g>
      <g transform="translate(150 342)">
        <text className="ex-m">STEP TIME · MIN</text>
        <text ref={(e) => { vals.current.step = e; }} x={150} className="ex-m-ink" />
        <text x={420} className="ex-m">GPU BUSY</text>
        <text ref={(e) => { vals.current.busy = e; }} x={520} className="ex-m-ink" />
        <text x={760} className="ex-m">RL STEPS / HOUR</text>
        <text ref={(e) => { vals.current.ratio = e; }} x={920} className="ex-m-ink" style={{ fill: "var(--ex-rose)" }} />
      </g>
      {mode === "dev" && (
        <text x={AX.x1} y={716} className="ex-ann" textAnchor="end">
          long-tail rollouts p50 1.05 · p90 2.56 · max 3.33 min · role switch {SWITCH} · sync {SYNC} min · staleness ≤ 1 step · after QwenGyre
        </text>
      )}
    </Surface>
  );
}
