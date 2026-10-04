#!/usr/bin/env node
/**
 * Pull everything the site shows about a product, other than its design set,
 * out of that product's own repo: its wiki, its store art, and which stages of
 * work it has anything to show for.
 *
 * NOTHING THIS WRITES IS COMMITTED. A picture or a wiki page has one home, the
 * product's repo; what lands here is a build product. The site once committed
 * web-sized copies of every screenshot, and they went stale the day the store
 * art was re-shot.
 *
 * Run after sync-designs.mjs — a wiki page about a screen links to that screen,
 * and only the design manifest knows which screens were published.
 *
 *   node scripts/sync-context.mjs
 */
import { mkdir, readdir, readFile, writeFile, rm, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, basename, extname } from "node:path";
import sharp from "sharp";
import { marked } from "marked";
import { resolveSources, listTree } from "./designs/sources.mjs";
import { assertNoSecrets } from "./designs/secrets.mjs";

const GEN = join(process.cwd(), "src", "data", "generated");
const MEDIA = join(process.cwd(), "public", "media");

const SHOT_WIDTH = 720; // shown at about 350px; this is 2x
const ICON_SIZE = 256;
const MAX_SHOTS = 8; // every phone shot in the listing; the page picks which to show

/** First match wins. iOS first: its art is drawn for the taller canvas. */
const SHOT_DIRS = [
  ".context/listing/ios/screenshots/en-US",
  ".context/listing/android/metadata/en-US/images/phoneScreenshots",
];
const ICONS = [
  ".context/designs/brand/icon.svg",
  ".context/designs/brand/icon.png",
  ".context/listing/android/metadata/en-US/images/icon.png",
];
/** fastlane's own naming: NN-<screen>.png. Tablet art is named differently. */
const SHOT_NAME = /^\d{2}-[a-z0-9-]+\.png$/;

const WIKI_TYPES = ["concepts", "entities", "surfaces", "flows", "decisions", "synthesis"];

const { sets } = resolveSources();
const designs = JSON.parse(await readFile(join(GEN, "designs.json"), "utf8"));
const today = new Date().toISOString().slice(0, 10);

await rm(MEDIA, { recursive: true, force: true });
await mkdir(join(GEN, "wiki"), { recursive: true });

/* ── pictures ───────────────────────────────────────────────────────────── */

async function syncMedia(slug, root) {
  const out = join(MEDIA, slug);
  const entry = { icon: null, shots: [] };

  const iconSrc = ICONS.map((p) => join(root, p)).find(existsSync);
  if (iconSrc) {
    await mkdir(out, { recursive: true });
    if (extname(iconSrc) === ".svg") {
      await copyFile(iconSrc, join(out, "icon.svg"));
      entry.icon = `/media/${slug}/icon.svg`;
    } else {
      await sharp(iconSrc).resize(ICON_SIZE, ICON_SIZE).webp({ quality: 86 }).toFile(join(out, "icon.webp"));
      entry.icon = `/media/${slug}/icon.webp`;
    }
  }

  const dir = SHOT_DIRS.map((p) => join(root, p)).find(existsSync);
  if (dir) {
    const files = (await readdir(dir)).filter((f) => SHOT_NAME.test(f)).sort().slice(0, MAX_SHOTS);
    for (const f of files) {
      await mkdir(out, { recursive: true });
      const name = basename(f, ".png");
      const info = await sharp(join(dir, f)).resize({ width: SHOT_WIDTH }).webp({ quality: 80 }).toFile(join(out, `${name}.webp`));
      entry.shots.push({
        src: `/media/${slug}/${name}.webp`,
        label: name.replace(/^\d{2}-/, "").replaceAll("-", " "),
        width: info.width,
        height: info.height,
      });
    }
  }
  return entry.icon || entry.shots.length ? entry : null;
}

/* ── wiki ───────────────────────────────────────────────────────────────── */

function frontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: {}, body: src };
  const meta = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([a-z-]+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  return { meta, body: src.slice(m[0].length) };
}

const plain = (md) =>
  md.replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, "$1").replace(/[*_`>#]/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\s+/g, " ").trim();

/** The first paragraph under the first heading — what the page says it is. */
function summaryOf(body) {
  /* No `m` flag: with it `$` matches at every line end and the paragraph is
     cut after its first line. */
  const m = body.match(/(?:^|\n)##\s+[^\n]+\n+([\s\S]*?)(?:\n\s*\n|\n##\s|$)/);
  const text = plain(m ? m[1] : body.slice(0, 300));
  return text.length > 180 ? `${text.slice(0, 177)}…` : text;
}

/* ── Markdown → HTML ────────────────────────────────────────────────────────
   Three things are decided here, in the tokenizer and the renderer rather than
   by regex over the output — a regex cannot tell a link from a link quoted in a
   code span, and it missed any anchor carrying a title.

   `page` is the page being rendered. marked's hooks are module-level, so the
   context is too; syncWiki sets it before each parse. */
let page = null;

const escapeHtml = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
/** A link this site can honour: another site, an email, an anchor, or a path
 *  on this host. `//host` is another site wearing a path's clothes. */
const isSafeHref = (href) => /^(https?:|mailto:|#)/i.test(href) || (href.startsWith("/") && !href.startsWith("//"));

marked.use({
  extensions: [
    {
      /* [[page]] and [[page|label]]. An inline token, so one inside a code
         span or a fenced block is left exactly as written. */
      name: "wikilink",
      level: "inline",
      start: (src) => src.indexOf("[["),
      tokenizer(src) {
        const m = /^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/.exec(src);
        if (m) return { type: "wikilink", raw: m[0], target: m[1].trim(), label: m[2]?.trim() };
      },
      renderer({ target, label }) {
        const text = escapeHtml(label ?? target);
        /* A link to a page that exists; plain words where it does not — a
           link to nothing is worse than no link. */
        if (!page.where.has(target) || target === page.slug) return text;
        page.links.add(target);
        return `<a href="/products/${page.product}/wiki/${page.where.get(target)}/${target}/">${text}</a>`;
      },
    },
  ],
  renderer: {
    link({ href, tokens }) {
      const text = this.parser.parseInline(tokens);
      /* A relative link pointed at a file in the product repo. There is no
         such file on this site, so the words stay and the link goes. */
      if (!isSafeHref(href)) return text;
      const outside = /^https?:/i.test(href);
      return `<a href="${escapeHtml(href)}"${outside ? ' rel="noopener"' : ""}>${text}</a>`;
    },
    image({ href, text }) {
      /* Same rule: an image in the product repo is not on this site. */
      return /^https?:/i.test(href) ? false : escapeHtml(text ?? "");
    },
  },
});

async function syncWiki(slug, root) {
  const base = join(root, ".context", "wiki");
  if (!existsSync(base)) return null;

  const raw = [];
  for (const type of WIKI_TYPES) {
    const dir = join(base, type);
    if (!existsSync(dir)) continue;
    for (const f of (await readdir(dir)).filter((x) => x.endsWith(".md")).sort()) {
      const src = await readFile(join(dir, f), "utf8");
      assertNoSecrets(src, `${slug} wiki ${type}/${f}`);
      raw.push({ type, slug: basename(f, ".md"), ...frontmatter(src) });
    }
  }
  if (raw.length === 0) return null;

  /* What each page owns, in the wiki's own words: its index is a set of
     `| [[page]] | what it owns |` rows. */
  const owns = {};
  if (existsSync(join(base, "index.md"))) {
    const index = await readFile(join(base, "index.md"), "utf8");
    assertNoSecrets(index, `${slug} wiki index.md`);
    for (const row of index.matchAll(/^\|\s*\[\[([^\]|]+)\]\]\s*\|\s*([^|]+?)\s*\|/gm)) owns[row[1]] = plain(row[2]);
  }

  /* [[page]] names a page by slug alone, so a slug used by two page types
     would make every link to it a guess. Stop instead. */
  const where = new Map();
  for (const p of raw) {
    if (where.has(p.slug)) {
      throw new Error(`${slug} wiki: "${p.slug}" is both a ${where.get(p.slug)} page and a ${p.type} page — [[${p.slug}]] is ambiguous`);
    }
    where.set(p.slug, p.type);
  }
  const published = new Set((designs.sets[slug]?.screens ?? []).map((s) => s.path));
  const linksOf = new Map();

  const pages = raw.map((p) => {
    const links = new Set();
    page = { product: slug, slug: p.slug, where, links };
    const html = marked.parse(p.body, { async: false });

    const frame = p.body.match(/\.context\/designs\/((?:mobile|web)\/[\w\-/]+\.html)/);
    const wireframe = frame && published.has(`/designs/${slug}/${frame[1]}`) ? `/designs/${slug}/${frame[1]}` : null;

    linksOf.set(p.slug, links);
    return {
      type: p.type,
      slug: p.slug,
      id: p.meta.id ?? null,
      status: p.meta.status ?? null,
      lastVerified: p.meta["last-verified"] ?? null,
      owns: owns[p.slug] ?? summaryOf(p.body),
      summary: summaryOf(p.body),
      html,
      links: [...links],
      backlinks: [],
      wireframe,
    };
  });

  for (const page of pages) {
    for (const t of linksOf.get(page.slug)) pages.find((x) => x.slug === t)?.backlinks.push(page.slug);
  }

  const verified = pages.map((p) => p.lastVerified).filter(Boolean).sort().at(-1) ?? null;
  await writeFile(join(GEN, "wiki", `${slug}.json`), JSON.stringify({ slug, verified, pages }));

  const byType = {};
  for (const p of pages) byType[p.type] = (byType[p.type] ?? 0) + 1;
  return { total: pages.length, verified, byType };
}

/* ── what stages a product has anything to show for ─────────────────────── */

function contextOf(paths) {
  const count = (prefix) => paths.filter((p) => p.startsWith(prefix) && !p.endsWith(".gitkeep")).length;
  return {
    raw: count(".context/raw/"),
    synthesis: count(".context/wiki/synthesis/"),
    features: count(".context/features/"),
    decisions: count(".context/wiki/decisions/"),
    entities: count(".context/wiki/entities/"),
    marketing: count(".context/marketing/"),
    metrics: count(".context/metrics/"),
    support: count(".context/support/"),
    /* An app, not only a plan for one. */
    hasCode: paths.some((p) => /^(apps|src|app)\//.test(p) || p === "app.json"),
  };
}

/* ── run ────────────────────────────────────────────────────────────────── */

const media = {};
const wiki = {};
const context = {};

for (const [slug, source] of Object.entries(sets)) {
  const m = await syncMedia(slug, source.root);
  if (m) media[slug] = m;
  const w = await syncWiki(slug, source.root);
  if (w) wiki[slug] = w;
  context[slug] = contextOf(listTree(source));
}

const header = { $comment: "GENERATED by scripts/sync-context.mjs from the private app repos. Do not hand-edit.", generatedOn: today };
await writeFile(join(GEN, "media.json"), JSON.stringify({ ...header, media }, null, 2) + "\n");
await writeFile(join(GEN, "wiki.json"), JSON.stringify({ ...header, wiki }, null, 2) + "\n");
await writeFile(join(GEN, "context.json"), JSON.stringify({ ...header, context }, null, 2) + "\n");

const shots = Object.values(media).reduce((n, m) => n + m.shots.length, 0);
const pages = Object.values(wiki).reduce((n, w) => n + w.total, 0);
console.log(`pictures: ${shots} store screenshot(s), ${Object.values(media).filter((m) => m.icon).length} icon(s)`);
console.log(`wiki: ${pages} page(s) across ${Object.keys(wiki).length} product(s)`);
for (const [slug, w] of Object.entries(wiki)) console.log(`  ${slug.padEnd(20)} ${String(w.total).padStart(4)}`);
