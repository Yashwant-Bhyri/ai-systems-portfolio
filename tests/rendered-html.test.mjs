import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

function sourceSlice(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(startIndex, -1, `Missing source marker: ${start}`);
  assert.notEqual(endIndex, -1, `Missing source marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

function countObjectIds(source) {
  return (source.match(/^\s{4}id:/gm) ?? []).length;
}

function countInlineObjectIds(source) {
  return (source.match(/\{\s*id:/g) ?? []).length;
}

function countStoryLabels(source) {
  return (source.match(/^\s{4}label:/gm) ?? []).length;
}

function countStorySignals(source) {
  return (source.match(/^\s{4}signals:/gm) ?? []).length;
}

function countStoryHighlights(source) {
  return (source.match(/^\s{4}annotationHighlights:/gm) ?? []).length;
}

function storySignalCounts(source) {
  return [...source.matchAll(/^\s{4}signals: \[([^\]]+)\]/gm)].map(
    (match) => (match[1].match(/"[^"]+"/g) ?? []).length,
  );
}

function storyAnnotations(source) {
  return [...source.matchAll(/^\s{4}annotation: "([^"]+)"/gm)].map((match) => match[1]);
}

test("server-renders the recruiter-first portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Yashwant Bhyri — AI Systems &amp; Application Engineer/);
  assert.match(html, /name="theme-color" content="#050608"/);
  assert.match(html, /Skip to portfolio content/);
  assert.match(html, /Hi, welcome to my portfolio/);
  assert.match(html, /vx-hero-highlight/);
  assert.match(html, /CUHK-Shenzhen/);
  assert.match(html, /CUHK · QS World #18/);
  assert.match(html, /src="\/brands\/cuhk\.png"/);
  assert.match(html, /href="#projects">Projects/);
  assert.match(html, /Real-time AI-Native Interviewing Platform/);
  assert.match(html, /End-to-End Multimodal AI Production System/);
  assert.match(html, /Medical AI Clinician-Support Product/);
  assert.match(html, /Open-Source, Research &amp; R&amp;D Experience/);
  assert.match(html, /PRODUCTION-GRADE SOFTWARE PRODUCT/);
  assert.match(html, /AI APPLICATION ENGINEERING INTERNSHIP/);
  assert.match(html, /MEDICAL AI R&amp;D PROJECT/);
  assert.match(html, /250\+ completed interviews/);
  assert.match(html, /IMPLEMENTATION SIGNAL/);
  assert.match(html, /vx-stage-signal-console/);
  assert.match(html, /vx-signal-ticker-track-base/);
  assert.match(html, /vx-signal-ticker-track-mask/);
  // the résumé ships in two languages behind a chooser
  assert.match(html, /vx-resume-menu/);
});

test("removes the rejected imitation Antigravity walkthrough route", async () => {
  // trailingSlash (GitHub Pages static export) 308-redirects the bare path,
  // so probe the canonical trailing-slash URL.
  const response = await render("/antigravity-experience/");
  assert.equal(response.status, 404);
});

test("keeps assets, autoplay mechanics, operational graphics, and claim boundaries in source", async () => {
  const [portfolio, profile, visuals, liveVisuals, antigravity, filmora, mindscape, css] = await Promise.all([
    readFile(new URL("../app/portfolio-v2.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/profile-section.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/portfolio-visuals.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/live-visuals.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/fable/antigravity.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/fable/filmora.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/fable/mindscape.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/portfolio-v2.css", import.meta.url), "utf8"),
  ]);

  const roleSource = sourceSlice(profile, "const ROLES", "type Area");
  const skillSource = sourceSlice(profile, "const AREAS", "const ROLE_ADVANCE_MS");
  const antigravitySource = sourceSlice(portfolio, "const ANTIGRAVITY_STEPS", "const FILMORA_STEPS");
  const filmoraSource = sourceSlice(portfolio, "const FILMORA_STEPS", "const MINDSCAPE_STEPS");
  const mindscapeSource = sourceSlice(portfolio, "const MINDSCAPE_STEPS", "const RESEARCH");
  const researchSource = sourceSlice(portfolio, "const RESEARCH", "function useReducedMotion");
  const annotations = [antigravitySource, filmoraSource, mindscapeSource].flatMap(storyAnnotations);

  assert.match(portfolio, /IntersectionObserver/);
  assert.match(portfolio, /className="vx-hero-highlight"/);
  assert.match(portfolio, /assetPath\("\/brands\/cuhk\.png"\)/);
  assert.match(portfolio, /yashwant-bhyri-resume-en\.pdf/);
  assert.match(portfolio, /yashwant-bhyri-resume-zh\.pdf/);
  assert.match(portfolio, /CUHK · QS World #18/);
  assert.equal(countObjectIds(roleSource), 3);
  // The chain IS the argument: role -> engineering areas -> the concrete
  // skills each area covers. Project names are supplementary attribution only.
  assert.equal((skillSource.match(/^\s{4}id: "/gm) ?? []).length, 5);
  // The section renders twice: a light frame after the hero, and the full map
  // after the project chapters. Only the full map may name projects, because
  // only by then has the reader met them.
  assert.match(profile, /variant\s*===\s*"brief"/);
  assert.match(profile, /evidence: "/);
  assert.match(profile, /opacity: brief \? 0 : 1/);
  assert.match(portfolio, /<ProfileSection variant="brief" \/>/);
  assert.match(portfolio, /<ProfileSection variant="full" \/>/);
  assert.match(portfolio, /href: "#capabilities"/);
  // two portals: English at / and 简体中文 at /zh/
  assert.match(portfolio, /vx-lang-toggle/);
  assert.match(portfolio, /LangProvider lang=\{lang\}/);
  // Each area carries its own operational figure, not one shared decoration.
  assert.match(profile, /function AreaFigure/);
  ["application", "runtime", "knowledge", "control"].forEach((area) => {
    assert.match(profile, new RegExp(`id === "${area}"`));
  });
  assert.equal((skillSource.match(/^\s{6}"/gm) ?? []).length, 25);
  assert.match(profile, /vx-role-map/);
  assert.match(profile, /TARGET ROLES/);
  assert.match(profile, /HOW I BUILD AI SYSTEMS/);
  assert.match(profile, /MY CORE CAPABILITIES IN EACH AREA/);
  assert.match(profile, /vx-reason-track/);
  // op-svg text inherits its fill tokens from .vx-live-stage; a graphic hosted
  // outside that class must declare its own or it renders black on black.
  assert.match(css, /\.vx-map-skill \{[^}]*fill:/);
  assert.match(css, /\.vx-map-role \{[^}]*fill:/);
  assert.doesNotMatch(profile, /vx-role-to-skill-links/);
  assert.doesNotMatch(profile, /vx-skill-to-experience-links/);
  assert.match(portfolio, /useChapterHandoff/);
  assert.match(portfolio, /vx-case-overview-page/);
  assert.match(portfolio, /vx-case-microscope-page/);
  assert.match(portfolio, /scrollIntoView\(\{ behavior: "smooth", block: "start" \}\)/);
  assert.match(portfolio, /vx-conclusion-focus/);
  assert.match(portfolio, /vx-contribution-tile/);
  assert.match(portfolio, /vx-stage-annotation/);
  assert.match(portfolio, /function StageSignalConsole/);
  assert.match(portfolio, /vx-stage-signal-micro-row/);
  assert.match(portfolio, /vx-stage-annotation-emphasis/);
  assert.match(portfolio, /vx-stage-signal-diagonal-sweep/);
  assert.match(portfolio, /function SignalTicker/);
  assert.match(portfolio, /vx-signal-ticker-track-base/);
  assert.match(portfolio, /vx-signal-ticker-track-mask/);
  assert.match(portfolio, /aria-hidden="true" role="presentation"/);
  assert.match(portfolio, /vx-signal-ticker-star[^>]*aria-hidden="true">✦/);
  assert.match(portfolio, /data-reduced-motion=\{reducedMotion\}/);
  assert.match(portfolio, /data-running=\{active && !reducedMotion\}/);
  assert.match(portfolio, /vx-research-grid/);
  assert.equal(countStoryLabels(antigravitySource), 9);
  assert.equal(countStoryLabels(filmoraSource), 8);
  assert.equal(countStoryLabels(mindscapeSource), 8);
  assert.equal(countStorySignals(antigravitySource), 9);
  assert.equal(countStorySignals(filmoraSource), 8);
  assert.equal(countStorySignals(mindscapeSource), 8);
  assert.equal(countStoryHighlights(antigravitySource), 9);
  assert.equal(countStoryHighlights(filmoraSource), 8);
  assert.equal(countStoryHighlights(mindscapeSource), 8);
  [antigravitySource, filmoraSource, mindscapeSource].flatMap(storySignalCounts).forEach((count) => {
    assert.ok(count >= 3, `Every microscope step needs at least three implementation signals; received ${count}`);
  });
  assert.equal(annotations.length, 25);
  annotations.forEach((annotation) => {
    assert.ok(annotation.length <= 175, `Microscope annotation is too long (${annotation.length} chars): ${annotation}`);
    assert.doesNotMatch(annotation, /—|→/, `Microscope annotation should be a concise explanatory sentence: ${annotation}`);
  });
  assert.match(antigravitySource, /fast path selects the current question from the live interview graph/);
  assert.match(filmoraSource, /LLM gateway routes six specialist agents/);
  assert.match(mindscapeSource, /DeBERTa-v3 NLI tests every claim against its citations/);
  assert.match(antigravitySource, /label: "Evaluation loop"/);
  assert.match(mindscapeSource, /label: "Governed RL refinement"/);
  assert.match(liveVisuals, /EvaluationLoopGraphic/);
  assert.match(liveVisuals, /ClinicalRefinementGraphic/);
  assert.match(portfolio, /id="research-cont"/);
  assert.match(portfolio, /cards\(0, 3\)/);
  assert.match(portfolio, /cards\(3, 6\)/);
  assert.match(portfolio, /next === 3/);
  assert.match(portfolio, /document\.querySelector<HTMLElement>\("#contact"\)/);
  assert.match(portfolio, /LiveResearchMini index=\{item\.visual\} active=\{active\}/);
  assert.equal((researchSource.match(/^\s{4}signals:/gm) ?? []).length, 6);
  assert.doesNotMatch(researchSource, /^\s{4}proof:/gm);
  assert.doesNotMatch(portfolio, /item\.stack\.slice/);
  assert.match(portfolio, /items=\{item\.stack\.map\(\(technology\) => \(\{ label: technology \}\)\)\}/);
  assert.match(portfolio, /items=\{item\.signals\}/);
  assert.match(portfolio, /variant="metrics"/);
  // The signal rail is a continuous seamless marquee: the track animates one
  // full lap via CSS while the center highlight is measured from real geometry.
  assert.match(portfolio, /data-signal-index/);
  assert.match(css, /@keyframes vxSignalLap/);
  assert.match(css, /--vx-signal-lap-width/);
  assert.match(portfolio, /Real-time AI-Native Interviewing Platform/);
  assert.match(portfolio, /End-to-End Multimodal AI Production System/);
  assert.match(portfolio, /Medical AI Clinician-Support Product/);
  assert.match(portfolio, /Open-Source, Research & R&D Experience/);
  assert.match(portfolio, /Pre-generated \/ cached response audio/);
  assert.match(portfolio, /Decision support—not autonomous diagnosis/);
  assert.doesNotMatch(portfolio, /Start the real interview/);
  assert.match(portfolio, /250\+ completed interviews/);
  assert.match(portfolio, /built with a multi-agent orchestration and decision engine/);
  assert.match(portfolio, /integrated into Filmora Enterprise/);
  assert.match(portfolio, /agent reinforcement-learning observability and refinement/);
  assert.match(portfolio, /Yashwant_Bhyri/);
  assert.match(portfolio, /\+86 159 1412 2353/);
  assert.match(portfolio, /inPrimary && ti === cycle % cluster\.terms\.length/);
  assert.match(portfolio, /index === cycle % GALAXY_ANCHORS\.length/);
  assert.doesNotMatch(portfolio, /28% API-cost reduction|about 2% of end-to-end generation latency/);
  assert.match(portfolio, /INPUT/);
  assert.match(portfolio, /OPERATION/);
  assert.match(portfolio, /OUTPUT/);
  assert.match(portfolio, /Flask/);
  assert.match(portfolio, /SAM segmentation/);
  assert.match(portfolio, /INT8-quantized Depth Anything V2/);
  assert.match(portfolio, /five GPU texture controls/);
  assert.match(portfolio, /MEDICAL AI R&D PROJECT · CLINICIAN-SUPPORT PRODUCT/);
  assert.match(portfolio, /overviewComplete: overviewController\.complete/);
  assert.doesNotMatch(portfolio, /98 ms|98% STT|92% weakness/);
  assert.match(visuals, /FICTIONAL REPLAY/);
  assert.match(visuals, /trend-media\.svg/);
  assert.match(visuals, /trend-skill\.md/);
  assert.match(visuals, /12,751\+ pairs/);
  assert.match(antigravity, /validated question packet/);
  assert.match(antigravity, /fallback recovered the turn/);
  assert.match(antigravity, /OFFLINE RL OBSERVABILITY \+ REFINEMENT/);
  assert.match(filmora, /700\+ creative signals/);
  assert.match(filmora, /typed function and tool calls/);
  assert.match(filmora, /OBSERVABILITY \+ GOVERNED RL REFINEMENT/);
  assert.match(filmora, /role="button"/);
  assert.match(filmora, /onKeyDown=\{\(event\) =>/);
  assert.match(mindscape, /mood trend/);
  assert.match(mindscape, /GOVERNED RL REFINEMENT · OFFLINE ONLY/);
  assert.match(mindscape, /OFFLINE RL \+ EVAL/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /overscroll-behavior: contain/);
  assert.match(css, /touch-action: manipulation/);
  assert.match(css, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  assert.match(css, /vxTrendSourceBlur/);
  assert.match(css, /vxTrendPlatformCycle/);
  await access(new URL("../public/yashwant-bhyri-resume.pdf", import.meta.url));
  await access(new URL("../public/trend-media.svg", import.meta.url));
});

test("keeps the two language portals separate and complete", async () => {
  const en = await (await render("/")).text();
  const zh = await (await render("/zh/")).text();
  const cjk = /[一-鿿]/g;

  // The English portal is the existing deployment: the only Chinese on it is
  // the affordance that offers the Chinese portal.
  const enChinese = en.match(/[^<>]{0,60}[一-鿿]+[^<>]{0,60}/g) ?? [];
  for (const context of enChinese) {
    assert.match(
      context,
      /Language \/ 语言|中文/,
      `Unexpected Chinese text bled into the English portal: ${context}`,
    );
  }

  // The Chinese portal is actually translated, not a copy of the English page.
  assert.ok((zh.match(cjk) ?? []).length > 4000, "Chinese portal is under-translated");
  assert.match(zh, /跳至主要内容/);
  assert.match(zh, /目标岗位|定位/);

  // Emphasis weights survive translation: every highlighted phrase must still be
  // a verbatim substring of its annotation, or the three-weight rail goes blank.
  const source = await readFile(new URL("../app/portfolio-v2.tsx", import.meta.url), "utf8");
  const zhDict = await readFile(new URL("../app/i18n-zh.ts", import.meta.url), "utf8");
  const entries = [...zhDict.matchAll(/^\s{2}"((?:[^"\\]|\\.)*)":\s*\n?\s*"((?:[^"\\]|\\.)*)",/gm)];
  const dict = new Map(entries.map((m) => [JSON.parse(`"${m[1]}"`), JSON.parse(`"${m[2]}"`)]));
  const blocks = [
    ...source.matchAll(
      /annotation:\s*\n?\s*"((?:[^"\\]|\\.)*)",\s*\n\s*annotationHighlights:\s*\[([^\]]*)\],(?:\s*\n\s*annotationSoftHighlights:\s*\[([^\]]*)\],)?/g,
    ),
  ];
  assert.ok(blocks.length >= 26, "expected the full set of annotated stages");
  for (const [, rawAnnotation, hard, soft] of blocks) {
    const annotation = JSON.parse(`"${rawAnnotation}"`);
    const translated = dict.get(annotation);
    assert.ok(translated, `Untranslated stage annotation: ${annotation.slice(0, 48)}…`);
    const phrases = [...`${hard} ${soft ?? ""}`.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) =>
      JSON.parse(`"${m[1]}"`),
    );
    for (const phrase of phrases) {
      const zhPhrase = dict.get(phrase);
      assert.ok(zhPhrase, `Untranslated emphasis phrase: ${phrase}`);
      assert.ok(
        translated.includes(zhPhrase),
        `Emphasis phrase "${zhPhrase}" is not a substring of its translated annotation`,
      );
    }
  }
});

test("deep translation never rewrites a foreign key", async () => {
  // A node that points at another node by id keeps that reference in a list.
  // `id` being opaque is not enough — if the list is translated the lookup
  // silently returns undefined and the graphic crashes at render. This is the
  // Filmora tool-graph failure: deps ["brief"] became ["需求"] while the ids
  // stayed English, so node("需求") was undefined and `.start` threw.
  const source = await readFile(new URL("../app/i18n.tsx", import.meta.url), "utf8");
  const block = sourceSlice(source, "const OPAQUE_KEYS", "]);");
  for (const key of ["id", "deps", "kind", "glyph", "file", "type"]) {
    assert.match(block, new RegExp(`"${key}"`), `OPAQUE_KEYS must protect "${key}"`);
  }

  // Every id referenced from a deps list must exist as an id in the same data.
  const filmora = await readFile(new URL("../app/fable/filmora.tsx", import.meta.url), "utf8");
  const dag = sourceSlice(filmora, "const DAG: DagNode[] = [", "\n];");
  const ids = new Set([...dag.matchAll(/\bid:\s*"([^"]+)"/g)].map((m) => m[1]));
  assert.ok(ids.size > 4, "expected the tool-graph nodes");
  for (const m of dag.matchAll(/deps:\s*\[([^\]]*)\]/g)) {
    for (const d of m[1].matchAll(/"([^"]+)"/g)) {
      assert.ok(ids.has(d[1]), `tool-graph dep "${d[1]}" does not match any node id`);
    }
  }
});
