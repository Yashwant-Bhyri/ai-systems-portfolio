// Sit-back test: load the page, touch nothing, screenshot on an interval.
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';

const [, , url = 'http://localhost:3001/', label = 'desk', w = '1440', h = '900', total = '120', step = '4', rm = ''] = process.argv;
const out = new URL('./shots/', import.meta.url).pathname;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, reducedMotion: rm ? 'reduce' : 'no-preference', deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text().slice(0, 200)}`); });
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message.slice(0, 200)}`));
const t0 = Date.now();
await page.goto(url, { waitUntil: 'load' });
console.log('load ms', Date.now() - t0);
const log = [];
for (let t = 0; t <= +total; t += +step) {
  const info = await page.evaluate(() => {
    const y = scrollY;
    const secs = [...document.querySelectorAll('section[id], [data-page], main > *')];
    let cur = '';
    for (const s of secs) { const r = s.getBoundingClientRect(); if (r.top <= innerHeight / 2 && r.bottom >= innerHeight / 2) { cur = s.id || s.getAttribute('data-page') || s.className.toString().slice(0, 40); } }
    return { y, cur, docH: document.documentElement.scrollHeight, overflowX: document.documentElement.scrollWidth > innerWidth };
  });
  log.push({ t, ...info });
  await page.screenshot({ path: `${out}${label}-${String(t).padStart(3, '0')}.jpg`, type: 'jpeg', quality: 60 });
  await page.waitForTimeout(+step * 1000);
}
console.log(JSON.stringify(log));
console.log('errors', errors.length, [...new Set(errors)].slice(0, 15).join('\n'));
await browser.close();
