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
import { useTr } from "../i18n";
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
  const tr = useTr();
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0;
    const tick = () => { setT(clock.readTime()); raf = requestAnimationFrame(tick); };
    if (active) raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, clock]);
  return (
    <div className="rw-system">
      <div className="rw-fabric-wrap">
        <svg className="rw-fabric" viewBox="0 0 1140 395" role="img" aria-label="Requests share batched GPU computation and cached KV pages while streaming separate answers">
          <InferenceArchitectureFilm t={t} />
        </svg>
      </div>
      <ol className="rw-receipts">
        {RECEIPTS.map((r) => (
          <li key={r.k}><span>{tr(r.k)}</span><b>{r.v}</b><small>{tr(r.u)}</small></li>
        ))}
      </ol>
    </div>
  );
}

const ROOMS: Room[] = [
  {
    id: "system", label: "System",
    kicker: "Serving fabric · batch · KV · streams",
    title: <>Same model, same answers. <em>47% less GPU per correct answer.</em></>,
    metric: { value: <>19.29</>, label: "GPU-s / correct · was 36.61" },
    zh: { label: "系统", kicker: "服务架构 · 批处理 · KV · 输出流", title: <>同一模型，同样的答案，<em>每个正确答案的 GPU 开销降低 47%。</em></>, metricLabel: "GPU 秒 / 正确答案 · 原为 36.61" },
    dev: { rows: [["requests", "96 · 67 correct"], ["GPU-s", "2,453.2 → 1,292.5"], ["prefix hits", "90 · 6 cold reads"], ["p95", "1,080.8 → 445.4 s"]], source: "lab-simulation.ts · shared-prefix" },
    duration: 12000, beats: [0, 4000, 8000], Scene: SystemScene,
  },
  {
    id: "baseline", label: "Baseline",
    kicker: "Barrier batching · 96 requests · 2 workers",
    title: <>67 of 96 correct, <em>at 36.61 GPU-s each.</em></>,
    metric: { value: <>1,081<small>s</small></>, label: "p95 latency" },
    zh: { label: "基线", kicker: "屏障批处理 · 96 个请求 · 2 个 worker", title: <>96 个请求答对 67 个，<em>每个 36.61 GPU 秒。</em></>, metricLabel: "p95 延迟" },
    dev: { rows: [["scheduler", "barrier · paired"], ["workers", "2"], ["GPU-s", "2,453.2"], ["p95", "1,080.8 s"]], source: "baseline-study.ts" },
    duration: BASELINE_DURATION, Scene: (p) => <Hosted><BaselineReveal run={RUNS[0]} {...reveal(p)} onChapter={noop} /></Hosted>,
  },
  {
    id: "scheduling", label: "Scheduling",
    kicker: "Continuous batching · release on finish",
    title: <>A free worker takes the next request. <em>Same GPU work.</em></>,
    metric: { value: <>1,006<small>s</small></>, label: "p95 · was 1,081" },
    zh: { label: "调度", kicker: "连续批处理 · 完成即释放", title: <>空闲 worker 立即接手下一个请求，<em>GPU 工作量不变。</em></>, metricLabel: "p95 · 原为 1,081" },
    dev: { rows: [["work", "137.9 worker-s · unchanged"], ["idle removed", "11.7 worker-s"], ["p95", "1,080.8 → 1,005.5 s"]], source: "scheduling-study-math.ts" },
    duration: SCHEDULING_DURATION, Scene: (p) => <Hosted><SchedulingReveal before={RUNS[0]} after={RUNS[1]} {...reveal(p)} /></Hosted>,
  },
  {
    id: "prefix", label: "KV reuse",
    kicker: "Prefix caching · paged KV · 90 of 96 hits",
    title: <>7,808 tokens per request, <em>never recomputed.</em></>,
    metric: { value: <>24.03</>, label: "GPU-s / correct · was 36.61" },
    zh: { label: "KV 复用", kicker: "前缀缓存 · 分页 KV · 96 中命中 90", title: <>每个请求 7,808 个 token，<em>无需重新计算。</em></>, metricLabel: "GPU 秒 / 正确答案 · 原为 36.61" },
    dev: { rows: [["saved tokens", "7,808 / 8,192"], ["saved work", "9.37 GPU-s / hit"], ["service", "23.75 → 14.39 s"], ["cohort", "843.3 GPU-s saved"]], source: "prefix-study-math.ts" },
    duration: PREFIX_DURATION, Scene: (p) => <Hosted><PrefixReuseReveal before={RUNS[1]} after={RUNS[2]} {...reveal(p)} inspect={{ active: undefined, preview: noop, pin: noop }} /></Hosted>,
  },
  {
    id: "execution", label: "Kernels",
    kicker: "Prefill & decode execution · same tokens",
    title: <>Same tokens. <em>Less work per token.</em></>,
    metric: { value: <>19.29</>, label: "GPU-s / correct · was 24.03" },
    zh: { label: "算子", kicker: "预填充与解码执行 · 相同 token", title: <>相同的 token，<em>每个 token 的工作更少。</em></>, metricLabel: "GPU 秒 / 正确答案 · 原为 24.03" },
    dev: { rows: [["12 requests", "157.9 → 126.8 s"], ["GPU-s", "1,609.9 → 1,292.5"], ["answers", "identical"]], source: "execution-direction.ts" },
    duration: EXECUTION_FILM_DURATION, Scene: (p) => <Hosted><ExecutionReveal before={RUNS[2]} after={RUNS[3]} {...reveal(p)} /></Hosted>,
  },
  {
    id: "ledger", label: "Ledger",
    kicker: "Composition · ordered counterfactuals",
    title: <>36.61 → 19.29 GPU-s per correct. <em>67 answers, unchanged.</em></>,
    metric: { value: <>−47<small>%</small></>, label: "GPU-s per correct answer" },
    zh: { label: "账本", kicker: "组合 · 有序反事实", title: <>每个正确答案 36.61 → 19.29 GPU 秒，<em>67 个答案不变。</em></>, metricLabel: "每个正确答案的 GPU 秒" },
    dev: { rows: [["scheduling", "−0.00 GPU-s · waiting only"], ["prefix reuse", "−12.58"], ["execution", "−4.74"], ["denominator", "67 correct"]], source: "runtime-gains-study.ts" },
    duration: RUNTIME_GAINS_DURATION, Scene: (p) => <Hosted><RuntimeGainsReveal runs={RUNS} {...reveal(p)} onReplay={() => p.clock.seek(0)} onExplore={noop} /></Hosted>,
  },
  {
    id: "overlap", label: "CPU/GPU overlap",
    kicker: "Zero-idle scheduler · prepare n+1 during n",
    title: <>The CPU prepares the next step <em>while the GPU runs this one.</em></>,
    metric: { value: <>−29<small>%</small></>, label: "4 decode steps · 52 → 37 ms" },
    zh: { label: "CPU/GPU 重叠", kicker: "零空闲调度 · 在 n 期间准备 n+1", title: <>GPU 运行当前步时，<em>CPU 已在准备下一步。</em></>, metricLabel: "4 个解码步 · 52 → 37 毫秒" },
    dev: { rows: [["host", "prepare 3 · gpu 8 · deliver 2 ms"], ["4 steps", "52 → 37 ms"], ["saved", "15 ms · 28.8%"]], source: "scheduling-overlap-model.ts" },
    duration: OVERLAP_DURATION, Scene: (p) => <Hosted><SchedulingOverlap active={p.active && p.clock.playing} /></Hosted>,
  },
  {
    id: "chunked", label: "Chunked prefill",
    kicker: "Chunked prefill · token budget · TTFT vs ITL",
    title: <>A new document no longer <em>freezes the stream.</em></>,
    metric: { value: <>56 → 10<small>ms</small></>, label: "longest inter-token gap" },
    zh: { label: "分块预填充", kicker: "分块预填充 · token 预算 · TTFT 与 ITL", title: <>新文档不再<em>让输出流卡顿。</em></>, metricLabel: "最长 token 间隔" },
    dev: { rows: [["max ITL", "56 → 10.25 ms"], ["new TTFT", "58 → 105.25 ms"], ["budget", "16 tokens / iteration"]], source: "stream-continuity-model.ts" },
    duration: STREAM_FILM_DURATION_MS, Scene: () => <Hosted><ServingPressureFilm onInspectTrace={noop} /></Hosted>,
  },
  {
    id: "draft", label: "Speculation",
    kicker: "Speculative decoding · draft k = 4 · greedy verify",
    title: <>Draft four tokens. <em>Verify them in one pass.</em></>,
    metric: { value: <>12 → 3</>, label: "serial target passes · 12 tokens" },
    zh: { label: "投机解码", kicker: "投机解码 · 草稿 k = 4 · 贪心验证", title: <>草拟四个 token，<em>一次前向完成验证。</em></>, metricLabel: "串行目标前向 · 12 个 token" },
    dev: { rows: [["target calls", "12 → 3"], ["drafts accepted", "10 / 12"], ["positions", "14 evaluated · 2 discarded"]], source: "draft-verification-model.ts" },
    duration: DRAFT_DURATION, Scene: (p) => <Hosted><DraftVerification active={p.active && p.clock.playing} /></Hosted>,
  },
  {
    id: "routing", label: "KV routing",
    kicker: "KV capacity · cache-aware routing",
    title: <>Warm cache or free memory: <em>route by time to first token.</em></>,
    metric: { value: <>−20<small>ms</small></>, label: "TTFT · warm route" },
    zh: { label: "KV 路由", kicker: "KV 容量 · 缓存感知路由", title: <>热缓存还是空闲显存：<em>按首 token 时间路由。</em></>, metricLabel: "TTFT · 热路由" },
    dev: { rows: [["warm", "4 pages reused · waits 20 ms"], ["cold", "8 new pages"], ["crossover", "40 ms release"]], source: "cache-routing-model.ts" },
    duration: CACHE_ROUTING_DURATION, Scene: (p) => <Hosted><CacheRouting active={p.active && p.clock.playing} /></Hosted>,
  },
  {
    id: "serving", label: "Serving system", light: false,
    kicker: "Admission · locality · draft · kernels · delivery",
    title: <>The whole serving loop, <em>one request at a time.</em></>,
    zh: { label: "服务系统", kicker: "准入 · 局部性 · 草稿 · 算子 · 交付", title: <>完整的服务循环，<em>逐个请求展开。</em></> },
    dev: { rows: [["film", "94 s · A/B/C/D"]], source: "serving-load-overview-model.ts" },
    duration: 94000, Scene: (p) => <Hosted><ServingLoadOverview active={p.active && p.clock.playing} onOpenContinuity={noop} onOpenDraft={noop} onOpenCache={noop} /></Hosted>,
  },
];

export function RuntimeWing() {
  const rooms = useMemo(() => ROOMS, []);
  return <Wing id="inference" number="04" name="Inference" accent="amber" rooms={rooms} />;
}
