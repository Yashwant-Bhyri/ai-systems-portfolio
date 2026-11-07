"use client";

import { useEffect, useRef, useState } from "react";
import { useTr } from "../../exhibit/i18n";
import { emitMeter } from "./stage-meter";
import type { ReelItem } from "./reel";
import "./glossary-figures.css";

/**
 * The serving glossary as a closing show. The board starts empty. Each term
 * comes to the middle of the stage, large, with its figure running, then
 * settles into its slot. When all nine are placed, the cursor sweeps the board
 * and each term lifts as it passes. Then the module reports it is done.
 */
const OPEN = 2300, SETTLE = 520, WALK = 460;
const FIGURE_FROM = 2.8, FIGURE_REST = 5.4; // seconds into a figure's loop: labels are showing from here on

export function GlossaryBoard({ items, active = true }: { items: readonly ReelItem[]; active?: boolean }) {
  const tr = useTr();
  const grid = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState(0);
  const [open, setOpen] = useState(-1);
  const [hot, setHot] = useState(-1);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [lift, setLift] = useState<{ x: number; y: number; k: number } | null>(null);
  const svgOf = (i: number) => grid.current?.children[i]?.querySelector<SVGSVGElement>(".gb-glyph > svg");

  useEffect(() => {
    const el = grid.current;
    if (!el) return;
    const all = () => [...el.querySelectorAll<SVGSVGElement>(".gb-glyph > svg")];
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      all().forEach((svg) => { svg.pauseAnimations(); svg.setCurrentTime(FIGURE_REST); });
      const id = window.setTimeout(() => setPlaced(items.length), 0);
      return () => window.clearTimeout(id);
    }
    if (!active) { all().forEach((svg) => svg.pauseAnimations()); return; }
    let timers: number[] = [];
    const clear = () => { timers.forEach((t) => window.clearTimeout(t)); timers = []; };
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const run = () => {
      clear();
      setPlaced(0); setOpen(-1); setHot(-1); setCursor(null);
      all().forEach((svg) => { svg.pauseAnimations(); svg.setCurrentTime(FIGURE_REST); });
      const box = () => el.getBoundingClientRect();
      const stage = () => root.current!.getBoundingClientRect();
      items.forEach((item, i) => {
        const start = 500 + i * (OPEN + SETTLE);
        at(start, () => {
          const card = el.children[i] as HTMLElement, r = card.getBoundingClientRect(), s = stage();
          const k = Math.min((s.width * 0.6) / r.width, (s.height * 0.62) / r.height);
          setLift({ x: s.left + s.width / 2 - (r.left + r.width / 2), y: s.top + s.height / 2 - (r.top + r.height / 2), k });
          setOpen(i);
          const svg = svgOf(i);
          if (svg) { svg.setCurrentTime(FIGURE_FROM); svg.unpauseAnimations(); }
          emitMeter({ text: `${tr(item.title)}${item.term ? `: ${tr(item.term)}` : ""}`, step: i + 1, total: items.length, tone: "neutral" });
        });
        at(start + OPEN, () => {
          setOpen(-1); setPlaced(i + 1);
          const svg = svgOf(i);
          if (svg) { svg.pauseAnimations(); svg.setCurrentTime(FIGURE_REST); }
        });
      });
      const walkAt = 500 + items.length * (OPEN + SETTLE) + 200;
      items.forEach((_, i) => at(walkAt + i * WALK, () => {
        const card = el.children[i] as HTMLElement, r = card.getBoundingClientRect(), b = box();
        setHot(i);
        setCursor({ x: r.left - b.left + r.width * 0.66, y: r.top - b.top + r.height * 0.5 });
      }));
      at(walkAt + items.length * WALK, () => {
        setHot(-1); setCursor(null);
        emitMeter({ text: tr("Nine serving terms, each one in this project"), step: items.length, total: items.length, tone: "delta" });
        root.current?.dispatchEvent(new CustomEvent("lab:module-round", { bubbles: true }));
      });
    };
    let shown = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !shown) run();
      if (!e.isIntersecting) { clear(); all().forEach((svg) => svg.pauseAnimations()); }
      shown = e.isIntersecting;
    }, { threshold: 0.15 });
    io.observe(el);
    return () => { io.disconnect(); clear(); emitMeter(null); };
    // `tr` changes identity per render; the sequence should not restart for it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, items.length]);

  return (
    <div ref={root} className="gb-root" data-opening={open >= 0 || undefined}>
      <header className="gb-head">
        <h3>{tr("Serving glossary")}</h3>
      </header>
      <div ref={grid} className="gb-grid" style={{ position: "relative" }}>
        {items.map((item, i) => (
          <article
            key={item.key}
            className="gb-card"
            data-link={item.onOpen ? true : undefined}
            data-state={i === open ? "open" : i < placed ? "placed" : "empty"}
            data-hot={hot === i || undefined}
            style={i === open && lift ? { transform: `translate(${lift.x}px, ${lift.y}px) scale(${lift.k})` } : undefined}
            onClick={item.onOpen}
          >
            <span className="gb-glyph" aria-hidden="true">{item.Glyph && <item.Glyph />}</span>
            <strong>{tr(item.title)}</strong>
            {item.term && <em>{tr(item.term)}</em>}
            {item.value && <span className="gb-value"><mark>{item.value}</mark> {item.unit && <small>{tr(item.unit)}</small>}</span>}
            {item.onOpen && (
              <button type="button" aria-label={`${tr(item.title)}: ${tr(item.openLabel ?? "Open ↗")}`} onClick={(e) => { e.stopPropagation(); item.onOpen?.(); }}>↗</button>
            )}
          </article>
        ))}
        {cursor && (
          <span className="ts-cursor" aria-hidden="true" style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}>
            <svg viewBox="0 0 22 22" width="22" height="22"><path d="M3 2l15 8-6.5 1.8L9 18z" fill="#f4f7fa" stroke="#0b1016" strokeWidth="1.3" strokeLinejoin="round" /></svg>
          </span>
        )}
      </div>
    </div>
  );
}
