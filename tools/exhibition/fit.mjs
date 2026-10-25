// Open every module in the block; report stage overflow and capture each.
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , port = '3290', vw = '1440', vh = '900', shots = '1'] = process.argv;
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: +vw, height: +vh } })).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160)));
await p.goto(`http://localhost:${port}/`, { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1500);
const go = (id) => p.evaluate((id) => { const el = document.getElementById(id); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' }); }, id);
const report = async (sec, label, wait = 6000) => {
  await p.waitForTimeout(wait);
  const r = await p.evaluate((sec) => { const s = document.querySelector(`#${sec} .lb-stage`); return s ? [s.clientHeight, s.scrollHeight] : [0, 0]; }, sec);
  const over = r[1] - r[0];
  console.log(`${over > 2 ? 'OVER ' + over : 'fits'}  ${label}  (${r[0]} / ${r[1]})`);
  if (shots === '1') await p.screenshot({ path: `fit/${sec.slice(0, 3)}-${label.replace(/[^a-z0-9]+/gi, '_')}.jpg`, type: 'jpeg', quality: 55 });
};
const rail = (sec, text) => p.locator(`#${sec} .lb-bar button`).filter({ hasText: text }).first().click({ timeout: 8000 }).catch(() => console.log('rail click fail', text));
await go('inference-study'); await p.waitForTimeout(800);
for (const ch of ['Baseline serving', 'Worker scheduling', 'KV prefix reuse', 'Prefill & decode execution', 'Combined runtime gains']) { await rail('inference-study', ch); await report('inference-study', ch); }
for (const m of ['Policy × runtime', 'Where the 96 tasks land', 'Execution replay', 'Queue & latency']) { await rail('inference-study', m); await report('inference-study', m); }
await p.locator('#inference-study .br-branch').nth(1).click(); await p.waitForTimeout(800);
for (const m of ['Prefill / decode scheduling', 'Speculative decoding', 'Cache-aware routing', 'CPU / GPU overlap', 'Serving system overview', 'Serving glossary']) { await rail('inference-study', m); await report('inference-study', m); }
await go('post-training-study'); await p.waitForTimeout(800);
for (const ch of ['The starting point', 'SFT + LoRA', 'Learn from outcomes', 'Give it more thought', 'Make thought count', 'The frontier']) { await rail('post-training-study', ch); await report('post-training-study', ch); }
for (const m of ['Capability map', 'Compute curves', 'Regression audit']) { await rail('post-training-study', m); await report('post-training-study', m); }
console.log('errors', errs.length ? [...new Set(errs)] : 'none');
await b.close();
