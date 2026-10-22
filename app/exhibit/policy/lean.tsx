"use client";

import { useCallback, useEffect, useRef } from "react";
import { ease, fitCanvas, fmt, lerp, prog, readTokens, useSceneFrame, type Tokens } from "../engine";
import type { RoomProps } from "../shell";
import { CK, FAMILY_NAMES, flips } from "./data";
import { Surface, VB } from "./parts";

/* P6 · length-aware RL at the same 4× allowance: every task's reasoning is carved down; 82 stay solved. */

const A = CK.rl4, B = CK.eff4;
const BAR = 14, X0 = 104, BASE = 470, HMAX = 360;
const MAX = Math.max(...A.tokens);
const H = (n: number) => (n / MAX) * HMAX;
const f = flips(A, B);
const changed = new Set([...f.gained, ...f.lost]);
const T_GROW = 2600, T_CARVE = 3600, T_DONE = 6200;

export function PolicyLean({ active, mode, clock }: RoomProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const vals = useRef<Record<string, SVGTextElement | null>>({});
  const tok = useRef<Tokens | null>(null);

  const draw = useCallback((t: number) => {
    const el = canvas.current;
    if (!el) return;
    const T = (tok.current ??= readTokens(el));
    const ctx = fitCanvas(el, VB.w, VB.h);
    const carve = ease.io(prog(t, T_CARVE, T_DONE));
    for (let i = 0; i < 96; i++) {
      const grow = ease.out(prog(t, i * 22, T_GROW * 0.6 + i * 22));
      const x = X0 + i * BAR + Math.floor(i / 32) * 18;
      const hA = H(A.tokens[i]) * grow, hB = lerp(H(A.tokens[i]), H(B.tokens[i]), carve) * grow;
      const solved = carve > 0.5 ? B.solved[i] : A.solved[i];
      // the trimmed tokens remain as a ghost outline
      if (carve > 0) {
        ctx.strokeStyle = `rgba(${T.inkRgb},${(0.35 * carve).toFixed(3)})`;
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, BASE - hA + 0.5, BAR - 5, hA - hB);
        ctx.setLineDash([]);
      }
      const flash = changed.has(i) ? Math.max(0, 1 - Math.abs(carve - 0.6) * 3) : 0;
      ctx.fillStyle = solved
        ? `rgba(${T.roseRgb},${(0.7 + 0.3 * flash).toFixed(3)})`
        : `rgba(${T.inkRgb},${(0.22 + 0.4 * flash).toFixed(3)})`;
      ctx.fillRect(x, BASE - hB, BAR - 4, hB);
      if (changed.has(i) && carve > 0.6) {
        ctx.fillStyle = f.gained.includes(i) ? T.rose : T.red;
        ctx.fillRect(x, BASE + 6, BAR - 4, 4);
      }
    }
    const c = ease.out(prog(t, T_CARVE, T_DONE));
    const set = (k: string, s: string) => { const e = vals.current[k]; if (e && e.textContent !== s) e.textContent = s; };
    set("tok", Math.round(lerp(A.tokensPerTask, B.tokensPerTask, c)).toLocaleString("en-US"));
    set("cost", fmt(lerp(A.costPerTask, B.costPerTask, c)));
    set("tokd", c > 0.02 ? `−${Math.round((1 - lerp(A.tokensPerTask, B.tokensPerTask, c) / A.tokensPerTask) * 100)}%` : "");
    set("costd", c > 0.02 ? `−${((1 - lerp(A.costPerTask, B.costPerTask, c) / A.costPerTask) * 100).toFixed(1)}%` : "");
  }, []);
  useSceneFrame(active, clock.readTime, draw);
  useEffect(() => { tok.current = null; }, [mode]);

  return (
    <Surface ref={canvas} label="Length-aware RL keeps 82 of 96 tasks solved at 4× allowance while cutting tokens per task by 37 percent">
      <text x={X0} y={56} className="ex-m">TOKENS PER TASK · 4× ALLOWANCE · GRPO (OUTLINE) → LENGTH-AWARE RL (FILLED)</text>
      <path d={`M${X0} ${BASE + 0.5}H${X0 + 96 * BAR + 36}`} stroke="var(--ex-line-2)" />
      {FAMILY_NAMES.map((n, b) => (
        <text key={n} x={X0 + b * (32 * BAR + 18)} y={BASE + 34} className="ex-m">{n.toUpperCase()}</text>
      ))}
      <g transform="translate(104 560)">
        <text className="ex-m">SOLVED</text>
        <text y={44} className="ex-num-l">82 → 82</text>
        <text x={300} className="ex-m">TOKENS / TASK</text>
        <text ref={(e) => { vals.current.tok = e; }} x={300} y={44} className="ex-num-l" />
        <text ref={(e) => { vals.current.tokd = e; }} x={470} y={44} className="ex-num-l" style={{ fill: "var(--ex-rose)", fontSize: 26 }} />
        <text x={640} className="ex-m">GPU-S / TASK</text>
        <text ref={(e) => { vals.current.cost = e; }} x={640} y={44} className="ex-num-l" />
        <text ref={(e) => { vals.current.costd = e; }} x={790} y={44} className="ex-num-l" style={{ fill: "var(--ex-rose)", fontSize: 26 }} />
        <text x={980} className="ex-m">CHANGED TASKS</text>
        <text x={980} y={44} className="ex-num-l" style={{ fontSize: 26 }}>+{f.gained.length} / −{f.lost.length}</text>
      </g>
      {mode === "dev" && (
        <g>
          <text x={104} y={690} className="ex-eq">r = r_correct − λ · max(0, len − L_target) · same verifier · same 4× sampling</text>
          <text x={1440} y={56} className="ex-ann" textAnchor="end">declared work multiplier 2.7 → 1.7</text>
        </g>
      )}
    </Surface>
  );
}
