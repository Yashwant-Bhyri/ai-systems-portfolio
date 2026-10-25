# Saved variant: left side rail (round 4, 2026-10-25)

The laboratory's module navigation as a vertical rail on the left (236 px), with
the open module expanded to show its number and the film's chapters listed under it.
Replaced by the top module bar (`stagecraft/side-rail.tsx` → `ModuleBar`).

To restore: copy `side-rail.tsx` over `app/compute/stagecraft/side-rail.tsx`, swap
`ModuleBar` back to `SideRail` in `lab-results.tsx` / `serving-under-load.tsx`
(`<aside className="lb-rail">…</aside>`, `showLabel`), and replace the head/body/rail
sections at the top of `stagecraft/block.css` with `rail.css`.
The film chapter bar at the bottom (Astra's original) is in git history before 2bcfa8f.
