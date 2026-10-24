"use client";

import { useId, useMemo } from "react";
import type { LabRun } from "./lab-simulation";
import { Hotspot, type Inspectors } from "./lab-story-scenes";
import { useFilmTime } from "./use-film-time";
import { PrefixComparison } from "./prefix-comparison";
import {
  PREFIX_DURATION,
  PREFIX_MOMENTS,
  prefixStudy,
  prefixFrame,
} from "./prefix-study-math";
import "./prefix-reuse-reveal.css";

const AMBER = "#ffc267",
  BLUE = "#9cc5f5",
  GREEN = "#b8e986",
  INK = "#b4c7d6";
const format = (n: number, digits = 0) =>
  n.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
const BEATS = [
  "First document read",
  "Ready KV prefix",
  "New suffix + attention",
  "Paired execution",
  "Earlier completion",
  "GPU work saved",
];

function TileGrid({
  x,
  y,
  progress,
  color,
  columns = 8,
  rows = 4,
}: {
  x: number;
  y: number;
  progress: number;
  color: string;
  columns?: number;
  rows?: number;
}) {
  return (
    <g aria-hidden="true">
      {Array.from({ length: columns * rows }, (_, i) => (
        <rect
          key={i}
          x={x + (i % columns) * 12}
          y={y + Math.floor(i / columns) * 11}
          width="8"
          height="7"
          rx="1"
          fill={color}
          opacity={i / (columns * rows) < progress ? 0.85 : 0.13}
        />
      ))}
    </g>
  );
}

function PrefixMechanism({
  study,
  frame,
  inspect,
}: {
  study: ReturnType<typeof prefixStudy>;
  frame: ReturnType<typeof prefixFrame>;
  inspect: Inspectors;
}) {
  const id = useId();
  const { request, producer, savedTokens } = study;
  const shared = request.cacheHit;
  return (
    <svg
      className="pr-machine"
      viewBox="0 0 1000 480"
      role="group"
      aria-labelledby={id}
    >
      <title
        id={id}
      >{`Cold request ${producer.id + 1} computes prompt state; later request ${request.id + 1} ${shared ? `reuses ${savedTokens} input tokens after cache readiness` : "has unrelated context and cannot reuse the prefix"}. New question and answer computation remain. KV groups are schematic, not physical page counts.`}</title>
      <text x="28" y="25" className="pr-label">
        θ fixed · same token rates · no answer is cached
      </text>
      <text x="968" y="25" textAnchor="end" className="pr-label">
        Illustrative trace close-up
      </text>

      <Hotspot
        inspect={inspect}
        item={{
          key: "prefix-cold",
          title: "The first read is charged",
          body: `Q${producer.id + 1} computes ${format(producer.computedInputTokens)} prompt tokens in ${format(producer.prefill, 4)} modeled GPU-seconds. The view isolates its prefill; its answer generation is not shown. The numerical task comes from the cohort, while the contract dialogue is illustrative.`,
        }}
      >
        <rect
          className="pr-hit"
          x="22"
          y="46"
          width="209"
          height="185"
          rx="6"
        />
        <path d="M40 72H190L205 87V210H40Z" fill="#11232e" stroke="#425b6c" />
        <path d="M190 72V87H205" fill="none" stroke="#647f91" />
        <text x="54" y="96" className="pr-title">
          Contract context
        </text>
        {Array.from({ length: 10 }, (_, i) => (
          <g key={i}>
            <rect
              x="55"
              y={109 + i * 8}
              width={i % 3 === 0 ? 110 : 132}
              height="3"
              fill={AMBER}
              opacity={i / 10 < frame.cold ? 0.7 : 0.16}
            />
            <rect
              x="55"
              y={109 + i * 8}
              width={i % 3 === 0 ? 110 : 132}
              height="3"
              fill={AMBER}
              opacity=".06"
            />
          </g>
        ))}
        <text x="55" y="201" className="pr-small">
          Request {producer.id + 1} · cold read
        </text>
        <text x="32" y="251" className="pr-label">
          {format(frame.coldTokens)} / {format(producer.computedInputTokens)}{" "}
          input tokens
        </text>
      </Hotspot>

      <path d="M213 142H290" className="pr-wire" />
      <path
        d="M213 142H290"
        stroke={AMBER}
        fill="none"
        strokeWidth="2"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={1 - frame.cold}
      />
      <g>
        <path
          d="M300 108l12-11h154l-12 11Z M454 108l12-11v89l-12 11Z"
          fill="#233d4b"
          stroke="#455e6e"
        />
        <rect
          x="300"
          y="108"
          width="154"
          height="89"
          rx="4"
          fill="#132a37"
          stroke="#5b778b"
        />
        <TileGrid x={323} y={123} progress={frame.cold} color={AMBER} />
        <text x="377" y="184" textAnchor="middle" className="pr-small">
          prompt → K, V
        </text>
        <text x="377" y="81" textAnchor="middle" className="pr-title">
          Full prefill
        </text>
        <text x="377" y="222" textAnchor="middle" className="pr-label">
          {format(producer.prefill * frame.cold, 2)} GPU-s charged
        </text>
      </g>
      <path d="M470 142H525" className="pr-wire" />
      <path
        d="M470 142H525"
        stroke={AMBER}
        fill="none"
        strokeWidth="2"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={1 - frame.store}
      />

      <Hotspot
        inspect={inspect}
        item={{
          key: "prefix-bank",
          title: "Computed state, not a saved answer",
          body: shared
            ? `The selected prefix is ready by scenario t=${format(study.readyAt, 2)}s. Q${request.id + 1} starts at t=${format(request.start, 2)}s and finds it reusable. This simulator conservatively publishes the prefix after the producer's full prefill. The eight illustrated KV groups are not eight literal cache pages.`
            : "The first request's KV state exists, but the next prompt is unrelated. Cached state cannot be substituted for a different token prefix. This workload has no eligible hits.",
        }}
      >
        <rect
          className="pr-hit"
          x="519"
          y="49"
          width="265"
          height="184"
          rx="6"
        />
        <text x="542" y="71" className="pr-title">
          {frame.store === 1 ? "Context retained" : "Build reusable state"}
        </text>
        <text x="544" y="92" className="pr-small">
          K · keys
        </text>
        <text x="649" y="92" className="pr-small">
          V · values
        </text>
        {Array.from({ length: 8 }, (_, i) => (
          <g
            key={i}
            opacity={i / 8 < frame.store ? 1 : 0.2}
            transform={`translate(0 ${-(1 - frame.store) * 7})`}
          >
            {[0, 1].map((column) => (
              <g key={column}>
                <path
                  d={`M${543 + column * 105} ${103 + i * 12}l5-4h85l-5 4Z`}
                  fill="#42677b"
                />
                <rect
                  x={543 + column * 105}
                  y={103 + i * 12}
                  width="85"
                  height="9"
                  rx="1"
                  fill={column ? "#21474d" : "#384833"}
                  stroke={AMBER}
                  strokeOpacity=".25"
                />
                {Array.from({ length: 11 }, (_, j) => (
                  <rect
                    key={j}
                    x={549 + column * 105 + j * 7}
                    y={106 + i * 12}
                    width="4"
                    height="3"
                    fill={column ? "#8bddd0" : AMBER}
                    opacity=".6"
                  />
                ))}
              </g>
            ))}
          </g>
        ))}
        <circle
          cx="549"
          cy="218"
          r="3"
          fill={frame.store === 1 ? GREEN : INK}
        />
        <text x="560" y="222" className="pr-small">
          {frame.store === 1
            ? "ready for a matching prefix"
            : "not reusable until ready"}
        </text>
      </Hotspot>
      <g opacity={frame.store}>
        <text x="811" y="112" className="pr-label">
          The document remains
        </text>
        <text x="811" y="132" className="pr-label">
          inside the context.
        </text>
        <text x="811" y="162" className="pr-small">
          KV is computed state.
        </text>
        <text x="811" y="180" className="pr-small">
          It is not the response.
        </text>
      </g>

      <path d="M28 272H969" stroke="#2b414e" />
      <text x="32" y="297" className="pr-title">
        Request {request.id + 1} ·{" "}
        {shared ? "same context" : "unrelated prompt"}
      </text>
      <Hotspot
        inspect={inspect}
        item={{
          key: "prefix-lookup",
          title: shared
            ? "Match the prefix, compute the suffix"
            : "A cache miss preserves all input work",
          body: shared
            ? `${format(savedTokens)} identical prefix tokens are reused. ${format(request.computedInputTokens)} new input tokens still enter prefill. Prompt template, token identity and checkpoint compatibility matter; this is not semantic retrieval.`
            : `All ${format(request.inputTokens)} input tokens still require prefill. No matching prefix means zero avoided input work, even with reuse enabled.`,
        }}
      >
        <rect
          className="pr-hit"
          x="22"
          y="310"
          width="232"
          height="112"
          rx="5"
        />
        <rect
          x="34"
          y="325"
          width="183"
          height="31"
          rx="3"
          fill={shared ? "#2a3229" : "#24394d"}
          stroke={shared ? AMBER : BLUE}
          strokeOpacity=".6"
        />
        {Array.from({ length: 16 }, (_, i) => (
          <rect
            key={i}
            x={41 + i * 10.5}
            y="333"
            width="7"
            height="15"
            fill={shared ? AMBER : BLUE}
            opacity={frame.matched ? 0.24 : 0.6}
          />
        ))}
        <text
          x="34"
          y="374"
          className="pr-small"
          fill={frame.matched ? AMBER : INK}
        >
          {frame.lookup < 1
            ? "prefix identity lookup"
            : shared
              ? `${format(savedTokens)} tokens · reference KV`
              : "no exact prefix match"}
        </text>
        <rect
          x="34"
          y="389"
          width="64"
          height="18"
          rx="2"
          fill={BLUE}
          fillOpacity=".6"
        />
        <text x="34" y="429" className="pr-small">
          {shared ? "new question" : "full prompt"}
        </text>
      </Hotspot>

      <path d="M225 341H271V253H520V190H540" className="pr-wire" />
      <path
        d="M225 341H271V253H520V190H540"
        stroke={shared ? AMBER : BLUE}
        fill="none"
        strokeWidth="2"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={1 - frame.lookup}
      />
      {frame.lookup === 1 && (
        <path d="M534 185l6 5-6 5" fill="none" stroke={shared ? AMBER : BLUE} />
      )}
      <text
        x="376"
        y="245"
        textAnchor="middle"
        className="pr-small"
        fill={AMBER}
      >
        {frame.lookup === 1
          ? shared
            ? "prefix found ✓"
            : "different prefix ×"
          : "lookup"}
      </text>
      <path d="M644 232V313" className="pr-wire" />
      <path
        d="M644 232V313"
        stroke={AMBER}
        strokeWidth={frame.matched ? 3 : 0}
        fill="none"
      />
      {frame.matched && (
        <>
          <path d="M639 305l5 8 5-8" stroke={AMBER} fill="none" />
          <text x="664" y="283" className="pr-small" fill={AMBER}>
            reuse K, V
          </text>
        </>
      )}

      <path d="M106 398H300" className="pr-wire" />
      <path
        d="M106 398H300"
        stroke={BLUE}
        strokeWidth="2"
        fill="none"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={1 - frame.suffix}
      />
      <g>
        <rect
          x="300"
          y="329"
          width="154"
          height="89"
          rx="4"
          fill="#132a37"
          stroke="#536e85"
        />
        <TileGrid x={323} y={345} color={BLUE} progress={frame.suffix} />
        <text x="377" y="406" textAnchor="middle" className="pr-small">
          new Q, K, V
        </text>
        <text x="377" y="319" textAnchor="middle" className="pr-title">
          {shared ? "Suffix prefill" : "Full prefill"}
        </text>
        <text x="377" y="438" textAnchor="middle" className="pr-small">
          {format(frame.newTokens)} / {format(request.computedInputTokens)} new
          tokens
        </text>
      </g>
      <path d="M462 374H546" className="pr-wire" />
      <path
        d="M462 374H546"
        stroke={BLUE}
        strokeWidth="2"
        fill="none"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={1 - frame.suffix}
      />
      <Hotspot
        inspect={inspect}
        item={{
          key: "prefix-attention",
          title: "The new query still attends to the context",
          body: "In a causal attention head, the new query is scored against earlier keys, then weights the corresponding values: softmax(qKᵀ / √d)V. Reusing K and V avoids recomputing that prefix, not reading it. New suffix tokens and all generated tokens extend the state; the model weights stay fixed.",
        }}
      >
        <rect
          className="pr-hit"
          x="547"
          y="315"
          width="220"
          height="131"
          rx="6"
        />
        <rect
          x="557"
          y="329"
          width="198"
          height="89"
          rx="4"
          fill="#132a37"
          stroke={frame.decode > 0 ? GREEN : "#536e85"}
        />
        {Array.from({ length: 12 }, (_, i) => (
          <rect
            key={i}
            x={573 + i * 14}
            y="346"
            width="9"
            height="23"
            rx="1"
            fill={shared && i < 9 ? AMBER : BLUE}
            opacity={
              frame.decode > 0
                ? 0.32 +
                  0.5 * (1 - Math.abs(((frame.decode * 12) % 12) - i) / 12)
                : 0.15
            }
          />
        ))}
        <text x="656" y="400" textAnchor="middle" className="pr-small">
          softmax(qKᵀ / √d)V
        </text>
        <text x="656" y="438" textAnchor="middle" className="pr-small">
          context stays in attention
        </text>
      </Hotspot>
      <path d="M765 374H805" className="pr-wire" />
      <path
        d="M765 374H805"
        stroke={GREEN}
        strokeWidth="2"
        fill="none"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={1 - frame.decode}
      />
      <text x="815" y="320" className="pr-title">
        New answer
      </text>
      <TileGrid
        x={815}
        y={340}
        columns={12}
        rows={3}
        color={GREEN}
        progress={frame.decode}
      />
      <text x="815" y="398" className="pr-label">
        {format(frame.outputTokens)} tokens
      </text>
      <text x="815" y="420" className="pr-small">
        decode work retained
      </text>
      <text x="32" y="461" className="pr-label" fill={AMBER}>
        {frame.matched
          ? `${format(frame.avoidedTokens)} repeated input tokens avoided. The context was not removed.`
          : shared
            ? "Warm-up is charged before a later request can reuse anything."
            : "No prefix match. No skipped prefill. The cache is not a universal speedup."}
      </text>
    </svg>
  );
}

export function PrefixReuseReveal({
  before,
  after,
  playing,
  reduced,
  readTime,
  onSeek,
  onToggle,
  inspect,
}: {
  before: LabRun;
  after: LabRun;
  playing: boolean;
  reduced: boolean;
  readTime: () => number;
  onSeek: (time: number) => void;
  onToggle: () => void;
  inspect: Inspectors;
}) {
  const study = useMemo(() => prefixStudy(before, after), [before, after]);
  const film = useFilmTime(readTime, playing, reduced, PREFIX_DURATION, onSeek);
  const frame = prefixFrame(film.time, study),
    shared = study.request.cacheHit;
  const handoff = reduced ? Number(frame.handoff >= 0.5) : frame.handoff;
  return (
    <section
      className="pr-reveal"
      aria-label="Directed prefix reuse experiment"
      data-playing={playing}
      data-beat={frame.beat}
      data-time={film.time}
    >
      <div className="pr-comparison-heading">
        <h4>
          {frame.beat < 2
            ? "Compute once, retain the context"
            : frame.beat === 2
              ? "Compute the new question"
              : frame.beat === 3
                ? "Same request, less input work"
                : frame.beat === 4 && shared
                  ? "Reuse finishes; baseline continues"
                  : "Prefix reuse: GPU-work comparison"}
        </h4>
        <span>Illustrative service replay</span>
      </div>
      <div className="pr-stage">
        <div
          className="pr-scene-layer"
          data-active={frame.handoff < 0.5}
          inert={frame.handoff >= 0.5}
          aria-hidden={frame.handoff >= 0.5}
          style={{ opacity: 1 - handoff }}
        >
          <div
            className="pr-scroll"
            tabIndex={0}
            role="region"
            aria-label="Prefix state flow; scroll horizontally on narrow screens"
          >
            <PrefixMechanism study={study} frame={frame} inspect={inspect} />
          </div>
          <p className="pr-scroll-hint">
            Scroll the mechanism sideways to inspect →
          </p>
        </div>
        <div
          className="pr-scene-layer"
          data-active={frame.handoff >= 0.5}
          inert={frame.handoff < 0.5}
          aria-hidden={frame.handoff < 0.5}
          style={{ opacity: handoff }}
        >
          <PrefixComparison
            study={study}
            milliseconds={film.time}
            inspect={inspect}
          />
          <p className="pr-scroll-hint">
            Scroll the paired execution sideways to inspect →
          </p>
        </div>
      </div>
      <div className="pr-transport">
        <button
          type="button"
          onClick={onToggle}
          disabled={reduced}
          aria-label={
            playing ? "Pause prefix experiment" : "Play prefix experiment"
          }
        >
          {playing ? "Ⅱ" : "▷"}
        </button>
        <input
          type="range"
          aria-label="Scrub prefix experiment"
          min="0"
          max={PREFIX_DURATION}
          step="10"
          value={film.time}
          aria-valuetext={`${format(film.time / 1000, 1)} seconds: ${BEATS[frame.beat]}`}
          onChange={(e) => film.seek(Number(e.target.value))}
        />
        <time>
          {format(film.time / 1000, 1)} / {PREFIX_DURATION / 1000}s
        </time>
      </div>
      <nav className="pr-moments" aria-label="Prefix experiment moments">
        {BEATS.map((label, i) => (
          <button
            key={label}
            type="button"
            aria-current={frame.beat === i ? "step" : undefined}
            onClick={() => film.seek(PREFIX_MOMENTS[i])}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            {label}
          </button>
        ))}
      </nav>
      <details
        className="pr-method"
        onToggle={(event) => {
          if (event.currentTarget.open) film.seek(film.time);
        }}
      >
        <summary>Inspect the computation and cache assumptions</summary>
        <p>
          This close-up selects a cold producer and the first eligible cache hit
          from the existing scenario. The film expands and compresses those
          trace landmarks; its {PREFIX_DURATION / 1000}-second playback is not
          wall-clock GPU time. Both comparisons preserve policy, input and
          output counts, decode rates and task outcomes. KV groups are
          schematic. Memory capacity, eviction, block alignment, lookup overhead
          and cache transfer cost are not modeled; the totals are illustrative
          busy work, not measured allocated device time.
        </p>
        <p>
          The paired lanes start this request’s service at the same zero after
          the prefix is ready; original queue delays are excluded. One serial
          worker per lane means service seconds equal busy GPU-seconds here. The
          playback holds at reuse completion before finishing the baseline.
          Prefill: {format(study.reference.prefill, 4)} →{" "}
          {format(study.request.prefill, 4)} GPU-s. Decode:{" "}
          {format(study.request.decode, 4)} GPU-s in both. Across the original
          cohort: {study.hits} hits, {study.coldReads} cold reads, and{" "}
          {format(study.totalSaved, 4)} GPU-s of input work avoided.
        </p>
        <p>
          {shared
            ? `Prefix ready by ${format(study.readyAt, 4)}s; matching request starts at ${format(study.request.start, 4)}s. `
            : "There is no eligible prefix in the interactive workload. "}
          A real runtime also checks token-prefix and execution-context
          compatibility.
        </p>
        <a
          href="https://docs.vllm.ai/en/v0.30.0/features/automatic_prefix_caching/"
          target="_blank"
          rel="noreferrer"
        >
          vLLM: what prefix caching does and does not save ↗
        </a>
      </details>
    </section>
  );
}
