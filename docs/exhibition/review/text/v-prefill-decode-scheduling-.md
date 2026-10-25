# Prefill / decode scheduling 1440x900

## t=3s stage 659/659 doc 1440/1440 secH 900 minFont 8.9
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
mark.: 56 → 10.25 ms
small.: longest gap in request 1's stream
strong.: Speculative decoding
strong.: Cache-aware routing
strong.: CPU / GPU overlap
strong.: Serving system overview
strong.: Serving glossary
span.: Four requests · one device per lane
h3.: Decode existing requests
small.: ms · shared clock
text.sp-lane-title: Baseline
text.sp-small: Finish new input before generating
text.sp-label: New document · request 3
text.sp-small: Arrives at 40 ms
text.sp-label: KV slots
text.sp-small: 6/24 reserved
text.sp-chip-text: iteration 6
text.sp-small: 0 input · 2 output tokens
text.sp-label: Existing answer · request 1
text.sp-small: 4 / 24 tokens delivered
text.sp-small: Answer token events
text.sp-lane-title: Chunked prefill
text.sp-small: Keep answer tokens in the loop
text.sp-small: 0 ms
text.sp-small: 100 ms
text.sp-small: 200 ms
text.sp-small: 300 ms
span.sp-result-label: Existing answer · request 1
h4.: Answer tokens delivered
span.: Baseline
small.: / 24 tokens
span.: Generating the answer
span.: Chunked
time.: 4.8 / 36 s
button.: ↺ Replay
button.: Answer in flight
button.: Document arrives
button.: Baseline interruption
button.: Interleave the work
button.: Compare the gap
button.: Expose the tradeoff
button.: Inspect iterations, reservations & export ↗

## t=10s stage 659/659 doc 1440/1440 secH 900 minFont 8.9
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
mark.: 56 → 10.25 ms
small.: longest gap in request 1's stream
strong.: Speculative decoding
strong.: Cache-aware routing
strong.: CPU / GPU overlap
strong.: Serving system overview
strong.: Serving glossary
span.: Four requests · one device per lane
h3.: Prefill/decode scheduling
small.: ms · shared clock
text.sp-lane-title: Baseline
text.sp-small: Finish new input before generating
text.sp-label: New document · request 3
text.sp-small: 128 / 128 input tokens read
text.sp-small: + request 4 · 32 input tokens
text.sp-label: KV slots
text.sp-small: 18/24 reserved
text.sp-chip-text: iteration 13
text.sp-small: 0 input · 4 output tokens
text.sp-label: Existing answer · request 1
text.sp-small: 9 / 24 tokens delivered
text.sp-small: Answer token events
text.sp-small: 56 ms
text.sp-lane-title: Chunked prefill
text.sp-small: Keep answer tokens in the loop
text.sp-small: 126 / 128 input tokens read
text.sp-chip-text: iteration 16
text.sp-small: 14 input · 2 output tokens
text.sp-small: 14 / 24 tokens delivered
text.sp-small: 0 ms
text.sp-small: 100 ms
text.sp-small: 200 ms
text.sp-small: 300 ms
span.sp-result-label: Existing answer · request 1
h4.: Answer tokens delivered
span.: Baseline
small.: / 24 tokens
span.: Generating the answer
span.: Chunked
time.: 11.7 / 36 s
button.: ↺ Replay
button.: Answer in flight
button.: Document arrives
button.: Baseline interruption
button.: Interleave the work
button.: Compare the gap
button.: Expose the tradeoff
button.: Inspect iterations, reservations & export ↗

## t=20s stage 659/659 doc 1440/1440 secH 900 minFont 8.9
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
mark.: 56 → 10.25 ms
small.: longest gap in request 1's stream
strong.: Speculative decoding
strong.: Cache-aware routing
strong.: CPU / GPU overlap
strong.: Serving system overview
strong.: Serving glossary
span.: Four requests · one device per lane
h3.: Interleave prefill and decode
small.: ms · shared clock
text.sp-lane-title: Baseline
text.sp-small: Finish new input before generating
text.sp-label: New document · request 3
text.sp-small: 128 / 128 input tokens read
text.sp-small: + request 4 · 32 input tokens
text.sp-label: KV slots
text.sp-small: 0/24 reserved
text.sp-chip-text: device released
text.sp-small: All four requests finished
text.sp-label: Existing answer · request 1
text.sp-small: 24 tokens delivered
text.sp-small: Answer token events
text.sp-small: 56 ms
text.sp-lane-title: Chunked prefill
text.sp-small: Keep answer tokens in the loop
text.sp-small: 10.25 ms
text.sp-small: 0 ms
text.sp-small: 100 ms
text.sp-small: 200 ms
text.sp-small: 300 ms
span.sp-result-label: Existing answer · request 1
h4.: Maximum inter-token latency (ITL)
span.: Baseline
small.: ms
span.: Chunked
p.sp-payoff: Δ 45.75 ms shorter pause
p.sp-reason: Chunked prefill makes room for decode between pieces of the arriving input.
time.: 21.9 / 36 s
button.: ↺ Replay
button.: Answer in flight
button.: Document arrives
button.: Baseline interruption
button.: Interleave the work
button.: Compare the gap
button.: Expose the tradeoff
button.: Inspect iterations, reservations & export ↗

## t=30s stage 659/659 doc 1440/1440 secH 900 minFont 8.9
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
mark.: 56 → 10.25 ms
small.: longest gap in request 1's stream
strong.: Speculative decoding
strong.: Cache-aware routing
strong.: CPU / GPU overlap
strong.: Serving system overview
strong.: Serving glossary
span.: Four requests · one device per lane
h3.: First-token latency tradeoff
small.: ms · shared clock
text.sp-lane-title: Baseline
text.sp-small: Finish new input before generating
text.sp-label: New document · request 3
text.sp-small: 128 / 128 input tokens read
text.sp-small: + request 4 · 32 input tokens
text.sp-label: KV slots
text.sp-small: 0/24 reserved
text.sp-chip-text: device released
text.sp-small: All four requests finished
text.sp-label: Existing answer · request 1
text.sp-small: 24 tokens delivered
text.sp-small: Answer token events
text.sp-small: New request TTFT: 58 ms
text.sp-lane-title: Chunked prefill
text.sp-small: Keep answer tokens in the loop
text.sp-small: New request TTFT: 105.25 ms
text.sp-small: 0 ms
text.sp-small: 100 ms
text.sp-small: 200 ms
text.sp-small: 300 ms
span.sp-result-label: New document · request 3
h4.: Time to first token (TTFT)
span.: Baseline
small.: ms
span.: Chunked
p.sp-payoff: Δ 47.25 ms longer wait
p.sp-reason: Interleaving existing answers delays completion of the new input.
time.: 31.8 / 36 s
button.: ↺ Replay
button.: Answer in flight
button.: Document arrives
button.: Baseline interruption
button.: Interleave the work
button.: Compare the gap
button.: Expose the tradeoff
button.: Inspect iterations, reservations & export ↗

## t=37s stage 659/659 doc 1440/1440 secH 900 minFont 8.9
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
mark.: 56 → 10.25 ms
small.: longest gap in request 1's stream
strong.: Speculative decoding
strong.: Cache-aware routing
strong.: CPU / GPU overlap
strong.: Serving system overview
strong.: Serving glossary
span.gc-tag: Smaller KV pool
span.: Four requests · one device per lane
h3.: KV capacity limits admission
small.: ms · shared clock
text.sp-lane-title: Baseline
text.sp-small: Finish new input before generating
text.sp-label: New document · request 3
text.sp-small: 128 / 128 input tokens read
text.sp-small: + request 4 · 32 input tokens
text.sp-label: KV slots
text.sp-small: 0/12 reserved
text.sp-chip-text: device released
text.sp-small: All four requests finished
text.sp-label: Existing answer · request 1
text.sp-small: 24 tokens delivered
text.sp-small: Answer token events
text.sp-small: 6 ms
text.sp-lane-title: Chunked prefill
text.sp-small: Keep answer tokens in the loop
text.sp-small: 0 ms
text.sp-small: 100 ms
text.sp-small: 200 ms
text.sp-small: 300 ms
span.sp-result-label: Existing answer · request 1
h4.: Maximum inter-token latency (ITL)
span.: Baseline
small.: ms
span.: Chunked
p.sp-payoff: No stream-gap reduction
p.sp-reason: Both policies keep decoding while the long document waits outside the full KV pool.
time.: 26 / 36 s
button.: ↺ Replay
button.: Answer in flight
button.: Document arrives
button.: Baseline interruption
button.: Interleave the work
button.: Compare the gap
button.: Expose the tradeoff
button.: Inspect iterations, reservations & export ↗
