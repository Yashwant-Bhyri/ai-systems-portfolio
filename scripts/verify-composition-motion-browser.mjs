/** Inspect an already-open, owned QA Chrome; no browser launch or arbitrary attachment. */
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
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
  if (!pending.has(r.id)) return;
  const p = pending.get(r.id);
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
  const r = await send("Runtime.evaluate", { expression, returnByValue: true });
  assert.ok(!r.exceptionDetails, JSON.stringify(r.exceptionDetails));
  return r.result.value;
};
const q = (s) => `document.querySelector(${JSON.stringify(s)})`;
const act = async (code) => {
  await evaluate(code);
  await delay(200);
};
const click = (s) => act(`${q(s)}.click()`);
const input = (s, n) =>
  act(
    `(()=>{const e=${q(s)};Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${n});e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))})()`,
  );
const root = "#inference-figures .cxp-explorer";
const state = async (s = root) =>
  evaluate(
    `(()=>{const r=${q(s)};return {time:+r.dataset.time,phase:+r.dataset.phase,progress:+r.dataset.trace,arrived:r.dataset.arrived,metric:r.dataset.metric,running:r.dataset.running,reveal:+r.querySelector('.cxp-difference').style.opacity,points:Array.from(r.querySelectorAll('.cxp-point')).map(e=>({quiet:e.dataset.quiet,at:e.getAttribute('transform')})),card:r.querySelector('.cxp-readout').textContent,bracket:r.querySelector('.cxp-bracket-value')?.textContent,stageHeight:r.querySelector('.cxp-stage').getBoundingClientRect().height}})()`,
  );
const seek = (n) =>
  input(`${root} [aria-label="Scrub composition comparison"]`, n);
const phase = (n) =>
  click(`${root} .cxp-direction > div:first-child button:nth-child(${n + 1})`);
const lens = (n) => click(`${root} .cxp-lenses button:nth-child(${n + 1})`);
const shot = async (name, s = root) => {
  const clip = await evaluate(
    `(()=>{const b=${q(s)}.getBoundingClientRect();return {x:b.x+scrollX,y:b.y+scrollY,width:b.width,height:b.height,scale:1}})()`,
  );
  const { data } = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip,
  });
  await writeFile(
    path.join(output, `${name}.png`),
    Buffer.from(data, "base64"),
  );
};
const results = {};
try {
  await mkdir(output, { recursive: true });
  await send("Runtime.enable");
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
  await delay(1400);
  await click("#inference-study .rs-mode-switch button:nth-child(2)");
  await delay(500);
  await act(`${q(root)}.scrollIntoView({block:'center',behavior:'instant'})`);
  await lens(0);
  await seek(4000);
  const moving = await state();
  assert.equal(moving.phase, 1);
  assert.ok(moving.progress > 0 && moving.progress < 1);
  assert.equal(moving.reveal, 0);
  assert.equal(
    moving.points[3].quiet,
    "true",
    "The final optimized point must not receive emphasis before its intervention",
  );
  await shot("runtime-in-flight");
  await phase(1);
  const settled = await state();
  assert.equal(settled.reveal, 1);
  assert.equal(settled.progress, 1);
  assert.match(settled.bracket, /GPU-s \/ correct/);
  assert.equal(
    await evaluate(`getComputedStyle(${q(`${root} .cxp-difference`)}).opacity`),
    "1",
    "The result must not lag behind its presentation clock",
  );
  assert.deepEqual(
    moving.points.map((p) => p.at),
    settled.points.map((p) => p.at),
    "Conditions do not move or invent intermediate measurements",
  );
  assert.equal(
    moving.stageHeight,
    settled.stageHeight,
    "Result reveal must not move the layout",
  );
  await shot("runtime-reuse-result");
  await phase(2);
  await shot("runtime-rate-result");
  results.runtime = { moving, settled };

  await lens(1);
  await phase(1);
  const sft = await state();
  assert.equal(sft.metric, "accuracy");
  assert.match(sft.bracket, /pp/);
  await shot("policy-sft-result");
  await phase(2);
  const rl = await state();
  assert.equal(rl.metric, "accuracy");
  await shot("policy-rl-result");
  await lens(2);
  await phase(1);
  assert.equal((await state()).metric, "accuracy");
  await phase(2);
  assert.equal((await state()).metric, "cost");
  await phase(4);
  await shot("combined-result");
  results.policy = { sft, rl };

  // Keyboard activation settles the mechanism, it must not leave an empty first frame.
  await act(`${q(`${root} .cxp-contribution-control`)}.focus()`);
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Enter",
    code: "Enter",
    windowsVirtualKeyCode: 13,
  });
  await send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Enter",
    code: "Enter",
    windowsVirtualKeyCode: 13,
  });
  await delay(100);
  assert.equal((await state()).phase, 1);
  assert.equal((await state()).reveal, 1);
  results.keyboard = true;

  await click(
    '#inference-figures [aria-label="Workload trace"] button:first-child',
  );
  await delay(300);
  await lens(0);
  await phase(1);
  const noReuse = await state();
  assert.equal(noReuse.bracket, "No cost change");
  assert.match(noReuse.card, /0 difference/);
  await shot("no-prefix-no-gain");
  results.noReuse = noReuse;

  await seek(4000);
  await click(`${root} .cxp-transport button`);
  await delay(400);
  const advanced = await state();
  assert.ok(advanced.time > 4000 && advanced.time < 5500);
  await click(`${root} .cxp-transport button`);
  const paused = await state();
  await delay(450);
  assert.equal((await state()).time, paused.time);
  await seek(16500);
  await click(`${root} .cxp-transport button`);
  await delay(1600);
  assert.equal((await state()).time, 17500);
  assert.equal((await state()).running, "false");
  results.transport = {
    advanced: advanced.time,
    paused: paused.time,
    completed: 17500,
  };

  // The tour hands off the exact in-flight frame, including within-step progress.
  await click("#inference-study .rs-film-invite button");
  await delay(300);
  await input('[aria-label="Scrub the inference figure tour"]', 65000);
  const directed = await state(".ift-tour .cxp-explorer");
  assert.equal(directed.time, 4000);
  await click(".ift-inspect");
  await delay(300);
  const inspected = await state();
  assert.equal(inspected.time, directed.time);
  assert.equal(inspected.progress, directed.progress);
  assert.equal(inspected.reveal, 0);
  results.handoff = {
    directed: directed.time,
    inspected: inspected.time,
    progress: inspected.progress,
  };

  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await phase(1);
  assert.equal((await state()).reveal, 1);
  assert.equal((await state()).running, "false");
  assert.ok(await evaluate(`${q(`${root} .cxp-transport button`)}.disabled`));
  await seek(4000);
  await click("#inference-study .rs-mode-switch button:first-child");
  await click("#inference-study .rs-mode-switch button:nth-child(2)");
  assert.equal((await state()).time, 4000);
  results.reducedMotion = true;
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await phase(2);
  await act(`${q(root)}.scrollIntoView({block:'start',behavior:'instant'})`);
  assert.equal(await evaluate("document.documentElement.scrollWidth"), 390);
  await shot("mobile-inspection");
  results.mobile = true;
  assert.deepEqual(errors, []);
  results.errors = errors;
  await writeFile(
    path.join(output, "verification.json"),
    JSON.stringify(results, null, 2),
  );
  console.log(
    JSON.stringify({
      pass: true,
      output,
      screenshots: 8,
      checks: Object.keys(results),
    }),
  );
} finally {
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1050,
    deviceScaleFactor: 1,
    mobile: false,
  }).catch(() => {});
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  }).catch(() => {});
  socket.close();
}
