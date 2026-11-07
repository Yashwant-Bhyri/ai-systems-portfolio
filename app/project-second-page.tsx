"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Manifold } from "./compute/stagecraft/manifold";
import { ServingRace } from "./compute/stagecraft/serving-race";
import "./project-second-page.css";

/**
 * A project's second page has one job: take people into the results laboratory. The project's
 * one striking picture, live; beside it, the laboratory's modules, one click from
 * opening. The microscope and the one-page result are smaller ways in.
 */
export type Door = { key: string; question: string; name: string; href: string; node: ReactNode };
const DESIGN_W = 1512;

function DoorView({ door, seen }: { door: Door; seen: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0.3);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setK(e.contentRect.width / DESIGN_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="sp-door">
      {/* The link sits beside the live page, not around it: a scripted click inside must never navigate. */}
      <div className="sp-live" style={{ transform: `scale(${k})` }}><div className="sp-frame" inert>{seen ? door.node : null}</div></div>
      <a className="sp-door-text" href={door.href}><strong>{door.question}</strong><small>{door.name} <i aria-hidden="true">↗</i></small></a>
    </div>
  );
}

export function ProjectSecondPage({ id, accent, training, name, title, enter, lab, doors }: { id: string; accent: string; training: boolean; name: string; title: string; enter: string; lab: ReactNode; doors: readonly Door[] }) {
  const root = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { setInView(e.isIntersecting); if (e.isIntersecting) setSeen(true); }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section ref={root} id={`${id}-second`} className={`sp-page vx-page vx-accent-${accent}`} data-vx-page>
      <header className="sp-head">
        <div>
          <span className="sp-name">{name}</span>
          <h2>{title}</h2>
        </div>
        <a className="sp-cta" href={enter}>Enter the results laboratory <i aria-hidden="true">↗</i></a>
      </header>
      <div className="sp-main">
        <div className="sp-hero">{seen ? (training ? <Manifold active={inView} compact /> : <ServingRace active={inView} />) : null}</div>
        <div className="sp-side">
          <div className="sp-lab">{lab}</div>
          <nav className="sp-doors" aria-label="Other ways in">
            {doors.map((d) => <DoorView key={d.key} door={d} seen={seen} />)}
          </nav>
        </div>
      </div>
    </section>
  );
}
