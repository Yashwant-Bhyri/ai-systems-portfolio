# Baseline serving

## at 3s
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
time: 0.54 / 28 s
button: Requests arrive
button: Waiting for a worker
button: Processing the input
button: Generating the answer
button: Locate the three costs
time: 8.8 s
text.bo-small: 3 waiting
text.bo-small: Running
text.bo-mono: Request 1
text.bo-mono: Request 2
time: 3.09 / 28 s

## at 9s
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
time: 0.54 / 28 s
button: Requests arrive
button: Waiting for a worker
button: Processing the input
button: Generating the answer
button: Locate the three costs
h3: Request 7 waits 64.32 s while worker 2 sits idle
time: 74.77 s
text.bo-small: 2 waiting
text.bo-small: 5 of 8
text.bo-small: Finished
text.bo-small: Running
text.bo-mono: Request 5
text.bo-small: 4,095 tokens
text.bo-label: 62.77 s since arrival
text.bo-label: Waiting for a worker
text.bo-mono: 62.77 s
span.bo-subtitle: Request 7 · Waiting
h4: Worker 2 is free, but the barrier holds request 7 until its pair finishes
strong: 62.77
span: seconds waiting so far
span: Request 7
span: Worker 2Idle until its pair completes
small: Idle until its pair completes
time: 9.08 / 28 s

## at 18s
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
time: 0.54 / 28 s
button: Requests arrive
button: Waiting for a worker
button: Processing the input
button: Generating the answer
button: Locate the three costs
h3: Request 7 decodes 4,973 tokens, one per step: 13.92 GPU-s
time: 89.91 s
text.bo-small: 0 waiting
text.bo-small: 6 of 8
text.bo-small: Finished
text.bo-small: Running
text.bo-mono: Request 7
text.bo-small: 1,342 tokens
text.bo-mono: Request 8
text.bo-label: 77.91 s since arrival
text.bo-label: 1,342 / 4,973 tokens
text.bo-mono: 64.32 s
text.bo-mono: 9.83 GPU-s
text.bo-mono: 3.76 GPU-s
span.bo-subtitle: Request 7 · Answer generation
h4: Each output token is one decode step on the GPU
strong: 3.76
span: GPU-seconds of answer work
span: 1,342 / 4,973 output tokens
small: / 4,973 output tokens
p: Input processing finishes before output tokens begin.
time: 18.08 / 28 s

## at 26s
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
time: 0.54 / 28 s
button: Requests arrive
button: Waiting for a worker
button: Processing the input
button: Generating the answer
button: Locate the three costs
h3: Request 7 = 64.32 s waiting + 23.75 GPU-s of work
time: 100.08 s
text.bo-small: 0 waiting
text.bo-small: 7 of 8
text.bo-small: Finished
text.bo-small: Running
text.bo-mono: Available
text.bo-mono: Request 8
text.bo-small: 4,973 tokens
text.bo-label: 88.08 s since arrival
text.bo-label: Answer complete ✓
text.bo-mono: 64.32 s
text.bo-mono: 9.83 GPU-s
text.bo-mono: 13.92 GPU-s
span.bo-subtitle: Request 7 · baseline accounting
h4: Scheduling removes waiting; reuse and kernels remove work
b: 64.32 s
span: GPU work
b: 23.75 GPU-s
span: Response time
b: 88.08 s
p: Scheduling changes the wait. Reuse and execution rates change the work.
time: 26.09 / 28 s
