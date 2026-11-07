"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import "./focus.css";

/**
 * Three shared guides for every module in the show:
 *
 *  - the highlight: the lab's one mark. Write `*phrase*` in any line and a single
 *    highlighter stroke wipes across that phrase, and only that phrase;
 *  - the voice: one plain line at the head of the stage, large and unboxed, for
 *    modules whose own heading does not already narrate;
 *  - focus: the stage goes grey, soft and quiet except the elements marked
 *    `data-focus-spot`; one line of large type and at most one line of numbers
 *    sit directly on the dimmed picture, with no box around them.
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
  /** Kept for older callers; the caption is always in the middle of the stage. */
  place?: string;
  tone?: Tone;
} | null;

/** The lab's one highlight: a highlighter stroke across one phrase. */
export function Highlight({ children }: { children: ReactNode }) {
  return <span className="hl">{children}</span>;
}
/** "Depends on *three things*": the starred phrase gets the stroke. */
export function highlight(text: string): ReactNode {
  return text.split(/\*([^*]+)\*/).map((part, i) => (i % 2 ? <Highlight key={i}>{part}</Highlight> : part));
}
const plain = (text: string) => text.replace(/\*/g, "");

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

/** The voice: one plain line at the head of the stage. */
export function StageMeter({ moduleKey, override }: { moduleKey: string; override?: NonNullable<MeterDetail> | null }) {
  const heard = useLabEvent<NonNullable<MeterDetail>>("lab:meter", moduleKey);
  const m = override ?? heard;
  return (
    <div className="sm-voice" data-on={m ? "true" : "false"} data-tone={m?.tone ?? "neutral"} aria-live="polite">
      {m && <span key={m.text} className="sm-line">{highlight(m.text.replace(/\.$/, ""))}</span>}
      {m?.total ? (
        <b aria-label={`step ${m.step ?? 0} of ${m.total}`}>
          {Array.from({ length: m.total }, (_, k) => <em key={k} data-done={k < (m.step ?? 0) || undefined} />)}
        </b>
      ) : null}
    </div>
  );
}

/** Focus: dims the stage; one line and its numbers sit directly on the picture. */
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
    <div ref={own} className="sm-focus" role="status" aria-label={plain(f.headline)} key={f.headline} data-tone={f.tone ?? "neutral"}>
      <strong>{highlight(f.headline)}</strong>
      {f.parts?.length ? (
        <span className="sm-parts">
          {f.parts.map((p, k) => (
            <span key={k} data-tone={p.tone ?? "neutral"}>{p.value}<small>{p.label}</small></span>
          ))}
        </span>
      ) : null}
      {f.cause && <p>{f.cause}</p>}
    </div>
  );
}

/**
 * Freeze a film on its result: at each moment the film pauses, the stage goes quiet
 * and the caption reads the number, then the film carries on. Each moment plays once
 * per run, and only in the show layout.
 */
export type FreezeMoment = NonNullable<FocusDetail> & { at: number; hold?: number };
export function useFreezeMoments(moments: readonly FreezeMoment[], readTime: () => number, running: boolean, pause: () => void, resume: () => void, runKey: unknown) {
  const passed = useRef(new Set<number>());
  const [frozen, setFrozen] = useState(false);
  const live = useRef({ moments, readTime, pause, resume });
  useEffect(() => { live.current = { moments, readTime, pause, resume }; });
  useEffect(() => { passed.current = new Set(); }, [runKey]);
  useEffect(() => {
    if (!running || frozen || !document.querySelector(".lab-flow-show")) return;
    const id = window.setInterval(() => {
      const { moments: list, readTime: read, pause: stop } = live.current;
      const t = read();
      const i = list.findIndex((m, k) => !passed.current.has(k) && t >= m.at);
      if (i < 0) return;
      // moments already behind the clock (a seek) count as seen; only the latest one plays
      list.forEach((m, k) => { if (m.at <= t) passed.current.add(k); });
      const latest = list.reduce((best, m, k) => (m.at <= t ? k : best), i);
      stop();
      emitFocus(list[latest]);
      setFrozen(true);
      window.setTimeout(() => {
        emitFocus(null);
        setFrozen(false);
        live.current.resume();
      }, list[latest].hold ?? 3400);
    }, 120);
    return () => window.clearInterval(id);
  }, [running, frozen]);
}
