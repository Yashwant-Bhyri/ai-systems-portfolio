import { C, PALETTE, Text, Line, Chip, Flight, Flux, Matrix, Panel, Header, Caption, Meter, type SceneProps } from "./primitives";
import { ep, ph, q, mix, advantages, policyWeights, searchState } from "./simulation";

export function DataCuration({t,option}:SceneProps) {
  const code=option===1;
  const records=code?["patch + tests","duplicate patch","fails edge case","verified patch"]:["worked proof","duplicate proof","wrong result","verified proof"];
  const cursor=Math.min(3,Math.floor(t/1900)),local=t-cursor*1900;
  return <>
    <Header title="DATA CURATION / KEEP THE REASON, NOT JUST THE ANSWER"/>
    <Text x={28} y={70} kind="small">SYNTHETIC RECORDS</Text><Text x={488} y={70} kind="small">TRAINING RECORDS</Text>
    {records.map((s,i)=><g key={i}><Panel x={28} y={84+i*51} w={192} h={40} color={i===cursor?C.rose:C.muted}><Text x={41} y={109+i*51} kind="small">{i+1}. {s}</Text></Panel>
      {i<cursor&&(i===1||i===2)&&<path d={`M39 ${119+i*51}L200 ${91+i*51}`} stroke={C.red} strokeOpacity={.6}/>}</g>)}
    <Panel x={285} y={111} w={156} h={148} label="QUALITY GATE" color={C.rose}>
      {["schema","deduplicate",code?"execute tests":"check result"].map((s,i)=><g key={s}><circle cx={306} cy={158+i*33} r={5} fill={local>300+i*300?(cursor===1&&i===1)||(cursor===2&&i===2)?C.red:C.green:"#344151"}/><Text x={321} y={162+i*33} kind="small">{s}</Text></g>)}
    </Panel>
    {[0,3].map((i,j)=><g key={i} opacity={t>i*1900+1500?1:.18}><Panel x={490} y={88+j*65} w={201} h={52} color={C.green}><Text x={504} y={110+j*65} kind="small">{code?"repository":"mathematics"} / {i+1}</Text><Text x={504} y={128+j*65} kind="small" color={C.green}>prompt · trace · answer ✓</Text></Panel></g>)}
    {records.map((_,i)=>{const at=i*1900;return <g key={i}><Flight t={t} start={at} end={at+700} from={[220,104+i*51]} to={[285,185]} label={`#${i+1}`} color={C.rose}/><Flight t={t} start={at+1000} end={at+1600} from={[441,185]} via={[470,220]} to={i===1||i===2?[371,312]:[490,i===0?114:179]} label={i===1?"duplicate":i===2?"invalid":`#${i+1}`} color={i===1||i===2?C.red:C.green} w={i===1||i===2?76:42}/></g>;})}
    <Text x={289} y={336} kind="small" color={C.red}>reject / quarantine</Text>
    <Line d="M474 226H692" dash/><Panel x={490} y={247} w={201} h={80} label="HELD-OUT TASKS" color={C.blue}><Text x={504} y={291} kind="small">isolated before training</Text><Text x={504} y={312} kind="small" color={C.blue}>never enters the optimizer</Text></Panel>
    <Caption title="Verification routes useful examples into supervision." detail="Invalid and duplicate traces do not become learning targets."/>
  </>;
}

export function LoRA({t,option}:SceneProps) {
  const rank=option===0?2:4,backward=t>=5400,update=t>=7800,forward=ph(t,0,4800);
  return <>
    <Header title="LoRA / THE BASE STAYS FROZEN" right={`toy layer 16×16 · rank ${rank}`}/>
    <Chip x={64} y={190} w={62} h={65} label="x" color={C.cyan}/>
    <Line d="M95 190H153V112H242" color={C.cyan}/><Line d="M153 190V278H230" color={C.cyan}/>
    <Panel x={244} y={65} w={240} h={116} label="W · FROZEN / 256 WEIGHTS" color={C.muted}>
      <Matrix x={269} y={104} cols={12} rows={4} size={11} gap={5} color={C.muted}/>
    </Panel>
    <Text x={244} y={213} kind="small" color={C.rose}>A · {rank}×16</Text><Matrix x={245} y={230} cols={8} rows={rank} size={12} gap={4} color={C.rose} t={update?t:0} mode={update?"update":"fixed"}/>
    <Text x={414} y={213} kind="small" color={C.rose}>B · 16×{rank}</Text><Matrix x={415} y={230} cols={rank} rows={6} size={12} gap={4} color={C.rose} t={update?t:0} mode={update?"update":"fixed"}/>
    <Flux from={[373,263]} to={[407,263]} t={t} color={C.rose} active={!backward}/>
    <Line d="M484 124H539V182H554" color={C.cyan}/><Line d="M482 278H539V182" color={C.rose}/>
    <circle cx={572} cy={182} r={19} fill="#132029" stroke={C.rose}/><Text x={572} y={188} anchor="middle" kind="strong">+</Text>
    <Flux from={[591,182]} to={[653,182]} t={t} color={C.cyan} active={!backward}/>
    <Text x={653} y={156} anchor="middle" kind="small">logits</Text>
    <Panel x={604} y={246} w={88} h={53} label="LOSS" color={backward?C.red:C.muted}><Text x={648} y={286} kind="small" anchor="middle">target y</Text></Panel>
    <Line d="M653 198V244" color={C.cyan}/>
    <Flight t={t} start={400} end={1600} from={[95,190]} via={[140,97]} to={[245,121]} label="x" color={C.cyan} w={24}/>
    <Flight t={t} start={500} end={1800} from={[95,190]} via={[163,278]} to={[245,260]} label="x" color={C.cyan} w={24}/>
    <Flight t={t} start={1900} end={3200} from={[370,260]} to={[417,260]} label="Ax" color={C.rose} w={34}/>
    <Flight t={t} start={3400} end={4800} from={[484,124]} via={[539,125]} to={[572,182]} label="Wx" color={C.cyan} w={35}/>
    <Flight t={t} start={3400} end={4800} from={[478,278]} via={[539,276]} to={[572,182]} label="BAx" color={C.rose} w={38}/>
    {backward&&<><Line d="M648 299V339H302V303" color={C.red}/><Flux from={[615,339]} to={[451,339]} t={t} color={C.red}/><Flux from={[451,339]} to={[300,339]} t={t} color={C.red}/><Text x={545} y={326} kind="small" color={C.red}>∇A, ∇B only</Text></>}
    <Text x={28} y={310} kind="small">{update?"optimizer step":backward?"backpropagation":"forward pass"}</Text><Meter x={28} y={322} w={152} value={backward?ph(t,5400,8500):forward} color={backward?C.red:C.cyan}/>
    <Caption title={update?`Only ${32*rank} adapter weights update. W is unchanged.`:"y = Wx + (α/r) · BAx"} detail="Shape illustration only, not Qwen's actual dimensions. Cyan: forward; coral: gradient."/>
  </>;
}

const MATH_PATHS=[ ["2x + 3 = 11","2x = 8","x = 4"], ["subtract 3","divide by 2","x = 4"], ["2x = 11 + 3","2x = 14","x = 7"], ["try x = 4","2(4) + 3","11 ✓"] ];
const CODE_PATHS=[ ["read contract","guard null","tests pass"], ["trace caller","handle []","tests pass"], ["skip check","index [0]","fails []"], ["reproduce","patch guard","tests pass"] ];
export function Rollouts({t,option}:SceneProps) {
  const code=option===1,paths=code?CODE_PATHS:MATH_PATHS;
  return <>
    <Header title="ONE PROMPT / MULTIPLE REASONING TRAJECTORIES"/>
    <Panel x={28} y={55} w={664} h={46} color={C.rose}><Text x={44} y={84} kind="strong">{code?"Task: repair first_item() for an empty input list.":"Solve: 2x + 3 = 11. Check the result."}</Text></Panel>
    {paths.map((steps,i)=>{const y=140+i*58,col=PALETTE[i];return <g key={i}>
      <Text x={28} y={y+5} kind="small">τ{i+1}</Text><Line d={`M62 ${y}H587`} color={col} opacity={.3}/>
      {steps.map((s,j)=>{const p=ep(t,600+j*1300+i*220,1500+j*1300+i*220),x=129+j*179;return <g key={s} opacity={p}><Chip x={x} y={y} w={143} h={30} label={s} color={col}/>{j<2&&<Flight t={t} start={1800+j*1300+i*220} end={2250+j*1300+i*220} from={[x+72,y]} to={[x+107,y]} color={col} w={14}/>}</g>;})}
      <g opacity={ep(t,5400+i*430,5900+i*430)}><circle cx={636} cy={y} r={18} fill={i===2?"#2b191e":"#17271e"} stroke={i===2?C.red:C.green}/><Text x={636} y={y+5} anchor="middle" kind="strong" color={i===2?C.red:C.green}>{i===2?"×":"✓"}</Text><Text x={676} y={y+5} anchor="middle" kind="small">{i===2?"0":"1"}</Text></g>
    </g>;})}
    <Caption title="The verifier scores outcomes, not how plausible a trace sounds." detail="Toy group with diverse derivations. Each trajectory retains its prompt and reward."/>
  </>;
}

export function GRPO({t,option}:SceneProps) {
  const rewards=option===0?[0,1,0,1]:[1,1,1,1],a=advantages(rewards),center=ep(t,1700,4400),update=ep(t,5100,8600),probs=policyWeights(a.values,update);
  return <>
    <Header title="REWARD → ADVANTAGE → POLICY" right="toy group / schematic update"/>
    <Text x={28} y={76} kind="small">TRAJECTORY</Text><Text x={170} y={76} kind="small">REWARD</Text><Text x={314} y={76} kind="small">CENTER + SCALE</Text><Text x={531} y={76} kind="small">NEXT POLICY MASS</Text>
    <Line d="M371 89V311" dash/><Text x={371} y={333} kind="small" anchor="middle">0</Text>
    {rewards.map((r,i)=>{const y=115+i*60,adv=a.values[i],color=adv>0?C.green:adv<0?C.red:C.muted;return <g key={i}>
      <Text x={28} y={y+6} kind="strong">τ{i+1}</Text><Line d={`M67 ${y}H149`}/>
      <Chip x={193} y={y} label={r.toFixed(1)} color={C.rose} w={45}/>
      <Line d={`M216 ${y}H443`} opacity={.25}/><circle cx={q(mix(228,371+adv*60,center))} cy={y} r={8} fill={color}/>
      <Text x={475} y={y+5} kind="small" anchor="end" color={color}>{center===1?`${adv>0?"+":""}${adv.toFixed(1)}`:"…"}</Text>
      <rect x={530} y={y-12} width={150} height={25} rx={3} fill="#111d27"/><rect x={530} y={y-12} width={q(probs[i]*320)} height={25} rx={3} fill={color} fillOpacity={.5}/>
      <path d={`M610 ${y-17}V${y+18}`} stroke={C.ink} strokeOpacity={.4} strokeDasharray="2 3"/>
      <Text x={686} y={y+6} kind="small" anchor="end">{Math.round(probs[i]*100)}%</Text>
    </g>;})}
    <Text x={28} y={335} kind="small">μ = {a.mean.toFixed(1)} · σ = {a.std.toFixed(1)}</Text><Text x={684} y={335} kind="small" anchor="end">dashed marker: initial 25%</Text>
    <Caption title={option?"Tied rewards give no within-group learning direction.":"Above-group outcomes receive positive learning pressure."} detail="Aᵢ = (rᵢ − μ) / (σ + ε). Bar motion illustrates direction, not a training prediction."/>
  </>;
}

export function DPO({t,option}:SceneProps) {
  const p=ep(t,2300,8400),margin=2.4*p,loss=Math.log1p(Math.exp(-margin)),winner=option===0?0:1;
  return <>
    <Header title="DPO / COMPARE TO A FROZEN REFERENCE" right="alternative to the GRPO route"/>
    <Text x={28} y={69} kind="strong">Same prompt. A preferred and a dispreferred response.</Text>
    {[0,1].map(i=>{const chosen=i===winner,y=100+i*94,color=chosen?C.green:C.red,score=(chosen?1:-1)*margin/2;return <g key={i}>
      <Panel x={28} y={y} w={218} h={69} color={color}><Text x={42} y={y+24} kind="small" color={color}>{chosen?"✓ CHOSEN":"× REJECTED"} · answer {i?"B":"A"}</Text><Text x={42} y={y+49} kind="small">{i?"alternative completion":"candidate completion"}</Text></Panel>
      <Flux from={[246,y+35]} to={[294,y+35]} t={t} color={color} active={t<5000}/>
      <Line d={`M308 ${y+36}H675`}/><Line d={`M487 ${y+10}V${y+61}`} color={C.blue} dash/>
      <circle cx={q(487+score*134)} cy={y+36} r={7} fill={color}/><path d={`M487 ${y+36}H${q(487+score*134)}`} stroke={color} strokeWidth={3}/>
      <Text x={675} y={y+12} kind="small" anchor="end" color={color}>{score>=0?"+":""}{score.toFixed(2)}</Text>
    </g>;})}
    <Text x={306} y={283} kind="small">log πθ(y|x) − log πref(y|x)</Text>
    <Text x={28} y={325} kind="small">L = −log σ(β · preference margin)</Text><Text x={689} y={328} kind="accent" anchor="end">toy loss {loss.toFixed(3)}</Text>
    <Caption title="Separate the reference-relative scores of the preference pair." detail="β = 1. The fixed reference anchors the comparison; labels define preference."/>
  </>;
}

const BRANCH_Y=[97,168,239,310];
export function Search({t,option}:SceneProps) {
  const budget=[2,4,8][option],s=searchState(t,budget),progress=ph(t,0,9000);
  return <>
    <Header title="VERIFIER-GUIDED SEARCH / EXPLORE AND PRUNE" right={`${s.checked}/${budget} checks spent`}/>
    <circle cx={62} cy={201} r={23} fill="#151b26" stroke={C.rose}/><Text x={62} y={207} anchor="middle" kind="strong">Q</Text>
    {BRANCH_Y.map((y,i)=><g key={y}>
      <Line d={`M85 201Q133 201 178 ${y}`} opacity={.35}/><circle cx={186} cy={y} r={10} fill={i*2<s.checked?C.rose:"#25313e"}/>
      {[0,1].map(j=>{const n=i*2+j,yy=y+(j?17:-17),checked=n<s.checked,pass=n===3||n===6;const grow=ep(t,600+n*700,1300+n*700);return <g key={j} opacity={n<budget?1:.17}>
        <path d={`M197 ${y}Q277 ${y} 340 ${yy}`} pathLength={100} stroke={checked?pass?C.green:C.red:C.muted} strokeWidth={checked&&pass?2:1} fill="none" strokeDasharray={`${grow*100} 100`} strokeOpacity={checked&&!pass?.4:.8}/>
        <circle cx={348} cy={yy} r={7} fill={checked?pass?C.green:C.red:"#24333f"}/>
        <Text x={367} y={yy+4} kind="small" color={checked?pass?C.green:C.red:C.muted}>{n>=budget?"out of budget":checked?pass?"✓ passes":"× dead end":"unchecked"}</Text>
        {n<budget&&<Flight t={t} start={1400+n*850} end={2200+n*850} from={[197,y]} to={[348,yy]} color={C.rose} w={16}/>}
        {checked&&pass&&<Line d={`M466 ${yy}Q530 ${yy} 568 201`} color={C.green} opacity={.8}/>}</g>;})}
    </g>)}
    <Panel x={568} y={165} w={124} h={79} label={s.winner!==null?"VERIFIED":"FRONTIER"} color={s.winner!==null?C.green:C.muted}><Text x={630} y={213} kind="small" anchor="middle">{s.winner!==null?`path ${s.winner+1}`:s.exhausted?"no solution":"searching"}</Text></Panel>
    <Meter x={568} y={285} w={124} value={s.checked/budget} color={s.exhausted&&!s.passing.length?C.red:C.rose}/>
    <Text x={568} y={317} kind="small">{s.exhausted?"budget exhausted":`${Math.round(progress*100)}% replay`}</Text>
    <Caption title={s.exhausted&&!s.passing.length?"A small budget can end without a verified answer.":"Verification stops weak paths before they consume more search."} detail="Frontier; additional checks cost compute and do not guarantee success."/>
  </>;
}

export function TestCompute({t,option}:SceneProps) {
  const budget=[2,4,8][option],ready=Array.from({length:budget},(_,i)=>t>=1800+i*790).filter(Boolean).length,selected=t>=2500+budget*790;
  return <>
    <Header title="MORE INFERENCE COMPUTE / THE SAME WEIGHTS" right={`${budget} candidate budget`}/>
    <Panel x={28} y={117} w={145} h={141} label="FROZEN POLICY" color={C.muted}><Matrix x={48} y={157} cols={7} rows={4} size={12} gap={4} color={C.muted}/><Text x={99} y={241} kind="small" anchor="middle">θ unchanged</Text></Panel>
    {Array.from({length:8},(_,i)=>{const x=226+i%4*79,y=95+Math.floor(i/4)*134,pr=i<budget?ph(t,600+i*650,1800+i*790):0,done=pr===1,pass=i===3||i===6;return <g key={i} opacity={i<budget?1:.15}>
      <Line d={`M173 185Q195 185 ${x} ${y+30}`} opacity={.15}/>
      <rect x={x} y={y} width={66} height={99} rx={5} fill="#101923" stroke={done?pass?C.green:C.red:C.rose}/><Text x={x+33} y={y+22} kind="small" anchor="middle">τ{i+1}</Text>
      {[0,1,2,3].map(j=><rect key={j} x={x+11} y={y+33+j*10} width={Math.min(44,Math.max(0,(pr*4-j)*44))} height={3} rx={1.5} fill={C.rose} fillOpacity={.75}/>)}
      <Text x={x+33} y={y+87} kind="small" anchor="middle" color={done?pass?C.green:C.red:C.muted}>{i>=budget?"off":done?pass?"pass":"fail":"sample"}</Text>
    </g>;})}
    <Panel x={571} y={143} w={121} h={90} label="SELECT" color={selected&&budget>=4?C.green:C.rose}><Text x={631} y={191} kind="small" anchor="middle">{selected?budget>=4?"verified τ4":"none pass":"compare"}</Text><Text x={631} y={214} kind="small" anchor="middle">{ready}/{budget} checked</Text></Panel>
    <Text x={28} y={309} kind="small">NO BACKPROP</Text><Text x={28} y={328} kind="small">NO WEIGHT UPDATE</Text>
    <Meter x={571} y={268} w={121} value={ready/8} color={C.rose}/><Text x={571} y={293} kind="small">{ready} checks</Text><Text x={571} y={314} kind="small">not GPU cost</Text>
    <Caption title="Spend extra compute generating and checking candidates." detail="Toy candidate outcomes. A larger budget changes search, not the model parameters."/>
  </>;
}

export function Evaluation({t,option}:SceneProps) {
  const names=["Mathematics","Multi-step logic","Repository tasks"];
  const fields=["baseline + checkpoint","dataset / split / n","exact metric","confidence interval","matched actual compute","independent evaluator","raw results + analysis"],checked=Math.min(fields.length,Math.floor(t/1050));
  return <>
    <Header title="EVIDENCE GATE / A CLAIM NEEDS A RUN RECORD"/>
    <Panel x={28} y={66} w={208} h={77} label="PLANNED HOLDOUT" color={C.blue}><Text x={42} y={113} kind="strong">{names[option]}</Text><Text x={42} y={133} kind="small">require matched tasks</Text></Panel>
    <Panel x={28} y={168} w={208} h={132} label="MATCHED CHECKPOINTS" color={C.muted}>
      <Matrix x={43} y={207} cols={8} rows={2} size={8} gap={3} color={C.muted}/><Text x={145} y={221} kind="small">base</Text>
      <Matrix x={43} y={254} cols={8} rows={2} size={8} gap={3} color={C.rose}/><Text x={145} y={268} kind="small">trained</Text>
    </Panel>
    <Flux from={[237,233]} to={[287,233]} t={t} color={C.rose} count={2} active={checked<fields.length}/>
    <Panel x={290} y={66} w={402} h={261} label="REQUIRED RELEASE CONTEXT" color={C.rose}>
      {fields.map((field,i)=><g key={field}><Line d={`M306 ${116+i*29}H678`} opacity={.2}/><circle cx={310} cy={106+i*29} r={3} fill={i<checked?C.amber:C.muted}/><Text x={323} y={110+i*29} kind="small">{field}</Text><Text x={679} y={110+i*29} kind="small" anchor="end" color={i<checked?C.amber:C.muted}>{i<checked?"not attached":"pending"}</Text></g>)}
    </Panel>
    <Text x={28} y={331} kind="small" color={C.amber}>NO VERIFIED RUN BUNDLE</Text>
    <Caption title="Author-reported figures are not yet release-ready evidence." detail="Inspect the study's claim register. No measured gains are plotted without context."/>
  </>;
}

export const TRAINING_SCENES=[DataCuration,LoRA,Rollouts,GRPO,DPO,Search,TestCompute,Evaluation];
