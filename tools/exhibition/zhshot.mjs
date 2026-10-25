import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => localStorage.setItem('portfolio-lang', 'zh'));
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 200)));
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2500);
for (const [sec, n] of [['inference-study', 'zh-inf'], ['post-training-study', 'zh-pt']]) {
  await p.evaluate((id) => { const el = document.getElementById(id); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' }); }, sec);
  await p.waitForTimeout(5000); await p.screenshot({ path: `fit/${n}.jpg`, type: 'jpeg', quality: 60 });
}
console.log('errors', errs.length ? errs : 'none');
await b.close();
