// Dump the stage text of every module at several moments (for the wording review).
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const OUT = '/Users/yash/Portfolio/design-lab/docs/exhibition/review/text';
const MODS = [
  ['inference-study', 0, 'Baseline serving', [3, 9, 18, 26]], ['inference-study', 0, 'Worker scheduling', [4, 12, 22, 32]],
  ['inference-study', 0, 'KV prefix reuse', [4, 12, 22, 32]], ['inference-study', 0, 'Prefill & decode execution', [5, 20, 40, 70]],
  ['inference-study', 0, 'Combined runtime gains', [4, 12, 22, 34]], ['inference-study', 0, 'Policy × runtime', [3, 8, 13, 18]],
  ['inference-study', 0, 'Where the 96 tasks land', [1, 4, 8]], ['inference-study', 0, 'Execution replay', [3, 12, 24, 34]],
  ['inference-study', 0, 'Queue & latency', [4, 16, 28, 40, 50]],
  ['inference-study', 1, 'Prefill / decode scheduling', [3, 10, 20, 30]], ['inference-study', 1, 'Speculative decoding', [3, 10, 20]],
  ['inference-study', 1, 'Cache-aware routing', [3, 12, 20, 28, 36, 44]], ['inference-study', 1, 'CPU / GPU overlap', [3, 8, 14, 21, 28]],
  ['inference-study', 1, 'Serving system overview', [5, 20, 40, 60, 80, 100, 120]], ['inference-study', 1, 'Serving glossary', [1]],
];
const b = await chromium.launch();
for (const [sec, branch, label, times] of MODS) {
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto('http://localhost:3290/?labnav=bar', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1000);
  await p.evaluate((id) => { const el = document.getElementById(id); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' }); }, sec);
  await p.waitForTimeout(500);
  if (branch) { await p.locator(`#${sec} .br-branch`).nth(1).click(); await p.waitForTimeout(600); }
  const tab = () => p.locator(`#${sec} .lb-bar button`).filter({ hasText: label }).first();
  if (!(await tab().count())) { await p.locator(`#${sec} .lb-bar .mb-tab`).first().click(); await p.waitForTimeout(400); }
  await tab().click(); const t0 = Date.now(); let out = `# ${label}\n`;
  for (const t of times) {
    const left = t * 1000 - (Date.now() - t0); if (left > 0) await p.waitForTimeout(left);
    const txt = await p.evaluate((sec) => {
      const stage = document.querySelector(`#${sec} .lb-stage`);
      const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && +cs.opacity > 0.05; };
      const lines = new Set();
      stage.querySelectorAll('h3,h4,p,strong,b,span,small,em,button,label,text,dt,dd,li,summary,time,mark,figcaption').forEach(el => {
        if (!vis(el)) return; if ([...el.children].some(c => c.textContent.trim() === el.textContent.trim())) return;
        const s = el.textContent.replace(/\s+/g, ' ').trim(); if (s.length > 1) lines.add(`${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : el.className?.baseVal ? '.' + el.className.baseVal.split(' ')[0] : ''}: ${s}`);
      });
      return [...lines].join('\n');
    }, sec);
    out += `\n## at ${t}s\n${txt}\n`;
  }
  writeFileSync(`${OUT}/${label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.md`, out);
  console.log('done', label);
  await p.close();
}
await b.close();
