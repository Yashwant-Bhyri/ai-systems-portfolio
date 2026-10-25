"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import type { LabRun } from "./lab-simulation";
import { assertMatchedLoad, latencyDistribution, loadEvents, loadFilmFrame, loadState, LOAD_FILM_MS, LOAD_MOMENTS } from "./load-latency-model";
import { useStudyPlayback } from "./use-study-playback";
import { useFilmTime } from "./use-film-time";
import type { DirectedView, LoadViewState } from "./explorer-state";
import "./load-latency-explorer.css";

const BLUE = "#9cc5f5", GREEN = "#b8e986", AMBER = "#ffc267", VIOLET = "#c7a6ff";
const number = (value: number, digits = 1) => value.toLocaleString("en-US", { maximumFractionDigits: digits });
type Frame = ReturnType<typeof loadFilmFrame>;
type Distribution = ReturnType<typeof latencyDistribution>;

function QueueFigure({ runs, events, frame }: { runs: LabRun[]; events: ReturnType<typeof loadEvents>[]; frame: Frame }) {
  const states = runs.map(run => loadState(run, frame.elapsed));
  const peak = Math.max(0, ...events.flatMap(trace => trace.map(event => event.waiting)));
  const maximum = Math.max(2, 2 * Math.ceil(peak / 2));
  const x = (time: number) => 80 + 650 * time / frame.horizon;
  const y = (waiting: number) => 454 - waiting / maximum * 175;
  const lastArrival = Math.max(...runs[0].tasks.map(task => task.arrival));
  const finishes = runs.map(run => Math.max(...run.tasks.map(task => task.finish)));
  const complete = frame.phase === "complete";
  const queuePath = (trace: ReturnType<typeof loadEvents>) => {
    const visible = trace.filter(event => event.time <= frame.elapsed);
    return visible.map((event, index) => `${index ? `H${x(event.time)}V` : `M${x(event.time)} `}${y(event.waiting)}`).join(" ") + `H${x(frame.elapsed)}`;
  };
  return <svg viewBox="0 0 840 530" className="ll-plot" role="img" aria-label="Requests wait behind two workers per runtime; the lower plot counts waiting requests on one shared clock">
    {states.map((state, index) => {
      const color = index ? GREEN : BLUE, top = 18 + index * 119;
      const quiet = frame.focus === (index ? "baseline" : "optimized");
      return <g key={index} transform={`translate(0 ${top})`} className="ll-lane" data-quiet={quiet}>
        <text x="27" y="25" className="ll-lane-title" fill={color}>{index ? "Optimized" : "Baseline"}</text>
        <text x="27" y="46" className="ll-small">{state.arrived.length} arrived</text>
        <text x="168" y="19" className="ll-label">{state.waiting.length} waiting</text>
        {state.waiting.map((task, slot) => <rect key={task.id} x={168 + slot % 24 * 5} y={28 + Math.floor(slot / 24) * 9} width="3" height="6" rx="1" fill={color}><title>Request {task.id + 1} waiting</title></rect>)}
        {!state.waiting.length && <path d="M168 36h115" stroke={color} strokeOpacity=".2" />}
        <path d="M294 46h43m-5-4 5 4-5 4" stroke={color} fill="none" strokeOpacity=".6" />
        {[0, 1].map(worker => {
          const task = state.running.find(task => task.worker === worker);
          const progress = task ? (frame.elapsed - task.start) / task.gpuSeconds : 0;
          return <g key={worker} transform={`translate(${350 + worker * 131} 5)`}>
            <path d="M8 5H99l8 8v56l-8 8H8L0 69V13Z" fill="#101e2a" stroke={color} strokeOpacity={task ? .7 : .25} />
            <text x="53" y="23" textAnchor="middle" className="ll-small">Worker {worker + 1}</text>
            <text x="53" y="45" textAnchor="middle" className="ll-worker-label" fill={color}>{task ? `Request ${task.id + 1}` : "Available"}</text>
            <path d="M16 60H91" stroke="#3c505f" strokeWidth="3" /><path d={`M16 60h${75 * progress}`} stroke={color} strokeWidth="3" />
          </g>;
        })}
        <path d="M603 46h42m-5-4 5 4-5 4" stroke={color} strokeOpacity=".6" fill="none" />
        <text x="668" y="39" className="ll-completed" fill={color}>{state.completed.length}<tspan className="ll-small"> / {runs[index].n}</tspan></text>
        <text x="668" y="62" className="ll-small">completed</text>
      </g>;
    })}
    <text x="80" y="256" className="ll-label">Requests waiting for a worker</text>
    {frame.elapsed >= lastArrival && <g pointerEvents="none">
      <path d={`M${x(lastArrival)} 274V454`} stroke={AMBER} strokeDasharray="4 5" strokeOpacity=".65" />
      <text x={Math.min(x(lastArrival) + 9, 600)} y="274" className="ll-small" fill={AMBER}>Last request arrives</text>
      {frame.phase === "drain" && <text x="730" y="256" textAnchor="end" className="ll-small" fill={GREEN}>Queue falls as workers start requests</text>}
    </g>}
    {[0, .5, 1].map(fraction => <g key={fraction}><path d={`M80 ${y(maximum * fraction)}H746`} stroke="#314552" strokeDasharray="2 6" /><text x="65" y={y(maximum * fraction) + 4} textAnchor="end" className="ll-small">{number(maximum * fraction, 0)}</text></g>)}
    {events.map((trace, index) => <path key={index} d={queuePath(trace)} stroke={index ? GREEN : BLUE} strokeWidth="2.2" fill="none" className="ll-lane" data-quiet={frame.focus === (index ? "baseline" : "optimized")} />)}
    <path d={`M${x(frame.elapsed)} 274V455`} stroke="#dce7f0" strokeOpacity=".4" />
    {states.map((state, index) => <circle key={index} cx={x(frame.elapsed)} cy={y(state.waiting.length)} r="5" fill={index ? GREEN : BLUE} stroke="#0a151e" strokeWidth="2" />)}
    {complete ? <>
      <path d={`M${x(finishes[0])} 449V333M${x(finishes[1])} 449V333M${x(finishes[0])} 333H${x(finishes[1])}`} stroke={VIOLET} strokeWidth="2" fill="none" />
      <path d={`M${x((finishes[0] + finishes[1]) / 2)} 333V319H786V358H800`} stroke={VIOLET} fill="none" />
    </> : <>
      <path d={`M${x(frame.elapsed) + 12} ${y(states[0].waiting.length)}h8V${y(states[1].waiting.length)}h-8`} stroke={VIOLET} strokeWidth="2" fill="none" />
      <path d={`M${x(frame.elapsed) + 20} ${(y(states[0].waiting.length) + y(states[1].waiting.length)) / 2}H786V358H800`} stroke={VIOLET} strokeOpacity=".6" fill="none" />
    </>}
    <circle data-ll-source cx="812" cy="358" r="11" fill="#241c35" stroke={VIOLET} /><text x="812" y="362" textAnchor="middle" fill={VIOLET} fontSize="13">{(complete ? finishes[0] === finishes[1] : states[0].waiting.length === states[1].waiting.length) ? "=" : "Δ"}</text>
    {[0, .25, .5, .75, 1].map(fraction => <text key={fraction} x={x(frame.horizon * fraction)} y="477" textAnchor="middle" className="ll-small">{number(frame.horizon * fraction, 0)} s</text>)}
    <text x="410" y="510" textAnchor="middle" className="ll-axis">Elapsed workload time</text>
    {frame.phase === "complete" && <g className="ll-completion-marker" pointerEvents="none">
      {runs.map((run, index) => { const finish = Math.max(...run.tasks.map(task => task.finish)); return <g key={index}>
        <path d={`M${x(finish)} 450v${index ? -30 : -58}`} stroke={index ? GREEN : BLUE} strokeWidth="2" />
        <text x={x(finish) - 8} y={index ? 413 : 385} textAnchor="end" className="ll-small" fill={index ? GREEN : BLUE}>{index ? "Optimized" : "Baseline"} · all {run.n} complete</text>
      </g>; })}
    </g>}
  </svg>;
}

function TailFigure({ runs, distributions, frame, selected, scanPos, onSelect }: {
  runs: LabRun[]; distributions: Distribution[]; frame: Frame; selected: number | null; scanPos: number | null; onSelect: (id: number) => void;
}) {
  const max = Math.max(...runs.flatMap(run => run.tasks.map(task => task.latency))) * 1.1;
  const x = (position: number) => 80 + position / (runs[0].n - 1) * 650;
  const y = (latency: number) => 443 - latency / Math.max(1, max) * 322;
  const scanRank = scanPos === null ? null : Math.round(scanPos);
  const picked = runs.map((run, index) => scanRank !== null ? distributions[index].tasks[scanRank] : selected === null ? distributions[index].threshold : run.tasks.find(task => task.id === selected)!);
  const settled = frame.sort === 1;
  const boundary = settled && selected === null && scanRank === null;
  const gap = picked[0].latency - picked[1].latency;
  const valueX = picked.map((task, index) => x(task.id * (1 - frame.sort) + distributions[index].rankById.get(task.id)! * frame.sort));
  return <svg viewBox="0 0 840 530" className="ll-plot" role="group" aria-label="The same requests reorder from arrival order to latency rank; select a point to compare that exact request">
    <text x="80" y="38" className="ll-chart-title">{scanRank !== null ? `Rank ${scanRank + 1} of ${runs[0].n}: ${number(gap, 0)} s apart` : settled ? selected === null ? `Rank ${distributions[0].rank} of ${runs[0].n}` : `Request ${selected + 1}, in both runs` : "Order each run from fastest to slowest"}</text>
    <text x="80" y="65" className="ll-small">{scanRank !== null ? "Shaded: time saved at every rank the cursor has passed." : settled ? selected === null ? "Amber points take longer than their run’s selected boundary." : "Request identity stays fixed; its rank can change." : "Each point keeps its request identity as it moves."}</text>
    {[0, .25, .5, .75, 1].map(fraction => <g key={fraction}><path d={`M80 ${y(max * fraction)}H746`} stroke="#314552" strokeDasharray="2 6" /><text x="65" y={y(max * fraction) + 4} textAnchor="end" className="ll-small">{number(max * fraction, 0)}</text></g>)}
    {scanRank !== null && <g pointerEvents="none" className="ll-scan">
      <path d={[...distributions[0].tasks.slice(0, scanRank + 1).map((task, position) => `${position ? "L" : "M"}${x(position)} ${y(task.latency)}`), ...distributions[1].tasks.slice(0, scanRank + 1).map((task, position) => `L${x(position)} ${y(task.latency)}`).reverse(), "Z"].join(" ")} fill={VIOLET} opacity=".16" />
      <path d={`M${x(scanPos!)} 100V443`} stroke={VIOLET} strokeWidth="1.5" />
      <text x={x(scanPos!)} y="93" textAnchor="middle" className="ll-small" fill={VIOLET}>rank {scanRank + 1}</text>
      <text x={x(scanPos!) - 12} y={(y(picked[0].latency) + y(picked[1].latency)) / 2 + 5} textAnchor="end" className="ll-scan-delta">Δ {number(gap, 0)} s</text>
    </g>}
    {boundary && <>
      <rect x={x(distributions[0].rank - 1)} y="105" width={730 - x(distributions[0].rank - 1)} height="338" fill={AMBER} opacity=".06" />
      <path d={`M${x(distributions[0].rank - 1)} 100V443`} stroke={VIOLET} strokeDasharray="3 5" />
      <text x={x(distributions[0].rank - 1)} y="93" textAnchor="end" className="ll-small" fill={VIOLET}>selected rank ↓</text>
    </>}
    {runs.map((run, index) => {
      const color = index ? GREEN : BLUE, distribution = distributions[index];
      const quiet = frame.focus === (index ? "baseline" : "optimized");
      return <g key={index} className="ll-distribution" data-quiet={quiet}>
        {settled && <path d={distribution.tasks.map((task, position) => `${position ? "L" : "M"}${x(position)} ${y(task.latency)}`).join(" ")} stroke={color} strokeOpacity=".45" fill="none" />}
        {run.tasks.map(task => {
          const rank = distribution.rankById.get(task.id)!;
          const active = picked[index].id === task.id;
          const aboveBoundary = boundary && task.latency > distribution.threshold.latency;
          const cx = x(task.id * (1 - frame.sort) + rank * frame.sort);
          return <g key={task.id} role="button" tabIndex={active ? 0 : -1} className="ll-point" data-policy={index} data-task={task.id} aria-pressed={active}
            aria-label={`${index ? "Optimized" : "Baseline"} request ${task.id + 1}, ${number(task.latency, 2)} seconds, latency rank ${rank + 1}`}
            onClick={event => { event.currentTarget.focus(); onSelect(task.id); }} onKeyDown={event => {
              if (["Enter", " ", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
                event.preventDefault();
                const nextRank = event.key === "Home" ? 0 : event.key === "End" ? run.n - 1 : event.key === "ArrowLeft" ? Math.max(0, rank - 1) : event.key === "ArrowRight" ? Math.min(run.n - 1, rank + 1) : rank;
                const next = distribution.tasks[nextRank].id;
                onSelect(next);
                event.currentTarget.parentElement?.querySelector<SVGElement>(`[data-task="${next}"]`)?.focus();
              }
            }}>
            <circle cx={cx} cy={y(task.latency)} r="8" fill="transparent" />
            <circle cx={cx} cy={y(task.latency)} r={active ? 6 : aboveBoundary ? 3.5 : 2.4} fill={aboveBoundary ? AMBER : color} opacity={active || aboveBoundary ? 1 : .5} />
            {active && <circle cx={cx} cy={y(task.latency)} r="10" fill="none" stroke={color} strokeWidth="1.5" />}
          </g>;
        })}
      </g>;
    })}
    {settled && <g pointerEvents="none">
      {picked.map((task, index) => <path key={index} d={`M${valueX[index] + 11} ${y(task.latency)}H765`} stroke={index ? GREEN : BLUE} strokeOpacity=".7" fill="none" />)}
      <path d={`M766 ${y(picked[0].latency)}h9V${y(picked[1].latency)}h-9`} stroke={VIOLET} strokeWidth="2" fill="none" />
      <path d={`M775 ${(y(picked[0].latency) + y(picked[1].latency)) / 2}H792V358H800`} stroke={VIOLET} fill="none" />
      <circle data-ll-source cx="812" cy="358" r="11" fill="#241c35" stroke={VIOLET} /><text x="812" y="362" textAnchor="middle" fill={VIOLET} fontSize="13">{Math.abs(picked[0].latency - picked[1].latency) < 1e-8 ? "=" : "Δ"}</text>
    </g>}
    {[0, 23, 47, 71, 95].filter(position => position < runs[0].n).map(position => <text key={position} x={x(position)} y="468" textAnchor="middle" className="ll-small">{position + 1}</text>)}
    <text x="410" y="506" textAnchor="middle" className="ll-axis">{settled ? "Latency rank · fastest → slowest" : "Arrival order → latency rank"}</text>
    <text x="22" y="280" transform="rotate(-90 22 280)" textAnchor="middle" className="ll-axis">Arrival → completion (seconds)</text>
  </svg>;
}

export function LoadLatencyExplorer({ baseline, optimized, onPolicy, evidence, initial, presentation }: {
  baseline: LabRun; optimized: LabRun; onPolicy: (policy: 0 | 2) => void;
  evidence: (run: LabRun, pause: () => void) => ReactNode;
  initial?: LoadViewState;
  presentation?: DirectedView<LoadViewState>;
}) {
  assertMatchedLoad(baseline, optimized);
  const runs = useMemo(() => [baseline, optimized], [baseline, optimized]);
  const events = useMemo(() => runs.map(loadEvents), [runs]);
  const [percentile, setPercentile] = useState(initial?.percentile ?? 95);
  const [selected, setSelected] = useState<number | null>(initial?.selected ?? null);
  const distributions = useMemo(() => runs.map(run => latencyDistribution(run, percentile)), [runs, percentile]);
  const { ref, ...localPlayer } = useStudyPlayback(1, 0, { finite: true, interval: LOAD_FILM_MS, enabled: !presentation, autoplay: !initial, initialTime: initial?.time });
  const player = presentation ? { ...localPlayer, pause: presentation.pause } : localPlayer;
  const localFilm = useFilmTime(localPlayer.readTime, localPlayer.running, localPlayer.reduced, LOAD_FILM_MS, localPlayer.seek, initial?.time);
  const film = presentation ? { time: presentation.time, seek: (time: number) => presentation.inspect({ time, percentile, selected }) } : localFilm;
  const frame = loadFilmFrame(film.time, Math.max(...baseline.tasks.map(task => task.arrival)), Math.max(...runs.flatMap(run => run.tasks.map(task => task.finish))));
  const states = runs.map(run => loadState(run, frame.elapsed));
  const boundaryRank = distributions[0].rank - 1;
  const settleEase = frame.settle * frame.settle * (3 - 2 * frame.settle);
  const scanPos = frame.focus === "scan" && selected === null ? (frame.settle > 0 ? (baseline.n - 1) + (boundaryRank - (baseline.n - 1)) * settleEase : frame.scan * (baseline.n - 1)) : null;
  const scanRank = scanPos === null ? null : Math.round(scanPos);
  const picked = runs.map((run, index) => scanRank !== null ? distributions[index].tasks[scanRank] : selected === null ? distributions[index].threshold : run.tasks.find(task => task.id === selected)!);
  const complete = frame.phase === "complete";
  const values = frame.tail ? picked.map(task => task.latency) : complete ? runs.map(run => Math.max(...run.tasks.map(task => task.finish))) : states.map(state => state.waiting.length);
  const difference = values[0] - values[1];
  const stage = useRef<HTMLDivElement>(null);
  const [leader, setLeader] = useState<string | null>(null);
  const id = useId();
  const chooseRequest = (request: number) => { if (presentation) { presentation.inspect({ time: LOAD_FILM_MS, percentile, selected: request }); return; } setSelected(request); film.seek(LOAD_FILM_MS); };
  const seek = (time: number) => { setSelected(null); film.seek(time); };
  const replay = () => { setSelected(null); film.seek(0); player.replay(); };
  const compareReady = !frame.tail || frame.sort === 1;
  useEffect(() => {
    const node = stage.current;
    if (!node || !compareReady) return;
    const update = () => {
      const root = node.getBoundingClientRect();
      const source = node.querySelector("[data-ll-source]")?.getBoundingClientRect();
      const target = node.querySelector("[data-ll-target]")?.getBoundingClientRect();
      const aside = node.querySelector(".ll-result")?.getBoundingClientRect();
      const viewport = node.querySelector(".ll-scroll")?.getBoundingClientRect();
      if (!source || !target || !aside || !viewport || aside.left <= root.left + 10 || source.right > viewport.right || source.left < viewport.left) { setLeader(null); return; }
      setLeader(`M${source.left + source.width / 2 - root.left} ${source.top + source.height / 2 - root.top}H${aside.left - root.left + 7}V${target.top + target.height / 2 - root.top}H${target.left - root.left - 6}`);
    };
    update(); const observer = new ResizeObserver(update); observer.observe(node);
    const aside = node.querySelector(".ll-result"); if (aside) observer.observe(aside);
    const scroll = node.querySelector(".ll-scroll"); scroll?.addEventListener("scroll", update, { passive: true });
    return () => { observer.disconnect(); scroll?.removeEventListener("scroll", update); };
  }, [compareReady, frame.tail, complete, selected, percentile, frame.focus]);
  const title = frame.tail ? frame.sort < 1 ? "Rank response latency" : scanRank !== null ? "Scan every rank: the gap widens toward the slow tail" : selected === null ? `Compare p${percentile} response latency` : `Request ${selected + 1}: response latency`
    : complete ? "Compare workload completion" : frame.phase === "drain" ? "Drain the request queue" : frame.phase === "queue" ? "Compare accumulated queues" : "Request arrivals & admission";

  return <section ref={ref} className="ll-explorer" aria-labelledby={`${id}-title`} data-focus={frame.focus} data-phase={frame.phase} data-done={film.time >= LOAD_FILM_MS - 100}>
    <div className="ll-tools"><div role="group" aria-label="Load comparison checkpoint"><span className="lab-control-label">Model checkpoint</span>{([0, 2] as const).map(policy => <button key={policy} type="button" aria-pressed={baseline.policyIndex === policy} onClick={() => onPolicy(policy)}>{policy ? "Post-trained · SFT + RL" : "Base"}</button>)}</div><span>Same arrivals · two workers per runtime</span></div>
    <header className="ll-heading"><h3 id={`${id}-title`}>{title}</h3><time>{number(frame.elapsed)}<small>s · workload clock</small></time></header>
    <div ref={stage} className="ll-stage">
      <div className="ll-scroll" role="region" tabIndex={0} aria-label="Queue and latency investigation; scroll horizontally on narrow screens" onFocusCapture={player.pause} style={{ opacity: player.reduced ? 1 : frame.fade }}>
        {frame.tail ? <TailFigure runs={runs} distributions={distributions} frame={frame} selected={selected} scanPos={scanPos} onSelect={chooseRequest} /> : <QueueFigure runs={runs} events={events} frame={frame} />}
      </div>
      <aside className="ll-result" data-ordering={!compareReady} aria-label={!compareReady ? "Ordering completed response times" : "The consequence of the selected queue or latency interval"}>
        {!compareReady && <div className="ll-ordering">
          <span className="ll-result-label">{baseline.n} completed responses per run</span>
          <h4>Arrange by time to finish.</h4>
          <div className="ll-order-guide"><span>Fastest</span><span aria-hidden="true">⟶</span><span>Slowest</span></div>
          <p className="ll-explanation">Each run gets its own order. Then compare the same rank.</p>
        </div>}
        <span className="ll-result-label">{frame.tail ? scanRank !== null ? `Rank ${scanRank + 1} / ${baseline.n} · same rank in both runs` : selected === null ? `${percentile}th percentile · rank ${distributions[0].rank} / ${baseline.n}` : `Matched request ${selected + 1}` : `${states[0].arrived.length} of ${baseline.n} requests arrived`}</span>
        <h4>{frame.tail ? scanRank !== null ? "Latency at this rank" : selected === null ? "Arrival-to-completion latency" : "Matched request latency" : complete ? `Time to finish ${baseline.n} requests` : frame.phase === "drain" ? "Requests still waiting" : "Requests waiting for a worker"}</h4>
        <div className="ll-values">{values.map((value, index) => <div key={index} data-active={frame.focus === (index ? "optimized" : "baseline")}>
          <span>{index ? "Optimized" : "Baseline"}</span><strong style={{ color: index ? GREEN : BLUE }}>{number(value, frame.tail || complete ? 1 : 0)}<small>{frame.tail || complete ? " s" : " requests"}</small></strong><i style={{ width: `${100 * value / Math.max(...values, 1)}%`, background: index ? GREEN : BLUE }} />
          {frame.tail && <small className="ll-request-id">Request {picked[index].id + 1}</small>}
        </div>)}</div>
        <p data-ll-target className="ll-delta" data-hero={compareReady && Math.abs(difference) >= 1e-8}>{Math.abs(difference) < 1e-8 ? frame.tail || complete ? "= same duration" : "= same queue length" : <><b className="cx-hero-num">Δ {number(Math.abs(difference), frame.tail || complete ? 1 : 0)}</b> <span className="cx-hero-unit">{frame.tail ? difference > 0 ? "s faster response" : "s slower response" : complete ? difference > 0 ? "s earlier · all done" : "s later · all done" : difference > 0 ? "fewer requests waiting" : "more requests waiting"}</span></>}</p>
        {frame.tail ? <>
          <p className="ll-explanation">{scanRank !== null ? "Fast responses barely change; the slowest waited longest for a worker, so they gain the most." : selected === null ? distributions[0].atOrBelow === distributions[1].atOrBelow ? `In each run, ${distributions[0].atOrBelow} of ${baseline.n} responses finish within its boundary. ${distributions[0].above ? `The ${distributions[0].above} amber points take longer.` : "None take longer."}` : `At or below the boundary: ${distributions[0].atOrBelow} baseline, ${distributions[1].atOrBelow} optimized. Amber marks responses that take longer.` : "Waiting and execution both contribute to this request’s latency."}</p>
          <p className="ll-intervention">Runtime: {optimized.tasks.some(task => task.cacheHit) ? "ready-prefix reuse + faster execution" : "faster execution · no prefix hits"}</p>
          <div className="ll-percentiles" role="group" aria-label="Inspect a latency percentile">{[50, 95, 99].map(value => <button key={value} type="button" aria-pressed={percentile === value && selected === null} onClick={() => { if (presentation) { presentation.inspect({ time: LOAD_FILM_MS, percentile: value, selected: null }); return; } setPercentile(value); setSelected(null); film.seek(LOAD_FILM_MS); }}>p{value}</button>)}</div>
          {selected !== null && <div className="ll-breakdown">{picked.map((task, index) => <p key={index}><span style={{ color: index ? GREEN : BLUE }}>{index ? "Optimized" : "Baseline"}</span> {number(task.queueSeconds)} s waiting + {number(task.gpuSeconds)} s executing</p>)}</div>}
        </> : <><p className="ll-explanation">{complete ? `All ${baseline.n} requests completed in both runs. Next: compare each response’s arrival-to-completion latency.` : frame.phase === "drain" ? "No new arrivals. Each downward step means a waiting request began execution, not a loss of throughput." : states.every(state => state.waiting.length === 0) ? "No requests waiting. Active requests appear on the workers." : "Ready-prefix reuse and faster execution release workers sooner."}</p><p className="ll-intervention">{complete ? "Prefix reuse + faster prefill/decode" : `${states[0].completed.length} baseline / ${states[1].completed.length} optimized requests completed`}</p></>}
        <div className="ll-evidence"><span>Baseline {evidence(baseline, player.pause)}</span><span>Optimized {evidence(optimized, player.pause)}</span></div>
      </aside>
      {compareReady && leader && <svg className="ll-leader" aria-hidden="true"><path d={leader} stroke={VIOLET} strokeWidth="1.4" fill="none" /></svg>}
    </div>
    <div className="ll-transport"><button type="button" disabled={player.reduced} aria-label={player.running ? "Pause load investigation" : "Play load investigation"} onClick={() => player.running ? player.pause() : film.time >= LOAD_FILM_MS ? replay() : player.toggle()}>{player.running ? "Ⅱ" : "▷"}</button><input type="range" min={0} max={LOAD_FILM_MS} step={10} value={film.time} aria-label="Scrub load and latency investigation" onChange={event => seek(Number(event.target.value))} /><time>{number(film.time / 1000)} / {LOAD_FILM_MS / 1000} s</time></div>
    <nav className="ll-moments" aria-label="Load investigation moments">{[[LOAD_MOMENTS.arrivals, "Request arrivals"], [LOAD_MOMENTS.queue, "Queue buildup"], [LOAD_MOMENTS.complete, "Workload completion"], [LOAD_MOMENTS.sort, "Latency ranking"], [LOAD_MOMENTS.scan, "Scan every rank"], [LOAD_MOMENTS.difference, "p95 comparison"]].map(([time, label]) => <button key={label} type="button" onClick={() => time === 0 && !player.reduced ? replay() : seek(Number(time))}>{label}</button>)}</nav>
    <label className="ll-inspect-request">Inspect request<input type="range" min={1} max={baseline.n} step={1} value={(selected ?? distributions[0].threshold.id) + 1} aria-label="Inspect the same request in both latency distributions" onChange={event => chooseRequest(Number(event.target.value) - 1)} /><output>{(selected ?? distributions[0].threshold.id) + 1}</output></label>
    <details className="ll-accounting" ><summary>Inspect percentile and queue accounting</summary><p>A percentile uses each run’s independently sorted arrival-to-completion times. Nearest rank = ceiling(percentile × {baseline.n} / 100). Its baseline and optimized boundary can refer to different requests. Select an individual point for a matched-request comparison instead. Ties may place more responses at or below a boundary.</p><p>Queue length counts arrived requests that have not started. Active workers and completed requests are separate states. At every clock: arrived = waiting + running + completed. Both runs use two FIFO serial workers and the same scheduling rule.</p><p>The runtime comparison enables ready-prefix reuse and faster declared prefill/decode rates together, not a new scheduling algorithm. Interactive and shared-prefix are different workload presets: both input size and arrival spacing change. These charts cannot isolate arrival rate from that preset switch.</p><p>All {baseline.n} requests are included, with no drops or censoring. Values are illustrative busy-work/service calculations, not GPU measurements, production latency distributions or a goodput/SLO claim.</p></details>
  </section>;
}
