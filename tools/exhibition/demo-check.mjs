import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2000);
await p.evaluate(() => document.getElementById('inference-study').scrollIntoView());
await p.locator('#inference-study').getByText('Serving under load').first().click(); await p.waitForTimeout(800);
const read = async () => p.evaluate(() => ({
  pages: document.querySelector('.sp-controls label:nth-of-type(2) select')?.value,
  host: document.querySelector('.so-controls button[aria-pressed="true"]')?.textContent,
}));
await p.mouse.move(5, 5);
await p.locator('#inference-serving-lab').evaluate(e => e.scrollIntoView());
const log = [];
for (let i = 0; i < 6; i++) { await p.waitForTimeout(3000); log.push(JSON.stringify(await read())); }
await p.locator('.rl-row').getByText('CPU / GPU overlap').first().click(); await p.mouse.move(5, 5);
await p.locator('#inference-serving-lab').evaluate(e => e.scrollIntoView());
for (let i = 0; i < 6; i++) { await p.waitForTimeout(3000); log.push(JSON.stringify(await read())); }
console.log(log.join('\n')); await b.close();
