// Walk every top-level section: scroll to it, let it play, screenshot, and measure.
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';

const [, , url = 'http://localhost:3001/', label = 'tour', w = '1440', h = '900', dwell = '7', rm = ''] = process.argv;
const out = new URL('./shots/', import.meta.url).pathname;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, reducedMotion: rm ? 'reduce' : 'no-preference' });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(1500);
// Skip intro if the control exists, so we measure the composed site.
const skip = page.getByText(/skip introduction/i).first();
if (await skip.isVisible().catch(() => false)) await skip.click();
await page.waitForTimeout(1500);
const sections = await page.evaluate(() => [...document.querySelectorAll('main section, body > div section, section')]
  .filter((s) => !s.parentElement.closest('section'))
  .map((s) => ({ id: s.id, cls: s.className.toString().slice(0, 60), top: Math.round(s.getBoundingClientRect().top + scrollY), h: Math.round(s.getBoundingClientRect().height) })));
console.log(JSON.stringify(sections, null, 0));
let i = 0;
for (const s of sections) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), s.top);
  await page.waitForTimeout(+dwell * 1000);
  const m = await page.evaluate(() => {
    // Smallest rendered text that is visible in the viewport, and how much text is below 12px.
    const els = [...document.querySelectorAll('body *')].filter((e) => {
      if (!e.childNodes.length || ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return false;
      const r = e.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight || r.width === 0) return false;
      const cs = getComputedStyle(e);
      return cs.visibility !== 'hidden' && +cs.opacity > 0.05;
    });
    const sizes = els.map((e) => {
      const fs = parseFloat(getComputedStyle(e).fontSize);
      // account for SVG / transform scaling
      const r = e.getBoundingClientRect();
      const lh = e.getClientRects()[0]?.height || fs;
      return { fs, eff: e.closest('svg') ? Math.min(fs, lh) : fs, t: e.textContent.trim().slice(0, 30) };
    });
    const tiny = sizes.filter((s) => s.eff < 12);
    return { y: scrollY, nText: els.length, tiny: tiny.length, minEff: Math.min(...sizes.map((s) => s.eff)).toFixed(1), tinySamples: tiny.slice(0, 6).map((s) => `${s.eff.toFixed(1)}:${s.t}`), overflowX: document.documentElement.scrollWidth > innerWidth };
  });
  console.log(i, s.id || s.cls, JSON.stringify(m));
  await page.screenshot({ path: `${out}${label}-${String(i).padStart(2, '0')}-${(s.id || 'sec').slice(0, 24)}.jpg`, type: 'jpeg', quality: 62 });
  i++;
}
await browser.close();
