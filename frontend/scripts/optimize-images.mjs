/**
 * Image optimizer for public/images.
 *
 * Re-encodes large raster images IN PLACE (same path/extension, so no code
 * references need to change): resizes down to a sane max width and applies
 * mozjpeg / zlib compression. Originals are recoverable via git.
 *
 *   node scripts/optimize-images.mjs          # DRY RUN — reports savings only
 *   node scripts/optimize-images.mjs --write  # actually overwrite files
 *
 * Tunables below.
 */
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

// Don't let libvips hold file handles open — on Windows that blocks the
// in-place overwrite below.
sharp.cache(false);

const ROOT = path.resolve("public/images");
const MAX_WIDTH = 1920; // heroes/banners rarely need more than this on the web
const JPEG_QUALITY = 80;
const MIN_BYTES = 300 * 1024; // only touch files larger than 300 KB
const WRITE = process.argv.includes("--write");

const RASTER = new Set([".jpg", ".jpeg", ".png"]);

async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

const mb = (b) => (b / 1048576).toFixed(2) + " MB";

async function encode(input, ext, meta) {
  // `input` is an in-memory Buffer, so sharp never opens the source path.
  let pipe = sharp(input, { failOn: "none" }).rotate();
  if (meta.width && meta.width > MAX_WIDTH) pipe = pipe.resize({ width: MAX_WIDTH });
  if (ext === ".png") {
    // Keep PNG (may hold transparency); just recompress losslessly-ish.
    pipe = pipe.png({ compressionLevel: 9, effort: 10 });
  } else {
    pipe = pipe.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
  }
  return pipe.toBuffer();
}

const files = (await walk(ROOT)).filter((f) =>
  RASTER.has(path.extname(f).toLowerCase())
);

let totalBefore = 0;
let totalAfter = 0;
const rows = [];

for (const file of files) {
  const stat = await fs.stat(file);
  if (stat.size < MIN_BYTES) continue;
  const ext = path.extname(file).toLowerCase();
  let buf;
  try {
    const input = await fs.readFile(file);
    const meta = await sharp(input, { failOn: "none" }).metadata();
    buf = await encode(input, ext, meta);
  } catch (err) {
    console.warn(`skip (error): ${path.relative(ROOT, file)} — ${err.message}`);
    continue;
  }
  // Only count/apply if it actually gets smaller.
  if (buf.length >= stat.size) continue;
  totalBefore += stat.size;
  totalAfter += buf.length;
  rows.push({ file: path.relative(ROOT, file), before: stat.size, after: buf.length });
  if (WRITE) {
    // Write to a temp file then rename over the original (atomic, avoids
    // any partial-write or lingering-handle issues on Windows).
    const tmp = file + ".tmp";
    await fs.writeFile(tmp, buf);
    await fs.rename(tmp, file);
  }
}

rows.sort((a, b) => b.before - b.after - (a.before - a.after));
console.log("Top savings:");
for (const r of rows.slice(0, 20)) {
  console.log(
    `  ${mb(r.before).padStart(9)} -> ${mb(r.after).padStart(9)}   ${r.file}`
  );
}
console.log(`\nEligible files (>300 KB, got smaller): ${rows.length}`);
console.log(
  `Total: ${mb(totalBefore)} -> ${mb(totalAfter)}  (saved ${mb(
    totalBefore - totalAfter
  )}, ${totalBefore ? Math.round((1 - totalAfter / totalBefore) * 100) : 0}%)`
);
console.log(
  WRITE
    ? "\n[WRITE MODE] Files overwritten in place. Review with `git diff --stat` and restore any with `git checkout -- <path>`."
    : "\n[DRY RUN] Nothing changed. Re-run with --write to apply."
);
