/* Serving glossary figures: each term told as one six-second loop, drawn for the
   card's own shape (400 × 120) so every label renders at 11 px or more.
   SMIL keeps them off the React clock; GlossaryBoard restarts them together
   when the board comes into view and pauses them when it leaves. */
import type { ReactNode } from "react";

const VB = "0 0 400 120";
const DUR = "6s";
const r3 = (x: number) => Math.round(x * 1000) / 1000;
const clampT = (t: number) => Math.min(0.995, Math.max(0.005, t));

/** Visible from `a` to `b` (fractions of the loop), hidden otherwise. */
function Win({ a, b, from = 0, to = 1 }: { a: number; b: number; from?: number; to?: number }) {
  const t0 = clampT(a), t1 = clampT(Math.max(b, t0 + 0.01));
  return <animate attributeName="opacity" values={`${from};${from};${to};${to};${from};${from}`} keyTimes={`0;${r3(t0)};${r3(Math.min(t0 + 0.004, t1))};${r3(t1)};${r3(Math.min(t1 + 0.004, 0.999))};1`} dur={DUR} repeatCount="indefinite" />;
}
/** Animate one attribute from `v0` to `v1` between `a` and `b`, holding `v1` until `hold`, then back. */
function Tween({ attr, v0, v1, a, b, hold = 0.96 }: { attr: string; v0: number | string; v1: number | string; a: number; b: number; hold?: number }) {
  const t0 = clampT(a), t1 = clampT(Math.max(b, t0 + 0.005)), t2 = clampT(Math.max(hold, t1 + 0.005));
  return <animate attributeName={attr} values={`${v0};${v0};${v1};${v1};${v0}`} keyTimes={`0;${r3(t0)};${r3(t1)};${r3(t2)};1`} dur={DUR} repeatCount="indefinite" />;
}
const Fig = ({ children, label }: { children: ReactNode; label: string }) => (
  <svg viewBox={VB} preserveAspectRatio="xMinYMid meet" className="gf" role="img" aria-label={label}>{children}</svg>
);

/* ── Streaming over SSE: tokens flow, pages fill; the client leaves, every page is freed. ── */
export function FigSSE() {
  const lines = ['data: "The"', 'data: " cache"', 'data: " stores"'];
  const fill = [0.1, 0.24, 0.38, 0.5];
  return <Fig label="Server-sent events stream one token per event; on disconnect the KV pages are freed">
    <text x={0} y={12} className="gf-t">event stream → client</text>
    {lines.map((l, i) => <text key={`t${l}`} x={0} y={36 + i * 18} className="gf-code" opacity={0}>{l}<Win a={0.08 + i * 0.14} b={0.94} /></text>)}
    <text x={0} y={100} className="gf-t gf-red" opacity={0}>✕ client disconnects<Win a={0.56} b={0.94} /></text>
    <path d="M150 52H250" className="gf-wire gf-ok" opacity={1}><Win a={0.56} b={0.94} from={1} to={0} /></path>
    <path d="M150 52H250" className="gf-wire gf-cut" opacity={0}><Win a={0.56} b={0.94} /></path>
    <circle r={4} cy={52} className="g-ink"><Tween attr="cx" v0={250} v1={150} a={0.06} b={0.5} hold={0.5} /><Win a={0.06} b={0.52} /></circle>
    <text x={270} y={12} className="gf-t">KV pages on the GPU</text>
    {fill.map((t, i) => <g key={i}>
      <rect x={270 + i * 32} y={30} width={26} height={34} rx={3} className="gf-slot" />
      <rect x={270 + i * 32} y={30} width={26} height={34} rx={3} className="g-a" opacity={0}><Win a={t} b={0.6} to={0.9} /></rect>
    </g>)}
    <text x={270} y={88} className="gf-t">pages held</text>
    {[1, 2, 3, 4].map((v, i) => <text key={v} x={400} y={88} textAnchor="end" className="gf-n" opacity={0}>{v}<Win a={fill[i]} b={i < 3 ? fill[i + 1] - 0.008 : 0.6} /></text>)}
    <text x={400} y={88} textAnchor="end" className="gf-n gf-green" opacity={0}>0<Win a={0.62} b={0.96} /></text>
    <text x={270} y={108} className="gf-t gf-green" opacity={0}>freed on disconnect<Win a={0.62} b={0.96} /></text>
  </Fig>;
}

/* ── KV cache sizing: weights first, then 4.5 GiB per 32k-token user until the GPU is full. ── */
export function FigKVSizing() {
  const PX = 5; // px per GB on the 80 GB bar
  const W = 8.04 * PX, U = 4.83 * PX; // 144 KiB × 32,768 tokens = 4.5 GiB = 4.83 GB
  return <Fig label="KV cache sizing: 12 users at 32k context fit beside the weights on one 80 GB GPU">
    <text x={0} y={12} className="gf-t">one 80 GB GPU · 32k-token context per user</text>
    <text x={340} y={12} textAnchor="end" className="gf-t">users</text>
    {Array.from({ length: 12 }, (_, i) => <text key={i} x={400} y={12} textAnchor="end" className="gf-n" opacity={0}>{i + 1}<Win a={0.1 + i * 0.05} b={i < 11 ? 0.142 + i * 0.05 : 0.96} /></text>)}
    <rect x={0} y={32} width={400} height={34} rx={3} className="gf-slot" />
    <rect x={0} y={32} width={W} height={34} rx={3} className="g-m" opacity={0.9} />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={W + 1 + i * U} y={32} width={U - 2} height={34} rx={2} className="g-a" opacity={0}><Win a={0.1 + i * 0.05} b={0.96} to={0.88} /></rect>)}
    <rect x={W + 12 * U + 1} y={32} width={400 - W - 12 * U - 1} height={34} rx={2} className="gf-hatch" opacity={0}><Win a={0.72} b={0.96} /></rect>
    <text x={0} y={88} className="gf-t">weights 8 GB</text>
    <text x={400} y={88} textAnchor="end" className="gf-t" opacity={0}>reserve 14 GB<Win a={0.72} b={0.96} /></text>
    <text x={W} y={108} className="gf-k" opacity={0}>144 KiB × 32,768 tokens = 4.5 GiB per user<Win a={0.16} b={0.96} /></text>
  </Fig>;
}

/* ── PagedAttention: a contiguous reserve wastes the tail; 16-token pages waste < 1 page. ── */
export function FigPaged() {
  const slots = 11, SW = 34;
  const order = [1, 6, 3]; // the block table scatters pages
  return <Fig label="PagedAttention allocates 16-token pages on demand instead of reserving the maximum length">
    <text x={0} y={12} className="gf-t">contiguous: reserve the maximum length</text>
    <rect x={0} y={20} width={400} height={16} rx={2} className="g-r" opacity={0.22} />
    <rect x={0} y={20} width={0} height={16} rx={2} className="g-b"><Tween attr="width" v0={0} v1={84} a={0.06} b={0.56} /></rect>
    <text x={400} y={52} textAnchor="end" className="gf-t gf-red" opacity={0}>held, never used<Win a={0.58} b={0.96} /></text>
    <text x={0} y={70} className="gf-t">paged: one 16-token page at a time</text>
    {Array.from({ length: slots }, (_, i) => <rect key={i} x={i * (SW + 2.6)} y={78} width={SW} height={16} rx={2} className="gf-slot" />)}
    {order.map((s, k) => {
      const a = 0.06 + k * (0.5 / 2.625), full = k < 2 ? SW : (SW * 10) / 16;
      return <rect key={s} x={s * (SW + 2.6)} y={78} width={0} height={16} rx={2} className="g-b"><Tween attr="width" v0={0} v1={full} a={a} b={k < 2 ? a + 0.19 : 0.56} /></rect>;
    })}
    <text x={0} y={114} className="gf-k" opacity={0}>42 tokens → 3 pages · 6 slots spare<Win a={0.58} b={0.96} /></text>
  </Fig>;
}

/* ── FlashAttention: tiles of Q·Kᵀ stay on-chip; the output fills by rows; HBM sees no N×N matrix. ── */
export function FigFlash() {
  const T = 21, G = 3, step = 0.82 / 16;
  return <Fig label="FlashAttention computes attention tile by tile in SRAM and never writes the N by N score matrix">
    <text x={0} y={12} className="gf-t">Q·Kᵀ tiles in SRAM</text>
    {Array.from({ length: 16 }, (_, i) => {
      const a = 0.04 + i * step;
      return <rect key={i} x={(i % 4) * (T + G)} y={22 + Math.floor(i / 4) * (T + G)} width={T} height={T} rx={2} className="g-a" opacity={0.1}>
        <animate attributeName="opacity" values=".1;.1;.95;.32;.32;.1" keyTimes={`0;${r3(a)};${r3(a + 0.005)};${r3(a + step)};.97;1`} dur={DUR} repeatCount="indefinite" />
      </rect>;
    })}
    <text x={130} y={34} className="gf-t">output, one running softmax</text>
    {[0, 1, 2, 3].map((r) => <g key={r}>
      <rect x={130 + r * 30} y={44} width={26} height={14} rx={2} className="gf-slot" />
      <rect x={130 + r * 30} y={44} width={26} height={14} rx={2} className="g-g" opacity={0}><Win a={0.04 + (r + 1) * 4 * step} b={0.97} to={0.85} /></rect>
    </g>)}
    <path d="M100 51H122" className="gf-wire gf-ok" />
    <text x={130} y={84} className="gf-t">written to HBM</text>
    <text x={130} y={112} className="gf-big">0</text>
    <text x={154} y={112} className="gf-t">N × N score matrices</text>
    <text x={400} y={112} textAnchor="end" className="gf-t" opacity={0}>one pass<Win a={0.88} b={0.97} /></text>
  </Fig>;
}

/* ── Continuous batching: a static batch idles finished slots; continuous admits work at once. ── */
export function FigBatching() {
  const X = 92, L = 308, span = 330, tEnd = 0.86;
  const sx = (u: number) => X + (u / span) * L;
  const tt = (u: number) => (u / span) * tEnd;
  const bar = (key: string, u0: number, u1: number, y: number, cls: string, op = 0.9) => (
    <rect key={key} x={sx(u0)} y={y} width={0} height={11} rx={2} className={cls} opacity={op}>
      <Tween attr="width" v0={0} v1={Math.max(0, sx(u1) - sx(u0) - 1.5)} a={0.02 + tt(u0)} b={0.02 + tt(u1)} />
    </rect>
  );
  const rows = (y0: number) => [0, 1, 2].map((r) => y0 + r * 14);
  const [s0, s1, s2] = rows(14), [c0, c1, c2] = rows(70);
  return <Fig label="Continuous batching admits a new request into any slot that finishes, instead of waiting for the whole batch">
    <text x={0} y={24} className="gf-k">static</text>
    <text x={0} y={40} className="gf-t gf-red">slots idle</text>
    {bar("a", 0, 300, s0, "g-b")}{bar("d", 300, 330, s0, "g-b")}
    {bar("b", 0, 120, s1, "g-b")}{bar("bi", 120, 300, s1, "g-r", 0.35)}{bar("e", 300, 330, s1, "g-b")}
    {bar("c", 0, 200, s2, "g-b")}{bar("ci", 200, 300, s2, "g-r", 0.35)}{bar("f", 300, 330, s2, "g-b")}
    <text x={0} y={80} className="gf-k">continuous</text>
    <text x={0} y={96} className="gf-t gf-green">0 idle</text>
    {bar("A", 0, 300, c0, "g-g")}{bar("D", 300, 330, c0, "g-a")}
    {bar("B", 0, 120, c1, "g-g")}{bar("E", 120, 250, c1, "g-a")}{bar("G", 250, 330, c1, "g-g")}
    {bar("C", 0, 200, c2, "g-g")}{bar("F", 200, 330, c2, "g-a")}
    <rect x={X} y={8} width={1.5} height={106} className="g-ink" opacity={0.7}><Tween attr="x" v0={X} v1={X + L} a={0.02} b={0.02 + tEnd} hold={0.97} /></rect>
    <text x={X} y={118} className="gf-t">time →</text>
  </Fig>;
}

/* ── Quantization: fewer bytes per weight, fewer bytes streamed for every decode step. ── */
export function FigQuant() {
  const S = 240 / 8.04;
  const rows = [["BF16 · 2 B", 8.04, "g-m", 0], ["FP8 · 1 B", 4.02, "g-c", 0.22], ["INT4 · ½ B", 2.01, "g-a", 0.46]] as const;
  return <Fig label="Quantization cuts the weight bytes read per decode step from 8.04 GB to 2.01 GB">
    {rows.map(([l, gb, c, a], k) => <g key={l}>
      <text x={0} y={22 + k * 30} className="gf-t">{l}</text>
      <rect x={96} y={10 + k * 30} width={8.04 * S} height={16} rx={2} className={c}>{a > 0 && <Tween attr="width" v0={8.04 * S} v1={gb * S} a={a} b={a + 0.16} />}</rect>
      <text x={400} y={22 + k * 30} textAnchor="end" className="gf-n" opacity={a > 0 ? 0 : 1}>{gb.toFixed(2)} GB{a > 0 && <Win a={a + 0.16} b={0.96} />}</text>
    </g>)}
    <text x={0} y={112} className="gf-t">Qwen3-4B weights streamed from HBM for every decode step</text>
  </Fig>;
}

/* ── Observability: four signals, each a value and its trace. ── */
export function FigObserve() {
  const spark = (seed: number) => Array.from({ length: 24 }, (_, i) => `${i ? "L" : "M"}${(i * 190) / 23} ${22 - Math.abs(Math.sin(i * 1.3 + seed) * Math.cos(i * 0.4 + seed)) * 20}`).join("");
  const m = [["first token", "105 ms"], ["worst token gap", "10.3 ms"], ["KV in use", "82%"], ["prefix hits", "93.8%"]];
  return <Fig label="Observability: time to first token, worst token gap, KV use and prefix hit rate">
    {m.map(([k, v], i) => <g key={k} transform={`translate(${(i % 2) * 210} ${Math.floor(i / 2) * 60})`}>
      <text y={12} className="gf-t">{k}</text>
      <text x={190} y={12} textAnchor="end" className="gf-n">{v}</text>
      <path d={spark(i)} transform="translate(0 22)" className="gf-trace" strokeDasharray="420" strokeDashoffset="420">
        <animate attributeName="stroke-dashoffset" values="420;420;0;0;420" keyTimes={`0;${r3(0.04 + i * 0.1)};${r3(0.5 + i * 0.1)};.96;1`} dur={DUR} repeatCount="indefinite" />
      </path>
    </g>)}
  </Fig>;
}

/* ── Engines: one OpenAI-compatible request, three engines, each with its own trick. ── */
export function FigEngines() {
  const E = [["vLLM", "paged KV"], ["TRT-LLM", "compiled FP8"], ["SGLang", "radix tree"]] as const;
  const BW = 124, G = 14;
  return <Fig label="vLLM, TensorRT-LLM and SGLang serve the same OpenAI-compatible request">
    <text x={0} y={12} className="gf-code">POST /v1/chat/completions</text>
    {E.map(([n, d], i) => {
      const x = i * (BW + G), cx = x + BW / 2, a = 0.04 + i * 0.31;
      return <g key={n}>
        <path d={`M${cx} 20V40`} className="gf-wire" />
        <rect x={x} y={40} width={BW} height={70} rx={6} className="gf-box" />
        <rect x={x} y={40} width={BW} height={70} rx={6} className="gf-box-lit" opacity={0}><Win a={a + 0.08} b={a + 0.3} /></rect>
        <text x={x + 12} y={62} className="gf-k">{n}</text>
        <text x={x + 12} y={80} className="gf-t">{d}</text>
        {i === 0 && [0, 1, 2, 3, 4].map((k) => <rect key={k} x={x + 12 + k * 20} y={90} width={16} height={10} rx={1.5} className={k % 2 ? "g-a" : "g-b"} opacity={0.75} />)}
        {i === 1 && [10, 6, 8, 4, 9].map((h, k) => <rect key={k} x={x + 12 + k * 20} y={100 - h} width={14} height={h} rx={1} className="g-c" opacity={0.8} />)}
        {i === 2 && <path d={`M${x + 14} 95H${x + 40}M${x + 40} 95L${x + 62} 90M${x + 40} 95L${x + 62} 101M${x + 62} 90H${x + 100}M${x + 62} 101H${x + 86}`} className="gf-trace" />}
        <circle cx={cx} r={4} className="g-ink" opacity={0}><Tween attr="cy" v0={18} v1={44} a={a} b={a + 0.08} hold={a + 0.1} /><Win a={a} b={a + 0.1} /></circle>
      </g>;
    })}
  </Fig>;
}

/* ── Autoscaling: queue depth crosses the threshold, warm replicas join, the queue drains. ── */
export function FigAutoscale() {
  const curve = "M0 104C50 104 70 34 110 30S170 88 250 96";
  return <Fig label="Autoscaling adds replicas from a warm pool when queue depth crosses a threshold">
    <text x={0} y={12} className="gf-t">queue depth</text>
    <path d="M0 56H250" className="gf-wire gf-cut" />
    <text x={0} y={48} className="gf-t">scale-out threshold</text>
    <path d={curve} className="gf-trace" />
    <circle r={4.5} className="g-a"><animateMotion path={curve} keyPoints="0;0;1;1" keyTimes="0;.04;.9;1" calcMode="linear" dur={DUR} repeatCount="indefinite" /></circle>
    <text x={282} y={12} className="gf-t">replicas</text>
    {[1, 2, 3, 4].map((v, i) => <text key={v} x={400} y={12} textAnchor="end" className="gf-n" opacity={0}>{v}<Win a={i ? 0.3 + i * 0.1 : 0} b={i < 3 ? 0.392 + i * 0.1 : 0.96} /></text>)}
    {[0, 1, 2, 3].map((i) => {
      const x = 282 + (i % 2) * 62, y = 26 + Math.floor(i / 2) * 40, warm = 0.2 + i * 0.1, ready = warm + 0.1;
      return <g key={i}>
        <rect x={x} y={y} width={54} height={32} rx={4} className="gf-slot" />
        {i > 0 && <rect x={x} y={y} width={54} height={32} rx={4} className="gf-warm" opacity={0}><Win a={warm} b={ready} /></rect>}
        <rect x={x} y={y} width={54} height={32} rx={4} className="g-g" opacity={i ? 0 : 0.85}>{i > 0 && <Win a={ready} b={0.96} to={0.85} />}</rect>
      </g>;
    })}
    <text x={282} y={116} className="gf-t">from a warm pool</text>
  </Fig>;
}
