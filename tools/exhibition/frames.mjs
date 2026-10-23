// Freeze each room at given fractions of its duration and screenshot. node frames.mjs <wing> <mode> <w> <h> <fractions> <label>
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , wing = 'post-training', mode = 'light', w = '1440', h = '900', fr = '0.97', label = 'f', rooms = ''] = process.argv;
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: +w, height: +h } }); const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 200)));
await p.addInitScript(([m, l]) => { try { localStorage.setItem('ex-mode', m); if (l) localStorage.setItem('portfolio-lang', l); } catch {} }, [mode, process.env.LANG_ZH ? 'zh' : '']);
await p.goto('http://localhost:3290/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(1500);
const n = await p.evaluate((id) => document.querySelectorAll(`#${id} .ex-segs li`).length, wing);
const list = rooms ? rooms.split(',').map(Number) : [...Array(n).keys()];
for (const r of list) {
  const go = () => p.evaluate(([id, r]) => { const el = document.getElementById(id); scrollTo({ top: el.getBoundingClientRect().top + scrollY + r * innerHeight, behavior: 'instant' }); }, [wing, r]);
  await go(); await p.waitForTimeout(900); await go(); await p.waitForTimeout(1200);
  for (const f of fr.split(',').map(Number)) {
    const dur = await p.evaluate(([id, r]) => { const seg = document.querySelectorAll(`#${id} .ex-segs li`)[r]; return seg ? 1 : 0; }, [wing, r]);
    await p.evaluate(([id, f]) => {
      const durations = window.__exDur?.[id];
      dispatchEvent(new CustomEvent('ex:seek', { detail: { wing: id, ms: (durations ? durations : 0) } }));
    }, [wing, f]);
    // durations are read from the strip label via a data attribute
    const ms = await p.evaluate(([id, r, f]) => { const li = document.querySelectorAll(`#${id} .ex-segs li`)[r]; return Math.round(+li.dataset.duration * f); }, [wing, r, f]);
    await p.evaluate(([id, ms]) => dispatchEvent(new CustomEvent('ex:seek', { detail: { wing: id, ms } })), [wing, ms]);
    await p.waitForTimeout(700);
    await p.screenshot({ path: `shots/${label}-${wing}-${mode}-${w}-r${r}-${String(Math.round(f * 100)).padStart(3, '0')}.jpg`, type: 'jpeg', quality: 72 });
  }
}
console.log('errors:', errs.length ? [...new Set(errs)].join('\n') : 'none', 'rooms', list.length);
await b.close();
