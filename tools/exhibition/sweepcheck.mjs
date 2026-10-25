import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2000);
await p.evaluate(() => document.getElementById('inference-study').scrollIntoView());
await p.locator('.rl-row').getByText('Execution replay').first().click();
await p.locator('#inference-cost-lab').evaluate(e => e.scrollIntoView({ block: 'start' }));
await p.mouse.move(700, 400);
const log = [];
for (let i = 0; i < 16; i++) { await p.waitForTimeout(1000); log.push(await p.evaluate(() => document.querySelector('.rr-request-slider input')?.value + ' ' + (document.querySelector('.gc-tag')?.textContent || ''))); if (i === 7) await p.screenshot({ path: 'lab0/sweep.jpg', type: 'jpeg', quality: 60 }); }
console.log(log.join(' | ')); await b.close();
