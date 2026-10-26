// Captures every module state for the space/wording audit: arc beats, film chapters, explorers, scans.
import { chromium } from "/Users/yash/antigravity/node_modules/playwright/index.mjs";
const OUT = new URL("./out/audit/", import.meta.url).pathname;
const b = await chromium.launch();
const errs = [];
const open = async (route, sec, key) => {
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  p.on("pageerror", (e) => errs.push(`${key}: ${e.message}`));
  await p.goto(`http://localhost:3290/${route}?labnav=show#${sec}/${key}`, { waitUntil: "load", timeout: 120000 });
  await p.waitForTimeout(3200);
  await p.mouse.move(900, 880);
  return p;
};
const shot = (p, name) => p.screenshot({ path: `${OUT}${name}.jpg`, type: "jpeg", quality: 70 });
const arcs = [["inference", "inference-study", "pressure"], ["inference", "inference-study", "draft"], ["inference", "inference-study", "cache"], ["inference", "inference-study", "overlap"], ["post-training", "post-training-study", "fleet"]];
for (const [route, sec, key] of arcs) {
  const p = await open(route, sec, key);
  const pills = p.locator(`#${sec} .ma-root`).filter({ visible: true }).first().locator(".ma-beats button");
  for (const [i, wait] of [[0, 8000], [1, 9000], [2, 9000]]) { await pills.nth(i).click(); await p.mouse.move(900, 880); await p.waitForTimeout(wait); await shot(p, `${key}-beat${i}`); }
  await p.close();
}
for (const [route, sec, key, wait] of [["inference", "inference-study", "composition", 9000], ["inference", "inference-study", "replay", 9000], ["inference", "inference-study", "latency", 12000], ["inference", "inference-study", "map", 12000], ["inference", "inference-study", "glossary", 5000],
  ["post-training", "post-training-study", "inside", 9000], ["post-training", "post-training-study", "terrain", 11000], ["post-training", "post-training-study", "map", 8000], ["post-training", "post-training-study", "curves", 8000], ["post-training", "post-training-study", "tasks", 8000], ["post-training", "post-training-study", "audit", 8000]]) {
  const p = await open(route, sec, key); await p.waitForTimeout(wait); await shot(p, `${route === "inference" ? "inf" : "pt"}-${key}`); await p.close();
}
// film chapters, each after its interlude is skipped
for (const [route, sec, prefix, n] of [["inference", "inference-study", "film-inf", 5], ["post-training", "post-training-study", "film-pt", 6]]) {
  const p = await open(route, sec, "film");
  const pills = p.locator(`#${sec} .ls-chapters button`);
  for (let i = 0; i < n; i++) {
    await pills.nth(i).click(); await p.waitForTimeout(500);
    const skip = p.locator(".ma-interlude header button");
    if (await skip.count()) { await skip.first().click(); await p.waitForTimeout(400); if (await skip.count()) await skip.first().click(); }
    await p.mouse.move(900, 880); await p.waitForTimeout(9000); await shot(p, `${prefix}-ch${i + 1}`);
  }
  await p.close();
}
console.log(errs.slice(0, 8).join("\n") || "no errors");
await b.close();
