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
  assert.match(html, /href="\/yashwant-bhyri-resume\.pdf"/);
});

test("removes the rejected imitation Antigravity walkthrough route", async () => {
  const response = await render("/antigravity-experience");
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

  const roleSource = sourceSlice(profile, "const ROLES", "const SKILLS");
  const skillSource = sourceSlice(profile, "const SKILLS", "type CapabilityDomain");
  const evidenceSource = sourceSlice(profile, "const EVIDENCE", "const ROLE_ADVANCE_MS");
  const antigravitySource = sourceSlice(portfolio, "const ANTIGRAVITY_STEPS", "const FILMORA_STEPS");
  const mindscapeSource = sourceSlice(portfolio, "const MINDSCAPE_STEPS", "const RESEARCH");

  assert.match(portfolio, /IntersectionObserver/);
  assert.match(portfolio, /className="vx-hero-highlight"/);
  assert.match(portfolio, /src="\/brands\/cuhk\.png"/);
  assert.match(portfolio, /CUHK · QS World #18/);
  assert.equal(countObjectIds(roleSource), 3);
  assert.equal(countInlineObjectIds(skillSource), 20);
  assert.equal(countObjectIds(evidenceSource), 9);
  assert.match(profile, /vx-role-lens-layout/);
  assert.match(profile, /vx-capability-domains/);
  assert.match(profile, /Capability system · 20 production skills/);
  assert.match(profile, /vx-applied-evidence/);
  assert.match(profile, /What I have actually built/);
  assert.doesNotMatch(profile, /vx-role-to-skill-links/);
  assert.doesNotMatch(profile, /vx-skill-to-experience-links/);
  assert.match(portfolio, /useChapterHandoff/);
  assert.match(portfolio, /vx-case-overview-page/);
  assert.match(portfolio, /vx-case-microscope-page/);
  assert.match(portfolio, /scrollIntoView\(\{ behavior: "smooth", block: "start" \}\)/);
  assert.match(portfolio, /vx-conclusion-focus/);
  assert.match(portfolio, /vx-contribution-tile/);
  assert.match(portfolio, /vx-stage-annotation/);
  assert.match(portfolio, /vx-research-grid/);
  assert.equal(countStoryLabels(antigravitySource), 9);
  assert.equal(countStoryLabels(mindscapeSource), 8);
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
  assert.match(portfolio, /Real-time AI-Native Interviewing Platform/);
  assert.match(portfolio, /End-to-End Multimodal AI Production System/);
  assert.match(portfolio, /Medical AI Clinician-Support Product/);
  assert.match(portfolio, /Open-Source, Research & R&D Experience/);
  assert.match(portfolio, /Pre-generated \/ cached response audio/);
  assert.match(portfolio, /Decision support—not autonomous diagnosis/);
  assert.match(portfolio, /Start the real interview/);
  assert.match(portfolio, /250\+ completed interviews/);
  assert.match(portfolio, /built with a multi-agent orchestration and decision engine/);
  assert.match(portfolio, /integrated into Filmora Enterprise/);
  assert.match(portfolio, /reinforcement-learning observability and refinement systems/);
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
  assert.match(portfolio, /INT8-quantized Depth Anything V2 Small/);
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
