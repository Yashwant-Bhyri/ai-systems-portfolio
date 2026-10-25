# Prefill & decode execution 1440x900

## t=5s stage 659/659 doc 1440/1440 secH 900 minFont 8.5
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
strong.: Prefill & decode execution
span.: 05
strong.: Policy × runtime
strong.: Where the 96 tasks land
strong.: Execution replay
strong.: Queue & latency
span.: Same model · same requests · same outcomes
span.: Execution trace
h3.: Request execution
button.: Delivery time
button.: Serving capacity
button.: GPU cost / correct answer
text.em-lane-name: Baseline
text.em-mono: 3,386 / 4,973 tokens
text.em-small: WEIGHTS / KV STATE
text.em-small: same checkpoint + context
text.em-small: read → compute → project
text.em-small: OUTPUT SEQUENCE
text.em-small: group 22 of 32 · decode
text.em-lane-name: Optimized
text.em-mono: 4,257 / 4,973 tokens
text.em-small: group 28 of 32 · decode
text.em-small: ELAPSED TIME
text.em-mono: 9.94 s
text.em-small: 14.39 s
text.em-small: Prefill + decode execution · one worker per lane
button.: Read state
button.: Execute
button.: Emit tokens
button.: Compare clocks
text.xs-label: Baseline
text.xs-label: Optimized
text.xs-small: 0s
text.xs-small: 20s
text.xs-small: 40.1s
text.xs-small: R7
text.xs-small: R8
text.xs-small: R9
text.xs-label: R = request · next row = next request
button.xs-expand: Follow request 7 into the next requests ↗
time.: 5.3 / 80.5s
span.: 06

## t=20s stage 659/659 doc 1440/1440 secH 900 minFont 8.8
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
strong.: Prefill & decode execution
span.: 05
strong.: Policy × runtime
strong.: Where the 96 tasks land
strong.: Execution replay
strong.: Queue & latency
span.: Same model · same requests · same outcomes
span.: Execution trace
h3.: Delivery time for twelve requests
span.xs-speed: Request-order waterfall
button.: Delivery time
button.: Serving capacity
button.: GPU cost / correct answer
text.xs-label: Baseline
text.xs-label: Optimized
text.xs-small: 0s
text.xs-small: 79s
text.xs-small: 157.9s
text.xs-small: Req. 7
text.xs-small: Req. 8
text.xs-small: Req. 9
text.xs-small: Req. 10
text.xs-small: Req. 11
text.xs-small: Req. 12
text.xs-small: Req. 13
text.xs-small: Req. 14
text.xs-small: Req. 15
text.xs-small: Req. 16
text.xs-small: Req. 17
text.xs-small: Req. 18
text.xs-label: 1 worker per lane · request order ↓
text.xs-label: 157.9 s elapsed
span.xs-focus-label: Time to finish 12 requests
text.xs-label: 157.9 s
text.xs-label: 126.8 s
text.xs-small: Violet = time saved
b.: 157.9 s
span.: Cache reuse held fixed
span.xs-focus-note: One worker per runtime · no extra workers added
time.: 20.3 / 80.5s
span.: 06

## t=35s stage 659/659 doc 1440/1440 secH 900 minFont 8.8
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
strong.: Prefill & decode execution
span.: 05
strong.: Policy × runtime
strong.: Where the 96 tasks land
strong.: Execution replay
strong.: Queue & latency
span.: Same model · same requests · same outcomes
span.: Execution trace
h3.: How many requests fit the same compute allowance?
button.: Delivery time
button.: Serving capacity
button.: GPU cost / correct answer
text.xs-label: 3,000 GPU-s available to each runtime
text.xs-title: Baseline
text.xs-title: 306 requests completed
text.xs-title: Optimized
text.xs-title: 382 requests completed
text.xs-label: Baseline count
text.xs-label: Additional requests
text.xs-small: 1 mark = 5 requests
span.xs-focus-label: Requests from the same compute budget
small.: GPU-s
text.xs-label: Baseline
text.xs-label: 306 requests
text.xs-label: Optimized
text.xs-label: 382 requests
text.xs-small: Violet = additional requests
b.: 306 requests
span.: Same request order · cache reuse held fixed
span.xs-focus-note: Busy compute, not a wall-clock deadline
span.: 3,000 GPU-s
time.: 35.3 / 80.5s
span.: 06

## t=50s stage 659/659 doc 1440/1440 secH 900 minFont 7.5
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
strong.: Prefill & decode execution
span.: 05
strong.: Policy × runtime
strong.: Where the 96 tasks land
strong.: Execution replay
strong.: Queue & latency
span.: Same model · same requests · same outcomes
span.: Execution trace
h3.: 1,000 arrivals. Two workers per runtime.
button.: Delivery time
button.: Serving capacity
button.: GPU cost / correct answer
text.xd-title: 1,000 agents
text.xd-subtitle: 1 request each
text.xd-exemplar-label: 1–10
text.xd-subtitle: 100 marks × 10 agents
text.xs-small: FIFO
text.xs-small: dispatcher
text.xs-title: Baseline
text.xs-small: 966 queued
text.xs-small: W1 · A33
text.xs-small: W2 · A34
text.xs-count: 32
tspan.: completed
text.xs-title: Optimized
text.xs-small: 960 queued
text.xs-small: W1 · A39
text.xs-small: W2 · A40
text.xs-count: 38
text.xs-label: 2:57 elapsed
text.xs-label: 2 workers per runtime
span.xs-focus-label: Requests completed by 2:57
small.: baseline
small.: optimized
text.xs-small: 500
text.xs-small: 1000
text.xs-small: 80:47 elapsed
span.: Two workers in each runtime · same cache reuse
span.xs-focus-note: Both runtimes receive the same 1,000 requests
span.: 177 s
time.: 50.3 / 80.5s
span.: 06

## t=65s stage 659/659 doc 1440/1440 secH 900 minFont 7.5
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
strong.: Prefill & decode execution
span.: 05
strong.: Policy × runtime
strong.: Where the 96 tasks land
strong.: Execution replay
strong.: Queue & latency
span.: Same model · same requests · same outcomes
span.: Execution trace
h3.: 1,000 arrivals. Two workers per runtime.
button.: Delivery time
button.: Serving capacity
button.: GPU cost / correct answer
text.xd-title: 1,000 agents
text.xd-subtitle: 1 request each
text.xd-exemplar-label: 1–10
text.xd-subtitle: 100 marks × 10 agents
text.xs-small: FIFO
text.xs-small: dispatcher
text.xs-title: Baseline
text.xs-small: 207 queued
text.xs-small: W1 · A793
text.xs-small: W2 · A791
text.xs-count: 791
tspan.: completed
text.xs-title: Optimized
text.xs-small: 0 queued
text.xs-small: W1 · free
text.xs-small: W2 · free
text.xs-count: 1,000
text.xs-label: 64:37 elapsed
text.xs-label: 2 workers per runtime
span.xs-focus-label: Requests completed by 64:37
small.: baseline
small.: optimized
text.xs-small: 500
text.xs-small: 1000
text.xs-small: 80:47 elapsed
span.: Two workers in each runtime · same cache reuse
span.xs-focus-note: Optimized queue drained · baseline still has 209 requests
span.: 3,877 s
time.: 65.2 / 80.5s
span.: 06

## t=78s stage 659/659 doc 1440/1440 secH 900 minFont 10.0
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
strong.: Prefill & decode execution
span.: 05
strong.: Policy × runtime
strong.: Where the 96 tasks land
strong.: Execution replay
strong.: Queue & latency
span.: Same model · same requests · same outcomes
span.: Execution trace
h3.: GPU cost per correct answer
button.: Delivery time
button.: Serving capacity
button.: GPU cost / correct answer
text.xs-title: Baseline
tspan.xs-label: GPU-s / correct answer
text.xs-title: Optimized
text.xs-label: Quality held fixed · original 96-task cohort
span.xs-focus-label: GPU cost per correct answer
span.: Baseline
strong.: 24.03
span.: Optimized
strong.: 19.29
small.: GPU-s / correct answer
span.: Cache reuse and output quality held fixed
span.xs-focus-note: Original 96 tasks · unchanged correctness
time.: 78.3 / 80.5s
span.: 06
