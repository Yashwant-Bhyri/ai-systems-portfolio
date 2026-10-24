import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
await p.addInitScript(() => { window.__s = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__s.push([Math.round(performance.now()), e.value.toFixed(3), Math.round(scrollY), (e.sources||[]).map(s => `${s.node?.className?.baseVal ?? s.node?.className ?? s.node?.nodeName} ${Math.round(s.previousRect.y)}→${Math.round(s.currentRect.y)} h${Math.round(s.previousRect.height)}→${Math.round(s.currentRect.height)}`).slice(0,4).join(' ; ')]); }).observe({ type: 'layout-shift' }); });
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2500);
await p.locator('#inference-microscope').evaluate(e => e.scrollIntoView({ behavior: 'instant' }));
await p.waitForTimeout(3000); const t0 = await p.evaluate(() => { window.__s = []; return performance.now(); });
for (let i = 0; i < 20; i++) { await p.waitForTimeout(800); }
console.log(JSON.stringify(await p.evaluate(() => window.__s), null, 0));
await b.close();
