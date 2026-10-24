import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2000);
await p.locator('#training-cost-lab').evaluate(e => e.scrollIntoView());
for (let i = 0; i < 6; i++) {
  await p.locator('#post-training-study .ls-chapters button').nth(i).click(); await p.waitForTimeout(1500);
  console.log(i, await p.evaluate(() => ['.ls-training .ls-topline', '.ls-training .ls-chapters', '.ls-training .ls-story-heading', '.ls-training .ls-theater', '#post-training-study .rl-reel'].map(s => { const e = document.querySelector(s); if (!e) return s.split(' ').pop() + ':none'; const r = e.getBoundingClientRect(); return `${s.split(' ').pop()}:${Math.round(r.top)}/${Math.round(r.height)}`; }).join('  ')));
}
await b.close();
