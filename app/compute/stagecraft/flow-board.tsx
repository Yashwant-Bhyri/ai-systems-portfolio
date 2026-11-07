"use client";

import { inferenceStoryRuns } from "../lab-story-data";
import type { LabRun } from "../lab-simulation";
import { ease, prog } from "../../exhibit/engine";
import { highlight } from "./stage-meter";
import type { ArcBeat, SceneProps } from "./module-arc";
import "./flow-board.css";

/**
 * The serving system as one picture: requests queue, a scheduler hands them to two
 * GPU workers, each worker reads the prompt and writes the answer, the KV cache and
 * the weights feed them from memory. Everything is always visible; a lever only
 * changes which parts are lit. Every number is the lab's own.
 */
const R = inferenceStoryRuns("shared-prefix");
const mean = (r: LabRun, k: "queueSeconds" | "prefill" | "decode") => r.tasks.reduce((a, t) => a + t[k], 0) / r.tasks.length;
const f = (v: number, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const WAIT = `${f(mean(R[0], "queueSeconds"))} s`, READ = `${f(mean(R[0], "prefill"), 3)} s`, WRITE = `${f(mean(R[0], "decode"), 1)} s`;
const TONE = { wait: "#ff8f86", read: "#ffc267", write: "#b8e986", quiet: "#8ea0b2" };
export type FlowPart = "requests" | "queue" | "scheduler" | "prefill" | "decode" | "kv" | "weights" | "answers";
type Box = { id: FlowPart; x: number; y: number; w: number; h: number; name: string; value?: string; tone: string; store?: boolean };
const SIDE: Box[] = [
  { id: "requests", x: 16, y: 168, w: 144, h: 104, name: "Requests", value: "96", tone: TONE.quiet },
  { id: "queue", x: 196, y: 168, w: 152, h: 104, name: "Wait in the queue", value: WAIT, tone: TONE.wait },
  { id: "scheduler", x: 384, y: 168, w: 152, h: 104, name: "Scheduler", value: "pairs", tone: TONE.wait },
  { id: "answers", x: 1044, y: 168, w: 180, h: 104, name: "Answers", value: `${R[0].correct} of 96`, tone: TONE.quiet },
];
const STORES: Box[] = [
  { id: "kv", x: 600, y: 188, w: 172, h: 64, name: "KV cache in memory", tone: TONE.read, store: true },
  { id: "weights", x: 796, y: 188, w: 172, h: 64, name: "Weights in memory", tone: TONE.write, store: true },
];
const LANES = [{ y: 20, name: "GPU worker 1" }, { y: 300, name: "GPU worker 2" }] as const;
const TASKS = (y: number): Box[] => [
  { id: "prefill", x: 600, y: y + 28, w: 172, h: 84, name: "Read the prompt", value: READ, tone: TONE.read },
  { id: "decode", x: 796, y: y + 28, w: 172, h: 84, name: "Write the answer", value: WRITE, tone: TONE.write },
];
export const LEVERS = [
  { n: 1, name: "Free-worker scheduling", short: "No worker idles while a request waits", where: "the scheduler and the queue", parts: ["queue", "scheduler"] as FlowPart[], tag: { x: 460, y: 156 }, tone: TONE.wait },
  { n: 2, name: "Prefix reuse", short: "A shared document is read once", where: "reading the prompt", parts: ["kv", "prefill"] as FlowPart[], tag: { x: 686, y: 176 }, tone: TONE.read },
  { n: 3, name: "Faster prefill & decode", short: "Half the bytes for every token", where: "reading and writing every token", parts: ["weights", "decode", "prefill"] as FlowPart[], tag: { x: 882, y: 176 }, tone: TONE.write },
] as const;

function Node({ b, lit, dim }: { b: Box; lit: boolean; dim: boolean }) {
  return (
    <g className="fb-node" data-on={lit || undefined} data-dim={dim || undefined} data-store={b.store || undefined} style={{ ["--fb-tone" as string]: b.tone }}>
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={10} />
      <text x={b.x + b.w / 2} y={b.y + (b.value ? b.h / 2 - 8 : b.h / 2 + 6)} textAnchor="middle" className="fb-name">{b.name}</text>
      {b.value && <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 22} textAnchor="middle" className="fb-value">{b.value}</text>}
    </g>
  );
}

/** `lit`: the parts in focus (all when null). `tags`: how many lever numbers are attached to the picture. */
export function FlowBoard({ lit = null, tags = 0 }: { t?: number; lit?: readonly FlowPart[] | null; tags?: number }) {
  const on = (p: FlowPart) => !!lit && lit.includes(p);
  const dim = (p: FlowPart) => !!lit && !lit.includes(p);
  const link = (d: string, parts: FlowPart[], key: string, store = false) => {
    const active = !lit || parts.every((p) => lit.includes(p));
    return <path key={key} d={d} className="fb-link" data-dim={!active || undefined} data-flow={(lit && active) || undefined} data-store={store || undefined} markerEnd="url(#fb-arrow)" />;
  };
  return (
    <svg className="fb-svg" viewBox="0 0 1240 440" role="img" aria-label="Requests wait in a queue; a scheduler gives each to one of two GPU workers; each worker reads the prompt, using the KV cache, and writes the answer, reading the weights from memory">
      <defs><marker id="fb-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#7a8896" /></marker></defs>
      {LANES.map((l) => (
        <g key={l.name} className="fb-lane" data-dim={(lit && !lit.includes("prefill") && !lit.includes("decode")) || undefined}>
          <rect x={584} y={l.y} width={400} height={120} rx={14} />
          <text x={600} y={l.y + 20}>{l.name}</text>
        </g>
      ))}
      {link("M160 220H192", ["requests", "queue"], "a")}
      {link("M348 220H380", ["queue", "scheduler"], "b")}
      {link("M536 204C566 204 566 88 596 88", ["scheduler", "prefill"], "c")}
      {link("M536 236C566 236 566 368 596 368", ["scheduler", "prefill"], "d")}
      {LANES.flatMap((l) => [
        link(`M772 ${l.y + 70}H792`, ["prefill", "decode"], `e${l.y}`),
        link(`M968 ${l.y + 70}C1006 ${l.y + 70} 1006 ${l.y < 100 ? 204 : 236} 1040 ${l.y < 100 ? 204 : 236}`, ["decode", "answers"], `f${l.y}`),
      ])}
      {link("M686 188V136", ["kv", "prefill"], "g", true)}
      {link("M686 252V304", ["kv", "prefill"], "h", true)}
      {link("M882 188V136", ["weights", "decode"], "i", true)}
      {link("M882 252V304", ["weights", "decode"], "j", true)}
      {SIDE.concat(STORES).map((b) => <Node key={b.id} b={b} lit={on(b.id)} dim={dim(b.id)} />)}
      {LANES.flatMap((l) => TASKS(l.y).map((b) => <Node key={`${b.id}${l.y}`} b={b} lit={on(b.id)} dim={dim(b.id)} />))}
      {LEVERS.slice(0, tags).map((lever) => (
        <g key={lever.n} className="fb-tag" data-dim={(lit && !lever.parts.some((p) => lit.includes(p))) || undefined} style={{ ["--fb-tone" as string]: lever.tone }}>
          <circle cx={lever.tag.x + (lever.n === 1 ? 62 : 72)} cy={lever.tag.y + (lever.n === 1 ? 20 : 20)} r={15} />
          <text x={lever.tag.x + (lever.n === 1 ? 62 : 72)} y={lever.tag.y + (lever.n === 1 ? 26 : 26)} textAnchor="middle">{lever.n}</text>
        </g>
      ))}
    </svg>
  );
}

/** One chapter's part of the system: what happens there, what we changed, what it bought. */
type Zoom = { lit: readonly FlowPart[] | null; tags: number; title: string; happens: string; changed: string; impact: string; note: string };
const ZOOMS: Record<number, Zoom> = {
  0: { lit: null, tags: 0, title: "Start with today: the whole serving path", happens: "Two workers serve requests in fixed pairs, and every request reads its whole prompt", changed: "Nothing yet: this is what the three levers are measured against", impact: `*${f(R[0].correctCost!, 2)} GPU-s* per correct answer`, note: `slowest 5% wait ${f(R[0].p95)} s` },
  1: { lit: LEVERS[0].parts, tags: 1, title: "Lever 1 works here: the scheduler and the queue", happens: "A request waits until both workers of a pair are free", changed: "Any free worker takes the next request at once", impact: `Slowest 5%: *${f(R[0].p95)} → ${f(R[1].p95)} s*`, note: "no GPU work saved, only idle gaps" },
  2: { lit: LEVERS[1].parts, tags: 2, title: "Lever 2 works here: reading the prompt", happens: "Every request reads the whole shared document again", changed: "Read it once, keep its KV pages, and reference them", impact: `Prompt reading: *${f(mean(R[1], "prefill") * 1000)} → ${f(mean(R[2], "prefill") * 1000)} ms*`, note: "per request, on average" },
  3: { lit: LEVERS[2].parts, tags: 3, title: "Lever 3 works here: every token, read and written", happens: "Each output token reads all the weights from memory", changed: "FP8 weights and KV: half the bytes for every token", impact: `*${f(R[2].correctCost!, 2)} → ${f(R[3].correctCost!, 2)} GPU-s* per correct answer`, note: "same tokens, same answers" },
  4: { lit: null, tags: 3, title: "All three levers together", happens: "The same 96 requests, on the same model", changed: "Scheduling, prefix reuse and faster execution, combined", impact: `*${f(R[0].correctCost!, 2)} → ${f(R[3].correctCost!, 2)} GPU-s* per correct answer`, note: `slowest 5%: ${f(R[0].p95)} → ${f(R[3].p95)} s · ${R[3].correct} of 96 still correct` },
};
const ZOOM_MS = 7000;

function zoomScene(n: number) {
  const z = ZOOMS[n];
  function Scene({ t }: SceneProps) {
    const rows = [["What happens here", z.happens, 800], ["What we changed", z.changed, 2000]] as const;
    return (
      <div className="fb-zoom">
        <FlowBoard lit={t >= 300 ? z.lit : null} tags={z.tags} />
        <div className="fb-notes">
          {rows.map(([label, text, at]) => {
            const k = ease.out(prog(t, at, at + 400));
            return <p key={label} style={{ opacity: k, transform: `translateY(${(1 - k) * 8}px)` }}><small>{label}</small>{text}</p>;
          })}
          <p className="fb-impact" style={{ opacity: ease.out(prog(t, 3200, 3600)) }}><small>The impact</small><strong>{t >= 3200 ? highlight(z.impact) : null}</strong><em>{z.note}</em></p>
        </div>
      </div>
    );
  }
  return Scene;
}
export const FLOW_ZOOMS: Record<number, ArcBeat> = Object.fromEntries(
  Object.entries(ZOOMS).map(([n, z]) => [n, { label: "where this works", title: z.title, ms: ZOOM_MS, Scene: zoomScene(Number(n)) }]),
);
