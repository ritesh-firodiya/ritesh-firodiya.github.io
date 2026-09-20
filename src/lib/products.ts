import raw from "@/data/products.json";
import mediaRaw from "@/data/media.json";

/**
 * The five monetization models, and they render at equal visual weight.
 *
 * `per-period` is the one that needs explaining: Chitragupt sells a separate
 * purchase for each assessment year, so the charge repeats annually but nothing
 * auto-renews. Calling that "one-time" would be misleading and calling it a
 * "subscription" would be wrong, so it gets its own name.
 */
export type Model =
  | "free"
  | "free-ads"
  | "one-time"
  | "subscription"
  | "per-period"
  | "undecided";

/** Where a build actually is. `closed` and `none` both mean "you cannot install
 *  this", and both must render disabled WITH the reason rather than hidden. */
export type PlatformState = "live" | "beta" | "closed" | "none";

export type Platform = {
  state: PlatformState;
  label: string;
  url: string | null;
  note: string;
};

export type Product = {
  slug: string;
  name: string;
  fullName: string;
  tagline: string;
  blurb: string;
  sourceOfTruth: string;
  model: Model;
  price: string | null;
  priceNote: string | null;
  modelDetail: string;
  tiers?: { label: string; amount: string; unit: string; note: string }[];
  ads: string | null;
  adSurfaces: { kind: string; where: string; absent?: boolean }[];
  offline: string | null;
  analytics: string | null;
  analyticsNote?: string;
  version: string | null;
  notBuilt?: boolean;
  unreleasedNote?: string;
  platforms: Partial<Record<"web" | "ios" | "android", Platform>>;
  stack: string[];
  features: { icon: string; title: string; body: string }[];
  permissions: { name: string; why: string; absent?: boolean }[];
  screens: string[];
  kind: "app" | "platform";
  /** Public source, where one exists. Null while a product is commercial. */
  repo: string | null;
  legal: { privacy: string | null; delete: string | null; privacyNote?: string };
};

/** Web-sized derivatives written by scripts/sync-assets.mjs. An app with no
 *  entry has no store assets to derive from, and the page renders a labelled
 *  placeholder — visibly missing beats a grey box, which is rule 8. */
export type Media = {
  /** Decides the frame the site draws: a phone bezel, or browser chrome.
   *  Drawing a web product inside a phone would be a small lie about it. */
  kind: "mobile" | "web";
  icon: string | null;
  shots: { src: string; label: string }[];
};
const media = mediaRaw.media as Record<string, Media>;
export const mediaFor = (slug: string): Media =>
  media[slug] ?? { kind: "mobile", icon: null, shots: [] };
export const mediaGeneratedOn: string = mediaRaw.generatedOn;
/** Apps the sync could not find assets for, with the reason. Rendered on
 *  /design/gallery so the gap is stated rather than hidden. */
export const mediaMissing = mediaRaw.missing as { slug: string; why: string }[];

export const verifiedOn: string = raw.verifiedOn;
/**
 * **The array order in products.json is the running order of this site** —
 * set by hand (Sep 2026), not derived. It leads with the products worth
 * leading with and ends with Tic Tac Toe. Every listing renders in this order:
 * the products table, the landing page, the résumé, "more products".
 * To re-order the site, re-order the file.
 */
export const products = raw.products as unknown as Product[];

export const bySlug = (slug: string): Product | undefined =>
  products.find((p) => p.slug === slug);

/** Products anyone can install or open today. Used to decide what gets a
 *  working button, never to decide what gets listed — everything gets listed. */
export const isAvailable = (p: Product): boolean =>
  Object.values(p.platforms).some((v) => v && (v.state === "live" || v.state === "beta"));

export const shipped = products.filter((p) => !p.notBuilt);
export const unbuilt = products.filter((p) => p.notBuilt);

/** Consumer apps versus platforms and tools. An explicit field, because the
 *  first version inferred this by matching names against profile.json and
 *  "DwarSeva — Societies" matched "DwarSeva Property" on the shared first word.
 *  It was classified as an app, filtered out of /work, and was in no product
 *  list either — the product disappeared from the site entirely. Never infer a
 *  category you can just store. */
export type Kind = "app" | "platform";

/** Order by how real a thing is: something you can install or open today, then
 *  a beta you can join, then work in progress, then an idea. Derived from the
 *  platform states rather than typed, so it cannot drift from the table. */
export function rank(p: Product): number {
  const states = Object.values(p.platforms).filter(Boolean).map((v) => v!.state);
  if (states.includes("live")) return 0;
  if (states.includes("beta")) return 1;
  if (p.notBuilt) return 3;
  return 2;
}
/** Availability order. Kept for counting what is usable today; it no longer
 *  decides what is listed first — see the note on `products` below. */
export const byRank = (a: Product, b: Product) => rank(a) - rank(b) || a.name.localeCompare(b.name);

/** Model → the token pair. Deliberately no "good"/"bad" ordering: a
 *  subscription is not a warning and ad-supported is not a confession. */
export const MODEL: Record<Model, { label: string; fg: string; bg: string }> = {
  free: { label: "Free", fg: "text-m-free", bg: "bg-m-free-wash" },
  "free-ads": { label: "Free · ads", fg: "text-m-ads", bg: "bg-m-ads-wash" },
  "one-time": { label: "One-time", fg: "text-m-once", bg: "bg-m-once-wash" },
  subscription: { label: "Subscription", fg: "text-m-sub", bg: "bg-m-sub-wash" },
  "per-period": { label: "Per tax year", fg: "text-m-year", bg: "bg-m-year-wash" },
  undecided: { label: "Undecided", fg: "text-ink-3", bg: "bg-paper-2" },
};

export const STATE: Record<PlatformState, { fg: string; bg: string }> = {
  live: { fg: "text-live", bg: "bg-live-wash" },
  beta: { fg: "text-beta", bg: "bg-beta-wash" },
  closed: { fg: "text-design", bg: "bg-design-wash" },
  none: { fg: "text-design", bg: "bg-design-wash" },
};

/** Counts for the filter row. Derived, never typed into a page — a hardcoded
 *  "8 apps" is exactly the kind of fact that goes stale silently. */
export const modelCounts = products.reduce<Record<string, number>>((acc, p) => {
  acc[p.model] = (acc[p.model] ?? 0) + 1;
  return acc;
}, {});

/* ── Real design screens ──────────────────────────────────────────────────
   Synced from the app repos by scripts/sync-designs.mjs. These are the actual
   wireframes every app was built from — plain HTML, rendered live in an iframe
   rather than screenshotted, because a screenshot goes stale the moment a
   design changes and nothing tells you. */
import designsRaw from "@/data/designs.json";

export type Screen = { path: string; title: string; surface: string; area: string | null };
export type Gallery = {
  /** The original file under /designs/, where its own relative links resolve. */
  path: string;
  /** The clean per-product URL that serves those same bytes via <base>. */
  href: string;
  title: string;
  surface: string;
};
/* The generated JSON carries no `href` — that is derived here, and `area` is
   narrowed per-set by TS's literal inference, so the cast goes via unknown. */
type DesignSet = { indexes: Omit<Gallery, "href">[]; screens: Screen[] };
const designSets = designsRaw.sets as unknown as Record<string, DesignSet>;

export const screensFor = (slug: string): Screen[] => designSets[slug]?.screens ?? [];

/** The set's own gallery page for each surface — the index.html sitting at the
 *  top of `mobile/` or `web/`, written in the app repo. Deeper index.html files
 *  (one per flow) are still copied so the links inside it work, but they are
 *  reached by navigating the gallery, not by entering at them. */
export function galleriesFor(slug: string): Gallery[] {
  const all = designSets[slug]?.indexes ?? [];
  const depth = (g: { path: string }) => g.path.split("/").length;
  const roots = new Map<string, Omit<Gallery, "href">>();
  for (const g of all) {
    const held = roots.get(g.surface);
    if (!held || depth(g) < depth(held)) roots.set(g.surface, g);
  }
  const sorted = [...roots.values()].sort((a, b) => a.surface.localeCompare(b.surface));
  // One surface needs no disambiguating segment; several do. Kept in step with
  // the paths scripts/sync-designs.mjs writes into public/products/.
  return sorted.map((g) => ({
    ...g,
    href:
      sorted.length === 1
        ? `/products/${slug}/designs/`
        : `/products/${slug}/designs/${g.surface}/`,
  }));
}

export const designsGeneratedOn: string = designsRaw.generatedOn;
export const totalScreens = Object.values(designSets).reduce((n, s) => n + s.screens.length, 0);
