"use client";

import { useId } from "react";
import type { ServingFrame } from "./serving-load-overview-model";
import {
  deliveryFrame,
  deliveryStudy,
  type DeliveryTargets,
} from "./serving-delivery-model";
import "./serving-delivery-scenes.css";

const BLUE = "#9cc5f5",
  GREEN = "#b8e986",
  AMBER = "#ffc267",
  RED = "#ff9185",
  VIOLET = "#c7a6ff";
const x = (ms: number) => 192 + (ms / 500) * 540;

export function ServingDeliveryScene({
  frame,
  targets,
  selected,
  onSelect,
  onPause,
  reduced,
}: {
  frame: ServingFrame;
  targets: DeliveryTargets;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onPause: () => void;
  reduced: boolean;
}) {
  const id = useId(),
    f = deliveryFrame(frame),
    study = deliveryStudy(targets);
  const r = study.requests.find((row) => row.id === selected);
  const focusId =
    r?.id ??
    (f.lens === "first"
      ? "R2"
      : f.lens === "gap"
        ? "R3"
        : f.lens === "validity"
          ? "R4"
          : null);
  const details = r
    ? {
        title: [
          r.id,
          r.qualified
            ? "Meets every target."
            : !r.completed
              ? "Cancelled before output."
              : !r.qualityPass
                ? "Answer fails validation."
                : !r.firstPass
                  ? "First token misses target."
                  : "Stream gap misses target.",
        ],
        value: r.qualified ? "✓" : "×",
        unit: "",
        caption: r.qualified
          ? "qualifying completion"
          : "excluded from qualifying count",
        rows: [
          [
            "First token (TTFT)",
            r.firstToken === null ? "none" : `${r.firstToken} ms`,
          ],
          [
            "Longest gap (ITL)",
            r.longestGap ? `${r.longestGap.ms} ms` : "none",
          ],
          [
            "Validation",
            r.valid === null ? "no answer" : r.valid ? "pass" : "fail",
          ],
        ],
        color: r.qualified ? GREEN : RED,
        notes: [
          "The entire offered cohort stays counted.",
          "Inspect another row or press Escape.",
          "Targets do not change task correctness.",
        ],
      }
    : f.lens === "first"
      ? {
          title: ["First token latency", "is measured from arrival."],
          value: "160",
          unit: "ms",
          caption: "R2 time to first token (TTFT)",
          color: targets.firstTokenMs >= 160 ? GREEN : RED,
          rows: [
            ["First-token target", `${targets.firstTokenMs} ms`],
            ["R2 first token", "160 ms"],
            ["Result", targets.firstTokenMs >= 160 ? "passes" : "too late"],
          ],
          notes: [
            "A completed answer can start late.",
            "The bracket isolates the first wait.",
            "Targets change qualification only.",
            "The request timings stay fixed.",
          ],
        }
      : f.lens === "gap"
        ? {
            title: ["A fast first token", "can still hide a stall."],
            value: "100",
            unit: "ms",
            caption: "R3 longest inter-token gap",
            color: targets.maxGapMs >= 100 ? GREEN : RED,
            rows: [
              ["First token", "40 ms"],
              ["Gap target", `${targets.maxGapMs} ms`],
              ["Result", targets.maxGapMs >= 100 ? "passes" : "gap too long"],
            ],
            notes: [
              "Token 2 arrives at 60 ms.",
              "Token 3 arrives at 160 ms.",
              "This is max ITL, not mean TPOT.",
            ],
          }
        : f.lens === "validity"
          ? {
              title: ["R4 is fast enough.", "Its answer is invalid."],
              value: "×",
              unit: "",
              caption: "excluded despite low latency",
              color: RED,
              rows: [
                ["First-token target", "passes"],
                ["Gap target", "passes"],
                ["Validation", "fails"],
              ],
              notes: [
                "Latency compliance is not correctness.",
                "An independent check rejects R4.",
                "Looser latency targets cannot fix it.",
              ],
            }
          : {
              title: ["Count answers that", "meet all three checks."],
              value: `${study.qualified}`,
              unit: `/ ${study.offered}`,
              caption: "qualified / offered requests",
              color: GREEN,
              rows: [
                ["Completed", `${study.completed} / ${study.offered}`],
                ["Observation window", "0.5 s"],
                ["Qualified rate", `${study.qualifiedRate} / s`],
              ],
              notes: [
                "Qualification = complete + on time",
                "+ acceptable stream gaps + valid.",
                "All five arrivals remain in the cohort.",
              ],
            };
  const leaderY = focusId
    ? 180 + study.requests.findIndex((row) => row.id === focusId) * 76
    : 634;
  const linkStart = r
    ? 746
    : f.lens === "first"
      ? x(160)
      : f.lens === "gap"
        ? x(160)
        : f.lens === "validity"
          ? 746
          : 258 + (study.qualified / study.completed) * 312;
  const leader = reduced || r ? 1 : f.reveal;

  return (
    <svg
      className="sd-diagram"
      viewBox="0 0 1080 700"
      role="group"
      aria-labelledby={id}
      data-lens={f.lens}
      data-qualified={study.qualified}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onSelect(null);
          event.stopPropagation();
        }
      }}
    >
      <title id={id}>
        Completion, first-token latency, token gaps and independently valid
        answers
      </title>
      {f.lens === "completion" ? (
        <g>
          <text x="32" y="40" className="sd-title">
            Completed and cancelled requests
          </text>
          <text x="32" y="75" className="sd-small">
            Original A–D workload · committed tokens retained
          </text>
          {(["A", "B", "C", "D"] as const).map((request, i) => (
            <g key={request}>
              <circle
                cx="87"
                cy={155 + i * 95}
                r="23"
                fill="#192d38"
                stroke={request === "D" ? VIOLET : BLUE}
              />
              <text
                x="87"
                y={162 + i * 95}
                textAnchor="middle"
                className="sd-label"
              >
                {request}
              </text>
              <path
                d={`M112 ${155 + i * 95}H610`}
                stroke={request === "D" ? VIOLET : GREEN}
                strokeWidth="2"
              />
              {frame.requests[request].tokens.map((token, n) => (
                <g key={token}>
                  <rect
                    x={175 + n * 47}
                    y={139 + i * 95}
                    width="38"
                    height="32"
                    rx="3"
                    fill="#223a31"
                    stroke={request === "D" ? VIOLET : GREEN}
                  />
                  <text
                    x={194 + n * 47}
                    y={160 + i * 95}
                    textAnchor="middle"
                    className="sd-small"
                  >
                    {token}
                  </text>
                </g>
              ))}
              <text
                x="635"
                y={161 + i * 95}
                className="sd-label"
                fill={request === "D" ? VIOLET : GREEN}
              >
                {request === "D" ? "cancelled" : "complete"}
              </text>
            </g>
          ))}
          <g transform="translate(803 95)">
            <text x="0" y="44" className="sd-card-title">
              Three answers completed.
            </text>
            <text x="0" y="73" className="sd-card-title">
              Now check delivery quality.
            </text>
            <text x="0" y="158" className="sd-metric" fill={GREEN}>
              {f.storyCompleted.length}
              <tspan className="sd-unit"> / 4</tspan>
            </text>
            <text x="0" y="190" className="sd-small">
              completed in the A–D story
            </text>
            <text x="0" y="266" className="sd-label">
              First-token target?
            </text>
            <text x="0" y="307" className="sd-label">
              Streaming-gap target?
            </text>
            <text x="0" y="348" className="sd-label">
              Independent validity?
            </text>
          </g>
          <text x="32" y="570" className="sd-label" fill={AMBER}>
            Next: apply those checks to a separate worked delivery trace.
          </text>
        </g>
      ) : (
        <g>
          <text x="32" y="36" className="sd-title">
            Completed answers versus qualified delivery
          </text>
          <text x="32" y="66" className="sd-small">
            Worked example · five simultaneous arrivals · 500 ms window ·
            separate from A–D
          </text>
          <text x="32" y="112" className="sd-label">
            Request
          </text>
          <text x="192" y="112" className="sd-label">
            Arrival → first token → answer stream → completion
          </text>
          <text x="748" y="112" className="sd-small" textAnchor="end">
            quality
          </text>
          <g opacity={f.lens === "first" || r ? 1 : 0.5}>
            <path
              d={`M${x(targets.firstTokenMs)} 135V510`}
              stroke={VIOLET}
              strokeDasharray="4 5"
            />
            <text
              x={x(targets.firstTokenMs) + 7}
              y="137"
              className="sd-small"
              fill={VIOLET}
            >
              TTFT ≤ {targets.firstTokenMs} ms
            </text>
          </g>
          {study.requests.map((request, i) => {
            const y = 180 + i * 76,
              active = focusId === null || focusId === request.id;
            const color = request.qualified
              ? GREEN
              : !request.completed
                ? VIOLET
                : RED;
            const firstFocus = (f.lens === "first" || !!r) && active;
            const gapFocus = (f.lens === "gap" || !!r) && active;
            return (
              <g
                key={request.id}
                className="sd-request"
                role="button"
                tabIndex={0}
                aria-pressed={r?.id === request.id}
                aria-label={`Inspect ${request.id}: ${request.qualified ? "qualifies" : !request.completed ? "cancelled" : !request.qualityPass ? "invalid answer" : !request.firstPass ? "late first token" : "long token gap"}`}
                onFocus={onPause}
                onClick={() =>
                  onSelect(r?.id === request.id ? null : request.id)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(r?.id === request.id ? null : request.id);
                  }
                }}
              >
                <rect
                  className="sd-hit"
                  x="25"
                  y={y - 35}
                  width="738"
                  height="74"
                  rx="4"
                />
                <g opacity={active ? 1 : 0.72}>
                  <text x="39" y={y + 5} className="sd-label">
                    {request.id}
                  </text>
                  <text x="83" y={y + 5} className="sd-small" fill={color}>
                    {request.qualified
                      ? "qualifies"
                      : request.completed
                        ? "excluded"
                        : "cancelled"}
                  </text>
                  <path d={`M192 ${y}H732`} stroke="#375361" />
                  <circle cx="192" cy={y} r="4" fill={BLUE} />
                  {request.firstToken !== null && (
                    <>
                      <path
                        d={`M192 ${y}H${x(request.firstToken)}`}
                        stroke={
                          firstFocus ? (request.firstPass ? GREEN : RED) : BLUE
                        }
                        strokeWidth={firstFocus ? 5 : 2}
                      />
                      <path
                        d={`M${x(request.firstToken)} ${y}H${x(request.completeMs!)}`}
                        stroke={BLUE}
                        strokeWidth="2"
                      />
                    </>
                  )}
                  {gapFocus && request.longestGap && (
                    <path
                      d={`M${x(request.longestGap.start)} ${y}H${x(request.longestGap.end)}`}
                      stroke={request.gapPass ? GREEN : RED}
                      strokeWidth="6"
                    />
                  )}
                  {request.tokens.map((token) => (
                    <rect
                      key={token}
                      x={x(token) - 3}
                      y={y - 9}
                      width="6"
                      height="18"
                      rx="1"
                      fill={BLUE}
                    />
                  ))}
                  {request.completeMs !== null && (
                    <path
                      d={`M${x(request.completeMs) - 4} ${y - 5}l4 5 -4 5M${x(request.completeMs)} ${y}h4`}
                      fill="none"
                      stroke={GREEN}
                      strokeWidth="2"
                    />
                  )}
                  {request.cancelMs !== null && (
                    <g>
                      <path
                        d={`M192 ${y}H${x(request.cancelMs)}`}
                        stroke={VIOLET}
                        strokeWidth="2"
                      />
                      <path
                        d={`M${x(request.cancelMs) - 5} ${y - 6}l10 12m0 -12 -10 12`}
                        stroke={VIOLET}
                        strokeWidth="2"
                      />
                    </g>
                  )}
                  <circle
                    cx="744"
                    cy={y}
                    r={f.lens === "validity" && active ? 15 : 11}
                    fill="#162934"
                    stroke={
                      request.valid === true
                        ? GREEN
                        : request.valid === false
                          ? RED
                          : VIOLET
                    }
                    strokeWidth={f.lens === "validity" && active ? 2.5 : 1}
                  />
                  <text
                    x="744"
                    y={y + 5}
                    textAnchor="middle"
                    className="sd-value"
                    fill={
                      request.valid === true
                        ? GREEN
                        : request.valid === false
                          ? RED
                          : VIOLET
                    }
                  >
                    {request.valid === true
                      ? "✓"
                      : request.valid === false
                        ? "×"
                        : "·"}
                  </text>
                  {firstFocus && request.firstToken !== null && (
                    <>
                      <path
                        d={`M192 ${y + (r ? -6 : 15)}v${r ? -6 : 8}H${x(request.firstToken)}v${r ? 6 : -8}`}
                        fill="none"
                        stroke={request.firstPass ? GREEN : RED}
                      />
                      <text
                        x={(192 + x(request.firstToken)) / 2}
                        y={y + (r ? -18 : 41)}
                        textAnchor="middle"
                        className="sd-small"
                      >
                        {request.firstToken} ms
                      </text>
                    </>
                  )}
                  {gapFocus && request.longestGap && (
                    <>
                      <path
                        d={`M${x(request.longestGap.start)} ${y + (r ? 10 : 15)}v${r ? 6 : 8}H${x(request.longestGap.end)}v${r ? -6 : -8}`}
                        fill="none"
                        stroke={request.gapPass ? GREEN : RED}
                      />
                      <text
                        x={
                          (x(request.longestGap.start) +
                            x(request.longestGap.end)) /
                          2
                        }
                        y={y + (r ? 30 : 41)}
                        textAnchor="middle"
                        className="sd-small"
                      >
                        {request.longestGap.ms} ms gap
                      </text>
                    </>
                  )}
                </g>
              </g>
            );
          })}
          {[0, 100, 200, 300, 400, 500].map((ms) => (
            <text
              key={ms}
              x={x(ms)}
              y="526"
              textAnchor="middle"
              className="sd-small"
            >
              {ms}
            </text>
          ))}
          <text x="732" y="547" textAnchor="end" className="sd-small">
            elapsed milliseconds
          </text>
          <g opacity={f.lens === "qualified" ? 1 : 0.55}>
            <text x="32" y="581" className="sd-label">
              Same 0.5 s window
            </text>
            <text x="258" y="572" className="sd-small">
              All completions
            </text>
            <path d="M258 589H570" stroke={BLUE} strokeWidth="8" />
            <text x="587" y="595" className="sd-label" fill={BLUE}>
              {study.completionRate} / s
            </text>
            <text x="258" y="618" className="sd-small">
              Qualified completions
            </text>
            <path
              d={`M258 634H${258 + (study.qualified / study.completed) * 312}`}
              stroke={GREEN}
              strokeWidth="8"
            />
            <text
              x={275 + (study.qualified / study.completed) * 312}
              y="640"
              className="sd-label"
              fill={GREEN}
            >
              {study.qualifiedRate} / s
            </text>
          </g>
          <path
            className="sd-leader"
            d={
              f.lens === "qualified" && !r
                ? `M${linkStart} 634v17H779V238H814`
                : `M${linkStart} ${leaderY + (r || f.lens === "validity" ? 0 : 23)}H779V238H814`
            }
            fill="none"
            stroke={details.color}
            strokeWidth="2.2"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - leader}
          />
          <g transform="translate(803 82)">
            <rect
              width="247"
              height="556"
              rx="8"
              fill="#1c2037"
              stroke="#776b9d"
            />
            {details.title.map((line, i) => (
              <text key={i} x="21" y={39 + i * 28} className="sd-card-title">
                {line}
              </text>
            ))}
            <text x="21" y="156" className="sd-metric" fill={details.color}>
              {details.value}
              <tspan className="sd-unit"> {details.unit}</tspan>
            </text>
            <text x="21" y="185" className="sd-small">
              {details.caption}
            </text>
            {details.rows.map(([label, value], i) => (
              <g key={label}>
                <text x="21" y={246 + i * 43} className="sd-small">
                  {label}
                </text>
                <text
                  x="225"
                  y={246 + i * 43}
                  textAnchor="end"
                  className="sd-value"
                >
                  {value}
                </text>
              </g>
            ))}
            <path d="M21 379H225" stroke="#55516f" />
            {details.notes.map((line, i) => (
              <text key={i} x="21" y={412 + i * 23} className="sd-note">
                {line}
              </text>
            ))}
            {r && (
              <text x="21" y="527" className="sd-small" fill={VIOLET}>
                Selected request · Esc releases
              </text>
            )}
          </g>
          <text x="32" y="680" className="sd-small">
            Blue ticks: tokens · green marker: completion. Select a request to
            inspect its checks.
          </text>
        </g>
      )}
    </svg>
  );
}
