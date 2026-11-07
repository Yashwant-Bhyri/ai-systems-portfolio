"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CloudBackdrop } from "./compute/stagecraft/big-picture";
import { TerrainBackdrop } from "./compute/stagecraft/scan/capability-terrain";
import { highlight } from "./compute/stagecraft/stage-meter";
import "./project-second-page.css";

/**
 * A project's second page has one job: make people go inside. One enormous result,
 * moving in sync with the picture behind it, one sentence, one button, and three doors
 * below. Each door is a live window into the real thing, with a question it answers.
 */
export type Door = { key: string; question: string; name: string; href: string; node: ReactNode };
const DESIGN_W = 1512;

const TRAINING_STEPS = ["Base", "SFT", "RL", "2× budget", "4× budget", "Lean RL"];
function TrainingHero({ on }: { on: boolean }) {
  const [state, setState] = useState({ stage: 0, solved: 28 });
  return (
    <>
      <div className="sp-bg">{on && <TerrainBackdrop onStage={(stage, solved) => setState({ stage, solved })} />}</div>
      <div className="sp-number"><b key={state.solved}>{state.solved}</b><span>of 96 maths, logic and coding<br />tasks solved</span></div>
      <ol className="sp-steps">{TRAINING_STEPS.map((s, i) => <li key={s} data-on={i === state.stage || undefined} data-done={i < state.stage || undefined}>{s}</li>)}</ol>
    </>
  );
}
const INFERENCE_STEPS = ["Free-worker scheduling", "Prefix reuse", "Faster prefill & decode"];
function InferenceHero({ on }: { on: boolean }) {
  const [state, setState] = useState({ cost: 41.4, lever: -1 });
  const last = useRef(0);
  return (
    <>
      <div className="sp-bg">{on && <CloudBackdrop onCost={(cost, lever) => { const now = performance.now(); if (now - last.current > 60) { last.current = now; setState({ cost, lever }); } }} />}</div>
      <div className="sp-number"><b>{state.cost.toFixed(2)}</b><span>GPU-seconds per correct answer,<br />down from 41.40</span></div>
      <ol className="sp-steps">{INFERENCE_STEPS.map((s, i) => <li key={s} data-on={i === state.lever || undefined}>{s}</li>)}</ol>
    </>
  );
}

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

export function ProjectSecondPage({ id, accent, training, kicker, headline, href, doors }: { id: string; accent: string; training: boolean; kicker: string; headline: string; href: string; doors: readonly Door[] }) {
  const root = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { setInView(e.isIntersecting); if (e.isIntersecting) setSeen(true); }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section ref={root} id={`${id}-second`} className={`sp-page vx-page vx-accent-${accent}`} data-vx-page>
      <div className="sp-hero">
        <span className="sp-kicker">{kicker}</span>
        <h2>{highlight(headline)}</h2>
        {training ? <TrainingHero on={inView} /> : <InferenceHero on={inView} />}
        <a className="sp-cta" href={href}>Go inside the project <i aria-hidden="true">↗</i></a>
      </div>
      <nav className="sp-doors" aria-label="Three ways in">
        {doors.map((d) => <DoorView key={d.key} door={d} seen={seen} />)}
      </nav>
    </section>
  );
}
