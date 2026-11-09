"use client";

import type { ComponentType } from "react";
import { highlight } from "./stage-meter";
import "./intro-labels.css";

/** A label is plain words, or a numbered aim with its own picture and the techniques that serve it. */
export type IntroLabel = string | { title: string; note?: string; items: readonly string[]; Glyph?: ComponentType };
export type IntroLine = string | { labels: readonly IntroLabel[] };

/** The numbered aims, side by side, each a picture first. Used on the project's second page and the laboratory's opening. */
export function IntroLabels({ labels, tr = (s) => s }: { labels: readonly IntroLabel[]; tr?: (s: string) => string }) {
  return (
    <ul className="il-row">
      {labels.map((l, i) => typeof l === "string"
        ? <li key={l} style={{ animationDelay: `${i * 260}ms` }}><i>{i + 1}</i>{highlight(tr(l))}</li>
        : <li key={l.title} className="il-group" style={{ animationDelay: `${i * 360}ms` }}>
            {l.Glyph && <span className="il-art" aria-hidden="true"><l.Glyph /></span>}
            <span className="il-head"><i>{i + 1}</i><span><b>{tr(l.title)}</b>{l.note && <small>{tr(l.note)}</small>}</span></span>
            <span className="il-items">{l.items.map((x, k) => <em key={x} style={{ animationDelay: `${i * 360 + 500 + k * 180}ms` }}>{tr(x)}</em>)}</span>
          </li>)}
    </ul>
  );
}
