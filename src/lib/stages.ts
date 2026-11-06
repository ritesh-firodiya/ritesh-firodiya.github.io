import { generated } from "@/lib/generated";

/* Written by scripts/stages.mjs during `pnpm sync`, from each product's
   context.yaml, records and ops/release.yml. Nothing here is typed. */

export interface StageNodeData {
  id: string;
  label: string;
  icon: string;
  what: string;
  tone: "problem" | "think" | "make" | "ship";
  left: number;
  top: number;
  gate: boolean;
  off: boolean;
  branch: boolean;
  n?: number;
  unit?: string;
  counts?: { count: number; status: string }[];
  rejected?: number;
}

export interface StageMapData {
  width: number;
  height: number;
  lines: { d: string; tone: StageNodeData["tone"] | null; off: boolean }[];
  label: { text: string; x: number; y: number } | null;
  nodes: StageNodeData[];
}

export interface Stages {
  map: StageMapData;
  status: { surfaces: { name: string; what: string }[]; next: string[]; anyLive: boolean };
  history: Record<string, number> | null;
  asOf: string | null;
}

const file = generated<{ stages: Record<string, Stages> }>("stages.json", { stages: {} });

export const stagesFor = (slug: string): Stages | null => file.stages[slug] ?? null;
