/** File helpers the sync and build scripts share. */
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

export const exists = async (p) => {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
};

/** Every file under `dir`, depth first. */
export async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}
