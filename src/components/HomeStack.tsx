"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { LangSwitch } from "./LangSwitch";
import { Stripes } from "./ui";
import { pick, useLang } from "@/lib/i18n";
import { useNav } from "@/lib/nav";
import type { FolderId } from "@/lib/types";

let introPlayed = false;           // 首次进入标签依次上浮仅一次
// 标签错落：左右交替、宽度略有不同（相邻标签在水平方向不重叠）
const TABS = [{ left: "50%", w: "44%" }, { left: "5%", w: "42%" }, { left: "50%", w: "44%" }, { left: "5%", w: "40%" }];
const EASE = [0.2, 0.8, 0.2, 1] as [number, number, number, number];

export function HomeStack({ onOpen }: { onOpen: (id: FolderId) => void }) {
  const { data } = useNav();
  const { lang } = useLang();
  const reduce = useReducedMotion();
  const [opening, setOpening] = useState<FolderId | null>(null);
  const [curtain, setCurtain] = useState<{ tone: string; y: number; sx: number } | null>(null);
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const intro = useRef(!introPlayed && !reduce);
  introPlayed = true;
  const { site } = data;
  const c = site.cover;
  const folders = [...site.folders].sort((a, b) => a.order - b.order);
  const nameTodo = site.name.zh === "待补位";
  const tagTodo = site.tagline.zh === "待补位";

  function open(id: FolderId, tint: string) {
    if (opening) return;
    if (reduce) { onOpen(id); return; }
    const r = refs.current[id]?.getBoundingClientRect();
    setCurtain({ tone: `var(--${tint})`, y: r ? r.top : 0, sx: r ? r.width / window.innerWidth : 1 });
    setOpening(id);
    window.setTimeout(() => onOpen(id), 470);
  }

  const sink = { y: 36, opacity: 0 };
  const rise = intro.current ? { y: 28, opacity: 0 } : false;

  return (
    <div className="absolute inset-0 bg-night paper-grain grain-soft overflow-y-auto overflow-x-hidden fade-in">
      <div className="min-h-full flex flex-col mx-auto w-full max-w-[520px]">
        {/* ── 标题区：蓝色衬线大字 + 倒置的第二个词 + 右侧小字 ── */}
        <header className={`relative shrink-0 px-5 safe-top transition-opacity duration-300 ${opening ? "opacity-0" : ""}`}>
          <div className="absolute right-2 top-0 safe-top z-20 text-paper-light"><LangSwitch label={pick(site.ui.lang, lang)} /></div>
          <h1 aria-label={`${c.titleA} ${c.titleB}`} className="m-0 pt-12 f-didone font-medium text-blue" style={{ fontSize: "clamp(44px, min(15.4vw, 8.4dvh), 68px)", lineHeight: 0.98, letterSpacing: "-0.01em" }}>
            <span aria-hidden className="block">{c.titleA}</span>
            <span aria-hidden className="block" style={{ marginLeft: "14%", lineHeight: 0.82 }}>
              <span className="inline-block" style={{ transform: "rotate(180deg)" }}>{c.titleB}</span>
            </span>
          </h1>
          <p className="absolute right-6 top-[calc(env(safe-area-inset-top,0px)+50px)] m-0 text-right f-serif text-[16px] leading-[1.65] text-blue-soft">
            <span className="slash slash-r">{c.sideA}</span><br /><span className="slash slash-l">{c.sideB}</span>
          </p>
        </header>

        {/* ── 文件夹叠放 ── */}
        <div className="relative flex-1 mx-5 mt-5 min-h-[400px]">
          {folders.map((f, i) => (
            <motion.div key={f.id} className="absolute left-0 right-0 bottom-0"
              style={{ top: `calc(56px + ${i} * var(--step))` }}
              initial={rise} animate={opening && opening !== f.id ? sink : { y: 0, opacity: 1 }}
              transition={intro.current && !opening ? { duration: 0.6, ease: EASE, delay: 0.08 * (4 - i) } : { duration: 0.3, ease: EASE }}>
              <div ref={(el) => { refs.current[f.id] = el; }} className="absolute inset-0 paper-grain grain-soft" style={{ background: `var(--${f.tint})` }} />
              <button type="button" onClick={() => open(f.id, f.tint)} aria-label={`${pick(site.ui.open, lang)} ${pick(f.label, lang)}`}
                className="tab-shape absolute -top-[52px] h-[56px] px-4 flex flex-col justify-center text-left text-paper-light hover:-translate-y-2 focus-visible:-translate-y-2 transition-transform duration-150"
                style={{ width: TABS[i].w, left: TABS[i].left, background: `var(--${f.tint})` }}>
                <span className="f-cap f-capb text-[18px] leading-tight" style={{ letterSpacing: "0.06em" }}>{f.label.zh}</span>
                <span className="f-cap f-capb text-[12px] leading-tight opacity-90">{f.label.en}</span>
              </button>
            </motion.div>
          ))}

          {/* 最前面的蓝色文件夹（封面） */}
          <motion.div className="absolute left-0 right-0 bottom-0" style={{ top: "calc(56px + 4 * var(--step))" }}
            initial={rise} animate={opening ? sink : { y: 0, opacity: 1 }}
            transition={intro.current && !opening ? { duration: 0.6, ease: EASE } : { duration: 0.3, ease: EASE }}>
            <div className="absolute inset-0 paper-grain grain-soft text-paper-light overflow-y-auto pane-scroll" style={{ background: "var(--cover)" }}>
              <div className="relative h-full min-h-[330px]">
                <i aria-hidden className="absolute left-[34%] w-[31%] top-[18px] h-[2px] bg-paper-light" />
                <p className="absolute left-[49.5%] top-[34px] m-0 f-sans-b text-[28px] leading-none" style={{ letterSpacing: "-0.01em" }}>{c.product}</p>
                <i aria-hidden className="absolute left-[65%] w-[30%] top-[84px] h-[2px] bg-paper-light" />
                <p className="absolute left-[65%] top-[92px] m-0 f-sans-b text-[26px] leading-none lowercase">{c.mark}</p>

                {/* 右列：姓名 / 定位 / 数字条 */}
                <div className="absolute left-[49.5%] right-[3%]" style={{ bottom: "calc(18px + env(safe-area-inset-bottom, 0px))" }}>
                  <p className="m-0 f-cap f-capb text-[13px] leading-snug">
                    {nameTodo ? <span className="todo-mark on-dark">{lang === "zh" ? "名字待补位" : "Name TBD"}</span> : pick(site.name, lang)}
                  </p>
                  <p className="mt-1 mb-4 f-serif text-[16px] leading-snug text-paper-light/90">
                    {tagTodo ? <span className="todo-mark on-dark">{lang === "zh" ? "一句话定位待补位" : "Tagline TBD"}</span> : pick(site.tagline, lang)}
                  </p>
                  <dl className="m-0 grid gap-y-1.5">
                    {site.stats.map((m, i) => (
                      <div key={i} className="flex items-baseline gap-2 border-t border-paper-light/40 pt-1.5">
                        <dd className="m-0 f-sans-b text-[19px] leading-none shrink-0 min-w-[52px]">{m.value}</dd>
                        <dt className="f-cap text-[12px] leading-[1.35] text-paper-light/90" style={{ letterSpacing: "0.07em" }}>
                          {pick(m.label, lang)}{m.note && <span className="block normal-case" style={{ letterSpacing: "0.04em" }}>{pick(m.note, lang)}</span>}
                        </dt>
                      </div>
                    ))}
                  </dl>
                </div>

                {/* 左下：横线序列 + Information Program */}
                <div className="absolute left-[3.5%] w-[34%]" style={{ bottom: "calc(18px + env(safe-area-inset-bottom, 0px))" }}>
                  <Stripes className="w-full h-[88px] mb-4" />
                  <p className="m-0 font-light text-[24px] leading-[1.12]" style={{ fontFamily: "Roboto, sans-serif" }}>
                    {c.program.split(" ").map((w) => <span key={w} className="block">{w}</span>)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 展开幕布：基调色从所选文件夹处铺满屏幕（仅 transform） */}
      {curtain && (
        <motion.div aria-hidden className="fixed inset-0 z-40 paper-grain grain-soft" style={{ background: curtain.tone, transformOrigin: "50% 0" }}
          initial={{ y: curtain.y, scaleX: curtain.sx }} animate={{ y: 0, scaleX: 1 }} transition={{ duration: 0.45, ease: EASE }} />
      )}
    </div>
  );
}
