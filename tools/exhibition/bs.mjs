import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await (await b.newContext({ viewport: { width: 1080, height: 1350 } })).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 200))); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
await p.goto('http://localhost:3290/brain-scan', { waitUntil: 'load', timeout: 120000 });
for (const t of [3000, 8000, 16000]) { await p.waitForTimeout(t === 3000 ? 3000 : t - (t === 8000 ? 3000 : 8000)); await p.screenshot({ path: `fit/bs-${t}.jpg`, type: 'jpeg', quality: 75 }); }
console.log('errors', errs.length ? errs : 'none'); await b.close();
