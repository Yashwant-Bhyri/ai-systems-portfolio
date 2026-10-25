# - 1440x900

## t=3s stage 899/899 doc 1440/1440 secH 900 minFont 9.0
span.: 05 / ADVANCED POST-TRAINING
strong.: A foundation model learns to reason, then spends compute checking its work.
small.: ALIGNMENT · RL OPTIMIZATION · TEST-TIME SCALING · 2026
span.: COMPONENT MICROSCOPE
span.: Reasoning data
span.: SFT + LoRA
span.: Policy rollouts
span.: GRPO update
span.: Preference alignment
span.: Verifier search
span.: Test-time scaling
span.: Evaluation
span.: Conclusion
span.: Training begins with a reasoning trace that can be checked.
button.vx-play: Pause walkthrough
span.: 01 / 09
em.vx-stage-annotation-emphasis: Synth
li.: Synthetic reasoning data
li.: Data curation
li.: PyTorch
li.: Evaluation splits
button.: Math records
button.: Code records
span.: Read records
span.: Reject weak traces
span.: Retain supervision
text.cx-text: DATA CURATION / KEEP THE REASON, NOT JUST THE ANSWER
text.cx-text: SYNTHETIC RECORDS
text.cx-text: TRAINING RECORDS
text.cx-text: 1. worked proof
text.cx-text: 2. duplicate proof
text.cx-text: 3. wrong result
text.cx-text: 4. verified proof
text.cx-text: QUALITY GATE
text.cx-text: schema
text.cx-text: deduplicate
text.cx-text: check result
text.cx-text: mathematics / 1
text.cx-text: prompt · trace · answer ✓
text.cx-text: mathematics / 4
text.cx-text: #1
text.cx-text: reject / quarantine
text.cx-text: HELD-OUT TASKS
text.cx-text: isolated before training
text.cx-text: never enters the optimizer
text.cx-text: Verification routes useful examples into supervision.
text.cx-text: Invalid and duplicate traces do not become learning targets.
button.: Ⅱ Pause
button.: ↺ Replay
span.: LIVE
span.: INPUT
strong.: Prompts + candidate reasoning traces
span.: OPERATION
strong.: Check solutions, filter, and separate evaluation data
span.: OUTPUT
strong.: Training records with traceable supervision

## t=15s stage 899/899 doc 1440/1440 secH 900 minFont 9.0
span.: 05 / ADVANCED POST-TRAINING
strong.: A foundation model learns to reason, then spends compute checking its work.
small.: ALIGNMENT · RL OPTIMIZATION · TEST-TIME SCALING · 2026
span.: COMPONENT MICROSCOPE
span.: Reasoning data
span.: SFT + LoRA
span.: Policy rollouts
span.: GRPO update
span.: Preference alignment
span.: Verifier search
span.: Test-time scaling
span.: Evaluation
span.: Conclusion
span.: Training begins with a reasoning trace that can be checked.
button.vx-play: Pause walkthrough
span.: 01 / 09
em.vx-stage-annotation-emphasis: Synthetic reasoning data
span.: links each prompt to a trajectory and a checked answer before it enters supervised training.
li.: Synthetic reasoning data
li.: Data curation
li.: PyTorch
li.: Evaluation splits
button.: Math records
button.: Code records
span.: Read records
span.: Reject weak traces
span.: Retain supervision
text.cx-text: DATA CURATION / KEEP THE REASON, NOT JUST THE ANSWER
text.cx-text: SYNTHETIC RECORDS
text.cx-text: TRAINING RECORDS
text.cx-text: 1. worked proof
text.cx-text: 2. duplicate proof
text.cx-text: 3. wrong result
text.cx-text: 4. verified proof
text.cx-text: QUALITY GATE
text.cx-text: schema
text.cx-text: deduplicate
text.cx-text: check result
text.cx-text: mathematics / 1
text.cx-text: prompt · trace · answer ✓
text.cx-text: mathematics / 4
text.cx-text: #4
text.cx-text: reject / quarantine
text.cx-text: HELD-OUT TASKS
text.cx-text: isolated before training
text.cx-text: never enters the optimizer
text.cx-text: Verification routes useful examples into supervision.
text.cx-text: Invalid and duplicate traces do not become learning targets.
button.: Ⅱ Pause
button.: ↺ Replay
span.: LIVE
span.gc-tag: And back
span.: INPUT
strong.: Prompts + candidate reasoning traces
span.: OPERATION
strong.: Check solutions, filter, and separate evaluation data
span.: OUTPUT
strong.: Training records with traceable supervision
