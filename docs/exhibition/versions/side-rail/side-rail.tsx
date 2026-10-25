"use client";

import type { ComponentType, ReactNode } from "react";
import { useTr } from "../../exhibit/i18n";

/**
 * The laboratory's left rail. Every module of the active branch stays listed;
 * the one on the stage opens to show its key number and its sub-navigation
 * (the film's chapters). Collapsed rows keep a small moving silhouette so the
 * visitor sees there is more to explore without leaving the stage.
 */
export type RailItem = {
  key: string;
  title: string;
  /** What the module shows, in terms of art. */
  term?: string;
  value?: string;
  unit?: string;
  Glyph?: ComponentType;
  onOpen: () => void;
  current?: boolean;
  /** Rendered inside the open row (for example the film's chapter list). */
  children?: ReactNode;
};

export function SideRail({ label, items, showLabel = true }: { label: string; items: readonly RailItem[]; showLabel?: boolean }) {
  const tr = useTr();
  return (
    <nav className="sr-rail" aria-label={tr(label)}>
      {showLabel && <span className="sr-label">{tr(label)}</span>}
      {items.map((item, i) => (
        <div key={item.key} className="sr-item" data-current={item.current || undefined}>
          <button type="button" className="sr-head" aria-current={item.current ? "true" : undefined} onClick={item.onOpen}>
            <i>{String(i + 1).padStart(2, "0")}</i>
            <strong>{tr(item.title)}</strong>
            {item.Glyph && <span className="sr-thumb" aria-hidden="true"><item.Glyph /></span>}
          </button>
          {item.current && (
            <div className="sr-body">
              {item.value && (
                <span className="sr-value"><mark>{item.value}</mark>{item.unit && <small>{tr(item.unit)}</small>}</span>
              )}
              {item.term && <em className="sr-term">{tr(item.term)}</em>}
              {item.children}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
