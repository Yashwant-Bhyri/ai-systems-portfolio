"use client";

import { useId } from "react";
import { paretoFrontier, type FrontierPoint } from "./study-math";

export const RESULT_COLORS = ["#a9b6c7", "#ffc267", "#f3a0bc", "#b8e986"];
const keyActivate = (
  event: React.KeyboardEvent<SVGGElement>,
  callback: () => void,
) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    callback();
  }
};

function PlotPoint({
  x,
  y,
  color,
  selected,
  label,
  onSelect,
  children,
}: {
  x: number;
  y: number;
  color: string;
  selected: boolean;
  label: string;
  onSelect: () => void;
  children?: React.ReactNode;
}) {
  return (
    <g
      className="rs-point"
      style={{ transform: `translate(${x}px, ${y}px)` }}
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={selected}
      onClick={onSelect}
      onFocus={() => {
        if (!selected) onSelect();
      }}
      onKeyDown={(e) => keyActivate(e, onSelect)}
    >
      <circle r={22} fill="transparent" />
      <circle
        r={selected ? 15 : 9}
        fill="none"
        stroke={color}
        strokeOpacity={selected ? 0.55 : 0.25}
        className={selected ? "rs-point-halo" : undefined}
      />
      <circle r={5} fill={color} stroke="#091019" strokeWidth={2} />
      {children}
    </g>
  );
}

export function CompositionPlot({
  points,
  selected,
  beat,
  onSelect,
}: {
  points: FrontierPoint[];
  selected: number;
  beat: number;
  onSelect: (i: number) => void;
}) {
  const id = useId(),
    maxCost =
      Math.ceil((Math.max(...points.map((p) => p.correctCost)) * 1.22) / 10) *
      10,
    px = (v: number) => 86 + (v / maxCost) * 950,
    py = (v: number) => 314 - (v / 100) * 250;
  const frontier = paretoFrontier(points),
    focus = points[selected],
    reference = points[0],
    costDelta = focus.correctCost - reference.correctCost,
    accuracyDelta = focus.accuracy - reference.accuracy,
    anchorX = Math.min(885, Math.max(305, px(focus.correctCost))),
    signed = (value: number, unit: string) =>
      `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toFixed(2)} ${unit}`;
  return (
    <svg
      viewBox="0 0 1140 394"
      className="rs-plot"
      aria-labelledby={`${id}-title ${id}-desc`}
      role="group"
    >
      <title id={`${id}-title`}>
        Four-condition synthetic composition study
      </title>
      <desc id={`${id}-desc`}>
        All four conditions use one deterministic synthetic cohort. Accuracy and
        GPU costs are simulated, not measured. Training changes outcomes;
        execution changes cost while preserving those outcomes. Select a point
        to inspect the arithmetic.
      </desc>
      <defs>
        <marker
          id={`${id}-arrow`}
          viewBox="0 0 8 8"
          refX="6"
          refY="4"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path
            d="M1 1L6 4L1 7"
            fill="none"
            stroke="context-stroke"
            strokeWidth="1.3"
          />
        </marker>
      </defs>
      {[0, 20, 40, 60, 80, 100].map((v) => (
        <g key={v}>
          <path
            d={`M86 ${py(v)}H1070`}
            stroke="#28343e"
            strokeDasharray={v === 0 ? undefined : "2 6"}
          />
          <text x={70} y={py(v) + 4} textAnchor="end" className="rs-tick">
            {v}%
          </text>
        </g>
      ))}
      {Array.from({ length: 6 }, (_, i) => (i * maxCost) / 5).map((v) => (
        <g key={v}>
          <path d={`M${px(v)} 57V314`} stroke="#202b36" />
          <text x={px(v)} y={336} textAnchor="middle" className="rs-tick">
            {v}
          </text>
        </g>
      ))}
      <text
        x={22}
        y={190}
        transform="rotate(-90 22 190)"
        textAnchor="middle"
        className="rs-axis"
      >
        Synthetic task accuracy
      </text>
      <text x={570} y={367} textAnchor="middle" className="rs-axis">
        Simulated GPU-seconds per valid correct answer
      </text>
      <text x={86} y={29} className="rs-figure-label">
        SYNTHETIC COMPOSITION · SAME COHORT · TWO INDEPENDENT CHANGES
      </text>
      <g className="ef-composition-link" pointerEvents="none" aria-hidden="true">
        {selected !== 0 ? (
          <path
            d={`M${px(reference.correctCost)} ${py(reference.accuracy)}L${px(focus.correctCost)} ${py(focus.accuracy)}`}
            stroke="#a28cff"
            strokeWidth="2.5"
            strokeDasharray="5 5"
            fill="none"
          />
        ) : null}
        <path
          d={`M${px(focus.correctCost)} ${py(focus.accuracy) - 20}L${anchorX} 76`}
          stroke="#a28cff"
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx={px(focus.correctCost)} cy={py(focus.accuracy)} r="18" fill="none" stroke="#a28cff" strokeWidth="1.5" />
        <text x={anchorX} y="54" textAnchor="middle" className="ef-plot-delta">
          Δ {signed(costDelta, "GPU-s / correct")} · {signed(accuracyDelta, "pp")}
        </text>
        <text x={anchorX} y="71" textAnchor="middle" className="rs-tick">
          Base / Static → {focus.label}
        </text>
      </g>
      <path
        d="M985 75H960V50"
        fill="none"
        stroke="#b8e986"
        markerEnd={`url(#${id}-arrow)`}
      />
      <text x={1001} y={68} className="rs-tick">
        better
      </text>
      <path
        d={`M86 ${py(focus.accuracy)}H${px(focus.correctCost)}V314`}
        className="rs-crosshair"
        fill="none"
        stroke={RESULT_COLORS[selected]}
        strokeDasharray="3 5"
        opacity=".4"
      />
      {frontier.length > 1 ? (
        <path
          d={frontier
            .map(
              (p, i) =>
                `${i ? "L" : "M"}${px(p.correctCost)} ${py(p.accuracy)}`,
            )
            .join(" ")}
          fill="none"
          stroke="#b8e986"
          strokeWidth="2"
          strokeDasharray="5 5"
          opacity={beat === 2 ? 1 : 0.3}
        />
      ) : null}
      {[0, 2].map((i) => (
        <g
          key={i}
          opacity={beat === 0 || beat === 2 ? 1 : 0.24}
          className="rs-emphasis"
        >
          <path
            d={`M${px(points[i].correctCost) - 18} ${py(points[i].accuracy)}H${px(points[i + 1].correctCost) + 18}`}
            fill="none"
            stroke={RESULT_COLORS[i + 1]}
            strokeWidth="2"
            markerEnd={`url(#${id}-arrow)`}
          />
          <path
            className="rs-flow"
            d={`M${px(points[i].correctCost) - 18} ${py(points[i].accuracy)}H${px(points[i + 1].correctCost) + 18}`}
            fill="none"
            stroke="#fff"
            strokeDasharray="3 20"
            strokeOpacity=".45"
          />
          <text
            x={(px(points[i].correctCost) + px(points[i + 1].correctCost)) / 2}
            y={py(points[i].accuracy) + 27}
            textAnchor="middle"
            className="rs-tick"
          >
            same accuracy
          </text>
        </g>
      ))}
      <g opacity={beat === 1 || beat === 2 ? 0.8 : 0.2} className="rs-emphasis">
        <path
          d={`M${px(points[0].correctCost) + 14} ${py(points[0].accuracy) - 10}Q${Math.max(px(points[0].correctCost), px(points[2].correctCost)) + 65} ${(py(points[0].accuracy) + py(points[2].accuracy)) / 2} ${px(points[2].correctCost) + 14} ${py(points[2].accuracy) + 10}`}
          fill="none"
          stroke="#f3a0bc"
          strokeWidth="1.5"
          markerEnd={`url(#${id}-arrow)`}
        />
        <text
          x={
            Math.max(px(points[0].correctCost), px(points[2].correctCost)) + 52
          }
          y={(py(points[0].accuracy) + py(points[2].accuracy)) / 2 + 4}
          className="rs-tick"
        >
          new policy
        </text>
      </g>
      {points.map((p, i) => (
        <PlotPoint
          key={p.id}
          x={px(p.correctCost)}
          y={py(p.accuracy)}
          color={RESULT_COLORS[i]}
          selected={selected === i}
          label={`${p.label}, illustrative ${p.accuracy}% accuracy, ${p.correctCost.toFixed(2)} GPU-seconds per correct answer`}
          onSelect={() => onSelect(i)}
        >
          <text
            x={0}
            y={p.optimized ? 48 : -24}
            textAnchor="middle"
            fill={RESULT_COLORS[i]}
            className="rs-point-name"
          >
            {p.trained ? "Post-trained" : "Base"} ·{" "}
            {p.optimized ? "optimized" : "static"}
          </text>
        </PlotPoint>
      ))}
      <text x={86} y={388} className="rs-tick">
        {frontier.length > 1
          ? "Dotted green: non-dominated scenario points, not an empirical frontier."
          : "One scenario point dominates; there is no multi-point frontier to connect."}
      </text>
    </svg>
  );
}
