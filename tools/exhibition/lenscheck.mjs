import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2000);
await p.evaluate(() => document.getElementById('inference-study').scrollIntoView());
await p.locator('.rl-row').getByText('Policy × runtime').first().click();
await p.locator('#inference-cost-lab').evaluate(e => e.scrollIntoView());
await p.mouse.move(700, 500); // hovering the figure must not stop it
const log = [];
for (let i = 0; i < 26; i++) { await p.waitForTimeout(2500); log.push(await p.evaluate(() => (document.querySelector('.cxp-lenses [aria-pressed="true"] strong')?.textContent || '') + ' | ' + (document.querySelector('.cxp-active-step')?.textContent || ''))); }
console.log(log.join('\n')); await b.close();
