import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3291/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2000);
await p.evaluate(() => document.getElementById('inference-study').scrollIntoView());
await p.locator('#inference-study .rl-reel').first().evaluate(e => e.scrollIntoView()); await p.waitForTimeout(600); await p.locator('#inference-study .rl-row').getByText('Execution replay').first().click();
await p.waitForTimeout(1200); await p.mouse.move(700, 400);
await p.waitForTimeout(5200); await p.screenshot({ path: 'lab0/sweep.jpg', type: 'jpeg', quality: 62 });
await p.waitForTimeout(9000); await p.screenshot({ path: 'lab0/sweep2.jpg', type: 'jpeg', quality: 62 });
await b.close();
