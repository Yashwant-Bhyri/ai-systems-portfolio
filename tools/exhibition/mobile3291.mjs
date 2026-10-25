import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , out, json] = process.argv; const steps = JSON.parse(json);
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await ctx.addInitScript((l) => { if (l) localStorage.setItem('portfolio-lang', 'zh'); }, process.env.LANG_ZH || ''); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160)));
await p.goto('http://localhost:3291/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2500);
for (const [op, a, c] of steps) {
  if (op === 'into') await p.locator(a).first().evaluate(e => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
  if (op === 'click') await p.locator(c || 'body').getByText(a, { exact: false }).first().click({ timeout: 8000 }).catch(e => console.log('click fail', a));
  if (op === 'wait') await p.waitForTimeout(+a);
  if (op === 'scroll') await p.evaluate(y => scrollBy(0, +y), a);
  if (op === 'shot') await p.screenshot({ path: `${out}/${a}.jpg`, type: 'jpeg', quality: 60 });
}
console.log('overflow', await p.evaluate(() => document.documentElement.scrollWidth), 'errors', errs.length ? errs : 'none');
await b.close();
