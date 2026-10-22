import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1200);
const found = new Map();
for (let r = 0; r < 10; r++) {
  const go = () => p.evaluate((r) => { const el = document.getElementById('inference'); scrollTo({ top: el.getBoundingClientRect().top + scrollY + r * innerHeight, behavior: 'instant' }); }, r);
  await go(); await p.waitForTimeout(900); await go(); await p.waitForTimeout(1500);
  const hits = await p.evaluate(() => [...document.querySelectorAll('.ex-scene *')].filter(e => e.childElementCount === 0 && /illustrativ|not measured|schematic|synthetic|simulated/i.test(e.textContent)).map(e => { const vis = getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0; return `${e.tagName.toLowerCase()}.${[...e.classList].join('.')} < ${e.parentElement.tagName.toLowerCase()}.${[...e.parentElement.classList].join('.')} [${vis ? 'VISIBLE' : 'hidden'}] "${e.textContent.trim().slice(0, 60)}"`; }));
  hits.forEach(h => found.set(h, (found.get(h) || '') + r));
}
for (const [h, r] of found) console.log(r, h);
await b.close();
