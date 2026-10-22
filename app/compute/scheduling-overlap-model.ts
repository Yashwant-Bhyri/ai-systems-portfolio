/** A fixed active decode set. Durations are declared teaching inputs, not profiling. */
export type HostProfile = "balanced" | "host-bound" | "negligible";
export type Interval = { start: number; end: number };
export type DecodeStep = {
  index: number;
  prepare: Interval;
  gpu: Interval;
  deliver: Interval;
};
export type OverlapLane = {
  steps: DecodeStep[];
  finish: number;
  gpuBusy: number;
  cpuBusy: number;
  gpuIdle: number;
  gaps: Interval[];
};

export const OVERLAP_DURATION = 28000;
export const OVERLAP_MOMENTS = [4500, 8500, 15500, 19500, 28000] as const;
export const OVERLAP_LABELS = [
  "One decode step",
  "CPU-induced waiting",
  "Overlapped execution",
  "Earlier delivery",
  "Time vs. GPU work",
] as const;
export const HOST_PROFILES = {
  balanced: { label: "Balanced host", prepare: 3, gpu: 8, deliver: 2 },
  "host-bound": { label: "Slower CPU", prepare: 10, gpu: 8, deliver: 4 },
  negligible: { label: "No CPU overhead", prepare: 0, gpu: 8, deliver: 0 },
} as const;
export const ANSWER_STREAMS = [
  { id: "A", words: ["Cap", "is", "two", "years."] },
  { id: "B", words: ["Tests", "now", "all", "pass."] },
] as const;

const span = (start: number, duration: number): Interval => ({
  start,
  end: start + duration,
});
const duration = (i: Interval) => i.end - i.start;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
function lane(steps: DecodeStep[]): OverlapLane {
  const finish = steps.at(-1)!.deliver.end;
  const gpuBusy = steps.reduce((sum, step) => sum + duration(step.gpu), 0);
  return {
    steps,
    finish,
    gpuBusy,
    cpuBusy: steps.reduce(
      (sum, step) => sum + duration(step.prepare) + duration(step.deliver),
      0,
    ),
    gpuIdle: finish - gpuBusy,
    gaps: steps
      .slice(1)
      .flatMap((step, i) =>
        step.gpu.start > steps[i].gpu.end
          ? [{ start: steps[i].gpu.end, end: step.gpu.start }]
          : [],
      ),
  };
}

/**
 * CPU prepares the next step while the current GPU step runs. It then collects
 * the preceding result. The next GPU step depends on the prior device sample,
 * not host delivery. Fixed membership and device-resident token IDs are assumed.
 */
export function overlapStudy(profile: HostProfile = "balanced", count = 4) {
  if (!Object.hasOwn(HOST_PROFILES, profile))
    throw new RangeError("Unknown host profile");
  if (!Number.isInteger(count) || count < 1 || count > 32)
    throw new RangeError("Use 1–32 steps");
  const p = HOST_PROFILES[profile];
  const baseline: DecodeStep[] = [];
  const overlapped: DecodeStep[] = [];
  let cpuAvailable = 0;
  for (let index = 0; index < count; index++) {
    const prepare = span(baseline.at(-1)?.deliver.end ?? 0, p.prepare);
    const gpu = span(prepare.end, p.gpu);
    baseline.push({ index, prepare, gpu, deliver: span(gpu.end, p.deliver) });

    const previous = overlapped.at(-1);
    const nextPrepare = span(
      Math.max(previous?.gpu.start ?? 0, cpuAvailable),
      p.prepare,
    );
    const nextGpu = span(
      Math.max(nextPrepare.end, previous?.gpu.end ?? 0),
      p.gpu,
    );
    overlapped.push({
      index,
      prepare: nextPrepare,
      gpu: nextGpu,
      deliver: span(0, 0),
    });
    if (previous) {
      previous.deliver = span(
        Math.max(nextPrepare.end, previous.gpu.end),
        p.deliver,
      );
      cpuAvailable = previous.deliver.end;
    } else cpuAvailable = nextPrepare.end;
  }
  const last = overlapped.at(-1)!;
  last.deliver = span(Math.max(cpuAvailable, last.gpu.end), p.deliver);
  const a = lane(baseline),
    b = lane(overlapped);
  return {
    profile,
    inputs: p,
    count,
    streams: 2,
    baseline: a,
    overlapped: b,
    savedElapsed: a.finish - b.finish,
    savedPercent: ((a.finish - b.finish) / a.finish) * 100,
    axisMax: Math.ceil(a.finish / 10) * 10,
  };
}
export type OverlapStudy = ReturnType<typeof overlapStudy>;

function mix(a: number, b: number, t: number) {
  return a + (b - a) * clamp(t, 0, 1);
}
export function overlapFrame(presentationMs: number, study: OverlapStudy) {
  if (!Number.isFinite(presentationMs))
    throw new RangeError("A finite presentation cursor is required");
  const t = clamp(presentationMs, 0, OVERLAP_DURATION);
  const first = study.baseline.steps[0].deliver.end;
  const gapEnd = study.baseline.steps[1]?.gpu.start ?? first;
  const serviceMs =
    t < 5000
      ? mix(0, first, t / 5000)
      : t < 8000
        ? mix(first, gapEnd, (t - 5000) / 3000)
        : t < 10000
          ? gapEnd
          : t < 17000
            ? mix(gapEnd, study.overlapped.finish, (t - 10000) / 7000)
            : t < 21000
              ? study.overlapped.finish
              : t < 25000
                ? mix(
                    study.overlapped.finish,
                    study.baseline.finish,
                    (t - 21000) / 4000,
                  )
                : study.baseline.finish;
  const progress = (i: Interval) =>
    duration(i) === 0
      ? Number(serviceMs >= i.end)
      : clamp((serviceMs - i.start) / duration(i), 0, 1);
  const readLane = (l: OverlapLane) => ({
    completed: l.steps.filter((s) => serviceMs >= s.deliver.end).length,
    gpuBusy: l.steps.reduce(
      (sum, s) => sum + duration(s.gpu) * progress(s.gpu),
      0,
    ),
    activeStep:
      l.steps.find((s) => serviceMs >= s.gpu.start && serviceMs < s.gpu.end)
        ?.index ?? null,
    done: serviceMs >= l.finish,
  });
  return {
    presentationMs: t,
    serviceMs,
    beat: t < 5000 ? 0 : t < 10000 ? 1 : t < 17000 ? 2 : t < 25000 ? 3 : 4,
    baseline: readLane(study.baseline),
    overlapped: readLane(study.overlapped),
  };
}
export type OverlapFrame = ReturnType<typeof overlapFrame>;

export function overlapRecord(
  study: OverlapStudy,
  presentationMs: number,
  selectedStep: number | null,
) {
  return {
    schema: "cpu-gpu-overlap-v1",
    evidence:
      "Deterministic teaching schedule; not a measured engine benchmark",
    assumptions: [
      "Two fixed active streams; one illustrative output unit per stream per step",
      "One serial CPU, one serial GPU; fixed per-operation durations in milliseconds",
      "Next-step membership is known; prior sampled token IDs remain on-device",
      "Host output delivery is not a dependency for the next GPU step",
      "No network, dynamic membership, cancellation, kernel variation or verification cost",
      "Allocated device interval ends at final host delivery; not a billing measurement",
    ],
    study,
    frame: overlapFrame(presentationMs, study),
    selectedStep,
    source:
      "https://github.com/deepseek-ai/DeepInfer/blob/main/doc/inference_deployment_qa.md",
  };
}
