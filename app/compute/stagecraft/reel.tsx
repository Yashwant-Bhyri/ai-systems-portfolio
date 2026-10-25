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
  Glyph?: ComponentType;
  /** Puts this investigation on the stage. Without it the tile only opens in place. */
  onOpen?: () => void;
  /** Words for the open action, when it leads somewhere other than this stage. */
  openLabel?: string;
  current?: boolean;
};

const GROW = 3.4;
/** Stacked tiles have less length to share, so the open one grows less. */
const GROW_COLUMN = 2.3;

export function ExplorationReel({
  label,
  items,
  step = 2900,
  note,
  orientation = "row",
  compact = false,
}: {
  label: string;
  items: readonly ReelItem[];
  step?: number;
  note?: string;
  /** "column" stacks the tiles; the open tile then grows downward. */
  orientation?: "row" | "column";
  /** A shorter reel (glyph and title only on closed tiles), for sticky placements. */
  compact?: boolean;
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
  const [height, setHeight] = useState(0);
  const column = orientation === "column";
  const open = hover ?? index;
  // Hover intent: a tile opens only after the pointer settles, so tiles never shift under an aiming cursor.
  const intent = useRef<number | undefined>(undefined);
  const aim = (i: number | null) => {
    window.clearTimeout(intent.current);
    if (i === null) { setHover(null); return; }
    intent.current = window.setTimeout(() => setHover(i), 320);
  };
  const tr = useTr();

  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)"), n = matchMedia("(max-width: 760px)");
    const u = () => { setReduced(m.matches); setNarrow(n.matches); };
    u(); m.addEventListener("change", u); n.addEventListener("change", u);
    const el = root.current;
    const io = el ? new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.4 }) : null;
    if (el) io?.observe(el);
    const ro = row.current ? new ResizeObserver(([e]) => { setWidth(e.contentRect.width); setHeight(e.contentRect.height); }) : null;
    if (row.current) ro?.observe(row.current);
    return () => { m.removeEventListener("change", u); n.removeEventListener("change", u); io?.disconnect(); ro?.disconnect(); };
  }, []);

  // Silhouettes only animate while the reel is on screen.
  useEffect(() => {
    row.current?.querySelectorAll("svg").forEach((svg) => (inView && !reduced ? svg.unpauseAnimations() : svg.pauseAnimations()));
  }, [inView, reduced]);

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
    if (column) {
      const unit = (height - gap * (n - 1)) / (n - 1 + GROW_COLUMN);
      const y = open * (unit + gap) + Math.min(unit * GROW_COLUMN, 140) / 2;
      c.style.transform = `translate3d(${width * 0.62}px, ${r.offsetTop + y}px, 0)`;
    } else {
      const unit = (width - gap * (n - 1)) / (n - 1 + GROW);
      const x = open * (unit + gap) + (unit * GROW) / 2;
      c.style.transform = `translate3d(${x + 18}px, ${r.offsetTop + (compact ? 34 : 54)}px, 0)`;
    }
    c.dataset.live = String(auto);
  }, [open, width, height, narrow, auto, items.length, column, compact]);

  useEffect(() => {
    if (!narrow || !auto) return;
    const tile = row.current?.children[index] as HTMLElement | undefined;
    tile?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [index, narrow, auto]);

  return (
    <div ref={root} className="rl-reel" data-auto={auto} data-orientation={orientation} data-compact={compact || undefined}>
      <header className="rl-head">
        <span>{tr(label)}</span>
        <i aria-hidden="true">{String(open + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</i>
        {note && <small>{tr(note)}</small>}
      </header>
      <div ref={row} className="rl-row" onPointerLeave={() => aim(null)}>
        {items.map((item, i) => {
          const lit = i === open;
          return (
            <button
              key={item.key}
              type="button"
              className="rl-tile"
              data-lit={lit}
              data-current={item.current || undefined}
              style={{ flexGrow: narrow ? undefined : lit ? (column ? GROW_COLUMN : GROW) : 1 }}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") aim(i); }}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              onClick={() => { window.clearTimeout(intent.current); setHover(null); setIndex(i); item.onOpen?.(); }}
              aria-label={`${item.title}${item.value ? `, ${item.value} ${item.unit ?? ""}` : ""}${item.onOpen ? ". Open on the stage" : ""}`}
            >
              <span className="rl-num">{String(i + 1).padStart(2, "0")}{item.current && <b>{tr("on stage")}</b>}</span>
              <span className="rl-glyph" aria-hidden="true">{item.Glyph && <item.Glyph />}</span>
              <strong className="rl-title">{tr(item.title)}</strong>
              <span className="rl-detail" aria-hidden={!lit}>
                {item.term && <em className="rl-term">{tr(item.term)}</em>}
                {item.value && <span className="rl-value"><mark>{item.value}</mark>{item.unit && <small>{tr(item.unit)}</small>}</span>}
                {item.chips && <span className="rl-chips">{item.chips.map((c) => <i key={c}>{c}</i>)}</span>}
                {item.onOpen && !item.current && <span className="rl-open">{tr(item.openLabel ?? "Open on stage ↗")}</span>}
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
