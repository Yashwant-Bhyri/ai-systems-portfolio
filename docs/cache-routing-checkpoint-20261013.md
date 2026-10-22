# KV capacity and cache-aware routing checkpoint

October 13, 2026. Implementation began October 9; final browser and source verification resumed October 13. Main-agent work, no delegation. Preview: `http://localhost:3001/#inference-study` → Part 2 → Explore the serving system → KV capacity & routing.

## The component's argument

A ready prefix avoids repeated input processing, but it does not guarantee the earliest first token. The request also needs enough memory for its new suffix and answer. Compare two alternative placements of **Request C**, not two simultaneous executions: replica A can retain the prefix while request R holds other pages; replica B has free memory but must process the entire input.

The visitor first sees retained state and missing capacity, then release/admission, actual input progress, the first answer token and the exact delivery-time difference. Only after that causal example does the figure sweep the memory-release delay. The warm placement wins, ties and loses in the same coordinates. Final reclamation closes the request lifecycle. This extends the accepted prefix lesson without replacing it or adding fictional GPU results to Part 1.

## Directed sequence

| Film time | Visible event or conclusion |
| --- | --- |
| 0–5 s | Identify the four reusable prefix pages and the full-input alternative. |
| 5–10 s | Expose the admission gate: new pages needed versus empty slots. |
| 10–17 s | R releases its pages; C is admitted and processes only uncached input. Both routes share one elapsed service clock. |
| 17–19.5 s | Hold the earlier first-token event. The other route is still processing input. |
| 19.5–25 s | Reach the later first token and hold the exact TTFT difference. The interval connects directly to the consequence card. |
| 25–30 s | Finish both answers and release their private pages. |
| 30–41.5 s | A separately labeled sensitivity figure varies release delay, holds the 40 ms crossover and 80 ms cold-route win, then restores the selected delay. |
| 41.5–44 s | Return to the original completed request: no active C references, reusable prefixes retained, private capacity free. Stop. |

Seven shortcuts, a reversible scrubber, play/pause and direct page inspection are available. The plot supports mouse/pen dragging and keyboard arrows/Home/End; touch retains native diagram panning and uses the release slider. Page inspection pauses the same clock; Escape returns focus to the inspected page. The selected trace does not mutate when the authored sensitivity sweep explores another delay.

## Numerical and evidence boundary

The fixture is a bounded illustrative event model, not a physical benchmark or a complete serving runtime. Each replica has twelve pages with sixteen token slots per page. C has four prefix pages, two suffix pages and two pages reserved up front for a 32-token output. Declared prefill cost is 10 ms per uncached page; each output token costs 2 ms. R holds four or eight pages until a selected 0–100 ms release delay.

| Ready-prefix case, R holds 8 pages | A first token | B first token | Consequence |
| --- | ---: | ---: | --- |
| R releases at 20 ms | 42 ms | 62 ms | Reuse avoids 40 ms of prefill but incurs 20 ms waiting; A delivers 20 ms earlier. |
| R releases at 40 ms | 62 ms | 62 ms | Equal first-token time despite less input work on A. |
| R releases at 80 ms | 102 ms | 62 ms | Waiting exceeds the input-work saving; B delivers 40 ms earlier. |

With only four resident pages, A can admit immediately and deliver at 22 ms. With an evicted prefix and sufficient capacity, both replicas process the full input and deliver at 62 ms. These counterexamples alter the labels, gate, ownership, graph and card, not merely a badge. Zero differences have no gain connector.

Allocation preserves live R pages, references ready prefix pages in place and can produce a noncontiguous block table. Allocated-but-uncomputed pages are distinct from ready KV. C completion releases only its private pages; it does not release R's pages. Output reservation is conservative, not an implementation of a dynamic production allocator. Evicted/ready is a selected initial condition, not an eviction algorithm.

Excluded: earlier cold-prefix work, unrelated R execution, network and KV transfer, uncertain routing estimates, preemption, memory contention, batch scheduling, measured device rates and end-to-end goodput. TTFT is neither answer completion time nor GPU work. The sensitivity sweep and the three Part 2 investigations are not one shared production simulation. The JSON records `selectedStudy`, `displayedStudy` and the original event `frame` explicitly.

Primary mechanism references: [vLLM prefix-cache design](https://docs.vllm.ai/en/latest/design/prefix_caching/) and [data-parallel deployment](https://docs.vllm.ai/en/latest/serving/data_parallel_deployment/). No published benchmark values were borrowed or attributed to personal runs.

## Verification record

The user story is local: navigation/control → pure event model → operational SVG and linked consequence → exported record. No API, credentials or external data service is required.

- 26 new deterministic tests cover twenty configurations, half-millisecond page conservation, noncontiguous allocation, R/C ownership, KV readiness, output-page readiness, all delivery/completion events, no-hit/free-capacity cases, crossover, reverse seeking and held film moments. These plus the selected existing regression suite total **290 tests**. Three relevant server-render checks are separate.
- TypeScript, scoped ESLint, production build and whitespace checks cover the final source. The existing Node `module.register()` deprecation is a non-failing build warning.
- Desktop review: full 44-second playback, all seven beats, explicit crossover/cold-win holds, fixed 548 px card height, exact endpoint and replay restart. Hidden-view switching froze the cursor without resetting it. These playback observations were recorded October 9 on the same clock implementation; the October 13 changes were copy, focus hierarchy and mobile/touch refinements.
- Mouse dragging selected an 80 ms delay and produced A 102/B 62/Δ 40 ms; keyboard Home/End/arrows and the zero-difference state were checked. Cold-prefix page inspection correctly reported newly computed KV rather than reused KV; Escape restored the originating SVG control.
- Export review at film time 39 s preserved selected release 20 ms, displayed release 80 ms, original service time 134 ms and displayed delta −40 ms. The original route retained its 42 ms first-token event.
- At 390×844 the document stayed 390 px wide. The 760 px diagram scrolls inside a 356 px region; the consequence card is 316 px wide. The title now reserves space for the fixed contact control. Touch panning is not intercepted by mouse-style plot scrubbing. Reduced motion disables automatic play and keeps manual shortcuts and inspection.

This is scoped component verification, not whole-site accessibility certification or user acceptance of the entire laboratory. Browser automation errors from querying a not-yet-mounted lazy component are not application failures; only subsequently observed states count as evidence.

## Files, recovery and next scope

New: `app/compute/cache-routing-model.ts`, `cache-routing.tsx`, `cache-routing.css`, `tests/cache-routing.test.mjs`. Integration: `serving-under-load.tsx` and `serving-load-overview.tsx`. The accepted scheduling film, token-continuity inspector, draft investigation and Part 1 machinery are preserved.

Pre-edit source archive: `/Users/yash/Portfolio/backups/portfolio-elite-bilingual-2026-09-21/pre-cache-routing-20261009.tar.gz`, SHA-256 `ec3b94be3be3f113f31cc50dce4689f35bb8ac7e7e0d896c7ed9298e18d638fc`. Final archive and screenshot hashes are in the sibling `cache-routing-checkpoint-20261013.manifest.md`. Archives are scoped source checkpoints, not standalone deployments; restore into a separate comparison directory, never over the dirty worktree. No staging or commits.

**Next: finish Part 2's remaining whole-system presentation**, especially execution/precision, device placement and lifecycle, using short operational scenes rather than ten equally deep films. Connect the now-inspectable scheduling, locality and speculation investigations without pretending their independent fixtures are one coupled benchmark. A numerical goodput finale still requires its declared event/quality/accounting contract. Preserve completed components; do not restart Execute efficiently or delegate to Sol. Whole-inference acceptance and the later post-training work remain open.
