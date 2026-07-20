"use client";

/**
 * Spark — the on-screen tour guide for the V2 experience.
 *
 * Design lineage: studied "Lumen" (portfolio-kimi mascot) and kept its best
 * ideas — an original hand-drawn SVG creature (never an emoji), gaze that
 * tracks the thing being explained, a typed speech bubble (24 ms/char), real
 * hop transitions between chapters, and session-scoped dismissal. Improved
 * for this site: Spark is fully additive — it reads the live DOM (active
 * chapter section + the lit walkthrough step) instead of requiring any
 * rewiring of the V2 experience, and it tints itself with the active
 * chapter's accent so it always belongs to the scene it narrates.
 */

import { useCallback, useEffect, useRef, useState } from "react";

const CHAPTER_LINES: Record<string, string> = {
  top: "Hi — I'm Spark. Scroll, and I'll explain every system as it runs.",
  profile: "This is what I'm built for — four target roles, five domains, and the proof lives one scroll down.",
  projects: "Five systems, ordered for AI application & agent roles. The cards are touring themselves — or pick one.",
  antigravity: "A real interview turn is replaying. Watch the loop close in under a second.",
  filmora: "One creative brief becomes a finished edit. Every stage here is the runtime actually working.",
  mindscape: "A clinical session flows through seven inspectable layers. Nothing reaches the clinician unvalidated.",
  research: "Five research specimens plus the bounded ops copilot — each one is a live mini-pipeline.",
};

const SECTION_IDS = ["top", "profile", "projects", "antigravity", "filmora", "mindscape", "research"];

type Watch = { section: string; step: string; title: string };

function readDom(): Watch {
  // active section = the one owning the viewport centre
  const mid = window.innerHeight / 2;
  let section = "top";
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.top <= mid && r.bottom >= mid) {
      section = id;
      break;
    }
  }
  let step = "";
  let title = "";
  if (["antigravity", "filmora", "mindscape"].includes(section)) {
    const sec = document.getElementById(section);
    const lit = sec?.querySelector<HTMLElement>('.vx-stage-rail button[data-active="true"] span');
    const h3 = sec?.querySelector<HTMLElement>(".vx-story-copy h3");
    step = lit?.textContent ?? "";
    title = h3?.textContent ?? "";
  }
  return { section, step, title };
}

export function GuideSpark() {
  const [dismissed, setDismissed] = useState(false);
  const [watch, setWatch] = useState<Watch>({ section: "top", step: "", title: "" });
  const [line, setLine] = useState(CHAPTER_LINES.top);
  const [typedN, setTypedN] = useState(0);
  const [hopping, setHopping] = useState(false);
  const [gaze, setGaze] = useState<[number, number]>([0, 0]);
  const lastSection = useRef("top");
  const lastStep = useRef("");

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem("spark-dismissed") === "1") setDismissed(true);
    } catch { /* no-op */ }
  }, []);

  // watch the page: active section, lit step, and where to look
  useEffect(() => {
    if (dismissed) return;
    const tick = () => {
      if (document.hidden) return;
      const w = readDom();
      setWatch(w);
      // gaze toward the active operational stage (or the hero deck)
      const target =
        document.getElementById(w.section)?.querySelector(".vx-visual-window, .vx-deck-stage, .vx-research-grid") ?? null;
      if (target) {
        const r = (target as HTMLElement).getBoundingClientRect();
        const dx = r.left + r.width / 2 - 90;
        const dy = r.top + r.height / 2 - (window.innerHeight - 110);
        const len = Math.max(1, Math.hypot(dx, dy));
        setGaze([(dx / len) * 2.4, (dy / len) * 2.4]);
      }
    };
    tick();
    const timer = window.setInterval(tick, 900);
    return () => window.clearInterval(timer);
  }, [dismissed]);

  // narration: chapter line on section change; step line on step change
  useEffect(() => {
    if (watch.section !== lastSection.current) {
      lastSection.current = watch.section;
      lastStep.current = "";
      setHopping(true);
      window.setTimeout(() => setHopping(false), 750);
      setLine(CHAPTER_LINES[watch.section] ?? CHAPTER_LINES.top);
      setTypedN(0);
      return;
    }
    if (watch.step && watch.step !== lastStep.current) {
      lastStep.current = watch.step;
      const t = watch.title.length > 92 ? `${watch.title.slice(0, 89)}…` : watch.title;
      setLine(`Under the microscope now — ${watch.step}. ${t}`);
      setTypedN(0);
    }
  }, [watch]);

  // typing engine, lumen cadence
  useEffect(() => {
    if (dismissed || typedN >= line.length) return;
    const timer = window.setTimeout(() => setTypedN((v) => v + 1), 24);
    return () => window.clearTimeout(timer);
  }, [typedN, line, dismissed]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try { window.sessionStorage.setItem("spark-dismissed", "1"); } catch { /* no-op */ }
  }, []);
  const summon = useCallback(() => {
    setDismissed(false);
    try { window.sessionStorage.removeItem("spark-dismissed"); } catch { /* no-op */ }
    setTypedN(0);
  }, []);

  if (dismissed) {
    return (
      <button type="button" className="vx-spark-summon" onClick={summon} aria-label="Bring back the tour guide">
        ✦
      </button>
    );
  }

  return (
    <div className={`vx-spark-dock vx-accent-${accentFor(watch.section)} ${hopping ? "is-hopping" : ""}`} role="status" aria-live="polite">
      <div className="vx-spark-bubble">
        {line.slice(0, typedN)}
        {typedN < line.length ? <i className="vx-type-caret" /> : null}
      </div>
      <div className="vx-spark-row">
        <svg className="vx-spark-fig" viewBox="0 0 64 64" aria-hidden="true">
          {/* orbit ring */}
          <ellipse cx="32" cy="40" rx="24" ry="7" className="spark-ring" />
          {/* soft comet body */}
          <path d="M 32 8 C 44 12 50 24 47 37 C 45 47 38 53 32 54 C 26 53 19 47 17 37 C 14 24 20 12 32 8 Z" className="spark-body" />
          {/* antenna ember */}
          <line x1="32" y1="8" x2="32" y2="2" className="spark-antenna" />
          <circle cx="32" cy="1.6" r="2.2" className="spark-ember" />
          {/* eyes with live gaze */}
          <circle cx="25" cy="30" r="5" className="spark-eye" />
          <circle cx="39" cy="30" r="5" className="spark-eye" />
          <circle cx={25 + gaze[0]} cy={30 + gaze[1]} r="2.1" className="spark-pupil" />
          <circle cx={39 + gaze[0]} cy={30 + gaze[1]} r="2.1" className="spark-pupil" />
          {/* speaking mouth */}
          <path d="M 27 42 q 5 4 10 0" className="spark-mouth" />
        </svg>
        <button type="button" className="vx-spark-dismiss" onClick={dismiss} aria-label="Dismiss the tour guide">
          ×
        </button>
      </div>
    </div>
  );
}

function accentFor(section: string): string {
  switch (section) {
    case "filmora": return "violet";
    case "mindscape": return "cyan";
    case "research": return "blue";
    default: return "lime";
  }
}
