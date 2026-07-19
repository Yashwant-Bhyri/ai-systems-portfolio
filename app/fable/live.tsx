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

/**
 * Live layered neural net (V2 SignalMesh topology, clock-driven):
 * inputs → hidden layer → core → outputs, edges firing in waves,
 * pulses traveling, core glow accumulating. Pure function of t.
 */
export function LiveNet({
  x,
  y,
  w,
  h,
  inputs,
  hidden = 5,
  core,
  outputs,
  t,
  start = 0,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  inputs: { label: string; value?: string }[];
  hidden?: number;
  core: string;
  outputs: string[];
  t: number;
  start?: number;
}) {
  const inX = x + 54;
  const hidX = x + w * 0.44;
  const coreX = x + w * 0.66;
  const outX = x + w - 52;
  const coreY = y + h / 2;
  const inY = (i: number) => y + (h * (i + 0.5)) / inputs.length;
  const hidY = (j: number) => y + (h * (j + 0.5)) / hidden;
  const outY = (k: number) => y + (h * (k + 0.5)) / outputs.length;
  const on = t > start;
  const glow = eph(t, start + 400, start + 2200);

  return (
    <g className="lv-net">
      {/* input → hidden edges, firing in waves */}
      {inputs.map((_, i) =>
        Array.from({ length: hidden }).map((_, j) => {
          const fire = on ? 0.3 + 0.7 * noise(i * 7 + j * 3, t / 1.6) : 0.1;
          return (
            <line
              key={`ih${i}-${j}`}
              x1={inX + 46}
              y1={q(inY(i))}
              x2={q(hidX)}
              y2={q(hidY(j))}
              className="lv-netedge"
              style={{ opacity: 0.06 + 0.3 * fire }}
            />
          );
        }),
      )}
      {/* hidden → core */}
      {Array.from({ length: hidden }).map((_, j) => (
        <line key={`hc${j}`} x1={q(hidX)} y1={q(hidY(j))} x2={q(coreX - 24)} y2={q(coreY)} className="lv-netedge" style={{ opacity: on ? 0.12 + 0.4 * noise(j * 5 + 2, t / 1.4) : 0.08 }} />
      ))}
      {/* traveling pulses on a rotating pair of edges */}
      {on &&
        [0, 1].map((k) => {
          const which = (Math.floor(t / 700) + k * 3) % (inputs.length * hidden);
          const i = which % inputs.length;
          const j = Math.floor(which / inputs.length) % hidden;
          const p = (t % 700) / 700;
          return (
            <circle
              key={`pl${k}`}
              cx={q(inX + 46 + (hidX - inX - 46) * p)}
              cy={q(inY(i) + (hidY(j) - inY(i)) * p)}
              r={3}
              className="lv-pulse"
              style={{ opacity: 0.8 }}
            />
          );
        })}
      {/* input chips */}
      {inputs.map((inp, i) => (
        <g key={inp.label} className="lv-chip">
          <rect x={x} y={q(inY(i) - 11)} width={100} height={22} rx={7} />
          <text x={x + 8} y={q(inY(i) + 4)} className="svg-mono tinytext">{inp.label}</text>
          {inp.value && <text x={x + 96} y={q(inY(i) + 4)} textAnchor="end" className="svg-sub tiny">{inp.value}</text>}
        </g>
      ))}
      {/* hidden nodes */}
      {Array.from({ length: hidden }).map((_, j) => (
        <circle key={`h${j}`} cx={q(hidX)} cy={q(hidY(j))} r={4.4} className="lv-hidnode" style={{ opacity: on ? 0.45 + 0.55 * noise(j * 9 + 1, t / 1.8) : 0.25 }} />
      ))}
      {/* core */}
      <g style={{ opacity: 0.5 + 0.5 * glow }}>
        <circle cx={q(coreX)} cy={q(coreY)} r={25} className="lv-corering" />
        <text x={q(coreX)} y={q(coreY + 4)} textAnchor="middle" className="svg-label small">{core}</text>
      </g>
      {/* core → outputs */}
      {outputs.map((o, k) => {
        const fired = t > start + 1600 + k * 350;
        const p = ph(t, start + 1600 + k * 350, start + 2100 + k * 350);
        return (
          <g key={o}>
            <line x1={q(coreX + 25)} y1={q(coreY)} x2={outX} y2={q(outY(k))} className="lv-netedge out" style={{ opacity: fired ? 0.6 : 0.12 }} />
            {p > 0 && p < 1 && <circle cx={q(coreX + 25 + (outX - coreX - 25) * p)} cy={q(coreY + (outY(k) - coreY) * p)} r={3.4} className="lv-pulse" />}
            <g className={`lv-chip ${fired && p >= 1 ? "win" : ""}`} style={{ opacity: fired ? 1 : 0.3 }}>
              <rect x={outX} y={q(outY(k) - 11)} width={104} height={22} rx={7} />
              <text x={outX + 8} y={q(outY(k) + 4)} className="svg-mono tinytext">{o}</text>
            </g>
          </g>
        );
      })}
    </g>
  );
}
