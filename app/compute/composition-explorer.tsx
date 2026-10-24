"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  COMPOSITION_FILM_MS,
  compositionComparison,
  compositionMechanisms,
  compositionMoment,
  compositionMotion,
  type CompositionLens,
  type CompositionRuns,
} from "./composition-comparison";
import { paretoFrontier } from "./study-math";
import { useStudyPlayback } from "./use-study-playback";
import { useFilmTime } from "./use-film-time";
import { POLICIES, type LabRun } from "./lab-simulation";
import type { CompositionViewState, DirectedView } from "./explorer-state";
import "./composition-explorer.css";

const COLORS = ["#9cc5f5", "#ffc267", "#f3a0bc", "#b8e986"];
const VIOLET = "#c7a6ff";
const number = (value: number, digits = 1) =>
  value.toLocaleString("en-US", { maximumFractionDigits: digits });
const conditionName = (run: LabRun) =>
  `${POLICIES[run.policyIndex].name} / ${run.mechanisms.fastKernels ? "optimized" : run.mechanisms.reuse ? "KV reuse only" : "static"}`;
type Metric = "cost" | "accuracy";
const LENSES = [
  {
    id: "runtime",
    name: "Optimize inference runtime",
    detail: "KV reuse + execution rates",
  },
  {
    id: "policy",
    name: "Compare post-training",
    detail: "SFT + correctness RL",
  },
  {
    id: "combined",
    name: "Combine policy & runtime",
    detail: "Trace both contributions",
  },
] as const;

export function CompositionExplorer({
  points,
  selected,
  onSelect,
  evidence,
  initial,
  presentation,
}: {
  points: CompositionRuns;
  selected: number;
  onSelect: (index: number) => void;
  evidence: (run: LabRun, pause: () => void) => ReactNode;
  initial?: CompositionViewState;
  presentation?: DirectedView<CompositionViewState> & {
    state: CompositionViewState;
  };
}) {
  const [localLens, setLens] = useState<CompositionLens>(
    initial?.lens ?? "runtime",
  );
  const [localMetric, setMetric] = useState<Metric>(initial?.metric ?? "cost");
  const lens = presentation?.state.lens ?? localLens,
    metric = presentation?.state.metric ?? localMetric;
  const [hover, setHover] = useState<Metric | null>(null);
  const initialTime = initial
    ? (initial.time ?? compositionMoment(initial.phase))
    : undefined;
  const { ref, ...localPlayer } = useStudyPlayback(1, 0, {
    finite: true,
    interval: COMPOSITION_FILM_MS,
    enabled: !presentation,
    autoplay: !initial,
    initialTime,
  });
  const film = useFilmTime(
    localPlayer.readTime,
    localPlayer.running,
    localPlayer.reduced,
    COMPOSITION_FILM_MS,
    localPlayer.seek,
    initialTime,
  );
  const player = presentation
    ? { ...localPlayer, pause: presentation.pause }
    : localPlayer;
  const motion = compositionMotion(
    presentation?.time ??
      (localPlayer.finished ? COMPOSITION_FILM_MS : film.time),
  );
  const phase = motion.phase;
  const compare = useMemo(
    () => compositionComparison(points, selected, lens),
    [points, selected, lens],
  );
  const mechanisms = useMemo(
    () => compositionMechanisms(points, selected, lens),
    [points, selected, lens],
  );
  const contribution =
    phase === 1 || phase === 2 ? mechanisms[phase - 1] : null;
  const activeMetric = contribution?.metric ?? hover ?? metric;
  const { reference, target, referenceIndex, targetIndex } = compare;
  const id = useId();
  const stage = useRef<HTMLDivElement>(null);
  const [link, setLink] = useState<string | null>(null);
  const maxCost =
    Math.ceil(
      (Math.max(...points.map((point) => point.correctCost)) * 1.2) / 10,
    ) * 10;
  const x = (v: number) => 84 + (574 * v) / maxCost;
  const y = (v: number) => 354 - 2.48 * v;
  const frontier = paretoFrontier(points);
  const cacheHits = target.tasks.filter((task) => task.cacheHit).length;
  const emphasis = phase === 0 ? referenceIndex : targetIndex;
  const quiet = (i: number) => {
    if (contribution) {
      const matches = (run: LabRun) =>
        Math.abs(points[i].correctCost - run.correctCost!) < 1e-8 &&
        Math.abs(points[i].accuracy - run.accuracy) < 1e-8;
      return (
        !matches(contribution.before) &&
        !(motion.arrived && matches(contribution.after))
      );
    }
    return phase === 0 || phase === 3
      ? i !== emphasis
      : !compare.path.includes(i);
  };
  const shownBefore = contribution?.before ?? reference,
    shownAfter = contribution?.after ?? target;
  const costDelta = shownBefore.correctCost! - shownAfter.correctCost!;
  const accuracyDelta = shownAfter.accuracy - shownBefore.accuracy;
  const deltaVisible = contribution !== null || phase === 4;
  const resultOpacity = deltaVisible ? motion.resultReveal : 0;
  const seekPhase = (next: number, nextMetric = metric) => {
    const time = compositionMoment(next);
    if (presentation)
      presentation.inspect({ lens, metric: nextMetric, phase: next, time });
    else film.seek(time);
  };
  const select = (index: number) => {
    onSelect(index);
    if (!presentation) film.seek(compositionMoment(4));
  };
  const chooseLens = (next: CompositionLens) => {
    if (presentation) {
      presentation.inspect({
        lens: next,
        metric: next === "policy" ? "accuracy" : "cost",
        phase: 0,
        time: compositionMoment(0),
      });
      return;
    }
    setLens(next);
    setHover(null);
    setMetric(next === "policy" ? "accuracy" : "cost");
    film.seek(compositionMoment(0));
  };
  const inspectMetric = (next: Metric) => {
    if (presentation) {
      presentation.inspect({
        lens,
        metric: next,
        phase: 4,
        time: compositionMoment(4),
      });
      return;
    }
    setMetric(next);
    film.seek(compositionMoment(4));
  };

  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const update = () => {
      const root = node.getBoundingClientRect();
      const source = node
        .querySelector(`[data-cxp-source="${activeMetric}"]`)
        ?.getBoundingClientRect();
      const target = node
        .querySelector(`[data-cxp-target="${activeMetric}"]`)
        ?.getBoundingClientRect();
      const aside = node.querySelector(".cxp-readout")?.getBoundingClientRect();
      const viewport = node
        .querySelector(".cxp-scroll")
        ?.getBoundingClientRect();
      if (
        !source ||
        !target ||
        !aside ||
        !viewport ||
        aside.left <= root.left + 10 ||
        source.right > viewport.right
      ) {
        setLink(null);
        return;
      }
      const sx = source.left + source.width / 2 - root.left;
      const sy = source.top + source.height / 2 - root.top;
      const tx = target.left - root.left - 6;
      const ty = target.top + target.height / 2 - root.top;
      setLink(`M${sx} ${sy}H${aside.left - root.left + 8}V${ty}H${tx}`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    const aside = node.querySelector(".cxp-readout");
    if (aside) observer.observe(aside);
    const scroll = node.querySelector(".cxp-scroll");
    scroll?.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      scroll?.removeEventListener("scroll", update);
    };
  }, [
    activeMetric,
    phase,
    lens,
    shownBefore.correctCost,
    shownAfter.correctCost,
    shownBefore.accuracy,
    shownAfter.accuracy,
  ]);

  return (
    <section
      ref={ref}
      className="cxp-explorer"
      data-phase={phase}
      data-metric={activeMetric}
      data-running={player.running}
      data-time={motion.cursor}
      data-trace={motion.traceProgress}
      data-arrived={motion.arrived}
      aria-label="Inspect the two optimization effects"
    >
      <div
        className="cxp-lenses"
        role="group"
        aria-label="Choose the controlled comparison"
      >
        {LENSES.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={lens === item.id}
            onClick={() => chooseLens(item.id)}
          >
            <strong>{item.name}</strong>
            <span>{item.detail}</span>
          </button>
        ))}
      </div>
      <div ref={stage} className="cxp-stage">
        <div className="cxp-figure">
          <p className="cxp-pan">Scroll the figure to inspect →</p>
          <div
            className="cxp-scroll"
            role="region"
            tabIndex={0}
            aria-label="Four-condition cost and accuracy plot"
            onFocusCapture={player.pause}
          >
            <svg
              viewBox="0 0 760 540"
              className="cxp-plot"
              role="group"
              aria-labelledby={`${id}-title ${id}-desc`}
            >
              <title id={`${id}-title`}>
                Four conditions, two optimization effects
              </title>
              <desc
                id={`${id}-desc`}
              >{`${reference.label} to ${target.label}. Cost per correct answer ${number(reference.correctCost, 2)} to ${number(target.correctCost, 2)} modeled GPU-seconds; accuracy ${number(reference.accuracy)} to ${number(target.accuracy)} percent. These are illustrative calculations, not measured model runs. Select any condition to inspect it.`}</desc>
              <text x="84" y="32" className="cxp-plot-heading">
                {contribution
                  ? contribution.name
                  : phase === 0
                    ? "Baseline condition"
                    : phase === 3
                      ? "Final intervention result"
                      : "Compare cost and accuracy"}
              </text>
              <text x="84" y="55" className="cxp-tick">
                {contribution
                  ? lens === "runtime" &&
                    phase === 1 &&
                    contribution.delta === 0
                    ? "No shared prefix: every prompt still needs prefill."
                    : `${conditionName(shownBefore)} → ${conditionName(shownAfter)}`
                  : `${reference.label} → ${target.label}`}
              </text>
              {[0, 25, 50, 75, 100].map((value) => (
                <g key={value}>
                  <path d={`M84 ${y(value)}H674`} className="cxp-grid" />
                  <text
                    x="69"
                    y={y(value) + 4}
                    textAnchor="end"
                    className="cxp-tick"
                  >
                    {value}%
                  </text>
                </g>
              ))}
              {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
                <g key={fraction}>
                  <path
                    d={`M${x(fraction * maxCost)} 102V354`}
                    className="cxp-grid"
                  />
                  <text
                    x={x(fraction * maxCost)}
                    y="377"
                    textAnchor="middle"
                    className="cxp-tick"
                  >
                    {number(fraction * maxCost)}
                  </text>
                </g>
              ))}
              <text
                x="24"
                y="230"
                transform="rotate(-90 24 230)"
                className="cxp-axis"
                data-dimension="accuracy"
                textAnchor="middle"
              >
                Task accuracy
              </text>
              <text
                x="375"
                y="439"
                className="cxp-axis"
                data-dimension="cost"
                textAnchor="middle"
              >
                GPU-seconds per correct answer
              </text>
              {frontier.length > 1 && (
                <path
                  d={frontier
                    .map(
                      (point, index) =>
                        `${index ? "L" : "M"}${x(point.correctCost)} ${y(point.accuracy)}`,
                    )
                    .join(" ")}
                  fill="none"
                  stroke="#b8e986"
                  strokeDasharray="3 6"
                  strokeOpacity=".5"
                />
              )}
              {(phase === 0 || phase === 3) && (
                <g className="cxp-reading-projection" pointerEvents="none">
                  <path
                    d={
                      activeMetric === "accuracy"
                        ? `M${x(points[emphasis].correctCost)} ${y(points[emphasis].accuracy)}H84`
                        : `M${x(points[emphasis].correctCost)} ${y(points[emphasis].accuracy)}V354`
                    }
                    stroke={VIOLET}
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    fill="none"
                  />
                  <circle
                    cx={x(points[emphasis].correctCost)}
                    cy={y(points[emphasis].accuracy)}
                    r="20"
                    stroke={VIOLET}
                    strokeWidth="2"
                    fill="none"
                  />
                </g>
              )}
              {/* Runtime pairs remain visible so the surrounding scientific comparison never disappears. */}
              {[0, 2].map((index) => (
                <path
                  key={index}
                  d={`M${x(points[index].correctCost)} ${y(points[index].accuracy)}H${x(points[index + 1].correctCost)}`}
                  stroke={COLORS[index + 1]}
                  strokeOpacity=".22"
                  fill="none"
                />
              ))}
              <g
                className="cxp-difference"
                data-visible={deltaVisible}
                style={{ opacity: resultOpacity }}
                pointerEvents="none"
                aria-hidden="true"
              >
                {activeMetric === "cost" ? (
                  <>
                    <path
                      d={`M${x(shownBefore.correctCost!)} ${y(shownBefore.accuracy) + 18}V388M${x(shownAfter.correctCost!)} ${y(shownAfter.accuracy) + 18}V388`}
                      stroke={VIOLET}
                      strokeOpacity=".35"
                      strokeDasharray="3 5"
                      fill="none"
                    />
                    <path
                      d={`M${x(shownBefore.correctCost!)} 382v8H${x(shownAfter.correctCost!)}v-8`}
                      stroke={VIOLET}
                      strokeWidth="2.5"
                      fill="none"
                    />
                    <text
                      x={
                        (x(shownBefore.correctCost!) +
                          x(shownAfter.correctCost!)) /
                        2
                      }
                      y="416"
                      textAnchor="middle"
                      className="cxp-bracket-value"
                    >
                      {costDelta === 0
                        ? "No cost change"
                        : `Δ ${costDelta > 0 ? "−" : "+"}${number(Math.abs(costDelta), 2)} GPU-s / correct`}
                    </text>
                    <path
                      d={`M${(x(shownBefore.correctCost!) + x(shownAfter.correctCost!)) / 2} 390v7H718V365`}
                      stroke={VIOLET}
                      fill="none"
                    />
                    <circle
                      data-cxp-source="cost"
                      cx="718"
                      cy="354"
                      r="11"
                      fill="#251d38"
                      stroke={VIOLET}
                    />
                    <text
                      x="718"
                      y="358"
                      textAnchor="middle"
                      fill={VIOLET}
                      fontSize="13"
                    >
                      Δ
                    </text>
                  </>
                ) : (
                  <>
                    <path
                      d={`M${x(shownBefore.correctCost!) + 17} ${y(shownBefore.accuracy)}H689M${x(shownAfter.correctCost!) + 17} ${y(shownAfter.accuracy)}H689`}
                      stroke={VIOLET}
                      strokeOpacity=".35"
                      strokeDasharray="3 5"
                      fill="none"
                    />
                    <path
                      d={`M688 ${y(shownBefore.accuracy)}h8V${y(shownAfter.accuracy)}h-8`}
                      stroke={VIOLET}
                      strokeWidth="2.5"
                      fill="none"
                    />
                    <text
                      x="686"
                      y={Math.max(
                        92,
                        Math.min(
                          y(shownBefore.accuracy),
                          y(shownAfter.accuracy),
                        ) - 46,
                      )}
                      textAnchor="end"
                      className="cxp-bracket-value"
                    >
                      {accuracyDelta === 0
                        ? "Same accuracy"
                        : `Δ ${accuracyDelta > 0 ? "+" : "−"}${number(Math.abs(accuracyDelta))} pp`}
                    </text>
                    <path
                      d={`M696 ${(y(shownBefore.accuracy) + y(shownAfter.accuracy)) / 2}h11`}
                      stroke={VIOLET}
                    />
                    <circle
                      data-cxp-source="accuracy"
                      cx="718"
                      cy={
                        (y(shownBefore.accuracy) + y(shownAfter.accuracy)) / 2
                      }
                      r="11"
                      fill="#251d38"
                      stroke={VIOLET}
                    />
                    <text
                      x="718"
                      y={
                        (y(shownBefore.accuracy) + y(shownAfter.accuracy)) / 2 +
                        4
                      }
                      textAnchor="middle"
                      fill={VIOLET}
                      fontSize="13"
                    >
                      {accuracyDelta === 0 ? "=" : "Δ"}
                    </text>
                  </>
                )}
              </g>
              {mechanisms.map((step, index) => {
                const active = phase === index + 1,
                  reached = phase >= index + 1,
                  progress = active ? motion.traceProgress : reached ? 1 : 0;
                const sx = x(step.before.correctCost!),
                  sy = y(step.before.accuracy),
                  tx = x(step.after.correctCost!),
                  ty = y(step.after.accuracy);
                const labelX = 84 + index * 303;
                const distance = Math.hypot(tx - sx, ty - sy);
                return (
                  <g
                    key={step.name}
                    className="cxp-graph-contribution"
                    data-active={active}
                    data-reached={reached}
                  >
                    <g
                      className="cxp-contribution-geometry"
                      opacity={reached ? 1 : 0}
                      pointerEvents="none"
                    >
                      <path
                        d={`M${sx} ${sy}L${tx} ${ty}`}
                        stroke={VIOLET}
                        strokeWidth={active ? 4 : 1.5}
                        fill="none"
                        pathLength="1"
                        strokeDasharray="1"
                        strokeDashoffset={1 - progress}
                        className="cxp-trace-path"
                      />
                      {active &&
                        distance > 0.5 &&
                        progress > 0 &&
                        progress < 1 && (
                          <circle
                            className="cxp-trace-cursor"
                            cx={sx + (tx - sx) * progress}
                            cy={sy + (ty - sy) * progress}
                            r="6"
                            fill={VIOLET}
                            stroke="#fff"
                            strokeWidth="1.5"
                          />
                        )}
                      {index === 0 && lens !== "combined" && distance > 0.5 && (
                        <g opacity={progress}>
                          <path
                            d={`M${tx} ${ty - 7}l7 7-7 7-7-7Z`}
                            stroke={VIOLET}
                            fill="#191827"
                            strokeWidth="2"
                          />
                          <text
                            x={tx}
                            y={ty - 42}
                            textAnchor="middle"
                            className="cxp-intermediate-label"
                          >
                            {lens === "runtime"
                              ? "KV reuse only"
                              : "SFT checkpoint"}
                          </text>
                          <path d={`M${tx} ${ty - 34}v21`} stroke={VIOLET} />
                        </g>
                      )}
                      {active && (
                        <>
                          <circle
                            cx={sx}
                            cy={sy}
                            r="19"
                            stroke={VIOLET}
                            fill="none"
                            strokeWidth="2"
                          />
                          <circle
                            cx={tx}
                            cy={ty}
                            r="19"
                            stroke={VIOLET}
                            fill="none"
                            strokeWidth="2"
                            opacity={motion.arrived ? 1 : 0}
                          />
                        </>
                      )}
                    </g>
                    <g
                      className="cxp-contribution-control"
                      role="button"
                      tabIndex={0}
                      aria-label={`Inspect contribution ${index + 1}: ${step.name}`}
                      aria-pressed={active}
                      onClick={() => seekPhase(index + 1, step.metric)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          seekPhase(index + 1, step.metric);
                        }
                      }}
                    >
                      <rect
                        x={labelX - 8}
                        y="464"
                        width="289"
                        height="61"
                        rx="3"
                        fill={active ? "#29213b" : "#101e2a"}
                        stroke={active ? VIOLET : "#3d4a58"}
                      />
                      <circle
                        cx={labelX + 12}
                        cy="484"
                        r="10"
                        fill="#191827"
                        stroke={VIOLET}
                      />
                      <text
                        x={labelX + 12}
                        y="488"
                        textAnchor="middle"
                        fill={VIOLET}
                        fontSize="11"
                      >
                        {index + 1}
                      </text>
                      <text
                        x={labelX + 32}
                        y="485"
                        className="cxp-contribution-name"
                      >
                        {step.name}
                      </text>
                      <text
                        x={labelX + 32}
                        y="509"
                        className="cxp-contribution-value"
                      >
                        {step.delta === 0
                          ? "No change"
                          : `Δ ${step.metric === "cost" ? (step.delta > 0 ? "−" : "+") : step.delta > 0 ? "+" : "−"}${number(Math.abs(step.delta), step.metric === "cost" ? 2 : 1)} ${step.metric === "cost" ? "GPU-s / correct" : "pp accuracy"}`}
                      </text>
                    </g>
                  </g>
                );
              })}
              {points.map((point, index) => (
                <g
                  key={point.id}
                  transform={`translate(${x(point.correctCost)} ${y(point.accuracy)})`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected === index}
                  aria-label={`${point.label}: ${number(point.accuracy)} percent accuracy, ${number(point.correctCost, 2)} GPU-seconds per correct answer`}
                  className="cxp-point"
                  data-quiet={quiet(index)}
                  onClick={() => select(index)}
                  onFocus={player.pause}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      select(index);
                    }
                  }}
                >
                  <circle r="22" fill="transparent" />
                  <circle
                    r={selected === index ? 14 : 10}
                    fill="#0b151d"
                    stroke={COLORS[index]}
                    strokeWidth={selected === index ? 2 : 1}
                  />
                  <circle r="4" fill={COLORS[index]} />
                  <text
                    x={point.optimized ? -23 : 23}
                    y="-5"
                    textAnchor={point.optimized ? "end" : "start"}
                    fill={COLORS[index]}
                    className="cxp-point-label"
                  >
                    {point.trained ? "Post-trained" : "Base"}
                    <tspan
                      x={point.optimized ? -23 : 23}
                      dy="15"
                      className="cxp-point-runtime"
                    >
                      {point.optimized ? "optimized runtime" : "static runtime"}
                    </tspan>
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
        <aside
          className="cxp-readout"
          aria-label="Controlled comparison result"
        >
          <div className="cxp-pair">
            <span style={{ color: COLORS[referenceIndex] }}>
              {contribution ? conditionName(shownBefore) : reference.label}
            </span>
            <span aria-hidden="true">→</span>
            <strong style={{ color: COLORS[targetIndex] }}>
              {contribution ? conditionName(shownAfter) : target.label}
            </strong>
          </div>
          <p className="cxp-active-step">
            {contribution
              ? `Step ${phase}: ${contribution.name}`
              : phase === 0
                ? "Read the baseline"
                : phase === 3
                  ? "Read the final condition"
                  : "Compare the complete change"}
          </p>
          <div
            className="cxp-metrics"
            role="group"
            aria-label="Highlight a comparison dimension"
          >
            {(["cost", "accuracy"] as const).map((item) => (
              <button
                type="button"
                key={item}
                aria-pressed={metric === item}
                data-highlight={activeMetric === item}
                onClick={() => inspectMetric(item)}
                onPointerEnter={() => {
                  if (!presentation) {
                    setHover(item);
                    player.pause();
                  }
                }}
                onPointerLeave={() => setHover(null)}
                onFocus={() => {
                  if (!presentation) setHover(item);
                  player.pause();
                }}
                onBlur={() => setHover(null)}
              >
                <span>
                  {item === "cost" ? "GPU-s / correct answer" : "Task accuracy"}
                </span>
                <span className="cxp-paired">
                  <b style={{ color: COLORS[referenceIndex] }}>
                    {number(
                      item === "cost"
                        ? shownBefore.correctCost!
                        : shownBefore.accuracy,
                      item === "cost" ? 2 : 1,
                    )}
                    {item === "accuracy" ? "%" : ""}
                  </b>
                  <i>→</i>
                  <b style={{ color: COLORS[targetIndex] }}>
                    {number(
                      item === "cost"
                        ? shownAfter.correctCost!
                        : shownAfter.accuracy,
                      item === "cost" ? 2 : 1,
                    )}
                    {item === "accuracy" ? "%" : ""}
                  </b>
                </span>
                <strong
                  data-cxp-target={item}
                  className="cxp-delta"
                  data-visible={deltaVisible}
                  style={{ opacity: resultOpacity }}
                >
                  {item === "cost"
                    ? `Δ ${number(Math.abs(costDelta), 2)} ${costDelta === 0 ? "difference" : costDelta > 0 ? "less" : "more"}`
                    : accuracyDelta === 0
                      ? "= same accuracy"
                      : `Δ ${accuracyDelta > 0 ? "+" : ""}${number(accuracyDelta)} percentage points`}
                </strong>
              </button>
            ))}
          </div>
          <div
            className="cxp-mechanisms"
            role="group"
            aria-label="Contribution of each intervention"
          >
            <h3>
              {lens === "runtime"
                ? "Runtime contributions"
                : lens === "policy"
                  ? "Training contributions"
                  : "Policy & runtime contributions"}
            </h3>
            {mechanisms.map((mechanism, index) => (
              <div
                key={mechanism.name}
                className="cxp-mechanism"
                data-active={phase === index + 1}
              >
                <span className="cxp-mechanism-step" aria-hidden="true">
                  {index + 1}
                </span>
                <span>
                  {mechanism.name}
                  <small>
                    {mechanism.metric === "cost"
                      ? "GPU-s per correct answer"
                      : "Task accuracy"}
                  </small>
                </span>
                <strong title="Contributions are rounded independently; exact values are in the scenario model">
                  {mechanism.delta === 0
                    ? "="
                    : mechanism.metric === "cost"
                      ? mechanism.delta > 0
                        ? "≈ −"
                        : "≈ +"
                      : mechanism.delta > 0
                        ? "≈ +"
                        : "≈ −"}
                  {number(
                    Math.abs(mechanism.delta),
                    mechanism.metric === "cost" ? 2 : 1,
                  )}
                  {mechanism.metric === "accuracy" ? " pp" : ""}
                </strong>
              </div>
            ))}
          </div>
          <p className="cxp-cohort">
            Accuracy: {shownAfter.correct} / {shownAfter.n} tasks correct
            <span>32 mathematics · 32 logic · 32 repository tasks</span>
          </p>
          <details
            className="cxp-audit"
            onToggle={(event) => {
              if (event.currentTarget.open) player.pause();
            }}
          >
            <summary>Inspect the accounting</summary>
            <p>
              {number(reference.gpuSeconds, 2)} ÷ {reference.correct} correct →{" "}
              {number(target.gpuSeconds, 2)} ÷ {target.correct} correct.
            </p>
            <p>
              Work per task: {number(reference.meanCost, 2)} →{" "}
              {number(target.meanCost, 2)} GPU-s.{" "}
              {lens !== "runtime"
                ? "The number of correct answers changes too; do not attribute the whole ratio change to execution speed."
                : "Intermediate points isolate KV reuse first, then execution rates. The final condition enables both."}
            </p>
            <p>
              {compare.gained} newly correct · {compare.lost} negative flips ·{" "}
              {compare.unchangedTasks} unchanged outcomes.
            </p>
            <p>
              {reference.tasks.filter((task) => task.cacheHit).length} →{" "}
              {cacheHits} prefix hits. Scheduling is continuous in all four
              conditions; no scheduling gain is credited here.
            </p>
            <p>
              {frontier.length} non-dominated points. The dotted connection
              identifies the scenario frontier, not an empirical benchmark.
            </p>
            <p>
              Contributions follow the displayed order. KV reuse is enabled
              first at the original execution rates; the next step changes
              input/output rates. These are conditional contributions, not
              independently additive percentage gains. SFT and correctness RL
              use the scenario’s declared ability, growth and work coefficients.
              No specific GRPO training run or benchmark evaluation is
              represented.
            </p>
            <p>
              Task accuracy is the number of correct outcomes divided by 96
              deterministic task specifications, equally split across the three
              families. This is not a named held-out benchmark. Task definitions
              and the outcome rule are available in the scenario record.
            </p>
          </details>
          <div className="cxp-evidence">
            <span>Selected: {points[selected].label}</span>
            {evidence(points[selected], player.pause)}
          </div>
        </aside>
        {deltaVisible && link && (
          <svg
            className="cxp-result-link"
            aria-hidden="true"
            style={{ opacity: resultOpacity }}
          >
            <path d={link} fill="none" stroke={VIOLET} strokeWidth="2" />
          </svg>
        )}
      </div>
      <div className="cxp-direction">
        <div role="group" aria-label="Comparison reading order">
          {[
            "Baseline condition",
            ...mechanisms.map((step) => step.name),
            "Final condition",
            "Compare the change",
          ].map((name, index) => (
            <button
              type="button"
              key={name}
              aria-pressed={phase === index}
              onClick={() => seekPhase(index)}
            >
              {name}
            </button>
          ))}
        </div>
        <div
          className="cxp-transport"
          role="group"
          aria-label="Composition playback"
        >
          <button
            type="button"
            disabled={player.reduced}
            onClick={() => {
              if (player.running) player.pause();
              else if (motion.cursor >= COMPOSITION_FILM_MS) {
                film.seek(0);
                player.replay();
              } else player.resume();
            }}
          >
            {player.running
              ? "Ⅱ Pause comparison"
              : motion.cursor >= COMPOSITION_FILM_MS
                ? "↺ Replay comparison"
                : "▷ Continue comparison"}
          </button>
          <input
            type="range"
            aria-label="Scrub composition comparison"
            aria-valuetext={`${number(motion.cursor / 1000)} seconds of 17.5 seconds`}
            min="0"
            max={COMPOSITION_FILM_MS}
            step="10"
            value={motion.cursor}
            onChange={(event) => film.seek(Number(event.target.value))}
          />
          <time>{number(motion.cursor / 1000)} / 17.5 s</time>
        </div>
      </div>
    </section>
  );
}
