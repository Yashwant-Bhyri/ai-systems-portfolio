"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * The guided walk down the home page. When a page has finished saying what it has to say, it hands the
 * visitor on to the next page, so the walk leads to the two main projects, post-training and inference.
 *
 * A hand-off happens once per page per visit, only while the visitor is still on that page and has not
 * just scrolled, swiped, clicked or pressed a key: the visitor always wins. Reduced motion never moves.
 */
let lastInput = 0;
if (typeof window !== "undefined") {
  const mark = () => { lastInput = performance.now(); };
  for (const type of ["wheel", "touchstart", "keydown", "pointerdown"]) window.addEventListener(type, mark, { passive: true, capture: true });
}
const QUIET_MS = 2500;

/** Scroll smoothly to a page, with scroll snapping out of the way while it travels. */
export function glideTo(target: HTMLElement) {
  const html = document.documentElement, snap = html.style.scrollSnapType;
  html.style.scrollSnapType = "none";
  window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: "smooth" });
  window.setTimeout(() => { html.style.scrollSnapType = snap; }, 1800);
}

export function usePageHandoff(pageRef: RefObject<HTMLElement | null>, ready: boolean, next: string, delay = 2200) {
  const done = useRef(false);
  useEffect(() => {
    if (!ready || done.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const attempt = () => {
      const page = pageRef.current, target = document.getElementById(next);
      if (!page || !target || done.current) return;
      const r = page.getBoundingClientRect(), vh = window.innerHeight;
      // Still reading this page? If the visitor has moved on, the walk stops here.
      if (!(r.top < vh * 0.45 && r.bottom > vh * 0.55)) return;
      // The visitor is busy with something here: wait for a quiet moment.
      if (performance.now() - lastInput < QUIET_MS) { timer = window.setTimeout(attempt, 1200); return; }
      done.current = true;
      glideTo(target);
    };
    timer = window.setTimeout(attempt, delay);
    return () => window.clearTimeout(timer);
  }, [ready, next, delay, pageRef]);
}
