import { generated } from "@/lib/generated";

/** What a product's `.context/context.yaml` says: the canon version it is pinned to
 *  and the modules it runs. Read at build time by scripts/sync-context.mjs. */
export type CanonConfig = { version: string | null; modules: string[] };

const raw = generated<{ canon: Record<string, CanonConfig> }>("canon.json", { canon: {} });

export const canonFor = (slug: string): CanonConfig | null => raw.canon[slug] ?? null;

export const CANON_REPO = "https://github.com/ritesh-firodiya/canon-cli";
