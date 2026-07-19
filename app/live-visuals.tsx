"use client";

import { useRef, type ComponentType } from "react";
import "./live-scenes.css";
import { useOnScreen } from "./fable/director";
import { useSim, typed, caret, noise, pulse, q } from "./fable/live";
import {
  LoopGraphic,
  SttGraphic,
  TrajectoryGraphic,
  FastLaneGraphic,
  AgentsGraphic,
  OrchestratorGraphic,
  VoiceOutGraphic,
  ReportGraphic,
} from "./fable/antigravity";
import {
  RuntimeGraphic,
  TrendGraphic,
  SkillGraphic,
  MemoryGraphic,
  CompilerGraphic,
  OrchestrationGraphic,
  EditorGraphic,
  OutputGraphic,
} from "./fable/filmora";
import {
  CaptureGraphic,
  PerceiveGraphic,
  FuseGraphic,
  RetrievalGraphic,
  ReasonGraphic,
  ValidateGraphic,
  ReviewGraphic,
} from "./fable/mindscape";
import { LogisticsGraphic, BenchMini } from "./fable/systems";

type Scene = ComponentType<{ a: boolean }>;

/**
 * Hosts one live scene inside V2's operational stage. The wrapper carries the
 * vx→scene design-token bridge (live-scenes.css) and gates the sim clock on
 * genuine viewport presence, so off-screen chapters cost nothing.
 */
function LiveStage({ scenes, active }: { scenes: Scene[]; active: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useOnScreen(ref, 0.2);
  const S = scenes[Math.max(0, Math.min(active, scenes.length - 1))];
  return (
    <div ref={ref} className="vx-live-stage">
      <S a={on} />
    </div>
  );
}

/* V2 step order — with the two steps added to V2's arrays:
   antigravity: room, stt, trajectory, DUAL-LANE, agents, orchestrator, voice, report */
const ANTIGRAVITY_SCENES: Scene[] = [
  LoopGraphic,
  SttGraphic,
  TrajectoryGraphic,
  FastLaneGraphic,
  AgentsGraphic,
  OrchestratorGraphic,
  VoiceOutGraphic,
  ReportGraphic,
];

/* filmora: brief/runtime, trend, SKILLS, memory, compiler, graph, editor, observe */
const FILMORA_SCENES: Scene[] = [
  RuntimeGraphic,
  TrendGraphic,
  SkillGraphic,
  MemoryGraphic,
  CompilerGraphic,
  OrchestrationGraphic,
  EditorGraphic,
  OutputGraphic,
];

/* mindscape: capture, perceive, fuse, retrieve, reason, validate, review (1:1) */
const MINDSCAPE_SCENES: Scene[] = [
  CaptureGraphic,
  PerceiveGraphic,
  FuseGraphic,
  RetrievalGraphic,
  ReasonGraphic,
  ValidateGraphic,
  ReviewGraphic,
];

export function LiveAntigravityVisual({ active }: { active: number }) {
  return <LiveStage scenes={ANTIGRAVITY_SCENES} active={active} />;
}

export function LiveFilmoraVisual({ active }: { active: number }) {
  return <LiveStage scenes={FILMORA_SCENES} active={active} />;
}

export function LiveMindScapeVisual({ active }: { active: number }) {
  return <LiveStage scenes={MINDSCAPE_SCENES} active={active} />;
}

/** The logistics console plays its whole story (contract → rows → refusal)
 *  regardless of which step the copy rail highlights. */
export function LiveLogisticsVisual({ active: _active }: { active: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useOnScreen(ref, 0.2);
  return (
    <div ref={ref} className="vx-live-stage">
      <LogisticsGraphic a={on} />
    </div>
  );
}

/* ---------- research minis: SQL and distillation as standalone live scenes ---------- */

function SqlMini({ a }: { a: boolean }) {
  const el = useSim(a);
  const t = el % 8800;
  const sql = typed("SELECT route_id, delay_risk\nFROM evidence JOIN routes USING (route_id)\nWHERE risk_score > ?", t, 900, 3400);
  const lines = sql.split("\n");
  const exOk = t > 4200;
  return (
    <svg viewBox="0 0 320 150" className="op-svg">
      <g className="lv-chip">
        <rect x={6} y={8} width={54} height={22} rx={6} />
        <text x={33} y={23} textAnchor="middle" className="svg-sub tiny">Q + IMG</text>
      </g>
      <text x={66} y={23} className="svg-sub tiny">→ OCR + intent</text>
      {[0, 1, 2].map((s2) => (
        <rect key={s2} x={160 + s2 * 20} y={10} width={16} height={18} rx={3} className="lv-bar bg" style={{ opacity: t > 400 + s2 * 260 ? 0.9 : 0.25 }} />
      ))}
      <text x={224} y={23} className="svg-sub tiny">schema subset</text>
      <rect x={6} y={40} width={240} height={62} rx={8} className="lv-track" />
      {lines.map((ln, i) => (
        <text key={i} x={14} y={58 + i * 16} className="svg-mono tinytext">{ln}{i === lines.length - 1 && t < 3500 ? caret(t) : ""}</text>
      ))}
      <g className={`lv-chip ${exOk ? "win" : ""}`}>
        <rect x={256} y={56} width={58} height={30} rx={7} />
        <text x={285} y={69} textAnchor="middle" className={exOk ? "tick ok" : "svg-sub tiny"}>{exOk ? "EX ✓" : "EX …"}</text>
        <text x={285} y={81} textAnchor="middle" className="svg-sub tiny">execute</text>
      </g>
      <text x={6} y={122} className="svg-mono tinytext">12,751+ question-SQL pairs</text>
      <text x={6} y={138} className="svg-mono tinytext">95+ databases · failure diagnosis</text>
    </svg>
  );
}

function DistillMini({ a }: { a: boolean }) {
  const el = useSim(a);
  const t = el % 8400;
  const sampleIdx = Math.floor(t / 800) % 3;
  const verdictOk = sampleIdx !== 1;
  return (
    <svg viewBox="0 0 320 150" className="op-svg">
      <text x={6} y={16} className="svg-sub tiny">DISTILLATION QUALITY GATE · running</text>
      {[0, 1, 2].map((s2) => (
        <g key={s2} className="lv-chip">
          <rect x={6 + s2 * 62} y={26} width={56} height={22} rx={6} style={{ opacity: sampleIdx === s2 ? 1 : 0.4 }} />
          <text x={34 + s2 * 62} y={41} textAnchor="middle" className="svg-sub tiny">sample 0{s2 + 1}</text>
        </g>
      ))}
      <g className="lv-node is-live">
        <rect x={200} y={20} width={80} height={34} rx={8} />
        <text x={240} y={34} textAnchor="middle" className="svg-label small">LLM judge</text>
        <text x={240} y={48} textAnchor="middle" className={verdictOk ? "tick ok" : "tick bad"}>{verdictOk ? "✓ accept" : "✗ reject"}</text>
      </g>
      <g className="lv-chip win">
        <rect x={6} y={66} width={70} height={26} rx={7} />
        <text x={41} y={83} textAnchor="middle" className="svg-mono tinytext">SLM ← TRL</text>
      </g>
      <text x={84} y={83} className="svg-sub tiny">trained on accepted data only</text>
      {[0.82, 0.64].map((v, i) => (
        <g key={i}>
          <text x={6} y={112 + i * 16} className="svg-sub tiny">{i === 0 ? "distilled" : "baseline"}</text>
          <rect x={60} y={105 + i * 16} width={180} height={7} rx={3.5} className="lv-track thin" />
          <rect x={60} y={105 + i * 16} width={q(180 * v * (0.4 + 0.6 * pulse(t + i * 400, 4200)))} height={7} rx={3.5} className={i === 0 ? "lv-bar" : "lv-bar bg"} />
          <text x={248} y={112 + i * 16} className="svg-sub tiny">{i === 0 ? "paired eval" : ""}</text>
        </g>
      ))}
      <text x={6} y={146} className="svg-mono tinytext">31% fewer factual errors · 200+ pairs</text>
    </svg>
  );
}

/** index mapping for the research grid:
 *  0 TinyML · 1 Text-to-SQL · 2 distillation · 3 webGLR · 4 COL-VEO */
export function LiveResearchMini({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useOnScreen(ref, 0.2);
  const el = useSim(on);
  return (
    <div ref={ref} className="vx-live-stage vx-live-mini">
      {index === 0 && (
        <svg viewBox="0 0 320 150" className="op-svg">
          <BenchMini idx={0} t={el} />
        </svg>
      )}
      {index === 1 && <SqlMini a={on} />}
      {index === 2 && <DistillMini a={on} />}
      {index === 3 && (
        <svg viewBox="0 0 320 150" className="op-svg">
          <BenchMini idx={1} t={el} />
        </svg>
      )}
      {index === 4 && (
        <svg viewBox="0 0 320 150" className="op-svg">
          <BenchMini idx={2} t={el} />
        </svg>
      )}
    </div>
  );
}
