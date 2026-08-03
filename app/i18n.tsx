"use client";

import { createContext, useContext, useMemo } from "react";
import { ZH } from "./i18n-zh";

export type Lang = "en" | "zh";

const LangContext = createContext<Lang>("en");

/** Render-scoped language, set by LangProvider before any child renders.
 *
 *  The operational graphics are hundreds of small SVG scenes with labels living
 *  in module constants, helper functions, and non-component code where a hook
 *  cannot reach. `T()` gives them a plain function instead. This is safe here
 *  because a page renders exactly one language: `/` is always English, `/zh/`
 *  is always Chinese, and there is no route that mounts both. The exported HTML
 *  is asserted against language bleed in tests/rendered-html.test.mjs. */
let activeLang: Lang = "en";

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  activeLang = lang;
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

/** Translate an inline label from anywhere — including outside a component. */
export function T(value: string): string {
  return translate(value, activeLang);
}

/** Render-time deep translate, for module-level constants. Those are evaluated
 *  once at import, long before a language is chosen, so their strings stay in
 *  English at the source and are translated where they are read instead. */
const deepCache = new WeakMap<object, Partial<Record<Lang, unknown>>>();

export function TD<V>(value: V): V {
  if (activeLang === "en" || value === null || typeof value !== "object") {
    return translateDeep(value, activeLang);
  }
  // These constants have stable identities, so the walk runs once per language
  // instead of on every frame of the animated graphics that read them.
  let byLang = deepCache.get(value as object);
  if (!byLang) deepCache.set(value as object, (byLang = {}));
  if (!(activeLang in byLang)) byLang[activeLang] = translateDeep(value, activeLang);
  return byLang[activeLang] as V;
}

export function useLang(): Lang {
  return useContext(LangContext);
}

/** Look a string up by its ENGLISH source text. Anything without a translation
 *  falls through unchanged, so a missing entry degrades to English rather than
 *  to an empty box — and the English portal never touches the dictionary. */
export function translate(value: string, lang: Lang): string {
  if (lang === "en") return value;
  return ZH[value] ?? value;
}

/** Deep-translate a data structure: every string leaf is looked up, arrays and
 *  objects are rebuilt. This is what lets the walkthrough/step/research data
 *  stay exactly as authored while still rendering in Chinese. */
/** Object keys whose values are identifiers, not prose: translating them would
 *  silently break equality checks, React keys, CSS classes, and glyph lookups. */
const OPAQUE_KEYS = new Set([
  "id", "key", "kind", "glyph", "icon", "type", "variant", "accent", "className",
  "class", "href", "src", "path", "file", "d", "color", "seed", "slug", "anchor", "target",
  // Foreign keys. `id` alone is not enough: a node that references another node
  // by id carries that id in a list, and translating the list breaks the lookup
  // while the ids themselves stay intact. That crashed the Filmora tool-graph
  // (deps: ["brief"] became ["需求"], so node("需求") was undefined).
  "deps", "dep", "refs", "parents", "children", "targets", "source", "from", "to",
  "next", "prev", "links", "edges",
]);

export function translateDeep<T>(value: T, lang: Lang): T {
  if (lang === "en") return value;
  if (typeof value === "string") return translate(value, lang) as unknown as T;
  if (Array.isArray(value)) return value.map((item) => translateDeep(item, lang)) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      out[key] = OPAQUE_KEYS.has(key) ? item : translateDeep(item, lang);
    }
    return out as unknown as T;
  }
  return value;
}

/** t() for inline JSX literals. */
export function useT() {
  const lang = useLang();
  return useMemo(() => (value: string) => translate(value, lang), [lang]);
}

/** Deep-translate hook for the data arrays, memoised per language. */
export function useTranslated<T>(value: T): T {
  const lang = useLang();
  return useMemo(() => translateDeep(value, lang), [value, lang]);
}
