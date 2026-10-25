"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { attrs, ease, lerp, prog } from "../../exhibit/engine";
import { useTr } from "../../exhibit/i18n";
import { compositionMechanisms, type CompositionLens, type CompositionRuns } from "../composition-comparison";
import type { LabRun } from "../lab-simulation";

/**
 * Policy × runtime as one continuous film. Three lenses play in turn: serving
 * only, training only, both. A single point travels hop by hop; every hop is
 * coloured by what it moves (rose = training lifts accuracy, amber = serving
 * cuts GPU-seconds per correct answer), labelled with its delta, and the hero
 * value counts live. The four conditions stay visible as a faint quadrilateral.
 */

const LENSES: readonly { id: CompositionLens; name: string; from: number; to: number }[] = [
  { id: "runtime", name: "Serving only", from: 2, to: 3 },
  { id: "policy", name: "Training only", from: 1, to: 3 },
  { id: "combined", name: "Both together", from: 0, to: 3 },
];
const LENS_MS = 9800;
const TOTAL = LENS_MS * LENSES.length;
const COLOR = { base: "#8d9aab", serve: "#ffc267", train: "#f3a0bc", both: "#f7f1de", ink: "#eef2f6", dim: "#6c7884" };
const NAMES = ["Base · static", "Base · optimized", "RL checkpoint · static", "RL checkpoint · optimized"];
const VB = { w: 1200, h: 610 };
const P = { x0: 92, x1: 742, y0: 520, y1: 70 };
const A0 = 35, A1 = 80;
/* Hop timing inside a lens: settle, travel, hold, travel, hold, total. */
const T = { h1: [1100, 2500], h2: [4300, 5700], total: 7400 };

type Hop = { name: string; metric: "cost" | "accuracy"; before: LabRun; after: LabRun; delta: number };

export function PolicyRuntimeStage({ points, evidence }: { points: CompositionRuns; evidence: (run: LabRun, pause: () => void) => ReactNode }) {
  const tr = useTr();
  const maxCost = Math.ceil((Math.max(...points.map((p) => p.correctCost)) * 1.18) / 10) * 10;
  const X = useCallback((c: number) => P.x0 + (c / maxCost) * (P.x1 - P.x0), [maxCost]);
  const Y = useCallback((a: number) => P.y0 - ((a - A0) / (A1 - A0)) * (P.y0 - P.y1), []);
  const hops = useMemo(() => LENSES.map((l) => compositionMechanisms(points, 3, l.id) as Hop[]), [points]);

  const root = useRef<HTMLDivElement>(null);
  const start = useRef(0);
  const offset = useRef(0);
  const [lens, setLens] = useState(0);
  const [inView, setInView] = useState(false);
  const lensRef = useRef(0);
  // A lens click rewinds the running clock; the frame loop applies it on its next tick.
  const jump = useRef<number | null>(null);

  const dot = useRef<SVGCircleElement>(null), halo = useRef<SVGCircleElement>(null);
  const seg = useRef<(SVGPathElement | null)[]>([]), segTag = useRef<(SVGGElement | null)[]>([]);
  const total = useRef<SVGPathElement>(null), totalTag = useRef<SVGTextElement>(null);
  const hero = useRef<SVGTextElement>(null), heroDelta = useRef<SVGTextElement>(null), sub = useRef<SVGTextElement>(null);
  const rows = useRef<(SVGGElement | null)[]>([]);
  const fill = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const draw = useCallback((t: number) => {
    const li = Math.floor(t / LENS_MS) % LENSES.length, lt = t - li * LENS_MS;
    if (li !== lensRef.current) { lensRef.current = li; setLens(li); }
    const L = LENSES[li], H = hops[li];
    const a = points[L.from], cost = (r: LabRun) => r.correctCost ?? 0;
    const p1 = ease.io(prog(lt, T.h1[0], T.h1[1])), p2 = ease.io(prog(lt, T.h2[0], T.h2[1]));
    const m = H[0].after, b = H[1].after;
    // Every lens ends at post-trained · optimized; the next lens glides back from there, never jumps.
    const back = ease.io(prog(lt, 0, T.h1[0] - 150)), end = points[3];
    const sx = lerp(X(cost(end)), X(cost(a)), back), sy = lerp(Y(end.accuracy), Y(a.accuracy), back);
    const cx = p2 > 0 ? lerp(X(cost(m)), X(cost(b)), p2) : p1 > 0 ? lerp(X(cost(a)), X(cost(m)), p1) : sx;
    const cy = p2 > 0 ? lerp(Y(m.accuracy), Y(b.accuracy), p2) : p1 > 0 ? lerp(Y(a.accuracy), Y(m.accuracy), p1) : sy;
    const tone = (h: Hop) => (h.metric === "cost" ? COLOR.serve : COLOR.train);
    const live = p2 > 0 ? H[1] : H[0];
    attrs(dot.current, { cx, cy, fill: lt > T.total ? COLOR.both : tone(live) });
    attrs(halo.current, { cx, cy, r: 16 + 5 * Math.sin(t / 260), stroke: lt > T.total ? COLOR.both : tone(live) });
    [[a, m, p1], [m, b, p2]].forEach(([from, to, p], k) => {
      const f = from as LabRun, g = to as LabRun, q = p as number;
      attrs(seg.current[k], { d: `M${X(cost(f))} ${Y(f.accuracy)}L${lerp(X(cost(f)), X(cost(g)), q)} ${lerp(Y(f.accuracy), Y(g.accuracy), q)}`, stroke: tone(H[k]), "marker-end": H[k].metric === "cost" ? "url(#prs-arrow-serve)" : "url(#prs-arrow-train)", opacity: q > 0.04 ? 1 : 0 });
      const show = ease.out(prog(lt, (k ? T.h2 : T.h1)[1] - 200, (k ? T.h2 : T.h1)[1] + 300));
      attrs(segTag.current[k], { opacity: show * (lt > T.total ? 0.55 : 1), transform: `translate(${(X(cost(f)) + X(cost(g))) / 2} ${(Y(f.accuracy) + Y(g.accuracy)) / 2})` });
      const lit = (k === 0 && lt > T.h1[0] && lt < T.h2[0]) || (k === 1 && lt > T.h2[0]) || lt > T.total;
      attrs(rows.current[k], { opacity: lt < T.h1[0] ? 0.3 : lit ? 1 : 0.42 });
    });
    const tp = ease.out(prog(lt, T.total, T.total + 900));
    attrs(total.current, { d: `M${X(cost(a))} ${P.y0 + 40}H${lerp(X(cost(a)), X(cost(b)), tp)}`, opacity: tp > 0 && Math.abs(cost(a) - cost(b)) > 0.05 ? 1 : 0 });
    attrs(totalTag.current, { x: (X(cost(a)) + X(cost(b))) / 2, opacity: tp });
    // The hero follows the lens's own question: cost for serving, accuracy for training.
    const costNow = cost(a) + (cost(m) - cost(a)) * p1 + (cost(b) - cost(m)) * p2;
    const accNow = a.accuracy + (m.accuracy - a.accuracy) * p1 + (b.accuracy - m.accuracy) * p2;
    const accuracyLens = L.id === "policy";
    if (hero.current) hero.current.textContent = accuracyLens ? `${accNow.toFixed(1)}%` : costNow.toFixed(2);
    if (sub.current) sub.current.textContent = accuracyLens ? `${costNow.toFixed(2)} GPU-s / correct` : `${accNow.toFixed(1)}% pass@1`;
    if (heroDelta.current) heroDelta.current.textContent = accuracyLens ? `+${(b.accuracy - a.accuracy).toFixed(1)} pp` : `−${(cost(a) - cost(b)).toFixed(2)}  ·  −${(100 * (1 - cost(b) / cost(a))).toFixed(0)}%`;
    attrs(heroDelta.current, { opacity: tp });
    const fadeIn = ease.out(prog(lt, 0, 600));
    attrs(hero.current, { opacity: fadeIn }); attrs(sub.current, { opacity: fadeIn });
    if (fill.current) fill.current.style.transform = `scaleX(${lt / LENS_MS})`;
  }, [hops, points, X, Y]);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { draw(lensRef.current * LENS_MS + LENS_MS - 1); return; }
    if (!inView) { draw(offset.current); return; }
    let raf = 0;
    start.current = performance.now() - offset.current;
    const tick = (now: number) => {
      if (jump.current !== null) { start.current = now - jump.current; jump.current = null; }
      offset.current = (now - start.current) % TOTAL; draw(offset.current); raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, draw]);

  const choose = (i: number) => { jump.current = i * LENS_MS + 1; offset.current = jump.current; draw(offset.current); };
  const L = LENSES[lens], H = hops[lens];
  const corners = points.map((p, i) => ({ x: X(p.correctCost), y: Y(p.accuracy), i }));
  const accuracyLens = L.id === "policy";

  return (
    <div ref={root} className="prs">
      <div className="prs-lenses" role="group" aria-label={tr("Choose the comparison")}>
        {LENSES.map((l, i) => (
          <button key={l.id} type="button" aria-pressed={i === lens} onClick={() => choose(i)}>
            <i style={{ background: l.id === "runtime" ? COLOR.serve : l.id === "policy" ? COLOR.train : COLOR.both }} />
            {tr(l.name)}
            {i === lens && <span className="prs-fill"><span ref={fill} /></span>}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="prs-svg" role="img" aria-label={`${tr(L.name)}: ${H.map((h) => h.name).join(", then ")}`}>
        <defs>
          <marker id="prs-arrow-serve" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill={COLOR.serve} /></marker>
          <marker id="prs-arrow-train" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill={COLOR.train} /></marker>
        </defs>
        <path d={`M${P.x0} ${P.y1}V${P.y0}H${P.x1}`} className="prs-axis" />
        {[40, 50, 60, 70, 80].map((v) => <g key={v}><path d={`M${P.x0} ${Y(v)}H${P.x1}`} className="prs-grid" /><text x={P.x0 - 12} y={Y(v) + 4} className="prs-tick" textAnchor="end">{v}%</text></g>)}
        {Array.from({ length: maxCost / 10 + 1 }, (_, k) => k * 10).map((c) => <text key={c} x={X(c)} y={P.y0 + 22} className="prs-tick" textAnchor="middle">{c}</text>)}
        <text x={P.x0} y={P.y1 - 24} className="prs-axis-label">{tr("PASS@1 ↑")}</text>
        <text x={P.x1} y={P.y0 + 76} className="prs-axis-label" textAnchor="end">{tr("GPU-S / CORRECT")} ←</text>
        {/* the four conditions: training lifts the edge, serving shifts it left */}
        <path d={`M${corners[0].x} ${corners[0].y}L${corners[1].x} ${corners[1].y}L${corners[3].x} ${corners[3].y}L${corners[2].x} ${corners[2].y}Z`} className="prs-quad" />
        {corners.map((c) => (
          <g key={c.i} className="prs-corner" data-on={c.i === L.from || c.i === L.to}>
            <circle cx={c.x} cy={c.y} r={5} />
            <text x={c.x + (c.i % 2 ? -14 : 14)} y={c.y + (c.i < 2 ? 26 : -26)} textAnchor={c.i % 2 ? "end" : "start"}>{tr(NAMES[c.i])}</text>
          </g>
        ))}
        {[0, 1].map((k) => <path key={k} ref={(e) => { seg.current[k] = e; }} className="prs-seg" opacity={0} />)}
        {[0, 1].map((k) => {
          const h = H[k], f = k ? H[0].after : points[L.from], g = h.after;
          const flat = Math.abs(X(f.correctCost ?? 0) - X(g.correctCost ?? 0)) > Math.abs(Y(f.accuracy) - Y(g.accuracy));
          // Horizontal hops label above (first) and below (second); vertical hops label beside.
          const x = flat ? 0 : 16, anchor = flat ? "middle" : "start", y1 = flat ? (k ? 30 : -30) : -8, y2 = flat ? (k ? 50 : -10) : 14;
          return (
            <g key={k} ref={(e) => { segTag.current[k] = e; }} opacity={0}>
              <text className="prs-hop-name" x={x} y={y1} textAnchor={anchor}>{tr(h.name)}</text>
              <text className="prs-hop-delta" x={x} y={y2} textAnchor={anchor} style={{ fill: h.metric === "cost" ? COLOR.serve : COLOR.train }}>
                {h.metric === "cost" ? (h.delta === 0 ? "= 0 GPU-s" : `−${h.delta.toFixed(2)} GPU-s`) : `+${h.delta.toFixed(1)} pp`}
              </text>
            </g>
          );
        })}
        <path ref={total} className="prs-total" opacity={0} />
        <text ref={totalTag} y={P.y0 + 58} className="prs-total-tag" textAnchor="middle" opacity={0}>{tr("total")}</text>
        <circle ref={halo} r={16} className="prs-halo" />
        <circle ref={dot} r={8} className="prs-dot" />
        {/* the readout column */}
        <g transform="translate(820 92)">
          <text className="prs-kicker">{tr(accuracyLens ? "PASS@1" : "GPU-S / CORRECT")}</text>
          <text ref={hero} y={64} className="prs-hero" />
          <text ref={heroDelta} y={104} className="prs-hero-delta" opacity={0} />
          <text ref={sub} y={140} className="prs-sub" />
          {H.map((h, k) => (
            <g key={h.name} ref={(e) => { rows.current[k] = e; }} transform={`translate(0 ${206 + k * 82})`} opacity={0.3}>
              <text className="prs-row-step">{String(k + 1).padStart(2, "0")}</text>
              <rect x={34} y={-11} width={10} height={10} rx={2} fill={h.metric === "cost" ? COLOR.serve : COLOR.train} />
              <text x={54} className="prs-row-name">{tr(h.name)}</text>
              <text x={54} y={28} className="prs-row-delta">
                {h.metric === "cost" ? `${(h.before.correctCost ?? 0).toFixed(2)} → ${(h.after.correctCost ?? 0).toFixed(2)} GPU-s` : `${h.before.accuracy.toFixed(1)} → ${h.after.accuracy.toFixed(1)}%`}
              </text>
            </g>
          ))}
          <text y={400} className="prs-note">{tr(accuracyLens ? "same runtime, a better policy" : L.id === "runtime" ? "same 67 correct answers, less work each" : "the gains compose")}</text>
        </g>
      </svg>
      <div className="prs-foot">{evidence(points[3], () => undefined)}</div>
    </div>
  );
}
