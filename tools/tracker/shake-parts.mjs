// The shake tracker for what shake.mjs cannot reach by link: each film chapter and each microscope step.
import { chromium } from "/Users/yash/antigravity/node_modules/playwright/index.mjs";
const b = await chromium.launch();
const describe = `(n) => { if (!n || !n.tagName) return "text"; const c = (n.className && n.className.baseVal !== undefined ? n.className.baseVal : n.className) || ""; const p = n.parentElement; const pc = p ? ((p.className && p.className.baseVal !== undefined ? p.className.baseVal : p.className) || p.tagName) : ""; return n.tagName.toLowerCase() + "." + String(c).split(" ")[0] + " < " + String(pc).split(" ")[0]; }`;
const init = `window.__shift = {}; window.__total = 0; const d = ${describe};
  new PerformanceObserver((l) => { for (const e of l.getEntries()) { if (e.hadRecentInput) continue; window.__total += e.value; for (const s of e.sources || []) { const k = d(s.node); window.__shift[k] = (window.__shift[k] || 0) + e.value; } } }).observe({ type: "layout-shift", buffered: false });`;
const take = (p) => p.evaluate(() => { const r = { total: window.__total, top: Object.entries(window.__shift).sort((a, c) => c[1] - a[1]).slice(0, 4) }; window.__shift = {}; window.__total = 0; return r; });
const line = (tag, r) => console.log(`${tag}\tshift ${r.total.toFixed(3)}\t${r.top.map(([k, v]) => `${k} ${v.toFixed(3)}`).join(" ; ")}`);
for (const [route, sec] of [["inference", "inference-study"], ["post-training", "post-training-study"]]) {
  const p = await (await b.newContext({ viewport: { width: 1512, height: 860 } })).newPage();
  await p.addInitScript(init);
  await p.goto(`http://localhost:3290/${route}?labnav=show#${sec}/film`, { waitUntil: "load", timeout: 120000 });
  await p.waitForTimeout(4000);
  const n = await p.locator(`#${sec} .ls-chapters button`).count();
  for (let i = 0; i < n; i++) {
    await p.locator(`#${sec} .ls-chapters button`).nth(i).click(); await p.waitForTimeout(400);
    const sk = p.locator(".ma-interlude header button");
    for (let k = 0; k < 3; k++) { if (await sk.count()) { await sk.first().click().catch(() => {}); await p.waitForTimeout(300); } }
    await p.waitForTimeout(600); await take(p);
    await p.waitForTimeout(16000);
    line(`${route} film ch${i + 1}`, await take(p));
  }
  await p.close();
  const q = await (await b.newContext({ viewport: { width: 1512, height: 860 } })).newPage();
  await q.addInitScript(init);
  await q.goto(`http://localhost:3290/${route}`, { waitUntil: "load", timeout: 120000 });
  await q.evaluate((id) => document.getElementById(id)?.scrollIntoView({ block: "start" }), `${route}-microscope`);
  await q.waitForTimeout(2000);
  const rail = q.locator(".vx-stage-rail button");
  const m = await rail.count();
  for (let i = 0; i < m; i++) {
    await rail.nth(i).click(); await q.waitForTimeout(800); await take(q);
    await q.locator(".vx-stage-controls button, .vx-controls button").first().count();
    await q.waitForTimeout(7000);
    line(`${route} microscope ${i + 1}`, await take(q));
  }
  await q.close();
}
await b.close();
