"use client";

import { useLanguage } from "./context";

export function LangSwitch() {
  const { lang, toggleLang, t } = useLanguage();
  return (
    <button
      type="button"
      className="vx-header-lang"
      onClick={toggleLang}
      aria-label={t.langSwitch.label}
      title={t.langSwitch.label}
    >
      {lang === "en" ? t.langSwitch.zh : t.langSwitch.en}
    </button>
  );
}
