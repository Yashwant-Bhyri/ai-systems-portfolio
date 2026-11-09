import { useId } from "react";
import "./glyphs.css";

/* The title graphics. One language throughout: a 240 × 120 frame drawn edge to edge, 2-unit rounded
   marks, phase colours that mean the same thing on every card, and a miniature of what the module
   really shows, with one idea moving. SMIL keeps them off the React clock. Colours live in glyphs.css
   with no parent scope, so a graphic looks the same wherever it is placed. */
const VB = "0 0 240 120";
const Svg = ({ children }: { children: React.ReactNode }) => <svg className="lg" viewBox={VB} preserveAspectRatio="xMidYMid meet">{children}</svg>;
const seq = <T,>(n: number, f: (i: number) => T) => Array.from({ length: n }, (_, i) => f(i));
/** A stable pseudo-random value in 0..1, so a graphic is the same on every render. */
/* Integer arithmetic only: Math.sin can differ in its last digits between the server and the browser,
   which breaks hydration. */
const rnd = (i: number) => { let x = Math.imul(i + 1, 374761393); x = Math.imul(x ^ (x >>> 13), 1274126177); return ((x ^ (x >>> 16)) >>> 0) / 4294967296; };
/** Coordinates are rounded so the server and the browser write the same numbers. */
const q = (v: number) => Math.round(v * 100) / 100;
const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => `${(cx + r * Math.sin(a * Math.PI / 180)).toFixed(2)} ${(cy - r * Math.cos(a * Math.PI / 180)).toFixed(2)}`;
  return `M${p(a0)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${p(a1)}`;
};
const loop = (dur: number) => ({ dur: `${dur}s`, repeatCount: "indefinite" as const });

/* ── Same intelligence, cheaper cost ─────────────────────────────────────── */

/** The dial: a full turn for the baseline, 57% of a turn for the optimized run, every request a coloured block. */
export function GlyphDial() {
  const ring = (r: number, end: number, n: number) => seq(n, (i) => {
    const a = (i / n) * end, w = end / n, split = 0.5;
    return <g key={i}>
      <path d={arc(120, 60, r, a + 0.4, a + w * split)} className="s-r" strokeWidth={7} fill="none" />
      <path d={arc(120, 60, r, a + w * split, a + w - 0.4)} className="s-t" strokeWidth={7} fill="none" />
    </g>;
  });
  return <Svg>
    <circle cx={120} cy={60} r={54} className="s-dim" fill="none" strokeWidth={1} />
    {ring(46, 359, 24)}
    <circle cx={120} cy={60} r={33} className="s-dim" fill="none" strokeWidth={1} />
    {ring(33, 207, 24)}
    <path d={arc(120, 60, 33, 207, 359)} className="s-a" strokeWidth={1.5} strokeDasharray="2 4" fill="none" />
    <rect x={119} y={8} width={2} height={46} rx={1} className="f-ink"><animateTransform attributeName="transform" type="rotate" from="0 120 60" to="360 120 60" {...loop(9)} /></rect>
    <circle cx={120} cy={60} r={3.5} className="f-ink" />
  </Svg>;
}
/** Three levers move; the row of answers above them does not. */
export function GlyphBigPicture() {
  const levers = [["f-w", 34, 150], ["f-p", 66, 178], ["f-t", 98, 118]] as const;
  return <Svg>
    {seq(16, (i) => <circle key={i} cx={21 + i * 13.2} cy={12} r={3.2} className="f-t" />)}
    {levers.map(([c, y, to], i) => {
      const k = `0;${0.1 + i * 0.22};${0.28 + i * 0.22};.9;1`;
      return <g key={c}>
        <rect x={16} y={y - 1.5} width={208} height={3} rx={1.5} className="f-dim" />
        <rect x={16} y={y - 1.5} height={3} rx={1.5} className={c} width={208}><animate attributeName="width" values={`208;208;${to - 16};${to - 16};208`} keyTimes={k} calcMode="spline" keySplines="0 0 1 1;.45 0 .2 1;0 0 1 1;.45 0 .55 1" {...loop(9)} /></rect>
        <circle cy={y} r={7.5} className={c} cx={224}><animate attributeName="cx" values={`224;224;${to};${to};224`} keyTimes={k} calcMode="spline" keySplines="0 0 1 1;.45 0 .2 1;0 0 1 1;.45 0 .55 1" {...loop(9)} /></circle>
      </g>;
    })}
  </Svg>;
}
/** One request's whole life, before and after: waiting, reading, reasoning, writing. */
export function GlyphReplay() {
  const lane = (y: number, w: number, read: number, reason: number, write: number) => <g>
    <rect x={14} y={y} width={w} height={16} rx={3} className="f-w" />
    <rect x={14 + w + 2} y={y} width={read} height={16} rx={1.5} className="f-p" />
    <rect x={14 + w + read + 4} y={y} width={reason} height={16} rx={3} className="f-r" />
    <rect x={14 + w + read + reason + 6} y={y} width={write} height={16} rx={3} className="f-t" />
  </g>;
  return <Svg>
    {lane(26, 84, 8, 54, 60)}
    {lane(74, 44, 2, 35, 39)}
    <rect y={14} width={2} height={88} rx={1} className="f-ink" x={14}><animate attributeName="x" values="14;226;226;14" keyTimes="0;.82;.96;1" {...loop(8)} /></rect>
  </Svg>;
}
/** Training lifts the point; serving brings it back. One move up, one move across. */
export function GlyphComposition() {
  return <Svg>
    {seq(9, (x) => seq(4, (y) => <circle key={`${x}-${y}`} cx={24 + x * 24} cy={22 + y * 26} r={1.4} className="f-mid" />))}
    <path d="M176 100V36" className="s-a" strokeWidth={2.5} strokeLinecap="round" fill="none" />
    <path d="M176 36H84" className="s-t" strokeWidth={2.5} strokeLinecap="round" fill="none" />
    <path d="M93 29l-10 7 10 7" className="s-t" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx={176} cy={100} r={5} className="f-mid" />
    <circle r={6} className="f-ink"><animateMotion path="M176 100V36H84" keyPoints="0;.41;.41;1;1;0" keyTimes="0;.28;.42;.72;.94;1" calcMode="linear" {...loop(9)} /></circle>
  </Svg>;
}
/** Every request, slowest last: the slowest 5% is where the gap is widest. */
export function GlyphLatency() {
  const curve = (peak: number, k: number) => seq(49, (i) => {
    const x = 12 + i * 4.5, u = i / 48, y = 104 - peak * (u * 0.52 + 0.48 * Math.pow(u, k));
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join("");
  return <Svg>
    <rect x={204} y={6} width={24} height={98} rx={3} className="f-a" opacity={0.14} />
    <path d="M12 104H228" className="s-mid" strokeWidth={1} />
    <path d={`${curve(50, 3)}L228 104H12Z`} className="f-t" opacity={0.14} />
    <path d={curve(92, 3)} className="s-b" strokeWidth={2.5} fill="none" strokeLinecap="round" />
    <path d={curve(50, 3)} className="s-t" strokeWidth={2.5} fill="none" strokeLinecap="round" />
    <path d="M216 18V50" className="s-a" strokeWidth={2.5} strokeLinecap="round"><animate attributeName="opacity" values=".25;1;1;.25" keyTimes="0;.35;.8;1" {...loop(6)} /></path>
  </Svg>;
}
/** Chapters of one film, the same bar shorter in each: one change at a time. */
export function GlyphExperiment() {
  const cuts = [78, 78, 74, 48];
  return <Svg>
    {cuts.map((h, i) => {
      const x = 12 + i * 55, on = `0;${(i * 0.24 + 0.02).toFixed(2)};${(i * 0.24 + 0.05).toFixed(2)};${(i * 0.24 + 0.22).toFixed(2)};${(i * 0.24 + 0.25).toFixed(2)};1`;
      return <g key={i}>
        <rect x={x} y={8} width={51} height={104} rx={4} className="f-faint s-dim" strokeWidth={1} />
        <rect x={x} y={8} width={51} height={104} rx={4} className="s-a" fill="none" strokeWidth={2} opacity={0}><animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes={on} {...loop(10)} /></rect>
        <rect x={x + 16} y={102 - h} width={19} height={h} rx={3} className={["f-mid", "f-w", "f-p", "f-t"][i]} />
      </g>;
    })}
  </Svg>;
}

/* ── Serving under load ──────────────────────────────────────────────────── */

/** Above: one long prompt stops the stream dead. Below: read in chunks, the answer never stops. */
export function GlyphChunked() {
  const ticks = (y: number, from: number, to: number, cls: string) => seq(Math.floor((to - from) / 7), (i) => <rect key={i} x={from + i * 7} y={y} width={4} height={22} rx={1.5} className={cls} />);
  return <Svg>
    {ticks(22, 12, 68, "f-t")}
    <rect x={70} y={22} width={100} height={22} rx={3} className="f-p" />
    <rect x={70} y={50} width={100} height={3} rx={1.5} className="f-x"><animate attributeName="opacity" values=".2;1;.2" {...loop(3)} /></rect>
    {ticks(22, 172, 228, "f-t")}
    {seq(6, (i) => <g key={i}>
      <rect x={12 + i * 36} y={74} width={14} height={22} rx={3} className="f-p" />
      {ticks(74, 28 + i * 36, 48 + i * 36, "f-t")}
    </g>)}
  </Svg>;
}
/** Twelve words. Below, twelve calls of the large model; above, three: a small model drafted ahead. */
export function GlyphDraft() {
  const x = (i: number) => 13 + i * 18;
  const groups = [[0, 4], [5, 8], [9, 11]] as const;
  return <Svg>
    {groups.map(([a, b], i) => {
      const x0 = x(a) + 7, x1 = x(b) + 7, on = `0;${0.08 + i * 0.26};${0.2 + i * 0.26};.92;1`;
      return <path key={a} d={`M${x0} 50C${x0} 8 ${x1} 8 ${x1} 50`} className="s-t" strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0}><animate attributeName="opacity" values={`0;0;1;1;0`} keyTimes={on} {...loop(9)} /></path>;
    })}
    {seq(12, (i) => {
      const g = groups.findIndex(([a, b]) => i >= a && i <= b), at = 0.08 + g * 0.26;
      return <g key={i}>
        <rect x={x(i)} y={52} width={14} height={16} rx={3} className="f-p" />
        <rect x={x(i)} y={52} width={14} height={16} rx={3} className="f-t" opacity={0}><animate attributeName="opacity" values="0;0;1;1;0" keyTimes={`0;${at + 0.04};${at + 0.12};.92;1`} {...loop(9)} /></rect>
        <path d={`M${x(i) + 3} 72C${x(i) + 3} 88 ${x(i) + 11} 88 ${x(i) + 11} 72`} className="s-mid" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      </g>;
    })}
    <path d="M13 104H225" className="s-dim" strokeWidth={1} />
  </Svg>;
}
/** The router sends each request to the replica that already holds its prefix. */
export function GlyphCacheRoute() {
  const ys = [24, 60, 96];
  const route = "M28 60C80 60 90 60 150 60";
  return <Svg>
    {ys.map((y, i) => <path key={y} d={`M28 60C76 60 92 ${y} 150 ${y}`} className={i === 1 ? "s-a" : "s-dim"} strokeWidth={i === 1 ? 2.5 : 1.5} fill="none" />)}
    {ys.map((y, i) => <g key={y}>
      <rect x={152} y={y - 15} width={76} height={30} rx={5} className={i === 1 ? "f-faint s-a" : "f-faint s-dim"} strokeWidth={i === 1 ? 2 : 1} />
      {seq(5, (k) => <rect key={k} x={159 + k * 13} y={y - 7} width={10} height={14} rx={2} className={i === 1 && k < 3 ? "f-a" : k < 2 + (i === 0 ? 1 : 0) ? "f-dimmer" : "f-dim"} />)}
    </g>)}
    <circle cx={28} cy={60} r={9} className="f-ink" />
    <circle r={5} className="f-a"><animateMotion path={route} {...loop(3.2)} /></circle>
  </Svg>;
}
/** Above, the GPU waits while the CPU prepares. Below, the CPU prepares during the step: the work ends sooner. */
export function GlyphOverlap() {
  const pair = (y: number, gpu: readonly number[], cpu: readonly number[], w: number, cw: number) => <g>
    {gpu.map((x) => <rect key={x} x={x} y={y} width={w} height={14} rx={3} className="f-t" />)}
    {cpu.map((x) => <rect key={x} x={x} y={y + 18} width={cw} height={14} rx={3} className="f-p" />)}
  </g>;
  return <Svg>
    {pair(12, [12, 72, 132, 192], [51, 111, 171], 38, 18)}
    {pair(70, [12, 52, 92, 132], [34, 74, 114], 38, 18)}
    <path d="M171 62V112" className="s-a" strokeWidth={2} strokeDasharray="2 4" />
    <path d="M12 62H228" className="s-dim" strokeWidth={1} />
  </Svg>;
}
/** Four requests through the whole serving path, on one clock. */
export function GlyphServingMap() {
  const inY = [18, 46, 74, 102];
  const nodes = [[92, 60, 11, "f-a"], [158, 32, 9, "f-t"], [158, 88, 9, "f-t"]] as const;
  return <Svg>
    {inY.map((y) => <path key={y} d={`M16 ${y}C50 ${y} 58 60 92 60`} className="s-mid" strokeWidth={1.5} fill="none" />)}
    <path d="M92 60C120 60 128 32 158 32M92 60C120 60 128 88 158 88" className="s-mid" strokeWidth={1.5} fill="none" />
    <path d="M158 32C190 32 196 60 226 60M158 88C190 88 196 60 226 60" className="s-mid" strokeWidth={1.5} fill="none" />
    {inY.map((y, i) => <g key={y}>
      <circle cx={16} cy={y} r={4.5} className="f-ink" />
      <circle r={3.5} className="f-r"><animateMotion path={`M16 ${y}C50 ${y} 58 60 92 60C120 60 128 ${i % 2 ? 88 : 32} 158 ${i % 2 ? 88 : 32}C190 ${i % 2 ? 88 : 32} 196 60 226 60`} begin={`${i * 1.1}s`} {...loop(4.4)} /></circle>
    </g>)}
    {nodes.map(([x, y, r, c]) => <circle key={`${x}${y}`} cx={x} cy={y} r={r} className={c} />)}
    <rect x={220} y={48} width={12} height={24} rx={3} className="f-ink" />
  </Svg>;
}
/** Nine terms, nine tiles; one is read at a time. */
export function GlyphKVSizing() {
  return <Svg>
    {seq(9, (i) => {
      const x = 42 + (i % 3) * 54, y = 4 + Math.floor(i / 3) * 39;
      return <g key={i}>
        <rect x={x} y={y} width={48} height={34} rx={5} className="f-faint s-dim" strokeWidth={1} />
        <rect x={x + 8} y={y + 9} width={32} height={3} rx={1.5} className="f-mid" />
        <rect x={x + 8} y={y + 17} width={20} height={3} rx={1.5} className="f-dim" />
        <rect x={x} y={y} width={48} height={34} rx={5} className="f-a" opacity={0}><animate attributeName="opacity" values="0;0;.92;.92;0;0" keyTimes={`0;${(i / 9).toFixed(3)};${(i / 9 + 0.02).toFixed(3)};${(i / 9 + 0.09).toFixed(3)};${(i / 9 + 0.11).toFixed(3)};1`} {...loop(11)} /></rect>
      </g>;
    })}
  </Svg>;
}

/* ── Post-training ───────────────────────────────────────────────────────── */

/** The same tasks in three models: three clouds, each task joined to itself. */
export function GlyphManifold() {
  const clouds = [[58, 78, 34, 20, "f-mid"], [122, 52, 30, 22, "f-b"], [186, 34, 34, 18, "f-a"]] as const;
  const pts = (c: number) => seq(14, (i) => {
    const [cx, cy, rx, ry] = clouds[c], a = rnd(i * 7 + c) * 6.283, k = Math.sqrt(rnd(i * 13 + c * 5));
    return [q(cx + Math.cos(a) * rx * k), q(cy + Math.sin(a) * ry * k)] as const;
  });
  const P = [pts(0), pts(1), pts(2)];
  return <Svg>
    <g><animateTransform attributeName="transform" type="translate" values="0 2;0 -2;0 2" {...loop(8)} />
      {seq(14, (i) => <path key={i} d={`M${P[0][i][0]} ${P[0][i][1]}L${P[1][i][0]} ${P[1][i][1]}L${P[2][i][0]} ${P[2][i][1]}`} className="s-dim" strokeWidth={0.8} fill="none" />)}
      {clouds.map(([cx, cy, rx, ry, c], k) => <g key={cx}>
        <ellipse cx={cx} cy={cy} rx={rx + 6} ry={ry + 6} className={k === 2 ? "s-a" : "s-mid"} strokeWidth={1} fill="none" />
        {P[k].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.6} className={c} />)}
      </g>)}
    </g>
  </Svg>;
}
/** Layers, some of them moved; below, the few words that came out differently. */
export function GlyphInside() {
  return <Svg>
    {seq(30, (x) => seq(6, (y) => {
      const heat = Math.exp(-((x - 19) ** 2) / 26 - ((y - 2.4) ** 2) / 5) + rnd(x * 31 + y) * 0.1;
      return <rect key={`${x}-${y}`} x={12 + x * 7.2} y={6 + y * 12} width={5.6} height={10} rx={1.6} className={heat > 0.5 ? "f-a" : heat > 0.26 ? "f-mid" : "f-dim"} />;
    }))}
    {seq(15, (i) => <rect key={i} x={12 + i * 14.4} y={90} width={11.6} height={16} rx={3} className={[3, 7, 8, 12].includes(i) ? "f-a" : "f-dim"}>{[3, 7, 8, 12].includes(i) && <animate attributeName="opacity" values="1;.35;1" begin={`${i * 0.2}s`} {...loop(4)} />}</rect>)}
  </Svg>;
}
/** Eight attempts reach the tests. The ones that pass carry on, brighter. */
export function GlyphLearn() {
  const ys = seq(8, (i) => 8 + i * 14.8), pass = [1, 3, 4, 6];
  return <Svg>
    {ys.map((y, i) => <path key={i} d={`M14 60C64 60 92 ${y} 150 ${y}`} className={pass.includes(i) ? "s-mid" : "s-dim"} strokeWidth={1.5} fill="none" />)}
    <rect x={148} y={2} width={4} height={116} rx={2} className="f-ink" />
    {ys.map((y, i) => pass.includes(i)
      ? <path key={i} d={`M152 ${y}C186 ${y} 196 60 228 60`} className="s-t" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeDasharray="110" strokeDashoffset={110}><animate attributeName="stroke-dashoffset" values="110;110;0;0;110" keyTimes={`0;${0.2 + pass.indexOf(i) * 0.08};${0.5 + pass.indexOf(i) * 0.08};.92;1`} {...loop(8)} /></path>
      : <circle key={i} cx={158} cy={y} r={3} className="f-x" />)}
    <circle cx={14} cy={60} r={6} className="f-ink" />
  </Svg>;
}
/** Six stages of training, one ridge each: every stage lifts more of the 96 tasks. */
export function GlyphTerrain() {
  const ridge = (k: number) => seq(53, (i) => {
    const x = 8 + i * 4.3, n = Math.sin(i * 0.36 + k * 0.9) * 0.5 + Math.sin(i * 0.13 + k * 2) * 0.5, lift = 6 + k * 7.2;
    return [x, lift * (0.65 + 0.35 * n) * Math.sin((i / 52) * Math.PI) ** 0.6] as const;
  });
  return <Svg>
    {seq(6, (k) => {
      const base = 30 + k * 16.4, pts = ridge(k).map(([x, h]) => `${x.toFixed(1)} ${(base - h).toFixed(1)}`).join("L");
      return <path key={k} d={`M${pts}L232 ${base}H8Z`} className="f-bg" stroke={k === 5 ? "var(--active-accent)" : `rgba(230,237,244,${0.2 + k * 0.08})`} strokeWidth={k === 5 ? 2.2 : 1.3} strokeLinejoin="round" />;
    })}
  </Svg>;
}
/** Accuracy against cost: the frontier, and one point walking along it. */
export function GlyphFrontier() {
  const line = "M16 104C60 104 62 72 88 58S132 22 224 18";
  return <Svg>
    {seq(36, (i) => <circle key={i} cx={q(22 + rnd(i) * 206)} cy={q(26 + rnd(i + 91) * 80 + (1 - rnd(i)) * 10)} r={1.8} className={rnd(i + 91) * 80 + (1 - rnd(i)) * 10 > (1 - rnd(i)) * 58 ? "f-dim" : "f-faint"} />)}
    <path d={`${line}V112H16Z`} className="f-a" opacity={0.1} />
    <path d={line} className="s-a" strokeWidth={2.5} fill="none" strokeLinecap="round" />
    <circle r={7} className="f-ink"><animateMotion path={line} keyPoints="0;1;1;0" keyTimes="0;.7;.94;1" calcMode="linear" {...loop(8)} /></circle>
  </Svg>;
}
/** Four checkpoints, given more and more thinking: the trained ones climb much further. */
export function GlyphCurves() {
  const series = [[98, 10], [90, 34], [84, 66], [80, 72]] as const, marks = [0, 1 / 3, 2 / 3, 1];
  const y = (start: number, gain: number, u: number) => start - gain * (1 - Math.exp(-3 * u)) / (1 - Math.exp(-3));
  const X = (u: number) => 14 + u * 212;
  const cls = ["s-mid", "s-b", "s-a", "s-t"], fill = ["f-mid", "f-b", "f-a", "f-t"];
  return <Svg>
    {marks.map((u) => <path key={u} d={`M${X(u)} 6V110`} className="s-dim" strokeWidth={1} strokeDasharray="2 4" />)}
    {series.map(([a, g], k) => <g key={k}>
      <path d={seq(41, (i) => `${i ? "L" : "M"}${X(i / 40).toFixed(1)} ${y(a, g, i / 40).toFixed(1)}`).join("")} className={cls[k]} strokeWidth={2.2} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1}><animate attributeName="stroke-dashoffset" values="1;0;0;1" keyTimes="0;.5;.94;1" {...loop(8)} /></path>
      {marks.map((u) => <circle key={u} cx={q(X(u))} cy={q(y(a, g, u))} r={3.4} className={fill[k]} />)}
    </g>)}
  </Svg>;
}
/** Elastic RL. Above, synchronous: rollouts of different lengths, then every GPU waits at the barrier
    before training. Below, elastic: a GPU that finishes its rollout trains at once; no gaps. */
export function GlyphFleet() {
  const sync = [120, 74, 98, 56], elastic = [[0, 50, 70, 114, 132], [0, 34, 54, 102, 120], [0, 62, 82, 128, 146], [0, 42, 62, 96, 116]];
  return <Svg>
    {sync.map((w, i) => <g key={i}>
      <rect x={12} y={8 + i * 12} width={w} height={8} rx={2} className="f-a" />
      {w < 120 && <rect x={14 + w} y={8 + i * 12} width={120 - w - 2} height={8} rx={2} className="f-dim" />}
      <rect x={138} y={8 + i * 12} width={34} height={8} rx={2} className="f-p" />
    </g>)}
    <rect x={133} y={4} width={2} height={50} rx={1} className="f-x"><animate attributeName="opacity" values="1;.3;1" {...loop(2.4)} /></rect>
    <path d="M12 62H228" className="s-dim" strokeWidth={1} />
    {elastic.map((xs, i) => <g key={i}>
      {xs.slice(0, -1).map((x, k) => <rect key={k} x={12 + x} y={70 + i * 12} width={xs[k + 1] - x - 2} height={8} rx={2} className={k % 2 ? "f-p" : "f-a"} />)}
    </g>)}
    <rect y={66} width={2} height={52} rx={1} className="f-ink" x={12}><animate attributeName="x" values="12;170;170;12" keyTimes="0;.8;.95;1" {...loop(5)} /></rect>
  </Svg>;
}
/** Lean RL: the same right answers, each trace cut back to the length target. */
export function GlyphLean() {
  const lens = [180, 132, 196, 110, 160];
  return <Svg>
    <path d="M112 4V116" className="s-a" strokeWidth={1.5} strokeDasharray="3 4" />
    {lens.map((w, i) => <g key={i}>
      <rect x={12} y={10 + i * 21} width={w} height={11} rx={3} className="f-r" opacity={0.85}>
        <animate attributeName="width" values={`${w};${w};${Math.min(w, 100 + (w - 100) * 0.15)};${Math.min(w, 100 + (w - 100) * 0.15)};${w}`} keyTimes="0;.25;.55;.9;1" calcMode="spline" keySplines="0 0 1 1;.45 0 .2 1;0 0 1 1;.45 0 .55 1" {...loop(7)} />
      </rect>
      <circle cx={226} cy={15.5 + i * 21} r={4.5} className={i === 2 ? "f-x" : "f-t"} />
    </g>)}
  </Svg>;
}
/** One square per task: green gained, coral lost, grey unchanged. */
export function GlyphCapability() {
  return <Svg>
    {seq(96, (i) => {
      const r = rnd(i + 3), x = 12 + (i % 16) * 13.8, y = 6 + Math.floor(i / 16) * 18.2;
      const cls = r < 0.42 ? "f-t" : r < 0.46 ? "f-x" : r < 0.72 ? "f-mid" : "f-dim";
      return <rect key={i} x={x} y={y} width={11.4} height={15.6} rx={2.5} className={cls} />;
    })}
  </Svg>;
}
/** Tasks from easiest to hardest; the model's ability rises past more of them. */
export function GlyphTasks() {
  const id = useId();
  const bars = seq(38, (i) => 8 + i * 2.5 + rnd(i) * 4);
  return <Svg>
    <clipPath id={id}><rect x={0} width={240} y={70} height={50}><animate attributeName="y" values="100;38;38;100" keyTimes="0;.6;.92;1" calcMode="spline" keySplines=".45 0 .2 1;0 0 1 1;.45 0 .55 1" {...loop(8)} /><animate attributeName="height" values="20;82;82;20" keyTimes="0;.6;.92;1" calcMode="spline" keySplines=".45 0 .2 1;0 0 1 1;.45 0 .55 1" {...loop(8)} /></rect></clipPath>
    {bars.map((h, i) => <rect key={i} x={12 + i * 5.7} y={112 - h} width={4.2} height={h} rx={1.5} className="f-dim" />)}
    <g clipPath={`url(#${id})`}>{bars.map((h, i) => <rect key={i} x={12 + i * 5.7} y={112 - h} width={4.2} height={h} rx={1.5} className="f-t" />)}</g>
    <rect x={10} width={220} height={2} rx={1} className="f-ink" y={70}><animate attributeName="y" values="100;38;38;100" keyTimes="0;.6;.92;1" calcMode="spline" keySplines=".45 0 .2 1;0 0 1 1;.45 0 .55 1" {...loop(8)} /></rect>
  </Svg>;
}
/** A ledger of tasks. The ones that got worse are not averaged away. */
export function GlyphAudit() {
  const rows = [68, 120, 94, 142, 80, 110];
  return <Svg>
    {rows.map((w, i) => {
      const y = 10 + i * 18, bad = i === 2 || i === 4;
      return <g key={i}>
        <circle cx={18} cy={y + 4} r={4} className={bad ? "f-x" : "f-t"} />
        <rect x={32} y={y + 1} width={w} height={6} rx={3} className={bad ? "f-ink" : "f-dim"} />
        {bad && <rect x={186} y={y} width={40} height={8} rx={4} className="f-x"><animate attributeName="opacity" values="1;.35;1" {...loop(3.4)} /></rect>}
        {!bad && <rect x={206} y={y + 1} width={20} height={6} rx={3} className="f-dim" />}
      </g>;
    })}
  </Svg>;
}
