import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1500);
const r = await p.evaluate(() => {
  const secs = [...document.querySelectorAll('section[id], [id$="-study"], [id*="arch"], [id*="micro"]')].map(s => `${s.tagName} #${s.id} top=${Math.round(s.getBoundingClientRect().top + scrollY)} h=${Math.round(s.getBoundingClientRect().height)}`);
  const bars = ['inference-study', 'post-training-study'].map(id => { const s = document.getElementById(id); if (!s) return id + ' missing'; return id + ': ' + [...s.querySelectorAll('.lb-bar button')].map(b => b.textContent.trim().replace(/\s+/g, ' ')).join(' | ') + ' || branches: ' + [...s.querySelectorAll('.br-branch')].map(b => b.textContent.trim().replace(/\s+/g,' ')).join(' | '); });
  return { secs, bars };
});
console.log(r.secs.join('\n')); console.log(r.bars.join('\n'));
await b.close();
