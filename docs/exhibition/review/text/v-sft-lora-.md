# SFT + LoRA 1440x900

## t=3s stage 681/681 doc 1440/1440 secH 900 minFont 9.8
strong.: Results laboratory
h2.: What did the model learn?
strong.: The experiment
span.: 01
span.: 02
strong.: SFT + LoRA
span.: 03
strong.: Learn from outcomes
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
text.ar-small: ∇A = 0 on step 1
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
strong.: The first gradient changes B.
span.: ∇A = 0 on step 1 · W unchanged
button.: Ⅱ Pause
time.: 4.1 / 32s
button.ls-play: Ⅱ Pause story
button.: ↺ Replay

## t=10s stage 681/681 doc 1440/1440 secH 900 minFont 9.8
strong.: Results laboratory
h2.: What did the model learn?
strong.: The experiment
span.: 01
span.: 02
strong.: SFT + LoRA
span.: 03
strong.: Learn from outcomes
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
text.ar-small: 0.141 +0.011 +0.014
text.ar-value: = 0.167
text.ar-small: Two rank channels; one output.
text.ar-small: LOSS · ½ Σ ERROR²
text.ar-small: 4 updates
text.ar-small: 0.738 → 0.682
strong.: Now both factors can change.
span.: W unchanged · 1.8 / 4 updates
button.: Ⅱ Pause
time.: 11.0 / 32s
button.ls-play: Ⅱ Pause story
button.: ↺ Replay

## t=20s stage 681/681 doc 1440/1440 secH 900 minFont 9.8
strong.: Results laboratory
h2.: What did the model learn?
strong.: The experiment
span.: 01
span.: 02
strong.: SFT + LoRA
span.: 03
strong.: Learn from outcomes
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

## t=30s stage 681/681 doc 1440/1440 secH 900 minFont 10.0
strong.: Results laboratory
h2.: What did the model learn?
strong.: The experiment
span.: 01
span.: 02
strong.: SFT + LoRA
span.: 03
strong.: Learn from outcomes
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
span.: Prompt context
p.: “firstItem([]) crashes. Fix it.”
small.: Provided to the model, excluded from this example’s answer-token loss.
h4.: Supervise the complete answer
p.: Each next token is learned from the demonstrated prefix.
span.: Read the signature
strong.: def first_item(xs):
span.: Guard the empty list
strong.: if not xs: return None
span.: Return the first item
strong.: return xs[0]
span.: Answer-token targets
strong.: 2/3 → 3/3 tests
b.: Offline training
span.: Demonstrated training target, not a recorded model response. Token loss differs from the six-value calculation; neither is a held-out evaluation.
strong.: Teach the missing operation.
span.: No live-request weight update
button.: Ⅱ Pause
time.: 31.0 / 32s
button.ls-play: Ⅱ Pause story
button.: ↺ Replay
