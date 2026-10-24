// node astra-shots.mjs <url> <outdir> <id:offsetPx:waitMs,...>
import { chromium } from '/Users/yash/antigravity/node_modules/playwright/index.mjs';
const [, , url, out, list] = process.argv;
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(url, { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(2500);
for (const item of list.split(',')) {
  const [id, off = '0', wait = '3000'] = item.split(':');
  await p.evaluate(([id, off]) => { const el = document.getElementById(id); scrollTo({ top: el.getBoundingClientRect().top + scrollY + +off, behavior: 'instant' }); }, [id, off]);
  await p.waitForTimeout(+wait);
  await p.screenshot({ path: `${out}/${id}-${off}.jpg`, type: 'jpeg', quality: 70 });
}
await b.close();
