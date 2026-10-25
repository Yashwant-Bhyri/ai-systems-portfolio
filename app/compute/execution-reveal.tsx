"use client";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { LabRun } from "./lab-simulation";
import { useFilmTime } from "./use-film-time";
import { ExecutionMachine } from "./execution-machine";
import {
  RequestWaterfall,
  WaterfallPayoff,
  ComputeAllowance,
  AllowancePayoff,
  DemandRouting,
  DemandPayoff,
  ExecutionCost,
  ExecutionCostPayoff,
} from "./execution-scale";
import {
  executionFrame,
  matchedExecution,
  executionWaterfall,
  waterfallFrame,
  waterfallSelection,
  executionDemand,
  budgetCapacity,
  demandTime,
  demandSeek,
  burstAt,
} from "./execution-study-math";
import {
  EXECUTION_FILM_DURATION as EXECUTION_DURATION,
  EXECUTION_FILM_MOMENTS as EXECUTION_MOMENTS,
  executionDirection,
  executionPresentationTime,
  type ComparisonFocus,
} from "./execution-direction";
import "./execution-reveal.css";
import "./execution-scale.css";

const MOMENTS = [
  "Same request",
  "Expose the gap",
  "Follow the next requests",
  "Hold compute fixed",
  "Serve 1,000 agents",
  "Compare GPU cost",
];
const TITLES = [
  "Request 7 on faster prefill & decode rates",
  "Worker release",
  "Delivery time for twelve requests",
  "How many requests fit the same compute allowance?",
  "1,000 requests at once: which runtime clears the queue first?",
  "GPU cost per correct answer",
];
const num = (n: number, d = 1) =>
  n.toLocaleString("en-US", {
    maximumFractionDigits: d,
    minimumFractionDigits: d,
  });
const clamp = (n: number) => Math.max(0, Math.min(1, n));

function Scene({
  active,
  children,
  aside,
  label,
  connection = "both",
  connectionKey = "",
}: {
  active: boolean;
  children: ReactNode;
  aside?: ReactNode;
  label: string;
  connection?: ComparisonFocus;
  connectionKey?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [link, setLink] = useState<{ path: string; color: string } | null>(null);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    if (!active || connection === "both") return;
    const update = () => {
      const box = node.getBoundingClientRect();
      const aside = node.querySelector(".xs-consequence")?.getBoundingClientRect();
      const source = node.querySelector(`[data-result-source="${connection}"]`)?.getBoundingClientRect();
      const target = node.querySelector(`[data-result-target="${connection}"]`)?.getBoundingClientRect();
      const viewport = node.querySelector(".xs-scroll")!.getBoundingClientRect();
      if (!aside || !source || !target || aside.left <= box.left + 10) {
        setLink(null);
        return;
      }
      const sourceX = (source.left + source.right) / 2;
      if (sourceX < viewport.left || sourceX > viewport.right) { setLink(null); return; }
      const x1 = sourceX - box.left;
      const y1 = (source.top + source.bottom) / 2 - box.top;
      const x2 = target.left - box.left - 5;
      const y2 = (target.top + target.bottom) / 2 - box.top;
      const elbow = aside.left - box.left + 8;
      setLink({ path: `M${x1} ${y1}H${elbow}V${y2}H${x2}`,
        color: connection === "baseline" ? "#9cc5f5" : connection === "optimized" ? "#b8e986" : "#c7a6ff" });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    const aside = node.querySelector(".xs-consequence");
    if (aside) observer.observe(aside);
    const scroll = node.querySelector(".xs-scroll");
    scroll?.addEventListener("scroll", update, { passive: true });
    return () => { observer.disconnect(); scroll?.removeEventListener("scroll", update); };
  }, [active, connection, connectionKey]);
  return (
    <div
      ref={root}
      className="xs-scene"
      data-active={active}
      aria-hidden={!active}
      inert={!active}
    >
      <div className="xs-visual">
        <p className="es-mobile-hint">Scroll the figure to inspect →</p>
        <div
          className="xs-scroll"
          role="region"
          tabIndex={active ? 0 : -1}
          aria-label={label}
        >
          {children}
        </div>
      </div>
      {aside ? (
        <aside
          className="xs-consequence"
          aria-label="Consequence of the execution change"
        >
          {aside}
        </aside>
      ) : null}
      {active && connection !== "both" && link && <svg className="xs-result-link" aria-hidden="true"><path d={link.path} fill="none" stroke={link.color} strokeWidth="1.5" strokeLinejoin="round" /></svg>}
    </div>
  );
}

export function ExecutionReveal({
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
  const { reference, optimized } = useMemo(
    () => matchedExecution(before, after),
    [before, after],
  );
  const trace = useMemo(
    () => executionWaterfall(before, after),
    [before, after],
  );
  const demand = useMemo(() => executionDemand(before, after), [before, after]);
  const [pinnedRequest, setPinnedRequest] = useState<number | null>(null);
  const film = useFilmTime(
    readTime,
    playing,
    reduced,
    EXECUTION_DURATION,
    onSeek,
  );
  const direction = executionDirection(film.time);
  const frame = executionFrame(direction.modelTime, reference, optimized),
    beat = frame.beat;
  const waterfall = waterfallFrame(direction.modelTime, trace, frame.time);
  const selected = pinnedRequest ?? waterfallSelection(trace, waterfall);
  const allowance = Math.round(
    100 + 2900 * clamp((direction.modelTime - 20800) / 4200),
  );
  const burstTime = demandTime(direction.modelTime, demand);
  const seek = (time: number) => {
    setPinnedRequest(null);
    film.seek(time);
  };
  const inspectRequest = (index: number) => {
    setPinnedRequest(index);
    film.seek(film.time);
  };
  const downloadStudy = () => {
    film.seek(film.time);
    const record = {
      version: "directed-execution-v4",
      status: "illustrative; no physical GPU or model run",
      sceneTimeMs: film.time,
      direction,
      moment: MOMENTS[beat],
      workload: before.workload,
      policy: before.policy,
      budget: before.budget,
      isolatedRequest: { reference, optimized },
      serialWaterfall: { trace, frame: waterfall, selectedRequest: selected },
      fixedCompute: budgetCapacity(demand, allowance),
      demandBoundary:
        "1,000 distinct deterministic token-length specifications. All arrive at time zero; two FIFO serial workers per runtime. Warm cache outcomes pinned, not a readiness simulation. Service rates from the paired cohort. No measured hardware, batching or distributed capacity claim.",
      demand,
      selectedTime: burstTime,
      demandState: {
        baseline: burstAt(demand.reference, burstTime),
        optimized: burstAt(demand.optimized, burstTime),
      },
      originalCohort: { before, after },
      calculationSource: "app/compute/execution-study-math.ts",
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(record, null, 2)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `directed-execution-${before.workload}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <section
      className="es-film xs-film"
      aria-label="Directed execution experiment"
      data-beat={beat}
      data-focus={direction.focus}
      data-playing={playing}
      onKeyDown={(e) => {
        if (e.key === "Escape") setPinnedRequest(null);
      }}
    >
      <div className="es-invariants">
        <span>Same model · same requests · same outcomes</span>
      </div>
      <div className="es-direction">
        <h3>{TITLES[beat]}</h3>
        {beat === 2 && (
          <span className="xs-speed">
            {playing && waterfall.zoom > 0 && waterfall.zoom < 1
              ? "Zooming out · accelerated replay"
              : "Request-order waterfall"}
          </span>
        )}
      </div>
      <nav
        className="xs-outcome-nav"
        aria-label="Three outcomes of faster execution"
      >
        {[
          ["Delivery time", 25500, beat < 3],
          ["Serving capacity", 42000, beat === 3 || beat === 4],
          ["GPU cost / correct answer", 78500, beat === 5],
        ].map(([label, at, active]) => (
          <button
            type="button"
            key={String(label)}
            aria-current={active ? "step" : undefined}
            onClick={() => seek(Number(at))}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="xs-sequence">
        <Scene
          active={beat < 2}
          label="Paired execution machine; horizontally scrollable on small screens"
          aside={
            <div className="xs-preview">
              <RequestWaterfall
                trace={trace}
                frame={waterfall}
                compact
                selected={Math.min(selected, 2)}
                onSelect={(index) => {
                  film.seek(11000);
                  setPinnedRequest(index);
                }}
              />
              <button
                type="button"
                className="xs-expand"
                onClick={() => seek(11000)}
              >
                Follow request {reference.id + 1} into the next requests ↗
              </button>
            </div>
          }
        >
          <ExecutionMachine
            reference={reference}
            optimized={optimized}
            time={frame.time}
            onInspect={() => film.seek(film.time)}
          />
        </Scene>
        <Scene
          active={beat === 2}
          connection={direction.focus}
          connectionKey={`${selected}-${trace.baseline.finish}-${trace.optimized.finish}`}
          label="Serial request waterfall; select a request to inspect completion"
          aside={
            <WaterfallPayoff
              trace={trace}
              selected={selected}
              time={waterfall.time}
              focus={direction.focus}
            />
          }
        >
          <RequestWaterfall
            trace={trace}
            frame={waterfall}
            selected={selected}
            onSelect={inspectRequest}
            focus={direction.focus}
          />
        </Scene>
        <Scene
          active={beat === 3}
          connection={direction.focus}
          connectionKey={String(allowance)}
          label="Completed requests at a fixed compute allowance"
          aside={
            <AllowancePayoff
              demand={demand}
              allowance={allowance}
              focus={direction.focus}
            />
          }
        >
          <ComputeAllowance demand={demand} allowance={allowance} />
        </Scene>
        <Scene
          active={beat === 4}
          connection={direction.origin === 1 ? direction.focus : "both"}
          connectionKey={String(burstTime)}
          label="One thousand requests routed to two workers per runtime"
          aside={
            direction.origin < 1 ? (
              <div className="xs-origin-caption">
                <span>Same demand. Two runtimes.</span>
                <p>One request per agent.</p>
                <p>Zoom out to see the full arrival burst.</p>
              </div>
            ) : (
              <DemandPayoff
                demand={demand}
                time={burstTime}
                focus={direction.focus}
              />
            )
          }
        >
          <DemandRouting
            demand={demand}
            time={burstTime}
            origin={direction.origin}
          />
        </Scene>
        <Scene
          active={beat === 5}
          connection={direction.focus}
          connectionKey={`${before.correctCost}-${after.correctCost}`}
          label="GPU cost per correct answer comparison"
          aside={<ExecutionCostPayoff before={before} after={after} focus={direction.focus} />}
        >
          <ExecutionCost
            before={before}
            after={after}
            focus={direction.focus}
          />
        </Scene>
      </div>
      <div className="xs-parameter-slot">
        {beat === 3 ? (
          <label className="es-intervention es-burst-control xs-control">
            Compute allowance
            <input
              type="range"
              aria-label="Inspect compute allowance"
              min="100"
              max="3000"
              step="10"
              value={allowance}
              onChange={(e) =>
                seek(
                  executionPresentationTime(
                    20800 + ((Number(e.target.value) - 100) / 2900) * 4200,
                  ),
                )
              }
            />
            <span>{num(allowance, 0)} GPU-s</span>
          </label>
        ) : beat === 4 ? (
          <label className="es-intervention es-burst-control xs-control">
            Elapsed time
            <input
              type="range"
              aria-label="Inspect burst elapsed time"
              min="0"
              max="1000"
              step="1"
              value={(1000 * burstTime) / demand.reference.finish}
              aria-valuetext={`${num(burstTime, 1)} seconds elapsed`}
              onChange={(e) =>
                seek(
                  executionPresentationTime(
                    demandSeek(
                      (Number(e.target.value) / 1000) * demand.reference.finish,
                      demand,
                    ),
                  ),
                )
              }
            />
            <span>{num(burstTime, 0)} s</span>
          </label>
        ) : null}
      </div>
      <div className="es-transport">
        <button
          type="button"
          disabled={reduced}
          onClick={() => {
            setPinnedRequest(null);
            onToggle();
          }}
          aria-label={
            playing ? "Pause execution experiment" : "Play execution experiment"
          }
        >
          {playing ? "Ⅱ" : "▷"}
        </button>
        <input
          type="range"
          min="0"
          max={EXECUTION_DURATION}
          step="10"
          value={film.time}
          aria-label="Scrub execution experiment"
          aria-valuetext={`${num(film.time / 1000)} seconds: ${MOMENTS[beat]}`}
          onChange={(e) => seek(Number(e.target.value))}
        />
        <time>
          {num(film.time / 1000)} / {EXECUTION_DURATION / 1000}s
        </time>
      </div>
      <nav className="es-moments" aria-label="Execution experiment moments">
        {MOMENTS.map((label, i) => (
          <button
            key={label}
            type="button"
            aria-current={beat === i ? "step" : undefined}
            onClick={() => seek(EXECUTION_MOMENTS[i])}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            {label}
          </button>
        ))}
      </nav>
      <details
        className="es-method"
        onToggle={(e) => {
          if (e.currentTarget.open && playing) film.seek(film.time);
        }}
      >
        <summary>Inspect calculations and limits</summary>
        <button type="button" onClick={downloadStudy}>
          Download this comparison as JSON ↗
        </button>
        <p>
          Representative weight tiles, KV pages and output groups follow one
          service cursor. This is a schematic, not hardware telemetry. Only
          assumed prefill and decode rates change. Checkpoint, logical inputs,
          output lengths, cache decisions and quality stay fixed.
        </p>
        <p>
          The waterfall orders twelve existing cohort requests behind one serial
          worker per runtime. Rows are request order, not parallel workers. Its
          zoom changes the camera and playback speed, never service durations or
          finish times.
        </p>
        <p>
          The allowance and arrival scenes share 1,000 deterministic
          token-length specifications (seed token-mix-v1), not a repeated
          96-request trace. Input lengths span 1,024–16,384 tokens; output
          lengths span 96–6,144. Shared-document requests assume an already-warm
          cache with pinned hits. Cache warm-up is outside this execution-only
          comparison. FIFO completion counts within a GPU-work allowance are
          distinct from completions at an elapsed-time deadline.
        </p>
        <p>
          In the arrival replay, all 1,000 requests arrive at zero and each
          runtime has two serial workers. This is not continuous batching,
          physical GPU concurrency or distributed serving. Network, contention,
          idle allocation and verifier cost are excluded. Both eventually finish
          all requests; the gain is when they finish. The last scene returns to
          the original 96-task cohort, with its original arrival trace and
          prefix costs.
        </p>
      </details>
    </section>
  );
}
