/** Exact greedy-prefix teaching trace. No tokenizer, GPU timing or sampler claim. */
export const DRAFT_VERSION = "greedy-prefix-investigation-v1";
export const DRAFT_DURATION = 38000;
export const DRAFT_MOMENTS = [0, 6500, 10000, 15000, 27000, 32000] as const;
export const DRAFT_LABELS = [
  "Propose tokens",
  "Verify in parallel",
  "Accept / reject",
  "Commit the answer",
  "Target calls avoided",
  "Account for extra work",
] as const;
export const TARGET_UNITS = [
  "The",
  "limit",
  "is",
  "now",
  "two",
  "years",
  "of",
  "fees,",
  "not",
  "one",
  "year",
  ".",
] as const;
export type DraftMode = "mixed" | "aligned" | "miss";
export type DraftRound = {
  index: number;
  start: number;
  end: number;
  proposal: string[];
  accepted: number;
  rejected: number;
  correction: string | null;
  bonus: string | null;
  committed: string[];
  evaluated: number;
  discardedPositions: number;
};
export function draftStudy(mode: DraftMode = "mixed", length: 2 | 4 = 4) {
  if (!["mixed", "aligned", "miss"].includes(mode))
    throw new RangeError("Unknown draft agreement case");
  if (![2, 4].includes(length))
    throw new RangeError("Draft length must be two or four");
  const target = [...TARGET_UNITS];
  const rounds: DraftRound[] = [];
  let start = 0;
  while (start < target.length) {
    const proposal: string[] = target.slice(start, start + length);
    const mismatch =
      mode === "miss"
        ? 0
        : mode === "mixed" && rounds.length === 0
          ? Math.min(2, proposal.length - 1)
          : -1;
    if (mismatch >= 0) {
      proposal[mismatch] = "could";
      for (let i = mismatch + 1; i < proposal.length; i++)
        proposal[i] = "maybe";
    }
    // Only the consecutive agreeing prefix is accepted. Positions after the
    // mismatch are conditioned on an uncommitted draft and cannot be emitted.
    let accepted = 0;
    while (
      accepted < proposal.length &&
      proposal[accepted] === target[start + accepted]
    )
      accepted++;
    const correction =
      accepted < proposal.length ? target[start + accepted] : null;
    const bonus =
      accepted === proposal.length ? (target[start + accepted] ?? null) : null;
    const committed = [
      ...proposal.slice(0, accepted),
      ...((correction ?? bonus) ? [correction ?? bonus!] : []),
    ];
    const evaluated = Math.min(proposal.length + 1, target.length - start);
    const end = start + committed.length;
    rounds.push({
      index: rounds.length,
      start,
      end,
      proposal,
      accepted,
      rejected: proposal.length - accepted,
      correction,
      bonus,
      committed,
      evaluated,
      discardedPositions: evaluated - committed.length,
    });
    start = end;
  }
  return {
    version: DRAFT_VERSION,
    status: "illustrative" as const,
    mode,
    length,
    target,
    rounds,
    outputOrigins: rounds.flatMap((r) =>
      r.committed.map((_, i) =>
        i < r.accepted
          ? ("accepted" as const)
          : r.correction
            ? ("correction" as const)
            : ("bonus" as const),
      ),
    ),
    baselineCalls: target.length,
    targetCalls: rounds.length,
    callsAvoided: target.length - rounds.length,
    draftTokens: rounds.reduce((n, r) => n + r.proposal.length, 0),
    acceptedTokens: rounds.reduce((n, r) => n + r.accepted, 0),
    targetPositions: rounds.reduce((n, r) => n + r.evaluated, 0),
    discardedPositions: rounds.reduce((n, r) => n + r.discardedPositions, 0),
  };
}
export type DraftStudy = ReturnType<typeof draftStudy>;
const unit = (n: number) => Math.max(0, Math.min(1, n));
const ramp = (t: number, a: number, b: number) => unit((t - a) / (b - a));

/** First round is expanded; subsequent rounds reuse the same operation sequence. */
export function draftFrame(milliseconds: number, study: DraftStudy) {
  if (!Number.isFinite(milliseconds))
    throw new RangeError("Film time must be finite");
  const time = Math.max(0, Math.min(DRAFT_DURATION, milliseconds));
  let index = 0,
    local = time;
  if (time >= 17000) {
    const width = 10000 / Math.max(1, study.rounds.length - 1);
    index = Math.min(
      study.rounds.length - 1,
      1 + Math.floor((time - 17000) / width),
    );
    local =
      time >= 27000
        ? 17000
        : ((time - 17000 - (index - 1) * width) / width) * 17000;
  }
  const round = study.rounds[index];
  const draft = ramp(local, 1800, 6500);
  const verify = ramp(local, 6500, 9500);
  const commit = ramp(local, 13500, 16500);
  const verdict = verify === 1;
  const committed = commit === 1 ? round.end : round.start;
  const phase =
    time >= 31000
      ? "cost"
      : time >= 27000
        ? "calls"
        : commit > 0
          ? "commit"
          : verdict
            ? "verdict"
            : local >= 6500
              ? "verify"
              : "draft";
  return {
    time,
    round,
    draft,
    verify,
    commit,
    verdict,
    committed,
    phase,
    proposed: Math.floor(round.proposal.length * draft),
    calls: index + Number(verdict),
    beat:
      time >= 31000
        ? 5
        : time >= 27000
          ? 4
          : local >= 13500
            ? 3
            : local >= 9500
              ? 2
              : local >= 6500
                ? 1
                : 0,
  };
}

/** Inspect a round at its settled commit, without changing its history. */
export function draftRoundMoment(index: number, study: DraftStudy) {
  if (!Number.isInteger(index) || index < 0 || index >= study.rounds.length)
    throw new RangeError("Unknown round");
  if (index === 0) return 16500;
  const width = 10000 / (study.rounds.length - 1);
  return 17000 + (index - 1 + 0.985) * width;
}
