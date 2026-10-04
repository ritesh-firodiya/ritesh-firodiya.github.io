import raw from "@/data/products.json";
import { generated } from "@/lib/generated";

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
  /** For a `closed` platform: where a tester goes to install once their
   *  account has been added to the list. */
  testUrl?: string;
};

export type Product = {
  slug: string;
  name: string;
  /** How far along it is, in two or three words. The colour is derived from
   *  the platforms; only the words are typed. */
  stageLabel: string;
  /** A product with no screenshot can show one of its own design screens
   *  instead, live. Path inside its design set: "web/tax/tax.html". */
  embed?: string;
  /** A product with a site AND an app names a phone screen too, shown beside
   *  the web one. Path inside its design set: "mobile/home/home.html". */
  embedMobile?: string;
  /** Which store screenshots to show, best first, by file name without the
   *  extension: "01-today". The listing's own order is written for a store
   *  page; a tilted close-up reads badly at card size, so the straight-on
   *  shots are named here. Without it, the listing order is used. */
  shots?: string[];
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

/** The product's own store art, resized by scripts/sync-context.mjs at build
 *  time. Nothing is committed here: re-shoot the listing in the product repo
 *  and the next build shows it. An app with no entry has no listing yet, and
 *  the page renders a labelled placeholder — visibly missing beats a grey box. */
export type Shot = { src: string; label: string; width: number; height: number };
export type Media = { icon: string | null; shots: Shot[] };
const mediaRaw = generated<{ media: Record<string, Media> }>("media.json", { media: {} });
export const mediaFor = (slug: string): Media => mediaRaw.media[slug] ?? { icon: null, shots: [] };

const fileName = (src: string) => src.slice(src.lastIndexOf("/") + 1).replace(/\.\w+$/, "");
/** A product's screenshots in the order the site should show them: the ones
 *  it names first, then whatever else the listing has. */
export function shotsOf(p: Pick<Product, "slug" | "shots">, limit = 3): Shot[] {
  const all = mediaFor(p.slug).shots;
  const named = (p.shots ?? []).map((n) => all.find((s) => fileName(s.src) === n)).filter((s): s is Shot => Boolean(s));
  return [...named, ...all.filter((s) => !named.includes(s))].slice(0, limit);
}

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

/**
 * The release state — the one colour scale this site reserves.
 *
 *   live   anyone can install or open it today
 *   test   a build exists behind a door: a beta, a closed track, a review queue
 *   build  code exists and nothing is installable
 *   draft  designs only
 *
 * Derived from the platform states rather than typed, so it cannot drift from
 * the buttons on the same page.
 */
export type Stage = "live" | "test" | "build" | "draft";
export function stageOf(p: Product): Stage {
  const states = Object.values(p.platforms).filter(Boolean).map((v) => v!.state);
  if (states.includes("live")) return "live";
  if (states.includes("beta") || states.includes("closed")) return "test";
  return p.notBuilt ? "draft" : "build";
}
export const STAGE_LABEL: Record<Stage, string> = {
  live: "Live",
  test: "In testing",
  build: "In build",
  draft: "In design",
};
export const stageCounts = products.reduce<Record<Stage, number>>(
  (acc, p) => ({ ...acc, [stageOf(p)]: acc[stageOf(p)] + 1 }),
  { live: 0, test: 0, build: 0, draft: 0 },
);

/** Something to look at or install: a card on /work. The rest are rows. */
export const hasBuild = (p: Product): boolean => ["live", "test"].includes(stageOf(p));

/** How an app is paid for, in the words the page shows. A fact, stated at
 *  equal weight for every model: a subscription is not a warning and
 *  ad-supported is not a confession. Never a price — see CLAUDE.md rule 2b. */
export const MODEL_LABEL: Record<Model, string> = {
  free: "Free",
  "free-ads": "Free, with ads",
  "one-time": "One-time purchase",
  subscription: "Subscription",
  "per-period": "Per tax year",
  undecided: "Undecided",
};

/* ── Real design screens ──────────────────────────────────────────────────
   Synced from the app repos by scripts/sync-designs.mjs. These are the actual
   wireframes every app was built from — plain HTML, rendered live in an iframe
   rather than screenshotted, because a screenshot goes stale the moment a
   design changes and nothing tells you. */

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
type StyleGuide = {
  canonical: string;
  results: Record<string, { surfaces: Record<string, SurfaceVerdict>; publishable: string[] }>;
};
const designsRaw = generated<{ sets: Record<string, DesignSet>; styleGuide?: StyleGuide }>("designs.json", { sets: {} });
const designSets = designsRaw.sets;

/** The contact sheet is a page of the set, not a screen of the product. */
export const screensFor = (slug: string): Screen[] =>
  (designSets[slug]?.screens ?? []).filter((s) => !s.path.endsWith("/screenshots.html"));
export const hasScreen = (slug: string, path: string): boolean =>
  (designSets[slug]?.screens ?? []).some((s) => s.path === path);

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

/* ── Style-guide conformance ──────────────────────────────────────────────
   A design set is published only if it follows ~/git/personal/STYLE-GUIDE.md;
   scripts/designs/conformance.mjs is the gate and its verdicts land here.

   Every product is recorded, passing or not. A set that fails is not copied
   into the export at all — so there is nothing to link to — and the product
   page says which checks failed instead of quietly dropping the section. That
   is the same rule the rest of this site runs on: a missing thing is visibly
   missing, with its reason. */
export type Check = { id: string; ok: boolean; detail: string };
export type SurfaceVerdict = { pass: boolean; checks: Check[] };
const styleGuide = designsRaw.styleGuide;

/** Surfaces this product draws that do NOT follow the guide, with the reasons. */
export function withheldFor(slug: string): { surface: string; failed: Check[] }[] {
  const r = styleGuide?.results?.[slug];
  if (!r) return [];
  return Object.entries(r.surfaces)
    .filter(([, v]) => !v.pass)
    .map(([surface, v]) => ({ surface, failed: v.checks.filter((c) => !c.ok) }))
    .sort((a, b) => a.surface.localeCompare(b.surface));
}

/** Every surface a product draws, published or not. */
export const surfacesOf = (slug: string): string[] => Object.keys(styleGuide?.results?.[slug]?.surfaces ?? {});

/** Whether a product is a phone app, a site, or both: the tags on its card.
 *  Counted from what is drawn and what is built, so it cannot be mistyped. */
export type Surface = "mobile" | "web";
export function surfaceTags(p: Product): Surface[] {
  const built = Object.entries(p.platforms)
    .filter(([, v]) => v && v.state !== "none")
    .map(([k]) => (k === "web" ? "web" : "mobile"));
  const found = new Set<string>([...surfacesOf(p.slug), ...built]);
  if (found.size === 0) found.add(p.kind === "platform" ? "web" : "mobile");
  return (["mobile", "web"] as const).filter((s) => found.has(s));
}
export const totalScreens = Object.keys(designSets).reduce((n, slug) => n + screensFor(slug).length, 0);
