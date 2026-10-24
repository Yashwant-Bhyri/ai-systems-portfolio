import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2000);
await p.locator('#inference-microscope').evaluate(e => e.scrollIntoView());
const seen = {};
for (let i = 0; i < 30; i++) {
  const r = await p.evaluate(() => ['#inference', '.cx-arch-caption', '#inference-microscope', '#inference-microscope .vx-stage-signal-console', '#inference-microscope .vx-visual-window', '#inference-microscope .vx-story-copy'].map(s => { const e = document.querySelector(s); return e ? `${s.replace('#inference-microscope ', 'm ')}:${Math.round(e.getBoundingClientRect().height)}` : s + ':none'; }).join(' | ') + ' scrollY ' + Math.round(scrollY));
  seen[r] = (seen[r] || 0) + 1; await p.waitForTimeout(700);
}
Object.keys(seen).forEach(k => console.log(seen[k], k));
await b.close();
