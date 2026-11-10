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
const GROW = 2.6, ROW_GROW = 1.6;
const FIGURE_FROM = 2.8, FIGURE_REST = 5.4; // seconds into a figure's loop: labels are showing from here on

export function GlossaryBoard({ items, active = true, total }: { items: readonly ReelItem[]; active?: boolean; total?: string }) {
  const tr = useTr();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(0);
  // Every card moves the same way: the walk owns the highlight. A pointer only clears a card's blur (CSS);
  // it never takes the highlight, so the walk neither freezes under a resting mouse nor jumps when it leaves.
  const shown = open;
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
  // The walk: one card every STEP. The Summary's pause holds it where it is.
  useEffect(() => {
    if (!active || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0, at = 0, held = false, seen = false;
    const tick = () => {
      at += 1;
      if (at < items_n) { setOpen(at); timer = window.setTimeout(tick, STEP); return; }
      emitMeter({ text: tr(total ?? "Nine serving terms, each one in this project"), step: items_n, total: items_n, tone: "delta" });
      root.current?.dispatchEvent(new CustomEvent("lab:module-round", { bubbles: true }));
    };
    const start = () => { window.clearTimeout(timer); at = 0; setOpen(0); if (!held) timer = window.setTimeout(tick, STEP); };
    const hold = () => { held = true; window.clearTimeout(timer); };
    const release = () => { if (!held) return; held = false; if (seen && at < items_n) timer = window.setTimeout(tick, STEP); };
    const io = new IntersectionObserver(([e]) => {
      window.clearTimeout(timer);
      seen = e.isIntersecting;
      if (seen) start();
    }, { threshold: 0.15 });
    if (root.current) io.observe(root.current);
    window.addEventListener("lab:hold", hold);
    window.addEventListener("lab:release", release);
    return () => { io.disconnect(); window.clearTimeout(timer); window.removeEventListener("lab:hold", hold); window.removeEventListener("lab:release", release); emitMeter(null); };
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
    <div ref={root} className="gr-root">
      {rows.map((row, r) => {
        const offset = r * perRow;
        const rowLit = shown >= offset && shown < offset + row.length;
        return (
          <div key={r} className="gr-row" data-lit={rowLit} style={{ flexGrow: rowLit ? ROW_GROW : 1 }}>
            {row.map((item, k) => {
              const i = offset + k, lit = i === shown;
              return (
                <button key={item.key} type="button" className="gr-tile" data-lit={lit} style={{ flexGrow: lit ? GROW : 1 }} onClick={item.onOpen}>
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
