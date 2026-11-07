"use client";

import { useEffect, useMemo, useState } from "react";
import { simulateLab } from "../lab-simulation";
import { SERVING_RAIL } from "../serving-rail-meta";
import type { Pathway, ShowItem } from "./title-show";
import { GlyphBigPicture, GlyphLearn, GlyphComposition, GlyphCurves, GlyphExperiment, GlyphFleet, GlyphFrontier, GlyphInside, GlyphLatency, GlyphReplay, GlyphTasks, GlyphTerrain, GlyphAudit } from "./glyphs";
import "./title-show.css";
import "./stagecraft.css";

/** The results laboratory's opening, looping, for the project's second page. */
const f = (v: number, d = 2) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const TRAINING_ITEMS = (): ShowItem[] => {
  const base = simulateLab(0, 1), lean = simulateLab(3, 4), sft = simulateLab(1, 1), rl = simulateLab(2, 1);
  return [
    { key: "inside", title: "What changed inside the model", value: "7 of 50", unit: "words differ", Glyph: GlyphInside, pathway: 0 },
    { key: "learn", title: "Learning from outcomes", value: `${sft.correct} → ${rl.correct}`, unit: "of 96", Glyph: GlyphLearn, pathway: 0 },
    { key: "terrain", title: "Skill gained at each step", value: `+${lean.correct - base.correct}`, unit: "tasks", Glyph: GlyphTerrain, pathway: 0 },
    { key: "frontier", title: "Accuracy against GPU cost", value: `${base.correct} → ${lean.correct}`, unit: "of 96", Glyph: GlyphFrontier, pathway: 0 },
    { key: "curves", title: "What more thinking buys", value: "1× to 8×", unit: "thinking budget", Glyph: GlyphCurves, pathway: 0 },
    { key: "fleet", title: "Training twice as fast on 64 GPUs", value: "4 → 7", unit: "RL steps", Glyph: GlyphFleet, pathway: 0 },
    { key: "tasks", title: "Which tasks it can now solve", value: "easy to hard", Glyph: GlyphTasks, pathway: 0 },
    { key: "audit", title: "What got worse", value: "each one named", Glyph: GlyphAudit, pathway: 0 },
  ];
};
const INFERENCE_ITEMS = (): ShowItem[] => {
  const s = simulateLab(2, 2, false, "shared-prefix"), o = simulateLab(2, 2, true, "shared-prefix");
  return [
    { key: "setup", title: "The big picture", value: `${f(s.correctCost!)} → ${f(o.correctCost!)}`, unit: "GPU-s per correct answer", Glyph: GlyphBigPicture, pathway: 0 },
    { key: "replay", title: "Execution replay", value: `${f(s.tasks[6].gpuSeconds)} → ${f(o.tasks[6].gpuSeconds)}`, unit: "GPU-s", Glyph: GlyphReplay, pathway: 0 },
    { key: "composition", title: "Policy × runtime", value: `${o.correct} of 96`, Glyph: GlyphComposition, pathway: 0 },
    { key: "latency", title: "Queue & latency", value: `${f(s.p95, 0)} → ${f(o.p95, 0)} s`, Glyph: GlyphLatency, pathway: 0 },
    { key: "film", title: "The experiment", value: "lever by lever", Glyph: GlyphExperiment, pathway: 0 },
    ...SERVING_RAIL.filter((m) => m.key !== "glossary").map((m) => ({ key: m.key, title: m.title, value: m.value, unit: m.unit, Glyph: m.Glyph, pathway: 1 })),
  ];
};
const TRAINING_PATHS: readonly Pathway[] = [{ n: "01", title: "What did the model learn?", short: "Post-training", techniques: [] }];
const INFERENCE_PATHS: readonly Pathway[] = [
  { n: "01", title: "Serving the same intelligence at cheaper execution", short: "Cheaper execution", techniques: [] },
  { n: "02", title: "Optimized serving under load", short: "Optimized serving under load", techniques: [] },
];

export function LabPreview({ training }: { training: boolean }) {
  const items = useMemo(() => (training ? TRAINING_ITEMS() : INFERENCE_ITEMS()), [training]);
  const paths = training ? TRAINING_PATHS : INFERENCE_PATHS;
  const id = training ? "post-training" : "inference";
  const [lit, setLit] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setLit((n) => (n + 1) % items.length), 1900);
    return () => window.clearInterval(t);
  }, [items.length]);
  return (
    <div className="ll-list">
      {paths.map((p, pi) => (
        <div key={p.n}>
          <h4>{p.short === "Post-training" ? "Results laboratory" : p.short}</h4>
          {items.filter((i) => i.pathway === pi).map((i) => (
            <a key={i.key} className="ll-row" data-lit={items[lit] === i || undefined} href={`/${id}?labnav=show#${id}-study/${i.key}`}>{i.title}<b>{i.value}</b></a>
          ))}
        </div>
      ))}
    </div>
  );
}
