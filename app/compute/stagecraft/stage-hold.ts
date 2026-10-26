import { useLayoutEffect, useRef, type RefObject } from "react";

/**
 * Hold the stage at its last height while one module replaces another, then
 * ease to the new height. Without it the stage collapses for a few frames
 * (the next module mounts lazily), the page beneath jumps up, and the browser
 * clamps the scroll position.
 */
export function useStageHold(ref: RefObject<HTMLElement | null>, key: string) {
  const last = useRef(0);
  const prevKey = useRef(key);
  // Track the settled height between swaps.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => { if (!el.style.minHeight) last.current = el.offsetHeight; });
    ro.observe(el);
    last.current = el.offsetHeight;
    return () => ro.disconnect();
  }, [ref]);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prevKey.current === key) return;
    prevKey.current = key;
    if (!last.current) return;
    // Runs after the DOM swap and before paint: the old height holds the space.
    el.style.transition = "none";
    el.style.minHeight = `${last.current}px`;
    let settled = 0, frame = 0, prevH = -1;
    const timer = { id: 0 };
    const release = () => {
      el.style.transition = "min-height .5s cubic-bezier(.2,.7,.2,1)";
      el.style.minHeight = "0px";
      timer.id = window.setTimeout(() => { el.style.transition = ""; el.style.minHeight = ""; last.current = el.offsetHeight; }, 560);
    };
    // Wait until the new module's own height stops changing (lazy chunks, fonts), at most ~1.2 s.
    const contentHeight = () => [...el.children].reduce((h, c) => Math.max(h, (c as HTMLElement).offsetTop + (c as HTMLElement).offsetHeight), 0);
    const watch = () => {
      const inner = contentHeight();
      settled = inner === prevH ? settled + 1 : 0;
      prevH = inner;
      if (settled >= 8 || ++frame > 72) release();
      else timer.id = requestAnimationFrame(watch);
    };
    timer.id = requestAnimationFrame(watch);
    return () => { cancelAnimationFrame(timer.id); window.clearTimeout(timer.id); el.style.transition = ""; el.style.minHeight = ""; };
  }, [ref, key]);
}
