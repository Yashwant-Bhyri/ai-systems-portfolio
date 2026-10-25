"use client";

import { useId } from "react";
import type {
  ServingFrame,
  ServingPageOwner,
  ServingReplicaId,
  ServingRoute,
} from "./serving-load-overview-model";
import {
  localityFrame,
  verificationFrame,
  type OverviewDraftCase,
} from "./serving-continuity-model";
import "./serving-continuity-scenes.css";

const BLUE = "#9cc5f5",
  GREEN = "#b8e986",
  AMBER = "#ffc267",
  RED = "#ff9185",
  VIOLET = "#c7a6ff";
const ownerColor = (owner: ServingPageOwner) =>
  owner === "A"
    ? BLUE
    : owner === "B-prefix" || owner === "B"
      ? AMBER
      : owner === "C"
        ? GREEN
        : owner === "D"
          ? VIOLET
          : "#637d8c";

function Consequence({
  title,
  value,
  unit,
  caption,
  rows,
  notes,
  color,
}: {
  title: string[];
  value: string;
  unit: string;
  caption: string;
  rows: string[][];
  notes: string[];
  color: string;
}) {
  return (
    <g className="sc-consequence" transform="translate(803 82)">
      <rect width="247" height="504" rx="8" fill="#1c2037" stroke="#776b9d" />
      {title.map((line, i) => (
        <text key={i} x="21" y={39 + i * 28} className="sc-card-title">
          {line}
        </text>
      ))}
      <text x="21" y="156" className="sc-metric" fill={color}>
        {value}
        <tspan className="sc-unit"> {unit}</tspan>
      </text>
      <text x="21" y="185" className="sc-small">
        {caption}
      </text>
      {rows.map(([label, result], i) => (
        <g key={label}>
          <text x="21" y={244 + i * 43} className="sc-small">
            {label}
          </text>
          <text x="225" y={244 + i * 43} textAnchor="end" className="sc-value">
            {result}
          </text>
        </g>
      ))}
      <path d="M21 381H225" stroke="#55516f" />
      {notes.map((line, i) => (
        <text key={i} x="21" y={412 + i * 25} className="sc-note">
          {line}
        </text>
      ))}
    </g>
  );
}

function IdentityStrip({ frame }: { frame: ServingFrame }) {
  return (
    <g>
      <path d="M32 643H1048" stroke="#405b6c" />
      {(["A", "B", "C", "D"] as const).map((key, i) => (
        <g key={key}>
          <circle
            cx={49 + i * 255}
            cy="671"
            r="12"
            fill="#152733"
            stroke={ownerColor(key)}
          />
          <text
            x={49 + i * 255}
            y="676"
            textAnchor="middle"
            className="sc-small"
          >
            {key}
          </text>
          <text x={70 + i * 255} y="676" className="sc-small">
            {frame.requests[key].phase === "future"
              ? "not yet arrived"
              : frame.requests[key].phase}
            {key === "B" && frame.prefixReady ? " · prefix retained" : ""}
          </text>
        </g>
      ))}
    </g>
  );
}

function Replica({
  frame,
  replica,
  onRoute,
  onPause,
}: {
  frame: ServingFrame;
  replica: ServingReplicaId;
  onRoute: (route: ServingRoute) => void;
  onPause: () => void;
}) {
  const f = localityFrame(frame),
    y = replica === "one" ? 174 : 383;
  const selected = f.selectedReplica === replica;
  return (
    <g
      className="sc-replica"
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={
        replica === "one"
          ? "Route C to replica 1: reuse two retained prefix pages and allocate one suffix page"
          : "Route C to replica 2: no local prefix, allocate three new pages"
      }
      onClick={() => onRoute(replica === "one" ? "warm" : "cold")}
      onFocus={onPause}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onRoute(replica === "one" ? "warm" : "cold");
        }
      }}
    >
      <rect
        className="sc-replica-hit"
        x="256"
        y={y}
        width="506"
        height="176"
        rx="6"
        fill="#10232e"
        stroke={selected ? GREEN : "#405b6c"}
      />
      <text x="274" y={y + 29} className="sc-label">
        Replica{" "}
        {replica === "one"
          ? "1 · B’s prefix is local"
          : "2 · no retained prefix"}
      </text>
      <text
        x="743"
        y={y + 29}
        className="sc-small"
        fill={selected ? GREEN : "#b4c8d4"}
        textAnchor="end"
      >
        {selected ? "C’s route" : "alternative"}
      </text>
      <rect
        x="274"
        y={y + 68}
        width="68"
        height="68"
        rx="4"
        fill="#172e3a"
        stroke={
          selected && f.admitted ? GREEN : replica === "one" ? BLUE : "#637d8c"
        }
      />
      <text x="308" y={y + 87} textAnchor="middle" className="sc-small">
        model
      </text>
      {Array.from({ length: 6 }, (_, i) => (
        <rect
          key={i}
          x={286 + (i % 3) * 16}
          y={y + 99 + Math.floor(i / 3) * 14}
          width="10"
          height="9"
          fill={selected && f.admitted ? GREEN : BLUE}
          opacity={(selected && f.admitted) || replica === "one" ? 0.8 : 0.2}
        />
      ))}
      {frame.pages[replica].map((owner, i) => (
        <g key={i}>
          <rect
            x={370 + i * 45}
            y={y + 92}
            width="35"
            height="39"
            rx="3"
            fill={owner ? "#24333a" : "#10232e"}
            stroke={ownerColor(owner)}
          />
          <text
            x={387.5 + i * 45}
            y={y + 118}
            textAnchor="middle"
            className="sc-value"
            fill={ownerColor(owner)}
          >
            {owner === "B-prefix" ? "B*" : (owner ?? "·")}
          </text>
          <text
            x={387.5 + i * 45}
            y={y + 144}
            textAnchor="middle"
            className="sc-index"
          >
            {i + 1}
          </text>
        </g>
      ))}
      {selected && (
        <g opacity={f.admitted ? 1 : 0.65}>
          {f.blockTable.map((page, i) => (
            <g key={i}>
              <rect
                x={370 + page * 45}
                y={y + 49}
                width="35"
                height="25"
                rx="2"
                fill="#1b302b"
                stroke={i < 2 ? AMBER : GREEN}
              />
              <text
                x={387.5 + page * 45}
                y={y + 67}
                textAnchor="middle"
                className="sc-small"
                fill={i < 2 ? AMBER : GREEN}
              >
                {["P1", "P2", "S"][i]}
              </text>
              <path
                d={`M${387.5 + page * 45} ${y + 74}v17`}
                stroke={f.warm && i < 2 ? AMBER : GREEN}
                strokeDasharray={f.admitted ? undefined : "3 3"}
                strokeWidth="2"
              />
            </g>
          ))}
        </g>
      )}
      <text x="274" y={y + 163} className="sc-small">
        {selected
          ? f.warm
            ? "P1 + P2 reference B* · S gets a new page"
            : "P1 + P2 + S each need a new page"
          : replica === "one"
            ? "A’s live state and B’s cached state stay here"
            : "Independent memory pool"}
      </text>
    </g>
  );
}

export function ServingLocalityScene({
  frame,
  reduced,
  onRoute,
  onPause,
}: {
  frame: ServingFrame;
  reduced: boolean;
  onRoute: (route: ServingRoute) => void;
  onPause: () => void;
}) {
  const id = useId(),
    f = localityFrame(frame);
  const routeY = f.warm ? 248 : 457;
  const leader = reduced ? 1 : f.consequenceReveal;
  const card = f.dDecision
    ? {
        title: f.dShortfall
          ? ["C reuses the prefix.", "D cannot fit here yet."]
          : ["C takes replica 2.", "D fits on replica 1."],
        value: `${f.dShortfall}`,
        unit: f.dShortfall === 1 ? "page" : "pages",
        caption: "short of D’s reservation",
        color: f.dShortfall ? RED : GREEN,
        rows: [
          ["D needs", "3 pages"],
          ["Free before D", `${f.freeAtDecision} pages`],
          ["D’s decision", f.dShortfall ? "wait" : "admit"],
        ],
        notes: f.warm
          ? [
              "C reuses two existing pages.",
              "D still needs three private pages.",
              "A must release memory first.",
            ]
          : [
              "C builds three pages on replica 2.",
              "D uses space left on replica 1.",
              "Both pools retain their own state.",
            ],
      }
    : f.admitted
      ? {
          title: f.warm
            ? ["Reuse two pages.", "Allocate only the suffix."]
            : ["No local prefix copy.", "Recompute the full input."],
          value: `${f.newPages}`,
          unit: f.newPages === 1 ? "page" : "pages",
          caption: "new KV pages allocated for C",
          color: f.warm ? GREEN : AMBER,
          rows: [
            ["Already reusable", `${f.reusedPages} pages`],
            [
              "New allocations",
              `${f.newPages} ${f.newPages === 1 ? "page" : "pages"}`,
            ],
            ["C’s logical blocks", "3"],
          ],
          notes: f.warm
            ? [
                "P1 and P2 keep B’s page identities.",
                "Only S creates new KV state.",
                "The full input is still attended to.",
              ]
            : [
                "The same prefix is in the prompt.",
                "Its KV state is not on replica 2.",
                "Matching text alone cannot reuse it.",
              ],
        }
      : {
          title: ["B’s prefix is local.", "Replica 2 has no copy."],
          value: `${f.retained}`,
          unit: "pages",
          caption: "ready on replica 1",
          color: AMBER,
          rows: [
            ["Replica 1", "2 cached"],
            ["Replica 2", "0 cached"],
            ["C", f.arrived ? "arrived" : "next request"],
          ],
          notes: [
            "P1 + P2: the repeated prefix.",
            "S: a new question’s suffix.",
            "Route C to inspect the difference.",
          ],
        };
  return (
    <svg
      className="sc-diagram"
      viewBox="0 0 1080 700"
      role="group"
      aria-labelledby={id}
      data-route={frame.route}
      data-d-decision={f.dDecision}
    >
      <title id={id}>
        Prefix locality, C’s page mapping and D’s admission consequence
      </title>
      <text x="32" y="35" className="sc-title">
        {f.dDecision
          ? "One placement changes another request’s admission"
          : "Reuse on replica 1, or build new KV state on replica 2"}
      </text>
      <g opacity={f.arrived ? 1 : 0.65}>
        <circle cx="55" cy="100" r="18" fill="#24382c" stroke={GREEN} />
        <text
          x="55"
          y="106"
          textAnchor="middle"
          className="sc-label"
          fill={GREEN}
        >
          C
        </text>
        <text x="86" y="94" className="sc-label">
          Request C
        </text>
        <text x="86" y="118" className="sc-small">
          Same document · new question
        </text>
        {["P1", "P2", "S"].map((label, i) => (
          <g key={label}>
            <rect
              x={370 + i * 60}
              y="78"
              width="48"
              height="42"
              rx="3"
              fill="#1b302b"
              stroke={i < 2 ? AMBER : GREEN}
            />
            <text
              x={394 + i * 60}
              y="105"
              textAnchor="middle"
              className="sc-label"
              fill={i < 2 ? AMBER : GREEN}
            >
              {label}
            </text>
          </g>
        ))}
        <text x="370" y="145" className="sc-small">
          C’s logical KV blocks · prefix + suffix
        </text>
      </g>
      <path
        d="M55 120V154H204V457H255M204 248H255"
        fill="none"
        stroke="#496573"
        strokeWidth="1.5"
      />
      <path
        d={`M55 120V154H204V${routeY}H255`}
        fill="none"
        stroke={GREEN}
        strokeWidth="2.5"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={1 - (reduced && f.arrived ? 1 : f.routeReveal)}
      />
      <Replica
        frame={frame}
        replica="one"
        onRoute={onRoute}
        onPause={onPause}
      />
      <Replica
        frame={frame}
        replica="two"
        onRoute={onRoute}
        onPause={onPause}
      />
      <g opacity={f.dArrived ? 1 : 0.65}>
        <circle cx="55" cy="598" r="18" fill="#292b3e" stroke={VIOLET} />
        <text
          x="55"
          y="604"
          textAnchor="middle"
          className="sc-label"
          fill={VIOLET}
        >
          D
        </text>
        <text x="86" y="591" className="sc-label">
          Request D
        </text>
        <text x="86" y="614" className="sc-small">
          Assigned to replica 1 · 3 new pages
        </text>
        {Array.from({ length: 3 }, (_, i) => (
          <g key={i}>
            <rect
              x={370 + i * 60}
              y="580"
              width="48"
              height="37"
              rx="3"
              fill="#1d2936"
              stroke={f.dDecision && i >= f.freeAtDecision ? RED : VIOLET}
              strokeWidth={f.dDecision && i >= f.freeAtDecision ? 2 : 1}
              strokeDasharray={f.dAdmitted ? undefined : "4 3"}
            />
            <text
              x={394 + i * 60}
              y="605"
              textAnchor="middle"
              className="sc-value"
              fill={f.dDecision && i >= f.freeAtDecision ? RED : VIOLET}
            >
              {f.dDecision && i >= f.freeAtDecision ? "×" : "D"}
            </text>
          </g>
        ))}
        <text
          x="560"
          y="603"
          className="sc-label"
          fill={!f.dDecision ? VIOLET : f.dShortfall ? RED : GREEN}
        >
          {f.dDecision
            ? f.dShortfall
              ? "wait for a page"
              : "reservation fits"
            : "next admission check"}
        </text>
      </g>
      <path
        className="sc-leader"
        d={
          f.dDecision
            ? `M${f.dShortfall ? 490 : 370} 623v8H538V623M538 628H779V231H814`
            : f.admitted
              ? f.warm
                ? "M595 307v17H630v-17M630 324H779V231H814"
                : "M370 516v17H495v-17M495 533H779V231H814"
              : "M505 307v17H585v-17M585 324H779V231H814"
        }
        fill="none"
        stroke={card.color}
        strokeWidth="2.2"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={1 - leader}
      />
      <Consequence {...card} />
      <IdentityStrip frame={frame} />
    </svg>
  );
}

export function ServingVerificationScene({
  frame,
  agreement,
  reduced,
}: {
  frame: ServingFrame;
  agreement: OverviewDraftCase;
  reduced: boolean;
}) {
  const id = useId(),
    f = verificationFrame(frame, agreement);
  const p = f.ready ? (reduced ? 1 : f.verifyReveal) : 0;
  const committed = f.delivered > 0;
  const card = !f.ready
    ? {
        title: ["Finish C’s input.", "Then propose output."],
        value: "0",
        unit: "/ 3",
        caption: "C’s output tokens delivered",
        color: AMBER,
        rows: [
          ["Input processing", "in progress"],
          ["Draft", "not started"],
          ["Output", "waiting"],
        ],
        notes: [
          "C first builds its prompt state.",
          "Drafting starts after prefill.",
          "The same request stays in view.",
        ],
      }
    : committed
      ? {
          title: ["Only committed tokens", "reach the answer."],
          value: `${f.delivered}`,
          unit: "/ 3",
          caption: "C’s output tokens delivered",
          color: GREEN,
          rows: [
            ["From draft", `${Math.min(f.delivered, f.retained)}`],
            ["From target", `${Math.max(0, f.delivered - f.retained)}`],
            ["Rejected proposals", `${f.discarded}`],
          ],
          notes:
            agreement === "accepted"
              ? [
                  "C1 + C2 survive verification.",
                  "The target replaces Cx with C3.",
                  "Proposals are not delivered early.",
                ]
              : [
                  "No draft token survives.",
                  "C1 comes from the target check.",
                  "Target decoding supplies C2 + C3.",
                ],
        }
      : f.checked
        ? {
            title: f.retained
              ? ["Keep the valid prefix.", "Replace the first error."]
              : ["The first token fails.", "Discard its whole suffix."],
            value: `${f.retained}`,
            unit: "/ 3",
            caption: "draft proposals retained",
            color: f.retained ? GREEN : RED,
            rows: [
              ["Draft proposals", "3"],
              ["Retained prefix", `${f.retained}`],
              ["Target correction", f.correction],
            ],
            notes: [
              "Later proposals depend on earlier ones.",
              "A failed prefix invalidates its suffix.",
              "The target supplies the correction.",
            ],
          }
        : {
            title: ["A draft is a proposal.", "The target must check it."],
            value: "0",
            unit: "/ 3",
            caption: "proposal tokens delivered",
            color: AMBER,
            rows: [
              ["Draft proposals", "3"],
              ["Target check", p > 0 ? "in progress" : "pending"],
              ["Output", "waiting"],
            ],
            notes: [
              "Keep draft work separate from output.",
              "Only a valid prefix can be accepted.",
            ],
          };
  return (
    <svg
      className="sc-diagram"
      viewBox="0 0 1080 700"
      role="group"
      aria-labelledby={id}
      data-agreement={agreement}
      data-committed={f.delivered}
    >
      <title id={id}>
        C’s draft proposals, causal target check and committed output
      </title>
      <text x="32" y="35" className="sc-title">
        {!f.ready
          ? "C finishes input processing before proposing an answer"
          : f.checked
            ? "A rejected proposal never enters C’s answer"
            : "The same request now proposes its next output tokens"}
      </text>
      <circle cx="55" cy="91" r="18" fill="#24382c" stroke={GREEN} />
      <text x="55" y="97" textAnchor="middle" className="sc-label" fill={GREEN}>
        C
      </text>
      <text x="86" y="87" className="sc-label">
        Request C
      </text>
      <text x="86" y="110" className="sc-small">
        same running request
      </text>
      <text x="32" y="184" className="sc-label">
        Draft proposals
      </text>
      <text x="32" y="207" className="sc-small">
        not yet output
      </text>
      <text x="32" y="330" className="sc-label">
        Target verification
      </text>
      <text x="32" y="353" className="sc-small">
        accept a valid prefix
      </text>
      <text x="32" y="491" className="sc-label">
        Committed answer
      </text>
      <text x="32" y="514" className="sc-small">
        visible to the user
      </text>
      {f.proposals.map((token, i) => {
        const x = 270 + i * 160,
          rejected = f.checked && i >= f.retained;
        const delivered = i < f.delivered,
          origin = i < f.retained ? GREEN : AMBER;
        return (
          <g key={i}>
            <rect
              x={x}
              y="150"
              width="100"
              height="65"
              rx="4"
              fill="#1d2d37"
              stroke={f.checked ? (rejected ? RED : GREEN) : VIOLET}
              strokeWidth={f.checked ? 2 : 1}
            />
            <text
              x={x + 50}
              y="190"
              textAnchor="middle"
              className="sc-token"
              fill={f.checked ? (rejected ? RED : GREEN) : VIOLET}
            >
              {f.ready ? token : "·"}
            </text>
            {rejected && (
              <path d={`M${x + 8} 207l84 -49`} stroke={RED} strokeWidth="2" />
            )}
            <path
              d={`M${x + 50} 216v78`}
              stroke={f.checked && rejected ? RED : VIOLET}
              strokeWidth="2"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - p}
            />
            <rect
              x={x}
              y="295"
              width="100"
              height="62"
              rx="4"
              fill="#192b36"
              stroke={f.checked && f.checks[i] ? BLUE : "#607989"}
            />
            <text
              x={x + 50}
              y="334"
              textAnchor="middle"
              className="sc-token"
              fill={f.checks[i] ? BLUE : "#b4c5d0"}
            >
              {p > (i + 1) / 4 ? (f.checks[i] ?? "—") : "?"}
            </text>
            <text
              x={x + 50}
              y="385"
              textAnchor="middle"
              className="sc-small"
              fill={f.checked ? (rejected ? RED : GREEN) : "#bfd0dc"}
            >
              {f.checked
                ? i < f.retained
                  ? "accepted"
                  : i === f.retained
                    ? "target correction"
                    : "suffix discarded"
                : "await verification"}
            </text>
            {(agreement === "accepted" || i === 0) && (
              <path
                d={`M${x + 50} 400v62`}
                stroke={origin}
                strokeDasharray={delivered ? undefined : "4 4"}
                opacity={f.checked ? 1 : 0.45}
              />
            )}
            <rect
              x={x}
              y="463"
              width="100"
              height="65"
              rx="4"
              fill={delivered ? "#22372d" : "#122631"}
              stroke={delivered ? origin : "#607989"}
              strokeDasharray={delivered ? undefined : "4 4"}
              strokeWidth={delivered ? 2 : 1}
            />
            <text
              x={x + 50}
              y="504"
              textAnchor="middle"
              className="sc-token"
              fill={delivered ? origin : "#b4c5d0"}
            >
              {delivered ? `C${i + 1}` : "·"}
            </text>
            {delivered && (
              <text
                x={x + 50}
                y="554"
                textAnchor="middle"
                className="sc-small"
                fill={origin}
              >
                {i < f.retained ? "verified draft" : "target output"}
              </text>
            )}
          </g>
        );
      })}
      {f.checked && agreement === "loss" && (
        <path
          d="M371 495H428M531 495H588"
          stroke={AMBER}
          strokeWidth="2"
          strokeDasharray={f.delivered === 3 ? undefined : "4 4"}
        />
      )}
      <text
        x="32"
        y="610"
        className="sc-label"
        fill={f.checked ? GREEN : AMBER}
      >
        {!f.ready
          ? "Prefill builds C’s context. Empty output cells are not delivered tokens."
          : f.checked
            ? agreement === "accepted"
              ? "Two accepted proposals + one target correction → C1 · C2 · C3"
              : "No accepted proposals → target decoding produces C1 · C2 · C3"
            : "Three draft positions consume work before any token is committed."}
      </text>
      <path
        className="sc-leader"
        d={
          committed
            ? `M270 564v13H${370 + (f.delivered - 1) * 160}v-13M${370 + (f.delivered - 1) * 160} 577H779V231H814`
            : f.checked
              ? `M270 223v14H${f.retained ? 530 : 690}v-14M${f.retained ? 530 : 690} 237H779V231H814`
              : "M270 223v14H690v-14M690 237H779V231H814"
        }
        fill="none"
        stroke={card.color}
        strokeWidth="2.2"
      />
      <Consequence {...card} />
      <IdentityStrip frame={frame} />
    </svg>
  );
}
