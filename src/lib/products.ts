import raw from "@/data/products.json";

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
  legal: { privacy: string | null; delete: string | null; privacyNote?: string };
};

export const verifiedOn: string = raw.verifiedOn;
export const products = raw.products as unknown as Product[];

export const bySlug = (slug: string): Product | undefined =>
  products.find((p) => p.slug === slug);

/** Products anyone can install or open today. Used to decide what gets a
 *  working button, never to decide what gets listed — everything gets listed. */
export const isAvailable = (p: Product): boolean =>
  Object.values(p.platforms).some((v) => v && (v.state === "live" || v.state === "beta"));

export const shipped = products.filter((p) => !p.notBuilt);
export const unbuilt = products.filter((p) => p.notBuilt);

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
