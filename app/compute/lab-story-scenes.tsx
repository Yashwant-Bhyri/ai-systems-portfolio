"use client";

import { useId, type ReactNode } from "react";
import { FAMILIES, type LabRun } from "./lab-simulation";

export type Inspection = { key: string; title: string; body: string };
export type Inspectors = {
  active: string | undefined;
  preview: (item: Inspection | null) => void;
  pin: (item: Inspection) => void;
};
export function Hotspot({
  item,
  inspect,
  children,
  tabIndex = 0,
}: {
  item: Inspection;
  inspect: Inspectors;
  children: ReactNode;
  tabIndex?: number;
}) {
  return (
    <g
      className="ls-hotspot"
      role="button"
      tabIndex={tabIndex}
      aria-label={`Inspect ${item.title}`}
      aria-pressed={inspect.active === item.key}
      data-selected={inspect.active === item.key}
      onMouseEnter={() => inspect.preview(item)}
      onMouseLeave={() => inspect.preview(null)}
      onFocus={() => inspect.preview(item)}
      onBlur={() => inspect.preview(null)}
      onClick={() => inspect.pin(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inspect.pin(item);
        }
      }}
    >
      {children}
    </g>
  );
}
const AMBER = "#ffc267",
  BLUE = "#78a8ff",
  GREEN = "#b8e986",
  ROSE = "#f3a0bc";

export function RequestLanes({
  before,
  after,
  inspect,
}: {
  before: LabRun;
  after: LabRun;
  inspect: Inspectors;
}) {
  const id = useId(),
    max = Math.max(...before.tasks.slice(0, 8).map((t) => t.finish));
  const px = (s: number) => 92 + (s / max) * 552;
  return (
    <svg
      viewBox="0 0 700 350"
      role="group"
      aria-labelledby={id}
      className="ls-scene"
    >
      <title id={id}>
        The first eight requests, same service work on a common wall-clock axis.
        Inspect a request.
      </title>
      <text x="28" y="26" className="ls-overline">
        ONE TRACE · TWO WORKERS · FIRST EIGHT REQUESTS
      </text>
      {[before, after].map((run, row) => (
        <g key={row}>
          <text x="28" y={62 + row * 134} className="ls-label">
            {row === 0
              ? "Fixed pairs"
              : after.mechanisms.scheduler === "barrier"
                ? "Before intervention"
                : "First worker available"}
          </text>
          {[0, 1].map((worker) => (
            <g key={worker}>
              <text
                x="28"
                y={94 + worker * 35 + row * 134}
                className="ls-small"
              >
                W{worker + 1}
              </text>
              <path
                d={`M92 ${89 + worker * 35 + row * 134}H645`}
                stroke="#253543"
              />
            </g>
          ))}
          {run.tasks.slice(0, 8).map((t) => {
            const y = 76 + t.worker * 35 + row * 134;
            return (
              <Hotspot
                key={t.id}
                inspect={inspect}
                item={{
                  key: `request-${row}-${t.id}`,
                  title: `Request ${t.id + 1} · worker ${t.worker + 1}`,
                  body: `Arrives ${t.arrival.toFixed(1)} s. Waits ${t.queueSeconds.toFixed(1)} s, then executes ${t.gpuSeconds.toFixed(1)} s. Finishes at ${t.finish.toFixed(1)} s. Busy-work and waiting are counted separately.`,
                }}
              >
                <rect
                  x={px(t.arrival)}
                  y={y + 11}
                  width={Math.max(0, px(t.start) - px(t.arrival))}
                  height="4"
                  fill="#65788a"
                  opacity=".45"
                />
                <rect
                  className="ls-morph"
                  x={px(t.start)}
                  y={y}
                  width={px(t.finish) - px(t.start)}
                  height="27"
                  rx="3"
                  fill={row ? AMBER : "#8296aa"}
                  fillOpacity={row ? 0.85 : 0.36}
                />
                <text
                  className="ls-request-id ls-morph"
                  x={(px(t.start) + px(t.finish)) / 2}
                  y={y + 18}
                  textAnchor="middle"
                >
                  {t.id + 1}
                </text>
              </Hotspot>
            );
          })}
        </g>
      ))}
      {[0, 0.25, 0.5, 0.75, 1].map((r) => (
        <g key={r}>
          <path d={`M${px(max * r)} 283v6`} stroke="#627586" />
          <text
            x={px(max * r)}
            y="307"
            textAnchor="middle"
            className="ls-small"
          >
            {Math.round(max * r)} s
          </text>
        </g>
      ))}
      <g className="ls-replay-clock" aria-hidden="true">
        <path d="M92 71V276" stroke="#e3f2ff" strokeWidth="1" opacity=".5" />
        <circle cx="92" cy="282" r="3" fill="#e3f2ff" />
      </g>
      <text x="28" y="336" className="ls-small">
        Bar length = work. Position = when it gets done. Thin line = waiting.
      </text>
    </svg>
  );
}

export function PrefixReuse({
  run,
  inspect,
}: {
  run: LabRun;
  inspect: Inspectors;
}) {
  const id = useId(),
    hits = run.tasks.filter((t) => t.cacheHit).length;
  const shared = run.workload === "shared-prefix",
    active = run.mechanisms.reuse && shared;
  const context = {
    key: "prefix",
    title: "The shared prefix",
    body: `A warm shared-prefix request computes 384 new input tokens instead of 8,192. The initial prefix is still charged. This cohort has ${hits} ready-prefix hits out of 96 requests.`,
  };
  return (
    <svg
      viewBox="0 0 700 350"
      role="group"
      aria-labelledby={id}
      className="ls-scene"
    >
      <title id={id}>
        Repeated context becomes one reusable prefix with separate request
        suffixes.
      </title>
      <text x="28" y="26" className="ls-overline">
        {shared
          ? "SAME CONTEXT · DISTINCT REQUESTS"
          : "DISTINCT CONTEXT · NO PREFIX REUSE"}
      </text>
      <text x="28" y="63" className="ls-label">
        Without reuse
      </text>
      {[0, 1, 2].map((row) => (
        <g key={row} opacity=".6">
          <text x="29" y={96 + row * 34} className="ls-small">
            Q{row + 1}
          </text>
          {Array.from({ length: 10 }, (_, col) => (
            <rect
              key={col}
              x={87 + col * 36}
              y={79 + row * 34}
              width="30"
              height="22"
              rx="2"
              fill="#596c7e"
            />
          ))}
          <rect
            x="459"
            y={79 + row * 34}
            width="37"
            height="22"
            rx="2"
            fill={BLUE}
          />
        </g>
      ))}
      <text x="535" y="119" className="ls-small">
        Read again.
      </text>
      <text x="535" y="145" className="ls-small">
        And again.
      </text>
      <path d="M87 194H650" stroke="#263645" />
      <Hotspot item={context} inspect={inspect}>
        <rect x="22" y="212" width="385" height="112" fill="transparent" />
        <text x="28" y="234" className="ls-label">
          {active ? "One ready prefix" : "No shared state to reference"}
        </text>
        {Array.from({ length: 10 }, (_, col) => (
          <rect
            key={col}
            className="ls-morph"
            x={28 + col * 36}
            y="258"
            width="30"
            height="30"
            rx="2"
            fill={active ? AMBER : "#596c7e"}
            fillOpacity={active ? 0.9 : 0.4}
          />
        ))}
        <text x="28" y="315" className="ls-small">
          {active
            ? "Compute once · keep a reference"
            : "A cache cannot reuse unrelated context"}
        </text>
      </Hotspot>
      {[0, 1, 2].map((row) => (
        <Hotspot
          key={row}
          inspect={inspect}
          item={{
            key: `suffix-${row}`,
            title: `Request ${row + 1} suffix`,
            body: active
              ? "This blue suffix is still computed. Reuse skips only the matching, ready context; it does not skip the request's new content or change its answer."
              : "This workload has no matching shared prefix. Enabling reuse alone does not reduce its input work.",
          }}
        >
          <path
            className={active ? "ls-signal" : undefined}
            d={`M390 273C447 273 449 ${233 + row * 39} 510 ${233 + row * 39}`}
            fill="none"
            stroke={active ? AMBER : "#53697c"}
            strokeWidth="2"
            strokeDasharray="5 6"
            opacity={active ? 0.8 : 0.25}
          />
          <rect
            x="517"
            y={219 + row * 39}
            width="48"
            height="27"
            rx="3"
            fill={BLUE}
            fillOpacity=".8"
          />
          <text x="580" y={237 + row * 39} className="ls-small">
            Q{row + 1}
          </text>
        </Hotspot>
      ))}
    </svg>
  );
}

export function WorkAccounting({
  baseline,
  current,
  stages,
  inspect,
}: {
  baseline: LabRun;
  current: LabRun;
  stages: LabRun[];
  inspect: Inspectors;
}) {
  const id = useId(),
    max = baseline.meanCost,
    x = (n: number) => (n / max) * 466;
  const rows = [baseline, stages[2], current];
  return (
    <svg
      viewBox="0 0 700 350"
      role="group"
      aria-labelledby={id}
      className="ls-scene"
    >
      <title id={id}>
        Work accounting: input prefill and output decoding on a shared
        zero-based scale.
      </title>
      <text x="28" y="26" className="ls-overline">
        FOLLOW THE WORK THAT REMAINS
      </text>
      {rows.map((run, i) => {
        const pre = run.tasks.reduce((s, t) => s + t.prefill, 0) / run.n;
        const dec = run.meanCost - pre,
          y = 94 + i * 85;
        return (
          <g key={i}>
            <text x="28" y={y - 15} className="ls-label">
              {["Starting point", "After prefix reuse", "Current execution"][i]}
            </text>
            <rect
              x="28"
              y={y}
              width="466"
              height="26"
              fill="none"
              stroke="#334554"
              strokeDasharray="3 5"
            />
            {[
              {
                key: "prefill",
                title: "Input prefill",
                value: pre,
                offset: 0,
                color: AMBER,
                body: "Processes the input. Reusing a ready prefix reduces the amount recomputed; faster kernels reduce its assumed per-token cost.",
              },
              {
                key: "decode",
                title: "Output decoding",
                value: dec,
                offset: pre,
                color: BLUE,
                body: "Produces the same output-token count in every runtime pair. Prefix reuse alone leaves this cost unchanged; faster token execution reduces it.",
              },
            ].map((part) => (
              <Hotspot
                key={part.key}
                inspect={inspect}
                item={{
                  key: `work-${i}-${part.key}`,
                  title: part.title,
                  body: `${part.value.toFixed(2)} simulated GPU-s per task. ${part.body}`,
                }}
              >
                <rect
                  className="ls-morph"
                  x={28 + x(part.offset)}
                  y={y}
                  width={x(part.value)}
                  height="26"
                  rx="2"
                  fill={part.color}
                  fillOpacity={i === 2 ? 0.9 : 0.5}
                />
              </Hotspot>
            ))}
            <text x="525" y={y + 19} className="ls-value">
              {run.meanCost.toFixed(2)}{" "}
              <tspan className="ls-small">GPU-s</tspan>
            </text>
          </g>
        );
      })}
      <rect x="28" y="331" width="8" height="8" fill={AMBER} />
      <text x="45" y="339" className="ls-small">
        Input prefill
      </text>
      <rect x="169" y="331" width="8" height="8" fill={BLUE} />
      <text x="186" y="339" className="ls-small">
        Output decoding
      </text>
      <text x="415" y="339" className="ls-small">
        Zero-based · GPU-s / task
      </text>
    </svg>
  );
}

export function ReasoningRoutes({
  step,
  budget,
  inspect,
}: {
  step: number;
  budget: number;
  inspect: Inspectors;
}) {
  const id = useId(),
    searching = step >= 3 && budget > 1,
    trained = step > 0;
  const routes = [
    {
      y: 66,
      end: 58,
      good: false,
      title: "An appealing wrong turn",
      detail:
        "Fluent text is not a correctness signal. A verifier can reject this result even when the intermediate reasoning looks plausible.",
    },
    {
      y: 154,
      end: 144,
      good: true,
      title: "A useful decomposition",
      detail:
        "A curated demonstration can teach decomposition and checking. SFT changes the policy that proposes the route.",
    },
    {
      y: 154,
      end: 230,
      good: false,
      title: "A failed attempt still teaches",
      detail:
        "Within a training group, a lower relative reward discourages a trajectory. This is a policy update, not inference-time rejection alone.",
    },
    {
      y: 277,
      end: 310,
      good: true,
      title: "An alternative found by search",
      detail:
        "With the weights held fixed, additional attempts can reveal a valid route. The extra computation is charged even if other attempts fail.",
    },
  ];
  return (
    <svg
      viewBox="0 0 700 350"
      role="group"
      aria-labelledby={id}
      className="ls-scene"
    >
      <title id={id}>
        Conceptual reasoning routes, not captured model traces. Inspect a route
        to understand learning versus search.
      </title>
      <text x="28" y="26" className="ls-overline">
        {step >= 3
          ? "SAME QUESTION · " +
            (step === 4
              ? "A DIFFERENT POLICY"
              : searching
                ? "SAME WEIGHTS · MORE SEARCH"
                : "SAME WEIGHTS · SAME ALLOWANCE")
          : "SAME QUESTION · LEARN A BETTER ROUTE"}
      </text>
      <circle cx="65" cy="172" r="23" fill="#122130" stroke="#7a91a6" />
      <text x="65" y="178" textAnchor="middle" fill="#dce9f5" fontSize="22">
        ?
      </text>
      {routes.map((route, i) => {
        const emphasized = (i === 1 && trained) || (i === 3 && searching);
        const color = route.good
          ? step === 1
            ? BLUE
            : step === 4
              ? GREEN
              : ROSE
          : "#6b8194";
        const path = `M89 172C147 172 162 ${route.y} 239 ${route.y}S350 ${route.end} 477 ${route.end}`;
        return (
          <Hotspot
            key={i}
            inspect={inspect}
            item={{ key: `route-${i}`, title: route.title, body: route.detail }}
          >
            <path d={path} fill="none" stroke="transparent" strokeWidth="25" />
            <path
              className="ls-morph"
              d={path}
              fill="none"
              stroke={color}
              strokeWidth={emphasized ? 4 : 1.5}
              opacity={i === 3 && !searching ? 0.15 : emphasized ? 0.8 : 0.3}
            />
            {emphasized && (
              <path
                className="ls-signal"
                d={path}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeDasharray="3 17"
              />
            )}
            <circle cx="239" cy={route.y} r="7" fill="#0c1722" stroke={color} />
            <circle
              cx="483"
              cy={route.end}
              r="16"
              fill={emphasized ? color : "#11202e"}
              fillOpacity={emphasized ? 0.2 : 1}
              stroke={color}
              opacity={i === 3 && !searching ? 0.3 : 0.9}
            />
            <text
              x="483"
              y={route.end + 5}
              textAnchor="middle"
              fill={route.good && trained ? color : "#7c91a4"}
              fontSize="15"
            >
              {step >= 2 ? (route.good ? "✓" : "×") : "?"}
            </text>
            <text x="514" y={route.end + 4} className="ls-small">
              {
                [
                  "Shortcut",
                  "Decompose → check",
                  "Unverified claim",
                  searching ? `${budget}× allowance` : "Unexplored route",
                ][i]
              }
            </text>
          </Hotspot>
        );
      })}
      {step >= 2 && step < 4 && (
        <Hotspot
          inspect={inspect}
          item={{
            key: "verifier",
            title:
              step === 2
                ? "Verifier → relative reward → policy update"
                : "Verifier-guided selection",
            body:
              step === 2
                ? "The verifier scores attempts; relative rewards tell the optimizer which paths to encourage. A separate evaluation checks generalization and reward hacking."
                : "At inference time the verifier helps select among attempts. The weights are unchanged. The simulated busy-GPU totals exclude verifier cost, which a real experiment must account for.",
          }}
        >
          <path
            className="ls-signal"
            d="M480 163C452 216 347 344 175 291"
            fill="none"
            stroke={ROSE}
            strokeDasharray="4 7"
            opacity=".5"
          />
          <text x="106" y="329" className="ls-small">
            {step === 2
              ? "Group outcomes → relative reward → update weights"
              : "Explore more → verify → select · no weight update"}
          </text>
        </Hotspot>
      )}
      {step === 4 && (
        <text x="106" y="329" className="ls-small">
          Reward useful reasoning · penalize unnecessary work
        </text>
      )}
      {step < 2 && (
        <text x="106" y="329" className="ls-small">
          {trained
            ? "Curated demonstrations shift the preferred path"
            : "A fluent continuation is not necessarily a correct answer"}
        </text>
      )}
    </svg>
  );
}

export function CohortMap({
  before,
  after,
  inspect,
}: {
  before: LabRun;
  after: LabRun;
  inspect: Inspectors;
}) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 390 115"
      role="group"
      aria-labelledby={id}
      className="ls-cohort"
    >
      <title id={id}>
        All 96 task outcomes compared with the preceding stage. Filled means
        correct; plus means gained; cross means lost.
      </title>
      {after.tasks.map((task, i) => {
        const x = 9 + (i % 32) * 11.7,
          y = 18 + Math.floor(i / 32) * 30;
        const old = before.tasks[i].correct,
          gained = task.correct && !old,
          lost = !task.correct && old;
        return (
          <Hotspot
            key={i}
            tabIndex={-1}
            inspect={inspect}
            item={taskInspection(before, after, i)}
          >
            <rect
              x={x - 2}
              y={y - 3}
              width="13"
              height="22"
              fill="transparent"
            />
            <rect
              x={x}
              y={y}
              width="8"
              height="14"
              rx="1"
              fill={task.correct ? (gained ? GREEN : "#a5b4c7") : "#172331"}
              stroke={lost ? "#ff9b8c" : gained ? GREEN : "#425365"}
              className="ls-morph"
            />
            {gained && (
              <path
                d={`M${x + 2} ${y + 7}h4m-2 -2v4`}
                stroke="#172311"
                strokeWidth="1.2"
              />
            )}
            {lost && (
              <path d={`M${x + 1} ${y + 4}l6 6m0 -6l-6 6`} stroke="#ff9b8c" />
            )}
          </Hotspot>
        );
      })}
      <text x="8" y="111" className="ls-small">
        + newly correct
      </text>
      <text x="154" y="111" className="ls-small">
        × negative flip
      </text>
    </svg>
  );
}
export function taskInspection(
  before: LabRun,
  after: LabRun,
  id: number,
): Inspection {
  const task = after.tasks[id],
    old = before.tasks[id];
  return {
    key: `task-${id}`,
    title: `Task ${String(id + 1).padStart(2, "0")} · ${FAMILIES[task.family]}`,
    body: `${old.correct ? "Correct" : "Incorrect"} → ${task.correct ? "correct" : "incorrect"}. ${old.tokens.toLocaleString()} → ${task.tokens.toLocaleString()} output tokens; ${old.gpuSeconds.toFixed(2)} → ${task.gpuSeconds.toFixed(2)} simulated GPU-s. Same task identity, compared with the preceding stage.`,
  };
}

export function AccuracyCostTrail({
  runs,
  index,
  inspect,
}: {
  runs: LabRun[];
  index: number;
  inspect: Inspectors;
}) {
  const id = useId(),
    maxCost = Math.ceil(Math.max(...runs.map((r) => r.meanCost)) / 10) * 10;
  const px = (v: number) => 35 + (v / maxCost) * 305,
    py = (v: number) => 151 - (v / 100) * 124;
  return (
    <svg
      viewBox="0 0 390 195"
      role="group"
      aria-labelledby={id}
      className="ls-trail"
    >
      <title id={id}>
        The story across actual simulated cost and accuracy; all axes start at
        zero.
      </title>
      {[0, 50, 100].map((v) => (
        <g key={v}>
          <path d={`M35 ${py(v)}H353`} stroke="#283a49" strokeDasharray="2 5" />
          <text x="26" y={py(v) + 4} className="ls-small" textAnchor="end">
            {v}
          </text>
        </g>
      ))}
      <text x="35" y="13" className="ls-small">
        Task accuracy % ↑
      </text>
      {[0, 0.5, 1].map((v) => (
        <text
          key={v}
          x={px(v * maxCost)}
          y="172"
          className="ls-small"
          textAnchor="middle"
        >
          {v * maxCost}
        </text>
      ))}
      <text x="194" y="191" className="ls-small" textAnchor="middle">
        GPU-s / task →
      </text>
      <path
        d={runs
          .map((r, i) => `${i ? "L" : "M"}${px(r.meanCost)} ${py(r.accuracy)}`)
          .join(" ")}
        fill="none"
        stroke="#6a7482"
        strokeDasharray="3 5"
      />
      <path
        d={runs
          .slice(0, index + 1)
          .map((r, i) => `${i ? "L" : "M"}${px(r.meanCost)} ${py(r.accuracy)}`)
          .join(" ")}
        fill="none"
        stroke={ROSE}
        strokeWidth="2"
      />
      {runs.map((r, i) =>
        runs[3].budget === 1 && (index === 2 ? i === 3 : i === 2) ? null : (
          <Hotspot
            key={i}
            inspect={inspect}
            item={{
              key: `checkpoint-${i}`,
              title: [
                "Base · 1×",
                "SFT · 1×",
                "RL checkpoint · 1×",
                `RL checkpoint · ${r.budget}×`,
                `Lean RL · ${r.budget}×`,
              ][i],
              body: `${r.correct} of 96 synthetic outcomes correct (${r.accuracy.toFixed(1)}%). ${r.meanCost.toFixed(2)} GPU-s per task. The x coordinate is computed work, not the nominal allowance label.`,
            }}
          >
            <circle
              cx={px(r.meanCost)}
              cy={py(r.accuracy)}
              r="15"
              fill="transparent"
            />
            <circle
              cx={px(r.meanCost)}
              cy={py(r.accuracy)}
              r={i === index ? 7 : 4}
              fill={i === 4 ? GREEN : i <= index ? ROSE : "#647588"}
              stroke="#0b1620"
              strokeWidth="2"
            />
            <text
              x={px(r.meanCost)}
              y={py(r.accuracy) - 13}
              textAnchor="middle"
              className="ls-small"
            >
              {runs[3].budget === 1 && (i === 2 || i === 3) ? "3/4" : i + 1}
            </text>
          </Hotspot>
        ),
      )}
    </svg>
  );
}
