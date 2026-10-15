# 作品集网站（可翻开的文件夹）

Next.js 15（App Router）+ TypeScript + Tailwind 3 + Framer Motion，静态导出（`output: export`），无服务端依赖。

## 运行
```bash
npm install
npm run dev          # 开发
npm run build:draft  # 草稿构建（允许「待补位」），产物在 out/
npm run build        # 生产构建：仍有「待补位」/缺图/空链接/缺中英文 → 报错
npm run check        # 只检查内容
```
预览 `out/`：`npx serve out`。

## 新增作品（不改代码）
1. 在 `content/{events|social|projects|others}/` 新增一个 JSON（参考同目录已有文件）。
   - 单页：直接写 `template` 与字段；多页：写 `pages: [...]`，每页一个模板。
   - 所有文本字段都是 `{ "zh": "...", "en": "..." }`；暂缺的写 `{"zh":"待补位","en":"TBD"}`。
   - `order` 决定顺序；URL 自动生成（`/events/<id>/` 或 `/events/<id>/<n>/`），目录页自动出现新条目。
2. 照片放 `assets-src/{folder}/{slug}/01.jpg`（小写+连字符，两位序号），JSON 里写 `"src": "events/<slug>/01.jpg"`。
   `npm run images`（dev/build 会自动执行）用 sharp 生成 AVIF + WebP（480/828/1200）与模糊占位。
3. `content/site.json`：名字、一句话定位、封面数字条、界面文案、文件夹标签。

模板：`index` `profile` `timeline` `photowall` `attachment` `stats` `links` `case-study` `contact`。
`status`：done / partial / todo（仅作标记；构建检查看「待补位」字符串、缺失图片与空链接）。

## 关键约定
- 视觉：黑底（#0B0B0C）+ 米白颗粒纸卡；首页为蓝色文件夹；四个标签各有基调色（活动执行=红 `--events`、新媒体=绿 `--social`、项目=灰 `--projects`、其他=蓝 `--others`），抽出标签后整页、顶部色块、数字、序号都换成该基调。色值在 `globals.css` 顶部，改一处全站生效。
- 封面文案（Valar / Morghulis / I’m growing strong / Portfolio / Information Program / vip）在 `content/site.json` 的 `cover` 字段。
- 色彩无 #000、#FFF、纯灰。
- 动画只用 transform / opacity；`prefers-reduced-motion` 下改为 150ms 淡入淡出。
- 字体：Playfair Display（大标题/数字）、Roboto Light（宽字距大写）、Cormorant Garamond（小衬线），中文为思源黑体 Light/Medium + 思源宋体 Regular/Bold，均按 unicode-range 分片按需下载。
- 语言：默认中文，`?lang=en` 直达英文，选择存 localStorage（try/catch）。
- 英文为机翻，需校对（尤其「博兰斯勒」「欧米勒」等专名的英文写法）。
- 子路径部署使用环境变量 `NEXT_PUBLIC_BASE_PATH`，例如 `/exiitune.exe`；OG 分享域名用 `NEXT_PUBLIC_SITE_URL`。

## GitHub Pages

推送到 `main` 后，GitHub Actions 自动构建并部署。仓库 Settings → Pages 的 Source 设置为 GitHub Actions。
访问地址：https://fonrhythm.github.io/exiitune.exe/

目前使用 `build:draft` 发布，保留内容中的「待补位」；内容补齐后可将工作流切换为 `npm run build`。
