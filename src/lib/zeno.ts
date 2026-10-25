import { generated } from "@/lib/generated";

/** What a product's `.claude/zeno.yaml` says: the zeno version it is pinned to
 *  and the modules it runs. Read at build time by scripts/sync-context.mjs. */
export type ZenoConfig = { version: string | null; modules: string[] };

const raw = generated<{ zeno: Record<string, ZenoConfig> }>("zeno.json", { zeno: {} });

export const zenoFor = (slug: string): ZenoConfig | null => raw.zeno[slug] ?? null;

export const ZENO_REPO = "https://github.com/ritesh-firodiya/zeno";

export const ZENO_VERSION = "0.9.0";

export const INSTALL = [
  "claude plugin marketplace add ritesh-firodiya/zeno",
  "claude plugin install zeno@zeno",
  "npm install -g @freetesh/zeno",
];

/** Know → Enforce → Ship. `short` is Home, `long` is the zeno page. */
export const STEPS = [
  {
    title: "Know",
    short: "Prices, rules and past decisions live in your repo, where the AI searches them first.",
    long: "A wiki of decisions, prices, rules and features in each repo. Searched locally, before the AI answers.",
  },
  {
    title: "Enforce",
    short: "Every request, and every claim in it, is checked against facts before any work starts.",
    long: "A gate weighs each request: do it, do it differently, or push back. Every claim is marked backed or not, and every reason names its source.",
  },
  {
    title: "Ship",
    short: "Less guessing, fewer redos. Overrides are logged so the rules improve.",
    long: "Checks fail when a rule breaks. Overrides are logged, and zeno proposes better rules from them.",
  },
];

/**
 * Verdicts the gate gave. `eval` ones are zeno's own test suite run on a
 * sample habit app (zeno/evals: contradicts-adr, shelved-feature,
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

/** The product lifecycle, and what zeno keeps at each stage. */
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
