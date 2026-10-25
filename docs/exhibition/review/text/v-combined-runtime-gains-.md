# Combined runtime gains 1440x900

## t=4s stage 659/659 doc 1440/1440 secH 900 minFont 10.0
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
span.: 01
span.: 02
span.: 03
span.: 04
span.: 05
strong.: Combined runtime gains
strong.: Policy × runtime
strong.: Where the 96 tasks land
strong.: Execution replay
strong.: Queue & latency
h3.: Scheduling reduces queue time
span.: Request 7 · 8,192 input tokens · 4,973 output tokens
text.rg-axis: Waiting before execution
text.rg-small: Seconds per request
text.rg-axis: GPU work per request
tspan.: Input processing
tspan.: answer generation
text.rg-row-label: Baseline serving
text.rg-number: 64.32 s waiting
text.rg-small: Input 9.83 + output 13.92
text.rg-total: 23.75
text.rg-row-label: + Worker scheduling
text.rg-number: 64.28 s waiting
text.rg-row-label: + KV prefix reuse
text.rg-row-label: + Faster execution
text.rg-number: Δ 0.04 s
span.rg-context: Request 7 · cumulative interventions
h4.: Admit the next request sooner
text.: Worker 1
text.: Worker 2
text.: Next request
small.: Baseline wait
small.: Scheduled wait
b.: Δ 0.04
span.: seconds less waiting
p.: 23.75 GPU-s of computation is unchanged.
time.: 4.13 / 38 s
button.: Baseline costs
button.: Worker scheduling
button.: KV prefix reuse
button.: Execution rates
button.: All 96 requests
button.: Combined reduction
p.: These are ordered comparisons of the existing scenario, not independent percentages added together. Request 7 retains its arrival, logical input, output count and outcome. The request view separates queue seconds from GPU busy-work. The cohort view sums work across all 96 requests, including unsuccessful requests, and divides by the same 67 correct outcomes. Prefix warm-up is charged; only ready matches are reused. Execution changes the declared prefill/decode rates, with cache outcomes held fixed. Scheduling can change downstream waiting, but that waiting is not GPU work. Rates are scenario assumptions, not measured kernel speedups. Morphing bars interpolate between conditions, not device telemetry.
button.: Explore result figures ↗

## t=12s stage 659/659 doc 1440/1440 secH 900 minFont 10.0
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
span.: 01
span.: 02
span.: 03
span.: 04
span.: 05
strong.: Combined runtime gains
strong.: Policy × runtime
strong.: Where the 96 tasks land
strong.: Execution replay
strong.: Queue & latency
h3.: Prefix reuse removes input work
span.: Request 7 · 8,192 input tokens · 4,973 output tokens
text.rg-axis: Waiting before execution
text.rg-small: Seconds per request
text.rg-axis: GPU work per request
tspan.: Input processing
tspan.: answer generation
text.rg-row-label: Baseline serving
text.rg-number: 64.32 s waiting
text.rg-small: Input 9.83 + output 13.92
text.rg-total: 23.75
text.rg-row-label: + Worker scheduling
text.rg-number: 56.67 s waiting
text.rg-row-label: + KV prefix reuse
text.rg-small: Input 6.85 + output 13.92
text.rg-total: 20.77
text.rg-row-label: + Faster execution
text.rg-number: Δ 2.98 GPU-s
span.rg-context: Request 7 · cumulative interventions
h4.: Reuse the context; compute the suffix
text.: Ready KV pages
text.: Suffix
text.: New prefill
small.: Before reuse
small.: With reuse
b.: Δ 2.98
span.: GPU-seconds less work
p.: 7,808 input tokens do not need another prefill.
time.: 12.13 / 38 s
button.: Baseline costs
button.: Worker scheduling
button.: KV prefix reuse
button.: Execution rates
button.: All 96 requests
button.: Combined reduction
p.: These are ordered comparisons of the existing scenario, not independent percentages added together. Request 7 retains its arrival, logical input, output count and outcome. The request view separates queue seconds from GPU busy-work. The cohort view sums work across all 96 requests, including unsuccessful requests, and divides by the same 67 correct outcomes. Prefix warm-up is charged; only ready matches are reused. Execution changes the declared prefill/decode rates, with cache outcomes held fixed. Scheduling can change downstream waiting, but that waiting is not GPU work. Rates are scenario assumptions, not measured kernel speedups. Morphing bars interpolate between conditions, not device telemetry.
button.: Explore result figures ↗

## t=22s stage 659/659 doc 1440/1440 secH 900 minFont 10.0
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
span.: 01
span.: 02
span.: 03
span.: 04
span.: 05
strong.: Combined runtime gains
strong.: Policy × runtime
strong.: Where the 96 tasks land
strong.: Execution replay
strong.: Queue & latency
h3.: Faster prefill and decode
span.: Request 7 · 8,192 input tokens · 4,973 output tokens
text.rg-axis: Waiting before execution
text.rg-small: Seconds per request
text.rg-axis: GPU work per request
tspan.: Input processing
tspan.: answer generation
text.rg-row-label: Baseline serving
text.rg-number: 64.32 s waiting
text.rg-small: Input 9.83 + output 13.92
text.rg-total: 23.75
text.rg-row-label: + Worker scheduling
text.rg-number: 56.67 s waiting
text.rg-row-label: + KV prefix reuse
text.rg-small: Input 0.46 + output 13.92
text.rg-total: 14.39
text.rg-row-label: + Faster execution
text.rg-number: 42.95 s waiting
text.rg-small: Input 0.36 + output 11.19
text.rg-total: 11.55
text.rg-number: Δ 2.83 GPU-s
span.rg-context: Request 7 · cumulative interventions
h4.: Lower the cost of every remaining token
small.: ms
small.: Before rate change
small.: Faster rates
b.: Δ 2.83
span.: GPU-seconds less work
p.: 4,973 output tokens, with the same task outcome.
time.: 22.13 / 38 s
button.: Baseline costs
button.: Worker scheduling
button.: KV prefix reuse
button.: Execution rates
button.: All 96 requests
button.: Combined reduction
p.: These are ordered comparisons of the existing scenario, not independent percentages added together. Request 7 retains its arrival, logical input, output count and outcome. The request view separates queue seconds from GPU busy-work. The cohort view sums work across all 96 requests, including unsuccessful requests, and divides by the same 67 correct outcomes. Prefix warm-up is charged; only ready matches are reused. Execution changes the declared prefill/decode rates, with cache outcomes held fixed. Scheduling can change downstream waiting, but that waiting is not GPU work. Rates are scenario assumptions, not measured kernel speedups. Morphing bars interpolate between conditions, not device telemetry.
button.: Explore result figures ↗

## t=30s stage 659/659 doc 1440/1440 secH 900 minFont 10.0
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
span.: 01
span.: 02
span.: 03
span.: 04
span.: 05
strong.: Combined runtime gains
strong.: Policy × runtime
strong.: Where the 96 tasks land
strong.: Execution replay
strong.: Queue & latency
h3.: Combined GPU-cost reduction
span.: 96 matched requests · unchanged checkpoint and outputs
text.rg-axis: Same task identities
text.rg-small: Request 7 stays in the cohort
text.rg-number: 96 requests
text.rg-small: 90 reused prefixes
text.rg-axis: GPU cost per correct answer
tspan.: input
tspan.: output
text.rg-row-label: Baseline serving
text.rg-total: 36.61
text.rg-row-label: + Worker scheduling
text.rg-small: Same GPU work; less waiting
text.rg-row-label: + KV prefix reuse
text.rg-total: 24.03
text.rg-number: −12.59 from prefix reuse
text.rg-row-label: + Faster execution
text.rg-total: 19.29
span.rg-context: Whole-workload accounting
h4.: Two compute savings, one total
b.: −12.59
b.: −4.74
b.: −17.32
small.: GPU-s per correct answer
span.: 36.61
strong.: 19.29
b.: 47.31% less GPU work
time.: 30.13 / 38 s
button.: Baseline costs
button.: Worker scheduling
button.: KV prefix reuse
button.: Execution rates
button.: All 96 requests
button.: Combined reduction
p.: These are ordered comparisons of the existing scenario, not independent percentages added together. Request 7 retains its arrival, logical input, output count and outcome. The request view separates queue seconds from GPU busy-work. The cohort view sums work across all 96 requests, including unsuccessful requests, and divides by the same 67 correct outcomes. Prefix warm-up is charged; only ready matches are reused. Execution changes the declared prefill/decode rates, with cache outcomes held fixed. Scheduling can change downstream waiting, but that waiting is not GPU work. Rates are scenario assumptions, not measured kernel speedups. Morphing bars interpolate between conditions, not device telemetry.
button.: Explore result figures ↗

## t=36s stage 659/659 doc 1440/1440 secH 900 minFont 10.0
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
span.: 01
span.: 02
span.: 03
span.: 04
span.: 05
strong.: Combined runtime gains
strong.: Policy × runtime
strong.: Where the 96 tasks land
strong.: Execution replay
strong.: Queue & latency
h3.: Combined GPU-cost reduction
span.: 96 matched requests · unchanged checkpoint and outputs
text.rg-axis: Same task identities
text.rg-small: Request 7 stays in the cohort
text.rg-number: 96 requests
text.rg-small: 90 reused prefixes
text.rg-axis: GPU cost per correct answer
tspan.: input
tspan.: output
text.rg-row-label: Baseline serving
text.rg-total: 36.61
text.rg-row-label: + Worker scheduling
text.rg-small: Same GPU work; less waiting
text.rg-row-label: + KV prefix reuse
text.rg-total: 24.03
text.rg-number: −12.59 from prefix reuse
text.rg-row-label: + Faster execution
text.rg-total: 19.29
text.rg-number: −4.74
text.rg-number: −12.59
text.rg-number: Δ 17.32 GPU-s / correct answer
span.rg-context: Whole-workload accounting
h4.: Two compute savings, one total
b.: −12.59
b.: −4.74
b.: −17.32
small.: GPU-s per correct answer
span.: 36.61
strong.: 19.29
b.: 47.31% less GPU work
time.: 36.12 / 38 s
button.: Baseline costs
button.: Worker scheduling
button.: KV prefix reuse
button.: Execution rates
button.: All 96 requests
button.: Combined reduction
p.: These are ordered comparisons of the existing scenario, not independent percentages added together. Request 7 retains its arrival, logical input, output count and outcome. The request view separates queue seconds from GPU busy-work. The cohort view sums work across all 96 requests, including unsuccessful requests, and divides by the same 67 correct outcomes. Prefix warm-up is charged; only ready matches are reused. Execution changes the declared prefill/decode rates, with cache outcomes held fixed. Scheduling can change downstream waiting, but that waiting is not GPU work. Rates are scenario assumptions, not measured kernel speedups. Morphing bars interpolate between conditions, not device telemetry.
button.: Explore result figures ↗
