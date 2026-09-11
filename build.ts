#!/usr/bin/env -S deno run -A
//
// Static export for GitHub Pages.
//
// Both routes are pure functions of profile.json (no request-time data, no
// islands), so the whole site can be prerendered ahead of time. This boots the
// Fresh handler in-process, fetches each route plus any /_frsh/ asset it
// references, and writes the result to _site/.

import { ServerContext } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";

import { copy, ensureDir } from "$std/fs/mod.ts";
import { dirname, join } from "$std/path/mod.ts";

const OUT = "_site";
const ORIGIN = "http://localhost";

/** Route path -> file written under _site/. `/resume` becomes resume/index.html. */
const ROUTES = ["/", "/resume"];

const ctx = await ServerContext.fromManifest(manifest, {
  plugins: [twindPlugin(twindConfig)],
});
const handler = ctx.handler();

// The Fresh handler wants std's ConnInfo. Nothing in this app reads it, so a
// loopback stub is enough.
const addr: Deno.NetAddr = {
  transport: "tcp",
  hostname: "127.0.0.1",
  port: 80,
};
const connInfo = { remoteAddr: addr, localAddr: addr };

async function fetchPath(path: string): Promise<Response> {
  const res = await handler(new Request(ORIGIN + path), connInfo);
  if (!res.ok) {
    throw new Error(`${path} -> ${res.status} ${res.statusText}`);
  }
  return res;
}

async function write(relPath: string, body: Uint8Array) {
  const target = join(OUT, relPath);
  await ensureDir(dirname(target));
  await Deno.writeFile(target, body);
  console.log(`  ${relPath} (${body.byteLength} bytes)`);
}

// Wipe any previous export so removed pages don't linger.
await Deno.remove(OUT, { recursive: true }).catch(() => {});
await ensureDir(OUT);

console.log("rendering routes:");
const assets = new Set<string>();

for (const route of ROUTES) {
  const html = await (await fetchPath(route)).text();
  const relPath = route === "/" ? "index.html" : `${route.slice(1)}/index.html`;
  await write(relPath, new TextEncoder().encode(html));

  for (const m of html.matchAll(/["'(](\/_frsh\/[^"')\s]+)/g)) {
    assets.add(m[1]);
  }
}

// Fresh's client runtime, if any island/refresh script was emitted. Chunks are
// pulled in transitively via their import specifiers.
if (assets.size) {
  console.log("copying framework assets:");
  const done = new Set<string>();
  while (assets.size) {
    const [path] = assets;
    assets.delete(path);
    if (done.has(path)) continue;
    done.add(path);

    const res = await fetchPath(path);
    const bytes = new Uint8Array(await res.arrayBuffer());
    await write(path.replace(/^\//, ""), bytes);

    if (path.endsWith(".js")) {
      const src = new TextDecoder().decode(bytes);
      for (const m of src.matchAll(/from\s*["'](\/_frsh\/[^"']+)["']/g)) {
        assets.add(m[1]);
      }
    }
  }
} else {
  console.log("no framework assets referenced (zero islands)");
}

console.log("copying static/:");
for await (const entry of Deno.readDir("static")) {
  if (entry.name.startsWith(".")) continue;
  await copy(join("static", entry.name), join(OUT, entry.name));
  console.log(`  ${entry.name}`);
}

// Stop GitHub Pages' Jekyll pass from eating _frsh/ and other _-prefixed dirs.
await Deno.writeTextFile(join(OUT, ".nojekyll"), "");
console.log("\nwrote ./_site");
