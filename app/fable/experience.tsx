"use client";

import { TourProvider, useTour, CHAPTER_ORDER } from "./director";
import { HeroChapter } from "./hero";
import { IndexChapter } from "./index-chapter";
import { AntigravityChapter } from "./antigravity";
import { FilmoraChapter } from "./filmora";
import { MindscapeChapter } from "./mindscape";
import { SystemsChapter } from "./systems";
import { ClosingChapter } from "./closing";
import { MascotGuide } from "./mascot";

const RAIL_LABELS: Record<string, string> = {
  hero: "Intro",
  index: "Floor map",
  antigravity: "Antigravity",
  filmora: "Filmora",
  mindscape: "MindScape",
  systems: "Systems",
  closing: "Control room",
};

function ChapterRail() {
  const { activeChapter } = useTour();
  return (
    <nav className="chapter-rail" aria-label="Chapters">
      {CHAPTER_ORDER.map((id) => (
        <a key={id} href={`#${id === "hero" ? "" : id}`} className={`rail-dot ${activeChapter === id ? "is-active" : ""}`}
           onClick={(e) => {
             e.preventDefault();
             document.querySelector(`[data-chapter="${id}"]`)?.scrollIntoView({ behavior: "smooth" });
           }}>
          <span className="rail-label">{RAIL_LABELS[id]}</span>
        </a>
      ))}
    </nav>
  );
}

export function FableExperience() {
  return (
    <TourProvider>
      <main className="fable-root">
        <HeroChapter />
        <IndexChapter />
        <AntigravityChapter />
        <FilmoraChapter />
        <MindscapeChapter />
        <SystemsChapter />
        <ClosingChapter />
        <ChapterRail />
        <MascotGuide />
      </main>
    </TourProvider>
  );
}
