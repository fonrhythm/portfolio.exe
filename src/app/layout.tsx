import type { Metadata, Viewport } from "next";
import "@fontsource/playfair-display/latin-500.css";
import "@fontsource/roboto/latin-300.css";
import "@fontsource/roboto/latin-500.css";
import "@fontsource/roboto/latin-700.css";
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/noto-sans-sc/300.css";
import "@fontsource/noto-sans-sc/500.css";
import "@fontsource/noto-serif-sc/400.css";
import "@fontsource/noto-serif-sc/700.css";
import "./globals.css";
import { Shell } from "@/components/Shell";
import { loadSite } from "@/lib/content";
import { sitePath } from "@/lib/paths";
import type { CSSProperties } from "react";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "作品集 · Portfolio",
  description: "活动执行 · 新媒体运营 · 项目经历 / Events, social media and projects",
  openGraph: { title: "作品集 · Portfolio", description: "活动执行 · 新媒体运营 · 项目经历", images: [sitePath("/og.png")], type: "website" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0B0B0C" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const data = loadSite();
  return (
    <html lang="zh-CN">
      <body style={{ "--paper-noise": `url("${sitePath("/paper-noise.png")}")` } as CSSProperties}>
        <Shell data={data} />
        {children}
      </body>
    </html>
  );
}
