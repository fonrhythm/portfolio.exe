export type Lang = "zh" | "en";
export type L = { zh: string; en: string };
export type Status = "done" | "partial" | "todo";
export type FolderId = "events" | "social" | "projects" | "others";
export type TemplateId =
  | "index" | "profile" | "timeline" | "photowall" | "attachment"
  | "stats" | "links" | "case-study" | "contact";

export type Metric = { value: string; label: L; note?: L };
export type ImageRef = { src: string; alt: L; caption?: L };
export type LinkRef = { url: string; label: L; summary?: L; platform?: "wechat" | "xhs" | "web" };
export type Step = { title: L; text: L };
export type Section = {
  key?: string;
  heading: L;
  items?: L[];
  metrics?: Metric[];
  links?: LinkRef[];
};

/** 一页的数据（content/*.json 的字段） */
export type PageData = {
  template: TemplateId;
  status: Status;
  title?: L;
  subtitle?: L;
  summary?: L;
  period?: string;
  role?: L;
  metrics?: Metric[];
  bullets?: L[];
  images?: ImageRef[];
  attachments?: ImageRef[];
  links?: LinkRef[];
  steps?: Step[];
  sections?: Section[];
  facts?: { label: L; value: L }[];
};

/** 一个 JSON 文件 = 一个作品；有 pages 时展开为多页 */
export type Entry = PageData & {
  id: string;
  folder: FolderId;
  order: number;
  featured?: boolean;
  pages?: PageData[];
};

export type FolderMeta = {
  id: FolderId;
  order: number;
  label: L;
  blurb: L;
  tint: "events" | "social" | "projects" | "others";
  onColor: "ink" | "paper";
};

export type SiteMeta = {
  name: L;
  tagline: L;
  folders: FolderMeta[];
  stats: Metric[];
  cover: { titleA: string; titleB: string; sideA: string; sideB: string; product: string; program: string; mark: string };
  ui: Record<string, L>;
};

/** 展开后的单个屏幕 / 页面 */
export type Screen = {
  key: string;
  folder: FolderId;
  entryId: string;
  /** 站内路径，形如 /events/weng-huihui/2/ */
  path: string;
  /** 在同一作品内的序号（从 1 开始），单页作品为 0 */
  sub: number;
  data: PageData;
  entryTitle?: L;
};

export type SiteData = { site: SiteMeta; screens: Screen[] };
