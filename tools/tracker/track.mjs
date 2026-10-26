// Stage tracker runner.
//   node track.mjs module <section> <key> [seconds=20] [vw=1440] [vh=900]
//   node track.mjs all [seconds=16]          — every module of both labs, a report per module and one summary
// Transitions are measured by jank.mjs / jank-show.mjs.
// Writes JSON, a markdown report and annotated screenshots to tools/tracker/out/.
import { chromium } from "/Users/yash/antigravity/node_modules/playwright/index.mjs";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { frameIssues, gaps, shifts, summarize } from "./analyze.mjs";

const OUT = new URL("./out/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const INJECT = readFileSync(new URL("./inject.js", import.meta.url), "utf8");
const slug = (s) => s.replace(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/^-|-$/g, "");

const ROUTE = { "inference-study": "/inference", "post-training-study": "/post-training" };
/** Open a module by its deep link on the project's own route (the title-show layout). */
async function openModule(b, { section, key, vw = 1440, vh = 900 }) {
  const ctx = await b.newContext({ viewport: { width: +vw, height: +vh } });
  await ctx.addInitScript(INJECT);
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message.slice(0, 160)));
  await p.goto(`http://localhost:3290${ROUTE[section]}?labnav=show#${section}/${key}`, { waitUntil: "load", timeout: 120000 });
  await p.waitForTimeout(2500);
  return { p, ctx, errors };
}

const stageSel = (section) => `#${section} .lf-stage`;

async function trackModule(b, { section, key, label, seconds = 20, vw, vh, interval = 500 }) {
  const layout = "show";
  const { p, ctx, errors } = await openModule(b, { section, key, vw, vh });
  const sel = stageSel(section);
  const frames = [];
  const t0 = Date.now();
  while (Date.now() - t0 < seconds * 1000) {
    const s = await p.evaluate((sel) => window.__track.snapshot(sel), sel);
    if (s) frames.push(s);
    await p.waitForTimeout(interval);
  }
  const perFrame = frames.map((f) => frameIssues(f));
  const gapsPer = frames.map((f) => gaps(f));
  const summary = summarize(perFrame);
  const worstFrame = perFrame.reduce((bi, x, i, arr) => (x.length > arr[bi].length ? i : bi), 0);
  const gapWorst = gapsPer.reduce((bi, g, i, arr) => (g.largestEmpty > arr[bi].largestEmpty ? i : bi), 0);
  const sh = shifts(frames);
  // annotated screenshot of the worst moment (replay to that time is not possible; annotate now and at the end)
  const name = `${slug(section)}-${slug(label)}-${layout}`;
  const issuesNow = frameIssues(await p.evaluate((sel) => window.__track.snapshot(sel), sel));
  const gapNow = gaps(await p.evaluate((sel) => window.__track.snapshot(sel), sel));
  if (gapNow.rect) issuesNow.push({ r: gapNow.rect, label: `empty ${gapNow.largestEmpty}%` });
  await p.evaluate(([sel, issues]) => window.__track.overlay(sel, issues), [sel, issuesNow]);
  await p.screenshot({ path: `${OUT}${name}.jpg`, type: "jpeg", quality: 62 });
  await p.evaluate(() => window.__track.clear());
  const report = {
    module: label, section, layout, frames: frames.length, seconds,
    worstFrameIssues: perFrame[worstFrame].length,
    issues: summary.slice(0, 60).map(({ r, ...x }) => ({ ...x, at: { x: Math.round(r.x), y: Math.round(r.y) } })),
    gaps: { worst: gapsPer[gapWorst], median: gapsPer.map((g) => g.largestEmpty).sort((a, b) => a - b)[gapsPer.length >> 1], coveredMedian: gapsPer.map((g) => g.covered).sort((a, b) => a - b)[gapsPer.length >> 1] },
    shifts: sh.filter((x) => x.moved > 0).slice(0, 30),
    minTextPx: Math.min(...frames.flatMap((f) => f.texts.filter((t) => t.op > 0.5 && t.t).map((t) => t.px)).filter((x) => x > 0)),
    errors,
  };
  writeFileSync(`${OUT}${name}.json`, JSON.stringify(report, null, 1));
  await ctx.close();
  return report;
}

const MODULES = [
  ["inference-study", "film", "The experiment"], ["inference-study", "composition", "Policy × runtime"], ["inference-study", "replay", "Execution replay"], ["inference-study", "latency", "Queue & latency"],
  ["inference-study", "pressure", "Prefill / decode scheduling"], ["inference-study", "draft", "Speculative decoding"], ["inference-study", "cache", "Cache-aware routing"],
  ["inference-study", "overlap", "CPU / GPU overlap"], ["inference-study", "map", "Serving system overview"], ["inference-study", "glossary", "Serving glossary"],
  ["post-training-study", "film", "Post-training film"], ["post-training-study", "inside", "Inside the model"], ["post-training-study", "terrain", "Capability terrain"],
  ["post-training-study", "map", "Capability map"], ["post-training-study", "curves", "Compute curves"], ["post-training-study", "tasks", "Where the 96 tasks land"],
  ["post-training-study", "fleet", "Elastic RL on 64 GPUs"], ["post-training-study", "audit", "Regression audit"],
];

const [, , mode = "all", ...args] = process.argv;
const b = await chromium.launch();
if (mode === "module") {
  const [section, key, seconds = "20", vw = "1440", vh = "900"] = args;
  console.log(JSON.stringify(await trackModule(b, { section, key, label: key, seconds: +seconds, vw, vh }), null, 1));
} else {
  const [seconds = "16"] = args;
  const layout = "show";
  const rows = [];
  for (const [section, key, label] of MODULES) {
    try {
      const r = await trackModule(b, { section, key, label, seconds: +seconds });
      const count = (k) => r.issues.filter((x) => x.kind === k).length;
      rows.push(`| ${label} | ${count("text-over-text")} | ${count("text-crossed")} | ${count("text-clipped") + count("text-truncated")} | ${count("text-small")} | ${r.minTextPx} | ${r.gaps.worst.largestEmpty}% | ${r.shifts.length} | ${r.errors.length} |`);
      console.log("done", label);
    } catch (e) { rows.push(`| ${label} | failed: ${String(e.message).slice(0, 60)} |||||||`); }
  }
  const md = `# Stage tracker · ${layout} · ${new Date().toISOString().slice(0, 16)}\n\n| Module | text over text | text crossed by graphic | clipped / truncated | text < 10 px | min px | largest empty area | frames with layout shift | errors |\n|---|---|---|---|---|---|---|---|---|\n${rows.join("\n")}\n`;
  writeFileSync(`${OUT}summary-${layout}.md`, md);
  console.log(md);
}
await b.close();
