"use client";

import { useCallback, useRef, useState } from "react";
import { ExhibitScene } from "./exhibit-host";
import { PolicyFleet } from "../../exhibit/policy/fleet";

/**
 * Elastic RL on 64 GPUs, as a laboratory module: the scene
 * loops on its own clock; only the pause button stops it.
 */
const DURATION = 13100, REST = 2600;
export function FleetModule({ active }: { active: boolean }) {
  const start = useRef(0);
  const held = useRef(0);
  const [playing, setPlaying] = useState(true);
  const running = playing && active;
  const readTime = useCallback(() => {
    if (!running) return held.current;
    if (!start.current) start.current = performance.now() - held.current;
    return (performance.now() - start.current) % (DURATION + REST);
  }, [running]);
  const onSeek = useCallback((ms: number) => { held.current = ms; start.current = performance.now() - ms; }, []);
  const onToggle = useCallback(() => {
    setPlaying((p) => {
      if (p) { held.current = (performance.now() - start.current) % (DURATION + REST); start.current = 0; }
      return !p;
    });
  }, []);
  return <ExhibitScene Scene={PolicyFleet} label="Elastic RL on 64 GPUs" readTime={readTime} playing={running} reduced={false} duration={DURATION} onSeek={onSeek} onToggle={onToggle} />;
}
