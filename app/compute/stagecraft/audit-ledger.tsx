"use client";

import { useEffect } from "react";
import { PATH, flips } from "../../exhibit/policy/data";
import { emitFocus, emitMeter } from "./stage-meter";

/**
 * What the audit found, step by step. A higher score can hide a task that broke,
 * so every gained task is counted and every lost one is named.
 */
const HOPS = PATH.slice(1).map((to, i) => ({ from: PATH[i], to, ...flips(PATH[i], to) }));
const GAINED = HOPS.reduce((a, h) => a + h.gained.length, 0), LOST = HOPS.reduce((a, h) => a + h.lost.length, 0);

export function AuditLedger({ active }: { active: boolean }) {
  useEffect(() => {
    if (!active) return;
    emitMeter({ text: `Every step, checked task by task: ${GAINED} gained, ${LOST} lost`, tone: "delta" });
    const on = window.setTimeout(() => emitFocus({
      headline: `A better score can hide a break: *${LOST} tasks did*`,
      parts: [{ label: "gained", value: String(GAINED), tone: "optimized" }, { label: "lost", value: String(LOST), tone: "problem" }, { label: "net", value: `+${GAINED - LOST} tasks`, tone: "delta" }],
      place: "top",
    }), 6000);
    const off = window.setTimeout(() => emitFocus(null), 12000);
    return () => { window.clearTimeout(on); window.clearTimeout(off); emitFocus(null); };
  }, [active]);
  return (
    <div className="al-root">
      <h4>Every step, task by task</h4>
      <ol className="al-steps">
        {HOPS.map((h) => (
          <li key={h.to.key}>
            <span className="al-name">{h.from.name} → {h.to.name}</span>
            <span className="al-count"><b data-tone="gain">+{h.gained.length}</b> <b data-tone="loss">−{h.lost.length}</b></span>
            <span className="al-ticks" aria-hidden="true">
              {h.gained.map((i) => <i key={i} data-tone="gain" />)}
              {h.lost.map((i) => <i key={i} data-tone="loss" />)}
            </span>
            <span className="al-named" data-focus-spot={h.lost.length ? "" : undefined}>{h.lost.length ? `lost: ${h.lost.map((i) => `task ${i + 1}`).join(", ")}` : "nothing lost"}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
