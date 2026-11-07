"use client";

import { useEffect, useRef, useState } from "react";
import type { LabRun } from "./lab-simulation";
import { RequestClusters, clusterStats } from "./request-clusters";
import { emitFocus } from "./stagecraft/stage-meter";

/** Plays the clusters once when they come into view: the population moves, then the result is read. */
const START = 1200, MOVE = 6500, HOLD = 4800;
/** The finding waits for the request film beside it to finish its 20 seconds. */
const FILM_END = 20600;
const f = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 0 });

export function ClusterPanel({ baseline, target, taskId }: { baseline: LabRun; target: LabRun; taskId: number }) {
  const root = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { window.setTimeout(() => setK(1), 0); return; }
    let raf = 0, t0 = 0, timer = 0, off = 0;
    const s = clusterStats(baseline, target);
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - t0 - START) / MOVE));
      setK(p * p * (3 - 2 * p));
      if (p < 1) { raf = requestAnimationFrame(tick); return; }
      timer = window.setTimeout(() => {
        emitFocus({
          headline: `Half of all requests finish *${f(s.medianLatency[0] - s.medianLatency[1])} s sooner*`,
          parts: [{ label: "baseline median", value: `${f(s.medianLatency[0])} s`, tone: "baseline" }, { label: "optimized median", value: `${f(s.medianLatency[1])} s`, tone: "optimized" }],
          cause: "less GPU work per request, so every queue drains sooner",
          place: "left",
        });
        off = window.setTimeout(() => emitFocus(null), HOLD);
      }, FILM_END - START - MOVE);
    };
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf); window.clearTimeout(timer); window.clearTimeout(off);
      if (e.isIntersecting) { t0 = performance.now(); setK(0); raf = requestAnimationFrame(tick); } else emitFocus(null);
    }, { threshold: 0.2 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); window.clearTimeout(timer); window.clearTimeout(off); emitFocus(null); };
  }, [baseline, target]);
  return <div ref={root} className="rc-panel" data-focus-spot><RequestClusters baseline={baseline} target={target} taskId={taskId} k={k} /></div>;
}
