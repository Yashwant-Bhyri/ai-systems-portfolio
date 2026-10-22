"use client";

import { useId, useState, type ReactNode } from "react";
import type { LabTask } from "./lab-simulation";
import { decodeAt, clamp01 } from "./inference-film-math";
import {
  machineState,
  TILE_INPUT,
  TILE_WEIGHTS,
  tileProjection,
} from "./execution-study-math";
import "./execution-machine.css";

type Part = "memory" | "compute" | "output" | "time";
const PARTS: { key: Part; label: string; title: string; detail: string }[] = [
  {
    key: "memory",
    label: "Read state",
    title: "The same weights. The same context.",
    detail:
      "Both lanes inherit the same prefix-reuse decision. Blue tiles represent weights; cyan pages represent KV state. Neither changes between runtimes. This comparison does not count another cache saving.",
  },
  {
    key: "compute",
    label: "Execute",
    title: "Advance the computation, not the policy.",
    detail:
      "The tile sweep represents repeated transformer execution: read state, compute, project a next-token distribution. Faster declared service rates complete that work sooner. Tile geometry is schematic, not a GPU profiler or a measured kernel attribution.",
  },
  {
    key: "output",
    label: "Emit tokens",
    title: "Autoregressive generation carries state forward.",
    detail:
      "Every emitted token extends the sequence. The return path represents that dependency. Each visible block is 1/32 of the output, not a single token. Both lanes have the same output count and modeled correctness; the pictured response is illustrative.",
  },
  {
    key: "time",
    label: "Compare clocks",
    title: "One clock makes the remaining work visible.",
    detail:
      "At optimized completion its worker is released. The baseline continues; its remaining interval is highlighted in red. These are isolated, one-worker service times, so the interval is also the busy GPU-work difference for this request. Queueing and cluster billing are not included.",
  },
];
const number = (n: number, digits = 0) =>
  n.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
const BLUE = "#9cc5f5",
  CYAN = "#78daca",
  GREEN = "#b8e986",
  AMBER = "#ffc267";
const CELLS = Array.from({ length: 48 }, (_, i) => i);
const BLOCKS = Array.from({ length: 32 }, (_, i) => i);

function TileArithmetic() {
  const [row, setRow] = useState(0);
  const [terms, setTerms] = useState(4);
  const id = useId();
  const projection = tileProjection(row, terms);
  const sign = (value: number) => (value < 0 ? `(${value})` : String(value));
  return (
    <div className="em-arithmetic">
      <svg viewBox="0 0 780 250" role="img" aria-labelledby={id}>
        <title id={id}>
          Exact matrix-vector teaching example. Selected output row {row + 1};{" "}
          {terms} of four products accumulated; partial sum {projection.partial}
          . The weights do not change.
        </title>
        <text x="20" y="24" className="em-mono" fill={BLUE}>
          W · frozen weights
        </text>
        <text x="230" y="24" className="em-mono" fill={CYAN}>
          x · activation
        </text>
        <text x="393" y="24" className="em-mono" fill={AMBER}>
          multiply → accumulate
        </text>
        <text x="688" y="24" className="em-mono" fill={GREEN}>
          y = Wx
        </text>
        {TILE_WEIGHTS.map((weights, i) => (
          <g key={i}>
            <rect
              x="16"
              y={43 + i * 32}
              width="147"
              height="29"
              rx="3"
              fill={BLUE}
              opacity={row === i ? 0.14 : 0.025}
            />
            {weights.map((w, j) => (
              <text
                key={j}
                x={35 + j * 34}
                y={63 + i * 32}
                textAnchor="middle"
                className="em-mono"
                fill={BLUE}
                opacity={row === i ? 1 : 0.35}
              >
                {w}
              </text>
            ))}
          </g>
        ))}
        <text
          x="193"
          y="115"
          textAnchor="middle"
          className="em-lane-name"
          fill="#d7e5ed"
        >
          ×
        </text>
        {TILE_INPUT.map((value, i) => (
          <g key={i}>
            <rect
              x="245"
              y={43 + i * 32}
              width="38"
              height="29"
              rx="3"
              fill={CYAN}
              opacity={i < terms ? 0.13 : 0.025}
            />
            <text
              x="264"
              y={63 + i * 32}
              textAnchor="middle"
              className="em-mono"
              fill={CYAN}
            >
              {value}
            </text>
            <path
              d={`M290 ${58 + i * 32}H322Q338 ${58 + i * 32} 353 ${56 + i * 32}H382`}
              fill="none"
              stroke={CYAN}
              strokeOpacity={i < terms ? 0.7 : 0.15}
            />
            <text
              x="395"
              y={63 + i * 32}
              className="em-mono"
              fill={i < terms ? AMBER : "#899eb0"}
            >
              {sign(TILE_WEIGHTS[row][i])} × {sign(value)} ={" "}
              {projection.products[i]}
            </text>
          </g>
        ))}
        <path
          d="M542 48H553V159H542M553 104H581"
          fill="none"
          stroke={AMBER}
          strokeOpacity=".65"
        />
        <circle
          cx="613"
          cy="104"
          r="29"
          fill="#172b31"
          stroke={AMBER}
          strokeOpacity=".6"
        />
        <text
          x="613"
          y="110"
          textAnchor="middle"
          className="em-lane-name"
          fill={AMBER}
        >
          {projection.partial}
        </text>
        <text x="613" y="154" textAnchor="middle" className="em-small">
          {terms === 4 ? "complete" : `${terms}/4 terms`}
        </text>
        <path
          d={`M642 104H660V${58 + row * 32}H690`}
          fill="none"
          stroke={GREEN}
          strokeOpacity={terms === 4 ? 0.8 : 0.15}
        />
        {projection.output.map((value, i) => (
          <g key={i}>
            <rect
              x="696"
              y={43 + i * 32}
              width="43"
              height="29"
              rx="3"
              fill={GREEN}
              opacity={row === i ? 0.18 : 0.035}
            />
            <text
              x="717"
              y={63 + i * 32}
              textAnchor="middle"
              className="em-mono"
              fill={GREEN}
              opacity={row === i ? 1 : 0.4}
            >
              {row === i && terms < 4 ? "…" : value}
            </text>
          </g>
        ))}
        <text x="20" y="207" className="em-mono" fill="#d7e5ed">
          y{row + 1} = Σⱼ W{row + 1}ⱼ xⱼ = {projection.output[row]}
        </text>
        <text x="20" y="234" className="em-small">
          Same arithmetic in both lanes. The execution time differs; the weights
          are not updated.
        </text>
      </svg>
      <div className="em-arithmetic-controls">
        <div role="group" aria-label="Select a projection output row">
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              type="button"
              aria-pressed={row === i}
              onClick={() => setRow(i)}
            >
              y{i + 1}
            </button>
          ))}
        </div>
        <label>
          Accumulate terms{" "}
          <input
            type="range"
            min="0"
            max="4"
            step="1"
            value={terms}
            onChange={(e) => setTerms(Number(e.target.value))}
            aria-label="Accumulate matrix-vector products"
          />
        </label>
      </div>
      <p>
        Small integer example, not checkpoint weights. A transformer repeats
        operations of this kind across layers; attention and token selection are
        outside this close-up.
      </p>
    </div>
  );
}

function Lens({
  part,
  label,
  selected,
  inspect,
  children,
}: {
  part: Part;
  label: string;
  selected: Part | null;
  inspect: (part: Part) => void;
  children: ReactNode;
}) {
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={selected === part}
      className="em-lens"
      data-part={part}
      data-selected={selected === part}
      onClick={() => inspect(part)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inspect(part);
        }
      }}
    >
      {children}
    </g>
  );
}

function EngineLane({
  task,
  reference,
  optimized,
  row,
  time,
  selected,
  inspect,
}: {
  task: LabTask;
  reference: LabTask;
  optimized: LabTask;
  row: number;
  time: number;
  selected: Part | null;
  inspect: (part: Part) => void;
}) {
  const s = machineState(task, time);
  const residual = row === 0 && time >= optimized.gpuSeconds && !s.done;
  const color = residual ? AMBER : row ? GREEN : BLUE;
  const label = row ? "Optimized" : "Baseline";
  const y = row * 181;
  const stage = s.prefill ? "prefill" : s.done ? "released" : "decode";
  const activity = s.active ? 1 : 0;
  const cycle = s.prefill ? time / Math.max(0.001, task.prefill) : s.cycle % 1;
  return (
    <g
      transform={`translate(0 ${y})`}
      data-lane={row ? "optimized" : "reference"}
      data-state={stage}
    >
      <text x="30" y="41" className="em-lane-name" fill={color}>
        {label}
      </text>
      <text
        x="865"
        y="41"
        textAnchor="end"
        className="em-mono"
        fill={s.done ? GREEN : color}
      >
        {s.done
          ? "✓ answer complete"
          : `${number(s.tokens)} / ${number(task.tokens)} tokens`}
      </text>

      <Lens
        part="memory"
        label={`Inspect ${label.toLowerCase()} memory state`}
        selected={selected}
        inspect={inspect}
      >
        <rect
          x="28"
          y="59"
          width="166"
          height="105"
          rx="6"
          className="em-hit"
        />
        <text x="40" y="77" className="em-small">
          WEIGHTS / KV STATE
        </text>
        <path
          d="M41 87H115L123 94V137H49L41 130Z"
          fill="#152b3c"
          stroke="#45617a"
        />
        <path d="M41 87L49 94H123M49 94V137" fill="none" stroke="#45617a" />
        {Array.from({ length: 24 }, (_, i) => (
          <rect
            key={i}
            x={56 + (i % 6) * 9}
            y={101 + Math.floor(i / 6) * 8}
            width="6"
            height="5"
            rx=".7"
            fill={BLUE}
            opacity={0.24 + ((i * 7) % 9) * 0.055}
          />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <g
            key={i}
            transform={`translate(${138 + (i % 2) * 21} ${91 + Math.floor(i / 2) * 25})`}
          >
            <rect
              width="15"
              height="19"
              rx="2"
              fill="#173b3c"
              stroke={CYAN}
              strokeOpacity=".6"
            />
            <path d="M4 5H11M4 9H11M4 13H8" stroke={CYAN} strokeOpacity=".7" />
          </g>
        ))}
        <text
          x="40"
          y="153"
          className="em-small"
          fill={s.done ? "#b0c1d0" : CYAN}
        >
          {s.done ? "state retained" : "same checkpoint + context"}
        </text>
      </Lens>

      {/* State moves through two buses into one representative compute tile. */}
      <g fill="none" stroke={color}>
        <path d="M194 101H213Q228 101 228 114V120H269" opacity=".24" />
        <path d="M194 137H218Q237 137 237 126V120H269" opacity=".24" />
        <path
          d="M194 101H213Q228 101 228 114V120H269"
          strokeWidth="2"
          strokeDasharray="9 76"
          strokeDashoffset={-cycle * 85}
          opacity={activity * 0.85}
        />
        <path
          d="M194 137H218Q237 137 237 126V120H269"
          strokeWidth="2"
          strokeDasharray="7 80"
          strokeDashoffset={-cycle * 87 - 25}
          opacity={activity * 0.7}
        />
      </g>

      <Lens
        part="compute"
        label={`Inspect ${label.toLowerCase()} GPU computation`}
        selected={selected}
        inspect={inspect}
      >
        <rect
          x="263"
          y="59"
          width="289"
          height="105"
          rx="6"
          className="em-hit"
        />
        {/* Three shallow silicon planes preserve the physical compute hierarchy. */}
        <path
          d="M281 83H523L537 96V143H295L281 130Z"
          fill="#11232e"
          stroke={color}
          strokeOpacity={s.done ? 0.2 : 0.45}
        />
        <path
          d="M281 83L295 96H537M295 96V143"
          fill="none"
          stroke={color}
          strokeOpacity=".2"
        />
        <rect
          x="289"
          y="72"
          width="237"
          height="65"
          rx="3"
          fill="#0d1b25"
          stroke={color}
          strokeOpacity={s.done ? 0.2 : 0.65}
        />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <path
            key={i}
            d={`M${303 + i * 27} 67v5M${303 + i * 27} 137v5`}
            stroke={color}
            strokeOpacity=".42"
          />
        ))}
        {CELLS.map((i) => {
          const col = i % 12,
            line = Math.floor(i / 12);
          const wave = Math.max(
            0,
            1 - Math.abs((col + line * 0.8) / 14.4 - cycle) * 4,
          );
          return (
            <rect
              key={i}
              x={300 + col * 18}
              y={81 + line * 12}
              width="13"
              height="7"
              rx="1"
              fill={color}
              opacity={s.done ? 0.09 : 0.13 + wave * 0.78 * activity}
            />
          );
        })}
        <text
          x="407"
          y="155"
          textAnchor="middle"
          className="em-small"
          fill={s.done ? GREEN : color}
        >
          {s.done
            ? "worker released"
            : s.prefill
              ? "build prompt state"
              : residual
                ? "still executing the same answer"
                : "read → compute → project"}
        </text>
        {s.done && (
          <g>
            <rect
              x="360"
              y="86"
              width="94"
              height="33"
              rx="3"
              fill="#0d1b25"
              stroke={GREEN}
              strokeOpacity=".55"
            />
            <path
              d="M373 102l4 4 7-9"
              fill="none"
              stroke={GREEN}
              strokeWidth="1.5"
            />
            <text x="396" y="106" className="em-mono" fill={GREEN}>
              free
            </text>
          </g>
        )}
      </Lens>

      <g stroke={color} fill="none">
        <path d="M552 120H609" opacity=".3" />
        <path
          d="M552 120H609"
          strokeWidth="2"
          strokeDasharray="7 54"
          strokeDashoffset={-cycle * 61}
          opacity={activity}
        />
        <path d="M602 116l7 4-7 4" opacity=".6" />
        {/* Return path: next decode step depends on the extended sequence. */}
        <path
          d="M645 153V173H407V163"
          strokeDasharray="3 4"
          opacity={s.done ? 0.12 : 0.28}
        />
        <circle
          cx={645 - 238 * cycle}
          cy="173"
          r="2.5"
          fill={color}
          stroke="none"
          opacity={!s.prefill ? activity : 0}
        />
      </g>

      <Lens
        part="output"
        label={`Inspect ${label.toLowerCase()} emitted tokens`}
        selected={selected}
        inspect={inspect}
      >
        <rect
          x="614"
          y="59"
          width="255"
          height="105"
          rx="6"
          className="em-hit"
        />
        <text x="627" y="77" className="em-small">
          OUTPUT SEQUENCE
        </text>
        {BLOCKS.map((i) => {
          const amount = clamp01(s.fraction * 32 - i);
          const tail =
            row === 0 &&
            i / 32 >=
              decodeAt(reference, optimized.gpuSeconds) / reference.tokens;
          return (
            <g key={i}>
              <rect
                x={627 + (i % 16) * 14}
                y={90 + Math.floor(i / 16) * 24}
                width="10"
                height="17"
                rx="1.5"
                fill={color}
                opacity=".08"
              />
              <rect
                x={627 + (i % 16) * 14}
                y={90 + Math.floor(i / 16) * 24}
                width={10 * amount}
                height="17"
                rx="1.5"
                fill={tail ? AMBER : row ? GREEN : BLUE}
                opacity=".85"
              />
            </g>
          );
        })}
        <text
          x="627"
          y="153"
          className="em-small"
          fill={s.done ? GREEN : "#b0c1d0"}
        >
          {s.done
            ? "32 / 32 output groups"
            : `group ${Math.min(32, Math.floor(s.fraction * 32) + 1)} of 32 · ${stage}`}
        </text>
      </Lens>
    </g>
  );
}

export function ExecutionMachine({
  reference,
  optimized,
  time,
  onInspect,
}: {
  reference: LabTask;
  optimized: LabTask;
  time: number;
  onInspect: () => void;
}) {
  const id = useId();
  const [selected, setSelected] = useState<Part | null>(null);
  const [preview, setPreview] = useState<Part | null>(null);
  const inspect = (part: Part) => {
    setSelected(part);
    onInspect();
  };
  const released = time >= optimized.gpuSeconds;
  const finished = time >= reference.gpuSeconds;
  const x = (t: number) => 197 + (t / reference.gpuSeconds) * 641;
  const detail = PARTS.find((p) => p.key === (preview ?? selected));
  return (
    <div
      className="em-machine"
      data-focus={preview ?? selected ?? "none"}
      onPointerOver={(event) => {
        const target = event.target;
        if (target instanceof Element) {
          const part = target.closest("[data-part]")?.getAttribute("data-part");
          setPreview(PARTS.some((p) => p.key === part) ? (part as Part) : null);
        }
      }}
      onPointerLeave={() => setPreview(null)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setSelected(null);
      }}
    >
      <svg
        viewBox="0 0 900 506"
        role="group"
        aria-labelledby={id}
        className="em-svg"
      >
        <title id={id}>
          Inside request Q{reference.id + 1}: matched memory state feeds two GPU
          execution lanes and identical output counts. Optimized finishes first;
          reference work continues after release. Schematic hardware, calculated
          service clock.
        </title>
        <path d="M30 195H870" stroke="#30414e" strokeOpacity=".6" />
        <EngineLane
          task={reference}
          reference={reference}
          optimized={optimized}
          row={0}
          time={time}
          selected={selected}
          inspect={inspect}
        />
        <EngineLane
          task={optimized}
          reference={reference}
          optimized={optimized}
          row={1}
          time={time}
          selected={selected}
          inspect={inspect}
        />
        <Lens
          part="time"
          label="Inspect the shared service clock"
          selected={selected}
          inspect={inspect}
        >
          <rect
            x="28"
            y="380"
            width="841"
            height="91"
            rx="5"
            className="em-hit"
          />
          <text x="40" y="403" className="em-small">
            ELAPSED TIME
          </text>
          <text x="40" y="424" className="em-mono" fill="#d7e5ed">
            {number(time, 2)} s
          </text>
          {[reference, optimized].map((task, row) => (
            <g key={row}>
              <path
                d={`M197 ${402 + row * 17}H${x(task.gpuSeconds)}`}
                stroke={row ? GREEN : BLUE}
                opacity=".15"
                strokeWidth="5"
              />
              <path
                d={`M197 ${402 + row * 17}H${x(Math.min(time, task.gpuSeconds))}`}
                stroke={row ? GREEN : BLUE}
                strokeWidth="3"
              />
            </g>
          ))}
          {released && (
            <g>
              <rect
                x={x(optimized.gpuSeconds) - 5}
                y="387"
                width={838 - x(optimized.gpuSeconds) + 10}
                height="53"
                rx="3"
                fill="#ff9185"
                fillOpacity=".13"
              />
              <path
                d={`M${x(optimized.gpuSeconds)} 402H${x(Math.min(time, reference.gpuSeconds))}`}
                stroke="#ff9185"
                strokeWidth="7"
              />
              <path
                d={`M${x(optimized.gpuSeconds)} 427v8H838v-8`}
                fill="none"
                stroke="#ff9185"
                strokeWidth="3"
              />
              <text
                x="197"
                y="458"
                textAnchor="start"
                className="em-mono"
                fill="#ffb3a9"
              >
                Δ {number(reference.gpuSeconds - optimized.gpuSeconds, 2)} GPU-s saved per request
              </text>
            </g>
          )}
          <path
            d={`M${x(Math.min(time, reference.gpuSeconds))} 393v32`}
            stroke="#e8f1f6"
            strokeOpacity=".7"
          />
          {!released && <text x="197" y="458" className="em-small">
            0
          </text>}
          <text x="838" y="458" textAnchor="end" className="em-small">
            {number(reference.gpuSeconds, 2)} s
          </text>
        </Lens>
        <text x="40" y="492" className="em-small" fill={released ? "#e5d2ef" : "#bacbda"}>
          {released ? finished ? "Faster prefill + decode · same cache reuse and answer tokens" : "Red: baseline still running after optimized completion. Faster prefill + decode; same cache reuse." : "Prefill + decode execution · one worker per lane"}
        </text>
      </svg>
      <details className="em-inspection" open={!!selected}>
        <summary>Inspect the machine</summary>
        <nav aria-label="Inspect execution machinery">
          {PARTS.map((part) => (
            <button
              key={part.key}
              type="button"
              data-part={part.key}
              aria-pressed={selected === part.key}
              onClick={() => inspect(part.key)}
            >
              {part.label}
            </button>
          ))}
        </nav>
        {detail && (
          <div className="em-detail" aria-live="polite">
            <strong>{detail.title}</strong>
            <p>{detail.detail}</p>
          </div>
        )}
        {selected === "compute" && (
          <details
            className="em-math-disclosure"
            onToggle={(event) => {
              if (event.currentTarget.open) onInspect();
            }}
          >
            <summary>
              Open the tile arithmetic <span>W × x → y</span>
            </summary>
            <TileArithmetic />
          </details>
        )}
      </details>
    </div>
  );
}
