"use client";
import { useId } from "react";
import {
  idleAt,
  schedulingAt,
  type schedulingStudy,
} from "./scheduling-study-math";

type Study = ReturnType<typeof schedulingStudy>;
const n = (v: number) =>
  v.toLocaleString("en-US", { maximumFractionDigits: 1 });
const BLUE = "#9cc5f5",
  GREEN = "#b8e986",
  RED = "#ff9185";

export function SchedulingLedger({
  study,
  time,
  selected,
  focus,
  pinned,
  onRelease,
  onCompare,
}: {
  study: Study;
  time: number;
  selected: number;
  focus: string;
  pinned: boolean;
  onRelease: () => void;
  onCompare: (index: number) => void;
}) {
  const id = useId();
  const a = study.baseline[selected],
    b = study.optimized[selected];
  const work = [
    schedulingAt(study.baseline, time).work,
    schedulingAt(study.optimized, time).work,
  ];
  const idle = [idleAt(study.gaps, time), idleAt(study.optimizedGaps, time)];
  const finalIdle = idleAt(study.gaps, study.horizon);
  const scaleMax = Math.max(study.work, finalIdle, 1);
  const settled = time >= study.horizon;
  const removed = idle[0] - idle[1];
  return (
    <aside
      className="sq-ledger"
      data-focus={focus}
      aria-label="Work and avoidable idle time comparison"
    >
      <header>
        <h4>
          {settled ? "Worker utilization comparison" : "Work & idle accumulation"}
        </h4>
        <span>6 requests · 2 workers</span>
      </header>
      <svg viewBox="0 0 330 312" role="img" aria-labelledby={id}>
        <title id={id}>
          Accumulated worker-seconds. Baseline does {n(work[0])} seconds of work
          and idles {n(idle[0])} seconds while requests wait. Optimized does{" "}
          {n(work[1])} seconds of work and idles {n(idle[1])} seconds while
          requests wait. All bars use the same worker-second scale.
        </title>
        {[0, 1].map((lane) => (
          <g
            key={lane}
            className="sq-ledger-lane"
            data-lane={lane ? "optimized" : "baseline"}
            transform={`translate(0 ${lane * 152})`}
          >
            <text x="12" y="22" className="sq-title" fill={lane ? GREEN : BLUE}>
              {lane ? "Optimized" : "Baseline"}
            </text>
            <g className="sq-ledger-work">
              <text x="12" y="49" className="sq-small">
                Σ Computing
              </text>
              <text x="318" y="49" className="sq-label" textAnchor="end">
                {n(work[lane])} s
              </text>
              <path data-sq-target={`${lane ? "optimized" : "baseline"}-work`} d="M12 63H318" stroke="#314552" strokeWidth="10" />
              <path
                d={`M12 63h${(306 * work[lane]) / scaleMax}`}
                stroke={lane ? GREEN : BLUE}
                strokeWidth="10"
              />
            </g>
            <text x="12" y="96" className="sq-small">
              Σ Idle with waiting requests
            </text>
            <text x="318" y="96" className="sq-label" textAnchor="end">
              {n(idle[lane])} s
            </text>
            <path data-sq-target={`${lane ? "optimized" : "baseline"}-idle`} d="M12 113H318" stroke="#36282e" strokeWidth="13" />
            <path
              d={`M12 113h${(306 * idle[lane]) / scaleMax}`}
              stroke={RED}
              strokeWidth="13"
            />
            {lane === 1 && focus === "difference" && (
              <path
                d={`M${12 + (306 * idle[1]) / scaleMax} 124v3H${12 + (306 * idle[0]) / scaleMax}v-3`}
                fill="none"
                stroke={RED}
                strokeWidth="2"
              />
            )}
            <text x="12" y="140" className="sq-small">
              0
            </text>
            <text x="318" y="140" className="sq-small" textAnchor="end">
              {n(scaleMax)} worker-s
            </text>
          </g>
        ))}
      </svg>
      <div className="sq-ledger-result" data-reveal={focus === "difference"}>
        <strong>
          {n(removed)}
          <small> worker-s removed</small>
        </strong>
        <p>
          {settled ? (
            <>
              <b>{n(idle[0] ? (100 * removed) / idle[0] : 0)}% less</b> idle
              time with waiting work
            </>
          ) : (
            "Red accumulates only while a free worker could start a waiting request."
          )}
        </p>
        {settled && (
          <span>{n(study.work)} worker-s of computation in both.</span>
        )}
      </div>
      {pinned && (
        <div className="sq-request-detail">
          <span>
            Request {a.id + 1}
            {pinned ? " · pinned" : ""}
          </span>
          {pinned && (
            <button
              type="button"
              onClick={onRelease}
              aria-label="Release selected request"
            >
              ×
            </button>
          )}
          <svg
            viewBox="0 0 310 70"
            role="img"
            aria-label={`Request ${a.id + 1} baseline response ${n(a.latency)} seconds, optimized ${n(b.latency)} seconds. ${n(a.latency - b.latency)} seconds earlier.`}
          >
            {[a, b].map((t, i) => (
              <g key={i}>
                <text x="0" y={14 + i * 29} className="sq-small">
                  {i ? "Optimized" : "Baseline"}
                </text>
                <path
                  d={`M82 ${10 + i * 29}h${(146 * t.latency) / a.latency}`}
                  stroke={i ? GREEN : BLUE}
                  strokeWidth="6"
                />
                <text
                  x="306"
                  y={14 + i * 29}
                  textAnchor="end"
                  className="sq-small"
                >
                  {n(t.latency)}s
                </text>
              </g>
            ))}
            <path
              d={`M${82 + (146 * b.latency) / a.latency} 50v5H228v-5`}
              stroke={RED}
              fill="none"
            />
          </svg>
          <p>
            {n(a.latency - b.latency)}s earlier · same {n(a.gpuSeconds)}s
            computation
          </p>
        </div>
      )}
      <nav
        className="sq-comparison-nav"
        aria-label="Inspect scheduling comparison"
      >
        {["Baseline", "Optimized", "Difference"].map((label, i) => (
          <button
            key={label}
            type="button"
            aria-pressed={focus === label.toLowerCase()}
            onClick={() => onCompare(i)}
          >
            {label}
          </button>
        ))}
      </nav>
      <small className="sq-ledger-unit">
        Worker-seconds add time across both workers. Idle without waiting
        requests is excluded.
      </small>
    </aside>
  );
}
