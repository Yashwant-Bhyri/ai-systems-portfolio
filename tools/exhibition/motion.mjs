// Pixel change across a module over time (is it moving?): node motion.mjs <section> <branch> "<label>" [secs]
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , sec, branch, label, secs = '24'] = process.argv;
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1200);
await p.evaluate((id) => { const el = document.getElementById(id); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' }); }, sec);
await p.waitForTimeout(500);
if (branch === '1') { await p.locator(`#${sec} .br-branch`).nth(1).click(); await p.waitForTimeout(600); }
await p.locator(`#${sec} .lb-bar button`).filter({ hasText: label }).first().click();
const states = [];
for (let t = 0; t < +secs; t += 4) {
  await p.waitForTimeout(4000);
  states.push(await p.evaluate((sec) => { const s = document.querySelector(`#${sec} .lb-stage`); return [...s.querySelectorAll('[aria-pressed="true"]')].map(b => b.textContent.trim()).join('|').slice(0, 80); }, sec));
}
console.log(states.join('\n'));
await b.close();
