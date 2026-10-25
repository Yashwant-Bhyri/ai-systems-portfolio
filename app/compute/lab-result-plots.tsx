"use client";

import { useId } from "react";
import { nearestPlotPoint } from "./plot-hit-test";
import {
  BUDGETS,
  FAMILIES,
  POLICIES,
  compareTasks,
  simulateLab,
  type LabRun,
} from "./lab-simulation";

function SelectPoint({
  x,
  y,
  label,
  color,
  selected,
  onSelect,
}: {
  x: number;
  y: number;
  label: string;
  color: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <g
      role="button"
      tabIndex={0}
      className="rs-point"
      aria-label={label}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      style={{ transform: `translate(${x}px,${y}px)` }}
    >
      <circle r="26" fill="transparent" />
      <circle
        r={selected ? 14 : 9}
        fill="none"
        stroke={color}
        strokeOpacity={selected ? 0.8 : 0.3}
        className={selected ? "rs-point-halo" : undefined}
      />
      <circle r="5" fill={color} />
    </g>
  );
}

export function CapabilityShiftPlot({
  before,
  after,
  onTask,
  selectedTask,
}: {
  before: LabRun;
  after: LabRun;
  onTask: (id: number) => void;
  selectedTask: number;
}) {
  const id = useId(),
    flips = compareTasks(before, after),
    color = POLICIES[after.policyIndex].color;
  return (
    <svg
      viewBox="0 0 1140 394"
      className="rs-plot rs-capability-plot"
      role="group"
      aria-labelledby={`${id}-title`}
    >
      <title id={`${id}-title`}>
        Synthetic task-level capability changes. Each square is one of 96
        simulated tasks, not a real benchmark item.
      </title>
      <text x="36" y="28" className="rs-figure-label">
        EACH SQUARE IS ONE TASK · SELECT ONE
      </text>
      <text x="390" y="65" textAnchor="middle" className="rs-axis">
        Base checkpoint
      </text>
      <text x="832" y="65" textAnchor="middle" className="rs-axis">
        {POLICIES[after.policyIndex].name}
      </text>
      {FAMILIES.map((family, f) => {
        const startY = 94 + f * 88,
          items = after.tasks.filter((t) => t.family === f),
          a = before.tasks.filter((t) => t.family === f && t.correct).length,
          b = items.filter((t) => t.correct).length;
        const gained = items.filter((t) => flips.gained.includes(t.id)).length,
          lost = items.filter((t) => flips.lost.includes(t.id)).length;
        return (
          <g key={family}>
            <text
              x="36"
              y={startY + 25}
              className="rs-point-name"
              fill="#c2d2e1"
            >
              {family}
            </text>
            <text x="36" y={startY + 48} className="rs-tick">
              32 synthetic tasks
            </text>
            {[false, true].map((trained) => (
              <g key={String(trained)}>
                {items.map((t, i) => {
                  const outcome = trained
                      ? t.correct
                      : before.tasks[t.id].correct,
                    positive = trained && flips.gained.includes(t.id),
                    negative = trained && flips.lost.includes(t.id);
                  const x = (trained ? 713 : 271) + (i % 16) * 15,
                    y = startY + Math.floor(i / 16) * 21;
                  return (
                    <g
                      key={t.id}
                      role="button"
                      tabIndex={-1}
                      aria-label={`Inspect synthetic task ${t.id + 1}, ${family}, ${trained ? "selected checkpoint" : "Base"}, ${outcome ? "correct" : "incorrect"}`}
                      className="rs-task-cell"
                      onClick={() => onTask(t.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onTask(t.id);
                        }
                      }}
                    >
                      <rect
                        x={x - 2}
                        y={y - 3}
                        width="15"
                        height="20"
                        fill="transparent"
                      />
                      <rect
                        x={x}
                        y={y}
                        width="11"
                        height="14"
                        rx="1"
                        fill={
                          positive
                            ? color
                            : negative
                              ? "#ff8176"
                              : outcome
                                ? "#91a8bb"
                                : "#182633"
                        }
                        stroke={
                          selectedTask === t.id
                            ? "#fff"
                            : negative
                              ? "#ff8176"
                              : "#385064"
                        }
                        strokeWidth={selectedTask === t.id ? 2 : 0.6}
                        className={positive ? "rs-unlock-cell" : undefined}
                      />
                      {negative ? (
                        <path
                          d={`M${x + 2} ${y + 4}l7 7m0-7l-7 7`}
                          stroke="#07111b"
                          strokeWidth="1.2"
                        />
                      ) : null}
                    </g>
                  );
                })}
                <text
                  x={trained ? 980 : 530}
                  y={startY + 24}
                  className="rs-score"
                  fill={trained ? color : "#a9b6c7"}
                >
                  {trained ? b : a}
                  <tspan fontSize="13"> /32</tspan>
                </text>
              </g>
            ))}
            <path
              d={`M580 ${startY + 18}H675l-7-5m7 5l-7 5`}
              fill="none"
              stroke={color}
              strokeOpacity=".6"
            />
            <path
              className="rs-flow"
              d={`M580 ${startY + 18}H675`}
              stroke={color}
              strokeDasharray="4 14"
            />
            <text
              x="628"
              y={startY + 43}
              textAnchor="middle"
              className="rs-tick"
            >
              +{gained} / −{lost}
            </text>
          </g>
        );
      })}
      <rect x="272" y="365" width="9" height="11" fill={color} />
      <text x="290" y="376" className="rs-tick">
        Newly correct
      </text>
      <rect x="455" y="365" width="9" height="11" fill="#ff8176" />
      <text x="473" y="376" className="rs-tick">
        Negative flip
      </text>
      <rect x="629" y="365" width="9" height="11" fill="#91a8bb" />
      <text x="647" y="376" className="rs-tick">
        Remains correct
      </text>
      <text x="882" y="376" className="rs-tick">
        Same {after.budget}× thought
      </text>
    </svg>
  );
}

const CURVES = POLICIES.map((_, i) => BUDGETS.map((b) => simulateLab(i, b)));
export function LabScalingPlot({
  policy,
  budget,
  onSelect,
}: {
  policy: number;
  budget: number;
  onSelect: (p: number, b: number) => void;
}) {
  const id = useId(),
    px = (v: number) => 86 + (v / 36) * 950,
    py = (v: number) => 311 - v * 2.5;
  const focus = CURVES[policy].find((run) => run.budget === budget)!;
  return (
    <svg
      viewBox="0 0 1140 394"
      className="rs-plot"
      role="group"
      aria-labelledby={`${id}-title`}
      onClickCapture={(event) => {
        // Large touch targets overlap on dense curves. Select by distance,
        // not whichever transparent circle happens to be painted last.
        if (event.detail === 0) return; // Retain keyboard/AT activation.
        const matrix = event.currentTarget.getScreenCTM();
        if (!matrix) return;
        const at = new DOMPoint(event.clientX, event.clientY).matrixTransform(
          matrix.inverse(),
        );
        const target = nearestPlotPoint(
          at.x,
          at.y,
          CURVES.flatMap((runs, p) =>
            runs.map((run) => ({
              x: px(run.meanCost),
              y: py(run.accuracy),
              value: { policy: p, budget: run.budget },
            })),
          ),
        );
        if (target) {
          event.stopPropagation();
          onSelect(target.policy, target.budget);
        }
      }}
    >
      <title id={`${id}-title`}>
        Synthetic accuracy versus simulated GPU cost for four policies across
        one, two, four and eight times thought allowances.
      </title>
      <text x="86" y="28" className="rs-figure-label">
        TEST-TIME SCALING · FOUR CHECKPOINTS × FOUR ALLOWANCES
      </text>
      {[0, 20, 40, 60, 80, 100].map((v) => (
        <g key={v}>
          <path
            d={`M86 ${py(v)}H1060`}
            stroke="#293b49"
            strokeDasharray="2 6"
          />
          <text x="70" y={py(v) + 4} textAnchor="end" className="rs-tick">
            {v}%
          </text>
        </g>
      ))}
      {[0, 6, 12, 18, 24, 30, 36].map((v) => (
        <g key={v}>
          <path d={`M${px(v)} 61V311`} stroke="#1e2d39" />
          <text x={px(v)} y="335" textAnchor="middle" className="rs-tick">
            {v}
          </text>
        </g>
      ))}
      <text
        x="22"
        y="190"
        transform="rotate(-90 22 190)"
        textAnchor="middle"
        className="rs-axis"
      >
        Synthetic task accuracy
      </text>
      {POLICIES.map((_, i) => i)
        .filter((p) => p !== policy)
        .concat(policy)
        .map((p) => {
          const runs = CURVES[p];
          const d = runs
            .map(
              (r, i) => `${i ? "L" : "M"}${px(r.meanCost)} ${py(r.accuracy)}`,
            )
            .join(" ");
          return (
            <g
              key={p}
              opacity={p === policy ? 1 : 0.38}
              className="rs-emphasis"
            >
              <path
                d={d}
                stroke={POLICIES[p].color}
                strokeWidth={p === policy ? 2.5 : 1.5}
                fill="none"
              />
              {p === policy ? (
                <path
                  d={d}
                  stroke="#fff"
                  strokeWidth="1.4"
                  strokeDasharray="4 18"
                  fill="none"
                  className="rs-flow"
                />
              ) : null}
              {runs.map((r) => (
                <g key={r.budget}>
                  <SelectPoint
                    x={px(r.meanCost)}
                    y={py(r.accuracy)}
                    color={POLICIES[p].color}
                    selected={p === policy && r.budget === budget}
                    label={`Inspect ${POLICIES[p].name}, ${r.budget} times allowance, synthetic accuracy ${r.accuracy.toFixed(1)} percent`}
                    onSelect={() => onSelect(p, r.budget)}
                  />
                  {p === policy ? (
                    <text
                      x={px(r.meanCost)}
                      y={py(r.accuracy) - 22}
                      textAnchor="middle"
                      fill={POLICIES[p].color}
                      className="rs-point-name"
                    >
                      {r.budget}×
                    </text>
                  ) : null}
                </g>
              ))}
            </g>
          );
        })}
      <g
        className="rs-focus-tracker"
        style={{
          transform: `translate(${px(focus.meanCost)}px, ${py(focus.accuracy)}px)`,
        }}
        aria-hidden="true"
        pointerEvents="none"
      >
        <circle
          r="19"
          stroke={POLICIES[policy].color}
          strokeWidth="1"
          fill="none"
          opacity=".65"
        />
        <path
          d="M-25 0h5m40 0h5M0-25v5m0 40v5"
          stroke={POLICIES[policy].color}
          opacity=".65"
        />
      </g>
      <text x="570" y="368" textAnchor="middle" className="rs-axis">
        GPU-seconds per task
      </text>
    </svg>
  );
}

export function ExecutionReplayPlot({
  baseline,
  optimized,
}: {
  baseline: LabRun;
  optimized: LabRun;
}) {
  const id = useId(),
    max = baseline.meanCost * 1.15,
    px = (v: number) => 220 + (v / max) * 770;
  return (
    <svg
      viewBox="0 0 1140 394"
      className="rs-plot"
      role="img"
      aria-labelledby={`${id}-title`}
    >
      <title id={`${id}-title`}>
        Identical synthetic answers, less simulated execution work. Baseline and
        optimized cost decomposed into prefill and decode.
      </title>
      <text x="36" y="28" className="rs-figure-label">
        SYNTHETIC MATCHED REPLAY · SAME TASKS, OUTPUT TOKENS, BUDGET AND
        OUTCOMES
      </text>
      {[baseline, optimized].map((r, i) => {
        const y = 113 + i * 119,
          prefill = r.tasks.reduce((a, t) => a + t.prefill, 0) / r.n,
          decode = r.tasks.reduce((a, t) => a + t.decode, 0) / r.n;
        return (
          <g key={i}>
            <text
              x="36"
              y={y + 4}
              className="rs-point-name"
              fill={i ? "#ffc267" : "#bac8d6"}
            >
              {i ? "Optimized" : "Static"}
            </text>
            <text x="36" y={y + 26} className="rs-tick">
              {r.correct}/{r.n} correct
            </text>
            <rect
              x="220"
              y={y - 20}
              width={px(baseline.meanCost) - 220}
              height="44"
              fill="#101c28"
              stroke="#2a3e50"
            />
            <rect
              x="220"
              y={y - 20}
              width={px(prefill) - 220}
              height="44"
              fill="#ffc267"
              fillOpacity=".24"
            />
            <rect
              x={px(prefill)}
              y={y - 20}
              width={(decode / max) * 770}
              height="44"
              fill="#78a8ff"
              fillOpacity=".25"
            />
            <path
              d={`M220 ${y + 2}H${px(r.meanCost)}`}
              stroke={i ? "#ffc267" : "#c1d0df"}
              strokeWidth="2"
            />
            <path
              className="rs-flow"
              d={`M220 ${y + 2}H${px(r.meanCost)}`}
              stroke="#fff"
              strokeWidth="3"
              strokeDasharray="4 22"
            />
            <text
              x={px(r.meanCost) + 17}
              y={y + 7}
              className="rs-score"
              fill={i ? "#ffc267" : "#c1d0df"}
            >
              {r.meanCost.toFixed(2)}
              <tspan fontSize="11"> GPU-s/task</tspan>
            </text>
            <text x="220" y={y + 49} className="rs-tick">
              Prefill {prefill.toFixed(2)} GPU-s
            </text>
            <text x="440" y={y + 49} className="rs-tick">
              Decode {decode.toFixed(2)} GPU-s
            </text>
            {i ? (
              <text x="220" y={y + 77} className="rs-tick">
                {(baseline.meanCost - r.meanCost).toFixed(2)} simulated GPU-s
                removed per task
              </text>
            ) : null}
          </g>
        );
      })}
      <path d="M165 115V234" stroke="#b8e986" strokeDasharray="3 5" />
      <text x="170" y="183" className="rs-tick" fill="#b8e986">
        =
      </text>
      <text x="220" y="355" className="rs-axis">
        Cost per task falls. The correct-answer set is unchanged.
      </text>
      <text x="220" y="383" className="rs-tick">
        {optimized.tasks.filter((t) => t.cacheHit).length}/96 prefix hits · all
        cache warm-up charged · two abstract workers
      </text>
    </svg>
  );
}

export function RegressionAuditPlot({
  before,
  after,
}: {
  before: LabRun;
  after: LabRun;
}) {
  const id = useId(),
    flips = compareTasks(before, after),
    retained = before.correct - flips.lost.length,
    missed = before.n - after.correct - flips.lost.length,
    scale = 2.25,
    leftIncorrect = 114 + before.correct * scale,
    rightIncorrect = 114 + after.correct * scale;
  const flows = [
    {
      name: "Remains correct",
      n: retained,
      color: "#9bb3c6",
      a: 70 + (retained * scale) / 2,
      b: 70 + (retained * scale) / 2,
    },
    {
      name: "Newly correct",
      n: flips.gained.length,
      color: "#f3a0bc",
      a: leftIncorrect + (flips.gained.length * scale) / 2,
      b: 70 + (retained + flips.gained.length / 2) * scale,
    },
    {
      name: "Still incorrect",
      n: missed,
      color: "#38546b",
      a: leftIncorrect + (flips.gained.length + missed / 2) * scale,
      b: rightIncorrect + (flips.lost.length + missed / 2) * scale,
    },
    {
      name: "Negative flips",
      n: flips.lost.length,
      color: "#ff8176",
      a: 70 + (retained + flips.lost.length / 2) * scale,
      b: rightIncorrect + (flips.lost.length * scale) / 2,
    },
  ];
  return (
    <svg
      viewBox="0 0 1140 394"
      className="rs-plot"
      role="img"
      aria-labelledby={`${id}-title`}
    >
      <title id={`${id}-title`}>
        Synthetic regression audit: {flips.gained.length} newly correct,{" "}
        {flips.lost.length} negative flips, {retained} remain correct, {missed}{" "}
        remain incorrect.
      </title>
      <text x="36" y="28" className="rs-figure-label">
        PAIRED SYNTHETIC AUDIT · FOLLOW THE SAME 96 TASKS
      </text>
      <text x="36" y="103" fill="#d0dce7" className="rs-point-name">
        Base correct
      </text>
      <text x="36" y="135" className="rs-score" fill="#a9b6c7">
        {before.correct}
        <tspan fontSize="14"> / 96</tspan>
      </text>
      <text
        x="36"
        y={leftIncorrect + 17}
        className="rs-point-name"
        fill="#8eabc1"
      >
        Base incorrect
      </text>
      <text
        x="36"
        y={Math.min(350, leftIncorrect + 50)}
        className="rs-score"
        fill="#8eabc1"
      >
        {before.n - before.correct}
      </text>
      {flows
        .filter((f) => f.n > 0)
        .map((f) => (
          <g key={f.name}>
            <path
              d={`M250 ${f.a}C480 ${f.a},650 ${f.b},880 ${f.b}`}
              fill="none"
              stroke={f.color}
              strokeWidth={f.n * scale}
              strokeOpacity=".23"
            />
            <path
              d={`M250 ${f.a}C480 ${f.a},650 ${f.b},880 ${f.b}`}
              fill="none"
              stroke={f.color}
              strokeWidth="1.5"
              strokeDasharray="4 21"
              className="rs-flow"
            />
            <title>
              {f.name}: {f.n}
            </title>
          </g>
        ))}
      <rect
        x="240"
        y="70"
        width="10"
        height={before.correct * scale}
        fill="#a9b6c7"
      />
      <rect
        x="240"
        y={leftIncorrect}
        width="10"
        height={(before.n - before.correct) * scale}
        fill="#38546b"
      />
      <rect
        x="880"
        y="70"
        width="10"
        height={after.correct * scale}
        fill="#f3a0bc"
      />
      <rect
        x="880"
        y={rightIncorrect}
        width="10"
        height={(after.n - after.correct) * scale}
        fill="#38546b"
      />
      <text x="919" y="103" className="rs-point-name" fill="#f3a0bc">
        Now correct
      </text>
      <text x="919" y="135" className="rs-score" fill="#f3a0bc">
        {after.correct}
        <tspan fontSize="14"> / 96</tspan>
      </text>
      <text
        x="919"
        y={rightIncorrect + 17}
        className="rs-point-name"
        fill="#a9b6c7"
      >
        Now incorrect
      </text>
      <text
        x="919"
        y={Math.min(358, rightIncorrect + 48)}
        className="rs-score"
        fill="#a9b6c7"
      >
        {after.n - after.correct}
      </text>
      <text x="460" y="51" className="rs-axis">
        +{flips.gained.length} recovered
      </text>
      <text x="650" y="51" className="rs-axis" fill="#ff8176">
        −{flips.lost.length} regressions
      </text>
      <text x="570" y="384" textAnchor="middle" className="rs-tick">
        Net gain = new successes − negative flips. A higher aggregate score does
        not erase individual regressions.
      </text>
    </svg>
  );
}

export function TailLatencyPlot({
  baseline,
  optimized,
}: {
  baseline: LabRun;
  optimized: LabRun;
}) {
  const id = useId(),
    max = baseline.p95 * 1.22,
    px = (v: number) => 86 + (v / 95) * 915,
    py = (v: number) => 310 - (v / max) * 235;
  return (
    <svg
      viewBox="0 0 1140 394"
      className="rs-plot"
      role="img"
      aria-labelledby={`${id}-title`}
    >
      <title id={`${id}-title`}>
        Simulated latency over the same ordered workload. Baseline p95{" "}
        {baseline.p95.toFixed(2)} seconds; optimized {optimized.p95.toFixed(2)}{" "}
        seconds. Queueing is included.
      </title>
      <text x="86" y="28" className="rs-figure-label">
        SYNTHETIC LOAD REPLAY · TWO ABSTRACT WORKERS · QUEUEING INCLUDED
      </text>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <path
            d={`M86 ${py(max * f)}H1050`}
            stroke="#293b49"
            strokeDasharray="2 6"
          />
          <text x="72" y={py(max * f) + 4} textAnchor="end" className="rs-tick">
            {(max * f).toFixed(0)}
          </text>
        </g>
      ))}
      {[0, 23, 47, 71, 95].map((v) => (
        <text key={v} x={px(v)} y="335" textAnchor="middle" className="rs-tick">
          {v + 1}
        </text>
      ))}
      {[baseline, optimized].map((r, i) => {
        const color = i ? "#ffc267" : "#8ca3b8",
          d = r.tasks
            .map((t, j) => `${j ? "L" : "M"}${px(j)} ${py(t.latency)}`)
            .join(" ");
        return (
          <g key={i}>
            <path d={d} stroke={color} strokeWidth="2" fill="none" />
            <path
              d={d}
              stroke="#fff"
              strokeOpacity=".5"
              strokeDasharray="3 19"
              fill="none"
              className="rs-flow"
            />
            <path
              d={`M86 ${py(r.p95)}H1010`}
              stroke={color}
              strokeDasharray="6 6"
              opacity=".5"
            />
            <text
              x="1030"
              y={py(r.p95) + 4}
              fill={color}
              className="rs-point-name"
            >
              p95
            </text>
            <text
              x={i ? 570 : 86}
              y="56"
              fill={color}
              className="rs-point-name"
            >
              {i ? "Optimized" : "Static"} · {r.p95.toFixed(1)} s p95
            </text>
          </g>
        );
      })}
      <text
        x="22"
        y="190"
        transform="rotate(-90 22 190)"
        textAnchor="middle"
        className="rs-axis"
      >
        Simulated end-to-end latency (s)
      </text>
      <text x="570" y="368" textAnchor="middle" className="rs-axis">
        Request in the identical workload trace
      </text>
      <text x="570" y="389" textAnchor="middle" className="rs-tick">
        Faster execution does not remove a capacity limit. A burst can still
        build a long queue.
      </text>
    </svg>
  );
}
