"use client";

import { useEffect, useState } from "react";

/** One transport clock drives both chapter advancement and the visible film. */
export function useFilmTime(
  readTime: () => number,
  playing: boolean,
  reduced: boolean,
  duration: number,
  onSeek: (time: number) => void,
  initialTime?: number,
) {
  const [time, setTime] = useState(initialTime ?? 0);
  const [scrubbed, setScrubbed] = useState(initialTime !== undefined);
  useEffect(() => {
    if (!playing || reduced) return;
    let raf = 0;
    let lastPaint = -Infinity;
    const paint = (now: number) => {
      const next = readTime();
      if (now - lastPaint >= 16 || next >= duration) {
        lastPaint = now;
        setTime(next);
      }
      if (next < duration) raf = requestAnimationFrame(paint);
    };
    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduced, readTime, duration]);
  return {
    time: reduced && !scrubbed ? duration : time,
    seek: (next: number) => {
      setScrubbed(true);
      setTime(next);
      onSeek(next);
    },
  };
}
