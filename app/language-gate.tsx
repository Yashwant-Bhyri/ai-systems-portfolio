"use client";

import { useEffect, useState } from "react";

/* First-visit language choice.
 *
 * Constraints that shaped this:
 *  - The site is a static export, so there is no server to negotiate on
 *    Accept-Language. The choice has to be made in the browser.
 *  - It must not flash over a returning reader. The chooser only appears when
 *    no prior choice is stored, and it renders nothing at all on the server so
 *    the exported HTML for both routes stays exactly as it is today.
 *  - It must never trap anyone: a reader who lands on /zh/ from a shared link
 *    has already expressed a preference by following that link, so the gate
 *    records it and stays out of the way.
 *  - Whatever they pick is remembered, so it is asked once and never again.
 */

const STORAGE_KEY = "vx-lang-choice";

export function LanguageGate({ basePath = "" }: { basePath?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      /* private mode: fall through and simply ask, harmlessly, each visit */
    }
    if (stored) return;

    // Following a /zh/ link is itself a choice — record it, do not interrupt.
    if (window.location.pathname.includes("/zh")) {
      remember("zh");
      return;
    }
    setOpen(true);
  }, []);

  function remember(choice: "en" | "zh") {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* nothing to do; the gate simply asks again next time */
    }
  }

  function choose(choice: "en" | "zh") {
    remember(choice);
    setOpen(false);
    if (choice === "zh") window.location.assign(`${basePath}/zh/`);
  }

  if (!open) return null;

  return (
    <div className="vx-lang-gate" role="dialog" aria-modal="true" aria-labelledby="vx-lang-gate-title">
      <div className="vx-lang-gate-panel">
        <span className="vx-lang-gate-kicker">YASHWANT BHYRI · AI SYSTEMS PORTFOLIO</span>
        <h2 id="vx-lang-gate-title">
          Choose a language
          <em lang="zh-Hans">请选择语言</em>
        </h2>
        <p>
          The whole portfolio is available in both. You can switch at any time from the header.
          <em lang="zh-Hans">作品集提供中英双语，随时可在页首切换。</em>
        </p>
        <div className="vx-lang-gate-actions">
          <button type="button" onClick={() => choose("en")} data-choice="en">
            <strong>English</strong>
            <small>Continue in English</small>
          </button>
          <button type="button" onClick={() => choose("zh")} data-choice="zh" lang="zh-Hans">
            <strong>中文</strong>
            <small>以简体中文浏览</small>
          </button>
        </div>
      </div>
    </div>
  );
}
