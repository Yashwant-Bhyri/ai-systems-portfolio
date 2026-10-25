"use client";

import { useTr } from "../../exhibit/i18n";
import type { ReelItem } from "./reel";

/**
 * The serving glossary as one board on the stage: nine terms, each with its
 * silhouette, one number, and a link to where this project runs it.
 */
export function GlossaryBoard({ items }: { items: readonly ReelItem[] }) {
  const tr = useTr();
  return (
    <div className="gb-root">
      <header className="gb-head">
        <h3>{tr("Serving glossary")}</h3>
        <span>{tr("Nine serving terms, with this lab's number where it measures one. Select a term to see it in the microscope.")}</span>
      </header>
      <div className="gb-grid">
        {items.map((item) => (
          <article key={item.key} className="gb-card" data-link={item.onOpen ? true : undefined} onClick={item.onOpen}>
            <span className="gb-glyph" aria-hidden="true"><item.Glyph /></span>
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
