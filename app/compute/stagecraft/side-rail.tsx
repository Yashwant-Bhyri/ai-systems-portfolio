"use client";

import type { ComponentType, ReactNode } from "react";
import { useTr } from "../../exhibit/i18n";

/**
 * The laboratory's module bar: one slim row above the stage. Every module of
 * the active branch is a tab with a small moving silhouette; the open one
 * brightens, shows its key number, and (for the film) unfolds its chapters
 * inline, so navigation never takes width or height from the stage.
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
  return (
    <nav className="mb-bar" aria-label={tr(label)}>
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
  );
}
