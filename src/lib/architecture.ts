import { generated } from "@/lib/generated";

/**
 * A product's parts and paths, read out of its own repo by scripts/sync-context.mjs.
 * scripts/designs/public-architecture.mjs decides what is public: names and paths only.
 */
export interface Architecture {
  areas: { id: string; label: string }[];
  parts: { id: string; area: string; label: string }[];
  flows: { name: string; path: string[] }[];
}

const index = generated<{ architecture: Record<string, Architecture> }>("architecture.json", { architecture: {} }).architecture;

export const architectureSlugs = Object.keys(index);
export const architectureOf = (slug: string): Architecture | null => index[slug] ?? null;
export const architectureHref = (slug: string): string => `/products/${slug}/architecture/`;
