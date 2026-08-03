"use client";

import { T, TD } from "./i18n";

import { useEffect, useState, type CSSProperties, type ReactElement } from "react";

/** Cycles a glow index across the overview nodes, synced to the packet cadence —
 *  each tile lights up (hover treatment) as the signal reaches it. */
function useGlowCycle(count: number, stepMs = 1600) {
  const [glow, setGlow] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setGlow((v) => (v + 1) % count), stepMs);
    return () => window.clearInterval(timer);
  }, [count, stepMs]);
  return glow;
}

type OverviewProps = {
  active: number;
  onSelect: (index: number) => void;
};

type VisualProps = {
  active: number;
};

type MapGlyph = "voice" | "transcript" | "agents" | "audio" | "brief" | "sources" | "compiler" | "dag" | "timeline" | "capture" | "perceive" | "fuse" | "retrieve" | "reason" | "validate" | "review";

/** Dedicated animated SVG mini-glyphs for the MindScape architecture map —
 *  each one sketches the stage's actual mechanism, not a generic dot pattern. */
const MIND_GLYPHS: Record<string, ReactElement> = {
  agents: (
    <svg viewBox="0 0 84 42" className="vx-mind-glyph">
      {[[8, 8], [8, 21], [8, 34], [30, 12], [30, 30]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.6} className="mg-dot" />
      ))}
      <path d="M 11 9 C 22 10 24 12 27 12 M 11 21 C 20 19 24 14 27 13 M 11 21 C 20 23 24 28 27 29 M 11 33 C 22 32 24 30 27 30 M 33 13 L 44 19 M 33 29 L 44 23" className="mg-edge" />
      <circle cx={50} cy={21} r={7} className="mg-core-ring" />
      <circle cx={50} cy={21} r={2.4} className="mg-core" />
      <path d="M 57 21 h 12" className="mg-edge" />
      <rect x={70} y={14} width={12} height={14} rx={3} className="mg-chip lit" />
    </svg>
  ),
  audio: (
    <svg viewBox="0 0 84 42" className="vx-mind-glyph">
      <path d="M 8 16 h 8 l 9 -8 v 26 l -9 -8 h -8 Z" className="mg-shield" />
      <path d="M 32 13 a 11 11 0 0 1 0 16 M 38 8 a 18 18 0 0 1 0 26" className="mg-arc" />
      {[12, 20, 30, 24, 16, 26, 14].map((h, i) => (
        <rect key={i} x={52 + i * 4.4} y={21 - h / 2} width={2.8} height={h} rx={1.4} className="mg-bar" style={{ animationDelay: `${i * 0.11}s` }} />
      ))}
    </svg>
  ),
  dag: (
    <svg viewBox="0 0 84 42" className="vx-mind-glyph">
      <circle cx={9} cy={21} r={3.2} className="mg-core" />
      {[7, 21, 35].map((y, i) => (
        <g key={y}>
          <path d={`M 12 21 C 26 21 28 ${y} 40 ${y}`} className="mg-edge" style={{ animationDelay: `${i * 0.3}s` }} />
          <rect x={42} y={y - 5} width={16} height={10} rx={3} className="mg-chip" />
          <path d={`M 58 ${y} C 66 ${y} 68 21 74 21`} className="mg-edge" style={{ animationDelay: `${0.4 + i * 0.3}s` }} />
        </g>
      ))}
      <rect x={74} y={15} width={8} height={12} rx={2.5} className="mg-chip lit" />
    </svg>
  ),
  capture: (
    <svg viewBox="0 0 84 42" className="vx-mind-glyph">
      {[6, 14, 26, 34, 20, 30, 12, 24, 16, 28, 10, 22].map((h, i) => (
        <rect key={i} x={4 + i * 6.6} y={21 - h / 2} width={4} height={h} rx={2} className="mg-bar" style={{ animationDelay: `${i * 0.09}s` }} />
      ))}
      <rect x={52} y={4} width={26} height={34} rx={3} className="mg-window" />
    </svg>
  ),
  perceive: (
    <svg viewBox="0 0 84 42" className="vx-mind-glyph">
      <circle cx={10} cy={21} r={4} className="mg-core" />
      {[6, 21, 36].map((y, i) => (
        <g key={y}>
          <path d={`M 14 21 C 34 21 40 ${y} 56 ${y}`} className="mg-edge" style={{ animationDelay: `${i * 0.35}s` }} />
          <rect x={58} y={y - 4} width={22} height={8} rx={3} className="mg-chip" />
        </g>
      ))}
    </svg>
  ),
  fuse: (
    <svg viewBox="0 0 84 42" className="vx-mind-glyph">
      {[6, 16, 26, 36].map((y, i) => (
        <path key={y} d={`M 4 ${y} C 26 ${y} 32 21 50 21`} className="mg-edge" style={{ animationDelay: `${i * 0.28}s` }} />
      ))}
      <circle cx={54} cy={21} r={6} className="mg-core" />
      <rect x={66} y={15} width={14} height={12} rx={3} className="mg-chip lit" />
    </svg>
  ),
  retrieve: (
    <svg viewBox="0 0 84 42" className="vx-mind-glyph">
      {[8, 21, 34].map((y, li) => (
        <g key={y}>
          <line x1={6} y1={y} x2={62} y2={y} className="mg-layer" />
          {Array.from({ length: 3 + li * 2 }).map((_, ni) => (
            <circle key={ni} cx={10 + ni * (48 / (2 + li * 2))} cy={y} r={2.2} className="mg-dot" />
          ))}
        </g>
      ))}
      <path d="M 34 8 L 22 21 L 46 34" className="mg-path" />
      <circle cx={46} cy={34} r={4} className="mg-core" />
      <circle cx={72} cy={21} r={7} fill="none" className="mg-lens" />
      <line x1={77} y1={26} x2={82} y2={31} className="mg-lens" />
    </svg>
  ),
  reason: (
    <svg viewBox="0 0 84 42" className="vx-mind-glyph">
      {[
        [8, 8], [8, 34], [30, 21],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.4} className="mg-dot" style={{ animationDelay: `${i * 0.3}s` }} />
      ))}
      <path d="M 11 9 L 27 19 M 11 33 L 27 23 M 34 21 L 48 21" className="mg-edge" />
      <rect x={50} y={11} width={30} height={20} rx={4} className="mg-chip" />
      <path d="M 56 21 h 18 M 56 26 h 12" className="mg-lines" />
      <path d="M 56 16 h 14" className="mg-lines lit" />
    </svg>
  ),
  validate: (
    <svg viewBox="0 0 84 42" className="vx-mind-glyph">
      <rect x={6} y={6} width={26} height={30} rx={3} className="mg-window" />
      <path d="M 11 13 h 16 M 11 20 h 16 M 11 27 h 10" className="mg-lines" />
      <path d="M 56 4 l 16 5 v 12 c 0 9 -7 14 -16 17 c -9 -3 -16 -8 -16 -17 v -12 Z" className="mg-shield" />
      <path d="M 50 21 l 5 5 l 9 -10" className="mg-check" />
      <path d="M 34 21 h 4" className="mg-edge" />
    </svg>
  ),
  review: (
    <svg viewBox="0 0 84 42" className="vx-mind-glyph">
      <circle cx={16} cy={13} r={5} className="mg-core" />
      <path d="M 7 34 a 9 8 0 0 1 18 0" className="mg-path" />
      <rect x={36} y={6} width={44} height={30} rx={4} className="mg-window" />
      <path d="M 42 14 h 24 M 42 21 h 32 M 42 28 h 18" className="mg-lines" />
      <path d="M 70 26 l 3 3 l 5 -6" className="mg-check" />
    </svg>
  ),
};

function MapNode({
  step,
  kicker,
  title,
  detail,
  glyph,
  active,
  glow = false,
  onSelect,
}: {
  step: number;
  kicker: string;
  title: string;
  detail: string;
  glyph: MapGlyph;
  active: boolean;
  glow?: boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <button
      type="button"
      className="vx-map-node"
      data-active={active}
      data-glow={glow}
      onClick={() => onSelect(step)}
      aria-pressed={active}
    >
      <span>{kicker}</span>
      {MIND_GLYPHS[glyph] ? (
        <div className="vx-map-glyph vx-map-glyph-svg" aria-hidden="true">{MIND_GLYPHS[glyph]}</div>
      ) : (
        <div className={`vx-map-glyph vx-map-glyph-${glyph}`} aria-hidden="true">{Array.from({ length: 7 }, (_, index) => <i key={index} />)}</div>
      )}
      <strong>{title}</strong>
      <small>{detail}</small>
      <i aria-hidden="true" />
      {/* The travelling ring used to be a free-floating element on a CSS
          animation while the highlight ran on a JS interval — two clocks, so
          they drifted apart within seconds. It now rides inside whichever node
          is lit, which makes them the same event by construction. */}
      {glow ? <b className="vx-map-packet" aria-hidden="true" /> : null}
    </button>
  );
}

function MapLink({ label }: { label: string }) {
  return <div className="vx-map-link" aria-hidden="true"><i /><span>{label}</span></div>;
}

function Waveform({ bars = 24, className = "" }: { bars?: number; className?: string }) {
  return (
    <div className={`vx-wave ${className}`} aria-hidden="true">
      {Array.from({ length: bars }, (_, index) => (
        <i
          key={index}
          style={{
            "--bar": index,
            "--wave-height": `${10 + ((index * 17 + 9) % 41)}px`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}

function SignalMesh({
  inputs,
  center,
  outputs,
  accent = "lime",
}: {
  inputs: readonly string[];
  center: string;
  outputs: readonly string[];
  accent?: "lime" | "violet" | "cyan";
}) {
  return (
    <div className={`vx-signal-mesh vx-signal-${accent}`} aria-hidden="true">
      <div className="vx-signal-column vx-signal-inputs">
        {inputs.map((item, index) => <i key={item} style={{ "--node": index } as CSSProperties}><span>{item}</span></i>)}
      </div>
      <div className="vx-signal-lines vx-signal-lines-a" />
      <div className="vx-signal-column vx-signal-hidden">
        {Array.from({ length: 6 }, (_, index) => (
          <i
            key={index}
            style={{
              "--node": index,
              "--node-x": index % 2 === 0 ? "20%" : "80%",
              "--node-y": `${12 + index * 15}%`,
            } as CSSProperties}
          />
        ))}
      </div>
      <div className="vx-signal-lines vx-signal-lines-b" />
      <div className="vx-signal-core"><i /><b>{center}</b></div>
      <div className="vx-signal-lines vx-signal-lines-c" />
      <div className="vx-signal-column vx-signal-outputs">
        {outputs.map((item, index) => <i key={item} style={{ "--node": index } as CSSProperties}><span>{item}</span></i>)}
      </div>
    </div>
  );
}

export function AntigravityOverview({ active, onSelect }: OverviewProps) {
  const glow = useGlowCycle(4);
  return (
    <div className="vx-overview vx-overview-antigravity" role="group" aria-label={T("Antigravity high-level architecture")}>
      <div className="vx-overview-track">
        <MapNode step={0} kicker={T("INPUT")} title={T("Candidate answer")} detail={T("Live voice + turn state")} glyph="voice" active={active === 0} glow={glow === 0} onSelect={onSelect} />
        <MapLink label={T("audio")} />
        <MapNode step={1} kicker={T("INGRESS")} title={T("Streaming speech-to-text")} detail={T("Partial → final transcript")} glyph="transcript" active={active === 1} glow={glow === 1} onSelect={onSelect} />
        <MapLink label={T("turn packet")} />
        <MapNode step={5} kicker={T("INTELLIGENCE")} title={T("Interview orchestrator")} detail={T("Parallel evidence → next route")} glyph="agents" active={active >= 2 && active <= 5} glow={glow === 2} onSelect={onSelect} />
        <MapLink label={T("question")} />
        <MapNode step={6} kicker={T("OUTPUT")} title={T("Prepared response audio")} detail={T("Cached TTS + playback")} glyph="audio" active={active === 6} glow={glow === 3} onSelect={onSelect} />
      </div>
      <div className="vx-overview-return" aria-hidden="true"><i /><span>{T("adaptive follow-up returns to the candidate")}</span></div>
    </div>
  );
}

function CandidateRoom() {
  return (
    <div className="vx-room" role="img" aria-label={T("Live Antigravity interview room with candidate voice input")}>
      <div className="vx-room-top"><span><i /> {T("FICTIONAL REPLAY · INTERVIEW LIVE")}</span><small>{T("AI AGENT SYSTEMS ENGINEER · TURN 01")}</small></div>
      <div className="vx-room-question"><small>{T("OWNERSHIP + FAILURE PROBE")}</small><strong>{T("What did you personally own—and where did the first design fail?")}</strong></div>
      <div className="vx-room-people">
        <div className="vx-room-person"><i className="vx-avatar"><b /><b /><em /></i><span>{T("Jordan Lee")}</span><small>{T("Fictional candidate speaking")}</small></div>
        <div className="vx-room-signal"><Waveform bars={36} /><span>{T("VOICE STREAM")}</span></div>
        <div className="vx-room-person vx-room-ai"><i className="vx-avatar"><b /><b /><em /></i><span>{T("Antigravity")}</span><small>{T("Listening + preparing")}</small></div>
      </div>
      <div className="vx-room-footer"><span>00:42</span><i>{T("turn ownership locked")}</i><strong>{T("LIVE TRANSCRIPT ↗")}</strong></div>
    </div>
  );
}

function StreamingSTT() {
  const tokens = ["I", "owned", "the", "orchestration", "boundary,", "typed", "tool", "contracts,", "and", "latency", "instrumentation"];
  return (
    <div className="vx-stt-lab" role="img" aria-label={T("Streaming speech-to-text partial tokens becoming a final transcript")}>
      <div className="vx-stt-source"><span>{T("16 kHz voice")}</span><Waveform bars={32} /><small>{T("continuous audio frames")}</small></div>
      <div className="vx-stt-stream">
        <span>{T("PARTIAL TRANSCRIPT")}</span>
        <p>{tokens.map((token, index) => <i key={`${token}-${index}`} style={{ "--token": index } as CSSProperties}>{token}</i>)}</p>
        <small>{T("provisional words revise while the candidate speaks")}</small>
      </div>
      <div className="vx-stt-lock"><i /><span>{T("FINAL TURN")}</span><strong>{T("Transcript committed")}</strong><small>{T("turn_id · timestamps · entities")}</small></div>
      <div className="vx-flow-pulse" aria-hidden="true" />
    </div>
  );
}

function TrajectoryMap() {
  return (
    <div className="vx-trajectory" role="img" aria-label={T("Trajectory map selects the next prepared question from semantic evidence")}>
      <div className="vx-tree-root"><span>{T("CURRENT EVIDENCE")}</span><strong>{T("Owned the orchestration boundary")}</strong><small>{T("failure mechanism needs verification")}</small></div>
      <div className="vx-tree-stem" aria-hidden="true" />
      <div className="vx-tree-branches">
        <div><span>{T("architecture depth")}</span><strong>{T("Explain the two-track runtime")}</strong><small>{T("mechanism already described")}</small></div>
        <div className="is-selected"><span>{T("failure evidence")}</span><strong>{T("What signal proved the bottleneck?")}</strong><small>{T("highest evidence gain")}</small></div>
        <div><span>{T("stale-state safety")}</span><strong>{T("How is late work rejected?")}</strong><small>{T("stage for the next probe")}</small></div>
      </div>
      <div className="vx-route-result"><span>{T("FOREGROUND QUESTION PATH")}</span><strong>{T("Failure-signal probe selected")}</strong><small>{T("prepared route · bounded guard passed")}</small></div>
    </div>
  );
}

function EvidenceAgents() {
  return (
    <div className="vx-evidence-agents" role="img" aria-label={T("Four parallel evidence agents analyze concept coverage, weaknesses, discrepancies, and reasoning behavior")}>
      <div className="vx-agent-cell vx-concept-agent"><span>{T("CONCEPT AGENT")}</span><div><i>{T("orchestration")}</i><i>{T("latency")}</i><i>{T("state")}</i><i>{T("evaluation")}</i></div><strong>{T("3 covered · 1 open")}</strong></div>
      <div className="vx-agent-cell vx-weakness-agent"><span>{T("WEAKNESS AGENT")}</span><p>{T("failure signal")}</p><div><i /><i /><i /><i /></div><strong>{T("Trace evidence still missing")}</strong></div>
      <div className="vx-agent-cell vx-discrepancy-agent"><span>{T("DISCREPANCY AGENT")}</span><div><i><b>{T("Owned orchestration")}</b><em>{T("supported")}</em></i><i><b>{T("Typed tool contracts")}</b><em>{T("supported")}</em></i><i><b>{T("Production scale")}</b><em>{T("untested")}</em></i></div></div>
      <div className="vx-agent-cell vx-reasoning-agent"><span>{T("REASONING AGENT")}</span><div><i>{T("assumptions")}</i><i>trade-offs</i><i>{T("edge cases")}</i><i>self-correction</i></div><strong>{T("Trade-off evidence found")}</strong></div>
      <div className="vx-agent-sync"><i /><i /><i /><i /><span>{T("parallel typed findings")}</span></div>
    </div>
  );
}

function OrchestratorDecision() {
  return (
    <div className="vx-orchestrator-lab" role="img" aria-label={T("Agent findings converge into an orchestrator that selects one evidence-seeking follow-up")}>
      <SignalMesh
        inputs={["answer", "trajectory", "concepts", "weakness", "claim check", "reasoning"]}
        center="ORCHESTRATOR"
        outputs={["failure-signal probe", "updated agenda"]}
      />
      <div className="vx-decision-card"><span>{T("DECISION SUMMARY")}</span><p><b>{T("Observed:")}</b> {T("direct ownership and a two-track runtime.")}</p><p><b>{T("Uncertain:")}</b> {T("bottleneck evidence and stale-work safety.")}</p><strong>{T("Ask the failure-signal probe next.")}</strong></div>
    </div>
  );
}

function PreparedVoice() {
  return (
    <div className="vx-voice-cache" role="img" aria-label={T("Prepared question audio is selected from cache and played to the candidate")}>
      <div className="vx-cache-rack"><span>{T("PREPARED AUDIO CACHE")}</span>{[T("architecture probe"), T("ownership probe"), T("failure-signal probe"), T("stale-state probe")].map((item, index) => <i key={item} className={index === 2 ? "is-hit" : ""}><b>0{index + 1}</b><strong>{item}</strong><small>{index === 2 ? T("CACHE HIT") : T("READY")}</small></i>)}</div>
      <div className="vx-voice-output"><i className="vx-speaker"><b /><b /><b /></i><span>{T("ADAPTIVE FOLLOW-UP")}</span><strong>{T("“What signal proved the barrier was the bottleneck?”")}</strong><Waveform bars={28} /><small>{T("acknowledgement → prepared question playback")}</small></div>
      <div className="vx-cache-packet" aria-hidden="true" />
    </div>
  );
}

function RecruiterReport() {
  return (
    <div className="vx-report" role="img" aria-label={T("Fictional Antigravity replay report with evidence, coverage, strengths, risks, and untested dimensions")}>
      <div className="vx-report-head"><div><span>{T("FICTIONAL REPLAY · RECRUITER REPORT")}</span><strong>{T("Jordan Lee · AI Agent Systems Engineer")}</strong></div><i>{T("3 PROBES COMPLETE")}</i></div>
      <div className="vx-report-score"><div><small>{T("EVIDENCE CONFIDENCE")}</small><strong>82%</strong><span><i style={{ "--fill": "82%" } as CSSProperties} /></span></div><div><small>{T("COVERAGE")}</small><strong>72%</strong><span><i style={{ "--fill": "72%" } as CSSProperties} /></span></div><div><small>{T("INTERVIEW QUALITY")}</small><strong>86%</strong><span><i style={{ "--fill": "86%" } as CSSProperties} /></span></div></div>
      <div className="vx-report-body">
        <div><span>{T("OBSERVED STRENGTH")}</span><p>{T("Explained the latency failure, two-track runtime, and epoch guards against stale asynchronous work.")}</p><small>{T("EVIDENCE · FICTIONAL TURNS 01–03")}</small></div>
        <div><span>{T("FOLLOW-UP RISK")}</span><p>{T("Production scale, incident response, and sustained reliability remain untested in this three-turn replay.")}</p><small>{T("UNCERTAINTY PRESERVED")}</small></div>
      </div>
      <div className="vx-report-foot"><span>{T("250+ COMPLETED INTERVIEWS")}</span><strong>{T("Human reviewer owns the decision")}</strong></div>
    </div>
  );
}

export function AntigravityVisual({ active }: VisualProps) {
  return [<CandidateRoom key="room" />, <StreamingSTT key="stt" />, <TrajectoryMap key="trajectory" />, <EvidenceAgents key="agents" />, <OrchestratorDecision key="orchestrator" />, <PreparedVoice key="voice" />, <RecruiterReport key="report" />][active];
}

export function FilmoraOverview({ active, onSelect }: OverviewProps) {
  const glow = useGlowCycle(5);
  return (
    <div className="vx-overview vx-overview-filmora" role="group" aria-label={T("Filmora multi-agent production architecture")}>
      <div className="vx-overview-track vx-overview-track-six">
        <MapNode step={0} kicker={T("INPUT")} title={T("Creative brief")} detail={T("Intent + format + constraints")} glyph="brief" active={active === 0} glow={glow === 0} onSelect={onSelect} />
        <MapLink label={T("research")} />
        <MapNode step={1} kicker={T("CONTEXT")} title={T("Market + product intelligence")} detail={T("700+ research signals + product context")} glyph="sources" active={active >= 1 && active <= 3} glow={glow === 1} onSelect={onSelect} />
        <MapLink label={T("compile")} />
        <MapNode step={4} kicker={T("CONTRACT")} title={T("Prompt compiler")} detail={T("Schema-bound instructions")} glyph="compiler" active={active === 4} glow={glow === 2} onSelect={onSelect} />
        <MapLink label={T("dispatch")} />
        <MapNode step={5} kicker={T("PRODUCTION")} title={T("Agent graph")} detail={T("Parallel editable assets")} glyph="dag" active={active === 5} glow={glow === 3} onSelect={onSelect} />
        <MapLink label={T("assemble")} />
        <MapNode step={6} kicker={T("OUTPUT")} title={T("Filmora timeline")} detail={T("Editor-ready media tracks")} glyph="timeline" active={active === 6} glow={glow === 4} onSelect={onSelect} />
      </div>
      <button className="vx-telemetry-rail" type="button" onClick={() => onSelect(7)} aria-pressed={active === 7} data-active={active === 7}>
        <span>{T("OBSERVABILITY RAIL")}</span><i /><i /><i /><i /><i /><strong>{T("traces · evals · guardrails · latency · cost")}</strong>
      </button>
    </div>
  );
}

function CreativeBrief() {
  return (
    <div className="vx-brief-lab" role="img" aria-label={T("Creative prompt is compiled into a structured production brief")}>
      <div className="vx-prompt-surface"><span>{T("CREATIVE REQUEST")}</span><p>{T("Create a premium 18-second launch reel for a foldable phone—kinetic, product-led, vertical.")}</p><div><i>↵</i></div></div>
      <div className="vx-brief-parser"><i /><i /><i /><span>{T("intent parser")}</span></div>
      <div className="vx-brief-schema">{[[T("FORMAT"), "9:16 · 18s"], [T("MOOD"), T("premium · kinetic")], [T("AUDIENCE"), "mobile-first"], [T("CONSTRAINT"), T("editable assets")]].map(([a,b]) => <i key={a}><small>{a}</small><strong>{b}</strong></i>)}</div>
    </div>
  );
}

const PLATFORMS = ["TikTok", "Douyin", "Xiaohongshu", "Instagram", "WeChat", "Facebook"] as const;
const TREND_MOTIFS = ["device", "macro", "type", "audio", "transition", "palette"] as const;

function TrendResearch() {
  return (
    <div className="vx-trend-lab" role="img" aria-label={T("Trend research agent scans six social platforms and extracts creative signals")}>
      <div className="vx-trend-streams">
        {TD(PLATFORMS).map((platform, platformIndex) => (
          <div
            className="vx-trend-stream"
            key={platform}
            style={{
              "--platform": platformIndex,
              "--platform-pair": Math.floor(platformIndex / 2),
              "--platform-slot": platformIndex % 2,
            } as CSSProperties}
          >
            <span>{platform}</span>
            <div>{Array.from({ length: 3 }, (_, cardIndex) => {
              const motifIndex = (cardIndex + platformIndex) % TREND_MOTIFS.length;
              return <i key={cardIndex} style={{ "--poster": cardIndex + platformIndex } as CSSProperties}><svg viewBox="0 0 120 180" focusable="false"><use href={`/trend-media.svg#${TD(TREND_MOTIFS)[motifIndex]}`} /></svg><b>{["product reveal", "macro detail", "kinetic type", "sound hook", "transition", "color story"][motifIndex]}</b><small>#{["launch", "新品", "aesthetic", "creator", "tech", "reveal"][motifIndex]}</small></i>;
            })}</div>
          </div>
        ))}
      </div>
      <div className="vx-trend-scan"><i /><span>{T("AGENT SCAN")}</span></div>
      <div className="vx-trend-distill"><span>{T("AGENT DISTILLATION")}</span><strong>{T("700+ signals become reusable production context.")}</strong><div><i>{T("trend-skill.md")} <b>✓</b></i><i>{T("design.md")} <b>✓</b></i><i>{T("context.packet")} <b>✓</b></i><i>{T("Filmora params")} <b>✓</b></i></div><small>{T("Original representative media · confidential source content abstracted")}</small></div>
      <div className="vx-trend-extract"><span>{T("700+ CREATIVE SIGNALS")}</span><div><i>{T("hook")}</i><i>{T("audio")}</i><i>{T("palette")}</i><i>{T("tempo")}</i><i>{T("caption")}</i><i>{T("FX")}</i></div></div>
    </div>
  );
}

function MemoryRecommendation() {
  return (
    <div className="vx-memory-lab" role="img" aria-label={T("Brief is vectorized, relevant artifacts are retrieved, and a recommendation layer produces a creative recipe")}>
      <div className="vx-query-vector"><span>{T("QUERY")}</span><strong>{T("premium foldable launch")}</strong><div>{Array.from({ length: 12 }, (_, index) => <i key={index} style={{ "--value": `${22 + ((index * 17) % 72)}%` } as CSSProperties} />)}</div></div>
      <div className="vx-memory-vault"><span>{T("AGENT MEMORY")}</span>{[T("trend-skill.md"), T("design.md"), T("context.packet"), T("filmora.params"), "audio-patterns", "hook-library"].map((item, index) => <i key={item} className={index < 3 ? "is-match" : ""} style={{ "--memory": index } as CSSProperties}><b>{item}</b><small>{index < 3 ? `rank 0${index + 1}` : T("stored")}</small></i>)}</div>
      <SignalMesh inputs={["live trend", "brief", "retrieved memory"]} center="RECOMMEND" outputs={["hook", "audio", "edit recipe"]} accent="violet" />
    </div>
  );
}

function PromptCompiler() {
  return (
    <div className="vx-compiler-lab" role="img" aria-label={T("User intent, trend context, and production state compile into schema-bound agent instructions")}>
      <div className="vx-compiler-inputs"><i><span>{T("USER INTENT")}</span><strong>{T("launch reel")}</strong></i><i><span>{T("TREND CONTEXT")}</span><strong>{T("hook + rhythm")}</strong></i><i><span>{T("PRODUCTION STATE")}</span><strong>{T("assets empty")}</strong></i></div>
      <div className="vx-compiler-core"><span>{T("SEMANTIC CONTEXT COMPILER")}</span><div><i>{T("normalize intent")}</i><i>{T("resolve constraints")}</i><i>{T("bind schemas")}</i><i>{T("version prompt")}</i></div></div>
      <div className="vx-contract-output"><span>{T("EXECUTABLE CONTRACT")}</span><code>{`{\n  "video": { "duration": 18 },\n  "music": { "tempo": "kinetic" },\n  "editor": { "tracks": 6 },\n  "approval": "before_assembly"\n}`}</code></div>
    </div>
  );
}

function ProductionGraph() {
  const agents = ["Video API", "AI Music", "Dialogue / TTS", "Captions", "Transitions / FX", "Editor Assembly"];
  return (
    <div className="vx-production-graph" role="img" aria-label={T("Planner dispatches parallel production tasks to specialist agents and gathers editable assets")}>
      <div className="vx-production-core"><i /><span>{T("PLANNER")}</span><strong>{T("Production DAG")}</strong><small>{T("state checkpoint 04")}</small></div>
      <div className="vx-production-agents">{agents.map((agent, index) => <div key={agent} style={{ "--agent": index } as CSSProperties}><i /><span>{agent}</span><strong>{index === 5 ? T("WAITING") : index === 3 ? T("REVIEW") : T("COMPLETE")}</strong><small>{["video.mp4", "music.wav", "dialogue.wav", "captions.srt", "effects.json", "timeline.project"][index]}</small></div>)}</div>
      <div className="vx-human-gate"><span>{T("HUMAN APPROVAL")}</span><strong>{T("Regenerate music?")}</strong><i>{T("APPROVED")}</i></div>
    </div>
  );
}

function EditorTimeline() {
  return (
    <div className="vx-editor" role="img" aria-label={T("Generated video, dialogue, music, captions, and effects assemble into a Filmora-ready timeline")}>
      <div className="vx-editor-toolbar"><span>{T("FILMORA ASSEMBLY")}</span><i>00:08:14</i><strong>{T("PLAYBACK READY")}</strong></div>
      <div className="vx-editor-preview"><div><i /><span>{T("FOLD THE FUTURE")}</span><small>{T("product reveal · kinetic type")}</small></div></div>
      <div className="vx-editor-timeline"><b aria-hidden="true" />{[[T("VIDEO"), 92], [T("DIALOGUE"), 58], [T("MUSIC"), 82], [T("CAPTIONS"), 70], [T("TRANSITIONS"), 44], [T("FX + META"), 64]].map(([label, width], index) => <div key={String(label)}><span>{label}</span><i style={{ "--track": `${width}%`, "--track-index": index } as CSSProperties}><em /></i></div>)}</div>
    </div>
  );
}

function ObservabilityTrace() {
  const traces = [["request", 0, 98], ["trend agent", 5, 38], ["prompt compiler", 40, 12], ["video generation", 53, 43], ["music generation", 53, 29], ["editor assembly", 84, 13]] as const;
  return (
    <div className="vx-observe" role="img" aria-label={T("Agent traces, evaluations, guardrails, latency, and cost attribution drive workflow optimization")}>
      <div className="vx-observe-metrics"><div><small>{T("API COST")}</small><strong>−28%</strong><span>{T("baseline → optimized")}</span></div><div><small>{T("ORCHESTRATION")}</small><strong>2%</strong><span>{T("of end-to-end generation latency")}</span></div><div><small>{T("SIGNAL CORPUS")}</small><strong>700+</strong><span>{T("creative signals operationalized")}</span></div></div>
      <div className="vx-trace-waterfall"><span>{T("TRACE WATERFALL")}</span>{traces.map(([label, start, width], index) => <div key={label}><small>{label}</small><i style={{ "--trace-start": `${start}%`, "--trace-width": `${width}%`, "--trace": index } as CSSProperties}><b /></i><em>{index === 0 ? T("root") : index === 4 ? T("parallel") : "span"}</em></div>)}</div>
      <div className="vx-eval-loop"><i>{T("trace")}</i><b>→</b><i>{T("agent eval")}</i><b>→</b><i>{T("regression")}</i><b>→</b><i>{T("prompt / config")}</i><b>↺</b></div>
    </div>
  );
}

export function FilmoraVisual({ active }: VisualProps) {
  return [<CreativeBrief key="brief" />, <TrendResearch key="trend" />, <MemoryRecommendation key="memory" />, <PromptCompiler key="compiler" />, <ProductionGraph key="graph" />, <EditorTimeline key="editor" />, <ObservabilityTrace key="observe" />][active];
}

export function MindScapeOverview({ active, onSelect }: OverviewProps) {
  const glow = useGlowCycle(7);
  const nodes = [
    [0, T("CAPTURE"), T("Voice session"), T("WebRTC + rolling buffer"), "capture"],
    [1, T("PERCEIVE"), T("Multimodal signals"), T("text + events + affect"), "perceive"],
    [2, T("FUSE"), T("Behavioral state"), T("gated representation"), "fuse"],
    [3, T("RETRIEVE"), T("Clinical evidence"), T("dense + lexical + rerank"), "retrieve"],
    [4, T("REASON"), T("Grounded hypothesis"), T("evidence + uncertainty"), "reason"],
    [5, T("VALIDATE"), T("Safety gates"), T("NLI + deterministic rules"), "validate"],
    [6, T("REVIEW"), T("Clinician surface"), T("human decision support"), "review"],
  ] as const;
  return (
    <div className="vx-overview vx-overview-mindscape" role="group" aria-label={T("MindScape seven-layer clinical intelligence architecture")}>
      <div className="vx-mind-overview-track">
        {nodes.map(([step, kicker, title, detail, glyph], index) => <div className="vx-mind-overview-unit" key={kicker}><MapNode step={step} kicker={kicker} title={title} detail={detail} glyph={glyph} active={active === step} glow={glow === index} onSelect={onSelect} />{index < nodes.length - 1 ? <MapLink label={index === 2 ? T("BSV") : index === 5 ? T("release") : T("evidence")} /> : null}</div>)}
      </div>
      <div className="vx-mind-feedback" aria-hidden="true"><i /><span>{T("clinician feedback and longitudinal context return to the evidence layer")}</span></div>
    </div>
  );
}

function CaptureBuffer() {
  return (
    <div className="vx-capture" role="img" aria-label={T("WebRTC audio enters a rolling buffer as 16 kHz mono packets")}>
      <div className="vx-capture-source"><i className="vx-mic"><b /><b /></i><span>{T("SIMULATED SESSION")}</span><strong>{T("WebRTC audio")}</strong><small>{T("16 kHz mono")}</small></div>
      <div className="vx-buffer"><span>{T("ROLLING BUFFER")}</span><Waveform bars={42} /><div>{["−1000", "−750", "−500", "−250", T("NOW")].map(item => <i key={item}>{item} ms</i>)}</div><b aria-hidden="true" /></div>
      <div className="vx-capture-packets">{["A-184", "A-185", "A-186", "A-187"].map((item, index) => <i key={item} style={{ "--packet": index } as CSSProperties}>{item}</i>)}</div>
    </div>
  );
}

function MultimodalPerception() {
  return (
    <div className="vx-perception" role="img" aria-label={T("Speech splits into transcript, event token, and acoustic affect branches")}>
      <div className="vx-perception-source"><Waveform bars={20} /><span>{T("SYNCHRONIZED AUDIO")}</span></div>
      <div className="vx-perception-branches">
        <div><span>{T("LINGUISTIC")}</span><strong>{T("“I have not slept well...”")}</strong><small>{T("transcript embeddings")}</small></div>
        <div><span>{T("EVENT TOKENS")}</span><p><i>{T("&lt;silence&gt;")}</i><i>{T("&lt;breath&gt;")}</i><i>{T("&lt;sigh&gt;")}</i></p><small>{T("SenseVoice events")}</small></div>
        <div><span>{T("ACOUSTIC AFFECT")}</span><div className="vx-affect-plane"><i /><b>{T("valence")}</b><em>{T("arousal")}</em></div><small>{T("Emotion2Vec+ representation")}</small></div>
      </div>
    </div>
  );
}

function BehavioralFusion() {
  return (
    <div className="vx-fusion" role="img" aria-label={T("Text, event, and affect features pass through gated multimodal fusion into a Behavioral State Vector")}>
      <div className="vx-fusion-inputs"><i><span>{T("TEXT")}</span><b>768d</b></i><i><span>{T("EVENTS")}</span><b>{T("sparse")}</b></i><i><span>{T("AFFECT")}</span><b>1024d</b></i></div>
      <SignalMesh inputs={["linguistic", "events", "valence", "arousal", "longitudinal state"]} center="GMU FUSION" outputs={["Behavioral State Vector"]} accent="cyan" />
      <div className="vx-bsv"><span>{T("BEHAVIORAL STATE VECTOR")}</span><div>{Array.from({ length: 18 }, (_, index) => <i key={index} style={{ "--vector": `${18 + ((index * 29) % 74)}%` } as CSSProperties} />)}</div><strong>{T("Reusable patient-state representation")}</strong></div>
    </div>
  );
}

function HybridRetrieval() {
  return (
    <div className="vx-retrieval" role="img" aria-label={T("Dense and lexical retrieval merge through reciprocal-rank fusion and reranking into a top-five evidence set")}>
      <div className="vx-retrieval-query"><span>{T("QUERY STATE")}</span><strong>{T("sleep disruption + affect change")}</strong><small>{T("BSV + transcript evidence")}</small></div>
      <div className="vx-retrieval-dual">
        <div><span>{T("DENSE / MedCPT")}</span><div className="vx-hnsw">{Array.from({ length: 16 }, (_, index) => <i key={index} className={[2,7,11].includes(index) ? "is-hit" : ""} style={{ "--point": index } as CSSProperties} />)}</div><small>{T("HNSW / FAISS neighbors")}</small></div>
        <div><span>{T("LEXICAL / BM25")}</span><div className="vx-bm25">{[88,73,61,48,39].map((value,index) => <i key={value}><b>0{index+1}</b><em style={{ "--score": `${value}%` } as CSSProperties} /><small>{value}</small></i>)}</div><small>{T("exact clinical terms")}</small></div>
      </div>
      <div className="vx-rank-fusion"><i>{T("DENSE")}</i><i>{T("LEXICAL")}</i><b>{T("RRF")}</b><strong>{T("BioLinkBERT rerank")}</strong><span>{T("TOP 5 EVIDENCE")}</span></div>
    </div>
  );
}

function GroundedReasoning() {
  return (
    <div className="vx-grounding" role="img" aria-label={T("Ranked evidence becomes a structured hypothesis with citations, uncertainty, and follow-up questions")}>
      <div className="vx-evidence-stack">{[T("E01 · sleep duration change"), T("E02 · speech affect shift"), T("E03 · DSM-aligned context"), T("E04 · longitudinal baseline"), T("E05 · event-token pattern")].map((item,index) => <i key={item} style={{ "--evidence": index } as CSSProperties}><span>{item}</span><small>{T("rank")} {index+1}</small></i>)}</div>
      <div className="vx-grounding-core"><i /><span>{T("EVIDENCE-GROUNDED REASONING")}</span><strong>{T("Structured hypothesis")}</strong><p>{T("Signals support a follow-up about duration, functional impact, and alternative explanations.")}</p></div>
      <div className="vx-hypothesis"><span>{T("OUTPUT")}</span><div><i><b>{T("hypothesis")}</b><small>{T("bounded")}</small></i><i><b>{T("uncertainty")}</b><small>{T("visible")}</small></i><i><b>follow-ups</b><small>{T("3 questions")}</small></i></div></div>
    </div>
  );
}

function ValidationGates() {
  return (
    <div className="vx-validation" role="img" aria-label={T("NLI and deterministic DSM-aligned rules validate evidence support before releasing clinician-facing output")}>
      {/* The state key stays English: CSS colours the amber/red verdicts off
          data-state, and a translated value would never match the selector. */}
      <div className="vx-nli-matrix"><span>{T("DeBERTa-v3 NLI")}</span>{([["sleep evidence", "entailed"], ["duration claim", "uncertain"], ["diagnostic claim", "blocked"]] as const).map(([claim,state]) => <i key={claim} data-state={state}><b>{T(claim)}</b><small>{T(state)}</small></i>)}</div>
      <div className="vx-rule-engine"><span>{T("DSM-ALIGNED RULE ENGINE")}</span>{[T("evidence cited"), T("minimum context"), T("unsupported diagnosis"), T("confidence gate")].map((item,index) => <i key={item} data-state={index===2 ? "blocked" : "pass"}><b>{index===2 ? "×" : "✓"}</b><strong>{item}</strong></i>)}</div>
      <div className="vx-release-gate"><i /><span>{T("SAFE OUTPUT GATE")}</span><strong>{T("Release with uncertainty")}</strong><small>{T("unsupported diagnostic language removed")}</small></div>
    </div>
  );
}

function ClinicianReview() {
  return (
    <div className="vx-clinician" role="img" aria-label={T("Clinician review interface keeps evidence, hypothesis, uncertainty, and follow-up questions visible together")}>
      <div className="vx-clinician-top"><span>{T("MINDSCAPE · SESSION REVIEW")}</span><i>{T("CLINICIAN DECISION SUPPORT")}</i></div>
      <div className="vx-clinician-grid">
        <div className="vx-clinician-state"><span>{T("BEHAVIORAL STATE")}</span><div className="vx-radar"><i /><i /><i /><b /></div><small>{T("affect · language · events · longitudinal shift")}</small></div>
        <div className="vx-clinician-hypothesis"><span>{T("GROUNDED HYPOTHESIS")}</span><p>{T("Sleep disruption and affect change warrant structured follow-up; available evidence is insufficient for an autonomous diagnosis.")}</p><div><i>E01</i><i>E02</i><i>E04</i></div></div>
        <div className="vx-clinician-followup"><span>{T("FOLLOW-UP")}</span><strong>{T("Clarify duration and functional impact.")}</strong><small>{T("uncertainty: moderate · evidence: 3 citations")}</small></div>
      </div>
      <div className="vx-clinician-foot"><span>{T("SYNTHETIC CLINICAL WORKFLOW")}</span><strong>{T("Clinician reviews, edits, and owns the decision")}</strong></div>
    </div>
  );
}

export function MindScapeVisual({ active }: VisualProps) {
  return [<CaptureBuffer key="capture" />, <MultimodalPerception key="perceive" />, <BehavioralFusion key="fusion" />, <HybridRetrieval key="retrieve" />, <GroundedReasoning key="reason" />, <ValidationGates key="validate" />, <ClinicianReview key="review" />][active];
}

export function LogisticsVisual({ active }: VisualProps) {
  return (
    <div className="vx-logistics-console" data-state={active} role="img" aria-label={T("Role-aware logistics copilot classifies intent, runs an approved query contract, and summarizes returned rows")}>
      <div className="vx-logistics-top"><span>{T("CONTROL TOWER / AI OPERATIONS")}</span><i>{T("ADMIN · AUTHORIZED")}</i></div>
      <div className="vx-logistics-prompt">{T("Which routes are at highest risk today?")}<b /></div>
      <div className="vx-logistics-flow">
        <div data-active={active >= 0}><span>01</span><small>{T("INTENT ROUTER")}</small><strong>high_risk_routes</strong><i>{T("role + schema checked")}</i></div>
        <em aria-hidden="true" />
        <div data-active={active >= 1}><span>02</span><small>{T("APPROVED HANDLER")}</small><strong>{T("Parameterized query")}</strong><i>{T("bounded rows only")}</i></div>
        <em aria-hidden="true" />
        <div data-active={active >= 2}><span>03</span><small>{T("AI RESPONSE")}</small><strong>{T("Evidence + next action")}</strong><i>{T("no raw database access")}</i></div>
      </div>
      <div className="vx-logistics-result" data-visible={active === 2}><span>{T("ROUTE R-104 · HIGH ATTENTION")}</span><p>{T("Weather and condition reports indicate elevated delay risk. Review the latest driver report before changing the assignment.")}</p><small>{T("Model context: 4 returned rows · 0 unrestricted queries")}</small></div>
    </div>
  );
}

export function ResearchMiniVisual({ index }: { index: number }) {
  if (index === 0) {
    return <div className="vx-research-mini vx-tinyml-mini" role="img" aria-label={T("Audio becomes log-Mel and MFCC features, passes through a YAMNet-derived classifier, compresses to INT8, and runs on the SoC")}><span>{T("EDGE AUDIO PIPELINE")}</span><div className="vx-mini-audio"><Waveform bars={13} /></div><b>→</b><div className="vx-mini-spectrum">{Array.from({ length: 18 }, (_, cell) => <i key={cell} style={{ "--cell": cell } as CSSProperties} />)}<small>{T("log-Mel · MFCC")}</small></div><b>→</b><div className="vx-mini-network">{Array.from({ length: 10 }, (_, node) => <i key={node} />)}<small>{T("YAMNet-derived")}</small></div><b>→</b><div className="vx-mini-chip"><strong>{T("INT8")}</strong><small>{T("SoC NPU")}</small></div><footer><em>93%+</em><em>{T("&lt;10 ms")}</em><em>{T("14× compression")}</em></footer></div>;
  }
  if (index === 1) {
    return <div className="vx-research-mini vx-sql-mini" role="img" aria-label={T("Question and visual context are grounded with OCR, matched to schema, compiled into SQL, and checked by database execution")}><span>{T("EXECUTION-GROUNDED TEXT-TO-SQL")}</span><div className="vx-mini-vqa"><i>Q</i><i>{T("IMG")}</i><small>{T("OCR + intent")}</small></div><b>→</b><div className="vx-mini-schema"><i /><i /><i /><small>{T("schema subset")}</small></div><b>→</b><div className="vx-mini-code"><code>{T("SELECT route_id")}<br />{T("FROM evidence")}<br />{T("WHERE risk = ?")}</code></div><b>→</b><div className="vx-mini-ex"><strong>{T("EX ✓")}</strong><small>{T("execute + diagnose")}</small></div><footer><em>{T("12,751+ pairs")}</em><em>{T("95+ databases")}</em></footer></div>;
  }
  return <div className="vx-research-mini vx-eval-mini" role="img" aria-label={T("Synthetic examples pass through an LLM judge, accepted data trains a small model, and paired outputs are evaluated")}><span>{T("DISTILLATION QUALITY GATE")}</span><div className="vx-mini-samples"><i>{T("sample 01")}</i><i>{T("sample 02")}</i><i>{T("sample 03")}</i></div><b>→</b><div className="vx-mini-judge"><i data-state="pass">✓</i><i data-state="fail">×</i><small>{T("LLM judge")}</small></div><b>→</b><div className="vx-mini-student"><strong>{T("SLM")}</strong><small>{T("TRL distill")}</small></div><b>→</b><div className="vx-mini-eval"><i><b style={{ "--eval": "82%" } as CSSProperties} /></i><i><b style={{ "--eval": "64%" } as CSSProperties} /></i><small>{T("paired eval")}</small></div><footer><em>{T("31% fewer factual errors")}</em><em>{T("200+ response pairs")}</em></footer></div>;
}
