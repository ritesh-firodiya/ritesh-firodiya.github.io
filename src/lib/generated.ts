import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Data the sync scripts read out of the product repos at build time.
 *
 * These files are gitignored — a picture or a wiki page has one home, and it is
 * not this repo — so they are read off disk rather than imported. An import of
 * a file that is not there fails the type-check on a clean clone, before the
 * sync has had a chance to run; a read with a fallback does not.
 *
 * Server-only: every page here is prerendered, so `fs` is always available.
 */
const DIR = join(process.cwd(), "src", "data", "generated");

export function generated<T>(name: string, fallback: T): T {
  const file = join(DIR, name);
  if (!existsSync(file)) return fallback;
  return JSON.parse(readFileSync(file, "utf8")) as T;
}
