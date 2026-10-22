import { C, PALETTE, Text, Line, Chip, Flight, Flux, Matrix, Panel, Header, Caption, Meter, type SceneProps } from "./primitives";
import { ep, ph, mix, q, loop, kvState } from "./simulation";

export function Scheduling({t,option}:SceneProps) {
  const continuous=option===0, iteration=Math.min(8,Math.floor(t/1100));
  const replaced=t>=3900&&continuous, next=t>=7200&&continuous;
  const ids=["A",next?"E":"B",replaced?"D":"C"];
  return <>
    <Header title="A SLOT IS TIME ON THE GPU" right={`iteration ${iteration+1} · toy workload`}/>
    <Text x={28} y={68} kind="small">WAITING</Text><Text x={208} y={68} kind="small">ACTIVE DECODE BATCH</Text><Text x={686} y={68} kind="small" anchor="end">EMITTED TOKENS →</Text>
    {["D","E"].map((id,i)=>{const start=i?6500:3200,end=i?7200:3900,dest=i?185:264;return <g key={id}>
      <Chip x={77} y={116+i*76} w={84} h={42} label={`req ${id}`} color={PALETTE[i+2]} opacity={continuous&&t>start?.15:1}/>
      <Text x={77} y={147+i*76} anchor="middle" kind="small">{continuous&&t>end?"admitted":"in queue"}</Text>
      {continuous&&<Flight t={t} start={start} end={end} from={[77,116+i*76]} via={[154,116+i*76]} to={[220,dest]} label={id} color={PALETTE[i+2]}/>}
    </g>;})}
    <Line d="M166 85V302"/>
    {ids.map((id,row)=>{const y=103+row*79,oldEnded=(row===2&&t>=3200)||(row===1&&t>=6500),empty=oldEnded&&!continuous;const start=id==="D"?3900:id==="E"?7200:0;const count=Math.min(id==="C"?3:9,Math.max(0,Math.floor((t-start)/1100)+1));const col=id==="D"?C.cyan:id==="E"?C.rose:PALETTE[row];return <g key={row}>
      <rect x={187} y={y-9} width={505} height={58} rx={6} fill="#0d151e" stroke={empty?"#344151":col} strokeOpacity={.45}/>
      <Text x={210} y={y+23} color={empty?C.muted:col} kind="strong">{empty?"∅":id}</Text>
      {Array.from({length:9},(_,j)=><rect key={j} x={249+j*47} y={y+5} width={37} height={28} rx={3} fill={col} fillOpacity={!empty&&j<count?.2:.035} stroke={col} strokeOpacity={!empty&&j<count?.65:.13}/>)}
      {!empty&&Array.from({length:count},(_,j)=><Text key={j} x={267+j*47} y={y+24} kind="small" anchor="middle" color={col}>{j+1}</Text>)}
      {!empty&&<circle cx={q(249+Math.min(8,count-1)*47+37*loop(t-start,1100))} cy={y+41} r={3} fill={col}/>}
      {empty&&<Text x={446} y={y+24} anchor="middle" kind="small">finished · waiting for longest sequence</Text>}
    </g>;})}
    <Meter x={28} y={283} w={110} value={continuous?1:(t>=6500?1/3:t>=3200?2/3:1)} label={`${continuous?3:t>=6500?1:t>=3200?2:3}/3 slots occupied`} color={continuous?C.amber:C.muted}/>
    <Text x={209} y={333} kind="accent">{next?"E replaces B; A continues without restarting.":replaced?"D replaces C at the next scheduling boundary.":t>=3200?"C is complete. Fixed batching leaves its slot empty.":"Different response lengths share one execution step."}</Text>
    <Caption title={continuous?"Finished sequences leave. New work enters.":"The longest sequence holds the fixed batch open."} detail="Same illustrative requests; switch the scheduler to see the idle-slot tradeoff."/>
  </>;
}

export function KVCache({t,option}:SceneProps) {
  const shared=option===0,s=kvState(t,shared),prefixReady=t>3300;
  return <>
    <Header title="PREFIX REUSE / PHYSICAL KV OWNERSHIP" right={`${s.allocated} pages referenced`}/>
    {[["A",s.a,s.aCount,79],["B",s.b,s.bCount,146]].map(([id,pages,count,y])=>{
      const row=id==="A"?0:1,arr=pages as number[],yy=Number(y);return <g key={String(id)} opacity={row===0&&s.released?.4:1}>
      <Text x={28} y={yy+5} kind="strong" color={row?C.blue:C.amber}>req {String(id)}</Text>
      {arr.map((page,i)=><g key={i}><Chip x={125+i*71} y={yy} w={61} h={31} label={i<2&&shared?`prefix${i}`:`${id}:${i}`} color={i<2&&shared?C.cyan:row?C.blue:C.amber} opacity={i<Number(count)?1:.18}/><Text x={125+i*71} y={yy+29} anchor="middle" kind="small">{i<Number(count)?`→ p${page}`:"pending"}</Text></g>)}
      <Text x={407} y={yy+5} kind="small">{row===0?s.released?"release A · refs −1":"prefill computed":prefixReady&&shared?"prefix hit · refs +1":"compute new KV"}</Text>
      </g>;
    })}
    <Text x={28} y={218} kind="small">GPU PAGE POOL</Text><Text x={692} y={218} anchor="end" kind="small">page id / live refs</Text>
    {s.refs.map((refs,i)=>{const x=28+i%12*56,y=231+Math.floor(i/12)*52,color=shared&&(i===2||i===7)?C.cyan:s.b.includes(i)?C.blue:C.amber;return <g key={i}>
      <rect x={x} y={y} width={48} height={42} rx={4} fill={refs?color:"#111a24"} fillOpacity={refs?.12:.7} stroke={refs?color:"#33404f"}/>
      <Text x={x+9} y={y+16} kind="small">{i}</Text><Text x={x+37} y={y+32} kind="small" color={refs?color:C.muted} anchor="end">{refs}</Text>
      {refs===2&&<path d={`M${x+6} ${y+36}H${x+42}`} stroke={C.cyan} strokeWidth={2}/>}</g>;})}
    {s.b.map((page,i)=>{const start=2800+i*550;return <Flight key={page} t={t} start={start} end={start+520} from={[125+i*71,178]} via={[125+i*71,209]} to={[52+page%12*56,252+Math.floor(page/12)*52]} label={shared&&i<2?"+1":"KV"} color={shared&&i<2?C.cyan:C.blue} w={34}/>;})}
    {s.released&&<Text x={28} y={342} kind="accent">{shared?"A exits. B still owns the shared prefix; it cannot be reclaimed.":"A exits. Only A's private pages return to the free pool."}</Text>}
    <Caption title={shared?"Two block tables. One stored copy of the prefix.":"Different prefixes need different KV computation."} detail="Full-block reuse is schematic; sharing requires matching tokens and cache context."/>
  </>;
}

export function Kernels({t,option}:SceneProps) {
  const fused=option===1,step=Math.min(3,Math.floor(t/2100)),p=ph(t,500,7900),tile=Math.floor(t/580)%24;
  return <>
    <Header title="INSIDE A TILED MATRIX OPERATION" right={fused?"fused execution · schematic":"separate launches · schematic"}/>
    <Text x={28} y={70} kind="small">ACTIVATION TILES</Text><Matrix x={30} y={88} cols={6} rows={4} size={18} gap={5} color={C.blue}/>
    <rect x={28+(tile%3)*46} y={86+Math.floor(tile/3)%2*46} width={45} height={45} rx={3} fill={C.blue} fillOpacity={.14} stroke={C.blue}/>
    <Text x={28} y={221} kind="small">WEIGHT TILES</Text><Matrix x={30} y={238} cols={6} rows={3} size={18} gap={5} color={C.rose}/>
    <Panel x={252} y={80} w={240} h={212} label="SM / SHARED MEMORY" color={C.amber}>
      <Matrix x={276} y={126} cols={8} rows={5} size={19} gap={5} color={C.amber} t={t} mode="wave"/>
      <Text x={372} y={271} anchor="middle" kind="small">load → multiply → accumulate</Text>
    </Panel>
    <Flux from={[170,123]} to={[252,153]} t={t} color={C.blue}/><Flux from={[170,264]} to={[252,224]} t={t} color={C.rose}/>
    <Flux from={[492,185]} to={[558,185]} t={t} color={C.cyan}/>
    <Text x={562} y={101} kind="small">OUTPUT TILE</Text><Matrix x={562} y={125} cols={6} rows={6} size={17} gap={5} color={C.cyan} progress={p}/>
    <Text x={624} y={281} anchor="middle" kind="small">C ← A × B + C</Text>
    {["load","matmul","activation","write"].map((s,i)=>{const x=28+i*(fused?151:174),w=fused?150:131;return <g key={s}><rect x={x} y={315} width={w} height={24} fill={step>=i?C.amber:"#24313d"} fillOpacity={step>=i?.18:.5}/><Text x={x+w/2} y={331} anchor="middle" kind="small">{s}</Text>{!fused&&i<3&&<Text x={x+w+20} y={331} anchor="middle" kind="small" color={C.red}>gap</Text>}</g>;})}
    <Caption title={fused?"Reuse intermediates. Avoid extra trips to device memory.":"An occupied GPU depends on movement as well as math."} detail="Illustrative tiling and fusion; dimensions and timing do not model a specific kernel."/>
  </>;
}

const WEIGHTS=[-.86,-.52,-.29,-.07,.18,.43,.71,.89];
export function Quantization({t,option}:SceneProps) {
  const bits=[16,8,4][option],levels=2**bits-1,p=ep(t,1300,4600),pack=ep(t,4700,7600);
  return <>
    <Header title="THE SAME WEIGHTS / FEWER STORAGE BITS" right={`${bits}-bit representation`}/>
    <Text x={28} y={66} kind="small">ORIGINAL VALUES</Text>
    <Line d="M52 107H667"/>
    {[-1,-.5,0,.5,1].map((v,i)=><g key={v}><Line d={`M${52+i*154} 99V113`}/><Text x={52+i*154} y={93} anchor="middle" kind="small">{v}</Text></g>)}
    <Text x={28} y={187} kind="small">{bits===16?"REFERENCE PRECISION":"ROUNDED TO A QUANTIZATION GRID"}</Text><Line d="M52 218H667" color={C.amber}/>
    {Array.from({length:bits===4?16:33},(_,i)=>{const x=52+i*615/(bits===4?15:32);return <path key={i} d={`M${x} 211V225`} stroke={C.amber} strokeOpacity={.45}/>;})}
    {WEIGHTS.map((v,i)=>{const rounded=bits===16?v:Math.round((v+1)/2*levels)/levels*2-1,x=52+(v+1)/2*615,x2=52+(rounded+1)/2*615;return <g key={i}><circle cx={x} cy={107} r={4} fill={C.blue}/><Line d={`M${x} 118L${x2} 218`} color={C.blue} opacity={.15}/><circle cx={q(mix(x,x2,p))} cy={q(mix(107,218,p))} r={6} fill={C.amber}/>{i%2===0&&<Text x={x2} y={246} kind="small" anchor="middle">{rounded.toFixed(2)}</Text>}</g>;})}
    <Text x={28} y={292} kind="small">PACKED WEIGHT BYTES</Text>
    {Array.from({length:16},(_,i)=>{const end=28+i*(bits/16)*27;return <rect key={i} x={q(mix(28+i*27,end,pack))} y={309} width={q(mix(23,Math.max(3,23*bits/16),pack))} height={24} rx={2} fill={C.amber} fillOpacity={.2+i%3*.2}/>;})}
    <Text x={690} y={328} anchor="end" kind="accent">{bits/16}× weight bytes</Text>
    <Caption title="Storage shrinks. Rounding changes the represented values." detail="Toy symmetric grid; scale metadata, activations, KV and workspace cost extra."/>
  </>;
}

export function Speculation({t,option}:SceneProps) {
  const accepted=option===0?3:1,tokens=["The","cache","stores","weights","here"],verified=t>=4000,commit=t>=6200;
  return <>
    <Header title="PROPOSE → VERIFY → COMMIT" right="greedy verification example"/>
    <Text x={28} y={87} kind="strong">Draft</Text><Text x={28} y={109} kind="small">small model</Text>
    <Text x={28} y={185} kind="strong">Target</Text><Text x={28} y={207} kind="small">one pass</Text>
    <Text x={28} y={296} kind="strong">Output</Text><Text x={28} y={318} kind="small">committed</Text>
    {tokens.map((s,i)=>{const x=191+i*110,arrive=ep(t,i*420,400+i*420),fall=ep(t,5700,6700);return <g key={s}>
      <g transform={`translate(0 ${q(-12+12*arrive)})`} opacity={arrive}><Chip x={x} y={94} w={96} h={33} label={s} color={C.blue}/></g>
      <Line d={`M${x} 113V157`} color={C.blue}/>
      <Flight t={t} start={2200+i*100} end={3600+i*100} from={[x,112]} to={[x,184]} label={s} color={C.blue} w={86}/>
      <g opacity={verified?1:.3}><rect x={x-48} y={162} width={96} height={45} rx={4} fill="#111b25" stroke={!verified?C.muted:i<accepted?C.green:C.red}/><Text x={x} y={190} anchor="middle" kind="small" color={!verified?C.muted:i<accepted?C.green:C.red}>{!verified?"waiting":i<accepted?"✓ accept":i===accepted?"× mismatch":"discard"}</Text></g>
      {i<accepted?<Flight t={t} start={5800+i*160} end={7100+i*160} from={[x,218]} to={[x,297]} label={s} color={C.green} w={96} keep/>:verified&&<g opacity={1-fall} transform={`translate(0 ${q(85*fall)})`}><Chip x={x} y={239} w={86} label={s} color={C.red}/></g>}
    </g>;})}
    {commit&&<Flight t={t} start={6200} end={7800} from={[191+accepted*110,180]} via={[171+accepted*110,250]} to={[191+accepted*110,297]} label={accepted===3?"keys":"model"} color={C.amber} w={96} keep/>}
    {t>=7800&&<Text x={690} y={339} kind="small" anchor="end">resume draft from corrected prefix →</Text>}
    <Caption title={verified?`${accepted} accepted. Discard the suffix and correct the next token.`:"A draft proposes multiple tokens before target verification."} detail="Acceptance determines useful work; an early mismatch removes more draft progress."/>
  </>;
}

export function Parallelism({t,option}:SceneProps) {
  const pipeline=option===1,p=ph(t,400,9100);
  if(pipeline)return <>
    <Header title="PIPELINE PARALLELISM / SPACE–TIME VIEW" right="four microbatches"/>
    {[0,1,2,3].map(g=><g key={g}><Text x={28} y={104+g*62} kind="strong">GPU {g}</Text><Text x={28} y={123+g*62} kind="small">layers {g*8}–{g*8+7}</Text><Line d={`M137 ${133+g*62}H692`}/></g>)}
    {[0,1,2,3].map(b=><g key={b}>{[0,1,2,3].map(g=>{const start=(g+b)*1180,end=start+1050,pr=ep(t,start,end),x=143+(g+b)*75,y=90+g*62;return <g key={g} opacity={t>=start?1:.16}><rect x={x} y={y} width={66*pr+1} height={31} rx={3} fill={PALETTE[b]} fillOpacity={.25} stroke={PALETTE[b]}/>{pr>.5&&<Text x={x+33} y={y+21} anchor="middle" kind="small" color={PALETTE[b]}>μ{b+1}</Text>}{g<3&&<Flight t={t} start={end} end={end+300} from={[x+66,y+16]} to={[x+75,y+78]} color={PALETTE[b]} w={19}/>}</g>;})}</g>)}
    <Line d={`M${q(143+p*522)} 63V326`} color={C.amber}/><Text x={140} y={338} kind="small">fill bubble</Text><Text x={687} y={338} anchor="end" kind="small">time →</Text>
    <Caption title="A microbatch moves through layers; other batches follow." detail="Color identifies the microbatch. Empty cells expose pipeline fill and drain bubbles."/>
  </>;
  const combine=ep(t,4100,7100);
  return <>
    <Header title="TENSOR PARALLELISM / ONE LAYER, FOUR SHARDS" right="illustrative row-parallel layer"/>
    {[0,1,2,3].map(i=><g key={i}>
      <Panel x={28+i*170} y={69} w={151} h={155} label={`GPU ${i} · W${i}`} color={PALETTE[i]}><Matrix x={48+i*170} y={112} cols={6} rows={4} size={14} gap={4} color={PALETTE[i]} t={t} mode="wave"/><Text x={103+i*170} y={204} anchor="middle" kind="small">partial y{i}</Text></Panel>
      <Flight t={t} start={3000+i*160} end={6000+i*160} from={[103+i*170,225]} via={[103+i*170,281]} to={[318+i*28,288]} label={`y${i}`} color={PALETTE[i]} w={28}/>
    </g>)}
    <Line d="M103 237V253H613V237" color={C.cyan}/><Flux from={[103,253]} to={[613,253]} t={t} color={C.cyan} active={t>2500&&t<7000}/>
    <Text x={28} y={287} kind="small">ALL-REDUCE</Text><Text x={28} y={308} kind="small">sum partial outputs</Text>
    <g opacity={combine}><rect x={309} y={273} width={118} height={49} rx={6} fill="#14212a" stroke={C.cyan}/><Text x={368} y={304} anchor="middle" kind="strong" color={C.cyan}>Σ yᵢ</Text></g>
    <Text x={688} y={304} anchor="end" kind="small">next layer →</Text><Flux from={[432,297]} to={[562,297]} t={t} color={C.cyan} active={t>7100}/>
    <Caption title="Compute in parallel. Synchronize the dependent result." detail="Sharding saves per-device capacity; collective communication stays on the path."/>
  </>;
}

export function Profiling({t,option}:SceneProps) {
  const overlap=option===1,x=150+ph(t,0,8700)*528,first=overlap?530:616;
  const events=[{y:98,x:150,w:78,s:"queue",c:C.muted},{y:98,x:236,w:64,s:"launch",c:C.blue},{y:157,x:303,w:145,s:"prefill",c:C.amber},{y:216,x:overlap?320:453,w:83,s:"copy KV",c:C.cyan},{y:157,x:overlap?457:543,w:73,s:"decode",c:C.amber}];
  return <>
    <Header title="FOLLOW THE DEPENDENCY, NOT JUST UTILIZATION" right="relative time units"/>
    {["CPU","GPU","TRANSFER","TOKEN"].map((s,i)=><g key={s}><Text x={28} y={120+i*59} kind="small">{s}</Text><Line d={`M150 ${138+i*59}H692`}/></g>)}
    {events.map((e,i)=><g key={i}><rect x={e.x} y={e.y} width={e.w} height={30} rx={3} fill={e.c} fillOpacity={.08} stroke={e.c} strokeOpacity={.3}/><rect x={e.x} y={e.y} width={Math.max(0,Math.min(e.w,x-e.x))} height={30} rx={3} fill={e.c} fillOpacity={.28}/><Text x={e.x+e.w/2} y={e.y+20} kind="small" anchor="middle">{e.s}</Text></g>)}
    <path d={`M448 172H${overlap?457:543}`} stroke={C.red} strokeWidth={2} strokeDasharray="3 4"/>
    <Text x={overlap?566:495} y={151} kind="small" color={overlap?C.cyan:C.red} anchor="middle">{overlap?"copy overlaps prefill":"memory wait"}</Text>
    {[first,first+31,first+61].map((v,i)=><g key={i} opacity={x>v?1:.15}><Chip x={v} y={289} w={24} label={`${i}`} color={C.green}/></g>)}
    <Line d={`M${q(x)} 68V310`} color={C.ink}/><circle cx={q(x)} cy={68} r={3} fill={C.ink}/>
    <Line d={`M150 329H${first}`} color={C.amber}/><Text x={(150+first)/2} y={345} kind="small" anchor="middle">time to first token</Text>
    <Caption title={overlap?"Move independent transfers off the critical dependency.":"A memory dependency can leave compute waiting."} detail="Schematic comparison only. Validate overlap and latency on a controlled workload."/>
  </>;
}

export function Lifecycle({t,option}:SceneProps) {
  const cancel=option===1,release=ep(t,cancel?5700:7600,cancel?7400:9200),routed=t>2300;
  return <>
    <Header title="SERVING / ROUTE, STREAM, RECLAIM" right={cancel?"cancellation path":"completion path"}/>
    <Panel x={28} y={70} w={142} h={112} label="REQUESTS" color={C.blue}>
      {[0,1,2].map(i=><Chip key={i} x={99} y={110+i*25} w={101} h={19} label={`req ${String.fromCharCode(65+i)}`} color={i?C.muted:C.blue} opacity={i===0&&routed?.2:1}/>)}
    </Panel>
    <Panel x={242} y={92} w={142} h={83} label="ROUTER" color={C.amber}><Text x={313} y={142} kind="small" anchor="middle">capacity-aware</Text></Panel>
    <Flux from={[170,128]} to={[242,128]} t={t} color={C.blue} active={t<2300}/>
    {[0,1].map(i=><g key={i}><Panel x={476} y={65+i*94} w={216} h={72} label={`REPLICA ${i}`} color={i?C.cyan:C.muted}><Meter x={491} y={100+i*94} w={184} value={i?Math.max(.25,.25+.4*ph(t,2000,4000)-.4*release):.85} color={i?C.cyan:C.muted}/><Text x={491} y={126+i*94} kind="small">{i?release===1?"pages returned":"request A allocated":"busy · low headroom"}</Text></Panel><Line d={`M384 132L476 ${101+i*94}`} color={i?C.cyan:C.muted}/></g>)}
    <Flight t={t} start={600} end={2300} from={[170,120]} via={[390,80]} to={[476,195]} label="req A" color={C.blue}/>
    <Text x={28} y={234} kind="small">CLIENT STREAM</Text><Line d="M28 266H391"/>
    {["The","cache","holds","keys","and","values"].map((s,i)=>{const at=2500+i*570,stop=cancel?5200:7000;return t>at&&t<stop?<Flight key={s} t={t} start={at} end={at+1200} from={[462,238]} to={[58+i*62,267]} label={s} color={C.cyan} w={57} keep/>:null;})}
    {t>(cancel?5200:7000)&&<Text x={28} y={269} color={cancel?C.red:C.green} kind="strong">{cancel?"× client cancelled · stop generation":"✓ completed · end of stream"}</Text>}
    <Text x={477} y={262} kind="small">OWNED KV → FREE POOL</Text>
    {[0,1,2,3,4,5].map(i=><g key={i}><rect x={477+i*34} y={277} width={25} height={24} rx={3} fill={C.cyan} fillOpacity={.15*(1-release)} stroke={C.cyan} strokeOpacity={1-release*.8}/><rect x={477+i*34} y={320} width={25} height={24} rx={3} fill={release===1?C.green:"#101820"} fillOpacity={.25} stroke={release===1?C.green:C.muted}/>{release>0&&release<1&&<Chip x={489+i*34} y={q(289+43*release)} w={25} h={24} color={C.green}/>}</g>)}
    <Text x={28} y={334} kind="accent">{release===1?"Capacity recovered for the next request.":release>0?"Cancel in-flight work; release request-owned memory.":"Routing and token flow carry the same request identity."}</Text>
    <Caption title="A request is not finished until its resources are released." detail="Toy two-replica serving path. Cleanup runs for both completion and cancellation."/>
  </>;
}

export const INFERENCE_SCENES=[Scheduling,KVCache,Kernels,Quantization,Speculation,Parallelism,Profiling,Lifecycle];
