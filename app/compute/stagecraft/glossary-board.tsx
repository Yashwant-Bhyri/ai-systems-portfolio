"use client";

import { useEffect, useRef } from "react";
import { useTr } from "../../exhibit/i18n";
import type { ReelItem } from "./reel";
import "./glossary-figures.css";

/**
 * The serving glossary as one board on the stage: nine terms, each with its
 * figure, one number, and a link to where this project runs it. The figures
 * restart together each time the board comes into view and pause off screen,
 * so no figure is ever caught mid-loop or frozen.
 */
export function GlossaryBoard({ items }: { items: readonly ReelItem[] }) {
  const tr = useTr();
  const grid = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = grid.current;
    if (!el) return;
    const svgs = () => [...el.querySelectorAll<SVGSVGElement>(".gb-glyph > svg")];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // A still frame near the end of each loop, where every label is showing.
      svgs().forEach((svg) => { svg.pauseAnimations(); svg.setCurrentTime(5.4); });
      return;
    }
    let shown = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !shown) svgs().forEach((svg) => { svg.setCurrentTime(0); svg.unpauseAnimations(); });
      if (!e.isIntersecting) svgs().forEach((svg) => svg.pauseAnimations());
      shown = e.isIntersecting;
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="gb-root">
      <header className="gb-head">
        <h3>{tr("Serving glossary")}</h3>
        <span>{tr("Nine serving terms, with this lab's number where it measures one. Select a term to see it in the microscope.")}</span>
      </header>
      <div ref={grid} className="gb-grid">
        {items.map((item) => (
          <article key={item.key} className="gb-card" data-link={item.onOpen ? true : undefined} onClick={item.onOpen}>
            <span className="gb-glyph" aria-hidden="true">{item.Glyph && <item.Glyph />}</span>
            <strong>{tr(item.title)}</strong>
            {item.term && <em>{tr(item.term)}</em>}
            {item.value && <span className="gb-value"><mark>{item.value}</mark> {item.unit && <small>{tr(item.unit)}</small>}</span>}
            {item.onOpen && (
              <button type="button" aria-label={`${tr(item.title)}: ${tr(item.openLabel ?? "Open ↗")}`} onClick={(e) => { e.stopPropagation(); item.onOpen?.(); }}>↗</button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
