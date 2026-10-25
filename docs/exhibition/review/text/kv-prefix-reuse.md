# KV prefix reuse

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
time: 0.5 / 28 s
button: Requests arrive
button: Waiting for a worker
button: Processing the input
button: Generating the answer
button: Locate the three costs
h4: Compute once, retain the context
span: Service replay
text.pr-label: θ fixed · same token rates · no answer is cached
text.pr-label: Trace close-up
text.pr-title: Contract context
text.pr-small: Request 1 · cold read
text.pr-label: 5,652 / 8,192 input tokens
text.pr-small: prompt → K, V
text.pr-title: Full prefill
text.pr-label: 6.78 GPU-s charged
text.pr-title: Build reusable state
text.pr-small: K · keys
text.pr-small: V · values
text.pr-small: not reusable until ready
text.pr-label: The document remains
text.pr-label: inside the context.
text.pr-small: KV is computed state.
text.pr-small: It is not the response.
text.pr-title: Request 7 · same context
text.pr-small: prefix identity lookup
text.pr-small: new question
text.pr-small: lookup
text.pr-small: new Q, K, V
text.pr-title: Suffix prefill
text.pr-small: 0 / 384 new tokens
text.pr-small: softmax(qKᵀ / √d)V
text.pr-small: context stays in attention
text.pr-title: New answer
text.pr-label: 0 tokens
text.pr-small: decode work retained
text.pr-label: Warm-up is charged before a later request can reuse anything.
text.pr-pair-title: Baseline
text.pr-label: Reading input
text.pr-label: Full prompt → prefill
text.pr-small: 0 / 8,192 computed
text.pr-label: Decode
text.pr-small: 13.92 GPU-s
text.pr-label: Output tokens
text.pr-small: / 4973
text.pr-pair-title: Prefix reuse
text.pr-label: KV prefix → new suffix
text.pr-small: 7,808 reused + 0 new
text.pr-label: Service clock
text.pr-label: 0 s
text.pr-small: Baseline
text.pr-small: 23.75s
text.pr-small: Reuse
text.pr-small: 14.39s
text.pr-small: Amber tick: prefill ends, answer generation begins
span: Request 7 · KV prefix reuse
strong: 7,808 input tokens
span: referenced from ready KV state
span: GPU work accumulated
strong: 0 GPU-s · reuse
small: GPU-s · reuse
span.pr-cost-scope: Work accumulated so far
span.pr-baseline-value: 0GPU-s baseline
small: GPU-s baseline
strong: 0GPU-s reuse
small: GPU-s reuse
b: 39.4%
time: 4.1 / 34s
button: 01First document read
span: 01
button: 02Ready KV prefix
span: 02
button: 03New suffix + attention
span: 03
button: 04Paired execution
span: 04
button: 05Earlier completion
span: 05
button: 06GPU work saved
span: 06

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
time: 0.5 / 28 s
button: Requests arrive
button: Waiting for a worker
button: Processing the input
button: Generating the answer
button: Locate the three costs
h4: Compute the new question
span: Service replay
text.pr-label: θ fixed · same token rates · no answer is cached
text.pr-label: Trace close-up
text.pr-title: Contract context
text.pr-small: Request 1 · cold read
text.pr-label: 8,192 / 8,192 input tokens
text.pr-small: prompt → K, V
text.pr-title: Full prefill
text.pr-label: 9.83 GPU-s charged
text.pr-title: Context retained
text.pr-small: K · keys
text.pr-small: V · values
text.pr-small: ready for a matching prefix
text.pr-label: The document remains
text.pr-label: inside the context.
text.pr-small: KV is computed state.
text.pr-small: It is not the response.
text.pr-title: Request 7 · same context
text.pr-small: 7,808 tokens · reference KV
text.pr-small: new question
text.pr-small: prefix found ✓
text.pr-small: reuse K, V
text.pr-small: new Q, K, V
text.pr-title: Suffix prefill
text.pr-small: 262 / 384 new tokens
text.pr-small: softmax(qKᵀ / √d)V
text.pr-small: context stays in attention
text.pr-title: New answer
text.pr-label: 0 tokens
text.pr-small: decode work retained
text.pr-label: 7,808 repeated input tokens avoided. The context was not removed.
text.pr-pair-title: Baseline
text.pr-label: Reading input
text.pr-label: Full prompt → prefill
text.pr-small: 262 / 8,192 computed
text.pr-label: Decode
text.pr-small: 13.92 GPU-s
text.pr-label: Output tokens
text.pr-small: / 4973
text.pr-pair-title: Prefix reuse
text.pr-label: KV prefix → new suffix
text.pr-small: 7,808 reused + 262 new
text.pr-label: Service clock
text.pr-label: 0.31 s
text.pr-small: Baseline
text.pr-small: 23.75s
text.pr-small: Reuse
text.pr-small: 14.39s
text.pr-small: Amber tick: prefill ends, answer generation begins
span: Request 7 · KV prefix reuse
strong: 7,808 input tokens
span: referenced from ready KV state
span: GPU work accumulated
strong: 0.31 GPU-s · reuse
small: GPU-s · reuse
span.pr-cost-scope: Work accumulated so far
span.pr-baseline-value: 0.31GPU-s baseline
small: GPU-s baseline
strong: 0.31GPU-s reuse
small: GPU-s reuse
b: 39.4%
time: 12.1 / 34s
button: 01First document read
span: 01
button: 02Ready KV prefix
span: 02
button: 03New suffix + attention
span: 03
button: 04Paired execution
span: 04
button: 05Earlier completion
span: 05
button: 06GPU work saved
span: 06

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
time: 0.5 / 28 s
button: Requests arrive
button: Waiting for a worker
button: Processing the input
button: Generating the answer
button: Locate the three costs
h4: Reuse finishes; baseline continues
span: Service replay
text.pr-label: θ fixed · same token rates · no answer is cached
text.pr-label: Trace close-up
text.pr-title: Contract context
text.pr-small: Request 1 · cold read
text.pr-label: 8,192 / 8,192 input tokens
text.pr-small: prompt → K, V
text.pr-title: Full prefill
text.pr-label: 9.83 GPU-s charged
text.pr-title: Context retained
text.pr-small: K · keys
text.pr-small: V · values
text.pr-small: ready for a matching prefix
text.pr-label: The document remains
text.pr-label: inside the context.
text.pr-small: KV is computed state.
text.pr-small: It is not the response.
text.pr-title: Request 7 · same context
text.pr-small: 7,808 tokens · reference KV
text.pr-small: new question
text.pr-small: prefix found ✓
text.pr-small: reuse K, V
text.pr-small: new Q, K, V
text.pr-title: Suffix prefill
text.pr-small: 384 / 384 new tokens
text.pr-small: softmax(qKᵀ / √d)V
text.pr-small: context stays in attention
text.pr-title: New answer
text.pr-label: 4,973 tokens
text.pr-small: decode work retained
text.pr-label: 7,808 repeated input tokens avoided. The context was not removed.
text.pr-pair-title: Baseline
text.pr-label: Generating answer
text.pr-label: Full prompt → prefill
text.pr-small: 8,192 / 8,192 computed
text.pr-label: Decode
text.pr-small: 13.92 GPU-s
text.pr-label: Output tokens
text.pr-pair-count: 1,626
text.pr-small: / 4973
text.pr-pair-title: Prefix reuse
text.pr-label: ✓ Answer complete
text.pr-label: KV prefix → new suffix
text.pr-small: 7,808 reused + 384 new
text.pr-label: ✓ Worker released
text.pr-pair-count: 4,973
text.pr-label: Service clock
text.pr-label: 14.39 s
text.pr-small: Baseline
text.pr-small: 23.75s
text.pr-small: Reuse
text.pr-small: 14.39s
text.pr-label: Δ 9.37 GPU-s
span: Request 7 · KV prefix reuse
strong: 7,808 input tokens
span: referenced from ready KV state
span: Input computation avoided
strong: Δ 9.37 GPU-s
small: GPU-s
span.pr-cost-scope: Total work per request
span.pr-baseline-value: 23.75GPU-s baseline
small: GPU-s baseline
strong: 14.39GPU-s reuse
small: GPU-s reuse
b: 39.4%
time: 22.1 / 34s
button: 01First document read
span: 01
button: 02Ready KV prefix
span: 02
button: 03New suffix + attention
span: 03
button: 04Paired execution
span: 04
button: 05Earlier completion
span: 05
button: 06GPU work saved
span: 06

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
time: 0.5 / 28 s
button: Requests arrive
button: Waiting for a worker
button: Processing the input
button: Generating the answer
button: Locate the three costs
h4: Prefix reuse: GPU-work comparison
span: Service replay
text.pr-label: θ fixed · same token rates · no answer is cached
text.pr-label: Trace close-up
text.pr-title: Contract context
text.pr-small: Request 1 · cold read
text.pr-label: 8,192 / 8,192 input tokens
text.pr-small: prompt → K, V
text.pr-title: Full prefill
text.pr-label: 9.83 GPU-s charged
text.pr-title: Context retained
text.pr-small: K · keys
text.pr-small: V · values
text.pr-small: ready for a matching prefix
text.pr-label: The document remains
text.pr-label: inside the context.
text.pr-small: KV is computed state.
text.pr-small: It is not the response.
text.pr-title: Request 7 · same context
text.pr-small: 7,808 tokens · reference KV
text.pr-small: new question
text.pr-small: prefix found ✓
text.pr-small: reuse K, V
text.pr-small: new Q, K, V
text.pr-title: Suffix prefill
text.pr-small: 384 / 384 new tokens
text.pr-small: softmax(qKᵀ / √d)V
text.pr-small: context stays in attention
text.pr-title: New answer
text.pr-label: 4,973 tokens
text.pr-small: decode work retained
text.pr-label: 7,808 repeated input tokens avoided. The context was not removed.
text.pr-pair-title: Baseline
text.pr-label: ✓ Answer complete
text.pr-label: Full prompt → prefill
text.pr-small: 8,192 / 8,192 computed
text.pr-label: Decode
text.pr-small: 13.92 GPU-s
text.pr-label: ✓ Worker released
text.pr-pair-count: 4,973
text.pr-small: / 4973
text.pr-pair-title: Prefix reuse
text.pr-label: KV prefix → new suffix
text.pr-small: 7,808 reused + 384 new
text.pr-label: Service clock
text.pr-label: 23.75 s
text.pr-small: Baseline
text.pr-small: 23.75s
text.pr-small: Reuse
text.pr-small: 14.39s
text.pr-label: Δ 9.37 GPU-s
span: Request 7 · KV prefix reuse
strong: 7,808 input tokens
span: referenced from ready KV state
span: Input computation avoided
strong: Δ 9.37 GPU-s
small: GPU-s
span.pr-cost-scope: Total work per request
span.pr-baseline-value: 23.75GPU-s baseline
small: GPU-s baseline
strong: 14.39GPU-s reuse
small: GPU-s reuse
p.pr-final-ratio: 39.4% less work per request
b: 39.4%
time: 32.1 / 34s
button: 01First document read
span: 01
button: 02Ready KV prefix
span: 02
button: 03New suffix + attention
span: 03
button: 04Paired execution
span: 04
button: 05Earlier completion
span: 05
button: 06GPU work saved
span: 06
