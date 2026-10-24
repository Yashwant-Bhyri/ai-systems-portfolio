/** One observer callback may contain several visibility changes for a target. */
export function latestPlaybackVisibility(
  entries: ReadonlyArray<{ time: number; isIntersecting: boolean }>,
) {
  let latest: (typeof entries)[number] | undefined;
  for (const entry of entries)
    if (!latest || entry.time >= latest.time) latest = entry;
  return latest?.isIntersecting;
}
