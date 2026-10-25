// Phone pass over the laboratory block: screenshots down the section and horizontal overflow check.
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , sec = 'inference-study', tag = 'p'] = process.argv;
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160)));
await p.goto('http://localhost:3290/?labnav=bar', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1500);
const top = await p.evaluate((id) => { const el = document.getElementById(id); return el.getBoundingClientRect().top + scrollY; }, sec);
const h = await p.evaluate((id) => document.getElementById(id).scrollHeight, sec);
for (let i = 0, y = top; y < top + h && i < 6; i++, y += 780) {
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y); await p.waitForTimeout(1500);
  await p.screenshot({ path: `fit/${tag}-${i}.jpg`, type: 'jpeg', quality: 55 });
}
const wide = await p.evaluate(() => [...document.querySelectorAll('.lab-block *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1 && !e.closest('[class*="scroll"], .mb-bar, .slo-beats')).slice(0, 8).map(e => `${e.tagName}.${(e.className?.baseVal ?? e.className)}`.slice(0, 70)));
console.log('section height', h, 'overflowing', wide, 'errors', errs.length ? errs : 'none');
await b.close();
