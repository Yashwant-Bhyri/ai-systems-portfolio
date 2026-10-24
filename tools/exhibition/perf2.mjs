// fps at 4× CPU throttle on the production build, at named targets.
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const base = process.argv[2] || 'http://localhost:3291/';
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await p.goto(base, { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2500);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
const fps = () => p.evaluate(() => new Promise((res) => { let n = 0, worst = 0, last = performance.now(); const s = last; const f = () => { const now = performance.now(); worst = Math.max(worst, now - last); last = now; n++; if (now - s < 3000) requestAnimationFrame(f); else res(`${Math.round(n / ((now - s) / 1000))}fps/${Math.round(worst)}ms`); }; requestAnimationFrame(f); }));
const targets = [
  ['arch inference', '#inference .cx-overview'], ['microscope', '#inference-microscope'],
  ['film baseline', '#inference-cost-lab'], ['reel part1', '#inference-study .rl-reel'],
  ['arch post-training', '#post-training .cx-overview'], ['film pt', '#training-cost-lab'], ['reel pt', '#post-training-study .rl-reel'],
];
const out = [];
for (const [name, sel] of targets) {
  await p.locator(sel).first().evaluate(e => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await p.waitForTimeout(2500);
  out.push(`${name}: ${await fps()}`);
}
console.log(out.join('\n'));
await b.close();
