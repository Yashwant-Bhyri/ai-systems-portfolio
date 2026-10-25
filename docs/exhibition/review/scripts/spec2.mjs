import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(3500);
await p.evaluate(() => { const el = document.getElementById('inference-study'); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' }); });
await p.waitForTimeout(600);
await p.locator('#inference-study .br-branch').nth(1).click(); await p.waitForTimeout(700);
await p.locator('#inference-study .lb-bar button').filter({ hasText: 'Speculative decoding' }).first().click({ force: true });
await p.waitForTimeout(1500);
await p.locator('#inference-study .lb-stage button').filter({ hasText: 'Round-by-round accounting' }).first().click();
for (const t of [3, 15]) { await p.waitForTimeout(t === 3 ? 3000 : 12000); await p.screenshot({ path: `../shots/speculative-rounds-1440-${t}s.jpg`, type: 'jpeg', quality: 72 });
  console.log(t, await p.evaluate(() => [...document.querySelectorAll('#inference-study .lb-stage h3,#inference-study .lb-stage h4,#inference-study .lb-stage p,#inference-study .lb-stage strong,#inference-study .lb-stage b,#inference-study .lb-stage text,#inference-study .lb-stage small,#inference-study .lb-stage span,#inference-study .lb-stage button,#inference-study .lb-stage dt,#inference-study .lb-stage dd')].filter(e => e.getBoundingClientRect().height > 0 && !e.children.length).map(e => e.textContent.trim()).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(' | ').slice(0, 3000))); }
await b.close();
