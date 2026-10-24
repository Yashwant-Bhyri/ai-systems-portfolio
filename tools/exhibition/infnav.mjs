import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2000);
await p.locator('#inference-cost-lab').evaluate(e => e.scrollIntoView());
for (let i = 0; i < 5; i++) {
  await p.locator('#inference-study .ls-chapters button').nth(i).click(); await p.waitForTimeout(1500);
  console.log(i, await p.evaluate(() => ['.ls-inference .ls-topline', '.ls-inference .ls-chapters', '.ls-inference .ls-story-heading', '.ls-inference .ls-theater', '#inference-study .rl-reel'].map(s => { const e = document.querySelector(s); if (!e) return s.split(' ').pop() + ':none'; const r = e.getBoundingClientRect(); return `${s.split(' ').pop()}:${Math.round(r.top)}/${Math.round(r.height)}`; }).join('  ')));
}
await b.close();
