/** Connect only to the already-owned QA Chrome. Does not launch another browser. */
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import path from "node:path";
const port = Number(process.argv[2]),
  output = process.argv[3];
assert.ok(port > 0 && port < 65536 && output?.startsWith("/"));
const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = pages.find(
  (p) => p.type === "page" && p.url.startsWith("http://localhost:3001/"),
);
assert.ok(page, "Open the portfolio in the owned QA browser first");
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.onopen = resolve;
  socket.onerror = reject;
});
let serial = 0;
const pending = new Map(),
  errors = [];
socket.onmessage = ({ data }) => {
  const r = JSON.parse(data);
  if (r.method === "Runtime.exceptionThrown")
    errors.push(r.params.exceptionDetails);
  const p = pending.get(r.id);
  if (!p) return;
  clearTimeout(p.timer);
  pending.delete(r.id);
  if (r.error) p.reject(new Error(JSON.stringify(r.error)));
  else p.resolve(r.result);
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++serial,
      timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`Timeout: ${method}`));
      }, 10000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => {
  const r = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  assert.ok(!r.exceptionDetails, JSON.stringify(r.exceptionDetails));
  return r.result.value;
};
const q = (s) => `document.querySelector(${JSON.stringify(s)})`;
const root = '#post-training-study .cf-layer[data-active="true"] .ar-root';
const act = async (code) => {
  await evaluate(code);
  await delay(180);
};
const click = (s) => act(`${q(s)}.click()`);
const seek = (t) =>
  act(
    `(()=>{const e=${q(root + " input[type=range]")};Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${t});e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()`,
  );
const moment = (n) => click(`${root} .ar-moments button:nth-child(${n + 1})`);
const state = () =>
  evaluate(
    `(()=>{const r=${q(root)};return {time:+r.dataset.time,beat:+r.dataset.beat,position:+r.dataset.position,output:+r.dataset.output,loss:+r.dataset.loss,height:Math.round(r.getBoundingClientRect().height*100)/100,title:r.querySelector('.ar-diagram title').textContent,description:r.querySelector('.ar-diagram desc').textContent,caption:r.querySelector('.ar-caption').textContent,mathHidden:r.querySelector('.ar-math').inert,exampleHidden:r.querySelector('.ar-example').inert,selected:[...r.querySelectorAll('.ar-inspect button')].findIndex(b=>b.getAttribute('aria-pressed')==='true')};})()`,
  );
const shot = async (name) => {
  const clip = await evaluate(
    `(()=>{const b=${q(root)}.getBoundingClientRect();return {x:b.x+scrollX,y:b.y+scrollY,width:b.width,height:b.height,scale:1}})()`,
  );
  const { data } = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip,
  });
  await writeFile(
    path.join(output, name + ".png"),
    Buffer.from(data, "base64"),
  );
};
const results = {};
try {
  await mkdir(output, { recursive: true });
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Page.bringToFront");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1050,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await send("Page.reload");
  await delay(1200);
  await click("#post-training-study .ls-chapters button:nth-child(2)");
  await act(`${q(root)}.scrollIntoView({block:'center',behavior:'instant'})`);
  assert.ok(await evaluate(`${q(root)}.checkVisibility()`));
  const baseline = await state();
  assert.equal(baseline.position, 0);
  await shot("01-frozen-baseline");
  await moment(1);
  const first = await state();
  assert.equal(first.position, 1);
  assert.match(first.caption, /∇A = 0/);
  await shot("02-first-update");
  await moment(3);
  const comparison = await state();
  assert.equal(comparison.position, 4);
  assert.ok(comparison.loss < baseline.loss);
  await shot("03-output-comparison");
  results.arithmetic = { baseline, first, comparison };
  await act(`${q(root + " .ar-inspect button:nth-of-type(5)")}.focus()`);
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Enter",
    code: "Enter",
    windowsVirtualKeyCode: 13,
    text: "\r",
  });
  await send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Enter",
    code: "Enter",
    windowsVirtualKeyCode: 13,
  });
  await delay(150);
  const selected = await state();
  assert.equal(selected.selected, 4);
  assert.equal(selected.output, 4);
  assert.match(selected.title, /output 5/);
  const bounds = await evaluate(
    `(()=>{const b=${q(root + " .ar-inspect button:nth-of-type(3)")}.getBoundingClientRect();return{x:b.x+b.width/2,y:b.y+b.height/2}})()`,
  );
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", ...bounds });
  await delay(100);
  const preview = await state();
  assert.equal(preview.output, 2);
  assert.equal(preview.selected, 4);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 25, y: 500 });
  await delay(100);
  assert.equal((await state()).output, 4);
  await shot("04-selected-negative-coordinate");
  results.selection = { selected, preview };
  await seek(6100);
  const partial = await state();
  assert.ok(partial.position > 0 && partial.position < 1);
  await seek(30000);
  await seek(6100);
  assert.deepEqual(await state(), partial);
  results.reverseSeek = partial;
  await moment(4);
  const example = await state();
  assert.equal(example.mathHidden, true);
  assert.equal(example.exampleHidden, false);
  assert.ok(
    Math.abs(example.height - comparison.height) < 2,
    "Desktop stage must not jump at the example",
  );
  await shot("05-answer-token-targets");
  results.example = example;
  await seek(6100);
  await click(root + " .ar-transport button");
  await delay(450);
  await click(root + " .ar-transport button");
  let paused = await state();
  assert.ok(paused.time > 6100);
  await delay(400);
  assert.deepEqual(await state(), paused);
  await click(root + " .ar-transport button");
  await delay(250);
  await click(root + " .ar-method summary");
  const inspection = await state();
  await delay(300);
  assert.equal(
    (await state()).time,
    inspection.time,
    "Opening arithmetic must hold the film while it is read",
  );
  await click(root + " .ar-method summary");
  paused = await state();
  results.transport = paused;
  await click("#post-training-study .rs-mode-switch button:nth-child(2)");
  await delay(350);
  await click("#post-training-study .rs-mode-switch button:nth-child(1)");
  assert.deepEqual(await state(), paused);
  results.returnRetainsState = true;
  // Exercise the real download handler, capturing its Blob instead of writing
  // a second browser download outside this QA directory.
  await seek(6100);
  const record = await evaluate(`(async()=>{
    let blob; const create=URL.createObjectURL, anchor=HTMLAnchorElement.prototype.click;
    URL.createObjectURL=(value)=>{blob=value;return create(value)};
    HTMLAnchorElement.prototype.click=function(){};
    try { ${q(root + " .ar-method button")}.click(); return JSON.parse(await blob.text()); }
    finally {URL.createObjectURL=create;HTMLAnchorElement.prototype.click=anchor;}
  })()`);
  assert.equal(record.presentationMs, 6100);
  assert.equal(record.selectedOutput, 5);
  assert.equal(record.optimizerSteps.length, 5);
  assert.ok(record.current.afterError < record.current.beforeError);
  await writeFile(
    path.join(output, "selected-calculation.json"),
    JSON.stringify(record, null, 2),
  );
  results.export = {
    schema: record.schema,
    presentationMs: record.presentationMs,
    selectedOutput: record.selectedOutput,
  };
  await seek(31000);
  await click(root + " .ar-transport button");
  await delay(1250);
  assert.equal(
    await evaluate(
      `document.querySelector('#post-training-study .ls-chapters [aria-current="step"]').textContent.trim()`,
    ),
    "03Learn from outcomes",
  );
  await click("#post-training-study .ls-undo");
  assert.ok(await evaluate(`${q(root)}.checkVisibility()`));
  assert.ok(
    await evaluate(
      `document.querySelector('#post-training-study .ls-undo').checkVisibility()`,
    ),
    "Undo must retain its restore control",
  );
  await click("#post-training-study .ls-undo");
  assert.equal(
    await evaluate(
      `document.querySelector('#post-training-study .ls-story').dataset.adapter`,
    ),
    "false",
  );
  results.chapterHandoff = true;
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await delay(100);
  await click("#post-training-study .ls-chapters button:nth-child(2)");
  assert.equal((await state()).time, 32000);
  await moment(1);
  assert.equal((await state()).position, 1);
  await delay(350);
  assert.equal((await state()).time, 8500);
  results.reducedMotion = await state();
  await seek(24000);
  assert.equal(
    await evaluate(`${q(root + " .ar-example")}.style.opacity`),
    "1",
  );
  assert.equal((await state()).exampleHidden, false);
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await moment(3);
  await act(`${q(root)}.scrollIntoView({block:'start',behavior:'instant'})`);
  assert.ok(
    await evaluate("document.documentElement.scrollWidth <= innerWidth"),
    "No horizontal page overflow",
  );
  await click(root + " .ar-pan button:nth-of-type(2)");
  const scroll = await evaluate(`${q(root + " .ar-scroll")}.scrollLeft`);
  assert.ok(scroll > 0);
  await shot("06-mobile-output");
  await moment(4);
  const contained = await evaluate(
    `(()=>{const r=${q(root)},p=r.querySelector('.ar-stage').getBoundingClientRect(),c=r.querySelector('.ar-example-boundary').getBoundingClientRect();return {stageBottom:p.bottom,contentBottom:c.bottom,width:r.getBoundingClientRect().width}})()`,
  );
  assert.ok(
    contained.contentBottom <= contained.stageBottom + 1,
    "Example must stay within its reserved stage",
  );
  await shot("07-mobile-training-example");
  results.mobile = { scroll, contained };
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1050,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await moment(3);
  await act(`${q(root)}.scrollIntoView({block:'center',behavior:'instant'})`);
  const contrast = await evaluate(`(()=>{
    const luminance = values => values.map(c=>{const v=c/255;return v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[0.2126,0.7152,0.0722][i],0);
    const bg=luminance([11,23,33]);
    return [...new Set([...${q(root)}.querySelectorAll('.ar-diagram text,.ar-diagram tspan')].map(e=>getComputedStyle(e).fill))].map(fill=>{
      const rgb=fill.match(/[\\d.]+/g).map(Number);const l=luminance(rgb.slice(0,3));return {fill,ratio:(Math.max(l,bg)+0.05)/(Math.min(l,bg)+0.05)};
    });
  })()`);
  assert.ok(contrast.every((c) => c.ratio >= 4.5));
  results.svgLabelContrast = contrast;
  await seek(10500);
  await send("Page.bringToFront");
  await delay(350);
  await act(`${q(root)}.scrollIntoView({block:'center',behavior:'instant'})`);
  assert.equal(
    await evaluate(`${q(root + " .ar-transport button")}.disabled`),
    false,
    "Motion preference change must reconnect playback",
  );
  await click(root + " .ar-transport button");
  const playbackState = await evaluate(
    `(()=>{const s=document.querySelector('#post-training-study .ls-story');return {state:Object.assign({},s.dataset),rect:s.getBoundingClientRect().toJSON(),viewport:[innerWidth,innerHeight],hidden:document.hidden}})()`,
  );
  assert.equal(
    playbackState.state.running,
    "true",
    `Frame sample requires an in-view running story: ${JSON.stringify(playbackState)}`,
  );
  const frames = await evaluate(`new Promise(resolve=>{
    const times=[];let previous=performance.now();
    const tick=now=>{times.push(now-previous);previous=now;if(times.length<120) requestAnimationFrame(tick);else {times.shift();const sorted=[...times].sort((a,b)=>a-b);resolve({count:times.length,mean:times.reduce((a,b)=>a+b,0)/times.length,p95:sorted[Math.floor(sorted.length*.95)],over33:times.filter(n=>n>33).length,time:+${q(root)}.dataset.time});}};
    requestAnimationFrame(tick);
  })`);
  await click(root + " .ar-transport button");
  assert.ok(
    frames.time > 11000,
    `Frame sample must occur during active playback: ${JSON.stringify(frames)}`,
  );
  results.localFrameSample = frames;
  await moment(3);
  results.pausedFrameSample = await evaluate(`new Promise(resolve=>{
    const times=[];let previous=performance.now();
    const tick=now=>{times.push(now-previous);previous=now;if(times.length<61) requestAnimationFrame(tick);else {times.shift();const sorted=[...times].sort((a,b)=>a-b);resolve({count:times.length,mean:times.reduce((a,b)=>a+b,0)/times.length,p95:sorted[Math.floor(sorted.length*.95)],over33:times.filter(n=>n>33).length});}};
    requestAnimationFrame(tick);
  })`);
  assert.equal(errors.length, 0, JSON.stringify(errors));
  results.errors = errors;
  await writeFile(
    path.join(output, "verification.json"),
    JSON.stringify(results, null, 2),
  );
  console.log(
    JSON.stringify(
      { passed: Object.keys(results), screenshots: 7, output },
      null,
      2,
    ),
  );
} finally {
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1050,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  socket.close();
}
