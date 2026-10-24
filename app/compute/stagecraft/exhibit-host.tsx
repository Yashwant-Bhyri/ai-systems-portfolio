"use client";

import { useEffect, useMemo, useRef, type ComponentType } from "react";
import { useTall, type RoomClock, type RoomProps } from "../../exhibit/shell";
import { useLang } from "../../exhibit/i18n";
import "../../exhibit/exhibit.css";

/**
 * Plays an exhibit scene inside a laboratory chapter, on the chapter's own
 * clock. The scene keeps its full-bleed composition; the chapter keeps its
 * navigation. One slim transport replaces the scene strip.
 */
export function ExhibitScene({
  Scene,
  readTime,
  playing,
  reduced,
  duration,
  onSeek,
  onToggle,
  accent = "rose",
  label,
}: {
  Scene: ComponentType<RoomProps>;
  readTime: () => number;
  playing: boolean;
  reduced: boolean;
  duration: number;
  onSeek: (ms: number) => void;
  onToggle: () => void;
  accent?: "rose" | "amber";
  label: string;
}) {
  const tall = useTall();
  const lang = useLang();
  const clock = useMemo<RoomClock>(
    () => ({ readTime, playing, reduced, seek: onSeek, toggle: onToggle }),
    [readTime, playing, reduced, onSeek, onToggle],
  );
  return (
    <div className={`ex-wing ex-embed ex-accent-${accent}`} aria-label={label}>
      <div className={`ex-embed-stage${tall ? " is-tall" : ""}`}>
        <Scene active={playing} mode="light" clock={clock} tall={tall} lang={lang} />
      </div>
      <EmbedTransport readTime={readTime} playing={playing} reduced={reduced} duration={duration} onSeek={onSeek} onToggle={onToggle} />
    </div>
  );
}

function EmbedTransport({ readTime, playing, reduced, duration, onSeek, onToggle }: { readTime: () => number; playing: boolean; reduced: boolean; duration: number; onSeek: (ms: number) => void; onToggle: () => void }) {
  const range = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (range.current && document.activeElement !== range.current) range.current.value = String(Math.min(duration, readTime()));
      if (playing) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [readTime, playing, duration]);
  return (
    <div className="ex-embed-transport">
      <button type="button" disabled={reduced} onClick={onToggle} aria-label={playing ? "Pause" : "Play"}>{playing ? "Ⅱ" : "▷"}</button>
      <input ref={range} type="range" min={0} max={duration} step={50} defaultValue={0} aria-label="Scrub this chapter" onChange={(e) => onSeek(Number(e.target.value))} />
    </div>
  );
}
