"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { emitMeter } from "./stagecraft/stage-meter";
import type { LabRun } from "./lab-simulation";
import { useFilmTime } from "./use-film-time";
import {
  SCHEDULING_DURATION,
  SCHEDULING_MOMENTS,
  schedulingStudy,
  schedulingFrame,
  schedulingAt,
  FOLLOWED,
} from "./scheduling-study-math";
import "./scheduling-reveal.css";
import { SchedulingLedger } from "./scheduling-ledger";

const BLUE = "#9cc5f5",
  GREEN = "#b8e986",
  RED = "#ff9185",
  AMBER = "#ffc267";
const n = (v: number) =>
  v.toLocaleString("en-US", { maximumFractionDigits: 2 });
const MOMENTS = [
  "Requests arrive",
  "Admit the next request",
  "Follow request 7",
  "Compare work and waiting",
];

export function SchedulingReveal({
  before,
  after,
  playing,
  reduced,
  readTime,
  onSeek,
  onToggle,
}: {
  before: LabRun;
  after: LabRun;
  playing: boolean;
  reduced: boolean;
  readTime: () => number;
  onSeek: (time: number) => void;
  onToggle: () => void;
}) {
  const id = useId(),
    study = useMemo(() => schedulingStudy(before, after), [before, after]);
  const film = useFilmTime(
    readTime,
    playing,
    reduced,
    SCHEDULING_DURATION,
    onSeek,
  );
  const frame = schedulingFrame(film.time, study);
  useEffect(() => { if (playing) emitMeter({ text: MOMENTS[frame.beat], step: frame.beat + 1, total: MOMENTS.length, tone: "optimized" }); }, [frame.beat, playing]);
  const [pinned, setPinned] = useState<number | null>(null);
  const selected = pinned ?? frame.selected;
  const a = study.baseline[selected];
  const x = (time: number) => 92 + (time / study.horizon) * 630;
  const select = (index: number) => {
    setPinned(index);
    film.seek(film.time);
  };
  const seek = (time: number) => {
    setPinned(null);
    film.seek(time);
  };
  const baselineState = schedulingAt(study.baseline, frame.time),
    optimizedState = schedulingAt(study.optimized, frame.time);
  const states = [baselineState, optimizedState];
  const stage = useRef<HTMLDivElement>(null);
  const [links, setLinks] = useState<{ key: string; path: string; color: string }[]>([]);
  useEffect(() => {
    const root = stage.current;
    if (!root) return;
    const update = () => {
      const bounds = root.getBoundingClientRect(), viewport = root.querySelector(".sq-scroll")?.getBoundingClientRect(), ledger = root.querySelector(".sq-ledger")?.getBoundingClientRect();
      if (!viewport || !ledger || ledger.left <= bounds.left + 10) { setLinks([]); return; }
      const next: { key: string; path: string; color: string }[] = [];
      for (const lane of ["baseline", "optimized"]) for (const measure of ["work", "idle"]) {
        if (frame.focus === "baseline" && lane !== "baseline" || frame.focus === "optimized" && lane !== "optimized" || frame.focus === "difference" && measure !== "idle") continue;
        const key = `${lane}-${measure}`;
        const source = root.querySelector(`[data-sq-source="${key}"]`)?.getBoundingClientRect(), target = root.querySelector(`[data-sq-target="${key}"]`)?.getBoundingClientRect();
        if (!source || !target || source.right > viewport.right || source.left < viewport.left) continue;
        next.push({ key, color: measure === "idle" ? RED : lane === "baseline" ? BLUE : GREEN,
          path: `M${source.left + source.width / 2 - bounds.left} ${source.top + source.height / 2 - bounds.top}H${ledger.left - bounds.left + (measure === "idle" ? 7 : 12)}V${target.top + target.height / 2 - bounds.top}H${target.left - bounds.left}` });
      }
      setLinks(next);
    };
    update(); const observer = new ResizeObserver(update); observer.observe(root);
    const ledger = root.querySelector(".sq-ledger"); if (ledger) observer.observe(ledger);
    const scroll = root.querySelector(".sq-scroll"); scroll?.addEventListener("scroll", update, { passive: true });
    return () => { observer.disconnect(); scroll?.removeEventListener("scroll", update); };
  }, [frame.focus, pinned]);
  const download = () => {
    film.seek(film.time);
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            {
              version: "directed-scheduling-v2",
              status: "illustrative, not measured GPU execution",
              sceneTimeMs: film.time,
              serviceTime: frame.time,
              selected,
              study,
              before,
              after,
              limits:
                "Two abstract serial workers. Baseline paired batches wait for both arrivals and both prior completions. Optimized admits FIFO to the first available worker. No batching speedup, contention, network, idle-device billing or verifier cost modeled. Eight-request preview preserves original cohort timestamps.",
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `scheduling-${before.workload}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <section
      className="sq-film"
      aria-label="Directed scheduling experiment"
      data-playing={playing}
      data-beat={pinned !== null ? "pinned" : frame.beat}
      data-focus={frame.focus}
      onKeyDown={(e) => {
        if (e.key === "Escape") setPinned(null);
      }}
    >
      <div className="sq-invariants">
        <span>Same arrivals · same work · 2 workers each</span>
      </div>
      <header className="sq-heading">
        <h3>
          {pinned !== null
            ? `Inspect request ${a.id + 1}`
            : frame.beat === 0
              ? "Eight requests arrive 2 s apart; two workers"
              : frame.beat === 1
                ? `Worker ${study.optimized[2].worker + 1} frees at ${n(study.optimized[2].start)} s; request 3 starts at once instead of waiting for its pair`
                : frame.beat === 2
                  ? `Request 7 starts ${n(study.baseline[FOLLOWED].start - study.optimized[FOLLOWED].start)} s sooner`
                  : frame.focus === "baseline"
                    ? "Baseline: a free worker waits for its partner"
                    : frame.focus === "optimized"
                      ? "Free-worker scheduling: the next request starts immediately"
                      : `Same ${n(study.work)} worker-s of work; request 7 waits ${n(study.baseline[FOLLOWED].start - study.optimized[FOLLOWED].start)} s less`}
        </h3>
        <time>{n(frame.time)} s</time>
      </header>
      <div className="sq-stage" ref={stage}>
        <div className="sq-main">
          <p className="sq-scroll-hint">
            Scroll the worker timeline to inspect →
          </p>
          <div
            className="sq-scroll"
            role="region"
            tabIndex={0}
            aria-label="Paired scheduling timeline; select a request to compare"
          >
            <svg
              className="sq-timeline"
              viewBox="0 0 780 504"
              role="group"
              aria-labelledby={id}
            >
              <title id={id}>
                Six identical requests on two workers per runtime. Baseline
                paired-batch barrier versus independent admission. The same
                request’s service bar has identical width. At {n(frame.time)}{" "}
                seconds, baseline has {baselineState.waiting.length} queued and
                optimized has {optimizedState.waiting.length} queued. Red
                intervals mark an idle worker while arrived work waits.
              </title>
              {study.baseline.map((task, i) => (
                <g
                  key={task.id}
                  className="sq-arrival sq-request"
                  role="button"
                  tabIndex={0}
                  aria-label={`Inspect request ${task.id + 1}, arrives at ${n(task.arrival)} seconds`}
                  aria-pressed={selected === task.id}
                  onClick={() => select(task.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      select(task.id);
                    }
                  }}
                >
                  <rect
                    x={27 + i * 92}
                    y="12"
                    width="86"
                    height="54"
                    rx="4"
                    fill="#132a37"
                    stroke={selected === task.id ? AMBER : "#405665"}
                    className="sq-hit"
                  />
                  <circle
                    cx={37 + i * 92}
                    cy="28"
                    r="3"
                    fill={frame.time >= task.arrival ? AMBER : "#405665"}
                  />
                  <text x={45 + i * 92} y="32" className="sq-label">
                    Request {task.id + 1}
                  </text>
                  <text x={37 + i * 92} y="53" className="sq-small">
                    arrives {n(task.arrival)} s
                  </text>
                </g>
              ))}
              <path d="M27 82H750" className="sq-grid" />
              {[study.baseline, study.optimized].map((tasks, lane) => {
                const yy = 120 + lane * 162,
                  color = lane ? GREEN : BLUE,
                  state = states[lane];
                return (
                  <g
                    key={lane}
                    className="sq-worker-lane"
                    data-lane={lane ? "optimized" : "baseline"}
                  >
                    <text x="27" y={yy} className="sq-title" fill={color}>
                      {lane ? "Optimized" : "Baseline"}
                    </text>
                    <text x="160" y={yy} className="sq-small">
                      {lane
                        ? "Start when a worker is free"
                        : "Wait for both workers"}
                    </text>
                    <text x="722" y={yy} className="sq-small" textAnchor="end">
                      {state.done.length} requests done · {state.waiting.length}{" "}
                      queued
                    </text>
                    {[0, 1].map((worker) => (
                      <g key={worker}>
                        <text
                          x="27"
                          y={yy + 43 + worker * 51}
                          className="sq-label"
                        >
                          W{worker + 1}
                        </text>
                        <path
                          d={`M92 ${yy + 37 + worker * 51}H722`}
                          className="sq-grid"
                        />
                        {lane === 0 &&
                          study.gaps
                            .filter((g) => g.worker === worker)
                            .map((g, i) => (
                              <g
                                key={i}
                                opacity={frame.time > g.start ? 1 : 0.22}
                              >
                                <rect
                                  x={x(g.start)}
                                  y={yy + 23 + worker * 51}
                                  width={Math.max(
                                    0,
                                    x(Math.min(frame.time, g.finish)) -
                                      x(g.start),
                                  )}
                                  height="30"
                                  fill={RED}
                                  fillOpacity=".18"
                                />
                                <path
                                  d={`M${x(g.start)} ${yy + 55 + worker * 51}v4H${x(Math.max(g.start, Math.min(frame.time, g.finish)))}v-4`}
                                  stroke={RED}
                                  strokeWidth="2"
                                  fill="none"
                                />
                              </g>
                            ))}
                      </g>
                    ))}
                    {tasks.map((t) => {
                      const y = yy + 23 + t.worker * 51,
                        progress = Math.max(
                          0,
                          Math.min(1, (frame.time - t.start) / t.gpuSeconds),
                        );
                      return (
                        <g
                          key={t.id}
                          role="button"
                          tabIndex={0}
                          aria-pressed={selected === t.id}
                          aria-label={`Inspect ${lane ? "independent" : "baseline"} request R${t.id + 1}: start ${n(t.start)}, finish ${n(t.finish)} seconds`}
                          className="sq-request"
                          onClick={() => select(t.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              select(t.id);
                            }
                          }}
                        >
                          <rect
                            x={x(t.start)}
                            y={y - 3}
                            width={x(t.finish) - x(t.start)}
                            height="36"
                            rx="3"
                            className="sq-hit"
                          />
                          <rect
                            x={x(t.start)}
                            y={y}
                            width={x(t.finish) - x(t.start)}
                            height="29"
                            rx="2"
                            fill="#152f3e"
                            stroke={selected === t.id ? color : "#354c5b"}
                            strokeWidth={selected === t.id ? 2 : 1}
                          />
                          <rect
                            x={x(t.start)}
                            y={y}
                            width={(x(t.finish) - x(t.start)) * progress}
                            height="29"
                            rx="2"
                            fill={color}
                            opacity={selected === t.id ? 0.85 : 0.45}
                          />
                          <text
                            x={(x(t.start) + x(t.finish)) / 2}
                            y={y + 19}
                            className="sq-task-label"
                            textAnchor="middle"
                          >
                            R{t.id + 1}
                            {frame.time >= t.finish ? " ✓" : ""}
                          </text>
                        </g>
                      );
                    })}
                    <text x="92" y={yy + 127} className="sq-small">
                      {state.active
                        .map(
                          (t) =>
                            `W${t.worker + 1} executing request ${t.id + 1}`,
                        )
                        .join(" · ") ||
                        (state.done.length === 6
                          ? "6 requests delivered"
                          : "Workers available")}
                    </text>
                    <g pointerEvents="none" aria-hidden="true">
                      <path d={`M722 ${yy + 37}H736V${yy + 63}H744M722 ${yy + 88}H736V${yy + 63}`} fill="none" stroke={color} strokeOpacity=".6" />
                      <circle data-sq-source={`${lane ? "optimized" : "baseline"}-work`} cx="754" cy={yy + 63} r="10" fill="#10202e" stroke={color} />
                      <text x="754" y={yy + 67} textAnchor="middle" fill={color} fontSize="12">Σ</text>
                      <path d={`M722 ${yy + 109}H744`} stroke={RED} strokeOpacity=".7" />
                      {(lane ? study.optimizedGaps : study.gaps).filter(gap => frame.time > gap.start).map((gap, gapIndex) => <path key={gapIndex}
                        d={`M${x(Math.min(frame.time, gap.finish))} ${yy + 59 + gap.worker * 51}H730V${yy + 109}H744`}
                        fill="none" stroke={RED} strokeOpacity={frame.focus === "difference" || frame.focus === (lane ? "optimized" : "baseline") ? .7 : .3} />)}
                      <circle data-sq-source={`${lane ? "optimized" : "baseline"}-idle`} cx="754" cy={yy + 109} r="10" fill="#2d1e27" stroke={RED} />
                      <text x="754" y={yy + 113} textAnchor="middle" fill={RED} fontSize="12">Σ</text>
                    </g>
                  </g>
                );
              })}
              <path
                d={`M${x(frame.time)} 72V415`}
                stroke="#e1edf6"
                strokeWidth="1"
                strokeDasharray="3 5"
              />
              {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                <g key={v}>
                  <path d={`M${x(study.horizon * v)} 433v5`} stroke="#8ba0b0" />
                  <text
                    x={x(study.horizon * v)}
                    y="454"
                    className="sq-small"
                    textAnchor="middle"
                  >
                    {n(study.horizon * v)}s
                  </text>
                </g>
              ))}
              <path d="M92 433H722" className="sq-grid" />
              <path d="M27 481h21" stroke={RED} strokeWidth="3" />
              <text x="58" y="485" className="sq-label">
                idle worker while a request waits
              </text>
            </svg>
          </div>
        </div>
        <SchedulingLedger
          study={study}
          time={frame.time}
          selected={selected}
          focus={frame.focus}
          pinned={pinned !== null}
          onRelease={() => setPinned(null)}
          onCompare={(i) => seek([24500, 28000, 31500][i])}
        />
        <svg className="sq-result-links" aria-hidden="true">{links.map(link => <path key={link.key} d={link.path} stroke={link.color} strokeWidth="1.4" fill="none" />)}</svg>
      </div>
      <div className="sq-transport">
        <button
          type="button"
          disabled={reduced}
          onClick={() => {
            setPinned(null);
            onToggle();
          }}
          aria-label={
            playing
              ? "Pause scheduling experiment"
              : "Play scheduling experiment"
          }
        >
          {playing ? "Ⅱ" : "▷"}
        </button>
        <input
          type="range"
          min="0"
          max={SCHEDULING_DURATION}
          step="10"
          value={film.time}
          aria-label="Scrub scheduling experiment"
          aria-valuetext={`${n(film.time / 1000)} seconds, ${MOMENTS[frame.beat]}`}
          onChange={(e) => seek(Number(e.target.value))}
        />
        <time>
          {n(film.time / 1000)} / {SCHEDULING_DURATION / 1000}s
        </time>
      </div>
      <nav className="sq-moments" aria-label="Scheduling experiment moments">
        {MOMENTS.map((label, i) => (
          <button
            key={label}
            type="button"
            aria-current={frame.beat === i ? "step" : undefined}
            onClick={() => seek(SCHEDULING_MOMENTS[i])}
          >
            {label}
          </button>
        ))}
      </nav>
      <details
        className="sq-method"
        onToggle={(e) => {
          if (e.currentTarget.open && playing) film.seek(film.time);
        }}
      >
        <summary>Inspect scheduling assumptions and trace</summary>
        <button type="button" onClick={download}>
          Download scheduling trace ↗
        </button>
        <p>
          These eight requests retain their original cohort arrival times, service
          times and answers. Baseline launches fixed pairs only after both
          requests have arrived and the preceding pair has finished. Independent
          admission sends the next arrived request to the first available
          worker. Red marks only idle intervals with arrived work waiting, not
          all idle time. This is a two-worker teaching model, not a measured
          continuous-batching engine.
        </p>
        <p>
          The selected request comparison starts at its arrival; the main
          timeline uses the common absolute clock. Queue time plus service time
          equals response latency. Both complete the same {n(study.work)}{" "}
          GPU-seconds of busy work for these six requests. Allocation charges,
          verifier cost, memory contention and network effects are not modeled.
          All 96 original task records are included in the export.
        </p>
      </details>
    </section>
  );
}
