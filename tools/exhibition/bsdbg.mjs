import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await (await b.newContext({ viewport: { width: 1080, height: 1350 } })).newPage();
await p.goto('http://localhost:3290/brain-scan', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(5000);
console.log(await p.evaluate(() => [...document.querySelectorAll('.bs-labels text')].slice(0, 4).map(t => [t.getAttribute('x'), t.getAttribute('y'), t.getAttribute('opacity'), JSON.stringify(t.getBoundingClientRect())])));
console.log(await p.evaluate(() => JSON.stringify(document.querySelector('.bs-stage').getBoundingClientRect())));
await b.close();
