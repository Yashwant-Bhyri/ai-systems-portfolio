// node watch.mjs <section> <branch> "<label>" <seconds> <step>
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , sec, branch, label, secs = '60', step = '5'] = process.argv;
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(3500);
await p.evaluate((id) => { const el = document.getElementById(id); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' }); }, sec);
await p.waitForTimeout(600);
if (branch === '1') { await p.locator(`#${sec} .br-branch`).nth(1).click(); await p.waitForTimeout(700); }
const tab = () => p.locator(`#${sec} .lb-bar button`).filter({ hasText: label }).first();
if (!(await tab().isVisible())) { await p.locator(`#${sec} .lb-bar .mb-tab`).first().click(); await p.waitForTimeout(500); }
await tab().click({ force: true });
for (let t = 0; t <= +secs; t += +step) {
  const r = await p.evaluate((sec) => {
    const s = document.getElementById(sec);
    const vis = el => el && el.getBoundingClientRect().height > 0;
    const pressed = [...s.querySelectorAll('.lb-stage [aria-pressed="true"], .lb-stage [aria-selected="true"]')].filter(vis).map(e => e.textContent.trim().replace(/\s+/g, ' ').slice(0, 28));
    const h = [...s.querySelectorAll('.lb-stage h3, .lb-stage h4, .lb-stage .df-caption, .lb-stage .cxp-plot-heading')].filter(vis).map(e => e.textContent.trim().slice(0, 50));
    const ghost = [...document.querySelectorAll('[class*="ghost"]')].filter(vis).length;
    const t = [...s.querySelectorAll('.lb-stage time')].filter(vis).map(e => e.textContent.trim()).slice(0, 2);
    return `${pressed.join(' | ')}  ##  ${h.join(' / ')}  ## ghost=${ghost} time=${t.join(',')}`;
  }, sec);
  console.log(String(t).padStart(3), r);
  await p.waitForTimeout(+step * 1000);
}
await b.close();
