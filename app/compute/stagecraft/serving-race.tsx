"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { inferenceStoryRuns } from "../lab-story-data";
import type { LabRun } from "../lab-simulation";
import { highlight } from "./stage-meter";
import "./serving-race.css";

/**
 * Serving is time, so this is a race on one clock. The same 96 requests, the same model, the
 * baseline running upward and the optimized run mirrored downward. Each request is one thin
 * row: coral while it waits for a worker, amber while the prompt is read, solid while the
 * answer is written. The picture is the result: the waiting wedge shrinks, the diagonal of GPU
 * work steepens, and the optimized run has finished while the baseline is still working.
 */
const FILM_MS = 17000, HOLD_MS = 5000;
const STAGES = [
  { name: "Free-worker scheduling", run: 1 },
  { name: "+ Prefix reuse", run: 2 },
  { name: "+ Faster prefill & decode", run: 3 },
] as const;
const C = { wait: "255,143,134", read: "#ffc267", base: "#7fb2ff", opt: "#b8e986", axis: "rgba(230,237,244,.28)", tick: "#93a0ae" };
const f = (v: number, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const stats = (r: LabRun, t: number) => {
  let answered = 0, correct = 0, waiting = 0, gpu = 0;
  for (const q of r.tasks) {
    if (q.finish <= t) { answered++; if (q.correct) correct++; }
    if (q.arrival <= t && q.start > t) waiting++;
    gpu += Math.max(0, Math.min(t - q.start, q.gpuSeconds));
  }
  return { answered, correct, waiting, gpu };
};

export function ServingRace({ active = true, onRound }: { active?: boolean; onRound?: () => void }) {
  const runs = useMemo(() => inferenceStoryRuns("shared-prefix"), []);
  const [stage, setStage] = useState(2);
  const [playing, setPlaying] = useState(true);
  const [phase, setPhase] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const clock = useRef(0); // film time, ms
  const slider = useRef<HTMLInputElement>(null);
  const cells = useRef<Record<string, HTMLElement | null>>({});
  const round = useRef(onRound);
  useEffect(() => { round.current = onRound; });
  const stageRef = useRef(stage), playRef = useRef(playing);
  useEffect(() => { stageRef.current = stage; playRef.current = playing; }, [stage, playing]);
  const base = runs[0], opt = runs[STAGES[stage].run];
  const T = useMemo(() => Math.max(...base.tasks.map((q) => q.finish)) * 1.02, [base]);

  useEffect(() => {
    const c = canvas.current;
    if (!c || !active) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) clock.current = FILM_MS;
    let raf = 0, last = performance.now(), fired = false, lastPhase = -1;
    const draw = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (playRef.current && !reduced) {
        clock.current += dt;
        if (clock.current >= FILM_MS + HOLD_MS) {
          if (!fired) { fired = true; round.current?.(); }
          clock.current = 0;
        }
      }
      const film = Math.min(FILM_MS, clock.current);
      const t = (film / FILM_MS) * T;
      const w = c.clientWidth, h = c.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
      if (w && h) {
        if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
        const g = c.getContext("2d")!;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, w, h);
        const L = 16, R = 16, W = w - L - R, mid = h / 2, rowH = (h / 2 - 34) / 96;
        const X = (v: number) => L + (v / T) * W;
        const O = runs[STAGES[stageRef.current].run];
        // two runs, one clock
        ([[base, -1, C.base], [O, 1, C.opt]] as const).forEach(([r, dir, ink]) => {
          r.tasks.forEach((q, i) => {
            const y = dir < 0 ? mid - 12 - (i + 1) * rowH : mid + 12 + i * rowH;
            const bar = Math.max(1, rowH - 0.6);
            if (q.arrival > t) return;
            const waitEnd = Math.min(t, q.start);
            if (waitEnd > q.arrival) { g.fillStyle = `rgba(${C.wait},.34)`; g.fillRect(X(q.arrival), y, X(waitEnd) - X(q.arrival), bar); }
            if (t > q.start) {
              const readEnd = Math.min(t, q.start + q.prefill);
              g.fillStyle = C.read;
              g.fillRect(X(q.start), y, Math.max(1.2, X(readEnd) - X(q.start)), bar);
              if (t > q.start + q.prefill) {
                g.fillStyle = ink;
                g.fillRect(X(q.start + q.prefill), y, Math.max(1, X(Math.min(t, q.finish)) - X(q.start + q.prefill)), bar);
              }
            }
          });
        });
        // the shared clock axis
        g.strokeStyle = C.axis; g.lineWidth = 1;
        g.beginPath(); g.moveTo(L, mid); g.lineTo(L + W, mid); g.stroke();
        g.font = "400 12.5px ui-monospace, SFMono-Regular, Menlo, monospace"; g.fillStyle = C.tick; g.textBaseline = "middle"; g.textAlign = "center";
        const step = T > 1000 ? 200 : 100;
        for (let v = 0; v <= T; v += step) { g.fillStyle = "#0a0f15"; g.fillRect(X(v) - 20, mid - 8, 40, 16); g.fillStyle = C.tick; g.fillText(v ? `${f(v)} s` : "0", Math.max(L + 10, X(v)), mid); }
        // where each run finished
        const endA = Math.max(...base.tasks.map((q) => q.finish)), endB = Math.max(...O.tasks.map((q) => q.finish));
        g.font = "500 13px ui-sans-serif, -apple-system, sans-serif";
        const flag = (end: number, y0: number, y1: number, ink: string, label: string, ty: number) => {
          if (t < end) return;
          g.strokeStyle = ink; g.setLineDash([3, 4]);
          g.beginPath(); g.moveTo(X(end), y0); g.lineTo(X(end), y1); g.stroke(); g.setLineDash([]);
          g.fillStyle = ink; g.textAlign = "right"; g.fillText(label, X(end) - 8, ty);
        };
        flag(endA, 18, mid - 12, C.base, `all 96 answered at ${f(endA)} s`, 14);
        flag(endB, mid + 12, h - 18, C.opt, `all 96 answered at ${f(endB)} s`, h - 12);
        // the gap, once both are in
        if (t >= endA) {
          g.strokeStyle = "#d3b6ff"; g.lineWidth = 2;
          g.beginPath(); g.moveTo(X(endB), mid + 22); g.lineTo(X(endA), mid + 22); g.stroke();
          g.lineWidth = 1; g.fillStyle = "#d3b6ff"; g.textAlign = "center";
          g.fillText(`${f(endA - endB)} s sooner`, (X(endA) + X(endB)) / 2, mid + 36);
        }
        // the clock itself
        g.strokeStyle = "rgba(255,255,255,.75)";
        g.beginPath(); g.moveTo(X(t), 14); g.lineTo(X(t), h - 14); g.stroke();

        // the readings change in place, so nothing around them moves
        const a = stats(base, t), b = stats(O, t);
        const put = (k: string, v: string) => { const el = cells.current[k]; if (el && el.textContent !== v) el.textContent = v; };
        put("clock", `${f(t)} s`);
        put("a-answered", String(a.answered)); put("b-answered", String(b.answered));
        put("a-correct", String(a.correct)); put("b-correct", String(b.correct));
        put("a-waiting", String(a.waiting)); put("b-waiting", String(b.waiting));
        put("a-gpu", f(a.gpu)); put("b-gpu", f(b.gpu));
        if (slider.current && document.activeElement !== slider.current) slider.current.value = String(film);
        const p = film < 0.14 * FILM_MS ? 0 : t < endB ? 1 : t < endA ? 2 : 3;
        if (p !== lastPhase) { lastPhase = p; setPhase(p); }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [active, runs, base, T]);

  const pct = Math.round(100 * (1 - opt.gpuSeconds / base.gpuSeconds));
  const lines = [
    "The same 96 requests and the same model, on one clock",
    "Coral is time spent waiting for a worker; solid is GPU work",
    "The optimized run has answered everything; the baseline is still working",
    `The same ${opt.correct} correct answers with *${pct}% less compute*`,
  ];
  const go = (i: number) => { setStage(i); clock.current = 0; setPlaying(true); };
  return (
    <div className="sr-root">
      <p className="sr-line" key={`${phase}-${stage}`}>{highlight(lines[phase])}</p>
      <div className="sr-stage">
        <canvas ref={canvas} className="sr-canvas" role="img" aria-label="96 requests on one clock: the baseline above, the optimized run mirrored below; waiting in coral, prompt reading in amber, answer writing in blue and green" />
        <span className="sr-tag" data-at="top">Baseline</span>
        <span className="sr-tag" data-at="bottom">Optimized</span>
        <aside className="sr-read">
          <div className="sr-clock"><span>Clock</span><b ref={(el) => { cells.current.clock = el; }}>0 s</b></div>
          <table>
            <thead><tr><th /><td data-tone="base">Baseline</td><td data-tone="opt">Optimized</td></tr></thead>
            <tbody>
              {([["Answered", "answered"], ["Correct", "correct"], ["Waiting now", "waiting"], ["GPU-s used", "gpu"]] as const).map(([label, k]) => (
                <tr key={k}><th>{label}</th><td data-tone="base" ref={(el) => { cells.current[`a-${k}`] = el; }}>0</td><td data-tone="opt" ref={(el) => { cells.current[`b-${k}`] = el; }}>0</td></tr>
              ))}
            </tbody>
          </table>
          <ul className="sr-key"><li><i style={{ background: `rgb(${C.wait})`, opacity: .5 }} />Waiting</li><li><i style={{ background: C.read }} />Reading</li><li><i style={{ background: C.base }} /><i style={{ background: C.opt }} />Writing</li></ul>
        </aside>
      </div>
      <div className="sr-controls">
        <button type="button" className="sr-play" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"}>{playing ? "Ⅱ" : "▷"}</button>
        <input ref={slider} type="range" min={0} max={FILM_MS} step={50} defaultValue={0} aria-label="Move the clock" onChange={(e) => { clock.current = Number(e.target.value); }} />
        <div className="sr-stages" role="group" aria-label="Which levers the optimized run has">
          {STAGES.map((s, i) => <button key={s.name} type="button" aria-pressed={i === stage} onClick={() => go(i)}>{s.name}</button>)}
        </div>
      </div>
    </div>
  );
}
