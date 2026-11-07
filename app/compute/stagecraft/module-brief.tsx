"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTr } from "../../exhibit/i18n";
import { highlight } from "./stage-meter";
import type { ShowItem } from "./title-show";
import { POLICIES, simulateLab } from "../lab-simulation";
import { FRONTIER_COST } from "../../exhibit/policy/data.ts";
import { latencyDistribution } from "../load-latency-model";
import { CACHE_DELTA, OVERLAP, PRESSURE_GAP } from "../serving-rail-meta";
import "./module-brief.css";

/**
 * Before a module opens for the first time the whole screen blurs and its title card
 * steps out of the rail to the middle, saying what we are dealing with, the goal, and
 * the impact with its number. It then returns to the rail. Once per visit; a click or key ends it.
 */
export type Brief = { does: string; dealing: string; goal: string; impact: string; why: string };

const f = (v: number, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return (s[47] + s[48]) / 2; };

/** Every number is read from the lab's own model, so a brief cannot drift from its module. */
export function moduleBriefs(training: boolean, budget: number): Record<string, Brief> {
  if (training) {
    const base1 = simulateLab(0, 1), lean = simulateLab(3, 4), base = simulateLab(0, budget), rl = simulateLab(2, budget);
    const r8 = simulateLab(2, 8);
    return {
      manifold: { does: "Every task, three models, six dimensions", dealing: "All 96 tasks at once", goal: "See what training changed, and what it did not", impact: `*${base1.correct} → ${lean.correct} of 96* correct`, why: "drag to turn it, or choose any three axes" },
      inside: { does: "Where training changed how the model reasons", dealing: "The model's 36 layers, while it answers one coding task", goal: "See where training really changed how it reasons", impact: "*7 of 50 words* now differ from the base model", why: "the layers that moved most are the ones writing the words that changed" },
      learn: { does: "The tests decide which attempts survive", dealing: "Eight attempts at the same task, and the tests that grade them", goal: "Make the attempts that pass more likely, with no teacher", impact: `*${simulateLab(1, 1).correct} → ${simulateLab(2, 1).correct} of 96* tasks solved`, why: "attempts that beat their group's average get written more often" },
      terrain: { does: "Each training step raises more of the 96 tasks", dealing: "All 96 tasks, at six stages of training", goal: "Clear more tasks at every stage", impact: `*${base1.correct} → ${lean.correct} of 96* tasks solved`, why: "each thing the model learned raises more tasks above the line" },
      frontier: { does: "Accuracy rises, then serving brings the cost back down", dealing: "Accuracy against GPU time per correct answer, move by move", goal: "Three times the answers without three times the cost", impact: `*${base1.correct} → ${lean.correct} of 96*, at ${f(FRONTIER_COST.start, 2)} → ${f(FRONTIER_COST.runtime, 2)} GPU-s per answer`, why: "training raises accuracy, then the serving runtime takes the cost back down" },
      curves: { does: "How much each model gains from more thinking", dealing: `${POLICIES.length} checkpoints, each given more and more GPU time`, goal: "The most correct answers for the least compute", impact: `*${r8.correct} of 96* for the RL checkpoint at 8× thinking budget`, why: "a trained model gains far more from extra thinking than the base model" },
      fleet: { does: "Any free GPU takes any role, so nobody waits", dealing: "64 GPUs doing RL, stopping at a barrier every step", goal: "Let any free GPU take any role, so nobody waits", impact: "*4 → 7 RL steps* in the same 14 minutes", why: "no barrier: each GPU keeps its identity and changes role" },
      map: { does: "Which tasks each checkpoint solves", dealing: "One square per task, at every checkpoint", goal: "See which tasks changed, not only the score", impact: `*+${rl.correct - base.correct} tasks*, net, at ${budget}× thinking budget`, why: "maths, multi-step logic and repository tasks all gain" },
      film: { does: "Four moves, each shown and then measured", dealing: "One base model and four training moves", goal: "Smarter first, then leaner", impact: `*${base1.correct} → ${lean.correct} of 96* solved, step by step`, why: "each move shown, then measured on the same 96 tasks" },
      tasks: { does: "How far up the difficulty the model reaches", dealing: "Every task, stacked from easiest to hardest", goal: "Raise the model's ability past more of them", impact: `*+${rl.correct - base.correct} tasks* within reach`, why: "ability rises, so harder tasks fall below it" },
      audit: { does: "Every task that broke, named", dealing: "Every gain and every loss, task by task", goal: "Catch any task that training broke", impact: "*Each lost task* is named, not averaged away", why: "a better score can hide a task that broke" },
    };
  }
  const baseStatic = simulateLab(0, budget, false, "shared-prefix");
  const rlStatic = simulateLab(2, budget, false, "shared-prefix"), rlFast = simulateLab(2, budget, true, "shared-prefix");
  const p95 = (r: typeof rlFast) => latencyDistribution(r, 95).threshold.latency;
  const med = (r: typeof rlFast) => median(r.tasks.map((t) => t.latency));
  const costPct = Math.round((100 * (rlFast.correctCost! - baseStatic.correctCost!)) / baseStatic.correctCost!);
  const pctLess = Math.round(100 * (1 - rlFast.correctCost! / rlStatic.correctCost!));
  return {
    flow: { does: "The same 96 requests on one dial, phase by phase", dealing: "Every request, as it waits, reads, reasons and writes", goal: "The same answers for less compute", impact: `*${pctLess}% less compute*, the same ${rlFast.correct} correct answers`, why: "one full turn is the baseline; the inner rings stop sooner" },
    glossary: { does: "The vocabulary of serving, each term tied to this project", dealing: "Nine serving terms", goal: "Say what each one means here", impact: "*9 terms*, each with its own figure", why: "SSE, KV sizing, PagedAttention and more" },
    setup: { does: `Same answers for ${pctLess}% less compute`, dealing: "All 96 requests: how long each waits, its GPU time, and whether it was right", goal: "The same answers for less GPU time, through three levers", impact: `*${f(rlStatic.correctCost!, 2)} → ${f(rlFast.correctCost!, 2)} GPU-s* per correct answer`, why: "free-worker scheduling, prefix reuse, faster prefill and decode" },
    replay: { does: "Every request finishes sooner", dealing: "One request's whole life, then all 96 side by side", goal: "Answer every request sooner, with the answer unchanged", impact: `Median response *${f(med(rlStatic))} → ${f(med(rlFast))} s*`, why: "each request does less GPU work, so every queue drains sooner" },
    composition: { does: "A better model, served more cheaply", dealing: "Two separate levers: what the model knows, and how it is served", goal: "More correct answers, without the bill growing with them", impact: `*${baseStatic.correct} → ${rlFast.correct} of 96* correct, at ${Math.abs(costPct)}% ${costPct > 0 ? "more" : "less"} GPU time per answer`, why: "training raises accuracy; faster serving takes back most of the extra cost" },
    latency: { does: "Shorter queues, faster answers", dealing: "The queue: what a person sending a request feels", goal: "Shorten the wait of the slowest requests", impact: `The slowest 5% of requests: *${f(p95(rlStatic))} → ${f(p95(rlFast))} s*`, why: "workers free up sooner, so the requests at the back wait far less" },
    film: { does: "Four moves, each shown and then measured", dealing: "The same 96 requests, changing one thing at a time", goal: "Find out what each lever really saves", impact: `*${f(rlStatic.correctCost!, 2)} → ${f(rlFast.correctCost!, 2)} GPU-s* per correct answer`, why: "scheduling, then prefix reuse, then faster execution" },
    pressure: { does: "Long prompts stop stalling live answers", dealing: "Long prompts and live answers share every GPU step", goal: "Never let a long prompt freeze an answer mid-stream", impact: `Worst pause *${f(PRESSURE_GAP.whole)} → ${f(PRESSURE_GAP.chunked, 1)} ms*`, why: "the prompt is read in chunks between answer steps" },
    draft: { does: "A small draft model predicts tokens, the large model verifies them", dealing: "The large model writes one word per full pass", goal: "Let a small model guess ahead, and verify many words in one pass", impact: "*12 → 3* serial calls of the large model", why: "a small model drafts; the large one checks many words at once" },
    cache: { does: "Each request goes to where its prompt is already cached", dealing: "Several replicas: which one should take this request?", goal: "Send it to where its prompt is already in memory", impact: `First token *${CACHE_DELTA} ms sooner*`, why: "the router knows where each prefix is already cached" },
    overlap: { does: "The CPU prepares the next step while the GPU runs this one", dealing: "The GPU waits while the CPU prepares its next step", goal: "Prepare the next step during this one", impact: `Four steps: *${OVERLAP.baseline.finish} → ${OVERLAP.overlapped.finish} ms*`, why: "the CPU prepares the next step while the GPU runs this one" },
    map: { does: "Every mechanism working together on four requests", dealing: "Every serving mechanism on one clock", goal: "See how they work together on four requests", impact: "*10 mechanisms*, one system", why: "requests A to D, on one serving clock" },
  };
}

const END = 5600, OUT = 760, BACK = 520;
const EASE = "cubic-bezier(.65,0,.35,1)";

export function ModuleBrief({ item, brief, path, onDone }: { item: ShowItem; brief: Brief; path: string; onDone: () => void }) {
  const tr = useTr();
  const done = useRef(onDone);
  useEffect(() => { done.current = onDone; });
  const card = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0);
  const [leaving, setLeaving] = useState(false);
  // From the rail's own title card to the middle of the screen, colour fading in; then back.
  const fromRail = () => {
    const c = card.current, tile = document.querySelector<HTMLElement>(`[data-rail-key="${item.key}"]`);
    if (!c || !tile) return "translateY(12px) scale(.96)";
    const a = tile.getBoundingClientRect();
    const t = c.style.transform;
    c.style.transform = "none";
    const b = c.getBoundingClientRect();
    c.style.transform = t;
    return `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`;
  };
  useLayoutEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    card.current?.animate([
      { transform: fromRail(), filter: "grayscale(1) blur(1px)", opacity: 0.5 },
      { transform: "none", filter: "none", opacity: 1 },
    ], { duration: OUT, easing: EASE, fill: "backwards" });
    // the card is measured once, where it rests
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = [OUT - 100, OUT + 500, OUT + 1100].map((ms, i) => window.setTimeout(() => setShown(i + 1), reduced ? 0 : ms));
    timers.push(window.setTimeout(() => {
      setLeaving(true);
      card.current?.animate([{ transform: "none", opacity: 1 }, { transform: fromRail(), opacity: 0 }], { duration: BACK, easing: EASE, fill: "forwards" });
    }, reduced ? 2800 : END - BACK));
    timers.push(window.setTimeout(() => done.current(), reduced ? 3200 : END));
    const end = () => done.current();
    window.addEventListener("keydown", end);
    return () => { timers.forEach((t) => window.clearTimeout(t)); window.removeEventListener("keydown", end); };
    // see above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return createPortal(
    <div className="mb-veil" data-leaving={leaving || undefined} role="dialog" aria-label={`${tr(item.title)}: ${tr("what this is")}`} onClick={() => done.current()}>
      <div ref={card} className="mb-card">
        <span className="ts-glyph rl-glyph mb-glyph" aria-hidden="true">{item.Glyph && <item.Glyph />}</span>
        <div className="mb-text">
          <span className="mb-path">{tr(path)}</span>
          <h3>{tr(item.title)}</h3>
          <p className="mb-does" data-on>{tr(brief.does)}</p>
          <p className="mb-goal" data-on={shown > 1 || undefined}>{tr(brief.goal)}</p>
          <p className="mb-impact" data-on={shown > 2 || undefined}>{shown > 2 && highlight(tr(brief.impact))}</p>
        </div>
      </div>
      <span className="mb-skip">{tr("Click anywhere to start")}</span>
    </div>,
    document.body,
  );
}

/**
 * In the Summary, each module is introduced before it plays: its title steps out of the rail to the
 * middle of the screen, says in one sentence how to read what comes, and goes back.
 */
export function IntroCard({ item, text, ms }: { item: ShowItem; text: string; ms: number }) {
  const tr = useTr();
  const card = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const c = card.current, tile = document.querySelector<HTMLElement>(`[data-rail-key="${item.key}"]`);
    if (!c || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const b = c.getBoundingClientRect(), a = tile?.getBoundingClientRect();
    const from = a ? `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})` : "translateY(12px) scale(.96)";
    c.animate([{ transformOrigin: "0 0", transform: from, opacity: 0.4 }, { transformOrigin: "0 0", transform: "none", opacity: 1 }], { duration: 620, easing: EASE, fill: "backwards" });
    c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: ms - 300, fill: "forwards" });
  }, [item.key, ms]);
  return createPortal(
    <div className="mb-veil mb-intro" aria-live="polite">
      <div ref={card} className="mi-card">
        <span className="mi-art" aria-hidden="true">{item.Glyph && <item.Glyph />}</span>
        <h3>{tr(item.title)}</h3>
        {item.term && <em>{tr(item.term)}</em>}
        <p>{highlight(tr(text))}</p>
      </div>
    </div>,
    document.body,
  );
}

/**
 * The end of the summary: go through everything in detail, or on to the next project.
 * Going through it is the default and starts by itself after a moment.
 */
export type ChoiceOption = { title: string; detail: string; href?: string; onPick?: () => void };
const CHOICE_MS = 14000;
export function ChoiceCard({ headline, study, onward, auto }: { headline: string; study: ChoiceOption; onward: ChoiceOption; auto: boolean }) {
  const tr = useTr();
  const go = useRef(study.onPick);
  useEffect(() => { go.current = study.onPick; });
  useEffect(() => {
    if (!auto) return;
    const id = window.setTimeout(() => go.current?.(), CHOICE_MS);
    return () => window.clearTimeout(id);
  }, [auto]);
  const option = (o: ChoiceOption, primary: boolean) => {
    const body = (
      <>
        <strong>{tr(o.title)}</strong>
        <span>{tr(o.detail)}</span>
        {primary && auto && (
          <svg className="ts-ring" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" /><circle cx="10" cy="10" r="8" className="ts-ring-run" style={{ animation: `ts-ring ${CHOICE_MS}ms linear forwards` }} /></svg>
        )}
      </>
    );
    return o.href
      ? <a key={o.title} className="mc-option" data-primary={primary || undefined} href={o.href}>{body}</a>
      : <button key={o.title} type="button" className="mc-option" data-primary={primary || undefined} onClick={o.onPick}>{body}</button>;
  };
  return createPortal(
    <div className="mb-veil mc-veil" role="dialog" aria-label={tr("Where to next")}>
      <div className="mc-card">
        <p className="mc-head">{highlight(tr(headline))}</p>
        <div className="mc-options">{option(study, true)}{option(onward, false)}</div>
      </div>
    </div>,
    document.body,
  );
}
