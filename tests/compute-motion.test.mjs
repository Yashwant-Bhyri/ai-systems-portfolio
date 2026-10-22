import assert from "node:assert/strict";
import test from "node:test";
import {kvState,advantages,policyWeights,searchState,ph,ep,bez,DURATION} from "../app/compute/simulation.ts";

test("shared prefix reuses two physical pages and holds both live references",()=>{
  const shared=kvState(6000,true),separate=kvState(6000,false);
  assert.equal(shared.allocated,6);assert.equal(separate.allocated,8);
  assert.equal(shared.refs[2],2);assert.equal(shared.refs[7],2);
  assert.equal(shared.refs.reduce((a,b)=>a+b,0),8);
});
test("request A exits without reclaiming B's shared prefix",()=>{
  const s=kvState(9000,true);
  assert.equal(s.refs[2],1);assert.equal(s.refs[7],1);
  assert.equal(s.refs[11],0);assert.equal(s.refs[16],0);
  assert.equal(s.allocated,4);
});
test("KV ownership changes after the incoming reference arrives",()=>{
  assert.equal(kvState(3319,true).refs[2],1);
  assert.equal(kvState(3320,true).refs[2],2);
  for(let t=0;t<DURATION;t+=37){for(const shared of [true,false]){
    const s=kvState(t,shared);assert.ok(s.refs.every(n=>n>=0&&n<=2));
    assert.equal(s.refs.reduce((a,b)=>a+b,0),(s.released?0:s.aCount)+s.bCount);
  }}
});
test("GRPO toy group centers rewards and preserves a normalized policy",()=>{
  const a=advantages([0,1,0,1]);assert.equal(a.mean,.5);assert.equal(a.std,.5);
  assert.deepEqual(a.values,[-1,1,-1,1]);
  const p=policyWeights(a.values,1);assert.ok(Math.abs(p.reduce((x,y)=>x+y,0)-1)<1e-12);
  assert.ok(p[1]>.25);assert.ok(p[0]<.25);
});
test("tied rewards produce no artificial update or NaN",()=>{
  const a=advantages([1,1,1,1]);assert.deepEqual(a.values,[0,0,0,0]);
  assert.deepEqual(policyWeights(a.values,1),[.25,.25,.25,.25]);
});
test("search respects the budget and can exhaust with no verified answer",()=>{
  assert.deepEqual(searchState(10000,2),{checked:2,passing:[],exhausted:true,winner:null});
  assert.equal(searchState(10000,4).winner,3);assert.equal(searchState(10000,8).checked,8);
  for(let t=0;t<DURATION;t+=47)for(const budget of [2,4,8])assert.ok(searchState(t,budget).checked<=budget);
});
test("scrubbable geometry stays bounded and deterministic",()=>{
  assert.equal(ph(-1,0,10),0);assert.equal(ep(100,0,10),1);
  assert.deepEqual(bez(0,[1,2],[3,4],[5,6]),[1,2]);assert.deepEqual(bez(1,[1,2],[3,4],[5,6]),[5,6]);
});
