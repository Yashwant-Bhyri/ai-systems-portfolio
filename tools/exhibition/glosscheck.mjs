import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3291/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1500);
await p.evaluate(() => document.getElementById('inference-study').scrollIntoView()); await p.waitForTimeout(400);
await p.locator('#inference-study').getByText('Serving under load').first().click(); await p.waitForTimeout(1200);
const reel = p.locator('#inference-serving-lab .rl-reel').nth(1);
await reel.evaluate(e => e.scrollIntoView()); await p.waitForTimeout(500);
for (const [term, expect] of [['Quantization', 'Quantization'], ['PagedAttention', 'Paged KV cache'], ['GPU autoscaling', 'Serving lifecycle']]) {
  await reel.locator('.rl-tile').filter({ hasText: term }).first().click();
  await p.waitForTimeout(2600);
  const r = await p.evaluate(() => ({ step: document.querySelector('#inference-microscope .vx-stage-rail [aria-pressed="true"] span')?.textContent, top: Math.round(document.getElementById('inference-microscope').getBoundingClientRect().top) }));
  console.log(term, '→', r.step, 'microscope top', r.top, r.step === expect ? 'OK' : 'MISMATCH');
  await reel.evaluate(e => e.scrollIntoView()); await p.waitForTimeout(600);
}
await p.screenshot({ path: 'lab0/gloss-open.jpg', type: 'jpeg', quality: 60 });
await b.close();
