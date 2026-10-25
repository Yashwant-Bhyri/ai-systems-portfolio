# Speculative decoding 1440x900

## t=3s stage 659/659 doc 1440/1440 secH 900 minFont 10.0
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
mark.: 12 → 3
small.: serial target-model calls
strong.: Cache-aware routing
strong.: CPU / GPU overlap
strong.: Serving system overview
strong.: Serving glossary
button.: Draft and target, as agents
button.: Round-by-round accounting
text.df-kicker: SPECULATIVE DECODING · DRAFT k = 5 · ONE TARGET PASS
text.df-small: a small model guesses ahead
text.df-word: The cache stores
text.df-word: the
text.df-word: keys
text.df-word: and
text.df-word: weights
text.df-word: here
text.df-small: the large model checks all five at once
text.df-agent-name: Draft model
text.df-agent-meta: Qwen3-0.6B · fast, cheap
text.df-agent-meta: guesses k = 5 tokens
text.df-agent-name: Target model
text.df-agent-meta: Qwen3-4B · the answer's owner
text.df-agent-meta: checks all five in one pass
text.df-agent-meta: writes its own word on a miss
p.df-caption: The large model checks all five in one pass.

## t=10s stage 659/659 doc 1440/1440 secH 900 minFont 10.0
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
mark.: 12 → 3
small.: serial target-model calls
strong.: Cache-aware routing
strong.: CPU / GPU overlap
strong.: Serving system overview
strong.: Serving glossary
button.: Draft and target, as agents
button.: Round-by-round accounting
text.df-kicker: SPECULATIVE DECODING · DRAFT k = 5 · ONE TARGET PASS
text.df-word: The cache stores the keys and values
text.df-agent-name: Draft model
text.df-agent-meta: Qwen3-0.6B · fast, cheap
text.df-agent-meta: guesses k = 5 tokens
text.df-agent-name: Target model
text.df-agent-meta: Qwen3-4B · the answer's owner
text.df-agent-meta: checks all five in one pass
text.df-agent-meta: writes its own word on a miss
text.df-label: one word per call
text.df-label: draft, then verify
p.df-caption: When the first guess is wrong, the drafting is wasted.

## t=20s stage 659/659 doc 1440/1440 secH 900 minFont 10.0
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
mark.: 12 → 3
small.: serial target-model calls
strong.: Cache-aware routing
strong.: CPU / GPU overlap
strong.: Serving system overview
strong.: Serving glossary
button.: Draft and target, as agents
button.: Round-by-round accounting
text.df-kicker: SPECULATIVE DECODING · DRAFT k = 5 · ONE TARGET PASS
text.df-small: a small model guesses ahead
text.df-word: The cache stores
text.df-word: the
text.df-word: keys
text.df-word: and
text.df-word: weights
text.df-word: here
text.df-agent-name: Draft model
text.df-agent-meta: Qwen3-0.6B · fast, cheap
text.df-agent-meta: guesses k = 5 tokens
text.df-agent-name: Target model
text.df-agent-meta: Qwen3-4B · the answer's owner
text.df-agent-meta: checks all five in one pass
text.df-agent-meta: writes its own word on a miss
p.df-caption: A small model guesses the next five words.

## t=30s stage 659/659 doc 1440/1440 secH 900 minFont 10.0
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
mark.: 12 → 3
small.: serial target-model calls
strong.: Cache-aware routing
strong.: CPU / GPU overlap
strong.: Serving system overview
strong.: Serving glossary
button.: Draft and target, as agents
button.: Round-by-round accounting
text.df-kicker: SPECULATIVE DECODING · DRAFT k = 5 · ONE TARGET PASS
text.df-small: a small model guesses ahead
text.df-word: The cache stores the keys and values
text.df-word: in
text.df-agent-name: Draft model
text.df-agent-meta: Qwen3-0.6B · fast, cheap
text.df-agent-meta: guesses k = 5 tokens
text.df-agent-name: Target model
text.df-agent-meta: Qwen3-4B · the answer's owner
text.df-agent-meta: checks all five in one pass
text.df-agent-meta: writes its own word on a miss
text.df-label: one word per call
text.df-label: draft, then verify
p.df-caption: When the first guess is wrong, the drafting is wasted.

## t=45s stage 659/659 doc 1440/1440 secH 900 minFont 10.0
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
mark.: 12 → 3
small.: serial target-model calls
strong.: Cache-aware routing
strong.: CPU / GPU overlap
strong.: Serving system overview
strong.: Serving glossary
button.: Draft and target, as agents
button.: Round-by-round accounting
text.df-kicker: SPECULATIVE DECODING · DRAFT k = 5 · ONE TARGET PASS
text.df-word: The cache stores
text.df-word: the
text.df-word: keys
text.df-word: and
text.df-word: values
text.df-small: the large model's own word
text.df-agent-name: Draft model
text.df-agent-meta: Qwen3-0.6B · fast, cheap
text.df-agent-meta: guesses k = 5 tokens
text.df-agent-name: Target model
text.df-agent-meta: Qwen3-4B · the answer's owner
text.df-agent-meta: checks all five in one pass
text.df-agent-meta: writes its own word on a miss
text.df-label: one word per call
text.df-label: draft, then verify
text.df-call: 4 words · 1 call of the large model
p.df-caption: Four words for one call of the large model, instead of four.

## t=60s stage 659/659 doc 1440/1440 secH 900 minFont 10.0
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
mark.: 12 → 3
small.: serial target-model calls
strong.: Cache-aware routing
strong.: CPU / GPU overlap
strong.: Serving system overview
strong.: Serving glossary
button.: Draft and target, as agents
button.: Round-by-round accounting
text.df-kicker: SPECULATIVE DECODING · DRAFT k = 5 · ONE TARGET PASS
text.df-word: The cache stores
text.df-word: the
text.df-word: keys
text.df-word: and
text.df-word: values
text.df-small: the large model's own word
text.df-agent-name: Draft model
text.df-agent-meta: Qwen3-0.6B · fast, cheap
text.df-agent-meta: guesses k = 5 tokens
text.df-agent-name: Target model
text.df-agent-meta: Qwen3-4B · the answer's owner
text.df-agent-meta: checks all five in one pass
text.df-agent-meta: writes its own word on a miss
p.df-caption: The large model's own word replaces the mistake.
