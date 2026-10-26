// Stage tracker runner.
//   node track.mjs module  <section> <branch 0|1> "<module or chapter>" [seconds=20] [layout=top] [vw=1440] [vh=900]
//   node track.mjs transition <section> <branch 0|1> "<from>" "<to>" [layout=top]
//   node track.mjs all [layout=top]          — every module, a report per module and one summary
// Writes JSON, a markdown report and annotated screenshots to tools/tracker/out/.
import { chromium } from "/Users/yash/antigravity/node_modules/playwright/index.mjs";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { frameIssues, gaps, shifts, summarize } from "./analyze.mjs";

const OUT = new URL("./out/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const INJECT = readFileSync(new URL("./inject.js", import.meta.url), "utf8");
const slug = (s) => s.replace(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/^-|-$/g, "");

async function openLab(b, { section, branch, layout, vw = 1440, vh = 900 }) {
  const ctx = await b.newContext({ viewport: { width: +vw, height: +vh } });
  await ctx.addInitScript(INJECT);
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message.slice(0, 160)));
  await p.goto(`http://localhost:3290/?labnav=${layout}`, { waitUntil: "load", timeout: 120000 });
  await p.waitForTimeout(1200);
  await p.evaluate((id) => { const el = document.getElementById(id); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: "instant" }); }, section);
  await p.waitForTimeout(500);
  if (branch === "1") { await p.locator(`#${section} .br-branch`).nth(1).click(); await p.waitForTimeout(900); }
  return { p, ctx, errors };
}

async function choose(p, section, label) {
  // a module tab (bar), a reel tile, or a film chapter pill
  const sel = `#${section} :is(.mb-tab, .rl-tile, .ls-chapters button)`;
  let btn = p.locator(sel).filter({ hasText: label }).first();
  if (!(await btn.count())) {
    await p.locator(`#${section} :is(.mb-tab, .rl-tile)`).filter({ hasText: "The experiment" }).first().click();
    await p.waitForTimeout(600);
    btn = p.locator(sel).filter({ hasText: label }).first();
  }
  await btn.click({ timeout: 8000 });
}

const stageSel = (section, layout) => `#${section} ${layout === "bar" ? ".lb-stage" : ".lf-stage"}`;

async function trackModule(b, { section, branch, label, seconds = 20, layout = "top", vw, vh, interval = 500 }) {
  const { p, ctx, errors } = await openLab(b, { section, branch, layout, vw, vh });
  await choose(p, section, label);
  await p.waitForTimeout(800);
  const sel = stageSel(section, layout);
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

async function trackTransition(b, { section, branch, from, to, layout = "top" }) {
  const { p, ctx, errors } = await openLab(b, { section, branch, layout });
  await choose(p, section, from);
  await p.waitForTimeout(2500);
  const sel = `#${section}`;
  const frames = [];
  const sample = async () => { const s = await p.evaluate((sel) => window.__track.snapshot(sel), sel); if (s) frames.push(s); };
  await sample();
  await choose(p, section, to);
  const t0 = Date.now();
  while (Date.now() - t0 < 1800) { await sample(); await p.waitForTimeout(30); }
  const sh = shifts(frames, 6);
  const stageH = frames.map((f) => Math.round((f.blocks.find((x) => /lf-stage|lb-stage/.test(x.cls)) ?? { h: 0 }).h));
  const navY = frames.map((f) => Math.round((f.blocks.find((x) => /lf-nav|lb-bar/.test(x.cls)) ?? { y: 0 }).y));
  const report = {
    from, to, layout, frames: frames.length,
    framesWithMovement: sh.filter((x) => x.moved > 0).length,
    maxMoved: Math.max(0, ...sh.map((x) => x.moved)),
    worst: sh.filter((x) => x.worst).sort((a, b) => b.worst.d - a.worst.d).slice(0, 8).map((x) => ({ t: x.t, d: x.worst.d, k: x.worst.k, moved: x.moved })),
    scrollJumps: sh.filter((x) => x.scroll > 2).map((x) => ({ t: x.t, by: x.scroll })),
    stageHeight: [...new Set(stageH)], navY: [...new Set(navY)],
    errors,
  };
  writeFileSync(`${OUT}transition-${slug(from)}-${slug(to)}-${layout}.json`, JSON.stringify(report, null, 1));
  await ctx.close();
  return report;
}

const MODULES = [
  ["inference-study", "0", "Baseline serving"], ["inference-study", "0", "Worker scheduling"], ["inference-study", "0", "KV prefix reuse"],
  ["inference-study", "0", "Prefill & decode execution"], ["inference-study", "0", "Combined runtime gains"],
  ["inference-study", "0", "Policy × runtime"], ["inference-study", "0", "Execution replay"], ["inference-study", "0", "Queue & latency"],
  ["inference-study", "1", "Prefill / decode scheduling"], ["inference-study", "1", "Speculative decoding"], ["inference-study", "1", "Cache-aware routing"],
  ["inference-study", "1", "CPU / GPU overlap"], ["inference-study", "1", "Serving system overview"], ["inference-study", "1", "Serving glossary"],
  ["post-training-study", "0", "The starting point"], ["post-training-study", "0", "SFT + LoRA"], ["post-training-study", "0", "Learn from outcomes"],
  ["post-training-study", "0", "Give it more thought"], ["post-training-study", "0", "Make thought count"], ["post-training-study", "0", "The frontier"],
  ["post-training-study", "0", "Capability map"], ["post-training-study", "0", "Compute curves"], ["post-training-study", "0", "Where the 96 tasks land"],
  ["post-training-study", "0", "Elastic RL on 64 GPUs"], ["post-training-study", "0", "Regression audit"],
];

const [, , mode = "all", ...args] = process.argv;
const b = await chromium.launch();
if (mode === "module") {
  const [section, branch, label, seconds = "20", layout = "top", vw = "1440", vh = "900"] = args;
  console.log(JSON.stringify(await trackModule(b, { section, branch, label, seconds: +seconds, layout, vw, vh }), null, 1));
} else if (mode === "transition") {
  const [section, branch, from, to, layout = "top"] = args;
  console.log(JSON.stringify(await trackTransition(b, { section, branch, from, to, layout }), null, 1));
} else {
  const [layout = "top", seconds = "16"] = args;
  const rows = [];
  for (const [section, branch, label] of MODULES) {
    try {
      const r = await trackModule(b, { section, branch, label, seconds: +seconds, layout });
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
