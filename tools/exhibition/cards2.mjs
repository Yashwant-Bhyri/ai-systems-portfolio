import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3291/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1500);
const dump = (sel) => p.evaluate((sel) => {
  const root = [...document.querySelectorAll(sel)].find(e => e.getClientRects().length); if (!root) return sel + ': none';
  const out = [sel];
  const walk = (el, d) => { for (const c of el.children) { const cs = getComputedStyle(c); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue; const own = [...c.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ').slice(0, 70); const cls = String(c.className?.baseVal ?? c.className).split(' ')[0]; if (own) out.push(`${'  '.repeat(d)}${c.tagName.toLowerCase()}.${cls} ${cs.fontSize}/${cs.fontWeight} "${own}"`); if (d < 6) walk(c, d + 1); } };
  walk(root, 1); return out.join('\n');
}, sel);
const chapter = async (name, wait, sel) => { await p.locator('#inference-cost-lab').evaluate(e => e.scrollIntoView()); await p.locator('#inference-study .ls-chapters').getByText(name).first().click(); await p.waitForTimeout(wait); console.log(await dump(sel)); };
await chapter('Worker scheduling', 31000, '.sq-ledger');
await chapter('KV prefix reuse', 30000, '.pr-focus-card');
await chapter('Prefill & decode execution', 20000, '.es-consequence');
await chapter('Combined runtime gains', 30000, '.rg-consequence');
await b.close();
