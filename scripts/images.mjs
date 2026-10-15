// 原图 /assets-src/{folder}/{slug}/01.jpg → public/img/**-{480,828,1200}.{avif,webp} + 模糊占位
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = path.resolve("assets-src");
const OUT = path.resolve("public/img");
const MANIFEST = path.resolve("src/generated/images.json");
const WIDTHS = [480, 828, 1200];
const exts = /\.(jpe?g|png|webp|tiff?)$/i;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : exts.test(e.name) ? [path.join(dir, e.name)] : []);
}

const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf-8")) : {};
const next = {};
for (const file of walk(SRC)) {
  const rel = path.relative(SRC, file).split(path.sep).join("/");
  const key = rel.replace(/\.\w+$/, ".jpg");        // content 里统一写 .jpg
  const base = path.join(OUT, rel.replace(/\.\w+$/, ""));
  fs.mkdirSync(path.dirname(base), { recursive: true });
  const img = sharp(file).rotate();
  const meta = await img.metadata();
  const w0 = meta.width ?? 1200, h0 = meta.height ?? 900;
  const stale = !fs.existsSync(`${base}-1200.webp`) || fs.statSync(file).mtimeMs > fs.statSync(`${base}-1200.webp`).mtimeMs;
  if (stale) {
    for (const w of WIDTHS) {
      const size = Math.min(w, w0);
      await sharp(file).rotate().resize({ width: size }).avif({ quality: 50, effort: 4 }).toFile(`${base}-${w}.avif`);
      // 1200 宽单图 ≤ 200KB：逐级降质
      let q = 76, buf;
      do { buf = await sharp(file).rotate().resize({ width: size }).webp({ quality: q }).toBuffer(); q -= 8; }
      while (w === 1200 && buf.length > 200 * 1024 && q > 30);
      fs.writeFileSync(`${base}-${w}.webp`, buf);
    }
  }
  const blur = await sharp(file).rotate().resize({ width: 16 }).blur(1).jpeg({ quality: 40 }).toBuffer();
  next[key] = { w: w0, h: h0, blur: `data:image/jpeg;base64,${blur.toString("base64")}` };
}
fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
fs.writeFileSync(MANIFEST, JSON.stringify(next));
console.log(`[images] ${Object.keys(next).length} image(s) processed`);
