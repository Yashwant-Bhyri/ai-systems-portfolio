"use client";

import { DraftFilm } from "../stagecraft/draft-film";
import { draftStudy, TARGET_UNITS } from "../draft-verification-model";
import { ease, prog } from "../../exhibit/engine";
import { STEP_OVERHEAD, bandwidth, decodeBytes } from "../calibration";
import { makeImpact, type ArcBeat, type ArcLedger, type SceneProps } from "../stagecraft/module-arc";

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

    {/* the calls, one after another: what the bottleneck caption points at */}
    <g data-focus-spot>
    <text x={380} y={214} className="ma-l">large-model calls, in series</text>
    {words.map((_, i) => (
      <rect key={i} x={380 + i * 56} y={228} width={48} height={36} rx={4} fill={C.acc} opacity={i < n ? 0.85 : 0.08} />
    ))}
    {words.map((_, i) => i < n && <text key={`n${i}`} x={404 + i * 56} y={252} textAnchor="middle" className="ma-l" style={{ fill: "#1a1205" }}>{i + 1}</text>)}
    <text x={380} y={330} className="ma-big" style={{ fill: C.acc }}>{Math.max(0, n)}</text>
    <text x={450} y={330} className="ma-k">{n === 1 ? "call" : "calls"} for {Math.max(0, n)} {n === 1 ? "word" : "words"}</text>
    </g>
  </svg>;
}

/* Wall time, calibrated (calibration.ts). The target, Qwen3-4B, reads 8 GB per step. The draft is
   an EAGLE-3 head trained for Qwen3-4B (AngelSlim/Qwen3-4B_eagle3, the drafter TensorRT-LLM lists for
   this model): one decoder layer that reads the target's own hidden states, a feature-fusion layer
   and a 32k-token draft vocabulary, about 0.2 B parameters (estimated from that architecture), plus
   one layer of KV cache. A verification pass over the drafted positions is still one memory-bound
   read of the target. */
export const DRAFT_MODEL = { name: "EAGLE-3 head for Qwen3-4B", id: "AngelSlim/Qwen3-4B_eagle3", params: 0.2e9 } as const;
const TARGET_MS = (STEP_OVERHEAD + decodeBytes(10_000, false) / bandwidth()) * 1000;
const DRAFT_MS = (STEP_OVERHEAD + (DRAFT_MODEL.params * 2 + 10_000 * 2 * 1 * 8 * 128 * 2) / bandwidth()) * 1000;
const timeOf = (st: ReturnType<typeof draftStudy>) => st.rounds.reduce((a, r) => a + r.proposal.length * DRAFT_MS + TARGET_MS, 0);
export const SPEC_TIME = { serial: MIXED.baselineCalls * TARGET_MS, speculative: timeOf(MIXED), aligned: timeOf(ALIGNED), miss: timeOf(MISS) };

/** Each round: four cheap draft steps, then one verification read of the target. */
const SPEC_TIMELINE = MIXED.rounds.flatMap((r, i) => {
  const at = MIXED.rounds.slice(0, i).reduce((x, q) => x + q.proposal.length * DRAFT_MS + TARGET_MS, 0);
  return [
    ...r.proposal.map((w, j) => ({ kind: "draft" as const, a: at + j * DRAFT_MS, b: at + (j + 1) * DRAFT_MS, word: w, ok: j < r.accepted })),
    { kind: "verify" as const, a: at + r.proposal.length * DRAFT_MS, b: at + r.proposal.length * DRAFT_MS + TARGET_MS, word: r.committed.join(" "), ok: true },
  ];
});
/** The answer, call by call, in wall time; and how the gain depends on the guesses. */
function Modes({ t }: SceneProps) {
  const k = ease.io(prog(t, 300, 3600));
  // the two timelines share one scale; the guess-quality row below has its own
  const L = 220, R = 1170, span = SPEC_TIME.serial * 1.04, sx = (ms: number) => L + (ms / span) * (R - L);
  const modeMax = Math.max(SPEC_TIME.serial, SPEC_TIME.miss);
  const now = k * span;
  const serial = Array.from({ length: MIXED.baselineCalls }, (_, i) => ({ a: i * TARGET_MS, b: (i + 1) * TARGET_MS, word: TARGET_UNITS[i] }));
  const spec = SPEC_TIMELINE;
  const modes: [string, number, number][] = [["every guess right", ALIGNED.targetCalls, SPEC_TIME.aligned], ["one wrong guess", MIXED.targetCalls, SPEC_TIME.speculative], ["every guess wrong", MISS.targetCalls, SPEC_TIME.miss]];
  return <svg viewBox="0 0 1200 380" role="img" aria-label="The same 12-word answer: twelve serial large-model calls against drafting and verifying, in milliseconds">
    <text x={0} y={58} className="ma-k">One call per word</text>
    <text x={0} y={78} className="ma-l">large model only</text>
    {serial.filter((c) => c.a <= now).map((c, i) => <g key={i}>
      <rect x={sx(c.a) + 1} y={40} width={Math.max(0, sx(Math.min(c.b, now)) - sx(c.a) - 2)} height={38} rx={3} fill={C.acc} opacity={0.85} />
      {now >= c.b && sx(c.b) - sx(c.a) > 34 && <text x={(sx(c.a) + sx(c.b)) / 2} y={64} textAnchor="middle" className="ma-l" style={{ fill: "#1a1205" }}>{c.word}</text>}
    </g>)}
    {now >= SPEC_TIME.serial && <text x={sx(SPEC_TIME.serial)} y={30} textAnchor="end" className="ma-n" style={{ fill: C.ink }}>{SPEC_TIME.serial.toFixed(0)} ms</text>}
    <text x={0} y={152} className="ma-k">Draft 4, verify once</text>
    <text x={0} y={172} className="ma-l">small guesses, large checks</text>
    {spec.filter((c) => c.a <= now).map((c, i) => <rect key={i} x={sx(c.a) + 0.5} y={c.kind === "draft" ? 150 : 134} width={Math.max(0, sx(Math.min(c.b, now)) - sx(c.a) - 1)} height={c.kind === "draft" ? 22 : 38} rx={3}
      fill={c.kind === "verify" ? C.acc : c.ok ? C.ok : C.red} opacity={c.kind === "verify" ? 0.85 : 0.6} />)}
    {now >= SPEC_TIME.speculative && <text x={sx(SPEC_TIME.speculative)} y={124} textAnchor="end" className="ma-n" style={{ fill: C.ink }}>{SPEC_TIME.speculative.toFixed(0)} ms · {(SPEC_TIME.serial / SPEC_TIME.speculative).toFixed(2)}× sooner</text>}
    <g transform="translate(220 214)">
      {[[`large-model call · ${TARGET_MS.toFixed(1)} ms`, C.acc], [`draft guess kept · ${DRAFT_MS.toFixed(1)} ms`, C.ok], ["draft guess thrown away", C.red]].map(([l, c], i) => <g key={l} transform={`translate(${i * 340} 0)`}><rect width={14} height={14} rx={2} fill={c} opacity={0.8} /><text x={22} y={12} className="ma-l">{l}</text></g>)}
    </g>
    <text x={0} y={272} className="ma-k">It depends on the guesses</text>
    {modes.map(([l, calls, ms], i) => <g key={l} transform={`translate(${220 + i * 320} 256)`}>
      <text x={0} y={14} className="ma-l">{l}</text>
      <rect x={0} y={24} width={((ms / modeMax) * 290) * Math.min(1, k * 1.4)} height={14} rx={2} fill={ms > SPEC_TIME.serial ? C.red : C.ok} opacity={0.85} />
      <text x={0} y={60} className="ma-n" style={{ fill: C.ink }}>{ms.toFixed(0)} ms</text>
      <text x={0} y={80} className="ma-l">{calls} large-model calls</text>
    </g>)}
  </svg>;
}

export const SPEC_ARC: { problem: ArcBeat; mechanism: ArcBeat; impact: ArcBeat; systemTitle: string; ledger?: ArcLedger } = {
  problem: {
    label: "Problem / Bottleneck", title: "Writing an answer takes one large-model call per word, one after another", ms: PROBLEM_MS, Scene: Problem,
    meter: [[0, "Qwen3-4B writes the answer one word per call"], [900, "Call after call: each one waits for the word before it"], [8000, "12 calls for 12 words"]],
    bottleneck: { at: 8300, headline: "12 calls for 12 tokens: serialized computation", effect: "every token is a full pass over 8 GB of weights, and the next cannot start until this one ends, so latency grows with every token" },
  },
  mechanism: {
    label: "Optimized solution", title: `Optimized solution: a draft model (${DRAFT_MODEL.name}) guesses ahead; Qwen3-4B checks every guess in one pass`, ms: 19000, render: (on) => <DraftFilm active={on} />,
    meter: [[0, "The answer so far"], [2000, `Draft model (${DRAFT_MODEL.name}) is drafting the next words`], [3600, "Qwen3-4B verifies all drafted words in one pass"], [4800, "3 accepted, the 4th rejected: everything after it is dropped"], [6000, "Qwen3-4B writes its own word in place of the rejected one"], [7600, "4 words from 1 large-model call"], [10600, "Round 2: the first guess is wrong, so the draft is wasted"], [15600, "Speculation pays only when the guesses are good"]],
  },
  systemTitle: "Round by round, in our draft-verification model",
  ledger: { metric: "Serial Qwen3-4B calls for the 12-word answer", unit: "calls", baseline: MIXED.baselineCalls, optimized: MIXED.targetCalls, baselineLabel: "One word per call", optimizedLabel: "Draft, then verify" },
  impact: {
    label: "Impact", title: "Fewer serial calls, as long as the guesses are good", ms: 9000,
    meter: [[0, `${MIXED.baselineCalls} → ${MIXED.targetCalls} serial calls for the same answer`], [3600, "The price: drafted words that get thrown away"]],
    Scene: makeImpact({
      lesson: `The same answer needs ${MIXED.baselineCalls - MIXED.targetCalls} fewer serial passes of Qwen3-4B, so it arrives ${(SPEC_TIME.serial / SPEC_TIME.speculative).toFixed(2)}× sooner, but only while the drafts are mostly right.`,
      from: MIXED.baselineCalls, to: MIXED.targetCalls, unit: "calls", digits: 0,
      what: "Serial large-model calls for the same 12-word answer",
      cause: `Each verification pass keeps every guess up to the first wrong one, plus one word of its own. In wall time on one H100 that is ${SPEC_TIME.serial.toFixed(0)} → ${SPEC_TIME.speculative.toFixed(0)} ms for the answer: the draft model's steps are cheap but not free.`,
      base: "One word per call", optimized: "Draft 4, verify once",
      cost: { what: `Extra work: ${MIXED.draftTokens} drafted words, of which these were thrown away`, to: MIXED.draftTokens - MIXED.acceptedTokens, unit: "words", digits: 0 },
      Figure: Modes,
    }),
  },
};
