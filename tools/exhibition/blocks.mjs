// node blocks.mjs <section> "<rail text>" [branch2]  → vertical blocks inside the active stage
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , sec, item, branch2] = process.argv;
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1500);
await p.evaluate((id) => { const el = document.getElementById(id); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' }); }, sec);
await p.waitForTimeout(800);
if (branch2) { await p.locator(`#${sec} .br-branch`).nth(1).click(); await p.waitForTimeout(800); }
await p.locator(`#${sec} .lb-rail`).getByText(item).first().click(); await p.waitForTimeout(5000);
console.log(await p.evaluate((sec) => {
  const stage = document.querySelector(`#${sec} .lb-stage`); const top = stage.getBoundingClientRect().top - stage.scrollTop;
  const out = [];
  const walk = (el, d) => { for (const c of el.children) { const r = c.getBoundingClientRect(); if (!r.height || getComputedStyle(c).display === 'none') continue; const cls = String(c.className?.baseVal ?? c.className).split(' ').slice(0, 2).join('.'); out.push(`${'  '.repeat(d)}${c.tagName.toLowerCase()}.${cls} y=${Math.round(r.top - top)} h=${Math.round(r.height)} w=${Math.round(r.width)}`); if (d < 8 && r.height > 40) walk(c, d + 1); } };
  walk(stage, 0); return out.slice(0, 80).join('\n');
}, sec));
await b.close();
