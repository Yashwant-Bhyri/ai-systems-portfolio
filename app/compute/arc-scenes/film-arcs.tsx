"use client";

import { inferenceStoryRuns } from "../lab-story-data";
import type { LabRun, Workload } from "../lab-simulation";
import { ease, prog } from "../../exhibit/engine";
import { makeImpact, type ArcBeat, type SceneProps } from "../stagecraft/module-arc";

/* The cheaper-execution pathway's three techniques, each told around its film
   chapter: how it works (a general scene) before the chapter, the measured
   impact (the lab model's own runs) after it. */
const C = { a: "#8fb4ff", b: "#b8e986", c: "#63d4df", doc: "#ffc267", q: "#f3a0bc", idle: "#ff8f86", ink: "#eef2f6", slate: "#4a5662" };
const sweep = (t: number, ms: number, end: number) => ease.io(prog(t, 700, ms - 2600)) * end;
const RUNS: Record<Workload, LabRun[]> = { "shared-prefix": inferenceStoryRuns("shared-prefix"), interactive: inferenceStoryRuns("interactive") };
const fmt = (v: number, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

/* ── Continuous batching ─────────────────────────────────────────────── */
type Job = { id: number; w: 0 | 1; a: number; b: number };
const STATIC: Job[] = [{ id: 1, w: 0, a: 0, b: 6 }, { id: 2, w: 1, a: 0, b: 3 }, { id: 3, w: 0, a: 6, b: 10 }, { id: 4, w: 1, a: 6, b: 13 }, { id: 5, w: 0, a: 13, b: 15 }, { id: 6, w: 1, a: 13, b: 18 }];
const CONT: Job[] = [{ id: 1, w: 0, a: 0, b: 6 }, { id: 2, w: 1, a: 0, b: 3 }, { id: 3, w: 1, a: 3, b: 7 }, { id: 4, w: 0, a: 6, b: 13 }, { id: 5, w: 1, a: 7, b: 9 }, { id: 6, w: 1, a: 9, b: 14 }];
const PAL = [C.a, C.b, C.c, C.doc, C.q, "#c7a6ff"];
const BX = 300, BPX = 42;
function Workers({ jobs, y, now, title, note, finish }: { jobs: Job[]; y: number; now: number; title: string; note: string; finish: number }) {
  const ends = [0, 1].map((w) => jobs.filter((j) => j.w === w));
  const idles = ends.flatMap((list) => list.slice(1).flatMap((j, i) => (j.a > list[i].b ? [{ w: j.w, a: list[i].b, b: j.a }] : [])))
    .concat(ends.flatMap((list) => (list.at(-1)!.b < finish ? [{ w: list[0].w, a: list.at(-1)!.b, b: finish }] : [])));
  return <g>
    <text x={0} y={y + 26} className="ma-k">{title}</text>
    <text x={0} y={y + 46} className="ma-l">{note}</text>
    {[0, 1].map((w) => <text key={w} x={BX - 14} y={y + 26 + w * 50} textAnchor="end" className="ma-l">worker {w + 1}</text>)}
    {jobs.map((j) => {
      const r = Math.min(j.b, now);
      if (r <= j.a) return null;
      return <g key={j.id}>
        <rect x={BX + j.a * BPX + 1} y={y + 8 + j.w * 50} width={Math.max(0, (r - j.a) * BPX - 2)} height={30} rx={4} fill={PAL[j.id - 1]} opacity={0.88} />
        {r >= j.b && <text x={BX + ((j.a + j.b) / 2) * BPX} y={y + 28 + j.w * 50} textAnchor="middle" className="ma-l" style={{ fill: "#0b1016" }}>R{j.id}</text>}
      </g>;
    })}
    {idles.filter((g) => now > g.a).map((g, i) => <rect key={i} x={BX + g.a * BPX + 1} y={y + 9 + g.w * 50} width={Math.max(0, (Math.min(g.b, now) - g.a) * BPX - 2)} height={28} rx={3} fill="none" stroke={C.idle} strokeDasharray="4 3" />)}
    {now >= finish && <text x={BX + finish * BPX} y={y - 4} textAnchor="end" className="ma-n" style={{ fill: C.ink }}>all done at {finish}</text>}
  </g>;
}
function Batching({ t }: SceneProps) {
  const now = sweep(t, BATCH_MS, 18);
  return <svg viewBox="0 0 1100 400" role="img" aria-label="Six requests on two workers: fixed pairs leave a worker idle until its partner finishes; giving the next request to the first free worker finishes at 14 instead of 18">
    <Workers jobs={STATIC} y={40} now={now} title="Fixed pairs" note="next pair waits for both" finish={18} />
    <Workers jobs={CONT} y={210} now={now} title="First free worker" note="next request starts at once" finish={14} />
    <path d={`M${BX + now * BPX} 16V320`} stroke="#eef2f6" strokeOpacity={0.35} />
    <g transform={`translate(${BX} 352)`}>
      <rect width={14} height={14} rx={2} fill="none" stroke={C.idle} strokeDasharray="3 2" /><text x={22} y={12} className="ma-l">a worker waiting while requests queue</text>
      <text x={0} y={36} className="ma-l">same requests, same work: only their start times move</text>
    </g>
  </svg>;
}

/* ── Prefix reuse ─────────────────────────────────────────────────────── */
const DOC = 8, QN = 1.5, RX = 270, RPX = 27;
function ReuseRow({ y, now, reuse, title, note }: { y: number; now: number; reuse: boolean; title: string; note: string }) {
  // three requests in series on one worker: [document][question] each, or document once then questions only
  const segs: { a: number; b: number; kind: "doc" | "q" | "ref"; r: number }[] = [];
  let at = 0;
  for (let r = 0; r < 3; r++) {
    if (!reuse || r === 0) { segs.push({ a: at, b: at + DOC, kind: "doc", r }); at += DOC; }
    else segs.push({ a: at, b: at, kind: "ref", r });
    segs.push({ a: at, b: at + QN, kind: "q", r }); at += QN;
  }
  return <g>
    <text x={0} y={y + 26} className="ma-k">{title}</text>
    <text x={0} y={y + 46} className="ma-l">{note}</text>
    {segs.map((s, i) => {
      if (s.kind === "ref") return now >= s.a && <g key={i}>
        <path d={`M${RX + (DOC / 2) * RPX} ${y + 4}C${RX + (DOC / 2) * RPX} ${y - 22} ${RX + s.a * RPX} ${y - 22} ${RX + s.a * RPX} ${y + 4}`} fill="none" stroke={C.c} strokeDasharray="4 3" strokeWidth={1.5} />
      </g>;
      const r = Math.min(s.b, now);
      if (r <= s.a) return null;
      return <rect key={i} x={RX + s.a * RPX + 1} y={y + 8} width={Math.max(0, (r - s.a) * RPX - 2)} height={36} rx={4} fill={s.kind === "doc" ? C.doc : C.q} opacity={0.88} />;
    })}
    {reuse && now >= DOC && <g transform={`translate(${RX} ${y + 58})`}>{Array.from({ length: 8 }, (_, i) => <rect key={i} x={i * 20} width={16} height={12} rx={2} fill={C.c} opacity={0.85} />)}<text x={172} y={11} className="ma-l" style={{ fill: C.c }}>the document&rsquo;s KV pages, kept</text></g>}
    {now >= at && (reuse
      ? <text x={RX + at * RPX + 16} y={y + 33} className="ma-n" style={{ fill: C.ink }}>1 document + 3 questions</text>
      : <text x={RX + at * RPX} y={y - 6} textAnchor="end" className="ma-n" style={{ fill: C.ink }}>3 documents + 3 questions</text>)}
  </g>;
}
function Reuse({ t }: SceneProps) {
  const now = sweep(t, REUSE_MS, 3 * (DOC + QN));
  return <svg viewBox="0 0 1100 400" role="img" aria-label="Three requests over the same document: without reuse each one reads the document again; with reuse the first one's KV pages are kept and the others read only their question">
    <ReuseRow y={50} now={now} reuse={false} title="Without reuse" note="every request reads the document" />
    <ReuseRow y={210} now={now} reuse title="With prefix reuse" note="read once, referenced after" />
    <g transform={`translate(${RX} 372)`}>
      <rect width={14} height={14} rx={2} fill={C.doc} /><text x={22} y={12} className="ma-l">reading the shared document (prefill)</text>
      <rect x={330} width={14} height={14} rx={2} fill={C.q} /><text x={352} y={12} className="ma-l">reading each question</text>
    </g>
  </svg>;
}

/* ── Faster prefill & decode ──────────────────────────────────────────── */
const IN = 12, OUT = 8, FX = 270, FPX = 21;
const RATES = { base: { pre: 1.2, dec: 2.8 }, fast: { pre: 0.95, dec: 2.25 } };
function RateRow({ y, now, r, title }: { y: number; now: number; r: { pre: number; dec: number }; title: string }) {
  const pre = IN * r.pre, end = pre + OUT * r.dec;
  const pk = Math.min(1, now / pre);
  return <g>
    <text x={0} y={y + 22} className="ma-k">{title}</text>
    <text x={0} y={y + 42} className="ma-l">{r.pre} ms per input token</text>
    <text x={0} y={y + 60} className="ma-l">{r.dec} ms per output token</text>
    <rect x={FX} y={y + 6} width={Math.max(0, Math.min(now, pre) * FPX - 2)} height={44} rx={4} fill={C.doc} opacity={0.25} />
    {Array.from({ length: IN }, (_, i) => <rect key={i} x={FX + 6 + (i % 6) * ((pre * FPX - 16) / 6)} y={y + 12 + Math.floor(i / 6) * 17} width={(pre * FPX - 16) / 6 - 4} height={13} rx={2} fill={C.doc} opacity={0.2 + 0.75 * pk} />)}
    {Array.from({ length: OUT }, (_, i) => {
      const a = pre + i * r.dec, b = a + r.dec, k = prog(now, a, b);
      return k > 0 && <rect key={i} x={FX + a * FPX + 1} y={y + 6} width={Math.max(0, k * r.dec * FPX - 3)} height={44} rx={3} fill={C.b} opacity={0.88} />;
    })}
    {now >= end && <text x={FX + end * FPX} y={y - 6} textAnchor="end" className="ma-n" style={{ fill: C.ink }}>done in {fmt(end, 1)} ms</text>}
  </g>;
}
function Rates({ t }: SceneProps) {
  const now = sweep(t, RATES_MS, IN * RATES.base.pre + OUT * RATES.base.dec);
  return <svg viewBox="0 0 1100 400" role="img" aria-label="The same 12 input and 8 output tokens at the baseline and the faster declared rates">
    <RateRow y={50} now={now} r={RATES.base} title="Baseline kernels" />
    <RateRow y={200} now={now} r={RATES.fast} title="Faster kernels" />
    <g transform={`translate(${FX} 372)`}>
      <rect width={14} height={14} rx={2} fill={C.doc} /><text x={22} y={12} className="ma-l">12 input tokens, read together (prefill)</text>
      <rect x={380} width={14} height={14} rx={2} fill={C.b} /><text x={402} y={12} className="ma-l">8 output tokens, one at a time (decode)</text>
    </g>
  </svg>;
}

/* ── Result figures ───────────────────────────────────────────────────── */
function TwoWorkloads({ metric, label, digits = 0, from, to }: { metric: (r: LabRun) => number; label: string; digits?: number; from: number; to: number }) {
  function Fig({ t }: SceneProps) {
    const k = ease.out(prog(t, 500, 2200));
    const rows: [string, number, number][] = [["one shared document", metric(RUNS["shared-prefix"][from]), metric(RUNS["shared-prefix"][to])], ["different documents", metric(RUNS.interactive[from]), metric(RUNS.interactive[to])]];
    return <svg viewBox="0 0 560 120" role="img" aria-label={`${label} for both workloads`}>
      <text x={0} y={14} className="ma-l">{label}, both workloads</text>
      {rows.map(([l, a, b], i) => <g key={l} transform={`translate(0 ${34 + i * 40})`}>
        <text x={0} y={16} className="ma-l">{l}</text>
        {/* each workload on its own scale: the change, not the absolute size, is the point */}
        <rect x={170} y={0} width={(a / Math.max(a, b)) * 250 * k} height={9} rx={2} fill="#9cc5f5" opacity={0.85} />
        <rect x={170} y={11} width={(b / Math.max(a, b)) * 250 * k} height={9} rx={2} fill={C.b} opacity={0.9} />
        <text x={560} y={16} textAnchor="end" className="ma-l" style={{ fill: C.ink }}>{fmt(a, digits)} → {fmt(b, digits)}</text>
      </g>)}
    </svg>;
  }
  return Fig;
}
function Ladder({ t }: SceneProps) {
  const k = ease.out(prog(t, 500, 2400));
  const runs = RUNS["shared-prefix"];
  const names = ["baseline", "+ continuous batching", "+ prefix reuse", "+ faster kernels"];
  const max = runs[0].correctCost!;
  return <svg viewBox="0 0 560 150" role="img" aria-label="GPU-seconds per correct answer after each technique">
    <text x={0} y={14} className="ma-l">GPU-s per correct answer, one shared document</text>
    {names.map((n, i) => <g key={n} transform={`translate(0 ${30 + i * 28})`}>
      <text x={0} y={14} className="ma-l">{n}</text>
      <rect x={190} y={2} width={(runs[i].correctCost! / max) * 280 * k} height={16} rx={2} fill={i === 3 ? C.b : "#9cc5f5"} opacity={0.85} />
      <text x={560} y={14} textAnchor="end" className="ma-l" style={{ fill: C.ink }}>{fmt(runs[i].correctCost!, 2)}</text>
    </g>)}
  </svg>;
}

const BATCH_MS = 11500, REUSE_MS = 11000, RATES_MS = 10500;

export type FilmArc = { name: string; mechanism: ArcBeat; impact: (workload: Workload) => ArcBeat };
/** Keyed by the film chapter each technique belongs to. */
export const FILM_ARCS: Record<number, FilmArc> = {
  1: {
    name: "Continuous batching",
    mechanism: { label: "How it works", title: "Continuous batching: a free worker takes the next request at once", ms: BATCH_MS, Scene: Batching },
    impact: (w) => {
      const [a, b] = [RUNS[w][0], RUNS[w][1]];
      return { label: "Impact", title: "Less waiting, the same GPU work", ms: 8500, Scene: makeImpact({
        from: a.p95, to: b.p95, unit: "s", digits: w === "interactive" ? 1 : 0, what: "p95 response time across the 96 requests",
        cause: `Requests no longer wait for a partner to finish; the GPU work is unchanged at ${fmt(b.gpuSeconds)} GPU-s.`,
        base: "Fixed pairs", optimized: "First free worker",
        Figure: TwoWorkloads({ metric: (r) => r.p95, label: "p95 response, s", from: 0, to: 1, digits: 0 }),
      }) };
    },
  },
  2: {
    name: "Prefix reuse",
    mechanism: { label: "How it works", title: "Prefix reuse: read a shared document once, keep its KV pages, reference them after", ms: REUSE_MS, Scene: Reuse },
    impact: (w) => {
      const [a, b] = [RUNS[w][1], RUNS[w][2]];
      return { label: "Impact", title: w === "interactive" ? "Nothing shared, nothing to reuse" : "Repeated reading removed", ms: 8500, Scene: makeImpact({
        from: a.gpuSeconds, to: b.gpuSeconds, unit: "GPU-s", digits: 0, what: "GPU work for the 96 requests",
        cause: w === "interactive" ? "Every request brings a different document, so no prefix is ready to reuse; the work is unchanged." : "The shared document is prefilled once; later requests reference its KV pages and prefill only their own question.",
        base: "Read every time", optimized: "Read once, reuse",
        Figure: TwoWorkloads({ metric: (r) => r.gpuSeconds, label: "GPU-s", from: 1, to: 2 }),
      }) };
    },
  },
  3: {
    name: "Faster prefill & decode",
    mechanism: { label: "How it works", title: "Faster kernels: the same tokens, less time per token", ms: RATES_MS, Scene: Rates },
    impact: (w) => {
      const [a, b] = [RUNS[w][2], RUNS[w][3]];
      return { label: "Impact", title: "The same answers, cheaper per answer", ms: 8500, Scene: makeImpact({
        from: a.correctCost!, to: b.correctCost!, unit: "GPU-s per correct answer", digits: 2, what: "Cost of each correct answer",
        cause: `Declared rates fall from ${RATES.base.pre} to ${RATES.fast.pre} ms per input token and from ${RATES.base.dec} to ${RATES.fast.dec} ms per output token; tokens and answers are unchanged.`,
        base: "Baseline kernels", optimized: "Faster kernels",
        Figure: Ladder,
      }) };
    },
  },
};
