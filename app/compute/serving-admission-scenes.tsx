"use client";

import { useId, useState, type ReactNode } from "react";
import type { ServingFrame } from "./serving-load-overview-model";
import {
  servingAdmissionFrame,
  type AdmissionFocus,
} from "./serving-admission-model";
import "./serving-admission-scenes.css";

const BLUE = "#9cc5f5",
  AMBER = "#ffc267",
  RED = "#ff9185",
  GREEN = "#b8e986",
  VIOLET = "#c7a6ff";

function Inspect({
  label,
  selected,
  onInspect,
  onPreview,
  children,
}: {
  label: string;
  selected: boolean;
  onInspect: () => void;
  onPreview: (active: boolean) => void;
  children: ReactNode;
}) {
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={selected}
      className="sa-inspect"
      onPointerEnter={() => onPreview(true)}
      onPointerLeave={() => onPreview(false)}
      onFocus={() => onPreview(true)}
      onBlur={() => onPreview(false)}
      onClick={onInspect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onInspect();
        }
      }}
    >
      {children}
    </g>
  );
}

export function ServingAdmissionScenes({
  frame,
  onPause,
  reduced,
  revision,
}: {
  frame: ServingFrame;
  onPause: () => void;
  reduced: boolean;
  revision: number;
}) {
  const id = useId();
  const [preview, setPreview] = useState<{
    focus: AdmissionFocus;
    revision: number;
  } | null>(null);
  const [pin, setPin] = useState<{
    focus: AdmissionFocus;
    at: number;
    revision: number;
  } | null>(null);
  const f = servingAdmissionFrame(frame);
  const pinned =
    pin?.at === frame.storyMs && pin.revision === revision ? pin.focus : null;
  const hover = preview?.revision === revision ? preview.focus : null;
  const focus = pinned ?? hover ?? f.defaultFocus;
  const props = (key: AdmissionFocus, label: string) => ({
    label,
    selected: pinned === key,
    onPreview: (active: boolean) => {
      if (active) onPause();
      setPreview(active ? { focus: key, revision } : null);
    },
    onInspect: () => {
      onPause();
      setPin(
        pinned === key ? null : { focus: key, at: frame.storyMs, revision },
      );
    },
  });
  const sceneTitle = !f.arrived
    ? "One answer is already in flight"
    : !f.admitted
      ? "A new input must pass two different resource checks"
      : f.finished
        ? "B finishes; its reusable prefix remains in memory"
        : f.paused
          ? "The input is admitted; the existing answer waits"
          : f.inputFinished
            ? "B generates its answer; A keeps streaming"
            : "A’s answer resumes while B finishes its input";
  const card =
    focus === "tokens"
      ? {
          title: !f.arrived
            ? ["One decode unit", "already occupies a slot."]
            : f.admitted
              ? ["A smaller input chunk", "passes the token gate."]
              : ["Memory fits.", "This token step does not."],
          value: `${f.tokenTotal}`,
          unit: `/ ${f.tokenLimit}`,
          caption: f.admitted
            ? "token units at admission"
            : "token units in this step",
          color: f.tokenPass ? GREEN : RED,
          rows: [
            ["A · decode", "1"],
            ["B · input", `${f.proposed}`],
            [
              "Decision",
              !f.arrived ? "A running" : f.admitted ? "admit chunk" : "hold B",
            ],
          ],
          lines: f.admitted
            ? [
                "4 input units admitted first.",
                "3 assigned to later steps.",
                "The request is not truncated.",
              ]
            : !f.arrived
              ? [
                  "A uses 1 decode slot.",
                  "5 slots remain for new work.",
                  "B has not arrived yet.",
                ]
              : [
                  "1 decode + 7 input = 8.",
                  "The step budget is 6.",
                  "Free memory alone is insufficient.",
                ],
        }
      : focus === "memory"
        ? {
            title: f.finished
              ? ["B finishes.", "Its prefix remains ready."]
              : ["Reserve KV capacity", "before admitting B."],
            value: `${f.finished ? f.retained : f.arrived ? f.memoryTotalAtAdmission : f.occupied}`,
            unit: f.finished ? "pages" : `/ ${f.memoryLimit}`,
            caption: f.finished
              ? "ready prefix retained"
              : f.arrived
                ? "pages required to admit B"
                : "pages occupied by A",
            color: AMBER,
            rows: f.finished
              ? [
                  ["Before B finishes", `${f.memoryTotalAtAdmission}`],
                  ["Occupied now", `${f.occupied}`],
                  [
                    "Private pages freed",
                    `${f.memoryTotalAtAdmission - f.occupied}`,
                  ],
                ]
              : [
                  ["A-owned pages", "3"],
                  [
                    f.finished ? "B prefix retained" : "B reservation",
                    `${f.finished ? f.retained : f.arrived ? 4 : 0}`,
                  ],
                  [
                    f.admitted ? "Free pages" : "Free after admission",
                    `${8 - (f.finished ? f.occupied : f.arrived ? f.memoryTotalAtAdmission : 3)}`,
                  ],
                ],
            lines: f.finished
              ? [
                  "B releases its private pages.",
                  "Its two reusable pages remain.",
                  "The next request can reference them.",
                ]
              : [
                  "KV pages store attention state.",
                  "They are not token-work slots.",
                  "Both resource checks must pass.",
                ],
          }
        : {
            title: f.paused
              ? ["B processes its input.", "A’s next token waits."]
              : f.admitted
                ? ["A’s stream resumes", "on the same request."]
                : ["Request A is already", "generating an answer."],
            value: `${f.delivered}`,
            unit: "/ 8",
            caption: "A’s output tokens delivered",
            color: f.paused ? RED : BLUE,
            rows: [
              ["A · status", f.paused ? "waiting" : "streaming"],
              [
                "B · status",
                frame.requests.B.phase === "future"
                  ? "not arrived"
                  : frame.requests.B.phase,
              ],
              ["A · next delivery", `token ${f.delivered + 1}`],
            ],
            lines: f.paused
              ? [
                  "Admission passed both checks.",
                  "It did not guarantee smooth delivery.",
                  "Next: inspect token continuity.",
                ]
              : f.admitted
                ? [
                    "The next blue token arrives.",
                    "The request identity is unchanged.",
                    "Input scheduling shapes this gap.",
                  ]
                : [
                    "A owns 3 KV pages.",
                    "A decode step uses 1 token slot.",
                    "Incoming work must share capacity.",
                  ],
          };
  const bReveal = reduced && f.arrived ? 1 : f.arrivalReveal;
  const chunkReveal = reduced && f.admitted ? 1 : f.chunkReveal;
  const linkReveal = reduced || pinned || hover ? 1 : f.focusReveal;
  return (
    <svg
      className="sa-diagram"
      viewBox="0 0 1080 700"
      role="group"
      aria-labelledby={id}
      data-focus={focus}
      data-paused-token={f.paused}
      data-admitted={f.admitted}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setPin(null);
          setPreview(null);
          event.stopPropagation();
        }
      }}
    >
      <title id={id}>
        Request admission: token budget, KV capacity and the existing answer
        stream
      </title>
      <text x="32" y="35" className="sa-title">
        {sceneTitle}
      </text>
      <text x="32" y="62" className="sa-small">
        One replica · token units per scheduling step · eight KV pages
      </text>

      {renderStream()}

      <g
        opacity={0.62 + bReveal * 0.38}
        transform={`translate(${(1 - bReveal) * -16} 0)`}
      >
        <circle cx="55" cy="271" r="18" fill="#332c23" stroke={AMBER} />
        <text
          x="55"
          y="277"
          textAnchor="middle"
          className="sa-label"
          fill={AMBER}
        >
          B
        </text>
        <text x="86" y="266" className="sa-label">
          Request B
        </text>
        <text x="86" y="288" className="sa-small">
          {f.arrived ? "7 input token units" : "next arrival"}
        </text>
        {Array.from({ length: 7 }, (_, i) => (
          <g
            key={i}
            transform={`translate(0 ${i >= 4 && !f.inputFinished ? 8 * chunkReveal : 0})`}
          >
            <rect
              x={34 + i * 31}
              y="317"
              width="25"
              height="40"
              rx="3"
              fill={
                f.inputFinished
                  ? "#24362e"
                  : f.admitted && i >= 4
                    ? "#142731"
                    : "#3b3026"
              }
              stroke={f.inputFinished ? GREEN : AMBER}
              strokeDasharray={
                f.admitted && !f.inputFinished && i >= 4 ? "3 4" : undefined
              }
            />
            <text
              x={46.5 + i * 31}
              y="342"
              textAnchor="middle"
              className="sa-small"
              fill={f.inputFinished ? GREEN : AMBER}
            >
              {i + 1}
            </text>
          </g>
        ))}
        <path
          d={`M35 368v8h${f.admitted && !f.inputFinished ? 117 : 210}v-8`}
          fill="none"
          stroke={f.admitted ? GREEN : AMBER}
        />
        <text
          x="34"
          y="402"
          className="sa-small"
          fill={f.admitted ? GREEN : AMBER}
        >
          {f.inputFinished
            ? "7 input units processed"
            : f.admitted
              ? "4 admitted in the first chunk"
              : "7 requested together"}
        </text>
        {f.admitted && !f.inputFinished && (
          <>
            <path d="M159 378v8h85v-8" fill="none" stroke={AMBER} />
            <text x="34" y="425" className="sa-small">
              3 assigned to later steps
            </text>
          </>
        )}
        <path
          d="M260 336H302V273H340M302 336V467H340"
          fill="none"
          stroke={f.arrived ? AMBER : "#3e5767"}
          strokeWidth="2"
        />
        <circle cx="302" cy="336" r="4" fill={AMBER} />
      </g>

      <Inspect
        {...props(
          "tokens",
          "Inspect token work: one decode unit plus the proposed input chunk",
        )}
      >
        <rect
          className="sa-hit"
          x="338"
          y="216"
          width="422"
          height="154"
          rx="6"
        />
        <g opacity={focus === "tokens" ? 1 : 0.72}>
          <text x="350" y="239" className="sa-label">
            {f.admitted
              ? "Token work · admission snapshot"
              : "Token work · this step"}
          </text>
          {Array.from({ length: 8 }, (_, i) => {
            const used = i === 0,
              proposed = i > 0 && i < f.tokenTotal,
              overflow = i >= 6;
            const color = used
              ? BLUE
              : proposed
                ? overflow
                  ? RED
                  : AMBER
                : "#587182";
            return (
              <g key={i}>
                <rect
                  x={350 + i * 49}
                  y="259"
                  width="39"
                  height="39"
                  rx="3"
                  fill={
                    used
                      ? "#23384a"
                      : proposed
                        ? overflow
                          ? "#422b32"
                          : "#3a3027"
                        : "#122631"
                  }
                  stroke={color}
                  strokeDasharray={overflow && !proposed ? "3 4" : undefined}
                />
                <text
                  x={369.5 + i * 49}
                  y="284"
                  textAnchor="middle"
                  className="sa-value"
                  fill={color}
                >
                  {used ? "A" : proposed ? "B" : "·"}
                </text>
              </g>
            );
          })}
          <path d="M639 249v59" stroke={VIOLET} strokeWidth="2" />
          <text
            x="637"
            y="330"
            textAnchor="end"
            className="sa-small"
            fill={VIOLET}
          >
            6-unit limit
          </text>
          <text
            x="350"
            y="356"
            className="sa-equation"
            fill={f.tokenPass ? GREEN : RED}
          >
            {!f.arrived
              ? "1 of 6 used"
              : `1 + ${f.proposed} = ${f.tokenTotal} ${f.tokenPass ? "≤" : ">"} 6`}
          </text>
          <text
            x="740"
            y="356"
            textAnchor="end"
            className="sa-label"
            fill={f.tokenPass ? GREEN : RED}
          >
            {f.arrived ? (f.tokenPass ? "fits" : "hold") : "running"}
          </text>
        </g>
      </Inspect>

      <Inspect
        {...props(
          "memory",
          "Inspect KV ownership: existing pages and B’s reservation",
        )}
      >
        <rect
          className="sa-hit"
          x="338"
          y="402"
          width="422"
          height="156"
          rx="6"
        />
        <g opacity={focus === "memory" ? 1 : 0.76}>
          <text x="350" y="426" className="sa-label">
            KV memory · page reservations
          </text>
          {frame.pages.one.map((owner, i) => {
            const candidate = f.arrived && !f.admitted && i >= 3 && i <= 6;
            const color =
              owner === "A"
                ? BLUE
                : owner === "B" || owner === "B-prefix" || candidate
                  ? AMBER
                  : "#587182";
            return (
              <g key={i}>
                <rect
                  x={350 + i * 49}
                  y="448"
                  width="39"
                  height="39"
                  rx="3"
                  fill={
                    owner === "A"
                      ? "#23384a"
                      : owner === "B" || owner === "B-prefix"
                        ? "#3a3027"
                        : "#122631"
                  }
                  stroke={color}
                  strokeDasharray={candidate ? "3 3" : undefined}
                />
                <text
                  x={369.5 + i * 49}
                  y="474"
                  textAnchor="middle"
                  className="sa-value"
                  fill={color}
                >
                  {candidate
                    ? "B?"
                    : owner === "B-prefix"
                      ? "B*"
                      : (owner ?? "·")}
                </text>
                <text
                  x={369.5 + i * 49}
                  y="507"
                  textAnchor="middle"
                  className="sa-small"
                >
                  {i + 1}
                </text>
              </g>
            );
          })}
          <text x="350" y="543" className="sa-equation" fill={GREEN}>
            {f.finished
              ? "3 live + 2 cached = 5"
              : f.arrived
                ? "3 + 4 = 7 ≤ 8"
                : "3 of 8 occupied"}
          </text>
          <text
            x="740"
            y="543"
            textAnchor="end"
            className="sa-label"
            fill={GREEN}
          >
            {f.finished ? "retained" : "fits"}
          </text>
        </g>
      </Inspect>

      {f.arrived && (
        <g className="sa-link">
          <path
            d={
              focus === "tokens"
                ? `M${f.tokenPass ? 350 : 644} 303v9H${f.tokenPass ? 585 : 733}v-9M${f.tokenPass ? 585 : 733} 309H779V231H814`
                : focus === "memory"
                  ? f.finished
                    ? "M497 491v25H585v-25M585 516H779V231H814"
                    : "M350 491v25H733v-25M733 516H779V231H814"
                  : `M${350 + Math.min(f.delivered, 7) * 49} 154v20H779V231H814`
            }
            fill="none"
            stroke={card.color}
            strokeWidth="2.2"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - linkReveal}
          />
        </g>
      )}

      <g
        className="sa-consequence"
        transform="translate(803 90)"
        opacity={0.7 + 0.3 * linkReveal}
      >
        <rect width="247" height="484" rx="8" fill="#1c2037" stroke="#776b9d" />
        {card.title.map((line, i) => (
          <text key={line} x="21" y={38 + i * 28} className="sa-card-title">
            {line}
          </text>
        ))}
        <text x="21" y="150" className="sa-metric" fill={card.color}>
          {card.value}
          <tspan className="sa-unit"> {card.unit}</tspan>
        </text>
        <text x="21" y="177" className="sa-small">
          {card.caption}
        </text>
        {card.rows.map(([label, value], i) => (
          <g key={label}>
            <text x="21" y={231 + i * 40} className="sa-small">
              {label}
            </text>
            <text
              x="225"
              y={231 + i * 40}
              textAnchor="end"
              className="sa-value"
            >
              {value}
            </text>
          </g>
        ))}
        <path d="M21 355H225" stroke="#55516f" />
        {card.lines.map((line, i) => (
          <text key={line} x="21" y={384 + i * 23} className="sa-note">
            {line}
          </text>
        ))}
        {pinned && (
          <text x="21" y="464" className="sa-small" fill={VIOLET}>
            Inspection pinned · Esc releases
          </text>
        )}
      </g>

      <text
        x="32"
        y="600"
        className="sa-label"
        fill={f.admitted ? GREEN : AMBER}
      >
        {!f.arrived
          ? "Incoming work shares the capacity already used by A."
          : !f.admitted
            ? "The red token check holds B outside, even though its KV pages fit."
            : f.finished
              ? "Request C can reuse these two prefix pages when it arrives."
              : f.paused
                ? "B is admitted. A’s missing next token is now the visible scheduling problem."
                : "A resumes on the same stream. Later requests inherit this resource state."}
      </text>
      <path d="M32 633H1048" stroke="#405b6c" />
      <text x="32" y="661" className="sa-small">
        Same request identities
      </text>
      {(["A", "B", "C", "D"] as const).map((key, i) => (
        <g key={key}>
          <circle
            cx={245 + i * 205}
            cy="657"
            r="12"
            fill="#152733"
            stroke={key === "A" ? BLUE : key === "B" ? AMBER : "#718d9d"}
          />
          <text
            x={245 + i * 205}
            y="662"
            textAnchor="middle"
            className="sa-small"
          >
            {key}
          </text>
          <text x={265 + i * 205} y="662" className="sa-small">
            {frame.requests[key].phase === "future"
              ? "not yet arrived"
              : frame.requests[key].phase}
          </text>
        </g>
      ))}
      <text x="32" y="688" className="sa-small">
        The clock paces this schematic. Token-step limits and KV reservations
        are different resources.
      </text>
    </svg>
  );

  function renderStream() {
    return (
      <Inspect
        {...props(
          "stream",
          "Inspect A’s output stream and the prefill interruption",
        )}
      >
        <rect
          className="sa-hit"
          x="28"
          y="80"
          width="732"
          height="116"
          rx="6"
        />
        <circle cx="55" cy="124" r="18" fill="#23384a" stroke={BLUE} />
        <text
          x="55"
          y="130"
          textAnchor="middle"
          className="sa-label"
          fill={BLUE}
        >
          A
        </text>
        <text x="86" y="116" className="sa-label">
          Request A
        </text>
        <text x="86" y="138" className="sa-small">
          answer stream
        </text>
        <path
          d="M193 124H218M300 124H343"
          stroke={f.paused ? RED : BLUE}
          strokeWidth="2"
        />
        <rect
          x="220"
          y="89"
          width="80"
          height="70"
          rx="5"
          fill={f.paused ? "#392e28" : "#203344"}
          stroke={f.paused ? AMBER : BLUE}
        />
        <text x="260" y="112" textAnchor="middle" className="sa-small">
          GPU step
        </text>
        {Array.from({ length: 8 }, (_, i) => (
          <rect
            key={i}
            x={231 + (i % 4) * 15}
            y={124 + Math.floor(i / 4) * 12}
            width="10"
            height="8"
            fill={f.paused ? AMBER : BLUE}
            fillOpacity={i < (f.paused ? 4 : 1) ? 1 : 0.22}
          />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <g
            key={i}
            transform={`translate(${i < f.delivered && !reduced ? (1 - f.tokenReveals[i]) * -8 : 0} 0)`}
            opacity={
              i < f.delivered && !reduced ? 0.4 + 0.6 * f.tokenReveals[i] : 1
            }
          >
            <rect
              x={350 + i * 49}
              y="105"
              width="39"
              height="43"
              rx="3"
              fill={i < f.delivered ? "#23384a" : "#122631"}
              stroke={
                i < f.delivered
                  ? BLUE
                  : f.paused && i === f.delivered
                    ? RED
                    : "#4c6676"
              }
              strokeWidth={f.paused && i === f.delivered ? 2 : 1}
              strokeDasharray={i >= f.delivered ? "3 4" : undefined}
            />
            <text
              x={369.5 + i * 49}
              y="132"
              textAnchor="middle"
              className="sa-value"
              fill={
                i < f.delivered
                  ? BLUE
                  : f.paused && i === f.delivered
                    ? RED
                    : "#839bab"
              }
            >
              {i + 1}
            </text>
          </g>
        ))}
        <text x="350" y="187" className="sa-small" fill={f.paused ? RED : BLUE}>
          {f.paused
            ? "A’s next token is waiting while B runs prefill"
            : "Filled blue cells have reached the user"}
        </text>
      </Inspect>
    );
  }
}
