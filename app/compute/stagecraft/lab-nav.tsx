"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * Where the laboratory's module navigation lives. Four orientations are kept
 * side by side for review; the choice is remembered per visitor and can be set
 * with ?labnav=top|side|dock|bar.
 *
 *  show — the title show: both pathways on a landing, then a left column with the
 *         experiment pinned, the next module expanded and the rest in shadow (round 6)
 *  top  — the "Go deeper" reel above the stage, sticky; condenses once you scroll into the stage
 *  side — the same reel stacked in a sticky left column
 *  dock — the reel docked to the bottom of the screen while the lab is in view
 *  bar  — the compact one-screen block with a tab bar (round 4)
 */
export type LabNav = "show" | "top" | "side" | "dock" | "bar";
export const LAB_NAVS: readonly { id: LabNav; name: string; note: string }[] = [
  { id: "show", name: "Title show", note: "Both pathways, then the show on the left" },
  { id: "top", name: "Reel on top", note: "Sticky, condenses while you read the stage" },
  { id: "side", name: "Reel on the side", note: "Sticky column, tiles expand downward" },
  { id: "dock", name: "Reel docked below", note: "Original reel, always in reach at the bottom" },
  { id: "bar", name: "Compact block", note: "Whole lab in one screen, tab bar on top" },
];
const KEY = "lab-nav";
const DEFAULT: LabNav = "show";
const listeners = new Set<() => void>();
const valid = (v: string | null): v is LabNav => v === "show" || v === "top" || v === "side" || v === "dock" || v === "bar";

/** Visitors always get the title show; the other layouts are for review on the dev server only. */
const REVIEW = process.env.NODE_ENV !== "production";

function read(): LabNav {
  if (!REVIEW) return DEFAULT;
  try {
    const q = new URLSearchParams(window.location.search).get("labnav");
    if (valid(q)) return q;
    const s = window.localStorage.getItem(KEY);
    if (valid(s)) return s;
  } catch {}
  return DEFAULT;
}

export function setLabNav(next: LabNav) {
  try {
    window.localStorage.setItem(KEY, next);
    const url = new URL(window.location.href);
    url.searchParams.set("labnav", next);
    window.history.replaceState(null, "", url);
  } catch {}
  listeners.forEach((l) => l());
}

export function useLabNav(): LabNav {
  return useSyncExternalStore(
    (notify) => { listeners.add(notify); return () => listeners.delete(notify); },
    read,
    () => DEFAULT,
  );
}

/** A small review switcher that floats beside the laboratories while one is on screen. */
export function LabNavSwitcher() {
  return REVIEW ? <ReviewSwitcher /> : null;
}

function ReviewSwitcher() {
  const nav = useLabNav();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const labs = ["inference-study", "post-training-study"].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!labs.length) return;
    const seen = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target, e.isIntersecting));
      setVisible([...seen.values()].some(Boolean));
    }, { threshold: 0.15 });
    labs.forEach((l) => io.observe(l));
    return () => io.disconnect();
  }, []);
  return (
    <div className="lnv-switch" data-visible={visible || undefined} role="group" aria-label="Laboratory navigation layout">
      <span>Layout</span>
      {LAB_NAVS.map((o, i) => (
        <button key={o.id} type="button" aria-pressed={nav === o.id} title={o.note} onClick={() => setLabNav(o.id)}>
          <i>{String.fromCharCode(65 + i)}</i>{o.name}
        </button>
      ))}
    </div>
  );
}
