import { generated } from "@/lib/generated";

/* Written by scripts/funnel.mjs during `pnpm sync`, from each product's
   features/ and ops/release.yml. Nothing in a funnel is typed here. */

export type StageId = "plan" | "build" | "testers" | "review" | "deployed" | "live";

export interface FunnelItem {
  name: string;
  detail?: string | null;
  /** A store or a web host, not a feature. */
  surface?: boolean;
}

export interface Stage {
  id: StageId;
  items: FunnelItem[];
  /** Shipped features riding on the build that reached this stage. */
  shipped: number;
  count: number;
}

export interface Funnel {
  stages: Stage[];
  waits: StageId | null;
  setAside: { shelved: number; superseded: number };
  /** release.yml's own `updated:` date. */
  asOf: string | null;
}

const { funnel } = generated<{ funnel: Record<string, Funnel> }>("funnel.json", { funnel: {} });

export const funnelFor = (slug: string): Funnel | null => funnel[slug] ?? null;
