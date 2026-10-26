// Smoothness of the title show (the reel), the branch switch and the condensing header.
//   node jank.mjs [layout=top]
// For each scenario: frame-time percentiles, dropped frames (> 25 ms), cumulative layout shift
// with the elements that moved, long tasks, and the scroll position drift.
import { chromium } from "/Users/yash/antigravity/node_modules/playwright/index.mjs";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const OUT = new URL("./out/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const INJECT = readFileSync(new URL("./inject.js", import.meta.url), "utf8");
const layout = process.argv[2] ?? "top";

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(INJECT);
const p = await ctx.newPage();
await p.goto(`http://localhost:3290/?labnav=${layout}`, { waitUntil: "load", timeout: 120000 });
await p.waitForTimeout(1500);
const toSection = (id, offset = 0) => p.evaluate(([id, offset]) => { const el = document.getElementById(id); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY + offset, behavior: "instant" }); }, [id, offset]);

async function measure(name, act, ms) {
  const y0 = await p.evaluate(() => scrollY);
  await p.evaluate(() => window.__track.startJank());
  await act();
  await p.waitForTimeout(ms);
  const r = await p.evaluate(() => window.__track.stopJank());
  const y1 = await p.evaluate(() => scrollY);
  const row = { name, ...r, scrollDrift: Math.round(y1 - y0) };
  console.log(`${name.padEnd(46)} p50 ${r.p50}  p95 ${r.p95}  max ${r.max}  dropped ${r.dropped}/${r.frames}  CLS ${r.cls}  long ${r.long.length}  drift ${row.scrollDrift}`);
  writeFileSync(`${OUT}jank-${layout}.json`, JSON.stringify([...(globalThis.__rows ?? []), row], null, 1));
  (globalThis.__rows ??= []).push(row);
  return row;
}

const tile = (label) => p.locator("#inference-study :is(.rl-tile, .mb-tab)").filter({ hasText: label }).first();
const rows = [];
await toSection("inference-study");
await p.waitForTimeout(800);
rows.push(await measure("reel auto-advance (3 steps)", async () => {}, 9000));
rows.push(await measure("click tile → Policy × runtime", () => tile("Policy × runtime").click(), 3000));
rows.push(await measure("click tile → Execution replay", () => tile("Execution replay").click(), 3000));
rows.push(await measure("click tile → Queue & latency", () => tile("Queue & latency").click(), 3000));
rows.push(await measure("click tile → The experiment", () => tile("The experiment").click(), 3000));
rows.push(await measure("hover a closed tile", () => tile("Execution replay").hover(), 2000));
await p.mouse.move(5, 5);
rows.push(await measure("scroll into stage (condense)", () => p.mouse.wheel(0, 500), 2500));
rows.push(await measure("scroll back up (expand)", () => p.mouse.wheel(0, -500), 2500));
await toSection("inference-study");
await p.waitForTimeout(600);
rows.push(await measure("branch → Serving under load", () => p.locator("#inference-study .br-branch").nth(1).click(), 3500));
rows.push(await measure("serving reel auto-advance", async () => {}, 9000));
rows.push(await measure("serving tile → Speculative decoding", () => tile("Speculative decoding").click(), 3000));
rows.push(await measure("branch → Cheaper execution", () => p.locator("#inference-study .br-branch").nth(0).click(), 3500));

writeFileSync(`${OUT}jank-${layout}.json`, JSON.stringify(rows, null, 1));
await b.close();
