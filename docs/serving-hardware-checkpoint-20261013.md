# Serving-system execution and lifecycle close-ups

October 13, 2026. Main-agent implementation. Preview: `http://localhost:3001/#inference-study` → Part 2 → Explore the serving system → Serving system overview.

## October 23 recovery and final verification

Resumed from the actual October 13 worktree, which had not acquired later implementation changes. The previous port-3001 process was absent; the preview was restarted from this repository. Saved an exact pre-finishing source archive before the final pass. Corrected the older draft-summary transition: accepted draft tokens now connect to the target correction and committed output, rather than an unrelated execution-format diagram. The MoE alternative now explicitly identifies which GPU owns each expert.

Re-ran the 299 selected model/presentation tests, three rendered-HTML tests, TypeScript, scoped ESLint and production build on October 23; all passed. Inspected the refreshed draft bridge, expert placement, pipeline and fusion in the desktop browser. No browser application errors were reported. The earlier live-clock, keyboard/export, reduced-motion and mobile evidence below was collected October 13, not falsely rerun on October 23. The new final archive and its verification manifest are `serving-hardware-verified-20261023.tar.gz` and `.manifest.md` in the existing external backup directory. This checkpoint does not mark the larger portfolio goal complete.

## What changed

The older overview crowded execution format, distribution and reclamation into a small lower diagram. The overview now gives each mechanism its own full-size stage, with the A/B/C/D trace retained along the bottom. These close-ups are separate arithmetic examples, not additional benchmark interventions on that trace.

The sequence is 94 presentation seconds. Existing arrival, admission, interference, locality and draft-verification chapters occupy 0–30 seconds. Fusion occupies 30–43, precision 43–56, placement 56–78, cancellation 78–88 and the retained delivery-criteria view 88–94. One reversible clock drives all positions, values and completion events; it stops at the endpoint. Hidden views, offscreen content and background tabs suspend playback. Reduced motion disables autoplay but preserves chapter selection and inspection.

- **Kernel fusion:** two synchronized paths compute `max(0, x + 0.25)` for four values. The separate-kernel path writes and rereads a temporary vector; the fused path retains the intermediate on-chip. The actual temporary allocation connects to the consequence card. Explicit traffic: 64 → 32 bytes; launches: 2 → 1; output unchanged. Bias traffic is held fixed. No device speedup is inferred.
- **Weight quantization:** inspect any of 16 weights, its signed code and reconstruction error on one number line. INT4 and INT8 controls recompute payload, four-byte scale overhead and the changed first-row dot product. The storage bars connect to the bytes-removed card. INT4 uses 12 bytes total versus the 64-byte source; INT8 uses 20. This demonstrates numerical error, not a task-accuracy result.
- **Parallel execution:** the authored sequence distinguishes full model replicas, an input-dimension tensor partition with a sum returned to both devices, and three pipeline stages. Pipeline request colors persist across stages; nine busy and six empty stage-slots remain visible. Each topology has a settled comparison hold. A separately selected MoE alternative explains top-two routing and weighted expert outputs without relabeling the dense trace as an MoE deployment.
- **Cancellation:** return to the original replica pool. D retains ownership until the safe boundary at presentation time 82.3 seconds. Only D's three pages become free; B's two prefix pages remain. Before/after controls and an exact page-bracket-to-card connector expose the ownership change.

Headers name the mechanisms explicitly. The diagram is width-bounded so the comparison fits the checked desktop viewport. Narrow screens retain a locally scrollable figure, plus “Show mechanism” and “Show comparison” shortcuts. The chapter rail brings its active item into view. Assumptions are collapsed, and JSON exports the actual selected precision/weight/topology, presentation state, original trace and arithmetic fixtures.

## Numerical scope

`serving-hardware-model.ts` is deterministic arithmetic, not a device simulator. Quantization uses a symmetric signed range, ties-to-even rounding, one FP32 scale and ideal packed payload without alignment overhead. Its low-precision dot product is explicitly allowed to differ. Tensor partitioning is one illustrative row, not an entire transformer. Pipeline slots have equal logical duration and do not model communication latency. The MoE branch is an example of expert selection, not a throughput experiment. Cancellation takes effect at a safe iteration boundary, not by interrupting a GPU instruction.

Reference checks: [TensorRT performance guidance](https://docs.nvidia.com/deeplearning/tensorrt/latest/performance/best-practices.html), [quantized types](https://docs.nvidia.com/deeplearning/tensorrt/latest/inference-library/work-with-quantized-types.html), and [PyTorch distributed collectives](https://docs.pytorch.org/docs/2.14/distributed.html#torch.distributed.all_reduce). These informed mechanism semantics only. No external benchmark numbers were borrowed or attributed to personal runs.

## Verification

- Nine new arithmetic/presentation tests cover fusion identity and traffic; positive/negative rounding ties; payload and scale accounting; reconstruction error; exact tensor sum; pipeline order/bubbles; reversible bounded progress; manual topology inspection.
- The overview tests were updated for ten chapters, 94 seconds and the new cancellation boundary. Both routing branches conserve reservations at every 100 ms sample and event boundary.
- 299 selected model/presentation regression tests and three rendered-HTML checks passed. TypeScript, scoped ESLint and the production build passed during this implementation pass.
- Browser: 1440×1050 desktop, all new scenes inspected; the live 30–94 second segment traversed fusion, precision, all three authored topologies, cancellation and outcome, then stopped exactly at 94000 ms. Pipeline completion advanced 0 → 1 → 2 → 3 and held before leaving.
- Browser: keyboard-selected weight 2,2 under INT8 exported `selectedWeight: 5`, 20 total bytes and the displayed 55500 ms cursor. Reduced motion settled at the endpoint, disabled play, and still allowed a completed fusion comparison at 42900 ms. Switching away from the overview froze its exact cursor. Browser error log was empty at inspection.
- Mobile: 390×844, document width 390; diagram width 1000 remains local inside a 358-pixel viewport. The comparison shortcut pans to 642 px and exposes the whole consequence card without document overflow.

The earlier arrival-to-draft portion was not replayed end-to-end in this pass; it retains the prior event model. Tests prove arithmetic/state behavior, not user acceptance, physical performance or final visual quality of the entire inference laboratory.

## Recovery and next work

Pre-edit recovery archive: `/Users/yash/Portfolio/backups/portfolio-elite-bilingual-2026-09-21/cache-routing-checkpoint-20261013.tar.gz`, SHA-256 `b6100486aeea26a91c876952d999d766162cb58221b9e354282618a26e1e2ab0`. Restore into a separate comparison directory, never over the dirty checkout. The final hardware checkpoint manifest records this pass's source and screenshot archive.

Next: finish the **whole-system entry, transitions and delivery-criteria conclusion**, connecting the accepted investigations without conflating their independent fixtures. The first five overview scenes and the final qualifying-answer diagram remain the older, denser presentation; they are not accepted as finished merely because the late close-ups improved. Revisit whole-inference navigation and the latest human feedback before moving to post-training. Preserve the accepted Part 1 films, token-continuity inspector, draft-verification film and cache-routing investigation. No Sol delegation. The broader goal remains active.
