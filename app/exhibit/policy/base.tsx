"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTr } from "../i18n";
import { attrs, ease, fitCanvas, fmt, lerp, prog, readTokens, useSceneFrame, type Tokens } from "../engine";
import type { RoomProps } from "../shell";
import { CK, FAMILY_NAMES } from "./data";
import { Surface, TALL_W, TaskField, VB, tileXY, type FieldHandle } from "./parts";

/* P1 · the base checkpoint attempts all 96 tasks once. */

const WIDE = {
  vb: VB,
  f: { x: 40, y: 72, cell: 40, gap: 8 },
  score: { x: 900, y: 72, slash: 250, col: 380, col2: 520, big: 108 },
  fam: { x: 900, y: 250, row: 64, step: 19.4, w: 15, end: 620 },
  bar: { x: 40, base: 650, step: 7.9, w: 5.6, h: 150, label: 474, end: 800 },
  dev: { stats: [40, 678], note: [900, 520] },
};
const TALL = {
  vb: { w: TALL_W, h: 1000 },
  f: { x: 52, y: 76, cell: 26, gap: 5 },
  score: { x: 24, y: 370, slash: 170, col: 290, col2: 450, big: 92 },
  fam: { x: 24, y: 570, row: 64, step: 17, w: 13, end: 568 },
  bar: { x: 24, base: 948, step: 5.6, w: 4, h: 130, label: 780, end: 562 },
  dev: { stats: [24, 980], note: [24, 540] },
};
const ATTEMPT = 520, STAGGER = 46, START = 700;
const doneAt = (i: number) => START + i * STAGGER + ATTEMPT;
const ck = CK.base;
const perFamily = [0, 1, 2].map((f) => ck.solved.slice(f * 32, f * 32 + 32).filter(Boolean).length);
const order = ck.tokens.map((n, i) => [n, i] as const).sort((a, b) => b[0] - a[0]);
const maxTok = Math.max(...ck.tokens);
const p50 = [...ck.tokens].sort((a, b) => a - b)[48], p90 = [...ck.tokens].sort((a, b) => a - b)[86];

export function PolicyBase({ active, mode, clock, tall }: RoomProps) {
  const L = tall ? TALL : WIDE;
  const F = L.f;
  const tr = useTr();
  const canvas = useRef<HTMLCanvasElement>(null);
  const field = useRef<FieldHandle>(null);
  const vals = useRef<Record<string, SVGTextElement | null>>({});
  const fam = useRef<(SVGRectElement | null)[]>([]);
  const tok = useRef<Tokens | null>(null);

  const draw = useCallback((t: number) => {
    const el = canvas.current;
    if (!el) return;
    const T = (tok.current ??= readTokens(el));
    const ctx = fitCanvas(el, L.vb.w, L.vb.h);
    // each attempt streams its tokens across the tile, then resolves
    for (let i = 0; i < 96; i++) {
      const s = START + i * STAGGER, p = prog(t, s, s + ATTEMPT);
      if (p <= 0 || p >= 1) continue;
      const [x, y] = tileXY(i, F.x, F.y, F.cell, F.gap);
      const len = (ck.tokens[i] / maxTok) * F.cell;
      ctx.fillStyle = `rgba(${T.inkRgb},0.75)`;
      ctx.fillRect(x + 4, y + F.cell / 2 - 2, Math.max(2, len * p - 8), 4);
    }
    let solved = 0;
    field.current?.paint((i) => {
      if (t < doneAt(i)) return t > START + i * STAGGER ? "probe" : "off";
      if (ck.solved[i]) { solved++; return "on"; }
      return "off";
    }, T, T.rose, (i) => 1 - prog(t, doneAt(i), doneAt(i) + 600));
    const set = (k: string, s: string) => { const e = vals.current[k]; if (e && e.textContent !== s) e.textContent = s; };
    set("solved", `${solved}`);
    set("pass", `${fmt((solved / 96) * 100, 1)}%`);
    const famP = ease.out(prog(t, doneAt(95), doneAt(95) + 1200));
    fam.current.forEach((r, k) => {
      const f = Math.floor(k / 32), c = k % 32;
      attrs(r, { "fill-opacity": c < perFamily[f] ? 0.85 * famP : 0.1, fill: c < perFamily[f] ? T.rose : T.ink });
    });
    set("cost", fmt(lerp(0, ck.costPerTask, ease.out(prog(t, doneAt(95), doneAt(95) + 900)))));
    set("tok", Math.round(lerp(0, ck.tokensPerTask, ease.out(prog(t, doneAt(95), doneAt(95) + 900)))).toLocaleString("en-US"));
    // token barcode: every task's length, sorted, coloured by outcome
    const bp = ease.out(prog(t, doneAt(95) + 300, doneAt(95) + 1500));
    order.forEach(([n, i], k) => {
      const h = (n / maxTok) * L.bar.h * bp;
      ctx.fillStyle = ck.solved[i] ? `rgba(${T.roseRgb},0.85)` : `rgba(${T.inkRgb},0.28)`;
      ctx.fillRect(L.bar.x + k * L.bar.step, L.bar.base - h, L.bar.w, h);
    });
  }, [L, F]);
  useSceneFrame(active, clock.readTime, draw);
  useEffect(() => { tok.current = null; }, [mode]);

  return (
    <Surface ref={canvas} vb={L.vb} label="The base checkpoint attempts 96 tasks; 28 are solved">
      <text x={F.x} y={F.y - 40} className="ex-m">{tr(tall ? "EVAL · 96 TASKS · PASS@1" : "EVAL · 96 HELD-OUT TASKS · ONE SAMPLE EACH")}</text>
      <TaskField ref={field} x={F.x} y={F.y} cell={F.cell} gap={F.gap} />
      <g transform={`translate(${L.score.x} ${L.score.y})`}>
        <text className="ex-m">{tr("SOLVED")}</text>
        <text ref={(e) => { vals.current.solved = e; }} y={92} className="ex-num-xl" style={{ fontSize: L.score.big }} />
        <text x={L.score.slash} y={92} className="ex-num-l" style={{ fill: "var(--ex-ink-3)" }}>/ 96</text>
        <text x={L.score.col} className="ex-m">PASS@1</text>
        <text ref={(e) => { vals.current.pass = e; }} x={L.score.col} y={58} className="ex-num-l" style={{ fill: "var(--ex-rose)" }} />
        <text x={L.score.col} y={100} className="ex-m">{tr("GPU-S / TASK")}</text>
        <text ref={(e) => { vals.current.cost = e; }} x={L.score.col} y={132} className="ex-num-l" style={{ fontSize: 26 }} />
        <text x={L.score.col2} y={100} className="ex-m">{tr("TOKENS")}</text>
        <text ref={(e) => { vals.current.tok = e; }} x={L.score.col2} y={132} className="ex-num-l" style={{ fontSize: 26 }} />
      </g>
      <g transform={`translate(${L.fam.x} ${L.fam.y})`}>
        {FAMILY_NAMES.map((f, b) => (
          <g key={f} transform={`translate(0 ${b * L.fam.row})`}>
            <text className="ex-m">{tr(f.toUpperCase())}</text>
            <text x={L.fam.end} className="ex-m-ink" textAnchor="end">{perFamily[b]} / 32</text>
            {Array.from({ length: 32 }, (_, c) => (
              <rect key={c} ref={(e) => { fam.current[b * 32 + c] = e; }} x={c * L.fam.step} y={14} width={L.fam.w} height={20} rx={2.5} />
            ))}
          </g>
        ))}
      </g>
      <text x={L.bar.x} y={L.bar.label} className="ex-m">{tr("TOKENS PER ATTEMPT · SORTED · SOLVED IN ROSE")}</text>
      <path d={`M${L.bar.x} ${L.bar.base + 1}H${L.bar.end}`} stroke="var(--ex-line-2)" />
      {mode === "dev" && (
        <g>
          <text x={L.dev.stats[0]} y={L.dev.stats[1]} className="ex-ann">p50 {p50.toLocaleString("en-US")} · p90 {p90.toLocaleString("en-US")} · max {maxTok.toLocaleString("en-US")} tokens{tall ? "" : " · greedy · 1× budget"}</text>
          <text x={L.dev.note[0]} y={L.dev.note[1]} className="ex-ann">{tr("pass@1 = solved / 96 · held-out from every training stage")}</text>
        </g>
      )}
    </Surface>
  );
}
