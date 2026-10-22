// Links, landmarks, focus, contrast spot checks, nav anchor landing, profile reveal timing.
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';

const out = new URL('./shots/', import.meta.url).pathname;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://localhost:3001/', { waitUntil: 'load' });
await page.waitForTimeout(1200);

const facts = await page.evaluate(() => {
  const links = [...document.querySelectorAll('a[href]')].map((a) => ({ t: (a.textContent || a.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40), h: a.getAttribute('href') }));
  const ext = [...new Map(links.filter((l) => /^(https?:|mailto:|tel:|\/.*\.(pdf|docx?))/.test(l.h)).map((l) => [l.h, l])).values()];
  const hashes = [...new Set(links.filter((l) => l.h.startsWith('#')).map((l) => l.h))];
  const missingTargets = hashes.filter((h) => h.length > 1 && !document.getElementById(h.slice(1)));
  const btns = [...document.querySelectorAll('button')];
  const unnamed = btns.filter((b) => !(b.textContent.trim() || b.getAttribute('aria-label') || b.getAttribute('title'))).length;
  const imgsNoAlt = [...document.querySelectorAll('img:not([alt])')].length;
  const svgs = document.querySelectorAll('svg').length;
  const h1 = [...document.querySelectorAll('h1')].map((h) => h.textContent.trim().slice(0, 50));
  const headings = [...document.querySelectorAll('h1,h2,h3')].length;
  const lang = document.documentElement.lang;
  const anim = document.getAnimations().length;
  const sm = getComputedStyle(document.getElementById('inference-study')).scrollMarginTop;
  const meta = { title: document.title, desc: document.querySelector('meta[name=description]')?.content, og: document.querySelector('meta[property="og:image"]')?.content, canonical: document.querySelector('link[rel=canonical]')?.href };
  return { ext, missingTargets, nButtons: btns.length, unnamed, imgsNoAlt, svgs, h1, headings, lang, anim, sm, meta, nodes: document.querySelectorAll('*').length };
});
console.log(JSON.stringify(facts, null, 1));

// Contrast of the lime "continue into microscope" bar seen in antigravity overview.
const cta = await page.evaluate(() => {
  const res = [];
  for (const el of document.querySelectorAll('a, button')) {
    const t = el.textContent.trim();
    if (!/continue into/i.test(t)) continue;
    const cs = getComputedStyle(el);
    res.push({ t: t.slice(0, 50), color: cs.color, bg: cs.backgroundColor, op: cs.opacity });
  }
  return res;
});
console.log('CTA', JSON.stringify(cta));

// Keyboard: tab 12 times from top and record focus targets + whether a focus ring is visible.
await page.keyboard.press('Tab');
const foci = [];
for (let i = 0; i < 14; i++) {
  foci.push(await page.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return `${a.tagName}:${(a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 24)} | outline=${cs.outlineStyle} ${cs.outlineWidth} shadow=${cs.boxShadow !== 'none'}`; }));
  await page.keyboard.press('Tab');
}
console.log('FOCUS\n' + foci.join('\n'));

// Header nav click: where does the inference-study title land?
await page.goto('http://localhost:3001/#post-training-study', { waitUntil: 'load' });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${out}anchor-post-training-study.jpg`, type: 'jpeg', quality: 60 });

// Profile reveal timing
await page.goto('http://localhost:3001/#profile', { waitUntil: 'load' });
for (const t of [1, 4, 9, 16]) {
  await page.waitForTimeout(t === 1 ? 1000 : (t - [1, 4, 9, 16][[1, 4, 9, 16].indexOf(t) - 1]) * 1000);
  await page.screenshot({ path: `${out}profile-t${t}.jpg`, type: 'jpeg', quality: 60 });
}
await browser.close();
