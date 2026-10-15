"use client";
import { useLang } from "@/lib/i18n";
export function LangSwitch({ label }: { label: string }) {
  const { lang, setLang } = useLang();
  return (
    <button type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")}
      aria-label={lang === "zh" ? "Switch to English" : "切换到中文"}
      className="f-label text-[13px] min-w-[44px] min-h-[44px] px-2 rounded-btn border border-current/40">
      {label}
    </button>
  );
}
