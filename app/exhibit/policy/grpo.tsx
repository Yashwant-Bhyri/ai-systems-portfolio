"use client";

import { useCallback, useEffect, useRef } from "react";
import { attrs, ease, fitCanvas, fmt, lerp, prog, readTokens, rng, useSceneFrame, type Tokens } from "../engine";
import type { RoomProps } from "../shell";
import { CK, flips } from "./data";
import { Surface, TaskField, VB, type FieldHandle } from "./parts";

/* P3 · GRPO: a batch of 8 prompts × 8 rollouts, scored by a verifier, normalised within each group. */

const R = [
  [1, 1, 0, 1, 0, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 0, 0, 0, 1, 0],
  [1, 0, 1, 1, 1, 0, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 1, 1, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 1],
  [0, 0, 0, 1, 0, 0, 0, 0],
];
const G = 8, ROW = 40, LANE = 84, LX = 110, LY = 74;
const stats = R.map((row) => {
  const m = row.reduce((a, b) => a + b, 0) / G;
  const sd = Math.sqrt(row.reduce((a, b) => a + (b - m) ** 2, 0) / G);
  return { m, sd, dead: sd === 0 };
});
const ADV = R.map((row, p) => row.map((r) => (stats[p].dead ? 0 : (r - stats[p].m) / stats[p].sd)));
const LEN = (() => {
  const g = rng(31);
  return R.map((row) => row.map((r) => 0.35 + 0.65 * g() * (r ? 0.8 : 1)));
})();
const POS = (() => {
  const g = rng(5);
  return R.map((row) => row.map(() => 0.08 + 0.84 * g()));
})();
const TER = { x0: 110, x1: 782, y: 668, lines: 26, depth: 170, h: 130 };
function baseDensity(x: number) {
  const g = (m: number, s: number) => Math.exp(-((x - m) ** 2) / (2 * s * s));
  return 0.5 * g(0.3, 0.12) + 0.35 * g(0.62, 0.1) + 0.2 * g(0.85, 0.06) + 0.05;
}
function updated(x: number) {
  let v = baseDensity(x);
  for (let p = 0; p < G; p++) for (let k = 0; k < G; k++) {
    const a = ADV[p][k];
    if (a) v += 0.035 * a * Math.exp(-((x - POS[p][k]) ** 2) / (2 * 0.03 * 0.03));
  }
  return Math.max(0.02, v);
}
const f = flips(CK.sft, CK.rl);
const gained = new Set(f.gained), lost = new Set(f.lost);
const T_GEN = 600, T_VER = 3200, T_MEAN = 4400, T_ADV = 5800, T_UPD = 7400, T_FLIP = 9800, T_END = 12300;

export function PolicyGrpo({ active, mode, clock }: RoomProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const field = useRef<FieldHandle>(null);
  const marks = useRef<(SVGRectElement | null)[]>([]);
  const means = useRef<(SVGRectElement | null)[]>([]);
  const meanTxt = useRef<(SVGTextElement | null)[]>([]);
  const drops = useRef<(SVGTextElement | null)[]>([]);
  const vals = useRef<Record<string, SVGTextElement | null>>({});
  const tok = useRef<Tokens | null>(null);

  const draw = useCallback((t: number) => {
    const el = canvas.current;
    if (!el) return;
    const T = (tok.current ??= readTokens(el));
    const ctx = fitCanvas(el, VB.w, VB.h);
    const adv = ease.out(prog(t, T_ADV, T_ADV + 1400));

    // rollouts stream as token streaks; after scoring they take the colour of their advantage
    for (let p = 0; p < G; p++) for (let k = 0; k < G; k++) {
      const start = T_GEN + k * 120 + p * 140, grow = ease.out(prog(t, start, start + 1300));
      if (grow <= 0) continue;
      const x = LX + k * LANE, y = LY + p * ROW, w = (LANE - 14) * LEN[p][k] * grow;
      const a = ADV[p][k];
      let col = T.inkRgb, alpha = 0.55;
      if (adv > 0) {
        if (stats[p].dead) { col = T.inkRgb; alpha = lerp(0.55, 0.14, adv); }
        else if (a > 0) { col = T.roseRgb; alpha = lerp(0.55, 0.35 + 0.4 * Math.min(1, a / 1.6), adv); }
        else { col = T.redRgb; alpha = lerp(0.55, 0.3 + 0.35 * Math.min(1, -a / 1.6), adv); }
      }
      // tokens: a streak of small cells, like a generation in progress
      for (let c = 0; c * 7 < w; c++) {
        ctx.fillStyle = `rgba(${col},${(alpha * (0.6 + 0.4 * ((c * 5 + k) % 3) / 2)).toFixed(3)})`;
        ctx.fillRect(x + c * 7, y + 8, 5, 12);
      }
    }

    // verifier marks at the end of each streak
    for (let p = 0; p < G; p++) for (let k = 0; k < G; k++) {
      const i = p * G + k, v = prog(t, T_VER + i * 14, T_VER + i * 14 + 260);
      const x = LX + k * LANE + (LANE - 14) * LEN[p][k] + 4;
      attrs(marks.current[i], { x, opacity: v, fill: R[p][k] ? T.green : T.red });
    }
    // group statistics
    const mp = ease.out(prog(t, T_MEAN, T_MEAN + 900));
    stats.forEach((s, p) => {
      attrs(means.current[p], { width: 80 * s.m * mp, fill: s.dead ? T.ink3 : T.rose, "fill-opacity": s.dead ? 0.4 : 0.8 });
      const tx = meanTxt.current[p];
      if (tx) tx.textContent = mp > 0.05 ? `r̄ ${s.m.toFixed(3)}` : "";
      attrs(drops.current[p], { opacity: s.dead ? prog(t, T_MEAN + 600, T_MEAN + 1200) : 0 });
    });

    // the policy terrain: a ridge field that reshapes under the advantages
    const morph = ease.io(prog(t, T_UPD, T_UPD + 2200));
    const N = 110, fu = new Float32Array(N + 1);
    for (let s = 0; s <= N; s++) fu[s] = lerp(baseDensity(s / N), updated(s / N), morph);
    for (let k = TER.lines - 1; k >= 0; k--) {
      const z = k / (TER.lines - 1), persp = 1 - z * 0.38;
      const cx = (TER.x0 + TER.x1) / 2, half = ((TER.x1 - TER.x0) / 2) * persp, yb = TER.y - z * TER.depth;
      ctx.beginPath();
      for (let s = 0; s <= N; s++) {
        const uu = s / N, x = cx - half + uu * 2 * half;
        const ripple = 0.06 * Math.sin(uu * 33 + k * 1.9) * Math.sin(uu * 9 - k * 0.5);
        const h = (fu[s] + ripple * 0.15) * TER.h * persp * (0.78 + 0.22 * Math.sin(k * 0.8 + uu * 4));
        if (s) ctx.lineTo(x, yb - h);
        else ctx.moveTo(x, yb - h);
      }
      const a = (0.1 + 0.6 * (1 - z)) * prog(t, 0, 900);
      if (mode === "dev" && z < 0.5) { ctx.strokeStyle = `rgba(${T.roseRgb},${(a * 0.18).toFixed(3)})`; ctx.lineWidth = 5; ctx.stroke(); }
      ctx.strokeStyle = `rgba(${T.roseRgb},${a.toFixed(3)})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    // update particles drop from scored rollouts into the policy at their positions
    if (t > T_UPD - 300 && t < T_UPD + 2400) {
      for (let p = 0; p < G; p++) for (let k = 0; k < G; k++) {
        const a = ADV[p][k];
        if (!a) continue;
        const q = prog(t, T_UPD - 300 + (p + k) * 40, T_UPD + 900 + (p + k) * 40);
        if (q <= 0 || q >= 1) continue;
        const x0 = LX + k * LANE + 20, y0 = LY + p * ROW + 14;
        const x1 = TER.x0 + POS[p][k] * (TER.x1 - TER.x0), y1 = TER.y - 40;
        ctx.fillStyle = `rgba(${a > 0 ? T.roseRgb : T.redRgb},${(Math.sin(Math.PI * q) * 0.9).toFixed(3)})`;
        ctx.fillRect(lerp(x0, x1, ease.io(q)) - 2, lerp(y0, y1, ease.io(q)) - 2, 4, 4);
      }
    }

    // outcomes on the 96 tasks
    const fp = prog(t, T_FLIP, T_FLIP + 1800);
    let solved = 0;
    field.current?.paint((i) => {
      const order = gained.has(i) ? f.gained.indexOf(i) / f.gained.length : lost.has(i) ? f.lost.indexOf(i) / f.lost.length : 0;
      const switched = fp > order && (gained.has(i) || lost.has(i));
      if (switched && gained.has(i)) { solved++; return "gained"; }
      if (switched && lost.has(i)) return "lost";
      if (CK.sft.solved[i]) { solved++; return "on"; }
      return "off";
    }, T, T.rose, () => prog(t, T_FLIP + 1800, T_END));
    const c = ease.out(prog(t, T_FLIP, T_FLIP + 1800));
    const set = (key: string, s: string) => { const e = vals.current[key]; if (e && e.textContent !== s) e.textContent = s; };
    set("solved", `${solved} / 96`);
    set("pass", `${fmt(lerp(CK.sft.pass1, CK.rl.pass1, c), 1)}%`);
    set("tok", Math.round(lerp(CK.sft.tokensPerTask, CK.rl.tokensPerTask, c)).toLocaleString("en-US"));
    set("cost", fmt(lerp(CK.sft.costPerTask, CK.rl.costPerTask, c)));
  }, [mode]);
  useSceneFrame(active, clock.readTime, draw);
  useEffect(() => { tok.current = null; }, [mode]);

  return (
    <Surface ref={canvas} label="GRPO: eight rollouts per prompt are scored by a verifier and normalised within their group">
      <text x={LX} y={LY - 30} className="ex-m">BATCH · 8 PROMPTS × G = 8 ROLLOUTS · VERIFIER-SCORED</text>
      {R.map((_, p) => (
        <g key={p}>
          <text x={40} y={LY + p * ROW + 20} className="ex-m">p{p + 1}</text>
          <rect ref={(e) => { means.current[p] = e; }} x={806} y={LY + p * ROW + 8} height={12} rx={2} width={0} />
          <text ref={(e) => { meanTxt.current[p] = e; }} x={896} y={LY + p * ROW + 19} className="ex-m" />
          <text ref={(e) => { drops.current[p] = e; }} x={806} y={LY + p * ROW + 36} className="ex-ann" opacity={0}>no signal · dropped</text>
          {R[p].map((_, k) => <rect key={k} ref={(e) => { marks.current[p * G + k] = e; }} y={LY + p * ROW + 8} width={8} height={12} rx={2} opacity={0} />)}
        </g>
      ))}
      <text x={806} y={LY - 30} className="ex-m">GROUP MEAN</text>
      <text x={TER.x0} y={704} className="ex-m">π · POLICY OVER REASONING PATHS · RESHAPED BY Â</text>
      <text x={1060} y={60} className="ex-m">EVAL · SFT → GRPO</text>
      <TaskField ref={field} x={1060} y={104} cell={26} gap={5} />
      <g transform="translate(1060 400)">
        <text className="ex-m">SOLVED</text>
        <text ref={(e) => { vals.current.solved = e; }} y={40} className="ex-num-l" />
        <text x={240} className="ex-m">PASS@1</text>
        <text ref={(e) => { vals.current.pass = e; }} x={240} y={40} className="ex-num-l" style={{ fill: "var(--ex-rose)" }} />
        <text y={92} className="ex-m">TOKENS / TASK</text>
        <text ref={(e) => { vals.current.tok = e; }} y={126} className="ex-num-l" style={{ fontSize: 26 }} />
        <text x={240} y={92} className="ex-m">GPU-S / TASK</text>
        <text ref={(e) => { vals.current.cost = e; }} x={240} y={126} className="ex-num-l" style={{ fontSize: 26 }} />
        <text y={176} className="ex-ann">+{f.gained.length} gained · −{f.lost.length} regressed · answers got longer</text>
      </g>
      {mode === "dev" && (
        <g>
          <text x={1060} y={690} className="ex-eq">Âᵢ = (rᵢ − mean r) / std r · clip ε = 0.2 · β·KL(π‖π_ref)</text>
          <text x={806} y={LY + 8 * ROW + 18} className="ex-ann">σ = 0 → dropped</text>
        </g>
      )}
    </Surface>
  );
}
