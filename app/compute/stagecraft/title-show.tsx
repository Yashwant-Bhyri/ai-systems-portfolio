"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { useTr } from "../../exhibit/i18n";
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
  /** Chapter names, for the experiment. */
  chapters?: readonly string[];
};
export type Pathway = { n: string; title: string; short: string; techniques: readonly string[] };
export type Rects = Map<string, DOMRect>;

const FLY = { duration: 640, easing: "cubic-bezier(.2,.75,.2,1)" } as const;

function collect(root: HTMLElement | null): Rects {
  const m: Rects = new Map();
  root?.querySelectorAll<HTMLElement>("[data-show-key]").forEach((el) => { if (!m.has(el.dataset.showKey!)) m.set(el.dataset.showKey!, el.getBoundingClientRect()); });
  return m;
}

/* ── Landing: both pathways, every module, one page ─────────────────────── */
export function LabLanding({
  pathways, items, leaving, onStart, autoStartMs = 4200,
}: {
  pathways: readonly Pathway[];
  items: readonly ShowItem[];
  leaving: boolean;
  onStart: (key: string, from: Rects) => void;
  autoStartMs?: number;
}) {
  const tr = useTr();
  const root = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const start = (key: string) => onStart(key, collect(root.current));
  const startRef = useRef(start);
  useEffect(() => { startRef.current = start; });
  // The first pathway chooses itself once the landing has been on screen for a moment.
  useEffect(() => {
    const el = root.current;
    if (!el || leaving) return;
    let id = 0;
    const io = new IntersectionObserver(([e]) => {
      window.clearTimeout(id);
      setArmed(e.isIntersecting);
      if (e.isIntersecting) id = window.setTimeout(() => startRef.current(items.find((i) => i.pathway === 0)!.key), autoStartMs);
    }, { threshold: 0.55 });
    io.observe(el);
    return () => { io.disconnect(); window.clearTimeout(id); };
  }, [leaving, autoStartMs, items]);
  return (
    <div ref={root} className="ts-landing" data-leaving={leaving || undefined} data-armed={armed || undefined} style={{ ["--ts-auto" as string]: `${autoStartMs}ms` }}>
      {pathways.map((p, pi) => {
        const own = items.filter((i) => i.pathway === pi);
        return (
          <section key={p.n} className="ts-path" data-first={pi === 0 || undefined}>
            <button type="button" className="ts-path-head" onClick={() => start(own[0].key)}>
              <i>{p.n}</i>
              <strong>{tr(p.title)}</strong>
              <span className="ts-techniques">{p.techniques.map((t) => <em key={t}>{tr(t)}</em>)}</span>
              {pi === 0 && <b className="ts-auto" aria-hidden="true" />}
            </button>
            <div className="ts-cards" data-count={own.length}>
              {own.map((item, i) => (
                <button key={item.key} type="button" className="ts-card" data-show-key={item.key} data-lead={(pi === 0 && i === 0) || undefined} onClick={() => start(item.key)}>
                  <span className="ts-glyph" aria-hidden="true">{item.Glyph && <item.Glyph />}</span>
                  <strong>{tr(item.title)}</strong>
                  {item.value && <span className="ts-value"><mark>{item.value}</mark>{item.unit && <small>{tr(item.unit)}</small>}</span>}
                  {item.chapters && <ol className="ts-chapters">{item.chapters.map((c) => <li key={c}>{tr(c)}</li>)}</ol>}
                </button>
              ))}
            </div>
          </section>
        );
      })}
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

/* ── The quiet rail (round 6, second pass) ──────────────────────────────
   The column took width from the modules and kept moving beside them. Now the
   titles sit in a narrow, dim rail. When a module starts, its tile steps out to
   the centre of the stage, holds a moment, and returns to the rail; then the
   module has the stage. Hovering the rail opens the full list over the stage
   (an overlay, so nothing beneath moves). */
export function TitleRail({
  items, pathways, current, now, next, phase, countdownMs, onOpen, onLanding,
}: {
  items: readonly ShowItem[];
  pathways: readonly Pathway[];
  current: string;
  now: string;
  next: string;
  phase: "running" | "done" | "taken";
  countdownMs: number;
  onOpen: (key: string) => void;
  onLanding?: () => void;
}) {
  const tr = useTr();
  const root = useRef<HTMLElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const cur = items.find((i) => i.key === current) ?? items[0];
  const nxt = items.find((i) => i.key === next) ?? items[0];
  const [shown, setShown] = useState<{ item: ShowItem; accent: string } | null>(null);

  // A new module: its tile steps out of the rail to the stage's centre, then goes back.
  const lastKey = useRef<string | null>(null);
  useEffect(() => {
    if (lastKey.current === current) return;
    const first = lastKey.current === null;
    lastKey.current = current;
    if (first || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShown({ item: cur, accent: root.current ? getComputedStyle(root.current).getPropertyValue("--active-accent") : "#ffc267" });
    const id = window.setTimeout(() => setShown(null), 2300);
    return () => window.clearTimeout(id);
  }, [current, cur]);
  useLayoutEffect(() => {
    const card = intro.current, rail = root.current;
    if (!card || !rail || !shown) return;
    const tile = rail.querySelector<HTMLElement>(`[data-rail-key="${shown.item.key}"]`);
    const stage = rail.closest(".lf-body")?.querySelector<HTMLElement>(".lf-stage");
    if (!tile || !stage) return;
    // measure the card where it really sits (fixed at 0, 0), never mid-animation
    card.getAnimations().forEach((an) => an.cancel());
    const a = tile.getBoundingClientRect(), s = stage.getBoundingClientRect();
    const c = { left: 0, top: 0, width: card.offsetWidth, height: card.offsetHeight };
    // the card lives on <body> at (0, 0): centre it on the stage across, on the screen down
    const cx = s.left + s.width / 2 - c.width / 2 - c.left, cy = window.innerHeight / 2 + 30 - c.height / 2 - c.top;
    const fromRail = `translate(${a.left - c.left}px, ${a.top - c.top}px) scale(${a.width / c.width}, ${a.height / c.height})`;
    card.animate([
      // out to the centre, hold, back to the rail; each leg eased on its own
      { transform: fromRail, opacity: 0.4, offset: 0, easing: "cubic-bezier(.2,.75,.2,1)" },
      { transform: `translate(${cx}px, ${cy}px)`, opacity: 1, offset: 0.24 },
      { transform: `translate(${cx}px, ${cy}px)`, opacity: 1, offset: 0.72, easing: "cubic-bezier(.5,0,.75,0)" },
      { transform: fromRail, opacity: 0, offset: 1 },
    ], { duration: 2300, fill: "both" });
  }, [shown]);

  return (
    <aside ref={root} className="tr-rail" aria-label={tr("Laboratory modules")}>
      <div className="tr-strip">
        {pathways.map((p, pi) => (
          <div key={p.n} className="tr-group" data-on={cur.pathway === pi || undefined}>
            <i className="tr-path">{p.n}</i>
            {items.filter((i) => i.pathway === pi).map((i) => (
              <button key={i.key} type="button" className="tr-tile" data-rail-key={i.key} data-on={i === cur || undefined} data-next={(i === nxt && phase !== "running") || undefined}
                onClick={() => onOpen(i.key)} aria-label={tr(i.title)} aria-current={i === cur ? "step" : undefined}>
                <span className="ts-glyph" aria-hidden="true">{i.Glyph && <i.Glyph />}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
      {/* the full list, over the stage, while the rail is hovered or focused */}
      <div className="tr-panel">
        {onLanding && <button type="button" className="ts-back" onClick={onLanding}>{tr("Both pathways")}</button>}
        {pathways.map((p, pi) => (
          <div key={p.n} className="tr-panel-group">
            <span className="ts-pathname"><i>{p.n}</i>{tr(p.short)}</span>
            {items.filter((i) => i.pathway === pi).map((i) => (
              <button key={i.key} type="button" className="tr-row" data-on={i === cur || undefined} onClick={() => onOpen(i.key)}>
                <strong>{tr(i.title)}</strong>
                {i.value && <small>{i.value}</small>}
              </button>
            ))}
          </div>
        ))}
      </div>
      <span className="tr-now" aria-live="polite">{tr(now)}</span>
      {phase !== "running" && (
        <button type="button" className="tr-next" data-phase={phase} onClick={() => onOpen(nxt.key)}>
          <svg className="ts-ring" viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="10" cy="10" r="8" />
            <circle key={`${nxt.key}-${phase}`} cx="10" cy="10" r="8" className="ts-ring-run" style={{ animationDuration: `${countdownMs}ms` }} />
          </svg>
          <span><small>{tr(phase === "done" ? "Next" : "Open next")}</small>{tr(nxt.title)}</span>
        </button>
      )}
      {shown && createPortal(
        <div ref={intro} className="tr-intro" aria-hidden="true" style={{ ["--active-accent" as string]: shown.accent }}>
          <span className="ts-glyph">{shown.item.Glyph && <shown.item.Glyph />}</span>
          <div>
            <small>{pathways[shown.item.pathway].n} · {tr(pathways[shown.item.pathway].short)}</small>
            <strong>{tr(shown.item.title)}</strong>
            {shown.item.value && <span className="ts-value"><mark>{shown.item.value}</mark>{shown.item.unit && <small>{tr(shown.item.unit)}</small>}</span>}
          </div>
        </div>,
        document.body,
      )}
    </aside>
  );
}
