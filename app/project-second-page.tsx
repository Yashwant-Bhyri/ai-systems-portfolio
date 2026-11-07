"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import "./project-second-page.css";

/**
 * A project's second page: one large live block with two smaller live blocks stacked
 * beside it on a slight curve. Each block carries its own tab. The page cycles on its
 * own, the blocks trading places; a click brings a small block forward, or opens the
 * large one in the project.
 */
export type Block = { key: string; label: string; href: string; node: ReactNode };
const DESIGN = { w: 1512, h: 860 };
const HOLD = 11000;
const GAP = 16;

export function ProjectSecondPage({ id, accent, title, line, href, blocks }: { id: string; accent: string; title: string; line: string; href: string; blocks: readonly Block[] }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [center, setCenter] = useState(1);
  const [seen, setSeen] = useState(false);
  const [inView, setInView] = useState(false);
  const [size, setSize] = useState({ w: 1400, h: 660 });

  useEffect(() => {
    const el = root.current, st = stage.current;
    if (!el || !st) return;
    const io = new IntersectionObserver(([e]) => { setInView(e.isIntersecting); if (e.isIntersecting) setSeen(true); }, { threshold: 0.35 });
    io.observe(el);
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(st);
    return () => { io.disconnect(); ro.disconnect(); };
  }, []);
  useEffect(() => {
    if (!inView || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setCenter((c) => (c + 1) % blocks.length), HOLD);
    return () => window.clearTimeout(t);
  }, [inView, center, blocks.length]);

  // Two small blocks stacked exactly as tall as the large one; together they fill the width.
  const ratio = DESIGN.h / DESIGN.w;
  const large = Math.min((2 * ratio * size.w - (2 * ratio - 1) * GAP) / (3 * ratio), size.h / ratio);
  const small = (large * ratio - GAP) / 2 / ratio;
  const total = large + GAP + small;
  const left = (size.w - total) / 2, top = (size.h - large * ratio) / 2;
  const slot = (o: number) => o === 0
    ? { x: left, y: top, k: large / DESIGN.w }
    : { x: left + large + GAP, y: o === 1 ? top : top + (small * ratio) + GAP, k: small / DESIGN.w };

  return (
    <section ref={root} id={`${id}-second`} className={`sp-page vx-page vx-accent-${accent}`} data-vx-page>
      <header className="sp-head">
        <div>
          <h2>{title}</h2>
          <p>{line}</p>
        </div>
        <a className="sp-cta" href={href}>Click here to explore the whole project <i aria-hidden="true">↗</i></a>
      </header>
      <div ref={stage} className="sp-stage">
        {blocks.map((b, i) => {
          const o = (i - center + blocks.length) % blocks.length;
          const s = slot(o);
          return (
            <article key={b.key} className="sp-block" data-main={o === 0 || undefined} aria-label={b.label} style={{ width: DESIGN.w, height: DESIGN.h, transform: `translate(${s.x}px, ${s.y}px) scale(${s.k})`, zIndex: o === 0 ? 2 : 1 }}>
              <div className="sp-frame" inert>{seen ? b.node : null}</div>
              <span className="sp-tab" style={{ transform: `scale(${1 / s.k})` }}>
                {b.label}
                {o === 0 && <b key={center} style={{ animationDuration: `${HOLD}ms`, animationPlayState: inView ? "running" : "paused" }} />}
              </span>
              <a className="sp-hit" href={b.href} aria-label={o === 0 ? `Open ${b.label}` : `Show ${b.label}`} onClick={(e) => { if (o !== 0) { e.preventDefault(); setCenter(i); } }} />
            </article>
          );
        })}
      </div>
    </section>
  );
}
