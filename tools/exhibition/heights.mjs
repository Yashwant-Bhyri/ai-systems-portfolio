import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2000);
await p.evaluate(() => document.getElementById('inference-study').scrollIntoView());
await p.locator('.rl-row').getByText('Queue & latency').first().click(); await p.mouse.move(2,2);
await p.locator('#inference-cost-lab').evaluate(e => e.scrollIntoView());
const seen = {};
for (let i = 0; i < 45; i++) {
  const r = await p.evaluate(() => ['.ll-result', '.ll-result h4', '.ll-values', '.ll-tools', '.ll-figure, .ll-stage', '.ll-scroll'].map(s => { const e = document.querySelector(s); return e ? `${s}:${Math.round(e.getBoundingClientRect().height)}@${Math.round(e.getBoundingClientRect().top)}` : s + ':none'; }).join(' | '));
  seen[r] = (seen[r] || 0) + 1; await p.waitForTimeout(1000);
}
Object.keys(seen).forEach(k => console.log(seen[k], k));
await b.close();
