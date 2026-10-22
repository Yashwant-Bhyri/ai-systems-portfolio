// Capture reference sites: first viewport plus N scrolled viewports each.
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const sites = JSON.parse(process.argv[2]);
const out = new URL('./refs/', import.meta.url).pathname;
const b = await chromium.launch();
for (const [name, url, scrolls = 2] of sites) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  try {
    await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await p.waitForTimeout(5000);
    for (let i = 0; i <= scrolls; i++) {
      await p.screenshot({ path: `${out}${name}-${i}.jpg`, type: 'jpeg', quality: 60, timeout: 20000 });
      await p.mouse.wheel(0, 1000); await p.waitForTimeout(2200);
    }
    console.log('ok', name);
  } catch (e) { console.log('fail', name, e.message.slice(0, 80)); }
  await ctx.close();
}
await b.close();
