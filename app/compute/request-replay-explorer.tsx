"use client";

import { fmtMs, rateCard } from "./calibration.ts";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { simulateLab, type LabRun } from "./lab-simulation";
import {
  matchedRequestComparison,
  requestComparisonFrame,
  requestMeasure,
  requestMeasureParts,
  requestMeasureUnits,
  REQUEST_FILM_MS,
  type RequestMeasure,
} from "./request-comparison";
import { useStudyPlayback } from "./use-study-playback";
import { useFilmTime } from "./use-film-time";
import type { DirectedView, RequestViewState } from "./explorer-state";
import { ClusterPanel } from "./cluster-panel";
import { emitMeter, useSummaryPause } from "./stagecraft/stage-meter";
import "./request-replay-explorer.css";

const BLUE = "#9cc5f5",
  GREEN = "#b8e986",
  AMBER = "#ffc267",
  RED = "#ff9185",
  VIOLET = "#c7a6ff";
const number = (value: number, digits = 2) =>
  value.toLocaleString("en-US", { maximumFractionDigits: digits });
const METRICS = [
  {
    id: "latency",
    label: "Response latency",
    detail: "Queue + execution · elapsed seconds",
    title: "End-to-end response latency",
  },
  {
    id: "service",
    label: "Total GPU work",
    detail: "Prefill + decode · GPU-seconds",
    title: "Total GPU execution work",
  },
  {
    id: "prefill",
    label: "Input processing",
    detail: "Prefill only · GPU-seconds",
    title: "Input processing cost",
  },
  {
    id: "decode",
    label: "Answer generation",
    detail: "Decode only · GPU-seconds",
    title: "Answer generation cost",
  },
] as const;
const MODES = [
  { id: "both", label: "Both mechanisms" },
  { id: "reuse", label: "Prefix reuse only" },
  { id: "rates", label: "Execution rates only" },
] as const;

export function RequestReplayExplorer({
  baseline,
  onPolicy,
  evidence,
  initial,
  presentation,
}: {
  baseline: LabRun;
  onPolicy: (policy: 0 | 2) => void;
  evidence: (run: LabRun, pause: () => void) => ReactNode;
  initial?: RequestViewState;
  presentation?: DirectedView<RequestViewState>;
}) {
  const [mechanism, setMechanism] = useState<"both" | "reuse" | "rates">(
    initial?.mechanism ?? "both",
  );
  const [taskId, setTaskId] = useState(initial?.taskId ?? 6);
  const [metric, setMetric] = useState<RequestMeasure>(
    initial?.metric ?? "latency",
  );
  const target = useMemo(
    () =>
      simulateLab(
        baseline.policyIndex,
        baseline.budget,
        true,
        baseline.workload,
        { reuse: mechanism !== "rates", fastKernels: mechanism !== "reuse" },
      ),
    [baseline.policyIndex, baseline.budget, baseline.workload, mechanism],
  );
  const comparison = matchedRequestComparison(baseline, target, taskId);
  const { before, after } = comparison;
  const delivery = metric === "latency";
  const { ref, ...localPlayer } = useStudyPlayback(1, 0, {
    finite: true,
    interval: REQUEST_FILM_MS,
    enabled: !presentation,
    autoplay: !initial,
    initialTime: initial?.time,
  });
  const player = presentation
    ? { ...localPlayer, pause: presentation.pause }
    : localPlayer;
  const localFilm = useFilmTime(
    localPlayer.readTime,
    localPlayer.running,
    localPlayer.reduced,
    REQUEST_FILM_MS,
    localPlayer.seek,
    initial?.time,
  );
  const film = presentation
    ? {
        time: presentation.time,
        seek: (time: number) =>
          presentation.inspect({ time, taskId, mechanism, metric }),
      }
    : localFilm;
  const aDuration = requestMeasure(before, metric);
  const bDuration = requestMeasure(after, metric);
  const frame = requestComparisonFrame(film.time, aDuration, bDuration);
  const end = Math.max(aDuration, bDuration);
  const x = (value: number) => 160 + (525 * value) / Math.max(1e-6, end);
  // Input processing takes a fraction of a second: its ticks read in milliseconds.
  const tickText = (v: number) => (end < 1 ? `${number(v * 1000, 0)} ms` : `${number(v, 1)} s`);
  const settled = frame.focus === "delta";
  const values = [
    requestMeasure(before, metric),
    requestMeasure(after, metric),
  ];
  const delta = values[0] - values[1];
  const percent = values[0] > 0 ? (100 * delta) / values[0] : 0;
  const cohortMax = Math.max(
    ...baseline.tasks.map((task) => task.gpuSeconds),
    ...target.tasks.map((task) => task.gpuSeconds),
  );
  const liveUnits = [before, after].map((task) =>
    requestMeasureUnits(task, metric, frame.cursor),
  );
  const liveTokens = liveUnits.map((units) => units.count);
  const phaseOnly = metric === "prefill" || metric === "decode";
  const firstFinished = frame.cursor >= Math.min(aDuration, bDuration) - 1e-9;
  const id = useId();
  const stage = useRef<HTMLDivElement>(null);
  const [leader, setLeader] = useState<string | null>(null);
  const meterLine = `Request ${taskId + 1}, ${METRICS.find((item) => item.id === metric)!.label.toLowerCase().replace("gpu", "GPU")}: ${number(values[0])} → ${number(values[1])} ${delivery ? "s" : "GPU-s"}`;
  useEffect(() => { emitMeter({ text: meterLine, tone: "optimized" }); }, [meterLine]);
  useSummaryPause(localPlayer.pause, localPlayer.resume);
  const selectRequest = (next: number) => {
    if (presentation) {
      presentation.inspect({
        time: REQUEST_FILM_MS,
        taskId: next,
        mechanism,
        metric,
      });
      return;
    }
    setTaskId(next);
    film.seek(REQUEST_FILM_MS);
  };
  const selectMetric = (next: RequestMeasure) => {
    if (presentation) {
      presentation.inspect({
        time: REQUEST_FILM_MS,
        taskId,
        mechanism,
        metric: next,
      });
      return;
    }
    setMetric(next);
    // Each measure plays its whole film from the start.
    film.seek(0);
    player.resume();
  };
  const play = () => {
    film.seek(0);
    player.replay();
  };
  // The Summary walks the four measures itself.
  const summaryMetric = useRef(selectMetric);
  useEffect(() => { summaryMetric.current = selectMetric; });
  useEffect(() => {
    const go = (e: Event) => {
      const d = (e as CustomEvent<{ metric: RequestMeasure; seek?: number }>).detail;
      summaryMetric.current(d.metric);
      if (d.seek) window.setTimeout(() => film.seek(d.seek!), 60);
    };
    window.addEventListener("lab:replay-metric", go);
    return () => window.removeEventListener("lab:replay-metric", go);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const aSegmentEnd = metric === "prefill" ? before.prefill : aDuration;
  const bSegmentEnd = metric === "prefill" ? after.prefill : bDuration;
  const differenceStart =
    metric === "decode"
      ? Math.min(before.decode, after.decode)
      : Math.min(aSegmentEnd, bSegmentEnd);
  const differenceEnd =
    metric === "decode"
      ? Math.max(before.decode, after.decode)
      : Math.max(aSegmentEnd, bSegmentEnd);
  const cause =
    metric === "latency"
      ? "Cause: earlier requests finish sooner, so this one waits less in the queue."
      : metric === "decode"
        ? mechanism === "reuse"
          ? "Prefix reuse leaves the answer's output tokens unchanged."
          : `Cause: FP8 weights and KV halve the bytes each step reads: ${fmtMs(rateCard(false).outputMs)} → ${fmtMs(rateCard(true).outputMs)} ms per output token.`
        : mechanism === "rates"
          ? "Cause: input and output tokens run faster; no prefix is reused."
          : after.cacheHit
            ? mechanism === "reuse"
              ? "Ready prefix state removes repeated input computation."
              : "A ready prefix skips input work; faster rates execute what remains."
            : mechanism === "reuse"
              ? "No ready matching prefix. This request still computes its full input."
              : "No prefix hit here. The difference comes from execution rates.";
  useEffect(() => {
    const node = stage.current;
    if (!node || !settled) return;
    const update = () => {
      const bounds = node.getBoundingClientRect(),
        source = node
          .querySelector("[data-rr-source]")
          ?.getBoundingClientRect();
      const target = node
          .querySelector("[data-rr-target]")
          ?.getBoundingClientRect(),
        aside = node.querySelector(".rr-result")?.getBoundingClientRect();
      const viewport = node
        .querySelector(".rr-scroll")
        ?.getBoundingClientRect();
      if (
        !source ||
        !target ||
        !aside ||
        !viewport ||
        aside.left <= bounds.left + 10 ||
        source.right > viewport.right ||
        source.left < viewport.left
      ) {
        setLeader(null);
        return;
      }
      setLeader(
        `M${source.left + source.width / 2 - bounds.left} ${source.top + source.height / 2 - bounds.top}H${aside.left - bounds.left + 7}V${target.top + target.height / 2 - bounds.top}H${target.left - bounds.left - 6}`,
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    const scroll = node.querySelector(".rr-scroll");
    scroll?.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      scroll?.removeEventListener("scroll", update);
    };
  }, [settled, metric, mechanism, taskId, aDuration, bDuration]);

  return (
    <section
      ref={ref}
      className="rr-explorer"
      aria-label="Inspect a matched request"
      data-focus={frame.focus}
    >
      <div className="rr-tools">
        <div role="group" aria-label="Execution checkpoint">
          <span className="lab-control-label">Model checkpoint</span>
          {([0, 2] as const).map((policy) => (
            <button
              type="button"
              key={policy}
              aria-pressed={baseline.policyIndex === policy}
              onClick={() => onPolicy(policy)}
            >
              {policy ? "RL checkpoint" : "Base"}
            </button>
          ))}
        </div>
        <label>
          Runtime intervention
          <select
            value={mechanism}
            onChange={(event) => {
              setMechanism(event.target.value as typeof mechanism);
              film.seek(REQUEST_FILM_MS);
            }}
          >
            {MODES.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <nav
        className="rr-measure-chapters"
        aria-label="Request comparison sections"
      >
        {METRICS.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-current={metric === item.id ? "page" : undefined}
            onClick={() => selectMetric(item.id)}
          >
            <strong>{item.label}</strong>
            <span>{item.detail}</span>
          </button>
        ))}
      </nav>
      <div className="rr-stage" ref={stage}>
        <div className="rr-figure">
          <div className="rr-heading">
            <h3>{METRICS.find((item) => item.id === metric)!.title}</h3>
            <span>
              Request {taskId + 1} · {number(before.inputTokens, 0)} input ·{" "}
              {number(before.tokens, 0)} output tokens
            </span>
            <time>
              {number(frame.cursor)}
              <small>
                {" "}
                s ·{" "}
                {delivery
                  ? "since arrival"
                  : metric === "prefill" ? "GPU-s · input processing"
                  : metric === "decode" ? "GPU-s · answer generation"
                  : "GPU-s · total work"}
              </small>
            </time>
          </div>
          <div
            className="rr-scroll"
            role="region"
            tabIndex={0}
            aria-label="Paired request timeline; scroll horizontally on narrow screens"
            onFocusCapture={player.pause}
          >
            <svg
              className="rr-plot"
              viewBox="0 0 760 365"
              role="group"
              aria-labelledby={`${id}-title`}
            >
              <title
                id={`${id}-title`}
              >{`Request ${taskId + 1}: ${METRICS.find((item) => item.id === metric)!.title}. ${delivery ? "Waiting is included." : "Queue waiting is excluded."}`}</title>
              <defs>
                <pattern
                  id={`${id}-waiting`}
                  width="6"
                  height="6"
                  patternUnits="userSpaceOnUse"
                >
                  <path d="M0 3h3" stroke="#a8b6c7" strokeWidth="1" />
                </pattern>
              </defs>
              {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
                <g key={tick}>
                  <path
                    d={`M${x(tick * end)} 35V281`}
                    stroke="#304453"
                    strokeDasharray="2 6"
                  />
                  <text
                    x={x(tick * end)}
                    y="306"
                    className="rr-small"
                    textAnchor="middle"
                  >
                    {tickText(tick * end)}
                  </text>
                </g>
              ))}
              {[before, after].map((task, index) => {
                const y = 85 + index * 126,
                  color = index ? GREEN : BLUE;
                const wait = delivery ? task.queueSeconds : 0;
                const duration = requestMeasure(task, metric);
                const units = requestMeasureUnits(task, metric, frame.cursor),
                  tokens = units.count;
                const done = frame.cursor >= duration - 1e-9;
                const quiet =
                  frame.focus === "first"
                    ? duration > Math.min(aDuration, bDuration) + 1e-9
                    : false;
                const parts = requestMeasureParts(task, metric).map((part) => ({
                  ...part,
                  color:
                    part.key === "queue"
                      ? "#a8b6c7"
                      : part.key === "prefill"
                        ? AMBER
                        : color,
                }));
                return (
                  <g
                    key={task.id + index * 100}
                    className="rr-lane"
                    data-quiet={quiet}
                  >
                    <text
                      x="22"
                      y={y - 9}
                      className="rr-lane-name"
                      fill={color}
                    >
                      {index ? "Optimized" : "Baseline"}
                    </text>
                    <text x="22" y={y + 12} className="rr-small">
                      {done
                        ? metric === "prefill"
                          ? "prefill complete"
                          : "worker released"
                        : metric === "decode"
                          ? "emitting tokens"
                          : metric === "prefill"
                            ? "reading input"
                            : frame.cursor < wait
                              ? "in the queue"
                              : frame.cursor < wait + task.prefill
                                ? "reading input"
                                : "emitting tokens"}
                    </text>
                    {/* When each thing happens: the worker starts, the prompt is read, tokens begin. */}
                    {!phaseOnly && delivery && frame.cursor >= wait && (
                      <g className="rr-mark">
                        <path d={`M${x(wait)} ${y - 36}V${y + 4}`} stroke="#a8b6c7" />
                        <text x={x(wait) - 6} y={y - 40} textAnchor="end" className="rr-mark-text" fill="#c9d2db">worker starts at {number(wait, 2)} s</text>
                      </g>
                    )}
                    {!phaseOnly && frame.cursor >= wait + task.prefill && (
                      <g className="rr-mark">
                        <path d={`M${x(wait + task.prefill)} ${y - 36}V${y + 4}`} stroke={AMBER} />
                        <text x={x(wait + task.prefill) + 6} y={y - 40} className="rr-mark-text" fill={AMBER}>input read, first word at {number(wait + task.prefill, 2)} s</text>
                      </g>
                    )}
                    {parts
                      .filter((part) => part.length > 0)
                      .map((part) => (
                        <g key={part.key}>
                          <rect
                            x={x(part.start)}
                            y={y - 28}
                            width={Math.max(
                              0,
                              x(part.start + part.length) - x(part.start),
                            )}
                            height="40"
                            fill={
                              part.key === "queue"
                                ? `url(#${id}-waiting)`
                                : part.color
                            }
                            fillOpacity={part.key === "queue" ? 0.5 : 0.09}
                            stroke={part.color}
                            strokeOpacity=".5"
                          />
                          <rect
                            x={x(part.start)}
                            y={y - 28}
                            width={Math.max(
                              0,
                              x(
                                Math.min(
                                  frame.cursor,
                                  part.start + part.length,
                                ),
                              ) - x(part.start),
                            )}
                            height="40"
                            fill={part.color}
                            fillOpacity={
                              metric === "service" ||
                              metric === "latency" ||
                              metric === part.key
                                ? 0.5
                                : 0.18
                            }
                          />
                        </g>
                      ))}
                    <path
                      d={`M${x(Math.min(frame.cursor, duration))} ${y - 34}v50`}
                      stroke={done ? color : "#e5ecf5"}
                      strokeWidth="2"
                    />
                    {done && (
                      <circle cx={x(duration)} cy={y - 8} r="4" fill={color} />
                    )}
                    {metric !== "decode" && (
                      <text x="160" y={y + 40} className="rr-small" fill={AMBER}>
                        {number(task.computedInputTokens, 0)} input tokens
                        computed
                      </text>
                    )}
                    {Array.from({ length: 20 }, (_, bit) => (
                      <rect
                        key={bit}
                        x={430 + bit * 12}
                        y={y + 29}
                        width="8"
                        height="7"
                        fill={color}
                        opacity={bit < (20 * tokens) / units.total ? 0.9 : 0.13}
                      />
                    ))}
                    <text
                      x="675"
                      y={y + 49}
                      textAnchor="end"
                      className="rr-token-count"
                      fill={color}
                    >
                      {number(tokens, 0)} / {number(units.total, 0)}{" "}
                      {metric === "prefill" ? "input" : "output"}
                    </text>
                  </g>
                );
              })}
              {!settled &&
                frame.cursor >= Math.min(aDuration, bDuration) &&
                aDuration !== bDuration && (
                  <rect
                    x={x(Math.min(aDuration, bDuration))}
                    y={aDuration > bDuration ? 57 : 183}
                    width={
                      x(Math.max(aDuration, bDuration)) -
                      x(Math.min(aDuration, bDuration))
                    }
                    height="40"
                    fill={RED}
                    opacity=".2"
                    pointerEvents="none"
                  />
                )}
              {settled && (
                <g pointerEvents="none">
                  <path
                    d={`M${x(aSegmentEnd)} 98V267`}
                    stroke={BLUE}
                    strokeDasharray="3 5"
                    strokeOpacity=".4"
                  />
                  <path
                    d={`M${x(bSegmentEnd)} 224V267`}
                    stroke={GREEN}
                    strokeDasharray="3 5"
                    strokeOpacity=".4"
                  />
                  <path
                    d={`M${x(differenceStart)} 267v14H${x(differenceEnd)}v-14`}
                    fill="none"
                    stroke={VIOLET}
                    strokeWidth="2"
                  />
                  <path
                    d={`M${x(differenceEnd)} 281H715V314`}
                    stroke={VIOLET}
                    fill="none"
                  />
                  <circle
                    data-rr-source
                    cx="715"
                    cy="303"
                    r="11"
                    fill="#211b31"
                    stroke={VIOLET}
                  />
                  <text
                    x="715"
                    y="307"
                    textAnchor="middle"
                    fill={VIOLET}
                    fontSize="13"
                  >
                    {Math.abs(delta) < 1e-8 ? "=" : "Δ"}
                  </text>
                </g>
              )}
            </svg>
          </div>
          <div className="rr-legend">
            {metric !== "decode" && (
              <span>
                <i style={{ background: AMBER }} />
                Input processing
              </span>
            )}
            {metric !== "prefill" && (
              <span>
                <i style={{ background: GREEN }} />
                Answer generation
              </span>
            )}
            {delivery && (
              <span>
                <i style={{ background: "#a8b6c7" }} />
                Queue waiting
              </span>
            )}
          </div>
        </div>
        <aside
          className="rr-result"
          aria-label="The selected request's exact difference"
        >
          <h4>
            {!settled
              ? metric === "prefill"
                ? "Input tokens processed"
                : "Answer tokens delivered"
              : metric === "latency"
                ? "Time the request waits for completion"
                : metric === "service"
                  ? "GPU work for this answer"
                  : metric === "prefill"
                    ? "Work to process its input"
                    : "Work to generate its answer"}
          </h4>
          <div className="rr-values">
            {(settled ? values : liveTokens).map((value, index) => (
              <div key={index}>
                <span>{index ? "Optimized" : "Baseline"}</span>
                <strong style={{ color: index ? GREEN : BLUE }}>
                  {number(value, settled ? 2 : 0)}
                  <small>
                    {settled
                      ? delivery
                        ? " s"
                        : " GPU-s"
                      : ` / ${number(liveUnits[index].total, 0)}`}
                  </small>
                </strong>
                <i
                  style={{
                    background: index ? GREEN : BLUE,
                    width: `${(100 * value) / (settled ? Math.max(...values, 0.001) : liveUnits[index].total)}%`,
                  }}
                />
              </div>
            ))}
          </div>
          <p data-rr-target className="rr-delta" data-hero={settled && Math.abs(delta) >= 1e-8}>
            {!settled
              ? firstFinished
                ? aDuration === bDuration
                  ? metric === "prefill"
                    ? "Both prefills complete"
                    : "Both workers released"
                  : `${aDuration > bDuration ? "Optimized" : "Baseline"} ${metric === "prefill" ? "prefill complete" : "worker released"}`
                : metric === "prefill"
                  ? "Compare the input work"
                  : `${number(before.tokens, 0)} output tokens in each lane`
              : Math.abs(delta) < 1e-8
                ? "= no difference"
                : <><b className="cx-hero-num">Δ {number(Math.abs(delta))}</b> <span className="cx-hero-unit">{delivery ? "s" : "GPU-s"} {delta > 0 ? "less" : "more"}</span></>}
            <small>
              {settled &&
                Math.abs(delta) >= 1e-8 &&
                `${number(Math.abs(percent), 1)}% ${delta > 0 ? "reduction" : "increase"}`}
            </small>
          </p>
          <p className="rr-cause">
            {settled
              ? cause
              : firstFinished && aDuration !== bDuration
                ? `The other lane is still ${metric === "prefill" ? "processing input" : "executing"}. The red interval exposes that remaining work.`
                : delivery
                  ? "Both lanes start at this request’s arrival; waiting comes before input and answer generation."
                  : phaseOnly
                    ? `Both lanes start at ${metric}. ${metric === "prefill" ? "Answer generation is outside this view." : "Input processing is outside this view."}`
                    : "Both lanes start when a worker takes this request. Queue waiting is outside this view."}
          </p>
          <div className="rr-evidence">{evidence(target, player.pause)}</div>
          <ClusterPanel baseline={baseline} target={target} taskId={taskId} />
        </aside>
        {settled && leader && (
          <svg className="rr-leader" aria-hidden="true">
            <path d={leader} fill="none" stroke={VIOLET} strokeWidth="1.4" />
          </svg>
        )}
      </div>
      <div className="rr-transport">
        <button
          type="button"
          disabled={player.reduced}
          aria-label={
            player.running ? "Pause request replay" : "Play request replay"
          }
          onClick={() =>
            player.running
              ? player.pause()
              : film.time >= REQUEST_FILM_MS
                ? play()
                : player.toggle()
          }
        >
          {player.running ? "Ⅱ" : "▷"}
        </button>
        <input
          type="range"
          min={0}
          max={REQUEST_FILM_MS}
          step={10}
          value={film.time}
          aria-label="Scrub matched request replay"
          onChange={(event) => film.seek(Number(event.target.value))}
        />
        <time>{number(film.time / 1000, 1)} / 20 s</time>
        <button type="button" onClick={() => film.seek(10000)}>
          First completion
        </button>
        <button type="button" onClick={() => film.seek(REQUEST_FILM_MS)}>
          Compare the difference
        </button>
      </div>
      <div className="rr-cohort">
        <div>
          <strong>Choose a request from the same 96-task trace</strong>
          <span>
            {after.cacheHit ? "Ready prefix reused" : "No prefix reused"} ·
            request {taskId + 1}
          </span>
        </div>
        <div
          className="rr-cohort-scroll"
          role="region"
          tabIndex={0}
          aria-label="Request-level GPU work overview; scroll horizontally on narrow screens"
          onFocusCapture={player.pause}
        >
          <svg
            viewBox="0 0 1040 91"
            className="rr-cohort-plot"
            role="group"
            aria-label="Baseline and optimized GPU work for each request"
          >
            {baseline.tasks.map((task, index) => {
              return (
                <g
                  key={task.id}
                  role="button"
                  tabIndex={taskId === task.id ? 0 : -1}
                  className="rr-request"
                  data-id={task.id}
                  aria-pressed={taskId === task.id}
                  aria-label={`Request ${task.id + 1}, ${number(task.gpuSeconds)} to ${number(target.tasks[index].gpuSeconds)} GPU-seconds${target.tasks[index].cacheHit ? ", ready prefix hit" : ", no prefix hit"}`}
                  onClick={(event) => {
                    event.currentTarget.focus();
                    selectRequest(task.id);
                  }}
                  onKeyDown={(event) => {
                    if (
                      [
                        "Enter",
                        " ",
                        "ArrowLeft",
                        "ArrowRight",
                        "Home",
                        "End",
                      ].includes(event.key)
                    ) {
                      event.preventDefault();
                      const next =
                        event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? 95
                            : event.key === "ArrowLeft"
                              ? Math.max(0, task.id - 1)
                              : event.key === "ArrowRight"
                                ? Math.min(95, task.id + 1)
                                : task.id;
                      selectRequest(next);
                      event.currentTarget.parentElement
                        ?.querySelector<SVGElement>(`[data-id="${next}"]`)
                        ?.focus();
                    }
                  }}
                >
                  <rect
                    x={22 + index * 10.5}
                    y="4"
                    width="10.5"
                    height="68"
                    fill={taskId === task.id ? "#c7a6ff20" : "transparent"}
                    stroke={taskId === task.id ? VIOLET : "none"}
                  />
                  <path
                    d={`M${25 + index * 10.5} 68v${(-58 * task.gpuSeconds) / cohortMax}`}
                    stroke={BLUE}
                    strokeWidth="2.5"
                  />
                  <path
                    d={`M${29 + index * 10.5} 68v${(-58 * target.tasks[index].gpuSeconds) / cohortMax}`}
                    stroke={GREEN}
                    strokeWidth="2.5"
                  />
                </g>
              );
            })}
            {[0, 23, 47, 71, 95].map((index) => (
              <text
                key={index}
                x={27 + index * 10.5}
                y="88"
                textAnchor="middle"
                className="rr-small"
              >
                {index + 1}
              </text>
            ))}
          </svg>
        </div>
        <label className="rr-request-slider">
          Request
          <input
            type="range"
            min={1}
            max={96}
            step={1}
            value={taskId + 1}
            aria-label="Choose matched request"
            onChange={(event) => selectRequest(Number(event.target.value) - 1)}
          />
          <output>{taskId + 1}</output>
        </label>
      </div>
      <details
        className="rr-accounting"
        
      >
        <summary>Inspect the time and work accounting</summary>
        <p>
          Input work Δ {number(comparison.prefill)} + answer work Δ{" "}
          {number(comparison.decode)} = GPU work Δ {number(comparison.service)}.
          Queue wait Δ {number(comparison.queue)} + GPU work Δ{" "}
          {number(comparison.service)} = completion time Δ{" "}
          {number(comparison.latency)}.
        </p>
        <p>
          {number(comparison.avoidedInput, 0)} fewer input tokens computed. The
          logical input and output lengths are fixed. Cache readiness is
          recomputed for each declared intervention; individual mechanism gains
          are not assumed to add to the combined result.
        </p>
        <p>
          Two abstract serial workers, the same arrival trace and scheduling
          rule. Uniform token emission within decode is an interpolation, not a
          measured token trace. GPU-s means modeled busy work, excluding idle
          allocation and verifier cost. The scenario record contains the whole
          selected run.
        </p>
      </details>
    </section>
  );
}
