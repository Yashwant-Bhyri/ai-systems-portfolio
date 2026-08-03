/* The root layout owns <html>, so an App Router static export cannot give the
 * Chinese route its own lang attribute. The client corrects it on load, but a
 * crawler reading the exported file would still see lang="en" — so patch the
 * emitted Chinese pages here, for whichever exporter produced them. */
import fs from "node:fs";
import path from "node:path";

const roots = ["out", "dist/client"];
let patched = 0;

for (const root of roots) {
  const file = path.join(root, "zh", "index.html");
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, "utf8");
  if (/<html[^>]*\slang="zh-Hans"/i.test(html)) {
    console.log(`postbuild-lang: ${file} already zh-Hans`);
    patched += 1;
    continue;
  }
  const next = html.replace(/<html([^>]*?)\slang="[^"]*"/i, '<html$1 lang="zh-Hans"');
  if (next === html) {
    console.error(`postbuild-lang: no <html lang> found in ${file}`);
    process.exitCode = 1;
    continue;
  }
  fs.writeFileSync(file, next);
  console.log(`postbuild-lang: ${file} -> lang="zh-Hans"`);
  patched += 1;
}

if (!patched) console.log("postbuild-lang: no exported Chinese page found (skipped)");
