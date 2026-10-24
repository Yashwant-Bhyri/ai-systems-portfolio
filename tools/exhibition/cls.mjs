// Layout shifts per target while everything autoplays. node cls.mjs [w] [h]
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , w = '1440', h = '900'] = process.argv;
const mobile = +w < 760;
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: +w, height: +h }, isMobile: mobile, hasTouch: mobile });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160)));
await p.addInitScript(() => {
  window.__shifts = [];
  new PerformanceObserver((l) => { for (const e of l.getEntries()) {
    const src = (e.sources || []).map(s => { const n = s.node; if (!n || !n.closest) return '?'; const el = n.nodeType === 1 ? n : n.parentElement; const c = el?.className?.baseVal ?? el?.className ?? ''; const sec = el?.closest('section[id]')?.id || ''; return `${sec}> ${el?.tagName}.${String(c).split(' ').slice(0,2).join('.')} ${Math.round(s.previousRect.y)}→${Math.round(s.currentRect.y)} h${Math.round(s.previousRect.height)}→${Math.round(s.currentRect.height)}`; });
    window.__shifts.push({ t: Math.round(performance.now()), v: +e.value.toFixed(4), src });
  } }).observe({ type: 'layout-shift', buffered: true });
});
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2500);
const go = async (sel, label, ms, click) => {
  await p.evaluate(() => { window.__shifts = []; });
  if (click) { await p.locator(click[0]).getByText(click[1], { exact: false }).first().click({ timeout: 8000, force: true }).catch(() => console.log('click fail', click[1])); await p.waitForTimeout(600); }
  await p.locator(sel).first().evaluate(e => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await p.mouse.move(2, 2);
  await p.waitForTimeout(3000); await p.evaluate(() => { window.__shifts = []; });
  await p.waitForTimeout(ms);
  const s = await p.evaluate(() => window.__shifts);
  const total = s.reduce((a, x) => a + x.v, 0);
  console.log(`\n## ${label}: CLS ${total.toFixed(3)} (${s.length} shifts)`);
  const agg = {}; for (const x of s) for (const src of x.src) { const k = src.replace(/\d+→\d+ h\d+→\d+/, ''); agg[k] = (agg[k] || 0) + x.v; }
  Object.entries(agg).sort((a, b) => b[1] - a[1]).slice(0, 6).forEach(([k, v]) => console.log(`  ${v.toFixed(3)}  ${k}`));
};
await go('#inference .cx-overview', 'arch inference', 16000);
await go('#inference-microscope', 'microscope inference', 16000);
await go('#inference-cost-lab', 'film baseline', 16000);
await go('#inference-study .rl-reel', 'reel part1', 12000);
await go('#inference-cost-lab', 'policy x runtime', 16000, ['.rl-row', 'Policy × runtime']);
await go('#inference-cost-lab', 'execution replay', 18000, ['.rl-row', 'Execution replay']);
await go('#inference-cost-lab', 'queue latency', 18000, ['.rl-row', 'Queue & latency']);
await go('#inference-serving-lab', 'part2 pressure', 16000, ['#inference-study', 'Serving under load']);
await go('#inference-serving-lab .rl-reel', 'reels part2', 12000);
await go('#post-training .cx-overview', 'arch post-training', 16000);
await go('#post-training-microscope', 'microscope pt', 16000);
await go('#training-cost-lab', 'film pt', 20000);
await go('#post-training-study .rl-reel', 'reel pt', 10000);
console.log('\nerrors', errs.length ? errs : 'none');
await b.close();
