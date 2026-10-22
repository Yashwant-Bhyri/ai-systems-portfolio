"use client";

import { useCallback, useEffect, useRef } from "react";
import { attrs, ease, fitCanvas, prog, readTokens, useSceneFrame, type Tokens } from "../engine";
import type { RoomProps } from "../shell";
import { FAMILY_NAMES, PATH, flips } from "./data";
import { Surface, VB } from "./parts";

/* P7 · every checkpoint against every task: five states, four transitions, every regression named. */

const CW = 13.6, X0 = 196, ROWS_Y = 76, RH = 34, GAP_F = 14;
const cx = (i: number) => X0 + i * CW + Math.floor(i / 32) * GAP_F;
const TRANS = PATH.slice(1).map((c, k) => ({ from: PATH[k], to: c, ...flips(PATH[k], c) }));
const REGRESSIONS = TRANS.flatMap((tr, k) => tr.lost.map((task) => ({ task, k })));
const T_ROWS = 600, T_FLIPS = 4200, T_REG = 7000;

export function PolicyAudit({ active, mode, clock }: RoomProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const marks = useRef<(SVGGElement | null)[]>([]);
  const counts = useRef<(SVGGElement | null)[]>([]);
  const tok = useRef<Tokens | null>(null);

  const draw = useCallback((t: number) => {
    const el = canvas.current;
    if (!el) return;
    const T = (tok.current ??= readTokens(el));
    const ctx = fitCanvas(el, VB.w, VB.h);
    // five solved-state rows
    PATH.forEach((ck, r) => {
      const reveal = ease.out(prog(t, T_ROWS + r * 600, T_ROWS + r * 600 + 900));
      for (let i = 0; i < 96; i++) {
        if (i / 96 > reveal) break;
        ctx.fillStyle = ck.solved[i] ? `rgba(${T.roseRgb},0.72)` : `rgba(${T.inkRgb},0.08)`;
        ctx.fillRect(cx(i), ROWS_Y + r * RH * 2, CW - 3, RH - 6);
      }
    });
    // transitions between rows: gains rise, regressions drop
    TRANS.forEach((tr, k) => {
      const p = ease.out(prog(t, T_FLIPS + k * 500, T_FLIPS + k * 500 + 800));
      const y = ROWS_Y + k * RH * 2 + RH - 2;
      tr.gained.forEach((i) => {
        ctx.fillStyle = `rgba(${T.roseRgb},${(0.95 * p).toFixed(3)})`;
        ctx.fillRect(cx(i) + (CW - 3) / 2 - 1.5, y + RH * (1 - p), 3, RH * p);
      });
      tr.lost.forEach((i) => {
        ctx.fillStyle = `rgba(${T.redRgb},${p.toFixed(3)})`;
        ctx.fillRect(cx(i) - 1, y, CW - 1, 5 * p);
        ctx.fillRect(cx(i) + (CW - 3) / 2 - 1.5, y, 3, RH * p);
      });
      attrs(counts.current[k], { opacity: p });
    });
    // name every regression
    const rp = ease.out(prog(t, T_REG, T_REG + 900));
    marks.current.forEach((m) => attrs(m, { opacity: rp }));
  }, []);
  useSceneFrame(active, clock.readTime, draw);
  useEffect(() => { tok.current = null; }, [mode]);

  const famLabel = (i: number) => FAMILY_NAMES[Math.floor(i / 32)].split(" ")[0].toLowerCase();
  return (
    <Surface ref={canvas} label="Paired audit of 96 tasks across five checkpoints: 59 gains and 5 regressions">
      {PATH.map((ck, r) => (
        <g key={ck.key}>
          <text x={X0 - 18} y={ROWS_Y + r * RH * 2 + 21} className="ex-node" textAnchor="end">{ck.short}</text>
          <text x={X0 + 96 * CW + 2 * GAP_F + 12} y={ROWS_Y + r * RH * 2 + 21} className="ex-m-ink">{ck.correct}</text>
        </g>
      ))}
      {TRANS.map((tr, k) => (
        <g key={k} ref={(e) => { counts.current[k] = e; }} opacity={0} transform={`translate(${X0 + 96 * CW + 2 * GAP_F + 12} ${ROWS_Y + k * RH * 2 + RH + 22})`}>
          <text className="ex-ann-acc">+{tr.gained.length}</text>
          {tr.lost.length > 0 && <text x={42} className="ex-ann" style={{ fill: "var(--ex-red)" }}>−{tr.lost.length}</text>}
        </g>
      ))}
      {FAMILY_NAMES.map((n, b) => <text key={n} x={cx(b * 32)} y={ROWS_Y - 22} className="ex-m">{n.toUpperCase()}</text>)}
      {REGRESSIONS.map(({ task, k }, j) => {
        const x = cx(task) + (CW - 3) / 2, y0 = ROWS_Y + (k + 1) * RH * 2 + RH - 6, y1 = 430 + (j % 2) * 22;
        return (
          <g key={`${task}-${k}`} ref={(e) => { marks.current[j] = e; }} opacity={0}>
            <circle cx={x} cy={y0 - (RH - 6) / 2} r={9} fill="none" stroke="var(--ex-red)" strokeWidth={1.6} />
            <path d={`M${x} ${y0 + 2}V${y1}`} stroke="var(--ex-red)" strokeOpacity={0.6} strokeDasharray="2 3" />
            <text x={x} y={y1 + 18} className="ex-ann" textAnchor="middle" style={{ fill: "var(--ex-red)" }}>
              #{task} {famLabel(task)} · {PATH[k].short}→{PATH[k + 1].short}
            </text>
          </g>
        );
      })}
      <g transform="translate(196 668)">
        <text className="ex-m">GAINED</text>
        <text x={90} className="ex-m-ink" style={{ fill: "var(--ex-rose)" }}>{TRANS.reduce((a, tr) => a + tr.gained.length, 0)}</text>
        <text x={180} className="ex-m">REGRESSED</text>
        <text x={300} className="ex-m-ink" style={{ fill: "var(--ex-red)" }}>{REGRESSIONS.length}</text>
        <text x={390} className="ex-m">NET</text>
        <text x={440} className="ex-m-ink">28 → 82</text>
        {mode === "dev" && <text x={620} className="ex-ann">same 96 held-out tasks · same verifier · pass@1 · flips counted per task id, not by score</text>}
      </g>
    </Surface>
  );
}
