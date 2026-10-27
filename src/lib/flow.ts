import { generated } from "@/lib/generated";

/* Written by scripts/flow.mjs during `pnpm sync`, from the product's
   .context/metrics/flow.json, which ~/git/bin/flow writes on the owner's
   machine from Claude transcripts and git. Counts and times only. */

export type FlowStageId = "asked" | "committed" | "released" | "live";

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
}

const { flow } = generated<{ flow: Record<string, Flow> }>("flow.json", { flow: {} });

export const flowFor = (slug: string): Flow | null => flow[slug] ?? null;

/** Each stage's name and, in one line, what counts. */
export const FLOW_STAGE: Record<FlowStageId, { label: string; counts: string }> = {
  asked: { label: "Asked", counts: "conversations with Claude about it" },
  committed: { label: "Committed", counts: "ended in a commit" },
  released: { label: "Released", counts: "that commit is in a version tag" },
  live: { label: "Live", counts: "that version is live" },
};

const HOURS_PER_DAY = 24;

/** 1.6 → "1.6 h", 191.6 → "8 days". */
export function duration(hours: number | null): string {
  if (hours === null) return "—";
  if (hours < HOURS_PER_DAY) return `${hours} h`;
  const days = Math.round((hours / HOURS_PER_DAY) * 10) / 10;
  return `${days} ${days === 1 ? "day" : "days"}`;
}
