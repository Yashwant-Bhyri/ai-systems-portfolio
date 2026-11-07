"use client";

import type { LabRun } from "./lab-simulation";

/**
 * All 96 requests as two matched clusters: GPU work against response time.
 * Each baseline dot slides to its own optimized counterpart, so the gain reads
 * as the whole population moving, and the median and mean mark where each
 * cluster sits. `k` runs from 0 (baseline only) to 1 (every pair has arrived).
 */
const BLUE = "#9cc5f5", GREEN = "#b8e986", VIOLET = "#d3b6ff";
const W = 470, H = 300, L = 68, R = 12, T = 12, B = 42;
const median = (v: number[]) => { const s = [...v].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const mean = (v: number[]) => v.reduce((a, x) => a + x, 0) / v.length;
const p95 = (v: number[]) => [...v].sort((a, b) => a - b)[Math.ceil(v.length * 0.95) - 1];
const f = (v: number, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const nice = (v: number) => { const m = 10 ** Math.floor(Math.log10(v)), q = v / m; return (q <= 1 ? 1 : q <= 2 ? 2 : q <= 5 ? 5 : 10) * m; };

export function clusterStats(baseline: LabRun, target: LabRun) {
  const lat = (r: LabRun) => r.tasks.map((t) => t.latency), gpu = (r: LabRun) => r.tasks.map((t) => t.gpuSeconds);
  return {
    medianLatency: [median(lat(baseline)), median(lat(target))] as const,
    meanLatency: [mean(lat(baseline)), mean(lat(target))] as const,
    p95Latency: [p95(lat(baseline)), p95(lat(target))] as const,
    medianGpu: [median(gpu(baseline)), median(gpu(target))] as const,
  };
}

export function RequestClusters({ baseline, target, taskId, k, onSelect }: { baseline: LabRun; target: LabRun; taskId: number; k: number; onSelect?: (id: number) => void }) {
  const xMax = nice(Math.max(...baseline.tasks.map((t) => t.gpuSeconds)) * 1.05);
  const yMax = nice(Math.max(...baseline.tasks.map((t) => t.latency)) * 1.05);
  const sx = (v: number) => L + (v / xMax) * (W - L - R);
  const sy = (v: number) => H - B - (v / yMax) * (H - T - B);
  const s = clusterStats(baseline, target);
  const cluster = (i: 0 | 1, col: string, opacity: number) => opacity > 0 && (
    <g opacity={opacity}>
      <path d={`M${sx(s.medianGpu[i])} ${T}V${H - B}M${L} ${sy(s.medianLatency[i])}H${W - R}`} stroke={col} strokeOpacity={0.55} strokeDasharray="5 4" />
      <circle cx={sx(s.medianGpu[i])} cy={sy(s.meanLatency[i])} r={9} fill="none" stroke={col} strokeWidth={2} />
    </g>
  );
  const pairs = baseline.tasks.map((a, i) => ({ a, b: target.tasks[i] }));
  const rows: [string, readonly [number, number], string, number][] = [
    ["Median response", s.medianLatency, "s", 0],
    ["Mean response", s.meanLatency, "s", 0],
    ["p95 response", s.p95Latency, "s", 0],
    ["Median GPU work", s.medianGpu, "GPU-s", 1],
  ];
  return (
    <div className="rc-root">
      <div className="rc-head"><strong>All 96 requests, paired</strong><span><i style={{ background: BLUE }} /> baseline <i style={{ background: GREEN }} /> optimized</span></div>
      <svg viewBox={`0 0 ${W} ${H}`} className="rc-plot" role="img" aria-label={`Response time against GPU work for 96 matched requests. Median response ${f(s.medianLatency[0])} s baseline, ${f(s.medianLatency[1])} s optimized.`}>
        <path d={`M${L} ${T}V${H - B}H${W - R}`} fill="none" stroke="#3a4753" />
        {[0, 0.5, 1].map((q) => <text key={q} x={L - 8} y={sy(yMax * q) + 4} textAnchor="end" className="rc-tick">{f(yMax * q)}</text>)}
        {[0, 0.5, 1].map((q) => <text key={q} x={sx(xMax * q)} y={H - B + 18} textAnchor="middle" className="rc-tick">{f(xMax * q)}</text>)}
        <text x={(L + W - R) / 2} y={H - 6} textAnchor="middle" className="rc-axis">GPU-s per request</text>
        <text x={14} y={(T + H - B) / 2} textAnchor="middle" transform={`rotate(-90 14 ${(T + H - B) / 2})`} className="rc-axis">response time (s)</text>
        {pairs.map(({ a, b }, i) => <path key={i} d={`M${sx(a.gpuSeconds)} ${sy(a.latency)}L${sx(a.gpuSeconds + (b.gpuSeconds - a.gpuSeconds) * k)} ${sy(a.latency + (b.latency - a.latency) * k)}`} stroke={VIOLET} strokeOpacity={i === taskId ? 0.9 : 0.1} strokeWidth={i === taskId ? 1.6 : 1} />)}
        {cluster(0, BLUE, 1)}
        {cluster(1, GREEN, Math.min(1, Math.max(0, (k - 0.75) * 4)))}
        {pairs.map(({ a }, i) => <circle key={i} cx={sx(a.gpuSeconds)} cy={sy(a.latency)} r={i === taskId ? 4.5 : 2.3} fill={BLUE} opacity={i === taskId ? 1 : 0.5} />)}
        {pairs.map(({ a, b }, i) => k > 0 && <circle key={i} cx={sx(a.gpuSeconds + (b.gpuSeconds - a.gpuSeconds) * k)} cy={sy(a.latency + (b.latency - a.latency) * k)} r={i === taskId ? 5 : 2.6} fill={GREEN} opacity={i === taskId ? 1 : 0.8} style={{ cursor: onSelect ? "pointer" : undefined }} onClick={onSelect ? () => onSelect(a.id) : undefined} />)}
      </svg>
      <table className="rc-table">
        <tbody>
          {rows.map(([label, [x, y], unit, d]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td data-tone="base">{f(x, d)}</td>
              <td data-tone="arrow">→</td>
              <td data-tone="opt">{k >= 0.75 ? f(y, d) : "?"}</td>
              <td data-tone="unit">{unit}</td>
              <td data-tone="delta">{k >= 0.75 ? `−${Math.round((100 * (x - y)) / x)}%` : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
