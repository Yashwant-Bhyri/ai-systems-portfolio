"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTr } from "../../exhibit/i18n";
import { highlight } from "./stage-meter";
import { POLICIES, simulateLab } from "../lab-simulation";
import { latencyDistribution } from "../load-latency-model";
import { CACHE_DELTA, OVERLAP, PRESSURE_GAP } from "../serving-rail-meta";
import "./module-brief.css";

/**
 * Before a module opens for the first time the whole screen blurs and three
 * short lines say what this is: what we are dealing with, the exact goal, and
 * the impact, with its number. It plays once per visit; any click or key ends it.
 */
export type Brief = { dealing: string; goal: string; impact: string; title?: string };

const f = (v: number, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return (s[47] + s[48]) / 2; };

/** Every number is read from the lab's own model, so a brief cannot drift from its module. */
export function moduleBriefs(training: boolean, budget: number): Record<string, Brief> {
  if (training) {
    const base1 = simulateLab(0, 1), lean = simulateLab(3, 4), base = simulateLab(0, budget), rl = simulateLab(2, budget);
    const r8 = simulateLab(2, 8);
    return {
      inside: { dealing: "The model's 36 layers, while it answers one coding task", goal: "See where training really changed how it reasons", impact: "*7 of 50 words* now differ from the base model" },
      terrain: { dealing: "All 96 tasks, at six stages of training", goal: "Clear more tasks at every stage", impact: `*${base1.correct} → ${lean.correct} of 96* tasks solved` },
      curves: { dealing: `${POLICIES.length} checkpoints, each given more and more GPU time`, goal: "The most correct answers for the least compute", impact: `*${r8.correct} of 96* for the RL checkpoint at 8× thinking budget` },
      tasks: { dealing: "Every task, stacked from easiest to hardest", goal: "Move the model's ability line to the right", impact: `*+${rl.correct - base.correct} tasks* over the line` },
      film: { title: "How it learned", dealing: "One base model and four training moves", goal: "Smarter first, then leaner", impact: `*${base1.correct} → ${lean.correct} of 96* solved, step by step` },
      fleet: { dealing: "64 GPUs doing RL, stopping at a barrier every step", goal: "Let any free GPU take any role, so nobody waits", impact: "*4 → 7 RL steps* in the same 14 minutes" },
      map: { dealing: "One square per task, at every checkpoint", goal: "See which tasks changed, not only the score", impact: `*+${rl.correct - base.correct} tasks*, net, at ${budget}× thinking budget` },
      audit: { dealing: "Every gain and every loss, task by task", goal: "Catch any task that training broke", impact: "*Each lost task* is named, not averaged away" },
    };
  }
  const baseStatic = simulateLab(0, budget, false, "shared-prefix");
  const rlStatic = simulateLab(2, budget, false, "shared-prefix"), rlFast = simulateLab(2, budget, true, "shared-prefix");
  const p95 = (r: typeof rlFast) => latencyDistribution(r, 95).threshold.latency;
  const med = (r: typeof rlFast) => median(r.tasks.map((t) => t.latency));
  const costPct = Math.round((100 * (rlFast.correctCost! - baseStatic.correctCost!)) / baseStatic.correctCost!);
  return {
    replay: { dealing: "One request's whole life, then all 96 side by side", goal: "Answer every request sooner, with the answer unchanged", impact: `Median response *${f(med(rlStatic))} → ${f(med(rlFast))} s*` },
    composition: { dealing: "Two separate levers: what the model knows, and how it is served", goal: "More correct answers, without the bill growing with them", impact: `*${baseStatic.correct} → ${rlFast.correct} of 96* correct, at ${Math.abs(costPct)}% ${costPct > 0 ? "more" : "less"} GPU time per answer` },
    latency: { dealing: "The queue: what a person sending a request feels", goal: "Shorten the wait of the slowest requests", impact: `Slowest 5%: *${f(p95(rlStatic))} → ${f(p95(rlFast))} s*` },
    film: { title: "The experiment, lever by lever", dealing: "The same 96 requests, changing one thing at a time", goal: "Find out what each lever really saves", impact: `*${f(rlStatic.correctCost!, 2)} → ${f(rlFast.correctCost!, 2)} GPU-s* per correct answer` },
    pressure: { dealing: "Long prompts and live answers share every GPU step", goal: "Never let a long prompt freeze an answer mid-stream", impact: `Worst pause *${f(PRESSURE_GAP.whole)} → ${f(PRESSURE_GAP.chunked, 1)} ms*` },
    draft: { dealing: "The large model writes one word per full pass", goal: "Let a small model guess ahead, and verify many words in one pass", impact: "*12 → 3* serial calls of the large model" },
    cache: { dealing: "Several replicas: which one should take this request?", goal: "Send it to where its prompt is already in memory", impact: `First token *${CACHE_DELTA} ms sooner*` },
    overlap: { dealing: "The GPU waits while the CPU prepares its next step", goal: "Prepare the next step during this one", impact: `Four steps: *${OVERLAP.baseline.finish} → ${OVERLAP.overlapped.finish} ms*` },
    map: { dealing: "Every serving mechanism on one clock", goal: "See how they work together on four requests", impact: "*10 mechanisms*, one system" },
    glossary: { dealing: "The vocabulary of serving under load", goal: "Nine terms, each one tied to this project", impact: "*9 terms*, and this part ends here" },
  };
}

const ROW = [450, 1450, 2500] as const;
const END = 6200;

export function ModuleBrief({ title, brief, path, onDone }: { title: string; brief: Brief; path: string; onDone: () => void }) {
  const tr = useTr();
  const done = useRef(onDone);
  useEffect(() => { done.current = onDone; });
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = ROW.map((ms, i) => window.setTimeout(() => setShown(i + 1), reduced ? 0 : ms));
    timers.push(window.setTimeout(() => done.current(), reduced ? 3200 : END));
    const end = () => done.current();
    window.addEventListener("keydown", end);
    return () => { timers.forEach((t) => window.clearTimeout(t)); window.removeEventListener("keydown", end); };
  }, []);
  const rows = [["We are looking at", brief.dealing, false], ["The goal", brief.goal, false], ["The impact", brief.impact, true]] as const;
  return createPortal(
    <div className="mb-veil" role="dialog" aria-label={`${tr(title)}: ${tr("what this is")}`} onClick={() => done.current()}>
      <div className="mb-card">
        <span className="mb-path">{tr(path)}</span>
        <h3>{tr(brief.title ?? title)}</h3>
        <dl>
          {rows.map(([label, text, big], i) => (
            <div key={label} data-on={shown > i || undefined} data-big={big || undefined}>
              <dt>{tr(label)}</dt>
              <dd>{highlight(tr(text))}</dd>
            </div>
          ))}
        </dl>
      </div>
      <b className="mb-time" style={{ animationDuration: `${END}ms` }} aria-hidden="true" />
      <span className="mb-skip">{tr("Click anywhere to start")}</span>
    </div>,
    document.body,
  );
}
