/**
 * Video optimizer for public/video, using the self-contained ffmpeg-static
 * binary (no system ffmpeg needed).
 *
 * Re-encodes each .mp4 to H.264 at CRF 28, scaled to a max width, with
 * +faststart for fast web start-up. Overwrites in place (same path, so no
 * code references change). Originals are recoverable via git.
 *
 *   node scripts/optimize-videos.mjs          # DRY RUN — reports savings only
 *   node scripts/optimize-videos.mjs --write  # actually overwrite files
 */
import ffmpegPath from "ffmpeg-static";
import { execFile } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { promisify } from "util";

const run = promisify(execFile);
const ROOT = path.resolve("public/video");
const MAX_WIDTH = 1280; // hero/background video rarely needs more on the web
const CRF = 28; // 23=high quality/larger, 28=good/smaller
const WRITE = process.argv.includes("--write");

const mb = (b) => (b / 1048576).toFixed(2) + " MB";

const files = (await fs.readdir(ROOT))
  .filter((f) => f.toLowerCase().endsWith(".mp4"))
  .map((f) => path.join(ROOT, f));

let before = 0;
let after = 0;

for (const file of files) {
  const st = await fs.stat(file);
  const tmp = file.replace(/\.mp4$/i, ".min.mp4");
  // Scale down only if wider than MAX_WIDTH; keep aspect ratio, force even dims.
  const vf = `scale='min(${MAX_WIDTH},iw)':-2`;
  try {
    await run(ffmpegPath, [
      "-y", "-i", file,
      "-vf", vf,
      "-c:v", "libx264", "-crf", String(CRF), "-preset", "veryfast",
      "-movflags", "+faststart",
      "-c:a", "aac", "-b:a", "96k",
      tmp,
    ]);
  } catch (err) {
    console.warn(`skip (ffmpeg error): ${path.basename(file)} — ${err.message}`);
    continue;
  }
  const nst = await fs.stat(tmp);
  before += st.size;
  after += nst.size;
  console.log(`  ${mb(st.size).padStart(9)} -> ${mb(nst.size).padStart(9)}   ${path.basename(file)}`);
  if (WRITE && nst.size < st.size) {
    await fs.rename(tmp, file);
  } else {
    await fs.unlink(tmp); // dry-run, or the re-encode wasn't smaller
  }
}

console.log(`\nTotal: ${mb(before)} -> ${mb(after)}  (saved ${mb(before - after)})`);
console.log(
  WRITE
    ? "[WRITE MODE] Files overwritten in place. Restore any with `git checkout -- <path>`."
    : "[DRY RUN] Nothing changed. Re-run with --write to apply."
);
