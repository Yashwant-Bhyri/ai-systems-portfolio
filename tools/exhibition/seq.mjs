// Burst screenshots of a region: node seq.mjs <name> <selector> <count> <intervalMs> [clickContainer] [clickText] [preWaitMs]
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , name, sel, count = '12', every = '400', cc, ct, pre = '1500', vw = '1440'] = process.argv;
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: +vw, height: 900 }, isMobile: +vw < 760 })).newPage();
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2000);
if (cc) { await p.locator(cc).first().evaluate(e => e.scrollIntoView({ behavior: 'instant' })); await p.waitForTimeout(500); await p.locator(cc).getByText(ct, { exact: false }).first().click(); }
await p.locator(sel).first().evaluate(e => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
await p.mouse.move(2, 2);
await p.waitForTimeout(+pre);
for (let i = 0; i < +count; i++) { await p.screenshot({ path: `seq/${name}-${String(i).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 55 }); await p.waitForTimeout(+every); }
await b.close();
