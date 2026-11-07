"use client";

import { useCallback, useEffect, useRef } from "react";
import { attrs, ease, fitCanvas, fmt, lerp, prog, readTokens, rng, useSceneFrame, type Tokens } from "../engine";
import type { RoomProps } from "../shell";
import { CK, flips } from "./data";
import { Surface, TALL_W, TaskField, VB, type FieldHandle } from "./parts";
import { useTr } from "../i18n";

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
const G = 8;
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
const WIDE = {
  vb: VB, lx: 110, ly: 74, lane: 84, row: 40, pl: 40, sk: { step: 7, w: 5, h: 12, y: 8 },
  mean: { x: 806, w: 80, tx: 896 }, ter: { x0: 110, x1: 782, y: 668, lines: 26, depth: 170, h: 130 }, terLabel: 704,
  field: { x: 1060, y: 104, cell: 26, gap: 5 }, read: { x: 1060, y: 400, col: 240 }, ann: 176, eq: [1060, 690],
};
const TALL = {
  vb: { w: TALL_W, h: 1270 }, lx: 56, ly: 70, lane: 47, row: 34, pl: 18, sk: { step: 5, w: 3.5, h: 10, y: 8 },
  mean: { x: 436, w: 44, tx: 488 }, ter: { x0: 40, x1: 560, y: 640, lines: 22, depth: 150, h: 110 }, terLabel: 676,
  field: { x: 52, y: 760, cell: 26, gap: 5 }, read: { x: 24, y: 1050, col: 300 }, ann: 170, eq: [24, 1256],
};
function baseDensity(x: number) {
  const g = (m: number, s: number) => Math.exp(-((x - m) ** 2) / (2 * s * s));
  return 0.5 * g(0.3, 0.12) + 0.35 * g(0.62, 0.1) + 0.2 * g(0.85, 0.06) + 0.05;
}
/** The policy after `s` iterations' worth of updates: rewarded attempts grow and sharpen. */
function updated(x: number, s = 1) {
  let v = baseDensity(x);
  const width = 0.03 / (1 + 0.28 * s);
  for (let p = 0; p < G; p++) for (let k = 0; k < G; k++) {
    const a = ADV[p][k];
    if (a) v += 0.035 * (0.6 + 0.65 * s) * a * Math.exp(-((x - POS[p][k]) ** 2) / (2 * width * width));
  }
  return Math.max(0.02, v);
}
const ITERATIONS = 4;
const mix = (a: readonly number[], b: readonly number[], k: number) => a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(",");
const LIGHT = [250, 214, 228], DEEP = [226, 62, 124];
const f = flips(CK.sft, CK.rl);
const gained = new Set(f.gained), lost = new Set(f.lost);
const T_GEN = 600, T_VER = 2400, T_MEAN = 3400, T_ADV = 4400, T_UPD = 5400, T_ITER = 1900, T_FLIP = T_UPD + ITERATIONS * T_ITER, T_END = T_FLIP + 3400;

export function PolicyGrpo({ active, mode, clock, tall }: RoomProps) {
  const L = tall ? TALL : WIDE;
  const { lx: LX, ly: LY, lane: LANE, row: ROW, ter: TER } = L;
  const tr = useTr();
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
    const ctx = fitCanvas(el, L.vb.w, L.vb.h);
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
      for (let c = 0; c * L.sk.step < w; c++) {
        ctx.fillStyle = `rgba(${col},${(alpha * (0.6 + 0.4 * ((c * 5 + k) % 3) / 2)).toFixed(3)})`;
        ctx.fillRect(x + c * L.sk.step, y + L.sk.y, L.sk.w, L.sk.h);
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
      attrs(means.current[p], { width: L.mean.w * s.m * mp, fill: s.dead ? T.ink3 : T.rose, "fill-opacity": s.dead ? 0.4 : 0.8 });
      const tx = meanTxt.current[p];
      if (tx) tx.textContent = mp > 0.05 ? `${Math.round(s.m * G)} of ${G} pass` : "";
      attrs(drops.current[p], { opacity: s.dead ? prog(t, T_MEAN + 600, T_MEAN + 1200) : 0 });
    });

    // the policy terrain: a ridge field that reshapes under the advantages
    const iterF = Math.max(0, Math.min(ITERATIONS, (t - T_UPD) / T_ITER));
    const done = Math.floor(iterF);
    const step = done + ease.io(iterF - done);
    const deep = step / ITERATIONS;
    const N = 110, fu = new Float32Array(N + 1);
    for (let s = 0; s <= N; s++) fu[s] = step <= 0 ? baseDensity(s / N) : updated(s / N, step);
    const iterText = vals.current.iter;
    if (iterText) iterText.textContent = t < T_UPD ? "" : t >= T_FLIP ? `After ${ITERATIONS} iterations` : `Iteration ${Math.min(ITERATIONS, done + 1)} of ${ITERATIONS}`;
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
      const a = (0.14 + 0.66 * (1 - z)) * prog(t, 0, 900);
      const shade = mix(LIGHT, DEEP, deep);
      if (mode === "dev" && z < 0.5) { ctx.strokeStyle = `rgba(${shade},${(a * 0.18).toFixed(3)})`; ctx.lineWidth = 5; ctx.stroke(); }
      ctx.strokeStyle = `rgba(${shade},${a.toFixed(3)})`;
      ctx.lineWidth = 1.2 + 0.5 * deep;
      ctx.stroke();
    }
    // update particles drop from scored rollouts into the policy at their positions
    if (t > T_UPD - 300 && t < T_FLIP) {
      const local = T_UPD + done * T_ITER;
      for (let p = 0; p < G; p++) for (let k = 0; k < G; k++) {
        const a = ADV[p][k];
        if (!a) continue;
        const q = prog(t, local - 300 + (p + k) * 40, local + 900 + (p + k) * 40);
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
    // pass@1 follows the solved count exactly; per-task costs switch once the flips land.
    set("pass", `${fmt((100 * solved) / 96, 1)}%`);
    set("tok", Math.round(c >= 0.999 ? CK.rl.tokensPerTask : CK.sft.tokensPerTask).toLocaleString("en-US"));
    set("cost", fmt(c >= 0.999 ? CK.rl.costPerTask : CK.sft.costPerTask));
  }, [mode, L, LX, LY, LANE, ROW, TER]);
  useSceneFrame(active, clock.readTime, draw);
  useEffect(() => { tok.current = null; }, [mode]);

  return (
    <Surface ref={canvas} vb={L.vb} label="GRPO: eight rollouts per prompt are scored by a verifier and normalised within their group">
      <text x={tall ? L.pl : LX} y={LY - 30} className="ex-m">{tr(tall ? "8 tasks × 8 attempts" : "8 tasks × 8 attempts, each scored by its tests")}</text>
      {R.map((_, p) => (
        <g key={p}>
          <text x={L.pl} y={LY + p * ROW + 20} className="ex-m">{p + 1}</text>
          <rect ref={(e) => { means.current[p] = e; }} x={L.mean.x} y={LY + p * ROW + 8} height={L.sk.h} rx={2} width={0} />
          <text ref={(e) => { meanTxt.current[p] = e; }} x={L.mean.tx} y={LY + p * ROW + 19} className="ex-m" />
          <text ref={(e) => { drops.current[p] = e; }} x={L.mean.x} y={LY + p * ROW + (tall ? 32 : 36)} className="ex-ann" opacity={0}>{tall ? "σ = 0" : tr("all the same: no signal")}</text>
          {R[p].map((_, k) => <rect key={k} ref={(e) => { marks.current[p * G + k] = e; }} y={LY + p * ROW + 8} width={tall ? 6 : 8} height={L.sk.h} rx={2} opacity={0} />)}
        </g>
      ))}
      <text x={L.mean.x} y={LY - 30} className="ex-m">{tr(tall ? "Group" : "Group result")}</text>
      <text x={TER.x0} y={L.terLabel} className="ex-m">{tr(tall ? "Attempts that pass get more likely" : "Policy: passing attempts become more likely")}</text>
      <text ref={(e) => { vals.current.iter = e; }} x={TER.x1} y={L.terLabel} textAnchor="end" className="ex-m-ink" style={{ fill: "var(--ex-rose)", fontSize: 17 }} />
      <text x={L.field.x} y={L.field.y - 44} className="ex-m">{tr("The 96 tasks, SFT → GRPO")}</text>
      <TaskField ref={field} x={L.field.x} y={L.field.y} cell={L.field.cell} gap={L.field.gap} />
      <g transform={`translate(${L.read.x} ${L.read.y})`}>
        <text className="ex-m">{tr("Solved")}</text>
        <text ref={(e) => { vals.current.solved = e; }} y={40} className="ex-num-l" />
        <text x={L.read.col} className="ex-m">{tr("First try right")}</text>
        <text ref={(e) => { vals.current.pass = e; }} x={L.read.col} y={40} className="ex-num-l" style={{ fill: "var(--ex-rose)" }} />
        <text y={92} className="ex-m">{tr("Tokens per task")}</text>
        <text ref={(e) => { vals.current.tok = e; }} y={126} className="ex-num-l" style={{ fontSize: 26 }} />
        <text x={L.read.col} y={92} className="ex-m">{tr("GPU-s per task")}</text>
        <text ref={(e) => { vals.current.cost = e; }} x={L.read.col} y={126} className="ex-num-l" style={{ fontSize: 26 }} />
        <text y={L.ann} className="ex-ann">+{f.gained.length} {tr("gained")} · −{f.lost.length} {tr("regressed")} · {tr("answers got longer")}</text>
      </g>
      {mode === "dev" && (
        <g>
          <text x={L.eq[0]} y={L.eq[1]} className="ex-eq">{tall ? "Âᵢ = (rᵢ − r̄) / σ · clip ε 0.2" : "Âᵢ = (rᵢ − mean r) / std r · clip ε = 0.2 · β·KL(π‖π_ref)"}</text>
          {!tall && <text x={L.mean.x} y={LY + 8 * ROW + 18} className="ex-ann">σ = 0 → dropped</text>}
        </g>
      )}
    </Surface>
  );
}
