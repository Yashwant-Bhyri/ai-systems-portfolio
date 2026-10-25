import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 200)));
await p.goto('http://localhost:3290/?labnav=bar', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1500);
const top = await p.evaluate(() => document.getElementById('post-training-study').getBoundingClientRect().top + scrollY);
await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top); await p.waitForTimeout(800);
await p.locator('#post-training-study .lb-bar button').filter({ hasText: 'Elastic RL' }).first().click();
for (const [t, n] of [[3200, 'a'], [5200, 'b'], [13000, 'c']]) { await p.waitForTimeout(n === 'a' ? 3200 : n === 'b' ? 2000 : 7800); await p.screenshot({ path: `fit/ptfleet-${n}.jpg`, type: 'jpeg', quality: 70 }); }
const fit = await p.evaluate(() => { const s = document.querySelector('#post-training-study .lb-stage'); return [s.clientHeight, s.scrollHeight]; });
console.log('fit', fit, 'errors', errs.length ? errs : 'none'); await b.close();
