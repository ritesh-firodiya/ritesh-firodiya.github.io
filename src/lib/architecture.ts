import { generated } from "@/lib/generated";

/**
 * A product's architecture page, read out of its own repo by scripts/sync-context.mjs.
 * scripts/designs/public-architecture.mjs decides what is public: all but its risk notes.
 */
export type Basis = "measured" | "stated" | "code" | "assumed" | "unknown";
export interface Sourced { basis?: Basis; source?: string }
export interface Part {
  id: string;
  area: string;
  label: string;
  does: string;
  price?: string;
  cost?: Sourced & { today?: string; grows?: string };
  ifDown?: Sourced & { user?: string; data?: string };
}
export interface Flow { name: string; cost?: string; note?: string; path: string[]; steps: string[] }
export interface Growth {
  unit: string;
  rate: number;
  today?: number;
  steps: number[];
  limitPerDay?: number;
  limitLabel?: string;
  costLabel?: string;
  summary?: string;
  note?: string;
}
export interface Architecture {
  verified?: string;
  summary: string;
  headlines: { label: string; value: string; note?: string }[];
  areas: { id: string; label: string }[];
  parts: Part[];
  flows: Flow[];
  growth?: Growth;
  data: { what: string; where: string }[];
  unknowns: string[];
}

const index = generated<{ architecture: Record<string, Architecture> }>("architecture.json", { architecture: {} }).architecture;

export const architectureSlugs = Object.keys(index);
export const architectureOf = (slug: string): Architecture | null => index[slug] ?? null;
export const architectureHref = (slug: string): string => `/products/${slug}/architecture/`;
