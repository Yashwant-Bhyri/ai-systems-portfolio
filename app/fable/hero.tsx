"use client";

import { useEffect, useRef, useState } from "react";
import { useTour, useStepper } from "./director";
import { KeywordGalaxy } from "./galaxy";

/** Typing script: type → mistake → backspace → correct, like a human at a keyboard. */
type Op = { t: "type"; s: string } | { t: "back"; n: number } | { t: "wait"; ms: number };

const SCRIPT: Op[] = [
  { t: "type", s: "Hi, welcome to my personal websi" },
  { t: "wait", ms: 350 },
  { t: "back", n: 5 },
  { t: "type", s: "portfolio." },
  { t: "wait", ms: 500 },
  { t: "type", s: "\nI'm Yashwant Bhyri — a Year 4 Computer Science & AI student at The Chinese University of Hong Kong," },
  { t: "wait", ms: 300 },
  { t: "type", s: " with 1+ years across internships and research as an AI Application Engineer, AI Agent Developer, and AI Systems Developer." },
];

const FINAL_TEXT = SCRIPT.reduce((acc, op) => {
  if (op.t === "type") return acc + op.s;
  if (op.t === "back") return acc.slice(0, -op.n);
  return acc;
}, "");

const HERO_CARDS = [
  {
    id: "antigravity",
    no: "01",
    name: "Antigravity",
    what: "AI-native technical interviewer",
    back: ["Voice-to-voice, sub-second turns", "250+ interviews conducted"],
  },
  {
    id: "filmora",
    no: "02",
    name: "Filmora Agent Runtime",
    what: "Multi-agent media production · Wondershare",
    back: ["700+ trend signals per brief", "28% lower API cost"],
  },
  {
    id: "mindscape",
    no: "03",
    name: "MindScape",
    what: "Clinical AI workflow engine",
    back: ["Hybrid medical retrieval", "Deterministic safety gates"],
  },
  {
    id: "systems",
    no: "04",
    name: "Logistics AI-Ops",
    what: "Role-gated operations platform",
    back: ["Weather + geo risk scoring", "Whitelisted AI copilot"],
  },
  {
    id: "systems",
    no: "05",
    name: "Research Bench",
    what: "Edge AI · retrieval · rendering",
    back: ["TinyML: 14× compression, <10 ms", "GraphRAG · BIRD-SQL · WebGL"],
  },
];

export function HeroChapter() {
  const { registerSection, chapterDone, beginTour, reducedMotion } = useTour();
  const sectionRef = useRef<HTMLElement>(null);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"typing" | "split">("typing");
  const [skipped, setSkipped] = useState(false);
  const doneRef = useRef(false);
  const introResolved = reducedMotion || skipped;
  const displayedPhase = introResolved ? "split" : phase;
  const displayedText = introResolved ? FINAL_TEXT : typed;

  useEffect(() => {
    registerSection("hero", sectionRef.current);
  }, [registerSection]);

  // Typing engine
  useEffect(() => {
    if (introResolved) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    let opIdx = 0;
    let charIdx = 0;
    let text = "";

    const step = () => {
      if (!alive) return;
      const op = SCRIPT[opIdx];
      if (!op) {
        timer = setTimeout(() => alive && setPhase("split"), 800);
        return;
      }
      if (op.t === "wait") {
        opIdx += 1;
        timer = setTimeout(step, op.ms);
        return;
      }
      if (op.t === "back") {
        if (charIdx < op.n) {
          text = text.slice(0, -1);
          charIdx += 1;
          setTyped(text);
          timer = setTimeout(step, 45);
        } else {
          opIdx += 1;
          charIdx = 0;
          timer = setTimeout(step, 120);
        }
        return;
      }
      if (charIdx < op.s.length) {
        text += op.s[charIdx];
        charIdx += 1;
        setTyped(text);
        timer = setTimeout(step, op.s[charIdx - 1] === "\n" ? 260 : 26 + Math.random() * 26);
      } else {
        opIdx += 1;
        charIdx = 0;
        timer = setTimeout(step, 60);
      }
    };
    timer = setTimeout(step, 900);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [introResolved]);

  // Cards auto-present themselves: one lifts and flips at a time, forever.
  const [flipIdx] = useStepper(HERO_CARDS.length, {
    active: displayedPhase === "split",
    stepMs: 2600,
    startDelayMs: 1800,
  });

  // Once the split has landed and the first card has presented, the tour begins.
  useEffect(() => {
    if (displayedPhase !== "split" || doneRef.current) return;
    const t = setTimeout(() => {
      doneRef.current = true;
      chapterDone("hero");
      beginTour();
    }, 6500);
    return () => clearTimeout(t);
  }, [displayedPhase, chapterDone, beginTour]);

  // Neon sweep: the freshest characters carry a fading highlight.
  const chars = displayedText.split("");
  const tail = chars.length;

  return (
    <section ref={sectionRef} data-chapter="hero" className={`fable-section hero ${displayedPhase === "split" ? "is-split" : ""}`}>
      <KeywordGalaxy dimmed={displayedPhase === "split"} />
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="live-dot" /> PORTFOLIO · LIVE TOUR
          </div>
          <h1 className="hero-typed" aria-label={FINAL_TEXT}>
            {chars.map((c, i) =>
              c === "\n" ? (
                <br key={i} />
              ) : (
                <span key={i} className={`h-ch ${displayedPhase === "typing" && tail - i <= 14 ? "is-fresh" : ""}`}>
                  {c}
                </span>
              ),
            )}
            {displayedPhase === "typing" && <span className="hero-caret" />}
          </h1>
          <div className={`hero-actions ${displayedPhase === "split" ? "is-on" : ""}`}>
            <a className="btn btn-primary" href="#index" onClick={() => {}}>
              Explore my projects
            </a>
            <a className="btn" href="/yashwant-bhyri-resume.pdf" target="_blank" rel="noreferrer">
              View résumé
            </a>
            <a className="btn" href="mailto:bvyashwantkumar900@gmail.com">
              Contact
            </a>
          </div>
        </div>

        <div className={`hero-cards ${displayedPhase === "split" ? "is-on" : ""}`} aria-hidden={displayedPhase !== "split"}>
          {HERO_CARDS.map((card, i) => (
            <a
              key={card.no}
              href={`#${card.id}`}
              className={`hero-card ${flipIdx === i && displayedPhase === "split" ? "is-flipped" : ""}`}
              style={{ transitionDelay: displayedPhase === "split" ? `${i * 120}ms` : "0ms" }}
            >
              <span className="hero-card-inner">
                <span className="hero-card-face front">
                  <span className="hc-no">{card.no}</span>
                  <span className="hc-name">{card.name}</span>
                  <span className="hc-what">{card.what}</span>
                </span>
                <span className="hero-card-face back">
                  {card.back.map((line) => (
                    <span key={line} className="hc-back-line">
                      {line}
                    </span>
                  ))}
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>

      {displayedPhase === "typing" && !reducedMotion && (
        <button className="hero-skip" onClick={() => setSkipped(true)}>
          Skip intro ↵
        </button>
      )}
    </section>
  );
}
