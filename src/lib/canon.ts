import { generated } from "@/lib/generated";

/** What a product's `.claude/canon.yaml` says: the canon version it is pinned to
 *  and the modules it runs. Read at build time by scripts/sync-context.mjs. */
export type CanonConfig = { version: string | null; modules: string[] };

const raw = generated<{ canon: Record<string, CanonConfig> }>("canon.json", { canon: {} });

export const canonFor = (slug: string): CanonConfig | null => raw.canon[slug] ?? null;

export const CANON_REPO = "https://github.com/ritesh-firodiya/canon-cli";

export const CANON_VERSION = "0.19.1";

export const INSTALL = [
  "claude plugin marketplace add ritesh-firodiya/canon-cli",
  "claude plugin install canon@canon",
  "npm install -g @freetesh/canon",
];

/**
 * What canon is worth, four ways. Each `how` names the command or file that
 * does it, so every claim points at a mechanism a reader can check in the repo.
 */
export const VALUE = [
  {
    title: "Finds the bottleneck",
    body: "It measures how far each conversation about a product got: idea, plan, design, code, review, release, live. Each step gets its share and its median wait, so the slowest step and the biggest drop are plain to see.",
    how: "canon pipeline · canon flow <product>",
  },
  {
    title: "Keeps the domain respected",
    body: "Each repo imports the standards it follows by name. canon check turns them into checks, and a pre-push hook runs it, so a broken rule stops the push. Designs are checked against the app's routes, its navigation and its copy.",
    how: "standards: [design-sets, pipeline, …] · canon check · canon hooks install",
  },
  {
    title: "Weighs each decision",
    body: "A decision is one file per topic, with a Rejected line: what was turned down, and why. The weigh gate reads them before work starts and answers do it, do it differently, or push back, with its sources. Overrides are logged, and repeats become rule proposals.",
    how: "/canon:decision · /canon:weigh · canon learn",
  },
  {
    title: "Saves time",
    body: "A request that breaks a recorded decision stops before any code is written. One design shell is copied into every product and kept equal. The shell reads the designs straight from the HTML, so no list drifts from them. Failures show before a push, not after a deploy.",
    how: "canon copies --sync · _shell/scan.mjs · the pre-push hook",
  },
] as const;

/**
 * Verdicts the gate gave. `eval` ones are canon's own test suite run on a
 * sample habit app (canon/evals: contradicts-adr, shelved-feature,
 * irreversible-data); `own` is from the owner's products. The page says which.
 */
export type Verdict = {
  ask: string;
  summary: string;
  reasons: string[];
  sources: string;
  origin: "eval" | "own";
};

export const VERDICTS: Verdict[] = [
  {
    ask: "Add a $2.99 monthly plan next to the yearly one.",
    summary: "A recorded decision says yearly only. Monthly users quit at 4× the rate in the beta.",
    reasons: ["A recorded decision says yearly only, and it is still active.", "Monthly subscribers quit after one month at 4× the yearly rate."],
    sources: "decisions/yearly-plan-only · C-04 · C-05",
    origin: "eval",
  },
  {
    ask: "Let people share their streak to Instagram.",
    summary: "Shelved in August: 2 of 40 beta users asked. The bar to revisit is 20%.",
    reasons: ["Shelved in August: 2 of 40 beta users wanted it.", "The agreed bar to revisit is 20% asking. Nothing shows it was met."],
    sources: "features/share-streaks · C-04",
    origin: "eval",
  },
  {
    ask: "Clear the old history on app start.",
    summary: "That history is the user's only record. No account, no server copy, no undo.",
    reasons: ["It is not old: it is every streak the user ever kept.", "No account and no server copy, so it cannot be restored."],
    sources: "concepts/offline-first · C-12 · C-13",
    origin: "eval",
  },
  {
    ask: "Move every product to Firebase to cut the hosting bill.",
    summary: "The Postgres apps already cost about $0. Four apps would need rewriting.",
    reasons: ["The Postgres apps already cost about $0 on free tiers.", "Four apps would need their data and money flows rewritten."],
    sources: "ops/staging · synthesis/architecture · C-05 · C-07",
    origin: "own",
  },
];

/** The product lifecycle, and what canon keeps at each stage. */
export const LIFECYCLE = [
  { stage: "Idea", icon: "lightbulb", keeps: "weighed against your principles" },
  { stage: "Research", icon: "search", keeps: "filed, searchable" },
  { stage: "Define", icon: "list-checks", keeps: "decisions the gate cites" },
  { stage: "Design", icon: "pencil-ruler", keeps: "one design standard" },
  { stage: "Build", icon: "hammer", keeps: "architecture rules checked" },
  { stage: "Release", icon: "rocket", keeps: "irreversible steps flagged" },
  { stage: "Market", icon: "megaphone", keeps: "one home for every price" },
  { stage: "Operate", icon: "activity", keeps: "overrides teach the rules" },
] as const;
