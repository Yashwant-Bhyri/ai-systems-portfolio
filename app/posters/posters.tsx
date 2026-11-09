"use client";

import { useEffect, useRef, useState } from "react";
import { ALSO, COST, LAB, UNDER_LOAD, fmt, labHref, INFERENCE_LEDGER, TRAINING_LEDGER } from "./poster-data";
import { DEPTH } from "./poster-data";
import "./posters.css";

/** Plays once the poster is on screen, then loops slowly; reduced motion shows the final frame. */
function usePhase(steps: readonly number[], loop: number, threshold = 0.45) {
  const root = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { const id = requestAnimationFrame(() => setPhase(steps.length)); return () => cancelAnimationFrame(id); }
    let timers: number[] = [];
    const run = () => {
      timers.forEach(clearTimeout);
      timers = steps.map((ms, i) => window.setTimeout(() => setPhase(i + 1), ms));
      timers.push(window.setTimeout(() => { setPhase(0); timers.push(window.setTimeout(run, 400)); }, loop));
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) run(); else { timers.forEach(clearTimeout); setPhase(0); } }, { threshold });
    io.observe(el);
    return () => { io.disconnect(); timers.forEach(clearTimeout); };
  }, [steps, loop, threshold]);
  return { root, phase };
}

/* ── A · The ledger ─────────────────────────────────────────────────── */
type Slice = { key: string; title: string; delta: string; cause: string; from: number; to: number; color: string };
export type LedgerSpec = {
  domain: "inference" | "training";
  title: string; claim: string; cta: string;
  /** shrink: the bar loses its slices (less work); grow: the bar gains them (more solved). */
  mode: "shrink" | "grow";
  scale: number; start: number; end: number; digits: number; unit: string;
  /** Written after the big number, e.g. "%". */
  suffix?: string;
  slices: readonly Slice[];
  note?: { title: string; text: string };
  measuresTitle: string;
  /** A measure shows before → after with two bars, or a single value when it is not a change. */
  measures: readonly { key: string; title: string; from?: string; to: string; unit: string; a?: number; b?: number }[];
  also: readonly { key: string; title: string; value: string }[];
};

const A_STEPS = [700, 1900, 3300, 4300] as const;
export function LedgerPoster({ spec, live = false }: { spec: LedgerSpec; live?: boolean }) {
  const { root, phase } = usePhase(A_STEPS, live ? 15000 : 16000, live ? 0.02 : 0.45);
  // Once the bar is built, the page walks its results one at a time, so it never sits still.
  const [spot, setSpot] = useState(-1);
  const spots = spec.slices.length + spec.measures.length;
  useEffect(() => {
    if (!live || phase < A_STEPS.length) return;
    let n = 0;
    const first = window.setTimeout(() => setSpot(0), 400);
    const id = window.setInterval(() => { n += 1; setSpot(n % spots); }, 1300);
    return () => { window.clearTimeout(first); window.clearInterval(id); setSpot(-1); };
  }, [live, phase, spots]);
  const pct = (v: number) => `${(100 * v) / spec.scale}%`;
  const shrink = spec.mode === "shrink";
  const keepTo = shrink ? spec.end : spec.start;
  const href = (key: string) => `${DEPTH[spec.domain]}#${spec.domain === "inference" ? "inference" : "post-training"}-study/${key}`;
  // grow: the number climbs slice by slice; shrink: it lands once the slices have fallen
  const shown = shrink ? (phase >= 4 ? spec.end : spec.start) : spec.slices.reduce((v, sl, i) => (phase >= i + 2 ? sl.to : v), spec.start);
  return (
    <section ref={root} data-live={live || undefined} data-spotting={spot >= 0 || undefined} id={`${spec.domain === "inference" ? "inference" : "post-training"}-poster`} className={`pa pa-${spec.mode} vx-page vx-accent-${spec.domain === "inference" ? "amber" : "rose"}`} data-vx-page data-phase={phase}>
      <header className="pa-head">
        <h2>{spec.title}</h2>
        <p>{spec.claim}</p>
        <a className="pa-cta" href={DEPTH[spec.domain]}>{spec.cta}</a>
      </header>
      <div className="pa-ledger">
        <div className="pa-row">
          <b className="pa-num cx-hero-num" data-base={shrink || undefined} data-hero={(!shrink && phase >= spec.slices.length + 1) || undefined}>{fmt(shrink ? spec.start : shown, spec.digits)}{spec.suffix}</b>
          <div className="pa-bar" style={{ ["--pa-keep" as string]: pct(keepTo) }}>
            <i className="pa-keep" style={{ width: pct(keepTo) }} />
            {spec.slices.map((sl, i) => (
              <a key={sl.title} className="pa-slice" data-i={i} data-spot={spot === i || undefined} href={href(sl.key)} style={{ left: pct(Math.min(sl.from, sl.to)), width: pct(Math.abs(sl.to - sl.from)), ["--pa-c" as string]: sl.color }}>
                <span className="pa-slice-card" data-align={shrink && i === spec.slices.length - 1 ? "right" : undefined}><strong>{sl.title}</strong><em>{sl.delta}</em><small>{sl.cause}</small></span>
              </a>
            ))}
          </div>
        </div>
        {spec.note && (
          <div className="pa-note" style={{ width: pct(keepTo) }}>
            <strong>{spec.note.title}</strong>
            <span>{spec.note.text}</span>
          </div>
        )}
        {shrink && (
          <div className="pa-row pa-after">
            <b className="pa-num cx-hero-num" data-hero={phase >= 4 || undefined}>{fmt(spec.end, spec.digits)}{spec.suffix}</b>
            <div className="pa-bar"><i className="pa-keep pa-keep-after" style={{ width: pct(spec.end) }} /></div>
          </div>
        )}
        <span className="pa-unit">{spec.unit}</span>
      </div>
      <div className="pa-load">
        <h3>{spec.measuresTitle}</h3>
        {spec.measures.map((c, i) => (
          <a key={c.key} className="pa-measure" data-spot={spot === spec.slices.length + i || undefined} href={href(c.key)}>
            <strong>{c.title}</strong>
            <span className="pa-fromto">{c.from && <s>{c.from}</s>} {c.to}</span>
            {c.a !== undefined && c.b !== undefined && <span className="pa-mini"><i style={{ width: `${(100 * c.a) / Math.max(c.a, c.b)}%` }} /><i style={{ width: `${(100 * c.b) / Math.max(c.a, c.b)}%` }} /></span>}
            <small>{c.unit}</small>
          </a>
        ))}
      </div>
      <nav className="pa-also" aria-label="More in the laboratory">
        {spec.also.map((a) => <a key={a.key} href={href(a.key)}><strong>{a.title}</strong> {a.value}</a>)}
      </nav>
    </section>
  );
}

export function PosterLedger() {
  return <LedgerPoster spec={INFERENCE_LEDGER} />;
}
export function ProjectPoster({ domain, live = false }: { domain: "inference" | "training"; live?: boolean }) {
  return <LedgerPoster live={live} spec={domain === "inference" ? INFERENCE_LEDGER : TRAINING_LEDGER} />;
}

/* ── B · The machine ─────────────────────────────────────────────────── */
const STATIONS = [
  { key: "cache", name: "Router", x: 150, y: 250, w: 150, card: UNDER_LOAD[2] },
  { key: "pressure", name: "Scheduler", x: 370, y: 250, w: 170, card: UNDER_LOAD[0] },
  { key: "film", name: "KV pages", x: 610, y: 250, w: 150, card: { title: "Prefix reuse", from: fmt(COST.batching), to: fmt(COST.reuse), unit: "GPU-s per correct answer", cause: "a shared document is read once and its KV pages are kept" } },
  { key: "film", name: "GPU kernels", x: 830, y: 250, w: 160, card: { title: "Faster prefill & decode", from: fmt(COST.reuse), to: fmt(COST.kernels), unit: "GPU-s per correct answer", cause: "the same tokens take less time each" } },
  { key: "overlap", name: "CPU host", x: 830, y: 92, w: 160, card: UNDER_LOAD[3] },
  { key: "draft", name: "Draft model", x: 830, y: 408, w: 160, card: UNDER_LOAD[1] },
] as const;

export function PosterMachine() {
  const root = useRef<HTMLElement>(null);
  const [on, setOn] = useState(0);
  const [hold, setHold] = useState<number | null>(null);
  useEffect(() => {
    if (hold !== null || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setOn((i) => (i + 1) % STATIONS.length), 3400);
    return () => window.clearInterval(id);
  }, [hold]);
  const i = hold ?? on, s = STATIONS[i];
  const cardLeft = Math.min(78, Math.max(4, ((s.x + s.w / 2) / 1200) * 100 - 14));
  return (
    <section ref={root} className="pb vx-accent-amber">
      <header className="pb-head">
        <div>
          <h2>Inference optimization engine</h2>
          <p className="pb-claim"><b className="cx-hero-num" data-hero>{fmt(COST.base)} → {fmt(COST.kernels)}</b> GPU-seconds per correct answer, same model, same answers</p>
        </div>
        <a className="pa-cta" href={DEPTH.inference}>Explore the engine in depth</a>
      </header>
      <div className="pb-stage" onPointerLeave={() => setHold(null)}>
        <svg viewBox="0 0 1200 520" className="pb-svg" role="img" aria-label="The serving machine, each part carrying the result it earned">
          <path d="M20 295H1180" className="pb-pipe" />
          <path d="M910 250V182M910 340V408" className="pb-pipe pb-pipe-thin" />
          {Array.from({ length: 9 }, (_, k) => (
            <circle key={k} r={4} className="pb-dot">
              <animateMotion path="M20 295H1180" dur="6.4s" begin={`${-k * 0.71}s`} repeatCount="indefinite" />
            </circle>
          ))}
          <text x={20} y={276} className="pb-io">96 requests</text>
          <text x={1180} y={276} textAnchor="end" className="pb-io">tokens out</text>
          {STATIONS.map((st, k) => (
            <g key={st.name} className="pb-station" data-on={k === i || undefined} onPointerEnter={() => setHold(k)} onFocus={() => setHold(k)} tabIndex={0}>
              <rect x={st.x} y={st.y} width={st.w} height={90} rx={10} />
              <text x={st.x + st.w / 2} y={st.y + 40} textAnchor="middle" className="pb-name">{st.name}</text>
              <text x={st.x + st.w / 2} y={st.y + 66} textAnchor="middle" className="pb-pin">{st.card.from} → {st.card.to}</text>
            </g>
          ))}
        </svg>
        <a key={i} className="pb-card" href={labHref(s.key)} style={{ left: `${cardLeft}%`, top: s.y > 300 ? "4%" : "70%" }}>
          <strong>{s.card.title}</strong>
          <span className="pb-big"><s>{s.card.from}</s> {s.card.to}</span>
          <small>{s.card.unit}</small>
          <em>{s.card.cause}</em>
        </a>
      </div>
      <nav className="pa-also" aria-label="More in the laboratory">
        {ALSO.map((a) => <a key={a.key} href={labHref(a.key)}><strong>{a.title}</strong> {a.value}</a>)}
      </nav>
    </section>
  );
}

/* ── C · The wipe ────────────────────────────────────────────────────── */
const C_SWEEP = 7000;
export function PosterWipe() {
  const root = useRef<HTMLElement>(null);
  const [k, setK] = useState(0);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { const id = requestAnimationFrame(() => setK(1)); return () => cancelAnimationFrame(id); }
    let raf = 0, start = 0, live = false;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = (now - start) % (C_SWEEP + 5000);
      setK(Math.min(1, Math.max(0, (t - 600) / C_SWEEP)));
      if (live) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => { live = e.isIntersecting; if (live) { start = 0; raf = requestAnimationFrame(tick); } else cancelAnimationFrame(raf); }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);
  const before = LAB.gantt.before, after = LAB.gantt.after;
  const max = Math.max(...before.map((b) => b[1]));
  const X0 = 40, W = 1120, sx = (s: number) => X0 + (s / max) * W;
  const seam = X0 + k * W;
  const LABELS: [number, string][] = [[0.22, "continuous batching"], [0.5, "prefix reuse"], [0.76, "faster kernels"]];
  return (
    <section ref={root} className="pc vx-accent-amber">
      <header className="pb-head">
        <div>
          <h2>Inference optimization engine</h2>
          <p className="pb-claim">The same 96 requests, <b>before</b> and <b className="pc-after">after</b> the runtime changes</p>
        </div>
        <a className="pa-cta" href={DEPTH.inference}>Explore the engine in depth</a>
      </header>
      <svg viewBox="0 0 1200 560" className="pc-svg" role="img" aria-label="Every request as a bar from start to finish; a seam sweeps from the baseline run to the optimized run">
        <defs>
          <clipPath id="pc-left"><rect x={0} y={0} width={seam} height={560} /></clipPath>
          <clipPath id="pc-right"><rect x={seam} y={0} width={1200} height={560} /></clipPath>
        </defs>
        <g clipPath="url(#pc-right)">{before.map(([a, b], i) => <rect key={i} x={sx(a)} y={20 + i * 5.2} width={Math.max(1.5, sx(b) - sx(a))} height={3.6} className="pc-before" />)}</g>
        <g clipPath="url(#pc-left)">{after.map(([a, b], i) => <rect key={i} x={sx(a)} y={20 + i * 5.2} width={Math.max(1.5, sx(b) - sx(a))} height={3.6} className="pc-after-bar" />)}</g>
        <path d={`M${seam} 6V530`} className="pc-seam" />
        {LABELS.map(([at, l]) => k >= at && <text key={l} x={X0 + at * W + 10} y={548} className="pc-label">{l}</text>)}
        <text x={X0} y={548} className="pc-axis" opacity={k < 0.2 ? 1 : 0}>time →</text>
      </svg>
      <div className="pc-foot">
        <span><b className="pc-num">{fmt(COST.base)} → {fmt(COST.kernels)}</b> GPU-s per correct answer</span>
        <span><b className="pc-num">{fmt(LAB.p95[0], 0)} → {fmt(LAB.p95[1], 0)}</b> s p95 response</span>
        {UNDER_LOAD.map((c) => <a key={c.key} href={labHref(c.key)}><b className="pc-num">{c.from} → {c.to}</b> {c.title}</a>)}
      </div>
    </section>
  );
}

export function PosterReview() {
  const [d, setD] = useState<"a" | "b" | "c">("a");
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("d");
    if (q === "a" || q === "b" || q === "c") { const id = requestAnimationFrame(() => setD(q)); return () => cancelAnimationFrame(id); }
  }, []);
  return (
    <main className="vx-shell pr-page">
      {d === "a" ? <PosterLedger /> : d === "b" ? <PosterMachine /> : <PosterWipe />}
      <div className="pr-switch" role="group" aria-label="Poster direction">
        {(["a", "b", "c"] as const).map((x) => <button key={x} type="button" aria-pressed={d === x} onClick={() => setD(x)}>{x === "a" ? "A · ledger" : x === "b" ? "B · machine" : "C · wipe"}</button>)}
      </div>
    </main>
  );
}
