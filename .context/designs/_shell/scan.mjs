#!/usr/bin/env node
/* The set described from its HTML, for canon check: the same crawl the shell
 * does in the browser (describe.js), over the files on disk.
 *
 *     node _shell/scan.mjs mobile          the problems, one per line; exit 1 on any
 *     node _shell/scan.mjs mobile --json   the described set, as JSON
 *
 * The size is a folder beside babul.js; with none, the first of babul.js sizes.
 *
 * A page or board the crawl cannot reach from babul.js's start is a problem:
 * the browser would never show it.                                          */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
vm.runInThisContext(readFileSync(join(ROOT, "_shell/describe.js"), "utf8"));
const { parse, Collector, startOf } = globalThis.BABUL_DESCRIBE;
const data = (name, key = name) => JSON.parse(readFileSync(join(ROOT, `${name}.js`), "utf8").replace(`(window.BABUL ||= {}).${key} = `, "").replace(/;\s*$/, ""));
const product = data("babul", "product"), tokens = data("tokens");
const SIZE = process.argv.slice(2).find((a) => !a.startsWith("--")) ?? product.sizes[0];
const DIR = join(ROOT, SIZE);
const read = (path) => readFileSync(join(DIR, path), "utf8");
const lucide = /lucide@([\d.]+)/.exec(readFileSync(join(ROOT, "_shell/boot.js"), "utf8"))?.[1];

const c = Collector(product, tokens, lucide, SIZE);
const seen = new Set();
const queue = [["page", startOf(product, SIZE)]];
while (queue.length) {
  const [kind, id] = queue.shift();
  if (seen.has(kind + id)) continue;
  seen.add(kind + id);
  const file = kind === "page" ? `${id}.html` : `components/${id}.${kind === "board" ? "html" : "js"}`;
  if (!existsSync(join(DIR, file))) { c.errors.push(`${file} is linked or used, and does not exist`); continue; }
  const found = kind === "page" ? c.addPage(id, parse(read(file))) : kind === "board" ? c.addBoard(id, parse(read(file))) : c.addDef(id, read(file));
  for (const p of found.pages) queue.push(["page", p]);
  for (const x of found.components) queue.push(["def", x], ["board", x]);
}
for (const d of readdirSync(DIR, { withFileTypes: true })) {
  if (!d.isDirectory() || d.name === "styles") continue;
  for (const f of readdirSync(join(DIR, d.name))) {
    const [kind, id] = d.name === "components" ? [f.endsWith(".js") ? "def" : "board", f.replace(/\.\w+$/, "")] : ["page", `${d.name}/${f.replace(/\.html$/, "")}`];
    if ((f.endsWith(".html") || f.endsWith(".js")) && !seen.has(kind + id)) c.errors.push(`${d.name}/${f} is reached from no page — link it, or use the component on one`);
  }
}
const named = [product.logo, ...(product.art ?? [])];
for (const f of readdirSync(join(ROOT, "assets"))) if (!named.includes(`assets/${f}`)) c.errors.push(`assets/${f} is not named in babul.js (logo or art)`);
for (const f of named) if (f && !existsSync(join(ROOT, f))) c.errors.push(`babul.js names ${f}, which does not exist`);
const model = c.finish();
if (process.argv.includes("--json")) {
  console.log(JSON.stringify(model, null, 2));
} else {
  for (const e of model.errors) console.log(e);
  process.exit(model.errors.length ? 1 : 0);
}
