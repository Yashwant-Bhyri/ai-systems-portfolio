# Execution replay

## at 3s
span.rs-status: One cohort · 96 tasks
button: Interactive
button: Shared-prefix burst
span.gc-tag: All 96 requests
span.lab-control-label: Model checkpoint
button: Base
button: Post-trained · SFT + RL
label: Runtime interventionBoth mechanismsPrefix reuse onlyExecution rates only
button: Total GPU workPrefill + decode · GPU-seconds
strong: Total GPU work
button: Input processingPrefill only · GPU-seconds
strong: Input processing
button: Answer generationDecode only · GPU-seconds
strong: Answer generation
button: Response latencyQueue + execution · elapsed seconds
strong: Response latency
h3: Total GPU execution work
span: Request 8 · 8,192 input · 5,378 output tokens
time: 24.89 s · since worker start
small: s · since worker start
text.rr-small: 0 s
text.rr-small: 6.2 s
text.rr-small: 12.4 s
text.rr-small: 18.7 s
text.rr-small: 24.9 s
text.rr-lane-name: Baseline
text.rr-small: worker released
text.rr-small: 8,192 input tokens computed
text.rr-token-count: 5,378 / 5,378 output
text.rr-lane-name: Optimized
text.rr-small: 384 input tokens computed
span: Input processing
span: Answer generation
h4: GPU work for this answer
span: Baseline
strong: 24.89 GPU-s
small: GPU-s
span: Optimized
strong: 12.47 GPU-s
p.rr-delta: Δ 12.42 GPU-s less49.9% reduction
b.cx-hero-num: Δ 12.42
span.cx-hero-unit: GPU-s less
small: 49.9% reduction
p.rr-cause: A ready prefix skips input work; faster rates execute what remains.
button.rs-evidence-trigger: Inspect scenario record ↗
time: 20 / 20 s
button: First completion
button: Compare the difference
strong: Choose a request from the same 96-task trace
span: Ready prefix reused · request 8
text.rr-small: 24
text.rr-small: 48
text.rr-small: 72
text.rr-small: 96
label.rr-request-slider: Request8

## at 12s
span.rs-status: One cohort · 96 tasks
button: Interactive
button: Shared-prefix burst
span.gc-tag: All 96 requests
span.lab-control-label: Model checkpoint
button: Base
button: Post-trained · SFT + RL
label: Runtime interventionBoth mechanismsPrefix reuse onlyExecution rates only
button: Total GPU workPrefill + decode · GPU-seconds
strong: Total GPU work
button: Input processingPrefill only · GPU-seconds
strong: Input processing
button: Answer generationDecode only · GPU-seconds
strong: Answer generation
button: Response latencyQueue + execution · elapsed seconds
strong: Response latency
h3: Total GPU execution work
span: Request 96 · 8,192 input · 5,416 output tokens
time: 25 s · since worker start
small: s · since worker start
text.rr-small: 0 s
text.rr-small: 6.2 s
text.rr-small: 12.5 s
text.rr-small: 18.7 s
text.rr-small: 25 s
text.rr-lane-name: Baseline
text.rr-small: worker released
text.rr-small: 8,192 input tokens computed
text.rr-token-count: 5,416 / 5,416 output
text.rr-lane-name: Optimized
text.rr-small: 384 input tokens computed
span: Input processing
span: Answer generation
h4: GPU work for this answer
span: Baseline
strong: 25 GPU-s
small: GPU-s
span: Optimized
strong: 12.55 GPU-s
p.rr-delta: Δ 12.44 GPU-s less49.8% reduction
b.cx-hero-num: Δ 12.44
span.cx-hero-unit: GPU-s less
small: 49.8% reduction
p.rr-cause: A ready prefix skips input work; faster rates execute what remains.
button.rs-evidence-trigger: Inspect scenario record ↗
time: 20 / 20 s
button: First completion
button: Compare the difference
strong: Choose a request from the same 96-task trace
span: Ready prefix reused · request 96
text.rr-small: 24
text.rr-small: 48
text.rr-small: 72
text.rr-small: 96
label.rr-request-slider: Request96

## at 24s
span.rs-status: One cohort · 96 tasks
button: Interactive
button: Shared-prefix burst
span.gc-tag: Input only
span.lab-control-label: Model checkpoint
button: Base
button: Post-trained · SFT + RL
label: Runtime interventionBoth mechanismsPrefix reuse onlyExecution rates only
button: Total GPU workPrefill + decode · GPU-seconds
strong: Total GPU work
button: Input processingPrefill only · GPU-seconds
strong: Input processing
button: Answer generationDecode only · GPU-seconds
strong: Answer generation
button: Response latencyQueue + execution · elapsed seconds
strong: Response latency
h3: Input processing cost
span: Request 7 · 8,192 input · 4,973 output tokens
time: 9.83 s · since prefill starts
small: s · since prefill starts
text.rr-small: 0 s
text.rr-small: 2.5 s
text.rr-small: 4.9 s
text.rr-small: 7.4 s
text.rr-small: 9.8 s
text.rr-lane-name: Baseline
text.rr-small: prefill complete
text.rr-small: 8,192 input tokens computed
text.rr-token-count: 8,192 / 8,192 input
text.rr-lane-name: Optimized
text.rr-small: 384 input tokens computed
text.rr-token-count: 384 / 384 input
span: Input processing
h4: Work to process its input
span: Baseline
strong: 9.83 GPU-s
small: GPU-s
span: Optimized
strong: 0.36 GPU-s
p.rr-delta: Δ 9.47 GPU-s less96.3% reduction
b.cx-hero-num: Δ 9.47
span.cx-hero-unit: GPU-s less
small: 96.3% reduction
p.rr-cause: A ready prefix skips input work; faster rates execute what remains.
button.rs-evidence-trigger: Inspect scenario record ↗
time: 20 / 20 s
button: First completion
button: Compare the difference
strong: Choose a request from the same 96-task trace
span: Ready prefix reused · request 7
text.rr-small: 24
text.rr-small: 48
text.rr-small: 72
text.rr-small: 96
label.rr-request-slider: Request7

## at 34s
span.rs-status: One cohort · 96 tasks
button: Interactive
button: Shared-prefix burst
span.gc-tag: Total GPU work
span.lab-control-label: Model checkpoint
button: Base
button: Post-trained · SFT + RL
label: Runtime interventionBoth mechanismsPrefix reuse onlyExecution rates only
button: Total GPU workPrefill + decode · GPU-seconds
strong: Total GPU work
button: Input processingPrefill only · GPU-seconds
strong: Input processing
button: Answer generationDecode only · GPU-seconds
strong: Answer generation
button: Response latencyQueue + execution · elapsed seconds
strong: Response latency
h3: Total GPU execution work
span: Request 7 · 8,192 input · 4,973 output tokens
time: 23.75 s · since worker start
small: s · since worker start
text.rr-small: 0 s
text.rr-small: 5.9 s
text.rr-small: 11.9 s
text.rr-small: 17.8 s
text.rr-small: 23.8 s
text.rr-lane-name: Baseline
text.rr-small: worker released
text.rr-small: 8,192 input tokens computed
text.rr-token-count: 4,973 / 4,973 output
text.rr-lane-name: Optimized
text.rr-small: 384 input tokens computed
span: Input processing
span: Answer generation
h4: GPU work for this answer
span: Baseline
strong: 23.75 GPU-s
small: GPU-s
span: Optimized
strong: 11.55 GPU-s
p.rr-delta: Δ 12.2 GPU-s less51.4% reduction
b.cx-hero-num: Δ 12.2
span.cx-hero-unit: GPU-s less
small: 51.4% reduction
p.rr-cause: A ready prefix skips input work; faster rates execute what remains.
button.rs-evidence-trigger: Inspect scenario record ↗
time: 20 / 20 s
button: First completion
button: Compare the difference
strong: Choose a request from the same 96-task trace
span: Ready prefix reused · request 7
text.rr-small: 24
text.rr-small: 48
text.rr-small: 72
text.rr-small: 96
label.rr-request-slider: Request7
