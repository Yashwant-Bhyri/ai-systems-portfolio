// node shotx.mjs <tile> <name> <waits csv> [preClickText(Part2)]
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , tile, name, waits, part] = process.argv;
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3291/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1500);
await p.evaluate(() => document.getElementById('inference-study').scrollIntoView()); await p.waitForTimeout(400);
if (part) { await p.locator('#inference-study').getByText(part).first().click(); await p.waitForTimeout(1200); }
const reel = part ? '#inference-serving-lab .rl-reel' : '#inference-study .rl-reel';
if (tile) { await p.locator(reel).first().evaluate(e => e.scrollIntoView()); await p.waitForTimeout(500); await p.locator(reel).first().locator('.rl-row').getByText(tile).first().click(); }
await p.mouse.move(700, 450);
let last = 0;
for (const w of waits.split(',').map(Number)) { await p.waitForTimeout(w - last); last = w; await p.screenshot({ path: `lab0/${name}-${w}.jpg`, type: 'jpeg', quality: 62 }); }
await b.close();
