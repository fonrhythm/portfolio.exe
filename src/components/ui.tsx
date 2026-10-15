"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import manifest from "@/generated/images.json";
import { isTodo, pick, useLang } from "@/lib/i18n";
import { useNav } from "@/lib/nav";
import type { ImageRef, L, LinkRef, Metric, Screen } from "@/lib/types";

type Manifest = Record<string, { w: number; h: number; blur: string }>;
const M = manifest as Manifest;
export const hasImage = (src: string) => !!M[src];

/* ───────── 文本：自动处理中英与「待补位」 ───────── */
export function Tx({ v, className, dark }: { v?: L; className?: string; dark?: boolean }) {
  const { lang } = useLang();
  if (!v) return null;
  if (isTodo(v)) return <span className={`todo-mark ${dark ? "on-dark" : ""} ${className ?? ""}`}>{pick(v, lang)}</span>;
  return <span className={className}>{pick(v, lang)}</span>;
}

export function Todo({ label, className = "" }: { label?: string; className?: string }) {
  const { lang } = useLang();
  return (
    <div className={`todo-box flex items-center justify-center text-center p-3 ${className}`}>
      <span className="todo-mark border-0">{label ?? (lang === "zh" ? "待补位" : "TBD")}</span>
    </div>
  );
}

/* ───────── 页头：宽字距细体标题 + 错位衬线副标题 ───────── */
export function PageHead({ title, subtitle }: { title?: L; subtitle?: L }) {
  return (
    <header className="mb-7">
      <h1 data-page-title tabIndex={-1} className="f-cap text-[22px] leading-[1.6] text-ink m-0">
        <Tx v={title} />
      </h1>
      {subtitle && (
        <p className="f-serif text-[19px] leading-snug text-ink-soft mt-3 ml-[18%]">
          <Tx v={subtitle} />
        </p>
      )}
    </header>
  );
}

/* ───────── 参考图里的横线序列（文件夹封面母题） ───────── */
export function Stripes({ className = "", color = "var(--paper-light)" }: { className?: string; color?: string }) {
  const ys = [1, 5, 9, 14, 20, 27, 35, 44, 54];
  return (
    <svg aria-hidden viewBox="0 0 100 56" preserveAspectRatio="none" className={className}>
      {ys.map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />)}
    </svg>
  );
}

/* ───────── 页面卡：上方基调色块（或照片）+ 下方米白颗粒纸 ───────── */
export function Card({ screen, children }: { screen: Screen; children: ReactNode }) {
  const { data, screens } = useNav();
  const { lang } = useLang();
  const f = data.site.folders.find((x) => x.id === screen.folder)!;
  const idx = screens.findIndex((s) => s.key === screen.key);
  const total = screens.filter((x) => x.entryId === screen.entryId).length;
  const kicker = `${pick(f.label, lang)}${screen.sub ? ` · ${screen.sub}/${total}` : ""}`;
  const hero = heroOf(screen);
  return (
    <article className="paper-grain bg-paper text-ink rounded-paper overflow-hidden" style={{ ["--tone" as string]: `var(--${f.tint})` } as CSSProperties}>
      <div className="relative aspect-[16/6.6]" style={{ background: `var(--${f.tint}-d)` }}>
        {hero ? (
          <div className="absolute inset-0"><Img img={hero} fill priority /></div>
        ) : (
          <Stripes className="absolute left-5 top-4 w-[32%] h-[46%]" />
        )}
        <p className="absolute left-5 bottom-4 right-5 m-0 f-cap text-[12px] text-paper-light truncate">{kicker}</p>
      </div>
      <div className="px-5 pt-7 pb-6">
        {children}
        <footer className="mt-12 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="h-px w-[60px] bg-ink mb-4" />
            <p className="f-serif text-[17px] leading-snug m-0 text-ink">{pick(f.blurb, lang)}</p>
          </div>
          <span className="f-cap text-[14px] shrink-0" style={{ letterSpacing: "0.06em" }}>/{String(idx + 1).padStart(2, "0")}</span>
        </footer>
      </div>
    </article>
  );
}
/** 照片墙页：第一张存在时作为卡片顶部大图 */
export function heroOf(s: Screen): ImageRef | undefined {
  const im = s.data.template === "photowall" ? s.data.images?.[0] : undefined;
  return im && hasImage(im.src) ? im : undefined;
}

/* ───────── 数字块：细线 + 衬线大数字（取代旧印章） ───────── */
export function Stamp({ m, accent = false }: { m: Metric; i?: number; accent?: boolean }) {
  const { lang } = useLang();
  const todo = m.value === "待补位";
  return (
    <div className="border-t border-ink pt-3">
      <div className="f-didone text-[40px] leading-none" style={{ color: accent && !todo ? "var(--tone)" : "var(--ink)" }}>
        {todo ? <span className="todo-mark">{lang === "zh" ? "待补位" : "TBD"}</span> : m.value}
      </div>
      <div className="f-cap text-[12px] mt-3 text-ink">{pick(m.label, lang)}</div>
      {m.note && <div className="f-serif text-[15px] leading-snug mt-1 text-ink-soft"><Tx v={m.note} /></div>}
    </div>
  );
}

/* ───────── 图片：AVIF/WebP + 模糊占位 + 懒加载 ───────── */
export function Img({ img, sizes = "(min-width:1024px) 560px, 92vw", priority = false, fill = false, className = "" }: { img: ImageRef; sizes?: string; priority?: boolean; fill?: boolean; className?: string }) {
  const { lang } = useLang();
  const info = M[img.src];
  if (!info) return <Todo label={lang === "zh" ? "照片待补位" : "Photo TBD"} className={`${fill ? "h-full" : "aspect-[4/3]"} w-full ${className}`} />;
  const base = `/img/${img.src.replace(/\.\w+$/, "")}`;
  const set = (ext: string) => [480, 828, 1200].map((w) => `${base}-${w}.${ext} ${w}w`).join(", ");
  return (
    <div className={`overflow-hidden ${fill ? "h-full w-full" : ""} ${className}`} style={{ aspectRatio: fill ? undefined : `${info.w} / ${info.h}`, backgroundImage: `url(${info.blur})`, backgroundSize: "cover" }}>
      <picture>
        <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
        <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
        <img src={`${base}-828.webp`} alt={pick(img.alt, lang)} width={info.w} height={info.h}
          loading={priority ? "eager" : "lazy"} decoding="async" className="w-full h-full object-cover block" />
      </picture>
    </div>
  );
}

/* ───────── 照片：无边框、编号 ───────── */
export function PhotoTape({ img, n, priority = false }: { img: ImageRef; n?: number; priority?: boolean }) {
  return (
    <figure className="m-0">
      <Img img={img} priority={priority} />
      <figcaption className="f-cap text-[12px] text-ink-soft mt-2 flex justify-between">
        <span>{!isTodo(img.caption) && img.caption ? <Tx v={img.caption} /> : null}</span>
        {n != null && <span>/{String(n).padStart(2, "0")}</span>}
      </figcaption>
    </figure>
  );
}

/* ───────── 附件：缩略图 → 全屏双指缩放 ───────── */
export function Attachment({ img, n }: { img: ImageRef; n: number }) {
  const { lang } = useLang();
  const { ui } = useNav();
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const has = !!M[img.src];
  return (
    <>
      <button ref={btn} type="button" disabled={!has} onClick={() => setOpen(true)} aria-label={pick(img.alt, lang)}
        className="block w-full text-left border border-ink/30 p-2 min-h-[44px]">
        <Img img={img} sizes="(min-width:1024px) 280px, 46vw" />
        <span className="f-cap text-[12px] mt-2 flex justify-between"><span>{lang === "zh" ? "查看" : "View"}</span><span>/{String(n).padStart(2, "0")}</span></span>
      </button>
      {open && <Lightbox img={img} onClose={() => { setOpen(false); btn.current?.focus(); }} closeLabel={pick(ui("close"), lang)} hint={pick(ui("zoomHint"), lang)} />}
    </>
  );
}

function Lightbox({ img, onClose, closeLabel, hint }: { img: ImageRef; onClose: () => void; closeLabel: string; hint: string }) {
  const { lang } = useLang();
  const [t, setT] = useState({ x: 0, y: 0, s: 1 });
  const pts = useRef(new Map<number, { x: number; y: number }>());
  const last = useRef<{ d: number } | null>(null);
  const tap = useRef(0);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.dataset.lightbox = "1";
    closeBtn.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", key);
    return () => { delete document.body.dataset.lightbox; window.removeEventListener("keydown", key); };
  }, [onClose]);

  const info = M[img.src];
  const base = `/img/${img.src.replace(/\.\w+$/, "")}`;

  function down(e: React.PointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    last.current = null;
    const now = Date.now();
    if (pts.current.size === 1) {
      if (now - tap.current < 300) setT((v) => (v.s > 1 ? { x: 0, y: 0, s: 1 } : { x: 0, y: 0, s: 2.5 }));
      tap.current = now;
    }
  }
  function move(e: React.PointerEvent) {
    const p = pts.current.get(e.pointerId);
    if (!p) return;
    const prev = { ...p };
    p.x = e.clientX; p.y = e.clientY;
    const arr = [...pts.current.values()];
    if (arr.length === 2) {
      const d = Math.hypot(arr[0].x - arr[1].x, arr[0].y - arr[1].y);
      if (last.current) { const ratio = d / last.current.d; setT((v) => ({ ...v, s: Math.min(6, Math.max(1, v.s * ratio)) })); }
      last.current = { d };
    } else if (arr.length === 1) {
      setT((v) => (v.s > 1 ? { ...v, x: v.x + (e.clientX - prev.x), y: v.y + (e.clientY - prev.y) } : v));
    }
  }
  function up(e: React.PointerEvent) {
    pts.current.delete(e.pointerId); last.current = null;
    setT((v) => (v.s <= 1 ? { x: 0, y: 0, s: 1 } : v));
  }

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={pick(img.alt, lang)} className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(11,11,12,0.96)" }}>
      <div className="absolute inset-0 touch-none flex items-center justify-center overflow-hidden" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        {info && <img src={`${base}-1200.webp`} alt={pick(img.alt, lang)} draggable={false} className="max-w-full max-h-full select-none" style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.s})` }} />}
      </div>
      <button ref={closeBtn} onClick={onClose} aria-label={closeLabel}
        className="absolute top-3 right-3 safe-top min-w-[44px] min-h-[44px] rounded-btn bg-paper text-ink f-cap text-[13px] px-3">✕ {closeLabel}</button>
      <p className="absolute bottom-4 left-0 right-0 text-center f-cap text-[12px] text-paper safe-bottom">{hint}</p>
    </div>,
    document.body
  );
}

/* ───────── 外链卡 ───────── */
export function LinkCard({ link }: { link: LinkRef }) {
  const { lang } = useLang();
  const { ui } = useNav();
  const empty = !link.url;
  const note = link.platform === "wechat" ? ui("redirectWechat") : link.platform === "xhs" ? ui("redirectXhs") : ui("redirectWeb");
  return (
    <div className="border border-ink/30 p-4">
      <h3 className="f-serif text-[20px] leading-snug text-ink m-0"><Tx v={link.label} /></h3>
      {link.summary && <p className="t-body text-ink-soft mt-1 mb-0"><Tx v={link.summary} /></p>}
      <div className="mt-4 flex items-center gap-3 flex-wrap">
        {empty ? (
          <span className="todo-box f-cap text-[12px] px-4 min-h-[44px] inline-flex items-center rounded-btn">{lang === "zh" ? "链接待补位" : "Link TBD"}</span>
        ) : (
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="bg-ink text-paper-light rounded-btn px-4 min-h-[44px] inline-flex items-center f-cap f-capb text-[12px]">
            {pick(ui("readOrigin"), lang)}
          </a>
        )}
        <span className="t-tag text-ink-soft">{pick(note, lang)}</span>
      </div>
    </div>
  );
}
