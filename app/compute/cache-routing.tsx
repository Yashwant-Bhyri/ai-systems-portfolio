"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useStudyPlayback } from "./use-study-playback";
import { useFilmTime } from "./use-film-time";
import {
  CACHE_ROUTING_DEFAULT,
  CACHE_ROUTING_DURATION,
  CACHE_ROUTING_LABELS,
  CACHE_ROUTING_MOMENTS,
  cacheRoutingStudy,
  cacheRoutingFrame,
  cacheRoutingSweep,
  type CacheRoutingConfig,
  type CacheRoutingStudy,
  type CacheRoute,
} from "./cache-routing-model";
import "./cache-routing.css";

const BLUE = "#9cc5f5",
  VIOLET = "#c7a6ff",
  GREEN = "#b8e986",
  RED = "#ff9185",
  AMBER = "#ffc267";
type Frame = ReturnType<typeof cacheRoutingFrame>;
type Inspection = { route: CacheRoute; page: number } | null;
const fmt = (n: number) => Number(n.toFixed(1)).toString();
const routeName = (r: CacheRoute) => (r === "warm" ? "Replica A" : "Replica B");
const titles = [
  "Locate compatible KV state",
  "Check capacity before admission",
  "Release pages, then process the input",
  "Compare first-token delivery",
  "Separate waiting from saved work",
  "Find the routing crossover",
  "Release the request's private pages",
];

function RoutingDiagram({
  study,
  frame,
  onInspect,
  onRelease,
}: {
  study: CacheRoutingStudy;
  frame: Frame;
  onInspect: (x: Inspection) => void;
  onRelease: (milliseconds: number) => void;
}) {
  const id = useId();
  const tx = (t: number) => 113 + (t / study.horizon) * 603;
  const sweep = useMemo(() => cacheRoutingSweep(study.config), [study]);
  const sx = (t: number) => 88 + (t / 100) * 630;
  const sy = (t: number) => 440 - (t / 180) * 316;
  const pickRelease = (event: React.PointerEvent<SVGGElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const x = point.matrixTransform(matrix.inverse()).x;
    onRelease(
      Math.round(Math.max(0, Math.min(100, ((x - 88) / 630) * 100)) / 10) * 10,
    );
  };
  return (
    <svg
      viewBox="0 0 780 614"
      className="cr-diagram"
      role="group"
      aria-labelledby={`${id}-title`}
    >
      <title id={`${id}-title`}>
        Request C, two alternative placements.{" "}
        {frame.chart
          ? "First-token latency versus memory-release delay."
          : `${fmt(Math.max(0, frame.service))} milliseconds. Replica A ${frame.warm.phase}; Replica B ${frame.cold.phase}.`}
      </title>
      <defs>
        <pattern
          id={`${id}-wait`}
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <path d="M1 0V8" stroke={RED} strokeOpacity=".3" />
        </pattern>
      </defs>
      <text x="28" y="24" className="cr-section">
        Request C · “What changed in the liability cap?”
      </text>
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} transform={`translate(${28 + i * 46} 40)`}>
          <rect
            width="38"
            height="30"
            rx="3"
            fill={i < 4 ? "#183044" : i < 6 ? "#3a3024" : "#10212d"}
            stroke={i < 4 ? BLUE : i < 6 ? AMBER : GREEN}
            strokeDasharray={i >= 6 ? "3 3" : undefined}
          />
          <text
            x="19"
            y="20"
            textAnchor="middle"
            className="cr-small"
            fill={i < 4 ? BLUE : i < 6 ? AMBER : GREEN}
          >
            {i < 4 ? `P${i + 1}` : i < 6 ? `S${i - 3}` : `O${i - 5}`}
          </text>
        </g>
      ))}
      <text x="421" y="51" className="cr-small">
        96 input tokens · up to 32 output tokens
      </text>
      <text x="421" y="69" className="cr-small">
        P: shared prefix · S: new suffix · O: output reserve
      </text>

      <g
        className="cr-focus-layer"
        opacity={frame.chart ? 0 : 1}
        style={{ visibility: frame.chart ? "hidden" : "visible" }}
        aria-hidden={frame.chart}
      >
        {(["warm", "cold"] as const).map((key, index) => {
          const s = frame[key],
            r = study[key],
            y = 120 + index * 208,
            color = key === "warm" ? VIOLET : BLUE;
          const computing = s.admitted && !s.completed;
          return (
            // Replica A's capacity check is narrated alone; B rejoins for the comparison.
            <g key={key} className="cr-replica" data-quiet={key === "cold" && (frame.beat === 1 || frame.beat === 2)}>
              <text x="28" y={y - 14} className="cr-section" fill={color}>
                {routeName(key)} ·{" "}
                {s.completed
                  ? "prefix now retained"
                  : r.hit
                    ? "prefix ready"
                    : "no cached prefix"}
              </text>
              <text
                x="735"
                y={y - 14}
                textAnchor="end"
                className="cr-small"
                fill={
                  s.phase === "waiting for KV" ||
                  (frame.service < 0 && r.start > 0)
                    ? RED
                    : GREEN
                }
              >
                {frame.service < 0
                  ? r.start > 0
                    ? "KV capacity blocks admission"
                    : "capacity available"
                  : s.phase}
              </text>
              {s.pages.map((p) => {
                const x = 28 + (p.id % 6) * 49,
                  py = y + Math.floor(p.id / 6) * 46;
                const tint =
                  p.kind === "resident"
                    ? RED
                    : p.kind === "prefix"
                      ? BLUE
                      : p.kind === "private"
                        ? GREEN
                        : "#587080";
                const label =
                  p.kind === "resident"
                    ? "R"
                    : p.kind === "prefix"
                      ? `P${p.logical! + 1}`
                      : p.kind === "private"
                        ? p.logical! < 6
                          ? `S${p.logical! - 3}`
                          : `O${p.logical! - 5}`
                        : "·";
                return (
                  <g
                    key={p.id}
                    className="cr-hotspot"
                    data-quiet={frame.beat === 0 && p.kind === "resident"}
                    role="button"
                    tabIndex={0}
                    aria-label={`Inspect ${routeName(key)} page ${p.id}: ${p.kind}, ${p.refs} references`}
                    onClick={(e) => {
                      e.currentTarget.focus();
                      onInspect({ route: key, page: p.id });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onInspect({ route: key, page: p.id });
                      }
                    }}
                  >
                    <rect
                      x={x}
                      y={py}
                      width="42"
                      height="36"
                      rx="3"
                      fill={
                        p.kind === "resident"
                          ? "#35272e"
                          : p.kind === "prefix"
                            ? "#173044"
                            : p.kind === "private"
                              ? "#223a30"
                              : "#101f2b"
                      }
                      stroke={tint}
                      strokeWidth={p.refs > 0 ? 1.5 : 1}
                      strokeDasharray={
                        p.kind !== "free" && !p.ready ? "3 3" : undefined
                      }
                    />
                    {p.refs > 0 &&
                      p.kind !== "resident" &&
                      frame.service >= r.start &&
                      frame.service < r.start + 6 && (
                        <rect
                          x={x - 2}
                          y={py - 2}
                          width="46"
                          height="40"
                          rx="4"
                          fill="none"
                          stroke={VIOLET}
                          strokeWidth="2"
                          opacity={1 - (frame.service - r.start) / 6}
                        />
                      )}
                    <text
                      x={x + 21}
                      y={py + 17}
                      textAnchor="middle"
                      className="cr-page"
                      fill={p.kind === "free" ? "#afc7d6" : tint}
                    >
                      {label}
                    </text>
                    <text
                      x={x + 21}
                      y={py + 29}
                      textAnchor="middle"
                      className="cr-tiny"
                    >
                      #{p.id} · {p.refs} ref
                    </text>
                  </g>
                );
              })}
              <text x="28" y={y + 101} className="cr-small">
                {s.free} empty · {s.retained} retained · {s.owned} referenced
              </text>
              <text
                x="28"
                y={y + 120}
                className="cr-tiny"
                fill={s.admitted && !s.completed ? VIOLET : "#bfd0dc"}
              >
                {s.admitted && !s.completed
                  ? `C → ${r.blockTable.map((p) => `#${p}`).join(" ")}`
                  : s.completed
                    ? "C's block table released"
                    : key === "warm"
                      ? `R owns ${r.resident} pages until ${r.release} ms`
                      : "No resident request holds memory"}
              </text>
              <path
                d={`M332 ${y + 40}H368m-6-5 6 5-6 5`}
                stroke={
                  s.admitted || (frame.service < 0 && r.start === 0)
                    ? GREEN
                    : RED
                }
                strokeWidth="2"
                fill="none"
              />
              {!s.admitted && r.start > 0 && (
                <path d={`M352 ${y + 26}v28`} stroke={RED} strokeWidth="3" />
              )}
              <text x="378" y={y + 9} className="cr-small">
                Input work on this replica
              </text>
              {Array.from({ length: 6 }, (_, j) => {
                const reused = j < r.reuse;
                const progress = reused
                  ? 1
                  : Math.max(0, Math.min(1, s.prefilled - (j - r.reuse)));
                return (
                  <g key={j} transform={`translate(${378 + j * 60} ${y + 23})`}>
                    <rect
                      width="51"
                      height="35"
                      rx="3"
                      fill="#122430"
                      stroke={reused ? BLUE : AMBER}
                    />
                    <rect
                      x="2"
                      y="2"
                      width={47 * progress}
                      height="31"
                      fill={reused ? BLUE : AMBER}
                      fillOpacity={reused ? 0.2 : 0.32}
                    />
                    <text
                      x="25.5"
                      y="22"
                      textAnchor="middle"
                      className="cr-page"
                      fill={reused ? BLUE : AMBER}
                    >
                      {j < 4 ? `P${j + 1}` : `S${j - 3}`}
                    </text>
                    <text
                      x="25.5"
                      y="51"
                      textAnchor="middle"
                      className="cr-tiny"
                    >
                      {reused
                        ? s.admitted
                          ? "reused"
                          : "ready"
                        : progress === 1
                          ? "read"
                          : "prefill"}
                    </text>
                  </g>
                );
              })}
              {computing && s.phase === "processing input" && (
                <circle
                  cx={378 + Math.min(5, r.reuse + s.prefilled) * 60}
                  cy={y + 17}
                  r="3"
                  fill={AMBER}
                />
              )}
              <text x="378" y={y + 101} className="cr-small">
                {s.emitted} / 32 answer tokens
              </text>
              {Array.from({ length: 32 }, (_, j) => (
                <rect
                  key={j}
                  x={378 + j * 11.05}
                  y={y + 111}
                  width="7.5"
                  height="9"
                  rx="1"
                  fill={j < s.emitted ? GREEN : "#203543"}
                />
              ))}
              <g className="cr-timeline" data-quiet={frame.beat < 2}>
                <text x="28" y={y + 149} className="cr-small">
                  Request clock
                </text>
                <path d={`M113 ${y + 145}H716`} stroke="#476070" />
                {r.start > 0 && (
                  <rect
                    x="113"
                    y={y + 135}
                    width={tx(r.start) - 113}
                    height="20"
                    fill={`url(#${id}-wait)`}
                    stroke={RED}
                  />
                )}
                <rect
                  x={tx(r.start)}
                  y={y + 135}
                  width={tx(r.prefillEnd) - tx(r.start)}
                  height="20"
                  fill={AMBER}
                  fillOpacity=".26"
                  stroke={AMBER}
                />
                <rect
                  x={tx(r.prefillEnd)}
                  y={y + 135}
                  width={tx(r.complete) - tx(r.prefillEnd)}
                  height="20"
                  fill={GREEN}
                  fillOpacity=".16"
                  stroke={GREEN}
                />
                <path
                  d={`M${tx(r.firstToken)} ${y + 130}v30`}
                  stroke={color}
                  strokeWidth="2"
                />
                <text
                  x={tx(r.firstToken) + 5}
                  y={y + 174}
                  className="cr-small"
                  fill={color}
                >
                  TTFT {r.firstToken} ms
                </text>
                <circle
                  cx={tx(Math.max(0, frame.service))}
                  cy={y + 145}
                  r="4"
                  fill="#f0f6fa"
                />
              </g>
            </g>
          );
        })}
        <text x="28" y="524" className="cr-small">
          One elapsed clock · {fmt(Math.max(0, frame.service))} ms
        </text>
        <g transform="translate(365 516)">
          <rect width="9" height="9" fill={RED} />
          <text x="15" y="9" className="cr-small">
            KV wait
          </text>
          <rect x="85" width="9" height="9" fill={AMBER} />
          <text x="100" y="9" className="cr-small">
            prefill
          </text>
          <rect x="165" width="9" height="9" fill={GREEN} />
          <text x="180" y="9" className="cr-small">
            decode
          </text>
        </g>
        {frame.beat >= 3 &&
          frame.beat < 6 &&
          !frame.chart &&
          study.delta !== 0 && (
            <g>
              <path
                d={`M${tx(study.warm.firstToken)} 297V543M${tx(study.cold.firstToken)} 505V543`}
                stroke={VIOLET}
                strokeOpacity=".5"
                strokeDasharray="2 5"
                fill="none"
              />
              <path
                data-cr-source
                d={`M${tx(Math.min(study.warm.firstToken, study.cold.firstToken))} 543v8H${tx(Math.max(study.warm.firstToken, study.cold.firstToken))}v-8`}
                stroke={study.delta > 0 ? VIOLET : RED}
                fill="none"
                strokeWidth="2"
              />
              <text
                x={(tx(study.warm.firstToken) + tx(study.cold.firstToken)) / 2}
                y="574"
                textAnchor="middle"
                className="cr-page"
                fill={study.delta > 0 ? VIOLET : RED}
              >
                Δ {Math.abs(study.delta)} ms
              </text>
            </g>
          )}
        {frame.beat === 6 && (
          <text x="28" y="566" className="cr-section" fill={BLUE}>
            Both prefixes remain cached. Private pages are free.
          </text>
        )}
      </g>

      {frame.chart && (
        <g className="cr-chart-reveal">
          <text x="28" y="117" className="cr-section">
            Routing sensitivity · change R&apos;s release delay
          </text>
          {[0, 40, 80, 120, 160].map((v) => (
            <g key={v}>
              <path d={`M88 ${sy(v)}H718`} stroke="#304957" />
              <text x="76" y={sy(v) + 4} textAnchor="end" className="cr-small">
                {v}
              </text>
            </g>
          ))}
          {[0, 20, 40, 60, 80, 100].map((v) => (
            <g key={v}>
              <path d={`M${sx(v)} 440v5`} stroke="#8099aa" />
              <text x={sx(v)} y="464" textAnchor="middle" className="cr-small">
                {v}
              </text>
            </g>
          ))}
          <text x="88" y="145" className="cr-small">
            First-token latency (ms) ↓
          </text>
          <text x="403" y="492" textAnchor="middle" className="cr-small">
            Delay before request R releases its KV pages (ms)
          </text>
          {study.crossover !== null && study.config.retained && (
            <g>
              <rect
                x="88"
                y="158"
                width={sx(study.crossover) - 88}
                height="282"
                fill={VIOLET}
                fillOpacity=".06"
              />
              <path
                d={`M${sx(study.crossover)} 158V440`}
                stroke="#8c91a4"
                strokeDasharray="4 5"
              />
              <text x={sx(study.crossover) + 8} y="172" className="cr-small">
                {study.crossover} ms crossover
              </text>
            </g>
          )}
          <path
            d={sweep
              .map((p, i) => `${i ? "L" : "M"}${sx(p.releaseMs)} ${sy(p.cold)}`)
              .join(" ")}
            stroke={BLUE}
            strokeWidth="2.5"
            fill="none"
          />
          <path
            d={sweep
              .map((p, i) => `${i ? "L" : "M"}${sx(p.releaseMs)} ${sy(p.warm)}`)
              .join(" ")}
            stroke={VIOLET}
            strokeWidth="3"
            strokeDasharray={!study.config.retained ? "8 5" : undefined}
            fill="none"
          />
          <path
            d={`M${sx(study.config.releaseMs)} 170V440`}
            stroke="#8c91a4"
            strokeDasharray="2 5"
          />
          <circle
            cx={sx(study.config.releaseMs)}
            cy={sy(study.warm.firstToken)}
            r="6"
            fill={VIOLET}
            stroke="#111d2a"
            strokeWidth="2"
          />
          <circle
            cx={sx(study.config.releaseMs)}
            cy={sy(study.cold.firstToken)}
            r="6"
            fill={BLUE}
            stroke="#111d2a"
            strokeWidth="2"
          />
          {study.delta !== 0 && (
            <path
              data-cr-source
              d={`M${sx(study.config.releaseMs) + 12} ${sy(study.warm.firstToken)}h8V${sy(study.cold.firstToken)}h-8`}
              stroke={study.delta > 0 ? VIOLET : RED}
              strokeWidth="2"
              fill="none"
            />
          )}
          <g
            className="cr-plot-control"
            role="slider"
            tabIndex={0}
            aria-orientation="horizontal"
            aria-label="Inspect routing by memory-release delay"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={study.config.releaseMs}
            aria-valuetext={`${fmt(study.config.releaseMs)} milliseconds release delay; A first token ${fmt(study.warm.firstToken)} milliseconds, B ${fmt(study.cold.firstToken)} milliseconds`}
            onPointerDown={(event) => {
              // Touch keeps native diagram panning; the release slider remains
              // available above it. Mouse/pen can scrub the plot itself.
              if (event.pointerType === "touch") return;
              event.currentTarget.focus();
              event.currentTarget.setPointerCapture(event.pointerId);
              pickRelease(event);
            }}
            onPointerMove={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId))
                pickRelease(event);
            }}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId))
                event.currentTarget.releasePointerCapture(event.pointerId);
            }}
            onKeyDown={(event) => {
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? 100
                    : event.key === "ArrowLeft" || event.key === "ArrowDown"
                      ? Math.max(0, study.config.releaseMs - 10)
                      : event.key === "ArrowRight" || event.key === "ArrowUp"
                        ? Math.min(100, study.config.releaseMs + 10)
                        : null;
              if (next !== null) {
                event.preventDefault();
                onRelease(next);
              }
            }}
          >
            <rect x="88" y="150" width="630" height="295" fill="transparent" />
          </g>
          <text x="88" y="529" className="cr-page" fill={VIOLET}>
            Replica A ·{" "}
            {study.config.retained ? "reuse if admitted" : "prefix evicted"}
          </text>
          <text x="430" y="529" className="cr-page" fill={BLUE}>
            Replica B · read the full input
          </text>
          <text x="88" y="563" className="cr-small">
            {fmt(study.config.releaseMs)} ms release delay ·{" "}
            {study.winner === "tie"
              ? "equal first-token times"
              : `${routeName(study.winner)} delivers first`}
          </text>
        </g>
      )}
    </svg>
  );
}

export function CacheRouting({ active = true }: { active?: boolean }) {
  const [config, setConfig] = useState<CacheRoutingConfig>(
    CACHE_ROUTING_DEFAULT,
  );
  const [inspection, setInspection] = useState<Inspection>(null);
  const origin = useRef<Element | null>(null);
  const selectedStudy = useMemo(() => cacheRoutingStudy(config), [config]);
  const { ref: playbackRef, ...playback } = useStudyPlayback(1, 0, {
    finite: true,
    interval: CACHE_ROUTING_DURATION,
    enabled: active,
  });
  const film = useFilmTime(
    playback.readTime,
    playback.running,
    playback.reduced,
    CACHE_ROUTING_DURATION,
    playback.seek,
  );
  const currentTime = playback.finished ? CACHE_ROUTING_DURATION : film.time;
  const frame = cacheRoutingFrame(currentTime, selectedStudy);
  const probeReleaseMs = Math.round(frame.probeReleaseMs);
  const study = useMemo(
    () => cacheRoutingStudy({ ...config, releaseMs: probeReleaseMs }),
    [config, probeReleaseMs],
  );
  const stage = useRef<HTMLDivElement>(null);
  const [link, setLink] = useState<{
    x: number;
    y: number;
    tx: number;
    ty: number;
  } | null>(null);
  const seek = (t: number) => {
    setInspection(null);
    film.seek(t);
  };
  const change = (next: Partial<CacheRoutingConfig>) => {
    setConfig((c) => ({ ...c, ...next }));
    seek(frame.chart ? 30000 : 0);
  };
  const inspect = (next: Inspection) => {
    origin.current = document.activeElement;
    film.seek(currentTime);
    setInspection(next);
  };
  const release = () => {
    setInspection(null);
    const el = origin.current;
    if (el instanceof HTMLElement || el instanceof SVGElement)
      el.focus({ preventScroll: true });
  };
  useEffect(() => {
    if (!inspection) return;
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setInspection(null);
        const el = origin.current;
        if (el instanceof HTMLElement || el instanceof SVGElement)
          el.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [inspection]);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const update = () => {
      const b = el.getBoundingClientRect(),
        s = el.querySelector("[data-cr-source]")?.getBoundingClientRect(),
        t = el.querySelector("[data-cr-target]")?.getBoundingClientRect(),
        viewport = el.querySelector(".cr-scroll")?.getBoundingClientRect();
      setLink(
        s &&
          t &&
          viewport &&
          t.left >= viewport.right &&
          s.right <= viewport.right
          ? {
              x: s.right - b.left,
              y: s.top - b.top + s.height / 2,
              tx: t.left - b.left - 10,
              ty: t.top - b.top + t.height / 2,
            }
          : null,
      );
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    const card = el.querySelector(".cr-card");
    if (card) ro.observe(card);
    const scroller = el.querySelector(".cr-scroll");
    scroller?.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      scroller?.removeEventListener("scroll", update);
    };
  }, [frame.beat, inspection, config, probeReleaseMs]);
  const inspected = inspection
    ? frame[inspection.route].pages[inspection.page]
    : null;
  const result = frame.beat >= 3 && frame.beat < 6;
  const winner =
    study.winner === "tie" ? "Both replicas" : routeName(study.winner);
  return (
    <section
      ref={playbackRef}
      className="cr-root"
      data-time={currentTime}
      data-playing={playback.running}
      data-service={frame.service}
      data-beat={frame.beat}
      aria-label="KV capacity and cache-aware routing investigation"
    >
      <header className="cr-heading">
        <div>
          <h3>Request C: warm replica A vs cold replica B</h3>
          <p>
            {frame.chart && study.crossover === null
              ? "Available pages remove the waiting penalty"
              : titles[frame.beat]}
          </p>
        </div>
        <span>Event trace · alternative placements</span>
      </header>
      <div className="cr-controls">
        <div role="group" aria-label="Prefix on replica A">
          <span>Prefix on A</span>
          {([true, false] as const).map((value) => (
            <button
              key={String(value)}
              type="button"
              aria-pressed={config.retained === value}
              onClick={() => change({ retained: value })}
            >
              {value ? "Ready" : "Evicted"}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Pages held by request R">
          <span>Existing request R holds</span>
          {([4, 8] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={config.occupied === value}
              onClick={() => change({ occupied: value })}
            >
              {value} / 12 pages
            </button>
          ))}
        </div>
        <label className="cr-release-control">
          R releases at{" "}
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={frame.chart ? probeReleaseMs : config.releaseMs}
            onChange={(e) => change({ releaseMs: Number(e.target.value) })}
          />
          <output>{frame.chart ? probeReleaseMs : config.releaseMs} ms</output>
        </label>
      </div>
      <p className="cr-scroll-hint">
        Scroll the memory and timing diagram sideways →
      </p>
      <div className="cr-stage" ref={stage}>
        <div
          className="cr-scroll"
          tabIndex={0}
          role="region"
          aria-label="Cache routing diagram, scroll sideways on narrow screens"
        >
          <RoutingDiagram
            study={study}
            frame={frame}
            onInspect={inspect}
            onRelease={(releaseMs) => change({ releaseMs })}
          />
        </div>
        {!inspection && result && link && study.delta !== 0 && (
          <svg
            className="cr-link"
            aria-hidden="true"
            style={{ color: study.delta > 0 ? VIOLET : RED }}
          >
            <path
              d={`M${link.x} ${link.y}H${link.tx - 12}Q${link.tx} ${link.y} ${link.tx} ${link.y - 12}V${link.ty + 12}Q${link.tx} ${link.ty} ${link.tx + 8} ${link.ty}`}
            />
            <circle cx={link.tx + 8} cy={link.ty} r="3" />
          </svg>
        )}
        <aside className="cr-card" aria-label="Routing consequence">
          {inspection && inspected ? (
            <>
              <span>Inspection paused</span>
              <h4>
                {routeName(inspection.route)} · page {inspected.id}
              </h4>
              <dl>
                <div>
                  <dt>State</dt>
                  <dd>{inspected.kind}</dd>
                </div>
                <div>
                  <dt>References</dt>
                  <dd>{inspected.refs}</dd>
                </div>
                <div>
                  <dt>KV computed</dt>
                  <dd>{inspected.ready ? "yes" : "no"}</dd>
                </div>
                <div>
                  <dt>Logical request block</dt>
                  <dd>
                    {inspected.logical === null ? "none" : inspected.logical}
                  </dd>
                </div>
              </dl>
              <p>
                {inspected.kind === "resident"
                  ? "Request R still owns this page. Admission cannot overwrite live KV."
                  : inspected.kind === "prefix"
                    ? inspected.refs
                      ? frame[inspection.route].route.hit
                        ? "Request C references this prefix in place. Reuse does not copy it into a second allocation."
                        : inspected.ready
                          ? "Request C computed this prefix here. It remains referenced until C completes."
                          : "Request C is computing this new prefix page. Its input work has not completed."
                      : "Computed prefix with zero references. It can be reused or reclaimed by a later allocation."
                    : inspected.kind === "private"
                      ? "Private suffix or reserved output capacity belongs to C until completion."
                      : "This slot has no retained prefix or live request owner."}
              </p>
              <button type="button" onClick={release}>
                Return to the comparison
              </button>
            </>
          ) : (
            <>
              <span>
                {result
                  ? frame.chart
                    ? "Sensitivity sweep · same request, alternate wait"
                    : "Same input · same output allowance"
                  : "Request C · 12 pages per replica"}
              </span>
              <h4>
                {frame.beat === 0
                  ? config.retained
                    ? `A already holds ${study.workAvoided * 16} of C's ${study.cold.prefillBlocks * 16} input tokens; B must read all ${study.cold.prefillBlocks * 16}`
                    : "No retained prefix. Both must read it."
                  : frame.beat === 1
                    ? config.retained
                      ? "A cache hit still needs free pages."
                      : "No prefix hit. Allocate the full input."
                    : frame.beat === 2
                      ? study.warm.start
                        ? `A must wait ${study.warm.start} ms for request R to free pages`
                        : "Allocate memory, then process input."
                      : frame.beat === 3
                        ? study.winner === "tie" ? "Both first tokens arrive together" : `${winner}'s first token arrives ${Math.abs(study.delta)} ms sooner`
                        : frame.beat === 6
                          ? "C is done: private pages freed, the shared prefix stays"
                          : study.delta < 0
                            ? config.retained
                              ? `Past ${study.workAvoided * study.prefillMsPerBlock} ms of waiting, send C to the cold replica`
                              : "No cache saving offsets the wait."
                            : study.delta === 0
                              ? "Equal first-token time. Check the work."
                              : "Reuse wins when the memory wait is short."}
              </h4>
              {frame.beat === 0 ? (
                <>
                  <dl>
                    <div>
                      <dt>Input tokens</dt>
                      <dd>96</dd>
                    </div>
                    <div>
                      <dt>Ready on A</dt>
                      <dd>{study.warm.reuse * 16}</dd>
                    </div>
                    <div>
                      <dt>A must process</dt>
                      <dd>{study.warm.prefillBlocks * 16}</dd>
                    </div>
                    <div>
                      <dt>B must process</dt>
                      <dd>96</dd>
                    </div>
                  </dl>
                  <p>
                    {config.retained
                      ? "The matching prefix is retained model state. The new suffix and answer still need execution."
                      : "Without retained KV state, both replicas must process the entire input before generating an answer."}
                  </p>
                </>
              ) : result ? (
                <>
                  <div
                    className="cr-delta"
                    data-cr-target
                    data-hero={study.delta > 0}
                    style={{ color: study.delta < 0 ? RED : VIOLET }}
                  >
                    <strong>
                      Δ {Math.abs(study.delta)}
                      <small> ms</small>
                    </strong>
                    <span>
                      {study.delta === 0
                        ? "equal first-token latency"
                        : study.winner === "warm" ? "sooner first token on warm replica A" : "sooner on cold replica B: A waits too long"}
                    </span>
                  </div>
                  <dl>
                    <div>
                      <dt>Replica B · full input</dt>
                      <dd>{study.cold.firstToken} ms</dd>
                    </div>
                    <div>
                      <dt>Replica A · reused prefix</dt>
                      <dd>{study.warm.firstToken} ms</dd>
                    </div>
                  </dl>
                  <p className="cr-equation">
                    {`A saves ${study.workAvoided * study.prefillMsPerBlock} ms of prefill and waits ${study.warm.start} ms: `}
                    <strong>
                      {study.delta === 0 ? "same first-token time" : `first token ${Math.abs(study.delta)} ms ${study.delta > 0 ? "sooner" : "later"} than B`}
                    </strong>
                  </p>
                </>
              ) : frame.beat === 6 ? (
                <>
                  <dl>
                    <div>
                      <dt>Private pages released</dt>
                      <dd>4 each</dd>
                    </div>
                    <div>
                      <dt>Ready prefix retained</dt>
                      <dd>4 each</dd>
                    </div>
                    <div>
                      <dt>Pages still held by C</dt>
                      <dd>0</dd>
                    </div>
                    <div>
                      <dt>Answer tokens delivered</dt>
                      <dd>32 each</dd>
                    </div>
                  </dl>
                  <p>
                    B has now paid to compute the prefix too. A later matching
                    request can reuse it on either replica.
                  </p>
                </>
              ) : (
                <>
                  <dl>
                    <div>
                      <dt>A · reusable prefix</dt>
                      <dd>{study.warm.reuse} pages</dd>
                    </div>
                    <div>
                      <dt>A · new pages needed</dt>
                      <dd>{study.warm.newBlocks}</dd>
                    </div>
                    <div>
                      <dt>A · empty slots at arrival</dt>
                      <dd>
                        {study.config.releaseMs === 0
                          ? 12 - study.warm.reuse
                          : study.warm.headroom}
                      </dd>
                    </div>
                  </dl>
                  <div className="cr-gate" data-held={study.warm.start > 0}>
                    <strong>
                      {study.warm.start
                        ? `Wait ${study.warm.start} ms`
                        : "Admit at arrival"}
                    </strong>
                    <span>
                      {study.warm.start
                        ? "R's release creates enough room."
                        : config.retained
                          ? "The suffix and output reserve fit."
                          : "The full input and output reserve fit."}
                    </span>
                  </div>
                </>
              )}
            </>
          )}
        </aside>
      </div>
      <div className="cr-transport">
        <button
          type="button"
          disabled={playback.reduced}
          aria-label={
            playback.running ? "Pause cache routing" : "Play cache routing"
          }
          onClick={() => {
            setInspection(null);
            if (currentTime >= CACHE_ROUTING_DURATION) {
              film.seek(0);
              playback.replay();
            } else playback.toggle();
          }}
        >
          {playback.running ? "Ⅱ" : "▷"}
        </button>
        <input
          type="range"
          aria-label="Scrub cache routing"
          min="0"
          max={CACHE_ROUTING_DURATION}
          step="10"
          value={currentTime}
          onChange={(e) => seek(Number(e.target.value))}
          aria-valuetext={`${(currentTime / 1000).toFixed(1)} seconds: ${titles[frame.beat]}`}
        />
        <time>{(currentTime / 1000).toFixed(1)} / 44s</time>
      </div>
      <nav className="cr-moments" aria-label="Cache routing moments">
        {CACHE_ROUTING_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            aria-current={frame.beat === i ? "step" : undefined}
            onClick={() => seek(CACHE_ROUTING_MOMENTS[i])}
          >
            {label}
          </button>
        ))}
      </nav>
      <details
        className="cr-method"
        onToggle={(e) => {
          if (e.currentTarget.open) film.seek(currentTime);
        }}
      >
        <summary>Inspect placement assumptions and the event record</summary>
        <p>
          Two alternative placements for one request, not duplicated execution.
          Each replica holds 12 KV pages of {study.blockTokens.toLocaleString("en-US")} prompt
          tokens. The input has four prefix pages and two suffix pages; two further
          pages reserve the 32-token answer up front. Prefill costs{" "}
          {study.prefillMsPerBlock} ms per uncached page and decode{" "}
          {study.decodeMsPerToken} ms per output token: Qwen3-4B on one H100,
          from the calibrated roofline (published specs, not GPU measurements),
          rounded to whole milliseconds. The first output token follows prefill
          by {study.decodeMsPerToken} ms.
        </p>
        <p>
          Request R holds four or eight pages on A until its declared release.
          Ready prefix pages are retained and protected when C references them.
          This bounded model keeps the matching prefix, waits for enough
          additional pages, reserves the whole output allowance, and releases
          private pages at completion. It does not implement an eviction policy,
          preemption, contention, batch scheduling, network or KV transfer. The
          unrelated work and earlier cold prefix computation are outside this
          request&apos;s accounting. TTFT is not total answer time or GPU work.
        </p>
        <p>
          The routing crossover uses known release times, identical per-page
          rates and fixed cache state. Real routing needs uncertain estimates.
          No policy speedup or goodput is inferred.{" "}
          <a
            href="https://docs.vllm.ai/en/latest/design/prefix_caching/"
            target="_blank"
            rel="noreferrer"
          >
            KV allocation and prefix-cache reference ↗
          </a>{" "}
          ·{" "}
          <a
            href="https://docs.vllm.ai/en/latest/serving/data_parallel_deployment/"
            target="_blank"
            rel="noreferrer"
          >
            Replica-local cache and routing reference ↗
          </a>
        </p>
        <button
          type="button"
          onClick={() => {
            const url = URL.createObjectURL(
              new Blob(
                [
                  JSON.stringify(
                    { selectedStudy, displayedStudy: study, frame },
                    null,
                    2,
                  ),
                ],
                {
                  type: "application/json",
                },
              ),
            );
            const a = document.createElement("a");
            a.href = url;
            a.download = "cache-routing-trace.json";
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}
        >
          Download this placement as JSON
        </button>
      </details>
    </section>
  );
}
