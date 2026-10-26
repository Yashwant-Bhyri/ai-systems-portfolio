// Filmstrip of a transition: screenshots every ~70 ms of a region, tiled into one sheet.
//   node filmstrip.mjs <name> <action: auto|click:<label>|branch:<n>> [layout=top] [frames=24]
import { chromium } from "/Users/yash/antigravity/node_modules/playwright/index.mjs";
import { writeFileSync } from "node:fs";
const OUT = new URL("./out/film/", import.meta.url).pathname;
const [name, action, layout = "top", frames = "24"] = process.argv.slice(2);
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(`http://localhost:3290/?labnav=${layout}`, { waitUntil: "load", timeout: 120000 });
await p.waitForTimeout(1500);
await p.evaluate(() => { const el = document.getElementById("inference-study"); scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: "instant" }); });
await p.waitForTimeout(1200);
const shots = [];
const grab = async () => shots.push((await p.screenshot({ type: "jpeg", quality: 55, scale: "css" })).toString("base64"));
if (action.startsWith("click:")) { await grab(); await p.locator("#inference-study .rl-tile").filter({ hasText: action.slice(6) }).first().click(); }
else if (action.startsWith("branch:")) { await grab(); await p.locator("#inference-study .br-branch").nth(+action.slice(7)).click(); }
else { await p.waitForFunction(() => true); }
for (let i = 0; i < +frames; i++) { await grab(); await p.waitForTimeout(40); }
const html = `<html><body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(4,1fr);gap:4px">${shots.map((s, i) => `<div style="position:relative"><img style="width:100%" src="data:image/jpeg;base64,${s}"><b style="position:absolute;left:4px;top:4px;color:#ff0;font:14px monospace">${i}</b></div>`).join("")}</body></html>`;
const sheet = await (await b.newContext({ viewport: { width: 1800, height: 1000 } })).newPage();
await sheet.setContent(html);
await sheet.waitForTimeout(300);
await sheet.screenshot({ path: `${OUT}${name}.jpg`, type: "jpeg", quality: 70, fullPage: true });
await b.close();
console.log(`${OUT}${name}.jpg`, shots.length);
