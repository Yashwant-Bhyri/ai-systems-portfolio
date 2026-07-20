"use client";

import { useEffect, useState, type CSSProperties } from "react";

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
      <div className={`vx-map-glyph vx-map-glyph-${glyph}`} aria-hidden="true">{Array.from({ length: 7 }, (_, index) => <i key={index} />)}</div>
      <strong>{title}</strong>
      <small>{detail}</small>
      <i aria-hidden="true" />
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
    <div className="vx-overview vx-overview-antigravity" role="group" aria-label="Antigravity high-level architecture">
      <div className="vx-overview-track">
        <MapNode step={0} kicker="INPUT" title="Candidate answer" detail="Live voice + turn state" glyph="voice" active={active === 0} glow={glow === 0} onSelect={onSelect} />
        <MapLink label="audio" />
        <MapNode step={1} kicker="INGRESS" title="Streaming speech-to-text" detail="Partial → final transcript" glyph="transcript" active={active === 1} glow={glow === 1} onSelect={onSelect} />
        <MapLink label="turn packet" />
        <MapNode step={5} kicker="INTELLIGENCE" title="Interview orchestrator" detail="Parallel evidence → next route" glyph="agents" active={active >= 2 && active <= 5} glow={glow === 2} onSelect={onSelect} />
        <MapLink label="question" />
        <MapNode step={6} kicker="OUTPUT" title="Prepared response audio" detail="Cached TTS + playback" glyph="audio" active={active === 6} glow={glow === 3} onSelect={onSelect} />
      </div>
      <div className="vx-overview-return" aria-hidden="true"><i /><span>adaptive follow-up returns to the candidate</span></div>
      <button className="vx-evidence-rail" type="button" onClick={() => onSelect(7)} aria-pressed={active === 7} data-active={active === 7}>
        <span>EVIDENCE RAIL</span><strong>Every turn compounds into the recruiter report</strong>
        <div><i>concepts</i><i>weaknesses</i><i>claim checks</i><i>reasoning</i><i>coverage</i></div>
      </button>
      <div className="vx-map-packet vx-map-packet-antigravity" aria-hidden="true" />
    </div>
  );
}

function CandidateRoom() {
  return (
    <div className="vx-room" role="img" aria-label="Live Antigravity interview room with candidate voice input">
      <div className="vx-room-top"><span><i /> FICTIONAL REPLAY · INTERVIEW LIVE</span><small>AI AGENT SYSTEMS ENGINEER · TURN 01</small></div>
      <div className="vx-room-question"><small>OWNERSHIP + FAILURE PROBE</small><strong>What did you personally own—and where did the first design fail?</strong></div>
      <div className="vx-room-people">
        <div className="vx-room-person"><i className="vx-avatar"><b /><b /><em /></i><span>Jordan Lee</span><small>Fictional candidate speaking</small></div>
        <div className="vx-room-signal"><Waveform bars={36} /><span>VOICE STREAM</span></div>
        <div className="vx-room-person vx-room-ai"><i className="vx-avatar"><b /><b /><em /></i><span>Antigravity</span><small>Listening + preparing</small></div>
      </div>
      <div className="vx-room-footer"><span>00:42</span><i>turn ownership locked</i><strong>LIVE TRANSCRIPT ↗</strong></div>
    </div>
  );
}

function StreamingSTT() {
  const tokens = ["I", "owned", "the", "orchestration", "boundary,", "typed", "tool", "contracts,", "and", "latency", "instrumentation"];
  return (
    <div className="vx-stt-lab" role="img" aria-label="Streaming speech-to-text partial tokens becoming a final transcript">
      <div className="vx-stt-source"><span>16 kHz voice</span><Waveform bars={32} /><small>continuous audio frames</small></div>
      <div className="vx-stt-stream">
        <span>PARTIAL TRANSCRIPT</span>
        <p>{tokens.map((token, index) => <i key={`${token}-${index}`} style={{ "--token": index } as CSSProperties}>{token}</i>)}</p>
        <small>provisional words revise while the candidate speaks</small>
      </div>
      <div className="vx-stt-lock"><i /><span>FINAL TURN</span><strong>Transcript committed</strong><small>turn_id · timestamps · entities</small></div>
      <div className="vx-flow-pulse" aria-hidden="true" />
    </div>
  );
}

function TrajectoryMap() {
  return (
    <div className="vx-trajectory" role="img" aria-label="Trajectory map selects the next prepared question from semantic evidence">
      <div className="vx-tree-root"><span>CURRENT EVIDENCE</span><strong>Owned the orchestration boundary</strong><small>failure mechanism needs verification</small></div>
      <div className="vx-tree-stem" aria-hidden="true" />
      <div className="vx-tree-branches">
        <div><span>architecture depth</span><strong>Explain the two-track runtime</strong><small>mechanism already described</small></div>
        <div className="is-selected"><span>failure evidence</span><strong>What signal proved the bottleneck?</strong><small>highest evidence gain</small></div>
        <div><span>stale-state safety</span><strong>How is late work rejected?</strong><small>stage for the next probe</small></div>
      </div>
      <div className="vx-route-result"><span>FOREGROUND QUESTION PATH</span><strong>Failure-signal probe selected</strong><small>prepared route · bounded guard passed</small></div>
    </div>
  );
}

function EvidenceAgents() {
  return (
    <div className="vx-evidence-agents" role="img" aria-label="Four parallel evidence agents analyze concept coverage, weaknesses, discrepancies, and reasoning behavior">
      <div className="vx-agent-cell vx-concept-agent"><span>CONCEPT AGENT</span><div><i>orchestration</i><i>latency</i><i>state</i><i>evaluation</i></div><strong>3 covered · 1 open</strong></div>
      <div className="vx-agent-cell vx-weakness-agent"><span>WEAKNESS AGENT</span><p>failure signal</p><div><i /><i /><i /><i /></div><strong>Trace evidence still missing</strong></div>
      <div className="vx-agent-cell vx-discrepancy-agent"><span>DISCREPANCY AGENT</span><div><i><b>Owned orchestration</b><em>supported</em></i><i><b>Typed tool contracts</b><em>supported</em></i><i><b>Production scale</b><em>untested</em></i></div></div>
      <div className="vx-agent-cell vx-reasoning-agent"><span>REASONING AGENT</span><div><i>assumptions</i><i>trade-offs</i><i>edge cases</i><i>self-correction</i></div><strong>Trade-off evidence found</strong></div>
      <div className="vx-agent-sync"><i /><i /><i /><i /><span>parallel typed findings</span></div>
    </div>
  );
}

function OrchestratorDecision() {
  return (
    <div className="vx-orchestrator-lab" role="img" aria-label="Agent findings converge into an orchestrator that selects one evidence-seeking follow-up">
      <SignalMesh
        inputs={["answer", "trajectory", "concepts", "weakness", "claim check", "reasoning"]}
        center="ORCHESTRATOR"
        outputs={["failure-signal probe", "updated agenda"]}
      />
      <div className="vx-decision-card"><span>DECISION SUMMARY</span><p><b>Observed:</b> direct ownership and a two-track runtime.</p><p><b>Uncertain:</b> bottleneck evidence and stale-work safety.</p><strong>Ask the failure-signal probe next.</strong></div>
    </div>
  );
}

function PreparedVoice() {
  return (
    <div className="vx-voice-cache" role="img" aria-label="Prepared question audio is selected from cache and played to the candidate">
      <div className="vx-cache-rack"><span>PREPARED AUDIO CACHE</span>{["architecture probe", "ownership probe", "failure-signal probe", "stale-state probe"].map((item, index) => <i key={item} className={index === 2 ? "is-hit" : ""}><b>0{index + 1}</b><strong>{item}</strong><small>{index === 2 ? "CACHE HIT" : "READY"}</small></i>)}</div>
      <div className="vx-voice-output"><i className="vx-speaker"><b /><b /><b /></i><span>ADAPTIVE FOLLOW-UP</span><strong>“What signal proved the barrier was the bottleneck?”</strong><Waveform bars={28} /><small>acknowledgement → prepared question playback</small></div>
      <div className="vx-cache-packet" aria-hidden="true" />
    </div>
  );
}

function RecruiterReport() {
  return (
    <div className="vx-report" role="img" aria-label="Fictional Antigravity replay report with evidence, coverage, strengths, risks, and untested dimensions">
      <div className="vx-report-head"><div><span>FICTIONAL REPLAY · RECRUITER REPORT</span><strong>Jordan Lee · AI Agent Systems Engineer</strong></div><i>3 PROBES COMPLETE</i></div>
      <div className="vx-report-score"><div><small>EVIDENCE CONFIDENCE</small><strong>82%</strong><span><i style={{ "--fill": "82%" } as CSSProperties} /></span></div><div><small>COVERAGE</small><strong>72%</strong><span><i style={{ "--fill": "72%" } as CSSProperties} /></span></div><div><small>INTERVIEW QUALITY</small><strong>86%</strong><span><i style={{ "--fill": "86%" } as CSSProperties} /></span></div></div>
      <div className="vx-report-body">
        <div><span>OBSERVED STRENGTH</span><p>Explained the latency failure, two-track runtime, and epoch guards against stale asynchronous work.</p><small>EVIDENCE · FICTIONAL TURNS 01–03</small></div>
        <div><span>FOLLOW-UP RISK</span><p>Production scale, incident response, and sustained reliability remain untested in this three-turn replay.</p><small>UNCERTAINTY PRESERVED</small></div>
      </div>
      <div className="vx-report-foot"><span>250+ COMPLETED INTERVIEWS</span><strong>Human reviewer owns the decision</strong></div>
    </div>
  );
}

export function AntigravityVisual({ active }: VisualProps) {
  return [<CandidateRoom key="room" />, <StreamingSTT key="stt" />, <TrajectoryMap key="trajectory" />, <EvidenceAgents key="agents" />, <OrchestratorDecision key="orchestrator" />, <PreparedVoice key="voice" />, <RecruiterReport key="report" />][active];
}

export function FilmoraOverview({ active, onSelect }: OverviewProps) {
  const glow = useGlowCycle(5);
  return (
    <div className="vx-overview vx-overview-filmora" role="group" aria-label="Filmora multi-agent production architecture">
      <div className="vx-overview-track vx-overview-track-six">
        <MapNode step={0} kicker="INPUT" title="Creative brief" detail="Intent + format + constraints" glyph="brief" active={active === 0} glow={glow === 0} onSelect={onSelect} />
        <MapLink label="research" />
        <MapNode step={1} kicker="CONTEXT" title="Trend intelligence" detail="700+ creative signals" glyph="sources" active={active >= 1 && active <= 3} glow={glow === 1} onSelect={onSelect} />
        <MapLink label="compile" />
        <MapNode step={4} kicker="CONTRACT" title="Prompt compiler" detail="Schema-bound instructions" glyph="compiler" active={active === 4} glow={glow === 2} onSelect={onSelect} />
        <MapLink label="dispatch" />
        <MapNode step={5} kicker="PRODUCTION" title="Agent graph" detail="Parallel editable assets" glyph="dag" active={active === 5} glow={glow === 3} onSelect={onSelect} />
        <MapLink label="assemble" />
        <MapNode step={6} kicker="OUTPUT" title="Filmora timeline" detail="Editor-ready media tracks" glyph="timeline" active={active === 6} glow={glow === 4} onSelect={onSelect} />
      </div>
      <button className="vx-telemetry-rail" type="button" onClick={() => onSelect(7)} aria-pressed={active === 7} data-active={active === 7}>
        <span>OBSERVABILITY RAIL</span><i /><i /><i /><i /><i /><strong>traces · evals · guardrails · latency · cost</strong>
      </button>
      <div className="vx-map-packet vx-map-packet-filmora" aria-hidden="true" />
    </div>
  );
}

function CreativeBrief() {
  return (
    <div className="vx-brief-lab" role="img" aria-label="Creative prompt is compiled into a structured production brief">
      <div className="vx-prompt-surface"><span>CREATIVE REQUEST</span><p>Create a premium 18-second launch reel for a foldable phone—kinetic, product-led, vertical.</p><div><i>↵</i></div></div>
      <div className="vx-brief-parser"><i /><i /><i /><span>intent parser</span></div>
      <div className="vx-brief-schema">{[["FORMAT", "9:16 · 18s"], ["MOOD", "premium · kinetic"], ["AUDIENCE", "mobile-first"], ["CONSTRAINT", "editable assets"]].map(([a,b]) => <i key={a}><small>{a}</small><strong>{b}</strong></i>)}</div>
    </div>
  );
}

const PLATFORMS = ["TikTok", "Douyin", "Xiaohongshu", "Instagram", "WeChat", "Facebook"] as const;
const TREND_MOTIFS = ["device", "macro", "type", "audio", "transition", "palette"] as const;

function TrendResearch() {
  return (
    <div className="vx-trend-lab" role="img" aria-label="Trend research agent scans six social platforms and extracts creative signals">
      <div className="vx-trend-streams">
        {PLATFORMS.map((platform, platformIndex) => (
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
              return <i key={cardIndex} style={{ "--poster": cardIndex + platformIndex } as CSSProperties}><svg viewBox="0 0 120 180" focusable="false"><use href={`/trend-media.svg#${TREND_MOTIFS[motifIndex]}`} /></svg><b>{["product reveal", "macro detail", "kinetic type", "sound hook", "transition", "color story"][motifIndex]}</b><small>#{["launch", "新品", "aesthetic", "creator", "tech", "reveal"][motifIndex]}</small></i>;
            })}</div>
          </div>
        ))}
      </div>
      <div className="vx-trend-scan"><i /><span>AGENT SCAN</span></div>
      <div className="vx-trend-distill"><span>AGENT DISTILLATION</span><strong>700+ signals become reusable production context.</strong><div><i>trend-skill.md <b>✓</b></i><i>design.md <b>✓</b></i><i>context.packet <b>✓</b></i><i>Filmora params <b>✓</b></i></div><small>Original representative media · confidential source content abstracted</small></div>
      <div className="vx-trend-extract"><span>700+ CREATIVE SIGNALS</span><div><i>hook</i><i>audio</i><i>palette</i><i>tempo</i><i>caption</i><i>FX</i></div></div>
    </div>
  );
}

function MemoryRecommendation() {
  return (
    <div className="vx-memory-lab" role="img" aria-label="Brief is vectorized, relevant artifacts are retrieved, and a recommendation layer produces a creative recipe">
      <div className="vx-query-vector"><span>QUERY</span><strong>premium foldable launch</strong><div>{Array.from({ length: 12 }, (_, index) => <i key={index} style={{ "--value": `${22 + ((index * 17) % 72)}%` } as CSSProperties} />)}</div></div>
      <div className="vx-memory-vault"><span>AGENT MEMORY</span>{["trend-skill.md", "design.md", "context.packet", "filmora.params", "audio-patterns", "hook-library"].map((item, index) => <i key={item} className={index < 3 ? "is-match" : ""} style={{ "--memory": index } as CSSProperties}><b>{item}</b><small>{index < 3 ? `rank 0${index + 1}` : "stored"}</small></i>)}</div>
      <SignalMesh inputs={["live trend", "brief", "retrieved memory"]} center="RECOMMEND" outputs={["hook", "audio", "edit recipe"]} accent="violet" />
    </div>
  );
}

function PromptCompiler() {
  return (
    <div className="vx-compiler-lab" role="img" aria-label="User intent, trend context, and production state compile into schema-bound agent instructions">
      <div className="vx-compiler-inputs"><i><span>USER INTENT</span><strong>launch reel</strong></i><i><span>TREND CONTEXT</span><strong>hook + rhythm</strong></i><i><span>PRODUCTION STATE</span><strong>assets empty</strong></i></div>
      <div className="vx-compiler-core"><span>SEMANTIC CONTEXT COMPILER</span><div><i>normalize intent</i><i>resolve constraints</i><i>bind schemas</i><i>version prompt</i></div></div>
      <div className="vx-contract-output"><span>EXECUTABLE CONTRACT</span><code>{`{\n  "video": { "duration": 18 },\n  "music": { "tempo": "kinetic" },\n  "editor": { "tracks": 6 },\n  "approval": "before_assembly"\n}`}</code></div>
    </div>
  );
}

function ProductionGraph() {
  const agents = ["Video API", "AI Music", "Dialogue / TTS", "Captions", "Transitions / FX", "Editor Assembly"];
  return (
    <div className="vx-production-graph" role="img" aria-label="Planner dispatches parallel production tasks to specialist agents and gathers editable assets">
      <div className="vx-production-core"><i /><span>PLANNER</span><strong>Production DAG</strong><small>state checkpoint 04</small></div>
      <div className="vx-production-agents">{agents.map((agent, index) => <div key={agent} style={{ "--agent": index } as CSSProperties}><i /><span>{agent}</span><strong>{index === 5 ? "WAITING" : index === 3 ? "REVIEW" : "COMPLETE"}</strong><small>{["video.mp4", "music.wav", "dialogue.wav", "captions.srt", "effects.json", "timeline.project"][index]}</small></div>)}</div>
      <div className="vx-human-gate"><span>HUMAN APPROVAL</span><strong>Regenerate music?</strong><i>APPROVED</i></div>
    </div>
  );
}

function EditorTimeline() {
  return (
    <div className="vx-editor" role="img" aria-label="Generated video, dialogue, music, captions, and effects assemble into a Filmora-ready timeline">
      <div className="vx-editor-toolbar"><span>FILMORA ASSEMBLY</span><i>00:08:14</i><strong>PLAYBACK READY</strong></div>
      <div className="vx-editor-preview"><div><i /><span>FOLD THE FUTURE</span><small>product reveal · kinetic type</small></div></div>
      <div className="vx-editor-timeline"><b aria-hidden="true" />{[["VIDEO", 92], ["DIALOGUE", 58], ["MUSIC", 82], ["CAPTIONS", 70], ["TRANSITIONS", 44], ["FX + META", 64]].map(([label, width], index) => <div key={String(label)}><span>{label}</span><i style={{ "--track": `${width}%`, "--track-index": index } as CSSProperties}><em /></i></div>)}</div>
    </div>
  );
}

function ObservabilityTrace() {
  const traces = [["request", 0, 98], ["trend agent", 5, 38], ["prompt compiler", 40, 12], ["video generation", 53, 43], ["music generation", 53, 29], ["editor assembly", 84, 13]] as const;
  return (
    <div className="vx-observe" role="img" aria-label="Agent traces, evaluations, guardrails, latency, and cost attribution drive workflow optimization">
      <div className="vx-observe-metrics"><div><small>API COST</small><strong>−28%</strong><span>baseline → optimized</span></div><div><small>ORCHESTRATION</small><strong>2%</strong><span>of end-to-end generation latency</span></div><div><small>SIGNAL CORPUS</small><strong>700+</strong><span>creative signals operationalized</span></div></div>
      <div className="vx-trace-waterfall"><span>TRACE WATERFALL</span>{traces.map(([label, start, width], index) => <div key={label}><small>{label}</small><i style={{ "--trace-start": `${start}%`, "--trace-width": `${width}%`, "--trace": index } as CSSProperties}><b /></i><em>{index === 0 ? "root" : index === 4 ? "parallel" : "span"}</em></div>)}</div>
      <div className="vx-eval-loop"><i>trace</i><b>→</b><i>agent eval</i><b>→</b><i>regression</i><b>→</b><i>prompt / config</i><b>↺</b></div>
    </div>
  );
}

export function FilmoraVisual({ active }: VisualProps) {
  return [<CreativeBrief key="brief" />, <TrendResearch key="trend" />, <MemoryRecommendation key="memory" />, <PromptCompiler key="compiler" />, <ProductionGraph key="graph" />, <EditorTimeline key="editor" />, <ObservabilityTrace key="observe" />][active];
}

export function MindScapeOverview({ active, onSelect }: OverviewProps) {
  const glow = useGlowCycle(7);
  const nodes = [
    [0, "CAPTURE", "Voice session", "WebRTC + rolling buffer", "capture"],
    [1, "PERCEIVE", "Multimodal signals", "text + events + affect", "perceive"],
    [2, "FUSE", "Behavioral state", "gated representation", "fuse"],
    [3, "RETRIEVE", "Clinical evidence", "dense + lexical + rerank", "retrieve"],
    [4, "REASON", "Grounded hypothesis", "evidence + uncertainty", "reason"],
    [5, "VALIDATE", "Safety gates", "NLI + deterministic rules", "validate"],
    [6, "REVIEW", "Clinician surface", "human decision support", "review"],
  ] as const;
  return (
    <div className="vx-overview vx-overview-mindscape" role="group" aria-label="MindScape seven-layer clinical intelligence architecture">
      <div className="vx-mind-overview-track">
        {nodes.map(([step, kicker, title, detail, glyph], index) => <div className="vx-mind-overview-unit" key={kicker}><MapNode step={step} kicker={kicker} title={title} detail={detail} glyph={glyph} active={active === step} glow={glow === index} onSelect={onSelect} />{index < nodes.length - 1 ? <MapLink label={index === 2 ? "BSV" : index === 5 ? "release" : "evidence"} /> : null}</div>)}
      </div>
      <div className="vx-mind-feedback" aria-hidden="true"><i /><span>clinician feedback and longitudinal context return to the evidence layer</span></div>
      <div className="vx-map-packet vx-map-packet-mindscape" aria-hidden="true" />
    </div>
  );
}

function CaptureBuffer() {
  return (
    <div className="vx-capture" role="img" aria-label="WebRTC audio enters a rolling buffer as 16 kHz mono packets">
      <div className="vx-capture-source"><i className="vx-mic"><b /><b /></i><span>SIMULATED SESSION</span><strong>WebRTC audio</strong><small>16 kHz mono</small></div>
      <div className="vx-buffer"><span>ROLLING BUFFER</span><Waveform bars={42} /><div>{["−1000", "−750", "−500", "−250", "NOW"].map(item => <i key={item}>{item} ms</i>)}</div><b aria-hidden="true" /></div>
      <div className="vx-capture-packets">{["A-184", "A-185", "A-186", "A-187"].map((item, index) => <i key={item} style={{ "--packet": index } as CSSProperties}>{item}</i>)}</div>
    </div>
  );
}

function MultimodalPerception() {
  return (
    <div className="vx-perception" role="img" aria-label="Speech splits into transcript, event token, and acoustic affect branches">
      <div className="vx-perception-source"><Waveform bars={20} /><span>SYNCHRONIZED AUDIO</span></div>
      <div className="vx-perception-branches">
        <div><span>LINGUISTIC</span><strong>“I have not slept well...”</strong><small>transcript embeddings</small></div>
        <div><span>EVENT TOKENS</span><p><i>&lt;silence&gt;</i><i>&lt;breath&gt;</i><i>&lt;sigh&gt;</i></p><small>SenseVoice events</small></div>
        <div><span>ACOUSTIC AFFECT</span><div className="vx-affect-plane"><i /><b>valence</b><em>arousal</em></div><small>Emotion2Vec+ representation</small></div>
      </div>
    </div>
  );
}

function BehavioralFusion() {
  return (
    <div className="vx-fusion" role="img" aria-label="Text, event, and affect features pass through gated multimodal fusion into a Behavioral State Vector">
      <div className="vx-fusion-inputs"><i><span>TEXT</span><b>768d</b></i><i><span>EVENTS</span><b>sparse</b></i><i><span>AFFECT</span><b>1024d</b></i></div>
      <SignalMesh inputs={["linguistic", "events", "valence", "arousal", "longitudinal state"]} center="GMU FUSION" outputs={["Behavioral State Vector"]} accent="cyan" />
      <div className="vx-bsv"><span>BEHAVIORAL STATE VECTOR</span><div>{Array.from({ length: 18 }, (_, index) => <i key={index} style={{ "--vector": `${18 + ((index * 29) % 74)}%` } as CSSProperties} />)}</div><strong>Reusable patient-state representation</strong></div>
    </div>
  );
}

function HybridRetrieval() {
  return (
    <div className="vx-retrieval" role="img" aria-label="Dense and lexical retrieval merge through reciprocal-rank fusion and reranking into a top-five evidence set">
      <div className="vx-retrieval-query"><span>QUERY STATE</span><strong>sleep disruption + affect change</strong><small>BSV + transcript evidence</small></div>
      <div className="vx-retrieval-dual">
        <div><span>DENSE / MedCPT</span><div className="vx-hnsw">{Array.from({ length: 16 }, (_, index) => <i key={index} className={[2,7,11].includes(index) ? "is-hit" : ""} style={{ "--point": index } as CSSProperties} />)}</div><small>HNSW / FAISS neighbors</small></div>
        <div><span>LEXICAL / BM25</span><div className="vx-bm25">{[88,73,61,48,39].map((value,index) => <i key={value}><b>0{index+1}</b><em style={{ "--score": `${value}%` } as CSSProperties} /><small>{value}</small></i>)}</div><small>exact clinical terms</small></div>
      </div>
      <div className="vx-rank-fusion"><i>DENSE</i><i>LEXICAL</i><b>RRF</b><strong>BioLinkBERT rerank</strong><span>TOP 5 EVIDENCE</span></div>
    </div>
  );
}

function GroundedReasoning() {
  return (
    <div className="vx-grounding" role="img" aria-label="Ranked evidence becomes a structured hypothesis with citations, uncertainty, and follow-up questions">
      <div className="vx-evidence-stack">{["E01 · sleep duration change", "E02 · speech affect shift", "E03 · DSM-aligned context", "E04 · longitudinal baseline", "E05 · event-token pattern"].map((item,index) => <i key={item} style={{ "--evidence": index } as CSSProperties}><span>{item}</span><small>rank {index+1}</small></i>)}</div>
      <div className="vx-grounding-core"><i /><span>EVIDENCE-GROUNDED REASONING</span><strong>Structured hypothesis</strong><p>Signals support a follow-up about duration, functional impact, and alternative explanations.</p></div>
      <div className="vx-hypothesis"><span>OUTPUT</span><div><i><b>hypothesis</b><small>bounded</small></i><i><b>uncertainty</b><small>visible</small></i><i><b>follow-ups</b><small>3 questions</small></i></div></div>
    </div>
  );
}

function ValidationGates() {
  return (
    <div className="vx-validation" role="img" aria-label="NLI and deterministic DSM-aligned rules validate evidence support before releasing clinician-facing output">
      <div className="vx-nli-matrix"><span>DeBERTa-v3 NLI</span>{[["sleep evidence", "entailed"], ["duration claim", "uncertain"], ["diagnostic claim", "blocked"]].map(([claim,status]) => <i key={claim} data-state={status}><b>{claim}</b><small>{status}</small></i>)}</div>
      <div className="vx-rule-engine"><span>DSM-ALIGNED RULE ENGINE</span>{["evidence cited", "minimum context", "unsupported diagnosis", "confidence gate"].map((item,index) => <i key={item} data-state={index===2 ? "blocked" : "pass"}><b>{index===2 ? "×" : "✓"}</b><strong>{item}</strong></i>)}</div>
      <div className="vx-release-gate"><i /><span>SAFE OUTPUT GATE</span><strong>Release with uncertainty</strong><small>unsupported diagnostic language removed</small></div>
    </div>
  );
}

function ClinicianReview() {
  return (
    <div className="vx-clinician" role="img" aria-label="Clinician review interface keeps evidence, hypothesis, uncertainty, and follow-up questions visible together">
      <div className="vx-clinician-top"><span>MINDSCAPE · SESSION REVIEW</span><i>CLINICIAN DECISION SUPPORT</i></div>
      <div className="vx-clinician-grid">
        <div className="vx-clinician-state"><span>BEHAVIORAL STATE</span><div className="vx-radar"><i /><i /><i /><b /></div><small>affect · language · events · longitudinal shift</small></div>
        <div className="vx-clinician-hypothesis"><span>GROUNDED HYPOTHESIS</span><p>Sleep disruption and affect change warrant structured follow-up; available evidence is insufficient for an autonomous diagnosis.</p><div><i>E01</i><i>E02</i><i>E04</i></div></div>
        <div className="vx-clinician-followup"><span>FOLLOW-UP</span><strong>Clarify duration and functional impact.</strong><small>uncertainty: moderate · evidence: 3 citations</small></div>
      </div>
      <div className="vx-clinician-foot"><span>SYNTHETIC CLINICAL WORKFLOW</span><strong>Clinician reviews, edits, and owns the decision</strong></div>
    </div>
  );
}

export function MindScapeVisual({ active }: VisualProps) {
  return [<CaptureBuffer key="capture" />, <MultimodalPerception key="perceive" />, <BehavioralFusion key="fusion" />, <HybridRetrieval key="retrieve" />, <GroundedReasoning key="reason" />, <ValidationGates key="validate" />, <ClinicianReview key="review" />][active];
}

export function LogisticsVisual({ active }: VisualProps) {
  return (
    <div className="vx-logistics-console" data-state={active} role="img" aria-label="Role-aware logistics copilot classifies intent, runs an approved query contract, and summarizes returned rows">
      <div className="vx-logistics-top"><span>CONTROL TOWER / AI OPERATIONS</span><i>ADMIN · AUTHORIZED</i></div>
      <div className="vx-logistics-prompt">Which routes are at highest risk today?<b /></div>
      <div className="vx-logistics-flow">
        <div data-active={active >= 0}><span>01</span><small>INTENT ROUTER</small><strong>high_risk_routes</strong><i>role + schema checked</i></div>
        <em aria-hidden="true" />
        <div data-active={active >= 1}><span>02</span><small>APPROVED HANDLER</small><strong>Parameterized query</strong><i>bounded rows only</i></div>
        <em aria-hidden="true" />
        <div data-active={active >= 2}><span>03</span><small>AI RESPONSE</small><strong>Evidence + next action</strong><i>no raw database access</i></div>
      </div>
      <div className="vx-logistics-result" data-visible={active === 2}><span>ROUTE R-104 · HIGH ATTENTION</span><p>Weather and condition reports indicate elevated delay risk. Review the latest driver report before changing the assignment.</p><small>Model context: 4 returned rows · 0 unrestricted queries</small></div>
    </div>
  );
}

export function ResearchMiniVisual({ index }: { index: number }) {
  if (index === 0) {
    return <div className="vx-research-mini vx-tinyml-mini" role="img" aria-label="Audio becomes log-Mel and MFCC features, passes through a YAMNet-derived classifier, compresses to INT8, and runs on the SoC"><span>EDGE AUDIO PIPELINE</span><div className="vx-mini-audio"><Waveform bars={13} /></div><b>→</b><div className="vx-mini-spectrum">{Array.from({ length: 18 }, (_, cell) => <i key={cell} style={{ "--cell": cell } as CSSProperties} />)}<small>log-Mel · MFCC</small></div><b>→</b><div className="vx-mini-network">{Array.from({ length: 10 }, (_, node) => <i key={node} />)}<small>YAMNet-derived</small></div><b>→</b><div className="vx-mini-chip"><strong>INT8</strong><small>SoC NPU</small></div><footer><em>93%+</em><em>&lt;10 ms</em><em>14× compression</em></footer></div>;
  }
  if (index === 1) {
    return <div className="vx-research-mini vx-sql-mini" role="img" aria-label="Question and visual context are grounded with OCR, matched to schema, compiled into SQL, and checked by database execution"><span>EXECUTION-GROUNDED TEXT-TO-SQL</span><div className="vx-mini-vqa"><i>Q</i><i>IMG</i><small>OCR + intent</small></div><b>→</b><div className="vx-mini-schema"><i /><i /><i /><small>schema subset</small></div><b>→</b><div className="vx-mini-code"><code>SELECT route_id<br />FROM evidence<br />WHERE risk = ?</code></div><b>→</b><div className="vx-mini-ex"><strong>EX ✓</strong><small>execute + diagnose</small></div><footer><em>12,751+ pairs</em><em>95+ databases</em></footer></div>;
  }
  return <div className="vx-research-mini vx-eval-mini" role="img" aria-label="Synthetic examples pass through an LLM judge, accepted data trains a small model, and paired outputs are evaluated"><span>DISTILLATION QUALITY GATE</span><div className="vx-mini-samples"><i>sample 01</i><i>sample 02</i><i>sample 03</i></div><b>→</b><div className="vx-mini-judge"><i data-state="pass">✓</i><i data-state="fail">×</i><small>LLM judge</small></div><b>→</b><div className="vx-mini-student"><strong>SLM</strong><small>TRL distill</small></div><b>→</b><div className="vx-mini-eval"><i><b style={{ "--eval": "82%" } as CSSProperties} /></i><i><b style={{ "--eval": "64%" } as CSSProperties} /></i><small>paired eval</small></div><footer><em>31% fewer factual errors</em><em>200+ response pairs</em></footer></div>;
}
