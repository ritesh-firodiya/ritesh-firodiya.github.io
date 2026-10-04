import { generated } from "@/lib/generated";

/**
 * A product's wiki, read out of its own repo by scripts/sync-context.mjs.
 *
 * The whole wiki is published — every page type, decided 2026-10-04. The sync
 * scans each page for credential shapes and stops the build on a hit.
 */
export type WikiType = "concepts" | "entities" | "surfaces" | "flows" | "decisions" | "synthesis";

export const WIKI_TYPES: { type: WikiType; label: string; one: string }[] = [
  { type: "concepts", label: "Concepts", one: "Concept" },
  { type: "entities", label: "Entities", one: "Entity" },
  { type: "surfaces", label: "Surfaces", one: "Surface" },
  { type: "flows", label: "Flows", one: "Flow" },
  { type: "decisions", label: "Decisions", one: "Decision" },
  { type: "synthesis", label: "Synthesis", one: "Synthesis" },
];

export type WikiPage = {
  type: WikiType;
  slug: string;
  id: string | null;
  status: string | null;
  lastVerified: string | null;
  /** One line: what this page owns, in the wiki's own words. */
  owns: string;
  summary: string;
  html: string;
  links: string[];
  backlinks: string[];
  /** For a page about a screen: that screen, where its design set is published. */
  wireframe: string | null;
};

type Summary = { total: number; verified: string | null; byType: Partial<Record<WikiType, number>> };
const index = generated<{ wiki: Record<string, Summary> }>("wiki.json", { wiki: {} }).wiki;

export const wikiSlugs = Object.keys(index);
export const wikiOf = (slug: string): Summary | null => index[slug] ?? null;
export const totalWikiPages = Object.values(index).reduce((n, w) => n + w.total, 0);

/** One file per product, read only by that product's pages: Chitragupt's wiki
 *  alone is 327 pages, and no other page should pay to parse it. */
const cache = new Map<string, WikiPage[]>();
export function wikiPages(slug: string): WikiPage[] {
  if (!cache.has(slug)) {
    cache.set(slug, generated<{ pages: WikiPage[] }>(`wiki/${slug}.json`, { pages: [] }).pages);
  }
  return cache.get(slug)!;
}

export const wikiPage = (slug: string, type: string, page: string): WikiPage | undefined =>
  wikiPages(slug).find((p) => p.type === type && p.slug === page);

export const wikiHref = (slug: string, page?: Pick<WikiPage, "type" | "slug">): string =>
  page ? `/products/${slug}/wiki/${page.type}/${page.slug}/` : `/products/${slug}/wiki/`;
