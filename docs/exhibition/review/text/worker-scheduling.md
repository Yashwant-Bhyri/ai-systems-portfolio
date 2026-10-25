# Worker scheduling

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
time: 0.16 / 28 s
button: Requests arrive
button: Waiting for a worker
button: Processing the input
button: Generating the answer
button: Locate the three costs
span: Same arrivals · same work · 2 workers each
h3: Six requests enter the queue
time: 18.1 s
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
h4: Work & idle accumulation
span: 6 requests · 2 workers
text.sq-small: Σ Computing
text.sq-label: 32.2 s
text.sq-small: Σ Idle with waiting requests
text.sq-label: 4 s
text.sq-small: 137.9 worker-s
text.sq-label: 34.2 s
text.sq-label: 0 s
strong: 4 worker-s removed
small: worker-s removed
p: Red accumulates only while a free worker could start a waiting request.
button: Baseline
button: Optimized
button: Difference
small.sq-ledger-unit: Worker-seconds add time across both workers. Idle without waiting requests is excluded.
time: 4.09 / 35s
button: Admit the next request
button: Follow request 5
button: Compare work and waiting

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
time: 0.16 / 28 s
button: Requests arrive
button: Waiting for a worker
button: Processing the input
button: Generating the answer
button: Locate the three costs
span: Same arrivals · same work · 2 workers each
h3: Request 3 starts as soon as a worker is free
time: 35.61 s
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
h4: Work & idle accumulation
span: 6 requests · 2 workers
text.sq-small: Σ Computing
text.sq-label: 65.1 s
text.sq-small: Σ Idle with waiting requests
text.sq-label: 6.1 s
text.sq-small: 137.9 worker-s
text.sq-label: 69.2 s
text.sq-label: 0 s
strong: 6.1 worker-s removed
small: worker-s removed
p: Red accumulates only while a free worker could start a waiting request.
button: Baseline
button: Optimized
button: Difference
small.sq-ledger-unit: Worker-seconds add time across both workers. Idle without waiting requests is excluded.
time: 12.09 / 35s
button: Admit the next request
button: Follow request 5
button: Compare work and waiting

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
time: 0.16 / 28 s
button: Requests arrive
button: Waiting for a worker
button: Processing the input
button: Generating the answer
button: Locate the three costs
span: Same arrivals · same work · 2 workers each
h3: The same computation, without avoidable waiting
time: 72.45 s
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
h4: Work & idle accumulation
span: 6 requests · 2 workers
text.sq-small: Σ Computing
text.sq-label: 133.2 s
text.sq-small: Σ Idle with waiting requests
text.sq-label: 11.7 s
text.sq-small: 137.9 worker-s
text.sq-label: 137.9 s
text.sq-label: 0 s
strong: 11.7 worker-s removed
small: worker-s removed
p: Red accumulates only while a free worker could start a waiting request.
button: Baseline
button: Optimized
button: Difference
small.sq-ledger-unit: Worker-seconds add time across both workers. Idle without waiting requests is excluded.
time: 22.08 / 35s
button: Admit the next request
button: Follow request 5
button: Compare work and waiting

## at 32s
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
time: 0.16 / 28 s
button: Requests arrive
button: Waiting for a worker
button: Processing the input
button: Generating the answer
button: Locate the three costs
span: Same arrivals · same work · 2 workers each
h3: The same computation, without avoidable waiting
time: 76.32 s
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
h4: Worker utilization comparison
span: 6 requests · 2 workers
text.sq-small: Σ Computing
text.sq-label: 137.9 s
text.sq-small: Σ Idle with waiting requests
text.sq-label: 11.7 s
text.sq-small: 137.9 worker-s
text.sq-label: 0 s
strong: 11.7 worker-s removed
small: worker-s removed
p: 100% less idle time with waiting work
b: 100% less
span: 137.9 worker-s of computation in both.
button: Baseline
button: Optimized
button: Difference
small.sq-ledger-unit: Worker-seconds add time across both workers. Idle without waiting requests is excluded.
time: 32.09 / 35s
button: Admit the next request
button: Follow request 5
button: Compare work and waiting
