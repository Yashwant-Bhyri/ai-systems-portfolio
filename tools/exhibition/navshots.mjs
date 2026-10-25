// Capture each lab navigation orientation: at the lab top and scrolled into the stage.
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , sec = 'inference-study', vw = '1440', vh = '900', modes = 'top,side,dock,bar'] = process.argv;
const b = await chromium.launch(); const errs = [];
for (const m of modes.split(',')) {
  const p = await (await b.newContext({ viewport: { width: +vw, height: +vh } })).newPage(); p.on('pageerror', e => errs.push(m + ': ' + e.message.slice(0, 160)));
  await p.goto(`http://localhost:3290/?labnav=${m}`, { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1500);
  const top = await p.evaluate((id) => document.getElementById(id).getBoundingClientRect().top + scrollY, sec);
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top); await p.waitForTimeout(4500);
  await p.screenshot({ path: `fit/nav-${sec.slice(0, 3)}-${m}-a.jpg`, type: 'jpeg', quality: 62 });
  await p.evaluate((y) => window.scrollTo({ top: y + 420, behavior: 'instant' }), top); await p.waitForTimeout(2500);
  await p.screenshot({ path: `fit/nav-${sec.slice(0, 3)}-${m}-b.jpg`, type: 'jpeg', quality: 62 });
  const h = await p.evaluate((id) => document.getElementById(id).offsetHeight, sec);
  console.log(m, 'section height', h);
  await p.close();
}
console.log('errors', errs.length ? errs : 'none');
await b.close();
