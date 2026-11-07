/* Reel silhouettes: each investigation reduced to one moving idea.
   SMIL keeps them off the React clock; viewBox 240 × 120 throughout. */

const VB = "0 0 240 120";
const D = (s: number) => `${s}s`;

/* ── Inference · Part 1 ───────────────────────────────────────────────── */

export function GlyphBigPicture() {
  // Same answers on top (the row of ticks never changes); the GPU time under them falls.
  const bars = [62, 48, 70, 54, 66, 44, 58, 72, 50, 64];
  return <svg viewBox={VB}>
    {bars.map((h, i) => <circle key={`t${i}`} cx={30 + i * 20} cy={16} r={3.5} className="g-g" />)}
    <path d="M18 108H226" className="g-axis" />
    {bars.map((h, i) => (
      <rect key={i} x={23 + i * 20} y={108 - h} width={14} height={h} rx={2} className="g-b">
        <animate attributeName="height" values={`${h};${h * 0.64};${h * 0.64};${h}`} keyTimes="0;.4;.9;1" calcMode="spline" keySplines=".45 0 .55 1;0 0 1 1;.45 0 .55 1" dur={D(8)} repeatCount="indefinite" />
        <animate attributeName="y" values={`${108 - h};${108 - h * 0.64};${108 - h * 0.64};${108 - h}`} keyTimes="0;.4;.9;1" calcMode="spline" keySplines=".45 0 .55 1;0 0 1 1;.45 0 .55 1" dur={D(8)} repeatCount="indefinite" />
      </rect>
    ))}
  </svg>;
}

export function GlyphExperiment() {
  // One bar; three levers take a slice off it, one at a time.
  const parts = [[150, 76, "g-r", 0], [116, 34, "g-a", 1], [84, 32, "g-c", 2]] as const;
  return <svg viewBox={VB}>
    <rect x={14} y={46} width={70} height={28} rx={4} className="g-g" />
    {parts.map(([x, w, c, i]) => (
      <rect key={x} x={x} y={46} width={w - 2} height={28} rx={3} className={c}>
        <animate attributeName="opacity" values="1;1;.1;.1;1" keyTimes={`0;${0.12 + i * 0.2};${0.2 + i * 0.2};.92;1`} dur={D(9)} repeatCount="indefinite" />
      </rect>
    ))}
  </svg>;
}

export function GlyphComposition() {
  // Accuracy up, then cost down: one point, one L-shaped journey.
  return <svg viewBox={VB}>
    <path d="M26 12V104H226" className="g-axis" />
    <path d="M176 88V30H92" className="g-line" strokeDasharray="3 5" />
    <circle cx={176} cy={88} r={4} className="g-m" />
    <circle r={7} className="g-a"><animateMotion path="M176 88V30H92" keyPoints="0;.41;.41;1;1;0" keyTimes="0;.28;.42;.72;.94;1" calcMode="linear" dur={D(9)} repeatCount="indefinite" /></circle>
  </svg>;
}

export function GlyphReplay() {
  // One request, two runs: the optimized bar ends first; a playhead crosses both.
  return <svg viewBox={VB}>
    <rect x={18} y={32} width={204} height={22} rx={4} className="g-b" opacity={0.85} />
    <rect x={18} y={70} width={132} height={22} rx={4} className="g-g" opacity={0.9} />
    <rect x={18} y={32} width={8} height={22} className="g-a" /><rect x={18} y={70} width={8} height={22} className="g-a" />
    <rect x={18} y={22} width={2} height={80} rx={1} className="g-ink"><animate attributeName="x" values="18;222;222;18" keyTimes="0;.8;.96;1" dur={D(8)} repeatCount="indefinite" /></rect>
  </svg>;
}

export function GlyphLatency() {
  // Every request ranked: the optimized curve sits below, and the gap is widest at the slow end.
  return <svg viewBox={VB}>
    <path d="M22 12V106H226" className="g-axis" />
    <path d="M26 96C110 86 170 60 220 18" fill="none" className="g-b-s" strokeWidth="2.5" />
    <path d="M26 98C110 94 176 80 220 58" fill="none" className="g-g-s" strokeWidth="2.5" />
    <path d="M214 24V56" className="g-a-s" strokeWidth="2">
      <animate attributeName="opacity" values=".2;1;1;.2" keyTimes="0;.3;.8;1" dur={D(6)} repeatCount="indefinite" />
    </path>
  </svg>;
}

export function GlyphFigureStory() {
  return <svg viewBox={VB}>
    <path d="M24 100L74 86L112 60L150 52L208 22" className="g-line g-a-s" strokeWidth={2} strokeDasharray="240" strokeDashoffset="240">
      <animate attributeName="stroke-dashoffset" values="240;0;0" keyTimes="0;.7;1" dur={D(4)} repeatCount="indefinite" />
    </path>
    {[[24, 100], [74, 86], [112, 60], [150, 52], [208, 22]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3.4} className="g-a"><animate attributeName="opacity" values="0;0;1;1" keyTimes={`0;${i * .14};${i * .14 + .04};1`} dur={D(4)} repeatCount="indefinite" /></circle>)}
    <path d="M200 92l14 8-14 8z" className="g-a" />
  </svg>;
}

/* ── Inference · Part 2 · investigations ──────────────────────────────── */

export function GlyphChunked() {
  // A long prompt (amber) in one block stalls the answer; in chunks, the answer keeps its beat.
  const ticks = (y: number, skip: (i: number) => boolean) => Array.from({ length: 22 }, (_, i) => (skip(i) ? null : <rect key={i} x={16 + i * 10} y={y} width={5} height={26} rx={1.5} className="g-g" />));
  return <svg viewBox={VB}>
    {ticks(22, (i) => i > 5 && i < 16)}
    <rect x={76} y={22} width={96} height={26} rx={3} className="g-a"><animate attributeName="opacity" values=".55;1;.55" dur={D(5)} repeatCount="indefinite" /></rect>
    {ticks(70, (i) => i % 3 === 1)}
    {Array.from({ length: 7 }, (_, i) => <rect key={i} x={26 + i * 30} y={70} width={5} height={26} rx={1.5} className="g-a" />)}
  </svg>;
}

export function GlyphServingMap() {
  // Requests into one scheduler, out to the GPU: a pulse travels each route.
  const rows = [24, 48, 72, 96];
  return <svg viewBox={VB}>
    <rect x={106} y={40} width={44} height={40} rx={7} className="g-box" />
    <rect x={186} y={46} width={34} height={28} rx={5} className="g-a" opacity={0.8} />
    <path d="M150 60H186" className="g-line" />
    {rows.map((y, i) => (
      <g key={y}>
        <path d={`M28 ${y}C70 ${y} 70 60 106 60`} className="g-line" />
        <circle cx={22} cy={y} r={5} className="g-b" />
        <circle r={3.5} className="g-g"><animateMotion path={`M28 ${y}C70 ${y} 70 60 106 60H186`} dur={D(5)} begin={D(i * 1.25)} repeatCount="indefinite" /></circle>
      </g>
    ))}
  </svg>;
}

export function GlyphDraft() {
  // A small model drafts many words; one sweep of the large model verifies them together.
  const cells = Array.from({ length: 8 }, (_, i) => i);
  return <svg viewBox={VB}>
    {cells.map((i) => (
      <rect key={i} x={20 + i * 26} y={30} width={20} height={20} rx={3} className="g-a">
        <animate attributeName="opacity" values=".1;1;1;.1" keyTimes={`0;${0.04 + i * 0.05};.92;1`} dur={D(8)} repeatCount="indefinite" />
      </rect>
    ))}
    {cells.map((i) => (
      <rect key={`v${i}`} x={20 + i * 26} y={72} width={20} height={20} rx={3} className="g-g">
        <animate attributeName="opacity" values=".08;.08;1;1;.08" keyTimes="0;.56;.66;.92;1" dur={D(8)} repeatCount="indefinite" />
      </rect>
    ))}
  </svg>;
}

export function GlyphCacheRoute() {
  // A request goes past the empty replica to the one that holds its pages.
  return <svg viewBox={VB}>
    <path d="M26 60C80 60 90 30 140 30" className="g-g-s" fill="none" strokeWidth="2" />
    <path d="M26 60C80 60 90 90 140 90" className="g-line" strokeDasharray="3 5" />
    {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={146 + i * 15} y={20} width={12} height={20} rx={2} className="g-c" />)}
    {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={146 + i * 15} y={80} width={12} height={20} rx={2} className="g-box" />)}
    <circle cx={22} cy={60} r={6} className="g-a" />
    <circle r={5} className="g-a"><animateMotion path="M26 60C80 60 90 30 140 30" keyPoints="0;1;1" keyTimes="0;.5;1" calcMode="linear" dur={D(5)} repeatCount="indefinite" /></circle>
  </svg>;
}

export function GlyphOverlap() {
  // The CPU's block slides under the GPU's, so the GPU never waits.
  return <svg viewBox={VB}>
    {[0, 1, 2, 3].map((i) => <rect key={i} x={20 + i * 52} y={68} width={46} height={26} rx={3} className="g-g" />)}
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={36 + i * 52} y={28} width={24} height={26} rx={3} className="g-b">
        <animate attributeName="opacity" values=".35;1;.35" dur={D(5)} begin={D(i * 0.6)} repeatCount="indefinite" />
      </rect>
    ))}
  </svg>;
}

export function GlyphContinuity() {
  return <svg viewBox={VB}>
    {[0, 1, 2].map(r => Array.from({ length: 20 }, (_, i) => <rect key={`${r}-${i}`} x={16 + i * 10.5} y={22 + r * 24} width={7} height={12} rx={1.5} className={["g-b", "g-a", "g-g"][r]} opacity={.15}>
      <animate attributeName="opacity" values=".15;.95;.15" dur={D(2.2)} begin={D(i * .09 + r * .2)} repeatCount="indefinite" />
    </rect>))}
    <text x={14} y={110} className="g-t">token budget · memory pool</text>
  </svg>;
}

/* ── Inference · Part 2 · serving glossary ────────────────────────────── */

export function GlyphSSE() {
  return <svg viewBox={VB}>
    <text x={14} y={20} className="g-t">event: token</text>
    {[0, 1, 2, 3].map(i => <text key={i} x={14} y={40 + i * 16} className="g-code" opacity={0}>data: {["\"The\"", "\" cache\"", "\" stores\"", "[DONE]"][i]}
      <animate attributeName="opacity" values="0;1;1;0" keyTimes={`0;${.1 + i * .16};.9;1`} dur={D(4)} repeatCount="indefinite" /></text>)}
    <path d="M150 30H226" className="g-line g-g-s" strokeWidth={2} />
    <path d="M150 74H226" className="g-line g-r-s" strokeWidth={2} strokeDasharray="4 4" />
    <text x={188} y={22} className="g-t" textAnchor="middle">open</text>
    <text x={188} y={92} className="g-t" textAnchor="middle">disconnect → free pages</text>
  </svg>;
}

export function GlyphKVSizing() {
  // A dictionary of terms: entries light one by one.
  return <svg viewBox={VB}>
    {Array.from({ length: 9 }, (_, i) => (
      <rect key={i} x={36 + (i % 3) * 58} y={18 + Math.floor(i / 3) * 30} width={50} height={22} rx={4} className="g-a">
        <animate attributeName="opacity" values=".12;.12;1;.12;.12" keyTimes={`0;${i * 0.1};${0.05 + i * 0.1};${0.14 + i * 0.1};1`} dur={D(9)} repeatCount="indefinite" />
      </rect>
    ))}
  </svg>;
}

export function GlyphPaged() {
  return <svg viewBox={VB}>
    <text x={14} y={18} className="g-t">contiguous reserve</text>
    <rect x={14} y={24} width={212} height={14} rx={2} className="g-m" opacity={.2} />
    <rect x={14} y={24} width={40} height={14} rx={2} className="g-b" />
    <text x={14} y={62} className="g-t">16-token pages</text>
    {Array.from({ length: 14 }, (_, i) => <rect key={i} x={14 + i * 15.2} y={68} width={12} height={14} rx={2} className={[0, 3, 4, 9, 11].includes(i) ? "g-b" : [1, 6, 7, 12].includes(i) ? "g-a" : "g-m"} opacity={[2, 5, 8, 10, 13].includes(i) ? .18 : .9}>
      <animate attributeName="opacity" values={[2, 5, 8, 10, 13].includes(i) ? ".18;.18;.9;.9;.18" : ".9;.9;.9;.9;.9"} keyTimes="0;.4;.5;.9;1" dur={D(4)} repeatCount="indefinite" />
    </rect>)}
    <text x={14} y={110} className="g-t">waste ≤ 1 page per sequence</text>
  </svg>;
}

export function GlyphFlash() {
  return <svg viewBox={VB}>
    <rect x={14} y={14} width={86} height={86} rx={4} className="g-box" />
    {Array.from({ length: 16 }, (_, i) => <rect key={i} x={20 + (i % 4) * 20} y={20 + Math.floor(i / 4) * 20} width={16} height={16} rx={2} className="g-a" opacity={.1}>
      <animate attributeName="opacity" values=".1;.9;.1" dur={D(3.2)} begin={D(i * .2)} repeatCount="indefinite" />
    </rect>)}
    <text x={116} y={30} className="g-t">tile in SRAM</text>
    <text x={116} y={52} className="g-t">online softmax</text>
    <text x={116} y={82} className="g-n g-hi">0</text><text x={134} y={82} className="g-t">N×N writes</text>
    <text x={116} y={100} className="g-t">to HBM</text>
  </svg>;
}

export function GlyphBatching() {
  const L = [118, 48, 76], X = 92, W = 132;
  return <svg viewBox={VB}>
    <text x={14} y={22} className="g-t">static</text>
    {[0, 1, 2].map(r => <g key={r}><rect x={X} y={12 + r * 14} width={L[r]} height={10} rx={2} className="g-b" /><rect x={X + L[r]} y={12 + r * 14} width={W - L[r]} height={10} rx={2} className="g-r" opacity={.25} /></g>)}
    <text x={14} y={76} className="g-t">continuous</text>
    {[0, 1, 2].map(r => <g key={r}><rect x={X} y={66 + r * 14} width={L[r]} height={10} rx={2} className="g-g" /><rect x={X + L[r] + 2} y={66 + r * 14} width={W - L[r] - 2} height={10} rx={2} className="g-a" opacity={.85}>
      <animate attributeName="width" values={`0;${W - L[r] - 2};${W - L[r] - 2}`} keyTimes="0;.5;1" dur={D(3.4)} repeatCount="indefinite" /></rect></g>)}
  </svg>;
}

export function GlyphQuant() {
  const S = 15; // px per GB; BF16 bar ends at 60 + 121, labels start at 190
  return <svg viewBox={VB}>
    {[["BF16", 8.04, "g-m"], ["FP8", 4.02, "g-c"], ["INT4", 2.01, "g-a"]].map(([l, gb, c], k) => <g key={String(l)}>
      <text x={14} y={30 + k * 28} className="g-t">{l}</text>
      <rect x={60} y={20 + k * 28} width={Number(gb) * S} height={13} rx={2} className={String(c)}>
        <animate attributeName="width" values={`${8.04 * S};${Number(gb) * S};${Number(gb) * S}`} keyTimes="0;.4;1" dur={D(3.6)} repeatCount="indefinite" />
      </rect>
      <text x={226} y={30 + k * 28} className="g-t" textAnchor="end">{Number(gb).toFixed(2)} GB</text>
    </g>)}
    <text x={14} y={110} className="g-t">Qwen3-4B weights read per token</text>
  </svg>;
}

export function GlyphObserve() {
  // Each metric owns a quarter: label, value, then its trace underneath — nothing crosses a number.
  const spark = (seed: number) => Array.from({ length: 18 }, (_, i) => `${i ? "L" : "M"}${i * 5.4} ${10 - Math.abs(Math.sin(i * 1.7 + seed)) * 9}`).join("");
  return <svg viewBox={VB}>
    {[["TTFT", "105 ms"], ["TPOT", "10.3 ms"], ["KV util", "82%"], ["prefix hit", "93.8%"]].map(([k, v], i) => <g key={k} transform={`translate(${14 + (i % 2) * 114} ${8 + Math.floor(i / 2) * 56})`}>
      <text y={10} className="g-t">{k}</text>
      <text y={30} className="g-n" style={{ fontSize: 14 }}>{v}</text>
      <path d={spark(i)} transform="translate(0 36)" className="g-line g-a-s" strokeDasharray="120" strokeDashoffset="120">
        <animate attributeName="stroke-dashoffset" values="120;0;0" keyTimes="0;.6;1" dur={D(3.2)} begin={D(i * .3)} repeatCount="indefinite" />
      </path>
    </g>)}
  </svg>;
}

export function GlyphEngines() {
  return <svg viewBox={VB}>
    {[["vLLM", "paged KV"], ["TRT-LLM", "FP8 engine"], ["SGLang", "radix tree"]].map(([n, d], i) => <g key={n}>
      <rect x={10 + i * 75} y={18} width={69} height={62} rx={6} className="g-box">
        <animate attributeName="stroke-opacity" values={["1;.25;.25;1", ".25;1;.25;.25", ".25;.25;1;.25"][i]} dur={D(4.5)} calcMode="discrete" repeatCount="indefinite" />
      </rect>
      <text x={44.5 + i * 75} y={46} className="g-t g-hi" textAnchor="middle">{n}</text>
      <text x={44.5 + i * 75} y={64} className="g-t" textAnchor="middle" style={{ fontSize: 8.5 }}>{d}</text>
    </g>)}
    <text x={14} y={108} className="g-t">one OpenAI-compatible API</text>
  </svg>;
}

export function GlyphAutoscale() {
  return <svg viewBox={VB}>
    <path d="M14 96C60 96 70 30 110 30S170 80 226 70" className="g-line g-b-s" strokeWidth={1.6} />
    {[0, 1, 2, 3].map(i => <rect key={i} x={120 + i * 26} y={92} width={20} height={14} rx={3} className={i < 1 ? "g-g" : "g-m"} opacity={i < 1 ? 1 : .25}>
      <animate attributeName="opacity" values={i < 1 ? "1" : ".25;.25;1;1"} keyTimes={i < 1 ? undefined : `0;${.25 + i * .15};${.35 + i * .15};1`} dur={D(5)} repeatCount="indefinite" />
    </rect>)}
    <text x={14} y={20} className="g-t">queue depth</text>
    <text x={120} y={86} className="g-t">replicas</text>
  </svg>;
}

/* ── Post-training ────────────────────────────────────────────────────── */

export function GlyphCapability() {
  // One square per task: more of them turn on.
  const on = new Set([0, 3, 4, 8, 9, 11, 14, 15, 18, 22, 23, 25, 27, 30, 32, 33]);
  return <svg viewBox={VB}>
    {Array.from({ length: 36 }, (_, i) => (
      <rect key={i} x={30 + (i % 12) * 15.5} y={26 + Math.floor(i / 12) * 24} width={12} height={18} rx={2} className={on.has(i) ? "g-r" : "g-m"} opacity={on.has(i) ? undefined : 0.35}>
        {on.has(i) && <animate attributeName="opacity" values=".15;1;1;.15" keyTimes={`0;${0.08 + (i / 36) * 0.5};.92;1`} dur={D(8)} repeatCount="indefinite" />}
      </rect>
    ))}
  </svg>;
}

/** Where the 96 tasks land: a cloud of tasks under an ability line that rises. */
export function GlyphTasks() {
  // Tasks stacked by difficulty; the ability line sweeps right and everything behind it lights.
  const col = [5, 4, 4, 3, 4, 3, 2, 3, 2, 2, 1];
  return <svg viewBox={VB}>
    {col.flatMap((n, x) => Array.from({ length: n }, (_, y) => (
      <circle key={`${x}-${y}`} cx={30 + x * 18} cy={102 - y * 15} r={5} className="g-r">
        <animate attributeName="opacity" values=".2;.2;1;1;.2" keyTimes={`0;${0.04 + x * 0.06};${0.08 + x * 0.06};.92;1`} dur={D(8)} repeatCount="indefinite" />
      </circle>
    )))}
    <rect y={16} width={2} height={92} rx={1} className="g-ink"><animate attributeName="x" values="22;216;216;22" keyTimes="0;.74;.92;1" dur={D(8)} repeatCount="indefinite" /></rect>
  </svg>;
}

/** Elastic RL: GPU rows whose cells flip between rollout (rose) and training (cyan) without a shared barrier. */
export function GlyphFleet() {
  // Eight GPUs, each changing role as needed, with no gap between roles.
  const rows = [14, 26, 38, 50, 62, 74, 86, 98];
  return <svg viewBox={VB}>
    {rows.map((y, r) => (
      <g key={y}>
        <rect x={22} y={y} width={196} height={8} rx={2} className="g-r" opacity={0.7} />
        <rect x={22 + ((r * 37) % 120)} y={y} width={60} height={8} rx={2} className="g-c">
          <animate attributeName="x" values={`${22 + ((r * 37) % 120)};${60 + ((r * 53) % 96)};${22 + ((r * 37) % 120)}`} dur={D(9)} calcMode="spline" keyTimes="0;.5;1" keySplines=".45 0 .55 1;.45 0 .55 1" repeatCount="indefinite" />
        </rect>
      </g>
    ))}
  </svg>;
}

export function GlyphCurves() {
  // Each checkpoint's curve draws itself as it is given more thinking budget.
  const lines = [["M26 98C70 92 130 86 220 78", "g-m-s", 0], ["M26 90C70 74 130 62 220 52", "g-b-s", 0.5], ["M26 80C70 50 130 34 220 24", "g-r-s", 1]] as const;
  return <svg viewBox={VB}>
    <path d="M22 12V106H226" className="g-axis" />
    {lines.map(([d, c, b]) => (
      <path key={d} d={d} fill="none" className={c} strokeWidth="2.5" pathLength={1} strokeDasharray="1" strokeDashoffset="1">
        <animate attributeName="stroke-dashoffset" values="1;0;0;1" keyTimes="0;.45;.92;1" dur={D(8)} begin={D(b)} repeatCount="indefinite" />
      </path>
    ))}
  </svg>;
}

export function GlyphAudit() {
  // Gains and the few losses, side by side: the losses are never averaged away.
  return <svg viewBox={VB}>
    {Array.from({ length: 22 }, (_, i) => <rect key={i} x={22 + i * 9} y={30} width={6} height={24} rx={1.5} className="g-g" opacity={0.8} />)}
    {[0, 1].map((i) => (
      <rect key={i} x={22 + i * 9} y={72} width={6} height={24} rx={1.5} className="g-r"><animate attributeName="opacity" values=".4;1;.4" dur={D(4)} repeatCount="indefinite" /></rect>
    ))}
  </svg>;
}

export function GlyphElastic() {
  return <svg viewBox={VB}>
    {Array.from({ length: 8 }, (_, r) => Array.from({ length: 14 }, (_, i) => <rect key={`${r}-${i}`} x={14 + i * 15.4} y={12 + r * 11} width={13} height={8} rx={1.5} className={(i + r) % 5 === 0 ? "g-c" : "g-r"} opacity={.25}>
      <animate attributeName="opacity" values=".25;.9;.25" dur={D(2.6)} begin={D(((i * 3 + r * 5) % 13) * .2)} repeatCount="indefinite" />
    </rect>))}
    <text x={14} y={112} className="g-t">rollout ↔ train · 4 → 7 RL steps</text>
  </svg>;
}

export function GlyphFrontier() {
  // Move by move: accuracy climbs, then the last step only lowers the cost.
  const pts = "M60 98L92 72L112 58L190 26L120 26";
  return <svg viewBox={VB}>
    <path d="M22 12V106H226" className="g-axis" />
    <path d={pts} fill="none" className="g-r-s" strokeWidth="2" pathLength={1} strokeDasharray="1" strokeDashoffset="1">
      <animate attributeName="stroke-dashoffset" values="1;0;0;1" keyTimes="0;.6;.94;1" dur={D(9)} repeatCount="indefinite" />
    </path>
    <circle r={6} className="g-a"><animateMotion path={pts} keyPoints="0;1;1;0" keyTimes="0;.6;.94;1" calcMode="linear" dur={D(9)} repeatCount="indefinite" /></circle>
  </svg>;
}

/* ── Post-training · Brain-Scan family ────────────────────────────────── */

export function GlyphInside() {
  // Layers by tokens: a scan crosses, and the columns that changed light up.
  const hot = new Set([3, 4, 9, 10, 14]);
  return <svg viewBox={VB}>
    {Array.from({ length: 18 }, (_, x) => Array.from({ length: 6 }, (_, y) => (
      <rect key={`${x}-${y}`} x={22 + x * 11} y={22 + y * 13} width={9.5} height={11} className={hot.has(x) ? "g-r" : "g-m"} opacity={hot.has(x) ? 0.25 + ((y * 7) % 5) * 0.15 : 0.22} />
    )))}
    <rect y={16} width={2} height={88} rx={1} className="g-ink"><animate attributeName="x" values="20;222;222;20" keyTimes="0;.8;.95;1" dur={D(8)} repeatCount="indefinite" /></rect>
  </svg>;
}

export function GlyphTerrain() {
  // Ridges rising, one training step after another.
  const ridges = [["M16 100C60 96 90 80 120 84C160 88 190 66 224 72V104H16Z", 0], ["M16 80C60 74 90 58 120 62C160 68 190 44 224 50V84H16Z", 0.8], ["M16 58C60 50 90 34 120 38C160 44 190 20 224 26V62H16Z", 1.6]] as const;
  return <svg viewBox={VB}>
    {ridges.map(([d, b], i) => (
      <path key={d} d={d} className="g-r" opacity={0}>
        <animate attributeName="opacity" values={`0;${0.35 + i * 0.25};${0.35 + i * 0.25};0`} keyTimes="0;.25;.9;1" dur={D(8)} begin={D(b)} repeatCount="indefinite" />
      </path>
    ))}
  </svg>;
}

export function GlyphSummary() {
  // A strip of moments with a playhead crossing it.
  return <svg viewBox={VB}>
    {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={18 + i * 35} y={36} width={29} height={48} rx={4} className={i % 2 ? "g-g" : "g-a"} opacity={0.4 + i * 0.09} />)}
    <rect x={16} y={28} width={2} height={64} rx={1} className="g-ink"><animate attributeName="x" values="16;224" dur={D(9)} repeatCount="indefinite" /></rect>
  </svg>;
}

export function GlyphLearn() {
  // Several attempts, tested: the ones that pass grow, the rest shrink.
  const rows = [[24, 1], [50, 0], [76, 1], [102, 0]] as const;
  return <svg viewBox={VB}>
    {rows.map(([y, ok]) => (
      <g key={y}>
        <rect x={28} y={y - 9} width={90} height={14} rx={3} className={ok ? "g-r" : "g-m"}>
          <animate attributeName="width" values={ok ? "60;178;178;60" : "120;36;36;120"} keyTimes="0;.45;.9;1" calcMode="spline" keySplines=".45 0 .55 1;0 0 1 1;.45 0 .55 1" dur={D(8)} repeatCount="indefinite" />
        </rect>
      </g>
    ))}
  </svg>;
}

export function GlyphManifold() {
  // Two clusters in a turning cube: joined point to point, pulling apart and coming back.
  const pts = [[70, 40], [92, 62], [58, 70], [84, 84], [110, 44], [66, 92]];
  return <svg viewBox={VB}>
    <path d="M40 24L150 14L204 34V96L150 110L40 98Z M40 24L94 44V112 M94 44L204 34" className="g-axis" />
    {pts.map(([x, y], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r={4.5} className="g-b" />
        <circle cx={x} cy={y} r={4.5} className="g-g">
          <animate attributeName="cx" values={`${x};${x + 72};${x + 72};${x}`} keyTimes="0;.42;.9;1" calcMode="spline" keySplines=".45 0 .55 1;0 0 1 1;.45 0 .55 1" dur={D(8)} repeatCount="indefinite" />
          <animate attributeName="cy" values={`${y};${y - 12};${y - 12};${y}`} keyTimes="0;.42;.9;1" calcMode="spline" keySplines=".45 0 .55 1;0 0 1 1;.45 0 .55 1" dur={D(8)} repeatCount="indefinite" />
        </circle>
      </g>
    ))}
  </svg>;
}

export function GlyphRace() {
  // Two runs mirrored on one clock: the lower one finishes first.
  const rows = Array.from({ length: 9 }, (_, i) => i);
  return <svg viewBox={VB}>
    <path d="M14 60H226" className="g-axis" />
    {rows.map((i) => <rect key={`a${i}`} x={18 + i * 21} y={50 - i * 5} width={22} height={3.6} className="g-b" />)}
    {rows.map((i) => <rect key={`b${i}`} x={18 + i * 13} y={67 + i * 5} width={14} height={3.6} className="g-g" />)}
    <rect y={8} width={2} height={104} rx={1} className="g-ink"><animate attributeName="x" values="16;222;222;16" keyTimes="0;.8;.95;1" dur={D(8)} repeatCount="indefinite" /></rect>
  </svg>;
}
