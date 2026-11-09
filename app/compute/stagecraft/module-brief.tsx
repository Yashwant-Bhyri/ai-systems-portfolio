"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTr } from "../../exhibit/i18n";
import { highlight } from "./stage-meter";
import type { ShowItem } from "./title-show";
import { POLICIES, simulateLab, type Workload } from "../lab-simulation";
import { FRONTIER_COST } from "../../exhibit/policy/data.ts";
import { latencyDistribution } from "../load-latency-model";
import { CACHE_DELTA, OVERLAP, PRESSURE_GAP } from "../serving-rail-meta";
import "./module-brief.css";

/** Cards are drawn over the whole page, outside the lab, so they take the lab's accent with them. */
const labAccent = () => (typeof document === "undefined" ? "" : document.querySelector(".rs-laboratory")?.className.match(/vx-accent-\w+/)?.[0] ?? "");

/**
 * Before a module opens for the first time the whole screen blurs and its title card
 * steps out of the rail to the middle, saying what we are dealing with, the goal, and
 * the impact with its number. It then returns to the rail. Once per visit; a click or key ends it.
 */
export type Brief = { does: string; dealing: string; goal: string; impact: string; why: string };

const f = (v: number, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return (s[47] + s[48]) / 2; };

/** Every number is read from the lab's own model, so a brief cannot drift from its module. */
/**
 * The head reads the figure as the visitor has set it: their checkpoint, their workload.
 * Left unset, it is the RL checkpoint on the shared-document workload, as the modules open.
 */
export function moduleBriefs(training: boolean, budget: number, chosen: { policy?: number; workload?: Workload } = {}): Record<string, Brief> {
  const policy = chosen.policy ?? 2, workload = chosen.workload ?? "shared-prefix";
  if (training) {
    const base1 = simulateLab(0, 1), lean = simulateLab(3, 4), base = simulateLab(0, budget), rl = simulateLab(2, budget);
    const r8 = simulateLab(2, 8), lean8 = simulateLab(3, 8), picked = simulateLab(policy, budget);
    const sft1 = simulateLab(1, 1), rl1 = simulateLab(2, 1), rl4 = simulateLab(2, 4);
    const P = (n: number) => `${Math.round((100 * n) / 96)}%`, fewer = Math.round(100 * (1 - lean.tokens / rl4.tokens));
    return {
      manifold: { does: "A 3D view of every task across three models: answer, cost and difficulty", dealing: "Each point is one task; each model is a cloud of points", goal: "See what training changed, and what it did not", impact: `Accuracy *${P(base1.correct)} → ${P(lean.correct)}*`, why: "turn it, or choose any three of six measures" },
      inside: { does: "Which layers training changed, while the model answers one coding task", dealing: "The model's 36 layers, word by word", goal: "See where training really changed how it reasons", impact: "*7 of 50 words* in its answer differ from the base model's", why: "the layers that moved most write the words that changed" },
      learn: { does: "GRPO: attempts that pass the tests become more likely, with no teacher", dealing: "Eight attempts at the same task, and the tests that grade them", goal: "Learn from outcomes, not from examples", impact: `Accuracy *${P(sft1.correct)} → ${P(rl1.correct)}*`, why: "attempts that beat their group's average get written more often" },
      terrain: { does: "Accuracy at each of six training stages, task by task", dealing: "Each ridge is one stage; where it stands above a task, that task is solved", goal: "More right answers at every stage, the hard tasks included", impact: `Accuracy *${P(base1.correct)} → ${P(lean.correct)}*`, why: "the ridges rise furthest over the hardest tasks" },
      frontier: { does: "Accuracy rises, then serving brings the cost back down", dealing: "Accuracy against GPU time per correct answer, move by move", goal: "Far more right answers, without the cost growing with them", impact: `Accuracy *${P(base1.correct)} → ${P(lean.correct)}*, at ${f(FRONTIER_COST.start, 2)} → ${f(FRONTIER_COST.runtime, 2)} GPU-s per correct answer`, why: "training raises accuracy, then the serving runtime takes the cost back down" },
      curves: { does: "Test-time scaling: what more thinking at answer time buys each checkpoint", dealing: `${POLICIES.length} checkpoints, each given more and more GPU time`, goal: "The most correct answers for the least compute", impact: `*${P(r8.correct)}* accuracy for the RL checkpoint at an 8× budget`, why: `Lean RL reaches the same ${P(r8.correct)} for ${lean8.meanCost.toFixed(0)} GPU-s a task, not ${r8.meanCost.toFixed(0)}` },
      fleet: { does: "Elastic RL: a GPU that finishes its rollout trains or publishes at once", dealing: "64 GPUs: training needs every rollout, so all of them wait for the slowest", goal: "Keep every GPU busy between RL steps", impact: "*4 → 7 RL steps* in the same 14 minutes", why: "no barrier: each GPU keeps working and changes role" },
      map: { does: "Which tasks each checkpoint solves", dealing: "One square per task, at every checkpoint", goal: "See which tasks changed, not only the score", impact: policy === 0 ? "*Pick a trained checkpoint* to see which tasks it changed" : `Accuracy *${P(base.correct)} → ${P(picked.correct)}*, ${POLICIES[policy].name} at a ${budget}× thinking budget`, why: "maths, multi-step logic and repository tasks all gain" },
      film: { does: "Four training moves, each shown and then measured", dealing: "One base model and four training moves", goal: "More right answers first, then fewer tokens", impact: `Accuracy *${P(base1.correct)} → ${P(lean.correct)}*, then ${fewer}% fewer tokens`, why: "each move shown, then measured on the same tasks" },
      tasks: { does: "How far up the difficulty the model reaches", dealing: "Every task, stacked from easiest to hardest", goal: "Solve harder tasks, not only more of them", impact: `Accuracy *${P(base.correct)} → ${P(rl.correct)}* at a ${budget}× thinking budget`, why: "ability rises, so harder tasks fall below it" },
      audit: { does: "Regression audit: every task that broke, named", dealing: "Every gain and every loss, task by task", goal: "Catch any task that training broke", impact: "*Each lost task* is named, not averaged away", why: "a better score can hide a task that broke" },
    };
  }
  const baseStatic = simulateLab(0, budget, false, workload);
  const rlStatic = simulateLab(policy, budget, false, workload), rlFast = simulateLab(policy, budget, true, workload);
  const p95 = (r: typeof rlFast) => latencyDistribution(r, 95).threshold.latency;
  const med = (r: typeof rlFast) => median(r.tasks.map((t) => t.latency));
  const costPct = Math.round((100 * (rlFast.correctCost! - baseStatic.correctCost!)) / baseStatic.correctCost!);
  const pctLess = Math.round(100 * (1 - rlFast.correctCost! / rlStatic.correctCost!));
  return {
    flow: { does: "Every request on one dial, phase by phase", dealing: "Every request, as it waits, reads, reasons and writes", goal: "The same answers for less compute", impact: `*${pctLess}% less compute* for the same answers`, why: "one full turn is the baseline; the inner rings stop sooner" },
    glossary: { does: "Every component of the serving system, each tied to this project", dealing: "Nine serving terms", goal: "Say what each one means here", impact: "*9 terms*, each with its own figure", why: "SSE, KV sizing, PagedAttention and more" },
    setup: { does: `Same answers for ${pctLess}% less compute`, dealing: "All 96 requests: how long each waits, its GPU time, and whether it was right", goal: "The same answers for less GPU time, through three levers", impact: `*${f(rlStatic.correctCost!, 2)} → ${f(rlFast.correctCost!, 2)} GPU-s* per correct answer`, why: "free-worker scheduling, prefix reuse, faster prefill and decode" },
    replay: { does: "Every request finishes sooner", dealing: "One request's whole life, then all 96 side by side", goal: "Answer every request sooner, with the answer unchanged", impact: `Median response *${f(med(rlStatic))} → ${f(med(rlFast))} s*`, why: "each request does less GPU work, so every queue drains sooner" },
    composition: { does: "Faster serving pays for most of the better model", dealing: "Two separate levers: what the model knows, and how it is served", goal: "More correct answers, without the bill growing with them", impact: `Accuracy *${Math.round((100 * baseStatic.correct) / 96)}% → ${Math.round((100 * rlFast.correct) / 96)}%*; extra GPU time per answer +${Math.round(100 * (rlStatic.correctCost! / baseStatic.correctCost! - 1))}% → ${costPct > 0 ? "+" : "−"}${Math.abs(costPct)}%`, why: "training raises accuracy; faster serving takes back most of the extra cost" },
    latency: { does: "Shorter queues, faster answers", dealing: "The queue: what a person sending a request feels", goal: "Shorten the wait of the slowest requests", impact: `The slowest 5% of requests: *${f(p95(rlStatic))} → ${f(p95(rlFast))} s*`, why: "workers free up sooner, so the requests at the back wait far less" },
    film: { does: "Three levers, one at a time, each measured", dealing: "The same 96 requests, changing one thing at a time", goal: "Find out what each lever really saves", impact: `*${f(rlStatic.correctCost!, 2)} → ${f(rlFast.correctCost!, 2)} GPU-s* per correct answer`, why: "scheduling, then prefix reuse, then faster execution" },
    pressure: { does: "Long prompts stop stalling live answers", dealing: "Long prompts and live answers share every GPU step", goal: "Never let a long prompt freeze an answer mid-stream", impact: `Worst pause *${f(PRESSURE_GAP.whole, 1)} → ${f(PRESSURE_GAP.chunked, 1)} ms*`, why: "the prompt is read in chunks between answer steps" },
    draft: { does: "A small draft model predicts tokens, the large model verifies them", dealing: "The large model writes one word per full pass", goal: "Let a small model guess ahead, and verify many words in one pass", impact: "*12 → 3* serial calls of the large model", why: "a small model drafts; the large one checks many words at once" },
    cache: { does: "Each request goes to where its prompt is already cached", dealing: "Several replicas: which one should take this request?", goal: "Send it to where its prompt is already in memory", impact: `First token *${CACHE_DELTA} ms sooner*`, why: "the router knows where each prefix is already cached" },
    overlap: { does: "The CPU prepares the next step while the GPU runs this one", dealing: "The GPU waits while the CPU prepares its next step", goal: "Prepare the next step during this one", impact: `Four steps: *${OVERLAP.baseline.finish} → ${OVERLAP.overlapped.finish} ms*`, why: "the CPU prepares the next step while the GPU runs this one" },
    map: { does: "Every mechanism working together on four requests", dealing: "Every serving mechanism on one clock", goal: "See how they work together on four requests", impact: "*10 mechanisms*, one system", why: "requests A to D, on one serving clock" },
  };
}

const END = 5600, OUT = 760, BACK = 520;
const EASE = "cubic-bezier(.65,0,.35,1)";

/** `away`: the lab has scrolled off screen, so the fixed blur steps aside instead of covering other pages. */
export function ModuleBrief({ item, brief, path, onDone, away = false }: { item: ShowItem; brief: Brief; path: string; onDone: () => void; away?: boolean }) {
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
    <div hidden={away} className={`mb-veil ${labAccent()}`} data-leaving={leaving || undefined} role="dialog" aria-label={`${tr(item.title)}: ${tr("what this is")}`} onClick={() => done.current()}>
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
 * middle of the screen and says what it does, what it changed (the number highlighted), and how to read it.
 */
/** `labels`: the parts of the module, numbered, appearing one by one. */
export function IntroCard({ item, text, ms, brief, labels }: { item: ShowItem; text: string; ms: number; brief?: Brief; labels?: readonly string[] }) {
  const tr = useTr();
  const card = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const c = card.current, tile = document.querySelector<HTMLElement>(`[data-rail-key="${item.key}"]`);
    if (!c || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const b = c.getBoundingClientRect(), a = tile?.getBoundingClientRect();
    const from = a ? `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})` : "translateY(12px) scale(.96)";
    c.animate([{ transformOrigin: "0 0", transform: from, opacity: 0.4 }, { transformOrigin: "0 0", transform: "none", opacity: 1 }], { duration: 620, easing: EASE, fill: "backwards" });
  }, [item.key, ms]);
  return createPortal(
    <div className={`mb-veil mb-intro ${labAccent()}`} aria-live="polite" style={{ animation: `mb-veil .4s cubic-bezier(.22,1,.36,1) both, mb-veil-out .35s ease-in ${Math.max(0, ms - 380)}ms forwards` }}>
      <div ref={card} className="mi-card">
        <span className="mi-art" aria-hidden="true">{item.Glyph && <item.Glyph />}</span>
        <h3>{tr(item.title)}</h3>
        {item.term && <em>{tr(item.term)}</em>}
        {brief && <p className="mi-does">{tr(brief.does)}</p>}
        {brief && <p className="mi-impact">{highlight(tr(brief.impact))}</p>}
        <p className="mi-read">{highlight(tr(text))}</p>
        {labels && <ol className="mi-labels">{labels.map((l, i) => <li key={l} style={{ animationDelay: `${700 + i * 450}ms` }}><i>{i + 1}</i>{tr(l)}</li>)}</ol>}
        <i className="mi-time" aria-hidden="true" style={{ animationDuration: `${ms}ms` }} />
      </div>
    </div>,
    document.body,
  );
}

/**
 * Post-training's opening: what was done and why, before any figure. The model as released, then the
 * same model after advanced post-training, then the techniques that did it. Every number is the lab's.
 */
export type PurposeSide = { title: string; rows: readonly { label: string; value: string; note?: string }[] };
export type TechGroup = { title: string; items: readonly string[] };
export function PurposeCard({ headline, before, after, techniques, ms }: { headline: string; before: PurposeSide; after: PurposeSide; techniques: readonly TechGroup[]; ms: number }) {
  const tr = useTr();
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = [window.setTimeout(() => setStep(1), ms * 0.3), window.setTimeout(() => setStep(2), ms * 0.62)];
    return () => t.forEach((x) => window.clearTimeout(x));
  }, [ms]);
  const side = (s: PurposeSide, tone: string, on: boolean) => (
    <section className="pc-side" data-tone={tone} data-on={on || undefined}>
      <h4>{tr(s.title)}</h4>
      {s.rows.map((r) => <div key={r.label} className="pc-row"><span>{tr(r.label)}</span><b>{r.value}</b>{r.note && <small>{tr(r.note)}</small>}</div>)}
    </section>
  );
  return createPortal(
    <div className={`mb-veil mb-intro pc-veil ${labAccent()}`} aria-live="polite" style={{ animation: `mb-veil .4s cubic-bezier(.22,1,.36,1) both, mb-veil-out .35s ease-in ${Math.max(0, ms - 380)}ms forwards` }}>
      <div className="pc-card">
        <p className="pc-head">{highlight(tr(headline))}</p>
        <div className="pc-split">{side(before, "base", true)}<i aria-hidden="true">→</i>{side(after, "after", step >= 1)}</div>
        <div className="pc-groups" data-on={step >= 2 || undefined}>
          {techniques.map((g, i) => (
            <section key={g.title} className="pc-group"><h5><i>{i + 1}</i>{tr(g.title)}</h5><ul className="pc-tech" data-on="">{g.items.map((t) => <li key={t}>{tr(t)}</li>)}</ul></section>
          ))}
        </div>
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
export function ChoiceCard({ headline, study, onward, auto, also = [], away = false }: { headline: string; study: ChoiceOption; onward: ChoiceOption; auto: boolean; also?: readonly ChoiceOption[]; away?: boolean }) {
  const tr = useTr();
  const go = useRef(study.onPick);
  useEffect(() => { go.current = study.onPick; });
  // The countdown waits while the pointer is on the card.
  const [hold, setHold] = useState(false);
  useEffect(() => {
    if (!auto || hold) return;
    const id = window.setTimeout(() => go.current?.(), CHOICE_MS);
    return () => window.clearTimeout(id);
  }, [auto, hold]);
  const option = (o: ChoiceOption, primary: boolean) => {
    const body = (
      <>
        <strong>{tr(o.title)}</strong>
        <span>{tr(o.detail)}</span>
        {primary && auto && (
          <svg className="ts-ring" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" /><circle cx="10" cy="10" r="8" className="ts-ring-run" style={{ animation: `ts-ring ${CHOICE_MS}ms linear forwards`, animationPlayState: hold ? "paused" : "running" }} /></svg>
        )}
      </>
    );
    return o.href
      ? <a key={o.title} className="mc-option" data-primary={primary || undefined} href={o.href}>{body}</a>
      : <button key={o.title} type="button" className="mc-option" data-primary={primary || undefined} onClick={o.onPick}>{body}</button>;
  };
  return createPortal(
    <div hidden={away} className={`mb-veil mc-veil ${labAccent()}`} role="dialog" aria-label={tr("Where to next")}>
      <div className="mc-card" onPointerEnter={() => setHold(true)} onPointerLeave={() => setHold(false)}>
        <p className="mc-head">{highlight(tr(headline))}</p>
        <div className="mc-options" data-count={2 + also.length}>{option(study, true)}{also.map((o) => option(o, false))}{option(onward, false)}</div>
      </div>
    </div>,
    document.body,
  );
}
