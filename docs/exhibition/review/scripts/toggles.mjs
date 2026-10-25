// Click every aria-pressed toggle in a module's stage; report overflow per state.
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , sec, branch, label] = process.argv;
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(3500);
await p.evaluate((id) => { const el = document.getElementById(id); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' }); }, sec);
await p.waitForTimeout(600);
if (branch === '1') { await p.locator(`#${sec} .br-branch`).nth(1).click(); await p.waitForTimeout(700); }
const tab = () => p.locator(`#${sec} .lb-bar button`).filter({ hasText: label }).first();
if (!(await tab().isVisible())) { await p.locator(`#${sec} .lb-bar .mb-tab`).first().click(); await p.waitForTimeout(500); }
await tab().click({ force: true }); await p.waitForTimeout(2000);
const measure = () => p.evaluate((sec) => { const s = document.querySelector(`#${sec} .lb-stage`); const secB = document.getElementById(sec).getBoundingClientRect().bottom; const all = [...s.querySelectorAll('*')].filter(e => { const r = e.getBoundingClientRect(); return r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; }); const over = all.filter(e => e.getBoundingClientRect().bottom > secB + 2 && !e.children.length && e.textContent.trim()).map(e => e.textContent.trim().slice(0, 30)); return `${s.clientHeight}/${s.scrollHeight}${over.length ? ' BELOW-FOLD: ' + over.slice(0, 5).join(' ; ') : ''}`; }, sec);
const n = await p.locator(`#${sec} .lb-stage button[aria-pressed]`).count();
console.log(label, 'toggles', n, 'initial', await measure());
for (let i = 0; i < n; i++) {
  const btn = p.locator(`#${sec} .lb-stage button[aria-pressed]`).nth(i);
  if (!(await btn.isVisible().catch(() => false))) continue;
  const t = (await btn.textContent()).trim().replace(/\s+/g, ' ').slice(0, 40);
  await btn.click({ force: true }).catch(() => {}); await p.waitForTimeout(1500);
  console.log('  ', t.padEnd(40), await measure());
}
await b.close();
