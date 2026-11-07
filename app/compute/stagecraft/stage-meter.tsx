"use client";

import { useEffect, useRef, useState } from "react";
import "./focus.css";

/**
 * Two shared guides for every module in the show, so no module needs a text
 * block at the bottom of its figure:
 *
 *  - the live meter: one line in the lab head (the most visible free space)
 *    saying what is happening right now, with the step it is on;
 *  - focus: the stage goes grey, soft and quiet except the elements marked
 *    `data-focus-spot`, which glow; a large caption at the top of the stage
 *    reads the result (baseline → optimized, Δ, and its cause).
 *
 * Modules emit; the lab renders. `emitMeter(null)` / `emitFocus(null)` clear.
 */
export type Tone = "baseline" | "optimized" | "delta" | "problem" | "neutral";
export type MeterDetail = { text: string; step?: number; total?: number; tone?: Tone } | null;
export type FocusDetail = {
  /** What the eye should land on, in a few words: "Request 7 waits 14.26 s less". */
  headline: string;
  /** Optional ledger: label and value pairs, read left to right. */
  parts?: readonly { label: string; value: string; tone?: Tone }[];
  /** Why it happened, one short clause. */
  cause?: string;
  /** Where the caption sits on the stage (default top). */
  place?: "top" | "center" | "bottom";
  tone?: Tone;
} | null;

export const emitMeter = (detail: MeterDetail) => window.dispatchEvent(new CustomEvent("lab:meter", { detail }));
export const emitFocus = (detail: FocusDetail) => window.dispatchEvent(new CustomEvent("lab:focus", { detail }));

function useLabEvent<T>(name: string, reset: string) {
  const [value, setValue] = useState<T | null>(null);
  useEffect(() => {
    const on = (e: Event) => setValue((e as CustomEvent<T | null>).detail);
    window.addEventListener(name, on);
    return () => window.removeEventListener(name, on);
  }, [name]);
  // A module change clears what the previous module said.
  const [seen, setSeen] = useState(reset);
  if (seen !== reset) { setSeen(reset); setValue(null); }
  return value;
}

/** The one-line live meter, rendered in the lab head. */
export function StageMeter({ moduleKey }: { moduleKey: string }) {
  const m = useLabEvent<NonNullable<MeterDetail>>("lab:meter", moduleKey);
  return (
    <div className="sm-meter" data-on={m ? "true" : "false"} data-tone={m?.tone ?? "neutral"} aria-live="polite">
      {m && (
        <>
          <i aria-hidden="true" />
          <span key={m.text}>{m.text}</span>
          {m.total ? (
            <b aria-label={`step ${m.step ?? 0} of ${m.total}`}>
              {Array.from({ length: m.total }, (_, k) => <em key={k} data-done={k < (m.step ?? 0) || undefined} />)}
            </b>
          ) : null}
        </>
      )}
    </div>
  );
}

/** Focus: dims the stage and states the result in large type at its top. */
export function FocusCaption({ moduleKey }: { moduleKey: string }) {
  const f = useLabEvent<NonNullable<FocusDetail>>("lab:focus", moduleKey);
  const own = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = own.current?.closest<HTMLElement>(".lf-stage") ?? document.querySelector<HTMLElement>(".lab-flow-show .lf-stage:not([hidden])");
    if (!el) return;
    if (f) el.dataset.focus = "on"; else delete el.dataset.focus;
    return () => { delete el.dataset.focus; };
  }, [f]);
  if (!f) return <div ref={own} hidden />;
  return (
    <div ref={own} className="sm-focus" role="status" key={f.headline} data-place={f.place ?? "top"} data-tone={f.tone ?? "neutral"}>
      <strong>✦ {f.headline}</strong>
      {f.parts?.length ? (
        <span className="sm-parts">
          {f.parts.map((p, k) => (
            <span key={k} data-tone={p.tone ?? "neutral"}><small>{p.label}</small> {p.value}</span>
          ))}
        </span>
      ) : null}
      {f.cause && <p>{f.tone === "problem" ? <small>at scale</small> : <small>because</small>} {f.cause}</p>}
    </div>
  );
}
