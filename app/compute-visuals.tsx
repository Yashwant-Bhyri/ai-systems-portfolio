"use client";

import { useEffect, useId, useRef, useState } from "react";
import { INFERENCE_STEPS, TRAINING_STEPS } from "./compute-projects";
import { INFERENCE_SCENES } from "./compute/inference-scenes";
import { TRAINING_SCENES } from "./compute/training-scenes";
import { InferenceArchitectureFilm, TrainingArchitectureFilm, ComputeMiniGraphic } from "./compute/architecture-films";
import { DURATION } from "./compute/simulation";
import "./compute-scenes.css";
import "./compute/stagecraft/stagecraft.css";
import "./compute/stagecraft/microscope.css";
import "./compute/stagecraft/quiet.css";
import { GhostCursor, type CursorStep } from "./compute/stagecraft/ghost-cursor";
import { useTr } from "./exhibit/i18n";
import "./compute/compute-polish.css";

function usePresence() {
  const ref=useRef<HTMLDivElement>(null);
  const [onScreen,setOnScreen]=useState(false);
  useEffect(()=>{
    if(!ref.current)return;
    const observer=new IntersectionObserver(([entry])=>setOnScreen(entry.isIntersecting),{threshold:.1});
    observer.observe(ref.current);
    return()=>observer.disconnect();
  },[]);
  return {ref,onScreen};
}

/** Local operation playback is deliberately independent of chapter auto-advance. */
function useReplayClock(running:boolean) {
  const [time,setTime]=useState(0),[reduced,setReduced]=useState(false),[visible,setVisible]=useState(true);
  const accumulated=useRef(0);
  useEffect(()=>{
    const media=matchMedia("(prefers-reduced-motion: reduce)");
    const update=()=>setReduced(media.matches),visibility=()=>setVisible(!document.hidden);
    update();visibility();
    media.addEventListener("change",update);document.addEventListener("visibilitychange",visibility);
    return()=>{media.removeEventListener("change",update);document.removeEventListener("visibilitychange",visibility);};
  },[]);
  useEffect(()=>{
    if(!running||reduced||!visible)return;
    let frame=0,previous:number|null=null,lastPaint=0;
    const tick=(now:number)=>{
      if(previous!==null)accumulated.current=(accumulated.current+Math.min(now-previous,100))%DURATION;
      previous=now;
      // Bound React/SVG reconciliation; geometry still follows elapsed time.
      if(now-lastPaint>=1000/30){lastPaint=now;setTime(accumulated.current);}
      frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(frame);
  },[running,reduced,visible]);
  return {time:reduced?9800:time,reduced,visible,seek:(to:number)=>{accumulated.current=to;setTime(to);}};
}

const OPTIONS:Record<string,{label:string;items:string[];initial?:number}>={
  "inference-0":{label:"Batch scheduler",items:["Continuous","Fixed batch"]},
  "inference-1":{label:"Prefix cache mode",items:["Shared prefix","Distinct prefixes"]},
  "inference-2":{label:"Kernel execution",items:["Separate kernels","Fused execution"]},
  "inference-3":{label:"Weight precision",items:["16-bit","8-bit","4-bit"],initial:2},
  "inference-4":{label:"Draft acceptance",items:["Late mismatch","Early mismatch"]},
  "inference-5":{label:"Parallelism",items:["Tensor","Pipeline"]},
  "inference-6":{label:"Critical path",items:["Baseline trace","Overlap transfer"]},
  "inference-7":{label:"Request outcome",items:["Complete","Cancel"]},
  "training-0":{label:"Reasoning records",items:["Math records","Code records"]},
  "training-1":{label:"Toy adapter rank",items:["Rank 2","Rank 4"]},
  "training-2":{label:"Rollout task",items:["Math prompt","Code prompt"]},
  "training-3":{label:"Group reward distribution",items:["Mixed rewards","All tied"]},
  "training-4":{label:"Preferred response",items:["Prefer A","Prefer B"]},
  "training-5":{label:"Search budget",items:["2 checks","4 checks","8 checks"],initial:2},
  "training-6":{label:"Compute budget",items:["2 candidates","4 candidates","8 candidates"],initial:1},
  "training-7":{label:"Evaluation focus",items:["Mathematics","Logic","Repository"]},
};
const BEATS:Record<string,readonly [string,string,string]>={
  "inference-0":["Fill the batch","Replace a slot","Keep decoding"],
  "inference-1":["Compute A","Reuse the prefix","Release A"],
  "inference-2":["Load tiles","Accumulate","Write output"],
  "inference-3":["Read weights","Round values","Pack bits"],
  "inference-4":["Draft tokens","Verify prefix","Commit + correct"],
  "inference-5":["Partition work","Move results","Synchronize"],
  "inference-6":["Queue + dispatch","Trace dependencies","First token"],
  "inference-7":["Route request","Stream tokens","Reclaim pages"],
  "training-0":["Read records","Reject weak traces","Retain supervision"],
  "training-1":["Split activation","Sum both paths","Backprop + update"],
  "training-2":["Sample a group","Extend reasoning","Verify outcomes"],
  "training-3":["Assign rewards","Normalize group","Update policy"],
  "training-4":["Read preference","Compare reference","Separate scores"],
  "training-5":["Expand frontier","Prune failures","Inspect budget"],
  "training-6":["Sample candidates","Spend compute","Select result"],
  "training-7":["Match tasks","Audit run records","Check release gate"],
};
const BEAT_TIMES=[0,3600,8200];
/* Flip the mechanism's own switch mid-film, at the same moment, so the A/B difference shows itself. */
const FLIP:readonly CursorStep[]=[
  {target:".cx-scene-options [role=group] button:nth-child(2)",label:"Flip the mechanism",hold:3600},
  {target:".cx-scene-options [role=group] button:nth-child(1)",label:"And back",hold:4200},
];
type PlaybackProps={active:number;playing?:boolean;onInspect?:()=>void;onPlay?:()=>void};
function ComputeScene({domain,active,onInspect}:PlaybackProps&{domain:"inference"|"training"}) {
  const key=`${domain}-${active}`,options=OPTIONS[key],beats=BEATS[key];
  const [option,setOption]=useState(options.initial??0),[manual,setManual]=useState<number|null>(null),[paused,setPaused]=useState(false);
  const [expanded,setExpanded]=useState(false);
  const dialogRef=useRef<HTMLDialogElement>(null);
  const {ref,onScreen}=usePresence();
  useEffect(()=>{
    if(expanded&&!dialogRef.current?.open)dialogRef.current?.showModal();
  },[expanded]);
  const clock=useReplayClock(onScreen&&!paused&&manual===null);
  const id=useId(),time=manual??clock.time;
  const steps=domain==="inference"?INFERENCE_STEPS:TRAINING_STEPS;
  const Scene=(domain==="inference"?INFERENCE_SCENES:TRAINING_SCENES)[active];
  const running=!paused&&manual===null&&!clock.reduced&&onScreen&&clock.visible;
  const beat=time<3600?0:time<7600?1:2;
  const inspect=(at:number)=>{setManual(at);setPaused(true);onInspect?.();};
  const restart=()=>{setManual(null);setPaused(false);clock.seek(0);onInspect?.();};
  const sceneRef=useRef<HTMLDivElement>(null);
  const toggle=()=>{onInspect?.();if(paused||manual!==null){clock.seek(time);setManual(null);setPaused(false);}else setPaused(true);};
  const expand=()=>{onInspect?.();setExpanded(true);};
  const closeFocus=()=>{dialogRef.current?.close();setExpanded(false);};
  const content=(focus=false)=><>
    <div className="cx-scene-options"><span><i/>{domain==="training"&&active===7?"Illustrative / evidence pending":"Illustrative replay"}</span><div role="group" aria-label={options.label}>{options.items.map((item,i)=><button key={item} type="button" aria-pressed={option===i} onClick={e=>{setOption(i);if(e.isTrusted)restart();}}>{item}</button>)}</div></div>
    <div className="cx-beat-rail" role="group" aria-label="Operation story beats">{beats.map((label,i)=><button key={label} aria-pressed={beat===i} onClick={()=>inspect(BEAT_TIMES[i])}><i>{i+1}</i><span>{label}</span><b style={{transform:`scaleX(${i<beat?1:i>beat?0:Math.min(1,(time-(i===2?7600:BEAT_TIMES[i]))/(i===2?2800:3600))})`}}/></button>)}</div>
    <p className="cx-pan-hint">Scroll the diagram sideways to follow the full path →</p>
    <div className="cx-canvas-scroll" tabIndex={0} role="region" aria-label={`${steps[active].label} diagram. Scroll horizontally on narrow screens.`}>
      <svg viewBox="0 0 720 420" className="cx-svg" role="img" aria-labelledby={`${id}-${focus}-title ${id}-${focus}-desc`}>
        <title id={`${id}-${focus}-title`}>{`${steps[active].label}: ${steps[active].title}`}</title>
        <desc id={`${id}-${focus}-desc`}>{steps[active].explanation}</desc><Scene t={time} option={option}/>
      </svg>
    </div>
    <div className="cx-replay-controls">
      <button type="button" onClick={focus?closeFocus:expand} aria-label={focus?"Exit focus view":"Expand operation"}>{focus?"↙ Exit":"↗ Focus"}</button>
      <button type="button" onClick={toggle} disabled={clock.reduced} aria-label={paused||manual!==null?"Play operation":"Pause operation"}>{paused||manual!==null?"▶ Play":"Ⅱ Pause"}</button>
      <button type="button" onClick={restart} disabled={clock.reduced} aria-label="Replay operation">↺ Replay</button>
      <input type="range" min="0" max="10300" step="100" value={Math.min(10300,Math.round(time/100)*100)} aria-label="Inspect replay position" aria-valuetext={`${(time/1000).toFixed(1)} seconds: ${beats[beat]}`} onChange={e=>inspect(Number(e.target.value))}/>
      <span>{clock.reduced?"STATIC":manual!==null?"INSPECTING":paused?"PAUSED":"LIVE"}</span>
    </div>
  </>;
  return <>
    <div ref={ref} className="cx-scene" data-scene={key} data-playing={running}><div ref={sceneRef} className="gc-host">{content()}<GhostCursor root={sceneRef} script={FLIP} startDelay={3800} loop={false}/></div></div>
    {expanded&&<dialog ref={dialogRef} className="cx-focus-dialog" aria-label={`${steps[active].label} — focus view`} onCancel={()=>setExpanded(false)} onClose={()=>setExpanded(false)}><div className="cx-scene">{content(true)}</div></dialog>}
  </>;
}
export function InferenceVisual(props:PlaybackProps){return <ComputeScene key={props.active} domain="inference" {...props}/>;}
export function TrainingVisual(props:PlaybackProps){return <ComputeScene key={props.active} domain="training" {...props}/>;}

type ArchNode={step:number;spot:string;title:string;sub:string;glyph:string;term:string;chips:readonly string[];value:string;unit:string};
const INFERENCE_NODES:readonly ArchNode[]=[
  {step:0,spot:"schedule",title:"Schedule",sub:"Batch + token budget",glyph:"queue",term:"Continuous batching",chips:["admit every iteration","chunked prefill","token budget"],value:"1,081 → 445",unit:"s · p95 latency"},
  {step:1,spot:"reuse",title:"Reuse",sub:"Shared prefix + KV pages",glyph:"memory",term:"PagedAttention · prefix cache",chips:["16-token pages","GQA · 8 KV heads","copy-on-write prefix"],value:"7,808",unit:"tokens skipped per hit"},
  {step:2,spot:"accelerate",title:"Accelerate",sub:"CUDA + TensorRT",glyph:"chip",term:"Fused attention kernels",chips:["FlashAttention tiles","CUDA graphs","FP8 weights"],value:"−4.74",unit:"GPU-s per correct answer"},
  {step:5,spot:"distribute",title:"Distribute",sub:"Parallel execution",glyph:"parallel",term:"Tensor parallel × 2",chips:["all-reduce per layer","NVLink","cache-aware routing"],value:"−20",unit:"ms · warm route"},
  {step:7,spot:"serve",title:"Serve",sub:"Stream + reclaim",glyph:"stream",term:"Token streaming over SSE",chips:["flush per token","disconnect → reclaim pages","TTFT · TPOT"],value:"36.61 → 19.29",unit:"GPU-s per correct answer"},
];
const TRAINING_NODES:readonly ArchNode[]=[
  {step:0,spot:"curate",title:"Curate",sub:"Verified reasoning data",glyph:"queue",term:"Verified reasoning traces",chips:["unit tests · exact answers","dedupe","held-out split"],value:"96",unit:"held-out tasks · never trained on"},
  {step:1,spot:"initialize",title:"Initialize",sub:"Qwen3-4B · SFT / LoRA",glyph:"chip",term:"SFT · LoRA r = 16",chips:["q k v o gate up down","36 layers","base frozen"],value:"0.82%",unit:"of 4.02B weights train"},
  {step:3,spot:"optimize",title:"Optimize",sub:"Group-relative updates",glyph:"parallel",term:"GRPO · G = 8",chips:["verifiable reward","group-normalized advantage","KL to reference"],value:"+11 −2",unit:"tasks vs SFT"},
  {step:5,spot:"search",title:"Search",sub:"Verifier + compute budget",glyph:"tree",term:"Test-time compute",chips:["best-of-N","verifier selects","θ frozen"],value:"55 → 82",unit:"of 96 at 4× search"},
  {step:7,spot:"evaluate",title:"Evaluate",sub:"Math · logic · code",glyph:"stream",term:"Paired regression audit",chips:["pass@1","per-task flips","GPU-s per correct"],value:"28 → 82",unit:"of 96 synthetic tasks · 5 regressions named"},
];
function ComputeOverview({domain,active,onSelect}:{domain:"inference"|"training";active:number;onSelect:(n:number)=>void}) {
  const {ref,onScreen}=usePresence(),[paused,setPaused]=useState(false),clock=useReplayClock(onScreen&&!paused),inference=domain==="inference",nodes=inference?INFERENCE_NODES:TRAINING_NODES;
  const [hover,setHover]=useState<number|null>(null);
  const id=useId(),tr=useTr();
  const litIndex=hover??nodes.findIndex(n=>n.step===active),lit=nodes[litIndex];
  return <div ref={ref} className="cx-overview" data-lit={lit?.spot} role="group" aria-label={`${inference?"Inference Optimization":"Advanced Post-Training"} high-level architecture`}>
    <div className="cx-film-toolbar cx-arch-caption">
      {lit?<p key={lit.spot} aria-live="polite"><b>{String(litIndex+1).padStart(2,"0")}<i>/ 0{nodes.length}</i></b><strong>{tr(lit.term)}</strong><span className="cx-arch-chips">{lit.chips.map(c=><em key={c}>{tr(c)}</em>)}</span><span className="cx-arch-metric"><mark>{lit.value}</mark><small>{tr(lit.unit)}</small></span></p>:<p/>}
      <button type="button" onClick={()=>setPaused(p=>!p)} disabled={clock.reduced} aria-label={paused?"Play architecture animation":"Pause architecture animation"}>{paused?"▶":"Ⅱ"}</button>
    </div>
    <p className="cx-pan-hint">Scroll sideways to trace the complete architecture →</p>
    <div className="cx-film-scroll" tabIndex={0} role="region" aria-label="Animated architecture diagram. Scroll horizontally on narrow screens.">
      <svg className="cx-architecture-film" viewBox="0 0 1140 395" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>{inference?"Requests share GPU computation and cached history while keeping separate token streams":"Learning updates adapters; inference searches with a fixed checkpoint"}</title>
        <desc id={`${id}-desc`}>{inference?"Colored prompt tokens enter a continuous batch. Two GPU shards execute the model, referencing shared prefix pages and private continuation pages. Tokens stream back to each request; profiling informs the next optimization iteration.":"Verified reasoning traces enter a frozen Qwen3-4B core with trainable adapters. Grouped rollouts produce relative rewards that update the adapter. A trained checkpoint crosses into a separate, weight-frozen search loop that expands, verifies, and selects reasoning candidates. DPO is an alternative training route."}</desc>
        {inference?<InferenceArchitectureFilm t={clock.time} focus={lit?.spot}/>:<TrainingArchitectureFilm t={clock.time} focus={lit?.spot}/>}
      </svg>
    </div>
    <div className="cx-film-drilldowns" aria-label="Inspect architecture components" onPointerLeave={()=>setHover(null)}>{nodes.map((node,i)=><button type="button" key={node.step} aria-pressed={litIndex===i} onPointerEnter={()=>setHover(i)} onFocus={()=>setHover(i)} onBlur={()=>setHover(null)} onClick={()=>onSelect(node.step)}><span>0{i+1}</span><strong>{node.title}<b aria-hidden="true">↗</b></strong><small>{node.sub}</small></button>)}</div>
    <div className="cx-overview-details">{inference?<><button onClick={()=>onSelect(3)}>Weight precision <strong>Quantization ↗</strong></button><button onClick={()=>onSelect(4)}>Decode strategy <strong>Speculative verification ↗</strong></button><button onClick={()=>onSelect(6)}>Optimization signal <strong>GPU profiling ↗</strong></button></>:<><button onClick={()=>onSelect(2)}>Learning signal <strong>Grouped rollouts ↗</strong></button><button onClick={()=>onSelect(4)}>Alternative alignment route <strong>DPO preference pairs ↗</strong></button><button onClick={()=>onSelect(6)}>Inference budget <strong>Test-time scaling ↗</strong></button></>}</div>
  </div>;
}
export function InferenceOverview(props:{active:number;onSelect:(n:number)=>void}){return <ComputeOverview domain="inference" {...props}/>;}
export function TrainingOverview(props:{active:number;onSelect:(n:number)=>void}){return <ComputeOverview domain="training" {...props}/>;}

export function ComputeProjectPreview({domain,enabled=true}:{domain:"inference"|"training";enabled?:boolean}) {
  const {ref,onScreen}=usePresence(),clock=useReplayClock(onScreen&&enabled);
  return <div ref={ref} className="cx-project-preview" aria-hidden="true"><svg viewBox="0 0 330 140"><ComputeMiniGraphic domain={domain} t={clock.time}/></svg><span>{domain==="inference"?"BATCH → SHARED COMPUTE → TOKEN STREAMS":"SAMPLE → VERIFY → UPDATE THE POLICY"}</span></div>;
}
