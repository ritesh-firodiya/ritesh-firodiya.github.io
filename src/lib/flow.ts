import { generated } from "@/lib/generated";

/* Written by scripts/flow.mjs during `pnpm sync`, from the product's
   .context/metrics/flow.json, which ~/git/bin/flow writes on the owner's
   machine from Claude transcripts and git. Counts and times only. */

/* The stages ~/git/bin/flow can measure. A product shows its own ordered
   subset — the `pipeline:` in its .context/context.yaml. */
export type FlowStageId = "idea" | "research" | "plan" | "design" | "code" | "review" | "release" | "store-review" | "deployed" | "live";

export interface FlowHop {
  from: FlowStageId;
  to: FlowStageId;
  /** Percent of the previous stage that got here; null when that stage was empty. */
  share: number | null;
  medianHours: number | null;
}

export interface Flow {
  stages: { id: FlowStageId; count: number }[];
  hops: FlowHop[];
  /** The stage reached by the step with the longest median wait. */
  slowest: FlowStageId | null;
  /** The stage reached by the step with the lowest share. */
  drop: FlowStageId | null;
  asOf: string | null;
  /** The oldest conversation counted; older transcripts are gone. */
  since: string | null;
}

const { flow } = generated<{ flow: Record<string, Flow> }>("flow.json", { flow: {} });

export const flowFor = (slug: string): Flow | null => flow[slug] ?? null;

/** Each stage's name and, in one line, what counts (the rules in ~/git/bin/flow). */
export const FLOW_STAGE: Record<FlowStageId, { label: string; counts: string }> = {
  idea: { label: "Idea", counts: "a conversation started" },
  research: { label: "Research", counts: "searched the web or filed research" },
  plan: { label: "Plan", counts: "a commit touched features, tasks or decisions" },
  design: { label: "Design", counts: "a commit touched the design set" },
  code: { label: "Code", counts: "a commit touched app code" },
  review: { label: "Review", counts: "that commit is in a merged pull request" },
  release: { label: "Release", counts: "that commit is in a version tag" },
  "store-review": { label: "Store review", counts: "in the version under store review" },
  deployed: { label: "Deployed", counts: "in the deployed web build" },
  live: { label: "Live", counts: "in the live version" },
};

const HOURS_PER_DAY = 24;

/** 1.6 → "1.6 h", 191.6 → "8 days". */
export function duration(hours: number | null): string {
  if (hours === null) return "—";
  if (hours < HOURS_PER_DAY) return `${hours} h`;
  const days = Math.round((hours / HOURS_PER_DAY) * 10) / 10;
  return `${days} ${days === 1 ? "day" : "days"}`;
}
