"use client";

import { useCallback, useEffect, useRef } from "react";
import { ease, fitCanvas, fmt, prog, readTokens, useSceneFrame, type Tokens } from "../engine";
import { useTr } from "../i18n";
import type { RoomProps } from "../shell";
import { FLEET, GPUS, SWITCH, SYNC, type Segment } from "./fleet-model";
import { Surface, TALL_W, VB } from "./parts";

/* P4 · 64 GPUs on one wall clock: colocated RL waits for the slowest rollout; elastic cells never do. */

const SWEEP = 9200;
const WIDE = {
  vb: VB, ax: { x0: 150, x1: 1540 }, rowh: 3.3, panels: [86, 404], stepsX: 48,
  axisY: 640, ticks: [0, 2, 4, 6, 8, 10, 12, 14], clock: [150, 694], clockX: 220,
  legend: { x: 670, y: 682, step: 140 },
  metrics: { y: 342, cells: [[0, 150], [420, 520], [760, 920]] as const },
  dev: [1540, 716] as const,
};
const TALL = {
  vb: { w: TALL_W, h: 1060 }, ax: { x0: 70, x1: 576 }, rowh: 2.9, panels: [96, 404], stepsX: 0,
  axisY: 610, ticks: [0, 4, 8, 12], clock: [24, 668], clockX: 230,
  legend: { x: 24, y: 708, step: 140 },
  metrics: { y: 800, cells: [[24, 24], [24, 24], [24, 24]] as const },
  dev: [24, 1040] as const,
};
const KEYS = [["colocated", "COLOCATED · BARRIER PER STEP", FLEET.colocated], ["elastic", "ELASTIC CELLS · ROLE PER GPU", FLEET.elastic]] as const;

export function PolicyFleet({ active, mode, clock, tall }: RoomProps) {
  const L = tall ? TALL : WIDE;
  const tr = useTr();
  const canvas = useRef<HTMLCanvasElement>(null);
  const vals = useRef<Record<string, SVGTextElement | null>>({});
  const tok = useRef<Tokens | null>(null);
  const X = useCallback((m: number) => L.ax.x0 + (m / FLEET.span) * (L.ax.x1 - L.ax.x0), [L]);

  const draw = useCallback((t: number) => {
    const el = canvas.current;
    if (!el) return;
    const T = (tok.current ??= readTokens(el));
    const ctx = fitCanvas(el, L.vb.w, L.vb.h);
    const now = FLEET.span * ease.sine(prog(t, 300, SWEEP));
    const colour: Record<Segment["kind"], string> = {
      rollout: `rgba(${T.roseRgb},0.85)`,
      train: `rgba(${T.cyanRgb},0.85)`,
      sync: `rgba(${T.amberRgb},0.95)`,
      idle: `rgba(${T.inkRgb},0.07)`,
    };
    const steps = [0, 0];
    KEYS.forEach(([, , data], pi) => {
      const top = L.panels[pi];
      for (const s of data.segs) {
        if (s.start > now || s.start > FLEET.span) continue;
        const end = Math.min(s.end, now, FLEET.span);
        const y = top + s.gpu * L.rowh;
        ctx.fillStyle = colour[s.kind];
        ctx.fillRect(X(s.start), y, Math.max(0.6, X(end) - X(s.start)), L.rowh - 0.9);
        if (s.kind === "idle") {
          ctx.fillStyle = `rgba(${T.redRgb},0.22)`;
          ctx.fillRect(X(s.start), y + L.rowh - 2, Math.max(0.6, X(end) - X(s.start)), 1);
        }
      }
      data.stepEnds.forEach((e) => {
        if (e > now || e > FLEET.span) return;
        steps[pi]++;
        ctx.fillStyle = `rgba(${T.inkRgb},0.5)`;
        ctx.fillRect(X(e), top - 10, 1.2, GPUS * L.rowh + 14);
      });
      ctx.fillStyle = `rgba(${T.inkRgb},0.85)`;
      ctx.fillRect(X(now), top - 14, 1.5, GPUS * L.rowh + 22);
    });
    const set = (k: string, s: string) => { const e = vals.current[k]; if (e && e.textContent !== s) e.textContent = s; };
    set("clock", `${fmt(now, 2)} min`);
    set("stepsA", `${steps[0]}`);
    set("stepsB", `${steps[1]}`);
    const done = ease.out(prog(t, SWEEP, SWEEP + 900));
    set("step", done > 0 ? `${fmt(FLEET.stepA)} → ${fmt(FLEET.stepB)}` : "");
    set("busy", done > 0 ? `${Math.round(FLEET.utilA * 100)}% → ${Math.round(FLEET.utilB * 100)}%` : "");
    set("ratio", done > 0 ? `${(FLEET.stepA / FLEET.stepB).toFixed(2)}×` : "");
  }, [L, X]);
  useSceneFrame(active, clock.readTime, draw);
  useEffect(() => { tok.current = null; }, [mode]);

  const metric = [["step", "STEP TIME · MIN"], ["busy", "GPU BUSY"], ["ratio", "RL STEPS / HOUR"]] as const;
  return (
    <Surface ref={canvas} vb={L.vb} label="Sixty-four GPUs over fourteen minutes: colocated scheduling completes four RL steps, elastic cells complete seven">
      {KEYS.map(([key, label], i) => {
        const top = L.panels[i];
        return (
          <g key={key}>
            <text x={tall ? 24 : L.ax.x0} y={top - 24} className="ex-m">{tr(tall ? (i ? "ELASTIC CELLS" : "COLOCATED") : label)}</text>
            <text x={L.ax.x0 - (tall ? 8 : 16)} y={top + 10} className="ex-ann" textAnchor="end">{tall ? "0" : "gpu 0"}</text>
            <text x={L.ax.x0 - (tall ? 8 : 16)} y={top + GPUS * L.rowh} className="ex-ann" textAnchor="end">{tall ? "63" : "gpu 63"}</text>
            <text x={L.ax.x1 - (tall ? 40 : L.stepsX)} y={top - 24} className="ex-m" textAnchor="end">{tr("STEPS DONE")}</text>
            <text ref={(e) => { vals.current[i ? "stepsB" : "stepsA"] = e; }} x={L.ax.x1} y={top - 22} className="ex-num-l" textAnchor="end" style={{ fontSize: 28, fill: i ? "var(--ex-rose)" : "var(--ex-ink-2)" }} />
          </g>
        );
      })}
      <path d={`M${L.ax.x0} ${L.axisY}H${L.ax.x1}`} stroke="var(--ex-line-2)" />
      {L.ticks.map((m) => m <= FLEET.span && <text key={m} x={X(m)} y={L.axisY + 22} className="ex-ann" textAnchor="middle">{m}</text>)}
      <text x={L.clock[0]} y={L.clock[1]} className="ex-m">{tr("WALL CLOCK · MIN")}</text>
      <text ref={(e) => { vals.current.clock = e; }} x={L.clock[0] + L.clockX} y={L.clock[1]} className="ex-m-ink" />
      <g transform={`translate(${L.legend.x} ${L.legend.y})`}>
        {[["rollout", "var(--ex-rose)"], ["train", "var(--ex-cyan)"], ["weight sync", "var(--ex-amber)"], ["idle", "rgba(255,129,118,.6)"]].map(([l, c], i) => (
          <g key={l} transform={tall ? `translate(${(i % 2) * 280} ${Math.floor(i / 2) * 30})` : `translate(${i * L.legend.step} 0)`}>
            <rect y={2} width={12} height={12} rx={3} fill={c} /><text x={20} y={13} className="ex-m">{tr(l)}</text>
          </g>
        ))}
      </g>
      {tall ? (
        <g transform={`translate(24 ${L.metrics.y})`}>
          {metric.map(([key, label], i) => (
            <g key={key} transform={`translate(0 ${i * 70})`}>
              <text className="ex-m">{tr(label)}</text>
              <text ref={(e) => { vals.current[key] = e; }} y={34} className="ex-num-l" style={{ fontSize: 30, fill: key === "ratio" ? "var(--ex-rose)" : undefined }} />
            </g>
          ))}
        </g>
      ) : (
        <g transform={`translate(150 ${L.metrics.y})`}>
          {metric.map(([key, label], i) => {
            const [lx, vx] = L.metrics.cells[i];
            return (
              <g key={key}>
                <text x={lx} className="ex-m">{tr(label)}</text>
                <text ref={(e) => { vals.current[key] = e; }} x={vx} className="ex-m-ink" style={key === "ratio" ? { fill: "var(--ex-rose)" } : undefined} />
              </g>
            );
          })}
        </g>
      )}
      {mode === "dev" && (
        <text x={L.dev[0]} y={L.dev[1]} className="ex-ann" textAnchor={tall ? "start" : "end"}>
          {tall ? `p90 2.56 · max 3.33 min · switch ${SWITCH} · sync ${SYNC}` : `long-tail rollouts p50 1.05 · p90 2.56 · max 3.33 min · role switch ${SWITCH} · sync ${SYNC} min · staleness ≤ 1 step · after QwenGyre`}
        </text>
      )}
    </Surface>
  );
}
