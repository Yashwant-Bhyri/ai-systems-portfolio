// Find elements whose text matches, inside a room; print their class chain and box
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , hash, room, needle] = process.argv;
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1200);
const go = () => p.evaluate(([id, r]) => { const el = document.getElementById(id); scrollTo({ top: el.getBoundingClientRect().top + scrollY + (+r) * innerHeight, behavior: 'instant' }); }, [hash, room]);
await go(); await p.waitForTimeout(1500); await go(); await p.waitForTimeout(9000);
console.log(await p.evaluate((n) => [...document.querySelectorAll('.ex-scene *')].filter(e => e.childElementCount === 0 && e.textContent.includes(n)).slice(0, 6).map(e => { const chain = []; let x = e; for (let i = 0; i < 5 && x; i++, x = x.parentElement) chain.push(x.tagName.toLowerCase() + '.' + [...x.classList].join('.')); const r = e.getBoundingClientRect(); return chain.join(' < ') + ` @${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`; }).join('\n'), needle));
await b.close();
