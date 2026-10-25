// Sample a module's stage fit over time: node sweep.mjs <section> <branch> "<label>" <seconds> [step]
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , sec, branch, label, secs = '50', step = '2', vw = '1440', vh = '900'] = process.argv;
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: +vw, height: +vh } })).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160)));
await p.goto(`http://localhost:3290/`, { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1200);
await p.evaluate((id) => { const el = document.getElementById(id); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' }); }, sec);
await p.waitForTimeout(600);
if (branch === '1') { await p.locator(`#${sec} .br-branch`).nth(1).click(); await p.waitForTimeout(700); }
const tab = () => p.locator(`#${sec} .lb-bar button`).filter({ hasText: label }).first();
if (!(await tab().count())) { await p.locator(`#${sec} .lb-bar .mb-tab`).first().click(); await p.waitForTimeout(500); }
await tab().click({ timeout: 8000 });
let worst = 0, at = 0;
for (let t = 0; t <= +secs; t += +step) {
  const [c, h] = await p.evaluate((sec) => { const s = document.querySelector(`#${sec} .lb-stage`); return [s.clientHeight, s.scrollHeight]; }, sec);
  if (h - c > worst) { worst = h - c; at = t; await p.screenshot({ path: 'fit/worst.jpg', type: 'jpeg', quality: 60 }); }
  await p.waitForTimeout(+step * 1000);
}
console.log(worst > 2 ? `OVER ${worst} at ${at}s` : 'fits throughout', 'errors', errs.length ? [...new Set(errs)] : 'none');
await b.close();
