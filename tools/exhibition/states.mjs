// node states.mjs <url> <outdir> '<json steps>'  steps: [["goto",id],["click","text"],["wait",ms],["shot",name,selector?]]
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , url, out, json] = process.argv;
const steps = JSON.parse(json);
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 200)));
await p.goto(url, { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2500);
for (const [op, a, c] of steps) {
  if (op === 'goto') await p.evaluate((id) => { const el = document.getElementById(id); scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' }); }, a);
  if (op === 'scroll') await p.evaluate((y) => scrollBy({ top: y, behavior: 'instant' }), +a);
  if (op === 'click') { const l = c ? p.locator(c).getByText(a, { exact: false }).first() : p.getByText(a, { exact: false }).first(); await l.scrollIntoViewIfNeeded().catch(()=>{}); await l.click({ timeout: 8000 }).catch(e => console.log('click fail', a, e.message.slice(0, 80))); }
  if (op === 'into') await p.locator(a).first().evaluate(e => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
  if (op === 'wait') await p.waitForTimeout(+a);
  if (op === 'shot') { if (c) await p.locator(c).first().screenshot({ path: `${out}/${a}.jpg`, type: 'jpeg', quality: 65 }); else await p.screenshot({ path: `${out}/${a}.jpg`, type: 'jpeg', quality: 65 }); }
}
console.log('errors', errs.length ? errs : 'none');
await b.close();
