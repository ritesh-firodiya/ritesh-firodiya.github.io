/**
 * Structure checks — how a set is ORGANISED, not how it looks.
 *
 * The checks in lint-checks.mjs answer "do these colours come from one place".
 * These answer the question that actually makes nine products feel like one:
 * can a person who has read one set find their way around any other. Surfaces
 * named the same, flows in the same order, screens named the same way, every
 * state enumerable, and a gallery that opens the same way.
 *
 * Colour and type stay per product. None of that is checked here.
 *
 * Each takes a `set` (built by scripts/lint-designs.mjs) plus the parsed
 * structure.json, and returns { id, ok, count, detail } like the token checks.
 */

const res = (id, ok, count, detail) => ({ id, ok, count, detail: detail || "" });

/** S1. Surface folders are `mobile` / `web`, and nothing else. */
export function surfaceNames(set, spec) {
  const allowed = new Set([...spec.surfaces.allowed, ...spec.surfaces.assetFolders]);
  const stray = set.surfaces.filter((s) => !allowed.has(s));
  const hint = stray
    .map((s) => (spec.surfaces.rename[s] ? `${s} -> ${spec.surfaces.rename[s]}` : s))
    .join(" ");
  return res("surface-names", stray.length === 0, stray.length, hint);
}

/**
 * S2. Every surface carries the files a reader expects to find.
 *
 * A surface with no index.html has no way in; one with no shared.css is a set
 * of screens that paint from nothing.
 */
export function surfaceFiles(set, spec) {
  const missing = [];
  for (const [surface, files] of Object.entries(set.surfaceFiles)) {
    if (spec.surfaces.assetFolders.includes(surface)) continue;
    for (const required of spec.surfaces.required.files) {
      if (!files.includes(required)) missing.push(`${surface}/${required}`);
    }
  }
  return res("surface-files", missing.length === 0, missing.length, missing.slice(0, 6).join(" "));
}

/**
 * S3. No index.html inside a flow.
 *
 * At surface root it is the gallery. One level down, the same filename meaning
 * "the main screen of this flow" is ambiguous, and it has no sane variant form
 * — index-empty.html reads as nonsense.
 */
export function flowIndexes(set) {
  const bad = set.screenPaths.filter((p) => {
    const parts = p.split("/");
    return parts.length > 2 && parts.at(-1) === "index.html";
  });
  return res("no-flow-index", bad.length === 0, bad.length, bad.slice(0, 5).join(" "));
}

/** S4. Screen filenames are lowercase kebab-case. */
export function screenNames(set, spec) {
  const re = new RegExp(spec.screens.pattern);
  const bad = set.screenPaths
    .map((p) => p.split("/").at(-1))
    .filter((f) => f !== "index.html" && !re.test(f));
  return res("screen-names", bad.length === 0, bad.length, [...new Set(bad)].slice(0, 6).join(" "));
}

/**
 * S5. A variant file ends in one of the five state names.
 *
 * Reports the aliases, because `failed` and `paywall` are not wrong so much as
 * differently spelled — and a rename is cheaper than a redraw.
 */
export function variantNames(set, spec) {
  const aliases = Object.entries(spec.variants.aliases).filter(([k]) => k !== "_");
  const hits = [];
  for (const path of set.screenPaths) {
    const name = path.split("/").at(-1).replace(/\.html$/, "");
    for (const [alias, canonical] of aliases) {
      if (name === alias || name.endsWith(`-${alias}`)) {
        hits.push(`${path} (${alias} means ${canonical})`);
        break;
      }
    }
  }
  return res("variant-names", hits.length === 0, hits.length, hits.slice(0, 4).join(" "));
}

/**
 * S6. Flow folder names.
 *
 * NOT order: folders on disk are always alphabetical, so checking their
 * sequence checks the filesystem rather than the set. Ordering is a property
 * of the index route table and is checked there.
 *
 * What matters here is the vocabulary. Six names recur across the estate and
 * mean the same thing every time; a set that calls its paywall flow `paywall`
 * instead of `store`, or splits settings across two folders, costs a reader
 * the one thing they already knew.
 */
export function flowNames(set, spec) {
  const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const reserved = spec.flows.reserved;
  const synonyms = {
    paywall: "store", packs: "store", subscription: "store",
    account: "settings", profile: "auth", signup: "auth", login: "auth",
    intro: "onboarding", welcome: "onboarding", error: "states", errors: "states",
    components: "patterns", primitives: "patterns",
  };

  const problems = [];
  for (const flow of set.flows) {
    if (!kebab.test(flow)) { problems.push(`${flow} (not kebab-case)`); continue; }
    const want = synonyms[flow];
    if (want && !reserved[flow]) problems.push(`${flow} -> ${want}`);
  }
  return res("flow-names", problems.length === 0, problems.length, problems.slice(0, 6).join(" "));
}

/**
 * S7. The gallery opens with the required skeleton, in order.
 *
 * Deliberately shallow: it looks for the marker attributes the skeleton is
 * built from rather than parsing prose, so a set can say whatever it likes in
 * its narrative sections and still be checkable.
 */
export function indexSkeleton(set, spec) {
  const missing = [];
  for (const [surface, html] of Object.entries(set.indexHtml)) {
    if (!html) { missing.push(`${surface}/index.html`); continue; }
    for (const section of spec.index.required) {
      if (!new RegExp(`data-ds="${section.id}"`).test(html)) {
        missing.push(`${surface}: ${section.id}`);
      }
    }
  }
  return res("index-skeleton", missing.length === 0, missing.length, missing.slice(0, 6).join(" "));
}

/**
 * S8. State coverage — reported, never enforced.
 *
 * A static rules page has no empty state and no loading state. Demanding five
 * files per screen would be a rule people learn to ignore, and an ignored rule
 * is worse than none. So this counts what is drawn and says what is not.
 */
export function stateCoverage(set, spec) {
  const exempt = new Set(spec.variants.exempt.flows);
  const screens = new Map();
  for (const path of set.screenPaths) {
    const parts = path.split("/");
    const flow = parts.length > 2 ? parts[1] : "";
    if (exempt.has(flow)) continue;
    const name = parts.at(-1).replace(/\.html$/, "");
    const state = spec.variants.states.find((s) => name.endsWith(`-${s}`));
    const base = state ? `${flow}/${name.slice(0, -(state.length + 1))}` : `${flow}/${name}`;
    if (!screens.has(base)) screens.set(base, new Set());
    if (state) screens.get(base).add(state);
  }
  /* NOT screens x 5. Most screens genuinely have two or three states, and a
     denominator of five per screen would make every set look 80% broken
     forever — a number nobody can move is a number nobody reads. What matters
     is how many screens have ANY state drawn at all, and which states exist. */
  const withAny = [...screens.values()].filter((s) => s.size > 0).length;
  const byState = spec.variants.states
    .map((st) => [st, [...screens.values()].filter((s) => s.has(st)).length])
    .filter(([, n]) => n > 0)
    .map(([st, n]) => `${st} ${n}`)
    .join(", ");
  return res(
    "state-coverage",
    null,
    screens.size - withAny,
    `${withAny}/${screens.size} screens have a state drawn${byState ? ` · ${byState}` : ""}`,
  );
}

/**
 * S9. The design set lives where the house rule says, and only there.
 *
 * Two copies is the failure, not the location. chitragupt carries the same 269
 * files at .trunk/designs (tracked) and .context/designs (untracked), so the
 * next edit lands in one of them and nobody finds out which.
 */
export function repoPaths(set, spec) {
  if (spec.repo.exempt[set.repo]) return res("repo-paths", null, 0, "exempt");

  const problems = [];
  if (!set.design.includes(spec.repo.designs)) {
    problems.push(`designs at ${set.design}, want ${spec.repo.designs}`);
  }
  for (const alt of set.altTrees ?? []) problems.push(`second copy at ${alt}`);
  return res("repo-paths", problems.length === 0, problems.length, problems.join(" · "));
}

export const STRUCTURE_CHECKS = [
  surfaceNames, surfaceFiles, flowIndexes, screenNames,
  variantNames, flowNames, indexSkeleton, repoPaths, stateCoverage,
];
