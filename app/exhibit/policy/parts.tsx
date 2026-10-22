"use client";

import { forwardRef, useImperativeHandle, useRef, type ReactNode } from "react";
import { attrs, type Tokens } from "../engine";
import { FAMILY_NAMES } from "./data";

export const VB = { w: 1600, h: 720 };

/** The stage drawing surface: a canvas for mass, an SVG for vectors and labels, sharing one viewBox. */
export const Surface = forwardRef<HTMLCanvasElement, { children?: ReactNode; label: string }>(function Surface({ children, label }, ref) {
  return (
    <div className="pw-surface">
      <canvas ref={ref} className="ex-canvas" aria-hidden="true" />
      <svg className="ex-svg" viewBox={`0 0 ${VB.w} ${VB.h}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={label}>
        {children}
      </svg>
    </div>
  );
});

/* ---------------- the 96-task field ---------------- */

export type TileState = "off" | "on" | "gained" | "lost" | "probe";
export type FieldHandle = {
  paint: (state: (i: number) => TileState, t: Tokens, accent: string, glow?: (i: number) => number, fill?: number) => void;
  center: (i: number) => [number, number];
};

const COLS = 16;
export function tileXY(i: number, x: number, y: number, cell: number, gap: number) {
  const row = Math.floor(i / COLS), col = i % COLS, band = Math.floor(row / 2);
  return [x + col * (cell + gap), y + row * (cell + gap) + band * 30] as const;
}

/** 96 tasks in three bands of 32. Every task keeps its square in every room. */
export const TaskField = forwardRef<FieldHandle, { x: number; y: number; cell?: number; gap?: number; labels?: boolean }>(
  function TaskField({ x, y, cell = 26, gap = 6, labels = true }, ref) {
    const tiles = useRef<(SVGRectElement | null)[]>([]);
    const rings = useRef<(SVGRectElement | null)[]>([]);
    useImperativeHandle(ref, () => ({
      center: (i) => {
        const [tx, ty] = tileXY(i, x, y, cell, gap);
        return [tx + cell / 2, ty + cell / 2];
      },
      paint: (state, t, accent, glow, fill = 1) => {
        for (let i = 0; i < 96; i++) {
          const s = state(i), el = tiles.current[i], ring = rings.current[i];
          const g = glow ? glow(i) : 0;
          if (s === "off") attrs(el, { fill: "none", stroke: t.ink3, "stroke-opacity": 0.42, "stroke-width": 1.2 });
          else if (s === "on") attrs(el, { fill: accent, "fill-opacity": (0.5 + 0.5 * g) * fill, stroke: accent, "stroke-opacity": 0.9, "stroke-width": 1.2 });
          else if (s === "gained") attrs(el, { fill: accent, "fill-opacity": fill, stroke: t.ink, "stroke-opacity": 0.9, "stroke-width": 1.4 });
          else if (s === "lost") attrs(el, { fill: t.red, "fill-opacity": 0.18, stroke: t.red, "stroke-opacity": 1, "stroke-width": 2.2 });
          else attrs(el, { fill: t.ink, "fill-opacity": 0.08 + 0.3 * g, stroke: t.ink2, "stroke-opacity": 0.5, "stroke-width": 1.2 });
          attrs(ring, { opacity: s === "gained" ? Math.max(0, 1 - g) * 0.9 : 0, stroke: accent });
        }
      },
    }), [x, y, cell, gap]);
    return (
      <g>
        {labels && FAMILY_NAMES.map((f, b) => (
          <text key={f} x={x} y={y + b * (2 * (cell + gap) + 30) - 9} className="ex-m">{f.toUpperCase()}</text>
        ))}
        {Array.from({ length: 96 }, (_, i) => {
          const [tx, ty] = tileXY(i, x, y, cell, gap);
          return (
            <g key={i}>
              <rect ref={(el) => { rings.current[i] = el; }} x={tx - 4} y={ty - 4} width={cell + 8} height={cell + 8} rx={7} fill="none" strokeWidth={1.4} opacity={0} />
              <rect ref={(el) => { tiles.current[i] = el; }} x={tx} y={ty} width={cell} height={cell} rx={5} fill="none" />
            </g>
          );
        })}
      </g>
    );
  },
);
export const fieldSize = (cell = 26, gap = 6) => ({ w: COLS * (cell + gap) - gap, h: 6 * (cell + gap) - gap + 60 });

/* ---------------- a telemetry readout ---------------- */

/** A labelled number that the frame loop rewrites. Label is a term of art, the value is mono. */
export function Readout({ x, y, label, anchor = "start", big = false, refValue }: {
  x: number; y: number; label: string; anchor?: "start" | "end" | "middle"; big?: boolean;
  refValue: (el: SVGTextElement | null) => void;
}) {
  return (
    <g>
      <text x={x} y={y} className="ex-m" textAnchor={anchor}>{label}</text>
      <text ref={refValue} x={x} y={y + (big ? 50 : 30)} className={big ? "ex-num-xl" : "ex-num-l"} textAnchor={anchor} />
    </g>
  );
}
