# Where the 96 tasks land

## at 1s
span.rs-status: One cohort · 96 tasks
button: Interactive
button: Shared-prefix burst
h3: Base checkpoint: 96 tasks by difficulty and cost
span: one dot = one task · filled = solved · same 96 tasks, same runtime
text.tl-tick: 0.00
text.tl-tick: 0.25
text.tl-tick: 0.50
text.tl-tick: 0.75
text.tl-tick: 1.00
text.tl-tick: 10
text.tl-tick: 20
text.tl-axis-label: task difficulty ↑
text.tl-axis-label: GPU-seconds spent on the task →
text.tl-ability-label: ability 0.45 · below the line = solved
text.tl-median-label: base median
text.tl-median-label: SFT + RL median
span.tl-label: Base → SFT + RL · same 96 tasks · static runtime
h4: Post-training buys accuracy with longer reasoning
span: Tasks solved
strong: 43 / 96
span: 43
small: / 96
p.tl-hero: +24 tasks solved
b.cx-hero-num: +24
span.cx-hero-unit: tasks solved
span: Median GPU-s per task
strong: 8.2 GPU-s
span: 8.2
small: GPU-s
p.tl-delta-line: +9.8 GPU-s per task (8.2 → 18.0)
em: (8.2 → 18.0)
p.tl-cause: Cause SFT on verified traces raises the ability line from 0.45 to 0.60; correctness RL raises it to 0.73. RL answers are 2.7× longer, so each task costs more.
b: Cause
p.tl-cause: Next Serving cuts the cost back: see Policy × runtime.
b: Next

## at 4s
span.rs-status: One cohort · 96 tasks
button: Interactive
button: Shared-prefix burst
h3: SFT + RL lifts the ability line
span: one dot = one task · filled = solved · same 96 tasks, same runtime
text.tl-tick: 0.00
text.tl-tick: 0.25
text.tl-tick: 0.50
text.tl-tick: 0.75
text.tl-tick: 1.00
text.tl-tick: 10
text.tl-tick: 20
text.tl-axis-label: task difficulty ↑
text.tl-axis-label: GPU-seconds spent on the task →
text.tl-ability-label: ability 0.64 · below the line = solved
text.tl-median-label: base median
text.tl-median-label: SFT + RL median
span.tl-label: Base → SFT + RL · same 96 tasks · static runtime
h4: Post-training buys accuracy with longer reasoning
span: Tasks solved
strong: 59 / 96
span: 59
small: / 96
p.tl-hero: +24 tasks solved
b.cx-hero-num: +24
span.cx-hero-unit: tasks solved
span: Median GPU-s per task
strong: 14.7 GPU-s
span: 14.7
small: GPU-s
p.tl-delta-line: +9.8 GPU-s per task (8.2 → 18.0)
em: (8.2 → 18.0)
p.tl-cause: Cause SFT on verified traces raises the ability line from 0.45 to 0.60; correctness RL raises it to 0.73. RL answers are 2.7× longer, so each task costs more.
b: Cause
p.tl-cause: Next Serving cuts the cost back: see Policy × runtime.
b: Next

## at 8s
span.rs-status: One cohort · 96 tasks
button: Interactive
button: Shared-prefix burst
h3: 24 more tasks fall below the line
span: one dot = one task · filled = solved · same 96 tasks, same runtime
text.tl-tick: 0.00
text.tl-tick: 0.25
text.tl-tick: 0.50
text.tl-tick: 0.75
text.tl-tick: 1.00
text.tl-tick: 10
text.tl-tick: 20
text.tl-axis-label: task difficulty ↑
text.tl-axis-label: GPU-seconds spent on the task →
text.tl-ability-label: ability 0.73 · below the line = solved
text.tl-median-label: base median
text.tl-median-label: SFT + RL median
span.tl-label: Base → SFT + RL · same 96 tasks · static runtime
h4: Post-training buys accuracy with longer reasoning
span: Tasks solved
strong: 67 / 96
span: 67
small: / 96
p.tl-hero: +24 tasks solved
b.cx-hero-num: +24
span.cx-hero-unit: tasks solved
span: Median GPU-s per task
strong: 18.0 GPU-s
span: 18.0
small: GPU-s
p.tl-delta-line: +9.8 GPU-s per task (8.2 → 18.0)
em: (8.2 → 18.0)
p.tl-cause: Cause SFT on verified traces raises the ability line from 0.45 to 0.60; correctness RL raises it to 0.73. RL answers are 2.7× longer, so each task costs more.
b: Cause
p.tl-cause: Next Serving cuts the cost back: see Policy × runtime.
b: Next
