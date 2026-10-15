"use client";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * 自实现翻页：drag + 手指跟手。只挂载当前页 ±1，其余卸载。
 * 只动画 transform / opacity。
 */
export function Pager({ count, index, onChange, render, controlRef }: {
  count: number; index: number; onChange: (i: number) => void;
  controlRef?: { current: ((d: 1 | -1) => void) | null };
  render: (i: number, role: "prev" | "cur" | "next") => ReactNode;
}) {
  const x = useMotionValue(0);
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(360);
  const [cur, setCur] = useState(index);
  const busy = useRef(false);
  const dragged = useRef(false);
  const reduce = useReducedMotion();
  const first = useRef(true);

  useEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(() => setW(el.clientWidth || 360));
    ro.observe(el); setW(el.clientWidth || 360);
    return () => ro.disconnect();
  }, []);

  // 外部导航（返回键、目录链接）：直接同步，不播放滑动
  useEffect(() => { if (index !== cur && !busy.current) setCur(index); }, [index, cur]);

  useLayoutEffect(() => { x.set(0); busy.current = false; }, [cur, x]);

  // 翻页后把焦点移到页标题
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const t = box.current?.querySelector<HTMLElement>('[data-role="cur"] [data-page-title]');
    t?.focus({ preventScroll: true });
  }, [cur]);

  function commit(dir: 1 | -1) {
    const next = cur + dir;
    if (busy.current || next < 0 || next >= count) { animate(x, 0, { type: "spring", stiffness: 420, damping: 40 }); return; }
    busy.current = true;
    if (reduce) { setCur(next); onChange(next); return; }
    animate(x, -dir * w, { duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }).then(() => { setCur(next); onChange(next); });
  }
  if (controlRef) controlRef.current = commit;

  const items = [cur - 1, cur, cur + 1].filter((i) => i >= 0 && i < count);

  return (
    <div ref={box} className="absolute inset-0 overflow-hidden" data-pager>
      <motion.div
        className="absolute inset-0"
        style={{ x }}
        drag="x" dragDirectionLock dragElastic={0.12} dragMomentum={false}
        dragConstraints={{ left: cur < count - 1 ? -w : 0, right: cur > 0 ? w : 0 }}
        onDragStart={() => { dragged.current = true; }}
        onDragEnd={(_, info) => {
          setTimeout(() => { dragged.current = false; }, 0);
          const t = w * 0.3;
          if ((info.offset.x < -t || info.velocity.x < -500) && cur < count - 1) commit(1);
          else if ((info.offset.x > t || info.velocity.x > 500) && cur > 0) commit(-1);
          else animate(x, 0, { type: "spring", stiffness: 420, damping: 40 });
        }}
        onClickCapture={(e) => { if (dragged.current) { e.stopPropagation(); e.preventDefault(); } }}
      >
        {items.map((i) => {
          const role = i === cur ? "cur" : i < cur ? "prev" : "next";
          return (
            <div key={i} className="absolute inset-0" style={{ transform: `translateX(${(i - cur) * 100}%)` }}>
              <motion.div data-role={role} aria-hidden={role !== "cur"} inert={role !== "cur"}
                className="absolute inset-0 pane-scroll"
                initial={false} animate={{ opacity: role === "cur" ? 1 : 0.5 }}
                transition={{ duration: reduce ? 0.15 : 0.3 }}>
                {render(i, role)}
              </motion.div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
