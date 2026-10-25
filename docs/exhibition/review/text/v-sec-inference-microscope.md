# - 1440x900

## t=3s stage 899/902 OVERFLOW doc 1440/1440 secH 900 minFont 9.0
span.: 04 / INFERENCE OPTIMIZATION ENGINE
strong.: From queued prompt to streamed token, every layer of execution matters.
small.: LLM SERVING · GPU ACCELERATION · RUNTIME EFFICIENCY · 2026
span.: COMPONENT MICROSCOPE
span.: Request scheduling
span.: Paged KV cache
span.: GPU execution
span.: Quantization
span.: Speculative decode
span.: Model parallelism
span.: Runtime profiling
span.: Serving lifecycle
span.: Conclusion
span.: A finished request frees a slot for the next prompt.
p.: Continuous batching admits work at iteration boundaries. Prefill builds prompt state; decode extends active sequences one token at a time. Watch a short request finish while longer ones keep running.
button.vx-play: Pause walkthrough
span.: 01 / 09
li.: Continuous batching
li.: vLLM
li.: Token budgets
li.: Prefill / decode
button.: Continuous
button.: Fixed batch
span.: Fill the batch
span.: Replace a slot
span.: Keep decoding
text.cx-text: A SLOT IS TIME ON THE GPU
text.cx-text: iteration 1 · toy workload
text.cx-text: WAITING
text.cx-text: ACTIVE DECODE BATCH
text.cx-text: EMITTED TOKENS →
text.cx-text: req D
text.cx-text: in queue
text.cx-text: req E
text.cx-text: 3/3 slots occupied
text.cx-text: Different response lengths share one execution step.
text.cx-text: Finished sequences leave. New work enters.
text.cx-text: Same requests; switch the scheduler to see the idle-slot tradeoff.
button.: Ⅱ Pause
button.: ↺ Replay
span.: LIVE
span.: INPUT
strong.: Queued prompts + active sequences
span.: OPERATION
strong.: Schedule each iteration within the token budget
span.: OUTPUT
strong.: A changing batch of runnable requests

## t=15s stage 899/899 doc 1440/1440 secH 900 minFont 9.0
span.: 04 / INFERENCE OPTIMIZATION ENGINE
strong.: From queued prompt to streamed token, every layer of execution matters.
small.: LLM SERVING · GPU ACCELERATION · RUNTIME EFFICIENCY · 2026
span.: COMPONENT MICROSCOPE
span.: Request scheduling
span.: Paged KV cache
span.: GPU execution
span.: Quantization
span.: Speculative decode
span.: Model parallelism
span.: Runtime profiling
span.: Serving lifecycle
span.: Conclusion
span.: A finished request frees a slot for the next prompt.
button.vx-play: Pause walkthrough
span.: 01 / 09
em.vx-stage-annotation-emphasis: Continuous batching
span.: fills a released slot at the next iteration; prefill and decode share a bounded token budget.
li.: Continuous batching
li.: vLLM
li.: Token budgets
li.: Prefill / decode
button.: Continuous
button.: Fixed batch
span.: Fill the batch
span.: Replace a slot
span.: Keep decoding
text.cx-text: A SLOT IS TIME ON THE GPU
text.cx-text: iteration 9 · toy workload
text.cx-text: WAITING
text.cx-text: ACTIVE DECODE BATCH
text.cx-text: EMITTED TOKENS →
text.cx-text: req D
text.cx-text: admitted
text.cx-text: req E
text.cx-text: 3/3 slots occupied
text.cx-text: E replaces B; A continues without restarting.
text.cx-text: Finished sequences leave. New work enters.
text.cx-text: Same requests; switch the scheduler to see the idle-slot tradeoff.
button.: Ⅱ Pause
button.: ↺ Replay
span.: LIVE
span.gc-tag: And back
span.: INPUT
strong.: Queued prompts + active sequences
span.: OPERATION
strong.: Schedule each iteration within the token budget
span.: OUTPUT
strong.: A changing batch of runnable requests
