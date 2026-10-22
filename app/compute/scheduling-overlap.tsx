"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useStudyPlayback } from "./use-study-playback";
import { useFilmTime } from "./use-film-time";
import {
  ANSWER_STREAMS,
  HOST_PROFILES,
  OVERLAP_DURATION,
  OVERLAP_LABELS,
  OVERLAP_MOMENTS,
  overlapStudy,
  overlapFrame,
  overlapRecord,
  type HostProfile,
  type Interval,
  type OverlapFrame,
  type OverlapLane,
  type OverlapStudy,
} from "./scheduling-overlap-model";
import "./scheduling-overlap.css";

const BLUE = "#9cc5f5",
  GREEN = "#b8e986",
  AMBER = "#ffc267",
  RED = "#ff9185",
  VIOLET = "#c7a6ff";
const n = (v: number) => Number(v.toFixed(1)).toString();
const HEADINGS = [
  "Follow one step from preparation to output",
  "The GPU waits for host-side work",
  "Prepare the next step while the GPU runs",
  "Finish the same output earlier",
  "Separate elapsed time from GPU work",
];

function ScheduleLane({
  lane,
  study,
  frame,
  optimized,
  selected,
  select,
  preview,
  focus,
}: {
  lane: OverlapLane;
  study: OverlapStudy;
  frame: OverlapFrame;
  optimized: boolean;
  selected: number | null;
  select: (i: number) => void;
  preview: (i: number | null) => void;
  focus: (i: number | null) => void;
}) {
  const y = optimized ? 288 : 60;
  const color = optimized ? GREEN : BLUE;
  const x = (time: number) => 116 + (time / study.axisMax) * 614;
  const current = optimized ? frame.overlapped : frame.baseline;
  const active = optimized
    ? frame.beat >= 2
    : frame.beat <= 1 || frame.beat === 4;
  const stepOpacity = (i: number) =>
    selected !== null && selected !== i ? 0.26 : 1;
  const linkedStep =
    selected ??
    (frame.beat === 0 ? 0 : frame.beat === 2 ? current.activeStep : null);
  const op = (interval: Interval, row: number, fill: string, label: string) => {
    const width = x(interval.end) - x(interval.start);
    if (width === 0) return null;
    const doneWidth = Math.max(
      0,
      x(Math.min(interval.end, frame.serviceMs)) - x(interval.start),
    );
    return (
      <g>
        <rect
          x={x(interval.start)}
          y={row}
          width={width}
          height="24"
          rx="2"
          fill="#152632"
          stroke={fill}
          strokeOpacity=".5"
        />
        <rect
          x={x(interval.start)}
          y={row}
          width={doneWidth}
          height="24"
          rx="2"
          fill={fill}
          fillOpacity=".24"
        />
        {width > 19 && (
          <text
            x={x(interval.start) + width / 2}
            y={row + 16}
            textAnchor="middle"
            className="so-op"
            fill={fill}
          >
            {label}
          </text>
        )}
      </g>
    );
  };
  return (
    <g data-so-lane={optimized ? "overlapped" : "baseline"}>
      <text x="24" y={y} className="so-lane-title" fill={color}>
        {optimized ? "Overlapped scheduling" : "Baseline scheduling"}
      </text>
      <text
        x="730"
        y={y}
        textAnchor="end"
        className="so-small"
        fill={current.done ? color : "#bfd0dc"}
      >
        {current.done
          ? `Output complete · ${lane.finish} ms`
          : `${current.completed * 2} / 8 output units delivered`}
      </text>
      <text x="24" y={y + 40} className="so-label">
        CPU
      </text>
      <text x="24" y={y + 84} className="so-label">
        GPU
      </text>
      <path
        d={`M116 ${y + 53}H730M116 ${y + 97}H730`}
        stroke="#36505e"
        strokeWidth="1"
      />
      {linkedStep !== null &&
        (() => {
          const s = lane.steps[linkedStep];
          const ox = 233 + linkedStep * 112;
          return (
            <path
              d={`M${x((s.prepare.start + s.prepare.end) / 2)} ${y + 51}V${y + 58}H${x(s.gpu.start)}V${y + 65}M${x(s.gpu.end)} ${y + 91}V${y + 111}H${ox}V${y + 119}`}
              stroke={VIOLET}
              strokeWidth="2"
              fill="none"
              opacity=".85"
              className="so-link"
            />
          );
        })()}
      {lane.gaps.map((gap, i) => {
        const elapsed = Math.max(
          0,
          Math.min(gap.end, frame.serviceMs) - gap.start,
        );
        return (
          <g key={i} opacity={frame.beat >= 1 ? 1 : 0.25}>
            <rect
              x={x(gap.start)}
              y={y + 65}
              width={x(gap.end) - x(gap.start)}
              height="26"
              fill="#472b30"
            />
            <rect
              x={x(gap.start)}
              y={y + 65}
              width={(elapsed / study.axisMax) * 614}
              height="26"
              fill={RED}
              fillOpacity=".24"
            />
            {frame.serviceMs >= gap.start && (
              <path
                d={`M${x(gap.start)} ${y + 64}v-5H${x(gap.end)}v5`}
                stroke={RED}
                fill="none"
                strokeWidth="2"
              />
            )}
          </g>
        );
      })}
      {lane.steps.map((s) => {
        const gpuWidth = x(s.gpu.end) - x(s.gpu.start);
        const progress = Math.max(
          0,
          Math.min(
            1,
            (frame.serviceMs - s.gpu.start) / (s.gpu.end - s.gpu.start),
          ),
        );
        return (
          <g
            key={s.index}
            opacity={stepOpacity(s.index)}
            className="so-step"
            role="button"
            tabIndex={0}
            aria-label={`Inspect ${optimized ? "overlapped" : "baseline"} step ${s.index + 1}: GPU ${s.gpu.start} to ${s.gpu.end} milliseconds, output at ${s.deliver.end}`}
            aria-pressed={selected === s.index}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") preview(s.index);
            }}
            onPointerLeave={() => preview(null)}
            onFocus={() => focus(s.index)}
            onBlur={() => focus(null)}
            onClick={() => select(s.index)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                select(s.index);
              }
            }}
          >
            <title>
              Step {s.index + 1}: prepare {s.prepare.start}–{s.prepare.end}, GPU{" "}
              {s.gpu.start}–{s.gpu.end}, deliver {s.deliver.start}–
              {s.deliver.end} ms
            </title>
            {op(s.prepare, y + 25, AMBER, `P${s.index + 1}`)}
            {op(s.deliver, y + 25, VIOLET, `D${s.index + 1}`)}
            <rect
              className="so-step-hit"
              x={x(s.gpu.start)}
              y={y + 65}
              width={gpuWidth}
              height="26"
              rx="2"
              fill="#172d38"
              stroke={selected === s.index ? VIOLET : color}
              strokeWidth={selected === s.index ? 2.5 : 1}
            />
            <rect
              x={x(s.gpu.start)}
              y={y + 65}
              width={gpuWidth * progress}
              height="26"
              rx="2"
              fill={color}
              fillOpacity={active ? 0.38 : 0.22}
            />
            {progress > 0 && progress < 1 && (
              <path
                d={`M${x(s.gpu.start) + gpuWidth * progress} ${y + 64}v28`}
                stroke={color}
                strokeWidth="2.5"
              />
            )}
            <text
              x={x((s.gpu.start + s.gpu.end) / 2)}
              y={y + 83}
              textAnchor="middle"
              fill={color}
              className="so-op"
            >
              {s.index + 1}
            </text>
            <text
              x={233 + s.index * 112}
              y={y + 116}
              textAnchor="middle"
              className="so-index"
            >
              STEP {s.index + 1}
            </text>
            {ANSWER_STREAMS.map((stream, j) => (
              <g key={stream.id}>
                <rect
                  x={184 + s.index * 112}
                  y={y + 123 + j * 30}
                  width="98"
                  height="25"
                  rx="3"
                  fill={
                    current.completed > s.index
                      ? optimized
                        ? "#23382c"
                        : "#213448"
                      : "#10212d"
                  }
                  stroke={selected === s.index ? VIOLET : "#3c5665"}
                  strokeWidth={selected === s.index ? 2 : 1}
                />
                <text
                  x={233 + s.index * 112}
                  y={y + 140 + j * 30}
                  className="so-word"
                  textAnchor="middle"
                  fill={current.completed > s.index ? color : "#91a7b6"}
                >
                  {current.completed > s.index ? stream.words[s.index] : "·"}
                </text>
              </g>
            ))}
          </g>
        );
      })}
      <text x="24" y={y + 140} className="so-small">
        Output
      </text>
      {ANSWER_STREAMS.map((stream, j) => (
        <text key={stream.id} x="116" y={y + 140 + j * 30} className="so-small">
          User {stream.id}
        </text>
      ))}
      <path
        d={`M${x(Math.min(frame.serviceMs, lane.finish))} ${y + 17}V${y + 98}`}
        stroke={current.done ? color : "#dce9f0"}
        strokeOpacity=".7"
        strokeDasharray={current.done ? undefined : "2 4"}
      />
    </g>
  );
}

function Comparison({
  study,
  frame,
  selected,
}: {
  study: OverlapStudy;
  frame: OverlapFrame;
  selected: number | null;
}) {
  const { baseline: a, overlapped: b } = study;
  const selectedA = selected === null ? null : a.steps[selected];
  const selectedB = selected === null ? null : b.steps[selected];
  const firstGap = a.gaps[0];
  const gap = firstGap ? firstGap.end - firstGap.start : 0;
  const value =
    selectedA && selectedB
      ? selectedA.deliver.end - selectedB.deliver.end
      : frame.beat === 1
        ? gap
        : study.savedElapsed;
  const title =
    selected !== null
      ? [`Step ${selected + 1}`, "Same GPU operation"]
      : frame.beat === 0
        ? ["Prepare. Execute.", "Deliver two tokens."]
        : frame.beat === 1
          ? gap
            ? ["GPU ready.", "CPU still working."]
            : ["No host delay.", "No gap to remove."]
          : frame.beat === 2
            ? study.profile === "host-bound"
              ? ["Overlap host work.", "CPU gaps can remain."]
              : ["Next step prepared", "before it is needed."]
            : frame.beat === 3
              ? ["Same output.", "Earlier completion."]
              : ["Earlier delivery.", "Same GPU work."];
  const elapsedA = selectedA?.deliver.end ?? a.finish;
  const elapsedB = selectedB?.deliver.end ?? b.finish;
  const barW = (ms: number) => (ms / study.axisMax) * 155;
  return (
    <g className="so-consequence" data-so-selected={selected ?? "none"}>
      <rect
        x="776"
        y="46"
        width="202"
        height="452"
        rx="6"
        fill="#201f36"
        stroke="#746b96"
      />
      <text x="793" y="77" className="so-small" fill={VIOLET}>
        {selected !== null ? "Linked inspection" : "Scheduling consequence"}
      </text>
      <text x="793" y="112" className="so-card-title">
        {title[0]}
      </text>
      <text x="793" y="137" className="so-card-title">
        {title[1]}
      </text>
      <text
        x="793"
        y="202"
        className="so-metric"
        fill={frame.beat === 1 && selected === null ? RED : VIOLET}
      >
        {frame.beat === 0 && selected === null ? study.inputs.gpu : value}
        <tspan className="so-unit"> ms</tspan>
      </text>
      <text x="793" y="230" className="so-small">
        {selected !== null
          ? "earlier delivery of this step"
          : frame.beat === 0
            ? "GPU work per decode step"
            : frame.beat === 1
              ? "between GPU steps 1 and 2"
              : "earlier final delivery"}
      </text>
      {frame.beat < 2 && selected === null ? (
        <g>
          <text x="793" y="267" className="so-small">
            {frame.beat === 0
              ? "One step, in order"
              : "What occupies the host?"}
          </text>
          {(frame.beat === 0
            ? ([
                ["CPU preparation", study.inputs.prepare, AMBER],
                ["GPU execution", study.inputs.gpu, BLUE],
                ["Host delivery", study.inputs.deliver, VIOLET],
              ] as const)
            : ([
                ["Deliver step 1", study.inputs.deliver, VIOLET],
                ["Prepare step 2", study.inputs.prepare, AMBER],
              ] as const)
          ).map(([label, value, color], i) => (
            <g key={label}>
              <text x="793" y={298 + i * 51} className="so-small" fill={color}>
                {label}
              </text>
              <text
                x="960"
                y={298 + i * 51}
                textAnchor="end"
                className="so-value"
                fill={color}
              >
                {value} ms
              </text>
              <rect
                x="793"
                y={307 + i * 51}
                width={(value / 14) * 155}
                height="11"
                fill={color}
                fillOpacity=".75"
              />
            </g>
          ))}
          <text x="793" y="462" className="so-note">
            {frame.beat === 0
              ? "Each step serves both streams."
              : "These operations keep their cost."}
          </text>
        </g>
      ) : (
        <g>
          <text x="793" y="267" className="so-small">
            {selected !== null ? "Output arrives at" : "Last output arrives at"}
          </text>
          <text x="793" y="290" className="so-small" fill={BLUE}>
            Baseline
          </text>
          <text
            x="960"
            y="290"
            textAnchor="end"
            className="so-value"
            fill={BLUE}
          >
            {elapsedA} ms
          </text>
          <rect
            x="793"
            y="299"
            width={barW(elapsedA)}
            height="11"
            fill={BLUE}
            fillOpacity=".7"
          />
          <text x="793" y="335" className="so-small" fill={GREEN}>
            Overlapped
          </text>
          <text
            x="960"
            y="335"
            textAnchor="end"
            className="so-value"
            fill={GREEN}
          >
            {elapsedB} ms
          </text>
          <rect
            x="793"
            y="344"
            width={barW(elapsedB)}
            height="11"
            fill={GREEN}
            fillOpacity=".85"
          />
          <path
            d={`M${793 + barW(elapsedB)} 367v-6M${793 + barW(elapsedB)} 364H${793 + barW(elapsedA)}v-3`}
            stroke={VIOLET}
            strokeWidth="2"
            fill="none"
          />
          <path d="M793 384H961" stroke="#544c70" />
          <text x="793" y="408" className="so-small">
            GPU work, both lanes
          </text>
          <text x="793" y="440" className="so-card-number" fill={GREEN}>
            {selected !== null ? study.inputs.gpu : a.gpuBusy} ms{" "}
            <tspan fill="#c6d3df">=</tspan>{" "}
            {selected !== null ? study.inputs.gpu : b.gpuBusy} ms
          </text>
          <text x="793" y="474" className="so-note">
            {study.profile === "host-bound"
              ? "CPU gaps remain visible."
              : study.profile === "negligible"
                ? "No overhead means no saving."
                : "Work overlaps; it is not removed."}
          </text>
        </g>
      )}
    </g>
  );
}

export function SchedulingOverlap({
  active = true,
  onBack,
}: {
  active?: boolean;
  onBack?: () => void;
}) {
  const [profile, setProfile] = useState<HostProfile>("balanced");
  const [hover, setHover] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const selected = pinned ?? focus ?? hover;
  const study = useMemo(() => overlapStudy(profile), [profile]);
  const { ref, ...playback } = useStudyPlayback(1, 0, {
    finite: true,
    interval: OVERLAP_DURATION,
    enabled: active,
    held: selected !== null,
  });
  const film = useFilmTime(
    playback.readTime,
    playback.running,
    playback.reduced,
    OVERLAP_DURATION,
    playback.seek,
  );
  const time = playback.finished ? OVERLAP_DURATION : film.time;
  const frame = overlapFrame(time, study);
  const scroll = useRef<HTMLDivElement>(null);
  const moments = useRef<HTMLElement>(null);
  const id = useId().replaceAll(":", "");
  const clear = () => {
    setHover(null);
    setFocus(null);
    setPinned(null);
  };
  const seek = (t: number) => {
    clear();
    film.seek(t);
  };
  const select = (i: number) => {
    setPinned((old) => (old === i ? null : i));
  };
  const x = (ms: number) => 116 + (ms / study.axisMax) * 614;
  const gap = study.baseline.gaps[0];
  const showGap = frame.beat === 1 && gap && selected === null;
  const showDelta =
    frame.beat >= 3 && study.savedElapsed > 0 && selected === null;
  useEffect(() => {
    const el = moments.current;
    if (!el) return;
    const reveal = () => {
      const button = el.querySelector<HTMLElement>('[aria-current="step"]');
      if (!button) return;
      const a = el.getBoundingClientRect(),
        b = button.getBoundingClientRect();
      if (b.left < a.left) el.scrollLeft += b.left - a.left - 4;
      else if (b.right > a.right) el.scrollLeft += b.right - a.right + 4;
    };
    reveal();
    const observer = new ResizeObserver(reveal);
    observer.observe(el);
    return () => observer.disconnect();
  }, [frame.beat]);
  return (
    <section
      className="so-root"
      ref={ref}
      data-time={time}
      data-service-ms={frame.serviceMs}
      data-running={playback.running}
      aria-label="CPU and GPU scheduling overlap investigation"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          clear();
          e.stopPropagation();
        }
      }}
    >
      <header className="so-heading">
        <div>
          <h3>CPU/GPU scheduling overlap</h3>
          <p>{HEADINGS[frame.beat]}</p>
        </div>
        <span>Two fixed streams · event timing</span>
      </header>
      <div
        className="so-controls"
        role="group"
        aria-label="CPU scheduling cost"
      >
        <span>Host work</span>
        {(Object.keys(HOST_PROFILES) as HostProfile[]).map((key) => (
          <button
            type="button"
            key={key}
            aria-pressed={profile === key}
            onClick={() => {
              setProfile(key);
              seek(playback.reduced ? OVERLAP_DURATION : 0);
            }}
          >
            {HOST_PROFILES[key].label}
          </button>
        ))}
        <span className="so-inputs">
          Prepare {study.inputs.prepare} · GPU {study.inputs.gpu} · Deliver{" "}
          {study.inputs.deliver} ms / step
        </span>
      </div>
      <div className="so-mobile-nav">
        <button
          type="button"
          onClick={() =>
            scroll.current?.scrollTo({
              left: 0,
              behavior: playback.reduced ? "instant" : "smooth",
            })
          }
        >
          View schedules
        </button>
        <button
          type="button"
          onClick={() =>
            scroll.current?.scrollTo({
              left: 1000,
              behavior: playback.reduced ? "instant" : "smooth",
            })
          }
        >
          View comparison →
        </button>
      </div>
      <div
        ref={scroll}
        className="so-scroll"
        role="region"
        tabIndex={0}
        aria-label="Scheduling comparison; scroll sideways on narrow screens"
      >
        <svg
          viewBox="0 0 1000 578"
          className="so-diagram"
          role="group"
          aria-labelledby={`${id}-title ${id}-desc`}
        >
          <title id={`${id}-title`}>
            Identical decode work with sequential or overlapped CPU scheduling
          </title>
          <desc id={`${id}-desc`}>
            Select a numbered step in either lane to link its CPU preparation,
            GPU work and two output streams. Both lanes share the execution
            clock. Waiting is red, preparation amber and host delivery violet.
          </desc>
          <text x="24" y="25" className="so-small">
            Execution clock
          </text>
          <text x="730" y="25" textAnchor="end" className="so-clock">
            {n(frame.serviceMs)} ms
          </text>
          {[...Array(Math.floor(study.axisMax / 10) + 1)].map((_, i) => (
            <g key={i}>
              <path
                d={`M${x(i * 10)} 78V493`}
                stroke="#29434f"
                strokeOpacity=".55"
              />
              <text
                x={x(i * 10)}
                y="510"
                textAnchor="middle"
                className="so-index"
              >
                {i * 10}
              </text>
            </g>
          ))}
          <ScheduleLane
            lane={study.baseline}
            study={study}
            frame={frame}
            optimized={false}
            selected={selected}
            select={select}
            preview={setHover}
            focus={setFocus}
          />
          <path d="M24 265H744" stroke="#3a5060" />
          <ScheduleLane
            lane={study.overlapped}
            study={study}
            frame={frame}
            optimized
            selected={selected}
            select={select}
            preview={setHover}
            focus={setFocus}
          />
          <Comparison study={study} frame={frame} selected={selected} />
          {showGap && (
            <g className="so-consequence-link">
              <path
                d={`M${x(gap.start)} 153v7H${x(gap.end)}v-7M${x((gap.start + gap.end) / 2)} 160H759V202H786`}
                stroke={RED}
                strokeWidth="2.5"
                fill="none"
              />
              <circle cx="786" cy="202" r="4" fill={RED} />
              <text
                x={x((gap.start + gap.end) / 2)}
                y="174"
                textAnchor="middle"
                className="so-value"
                fill={RED}
              >
                Δ {gap.end - gap.start} ms
              </text>
            </g>
          )}
          {showDelta && (
            <g className="so-consequence-link">
              <path
                d={`M${x(study.overlapped.finish)} 515v11H${x(study.baseline.finish)}v-11M${x((study.overlapped.finish + study.baseline.finish) / 2)} 526H760V202H786`}
                stroke={VIOLET}
                strokeWidth="2.5"
                fill="none"
              />
              <text
                x={x((study.overlapped.finish + study.baseline.finish) / 2)}
                y="548"
                className="so-value"
                textAnchor="middle"
                fill={VIOLET}
              >
                Δ {study.savedElapsed} ms
              </text>
              <circle cx="786" cy="202" r="4" fill={VIOLET} />
            </g>
          )}
          <g transform="translate(24 566)">
            <text className="so-note" fill={AMBER}>
              P: prepare batch
            </text>
            <text x="145" className="so-note" fill={VIOLET}>
              D: deliver output
            </text>
            <text x="294" className="so-note" fill={RED}>
              Red: GPU waiting for CPU
            </text>
            <text x="520" className="so-note">
              Select a step to follow its output
            </text>
          </g>
        </svg>
      </div>
      <div className="so-transport">
        <button
          type="button"
          disabled={playback.reduced}
          aria-label={
            playback.running
              ? "Pause scheduling overlap"
              : "Play scheduling overlap"
          }
          onClick={() => {
            clear();
            if (time >= OVERLAP_DURATION) {
              film.seek(0);
              playback.replay();
            } else if (selected !== null) playback.resume();
            else playback.toggle();
          }}
        >
          {playback.running ? "Ⅱ" : "▷"}
        </button>
        <input
          type="range"
          min="0"
          max={OVERLAP_DURATION}
          step="10"
          value={time}
          aria-label="Scrub scheduling overlap"
          aria-valuetext={`${n(time / 1000)} presentation seconds, ${n(frame.serviceMs)} execution milliseconds`}
          onChange={(e) => seek(Number(e.target.value))}
        />
        <time>{n(time / 1000)} / 28s</time>
        {selected !== null && (
          <button type="button" onClick={clear}>
            {pinned !== null ? "Release inspection" : "Clear selection"}
          </button>
        )}
      </div>
      <nav
        className="so-moments"
        ref={moments}
        aria-label="Scheduling overlap moments"
      >
        {OVERLAP_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            aria-current={frame.beat === i ? "step" : undefined}
            onClick={() => seek(OVERLAP_MOMENTS[i])}
          >
            {label}
          </button>
        ))}
      </nav>
      <details
        className="so-method"
        onToggle={(e) => {
          if (e.currentTarget.open) seek(time);
        }}
      >
        <summary>Inspect timing assumptions and event trace</summary>
        <p>
          One serial CPU and one serial GPU process a fixed two-stream batch for
          four decode steps. Preparing step N+1 does not require host delivery
          of step N: token IDs remain on-device and GPU execution still waits
          for the preceding sample. Changing host cost does not change GPU work
          or the output sequence. P and D have the same cost in both lanes.
          Warm-up, remaining CPU gaps and final delivery are retained.
        </p>
        <p>
          The film stretches and holds this declared millisecond schedule over
          28 presentation seconds. It is not a DeepInfer benchmark. Earlier
          delivery can shorten the allocated device interval; busy GPU work
          stays fixed. Network, dynamic membership, cancellation, real
          tokenization and hardware variation are outside this example. Its
          totals are not added to the other laboratory experiments.
        </p>
        <p>
          <a
            href="https://github.com/deepseek-ai/DeepInfer/blob/main/doc/inference_deployment_qa.md"
            target="_blank"
            rel="noreferrer"
          >
            DeepInfer: asynchronous scheduling reference ↗
          </a>
        </p>
        <button
          type="button"
          onClick={() => {
            const url = URL.createObjectURL(
              new Blob(
                [JSON.stringify(overlapRecord(study, time, selected), null, 2)],
                { type: "application/json" },
              ),
            );
            const a = document.createElement("a");
            a.href = url;
            a.download = "cpu-gpu-overlap.json";
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}
        >
          Download this schedule as JSON
        </button>
      </details>
      {onBack && (
        <button type="button" className="so-return" onClick={onBack}>
          Return to serving system overview ↗
        </button>
      )}
    </section>
  );
}
