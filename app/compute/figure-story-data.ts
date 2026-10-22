export type FigureBeat = {
  view: number;
  policy: number;
  budget: number;
  workload: "interactive" | "shared-prefix";
  name: string;
  title: string;
  mechanism: string;
  behavior: string;
  focus: string;
};
export const INFERENCE_FIGURE_STORY: readonly FigureBeat[] = [
  {
    view: 0,
    policy: 0,
    budget: 2,
    workload: "interactive",
    name: "Establish the reference",
    title: "Two independent levers: quality and execution.",
    mechanism:
      "Vertical movement changes the policy's outcomes. Horizontal movement changes the work required to deliver those outcomes.",
    behavior:
      "A user can get a better answer, the same answer faster, or both. Those are different claims.",
    focus: "Start at Base / Static. Keep the cohort fixed.",
  },
  {
    view: 0,
    policy: 1,
    budget: 2,
    workload: "interactive",
    name: "Move execution, not quality",
    title: "Move left. Keep the answer unchanged.",
    mechanism:
      "The optimized runtime uses the same policy, token counts and correctness vector. Only execution coefficients change for this workload.",
    behavior:
      "The user asks the same question and receives the same answer with less execution work.",
    focus: "Follow the horizontal arrow at constant accuracy.",
  },
  {
    view: 1,
    policy: 1,
    budget: 2,
    workload: "shared-prefix",
    name: "Remove repeated context",
    title: "Shared context stops being repeated work.",
    mechanism:
      "This workload adds shared context. The optimized bar combines prefix reuse with faster execution. Warm-up, new suffixes and every output token are still charged.",
    behavior:
      "A follow-up question can reuse the document context while still processing the user's new request.",
    focus:
      "Reuse removes input work; faster execution also shortens decode time.",
  },
  {
    view: 2,
    policy: 1,
    budget: 2,
    workload: "shared-prefix",
    name: "Expose the tail",
    title: "Less work changes what happens to the queue.",
    mechanism:
      "The same arrival trace is served by two abstract workers. Faster service releases capacity sooner; p95 includes waiting.",
    behavior:
      "During a burst, the last users in line matter too. A lower average cost alone does not guarantee an acceptable wait.",
    focus: "Compare both traces and the two p95 guardrails.",
  },
  {
    view: 0,
    policy: 3,
    budget: 2,
    workload: "shared-prefix",
    name: "Compose the two tracks",
    title: "Better policy. More efficient delivery.",
    mechanism:
      "Compare four conditions on the same cohort. The frontier includes only points that are not worse in both accuracy and cost per correct answer.",
    behavior:
      "The final question is whether improved answers can also be delivered at a lower cost, under the declared workload.",
    focus: "The upper-left direction is desirable; inspect the trade-offs.",
  },
];
export const TRAINING_FIGURE_STORY: readonly FigureBeat[] = [
  {
    view: 0,
    policy: 0,
    budget: 1,
    workload: "interactive",
    name: "Keep task identities",
    title: "A score is a collection of individual outcomes.",
    mechanism:
      "The same 96 task identities remain visible across policies. The base checkpoint at 1× is the reference.",
    behavior:
      "Do not just ask how often it succeeds. Ask which questions it can now handle.",
    focus: "Each square stays attached to the same task.",
  },
  {
    view: 0,
    policy: 1,
    budget: 1,
    workload: "interactive",
    name: "Teach the reasoning form",
    title: "SFT changes how the policy approaches a task.",
    mechanism:
      "Supervised traces provide a target sequence. Parameter-efficient adaptation can learn that behavior without updating the dense base weights.",
    behavior:
      "For a multi-step question, the intended shift is from a shortcut answer to an explicit sequence of operations.",
    focus: "Newly correct tasks light up; losses are not hidden.",
  },
  {
    view: 0,
    policy: 2,
    budget: 1,
    workload: "interactive",
    name: "Train on verified outcomes",
    title: "Relative rewards favor useful attempts.",
    mechanism:
      "GRPO-style optimization compares attempts within a group. Verifier rewards supply the learning signal; evaluation must remain independent.",
    behavior:
      "The desired behavior is to prefer a checked solution, not merely an answer that sounds fluent.",
    focus: "Compare correctness training at the same nominal allowance.",
  },
  {
    view: 1,
    policy: 2,
    budget: 1,
    workload: "interactive",
    name: "Separate policy from budget",
    title: "Freeze the weights before adding more thought.",
    mechanism:
      "This is the 1× point on the correctness-trained curve. The following move will change inference-time work, not the checkpoint.",
    behavior:
      "The policy is fixed. We are about to give it more opportunity to reconsider or search.",
    focus: "The highlighted curve is one checkpoint across budgets.",
  },
  {
    view: 1,
    policy: 2,
    budget: 4,
    workload: "interactive",
    name: "Spend more thought",
    title: "More thought moves cost and accuracy together.",
    mechanism:
      "The selected point moves along the same curve. Its x coordinate is computed GPU work, not an equally spaced budget label.",
    behavior:
      "Additional attempts can find a valid solution missed at the first allowance, but unsuccessful attempts still cost compute.",
    focus: "Follow the selected point from 1× to 4×.",
  },
  {
    view: 1,
    policy: 3,
    budget: 4,
    workload: "interactive",
    name: "Make reasoning economical",
    title: "The useful question is what the extra work buys.",
    mechanism:
      "At the same allowance, compare a different efficiency-aware policy. Equal caps do not imply equal execution cost.",
    behavior:
      "The intended behavior is to retain a correct line of reasoning while avoiding unnecessary detours.",
    focus: "Compare policies at actual cost, not response length alone.",
  },
  {
    view: 2,
    policy: 3,
    budget: 4,
    workload: "interactive",
    name: "Audit what was lost",
    title: "An improvement still has to survive its regressions.",
    mechanism:
      "Retained successes, new successes and old-correct → new-wrong cases reconcile to the same cohort. No task disappears from the accounting.",
    behavior:
      "A new skill should not silently break a question the old policy already answered correctly.",
    focus: "Follow both the gained and negative-flip flows.",
  },
];
