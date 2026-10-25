import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const errs = [];
for (const m of ['top', 'side', 'dock']) {
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage(); p.on('pageerror', e => errs.push(m + ': ' + e.message.slice(0, 160)));
  await p.goto(`http://localhost:3290/?labnav=${m}`, { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1500);
  const top = await p.evaluate(() => document.getElementById('inference-study').getBoundingClientRect().top + scrollY);
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top); await p.waitForTimeout(800);
  await p.locator('#inference-study .br-branch').nth(1).click(); await p.waitForTimeout(5000);
  await p.screenshot({ path: `fit/nav-p2-${m}.jpg`, type: 'jpeg', quality: 62 });
  await p.close();
}
console.log('errors', errs.length ? errs : 'none'); await b.close();
