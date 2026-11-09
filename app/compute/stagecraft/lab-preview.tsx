"use client";

import { useEffect, useMemo, useState } from "react";
import { simulateLab } from "../lab-simulation";
import { SERVING_RAIL } from "../serving-rail-meta";
import type { Pathway, ShowItem } from "./title-show";
import { GlyphDial, GlyphManifold, GlyphBigPicture, GlyphLearn, GlyphComposition, GlyphCurves, GlyphExperiment, GlyphFleet, GlyphFrontier, GlyphInside, GlyphLatency, GlyphReplay, GlyphTasks, GlyphTerrain, GlyphAudit } from "./glyphs";
import "./title-show.css";
import "./stagecraft.css";

/** The results laboratory's opening, looping, for the project's second page. */
const f = (v: number, d = 2) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
/** The home page never shows a count out of 96: accuracy is a percentage. */
const P = (n: number) => `${Math.round((100 * n) / 96)}%`;
const TRAINING_ITEMS = (): ShowItem[] => {
  const base = simulateLab(0, 1), lean = simulateLab(3, 4), sft = simulateLab(1, 1), rl = simulateLab(2, 1);
  return [
    { key: "manifold", title: "The manifold", value: `${P(base.correct)} → ${P(lean.correct)}`, unit: "accuracy, three models", Glyph: GlyphManifold, pathway: 0 },
    { key: "inside", title: "The layers that changed", value: "7 of 50", unit: "words differ", Glyph: GlyphInside, pathway: 0 },
    { key: "learn", title: "GRPO", value: `${P(sft.correct)} → ${P(rl.correct)}`, unit: "accuracy", Glyph: GlyphLearn, pathway: 0 },
    { key: "terrain", title: "Skill gained at each step", value: `${P(base.correct)} → ${P(lean.correct)}`, unit: "accuracy", Glyph: GlyphTerrain, pathway: 0 },
    { key: "frontier", title: "Accuracy against GPU cost", value: `${P(base.correct)} → ${P(lean.correct)}`, unit: "accuracy", Glyph: GlyphFrontier, pathway: 0 },
    { key: "curves", title: "Test-time scaling", value: "1× to 8×", unit: "thinking budget", Glyph: GlyphCurves, pathway: 0 },
    { key: "fleet", title: "Elastic RL on 64 GPUs", value: "4 → 7", unit: "RL steps", Glyph: GlyphFleet, pathway: 0 },
    { key: "tasks", title: "Harder tasks within reach", value: "easy to hard", Glyph: GlyphTasks, pathway: 0 },
    { key: "audit", title: "Regression audit", value: "each one named", Glyph: GlyphAudit, pathway: 0 },
  ];
};
const INFERENCE_ITEMS = (): ShowItem[] => {
  const s = simulateLab(2, 2, false, "shared-prefix"), o = simulateLab(2, 2, true, "shared-prefix");
  return [
    { key: "flow", title: "Serving timeline", term: "Every request, phase by phase", value: `${f(s.correctCost!)} → ${f(o.correctCost!)}`, unit: "GPU-s per correct answer", Glyph: GlyphDial, pathway: 0 },
    { key: "setup", title: "Batching, prefix caching, FP8", term: "Three levers, the same answers", value: `${P(o.correct)}`, unit: "accuracy, unchanged", Glyph: GlyphBigPicture, pathway: 0 },
    { key: "replay", title: "Request replay", term: "One request, four measures", value: `${f(s.tasks[6].gpuSeconds)} → ${f(o.tasks[6].gpuSeconds)}`, unit: "GPU-s", Glyph: GlyphReplay, pathway: 0 },
    { key: "composition", title: "Policy × runtime", term: "Training meets serving", value: `${P(simulateLab(0, 2, false, "shared-prefix").correct)} → ${P(o.correct)}`, Glyph: GlyphComposition, pathway: 0 },
    { key: "latency", title: "Tail latency (p95)", term: "The slowest 5% of requests", value: `${f(s.p95, 0)} → ${f(o.p95, 0)} s`, Glyph: GlyphLatency, pathway: 0 },
    { key: "film", title: "Lever ablation", term: "One lever at a time", value: "3 levers", Glyph: GlyphExperiment, pathway: 0 },
    ...SERVING_RAIL.filter((m) => m.key !== "glossary").map((m) => ({ key: m.key, title: m.title, term: m.term, value: m.value, unit: m.unit, Glyph: m.Glyph, pathway: 1 })),
  ];
};
const TRAINING_PATHS: readonly Pathway[] = [{ n: "01", title: "What did the model learn?", short: "Post-training", techniques: [] }];
const INFERENCE_PATHS: readonly Pathway[] = [
  { n: "01", title: "Same intelligence at cheaper cost", short: "Same intelligence at cheaper cost", techniques: [] },
  { n: "02", title: "Serving under load", short: "Serving under load", techniques: [] },
];

/**
 * A project's second page: the laboratory's titles as small blocks, with the reel's highlight (all muted,
 * the lit one grows and comes into colour) moving from one to the next; the lit title is shown large on the right.
 */
export function LabPreview({ training }: { training: boolean }) {
  const items = useMemo(() => (training ? TRAINING_ITEMS() : INFERENCE_ITEMS()), [training]);
  const paths = training ? TRAINING_PATHS : INFERENCE_PATHS, id = training ? "post-training" : "inference";
  const [lit, setLit] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setLit((n) => (n + 1) % items.length), 2200);
    return () => window.clearInterval(t);
  }, [items.length]);
  const on = hover ?? lit, cur = items[on];
  const href = (key: string) => `/${id}?labnav=show#${id}-study/${key}`;
  return (
    <div className="lc-band">
      <div className="lc-blocks">
        {paths.map((p, pi) => {
          const own = items.filter((i) => i.pathway === pi), cols = Math.ceil(own.length / 2);
          return (
            <section key={p.n} className="lc-sec" style={{ flexGrow: own.length }}>
              <h4>{p.short === "Post-training" ? "Results laboratory" : pi === 0 ? `Results laboratory · ${p.short}` : p.short}</h4>
              {[own.slice(0, cols), own.slice(cols)].map((row, r) => (
                <div key={r} className="lc-row">
                  {row.map((i) => {
                    const k = items.indexOf(i), isLit = k === on;
                    return (
                      <a key={i.key} className="lc-block" data-lit={isLit} style={{ flexGrow: isLit ? 1.9 : 1 }} href={href(i.key)} onPointerEnter={() => setHover(k)} onPointerLeave={() => setHover(null)}>
                        <span className="lc-art" aria-hidden="true">{i.Glyph && <i.Glyph />}</span>
                        <strong>{i.title}</strong>
                      </a>
                    );
                  })}
                </div>
              ))}
            </section>
          );
        })}
      </div>
      <a key={cur.key} className="lc-preview" href={href(cur.key)}>
        <span className="lc-preview-art" aria-hidden="true">{cur.Glyph && <cur.Glyph />}</span>
        <strong>{cur.title}</strong>
        {cur.term && <em>{cur.term}</em>}
        {cur.value && <span className="lc-preview-value"><mark>{cur.value}</mark>{cur.unit && <small>{cur.unit}</small>}</span>}
      </a>
    </div>
  );
}
