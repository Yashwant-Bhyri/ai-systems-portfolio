# Learn from outcomes 1440x900

## t=3s stage 681/681 doc 1440/1440 secH 900 minFont 9.5
strong.: Results laboratory
h2.: What did the model learn?
strong.: The experiment
span.: 01
span.: 02
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
span.ls-eyebrow: 03 / GRPO
h3.: Compare attempts. Reinforce the ones that work.
text.ex-m: BATCH · 8 PROMPTS × G = 8 ROLLOUTS · VERIFIER-SCORED
text.ex-m: p1
text.ex-m: r̄ 0.625
text.ex-m: p2
text.ex-m: r̄ 1.000
text.ex-m: p3
text.ex-m: r̄ 0.250
text.ex-m: p4
text.ex-m: r̄ 0.750
text.ex-m: p5
text.ex-m: r̄ 0.000
text.ex-m: p6
text.ex-m: r̄ 0.500
text.ex-m: p7
text.ex-m: r̄ 0.875
text.ex-m: p8
text.ex-m: r̄ 0.125
text.ex-m: GROUP MEAN
text.ex-m: π · POLICY OVER REASONING PATHS · RESHAPED BY Â
text.ex-m: EVAL · SFT → GRPO
text.ex-m: MATHEMATICS
text.ex-m: MULTI-STEP LOGIC
text.ex-m: REPOSITORY TASKS
text.ex-m: SOLVED
text.ex-num-l: 46 / 96
text.ex-m: PASS@1
text.ex-num-l: 47.9%
text.ex-m: TOKENS / TASK
text.ex-num-l: 1,300
text.ex-m: GPU-S / TASK
text.ex-num-l: 6.10
text.ex-ann: +11 gained · −2 regressed · answers got longer
button.ls-play: Ⅱ Pause story
button.: ↺ Replay

## t=10s stage 681/681 doc 1440/1440 secH 900 minFont 9.5
strong.: Results laboratory
h2.: What did the model learn?
strong.: The experiment
span.: 01
span.: 02
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
span.ls-eyebrow: 03 / GRPO
h3.: Compare attempts. Reinforce the ones that work.
text.ex-m: BATCH · 8 PROMPTS × G = 8 ROLLOUTS · VERIFIER-SCORED
text.ex-m: p1
text.ex-m: r̄ 0.625
text.ex-m: p2
text.ex-m: r̄ 1.000
text.ex-ann: no signal · dropped
text.ex-m: p3
text.ex-m: r̄ 0.250
text.ex-m: p4
text.ex-m: r̄ 0.750
text.ex-m: p5
text.ex-m: r̄ 0.000
text.ex-m: p6
text.ex-m: r̄ 0.500
text.ex-m: p7
text.ex-m: r̄ 0.875
text.ex-m: p8
text.ex-m: r̄ 0.125
text.ex-m: GROUP MEAN
text.ex-m: π · POLICY OVER REASONING PATHS · RESHAPED BY Â
text.ex-m: EVAL · SFT → GRPO
text.ex-m: MATHEMATICS
text.ex-m: MULTI-STEP LOGIC
text.ex-m: REPOSITORY TASKS
text.ex-m: SOLVED
text.ex-num-l: 53 / 96
text.ex-m: PASS@1
text.ex-num-l: 57.3%
text.ex-m: TOKENS / TASK
text.ex-num-l: 2,802
text.ex-m: GPU-S / TASK
text.ex-num-l: 10.30
text.ex-ann: +11 gained · −2 regressed · answers got longer
button.ls-play: Ⅱ Pause story
button.: ↺ Replay

## t=20s stage 681/681 doc 1440/1440 secH 900 minFont 8.0
strong.: Results laboratory
h2.: What did the model learn?
strong.: The experiment
span.: 01
span.: 02
span.: 03
strong.: Learn from outcomes
span.: 04
strong.: Give it more thought
span.: 05
span.: 06
strong.: Capability map
strong.: Compute curves
strong.: Regression audit
small.: 6 chapters · ~105 seconds
span.ls-eyebrow: 04 / SEARCH
h3.: Give the same model room to investigate.
text.ls-small: 20
text.ls-small: 40
text.ls-small: 60
text.ls-small: 80
text.ls-small: 100
text.ls-small: Accuracy (%)
text.ls-small: 10
text.ls-small: 30
text.ls-small: Actual GPU-s / task
text.ls-small: 1×
text.ls-small: 2×
text.ls-small: 4×
text.ls-small: 8×
span.: y = verified outcomes / 96
span.: x = Σ actual GPU work / 96
span.: ┄ Base reference
strong.: +12 net verified outcomes
span.: for +7.86 GPU-s/task versus 1×
span.: USER → REPOSITORY ASSISTANT
p.: “A payment timed out. The retry charged the customer twice. Find the cause and a safe fix.”
span.: checkout.ts
span.: retry.ts
span.: payments.ts
span.: ATTEMPT 2 / Trace the retry path
p.: The provider may have accepted the charge before the response was lost. A new retry key can create another charge.
text.ls-small: Application
text.ls-small: Payment provider
text.ls-small: charge · key A
text.ls-small: response lost ×
text.: retry · key B (new)
text.ls-small: two charges
span.: REASONING CONTROLLER
strong.: Replay the timeout → check the outcome
strong.: Replaying the timeout…
span.: 2× allowance
strong.: Spend the next attempt on the missing link.
b.: 67/96
b.: 18.18
small.: Simulated, not measured
span.: First attempt
span.: Trace further
span.: Find the invariant
span.: Check boundaries
span.: Scrub the reveal
time.: 7.8 / 21s
button.ls-play: Ⅱ Pause story
button.: ↺ Replay

## t=30s stage 681/681 doc 1440/1440 secH 900 minFont 8.0
strong.: Results laboratory
h2.: What did the model learn?
strong.: The experiment
span.: 01
span.: 02
span.: 03
strong.: Learn from outcomes
span.: 04
strong.: Give it more thought
span.: 05
span.: 06
strong.: Capability map
strong.: Compute curves
strong.: Regression audit
small.: 6 chapters · ~105 seconds
span.ls-eyebrow: 04 / SEARCH
h3.: Give the same model room to investigate.
text.ls-small: 20
text.ls-small: 40
text.ls-small: 60
text.ls-small: 80
text.ls-small: 100
text.ls-small: Accuracy (%)
text.ls-small: 10
text.ls-small: 30
text.ls-small: Actual GPU-s / task
text.ls-small: 1×
text.ls-small: 2×
text.ls-small: 4×
text.ls-small: 8×
span.: y = verified outcomes / 96
span.: x = Σ actual GPU work / 96
span.: ┄ Base reference
strong.: +33 net verified outcomes
span.: for +23.59 GPU-s/task versus 1×
span.: USER → REPOSITORY ASSISTANT
p.: “A payment timed out. The retry charged the customer twice. Find the cause and a safe fix.”
span.: checkout.ts
span.: retry.ts
span.: payments.ts
span.: ATTEMPT 4 / Check the surrounding failure modes
p.: Inspect timeout recovery and key persistence as well. More search costs more; not every extra attempt changes the answer.
text.ls-small: Application
text.ls-small: Payment provider
text.ls-small: charge · key A
text.ls-small: response lost ×
text.: retry · key A (same)
text.ls-small: one charge
span.: REASONING CONTROLLER
strong.: Checks complete → return the fix
strong.: Additional boundary checks pass
span.: 8× allowance
strong.: Then ask what else could break.
b.: 88/96
b.: 33.91
small.: Simulated, not measured
span.: First attempt
span.: Trace further
span.: Find the invariant
span.: Check boundaries
span.: Scrub the reveal
time.: 17.7 / 21s
button.ls-play: Ⅱ Pause story
button.: ↺ Replay
