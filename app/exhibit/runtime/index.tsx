"use client";

import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { InferenceArchitectureFilm } from "../../compute/architecture-films";
import { inferenceStoryRuns } from "../../compute/lab-story-data";
import { BASELINE_DURATION } from "../../compute/baseline-study";
import { SCHEDULING_DURATION } from "../../compute/scheduling-study-math";
import { PREFIX_DURATION } from "../../compute/prefix-study-math";
import { EXECUTION_FILM_DURATION } from "../../compute/execution-direction";
import { RUNTIME_GAINS_DURATION } from "../../compute/runtime-gains-study";
import { OVERLAP_DURATION } from "../../compute/scheduling-overlap-model";
import { DRAFT_DURATION } from "../../compute/draft-verification-model";
import { CACHE_ROUTING_DURATION } from "../../compute/cache-routing-model";
import { STREAM_FILM_DURATION_MS } from "../../compute/stream-continuity-model";
import { PrefixReuseReveal } from "../../compute/prefix-reuse-reveal";
import { ExecutionReveal } from "../../compute/execution-reveal";
import { SchedulingOverlap } from "../../compute/scheduling-overlap";
import { DraftVerification } from "../../compute/draft-verification";
import { CacheRouting } from "../../compute/cache-routing";
import { ServingPressureFilm } from "../../compute/serving-pressure-film";
import "../../compute/lab-story.css";
import { Fit, Wing, type Room, type RoomProps } from "../shell";
import "./runtime.css";

/*
 * Track A: Astra's inference chapter, forked. The scenes and their models are Astra's; the rooms,
 * the one-screen stage, the voice and the visual system are new.
 */

const SchedulingReveal = lazy(() => import("../../compute/scheduling-reveal").then((m) => ({ default: m.SchedulingReveal })));
const BaselineReveal = lazy(() => import("../../compute/baseline-reveal").then((m) => ({ default: m.BaselineReveal })));
const RuntimeGainsReveal = lazy(() => import("../../compute/runtime-gains-reveal").then((m) => ({ default: m.RuntimeGainsReveal })));
const ServingLoadOverview = lazy(() => import("../../compute/serving-load-overview").then((m) => ({ default: m.ServingLoadOverview })));

const RUNS = inferenceStoryRuns("shared-prefix");

/** Shared props for Astra's reveal components, driven by the room clock. */
const reveal = ({ active, clock }: RoomProps) => ({
  playing: active && clock.playing,
  reduced: clock.reduced,
  readTime: clock.readTime,
  onSeek: clock.seek,
  onToggle: clock.toggle,
});
const noop = () => {};

function Hosted({ children, width = 1240 }: { children: React.ReactNode; width?: number }) {
  return (
    <div className="rw-host">
      <Fit width={width}>
        <Suspense fallback={null}>{children}</Suspense>
      </Fit>
    </div>
  );
}

/* R1 · the serving fabric at full size, with the wing's results as receipts underneath */
const RECEIPTS = [
  { v: "36.61 → 19.29", u: "GPU-s / correct answer", k: "runtime" },
  { v: "1,081 → 445 s", u: "p95 latency · 96 requests", k: "scheduling" },
  { v: "7,808", u: "tokens skipped per prefix hit", k: "KV reuse" },
  { v: "52 → 37 ms", u: "4 decode steps · CPU/GPU overlap", k: "overlap" },
  { v: "56 → 10 ms", u: "longest stream stall", k: "chunked prefill" },
  { v: "12 → 3", u: "serial target passes · 12 tokens", k: "speculation" },
];
function SystemScene({ active, clock }: RoomProps) {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0;
    const tick = () => { setT(clock.readTime()); raf = requestAnimationFrame(tick); };
    if (active) raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, clock]);
  return (
    <div className="rw-system">
      <svg className="rw-fabric" viewBox="0 0 1140 395" role="img" aria-label="Requests share batched GPU computation and cached KV pages while streaming separate answers">
        <InferenceArchitectureFilm t={t} />
      </svg>
      <ol className="rw-receipts">
        {RECEIPTS.map((r) => (
          <li key={r.k}><span>{r.k}</span><b>{r.v}</b><small>{r.u}</small></li>
        ))}
      </ol>
    </div>
  );
}

const ROOMS: Room[] = [
  {
    id: "system", label: "System",
    kicker: "Inference · serving fabric",
    title: <>Same model, same answers. <em>47% less GPU per correct answer.</em></>,
    metric: { value: <>19.29</>, label: "GPU-s / correct · was 36.61" },
    duration: 12000, beats: [0, 4000, 8000], Scene: SystemScene,
  },
  {
    id: "baseline", label: "Baseline",
    kicker: "Barrier batching · 96 requests · 2 workers",
    title: <>67 of 96 correct, <em>at 36.61 GPU-s each.</em></>,
    metric: { value: <>1,081<small>s</small></>, label: "p95 latency" },
    duration: BASELINE_DURATION, Scene: (p) => <Hosted><BaselineReveal run={RUNS[0]} {...reveal(p)} onChapter={noop} /></Hosted>,
  },
  {
    id: "scheduling", label: "Scheduling",
    kicker: "Continuous batching · release on finish",
    title: <>A free worker takes the next request. <em>Same GPU work.</em></>,
    metric: { value: <>1,006<small>s</small></>, label: "p95 · was 1,081" },
    duration: SCHEDULING_DURATION, Scene: (p) => <Hosted><SchedulingReveal before={RUNS[0]} after={RUNS[1]} {...reveal(p)} /></Hosted>,
  },
  {
    id: "prefix", label: "KV reuse",
    kicker: "Prefix caching · paged KV · 90 of 96 hits",
    title: <>7,808 tokens per request, <em>never recomputed.</em></>,
    metric: { value: <>24.03</>, label: "GPU-s / correct · was 36.61" },
    duration: PREFIX_DURATION, Scene: (p) => <Hosted><PrefixReuseReveal before={RUNS[1]} after={RUNS[2]} {...reveal(p)} inspect={{ active: undefined, preview: noop, pin: noop }} /></Hosted>,
  },
  {
    id: "execution", label: "Kernels",
    kicker: "Prefill & decode execution · same tokens",
    title: <>Same tokens. <em>Less work per token.</em></>,
    metric: { value: <>19.29</>, label: "GPU-s / correct · was 24.03" },
    duration: EXECUTION_FILM_DURATION, Scene: (p) => <Hosted><ExecutionReveal before={RUNS[2]} after={RUNS[3]} {...reveal(p)} /></Hosted>,
  },
  {
    id: "ledger", label: "Ledger",
    kicker: "Composition · ordered counterfactuals",
    title: <>36.61 → 19.29 GPU-s per correct. <em>67 answers, unchanged.</em></>,
    metric: { value: <>−47<small>%</small></>, label: "GPU-s per correct answer" },
    duration: RUNTIME_GAINS_DURATION, Scene: (p) => <Hosted><RuntimeGainsReveal runs={RUNS} {...reveal(p)} onReplay={() => p.clock.seek(0)} onExplore={noop} /></Hosted>,
  },
  {
    id: "overlap", label: "CPU/GPU overlap",
    kicker: "Zero-idle scheduler · prepare n+1 during n",
    title: <>The CPU prepares the next step <em>while the GPU runs this one.</em></>,
    metric: { value: <>−29<small>%</small></>, label: "4 decode steps · 52 → 37 ms" },
    duration: OVERLAP_DURATION, Scene: (p) => <Hosted><SchedulingOverlap active={p.active && p.clock.playing} /></Hosted>,
  },
  {
    id: "chunked", label: "Chunked prefill",
    kicker: "Chunked prefill · token budget · TTFT vs ITL",
    title: <>A new document no longer <em>freezes the stream.</em></>,
    metric: { value: <>56 → 10<small>ms</small></>, label: "longest inter-token gap" },
    duration: STREAM_FILM_DURATION_MS, Scene: () => <Hosted><ServingPressureFilm onInspectTrace={noop} /></Hosted>,
  },
  {
    id: "draft", label: "Speculation",
    kicker: "Speculative decoding · draft k = 4 · greedy verify",
    title: <>Draft four tokens. <em>Verify them in one pass.</em></>,
    metric: { value: <>12 → 3</>, label: "serial target passes · 12 tokens" },
    duration: DRAFT_DURATION, Scene: (p) => <Hosted><DraftVerification active={p.active && p.clock.playing} /></Hosted>,
  },
  {
    id: "routing", label: "KV routing",
    kicker: "KV capacity · cache-aware routing",
    title: <>Warm cache or free memory: <em>route by time to first token.</em></>,
    metric: { value: <>−20<small>ms</small></>, label: "TTFT · warm route" },
    duration: CACHE_ROUTING_DURATION, Scene: (p) => <Hosted><CacheRouting active={p.active && p.clock.playing} /></Hosted>,
  },
  {
    id: "serving", label: "Serving system", light: false,
    kicker: "Admission · locality · draft · kernels · delivery",
    title: <>The whole serving loop, <em>one request at a time.</em></>,
    duration: 94000, Scene: (p) => <Hosted><ServingLoadOverview active={p.active && p.clock.playing} onOpenContinuity={noop} onOpenDraft={noop} onOpenCache={noop} /></Hosted>,
  },
];

export function RuntimeWing() {
  const rooms = useMemo(() => ROOMS, []);
  return <Wing id="inference" number="04" name="Inference" accent="amber" rooms={rooms} />;
}
