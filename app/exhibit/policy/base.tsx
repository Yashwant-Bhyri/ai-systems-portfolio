"use client";

import { useCallback, useEffect, useRef } from "react";
import { attrs, ease, fitCanvas, fmt, lerp, prog, readTokens, useSceneFrame, type Tokens } from "../engine";
import type { RoomProps } from "../shell";
import { CK, FAMILY_NAMES } from "./data";
import { Surface, TaskField, VB, tileXY, type FieldHandle } from "./parts";

/* P1 · the base checkpoint attempts all 96 tasks once. */

const F = { x: 40, y: 72, cell: 40, gap: 8 };
const ATTEMPT = 520, STAGGER = 46, START = 700;
const doneAt = (i: number) => START + i * STAGGER + ATTEMPT;
const ck = CK.base;
const perFamily = [0, 1, 2].map((f) => ck.solved.slice(f * 32, f * 32 + 32).filter(Boolean).length);
const order = ck.tokens.map((n, i) => [n, i] as const).sort((a, b) => b[0] - a[0]);
const maxTok = Math.max(...ck.tokens);
const p50 = [...ck.tokens].sort((a, b) => a - b)[48], p90 = [...ck.tokens].sort((a, b) => a - b)[86];

export function PolicyBase({ active, mode, clock }: RoomProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const field = useRef<FieldHandle>(null);
  const vals = useRef<Record<string, SVGTextElement | null>>({});
  const fam = useRef<(SVGRectElement | null)[]>([]);
  const tok = useRef<Tokens | null>(null);

  const draw = useCallback((t: number) => {
    const el = canvas.current;
    if (!el) return;
    const T = (tok.current ??= readTokens(el));
    const ctx = fitCanvas(el, VB.w, VB.h);
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
      const h = (n / maxTok) * 150 * bp;
      ctx.fillStyle = ck.solved[i] ? `rgba(${T.roseRgb},0.85)` : `rgba(${T.inkRgb},0.28)`;
      ctx.fillRect(F.x + k * 7.9, 650 - h, 5.6, h);
    });
  }, []);
  useSceneFrame(active, clock.readTime, draw);
  useEffect(() => { tok.current = null; }, [mode]);

  return (
    <Surface ref={canvas} label="The base checkpoint attempts 96 tasks; 28 are solved">
      <text x={F.x} y={F.y - 40} className="ex-m">EVAL · 96 HELD-OUT TASKS · ONE SAMPLE EACH</text>
      <TaskField ref={field} x={F.x} y={F.y} cell={F.cell} gap={F.gap} />
      <g transform="translate(900 72)">
        <text className="ex-m">SOLVED</text>
        <text ref={(e) => { vals.current.solved = e; }} y={92} className="ex-num-xl" style={{ fontSize: 108 }} />
        <text x={250} y={92} className="ex-num-l" style={{ fill: "var(--ex-ink-3)" }}>/ 96</text>
        <text x={380} className="ex-m">PASS@1</text>
        <text ref={(e) => { vals.current.pass = e; }} x={380} y={58} className="ex-num-l" style={{ fill: "var(--ex-rose)" }} />
        <text x={380} y={100} className="ex-m">GPU-S / TASK</text>
        <text ref={(e) => { vals.current.cost = e; }} x={380} y={132} className="ex-num-l" style={{ fontSize: 26 }} />
        <text x={520} y={100} className="ex-m">TOKENS</text>
        <text ref={(e) => { vals.current.tok = e; }} x={520} y={132} className="ex-num-l" style={{ fontSize: 26 }} />
      </g>
      <g transform="translate(900 250)">
        {FAMILY_NAMES.map((f, b) => (
          <g key={f} transform={`translate(0 ${b * 64})`}>
            <text className="ex-m">{f.toUpperCase()}</text>
            <text x={620} className="ex-m-ink" textAnchor="end">{perFamily[b]} / 32</text>
            {Array.from({ length: 32 }, (_, c) => (
              <rect key={c} ref={(e) => { fam.current[b * 32 + c] = e; }} x={c * 19.4} y={14} width={15} height={20} rx={2.5} />
            ))}
          </g>
        ))}
      </g>
      <text x={F.x} y={474} className="ex-m">TOKENS PER ATTEMPT · SORTED · SOLVED IN ROSE</text>
      <path d={`M${F.x} 651H${F.x + 760}`} stroke="var(--ex-line-2)" />
      {mode === "dev" && (
        <g>
          <text x={F.x} y={678} className="ex-ann">p50 {p50.toLocaleString("en-US")} · p90 {p90.toLocaleString("en-US")} · max {maxTok.toLocaleString("en-US")} tokens · greedy · 1× budget</text>
          <text x={900} y={520} className="ex-ann">pass@1 = solved / 96 · held-out from every training stage</text>
        </g>
      )}
    </Surface>
  );
}
