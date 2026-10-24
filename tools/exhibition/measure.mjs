import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , id, sels] = process.argv;
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2000);
await p.evaluate((id) => document.getElementById(id).scrollIntoView({ behavior: 'instant' }), id); await p.waitForTimeout(2500);
console.log(await p.evaluate((sels) => sels.split('|').map(s => { const e = document.querySelector(s); if (!e) return s + ' none'; const r = e.getBoundingClientRect(); return `${s}: y=${Math.round(r.top)} h=${Math.round(r.height)} w=${Math.round(r.width)} sh=${e.scrollHeight}`; }).join('\n'), sels));
await b.close();
