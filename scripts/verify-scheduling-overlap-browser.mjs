/** Verify an already-running, owned QA Chrome. Never launches or changes a user browser. */
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const port = Number(process.argv[2]);
const output = process.argv[3];
assert.ok(
  port > 0 && port < 65536 && output?.startsWith("/"),
  "Usage: node scripts/verify-scheduling-overlap-browser.mjs <owned-CDP-port> <absolute-output-directory>",
);
const targets = await (
  await fetch(`http://127.0.0.1:${port}/json/list`)
).json();
const target = targets.find(
  (t) => t.type === "page" && t.url.startsWith("http://localhost:3001/"),
);
assert.ok(
  target,
  "Open the portfolio's port-3001 page in the QA browser first",
);
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.onopen = resolve;
  socket.onerror = reject;
});
const pending = new Map();
let sequence = 0;
socket.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  if (pending.has(message.id)) {
    const { resolve, reject, timer } = pending.get(message.id);
    clearTimeout(timer);
    pending.delete(message.id);
    if (message.error) reject(new Error(JSON.stringify(message.error)));
    else resolve(message.result);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`CDP timeout: ${method}`));
    }, 8000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true });
  assert.ok(!r.exceptionDetails, JSON.stringify(r.exceptionDetails));
  return r.result.value;
};
const act = async (expression) => {
  await evaluate(expression);
  await delay(100);
};
const click = (selector) =>
  act(`document.querySelector(${JSON.stringify(selector)}).click()`);
const state = () =>
  evaluate(
    `(()=>{const r=document.querySelector('.so-root');return {time:Number(r.dataset.time), service:Number(r.dataset.serviceMs), running:r.dataset.running, selected:r.querySelector('.so-consequence').dataset.soSelected, card:r.querySelector('.so-consequence').textContent, width:document.documentElement.scrollWidth, visible:r.getBoundingClientRect().height>0}})()`,
  );
const moment = (i) => click(`.so-moments button:nth-child(${i + 1})`);
const profile = (i) => click(`.so-controls button:nth-of-type(${i + 1})`);
const release = () =>
  act(
    `document.querySelector('.so-root').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))`,
  );
const shot = async (name, crop = true) => {
  const clip = crop
    ? await evaluate(
        `(()=>{const b=document.querySelector('.so-root').getBoundingClientRect();return {x:b.x+scrollX,y:b.y+scrollY,width:b.width,height:b.height,scale:1}})()`,
      )
    : undefined;
  const { data } = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: crop,
    ...(clip ? { clip } : {}),
  });
  await writeFile(
    path.join(output, `${name}.png`),
    Buffer.from(data, "base64"),
  );
};
const results = {};
try {
  await mkdir(output, { recursive: true });
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
  await release();
  await profile(0);
  results.moments = [];
  for (const [i, name] of [
    "dependency",
    "cpu-gap",
    "overlap-window",
    "earlier-output",
    "final-work",
  ].entries()) {
    await moment(i);
    const s = await state();
    assert.equal(s.running, "false");
    assert.ok(Math.abs(s.service - [11.7, 16, 16, 37, 52][i]) < 1e-8, name);
    results.moments.push(s);
    await shot(name);
  }
  await profile(1);
  await moment(4);
  await act(
    `document.querySelector('.so-step').dispatchEvent(new MouseEvent('click',{bubbles:true}))`,
  );
  const slowerFirst = await state();
  assert.match(slowerFirst.card, /2 mslater delivery of this step/);
  assert.equal(slowerFirst.selected, "0");
  results.slowerFirst = slowerFirst;
  await shot("first-output-tradeoff");
  await release();
  await profile(2);
  await moment(4);
  results.zero = await state();
  assert.match(results.zero.card, /Same delivery time/);
  assert.match(results.zero.card, /32 ms = 32 ms/);
  await shot("zero-overhead");
  await profile(0);
  await moment(3);
  await act(
    `document.querySelector('.so-root').scrollIntoView({block:'center',behavior:'instant'})`,
  );
  await click(".so-transport button");
  await delay(500);
  const hold = await state();
  assert.equal(hold.service, 37);
  assert.equal(hold.running, "true");
  await act(
    `document.querySelectorAll('.so-step')[2].dispatchEvent(new PointerEvent('pointerover',{bubbles:true,pointerType:'mouse'}))`,
  );
  const hovered = await state();
  await delay(350);
  assert.equal((await state()).time, hovered.time);
  await act(
    `document.querySelectorAll('.so-step')[2].dispatchEvent(new PointerEvent('pointerout',{bubbles:true,pointerType:'mouse'}))`,
  );
  await delay(350);
  assert.ok((await state()).time > hovered.time);
  results.inspection = { hold, hovered };
  await moment(3);
  await click(".so-transport button");
  await delay(9000);
  results.completed = await state();
  assert.equal(results.completed.time, 28000);
  assert.equal(results.completed.service, 52);
  assert.equal(results.completed.running, "false");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await delay(100);
  await profile(2);
  const mobile = await state();
  assert.equal(mobile.width, 390);
  assert.equal(mobile.time, 28000);
  assert.equal(mobile.running, "false");
  assert.ok(
    await evaluate(`document.querySelector('.so-transport button').disabled`),
  );
  await click(".so-mobile-nav button:last-child");
  const pan = await evaluate(
    `(()=>{const s=document.querySelector('.so-scroll');return {left:s.scrollLeft,max:s.scrollWidth-s.clientWidth}})()`,
  );
  assert.equal(pan.left, pan.max);
  const currentVisible = await evaluate(
    `(()=>{const a=document.querySelector('.so-moments').getBoundingClientRect(),b=document.querySelector('.so-moments [aria-current]').getBoundingClientRect();return b.left>=a.left&&b.right<=a.right})()`,
  );
  assert.ok(currentVisible);
  results.mobile = { ...mobile, pan, currentVisible };
  await shot("mobile-comparison");
  await moment(1);
  assert.equal((await state()).service, 8);
  await profile(1);
  assert.equal((await state()).service, 88);
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1050,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await delay(100);
  await profile(0);
  await moment(3);
  await writeFile(
    path.join(output, "verification.json"),
    JSON.stringify(results, null, 2),
  );
  console.log(
    JSON.stringify({
      pass: true,
      screenshots: 8,
      output,
      checks: Object.keys(results),
    }),
  );
} finally {
  socket.close();
}
