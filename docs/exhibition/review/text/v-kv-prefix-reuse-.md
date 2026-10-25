# KV prefix reuse 1440x900

## t=4s stage 659/659 doc 1440/1440 secH 900 minFont 9.0
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
strong.: The experiment
span.: 01
span.: 02
span.: 03
strong.: KV prefix reuse
span.: 04
span.: 05
strong.: Policy × runtime
strong.: Where the 96 tasks land
strong.: Execution replay
strong.: Queue & latency
h4.: Compute once, retain the context
span.: Service replay
text.pr-label: θ fixed · same token rates · no answer is cached
text.pr-label: Trace close-up
text.pr-title: Contract context
text.pr-small: Request 1 · cold read
text.pr-label: 6,054 / 8,192 input tokens
text.pr-small: prompt → K, V
text.pr-title: Full prefill
text.pr-label: 7.27 GPU-s charged
text.pr-title: Build reusable state
text.pr-small: K · keys
text.pr-small: V · values
text.pr-small: not reusable until ready
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
time.: 4.3 / 34s
span.: 06

## t=12s stage 659/659 doc 1440/1440 secH 900 minFont 9.0
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
strong.: The experiment
span.: 01
span.: 02
span.: 03
strong.: KV prefix reuse
span.: 04
span.: 05
strong.: Policy × runtime
strong.: Where the 96 tasks land
strong.: Execution replay
strong.: Queue & latency
h4.: Compute the new question
span.: Service replay
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
text.pr-small: 303 / 384 new tokens
text.pr-small: softmax(qKᵀ / √d)V
text.pr-small: context stays in attention
text.pr-title: New answer
text.pr-label: 0 tokens
text.pr-small: decode work retained
text.pr-label: 7,808 repeated input tokens avoided. The context was not removed.
time.: 12.3 / 34s
span.: 06

## t=22s stage 659/659 doc 1440/1440 secH 900 minFont 9.0
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
strong.: The experiment
span.: 01
span.: 02
span.: 03
strong.: KV prefix reuse
span.: 04
span.: 05
strong.: Policy × runtime
strong.: Where the 96 tasks land
strong.: Execution replay
strong.: Queue & latency
h4.: Reuse finishes; baseline continues
span.: Service replay
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
span.: Request 7 · KV prefix reuse
strong.: 7,808 input tokens
span.: referenced from ready KV state
span.: Input computation avoided
small.: GPU-s
span.pr-cost-scope: Total work per request
small.: GPU-s baseline
small.: GPU-s reuse
time.: 22.3 / 34s
span.: 06

## t=32s stage 659/659 doc 1440/1440 secH 900 minFont 9.0
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
strong.: The experiment
span.: 01
span.: 02
span.: 03
strong.: KV prefix reuse
span.: 04
span.: 05
strong.: Policy × runtime
strong.: Where the 96 tasks land
strong.: Execution replay
strong.: Queue & latency
h4.: Prefix reuse: GPU-work comparison
span.: Service replay
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
span.: Request 7 · KV prefix reuse
strong.: 7,808 input tokens
span.: referenced from ready KV state
span.: Input computation avoided
small.: GPU-s
span.pr-cost-scope: Total work per request
small.: GPU-s baseline
small.: GPU-s reuse
b.: 39.4%
time.: 32.3 / 34s
span.: 06
