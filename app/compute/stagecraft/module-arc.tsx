"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ComponentType, type ReactNode } from "react";
import { useTr } from "../../exhibit/i18n";
import { ease, prog } from "../../exhibit/engine";
import { useStageHold } from "./stage-hold";
import { emitFocus, highlight, useSummaryPause, type Tone } from "./stage-meter";
import "./module-arc.css";
import "./system-board.css";

/**
 * A module told as a full circle: the problem, how the technique works in
 * general, the same technique running in our system (the module itself), and
 * the measured impact. Timed beats are scenes drawn from a clock; the system
 * beat lasts until the module's own demonstration completes a pass. Only when
 * the impact has been shown does the arc tell the laboratory it is done.
 */
export type SceneProps = { t: number };
export type ArcBeat = {
  label: string; title: string; ms: number;
  /** A scene drawn from the arc's clock… */
  Scene?: ComponentType<SceneProps>;
  /** …or an existing self-clocked film, told whether it is on screen. */
  render?: (on: boolean) => ReactNode;
  /** What the live meter says during the beat: [from ms, line]. */
  meter?: readonly (readonly [number, string])[];
  /** Problem beats: the bottleneck, stated centrally once the scene has shown it. */
  bottleneck?: { at: number; headline: string; effect: string };
  /** Any beat: from `at`, the stage goes quiet except its spots and this caption reads the result. */
  focus?: { at: number; headline: string; parts?: readonly { label: string; value: string; tone?: Tone }[]; cause?: string };
};
/** The arc's one measure, tracked beside the scenes: where we started, where we ended up. */
export type ArcLedger = { metric: string; unit: string; baseline: number; optimized: number; digits?: number; baselineLabel?: string; optimizedLabel?: string };

const LABELS = ["Problem / Bottleneck", "Optimized solution", "In our system", "Impact"] as const;
const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (notify: () => void) => { const m = matchMedia(REDUCED); m.addEventListener("change", notify); return () => m.removeEventListener("change", notify); };

export function ModuleArc({
  active, problem, mechanism, impact, systemTitle, system, systemMs = 90000, labels = LABELS, ledger, children,
}: {
  active: boolean;
  problem: ArcBeat;
  mechanism: ArcBeat;
  impact: ArcBeat;
  systemTitle: string;
  /** The system beat as a timed scene; the module's own explorer stays one click away. */
  system?: ArcBeat;
  ledger?: ArcLedger;
  /** Fallback length of the system beat when the module has no scripted demonstration. */
  systemMs?: number;
  /** The four step names, when a module tells its circle in other words. */
  labels?: readonly string[];
  children: ReactNode;
}) {
  const tr = useTr();
  const root = useRef<HTMLDivElement>(null);
  const [beat, setBeat] = useState(0);
  const [t, setT] = useState(0);
  const [held, setHeld] = useState(false);
  const directed = useRef(0);
  useEffect(() => { if (!active) directed.current = 0; }, [active]);
  const [run, setRun] = useState(0);
  const [inView, setInView] = useState(false);
  const reduced = useSyncExternalStore(subscribeReduced, () => matchMedia(REDUCED).matches, () => false);
  const [exploring, setExploring] = useState(false);
  const beats = [problem, mechanism, system ?? null, impact] as const;
  const timed = beat === 2 && exploring ? null : beats[beat];
  useStageHold(root, String(beat));

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Scene clock: runs while a timed beat is on screen.
  const [paused, setPaused] = useState(false);
  useSummaryPause(() => setPaused(true), () => setPaused(false), active);
  const live = active && inView && !reduced && !paused;
  useEffect(() => {
    if (!live || !timed) return;
    let raf = 0;
    // A self-clocked film keeps its own pace; only drawn scenes can be played quicker.
    const speed = directed.current && !timed.render ? directed.current : 1;
    const start = performance.now() - t / speed;
    const tick = (now: number) => {
      const next = (now - start) * speed;
      if (next >= timed.ms) {
        setT(timed.ms);
        if (!held && !directed.current) {
          if (beat < 3) { setBeat(beat + 1); setT(0); }
          else root.current?.parentElement?.dispatchEvent(new CustomEvent("lab:module-round", { bubbles: true }));
        }
        return;
      }
      setT(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // `t` is read once to resume from where the beat was; it must not restart the clock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, beat, held, timed, run]);

  // The system beat ends when the module's own demonstration completes a pass (or its fallback length).
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const round = (e: Event) => {
      if (e.target === el.parentElement) return;
      e.stopPropagation();
      if (beat === 2 && !held && (!system || exploring)) { setBeat(3); setT(0); }
    };
    const taken = () => setHeld(true);
    el.addEventListener("lab:module-round", round);
    el.addEventListener("lab:module-taken", taken);
    return () => { el.removeEventListener("lab:module-round", round); el.removeEventListener("lab:module-taken", taken); };
  }, [beat, held, system, exploring]);
  useEffect(() => {
    if (beat !== 2 || !live || held || (system && !exploring)) return;
    const id = window.setTimeout(() => { setBeat(3); setT(0); }, systemMs);
    return () => window.clearTimeout(id);
  }, [beat, live, held, systemMs, system, exploring]);

  const go = (i: number) => { setBeat(i); setT(0); setExploring(false); setRun((n) => n + 1); };
  const shownT = reduced && timed ? timed.ms : t;

  // The live meter narrates the beat; the system beat names the module unless it speaks for itself.
  const lines = timed?.meter;
  let line = beat === 2 ? systemTitle : timed?.title ?? "";
  if (lines) for (const [at, text] of lines) if (shownT >= at) line = text;
  // The summary sends an arc straight to one beat.
  useEffect(() => {
    if (!active) return;
    let last = "";
    const goTo = (e: Event) => {
      const d = (e as CustomEvent<{ id: string; beat: number; speed?: number }>).detail;
      if (d.id === last) return;
      last = d.id;
      // The Summary plays a whole beat, a little quicker, and stops on its last frame; it moves itself on.
      directed.current = d.speed ?? 0;
      setBeat(d.beat); setT(0); setExploring(false); setPaused(false); setRun((n) => n + 1);
    };
    window.addEventListener("lab:arc-go", goTo);
    return () => window.removeEventListener("lab:arc-go", goTo);
  }, [active]);
  // Keep playing and dive deeper, from the rail.
  useEffect(() => {
    if (!active) return;
    const dive = () => { setHeld(true); if (system) { setBeat(2); setT(0); setExploring(true); } };
    const resume = () => { setHeld(false); setExploring(false); if (beat === 3 && t >= impact.ms) { setBeat(0); setT(0); } setRun((n) => n + 1); };
    window.addEventListener("lab:dive", dive);
    window.addEventListener("lab:resume", resume);
    return () => { window.removeEventListener("lab:dive", dive); window.removeEventListener("lab:resume", resume); };
  }, [active, system, beat, t, impact.ms]);
  // Coming back to an arc that has finished starts it again from its problem.
  // (A hidden Activity reconnects its effects when it returns, so this runs on every return.)
  const finishedAt = useRef({ beat, t, ms: impact.ms });
  useEffect(() => { finishedAt.current = { beat, t, ms: impact.ms }; });
  useEffect(() => {
    const f = finishedAt.current;
    if (active && f.beat === 3 && f.t >= f.ms) { setBeat(0); setT(0); setHeld(false); setExploring(false); setRun((n) => n + 1); }
  }, [active]);
  // The bottleneck is stated centrally once the problem has played out.
  const choke = beat === 0 ? problem.bottleneck : undefined;
  const choked = !!choke && active && shownT >= choke.at;
  useEffect(() => {
    if (!choked || !choke) return;
    emitFocus({ headline: tr(choke.headline), cause: tr(choke.effect), place: "bottom", tone: "problem" });
    return () => { emitFocus(null); };
  }, [choked, choke, tr]);
  const moment = timed?.focus;
  const lit = !!moment && active && shownT >= moment.at;
  useEffect(() => {
    if (!lit || !moment) return;
    emitFocus({ headline: tr(moment.headline), parts: moment.parts, cause: moment.cause && tr(moment.cause), place: "bottom" });
    return () => { emitFocus(null); };
  }, [lit, moment, tr]);
  const half = timed ? shownT >= timed.ms * 0.45 : false;
  return (
    <div ref={root} className="ma-root" data-beat={beat}>
      <nav className="ma-beats" aria-label={tr("The module, step by step")}>
        {labels.map((l, i) => (
          <button key={l} type="button" aria-pressed={beat === i} data-done={i < beat || undefined} onClick={() => go(i)}>
            <i>{String(i + 1).padStart(2, "0")}</i>{tr(l)}
            {beat === i && beats[i] && <b className="ma-progress" style={{ transform: `scaleX(${Math.min(1, shownT / beats[i]!.ms)})` }} />}
          </button>
        ))}
        <span className="ma-title" key={line}>{highlight(tr(line))}</span>
        {beat === 2 && system && (
          <button type="button" className="sb-explore-btn" aria-pressed={exploring} onClick={() => { setExploring((v) => !v); root.current?.dispatchEvent(new CustomEvent("lab:module-taken", { bubbles: true })); }}>
            {tr(exploring ? "Back to the walkthrough" : "Explore the full model ▸")}
          </button>
        )}
      </nav>
      {timed && (
        <div className="ma-stagewrap" data-ledger={ledger && beat < 2 ? true : undefined}>
          <div className="ma-scene" key={beat} data-film={timed.render ? true : undefined}>{timed.render ? timed.render(live) : timed.Scene && <timed.Scene t={shownT} />}</div>
          {ledger && beat < 2 && <ArcLedgerView ledger={ledger} beat={beat} revealed={beat > 0 && half} />}
        </div>
      )}
      <div className="ma-system" hidden={beat !== 2 || (!!system && !exploring)}>{children}</div>
    </div>
  );
}

/** The arc's measure, beside the problem and the solution: baseline first, then the optimized value and Δ. */
function ArcLedgerView({ ledger, beat, revealed }: { ledger: ArcLedger; beat: number; revealed: boolean }) {
  const tr = useTr();
  const d = ledger.digits ?? 0;
  const max = Math.max(ledger.baseline, ledger.optimized);
  const delta = ledger.optimized - ledger.baseline;
  const pct = Math.round((100 * Math.abs(delta)) / Math.max(ledger.baseline, 1e-9));
  return (
    <aside className="ma-ledger" aria-label={tr("Where we started and where we end up")}>
      <span className="ml-metric">{tr(ledger.metric)}</span>
      <div className="ml-row" data-tone="base" data-focus-spot>
        <small>{tr(ledger.baselineLabel ?? "Baseline")}</small>
        <b>{num(ledger.baseline, d)}<small> {tr(ledger.unit)}</small></b>
        <i style={{ width: `${(100 * ledger.baseline) / max}%` }} />
      </div>
      <div className="ml-row" data-tone="opt" data-on={revealed || undefined}>
        <small>{tr(ledger.optimizedLabel ?? "Optimized")}</small>
        <b>{revealed ? num(ledger.optimized, d) : "?"}<small> {tr(ledger.unit)}</small></b>
        <i style={{ width: revealed ? `${(100 * ledger.optimized) / max}%` : "0%" }} />
      </div>
      <div className="ml-delta" data-on={revealed || undefined}>
        Δ {delta < 0 ? "−" : "+"}{num(Math.abs(delta), d)} {tr(ledger.unit)} <small>{delta < 0 ? "−" : "+"}{pct}%</small>
      </div>
      <span className="ml-where">{beat === 0 ? tr("Now: the baseline and its bottleneck") : revealed ? tr("Next: the same technique in our system") : tr("Now: the optimized solution")}</span>
    </aside>
  );
}

/* ── Impact: one hero Δ, the bars behind it, the cause, and the honest cost ── */
export type ImpactSpec = {
  from: number; to: number; unit: string; digits?: number;
  what: string;
  cause: string;
  base: string; optimized: string;
  /** What the visitor should take away, in one sentence: read first, in large type. */
  lesson?: string;
  /** The honest price of the gain; `from` is left out when it is a single amount, not a change. */
  cost?: { what: string; from?: number; to: number; unit: string; digits?: number };
  /** An optional result figure drawn under the bars. */
  Figure?: ComponentType<SceneProps>;
};

const num = (v: number, d = 2) => v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });

export function makeImpact(spec: ImpactSpec): ComponentType<SceneProps> {
  function Impact({ t }: SceneProps) {
    const tr = useTr();
    const grow = ease.out(prog(t, 300, 1700));
    const count = ease.io(prog(t, 900, 2600));
    const cur = spec.from + (spec.to - spec.from) * count;
    const max = Math.max(spec.from, spec.to);
    const delta = Math.abs(spec.from - spec.to);
    const pct = Math.round((100 * delta) / Math.max(spec.from, 1e-9));
    const showCost = prog(t, 3600, 4300);
    const bars = (
      <div className="ma-bars">
        {[[spec.base, spec.from, "base"], [spec.optimized, spec.to, "opt"]].map(([label, v, tone]) => (
          <div key={String(tone)} className="ma-bar" data-tone={tone}>
            <span>{tr(String(label))}</span>
            <i style={{ width: `${(100 * Number(v) * grow) / max}%` }} />
            <b>{num(Number(v), spec.digits)} <small>{tr(spec.unit)}</small></b>
          </div>
        ))}
        {spec.cost && (
          <div className="ma-cost" style={{ opacity: showCost, transform: `translateY(${(1 - showCost) * 8}px)` }}>
            <span>{tr(spec.cost.what)}</span>
            <b>{spec.cost.from !== undefined && <>{num(spec.cost.from, spec.cost.digits)} → </>}{num(spec.cost.to, spec.cost.digits)} <small>{tr(spec.cost.unit)}</small></b>
          </div>
        )}
      </div>
    );
    const hero = (
      <div className="ma-hero">
        <span className="ma-what">{tr(spec.what)}</span>
        <strong className="cx-hero-num" data-hero={count >= 1 || undefined}>
          <span className="ma-from">{num(spec.from, spec.digits)}</span>
          <span className="ma-arrow">→</span>
          <span>{num(cur, spec.digits)}</span>
          <small>{tr(spec.unit)}</small>
        </strong>
        <span className="ma-delta" style={{ opacity: prog(t, 2400, 3000) }}>Δ {num(delta, spec.digits)} {tr(spec.unit)} · {spec.to < spec.from ? "−" : "+"}{pct}%</span>
      </div>
    );
    // With a result figure: a board across the top (number, cause, bars) and the figure below at full width.
    if (spec.Figure)
      return (
        <div className="ma-impact" data-board>
          {spec.lesson && <p className="ma-lesson" style={{ opacity: prog(t, 200, 900) }}>{tr(spec.lesson)}</p>}
          <header className="ma-board">
            {hero}
            <p className="ma-cause" style={{ opacity: prog(t, 2800, 3400) }}>{tr(spec.cause)}</p>
            {bars}
          </header>
          <div className="ma-figure"><spec.Figure t={t} /></div>
        </div>
      );
    return (
      <div className="ma-impact">
        {spec.lesson && <p className="ma-lesson" style={{ opacity: prog(t, 200, 900) }}>{tr(spec.lesson)}</p>}
        <div className="ma-hero-col">{hero}<p className="ma-cause" style={{ opacity: prog(t, 2800, 3400) }}>{tr(spec.cause)}</p></div>
        {bars}
      </div>
    );
  }
  return Impact;
}

/**
 * A beat shown over a film chapter: the film holds while it plays, then
 * carries on. Used for a technique's "how it works" before its chapter and its
 * impact after it.
 */
export function FilmInterlude({ beat, kicker, live, onDone, doneLabel }: { beat: ArcBeat; kicker: string; live: boolean; onDone: () => void; doneLabel?: string }) {
  const tr = useTr();
  const [t, setT] = useState(0);
  // The heading is the voice: it says what is happening now.
  let line = beat.title;
  if (beat.meter) for (const [at, text] of beat.meter) if (t >= at) line = text;
  const reduced = useSyncExternalStore(subscribeReduced, () => matchMedia(REDUCED).matches, () => false);
  const done = useRef(onDone);
  useEffect(() => { done.current = onDone; });
  useEffect(() => {
    if (!live || reduced) return;
    let raf = 0;
    const start = performance.now() - t;
    const tick = (now: number) => {
      const next = now - start;
      if (next >= beat.ms) { setT(beat.ms); done.current(); return; }
      setT(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // resumes from `t`; restarting on every frame would reset the clock
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, reduced, beat]);
  return (
    <div className="ma-interlude" role="region" aria-label={`${tr(kicker)}: ${tr(beat.title)}`}>
      <header>
        <span><i>{tr(kicker)}</i> · {tr(beat.label)}</span>
        <strong key={line}>{highlight(tr(line))}</strong>
        <button type="button" onClick={onDone}>{tr(doneLabel ?? (beat.label === "Impact" ? "Continue ▸" : "Skip to our system ▸"))}</button>
        <b className="ma-progress" style={{ transform: `scaleX(${Math.min(1, (reduced ? beat.ms : t) / beat.ms)})` }} />
      </header>
      {beat.bottleneck && (
        <p className="ma-choke"><b>{tr("Bottleneck")}</b> <span>{highlight(tr(beat.bottleneck.headline))}</span></p>
      )}
      <div className="ma-scene">{beat.Scene && <beat.Scene t={reduced ? beat.ms : t} />}</div>
    </div>
  );
}
