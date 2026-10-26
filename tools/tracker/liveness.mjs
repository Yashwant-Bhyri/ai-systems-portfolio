// Are the small figures alive? For every glyph in a module (glossary cards, reel tiles), take
// element screenshots over time and count how many distinct frames each one shows, plus how much
// of its own text is visible and at what size.
//   node liveness.mjs [module="Serving glossary"] [branch=1] [layout=top] [seconds=8] [selector=.gb-glyph]
import { chromium } from "/Users/yash/antigravity/node_modules/playwright/index.mjs";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";

const OUT = new URL("./out/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const INJECT = readFileSync(new URL("./inject.js", import.meta.url), "utf8");
const [module = "Serving glossary", branch = "1", layout = "top", seconds = "8", selector = ".gb-glyph"] = process.argv.slice(2);

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(INJECT);
const p = await ctx.newPage();
await p.goto(`http://localhost:3290/?labnav=${layout}`, { waitUntil: "load", timeout: 120000 });
await p.waitForTimeout(1500);
await p.evaluate(() => { const el = document.getElementById("inference-study"); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: "instant" }); });
await p.waitForTimeout(500);
if (branch === "1") { await p.locator("#inference-study .br-branch").nth(1).click(); await p.waitForTimeout(1200); }
await p.locator("#inference-study :is(.rl-tile, .mb-tab)").filter({ hasText: module }).first().click();
await p.waitForTimeout(1200);
const glyphs = p.locator(`#inference-study ${selector}`);
const n = await glyphs.count();
await glyphs.first().scrollIntoViewIfNeeded();
await p.waitForTimeout(300);
const meta = await p.evaluate((selector) => [...document.querySelectorAll(`#inference-study ${selector}`)].map((g) => {
  const card = g.closest("article, button");
  const svg = g.querySelector("svg");
  const texts = svg ? [...svg.querySelectorAll("text")] : [];
  const shown = texts.filter((t) => getComputedStyle(t).display !== "none" && t.getBBox().width > 0);
  const px = shown.map((t) => +(parseFloat(getComputedStyle(t).fontSize) * (t.getScreenCTM()?.a ?? 1)).toFixed(1));
  return {
    title: card?.querySelector("strong")?.textContent ?? "?",
    animations: svg ? svg.querySelectorAll("animate, animateMotion, animateTransform, set").length : 0,
    paused: svg ? svg.animationsPaused() : null,
    time: svg ? +svg.getCurrentTime().toFixed(2) : null,
    textsTotal: texts.length, textsShown: shown.length, minPx: px.length ? Math.min(...px) : null,
    box: (() => { const r = g.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })(),
  };
}), selector);
const hashes = Array.from({ length: n }, () => new Set());
const steps = Math.round((+seconds * 1000) / 400);
for (let s = 0; s < steps; s++) {
  for (let i = 0; i < n; i++) {
    const buf = await glyphs.nth(i).screenshot({ type: "png" }).catch(() => null);
    if (buf) hashes[i].add(createHash("sha1").update(buf).digest("hex"));
  }
  await p.waitForTimeout(400);
}
const rows = meta.map((m, i) => ({ ...m, distinctFrames: hashes[i].size, samples: steps }));
for (const r of rows) console.log(`${r.title.padEnd(28)} anims ${String(r.animations).padStart(3)}  paused ${r.paused}  t ${r.time}  distinct ${r.distinctFrames}/${r.samples}  text ${r.textsShown}/${r.textsTotal}  min ${r.minPx}px  ${r.box.w}×${r.box.h}`);
writeFileSync(`${OUT}liveness-${module.replace(/\W+/g, "-").toLowerCase()}-${layout}.json`, JSON.stringify(rows, null, 1));
await p.locator(`#inference-study ${selector}`).first().evaluate((el) => el.closest("section, .gb-root, .rl-row")?.scrollIntoView({ block: "center" }));
await p.screenshot({ path: `${OUT}liveness-${module.replace(/\W+/g, "-").toLowerCase()}-${layout}.jpg`, type: "jpeg", quality: 70 });
await b.close();
