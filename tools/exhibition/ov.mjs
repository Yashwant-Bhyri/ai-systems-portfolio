import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 200)));
await p.goto('http://localhost:3290/overview', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(4500);
await p.screenshot({ path: 'fit/ov-inf.jpg', type: 'jpeg', quality: 70 });
await p.evaluate(() => document.getElementById('overview-post-training').scrollIntoView({ behavior: 'instant' })); await p.waitForTimeout(3500);
await p.screenshot({ path: 'fit/ov-pt.jpg', type: 'jpeg', quality: 70 });
// deep link: a Part 2 card
await p.goto('http://localhost:3290/?labnav=top#inference-study/draft', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(5000);
await p.screenshot({ path: 'fit/ov-deeplink.jpg', type: 'jpeg', quality: 60 });
console.log(await p.evaluate(() => [...document.querySelectorAll('#inference-study .br-branch')].map(b => b.getAttribute('aria-pressed')).join(',')), 'errors', errs.length ? errs : 'none');
await b.close();
