// Hover every reel tile and capture it open, at 2x.
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }); const p = await ctx.newPage();
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2000);
const shootReels = async (prefix) => {
  const reels = await p.locator('.rl-reel:visible').count();
  for (let r = 0; r < reels; r++) {
    const reel = p.locator('.rl-reel:visible').nth(r);
    await reel.scrollIntoViewIfNeeded();
    const n = await reel.locator('.rl-tile').count();
    for (let i = 0; i < n; i++) {
      const t = reel.locator('.rl-tile').nth(i);
      await t.hover(); await p.waitForTimeout(1500);
      await t.screenshot({ path: `glyphs/${prefix}-${r}-${i}.png` });
    }
  }
};
await p.evaluate(() => document.getElementById('inference-study').scrollIntoView());
await p.waitForTimeout(800); await shootReels('p1');
await p.locator('#inference-study').getByText('Serving under load').first().click(); await p.waitForTimeout(1500);
await shootReels('p2');
await p.evaluate(() => document.getElementById('post-training-study').scrollIntoView()); await p.waitForTimeout(800);
const pt = p.locator('#post-training-study .rl-reel');
await pt.scrollIntoViewIfNeeded(); const n = await pt.locator('.rl-tile').count();
for (let i = 0; i < n; i++) { const t = pt.locator('.rl-tile').nth(i); await t.hover(); await p.waitForTimeout(1500); await t.screenshot({ path: `glyphs/pt-${i}.png` }); }
await b.close();
