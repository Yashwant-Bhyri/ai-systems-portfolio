# Speculative decoding

## at 3s
button: Draft and target, as agents
button: Round-by-round accounting
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
text.df-label: one word per call
text.df-label: draft, then verify
p.df-caption: A small model guesses the next five words.

## at 10s
button: Draft and target, as agents
button: Round-by-round accounting
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

## at 20s
button: Draft and target, as agents
button: Round-by-round accounting
text.df-kicker: SPECULATIVE DECODING · DRAFT k = 5 · ONE TARGET PASS
text.df-word: The cache stores
text.df-agent-name: Draft model
text.df-agent-meta: Qwen3-0.6B · fast, cheap
text.df-agent-meta: guesses k = 5 tokens
text.df-agent-name: Target model
text.df-agent-meta: Qwen3-4B · the answer's owner
text.df-agent-meta: checks all five in one pass
text.df-agent-meta: writes its own word on a miss
text.df-label: one word per call
text.df-label: draft, then verify
p.df-caption: The answer so far.
