# Execution replay 1440x900

## t=3s stage 659/659 doc 1440/1440 secH 900 minFont 7.0
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
strong.: Where the 96 tasks land
strong.: Execution replay
mark.: 23.75 → 11.55
small.: GPU-s · request 7
strong.: Queue & latency
span.rs-status: One cohort · 96 tasks
button.: Interactive
button.: Shared-prefix burst
span.gc-tag: All 96 requests
span.lab-control-label: Model checkpoint
button.: Base
button.: Post-trained · SFT + RL
strong.: Total GPU work
strong.: Input processing
strong.: Answer generation
strong.: Response latency
h3.: Total GPU execution work
span.: Request 23 · 8,192 input · 6,091 output tokens
small.: s · since worker start
text.rr-small: 0 s
text.rr-small: 6.7 s
text.rr-small: 13.4 s
text.rr-small: 20.2 s
text.rr-small: 26.9 s
text.rr-lane-name: Baseline
text.rr-small: worker released
text.rr-small: 8,192 input tokens computed
text.rr-token-count: 6,091 / 6,091 output
text.rr-lane-name: Optimized
text.rr-small: 384 input tokens computed
h4.: GPU work for this answer
span.: Baseline
small.: GPU-s
span.: Optimized
b.cx-hero-num: Δ 12.82
span.cx-hero-unit: GPU-s less
small.: 47.7% reduction
p.rr-cause: A ready prefix skips input work; faster rates execute what remains.
time.: 20 / 20 s
button.: First completion
button.: Compare the difference
strong.: Choose a request from the same 96-task trace
span.: Ready prefix reused · request 23
text.rr-small: 24
text.rr-small: 48
text.rr-small: 72
text.rr-small: 96

## t=12s stage 659/659 doc 1440/1440 secH 900 minFont 7.0
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
strong.: Where the 96 tasks land
strong.: Execution replay
mark.: 23.75 → 11.55
small.: GPU-s · request 7
strong.: Queue & latency
span.rs-status: One cohort · 96 tasks
button.: Interactive
button.: Shared-prefix burst
span.gc-tag: All 96 requests
span.lab-control-label: Model checkpoint
button.: Base
button.: Post-trained · SFT + RL
strong.: Total GPU work
strong.: Input processing
strong.: Answer generation
strong.: Response latency
h3.: Total GPU execution work
span.: Request 96 · 8,192 input · 5,416 output tokens
small.: s · since worker start
text.rr-small: 0 s
text.rr-small: 6.2 s
text.rr-small: 12.5 s
text.rr-small: 18.7 s
text.rr-small: 25 s
text.rr-lane-name: Baseline
text.rr-small: worker released
text.rr-small: 8,192 input tokens computed
text.rr-token-count: 5,416 / 5,416 output
text.rr-lane-name: Optimized
text.rr-small: 384 input tokens computed
h4.: GPU work for this answer
span.: Baseline
small.: GPU-s
span.: Optimized
b.cx-hero-num: Δ 12.44
span.cx-hero-unit: GPU-s less
small.: 49.8% reduction
p.rr-cause: A ready prefix skips input work; faster rates execute what remains.
time.: 20 / 20 s
button.: First completion
button.: Compare the difference
strong.: Choose a request from the same 96-task trace
span.: Ready prefix reused · request 96
text.rr-small: 24
text.rr-small: 48
text.rr-small: 72
text.rr-small: 96

## t=24s stage 659/659 doc 1440/1440 secH 900 minFont 7.0
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
strong.: Where the 96 tasks land
strong.: Execution replay
mark.: 23.75 → 11.55
small.: GPU-s · request 7
strong.: Queue & latency
span.rs-status: One cohort · 96 tasks
button.: Interactive
button.: Shared-prefix burst
span.gc-tag: Answer only
span.lab-control-label: Model checkpoint
button.: Base
button.: Post-trained · SFT + RL
strong.: Total GPU work
strong.: Input processing
strong.: Answer generation
strong.: Response latency
h3.: Answer generation cost
span.: Request 7 · 8,192 input · 4,973 output tokens
small.: s · since decode starts
text.rr-small: 0 s
text.rr-small: 3.5 s
text.rr-small: 7 s
text.rr-small: 10.4 s
text.rr-small: 13.9 s
text.rr-lane-name: Baseline
text.rr-small: worker released
text.rr-small: 8,192 input tokens computed
text.rr-token-count: 4,973 / 4,973 output
text.rr-lane-name: Optimized
text.rr-small: 384 input tokens computed
h4.: Work to generate its answer
span.: Baseline
small.: GPU-s
span.: Optimized
b.cx-hero-num: Δ 2.74
span.cx-hero-unit: GPU-s less
small.: 19.6% reduction
p.rr-cause: Only the declared output-token execution rate changes.
time.: 20 / 20 s
button.: First completion
button.: Compare the difference
strong.: Choose a request from the same 96-task trace
span.: Ready prefix reused · request 7
text.rr-small: 24
text.rr-small: 48
text.rr-small: 72
text.rr-small: 96

## t=34s stage 659/659 doc 1440/1440 secH 900 minFont 7.0
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
strong.: Where the 96 tasks land
strong.: Execution replay
mark.: 23.75 → 11.55
small.: GPU-s · request 7
strong.: Queue & latency
span.rs-status: One cohort · 96 tasks
button.: Interactive
button.: Shared-prefix burst
span.gc-tag: Total GPU work
span.lab-control-label: Model checkpoint
button.: Base
button.: Post-trained · SFT + RL
strong.: Total GPU work
strong.: Input processing
strong.: Answer generation
strong.: Response latency
h3.: Total GPU execution work
span.: Request 7 · 8,192 input · 4,973 output tokens
small.: s · since worker start
text.rr-small: 0 s
text.rr-small: 5.9 s
text.rr-small: 11.9 s
text.rr-small: 17.8 s
text.rr-small: 23.8 s
text.rr-lane-name: Baseline
text.rr-small: worker released
text.rr-small: 8,192 input tokens computed
text.rr-token-count: 4,973 / 4,973 output
text.rr-lane-name: Optimized
text.rr-small: 384 input tokens computed
h4.: GPU work for this answer
span.: Baseline
small.: GPU-s
span.: Optimized
b.cx-hero-num: Δ 12.2
span.cx-hero-unit: GPU-s less
small.: 51.4% reduction
p.rr-cause: A ready prefix skips input work; faster rates execute what remains.
time.: 20 / 20 s
button.: First completion
button.: Compare the difference
strong.: Choose a request from the same 96-task trace
span.: Ready prefix reused · request 7
text.rr-small: 24
text.rr-small: 48
text.rr-small: 72
text.rr-small: 96
