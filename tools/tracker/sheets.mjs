import { chromium } from "/Users/yash/antigravity/node_modules/playwright/index.mjs";
import { readdirSync, readFileSync } from "node:fs";
const dir = new URL("./out/audit/", import.meta.url).pathname;
const files = readdirSync(dir).filter((f) => f.endsWith(".jpg") && !f.startsWith("sheet")).sort();
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1800, height: 1140 } })).newPage();
for (let i = 0; i < files.length; i += 4) {
  const group = files.slice(i, i + 4);
  const html = `<body style="margin:0;background:#222;display:grid;grid-template-columns:1fr 1fr;gap:4px">${group.map((f) => `<div style="position:relative"><img style="width:100%;display:block" src="data:image/jpeg;base64,${readFileSync(dir + f).toString("base64")}"><b style="position:absolute;left:6px;top:6px;background:#ff0;color:#000;font:14px monospace;padding:2px 4px">${f}</b></div>`).join("")}</body>`;
  await p.setContent(html); await p.waitForTimeout(200);
  await p.screenshot({ path: `${dir}sheet-${String(i / 4).padStart(2, "0")}.jpg`, type: "jpeg", quality: 78, fullPage: true });
}
console.log(files.length, "images,", Math.ceil(files.length / 4), "sheets");
await b.close();
