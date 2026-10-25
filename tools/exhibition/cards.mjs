// Dump typography of each result card: node cards.mjs
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3291/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1500);
const dump = (sel) => p.evaluate((sel) => {
  const root = [...document.querySelectorAll(sel)].find(e => e.getClientRects().length); if (!root) return sel + ': none';
  const out = [sel];
  const walk = (el, d) => { for (const c of el.children) { const cs = getComputedStyle(c); if (cs.display === 'none' || cs.visibility === 'hidden') continue; const own = [...c.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ').slice(0, 40); const cls = String(c.className?.baseVal ?? c.className).split(' ')[0]; if (own) out.push(`${'  '.repeat(d)}${c.tagName.toLowerCase()}.${cls} ${cs.fontSize}/${cs.fontWeight} ${cs.fontFamily.startsWith('ui-mono') || cs.fontFamily.includes('Mono') ? 'mono' : 'sans'} "${own}"`); if (d < 5) walk(c, d + 1); } };
  walk(root, 1); return out.join('\n');
}, sel);
const open = async (tile, part) => { await p.evaluate(() => document.getElementById('inference-study').scrollIntoView()); await p.waitForTimeout(300); if (part) { await p.locator('#inference-study').getByText(part).first().click(); await p.waitForTimeout(1000); } const reel = part ? '#inference-serving-lab .rl-reel' : '#inference-study .rl-reel'; await p.locator(reel).first().evaluate(e => e.scrollIntoView()); await p.waitForTimeout(400); await p.locator(reel).first().locator('.rl-row').getByText(tile).first().click(); await p.waitForTimeout(9000); };
await p.locator('#inference-cost-lab').evaluate(e => e.scrollIntoView()); await p.waitForTimeout(9000);
console.log(await dump('.bo-consequence'));
await open('Execution replay'); console.log(await dump('.rr-result'));
await open('Queue & latency'); console.log(await dump('.ll-result'));
await open('Prefill / decode scheduling', 'Serving under load'); console.log(await dump('.sp-consequence'));
await b.close();
