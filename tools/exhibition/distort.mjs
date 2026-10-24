// Find stretched canvases/SVGs and non-uniform transforms, desktop and phone.
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch();
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 760 }); const p = await ctx.newPage();
  await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2000);
  const targets = ['#inference', '#inference-microscope', '#inference-cost-lab', '#post-training', '#post-training-microscope', '#training-cost-lab'];
  const out = new Set();
  const scan = async () => (await p.evaluate(() => {
    const r = [];
    document.querySelectorAll('canvas').forEach(c => { const b = c.getBoundingClientRect(); if (b.width < 20 || !c.width) return; const k = (c.width / c.height) / (b.width / b.height); if (Math.abs(k - 1) > 0.03) r.push(`canvas ${c.className} in ${c.closest('section')?.id}: buffer ${c.width}x${c.height} box ${Math.round(b.width)}x${Math.round(b.height)}`); });
    document.querySelectorAll('svg[preserveAspectRatio="none"]').forEach(s => { const b = s.getBoundingClientRect(); if (b.width > 40) r.push(`svg none ${s.className.baseVal} in ${s.closest('section')?.id} ${Math.round(b.width)}x${Math.round(b.height)}`); });
    document.querySelectorAll('section *').forEach(e => { const t = getComputedStyle(e).transform; if (t && t.startsWith('matrix(')) { const [a, , , d] = t.slice(7, -1).split(',').map(Number); if (Math.abs(a - d) > 0.02 && Math.abs(a) > 0.01 && Math.abs(d) > 0.01) r.push(`nonuniform ${e.tagName}.${String(e.className?.baseVal ?? e.className).slice(0, 40)} in ${e.closest('section')?.id}: ${a.toFixed(2)},${d.toFixed(2)}`); } });
    return r;
  })).forEach(x => out.add(x));
  for (const t of targets) { await p.locator(t).first().evaluate(e => e.scrollIntoView({ behavior: 'instant' })); await p.waitForTimeout(2500); await scan(); }
  for (let i = 0; i < 6; i++) { await p.locator('#post-training-study .ls-chapters button').nth(i).click().catch(() => {}); await p.waitForTimeout(2500); await scan(); }
  console.log(`\n== ${w}x${h}`); [...out].slice(0, 40).forEach(x => console.log(x));
  await ctx.close();
}
await b.close();
