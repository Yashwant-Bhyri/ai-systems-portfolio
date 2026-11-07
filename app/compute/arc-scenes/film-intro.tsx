"use client";

import { inferenceStoryRuns } from "../lab-story-data";
import type { LabRun } from "../lab-simulation";
import { ease, prog } from "../../exhibit/engine";
import type { ArcBeat, SceneProps } from "../stagecraft/module-arc";

/* The cheaper-execution pathway opens on its problem: what the baseline costs,
   where each request's time goes, and the three levers that attack each part. */
const R = inferenceStoryRuns("shared-prefix");
const mean = (r: LabRun, k: "queueSeconds" | "prefill" | "decode") => r.tasks.reduce((a, t) => a + t[k], 0) / r.tasks.length;
const BASE = R[0];
const f = (v: number, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const MS = 12500;
const LEVERS = [
  { n: 1, name: "Free-worker scheduling", part: "Waiting for a worker", value: mean(BASE, "queueSeconds"), d: 1, does: "no worker sits idle while a request waits", tone: "#ff8f86" },
  { n: 2, name: "Prefix reuse", part: "Reading the prompt", value: mean(BASE, "prefill"), d: 3, does: "a shared document is read once, then referenced", tone: "#ffc267" },
  { n: 3, name: "Faster prefill & decode", part: "Writing the answer", value: mean(BASE, "decode"), d: 1, does: "FP8 weights and KV: half the bytes per token", tone: "#b8e986" },
] as const;

function CheapIntro({ t }: SceneProps) {
  const head = ease.out(prog(t, 100, 800));
  const picked = t >= 9800;
  return (
    <div className="ci-board">
      <p className="ci-problem" style={{ opacity: head, transform: `translateY(${(1 - head) * 8}px)` }}>
        Today the same 96 requests give <b>{BASE.correct} correct answers</b> at <b>{f(BASE.correctCost!, 2)} GPU-s each</b>, and the slowest 5% wait <b>{f(BASE.p95)} s</b>.
      </p>
      <p className="ci-depends" style={{ opacity: prog(t, 1800, 2500) }}>
        Serving the same intelligence for less depends on <b>three things</b>. Here is where one average request&rsquo;s time goes:
      </p>
      <ol className="ci-levers">
        {LEVERS.map((l, i) => {
          const at = 2900 + i * 2000;
          const k = ease.out(prog(t, at, at + 700));
          const lit = picked ? i === 0 : t >= at && t < at + 2000;
          return (
            <li key={l.n} className="ci-lever" data-lit={lit || undefined} data-quiet={picked && i !== 0 ? true : undefined} style={{ opacity: k, transform: `translateY(${(1 - k) * 12}px)`, ["--ci-tone" as string]: l.tone }}>
              <span className="ci-part">{l.part}</span>
              <strong className="ci-value">{f(l.value, l.d)}<small> s</small></strong>
              <i className="ci-arrow" aria-hidden="true">→</i>
              <span className="ci-name"><em>{l.n}</em>{l.name}</span>
              <span className="ci-does">{l.does}</span>
            </li>
          );
        })}
      </ol>
      <p className="ci-next" style={{ opacity: prog(t, 10000, 10700) }}>We pull them one at a time, against the same 96 requests. <b>First, the baseline they are measured against.</b></p>
    </div>
  );
}

export const CHEAP_INTRO: ArcBeat = {
  label: "where the time goes",
  title: "Same intelligence, cheaper execution: what the baseline costs, and why",
  ms: MS,
  Scene: CheapIntro,
  meter: [
    [0, `Baseline: ${f(BASE.correctCost!, 2)} GPU-s per correct answer`],
    [2900, `Lever 1: an average request waits ${f(mean(BASE, "queueSeconds"))} s for a worker`],
    [4900, `Lever 2: it spends ${f(mean(BASE, "prefill"), 3)} s reading a prompt that is usually already cached`],
    [6900, `Lever 3: it spends ${f(mean(BASE, "decode"), 1)} s writing the answer, and that is where the GPU time goes`],
    [9800, "One lever at a time, starting from the baseline"],
  ],
};
