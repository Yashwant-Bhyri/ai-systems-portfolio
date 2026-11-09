"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ComponentType } from "react";
import { useTr } from "../../exhibit/i18n";
import { highlight } from "./stage-meter";
import "./title-show.css";
import { IntroLabels, type IntroLine } from "./intro-labels";

/**
 * The laboratory's titles. They open on a full-screen board, one section at a time; when a module
 * plays, they fly into a left rail with what is coming next at its foot.
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
export type Pathway = { n: string; title: string; short: string; techniques: readonly string[]; /** One sentence under the title, on the board. */ lead?: string };
export type Rects = Map<string, DOMRect>;

function collect(root: HTMLElement | null): Rects {
  const m: Rects = new Map();
  root?.querySelectorAll<HTMLElement>("[data-show-key]").forEach((el) => { if (!m.has(el.dataset.showKey!)) m.set(el.dataset.showKey!, el.getBoundingClientRect()); });
  return m;
}

/* ── The title board ───────────────────────────────────────────────────────
   The whole space belongs to one section at a time, its titles lit in turn. Then that block
   compresses into the left fifth of the screen, and the next section takes the other four fifths.
   Tiles keep one fixed size: only colour changes as they light, so nothing on the board shakes. */
/** The reel's highlight: the lit title grows to this share of its row. */
const GROW = 2;
const CARD = 1500, QUICK = 900, SETTLE = 500, COMPRESS = 900, LINE_MS = 3600, PICTURED_MS = 7000, OVERVIEW = 2600, PICK = 1700;
const MOVE = { duration: 760, easing: "cubic-bezier(.65,0,.35,1)" } as const;

export function rowsFor(n: number): number[] {
  const per = n <= 6 ? 3 : 4, out: number[] = [];
  for (let left = n; left > 0; left -= per) out.push(Math.min(per, left));
  return out;
}
/** Moves each tile from where it was to where it now is, whatever changed in between. */
function flip(root: HTMLElement | null, before: Rects | null, stagger = 18) {
  if (!root || !before || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  root.querySelectorAll<HTMLElement>("[data-show-key]").forEach((el, i) => {
    const a = before.get(el.dataset.showKey!), b = el.getBoundingClientRect();
    if (!a || !b.width || !b.height) return;
    el.animate([
      { transformOrigin: "0 0", transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})` },
      { transformOrigin: "0 0", transform: "none" },
    ], { ...MOVE, delay: Math.min(i, 8) * stagger, fill: "backwards" });
    // A stretched title is never shown: the words fade in once the card has nearly landed.
    el.querySelectorAll<HTMLElement>(".tb-text, .tb-art").forEach((c) => c.animate([{ opacity: 0 }, { opacity: 0, offset: 0.75 }, { opacity: 1 }], { ...MOVE, delay: Math.min(i, 8) * stagger, fill: "backwards" }));
  });
}
export const boardRects = (): Rects => {
  const m: Rects = new Map();
  document.querySelectorAll<HTMLElement>(".tb-root [data-show-key]").forEach((el) => m.set(el.dataset.showKey!, el.getBoundingClientRect()));
  return m;
};
export const railRects = (): Rects => {
  const m: Rects = new Map();
  document.querySelectorAll<HTMLElement>("[data-rail-key]").forEach((el) => m.set(el.dataset.railKey!, el.getBoundingClientRect()));
  return m;
};

function BoardTile({ item, lit, compact, delay = 0, onOpen }: { item: ShowItem; lit: boolean; compact: boolean; delay?: number; onOpen: (key: string) => void }) {
  const tr = useTr();
  const art = useRef<HTMLSpanElement>(null);
  // Only the lit tile's picture moves.
  useEffect(() => {
    const svg = art.current?.querySelector("svg");
    if (!svg) return;
    if (lit && !matchMedia("(prefers-reduced-motion: reduce)").matches) svg.unpauseAnimations();
    else { svg.pauseAnimations(); if (svg.getCurrentTime() < 1) svg.setCurrentTime(5); }
  }, [lit]);
  return (
    <button type="button" className="tb-tile" data-lit={lit} data-show-key={item.key} style={compact ? undefined : { animationDelay: `${delay}ms`, flexGrow: lit ? GROW : 1 }} onClick={() => onOpen(item.key)}>
      <span ref={art} className="tb-art" aria-hidden="true">{item.Glyph && <item.Glyph />}</span>
      <span className="tb-text">
        <strong>{tr(item.title)}</strong>
        {!compact && item.term && <em>{tr(item.term)}</em>}
        {!compact && item.value && <span className="tb-value"><mark>{item.value}</mark>{item.unit && <small>{tr(item.unit)}</small>}</span>}
      </span>
    </button>
  );
}

export function TitleBoard({
  pathways, items, start = 0, quick = false, overlay = false, from = null, threshold = 0.55, lines = [], onStart, onEnd,
}: {
  /** Said first, over the muted board, one at a time. */
  lines?: readonly IntroLine[];
  pathways: readonly Pathway[];
  items: readonly ShowItem[];
  /** Which section begins with the whole space. */
  start?: number;
  /** A return visit: the titles light quickly. */
  quick?: boolean;
  /** Over the laboratory, rather than instead of it. */
  overlay?: boolean;
  /** Where the titles were before this, to fly from. */
  from?: Rects | null;
  threshold?: number;
  onStart: (key: string, from: Rects) => void;
  onEnd: () => void;
}) {
  const tr = useTr();
  const root = useRef<HTMLDivElement>(null);
  // Two sections, opened fresh: they start side by side, and each is zoomed into in turn.
  const tour = pathways.length === 2 && !overlay;
  const [focus, setFocus] = useState(tour ? -1 : start);
  const [pick, setPick] = useState(-1);
  const [lit, setLit] = useState(-1);
  // With opening lines, the board starts muted, so it never flashes before the first line.
  const [line, setLine] = useState<number | null>(lines.length ? -1 : null);
  const pending = useRef<Rects | null>(from);
  const endRef = useRef(onEnd);
  useEffect(() => { endRef.current = onEnd; });
  const itemsRef = useRef(items);
  useEffect(() => { itemsRef.current = items; });
  useLayoutEffect(() => {
    flip(root.current, pending.current);
    pending.current = null;
  }, [focus]);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let timers: number[] = [];
    const clear = () => { timers.forEach((t) => window.clearTimeout(t)); timers = []; };
    const run = () => {
      clear();
      const n = pathways.length, step = quick ? QUICK : CARD;
      let t = overlay ? 800 : 400;
      // The board is muted while each opening line is said across it.
      lines.forEach((l, i) => { const at = t; timers.push(window.setTimeout(() => setLine(i), at)); t += typeof l === "string" ? LINE_MS : PICTURED_MS; });
      if (lines.length) { timers.push(window.setTimeout(() => setLine(null), t)); t += 500; }
      const go = (fn: () => void) => timers.push(window.setTimeout(() => { pending.current = collect(root.current); fn(); }, t));
      const light = (s: number) => {
        const own = itemsRef.current.filter((i) => i.pathway === s).map((i) => i.key);
        own.forEach((key, i) => timers.push(window.setTimeout(() => setLit(itemsRef.current.findIndex((x) => x.key === key)), t + i * step)));
        t += own.length * step + SETTLE;
      };
      if (tour) {
        // Both problems side by side; then each one is picked out, zoomed into, and its titles lit; then both again.
        t += OVERVIEW;
        for (let s = 0; s < n; s++) {
          timers.push(window.setTimeout(() => setPick(s), t)); t += PICK;
          go(() => { setLit(-1); setPick(-1); setFocus(s); }); t += COMPRESS;
          light(s);
          go(() => { setLit(-1); setFocus(-1); }); t += COMPRESS;
        }
        t += OVERVIEW;
      } else {
        for (let s = start; s < n; s++) {
          if (s > start) { go(() => { setLit(-1); setFocus(s); }); t += COMPRESS; }
          light(s);
        }
      }
      timers.push(window.setTimeout(() => endRef.current(), t));
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) run();
      else { clear(); setFocus(tour ? -1 : start); setPick(-1); setLit(-1); setLine(lines.length ? -1 : null); }
    }, { threshold });
    io.observe(el);
    return () => { io.disconnect(); clear(); };
    // the script is fixed for one board
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathways.length, quick, overlay, start, threshold, tour]);
  return (
    <div ref={root} className="tb-root" data-overlay={overlay || undefined} data-sections={pathways.length} data-line={line !== null ? "" : undefined}>
      {line !== null && line >= 0 && (typeof lines[line] === "string"
        ? <p key={line} className="tb-line">{highlight(tr(lines[line] as string))}</p>
        : <div key={line} className="tb-line tb-line-pictured"><IntroLabels labels={(lines[line] as { labels: Parameters<typeof IntroLabels>[0]["labels"] }).labels} tr={tr} /></div>)}
      {pathways.map((p, pi) => {
        const own = items.filter((i) => i.pathway === pi);
        const mode = focus === -1 ? "half" : pi === focus ? "full" : overlay && pi < focus ? "compact" : "hidden";
        const counts = rowsFor(own.length);
        return (
          <section key={p.n} className="tb-sec" data-mode={mode} data-pick={pick === pi || undefined} data-unpicked={pick !== -1 && pick !== pi || undefined} data-dense={counts.length > 2 || undefined}>
            <header className="tb-head">
              <i>{p.n}</i>
              <div>
                <h3>{tr(p.title)}</h3>
                {mode === "full" && p.lead && <p>{highlight(tr(p.lead))}</p>}
              </div>
            </header>
            {mode !== "hidden" && (
              <div className="tb-grid">
                {mode === "compact"
                  ? own.map((item) => <BoardTile key={item.key} item={item} compact lit={false} onOpen={(k) => onStart(k, collect(root.current))} />)
                  : counts.map((count, r) => {
                    const at = counts.slice(0, r).reduce((a, c) => a + c, 0);
                    return (
                      <div key={at} className="tb-row">
                        {own.slice(at, at + count).map((item) => <BoardTile delay={focus > 0 || overlay ? 700 + own.indexOf(item) * 40 : own.indexOf(item) * 40} key={item.key} item={item} compact={false} lit={items.indexOf(item) === lit} onOpen={(k) => onStart(k, collect(root.current))} />)}
                      </div>
                    );
                  })}
              </div>
            )}
          </section>
        );
      })}
      <button type="button" className="ts-skip" onClick={() => endRef.current()}>{tr(overlay ? "Continue ▸" : "Skip the introduction ▸")}</button>
    </div>
  );
}

/* ── The rail: the laboratory's two parts ───────────────────────────────────
   Summary is one part, made of the best moments. In detail is the other, with every module.
   The part you are in stays open; the other folds to its name. Beneath: stay, dive, or go on.
   Nothing here floats over the stage. */
export type RailGroup = { key: string; label: string; items: readonly { key: string; title: string; section?: string; Glyph?: ComponentType }[]; onOpen: () => void; /** A section of this part that is not open now, and whether it comes first. */ also?: { label: string; onOpen: () => void }; alsoFirst?: boolean; count?: number };
export type SummaryControls = { held: boolean; first: boolean; last: boolean; onBack: () => void; onToggle: () => void; onForward: () => void };
export function TitleRail({
  groups, active, current, next, phase, countdownMs, last, afterLast, held, summary, ringKey, ringDelay = 0, from, onItem, onNext, onLanding, onStay, onKeepPlaying, onDive,
}: {
  groups: readonly RailGroup[];
  /** Which part is open. */
  active: string;
  current: string;
  next: string;
  phase: "running" | "done" | "taken";
  countdownMs: number;
  /** The module on stage is the last one. */
  last: boolean;
  /** Where the visitor goes after the last module. */
  afterLast?: { title: string; href: string };
  held?: boolean;
  /** Back, pause and forward, while the Summary plays. */
  summary?: SummaryControls;
  /** Restarts the Next ring, e.g. when the visitor steps back. */
  ringKey?: string | number;
  /** How far into its countdown the ring already is, in ms. */
  ringDelay?: number;
  /** Where the titles were on the board, to fly from. */
  from?: Rects | null;
  onItem: (key: string) => void;
  onNext: () => void;
  onLanding?: () => void;
  onStay: () => void;
  onKeepPlaying: () => void;
  onDive: () => void;
}) {
  const tr = useTr();
  const root = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (!from || !root.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.current.querySelectorAll<HTMLElement>("[data-rail-key]").forEach((el, i) => {
      const a = from.get(el.dataset.railKey!), b = el.getBoundingClientRect();
      if (!a || !b.width || !b.height) return;
      el.animate([
        { transformOrigin: "0 0", transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`, opacity: 0.6 },
        { transformOrigin: "0 0", transform: "none", opacity: 1 },
      ], { ...MOVE, delay: Math.min(i, 8) * 18, fill: "backwards" });
      el.querySelector(".tr-label")?.animate([{ opacity: 0 }, { opacity: 0, offset: 0.75 }, { opacity: 1 }], { ...MOVE, delay: Math.min(i, 8) * 18, fill: "backwards" });
    });
  }, [from]);
  // The rail's tiny pictures hold still: one frame each, so the list stays calm.
  useEffect(() => { root.current?.querySelectorAll<SVGSVGElement>(".tr-ico svg").forEach((svg) => { if (svg.animationsPaused()) return; svg.pauseAnimations(); svg.setCurrentTime(5); }); });
  const state = phase === "taken" ? "Yours to explore" : phase === "done" ? (last ? "Finished" : "Finished, moving on") : "Playing";
  return (
    <aside ref={root} className="tr-rail" aria-label={tr("Laboratory modules")}>
      <div className="tr-strip">
        {onLanding && <button type="button" className="ts-back tr-back" onClick={onLanding} aria-label={tr("Replay the introduction")}><span className="tr-label">{tr("Introduction")}</span></button>}
        {groups.map((g) => {
          const open = g.key === active;
          return (
            <div key={g.key} className="tr-group" data-on={open || undefined}>
              <button type="button" className="tr-part" aria-expanded={open} onClick={g.onOpen}>{tr(g.label)}<i aria-hidden="true">{open ? "" : g.count ?? g.items.length}</i></button>
              {open && g.also && g.alsoFirst && <button type="button" className="tr-also" data-first onClick={g.also.onOpen}>{tr(g.also.label)} ▸</button>}
              {open && g.items.map((i, k) => (
                <div key={i.key}>
                  {i.section && i.section !== g.items[k - 1]?.section && <span className="tr-section">{tr(i.section)}</span>}
                  <button type="button" className="tr-tile" data-rail-key={i.key} data-on={i.key === current || undefined} title={tr(i.title)} onClick={() => onItem(i.key)} aria-current={i.key === current ? "step" : undefined}>
                    {i.Glyph && <span className="tr-ico" aria-hidden="true"><i.Glyph /></span>}
                    <span className="tr-label">{tr(i.title)}</span>
                  </button>
                </div>
              ))}
              {open && g.also && !g.alsoFirst && <button type="button" className="tr-also" onClick={g.also.onOpen}>{tr(g.also.label)} ▸</button>}
            </div>
          );
        })}
      </div>
      <div className="tr-ctl" data-phase={phase}>
        <span className="tr-state" aria-live="polite"><i />{tr(state)}</span>
        {summary ? (
          <div className="tr-transport" role="group" aria-label={tr("Summary controls")}>
            <button type="button" onClick={summary.onBack} disabled={summary.first} aria-label={tr("Back one moment")} title={tr("Back one moment")}><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M10 2 4 7l6 5Z" fill="currentColor" /></svg></button>
            <button type="button" onClick={summary.onToggle} aria-label={tr(summary.held ? "Keep playing" : "Pause")} title={tr(summary.held ? "Keep playing" : "Pause")}>{summary.held ? <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M4 2l7 5-7 5Z" fill="currentColor" /></svg> : <svg viewBox="0 0 14 14" aria-hidden="true"><rect x="3" y="2" width="3" height="10" rx="1" fill="currentColor" /><rect x="8" y="2" width="3" height="10" rx="1" fill="currentColor" /></svg>}</button>
            <button type="button" onClick={summary.onForward} disabled={summary.last} aria-label={tr("Forward one moment")} title={tr("Forward one moment")}><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M4 2l6 5-6 5Z" fill="currentColor" /></svg></button>
          </div>
        ) : phase === "taken" || held
          ? <button type="button" className="tr-act" onClick={onKeepPlaying} title={tr("Keep playing")}><b aria-hidden="true">▷</b><span className="tr-label">{tr("Keep playing")}</span></button>
          : <button type="button" className="tr-act" onClick={onStay} title={tr("Stay on this one")}><b aria-hidden="true">Ⅱ</b><span className="tr-label">{tr("Stay on this one")}</span></button>}
        <button type="button" className="tr-act" onClick={onDive} title={tr("Dive deeper")}><b aria-hidden="true">⌕</b><span className="tr-label">{tr("Dive deeper")}</span></button>
        {/* What is coming up next, always in the same place; its ring loads once this one has told its story. */}
        {last && afterLast ? (
          <a className="tr-next" href={afterLast.href}>
            <svg className="ts-ring" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" /></svg>
            <span><small>{tr("Next project")}</small>{tr(afterLast.title)}</span>
          </a>
        ) : !last && (
          <button type="button" className="tr-next" data-phase={phase} onClick={onNext} title={`${tr("Next")}: ${tr(next)}`}>
            <svg className="ts-ring" viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="10" cy="10" r="8" />
              {(phase === "done" || summary) && <circle key={`${next}-${countdownMs}-${ringKey ?? ""}`} cx="10" cy="10" r="8" className="ts-ring-run" style={{ animationDuration: `${countdownMs}ms`, animationDelay: `${-ringDelay}ms`, animationPlayState: summary?.held ? "paused" : "running" }} />}
            </svg>
            <span><small>{tr("Next")}</small>{tr(next)}</span>
          </button>
        )}
      </div>
    </aside>
  );
}
