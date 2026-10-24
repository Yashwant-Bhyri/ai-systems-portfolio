/** End-to-end navigation checks against an already-open, owned QA browser. */
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const port = Number(process.argv[2]),
  output = process.argv[3];
assert.ok(
  port > 0 && port < 65536 && output?.startsWith("/"),
  "Usage: node scripts/verify-lab-navigation-browser.mjs <owned-CDP-port> <absolute-output-directory>",
);
const targets = await (
  await fetch(`http://127.0.0.1:${port}/json/list`)
).json();
const target = targets.find(
  (t) => t.type === "page" && t.url.startsWith("http://localhost:3001/"),
);
assert.ok(
  target,
  "Open the portfolio on port 3001 in the owned QA browser first",
);
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.onopen = resolve;
  socket.onerror = reject;
});
const pending = new Map(),
  errors = [];
let sequence = 0;
socket.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === "Runtime.exceptionThrown")
    errors.push(message.params.exceptionDetails);
  if (!pending.has(message.id)) return;
  const { resolve, reject, timer } = pending.get(message.id);
  clearTimeout(timer);
  pending.delete(message.id);
  if (message.error) reject(new Error(JSON.stringify(message.error)));
  else resolve(message.result);
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`CDP timeout: ${method}`));
    }, 10000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
  });
  assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const act = async (expression) => {
  await evaluate(expression);
  await delay(200);
};
const q = (selector) => `document.querySelector(${JSON.stringify(selector)})`;
const click = (selector) =>
  act(
    `(()=>{const e=${q(selector)};if(!e)throw Error(${JSON.stringify(selector)});e.focus({preventScroll:true});e.click()})()`,
  );
const setInput = (selector, value) =>
  act(
    `(()=>{const e=${q(selector)};Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(String(value))});e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))})()`,
  );
const value = (selector) => evaluate(`${q(selector)}.value`);
const text = (selector) => evaluate(`${q(selector)}?.textContent`);
const visible = (selector) => evaluate(`!!${q(selector)}?.checkVisibility()`);
const scroll = (selector) =>
  act(`${q(selector)}.scrollIntoView({block:'start',behavior:'instant'})`);
const part = (n) => click(`#inference-study .ip-parts button:nth-child(${n})`);
const mode = (n) =>
  click(`#inference-study .rs-mode-switch button:nth-child(${n})`);
const view = (n) =>
  click(`#inference-study .rs-lab-views button:nth-child(${n})`);
const serving = (n) => click(`.sul-nav button:nth-child(${n})`);
const mechanism = (n) => click(`.sul-explorer-nav button:nth-of-type(${n})`);
const rr = "#inference-study #inference-figures .rr-explorer";
const screenshot = async (name, selector) => {
  const clip = await evaluate(
    `(()=>{const b=${q(selector)}.getBoundingClientRect();return{x:b.x+scrollX,y:b.y+scrollY,width:b.width,height:b.height,scale:1}})()`,
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
  await delay(1800);
  await scroll("#inference-study");
  assert.equal(
    await visible(".sul-root"),
    false,
    "Part 2 is not mounted before its first visit",
  );

  // A visitor can inspect figures and return without losing the execution chapter.
  await click("#inference-study .ls-chapters button:nth-of-type(4)");
  await setInput('[aria-label="Scrub execution experiment"]', 12000);
  const execution = await value('[aria-label="Scrub execution experiment"]');
  await mode(2);
  await delay(600);
  await mode(1);
  assert.equal(
    await value('[aria-label="Scrub execution experiment"]'),
    execution,
  );
  results.storyRoundTrip = { execution };

  // Each figure is a separate retained workspace, not a remounted default view.
  await mode(2);
  await view(2);
  await delay(500);
  await click(`${rr} .rr-measure-chapters button:nth-child(3)`);
  await setInput(`${rr} [aria-label="Choose matched request"]`, 24);
  await setInput(`${rr} [aria-label="Scrub matched request replay"]`, 7000);
  const request = {
    selected: await value(`${rr} [aria-label="Choose matched request"]`),
    cursor: await value(`${rr} [aria-label="Scrub matched request replay"]`),
    metric: await text(`${rr} .rr-measure-chapters [aria-current]`),
  };
  await view(3);
  await delay(500);
  await view(1);
  await delay(500);
  await view(2);
  assert.deepEqual(
    {
      selected: await value(`${rr} [aria-label="Choose matched request"]`),
      cursor: await value(`${rr} [aria-label="Scrub matched request replay"]`),
      metric: await text(`${rr} .rr-measure-chapters [aria-current]`),
    },
    request,
  );
  results.figureRoundTrip = request;
  await screenshot("retained-request", "#inference-figures");

  // Authored story hands its actual selection to inspection; returning resumes it.
  await click("#inference-study .rs-film-invite button");
  await delay(500);
  await scroll(".ift-tour");
  await setInput('[aria-label="Scrub the inference figure tour"]', 12000);
  const tourCursor = await value(
    '[aria-label="Scrub the inference figure tour"]',
  );
  await click(".ift-inspect");
  await delay(500);
  assert.ok(
    await visible(rr),
    "The selected tour moment opens request inspection",
  );
  const handoff = {
    request: await value(`${rr} [aria-label="Choose matched request"]`),
    metric: await text(`${rr} .rr-measure-chapters [aria-current]`),
  };
  await click("#inference-study .rs-film-invite button");
  await delay(350);
  const resumed = Number(
    await value('[aria-label="Scrub the inference figure tour"]'),
  );
  assert.ok(
    resumed >= Number(tourCursor) && resumed < Number(tourCursor) + 2000,
    `Resume at ${resumed}, expected near ${tourCursor}`,
  );
  await act(
    `${q(".ift-tour")}.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))`,
  );
  results.tourHandoff = { tourCursor, resumed, handoff };

  // The whole-system overview is the first destination, with contextual return.
  await part(2);
  await delay(600);
  await serving(2);
  await delay(400);
  assert.ok(await visible(".slo-root"));
  await click(".slo-beats button:nth-child(6)");
  const originTime = await evaluate(`${q(".slo-root")}.dataset.time`);
  await click(".slo-deep-action");
  await delay(600);
  assert.ok(await visible(".so-root"));
  assert.match(await text(".sul-return-path button"), /Kernel fusion/);
  assert.equal(
    await evaluate(`document.activeElement===${q(".sul-return-path button")}`),
    true,
  );
  await click(".so-controls button:nth-of-type(2)");
  await click(".so-moments button:nth-child(4)");
  const overlap = await evaluate(`${q(".so-root")}.dataset.time`);
  await screenshot("overview-drilldown", ".sul-root");
  await click(".sul-return-path button");
  assert.equal(await evaluate(`${q(".slo-root")}.dataset.time`), originTime);
  assert.equal(
    await evaluate(`document.activeElement===${q(".slo-deep-action")}`),
    true,
  );
  await mechanism(4);
  assert.equal(await evaluate(`${q(".so-root")}.dataset.time`), overlap);
  assert.equal(
    await evaluate(`${q(".so-controls [aria-pressed=true]")}.textContent`),
    "Slower CPU",
  );
  results.overviewReturn = { originTime, overlap, focusRestored: true };

  // Leaving the entire part also preserves the selected profile and position.
  await part(1);
  await delay(600);
  await part(2);
  assert.ok(await visible(".so-root"));
  assert.equal(await evaluate(`${q(".so-root")}.dataset.time`), overlap);
  results.partRoundTrip = true;

  // Both other deep investigations retain their manual inspection positions.
  results.deepInvestigations = [];
  for (const [chapter, selector, label] of [
    [4, ".cr-root", "Scrub cache routing"],
    [5, ".dv-root", "Scrub draft verification"],
  ]) {
    await mechanism(1);
    await click(`.slo-beats button:nth-child(${chapter})`);
    const cursor = await evaluate(`${q(".slo-root")}.dataset.time`);
    await click(".slo-deep-action");
    await delay(600);
    assert.ok(await visible(selector));
    await setInput(`[aria-label="${label}"]`, 12000);
    await click(".sul-return-path button");
    assert.equal(await evaluate(`${q(".slo-root")}.dataset.time`), cursor);
    await click(".slo-deep-action");
    assert.equal(await value(`[aria-label="${label}"]`), "12000");
    await click(".sul-return-path button");
    results.deepInvestigations.push({ selector, cursor });
  }

  // Hidden live clocks stop consuming time, rather than fast-forwarding on return.
  await mechanism(4);
  await scroll(".so-root");
  await click(".so-moments button:nth-child(2)");
  await click(".so-transport button");
  await delay(300);
  await mechanism(1);
  const hiddenBefore = Number(await evaluate(`${q(".so-root")}.dataset.time`));
  await delay(700);
  assert.equal(
    Number(await evaluate(`${q(".so-root")}.dataset.time`)),
    hiddenBefore,
  );
  await mechanism(4);
  const revealed = Number(await evaluate(`${q(".so-root")}.dataset.time`));
  assert.ok(revealed < hiddenBefore + 600, "No hidden elapsed time is charged");
  results.hiddenClock = { hiddenBefore, revealed };

  // A manual inspection under reduced motion must not reset on effect remount.
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await serving(3);
  await delay(700);
  await setInput(
    '[aria-label="Scrub the stream continuity experiment"]',
    11000,
  );
  await serving(2);
  await serving(3);
  assert.equal(
    await value('[aria-label="Scrub the stream continuity experiment"]'),
    "11000",
  );
  results.reducedMotion = true;

  await serving(2);
  await mechanism(1);
  await click(".slo-beats button:nth-child(6)");
  const reducedOrigin = await evaluate(`${q(".slo-root")}.dataset.time`);
  await click(".slo-deep-action");
  await click(".sul-return-path button");
  assert.equal(await evaluate(`${q(".slo-root")}.dataset.time`), reducedOrigin);
  results.reducedOverview = reducedOrigin;

  // A directed handoff still intentionally replaces the inspector context.
  await serving(1);
  await click(".sp-moments button:nth-child(5)");
  const pressureTime = await value('[aria-label="Scrub serving film"]');
  await click(".sp-footer button");
  assert.ok(await visible(".sc-root"));
  assert.match(
    await text(".sul-return-path button"),
    /Prefill\/decode scheduling/,
  );
  await click(".sul-return-path button");
  assert.equal(await value('[aria-label="Scrub serving film"]'), pressureTime);
  results.pressureReturn = pressureTime;

  // Mobile navigation remains discoverable and does not overflow the viewport.
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await serving(2);
  await mechanism(1);
  await scroll(".sul-root");
  assert.equal(await evaluate("document.documentElement.scrollWidth"), 390);
  const brokenControls = await evaluate(
    `Array.from(document.querySelectorAll('#inference-study [aria-controls]')).filter(e=>e.checkVisibility()&&!document.getElementById(e.getAttribute('aria-controls'))).map(e=>e.textContent)`,
  );
  assert.deepEqual(brokenControls, []);
  await screenshot("mobile-navigation", ".sul-root");
  results.mobile = { width: 390, brokenControls };
  assert.deepEqual(errors, []);
  results.runtimeErrors = errors;
  await writeFile(
    path.join(output, "verification.json"),
    JSON.stringify(results, null, 2),
  );
  console.log(
    JSON.stringify({ pass: true, output, checks: Object.keys(results) }),
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
