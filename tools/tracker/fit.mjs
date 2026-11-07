// One-screen fit report. For every module, film chapter and arc beat: the stage's room, the content's
// natural height, the zoom the stage had to apply (goal: 1.00), and how much of the central 75% of the
// stage the content actually covers.
// Usage: node fit.mjs [width] [height] [only-key]   (default 1512×860, the user's Chrome at 100%)
import { chromium } from "/Users/yash/antigravity/node_modules/playwright/index.mjs";
import { writeFileSync, mkdirSync } from "node:fs";

const [W = 1512, H = 860, ONLY] = process.argv.slice(2);
const OUT = new URL("./out/fit/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const MODULES = {
  inference: ["setup", "replay", "composition", "latency", "film", "pressure", "draft", "cache", "overlap", "map"],
  "post-training": ["inside", "terrain", "learn", "frontier", "curves", "tasks", "film", "fleet", "map", "audit"],
};
const SEC = { inference: "inference-study", "post-training": "post-training-study" };

const b = await chromium.launch();
const rows = [];
const measure = (p, label, shot) => p.evaluate((label) => {
  const stage = document.querySelector(".lab-flow-show .lf-stage:not([hidden])");
  if (!stage) return { label, err: "no stage" };
  const fit = stage.querySelector(".lf-fit"), chapters = stage.querySelector(":scope > .lf-chapters");
  const zoom = Number(stage.dataset.fit || 1);
  const room = stage.clientHeight - (chapters?.offsetHeight ?? 0);
  const natural = fit.offsetHeight;
  // content extent: visible text and graphics inside the fit box
  const sr = stage.getBoundingClientRect();
  const cx0 = sr.left + sr.width * 0.125, cx1 = sr.right - sr.width * 0.125, cy0 = sr.top + sr.height * 0.125, cy1 = sr.bottom - sr.height * 0.125;
  const cell = 24, cols = Math.ceil((cx1 - cx0) / cell), rowsN = Math.ceil((cy1 - cy0) / cell), grid = new Uint8Array(cols * rowsN);
  let below = 0;
  for (const el of fit.querySelectorAll("text, rect, path, circle, canvas, img, p, span, strong, b, em, small, h3, h4, button, li")) {
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || Number(cs.opacity) < 0.15) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.width * r.height > sr.width * sr.height * 0.5) continue;
    if (r.top > sr.bottom - 1) { below++; continue; }
    for (let x = Math.max(cx0, r.left); x < Math.min(cx1, r.right); x += cell) for (let y = Math.max(cy0, r.top); y < Math.min(cy1, r.bottom); y += cell)
      grid[Math.floor((y - cy0) / cell) * cols + Math.floor((x - cx0) / cell)] = 1;
  }
  const covered = grid.reduce((a, v) => a + v, 0) / grid.length;
  return { label, room: Math.round(room), natural: Math.round(natural), zoom, central: Math.round(covered * 100), below };
}, label).then(async (r) => { if (shot) await p.screenshot({ path: `${OUT}${shot}.jpg`, type: "jpeg", quality: 60 }); return r; });

for (const [route, keys] of Object.entries(MODULES)) {
  for (const key of keys) {
    if (ONLY && ONLY !== key && ONLY !== `${route}/${key}`) continue;
    const p = await (await b.newContext({ viewport: { width: +W, height: +H } })).newPage();
    await p.goto(`http://localhost:3290/${route}?labnav=show#${SEC[route]}/${key}`, { waitUntil: "load", timeout: 120000 });
    await p.waitForTimeout(4500);
    await p.mouse.move(+W - 40, +H - 40);
    const tag = `${route === "inference" ? "inf" : "pt"}-${key}`;
    const chapters = p.locator(`#${SEC[route]} .ls-chapters button`);
    const beats = p.locator(`#${SEC[route]} .ma-root`).filter({ visible: true }).first().locator(".ma-beats button");
    if (key === "film" && await chapters.count()) {
      const n = await chapters.count();
      for (let i = 0; i < n; i++) {
        await chapters.nth(i).click(); await p.waitForTimeout(500);
        for (let k = 0; k < 3; k++) { const s = p.locator(".ma-interlude header button"); if (await s.count()) { await s.first().click(); await p.waitForTimeout(400); } }
        await p.mouse.move(+W - 40, +H - 40); await p.waitForTimeout(6000);
        rows.push(await measure(p, `${tag} ch${i + 1}`, `${tag}-ch${i + 1}`));
      }
    } else if (await beats.count()) {
      const n = await beats.count();
      for (let i = 0; i < n; i++) {
        await beats.nth(i).click(); await p.mouse.move(+W - 40, +H - 40); await p.waitForTimeout(7000);
        rows.push(await measure(p, `${tag} beat${i + 1}`, `${tag}-b${i + 1}`));
      }
    } else {
      await p.waitForTimeout(5000);
      rows.push(await measure(p, tag, tag));
    }
    await p.close();
  }
}
await b.close();
const md = [`# One-screen fit · ${W}×${H} · ${new Date().toISOString().slice(0, 16)}`, "",
  "| Module | room px | natural px | zoom | central 75% covered | items below |", "|---|---|---|---|---|---|",
  ...rows.map((r) => r.err ? `| ${r.label} | ${r.err} |||||` : `| ${r.label} | ${r.room} | ${r.natural} | ${r.zoom === 1 ? "1" : `**${r.zoom}**`} | ${r.central}% | ${r.below} |`)].join("\n");
writeFileSync(`${OUT}fit-${W}x${H}.md`, md);
console.log(md);
