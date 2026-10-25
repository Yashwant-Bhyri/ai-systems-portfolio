# CPU / GPU overlap 1440x900

## t=3s stage 659/659 doc 1440/1440 secH 900 minFont 9.3
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
mark.: 52 → 37 ms
small.: four decode steps, two streams
strong.: Serving system overview
strong.: Serving glossary
h3.: CPU/GPU scheduling overlap
p.: Follow one step from preparation to output
span.: Two fixed streams
span.: Host work
button.: Balanced host
button.: Slower CPU
button.: No CPU overhead
span.so-inputs: Per step: CPU batch 3 ms · GPU pass 8 ms · CPU return 2 ms
text.so-small: Execution clock
text.so-clock: 9.9 ms
text.so-index: Time (ms)
text.so-index: 10
text.so-index: 20
text.so-index: 30
text.so-index: 40
text.so-index: 50
text.so-index: 60
text.so-lane-title: Baseline scheduling
text.so-small: 0 / 8 output units delivered
text.so-label: CPU
text.so-label: GPU
text.so-op: P1
text.so-op: D1
text.so-index: STEP 1
text.so-op: P2
text.so-op: D2
text.so-index: STEP 2
text.so-op: P3
text.so-op: D3
text.so-index: STEP 3
text.so-op: P4
text.so-op: D4
text.so-index: STEP 4
text.so-small: Output
text.so-small: User A
text.so-small: User B
text.so-lane-title: Overlapped scheduling
text.so-small: Scheduling consequence
text.so-card-title: One decode step
text.so-card-title: = CPU + GPU + CPU, in series
tspan.so-unit: ms
text.so-small: per step, end to end: CPU 3 + GPU 8 + CPU 2
text.so-small: One decode step, run serially
text.so-small: CPU: build batch
text.so-value: 3 ms
text.so-small: GPU: forward pass
text.so-value: 8 ms
text.so-small: CPU: return tokens
text.so-value: 2 ms
text.so-note: One pass → one token each for A and B.
text.so-note: P: prepare batch
text.so-note: D: deliver output
text.so-note: Red: GPU waiting for CPU
text.so-note: Select a step to follow its output
time.: 3.8 / 28s
button.: One decode step
button.: CPU-induced waiting
button.: Overlapped execution
button.: Earlier delivery
button.: Time vs. GPU work

## t=8s stage 659/659 doc 1440/1440 secH 900 minFont 9.3
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
mark.: 52 → 37 ms
small.: four decode steps, two streams
strong.: Serving system overview
strong.: Serving glossary
h3.: CPU/GPU scheduling overlap
p.: The GPU waits for host-side work
span.: Two fixed streams
span.: Host work
button.: Balanced host
button.: Slower CPU
button.: No CPU overhead
span.so-inputs: Per step: CPU batch 3 ms · GPU pass 8 ms · CPU return 2 ms
text.so-small: Execution clock
text.so-clock: 16 ms
text.so-index: Time (ms)
text.so-index: 10
text.so-index: 20
text.so-index: 30
text.so-index: 40
text.so-index: 50
text.so-index: 60
text.so-lane-title: Baseline scheduling
text.so-small: 2 / 8 output units delivered
text.so-label: CPU
text.so-label: GPU
text.so-op: P1
text.so-op: D1
text.so-index: STEP 1
text.so-word: Cap
text.so-word: Tests
text.so-op: P2
text.so-op: D2
text.so-index: STEP 2
text.so-op: P3
text.so-op: D3
text.so-index: STEP 3
text.so-op: P4
text.so-op: D4
text.so-index: STEP 4
text.so-small: Output
text.so-small: User A
text.so-small: User B
text.so-lane-title: Overlapped scheduling
text.so-small: Scheduling consequence
text.so-card-title: GPU idle 5 ms:
text.so-card-title: waiting for the CPU
tspan.so-unit: ms
text.so-small: GPU idle between step 1 and step 2
text.so-small: Why the GPU waits
text.so-small: CPU: return step 1
text.so-value: 2 ms
text.so-small: CPU: build step 2
text.so-value: 3 ms
text.so-note: 2 + 3 ms host work = 5 ms idle
text.so-small: Δ 5 ms
text.so-note: P: prepare batch
text.so-note: D: deliver output
text.so-note: Red: GPU waiting for CPU
text.so-note: Select a step to follow its output
time.: 8.7 / 28s
button.: One decode step
button.: CPU-induced waiting
button.: Overlapped execution
button.: Earlier delivery
button.: Time vs. GPU work

## t=14s stage 659/659 doc 1440/1440 secH 900 minFont 9.3
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
mark.: 52 → 37 ms
small.: four decode steps, two streams
strong.: Serving system overview
strong.: Serving glossary
h3.: CPU/GPU scheduling overlap
p.: Prepare the next step while the GPU runs
span.: Two fixed streams
span.: Host work
button.: Balanced host
button.: Slower CPU
button.: No CPU overhead
span.so-inputs: Per step: CPU batch 3 ms · GPU pass 8 ms · CPU return 2 ms
text.so-small: Execution clock
text.so-clock: 27.2 ms
text.so-index: Time (ms)
text.so-index: 10
text.so-index: 20
text.so-index: 30
text.so-index: 40
text.so-index: 50
text.so-index: 60
text.so-lane-title: Baseline scheduling
text.so-small: 4 / 8 output units delivered
text.so-label: CPU
text.so-label: GPU
text.so-op: P1
text.so-op: D1
text.so-index: STEP 1
text.so-word: Cap
text.so-word: Tests
text.so-op: P2
text.so-op: D2
text.so-index: STEP 2
text.so-word: is
text.so-word: now
text.so-op: P3
text.so-op: D3
text.so-index: STEP 3
text.so-op: P4
text.so-op: D4
text.so-index: STEP 4
text.so-small: Output
text.so-small: User A
text.so-small: User B
text.so-lane-title: Overlapped scheduling
text.so-small: Scheduling consequence
text.so-card-title: CPU builds step 3
text.so-card-title: while the GPU runs step 2
tspan.so-unit: ms
text.so-small: simultaneous CPU + GPU
text.so-small: Same execution interval
text.so-small: CPU · prepare batch 3
text.so-small: GPU · execute batch 2
text.so-small: 11 ms
text.so-small: 19 ms
text.so-small: GPU steps stay 8 ms long.
text.so-note: The CPU uses time inside that step.
text.so-note: P: prepare batch
text.so-note: D: deliver output
text.so-note: Red: GPU waiting for CPU
text.so-note: Select a step to follow its output
time.: 14.7 / 28s
button.: One decode step
button.: CPU-induced waiting
button.: Overlapped execution
button.: Earlier delivery
button.: Time vs. GPU work

## t=21s stage 659/659 doc 1440/1440 secH 900 minFont 9.3
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
mark.: 52 → 37 ms
small.: four decode steps, two streams
strong.: Serving system overview
strong.: Serving glossary
h3.: CPU/GPU scheduling overlap
p.: Finish the same output earlier
span.: Two fixed streams
span.: Host work
button.: Balanced host
button.: Slower CPU
button.: No CPU overhead
span.so-inputs: Per step: CPU batch 3 ms · GPU pass 8 ms · CPU return 2 ms
text.so-small: Execution clock
text.so-clock: 39.4 ms
text.so-index: Time (ms)
text.so-index: 10
text.so-index: 20
text.so-index: 30
text.so-index: 40
text.so-index: 50
text.so-index: 60
text.so-lane-title: Baseline scheduling
text.so-small: 6 / 8 output units delivered
text.so-label: CPU
text.so-label: GPU
text.so-op: P1
text.so-op: D1
text.so-index: STEP 1
text.so-word: Cap
text.so-word: Tests
text.so-op: P2
text.so-op: D2
text.so-index: STEP 2
text.so-word: is
text.so-word: now
text.so-op: P3
text.so-op: D3
text.so-index: STEP 3
text.so-word: two
text.so-word: all
text.so-op: P4
text.so-op: D4
text.so-index: STEP 4
text.so-small: Output
text.so-small: User A
text.so-small: User B
text.so-lane-title: Overlapped scheduling
text.so-small: Output complete · 37 ms
text.so-word: years.
text.so-word: pass.
text.so-small: Scheduling consequence
text.so-card-title: All 8 tokens by 37 ms
text.so-card-title: instead of 52 ms
tspan.so-unit: ms
text.so-small: earlier final delivery
text.so-small: Last output arrives at
text.so-small: Baseline
text.so-value: 52 ms
text.so-small: Overlapped
text.so-value: 37 ms
text.so-small: GPU work, both lanes
text.so-note: Work overlaps; it is not removed.
text.so-value: Δ 15 ms earlier
text.so-note: P: prepare batch
text.so-note: D: deliver output
text.so-note: Red: GPU waiting for CPU
text.so-note: Select a step to follow its output
time.: 21.6 / 28s
button.: One decode step
button.: CPU-induced waiting
button.: Overlapped execution
button.: Earlier delivery
button.: Time vs. GPU work

## t=28s stage 659/659 doc 1440/1440 secH 900 minFont 9.3
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
mark.: 52 → 37 ms
small.: four decode steps, two streams
strong.: Serving system overview
strong.: Serving glossary
h3.: CPU/GPU scheduling overlap
p.: Separate elapsed time from GPU work
span.: Two fixed streams
span.: Host work
button.: Balanced host
button.: Slower CPU
button.: No CPU overhead
span.so-inputs: Per step: CPU batch 3 ms · GPU pass 8 ms · CPU return 2 ms
text.so-small: Execution clock
text.so-clock: 52 ms
text.so-index: Time (ms)
text.so-index: 10
text.so-index: 20
text.so-index: 30
text.so-index: 40
text.so-index: 50
text.so-index: 60
text.so-lane-title: Baseline scheduling
text.so-small: Output complete · 52 ms
text.so-label: CPU
text.so-label: GPU
text.so-op: P1
text.so-op: D1
text.so-index: STEP 1
text.so-word: Cap
text.so-word: Tests
text.so-op: P2
text.so-op: D2
text.so-index: STEP 2
text.so-word: is
text.so-word: now
text.so-op: P3
text.so-op: D3
text.so-index: STEP 3
text.so-word: two
text.so-word: all
text.so-op: P4
text.so-op: D4
text.so-index: STEP 4
text.so-word: years.
text.so-word: pass.
text.so-small: Output
text.so-small: User A
text.so-small: User B
text.so-lane-title: Overlapped scheduling
text.so-small: Output complete · 37 ms
text.so-small: Scheduling consequence
text.so-card-title: 15 ms sooner (−29%)
text.so-card-title: same 32 ms of GPU work
tspan.so-unit: ms
text.so-small: earlier final delivery
text.so-small: Last output arrives at
text.so-small: Baseline
text.so-value: 52 ms
text.so-small: Overlapped
text.so-value: 37 ms
text.so-small: GPU work, both lanes
text.so-note: Work overlaps; it is not removed.
text.so-value: Δ 15 ms earlier
text.so-note: P: prepare batch
text.so-note: D: deliver output
text.so-note: Red: GPU waiting for CPU
text.so-note: Select a step to follow its output
time.: 28 / 28s
button.: One decode step
button.: CPU-induced waiting
button.: Overlapped execution
button.: Earlier delivery
button.: Time vs. GPU work
