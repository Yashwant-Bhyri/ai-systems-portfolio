# Prefill / decode scheduling

## at 3s
span: Four requests · one device per lane
h3: Decode existing requests
time: 35 ms · shared clock
small: ms · shared clock
text.sp-lane-title: Baseline
text.sp-small: Finish new input before generating
text.sp-label: New document · request 3
text.sp-small: Arrives at 40 ms
text.sp-label: KV slots
text.sp-small: 6/24 reserved
text.sp-chip-text: iteration 5
text.sp-small: 0 input · 2 output tokens
text.sp-label: Existing answer · request 1
text.sp-small: 3 / 24 tokens delivered
text.sp-small: Answer token events
text.sp-lane-title: Chunked prefill
text.sp-small: Keep answer tokens in the loop
text.sp-chip-text: iteration 6
text.sp-small: 4 / 24 tokens delivered
text.sp-small: 0 ms
text.sp-small: 100 ms
text.sp-small: 200 ms
text.sp-small: 300 ms
span.sp-result-label: Existing answer · request 1
h4: Answer tokens delivered
span: Baseline
strong: 3 / 24 tokens
small: / 24 tokens
span: Generating the answer
span: Chunked
strong: 4 / 24 tokens
button: Inspect the stream gap ↗
button: Inspect the first-token tradeoff ↗
label: Input + output tokens per chunked iteration16 tokens32 tokens64 tokens
label: KV reservation pool24 pages · document fits12 pages · document waits
time: 3.5 / 36 s
button: ↺ Replay
button: Answer in flight
button: Document arrives
button: Baseline interruption
button: Interleave the work
button: Compare the gap
button: Expose the tradeoff
button: Inspect iterations, reservations & export ↗

## at 10s
span: Four requests · one device per lane
h3: Prefill/decode scheduling
time: 106.6 ms · shared clock
small: ms · shared clock
text.sp-lane-title: Baseline
text.sp-small: Finish new input before generating
text.sp-label: New document · request 3
text.sp-small: 128 / 128 input tokens read
text.sp-small: + request 4 · 32 input tokens
text.sp-label: KV slots
text.sp-small: 18/24 reserved
text.sp-chip-text: iteration 11
text.sp-small: 0 input · 4 output tokens
text.sp-label: Existing answer · request 1
text.sp-small: 7 / 24 tokens delivered
text.sp-small: Answer token events
text.sp-small: 56 ms
text.sp-lane-title: Chunked prefill
text.sp-small: Keep answer tokens in the loop
text.sp-small: 98 / 128 input tokens read
text.sp-chip-text: iteration 14
text.sp-small: 14 input · 2 output tokens
text.sp-small: 12 / 24 tokens delivered
text.sp-small: 0 ms
text.sp-small: 100 ms
text.sp-small: 200 ms
text.sp-small: 300 ms
span.sp-result-label: Existing answer · request 1
h4: Answer tokens delivered
span: Baseline
strong: 7 / 24 tokens
small: / 24 tokens
span: Generating the answer
span: Chunked
strong: 12 / 24 tokens
button: Inspect the stream gap ↗
button: Inspect the first-token tradeoff ↗
label: Input + output tokens per chunked iteration16 tokens32 tokens64 tokens
label: KV reservation pool24 pages · document fits12 pages · document waits
time: 10.5 / 36 s
button: ↺ Replay
button: Answer in flight
button: Document arrives
button: Baseline interruption
button: Interleave the work
button: Compare the gap
button: Expose the tradeoff
button: Inspect iterations, reservations & export ↗

## at 20s
span: Four requests · one device per lane
h3: Whole prefill blocks decode
time: 228 ms · shared clock
small: ms · shared clock
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
h4: Maximum inter-token latency (ITL)
span: Baseline
strong: 56 ms
small: ms
span: Chunked
strong: 10.25 ms
p.sp-payoff: Δ 45.75 ms shorter pause
p.sp-reason: Chunked prefill makes room for decode between pieces of the arriving input.
button: Inspect the stream gap ↗
button: Inspect the first-token tradeoff ↗
label: Input + output tokens per chunked iteration16 tokens32 tokens64 tokens
label: KV reservation pool24 pages · document fits12 pages · document waits
time: 20.5 / 36 s
button: ↺ Replay
button: Answer in flight
button: Document arrives
button: Baseline interruption
button: Interleave the work
button: Compare the gap
button: Expose the tradeoff
button: Inspect iterations, reservations & export ↗

## at 30s
span: Four requests · one device per lane
h3: First-token latency tradeoff
time: 228 ms · shared clock
small: ms · shared clock
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
h4: Time to first token (TTFT)
span: Baseline
strong: 58 ms
small: ms
span: Chunked
strong: 105.25 ms
p.sp-payoff: Δ 47.25 ms longer wait
p.sp-reason: Interleaving existing answers delays completion of the new input.
button: Inspect the stream gap ↗
button: Inspect the first-token tradeoff ↗
label: Input + output tokens per chunked iteration16 tokens32 tokens64 tokens
label: KV reservation pool24 pages · document fits12 pages · document waits
time: 30.5 / 36 s
button: ↺ Replay
button: Answer in flight
button: Document arrives
button: Baseline interruption
button: Interleave the work
button: Compare the gap
button: Expose the tradeoff
button: Inspect iterations, reservations & export ↗
