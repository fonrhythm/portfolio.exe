"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, type CSSProperties } from "react";
import { LangSwitch } from "./LangSwitch";
import { Pager } from "./Pager";
import { PageRenderer } from "./templates";
import { pick, useLang } from "@/lib/i18n";
import { useMedia } from "@/lib/hooks";
import { useNav } from "@/lib/nav";
import type { FolderMeta } from "@/lib/types";

export function FolderView({ folder, index }: { folder: FolderMeta; index: number }) {
  const { data, screens, go } = useNav();
  const { lang } = useLang();
  const desktop = useMedia("(min-width: 1024px)");
  const ctl = useRef<((d: 1 | -1) => void) | null>(null);
  const n = screens.length;
  const ui = data.site.ui;
  const tone = `var(--${folder.tint})`;

  // 桌面跨页：第 0 跨页 = [内封, 第1页]；之后 [2,3] [4,5] …
  const spread = index === 0 ? 0 : Math.ceil(index / 2);
  const lastSpread = Math.ceil((n - 1) / 2);
  const spreadLeft = (k: number) => (k === 0 ? -1 : 2 * k - 1);
  const goPage = (i: number) => { if (i >= 0 && i < n) go(screens[i].path); };
  const step = (d: 1 | -1) => {
    if (desktop) {
      const k = spread + d;
      if (k < 0 || k > lastSpread) return;
      goPage(k === 0 ? 0 : spreadLeft(k));
    } else if (ctl.current) ctl.current(d);
    else goPage(index + d);
  };
  const canPrev = desktop ? spread > 0 : index > 0;
  const canNext = desktop ? spread < lastSpread : index < n - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.body.dataset.lightbox) return;
      if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "Escape") go("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const counter = desktop
    ? spread === 0 ? `1 / ${n}` : `${spreadLeft(spread) + 1}–${Math.min(spreadLeft(spread) + 2, n)} / ${n}`
    : `${index + 1} / ${n}`;

  return (
    <div className="absolute inset-0 flex flex-col text-paper-light paper-grain grain-soft fade-in"
      style={{ background: tone, ["--tone" as string]: tone } as CSSProperties}>
      <a href="#main" className="skip-link">{pick(ui.skipToContent, lang)}</a>
      <header className="safe-top shrink-0">
        <div className="mx-auto max-w-[1200px] h-14 px-5 flex items-center justify-between">
          <p className="m-0 flex items-baseline gap-3">
            <span className="f-cap f-capb text-[18px]" style={{ letterSpacing: "0.08em" }}>{folder.label.zh}</span>
            <span className="f-cap f-capb text-[12px] opacity-90">{folder.label.en}</span>
          </p>
          <LangSwitch label={pick(ui.lang, lang)} />
        </div>
      </header>

      <main id="main" className="relative flex-1 min-h-0">
        {!desktop ? (
          <div className="absolute inset-0 mx-auto w-full max-w-[640px]">
            <Pager count={n} index={index} controlRef={ctl} onChange={(i) => goPage(i)}
              render={(i, role) => (
                <div className="px-4 pt-1 pb-8"><PageRenderer screen={screens[i]} priority={role !== "prev"} /></div>
              )} />
          </div>
        ) : (
          <Spread key={spread} folder={folder} left={spreadLeft(spread)} k={spread} />
        )}
      </main>

      <nav aria-label="pager" className="shrink-0 border-t border-paper-light/35 safe-bottom">
        <div className="mx-auto max-w-[1200px] h-14 px-3 grid grid-cols-[1fr_auto_1fr] items-center">
          <button type="button" onClick={() => go("/")} className="justify-self-start f-cap f-capb text-[12px] min-h-[44px] min-w-[44px] px-3 rounded-btn">
            ◂ {pick(ui.archive, lang)}
          </button>
          <span className="f-cap text-[13px]" aria-live="polite">{counter}</span>
          <div className="justify-self-end flex gap-1">
            <button type="button" disabled={!canPrev} onClick={() => step(-1)} aria-label={pick(ui.prev, lang)} className="f-cap text-[22px] min-h-[44px] min-w-[44px] rounded-btn disabled:opacity-30">‹</button>
            <button type="button" disabled={!canNext} onClick={() => step(1)} aria-label={pick(ui.next, lang)} className="f-cap text-[22px] min-h-[44px] min-w-[44px] rounded-btn disabled:opacity-30">›</button>
          </div>
        </div>
      </nav>
    </div>
  );
}

/* 桌面左右跨页：平移 + 透视旋转（≤ 8°，仅桌面） */
function Spread({ k, folder, left }: { k: number; folder: FolderMeta; left: number }) {
  const { screens } = useNav();
  const { lang } = useLang();
  const reduce = useReducedMotion();
  const right = k === 0 ? 0 : left + 1;
  const L = left >= 0 ? screens[left] : null;
  const R = screens[right];
  return (
    <div className="absolute inset-0 mx-auto max-w-[1200px] px-6 py-4" style={{ perspective: 1800 }}>
      <motion.div className="h-full grid grid-cols-2 gap-4"
        initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24, rotateY: -6 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        transition={{ duration: reduce ? 0.15 : 0.35, ease: [0.2, 0.8, 0.2, 1] }}>
        <div className="pane-scroll h-full">
          {L ? <PageRenderer screen={L} /> : (
            <div className="h-full flex flex-col justify-end pb-6">
              <p className="f-cap text-[13px] opacity-90 m-0">{folder.label.en}</p>
              <h2 className="f-didone text-[80px] leading-none m-0 mt-2">{pick(folder.label, lang)}</h2>
              <p className="f-serif text-[24px] mt-4 m-0">{pick(folder.blurb, lang)}</p>
            </div>
          )}
        </div>
        <div className="pane-scroll h-full">{R && <PageRenderer screen={R} priority />}</div>
      </motion.div>
    </div>
  );
}
