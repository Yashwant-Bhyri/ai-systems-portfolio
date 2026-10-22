# Visual reference decisions: Brain Scan, DeepInfer and QwenGyre

Research and direction record, October 23, 2026. These are proposed adaptations, not newly implemented scenes or benchmark results.

## User intent and correction

The target is presentation: operational graphics, meaningful motion, readable comparisons and linked inspection. External work should raise the existing standard, not replace the portfolio's identity or send development into another prolonged reference hunt.

The user clarified that **DeepSeek DeepInfer**, not the DeepInfra hosting company, was the intended serving-stack reference. DeepInfra research is superseded. The user also explicitly stopped further NetSphere source hunting: use the supplied local clip and develop original visuals from the useful ideas.

The saved baseline remains `serving-continuity-delivery-verified-20261023.tar.gz` in `/Users/yash/Portfolio/backups/portfolio-elite-bilingual-2026-09-21/`. This research pass does not change application code, timing, fixtures or results. Inference integration and user acceptance remain ahead of the broader post-training pass. No Sol delegation.

## What the references actually contribute

| Reference | Keep | Do not import |
| --- | --- | --- |
| Local Brain Scan clip | One signal revealed through aligned heatmap, relief and output; persistent position; a synchronized advancing boundary | Its branding, unsupported activation data, or a decorative mountain added to every component |
| DeepInfer | Explicit serving tradeoffs, CPU/device overlap, conditional verification, distinct request and KV-transfer paths | Vendor benchmark values, an assumption that the whole online service is released, or another static architecture map |
| QwenGyre | Persistent device identity while its role changes; traceable branching work; visible coordination costs | The paper's results, an automatic new chapter, or relabeling our FIFO scheduler as an elastic RL system |

### Brain Scan: observed directly in the local clip

Source: `/Users/yash/Downloads/Aq6uIWa6KZMJJy6H.mp4` (approximately 17 seconds). Multiple frames were inspected. The heatmap maps words/tokens across columns and layers down rows. A relief view raises the same field; a bottom answer ribbon advances with it. Disagreements are marked on the corresponding output positions. The camera stays sufficiently stable to compare locations.

The central lesson is identity across representations. The surface gives a spatial impression, the flat view makes comparison precise, and the answer makes the internal difference concrete. Their synchronization is more valuable than the glow.

The clip labels a teacher-forced model comparison. That does not by itself establish free-running reasoning quality. We must not fabricate internal activations to reproduce its appearance. A mathematical weight example can show arithmetic change; it cannot stand in for a model-quality evaluation.

Search is closed at the user's request. The original route and two straightforward variants returned 404; the exact-route Wayback availability response had no snapshot. A broader archive lookup timed out. The current sitemap has no Brain Scan entry. Public creator repositories were found, including [media](https://github.com/killy-netsphere/media), but the exact visualization source and reuse permission were not verified. This is not a claim that no copy exists anywhere. No source or assets were copied into the app.

### DeepInfer: corrected primary reference

The [official README](https://github.com/deepseek-ai/DeepInfer) describes an offline inference release, including asynchronous scheduling and confidence-scheduled verification. It explicitly excludes several complete-service components. The [deployment Q&A](https://github.com/deepseek-ai/DeepInfer/blob/main/doc/inference_deployment_qa.md) explains the broader system and distinguishes request flow from KV movement. CPU scheduling can overlap device work; verification effort can vary rather than treating every draft position equally. These are useful mechanisms for original causal scenes, not evidence that our portfolio implements this engine.

The [decode figure](https://github.com/deepseek-ai/DeepInfer/blob/main/doc/images/decode_pareto.png) puts per-user token speed against per-GPU output throughput and labels operating points by concurrency. The [plotting source](https://github.com/deepseek-ai/DeepInfer/blob/main/examples/sweep/plot_pareto.py) makes an important qualification visible: its fixed-draft decode conversion uses a supplied acceptance assumption. Its prefill x-axis is average processing-window latency, not end-to-end TTFT. Use the comparison design, not its numeric values or interchangeable latency labels.

The architecture and decode chart were visually inspected in a browser. The architecture is useful for separating types of movement; its static boxes are not our presentation target. Source code is Apache-2.0 per the repository. Any later direct reuse still needs the relevant file's notices and license checked. Original SVGs avoid the need to republish its figures.

### QwenGyre: a later post-training infrastructure lens

The [v2 paper](https://arxiv.org/html/2609.33848v2) describes elastic rollout/training allocation and processing branching execution histories into bounded training samples. Figure 4's [execution timeline](https://arxiv.org/html/2609.33848v2/execution.svg) was visually inspected: device rows persist through role changes, parameter transfer, reduction and publication. This belongs to RL infrastructure, not ordinary serving admission. The paper's illustration and concepts are references; no official reusable implementation was verified during this pass.

## Selected first adaptation: CPU/GPU scheduling overlap

Working heading: **Overlap scheduling with execution**.

This is a bounded addition to the serving-runtime explanation, not a restart of the accepted request queue or efficient-execution film. It answers a different question: why can a GPU wait even when requests are ready? The current generic execution-rate comparison does not teach that mechanism.

### Original scene direction

Use two synchronized horizontal lanes, baseline and overlapped. Each contains a CPU track, a GPU track and an output ribbon. Batch identities persist across tracks. Keep actual GPU-operation lengths identical between conditions. Draw waiting as empty time, not as a slower GPU rectangle.

| Presentation beat | What moves | What the visitor should see |
| --- | --- | --- |
| Establish, 0–5 s | One batch passes CPU preparation, GPU execution, then output | The complete dependency chain before any optimization |
| Expose, 5–10 s | The next batch waits while the GPU is ready | A highlighted gap with a leader originating at its exact endpoints |
| Intervene, 10–17 s | Preparation for the next batch shifts underneath current GPU work | Work overlaps; it does not vanish or shrink |
| Compare, 17–23 s | The same output count reaches its endpoint earlier in the lower lane | One shared finish-time bracket connects both tracks to the consequence |
| Inspect, 23–28 s | Output, device interval and accounting settle together | A replayable result with the finite pipeline's fill/drain still visible |

Timing above is presentation direction, not measured service time. Derive the actual event schedule first, including dependencies, available CPU information, launch delay, warm-up and drain. Use the existing two-clock convention; do not interpolate counters independently of events.

Borrow Brain Scan's linked selection: selecting an output token selects its source batch, GPU interval and CPU preparation. A single guide connects the views. No popover containing a paragraph is required. Hover previews, click or keyboard selection pins, Escape releases; touch and reduced-motion views retain the same relationship.

The consequence must distinguish elapsed completion time, device busy time and allocated device time. Hiding idle gaps can improve elapsed delivery while busy computation remains unchanged. Do not credit a GPU busy-work reduction merely because the finish marker moves left. Do not roll this fixture into the existing 96-task totals without an explicit model change and tests.

## Subsequent adaptations, each with its own narrative

### Verification: spend effort where it helps

Preserve our accepted draft/verify scene. An optional advanced lens could show several request ribbons, a visible shared verification allowance, uncertain later positions and the committed output below. Move the allowance between complete candidate prefixes rather than picking disconnected tokens. The learning moment is work spent versus useful output, including a case that does not improve. Do not turn predicted confidence into a guarantee or substitute this for target verification. Technical reference: DeepInfer README and deployment Q&A above.

### Serving frontier: make the operating point visible

Use two aligned views of one selected operating point: a small set of live answer streams and a throughput/interactivity plot. Increase concurrency in discrete steps; show more active streams while each stream's cadence may slow. Trace only evaluated points, retain the selected load, and hold both the capacity gain and the per-user tradeoff. A latency constraint can reveal the acceptable region. Avoid a smooth decorative exponential and do not equate an offline frontier with online goodput.

### Precision: connect a changed value to its consequence

The existing scene already has selectable 16-value weights, rounding and storage accounting. Do not append another generic matrix. A useful follow-up would connect one selected weight to its reconstructed value, signed error, multiplication contribution and output difference. A flat error field is sufficient for this small fixture. A relief surface earns its place only with a meaningful second data dimension and legible selection; it must not suggest we recorded layer activations.

### Post-training: follow a branch into the update

When the post-training milestone begins, carry one task through attempt, tool result, branch selection, eligible training tokens and update. Keep repeated context visible even when it is excluded from the training target. Selection should explain why a token contributes, not merely light a tree. Pair this with an explicit before/after behavior example, without implying that a selected parameter alone explains the behavior. QwenGyre informs the infrastructure perspective; the layout and teaching sequence remain our own.

## Acceptance gates for any implementation

- A viewer can point to the changed object and its consequence without reading surrounding paragraphs.
- The operational view, analytical view and selected output share identity and one event model.
- The baseline remains visible at the decisive moment; unrelated geometry becomes quieter, not illegible.
- The gain connector starts at the actual interval or value difference, never an arbitrary icon.
- Every extra dimension has named meaning; depth and glow are not substitutes for data.
- No auto-rotation, unearned camera reset, fake smooth curve, invented speedup or copied research result.
- Playback, settled inspection, reverse seeking, keyboard, reduced motion and narrow-screen navigation all explain the same mechanism.
- Preserve Geist, the existing semantic colors and compact viewport. Do not import the references' site layouts.

Impeccable's identity-preserving brand and purposeful-motion guidance was used to filter the references. This record is an implementation brief, not a claim that these enhancements are already shipped.
