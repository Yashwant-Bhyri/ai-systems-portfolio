"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTr } from "../../../exhibit/i18n";
import { mountRelief } from "./relief";
import { emitMeter, useSummaryPause } from "../stage-meter";
import { BASE_WOULD, LAYERS, TOKENS, buildLearnScan, changeColor } from "./learn-data";
import "./scan.css";

/**
 * Inside the model: the answer the RL checkpoint writes for first_item([]), and
 * how far its layers moved from the base model's on every token. One scan runs
 * through the relief, the flat field and the answer together; where the base
 * model would have written another word, the answer shows that word struck out.
 */
const SCAN = 15500;
const T = TOKENS.length;

export function InsideScan({ active }: { active: boolean }) {
  const tr = useTr();
  const scan = useMemo(() => buildLearnScan(), []);
  const relief = useRef<HTMLDivElement>(null);
  const heat = useRef<HTMLCanvasElement>(null);
  const labels = useRef<SVGSVGElement>(null);
  const [front, setFront] = useState(0);
  const [playing, setPlaying] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const clock = useRef(0);
  const playRef = useRef(true);
  useEffect(() => { playRef.current = playing; }, [playing]);
  const told = useRef(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const host = relief.current;
    if (!host || !active) return;
    const r = mountRelief(host, {
      cols: T, rows: LAYERS, max: scan.max, smoothRows: true,
      value: (c, l) => scan.change[c][l],
      color: (v) => changeColor(v),
      ground: 0x120d13, light: 0xf3a0bc,
    });
    // token labels along the front edge (layer 0, where the answer's tokens go in)
    const svg = labels.current;
    svg?.querySelectorAll<SVGTextElement>("text").forEach((el, t) => {
      const p = r.project(t, 0.5 + 0.07);
      el.setAttribute("x", String(p.x));
      el.setAttribute("y", String(p.y));
      el.setAttribute("transform", `rotate(58 ${p.x} ${p.y})`);
    });
    const drawHeat = (k: number) => {
      const c = heat.current;
      if (!c) return;
      const w = c.clientWidth, h = c.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
      if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
      const g = c.getContext("2d")!;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      const left = 92, gridH = h - 22, cw = (w - left) / T, rh = gridH / LAYERS;
      g.fillStyle = "#140d14";
      g.fillRect(left, 0, w - left, gridH);
      for (let t = 0; t < T; t++) {
        const a = Math.max(0, Math.min(1, k - t));
        if (a <= 0) break;
        for (let l = 0; l < LAYERS; l++) {
          const [cr, cg, cb] = changeColor(scan.change[t][l]);
          g.fillStyle = `rgba(${cr},${cg},${cb},${a})`;
          g.fillRect(left + t * cw + 0.5, l * rh, cw - 1, rh - 0.5);
        }
        // how much the base model agreed with this token: tall = it would have written it too
        const flip = BASE_WOULD.has(t);
        g.fillStyle = flip ? `rgba(255,143,134,${a})` : `rgba(184,233,134,${a * 0.85})`;
        const bh = 14 * scan.agree[t];
        g.fillRect(left + t * cw + 1, gridH + 6 + (14 - bh), cw - 2, bh);
      }
      g.fillStyle = "#9aa6b2";
      g.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
      g.fillText("layer 1", 0, 10);
      g.fillText("layer 36", 0, gridH - 2);
      g.fillText("base agrees", 0, gridH + 18);
    };
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, last = -1, prev = performance.now(), drawn = -1;
    clock.current = reduced ? SCAN : 0;
    told.current = false;
    const tick = (now: number) => {
      const dt = Math.min(64, now - prev);
      prev = now;
      if (playRef.current && clock.current < SCAN) clock.current = Math.min(SCAN, clock.current + dt);
      if (clock.current !== drawn) {
        drawn = clock.current;
        const k = Math.min(T, (clock.current / SCAN) * T);
        r.update((c) => (k - c) * 1.6);
        r.render();
        drawHeat(k);
        const n = Math.floor(k);
        if (n !== last) { last = n; setFront(n); }
        setTime(clock.current);
        // one pass tells the story; the picture then holds until the visitor moves on
        if (clock.current >= SCAN && !told.current) {
          told.current = true;
          window.setTimeout(() => root.current?.dispatchEvent(new CustomEvent("lab:module-round", { bubbles: true })), 2600);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); r.dispose(); };
  }, [scan, active]);

  // Dive deeper stops the scan with its scrubber free; keep playing runs it again.
  useEffect(() => {
    if (!active) return;
    const dive = () => setPlaying(false);
    const resume = () => { if (clock.current >= SCAN) { clock.current = 0; told.current = false; } setPlaying(true); };
    window.addEventListener("lab:dive", dive);
    window.addEventListener("lab:resume", resume);
    return () => { window.removeEventListener("lab:dive", dive); window.removeEventListener("lab:resume", resume); };
  }, [active]);
  useSummaryPause(() => setPlaying(false), () => setPlaying(true), active);
  useEffect(() => { if (active) emitMeter({ text: `Reading the answer word by word: ${Math.min(front, T)} of ${T}`, tone: "optimized" }); }, [active, front]);

  const flips = [...BASE_WOULD.keys()];
  const seen = flips.filter((t) => t < front).length;
  return (
    <div ref={root} className="sc-root sc-rose">
      <header className="sc-head">
        <div>
          <span className="sc-kicker">{tr("After SFT and GRPO, on one coding task: first_item([]) crashes. Fix it.")}</span>
          <h3>{tr("Inside the model: where the RL checkpoint's layers moved away from the base model's")}</h3>
        </div>
        <div className="sc-count"><b className="cx-hero-num" data-hero={seen === flips.length || undefined}>{seen}</b><small>{tr(`of ${flips.length} words the base model would have written differently`)}</small></div>
      </header>
      <div className="sc-stage">
        <div ref={relief} className="sc-relief" />
        <svg ref={labels} className="sc-labels" aria-hidden="true">
          {TOKENS.map((tok, t) => <text key={t} data-flip={BASE_WOULD.has(t) || undefined} opacity={t < front ? 1 : 0.14}>{tok.trim() || "·"}</text>)}
        </svg>
      </div>
      <canvas ref={heat} className="sc-heat" aria-label={tr("Flat view: every token a column, every layer a row")} />
      <p className="sc-ribbon" aria-label={tr("The RL checkpoint's answer")}>
        {TOKENS.map((tok, t) => {
          if (tok === "⏎") return <span key={t} className="sc-break" data-on={t < front || undefined}>⏎</span>;
          const base = BASE_WOULD.get(t);
          return (
            <span key={t} className="sc-tok" data-on={t < front || undefined} data-now={t === front - 1 || undefined} data-flip={base ? true : undefined}>
              {tok}{base && <s data-on={t < front || undefined}>{base}</s>}
            </span>
          );
        })}
      </p>
      <div className="sc-transport">
        <button type="button" aria-label={tr(playing && time < SCAN ? "Pause" : "Play")} onClick={() => { if (clock.current >= SCAN) { clock.current = 0; told.current = false; setPlaying(true); } else setPlaying((p) => !p); }}>{playing && time < SCAN ? "Ⅱ" : "▷"}</button>
        <input type="range" min={0} max={SCAN} step={50} value={time} aria-label={tr("Move the scan through the answer")} onChange={(e) => { clock.current = Number(e.target.value); setTime(clock.current); }} />
      </div>
      <footer className="sc-legend">
        <span className="sc-ramp"><i />{tr("unchanged → most changed")}</span>
        <span><s>{tr("struck")}</s> {tr("= what the base model would have written at that point")}</span>
        <span>{tr("teacher-forced comparison · simulated difference field")}</span>
      </footer>
    </div>
  );
}
