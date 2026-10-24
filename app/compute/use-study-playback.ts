"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PlaybackClock } from "./playback-clock";
import { latestPlaybackVisibility } from "./playback-visibility";

/** A slow narrated emphasis pass. Data is always visible, including before hydration. */
export function useStudyPlayback(
  count: number,
  initial = 0,
  options: {
    held?: boolean;
    enabled?: boolean;
    finite?: boolean;
    interval?: number;
    durations?: readonly number[];
    initialTime?: number;
    autoplay?: boolean;
  } = {},
) {
  const {
    held = false,
    enabled = true,
    finite = false,
    interval = 6500,
    durations,
    initialTime = 0,
    autoplay = true,
  } = options;
  const ref = useRef<HTMLElement>(null);
  const clockRef = useRef<PlaybackClock | null>(null);
  const [step, setStep] = useState(initial);
  const [restart, setRestart] = useState(0);
  const [seekState, setSeekState] = useState({ revision: 0, offset: initialTime });
  const [playing, setPlaying] = useState(autoplay);
  const [finished, setFinished] = useState(false);
  const [cycling, setCycling] = useState(true);
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const stepDuration = durations?.[step % durations.length] ?? interval;
  const sceneKey = `${step}:${restart}`;
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    const updateTab = () => setTabVisible(!document.hidden);
    updateTab();
    document.addEventListener("visibilitychange", updateTab);
    let disposed = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (disposed) return;
        const next = latestPlaybackVisibility(entries);
        if (next !== undefined) setVisible(next);
      },
      { threshold: 0.25 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      disposed = true;
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", updateTab);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    const initializing = clockRef.current === null;
    const clock = (clockRef.current ??= new PlaybackClock());
    clock.configure(sceneKey, stepDuration);
    if (initializing && initialTime > 0) clock.seek(initialTime);
    if (
      !playing ||
      !cycling ||
      !visible ||
      !tabVisible ||
      reduced ||
      held ||
      !enabled
    )
      return;
    const timer = setTimeout(() => {
      if (finite && step === count - 1) {
        setFinished(true);
        setPlaying(false);
      } else {
        setStep((step + 1) % count);
        setSeekState((s) => ({ revision: s.revision + 1, offset: 0 }));
      }
    }, clock.resume(performance.now()));
    return () => {
      clearTimeout(timer);
      clock.pause(performance.now());
    };
  }, [
    playing,
    cycling,
    visible,
    tabVisible,
    reduced,
    count,
    step,
    held,
    enabled,
    finite,
    stepDuration,
    sceneKey,
    seekState.revision,
    initialTime,
  ]);
  const readTime = useCallback(
    () => clockRef.current?.elapsed(performance.now()) ?? 0,
    [],
  );
  return {
    ref,
    step,
    playing,
    finished,
    cycling,
    sceneKey,
    readTime,
    progressKey: `${sceneKey}:${seekState.revision}`,
    progressOffset: seekState.offset,
    duration: stepDuration,
    running: playing && visible && tabVisible && !reduced && !held && enabled,
    inViewport: visible,
    reduced,
    select: (value: number) => {
      setStep(value);
      setRestart((value) => value + 1);
      setFinished(false);
      setSeekState((s) => ({ revision: s.revision + 1, offset: 0 }));
      setCycling(false);
    },
    seek: (value: number) => {
      const clock = (clockRef.current ??= new PlaybackClock());
      clock.configure(sceneKey, stepDuration);
      clock.seek(value);
      setSeekState((s) => ({ revision: s.revision + 1, offset: value }));
      setFinished(false);
      setPlaying(false);
    },
    pause: () => setPlaying(false),
    toggle: () => {
      setCycling(true);
      setPlaying((v) => !v);
    },
    resume: () => {
      setCycling(true);
      setPlaying(true);
    },
    replay: () => {
      setStep(0);
      setRestart((value) => value + 1);
      setFinished(false);
      setSeekState((s) => ({ revision: s.revision + 1, offset: 0 }));
      setCycling(true);
      setPlaying(true);
    },
  };
}
