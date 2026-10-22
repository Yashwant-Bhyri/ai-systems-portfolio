// node shot.mjs <hash> <seconds,...> [mode] [w] [h] [label]  → screenshots of the viewport while parked in a wing
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , hash = 'post-training', times = '3', mode = 'light', w = '1440', h = '900', label = hash, room = '0'] = process.argv;
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: +w, height: +h } }); const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push('pageerror: ' + e.message.slice(0, 300))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
await p.addInitScript((m) => { try { localStorage.setItem('ex-mode', m); localStorage.setItem('lang', 'en'); } catch {} }, mode);
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(1500);
// dismiss a language gate if present
const gate = p.locator('.vx-lang-gate button').first(); if (await gate.isVisible().catch(() => false)) await gate.click();
await p.evaluate(([id, r]) => { const el = document.getElementById(id); scrollTo({ top: el.getBoundingClientRect().top + scrollY + (+r) * innerHeight, behavior: 'instant' }); }, [hash, room]);
await p.waitForTimeout(1800);
await p.evaluate(([id, r]) => { const el = document.getElementById(id); scrollTo({ top: el.getBoundingClientRect().top + scrollY + (+r) * innerHeight, behavior: 'instant' }); }, [hash, room]);
let last = 0;
for (const t of times.split(',').map(Number)) { await p.waitForTimeout((t - last) * 1000); last = t; await p.screenshot({ path: `shots/${label}-${mode}-${String(t).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 72 }); }
console.log('errors:', errs.length ? [...new Set(errs)].join('\n') : 'none');
await b.close();
