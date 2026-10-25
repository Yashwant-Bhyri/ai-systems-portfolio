# Worker scheduling 1440x900

## t=4s stage 659/659 doc 1440/1440 secH 900 minFont 9.7
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
strong.: Worker scheduling
span.: 03
span.: 04
span.: 05
strong.: Policy × runtime
strong.: Where the 96 tasks land
strong.: Execution replay
strong.: Queue & latency
span.: Same arrivals · same work · 2 workers each
h3.: Six requests enter the queue
time.: 19 s
text.sq-label: Request 1
text.sq-small: arrives 0s
text.sq-label: Request 2
text.sq-small: arrives 2s
text.sq-label: Request 3
text.sq-small: arrives 4s
text.sq-label: Request 4
text.sq-small: arrives 6s
text.sq-label: Request 5
text.sq-small: arrives 8s
text.sq-label: Request 6
text.sq-small: arrives 10s
text.sq-title: Baseline
text.sq-small: Wait for both workers
text.sq-small: 0 requests done · 4 queued
text.sq-label: W1
text.sq-label: W2
text.sq-task-label: R1
text.sq-task-label: R2
text.sq-task-label: R3
text.sq-task-label: R4
text.sq-task-label: R5
text.sq-task-label: R6
text.sq-small: W1 executing request 1 · W2 executing request 2
text.sq-title: Optimized
text.sq-small: Start when a worker is free
text.sq-small: 0s
text.sq-small: 19.08s
text.sq-small: 38.16s
text.sq-small: 57.24s
text.sq-small: 76.32s
text.sq-label: Red = idle with requests waiting · R = request
h4.: Work & idle accumulation
span.: 6 requests · 2 workers
text.sq-small: Σ Computing
text.sq-label: 34 s
text.sq-small: Σ Idle with waiting requests
text.sq-label: 4 s
text.sq-small: 137.9 worker-s
text.sq-label: 36 s
text.sq-label: 0 s
small.: worker-s removed
p.: Red accumulates only while a free worker could start a waiting request.
button.: Baseline
button.: Optimized
button.: Difference
small.sq-ledger-unit: Worker-seconds add time across both workers. Idle without waiting requests is excluded.
time.: 4.25 / 35s
button.: Requests arrive
button.: Admit the next request
button.: Follow request 5
button.: Compare work and waiting

## t=12s stage 659/659 doc 1440/1440 secH 900 minFont 9.7
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
strong.: Worker scheduling
span.: 03
span.: 04
span.: 05
strong.: Policy × runtime
strong.: Where the 96 tasks land
strong.: Execution replay
strong.: Queue & latency
span.: Same arrivals · same work · 2 workers each
h3.: Request 3 starts as soon as a worker is free
time.: 36.27 s
text.sq-label: Request 1
text.sq-small: arrives 0s
text.sq-label: Request 2
text.sq-small: arrives 2s
text.sq-label: Request 3
text.sq-small: arrives 4s
text.sq-label: Request 4
text.sq-small: arrives 6s
text.sq-label: Request 5
text.sq-small: arrives 8s
text.sq-label: Request 6
text.sq-small: arrives 10s
text.sq-title: Baseline
text.sq-small: Wait for both workers
text.sq-small: 2 requests done · 2 queued
text.sq-label: W1
text.sq-label: W2
text.sq-task-label: R1 ✓
text.sq-task-label: R2 ✓
text.sq-task-label: R3
text.sq-task-label: R4
text.sq-task-label: R5
text.sq-task-label: R6
text.sq-small: W1 executing request 3 · W2 executing request 4
text.sq-title: Optimized
text.sq-small: Start when a worker is free
text.sq-small: W2 executing request 3 · W1 executing request 4
text.sq-small: 0s
text.sq-small: 19.08s
text.sq-small: 38.16s
text.sq-small: 57.24s
text.sq-small: 76.32s
text.sq-label: Red = idle with requests waiting · R = request
h4.: Work & idle accumulation
span.: 6 requests · 2 workers
text.sq-small: Σ Computing
text.sq-label: 66.4 s
text.sq-small: Σ Idle with waiting requests
text.sq-label: 6.1 s
text.sq-small: 137.9 worker-s
text.sq-label: 70.5 s
text.sq-label: 0 s
small.: worker-s removed
p.: Red accumulates only while a free worker could start a waiting request.
button.: Baseline
button.: Optimized
button.: Difference
small.sq-ledger-unit: Worker-seconds add time across both workers. Idle without waiting requests is excluded.
time.: 12.2 / 35s
button.: Requests arrive
button.: Admit the next request
button.: Follow request 5
button.: Compare work and waiting

## t=22s stage 659/659 doc 1440/1440 secH 900 minFont 9.7
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
strong.: Worker scheduling
span.: 03
span.: 04
span.: 05
strong.: Policy × runtime
strong.: Where the 96 tasks land
strong.: Execution replay
strong.: Queue & latency
span.: Same arrivals · same work · 2 workers each
h3.: The same computation, without avoidable waiting
time.: 72.9 s
text.sq-label: Request 1
text.sq-small: arrives 0s
text.sq-label: Request 2
text.sq-small: arrives 2s
text.sq-label: Request 3
text.sq-small: arrives 4s
text.sq-label: Request 4
text.sq-small: arrives 6s
text.sq-label: Request 5
text.sq-small: arrives 8s
text.sq-label: Request 6
text.sq-small: arrives 10s
text.sq-title: Baseline
text.sq-small: Wait for both workers
text.sq-small: 4 requests done · 0 queued
text.sq-label: W1
text.sq-label: W2
text.sq-task-label: R1 ✓
text.sq-task-label: R2 ✓
text.sq-task-label: R3 ✓
text.sq-task-label: R4 ✓
text.sq-task-label: R5
text.sq-task-label: R6
text.sq-small: W1 executing request 5 · W2 executing request 6
text.sq-title: Optimized
text.sq-small: Start when a worker is free
text.sq-small: 6 requests done · 0 queued
text.sq-task-label: R5 ✓
text.sq-task-label: R6 ✓
text.sq-small: 6 requests delivered
text.sq-small: 0s
text.sq-small: 19.08s
text.sq-small: 38.16s
text.sq-small: 57.24s
text.sq-small: 76.32s
text.sq-label: Red = idle with requests waiting · R = request
h4.: Work & idle accumulation
span.: 6 requests · 2 workers
text.sq-small: Σ Computing
text.sq-label: 134.1 s
text.sq-small: Σ Idle with waiting requests
text.sq-label: 11.7 s
text.sq-small: 137.9 worker-s
text.sq-label: 137.9 s
text.sq-label: 0 s
small.: worker-s removed
p.: Red accumulates only while a free worker could start a waiting request.
button.: Baseline
button.: Optimized
button.: Difference
small.sq-ledger-unit: Worker-seconds add time across both workers. Idle without waiting requests is excluded.
time.: 22.25 / 35s
button.: Requests arrive
button.: Admit the next request
button.: Follow request 5
button.: Compare work and waiting

## t=33s stage 659/680 OVERFLOW doc 1440/1440 secH 900 minFont 9.7
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
strong.: Worker scheduling
span.: 03
span.: 04
span.: 05
strong.: Policy × runtime
strong.: Where the 96 tasks land
strong.: Execution replay
strong.: Queue & latency
span.: Same arrivals · same work · 2 workers each
h3.: The same computation, without avoidable waiting
time.: 76.32 s
text.sq-label: Request 1
text.sq-small: arrives 0s
text.sq-label: Request 2
text.sq-small: arrives 2s
text.sq-label: Request 3
text.sq-small: arrives 4s
text.sq-label: Request 4
text.sq-small: arrives 6s
text.sq-label: Request 5
text.sq-small: arrives 8s
text.sq-label: Request 6
text.sq-small: arrives 10s
text.sq-title: Baseline
text.sq-small: Wait for both workers
text.sq-small: 6 requests done · 0 queued
text.sq-label: W1
text.sq-label: W2
text.sq-task-label: R1 ✓
text.sq-task-label: R2 ✓
text.sq-task-label: R3 ✓
text.sq-task-label: R4 ✓
text.sq-task-label: R5 ✓
text.sq-task-label: R6 ✓
text.sq-small: 6 requests delivered
text.sq-title: Optimized
text.sq-small: Start when a worker is free
text.sq-small: 0s
text.sq-small: 19.08s
text.sq-small: 38.16s
text.sq-small: 57.24s
text.sq-small: 76.32s
text.sq-label: Red = idle with requests waiting · R = request
h4.: Worker utilization comparison
span.: 6 requests · 2 workers
text.sq-small: Σ Computing
text.sq-label: 137.9 s
text.sq-small: Σ Idle with waiting requests
text.sq-label: 11.7 s
text.sq-small: 137.9 worker-s
text.sq-label: 0 s
small.: worker-s removed
b.: 100% less
span.: 137.9 worker-s of computation in both.
button.: Baseline
button.: Optimized
button.: Difference
small.sq-ledger-unit: Worker-seconds add time across both workers. Idle without waiting requests is excluded.
time.: 33.16 / 35s
button.: Requests arrive
button.: Admit the next request
button.: Follow request 5
button.: Compare work and waiting
