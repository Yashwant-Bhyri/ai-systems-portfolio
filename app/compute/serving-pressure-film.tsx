"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useStudyPlayback } from "./use-study-playback";
import { useFilmTime } from "./use-film-time";
import { longestTokenGap, simulateStream, streamFilmFrame, STREAM_FILM_DURATION_MS, type StreamTrace } from "./stream-continuity-model";
import { servingPressureState } from "./serving-pressure-state";
import "./serving-pressure-film.css";

const BLUE = "#9cc5f5", GREEN = "#b8e986", AMBER = "#ffc267", RED = "#ff9185", VIOLET = "#c7a6ff";
const COLORS = [BLUE, "#95b6ff", AMBER, "#f3a0bc"];
const number = (value: number, digits = 1) => value.toLocaleString("en-US", { maximumFractionDigits: digits });
type Detail = "input" | "memory" | "execute" | "stream" | null;
const DETAILS = {
  input: ["New input competes with an existing answer", "Request 3 brings 128 input tokens at 40 ms; request 4 brings 32 at 46 ms. The baseline gives pending input priority. Chunked prefill limits new input per iteration after reserving decode work."],
  memory: ["Admission needs room for the whole request", "Each request reserves ceiling((input + output) ÷ 16) pages until completion. Reducing the pool to 12 pages holds the long document outside the device. These are reservation slots, not a physical KV allocator or a cache-reuse experiment."],
  execute: ["One iteration, two kinds of work", "The schematic follows the current iteration's input and output allocations. Duration = 4 ms overhead + 0.25 ms per input token + 1 ms per output token. Token emissions occur at iteration completion. Tile geometry is not a kernel profile."],
  stream: ["The gap is the user's interruption", "Every mark is one emitted token of request 1. The highlighted gap is the longest interval between two emissions. It is not time to first token, overall latency, or a measured production SLO."],
} as const;

function MachineLane({ trace, time, top, focus, narrate, onInspect }: {
  trace: StreamTrace; time: number; top: number; focus: string; narrate: "whole" | "chunked" | null; onInspect: (detail: Detail) => void;
}) {
  const state = servingPressureState(trace, time);
  const chunked = trace.policy === "chunked";
  const color = chunked ? GREEN : BLUE;
  const answer = state.requests[0];
  const document = state.requests[2];
  const gap = longestTokenGap(answer.tokenMs)!;
  const horizon = 300;
  const tx = (value: number) => 208 + Math.min(1, value / horizon) * 590;
  const stalled = !answer.done && answer.count > 0 && state.decode === 0 && state.prefill > 0;
  const atCompare = ["whole", "chunked", "gap", "first-token"].includes(focus);
  const showGap = time >= gap.endMs && focus !== "first-token";
  // One lane is narrated at a time while both run on the shared clock.
  const inactive = narrate ? (narrate === "whole" ? chunked : !chunked) : focus === "whole" ? chunked : focus === "chunked" ? !chunked : false;
  const inspectable = (detail: Exclude<Detail, null>, label: string) => ({
    role: "button", tabIndex: 0, "aria-label": label,
    className: "sp-inspect", onClick: (event: React.MouseEvent<SVGGElement>) => { event.currentTarget.focus(); onInspect(detail); },
    onKeyDown: (event: React.KeyboardEvent<SVGGElement>) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onInspect(detail); } },
  });
  const owners = state.requests.filter(request => request.active).flatMap(request => Array(request.pages).fill(request.id) as number[]);
  return <g transform={`translate(0 ${top})`} className="sp-lane" data-quiet={inactive}>
    <text x="28" y="20" className="sp-lane-title" fill={color}>{chunked ? "Chunked prefill" : "Baseline"}</text>
    <text x="28" y="41" className="sp-small">{chunked ? "Keep answer tokens in the loop" : "Finish new input before generating"}</text>
    <g {...inspectable("input", "Inspect the arriving documents and input-work allocation")}>
      <rect className="sp-hit" x="20" y="54" width="176" height="115" rx="5" />
      <text x="28" y="76" className="sp-label">New document · request 3</text>
      {Array.from({ length: 8 }, (_, index) => {
        const read = document.inputDone >= (index + 1) * 16;
        const active = !read && document.inputDone + document.allocated > index * 16;
        return <g key={index} transform={`translate(${28 + index % 4 * 35} ${89 + Math.floor(index / 4) * 22})`}>
          <rect width="29" height="16" rx="2" fill={read ? `${AMBER}25` : "#142432"} stroke={document.arrived ? AMBER : "#43505b"} strokeOpacity={active ? 1 : .4} />
          <path d={read ? "M8 8l4 3 7-7" : "M6 5h16M6 10h12"} fill="none" stroke={AMBER} opacity={document.arrived ? active || read ? 1 : .5 : .2} />
        </g>;
      })}
      <text x="28" y="154" className="sp-small" fill={document.waiting ? RED : undefined}>{!document.arrived ? "Arrives at 40 ms" : document.waiting ? "Waiting for memory" : `${document.inputDone} / 128 input tokens read`}</text>
      {state.requests[3].arrived && <text x="28" y="178" className="sp-small" fill="#f3a0bc">+ request 4 · 32 input tokens</text>}
    </g>
    <path d="M180 106H211m-5-4 5 4-5 4M291 106H329m-5-4 5 4-5 4" fill="none" stroke={AMBER} strokeOpacity={state.prefill ? .8 : .22} />
    <g {...inspectable("memory", "Inspect reserved KV slots and admission")}>
      <rect className="sp-hit" x="209" y="54" width="97" height="130" rx="5" />
      <text x="218" y="76" className="sp-label">KV slots</text>
      {Array.from({ length: 24 }, (_, index) => <rect key={index} x={218 + index % 6 * 12} y={88 + Math.floor(index / 6) * 15} width="8" height="10" rx="1"
        fill={index >= trace.capacityPages ? "none" : owners[index] ? COLORS[owners[index] - 1] : "#213542"}
        stroke={index >= trace.capacityPages ? "#4c5662" : "none"} opacity={owners[index] ? .8 : .6} />)}
      <text x="218" y="166" className="sp-small">{state.reserved}/{trace.capacityPages} reserved</text>
    </g>
    <g {...inspectable("execute", "Inspect the current prefill and decode iteration")}>
      <rect className="sp-hit" x="324" y="50" width="218" height="133" rx="5" />
      <path d="M343 69h169l18 14v66l-18 14H343l-13-14V83Z" fill="#0c1a24" stroke={color} strokeOpacity={state.complete ? .2 : .8} />
      <path d="M352 62V56m20 6V56m20 6V56m20 6V56m20 6V56m20 6V56m20 6V56m20 6V56M352 170v6m20-6v6m20-6v6m20-6v6m20-6v6m20-6v6m20-6v6m20-6v6" stroke={color} strokeOpacity=".45" />
      {Array.from({ length: 48 }, (_, index) => {
        const prefillRatio = state.prefill / Math.max(1, state.prefill + state.decode);
        const signal = index / 48 < prefillRatio ? AMBER : color;
        return <rect key={index} x={346 + index % 12 * 13.5} y={83 + Math.floor(index / 12) * 15} width="9" height="10" rx="1"
          fill={signal} opacity={state.complete ? .09 : .2 + (index / 48 < state.progress ? .6 : 0)} />;
      })}
      <text x="428" y="153" textAnchor="middle" className="sp-chip-text">{state.complete ? "device released" : `iteration ${(state.step?.index ?? 0) + 1}`}</text>
      <text x="428" y="192" textAnchor="middle" className="sp-small">{state.complete ? "All four requests finished" : `${state.prefill} input · ${state.decode} output tokens`}</text>
    </g>
    <path d="M532 106H583m-6-5 6 5-6 5" fill="none" stroke={stalled ? RED : color} strokeWidth={stalled ? 2 : 1.5} strokeDasharray={stalled ? "3 5" : undefined} />
    {state.step && !stalled && <circle cx={540 + state.progress * 38} cy="106" r="3" fill={color} />}
    <g {...inspectable("stream", "Inspect request 1 output tokens and the visible interruption")}>
      <rect className="sp-hit" x="587" y="50" width="225" height="137" rx="5" />
      <text x="599" y="75" className="sp-label">Existing answer · request 1</text>
      {Array.from({ length: answer.outputTokens }, (_, index) => <rect key={index} x={599 + index % 8 * 24} y={89 + Math.floor(index / 8) * 19} width="18" height="10" rx="2" fill={index < answer.count ? color : "#203442"} opacity={index < answer.count ? .9 : .5} />)}
      <text x="599" y="166" className="sp-small" fill={stalled ? RED : color}>{stalled ? `${number(answer.sinceLast)} ms without a new token` : answer.done ? "24 tokens delivered" : `${answer.count} / 24 tokens delivered`}</text>
    </g>
    <text x="28" y="221" className="sp-small">Answer token events</text>
    <path d="M208 220H798" stroke="#3b4e5b" />
    {answer.tokenMs.filter(at => at <= time).map((at, index) => <path key={index} d={`M${tx(at)} 212v16`} stroke={color} strokeWidth="2.5" />)}
    <path d={`M${tx(time)} 202v33`} stroke="#dce8ef" strokeOpacity=".8" />
    {showGap && <g>
      <path d={`M${tx(gap.startMs)} 215v-16H${tx(gap.endMs)}v16`} stroke={chunked ? GREEN : RED} strokeWidth="2" fill="none" />
      <rect x={tx(gap.startMs)} y="210" width={tx(gap.endMs) - tx(gap.startMs)} height="21" fill={chunked ? GREEN : RED} opacity=".12" />
      <text x={(tx(gap.startMs) + tx(gap.endMs)) / 2} y="245" textAnchor="middle" className="sp-small" fill={chunked ? GREEN : RED}>{number(gap.durationMs, 2)} ms</text>
      {atCompare && <><path d={`M${tx(gap.endMs)} 199H817V207`} fill="none" stroke={color} strokeOpacity=".55" /><circle data-sp-source={trace.policy} cx="817" cy="212" r="4" fill={color} /></>}
    </g>}
    {focus === "first-token" && <g>
      <path d={`M${tx(document.arrivalMs)} 244v-8H${tx(document.tokenMs[0])}v8`} stroke={AMBER} strokeWidth="2" fill="none" />
      <circle cx={tx(document.tokenMs[0])} cy="236" r="4" fill={AMBER} />
      <text x="28" y="246" className="sp-small" fill={AMBER}>New request TTFT: {number(document.ttftMs!, 2)} ms</text>
      <path d={`M${tx(document.tokenMs[0])} 236H817`} stroke={color} strokeOpacity=".55" /><circle data-sp-source={trace.policy} cx="817" cy="236" r="4" fill={color} />
    </g>}
  </g>;
}

export function ServingPressureFilm({ onInspectTrace }: { onInspectTrace: (selection: { tokenBudget: 16 | 32 | 64; capacityPages: 12 | 24; filmMs: number }) => void }) {
  const [budget, setBudget] = useState<16 | 32 | 64>(16);
  const [pages, setPages] = useState<12 | 24>(24);
  const [detail, setDetail] = useState<Detail>(null);
  const stage = useRef<HTMLDivElement>(null);
  const inspectionOrigin = useRef<SVGElement | null>(null);
  const [links, setLinks] = useState<Array<{ policy: string; path: string }>>([]);
  const { ref, ...player } = useStudyPlayback(1, 0, { finite: true, interval: STREAM_FILM_DURATION_MS });
  const film = useFilmTime(player.readTime, player.running, player.reduced, STREAM_FILM_DURATION_MS, player.seek);
  const pair = useMemo(() => ({ whole: simulateStream({ policy: "whole", tokenBudget: budget, capacityPages: pages }), chunked: simulateStream({ policy: "chunked", tokenBudget: budget, capacityPages: pages }) }), [budget, pages]);
  const frame = streamFilmFrame(film.time, pair);
  const narrate = frame.focus === "interference" ? (film.time < 12_500 ? "whole" : "chunked") : null;
  const blocked = pages === 12;
  const title = frame.focus === "streams" ? "Requests 1 and 2 are streaming their answers"
    : frame.focus === "entry" ? "Request 3's 128-token document arrives while request 1 is streaming"
    : blocked ? "The KV pool is full: request 3 waits outside, both streams keep going"
    : frame.focus === "whole" || narrate === "whole" ? "Baseline: request 1's stream stops while the whole document is read"
    : frame.focus === "chunked" || narrate === "chunked" ? `Chunked prefill: the document is read ${budget} tokens at a time, between decode steps`
    : frame.focus === "gap" ? "The worst token gap in request 1's stream"
    : frame.focus === "first-token" ? "The cost: request 3's first token arrives later"
    : "Prefill and decode share one GPU";
  const firstToken = frame.focus === "first-token";
  const values = firstToken ? [pair.whole.requests[2].ttftMs!, pair.chunked.requests[2].ttftMs!] : [pair.whole.requests[0].maxGapMs!, pair.chunked.requests[0].maxGapMs!];
  const settled = ["whole", "chunked", "gap", "first-token"].includes(frame.focus);
  const stateWhole = servingPressureState(pair.whole, frame.serviceMs), stateChunked = servingPressureState(pair.chunked, frame.serviceMs);
  const inspect = (next: Detail) => { inspectionOrigin.current = document.activeElement instanceof SVGElement ? document.activeElement : null; setDetail(next); };
  const releaseInspection = () => { setDetail(null); inspectionOrigin.current?.focus(); };
  const seek = (time: number) => { setDetail(null); film.seek(time); };
  const replay = () => { setDetail(null); film.seek(0); player.replay(); };
  useEffect(() => {
    const node = stage.current;
    if (!node || !settled || detail) return;
    const update = () => {
      const root = node.getBoundingClientRect();
      const aside = node.querySelector(".sp-consequence")!.getBoundingClientRect();
      const viewport = node.querySelector(".sp-scroll")!.getBoundingClientRect();
      if (aside.left < root.left + 10) { setLinks([]); return; }
      setLinks((["whole", "chunked"] as const).flatMap((policy) => {
        if (["whole", "chunked"].includes(frame.focus) && frame.focus !== policy) return [];
        const source = node.querySelector(`[data-sp-source="${policy}"]`)?.getBoundingClientRect();
        const target = node.querySelector(`[data-sp-target="${policy}"]`)?.getBoundingClientRect();
        if (!source || !target || source.left < viewport.left || source.right > viewport.right) return [];
        return [{ policy, path: `M${source.left + source.width / 2 - root.left} ${source.top + source.height / 2 - root.top}H${aside.left - root.left + (policy === "whole" ? 6 : 10)}V${target.top + target.height / 2 - root.top}H${target.left - root.left - 6}` }];
      }));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    const aside = node.querySelector(".sp-consequence");
    if (aside) observer.observe(aside);
    const scroll = node.querySelector(".sp-scroll");
    scroll?.addEventListener("scroll", update, { passive: true });
    return () => { observer.disconnect(); scroll?.removeEventListener("scroll", update); };
  }, [frame.focus, settled, detail, pages, budget]);
  return <section className="sp-film" ref={ref} data-focus={frame.focus} aria-label="A live answer under incoming load" onKeyDown={(event) => { if (event.key === "Escape" && detail) { event.stopPropagation(); releaseInspection(); } }}>
    <header className="sp-header"><div><span>Four requests · one device per lane</span><h3>{title}</h3></div><time>{number(frame.serviceMs)}<small> ms · shared clock</small></time></header>
    <div className="sp-stage" ref={stage}>
      <div className="sp-diagram"><p className="sp-pan">Scroll to inspect the execution lanes →</p><div className="sp-scroll" role="region" tabIndex={0} aria-label="Paired serving machines and token delivery" onFocusCapture={player.pause}>
        <svg className="sp-plot" viewBox="0 0 840 610" role="group" aria-label="Two scheduling rules, the same four requests and output lengths">
          <MachineLane trace={pair.whole} time={frame.serviceMs} top={20} focus={frame.focus} narrate={narrate} onInspect={inspect} />
          <path d="M28 303H810" stroke="#2d4350" />
          <MachineLane trace={pair.chunked} time={frame.serviceMs} top={328} focus={frame.focus} narrate={narrate} onInspect={inspect} />
          {[0, 100, 200, 300].map(time => <text key={time} x={208 + time / 300 * 590} y="600" textAnchor="middle" className="sp-small">{time} ms</text>)}
        </svg>
      </div></div>
      <aside className="sp-consequence" aria-label="What the scheduling change means for the request">
        {detail ? <div className="sp-detail"><button type="button" onClick={releaseInspection}>Close inspection ×</button><h4>{DETAILS[detail][0]}</h4><p>{DETAILS[detail][1]}</p></div> : <>
          <span className="sp-result-label">{firstToken ? "New document · request 3" : "Existing answer · request 1"}</span>
          <h4>{settled ? firstToken ? "Time to first token (TTFT)" : "Worst token gap (ITL)" : "Answer tokens delivered"}</h4>
          {settled ? <>
            <div className="sp-result-bars">{values.map((value, index) => <div key={index} data-active={frame.focus === (index ? "chunked" : "whole")}><span data-sp-target={index ? "chunked" : "whole"}>{index ? "Chunked" : "Baseline"}</span><strong style={{ color: index ? GREEN : BLUE }}>{number(value, 2)}<small> ms</small></strong><i style={{ width: `${100 * value / Math.max(...values)}%`, background: index ? GREEN : BLUE }} /></div>)}</div>
            <p className="sp-payoff" data-hero={!firstToken && values[0] !== values[1]} style={{ color: firstToken ? AMBER : VIOLET }}>{values[0] === values[1] ? "No stream-gap reduction" : firstToken ? `Cost: request 3's first token arrives ${number(Math.abs(values[1] - values[0]), 2)} ms later` : <>Δ {number(Math.abs(values[1] - values[0]), 2)} ms <small>shorter worst pause in request 1's stream</small></>}</p>
            <p className="sp-reason">{blocked ? "Both policies keep decoding while the long document waits outside the full KV pool." : firstToken ? "Cause: request 3's input now shares every step with request 1's stream." : `Cause: request 3's input runs in ${budget}-token chunks, so request 1 keeps decoding.`}</p>
          </> : <div className="sp-live-answer">{[stateWhole, stateChunked].map((state, index) => { const request = state.requests[0], paused = !request.done && state.prefill > 0 && state.decode === 0; return <div key={index}><span>{index ? "Chunked" : "Baseline"}</span><strong style={{ color: paused ? RED : index ? GREEN : BLUE }}>{request.count}<small> / 24 tokens</small></strong><span>{paused ? `${number(request.sinceLast)} ms since its last token` : request.done ? "Answer complete" : "Generating the answer"}</span></div>; })}</div>}
          <div className="sp-two-effects"><button type="button" aria-pressed={!firstToken && settled} onClick={() => seek(26000)}>Inspect the stream gap <span>↗</span></button><button type="button" aria-pressed={firstToken} onClick={() => seek(31000)}>Inspect the first-token tradeoff <span>↗</span></button></div>
        </>}
      </aside>
      {settled && !detail && links.length > 0 && <svg className="sp-result-links" aria-hidden="true">{links.map(link => <path key={link.policy} d={link.path} fill="none" stroke={link.policy === "whole" ? BLUE : GREEN} strokeWidth="1.3" />)}</svg>}
    </div>
    <div className="sp-controls"><label>Input + output tokens per chunked iteration<select value={budget} onChange={event => { setBudget(Number(event.target.value) as 16 | 32 | 64); seek(26000); }}><option value={16}>16-token chunks</option><option value={32}>32-token chunks</option><option value={64}>64-token chunks</option></select></label><label>KV reservation pool<select value={pages} onChange={event => { setPages(Number(event.target.value) as 12 | 24); seek(26000); }}><option value={24}>24 KV pages · document fits</option><option value={12}>12 KV pages · document waits</option></select></label></div>
    <div className="sp-transport"><button type="button" disabled={player.reduced} aria-label={player.running ? "Pause serving film" : "Play serving film"} onClick={() => { setDetail(null); if (player.finished || film.time >= STREAM_FILM_DURATION_MS) replay(); else player.toggle(); }}>{player.running ? "Ⅱ" : "▷"}</button><input aria-label="Scrub serving film" type="range" min={0} max={STREAM_FILM_DURATION_MS} step={10} value={film.time} onChange={event => seek(Number(event.target.value))} /><time>{number(film.time / 1000)} / 36 s</time><button type="button" onClick={replay} disabled={player.reduced}>↺ Replay</button></div>
    <nav className="sp-moments" aria-label="Serving film moments">{[[0, "Answer in flight"], [5000, "Document arrives"], [18500, "Baseline interruption"], [22500, "Interleave the work"], [26000, "Compare the gap"], [31000, "Expose the tradeoff"]].map(([at, label]) => <button type="button" key={label} onClick={() => seek(Number(at))}>{label}</button>)}</nav>
    <footer className="sp-footer"><span>Execution tiles are schematic; token events come from the shared trace.</span><button type="button" onClick={() => { player.pause(); onInspectTrace({ tokenBudget: budget, capacityPages: pages, filmMs: film.time }); }}>Inspect iterations, reservations & export ↗</button></footer>
  </section>;
}
