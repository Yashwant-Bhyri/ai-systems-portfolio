"use client";

import { useEffect, useRef, useState } from "react";
import { useTour, type ChapterId } from "./director";

/**
 * Volt — the doodle tour guide. A different "shift worker" of the same species
 * takes over at each chapter (new accent + accessory), per the hand-off brief.
 */
const GUIDES: Record<ChapterId, { name: string; accent: string; accessory: "none" | "antenna" | "clapper" | "pulse" | "wrench" | "flag"; lines: string[] }> = {
  hero: {
    name: "Volt",
    accent: "#ffb45c",
    accessory: "none",
    lines: [
      "Hey — I'm Volt. I'll drive today.",
      "Sit back. I'll take you through everything Yash has built, one system at a time.",
    ],
  },
  index: {
    name: "Volt",
    accent: "#ffb45c",
    accessory: "flag",
    lines: [
      "Five systems on the floor tonight.",
      "An AI interviewer, a media agent runtime, a clinical pipeline, an ops platform, and a research bench. Let's walk the line.",
    ],
  },
  antigravity: {
    name: "Ohm",
    accent: "#7ee0ff",
    accessory: "antenna",
    lines: [
      "Ohm here — I run the interview bay.",
      "Watch one spoken answer travel the whole loop: heard, analysed by five agents, answered back. Under a second.",
    ],
  },
  filmora: {
    name: "Pix",
    accent: "#ff8fb2",
    accessory: "clapper",
    lines: [
      "Pix, from the media floor.",
      "One prompt walks in, a finished edit walks out. In between: 700+ trend signals and a compiler for creative intent.",
    ],
  },
  mindscape: {
    name: "Sage",
    accent: "#8ef0c0",
    accessory: "pulse",
    lines: [
      "Sage — clinical wing.",
      "Here nothing ships unverified. Every conclusion is retrieved, grounded, and gated before a clinician ever sees it.",
    ],
  },
  systems: {
    name: "Torq",
    accent: "#ffd166",
    accessory: "wrench",
    lines: [
      "Torq. I keep the heavy machinery.",
      "Role-gated logistics ops, plus the research bench — from edge silicon to GraphRAG.",
    ],
  },
  closing: {
    name: "Volt",
    accent: "#ffb45c",
    accessory: "none",
    lines: [
      "That's the whole facility.",
      "Grab the résumé, open the code, or watch a real interview run. Yash reads every email.",
    ],
  },
};

function useTypedLines(lines: string[], key: string) {
  const [typed, setTyped] = useState(() => ({ key, text: "", lineIdx: 0 }));
  const current = typed.key === key ? typed : { key, text: "", lineIdx: 0 };

  useEffect(() => {
    let li = 0;
    let ci = 0;
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      if (!alive) return;
      const line = lines[li];
      if (!line) return;
      if (ci < line.length) {
        ci += 1;
        setTyped({ key, text: line.slice(0, ci), lineIdx: li });
        timer = setTimeout(step, 24);
      } else if (li < lines.length - 1) {
        timer = setTimeout(() => {
          li += 1;
          ci = 0;
          step();
        }, 1700);
      }
    };
    timer = setTimeout(step, 650);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [key, lines]);
  return { text: current.text, lineIdx: current.lineIdx };
}

function GuideFace({ accent, accessory }: { accent: string; accessory: string }) {
  return (
    <svg viewBox="0 0 64 64" className="mascot-svg" aria-hidden="true">
      {/* wobbly hand-drawn blob body */}
      <path
        className="mascot-body"
        d="M32 6 C45 5 56 15 57 29 C58 44 48 57 33 58 C18 59 7 49 6 34 C5 19 18 7 32 6 Z"
        fill="none"
        stroke={accent}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M32 10 C43 9 52 17 53 29 C54 41 46 53 33 54 C20 55 11 47 10 34 C9 22 20 11 32 10 Z"
        fill={accent}
        opacity="0.13"
      />
      {/* eyes */}
      <g className="mascot-eyes">
        <circle cx="24" cy="30" r="3.1" fill={accent} />
        <circle cx="40" cy="30" r="3.1" fill={accent} />
      </g>
      {/* smile */}
      <path d="M25 41 Q32 47 39 41" fill="none" stroke={accent} strokeWidth="2.4" strokeLinecap="round" />
      {/* accessories */}
      {accessory === "antenna" && (
        <g stroke={accent} strokeWidth="2.2" strokeLinecap="round">
          <path d="M32 7 L32 -1" fill="none" />
          <circle cx="32" cy="-3" r="2.6" fill={accent} className="mascot-antenna-tip" />
        </g>
      )}
      {accessory === "clapper" && (
        <g stroke={accent} strokeWidth="2" strokeLinecap="round" fill="none">
          <rect x="42" y="2" width="16" height="10" rx="2" transform="rotate(12 50 7)" />
          <path d="M43 4 l4 4 M48 3 l4 4 M53 2 l4 4" transform="rotate(12 50 7)" />
        </g>
      )}
      {accessory === "pulse" && (
        <path d="M12 2 h6 l3 -5 4 9 3 -4 h6" fill="none" stroke={accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {accessory === "wrench" && (
        <g stroke={accent} strokeWidth="2.2" strokeLinecap="round" fill="none">
          <path d="M48 4 l8 8" />
          <path d="M46 8 a5 5 0 1 1 6 -6" />
        </g>
      )}
      {accessory === "flag" && (
        <g stroke={accent} strokeWidth="2" strokeLinecap="round">
          <path d="M52 14 L52 -2" fill="none" />
          <path d="M52 -2 L62 2 L52 6 Z" fill={accent} opacity="0.85" />
        </g>
      )}
    </svg>
  );
}

export function MascotGuide() {
  const { activeChapter, touring, started, pauseTour, resumeTour } = useTour();
  const guide = GUIDES[activeChapter];
  const { text } = useTypedLines(guide.lines, activeChapter);
  const [entering, setEntering] = useState(false);
  const prev = useRef<ChapterId>(activeChapter);

  useEffect(() => {
    if (prev.current !== activeChapter) {
      prev.current = activeChapter;
      setEntering(true);
      const t = setTimeout(() => setEntering(false), 650);
      return () => clearTimeout(t);
    }
  }, [activeChapter]);

  return (
    <div className={`mascot-dock ${entering ? "is-entering" : ""}`} style={{ "--guide-accent": guide.accent } as React.CSSProperties}>
      <div className="mascot-bubble" role="status">
        <span className="mascot-name">{guide.name}</span>
        <p className="mascot-text">
          {text}
          <span className="mascot-caret" />
        </p>
        <div className="mascot-controls">
          {touring ? (
            <button className="mascot-btn" onClick={pauseTour}>⏸ Pause the tour</button>
          ) : (
            <button className="mascot-btn is-primary" onClick={resumeTour}>
              {started ? "▶ Resume the tour" : "▶ Sit back — I'll drive"}
            </button>
          )}
        </div>
      </div>
      <div className="mascot-avatar">
        <GuideFace accent={guide.accent} accessory={guide.accessory} />
      </div>
    </div>
  );
}
