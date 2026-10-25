# Serving system overview

## at 5s
span: PART 2 · NEW A/B/C/D WORKLOAD
strong: Serving schematic
h3: Requests enter a busy engine
p: The four identities stay in view as demand reaches the same serving loop.
button: Pause
button: Replay
label: Story position
button: Arrivals
button: Admission
button: Stream pause
button: Locality
button: Draft / verify
button: Kernel fusion
button: Weight quantization
button: Parallel execution
button: Cancellation
button: Delivery criteria
span: Follow the request
button: A is streaming
button: B arrives
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
text.sa-metric: 8 / 6
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
text.sa-small: queued
text.sa-small: not yet arrived
text.sa-small: The clock paces this schematic. Token-step limits and KV reservations are different resources.

## at 20s
span: PART 2 · NEW A/B/C/D WORKLOAD
strong: Serving schematic
h3: Route to reusable KV state
p: Only the warm replica holds B's compatible prefix; D has no match.
button: Pause
button: Replay
label: Story position
button: Arrivals
button: Admission
button: Stream pause
button: Locality
button: Draft / verify
button: Kernel fusion
button: Weight quantization
button: Parallel execution
button: Cancellation
button: Delivery criteria
span: Follow request C
button: Retained prefix
button: Route request C
button: Check request D
button: Reuse on replica 1
button: Recompute on replica 2
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
text.sc-metric: 2 pages
text.sc-small: ready on replica 1
text.sc-small: Replica 1
text.sc-value: 2 cached
text.sc-small: Replica 2
text.sc-value: 0 cached
text.sc-value: next request
text.sc-note: P1 + P2: the repeated prefix.
text.sc-note: S: a new question’s suffix.
text.sc-note: Route C to inspect the difference.
text.sc-small: decode
text.sc-small: complete · prefix retained
text.sc-small: not yet arrived
button.slo-deep-action: Compare cache-aware placements ↗

## at 40s
span: PART 2 · NEW A/B/C/D WORKLOAD
strong: Serving schematic
h3: Draft tokens, verify the prefix
p: Rejected draft work consumes slots without entering C's answer.
button: Pause
button: Replay
label: Story position
button: Arrivals
button: Admission
button: Stream pause
button: Locality
button: Draft / verify
button: Kernel fusion
button: Weight quantization
button: Parallel execution
button: Cancellation
button: Delivery criteria
span: Follow request C
button: Draft proposals
button: Verify prefix
button: Committed answer
button: Two proposals agree
button: First proposal fails
text.sc-title: A rejected proposal never enters C’s answer
text.sc-label: Request C
text.sc-small: same running request
text.sc-label: Draft proposals
text.sc-small: not yet output
text.sc-label: Target verification
text.sc-small: accept a valid prefix
text.sc-label: Committed answer
text.sc-small: visible to the user
text.sc-token: C1
text.sc-small: accepted
text.sc-small: verified draft
text.sc-token: C2
text.sc-token: Cx
text.sc-token: C3
text.sc-small: target correction
text.sc-label: Two accepted proposals + one target correction → C1 · C2 · C3
text.sc-card-title: Only committed tokens
text.sc-card-title: reach the answer.
text.sc-metric: 2 / 3
text.sc-small: C’s output tokens delivered
text.sc-small: From draft
text.sc-small: From target
text.sc-small: Rejected proposals
text.sc-note: C1 + C2 survive verification.
text.sc-note: The target replaces Cx with C3.
text.sc-note: Proposals are not delivered early.
text.sc-small: complete
text.sc-small: complete · prefix retained
text.sc-small: decode
text.sc-small: prefill
button.slo-deep-action: Follow the draft / verify experiment ↗

## at 60s
span: PART 2 · NEW A/B/C/D WORKLOAD
strong: Serving schematic
h3: Weight storage versus numerical error
p: Inspect the weight payload, scale overhead and reconstruction error together.
button: Pause
button: Replay
label: Story position
button: Arrivals
button: Admission
button: Stream pause
button: Locality
button: Draft / verify
button: Kernel fusion
button: Weight quantization
button: Parallel execution
button: Cancellation
button: Delivery criteria
span: Select a weight, compare formats
button: INT4
button: INT8
text.sh-subtitle: Weight quantization · q = round(w / s), ŵ = q × s
text.sh-small: One scale for 16 values. Select a weight to inspect its rounding error.
text.sh-label: Original FP32 weights
text.sh-label: Signed INT4 codes
text.sh-value: -1.1
text.sh-value: -0.34
text.sh-value: 0.27
text.sh-value: 1.8
text.sh-value: 0.72
text.sh-value: -0.91
text.sh-value: 0.18
text.sh-value: -0.45
text.sh-value: 1.27
text.sh-value: 0.09
text.sh-value: -1.62
text.sh-value: 0.58
text.sh-value: -0.23
text.sh-value: 1.06
text.sh-value: -0.77
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
text.sh-metric: … B
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

## at 80s
span: PART 2 · NEW A/B/C/D WORKLOAD
strong: Serving schematic
h3: Parallel execution across GPUs
p: Device ownership changes the communication path. More GPUs do not imply a fixed speedup.
button: Pause
button: Replay
label: Story position
button: Arrivals
button: Admission
button: Stream pause
button: Locality
button: Draft / verify
button: Kernel fusion
button: Weight quantization
button: Parallel execution
button: Cancellation
button: Delivery criteria
span: What each GPU owns
button: Model replicas
button: Tensor parallel
button: Pipeline parallel
button: MoE alternative
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

## at 100s
span: PART 2 · NEW A/B/C/D WORKLOAD
strong: Serving schematic
h3: Cancellation and memory reclamation
p: D leaves at a safe iteration boundary. B's reusable prefix remains in the pool.
button: Pause
button: Replay
label: Story position
button: Arrivals
button: Admission
button: Stream pause
button: Locality
button: Draft / verify
button: Kernel fusion
button: Weight quantization
button: Parallel execution
button: Cancellation
button: Delivery criteria
span: Request D
button: Before cancellation
button: After reclamation
text.sh-subtitle: Request D cancels · release at a safe iteration boundary
text.sh-small: Return to the original serving trace. A running GPU kernel is not interrupted mid-instruction.
text.sh-label: cancellation observed
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
text.sh-label: After cancellation
text.sh-label: B’s 2 prefix pages remain retained. No other request’s state is reclaimed.
text.sh-title: Cancelled work stops.
text.sh-title: Its capacity returns.
text.sh-metric: 3 pages
text.sh-small: released from request D
text.sh-small: D-owned pages
text.sh-stat: 3 → 0
text.sh-small: Empty slots
text.sh-stat: 3 → 6
text.sh-small: B prefix retained
text.sh-small: Do not reuse in-flight memory.
text.sh-small: Cancel, observe, then reclaim.
text.sh-small: Original trace
text.sh-small: complete
text.sh-small: cancelled
text.sh-small: Page ownership follows the overview's event cursor.

## at 120s
span: PART 2 · NEW A/B/C/D WORKLOAD
strong: Serving schematic
h3: Latency and validity gates
p: Latency targets and an independent validity check are both required.
button: Pause
button: Replay
label: Story position
button: Arrivals
button: Admission
button: Stream pause
button: Locality
button: Draft / verify
button: Kernel fusion
button: Weight quantization
button: Parallel execution
button: Cancellation
button: Delivery criteria
span: Apply the checks
button: A–D outcomes
button: First token (TTFT)
button: Token gaps (ITL)
button: Answer validity
button: Qualified rate
span: TTFT target
button: 100 ms
button: 180 ms
span: Max ITL
button: 60 ms
button: 120 ms
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
text.sd-card-title: R4 is fast enough.
text.sd-card-title: Its answer is invalid.
text.sd-small: excluded despite low latency
text.sd-small: First-token target
text.sd-value: passes
text.sd-small: Gap target
text.sd-small: Validation
text.sd-value: fails
text.sd-note: Latency compliance is not correctness.
text.sd-note: An independent check rejects R4.
text.sd-note: Looser latency targets cannot fix it.
text.sd-small: Blue ticks: tokens · green marker: completion. Select a request to inspect its checks.
