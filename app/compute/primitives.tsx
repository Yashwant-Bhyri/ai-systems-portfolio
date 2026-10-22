import { memo, type ReactNode } from "react";
import { bez, ep, loop, q, type Point } from "./simulation";

export const C = { amber:"#ffc267", blue:"#78a8ff", cyan:"#62e9ff", rose:"#f3a0bc", green:"#b8e986", red:"#ff8176", muted:"#8998ab", ink:"#f4f5ef" };
export const PALETTE = [C.amber,C.blue,C.rose,C.cyan];
export type SceneProps = {t:number;option:number};
export function Text({x,y,children,kind="body",anchor="start",color}:{x:number;y:number;children:ReactNode;kind?:string;anchor?:"start"|"middle"|"end";color?:string}) {
  return <text x={q(x)} y={q(y)} textAnchor={anchor} className={`cx-text cx-${kind}`} style={color?{fill:color}:undefined}>{children}</text>;
}
export function Line({d,color=C.muted,opacity=.4,dash=false}:{d:string;color?:string;opacity?:number;dash?:boolean}) {
  return <path d={d} fill="none" stroke={color} strokeWidth={1.2} strokeOpacity={opacity} strokeDasharray={dash?"4 5":undefined}/>;
}
export function Chip({x,y,w=52,h=26,label,color=C.amber,opacity=1}:{x:number;y:number;w?:number;h?:number;label?:string;color?:string;opacity?:number}) {
  return <g transform={`translate(${q(x)} ${q(y)})`} opacity={opacity}><rect x={-w/2} y={-h/2} width={w} height={h} rx={4} fill="#101820" stroke={color}/>{label?<Text x={0} y={4} anchor="middle" kind="small" color={color}>{label}</Text>:<path d={`M${-w*.28} 0H${w*.28}`} stroke={color} strokeWidth={3}/>}</g>;
}
/** Objects travel along a real trajectory, rather than decorative moving dashes. */
export function Flight({t,start,end,from,to,via,label,color=C.amber,w=42,keep=false}:{t:number;start:number;end:number;from:Point;to:Point;via?:Point;label?:string;color?:string;w?:number;keep?:boolean}) {
  if(t<start||(!keep&&t>end))return null;
  const p=ep(t,start,end), [x,y]=bez(p,from,via??[(from[0]+to[0])/2,(from[1]+to[1])/2],to);
  return <Chip x={x} y={y} w={w} label={label} color={color}/>;
}
export function Flux({from,to,t,color=C.amber,count=3,period=1800,active=true}:{from:Point;to:Point;t:number;color?:string;count?:number;period?:number;active?:boolean}) {
  return <g><Line d={`M${from[0]} ${from[1]}L${to[0]} ${to[1]}`} color={color}/>{active&&Array.from({length:count},(_,i)=>{const p=loop(t,period,-i*period/count);return <circle key={i} cx={q(from[0]+(to[0]-from[0])*p)} cy={q(from[1]+(to[1]-from[1])*p)} r={2.8} fill={color} opacity={.3+.7*Math.sin(p*Math.PI)}/>;})}</g>;
}
export const Matrix = memo(function Matrix({x,y,cols=6,rows=6,size=12,gap=3,color=C.amber,t=0,mode="fixed",progress=1}:{x:number;y:number;cols?:number;rows?:number;size?:number;gap?:number;color?:string;t?:number;mode?:"fixed"|"wave"|"update";progress?:number}) {
  return <g>{Array.from({length:cols*rows},(_,i)=>{const col=i%cols,row=Math.floor(i/cols), wave=(col+row)*220;const intensity=mode==="fixed"?.2+((i*7)%11)/16:mode==="update"?.17+((i*7+Math.floor(t/500))%11)/15:.12+.8*Math.max(0,1-Math.abs(((t-wave+5000)%2400)/400-2));return <rect key={i} x={x+col*(size+gap)} y={y+row*(size+gap)} width={size} height={size} rx={1.5} fill={color} opacity={i<cols*rows*progress?intensity:.06}/>;})}</g>;
});
export function Panel({x,y,w,h,label,children,color=C.muted}:{x:number;y:number;w:number;h:number;label?:string;children?:ReactNode;color?:string}) {
  return <g><rect x={x} y={y} width={w} height={h} rx={7} fill="#0c131b" stroke={color} strokeOpacity={.45}/>{label&&<Text x={x+12} y={y+21} kind="small" color={color}>{label}</Text>}{children}</g>;
}
export function Header({title,right}:{title:string;right?:string}) {
  return <><Text x={28} y={30} kind="eyebrow">{title}</Text>{right&&<Text x={692} y={30} anchor="end" kind="small">{right}</Text>}</>;
}
export function Caption({title,detail}:{title:string;detail:string}) {
  return <g><Line d="M28 353H692"/><Text x={28} y={378} kind="strong">{title}</Text><Text x={28} y={401} kind="small">{detail}</Text></g>;
}
export function Meter({x,y,w,value,color=C.amber,label}:{x:number;y:number;w:number;value:number;color?:string;label?:string}) {
  return <g><rect x={x} y={y} width={w} height={6} rx={3} fill="#24313e"/><rect x={x} y={y} width={Math.max(0,w*value)} height={6} rx={3} fill={color}/>{label&&<Text x={x} y={y+23} kind="small">{label}</Text>}</g>;
}
