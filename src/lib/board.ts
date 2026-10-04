import { generated } from "@/lib/generated";
import { type Product, galleriesFor, surfacesOf, stageOf } from "@/lib/products";

/**
 * The eight stages every product goes through, and where each product is on
 * them.
 *
 * A cell is COUNTED, never claimed. Each stage writes to a folder in the
 * product's own repo — research notes, a feature list, a design set, a store
 * listing — and scripts/sync-context.mjs reports which of those have anything
 * in them. This file only turns those counts into done / under way / not
 * started. A product that gains a marketing folder moves a dot on the next
 * build, and nobody edits this site to make it happen.
 */
export const STAGES = [
  { key: "idea", name: "Idea", icon: "lightbulb", what: "A problem I have, or one I keep seeing other people have.", leaves: "A thesis" },
  { key: "research", name: "Research", icon: "search", what: "Who else solves it, what they charge, and where they fail.", leaves: "Notes, a brief" },
  { key: "define", name: "Define", icon: "list-checks", what: "What is in version one, what is not, and the names and numbers everything else must match.", leaves: "Decisions, features" },
  { key: "design", name: "Design", icon: "pencil-ruler", what: "Every screen and every state, as a clickable HTML page.", leaves: "Screens, a flow chart" },
  { key: "build", name: "Build", icon: "hammer", what: "The data model first, then the app against the designs.", leaves: "The app, tests" },
  { key: "release", name: "Release", icon: "rocket", what: "Store listing, screenshots, privacy, review.", leaves: "An installable build" },
  { key: "market", name: "Market", icon: "megaphone", what: "Positioning, store search, and somewhere to say it.", leaves: "A findable listing" },
  { key: "operate", name: "Operate", icon: "activity", what: "Numbers, support, and the fixes they point to.", leaves: "Metrics, fixes" },
] as const;

/** 2 done · 1 under way · 0 not started. */
export type Level = 0 | 1 | 2;
export const LEVEL_LABEL: Record<Level, string> = { 0: "Not started", 1: "Under way", 2: "Done" };

type Context = {
  raw: number; synthesis: number; features: number; decisions: number; entities: number;
  marketing: number; metrics: number; support: number; hasCode: boolean;
};
const contexts = generated<{ context: Record<string, Context> }>("context.json", { context: {} }).context;

/** Products the board can place: the ones whose repo was read. */
export const onBoard = (p: Product): boolean => p.slug in contexts;

export function levelsOf(p: Product): Level[] {
  const c = contexts[p.slug];
  if (!c) return [0, 0, 0, 0, 0, 0, 0, 0];
  const stage = stageOf(p);
  const defined = (c.features > 0 ? 1 : 0) + (c.decisions + c.entities > 0 ? 1 : 0);
  const drawn = surfacesOf(p.slug).length;
  const published = galleriesFor(p.slug).length;
  return [
    2, // it is on this list, so the idea exists
    c.raw + c.synthesis > 0 ? 2 : 0,
    defined as Level,
    drawn === 0 ? 0 : published === drawn ? 2 : 1,
    c.hasCode && !p.notBuilt ? 2 : 0,
    stage === "live" ? 2 : stage === "test" ? 1 : 0,
    /* Marketing and operations are never finished, so neither is ever "done". */
    c.marketing > 0 ? 1 : 0,
    c.metrics + c.support > 0 ? 1 : 0,
  ];
}
