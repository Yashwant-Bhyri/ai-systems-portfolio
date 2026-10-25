"use client";

import { useId, type ReactNode } from "react";
import { simulateLab, type LabRun } from "./lab-simulation";
import { useFilmTime } from "./use-film-time";
import { clamp01, windowProgress } from "./inference-film-math";
import "./cinematic-film.css";

const BUDGETS = [1, 2, 4, 8];
const RUNS = BUDGETS.map((budget) => simulateLab(2, budget));
const BASE = BUDGETS.map((budget) => simulateLab(0, budget));
const MOMENTS = [1200, 5400, 9600, 13800];
const CASE = [
  {
    title: "A plausible fix is not a checked fix.",
    action: "Inspect the checkout handler",
    detail:
      "A timeout looks like failure. The first proposal simply retries the charge.",
    status: "Duplicate-charge test fails",
    accepted: false,
    files: 1,
  },
  {
    title: "Spend the next attempt on the missing link.",
    action: "Trace the retry path",
    detail:
      "The provider may have accepted the charge before the response was lost. A new retry key can create another charge.",
    status: "Root cause found · patch unverified",
    accepted: false,
    files: 2,
  },
  {
    title: "More thought finds the invariant.",
    action: "Preserve identity across retries",
    detail:
      "One payment attempt keeps one idempotency key. The replayed timeout no longer creates a second charge.",
    status: "Duplicate-charge check passes",
    accepted: true,
    files: 3,
  },
  {
    title: "Then ask what else could break.",
    action: "Check the surrounding failure modes",
    detail:
      "Inspect timeout recovery and key persistence as well. More search costs more; not every extra attempt changes the answer.",
    status: "Additional boundary checks pass",
    accepted: true,
    files: 3,
  },
] as const;

function RetrySequence({
  accepted,
  progress,
}: {
  accepted: boolean;
  progress: number;
}) {
  const first = windowProgress(progress, 0, 0.3),
    timeout = windowProgress(progress, 0.25, 0.55),
    retry = windowProgress(progress, 0.5, 0.9);
  const color = accepted ? "#b8e986" : "#ffa999";
  return (
    <svg
      viewBox="0 0 480 156"
      className="tt-retry-sequence"
      role="img"
      aria-label={
        accepted
          ? "The retry preserves key A and returns the existing charge, avoiding a second payment."
          : "A lost response triggers a retry with key B, creating a second charge."
      }
    >
      <text x="32" y="17" className="ls-small">
        Application
      </text>
      <text x="335" y="17" className="ls-small">
        Payment provider
      </text>
      <path d="M40 28v112M429 28v112" stroke="#355063" strokeDasharray="3 6" />
      <path
        d="M40 40H425"
        pathLength="1"
        stroke="#78a8ff"
        strokeWidth="2"
        strokeDasharray="1"
        strokeDashoffset={1 - first}
      />
      <circle cx={40 + 385 * first} cy="40" r="3" fill="#78a8ff" />
      <text x="163" y="33" className="ls-small">
        charge · key A
      </text>
      <path
        d="M425 81H40"
        pathLength="1"
        stroke="#8ba7ba"
        strokeDasharray="1"
        strokeDashoffset={1 - timeout}
        opacity=".6"
      />
      <text x="172" y="75" className="ls-small">
        response lost ×
      </text>
      <path
        d="M40 121H425"
        pathLength="1"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="1"
        strokeDashoffset={1 - retry}
      />
      <circle cx={40 + 385 * retry} cy="121" r="3" fill={color} />
      <text x="151" y="113" fill={color} fontSize="12">
        retry · key {accepted ? "A (same)" : "B (new)"}
      </text>
      <circle
        cx="429"
        cy="121"
        r="16"
        fill="#0b1923"
        stroke={color}
        opacity={retry}
      />
      <text
        x="429"
        y="126"
        fill={color}
        textAnchor="middle"
        fontSize="13"
        opacity={retry}
      >
        {accepted ? "1" : "2"}
      </text>
      <text x="380" y="152" className="ls-small" opacity={retry}>
        {accepted ? "one charge" : "two charges"}
      </text>
    </svg>
  );
}

export function TestTimeReveal({
  playing,
  reduced,
  readTime,
  onSeek,
  onToggle,
  comparisonBudget,
  evidence,
  onPause,
}: {
  playing: boolean;
  reduced: boolean;
  readTime: () => number;
  onSeek: (time: number) => void;
  onToggle: () => void;
  comparisonBudget: number;
  evidence: (run: LabRun, pause: () => void) => ReactNode;
  onPause: () => void;
}) {
  const film = useFilmTime(readTime, playing, reduced, 21000, onSeek);
  const returning = film.time >= 18500;
  const index = returning
    ? Math.max(0, BUDGETS.indexOf(comparisonBudget))
    : Math.max(
        0,
        MOMENTS.findLastIndex((moment) => film.time >= moment),
      );
  const run = RUNS[index],
    example = CASE[index],
    id = useId();
  const sequenceProgress = clamp01((film.time - MOMENTS[index]) / 3300);
  const verdictReady = sequenceProgress >= 0.9;
  const x = (cost: number) => 58 + (cost / 36) * 460;
  const y = (accuracy: number) => 259 - ((accuracy - 20) / 80) * 218;
  const path = (runs: typeof RUNS) =>
    runs
      .map((r, i) => `${i ? "L" : "M"}${x(r.meanCost)} ${y(r.accuracy)}`)
      .join(" ");
  return (
    <div className="tt-reveal" data-budget={BUDGETS[index]}>
      <header className="tt-heading">
        <div>
          <span>TEST-TIME SCALING</span>
          <h4>Same model. A deeper search.</h4>
        </div>
        <div className="tt-lock">
          <span aria-hidden="true">⌑</span> θ* fixed <i>0 weight updates</i>
        </div>
      </header>
      <div className="tt-dual-stage">
        <section
          className="tt-math"
          tabIndex={0}
          aria-label="Test-time compute scaling mathematics"
        >
          <div className="tt-lens-label">
            <span>01 / THE COMPUTATION</span>
            <small>96-task cohort</small>
          </div>
          <svg
            viewBox="0 0 565 310"
            role="group"
            aria-labelledby={id}
            className="tt-plot"
          >
            <title id={id}>
              Accuracy versus actual simulated GPU cost. One correctness-trained
              checkpoint at 1, 2, 4 and 8 times nominal allowance. Select a
              budget to inspect its value and paired teaching scenario.
            </title>
            {[20, 40, 60, 80, 100].map((v) => (
              <g key={v}>
                <path
                  d={`M58 ${y(v)}H528`}
                  stroke="#263c4b"
                  strokeDasharray="2 6"
                />
                <text x="46" y={y(v) + 4} textAnchor="end" className="ls-small">
                  {v}
                </text>
              </g>
            ))}
            <text x="58" y="19" className="ls-small">
              Accuracy (%)
            </text>
            {[0, 10, 20, 30].map((v) => (
              <text
                key={v}
                x={x(v)}
                y="282"
                textAnchor="middle"
                className="ls-small"
              >
                {v}
              </text>
            ))}
            <text x="293" y="304" textAnchor="middle" className="ls-small">
              Actual GPU-s / task
            </text>
            <path
              d={path(BASE)}
              fill="none"
              stroke="#7b90a3"
              strokeDasharray="4 5"
              opacity=".45"
            />
            <path
              d={path(RUNS)}
              fill="none"
              stroke="#f3a0bc"
              strokeWidth="2"
              opacity=".17"
            />
            {RUNS.slice(0, -1).map((r, i) => (
              <path
                key={i}
                d={path([r, RUNS[i + 1]])}
                fill="none"
                stroke="#f3a0bc"
                strokeWidth="3"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset={index > i ? 0 : 1}
                className="tt-curve-segment"
              />
            ))}
            {RUNS.map((r, i) => (
              <g
                key={i}
                role="button"
                tabIndex={0}
                aria-label={`Inspect ${BUDGETS[i]} times compute: ${r.accuracy.toFixed(1)} percent illustrative accuracy`}
                aria-pressed={index === i}
                className="tt-point"
                onClick={() => film.seek(MOMENTS[i])}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    film.seek(MOMENTS[i]);
                  }
                }}
              >
                <circle
                  cx={x(r.meanCost)}
                  cy={y(r.accuracy)}
                  r="20"
                  fill="transparent"
                />
                <circle
                  cx={x(r.meanCost)}
                  cy={y(r.accuracy)}
                  r="4"
                  fill={i <= index ? "#f3a0bc" : "#405565"}
                />
                <text
                  x={x(r.meanCost)}
                  y={y(r.accuracy) - 16}
                  textAnchor="middle"
                  className="ls-small"
                >
                  {BUDGETS[i]}×
                </text>
              </g>
            ))}
            <g
              className="tt-marker"
              style={{
                transform: `translate(${x(run.meanCost)}px, ${y(run.accuracy)}px)`,
              }}
              aria-hidden="true"
            >
              <circle
                r="12"
                fill="#f3a0bc"
                fillOpacity=".11"
                stroke="#f3a0bc"
                strokeOpacity=".55"
              />
              <circle r="4" fill="#fff1f7" />
            </g>
          </svg>
          <div className="tt-equation">
            <span>y = verified outcomes / 96</span>
            <span>x = Σ actual GPU work / 96</span>
          </div>
          <div className="tt-checkpoint-key">
            <i />
            RL checkpoint <span>┄ Base reference</span>
          </div>
          <div className="tt-search-contract">
            <code>Cᵦ = Search(x, θ*, b)</code>
            <p>Checkpoint fixed. Search and verification spend the budget.</p>
            <strong>
              +{run.correct - RUNS[0].correct} net verified outcomes
            </strong>
            <span>
              for +{(run.meanCost - RUNS[0].meanCost).toFixed(2)} GPU-s/task
              versus 1×
            </span>
          </div>
        </section>
        <section
          className="tt-application"
          aria-label="Practical repository assistant teaching scenario"
        >
          <div className="tt-lens-label">
            <span>02 / THE REQUEST</span>
            <small>Teaching scenario</small>
          </div>
          <div className="tt-question">
            <span>USER → REPOSITORY ASSISTANT</span>
            <p>
              “A payment timed out. The retry charged the customer twice. Find
              the cause and a safe fix.”
            </p>
          </div>
          <div
            className="tt-repo-trace"
            aria-label={`${example.files} of 3 relevant components inspected`}
          >
            {["checkout.ts", "retry.ts", "payments.ts"].map((file, i) => (
              <div key={file} data-reached={i < example.files}>
                <i>{i < example.files ? "✓" : "·"}</i>
                <span>{file}</span>
                {i < 2 && <b aria-hidden="true">→</b>}
              </div>
            ))}
          </div>
          <div className="tt-agent-action" key={index}>
            <span>
              ATTEMPT {index + 1} / {example.action}
            </span>
            <p>{example.detail}</p>
            <div
              className="tt-sequence-scroll"
              tabIndex={0}
              role="region"
              aria-label="Retry sequence; scroll horizontally on narrow screens"
            >
              <RetrySequence
                accepted={example.accepted}
                progress={sequenceProgress}
              />
            </div>
          </div>
          <div className="tt-agent-decision">
            <span>REASONING CONTROLLER</span>
            <strong>
              {!verdictReady
                ? "Replay the timeout → check the outcome"
                : [
                    "No valid fix → keep searching",
                    "Fix unverified → run the check",
                    "Candidate accepted → audit boundaries",
                    "Checks complete → return the fix",
                  ][index]}
            </strong>
          </div>
          <div
            className="tt-verdict"
            data-accepted={verdictReady && example.accepted}
            data-pending={!verdictReady}
          >
            <i>{!verdictReady ? "·" : example.accepted ? "✓" : "×"}</i>
            <strong>
              {verdictReady ? example.status : "Replaying the timeout…"}
            </strong>
          </div>
          <p className="tt-boundary">
            The request triggers search and verification, not a policy update.
            This case illustrates behavior; it is not one of the plotted
            cohort’s task records.
          </p>
        </section>
      </div>
      <div className="tt-revelation" key={`reveal-${index}`}>
        <span>{BUDGETS[index]}× thought</span>
        <strong>
          {returning
            ? `Hold ${comparisonBudget}×. Compare policies next.`
            : example.title}
        </strong>
        <p>
          <b>{run.correct}/96</b> verified outcomes ·{" "}
          <b>{run.meanCost.toFixed(2)}</b> GPU-s/task{" "}
          <small>Simulated, not measured</small>
        </p>
      </div>
      <div className="tt-controls">
        <div
          className="tt-budget-buttons"
          role="group"
          aria-label="Test-time compute allowance"
        >
          {BUDGETS.map((b, i) => (
            <button
              type="button"
              key={b}
              aria-pressed={index === i}
              onClick={() => film.seek(MOMENTS[i])}
            >
              {b}×
              <span>
                {
                  [
                    "First attempt",
                    "Trace further",
                    "Find the invariant",
                    "Check boundaries",
                  ][i]
                }
              </span>
            </button>
          ))}
        </div>
        <div className="tt-playhead">
          <button
            type="button"
            className="cf-local-play"
            disabled={reduced}
            aria-label={
              playing ? "Pause scaling reveal" : "Play scaling reveal"
            }
            onClick={onToggle}
          >
            {playing ? "Ⅱ" : "▷"}
          </button>
          <span>Scrub the reveal</span>
          <input
            type="range"
            min="0"
            max="21000"
            step="10"
            value={film.time}
            aria-label="Scrub test-time scaling reveal"
            aria-valuetext={`${BUDGETS[index]} times allowance, ${(film.time / 1000).toFixed(1)} seconds`}
            onChange={(e) => film.seek(Number(e.target.value))}
          />
          <time>{(film.time / 1000).toFixed(1)} / 21s</time>
        </div>
        <div className="tt-evidence">{evidence(run, onPause)}</div>
      </div>
    </div>
  );
}
