"use client";

import { useEffect } from "react";

/** Timeline arithmetic shared by every exhibit scene. Times are milliseconds. */
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const ease = {
  out: (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  io: (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  sine: (p: number) => 0.5 - 0.5 * Math.cos(Math.PI * p),
};
export const fmt = (n: number, d = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

export const SVG_NS = "http://www.w3.org/2000/svg";

/** Write attributes without going through React. */
export function attrs(el: Element | null | undefined, values: Record<string, string | number>) {
  if (!el) return;
  for (const k in values) el.setAttribute(k, String(values[k]));
}

/** Read the exhibit tokens once per mode change; canvas code needs raw strings. */
export function readTokens(el: Element) {
  const s = getComputedStyle(el);
  const g = (n: string) => s.getPropertyValue(n).trim();
  return {
    ink: g("--ex-ink"), ink2: g("--ex-ink-2"), ink3: g("--ex-ink-3"), line: g("--ex-line"),
    amber: g("--ex-amber"), rose: g("--ex-rose"), cyan: g("--ex-cyan"), lime: g("--ex-lime"),
    red: g("--ex-red"), blue: g("--ex-blue"), green: g("--ex-green"), void: g("--ex-void"),
    roseRgb: g("--ex-rose-rgb"), amberRgb: g("--ex-amber-rgb"), cyanRgb: g("--ex-cyan-rgb"),
    inkRgb: g("--ex-ink-rgb"), redRgb: g("--ex-red-rgb"), greenRgb: g("--ex-green-rgb"),
  };
}
export type Tokens = ReturnType<typeof readTokens>;

/**
 * Run `draw(t)` every animation frame while `active`, where t is the room clock in ms.
 * React renders the scene's structure once; this loop owns every per-frame write.
 */
export function useSceneFrame(
  active: boolean,
  readTime: () => number,
  draw: (t: number) => void,
) {
  useEffect(() => {
    let raf = 0;
    if (!active) {
      raf = requestAnimationFrame(() => draw(readTime()));
      return () => cancelAnimationFrame(raf);
    }
    const tick = () => {
      draw(readTime());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, readTime, draw]);
}

/** Canvas sized to its box at device resolution, drawing in the scene's viewBox units. */
export function fitCanvas(canvas: HTMLCanvasElement, vw: number, vh: number) {
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  const ctx = canvas.getContext("2d")!;
  const s = Math.min(r.width / vw, r.height / vh);
  const ox = (r.width - vw * s) / 2, oy = (r.height - vh * s) / 2;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * oy);
  return ctx;
}

/** Stable pseudo-random numbers so textures never shimmer between frames. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
