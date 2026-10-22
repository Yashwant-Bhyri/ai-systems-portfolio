"use client";

import { useEffect, useId, useMemo, useRef, useState, type RefObject } from "react";
import {
  STREAM_FILM_DURATION_MS,
  STREAM_MODEL_VERSION,
  STREAM_REQUESTS,
  longestTokenGap,
  simulateStream,
  streamFilmFrame,
  type StreamFilmFocus,
  type StreamPair,
  type StreamTrace,
} from "./stream-continuity-model";
import "./stream-continuity.css";

const FILM_MS = STREAM_FILM_DURATION_MS;
const BLUE = "#9cc5f5";
const GREEN = "#b8e986";
const AMBER = "#ffc267";
const CORAL = "#ff9185";
const LEFT = 174;
const RIGHT = 807;
const WIDTH = RIGHT - LEFT;
const round = (n: number, places = 1) =>
  n.toLocaleString("en-US", { maximumFractionDigits: places });
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
type Pair = StreamPair;
type Focus = StreamFilmFocus;
type Inspection = { policy: "whole" | "chunked"; index: number } | null;

function useLocalFilm(root: RefObject<HTMLElement | null>, initialTime?: number) {
  const [filmMs, setFilmMs] = useState(initialTime ?? 0);
  const [playing, setPlaying] = useState(initialTime === undefined);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(true);
  const lastTick = useRef<number | null>(null);
  const currentTime = useRef(initialTime ?? 0);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      setReduced(query.matches);
      if (query.matches) {
        setPlaying(false);
        currentTime.current = FILM_MS;
        setFilmMs(FILM_MS);
      }
    };
    change();
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    const update = () => setDocumentVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    if (!root.current) return;
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.04 },
    );
    observer.observe(root.current);
    return () => observer.disconnect();
  }, [root]);
  useEffect(() => {
    if (!playing || !visible || !documentVisible || reduced) {
      lastTick.current = null;
      return;
    }
    let raf = 0;
    const tick = (now: number) => {
      const prior = lastTick.current;
      lastTick.current = now;
      if (prior !== null) {
        currentTime.current = Math.min(FILM_MS, currentTime.current + Math.max(0, now - prior));
        setFilmMs(currentTime.current);
      }
      if (currentTime.current >= FILM_MS) setPlaying(false);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lastTick.current = null;
    };
  }, [playing, visible, documentVisible, reduced]);

  return {
    filmMs,
    playing,
    reduced,
    pause: () => setPlaying(false),
    seek: (next: number) => {
      setPlaying(false);
      currentTime.current = clamp(next, 0, FILM_MS);
      setFilmMs(currentTime.current);
    },
    replay: () => {
      currentTime.current = 0;
      setFilmMs(0);
      setPlaying(!reduced);
    },
    toggle: () => {
      if (reduced) return;
      if (filmMs >= FILM_MS) {
        currentTime.current = 0;
        setFilmMs(0);
      }
      setPlaying((old) => !old);
    },
  };
}

function Track({
  trace,
  serviceMs,
  y,
  x,
  policy,
  focused,
  selected,
  onInspect,
}: {
  trace: StreamTrace;
  serviceMs: number;
  y: number;
  x: (time: number) => number;
  policy: "whole" | "chunked";
  focused: boolean;
  selected: Inspection;
  onInspect: (inspection: NonNullable<Inspection>) => void;
}) {
  const color = policy === "whole" ? BLUE : GREEN;
  const request1 = trace.requests.find((r) => r.id === 1)!;
  const request3 = trace.requests.find((r) => r.id === 3)!;
  const maxGap = longestTokenGap(request1.tokenMs);
  const showGap = maxGap && serviceMs >= maxGap.endMs;
  const firstToken = request3.tokenMs[0];
  return (
    <g className="sc-policy-track" data-policy={policy} data-focused={focused}>
      <text x="27" y={y - 12} className="sc-policy-title" fill={color}>
        {policy === "whole" ? "Baseline" : "Chunked"}
      </text>
      <text x="27" y={y + 8} className="sc-policy-subtitle">
        {policy === "whole" ? "Read whole prompt" : "Read in pieces"}
      </text>
      <path d={`M${LEFT} ${y - 15}H${RIGHT}`} className="sc-track-rule" />
      {trace.steps.map((step) => {
        const prefillTokens = step.prefill.reduce((sum, part) => sum + part.tokens, 0);
        const decodeTokens = step.decode.reduce((sum, part) => sum + part.tokens, 0);
        const active = selected?.policy === policy && selected.index === step.index;
        const overheadEnd = step.startMs + 4;
        const decodeStart = policy === "chunked" ? overheadEnd : overheadEnd + prefillTokens * 0.25;
        const prefillStart = policy === "chunked" ? overheadEnd + decodeTokens : overheadEnd;
        const drawn = (start: number, duration: number) =>
          Math.max(0, x(Math.min(start + duration, serviceMs)) - x(start));
        return (
          <g
            key={step.index}
            className="sc-step"
            data-step={step.index}
            role="button"
            tabIndex={step.index === (selected?.policy === policy ? selected.index : 0) ? 0 : -1}
            aria-pressed={active}
            aria-label={`${policy === "whole" ? "Baseline" : "Chunked"} iteration ${step.index + 1}, ${round(step.startMs, 2)} to ${round(step.endMs, 2)} milliseconds; ${prefillTokens} prefill tokens, ${decodeTokens} decode tokens`}
            onClick={(event) => {
              event.currentTarget.focus();
              onInspect({ policy, index: step.index });
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onInspect({ policy, index: step.index });
              } else if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) {
                event.preventDefault();
                const index = event.key === "Home" ? 0 : event.key === "End" ? trace.steps.length - 1 :
                  clamp(step.index + (event.key === "ArrowRight" ? 1 : -1), 0, trace.steps.length - 1);
                event.currentTarget.parentElement?.querySelector<SVGElement>(`[data-step="${index}"]`)?.focus();
                onInspect({ policy, index });
              }
            }}
          >
            <rect
              x={x(step.startMs)}
              y={y}
              width={Math.max(1, x(step.endMs) - x(step.startMs) - 0.8)}
              height="30"
              fill="#20333f"
              stroke={active ? "#f0f5f5" : "#4b6372"}
              strokeWidth={active ? 1.5 : 0.5}
            />
            <rect x={x(step.startMs)} y={y} width={drawn(step.startMs, 4)} height="30" fill="#697681" opacity=".45" />
            {prefillTokens > 0 && (
              <rect
                x={x(prefillStart)}
                y={y}
                width={drawn(prefillStart, prefillTokens * 0.25)}
                height="30"
                fill={AMBER}
                opacity={step.prefill.some((part) => part.id === 3) ? 0.95 : 0.62}
              />
            )}
            {decodeTokens > 0 && (
              <rect
                x={x(decodeStart)}
                y={y}
                width={drawn(decodeStart, decodeTokens)}
                height="30"
                fill={color}
                opacity=".9"
              />
            )}
            <rect
              x={x(step.startMs)}
              y={y - 4}
              width={Math.max(8, x(step.endMs) - x(step.startMs))}
              height="38"
              className="sc-step-hit"
            />
          </g>
        );
      })}
      <text x="27" y={y + 68} className="sc-row-label">
        Request 1
      </text>
      <path d={`M${LEFT} ${y + 62}H${RIGHT}`} className="sc-token-guide" />
      {request1.tokenMs.map((time, index) => (
        <g key={index} className="sc-token-mark" opacity={time <= serviceMs ? (focused ? 1 : 0.32) : 0.13}>
          <path d={`M${x(time)} ${y + 53}v18`} stroke={color} strokeWidth="2.4" />
          {index % 4 === 0 && (
            <text x={x(time)} y={y + 86} textAnchor="middle" className="sc-token-index">
              {index + 1}
            </text>
          )}
        </g>
      ))}
      {showGap && (
        <g className="sc-gap" aria-hidden="true">
          <path
            d={`M${x(maxGap.startMs)} ${y + 101}v-7H${x(maxGap.endMs)}v7`}
            stroke={CORAL}
            strokeWidth="3"
            fill="none"
          />
          <text
            x={(x(maxGap.startMs) + x(maxGap.endMs)) / 2}
            y={y + 118}
            textAnchor="middle"
            className="sc-gap-label"
          >
            {round(maxGap.durationMs, 2)} ms pause
          </text>
          <circle data-sc-source={`gap-${policy}`} cx={x(maxGap.endMs)} cy={y + 94} r="3" fill={color} />
        </g>
      )}
      <path d={`M${LEFT} ${y + 134}H${RIGHT}`} className="sc-token-guide" />
      <text x="27" y={y + 140} className="sc-row-label">
        Request 3
      </text>
      <path
        className="sc-arrival-path"
        d={`M${x(request3.arrivalMs)} ${y + 124}v20`}
        stroke={AMBER}
        strokeWidth="1.5"
        opacity=".7"
      />
      {serviceMs >= request3.arrivalMs && request3.admissionMs! > request3.arrivalMs && (
        <path
          className="sc-wait-path"
          d={`M${x(request3.arrivalMs)} ${y + 127}H${x(Math.min(request3.admissionMs!, Math.max(request3.arrivalMs, serviceMs)))}`}
          stroke={CORAL}
          strokeWidth="3"
          strokeDasharray="3 3"
        />
      )}
      <path
        className="sc-first-marker"
        d={`M${x(firstToken)} ${y + 124}v20m-5-12 5-8 5 8`}
        stroke={AMBER}
        strokeWidth="2"
        fill="none"
        opacity={serviceMs >= firstToken ? (focused ? 1 : 0.32) : 0.15}
      />
      {serviceMs >= firstToken && (
        <g>
          <path d={`M${x(request3.arrivalMs)} ${y + 151}v-5H${x(firstToken)}v5`} stroke={AMBER} strokeWidth="1.2" fill="none" />
          <circle data-sc-source={`ttft-${policy}`} cx={x(firstToken)} cy={y + 146} r="3" fill={color} />
          <text x={x(firstToken) + 8} y={y + 139} className="sc-first-label">
            first token
          </text>
        </g>
      )}
    </g>
  );
}

function MemoryRail({
  trace,
  y,
  x,
  serviceMs,
  focused,
}: {
  trace: StreamTrace;
  y: number;
  x: (time: number) => number;
  serviceMs: number;
  focused: boolean;
}) {
  const color = trace.policy === "whole" ? BLUE : GREEN;
  return (
    <g className="sc-memory-rail" data-focused={focused}>
      <text x="28" y={y + 13} className="sc-row-label">
        {trace.policy === "whole" ? "Baseline" : "Chunked"}
      </text>
      <path d={`M${LEFT} ${y + 28}H${RIGHT}`} className="sc-token-guide" />
      {trace.steps.map((step) => {
        const width = Math.max(0, x(Math.min(serviceMs, step.endMs)) - x(step.startMs));
        return width > 0 ? (
          <g key={step.index}>
            <rect
              x={x(step.startMs)}
              y={y + 28 - (step.reservationStartPages / trace.capacityPages) * 27}
              width={width}
              height={(step.reservationStartPages / trace.capacityPages) * 27}
              fill={color}
              opacity={step.reservationStartPages === trace.capacityPages ? 0.88 : 0.42}
            />
            {step.admitted.length > 0 && (
              <path d={`M${x(step.startMs)} ${y - 2}v30`} stroke={AMBER} strokeWidth="1.3" />
            )}
            {step.released.length > 0 && serviceMs >= step.endMs && (
              <path d={`M${x(step.endMs)} ${y - 2}v30`} stroke="#d9ebf2" strokeWidth="1" />
            )}
          </g>
        ) : null;
      })}
    </g>
  );
}

function ContinuityPlot({
  pair,
  serviceMs,
  focus,
  selected,
  onInspect,
}: {
  pair: Pair;
  serviceMs: number;
  focus: Focus;
  selected: Inspection;
  onInspect: (inspection: NonNullable<Inspection>) => void;
}) {
  const titleId = useId();
  const horizon = Math.ceil(Math.max(pair.whole.finishMs, pair.chunked.finishMs) / 50) * 50;
  const x = (time: number) => LEFT + (time / horizon) * WIDTH;
  const activePolicy = selected?.policy ??
    (focus === "whole" ? "whole" : focus === "chunked" ? "chunked" : null);
  const arrivalX = x(40);
  const timeX = x(serviceMs);
  return (
    <svg viewBox="0 0 850 676" className="sc-plot" role="group" aria-labelledby={titleId}>
      <title id={titleId}>
        {`Shared millisecond axis for whole-prompt and chunked-prefill policies. Rectangles contain step overhead, amber prefill and colored decode work. Request 1 emits ${pair.whole.requests[0].outputTokens} tokens in each lane; request 3 first-token markers and reserved KV pages share this clock. Tab enters each policy lane; arrow keys inspect adjacent iterations, Home and End jump to the first and last, Escape releases inspection.`}
      </title>
      <text x="28" y="35" className="sc-plot-title">
        One document enters an active stream
      </text>
      <text x="28" y="61" className="sc-plot-subtitle">
        Request 3 · “Read this longer document.” · 128 input tokens
      </text>
      <path d={`M${arrivalX} 78V475`} stroke={AMBER} strokeWidth="1.2" strokeDasharray="3 6" opacity=".65" />
      <path d={`M${arrivalX - 5} 88l5 7 5-7`} stroke={AMBER} strokeWidth="1.5" fill="none" />
      <text x={arrivalX + 7} y="85" className="sc-arrival-label">
        arrives 40 ms
      </text>
      <g className="sc-legend" aria-label="Amber: read prompt. Blue or green: generate answer. Gray: iteration overhead.">
        <rect x="480" y="77" width="10" height="10" fill={AMBER} />
        <text x="496" y="86">Read prompt</text>
        <rect x="595" y="77" width="10" height="10" fill={GREEN} />
        <text x="611" y="86">Generate</text>
        <rect x="699" y="77" width="10" height="10" fill="#697681" />
        <text x="715" y="86">Overhead</text>
      </g>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const tick = (horizon / 5) * i;
        return (
          <g key={i}>
            <path d={`M${x(tick)} 108V590`} className="sc-grid" />
            <text x={x(tick)} y="650" textAnchor="middle" className="sc-axis-label">
              {round(tick, 0)}
            </text>
          </g>
        );
      })}
      <Track
        trace={pair.whole}
        serviceMs={serviceMs}
        y={130}
        x={x}
        policy="whole"
        focused={!activePolicy || activePolicy === "whole"}
        selected={selected}
        onInspect={onInspect}
      />
      <Track
        trace={pair.chunked}
        serviceMs={serviceMs}
        y={318}
        x={x}
        policy="chunked"
        focused={!activePolicy || activePolicy === "chunked"}
        selected={selected}
        onInspect={onInspect}
      />
      <text x="28" y="505" className="sc-memory-label">
        Reserved KV slots · {pair.whole.capacityPages} pages available
      </text>
      <MemoryRail trace={pair.whole} y={517} x={x} serviceMs={serviceMs} focused={!activePolicy || activePolicy === "whole"} />
      <MemoryRail trace={pair.chunked} y={558} x={x} serviceMs={serviceMs} focused={!activePolicy || activePolicy === "chunked"} />
      <path d={`M${timeX} 99V592`} stroke="#dce8ef" strokeWidth="1.4" opacity=".77" pointerEvents="none" />
      <circle cx={timeX} cy="606" r="3" fill="#dce8ef" />
      <text x="807" y="670" textAnchor="end" className="sc-axis-label">
        service time (illustrative ms)
      </text>
    </svg>
  );
}

function PairedBars({
  heading,
  description,
  whole,
  chunked,
  unit,
  focus,
  visible,
  highlight,
  metric,
}: {
  heading: string;
  description: string;
  whole: number;
  chunked: number;
  unit: string;
  focus: Focus;
  visible: boolean;
  highlight: boolean;
  metric: "gap" | "ttft";
}) {
  const max = Math.max(whole, chunked, 1);
  return (
    <div className="sc-result" data-emphasis={highlight}>
      <h4>{heading}</h4>
      <p>{description}</p>
      {([[
        "Baseline", whole, BLUE, focus === "whole",
      ], [
        "Chunked", chunked, GREEN, focus === "chunked",
      ]] as const).map(([label, amount, color, selected]) => (
        <div className="sc-result-row" key={label} data-selected={selected}>
          <span className="sc-result-name" data-sc-target={`${metric}-${label === "Baseline" ? "whole" : "chunked"}`}>{label}</span>
          <span className="sc-result-line" aria-hidden="true">
            <i style={{ width: visible ? `${(amount / max) * 100}%` : "0%", background: color }} />
          </span>
          <strong>{visible ? round(amount, 2) : "…"}<small> {unit}</small></strong>
        </div>
      ))}
    </div>
  );
}

/** Bind the exact event interval to its matching result, without a second clock. */
function StreamResultLinks({ stage, metric, policy, layoutKey }: {
  stage: RefObject<HTMLDivElement | null>;
  metric: "gap" | "ttft" | null;
  policy: "whole" | "chunked" | null;
  layoutKey: string;
}) {
  const [links, setLinks] = useState<Array<{ policy: string; path: string; x: number; y: number }>>([]);
  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const update = () => {
      const box = node.getBoundingClientRect();
      const aside = node.querySelector(".sc-consequence")?.getBoundingClientRect();
      if (!metric || !aside || aside.left <= box.left + 10) {
        setLinks([]);
        return;
      }
      const next = (["whole", "chunked"] as const).flatMap((lane) => {
        if (policy && policy !== lane) return [];
        const source = node.querySelector(`[data-sc-source="${metric}-${lane}"]`)?.getBoundingClientRect();
        const target = node.querySelector(`[data-sc-target="${metric}-${lane}"]`)?.getBoundingClientRect();
        if (!source || !target) return [];
        const viewport = node.querySelector(".sc-figure-scroll")!.getBoundingClientRect();
        const sourceX = (source.left + source.right) / 2;
        if (sourceX < viewport.left || sourceX > viewport.right) return [];
        const x1 = sourceX - box.left;
        const y1 = (source.top + source.bottom) / 2 - box.top;
        const x2 = target.left - box.left - 7;
        const y2 = (target.top + target.bottom) / 2 - box.top;
        const elbow = aside.left - box.left - (lane === "whole" ? 12 : 6);
        return [{ policy: lane, path: `M${x1} ${y1}H${elbow}V${y2}H${x2}`, x: x2, y: y2 }];
      });
      setLinks(next);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    const plot = node.querySelector(".sc-plot");
    const aside = node.querySelector(".sc-consequence");
    if (plot) observer.observe(plot);
    if (aside) observer.observe(aside);
    const scroll = node.querySelector(".sc-figure-scroll");
    scroll?.addEventListener("scroll", update, { passive: true });
    return () => { observer.disconnect(); scroll?.removeEventListener("scroll", update); };
  }, [stage, metric, policy, layoutKey]);
  return <svg className="sc-result-links" aria-hidden="true">
    {links.map((link) => <g key={link.policy} stroke={link.policy === "whole" ? BLUE : GREEN}>
      <path d={link.path} fill="none" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx={link.x} cy={link.y} r="2.5" fill={link.policy === "whole" ? BLUE : GREEN} stroke="none" />
    </g>)}
  </svg>;
}

export type StreamInspectorInitial = { tokenBudget: 16 | 32 | 64; capacityPages: 12 | 24; filmMs: number };

export function StreamContinuity({ initial }: { initial?: StreamInspectorInitial } = {}) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const film = useLocalFilm(root, initial?.filmMs);
  const [tokenBudget, setTokenBudget] = useState<16 | 32 | 64>(initial?.tokenBudget ?? 16);
  const [capacityPages, setCapacityPages] = useState<12 | 24>(initial?.capacityPages ?? 24);
  const [inspection, setInspection] = useState<Inspection>(null);
  const pair = useMemo<Pair>(() => ({
    whole: simulateStream({ policy: "whole", tokenBudget, capacityPages }),
    chunked: simulateStream({ policy: "chunked", tokenBudget, capacityPages }),
  }), [tokenBudget, capacityPages]);
  const frame = streamFilmFrame(film.filmMs, pair);
  const whole1 = pair.whole.requests.find((r) => r.id === 1)!;
  const chunk1 = pair.chunked.requests.find((r) => r.id === 1)!;
  const whole3 = pair.whole.requests.find((r) => r.id === 3)!;
  const chunk3 = pair.chunked.requests.find((r) => r.id === 3)!;
  const blocked = whole3.admissionMs! >= whole1.completionMs!;
  const gapWhole = whole1.maxGapMs!;
  const gapChunked = chunk1.maxGapMs!;
  const ttftWhole = whole3.ttftMs!;
  const ttftChunked = chunk3.ttftMs!;
  const gapVisible = frame.serviceMs >= Math.max(
    longestTokenGap(whole1.tokenMs)!.endMs,
    longestTokenGap(chunk1.tokenMs)!.endMs,
    blocked ? whole3.arrivalMs : 0,
  );
  const firstTokenVisible = frame.serviceMs >= Math.max(whole3.tokenMs[0], chunk3.tokenMs[0]);
  const tradeoffVisible = frame.focus === "first-token";
  const activeInspection = inspection ?
    (inspection.policy === "whole" ? pair.whole : pair.chunked).steps[inspection.index] :
    null;
  const inspect = (next: NonNullable<Inspection>) => {
    film.pause();
    setInspection(next);
  };
  const releaseInspection = () => {
    if (inspection) root.current?.querySelector<SVGElement>(
      `[data-policy="${inspection.policy}"] [data-step="${inspection.index}"]`,
    )?.focus();
    setInspection(null);
  };
  const download = () => {
    film.pause();
    const blob = new Blob([JSON.stringify({
      version: STREAM_MODEL_VERSION,
      status: "illustrative, not measured GPU execution",
      inputs: STREAM_REQUESTS,
      tokenBudget,
      capacityPages,
      filmMs: film.filmMs,
      serviceMs: frame.serviceMs,
      whole: pair.whole,
      chunked: pair.chunked,
      limitations: "One abstract execution device. Additive 4 ms step overhead, 0.25 ms/input token, 1 ms/output token. Reserved KV pages are not physical page allocation or reuse. No network, batching kernels, eviction, preemption, cost calibration, or answer-quality measurement.",
    }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stream-continuity-${tokenBudget}t-${capacityPages}p.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  };
  const title = frame.focus === "streams" ? "Two answers are already streaming" :
    blocked && frame.focus === "first-token" ? "Waiting for memory dominates both policies" :
    blocked && frame.serviceMs < whole3.admissionMs! ? "The document waits for reserved KV slots" :
    blocked ? "A released KV slot lets the document enter" :
    frame.focus === "entry" ? "A longer document arrives" :
    frame.focus === "whole" ? "Read it all: the existing answer pauses" :
    frame.focus === "chunked" ? "Read in pieces: more frequent answer tokens" :
    frame.focus === "first-token" ? "A steadier stream delays the new first token" :
    "One prompt, two effects on the same clock";
  const gapDelta = gapWhole - gapChunked;
  const firstTokenDelta = ttftChunked - ttftWhole;
  const overheadDelta = pair.chunked.overheadMs - pair.whole.overheadMs;

  return (
    <section ref={root} className="sc-root" aria-label="Serving under load: stream continuity experiment" data-focus={frame.focus}
      onKeyDown={(event) => {
        if (event.key === "Escape" && inspection) {
          event.preventDefault();
          event.stopPropagation();
          releaseInspection();
        }
      }}>
      <div className="sc-topline">
        <span>Four requests · one execution device</span>
        <span>Illustrative serving loop</span>
      </div>
      <header className="sc-header">
        <div>
          <h3>{title}</h3>
          <p>One longer document enters while request 1 is receiving an answer.</p>
        </div>
        <time>{round(frame.serviceMs, 1)} ms</time>
      </header>

      <div className="sc-stage" ref={stage}>
        <div className="sc-figure-wrap">
          <p className="sc-mobile-hint">Scroll the timeline to inspect →</p>
          <div className="sc-figure-scroll" role="region" tabIndex={0} aria-label="Shared service clock and token timeline; horizontally scrollable on small screens"
            onFocusCapture={film.pause}>
            <ContinuityPlot pair={pair} serviceMs={frame.serviceMs} focus={frame.focus} selected={inspection} onInspect={inspect} />
          </div>
        </div>
        <aside className="sc-consequence" aria-label="Effects on the existing and new requests">
          <div className="sc-reading-rule">
            <span className="sc-rule-dot" />
            <span>Same four requests in both lanes</span>
          </div>
          <PairedBars
            metric="gap"
            heading="Request 1 · maximum ITL"
            description="Longest inter-token latency, not mean time per output token (TPOT)"
            whole={gapWhole}
            chunked={gapChunked}
            unit="ms"
            focus={frame.focus}
            visible={gapVisible}
            highlight={frame.focus !== "first-token"}
          />
          <div className="sc-pause-delta" data-neutral={blocked || gapDelta <= 0}>
            {gapVisible ? (
              blocked ? "No stream-pause gain: the document waits for a KV slot." :
              gapDelta > 0 ? `Δ ${round(gapDelta, 2)} ms shorter pause` :
              `Δ ${round(-gapDelta, 2)} ms longer pause`
            ) : "The two token streams share the same service clock."}
          </div>
          <PairedBars
            metric="ttft"
            heading="Request 3 · TTFT"
            description="Time to first token, from request arrival"
            whole={ttftWhole}
            chunked={ttftChunked}
            unit="ms"
            focus={frame.focus}
            visible={firstTokenVisible}
            highlight={frame.focus === "first-token"}
          />
          <div className="sc-tradeoff" data-active={tradeoffVisible}>
            <strong>
              {tradeoffVisible ? `Δ ${firstTokenDelta >= 0 ? "+" : ""}${round(firstTokenDelta, 2)} ms` : "… ms"}
            </strong>
            <span>chunked first-token difference</span>
            <small>
              {tradeoffVisible ? (
                `Iteration overhead: ${round(pair.whole.overheadMs)} → ${round(pair.chunked.overheadMs)} ms${overheadDelta === 0 ? "" : ` (${overheadDelta > 0 ? "+" : ""}${round(overheadDelta)} ms)`}`
              ) : "Each iteration charges 4 ms of overhead."}
            </small>
          </div>
        </aside>
        <StreamResultLinks stage={stage}
          metric={frame.focus === "first-token" && firstTokenVisible ? "ttft" :
            gapVisible && ["whole", "chunked", "gap"].includes(frame.focus) ? "gap" : null}
          policy={inspection?.policy ?? (frame.focus === "whole" ? "whole" : frame.focus === "chunked" ? "chunked" : null)}
          layoutKey={`${tokenBudget}-${capacityPages}`} />
      </div>

      <div className="sc-controls">
        <button type="button" onClick={() => { setInspection(null); film.toggle(); }} disabled={film.reduced} aria-label={film.playing ? "Pause experiment" : "Play experiment"}>
          {film.playing ? "Ⅱ Pause" : "▷ Play"}
        </button>
        <button type="button" onClick={() => { setInspection(null); film.replay(); }} aria-label="Replay experiment">
          ↺ Replay
        </button>
        <label className="sc-scrub">
          <span>Film {round(film.filmMs / 1_000, 1)} / 36 s</span>
          <input type="range" min="0" max={FILM_MS} step="100" value={film.filmMs} onChange={(event) => { setInspection(null); film.seek(Number(event.target.value)); }} aria-label="Scrub the stream continuity experiment" />
        </label>
        <label>
          <span>Iteration token budget</span>
          <select value={tokenBudget} onChange={(event) => { film.pause(); setInspection(null); setTokenBudget(Number(event.target.value) as 16 | 32 | 64); }}>
            <option value="16">16 tokens</option>
            <option value="32">32 tokens</option>
            <option value="64">64 tokens</option>
          </select>
        </label>
        <label>
          <span>KV reservation</span>
          <select value={capacityPages} onChange={(event) => { film.pause(); setInspection(null); setCapacityPages(Number(event.target.value) as 12 | 24); }}>
            <option value="24">24 pages</option>
            <option value="12">12 pages</option>
          </select>
        </label>
      </div>
      {activeInspection && (
        <div className="sc-inspector" role="status">
          <strong>{inspection?.policy === "whole" ? "Baseline" : "Chunked"} · iteration {activeInspection.index + 1}</strong>
          <span>{round(activeInspection.startMs, 2)}–{round(activeInspection.endMs, 2)} ms</span>
          <span>Prefill {activeInspection.prefill.map((a) => `R${a.id}: ${a.tokens}`).join(", ") || "none"} tokens</span>
          <span>Decode {activeInspection.decode.map((a) => `R${a.id}: ${a.tokens}`).join(", ") || "none"} tokens</span>
          <span>Step overhead {activeInspection.overheadMs} ms</span>
          <span>Reserved {activeInspection.reservationStartPages} → {activeInspection.reservationEndPages} pages</span>
          <button type="button" onClick={releaseInspection} aria-label="Close iteration inspection">×</button>
        </div>
      )}
      <details className="sc-disclosure">
        <summary>Inspect assumptions and full trace</summary>
        <p>Each iteration costs 4 ms plus 0.25 ms per prompt token and 1 ms per output token. New requests reserve enough pages for prompt and output at admission; pages return on completion. The baseline prioritizes full prefills at iteration boundaries. The chunked policy emits ready decodes before spending the remaining budget on FIFO prefill. Output events occur at the end of each iteration.</p>
        <p>This is one abstract device with reserved KV slots, not a physical GPU trace. There is no batching-kernel overlap, eviction, network cost, preemption or measured answer quality. At 12 pages, admission can dominate the result.</p>
        <div className="sc-disclosure-links">
          <a href="https://docs.vllm.ai/en/latest/configuration/optimization/" target="_blank" rel="noreferrer">vLLM chunked prefill documentation ↗</a>
          <a href="https://arxiv.org/abs/2401.09670" target="_blank" rel="noreferrer">DistServe paper ↗</a>
        </div>
        <button type="button" onClick={download}>Download full event trace JSON ↗</button>
      </details>
    </section>
  );
}
