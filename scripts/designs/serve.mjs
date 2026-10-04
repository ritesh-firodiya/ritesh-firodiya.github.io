#!/usr/bin/env node
/**
 * Serve this site's design set for review.
 *
 * The screens use each product's own pictures and design screens, read straight
 * from ~/git/products, so the server root is ~/git rather than this repo. That
 * tree also holds ~/git/local (credentials), so this serves an allow-list and
 * nothing else, and listens on localhost only.
 *
 *   node scripts/designs/serve.mjs
 *   → http://localhost:8845/personal/ritesh-firodiya.github.io/.context/designs/web/index.html
 */
import { createServer } from "node:http";
import { readFile } from "node:fs";
import { join, extname, posix } from "node:path";
import { homedir } from "node:os";

const ROOT = join(homedir(), "git");
const PORT = Number(process.env.PORT ?? 8845);
const ALLOW = [
  /^\/personal\/ritesh-firodiya\.github\.io\/(\.context|public)\//,
  /^\/products\/[a-z-]+\/\.context\/(designs|listing|wiki)\//,
];
const TYPES = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".md": "text/markdown",
  ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".pdf": "application/pdf",
};

createServer((req, res) => {
  const url = posix.normalize(decodeURIComponent(req.url.split("?")[0]));
  if (!ALLOW.some((re) => re.test(url))) {
    res.writeHead(403);
    return res.end("403");
  }
  readFile(join(ROOT, url), (err, body) => {
    if (err) {
      res.writeHead(404);
      return res.end("404");
    }
    // no-store: a cached stylesheet makes every visual check a lie.
    res.writeHead(200, { "Content-Type": TYPES[extname(url)] ?? "application/octet-stream", "Cache-Control": "no-store" });
    res.end(body);
  });
}).listen(PORT, "127.0.0.1", () => {
  console.log(`http://localhost:${PORT}/personal/ritesh-firodiya.github.io/.context/designs/web/index.html`);
});
