"use client";

import { useCallback, useEffect, useRef } from "react";
import { ease, fitCanvas, fmt, lerp, prog, readTokens, rng, useSceneFrame, type Tokens } from "../engine";
import type { RoomProps } from "../shell";
import { CK, LORA, flips } from "./data";
import { Surface, TaskField, VB, type FieldHandle } from "./parts";

/* P2 · supervised traces shape a low-rank adapter on frozen weights; 18 tasks flip. */

const W = { x: 430, y: 60, n: 32, cell: 11, gap: 2 };
const SIDE = W.n * (W.cell + W.gap) - W.gap;
const FIELD = { x: 1000, y: 96 };
const STAGES = ["read", "decompose", "solve", "check"] as const;
const f = flips(CK.base, CK.sft);
const gained = new Set(f.gained);
const u = Array.from({ length: W.n }, (_, i) => Math.sin(i * 0.61) * 0.7 + Math.sin(i * 1.9 + 1) * 0.3);
const v = Array.from({ length: W.n }, (_, j) => Math.cos(j * 0.47) * 0.6 + Math.cos(j * 1.3 + 2) * 0.4);
const u2 = Array.from({ length: W.n }, (_, i) => Math.cos(i * 0.33 + 0.5));
const v2 = Array.from({ length: W.n }, (_, j) => Math.sin(j * 0.29 + 1.4));
const trace = (() => {
  const r = rng(77);
  return STAGES.map(() => Array.from({ length: 5 }, () => 6 + Math.floor(r() * 18)));
})();
const T_IN = 1400, T_BLADE = 3600, T_FLIP = 6600, T_END = 9200;

export function PolicySft({ active, mode, clock }: RoomProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const field = useRef<FieldHandle>(null);
  const vals = useRef<Record<string, SVGTextElement | null>>({});
  const tok = useRef<Tokens | null>(null);

  const draw = useCallback((t: number) => {
    const el = canvas.current;
    if (!el) return;
    const T = (tok.current ??= readTokens(el));
    const ctx = fitCanvas(el, VB.w, VB.h);

    // the reasoning trace: four stages of tokens, streaming right into the layer
    STAGES.forEach((_, s) => {
      trace[s].forEach((len, row) => {
        const y = 108 + s * 112 + row * 14;
        const reveal = prog(t, 300 + s * 260 + row * 60, 900 + s * 260 + row * 60);
        for (let c = 0; c < len; c++) {
          if (c / len > reveal) break;
          ctx.fillStyle = `rgba(${T.inkRgb},${0.18 + 0.5 * ((c * 7 + row * 3 + s) % 5) / 5})`;
          ctx.fillRect(40 + c * 12, y, 9, 9);
        }
      });
    });
    // tokens travelling into W
    for (let k = 0; k < 28; k++) {
      const p = ((t - T_IN) / 1600 + k / 28) % 1;
      if (t < T_IN || t > T_FLIP + 600) break;
      const lane = k % 4;
      const x = lerp(360, W.x - 6, ease.sine(p)), y = lerp(150 + lane * 112, W.y + SIDE / 2 + (lane - 1.5) * 60, ease.sine(p));
      ctx.fillStyle = `rgba(${T.roseRgb},${(Math.sin(Math.PI * p) * 0.9).toFixed(3)})`;
      ctx.fillRect(x, y, 6, 6);
    }

    // W, frozen; ΔW = B·A projected as light
    const amp = ease.out(prog(t, T_BLADE + 400, T_BLADE + 2600));
    const pulse = t > T_BLADE && t < T_FLIP ? 0.25 * Math.max(0, Math.sin(t / 220)) : 0;
    for (let i = 0; i < W.n; i++) {
      for (let j = 0; j < W.n; j++) {
        const base = 0.1 + 0.06 * Math.sin(i * 2.3 + j * 1.1);
        const dw = (u[i] * v[j] + 0.6 * u2[i] * v2[j]) * amp;
        const a = Math.min(0.97, base + Math.abs(dw) * (0.75 + pulse));
        ctx.fillStyle = dw > 0.05 ? `rgba(${T.roseRgb},${a.toFixed(3)})` : dw < -0.05 ? `rgba(${T.cyanRgb},${(base + Math.abs(dw) * 0.5).toFixed(3)})` : `rgba(${T.inkRgb},${base.toFixed(3)})`;
        ctx.fillRect(W.x + j * (W.cell + W.gap), W.y + i * (W.cell + W.gap), W.cell, W.cell);
      }
    }
    // the blades: B (32 × r) slides down, A (r × 32) slides in; drawn at true proportion
    const slide = ease.out(prog(t, T_BLADE, T_BLADE + 900));
    const glow = 0.45 + 0.4 * Math.max(0, Math.sin(t / 220)) * (t < T_FLIP ? 1 : 0.3);
    ctx.fillStyle = `rgba(${T.roseRgb},${(glow * slide).toFixed(3)})`;
    for (let i = 0; i < W.n; i++) for (let r = 0; r < 2; r++) {
      ctx.fillRect(W.x + SIDE + 22 + r * 13, W.y + (i * (W.cell + W.gap)) * slide, W.cell, W.cell);
      ctx.fillRect(W.x + (i * (W.cell + W.gap)) * slide, W.y + SIDE + 22 + r * 13, W.cell, W.cell);
    }

    // outcomes
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
    set("pass", `${fmt(lerp(CK.base.pass1, CK.sft.pass1, c), 1)}%`);
    set("cost", fmt(lerp(CK.base.costPerTask, CK.sft.costPerTask, c)));
    set("tok", Math.round(lerp(CK.base.tokensPerTask, CK.sft.tokensPerTask, c)).toLocaleString("en-US"));
  }, []);
  useSceneFrame(active, clock.readTime, draw);
  useEffect(() => { tok.current = null; }, [mode]);

  return (
    <Surface ref={canvas} label="Reasoning traces train a rank-16 adapter on frozen Qwen3-4B weights; 18 more tasks pass">
      <text x={40} y={70} className="ex-m">SFT TRACES · VERIFIED</text>
      {STAGES.map((s, i) => <text key={s} x={40} y={100 + i * 112} className="ex-node">{s}</text>)}
      <text x={W.x} y={W.y - 24} className="ex-m">W · FROZEN · ΔW = B·A</text>
      <rect x={W.x - 8} y={W.y - 8} width={SIDE + 16} height={SIDE + 16} rx={6} fill="none" stroke="var(--ex-line-2)" />
      <text x={W.x + SIDE + 40} y={W.y - 24} className="ex-m" textAnchor="middle">B</text>
      <text x={W.x - 22} y={W.y + SIDE + 36} className="ex-m" textAnchor="middle">A</text>
      <g transform={`translate(${W.x} ${W.y + SIDE + 76})`}>
        <text className="ex-m">TRAINABLE</text>
        <text y={34} className="ex-num-l">{(LORA.trainable / 1e6).toFixed(1)}M</text>
        <text x={170} className="ex-m">OF</text>
        <text x={170} y={34} className="ex-num-l" style={{ fill: "var(--ex-ink-3)" }}>4.02B</text>
        <text x={340} className="ex-m">SHARE</text>
        <text x={340} y={34} className="ex-num-l" style={{ fill: "var(--ex-rose)" }}>{(LORA.share * 100).toFixed(2)}%</text>
      </g>
      <text x={FIELD.x} y={FIELD.y - 44} className="ex-m">EVAL · BASE → SFT</text>
      <TaskField ref={field} x={FIELD.x} y={FIELD.y} cell={26} gap={6} />
      <g transform={`translate(${FIELD.x} 470)`}>
        <text className="ex-m">SOLVED</text>
        <text ref={(e) => { vals.current.solved = e; }} y={40} className="ex-num-l" />
        <text ref={(e) => { vals.current.delta = e; }} x={190} y={40} className="ex-num-l" style={{ fill: "var(--ex-rose)" }} />
        <text x={300} className="ex-m">PASS@1</text>
        <text ref={(e) => { vals.current.pass = e; }} x={300} y={40} className="ex-num-l" />
        <text y={92} className="ex-m">GPU-S / TASK</text>
        <text ref={(e) => { vals.current.cost = e; }} y={126} className="ex-num-l" style={{ fontSize: 26 }} />
        <text x={300} y={92} className="ex-m">TOKENS / TASK</text>
        <text ref={(e) => { vals.current.tok = e; }} x={300} y={126} className="ex-num-l" style={{ fontSize: 26 }} />
      </g>
      {mode === "dev" && (
        <g>
          <text x={W.x} y={W.y + SIDE + 160} className="ex-eq">r = {LORA.r} · q k v o gate up down · 36 layers</text>
          <text x={W.x} y={W.y + SIDE + 184} className="ex-eq">L = −Σ log π(y_t | x, y_&lt;t) over trace tokens</text>
          <text x={FIELD.x} y={640} className="ex-ann">+{f.gained.length} gained · −{f.lost.length} lost vs base</text>
        </g>
      )}
    </Surface>
  );
}
