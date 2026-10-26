"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { draftStudy } from "../draft-verification-model";
import { attrs, ease, prog } from "../../exhibit/engine";
import { useTr } from "../../exhibit/i18n";

/**
 * Speculative decoding as one sentence being written. Ghost words race ahead of
 * the cursor because drafting is cheap; one sweep checks all five because
 * verification is parallel; the first wrong guess cracks and takes the rest
 * with it. The call ledger underneath keeps the accounting exact.
 */

const CTX = "The cache stores";
const R1 = [" the", " keys", " and", " weights", " here"], OK1 = 3, FIX1 = " values";
const R2 = [" in", " the", " output", " buffer", " too"], FIX2 = " for";
const X0 = 440, Y = 250, DUR = 18000;
const DRAFT = { x: 30, y: 92, w: 380, h: 112 }, TARGET = { x: 30, y: 322, w: 380, h: 160 };
const C = { acc: "#ffc267", ink: "#f2f4ee", ok: "#9fe3a8", fail: "#ff8176", slate: "#5e6a76", dim: "#8a96a3" };

const BEATS: readonly [number, string][] = [
  [0, "The answer so far."],
  [2000, "A small model guesses the next five words."],
  [3600, "The large model checks all five in one pass."],
  [4800, "Three are right. The fourth is wrong; everything after it goes."],
  [6000, "The large model's own word replaces the mistake."],
  [7600, "Four words from one large-model call instead of four calls."],
  [10600, "When the first guess is wrong, the drafting is wasted."],
  [15600, "Speculation pays only when the guesses are good."],
];

export function DraftFilm({ active }: { active: boolean }) {
  const tr = useTr();
  const root = useRef<HTMLDivElement>(null);
  const ctx = useRef<SVGTextElement>(null);
  const cursor = useRef<SVGRectElement>(null);
  const sweep = useRef<SVGRectElement>(null);
  const draftLab = useRef<SVGTextElement>(null);
  const sweepLab = useRef<SVGTextElement>(null);
  const ghosts = useRef<(SVGTextElement | null)[]>([]);
  const shards = useRef<(SVGTextElement | null)[]>([]);
  const marks = useRef<(SVGTextElement | null)[]>([]);
  const fix = useRef<SVGTextElement>(null);
  const fixLab = useRef<SVGTextElement>(null);
  const ledger = useRef<SVGGElement>(null);
  const blocksA = useRef<(SVGRectElement | null)[]>([]);
  const blocksB = useRef<(SVGRectElement | null)[]>([]);
  const ticks = useRef<(SVGRectElement | null)[]>([]);
  const callTxt = useRef<SVGTextElement>(null);
  const draftCard = useRef<SVGGElement>(null), targetCard = useRef<SVGGElement>(null);
  const draftLinks = useRef<(SVGPathElement | null)[]>([]);
  const beam = useRef<SVGPathElement>(null);
  const [beat, setBeat] = useState(0);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const clock = useRef(0);
  // The whole answer's accounting, from the same study the round-by-round view uses.
  const study = useMemo(() => draftStudy("mixed", 4), []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = document.createElement("canvas").getContext("2d");
    const measure = (s: string) => {
      if (!canvas) return s.length * 22;
      canvas.font = '400 38px ui-sans-serif, -apple-system, system-ui, sans-serif';
      return canvas.measureText(s).width;
    };
    let raf = 0, start = performance.now(), lastBeat = -1;
    const draw = (ms: number) => {
      const t = ms / 1000;
      const round2 = t >= 10.6;
      const base = round2 ? CTX + R1.slice(0, OK1).join("") + FIX1 : CTX;
      const typed = round2 ? base : CTX.slice(0, Math.floor(CTX.length * ease.out(prog(t, 0, 1.4))));
      if (ctx.current) ctx.current.textContent = typed;
      const words = round2 ? R2 : R1, okN = round2 ? 0 : OK1, fixWord = round2 ? FIX2 : FIX1;
      const lt = round2 ? t - 10.6 : t;
      let x = X0 + measure(base);
      const xs = words.map((w) => { const a = x; x += measure(w); return [a, x] as const; });
      // Agents: the draft model fires five guesses; the target model sweeps them in one pass.
      const drafting = lt > 1.9 && lt < 3.5, verifying = lt > 3.5 && lt < 5.0, correcting = lt > 5.9 && lt < 7.0;
      attrs(draftCard.current, { opacity: drafting ? 1 : 0.5 });
      attrs(targetCard.current, { opacity: verifying || correcting ? 1 : 0.5 });
      words.forEach((_, i) => {
        const a = prog(lt, 2.0 + i * 0.13, 2.25 + i * 0.13), gone = prog(lt, 3.3, 3.8);
        const [x0, x1] = xs[i];
        attrs(draftLinks.current[i], { d: `M${DRAFT.x + DRAFT.w} ${DRAFT.y + DRAFT.h / 2}C${DRAFT.x + DRAFT.w + 90} ${DRAFT.y + DRAFT.h / 2} ${(x0 + x1) / 2 - 60} ${Y - 70} ${(x0 + x1) / 2} ${Y - 44}`, opacity: a * (1 - gone) * 0.8 });
      });
      const bv = Math.sin(Math.PI * prog(lt, 3.5, 5.0));
      attrs(beam.current, { d: `M${TARGET.x + TARGET.w} ${TARGET.y + 40}C${TARGET.x + TARGET.w + 80} ${TARGET.y + 40} ${xs[0][0] - 40} ${Y + 60} ${xs[0][0] - 10} ${Y + 30}L${xs[4][1] + 10} ${Y + 30}`, opacity: bv });
      attrs(cursor.current, { x: X0 + measure(typed) + 4, opacity: lt < 1.6 ? (Math.floor(t * 2.2) % 2 ? 0.9 : 0.2) : 0 });
      words.forEach((w, i) => {
        const appear = prog(lt, 2.0 + i * 0.13, 2.2 + i * 0.13);
        const at = 4.8 + i * 0.12;
        const accepted = i < okN, wrong = i === okN, after = i > okN;
        const solid = accepted ? ease.out(prog(lt, at, at + 0.5)) : 0;
        const crack = wrong ? ease.out(prog(lt, at, at + 0.9)) : 0;
        const fade = after ? prog(lt, 5.2, 5.9) : 0;
        const [x0, x1] = xs[i], mid = (x0 + x1) / 2;
        const g = ghosts.current[i], s = shards.current[i], m = marks.current[i];
        if (g) { g.textContent = w; g.style.fontStyle = solid > 0.5 ? "normal" : "italic"; g.style.fill = wrong && crack > 0 ? C.fail : accepted && solid > 0.5 ? C.ink : C.acc; }
        attrs(g, { x: x0, y: Y + 28 * crack * crack - 4 * solid, opacity: appear * (accepted ? 0.45 + 0.55 * solid : 0.42) * (1 - fade) * (1 - crack) });
        if (s) s.textContent = w;
        attrs(s, { x: x0 + 6 * crack, y: Y + 46 * crack * crack, opacity: wrong ? appear * 0.42 * crack * (1 - crack) * 2 : 0, transform: `rotate(${10 * crack} ${mid} ${Y})` });
        if (m) { m.textContent = accepted ? "✓" : wrong ? "✗" : ""; m.style.fill = accepted ? C.ok : C.fail; }
        attrs(m, { x: mid, opacity: accepted ? solid : wrong ? crack : 0 });
      });
      const sw = prog(lt, 3.6, 4.8);
      attrs(sweep.current, { x: xs[0][0] - 10, width: xs[4][1] - xs[0][0] + 20, opacity: 0.16 * Math.sin(Math.PI * sw), transform: `translate(0 ${(1 - ease.out(sw)) * 30})` });
      attrs(draftLab.current, { x: xs[0][0], opacity: prog(lt, 2.0, 2.4) * (1 - prog(lt, 4.6, 5.0)) });
      attrs(sweepLab.current, { x: xs[0][0], opacity: Math.sin(Math.PI * prog(lt, 3.5, 5.6)) });
      const fp = ease.out(prog(lt, 6.0, 6.8));
      if (fix.current) fix.current.textContent = fixWord;
      attrs(fix.current, { x: xs[okN][0], y: Y - 60 * (1 - fp), opacity: fp });
      attrs(fixLab.current, { x: xs[okN][0], opacity: fp * (1 - prog(lt, 9.2, 9.8)) });
      attrs(ledger.current, { opacity: prog(t, 7.6, 8.2) });
      const bw = 150, sx0 = 640, nA = round2 ? 5 : 4;
      blocksA.current.forEach((b, i) => {
        const on = i < nA ? ease.out(prog(t, 8.0 + i * 0.25, 8.4 + i * 0.25)) : 0;
        const r2 = round2 && i === 4 ? ease.out(prog(t, 14.6, 15.0)) : on;
        attrs(b, { x: sx0 + i * (bw + 8), "fill-opacity": 0.7 * (i === 4 ? r2 : on) });
      });
      const roundX = [sx0, sx0 + 5 * 16 + bw + 24];
      ticks.current.forEach((tk, i) => {
        const r = Math.floor(i / 5), k = i % 5, st = r ? 13.0 : 8.0;
        attrs(tk, { x: roundX[r] + k * 16, "fill-opacity": 0.45 * ease.out(prog(t, st + k * 0.08, st + 0.3 + k * 0.08)) * (r && !round2 ? 0 : 1) });
      });
      blocksB.current.forEach((b, r) => {
        attrs(b, { x: roundX[r] + 5 * 16 + 4, "fill-opacity": 0.85 * ease.out(prog(t, r ? 13.5 : 8.6, r ? 13.9 : 9.0)) * (r && !round2 ? 0 : 1) });
      });
      if (callTxt.current) callTxt.current.textContent = tr(round2 ? "round 2: one call for one word" : "4 words · 1 call of the large model");
      attrs(callTxt.current, { opacity: round2 ? prog(t, 14.2, 14.8) : prog(t, 9.0, 9.6) });
      let b = 0;
      for (let k = 0; k < BEATS.length; k++) if (ms >= BEATS[k][0]) b = k;
      if (b !== lastBeat) { lastBeat = b; setBeat(b); }
    };
    if (reduced || !active || !inView) { draw(9800); return; }
    if (paused) { draw(clock.current); return; }
    const tick = (now: number) => { clock.current = (now - start) % DUR; draw(clock.current); raf = requestAnimationFrame(tick); };
    start = performance.now() - clock.current;
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, inView, tr, paused]);

  return (
    <div ref={root} className="df-film">
      <svg viewBox="0 0 1600 600" className="df-svg" role="img" aria-label="Speculative decoding: a draft model proposes five words, the target model verifies them in one pass, three are accepted, the fourth is corrected.">
        <text x={X0} y={70} className="df-kicker">{tr("Draft five words, check them in one pass")}</text>
        <text ref={draftLab} y={Y - 96} className="df-small" opacity={0}>{tr("a small model guesses ahead")}</text>
        <rect ref={sweep} y={Y - 74} height={110} rx={10} fill={C.acc} opacity={0} />
        <text ref={ctx} x={X0} y={Y} className="df-word" />
        <rect ref={cursor} width={3} height={50} y={Y - 40} fill={C.acc} />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <text ref={(e) => { ghosts.current[i] = e; }} className="df-word" opacity={0} />
            <text ref={(e) => { shards.current[i] = e; }} className="df-word" style={{ fontStyle: "italic", fill: C.fail }} opacity={0} />
            <text ref={(e) => { marks.current[i] = e; }} y={Y + 54} className="df-mark" textAnchor="middle" opacity={0} />
          </g>
        ))}
        <text ref={sweepLab} y={Y + 92} className="df-small" opacity={0}>{tr("the large model checks all five at once")}</text>
        <text ref={fix} className="df-word" style={{ fill: C.acc }} opacity={0} />
        <text ref={fixLab} y={Y - 96} className="df-small" opacity={0}>{tr("the large model's own word")}</text>
        <g ref={draftCard} opacity={0.5}>
          <rect x={DRAFT.x} y={DRAFT.y} width={DRAFT.w} height={DRAFT.h} rx={12} className="df-agent df-agent-draft" />
          {[0, 1, 2, 3].map((k) => <rect key={k} x={DRAFT.x + 18} y={DRAFT.y + 26 + k * 16} width={48} height={8} rx={2} fill={C.acc} opacity={0.35 + k * 0.12} />)}
          <text x={DRAFT.x + 84} y={DRAFT.y + 40} className="df-agent-name">{tr("Draft model")}</text>
          <text x={DRAFT.x + 84} y={DRAFT.y + 68} className="df-agent-meta">{tr("small and fast")}</text>
          <text x={DRAFT.x + 84} y={DRAFT.y + 94} className="df-agent-meta">{tr("guesses 5 words ahead")}</text>
        </g>
        <g ref={targetCard} opacity={0.5}>
          <rect x={TARGET.x} y={TARGET.y} width={TARGET.w} height={TARGET.h} rx={12} className="df-agent df-agent-target" />
          {Array.from({ length: 10 }, (_, k) => <rect key={k} x={TARGET.x + 18} y={TARGET.y + 22 + k * 12} width={48} height={7} rx={2} fill="#9fb4c8" opacity={0.3 + k * 0.06} />)}
          <text x={TARGET.x + 84} y={TARGET.y + 42} className="df-agent-name">{tr("Target model")}</text>
          <text x={TARGET.x + 84} y={TARGET.y + 72} className="df-agent-meta">{tr("decides every word")}</text>
          <text x={TARGET.x + 84} y={TARGET.y + 100} className="df-agent-meta">{tr("checks five in one pass")}</text>
          <text x={TARGET.x + 84} y={TARGET.y + 128} className="df-agent-meta">{tr("writes its own on a miss")}</text>
        </g>
        {[0, 1, 2, 3, 4].map((i) => <path key={i} ref={(e) => { draftLinks.current[i] = e; }} className="df-link df-link-draft" opacity={0} />)}
        <path ref={beam} className="df-link df-link-verify" opacity={0} />
        <g ref={ledger} opacity={0}>
          <text x={X0} y={448} className="df-label">{tr("one word per call")}</text>
          <text x={X0} y={508} className="df-label">{tr("draft, then verify")}</text>
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} ref={(e) => { blocksA.current[i] = e; }} y={428} width={150} height={30} rx={5} fill={C.slate} fillOpacity={0} />)}
          {[0, 1].map((i) => <rect key={i} ref={(e) => { blocksB.current[i] = e; }} y={488} width={150} height={30} rx={5} fill={C.acc} fillOpacity={0} />)}
          {Array.from({ length: 10 }, (_, i) => <rect key={i} ref={(e) => { ticks.current[i] = e; }} y={492} width={12} height={22} rx={3} fill={C.acc} fillOpacity={0} />)}
          <text ref={callTxt} x={1480} y={570} className="df-call" textAnchor="end" />
        </g>
      </svg>
      <p className="df-caption" aria-live="polite">{tr(BEATS[beat][1])}</p>
      <aside className="df-result-card" data-shown={beat >= 5 || undefined}>
        <span>{tr(`The full ${study.baselineCalls}-word answer`)}</span>
        <p className="df-result-line"><b className="df-result">Δ {study.callsAvoided}</b> <small>{tr("large-model calls")}</small></p>
        <p className="df-pair">{study.baselineCalls} → {study.targetCalls} <small>{tr("serial calls")}</small></p>
        <p className="df-cause">{tr(`Cause: each call accepts ${Math.min(...study.rounds.map((r) => r.accepted))}–${Math.max(...study.rounds.map((r) => r.accepted))} drafted words plus its own`)}</p>
        <button type="button" className="df-pause" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>{paused ? "▷ Play" : "Ⅱ Pause"}</button>
      </aside>
    </div>
  );
}
