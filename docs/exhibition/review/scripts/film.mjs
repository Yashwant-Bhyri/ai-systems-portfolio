// node film.mjs <section> <branch> "<label>" "<t1,t2,...>" [vw] [vh] [tag] [textOut]
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const [, , sec, branch, label, times, vw = '1440', vh = '900', tag = '', textOut = ''] = process.argv;
const OUT = '/Users/yash/Portfolio/design-lab/docs/exhibition/review/shots';
const slug = (label.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + (tag ? '-' + tag : '')).replace(/^-|-$/g, '');
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: +vw, height: +vh }, deviceScaleFactor: 1 })).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160)));
await p.goto(`http://localhost:3290/`, { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(3500);
const toSec = async () => p.evaluate((id) => { const el = document.getElementById(id); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' }); }, sec);
await toSec(); await p.waitForTimeout(600);
if (branch === '1') { await p.locator(`#${sec} .br-branch`).nth(1).click(); await p.waitForTimeout(700); }
if (label !== '-') {
  const tab = () => p.locator(`#${sec} .lb-bar button`).filter({ hasText: label }).first();
  if (!(await tab().count()) || !(await tab().isVisible())) { await p.locator(`#${sec} .lb-bar .mb-tab`).first().click(); await p.waitForTimeout(500); }
  for (let k = 0; k < 6; k++) {
    await tab().click({ timeout: 20000, force: true }); await p.waitForTimeout(700);
    const ok = await tab().evaluate(b => b.getAttribute('aria-selected') === 'true' || b.hasAttribute('aria-current') || b.classList.contains('is-active') || b.dataset.active === 'true');
    if (ok) break; console.log('retry click', k);
  }
}
await toSec();
const t0 = Date.now(); let text = `# ${label} ${vw}x${vh}\n`;
for (const t of times.split(',').map(Number)) {
  const left = t * 1000 - (Date.now() - t0); if (left > 0) await p.waitForTimeout(left);
  const r = await p.evaluate((sec) => {
    const s = document.getElementById(sec); const stage = s.querySelector('.lb-stage') || s;
    const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); if (!(r.width > 0 && r.height > 0 && cs.visibility !== 'hidden')) return false; let e = el; while (e && e !== document.body) { const c = getComputedStyle(e); if (+c.opacity < 0.05 || c.display === 'none') return false; e = e.parentElement; } return true; };
    const sr = s.getBoundingClientRect();
    // clipped text: element with scrollWidth>clientWidth and overflow hidden/ellipsis
    const clipped = [];
    s.querySelectorAll('*').forEach(el => { if (!vis(el)) return; const cs = getComputedStyle(el); if ((el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2) && el.clientHeight > 0 && /hidden|clip/.test(cs.overflow + cs.overflowX + cs.overflowY) && el.textContent.trim().length > 1 && el.children.length < 4) clipped.push(`${el.tagName.toLowerCase()}.${(el.className?.baseVal ?? el.className).toString().split(' ')[0]} "${el.textContent.trim().slice(0, 50)}" sw${el.scrollWidth}/cw${el.clientWidth} sh${el.scrollHeight}/ch${el.clientHeight}`); });
    // overlap of leaf text nodes
    const leaves = [];
    s.querySelectorAll('h1,h2,h3,h4,p,span,small,strong,b,em,text,tspan,button,label,dt,dd,li,time,mark,figcaption').forEach(el => { if (!vis(el)) return; if ([...el.children].length) return; const t = el.textContent.trim(); if (t.length < 2) return; const r = el.getBoundingClientRect(); if (r.bottom < sr.top || r.top > sr.bottom) return; leaves.push({ el, t, r }); });
    const ov = [];
    for (let i = 0; i < leaves.length; i++) for (let j = i + 1; j < leaves.length; j++) { const a = leaves[i].r, c = leaves[j].r; const w = Math.min(a.right, c.right) - Math.max(a.left, c.left), h = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top); if (w > 3 && h > 3 && w * h > 0.25 * Math.min(a.width * a.height, c.width * c.height)) { if (leaves[i].el.contains(leaves[j].el) || leaves[j].el.contains(leaves[i].el)) continue; ov.push(`"${leaves[i].t.slice(0, 30)}" x "${leaves[j].t.slice(0, 30)}"`); } }
    // off-section
    const out = leaves.filter(l => l.r.bottom > sr.bottom + 1 || l.r.right > innerWidth + 1 || l.r.left < -1).map(l => `"${l.t.slice(0, 30)}" b${Math.round(l.r.bottom)} r${Math.round(l.r.right)}`);
    const lines = [...new Set(leaves.map(l => `${l.el.tagName.toLowerCase()}.${(l.el.className?.baseVal ?? l.el.className).toString().split(' ')[0]}: ${l.t.replace(/\s+/g, ' ')}`))];
    return { fit: [stage.clientHeight, stage.scrollHeight], doc: [document.documentElement.scrollWidth, innerWidth], secH: Math.round(sr.height), clipped: clipped.slice(0, 15), ov: ov.slice(0, 20), out: out.slice(0, 15), lines, minFont: Math.min(...leaves.map(l => parseFloat(getComputedStyle(l.el).fontSize) * (l.el.getScreenCTM ? (l.el.getScreenCTM()?.a || 1) : 1))) };
  }, sec);
  const f = `${OUT}/${slug}-${vw}-${t}s.jpg`;
  await p.screenshot({ path: f, type: 'jpeg', quality: 72 });
  const hdr = `t=${t}s stage ${r.fit[0]}/${r.fit[1]}${r.fit[1] - r.fit[0] > 2 ? ' OVERFLOW' : ''} doc ${r.doc[0]}/${r.doc[1]} secH ${r.secH} minFont ${r.minFont.toFixed(1)}`;
  console.log(hdr + '\n  clipped: ' + r.clipped.join(' ; ') + '\n  overlap: ' + r.ov.join(' ; ') + '\n  outside: ' + r.out.join(' ; ') + '\n  -> ' + f);
  text += `\n## ${hdr}\n${r.lines.join('\n')}\n`;
}
if (textOut) writeFileSync(textOut, text);
console.log('errors', errs.length ? [...new Set(errs)] : 'none');
await b.close();
