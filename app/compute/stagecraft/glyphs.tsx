/* Reel silhouettes: each investigation reduced to one moving idea.
   SMIL keeps them off the React clock; viewBox 240 × 120 throughout. */

const VB = "0 0 240 120";
const D = (s: number) => `${s}s`;

/* ── Inference · Part 1 ───────────────────────────────────────────────── */

export function GlyphExperiment() {
  // Three interventions remove three slices of the same bar.
  const parts = [[0, 46, "g-r"], [46, 62, "g-a"], [108, 22, "g-c"]] as const;
  return <svg viewBox={VB}>
    <text x={14} y={22} className="g-t">GPU-s / correct</text>
    <rect x={14} y={36} width={212} height={16} rx={3} className="g-m" opacity={.35} />
    {parts.map(([x, w, c], i) => <rect key={i} x={226 - x - w} y={36} width={w} height={16} rx={2} className={c}>
      <animate attributeName="opacity" values="1;1;.12;.12;1" keyTimes={`0;${.18 + i * .16};${.26 + i * .16};.92;1`} dur={D(5.4)} repeatCount="indefinite" />
    </rect>)}
    <rect x={14} y={36} width={96} height={16} rx={3} className="g-g" />
    <rect x={14} y={66} width={8} height={8} rx={1.5} className="g-r" /><text x={26} y={74} className="g-t">wait</text>
    <rect x={66} y={66} width={8} height={8} rx={1.5} className="g-a" /><text x={78} y={74} className="g-t">reread</text>
    <rect x={132} y={66} width={8} height={8} rx={1.5} className="g-c" /><text x={144} y={74} className="g-t">slow rates</text>
    <text x={14} y={102} className="g-t">same answers · less work each</text>
  </svg>;
}

export function GlyphComposition() {
  // The four conditions as a quadrilateral; training lifts (rose), serving shifts left (amber).
  return <svg viewBox={VB}>
    <path d="M24 12V104H226" className="g-axis" />
    <path d="M190 84L70 84L106 34L198 34Z" className="g-line" strokeDasharray="2 5" />
    <circle cx={190} cy={84} r={4} className="g-m" /><circle cx={70} cy={84} r={3} className="g-m" /><circle cx={198} cy={34} r={3} className="g-m" /><circle cx={106} cy={34} r={3} className="g-m" />
    <path d="M190 84L198 34" className="g-line g-r-s" strokeWidth={2} strokeDasharray="60" strokeDashoffset="60">
      <animate attributeName="stroke-dashoffset" values="60;0;0;0" keyTimes="0;.3;.9;1" dur={D(5)} repeatCount="indefinite" />
    </path>
    <path d="M198 34L106 34" className="g-line g-a-s" strokeWidth={2} strokeDasharray="100" strokeDashoffset="100">
      <animate attributeName="stroke-dashoffset" values="100;100;0;0" keyTimes="0;.35;.7;1" dur={D(5)} repeatCount="indefinite" />
    </path>
    <circle r={5} className="g-ink"><animateMotion path="M190 84L198 34L106 34" keyPoints="0;0.35;1;1" keyTimes="0;.3;.7;1" calcMode="linear" dur={D(5)} repeatCount="indefinite" /></circle>
    <text x={30} y={22} className="g-t">pass@1 ↑</text><text x={226} y={116} className="g-t" textAnchor="end">← GPU-s / correct</text>
  </svg>;
}

export function GlyphReplay() {
  const bars = Array.from({ length: 32 }, (_, i) => 14 + ((i * 37) % 23));
  return <svg viewBox={VB}>
    <rect x={14} y={18} width={164} height={12} rx={2} className="g-b" opacity={.8} />
    <rect x={14} y={38} width={102} height={12} rx={2} className="g-g" />
    <rect x={14} y={14} width={1.5} height={40} className="g-ink"><animate attributeName="x" values="14;178;178" keyTimes="0;.7;1" dur={D(3.6)} repeatCount="indefinite" /></rect>
    {bars.map((h, i) => <rect key={i} x={14 + i * 6.7} y={108 - h} width={3.4} height={h} rx={1} className={i % 3 ? "g-b" : "g-g"} opacity={.55} />)}
    <rect x={14} y={70} width={8} height={40} rx={2} className="g-sel"><animate attributeName="x" values="54;54;121;121;188;188;54" keyTimes="0;.28;.36;.62;.7;.94;1" dur={D(6)} repeatCount="indefinite" /></rect>
  </svg>;
}

export function GlyphLatency() {
  const dots = Array.from({ length: 24 }, (_, i) => i);
  return <svg viewBox={VB}>
    <path d="M20 104H224" className="g-axis" />
    {dots.map(i => <circle key={i} cx={24 + i * 8.4} cy={100 - Math.pow(i / 23, 3) * 78} r={2.6} className={i > 21 ? "g-r" : "g-b"} />)}
    {[["p50", 120], ["p95", 196], ["p99", 212]].map(([l, x], i) => <g key={l}>
      <path d={`M${x} 14V104`} className="g-line g-a-s" strokeDasharray="2 4" opacity={0}>
        <animate attributeName="opacity" values={["1;0;0;1", "0;1;0;0", "0;0;1;0"][i]} dur={D(4.5)} calcMode="discrete" repeatCount="indefinite" />
      </path>
      <text x={Number(x) - 4} y={12} className="g-t g-hi" textAnchor="end" opacity={0}>
        {l}<animate attributeName="opacity" values={["1;0;0;1", "0;1;0;0", "0;0;1;0"][i]} dur={D(4.5)} calcMode="discrete" repeatCount="indefinite" />
      </text>
    </g>)}
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
  const ticks = (gap: boolean) => Array.from({ length: 18 }, (_, i) => i).filter(i => !gap || i < 6 || i > 11);
  return <svg viewBox={VB}>
    <text x={14} y={24} className="g-t">baseline</text>
    {ticks(true).map(i => <rect key={i} x={74 + i * 8.6} y={14} width={3} height={14} rx={1} className="g-b" />)}
    <rect x={74 + 6 * 8.6} y={16} width={6 * 8.6 - 5} height={10} rx={2} className="g-r" opacity={.5} />
    <text x={14} y={64} className="g-t">chunked</text>
    {ticks(false).map(i => <rect key={i} x={74 + i * 8.6} y={54} width={3} height={14} rx={1} className="g-g" />)}
    <text x={14} y={104} className="g-t">a new prompt no longer stalls the stream</text>
  </svg>;
}

export function GlyphServingMap() {
  return <svg viewBox={VB}>
    {["A", "B", "C", "D"].map((l, i) => <g key={l}>
      <circle cx={22} cy={20 + i * 26} r={9} className="g-ring-s" /><text x={22} y={24 + i * 26} className="g-t" textAnchor="middle">{l}</text>
      <path d={`M34 ${20 + i * 26}H120`} className="g-line" />
      <circle r={3} className={["g-b", "g-a", "g-c", "g-g"][i]}><animateMotion path={`M34 ${20 + i * 26}H120L150 60H220`} dur={D(3 + i * .4)} begin={D(i * .5)} repeatCount="indefinite" /></circle>
    </g>)}
    <rect x={128} y={34} width={46} height={52} rx={6} className="g-box" />
    <text x={151} y={64} className="g-t" textAnchor="middle">GPU</text>
  </svg>;
}

export function GlyphDraft() {
  return <svg viewBox={VB}>
    {[0, 1, 2, 3, 4].map(i => <g key={i}>
      <rect x={18 + i * 42} y={30} width={34} height={18} rx={3} className={i === 3 ? "g-r" : "g-g"} opacity={.25}>
        <animate attributeName="opacity" values={`0;.25;.25;${i === 4 ? .08 : .9};${i === 4 ? .08 : .9}`} keyTimes="0;.2;.45;.6;1" dur={D(4)} repeatCount="indefinite" />
      </rect>
      <text x={35 + i * 42} y={68} className="g-t" textAnchor="middle" opacity={0}>{i === 3 ? "✗" : i === 4 ? "" : "✓"}
        <animate attributeName="opacity" values="0;0;1;1" keyTimes="0;.5;.6;1" dur={D(4)} repeatCount="indefinite" /></text>
    </g>)}
    <rect x={14} y={24} width={4} height={30} className="g-a"><animate attributeName="x" values="14;14;222;222" keyTimes="0;.45;.6;1" dur={D(4)} repeatCount="indefinite" /></rect>
    <text x={14} y={104} className="g-t">guess five · check once · keep four</text>
  </svg>;
}

export function GlyphCacheRoute() {
  return <svg viewBox={VB}>
    <circle cx={22} cy={60} r={8} className="g-a" />
    <path d="M30 60C80 60 90 28 150 28" className="g-line g-c-s" strokeWidth={2} />
    <path d="M30 60C80 60 90 92 150 92" className="g-line" strokeDasharray="3 5" />
    {[0, 1].map(k => <g key={k}><rect x={154} y={k ? 76 : 12} width={70} height={32} rx={5} className="g-box" />
      {[0, 1, 2, 3, 4, 5].map(j => <rect key={j} x={161 + j * 10} y={(k ? 76 : 12) + 11} width={7} height={10} rx={1.5} className={k ? "g-m" : j < 4 ? "g-c" : "g-m"} opacity={k ? .4 : .9} />)}</g>)}
    <circle r={3.5} className="g-a"><animateMotion path="M30 60C80 60 90 28 150 28" dur={D(1.8)} repeatCount="indefinite" /></circle>
    <text x={14} y={112} className="g-t">warm prefix · −20 ms</text>
  </svg>;
}

export function GlyphOverlap() {
  return <svg viewBox={VB}>
    <text x={14} y={30} className="g-t">CPU</text><text x={14} y={64} className="g-t">GPU</text>
    {[0, 1, 2, 3].map(i => <g key={i}>
      <rect x={52 + i * 42} y={20} width={22} height={14} rx={2} className="g-a" opacity={.8} />
      <rect x={66 + i * 42} y={54} width={36} height={14} rx={2} className="g-c" opacity={.85} />
    </g>)}
    <rect x={50} y={14} width={2} height={60} className="g-ink"><animate attributeName="x" values="50;222" dur={D(3.4)} repeatCount="indefinite" /></rect>
    <text x={14} y={104} className="g-t">host prepares step n+1 during step n</text>
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
  const users = [3, 12, 25];
  return <svg viewBox={VB}>
    {["MHA · BF16", "GQA · BF16", "GQA · FP8"].map((l, k) => <g key={l}>
      <text x={14} y={24 + k * 30} className="g-t">{l}</text>
      {Array.from({ length: 25 }, (_, i) => <rect key={i} x={96 + i * 5.2} y={14 + k * 30} width={3.6} height={14} rx={1} className={i < users[k] ? (k === 2 ? "g-a" : "g-c") : "g-m"} opacity={i < users[k] ? .9 : .18} />)}
    </g>)}
    <text x={14} y={112} className="g-t">users at 32k context · one 80 GB GPU</text>
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
  return <svg viewBox={VB}>
    {Array.from({ length: 96 }, (_, i) => {
      const solvedBase = (i * 7) % 10 < 3, gained = !solvedBase && (i * 13) % 10 < 6;
      return <rect key={i} x={14 + (i % 24) * 9} y={16 + Math.floor(i / 24) * 22} width={6.6} height={16} rx={1.4} className={solvedBase ? "g-b" : gained ? "g-r" : "g-m"} opacity={solvedBase ? .8 : .2}>
        {gained && <animate attributeName="opacity" values=".2;.2;.95;.95;.2" keyTimes={`0;${.2 + (i % 24) * .02};${.28 + (i % 24) * .02};.92;1`} dur={D(4.6)} repeatCount="indefinite" />}
      </rect>;
    })}
    <text x={14} y={112} className="g-t">28 → 82 of 96 tasks</text>
  </svg>;
}

/** Where the 96 tasks land: a cloud of tasks under an ability line that rises. */
export function GlyphTasks() {
  return <svg viewBox={VB}>
    {Array.from({ length: 48 }, (_, i) => {
      const x = 18 + ((i * 37) % 200), y = 18 + ((i * 53) % 84);
      return <circle key={i} cx={x} cy={y} r={2.6} className={y > 58 ? "g-b" : y > 36 ? "g-r" : "g-m"} opacity={y > 58 ? .85 : y > 36 ? .3 : .25}>
        {y <= 58 && y > 36 && <animate attributeName="opacity" values=".25;.25;.95;.95;.25" keyTimes="0;.3;.45;.9;1" dur={D(4.6)} repeatCount="indefinite" />}
      </circle>;
    })}
    <path d="M14 58H226" className="g-line g-a-s" strokeWidth={1.6}>
      <animate attributeName="d" values="M14 58H226;M14 58H226;M14 36H226;M14 36H226;M14 58H226" keyTimes="0;.3;.45;.9;1" dur={D(4.6)} repeatCount="indefinite" />
    </path>
  </svg>;
}

/** Elastic RL: GPU rows whose cells flip between rollout (rose) and training (cyan) without a shared barrier. */
export function GlyphFleet() {
  return <svg viewBox={VB}>
    {Array.from({ length: 8 }, (_, r) => {
      const split = 60 + ((r * 37) % 70);
      return <g key={r}>
        <rect x={16} y={14 + r * 11} width={split} height={7} rx={1.5} className="g-r" opacity={.75} />
        <rect x={20 + split} y={14 + r * 11} width={80} height={7} rx={1.5} className="g-c" opacity={.7}>
          <animate attributeName="x" values={`${20 + split};${10 + split};${20 + split}`} dur={D(3.2 + r * 0.2)} repeatCount="indefinite" />
        </rect>
        <rect x={104 + split} y={14 + r * 11} width={210 - 104 - split > 0 ? 210 - 104 - split : 6} height={7} rx={1.5} className="g-r" opacity={.5} />
      </g>;
    })}
  </svg>;
}

export function GlyphCurves() {
  const curves = [["M20 96L70 90L130 86L220 84", "g-m-s"], ["M20 84L70 72L130 64L220 58", "g-b-s"], ["M20 76L70 58L130 38L220 26", "g-r-s"], ["M20 76L60 56L100 38L150 24", "g-g-s"]] as const;
  return <svg viewBox={VB}>
    <path d="M20 10V104H226" className="g-axis" />
    {curves.map(([d, c], i) => <path key={i} d={d} className={`g-line ${c}`} strokeWidth={1.8} strokeDasharray="260" strokeDashoffset="260">
      <animate attributeName="stroke-dashoffset" values="260;0;0" keyTimes="0;.55;1" dur={D(4)} begin={D(i * .25)} repeatCount="indefinite" />
    </path>)}
    <text x={224} y={116} className="g-t" textAnchor="end">1× 2× 4× 8× thought</text>
  </svg>;
}

export function GlyphAudit() {
  return <svg viewBox={VB}>
    {["base", "SFT", "GRPO", "4×", "lean"].map((l, r) => <g key={l}>
      <text x={14} y={22 + r * 20} className="g-t">{l}</text>
      {Array.from({ length: 28 }, (_, i) => <rect key={i} x={52 + i * 6.2} y={14 + r * 20} width={4.2} height={10} rx={1} className={(i + r * 3) % 9 === 0 && r > 1 ? "g-r" : "g-b"} opacity={(i * (r + 2)) % 7 < 2 + r ? .85 : .15} />)}
    </g>)}
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
  return <svg viewBox={VB}>
    <path d="M20 10V104H226" className="g-axis" />
    <path d="M200 96L176 74L184 58L210 30L150 30" className="g-line g-r-s" strokeWidth={2} strokeDasharray="300" strokeDashoffset="300">
      <animate attributeName="stroke-dashoffset" values="300;0;0" keyTimes="0;.6;1" dur={D(4.6)} repeatCount="indefinite" />
    </path>
    <circle cx={150} cy={30} r={4} className="g-r" />
    <circle cx={150} cy={30} r={4} className="g-a"><animate attributeName="cx" values="150;150;78;78" keyTimes="0;.62;.85;1" dur={D(4.6)} repeatCount="indefinite" /></circle>
    <text x={24} y={22} className="g-t">pass@1 ↑</text><text x={224} y={116} className="g-t" textAnchor="end">← GPU-s / correct</text>
  </svg>;
}
