// Frame rate per room at 4× CPU throttle on the production build.
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , base = 'http://localhost:3291/', mode = 'light'] = process.argv;
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
await p.addInitScript((m) => { try { localStorage.setItem('ex-mode', m); } catch {} }, mode);
const cdp = await ctx.newCDPSession(p);
await p.goto(base, { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2500);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
const fps = () => p.evaluate(() => new Promise((res) => { let n = 0, worst = 0, last = performance.now(); const s = last; const f = () => { const now = performance.now(); worst = Math.max(worst, now - last); last = now; n++; if (now - s < 2500) requestAnimationFrame(f); else res({ fps: Math.round(n / ((now - s) / 1000)), worst: Math.round(worst) }); }; requestAnimationFrame(f); }));
for (const [wing, n] of [['inference', mode === 'dev' ? 11 : 10], ['post-training', 9]]) {
  const row = [];
  for (let r = 0; r < n; r++) {
    await p.evaluate(([id, r]) => { const el = document.getElementById(id); scrollTo({ top: el.getBoundingClientRect().top + scrollY + r * innerHeight, behavior: 'instant' }); }, [wing, r]);
    await p.waitForTimeout(2200);
    const m = await fps(); row.push(`${r}:${m.fps}fps/${m.worst}ms`);
  }
  console.log(wing, row.join('  '));
}
await b.close();
