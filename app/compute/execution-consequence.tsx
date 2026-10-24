"use client";

import { useId } from "react";
import type { LabRun, LabTask } from "./lab-simulation";
import { burstAt, type executionBurst } from "./execution-study-math";

type Burst = ReturnType<typeof executionBurst>;
const GREEN = "#b8e986",
  RED = "#ff9185",
  BLUE = "#9cc5f5";
const fmt = (value: number, digits = 0) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

/** One saved interval is shown as a head start for the next request, not more workers. */
export function WorkerHandoff({
  reference,
  optimized,
  next,
  time,
}: {
  reference: LabTask;
  optimized: LabTask;
  next: LabTask;
  time: number;
}) {
  const id = useId();
  const headStart = Math.max(0, time - optimized.gpuSeconds);
  const gap = reference.gpuSeconds - optimized.gpuSeconds;
  const released = time >= optimized.gpuSeconds;
  const x = (t: number) => 28 + (t / reference.gpuSeconds) * 282;
  return (
    <div className="ec-handoff">
      <h5>
        {released
          ? "That worker can take the next request."
          : "Two requests. One worker per lane."}
      </h5>
      <svg viewBox="0 0 340 276" role="img" aria-labelledby={id}>
        <title id={id}>
          The optimized worker begins Q{next.id + 1} while the reference still
          processes Q{reference.id + 1}. Its head start is {fmt(headStart, 2)}{" "}
          seconds. This is a two-job illustration using fixed service times.
        </title>
        {[reference, optimized].map((task, row) => (
          <g key={row}>
            <text x="28" y={35 + row * 101} className="ec-svg-label">
              {row ? "Optimized" : "Baseline"}
            </text>
            <rect
              x="28"
              y={49 + row * 101}
              width="282"
              height="35"
              fill="#152c3a"
              rx="3"
            />
            <rect
              x="28"
              y={49 + row * 101}
              width={x(Math.min(time, task.gpuSeconds)) - 28}
              height="35"
              fill={row ? GREEN : BLUE}
              opacity=".35"
              rx="3"
            />
            <text x="39" y={72 + row * 101} className="ec-svg-label">
              Q{task.id + 1}
            </text>
            {row === 0 && released && (
              <rect
                x={x(optimized.gpuSeconds)}
                y="49"
                width={x(time) - x(optimized.gpuSeconds)}
                height="35"
                fill={RED}
                opacity=".85"
              />
            )}
            {row === 1 && released && (
              <>
                <rect
                  x={x(optimized.gpuSeconds)}
                  y="150"
                  width={x(time) - x(optimized.gpuSeconds)}
                  height="35"
                  fill={GREEN}
                />
                <path
                  d={`M${x(optimized.gpuSeconds)} 141v53`}
                  stroke={GREEN}
                  strokeWidth="2"
                />
                <text
                  x="310"
                  y="212"
                  textAnchor="end"
                  className="ec-svg-label"
                  fill={GREEN}
                >
                  Q{next.id + 1} started
                </text>
              </>
            )}
          </g>
        ))}
        <path
          d={`M${x(optimized.gpuSeconds)} 97v8H310v-8`}
          stroke={RED}
          strokeWidth="2"
          fill="none"
          opacity={released ? 1 : 0.2}
        />
        <text x="28" y="250" className="ec-svg-label">
          Same worker count · next request moves sooner
        </text>
      </svg>
      <div className="ec-gain" data-earned={released}>
        <span className="ec-gain-bracket" aria-hidden="true">
          ↳
        </span>
        <p>
          <strong>{fmt(gap, 2)} s</strong> available for the next request
        </p>
      </div>
    </div>
  );
}

export function WorkDividend({
  saved,
  count,
  service,
}: {
  saved: number;
  count: number;
  service: number;
}) {
  const extra = Math.floor(saved / service);
  const id = useId();
  return (
    <div className="ec-dividend">
      <h5>Additional requests at the same GPU allowance</h5>
      <svg viewBox="0 0 340 215" role="img" aria-labelledby={id}>
        <title id={id}>
          {fmt(saved, 2)} GPU-seconds saved across {count} repeated requests
          could fund {extra} additional executions of the same optimized
          profile. Busy-work equivalence, not a throughput forecast.
        </title>
        <path d="M16 36H82V70H106" stroke={RED} strokeWidth="3" fill="none" />
        <path d="M104 70l-7-5m7 5-7 5" stroke={RED} strokeWidth="2" />
        {Array.from({ length: 50 }, (_, i) => (
          <rect
            key={i}
            x={125 + (i % 10) * 18}
            y={37 + Math.floor(i / 10) * 25}
            width="12"
            height="16"
            rx="2"
            fill={i < extra / 5 ? GREEN : "#29404f"}
          />
        ))}
        <text x="125" y="186" className="ec-svg-label">
          Each block ≈ 5 requests
        </text>
      </svg>
      <div className="ec-gain">
        <span className="ec-gain-bracket" aria-hidden="true">
          ↳
        </span>
        <p>
          <strong>{fmt(extra)} more</strong> request-equivalents of compute
        </p>
      </div>
      <p className="ec-boundary">
        From {fmt(saved / 60, 1)} GPU-min saved across {fmt(count)} requests.
      </p>
    </div>
  );
}

export function BurstCompletions({
  burst,
  time,
}: {
  burst: Burst;
  time: number;
}) {
  const id = useId();
  const a = burstAt(burst.reference, time),
    b = burstAt(burst.optimized, time);
  const max =
    Math.ceil(burstAt(burst.optimized, burst.horizon).completed / 10) * 10;
  const x = (t: number) => 78 + (t / burst.horizon) * 578;
  const y = (n: number) => 341 - (n / max) * 237;
  const path = (replay: Burst["reference"]) => {
    let d = "M78 341";
    const events = replay.requests
      .filter((r) => r.finish <= time)
      .sort((a, b) => a.finish - b.finish);
    events.forEach((r, i) => {
      d += `H${x(r.finish)}V${y(i + 1)}`;
    });
    return d + `H${x(time)}`;
  };
  return (
    <svg
      className="es-plot ec-completions"
      viewBox="0 0 760 465"
      role="img"
      aria-labelledby={id}
    >
      <title id={id}>
        1,000 requests arrive together. With two serial workers per runtime and{" "}
        {fmt(time)} seconds elapsed, reference completes {a.completed} and
        optimized completes {b.completed}. More completed requests, not more
        concurrent workers.
      </title>
      <text x="78" y="30" className="ec-plot-title">
        1,000 requests arrive together
      </text>
      <text x="78" y="58" className="es-label">
        2 workers each · same request order
      </text>
      {[0, max / 2, max].map((n) => (
        <g key={n}>
          <path d={`M78 ${y(n)}H656`} className="es-grid" />
          <text x="64" y={y(n) + 4} textAnchor="end" className="es-label">
            {n}
          </text>
        </g>
      ))}
      <text x="78" y="91" className="es-label">
        Completed requests ↑
      </text>
      <path d="M78 100V341H656" className="es-axis" />
      {[0, 60, 120, 180, 240, 300].map((t) => (
        <text key={t} x={x(t)} y="366" textAnchor="middle" className="es-label">
          {t / 60}m
        </text>
      ))}
      <path
        d={`M${x(time)} ${y(a.completed)}V${y(b.completed)}`}
        stroke={GREEN}
        strokeWidth="14"
        opacity=".17"
      />
      {[burst.reference, burst.optimized].map((replay, i) => (
        <path
          key={i}
          d={path(replay)}
          stroke={i ? GREEN : BLUE}
          strokeWidth="3"
          fill="none"
        />
      ))}
      <path
        d={`M${x(time) + 12} ${y(b.completed)}h8V${y(a.completed)}h-8`}
        stroke={GREEN}
        strokeWidth="3"
        fill="none"
      />
      <text
        x={x(time) + 28}
        y={(y(b.completed) + y(a.completed)) / 2 + 5}
        className="ec-gap-count"
      >
        +{b.completed - a.completed}
      </text>
      <circle cx={x(time)} cy={y(b.completed)} r="5" fill={GREEN} />
      <circle cx={x(time)} cy={y(a.completed)} r="5" fill={BLUE} />
      <text x="78" y="410" className="ec-plot-title">
        {b.completed - a.completed} more requests answered
      </text>
      <text x="78" y="437" className="es-label">
        at the same {fmt(time)}-second checkpoint
      </text>
    </svg>
  );
}

export function BurstWorkers({ burst, time }: { burst: Burst; time: number }) {
  const id = useId();
  const states = [
    burstAt(burst.reference, time),
    burstAt(burst.optimized, time),
  ];
  return (
    <div className="ec-workers">
      <h5>Queue → workers → completed</h5>
      <svg viewBox="0 0 340 350" role="img" aria-labelledby={id}>
        <title id={id}>
          At {fmt(time)} seconds: {states[0].completed} reference completions
          versus {states[1].completed} optimized completions. Both have two
          active workers, with {states[0].queued} and {states[1].queued}{" "}
          requests queued.
        </title>
        {states.map((state, row) => (
          <g key={row} transform={`translate(0 ${row * 162})`}>
            <text x="24" y="25" className="ec-svg-label">
              {row ? "Optimized" : "Baseline"}
            </text>
            {Array.from({ length: 24 }, (_, i) => (
              <rect
                key={i}
                x={24 + (i % 6) * 9}
                y={46 + Math.floor(i / 6) * 10}
                width="5"
                height="6"
                fill="#557085"
              />
            ))}
            <path d="M80 64H103M98 60l5 4-5 4" stroke="#7894aa" fill="none" />
            {state.active.map((request, index) => {
              const progress = Math.min(
                1,
                (time - request.start) / request.service,
              );
              return (
                <g
                  key={request.worker}
                  transform={`translate(113 ${42 + index * 45})`}
                >
                  <rect
                    width="87"
                    height="34"
                    rx="3"
                    fill="#162c38"
                    stroke={row ? GREEN : BLUE}
                    strokeOpacity=".65"
                  />
                  {Array.from({ length: 8 }, (_, i) => (
                    <rect
                      key={i}
                      x={7 + i * 9}
                      y="7"
                      width="6"
                      height="5"
                      fill={row ? GREEN : BLUE}
                      opacity={i / 8 < progress ? 0.85 : 0.2}
                    />
                  ))}
                  <text x="7" y="26" className="ec-svg-small">
                    R{request.id + 1}
                  </text>
                </g>
              );
            })}
            <path
              d="M210 83H231m-5-4 5 4-5 4"
              stroke={row ? GREEN : BLUE}
              fill="none"
            />
            <text
              x="244"
              y="84"
              className="ec-completed-count"
              fill={row ? GREEN : BLUE}
            >
              {state.completed}
            </text>
            <text x="244" y="105" className="ec-svg-small">
              answered
            </text>
            <text x="24" y="144" className="ec-svg-small">
              {state.queued} waiting
            </text>
            <text x="113" y="144" className="ec-svg-small">
              2 workers
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function QualityOutcome({
  before,
  after,
}: {
  before: LabRun;
  after: LabRun;
}) {
  const id = useId();
  return (
    <div className="ec-quality">
      <h5>GPU-s per correct answer</h5>
      <svg viewBox="0 0 340 238" role="img" aria-labelledby={id}>
        <title id={id}>
          All {after.n} task outcomes retained, {after.correct} correct.
          Execution cost per correct answer falls from{" "}
          {fmt(before.correctCost!, 2)} to {fmt(after.correctCost!, 2)} modeled
          GPU-seconds.
        </title>
        {[before, after].map((run, i) => (
          <g key={i}>
            <text x="28" y={28 + i * 90} className="ec-svg-label">
              {i ? "Optimized" : "Baseline"}
            </text>
            <rect
              x="28"
              y={43 + i * 90}
              width={(280 * run.correctCost!) / before.correctCost!}
              height="24"
              rx="3"
              fill={i ? "#c7a6ff" : BLUE}
            />
            <text x="28" y={87 + i * 90} className="ec-svg-label">
              {fmt(run.correctCost!, 2)} GPU-s
            </text>
          </g>
        ))}
        <text x="28" y="222" fill="#d8c2ff" className="ec-completed-count">
          −{fmt((1 - after.correctCost! / before.correctCost!) * 100, 1)}%
        </text>
      </svg>
      <div className="ec-gain">
        <span className="ec-gain-bracket" aria-hidden="true">
          ↳
        </span>
        <p>Quality held fixed</p>
      </div>
    </div>
  );
}
