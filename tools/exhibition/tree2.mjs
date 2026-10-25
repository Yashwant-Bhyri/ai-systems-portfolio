import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , root = '.dv-root', depth = '2'] = process.argv;
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3290/?labnav=bar', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1200);
await p.evaluate(() => { const el = document.getElementById('inference-study'); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' }); });
await p.waitForTimeout(500);
await p.locator('#inference-study .br-branch').nth(1).click(); await p.waitForTimeout(600);
await p.locator('#inference-study .lb-bar button').filter({ hasText: 'Speculative decoding' }).first().click(); await p.waitForTimeout(1000);
await p.locator('#inference-study .df-switch button').nth(1).click(); await p.waitForTimeout(5000);
const t = await p.evaluate(([root, depth]) => {
  const name = (c) => `${c.tagName.toLowerCase()}.${(c.className?.baseVal ?? c.className).toString().split(' ').join('.')}`;
  const walk = (el, d) => d > depth ? [] : [...el.children].filter(c => c.getBoundingClientRect().height > 0).flatMap(c => { const r = c.getBoundingClientRect(); return [`${'  '.repeat(d)}${name(c)} ${Math.round(r.width)}x${Math.round(r.height)} @${Math.round(r.top)}`, ...walk(c, d + 1)]; });
  const el = [...document.querySelectorAll(`#inference-study .lb-stage ${root}`)].find(e => e.getBoundingClientRect().height > 0);
  return el ? [name(el) + ' ' + Math.round(el.getBoundingClientRect().height), ...walk(el, 1)] : ['none'];
}, [root, +depth]);
console.log(t.filter(l => !/ (g|text|path|rect|circle|line|tspan)\./.test(l)).join('\n'));
await b.close();
