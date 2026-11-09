"use client";

import { simulateLab } from "../lab-simulation";
import { ease, prog } from "../../exhibit/engine";
import type { ArcBeat, SceneProps } from "../stagecraft/module-arc";

/* Post-training, told the way the serving modules are told. Each move starts with
   what it is and how the model learns from it, on the one coding task the lab
   follows throughout (first_item). These scenes are teaching examples; every
   count comes from the lab's 96-task model. */
const RUN = { base: simulateLab(0, 1), sft: simulateLab(1, 1), rl: simulateLab(2, 1), rl4: simulateLab(2, 4), lean: simulateLab(3, 4) };
const perTask = (r: typeof RUN.base) => r.tokens / r.n;
const f = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 0 });
const C = { rose: "#f3a0bc", ok: "#b8e986", bad: "#ff8f86", ink: "#eef2f6", dim: "#5e6a76", amber: "#ffc267", blue: "#9cc5f5" };

/* ── SFT: copy a verified trace, token by token ───────────────────────── */
const TRACE = ["if", "not", "xs", ":", "return", "None", "return", "xs", "[0]"];
const GUESS: readonly (readonly string[])[] = [
  ["return", "xs", "[0]", "·", "·", "·", "·", "·", "·"],
  ["if", "xs", "[0]", ":", "return", "xs", "return", "xs", "[0]"],
  ["if", "not", "xs", ":", "return", "None", "return", "xs", "[0]"],
];
const ROW = 62, TX = 190;
function Sft({ t }: SceneProps) {
  const it = Math.min(2, Math.floor(prog(t, 2500, 9500) * 3));
  const reveal = (i: number) => ease.out(prog(t, 500 + i * 120, 800 + i * 120));
  const wrong = GUESS[it].filter((g, i) => g !== TRACE[i]).length;
  const loss = [1.0, 0.44, 0.03][it];
  return <svg viewBox="0 0 1100 400" role="img" aria-label="Supervised fine-tuning compares the model's next token with a verified trace; the adapter's updates remove the mismatches">
    <text x={0} y={30} className="sb-rl">Task</text>
    <text x={TX} y={30} className="sb-w">first_item([]) crashes. Fix it.</text>
    <text x={0} y={94} className="sb-rl">Verified trace</text>
    {TRACE.map((w, i) => <g key={i} opacity={reveal(i)} transform={`translate(${TX + i * ROW + (i > 3 ? 14 : 0) + (i > 5 ? 14 : 0)} 70)`}><rect width={ROW - 6} height={36} rx={5} fill="rgba(184,233,134,.14)" stroke={C.ok} /><text x={(ROW - 6) / 2} y={24} textAnchor="middle" className="sb-w" style={{ fontSize: 14 }}>{w}</text></g>)}
    <text x={0} y={162} className="sb-rl">Model, update {it + 1}</text>
    {GUESS[it].map((w, i) => { const ok = w === TRACE[i]; return <g key={`${it}-${i}`} transform={`translate(${TX + i * ROW + (i > 3 ? 14 : 0) + (i > 5 ? 14 : 0)} 138)`} data-focus-spot={!ok ? "" : undefined}><rect width={ROW - 6} height={36} rx={5} fill={ok ? "rgba(243,160,188,.14)" : "rgba(255,143,134,.22)"} stroke={ok ? C.rose : C.bad} strokeWidth={ok ? 1 : 2} /><text x={(ROW - 6) / 2} y={24} textAnchor="middle" className="sb-w" style={{ fontSize: 14, fill: ok ? C.ink : C.bad }}>{w}</text></g>; })}
    <text x={TX} y={214} className="sb-v" style={{ fill: wrong ? C.bad : C.ok }}>{wrong ? `${wrong} of ${TRACE.length} next tokens disagree with the trace` : "every next token now follows the trace"}</text>
    {/* what actually trains */}
    <text x={0} y={290} className="sb-rl">What trains</text>
    <rect x={TX} y={262} width={560} height={46} rx={6} fill="rgba(255,255,255,.03)" stroke="#46525e" />
    <text x={TX + 14} y={290} className="sb-ls">Qwen3-4B: 4.02 B weights, frozen</text>
    <rect x={TX + 560 - 56} y={262} width={56} height={46} rx={6} fill={C.rose} opacity={0.35 + 0.15 * it} stroke={C.rose} />
    <text x={TX + 572} y={282} className="sb-rl" style={{ fill: C.rose }}>LoRA adapter</text>
    <text x={TX + 572} y={302} className="sb-ls">0.82% of the weights</text>
    <text x={0} y={358} className="sb-rl">Loss</text>
    <rect x={TX} y={344} width={560} height={14} rx={3} fill="rgba(255,255,255,.04)" />
    <rect x={TX} y={344} width={560 * loss} height={14} rx={3} fill={C.rose} style={{ transition: "width .7s cubic-bezier(.2,.75,.2,1)" }} />
  </svg>;
}

/* ── GRPO: attempts, a reward from the tests, the group decides ────────── */
const ATTEMPTS = [
  { steps: ["read xs", "return xs[0]", "stop"], tests: [1, 1, 0], p0: 0.45, p1: 0.2 },
  { steps: ["read xs", "guard []", "return xs[0]"], tests: [1, 1, 1], p0: 0.2, p1: 0.5 },
  { steps: ["try xs[0]", "except: None", "stop"], tests: [1, 1, 1], p0: 0.15, p1: 0.25 },
  { steps: ["return None", "stop", ""], tests: [0, 1, 0], p0: 0.2, p1: 0.05 },
] as const;
const REWARD = ATTEMPTS.map((a) => a.tests.reduce<number>((x, v) => x + v, 0) / 3);
const MEAN = REWARD.reduce((a, b) => a + b, 0) / REWARD.length;
function Grpo({ t }: SceneProps) {
  const X = 180, SW = 150;
  const y = (i: number) => 58 + i * 74;
  const testsAt = 3400, gradeAt = 6200, updateAt = 8400;
  const up = ease.io(prog(t, updateAt, updateAt + 2200));
  return <svg viewBox="0 0 1240 400" role="img" aria-label="Four attempts at the same task are scored by its tests; attempts above the group mean become more likely">
    <text x={0} y={24} className="sb-rl">Same task, 4 of 8 attempts</text>
    <text x={X + 3 * SW + 20} y={24} className="sb-rl" opacity={prog(t, testsAt, testsAt + 300)}>Tests</text>
    <text x={X + 3 * SW + 150} y={24} className="sb-rl" opacity={prog(t, gradeAt, gradeAt + 300)}>Against the group</text>
    <text x={X + 3 * SW + 400} y={24} className="sb-rl" opacity={prog(t, updateAt, updateAt + 300)}>How often it is written</text>
    {ATTEMPTS.map((a, i) => {
      const adv = REWARD[i] - MEAN, tone = adv > 0 ? C.ok : C.bad;
      return <g key={i}>
        <text x={0} y={y(i) + 25} className="sb-ls">attempt {i + 1}</text>
        {a.steps.map((s, j) => s && <g key={j} opacity={ease.out(prog(t, 300 + i * 500 + j * 220, 600 + i * 500 + j * 220))} transform={`translate(${X + j * SW} ${y(i)})`}>
          <rect width={SW - 10} height={38} rx={5} fill="rgba(255,255,255,.03)" stroke="#55626f" />
          <text x={(SW - 10) / 2} y={24} textAnchor="middle" className="sb-w" style={{ fontSize: 13.5 }}>{s}</text>
        </g>)}
        {a.tests.map((v, j) => <text key={j} x={X + 3 * SW + 28 + j * 32} y={y(i) + 26} className="sb-v" style={{ fill: v ? C.ok : C.bad }} opacity={prog(t, testsAt + i * 300 + j * 120, testsAt + 200 + i * 300 + j * 120)}>{v ? "✓" : "✗"}</text>)}
        <g opacity={prog(t, gradeAt, gradeAt + 500)} data-focus-spot>
          <path d={`M${X + 3 * SW + 290} ${y(i) + 19}h${adv * 150}`} stroke={tone} strokeWidth={14} strokeLinecap="butt" />
          <text x={X + 3 * SW + 150} y={y(i) + 25} className="sb-v" style={{ fill: tone, fontSize: 15 }}>{adv > 0 ? "+" : "−"}{Math.abs(adv).toFixed(2)}</text>
        </g>
        <g opacity={prog(t, updateAt, updateAt + 400)}>
          <rect x={X + 3 * SW + 400} y={y(i) + 8} width={160} height={22} rx={3} fill="rgba(255,255,255,.04)" />
          <rect x={X + 3 * SW + 400} y={y(i) + 8} width={160 * (a.p0 + (a.p1 - a.p0) * up)} height={22} rx={3} fill={adv > 0 ? C.rose : "#6c5560"} />
          <text x={X + 3 * SW + 568} y={y(i) + 25} className="sb-ls">{Math.round(100 * (a.p0 + (a.p1 - a.p0) * up))}%</text>
        </g>
      </g>;
    })}
    <text x={X} y={368} className="sb-ls" opacity={prog(t, gradeAt, gradeAt + 400)}>Group mean reward {MEAN.toFixed(2)}: only attempts above it pull the policy towards them. No labels, no teacher: just the tests.</text>
  </svg>;
}

/* ── Thinking budget: same weights, more room ─────────────────────────── */
function Budget({ t }: SceneProps) {
  const rows = [["1× thinking budget", 1], ["2×", 2], ["4×", 4]] as const;
  const needed = 3.2, X = 200, PX = 190;
  const k = ease.io(prog(t, 600, 7200));
  return <svg viewBox="0 0 1100 340" role="img" aria-label="An answer needs more reasoning than a one-times budget allows; four times the budget reaches the verified answer">
    <text x={X} y={24} className="sb-ls">The reasoning this task needs, with the same weights</text>
    <rect x={X} y={38} width={needed * PX} height={30} rx={4} fill="rgba(255,255,255,.04)" stroke="#55626f" strokeDasharray="4 3" />
    {["read the code", "reproduce", "find the cause", "fix and verify"].map((s, i) => <text key={s} x={X + 12 + (i * needed * PX) / 4} y={58} className="sb-ls">{s}</text>)}
    {rows.map(([label, b], i) => {
      const y = 96 + i * 72, w = Math.min(b, needed) * PX * Math.min(1, k * 4 / b), ok = b >= needed;
      return <g key={label}>
        <text x={0} y={y + 26} className="sb-rl">{label}</text>
        <rect x={X} y={y} width={b * PX} height={40} rx={4} fill="none" stroke="#3f4a55" />
        <rect x={X} y={y} width={w} height={40} rx={4} fill={C.amber} opacity={0.75} />
        {k > 0.25 * b && <text x={X + b * PX + 12} y={y + 26} className="sb-v" style={{ fill: ok ? C.ok : C.bad }}>{ok ? "reaches a verified fix ✓" : "out of budget, no fix ✗"}</text>}
      </g>;
    })}
    <text x={0} y={322} className="sb-ls" opacity={prog(t, 7400, 8000)}>No weights change here: only how much GPU time each answer may spend, so the cost rises with it.</text>
  </svg>;
}

/* ── Lean RL, shown on agents ───────────────────────────────────────────
   Eight agents attempt the same task, each streaming its reasoning trace token by token. The tests
   mark each answer; tokens past the length target are charged against the reward; the rewards flow
   back as an update; and the next round writes the same answers in fewer tokens. The traces are
   illustrative; the totals at the end are the lab's own. */
const AGENTS = [
  { len: 40, ok: 1 }, { len: 27, ok: 1 }, { len: 44, ok: 0 }, { len: 19, ok: 1 },
  { len: 36, ok: 1 }, { len: 48, ok: 1 }, { len: 23, ok: 0 }, { len: 31, ok: 1 },
] as const;
const TARGET = 24, LAMBDA = 0.5, TOK = 11, TX0 = 150, GATE = 712;
const leaner = (len: number) => Math.round(len <= TARGET ? len : TARGET + (len - TARGET) * 0.2);
const rewardOf = (len: number, ok: number) => (ok ? 1 - (LAMBDA * Math.max(0, len - TARGET)) / TARGET : 0);
const LEAN_MS = 15000;
function Lean({ t }: SceneProps) {
  const second = t >= 8600;
  const stream = second ? prog(t, 8600, 11400) : prog(t, 300, 3200);
  const marks = second ? prog(t, 11500, 12500) : prog(t, 3200, 4500);
  const charge = second ? prog(t, 11800, 12600) : prog(t, 4600, 5600);
  const update = prog(t, 6600, 8200), fadeOut = 1 - prog(t, 8200, 8600);
  const result = prog(t, 12800, 13600);
  const lens = AGENTS.map((a) => (second ? leaner(a.len) : a.len));
  const mean = Math.round(lens.reduce((x, l) => x + l, 0) / lens.length);
  const mean1 = Math.round(AGENTS.reduce((x, a) => x + a.len, 0) / AGENTS.length);
  const tx = (u: number) => TX0 + u * TOK;
  const yOf = (i: number) => 30 + i * 34;
  return <svg viewBox="0 0 1100 340" role="img" aria-label="Eight agents write reasoning traces; the tests mark each answer; tokens past a length target are charged; the update makes short correct traces more likely, and the next round gives the same answers in fewer tokens">
    {/* the prompt, and the eight agents it goes to */}
    <circle cx={34} cy={163} r={14} fill={C.ink} />
    <text x={34} y={196} textAnchor="middle" className="sb-ls">task</text>
    {AGENTS.map((_, i) => <path key={i} d={`M48 163C80 163 84 ${yOf(i) + 10} 112 ${yOf(i) + 10}`} stroke="rgba(230,237,244,.18)" fill="none" />)}
    {/* the length target */}
    <g opacity={Math.max(prog(t, 4200, 4800), second ? 1 : 0)}>
      <path d={`M${tx(TARGET)} 18V300`} stroke={C.amber} strokeDasharray="3 5" />
      <text x={tx(TARGET)} y={14} textAnchor="middle" className="sb-ls" style={{ fill: C.amber }}>length target</text>
    </g>
    {AGENTS.map((a, i) => {
      const y = yOf(i), len = lens[i], shown = Math.floor(len * stream);
      const rw = rewardOf(len, a.ok);
      return <g key={i} opacity={second ? 1 : fadeOut > 0 ? 1 : 0}>
        <circle cx={124} cy={y + 10} r={8} fill={C.rose} opacity={0.9} />
        <text x={124} y={y + 14} textAnchor="middle" style={{ fill: "#0b1016", font: "600 10px ui-monospace, monospace" }}>{i + 1}</text>
        {Array.from({ length: shown }, (_, k) => {
          const over = k >= TARGET && charge > 0;
          return <rect key={k} x={tx(k)} y={y + 3} width={TOK - 2} height={14} rx={2} fill={over ? C.bad : C.rose} opacity={over ? 0.55 + 0.45 * charge : 0.85} />;
        })}
        {/* the tests: right or wrong */}
        <g opacity={marks}>
          <path d={`M${tx(len) + 4} ${y + 10}H${GATE - 6}`} stroke="rgba(230,237,244,.14)" strokeDasharray="2 4" />
          <text x={GATE + 6} y={y + 16} className="sb-v" style={{ fill: a.ok ? C.ok : C.bad, fontSize: 18 }}>{a.ok ? "✓" : "✗"}</text>
        </g>
        {/* the reward: correct, minus a charge for every token past the target */}
        <g opacity={charge}>
          <rect x={GATE + 36} y={y + 4} width={Math.max(2, rw * 110)} height={12} rx={3} fill={a.ok ? C.ok : C.dim} opacity={0.85} />
          <text x={GATE + 156} y={y + 15} className="sb-ls" style={{ fill: a.ok ? C.ok : C.bad }}>{rw.toFixed(2)}</text>
        </g>
        {/* the update flows back to the agent that wrote it */}
        {!second && update > 0 && update < 1 && (
          <circle r={4} fill={a.ok ? C.ok : C.dim} cx={GATE + 36 - (GATE + 36 - 124) * update} cy={y + 10 + Math.sin(update * Math.PI) * -12} />
        )}
      </g>;
    })}
    <path d={`M${GATE} 18V300`} stroke="rgba(230,237,244,.4)" strokeWidth={2} />
    <text x={GATE} y={14} textAnchor="middle" className="sb-ls">tests</text>
    <text x={GATE + 36} y={14} className="sb-ls" opacity={Math.max(charge, second ? 1 : 0)}>reward = right − {LAMBDA} × tokens past the target</text>
    {/* the round, and what it costs */}
    <g transform="translate(940 40)">
      <text x={0} y={0} className="sb-ls">{second ? "Round 2, after the update" : "Round 1"}</text>
      <text x={0} y={34} className="sb-v" style={{ fontSize: 30, fill: C.ink }}>{Math.round(mean * stream)}</text>
      <text x={0} y={50} className="sb-ls">tokens per trace, mean</text>
      <text x={0} y={84} className="sb-v" style={{ fontSize: 22, fill: C.ok }}>{AGENTS.filter((a) => a.ok).length} of 8</text>
      <text x={0} y={104} className="sb-ls">answers right</text>
      {second && <text x={0} y={136} className="sb-ls" style={{ fill: C.amber }}>was {mean1}</text>}
    </g>
    <text x={0} y={322} className="sb-ls" opacity={update > 0 && !second ? Math.min(1, update * 2) : 0}>The update makes the short, right traces more likely; a wrong answer earns nothing however short it is.</text>
    <g opacity={result}>
      <text x={0} y={322} className="sb-ls" style={{ fill: C.ink }}>{`Across all 96 tasks: ${f(perTask(RUN.rl4))} → ${f(perTask(RUN.lean))} tokens per answer, and still ${RUN.lean.correct} solved.`}</text>
    </g>
  </svg>;
}

export const LEARN_ARCS: Record<number, { name: string; mechanism: ArcBeat }> = {
  1: {
    name: "SFT + LoRA",
    mechanism: {
      label: "how it learns", title: "Imitate a verified trace: a tiny adapter learns to predict each next token", ms: 11500, Scene: Sft,
      bottleneck: { at: 0, headline: `the base model writes plausible reasoning that is often wrong: ${RUN.base.correct} of 96 solved.`, effect: "It has never been shown what a verified line of reasoning looks like for these tasks." },
      meter: [[0, "A verified trace is the answer key, token by token"], [2500, "Update 1: most next tokens disagree with the trace"], [4800, "Update 2: the adapter has learned the guard"], [7200, "Update 3: every next token follows the trace"]],
    },
  },
  2: {
    name: "Learn from outcomes (GRPO)",
    mechanism: {
      label: "how it learns", title: "Write several attempts, run the tests, make the better ones more likely", ms: 12000, Scene: Grpo,
      bottleneck: { at: 0, headline: `imitation stops where the examples stop: ${96 - RUN.sft.correct} tasks are still wrong after SFT.`, effect: "So the model has to learn from its own attempts, with the tests as the only judge." },
      meter: [[0, "The model writes 8 attempts at the same task"], [3400, "The task's tests score every attempt"], [6200, "Each attempt is compared with its own group's mean"], [8400, "Attempts above the mean get written more often"]],
    },
  },
  3: {
    name: "Thinking budget",
    mechanism: {
      label: "how it works", title: "Same weights, more room to reason", ms: 9500, Scene: Budget,
      bottleneck: { at: 0, headline: `${96 - RUN.rl.correct} tasks still fail, many because the reasoning runs out before the fix.`, effect: "The model may know how to solve them; at a 1× budget it stops too early." },
      meter: [[0, "This task needs more reasoning than a 1× budget allows"], [3000, "At 4× the same weights reach a verified fix"], [7400, "More budget means more GPU time per answer"]],
    },
  },
  4: {
    name: "Lean RL",
    mechanism: {
      label: "how it learns", title: "Lean RL: reward correct answers, charge for every token", ms: LEAN_MS, Scene: Lean,
      bottleneck: { at: 0, headline: `thinking works, but answers now run to ${f(perTask(RUN.rl4))} tokens each, and every token costs GPU time.`, effect: "Most of that length does not change whether the answer is right." },
      meter: [[0, "Eight agents attempt the same task, each writing its reasoning trace"], [3200, "The tests mark each answer right or wrong"], [4600, "Tokens past the length target are charged against the reward"], [6600, "The update makes short, right traces more likely"], [8600, "The next round: the same answers, in fewer tokens"], [12800, `All 96 tasks: ${f(perTask(RUN.rl4))} → ${f(perTask(RUN.lean))} tokens per answer, still ${RUN.lean.correct} solved`]],
    },
  },
};
