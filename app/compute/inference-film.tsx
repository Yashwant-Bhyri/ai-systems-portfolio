"use client";

import { useId } from "react";
import { Hotspot, type Inspectors } from "./lab-story-scenes";
import type { LabRun } from "./lab-simulation";
import { useFilmTime } from "./use-film-time";
import {
  FILM_DURATION,
  clamp01,
  decodeAt,
  easeFilm,
  traceAt,
  windowProgress,
} from "./inference-film-math";
import "./cinematic-film.css";

const AMBER = "#ffc267",
  BLUE = "#78a8ff",
  GREEN = "#b8e986",
  MUTED = "#8398ac";
const NARRATION = [
  [
    [
      "Read the trace",
      "Six requests arrive. Two workers share a paired-batch barrier.",
    ],
    [
      "Watch the empty space",
      "A finished worker can sit idle while its paired request continues.",
    ],
    [
      "Count the work separately",
      "Waiting delays the answer. It does not create extra token computation.",
    ],
  ],
  [
    [
      "Replay the same arrivals",
      "The same six requests enter both systems on one clock.",
    ],
    [
      "Release a worker immediately",
      "The next request begins as soon as either worker becomes available.",
    ],
    [
      "Keep the answer, lose the wait",
      "The service work is unchanged. The completion times move earlier.",
    ],
  ],
  [
    [
      "Pay for the first read",
      "The cold request computes its context. Nothing can be reused yet.",
    ],
    [
      "Keep the computed prefix",
      "Once ready, the shared context becomes reusable state.",
    ],
    [
      "Follow a later request",
      "Reuse the matching prefix. Compute its new suffix and its full answer.",
    ],
  ],
  [
    [
      "Freeze the token workload",
      "Two executions receive the same input and produce the same output.",
    ],
    [
      "Watch tokens reach the user",
      "The declared faster rates complete the remaining work sooner.",
    ],
    [
      "Compare identical answers",
      "No tokens disappear. Only their modeled execution cost changes.",
    ],
  ],
  [
    [
      "Separate the interventions",
      "Scheduling changes the wait, not the busy GPU work.",
    ],
    [
      "Remove repeated work",
      "Ready-prefix reuse reduces input computation on a matching workload.",
    ],
    [
      "Accelerate what remains",
      "Execution rates reduce the remaining cost. Correctness stays fixed.",
    ],
  ],
] as const;

function SchedulingFilm({
  baseline,
  current,
  p,
  inspect,
}: {
  baseline: LabRun;
  current: LabRun;
  p: number;
  inspect: Inspectors;
}) {
  const id = useId();
  const end = Math.max(...baseline.tasks.slice(0, 6).map((t) => t.finish));
  const time = windowProgress(p, 0.06, 0.88) * end;
  const x = (seconds: number) => 104 + (seconds / end) * 458;
  return (
    <svg
      viewBox="0 0 700 350"
      className="ls-scene cf-scene"
      role="group"
      aria-labelledby={id}
    >
      <title id={id}>
        Synchronized replay of six simulated requests. Filled bars show work
        performed so far; their outlines show the full service interval.
      </title>
      <text x="28" y="25" className="ls-overline">
        SAME ARRIVALS · SAME WORK · ONE WALL CLOCK
      </text>
      <text x="665" y="25" textAnchor="end" className="ls-small">
        t = {time.toFixed(1)} s
      </text>
      {[baseline, current].map((run, row) => {
        const tasks = traceAt(run, time);
        const y = 73 + row * 132;
        return (
          <g key={row}>
            <text x="28" y={y - 23} className="ls-label">
              {row === 0
                ? "Paired batches"
                : current.mechanisms.scheduler === "barrier"
                  ? "Before intervention"
                  : "Independent scheduling"}
            </text>
            {[0, 1].map((worker) => {
              const busy = tasks.find(
                (t) => t.worker === worker && t.state === "running",
              );
              const waiting = tasks.some((t) => t.state === "waiting");
              return (
                <g key={worker}>
                  <circle
                    cx="34"
                    cy={y + 15 + worker * 39}
                    r="4"
                    fill={busy ? (row ? AMBER : BLUE) : MUTED}
                    opacity={busy ? 1 : 0.35}
                  />
                  <text x="47" y={y + 19 + worker * 39} className="ls-small">
                    W{worker + 1}
                  </text>
                  <path
                    d={`M103 ${y + 15 + worker * 39}H563`}
                    stroke="#233948"
                  />
                  <text
                    x="580"
                    y={y + 19 + worker * 39}
                    className="ls-small"
                    fill={busy ? AMBER : MUTED}
                  >
                    {busy
                      ? `Q${busy.id + 1}`
                      : waiting
                        ? "idle / queue"
                        : "idle"}
                  </text>
                </g>
              );
            })}
            {tasks.map((t) => (
              <Hotspot
                key={t.id}
                inspect={inspect}
                item={{
                  key: `film-request-${row}-${t.id}`,
                  title: `Q${t.id + 1}: ${t.state}`,
                  body: `Arrival ${t.arrival.toFixed(2)} s; start ${t.start.toFixed(2)} s; finish ${t.finish.toFixed(2)} s. ${t.worked.toFixed(2)} of ${t.gpuSeconds.toFixed(2)} GPU-seconds performed at this cursor. Waiting and execution are separate.`,
                }}
              >
                <rect
                  x={x(t.start)}
                  y={y + t.worker * 39}
                  width={x(t.finish) - x(t.start)}
                  height="29"
                  rx="3"
                  fill="#112330"
                  stroke={row ? AMBER : BLUE}
                  strokeOpacity=".22"
                />
                <rect
                  x={x(t.start)}
                  y={y + t.worker * 39}
                  width={t.progress * (x(t.finish) - x(t.start))}
                  height="29"
                  rx="3"
                  fill={row ? AMBER : BLUE}
                  fillOpacity={t.state === "done" ? 0.55 : 0.85}
                />
                <text
                  x={(x(t.finish) + x(t.start)) / 2}
                  y={y + t.worker * 39 + 19}
                  textAnchor="middle"
                  className="cf-request-label"
                  opacity={t.state === "future" ? 0.25 : 1}
                >
                  {t.state === "done" ? "✓" : `Q${t.id + 1}`}
                </text>
              </Hotspot>
            ))}
            <text x="104" y={y + 91} className="ls-small">
              {tasks.filter((t) => t.state === "waiting").length} queued
            </text>
            <text x="562" y={y + 91} textAnchor="end" className="ls-small">
              {tasks.filter((t) => t.state === "done").length} / 6 answers
              delivered
            </text>
          </g>
        );
      })}
      <g
        style={{ transform: `translateX(${x(time) - 104}px)` }}
        className="cf-cursor"
        aria-hidden="true"
      >
        <path d="M104 65V286" stroke="#e8f2fa" opacity=".6" />
        <path d="M100 60l4 5 4-5" fill="#e8f2fa" />
      </g>
      <path d="M104 311H562" stroke="#3b5163" />
      {[0, 0.25, 0.5, 0.75, 1].map((v) => (
        <g key={v}>
          <path d={`M${x(v * end)} 311v5`} stroke="#758b9e" />
          <text x={x(v * end)} y="333" className="ls-small" textAnchor="middle">
            {(v * end).toFixed(0)}s
          </text>
        </g>
      ))}
    </svg>
  );
}

function ReuseFilm({
  run,
  p,
  inspect,
}: {
  run: LabRun;
  p: number;
  inspect: Inspectors;
}) {
  const id = useId(),
    shared = run.workload === "shared-prefix";
  const warm = windowProgress(p, 0.08, 0.33),
    gather = easeFilm(windowProgress(p, 0.33, 0.5));
  const hit = windowProgress(p, 0.52, 0.78),
    ready = warm === 1;
  return (
    <svg
      viewBox="0 0 700 350"
      className="ls-scene cf-scene"
      role="group"
      aria-labelledby={id}
    >
      <title id={id}>
        Conceptual prefix lifecycle: cold computation, ready cache, and later
        matching requests. The later requests are explanatory, not the first
        three arrivals of the workload trace.
      </title>
      <text x="28" y="25" className="ls-overline">
        {shared
          ? "A COLD READ BECOMES REUSABLE STATE"
          : "UNRELATED CONTEXT CANNOT BECOME A CACHE HIT"}
      </text>
      {[0, 1, 2].map((row) => {
        const y = 75 + row * 56,
          suffix = windowProgress(p, 0.55 + row * 0.055, 0.77 + row * 0.06);
        return (
          <g key={row}>
            <text x="28" y={y + 15} className="ls-small">
              {row === 0 ? "Cold" : "Later"}
            </text>
            <path d={`M91 ${y + 10}H641`} stroke="#263d4d" />
            {Array.from({ length: 10 }, (_, col) => {
              const fromX = 106 + col * 35,
                toX = 140 + col * 35;
              const merge = shared && row === 0 ? gather : 0;
              return (
                <rect
                  key={col}
                  x={fromX + (toX - fromX) * merge}
                  y={y + (265 - y) * merge}
                  width="27"
                  height="22"
                  rx="2"
                  fill={col / 10 < warm ? AMBER : MUTED}
                  fillOpacity={
                    row === 0
                      ? 0.3 + 0.6 * warm
                      : 0.3 * (1 - (shared ? gather : 0))
                  }
                />
              );
            })}
            {row > 0 && shared && (
              <path
                d={`M315 276C400 276 411 ${y + 10} 489 ${y + 10}`}
                fill="none"
                stroke={AMBER}
                strokeWidth="2"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset={1 - hit}
                opacity={gather}
              />
            )}
            <rect
              x="490"
              y={y - 3}
              width="66"
              height="28"
              rx="3"
              fill="#152b3e"
              stroke={BLUE}
              strokeOpacity=".35"
            />
            <rect
              x="490"
              y={y - 3}
              width={66 * suffix}
              height="28"
              rx="3"
              fill={BLUE}
              fillOpacity=".8"
            />
            <circle
              cx="635"
              cy={y + 10}
              r="14"
              stroke={suffix === 1 ? GREEN : "#334b5f"}
              fill="#101e27"
            />
            <text
              x="635"
              y={y + 15}
              textAnchor="middle"
              fill={suffix === 1 ? GREEN : MUTED}
              fontSize="13"
            >
              {suffix === 1 ? "✓" : "·"}
            </text>
            <circle
              cx={556 + 66 * suffix}
              cy={y + 10}
              r="3"
              fill={BLUE}
              opacity={suffix > 0 && suffix < 1 ? 1 : 0}
            />
          </g>
        );
      })}
      <Hotspot
        inspect={inspect}
        item={{
          key: "film-cache",
          title:
            ready && shared
              ? "Ready prefix: reuse is now allowed"
              : "Cache readiness gate",
          body: shared
            ? "The first prefill must complete before reuse. Later matching requests can reference it, but their new suffix and every output token are still computed. The token tiles are conceptual blocks, not individual tokens."
            : "Independent prompts do not share an identical prefix. The cache does not remove input work in this workload.",
        }}
      >
        <rect
          x="123"
          y="239"
          width="374"
          height="65"
          rx="5"
          fill="transparent"
          stroke={ready && shared ? AMBER : "#415466"}
          strokeOpacity={0.25 + 0.5 * gather}
        />
        <text x="140" y="231" className="ls-small">
          {shared
            ? ready
              ? "KV PREFIX · READY"
              : "KV PREFIX · COMPUTING"
            : "NO MATCHING SHARED PREFIX"}
        </text>
        {!shared && (
          <text x="310" y="277" textAnchor="middle" className="ls-small">
            Each request pays for its own context
          </text>
        )}
      </Hotspot>
      <text x="523" y="231" className="ls-small">
        NEW SUFFIX
      </text>
      <text x="28" y="333" className="ls-small">
        {shared
          ? "Warm-up is charged. A ready hit avoids only repeated input work."
          : "The mechanism stays enabled. The workload supplies no reuse opportunity."}
      </text>
    </svg>
  );
}

function ExecutionFilm({
  before,
  after,
  p,
  inspect,
}: {
  before: LabRun;
  after: LabRun;
  p: number;
  inspect: Inspectors;
}) {
  const id = useId();
  const candidates = before.tasks.filter(
    (t) => t.cacheHit === (before.workload === "shared-prefix"),
  );
  const a = candidates[0] ?? before.tasks[0],
    b = after.tasks[a.id];
  const time = windowProgress(p, 0.08, 0.86) * a.gpuSeconds;
  return (
    <svg
      viewBox="0 0 700 350"
      className="ls-scene cf-scene"
      role="group"
      aria-labelledby={id}
    >
      <title id={id}>
        Same request after prefix reuse, before and after faster token rates.
        Output count is calculated from the simulated prefill and decode
        durations.
      </title>
      <text x="28" y="25" className="ls-overline">
        Q{a.id + 1} · {a.tokens.toLocaleString()} IDENTICAL OUTPUT TOKENS
      </text>
      <text x="664" y="25" className="ls-small" textAnchor="end">
        {time.toFixed(2)} GPU-s elapsed
      </text>
      {[a, b].map((task, row) => {
        const tokens = decodeAt(task, time),
          fraction = tokens / task.tokens,
          done = time >= task.gpuSeconds;
        const y = 85 + row * 128;
        return (
          <Hotspot
            key={row}
            inspect={inspect}
            item={{
              key: `film-execution-${row}`,
              title: row
                ? "Faster declared token rates"
                : "Reference token rates",
              body: `${task.prefill.toFixed(3)} GPU-s prefill + ${task.decode.toFixed(3)} GPU-s decode. ${tokens} / ${task.tokens} output tokens at the cursor. Same policy, logical input, output length and correctness. No measured kernel speedup is claimed.`,
            }}
          >
            <text x="28" y={y - 27} className="ls-label">
              {row ? "Optimized execution" : "Reference execution"}
            </text>
            <text x="28" y={y + 15} className="ls-small">
              {time < task.prefill ? "prefill" : done ? "complete" : "decode"}
            </text>
            <rect
              x="124"
              y={y - 8}
              width="91"
              height="46"
              rx="4"
              fill="#142633"
              stroke={done ? GREEN : row ? AMBER : BLUE}
              strokeOpacity=".55"
            />
            {Array.from({ length: 12 }, (_, i) => (
              <rect
                key={i}
                x={136 + (i % 4) * 17}
                y={y + Math.floor(i / 4) * 10}
                width="11"
                height="6"
                fill={row ? AMBER : BLUE}
                opacity={
                  done
                    ? 0.25
                    : 0.3 + 0.7 * clamp01(Math.sin(time * 5 - i) * 0.5 + 0.5)
                }
              />
            ))}
            <path d={`M226 ${y + 15}H558`} stroke="#293f50" />
            {Array.from({ length: 20 }, (_, i) => {
              const arrived = fraction > i / 20;
              return (
                <rect
                  key={i}
                  x={239 + i * 16}
                  y={y + 3}
                  width="11"
                  height="24"
                  rx="2"
                  fill={row ? AMBER : BLUE}
                  opacity={arrived ? 0.88 : 0.11}
                />
              );
            })}
            <circle
              cx={239 + fraction * 316}
              cy={y + 15}
              r="5"
              fill="#edf4fa"
              opacity={fraction > 0 && !done ? 1 : 0}
            />
            <text
              x="665"
              y={y + 12}
              textAnchor="end"
              className="ls-value"
              fill={done ? GREEN : undefined}
            >
              {done ? "✓" : tokens.toLocaleString()}
            </text>
            <text x="665" y={y + 32} textAnchor="end" className="ls-small">
              {done ? "same answer" : "tokens delivered"}
            </text>
            <path
              d={`M124 ${y + 53}H${124 + 438 * clamp01(time / task.gpuSeconds)}`}
              stroke={row ? AMBER : BLUE}
              strokeWidth="2"
            />
            <text x="124" y={y + 76} className="ls-small">
              {Math.min(time, task.gpuSeconds).toFixed(2)} /{" "}
              {task.gpuSeconds.toFixed(2)} busy GPU-s
            </text>
          </Hotspot>
        );
      })}
      <text x="28" y="333" className="ls-small">
        The tiles represent equal token groups. Every output token is retained.
      </text>
    </svg>
  );
}

function CompositionFilm({
  runs,
  p,
  inspect,
}: {
  runs: LabRun[];
  p: number;
  inspect: Inspectors;
}) {
  const id = useId(),
    baseline = runs[0];
  const chapter = Math.min(3, Math.floor(windowProgress(p, 0.06, 0.83) * 4));
  const labels = [
    "Starting point",
    "Schedule",
    "Reuse prefix",
    "Execute faster",
  ];
  return (
    <svg
      viewBox="0 0 700 350"
      className="ls-scene cf-scene"
      role="group"
      aria-labelledby={id}
    >
      <title id={id}>
        Sequential cost accounting. Scheduling does not reduce busy GPU work.
        Prefix reuse and token rates reduce different parts of the cost.
      </title>
      <text x="28" y="25" className="ls-overline">
        ONE COHORT · THREE DISTINCT INTERVENTIONS
      </text>
      {runs.slice(0, 4).map((run, i) => {
        const reveal = windowProgress(p, 0.06 + i * 0.19, 0.22 + i * 0.19),
          width = (358 * run.correctCost!) / baseline.correctCost!;
        const pre =
          run.tasks.reduce((s, t) => s + t.prefill, 0) / run.gpuSeconds;
        const y = 72 + i * 65;
        return (
          <Hotspot
            key={i}
            inspect={inspect}
            item={{
              key: `film-account-${i}`,
              title: labels[i],
              body: `${run.gpuSeconds.toFixed(2)} busy GPU-seconds / ${run.correct} correct = ${run.correctCost!.toFixed(2)} GPU-seconds per correct answer. p95 including queue: ${run.p95.toFixed(2)} s. All ${run.n} task identities remain fixed.`,
            }}
          >
            <text
              x="28"
              y={y + 17}
              className="ls-small"
              opacity={i <= chapter ? 1 : 0.35}
            >
              {labels[i]}
            </text>
            <rect
              x="184"
              y={y}
              width="358"
              height="26"
              fill="none"
              stroke="#354b5e"
              strokeDasharray="2 5"
            />
            <g
              style={{
                transform: `translateX(184px) scaleX(${easeFilm(reveal)})`,
              }}
            >
              <rect
                x="0"
                y={y}
                width={width * pre}
                height="26"
                fill={AMBER}
                opacity={chapter === i ? 0.9 : 0.55}
              />
              <rect
                x={width * pre}
                y={y}
                width={width * (1 - pre)}
                height="26"
                fill={BLUE}
                opacity={chapter === i ? 0.9 : 0.55}
              />
            </g>
            <text
              x="661"
              y={y + 19}
              textAnchor="end"
              className="ls-value"
              opacity={reveal}
            >
              {run.correctCost!.toFixed(2)}
            </text>
            {i === 1 && reveal > 0.7 && (
              <text x="184" y={y + 45} className="cf-note">
                same work · shorter wait
              </text>
            )}
          </Hotspot>
        );
      })}
      <text x="28" y="333" className="ls-small">
        GPU-s / correct · zero-based scale
      </text>
      <text x="663" y="333" textAnchor="end" fill={GREEN} fontSize="12">
        {baseline.correct} / {baseline.n} correct, throughout
      </text>
    </svg>
  );
}

export function InferenceFilm({
  step,
  runs,
  playing,
  reduced,
  inspect,
  readTime,
  onSeek,
  onToggle,
}: {
  step: number;
  runs: LabRun[];
  playing: boolean;
  reduced: boolean;
  inspect: Inspectors;
  readTime: () => number;
  onSeek: (time: number) => void;
  onToggle: () => void;
}) {
  const film = useFilmTime(readTime, playing, reduced, FILM_DURATION, onSeek);
  const p = clamp01(film.time / FILM_DURATION),
    beat = p < 0.33 ? 0 : p < 0.66 ? 1 : 2;
  const narrative = NARRATION[step][beat];
  const technicalProgress = p;
  const noReuse = step === 2 && runs[2].workload === "interactive";
  return (
    <div className="cf-film" data-beat={beat}>
      <div className="cf-visual-stack" data-lens="mechanism">
        <div className="cf-technical">
          {step < 2 ? (
            <SchedulingFilm
              baseline={runs[0]}
              current={runs[step]}
              p={technicalProgress}
              inspect={inspect}
            />
          ) : step === 2 ? (
            <ReuseFilm run={runs[2]} p={technicalProgress} inspect={inspect} />
          ) : step === 3 ? (
            <ExecutionFilm
              before={runs[2]}
              after={runs[3]}
              p={technicalProgress}
              inspect={inspect}
            />
          ) : (
            <CompositionFilm
              runs={runs}
              p={technicalProgress}
              inspect={inspect}
            />
          )}
        </div>
      </div>
      <div className="cf-narration" aria-live="off">
        <span className="cf-cue-index">
          {String(beat + 1).padStart(2, "0")}
          <i>/ 03</i>
        </span>
        <div key={`${step}-${beat}-${noReuse}`} className="cf-cue-copy">
          <strong>
            {noReuse
              ? [
                  "Read each distinct prompt",
                  "Look for a matching prefix",
                  "No match, no avoided work",
                ][beat]
              : narrative[0]}
          </strong>
          <p>
            {noReuse
              ? "These requests do not share their context. Enabling the cache cannot remove this input computation."
              : narrative[1]}
          </p>
        </div>
      </div>
      <div className="cf-transport">
        <button
          type="button"
          className="cf-local-play"
          aria-label={
            playing ? "Pause inference scene" : "Play inference scene"
          }
          disabled={reduced}
          onClick={onToggle}
        >
          {playing ? "Ⅱ" : "▷"}
        </button>
        <label className="cf-seek">
          <input
            type="range"
            min="0"
            max={FILM_DURATION}
            step="10"
            value={film.time}
            aria-label="Scrub inference scene"
            aria-valuetext={`${(film.time / 1000).toFixed(1)} seconds: ${narrative[0]}`}
            onChange={(e) => film.seek(Number(e.target.value))}
          />
        </label>
        <time>
          {(film.time / 1000).toFixed(1)} <small>/ 12s</small>
        </time>
      </div>
      <nav className="cf-cues" aria-label="Inference scene moments">
        {NARRATION[step].map((cue, i) => (
          <button
            key={cue[0]}
            type="button"
            aria-current={i === beat ? "step" : undefined}
            onClick={() => film.seek((i * FILM_DURATION) / 3)}
          >
            {["Establish", "Intervene", "Observe"][i]}
            <span>{cue[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
