"use client";

import { useEffect, useRef, useState } from "react";
import { useTr } from "../../exhibit/i18n";
import { emitMeter } from "./stage-meter";
import type { ReelItem } from "./reel";
import "./glossary-figures.css";

/**
 * The serving glossary as a reel: three rows of title cards. The open card grows while
 * its figure plays, its row opens up, and the cursor walks on through all nine terms.
 * After one pass the module reports it is done.
 */
const STEP = 2600;
const GROW = 2.6;
const FIGURE_FROM = 2.8, FIGURE_REST = 5.4; // seconds into a figure's loop: labels are showing from here on

export function GlossaryBoard({ items, active = true }: { items: readonly ReelItem[]; active?: boolean }) {
  const tr = useTr();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? open;
  const perRow = 3;
  const rows = Array.from({ length: Math.ceil(items.length / perRow) }, (_, r) => items.slice(r * perRow, (r + 1) * perRow));
  const svgs = () => [...(root.current?.querySelectorAll<SVGSVGElement>(".gr-glyph > svg") ?? [])];

  // Only the open card's figure runs.
  useEffect(() => {
    const all = svgs();
    all.forEach((svg, i) => {
      if (i === shown && active) { svg.setCurrentTime(FIGURE_FROM); svg.unpauseAnimations(); }
      else { svg.pauseAnimations(); svg.setCurrentTime(FIGURE_REST); }
    });
  }, [shown, active]);

  const items_n = items.length;
  useEffect(() => {
    if (!active || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timers: number[] = [];
    const run = () => {
      setOpen(0);
      for (let i = 1; i < items_n; i++) timers.push(window.setTimeout(() => setOpen(i), i * STEP));
      timers.push(window.setTimeout(() => {
        emitMeter({ text: tr("Nine serving terms, each one in this project"), step: items_n, total: items_n, tone: "delta" });
        root.current?.dispatchEvent(new CustomEvent("lab:module-round", { bubbles: true }));
      }, items_n * STEP));
    };
    const io = new IntersectionObserver(([e]) => {
      timers.forEach((t) => window.clearTimeout(t)); timers = [];
      if (e.isIntersecting) run();
    }, { threshold: 0.15 });
    if (root.current) io.observe(root.current);
    return () => { io.disconnect(); timers.forEach((t) => window.clearTimeout(t)); emitMeter(null); };
    // `tr` changes identity per render; the walk should not restart for it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, items_n]);
  const cur = items[shown];
  useEffect(() => {
    if (active && cur) emitMeter({ text: `${tr(cur.title)}${cur.term ? `: ${tr(cur.term)}` : ""}`, step: shown + 1, total: items_n, tone: "neutral" });
    // see above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, shown, items_n]);

  return (
    <div ref={root} className="gr-root" onPointerLeave={() => setHover(null)}>
      {rows.map((row, r) => {
        const offset = r * perRow;
        return (
          <div key={r} className="gr-row">
            {row.map((item, k) => {
              const i = offset + k, lit = i === shown;
              return (
                <button key={item.key} type="button" className="gr-tile" data-lit={lit} style={{ flexGrow: lit ? GROW : 1 }} onPointerEnter={(e) => { if (e.pointerType === "mouse") setHover(i); }} onClick={item.onOpen}>
                  <span className="gr-glyph" aria-hidden="true">{item.Glyph && <item.Glyph />}</span>
                  <strong>{tr(item.title)}</strong>
                  <span className="gr-detail" aria-hidden={!lit}>
                    {item.term && <em>{tr(item.term)}</em>}
                    {item.value && <span className="gr-value"><mark>{item.value}</mark> {item.unit && <small>{tr(item.unit)}</small>}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
