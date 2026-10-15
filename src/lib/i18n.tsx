"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { L, Lang } from "./types";

type Ctx = { lang: Lang; setLang: (l: Lang) => void };
const LangCtx = createContext<Ctx>({ lang: "zh", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("zh");

  // 默认中文；?lang=en 可直达英文；否则读 localStorage（读写都 try/catch）
  useEffect(() => {
    let l: Lang | null = null;
    try {
      const q = new URLSearchParams(window.location.search).get("lang");
      if (q === "en" || q === "zh") l = q;
    } catch {}
    if (!l) {
      try {
        const s = window.localStorage.getItem("lang");
        if (s === "en" || s === "zh") l = s;
      } catch {}
    }
    if (l) setLangState(l);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { window.localStorage.setItem("lang", l); } catch {}
  }, []);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);

/** 取当前语言文本，缺失时回退另一种语言 */
export function pick(l: L | undefined, lang: Lang): string {
  if (!l) return "";
  return (l[lang] || l[lang === "zh" ? "en" : "zh"] || "").toString();
}
export const isTodo = (l?: L) => !!l && l.zh === "待补位";
