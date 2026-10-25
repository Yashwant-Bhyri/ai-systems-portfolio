import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , tile, sel] = process.argv;
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3291/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1500);
await p.locator('#inference-study .rl-reel').first().evaluate(e => e.scrollIntoView()); await p.waitForTimeout(500);
await p.locator('#inference-study .rl-row').getByText(tile).first().click(); await p.waitForTimeout(4000);
console.log(await p.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return 'none'; const c = getComputedStyle(e); return [e.outerHTML.slice(0, 200), c.fontSize, c.fontFamily.slice(0, 40), c.minHeight].join('\n'); }, sel));
await b.close();
