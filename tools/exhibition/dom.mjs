// List the top-level structure inside a room's hosted scene: class, size, text sample
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , hash = 'inference', room = '2'] = process.argv;
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1200);
const go = () => p.evaluate(([id, r]) => { const el = document.getElementById(id); scrollTo({ top: el.getBoundingClientRect().top + scrollY + (+r) * innerHeight, behavior: 'instant' }); }, [hash, room]);
await go(); await p.waitForTimeout(1500); await go(); await p.waitForTimeout(2500);
const out = await p.evaluate(() => {
  const host = document.querySelector('.ex-fit-inner');
  const walk = (el, d) => { if (d > 4) return ''; const r = el.getBoundingClientRect(); let s = `${'  '.repeat(d)}${el.tagName.toLowerCase()}.${[...el.classList].join('.')} ${Math.round(r.width)}x${Math.round(r.height)} "${(el.childElementCount ? '' : el.textContent || '').trim().slice(0, 40)}"\n`; for (const c of el.children) if (d < 2) s += walk(c, d + 1); return s; };
  return host ? walk(host, 0).slice(0, 7000) : 'no host';
});
console.log(out); await b.close();
