# The starting point 1440x900

## t=3s stage 681/681 doc 1440/1440 secH 900 minFont 8.0
strong.: Results laboratory
h2.: What did the model learn?
strong.: The experiment
span.: 01
strong.: The starting point
span.: 02
span.: 03
span.: 04
span.: 05
span.: 06
strong.: Capability map
strong.: Compute curves
strong.: Regression audit
small.: 6 chapters · ~105 seconds
button.: 1× thought
button.: 2× thought
button.: 4× thought
button.: 8× thought
span.ls-eyebrow: 01 / BASE
h3.: A useful answer needs a useful reasoning path.
span.: HOW THE POLICY CHANGES
small.: Inspectable teaching model
button.: Mathematical mechanism
button.: Request in practice
text.ls-overline: THE PRETRAINED WEIGHTS · BEFORE ADAPTATION
text.ls-label: W · frozen
text.ls-small: 36 fixed weights
text.ls-label: B · 6 × 2
text.ls-label: A · 2 × 6
text.ls-small: B = 0 · no adapter contribution
text.ls-label: W + ΔW
text.ls-small: Same starting output
text.ls-small: y = W x
text.ls-label: Adapter update is zero.
text.ls-small: Teaching loss: ½ ‖(W + BA)x − target‖²
text.ls-small: 0 → 4 updates · same example
span.: Frozen checkpoint
small.: 4.1 / 10s
strong.: A shortcut skips the edge case.
span.: FULL-COHORT RESULT
small.: Same 96 tasks
span.: task accuracy
b.: 0.0 pp
span.: from starting point
small.: previous → current
small.: GPU-s
text.ls-small: 50
text.ls-small: 100
text.ls-small: Task accuracy % ↑
text.ls-small: 15
text.ls-small: 30
text.ls-small: GPU-s / task →
span.: PAIRED OUTCOMES
small.: +0 gained · −0 lost
text.ls-small: + newly correct
text.ls-small: × negative flip
button.ls-play: Ⅱ Pause story
button.: ↺ Replay

## t=10s stage 681/681 doc 1440/1440 secH 900 minFont 9.8
strong.: Results laboratory
h2.: What did the model learn?
strong.: The experiment
span.: 01
strong.: The starting point
span.: 02
strong.: SFT + LoRA
span.: 03
span.: 04
span.: 05
span.: 06
strong.: Capability map
strong.: Compute curves
strong.: Regression audit
small.: 6 chapters · ~105 seconds
button.: 1× thought
button.: 2× thought
button.: 4× thought
button.: 8× thought
span.ls-eyebrow: 02 / SFT
h3.: Good demonstrations make good paths easier to find.
span.: Trace output
small.: Matrix row → adapter contribution → error
text.ar-section: Frozen base
text.ar-section: Trainable adapter
text.ar-section: Same six output coordinates
text.ar-label: W · 6 × 6
text.ar-small: 36 weights frozen
text.ar-label: B · 6 × 2
text.ar-label: A · 2 × 6
text.ar-small: A initialized
text.ar-small: 24 trainable values · rank ≤ 2
text.ar-label: W + BA
text.ar-small: Base + learned change
text.: Base
text.: Adapted
text.: Target
text.ar-small: -0.5
text.ar-small: 0.5
text.ar-small: y1
text.ar-small: y2
text.ar-small: y3
text.ar-small: y4
text.ar-small: y5
text.ar-small: y6
text.ar-small: SELECTED OUTPUT y1
text.ar-formula: Wx + B(Ax)
text.ar-small: 0.141 +0.000 +0.000
text.ar-value: = 0.141
text.ar-small: Two rank channels; one output.
text.ar-small: LOSS · ½ Σ ERROR²
text.ar-small: 4 updates
text.ar-small: 0.738 → 0.738
strong.: Keep W. Learn an adapter.
span.: W unchanged · 0.0 / 4 updates
button.: Ⅱ Pause
time.: 1.1 / 32s
button.ls-play: Ⅱ Pause story
button.: ↺ Replay

## t=20s stage 681/681 doc 1440/1440 secH 900 minFont 9.8
strong.: Results laboratory
h2.: What did the model learn?
strong.: The experiment
span.: 01
strong.: The starting point
span.: 02
strong.: SFT + LoRA
span.: 03
span.: 04
span.: 05
span.: 06
strong.: Capability map
strong.: Compute curves
strong.: Regression audit
small.: 6 chapters · ~105 seconds
button.: 1× thought
button.: 2× thought
button.: 4× thought
button.: 8× thought
span.ls-eyebrow: 02 / SFT
h3.: Good demonstrations make good paths easier to find.
span.: Trace output
small.: Matrix row → adapter contribution → error
text.ar-section: Frozen base
text.ar-section: Trainable adapter
text.ar-section: Same six output coordinates
text.ar-label: W · 6 × 6
text.ar-small: 36 weights frozen
text.ar-label: B · 6 × 2
text.ar-label: A · 2 × 6
text.ar-small: ∇A now nonzero
text.ar-small: 24 trainable values · rank ≤ 2
text.ar-label: W + BA
text.ar-small: Base + learned change
text.: Base
text.: Adapted
text.: Target
text.ar-small: -0.5
text.ar-small: 0.5
text.ar-small: y1
text.ar-small: y2
text.ar-small: y3
text.ar-small: y4
text.ar-small: y5
text.ar-small: y6
text.ar-small: SELECTED OUTPUT y1
text.ar-formula: Wx + B(Ax)
text.ar-small: 0.141 +0.011 +0.015
text.ar-value: = 0.167
text.ar-small: Two rank channels; one output.
text.ar-small: LOSS · ½ Σ ERROR²
text.ar-small: 4 updates
text.ar-small: 0.738 → 0.681
strong.: Now both factors can change.
span.: W unchanged · 1.8 / 4 updates
button.: Ⅱ Pause
time.: 11.0 / 32s
button.ls-play: Ⅱ Pause story
button.: ↺ Replay

## t=30s stage 681/681 doc 1440/1440 secH 900 minFont 9.8
strong.: Results laboratory
h2.: What did the model learn?
strong.: The experiment
span.: 01
strong.: The starting point
span.: 02
strong.: SFT + LoRA
span.: 03
span.: 04
span.: 05
span.: 06
strong.: Capability map
strong.: Compute curves
strong.: Regression audit
small.: 6 chapters · ~105 seconds
button.: 1× thought
button.: 2× thought
button.: 4× thought
button.: 8× thought
span.ls-eyebrow: 02 / SFT
h3.: Good demonstrations make good paths easier to find.
span.: Trace output
small.: Matrix row → adapter contribution → error
text.ar-section: Frozen base
text.ar-section: Trainable adapter
text.ar-section: Same six output coordinates
text.ar-label: W · 6 × 6
text.ar-small: 36 weights frozen
text.ar-label: B · 6 × 2
text.ar-label: A · 2 × 6
text.ar-small: ∇A now nonzero
text.ar-small: 24 trainable values · rank ≤ 2
text.ar-label: W + BA
text.ar-small: Base + learned change
text.: Base
text.: Adapted
text.: Target
text.ar-small: -0.5
text.ar-small: 0.5
text.ar-small: y1
text.ar-small: y2
text.ar-small: y3
text.ar-small: y4
text.ar-small: y5
text.ar-small: y6
text.ar-small: SELECTED OUTPUT y1
text.ar-formula: Wx + B(Ax)
text.ar-small: 0.141 +0.088 +0.114
text.ar-value: = 0.343
text.ar-small: Two rank channels; one output.
text.ar-small: LOSS · ½ Σ ERROR²
text.ar-small: 4 updates
text.ar-small: 0.738 → 0.355
text.ar-small: y1 · absolute error
tspan.: → 0.457
text.ar-small: Remaining error stays visible.
strong.: Follow the output, not just the weights.
span.: W unchanged · 4.0 / 4 updates
button.: Ⅱ Pause
time.: 21.0 / 32s
button.ls-play: Ⅱ Pause story
button.: ↺ Replay
