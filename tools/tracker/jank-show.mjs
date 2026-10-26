// Smoothness of the title show (labnav=show): landing → flight, column clicks, pathway crossing.
import { chromium } from "/Users/yash/antigravity/node_modules/playwright/index.mjs";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const OUT = new URL("./out/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const INJECT = readFileSync(new URL("./inject.js", import.meta.url), "utf8");
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(INJECT);
const p = await ctx.newPage();
const errors = []; p.on("pageerror", (e) => errors.push(e.message));
await p.goto("http://localhost:3290/?labnav=show", { waitUntil: "load", timeout: 120000 });
await p.waitForTimeout(1500);
const rows = [];
async function measure(name, act, ms) {
  const y0 = await p.evaluate(() => scrollY);
  await p.evaluate(() => window.__track.startJank());
  await act();
  await p.waitForTimeout(ms);
  const r = await p.evaluate(() => window.__track.stopJank());
  const y1 = await p.evaluate(() => scrollY);
  const st = await p.evaluate(() => { const s = document.querySelector("#inference-study .lf-stage"); return s && !s.hidden ? Math.round(s.getBoundingClientRect().top) : null; });
  rows.push({ name, ...r, drift: Math.round(y1 - y0), stageTop: st });
  console.log(`${name.padEnd(40)} p95 ${r.p95}  max ${r.max}  dropped ${r.dropped}/${r.frames}  CLS ${r.cls}  drift ${Math.round(y1 - y0)}  stageTop ${st}`);
}
// click by coordinates, as a visitor would (no scroll-into-view)
const tap = async (sel, text) => {
  const box = await p.locator(sel).filter({ hasText: text }).first().boundingBox();
  await p.mouse.click(box.x + box.width / 2, box.y + Math.min(box.height / 2, 40));
};
await measure("scroll to lab, landing auto-starts", () => p.evaluate(() => { const el = document.getElementById("inference-study"); scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: "instant" }); }), 6500);
await measure("Next card → Policy × runtime", () => tap("#inference-study .ts-next", "Policy"), 3000);
await measure("Next card → Execution replay", () => tap("#inference-study .ts-next", "Execution"), 3000);
await measure("pinned → The experiment", () => tap("#inference-study .ts-pinned", "experiment"), 3000);
await p.mouse.move(150, 780);
await p.waitForTimeout(800);
await measure("shadow row → Speculative decoding", async () => { await p.locator("#inference-study .ts-row").filter({ hasText: "Speculative" }).first().click({ force: true }); }, 4000);
await measure("Both pathways (back to landing)", () => tap("#inference-study .ts-back", "Both"), 2000);
await measure("landing card → Cache-aware routing", () => tap("#inference-study .ts-card", "Cache-aware"), 4000);
writeFileSync(`${OUT}jank-show.json`, JSON.stringify(rows, null, 1));
console.log(errors.slice(0, 5).join("\n") || "no errors");
for (const x of rows.filter((x) => x.cls > 0.05)) {
  console.log("\n##", x.name, x.cls);
  x.shifts.flatMap((s) => s.sources).slice(0, 5).forEach((o) => console.log("  ", o.n.slice(0, 80), JSON.stringify(o.from), "→", JSON.stringify(o.to)));
}
await b.close();
