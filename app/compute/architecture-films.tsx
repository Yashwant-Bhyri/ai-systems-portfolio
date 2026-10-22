import { C, PALETTE, Text, Line, Flight, Flux, Matrix } from "./primitives";
import { loop, ph, ep, q, mix } from "./simulation";

/** A serving fabric, not a row of software-feature cards. */
export function InferenceArchitectureFilm({t}:{t:number}) {
  const decode=t>3300,replace=t>6500,step=Math.floor(t/650)%8;
  return <>
    <Text x={30} y={30} kind="strong">Many requests. Shared computation. Separate state.</Text>
    <Text x={1110} y={30} anchor="end" kind="small">continuous serving cycle</Text>
    <Text x={30} y={75} kind="small">CONCURRENT PROMPTS</Text>
    {[0,1,2].map(i=>{const y=113+i*58,c=PALETTE[i];return <g key={i}>
      <circle cx={39} cy={y} r={4} fill={c}/><Text x={54} y={y-12} kind="small" color={c}>{i===2&&replace?"request D":"request "+String.fromCharCode(65+i)}</Text>
      {Array.from({length:7},(_,j)=><rect key={j} x={54+j*15} y={y-2} width={11} height={13} rx={2} fill={i<2&&j<3?C.cyan:c} fillOpacity={.3+(j===step%7?.6:0)}/>)}
      <Line d={`M168 ${y+4}C215 ${y+4} 224 ${133+i*29} 268 ${133+i*29}`} color={c}/>
      <Flight t={t%2600} start={i*350} end={1700+i*350} from={[171,y+4]} via={[215,y+4]} to={[284,133+i*29]} label={i===2&&replace?"D":String.fromCharCode(65+i)} color={c} w={27}/>
    </g>;})}
    <Text x={30} y={286} kind="small" color={C.cyan}>cyan = shared prefix</Text><Line d="M23 116H17V174H23" color={C.cyan}/>
    <Text x={270} y={83} kind="small">TOKEN BATCH</Text>
    {[0,1,2].map(i=><g key={i}><rect x={268} y={117+i*29} width={118} height={25} rx={3} fill={PALETTE[i]} fillOpacity={.1} stroke={PALETTE[i]} strokeOpacity={.55}/>{Array.from({length:5},(_,j)=><rect key={j} x={278+j*20} y={124+i*29} width={13} height={11} rx={2} fill={PALETTE[i]} fillOpacity={.3+.5*loop(t,1700,-j*260)}/>)}</g>)}
    <Text x={326} y={236} kind="small" anchor="middle">{replace?"C exits → D enters":decode?"decode, one token each":"prefill prompt chunks"}</Text>
    <Flux from={[387,161]} to={[467,161]} t={t} color={C.amber} count={4} period={1000}/>
    {/* Two devices are one model partition, not two unrelated feature boxes. */}
    <path d="M479 72H811L826 87V241H479Z" fill="#0b151c" stroke="#4c5251"/>
    <path d="M479 72L494 58H826V226L811 241M811 72V241M479 72L494 58" fill="none" stroke="#37424b"/>
    <Text x={494} y={96} kind="small">MODEL PARTITION / COORDINATED GPUS</Text>
    {[0,1].map(g=><g key={g}><rect x={505+g*151} y={113} width={130} height={91} rx={4} fill="#111e25" stroke={g?C.cyan:C.amber} strokeOpacity={.65}/><Matrix x={516+g*151} y={124} cols={8} rows={5} size={10} gap={5} t={t-g*300} mode="wave" color={g?C.cyan:C.amber}/><Text x={568+g*151} y={225} anchor="middle" kind="small">{g?"shard 1":"shard 0"}</Text></g>)}
    <Flux from={[635,160]} to={[656,160]} t={t} color={C.ink} count={1} period={600}/>
    <Flux from={[826,161]} to={[892,161]} t={t} color={C.green} period={900}/>
    <Text x={906} y={75} kind="small">INDEPENDENT TOKEN STREAMS</Text>
    {[0,1,2].map(i=><g key={i}><Line d={`M888 161Q899 ${114+i*57} 915 ${114+i*57}`} color={PALETTE[i]}/>
      {Array.from({length:7},(_,j)=>{const p=loop(t,3600,-j*460-i*100);return <rect key={j} x={q(916+p*188)} y={105+i*57} width={16} height={19} rx={3} fill={PALETTE[i]} fillOpacity={decode?.2+.8*Math.sin(p*Math.PI):.13}/>;})}
      <Text x={915} y={145+i*57} kind="small">{i===2&&replace?"D · new request":String.fromCharCode(65+i)+" · "+(decode?"streaming":"waiting for prefill")}</Text>
    </g>)}
    {/* KV is a working memory beside execution, with a return path. */}
    <Line d="M521 241V271H454" color={C.cyan}/><Line d="M454 301H763V241" color={C.cyan}/>
    <Flux from={[520,271]} to={[459,271]} t={t} color={C.cyan} count={2}/><Flux from={[565,301]} to={[762,301]} t={t} color={C.cyan}/>
    <Text x={235} y={279} kind="small">KV PAGE POOL</Text>
    {[0,1,2,3,4,5].map(i=><g key={i}><rect x={235+i*35} y={290} width={29} height={28} rx={3} fill={i<2?C.cyan:PALETTE[(i-2)%3]} fillOpacity={.18} stroke={i<2?C.cyan:PALETTE[(i-2)%3]}/><Text x={249+i*35} y={309} kind="small" anchor="middle" color={i<2?C.cyan:C.ink}>{i<2?"×2":"×1"}</Text></g>)}
    <Text x={235} y={345} kind="small" color={C.cyan}>shared prefix, private continuation</Text>
    <Text x={564} y={284} kind="small">read history ↔ append new KV</Text>
    <Line d="M985 290V347H558" dash color={C.amber}/><Text x={768} y={339} kind="small">profile → adjust the next iteration</Text>
  </>;
}

/** The geometry distinguishes parameter learning from inference-time search. */
export function TrainingArchitectureFilm({t}:{t:number}) {
  const learn=ph(t,1800,5700),search=ph(t,5900,9600),back=t>3500&&t<6100;
  return <>
    <Text x={28} y={30} kind="strong">First change the policy. Then give it more room to think.</Text>
    <Text x={1110} y={30} anchor="end" kind="small">two different compute loops</Text>
    <path d="M698 61V319" stroke="#4a4751" strokeDasharray="3 6"/>
    <Text x={28} y={66} kind="small" color={C.rose}>LEARNING / PARAMETERS CHANGE</Text>
    <Text x={733} y={66} kind="small" color={C.cyan}>INFERENCE / PARAMETERS FIXED</Text>
    {/* Actual trace pages travel through the data gate into the model. */}
    {[0,1,2].map(i=><g key={i} transform={`translate(${33+i*9} ${110-i*10})`}><path d="M0 0H73L84 11V84H0Z" fill="#111722" stroke={i===2?C.rose:"#4c4758"}/>{[0,1,2,3].map(j=><path key={j} d={`M12 ${22+j*13}H${58-(j%2)*14}`} stroke={i===2?C.rose:C.muted} strokeWidth={2} strokeOpacity={.25+.6*loop(t,2600,-j*250)}/>)}</g>)}
    <Text x={29} y={218} kind="small">verified reasoning</Text>
    <Flux from={[137,146]} to={[207,146]} t={t} color={C.rose} count={3}/>
    {/* Frozen dense core with a small separately trainable adapter surface. */}
    <rect x={211} y={88} width={184} height={144} rx={8} fill="#0e1720" stroke={C.rose} strokeOpacity={.65}/>
    <Matrix x={229} y={110} cols={8} rows={6} size={10} gap={4} color={C.muted}/>
    <Matrix x={353} y={110} cols={2} rows={6} size={10} gap={4} color={C.rose} mode={back?"update":"fixed"} t={t}/>
    <Text x={229} y={217} kind="small">Qwen3-4B</Text><Text x={383} y={250} kind="small" anchor="end" color={C.rose}>LoRA / SFT → policy</Text>
    {/* One policy samples a fan of reasoning paths, whose rewards return. */}
    {[0,1,2,3].map(i=>{const y=100+i*45;return <g key={i}>
      <path d={`M395 160C428 160 436 ${y} 455 ${y}H565`} stroke={PALETTE[i]} strokeOpacity={.3} fill="none"/>
      {[0,1,2,3].map(j=><circle key={j} cx={460+j*29} cy={y} r={3.3} fill={PALETTE[i]} opacity={learn>(j+i*.25)/5?1:.2}/>)}
      <Flight t={t} start={1500+i*300} end={3500+i*300} from={[397,160]} via={[429,y]} to={[565,y]} color={PALETTE[i]} w={15}/>
      <circle cx={598} cy={y} r={11} fill="#111c23" stroke={i===2?C.red:C.green} opacity={t>3100+i*300?1:.2}/><Text x={598} y={y+4} kind="small" anchor="middle" color={i===2?C.red:C.green}>{i===2?"−":"+"}</Text>
    </g>;})}
    <Text x={466} y={272} kind="small">grouped reasoning → rewards</Text>
    <path d="M612 166H648V302H301V232" fill="none" stroke={C.rose} strokeOpacity={.7}/>
    <Flux from={[601,302]} to={[333,302]} t={t} color={C.rose} count={4} active={back}/>
    <Text x={373} y={327} kind="small" color={C.rose}>relative advantage → adapter update</Text>
    {/* The checkpoint crosses a boundary; only candidate search moves beyond it. */}
    <Flight t={t} start={5400} end={6600} from={[648,165]} to={[743,165]} label="θ*" color={C.cyan} w={35}/>
    <Line d="M651 165H738" color={C.cyan}/>
    <circle cx={765} cy={165} r={24} fill="#0f1e27" stroke={C.cyan}/><Text x={765} y={171} anchor="middle" kind="strong" color={C.cyan}>θ*</Text>
    <Text x={765} y={217} anchor="middle" kind="small">fixed checkpoint</Text>
    {[0,1,2].map(i=>{const y=107+i*59,pass=i===1;return <g key={i}>
      <path d={`M789 165Q813 ${y} 862 ${y}L922 ${y-15}M862 ${y}L922 ${y+15}`} stroke={search>.15?(pass?C.green:C.muted):"#26333e"} fill="none"/>
      <Flight t={t} start={6400+i*600} end={8400+i*450} from={[789,165]} via={[849,y]} to={[923,y]} color={pass?C.green:C.cyan} w={14}/>
      <circle cx={930} cy={y-15} r={5} fill={search>.6?(pass?C.green:C.red):"#283541"}/><circle cx={930} cy={y+15} r={5} fill={search>.8?C.red:"#283541"}/>
      {pass&&<path d={`M938 ${y-15}Q983 ${y-15} 1030 163`} stroke={C.green} strokeWidth={2} strokeOpacity={search} fill="none"/>}
    </g>;})}
    <path d="M1036 139H1099V190H1036Z" stroke={C.green} fill="#101d1b" fillOpacity={search}/><path d="M1054 163L1065 173L1083 151" stroke={C.green} strokeWidth={3} fill="none" opacity={search}/>
    <Text x={955} y={279} kind="small" anchor="middle">expand → verify → select</Text>
    <Text x={955} y={300} kind="small" anchor="middle" color={C.cyan}>more search, no weight update</Text>
    <Line d="M28 350H1111"/><Text x={28} y={373} kind="small">DPO: a separate preference-pair route</Text><Text x={1110} y={373} anchor="end" kind="small">held-out evaluation checks both loops</Text>
  </>;
}

/** Homepage previews have their own close-up composition, never shrunken labels. */
export function ComputeMiniGraphic({domain,t}:{domain:"inference"|"training";t:number}) {
  if(domain==="inference")return <>
    {[0,1,2].map(i=><g key={i}><path d={`M13 ${28+i*28}H81Q96 ${28+i*28} 106 55`} fill="none" stroke={PALETTE[i]} strokeOpacity={.35}/>{[0,1,2].map(j=><rect key={j} x={q(13+70*loop(t,2200,-j*530-i*100))} y={23+i*28} width={14} height={10} rx={2} fill={PALETTE[i]}/>)}</g>)}
    <rect x={112} y={20} width={91} height={68} rx={5} fill="#0e1b23" stroke={C.amber}/><Matrix x={123} y={31} cols={5} rows={4} size={9} gap={5} color={C.amber} t={t} mode="wave"/>
    <Flux from={[204,55]} to={[240,55]} t={t} color={C.cyan} count={2}/>
    {[0,1,2].map(i=><g key={i}><path d={`M240 55Q251 ${28+i*28} 319 ${28+i*28}`} fill="none" stroke={PALETTE[i]} strokeOpacity={.4}/><rect x={q(248+66*loop(t,1600,-i*300))} y={23+i*28} width={13} height={10} rx={2} fill={PALETTE[i]}/></g>)}
    <path d="M142 89V109H85M172 89V109H230" stroke={C.cyan} fill="none" strokeOpacity={.6}/>{[0,1,2,3].map(i=><rect key={i} x={96+i*33} y={99} width={23} height={20} rx={2} fill={i<2?C.cyan:C.blue} fillOpacity={.2} stroke={i<2?C.cyan:C.blue}/>)}
  </>;
  const p=ep(t%6000,2000,5200);
  return <>
    <Matrix x={20} y={34} cols={5} rows={5} size={8} gap={3} color={C.muted}/><Matrix x={77} y={34} cols={2} rows={5} size={8} gap={3} color={C.rose} t={t} mode="update"/>
    {[0,1,2].map(i=><g key={i}><path d={`M99 60Q122 ${24+i*35} 164 ${24+i*35}`} stroke={C.rose} strokeOpacity={.4} fill="none"/><circle cx={q(mix(102,165,loop(t,1900,-i*300)))} cy={q(mix(60,24+i*35,loop(t,1900,-i*300)))} r={3} fill={PALETTE[i]}/><circle cx={174} cy={24+i*35} r={6} fill={i===1?C.red:C.green}/><rect x={213} y={17+i*35} width={q(38+(i===1?-26:42)*p)} height={14} rx={2} fill={i===1?C.red:C.green} fillOpacity={.65}/></g>)}
    <path d="M300 24V122H60V91" stroke={C.rose} strokeOpacity={.5} fill="none"/><Flux from={[261,122]} to={[78,122]} t={t} color={C.rose} count={3}/>
  </>;
}
