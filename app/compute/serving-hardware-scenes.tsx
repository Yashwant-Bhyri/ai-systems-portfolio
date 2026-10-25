"use client";

import { useId } from "react";
import {
  SERVING_REQUESTS,
  servingOverviewFrame,
  type ServingFrame,
} from "./serving-load-overview-model";
import {
  fusionFixture,
  hardwareFrame,
  pipelineFixture,
  quantizationFixture,
  tensorFixture,
  unit,
  type HardwareTopology,
} from "./serving-hardware-model";
import "./serving-hardware-scenes.css";

const BLUE = "#9cc5f5",
  GREEN = "#b8e986",
  AMBER = "#ffc267",
  RED = "#ff9185",
  VIOLET = "#c7a6ff";
const n = (x: number, digits = 3) => Number(x.toFixed(digits)).toString();
const fusion = fusionFixture(),
  tensor = tensorFixture(),
  pipeline = pipelineFixture();
const REQUEST_COLORS = [BLUE, GREEN, VIOLET];

function Values({
  values,
  x,
  y,
  color = BLUE,
  width = 29,
  visible = true,
}: {
  values: readonly number[];
  x: number;
  y: number;
  color?: string;
  width?: number;
  visible?: boolean;
}) {
  return (
    <g opacity={visible ? 1 : 0.2}>
      {values.map((value, i) => (
        <g key={i} transform={`translate(${x + i * (width + 4)} ${y})`}>
          <rect
            width={width}
            height="29"
            rx="3"
            fill="#142a36"
            stroke={color}
          />
          <text
            x={width / 2}
            y="19"
            textAnchor="middle"
            className="sh-number"
            fill={color}
          >
            {n(value, 2)}
          </text>
        </g>
      ))}
    </g>
  );
}

function Signal({
  points,
  progress,
  color = AMBER,
}: {
  points: [number, number][];
  progress: number;
  color?: string;
}) {
  const p = unit(progress);
  const lengths = points
    .slice(1)
    .map((point, i) =>
      Math.hypot(point[0] - points[i][0], point[1] - points[i][1]),
    );
  const total = lengths.reduce((a, b) => a + b, 0);
  let distance = total * p,
    position = points[points.length - 1];
  for (let i = 0; i < lengths.length; i++) {
    if (distance <= lengths[i]) {
      const q = lengths[i] ? distance / lengths[i] : 0;
      position = [
        points[i][0] + (points[i + 1][0] - points[i][0]) * q,
        points[i][1] + (points[i + 1][1] - points[i][1]) * q,
      ];
      break;
    }
    distance -= lengths[i];
  }
  const d = points
    .map((point, i) => `${i ? "L" : "M"}${point[0]} ${point[1]}`)
    .join(" ");
  return (
    <g aria-hidden="true">
      <path d={d} fill="none" stroke="#3c5767" strokeWidth="1.5" />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={1 - p}
      />
      {p > 0 && p < 1 && (
        <circle cx={position[0]} cy={position[1]} r="4" fill={color} />
      )}
    </g>
  );
}

function Consequence({
  title,
  metric,
  unit: suffix,
  caption,
  rows,
  notes,
  color = VIOLET,
}: {
  title: string[];
  metric: string;
  unit: string;
  caption: string;
  rows: [string, string][];
  notes: string[];
  color?: string;
}) {
  return (
    <g className="sh-consequence" transform="translate(803 64)">
      <rect width="247" height="500" rx="8" fill="#1c2037" stroke="#776b9d" />
      {title.map((line, i) => (
        <text key={i} x="22" y={40 + i * 29} className="sh-title">
          {line}
        </text>
      ))}
      <text x="22" y="164" className="sh-metric" fill={color}>
        {metric}
        <tspan className="sh-unit"> {suffix}</tspan>
      </text>
      <text x="22" y="190" className="sh-small">
        {caption}
      </text>
      {rows.map(([label, value], i) => (
        <g key={label}>
          <text x="22" y={236 + i * 42} className="sh-small">
            {label}
          </text>
          <text x="226" y={236 + i * 42} textAnchor="end" className="sh-stat">
            {value}
          </text>
        </g>
      ))}
      <path d="M22 403H225" stroke="#55516f" />
      {notes.map((line, i) => (
        <text key={i} x="22" y={430 + i * 20} className="sh-small">
          {line}
        </text>
      ))}
    </g>
  );
}

function FusionScene({ progress }: { progress: number }) {
  const first = unit((progress - 0.12) / 0.22),
    spill = unit((progress - 0.32) / 0.22),
    second = unit((progress - 0.52) / 0.2),
    result = progress >= 0.75;
  return (
    <g>
      <text x="32" y="35" className="sh-subtitle">
        Operation microscope · y = max(0, x + 0.25)
      </text>
      <text x="32" y="67" className="sh-small">
        Four FP32 values. The same arithmetic, two execution paths.
      </text>
      <text x="32" y="128" className="sh-label" fill={BLUE}>
        Separate kernels
      </text>
      <text x="32" y="163" className="sh-small">
        input x
      </text>
      <Values values={fusion.input} x={32} y={180} width={37} />
      <Signal
        points={[
          [196, 195],
          [232, 195],
        ]}
        progress={first}
        color={BLUE}
      />
      <rect
        x="234"
        y="163"
        width="102"
        height="67"
        rx="6"
        fill="#18303c"
        stroke={BLUE}
      />
      <text x="285" y="189" textAnchor="middle" className="sh-label">
        add 0.25
      </text>
      <text x="285" y="213" textAnchor="middle" className="sh-small">
        launch 1
      </text>
      <Signal
        points={[
          [338, 195],
          [364, 195],
          [364, 292],
          [396, 292],
        ]}
        progress={spill * 2}
        color={RED}
      />
      <rect
        x="395"
        y="261"
        width="180"
        height="76"
        rx="4"
        fill="#31262d"
        stroke={RED}
      />
      <text x="408" y="279" className="sh-small">
        temporary z · global memory
      </text>
      <Values
        values={fusion.intermediate}
        x={408}
        y={291}
        width={35}
        color={RED}
        visible={spill >= 0.5}
      />
      <Signal
        points={[
          [576, 292],
          [602, 292],
          [602, 195],
          [622, 195],
        ]}
        progress={(spill - 0.5) * 2}
        color={RED}
      />
      <rect
        x="624"
        y="163"
        width="112"
        height="67"
        rx="6"
        fill="#18303c"
        stroke={BLUE}
      />
      <text x="680" y="189" textAnchor="middle" className="sh-label">
        ReLU
      </text>
      <text x="680" y="213" textAnchor="middle" className="sh-small">
        launch 2
      </text>
      <text x="535" y="361" className="sh-small">
        output y
      </text>
      <Values
        values={fusion.output}
        x={595}
        y={345}
        width={34}
        visible={second === 1}
        color={GREEN}
      />
      <Signal
        points={[
          [738, 195],
          [768, 195],
          [768, 359],
          [752, 359],
        ]}
        progress={second}
        color={GREEN}
      />
      <text x="32" y="414" className="sh-label" fill={GREEN}>
        Fused kernel
      </text>
      <Values values={fusion.input} x={32} y={440} width={37} />
      <Signal
        points={[
          [196, 455],
          [256, 455],
        ]}
        progress={first}
        color={GREEN}
      />
      <rect
        x="258"
        y="412"
        width="316"
        height="96"
        rx="6"
        fill="#153029"
        stroke={GREEN}
      />
      <text x="276" y="437" className="sh-label">
        add → ReLU · one launch
      </text>
      <text x="276" y="464" className="sh-small">
        z stays on-chip
      </text>
      <Values
        values={fusion.intermediate}
        x={401}
        y={447}
        width={35}
        visible={first === 1}
        color={GREEN}
      />
      <Signal
        points={[
          [576, 455],
          [594, 455],
        ]}
        progress={second}
        color={GREEN}
      />
      <Values
        values={fusion.output}
        x={595}
        y={440}
        width={34}
        visible={second === 1}
        color={GREEN}
      />
      <g opacity={result ? 1 : 0.2}>
        <path
          d="M396 341v13h178v-13M574 348H580V391H787V231H815"
          fill="none"
          stroke={VIOLET}
          strokeWidth="2"
        />
        <text x="34" y="555" className="sh-label" fill={VIOLET}>
          16 B temporary write + 16 B reread removed
        </text>
        <text x="34" y="583" className="sh-small">
          Both output vectors: [0, 0, 0.75, 1.5]
        </text>
      </g>
      <Consequence
        title={["Keep the intermediate", "on-chip."]}
        metric="−32"
        unit="B"
        caption="temporary traffic removed"
        rows={[
          ["Global traffic", "64 → 32 B"],
          ["Kernel launches", "2 → 1"],
          ["Toy output", "identical"],
        ]}
        notes={[]}
      />
    </g>
  );
}

function PrecisionScene({
  bits,
  progress,
  selected,
  onSelect,
}: {
  bits: 4 | 8;
  progress: number;
  selected: number;
  onSelect: (index: number) => void;
}) {
  const q = quantizationFixture(bits),
    ready = progress >= 0.7,
    morph = unit((progress - 0.15) / 0.4);
  const vx = (w: number) => 40 + ((w + 1.8) / 3.6) * 704;
  const original = q.weights[selected],
    reconstructed = q.reconstructed[selected];
  return (
    <g>
      <text x="32" y="35" className="sh-subtitle">
        Weight quantization · q = round(w / s), ŵ = q × s
      </text>
      <text x="32" y="67" className="sh-small">
        One scale for 16 values. Select a weight to inspect its rounding error.
      </text>
      <text x="32" y="108" className="sh-label" fill={BLUE}>
        Original FP32 weights
      </text>
      <text x="447" y="108" className="sh-label" fill={AMBER}>
        Signed INT{bits} codes
      </text>
      {q.weights.map((w, i) => (
        <g
          key={i}
          className="sh-weight"
          role="button"
          tabIndex={0}
          aria-pressed={selected === i}
          aria-label={`Inspect weight ${Math.floor(i / 4) + 1},${(i % 4) + 1}: ${n(w)}, reconstructed ${n(q.reconstructed[i])}`}
          onClick={() => onSelect(i)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(i);
            }
          }}
        >
          <rect
            x={32 + (i % 4) * 62}
            y={126 + Math.floor(i / 4) * 46}
            width="55"
            height="37"
            rx="3"
            fill={selected === i ? "#294455" : "#152b37"}
            stroke={selected === i ? BLUE : "#4c6777"}
          />
          <text
            x={59 + (i % 4) * 62}
            y={150 + Math.floor(i / 4) * 46}
            textAnchor="middle"
            className="sh-value"
          >
            {n(w)}
          </text>
          <rect
            x={447 + (i % 4) * 62}
            y={126 + Math.floor(i / 4) * 46}
            width="55"
            height="37"
            rx="3"
            fill={selected === i ? "#3a3027" : "#19272e"}
            stroke={selected === i ? AMBER : "#4c6777"}
          />
          <text
            x={474 + (i % 4) * 62}
            y={150 + Math.floor(i / 4) * 46}
            textAnchor="middle"
            className="sh-value"
            fill={AMBER}
          >
            {morph >= (i + 1) / 16 ? q.quantized[i] : "·"}
          </text>
        </g>
      ))}
      <Signal
        points={[
          [282, 212],
          [425, 212],
        ]}
        progress={morph}
      />
      <text x="353" y="184" textAnchor="middle" className="sh-small">
        s = {n(q.scale, 4)}
      </text>
      <text x="353" y="242" textAnchor="middle" className="sh-small">
        ÷ s → round
      </text>
      <text x="32" y="347" className="sh-label">
        Weight [{Math.floor(selected / 4) + 1}, {(selected % 4) + 1}] ·{" "}
        {n(original)} → {n(reconstructed)}
      </text>
      <path d="M40 398H744" stroke="#688394" />
      {[-1.8, -0.9, 0, 0.9, 1.8].map((tick) => (
        <g key={tick}>
          <path d={`M${vx(tick)} 393v10`} stroke="#688394" />
          <text x={vx(tick)} y="425" textAnchor="middle" className="sh-small">
            {tick}
          </text>
        </g>
      ))}
      <path
        d={`M${vx(original)} 379V397H${vx(original + (reconstructed - original) * morph)}V449`}
        stroke={RED}
        fill="none"
        strokeWidth="2"
      />
      <circle cx={vx(original)} cy="379" r="5" fill={BLUE} />
      <circle
        cx={vx(original + (reconstructed - original) * morph)}
        cy="449"
        r="5"
        fill={AMBER}
      />
      <text x="32" y="482" className="sh-small">
        Absolute error {n(Math.abs(q.error[selected]), 5)} · not a task-accuracy
        measurement
      </text>
      <text x="32" y="515" className="sh-small">
        Original: {q.sourceBytes} B
      </text>
      <rect
        x="32"
        y="526"
        width="384"
        height="17"
        fill={BLUE}
        fillOpacity=".6"
      />
      <text x="32" y="567" className="sh-small">
        INT{bits}: {q.payloadBytes} B payload + {q.scaleBytes} B scale
      </text>
      <rect
        x="32"
        y="578"
        width={q.payloadBytes * 6}
        height="17"
        fill={AMBER}
      />
      <rect
        x={32 + q.payloadBytes * 6}
        y="578"
        width="24"
        height="17"
        fill={VIOLET}
      />
      {ready && (
        <path
          d={`M${32 + q.totalBytes * 6} 602v8H416v-8M416 609H784V231H815`}
          stroke={VIOLET}
          strokeWidth="2"
          fill="none"
        />
      )}
      <Consequence
        title={["Storage shrinks.", "Values also move."]}
        metric={`−${q.sourceBytes - q.totalBytes}`}
        unit="B"
        caption={`stored, incl. scale (was ${q.sourceBytes} B)`}
        rows={[
          ["Weight storage", `${q.sourceBytes} → ${q.totalBytes} B`],
          ["Largest error", n(q.maxError, 4)],
          ["First-row dot", n(q.dot, 4)],
          ["Quantized dot", n(q.reconstructedDot, 4)],
        ]}
        notes={[]}
      />
    </g>
  );
}

function ModelTile({
  x,
  y,
  color,
  label,
}: {
  x: number;
  y: number;
  color: string;
  label: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width="217"
        height="133"
        rx="7"
        fill="#122a36"
        stroke={color}
      />
      <text x={x + 17} y={y + 27} className="sh-label">
        {label}
      </text>
      {Array.from({ length: 16 }, (_, i) => (
        <rect
          key={i}
          x={x + 18 + (i % 8) * 23}
          y={y + 49 + Math.floor(i / 8) * 25}
          width="17"
          height="18"
          fill={color}
          fillOpacity=".25"
          stroke={color}
        />
      ))}
      <text x={x + 17} y={y + 118} className="sh-small">
        full model · private KV pool
      </text>
    </g>
  );
}

function PlacementScene({
  topology,
  progress,
}: {
  topology: HardwareTopology;
  progress: number;
}) {
  if (topology === "tensor")
    return (
      <g>
        <text x="32" y="35" className="sh-subtitle">
          Tensor parallelism · partition one row’s input dimension
        </text>
        <text x="32" y="68" className="sh-small">
          Both devices cooperate on one dot product. The sum is required before
          continuing.
        </text>
        <Values values={tensor.input} x={32} y={302} width={37} />
        <text x="32" y="290" className="sh-label">
          x = [2, 1, 3, 4]
        </text>
        {[0, 1].map((i) => (
          <g key={i}>
            <Signal
              points={[
                [200, 317],
                [224, 317],
                [224, 195 + i * 208],
                [266, 195 + i * 208],
              ]}
              progress={progress * 3}
              color={i === 0 ? BLUE : GREEN}
            />
            <rect
              x="267"
              y={128 + i * 208}
              width="280"
              height="137"
              rx="7"
              fill="#142b36"
              stroke={i === 0 ? BLUE : GREEN}
            />
            <text x="287" y={157 + i * 208} className="sh-label">
              GPU {i + 1} · shard
            </text>
            <Values
              values={tensor.weights.slice(i * 2, i * 2 + 2)}
              x={287}
              y={172 + i * 208}
              width={45}
              color={i === 0 ? BLUE : GREEN}
            />
            <text x="287" y={239 + i * 208} className="sh-label">
              partial = {progress >= 0.35 ? tensor.partials[i] : "…"}
            </text>
            <Signal
              points={[
                [549, 196 + i * 208],
                [617, 196 + i * 208],
                [617, 300],
                [659, 300],
              ]}
              progress={(progress - 0.36) * 3}
            />
          </g>
        ))}
        {[0, 1].map((i) => (
          <g key={`return-${i}`}>
            <Signal
              points={
                i === 0
                  ? [
                      [734, 300],
                      [764, 300],
                      [764, 103],
                      [511, 103],
                      [511, 142],
                    ]
                  : [
                      [734, 300],
                      [764, 300],
                      [764, 497],
                      [511, 497],
                      [511, 466],
                    ]
              }
              progress={(progress - 0.7) / 0.2}
              color={VIOLET}
            />
            <rect
              x="442"
              y={145 + i * 208}
              width="85"
              height="35"
              rx="3"
              fill="#292540"
              stroke={VIOLET}
              opacity={progress >= 0.9 ? 1 : 0.25}
            />
            <text
              x="484"
              y={168 + i * 208}
              textAnchor="middle"
              className="sh-value"
              fill={VIOLET}
            >
              {progress >= 0.9 ? "Σ = 3" : "waiting"}
            </text>
          </g>
        ))}
        <circle cx="698" cy="300" r="36" fill="#3a3027" stroke={AMBER} />
        <text
          x="698"
          y="311"
          textAnchor="middle"
          className="sh-metric"
          fill={AMBER}
        >
          {progress >= 0.7 ? tensor.output : "Σ"}
        </text>
        <text x="590" y="552" className="sh-label" fill={AMBER}>
          all-reduce sum
        </text>
        <path
          d="M697 337V530H784V231H815"
          stroke={AMBER}
          fill="none"
          strokeWidth="2"
          opacity={progress >= 0.7 ? 1 : 0.2}
        />
        <text x="32" y="600" className="sh-label">
          4 + (−1) = 3 · the reduced result is available to both devices
        </text>
        <Consequence
          title={["One request.", "Two partial results."]}
          metric={progress >= 0.7 ? "3" : "Σ"}
          unit=""
          caption="reconstructed dot product"
          rows={[
            ["GPU 1 partial", "4"],
            ["GPU 2 partial", "−1"],
            ["Collective", "sum"],
          ]}
          notes={[]}
          color={AMBER}
        />
      </g>
    );
  if (topology === "pipeline") {
    const cursor = Math.min(5, progress * 6),
      slot = Math.floor(cursor);
    return (
      <g>
        <text x="32" y="35" className="sh-subtitle">
          Pipeline parallelism · three requests cross three layer groups
        </text>
        <text x="32" y="68" className="sh-small">
          Each column is a logical work slot. Empty stage-slots are fill and
          drain bubbles.
        </text>
        {[0, 1, 2].map((stage) => (
          <g key={stage}>
            <rect
              x="32"
              y={129 + stage * 133}
              width="182"
              height="94"
              rx="7"
              fill="#142b36"
              stroke={BLUE}
            />
            <text x="48" y={157 + stage * 133} className="sh-label">
              GPU {stage + 1} · layers
            </text>
            <text
              x="48"
              y={191 + stage * 133}
              className="sh-label"
              fill={pipeline.cells[stage][slot] ? GREEN : AMBER}
            >
              {pipeline.cells[stage][slot]
                ? `Request ${pipeline.cells[stage][slot]}`
                : cursor >= 5
                  ? "drained"
                  : "no work this slot"}
            </text>
            {stage < 2 && (
              <Signal
                points={[
                  [123, 225 + stage * 133],
                  [123, 259 + stage * 133],
                ]}
                progress={unit(cursor - stage - 1)}
              />
            )}
            {pipeline.cells[stage].map((request, col) => (
              <g key={col}>
                <rect
                  x={278 + col * 94}
                  y={137 + stage * 133}
                  width="82"
                  height="73"
                  rx="3"
                  fill={request ? REQUEST_COLORS[request - 1] : "#17212d"}
                  fillOpacity={request ? 0.1 : 1}
                  stroke={request ? REQUEST_COLORS[request - 1] : "#677079"}
                  strokeDasharray={request ? undefined : "4 4"}
                  opacity={col < cursor ? 1 : 0.4}
                />
                <text
                  x={319 + col * 94}
                  y={179 + stage * 133}
                  textAnchor="middle"
                  className="sh-small"
                  fill={request ? REQUEST_COLORS[request - 1] : AMBER}
                >
                  {request ? `Request ${request}` : "idle"}
                </text>
              </g>
            ))}
          </g>
        ))}
        <path
          d={`M${278 + cursor * 94} 117V493`}
          stroke={VIOLET}
          strokeWidth="2"
        />
        <Signal
          points={[
            [737, 440],
            [776, 440],
            [776, 231],
            [815, 231],
          ]}
          progress={unit(cursor - 4)}
          color={VIOLET}
        />
        {[1, 2, 3, 4, 5].map((i) => (
          <text
            key={i}
            x={319 + (i - 1) * 94}
            y="528"
            textAnchor="middle"
            className="sh-small"
          >
            slot {i}
          </text>
        ))}
        <text x="32" y="581" className="sh-label">
          9 busy stage-slots + 6 empty stage-slots = 15 available
        </text>
        <Consequence
          title={["Overlap requests.", "Keep bubbles visible."]}
          metric={String(Math.max(0, Math.min(3, slot - 2)))}
          unit="/ 3"
          caption="requests past the final stage"
          rows={[
            ["Busy stage-slots", "9"],
            ["Fill / drain slots", "6"],
            ["Layers per device", "different"],
          ]}
          notes={[]}
        />
      </g>
    );
  }
  if (topology === "moe")
    return (
      <g>
        <text x="32" y="35" className="sh-subtitle">
          Expert parallelism · a different, mixture-of-experts model
        </text>
        <text x="32" y="68" className="sh-small">
          Research branch. The dense-model request trace below does not become
          an MoE deployment.
        </text>
        <circle cx="74" cy="298" r="24" fill="#273045" stroke={VIOLET} />
        <text x="74" y="304" textAnchor="middle" className="sh-value">
          x
        </text>
        <Signal
          points={[
            [101, 298],
            [171, 298],
          ]}
          progress={1}
          color={VIOLET}
        />
        <rect
          x="173"
          y="250"
          width="144"
          height="94"
          rx="6"
          fill="#232b3b"
          stroke={VIOLET}
        />
        <text x="192" y="278" className="sh-label">
          top-2 router
        </text>
        <text x="192" y="310" className="sh-small">
          choose E1 + E3
        </text>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <Signal
              points={[
                [319, 298],
                [354, 298],
                [354, 148 + i * 110],
                [397, 148 + i * 110],
              ]}
              progress={i % 2 === 0 ? 1 : 0}
              color={VIOLET}
            />
            <rect
              x="399"
              y={119 + i * 110}
              width="151"
              height="59"
              rx="4"
              fill={i % 2 === 0 ? "#2c2840" : "#15252f"}
              stroke={i % 2 === 0 ? VIOLET : "#4c6777"}
            />
            <text x="414" y={140 + i * 110} className="sh-small">
              GPU {i < 2 ? 1 : 2} · expert {i + 1}
            </text>
            <text x="414" y={164 + i * 110} className="sh-label">
              {i === 0 ? "output 1.2" : i === 2 ? "output 2.4" : "not selected"}
            </text>
            {i % 2 === 0 && (
              <Signal
                points={[
                  [553, 148 + i * 110],
                  [593, 148 + i * 110],
                  [593, 299],
                  [652, 299],
                ]}
                progress={1}
                color={AMBER}
              />
            )}
          </g>
        ))}
        <text x="660" y="306" className="sh-metric" fill={GREEN}>
          1.5
        </text>
        <text x="32" y="588" className="sh-label">
          0.75 × 1.2 + 0.25 × 2.4 = 1.5 · illustrative scalar expert outputs
        </text>
        <Consequence
          title={["Route selected work.", "Combine outputs."]}
          metric="2"
          unit="/ 4"
          caption="experts selected in this example"
          rows={[
            ["E1 mixture weight", "0.75"],
            ["E3 mixture weight", "0.25"],
            ["Output", "1.5"],
          ]}
          notes={[]}
        />
      </g>
    );
  return (
    <g>
      <text x="32" y="35" className="sh-subtitle">
        Data parallel serving · independent model replicas
      </text>
      <text x="32" y="68" className="sh-small">
        Different requests can run on different full copies. Their outputs are
        not summed.
      </text>
      {[0, 1].map((i) => (
        <g key={i}>
          <circle
            cx="99"
            cy={199 + i * 245}
            r="25"
            fill="#142c38"
            stroke={i === 0 ? BLUE : GREEN}
          />
          <text
            x="99"
            y={205 + i * 245}
            textAnchor="middle"
            className="sh-value"
          >
            R{i + 1}
          </text>
          <Signal
            points={[
              [127, 199 + i * 245],
              [279, 199 + i * 245],
            ]}
            progress={progress * 2}
            color={i === 0 ? BLUE : GREEN}
          />
          <ModelTile
            x={283}
            y={133 + i * 245}
            color={i === 0 ? BLUE : GREEN}
            label={`GPU ${i + 1} · replica ${i + 1}`}
          />
          <Signal
            points={[
              [502, 199 + i * 245],
              [638, 199 + i * 245],
            ]}
            progress={(progress - 0.4) * 2}
            color={i === 0 ? BLUE : GREEN}
          />
          <text
            x="652"
            y={205 + i * 245}
            className="sh-label"
            fill={i === 0 ? BLUE : GREEN}
          >
            {progress >= 0.8 ? `answer ${i + 1}` : "…"}
          </text>
        </g>
      ))}
      <Consequence
        title={["Separate requests.", "Full model copies."]}
        metric="2"
        unit="requests"
        caption="independent serving paths"
        rows={[
          ["Model copies", "2"],
          ["KV ownership", "local"],
          ["Output collective", "none"],
        ]}
        notes={[]}
      />
    </g>
  );
}

function LifecycleScene({ frame }: { frame: ServingFrame }) {
  const before = servingOverviewFrame(82299, frame.route).pages.one,
    cancelled = frame.requests.D.phase === "cancelled";
  const owned = before
    .map((owner, i) => (owner === "D" ? i : -1))
    .filter((i) => i >= 0);
  const freeBefore = before.filter((p) => !p).length,
    freeNow = frame.pages.one.filter((p) => !p).length;
  return (
    <g>
      <text x="32" y="35" className="sh-subtitle">
        Request D cancels · release at a safe iteration boundary
      </text>
      <text x="32" y="68" className="sh-small">
        Return to the original serving trace. A running GPU kernel is not
        interrupted mid-instruction.
      </text>
      <circle cx="76" cy="152" r="27" fill="#2e293d" stroke={VIOLET} />
      <text x="76" y="159" textAnchor="middle" className="sh-label">
        D
      </text>
      <Signal
        points={[
          [107, 152],
          [246, 152],
          [246, 257],
        ]}
        progress={unit((frame.storyMs - 78000) / 4300)}
        color={RED}
      />
      <text
        x="147"
        y="131"
        className="sh-label"
        fill={cancelled ? RED : VIOLET}
      >
        {cancelled ? "cancellation observed" : "waiting for the safe boundary"}
      </text>
      <text x="340" y="243" className="sh-label">
        Before cancellation · replica 1
      </text>
      {[before, frame.pages.one].map((pages, row) => (
        <g key={row}>
          {pages.map((owner, i) => (
            <g key={i}>
              <rect
                x={32 + i * 91}
                y={270 + row * 176}
                width="77"
                height="71"
                rx="4"
                fill={
                  owner === "D"
                    ? "#302b41"
                    : owner === "B-prefix"
                      ? "#3a3026"
                      : "#132632"
                }
                stroke={
                  owner === "D"
                    ? VIOLET
                    : owner === "B-prefix"
                      ? AMBER
                      : "#506c7d"
                }
              />
              <text
                x={70 + i * 91}
                y={299 + row * 176}
                textAnchor="middle"
                className="sh-label"
                fill={
                  owner === "D" ? VIOLET : owner === "B-prefix" ? AMBER : GREEN
                }
              >
                {owner === "B-prefix" ? "B prefix" : (owner ?? "free")}
              </text>
              <text
                x={70 + i * 91}
                y={323 + row * 176}
                textAnchor="middle"
                className="sh-small"
              >
                page {i + 1}
              </text>
              {row === 0 && owner === "D" && (
                <Signal
                  points={[
                    [70 + i * 91, 344],
                    [70 + i * 91, 439],
                  ]}
                  progress={
                    cancelled ? unit((frame.storyMs - 82300) / 1300) : 0
                  }
                  color={GREEN}
                />
              )}
            </g>
          ))}
        </g>
      ))}
      <text x="340" y="420" className="sh-label">
        {cancelled ? "After cancellation" : "Before the safe boundary"}
      </text>
      {cancelled && (
        <path
          d={`M${32 + owned[0] * 91} 527v13H${109 + owned[owned.length - 1] * 91}v-13M${109 + owned[owned.length - 1] * 91} 534H784V231H815`}
          fill="none"
          stroke={VIOLET}
          strokeWidth="2"
        />
      )}
      <text x="32" y="588" className="sh-label" fill={AMBER}>
        B’s 2 prefix pages remain retained. No other request’s state is
        reclaimed.
      </text>
      <Consequence
        title={["Cancelled work stops.", "Its capacity returns."]}
        metric={String(cancelled ? owned.length : 0)}
        unit="pages"
        caption="released from request D"
        rows={[
          ["D-owned pages", cancelled ? "3 → 0" : "3"],
          ["Empty slots", `${freeBefore} → ${freeNow}`],
          ["B prefix retained", "2"],
        ]}
        notes={[]}
      />
    </g>
  );
}

export function ServingHardwareScenes({
  frame,
  bits,
  topology,
  selectedWeight,
  onWeight,
}: {
  frame: ServingFrame;
  bits: 4 | 8;
  topology: HardwareTopology | null;
  selectedWeight: number;
  onWeight: (index: number) => void;
}) {
  const id = useId(),
    f = hardwareFrame(frame.storyMs, topology);
  return (
    <svg
      className="sh-diagram"
      viewBox="0 0 1080 700"
      role="group"
      aria-labelledby={id}
      data-hardware={frame.beat}
      data-topology={f.topology}
    >
      <title id={id}>
        {frame.beat === "execution"
          ? "Pointwise fusion removes a temporary global-memory round trip"
          : frame.beat === "precision"
            ? "Weight precision reduces storage and changes reconstructed values"
            : frame.beat === "placement"
              ? `${f.topology} device placement`
              : "Cancellation releases only D-owned KV pages"}
      </title>
      {frame.beat === "execution" ? (
        <FusionScene progress={f.fusion} />
      ) : frame.beat === "precision" ? (
        <PrecisionScene
          bits={bits}
          progress={f.precision}
          selected={selectedWeight}
          onSelect={onWeight}
        />
      ) : frame.beat === "placement" ? (
        <PlacementScene topology={f.topology} progress={f.placement} />
      ) : (
        <LifecycleScene frame={frame} />
      )}
      <path d="M32 635H1048" stroke="#466073" />
      <text x="32" y="663" className="sh-small">
        Original trace
      </text>
      {(["A", "B", "C", "D"] as const).map((request, i) => (
        <g key={request}>
          <circle
            cx={235 + i * 211}
            cy="659"
            r="12"
            fill="#152733"
            stroke={SERVING_REQUESTS[request].color}
          />
          <text
            x={235 + i * 211}
            y="663"
            textAnchor="middle"
            className="sh-number"
            fill={SERVING_REQUESTS[request].color}
          >
            {request}
          </text>
          <text x={256 + i * 211} y="664" className="sh-small">
            {frame.requests[request].phase}
          </text>
        </g>
      ))}
    </svg>
  );
}
