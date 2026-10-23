"use client";

import { useCallback, useEffect, useRef } from "react";
import { attrs, ease, fitCanvas, prog, readTokens, useSceneFrame, type Tokens } from "../engine";
import { useTr } from "../i18n";
import type { RoomProps } from "../shell";
import { FAMILY_NAMES, PATH, flips } from "./data";
import { Surface, TALL_W, VB } from "./parts";

/* P7 · every checkpoint against every task: five states, four transitions, every regression named. */

const TRANS = PATH.slice(1).map((c, k) => ({ from: PATH[k], to: c, ...flips(PATH[k], c) }));
const REGRESSIONS = TRANS.flatMap((tr, k) => tr.lost.map((task) => ({ task, k })));
const GAINED = TRANS.reduce((a, tr) => a + tr.gained.length, 0);
const T_ROWS = 600, T_FLIPS = 4200, T_REG = 7000;

type Layout = {
  vb: { w: number; h: number }; cw: number; rh: number; labelX: number;
  x: (i: number) => number; y: (r: number, i: number) => number;
  fam: (b: number) => [number, number]; rows: number[]; end: number;
};
const WIDE: Layout = {
  vb: VB, cw: 13.6, rh: 34, labelX: 178,
  x: (i) => 196 + i * 13.6 + Math.floor(i / 32) * 14,
  y: (r) => 76 + r * 68,
  fam: (b) => [196 + b * 32 * 13.6 + b * 14, 54], rows: [0], end: 196 + 96 * 13.6 + 2 * 14 + 12,
};
const TALL: Layout = {
  vb: { w: TALL_W, h: 1230 }, cw: 15, rh: 22, labelX: 86,
  x: (i) => 96 + (i % 32) * 15,
  y: (r, i) => 84 + Math.floor(i / 32) * 268 + r * 44,
  fam: (b) => [96, 66 + b * 268], rows: [0, 32, 64], end: 0,
};

export function PolicyAudit({ active, mode, clock, tall }: RoomProps) {
  const L = tall ? TALL : WIDE;
  const tr = useTr();
  const canvas = useRef<HTMLCanvasElement>(null);
  const marks = useRef<(SVGGElement | null)[]>([]);
  const counts = useRef<(SVGGElement | null)[]>([]);
  const tok = useRef<Tokens | null>(null);

  const draw = useCallback((t: number) => {
    const el = canvas.current;
    if (!el) return;
    const T = (tok.current ??= readTokens(el));
    const ctx = fitCanvas(el, L.vb.w, L.vb.h);
    const { cw, rh } = L;
    PATH.forEach((ck, r) => {
      const reveal = ease.out(prog(t, T_ROWS + r * 600, T_ROWS + r * 600 + 900));
      for (let i = 0; i < 96; i++) {
        if (i / 96 > reveal) break;
        ctx.fillStyle = ck.solved[i] ? `rgba(${T.roseRgb},0.72)` : `rgba(${T.inkRgb},0.08)`;
        ctx.fillRect(L.x(i), L.y(r, i), cw - 3, rh - 6);
      }
    });
    TRANS.forEach((t2, k) => {
      const p = ease.out(prog(t, T_FLIPS + k * 500, T_FLIPS + k * 500 + 800));
      t2.gained.forEach((i) => {
        const y = L.y(k, i) + rh - 2;
        ctx.fillStyle = `rgba(${T.roseRgb},${(0.95 * p).toFixed(3)})`;
        ctx.fillRect(L.x(i) + (cw - 3) / 2 - 1.5, y + rh * (1 - p), 3, rh * p);
      });
      t2.lost.forEach((i) => {
        const y = L.y(k, i) + rh - 2;
        ctx.fillStyle = `rgba(${T.redRgb},${p.toFixed(3)})`;
        ctx.fillRect(L.x(i) - 1, y, cw - 1, 5 * p);
        ctx.fillRect(L.x(i) + (cw - 3) / 2 - 1.5, y, 3, rh * p);
      });
      attrs(counts.current[k], { opacity: p });
    });
    const rp = ease.out(prog(t, T_REG, T_REG + 900));
    marks.current.forEach((m) => attrs(m, { opacity: rp }));
  }, [L]);
  useSceneFrame(active, clock.readTime, draw);
  useEffect(() => { tok.current = null; }, [mode]);

  const famLabel = (i: number) => {
    const n = FAMILY_NAMES[Math.floor(i / 32)], z = tr(n);
    return z === n ? n.split(" ")[0].toLowerCase() : z;
  };
  const short = (s: string) => tr(s);
  return (
    <Surface ref={canvas} vb={L.vb} label="Paired audit of 96 tasks across five checkpoints: 59 gains and 5 regressions">
      {L.rows.map((first) => PATH.map((ck, r) => (
        <g key={`${first}-${ck.key}`}>
          <text x={L.labelX} y={L.y(r, first) + (tall ? 14 : 21)} className="ex-node" textAnchor="end">{short(ck.short)}</text>
          {!tall && <text x={L.end} y={L.y(r, first) + 21} className="ex-m-ink">{ck.correct}</text>}
        </g>
      )))}
      {!tall && TRANS.map((t2, k) => (
        <g key={k} ref={(e) => { counts.current[k] = e; }} opacity={0} transform={`translate(${L.end} ${L.y(k, 0) + L.rh + 22})`}>
          <text className="ex-ann-acc">+{t2.gained.length}</text>
          {t2.lost.length > 0 && <text x={42} className="ex-ann" style={{ fill: "var(--ex-red)" }}>−{t2.lost.length}</text>}
        </g>
      ))}
      {FAMILY_NAMES.map((n, b) => <text key={n} x={L.fam(b)[0]} y={L.fam(b)[1]} className="ex-m">{tr(n.toUpperCase())}</text>)}
      {REGRESSIONS.map(({ task, k }, j) => {
        const x = L.x(task) + (L.cw - 3) / 2, cy = L.y(k + 1, task) + (L.rh - 6) / 2;
        const label = `#${task} ${famLabel(task)} · ${short(PATH[k].short)}→${short(PATH[k + 1].short)}`;
        if (tall) {
          return (
            <g key={`${task}-${k}`} ref={(e) => { marks.current[j] = e; }} opacity={0}>
              <circle cx={x} cy={cy} r={8} fill="none" stroke="var(--ex-red)" strokeWidth={1.6} />
              <text x={24} y={1080 + j * 28} className="ex-ann" style={{ fill: "var(--ex-red)" }}>{label}</text>
            </g>
          );
        }
        const y0 = L.y(k + 1, task) + L.rh - 6, y1 = 430 + (j % 2) * 22;
        return (
          <g key={`${task}-${k}`} ref={(e) => { marks.current[j] = e; }} opacity={0}>
            <circle cx={x} cy={cy} r={9} fill="none" stroke="var(--ex-red)" strokeWidth={1.6} />
            <path d={`M${x} ${y0 + 2}V${y1}`} stroke="var(--ex-red)" strokeOpacity={0.6} strokeDasharray="2 3" />
            <text x={x} y={y1 + 18} className="ex-ann" textAnchor="middle" style={{ fill: "var(--ex-red)" }}>{label}</text>
          </g>
        );
      })}
      {tall ? (
        <g transform="translate(24 900)">
          {TRANS.map((t2, k) => (
            <g key={k} ref={(e) => { counts.current[k] = e; }} opacity={0} transform={`translate(${(k % 2) * 290} ${Math.floor(k / 2) * 34})`}>
              <text className="ex-m">{short(t2.from.short)}→{short(t2.to.short)}</text>
              <text x={170} className="ex-ann-acc">+{t2.gained.length}</text>
              {t2.lost.length > 0 && <text x={220} className="ex-ann" style={{ fill: "var(--ex-red)" }}>−{t2.lost.length}</text>}
            </g>
          ))}
          <g transform="translate(0 104)">
            <text className="ex-m">{tr("GAINED")}</text>
            <text x={110} className="ex-m-ink" style={{ fill: "var(--ex-rose)" }}>{GAINED}</text>
            <text x={190} className="ex-m">{tr("REGRESSED")}</text>
            <text x={330} className="ex-m-ink" style={{ fill: "var(--ex-red)" }}>{REGRESSIONS.length}</text>
            <text x={400} className="ex-m">{tr("NET")}</text>
            <text x={460} className="ex-m-ink">28→82</text>
          </g>
        </g>
      ) : (
        <g transform="translate(196 668)">
          <text className="ex-m">{tr("GAINED")}</text>
          <text x={90} className="ex-m-ink" style={{ fill: "var(--ex-rose)" }}>{GAINED}</text>
          <text x={180} className="ex-m">{tr("REGRESSED")}</text>
          <text x={300} className="ex-m-ink" style={{ fill: "var(--ex-red)" }}>{REGRESSIONS.length}</text>
          <text x={390} className="ex-m">{tr("NET")}</text>
          <text x={440} className="ex-m-ink">28 → 82</text>
          {mode === "dev" && <text x={620} className="ex-ann">same 96 held-out tasks · same verifier · pass@1 · flips counted per task id, not by score</text>}
        </g>
      )}
    </Surface>
  );
}
