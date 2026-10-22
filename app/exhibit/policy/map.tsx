"use client";

import { useCallback, useEffect, useRef } from "react";
import { attrs, ease, fitCanvas, fmt, lerp, prog, readTokens, rng, useSceneFrame, type Tokens } from "../engine";
import type { RoomProps } from "../shell";
import { PATH, flips } from "./data";
import { Surface, TaskField, VB, type FieldHandle } from "./parts";

/* P0 · the post-training system at a glance: fleet → weights → eval, cycling through five checkpoints. */

const STEP = 2600;
const FLEET = { x: 40, y: 64, n: 8, cell: 40, gap: 8 };
const LAT = { x: 520, y: 64, n: 24, cell: 13, gap: 3 };
const FIELD = { x: 1012, y: 92 };
type Role = "eval" | "train" | "rollout" | "think";
const PHASES: Role[] = ["eval", "train", "rollout", "think", "rollout"];
const roleOf = (k: number, g: number, t: number): Role => {
  const p = PHASES[k];
  if (p !== "rollout") return p;
  // Elastic cells: each GPU flips between rollout and train on its own schedule.
  const r = rng(g * 7919 + k * 31)();
  return Math.sin(t / (520 + r * 380) + r * 9) > 0.15 ? "rollout" : "train";
};

export function PolicyMap({ active, mode, clock }: RoomProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const field = useRef<FieldHandle>(null);
  const gpus = useRef<(SVGRectElement | null)[]>([]);
  const nodes = useRef<(SVGGElement | null)[]>([]);
  const vals = useRef<Record<string, SVGTextElement | null>>({});
  const pulses = useRef<(SVGCircleElement | null)[]>([]);
  const tok = useRef<Tokens | null>(null);
  const lastK = useRef(-1);
  const u = useRef(Array.from({ length: LAT.n }, (_, i) => Math.sin(i * 0.9) * 0.6 + Math.cos(i * 0.37) * 0.4));
  const v = useRef(Array.from({ length: LAT.n }, (_, i) => Math.cos(i * 0.55 + 1) * 0.7 + Math.sin(i * 1.7) * 0.3));

  const draw = useCallback((t: number) => {
    const el = canvas.current;
    if (!el) return;
    if (!tok.current) tok.current = readTokens(el);
    const T = tok.current;
    const k = Math.min(PATH.length - 1, Math.floor(t / STEP));
    const local = t - k * STEP;
    const ck = PATH[k], prev = PATH[Math.max(0, k - 1)];
    const color: Record<Role, string> = { eval: T.amber, think: T.amber, train: T.cyan, rollout: T.rose };

    // fleet
    for (let g = 0; g < 64; g++) {
      const role = roleOf(k, g, t);
      const pulse = 0.55 + 0.45 * Math.sin(t / 240 + g * 1.3);
      attrs(gpus.current[g], { fill: color[role], "fill-opacity": (role === "think" ? 0.35 + 0.5 * pulse : 0.25 + 0.55 * pulse).toFixed(3), stroke: color[role], "stroke-opacity": 0.85 });
    }

    // weights: frozen lattice with a low-rank update projected while training
    const ctx = fitCanvas(el, VB.w, VB.h);
    const training = PHASES[k] === "train" || PHASES[k] === "rollout";
    const locked = PHASES[k] === "think";
    const amp = training ? ease.out(prog(local, 0, 900)) : k === 0 ? 0 : 0.35;
    for (let i = 0; i < LAT.n; i++) {
      for (let j = 0; j < LAT.n; j++) {
        const base = 0.11 + 0.07 * Math.sin(i * 3.1 + j * 1.7);
        const dw = u.current[i] * v.current[j] * (k >= 1 ? 1 : 0) * amp;
        const wave = training ? 0.35 * Math.max(0, Math.sin(t / 280 - (i + j) * 0.35)) : 0;
        const a = Math.min(0.98, base + Math.abs(dw) * 0.95 + wave * Math.abs(dw));
        ctx.fillStyle = dw > 0.04 ? `rgba(${T.roseRgb},${a.toFixed(3)})` : dw < -0.04 ? `rgba(${T.cyanRgb},${(base + Math.abs(dw) * 0.6).toFixed(3)})` : `rgba(${T.inkRgb},${base.toFixed(3)})`;
        ctx.fillRect(LAT.x + j * (LAT.cell + LAT.gap), LAT.y + i * (LAT.cell + LAT.gap), LAT.cell, LAT.cell);
      }
    }
    // the adapter blades: B (24×r) and A (r×24)
    const blade = training ? 0.55 + 0.45 * Math.sin(t / 200) : 0.12;
    ctx.fillStyle = `rgba(${T.roseRgb},${blade.toFixed(3)})`;
    const side = LAT.n * (LAT.cell + LAT.gap) - LAT.gap;
    ctx.fillRect(LAT.x + side + 14, LAT.y, 10, side);
    ctx.fillRect(LAT.x, LAT.y + side + 14, side, 10);
    if (locked) {
      ctx.strokeStyle = `rgba(${T.inkRgb},0.5)`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(LAT.x - 8, LAT.y - 8, side + 16, side + 16);
    }

    // connectors: gradients into θ while training; checkpoint out to eval
    pulses.current.forEach((c, i) => {
      const lane = i < 4 ? 0 : 1, p = ((t / 900 + i * 0.25) % 1);
      const [x0, y0, x1, y1] = lane === 0 ? [420, 252, 512, 252] : [944, 252, 1004, 210];
      const on = lane === 0 ? training : true;
      attrs(c, { cx: lerp(x0, x1, p), cy: lerp(y0, y1, p), opacity: on ? Math.sin(Math.PI * p) : 0, fill: lane === 0 ? T.rose : T.amber });
    });

    // eval field: the checkpoint's solved set, with this step's gains flashing
    const f = flips(prev, ck);
    const gained = new Set(f.gained), lost = new Set(f.lost);
    const reveal = prog(local, 200, 1400);
    field.current?.paint(
      (i) => (k > 0 && gained.has(i) && reveal > i / 96 ? "gained" : k > 0 && lost.has(i) && reveal > i / 96 ? "lost" : (reveal > i / 96 ? ck : prev).solved[i] ? "on" : "off"),
      T, T.rose, () => prog(local, 1400, 2400),
    );
    nodes.current.forEach((n, i) => attrs(n, { opacity: i < k ? 0.75 : i === k ? 1 : 0.32 }));

    // telemetry, counted toward the new checkpoint
    const c = ease.out(prog(local, 150, 1100));
    const set = (key: string, s: string) => { const e = vals.current[key]; if (e && e.textContent !== s) e.textContent = s; };
    set("ck", ck.name);
    set("pass", `${fmt(lerp(prev.pass1, ck.pass1, k ? c : 1), 1)}%`);
    set("solved", `${Math.round(lerp(prev.correct, ck.correct, k ? c : 1))} / 96`);
    set("cost", fmt(lerp(prev.costPerTask, ck.costPerTask, k ? c : 1)));
    set("tok", Math.round(lerp(prev.tokensPerTask, ck.tokensPerTask, k ? c : 1)).toLocaleString("en-US"));
    set("role", { eval: "eval", train: "SFT update", rollout: "rollout ↔ train", think: "search · θ frozen" }[PHASES[k]]);
    if (k !== lastK.current) lastK.current = k;
  }, []);

  const readTime = clock.readTime;
  useSceneFrame(active, readTime, draw);
  useEffect(() => { tok.current = null; }, [mode]);

  return (
    <Surface ref={canvas} label="Post-training system: GPU fleet, model weights and the 96-task evaluation">
      <text x={FLEET.x} y={FLEET.y - 22} className="ex-m">FLEET · 64 × GPU</text>
      {Array.from({ length: 64 }, (_, g) => (
        <rect key={g} ref={(e) => { gpus.current[g] = e; }} x={FLEET.x + (g % 8) * (FLEET.cell + FLEET.gap)} y={FLEET.y + Math.floor(g / 8) * (FLEET.cell + FLEET.gap)} width={FLEET.cell} height={FLEET.cell} rx={6} strokeWidth={1} />
      ))}
      <g transform={`translate(${FLEET.x} 476)`}>
        {[["rollout", "var(--ex-rose)"], ["train", "var(--ex-cyan)"], ["eval · search", "var(--ex-amber)"]].map(([l, c], i) => (
          <g key={l} transform={`translate(${i * 128} 0)`}><rect width={12} height={12} rx={3} fill={c} /><text x={20} y={11} className="ex-m">{l}</text></g>
        ))}
      </g>
      <text x={LAT.x} y={LAT.y - 22} className="ex-m">θ · QWEN3-4B · LoRA B·A</text>
      <text x={LAT.x + 408} y={LAT.y + 196} className="ex-ann" transform={`rotate(90 ${LAT.x + 408} ${LAT.y + 196})`} textAnchor="middle">B · r</text>
      <text x={LAT.x + 192} y={LAT.y + 432} className="ex-ann" textAnchor="middle">A · r</text>
      <path d="M420 252H512" stroke="var(--ex-line-2)" />
      <path d="M944 252C970 252 980 210 1004 210" fill="none" stroke="var(--ex-line-2)" />
      {Array.from({ length: 8 }, (_, i) => <circle key={i} ref={(e) => { pulses.current[i] = e; }} r={3.2} />)}
      <text x={FIELD.x} y={FIELD.y - 38} className="ex-m">EVAL · 96 TASKS · PASS@1</text>
      <TaskField ref={field} x={FIELD.x} y={FIELD.y} cell={26} gap={6} />
      <g transform="translate(1012 418)">
        <path d="M8 0H492" stroke="var(--ex-line-2)" />
        {PATH.map((c, i) => (
          <g key={c.key} ref={(e) => { nodes.current[i] = e; }} transform={`translate(${8 + i * 121} 0)`}>
            <circle r={6} fill="var(--ex-rose)" />
            <text y={30} className="ex-node" textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"}>{c.short}</text>
            <text y={52} className="ex-m" textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"}>{c.pass1.toFixed(1)}%</text>
          </g>
        ))}
      </g>
      <g transform="translate(40 590)">
        <path d="M0 -26H1520" stroke="var(--ex-line)" />
        {[["ck", "CHECKPOINT", 0], ["pass", "PASS@1", 360], ["solved", "SOLVED", 620], ["cost", "GPU-S / TASK", 860], ["tok", "TOKENS / TASK", 1100], ["role", "FLEET", 1340]].map(([key, label, x]) => (
          <g key={key as string} transform={`translate(${x} 0)`}>
            <text className="ex-m">{label as string}</text>
            <text ref={(e) => { vals.current[key as string] = e; }} y={key === "ck" || key === "role" ? 34 : 38} className={key === "ck" || key === "role" ? "ex-l-strong" : "ex-num-l"} />
          </g>
        ))}
      </g>
      {mode === "dev" && (
        <g>
          <text x={LAT.x} y={LAT.y + 452} className="ex-eq">W′ = W + (α/r)·B·A · W frozen</text>
          <text x={FLEET.x} y={FLEET.y + 446} className="ex-ann">roles reassign per GPU, not per phase</text>
        </g>
      )}
    </Surface>
  );
}
