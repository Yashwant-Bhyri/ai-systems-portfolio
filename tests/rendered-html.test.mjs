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

test("server-renders the recruiter-first portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Yashwant Bhyri — AI Agent/);
  assert.match(html, /Hi—welcome to my portfolio/);
  assert.match(html, /fourth(?:-|‑)year Computer Science &amp; Engineering student/);
  assert.match(html, /Explore my projects/);
  assert.match(html, /AI-native technical interviewing platform/);
  assert.match(html, /Multimodal AI video-production runtime/);
  assert.match(html, /Multimodal clinical decision-support architecture/);
  assert.match(html, /Decision support for clinician review—not autonomous diagnosis/);
  assert.match(html, /250\+ completed interviews/);
  assert.match(html, /Start the real interview/);
  assert.match(html, /href="\/yashwant-bhyri-resume\.pdf"/);
});

test("removes the rejected imitation Antigravity walkthrough route", async () => {
  const response = await render("/antigravity-experience");
  assert.equal(response.status, 404);
});

test("keeps assets, autoplay mechanics, operational graphics, and claim boundaries in source", async () => {
  const [portfolio, visuals, css] = await Promise.all([
    readFile(new URL("../app/portfolio-v2.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/portfolio-visuals.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/portfolio-v2.css", import.meta.url), "utf8"),
  ]);

  assert.match(portfolio, /IntersectionObserver/);
  assert.match(portfolio, /553–668 ms recorded local process-turn smoke/);
  assert.match(portfolio, /Pre-generated \/ cached response audio/);
  assert.match(portfolio, /Decision support—not autonomous diagnosis/);
  assert.match(portfolio, /250\+ completed interviews/);
  assert.match(portfolio, /exactly 1–2 terms use the bright state|slot === 1 \|\| slot === 6/);
  assert.match(portfolio, /INPUT/);
  assert.match(portfolio, /OPERATION/);
  assert.match(portfolio, /OUTPUT/);
  assert.match(portfolio, /Flask/);
  assert.match(portfolio, /DECISION-SUPPORT ARCHITECTURE · PROTOTYPE/);
  assert.match(portfolio, /handoff && controller\.complete/);
  assert.doesNotMatch(portfolio, /98 ms|98% STT|92% weakness/);
  assert.match(visuals, /FICTIONAL REPLAY/);
  assert.match(visuals, /trend-media\.svg/);
  assert.match(visuals, /trend-skill\.md/);
  assert.match(visuals, /12,751\+ pairs/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /vxTrendSourceBlur/);
  assert.match(css, /vxTrendPlatformCycle/);
  await access(new URL("../public/yashwant-bhyri-resume.pdf", import.meta.url));
  await access(new URL("../public/trend-media.svg", import.meta.url));
});
