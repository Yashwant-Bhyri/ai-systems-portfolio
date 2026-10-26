"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ComponentType, type ReactNode } from "react";
import { useTr } from "../../exhibit/i18n";
import { ease, prog } from "../../exhibit/engine";
import { useStageHold } from "./stage-hold";
import "./module-arc.css";

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
};

const LABELS = ["Problem", "How it works", "In our system", "Impact"] as const;
const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (notify: () => void) => { const m = matchMedia(REDUCED); m.addEventListener("change", notify); return () => m.removeEventListener("change", notify); };

export function ModuleArc({
  active, problem, mechanism, impact, systemTitle, systemMs = 90000, children,
}: {
  active: boolean;
  problem: ArcBeat;
  mechanism: ArcBeat;
  impact: ArcBeat;
  systemTitle: string;
  /** Fallback length of the system beat when the module has no scripted demonstration. */
  systemMs?: number;
  children: ReactNode;
}) {
  const tr = useTr();
  const root = useRef<HTMLDivElement>(null);
  const [beat, setBeat] = useState(0);
  const [t, setT] = useState(0);
  const [held, setHeld] = useState(false);
  const [inView, setInView] = useState(false);
  const reduced = useSyncExternalStore(subscribeReduced, () => matchMedia(REDUCED).matches, () => false);
  const beats = [problem, mechanism, null, impact] as const;
  const timed = beats[beat];
  useStageHold(root, String(beat));

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Scene clock: runs while a timed beat is on screen.
  const live = active && inView && !reduced;
  useEffect(() => {
    if (!live || !timed) return;
    let raf = 0;
    const start = performance.now() - t;
    const tick = (now: number) => {
      const next = now - start;
      if (next >= timed.ms) {
        setT(timed.ms);
        if (!held) {
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
  }, [live, beat, held, timed]);

  // The system beat ends when the module's own demonstration completes a pass (or its fallback length).
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const round = (e: Event) => {
      if (e.target === el.parentElement) return;
      e.stopPropagation();
      if (beat === 2 && !held) { setBeat(3); setT(0); }
    };
    const taken = () => setHeld(true);
    el.addEventListener("lab:module-round", round);
    el.addEventListener("lab:module-taken", taken);
    return () => { el.removeEventListener("lab:module-round", round); el.removeEventListener("lab:module-taken", taken); };
  }, [beat, held]);
  useEffect(() => {
    if (beat !== 2 || !live || held) return;
    const id = window.setTimeout(() => { setBeat(3); setT(0); }, systemMs);
    return () => window.clearTimeout(id);
  }, [beat, live, held, systemMs]);

  const go = (i: number) => { setBeat(i); setT(0); };
  const shownT = reduced && timed ? timed.ms : t;
  return (
    <div ref={root} className="ma-root" data-beat={beat}>
      <nav className="ma-beats" aria-label={tr("The module, step by step")}>
        {LABELS.map((l, i) => (
          <button key={l} type="button" aria-pressed={beat === i} data-done={i < beat || undefined} onClick={() => go(i)}>
            <i>{String(i + 1).padStart(2, "0")}</i>{tr(l)}
            {beat === i && beats[i] && <b className="ma-progress" style={{ transform: `scaleX(${Math.min(1, shownT / beats[i]!.ms)})` }} />}
          </button>
        ))}
        <span className="ma-title" key={beat}>{tr(timed ? timed.title : systemTitle)}</span>
      </nav>
      {timed && <div className="ma-scene" key={beat} data-film={timed.render ? true : undefined}>{timed.render ? timed.render(live) : timed.Scene && <timed.Scene t={shownT} />}</div>}
      <div className="ma-system" hidden={beat !== 2}>{children}</div>
    </div>
  );
}

/* ── Impact: one hero Δ, the bars behind it, the cause, and the honest cost ── */
export type ImpactSpec = {
  from: number; to: number; unit: string; digits?: number;
  what: string;
  cause: string;
  base: string; optimized: string;
  cost?: { what: string; from: number; to: number; unit: string; digits?: number };
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
    return (
      <div className="ma-impact">
        <div className="ma-hero">
          <span className="ma-what">{tr(spec.what)}</span>
          <strong className="cx-hero-num" data-hero={count >= 1 || undefined}>
            <span className="ma-from">{num(spec.from, spec.digits)}</span>
            <span className="ma-arrow">→</span>
            <span>{num(cur, spec.digits)}</span>
            <small>{tr(spec.unit)}</small>
          </strong>
          <span className="ma-delta" style={{ opacity: prog(t, 2400, 3000) }}>Δ {num(delta, spec.digits)} {tr(spec.unit)} · {spec.to < spec.from ? "−" : "+"}{pct}%</span>
          <p className="ma-cause" style={{ opacity: prog(t, 2800, 3400) }}>{tr(spec.cause)}</p>
        </div>
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
              <b>{num(spec.cost.from, spec.cost.digits)} → {num(spec.cost.to, spec.cost.digits)} <small>{tr(spec.cost.unit)}</small></b>
            </div>
          )}
          {spec.Figure && <div className="ma-figure"><spec.Figure t={t} /></div>}
        </div>
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
export function FilmInterlude({ beat, kicker, live, onDone }: { beat: ArcBeat; kicker: string; live: boolean; onDone: () => void }) {
  const tr = useTr();
  const [t, setT] = useState(0);
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
        <strong>{tr(beat.title)}</strong>
        <button type="button" onClick={onDone}>{tr(beat.label === "Impact" ? "Continue ▸" : "Skip to our system ▸")}</button>
        <b className="ma-progress" style={{ transform: `scaleX(${Math.min(1, (reduced ? beat.ms : t) / beat.ms)})` }} />
      </header>
      <div className="ma-scene">{beat.Scene && <beat.Scene t={reduced ? beat.ms : t} />}</div>
    </div>
  );
}
