"use client";

import { DraftFilm } from "../stagecraft/draft-film";
import { draftStudy, TARGET_UNITS } from "../draft-verification-model";
import { ease, prog } from "../../exhibit/engine";
import { makeImpact, type ArcBeat, type SceneProps } from "../stagecraft/module-arc";

/* Speculative decoding, as a full circle. The sentence and every count come
   from the lab's draft-verification model (12 target units, 4-token drafts). */
const MIXED = draftStudy("mixed", 4), ALIGNED = draftStudy("aligned", 4), MISS = draftStudy("miss", 4);
const C = { acc: "#ffc267", ink: "#eef2f6", base: "#9cc5f5", ok: "#b8e986", red: "#ff8f86", dim: "#5e6a76" };
const PROBLEM_MS = 10500;
const CH = 13.2; // px per character of the 22 px mono sentence
/** Where each word of the answer starts. */
const PLACED = TARGET_UNITS.map((u, i) => 380 + TARGET_UNITS.slice(0, i).reduce((a, w) => a + (w.length + 1) * CH, 0) - (u === "." ? CH : 0));

function Problem({ t }: SceneProps) {
  const words = TARGET_UNITS;
  const step = 7200 / words.length;
  const n = Math.min(words.length, Math.floor(prog(t, 700, 700 + 7200) * words.length + (t >= 700 ? 1 : 0)));
  const pulse = t >= 700 && n < words.length + 1 ? 1 - prog((t - 700) % step, 0, step * 0.8) : 0;
  const last = prog(t, 8200, 9000);
  return <svg viewBox="0 0 1100 440" role="img" aria-label="Without speculation the large model runs once per word: twelve words, twelve serial calls">
    {/* the large model */}
    <rect x={40} y={110} width={260} height={190} rx={14} fill="rgba(255,194,103,.05)" stroke={C.acc} strokeOpacity={0.35 + 0.65 * pulse} strokeWidth={1.5 + 2 * pulse} />
    <text x={170} y={186} textAnchor="middle" className="ma-k">Large model</text>
    <text x={170} y={212} textAnchor="middle" className="ma-l">reads every weight</text>
    <text x={170} y={232} textAnchor="middle" className="ma-l">to write one word</text>
    <path d={`M300 205C340 205 340 ${130} 372 ${130}`} fill="none" stroke={C.acc} strokeOpacity={0.25 + 0.6 * pulse} strokeWidth={1.5} />

    {/* the answer, one word per call */}
    {words.map((w, i) => i < n && (
      <text key={i} x={PLACED[i]} y={140} className="ma-word" style={{ fill: i === n - 1 && n <= words.length ? C.acc : C.ink }} opacity={ease.out(prog(t, 700 + i * step, 700 + i * step + 300))}>{w}</text>
    ))}

    {/* the calls, one after another */}
    <text x={380} y={214} className="ma-l">large-model calls, in series</text>
    {words.map((_, i) => (
      <rect key={i} x={380 + i * 56} y={228} width={48} height={36} rx={4} fill={C.acc} opacity={i < n ? 0.85 : 0.08} />
    ))}
    {words.map((_, i) => i < n && <text key={`n${i}`} x={404 + i * 56} y={252} textAnchor="middle" className="ma-l" style={{ fill: "#1a1205" }}>{i + 1}</text>)}
    <text x={380} y={330} className="ma-big" style={{ fill: C.acc }}>{Math.max(0, n)}</text>
    <text x={450} y={330} className="ma-k">{n === 1 ? "call" : "calls"} for {Math.max(0, n)} {n === 1 ? "word" : "words"}</text>
    <text x={380} y={392} className="ma-h2" opacity={last}>Each call waits for the one before it: the next word depends on this one.</text>
  </svg>;
}

/** Calls per answer by how good the guesses are: the result and its condition. */
function Modes({ t }: SceneProps) {
  const k = ease.out(prog(t, 500, 2200));
  const rows: [string, number, number][] = [["every guess right", ALIGNED.targetCalls, ALIGNED.discardedPositions], ["one wrong guess", MIXED.targetCalls, MIXED.discardedPositions], ["every guess wrong", MISS.targetCalls, MISS.discardedPositions]];
  return <svg viewBox="0 0 560 150" role="img" aria-label="Large-model calls for the same answer by guess quality">
    <text x={0} y={14} className="ma-l">large-model calls for the same 12 words</text>
    {rows.map(([label, calls, waste], i) => (
      <g key={label} transform={`translate(0 ${34 + i * 38})`}>
        <text x={0} y={16} className="ma-l">{label}</text>
        <rect x={160} y={2} width={(calls / 12) * 300 * k} height={18} rx={2} fill={calls >= 12 ? C.red : C.ok} opacity={0.85} />
        <text x={470} y={16} className="ma-l" style={{ fill: C.ink }}>{calls} · {waste} wasted</text>
      </g>
    ))}
  </svg>;
}

export const SPEC_ARC: { problem: ArcBeat; mechanism: ArcBeat; impact: ArcBeat; systemTitle: string } = {
  problem: { label: "Problem", title: "Writing an answer takes one large-model call per word, one after another", ms: PROBLEM_MS, Scene: Problem },
  mechanism: { label: "How it works", title: "A small model guesses ahead; the large model checks every guess in one pass", ms: 19000, render: (on) => <DraftFilm active={on} /> },
  systemTitle: "Round by round, in our draft-verification model",
  impact: {
    label: "Impact", title: "Fewer serial calls, as long as the guesses are good", ms: 9000,
    Scene: makeImpact({
      from: MIXED.baselineCalls, to: MIXED.targetCalls, unit: "calls", digits: 0,
      what: "Serial large-model calls for the same 12-word answer",
      cause: "Each verification pass keeps every guess up to the first wrong one, plus one word of its own; one wrong guess in four costs a single correction.",
      base: "One word per call", optimized: "Draft 4, verify once",
      cost: { what: `Extra work: ${MIXED.draftTokens} drafted words; verified positions thrown away`, from: 0, to: MIXED.discardedPositions, unit: "positions", digits: 0 },
      Figure: Modes,
    }),
  },
};
