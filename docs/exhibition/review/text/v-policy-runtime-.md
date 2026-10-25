# Policy × runtime 1440x900

## t=3s stage 659/659 doc 1440/1440 secH 900 minFont 10.0
strong.: Results laboratory
h2.: Inference optimization
strong.: Same intelligence, cheaper execution
em.: Continuous batching
em.: Paged KV + prefix reuse
em.: Fused prefill & decode kernels
strong.: Serving under load
em.: Chunked prefill
em.: Speculative decoding
em.: Cache-aware routing
em.: CPU/GPU overlap
strong.: The experiment
strong.: Policy × runtime
mark.: −47%
small.: GPU-s per correct answer
strong.: Where the 96 tasks land
strong.: Execution replay
strong.: Queue & latency
span.rs-status: One cohort · 96 tasks
button.: Interactive
button.: Shared-prefix burst
strong.: Optimize inference runtime
span.: KV reuse + execution rates
strong.: Compare post-training
span.: SFT + correctness RL
strong.: Combine policy & runtime
span.: Trace both contributions
text.cxp-plot-heading: KV prefix reuse
text.cxp-tick: Correctness RL / static → Correctness RL / KV reuse only
text.cxp-tick: 0%
text.cxp-tick: 25%
text.cxp-tick: 50%
text.cxp-tick: 75%
text.cxp-tick: 100%
text.cxp-tick: 12.5
text.cxp-tick: 25
text.cxp-tick: 37.5
text.cxp-tick: 50
text.cxp-axis: Task accuracy
text.cxp-axis: GPU-seconds per correct answer
text.cxp-intermediate-label: KV reuse only
text.cxp-contribution-name: KV prefix reuse
text.cxp-contribution-value: Δ −12.59 GPU-s / correct
text.cxp-contribution-name: Faster prefill + decode
text.cxp-contribution-value: Δ −4.74 GPU-s / correct
tspan.cxp-point-runtime: static runtime
tspan.cxp-point-runtime: optimized runtime
span.: Correctness RL / static
strong.: Correctness RL / KV reuse only
p.cxp-active-step: Step 1: KV prefix reuse
span.: GPU-s / correct answer
b.: 36.61
b.: 24.03
span.: Task accuracy
b.: 69.8%
h3.: Runtime contributions
strong.: ≈ −12.59
strong.: ≈ −4.74
span.: Selected: Post-trained / Optimized
button.: Baseline condition
button.: KV prefix reuse
button.: Faster prefill + decode
button.: Final condition
button.: Compare the change
button.: Ⅱ Pause comparison
time.: 4.3 / 17.5 s

## t=8s stage 659/659 doc 1440/1440 secH 900 minFont 10.0
strong.: Results laboratory
h2.: Inference optimization
strong.: Same intelligence, cheaper execution
em.: Continuous batching
em.: Paged KV + prefix reuse
em.: Fused prefill & decode kernels
strong.: Serving under load
em.: Chunked prefill
em.: Speculative decoding
em.: Cache-aware routing
em.: CPU/GPU overlap
strong.: The experiment
strong.: Policy × runtime
mark.: −47%
small.: GPU-s per correct answer
strong.: Where the 96 tasks land
strong.: Execution replay
strong.: Queue & latency
span.rs-status: One cohort · 96 tasks
button.: Interactive
button.: Shared-prefix burst
strong.: Optimize inference runtime
span.: KV reuse + execution rates
strong.: Compare post-training
span.: SFT + correctness RL
strong.: Combine policy & runtime
span.: Trace both contributions
text.cxp-plot-heading: Faster prefill + decode
text.cxp-tick: Correctness RL / KV reuse only → Correctness RL / optimized
text.cxp-tick: 0%
text.cxp-tick: 25%
text.cxp-tick: 50%
text.cxp-tick: 75%
text.cxp-tick: 100%
text.cxp-tick: 12.5
text.cxp-tick: 25
text.cxp-tick: 37.5
text.cxp-tick: 50
text.cxp-axis: Task accuracy
text.cxp-axis: GPU-seconds per correct answer
text.cxp-bracket-value: Δ −4.74 GPU-s per correct answer
text.cxp-intermediate-label: KV reuse only
text.cxp-contribution-name: KV prefix reuse
text.cxp-contribution-value: Δ −12.59 GPU-s / correct
text.cxp-contribution-name: Faster prefill + decode
text.cxp-contribution-value: Δ −4.74 GPU-s / correct
tspan.cxp-point-runtime: static runtime
tspan.cxp-point-runtime: optimized runtime
span.: Correctness RL / KV reuse only
strong.: Correctness RL / optimized
p.cxp-active-step: Step 2: Faster prefill + decode
span.: GPU-s / correct answer
b.: 24.03
b.: 19.29
strong.cxp-delta: Δ 4.74 GPU-s less per correct answer
span.: Task accuracy
b.: 69.8%
strong.cxp-delta: = same accuracy
h3.: Runtime contributions
strong.: ≈ −12.59
strong.: ≈ −4.74
span.: Selected: Post-trained / Optimized
button.: Baseline condition
button.: KV prefix reuse
button.: Faster prefill + decode
button.: Final condition
button.: Compare the change
button.: Ⅱ Pause comparison
time.: 9.3 / 17.5 s

## t=13s stage 659/659 doc 1440/1440 secH 900 minFont 10.0
strong.: Results laboratory
h2.: Inference optimization
strong.: Same intelligence, cheaper execution
em.: Continuous batching
em.: Paged KV + prefix reuse
em.: Fused prefill & decode kernels
strong.: Serving under load
em.: Chunked prefill
em.: Speculative decoding
em.: Cache-aware routing
em.: CPU/GPU overlap
strong.: The experiment
strong.: Policy × runtime
mark.: −47%
small.: GPU-s per correct answer
strong.: Where the 96 tasks land
strong.: Execution replay
strong.: Queue & latency
span.rs-status: One cohort · 96 tasks
button.: Interactive
button.: Shared-prefix burst
strong.: Optimize inference runtime
span.: KV reuse + execution rates
strong.: Compare post-training
span.: SFT + correctness RL
strong.: Combine policy & runtime
span.: Trace both contributions
text.cxp-plot-heading: Compare cost and accuracy
text.cxp-tick: Post-trained / Static → Post-trained / Optimized
text.cxp-tick: 0%
text.cxp-tick: 25%
text.cxp-tick: 50%
text.cxp-tick: 75%
text.cxp-tick: 100%
text.cxp-tick: 12.5
text.cxp-tick: 25
text.cxp-tick: 37.5
text.cxp-tick: 50
text.cxp-axis: Task accuracy
text.cxp-axis: GPU-seconds per correct answer
text.cxp-bracket-value: Δ −17.32 GPU-s per correct answer
text.cxp-intermediate-label: KV reuse only
text.cxp-contribution-name: KV prefix reuse
text.cxp-contribution-value: Δ −12.59 GPU-s / correct
text.cxp-contribution-name: Faster prefill + decode
text.cxp-contribution-value: Δ −4.74 GPU-s / correct
tspan.cxp-point-runtime: static runtime
tspan.cxp-point-runtime: optimized runtime
span.: Post-trained / Static
strong.: Post-trained / Optimized
p.cxp-active-step: Compare the complete change
span.: GPU-s / correct answer
b.: 36.61
b.: 19.29
strong.cxp-delta: Δ 17.32 GPU-s less per correct answer
span.: Task accuracy
b.: 69.8%
strong.cxp-delta: = same accuracy
h3.: Runtime contributions
strong.: ≈ −12.59
strong.: ≈ −4.74
span.: Selected: Post-trained / Optimized
button.: Baseline condition
button.: KV prefix reuse
button.: Faster prefill + decode
button.: Final condition
button.: Compare the change
button.: Ⅱ Pause comparison
time.: 14.3 / 17.5 s

## t=18s stage 659/659 doc 1440/1440 secH 900 minFont 10.0
strong.: Results laboratory
h2.: Inference optimization
strong.: Same intelligence, cheaper execution
em.: Continuous batching
em.: Paged KV + prefix reuse
em.: Fused prefill & decode kernels
strong.: Serving under load
em.: Chunked prefill
em.: Speculative decoding
em.: Cache-aware routing
em.: CPU/GPU overlap
strong.: The experiment
strong.: Policy × runtime
mark.: −47%
small.: GPU-s per correct answer
strong.: Where the 96 tasks land
strong.: Execution replay
strong.: Queue & latency
span.rs-status: One cohort · 96 tasks
button.: Interactive
button.: Shared-prefix burst
strong.: Optimize inference runtime
span.: KV reuse + execution rates
strong.: Compare post-training
span.: SFT + correctness RL
strong.: Combine policy & runtime
span.: Trace both contributions
text.cxp-plot-heading: Compare cost and accuracy
text.cxp-tick: Post-trained / Static → Post-trained / Optimized
text.cxp-tick: 0%
text.cxp-tick: 25%
text.cxp-tick: 50%
text.cxp-tick: 75%
text.cxp-tick: 100%
text.cxp-tick: 12.5
text.cxp-tick: 25
text.cxp-tick: 37.5
text.cxp-tick: 50
text.cxp-axis: Task accuracy
text.cxp-axis: GPU-seconds per correct answer
text.cxp-bracket-value: Δ −17.32 GPU-s per correct answer
text.cxp-intermediate-label: KV reuse only
text.cxp-contribution-name: KV prefix reuse
text.cxp-contribution-value: Δ −12.59 GPU-s / correct
text.cxp-contribution-name: Faster prefill + decode
text.cxp-contribution-value: Δ −4.74 GPU-s / correct
tspan.cxp-point-runtime: static runtime
tspan.cxp-point-runtime: optimized runtime
span.: Post-trained / Static
strong.: Post-trained / Optimized
p.cxp-active-step: Compare the complete change
span.: GPU-s / correct answer
b.: 36.61
b.: 19.29
strong.cxp-delta: Δ 17.32 GPU-s less per correct answer
span.: Task accuracy
b.: 69.8%
strong.cxp-delta: = same accuracy
h3.: Runtime contributions
strong.: ≈ −12.59
strong.: ≈ −4.74
span.: Selected: Post-trained / Optimized
button.: Baseline condition
button.: KV prefix reuse
button.: Faster prefill + decode
button.: Final condition
button.: Compare the change
button.: ↺ Replay comparison
time.: 17.5 / 17.5 s
