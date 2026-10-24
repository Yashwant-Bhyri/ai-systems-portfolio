"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ComponentType } from "react";
import { useTr } from "../../exhibit/i18n";

/**
 * The exploration reel: every deeper investigation stays visible as a moving
 * silhouette. One tile at a time opens, in full colour, while the rest blur.
 * A cursor walks the row on its own until the visitor takes over.
 */
export type ReelItem = {
  key: string;
  title: string;
  /** A term of art or short mechanism name, shown when open. */
  term?: string;
  value?: string;
  unit?: string;
  chips?: readonly string[];
  Glyph: ComponentType;
  /** Puts this investigation on the stage. Without it the tile only opens in place. */
  onOpen?: () => void;
  current?: boolean;
};

const GROW = 3.4;

export function ExplorationReel({
  label,
  items,
  step = 2900,
  note,
}: {
  label: string;
  items: readonly ReelItem[];
  step?: number;
  note?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [reduced, setReduced] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [width, setWidth] = useState(0);
  const open = hover ?? index;
  const tr = useTr();

  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)"), n = matchMedia("(max-width: 760px)");
    const u = () => { setReduced(m.matches); setNarrow(n.matches); };
    u(); m.addEventListener("change", u); n.addEventListener("change", u);
    const el = root.current;
    const io = el ? new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.4 }) : null;
    if (el) io?.observe(el);
    const ro = row.current ? new ResizeObserver(([e]) => setWidth(e.contentRect.width)) : null;
    if (row.current) ro?.observe(row.current);
    return () => { m.removeEventListener("change", u); n.removeEventListener("change", u); io?.disconnect(); ro?.disconnect(); };
  }, []);

  const auto = inView && hover === null && !reduced;
  useEffect(() => {
    if (!auto) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % items.length), step);
    return () => window.clearTimeout(id);
  }, [auto, index, items.length, step]);

  // The cursor lands where the opening tile will be once the row settles.
  useLayoutEffect(() => {
    const c = cursor.current, r = row.current;
    if (!c || !r || narrow || !width) return;
    const n = items.length, gap = 10;
    const unit = (width - gap * (n - 1)) / (n - 1 + GROW);
    const x = open * (unit + gap) + (unit * GROW) / 2;
    c.style.transform = `translate3d(${x + 18}px, ${r.offsetTop + 54}px, 0)`;
    c.dataset.live = String(auto);
  }, [open, width, narrow, auto, items.length]);

  useEffect(() => {
    if (!narrow || !auto) return;
    const tile = row.current?.children[index] as HTMLElement | undefined;
    tile?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [index, narrow, auto]);

  return (
    <div ref={root} className="rl-reel" data-auto={auto}>
      <header className="rl-head">
        <span>{tr(label)}</span>
        <i aria-hidden="true">{String(open + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</i>
        {note && <small>{tr(note)}</small>}
      </header>
      <div ref={row} className="rl-row" onPointerLeave={() => setHover(null)}>
        {items.map((item, i) => {
          const lit = i === open;
          return (
            <button
              key={item.key}
              type="button"
              className="rl-tile"
              data-lit={lit}
              data-current={item.current || undefined}
              style={{ flexGrow: narrow ? undefined : lit ? GROW : 1 }}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") setHover(i); }}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              onClick={() => { setIndex(i); item.onOpen?.(); }}
              aria-label={`${item.title}${item.value ? `, ${item.value} ${item.unit ?? ""}` : ""}${item.onOpen ? ". Open on the stage" : ""}`}
            >
              <span className="rl-num">{String(i + 1).padStart(2, "0")}{item.current && <b>{tr("on stage")}</b>}</span>
              <span className="rl-glyph" aria-hidden="true"><item.Glyph /></span>
              <strong className="rl-title">{tr(item.title)}</strong>
              <span className="rl-detail" aria-hidden={!lit}>
                {item.term && <em className="rl-term">{tr(item.term)}</em>}
                {item.value && <span className="rl-value"><mark>{item.value}</mark>{item.unit && <small>{tr(item.unit)}</small>}</span>}
                {item.chips && <span className="rl-chips">{item.chips.map((c) => <i key={c}>{c}</i>)}</span>}
                {item.onOpen && !item.current && <span className="rl-open">{tr("Open on stage ↗")}</span>}
              </span>
            </button>
          );
        })}
      </div>
      <div ref={cursor} className="gc-cursor rl-cursor" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 2.5l15 9.2-6.6 1.4 3.9 7.6-2.6 1.3-3.9-7.6L4.9 19z" /></svg>
        <i className="gc-ring" />
      </div>
    </div>
  );
}
