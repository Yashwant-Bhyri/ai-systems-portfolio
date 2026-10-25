"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Hotspot, type Inspectors } from "./lab-story-scenes";
import { prefixComparisonFrame, type prefixStudy } from "./prefix-study-math";

const BLUE = "#9cc5f5",
  GREEN = "#b8e986",
  RED = "#ff9185",
  VIOLET = "#c7a6ff";
const fmt = (n: number, d = 2) =>
  n.toLocaleString("en-US", { maximumFractionDigits: d });
type Study = ReturnType<typeof prefixStudy>;

export function PrefixComparison({
  study,
  milliseconds,
  inspect,
}: {
  study: Study;
  milliseconds: number;
  inspect: Inspectors;
}) {
  const id = useId();
  const frame = prefixComparisonFrame(milliseconds, study);
  const delta = study.savedWork;
  const revealed = frame.optimized.done;
  const contrast = revealed && !frame.baseline.done;
  const max = study.reference.gpuSeconds;
  const x = (seconds: number) => 140 + (505 * Math.min(seconds, max)) / max;
  const ratio = (delta / max) * 100;
  const root = useRef<HTMLDivElement>(null);
  const [link, setLink] = useState<{
    sx: number;
    sy: number;
    tx: number;
    ty: number;
  } | null>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const update = () => {
      const bounds = el.getBoundingClientRect();
      const source = el
        .querySelector("[data-pr-source]")
        ?.getBoundingClientRect();
      const target = el
        .querySelector("[data-pr-target]")
        ?.getBoundingClientRect();
      const scroll = el
        .querySelector(".pr-pair-scroll")
        ?.getBoundingClientRect();
      if (
        !source ||
        !target ||
        !scroll ||
        target.left < scroll.right ||
        source.right > scroll.right
      ) {
        setLink(null);
        return;
      }
      setLink({
        sx: source.left - bounds.left + source.width / 2,
        sy: source.top - bounds.top + source.height / 2,
        tx: target.left - bounds.left - 8,
        ty: target.top - bounds.top + target.height / 2,
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    const card = el.querySelector(".pr-focus-card");
    if (card) ro.observe(card);
    const scroll = el.querySelector(".pr-pair-scroll");
    scroll?.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      scroll?.removeEventListener("scroll", update);
    };
  }, [revealed, delta]);
  return (
    <div
      ref={root}
      className="pr-comparison"
      data-diverged={contrast}
      data-complete={revealed}
    >
      <div
        className="pr-pair-scroll"
        role="region"
        tabIndex={0}
        aria-label="Baseline and prefix reuse on one service clock; scroll horizontally on narrow screens"
      >
        <svg
          className="pr-pair"
          viewBox="0 0 740 462"
          role="group"
          aria-labelledby={id}
        >
          <title
            id={id}
          >{`Request ${study.request.id + 1}, service elapsed ${fmt(frame.seconds)} seconds. Baseline: ${frame.baseline.phase}, ${frame.baseline.outputTokens} output tokens. Reuse: ${frame.optimized.phase}, ${frame.optimized.outputTokens} output tokens. Both have the same ${study.request.tokens}-token output. Illustrative serial service, not queue response time.`}</title>
          {[study.reference, study.request].map((task, row) => {
            const lane = row ? frame.optimized : frame.baseline;
            const tint = row ? GREEN : contrast ? RED : BLUE;
            const y = row * 160;
            return (
              <g
                key={row}
                transform={`translate(0 ${y})`}
                className="pr-lane"
                data-finished={lane.done}
              >
                <text x="28" y="25" className="pr-pair-title" fill={tint}>
                  {row ? "Prefix reuse" : "Baseline"}
                </text>
                <text
                  x="700"
                  y="25"
                  textAnchor="end"
                  className="pr-label"
                  fill={tint}
                >
                  {lane.done
                    ? "✓ Answer complete"
                    : lane.phase === "prefill"
                      ? "Reading input"
                      : "Generating answer"}
                </text>
                <Hotspot
                  inspect={inspect}
                  item={{
                    key: `prefix-pair-input-${row}`,
                    title: row
                      ? "Reference the stored prefix"
                      : "Recompute the full input",
                    body:
                      row && task.cacheHit
                        ? `${fmt(study.savedTokens, 0)} matching tokens already have ready KV state. Only ${task.computedInputTokens} new input tokens are computed: ${fmt(task.prefill, 4)} GPU-s. The prior cold read is charged in the cohort.`
                        : `${task.computedInputTokens} input tokens require ${fmt(task.prefill, 4)} GPU-s of prefill. No output has been cached.`,
                  }}
                >
                  <rect
                    x="28"
                    y="43"
                    width="262"
                    height="98"
                    rx="4"
                    className="pr-pair-module"
                  />
                  <text x="42" y="65" className="pr-label">
                    {row && task.cacheHit
                      ? "KV prefix → new suffix"
                      : "Full prompt → prefill"}
                  </text>
                  {Array.from({ length: 28 }, (_, i) => {
                    const cached = row === 1 && task.cacheHit && i < 25;
                    const progress = lane.prefillWork / task.prefill;
                    const lit =
                      cached ||
                      (row && task.cacheHit ? (i - 25) / 3 : i / 28) < progress;
                    return (
                      <rect
                        key={i}
                        x={43 + (i % 14) * 16}
                        y={78 + Math.floor(i / 14) * 13}
                        width="11"
                        height="8"
                        fill={cached ? VIOLET : tint}
                        opacity={lit ? 0.85 : 0.12}
                      />
                    );
                  })}
                  <text x="42" y="126" className="pr-small">
                    {row && task.cacheHit
                      ? `${fmt(study.savedTokens, 0)} reused + ${lane.inputTokens} new`
                      : `${fmt(lane.inputTokens, 0)} / ${fmt(task.inputTokens, 0)} computed`}
                  </text>
                </Hotspot>
                <path
                  d="M290 91H327m-6-5 6 5-6 5"
                  fill="none"
                  stroke={lane.phase !== "prefill" ? tint : "#425766"}
                  strokeWidth="1.5"
                />
                <Hotspot
                  inspect={inspect}
                  item={{
                    key: `prefix-pair-decode-${row}`,
                    title: "The answer still requires every decode step",
                    body: `${fmt(task.decode, 4)} GPU-s of decode in either lane. The same ${task.tokens} output tokens are generated at the same rate; reuse advances when decoding begins, not how fast it runs.`,
                  }}
                >
                  <rect
                    x="335"
                    y="43"
                    width="154"
                    height="98"
                    rx="4"
                    className="pr-pair-module"
                  />
                  <text x="350" y="65" className="pr-label">
                    Decode
                  </text>
                  {Array.from({ length: 24 }, (_, i) => (
                    <rect
                      key={i}
                      x={351 + (i % 8) * 16}
                      y={78 + Math.floor(i / 8) * 12}
                      width="10"
                      height="7"
                      fill={tint}
                      opacity={
                        lane.phase === "decode"
                          ? 0.25 +
                            0.65 *
                              (1 -
                                Math.abs(
                                  (((lane.decodeWork / task.decode) * 24) %
                                    24) -
                                    i,
                                ) /
                                  24)
                          : lane.done
                            ? 0.65
                            : 0.12
                      }
                    />
                  ))}
                  <text x="350" y="130" className="pr-small">
                    {fmt(task.decode)} GPU-s
                  </text>
                </Hotspot>
                <path
                  d="M489 91H526m-6-5 6 5-6 5"
                  fill="none"
                  stroke={lane.outputTokens ? tint : "#425766"}
                  strokeWidth="1.5"
                />
                <rect
                  x="535"
                  y="43"
                  width="165"
                  height="98"
                  rx="4"
                  fill={lane.done ? "#182e24" : "#102331"}
                  stroke={
                    lane.done ? GREEN : contrast && !row ? RED : "#354e61"
                  }
                  strokeWidth={contrast && !row ? 2 : 1}
                />
                <text x="550" y="65" className="pr-label">
                  {lane.done ? "✓ Worker released" : "Output tokens"}
                </text>
                <text x="550" y="101" className="pr-pair-count" fill={tint}>
                  {fmt(lane.outputTokens, 0)}
                </text>
                <text x="685" y="100" textAnchor="end" className="pr-small">
                  / {task.tokens}
                </text>
                <path d="M550 121H685" stroke="#284457" strokeWidth="4" />
                <path
                  d={`M550 121H${550 + (135 * lane.outputTokens) / task.tokens}`}
                  stroke={tint}
                  strokeWidth="4"
                />
              </g>
            );
          })}
          <text x="28" y="340" className="pr-label">
            Service clock
          </text>
          <text x="700" y="340" textAnchor="end" className="pr-label">
            {fmt(frame.seconds)} s
          </text>
          {[study.reference, study.request].map((task, row) => {
            const lane = row ? frame.optimized : frame.baseline,
              y = 365 + row * 33;
            return (
              <g key={row}>
                <text x="28" y={y + 5} className="pr-small">
                  {row ? "Reuse" : "Baseline"}
                </text>
                <path
                  d={`M140 ${y}H${x(task.gpuSeconds)}`}
                  stroke="#2c4250"
                  strokeWidth="8"
                />
                <path
                  d={`M140 ${y}H${x(lane.work)}`}
                  stroke={row ? GREEN : BLUE}
                  strokeWidth="5"
                />
                {row === 0 && revealed && delta > 0 && (
                  <>
                    <path
                      d={`M${x(study.request.gpuSeconds)} ${y}H${x(max)}`}
                      stroke={RED}
                      strokeWidth="12"
                      opacity=".45"
                    />
                    <path
                      d={`M${x(study.request.gpuSeconds)} ${y}H${x(frame.seconds)}`}
                      stroke={RED}
                      strokeWidth="12"
                    />
                  </>
                )}
                <circle
                  cx={x(lane.work)}
                  cy={y}
                  r="4"
                  fill={row ? GREEN : BLUE}
                />
                <path d={`M${x(task.prefill)} ${y - 9}v18`} stroke="#ffc267" />
                <text
                  x={x(task.gpuSeconds) + 10}
                  y={y + 4}
                  className="pr-small"
                >
                  {fmt(task.gpuSeconds)}s
                </text>
              </g>
            );
          })}
          {revealed && delta > 0 ? (
            <g>
              <path
                d={`M${x(study.request.gpuSeconds)} 411v10H${x(max)}v-10`}
                stroke={RED}
                strokeWidth="2.5"
                fill="none"
              />
              <text
                x={(x(study.request.gpuSeconds) + x(max)) / 2}
                y="444"
                textAnchor="middle"
                className="pr-label"
                fill={RED}
              >
                Δ {fmt(delta)} GPU-s
              </text>
              <circle data-pr-source cx={x(max)} cy="421" r="4" fill={RED} />
            </g>
          ) : (
            <text x="140" y="440" className="pr-small">
              {delta
                ? "Amber tick: prefill ends, answer generation begins"
                : "Identical prefill and decode in both lanes"}
            </text>
          )}
        </svg>
      </div>
      {revealed && delta > 0 && link && (
        <svg className="pr-result-link" aria-hidden="true">
          <path
            d={`M${link.sx} ${link.sy}H${link.tx - 18}Q${link.tx} ${link.sy} ${link.tx} ${link.sy - 18}V${link.ty + 10}Q${link.tx} ${link.ty} ${link.tx + 8} ${link.ty}`}
          />
          <circle cx={link.tx + 8} cy={link.ty} r="3" />
        </svg>
      )}
      <aside
        className="pr-focus-card"
        aria-label="Prefix reuse benefit"
        data-earned={revealed && delta > 0}
      >
        <div className="pr-focus-context">
          <span>Request {study.request.id + 1} · KV prefix reuse</span>
          <strong>
            {delta
              ? `${fmt(study.savedTokens, 0)} input tokens`
              : "0 matching tokens"}
          </strong>
          <span>
            {delta
              ? "referenced from ready KV state"
              : "Full input computed in both lanes"}
          </span>
        </div>
        <div className="pr-focus-result">
          <div className="pr-gain" data-pr-target data-revealed={revealed}>
            <span>
              {revealed ? "Input computation avoided" : "GPU work accumulated"}
            </span>
            <strong>
              {revealed ? `Δ ${fmt(delta)}` : fmt(frame.optimized.work)}
              <small> GPU-s{!revealed && " · reuse"}</small>
            </strong>
          </div>
          <span className="pr-cost-scope">
            {revealed ? "Total work per request" : "Work accumulated so far"}
          </span>
          <div className="pr-focus-values">
            <span className="pr-baseline-value">
              {fmt(revealed ? max : frame.baseline.work)}
              <small> GPU-s · baseline</small>
            </span>
            <strong>
              {fmt(revealed ? study.request.gpuSeconds : frame.optimized.work)}
              <small>GPU-s reuse</small>
            </strong>
          </div>
          <svg className="pr-cost-bars" viewBox="0 0 280 22" aria-hidden="true">
            <path d="M0 4H280" stroke={BLUE} strokeWidth="5" opacity=".18" />
            <path
              d={`M0 4H${(280 * frame.baseline.work) / max}`}
              stroke={BLUE}
              strokeWidth="5"
            />
            {revealed && delta > 0 && (
              <path
                d={`M${(280 * study.request.gpuSeconds) / max} 4H280`}
                stroke={RED}
                strokeWidth="5"
              />
            )}
            <path
              d={`M0 18H${(280 * frame.optimized.work) / max}`}
              stroke={GREEN}
              strokeWidth="5"
            />
          </svg>
          <p
            className="pr-final-ratio"
            data-ready={frame.baseline.done}
            aria-hidden={!frame.baseline.done}
          >
            <b>{fmt(ratio, 1)}%</b> less work per request
          </p>
        </div>
        <div className="pr-focus-status" data-live={contrast}>
          <i aria-hidden="true" />
          {contrast
            ? `Reuse done. Baseline still has ${fmt(frame.remaining)} s of GPU work left.`
            : revealed
              ? delta > 0
                ? "Same answer length. Same decode rate."
                : "No matching prefix; no work saved."
              : "Only input processing changes. Decode rate stays fixed."}
        </div>
      </aside>
    </div>
  );
}
