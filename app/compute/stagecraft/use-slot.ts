"use client";

import { useSyncExternalStore } from "react";

/** The element with this id, re-read whenever the page changes shape (used for portal slots). */
export function useSlot(id: string) {
  return useSyncExternalStore(
    (notify) => {
      const timer = window.setInterval(notify, 250);
      return () => window.clearInterval(timer);
    },
    () => document.getElementById(id),
    () => null,
  );
}
