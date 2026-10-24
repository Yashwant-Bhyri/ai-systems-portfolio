import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
await ctx.addInitScript(() => localStorage.setItem('portfolio-lang', 'zh'));
const p = await ctx.newPage(); const errs=[]; p.on('pageerror', e => errs.push(e.message.slice(0,200)));
await p.goto('http://localhost:3290/', { waitUntil: 'load' }); await p.waitForTimeout(3000);
console.log(await p.evaluate(() => [...document.querySelectorAll('[id*=lab],[id*=study]')].map(e => e.id + ':' + e.offsetHeight).join(' ')), errs);
await b.close();
