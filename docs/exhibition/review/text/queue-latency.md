# Queue & latency

## at 4s
span.rs-status: One cohort · 96 tasks
button: Interactive
button: Shared-prefix burst
span.lab-control-label: Model checkpoint
button: Base
button: Post-trained · SFT + RL
span: Same arrivals · two workers per runtime
h3: Request arrivals & admission
time: 57.1s · workload clock
small: s · workload clock
text.ll-lane-title: Baseline
text.ll-small: 29 arrived
text.ll-label: 23 waiting
text.ll-small: Worker 1
text.ll-worker-label: Request 6
text.ll-small: Worker 2
text.ll-worker-label: Request 5
text.ll-completed: 4 / 96
text.ll-small: completed
text.ll-lane-title: Optimized
text.ll-label: 22 waiting
text.ll-worker-label: Request 7
text.ll-completed: 5 / 96
text.ll-label: Requests waiting for a worker
text.ll-small: 39
text.ll-small: 78
text.ll-small: 0 s
text.ll-small: 308 s
text.ll-small: 616 s
text.ll-small: 924 s
text.ll-small: 1,233 s
text.ll-axis: Elapsed workload time
span.ll-result-label: 29 of 96 requests arrived
h4: Requests waiting for a worker
span: Baseline
strong: 23 requests
small: requests
span: Optimized
strong: 22 requests
p.ll-delta: Δ 1 fewer requests waiting
b.cx-hero-num: Δ 1
span.cx-hero-unit: fewer requests waiting
p.ll-explanation: Ready-prefix reuse and faster execution release workers sooner.
span: Baseline Inspect scenario record ↗Illustrative, not measuredCorrectness RL · 2× nominal cap✕Download synthetic run JSON ↗Scenario identitysynthetic-lab-v1 · rl · shared-prefix · continuous-reuse-off-rates-staticExact aggregation2453.193 simulated GPU-seconds ÷ 67 correct outcomes = 36.615 GPU-seconds per correct answer.Runtime interventionsFirst available worker · prefix reuse off · faster token rates off. Story comparisons explicitly include the barrier starting point; the four-condition composition figure uses continuous scheduling throughout.Cost boundarySum of synthetic prefill and decode busy-work across tasks. Excludes idle allocation and verifier work. A real allocated-GPU cost experiment needs separate device instrumentation and full-run accounting.StatusSynthetic lab scenario. Not model inference, not GPU measurements, not a reported project achievement.Cohort96 deterministic synthetic tasks, 32 per family. Difficulty comes from a fixed integer hash, not a held-out dataset.Quality modelCorrect if task difficulty < policy skill + growth × log2(budget) minus a domain offset. An explicit rare-regression rule allows negative flips.Work modelOutput tokens = rounded base task length × policy work multiplier × (1 + log2(budget)). Allowance labels are relative to each policy's 1× work; 1×/2×/4×/8× caps use 1/2/3/4 times its output work. They are not actual cost multipliers. No text is generated.GPU timing assumptionsStatic: 1.2 ms/input token and 2.8 ms/output token. Optimized: 0.95 ms/input token and 2.25 ms/output token. These are declared simulation constants, not calibrated hardware measurements.Workload / cacheInteractive: 2,048 input tokens, 22-second arrivals. Shared-prefix: 8,192 tokens in six prefix groups, 2-second arrivals. A hit leaves 384 input tokens; first-use warm-up is charged.Scheduler / latencyTwo abstract serial GPU workers. Default: first available worker, FIFO arrivals. The guided story also declares a paired-batch barrier: each pair waits for both arrivals and the preceding pair to finish. The exact scheduler is exported in mechanisms. p95 is nearest-rank end-to-end latency, including queueing. This is not a vLLM performance model.Quality gateRuntime pairs share checkpoint, budget, task trace, logical input, output-token counts and correct/incorrect outcomes. Optimization changes timing and the amount of input work recomputed after prefix reuse.Missing real evidenceNo physical GPU, runtime version, real checkpoint hash, evaluation dataset, verifier, independent audit or confidence interval exists for this scenario.Analysis implementationapp/compute/lab-simulation.ts. The download contains every synthetic task, outcome, token count, cache decision, queue time and cost.Research behind the mechanismsThese sources inform the experiment design. Their benchmark numbers are not copied, perturbed or presented as this lab’s measurements.Post-training mechanisms & evaluation ↗Shared-prefix serving research ↗Test-time scaling methods & artifacts ↗
button.rs-evidence-trigger: Inspect scenario record ↗
span: Optimized Inspect scenario record ↗Illustrative, not measuredCorrectness RL · 2× nominal cap✕Download synthetic run JSON ↗Scenario identitysynthetic-lab-v1 · rl · shared-prefix · continuous-reuse-on-rates-fastExact aggregation1292.497 simulated GPU-seconds ÷ 67 correct outcomes = 19.291 GPU-seconds per correct answer.Runtime interventionsFirst available worker · prefix reuse on · faster token rates on. Story comparisons explicitly include the barrier starting point; the four-condition composition figure uses continuous scheduling throughout.Cost boundarySum of synthetic prefill and decode busy-work across tasks. Excludes idle allocation and verifier work. A real allocated-GPU cost experiment needs separate device instrumentation and full-run accounting.StatusSynthetic lab scenario. Not model inference, not GPU measurements, not a reported project achievement.Cohort96 deterministic synthetic tasks, 32 per family. Difficulty comes from a fixed integer hash, not a held-out dataset.Quality modelCorrect if task difficulty < policy skill + growth × log2(budget) minus a domain offset. An explicit rare-regression rule allows negative flips.Work modelOutput tokens = rounded base task length × policy work multiplier × (1 + log2(budget)). Allowance labels are relative to each policy's 1× work; 1×/2×/4×/8× caps use 1/2/3/4 times its output work. They are not actual cost multipliers. No text is generated.GPU timing assumptionsStatic: 1.2 ms/input token and 2.8 ms/output token. Optimized: 0.95 ms/input token and 2.25 ms/output token. These are declared simulation constants, not calibrated hardware measurements.Workload / cacheInteractive: 2,048 input tokens, 22-second arrivals. Shared-prefix: 8,192 tokens in six prefix groups, 2-second arrivals. A hit leaves 384 input tokens; first-use warm-up is charged.Scheduler / latencyTwo abstract serial GPU workers. Default: first available worker, FIFO arrivals. The guided story also declares a paired-batch barrier: each pair waits for both arrivals and the preceding pair to finish. The exact scheduler is exported in mechanisms. p95 is nearest-rank end-to-end latency, including queueing. This is not a vLLM performance model.Quality gateRuntime pairs share checkpoint, budget, task trace, logical input, output-token counts and correct/incorrect outcomes. Optimization changes timing and the amount of input work recomputed after prefix reuse.Missing real evidenceNo physical GPU, runtime version, real checkpoint hash, evaluation dataset, verifier, independent audit or confidence interval exists for this scenario.Analysis implementationapp/compute/lab-simulation.ts. The download contains every synthetic task, outcome, token count, cache decision, queue time and cost.Research behind the mechanismsThese sources inform the experiment design. Their benchmark numbers are not copied, perturbed or presented as this lab’s measurements.Post-training mechanisms & evaluation ↗Shared-prefix serving research ↗Test-time scaling methods & artifacts ↗
time: 3.7 / 49 s
button: Request arrivals
button: Queue buildup
button: Workload completion
button: Latency ranking
button: Scan every rank
button: p95 comparison

## at 16s
span.rs-status: One cohort · 96 tasks
button: Interactive
button: Shared-prefix burst
span.lab-control-label: Model checkpoint
button: Base
button: Post-trained · SFT + RL
span: Same arrivals · two workers per runtime
h3: Drain the request queue
time: 459.5s · workload clock
small: s · workload clock
text.ll-lane-title: Baseline
text.ll-small: 96 arrived
text.ll-label: 56 waiting
text.ll-small: Worker 1
text.ll-worker-label: Request 40
text.ll-small: Worker 2
text.ll-worker-label: Request 39
text.ll-completed: 38 / 96
text.ll-small: completed
text.ll-lane-title: Optimized
text.ll-label: 26 waiting
text.ll-worker-label: Request 69
text.ll-worker-label: Request 70
text.ll-completed: 68 / 96
text.ll-label: Requests waiting for a worker
text.ll-small: Last request arrives
text.ll-small: Queue falls as workers start requests
text.ll-small: 39
text.ll-small: 78
text.ll-small: 0 s
text.ll-small: 308 s
text.ll-small: 616 s
text.ll-small: 924 s
text.ll-small: 1,233 s
text.ll-axis: Elapsed workload time
span.ll-result-label: 96 of 96 requests arrived
h4: Requests still waiting
span: Baseline
strong: 56 requests
small: requests
span: Optimized
strong: 26 requests
p.ll-delta: Δ 30 fewer requests waiting
b.cx-hero-num: Δ 30
span.cx-hero-unit: fewer requests waiting
p.ll-explanation: No new arrivals. Each downward step means a waiting request began execution, not a loss of throughput.
span: Baseline Inspect scenario record ↗Illustrative, not measuredCorrectness RL · 2× nominal cap✕Download synthetic run JSON ↗Scenario identitysynthetic-lab-v1 · rl · shared-prefix · continuous-reuse-off-rates-staticExact aggregation2453.193 simulated GPU-seconds ÷ 67 correct outcomes = 36.615 GPU-seconds per correct answer.Runtime interventionsFirst available worker · prefix reuse off · faster token rates off. Story comparisons explicitly include the barrier starting point; the four-condition composition figure uses continuous scheduling throughout.Cost boundarySum of synthetic prefill and decode busy-work across tasks. Excludes idle allocation and verifier work. A real allocated-GPU cost experiment needs separate device instrumentation and full-run accounting.StatusSynthetic lab scenario. Not model inference, not GPU measurements, not a reported project achievement.Cohort96 deterministic synthetic tasks, 32 per family. Difficulty comes from a fixed integer hash, not a held-out dataset.Quality modelCorrect if task difficulty < policy skill + growth × log2(budget) minus a domain offset. An explicit rare-regression rule allows negative flips.Work modelOutput tokens = rounded base task length × policy work multiplier × (1 + log2(budget)). Allowance labels are relative to each policy's 1× work; 1×/2×/4×/8× caps use 1/2/3/4 times its output work. They are not actual cost multipliers. No text is generated.GPU timing assumptionsStatic: 1.2 ms/input token and 2.8 ms/output token. Optimized: 0.95 ms/input token and 2.25 ms/output token. These are declared simulation constants, not calibrated hardware measurements.Workload / cacheInteractive: 2,048 input tokens, 22-second arrivals. Shared-prefix: 8,192 tokens in six prefix groups, 2-second arrivals. A hit leaves 384 input tokens; first-use warm-up is charged.Scheduler / latencyTwo abstract serial GPU workers. Default: first available worker, FIFO arrivals. The guided story also declares a paired-batch barrier: each pair waits for both arrivals and the preceding pair to finish. The exact scheduler is exported in mechanisms. p95 is nearest-rank end-to-end latency, including queueing. This is not a vLLM performance model.Quality gateRuntime pairs share checkpoint, budget, task trace, logical input, output-token counts and correct/incorrect outcomes. Optimization changes timing and the amount of input work recomputed after prefix reuse.Missing real evidenceNo physical GPU, runtime version, real checkpoint hash, evaluation dataset, verifier, independent audit or confidence interval exists for this scenario.Analysis implementationapp/compute/lab-simulation.ts. The download contains every synthetic task, outcome, token count, cache decision, queue time and cost.Research behind the mechanismsThese sources inform the experiment design. Their benchmark numbers are not copied, perturbed or presented as this lab’s measurements.Post-training mechanisms & evaluation ↗Shared-prefix serving research ↗Test-time scaling methods & artifacts ↗
button.rs-evidence-trigger: Inspect scenario record ↗
span: Optimized Inspect scenario record ↗Illustrative, not measuredCorrectness RL · 2× nominal cap✕Download synthetic run JSON ↗Scenario identitysynthetic-lab-v1 · rl · shared-prefix · continuous-reuse-on-rates-fastExact aggregation1292.497 simulated GPU-seconds ÷ 67 correct outcomes = 19.291 GPU-seconds per correct answer.Runtime interventionsFirst available worker · prefix reuse on · faster token rates on. Story comparisons explicitly include the barrier starting point; the four-condition composition figure uses continuous scheduling throughout.Cost boundarySum of synthetic prefill and decode busy-work across tasks. Excludes idle allocation and verifier work. A real allocated-GPU cost experiment needs separate device instrumentation and full-run accounting.StatusSynthetic lab scenario. Not model inference, not GPU measurements, not a reported project achievement.Cohort96 deterministic synthetic tasks, 32 per family. Difficulty comes from a fixed integer hash, not a held-out dataset.Quality modelCorrect if task difficulty < policy skill + growth × log2(budget) minus a domain offset. An explicit rare-regression rule allows negative flips.Work modelOutput tokens = rounded base task length × policy work multiplier × (1 + log2(budget)). Allowance labels are relative to each policy's 1× work; 1×/2×/4×/8× caps use 1/2/3/4 times its output work. They are not actual cost multipliers. No text is generated.GPU timing assumptionsStatic: 1.2 ms/input token and 2.8 ms/output token. Optimized: 0.95 ms/input token and 2.25 ms/output token. These are declared simulation constants, not calibrated hardware measurements.Workload / cacheInteractive: 2,048 input tokens, 22-second arrivals. Shared-prefix: 8,192 tokens in six prefix groups, 2-second arrivals. A hit leaves 384 input tokens; first-use warm-up is charged.Scheduler / latencyTwo abstract serial GPU workers. Default: first available worker, FIFO arrivals. The guided story also declares a paired-batch barrier: each pair waits for both arrivals and the preceding pair to finish. The exact scheduler is exported in mechanisms. p95 is nearest-rank end-to-end latency, including queueing. This is not a vLLM performance model.Quality gateRuntime pairs share checkpoint, budget, task trace, logical input, output-token counts and correct/incorrect outcomes. Optimization changes timing and the amount of input work recomputed after prefix reuse.Missing real evidenceNo physical GPU, runtime version, real checkpoint hash, evaluation dataset, verifier, independent audit or confidence interval exists for this scenario.Analysis implementationapp/compute/lab-simulation.ts. The download contains every synthetic task, outcome, token count, cache decision, queue time and cost.Research behind the mechanismsThese sources inform the experiment design. Their benchmark numbers are not copied, perturbed or presented as this lab’s measurements.Post-training mechanisms & evaluation ↗Shared-prefix serving research ↗Test-time scaling methods & artifacts ↗
time: 15.7 / 49 s
button: Request arrivals
button: Queue buildup
button: Workload completion
button: Latency ranking
button: Scan every rank
button: p95 comparison

## at 28s
span.rs-status: One cohort · 96 tasks
button: Interactive
button: Shared-prefix burst
span.lab-control-label: Model checkpoint
button: Base
button: Post-trained · SFT + RL
span: Same arrivals · two workers per runtime
h3: Rank response latency
time: 1,232.5s · workload clock
small: s · workload clock
text.ll-chart-title: Order each run from fastest to slowest
text.ll-small: Each point keeps its request identity as it moves.
text.ll-small: 287
text.ll-small: 573
text.ll-small: 860
text.ll-small: 1,147
text.ll-small: 24
text.ll-small: 48
text.ll-small: 72
text.ll-small: 96
text.ll-axis: Arrival order → latency rank
text.ll-axis: Arrival → completion (seconds)
span.ll-result-label: 96 completed responses per run
h4: Arrange by time to finish.
span: Fastest
span: Slowest
p.ll-explanation: Each run gets its own order. Then compare the same rank.
time: 27.7 / 49 s
button: Request arrivals
button: Queue buildup
button: Workload completion
button: Latency ranking
button: Scan every rank
button: p95 comparison

## at 40s
span.rs-status: One cohort · 96 tasks
button: Interactive
button: Shared-prefix burst
span.lab-control-label: Model checkpoint
button: Base
button: Post-trained · SFT + RL
span: Same arrivals · two workers per runtime
h3: Scan every rank: the gap widens toward the slow tail
time: 1,232.5s · workload clock
small: s · workload clock
text.ll-chart-title: Rank 38 of 96: 208 s apart
text.ll-small: Shaded: time saved at every rank the cursor has passed.
text.ll-small: 287
text.ll-small: 573
text.ll-small: 860
text.ll-small: 1,147
text.ll-small: rank 38
text.ll-scan-delta: Δ 208 s
text.ll-small: 24
text.ll-small: 48
text.ll-small: 72
text.ll-small: 96
text.ll-axis: Latency rank · fastest → slowest
text.ll-axis: Arrival → completion (seconds)
span.ll-result-label: Rank 38 / 96 · same rank in both runs
h4: Latency at this rank
span: Baseline
strong: 377.8 s
small.ll-request-id: Request 38
span: Optimized
strong: 169.5 s
p.ll-delta: Δ 208.3 s faster response
b.cx-hero-num: Δ 208.3
span.cx-hero-unit: s faster response
p.ll-explanation: Fast responses barely change; the slowest waited longest for a worker, so they gain the most.
button: p50
button: p95
button: p99
span: Baseline Inspect scenario record ↗Illustrative, not measuredCorrectness RL · 2× nominal cap✕Download synthetic run JSON ↗Scenario identitysynthetic-lab-v1 · rl · shared-prefix · continuous-reuse-off-rates-staticExact aggregation2453.193 simulated GPU-seconds ÷ 67 correct outcomes = 36.615 GPU-seconds per correct answer.Runtime interventionsFirst available worker · prefix reuse off · faster token rates off. Story comparisons explicitly include the barrier starting point; the four-condition composition figure uses continuous scheduling throughout.Cost boundarySum of synthetic prefill and decode busy-work across tasks. Excludes idle allocation and verifier work. A real allocated-GPU cost experiment needs separate device instrumentation and full-run accounting.StatusSynthetic lab scenario. Not model inference, not GPU measurements, not a reported project achievement.Cohort96 deterministic synthetic tasks, 32 per family. Difficulty comes from a fixed integer hash, not a held-out dataset.Quality modelCorrect if task difficulty < policy skill + growth × log2(budget) minus a domain offset. An explicit rare-regression rule allows negative flips.Work modelOutput tokens = rounded base task length × policy work multiplier × (1 + log2(budget)). Allowance labels are relative to each policy's 1× work; 1×/2×/4×/8× caps use 1/2/3/4 times its output work. They are not actual cost multipliers. No text is generated.GPU timing assumptionsStatic: 1.2 ms/input token and 2.8 ms/output token. Optimized: 0.95 ms/input token and 2.25 ms/output token. These are declared simulation constants, not calibrated hardware measurements.Workload / cacheInteractive: 2,048 input tokens, 22-second arrivals. Shared-prefix: 8,192 tokens in six prefix groups, 2-second arrivals. A hit leaves 384 input tokens; first-use warm-up is charged.Scheduler / latencyTwo abstract serial GPU workers. Default: first available worker, FIFO arrivals. The guided story also declares a paired-batch barrier: each pair waits for both arrivals and the preceding pair to finish. The exact scheduler is exported in mechanisms. p95 is nearest-rank end-to-end latency, including queueing. This is not a vLLM performance model.Quality gateRuntime pairs share checkpoint, budget, task trace, logical input, output-token counts and correct/incorrect outcomes. Optimization changes timing and the amount of input work recomputed after prefix reuse.Missing real evidenceNo physical GPU, runtime version, real checkpoint hash, evaluation dataset, verifier, independent audit or confidence interval exists for this scenario.Analysis implementationapp/compute/lab-simulation.ts. The download contains every synthetic task, outcome, token count, cache decision, queue time and cost.Research behind the mechanismsThese sources inform the experiment design. Their benchmark numbers are not copied, perturbed or presented as this lab’s measurements.Post-training mechanisms & evaluation ↗Shared-prefix serving research ↗Test-time scaling methods & artifacts ↗
button.rs-evidence-trigger: Inspect scenario record ↗
span: Optimized Inspect scenario record ↗Illustrative, not measuredCorrectness RL · 2× nominal cap✕Download synthetic run JSON ↗Scenario identitysynthetic-lab-v1 · rl · shared-prefix · continuous-reuse-on-rates-fastExact aggregation1292.497 simulated GPU-seconds ÷ 67 correct outcomes = 19.291 GPU-seconds per correct answer.Runtime interventionsFirst available worker · prefix reuse on · faster token rates on. Story comparisons explicitly include the barrier starting point; the four-condition composition figure uses continuous scheduling throughout.Cost boundarySum of synthetic prefill and decode busy-work across tasks. Excludes idle allocation and verifier work. A real allocated-GPU cost experiment needs separate device instrumentation and full-run accounting.StatusSynthetic lab scenario. Not model inference, not GPU measurements, not a reported project achievement.Cohort96 deterministic synthetic tasks, 32 per family. Difficulty comes from a fixed integer hash, not a held-out dataset.Quality modelCorrect if task difficulty < policy skill + growth × log2(budget) minus a domain offset. An explicit rare-regression rule allows negative flips.Work modelOutput tokens = rounded base task length × policy work multiplier × (1 + log2(budget)). Allowance labels are relative to each policy's 1× work; 1×/2×/4×/8× caps use 1/2/3/4 times its output work. They are not actual cost multipliers. No text is generated.GPU timing assumptionsStatic: 1.2 ms/input token and 2.8 ms/output token. Optimized: 0.95 ms/input token and 2.25 ms/output token. These are declared simulation constants, not calibrated hardware measurements.Workload / cacheInteractive: 2,048 input tokens, 22-second arrivals. Shared-prefix: 8,192 tokens in six prefix groups, 2-second arrivals. A hit leaves 384 input tokens; first-use warm-up is charged.Scheduler / latencyTwo abstract serial GPU workers. Default: first available worker, FIFO arrivals. The guided story also declares a paired-batch barrier: each pair waits for both arrivals and the preceding pair to finish. The exact scheduler is exported in mechanisms. p95 is nearest-rank end-to-end latency, including queueing. This is not a vLLM performance model.Quality gateRuntime pairs share checkpoint, budget, task trace, logical input, output-token counts and correct/incorrect outcomes. Optimization changes timing and the amount of input work recomputed after prefix reuse.Missing real evidenceNo physical GPU, runtime version, real checkpoint hash, evaluation dataset, verifier, independent audit or confidence interval exists for this scenario.Analysis implementationapp/compute/lab-simulation.ts. The download contains every synthetic task, outcome, token count, cache decision, queue time and cost.Research behind the mechanismsThese sources inform the experiment design. Their benchmark numbers are not copied, perturbed or presented as this lab’s measurements.Post-training mechanisms & evaluation ↗Shared-prefix serving research ↗Test-time scaling methods & artifacts ↗
time: 39.7 / 49 s
button: Request arrivals
button: Queue buildup
button: Workload completion
button: Latency ranking
button: Scan every rank
button: p95 comparison

## at 50s
span.rs-status: One cohort · 96 tasks
button: Interactive
button: Shared-prefix burst
span.gc-tag: p50 · median response
span.lab-control-label: Model checkpoint
button: Base
button: Post-trained · SFT + RL
span: Same arrivals · two workers per runtime
h3: Compare p95 response latency
time: 1,232.5s · workload clock
small: s · workload clock
text.ll-chart-title: Rank 92 of 96
text.ll-small: Amber points take longer than their run’s selected boundary.
text.ll-small: 287
text.ll-small: 573
text.ll-small: 860
text.ll-small: 1,147
text.ll-small: selected rank ↓
text.ll-small: 24
text.ll-small: 48
text.ll-small: 72
text.ll-small: 96
text.ll-axis: Latency rank · fastest → slowest
text.ll-axis: Arrival → completion (seconds)
span.ll-result-label: 95th percentile · rank 92 / 96
h4: Arrival-to-completion latency
span: Baseline
strong: 1,005.5 s
small.ll-request-id: Request 92
span: Optimized
strong: 445.4 s
p.ll-delta: Δ 560.1 s faster response
b.cx-hero-num: Δ 560.1
span.cx-hero-unit: s faster response
p.ll-explanation: In each run, 92 of 96 responses finish within its boundary. The 4 amber points take longer.
button: p50
button: p95
button: p99
span: Baseline Inspect scenario record ↗Illustrative, not measuredCorrectness RL · 2× nominal cap✕Download synthetic run JSON ↗Scenario identitysynthetic-lab-v1 · rl · shared-prefix · continuous-reuse-off-rates-staticExact aggregation2453.193 simulated GPU-seconds ÷ 67 correct outcomes = 36.615 GPU-seconds per correct answer.Runtime interventionsFirst available worker · prefix reuse off · faster token rates off. Story comparisons explicitly include the barrier starting point; the four-condition composition figure uses continuous scheduling throughout.Cost boundarySum of synthetic prefill and decode busy-work across tasks. Excludes idle allocation and verifier work. A real allocated-GPU cost experiment needs separate device instrumentation and full-run accounting.StatusSynthetic lab scenario. Not model inference, not GPU measurements, not a reported project achievement.Cohort96 deterministic synthetic tasks, 32 per family. Difficulty comes from a fixed integer hash, not a held-out dataset.Quality modelCorrect if task difficulty < policy skill + growth × log2(budget) minus a domain offset. An explicit rare-regression rule allows negative flips.Work modelOutput tokens = rounded base task length × policy work multiplier × (1 + log2(budget)). Allowance labels are relative to each policy's 1× work; 1×/2×/4×/8× caps use 1/2/3/4 times its output work. They are not actual cost multipliers. No text is generated.GPU timing assumptionsStatic: 1.2 ms/input token and 2.8 ms/output token. Optimized: 0.95 ms/input token and 2.25 ms/output token. These are declared simulation constants, not calibrated hardware measurements.Workload / cacheInteractive: 2,048 input tokens, 22-second arrivals. Shared-prefix: 8,192 tokens in six prefix groups, 2-second arrivals. A hit leaves 384 input tokens; first-use warm-up is charged.Scheduler / latencyTwo abstract serial GPU workers. Default: first available worker, FIFO arrivals. The guided story also declares a paired-batch barrier: each pair waits for both arrivals and the preceding pair to finish. The exact scheduler is exported in mechanisms. p95 is nearest-rank end-to-end latency, including queueing. This is not a vLLM performance model.Quality gateRuntime pairs share checkpoint, budget, task trace, logical input, output-token counts and correct/incorrect outcomes. Optimization changes timing and the amount of input work recomputed after prefix reuse.Missing real evidenceNo physical GPU, runtime version, real checkpoint hash, evaluation dataset, verifier, independent audit or confidence interval exists for this scenario.Analysis implementationapp/compute/lab-simulation.ts. The download contains every synthetic task, outcome, token count, cache decision, queue time and cost.Research behind the mechanismsThese sources inform the experiment design. Their benchmark numbers are not copied, perturbed or presented as this lab’s measurements.Post-training mechanisms & evaluation ↗Shared-prefix serving research ↗Test-time scaling methods & artifacts ↗
button.rs-evidence-trigger: Inspect scenario record ↗
span: Optimized Inspect scenario record ↗Illustrative, not measuredCorrectness RL · 2× nominal cap✕Download synthetic run JSON ↗Scenario identitysynthetic-lab-v1 · rl · shared-prefix · continuous-reuse-on-rates-fastExact aggregation1292.497 simulated GPU-seconds ÷ 67 correct outcomes = 19.291 GPU-seconds per correct answer.Runtime interventionsFirst available worker · prefix reuse on · faster token rates on. Story comparisons explicitly include the barrier starting point; the four-condition composition figure uses continuous scheduling throughout.Cost boundarySum of synthetic prefill and decode busy-work across tasks. Excludes idle allocation and verifier work. A real allocated-GPU cost experiment needs separate device instrumentation and full-run accounting.StatusSynthetic lab scenario. Not model inference, not GPU measurements, not a reported project achievement.Cohort96 deterministic synthetic tasks, 32 per family. Difficulty comes from a fixed integer hash, not a held-out dataset.Quality modelCorrect if task difficulty < policy skill + growth × log2(budget) minus a domain offset. An explicit rare-regression rule allows negative flips.Work modelOutput tokens = rounded base task length × policy work multiplier × (1 + log2(budget)). Allowance labels are relative to each policy's 1× work; 1×/2×/4×/8× caps use 1/2/3/4 times its output work. They are not actual cost multipliers. No text is generated.GPU timing assumptionsStatic: 1.2 ms/input token and 2.8 ms/output token. Optimized: 0.95 ms/input token and 2.25 ms/output token. These are declared simulation constants, not calibrated hardware measurements.Workload / cacheInteractive: 2,048 input tokens, 22-second arrivals. Shared-prefix: 8,192 tokens in six prefix groups, 2-second arrivals. A hit leaves 384 input tokens; first-use warm-up is charged.Scheduler / latencyTwo abstract serial GPU workers. Default: first available worker, FIFO arrivals. The guided story also declares a paired-batch barrier: each pair waits for both arrivals and the preceding pair to finish. The exact scheduler is exported in mechanisms. p95 is nearest-rank end-to-end latency, including queueing. This is not a vLLM performance model.Quality gateRuntime pairs share checkpoint, budget, task trace, logical input, output-token counts and correct/incorrect outcomes. Optimization changes timing and the amount of input work recomputed after prefix reuse.Missing real evidenceNo physical GPU, runtime version, real checkpoint hash, evaluation dataset, verifier, independent audit or confidence interval exists for this scenario.Analysis implementationapp/compute/lab-simulation.ts. The download contains every synthetic task, outcome, token count, cache decision, queue time and cost.Research behind the mechanismsThese sources inform the experiment design. Their benchmark numbers are not copied, perturbed or presented as this lab’s measurements.Post-training mechanisms & evaluation ↗Shared-prefix serving research ↗Test-time scaling methods & artifacts ↗
time: 49 / 49 s
button: Request arrivals
button: Queue buildup
button: Workload completion
button: Latency ranking
button: Scan every rank
button: p95 comparison
