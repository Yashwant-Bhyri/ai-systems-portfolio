// Page-level horizontal overflow check at phone width, every room of both wings
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1200);
for (const [w, n] of [['inference', 10], ['post-training', 9]]) for (let r = 0; r < n; r++) {
  await p.evaluate(([id, r]) => { const el = document.getElementById(id); scrollTo({ top: el.getBoundingClientRect().top + scrollY + r * innerHeight, behavior: 'instant' }); }, [w, r]);
  await p.waitForTimeout(700);
  const o = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (o > 0) console.log('OVERFLOW', w, r, o);
}
console.log('checked'); await b.close();
