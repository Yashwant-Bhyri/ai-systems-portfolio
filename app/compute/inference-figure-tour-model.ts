import type {
  InferenceFigureContext,
  InferenceFigureSelection,
} from "./explorer-state";
import { LOAD_FILM_MS } from "./load-latency-model";
import {
  COMPOSITION_FILM_MS,
  compositionPhase,
} from "./composition-comparison";

const loadEnd = 20000 + LOAD_FILM_MS;

export const FIGURE_TOUR_CHAPTERS = [
  { name: "Request execution", start: 0, end: 20000, view: 1 },
  { name: "Queue & response latency", start: 20000, end: loadEnd, view: 2 },
  {
    name: "Runtime cost reduction",
    start: loadEnd,
    end: loadEnd + COMPOSITION_FILM_MS,
    view: 0,
  },
  {
    name: "Post-training accuracy",
    start: loadEnd + COMPOSITION_FILM_MS,
    end: loadEnd + 2 * COMPOSITION_FILM_MS,
    view: 0,
  },
  {
    name: "Combined policy & runtime",
    start: loadEnd + 2 * COMPOSITION_FILM_MS,
    end: loadEnd + 3 * COMPOSITION_FILM_MS,
    view: 0,
  },
] as const;
export const FIGURE_TOUR_MS = FIGURE_TOUR_CHAPTERS.at(-1)!.end;

/** A presentation clock only. No simulation inputs change between these chapters. */
export function inferenceFigureFrame(
  time: number,
  context: InferenceFigureContext,
) {
  if (!Number.isFinite(time))
    throw new RangeError("Figure clock must be finite");
  const cursor = Math.max(0, Math.min(FIGURE_TOUR_MS, time));
  const index = FIGURE_TOUR_CHAPTERS.findIndex(
    (chapter) => cursor < chapter.end,
  );
  const chapterIndex = index < 0 ? FIGURE_TOUR_CHAPTERS.length - 1 : index;
  const chapter = FIGURE_TOUR_CHAPTERS[chapterIndex];
  const localTime = cursor - chapter.start;
  const phase = compositionPhase(localTime);
  const selection: InferenceFigureSelection =
    chapter.view === 1
      ? {
          view: 1,
          state: {
            time: localTime,
            taskId: 6,
            mechanism: "both",
            metric: "service",
          },
        }
      : chapter.view === 2
        ? {
            view: 2,
            state: { time: localTime, percentile: 95, selected: null },
          }
        : {
            view: 0,
            selected:
              chapterIndex === 2
                ? context.policy === 0
                  ? 1
                  : 3
                : chapterIndex === 3
                  ? 2
                  : 3,
            state: {
              lens:
                chapterIndex === 2
                  ? "runtime"
                  : chapterIndex === 3
                    ? "policy"
                    : "combined",
              metric:
                chapterIndex === 3 || (chapterIndex === 4 && phase === 1)
                  ? "accuracy"
                  : "cost",
              phase,
            },
          };
  return { cursor, chapterIndex, chapter, localTime, selection };
}

/** Reduced-motion chapter selection exposes its complete result without entering the next chapter. */
export function figureChapterTime(index: number, reduced: boolean) {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= FIGURE_TOUR_CHAPTERS.length
  )
    throw new RangeError("Unknown figure chapter");
  const chapter = FIGURE_TOUR_CHAPTERS[index];
  return reduced ? chapter.end - 10 : chapter.start;
}
