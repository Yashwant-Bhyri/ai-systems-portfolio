import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
await p.goto('file:///Users/yash/Documents/Resume/exhibition-prototype/index.html'); await p.waitForTimeout(1000);
await p.evaluate(() => document.getElementById('stage').scrollIntoView());
const plan = [[0,[6,14,24,33]],[1,[4,9,15]],[2,[5,11,18]],[3,[6,14,18]]];
for (const [s, ts] of plan) {
  if (s) await p.keyboard.press('ArrowDown');
  let last = 0;
  for (const t of ts) { await p.waitForTimeout((t-last)*1000); last = t; await p.locator('#stage').screenshot({ path: `proto/s${s}-${t}.jpg`, type: 'jpeg', quality: 60 }); }
}
await b.close();
