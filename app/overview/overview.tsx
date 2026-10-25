"use client";

import { useEffect, useState, type ComponentType } from "react";
import { InferenceOverview, TrainingOverview } from "../compute-visuals";
import {
  GlyphAudit, GlyphCacheRoute, GlyphCapability, GlyphChunked, GlyphComposition, GlyphCurves, GlyphDraft,
  GlyphExperiment, GlyphFleet, GlyphFrontier, GlyphKVSizing, GlyphLatency, GlyphOverlap, GlyphReplay, GlyphServingMap, GlyphTasks,
} from "../compute/stagecraft/glyphs";
import "../compute/stagecraft/stagecraft.css";
import "./overview.css";

/**
 * Tier 1 of a project: one screen. The architecture walks itself, three numbers
 * carry the result, and a fanned deck holds every investigation; any card opens
 * the full laboratory on that exact module.
 */
type Card = { key: string; title: string; value: string; unit: string; Glyph: ComponentType };
type Spread = {
  id: string; number: string; brand: string; title: string; claim: string;
  accent: "amber" | "rose"; Overview: ComponentType<{ active: number; onSelect: (n: number) => void }>; path: readonly number[];
  heroes: readonly { value: string; unit: string }[]; cards: readonly Card[]; lab: string; depth: string;
};

const SPREADS: readonly Spread[] = [
  {
    id: "inference", number: "04", brand: "Inference optimization engine", accent: "amber",
    title: "Same model, same answers, half the GPU work.",
    claim: "Continuous batching, prefix reuse and faster prefill & decode, then the serving-under-load mechanisms: chunked prefill, speculative decoding, cache-aware routing, CPU/GPU overlap.",
    Overview: InferenceOverview, path: [0, 1, 2, 5, 7], lab: "inference-study", depth: "inference",
    heroes: [
      { value: "−47%", unit: "GPU-s per correct answer" },
      { value: "1,006 → 445", unit: "s · p95 response under a burst" },
      { value: "12 → 3", unit: "serial large-model calls" },
    ],
    cards: [
      { key: "film", title: "The experiment", value: "36.61 → 19.29", unit: "GPU-s per correct answer", Glyph: GlyphExperiment },
      { key: "composition", title: "Policy × runtime", value: "43 → 67", unit: "of 96 correct, cheaper per answer", Glyph: GlyphComposition },
      { key: "replay", title: "Execution replay", value: "23.75 → 11.55", unit: "GPU-s · request 7", Glyph: GlyphReplay },
      { key: "latency", title: "Queue & latency", value: "1,006 → 445", unit: "s · p95", Glyph: GlyphLatency },
      { key: "pressure", title: "Prefill / decode", value: "56 → 10.25", unit: "ms worst token gap", Glyph: GlyphChunked },
      { key: "draft", title: "Speculative decoding", value: "12 → 3", unit: "large-model calls", Glyph: GlyphDraft },
      { key: "cache", title: "Cache-aware routing", value: "−20 ms", unit: "first token, warm replica", Glyph: GlyphCacheRoute },
      { key: "overlap", title: "CPU / GPU overlap", value: "52 → 37", unit: "ms for four decode steps", Glyph: GlyphOverlap },
      { key: "map", title: "Serving system", value: "10", unit: "mechanisms on one clock", Glyph: GlyphServingMap },
      { key: "glossary", title: "Serving glossary", value: "9", unit: "terms, each with its number", Glyph: GlyphKVSizing },
    ],
  },
  {
    id: "post-training", number: "05", brand: "Advanced post-training", accent: "rose",
    title: "A 4B model learns to reason, then spends its thinking where it pays.",
    claim: "SFT on verified traces, correctness RL, more thought at test time, then lean RL that keeps the gains with fewer tokens — on an elastic 64-GPU rollout fleet.",
    Overview: TrainingOverview, path: [0, 1, 3, 5, 7], lab: "post-training-study", depth: "post-training",
    heroes: [
      { value: "28 → 82", unit: "of 96 synthetic tasks solved" },
      { value: "−31%", unit: "tokens per task, same 82 solved" },
      { value: "1.96×", unit: "RL steps per hour on 64 GPUs" },
    ],
    cards: [
      { key: "film", title: "The experiment", value: "28 → 82", unit: "tasks · base → lean RL", Glyph: GlyphFrontier },
      { key: "map", title: "Capability map", value: "+24", unit: "net tasks at 2× thought", Glyph: GlyphCapability },
      { key: "curves", title: "Compute curves", value: "88", unit: "of 96 at 8× thought", Glyph: GlyphCurves },
      { key: "tasks", title: "Where the 96 tasks land", value: "+24", unit: "below the ability line", Glyph: GlyphTasks },
      { key: "fleet", title: "Elastic RL on 64 GPUs", value: "4 → 7", unit: "RL steps in 14 min", Glyph: GlyphFleet },
      { key: "audit", title: "Regression audit", value: "26 / 2", unit: "gained / lost", Glyph: GlyphAudit },
    ],
  },
];

function SpreadView({ s }: { s: Spread }) {
  const [step, setStep] = useState(0);
  const [card, setCard] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => { const id = window.setInterval(() => setStep((i) => (i + 1) % s.path.length), 3400); return () => window.clearInterval(id); }, [s.path.length]);
  useEffect(() => {
    if (hover !== null) return;
    const id = window.setInterval(() => setCard((i) => (i + 1) % s.cards.length), 2600);
    return () => window.clearInterval(id);
  }, [hover, s.cards.length]);
  const lifted = hover ?? card;
  const n = s.cards.length;
  return (
    <section className={`ov-spread vx-accent-${s.accent}`} id={`overview-${s.id}`}>
      <div className="ov-copy">
        <span className="ov-brand"><b>{s.number}</b> · {s.brand}</span>
        <h2>{s.title}</h2>
        <p>{s.claim}</p>
        <div className="ov-heroes">
          {s.heroes.map((h) => (
            <div key={h.unit}><b className="cx-hero-num ov-star">{h.value}</b><small>{h.unit}</small></div>
          ))}
        </div>
        <a className="ov-cta" href={`/?labnav=top#${s.depth}`}>Explore the {s.id === "inference" ? "engine" : "training"} in depth <i>→</i></a>
      </div>
      <div className="ov-arch">
        <span className="ov-label">High-level architecture</span>
        <s.Overview active={s.path[step]} onSelect={() => undefined} />
      </div>
      <div className="ov-deck" onPointerLeave={() => setHover(null)}>
        <span className="ov-label">Every investigation · select one to open it in the laboratory</span>
        <div className="ov-fan">
          {s.cards.map((c, i) => {
            const offset = i - (n - 1) / 2;
            const up = i === lifted;
            return (
              <a
                key={c.key}
                href={`/?labnav=top#${s.lab}/${c.key}`}
                className="ov-card"
                data-up={up || undefined}
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                style={{
                  "--x": `${offset * (100 / n) * 0.94}%`,
                  "--r": up ? "0deg" : `${offset * 1.8}deg`,
                  zIndex: up ? 50 : 20 - Math.abs(Math.round(offset)),
                } as React.CSSProperties}
              >
                <span className="rl-glyph ov-glyph" aria-hidden="true"><c.Glyph /></span>
                <strong>{c.title}</strong>
                <span className="ov-value"><mark>{c.value}</mark><small>{c.unit}</small></span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ProjectOverview() {
  return (
    <main className="vx-shell ov-page">
      <header className="ov-top">
        <span>Yashwant Bhyri · selected projects</span>
        <span>Tier 1 prototype · one screen per project</span>
      </header>
      {SPREADS.map((s) => <SpreadView key={s.id} s={s} />)}
    </main>
  );
}
