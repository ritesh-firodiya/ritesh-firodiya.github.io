/**
 * Where a design set comes from.
 *
 * The screens live in the private app repos, under `.context/designs/`. They
 * are NOT committed into this public repo — the whole point of pulling them at
 * build time is that the public repo never stores private work, and that a
 * design set cannot go stale because someone forgot to re-run a script.
 *
 * (It had. Before this existed the committed copy was short 31 aakalan screens,
 * 8 askcal, 4 tic-tac-toe and 1 imposter, and carried one charades screen that
 * had been deleted upstream. The site published a design set nobody had
 * approved, and nothing said so.)
 *
 * Two sources, in this order:
 *
 *   remote  `DESIGNS_TOKEN` is set → shallow, blobless, sparse clone of each
 *           repo at its default branch. This is what CI does. What ships is
 *           what is merged, never what happens to be on a laptop.
 *   local   otherwise → ~/git/products/<dir>/.context/designs, so `pnpm dev`
 *           works offline and a design can be previewed before it is pushed.
 *
 * Force either with DESIGNS_SOURCE=remote|local.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

/** slug → the private repo that owns the set. Keys match products.json. */
export const SETS = {
  imposter: { repo: "ritvi-apps/imposter", local: "imposter" },
  charades: { repo: "ritvi-apps/charades", local: "charades" },
  aakalan: { repo: "ritvi-apps/aakalan", local: "aakalan" },
  askcal: { repo: "ritvi-apps/askcal", local: "askcal" },
  "tic-tac-toe": { repo: "ritvi-apps/tic-tac-toe", local: "tic-tac-toe" },
  "plan-kid": { repo: "ritvi-apps/plan-kid", local: "plan-kid" },
  "dwarseva-property": { repo: "ritvi-apps/property-app", local: "property-app" },
  chitragupt: { repo: "ritvi-apps/chitragupt", local: "chitragupt" },
};

const SUBDIR = ".context/designs";
const CACHE = join(process.cwd(), "node_modules", ".cache", "designs");
const LOCAL_ROOT = join(homedir(), "git", "products");

const git = (args, cwd) =>
  execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

/**
 * Clone just `.context/designs` at the tip of the default branch.
 *
 * --filter=blob:none + --sparse means git fetches the commit graph and only
 * the blobs inside the sparse path, so eight repos cost a few MB rather than
 * their full history. --depth 1 drops history entirely.
 *
 * The clone is cached by commit SHA under node_modules/.cache. A second run on
 * an unchanged repo does one `ls-remote` and stops.
 */
function cloneSparse(slug, repo, token) {
  const dir = join(CACHE, slug);
  const url = `https://x-access-token:${token}@github.com/${repo}.git`;
  const stamp = join(CACHE, `${slug}.sha`);

  let head;
  try {
    head = git(["ls-remote", url, "HEAD"]).split(/\s+/)[0];
  } catch {
    // Never let a token reach a log — execFileSync puts the whole command,
    // URL and all, into the error it throws.
    throw new Error(`${repo}: cannot reach repo — is DESIGNS_TOKEN valid and scoped to it?`);
  }

  if (existsSync(dir) && existsSync(stamp) && readFileSync(stamp, "utf8").trim() === head) {
    return { dir: join(dir, SUBDIR), sha: head, cached: true };
  }

  rmSync(dir, { recursive: true, force: true });
  mkdirSync(CACHE, { recursive: true });
  try {
    git(["clone", "--depth", "1", "--filter=blob:none", "--sparse", "--quiet", url, dir]);
    git(["sparse-checkout", "set", SUBDIR], dir);
  } catch {
    throw new Error(`${repo}: sparse clone failed`);
  }
  writeFileSync(stamp, head + "\n");
  return { dir: join(dir, SUBDIR), sha: head, cached: false };
}

/**
 * Resolve every set to a directory on disk.
 *
 * Throws on the first set it cannot resolve. A design set that silently
 * vanishes is the failure this file was written to end — the site would build
 * green and publish a product page with its screens quietly gone.
 */
export function resolveSources() {
  const token = process.env.DESIGNS_TOKEN;
  const forced = process.env.DESIGNS_SOURCE;
  const mode = forced || (token ? "remote" : "local");

  if (mode === "remote" && !token) {
    throw new Error("DESIGNS_SOURCE=remote needs DESIGNS_TOKEN (a fine-grained PAT, Contents: read)");
  }

  const out = {};
  const missing = [];

  for (const [slug, cfg] of Object.entries(SETS)) {
    if (mode === "remote") {
      const r = cloneSparse(slug, cfg.repo, token);
      if (!existsSync(r.dir)) { missing.push(`${slug} (${cfg.repo} has no ${SUBDIR})`); continue; }
      out[slug] = { ...r, origin: cfg.repo, mode };
    } else {
      const dir = join(LOCAL_ROOT, cfg.local, SUBDIR);
      if (!existsSync(dir)) { missing.push(`${slug} (${dir})`); continue; }
      out[slug] = { dir, sha: null, cached: false, origin: cfg.local, mode };
    }
  }

  if (missing.length) {
    throw new Error(
      `design sets not found (mode=${mode}):\n  ${missing.join("\n  ")}\n` +
        (mode === "local"
          ? "Clone the app repos under ~/git/products, or set DESIGNS_TOKEN to pull them."
          : "Check the token's repository access."),
    );
  }
  return { mode, sets: out };
}
