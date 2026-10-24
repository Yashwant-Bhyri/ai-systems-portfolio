"use client";

import { useEffect, useRef } from "react";
import { useTour, useStepper, useOnScreen } from "./director";

const CAPABILITIES = [
  ["AI agents & applications", "orchestrated, evaluated, shipped"],
  ["Realtime voice systems", "streaming STT ↔ TTS under 1 s"],
  ["Retrieval & grounding", "dense + lexical + rerank + NLI gates"],
  ["Multi-agent orchestration", "hand-offs, state machines, telemetry"],
  ["Evaluation & observability", "evidence ledgers, contract + e2e tests"],
  ["Edge & systems", "TinyML silicon to browser WebGL"],
];

export function ClosingChapter() {
  const { registerSection, chapterDone, restartTour } = useTour();
  const sectionRef = useRef<HTMLElement>(null);
  const onScreen = useOnScreen(sectionRef);

  useEffect(() => {
    registerSection("closing", sectionRef.current);
  }, [registerSection]);

  const [lit] = useStepper(CAPABILITIES.length, {
    active: onScreen,
    stepMs: 1800,
    startDelayMs: 800,
    onFirstCycle: () => chapterDone("closing"),
  });

  return (
    <section ref={sectionRef} data-chapter="closing" id="closing" className="fable-section closing-chapter">
      <header className="chapter-head">
        <p className="chapter-kicker">CONTROL ROOM</p>
        <h2 className="chapter-title">Every system you just saw runs the same method</h2>
        <p className="chapter-sub">perceive → orchestrate → reason → validate → observe → ship</p>
      </header>

      <ul className="cap-grid">
        {CAPABILITIES.map((c, i) => (
          <li key={c[0]} className={`cap-cell ${lit === i ? "is-lit" : ""}`}>
            <span className="cap-name">{c[0]}</span>
            <span className="cap-how">{c[1]}</span>
          </li>
        ))}
      </ul>

      <div className="closing-actions">
        <a className="btn btn-primary big" href="/yashwant-bhyri-resume.pdf" target="_blank" rel="noreferrer">
          View the technical résumé
        </a>
        <a className="btn big" href="https://antigravity-gz2r.vercel.app" target="_blank" rel="noreferrer">
          ▶ Watch a real interview run
        </a>
        <a className="btn big" href="https://github.com/Yashwant-Bhyri" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a className="btn big" href="mailto:bvyashwantkumar900@gmail.com">
          bvyashwantkumar900@gmail.com
        </a>
        <button className="btn big ghost" onClick={restartTour}>
          ↺ Replay the tour
        </button>
      </div>

      <p className="cred-strip">
        Yashwant Bhyri · Year 4, Computer Science &amp; Artificial Intelligence · The Chinese University of Hong Kong ·
        scholarship recipient · open to AI Application / AI Agent / AI Systems engineering roles
      </p>
    </section>
  );
}
