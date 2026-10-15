"use client";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { FolderView } from "./FolderView";
import { HomeStack } from "./HomeStack";
import { LangProvider } from "@/lib/i18n";
import { NavContext } from "@/lib/nav";
import type { FolderId, L, SiteData } from "@/lib/types";

const norm = (p: string) => (p.endsWith("/") ? p : p + "/");

export function Shell({ data }: { data: SiteData }) {
  const pathname = norm(usePathname() || "/");
  const current = data.screens.find((s) => s.path === pathname);
  const folder = current ? data.site.folders.find((f) => f.id === current.folder) : undefined;
  const screens = useMemo(() => (current ? data.screens.filter((s) => s.folder === current.folder) : []), [data, current]);
  const index = current ? screens.findIndex((s) => s.key === current.key) : 0;

  // 每页独立 URL；返回键由浏览器历史处理
  const go = useCallback((path: string) => {
    if (norm(window.location.pathname) === path) return;
    window.history.pushState(null, "", path);
  }, []);

  const ui = useCallback((k: string): L => data.site.ui[k] ?? { zh: k, en: k }, [data]);
  const ctx = useMemo(() => ({ data, go, screens, current, ui }), [data, go, screens, current, ui]);

  // 手机浏览器顶栏颜色跟随当前基调
  useEffect(() => {
    const tints: Record<string, string> = { events: "#C3281D", social: "#1E6B47", projects: "#77756F", others: "#2D5FC4" };
    let m = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!m) { m = document.createElement("meta"); m.name = "theme-color"; document.head.appendChild(m); }
    m.content = folder ? tints[folder.tint] : "#0B0B0C";
  }, [folder]);

  const openFolder = (id: FolderId) => {
    const first = data.screens.find((s) => s.folder === id);
    if (first) go(first.path);
  };

  return (
    <LangProvider>
      <NavContext.Provider value={ctx}>
        <div className="fixed inset-0">
          {current && folder ? <FolderView key={folder.id} folder={folder} index={index} /> : <HomeStack onOpen={openFolder} />}
        </div>
      </NavContext.Provider>
    </LangProvider>
  );
}
