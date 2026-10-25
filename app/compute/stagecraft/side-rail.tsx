"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { useTr } from "../../exhibit/i18n";

/**
 * The laboratory's module bar: one row above the stage. Every module of the
 * active branch is a tab with a small moving silhouette; the open one brightens,
 * shows its key number, and (for the film) unfolds its chapters inline, so
 * navigation never takes width or height from the stage. When the row is wider
 * than the bar, its edges fade and a chevron names how many tabs lie beyond.
 */
export type RailItem = {
  key: string;
  title: string;
  /** What the module shows; used as the tab's description. */
  term?: string;
  value?: string;
  unit?: string;
  Glyph?: ComponentType;
  onOpen: () => void;
  current?: boolean;
  /** Rendered beside the open tab (for example the film's chapters). */
  children?: ReactNode;
};

export function ModuleBar({ label, items }: { label: string; items: readonly RailItem[] }) {
  const tr = useTr();
  const bar = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState({ left: 0, right: 0 });
  const measure = useCallback(() => {
    const el = bar.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    let left = 0, right = 0;
    el.querySelectorAll<HTMLElement>(":scope > .mb-item").forEach((item) => {
      const r = item.getBoundingClientRect();
      if (r.right > box.right + 2) right++;
      else if (r.left < box.left - 2) left++;
    });
    setHidden((h) => (h.left === left && h.right === right ? h : { left, right }));
  }, []);
  const currentKey = items.find((i) => i.current)?.key;
  // Keep the open tab (and its chapters) fully inside the bar, without moving the page.
  useEffect(() => {
    const el = bar.current;
    const item = el?.querySelector<HTMLElement>(":scope > .mb-item[data-current]");
    if (!el || !item) return;
    const t = window.setTimeout(() => {
      const box = el.getBoundingClientRect(), r = item.getBoundingClientRect();
      if (r.left < box.left + 24) el.scrollBy({ left: r.left - box.left - 24, behavior: "smooth" });
      else if (r.right > box.right - 24) el.scrollBy({ left: Math.min(r.right - box.right + 24, r.left - box.left - 24), behavior: "smooth" });
    }, 80);
    return () => window.clearTimeout(t);
  }, [currentKey]);
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.querySelectorAll(":scope > .mb-item").forEach((i) => ro.observe(i));
    el.addEventListener("scroll", measure, { passive: true });
    return () => { ro.disconnect(); el.removeEventListener("scroll", measure); };
  }, [measure, items.length, currentKey]);
  const page = (dir: 1 | -1) => bar.current?.scrollBy({ left: dir * bar.current.clientWidth * 0.6, behavior: "smooth" });
  return (
    <div className="mb-wrap" data-more-left={hidden.left > 0 || undefined} data-more-right={hidden.right > 0 || undefined}>
      <nav ref={bar} className="mb-bar" aria-label={tr(label)}>
        {items.map((item) => (
          <div key={item.key} className="mb-item" data-current={item.current || undefined}>
            <button
              type="button"
              className="mb-tab"
              aria-current={item.current ? "page" : undefined}
              title={item.term ? `${tr(item.title)} · ${tr(item.term)}` : undefined}
              onClick={item.onOpen}
            >
              {item.Glyph && <span className="mb-thumb" aria-hidden="true"><item.Glyph /></span>}
              <strong>{tr(item.title)}</strong>
              {item.current && item.value && !item.children && (
                <span className="mb-value"><mark>{item.value}</mark>{item.unit && <small>{tr(item.unit)}</small>}</span>
              )}
            </button>
            {item.current && item.children && <div className="mb-chapters">{item.children}</div>}
          </div>
        ))}
      </nav>
      {hidden.left > 0 && <button type="button" className="mb-more mb-more-left" aria-label={tr("Earlier modules")} onClick={() => page(-1)}>‹ <small>+{hidden.left}</small></button>}
      {hidden.right > 0 && <button type="button" className="mb-more mb-more-right" aria-label={tr("More modules")} onClick={() => page(1)}><small>+{hidden.right}</small> ›</button>}
    </div>
  );
}
