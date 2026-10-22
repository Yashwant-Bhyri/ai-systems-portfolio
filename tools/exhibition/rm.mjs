import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 200)));
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1200);
for (const [w, r] of [['post-training', 3], ['inference', 3]]) {
  const go = () => p.evaluate(([id, r]) => { const el = document.getElementById(id); scrollTo({ top: el.getBoundingClientRect().top + scrollY + r * innerHeight, behavior: 'instant' }); }, [w, r]);
  await go(); await p.waitForTimeout(900); await go(); await p.waitForTimeout(1500);
  await p.screenshot({ path: `shots/rm-${w}-${r}.jpg`, type: 'jpeg', quality: 70 });
  console.log(w, await p.evaluate((id) => document.querySelector(`#${id} .ex-play`).getAttribute('aria-label'), w));
}
console.log('errors', errs.length ? errs.join('\n') : 'none'); await b.close();
