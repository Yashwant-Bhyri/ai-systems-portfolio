"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { highlight } from "./compute/stagecraft/stage-meter";
import "./project-second-page.css";

/**
 * A project's second page takes people into its depth: the two questions people come with, each
 * answered live at a size that can be read, then every laboratory title one click from opening.
 */
export type Door = { key: string; question: string; name: string; href: string; node: ReactNode };
const DESIGN_W = 1512, DESIGN_H = 860;

function DoorView({ door, seen }: { door: Door; seen: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0.3);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    // The whole page always shows, centred in its window, never cropped.
    const ro = new ResizeObserver(([e]) => { const { width, height } = e.contentRect; setK(height ? Math.min(width / DESIGN_W, height / DESIGN_H) : width / DESIGN_W); setW(width); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="sp-door" data-door={door.key}>
      <div ref={box} className="sp-window">
        {/* The link sits beside the live page, not around it: a scripted click inside must never navigate. */}
        <div className="sp-live" style={{ transform: `translateX(${Math.max(0, (w - DESIGN_W * k) / 2)}px) scale(${k})` }}><div className="sp-frame" inert>{seen ? door.node : null}</div></div>
      </div>
      <a className="sp-window-link" href={door.href} aria-label={door.question} />
      <a className="sp-door-text" href={door.href}><strong>{door.question}</strong><small>{door.name} <i aria-hidden="true">↗</i></small></a>
    </div>
  );
}

/**
 * The page tells itself. It opens on a blurred screen that says what the project does; then, in the
 * left fifth, one sentence at a time is said, and once it has been said the thing it names is lit while
 * the rest of the page dims. It ends by blurring everything except the way into the results laboratory.
 */
export type GuideStep = { text: string; target: "microscope" | "poster" | "lab" };
/** An intro line is a sentence, or a row of numbered labels. */
/** A label can carry the techniques that belong to it. */
export type IntroLabel = string | { title: string; note?: string; items: readonly string[] };
export type IntroLine = string | { labels: readonly IntroLabel[] };
export type Guide = { intro: readonly IntroLine[]; steps: readonly GuideStep[]; cta: string };
const INTRO_MS = 3800, SAY_MS = 2200, SHOW_MS = 4200, CTA_BLUR_MS = 3000, CTA_GLOW_MS = 9000;
type Beat = { kind: "intro"; line: IntroLine; n: number } | { kind: "say" | "show"; step: number } | { kind: "cta" } | { kind: "glow" } | { kind: "rest" };

function useGuide(guide: Guide, on: boolean) {
  const [beat, setBeat] = useState<Beat>({ kind: "rest" });
  useEffect(() => {
    let timers: number[] = [];
    if (!on || matchMedia("(prefers-reduced-motion: reduce)").matches) { timers.push(window.setTimeout(() => setBeat({ kind: "rest" }), 0)); return () => timers.forEach((x) => window.clearTimeout(x)); }
    const at = (ms: number, b: Beat) => timers.push(window.setTimeout(() => setBeat(b), ms));
    const walk = (t0: number, withIntro: boolean) => {
      let t = t0;
      // A row of labels holds more to read than a sentence, so it stays longer.
      if (withIntro) guide.intro.forEach((line, n) => { at(t, { kind: "intro", line, n }); t += typeof line === "string" ? INTRO_MS : INTRO_MS * 1.9; });
      guide.steps.forEach((_, i) => { at(t, { kind: "say", step: i }); t += SAY_MS; at(t, { kind: "show", step: i }); t += SHOW_MS; });
      // The ending: a short blur that leaves only the way in sharp, then the page returns with the way in still lit.
      at(t, { kind: "cta" }); t += CTA_BLUR_MS;
      at(t, { kind: "glow" }); t += CTA_GLOW_MS;
      at(t, { kind: "rest" }); t += 600;
      timers.push(window.setTimeout(() => { timers = []; walk(0, false); }, t));
    };
    walk(300, true);
    return () => timers.forEach((x) => window.clearTimeout(x));
  }, [guide, on]);
  return beat;
}

export function ProjectSecondPage({ id, accent, name, title, enter, lab, doors, guide }: { id: string; accent: string; name: string; title: string; enter: string; lab: ReactNode; doors: readonly Door[]; guide: Guide }) {
  const root = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSeen(true); }, { threshold: 0, rootMargin: "100% 0px" });
    const here = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.6 });
    near.observe(el); here.observe(el);
    return () => { near.disconnect(); here.disconnect(); };
  }, []);
  const beat = useGuide(guide, inView);
  const step = beat.kind === "say" || beat.kind === "show" ? beat.step : -1;
  const focus = beat.kind === "show" ? guide.steps[beat.step].target : beat.kind === "cta" ? "cta" : beat.kind === "glow" ? "glow" : beat.kind === "intro" ? "intro" : undefined;
  return (
    <section ref={root} id={`${id}-second`} className={`sp-page vx-page vx-accent-${accent}`} data-vx-page data-layout="questions" data-focus={focus} data-saying={beat.kind === "say" || undefined}>
      <header className="sp-head">
        <div>
          <span className="sp-name">{name}</span>
          <h2>{title}</h2>
        </div>
        <a className="sp-cta" href={enter}>Enter the results laboratory <i aria-hidden="true">↗</i></a>
      </header>
      <div className="sp-body">
        <aside className="sp-guide" aria-live="polite">
          <ol>
            {guide.steps.map((s, i) => (
              <li key={i} data-on={i === step || undefined} data-done={step > i || beat.kind === "cta" || beat.kind === "glow" || undefined}>{highlight(s.text)}</li>
            ))}
          </ol>
          <p className="sp-guide-cta" data-on={beat.kind === "cta" || beat.kind === "glow" || undefined}>{highlight(guide.cta)}</p>
        </aside>
        <div className="sp-right">
          <nav className="sp-questions" aria-label="How it works, and what it gave">
            {doors.map((d) => <DoorView key={d.key} door={d} seen={seen} />)}
          </nav>
          <div className="sp-band">{lab}</div>
        </div>
      </div>
      {(beat.kind === "intro" || beat.kind === "cta") && (
        <div className="sp-veil" data-kind={beat.kind}>
          {beat.kind === "intro"
            ? typeof beat.line === "string"
              ? <p key={beat.n}>{highlight(beat.line)}</p>
              : <ul key={beat.n} className="sp-labels">{beat.line.labels.map((l, i) => typeof l === "string"
                  ? <li key={l} style={{ animationDelay: `${i * 260}ms` }}><i>{i + 1}</i>{l}</li>
                  : <li key={l.title} className="sp-group" style={{ animationDelay: `${i * 360}ms` }}>
                      <span className="sp-group-head"><i>{i + 1}</i><span><b>{l.title}</b>{l.note && <small>{l.note}</small>}</span></span>
                      <span className="sp-group-items">{l.items.map((x, k) => <em key={x} style={{ animationDelay: `${i * 360 + 500 + k * 180}ms` }}>{x}</em>)}</span>
                    </li>)}</ul>
            : <p key="cta">{highlight(guide.cta)}</p>}
        </div>
      )}
    </section>
  );
}
