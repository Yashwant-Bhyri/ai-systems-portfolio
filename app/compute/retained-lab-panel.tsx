"use client";

import { Activity, useState, type ReactNode } from "react";

/** Load on first visit; retain controls and DOM while disconnecting hidden effects. */
export function RetainedLabPanel({
  active,
  id,
  label,
  children,
}: {
  active: boolean;
  id?: string;
  label?: string;
  children: ReactNode;
}) {
  const [visited, setVisited] = useState(active);
  if (active && !visited) setVisited(true);
  return (
    <div
      id={id}
      className="lab-retained-panel"
      hidden={!active}
      inert={!active}
      role={label ? "region" : undefined}
      aria-label={label}
    >
      <Activity mode={active ? "visible" : "hidden"}>
        {visited || active ? children : null}
      </Activity>
    </div>
  );
}
