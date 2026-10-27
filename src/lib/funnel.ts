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

export const STAGE_LABEL: Record<StageId, string> = {
  plan: "Plan",
  build: "Build",
  testers: "Testers",
  review: "Store review",
  deployed: "Deployed",
  live: "Live",
};

/* What the tools do at the stage where work waits. Each line is true of the
   tool as shipped: zeno's rule C-12 and its architecture module, canon's own
   templates. The architecture line needs that module in the product's config. */
export function helpAt(stage: StageId, modules: string[]): string[] {
  const irreversible = "zeno weighs any step that cannot be undone, such as a release, before it runs";
  switch (stage) {
    case "plan":
      return ["zeno weighs each request against the product's recorded decisions", "canon holds the PRD and RFC templates for specs"];
    case "build":
      return [
        modules.includes("architecture") ? "zeno check enforces its import rules" : "zeno check enforces its layout and wiki rules",
        "canon serves its docs to the editor over MCP",
      ];
    case "testers":
      return ["canon holds the verification template for test plans", irreversible];
    case "review":
    case "deployed":
      return [irreversible, "canon holds the operations template for runbooks"];
    case "live":
      return [];
  }
}
