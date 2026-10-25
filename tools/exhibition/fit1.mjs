// Open one module in the block: report stage fit, the tallest blocks, and a screenshot.
// node fit1.mjs <section> <branch 0|1> "<rail label>" [vw] [vh] [wait]
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , sec = 'inference-study', branch = '0', label = 'Policy × runtime', vw = '1440', vh = '900', wait = '5000', port = '3290'] = process.argv;
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: +vw, height: +vh } })).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160)));
await p.goto(`http://localhost:${port}/`, { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1200);
await p.evaluate((id) => { const el = document.getElementById(id); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' }); }, sec);
await p.waitForTimeout(600);
if (branch === '1') { await p.locator(`#${sec} .br-branch`).nth(1).click(); await p.waitForTimeout(700); }
const tab = () => p.locator(`#${sec} .lb-bar button`).filter({ hasText: label }).first();
if (!(await tab().count())) { await p.locator(`#${sec} .lb-bar .mb-tab`).first().click(); await p.waitForTimeout(500); }
await tab().click({ timeout: 8000 });
await p.waitForTimeout(+wait);
const r = await p.evaluate((sec) => {
  const s = document.querySelector(`#${sec} .lb-stage`);
  const out = [s.clientHeight, s.scrollHeight];
  const panel = [...s.children].find(c => c.offsetParent !== null && !c.hidden && c.getBoundingClientRect().height > 0);
  const walk = (el, d) => { if (d > 7) return []; return [...el.children].filter(c => c.getBoundingClientRect().height > 0).flatMap(c => [`${'  '.repeat(d)}${c.tagName.toLowerCase()}.${(c.className?.baseVal ?? c.className).toString().split(' ')[0]} ${Math.round(c.getBoundingClientRect().height)}`, ...(c.getBoundingClientRect().height > 120 ? walk(c, d + 1) : [])]); };
  return { out, tree: panel ? walk(panel, 0).slice(0, 80) : [] };
}, sec);
console.log(`${r.out[1] - r.out[0] > 2 ? 'OVER ' + (r.out[1] - r.out[0]) : 'fits'} (${r.out[0]} / ${r.out[1]})`);
console.log(r.tree.join('\n'));
await p.screenshot({ path: `fit/one.jpg`, type: 'jpeg', quality: 70 });
console.log('errors', errs.length ? [...new Set(errs)] : 'none');
await b.close();
