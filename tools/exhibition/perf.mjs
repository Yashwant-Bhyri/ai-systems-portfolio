// Production-build performance: bytes, LCP, CLS, long tasks, CSS/JS coverage, frame rate.
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';

const url = process.argv[2] || 'http://localhost:3190/';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send('Network.enable');
// Mid-tier laptop on decent wifi: 4x CPU slowdown, ~20 Mbps.
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: 20e6 / 8, uploadThroughput: 5e6 / 8 });
let bytes = 0; const byType = {};
cdp.on('Network.loadingFinished', (e) => { bytes += e.encodedDataLength; });
cdp.on('Network.responseReceived', (e) => { const t = e.type; byType[t] = (byType[t] || 0) + 1; });
await page.addInitScript(() => {
  window.__m = { lcp: 0, cls: 0, long: [] };
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.long.push(Math.round(e.duration)); }).observe({ type: 'longtask', buffered: true });
});
await page.coverage.startCSSCoverage();
await page.coverage.startJSCoverage();
const t0 = Date.now();
await page.goto(url, { waitUntil: 'load' });
const loadMs = Date.now() - t0;
await page.waitForTimeout(6000);
const fps = await page.evaluate(() => new Promise((res) => { let n = 0; const s = performance.now(); const f = () => { n++; if (performance.now() - s < 3000) requestAnimationFrame(f); else res(Math.round(n / 3)); }; requestAnimationFrame(f); }));
const m = await page.evaluate(() => ({ ...window.__m, nodes: document.querySelectorAll('*').length, anims: document.getAnimations().length }));
const css = await page.coverage.stopCSSCoverage();
const js = await page.coverage.stopJSCoverage();
const cov = (arr, txt) => { let tot = 0, used = 0; for (const e of arr) { const len = (e.text || e.source || '').length; tot += len; for (const r of (e.ranges || [])) used += r.end - r.start; } return `${(tot / 1e3).toFixed(0)}KB, ${((used / tot) * 100).toFixed(0)}% used`; };
const jsUsed = (() => { let tot = 0, used = 0; for (const e of js) { tot += e.source?.length || 0; for (const f of e.functions) for (const r of f.ranges) if (r.count > 0 && f.isBlockCoverage === false) used += r.endOffset - r.startOffset; } return `${(tot / 1e3).toFixed(0)}KB`; })();
console.log(JSON.stringify({ loadMs, transferredKB: Math.round(bytes / 1e3), byType, lcpMs: Math.round(m.lcp), cls: +m.cls.toFixed(3), longTasks: m.long.length, longestTask: Math.max(0, ...m.long), totalBlocking: m.long.reduce((a, d) => a + Math.max(0, d - 50), 0), fpsHeroAt4xCPU: fps, nodes: m.nodes, runningAnimations: m.anims, css: cov(css), jsParsed: jsUsed }, null, 1));
// Scroll to the inference lab and measure frame rate there too.
await page.evaluate(() => document.getElementById('inference')?.scrollIntoView());
await page.waitForTimeout(3000);
const fps2 = await page.evaluate(() => new Promise((res) => { let n = 0; const s = performance.now(); const f = () => { n++; if (performance.now() - s < 3000) requestAnimationFrame(f); else res(Math.round(n / 3)); }; requestAnimationFrame(f); }));
console.log('fps inference @4x CPU', fps2, 'anims', await page.evaluate(() => document.getAnimations().length));
await browser.close();
