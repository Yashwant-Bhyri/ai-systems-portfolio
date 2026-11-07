"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTr } from "../../exhibit/i18n";
import { inferenceStoryRuns } from "../lab-story-data";
import { ease, prog } from "../../exhibit/engine";
import { FlowBoard, LEVERS } from "./flow-board";
import { emitMeter, highlight } from "./stage-meter";
import "./big-picture.css";

/**
 * How cheaper execution opens: all 96 requests in a slowly turning 3D graph of
 * GPU time, waiting and correctness. Each lever then moves the same points, and
 * the correct and wrong sheets never exchange a point: the same intelligence,
 * delivered for less. Then the path of one request says where each lever works.
 */
const RUNS = inferenceStoryRuns("shared-prefix");
const TASKS = RUNS[0].tasks.map((_, i) => RUNS.slice(0, 4).map((r) => r.tasks[i]));
const X_MAX = Math.max(...RUNS[0].tasks.map((t) => t.gpuSeconds)) * 1.08;
const Y_MAX = Math.max(...RUNS[0].tasks.map((t) => t.queueSeconds)) * 1.05;
const SLOW = new Set([...RUNS[0].tasks].map((t, i) => ({ i, l: t.latency })).sort((a, b) => b.l - a.l).slice(0, Math.ceil(RUNS[0].tasks.length * 0.05)).map((x) => x.i));
const f = (v: number, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

/* The timeline: [from ms, line]. A lever's window is when its points move. */
const LINES: readonly (readonly [number, string])[] = [
  [800, "96 requests: how long each waits, its GPU time, and whether it was right"],
  [4200, `Today the slowest 5% wait *${f(RUNS[0].p95)} seconds*`],
  [8000, "Serving the same intelligence for less depends on *three things*"],
  [10800, "*Free-worker scheduling*: no worker idles while a request waits"],
  [14000, "*Prefix reuse*: a shared document is read once"],
  [17000, "*Faster prefill & decode*: half the bytes for every token"],
  [20400, `Not one answer changed: *${RUNS[3].correct} of 96 still correct*, at ${f(RUNS[0].correctCost!, 2)} → ${f(RUNS[3].correctCost!, 2)} GPU-s each`],
  [24800, "Every request takes this path, and *each lever works on one stop*"],
];
const MOVES = [[11100, 13700], [14300, 16700], [17300, 19900]] as const;
const FLOW_AT = 24600, FLOW_STEP = 2500, TOTAL = FLOW_AT + 1700 + FLOW_STEP * 3 + 1800;

function draw(c: HTMLCanvasElement, t: number) {
  const w = c.clientWidth, h = c.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
  if (!w || !h) return;
  if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
  const g = c.getContext("2d")!;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, w, h);
  // the point of view keeps moving
  const yaw = -0.5 + 0.24 * Math.sin(t / 5200), pitch = 0.34 + 0.06 * Math.sin(t / 3700 + 1);
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const scale = Math.min(w * 0.42, h * 0.74);
  const project = (x: number, y: number, z: number) => {
    const X = (x - 0.5) * 1.5, Y = (y - 0.42) * 0.74, Z = (z - 0.5) * 0.92;
    const rx = X * cy + Z * sy, rz = -X * sy + Z * cy;
    const ry = Y * cp - rz * sp, rd = Y * sp + rz * cp;
    const d = 4 / (4 + rd);
    return { x: w * 0.5 + rx * scale * d, y: h * 0.56 - ry * scale * d, d };
  };
  const grow = ease.out(prog(t, 0, 1400));
  const line = (a: number[], b: number[], color: string, width = 1) => {
    const p = project(a[0], a[1], a[2]), q = project(b[0], b[1], b[2]);
    g.strokeStyle = color; g.lineWidth = width;
    g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke();
  };
  const label = (x: number, y: number, z: number, text: string, color: string, size = 15, align: CanvasTextAlign = "center") => {
    const p = project(x, y, z);
    g.fillStyle = color; g.font = `450 ${size}px ui-sans-serif, -apple-system, "Helvetica Neue", sans-serif`; g.textAlign = align;
    g.fillText(text, p.x, p.y);
  };
  g.globalAlpha = grow;
  // the two sheets: correct at the front, wrong at the back
  const sheet = (z: number, fill: string, stroke: string) => {
    const pts = [[0, 0, z], [1, 0, z], [1, 1, z], [0, 1, z]].map((q) => project(q[0], q[1], q[2]));
    g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath();
    g.fillStyle = fill; g.fill(); g.strokeStyle = stroke; g.lineWidth = 1; g.stroke();
  };
  const settled = prog(t, 20400, 21000);
  sheet(0.1, "rgba(142,160,178,.045)", "rgba(142,160,178,.22)");
  sheet(0.9, `rgba(184,233,134,${0.05 + 0.1 * settled})`, `rgba(184,233,134,${0.3 + 0.5 * settled})`);
  // floor grid
  for (let i = 0; i <= 5; i++) { line([i / 5, 0, 0.1], [i / 5, 0, 0.9], "rgba(230,237,244,.06)"); }
  line([0, 0, 0.1], [0, 0, 0.9], "rgba(230,237,244,.3)");
  line([0, 0, 0.9], [1, 0, 0.9], "rgba(230,237,244,.3)");
  line([0, 0, 0.9], [0, 1, 0.9], "rgba(230,237,244,.3)");
  label(0.5, -0.12, 0.9, `GPU time per request, 0 to ${f(X_MAX)} GPU-s`, "#c9d2db", 15);
  label(-0.02, 1.06, 0.9, `Waiting, 0 to ${f(Y_MAX)} s`, "#c9d2db", 15);
  label(1.02, 0.5, 0.9, "Correct answers", "#b8e986", 16, "left");
  label(1.02, 0.5, 0.1, "Wrong answers", "#a9b6c2", 16, "left");
  // the points move lever by lever; correct/wrong never changes
  const k = MOVES.map(([a, b]) => ease.io(prog(t, a, b)));
  const spot = prog(t, 4200, 4900) * (1 - prog(t, 7700, 8200));
  const items = TASKS.map((stages, i) => {
    let gpu = stages[0].gpuSeconds, wait = stages[0].queueSeconds;
    k.forEach((v, m) => { gpu += (stages[m + 1].gpuSeconds - stages[m].gpuSeconds) * v; wait += (stages[m + 1].queueSeconds - stages[m].queueSeconds) * v; });
    const appear = ease.out(prog(t, 200 + i * 10, 800 + i * 10));
    const z = stages[0].correct ? 0.9 : 0.1;
    return { i, x: gpu / X_MAX, y: (wait / Y_MAX) * appear, z, ok: stages[0].correct, from: stages[0], gpu0: stages[0].gpuSeconds / X_MAX, y0: stages[0].queueSeconds / Y_MAX };
  }).map((p) => ({ ...p, s: project(p.x, p.y, p.z) })).sort((a, b) => a.s.d - b.s.d);
  const moving = k.some((v) => v > 0);
  for (const p of items) {
    const slow = SLOW.has(p.i);
    if (moving) {
      const o = project(p.gpu0, p.y0, p.z);
      g.strokeStyle = p.ok ? "rgba(184,233,134,.2)" : "rgba(169,182,194,.14)"; g.lineWidth = 1;
      g.beginPath(); g.moveTo(o.x, o.y); g.lineTo(p.s.x, p.s.y); g.stroke();
    }
    const dimmed = spot > 0 && !slow;
    const color = slow && spot > 0 ? "255,143,134" : p.ok ? "184,233,134" : "150,164,178";
    const r = (slow && spot > 0 ? 7.5 : 4.4) * p.s.d * 1.2;
    g.globalAlpha = grow * (dimmed ? 1 - 0.75 * spot : 1);
    g.fillStyle = `rgb(${color})`; g.beginPath(); g.arc(p.s.x, p.s.y, r, 0, 7); g.fill();
  }
  g.globalAlpha = 1;
}

export function BigPicture({ active }: { active: boolean }) {
  const tr = useTr();
  const canvas = useRef<HTMLCanvasElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const clock = useRef(0);
  const fired = useRef(false);
  const seek = (v: number) => { clock.current = v; setT(v); if (canvas.current) draw(canvas.current, v); };

  useEffect(() => {
    if (!active) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, last = performance.now();
    if (reduced) { clock.current = TOTAL; raf = requestAnimationFrame(() => { setT(TOTAL); if (canvas.current) draw(canvas.current, FLOW_AT - 100); }); return () => cancelAnimationFrame(raf); }
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (playing) {
        clock.current = Math.min(TOTAL, clock.current + dt);
        setT(clock.current);
        if (clock.current >= TOTAL && !fired.current) {
          fired.current = true;
          root.current?.dispatchEvent(new CustomEvent("lab:module-round", { bubbles: true }));
        }
      }
      if (canvas.current && clock.current < FLOW_AT + 800) draw(canvas.current, clock.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, playing]);

  useEffect(() => {
    const dive = () => setPlaying(false);
    const resume = () => { if (clock.current >= TOTAL) { clock.current = 0; fired.current = false; } setPlaying(true); };
    window.addEventListener("lab:dive", dive);
    window.addEventListener("lab:resume", resume);
    return () => { window.removeEventListener("lab:dive", dive); window.removeEventListener("lab:resume", resume); };
  }, []);
  useEffect(() => { if (active) emitMeter(null); }, [active]);

  const flow = prog(t, FLOW_AT, FLOW_AT + 900);
  const leverAt = (i: number) => FLOW_AT + 1700 + i * FLOW_STEP;
  const levers = [0, 1, 2].filter((i) => t >= leverAt(i)).length;
  const lit = levers ? LEVERS[levers - 1].stops : null;
  const line = useMemo(() => { let cur = ""; for (const [at, text] of LINES) if (t >= at) cur = text; return cur; }, [t]);
  const flowLine = levers ? `*${LEVERS[levers - 1].name}* works on ${LEVERS[levers - 1].where}` : null;
  const shown = flowLine ?? line;
  return (
    <div ref={root} className="bp-root" data-flow={flow > 0.5 || undefined}>
      <canvas ref={canvas} className="bp-canvas" style={{ opacity: 1 - flow }} role="img" aria-label="96 requests in a 3D graph of GPU time, waiting and correctness" />
      {flow > 0 && <div className="bp-flow" style={{ opacity: flow }}><FlowBoard t={t} levers={levers} lit={lit} /></div>}
      {shown && <p className="bp-line" key={shown}>{highlight(tr(shown))}</p>}
      <div className="bp-transport">
        <button type="button" onClick={() => { if (clock.current >= TOTAL) { seek(0); fired.current = false; setPlaying(true); } else setPlaying((p) => !p); }} aria-label={tr(playing && t < TOTAL ? "Pause" : "Play")}>{playing && t < TOTAL ? "Ⅱ" : "▷"}</button>
        <input type="range" min={0} max={TOTAL} step={100} value={t} aria-label={tr("Move through the opening")} onChange={(e) => seek(Number(e.target.value))} />
      </div>
    </div>
  );
}
