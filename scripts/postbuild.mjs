import { readdir, readFile, writeFile, rename, stat } from "node:fs/promises";
import { join, extname } from "node:path";

const OUT = "out";

/**
 * Next's file-based metadata images (opengraph-image, apple-icon) export as
 * EXTENSIONLESS files under output:"export" — `out/opengraph-image`, not
 * `out/opengraph-image.png`.
 *
 * GitHub Pages sets Content-Type from the extension, so those would be served
 * as application/octet-stream. Every social crawler (Slack, X, LinkedIn,
 * WhatsApp) requires an image/* type and silently shows nothing otherwise —
 * the exact failure you never notice because it only happens in someone else's
 * client.
 *
 * So: give them extensions, and rewrite the references Next wrote into the HTML
 * to match. Keeping the .tsx generators as the only source means the images
 * cannot drift from the palette.
 */
const RENAMES = [
  { from: "opengraph-image", to: "og.png" },
  { from: "apple-icon", to: "apple-touch-icon.png" },
];

async function exists(p) {
  try { await stat(p); return true; } catch { return false; }
}

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

let renamed = 0;
for (const r of RENAMES) {
  const src = join(OUT, r.from);
  if (await exists(src)) {
    await rename(src, join(OUT, r.to));
    renamed++;
  }
}

// Next appends a cache-busting query: /opengraph-image?a1b2c3. Match the name
// plus optional query, and only at a path boundary, so nothing else is touched.
const PATTERNS = RENAMES.map((r) => ({
  re: new RegExp(`/${r.from}(\\?[A-Za-z0-9]+)?`, "g"),
  to: `/${r.to}`,
}));

let patched = 0;
for await (const file of walk(OUT)) {
  if (![".html", ".txt", ".json", ".webmanifest"].includes(extname(file))) continue;
  const before = await readFile(file, "utf8");
  let after = before;
  for (const p of PATTERNS) after = after.replace(p.re, p.to);
  if (after !== before) { await writeFile(file, after); patched++; }
}

console.log(`postbuild: renamed ${renamed} metadata image(s), patched ${patched} file(s)`);

// Fail loudly rather than ship a broken social card.
for (const r of RENAMES) {
  if (!(await exists(join(OUT, r.to)))) {
    console.error(`postbuild: expected ${OUT}/${r.to} to exist`);
    process.exit(1);
  }
}
