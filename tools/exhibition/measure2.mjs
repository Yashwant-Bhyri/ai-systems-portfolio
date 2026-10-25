// node measure2.mjs "<reel tile text>" "<sel|sel|...>" [preClickContainer] [preClickText]
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , tile, sels, pc, pt] = process.argv;
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2000);
await p.evaluate(() => document.getElementById('inference-study').scrollIntoView());
if (pc) { await p.locator(pc).getByText(pt).first().click(); await p.waitForTimeout(800); }
if (tile) await p.locator('.rl-row').getByText(tile).first().click();
await p.waitForTimeout(3000);
console.log(await p.evaluate((sels) => sels.split('|').map(s => { const e = [...document.querySelectorAll(s)].find(x => x.getClientRects().length); if (!e) return s + ' none'; const r = e.getBoundingClientRect(); return `${s}: y=${Math.round(r.top + scrollY)} h=${Math.round(r.height)} w=${Math.round(r.width)}`; }).join('\n'), sels));
await b.close();
