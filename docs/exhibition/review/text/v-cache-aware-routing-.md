# Cache-aware routing 1440x900

## t=3s stage 659/659 doc 1440/1440 secH 900 minFont 7.1
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
mark.: −20 ms
small.: first token on the warm replica
strong.: CPU / GPU overlap
strong.: Serving system overview
strong.: Serving glossary
h3.: KV capacity & cache-aware routing
p.: Locate compatible KV state
span.: Event trace · alternative placements
span.: Prefix on A
button.: Ready
button.: Evicted
span.: Existing request R holds
button.: 4 / 12 pages
button.: 8 / 12 pages
text.cr-section: Request C · “What changed in the liability cap?”
text.cr-small: P1
text.cr-small: P2
text.cr-small: P3
text.cr-small: P4
text.cr-small: S1
text.cr-small: S2
text.cr-small: O1
text.cr-small: O2
text.cr-small: 96 input tokens · up to 32 output tokens
text.cr-small: P: shared prefix · S: new suffix · O: output reserve
text.cr-section: Replica A · prefix ready
text.cr-small: KV capacity blocks admission
text.cr-page: P1
text.cr-tiny: #0 · 0 ref
text.cr-page: P2
text.cr-tiny: #1 · 0 ref
text.cr-page: P3
text.cr-tiny: #2 · 0 ref
text.cr-page: P4
text.cr-tiny: #3 · 0 ref
text.cr-tiny: #4 · 1 ref
text.cr-tiny: #5 · 1 ref
text.cr-tiny: #6 · 1 ref
text.cr-tiny: #7 · 1 ref
text.cr-tiny: #8 · 1 ref
text.cr-tiny: #9 · 1 ref
text.cr-tiny: #10 · 1 ref
text.cr-tiny: #11 · 1 ref
text.cr-small: 0 empty · 4 retained · 8 referenced
text.cr-tiny: R owns 8 pages until 20 ms
text.cr-small: Input work on this replica
text.cr-tiny: ready
text.cr-page: S1
text.cr-tiny: prefill
text.cr-page: S2
text.cr-small: 0 / 32 answer tokens
text.cr-small: Request clock
text.cr-small: TTFT 42 ms
text.cr-section: Replica B · no cached prefix
text.cr-small: capacity available
text.cr-tiny: #4 · 0 ref
text.cr-tiny: #5 · 0 ref
text.cr-tiny: #6 · 0 ref
text.cr-tiny: #7 · 0 ref
text.cr-tiny: #8 · 0 ref
text.cr-tiny: #9 · 0 ref
text.cr-tiny: #10 · 0 ref
text.cr-tiny: #11 · 0 ref
text.cr-small: 12 empty · 0 retained · 0 referenced
text.cr-tiny: No resident request holds memory
text.cr-small: TTFT 62 ms
text.cr-small: One elapsed clock · 0 ms
text.cr-small: KV wait
text.cr-small: prefill
text.cr-small: decode
span.: Request C · 12 pages per replica
h4.: A keeps the prefix. B must read it.
dt.: Input tokens
dd.: 96
dt.: Ready on A
dd.: 64
dt.: A must process
dd.: 32
dt.: B must process
p.: The matching prefix is retained model state. The new suffix and answer still need execution.
time.: 3.6 / 44s
button.: Locate the prefix
button.: Check KV capacity
button.: Release and admit
button.: First token delivered
button.: Compare the delay
button.: Find the routing crossover
button.: Inspect released pages

## t=12s stage 659/659 doc 1440/1440 secH 900 minFont 7.1
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
mark.: −20 ms
small.: first token on the warm replica
strong.: CPU / GPU overlap
strong.: Serving system overview
strong.: Serving glossary
h3.: KV capacity & cache-aware routing
p.: Release pages, then process the input
span.: Event trace · alternative placements
span.: Prefix on A
button.: Ready
button.: Evicted
span.: Existing request R holds
button.: 4 / 12 pages
button.: 8 / 12 pages
text.cr-section: Request C · “What changed in the liability cap?”
text.cr-small: P1
text.cr-small: P2
text.cr-small: P3
text.cr-small: P4
text.cr-small: S1
text.cr-small: S2
text.cr-small: O1
text.cr-small: O2
text.cr-small: 96 input tokens · up to 32 output tokens
text.cr-small: P: shared prefix · S: new suffix · O: output reserve
text.cr-section: Replica A · prefix ready
text.cr-small: waiting for KV
text.cr-page: P1
text.cr-tiny: #0 · 0 ref
text.cr-page: P2
text.cr-tiny: #1 · 0 ref
text.cr-page: P3
text.cr-tiny: #2 · 0 ref
text.cr-page: P4
text.cr-tiny: #3 · 0 ref
text.cr-tiny: #4 · 1 ref
text.cr-tiny: #5 · 1 ref
text.cr-tiny: #6 · 1 ref
text.cr-tiny: #7 · 1 ref
text.cr-tiny: #8 · 1 ref
text.cr-tiny: #9 · 1 ref
text.cr-tiny: #10 · 1 ref
text.cr-tiny: #11 · 1 ref
text.cr-small: 0 empty · 4 retained · 8 referenced
text.cr-tiny: R owns 8 pages until 20 ms
text.cr-small: Input work on this replica
text.cr-tiny: ready
text.cr-page: S1
text.cr-tiny: prefill
text.cr-page: S2
text.cr-small: 0 / 32 answer tokens
text.cr-small: Request clock
text.cr-small: TTFT 42 ms
text.cr-section: Replica B · no cached prefix
text.cr-small: processing input
text.cr-tiny: #0 · 1 ref
text.cr-tiny: #1 · 1 ref
text.cr-tiny: #2 · 1 ref
text.cr-tiny: #3 · 1 ref
text.cr-page: O1
text.cr-page: O2
text.cr-tiny: #8 · 0 ref
text.cr-tiny: #9 · 0 ref
text.cr-tiny: #10 · 0 ref
text.cr-tiny: #11 · 0 ref
text.cr-small: 4 empty · 0 retained · 8 referenced
text.cr-tiny: C → #0 #1 #2 #3 #4 #5 #6 #7
text.cr-tiny: read
text.cr-small: TTFT 62 ms
text.cr-small: One elapsed clock · 15.7 ms
text.cr-small: KV wait
text.cr-small: prefill
text.cr-small: decode
span.: Request C · 12 pages per replica
h4.: Release memory before admitting work.
dt.: A · reusable prefix
dd.: 4 pages
dt.: A · new pages needed
dt.: A · empty slots at arrival
strong.: Wait 20 ms
span.: R's release creates enough room.
time.: 12.6 / 44s
button.: Locate the prefix
button.: Check KV capacity
button.: Release and admit
button.: First token delivered
button.: Compare the delay
button.: Find the routing crossover
button.: Inspect released pages

## t=20s stage 659/659 doc 1440/1440 secH 900 minFont 7.1
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
mark.: −20 ms
small.: first token on the warm replica
strong.: CPU / GPU overlap
strong.: Serving system overview
strong.: Serving glossary
h3.: KV capacity & cache-aware routing
p.: Compare first-token delivery
span.: Event trace · alternative placements
span.: Prefix on A
button.: Ready
button.: Evicted
span.: Existing request R holds
button.: 4 / 12 pages
button.: 8 / 12 pages
text.cr-section: Request C · “What changed in the liability cap?”
text.cr-small: P1
text.cr-small: P2
text.cr-small: P3
text.cr-small: P4
text.cr-small: S1
text.cr-small: S2
text.cr-small: O1
text.cr-small: O2
text.cr-small: 96 input tokens · up to 32 output tokens
text.cr-small: P: shared prefix · S: new suffix · O: output reserve
text.cr-section: Replica A · prefix ready
text.cr-small: streaming answer
text.cr-page: P1
text.cr-tiny: #0 · 1 ref
text.cr-page: P2
text.cr-tiny: #1 · 1 ref
text.cr-page: P3
text.cr-tiny: #2 · 1 ref
text.cr-page: P4
text.cr-tiny: #3 · 1 ref
text.cr-page: S1
text.cr-tiny: #4 · 1 ref
text.cr-page: S2
text.cr-tiny: #5 · 1 ref
text.cr-page: O1
text.cr-tiny: #6 · 1 ref
text.cr-page: O2
text.cr-tiny: #7 · 1 ref
text.cr-tiny: #8 · 0 ref
text.cr-tiny: #9 · 0 ref
text.cr-tiny: #10 · 0 ref
text.cr-tiny: #11 · 0 ref
text.cr-small: 4 empty · 0 retained · 8 referenced
text.cr-tiny: C → #0 #1 #2 #3 #4 #5 #6 #7
text.cr-small: Input work on this replica
text.cr-tiny: reused
text.cr-tiny: read
text.cr-small: 4 / 32 answer tokens
text.cr-small: Request clock
text.cr-small: TTFT 42 ms
text.cr-section: Replica B · no cached prefix
text.cr-small: processing input
text.cr-tiny: prefill
text.cr-small: 0 / 32 answer tokens
text.cr-small: TTFT 62 ms
text.cr-small: One elapsed clock · 48.2 ms
text.cr-small: KV wait
text.cr-small: prefill
text.cr-small: decode
text.cr-page: Δ 20 ms
span.: Same input · same output allowance
h4.: Replica A delivers first.
small.: ms
span.: A delivers the first token earlier
dt.: Replica B · full input
dd.: 62 ms
dt.: Replica A · selected state
dd.: 42 ms
span.: 40 ms less prefill
span.: 20 ms waiting
strong.: 20 ms earlier on A
time.: 20.6 / 44s
button.: Locate the prefix
button.: Check KV capacity
button.: Release and admit
button.: First token delivered
button.: Compare the delay
button.: Find the routing crossover
button.: Inspect released pages

## t=28s stage 659/659 doc 1440/1440 secH 900 minFont 7.1
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
mark.: −20 ms
small.: first token on the warm replica
strong.: CPU / GPU overlap
strong.: Serving system overview
strong.: Serving glossary
h3.: KV capacity & cache-aware routing
p.: Separate waiting from saved work
span.: Event trace · alternative placements
span.: Prefix on A
button.: Ready
button.: Evicted
span.: Existing request R holds
button.: 4 / 12 pages
button.: 8 / 12 pages
text.cr-section: Request C · “What changed in the liability cap?”
text.cr-small: P1
text.cr-small: P2
text.cr-small: P3
text.cr-small: P4
text.cr-small: S1
text.cr-small: S2
text.cr-small: O1
text.cr-small: O2
text.cr-small: 96 input tokens · up to 32 output tokens
text.cr-small: P: shared prefix · S: new suffix · O: output reserve
text.cr-section: Replica A · prefix now retained
text.cr-small: request complete
text.cr-page: P1
text.cr-tiny: #0 · 0 ref
text.cr-page: P2
text.cr-tiny: #1 · 0 ref
text.cr-page: P3
text.cr-tiny: #2 · 0 ref
text.cr-page: P4
text.cr-tiny: #3 · 0 ref
text.cr-tiny: #4 · 0 ref
text.cr-tiny: #5 · 0 ref
text.cr-tiny: #6 · 0 ref
text.cr-tiny: #7 · 0 ref
text.cr-tiny: #8 · 0 ref
text.cr-tiny: #9 · 0 ref
text.cr-tiny: #10 · 0 ref
text.cr-tiny: #11 · 0 ref
text.cr-small: 8 empty · 4 retained · 0 referenced
text.cr-tiny: C's block table released
text.cr-small: Input work on this replica
text.cr-tiny: reused
text.cr-page: S1
text.cr-tiny: read
text.cr-page: S2
text.cr-small: 32 / 32 answer tokens
text.cr-small: Request clock
text.cr-small: TTFT 42 ms
text.cr-section: Replica B · no cached prefix
text.cr-small: streaming answer
text.cr-tiny: #0 · 1 ref
text.cr-tiny: #1 · 1 ref
text.cr-tiny: #2 · 1 ref
text.cr-tiny: #3 · 1 ref
text.cr-tiny: #4 · 1 ref
text.cr-tiny: #5 · 1 ref
text.cr-page: O1
text.cr-tiny: #6 · 1 ref
text.cr-page: O2
text.cr-tiny: #7 · 1 ref
text.cr-small: 4 empty · 0 retained · 8 referenced
text.cr-tiny: C → #0 #1 #2 #3 #4 #5 #6 #7
text.cr-small: 28 / 32 answer tokens
text.cr-small: TTFT 62 ms
text.cr-small: One elapsed clock · 116.7 ms
text.cr-small: KV wait
text.cr-small: prefill
text.cr-small: decode
text.cr-page: Δ 20 ms
span.: Same input · same output allowance
h4.: Reuse wins when the memory wait is short.
small.: ms
span.: A delivers the first token earlier
dt.: Replica B · full input
dd.: 62 ms
dt.: Replica A · selected state
dd.: 42 ms
span.: 40 ms less prefill
span.: 20 ms waiting
strong.: 20 ms earlier on A
time.: 28.8 / 44s
button.: Locate the prefix
button.: Check KV capacity
button.: Release and admit
button.: First token delivered
button.: Compare the delay
button.: Find the routing crossover
button.: Inspect released pages

## t=36s stage 659/659 doc 1440/1440 secH 900 minFont 8.7
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
mark.: −20 ms
small.: first token on the warm replica
strong.: CPU / GPU overlap
strong.: Serving system overview
strong.: Serving glossary
h3.: KV capacity & cache-aware routing
p.: Find the routing crossover
span.: Event trace · alternative placements
span.: Prefix on A
button.: Ready
button.: Evicted
span.: Existing request R holds
button.: 4 / 12 pages
button.: 8 / 12 pages
text.cr-section: Request C · “What changed in the liability cap?”
text.cr-small: P1
text.cr-small: P2
text.cr-small: P3
text.cr-small: P4
text.cr-small: S1
text.cr-small: S2
text.cr-small: O1
text.cr-small: O2
text.cr-small: 96 input tokens · up to 32 output tokens
text.cr-small: P: shared prefix · S: new suffix · O: output reserve
text.cr-section: Routing sensitivity · change R's release delay
text.cr-small: 40
text.cr-small: 80
text.cr-small: 120
text.cr-small: 160
text.cr-small: 20
text.cr-small: 60
text.cr-small: 100
text.cr-small: First-token latency (ms) ↓
text.cr-small: Delay before request R releases its KV pages (ms)
text.cr-small: 40 ms crossover
text.cr-page: Replica A · reuse if admitted
text.cr-page: Replica B · read the full input
text.cr-small: 61 ms release delay · Replica B delivers first
text.cr-small: Drag or use ← →. On touch, adjust the release slider above.
span.: Sensitivity sweep · same request, alternate wait
h4.: Waiting outweighs the prefill saving.
small.: ms
span.: B delivers the first token earlier
dt.: Replica B · full input
dd.: 62 ms
dt.: Replica A · selected state
dd.: 83 ms
span.: 40 ms less prefill
span.: 61 ms waiting
strong.: 21 ms later on A
time.: 36.6 / 44s
button.: Locate the prefix
button.: Check KV capacity
button.: Release and admit
button.: First token delivered
button.: Compare the delay
button.: Find the routing crossover
button.: Inspect released pages

## t=44s stage 659/659 doc 1440/1440 secH 900 minFont 7.1
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
mark.: −20 ms
small.: first token on the warm replica
strong.: CPU / GPU overlap
strong.: Serving system overview
strong.: Serving glossary
h3.: KV capacity & cache-aware routing
p.: Release the request's private pages
span.: Event trace · alternative placements
span.: Prefix on A
button.: Ready
button.: Evicted
span.: Existing request R holds
button.: 4 / 12 pages
button.: 8 / 12 pages
text.cr-section: Request C · “What changed in the liability cap?”
text.cr-small: P1
text.cr-small: P2
text.cr-small: P3
text.cr-small: P4
text.cr-small: S1
text.cr-small: S2
text.cr-small: O1
text.cr-small: O2
text.cr-small: 96 input tokens · up to 32 output tokens
text.cr-small: P: shared prefix · S: new suffix · O: output reserve
text.cr-section: Replica A · prefix now retained
text.cr-small: request complete
text.cr-page: P1
text.cr-tiny: #0 · 0 ref
text.cr-page: P2
text.cr-tiny: #1 · 0 ref
text.cr-page: P3
text.cr-tiny: #2 · 0 ref
text.cr-page: P4
text.cr-tiny: #3 · 0 ref
text.cr-tiny: #4 · 0 ref
text.cr-tiny: #5 · 0 ref
text.cr-tiny: #6 · 0 ref
text.cr-tiny: #7 · 0 ref
text.cr-tiny: #8 · 0 ref
text.cr-tiny: #9 · 0 ref
text.cr-tiny: #10 · 0 ref
text.cr-tiny: #11 · 0 ref
text.cr-small: 8 empty · 4 retained · 0 referenced
text.cr-tiny: C's block table released
text.cr-small: Input work on this replica
text.cr-tiny: reused
text.cr-page: S1
text.cr-tiny: read
text.cr-page: S2
text.cr-small: 32 / 32 answer tokens
text.cr-small: Request clock
text.cr-small: TTFT 42 ms
text.cr-section: Replica B · prefix now retained
text.cr-small: TTFT 62 ms
text.cr-small: One elapsed clock · 134 ms
text.cr-small: KV wait
text.cr-small: prefill
text.cr-small: decode
text.cr-section: Both prefixes remain cached. Private pages are free.
span.: Request C · 12 pages per replica
h4.: Keep reusable KV. Release private capacity.
dt.: Private pages released
dd.: 4 each
dt.: Ready prefix retained
dt.: Active C references
dt.: Answer tokens delivered
dd.: 32 each
p.: B has now paid to compute the prefix too. A later matching request can reuse it on either replica.
time.: 44.0 / 44s
button.: Locate the prefix
button.: Check KV capacity
button.: Release and admit
button.: First token delivered
button.: Compare the delay
button.: Find the routing crossover
button.: Inspect released pages
