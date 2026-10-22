"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { LabRun } from "./lab-simulation";
import {
  runtimeGainsStudy,
  runtimeGainsFrame,
  RUNTIME_GAINS_DURATION,
  RUNTIME_GAINS_MOMENTS,
  RUNTIME_GAINS_LABELS,
} from "./runtime-gains-study";
import { useFilmTime } from "./use-film-time";
import "./runtime-gains-reveal.css";

const RED = "#ff9b91",
  AMBER = "#ffc267",
  BLUE = "#9cc5f5",
  VIOLET = "#c3aaff";
const n = (v: number) =>
  v.toLocaleString("en-US", { maximumFractionDigits: 2 });
const TITLES = [
  "Waiting versus GPU work",
  "Scheduling reduces queue time",
  "Prefix reuse removes input work",
  "Faster prefill and decode",
  "Whole-workload GPU cost",
  "Combined GPU-cost reduction",
];
const ROWS = [
  "Baseline serving",
  "+ Worker scheduling",
  "+ KV prefix reuse",
  "+ Faster execution",
];
const yRow = (i: number) => 104 + i * 98;
const WORK_X = 286,
  WORK_W = 388;

function Bracket({
  x1,
  x2,
  y,
  color,
  label,
}: {
  x1: number;
  x2: number;
  y: number;
  color: string;
  label: string;
}) {
  return (
    <g>
      <path
        d={`M${x1} ${y - 8}v8H${x2}v-8`}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
      />
      <text
        x={(x1 + x2) / 2}
        y={y + 19}
        textAnchor="middle"
        fill={color}
        className="rg-number"
      >
        {label}
      </text>
    </g>
  );
}

function Mechanism({
  beat,
  shared,
  progress,
}: {
  beat: number;
  shared: boolean;
  progress: number;
}) {
  if (beat === 1)
    return (
      <svg
        viewBox="0 0 280 68"
        className="rg-mini"
        aria-label="A released worker takes the waiting request without the pair barrier"
      >
        <text x="0" y="15">
          Worker 1
        </text>
        <text x="0" y="51">
          Worker 2
        </text>
        <rect x="76" y="3" width="65" height="16" rx="2" fill={BLUE} />
        <rect
          x="76"
          y="39"
          width="110"
          height="16"
          rx="2"
          fill={BLUE}
          opacity=".45"
        />
        <path
          d="M189 0v62"
          stroke={RED}
          strokeDasharray="3 4"
          opacity={1 - progress}
        />
        <rect
          x={191 - 48 * progress}
          y="3"
          width="65"
          height="16"
          rx="2"
          fill={VIOLET}
        />
        <path d="M160 27h-16l5-4m-5 4 5 4" stroke={VIOLET} fill="none" />
        <text x="198" y="54" fill={VIOLET}>
          Next request
        </text>
      </svg>
    );
  if (beat === 2)
    return (
      <svg
        viewBox="0 0 280 68"
        className="rg-mini"
        aria-label={
          shared
            ? "Ready KV prefix pages are reused; only the suffix is computed"
            : "Unrelated inputs cannot reuse a prefix"
        }
      >
        {Array.from({ length: 20 }, (_, i) => (
          <rect
            key={i}
            x={(i % 10) * 13}
            y={4 + Math.floor(i / 10) * 17}
            width="9"
            height="11"
            fill={AMBER}
            opacity={shared ? 1 - progress * 0.72 : 0.85}
          />
        ))}
        <text x="0" y="60">
          {shared ? "Ready KV pages" : "Unrelated context"}
        </text>
        <path
          d="M135 19H174l-6-5m6 5-6 5"
          fill="none"
          stroke={shared ? VIOLET : RED}
          strokeWidth="2"
        />
        <rect
          x="190"
          y="4"
          width="75"
          height="32"
          rx="3"
          fill="#33273f"
          stroke={VIOLET}
        />
        <text x="227" y="25" textAnchor="middle" fill={VIOLET}>
          {shared ? "Suffix" : "Full input"}
        </text>
        <text x="186" y="60">
          {shared ? "New prefill" : "No reuse"}
        </text>
      </svg>
    );
  if (beat === 3)
    return (
      <div className="rg-rates">
        <span>
          Input token
          <strong>
            1.20 <i>→</i> 0.95 <small>ms</small>
          </strong>
        </span>
        <span>
          Output token
          <strong>
            2.80 <i>→</i> 2.25 <small>ms</small>
          </strong>
        </span>
      </div>
    );
  return null;
}

export function RuntimeGainsReveal({
  runs,
  playing,
  reduced,
  readTime,
  onSeek,
  onToggle,
  onReplay,
  onExplore,
}: {
  runs: readonly LabRun[];
  playing: boolean;
  reduced: boolean;
  readTime: () => number;
  onSeek: (time: number) => void;
  onToggle: () => void;
  onReplay: () => void;
  onExplore: () => void;
}) {
  const study = useMemo(() => runtimeGainsStudy(runs), [runs]);
  const film = useFilmTime(
    readTime,
    playing,
    reduced,
    RUNTIME_GAINS_DURATION,
    onSeek,
  );
  const frame = runtimeGainsFrame(film.time, study);
  const { beat } = frame;
  const cohort = beat >= 4;
  const active = Math.min(3, beat);
  const id = useId(),
    stage = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{
    left: number;
    top: number;
    scale: number;
    tx: number;
    ty: number;
  } | null>(null);
  const q = study.requests;
  const workX = (v: number) => WORK_X + (v / q[0].gpuSeconds) * WORK_W;
  const costX = (v: number) => WORK_X + (v / study.cohort[0].total) * WORK_W;
  const waitX = (v: number) => 30 + (v / Math.max(q[0].queueSeconds, 1)) * 204;
  const color = beat === 1 ? RED : VIOLET;
  const before =
    beat === 1
      ? q[0].queueSeconds
      : beat === 2
        ? q[1].gpuSeconds
        : beat === 3
          ? q[2].gpuSeconds
          : study.cohort[0].total;
  const after =
    beat === 1
      ? frame.rows[1].queue
      : beat === 2
        ? frame.rows[2].work
        : beat === 3
          ? frame.rows[3].work
          : study.cohort[3].total;
  const delta = Math.max(0, before - after);
  const source =
    beat === 1
      ? { x: (waitX(before) + waitX(after)) / 2, y: yRow(1) + 45 }
      : beat === 2 || beat === 3
        ? { x: (workX(before) + workX(after)) / 2, y: yRow(active) + 45 }
        : {
            x:
              (costX(study.cohort[0].total) + costX(study.cohort[3].total)) / 2,
            y: yRow(3) + 45,
          };
  const hasLink = beat !== 0 && beat !== 4 && delta > 0.0001;
  useEffect(() => {
    const root = stage.current;
    if (!root) return;
    const update = () => {
      const bounds = root.getBoundingClientRect();
      const svg = root.querySelector(".rg-chart")?.getBoundingClientRect();
      const target = root
        .querySelector("[data-rg-target]")
        ?.getBoundingClientRect();
      const scroll = root.querySelector(".rg-scroll")?.getBoundingClientRect();
      if (
        !svg ||
        !target ||
        !scroll ||
        target.left < scroll.right ||
        svg.right > scroll.right + 1
      ) {
        setLayout(null);
        return;
      }
      setLayout({
        left: svg.left - bounds.left,
        top: svg.top - bounds.top,
        scale: svg.width / 760,
        tx: target.left - bounds.left,
        ty: target.top - bounds.top + target.height / 2,
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(root);
    const card = root.querySelector(".rg-consequence");
    if (card) ro.observe(card);
    const scroll = root.querySelector(".rg-scroll");
    scroll?.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      scroll?.removeEventListener("scroll", update);
    };
  }, [beat]);
  const sx = layout ? layout.left + source.x * layout.scale : 0;
  const sy = layout ? layout.top + source.y * layout.scale : 0;

  return (
    <section
      className="rg-film"
      data-beat={beat}
      aria-label="Combined runtime gains film"
    >
      <header className="rg-heading">
        <h3>{TITLES[beat]}</h3>
        <span>
          {cohort
            ? "96 matched requests · unchanged checkpoint and outputs"
            : `Request 7 · ${n(q[0].inputTokens)} input tokens · ${n(q[0].tokens)} output tokens`}
        </span>
      </header>
      <div className="rg-stage" ref={stage}>
        <div
          className="rg-scroll"
          role="region"
          tabIndex={0}
          aria-label="Runtime contribution chart; scroll horizontally on narrow screens"
        >
          <svg
            viewBox="0 0 760 492"
            className="rg-chart"
            role="img"
            aria-labelledby={id}
          >
            <title id={id}>
              {cohort
                ? `Across ${study.n} requests: prefix reuse saves ${n(study.savings[2])} and faster execution saves ${n(study.savings[3])} GPU-seconds per correct answer. Total ${n(study.cohort[0].total)} becomes ${n(study.cohort[3].total)}. Scheduling changes waiting, not GPU work.`
                : `Request 7 through baseline serving, worker scheduling, KV prefix reuse and faster execution. Waiting and GPU work are shown separately. ${RUNTIME_GAINS_LABELS[beat]}.`}
            </title>
            <g opacity={1 - frame.cohortMix}>
              <text x="30" y="28" className="rg-axis">
                Waiting before execution
              </text>
              <text x="30" y="50" className="rg-small">
                Seconds per request
              </text>
              <text x={WORK_X} y="28" className="rg-axis">
                GPU work per request
              </text>
              <text x={WORK_X} y="50" className="rg-small">
                <tspan fill={AMBER}>Input processing</tspan> +{" "}
                <tspan fill={BLUE}>answer generation</tspan> · GPU-s
              </text>
              <line x1="259" y1="18" x2="259" y2="466" stroke="#35404d" />
              {frame.rows.map((row, i) => {
                const y = yRow(i),
                  focus = beat === 0 ? i === 0 : i === active;
                return (
                  <g key={i} opacity={row.visible ? (focus ? 1 : 0.42) : 0.12}>
                    <text x="30" y={y - 19} className="rg-row-label">
                      {ROWS[i]}
                    </text>
                    <g opacity={beat >= 2 ? 0.35 : 1}>
                      <rect
                        x="30"
                        y={y}
                        width="204"
                        height="21"
                        fill="#202731"
                        rx="2"
                      />
                      <rect
                        x="30"
                        y={y}
                        width={Math.max(0, waitX(row.queue) - 30)}
                        height="21"
                        fill={RED}
                        opacity=".85"
                        rx="2"
                      />
                      <text x="30" y={y + 38} fill={RED} className="rg-number">
                        {row.visible ? `${n(row.queue)} s waiting` : ""}
                      </text>
                    </g>
                    <g opacity={beat === 1 ? 0.38 : 1}>
                      <rect
                        x={WORK_X}
                        y={y}
                        width={workX(row.prefill) - WORK_X}
                        height="21"
                        fill={AMBER}
                        rx="2"
                      />
                      <rect
                        x={workX(row.prefill)}
                        y={y}
                        width={workX(row.decode) - WORK_X}
                        height="21"
                        fill={BLUE}
                        rx="2"
                      />
                      <text x={WORK_X} y={y + 38} className="rg-small">
                        {row.visible
                          ? `Input ${n(row.prefill)} + output ${n(row.decode)}`
                          : ""}
                      </text>
                      <text
                        x="728"
                        y={y + 16}
                        textAnchor="end"
                        className="rg-total"
                      >
                        {row.visible ? n(row.work) : ""}
                      </text>
                    </g>
                  </g>
                );
              })}
              {beat >= 1 && beat <= 3 && delta > 0.0001 && (
                <g>
                  {beat !== 1 && (
                    <rect
                      x={workX(after)}
                      y={yRow(active)}
                      width={workX(before) - workX(after)}
                      height="21"
                      fill={RED}
                      fillOpacity=".1"
                      stroke={RED}
                      strokeDasharray="3 4"
                    />
                  )}
                  <Bracket
                    x1={beat === 1 ? waitX(after) : workX(after)}
                    x2={beat === 1 ? waitX(before) : workX(before)}
                    y={yRow(active) + 45}
                    color={color}
                    label={`Δ ${n(delta)} ${beat === 1 ? "s" : "GPU-s"}`}
                  />
                </g>
              )}
            </g>
            <g opacity={frame.cohortMix}>
              <text x="30" y="28" className="rg-axis">
                Same task identities
              </text>
              <text x="30" y="50" className="rg-small">
                Request 7 stays in the cohort
              </text>
              {Array.from({ length: study.n }, (_, i) => (
                <g key={i}>
                  <rect
                    x={32 + (i % 8) * 24}
                    y={88 + Math.floor(i / 8) * 21}
                    width="15"
                    height="12"
                    rx="2"
                    fill={i === 6 ? VIOLET : "#7894ac"}
                    opacity={i === 6 ? 1 : 0.35}
                    stroke={i === 6 ? "#efddff" : "none"}
                  />
                  {i === 6 && (
                    <text
                      x="184"
                      y="82"
                      textAnchor="middle"
                      fill={VIOLET}
                      className="rg-small"
                    >
                      7
                    </text>
                  )}
                </g>
              ))}
              <path
                d="M38 361v8h179v-8m-89 8v22h108"
                fill="none"
                stroke="#859eb2"
              />
              <text x="30" y="421" fill="#dce5ee" className="rg-number">
                {study.n} requests
              </text>
              <text x="30" y="443" className="rg-small">
                {study.hits} reused prefixes
              </text>
              <text x={WORK_X} y="28" className="rg-axis">
                GPU cost per correct answer
              </text>
              <text x={WORK_X} y="50" className="rg-small">
                All (<tspan fill={AMBER}>input</tspan> +{" "}
                <tspan fill={BLUE}>output</tspan>) work ÷ {study.correct}{" "}
                correct outcomes · GPU-s
              </text>
              {study.cohort.map((row, i) => {
                const y = yRow(i),
                  focus = beat === 4 ? i === 0 : i === 0 || i === 3;
                return (
                  <g key={i} opacity={focus ? 1 : 0.48}>
                    <text x={WORK_X} y={y - 19} className="rg-row-label">
                      {ROWS[i]}
                    </text>
                    <rect
                      x={WORK_X}
                      y={y}
                      width={costX(row.prefill) - WORK_X}
                      height="21"
                      fill={AMBER}
                      rx="2"
                    />
                    <rect
                      x={costX(row.prefill)}
                      y={y}
                      width={costX(row.decode) - WORK_X}
                      height="21"
                      fill={BLUE}
                      rx="2"
                    />
                    <text
                      x="728"
                      y={y + 16}
                      textAnchor="end"
                      className="rg-total"
                    >
                      {n(row.total)}
                    </text>
                    {i === 1 && (
                      <text x={WORK_X} y={y + 40} className="rg-small">
                        Same GPU work; less waiting
                      </text>
                    )}
                    {i === 2 && (
                      <text
                        x={WORK_X}
                        y={y + 40}
                        fill={VIOLET}
                        className="rg-number"
                      >
                        {study.savings[2] > 0
                          ? `−${n(study.savings[2])} from prefix reuse`
                          : "No matching prefix: no work removed"}
                      </text>
                    )}
                  </g>
                );
              })}
              {beat === 5 && (
                <g opacity={frame.combined}>
                  <rect
                    x={costX(study.cohort[3].total)}
                    y={yRow(3)}
                    width={
                      costX(study.cohort[2].total) -
                      costX(study.cohort[3].total)
                    }
                    height="21"
                    fill={BLUE}
                    fillOpacity=".15"
                    stroke={BLUE}
                    strokeDasharray="3 3"
                  />
                  <rect
                    x={costX(study.cohort[2].total)}
                    y={yRow(3)}
                    width={
                      costX(study.cohort[0].total) -
                      costX(study.cohort[2].total)
                    }
                    height="21"
                    fill={AMBER}
                    fillOpacity=".12"
                    stroke={AMBER}
                    strokeDasharray="3 3"
                  />
                  <text
                    x={
                      (costX(study.cohort[3].total) +
                        costX(study.cohort[2].total)) /
                      2
                    }
                    y={yRow(3) + 15}
                    textAnchor="middle"
                    fill={BLUE}
                    className="rg-number"
                  >
                    −{n(study.savings[3])}
                  </text>
                  {study.savings[2] > 0 && (
                    <text
                      x={
                        (costX(study.cohort[2].total) +
                          costX(study.cohort[0].total)) /
                        2
                      }
                      y={yRow(3) + 15}
                      textAnchor="middle"
                      fill={AMBER}
                      className="rg-number"
                    >
                      −{n(study.savings[2])}
                    </text>
                  )}
                  <Bracket
                    x1={costX(study.cohort[3].total)}
                    x2={costX(study.cohort[0].total)}
                    y={yRow(3) + 45}
                    color={VIOLET}
                    label={`Δ ${n(study.totalSaved)} GPU-s / correct answer`}
                  />
                </g>
              )}
            </g>
          </svg>
        </div>
        <aside
          className="rg-consequence"
          style={{ "--rg-signal": color } as CSSProperties}
          aria-label="Linked runtime consequence"
        >
          <span className="rg-context">
            {cohort
              ? "Whole-workload accounting"
              : "Request 7 · cumulative interventions"}
          </span>
          <h4>
            {
              [
                "The request pays two different costs",
                "Admit the next request sooner",
                study.hits
                  ? "Reuse the context; compute the suffix"
                  : "Different inputs still need full prefill",
                "Lower the cost of every remaining token",
                "Every request contributes to the bill",
                study.hits
                  ? "Two compute savings, one total"
                  : "Execution supplies the compute saving",
              ][beat]
            }
          </h4>
          {beat === 0 ? (
            <div className="rg-baseline-equation">
              <span>
                <b style={{ color: RED }}>{n(q[0].queueSeconds)}</b>
                <small>s waiting</small>
              </span>
              <i>+</i>
              <span>
                <b>{n(q[0].gpuSeconds)}</b>
                <small>s executing</small>
              </span>
              <strong>
                = {n(q[0].latency)} s <small>until the answer completes</small>
              </strong>
            </div>
          ) : beat <= 3 ? (
            <>
              <Mechanism
                beat={beat}
                shared={study.hits > 0}
                progress={frame.progress[beat]}
              />
              <div className="rg-comparison">
                <span>
                  {n(before)}
                  <small>
                    {beat === 1
                      ? "Baseline wait"
                      : beat === 2
                        ? "Before reuse"
                        : "Before rate change"}
                  </small>
                </span>
                <i>→</i>
                <span>
                  {n(after)}
                  <small>
                    {beat === 1
                      ? "Scheduled wait"
                      : beat === 2
                        ? "With reuse"
                        : "Faster rates"}
                  </small>
                </span>
              </div>
              <div className="rg-delta" data-rg-target>
                <b>Δ {n(delta)}</b>
                <span>
                  {beat === 1
                    ? "seconds less waiting"
                    : delta > 0
                      ? "GPU-seconds less work"
                      : "GPU-seconds saved: no change"}
                </span>
              </div>
              <p>
                {beat === 1
                  ? `${n(q[0].gpuSeconds)} GPU-s of computation is unchanged.`
                  : beat === 2
                    ? study.hits
                      ? `${n(q[0].inputTokens - q[2].computedInputTokens)} input tokens do not need another prefill.`
                      : "No shared prefix, so this intervention contributes zero compute savings."
                    : `${n(q[3].tokens)} output tokens, with the same task outcome.`}
              </p>
            </>
          ) : beat === 4 ? (
            <div className="rg-fraction">
              <strong>
                {n(study.runs[0].gpuSeconds)} <small>GPU-s</small>
              </strong>
              <span>Work across all {study.n} requests</span>
              <hr />
              <strong>
                {study.correct} <small>correct outcomes</small>
              </strong>
              <p>Includes work spent on unsuccessful requests.</p>
              <div className="rg-delta">
                <b>{n(study.cohort[0].total)}</b>
                <span>baseline GPU-s / correct answer</span>
              </div>
            </div>
          ) : (
            <>
              <div className="rg-contribution-sum">
                <span>
                  Prefix reuse{" "}
                  <b style={{ color: AMBER }}>
                    {study.savings[2] > 0 ? `−${n(study.savings[2])}` : "0"}
                  </b>
                </span>
                <span>
                  Faster execution{" "}
                  <b style={{ color: BLUE }}>−{n(study.savings[3])}</b>
                </span>
                <span className="rg-sum-total" data-rg-target>
                  Total reduction <b>−{n(study.totalSaved)}</b>
                </span>
                <small>GPU-s per correct answer</small>
              </div>
              <div className="rg-final-equation">
                <span>{n(study.cohort[0].total)}</span>
                <i>→</i>
                <strong>{n(study.cohort[3].total)}</strong>
              </div>
              <p>
                <b>{n(study.percentSaved)}% less GPU work</b> per correct
                answer. Scheduling also reduced waiting; it is not added to this
                compute saving.
              </p>
            </>
          )}
        </aside>
        {hasLink && layout && (
          <svg className="rg-link" aria-hidden="true">
            <path
              d={`M${sx} ${sy}H${layout.tx - 12}V${layout.ty}H${layout.tx}`}
              fill="none"
              stroke={color}
              strokeWidth="2"
            />
            <circle cx={sx} cy={sy} r="4" fill={color} />
          </svg>
        )}
      </div>
      <div className="rg-transport">
        <button
          type="button"
          disabled={reduced}
          aria-label={
            film.time >= RUNTIME_GAINS_DURATION
              ? "Replay runtime gains film"
              : playing
                ? "Pause runtime gains film"
                : "Play runtime gains film"
          }
          onClick={film.time >= RUNTIME_GAINS_DURATION ? onReplay : onToggle}
        >
          {playing ? "Ⅱ" : film.time >= RUNTIME_GAINS_DURATION ? "↺" : "▷"}
        </button>
        <input
          aria-label="Scrub runtime gains film"
          aria-valuetext={`${n(film.time / 1000)} seconds, ${RUNTIME_GAINS_LABELS[beat]}`}
          type="range"
          min="0"
          max={RUNTIME_GAINS_DURATION}
          step="10"
          value={film.time}
          onChange={(e) => film.seek(Number(e.target.value))}
        />
        <time>{n(film.time / 1000)} / 38 s</time>
      </div>
      <nav className="rg-moments" aria-label="Runtime gains moments">
        {RUNTIME_GAINS_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            aria-current={beat === i ? "step" : undefined}
            onClick={() => film.seek(RUNTIME_GAINS_MOMENTS[i])}
          >
            {label}
          </button>
        ))}
      </nav>
      <footer className="rg-footer">
        <details
          onToggle={(e) => {
            if (e.currentTarget.open) film.seek(film.time);
          }}
        >
          <summary>Inspect contribution accounting</summary>
          <p>
            These are ordered comparisons of the existing scenario, not
            independent percentages added together. Request 7 retains its
            arrival, logical input, output count and outcome. The request view
            separates queue seconds from GPU busy-work. The cohort view sums
            work across all {study.n} requests, including unsuccessful requests,
            and divides by the same {study.correct} correct outcomes. Prefix
            warm-up is charged; only ready matches are reused. Execution changes
            the declared prefill/decode rates, with cache outcomes held fixed.
            Scheduling can change downstream waiting, but that waiting is not
            GPU work. Rates are scenario assumptions, not measured kernel
            speedups. Morphing bars interpolate between conditions, not device
            telemetry.
          </p>
        </details>
        <button type="button" onClick={onExplore}>
          Explore result figures ↗
        </button>
      </footer>
    </section>
  );
}
