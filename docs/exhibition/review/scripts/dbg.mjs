import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , label = 'Policy × runtime', sec = 'inference-study'] = process.argv;
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1200);
await p.evaluate((id) => { const el = document.getElementById(id); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' }); }, sec);
await p.waitForTimeout(600);
const st = () => p.evaluate((sec) => { const s = document.getElementById(sec); return { scrollY: Math.round(scrollY), top: Math.round(s.getBoundingClientRect().top), active: [...s.querySelectorAll('.lb-bar button[aria-selected="true"], .lb-bar button[aria-current], .lb-bar .is-active, .lb-bar [data-active="true"]')].map(b => b.textContent.trim().slice(0, 30)), h: [...s.querySelectorAll('.lb-stage h3')].filter(h => h.getBoundingClientRect().height > 0).map(h => h.textContent.trim().slice(0, 60)), btns: [...s.querySelectorAll('.lb-bar button')].filter(b=>b.textContent.includes('Policy')).map(b => b.className + ' vis=' + (b.getBoundingClientRect().width > 0)) }; }, sec);
console.log('before', JSON.stringify(await st()));
await p.locator(`#${sec} .lb-bar button`).filter({ hasText: label }).first().click();
for (const t of [0.5, 2, 4, 6, 8, 10, 12]) { await p.waitForTimeout(t === 0.5 ? 500 : 2000); console.log(t, JSON.stringify(await st())); }
await b.close();
