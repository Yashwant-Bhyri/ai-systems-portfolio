# - 1440x900

## t=3s stage 942/942 doc 1440/1440 secH 943 minFont 8.0
span.: 05 / ADVANCED POST-TRAINING
small.: ALIGNMENT · RL OPTIMIZATION · TEST-TIME SCALING · 2026
span.vx-typed-live: A foundation model learns to reason, then spends compute checking its work.
span.: MY CONTRIBUTION
span.: I developed a
em.vx-emph: Qwen3-4B reasoning-model post-training pipeline
span.: using supervised reasoning fine-tuning and reinforcement-based preference optimization. The iterative loop combines
em.vx-emph: SFT, GRPO-style policy updates, verifier-guided trajectories, and test-time compute scaling
span.: for mathematics, multi-step logic, and long-horizon software engineering.
span.: RESEARCH OBJECTIVE
span.: HIGH-LEVEL ARCHITECTURE
strong.: SFT · LoRA r = 16
em.: q k v o gate up down
em.: 36 layers
em.: base frozen
mark.: 0.82%
small.: of 4.02B weights train
text.cx-text: First change the policy. Then give it more room to think.
text.cx-text: LEARNING / PARAMETERS CHANGE
text.cx-text: INFERENCE / PARAMETERS FIXED
text.cx-text: verified reasoning
text.cx-text: Qwen3-4B
text.cx-text: LoRA / SFT → policy
text.cx-text: grouped reasoning → rewards
text.cx-text: relative advantage → adapter update
text.cx-text: θ*
text.cx-text: fixed checkpoint
text.cx-text: expand → verify → select
text.cx-text: more search, no weight update
text.cx-text: DPO: a separate preference-pair route
text.cx-text: held-out evaluation checks both loops
span.: 01
small.: Verified reasoning data
span.: 02
small.: Qwen3-4B · SFT / LoRA
span.: 03
small.: Group-relative updates
span.: 04
small.: Verifier + compute budget
span.: 05
small.: Math · logic · code
span.: Inspect the mechanisms
strong.: Continue into the component microscope

## t=15s stage 942/942 doc 1440/1440 secH 943 minFont 8.0
span.: 05 / ADVANCED POST-TRAINING
small.: ALIGNMENT · RL OPTIMIZATION · TEST-TIME SCALING · 2026
span.vx-typed-live: A foundation model learns to reason, then spends compute checking its work.
span.: MY CONTRIBUTION
span.: I developed a
em.vx-emph: Qwen3-4B reasoning-model post-training pipeline
span.: using supervised reasoning fine-tuning and reinforcement-based preference optimization. The iterative loop combines
em.vx-emph: SFT, GRPO-style policy updates, verifier-guided trajectories, and test-time compute scaling
span.: for mathematics, multi-step logic, and long-horizon software engineering.
span.: RESEARCH OBJECTIVE
span.: HIGH-LEVEL ARCHITECTURE
strong.: Paired regression audit
em.: pass@1
em.: per-task flips
em.: GPU-s per correct
mark.: 28 → 82
small.: solved · 5 regressions named
text.cx-text: First change the policy. Then give it more room to think.
text.cx-text: LEARNING / PARAMETERS CHANGE
text.cx-text: INFERENCE / PARAMETERS FIXED
text.cx-text: verified reasoning
text.cx-text: Qwen3-4B
text.cx-text: LoRA / SFT → policy
text.cx-text: grouped reasoning → rewards
text.cx-text: relative advantage → adapter update
text.cx-text: θ*
text.cx-text: fixed checkpoint
text.cx-text: expand → verify → select
text.cx-text: more search, no weight update
text.cx-text: DPO: a separate preference-pair route
text.cx-text: held-out evaluation checks both loops
span.: 01
small.: Verified reasoning data
span.: 02
small.: Qwen3-4B · SFT / LoRA
span.: 03
small.: Group-relative updates
span.: 04
small.: Verifier + compute budget
span.: 05
small.: Math · logic · code
span.: Inspect the mechanisms
strong.: Continue into the component microscope
