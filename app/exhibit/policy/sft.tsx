"use client";

import { useCallback, useEffect, useRef } from "react";
import { ease, fitCanvas, fmt, lerp, prog, readTokens, rng, useSceneFrame, type Tokens } from "../engine";
import { useTr } from "../i18n";
import type { RoomProps } from "../shell";
import { CK, LORA, flips } from "./data";
import { Surface, TALL_W, TaskField, VB, type FieldHandle } from "./parts";

/* P2 · supervised traces shape a low-rank adapter on frozen weights; 18 tasks flip. */

const N = 32;
const STAGES = ["read", "decompose", "solve", "check"] as const;
const f = flips(CK.base, CK.sft);
const gained = new Set(f.gained);
const u = Array.from({ length: N }, (_, i) => Math.sin(i * 0.61) * 0.7 + Math.sin(i * 1.9 + 1) * 0.3);
const v = Array.from({ length: N }, (_, j) => Math.cos(j * 0.47) * 0.6 + Math.cos(j * 1.3 + 2) * 0.4);
const u2 = Array.from({ length: N }, (_, i) => Math.cos(i * 0.33 + 0.5));
const v2 = Array.from({ length: N }, (_, j) => Math.sin(j * 0.29 + 1.4));
const trace = (() => {
  const r = rng(77);
  return STAGES.map(() => Array.from({ length: 5 }, () => 6 + Math.floor(r() * 18)));
})();
const T_IN = 1400, T_BLADE = 3600, T_FLIP = 6600, T_END = 9200;

const WIDE = {
  vb: VB,
  w: { x: 430, y: 60, cell: 11, gap: 2 },
  trace: { x: 40, y: 108, stage: 112, row: 14, step: 12, cell: 9, label: -8, from: 360 },
  field: { x: 1000, y: 96, cell: 26, gap: 6 },
  read: { x: 1000, y: 470, col: 300, delta: 190, row: 92 },
  lora: { dy: 76, cols: [0, 170, 340] },
  dev: { eq: 160, ann: [1000, 640] },
};
const TALL = {
  vb: { w: TALL_W, h: 1110 },
  w: { x: 24, y: 70, cell: 8, gap: 2 },
  trace: { x: 410, y: 98, stage: 84, row: 12, step: 7, cell: 5, label: -8, from: 404 },
  field: { x: 52, y: 590, cell: 26, gap: 5 },
  read: { x: 24, y: 880, col: 330, delta: 190, row: 92 },
  lora: { dy: 70, cols: [0, 176, 356] },
  dev: { eq: 1040, ann: [24, 1096] },
};

export function PolicySft({ active, mode, clock, tall }: RoomProps) {
  const L = tall ? TALL : WIDE;
  const W = L.w, SIDE = N * (W.cell + W.gap) - W.gap;
  const tr = useTr();
  const canvas = useRef<HTMLCanvasElement>(null);
  const field = useRef<FieldHandle>(null);
  const vals = useRef<Record<string, SVGTextElement | null>>({});
  const tok = useRef<Tokens | null>(null);

  const draw = useCallback((t: number) => {
    const el = canvas.current;
    if (!el) return;
    const T = (tok.current ??= readTokens(el));
    const ctx = fitCanvas(el, L.vb.w, L.vb.h);
    const tc = L.trace;

    // the reasoning trace: four stages of tokens streaming into the layer
    STAGES.forEach((_, s) => {
      trace[s].forEach((len, row) => {
        const y = tc.y + s * tc.stage + row * tc.row;
        const reveal = prog(t, 300 + s * 260 + row * 60, 900 + s * 260 + row * 60);
        for (let c = 0; c < len; c++) {
          if (c / len > reveal) break;
          ctx.fillStyle = `rgba(${T.inkRgb},${0.18 + 0.5 * ((c * 7 + row * 3 + s) % 5) / 5})`;
          ctx.fillRect(tc.x + c * tc.step, y, tc.cell + (tall ? 0 : 0), tc.cell);
        }
      });
    });
    for (let k = 0; k < 28; k++) {
      const p = ((t - T_IN) / 1600 + k / 28) % 1;
      if (t < T_IN || t > T_FLIP + 600) break;
      const lane = k % 4;
      const x0 = tall ? tc.from : tc.from, x1 = tall ? W.x + SIDE + 6 : W.x - 6;
      const y0 = tc.y + 30 + lane * tc.stage, y1 = W.y + SIDE / 2 + (lane - 1.5) * (tall ? 40 : 60);
      ctx.fillStyle = `rgba(${T.roseRgb},${(Math.sin(Math.PI * p) * 0.9).toFixed(3)})`;
      ctx.fillRect(lerp(x0, x1, ease.sine(p)), lerp(y0, y1, ease.sine(p)), 6, 6);
    }

    // W, frozen; ΔW = B·A projected as light
    const amp = ease.out(prog(t, T_BLADE + 400, T_BLADE + 2600));
    const pulse = t > T_BLADE && t < T_FLIP ? 0.25 * Math.max(0, Math.sin(t / 220)) : 0;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const base = 0.1 + 0.06 * Math.sin(i * 2.3 + j * 1.1);
        const dw = (u[i] * v[j] + 0.6 * u2[i] * v2[j]) * amp;
        const a = Math.min(0.97, base + Math.abs(dw) * (0.75 + pulse));
        ctx.fillStyle = dw > 0.05 ? `rgba(${T.roseRgb},${a.toFixed(3)})` : dw < -0.05 ? `rgba(${T.cyanRgb},${(base + Math.abs(dw) * 0.5).toFixed(3)})` : `rgba(${T.inkRgb},${base.toFixed(3)})`;
        ctx.fillRect(W.x + j * (W.cell + W.gap), W.y + i * (W.cell + W.gap), W.cell, W.cell);
      }
    }
    // the blades: B (32 × r) slides down, A (r × 32) slides in, at true proportion
    const slide = ease.out(prog(t, T_BLADE, T_BLADE + 900));
    const glow = 0.45 + 0.4 * Math.max(0, Math.sin(t / 220)) * (t < T_FLIP ? 1 : 0.3);
    ctx.fillStyle = `rgba(${T.roseRgb},${(glow * slide).toFixed(3)})`;
    const pitch = W.cell + W.gap + 2;
    for (let i = 0; i < N; i++) for (let r = 0; r < 2; r++) {
      ctx.fillRect(W.x + SIDE + 22 + r * pitch, W.y + (i * (W.cell + W.gap)) * slide, W.cell, W.cell);
      ctx.fillRect(W.x + (i * (W.cell + W.gap)) * slide, W.y + SIDE + 22 + r * pitch, W.cell, W.cell);
    }

    const fp = prog(t, T_FLIP, T_FLIP + 1800);
    let solved = 0;
    field.current?.paint((i) => {
      const flipped = gained.has(i) && fp > f.gained.indexOf(i) / f.gained.length;
      if (flipped) { solved++; return "gained"; }
      if (CK.base.solved[i]) { solved++; return "on"; }
      return "off";
    }, T, T.rose, () => prog(t, T_FLIP + 1800, T_END));
    const c = ease.out(prog(t, T_FLIP, T_FLIP + 1800));
    const set = (k: string, s: string) => { const e = vals.current[k]; if (e && e.textContent !== s) e.textContent = s; };
    set("solved", `${solved} / 96`);
    set("delta", solved > CK.base.correct ? `+${solved - CK.base.correct}` : "");
    // pass@1 follows the solved count exactly; per-task costs switch once the flips land.
    set("pass", `${fmt((100 * solved) / 96, 1)}%`);
    set("cost", fmt(c >= 0.999 ? CK.sft.costPerTask : CK.base.costPerTask));
    set("tok", Math.round(c >= 0.999 ? CK.sft.tokensPerTask : CK.base.tokensPerTask).toLocaleString("en-US"));
  }, [L, W, SIDE, tall]);
  useSceneFrame(active, clock.readTime, draw);
  useEffect(() => { tok.current = null; }, [mode]);

  const R = L.read;
  return (
    <Surface ref={canvas} vb={L.vb} label="Reasoning traces train a rank-16 adapter on frozen weights; 18 more tasks pass">
      <text x={L.trace.x} y={L.trace.y - 38} className="ex-m">{tr(tall ? "SFT TRACES" : "SFT TRACES · VERIFIED")}</text>
      {STAGES.map((s, i) => <text key={s} x={L.trace.x} y={L.trace.y + i * L.trace.stage + L.trace.label} className="ex-node">{tr(s)}</text>)}
      <text x={W.x} y={W.y - 24} className="ex-m">{tr("W · FROZEN · ΔW = B·A")}</text>
      <rect x={W.x - 8} y={W.y - 8} width={SIDE + 16} height={SIDE + 16} rx={6} fill="none" stroke="var(--ex-line-2)" />
      <text x={W.x + SIDE + 32} y={W.y - 24} className="ex-m" textAnchor="middle">B</text>
      <text x={tall ? W.x + SIDE + 8 : W.x - 22} y={W.y + SIDE + 36} className="ex-m" textAnchor={tall ? "start" : "middle"}>A</text>
      <g transform={`translate(${W.x} ${W.y + SIDE + L.lora.dy})`}>
        <text x={L.lora.cols[0]} className="ex-m">{tr("TRAINABLE")}</text>
        <text x={L.lora.cols[0]} y={34} className="ex-num-l">{(LORA.trainable / 1e6).toFixed(1)}M</text>
        <text x={L.lora.cols[1]} className="ex-m">{tr("OF")}</text>
        <text x={L.lora.cols[1]} y={34} className="ex-num-l" style={{ fill: "var(--ex-ink-3)" }}>4.02B</text>
        <text x={L.lora.cols[2]} className="ex-m">{tr("SHARE")}</text>
        <text x={L.lora.cols[2]} y={34} className="ex-num-l" style={{ fill: "var(--ex-rose)" }}>{(LORA.share * 100).toFixed(2)}%</text>
      </g>
      <text x={L.field.x} y={L.field.y - 44} className="ex-m">{tr("EVAL · BASE → SFT")}</text>
      <TaskField ref={field} x={L.field.x} y={L.field.y} cell={L.field.cell} gap={L.field.gap} />
      <g transform={`translate(${R.x} ${R.y})`}>
        <text className="ex-m">{tr("SOLVED")}</text>
        <text ref={(e) => { vals.current.solved = e; }} y={40} className="ex-num-l" />
        <text ref={(e) => { vals.current.delta = e; }} x={R.delta} y={40} className="ex-num-l" style={{ fill: "var(--ex-rose)" }} />
        <text x={R.col} className="ex-m">PASS@1</text>
        <text ref={(e) => { vals.current.pass = e; }} x={R.col} y={40} className="ex-num-l" />
        <text y={R.row} className="ex-m">{tr("GPU-S / TASK")}</text>
        <text ref={(e) => { vals.current.cost = e; }} y={R.row + 34} className="ex-num-l" style={{ fontSize: 26 }} />
        <text x={R.col} y={R.row} className="ex-m">{tr("TOKENS / TASK")}</text>
        <text ref={(e) => { vals.current.tok = e; }} x={R.col} y={R.row + 34} className="ex-num-l" style={{ fontSize: 26 }} />
      </g>
      {mode === "dev" && (
        <g>
          <text x={W.x} y={tall ? L.dev.eq : W.y + SIDE + L.dev.eq} className="ex-eq">r = {LORA.r} · q k v o gate up down · 36 layers</text>
          <text x={W.x} y={(tall ? L.dev.eq : W.y + SIDE + L.dev.eq) + 24} className="ex-eq">L = −Σ log π(y_t | x, y_&lt;t)</text>
          <text x={L.dev.ann[0]} y={L.dev.ann[1]} className="ex-ann">+{f.gained.length} {tr("gained")} · −{f.lost.length} {tr("regressed")}</text>
        </g>
      )}
    </Surface>
  );
}
