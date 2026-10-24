"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { LabRun, LabTask } from "./lab-simulation";
import { clamp01, decodeAt } from "./inference-film-math";
import {
  baselineStudy,
  baselineFrame,
  BASELINE_DURATION,
  BASELINE_MOMENTS,
} from "./baseline-study";
import { useFilmTime } from "./use-film-time";
import { spotCls, type Lit } from "./stagecraft/spot";
import "./baseline-reveal.css";

const RED = "#ff9185",
  AMBER = "#ffc267",
  BLUE = "#9cc5f5",
  GREEN = "#b8e986";
const COLORS = [RED, AMBER, BLUE];
const n = (v: number) =>
  v.toLocaleString("en-US", { maximumFractionDigits: 2 });
const MOMENTS = [
  "Requests arrive",
  "Waiting for a worker",
  "Processing the input",
  "Generating the answer",
  "Locate the three costs",
];
const HEADINGS = [
  "Follow a request through baseline serving",
  "A queued request cannot use an idle worker",
  "The baseline processes every input again",
  "The worker generates the answer, token by token",
  "Three places to change execution",
];

/* What stays lit at each moment; the rest of the machine goes matte. */
const LIT: readonly Lit[] = [
  null,
  ["q-6", "w-blocked", "tl", "seg-0", "card"],
  ["q-6", "w-r7", "tl", "seg-1", "card"],
  ["w-r7", "tl", "seg-2", "card", "done"],
  ["tl", "seg-0", "seg-1", "seg-2", "card"],
];

function Worker({
  worker,
  task,
  time,
  blocked,
  lit,
}: {
  worker: number;
  task?: LabTask;
  time: number;
  blocked: boolean;
  lit: Lit;
}) {
  const y = 80 + worker * 132;
  const pre = task ? clamp01((time - task.start) / task.prefill) : 0;
  const tokens = task ? decodeAt(task, time - task.start) : 0;
  const decoding = !!task && pre === 1;
  const highlight = task?.id === 6;
  const color = blocked ? RED : highlight ? AMBER : BLUE;
  return (
    <g className={spotCls(`w w-${worker}${blocked ? " w-blocked" : ""}${task?.id === 6 ? " w-r7" : ""}`, lit, "bo-worker")} data-active={!!task}>
      <path
        d={`M251 ${y + 21}v-15h298v15M251 ${y + 83}v15h298v-15`}
        stroke={color}
        opacity={blocked || highlight ? 1 : 0.35}
        fill="none"
      />
      <text x="258" y={y - 5} className="bo-label">
        Worker {worker + 1}
      </text>
      <text x="542" y={y - 5} textAnchor="end" fill={color} className="bo-mono">
        {task
          ? `Request ${task.id + 1}`
          : blocked
            ? "Idle · request waiting"
            : "Available"}
      </text>
      <g opacity={task ? 1 : 0.3}>
        {Array.from({ length: 24 }, (_, i) => (
          <rect
            key={i}
            x={265 + (i % 6) * 12}
            y={y + 16 + Math.floor(i / 6) * 13}
            width="8"
            height="9"
            rx="1"
            fill={AMBER}
            opacity={i / 24 < pre ? 0.95 : 0.15}
          />
        ))}
        <text x="298" y={y + 83} textAnchor="middle" className="bo-small">
          Prefill
        </text>
        <path d={`M346 ${y + 41}h28`} stroke={pre === 1 ? BLUE : "#435463"} />
        <rect
          x="379"
          y={y + 10}
          width="65"
          height="63"
          rx="4"
          fill="#152835"
          stroke={decoding ? BLUE : "#3c4e5c"}
        />
        {Array.from({ length: 16 }, (_, i) => (
          <rect
            key={i}
            x={386 + (i % 4) * 13}
            y={y + 18 + Math.floor(i / 4) * 12}
            width="9"
            height="8"
            fill={BLUE}
            opacity={
              decoding ? 0.35 + (0.6 * ((tokens + i * 7) % 17)) / 17 : 0.15
            }
          />
        ))}
        <text x="411" y={y + 87} textAnchor="middle" className="bo-small">
          Decode
        </text>
        <path d={`M448 ${y + 41}h85`} stroke="#405265" />
        {Array.from({ length: 8 }, (_, i) => (
          <rect
            key={i}
            x={456 + i * 10}
            y={y + 32}
            width="6"
            height="18"
            fill={GREEN}
            opacity={task && i / 8 < tokens / task.tokens ? 1 : 0.12}
          />
        ))}
        <text x="494" y={y + 83} textAnchor="middle" className="bo-small">
          {n(tokens)} tokens
        </text>
      </g>
      {blocked && (
        <>
          <path
            d={`M274 ${y + 36}h48m-48 12h48`}
            stroke={RED}
            strokeWidth="3"
          />
          <text x="378" y={y + 48} fill={RED} fontSize="14">
            Waiting for the pair
          </text>
        </>
      )}
    </g>
  );
}

export function BaselineReveal({
  run,
  playing,
  reduced,
  readTime,
  onSeek,
  onToggle,
  onChapter,
}: {
  run: LabRun;
  playing: boolean;
  reduced: boolean;
  readTime: () => number;
  onSeek: (time: number) => void;
  onToggle: () => void;
  onChapter: (chapter: number) => void;
}) {
  const study = useMemo(() => baselineStudy(run), [run]);
  const film = useFilmTime(
    readTime,
    playing,
    reduced,
    BASELINE_DURATION,
    onSeek,
  );
  const frame = baselineFrame(film.time, study),
    q = study.request;
  const id = useId(),
    stage = useRef<HTMLDivElement>(null);
  const [link, setLink] = useState("");
  const selected =
    frame.beat === 1 ? 0 : frame.beat === 2 ? 1 : frame.beat === 3 ? 2 : -1;
  const x = (duration: number) => 40 + (duration / q.latency) * 668;
  const starts = [0, q.queueSeconds, q.queueSeconds + q.prefill];
  const totals = [q.queueSeconds, q.prefill, q.decode];
  const partial = [frame.wait, frame.prefill, frame.decode];
  const color = COLORS[Math.max(0, selected)];
  const lit = LIT[frame.beat];
  useEffect(() => {
    const root = stage.current;
    if (!root || selected < 0) return;
    const update = () => {
      const bounds = root.getBoundingClientRect();
      const source = root
        .querySelector("[data-bo-source]")
        ?.getBoundingClientRect();
      const target = root
        .querySelector("[data-bo-target]")
        ?.getBoundingClientRect();
      const scroll = root.querySelector(".bo-scroll")?.getBoundingClientRect();
      if (
        !source ||
        !target ||
        !scroll ||
        target.left < scroll.right ||
        source.right > scroll.right + 1
      ) {
        setLink("");
        return;
      }
      const sx = source.left + source.width / 2 - bounds.left,
        sy = source.top + source.height / 2 - bounds.top;
      const tx = target.left - bounds.left,
        ty = target.top + target.height / 2 - bounds.top;
      setLink(`M${sx} ${sy}H${tx - 12}V${ty}H${tx}`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    const target = root.querySelector(".bo-consequence");
    if (target) observer.observe(target);
    const scroll = root.querySelector(".bo-scroll");
    scroll?.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      scroll?.removeEventListener("scroll", update);
    };
  }, [selected]);
  return (
    <section
      className="bo-film"
      aria-label="Baseline request journey"
      data-beat={frame.beat}
    >
      <header className="bo-heading">
        <div>
          <h3>{HEADINGS[frame.beat]}</h3>
          <span>
            First 8 of {study.cohortSize} requests · 2 workers · unchanged model
          </span>
        </div>
        <time aria-label="Workload clock">
          {n(frame.time)} <small>s</small>
        </time>
      </header>
      <div className="bo-stage" ref={stage}>
        <div
          className="bo-scroll"
          role="region"
          aria-label="Baseline serving machine and request 7 timeline; scroll horizontally on narrow screens"
          tabIndex={0}
        >
          <svg
            viewBox="0 0 760 498"
            className="bo-machine"
            role="img"
            aria-labelledby={id}
          >
            <title id={id}>
              {`Baseline request 7: ${n(frame.wait)} seconds waiting, ${n(frame.prefill)} GPU-seconds processing input and ${n(frame.decode)} GPU-seconds generating ${n(frame.tokens)} output tokens. Two workers, ${frame.state.waiting.length} waiting requests in the first eight.`}
            </title>
            <text x="32" y="30" className="bo-section">
              Request queue
            </text>
            <text x="268" y="30" className="bo-section">
              Baseline execution
            </text>
            <text x="614" y="30" className="bo-section">
              Completed
            </text>
            <text x="32" y="50" className="bo-small">
              {frame.state.waiting.length} waiting
            </text>
            <text x="268" y="50" className="bo-small">
              Start the next pair when both workers are free
            </text>
            <text x="614" y="50" className="bo-small">
              {frame.state.done.length} of 8
            </text>
            {[0, 1].map((worker) => (
              <path
                key={worker}
                d={`M206 175h18V${121 + worker * 132}h23M554 ${121 + worker * 132}h28V175h21`}
                fill="none"
                stroke="#405365"
                strokeWidth="1.5"
              />
            ))}
            {study.tasks.map((task, i) => {
              const waiting = frame.state.waiting.includes(task),
                done = frame.state.done.includes(task),
                active = frame.state.active.includes(task),
                arrived = task.arrival <= frame.time;
              const cx = 42 + (i % 2) * 82,
                cy = 83 + Math.floor(i / 2) * 56;
              return (
                <g key={task.id}>
                  <g className={spotCls(`q q-${i}`, lit)}>
                  <rect
                    x={cx - 10}
                    y={cy - 8}
                    width="71"
                    height="43"
                    rx="4"
                    stroke={i === 6 ? AMBER : "#405365"}
                    strokeWidth={i === 6 ? 2 : 1}
                    fill={
                      waiting ? (i === 6 ? "#45331c" : "#182a38") : "#0d1924"
                    }
                    opacity={arrived ? 1 : 0.4}
                  />
                  <text
                    x={cx}
                    y={cy + 9}
                    className="bo-label"
                    fill={i === 6 ? AMBER : undefined}
                  >
                    Req {i + 1}
                  </text>
                  <text x={cx} y={cy + 24} className="bo-small">
                    {done
                      ? "Finished"
                      : active
                        ? "Running"
                        : waiting
                          ? "Queued"
                          : `${n(task.arrival)} s`}
                  </text>
                  </g>
                  <g className={spotCls("done", lit)}>
                  <circle
                    cx={632 + (i % 2) * 49}
                    cy={99 + Math.floor(i / 2) * 56}
                    r="16"
                    fill={done ? "#24362d" : "#10202b"}
                    stroke={done ? GREEN : "#344956"}
                  />
                  <text
                    x={632 + (i % 2) * 49}
                    y={104 + Math.floor(i / 2) * 56}
                    textAnchor="middle"
                    fill={done ? GREEN : "#a4b5c2"}
                    fontSize="12"
                  >
                    {done ? "✓" : i + 1}
                  </text>
                  </g>
                </g>
              );
            })}
            {[0, 1].map((worker) => (
              <Worker
                key={worker}
                worker={worker}
                task={frame.state.active.find((task) => task.worker === worker)}
                time={frame.time}
                lit={lit}
                blocked={study.gaps.some(
                  (g) =>
                    g.worker === worker &&
                    frame.time >= g.start &&
                    frame.time < g.finish,
                )}
              />
            ))}
            <path d="M32 322H722" stroke="#304452" />
            <g className={spotCls("tl", lit)}>
            <text x="40" y="347" fill={AMBER} className="bo-section">
              Request 7
            </text>
            <text x="148" y="347" className="bo-label">
              {n(frame.elapsed)} s since arrival
            </text>
            <text x="710" y="347" textAnchor="end" className="bo-label">
              {frame.time >= q.finish
                ? "Answer complete ✓"
                : frame.time >= q.start + q.prefill
                  ? `${n(frame.tokens)} / ${n(q.tokens)} tokens`
                  : frame.time >= q.start
                    ? "Processing input"
                    : frame.time >= q.arrival
                      ? "Waiting for a worker"
                      : "Not arrived"}
            </text>
            </g>
            {totals.map((total, i) => (
              <g key={i} className={spotCls(`seg-${i}`, lit)}>
                <rect
                  x={x(starts[i])}
                  y="382"
                  width={x(total) - 40}
                  height="34"
                  fill="none"
                  stroke={COLORS[i]}
                  strokeOpacity=".4"
                />
                <rect
                  x={x(starts[i])}
                  y="382"
                  width={x(partial[i]) - 40}
                  height="34"
                  fill={COLORS[i]}
                  opacity={selected < 0 || selected === i ? 0.85 : 0.23}
                />
                <text x={x(starts[i]) + 5} y="374" className="bo-small">
                  {["Waiting", "Prefill", "Decode"][i]}
                </text>
                <text
                  x={x(starts[i]) + 5}
                  y="435"
                  className="bo-mono"
                  fill={COLORS[i]}
                >
                  {n(partial[i])} {i === 0 ? "s" : "GPU-s"}
                </text>
              </g>
            ))}
            <line
              x1={x(frame.elapsed)}
              x2={x(frame.elapsed)}
              y1="379"
              y2="419"
              stroke="#eef4f8"
              strokeWidth="2"
            />
            {selected >= 0 && (
              <g>
                <path
                  d={`M${x(starts[selected])} 446v7H${x(starts[selected] + partial[selected])}v-7M${x(starts[selected] + partial[selected] / 2)} 453v22H752`}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                />
                <circle data-bo-source cx="752" cy="475" r="3" fill={color} />
              </g>
            )}
            {selected < 0 && (
              <text x="40" y="479" className="bo-small">
                Waiting time + input processing + answer generation = response
                time
              </text>
            )}
          </svg>
        </div>
        <aside
          className={spotCls("card", lit, "bo-consequence")}
          aria-label="Selected request consequence"
          style={
            {
              "--bo-signal": selected < 0 ? AMBER : color,
            } as React.CSSProperties
          }
        >
          <span className="bo-subtitle">
            {frame.beat === 0
              ? "Two workers share the workload"
              : frame.beat === 4
                ? "Request 7 · baseline accounting"
                : `Request 7 · ${["Waiting", "Input processing", "Answer generation"][Math.max(0, selected)]}`}
          </span>
          <h4>
            {frame.beat === 0
              ? "Requests arrive before workers are ready"
              : frame.beat === 1
                ? "A free worker still cannot start request 7"
                : frame.beat === 2
                  ? study.shared
                    ? "The shared prefix is read again"
                    : "This request has different input"
                  : frame.beat === 3
                    ? "Every output token takes execution time"
                    : "Waiting and GPU work are different costs"}
          </h4>
          {frame.beat === 0 ? (
            <div className="bo-population">
              {[
                {
                  label: "Waiting",
                  count: frame.state.waiting.length,
                  color: RED,
                },
                {
                  label: "Running",
                  count: frame.state.active.length,
                  color: AMBER,
                },
                {
                  label: "Completed",
                  count: frame.state.done.length,
                  color: GREEN,
                },
              ].map((row) => (
                <div key={row.label}>
                  <span>{row.label}</span>
                  <div>
                    {Array.from({ length: 8 }, (_, i) => (
                      <i
                        key={i}
                        style={{
                          background: i < row.count ? row.color : "#30404e",
                        }}
                      />
                    ))}
                  </div>
                  <b>{row.count}</b>
                </div>
              ))}
              <p>
                Only two requests can run at once. Later arrivals wait in the
                queue.
              </p>
            </div>
          ) : frame.beat === 4 ? (
            <div className="bo-accounting">
              <div>
                <span>Waiting</span>
                <b style={{ color: RED }}>{n(q.queueSeconds)} s</b>
              </div>
              <div>
                <span>GPU work</span>
                <b style={{ color: BLUE }}>{n(q.gpuSeconds)} GPU-s</b>
              </div>
              <div>
                <span>Response time</span>
                <b>{n(q.latency)} s</b>
              </div>
              <p>
                Scheduling changes the wait. Reuse and execution rates change
                the work.
              </p>
            </div>
          ) : (
            <>
              <div className="bo-measure" data-bo-target>
                <strong>{n(partial[selected])}</strong>
                <span>
                  {selected === 0
                    ? "seconds waiting so far"
                    : selected === 1
                      ? "GPU-seconds of input work"
                      : "GPU-seconds of answer work"}
                </span>
              </div>
              {frame.beat === 1 ? (
                <div className="bo-blocked">
                  <span>Request 7</span>
                  <i>→</i>
                  <span>
                    Worker {study.gap.worker + 1}
                    <small>Idle until its pair completes</small>
                  </span>
                </div>
              ) : frame.beat === 2 ? (
                <div className="bo-prefix-pair">
                  {["Request 1", "Request 7"].map((label, row) => (
                    <div key={label}>
                      <span>{label}</span>
                      <div>
                        {Array.from({ length: 12 }, (_, i) => (
                          <i
                            key={i}
                            style={{
                              background: study.shared
                                ? i < 11
                                  ? AMBER
                                  : BLUE
                                : row
                                  ? BLUE
                                  : AMBER,
                              opacity:
                                row && i / 12 >= frame.prefill / q.prefill
                                  ? 0.18
                                  : 0.85,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  <p>
                    {study.shared
                      ? "Matching prefix, full prefill again. No KV reuse in this baseline."
                      : "Unrelated inputs cannot reuse a prefix."}
                  </p>
                </div>
              ) : (
                <div className="bo-token-payoff">
                  <span>
                    {n(frame.tokens)}{" "}
                    <small>/ {n(q.tokens)} output tokens</small>
                  </span>
                  <div>
                    {Array.from({ length: 28 }, (_, i) => (
                      <i
                        key={i}
                        style={{
                          background:
                            i / 28 < frame.tokens / q.tokens
                              ? GREEN
                              : "#30404e",
                        }}
                      />
                    ))}
                  </div>
                  <p>
                    {frame.time >= q.finish
                      ? "Answer complete. Worker 1 is now available."
                      : "Input processing finishes before output tokens begin."}
                  </p>
                </div>
              )}
            </>
          )}
        </aside>
        {selected >= 0 && link && (
          <svg className="bo-link" aria-hidden="true">
            <path d={link} stroke={color} fill="none" strokeWidth="2" />
          </svg>
        )}
      </div>
      <div hidden className="bo-targets" aria-label="Optimization targets">
        {[
          { name: "Worker scheduling", change: "Reduce waiting", chapter: 1 },
          {
            name: "KV prefix reuse",
            change: study.shared
              ? "Avoid repeated input work"
              : "Requires a matching prefix",
            chapter: 2,
          },
          {
            name: "Prefill & decode rates",
            change: "Lower remaining execution cost",
            chapter: 3,
          },
        ].map((item, i) => (
          <button
            key={item.name}
            type="button"
            data-highlight={selected === i || frame.beat === 4}
            onClick={() => onChapter(item.chapter)}
          >
            <i style={{ background: COLORS[i] }} />
            <span>
              <strong>{item.name}</strong>
              <small>{item.change}</small>
            </span>
            <b aria-hidden="true">↗</b>
          </button>
        ))}
      </div>
      <div className="bo-transport">
        <button
          type="button"
          disabled={reduced}
          aria-label={
            playing
              ? "Pause baseline introduction"
              : "Play baseline introduction"
          }
          onClick={onToggle}
        >
          {playing ? "Ⅱ" : "▷"}
        </button>
        <input
          aria-label="Scrub baseline introduction"
          aria-valuetext={`${n(film.time / 1000)} seconds, ${MOMENTS[frame.beat]}`}
          type="range"
          min="0"
          max={BASELINE_DURATION}
          step="10"
          value={film.time}
          onChange={(e) => film.seek(Number(e.target.value))}
        />
        <time>{n(film.time / 1000)} / 28 s</time>
      </div>
      <nav className="bo-moments" aria-label="Baseline introduction moments">
        {MOMENTS.map((label, i) => (
          <button
            key={label}
            type="button"
            aria-current={frame.beat === i ? "step" : undefined}
            onClick={() => film.seek(BASELINE_MOMENTS[i])}
          >
            {label}
          </button>
        ))}
      </nav>
      <details
        className="bo-method"
        onToggle={(e) => {
          if (e.currentTarget.open) film.seek(film.time);
        }}
      >
        <summary>Inspect baseline accounting</summary>
        <p>
          The first eight requests retain the timestamps, token counts and
          worker assignments of the 96-request trace. Request 7 shares a prefix
          with request 1 only in the shared-document workload. The baseline
          recomputes its entire input. Red idle intervals count only a free
          worker with arrived work waiting; not all queue time is avoidable. GPU
          work sums prefill and decode, not waiting or idle allocation. Worker
          tiles and token groups are schematic. No kernel-specific attribution
          is made.
        </p>
      </details>
    </section>
  );
}
