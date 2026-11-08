"use client";

import { useCallback, useEffect, useRef } from "react";
import { ease, fitCanvas, fmt, lerp, prog, readTokens, useSceneFrame, type Tokens } from "../engine";
import type { RoomProps } from "../shell";
import { CK, FAMILY_NAMES, flips } from "./data";
import { Surface, TALL_W, VB } from "./parts";
import { useTr } from "../i18n";

/* P6 · length-aware RL at the same 4× allowance: every task's reasoning is carved down; 82 stay solved. */

const A = CK.rl4, B = CK.eff4;
const MAX = Math.max(...A.tokens);
const WIDE = {
  vb: VB, bar: 14, hmax: 360,
  pos: (i: number) => [104 + i * 14 + Math.floor(i / 32) * 18, 470] as const,
  famLabel: (b: number) => [104 + b * (32 * 14 + 18), 504] as const,
  rule: (b: number) => (b === 0 ? `M104 470.5H${104 + 96 * 14 + 36}` : ""),
  read: { x: 104, y: 560, cells: [[0, 0], [300, 0], [640, 0], [980, 0]] as const, delta: 170, dy: 0 },
  title: [104, 56] as const, dev: { eq: [104, 690], note: [1440, 56] },
};
const TALL = {
  vb: { w: TALL_W, h: 1060 }, bar: 16, hmax: 170,
  pos: (i: number) => [44 + (i % 32) * 16, 270 + Math.floor(i / 32) * 236] as const,
  famLabel: (b: number) => [44, 270 + b * 236 + 32] as const,
  rule: (b: number) => `M44 ${270 + b * 236 + 0.5}H${44 + 32 * 16}`,
  read: { x: 24, y: 820, cells: [[0, 0], [300, 0], [0, 100], [300, 100]] as const, delta: 150, dy: 0 },
  title: [24, 50] as const, dev: { eq: [24, 1040], note: [24, 76] },
};
const f = flips(A, B);
const changed = new Set([...f.gained, ...f.lost]);
const T_GROW = 2600, T_CARVE = 3600, T_DONE = 6200;

export function PolicyLean({ active, mode, clock, tall }: RoomProps) {
  const L = tall ? TALL : WIDE;
  const BAR = L.bar;
  const H = useCallback((n: number) => (n / MAX) * L.hmax, [L]);
  const tr = useTr();
  const canvas = useRef<HTMLCanvasElement>(null);
  const vals = useRef<Record<string, SVGTextElement | null>>({});
  const tok = useRef<Tokens | null>(null);

  const draw = useCallback((t: number) => {
    const el = canvas.current;
    if (!el) return;
    const T = (tok.current ??= readTokens(el));
    const ctx = fitCanvas(el, L.vb.w, L.vb.h);
    const carve = ease.io(prog(t, T_CARVE, T_DONE));
    for (let i = 0; i < 96; i++) {
      const grow = ease.out(prog(t, i * 22, T_GROW * 0.6 + i * 22));
      const [x, BASE] = L.pos(i);
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
      // Lean RL is lime, as in the manifold and the thinking-budget chart
      ctx.fillStyle = solved ? T.lime : `rgba(${T.inkRgb},${(0.22 + 0.4 * flash).toFixed(3)})`;
      if (solved) ctx.globalAlpha = 0.7 + 0.3 * flash;
      ctx.fillRect(x, BASE - hB, BAR - 4, hB);
      ctx.globalAlpha = 1;
      if (changed.has(i) && carve > 0.6) {
        ctx.fillStyle = f.gained.includes(i) ? T.lime : T.red;
        ctx.fillRect(x, BASE + 6, BAR - 4, 4);
      }
    }
    const c = ease.out(prog(t, T_CARVE, T_DONE));
    const set = (k: string, s: string) => { const e = vals.current[k]; if (e && e.textContent !== s) e.textContent = s; };
    // Settled values only: the bars carry the motion, the numbers switch once the carve lands.
    const done = c >= 0.999;
    set("tok", Math.round(done ? B.tokensPerTask : A.tokensPerTask).toLocaleString("en-US"));
    set("cost", fmt(done ? B.costPerTask : A.costPerTask));
    set("tokd", done ? `−${Math.round((1 - B.tokensPerTask / A.tokensPerTask) * 100)}%` : "");
    set("costd", done ? `−${((1 - B.costPerTask / A.costPerTask) * 100).toFixed(1)}%` : "");
  }, [L, BAR, H]);
  useSceneFrame(active, clock.readTime, draw);
  useEffect(() => { tok.current = null; }, [mode]);

  return (
    <Surface ref={canvas} vb={L.vb} label="Lean RL keeps 82 of 96 tasks solved at 4× allowance while cutting tokens per task by 37 percent">
      <text x={L.title[0]} y={L.title[1]} className="ex-m">{tr(tall ? "Tokens per task" : "Tokens per task at a 4× budget: GRPO outlined, Lean RL filled")}{tall ? " · 4×" : ""}</text>
      {[0, 1, 2].map((b) => L.rule(b) && <path key={b} d={L.rule(b)} stroke="var(--ex-line-2)" />)}
      {FAMILY_NAMES.map((n, b) => (
        <text key={n} x={L.famLabel(b)[0]} y={L.famLabel(b)[1]} className="ex-m">{tr(n.toUpperCase())}</text>
      ))}
      <g transform={`translate(${L.read.x} ${L.read.y})`}>
        {([["Solved", null, "82 → 82"], ["Tokens per task", "tok", null], ["GPU-s per task", "cost", null], ["Tasks that changed", null, `+${f.gained.length} / −${f.lost.length}`]] as const).map(([label, key, fixed], i) => {
          const [cx, cy] = L.read.cells[i];
          return (
            <g key={label} transform={`translate(${cx} ${cy})`}>
              <text className="ex-m">{tr(label)}</text>
              {key ? <>
                <text ref={(e) => { vals.current[key] = e; }} y={44} className="ex-num-l" />
                <text ref={(e) => { vals.current[`${key}d`] = e; }} x={L.read.delta} y={44} className="ex-num-l" style={{ fill: "var(--ex-lime)", fontSize: 26 }} />
              </> : <text y={44} className="ex-num-l" style={i === 3 ? { fontSize: 26 } : undefined}>{fixed}</text>}
            </g>
          );
        })}
      </g>
      {mode === "dev" && (
        <g>
          <text x={L.dev.eq[0]} y={L.dev.eq[1]} className="ex-eq">{tall ? "r = r_correct − λ·max(0, len − L)" : "r = r_correct − λ · max(0, len − L_target) · same verifier · same 4× sampling"}</text>
          <text x={L.dev.note[0]} y={L.dev.note[1]} className="ex-ann" textAnchor={tall ? "start" : "end"}>declared work multiplier 2.7 → 1.7</text>
        </g>
      )}
    </Surface>
  );
}
