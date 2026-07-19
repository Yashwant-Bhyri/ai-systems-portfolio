"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * Live-operations engine. Every operational graphic is a pure function of a
 * sim clock: useSim(active) returns total elapsed ms (rAF-driven, frozen when
 * the chapter is off screen or the tour is paused). Scenes derive ALL state
 * from t — so pausing freezes the whole operation coherently, and loops are
 * deterministic.
 */
export function useSim(active: boolean): number {
  const [t, setT] = useState(0);
  const acc = useRef(0);
  const last = useRef<number | null>(null);
  useEffect(() => {
    if (!active) {
      last.current = null;
      return;
    }
    let raf = 0;
    const step = (now: number) => {
      if (last.current != null) acc.current += Math.min(200, now - last.current);
      last.current = now;
      setT(acc.current);
    };
    const tick = (now: number) => {
      step(now);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Watchdog: rAF stops entirely in hidden/background pages — keep the
    // operation alive (browser throttles this to ~1 Hz when hidden, fine).
    const guard = setInterval(() => {
      const now = performance.now();
      if (last.current == null || now - last.current > 120) step(now);
    }, 66);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(guard);
      last.current = null;
    };
  }, [active]);
  return t;
}

/** quantize computed geometry so SSR and client serialize identically */
export const q = (v: number) => Math.round(v * 10) / 10;

/** phase progress: 0 before a, 1 after b, linear between. */
export const ph = (t: number, a: number, b: number) => Math.max(0, Math.min(1, (t - a) / (b - a)));

/** smoothstep ease */
export const ez = (p: number) => p * p * (3 - 2 * p);

/** eased phase */
export const eph = (t: number, a: number, b: number) => ez(ph(t, a, b));

/** 0..1 sine pulse */
export const pulse = (t: number, period = 900) => 0.5 + 0.5 * Math.sin((t / period) * Math.PI * 2);

/** deterministic organic noise in [0,1] per (index, time) */
export const noise = (i: number, t: number) =>
  Math.abs(Math.sin(i * 3.7 + t / 87) * Math.sin(i * 1.31 + t / 211) * Math.cos(i * 0.71 + t / 149));

/** quadratic bezier point for flying chips */
export const bez = (p: number, a: [number, number], c: [number, number], b: [number, number]): [number, number] => {
  const q = 1 - p;
  return [q * q * a[0] + 2 * q * p * c[0] + p * p * b[0], q * q * a[1] + 2 * q * p * c[1] + p * p * b[1]];
};

/**
 * Retype prev→next with progress p: deletes the divergent tail of prev
 * (backspace), then types the new tail. The heart of "live transcription".
 */
export function retype(prev: string, next: string, p: number): string {
  let cp = 0;
  while (cp < prev.length && cp < next.length && prev[cp] === next[cp]) cp++;
  const del = prev.length - cp;
  const ins = next.length - cp;
  const k = Math.round(p * (del + ins));
  if (k <= del) return prev.slice(0, prev.length - k);
  return next.slice(0, cp + (k - del));
}

export type Key = { at: number; end: number; text: string };

/** Run a keyframed typing script (with revisions) against the clock. */
export function script(keys: Key[], t: number): string {
  let txt = "";
  for (const k of keys) {
    if (t < k.at) break;
    txt = retype(txt, k.text, ph(t, k.at, k.end));
  }
  return txt;
}

/** simple left-to-right typing */
export const typed = (text: string, t: number, at: number, end: number) =>
  text.slice(0, Math.round(eph(t, at, end) * text.length));

/** blinking caret glyph, empty when scene idle */
export const caret = (t: number, on = true) => (on && Math.floor(t / 440) % 2 === 0 ? "▌" : " ");

/** style for pop-in elements, driven by the clock (no CSS keyframes) */
export const rise = (p: number, dy = 10): CSSProperties => ({
  opacity: p,
  transform: `translateY(${(1 - p) * dy}px)`,
});

/** live audio waveform — bar heights recomputed every frame */
export function Wave({
  x,
  y,
  w,
  h,
  bars = 22,
  t,
  on = 1,
  cls = "lw",
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  bars?: number;
  t: number;
  on?: number; // 0 = silent flatline, 1 = talking
  cls?: string;
}) {
  const bw = w / bars;
  return (
    <g transform={`translate(${x},${y})`}>
      {Array.from({ length: bars }).map((_, i) => {
        const env = Math.sin((i / bars) * Math.PI); // rounded envelope
        const a = 0.1 + 0.9 * on * (0.25 + 0.75 * noise(i, t)) * env;
        const bh = q(Math.max(2.5, h * a));
        return (
          <rect key={i} x={q(i * bw)} y={q((h - bh) / 2)} width={q(Math.max(1.5, bw - 3))} height={bh} rx={1.5} className={cls} />
        );
      })}
    </g>
  );
}

/** monospace live counter text, e.g. running milliseconds */
export function fmtMs(v: number): string {
  return `${Math.round(v)} ms`;
}
