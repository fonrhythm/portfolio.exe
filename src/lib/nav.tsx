"use client";
import { createContext, useContext } from "react";
import type { Screen, SiteData } from "./types";

type NavCtx = {
  data: SiteData;
  go: (path: string) => void;
  screens: Screen[];            // 当前文件夹内的页面
  current?: Screen;
  ui: (key: string) => import("./types").L;
};
export const NavContext = createContext<NavCtx | null>(null);
export function useNav() {
  const c = useContext(NavContext);
  if (!c) throw new Error("NavContext missing");
  return c;
}
