import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1500);
const info = () => p.evaluate(() => { const w = document.getElementById('post-training'); const r = w.getBoundingClientRect(); return { y: Math.round(scrollY), wingTop: Math.round(r.top + scrollY), wingH: Math.round(r.height), docH: document.documentElement.scrollHeight }; });
console.log('before', await info());
await p.evaluate(() => { const el = document.getElementById('post-training'); scrollTo({ top: el.getBoundingClientRect().top + scrollY + 4, behavior: 'instant' }); });
for (let i = 0; i < 8; i++) { await p.waitForTimeout(700); console.log(i, await info()); }
await b.close();
