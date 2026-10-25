# Combined runtime gains

## at 4s
h3: Baseline serving: 8 requests, 2 workers, one batch barrier
span: First 8 of 96 requests · 2 workers · unchanged model
time: 0 s
text.bo-section: Request queue
text.bo-section: Baseline execution
text.bo-section: Completed
text.bo-small: 1 waiting
text.bo-small: Start the next pair when both workers are free
text.bo-small: 0 of 8
text.bo-label: Req 1
text.bo-small: Queued
text.bo-label: Req 2
text.bo-small: 2 s
text.bo-label: Req 3
text.bo-small: 4 s
text.bo-label: Req 4
text.bo-small: 6 s
text.bo-label: Req 5
text.bo-small: 8 s
text.bo-label: Req 6
text.bo-small: 10 s
text.bo-label: Req 7
text.bo-small: 12 s
text.bo-label: Req 8
text.bo-small: 14 s
text.bo-label: Worker 1
text.bo-mono: Idle · request waiting
text.bo-small: Prefill
text.bo-small: Decode
text.bo-small: 0 tokens
text: Waiting for the pair
text.bo-label: Worker 2
text.bo-section: Request 7
text.bo-label: 0 s since arrival
text.bo-label: Not arrived
text.bo-small: Waiting
text.bo-mono: 0 s
text.bo-mono: 0 GPU-s
text.bo-small: Waiting time + input processing + answer generation = response time
span.bo-subtitle: Two workers share the workload
h4: Two requests run at once; the rest queue
span: Waiting
span: Running
span: Completed
p: Only two requests can run at once. Later arrivals wait in the queue.
time: 0.1 / 28 s
button: Requests arrive
button: Waiting for a worker
button: Processing the input
button: Generating the answer
button: Locate the three costs
h3: Scheduling reduces queue time
span: Request 7 · 8,192 input tokens · 4,973 output tokens
text.rg-axis: Waiting before execution
text.rg-small: Seconds per request
text.rg-axis: GPU work per request
text.rg-small: Input processing + answer generation · GPU-s
text.rg-row-label: Baseline serving
text.rg-number: 64.32 s waiting
text.rg-small: Input 9.83 + output 13.92
text.rg-total: 23.75
text.rg-row-label: + Worker scheduling
text.rg-number: 64.31 s waiting
text.rg-row-label: + KV prefix reuse
text.rg-row-label: + Faster execution
text.rg-number: Δ 0.02 s
text.rg-axis: Same task identities
text.rg-small: Request 7 stays in the cohort
text.rg-number: 96 requests
text.rg-small: 90 reused prefixes
text.rg-axis: GPU cost per correct answer
text.rg-small: All (input + output) work ÷ 67 correct outcomes · GPU-s
text.rg-total: 36.61
text.rg-small: Same GPU work; less waiting
text.rg-total: 24.03
text.rg-number: −12.59 from prefix reuse
text.rg-total: 19.29
span.rg-context: Request 7 · cumulative interventions
h4: Admit the next request sooner
text: Worker 1
text: Worker 2
text: Next request
span: 64.32Baseline wait
small: Baseline wait
span: 64.31Scheduled wait
small: Scheduled wait
b: Δ 0.02
span: seconds less waiting
p: 23.75 GPU-s of computation is unchanged.
time: 4.08 / 38 s
button: Baseline costs
button: Worker scheduling
button: KV prefix reuse
button: Execution rates
button: All 96 requests
button: Combined reduction
summary: Inspect contribution accounting
p: These are ordered comparisons of the existing scenario, not independent percentages added together. Request 7 retains its arrival, logical input, output count and outcome. The request view separates queue seconds from GPU busy-work. The cohort view sums work across all 96 requests, including unsuccessful requests, and divides by the same 67 correct outcomes. Prefix warm-up is charged; only ready matches are reused. Execution changes the declared prefill/decode rates, with cache outcomes held fixed. Scheduling can change downstream waiting, but that waiting is not GPU work. Rates are scenario assumptions, not measured kernel speedups. Morphing bars interpolate between conditions, not device telemetry.
button: Explore result figures ↗

## at 12s
h3: Baseline serving: 8 requests, 2 workers, one batch barrier
span: First 8 of 96 requests · 2 workers · unchanged model
time: 0 s
text.bo-section: Request queue
text.bo-section: Baseline execution
text.bo-section: Completed
text.bo-small: 1 waiting
text.bo-small: Start the next pair when both workers are free
text.bo-small: 0 of 8
text.bo-label: Req 1
text.bo-small: Queued
text.bo-label: Req 2
text.bo-small: 2 s
text.bo-label: Req 3
text.bo-small: 4 s
text.bo-label: Req 4
text.bo-small: 6 s
text.bo-label: Req 5
text.bo-small: 8 s
text.bo-label: Req 6
text.bo-small: 10 s
text.bo-label: Req 7
text.bo-small: 12 s
text.bo-label: Req 8
text.bo-small: 14 s
text.bo-label: Worker 1
text.bo-mono: Idle · request waiting
text.bo-small: Prefill
text.bo-small: Decode
text.bo-small: 0 tokens
text: Waiting for the pair
text.bo-label: Worker 2
text.bo-section: Request 7
text.bo-label: 0 s since arrival
text.bo-label: Not arrived
text.bo-small: Waiting
text.bo-mono: 0 s
text.bo-mono: 0 GPU-s
text.bo-small: Waiting time + input processing + answer generation = response time
span.bo-subtitle: Two workers share the workload
h4: Two requests run at once; the rest queue
span: Waiting
span: Running
span: Completed
p: Only two requests can run at once. Later arrivals wait in the queue.
time: 0.1 / 28 s
button: Requests arrive
button: Waiting for a worker
button: Processing the input
button: Generating the answer
button: Locate the three costs
h3: Prefix reuse removes input work
span: Request 7 · 8,192 input tokens · 4,973 output tokens
text.rg-axis: Waiting before execution
text.rg-small: Seconds per request
text.rg-axis: GPU work per request
text.rg-small: Input processing + answer generation · GPU-s
text.rg-row-label: Baseline serving
text.rg-number: 64.32 s waiting
text.rg-small: Input 9.83 + output 13.92
text.rg-total: 23.75
text.rg-row-label: + Worker scheduling
text.rg-number: 56.67 s waiting
text.rg-row-label: + KV prefix reuse
text.rg-small: Input 7.05 + output 13.92
text.rg-total: 20.97
text.rg-row-label: + Faster execution
text.rg-number: Δ 2.78 GPU-s
text.rg-axis: Same task identities
text.rg-small: Request 7 stays in the cohort
text.rg-number: 96 requests
text.rg-small: 90 reused prefixes
text.rg-axis: GPU cost per correct answer
text.rg-small: All (input + output) work ÷ 67 correct outcomes · GPU-s
text.rg-total: 36.61
text.rg-small: Same GPU work; less waiting
text.rg-total: 24.03
text.rg-number: −12.59 from prefix reuse
text.rg-total: 19.29
span.rg-context: Request 7 · cumulative interventions
h4: Reuse the context; compute the suffix
text: Ready KV pages
text: Suffix
text: New prefill
span: 23.75Before reuse
small: Before reuse
span: 20.97With reuse
small: With reuse
b: Δ 2.78
span: GPU-seconds less work
p: 7,808 input tokens do not need another prefill.
time: 12.08 / 38 s
button: Baseline costs
button: Worker scheduling
button: KV prefix reuse
button: Execution rates
button: All 96 requests
button: Combined reduction
summary: Inspect contribution accounting
p: These are ordered comparisons of the existing scenario, not independent percentages added together. Request 7 retains its arrival, logical input, output count and outcome. The request view separates queue seconds from GPU busy-work. The cohort view sums work across all 96 requests, including unsuccessful requests, and divides by the same 67 correct outcomes. Prefix warm-up is charged; only ready matches are reused. Execution changes the declared prefill/decode rates, with cache outcomes held fixed. Scheduling can change downstream waiting, but that waiting is not GPU work. Rates are scenario assumptions, not measured kernel speedups. Morphing bars interpolate between conditions, not device telemetry.
button: Explore result figures ↗

## at 22s
h3: Baseline serving: 8 requests, 2 workers, one batch barrier
span: First 8 of 96 requests · 2 workers · unchanged model
time: 0 s
text.bo-section: Request queue
text.bo-section: Baseline execution
text.bo-section: Completed
text.bo-small: 1 waiting
text.bo-small: Start the next pair when both workers are free
text.bo-small: 0 of 8
text.bo-label: Req 1
text.bo-small: Queued
text.bo-label: Req 2
text.bo-small: 2 s
text.bo-label: Req 3
text.bo-small: 4 s
text.bo-label: Req 4
text.bo-small: 6 s
text.bo-label: Req 5
text.bo-small: 8 s
text.bo-label: Req 6
text.bo-small: 10 s
text.bo-label: Req 7
text.bo-small: 12 s
text.bo-label: Req 8
text.bo-small: 14 s
text.bo-label: Worker 1
text.bo-mono: Idle · request waiting
text.bo-small: Prefill
text.bo-small: Decode
text.bo-small: 0 tokens
text: Waiting for the pair
text.bo-label: Worker 2
text.bo-section: Request 7
text.bo-label: 0 s since arrival
text.bo-label: Not arrived
text.bo-small: Waiting
text.bo-mono: 0 s
text.bo-mono: 0 GPU-s
text.bo-small: Waiting time + input processing + answer generation = response time
span.bo-subtitle: Two workers share the workload
h4: Two requests run at once; the rest queue
span: Waiting
span: Running
span: Completed
p: Only two requests can run at once. Later arrivals wait in the queue.
time: 0.1 / 28 s
button: Requests arrive
button: Waiting for a worker
button: Processing the input
button: Generating the answer
button: Locate the three costs
h3: Faster prefill and decode
span: Request 7 · 8,192 input tokens · 4,973 output tokens
text.rg-axis: Waiting before execution
text.rg-small: Seconds per request
text.rg-axis: GPU work per request
text.rg-small: Input processing + answer generation · GPU-s
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
text.rg-axis: Same task identities
text.rg-small: Request 7 stays in the cohort
text.rg-number: 96 requests
text.rg-small: 90 reused prefixes
text.rg-axis: GPU cost per correct answer
text.rg-small: All (input + output) work ÷ 67 correct outcomes · GPU-s
text.rg-total: 36.61
text.rg-small: Same GPU work; less waiting
text.rg-total: 24.03
text.rg-number: −12.59 from prefix reuse
text.rg-total: 19.29
span.rg-context: Request 7 · cumulative interventions
h4: Lower the cost of every remaining token
span: Input token1.20 → 0.95 ms
strong: 1.20 → 0.95 ms
small: ms
span: Output token2.80 → 2.25 ms
strong: 2.80 → 2.25 ms
span: 14.39Before rate change
small: Before rate change
span: 11.55Faster rates
small: Faster rates
b: Δ 2.83
span: GPU-seconds less work
p: 4,973 output tokens, with the same task outcome.
time: 22.08 / 38 s
button: Baseline costs
button: Worker scheduling
button: KV prefix reuse
button: Execution rates
button: All 96 requests
button: Combined reduction
summary: Inspect contribution accounting
p: These are ordered comparisons of the existing scenario, not independent percentages added together. Request 7 retains its arrival, logical input, output count and outcome. The request view separates queue seconds from GPU busy-work. The cohort view sums work across all 96 requests, including unsuccessful requests, and divides by the same 67 correct outcomes. Prefix warm-up is charged; only ready matches are reused. Execution changes the declared prefill/decode rates, with cache outcomes held fixed. Scheduling can change downstream waiting, but that waiting is not GPU work. Rates are scenario assumptions, not measured kernel speedups. Morphing bars interpolate between conditions, not device telemetry.
button: Explore result figures ↗

## at 34s
h3: Baseline serving: 8 requests, 2 workers, one batch barrier
span: First 8 of 96 requests · 2 workers · unchanged model
time: 0 s
text.bo-section: Request queue
text.bo-section: Baseline execution
text.bo-section: Completed
text.bo-small: 1 waiting
text.bo-small: Start the next pair when both workers are free
text.bo-small: 0 of 8
text.bo-label: Req 1
text.bo-small: Queued
text.bo-label: Req 2
text.bo-small: 2 s
text.bo-label: Req 3
text.bo-small: 4 s
text.bo-label: Req 4
text.bo-small: 6 s
text.bo-label: Req 5
text.bo-small: 8 s
text.bo-label: Req 6
text.bo-small: 10 s
text.bo-label: Req 7
text.bo-small: 12 s
text.bo-label: Req 8
text.bo-small: 14 s
text.bo-label: Worker 1
text.bo-mono: Idle · request waiting
text.bo-small: Prefill
text.bo-small: Decode
text.bo-small: 0 tokens
text: Waiting for the pair
text.bo-label: Worker 2
text.bo-section: Request 7
text.bo-label: 0 s since arrival
text.bo-label: Not arrived
text.bo-small: Waiting
text.bo-mono: 0 s
text.bo-mono: 0 GPU-s
text.bo-small: Waiting time + input processing + answer generation = response time
span.bo-subtitle: Two workers share the workload
h4: Two requests run at once; the rest queue
span: Waiting
span: Running
span: Completed
p: Only two requests can run at once. Later arrivals wait in the queue.
time: 0.1 / 28 s
button: Requests arrive
button: Waiting for a worker
button: Processing the input
button: Generating the answer
button: Locate the three costs
h3: Combined GPU-cost reduction
span: 96 matched requests · unchanged checkpoint and outputs
text.rg-axis: Waiting before execution
text.rg-small: Seconds per request
text.rg-axis: GPU work per request
text.rg-small: Input processing + answer generation · GPU-s
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
text.rg-axis: Same task identities
text.rg-small: Request 7 stays in the cohort
text.rg-number: 96 requests
text.rg-small: 90 reused prefixes
text.rg-axis: GPU cost per correct answer
text.rg-small: All (input + output) work ÷ 67 correct outcomes · GPU-s
text.rg-total: 36.61
text.rg-small: Same GPU work; less waiting
text.rg-total: 24.03
text.rg-number: −12.59 from prefix reuse
text.rg-total: 19.29
text.rg-number: −4.74
text.rg-number: −12.59
text.rg-number: Δ 17.32 GPU-s / correct answer
span.rg-context: Whole-workload accounting
h4: Two compute savings, one total
span: Prefix reuse −12.59
b: −12.59
span: Faster execution −4.74
b: −4.74
span.rg-sum-total: Total reduction −17.32
b: −17.32
small: GPU-s per correct answer
span: 36.61
strong: 19.29
p: 47.31% less GPU work per correct answer. Scheduling also reduced waiting; it is not added to this compute saving.
b: 47.31% less GPU work
time: 34.07 / 38 s
button: Baseline costs
button: Worker scheduling
button: KV prefix reuse
button: Execution rates
button: All 96 requests
button: Combined reduction
summary: Inspect contribution accounting
p: These are ordered comparisons of the existing scenario, not independent percentages added together. Request 7 retains its arrival, logical input, output count and outcome. The request view separates queue seconds from GPU busy-work. The cohort view sums work across all 96 requests, including unsuccessful requests, and divides by the same 67 correct outcomes. Prefix warm-up is charged; only ready matches are reused. Execution changes the declared prefill/decode rates, with cache outcomes held fixed. Scheduling can change downstream waiting, but that waiting is not GPU work. Rates are scenario assumptions, not measured kernel speedups. Morphing bars interpolate between conditions, not device telemetry.
button: Explore result figures ↗
