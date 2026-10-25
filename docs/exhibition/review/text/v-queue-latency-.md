# Queue & latency 1440x900

## t=4s stage 659/659 doc 1440/1440 secH 900 minFont 8.8
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
strong.: Queue & latency
mark.: 1,081 → 445
small.: s · p95 response
span.rs-status: One cohort · 96 tasks
button.: Interactive
button.: Shared-prefix burst
span.lab-control-label: Model checkpoint
button.: Base
button.: Post-trained · SFT + RL
span.: Same arrivals · two workers per runtime
h3.: Request arrivals & admission
small.: s · workload clock
text.ll-lane-title: Baseline
text.ll-small: 42 arrived
text.ll-label: 34 waiting
text.ll-small: Worker 1
text.ll-worker-label: Request 8
text.ll-small: Worker 2
text.ll-worker-label: Request 7
tspan.ll-small: / 96
text.ll-small: completed
text.ll-lane-title: Optimized
text.ll-label: 30 waiting
text.ll-worker-label: Request 12
text.ll-worker-label: Request 10
text.ll-label: Requests waiting for a worker
text.ll-small: 39
text.ll-small: 78
text.ll-small: 0 s
text.ll-small: 308 s
text.ll-small: 616 s
text.ll-small: 924 s
text.ll-small: 1,233 s
text.ll-axis: Elapsed workload time
span.ll-result-label: 42 of 96 requests arrived
h4.: Requests waiting for a worker
span.: Baseline
small.: requests
span.: Optimized
b.cx-hero-num: Δ 4
span.cx-hero-unit: fewer requests waiting
p.ll-explanation: Ready-prefix reuse and faster execution release workers sooner.
time.: 5 / 49 s
button.: Request arrivals
button.: Queue buildup
button.: Workload completion
button.: Latency ranking
button.: Scan every rank
button.: p95 comparison

## t=16s stage 659/659 doc 1440/1440 secH 900 minFont 8.8
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
strong.: Queue & latency
mark.: 1,081 → 445
small.: s · p95 response
span.rs-status: One cohort · 96 tasks
button.: Interactive
button.: Shared-prefix burst
span.lab-control-label: Model checkpoint
button.: Base
button.: Post-trained · SFT + RL
span.: Same arrivals · two workers per runtime
h3.: Drain the request queue
small.: s · workload clock
text.ll-lane-title: Baseline
text.ll-small: 96 arrived
text.ll-label: 45 waiting
text.ll-small: Worker 1
text.ll-worker-label: Request 50
text.ll-small: Worker 2
text.ll-worker-label: Request 51
tspan.ll-small: / 96
text.ll-small: completed
text.ll-lane-title: Optimized
text.ll-label: 3 waiting
text.ll-worker-label: Request 92
text.ll-worker-label: Request 93
text.ll-label: Requests waiting for a worker
text.ll-small: Last request arrives
text.ll-small: Queue falls as workers start requests
text.ll-small: 39
text.ll-small: 78
text.ll-small: 0 s
text.ll-small: 308 s
text.ll-small: 616 s
text.ll-small: 924 s
text.ll-small: 1,233 s
text.ll-axis: Elapsed workload time
span.ll-result-label: 96 of 96 requests arrived
h4.: Requests still waiting
span.: Baseline
small.: requests
span.: Optimized
b.cx-hero-num: Δ 42
span.cx-hero-unit: fewer requests waiting
p.ll-explanation: No new arrivals. Each downward step means a waiting request began execution, not a loss of throughput.
time.: 17 / 49 s
button.: Request arrivals
button.: Queue buildup
button.: Workload completion
button.: Latency ranking
button.: Scan every rank
button.: p95 comparison

## t=28s stage 659/659 doc 1440/1440 secH 900 minFont 8.8
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
strong.: Queue & latency
mark.: 1,081 → 445
small.: s · p95 response
span.rs-status: One cohort · 96 tasks
button.: Interactive
button.: Shared-prefix burst
span.lab-control-label: Model checkpoint
button.: Base
button.: Post-trained · SFT + RL
span.: Same arrivals · two workers per runtime
h3.: Rank response latency
small.: s · workload clock
text.ll-chart-title: Order each run from fastest to slowest
text.ll-small: Each point keeps its request identity as it moves.
text.ll-small: 287
text.ll-small: 573
text.ll-small: 860
text.ll-small: 1,147
text.ll-small: 24
text.ll-small: 48
text.ll-small: 72
text.ll-small: 96
text.ll-axis: Arrival order → latency rank
text.ll-axis: Arrival → completion (seconds)
span.ll-result-label: 96 completed responses per run
h4.: Arrange by time to finish.
span.: Fastest
span.: Slowest
p.ll-explanation: Each run gets its own order. Then compare the same rank.
time.: 28.9 / 49 s
button.: Request arrivals
button.: Queue buildup
button.: Workload completion
button.: Latency ranking
button.: Scan every rank
button.: p95 comparison

## t=40s stage 659/659 doc 1440/1440 secH 900 minFont 8.8
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
strong.: Queue & latency
mark.: 1,081 → 445
small.: s · p95 response
span.rs-status: One cohort · 96 tasks
button.: Interactive
button.: Shared-prefix burst
span.lab-control-label: Model checkpoint
button.: Base
button.: Post-trained · SFT + RL
span.: Same arrivals · two workers per runtime
h3.: Scan every rank: the gap widens toward the slow tail
small.: s · workload clock
text.ll-chart-title: Rank 54 of 96: 316 s apart
text.ll-small: Shaded: time saved at every rank the cursor has passed.
text.ll-small: 287
text.ll-small: 573
text.ll-small: 860
text.ll-small: 1,147
text.ll-small: rank 54
text.ll-scan-delta: Δ 316 s
text.ll-small: 24
text.ll-small: 48
text.ll-small: 72
text.ll-small: 96
text.ll-axis: Latency rank · fastest → slowest
text.ll-axis: Arrival → completion (seconds)
span.ll-result-label: Rank 54 / 96 · same rank in both runs
h4.: Latency at this rank
span.: Baseline
small.ll-request-id: Request 54
span.: Optimized
small.ll-request-id: Request 55
b.cx-hero-num: Δ 316.1
span.cx-hero-unit: s faster response
p.ll-explanation: Fast responses barely change; the slowest waited longest for a worker, so they gain the most.
button.: p50
button.: p95
button.: p99
time.: 40.9 / 49 s
button.: Request arrivals
button.: Queue buildup
button.: Workload completion
button.: Latency ranking
button.: Scan every rank
button.: p95 comparison

## t=50s stage 659/659 doc 1440/1440 secH 900 minFont 8.8
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
strong.: Queue & latency
mark.: 1,081 → 445
small.: s · p95 response
span.rs-status: One cohort · 96 tasks
button.: Interactive
button.: Shared-prefix burst
span.gc-tag: p50 · median response
span.lab-control-label: Model checkpoint
button.: Base
button.: Post-trained · SFT + RL
span.: Same arrivals · two workers per runtime
h3.: Compare p50 response latency
small.: s · workload clock
text.ll-chart-title: Rank 48 of 96
text.ll-small: Amber points take longer than their run’s selected boundary.
text.ll-small: 287
text.ll-small: 573
text.ll-small: 860
text.ll-small: 1,147
text.ll-small: selected rank ↓
text.ll-small: 24
text.ll-small: 48
text.ll-small: 72
text.ll-small: 96
text.ll-axis: Latency rank · fastest → slowest
text.ll-axis: Arrival → completion (seconds)
span.ll-result-label: 50th percentile · rank 48 / 96
h4.: Arrival-to-completion latency
span.: Baseline
small.ll-request-id: Request 48
span.: Optimized
b.cx-hero-num: Δ 275.5
span.cx-hero-unit: s faster response
p.ll-explanation: In each run, 48 of 96 responses finish within its boundary. The 48 amber points take longer.
button.: p50
button.: p95
button.: p99
time.: 49 / 49 s
button.: Request arrivals
button.: Queue buildup
button.: Workload completion
button.: Latency ranking
button.: Scan every rank
button.: p95 comparison
