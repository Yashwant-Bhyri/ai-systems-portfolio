"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useTr } from "../../exhibit/i18n";

/**
 * A scripted cursor that performs a component's own controls, so a visitor sees
 * what is interactive without reading an instruction. It drives real elements
 * (click, slider value), stops for good the moment the visitor acts, and offers
 * a replay chip afterwards.
 */
export type CursorStep = {
  /** CSS selector inside the root. */
  target: string;
  action?: "click" | "hover" | "range";
  /** For "range": the value to set. */
  value?: number;
  /** Milliseconds to stay after acting. */
  hold?: number;
  /** A two-to-four word tag shown beside the cursor. */
  label?: string;
  /** Horizontal point inside the target, 0..1. */
  fx?: number;
};

const sleep = (ms: number, token: { dead: boolean }) =>
  new Promise<void>((resolve) => {
    const id = window.setTimeout(resolve, ms);
    if (token.dead) { window.clearTimeout(id); resolve(); }
  });

function setRange(input: HTMLInputElement, value: number) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, String(value));
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

export function GhostCursor({
  root,
  script,
  enabled = true,
  startDelay = 1400,
  loop = true,
  restDelay = 2600,
  accent = "var(--active-accent, #ffc267)",
}: {
  root: RefObject<HTMLElement | null>;
  script: readonly CursorStep[];
  enabled?: boolean;
  startDelay?: number;
  loop?: boolean;
  restDelay?: number;
  accent?: string;
}) {
  const cursor = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [taken, setTaken] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [run, setRun] = useState(0);
  const [tag, setTag] = useState<string | null>(null);
  const tr = useTr();

  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    const u = () => setReduced(m.matches);
    u(); m.addEventListener("change", u);
    return () => m.removeEventListener("change", u);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    // Any real act inside the root hands control to the visitor.
    const take = (e: Event) => {
      if (!e.isTrusted) return;
      if ((e.target as HTMLElement | null)?.closest?.(".gc-replay")) return;
      setTaken(true);
    };
    const enter = () => setHovering(true), leave = () => setHovering(false);
    el.addEventListener("pointerdown", take, true);
    el.addEventListener("keydown", take, true);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      io.disconnect();
      el.removeEventListener("pointerdown", take, true);
      el.removeEventListener("keydown", take, true);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, [root]);

  const live = enabled && inView && !taken && !hovering && !reduced;

  const place = useCallback((x: number, y: number, ms: number) => {
    const c = cursor.current;
    if (!c) return;
    c.style.transitionDuration = `${ms}ms`;
    c.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }, []);

  useEffect(() => {
    if (!live) return;
    const token = { dead: false };
    const c = cursor.current, el = root.current;
    if (!c || !el) return;
    let at = { x: el.clientWidth * 0.62, y: el.clientHeight * 0.55 };
    place(at.x, at.y, 0);
    (async () => {
      await sleep(startDelay, token);
      do {
        for (const step of script) {
          if (token.dead) return;
          const target = el.querySelector<HTMLElement>(step.target);
          if (!target || !target.getClientRects().length) continue;
          const r = target.getBoundingClientRect(), o = el.getBoundingClientRect();
          let fx = step.fx ?? 0.5;
          if (step.action === "range" && target instanceof HTMLInputElement && step.value !== undefined) {
            const min = Number(target.min || 0), max = Number(target.max || 100);
            fx = (step.value - min) / (max - min || 1);
          }
          const x = r.left - o.left + r.width * fx, y = r.top - o.top + r.height * 0.55;
          const dist = Math.hypot(x - at.x, y - at.y), ms = Math.max(380, Math.min(1100, dist * 1.25));
          c.dataset.state = "move";
          place(x, y, ms);
          at = { x, y };
          await sleep(ms + 60, token);
          if (token.dead) return;
          setTag(step.label ?? null);
          if (step.action !== "hover") {
            c.dataset.state = "press";
            await sleep(170, token);
            if (token.dead) return;
            if (step.action === "range" && target instanceof HTMLInputElement && step.value !== undefined) setRange(target, step.value);
            else target.click();
            c.dataset.state = "release";
          }
          await sleep(step.hold ?? 1800, token);
        }
        setTag(null);
        await sleep(restDelay, token);
      } while (loop && !token.dead);
    })();
    return () => { token.dead = true; };
  }, [live, script, startDelay, loop, restDelay, place, root, run]);

  return (
    <>
      <div ref={cursor} className="gc-cursor" data-live={live} aria-hidden="true" style={{ ["--gc-accent" as string]: accent }}>
        <svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 2.5l15 9.2-6.6 1.4 3.9 7.6-2.6 1.3-3.9-7.6L4.9 19z" /></svg>
        <i className="gc-ring" />
        {tag && <span className="gc-tag">{tr(tag)}</span>}
      </div>
      {taken && !reduced && (
        <button type="button" className="gc-replay" onClick={() => { setTaken(false); setRun((n) => n + 1); }}>
          {tr("↺ Show me")}
        </button>
      )}
    </>
  );
}
