// node block.mjs <name> [steps json] — capture the inference block exactly as one viewport
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , name, json = '[]', port = '3290', vw = '1440', vh = '900'] = process.argv;
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: +vw, height: +vh } })).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 200)));
await p.goto(`http://localhost:${port}/`, { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1500);
const go = async (id) => p.evaluate((id) => { const el = document.getElementById(id); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' }); }, id);
await go('inference-study'); await p.waitForTimeout(1200);
for (const [op, a, c] of JSON.parse(json)) {
  if (op === 'click') await p.locator(c || 'body').getByText(a, { exact: false }).first().click({ timeout: 8000 }).catch(e => console.log('click fail', a));
  if (op === 'wait') await p.waitForTimeout(+a);
  if (op === 'go') await go(a);
  if (op === 'shot') await p.screenshot({ path: `lab0/${a}.jpg`, type: 'jpeg', quality: 62 });
}
await p.mouse.move(5, 5);
await p.waitForTimeout(500);
await p.screenshot({ path: `lab0/${name}.jpg`, type: 'jpeg', quality: 62 });
const m = await p.evaluate(() => { const s = document.querySelector('#inference-study .lb-stage'); return s ? `stage ${s.clientWidth}x${s.clientHeight} scrollH ${s.scrollHeight}` : 'no stage'; });
console.log(m, 'errors', errs.length ? errs : 'none');
await b.close();
