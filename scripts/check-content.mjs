// 内容检查：双语字段齐全；--strict（生产构建）时，残留「待补位」/ 缺失图片 / 空链接 → 报错
import fs from "node:fs";
import path from "node:path";

const strict = process.argv.includes("--strict") && process.env.ALLOW_PLACEHOLDER !== "1";
const ROOT = path.resolve("content");
const errors = [], todos = [];

function walkJson(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walkJson(path.join(dir, e.name)) : e.name.endsWith(".json") ? [path.join(dir, e.name)] : []);
}
const isL = (v) => v && typeof v === "object" && "zh" in v && "en" in v;

function visit(v, file, p) {
  if (Array.isArray(v)) return v.forEach((x, i) => visit(x, file, `${p}[${i}]`));
  if (v && typeof v === "object") {
    if (isL(v)) {
      if (!v.zh || !v.en) errors.push(`${file} ${p}: 缺少 zh 或 en`);
      if (v.zh.includes("待补位")) todos.push(`${file} ${p}`);
      return;
    }
    if (v.status === "todo") todos.push(`${file} ${p}: status=todo`);
    if (typeof v.src === "string") {
      const f = path.resolve("assets-src", v.src.replace(/\.jpg$/, ".jpg"));
      const alt = ["jpg", "jpeg", "png", "webp"].map((e) => f.replace(/\.jpg$/, "." + e));
      if (!alt.some((a) => fs.existsSync(a))) todos.push(`${file} ${p}: 缺少图片 assets-src/${v.src}`);
    }
    if ("url" in v && v.url === "") todos.push(`${file} ${p}: 链接为空`);
    if (v.value === "待补位") todos.push(`${file} ${p}: 数字待补位`);
    for (const [k, x] of Object.entries(v)) visit(x, file, p ? `${p}.${k}` : k);
  }
}
for (const f of walkJson(ROOT)) visit(JSON.parse(fs.readFileSync(f, "utf-8")), path.relative(process.cwd(), f), "");

if (errors.length) { console.error("✗ 内容错误：\n" + errors.join("\n")); process.exit(1); }
if (todos.length) {
  const msg = `待补位 ${todos.length} 处`;
  if (strict) { console.error(`✗ 生产构建中仍有${msg}：\n` + todos.slice(0, 40).join("\n") + (todos.length > 40 ? `\n… 另 ${todos.length - 40} 处` : "") + "\n\n草稿预览请运行：npm run build:draft"); process.exit(1); }
  console.log(`⚠ ${msg}（草稿模式，不阻止构建）`);
} else console.log("✓ 内容检查通过");
