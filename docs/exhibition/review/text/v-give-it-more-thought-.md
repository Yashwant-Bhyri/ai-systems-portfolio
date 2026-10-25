# Give it more thought 1440x900

## t=3s stage 681/681 doc 1440/1440 secH 900 minFont 8.0
strong.: Results laboratory
h2.: What did the model learn?
strong.: The experiment
span.: 01
span.: 02
span.: 03
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
strong.: +0 net verified outcomes
span.: for +0.00 GPU-s/task versus 1×
span.: USER → REPOSITORY ASSISTANT
p.: “A payment timed out. The retry charged the customer twice. Find the cause and a safe fix.”
span.: checkout.ts
span.: retry.ts
span.: payments.ts
span.: ATTEMPT 1 / Inspect the checkout handler
p.: A timeout looks like failure. The first proposal simply retries the charge.
text.ls-small: Application
text.ls-small: Payment provider
text.ls-small: charge · key A
text.ls-small: response lost ×
text.: retry · key B (new)
text.ls-small: two charges
span.: REASONING CONTROLLER
strong.: Replay the timeout → check the outcome
strong.: Replaying the timeout…
span.: 1× allowance
strong.: A plausible fix is not a checked fix.
b.: 55/96
b.: 10.32
small.: Simulated, not measured
span.: First attempt
span.: Trace further
span.: Find the invariant
span.: Check boundaries
span.: Scrub the reveal
time.: 4.1 / 21s
button.ls-play: Ⅱ Pause story
button.: ↺ Replay

## t=10s stage 681/681 doc 1440/1440 secH 900 minFont 8.0
strong.: Results laboratory
h2.: What did the model learn?
strong.: The experiment
span.: 01
span.: 02
span.: 03
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
strong.: +27 net verified outcomes
span.: for +15.72 GPU-s/task versus 1×
span.: USER → REPOSITORY ASSISTANT
p.: “A payment timed out. The retry charged the customer twice. Find the cause and a safe fix.”
span.: checkout.ts
span.: retry.ts
span.: payments.ts
span.: ATTEMPT 3 / Preserve identity across retries
p.: One payment attempt keeps one idempotency key. The replayed timeout no longer creates a second charge.
text.ls-small: Application
text.ls-small: Payment provider
text.ls-small: charge · key A
text.ls-small: response lost ×
text.: retry · key A (same)
span.: REASONING CONTROLLER
strong.: Replay the timeout → check the outcome
strong.: Replaying the timeout…
span.: 4× allowance
strong.: More thought finds the invariant.
b.: 82/96
b.: 26.04
small.: Simulated, not measured
span.: First attempt
span.: Trace further
span.: Find the invariant
span.: Check boundaries
span.: Scrub the reveal
time.: 11.1 / 21s
button.ls-play: Ⅱ Pause story
button.: ↺ Replay

## t=20s stage 681/681 doc 1440/1440 secH 900 minFont 10.0
strong.: Results laboratory
h2.: What did the model learn?
strong.: The experiment
span.: 01
span.: 02
span.: 03
span.: 04
strong.: Give it more thought
span.: 05
strong.: Make thought count
span.: 06
strong.: Capability map
strong.: Compute curves
strong.: Regression audit
small.: 6 chapters · ~105 seconds
button.: 1× thought
button.: 2× thought
button.: 4× thought
button.: 8× thought
span.ls-eyebrow: 05 / REFINE
h3.: Better reasoning is not simply longer reasoning.
text.ex-m: TOKENS PER TASK · 4× ALLOWANCE · GRPO (OUTLINE) → LENGTH-AWARE RL (FILLED)
text.ex-m: MATHEMATICS
text.ex-m: MULTI-STEP LOGIC
text.ex-m: REPOSITORY TASKS
text.ex-m: SOLVED
text.ex-num-l: 82 → 82
text.ex-m: TOKENS / TASK
text.ex-num-l: 8,423
text.ex-m: GPU-S / TASK
text.ex-num-l: 26.04
text.ex-m: CHANGED TASKS
text.ex-num-l: +3 / −3
button.ls-play: Ⅱ Pause story
button.: ↺ Replay

## t=30s stage 681/681 doc 1440/1440 secH 900 minFont 8.8
strong.: Results laboratory
h2.: What did the model learn?
strong.: The experiment
span.: 01
span.: 02
span.: 03
span.: 04
strong.: Give it more thought
span.: 05
span.: 06
strong.: The frontier
strong.: Capability map
strong.: Compute curves
strong.: Regression audit
small.: 6 chapters · ~105 seconds
button.: 1× thought
button.: 2× thought
button.: 4× thought
button.: 8× thought
span.ls-eyebrow: 06 / FRONTIER
h3.: Training moves it up. Serving moves it left.
text.ex-ann: 40%
text.ex-ann: 60%
text.ex-ann: 80%
text.ex-ann: 100%
text.ex-ann: 10
text.ex-ann: 20
text.ex-ann: 30
text.ex-ann: 40
text.ex-m: GPU-S / CORRECT ←
text.ex-m: PASS@1 ↑
text.ex-ann-acc: SFT · LoRA
text.ex-m-ink: +18 solved
text.ex-node: base · 28 / 96
text.ex-ann: 01
text.ex-node: Imitate verified traces
tspan.: +18 solved
text.ex-ann: 02
text.ex-ann-acc: GRPO
text.ex-node: Reward what passes the tests
tspan.: +11 −2
text.ex-ann: 03
text.ex-ann-acc: 4× thought
text.ex-node: Search four times, keep the verified
tspan.: +27 solved
text.ex-ann: 04
text.ex-ann-acc: Lean RL
text.ex-node: Penalize wasted tokens
tspan.: same 82
text.ex-ann: 05
text.ex-ann-acc: Serving
text.ex-node: Reuse prefixes, batch, fuse kernels
button.ls-play: Ⅱ Pause story
button.: ↺ Replay
