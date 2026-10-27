import { useEffect, type RefObject } from "react";

/**
 * Keep a module inside the one-screen stage. The stage has a fixed height (one
 * viewport minus the site header and the lab head). Modules size themselves to
 * `--lf-room`; when one is still taller, it is scaled down (a transform, so it
 * does not reflow wider) until it fits, never below FLOOR. The scale is
 * published as `data-fit` so the fit tracker can list the modules that still
 * need their own layout work: the goal is 1 everywhere. `?nofit` measures only.
 */
const FLOOR = 0.78;

export function useStageFit(stageRef: RefObject<HTMLElement | null>, fitRef: RefObject<HTMLElement | null>, on: boolean) {
  useEffect(() => {
    const stage = stageRef.current, fit = fitRef.current;
    if (!stage || !fit) return;
    const reset = () => { fit.style.transform = ""; fit.style.marginBottom = ""; fit.style.transformOrigin = ""; delete stage.dataset.fit; };
    if (!on) { reset(); return; }
    const measureOnly = new URLSearchParams(location.search).has("nofit");
    let raf = 0, scale = 1;
    const measure = () => {
      raf = 0;
      const chapters = stage.querySelector<HTMLElement>(":scope > .lf-chapters");
      const room = stage.clientHeight - (chapters?.offsetHeight ?? 0);
      const natural = fit.offsetHeight; // layout height, unaffected by the transform
      if (room <= 0 || natural <= 0) return;
      // modules size their main figure against the room they actually have
      stage.style.setProperty("--lf-room", `${room}px`);
      stage.dataset.natural = String(natural);
      const next = measureOnly ? 1 : Math.max(FLOOR, Math.min(1, Math.floor((room / natural) * 100) / 100));
      if (Math.abs(next - scale) < 0.01 && stage.dataset.fit) return;
      scale = next;
      stage.dataset.fit = scale.toFixed(2);
      if (scale === 1) { fit.style.transform = ""; fit.style.marginBottom = ""; return; }
      fit.style.transformOrigin = "top center";
      fit.style.transform = `scale(${scale})`;
      fit.style.marginBottom = `${-natural * (1 - scale)}px`;
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(measure); };
    const ro = new ResizeObserver(schedule);
    ro.observe(stage);
    ro.observe(fit);
    const mo = new MutationObserver(schedule);
    mo.observe(fit, { childList: true, subtree: true });
    schedule();
    return () => { ro.disconnect(); mo.disconnect(); cancelAnimationFrame(raf); reset(); };
  }, [stageRef, fitRef, on]);
}
