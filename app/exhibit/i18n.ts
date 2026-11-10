"use client";

import { useCallback } from "react";
import { useLanguage } from "../i18n";
import { zhOf } from "../i18n/zh-lookup";


export function useTr() {
  const { lang } = useLanguage();
  return useCallback((s: string) => (lang === "zh" ? zhOf(s) ?? s : s), [lang]);
}

export function useLang() {
  return useLanguage().lang;
}
