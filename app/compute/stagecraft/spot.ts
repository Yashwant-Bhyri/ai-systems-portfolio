/**
 * Spotlight classes for film scenes. A scene names its regions; each moment
 * lists the regions that stay lit. Everything else goes matte (grey, soft,
 * quiet) but keeps moving, so context survives while the eye has one target.
 */
export type Lit = readonly string[] | null | undefined;

export function spotCls(id: string, lit: Lit, extra = "") {
  const base = extra ? `${extra} cx-spot` : "cx-spot";
  if (!lit) return base;
  const on = id.split(" ").some((k) => lit.includes(k));
  return `${base} ${on ? "is-lit" : "is-matte is-soft"}`;
}
