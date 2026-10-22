"use client";

import { cloneElement, useState, type ReactElement } from "react";

/** Keep the outgoing film mounted for a real dissolve, but stop its clock. */
export function FilmTransition({
  sceneKey,
  children,
}: {
  sceneKey: string;
  children: ReactElement<{ playing: boolean }>;
}) {
  const [scenes, setScenes] = useState([{ key: sceneKey, node: children }]);
  if (scenes[scenes.length - 1].key !== sceneKey) {
    setScenes([...scenes.slice(-1), { key: sceneKey, node: children }]);
  }
  return (
    <div className="cf-dissolve">
      {scenes.map((scene) => {
        const active = scene.key === sceneKey;
        return (
          <div
            key={scene.key}
            className="cf-layer"
            data-active={active}
            aria-hidden={!active}
            inert={!active}
          >
            {active ? children : cloneElement(scene.node, { playing: false })}
          </div>
        );
      })}
    </div>
  );
}
