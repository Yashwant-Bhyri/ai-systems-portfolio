"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { attrs, ease, fitCanvas, fmt, lerp, prog, readTokens, rng, useSceneFrame, type Tokens } from "../engine";
import { useTr } from "../i18n";
import type { RoomProps } from "../shell";
import { PATH, flips } from "./data";
import { Surface, TALL_W, TaskField, VB, type FieldHandle } from "./parts";

/* P0 · the post-training system at a glance: fleet → weights → eval, cycling through five checkpoints. */

const STEP = 2600;
type Role = "eval" | "train" | "rollout" | "think";
const PHASES: Role[] = ["eval", "train", "rollout", "think", "rollout"];
const roleOf = (k: number, g: number, t: number): Role => {
  const p = PHASES[k];
  if (p !== "rollout") return p;
  // Elastic cells: each GPU flips between rollout and train on its own schedule.
  const r = rng(g * 7919 + k * 31)();
  return Math.sin(t / (520 + r * 380) + r * 9) > 0.15 ? "rollout" : "train";
};
const N = 24;
const U = Array.from({ length: N }, (_, i) => Math.sin(i * 0.9) * 0.6 + Math.cos(i * 0.37) * 0.4);
const V = Array.from({ length: N }, (_, i) => Math.cos(i * 0.55 + 1) * 0.7 + Math.sin(i * 1.7) * 0.3);

const WIDE = {
  vb: VB,
  fleet: { x: 40, y: 64, cell: 40, gap: 8 },
  lat: { x: 520, y: 64, cell: 13, gap: 3 },
  field: { x: 1012, y: 92, cell: 26, gap: 6 },
  legend: { x: 40, y: 476, step: 128 },
  chain: { x: 1012, y: 418, step: 121 },
  conn: [[420, 252, 512, 252], [944, 252, 1004, 210]] as const,
  paths: ["M420 252H512", "M944 252C970 252 980 210 1004 210"],
  tele: { y: 590, rule: 1520, cells: [[0, 0], [360, 0], [620, 0], [860, 0], [1100, 0], [1340, 0]] as const },
  dev: { eq: [520, 516], note: [40, 510] },
};
const TALL = {
  vb: { w: TALL_W, h: 1110 },
  fleet: { x: 24, y: 64, cell: 30, gap: 6 },
  lat: { x: 326, y: 64, cell: 8, gap: 2 },
  field: { x: 52, y: 492, cell: 26, gap: 5 },
  legend: { x: 24, y: 388, step: 180 },
  chain: { x: 52, y: 790, step: 122 },
  conn: [[306, 200, 322, 200], [445, 356, 300, 440]] as const,
  paths: ["M306 200H322", "M445 356C445 404 300 400 300 440"],
  tele: { y: 900, rule: 552, cells: [[24, 0], [320, 0], [24, 86], [320, 86], [24, 172], [320, 172]] as const },
  dev: { eq: [24, 428], note: [24, 414] },
};

export function PolicyMap({ active, mode, clock, tall }: RoomProps) {
  const L = tall ? TALL : WIDE;
  const tr = useTr();
  const canvas = useRef<HTMLCanvasElement>(null);
  const field = useRef<FieldHandle>(null);
  const gpus = useRef<(SVGRectElement | null)[]>([]);
  const nodes = useRef<(SVGGElement | null)[]>([]);
  const vals = useRef<Record<string, SVGTextElement | null>>({});
  const pulses = useRef<(SVGCircleElement | null)[]>([]);
  const tok = useRef<Tokens | null>(null);
  const side = N * (L.lat.cell + L.lat.gap) - L.lat.gap;
  const roleNames = useMemo(() => ({ eval: tr("eval · search"), train: tr("SFT update"), rollout: tr("rollout ↔ train"), think: tr("search · θ frozen") }), [tr]);

  const draw = useCallback((t: number) => {
    const el = canvas.current;
    if (!el) return;
    const T = (tok.current ??= readTokens(el));
    const k = Math.min(PATH.length - 1, Math.floor(t / STEP));
    const local = t - k * STEP;
    const ck = PATH[k], prev = PATH[Math.max(0, k - 1)];
    const color: Record<Role, string> = { eval: T.amber, think: T.amber, train: T.cyan, rollout: T.rose };

    for (let g = 0; g < 64; g++) {
      const role = roleOf(k, g, t);
      const pulse = 0.55 + 0.45 * Math.sin(t / 240 + g * 1.3);
      attrs(gpus.current[g], { fill: color[role], "fill-opacity": (role === "think" ? 0.35 + 0.5 * pulse : 0.25 + 0.55 * pulse).toFixed(3), stroke: color[role], "stroke-opacity": 0.85 });
    }

    // weights: frozen lattice with a low-rank update projected while training
    const ctx = fitCanvas(el, L.vb.w, L.vb.h);
    const training = PHASES[k] === "train" || PHASES[k] === "rollout";
    const locked = PHASES[k] === "think";
    const amp = training ? ease.out(prog(local, 0, 900)) : k === 0 ? 0 : 0.35;
    const lat = L.lat;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const base = 0.11 + 0.07 * Math.sin(i * 3.1 + j * 1.7);
        const dw = U[i] * V[j] * (k >= 1 ? 1 : 0) * amp;
        const wave = training ? 0.35 * Math.max(0, Math.sin(t / 280 - (i + j) * 0.35)) : 0;
        const a = Math.min(0.98, base + Math.abs(dw) * 0.95 + wave * Math.abs(dw));
        ctx.fillStyle = dw > 0.04 ? `rgba(${T.roseRgb},${a.toFixed(3)})` : dw < -0.04 ? `rgba(${T.cyanRgb},${(base + Math.abs(dw) * 0.6).toFixed(3)})` : `rgba(${T.inkRgb},${base.toFixed(3)})`;
        ctx.fillRect(lat.x + j * (lat.cell + lat.gap), lat.y + i * (lat.cell + lat.gap), lat.cell, lat.cell);
      }
    }
    const blade = training ? 0.55 + 0.45 * Math.sin(t / 200) : 0.12;
    ctx.fillStyle = `rgba(${T.roseRgb},${blade.toFixed(3)})`;
    ctx.fillRect(lat.x + side + 12, lat.y, 9, side);
    ctx.fillRect(lat.x, lat.y + side + 12, side, 9);
    if (locked) {
      ctx.strokeStyle = `rgba(${T.inkRgb},0.5)`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(lat.x - 7, lat.y - 7, side + 14, side + 14);
    }

    pulses.current.forEach((c, i) => {
      const lane = i < 4 ? 0 : 1, p = ((t / 900 + i * 0.25) % 1);
      const [x0, y0, x1, y1] = L.conn[lane];
      const on = lane === 0 ? training : true;
      attrs(c, { cx: lerp(x0, x1, p), cy: lerp(y0, y1, p), opacity: on ? Math.sin(Math.PI * p) : 0, fill: lane === 0 ? T.rose : T.amber });
    });

    const f = flips(prev, ck);
    const gained = new Set(f.gained), lost = new Set(f.lost);
    const reveal = prog(local, 200, 1400);
    field.current?.paint(
      (i) => (k > 0 && gained.has(i) && reveal > i / 96 ? "gained" : k > 0 && lost.has(i) && reveal > i / 96 ? "lost" : (reveal > i / 96 ? ck : prev).solved[i] ? "on" : "off"),
      T, T.rose, () => prog(local, 1400, 2400),
    );
    nodes.current.forEach((n, i) => attrs(n, { opacity: i < k ? 0.75 : i === k ? 1 : 0.32 }));

    const c = ease.out(prog(local, 150, 1100));
    const set = (key: string, s: string) => { const e = vals.current[key]; if (e && e.textContent !== s) e.textContent = s; };
    set("ck", tr(ck.name));
    set("pass", `${fmt(lerp(prev.pass1, ck.pass1, k ? c : 1), 1)}%`);
    set("solved", `${Math.round(lerp(prev.correct, ck.correct, k ? c : 1))} / 96`);
    set("cost", fmt(lerp(prev.costPerTask, ck.costPerTask, k ? c : 1)));
    set("tok", Math.round(lerp(prev.tokensPerTask, ck.tokensPerTask, k ? c : 1)).toLocaleString("en-US"));
    set("role", roleNames[PHASES[k]]);
  }, [L, side, tr, roleNames]);

  useSceneFrame(active, clock.readTime, draw);
  useEffect(() => { tok.current = null; }, [mode]);

  const anchor = (i: number) => (i === 0 ? "start" : i === 4 ? "end" : "middle");
  const fl = L.fleet;
  return (
    <Surface ref={canvas} vb={L.vb} label="Post-training system: GPU fleet, model weights and the 96-task evaluation">
      <text x={fl.x} y={fl.y - 22} className="ex-m">{tr("FLEET · 64 × GPU")}</text>
      {Array.from({ length: 64 }, (_, g) => (
        <rect key={g} ref={(e) => { gpus.current[g] = e; }} x={fl.x + (g % 8) * (fl.cell + fl.gap)} y={fl.y + Math.floor(g / 8) * (fl.cell + fl.gap)} width={fl.cell} height={fl.cell} rx={tall ? 5 : 6} strokeWidth={1} />
      ))}
      <g transform={`translate(${L.legend.x} ${L.legend.y})`}>
        {[["rollout", "var(--ex-rose)"], ["train", "var(--ex-cyan)"], ["eval · search", "var(--ex-amber)"]].map(([l, c], i) => (
          <g key={l} transform={`translate(${i * L.legend.step} 0)`}><rect width={12} height={12} rx={3} fill={c} /><text x={20} y={11} className="ex-m">{tr(l)}</text></g>
        ))}
      </g>
      <text x={L.lat.x} y={L.lat.y - 22} className="ex-m">{tall ? "θ · LoRA B·A" : tr("θ · QWEN3-4B · LoRA B·A")}</text>
      <text x={L.lat.x + side + 30} y={L.lat.y + side / 2} className="ex-ann" transform={`rotate(90 ${L.lat.x + side + 30} ${L.lat.y + side / 2})`} textAnchor="middle">B · r</text>
      <text x={L.lat.x + side / 2} y={L.lat.y + side + 42} className="ex-ann" textAnchor="middle">A · r</text>
      <path d={L.paths[0]} stroke="var(--ex-line-2)" />
      <path d={L.paths[1]} fill="none" stroke="var(--ex-line-2)" />
      {Array.from({ length: 8 }, (_, i) => <circle key={i} ref={(e) => { pulses.current[i] = e; }} r={3.2} />)}
      <text x={L.field.x} y={L.field.y - 38} className="ex-m">{tr("EVAL · 96 TASKS · PASS@1")}</text>
      <TaskField ref={field} x={L.field.x} y={L.field.y} cell={L.field.cell} gap={L.field.gap} />
      <g transform={`translate(${L.chain.x} ${L.chain.y})`}>
        <path d={`M8 0H${8 + 4 * L.chain.step}`} stroke="var(--ex-line-2)" />
        {PATH.map((c, i) => (
          <g key={c.key} ref={(e) => { nodes.current[i] = e; }} transform={`translate(${8 + i * L.chain.step} 0)`}>
            <circle r={6} fill="var(--ex-rose)" />
            <text y={30} className="ex-node" textAnchor={anchor(i)}>{tr(c.short)}</text>
            <text y={52} className="ex-m" textAnchor={anchor(i)}>{c.pass1.toFixed(1)}%</text>
          </g>
        ))}
      </g>
      <g transform={`translate(${tall ? 0 : 40} ${L.tele.y})`}>
        <path d={`M${tall ? 24 : 0} -26H${L.tele.rule + (tall ? 24 : 0)}`} stroke="var(--ex-line)" />
        {([["ck", "CHECKPOINT"], ["pass", "PASS@1"], ["solved", "SOLVED"], ["cost", "GPU-S / TASK"], ["tok", "TOKENS / TASK"], ["role", "FLEET"]] as const).map(([key, label], i) => {
          const [x, y] = L.tele.cells[i];
          const text = key === "ck" || key === "role";
          return (
            <g key={key} transform={`translate(${x} ${y})`}>
              <text className="ex-m">{tr(label)}</text>
              <text ref={(e) => { vals.current[key] = e; }} y={text ? 34 : 38} className={text ? "ex-l-strong" : "ex-num-l"} />
            </g>
          );
        })}
      </g>
      {mode === "dev" && (
        <g>
          <text x={L.dev.eq[0]} y={L.dev.eq[1]} className="ex-eq">W′ = W + (α/r)·B·A · W frozen</text>
          {!tall && <text x={L.dev.note[0]} y={L.dev.note[1]} className="ex-ann">{tr("roles reassign per GPU, not per phase")}</text>}
        </g>
      )}
    </Surface>
  );
}
