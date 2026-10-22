# Compute walkthroughs

Two complete chapters extend the English portfolio with dedicated architecture pages, eight operational scenes each, and a conclusion. Project descriptions and the three post-training result figures come from the user's supplied project summaries.

## Implementation

- `app/compute-projects.ts`: descriptions, stage narratives, technologies, input/operation/output contracts, and conclusions.
- `app/compute-visuals.tsx`: independent replay clock, accessible story beats/options, full-size focus dialog, architecture navigation, and preview lifecycle.
- `app/compute/architecture-films.tsx`: distinct serving-fabric and learning/search introduction films, plus bespoke homepage miniatures.
- `app/compute/inference-scenes.tsx`, `training-scenes.tsx`: sixteen mechanism-specific SVG films.
- `app/compute/simulation.ts`: pure tested cache ownership, reward normalization, policy direction, search budget, and trajectory functions.
- `app/compute/primitives.tsx`: shared visual vocabulary (tokens, flights, matrix cells, labels), not shared scene templates.
- `app/compute-scenes.css`: chapter colors, diagram primitives, responsive index, keyboard/touch controls, and narrow-screen inspection.
- `app/portfolio-v2.tsx`: existing flagship shell integration, navigation, hero deck, and expanded project index.

## Content boundaries

Inference graphics explain mechanisms using illustrative sequences, memory pages, and timelines. They do not imply measured throughput, measured latency, a particular GPU count in the actual project, or live infrastructure. Quantization ratios compare theoretical weight bytes at equal parameter counts, excluding scales, KV state, and workspace.

Training graphics distinguish GRPO group rewards from DPO preference pairs. LoRA freezes the base path and trains a low-rank update. Test-time search changes inference work, not model weights. Search and reward examples are schematic. The supplied +27%, +31%, and +46% figures are now confined to an author-reported/unverified claim register, not plotted as evaluation evidence. No unprovided baseline, interval, evaluation dataset, or GPU cost has been fabricated. See `compute-scientific-program.md` for the presentation-first measurement contracts and reference research.

## Motion and interaction

Scene motion has a causal storyboard in `compute-motion-storyboard.md`. Chapter selection and operation playback are independent: selecting a stage holds the tour while the operation continues. Options restart a local replay; beat shortcuts and scrubbing hold an exact time. Focus opens a native modal dialog with the same state and controls, dismissible with Escape. Introduction films do not force a page jump.

Only intersecting visuals animate; hidden documents suspend their clocks. React/SVG updates are bounded at 30 fps and frozen matrices are memoized. Reduced motion displays a complete static state; options, timeline inspection, and beat shortcuts remain available. The original three projects' graphics are unchanged.

## Mechanism references

- [vLLM documentation](https://docs.vllm.ai/en/v0.6.5/) lists continuous batching, PagedAttention, speculative decoding, and parallel serving support.
- [Hugging Face TRL GRPO trainer](https://github.com/huggingface/trl/blob/main/docs/source/grpo_trainer.md) documents grouped rollouts, reward functions, and relative policy optimization.
- [Hugging Face TRL DPO trainer](https://github.com/huggingface/trl/blob/main/docs/source/dpo_trainer.md) documents chosen/rejected preference pairs and the DPO objective.

## Verification scope

Production build, strict TypeScript, targeted ESLint, and server-rendering checks cover the new chapters. Browser verification covers all sixteen scenes, geometry, simulation options, pause/replay/inspection, desktop/tablet/mobile layouts, and reduced motion. The pre-existing source-structure test expects `const ROLES` in `profile-section.tsx`; the user's earlier i18n work moved that data, independently of these chapter changes.
