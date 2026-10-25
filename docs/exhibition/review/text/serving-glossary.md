# Serving glossary

## at 1s
h3: Serving glossary
span: Nine terms from production serving, each with one number from this lab and the place it runs.
text.g-t: event: token
text.g-code: data: "The"
text.g-code: data: " cache"
text.g-code: data: " stores"
text.g-code: data: [DONE]
text.g-t: open
text.g-t: disconnect → free pages
strong: Streaming over SSE
em: one event per token
span.gb-value: 0 pages held after a disconnect
small: pages held after a disconnect
button: See it in the microscope ↗
text.g-t: MHA · BF16
text.g-t: GQA · BF16
text.g-t: GQA · FP8
text.g-t: users at 32k context · one 80 GB GPU
strong: KV cache sizing
em: 2 × 36 layers × 8 KV heads × 128 × 2 B
span.gb-value: 144 KiB per token · 12 users at 32k on 80 GB
mark: 144 KiB
small: per token · 12 users at 32k on 80 GB
button: Open the KV capacity study ↗
text.g-t: contiguous reserve
text.g-t: 16-token pages
text.g-t: waste ≤ 1 page per sequence
strong: PagedAttention
em: 16-token pages · block table
span.gb-value: ≤ 15 tokens wasted per sequence
mark: ≤ 15
small: tokens wasted per sequence
text.g-t: tile in SRAM
text.g-t: online softmax
text.g-t: N×N writes
text.g-t: to HBM
strong: FlashAttention
em: tiled · online softmax
span.gb-value: 0 N × N score writes to HBM
small: N × N score writes to HBM
text.g-t: static
text.g-t: continuous
strong: Continuous batching
em: admit at every iteration
span.gb-value: 11.65 → 0 worker-s idle with work waiting
mark: 11.65 → 0
small: worker-s idle with work waiting
text.g-t: BF16
text.g-t: 8.04 GB
text.g-t: FP8
text.g-t: 4.02 GB
text.g-t: INT4
text.g-t: 2.01 GB
text.g-t: Qwen3-4B weights read per token
strong: Quantization
em: FP8 · INT4 AWQ
span.gb-value: 8.04 → 2.01 GB of weights per decode step
mark: 8.04 → 2.01
small: GB of weights per decode step
text.g-t: TTFT
text.g-n: 105 ms
text.g-t: TPOT
text.g-n: 10.3 ms
text.g-t: KV util
text.g-n: 82%
text.g-t: prefix hit
text.g-n: 93.8%
strong: Observability
em: TTFT · TPOT · KV util · prefix hit
span.gb-value: 93.8% prefix hit · 90 of 96
mark: 93.8%
small: prefix hit · 90 of 96
text.g-t: vLLM
text.g-t: paged KV
text.g-t: TRT-LLM
text.g-t: FP8 engine
text.g-t: SGLang
text.g-t: radix tree
text.g-t: one OpenAI-compatible API
strong: vLLM · TRT-LLM · SGLang
em: paged KV · compiled FP8 · radix prefix tree
text.g-t: queue depth
text.g-t: replicas
strong: GPU autoscaling
em: scale on queue depth · warm pool
span.gb-value: 61 → 6 s to serve · cold vs warm replica
mark: 61 → 6
small: s to serve · cold vs warm replica
