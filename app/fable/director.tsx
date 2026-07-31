"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export const CHAPTER_ORDER = [
  "hero",
  "index",
  "antigravity",
  "filmora",
  "mindscape",
  "systems",
  "closing",
] as const;

export type ChapterId = (typeof CHAPTER_ORDER)[number];

type TourApi = {
  touring: boolean;
  started: boolean;
  activeChapter: ChapterId;
  registerSection: (id: ChapterId, el: HTMLElement | null) => void;
  chapterDone: (id: ChapterId) => void;
  beginTour: () => void;
  pauseTour: () => void;
  resumeTour: () => void;
  restartTour: () => void;
  reducedMotion: boolean;
};

const TourCtx = createContext<TourApi | null>(null);

export function useTour(): TourApi {
  const ctx = useContext(TourCtx);
  if (!ctx) throw new Error("useTour outside TourProvider");
  return ctx;
}

export function TourProvider({ children }: { children: ReactNode }) {
  const [touring, setTouring] = useState(false);
  const [started, setStarted] = useState(false);
  const [activeChapter, setActiveChapter] = useState<ChapterId>("hero");
  const [reducedMotion, setReducedMotion] = useState(false);
  const sections = useRef(new Map<ChapterId, HTMLElement>());
  const completed = useRef(new Set<ChapterId>());
  const touringRef = useRef(touring);
  const activeRef = useRef(activeChapter);
  const driveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    const initialSync = window.requestAnimationFrame(onChange);
    mq.addEventListener("change", onChange);
    return () => {
      window.cancelAnimationFrame(initialSync);
      mq.removeEventListener("change", onChange);
    };
  }, []);

  const registerSection = useCallback((id: ChapterId, el: HTMLElement | null) => {
    if (el) sections.current.set(id, el);
    else sections.current.delete(id);
  }, []);

  // Active chapter tracking — whichever section owns the viewport center.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const id = (e.target as HTMLElement).dataset.chapter as ChapterId;
            if (id) {
              activeRef.current = id;
              setActiveChapter(id);
            }
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    const els = Array.from(sections.current.values());
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const driveTo = useCallback((id: ChapterId) => {
    const el = sections.current.get(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const advanceFrom = useCallback(
    (id: ChapterId, delayMs: number) => {
      if (driveTimer.current) clearTimeout(driveTimer.current);
      const idx = CHAPTER_ORDER.indexOf(id);
      const next = CHAPTER_ORDER[idx + 1];
      if (!next) {
        touringRef.current = false;
        setTouring(false);
        return;
      }
      driveTimer.current = setTimeout(() => {
        if (touringRef.current) driveTo(next);
      }, delayMs);
    },
    [driveTo],
  );

  const chapterDone = useCallback(
    (id: ChapterId) => {
      completed.current.add(id);
      if (touringRef.current && activeRef.current === id) advanceFrom(id, 1600);
    },
    [advanceFrom],
  );

  const beginTour = useCallback(() => {
    setStarted(true);
    touringRef.current = true;
    setTouring(true);
  }, []);

  const pauseTour = useCallback(() => {
    if (driveTimer.current) clearTimeout(driveTimer.current);
    touringRef.current = false;
    setTouring(false);
  }, []);

  const resumeTour = useCallback(() => {
    setStarted(true);
    touringRef.current = true;
    setTouring(true);
    // If the chapter on screen already played through, roll straight to the next.
    if (completed.current.has(activeRef.current)) {
      advanceFrom(activeRef.current, 700);
    }
  }, [advanceFrom]);

  const restartTour = useCallback(() => {
    completed.current.clear();
    setStarted(true);
    touringRef.current = true;
    setTouring(true);
    driveTo("hero");
  }, [driveTo]);

  // Any real user input takes the wheel back — the tour yields instantly.
  useEffect(() => {
    if (!touring) return;
    const pause = () => pauseTour();
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"].includes(e.key)) pause();
    };
    window.addEventListener("wheel", pause, { passive: true });
    window.addEventListener("touchmove", pause, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", pause);
      window.removeEventListener("touchmove", pause);
      window.removeEventListener("keydown", onKey);
    };
  }, [touring, pauseTour]);

  const api = useMemo(
    () => ({
      touring,
      started,
      activeChapter,
      registerSection,
      chapterDone,
      beginTour,
      pauseTour,
      resumeTour,
      restartTour,
      reducedMotion,
    }),
    [touring, started, activeChapter, registerSection, chapterDone, beginTour, pauseTour, resumeTour, restartTour, reducedMotion],
  );

  return <TourCtx.Provider value={api}>{children}</TourCtx.Provider>;
}

/**
 * Auto-cycling step index for a chapter's internal timeline.
 * Always cycles while the chapter is on screen — the site moves itself even when
 * the visitor has paused the chapter-to-chapter drive. Loops forever; reports the
 * first completed pass so the director can move on.
 */
export function useStepper(
  count: number,
  opts: { active: boolean; stepMs: number; startDelayMs?: number; onFirstCycle?: () => void },
) {
  const { active, stepMs, startDelayMs = 0, onFirstCycle } = opts;
  const [step, setStep] = useState(0);
  const cycled = useRef(false);
  const firstCycleRef = useRef(onFirstCycle);

  useEffect(() => {
    firstCycleRef.current = onFirstCycle;
  }, [onFirstCycle]);

  useEffect(() => {
    if (!active) return;
    const reset = setTimeout(() => setStep(0), 0);
    let interval: ReturnType<typeof setInterval> | null = null;
    const kickoff = setTimeout(() => {
      interval = setInterval(() => {
        setStep((s) => {
          const next = (s + 1) % count;
          if (next === 0 && !cycled.current) {
            cycled.current = true;
            firstCycleRef.current?.();
          }
          return next;
        });
      }, stepMs);
    }, startDelayMs);
    return () => {
      clearTimeout(reset);
      clearTimeout(kickoff);
      if (interval) clearInterval(interval);
    };
  }, [active, count, stepMs, startDelayMs]);

  return [step, setStep] as const;
}

/** True once the chapter section is meaningfully on screen. */
export function useOnScreen(ref: React.RefObject<HTMLElement | null>, threshold = 0.35) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return on;
}
