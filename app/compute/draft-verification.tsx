"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useStudyPlayback } from "./use-study-playback";
import { useFilmTime } from "./use-film-time";
import {
  draftStudy,
  draftFrame,
  draftRoundMoment,
  DRAFT_DURATION,
  DRAFT_LABELS,
  DRAFT_MOMENTS,
  type DraftMode,
  type DraftStudy,
} from "./draft-verification-model";
import "./draft-verification.css";

const BLUE = "#9cc5f5",
  GREEN = "#b8e986",
  RED = "#ff9185",
  AMBER = "#ffc267",
  VIOLET = "#c7a6ff";
type Detail = "draft" | "verify" | "commit" | "cost" | null;
const DETAILS = {
  draft: [
    "A proposal is not an answer",
    "The small draft path proposes up to four token units in sequence. None reaches the user before target verification. Changing draft agreement changes these proposals, not the target answer.",
  ],
  verify: [
    "One call, several causal positions",
    "The target evaluates the draft prefix in one causal forward pass. Accept only consecutive greedy matches. At the first mismatch, use the target's token; discard every later proposal because its conditioning prefix is no longer valid.",
  ],
  commit: [
    "Only verified tokens reach the user",
    "The accepted prefix plus one target correction is committed together. If every proposal matches and output remains, the same pass supplies one additional target token. Decoding resumes from that exact committed prefix.",
  ],
  cost: [
    "Calls are not GPU-seconds",
    "Fewer serial target calls can help, but each verifies several positions and drafting adds work. With zero acceptance, each pass commits only its correction: the call count stays unchanged and the extra work remains. No hardware time or serving-load benefit is inferred.",
  ],
} as const;
const HEADINGS = [
  "Draft the next tokens",
  "Verify the proposed continuation",
  "Stop at the first mismatch",
  "Commit only the verified prefix",
  "Compare target-model calls",
  "Account for the extra work",
];

function RoundAccounting({
  study,
  cost,
  onRound,
}: {
  study: DraftStudy;
  cost: boolean;
  onRound: (index: number) => void;
}) {
  const columns = study.rounds.length > 6 ? 6 : study.rounds.length;
  const width = 704 / columns;
  return (
    <g>
      <text x="28" y="27" className="dv-section-title">
        Baseline: one target call per output unit
      </text>
      {study.target.map((token, i) => (
        <g key={i} opacity={cost ? 0.38 : 1}>
          <rect
            x={28 + i * 59}
            y="45"
            width="47"
            height="41"
            rx="3"
            fill="#182e3e"
            stroke={BLUE}
          />
          <text
            x={51.5 + i * 59}
            y="70"
            textAnchor="middle"
            className="dv-output"
            fill={BLUE}
          >
            {token}
          </text>
          <text
            x={51.5 + i * 59}
            y="102"
            textAnchor="middle"
            className="dv-small"
          >
            {i + 1}
          </text>
          {i < 11 && (
            <path
              d={`M${77 + i * 59} 65h8m-3-3 3 3-3 3`}
              stroke={BLUE}
              fill="none"
            />
          )}
        </g>
      ))}
      <text x="28" y="135" className="dv-section-title">
        Draft / verify: {study.targetCalls} target calls
      </text>
      {study.rounds.map((r, i) => {
        const x = 28 + (i % columns) * width,
          y = 154 + Math.floor(i / columns) * 97;
        const cell = Math.min(35, (width - 23) / r.evaluated),
          left = x + 10;
        return (
          <g
            key={r.index}
            className="dv-hotspot"
            role="button"
            tabIndex={0}
            aria-label={`Inspect verification round ${i + 1}: ${r.committed.length} output units, ${r.discardedPositions} discarded evaluations`}
            onClick={() => onRound(i)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onRound(i);
              }
            }}
          >
            <rect
              x={x}
              y={y}
              width={width - 9}
              height="87"
              rx="4"
              fill="#16232f"
              stroke={cost ? AMBER : VIOLET}
            />
            <text x={left} y={y + 18} className="dv-small">
              Round {i + 1}
            </text>
            {Array.from({ length: r.evaluated }, (_, j) => {
              const discarded = j >= r.committed.length;
              return (
                <g key={j}>
                  <rect
                    x={left + j * cell}
                    y={y + 29}
                    width={cell - 4}
                    height="23"
                    rx="2"
                    fill={
                      discarded
                        ? "#3b2329"
                        : j < r.accepted
                          ? "#243b2e"
                          : "#3a3024"
                    }
                    stroke={discarded ? RED : j < r.accepted ? GREEN : AMBER}
                    opacity={cost && discarded ? 1 : 0.85}
                  />
                  <text
                    x={left + j * cell + (cell - 4) / 2}
                    y={y + 45}
                    textAnchor="middle"
                    className="dv-small"
                    fill={discarded ? RED : j < r.accepted ? GREEN : AMBER}
                  >
                    {discarded ? "×" : j < r.accepted ? "✓" : "+"}
                  </text>
                </g>
              );
            })}
            <text x={left} y={y + 66} className="dv-small">
              {r.committed.length} committed
            </text>
            <text
              x={left}
              y={y + 80}
              className="dv-small"
              fill={r.discardedPositions ? RED : undefined}
            >
              {r.discardedPositions} discarded
            </text>
          </g>
        );
      })}
      <g transform={`translate(28 ${study.rounds.length > 6 ? 356 : 280})`}>
        <rect width="8" height="8" fill={GREEN} />
        <text x="15" y="8" className="dv-small">
          accepted draft
        </text>
        <rect x="133" width="8" height="8" fill={AMBER} />
        <text x="148" y="8" className="dv-small">
          target correction / bonus
        </text>
        <path d="M355 0l8 8m0-8-8 8" stroke={RED} />
        <text x="371" y="8" className="dv-small">
          discarded evaluation
        </text>
      </g>
      {study.rounds.length <= 6 && (
        <text x="28" y="326" className="dv-context" fill={cost ? AMBER : GREEN}>
          {study.targetPositions} target positions evaluated →{" "}
          {study.target.length} output units committed
        </text>
      )}
    </g>
  );
}

function VerificationDiagram({
  study,
  frame,
  onInspect,
  onRound,
}: {
  study: DraftStudy;
  frame: ReturnType<typeof draftFrame>;
  onInspect: (d: Detail) => void;
  onRound: (index: number) => void;
}) {
  const id = useId();
  const r = frame.round,
    final = frame.time >= 27000;
  const hook = (d: Exclude<Detail, null>, label: string) => ({
    role: "button",
    tabIndex: 0,
    "aria-label": label,
    className: "dv-hotspot",
    onClick: (event: React.MouseEvent<SVGGElement>) => {
      event.currentTarget.focus();
      onInspect(d);
    },
    onKeyDown: (e: React.KeyboardEvent<SVGGElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onInspect(d);
      }
    },
  });
  const outX = (i: number) => 34 + i * 58;
  return (
    <svg
      className="dv-diagram"
      viewBox="0 0 760 558"
      role="group"
      aria-labelledby={id}
    >
      <title
        id={id}
      >{`Greedy draft verification, round ${r.index + 1}. ${frame.committed} of ${study.target.length} output units committed. ${frame.verdict ? `${r.accepted} draft units accepted; ${r.rejected} rejected. ` : "Verification pending. "}Teaching token units, not a checkpoint tokenizer or hardware trace.`}</title>
      <g
        opacity={final ? 0 : 1}
        className="dv-focus-layer"
        aria-hidden={final}
        style={{ visibility: final ? "hidden" : "visible" }}
      >
        <text x="28" y="28" className="dv-label">
          COMMITTED CONTEXT
        </text>
        <path d="M28 44H730" stroke="#385364" />
        <text x="28" y="67" className="dv-context">
          {r.start
            ? study.target.slice(0, r.start).join(" ")
            : "Summarize the revised liability limit."}
        </text>
        <text x="730" y="27" textAnchor="end" className="dv-label">
          Round {r.index + 1} / {study.rounds.length}
        </text>
        <g {...hook("draft", "Inspect draft proposals")}>
          <path
            d="M32 111h118l13 13v47l-13 13H32l-10-13v-47Z"
            fill="#17283a"
            stroke={VIOLET}
          />
          {Array.from({ length: 18 }, (_, i) => (
            <rect
              key={i}
              x={39 + (i % 6) * 18}
              y={122 + Math.floor(i / 6) * 15}
              width="10"
              height="8"
              fill={VIOLET}
              opacity={0.15 + (i / 18 < frame.draft ? 0.6 : 0)}
            />
          ))}
          <text x="91" y="206" textAnchor="middle" className="dv-label">
            DRAFT MODEL
          </text>
        </g>
        <path d="M166 148H204m-6-5 6 5-6 5" fill="none" stroke={VIOLET} />
        <text x="214" y="109" className="dv-label">
          Proposed continuation
        </text>
        {Array.from({ length: study.length }, (_, i) => {
          const present = i < frame.proposed,
            exists = i < r.proposal.length,
            rejected = frame.verdict && i >= r.accepted;
          return (
            <g
              key={i}
              transform={`translate(${214 + i * 78} 124)`}
              opacity={exists ? 1 : 0.2}
            >
              <rect
                width="68"
                height="48"
                rx="4"
                fill={present ? (rejected ? "#3a2329" : "#27243d") : "#11212e"}
                stroke={rejected ? RED : present ? VIOLET : "#425164"}
              />
              <text
                x="34"
                y="29"
                textAnchor="middle"
                className="dv-token"
                fill={rejected ? RED : VIOLET}
              >
                {present ? r.proposal[i] : "·"}
              </text>
              {frame.verdict && exists && (
                <text
                  x="34"
                  y="67"
                  textAnchor="middle"
                  className="dv-small"
                  fill={rejected ? RED : GREEN}
                >
                  {i < r.accepted
                    ? "✓ accept"
                    : i === r.accepted
                      ? "× mismatch"
                      : "discard"}
                </text>
              )}
            </g>
          );
        })}
        {r.proposal.map((_, i) => (
          <path
            key={`verify-wire-${i}`}
            d={`M${248 + i * 78} 194v17m-4-5 4 5 4-5`}
            fill="none"
            stroke={frame.verify > 0 ? BLUE : "#385364"}
            strokeWidth="1.5"
            opacity={frame.verify > 0 ? 1 : 0.35}
          />
        ))}
        <g {...hook("verify", "Inspect causal target verification")}>
          <path
            d="M28 226h122l13 13v69l-13 13H28l-6-13v-69Z"
            fill="#122735"
            stroke={BLUE}
          />
          {Array.from({ length: 32 }, (_, i) => (
            <rect
              key={i}
              x={37 + (i % 8) * 14}
              y={242 + Math.floor(i / 8) * 15}
              width="8"
              height="9"
              fill={BLUE}
              opacity={0.12 + frame.verify * 0.68}
            />
          ))}
          <text x="92" y="341" textAnchor="middle" className="dv-label">
            TARGET MODEL
          </text>
          <path
            d="M166 273H204"
            fill="none"
            stroke={frame.verify > 0 ? BLUE : "#385364"}
            strokeWidth="2"
          />
          <rect
            x="204"
            y="215"
            width="430"
            height="111"
            rx="5"
            fill="#10212d"
            stroke={frame.verify > 0 ? BLUE : "#385364"}
          />
          <text x="220" y="237" className="dv-label">
            ONE CAUSAL FORWARD PASS
          </text>
          {Array.from({ length: r.evaluated }, (_, i) => {
            const valid = i <= r.accepted;
            const correction = !!r.correction && i === r.accepted;
            const bonus = !!r.bonus && i === r.accepted;
            const tint = correction || bonus ? AMBER : valid ? GREEN : RED;
            return (
              <g key={i} transform={`translate(${220 + i * 78} 253)`}>
                <rect
                  width="62"
                  height="39"
                  rx="3"
                  fill={frame.verdict && valid ? "#20312d" : "#13232f"}
                  stroke={frame.verdict ? tint : BLUE}
                  opacity={0.2 + frame.verify * 0.8}
                />
                <text
                  x="31"
                  y="24"
                  textAnchor="middle"
                  className="dv-token"
                  fill={tint}
                >
                  {frame.verdict
                    ? valid
                      ? study.target[r.start + i]
                      : "×"
                    : "·"}
                </text>
                {frame.verdict && (
                  <text
                    x="31"
                    y="58"
                    textAnchor="middle"
                    className="dv-small"
                    fill={tint}
                  >
                    {correction
                      ? "correct"
                      : bonus
                        ? "+1 target"
                        : valid
                          ? "match"
                          : "invalid"}
                  </text>
                )}
              </g>
            );
          })}
        </g>
        {frame.verdict && (
          <g>
            <path
              d={`M${214 + (r.rejected ? r.accepted : 0) * 78} 204H${214 + r.proposal.length * 78 - 10}`}
              stroke={r.rejected ? RED : GREEN}
              strokeWidth="3"
            />
            <text
              x="650"
              y="252"
              className="dv-small"
              fill={r.rejected ? RED : GREEN}
            >
              {r.rejected ? "First mismatch" : "All match"}
            </text>
            <text x="650" y="272" className="dv-small">
              {r.rejected
                ? "ends acceptance"
                : r.bonus
                  ? "+ target bonus"
                  : "output complete"}
            </text>
          </g>
        )}
      </g>
      {final && (
        <g className="dv-accounting-reveal">
          <RoundAccounting
            study={study}
            cost={frame.phase === "cost"}
            onRound={onRound}
          />
        </g>
      )}
      <g {...hook("commit", "Inspect the committed answer stream")}>
        <text x="28" y="380" className="dv-section-title">
          Answer delivered to the user
        </text>
        <text
          x="730"
          y="380"
          textAnchor="end"
          className="dv-label"
          fill={GREEN}
        >
          {frame.committed} / 12 units
        </text>
        {study.target.map((token, i) => {
          const committed = i < frame.committed,
            old = i < r.start;
          const corrected = study.outputOrigins[i] !== "accepted";
          return (
            <g key={i}>
              {committed && (
                <title>{`${token}: ${study.outputOrigins[i] === "accepted" ? "accepted draft" : `target ${study.outputOrigins[i]}`}`}</title>
              )}
              <rect
                x={outX(i)}
                y="400"
                width="51"
                height="38"
                rx="3"
                fill={committed ? (old ? "#152c31" : "#23392d") : "#10212c"}
                stroke={committed ? (corrected ? AMBER : GREEN) : "#385364"}
                opacity={committed ? 1 : 0.6}
              />
              <text
                x={outX(i) + 25.5}
                y="424"
                textAnchor="middle"
                className="dv-output"
                fill={committed ? (corrected ? AMBER : GREEN) : "#829aac"}
              >
                {committed ? token : "·"}
              </text>
              <text
                x={outX(i) + 25.5}
                y="455"
                textAnchor="middle"
                className="dv-small"
              >
                {i + 1}
              </text>
            </g>
          );
        })}
        {!final &&
          frame.commit > 0 &&
          frame.commit < 1 &&
          r.committed.map((token, i) => {
            const p = 1 - Math.pow(1 - frame.commit, 3),
              x = 220 + i * 78 + (outX(r.start + i) - (220 + i * 78)) * p,
              y = 253 + (400 - 253) * p;
            return (
              <g key={i} transform={`translate(${x} ${y})`}>
                <rect
                  width="51"
                  height="38"
                  rx="3"
                  fill="#23392d"
                  stroke={i === r.accepted ? AMBER : GREEN}
                />
                <text
                  x="25.5"
                  y="24"
                  textAnchor="middle"
                  className="dv-output"
                  fill={i === r.accepted ? AMBER : GREEN}
                >
                  {token}
                </text>
              </g>
            );
          })}
      </g>
      <g
        opacity={final ? 1 : 0.35}
        {...hook(
          "cost",
          "Inspect target-call and verification-work accounting",
        )}
      >
        <text x="28" y="489" className="dv-label">
          TARGET CALLS FOR THE SAME ANSWER
        </text>
        <text x="28" y="516" className="dv-small">
          Baseline
        </text>
        <text x="28" y="545" className="dv-small">
          Draft + verify
        </text>
        {study.target.map((_, i) => (
          <g key={i}>
            <rect
              x={153 + i * 43}
              y="500"
              width="33"
              height="16"
              rx="2"
              fill={BLUE}
              opacity=".7"
            />
            <rect
              x={153 + i * 43}
              y="530"
              width="33"
              height="16"
              rx="2"
              fill={i < study.targetCalls ? VIOLET : "none"}
              stroke={i < study.targetCalls ? VIOLET : "#51616e"}
              strokeDasharray={i < study.targetCalls ? undefined : "3 3"}
              opacity={i < frame.calls || final ? 1 : 0.2}
            />
          </g>
        ))}
        {final && study.callsAvoided > 0 && (
          <path
            data-dv-source
            d={`M${153 + study.targetCalls * 43} 525H${153 + 11 * 43 + 33}m0-4v8`}
            fill="none"
            stroke={VIOLET}
            strokeWidth="2"
          />
        )}
        <text x="731" y="514" textAnchor="end" className="dv-label">
          12
        </text>
        <text
          x="731"
          y="543"
          textAnchor="end"
          className="dv-label"
          fill={VIOLET}
        >
          {final ? study.targetCalls : frame.calls}
        </text>
      </g>
    </svg>
  );
}

export function DraftVerification({ active = true }: { active?: boolean }) {
  const [mode, setMode] = useState<DraftMode>("mixed");
  const [length, setLength] = useState<2 | 4>(4);
  const [detail, setDetail] = useState<Detail>(null);
  const inspectionOrigin = useRef<Element | null>(null);
  const study = useMemo(() => draftStudy(mode, length), [mode, length]);
  const { ref: playbackRef, ...playback } = useStudyPlayback(1, 0, {
    finite: true,
    interval: DRAFT_DURATION,
    enabled: active,
  });
  const film = useFilmTime(
    playback.readTime,
    playback.running,
    playback.reduced,
    DRAFT_DURATION,
    playback.seek,
  );
  const frame = draftFrame(film.time, study),
    r = frame.round,
    final = frame.time >= 27000,
    continuing = frame.time >= 17000 && !final;
  const stage = useRef<HTMLDivElement>(null);
  const [link, setLink] = useState<{
    x: number;
    y: number;
    tx: number;
    ty: number;
  } | null>(null);
  const seek = (time: number) => {
    setDetail(null);
    film.seek(time);
  };
  const inspect = (d: Detail) => {
    inspectionOrigin.current = document.activeElement;
    film.seek(film.time);
    setDetail(d);
  };
  const releaseInspection = () => {
    setDetail(null);
    requestAnimationFrame(() => {
      const origin = inspectionOrigin.current;
      if (origin instanceof HTMLElement || origin instanceof SVGElement)
        origin.focus({ preventScroll: true });
    });
  };
  useEffect(() => {
    if (!detail) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setDetail(null);
      const origin = inspectionOrigin.current;
      if (origin instanceof HTMLElement || origin instanceof SVGElement)
        origin.focus({ preventScroll: true });
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [detail]);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const update = () => {
      const b = el.getBoundingClientRect(),
        s = el.querySelector("[data-dv-source]")?.getBoundingClientRect(),
        t = el.querySelector("[data-dv-target]")?.getBoundingClientRect(),
        scroll = el.querySelector(".dv-scroll")?.getBoundingClientRect();
      setLink(
        s && t && scroll && t.left >= scroll.right && s.right <= scroll.right
          ? {
              x: s.right - b.left,
              y: s.top - b.top + s.height / 2,
              tx: t.left - b.left - 10,
              ty: t.top - b.top + t.height / 2,
            }
          : null,
      );
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    const card = el.querySelector(".dv-card");
    if (card) ro.observe(card);
    const scroller = el.querySelector(".dv-scroll");
    scroller?.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      scroller?.removeEventListener("scroll", update);
    };
  }, [final, detail, mode, length, frame.beat]);
  const explanation = detail ? DETAILS[detail] : null;
  const heading = continuing
    ? "Continue from the verified prefix"
    : frame.beat === 2 && !r.rejected
      ? "Accept the agreeing draft"
      : HEADINGS[frame.beat];
  return (
    <section
      className="dv-root"
      ref={playbackRef}
      data-time={film.time}
      data-playing={playback.running}
      data-mode={mode}
      aria-label="Speculative draft verification investigation"
    >
      <header className="dv-heading">
        <div>
          <h3>Speculative decoding</h3>
          <p>{heading}</p>
        </div>
        <span>Illustrative greedy trace · one request</span>
      </header>
      <div className="dv-controls">
        <div role="group" aria-label="Draft agreement">
          <span>Draft agreement</span>
          {(
            [
              ["mixed", "Partial match"],
              ["aligned", "All match"],
              ["miss", "No match"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => {
                setMode(value);
                seek(0);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Draft length">
          <span>Proposal length</span>
          {([2, 4] as const).map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={length === n}
              onClick={() => {
                setLength(n);
                seek(0);
              }}
            >
              {n} units
            </button>
          ))}
        </div>
      </div>
      <p className="dv-scroll-hint">
        Scroll the mechanism sideways to follow each token →
      </p>
      <div className="dv-stage" ref={stage}>
        <div
          className="dv-scroll"
          tabIndex={0}
          role="region"
          aria-label="Draft verification diagram; scroll sideways on narrow screens"
        >
          <VerificationDiagram
            study={study}
            frame={frame}
            onInspect={inspect}
            onRound={(index) => seek(draftRoundMoment(index, study))}
          />
        </div>
        {final && !detail && link && study.callsAvoided > 0 && (
          <svg className="dv-link" aria-hidden="true">
            <path
              d={`M${link.x} ${link.y}H${link.tx - 12}Q${link.tx} ${link.y} ${link.tx} ${link.y - 12}V${link.ty + 12}Q${link.tx} ${link.ty} ${link.tx + 8} ${link.ty}`}
            />
            <circle cx={link.tx + 8} cy={link.ty} r="3" />
          </svg>
        )}
        <aside
          className="dv-card"
          aria-label="Current verification consequence"
        >
          {explanation ? (
            <>
              <span>Inspection paused</span>
              <h4>{explanation[0]}</h4>
              <p>{explanation[1]}</p>
              <button type="button" onClick={releaseInspection}>
                Return to the comparison
              </button>
            </>
          ) : (
            <>
              <span>
                {final
                  ? "Same 12-unit target answer"
                  : `Round ${r.index + 1} · target controls the answer`}
              </span>
              <h4>
                {final
                  ? study.callsAvoided
                    ? "Fewer target calls. Extra verification work."
                    : "No calls saved. Draft work still paid."
                  : continuing
                    ? "Verify each continuation before extending the answer."
                    : frame.beat === 0
                      ? "Draft first. Send nothing yet."
                      : frame.beat === 1
                        ? "Check every position in one target pass."
                        : frame.beat === 2
                          ? r.rejected
                            ? "Keep the matching prefix. Discard the rest."
                            : "Every proposal matches the target."
                          : "The user receives only the committed tokens."}
              </h4>
              {final ? (
                <>
                  <div className="dv-delta" data-dv-target>
                    <strong>Δ {study.callsAvoided}</strong>
                    <span>target calls avoided</span>
                  </div>
                  <div className="dv-ledger" data-focus={frame.phase}>
                    <div>
                      <span>Target calls</span>
                      <b>12 → {study.targetCalls}</b>
                    </div>
                    <div>
                      <span>Target positions evaluated</span>
                      <b>12 → {study.targetPositions}</b>
                    </div>
                    <div>
                      <span>Additional draft units</span>
                      <b>+{study.draftTokens}</b>
                    </div>
                  </div>
                  <p className="dv-tradeoff">
                    {study.callsAvoided
                      ? "The saved calls must outweigh drafting, wider verification and scheduling overhead."
                      : "Each pass corrects just one unit. This draft adds work without reducing serial target calls."}
                  </p>
                </>
              ) : (
                <>
                  <div className="dv-round-math">
                    <span>Committed this round</span>
                    <strong>
                      {frame.verdict ? r.accepted : "…"}
                      <i> accepted</i>
                    </strong>
                    <strong>
                      +{" "}
                      {frame.verdict
                        ? Number(!!(r.correction ?? r.bonus))
                        : "…"}
                      <i>
                        {" "}
                        {r.correction ? "target correction" : "target bonus"}
                      </i>
                    </strong>
                    <hr />
                    <strong>
                      = {frame.commit === 1 ? r.committed.length : "…"}
                      <i> sent to the user</i>
                    </strong>
                  </div>
                  <p className="dv-tradeoff">
                    {continuing
                      ? "Each round starts from the last committed output. Unverified proposals never enter the answer."
                      : frame.verdict
                        ? r.rejected
                          ? `${r.rejected} proposed units discarded; they never enter the answer.`
                          : r.bonus
                            ? "All proposals agree, so the target also supplies the next unit."
                            : "The requested output ends here; no extra unit is emitted."
                        : "Proposals stay provisional until target verification finishes."}
                  </p>
                </>
              )}
            </>
          )}
        </aside>
      </div>
      <nav className="dv-rounds" aria-label="Inspect verification rounds">
        <span>Inspect a round</span>
        {study.rounds.map((round) => (
          <button
            key={round.index}
            type="button"
            aria-pressed={r.index === round.index}
            onClick={() => seek(draftRoundMoment(round.index, study))}
          >
            R{round.index + 1}
            <small>{round.committed.length} committed</small>
          </button>
        ))}
      </nav>
      <div className="dv-transport">
        <button
          type="button"
          disabled={playback.reduced}
          onClick={() => {
            setDetail(null);
            if (film.time >= DRAFT_DURATION) {
              film.seek(0);
              playback.replay();
            } else playback.toggle();
          }}
          aria-label={
            playback.running
              ? "Pause draft verification"
              : "Play draft verification"
          }
        >
          {playback.running ? "Ⅱ" : "▷"}
        </button>
        <input
          type="range"
          min="0"
          max={DRAFT_DURATION}
          step="10"
          value={film.time}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Scrub draft verification"
          aria-valuetext={`${(film.time / 1000).toFixed(1)} seconds: ${heading}`}
        />
        <time>{(film.time / 1000).toFixed(1)} / 38s</time>
      </div>
      <nav className="dv-moments" aria-label="Draft verification moments">
        {DRAFT_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            aria-current={frame.beat === i ? "step" : undefined}
            onClick={() => seek(DRAFT_MOMENTS[i])}
          >
            {label}
          </button>
        ))}
      </nav>
      <details
        className="dv-method"
        onToggle={(e) => {
          if (e.currentTarget.open) film.seek(film.time);
        }}
      >
        <summary>Inspect the greedy trace and its limits</summary>
        <p>
          This is a deterministic greedy teaching model with twelve word-sized
          token units, not Qwen tokenizer output or measured GPU performance.
          Each target call checks up to k proposals plus a next position, capped
          at the remaining output length. Only the consecutive matching prefix
          and a target correction (or bonus when all match) commit. Positions
          after a mismatch were evaluated under a rejected prefix and are
          discarded. Draft agreement is a controlled fixture, not a trained
          drafter or acceptance benchmark.
        </p>
        <p>
          The 38-second film is authored pacing. Call counts, evaluated
          positions and draft units are distinct quantities, not equal-cost
          operations. No latency, GPU cost, concurrent batch throughput or
          goodput is computed. Stochastic sampling needs the proper
          rejection/correction algorithm; this greedy trace does not implement
          it.
        </p>
        <p>
          <a
            href="https://proceedings.mlr.press/v202/leviathan23a.html"
            target="_blank"
            rel="noreferrer"
          >
            Speculative decoding: original paper ↗
          </a>{" "}
          ·{" "}
          <a
            href="https://docs.vllm.ai/en/latest/features/speculative_decoding/"
            target="_blank"
            rel="noreferrer"
          >
            vLLM: workload-dependent performance ↗
          </a>
        </p>
        <button
          type="button"
          onClick={() => {
            const url = URL.createObjectURL(
              new Blob(
                [JSON.stringify({ study, filmMs: film.time, frame }, null, 2)],
                { type: "application/json" },
              ),
            );
            const a = document.createElement("a");
            a.href = url;
            a.download = "greedy-draft-verification.json";
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}
        >
          Download this trace as JSON
        </button>
      </details>
    </section>
  );
}
