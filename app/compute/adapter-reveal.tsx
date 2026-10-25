"use client";

import { useId, useRef, useState } from "react";
import {
  adapterOutput,
  adapterSnapshots,
  adapterRecord,
  TOY_TARGET,
  TOY_W,
} from "./policy-film-math";
import {
  ADAPTER_DURATION,
  ADAPTER_LABELS,
  ADAPTER_MOMENTS,
  adapterDirection,
} from "./adapter-study";
import { useFilmTime } from "./use-film-time";
import "./adapter-reveal.css";

const FRAMES = adapterSnapshots();
const ROSE = "#f3a0bc",
  BLUE = "#78a8ff",
  GREEN = "#b8e986",
  INK = "#e6edf2";
const fmt = (n: number) => (Math.abs(n) < 0.0005 ? 0 : n).toFixed(3);
const signed = (n: number) => `${n >= 0 ? "+" : "−"}${fmt(Math.abs(n))}`;
const NARRATIVE = [
  [
    "Keep W. Learn an adapter.",
    "B starts at zero, so the adapter initially changes nothing.",
  ],
  [
    "The first gradient changes B.",
    "A receives zero gradient on the first step because B is zero.",
  ],
  [
    "Now both factors can change.",
    "A compresses the input into two values; B maps them back to six outputs.",
  ],
  [
    "Follow the output, not just the weights.",
    "Select an output to trace its adapter row and remaining error.",
  ],
  [
    "Teach the missing operation.",
    "In language SFT, the demonstrated answer supplies the token targets.",
  ],
];

function Matrix({
  values,
  x,
  y,
  selected,
  name,
  fixed = false,
}: {
  values: number[][];
  x: number;
  y: number;
  selected?: number;
  name: string;
  fixed?: boolean;
}) {
  return (
    <g role="group" aria-label={name}>
      {values.flatMap((row, r) =>
        row.map((v, c) => (
          <rect
            key={`${r}-${c}`}
            x={x + c * 20}
            y={y + r * 20}
            width="15"
            height="15"
            rx="2"
            fill={v < 0 ? BLUE : ROSE}
            fillOpacity={0.14 + Math.min(0.8, Math.abs(v) * 2.6)}
            stroke={selected === r ? INK : fixed ? "#627589" : "#3b4b5c"}
            strokeWidth={selected === r ? 1.5 : 0.6}
            opacity={selected === undefined || selected === r ? 1 : 0.35}
          />
        )),
      )}
      {selected !== undefined && (
        <path
          d={`M${x - 6} ${y + selected * 20 - 3}h${values[0].length * 20 + 7}v21h-${values[0].length * 20 + 7}Z`}
          fill="none"
          stroke={ROSE}
          strokeOpacity=".65"
        />
      )}
    </g>
  );
}

export function AdapterReveal({
  playing,
  reduced,
  readTime,
  onSeek,
  onToggle,
}: {
  playing: boolean;
  reduced: boolean;
  readTime: () => number;
  onSeek: (time: number) => void;
  onToggle: () => void;
}) {
  const film = useFilmTime(
    readTime,
    playing,
    reduced,
    ADAPTER_DURATION,
    onSeek,
  );
  const direction = adapterDirection(film.time);
  const [selected, setSelected] = useState(0);
  const [preview, setPreview] = useState<number | null>(null);
  const row = preview ?? selected;
  const output = adapterOutput(direction.position, row),
    f = output.frame;
  const id = useId(),
    scroller = useRef<HTMLDivElement>(null);
  const example = direction.beat === 4;
  const exampleOpacity = reduced ? Number(example) : direction.example;
  const exampleAccessible = example && (reduced || direction.example >= 0.5);
  const choose = (n: number) => {
    setSelected(n);
    setPreview(null);
    film.seek(film.time);
  };
  const seek = (time: number) => {
    setPreview(null);
    film.seek(time);
  };
  const x = (value: number) => 722 + ((value + 0.85) / 1.85) * 246;
  const baseOutput = FRAMES[0].output;
  const chartY = 104 + row * 33;
  const lossY = (value: number) => 357 - (value / FRAMES[0].loss) * 46;
  const lossPath = [
    ...FRAMES.slice(0, Math.floor(direction.position) + 1).map(
      (frame, i) => `${i ? "L" : "M"}${376 + i * 43} ${lossY(frame.loss)}`,
    ),
    `L${376 + direction.position * 43} ${lossY(f.loss)}`,
  ].join(" ");
  const prompt = "first_item([]) crashes. Fix it.";
  return (
    <section
      className="ar-root"
      data-time={direction.time}
      data-beat={direction.beat}
      data-position={direction.position}
      data-output={row}
      data-loss={f.loss}
      aria-label="SFT and low-rank adapter investigation"
    >
      <header className="ar-heading">
        <div>
          <h3>SFT with low-rank adapters</h3>
          <p>{NARRATIVE[direction.beat][1]}</p>
        </div>
        <span>
          {example ? "Demonstrated answer" : "6-value calculation"}
          <small>
            {example
              ? "Language-training illustration"
              : "Exact arithmetic · squared-error loss"}
          </small>
        </span>
      </header>
      <nav className="ar-moments" aria-label="Adapter investigation moments">
        {ADAPTER_LABELS.map((label, i) => (
          <button
            type="button"
            key={label}
            aria-current={direction.beat === i ? "step" : undefined}
            onClick={() => seek(ADAPTER_MOMENTS[i])}
          >
            <span>{i + 1}</span>
            {label}
          </button>
        ))}
      </nav>
      <div
        className="ar-inspect"
        aria-hidden={example}
        inert={example}
        role="group"
        aria-label="Select an output coordinate"
      >
        <span>Trace output</span>
        {TOY_TARGET.map((_, i) => (
          <button
            type="button"
            key={i}
            aria-pressed={selected === i}
            onPointerEnter={() => setPreview(i)}
            onPointerLeave={() => setPreview(null)}
            onFocus={() => setPreview(i)}
            onBlur={() => setPreview(null)}
            onClick={() => choose(i)}
          >
            y<sub>{i + 1}</sub>
          </button>
        ))}
        <small>Matrix row → adapter contribution → error</small>
      </div>
      <div
        className="ar-pan"
        aria-hidden={example}
        inert={example}
        role="group"
        aria-label="Diagram regions"
      >
        <span>Inspect diagram</span>
        <button
          type="button"
          onClick={() =>
            scroller.current?.scrollTo({
              left: 0,
              behavior: reduced ? "instant" : "smooth",
            })
          }
        >
          Weights
        </button>
        <button
          type="button"
          onClick={() =>
            scroller.current?.scrollTo({
              left: 1000,
              behavior: reduced ? "instant" : "smooth",
            })
          }
        >
          Output errors →
        </button>
      </div>
      <div className="ar-stage">
        <div
          className="ar-math"
          aria-hidden={exampleAccessible}
          inert={exampleAccessible}
          style={{ opacity: 1 - exampleOpacity }}
        >
          <div
            className="ar-scroll"
            ref={scroller}
            tabIndex={0}
            role="region"
            aria-label="Adapter computation, horizontally scrollable on small screens"
          >
            <svg
              className="ar-diagram"
              viewBox="0 0 1000 425"
              role="img"
              aria-labelledby={`${id}-title ${id}-desc`}
            >
              <title id={`${id}-title`}>
                Frozen weights plus a rank-two adapter, linked to output{" "}
                {row + 1}.
              </title>
              <desc id={`${id}-desc`}>
                The selected output changes from {fmt(output.base)} to{" "}
                {fmt(output.adapted)} toward target {fmt(output.target)}. Its
                absolute error changes from {fmt(output.beforeError)} to{" "}
                {fmt(output.afterError)}. The base weights are unchanged.
              </desc>
              <text x="24" y="29" className="ar-section">
                Frozen base
              </text>
              <text x="213" y="29" className="ar-section">
                Trainable adapter
              </text>
              <text x="678" y="29" className="ar-section">
                Same six output coordinates
              </text>
              <path d="M645 18V398" stroke="#304354" />
              <text x="28" y="72" className="ar-label">
                W · 6 × 6
              </text>
              <Matrix
                values={TOY_W}
                x={28}
                y={90}
                name="Unchanged base weight matrix"
                selected={row}
                fixed
              />
              <text x="28" y="230" className="ar-small">
                36 weights frozen
              </text>
              <text x="173" y="155" className="ar-op">
                +
              </text>
              <text x="215" y="72" className="ar-label">
                B · 6 × 2
              </text>
              <Matrix
                values={f.b}
                x={215}
                y={90}
                name="Adapter B"
                selected={row}
              />
              <text x="278" y="155" className="ar-op">
                ×
              </text>
              <text x="316" y="72" className="ar-label">
                A · 2 × 6
              </text>
              <Matrix values={f.a} x={316} y={130} name="Adapter A" />
              <text x="316" y="194" className="ar-small">
                {direction.beat === 0
                  ? "A initialized"
                  : direction.beat === 1
                    ? "∇A = 0 on step 1"
                    : "∇A now nonzero"}
              </text>
              <text x="215" y="230" className="ar-small">
                24 trainable values · rank ≤ 2
              </text>
              <text x="457" y="155" className="ar-op">
                =
              </text>
              <text x="494" y="72" className="ar-label">
                W + BA
              </text>
              <Matrix
                values={TOY_W.map((r, i) => r.map((v, j) => v + f.delta[i][j]))}
                x={494}
                y={90}
                name="Adapted weight matrix"
                selected={row}
              />
              <text x="494" y="230" className="ar-small">
                Base + learned change
              </text>
              <path
                d={`M616 ${97.5 + row * 20}H632V${chartY - 11}H${Math.min(x(output.base), x(output.adapted)) - 12}V${chartY}h5`}
                fill="none"
                stroke={ROSE}
                strokeWidth="1.5"
              />
              <g className="ar-key">
                <circle
                  cx="683"
                  cy="58"
                  r="4"
                  fill="#101c26"
                  stroke="#b2bfcc"
                />
                <text x="694" y="62">
                  Base
                </text>
                <circle cx="755" cy="58" r="4" fill={ROSE} />
                <text x="766" y="62">
                  Adapted
                </text>
                <path d="M856 52v12" stroke={GREEN} strokeWidth="2" />
                <text x="866" y="62">
                  Target
                </text>
              </g>
              {[-0.5, 0, 0.5, 1].map((tick) => (
                <g key={tick}>
                  <path
                    d={`M${x(tick)} 82V285`}
                    stroke="#243747"
                    strokeDasharray={tick === 0 ? undefined : "2 5"}
                  />
                  <text
                    x={x(tick)}
                    y="307"
                    textAnchor="middle"
                    className="ar-small"
                  >
                    {tick}
                  </text>
                </g>
              ))}
              {TOY_TARGET.map((target, i) => {
                const y = 104 + i * 33,
                  active = row === i;
                return (
                  <g key={i} data-output-row={i}>
                    <text x="679" y={y + 4} className="ar-small">
                      y{i + 1}
                    </text>
                    <g opacity={active ? 1 : 0.43}>
                      <path
                        d={`M${x(baseOutput[i])} ${y}H${x(f.output[i])}`}
                        stroke={ROSE}
                        strokeWidth={active ? 4 : 2}
                      />
                      <path
                        d={`M${x(f.output[i])} ${y}H${x(target)}`}
                        stroke={GREEN}
                        strokeOpacity=".55"
                        strokeDasharray="2 4"
                      />
                      <circle
                        cx={x(baseOutput[i])}
                        cy={y}
                        r="4"
                        fill="#0d1b26"
                        stroke="#b2bfcc"
                      />
                      <path
                        d={`M${x(target)} ${y - 8}v16`}
                        stroke={GREEN}
                        strokeWidth="2"
                      />
                      <circle
                        cx={x(f.output[i])}
                        cy={y}
                        r={active ? 6 : 4}
                        fill={ROSE}
                      />
                    </g>
                  </g>
                );
              })}
              <path d="M24 256H616" stroke="#304354" />
              <text x="28" y="280" className="ar-small">
                SELECTED OUTPUT y{row + 1}
              </text>
              <text x="28" y="309" className="ar-formula">
                Wx + B(Ax)
              </text>
              <text x="28" y="337" className="ar-small">
                {fmt(output.base)} {signed(output.terms[0])}{" "}
                {signed(output.terms[1])}
              </text>
              <text x="28" y="370" className="ar-value">
                = {fmt(output.adapted)}
              </text>
              <text x="28" y="396" className="ar-small">
                Two rank channels; one output.
              </text>
              <text x="362" y="280" className="ar-small">
                LOSS · ½ Σ ERROR²
              </text>
              <path d="M376 307V360H560" fill="none" stroke="#3d5061" />
              <path
                d={FRAMES.map(
                  (v, i) => `${i ? "L" : "M"}${376 + i * 43} ${lossY(v.loss)}`,
                ).join(" ")}
                fill="none"
                stroke="#566776"
                strokeDasharray="2 5"
              />
              <path d={lossPath} fill="none" stroke={ROSE} strokeWidth="2" />
              <circle
                cx={376 + direction.position * 43}
                cy={lossY(f.loss)}
                r="4"
                fill={ROSE}
              />
              <text x="376" y="380" className="ar-small">
                0
              </text>
              <text x="548" y="380" textAnchor="end" className="ar-small">
                4 updates
              </text>
              <text x="376" y="402" className="ar-small">
                {fmt(FRAMES[0].loss)} → {fmt(f.loss)}
              </text>
              <g
                opacity={direction.comparison}
                aria-hidden={direction.comparison === 0}
              >
                <path
                  d={`M${x(f.output[row])} ${chartY + 10}v8H${x(output.target)}v-8`}
                  fill="none"
                  stroke={GREEN}
                  strokeWidth="2"
                />
                <path
                  d={`M${x(output.target)} ${chartY + 18}H982V319H699V333`}
                  fill="none"
                  stroke={GREEN}
                  strokeOpacity=".65"
                />
                <text x="714" y="343" className="ar-small">
                  y{row + 1} · absolute error
                </text>
                <text x="714" y="378" className="ar-value">
                  {fmt(output.beforeError)}{" "}
                  <tspan fill={GREEN}>→ {fmt(output.afterError)}</tspan>
                </text>
                <text x="714" y="403" className="ar-small">
                  Remaining error stays visible.
                </text>
              </g>
            </svg>
          </div>
        </div>
        <div
          className="ar-example"
          aria-hidden={!exampleAccessible}
          inert={!exampleAccessible}
          style={{ opacity: exampleOpacity }}
        >
          <div className="ar-example-context">
            <span>Prompt context</span>
            <p>“{prompt}”</p>
            <small>
              Provided to the model, excluded from this example’s answer-token
              loss.
            </small>
          </div>
          <div className="ar-demonstration">
            <h4>Supervise the complete answer</h4>
            <p>Each next token is learned from the demonstrated prefix.</p>
            <div className="ar-token-sequence">
              {["def first_item(xs):", "if not xs: return None", "return xs[0]"].map(
                (group, i) => (
                  <div
                    key={group}
                    data-reached={direction.targetProgress >= i / 3}
                    data-current={
                      Math.min(2, Math.floor(direction.targetProgress * 3)) ===
                      i
                    }
                  >
                    <span>
                      {
                        [
                          "Read the signature",
                          "Guard the empty list",
                          "Return the first item",
                        ][i]
                      }
                    </span>
                    <strong>{group}</strong>
                    <i
                      style={{
                        transform: `scaleX(${Math.max(0, Math.min(1, direction.targetProgress * 3 - i))})`,
                      }}
                    />
                  </div>
                ),
              )}
            </div>
            <div className="ar-supervision-link">
              <span>Answer-token targets</span>
              <svg viewBox="0 0 80 20" aria-hidden="true">
                <path
                  d="M0 10H76m-6-5 6 5-6 5"
                  fill="none"
                  stroke="currentColor"
                />
              </svg>
              <code>−Σ log p(target token | prefix)</code>
            </div>
            <div
              className="ar-example-consequence"
              style={{
                opacity: Math.max(
                  0,
                  Math.min(1, (direction.targetProgress - 0.55) / 0.25),
                ),
              }}
            >
              <strong>2/3 → 3/3 tests</strong>
              <span>
                The demonstration includes the guard.
                <br />
                LoRA supplies a parameter-efficient way to learn it.
              </span>
            </div>
          </div>
          <div className="ar-example-boundary">
            <b>Offline training</b>
            <span>
              Demonstrated training target, not a recorded model response. Token
              loss differs from the six-value calculation; neither is a held-out
              evaluation.
            </span>
          </div>
        </div>
      </div>
      <div className="ar-caption">
        <strong role="status">{NARRATIVE[direction.beat][0]}</strong>
        <span>
          {direction.beat === 1
            ? "∇A = 0 on step 1 · W unchanged"
            : example
              ? "No live-request weight update"
              : `W unchanged · ${direction.position.toFixed(1)} / 4 updates`}
        </span>
      </div>
      <div
        className="ar-transport"
        role="group"
        aria-label="Adapter film playback"
      >
        <button
          type="button"
          disabled={reduced}
          onClick={onToggle}
          aria-label={playing ? "Pause adapter film" : "Continue adapter film"}
        >
          {playing ? "Ⅱ Pause" : "▷ Continue"}
        </button>
        <input
          type="range"
          min="0"
          max={ADAPTER_DURATION}
          step="10"
          value={direction.time}
          aria-label="Scrub adapter investigation"
          aria-valuetext={`${(direction.time / 1000).toFixed(1)} seconds: ${ADAPTER_LABELS[direction.beat]}`}
          onChange={(e) => seek(Number(e.target.value))}
        />
        <time>{(direction.time / 1000).toFixed(1)} / 32s</time>
      </div>
      <details
        className="ar-method"
        onToggle={(event) => {
          if (event.currentTarget.open) film.seek(film.time);
        }}
      >
        <summary>Inspect arithmetic and limits</summary>
        <p>
          One fixed six-value input and target, a frozen 6 × 6 matrix, rank 2,
          learning rate 0.35 and four squared-error gradient steps. Between
          steps the picture interpolates A and B, then recomputes BA, outputs
          and loss. These intermediate frames are not extra optimizer steps.
          LoRA scaling is 1 here. The 24-versus-36 parameter count belongs only
          to this small example, not a production savings estimate. Pink and
          blue encode positive and negative values, not correctness. This
          example is independent of the 96-task cohort.
        </p>
        <button
          type="button"
          onClick={() => {
            const url = URL.createObjectURL(
              new Blob(
                [
                  JSON.stringify(
                    adapterRecord(direction.position, row, direction.time),
                    null,
                    2,
                  ),
                ],
                { type: "application/json" },
              ),
            );
            const link = document.createElement("a");
            link.href = url;
            link.download = "low-rank-adapter-calculation.json";
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}
        >
          Download this calculation as JSON
        </button>
      </details>
    </section>
  );
}
