/** Pure, bounded toy models. Visual illustrations, never benchmark telemetry. */
export const DURATION = 10400;
export const clamp = (v: number) => Math.max(0, Math.min(1, v));
export const ph = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const ease = (v: number) => v * v * (3 - 2 * v);
export const ep = (t: number, a: number, b: number) => ease(ph(t, a, b));
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;
export const q = (v: number) => Math.round(v * 100) / 100;
export const pulse = (t: number, period = 1200) => .5 + .5 * Math.sin(t / period * Math.PI * 2);
export const loop = (t: number, period: number, offset = 0) => ((t + offset) % period + period) % period / period;
export type Point = readonly [number, number];
export function bez(p: number, a: Point, c: Point, b: Point): Point {
  return [(1-p)**2*a[0]+2*(1-p)*p*c[0]+p*p*b[0], (1-p)**2*a[1]+2*(1-p)*p*c[1]+p*p*b[1]];
}
export function kvState(t: number, shared: boolean) {
  const a = [2, 7, 11, 16];
  const b = shared ? [2, 7, 18, 21] : [0, 5, 18, 21];
  const aCount = Math.min(4, Math.floor(t / 500) + 1);
  const bCount = Math.min(4, Math.max(0, Math.floor((t - 3320) / 550) + 1));
  const released = t >= 7200;
  const refs = Array.from({length:24}, (_, page) =>
    (released ? 0 : Number(a.slice(0,aCount).includes(page))) + Number(b.slice(0,bCount).includes(page)));
  return {a, b, aCount, bCount, released, refs, allocated: refs.filter(Boolean).length};
}
export function advantages(rewards: readonly number[]) {
  const mean = rewards.reduce((a,b)=>a+b,0)/rewards.length;
  const std = Math.sqrt(rewards.reduce((a,b)=>a+(b-mean)**2,0)/rewards.length);
  return {mean, std, values:rewards.map(r=>std===0?0:(r-mean)/std)};
}
export function policyWeights(values: readonly number[], progress: number) {
  const exp = values.map(v=>Math.exp(v*.7*progress));
  const total = exp.reduce((a,b)=>a+b,0);
  return exp.map(v=>v/total);
}
export function searchState(t:number,budget:number) {
  const checked = Math.min(budget, Math.floor(Math.max(0,t-1400)/850));
  const passing = [3,6].filter(i=>i<checked);
  return {checked, passing, exhausted:checked===budget, winner:passing[0]??null};
}
