// Finds what shakes: every layout shift (Layout Instability API) and every change of the stage's fit scale,
// per module, with the elements that moved. Usage: node shake.mjs [width] [height] [seconds] [only-key]
import { chromium } from "/Users/yash/antigravity/node_modules/playwright/index.mjs";
const [W = 1512, H = 860, SEC = 22, ONLY] = process.argv.slice(2);
const MODULES = {
  inference: ["setup", "replay", "composition", "latency", "film", "pressure", "draft", "cache", "overlap", "map", "glossary"],
  "post-training": ["inside", "learn", "terrain", "frontier", "curves", "fleet", "map", "film", "tasks", "audit"],
};
const SEC_ID = { inference: "inference-study", "post-training": "post-training-study" };
const b = await chromium.launch();
const describe = `(n) => { if (!n || !n.tagName) return "text"; const c = (n.className && n.className.baseVal !== undefined ? n.className.baseVal : n.className) || ""; const p = n.parentElement; const pc = p ? ((p.className && p.className.baseVal !== undefined ? p.className.baseVal : p.className) || p.tagName) : ""; return n.tagName.toLowerCase() + "." + String(c).split(" ")[0] + " < " + String(pc).split(" ")[0]; }`;
const rows = [];
for (const [route, keys] of Object.entries(MODULES)) for (const key of keys) {
  if (ONLY && ONLY !== key && ONLY !== `${route}/${key}`) continue;
  const p = await (await b.newContext({ viewport: { width: +W, height: +H } })).newPage();
  await p.addInitScript(`window.__shift = {}; window.__total = 0; window.__fits = [];
    const d = ${describe};
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { if (e.hadRecentInput) continue; window.__total += e.value; for (const s of e.sources || []) { const k = d(s.node); window.__shift[k] = (window.__shift[k] || 0) + e.value; } } }).observe({ type: "layout-shift", buffered: false });`);
  await p.goto(`http://localhost:3290/${route}?labnav=show#${SEC_ID[route]}/${key}`, { waitUntil: "load", timeout: 120000 });
  await p.waitForTimeout(3500);
  await p.evaluate(() => { window.__shift = {}; window.__total = 0; setInterval(() => { const f = document.querySelector(".lab-flow-show .lf-stage:not([hidden])")?.dataset.fit; if (f && window.__fits.at(-1) !== f) window.__fits.push(f); }, 150); });
  const sk = p.locator(".ma-interlude header button");
  for (let i = 0; i < 4; i++) { if (await sk.count()) { await sk.first().click().catch(() => {}); await p.waitForTimeout(300); } }
  await p.waitForTimeout(+SEC * 1000);
  const r = await p.evaluate(() => ({ total: window.__total, fits: window.__fits, top: Object.entries(window.__shift).sort((a, c) => c[1] - a[1]).slice(0, 5) }));
  rows.push(`${route === "inference" ? "inf" : "pt"}-${key}\tshift ${r.total.toFixed(3)}\tfit ${r.fits.join("→")}\t${r.top.map(([k, v]) => `${k} ${v.toFixed(3)}`).join(" ; ")}`);
  console.log(rows.at(-1));
  await p.close();
}
await b.close();
