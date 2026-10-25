# Serving system overview 1440x900

## t=5s stage 659/659 doc 1440/1440 secH 900 minFont 6.7
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
strong.: Prefill / decode scheduling
strong.: Speculative decoding
strong.: Cache-aware routing
strong.: CPU / GPU overlap
strong.: Serving system overview
mark.: 11
small.: mechanisms in one loop
strong.: Serving glossary
span.: PART 2 · NEW A/B/C/D WORKLOAD
strong.: Serving schematic
h3.: Token and memory admission
p.: The gate checks scheduled tokens and reserved KV space before B enters.
button.: Pause
button.: Replay
label.: Story position
button.: Arrivals
button.: Admission
button.: Stream pause
button.: Locality
button.: Draft / verify
button.: Kernel fusion
button.: Weight quantization
button.: Parallel execution
button.: Cancellation
button.: Delivery criteria
span.: Follow the request
button.: Whole input
button.: Admit a chunk
text.sa-title: A new input must pass two different resource checks
text.sa-small: One replica · token units per scheduling step · eight KV pages
text.sa-label: Request A
text.sa-small: answer stream
text.sa-small: GPU step
text.sa-small: Filled blue cells have reached the user
text.sa-label: Request B
text.sa-small: 7 input token units
text.sa-small: 7 requested together
text.sa-label: Token work · this step
text.sa-small: 6-unit limit
text.sa-equation: 1 + 7 = 8 > 6
text.sa-label: hold
text.sa-label: KV memory · page reservations
text.sa-value: B?
text.sa-equation: 3 + 4 = 7 ≤ 8
text.sa-label: fits
text.sa-card-title: Memory fits.
text.sa-card-title: This token step does not.
tspan.sa-unit: / 6
text.sa-small: token units in this step
text.sa-small: A · decode
text.sa-small: B · input
text.sa-small: Decision
text.sa-value: hold B
text.sa-note: 1 decode + 7 input = 8.
text.sa-note: The step budget is 6.
text.sa-note: Free memory alone is insufficient.
text.sa-label: The red token check holds B outside, even though its KV pages fit.
text.sa-small: Same request identities
text.sa-small: decode
text.sa-small: held
text.sa-small: not yet arrived
text.sa-small: The clock paces this schematic. Token-step limits and KV reservations are different resources.

## t=20s stage 659/659 doc 1440/1440 secH 900 minFont 6.7
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
strong.: Prefill / decode scheduling
strong.: Speculative decoding
strong.: Cache-aware routing
strong.: CPU / GPU overlap
strong.: Serving system overview
mark.: 11
small.: mechanisms in one loop
strong.: Serving glossary
span.: PART 2 · NEW A/B/C/D WORKLOAD
strong.: Serving schematic
h3.: Route to reusable KV state
p.: Only the warm replica holds B's compatible prefix; D has no match.
button.: Pause
button.: Replay
label.: Story position
button.: Arrivals
button.: Admission
button.: Stream pause
button.: Locality
button.: Draft / verify
button.: Kernel fusion
button.: Weight quantization
button.: Parallel execution
button.: Cancellation
button.: Delivery criteria
span.: Follow request C
button.: Retained prefix
button.: Route request C
button.: Check request D
button.: Reuse on replica 1
button.: Recompute on replica 2
text.sc-title: Reuse on replica 1, or build new KV state on replica 2
text.sc-label: Request C
text.sc-small: Same document · new question
text.sc-label: P1
text.sc-label: P2
text.sc-small: C’s logical KV blocks · prefix + suffix
text.sc-label: Replica 1 · B’s prefix is local
text.sc-small: C’s route
text.sc-small: model
text.sc-value: B*
text.sc-small: P1
text.sc-small: P2
text.sc-small: P1 + P2 reference B* · S gets a new page
text.sc-label: Replica 2 · no retained prefix
text.sc-small: alternative
text.sc-small: Independent memory pool
text.sc-label: Request D
text.sc-small: Assigned to replica 1 · 3 new pages
text.sc-label: next admission check
text.sc-card-title: B’s prefix is local.
text.sc-card-title: Replica 2 has no copy.
tspan.sc-unit: pages
text.sc-small: ready on replica 1
text.sc-small: Replica 1
text.sc-value: 2 cached
text.sc-small: Replica 2
text.sc-value: 0 cached
text.sc-value: arrived
text.sc-note: P1 + P2: the repeated prefix.
text.sc-note: S: a new question’s suffix.
text.sc-note: Route C to inspect the difference.
text.sc-small: decode
text.sc-small: complete · prefix retained
text.sc-small: queued
text.sc-small: not yet arrived
button.slo-deep-action: Compare cache-aware placements ↗

## t=35s stage 659/659 doc 1440/1440 secH 900 minFont 6.7
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
strong.: Prefill / decode scheduling
strong.: Speculative decoding
strong.: Cache-aware routing
strong.: CPU / GPU overlap
strong.: Serving system overview
mark.: 11
small.: mechanisms in one loop
strong.: Serving glossary
span.: PART 2 · NEW A/B/C/D WORKLOAD
strong.: Serving schematic
h3.: Draft tokens, verify the prefix
p.: Rejected draft work consumes slots without entering C's answer.
button.: Pause
button.: Replay
label.: Story position
button.: Arrivals
button.: Admission
button.: Stream pause
button.: Locality
button.: Draft / verify
button.: Kernel fusion
button.: Weight quantization
button.: Parallel execution
button.: Cancellation
button.: Delivery criteria
span.: Follow request C
button.: Draft proposals
button.: Verify prefix
button.: Committed answer
button.: Two proposals agree
button.: First proposal fails
text.sc-title: The same request now proposes its next output tokens
text.sc-label: Request C
text.sc-small: same running request
text.sc-label: Draft proposals
text.sc-small: not yet output
text.sc-label: Target verification
text.sc-small: accept a valid prefix
text.sc-label: Committed answer
text.sc-small: visible to the user
text.sc-token: C1
text.sc-small: await verification
text.sc-token: C2
text.sc-token: Cx
text.sc-token: C3
text.sc-label: Three draft positions consume work before any token is committed.
text.sc-card-title: A draft is a proposal.
text.sc-card-title: The target must check it.
tspan.sc-unit: / 3
text.sc-small: proposal tokens delivered
text.sc-small: Draft proposals
text.sc-small: Target check
text.sc-value: in progress
text.sc-small: Output
text.sc-value: waiting
text.sc-note: Keep draft work separate from output.
text.sc-note: Only a valid prefix can be accepted.
text.sc-note: No runtime speedup is inferred here.
text.sc-small: complete
text.sc-small: complete · prefix retained
text.sc-small: decode
text.sc-small: prefill
button.slo-deep-action: Follow the draft / verify experiment ↗

## t=50s stage 659/659 doc 1440/1440 secH 900 minFont 6.7
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
strong.: Prefill / decode scheduling
strong.: Speculative decoding
strong.: Cache-aware routing
strong.: CPU / GPU overlap
strong.: Serving system overview
mark.: 11
small.: mechanisms in one loop
strong.: Serving glossary
span.: PART 2 · NEW A/B/C/D WORKLOAD
strong.: Serving schematic
h3.: Kernel fusion removes memory traffic
p.: A four-value operation shows exactly which reads, writes and launches fusion removes.
button.: Pause
button.: Replay
label.: Story position
button.: Arrivals
button.: Admission
button.: Stream pause
button.: Locality
button.: Draft / verify
button.: Kernel fusion
button.: Weight quantization
button.: Parallel execution
button.: Cancellation
button.: Delivery criteria
span.: Follow the values
button.: Read input
button.: Intermediate memory
button.: Compare traffic
text.sh-subtitle: Operation microscope · y = max(0, x + 0.25)
text.sh-small: Four FP32 values. The same arithmetic, two execution paths.
text.sh-label: Separate kernels
text.sh-small: input x
text.sh-number: -1.25
text.sh-number: -0.5
text.sh-number: 0.5
text.sh-number: 1.25
text.sh-label: add 0.25
text.sh-small: launch 1
text.sh-small: temporary z · global memory
text.sh-number: -1
text.sh-number: -0.25
text.sh-number: 0.75
text.sh-number: 1.5
text.sh-label: ReLU
text.sh-small: launch 2
text.sh-small: output y
text.sh-label: Fused kernel
text.sh-label: add → ReLU · one launch
text.sh-small: z stays on-chip
text.sh-label: 16 B temporary write + 16 B reread removed
text.sh-small: Both output vectors: [0, 0, 0.75, 1.5]
text.sh-title: Keep the intermediate
text.sh-title: on-chip.
text.sh-small: temporary traffic removed
text.sh-small: Global traffic
text.sh-stat: 64 → 32 B
text.sh-small: Kernel launches
text.sh-stat: 2 → 1
text.sh-small: Toy output
text.sh-stat: identical
text.sh-small: Bias traffic held fixed.
text.sh-small: Device latency needs profiling.
text.sh-small: Original trace
text.sh-small: complete
text.sh-small: prefill
text.sh-small: Arithmetic and topology close-ups are separate teaching fixtures, not added speedups for the original trace.
button.slo-deep-action: Compare CPU/GPU scheduling overlap ↗

## t=65s stage 659/659 doc 1440/1440 secH 900 minFont 7.3
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
strong.: Prefill / decode scheduling
strong.: Speculative decoding
strong.: Cache-aware routing
strong.: CPU / GPU overlap
strong.: Serving system overview
mark.: 11
small.: mechanisms in one loop
strong.: Serving glossary
span.: PART 2 · NEW A/B/C/D WORKLOAD
strong.: Serving schematic
h3.: Weight storage versus numerical error
p.: Inspect the weight payload, scale overhead and reconstruction error together.
button.: Pause
button.: Replay
label.: Story position
button.: Arrivals
button.: Admission
button.: Stream pause
button.: Locality
button.: Draft / verify
button.: Kernel fusion
button.: Weight quantization
button.: Parallel execution
button.: Cancellation
button.: Delivery criteria
span.: Select a weight, compare formats
button.: INT4
button.: INT8
text.sh-subtitle: Weight quantization · q = round(w / s), ŵ = q × s
text.sh-small: One scale for 16 values. Select a weight to inspect its rounding error.
text.sh-label: Original FP32 weights
text.sh-label: Signed INT4 codes
text.sh-value: -1.1
text.sh-value: -4
text.sh-value: -0.34
text.sh-value: -1
text.sh-value: 0.27
text.sh-value: 1.8
text.sh-value: 0.72
text.sh-value: -0.91
text.sh-value: 0.18
text.sh-value: -0.45
text.sh-value: -2
text.sh-value: 1.27
text.sh-value: 0.09
text.sh-value: -1.62
text.sh-value: -6
text.sh-value: 0.58
text.sh-value: -0.23
text.sh-value: 1.06
text.sh-value: -0.77
text.sh-value: -3
text.sh-value: 0.39
text.sh-small: s = 0.2571
text.sh-small: ÷ s → round
text.sh-label: Weight [1, 1] · -1.1 → -1.029
text.sh-small: -1.8
text.sh-small: -0.9
text.sh-small: 0.9
text.sh-small: 1.8
text.sh-small: Absolute error 0.07143 · not a task-accuracy measurement
text.sh-small: Original: 64 B
text.sh-small: INT4: 8 B payload + 4 B scale
text.sh-title: Storage shrinks.
text.sh-title: Values also move.
text.sh-small: including the stored scale
text.sh-small: Weight storage
text.sh-stat: 64 → 12 B
text.sh-small: Largest error
text.sh-stat: 0.1243
text.sh-small: First-row dot
text.sh-stat: -0.2775
text.sh-small: Quantized dot
text.sh-stat: -0.2571
text.sh-small: No quality pass is assumed.
text.sh-small: Validate the downstream task.
text.sh-small: Original trace
text.sh-small: complete
text.sh-small: prefill
text.sh-small: Arithmetic and topology close-ups are separate teaching fixtures, not added speedups for the original trace.

## t=80s stage 659/659 doc 1440/1440 secH 900 minFont 6.7
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
strong.: Prefill / decode scheduling
strong.: Speculative decoding
strong.: Cache-aware routing
strong.: CPU / GPU overlap
strong.: Serving system overview
mark.: 11
small.: mechanisms in one loop
strong.: Serving glossary
span.: PART 2 · NEW A/B/C/D WORKLOAD
strong.: Serving schematic
h3.: Parallel execution across GPUs
p.: Device ownership changes the communication path. More GPUs do not imply a fixed speedup.
button.: Pause
button.: Replay
label.: Story position
button.: Arrivals
button.: Admission
button.: Stream pause
button.: Locality
button.: Draft / verify
button.: Kernel fusion
button.: Weight quantization
button.: Parallel execution
button.: Cancellation
button.: Delivery criteria
span.: What each GPU owns
button.: Model replicas
button.: Tensor parallel
button.: Pipeline parallel
button.: MoE alternative
text.sh-subtitle: Tensor parallelism · partition one row’s input dimension
text.sh-small: Both devices cooperate on one dot product. The sum is required before continuing.
text.sh-label: x = [2, 1, 3, 4]
text.sh-label: GPU 1 · shard
text.sh-label: partial = 4
text.sh-label: GPU 2 · shard
text.sh-number: -1
text.sh-number: 0.5
text.sh-label: partial = -1
text.sh-value: waiting
text.sh-label: all-reduce sum
text.sh-label: 4 + (−1) = 3 · the reduced result is available to both devices
text.sh-title: One request.
text.sh-title: Two partial results.
text.sh-small: reconstructed dot product
text.sh-small: GPU 1 partial
text.sh-small: GPU 2 partial
text.sh-stat: −1
text.sh-small: Collective
text.sh-stat: sum
text.sh-small: Communication is extra work.
text.sh-small: This is not a 2× speed claim.
text.sh-small: Original trace
text.sh-small: complete
text.sh-small: prefill
text.sh-small: Arithmetic and topology close-ups are separate teaching fixtures, not added speedups for the original trace.

## t=95s stage 659/659 doc 1440/1440 secH 900 minFont 7.3
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
strong.: Prefill / decode scheduling
strong.: Speculative decoding
strong.: Cache-aware routing
strong.: CPU / GPU overlap
strong.: Serving system overview
mark.: 11
small.: mechanisms in one loop
strong.: Serving glossary
span.: PART 2 · NEW A/B/C/D WORKLOAD
strong.: Serving schematic
h3.: Cancellation and memory reclamation
p.: D leaves at a safe iteration boundary. B's reusable prefix remains in the pool.
button.: Pause
button.: Replay
label.: Story position
button.: Arrivals
button.: Admission
button.: Stream pause
button.: Locality
button.: Draft / verify
button.: Kernel fusion
button.: Weight quantization
button.: Parallel execution
button.: Cancellation
button.: Delivery criteria
span.: Request D
button.: Before cancellation
button.: After reclamation
text.sh-subtitle: Request D cancels · release at a safe iteration boundary
text.sh-small: Return to the original serving trace. A running GPU kernel is not interrupted mid-instruction.
text.sh-label: waiting for the safe boundary
text.sh-label: Before cancellation · replica 1
text.sh-small: page 1
text.sh-small: page 2
text.sh-small: page 3
text.sh-label: B prefix
text.sh-small: page 4
text.sh-small: page 5
text.sh-label: free
text.sh-small: page 6
text.sh-small: page 7
text.sh-small: page 8
text.sh-label: Before the safe boundary
text.sh-label: B’s 2 prefix pages remain retained. No other request’s state is reclaimed.
text.sh-title: Cancelled work stops.
text.sh-title: Its capacity returns.
tspan.sh-unit: pages
text.sh-small: released from request D
text.sh-small: D-owned pages
text.sh-small: Empty slots
text.sh-stat: 3 → 3
text.sh-small: B prefix retained
text.sh-small: Do not reuse in-flight memory.
text.sh-small: Cancel, observe, then reclaim.
text.sh-small: Original trace
text.sh-small: complete
text.sh-small: prefill
text.sh-small: Page ownership follows the overview's event cursor.

## t=110s stage 659/659 doc 1440/1440 secH 900 minFont 6.7
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
strong.: Prefill / decode scheduling
strong.: Speculative decoding
strong.: Cache-aware routing
strong.: CPU / GPU overlap
strong.: Serving system overview
mark.: 11
small.: mechanisms in one loop
strong.: Serving glossary
span.: PART 2 · NEW A/B/C/D WORKLOAD
strong.: Serving schematic
h3.: Latency and validity gates
p.: Latency targets and an independent validity check are both required.
button.: Pause
button.: Replay
label.: Story position
button.: Arrivals
button.: Admission
button.: Stream pause
button.: Locality
button.: Draft / verify
button.: Kernel fusion
button.: Weight quantization
button.: Parallel execution
button.: Cancellation
button.: Delivery criteria
span.: Apply the checks
button.: A–D outcomes
button.: First token (TTFT)
button.: Token gaps (ITL)
button.: Answer validity
button.: Qualified rate
span.: TTFT target
button.: 100 ms
button.: 180 ms
span.: Max ITL
button.: 60 ms
button.: 120 ms
text.sd-title: Completed answers versus qualified delivery
text.sd-small: Worked example · five simultaneous arrivals · 500 ms window · separate from A–D
text.sd-label: Request
text.sd-label: Arrival → first token → answer stream → completion
text.sd-small: quality
text.sd-small: TTFT ≤ 100 ms
text.sd-label: R1
text.sd-small: qualifies
text.sd-label: R2
text.sd-small: excluded
text.sd-small: 160 ms
text.sd-label: R3
text.sd-label: R4
text.sd-label: R5
text.sd-small: cancelled
text.sd-small: 100
text.sd-small: 200
text.sd-small: 300
text.sd-small: 400
text.sd-small: 500
text.sd-small: elapsed milliseconds
text.sd-label: Same 0.5 s window
text.sd-small: All completions
text.sd-label: 8 / s
text.sd-small: Qualified completions
text.sd-label: 2 / s
text.sd-card-title: First token latency
text.sd-card-title: is measured from arrival.
tspan.sd-unit: ms
text.sd-small: R2 time to first token (TTFT)
text.sd-small: First-token target
text.sd-value: 100 ms
text.sd-small: R2 first token
text.sd-value: 160 ms
text.sd-small: Result
text.sd-value: too late
text.sd-note: A completed answer can start late.
text.sd-note: The bracket isolates the first wait.
text.sd-note: Targets change qualification only.
text.sd-note: The request timings stay fixed.
text.sd-small: Blue ticks: tokens · green marker: completion. Select a request to inspect its checks.

## t=125s stage 659/659 doc 1440/1440 secH 900 minFont 6.7
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
strong.: Prefill / decode scheduling
strong.: Speculative decoding
strong.: Cache-aware routing
strong.: CPU / GPU overlap
strong.: Serving system overview
mark.: 11
small.: mechanisms in one loop
strong.: Serving glossary
span.: PART 2 · NEW A/B/C/D WORKLOAD
strong.: Serving schematic
h3.: Latency and validity gates
p.: Latency targets and an independent validity check are both required.
button.: Pause
button.: Replay
label.: Story position
button.: Arrivals
button.: Admission
button.: Stream pause
button.: Locality
button.: Draft / verify
button.: Kernel fusion
button.: Weight quantization
button.: Parallel execution
button.: Cancellation
button.: Delivery criteria
span.: Apply the checks
button.: A–D outcomes
button.: First token (TTFT)
button.: Token gaps (ITL)
button.: Answer validity
button.: Qualified rate
span.: TTFT target
button.: 100 ms
button.: 180 ms
span.: Max ITL
button.: 60 ms
button.: 120 ms
text.sd-title: Completed answers versus qualified delivery
text.sd-small: Worked example · five simultaneous arrivals · 500 ms window · separate from A–D
text.sd-label: Request
text.sd-label: Arrival → first token → answer stream → completion
text.sd-small: quality
text.sd-small: TTFT ≤ 100 ms
text.sd-label: R1
text.sd-small: qualifies
text.sd-label: R2
text.sd-small: excluded
text.sd-label: R3
text.sd-label: R4
text.sd-label: R5
text.sd-small: cancelled
text.sd-small: 100
text.sd-small: 200
text.sd-small: 300
text.sd-small: 400
text.sd-small: 500
text.sd-small: elapsed milliseconds
text.sd-label: Same 0.5 s window
text.sd-small: All completions
text.sd-label: 8 / s
text.sd-small: Qualified completions
text.sd-label: 2 / s
text.sd-card-title: Count answers that
text.sd-card-title: meet all three checks.
tspan.sd-unit: / 5
text.sd-small: qualified / offered requests
text.sd-small: Completed
text.sd-value: 4 / 5
text.sd-small: Observation window
text.sd-value: 0.5 s
text.sd-small: Qualified rate
text.sd-value: 2 / s
text.sd-note: Qualification = complete + on time
text.sd-note: + acceptable stream gaps + valid.
text.sd-note: All five arrivals remain in the cohort.
text.sd-small: Blue ticks: tokens · green marker: completion. Select a request to inspect its checks.
