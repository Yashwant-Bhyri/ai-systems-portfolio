"use client";

import { useId } from "react";
import {
  adapterFrame,
  adapterSnapshots,
  relativePolicy,
  TOY_W,
} from "./policy-film-math";
import { Hotspot, type Inspectors } from "./lab-story-scenes";
import { useFilmTime } from "./use-film-time";
import { clamp01, windowProgress } from "./inference-film-math";

const FRAMES = adapterSnapshots();
const BLUE = "#78a8ff",
  ROSE = "#f3a0bc",
  GREEN = "#b8e986",
  GREY = "#8a9eb2";
const BEHAVIOR = [
  {
    action: "A shortcut skips the edge case",
    before: "return xs[0]",
    after: "IndexError on []",
    note: "Two tests pass; the empty-list test crashes.",
  },
  {
    action: "Learn the complete fix",
    before: "guard → return",
    after: "if not xs: return None",
    note: "Supervision teaches the structure; the adapter is the parameter update.",
  },
  {
    action: "Prefer the verified attempt",
    before: "2 / 3 ×   ·   3 / 3 ✓",
    after: "Reinforce the patch that passes",
    note: "A fluent patch that fails a test earns no reward.",
  },
  {
    action: "Use more attempts, not new weights",
    before: "Attempt 1: no guard",
    after: "Attempt 3: guard + return",
    note: "At 1× or 2× this search misses the guard. At 4× it finds it.",
  },
  {
    action: "Keep the test, drop the detour",
    before: "Two passing patches: long / direct",
    after: "if not xs: return None ✓",
    note: "Efficiency rewards keep the checks that make a patch valid.",
  },
];

function PolicyInPractice({
  step,
  progress,
}: {
  step: number;
  progress: number;
}) {
  const p = windowProgress(progress, 0.65, 0.96),
    trained = step > 0;
  const valid = trained && p > 0.76;
  return (
    <div className="cf-practice pf-practice">
      <div className="cf-practice-heading">
        <span>From the update to the answer</span>
        <small>Teaching scenario</small>
      </div>
      <div className="cf-user-question">
        <span>USER</span>
        <div>
          <p>“first_item([]) crashes. Fix it.”</p>
          <small>
            {step === 0
              ? "A plausible patch misses the empty list"
              : step === 1
                ? "A demonstration teaches the guard"
                : step === 2
                  ? "Unit tests separate the two attempts"
                  : "Keep the guard, drop the detour"}
          </small>
        </div>
      </div>
      <svg
        viewBox="0 0 650 163"
        className="pf-case-routes"
        role="img"
        aria-label={
          trained
            ? "The verified patch guards the empty list and passes all three tests."
            : "The base patch returns xs[0] and crashes on an empty list."
        }
      >
        {[0, 1].map((row) => {
          const y = 45 + row * 79,
            c = row ? "#b8e986" : "#ffa999";
          return (
            <g key={row} opacity={row && !trained ? 0.2 : 1}>
              <text x="3" y={y - 24} className="ls-small">
                {row
                  ? step === 1
                    ? "Demonstrated route"
                    : "Verified route"
                  : "Incomplete shortcut"}
              </text>
              <path d={`M44 ${y}H535`} stroke="#344e60" />
              <path
                d={`M44 ${y}H535`}
                stroke={c}
                strokeWidth="2"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset={
                  1 - (row ? clamp01((p - 0.25) / 0.7) : clamp01(p / 0.48))
                }
              />
              {(row ? ["read xs", "guard []", "return xs[0]"] : ["read xs", "return xs[0]", "stop"]).map((text, i) => (
                <g
                  key={i}
                  style={{ opacity: p > i * 0.16 + row * 0.14 ? 1 : 0.26 }}
                >
                  <rect
                    x={20 + i * 180}
                    y={y - 17}
                    width="92"
                    height="34"
                    rx="3"
                    fill="#132634"
                    stroke={row ? "#739858" : "#916653"}
                  />
                  <text
                    x={66 + i * 180}
                    y={y + 5}
                    textAnchor="middle"
                    className="ls-label"
                  >
                    {text}
                  </text>
                </g>
              ))}
              <text
                x="552"
                y={y + 6}
                fill={c}
                fontSize="20"
                opacity={p > 0.7 ? 1 : 0.15}
              >
                {row ? "3/3 ✓" : "2/3 ×"}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="cf-runtime-explanation">
        <i />
        <p>
          {valid
            ? "All three tests pass. The verifier accepts the patch."
            : trained
              ? "Run the tests before judging the patch."
              : "A fluent patch can still crash on the edge case."}
        </p>
      </div>
      <div className="cf-request-invariant">
        <span>
          {step === 0
            ? "base policy"
            : step === 1
              ? "offline SFT"
              : step === 2
                ? "offline relative-reward update"
                : "offline efficiency-aware update"}
        </span>
        <span>live request uses the resulting policy</span>
      </div>
    </div>
  );
}
function WeightMatrix({
  values,
  x,
  y,
  color,
  frozen = false,
}: {
  values: number[][];
  x: number;
  y: number;
  color: string;
  frozen?: boolean;
}) {
  return (
    <g>
      {values.flatMap((row, r) =>
        row.map((v, c) => (
          <rect
            key={`${r}-${c}`}
            x={x + c * 17}
            y={y + r * 17}
            width="13"
            height="13"
            rx="2"
            fill={v < 0 ? BLUE : color}
            fillOpacity={0.12 + Math.min(0.85, Math.abs(v) * 2.6)}
            stroke={frozen ? "#607487" : v < 0 ? BLUE : color}
            strokeOpacity=".35"
            className="ls-morph"
          />
        )),
      )}
    </g>
  );
}
function AdapterFilm({
  frame,
  inspect,
  base,
}: {
  frame: number;
  inspect: Inspectors;
  base: boolean;
}) {
  const f = adapterFrame(base ? 0 : frame),
    id = useId();
  const lossY = (v: number) => 305 - (v / FRAMES[0].loss) * 52;
  return (
    <svg
      viewBox="0 0 700 350"
      role="group"
      aria-labelledby={id}
      className="ls-scene pf-scene"
    >
      <title id={id}>
        Exact six-dimensional adapter teaching example. Frozen W plus trainable
        B times A. Squared-error loss, not language-model training metrics.
      </title>
      <text x="28" y="25" className="ls-overline">
        {base
          ? "The pretrained weights, before adaptation"
          : "SFT through a low-rank update: W stays frozen"}
      </text>
      <Hotspot
        inspect={inspect}
        item={{
          key: "weights",
          title: "Frozen base weights W",
          body: "All 36 entries in this 6 × 6 teaching matrix remain bit-for-bit unchanged. In LoRA, the update is represented separately as B × A; the picture is not a Qwen weight dump.",
        }}
      >
        <rect x="21" y="52" width="137" height="162" fill="transparent" />
        <text x="29" y="72" className="ls-label">
          W · frozen
        </text>
        <WeightMatrix values={TOY_W} x={30} y={88} color={ROSE} frozen />
        <text x="30" y="208" className="ls-small">
          36 fixed weights
        </text>
      </Hotspot>
      <text x="173" y="144" className="pf-equation">
        +
      </text>
      <Hotspot
        inspect={inspect}
        item={{
          key: "adapter",
          title: "Only A and B receive gradients",
          body: `Rank 2: A has 12 parameters; B has 12. W receives no update. B starts at zero, so the first A gradient is zero. Later steps update both factors. Current exact teaching loss: ${f.loss.toFixed(4)}.`,
        }}
      >
        <rect x="208" y="51" width="267" height="164" fill="transparent" />
        <text x="212" y="72" className="ls-label">
          B · 6 × 2
        </text>
        <WeightMatrix values={f.b} x={212} y={88} color={ROSE} />
        <text x="278" y="144" className="pf-equation">
          ×
        </text>
        <text x="321" y="72" className="ls-label">
          A · 2 × 6
        </text>
        <WeightMatrix values={f.a} x={321} y={120} color={ROSE} />
        <path
          className={!base ? "ls-signal" : undefined}
          d="M213 202H423"
          stroke={ROSE}
          strokeDasharray="4 9"
          fill="none"
          opacity={base ? 0.2 : 0.7}
        />
        <text x="212" y="225" className="ls-small">
          {base
            ? "B = 0 · no adapter contribution"
            : "24 trainable weights · rank 2"}
        </text>
      </Hotspot>
      <text x="479" y="144" className="pf-equation">
        =
      </text>
      <Hotspot
        inspect={inspect}
        item={{
          key: "delta",
          title: "A structured change, not a replacement",
          body: "The adapter's B × A product is a 6 × 6 update of rank at most 2. Its signed cells show an actual matrix product. The model applies (W + B A) x. Pink and blue denote opposite signs, not correctness.",
        }}
      >
        <rect x="522" y="51" width="157" height="169" fill="transparent" />
        <text x="532" y="72" className="ls-label">
          W + ΔW
        </text>
        <WeightMatrix
          values={TOY_W.map((row, r) => row.map((v, c) => v + f.delta[r][c]))}
          x={533}
          y={88}
          color={ROSE}
        />
        <text x="531" y="208" className="ls-small">
          {base ? "Same starting output" : "Adapted output"}
        </text>
      </Hotspot>
      <path d="M28 247H671" stroke="#2b3c4a" />
      <text x="28" y="273" className="ls-small">
        {base ? "y = W x" : "θ ← θ − η ∇L  ·  θ = {A, B}"}
      </text>
      <text x="28" y="297" className="ls-label">
        {base
          ? "Adapter update is zero."
          : `Update ${Math.floor(frame)}${frame % 1 > 0.01 ? ` → ${Math.ceil(frame)}` : ""} · loss ${f.loss.toFixed(3)}`}
      </text>
      <text x="28" y="327" className="ls-small">
        Teaching loss: ½ ‖(W + BA)x − target‖²
      </text>
      <path d="M427 253V310H666" stroke="#43596c" fill="none" />
      <path
        d={FRAMES.map(
          (f, i) => `${i ? "L" : "M"}${436 + i * 55} ${lossY(f.loss)}`,
        ).join(" ")}
        stroke="#536578"
        fill="none"
        strokeDasharray="3 5"
      />
      <path
        d={[
          ...FRAMES.slice(0, f.step + 1).map(
            (f, i) => `${i ? "L" : "M"}${436 + i * 55} ${lossY(f.loss)}`,
          ),
          `L${436 + f.position * 55} ${lossY(f.loss)}`,
        ].join(" ")}
        stroke={ROSE}
        fill="none"
        strokeWidth="2"
      />
      <circle cx={436 + f.position * 55} cy={lossY(f.loss)} r="5" fill={ROSE} />
      <text x="443" y="331" className="ls-small">
        0 → 4 updates · same example
      </text>
    </svg>
  );
}
function RewardFilm({
  frame,
  efficiency,
  inspect,
}: {
  frame: number;
  efficiency: boolean;
  inspect: Inspectors;
}) {
  const p = relativePolicy(Math.max(0, frame - 1) / 3, efficiency),
    id = useId();
  return (
    <svg
      viewBox="0 0 700 350"
      role="group"
      aria-labelledby={id}
      className="ls-scene pf-scene"
    >
      <title id={id}>
        Group-relative reward teaching example. A normalized exponential policy
        tilt illustrates the update direction, not the full clipped GRPO
        objective.
      </title>
      <text x="28" y="25" className="ls-overline">
        {efficiency
          ? "Reward useful work, not length alone"
          : "SAMPLE → VERIFY → COMPARE → UPDATE"}
      </text>
      <text x="28" y="64" className="ls-small">
        ONE PROMPT
      </text>
      <text x="194" y="64" className="ls-small">
        {efficiency ? "Reward − cost" : "Verifier reward"}
      </text>
      <text x="339" y="64" className="ls-small">
        ADVANTAGE
      </text>
      <text x="476" y="64" className="ls-small">
        NEXT POLICY
      </text>
      <circle cx="64" cy="175" r="22" fill="#10202d" stroke={ROSE} />
      <text x="64" y="181" textAnchor="middle" className="ls-label">
        π
      </text>
      {p.reward.map((reward, i) => {
        const y = 98 + i * 47,
          c = p.advantage[i] > 0 ? GREEN : "#ff9b8c";
        return (
          <Hotspot
            key={i}
            inspect={inspect}
            item={{
              key: `reward-${i}`,
              title: `Trajectory ${i + 1}: ${p.correct[i] ? "verified" : "failed"}`,
              body: `Reward ${reward.toFixed(2)}, group mean ${p.mean.toFixed(2)}, normalized advantage ${p.advantage[i].toFixed(2)}. Toy probability moves from 25% to ${(100 * p.probability[i]).toFixed(1)}%. ${efficiency ? "The two correct paths have different declared work costs." : "Relative advantage changes the update direction, not the verifier verdict."}`,
            }}
          >
            <path
              d={`M87 175C128 175 130 ${y} 178 ${y}`}
              fill="none"
              stroke={frame > 0 ? c : GREY}
              opacity=".4"
            />
            <rect
              x="191"
              y={y - 14}
              width="89"
              height="29"
              rx="3"
              fill={frame > 0 ? c : "#607387"}
              fillOpacity=".12"
              stroke={frame > 0 ? c : "#607387"}
              strokeOpacity=".5"
            />
            <text x="235" y={y + 5} textAnchor="middle" fill={c} fontSize="14">
              {frame > 0
                ? `${p.correct[i] ? "✓" : "×"}  ${reward.toFixed(2)}`
                : "attempt"}
            </text>
            <path d={`M288 ${y}H323`} stroke="#43586a" />
            <text
              x="370"
              y={y + 5}
              textAnchor="middle"
              fill={frame > 1 ? c : GREY}
              fontSize="14"
            >
              {frame > 1
                ? `${p.advantage[i] > 0 ? "+" : ""}${p.advantage[i].toFixed(2)}`
                : "r − mean"}
            </text>
            <path d={`M417 ${y}H459`} stroke="#43586a" />
            <rect x="477" y={y - 11} width="165" height="23" fill="#152634" />
            <rect
              x="477"
              y={y - 11}
              width={p.probability[i] * 330}
              height="23"
              fill={frame > 2 ? c : GREY}
              fillOpacity=".75"
              className="ls-morph"
            />
            <path
              d={`M559 ${y - 15}v31`}
              stroke="#c4d4df"
              strokeDasharray="2 3"
              opacity=".5"
            />
            <text x="657" y={y + 5} className="ls-small" textAnchor="end">
              {(p.probability[i] * 100).toFixed(0)}%
            </text>
          </Hotspot>
        );
      })}
      <path d="M28 283H672" stroke="#304555" />
      <text x="28" y="307" className="ls-label">
        {efficiency
          ? "Two correct paths. Prefer less wasted computation."
          : "Above the group mean: reinforce. Below it: discourage."}
      </text>
      <text x="28" y="333" className="ls-small">
        {efficiency
          ? "Toy reward = correctness − 0.25 × normalized work"
          : "Aᵢ = (rᵢ − mean) / std  ·  toy π′ ∝ π exp(ηAᵢ)"}
      </text>
    </svg>
  );
}
function SearchFilm({
  frame,
  budget,
  inspect,
}: {
  frame: number;
  budget: number;
  inspect: Inspectors;
}) {
  const id = useId(),
    expanded = Math.max(1, Math.ceil(((frame + 1) / 5) * budget));
  return (
    <svg
      viewBox="0 0 700 350"
      role="group"
      aria-labelledby={id}
      className="ls-scene pf-scene"
    >
      <title id={id}>
        Fixed checkpoint, variable candidate search. Conceptual candidates are
        separate from the numerical results cohort.
      </title>
      <text x="28" y="25" className="ls-overline">
        INFERENCE TIME · THE WEIGHTS DO NOT MOVE
      </text>
      <Hotspot
        inspect={inspect}
        item={{
          key: "locked-policy",
          title: "Same checkpoint, more attempts",
          body: "No optimizer step occurs here. Candidate generation and verification consume compute while the checkpoint identity remains fixed. The eight illustrated paths are conceptual, not measured model outputs.",
        }}
      >
        <rect
          x="27"
          y="81"
          width="147"
          height="174"
          rx="6"
          fill="#10202c"
          stroke={BLUE}
        />
        <WeightMatrix values={TOY_W} x={49} y={101} color={ROSE} frozen />
        <text x="100" y="226" textAnchor="middle" className="ls-label">
          θ* · locked
        </text>
        <text x="100" y="272" textAnchor="middle" className="ls-small">
          0 weight updates
        </text>
      </Hotspot>
      {Array.from({ length: 8 }, (_, i) => {
        const y = 61 + i * 30,
          live = i < expanded,
          allowed = i < budget,
          pass = i === 2 || i === 6;
        return (
          <Hotspot
            key={i}
            inspect={inspect}
            item={{
              key: `search-${i}`,
              title: `Candidate ${i + 1}`,
              body: !allowed
                ? "Outside the selected allowance, this candidate is not explored."
                : pass
                  ? "A verifier-accepted route in this conceptual example. Acceptance does not remove the cost of rejected candidates."
                  : "This candidate does not pass the verifier. Its generation and checking still consume resources.",
            }}
          >
            <path
              d={`M175 170C236 170 240 ${y} 290 ${y}H498`}
              stroke={live ? ROSE : "#344758"}
              strokeWidth={live ? 2 : 1}
              opacity={allowed ? 0.8 : 0.23}
              fill="none"
            />
            {[0, 1, 2, 3].map((j) => (
              <circle
                key={j}
                cx={310 + j * 47}
                cy={y}
                r="4"
                fill={live ? ROSE : "#344758"}
                opacity={allowed ? 1 : 0.25}
              />
            ))}
            <circle
              cx="526"
              cy={y}
              r="11"
              fill="#101e29"
              stroke={live ? (pass ? GREEN : "#ff9b8c") : "#344758"}
            />
            <text
              x="526"
              y={y + 4}
              fill={live ? (pass ? GREEN : "#ff9b8c") : "#6a8296"}
              fontSize="12"
              textAnchor="middle"
            >
              {live ? (pass ? "✓" : "×") : "·"}
            </text>
            {live && pass && (
              <path
                d={`M541 ${y}Q597 ${y} 628 170`}
                fill="none"
                stroke={GREEN}
                className="ls-signal"
                strokeDasharray="4 6"
              />
            )}
          </Hotspot>
        );
      })}
      <circle
        cx="643"
        cy="170"
        r="20"
        fill="#14221c"
        stroke={expanded > 2 ? GREEN : "#526c60"}
      />
      <text x="643" y="175" textAnchor="middle" fill={GREEN} fontSize="16">
        {expanded > 2 ? "✓" : "?"}
      </text>
      <text x="28" y="313" className="ls-label">
        {expanded > 2
          ? "More attempts can expose a route the first attempt missed."
          : "The allowance can be exhausted without a verified answer."}
      </text>
      <text x="28" y="338" className="ls-small">
        {expanded} of {budget} conceptual candidates · failed work still counts
      </text>
    </svg>
  );
}
export function PolicyFilm({
  step,
  budget,
  playing,
  reduced,
  inspect,
  readTime,
  onSeek,
  duration,
  onToggle,
}: {
  step: number;
  budget: number;
  playing: boolean;
  reduced: boolean;
  inspect: Inspectors;
  readTime: () => number;
  onSeek: (time: number) => void;
  duration: number;
  onToggle: () => void;
}) {
  const film = useFilmTime(readTime, playing, reduced, duration, onSeek);
  // The starting point is the request itself: the mathematics belongs to the chapters that change the weights.
  const progress = step === 0 ? 0.65 + 0.35 * (film.time / duration) : film.time / duration;
  const frame = Math.min(
    4,
    Math.max(0, ((clamp01(progress / 0.6) - 0.08) / 0.74) * 4),
  );
  const frameIndex = Math.floor(frame);
  const behavior = BEHAVIOR[step];
  const labels =
    step === 1
      ? [
          "Zero update",
          "Backpropagate to B",
          "Both factors learn",
          "Refine the update",
          "Compare the output",
        ]
      : step === 3
        ? ["Propose", "Expand", "Verify", "Reject / retain", "Select"]
        : [
            "Sample a group",
            "Verify attempts",
            "Normalize rewards",
            "Update the policy",
            "Inspect the change",
          ];
  return (
    <div className="pf-film">
      <div
        className="cf-lens-switch"
        role="group"
        aria-label="Policy story lens"
      >
        <button
          type="button"
          aria-pressed={progress < 0.65}
          onClick={() => film.seek(0)}
        >
          Mathematical mechanism
        </button>
        <span aria-hidden="true">→</span>
        <button
          type="button"
          aria-pressed={progress >= 0.65}
          onClick={() => film.seek(duration * 0.67)}
        >
          Request in practice
        </button>
      </div>
      <div
        className="cf-visual-stack"
        data-lens={progress < 0.65 ? "mechanism" : "practice"}
      >
        <div
          className="cf-technical"
          aria-hidden={progress >= 0.65}
          inert={progress >= 0.65}
        >
          {step < 2 ? (
            <AdapterFilm frame={frame} base={step === 0} inspect={inspect} />
          ) : step === 3 ? (
            <SearchFilm frame={frame} budget={budget} inspect={inspect} />
          ) : (
            <RewardFilm
              frame={frame}
              efficiency={step === 4}
              inspect={inspect}
            />
          )}
        </div>
        <div
          className="cf-practical"
          aria-hidden={progress < 0.65}
          inert={progress < 0.65}
        >
          <PolicyInPractice step={step} progress={progress} />
        </div>
      </div>
      <div className="pf-scrub">
        <button
          type="button"
          className="cf-local-play"
          disabled={reduced}
          aria-label={playing ? "Pause policy scene" : "Play policy scene"}
          onClick={onToggle}
        >
          {playing ? "Ⅱ" : "▷"}
        </button>
        <span>
          {progress >= 0.65
            ? "Follow the request"
            : step === 0
              ? "Frozen checkpoint"
              : labels[frameIndex]}
        </span>
        <input
          type="range"
          min="0"
          max={duration}
          step="10"
          value={film.time}
          aria-label="Inspect policy operation step"
          aria-valuetext={`${(film.time / 1000).toFixed(1)} seconds: ${progress >= 0.65 ? "Request in practice" : labels[frameIndex]}`}
          onChange={(e) => {
            film.seek(Number(e.target.value));
          }}
        />
        <small>
          {(film.time / 1000).toFixed(1)} / {duration / 1000}s
        </small>
      </div>
      <div className="pf-behavior">
        <span>Why it matters</span>
        <p>
          <strong>{behavior.action}. </strong>
          {behavior.note}{" "}
          <small>Teaching example, not a captured model response.</small>
        </p>
      </div>
    </div>
  );
}
