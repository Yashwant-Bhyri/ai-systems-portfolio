import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(process.argv[2] || 'http://localhost:3001/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(3000);
const r = await p.evaluate(() => [...document.querySelectorAll('section[id], [id]')].filter(e => e.offsetHeight > 300).map(e => `${e.tagName} #${e.id} y=${Math.round(e.getBoundingClientRect().top + scrollY)} h=${e.offsetHeight} cls=${(e.className?.baseVal ?? e.className).toString().slice(0,60)}`));
console.log(r.join('\n')); console.log('docH', await p.evaluate(() => document.documentElement.scrollHeight));
await b.close();
