"use client";

import { useId } from "react";
import { DemandOrigin } from "./demand-origin";
import type { ComparisonFocus } from "./execution-direction";
import {
  burstAt,
  budgetCapacity,
  type executionDemand,
  type executionWaterfall,
  type waterfallFrame,
} from "./execution-study-math";
import type { LabRun } from "./lab-simulation";
import "./execution-scale.css";

type Trace = ReturnType<typeof executionWaterfall>;
type Frame = ReturnType<typeof waterfallFrame>;
type Demand = ReturnType<typeof executionDemand>;
const BLUE = "#9cc5f5",
  GREEN = "#b8e986",
  VIOLET = "#c7a6ff",
  RED = "#ff9185";
const f = (n: number, d = 0) =>
  n.toLocaleString("en-US", { maximumFractionDigits: d });
const unit = (n: number) => Math.max(0, Math.min(1, n));
const minutes = (n: number) =>
  `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, "0")}`;

export function RequestWaterfall({
  trace,
  frame,
  compact = false,
  selected,
  onSelect,
  focus = "both",
}: {
  trace: Trace;
  frame: Frame;
  compact?: boolean;
  selected: number;
  onSelect: (index: number) => void;
  focus?: ComparisonFocus;
}) {
  const id = useId();
  const width = compact ? 340 : 760,
    left = compact ? 42 : 85,
    right = width - 54;
  const rows = compact ? Math.min(3, trace.baseline.count) : frame.rows;
  const horizon = compact
    ? trace.baseline.requests[Math.min(2, trace.baseline.count - 1)].finish
    : frame.horizon;
  const x = (t: number) => left + (right - left) * Math.min(t / horizon, 1);
  const step = 284 / rows,
    y = (i: number) => 72 + i * step;
  return (
    <svg
      className={compact ? "xs-waterfall xs-compact" : "xs-waterfall"}
      viewBox={`0 0 ${width} 420`}
      role="group"
      aria-labelledby={id}
    >
      <title id={id}>
        Paired serial request waterfall. Rows are request order, not concurrent
        workers. Baseline and optimized each use one worker. Service time{" "}
        {f(frame.time, 2)} seconds. Select a request to compare its finish
        times.
      </title>
      <path d={`M${left} 40h15`} stroke={BLUE} strokeWidth="3" />
      <text x={left + 22} y="44" className="xs-label">
        Baseline
      </text>
      <path d={`M${left + 120} 40h15`} stroke={GREEN} strokeWidth="3" />
      <text x={left + 142} y="44" className="xs-label">
        Optimized
      </text>
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <path d={`M${x(t * horizon)} 56V357`} className="xs-grid" />
          <text
            x={x(t * horizon)}
            y="379"
            textAnchor="middle"
            className="xs-small"
          >
            {f(t * horizon, 1)}s
          </text>
        </g>
      ))}
      {trace.baseline.requests.slice(0, compact ? 3 : 12).map((request, i) => {
        const other = trace.optimized.requests[i];
        const opacity = compact ? 1 : unit(rows - i);
        const selectable = opacity > 0.9 && request.finish <= horizon + 1e-8;
        const active = selected === i;
        return (
          <g
            key={request.id}
            role="button"
            tabIndex={selectable ? 0 : -1}
            aria-hidden={!selectable}
            pointerEvents={!selectable ? "none" : undefined}
            aria-label={`Compare request ${request.profile + 1}: baseline ${f(request.finish, 2)} seconds, optimized ${f(other.finish, 2)} seconds`}
            aria-pressed={active}
            className="xs-request"
            opacity={opacity}
            onClick={() => onSelect(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(i);
              }
            }}
          >
            <rect
              x="12"
              y={y(i) - 9}
              width={width - 28}
              height={Math.max(24, step - 3)}
              rx="3"
              className="xs-hit"
            />
            <text
              x={left - 9}
              y={y(i) + 7}
              textAnchor="end"
              className="xs-small"
            >
              {compact ? "R" : "Req. "}
              {request.profile + 1}
            </text>
            {[request, other].map((r, lane) => {
              const yy = y(i) + lane * 10,
                color = lane ? GREEN : BLUE;
              const start = x(r.start),
                end = x(r.finish),
                current = x(Math.max(r.start, Math.min(r.finish, frame.time)));
              return (
                <g
                  key={lane}
                  className="xs-comparison-lane"
                  data-lane={lane ? "optimized" : "baseline"}
                >
                  {i > 0 && (
                    <path
                      d={`M${start} ${y(i - 1) + lane * 10 + 4}V${yy + 4}`}
                      stroke={color}
                      strokeWidth="1.2"
                      opacity={frame.time >= r.start ? 0.75 : 0.16}
                    />
                  )}
                  <rect
                    x={start}
                    y={yy}
                    width={Math.max(0, end - start)}
                    height="7"
                    fill="#1e3644"
                  />
                  <rect
                    x={start}
                    y={yy}
                    width={Math.max(0, current - start)}
                    height="7"
                    fill={color}
                    opacity={active ? 1 : 0.68}
                  />
                  {frame.time >= r.finish && (
                    <circle data-result-source={!compact && active ? lane ? "optimized" : "baseline" : undefined}
                      cx={end} cy={yy + 3.5} r="2.5" fill={color} />
                  )}
                </g>
              );
            })}
            {(active || (i === 0 && compact)) && (
              <g pointerEvents="none" aria-hidden="true">
                <path
                  d={`M${x(other.finish)} ${y(i) + 19}v3H${x(request.finish)}v-3`}
                  stroke={compact ? RED : VIOLET}
                  strokeWidth="2"
                  fill="none"
                />
                {!compact && frame.time >= request.finish && (
                  <g className="xs-delta-anchor">
                    <path d={`M${(x(other.finish) + x(request.finish)) / 2} ${y(i) + 22}H${width - 36}`}
                      stroke={VIOLET} strokeWidth="1.2" />
                    <circle data-result-source="difference" cx={width - 25} cy={y(i) + 22} r="10" fill="#172333" stroke={VIOLET} />
                    <text x={width - 25} y={y(i) + 26} textAnchor="middle" fill={VIOLET} fontSize="12">Δ</text>
                  </g>
                )}
              </g>
            )}
          </g>
        );
      })}
      <path
        d={`M${x(frame.time)} 55V356`}
        stroke="#dceaf3"
        strokeDasharray="3 5"
        opacity=".5"
      />
      {!compact && focus === "difference" && (
        <g pointerEvents="none" aria-hidden="true">
          <rect
            x={x(trace.optimized.requests[selected].finish)}
            y="56"
            width={Math.max(
              0,
              x(trace.baseline.requests[selected].finish) -
                x(trace.optimized.requests[selected].finish),
            )}
            height="300"
            fill={VIOLET}
            fillOpacity=".09"
          />
          <path
            d={`M${x(trace.optimized.requests[selected].finish)} 56V356M${x(trace.baseline.requests[selected].finish)} 56V356`}
            stroke={VIOLET}
            strokeWidth="1.5"
          />
        </g>
      )}
      <text x={left} y="405" className="xs-label">
        {compact
          ? "R = request · next row = next request"
          : "1 worker per lane · request order ↓"}
      </text>
      {!compact && (
        <text x={right} y="405" textAnchor="end" className="xs-label">
          {f(frame.time, 1)} s elapsed
        </text>
      )}
    </svg>
  );
}

export function WaterfallPayoff({
  trace,
  selected,
  time,
  focus,
}: {
  trace: Trace;
  selected: number;
  time: number;
  focus: ComparisonFocus;
}) {
  const a = trace.baseline.requests[selected],
    b = trace.optimized.requests[selected];
  const saved = a.finish - b.finish;
  return (
    <div className="xs-focus" data-earned={time >= b.finish} data-comparison-focus={focus}>
      <span className="xs-focus-label">
        Time to finish {selected + 1} requests
      </span>
      <ComparisonBars
        baseline={a.finish}
        optimized={b.finish}
        unit="s"
        focus={focus}
      />
      <p className="xs-callout">
        {focus === "baseline" ? (
          <>
            <b>{f(a.finish, 1)} s</b>Baseline finishes the {selected + 1}{" "}
            requests here.
          </>
        ) : focus === "optimized" ? (
          <>
            <b>{f(b.finish, 1)} s</b>Optimized finishes the same {selected + 1}{" "}
            requests here.
          </>
        ) : (
          <>
            <b data-result-target="difference"><span className="xs-delta-symbol">Δ</span> {f(Math.abs(saved), 1)} s {Math.abs(saved) < 1e-8 ? "difference" : saved > 0 ? "earlier" : "later"}</b>
            {Math.abs(saved) < 1e-8 ? "Same completion time" :
              `${f(Math.abs((100 * saved) / a.finish), 1)}% ${saved > 0 ? "less" : "more"} elapsed time`} for the same{" "}{selected + 1} requests
          </>
        )}
      </p>
      <span className="xs-cause">{saved > 1e-8 ? "Faster prefill + decode execution" : "Matched execution comparison"}<span>Cache reuse held fixed</span></span>
      <span className="xs-focus-note">
        {time >= b.finish && time < a.finish
          ? "Optimized finished · baseline still running"
          : "One worker per runtime · no extra workers added"}
      </span>
    </div>
  );
}

function ComparisonBars({
  baseline,
  optimized,
  unit: label,
  focus,
  largerIsBetter = false,
}: {
  baseline: number;
  optimized: number;
  unit: string;
  focus: ComparisonFocus;
  largerIsBetter?: boolean;
}) {
  const max = Math.max(baseline, optimized, 1),
    x = (v: number) => 18 + (274 * v) / max;
  return (
    <svg
      className="xs-comparison-bars"
      viewBox="0 0 310 187"
      role="img"
      aria-label={`Baseline ${f(baseline, 1)} ${label}; optimized ${f(optimized, 1)} ${label}.`}
    >
      {[baseline, optimized].map((v, i) => (
        <g
          key={i}
          className="xs-comparison-lane"
          data-lane={i ? "optimized" : "baseline"}
        >
          <text x="18" y={22 + i * 76} className="xs-label">
            {i ? "Optimized" : "Baseline"}
          </text>
          <text x="292" y={22 + i * 76} className="xs-label" textAnchor="end">
            {f(v, 1)} {label}
          </text>
          <rect
            x="18"
            y={36 + i * 76}
            width={x(v) - 18}
            height="13"
            fill={i ? GREEN : BLUE}
            opacity=".85"
          />
          <circle data-result-target={i ? "optimized" : "baseline"} cx="12" cy={42.5 + i * 76} r="2.5" fill={i ? GREEN : BLUE} />
        </g>
      ))}
      <rect
        x={x(Math.min(baseline, optimized))}
        y={largerIsBetter ? 112 : 36}
        width={Math.abs(x(baseline) - x(optimized))}
        height="13"
        fill={VIOLET}
        opacity={focus === "difference" ? 1 : 0.25}
      />
      <path
        d={`M${x(Math.min(baseline, optimized))} 140v8H${x(max)}v-8`}
        stroke={VIOLET}
        strokeWidth="2"
        fill="none"
      />
      <text x="18" y="178" className="xs-small">
        {largerIsBetter
          ? "Violet = additional requests"
          : "Violet = time saved"}
      </text>
    </svg>
  );
}

export function ComputeAllowance({
  demand,
  allowance,
}: {
  demand: Demand;
  allowance: number;
}) {
  const id = useId();
  const result = budgetCapacity(demand, allowance);
  const ceiling = budgetCapacity(demand, 3000);
  const max = Math.ceil(Math.max(ceiling.baseline.completed, ceiling.optimized.completed) / 5);
  const columns = 20,
    rowHeight = 16,
    rows = Math.ceil(max / columns),
    band = rows * rowHeight + 70;
  const endpoint = (count: number) => {
    const index = Math.max(0, Math.ceil(count / 5) - 1);
    return { x: 44 + (index % columns) * 33 + 24 * (count ? ((count - 1) % 5 + 1) / 5 : 0),
      y: 42.5 + Math.floor(index / columns) * rowHeight };
  };
  const optimizedEnd = endpoint(result.optimized.completed);
  return (
    <svg
      viewBox={`0 0 760 ${2 * band + 68}`}
      className="xs-allowance"
      role="img"
      aria-labelledby={id}
    >
      <title id={id}>{`At a fixed ${f(allowance)} GPU-second allowance, baseline completes ${result.baseline.completed} requests and optimized completes ${result.optimized.completed}, a difference of ${result.extra}. Blue marks the shared count, violet only the increment. Each complete mark is five requests; partial marks are proportional.`}</title>
      <text x="44" y="28" className="xs-label">
        {f(allowance)} GPU-s available to each runtime
      </text>
      {[result.baseline, result.optimized].map((state, lane) => (
        <g
          key={lane}
          className="xs-comparison-lane"
          data-lane={lane ? "optimized" : "baseline"}
          transform={`translate(0 ${46 + lane * band})`}
        >
          <text x="44" y="20" className="xs-title">
            {lane ? "Optimized" : "Baseline"}
          </text>
          <text
            x="710"
            y="20"
            textAnchor="end"
            className="xs-title"
            fill={lane ? GREEN : BLUE}
          >
            {state.completed} requests completed
          </text>
          {Array.from({ length: max }, (_, i) => {
            const shared = unit(
              (Math.min(state.completed, result.baseline.completed) - i * 5) /
                5,
            );
            const total = unit((state.completed - i * 5) / 5);
            const x = 44 + (i % columns) * 33,
              y = 38 + Math.floor(i / columns) * rowHeight;
            return (
              <g key={i}>
                <rect x={x} y={y} width="24" height="9" rx="1" fill="#1d3444" />
                <rect
                  x={x}
                  y={y}
                  width={24 * shared}
                  height="9"
                  rx="1"
                  fill={BLUE}
                  opacity=".72"
                  className="xs-shared-count"
                />
                {lane === 1 && (
                  <rect
                    x={x + 24 * shared}
                    y={y}
                    width={24 * (total - shared)}
                    height="9"
                    fill={VIOLET}
                  />
                )}
              </g>
            );
          })}
          <circle data-result-source={lane ? "optimized" : "baseline"}
            cx={endpoint(state.completed).x + 4} cy={endpoint(state.completed).y}
            r="3" fill={lane ? GREEN : BLUE} />
        </g>
      ))}
      {result.extra > 0 && <g className="xs-delta-anchor" aria-hidden="true" pointerEvents="none">
        {Array.from({ length: rows }, (_, row) => {
          const start = Math.max(result.baseline.completed, row * columns * 5);
          const end = Math.min(result.optimized.completed, (row + 1) * columns * 5);
          if (end <= start) return null;
          const startMark = Math.floor(start / 5) % columns;
          const x1 = 44 + startMark * 33 + (start % 5) / 5 * 24;
          const x2 = endpoint(end).x;
          const y = 46 + band + 52 + row * rowHeight;
          return <path key={row} d={`M${x1} ${y - 3}v3H${x2}v-3M${x2} ${y}H720V${46 + band + optimizedEnd.y + 13}`}
            fill="none" stroke={VIOLET} strokeWidth="1.5" />;
        })}
        <path d={`M720 ${46 + band + optimizedEnd.y + 13}h3`} stroke={VIOLET} />
        <circle data-result-source="difference" cx="735" cy={46 + band + optimizedEnd.y + 13} r="11" fill="#251d38" stroke={VIOLET} />
        <text x="735" y={46 + band + optimizedEnd.y + 17} textAnchor="middle" fill={VIOLET} fontSize="12">Δ</text>
      </g>}
      <rect x="44" y={2 * band + 41} width="16" height="7" fill={BLUE} />
      <text x="70" y={2 * band + 48} className="xs-label">
        Baseline count
      </text>
      <rect x="280" y={2 * band + 41} width="16" height="7" fill={VIOLET} />
      <text x="306" y={2 * band + 48} className="xs-label">
        Additional requests
      </text>
      <text x="710" y={2 * band + 48} textAnchor="end" className="xs-small">
        1 mark = 5 requests
      </text>
    </svg>
  );
}

export function AllowancePayoff({
  demand,
  allowance,
  focus,
}: {
  demand: Demand;
  allowance: number;
  focus: ComparisonFocus;
}) {
  const result = budgetCapacity(demand, allowance);
  return (
    <div className="xs-focus" data-earned={result.extra > 0} data-comparison-focus={focus}>
      <span className="xs-focus-label">
        Requests from the same compute budget
      </span>
      <strong className="xs-allowance-number">
        {f(allowance)} <small>GPU-s</small>
      </strong>
      <ComparisonBars
        baseline={result.baseline.completed}
        optimized={result.optimized.completed}
        unit="requests"
        focus={focus}
        largerIsBetter
      />
      <p className="xs-callout">
        {focus === "baseline" ? (
          <>
            <b>{result.baseline.completed} requests</b>Baseline spends the
            compute budget here.
          </>
        ) : focus === "optimized" ? (
          <>
            <b>{result.optimized.completed} requests</b>Completed within the same allowance.
          </>
        ) : (
          <>
            <b data-result-target="difference"><span className="xs-delta-symbol">Δ</span> {result.extra > 0 ? "+" : ""}{result.extra} requests</b>
            {result.extra === 0 ? "Same number completed at this allowance" : result.baseline.completed > 0
              ? `${f(Math.abs(100 * result.extra / result.baseline.completed), 1)}% ${result.extra > 0 ? "more" : "fewer"} completed with ${f(allowance)} GPU-s`
              : `Baseline has not completed its first request`}
          </>
        )}
      </p>
      <span className="xs-cause">Faster prefill + decode execution<span>Same request order · cache reuse held fixed</span></span>
      <span className="xs-focus-note">
        Busy compute, not a wall-clock deadline
      </span>
    </div>
  );
}

export function DemandRouting({
  demand,
  time,
  origin = 1,
}: {
  demand: Demand;
  time: number;
  origin?: number;
}) {
  const id = useId();
  const states = [
    burstAt(demand.reference, time),
    burstAt(demand.optimized, time),
  ];
  const complete = states.every((state) => state.completed === 1000);
  const comparisonY = complete ? 190 : 118;
  return (
    <svg
      viewBox="0 0 760 460"
      className="xs-routing"
      role="img"
      aria-labelledby={id}
    >
      <title id={id}>{`One thousand agents submit one request each at time zero. Both runtimes route FIFO to two serial workers. At ${f(time, 2)} seconds, baseline has ${states[0].completed} completed and ${states[0].queued} queued; optimized has ${states[1].completed} completed and ${states[1].queued} queued. Input and output lengths are matched.`}</title>
      <DemandOrigin progress={origin} />
      <g opacity={unit((origin - 0.78) / 0.22)}>
        <path d="M214 216H268" stroke="#849db2" fill="none" />
        <path d="M268 118V325" stroke="#849db2" fill="none" />
        <circle cx="268" cy="216" r="10" fill="#162b3b" stroke="#a7c0d4" />
        <path d="M264 212l8 4-8 4" stroke="#a7c0d4" fill="none" />
        <text x="241" y="362" className="xs-small">
          FIFO
        </text>
        <text x="224" y="380" className="xs-small">
          dispatcher
        </text>
        {states.map((state, row) => {
          const color = row ? GREEN : BLUE,
            yy = row * 207;
          return (
            <g
              key={row}
              className="xs-comparison-lane"
              data-lane={row ? "optimized" : "baseline"}
              transform={`translate(0 ${yy})`}
            >
              <text x="326" y="39" className="xs-title" fill={color}>
                {row ? "Optimized" : "Baseline"}
              </text>
              <text x="712" y="39" textAnchor="end" className="xs-small">
                {state.queued} queued
              </text>
              <path
                d="M268 118H312V89H363M312 118V153H363"
                stroke={color}
                strokeWidth="1.2"
                opacity=".65"
                fill="none"
              />
              {[0, 1].map((worker) => {
                const request = state.active.find((r) => r.worker === worker);
                const y = 66 + worker * 64;
                const progress = request
                  ? unit((time - request.start) / request.service)
                  : 0;
                return (
                  <g key={worker}>
                    <rect
                      x="365"
                      y={y}
                      width="147"
                      height="46"
                      rx="4"
                      fill="#142b39"
                      stroke={color}
                      strokeOpacity={request ? 0.8 : 0.25}
                    />
                    <path
                      d={`M374 ${y - 4}v-5h128v5`}
                      fill="none"
                      stroke={color}
                      strokeOpacity=".3"
                    />
                    {Array.from({ length: 18 }, (_, i) => (
                      <rect
                        key={i}
                        x={376 + (i % 9) * 14}
                        y={y + 9 + Math.floor(i / 9) * 7}
                        width="9"
                        height="4"
                        fill={color}
                        opacity={request && i / 18 < progress ? 0.9 : 0.15}
                      />
                    ))}
                    <text x="376" y={y + 37} className="xs-small">
                      W{worker + 1} · {request ? `A${request.id + 1}` : "free"}
                    </text>
                    <path
                      d={`M512 ${y + 23}H566`}
                      stroke={color}
                      strokeOpacity=".5"
                      fill="none"
                    />
                  </g>
                );
              })}
              <path
                d="M566 89V153M566 118H598m-6-5 6 5-6 5"
                stroke={color}
                fill="none"
              />
              <text x="616" y="122" className="xs-count" fill={color}>
                {f(state.completed)}
              </text>
              <text x="616" y="144" className="xs-small">
                requests
                <tspan x="616" dy="14">
                  completed
                </tspan>
              </text>
              {complete && <text x="365" y="193" className="xs-small" fill={color}>
                Queue cleared at {minutes(row ? demand.optimized.finish : demand.reference.finish)}
              </text>}
              <circle data-result-source={row ? "optimized" : "baseline"}
                cx="706" cy={comparisonY} r="3" fill={color} />
            </g>
          );
        })}
        {(states[1].completed !== states[0].completed || complete) && <g className="xs-delta-anchor" aria-hidden="true" pointerEvents="none">
          <path d={`M714 ${comparisonY}h9v207h-9`} fill="none" stroke={VIOLET} strokeWidth="2" />
          <circle data-result-source="difference" cx="735" cy={comparisonY + 103.5} r="11" fill="#251d38" stroke={VIOLET} />
          <text x="735" y={comparisonY + 107.5} textAnchor="middle" fill={VIOLET} fontSize="12">Δ</text>
        </g>}
        <text x="28" y="431" className="xs-label">
          {minutes(time)} elapsed
        </text>
        <text x="714" y="431" textAnchor="end" className="xs-label">
          2 workers per runtime
        </text>
      </g>
    </svg>
  );
}

export function DemandPayoff({
  demand,
  time,
  focus,
}: {
  demand: Demand;
  time: number;
  focus: ComparisonFocus;
}) {
  const id = useId();
  const a = burstAt(demand.reference, time),
    b = burstAt(demand.optimized, time);
  const complete = a.completed === 1000 && b.completed === 1000;
  const x = (t: number) => 24 + Math.min(1, t / demand.reference.finish) * 262,
    y = (n: number) => 206 - (n / 1000) * 172;
  const path = (replay: Demand["reference"]) => {
    let d = "M24 206";
    replay.requests
      .filter((r) => r.finish <= time)
      .sort((a, b) => a.finish - b.finish)
      .forEach((r, i) => {
        d += `H${x(r.finish)}V${y(i + 1)}`;
      });
    return `${d}H${x(time)}`;
  };
  return (
    <div
      className="xs-focus xs-demand-focus"
      data-earned={b.completed > a.completed || complete}
      data-comparison-focus={focus}
    >
      <span className="xs-focus-label">
        {complete
          ? "Time to finish all 1,000 requests"
          : `Requests completed by ${minutes(time)}`}
      </span>
      <div className="xs-paired-values">
        <span className="xs-comparison-lane" data-lane="baseline" data-result-target="baseline">
          {complete ? minutes(demand.reference.finish) : a.completed}
          <small>baseline</small>
        </span>
        <strong className="xs-comparison-lane" data-lane="optimized" data-result-target="optimized">
          {complete ? minutes(demand.optimized.finish) : b.completed}
          <small>optimized</small>
        </strong>
      </div>
      <svg viewBox="0 0 320 257" role="img" aria-labelledby={id}>
        <title id={id}>{`Completion events from the same routing trace. Baseline ${a.completed}, optimized ${b.completed} at ${f(time)} seconds. Both eventually finish one thousand requests.`}</title>
        {[0, 500, 1000].map((n) => (
          <g key={n}>
            <path d={`M24 ${y(n)}H286`} className="xs-grid" />
            <text x="24" y={y(n) - 6} className="xs-small">
              {n}
            </text>
          </g>
        ))}
        <path
          d={path(demand.reference)}
          className="xs-comparison-lane"
          data-lane="baseline"
          stroke={BLUE}
          strokeWidth="2"
          fill="none"
        />
        <path
          d={path(demand.optimized)}
          className="xs-comparison-lane"
          data-lane="optimized"
          stroke={GREEN}
          strokeWidth="2"
          fill="none"
        />
        {[a, b].map((state, lane) => <circle key={lane}
          cx={x(complete ? lane ? demand.optimized.finish : demand.reference.finish : time)}
          cy={y(state.completed)} r={focus === (lane ? "optimized" : "baseline") ? 5 : 3}
          fill={lane ? GREEN : BLUE} />)}
        {!complete && focus === "difference" && (
          <path
            d={`M${x(time)} ${y(a.completed)}V${y(b.completed)}`}
            stroke={VIOLET}
            strokeWidth="7"
            opacity=".65"
          />
        )}
        <path
          d={
            complete
              ? `M${x(demand.optimized.finish)} 30V17H${x(demand.reference.finish)}V30`
              : `M${x(time) + 8} ${y(a.completed)}h5V${y(b.completed)}h-5`
          }
          stroke={VIOLET}
          strokeWidth="2"
          fill="none"
        />
        {focus === "difference" && <text
          x={complete ? (x(demand.optimized.finish) + x(demand.reference.finish)) / 2 : Math.min(306, x(time) + 23)}
          y={complete ? 12 : (y(a.completed) + y(b.completed)) / 2 + 4}
          fill={VIOLET} fontSize="13" textAnchor="middle">Δ</text>}
        <text x="24" y="235" className="xs-small">
          0
        </text>
        <text x="286" y="235" textAnchor="end" className="xs-small">
          {minutes(demand.reference.finish)} elapsed
        </text>
      </svg>
      <p className="xs-callout">
        {focus === "baseline" ? (
          <>
            <b>{complete ? minutes(demand.reference.finish) : `${a.completed} requests`}</b>{complete ? " to clear the baseline queue" : " completed by the baseline at this clock"}
          </>
        ) : focus === "optimized" ? (
          <>
            <b>{complete ? minutes(demand.optimized.finish) : `${b.completed} requests`}</b>{complete ? " to clear the optimized queue" : " completed by the optimized runtime at this clock"}
          </>
        ) : complete ? (
          <>
            <b data-result-target="difference"><span className="xs-delta-symbol">Δ</span>{" "}
              {f((demand.reference.finish - demand.optimized.finish) / 60, 1)}{" "}
              min
            </b>{" "}
            earlier to finish the queue
          </>
        ) : (
          <>
            <b data-result-target="difference"><span className="xs-delta-symbol">Δ</span> {b.completed > a.completed ? "+" : ""}{b.completed - a.completed} requests</b>{" "}
            {a.completed === b.completed ? "Same number completed at this clock" : a.completed
              ? `${f((100 * (b.completed - a.completed)) / a.completed, 1)}% more completed by ${minutes(time)}`
              : "Both runtimes have just started"}
          </>
        )}
      </p>
      <span className="xs-cause">Faster prefill + decode execution<span>Two workers in each runtime · same cache reuse</span></span>
      <span className="xs-focus-note">
        {complete
          ? "1,000 completed in both lanes · 0 outstanding"
          : b.completed === 1000 && a.completed < 1000
            ? `Optimized queue drained · baseline still has ${1000 - a.completed} requests`
            : "Both runtimes receive the same 1,000 requests"}
      </span>
    </div>
  );
}

export function ExecutionCost({
  before,
  after,
  focus,
}: {
  before: LabRun;
  after: LabRun;
  focus: ComparisonFocus;
}) {
  const id = useId();
  const savings = (1 - after.correctCost! / before.correctCost!) * 100;
  const x = (value: number) => 42 + 640 * value / Math.max(before.correctCost!, after.correctCost!);
  const deltaX = (x(before.correctCost!) + x(after.correctCost!)) / 2;
  return (
          <svg
            className="xs-cost-plot"
            viewBox="0 0 760 360"
            role="img"
            aria-labelledby={id}
          >
            <title id={id}>{`Original cohort, execution-only intervention. Baseline ${f(before.correctCost!, 2)} versus optimized ${f(after.correctCost!, 2)} modeled GPU-seconds per correct answer, ${f(savings, 1)} percent reduction. Quality is unchanged.`}</title>
            {[before, after].map((run, i) => (
              <g
                key={i}
                className="xs-comparison-lane"
                data-lane={i ? "optimized" : "baseline"}
              >
                <text x="42" y={54 + i * 135} className="xs-title">
                  {i ? "Optimized" : "Baseline"}
                </text>
                <rect
                  x="42"
                  y={75 + i * 135}
                  width={x(run.correctCost!) - 42}
                  height="33"
                  rx="3"
                  fill={i ? GREEN : BLUE}
                  opacity={i ? 0.95 : 0.5}
                />
                <circle data-result-source={i ? "optimized" : "baseline"}
                  cx={x(run.correctCost!)} cy={91.5 + i * 135} r="4" fill={i ? GREEN : BLUE} />
                <text
                  x="42"
                  y={141 + i * 135}
                  className="xs-count"
                  fill={i ? GREEN : BLUE}
                >
                  {f(run.correctCost!, 2)}
                  <tspan className="xs-label"> GPU-s / correct answer</tspan>
                </text>
              </g>
            ))}
            <rect x={Math.min(x(before.correctCost!), x(after.correctCost!))} y="75"
              width={Math.abs(x(before.correctCost!) - x(after.correctCost!))} height="33"
              fill={VIOLET} opacity={focus === "difference" ? 0.8 : 0.15} pointerEvents="none" />
            <g className="xs-delta-anchor" pointerEvents="none" aria-hidden="true">
            <path
              d={`M${x(after.correctCost!)} 202v-25H${x(before.correctCost!)}v25`}
              stroke={VIOLET}
              strokeWidth="2"
              opacity={focus === "difference" ? 1 : 0.25}
              fill="none"
            />
            <path d={`M${deltaX} 177v-13H723`} fill="none" stroke={VIOLET} strokeWidth="1.5" />
            <circle data-result-source="difference" cx="735" cy="164" r="11" fill="#251d38" stroke={VIOLET} />
            <text x="735" y="168" textAnchor="middle" fill={VIOLET} fontSize="12">Δ</text>
            </g>
            <text x="42" y="327" className="xs-label">
              Quality held fixed · original 96-task cohort
            </text>
          </svg>
  );
}

export function ExecutionCostPayoff({ before, after, focus }: {
  before: LabRun; after: LabRun; focus: ComparisonFocus;
}) {
  const saved = before.correctCost! - after.correctCost!;
  const percent = 100 * Math.abs(saved) / before.correctCost!;
  const comparison = focus === "baseline" || focus === "optimized";
  return (
      <div className="xs-focus" data-earned={saved > 0} data-comparison-focus={focus}>
        <span className="xs-focus-label">{comparison ? `${focus === "baseline" ? "Baseline" : "Optimized"} GPU cost` : "GPU cost per correct answer"}</span>
        <div className="xs-cost-values">
          {[before, after].map((run, lane) => <div key={lane} className="xs-comparison-lane" data-lane={lane ? "optimized" : "baseline"}>
            <span data-result-target={lane ? "optimized" : "baseline"} className="xs-cost-port" />
            <span>{lane ? "Optimized" : "Baseline"}</span>
            <strong>{f(run.correctCost!, 2)}</strong>
          </div>)}
          <small>GPU-s / correct answer</small>
        </div>
        <p className="xs-callout">
          <b data-result-target={comparison ? undefined : "difference"}>
            {comparison ? f(focus === "baseline" ? before.correctCost! : after.correctCost!, 2) : <><span className="xs-delta-symbol">Δ</span> {f(Math.abs(saved), 2)}</>} GPU-s
          </b>
          {comparison ? "per correct answer on the matched cohort" : saved === 0 ? "Same GPU cost per correct answer" : `${f(percent, 1)}% ${saved > 0 ? "less" : "more"} GPU work per correct answer`}
        </p>
        <span className="xs-cause">Faster prefill + decode execution<span>Cache reuse and output quality held fixed</span></span>
        <span className="xs-focus-note">
          Original 96 tasks · unchanged correctness
        </span>
      </div>
  );
}
