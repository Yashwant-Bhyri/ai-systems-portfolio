"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ComponentType } from "react";
import { useTr } from "../../exhibit/i18n";
import { highlight } from "./stage-meter";
import "./title-show.css";

/**
 * The laboratory's title show. It opens as a landing with both pathways and
 * every module on one page; then the first pathway is chosen on its own, and
 * its titles fly into a left column. There, "The experiment" stays pinned, the
 * next module is expanded with a countdown ring, and the rest drift slowly in
 * shadow. The column never reflows: every slot has a fixed height, changes are
 * crossfades and transforms, so the stage beside it never moves.
 */
export type ShowItem = {
  key: string;
  title: string;
  term?: string;
  value?: string;
  unit?: string;
  Glyph?: ComponentType;
  /** 0 or 1: which pathway the module belongs to. */
  pathway: number;
};
export type Pathway = { n: string; title: string; short: string; techniques: readonly string[] };
export type Rects = Map<string, DOMRect>;

const FLY = { duration: 640, easing: "cubic-bezier(.2,.75,.2,1)" } as const;

function collect(root: HTMLElement | null): Rects {
  const m: Rects = new Map();
  root?.querySelectorAll<HTMLElement>("[data-show-key]").forEach((el) => { if (!m.has(el.dataset.showKey!)) m.set(el.dataset.showKey!, el.getBoundingClientRect()); });
  return m;
}

/* ── The reel: tiles share a row, the open one grows, a cursor walks them ── */
const GROW = 3.4;
export function ReelRow({ items, open, cursor = true, onOpen }: { items: readonly ShowItem[]; open: number; cursor?: boolean; onOpen?: (key: string) => void }) {
  const tr = useTr();
  const row = useRef<HTMLDivElement>(null);
  const pointer = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const r = row.current, c = pointer.current;
    if (!r || !c) return;
    const n = items.length, gap = 10, width = r.clientWidth;
    const unit = (width - gap * (n - 1)) / (n - 1 + GROW);
    c.style.transform = `translate3d(${Math.max(0, open) * (unit + gap) + (unit * GROW) / 2 + 18}px, ${r.offsetTop + 54}px, 0)`;
  }, [open, items.length]);
  return (
    <div className="rl-reel ts-reel" data-auto={cursor && open >= 0}>
      <div ref={row} className="rl-row">
        {items.map((item, i) => {
          const lit = i === open;
          return (
            <button key={item.key} type="button" className="rl-tile" data-lit={lit} data-show-key={item.key} tabIndex={onOpen ? 0 : -1} style={{ flexGrow: lit ? GROW : 1 }} onClick={() => onOpen?.(item.key)}>
              <span className="rl-num">{i + 1}</span>
              <span className="rl-glyph" aria-hidden="true">{item.Glyph && <item.Glyph />}</span>
              <strong className="rl-title">{tr(item.title)}</strong>
              <span className="rl-detail" aria-hidden={!lit}>
                {item.value && <span className="rl-value"><mark>{item.value}</mark>{item.unit && <small>{tr(item.unit)}</small>}</span>}
              </span>
            </button>
          );
        })}
      </div>
      <div ref={pointer} className="gc-cursor rl-cursor" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 2.5l15 9.2-6.6 1.4 3.9 7.6-2.6 1.3-3.9-7.6L4.9 19z" /></svg>
        <i className="gc-ring" />
      </div>
    </div>
  );
}

/* ── Landing: the branches as reels, told over the blur ─────────────────── */
/**
 * A line in large type, then each branch sharpens while its reel walks through its
 * modules. A click on any tile starts there; "Skip" starts at the first module.
 */
export type IntroStep = { kind: "line"; text: string; ms: number } | { kind: "path"; index: number };
const LIFT = 500, CARD = 850, SETTLE = 300;
type Now = { kind: "idle" } | { kind: "line"; text: string; ms: number } | { kind: "path"; index: number };

export function LabLanding({
  pathways, items, leaving, script, threshold = 0.55, onStart,
}: {
  pathways: readonly Pathway[];
  items: readonly ShowItem[];
  leaving: boolean;
  script: readonly IntroStep[];
  /** How much of the landing must be on screen before the script runs. */
  threshold?: number;
  onStart: (key: string, from: Rects) => void;
}) {
  const tr = useTr();
  const root = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState<Now>({ kind: "idle" });
  const [open, setOpen] = useState(0);
  const start = (key: string) => onStart(key, collect(root.current));
  const startRef = useRef(start);
  useEffect(() => { startRef.current = start; });
  const first = items.find((i) => i.pathway === 0)!;
  // The lab re-renders often during the script; only the script itself may restart it.
  const itemsRef = useRef(items);
  useEffect(() => { itemsRef.current = items; });
  useEffect(() => {
    const el = root.current;
    if (!el || leaving) return;
    let timers: number[] = [];
    const clear = () => { timers.forEach((t) => window.clearTimeout(t)); timers = []; };
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const run = () => {
      clear();
      let t = 200;
      for (const step of script) {
        if (step.kind === "line") {
          at(t, () => setNow(step));
          t += step.ms;
        } else {
          const own = itemsRef.current.filter((i) => i.pathway === step.index);
          at(t, () => { setOpen(0); setNow(step); });
          t += LIFT;
          own.forEach((_, i) => at(t + i * CARD, () => setOpen(i)));
          t += own.length * CARD + SETTLE;
        }
      }
      at(t, () => startRef.current(itemsRef.current[0].key));
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) run();
      else { clear(); setNow({ kind: "idle" }); setOpen(0); }
    }, { threshold });
    io.observe(el);
    return () => { io.disconnect(); clear(); };
  }, [leaving, script, threshold]);
  return (
    <div ref={root} className="ts-landing" data-leaving={leaving || undefined} data-step={now.kind}>
      {pathways.map((p, pi) => {
        const own = items.filter((i) => i.pathway === pi);
        const lift = now.kind === "path" && now.index === pi;
        return (
          <section key={p.n} className="ts-path" data-lift={lift || undefined}>
            <button type="button" className="ts-path-head" onClick={() => start(own[0].key)}>
              <i>{p.n}</i>
              <strong>{tr(p.title)}</strong>
            </button>
            <ReelRow items={own} open={lift ? open : 0} cursor={lift} onOpen={start} />
          </section>
        );
      })}
      {now.kind === "line" && (
        <p key={now.text} className="ts-opening" style={{ animationDuration: `${now.ms}ms` }}>{highlight(tr(now.text))}</p>
      )}
      <button type="button" className="ts-skip" onClick={() => start(first.key)}>{tr("Skip the introduction ▸")}</button>
    </div>
  );
}

/* ── The show: a fixed left column beside the stage ────────────────────── */
export function TitleShow({
  items, pathways, current, now, next, phase, countdownMs, from, onOpen, onLanding,
}: {
  items: readonly ShowItem[];
  pathways: readonly Pathway[];
  current: string;
  /** What is on the stage right now, in words (a chapter name for the experiment). */
  now: string;
  next: string;
  /** running: the module is telling its story; done: counting down to the next; taken: the visitor drives. */
  phase: "running" | "done" | "taken";
  countdownMs: number;
  /** Where the titles were on the landing, for the flight into the column. */
  from: Rects | null;
  onOpen: (key: string) => void;
  onLanding?: () => void;
}) {
  const tr = useTr();
  const root = useRef<HTMLElement>(null);
  const pinned = items[0];
  const cur = items.find((i) => i.key === current) ?? pinned;
  const nxt = items.find((i) => i.key === next) ?? pinned;
  const rest = items.filter((i) => i !== pinned && i !== cur && i !== nxt);
  const crossing = nxt.pathway !== cur.pathway;
  const drift = rest.length > 4;

  // Fly in from the landing: each title starts where it was and settles into its slot.
  useLayoutEffect(() => {
    if (!from || !root.current) return;
    root.current.querySelectorAll<HTMLElement>("[data-show-key]").forEach((el, i) => {
      const a = from.get(el.dataset.showKey!), b = el.getBoundingClientRect();
      if (!a || !b.width || !b.height) return;
      el.animate([
        { transformOrigin: "0 0", transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`, opacity: 0.5 },
        { transformOrigin: "0 0", transform: "none", opacity: 1 },
      ], { ...FLY, delay: Math.min(i, 8) * 28, fill: "backwards" });
    });
  }, [from]);

  const row = (item: ShowItem, copy = false) => (
    <button key={`${item.key}${copy ? "-copy" : ""}`} type="button" className="ts-row" data-show-key={copy ? undefined : item.key} tabIndex={copy ? -1 : 0} aria-hidden={copy || undefined} onClick={() => onOpen(item.key)}>
      <span className="ts-glyph" aria-hidden="true">{item.Glyph && <item.Glyph />}</span>
      <span className="ts-row-text">
        <strong>{tr(item.title)}</strong>
        {item.pathway !== cur.pathway && <small>{pathways[item.pathway].n} · {tr(pathways[item.pathway].short)}</small>}
      </span>
    </button>
  );

  return (
    <aside ref={root} className="ts-show" aria-label={tr("Laboratory modules")}>
      <header className="ts-head">
        {onLanding ? <button type="button" className="ts-back" onClick={onLanding}>{tr("Both pathways")}</button> : <span />}
        <span className="ts-pathname"><i>{pathways[cur.pathway].n}</i>{tr(pathways[cur.pathway].short)}</span>
      </header>

      <button type="button" className="ts-pinned" data-on={cur === pinned || undefined} data-show-key={pinned.key} onClick={() => onOpen(pinned.key)}>
        <span className="ts-glyph" aria-hidden="true">{pinned.Glyph && <pinned.Glyph />}</span>
        <span className="ts-pinned-text">
          <strong>{tr(pinned.title)}</strong>
          {pinned.value && <span className="ts-value"><mark>{pinned.value}</mark></span>}
        </span>
      </button>

      <div className="ts-now" aria-live="polite">
        <i>{tr("Now")}</i>
        <strong key={now} className="ts-fade">{tr(now)}</strong>
      </div>

      <button type="button" className="ts-next" data-phase={phase} data-show-key={nxt.key} onClick={() => onOpen(nxt.key)} aria-label={`${tr("Next")}: ${tr(nxt.title)}`}>
        <span className="ts-next-head">
          <i>{crossing ? `${tr("Next pathway")} · ${pathways[nxt.pathway].n}` : tr("Next")}</i>
          <svg className="ts-ring" viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="10" cy="10" r="8" />
            <circle key={`${nxt.key}-${phase}`} cx="10" cy="10" r="8" className="ts-ring-run" style={{ animationDuration: `${countdownMs}ms` }} />
          </svg>
        </span>
        <span key={nxt.key} className="ts-next-body ts-fade">
          <span className="ts-glyph" aria-hidden="true">{nxt.Glyph && <nxt.Glyph />}</span>
          <strong>{tr(nxt.title)}</strong>
          {nxt.term && <em>{tr(nxt.term)}</em>}
          {nxt.value && <span className="ts-value"><mark>{nxt.value}</mark>{nxt.unit && <small>{tr(nxt.unit)}</small>}</span>}
        </span>
        <span className="ts-next-foot">{phase === "taken" ? tr("Open next ▸") : phase === "done" ? tr("Opening…") : tr("After this module")}</span>
      </button>

      <div className="ts-shadow" data-drift={drift || undefined}>
        <div className="ts-drift" style={{ animationDuration: `${rest.length * 6}s` }}>
          {/* a new set of shadows crossfades in rather than shuffling rows in place */}
          <div key={rest.map((i) => i.key).join()} className="ts-fade">
            {rest.map((i) => row(i))}
            {drift && rest.map((i) => row(i, true))}
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ── The rail: the module titles, and what to do next, in one quiet column ──
   Nothing here floats over the stage, so it can never sit on a scrubber. Beneath
   the titles: stay on this module, dive into it, or go on to the next one. */
export function TitleRail({
  items, pathways, current, next, phase, countdownMs, last, onOpen, onLanding, onStay, onKeepPlaying, onDive,
}: {
  items: readonly ShowItem[];
  pathways: readonly Pathway[];
  current: string;
  next: string;
  phase: "running" | "done" | "taken";
  countdownMs: number;
  /** The module on stage is the last one. */
  last: boolean;
  onOpen: (key: string) => void;
  onLanding?: () => void;
  onStay: () => void;
  onKeepPlaying: () => void;
  onDive: () => void;
}) {
  const tr = useTr();
  const cur = items.find((i) => i.key === current) ?? items[0];
  const nxt = items.find((i) => i.key === next) ?? items[0];
  const state = phase === "taken" ? "Yours to explore" : phase === "done" ? (last ? "Finished" : "Finished, moving on") : "Playing";
  return (
    <aside className="tr-rail" aria-label={tr("Laboratory modules")}>
      <div className="tr-strip">
        {onLanding && <button type="button" className="ts-back tr-back" onClick={onLanding} aria-label={tr("Replay the introduction")}><span className="tr-label">{tr("Introduction")}</span></button>}
        {pathways.map((p, pi) => (
          <div key={p.n} className="tr-group" data-on={cur.pathway === pi || undefined}>
            <i className="tr-path">{p.n}<span className="tr-label"> {tr(p.short)}</span></i>
            {items.filter((i) => i.pathway === pi).map((i) => (
              <button key={i.key} type="button" className="tr-tile" data-on={i === cur || undefined} title={tr(i.title)}
                onClick={() => onOpen(i.key)} aria-label={tr(i.title)} aria-current={i === cur ? "step" : undefined}>
                <span className="ts-glyph" aria-hidden="true">{i.Glyph && <i.Glyph />}</span>
                <span className="tr-label">{tr(i.title)}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="tr-ctl" data-phase={phase}>
        <span className="tr-state" aria-live="polite"><i />{tr(state)}</span>
        {phase === "taken"
          ? <button type="button" className="tr-act" onClick={onKeepPlaying} title={tr("Keep playing")}><b aria-hidden="true">▷</b><span className="tr-label">{tr("Keep playing")}</span></button>
          : <button type="button" className="tr-act" onClick={onStay} title={tr("Stay on this one")}><b aria-hidden="true">Ⅱ</b><span className="tr-label">{tr("Stay on this one")}</span></button>}
        <button type="button" className="tr-act" onClick={onDive} title={tr("Dive deeper")}><b aria-hidden="true">⌕</b><span className="tr-label">{tr("Dive deeper")}</span></button>
        {!last && (
          <button type="button" className="tr-act tr-go" data-phase={phase} onClick={() => onOpen(nxt.key)} title={`${tr("Next")}: ${tr(nxt.title)}`}>
            <svg className="ts-ring" viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="10" cy="10" r="8" />
              <circle key={`${nxt.key}-${phase}`} cx="10" cy="10" r="8" className="ts-ring-run" style={{ animationDuration: `${countdownMs}ms` }} />
            </svg>
            <span className="tr-label"><small>{tr("Next")}</small>{tr(nxt.title)}</span>
          </button>
        )}
      </div>
    </aside>
  );
}
