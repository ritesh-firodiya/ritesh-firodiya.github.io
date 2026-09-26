#!/usr/bin/env node
/**
 * Pull store assets out of the (private) app repos and write web-sized
 * derivatives into public/media/.
 *
 * WHY DERIVATIVES AND NOT THE ORIGINALS
 * Store screenshots are 1080×2400 and up because the stores demand it. The site
 * displays them at ~210px wide. Committing originals would add tens of MB to a
 * repo whose whole history is under 2MB, and git never forgets a blob. WebP at
 * 640px lands around 1% of the source bytes and is indistinguishable here.
 *
 * WHY IT RUNS LOCALLY
 * The app repos are private siblings under ~/git. A GitHub Action on this
 * public repo cannot read them, so this runs on a machine with the whole tree
 * and the derivatives are committed. Same shape as ~/git/bin/index.
 *
 * WHY CANDIDATE PATHS AND NOT ONE CONVENTION
 * The apps do not agree on where store assets live, and pretending they do is
 * how the first version of this script reported "no assets" for an app that had
 * both an icon and five screenshots. Each app lists the paths it actually uses,
 * first match wins, and anything still unfound is reported rather than silently
 * skipped.
 *
 * It never copies video — the .mp4 files in the tree are tens of MB.
 *
 *   node scripts/sync-assets.mjs
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readdir, writeFile, rm, stat } from "node:fs/promises";
import { join, basename, extname } from "node:path";
import { homedir } from "node:os";

const run = promisify(execFile);
const APPS = join(homedir(), "git", "products");
const OUT = join(process.cwd(), "public", "media");
const DATA = join(process.cwd(), "src", "data", "media.json");

const SHOT_WIDTH = 640;
const WEB_SHOT_WIDTH = 1280; // web products are landscape; they need the pixels
const ICON_SIZE = 256;
const QUALITY = 78;
const MAX_SHOTS = 4;

const S = ".context/documents/store";

/**
 * `kind` decides the frame the site draws around a shot: a phone bezel for
 * mobile, a browser chrome for web. Drawing chitragupt.ai inside a phone would
 * be a small lie about what the product is.
 */
const SOURCES = {
  charades:      { kind: "mobile", icons: [`${S}/icon-512.png`, "assets/icons/icon.png"],
                   shots: [`${S}/screenshots`, `${S}/android/phone`, `${S}/ios/iphone-6.9`] },
  imposter:      { kind: "mobile", icons: [`${S}/icon-512.png`, "assets/icons/icon.png"],
                   shots: [`${S}/screenshots`, `${S}/android/phone`, `${S}/ios/iphone-6.9`] },
  aakalan:       { kind: "mobile", icons: [`${S}/icon-512.png`, "assets/icons/icon.png"],
                   shots: [`${S}/screenshots`, `${S}/android/phone`, `${S}/ios/iphone-6.9`] },
  askcal:        { kind: "mobile", icons: [`${S}/icon-512.png`, "apps/mobile/assets/icons/icon.png"],
                   shots: [`${S}/screenshots`, `${S}/android/phone`, `${S}/ios/iphone-6.9`] },
  // Its store folder uses android/phone and ios/iphone-6.9 rather than
  // screenshots/, and its icon lives with the Expo assets, not in the store
  // folder. Both were missed by the first pass.
  "tic-tac-toe": { kind: "mobile", dir: "tic-tac-toe",
                   icons: [`${S}/icon-512.png`, "assets/icons/icon.png",
                           "ios/TicTacToe/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png"],
                   shots: [`${S}/android/phone`, `${S}/ios/iphone-6.9`, `${S}/screenshots`] },
  // A web product with no store folder. Its icon is in the mobile app's Expo
  // assets. Its shots are captured by hand from the PUBLIC marketing pages on
  // chitragupt.ai into scripts/captured/, which this then processes.
  //
  // Those pages embed the product's own four surfaces — inbox, tax review,
  // expense review, portfolio review — rendered against a demo persona
  // ("Aarav"), so they show the real UI without publishing anyone's account.
  // Until 2026-09-26 the only artifact here was the site's OpenGraph card,
  // which made the lead product the one product with no picture of itself.
  //
  // Two things to preserve when re-capturing: crop to the product surface and
  // leave the marketing caption out, and keep the "Hire a CA from ..." panel
  // out of frame — it carries a price, and rule 2b keeps prices off this site.
  // (An earlier comment here referenced scripts/capture-web.mjs. No such file
  // has ever existed in this repo.)
  chitragupt:    { kind: "web",
                   icons: ["apps/mobile/assets/icons/icon.png", "apps/website/src/app/icon.png"],
                   shots: [`${S}/screenshots`], localShots: "chitragupt" },
};

const exists = async (p) => { try { await stat(p); return true; } catch { return false; } };

async function firstFile(root, candidates) {
  for (const c of candidates) {
    const p = join(root, c);
    if (await exists(p)) return p;
  }
  return null;
}
async function firstDirWithImages(root, candidates) {
  for (const c of candidates) {
    const p = join(root, c);
    if (!(await exists(p))) continue;
    const files = (await readdir(p)).filter((f) => [".png", ".jpg", ".jpeg"].includes(extname(f).toLowerCase()));
    if (files.length) return { dir: p, files: files.sort() };
  }
  return null;
}

async function toWebp(src, dest, width) {
  const tmp = dest.replace(/\.webp$/, ".tmp.png");
  await run("sips", ["--resampleWidth", String(width), src, "--out", tmp]);
  await run("cwebp", ["-quiet", "-q", String(QUALITY), tmp, "-o", dest]);
  await rm(tmp, { force: true });
  return (await stat(dest)).size;
}

const manifest = {};
const missing = [];
let bytes = 0, files = 0;
await rm(OUT, { recursive: true, force: true });

for (const [slug, cfg] of Object.entries(SOURCES)) {
  const root = join(APPS, cfg.dir ?? slug);
  if (!(await exists(root))) { missing.push({ slug, why: "app repo not found" }); continue; }

  const destDir = join(OUT, slug);
  const entry = { kind: cfg.kind, icon: null, shots: [] };

  const icon = await firstFile(root, cfg.icons);
  if (icon) {
    await mkdir(destDir, { recursive: true });
    bytes += await toWebp(icon, join(destDir, "icon.webp"), ICON_SIZE); files++;
    entry.icon = `/media/${slug}/icon.webp`;
  }

  let found = await firstDirWithImages(root, cfg.shots);
  if (!found && cfg.localShots) {
    found = await firstDirWithImages(process.cwd(), [join("scripts", "captured", cfg.localShots)]);
  }
  if (found) {
    await mkdir(destDir, { recursive: true });
    for (const f of found.files.slice(0, MAX_SHOTS)) {
      const name = basename(f, extname(f)).replace(/^\d+[-_]?/, "") || basename(f, extname(f));
      const d = join(destDir, `${name}.webp`);
      bytes += await toWebp(join(found.dir, f), d, cfg.kind === "web" ? WEB_SHOT_WIDTH : SHOT_WIDTH); files++;
      entry.shots.push({ src: `/media/${slug}/${name}.webp`, label: name.replace(/[-_]/g, " ") });
    }
  }

  if (!entry.icon && entry.shots.length === 0) {
    missing.push({ slug, why: "no icon or screenshots found in any candidate path" });
    continue;
  }
  if (entry.shots.length === 0) missing.push({ slug, why: "icon only — no screenshots found" });
  manifest[slug] = entry;
}

await writeFile(DATA, JSON.stringify({
  $comment: "GENERATED by scripts/sync-assets.mjs from the private app repos. Do not hand-edit. `kind` decides whether the site frames a shot as a phone or a browser.",
  generatedOn: new Date().toISOString().slice(0, 10),
  media: manifest,
  missing,
}, null, 2) + "\n");

console.log(`synced ${files} file(s), ${(bytes / 1024).toFixed(0)}KB`);
for (const [slug, e] of Object.entries(manifest))
  console.log(`  ${slug.padEnd(14)} ${e.kind.padEnd(7)} icon:${e.icon ? "yes" : " no"}  shots:${e.shots.length}`);
for (const m of missing) console.log(`  ${m.slug.padEnd(14)} — ${m.why}`);
