"use client";

import { useEffect } from "react";
import { useLanguage } from "./context";
import { zhOf } from "./zh-lookup";

/**
 * In Chinese, text written straight into the components (not through the dictionaries) is swapped for
 * its Chinese as it appears, and put back when the visitor returns to English. It runs only after
 * hydration, so the server's English and the first client render always agree.
 */
export function Localizer() {
  const { lang } = useLanguage();
  useEffect(() => {
    if (lang !== "zh") return;
    const original = new Map<Text, string>();
    const fix = (node: Text) => {
      const data = node.data;
      if (!data || (data.match(/[A-Za-z]/g)?.length ?? 0) < 3) return;
      const parent = node.parentElement;
      if (!parent || parent.closest("script, style, code, textarea, [data-no-l10n]")) return;
      const key = data.replace(/\s+/g, " ").trim();
      const zh = zhOf(key);
      if (!zh || zh === key) return;
      const lead = data.match(/^\s*/)?.[0] ?? "", trail = data.match(/\s*$/)?.[0] ?? "";
      original.set(node, data);
      node.data = lead + zh + trail;
    };
    const walk = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) { fix(root as Text); return; }
      if (root.nodeType !== Node.ELEMENT_NODE) return;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) fix(n as Text);
    };
    walk(document.body);
    const observer = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "characterData") fix(r.target as Text);
        else r.addedNodes.forEach(walk);
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    return () => {
      observer.disconnect();
      original.forEach((english, node) => { if (node.isConnected) node.data = english; });
    };
  }, [lang]);
  return null;
}
