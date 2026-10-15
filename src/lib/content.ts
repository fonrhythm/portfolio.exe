import fs from "node:fs";
import path from "node:path";
import type { Entry, FolderId, PageData, Screen, SiteData, SiteMeta } from "./types";

const ROOT = path.join(process.cwd(), "content");

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
}

/** 读取 content/ 下所有 JSON，展开为按文件夹排序的页面列表。新增作品只需新增 JSON。 */
export function loadSite(): SiteData {
  const site = readJson<SiteMeta>(path.join(ROOT, "site.json"));
  const screens: Screen[] = [];

  for (const folder of [...site.folders].sort((a, b) => a.order - b.order)) {
    const dir = path.join(ROOT, folder.id);
    if (!fs.existsSync(dir)) continue;
    const entries = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => ({ file: f, entry: readJson<Entry>(path.join(dir, f)) }))
      .sort((a, b) => a.entry.order - b.entry.order || a.file.localeCompare(b.file));

    for (const { entry } of entries) {
      const slug = entry.id.replace(new RegExp("^" + folder.id + "-"), "");
      const pages: PageData[] = entry.pages ?? [entry];
      pages.forEach((p, i) => {
        const multi = !!entry.pages && entry.pages.length > 1;
        const sub = multi ? i + 1 : 0;
        screens.push({
          key: `${folder.id}/${slug}${multi ? "/" + sub : ""}`,
          folder: folder.id as FolderId,
          entryId: entry.id,
          path: `/${folder.id}/${slug}/${multi ? sub + "/" : ""}`,
          sub,
          data: { ...p, status: p.status ?? entry.status },
          entryTitle: entry.title ?? entry.pages?.[0]?.title,
        });
      });
    }
  }
  return { site, screens };
}
