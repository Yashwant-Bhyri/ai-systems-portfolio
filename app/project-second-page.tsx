"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import "./project-second-page.css";

/**
 * A project's second page: three live blocks on a curve, one at the centre and two
 * muted beside it, all of them running. The page toggles between them on its own;
 * a click brings a side block forward, or opens the centre block in the project.
 */
export type Block = { key: string; label: string; href: string; node: ReactNode };
const DESIGN = { w: 1512, h: 860 };
const HOLD = 11000;

export function ProjectSecondPage({ id, accent, title, line, href, blocks }: { id: string; accent: string; title: string; line: string; href: string; blocks: readonly Block[] }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [center, setCenter] = useState(1);
  const [seen, setSeen] = useState(false);
  const [inView, setInView] = useState(false);
  const [hold, setHold] = useState(false);
  const [k, setK] = useState(0.55);

  useEffect(() => {
    const el = root.current, st = stage.current;
    if (!el || !st) return;
    const io = new IntersectionObserver(([e]) => { setInView(e.isIntersecting); if (e.isIntersecting) setSeen(true); }, { threshold: 0.35 });
    io.observe(el);
    const ro = new ResizeObserver(([e]) => setK(Math.min((e.contentRect.width * 0.7) / DESIGN.w, (e.contentRect.height * 0.97) / DESIGN.h)));
    ro.observe(st);
    return () => { io.disconnect(); ro.disconnect(); };
  }, []);
  useEffect(() => {
    if (!inView || hold || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setCenter((c) => (c + 1) % blocks.length), HOLD);
    return () => window.clearTimeout(t);
  }, [inView, hold, center, blocks.length]);

  return (
    <section ref={root} id={`${id}-second`} className={`sp-page vx-page vx-accent-${accent}`} data-vx-page data-hold={hold || undefined}>
      <header className="sp-head">
        <div>
          <h2>{title}</h2>
          <p>{line}</p>
        </div>
        <a className="sp-cta" href={href}>Click here to explore the whole project <i aria-hidden="true">↗</i></a>
      </header>
      <div ref={stage} className="sp-stage" onPointerEnter={() => setHold(true)} onPointerLeave={() => setHold(false)} style={{ ["--sp-k" as string]: k, ["--sp-w" as string]: `${DESIGN.w}px`, ["--sp-h" as string]: `${DESIGN.h}px` }}>
        {blocks.map((b, i) => {
          const n = blocks.length;
          let o = i - center;
          if (o > n / 2) o -= n;
          if (o < -n / 2) o += n;
          return (
            <article key={b.key} className="sp-block" data-center={o === 0 || undefined} style={{ ["--o" as string]: o, zIndex: 3 - Math.abs(o) }} aria-label={b.label} aria-hidden={o !== 0 || undefined}>
              <div className="sp-frame" inert>{seen ? b.node : null}</div>
              <a className="sp-hit" href={b.href} tabIndex={o === 0 ? 0 : -1} aria-label={`Open ${b.label}`} onClick={(e) => { if (o !== 0) { e.preventDefault(); setCenter(i); } }} />
            </article>
          );
        })}
      </div>
      <nav className="sp-tabs" aria-label={`${title}: three views`}>
        {blocks.map((b, i) => (
          <button key={b.key} type="button" aria-pressed={i === center} onClick={() => setCenter(i)}>
            {b.label}
            {i === center && <b key={center} style={{ animationDuration: `${HOLD}ms`, animationPlayState: inView && !hold ? "running" : "paused" }} />}
          </button>
        ))}
      </nav>
    </section>
  );
}
