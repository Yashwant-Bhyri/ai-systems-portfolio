"use client";

import { useEffect, useRef } from "react";

/**
 * Keyword galaxy — 20 discipline keywords drifting in depth behind the hero.
 * Contract from the brief: ~9–10 clearly visible at any moment, 1–2 flaring
 * bright at once, constant slow motion, never overwhelming the foreground.
 */
const KEYWORDS = [
  "AI Agent Engineer",
  "AI Systems Engineer",
  "AI Application Engineer",
  "Multi-Agent Orchestration",
  "Streaming Speech-to-Text",
  "Semantic Search",
  "Vector Retrieval",
  "Data Pipelines",
  "Multimodal AI",
  "LLM Routing",
  "Evaluation Harnesses",
  "Prompt Compilation",
  "State Machines",
  "Reranking",
  "GraphRAG",
  "Realtime Voice",
  "Telemetry",
  "Edge Inference",
  "Retrieval-Augmented Generation",
  "Agent Memory",
];

type Star = {
  text: string;
  x: number; // 0..1
  y: number;
  z: number; // depth 0(far)..1(near)
  vx: number;
  vy: number;
  phase: number; // twinkle phase
  flareUntil: number;
};

export function KeywordGalaxy({ dimmed }: { dimmed?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dimRef = useRef(!!dimmed);
  dimRef.current = !!dimmed;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const stars: Star[] = KEYWORDS.map((text, i) => ({
      text,
      x: (i % 5) / 5 + rand(0.01, 0.17),
      y: Math.floor(i / 5) / 4 + rand(0.02, 0.2),
      z: rand(0, 1),
      vx: rand(-0.006, 0.006),
      vy: rand(-0.004, 0.004),
      phase: rand(0, Math.PI * 2),
      flareUntil: 0,
    }));

    // Dust field for depth
    const dust = Array.from({ length: 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
      p: Math.random() * Math.PI * 2,
    }));

    let last = performance.now();
    let nextFlareAt = last + 600;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Keep 1–2 keywords flaring at all times.
      const flaring = stars.filter((s) => s.flareUntil > now).length;
      if (now >= nextFlareAt && flaring < 2) {
        const idle = stars.filter((s) => s.flareUntil <= now);
        const pick = idle[Math.floor(Math.random() * idle.length)];
        if (pick) pick.flareUntil = now + rand(2600, 4200);
        nextFlareAt = now + rand(1400, 2600);
      }

      ctx.clearRect(0, 0, w, h);
      const globalDim = dimRef.current ? 0.45 : 1;

      for (const d of dust) {
        d.p += dt * 0.9;
        const tw = 0.35 + 0.3 * Math.sin(d.p);
        ctx.fillStyle = `rgba(158, 195, 255, ${(0.05 + 0.1 * d.z) * tw * globalDim})`;
        const r = 0.6 + d.z * 1.3;
        ctx.beginPath();
        ctx.arc(d.x * w, d.y * h, r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const s of stars) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        if (s.x < -0.12) s.x = 1.08;
        if (s.x > 1.12) s.x = -0.08;
        if (s.y < -0.06) s.y = 1.04;
        if (s.y > 1.06) s.y = -0.04;
        s.phase += dt * 0.7;

        const isFlare = s.flareUntil > now;
        const twinkle = 0.5 + 0.5 * Math.sin(s.phase);
        // Base visibility tier by depth: far ones stay faint, near ones legible.
        const base = 0.16 + s.z * 0.3 + twinkle * 0.1;
        const alpha = Math.min(isFlare ? 0.95 : base, 1) * globalDim;
        const size = 11 + s.z * 6 + (isFlare ? 2 : 0);

        ctx.font = `500 ${size}px var(--fable-mono, "IBM Plex Mono", monospace)`;
        ctx.textBaseline = "middle";
        const x = s.x * w;
        const y = s.y * h;

        if (isFlare) {
          ctx.shadowColor = "rgba(255, 176, 92, 0.9)";
          ctx.shadowBlur = 18;
          ctx.fillStyle = `rgba(255, 202, 133, ${alpha})`;
        } else {
          ctx.shadowColor = "rgba(140, 180, 255, 0.35)";
          ctx.shadowBlur = 6;
          ctx.fillStyle = `rgba(196, 212, 238, ${alpha})`;
        }
        ctx.fillText(s.text, x, y);
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fable-galaxy" aria-hidden="true" />;
}
