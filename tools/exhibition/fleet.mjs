import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 200)));
await p.goto('http://localhost:3290/fleet-review', { waitUntil: 'load', timeout: 120000 });
for (const t of [2500, 6000, 10000]) { await p.waitForTimeout(t === 2500 ? 2500 : 3800); await p.screenshot({ path: `fit/fleet-${t}.jpg`, type: 'jpeg', quality: 72 }); }
console.log('errors', errs.length ? errs : 'none'); await b.close();
