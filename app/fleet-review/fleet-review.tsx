"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExhibitScene } from "../compute/stagecraft/exhibit-host";
import { PolicyFleet } from "../exhibit/policy/fleet";
import "../compute/stagecraft/stagecraft.css";

/** Review harness: the QwenGyre-style elastic RL scene on its own clock. */
const DURATION = 13100;
export function FleetReview() {
  const start = useRef(0);
  const [playing, setPlaying] = useState(true);
  const held = useRef(0);
  useEffect(() => { start.current = performance.now(); }, []);
  const readTime = useCallback(() => (playing ? (performance.now() - start.current) % (DURATION + 3000) : held.current), [playing]);
  const onSeek = useCallback((ms: number) => { start.current = performance.now() - ms; held.current = ms; }, []);
  const onToggle = useCallback(() => setPlaying((p) => { if (p) held.current = (performance.now() - start.current) % (DURATION + 3000); else start.current = performance.now() - held.current; return !p; }), []);
  return (
    <main className="vx-shell" style={{ minHeight: "100vh", background: "#050608", padding: "40px 24px", color: "#e9edf2" }}>
      <h1 style={{ font: "500 22px/1.3 system-ui", margin: "0 0 16px" }}>Elastic RL (after QwenGyre) · review harness</h1>
      <ExhibitScene Scene={PolicyFleet} label="Elastic RL" readTime={readTime} playing={playing} reduced={false} duration={DURATION} onSeek={onSeek} onToggle={onToggle} />
    </main>
  );
}
