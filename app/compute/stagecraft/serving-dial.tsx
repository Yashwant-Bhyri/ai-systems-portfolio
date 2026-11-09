"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { inferenceStoryRuns } from "../lab-story-data";
import { phaseTotals, servingPhases, type Phases } from "../serving-phases";
import { highlight, useSummaryPause } from "./stage-meter";
import "./serving-dial.css";

/**
 * The same 96 requests on one dial. One full turn is the baseline's whole run; the same clock hand
 * sweeps both runs at once, so where the inner rings stop is how much sooner the optimized run ended.
 * Every request is a block on one of two GPUs, coloured by what it is doing; the rim is the queue.
 * The phases differ by a hundredfold, so the ledger beside the dial gives each its own scale.
 */
const INTRO = 1200, SWEEP = 16000, RESULT = 3000, TOUR = 2700, CLOSE = 1800, DEMO = 2600;
const SWEPT = INTRO + SWEEP, TOURED = SWEPT + RESULT, ROWS = ["wait", "read", "reason", "write"] as const;
const CLOSED = TOURED + TOUR * 4 + CLOSE;
/** After the close, the film shows each lever in turn, ending on all three. */
const FILM = CLOSED + DEMO * 3;
type Phase = (typeof ROWS)[number];
// Amber is kept for results; the phases have colours of their own, the same in every module.
const INK: Record<Phase, string> = { wait: "#a79bff", read: "#ff9fb8", reason: "#63d4df", write: "#b8e986" };
const NAME: Record<Phase, string> = { wait: "Waiting for a GPU", read: "Reading the prompt", reason: "Reasoning", write: "Writing the answer" };
const NOTE: Record<Phase, string> = { wait: "mean seconds per request", read: "GPU-s, all 96 · prefill", reason: "GPU-s, all 96 · decode", write: "GPU-s, all 96 · decode" };
const LEVERS = [
  { name: "Free-worker scheduling", run: 1 },
  { name: "+ Prefix reuse", run: 2 },
  { name: "+ Faster prefill & decode", run: 3 },
] as const;
const f = (v: number, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const less = (a: number, b: number) => { const p = Math.round(100 * (1 - b / a)); return p > 0 ? `−${p}%` : "0%"; };
const ease = (u: number) => u * u * (3 - 2 * u);
const BINS = 360;

/** How many requests are waiting at each of the dial's degrees. */
const queueBins = (p: readonly Phases[], T: number) => Array.from({ length: BINS + 1 }, (_, i) => { const t = (i / BINS) * T; let n = 0; for (const q of p) if (q.arrival <= t && q.start > t) n++; return n; });

export function ServingDial({ active = true, onRound }: { active?: boolean; onRound?: () => void }) {
  const runs = useMemo(() => inferenceStoryRuns("shared-prefix"), []);
  const phases = useMemo(() => runs.map(servingPhases), [runs]);
  const T = useMemo(() => Math.max(...phases[0].map((q) => q.finish)), [phases]);
  const bins = useMemo(() => phases.map((p) => queueBins(p, T)), [phases, T]);
  const tot0 = useMemo(() => phaseTotals(phases[0]), [phases]);
  const [lever, setLever] = useState(2);
  const [playing, setPlaying] = useState(true);
  const [picked, setPicked] = useState<Phase | null>(null);
  const [line, setLine] = useState("");
  const [ended, setEnded] = useState(false);
  const endedRef = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null), slider = useRef<HTMLInputElement>(null);
  const cells = useRef<Record<string, HTMLElement | null>>({});
  const clock = useRef(0), morph = useRef({ from: 3, to: 3, at: -1e9, fresh: false }), hover = useRef<{ x: number; y: number } | null>(null);
  const dragging = useRef(false), chose = useRef(false), shownLever = useRef(2), hoverId = useRef<number | null>(null);
  const round = useRef(onRound);
  useEffect(() => { round.current = onRound; });
  const state = useRef({ playing, picked });
  useEffect(() => { state.current = { playing, picked }; }, [playing, picked]);
  useSummaryPause(() => setPlaying(false), () => setPlaying(true), active);
  useEffect(() => {
    const dive = () => { clock.current = Math.max(clock.current, TOURED); setPlaying(false); };
    const resume = () => setPlaying(true);
    window.addEventListener("lab:dive", dive);
    window.addEventListener("lab:resume", resume);
    return () => { window.removeEventListener("lab:dive", dive); window.removeEventListener("lab:resume", resume); };
  }, []);

  useEffect(() => {
    const c = canvas.current;
    if (!c || !active) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) clock.current = TOURED;
    root.current?.querySelectorAll<HTMLElement>("[data-k]").forEach((el) => { cells.current[el.dataset.k!] = el; });
    let raf = 0, last = performance.now(), fired = false, lastLine = "";
    const put = (k: string, v: string) => { const el = cells.current[k]; if (el && el.textContent !== v) el.textContent = v; };
    const bar = (k: string, u: number) => { const el = cells.current[k]; if (el) el.style.transform = `scaleX(${u.toFixed(4)})`; };
    const draw = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const st = state.current;
      if (st.playing && !reduced) {
        clock.current = Math.min(FILM, clock.current + dt);
        if (clock.current >= FILM && !fired) { fired = true; round.current?.(); }
      }
      const film = clock.current;
      const t = Math.max(0, Math.min(1, (film - INTRO) / SWEEP)) * T;
      // the levers, demonstrated one at a time, unless the visitor has chosen one
      const demo = film >= CLOSED && !chose.current ? Math.min(2, Math.floor((film - CLOSED) / DEMO)) : film >= SWEPT && !chose.current ? 2 : -1;
      if (demo >= 0 && demo !== shownLever.current) {
        shownLever.current = demo;
        morph.current = { from: morph.current.to, to: LEVERS[demo].run, at: 0, fresh: true };
        setLever(demo);
      }
      // the optimized run, tweened when a lever changes
      const mk = morph.current;
      if (mk.fresh) { mk.fresh = false; mk.at = now; }
      const k = ease(Math.min(1, (now - mk.at) / 800));
      const P0 = phases[mk.from], P1 = phases[mk.to];
      const B: readonly Phases[] = k >= 1 ? P1 : P1.map((q, i) => {
        const a = P0[i], m = (x: number, y: number) => x + (y - x) * k;
        return { ...q, start: m(a.start, q.start), finish: m(a.finish, q.finish), read: m(a.read, q.read), reason: m(a.reason, q.reason), write: m(a.write, q.write), wait: m(a.wait, q.wait) };
      });
      const qB = bins[mk.to].map((n, i) => bins[mk.from][i] + (n - bins[mk.from][i]) * k);
      const endA = T, endB = Math.max(...B.map((q) => q.finish));
      const totB = phaseTotals(B);
      // which phase is in focus
      const toured = film >= TOURED && film < TOURED + TOUR * ROWS.length ? ROWS[Math.floor((film - TOURED) / TOUR)] : null;
      const focus: Phase | null = st.picked ?? toured;
      const w = c.clientWidth, h = c.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
      if (w && h) {
        if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
        const g = c.getContext("2d")!;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, w, h);
        const cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 26;
        const rad = (v: number) => (v / T) * Math.PI * 2 - Math.PI / 2;
        const band = (r0: number, r1: number, a: number, b: number, ink: string, alpha = 1) => {
          if (b <= a) return;
          g.globalAlpha = alpha;
          g.strokeStyle = ink;
          g.lineWidth = (r1 - r0) * R;
          g.beginPath();
          g.arc(cx, cy, ((r0 + r1) / 2) * R, a, b);
          g.stroke();
          g.globalAlpha = 1;
        };
        const on = (p: Phase) => (focus && focus !== p ? 0.14 : 1);
        const minRead = 1.3 / (R * 0.8); // radians: a prefill is drawn at least this wide so it can be seen
        const RINGS = { a: [[0.82, 0.895], [0.735, 0.81]], b: [[0.585, 0.66], [0.5, 0.575]] };
        // tracks
        [...RINGS.a, ...RINGS.b].forEach(([r0, r1]) => band(r0, r1, 0, Math.PI * 2, "rgba(230,237,244,.045)"));
        // time ticks, outside the rings
        g.font = "400 12.5px ui-monospace, SFMono-Regular, Menlo, monospace";
        g.textAlign = "center";
        g.textBaseline = "middle";
        for (let v = 0; v < T - 60; v += 200) {
          const a = rad(v), x = (r: number) => cx + Math.cos(a) * r * R, y = (r: number) => cy + Math.sin(a) * r * R;
          g.strokeStyle = "rgba(230,237,244,.28)";
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(x(0.985), y(0.985));
          g.lineTo(x(1.01), y(1.01));
          g.stroke();
          g.fillStyle = "#93a0ae";
          g.fillText(v ? `${f(v)} s` : "0", x(1.09), y(1.09));
        }
        // the queue: outward from the baseline, inward from the optimized run
        const peak = Math.max(...bins[0]);
        const rim = (arr: readonly number[], base: number, dir: 1 | -1, height: number, end: number) => {
          g.beginPath();
          const stop = Math.min(BINS, Math.floor((Math.min(t, end) / T) * BINS));
          for (let i = 0; i <= stop; i++) {
            const a = rad((i / BINS) * T), r = (base + dir * (arr[i] / peak) * height) * R;
            const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
            if (i) g.lineTo(x, y); else g.moveTo(x, y);
          }
          for (let i = stop; i >= 0; i--) { const a = rad((i / BINS) * T); g.lineTo(cx + Math.cos(a) * base * R, cy + Math.sin(a) * base * R); }
          g.closePath();
          g.globalAlpha = 0.7 * on("wait");
          g.fillStyle = INK.wait;
          g.fill();
          g.globalAlpha = 1;
        };
        rim(bins[0], 0.905, 1, 0.075, endA);
        rim(qB, 0.49, -1, 0.075, endB);
        // every request, as far as the clock has reached
        const blocks = (run: readonly Phases[], rings: number[][]) => {
          for (const q of run) {
            if (q.start >= t) continue;
            const [r0, r1] = rings[q.worker % 2];
            const a0 = rad(q.start), a1 = rad(q.start + q.read), a2 = rad(q.start + q.read + q.reason), a3 = rad(Math.min(t, q.finish));
            const inset = 0.0016;
            band(r0, r1, a1 + 0.001, Math.min(a2, a3) - inset, INK.reason, on("reason"));
            if (a3 > a2) band(r0, r1, a2, a3 - inset, INK.write, on("write"));
            band(r0, r1, a0, Math.max(a0 + minRead, a1), INK.read, on("read"));
          }
        };
        blocks(phases[0], RINGS.a);
        blocks(B, RINGS.b);
        // the request under the pointer, outlined on both runs
        const outline = (q: Phases | undefined, rings: number[][]) => {
          if (!q || q.start >= t) return;
          const [r0, r1] = rings[q.worker % 2];
          g.strokeStyle = "#fff"; g.lineWidth = 1.5;
          g.beginPath(); g.arc(cx, cy, r1 * R + 1, rad(q.start), rad(Math.min(t, q.finish))); g.arc(cx, cy, r0 * R - 1, rad(Math.min(t, q.finish)), rad(q.start), true); g.closePath(); g.stroke();
        };
        const hid = hoverId.current;
        if (hid !== null) { outline(phases[0][hid], RINGS.a); outline(B[hid], RINGS.b); }
        // where the optimized run finished: a tick and its time, as soon as it stops
        if (t >= endB) {
          const a = rad(endB), x = (r: number) => cx + Math.cos(a) * r * R, y = (r: number) => cy + Math.sin(a) * r * R;
          g.strokeStyle = "#ffc267"; g.lineWidth = 2;
          g.beginPath(); g.moveTo(x(0.47), y(0.47)); g.lineTo(x(0.69), y(0.69)); g.stroke();
          g.fillStyle = "#ffc267"; g.font = "500 14px ui-monospace, SFMono-Regular, Menlo, monospace";
          g.fillText(`${f(endB)} s`, x(0.4), y(0.4));
        }
        // the gap, once both runs are in: neutral, edged in amber, with its size in the space between the runs
        if (t >= endA - 1 && endA - endB > 40) {
          const u = Math.min(1, (film - SWEPT) / 900);
          g.globalAlpha = (focus ? 0.03 : 0.07) * u; g.strokeStyle = "#e6edf4"; g.lineWidth = 0.17 * R;
          g.beginPath(); g.arc(cx, cy, 0.58 * R, rad(endB) + 0.01, rad(T) - 0.01); g.stroke();
          g.globalAlpha = u; g.strokeStyle = "#ffc267"; g.lineWidth = 1;
          g.beginPath(); g.arc(cx, cy, 0.665 * R, rad(endB) + 0.01, rad(T) - 0.01); g.stroke();
          if (!focus) {
            const mid = rad((endA + endB) / 2), x = cx + Math.cos(mid) * 0.7 * R, y = cy + Math.sin(mid) * 0.7 * R;
            g.font = "500 20px ui-sans-serif, -apple-system, sans-serif";
            const label = `${f(endA - endB)} s sooner`, tw = g.measureText(label).width;
            g.fillStyle = "rgba(7,10,14,.9)"; g.beginPath(); g.roundRect(x - tw / 2 - 8, y - 14, tw + 16, 28, 14); g.fill();
            g.fillStyle = "#ffc267"; g.fillText(label, x, y);
          }
          g.globalAlpha = 1;
        }
        // the clock hand, with a fading trail
        if (t > 0 && t < T) {
          const a = rad(t), trail = 0.5;
          const grad = g.createConicGradient(a - trail, cx, cy);
          grad.addColorStop(0, "rgba(255,255,255,0)");
          grad.addColorStop(trail / (Math.PI * 2), "rgba(255,255,255,.13)");
          grad.addColorStop(trail / (Math.PI * 2) + 0.0001, "rgba(255,255,255,0)");
          g.fillStyle = grad;
          g.beginPath();
          g.moveTo(cx, cy);
          g.arc(cx, cy, 0.985 * R, a - trail, a);
          g.closePath();
          g.fill();
        }
        if (t < T) {
          const a = rad(t);
          g.strokeStyle = "#fff";
          g.lineWidth = 1.5;
          g.beginPath();
          g.moveTo(cx + Math.cos(a) * 0.4 * R, cy + Math.sin(a) * 0.4 * R);
          g.lineTo(cx + Math.cos(a) * 0.985 * R, cy + Math.sin(a) * 0.985 * R);
          g.stroke();
        }
        // ring names, on their tracks at twelve o'clock
        const tag = (text: string, r: number) => {
          g.font = "500 13px ui-sans-serif, -apple-system, sans-serif";
          g.textAlign = "right";
          g.textBaseline = "middle";
          const tw = g.measureText(text).width, x = cx - 10, y = cy - r * R;
          g.fillStyle = "rgba(7,10,14,.92)";
          g.beginPath();
          g.roundRect(x - tw - 8, y - 11, tw + 14, 22, 11);
          g.fill();
          g.fillStyle = "#eef2f6";
          g.fillText(text, x, y);
          g.textAlign = "center";
        };
        tag("Baseline", 0.815);
        tag("Optimized", 0.58);
        // what each phase has cost so far
        const sum = (run: readonly Phases[]) => {
          const s = { wait: 0, read: 0, reason: 0, write: 0 };
          let answered = 0, correct = 0;
          for (const q of run) {
            if (q.arrival > t) continue;
            s.wait += Math.min(q.wait, t - q.arrival);
            if (t > q.start) {
              const u = t - q.start;
              s.read += Math.min(q.read, u);
              s.reason += Math.max(0, Math.min(q.reason, u - q.read));
              s.write += Math.max(0, Math.min(q.write, u - q.read - q.reason));
            }
            if (q.finish <= t) { answered++; if (q.correct) correct++; }
          }
          return { ...s, answered, correct };
        };
        const a = sum(phases[0]), b = sum(B), n = phases[0].length;
        const fm = (p: Phase, d: number) => `${f(tot0[p] / (p === "wait" ? n : 1), d)} → ${f(totB[p] / (p === "wait" ? n : 1), d)}`;
        const gpu0 = tot0.read + tot0.reason + tot0.write;
        if (t < T - 1) put("clock", `${f(t)} s`);
        put("a-ans", String(a.answered));
        put("b-ans", String(b.answered));
        put("a-cor", String(a.correct));
        put("b-cor", String(b.correct));
        put("a-gpu", f(a.read + a.reason + a.write));
        put("d-gpu", t >= T - 1 ? less(gpu0, totB.read + totB.reason + totB.write) : "");
        put("b-gpu", f(b.read + b.reason + b.write));
        for (const p of ROWS) {
          const scale = p === "wait" ? n : 1, digits = p === "read" ? 1 : 0;
          put(`a-${p}`, f(a[p] / scale, digits));
          put(`b-${p}`, f(b[p] / scale, digits));
          bar(`bar-a-${p}`, a[p] / tot0[p]);
          bar(`bar-b-${p}`, b[p] / tot0[p]);
          const row = cells.current[`row-${p}`];
          if (row) { const dim = focus && focus !== p ? "true" : "false"; if (row.dataset.dim !== dim) row.dataset.dim = dim; }
          put(`d-${p}`, t >= T - 1 ? `${p === "wait" ? `−${f((tot0[p] - totB[p]) / n)} s` : `−${f(tot0[p] - totB[p], p === "read" ? 1 : 0)} GPU-s`} · ${less(tot0[p], totB[p])}` : "");
        }
        // hovering reads one request, before and after; the rims read the queue
        const hv = hover.current, read = cells.current.readout;
        if (read) {
          let text = "", id: number | null = null;
          if (hv) {
            const dx = hv.x - cx, dy = hv.y - cy, r = Math.hypot(dx, dy) / R;
            const ang = (Math.atan2(dy, dx) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2), v = (ang / (Math.PI * 2)) * T;
            const hit = (run: readonly Phases[], rings: number[][]) => {
              const ring = rings.findIndex(([r0, r1]) => r >= r0 && r <= r1);
              if (ring < 0 || v > t) return;
              const q = run.find((x) => x.worker % 2 === ring && x.start <= v && x.finish >= v);
              if (q) id = q.id;
            };
            hit(phases[0], RINGS.a); hit(B, RINGS.b);
            if (id !== null) {
              const a0 = phases[0][id], b0 = B[id], g0 = a0.read + a0.reason + a0.write, g1 = b0.read + b0.reason + b0.write;
              text = `Request ${id + 1} · baseline → optimized|waited ${f(a0.wait)} → ${f(b0.wait)} s · GPU ${f(g0, 1)} → ${f(g1, 1)} s`;
            } else if (v <= t && r > 0.9 && r < 0.99) text = `At ${f(v)} s|${bins[0][Math.round((v / T) * BINS)]} requests waiting, baseline`;
            else if (v <= t && r > 0.41 && r < 0.5) text = `At ${f(v)} s|${Math.round(qB[Math.round((v / T) * BINS)])} requests waiting, optimized`;
          }
          hoverId.current = id;
          if (read.dataset.text !== text) {
            read.dataset.text = text; read.hidden = !text;
            const [x, y] = text.split("|");
            (read.children[0] as HTMLElement).textContent = x ?? ""; (read.children[1] as HTMLElement).textContent = y ?? "";
          }
          if (hv && text) { read.style.left = `${Math.min(w - 350, hv.x + 14)}px`; read.style.top = `${Math.min(h - 60, hv.y + 14)}px`; }
        }
        // the centre: the race while it runs; both finish times once it is over
        const done = t >= T - 1, centre = cells.current.centre;
        if (centre && centre.dataset.done !== String(done)) centre.dataset.done = String(done);
        if (done) put("clock", `${f(T)} → ${f(endB)} s`);
        // While one phase is lit, the centre reads that phase: baseline → optimized, and the difference.
        const ph = focus ?? "", unit = (p: Phase) => (p === "wait" ? "s per request" : "GPU-s");
        if (centre && centre.dataset.phase !== ph) centre.dataset.phase = ph;
        if (focus) {
          put("ph-name", NAME[focus]);
          put("ph-vals", `${fm(focus, focus === "read" ? 1 : 0)} ${unit(focus)}`);
          put("ph-delta", less(tot0[focus], totB[focus]));
        }
        // the sentence on top
        const correctB = B.filter((q) => q.correct).length;
        const saved = gpu0 - (totB.read + totB.reason + totB.write), lv = shownLever.current;
        const leverLine = lv === 0 ? `Free-worker scheduling alone: the same GPU work, waiting *${fm("wait", 0)} s*`
          : lv === 1 ? `Add prefix reuse: reading the prompt *${fm("read", 1)} GPU-s*, under 1% of all compute`
          : `All three levers: the same ${correctB} correct answers with *${f(saved)} fewer GPU-seconds*`;
        const next = st.picked
          ? `${NAME[st.picked]}: *${fm(st.picked, st.picked === "read" ? 1 : 0)} ${st.picked === "wait" ? "s per request" : "GPU-s"}*${t < T - 1 ? ", whole run" : ""}`
          : film < INTRO + 4500 ? "One full turn is the baseline's whole run: outer rings baseline, inner rings optimized"
          : film < INTRO + 9000 ? "Each block is one request; each run has two tracks, one per GPU. A dark gap is a GPU sitting idle"
          : t < endB ? "The violet rim is the queue: how many requests are waiting right now"
          : t < T ? `The optimized run answered all 96 at *${f(endB)} s*; the baseline is still working`
          : film < TOURED ? `Both runs gave the same ${correctB} correct answers; the optimized run used *${f(saved)} fewer GPU-seconds*`
          : toured === "wait" ? `Waiting: *${fm("wait", 0)} s* per request, ${less(tot0.wait, totB.wait)}: free workers start the next request at once`
          : toured === "read" ? `Reading the prompt: *${fm("read", 1)} GPU-s*, ${less(tot0.read, totB.read)}: the shared prefix is read once`
          : toured === "reason" ? `Reasoning: *${fm("reason", 0)} GPU-s*, ${less(tot0.reason, totB.reason)}: every step moves half the bytes`
          : toured === "write" ? `Writing the answer: *${fm("write", 0)} GPU-s*, ${less(tot0.write, totB.write)}, for the same answers`
          : leverLine;
        if (next !== lastLine) { lastLine = next; setLine(next); }
        if (slider.current && !dragging.current) slider.current.value = String(Math.round(t));
        const ended = film >= FILM;
        if (ended !== endedRef.current) { endedRef.current = ended; setEnded(ended); }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [active, phases, bins, T, tot0]);

  const go = (i: number) => {
    chose.current = true;
    shownLever.current = i;
    morph.current = { from: morph.current.to, to: LEVERS[i].run, at: 0, fresh: true };
    setLever(i);
  };
  return (
    <div ref={root} className="sd-root">
      <p className="sd-line" key={line}>{highlight(line)}</p>
      <div className="sd-main">
        <div className="sd-dial">
          <canvas ref={canvas} className="sd-canvas" style={{ cursor: "crosshair" }} role="img" aria-label="A dial on one clock: the baseline's two GPUs on the outer rings, the optimized run's on the inner rings; each request is a block coloured by phase, and the rims show the queue" onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); hover.current = { x: e.clientX - r.left, y: e.clientY - r.top }; }} onPointerLeave={() => { hover.current = null; }} />
          <div className="sd-center" data-k="centre" data-done="false" data-phase="">
            <b data-k="clock">0 s</b>
            <span className="sd-live">answered, of 96</span>
            <span className="sd-end">to answer every request: baseline → optimized</span>
            <span className="sd-phase"><small data-k="ph-name" /><b data-k="ph-vals" /><em data-k="ph-delta" /></span>
            <div className="sd-duel"><i data-tone="base" data-k="a-ans">0</i><i data-tone="opt" data-k="b-ans">0</i></div>
            <div className="sd-names"><small>baseline</small><small>optimized</small></div>
          </div>
          <div className="sd-readout" hidden data-k="readout"><strong /><span /></div>
        </div>
        <aside className="sd-ledger">
          <h4>Where the time went <span className="sd-key"><i data-run="base" />baseline <i data-run="opt" />optimized</span></h4>
          {ROWS.map((p) => (
            <button key={p} type="button" className="sd-row" data-k={`row-${p}`} aria-pressed={picked === p} onClick={() => setPicked((c) => (c === p ? null : p))} style={{ ["--ink" as string]: INK[p] }}>
              <span className="sd-row-head"><i aria-hidden="true" /><strong>{NAME[p]}</strong><em data-k={`d-${p}`} /></span>
              <span className="sd-note">{NOTE[p]}</span>
              <span className="sd-bars">
                <span className="sd-bar" data-run="base"><u data-k={`bar-a-${p}`} /></span><b data-k={`a-${p}`}>0</b>
                <span className="sd-bar" data-run="opt"><u data-k={`bar-b-${p}`} /></span><b data-k={`b-${p}`}>0</b>
              </span>
            </button>
          ))}
          <div className="sd-sum">
            <div className="sd-cols"><span /><small>baseline</small><small>optimized</small></div>
            <div><span>Correct answers</span><b data-tone="base" data-k="a-cor">0</b><b data-tone="opt" data-k="b-cor">0</b></div>
            <div className="sd-total"><span>GPU-seconds used <em data-k="d-gpu" /></span><b data-tone="base" data-k="a-gpu">0</b><b data-tone="opt" data-k="b-gpu">0</b></div>
            <p>Simulated lab, each row on its own scale. Reasoning and writing are split by the model&apos;s token budget; prompt-reading blocks are drawn wider than their real size so they can be seen.</p>
          </div>
        </aside>
      </div>
      <div className="sd-controls">
        <button type="button" className="sd-play" onClick={() => { if (clock.current >= FILM) { clock.current = 0; setPlaying(true); return; } setPlaying((p) => !p); }} aria-label={playing && !ended ? "Pause" : "Play"}>{playing && !ended ? "Ⅱ" : "▷"}</button>
        <input ref={slider} type="range" min={0} max={Math.round(T)} step={1} defaultValue={0} aria-label="Move the clock through the run" onPointerDown={() => { dragging.current = true; }} onPointerUp={() => { dragging.current = false; }} onChange={(e) => { setPlaying(false); clock.current = INTRO + (Number(e.target.value) / T) * SWEEP; }} />
        <div className="sd-levers" role="group" aria-label="Which levers the optimized run has">
          <span>Optimized run uses</span>
          {LEVERS.map((s, i) => <button key={s.name} type="button" aria-pressed={i === lever} onClick={() => go(i)}><i>{i + 1}</i>{s.name}</button>)}
        </div>
      </div>
    </div>
  );
}
