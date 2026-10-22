import type { StreamTrace } from "./stream-continuity-model";

/** Pure projection of the verified event trace. Visual progress adds no service events. */
export function servingPressureState(trace: StreamTrace, cursor: number) {
  const time = Math.max(0, Math.min(trace.finishMs, cursor));
  const step = trace.steps.find(item => item.startMs <= time && item.endMs > time) ?? null;
  const finished = trace.steps.filter(item => item.endMs <= time);
  const requests = trace.requests.map(request => {
    const inputDone = finished.reduce((sum, item) => sum + (item.prefill.find(part => part.id === request.id)?.tokens ?? 0), 0);
    const allocated = step?.prefill.find(part => part.id === request.id)?.tokens ?? 0;
    const count = request.tokenMs.filter(at => at <= time).length;
    return { ...request, inputDone, allocated, count,
      arrived: time >= request.arrivalMs,
      active: request.admissionMs !== null && request.admissionMs <= time && request.completionMs! > time,
      waiting: time >= request.arrivalMs && (request.admissionMs === null || time < request.admissionMs),
      done: request.completionMs !== null && time >= request.completionMs,
      sinceLast: count ? time - request.tokenMs[count - 1] : 0,
    };
  });
  return { time, step, requests,
    progress: step ? (time - step.startMs) / step.durationMs : 1,
    prefill: step?.prefill.reduce((sum, part) => sum + part.tokens, 0) ?? 0,
    decode: step?.decode.reduce((sum, part) => sum + part.tokens, 0) ?? 0,
    reserved: requests.filter(request => request.active).reduce((sum, request) => sum + request.pages, 0),
    complete: time >= trace.finishMs,
  };
}
