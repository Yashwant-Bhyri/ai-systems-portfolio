# Prefill & decode execution

## at 5s
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
time: 0.51 / 28 s
button: Requests arrive
button: Waiting for a worker
button: Processing the input
button: Generating the answer
button: Locate the three costs
span: Same model · same requests · same outcomes
span: Execution trace
h3: Request execution
button: Delivery time
button: Serving capacity
button: GPU cost / correct answer
text.em-lane-name: Baseline
text.em-mono: 3,219 / 4,973 tokens
text.em-small: WEIGHTS / KV STATE
text.em-small: same checkpoint + context
text.em-small: read → compute → project
text.em-small: OUTPUT SEQUENCE
text.em-small: group 21 of 32 · decode
text.em-lane-name: Optimized
text.em-mono: 4,049 / 4,973 tokens
text.em-small: group 27 of 32 · decode
text.em-small: ELAPSED TIME
text.em-mono: 9.48 s
text.em-small: 14.39 s
text.em-small: Prefill + decode execution · one worker per lane
summary: Inspect the machine
button: Read state
button: Execute
button: Emit tokens
button: Compare clocks
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
text.xs-label: 9.5 s elapsed
span.xs-focus-label: Time to finish 1 requests
text.xs-label: 14.4 s
text.xs-label: 11.6 s
text.xs-small: Violet = time saved
p.xs-callout: Δ 2.8 s earlier19.7% less elapsed time for the same 1 requests
b: Δ 2.8 s earlier
span.xs-cause: Faster prefill + decode executionCache reuse held fixed
span: Cache reuse held fixed
span.xs-focus-note: One worker per runtime · no extra workers added
text.xs-label: 100 GPU-s available to each runtime
text.xs-title: Baseline
text.xs-title: 13 requests completed
text.xs-title: Optimized
text.xs-title: 15 requests completed
text.xs-label: Baseline count
text.xs-label: Additional requests
text.xs-small: 1 mark = 5 requests
span.xs-focus-label: Requests from the same compute budget
strong.xs-allowance-number: 100 GPU-s
small: GPU-s
text.xs-label: 13 requests
text.xs-label: 15 requests
text.xs-small: Violet = additional requests
p.xs-callout: Δ +2 requests15.4% more completed with 100 GPU-s
b: Δ +2 requests
span.xs-cause: Faster prefill + decode executionSame request order · cache reuse held fixed
span: Same request order · cache reuse held fixed
span.xs-focus-note: Busy compute, not a wall-clock deadline
text.xd-title: 10 agents in view
text.xd-subtitle: 1 request each
text.xd-id: A01
text.xd-id: A02
text.xd-id: A03
text.xd-id: A04
text.xd-id: A05
text.xd-id: A06
text.xd-id: A07
text.xd-id: A08
text.xd-id: A09
text.xd-id: A10
text.xd-subtitle: Intake
text.xd-equation: 10 agents → 10 requests
text.xs-small: FIFO
text.xs-small: dispatcher
text.xs-small: 998 queued
text.xs-small: W1 · A1
text.xs-small: W2 · A2
text.xs-small: requestscompleted
text.xs-label: 0:00 elapsed
text.xs-label: 2 workers per runtime
span: Same demand. Two runtimes.
p: One request per agent.
p: Zoom out to see the full arrival burst.
text.xs-count: 24.03 GPU-s / correct answer
text.xs-count: 19.29 GPU-s / correct answer
text.xs-label: Quality held fixed · original 96-task cohort
span.xs-focus-label: GPU cost per correct answer
span: Baseline
strong: 24.03
span: Optimized
strong: 19.29
small: GPU-s / correct answer
p.xs-callout: Δ 4.74 GPU-s19.7% less GPU work per correct answer
b: Δ 4.74 GPU-s
span.xs-cause: Faster prefill + decode executionCache reuse and output quality held fixed
span: Cache reuse and output quality held fixed
span.xs-focus-note: Original 96 tasks · unchanged correctness
time: 5.1 / 80.5s
button: 01Same request
span: 01
button: 02Expose the gap
span: 02
button: 03Follow the next requests
span: 03
button: 04Hold compute fixed
span: 04
button: 05Serve 1,000 agents
span: 05
button: 06Compare GPU cost
span: 06

## at 20s
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
time: 0.51 / 28 s
button: Requests arrive
button: Waiting for a worker
button: Processing the input
button: Generating the answer
button: Locate the three costs
span: Same model · same requests · same outcomes
span: Execution trace
h3: Delivery time for twelve requests
span.xs-speed: Request-order waterfall
button: Delivery time
button: Serving capacity
button: GPU cost / correct answer
text.em-lane-name: Baseline
text.em-mono: ✓ answer complete
text.em-small: WEIGHTS / KV STATE
text.em-small: state retained
text.em-small: worker released
text.em-mono: free
text.em-small: OUTPUT SEQUENCE
text.em-small: 32 / 32 output groups
text.em-lane-name: Optimized
text.em-small: ELAPSED TIME
text.em-mono: 14.39 s
text.em-mono: Δ 2.83 GPU-s saved per request
text.em-small: 14.39 s
text.em-small: Faster prefill + decode · same cache reuse and answer tokens
summary: Inspect the machine
button: Read state
button: Execute
button: Emit tokens
button: Compare clocks
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
p.xs-callout: 157.9 sBaseline finishes the 12 requests here.
b: 157.9 s
span.xs-cause: Faster prefill + decode executionCache reuse held fixed
span: Cache reuse held fixed
span.xs-focus-note: One worker per runtime · no extra workers added
text.xs-label: 100 GPU-s available to each runtime
text.xs-title: Baseline
text.xs-title: 13 requests completed
text.xs-title: Optimized
text.xs-title: 15 requests completed
text.xs-label: Baseline count
text.xs-label: Additional requests
text.xs-small: 1 mark = 5 requests
span.xs-focus-label: Requests from the same compute budget
strong.xs-allowance-number: 100 GPU-s
small: GPU-s
text.xs-label: 13 requests
text.xs-label: 15 requests
text.xs-small: Violet = additional requests
p.xs-callout: 13 requestsBaseline spends the compute budget here.
b: 13 requests
span.xs-cause: Faster prefill + decode executionSame request order · cache reuse held fixed
span: Same request order · cache reuse held fixed
span.xs-focus-note: Busy compute, not a wall-clock deadline
text.xd-title: 10 agents in view
text.xd-subtitle: 1 request each
text.xd-id: A01
text.xd-id: A02
text.xd-id: A03
text.xd-id: A04
text.xd-id: A05
text.xd-id: A06
text.xd-id: A07
text.xd-id: A08
text.xd-id: A09
text.xd-id: A10
text.xd-subtitle: Intake
text.xd-equation: 10 agents → 10 requests
text.xs-small: FIFO
text.xs-small: dispatcher
text.xs-small: 998 queued
text.xs-small: W1 · A1
text.xs-small: W2 · A2
text.xs-small: requestscompleted
text.xs-label: 0:00 elapsed
text.xs-label: 2 workers per runtime
span: Same demand. Two runtimes.
p: One request per agent.
p: Zoom out to see the full arrival burst.
text.xs-count: 24.03 GPU-s / correct answer
text.xs-count: 19.29 GPU-s / correct answer
text.xs-label: Quality held fixed · original 96-task cohort
span.xs-focus-label: Baseline GPU cost
span: Baseline
strong: 24.03
span: Optimized
strong: 19.29
small: GPU-s / correct answer
p.xs-callout: 24.03 GPU-sper correct answer on the matched cohort
b: 24.03 GPU-s
span.xs-cause: Faster prefill + decode executionCache reuse and output quality held fixed
span: Cache reuse and output quality held fixed
span.xs-focus-note: Original 96 tasks · unchanged correctness
time: 20.1 / 80.5s
button: 01Same request
span: 01
button: 02Expose the gap
span: 02
button: 03Follow the next requests
span: 03
button: 04Hold compute fixed
span: 04
button: 05Serve 1,000 agents
span: 05
button: 06Compare GPU cost
span: 06

## at 40s
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
time: 0.51 / 28 s
button: Requests arrive
button: Waiting for a worker
button: Processing the input
button: Generating the answer
button: Locate the three costs
span: Same model · same requests · same outcomes
span: Execution trace
h3: How many requests fit the same compute allowance?
button: Delivery time
button: Serving capacity
button: GPU cost / correct answer
text.em-lane-name: Baseline
text.em-mono: ✓ answer complete
text.em-small: WEIGHTS / KV STATE
text.em-small: state retained
text.em-small: worker released
text.em-mono: free
text.em-small: OUTPUT SEQUENCE
text.em-small: 32 / 32 output groups
text.em-lane-name: Optimized
text.em-small: ELAPSED TIME
text.em-mono: 14.39 s
text.em-mono: Δ 2.83 GPU-s saved per request
text.em-small: 14.39 s
text.em-small: Faster prefill + decode · same cache reuse and answer tokens
summary: Inspect the machine
button: Read state
button: Execute
button: Emit tokens
button: Compare clocks
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
p.xs-callout: 126.8 sOptimized finishes the same 12 requests here.
b: 126.8 s
span.xs-cause: Faster prefill + decode executionCache reuse held fixed
span: Cache reuse held fixed
span.xs-focus-note: One worker per runtime · no extra workers added
text.xs-label: 3,000 GPU-s available to each runtime
text.xs-title: Baseline
text.xs-title: 306 requests completed
text.xs-title: Optimized
text.xs-title: 382 requests completed
text.xs-label: Baseline count
text.xs-label: Additional requests
text.xs-small: 1 mark = 5 requests
span.xs-focus-label: Requests from the same compute budget
strong.xs-allowance-number: 3,000 GPU-s
small: GPU-s
text.xs-label: 306 requests
text.xs-label: 382 requests
text.xs-small: Violet = additional requests
p.xs-callout: 382 requestsCompleted within the same allowance.
b: 382 requests
span.xs-cause: Faster prefill + decode executionSame request order · cache reuse held fixed
span: Same request order · cache reuse held fixed
span.xs-focus-note: Busy compute, not a wall-clock deadline
text.xd-title: 10 agents in view
text.xd-subtitle: 1 request each
text.xd-id: A01
text.xd-id: A02
text.xd-id: A03
text.xd-id: A04
text.xd-id: A05
text.xd-id: A06
text.xd-id: A07
text.xd-id: A08
text.xd-id: A09
text.xd-id: A10
text.xd-subtitle: Intake
text.xd-equation: 10 agents → 10 requests
text.xs-small: FIFO
text.xs-small: dispatcher
text.xs-small: 998 queued
text.xs-small: W1 · A1
text.xs-small: W2 · A2
text.xs-small: requestscompleted
text.xs-label: 0:00 elapsed
text.xs-label: 2 workers per runtime
span: Same demand. Two runtimes.
p: One request per agent.
p: Zoom out to see the full arrival burst.
text.xs-count: 24.03 GPU-s / correct answer
text.xs-count: 19.29 GPU-s / correct answer
text.xs-label: Quality held fixed · original 96-task cohort
span.xs-focus-label: Optimized GPU cost
span: Baseline
strong: 24.03
span: Optimized
strong: 19.29
small: GPU-s / correct answer
p.xs-callout: 19.29 GPU-sper correct answer on the matched cohort
b: 19.29 GPU-s
span.xs-cause: Faster prefill + decode executionCache reuse and output quality held fixed
span: Cache reuse and output quality held fixed
span.xs-focus-note: Original 96 tasks · unchanged correctness
label.es-intervention: Compute allowance3,000 GPU-s
span: 3,000 GPU-s
time: 40.1 / 80.5s
button: 01Same request
span: 01
button: 02Expose the gap
span: 02
button: 03Follow the next requests
span: 03
button: 04Hold compute fixed
span: 04
button: 05Serve 1,000 agents
span: 05
button: 06Compare GPU cost
span: 06

## at 70s
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
time: 0.51 / 28 s
button: Requests arrive
button: Waiting for a worker
button: Processing the input
button: Generating the answer
button: Locate the three costs
span: Same model · same requests · same outcomes
span: Execution trace
h3: GPU cost per correct answer
button: Delivery time
button: Serving capacity
button: GPU cost / correct answer
text.em-lane-name: Baseline
text.em-mono: ✓ answer complete
text.em-small: WEIGHTS / KV STATE
text.em-small: state retained
text.em-small: worker released
text.em-mono: free
text.em-small: OUTPUT SEQUENCE
text.em-small: 32 / 32 output groups
text.em-lane-name: Optimized
text.em-small: ELAPSED TIME
text.em-mono: 14.39 s
text.em-mono: Δ 2.83 GPU-s saved per request
text.em-small: 14.39 s
text.em-small: Faster prefill + decode · same cache reuse and answer tokens
summary: Inspect the machine
button: Read state
button: Execute
button: Emit tokens
button: Compare clocks
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
p.xs-callout: 157.9 sBaseline finishes the 12 requests here.
b: 157.9 s
span.xs-cause: Faster prefill + decode executionCache reuse held fixed
span: Cache reuse held fixed
span.xs-focus-note: One worker per runtime · no extra workers added
text.xs-label: 3,000 GPU-s available to each runtime
text.xs-title: Baseline
text.xs-title: 306 requests completed
text.xs-title: Optimized
text.xs-title: 382 requests completed
text.xs-label: Baseline count
text.xs-label: Additional requests
text.xs-small: 1 mark = 5 requests
span.xs-focus-label: Requests from the same compute budget
strong.xs-allowance-number: 3,000 GPU-s
small: GPU-s
text.xs-label: 306 requests
text.xs-label: 382 requests
text.xs-small: Violet = additional requests
p.xs-callout: 306 requestsBaseline spends the compute budget here.
b: 306 requests
span.xs-cause: Faster prefill + decode executionSame request order · cache reuse held fixed
span: Same request order · cache reuse held fixed
span.xs-focus-note: Busy compute, not a wall-clock deadline
text.xd-title: 1,000 agents
text.xd-subtitle: 1 request each
text.xd-exemplar-label: 1–10
text.xd-subtitle: 100 marks × 10 agents
text.xs-small: FIFO
text.xs-small: dispatcher
text.xs-small: 0 queued
text.xs-small: W1 · free
text.xs-small: W2 · free
text.xs-count: 1,000
text.xs-small: requestscompleted
text.xs-small: Queue cleared at 80:47
text.xs-small: Queue cleared at 64:37
text.xs-label: 80:47 elapsed
text.xs-label: 2 workers per runtime
span.xs-focus-label: Time to finish all 1,000 requests
span.xs-comparison-lane: 80:47baseline
small: baseline
strong.xs-comparison-lane: 64:37optimized
small: optimized
text.xs-small: 500
text.xs-small: 1000
text.xs-small: 80:47 elapsed
p.xs-callout: 80:47 to clear the baseline queue
b: 80:47
span.xs-cause: Faster prefill + decode executionTwo workers in each runtime · same cache reuse
span: Two workers in each runtime · same cache reuse
span.xs-focus-note: 1,000 completed in both lanes · 0 outstanding
text.xs-count: 24.03 GPU-s / correct answer
text.xs-count: 19.29 GPU-s / correct answer
text.xs-label: Quality held fixed · original 96-task cohort
span.xs-focus-label: Baseline GPU cost
span: Baseline
strong: 24.03
span: Optimized
strong: 19.29
small: GPU-s / correct answer
p.xs-callout: 24.03 GPU-sper correct answer on the matched cohort
b: 24.03 GPU-s
span.xs-cause: Faster prefill + decode executionCache reuse and output quality held fixed
span: Cache reuse and output quality held fixed
span.xs-focus-note: Original 96 tasks · unchanged correctness
time: 70.1 / 80.5s
button: 01Same request
span: 01
button: 02Expose the gap
span: 02
button: 03Follow the next requests
span: 03
button: 04Hold compute fixed
span: 04
button: 05Serve 1,000 agents
span: 05
button: 06Compare GPU cost
span: 06
