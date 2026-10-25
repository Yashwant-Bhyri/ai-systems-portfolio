// node tree.mjs <section> <branch> "<rail label>" "<root selector>" [depth] [wait] [vw] [vh]
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , sec, branch, label, root, depth = '4', wait = '5000', vw = '1440', vh = '900'] = process.argv;
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: +vw, height: +vh } })).newPage();
await p.goto(`http://localhost:3290/?labnav=bar`, { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1200);
await p.evaluate((id) => { const el = document.getElementById(id); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' }); }, sec);
await p.waitForTimeout(600);
if (branch === '1') { await p.locator(`#${sec} .br-branch`).nth(1).click(); await p.waitForTimeout(700); }
const tab = () => p.locator(`#${sec} .lb-bar button`).filter({ hasText: label }).first();
if (!(await tab().count())) { await p.locator(`#${sec} .lb-bar .mb-tab`).first().click(); await p.waitForTimeout(500); }
await tab().click({ timeout: 8000 });
await p.waitForTimeout(+wait);
const t = await p.evaluate(([sec, root, depth]) => {
  const els = [...document.querySelectorAll(`#${sec} .lb-stage ${root}`)].filter(e => e.getBoundingClientRect().height > 0);
  const name = (c) => `${c.tagName.toLowerCase()}.${(c.className?.baseVal ?? c.className).toString().split(' ').join('.')}`;
  const walk = (el, d) => d > depth ? [] : [...el.children].filter(c => c.getBoundingClientRect().height > 0).flatMap(c => { const r = c.getBoundingClientRect(); return [`${'  '.repeat(d)}${name(c)} ${Math.round(r.width)}x${Math.round(r.height)} @${Math.round(r.top)}`, ...walk(c, d + 1)]; });
  const st = document.querySelector(`#${sec} .lb-stage`).getBoundingClientRect();
  return [`stage top ${Math.round(st.top)} h ${Math.round(st.height)}`, ...els.flatMap(e => [name(e) + ' ' + Math.round(e.getBoundingClientRect().height), ...walk(e, 1)])];
}, [sec, root, +depth]);
console.log(t.join('\n'));
await b.close();
