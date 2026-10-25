// Capture a starred number across one shine cycle: node shine.mjs <section> <branch> "<label>" "<selector>" [wait]
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , sec, branch, label, sel, wait = '8000'] = process.argv;
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })).newPage();
await p.goto('http://localhost:3290/?labnav=bar', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1200);
await p.evaluate((id) => { const el = document.getElementById(id); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' }); }, sec);
await p.waitForTimeout(600);
if (branch === '1') { await p.locator(`#${sec} .br-branch`).nth(1).click(); await p.waitForTimeout(700); }
const tab = () => p.locator(`#${sec} .lb-bar button`).filter({ hasText: label }).first();
if (!(await tab().count())) { await p.locator(`#${sec} .lb-bar .mb-tab`).first().click(); await p.waitForTimeout(500); }
await tab().click(); await p.waitForTimeout(+wait);
await p.evaluate(() => document.querySelectorAll('.ls-story, .cxp-explorer, .rr-explorer').forEach(() => {}));
const el = p.locator(`#${sec} .lb-stage ${sel}`).first();
const box = await el.boundingBox();
for (let i = 0; i < 8; i++) { await p.screenshot({ path: `fit/shine-${i}.png`, clip: { x: box.x - 30, y: box.y - 20, width: Math.min(420, box.width + 80), height: box.height + 40 } }); await p.waitForTimeout(500); }
await b.close();
