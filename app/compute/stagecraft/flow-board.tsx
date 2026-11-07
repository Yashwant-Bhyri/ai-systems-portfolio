"use client";

import type { CSSProperties } from "react";
import { inferenceStoryRuns } from "../lab-story-data";
import type { LabRun } from "../lab-simulation";
import { ease, prog } from "../../exhibit/engine";
import { highlight } from "./stage-meter";
import type { ArcBeat, SceneProps } from "./module-arc";
import "./flow-board.css";

/**
 * The path of one request, from arrival to answer, and which stop each
 * technique works on. The whole path sets the map; a chapter then narrows onto
 * its stop, with everything else out of focus, and says what happens there, what
 * we changed, and what it bought. Every number is the lab's own.
 */
const R = inferenceStoryRuns("shared-prefix");
const mean = (r: LabRun, k: "queueSeconds" | "prefill" | "decode") => r.tasks.reduce((a, t) => a + t[k], 0) / r.tasks.length;
const f = (v: number, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const W = 196, GAP = 46, LEFT = 22, Y = 196, H = 118;
const nodeX = (i: number) => LEFT + i * (W + GAP);
export const STOPS = [
  { name: "Request arrives", value: "96 requests", tone: "#8ea0b2" },
  { name: "Waits for a worker", value: `${f(mean(R[0], "queueSeconds"))} s`, tone: "#ff8f86" },
  { name: "Reads the prompt", value: `${f(mean(R[0], "prefill"), 3)} s`, tone: "#ffc267" },
  { name: "Writes the answer", value: `${f(mean(R[0], "decode"), 1)} s`, tone: "#b8e986" },
  { name: "Answer delivered", value: `${R[0].correct} of 96`, tone: "#8ea0b2" },
] as const;
export const LEVERS = [
  { name: "Free-worker scheduling", where: "the wait for a worker", stops: [1], tone: "#ff8f86" },
  { name: "Prefix reuse", where: "reading the prompt", stops: [2], tone: "#ffc267" },
  { name: "Faster prefill & decode", where: "reading the prompt and writing the answer", stops: [2, 3], tone: "#b8e986" },
] as const;

/** `lit`: which stops are in focus (all of them when null). `levers`: how many techniques are attached. */
export function FlowBoard({ t = 0, lit = null, levers = 0, zoom = false }: { t?: number; lit?: readonly number[] | null; levers?: number; zoom?: boolean }) {
  const cx = lit ? (nodeX(lit[0]) + nodeX(lit[lit.length - 1]) + W) / 2 : 620;
  const s = zoom && lit ? (lit.length > 1 ? 1.16 : 1.34) : 1;
  const style: CSSProperties = { transform: `translate(${620 - cx * s}px, ${(Y + H / 2) * (1 - s) + (zoom && lit ? -8 : 0)}px) scale(${s})` };
  const packet = ((t % 5200) / 5200) * (nodeX(4) + W / 2 - (nodeX(0) + W / 2)) + nodeX(0) + W / 2;
  return (
    <svg className="fb-svg" viewBox={levers ? "0 -40 1240 396" : "0 170 1240 170"} role="img" aria-label="One request's path: it arrives, waits for a worker, reads the prompt, writes the answer, and is delivered">
      <g className="fb-world" style={style}>
        {STOPS.slice(0, -1).map((_, i) => {
          const on = !lit || lit.includes(i) || lit.includes(i + 1);
          return <path key={i} className="fb-link" data-dim={!on || undefined} d={`M${nodeX(i) + W + 4} ${Y + H / 2}H${nodeX(i + 1) - 10}l-9 -6m9 6l-9 6`} />;
        })}
        {!zoom && !levers && <circle cx={packet} cy={Y + H / 2} r={6} className="fb-packet" />}
        {STOPS.map((stop, i) => {
          const on = !lit || lit.includes(i);
          return (
            <g key={stop.name} className="fb-node" data-dim={!on || undefined} data-on={lit?.includes(i) || undefined} style={{ ["--fb-tone" as string]: stop.tone }}>
              <rect x={nodeX(i)} y={Y} width={W} height={H} rx={12} />
              <text x={nodeX(i) + W / 2} y={Y + 46} textAnchor="middle" className="fb-name">{stop.name}</text>
              <text x={nodeX(i) + W / 2} y={Y + 86} textAnchor="middle" className="fb-value">{stop.value}</text>
            </g>
          );
        })}
        {LEVERS.slice(0, levers).map((lever) => {
          // the third lever spans two stops, one row above the others, so no label sits on another
          const a = nodeX(lever.stops[0]) + W / 2 + (lever.stops.length > 1 ? 76 : 0), b = nodeX(lever.stops[lever.stops.length - 1]) + W / 2;
          const x = (a + b) / 2, y = lever.stops.length > 1 ? 16 : 72;
          const bar = y + 28;
          const on = !lit || lever.stops.some((st) => lit.includes(st));
          return (
            <g key={lever.name} className="fb-lever" data-dim={!on || undefined} style={{ ["--fb-tone" as string]: lever.tone }}>
              <path d={a === b ? `M${a} ${y + 12}V${Y - 4}` : `M${a} ${Y - 4}V${bar}H${b}V${Y - 4}M${x} ${bar}V${y + 12}`} />
              <text x={x} y={y} textAnchor="middle">{lever.name}</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/** One chapter's stop: what happens here, what we changed, what it bought. */
type Zoom = { lit: readonly number[] | null; title: string; happens: string; changed: string; impact: string; note: string };
const ZOOMS: Record<number, Zoom> = {
  0: { lit: null, title: "Start with today: where one request spends its time", happens: "Two workers serve requests in fixed pairs. Each request reads its whole prompt, then writes its answer.", changed: "Nothing yet. This is what the three levers are measured against.", impact: `*${f(R[0].correctCost!, 2)} GPU-s* per correct answer`, note: `slowest 5% wait ${f(R[0].p95)} s` },
  1: { lit: [1], title: "Lever 1 works here: the wait for a worker", happens: "A request waits until both workers of a pair are free.", changed: "Any free worker takes the next request at once.", impact: `Slowest 5%: *${f(R[0].p95)} → ${f(R[1].p95)} s*`, note: "no GPU work saved, only idle gaps" },
  2: { lit: [2], title: "Lever 2 works here: reading the prompt", happens: "Every request reads the whole shared document again.", changed: "Read it once, keep its KV pages, and reference them.", impact: `Prompt reading: *${f(mean(R[1], "prefill") * 1000)} → ${f(mean(R[2], "prefill") * 1000)} ms*`, note: "per request, on average" },
  3: { lit: [2, 3], title: "Lever 3 works here: reading and writing tokens", happens: "Each output token reads all the weights from memory.", changed: "FP8 weights and KV: half the bytes for every token.", impact: `*${f(R[2].correctCost!, 2)} → ${f(R[3].correctCost!, 2)} GPU-s* per correct answer`, note: "same tokens, same answers" },
  4: { lit: null, title: "All three levers together", happens: "The same 96 requests, on the same model.", changed: "Scheduling, prefix reuse and faster execution, combined.", impact: `*${f(R[0].correctCost!, 2)} → ${f(R[3].correctCost!, 2)} GPU-s* per correct answer`, note: `slowest 5%: ${f(R[0].p95)} → ${f(R[3].p95)} s · ${R[3].correct} of 96 still correct` },
};
const ZOOM_MS = 7600;

function zoomScene(n: number) {
  const z = ZOOMS[n];
  function Scene({ t }: SceneProps) {
    const narrowed = t >= 900;
    const rows = [["What happens here", z.happens, 1500], ["What we changed", z.changed, 2700]] as const;
    return (
      <div className="fb-zoom">
        <FlowBoard t={t} lit={narrowed ? z.lit : null} levers={n === 4 ? 3 : n === 0 ? 0 : n} zoom={narrowed} />
        <div className="fb-notes">
          {rows.map(([label, text, at]) => {
            const k = ease.out(prog(t, at, at + 500));
            return <p key={label} style={{ opacity: k, transform: `translateY(${(1 - k) * 10}px)` }}><small>{label}</small>{text}</p>;
          })}
          <p className="fb-impact" style={{ opacity: ease.out(prog(t, 3900, 4400)) }}><small>The impact</small><strong>{t >= 3900 ? highlight(z.impact) : null}</strong><em>{z.note}</em></p>
        </div>
      </div>
    );
  }
  return Scene;
}
export const FLOW_ZOOMS: Record<number, ArcBeat> = Object.fromEntries(
  Object.entries(ZOOMS).map(([n, z]) => [n, { label: "where this works", title: z.title, ms: ZOOM_MS, Scene: zoomScene(Number(n)) }]),
);
