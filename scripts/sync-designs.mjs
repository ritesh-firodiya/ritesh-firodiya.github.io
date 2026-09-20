#!/usr/bin/env node
/**
 * Copy the real design screens out of the (private) app repos into
 * public/designs/, so the site shows the actual wireframes instead of essays
 * about them.
 *
 * Each design set is plain HTML that loads Tailwind from a CDN, lucide from
 * unpkg, and its own shared.css / tailwind.config.js by relative path. So:
 *
 *  - the folder shape is preserved, which keeps every relative link working
 *  - the two CDN scripts are vendored once into public/designs/_vendor/ and the
 *    tags rewritten. A public site should not depend on two third-party hosts
 *    being up, and unpkg would otherwise see every visitor's IP
 *  - the development chrome — the breadcrumb strip every screen carries while
 *    it is being worked on — is removed by walking tag depth rather than by
 *    regex, because it contains nested divs and a lazy `</div>` match would
 *    truncate the page
 *  - index.html and _review.html are skipped: those are the dev galleries, and
 *    a gallery of galleries is the meta-commentary being removed
 *
 *   node scripts/sync-designs.mjs
 */
import { mkdir, readdir, readFile, writeFile, rm, stat, copyFile } from "node:fs/promises";
import { join, dirname, relative, extname, basename, sep } from "node:path";
import { homedir } from "node:os";

const APPS = join(homedir(), "git", "apps");
const OUT = join(process.cwd(), "public", "designs");
const VENDOR = join(OUT, "_vendor");
const DATA = join(process.cwd(), "src", "data", "designs.json");

/** slug → repo dir. Keys match products.json so a product page finds its set. */
const SETS = {
  imposter: "imposter",
  charades: "charades",
  aakalan: "aakalan",
  askcal: "askcal",
  "tic-tac-toe": "tic-tac-toe",
  "plan-kid": "plan-kid",
  "dwarseva-property": "property-app",
};

const SKIP_FILES = new Set(["index.html", "_review.html"]);
const COPY_EXT = new Set([".html", ".css", ".js", ".svg", ".png", ".webp", ".jpg"]);

const exists = async (p) => {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
};

/** Remove an element by walking tag depth. Regex cannot do this: the chrome
 *  contains nested divs and a non-greedy `</div>` stops at the first one. */
function stripElement(html, openRe) {
  const m = openRe.exec(html);
  if (!m) return html;
  let depth = 1;
  const tag = /<\/?div\b/gi;
  tag.lastIndex = m.index + m[0].length;
  let t;
  while ((t = tag.exec(html))) {
    depth += t[0][1] === "/" ? -1 : 1;
    if (depth === 0) {
      const end = html.indexOf(">", t.index) + 1;
      return html.slice(0, m.index) + html.slice(end);
    }
  }
  return html;
}

const CHROME = [
  /<div class="breadcrumb"[^>]*>/i,
  /<div class="border-b border-dashed[^"]*"[^>]*>/i,
];

async function vendor() {
  await mkdir(VENDOR, { recursive: true });
  const grab = async (url, name) => {
    const dest = join(VENDOR, name);
    if (await exists(dest)) return (await stat(dest)).size;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${name}: ${r.status}`);
    const body = Buffer.from(await r.arrayBuffer());
    await writeFile(dest, body);
    return body.length;
  };
  // lucide is pinned rather than @latest: a design set that renders differently
  // next month because an icon library moved is not a design set.
  return {
    tailwind: await grab("https://cdn.tailwindcss.com", "tailwind.js"),
    lucide: await grab("https://unpkg.com/lucide@0.460.0/dist/umd/lucide.js", "lucide.js"),
  };
}

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

await rm(OUT, { recursive: true, force: true }).catch(() => {});
await mkdir(OUT, { recursive: true });
const v = await vendor();

const manifest = {};
let screens = 0;
let bytes = 0;

for (const [slug, dir] of Object.entries(SETS)) {
  const src = join(APPS, dir, ".context", "designs");
  if (!(await exists(src))) continue;
  const entries = [];

  for await (const file of walk(src)) {
    const rel = relative(src, file);
    const ext = extname(file).toLowerCase();
    if (!COPY_EXT.has(ext)) continue;
    if (ext === ".html" && SKIP_FILES.has(basename(file))) continue;

    const dest = join(OUT, slug, rel);
    await mkdir(dirname(dest), { recursive: true });

    if (ext !== ".html") {
      await copyFile(file, dest);
      continue;
    }

    let h = await readFile(file, "utf8");
    for (const re of CHROME) h = stripElement(h, re);

    const up = relative(dirname(dest), VENDOR).split(sep).join("/") || ".";
    h = h.replace(
      /<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/g,
      `<script src="${up}/tailwind.js"></script>`,
    );
    h = h.replace(
      /<script src="https:\/\/unpkg\.com\/lucide@[^"]*"><\/script>/g,
      `<script src="${up}/lucide.js"></script>`,
    );

    await writeFile(dest, h);
    bytes += Buffer.byteLength(h);
    screens++;

    const title = (h.match(/<title>([^<]*)<\/title>/) || [, basename(file, ".html")])[1]
      .replace(/\s*[—·|]\s*(wireframes?|mobile|web).*$/i, "")
      .trim();
    const parts = rel.split(sep);
    entries.push({
      path: `/designs/${slug}/${parts.join("/")}`,
      title,
      surface: parts[0],
      area: parts.length > 2 ? parts[parts.length - 2] : null,
    });
  }
  if (entries.length) manifest[slug] = entries.sort((a, b) => a.path.localeCompare(b.path));
}

await writeFile(
  DATA,
  JSON.stringify(
    {
      $comment:
        "GENERATED by scripts/sync-designs.mjs from the private app repos. Do not hand-edit.",
      generatedOn: new Date().toISOString().slice(0, 10),
      vendored: v,
      sets: manifest,
    },
    null,
    2,
  ) + "\n",
);

console.log(`synced ${screens} screens, ${(bytes / 1024 / 1024).toFixed(2)}MB html`);
console.log(
  `vendored tailwind ${(v.tailwind / 1024).toFixed(0)}KB · lucide ${(v.lucide / 1024).toFixed(0)}KB`,
);
for (const [s, e] of Object.entries(manifest)) {
  console.log(`  ${s.padEnd(20)} ${String(e.length).padStart(3)} screens`);
}
