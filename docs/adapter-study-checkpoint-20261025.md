# SFT / LoRA: from parameters to outputs

## Scope and hypothesis

The previous chapter switched between a matrix animation and a separate answer example while an unrelated full-cohort result remained prominent. Its twelve-second clock compressed the mechanism and its consequence. The replacement gives **SFT + LoRA** its own spatial and temporal argument, without replacing the accepted inference work or copying its two-machine layout.

The hypothesis is: the visitor should first understand what changes in a low-rank update, then follow one output all the way from its contributing row to its remaining error. Only after that comparison should a demonstrated answer explain what language supervision supplies. A small mathematical example is not evidence that a particular real model learned a particular behavior.

## Delivered sequence

The 32-second film has five inspectable moments:

1. Frozen W, initialized A, zero B. There is no adapter contribution.
2. The first update changes B. The first A gradient is zero because B started at zero.
3. Three more updates change both factors. The rank-two structure and the frozen base remain visible.
4. Six outputs are compared on common coordinates. Selecting an output links the W/B/adapted row, its two rank-channel contributions, its output location and its remaining error. The target is not silently replaced by the current output.
5. A separate answer demonstration includes the shipping operation omitted by a shortcut. Prompt context and supervised answer targets have distinct roles; a token-loss expression connects the demonstrated prefix to language SFT. This is offline training, not a live request changing weights.

Real optimizer positions hold at 0, 1, 2, 3 and 4. Between them, factors are interpolated for presentation and products, outputs, errors and gradients are recomputed from those factors. The loss trace and selected output use the same presentation clock. No independent numeric tween or invented activation field is introduced.

Desktop composition retains its dimensions during the mechanism/example handoff. Narrow layouts keep a readable horizontal diagram with explicit Weights / Output errors controls, while the language example uses a content-sized single column. The active mobile view determines height, avoiding the empty space produced by forcing desktop geometry onto a phone. The existing project font tokens and semantic colors remain; a missing `--font-geist` reference was corrected to the actual sans token.

Hover/focus previews an output; native-button activation selects it and pauses the shared clock. Seeking is reversible. Returning from Explore preserves the selection and cursor. Reduced motion provides a settled entry, manual moments and an immediate accessible lens change even at the transition boundary. The shared chapter clock advances into GRPO after the final hold. Undo from that chapter keeps its Restore control visible.

The extended viewport/motion-preference test also exposed a shared playback defect: one IntersectionObserver callback contained an offscreen observation followed by an onscreen observation for the same target. The hook read only the first and left the visible scene stopped. It now consumes the latest timestamp (later entry wins a tie), ignores empty batches and discards callbacks after cleanup. Three regression tests cover both directions, tied timestamps and stale ordering. Playback intent, viewport state and reduced-motion status are inspectable in the story's diagnostic data attributes. Timing, workloads and automatic chapter durations are unchanged by this fix.

## Integrity and records

The mathematical example is the existing deterministic 6 × 6 / rank-two calculation, not a new model result. Its input, target, initial parameters, learning rate and four optimizer steps are unchanged. The new export includes the selected output, presentation time, fractional optimizer position, exact current factors/gradients/output, full optimizer snapshots and explicit limitations. It does not export the 96-task cohort as if that cohort came from this calculation.

The former full-cohort sidebar is absent from this chapter's main stage. Separate cohort records remain available through an explicitly named disclosure. Broader project plots and evidence status are unchanged. No real Qwen weights, learned activations, new benchmark measurements or claimed SFT gains are added.

## Verification

- Six new model tests cover directed holds, bounds, all six output decompositions, frozen W, first-step gradients, nonzero residual errors, reverse reconstruction, record consistency and fractional-frame finite-difference gradients.
- `scripts/verify-adapter-browser.mjs <owned-CDP-port> <absolute-output-directory>` verifies arithmetic states, native keyboard selection and pointer preview, reverse seeking, the stable desktop example, pause/resume and pause-on-disclosure, return-state preservation, the actual export handler, next-chapter/undo handoff, reduced motion, mobile containment/panning and absence of uncaught runtime errors. It also records SVG-label contrast and paired active/paused frame samples.
- Seven captures cover baseline, first update, final error comparison, a negative output coordinate, answer targets and both mobile views. Screenshots were inspected and used to fix a mobile overflow and excessive reserved whitespace.
- Scoped accessibility checks cover both lenses. The invalid labeled SVG groups were fixed. Final example audit: zero violations and no incomplete rules. Final mathematical view: zero violations; SVG contrast requires manual review because the audit cannot determine graphical backgrounds. Label colors remain fully opaque; only unrelated geometry is quieted.
- TypeScript, scoped ESLint and production build pass. Full suite: **365 passing / 366 tests**. The unrelated pre-existing Profile-source assertion expecting `const ROLES` is not changed or bypassed. Profile and its test retain their previously recorded SHA-256 values. All twelve whole-inference navigation groups pass, with three additional screenshots and the final verification JSON in the archive evidence.

At the settled mathematical state, computed SVG label colors have contrast ratios of at least 9.1:1 against the actual stage background. The local browser delivered approximately 33.33 ms requestAnimationFrame intervals in both the active and paused samples, with the same 33.4 ms p95. This establishes matching observed cadence for this environment, not 60 fps or a cross-device performance guarantee. The recorded active sample asserts a moving service cursor; the formerly stalled state cannot pass as a smooth animation.

Impeccable's identity-preserving and causal-motion guidance shaped the held states, content-sized mobile view and exact diagram-to-error connector. The React review keeps the new scene derived from one clock, with no new animation library or independent loop. The Brain Scan reference informs linked identity across representations, not copied imagery or fabricated activations.

## Recovery and next work

Pre-edit checkpoint: `/Users/yash/Portfolio/backups/portfolio-elite-bilingual-2026-09-21/composition-playback-verified-20261024.tar.gz`, SHA-256 `3315c7d613c2a8d04d0d5408fd9cbedfccbde6eff5e334f080af218251726747`.

The new `adapter-study-verified-20261025.tar.gz` and its sibling manifest preserve source and browser/regression evidence. Restore into a separate comparison directory, never over the dirty checkout. No deployment, Git stage/reset/commit, new chat, delegation or automation change.

This is one post-training scene, not completion of the laboratory or the overall goal. The starting policy, GRPO, efficiency-aware update, test-time scaling and figure tour still need their own reviews. Next, inspect the verifier → relative advantage → policy update scene and its actual behavioral consequence. Preserve this chapter's reasoning standard, not its exact template. Integrated inference still awaits user visual assessment; the accepted operational scenes are preserved.
