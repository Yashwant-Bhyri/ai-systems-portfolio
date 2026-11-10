import { ZH_TERMS } from "./zh-terms";
import { ZH_SITE, ZH_PATTERNS } from "./zh-site";

/**
 * Chinese for an English string: an exact entry first, then a pattern for sentences that carry
 * numbers from the lab model. Undefined when there is none, so the English stays.
 * Lookups are cached: the laboratory redraws some labels every frame.
 */
const cache = new Map<string, string | null>();
export function zhOf(s: string): string | undefined {
  const hit = cache.get(s);
  if (hit !== undefined) return hit ?? undefined;
  let out: string | null = ZH_TERMS[s] ?? ZH_SITE[s] ?? null;
  if (out === null && (s.match(/[A-Za-z]/g)?.length ?? 0) >= 3) {
    for (const [re, to] of ZH_PATTERNS) {
      const m = s.match(re);
      if (m) { out = typeof to === "string" ? s.replace(re, to) : to(...(m as unknown as string[])); break; }
    }
  }
  if (cache.size > 4000) cache.clear();
  cache.set(s, out);
  return out ?? undefined;
}
