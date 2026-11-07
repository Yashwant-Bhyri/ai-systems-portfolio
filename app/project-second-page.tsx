"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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
    <div className="sp-door">
      <div ref={box} className="sp-window">
        {/* The link sits beside the live page, not around it: a scripted click inside must never navigate. */}
        <div className="sp-live" style={{ transform: `translateX(${Math.max(0, (w - DESIGN_W * k) / 2)}px) scale(${k})` }}><div className="sp-frame" inert>{seen ? door.node : null}</div></div>
      </div>
      <a className="sp-door-text" href={door.href}><strong>{door.question}</strong><small>{door.name} <i aria-hidden="true">↗</i></small></a>
    </div>
  );
}

export function ProjectSecondPage({ id, accent, name, title, enter, lab, doors }: { id: string; accent: string; name: string; title: string; enter: string; lab: ReactNode; doors: readonly Door[] }) {
  const root = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSeen(true); }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section ref={root} id={`${id}-second`} className={`sp-page vx-page vx-accent-${accent}`} data-vx-page data-layout="questions">
      <header className="sp-head">
        <div>
          <span className="sp-name">{name}</span>
          <h2>{title}</h2>
        </div>
        <a className="sp-cta" href={enter}>Enter the results laboratory <i aria-hidden="true">↗</i></a>
      </header>
      <nav className="sp-questions" aria-label="How it works, and what it gave">
        {doors.map((d) => <DoorView key={d.key} door={d} seen={seen} />)}
      </nav>
      <div className="sp-band">{lab}</div>
    </section>
  );
}
