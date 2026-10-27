/**
 * A product's funnel, from two files zeno's context layout already defines:
 * each `.context/features/*.md` (its `status:`) and `.context/ops/release.yml`
 * (what is live right now, per surface). Nothing here is typed by hand; a
 * stage exists only when the product's own files give it something to count.
 *
 * Pure: the sync reads the files and passes them in, the test passes fixtures.
 */

/** Every stage a funnel can have, in order. A product shows a subset. */
export const STAGE_ORDER = ["plan", "build", "testers", "review", "deployed", "live"];

/** zeno's feature statuses. The last two leave the funnel and are only counted. */
const BY_STATUS = { planned: "plan", building: "build" };
const SET_ASIDE = ["shelved", "superseded"];

const SURFACES = {
  app_store: { name: "iOS", mobile: true },
  play: { name: "Android", mobile: true },
  web: { name: "Web", mobile: false },
};

/** "0019-scan-a-document" → "Scan a document". The feature files carry no title. */
export const featureName = (slug) => {
  const words = slug.replace(/^\d+-/, "").replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/** The `status:` in a feature page's frontmatter, or null. */
export const statusOf = (text) => text.match(/^---\n[\s\S]*?^status:\s*([a-z-]+)/m)?.[1] ?? null;

const str = (v) => (typeof v === "string" || typeof v === "number" ? String(v) : null);

/** Where one surface stands, and the version it stands at. */
function surfaceStage(key, s) {
  if (s.live != null) return { stage: "live", detail: str(s.live) };
  if (s.in_review) {
    const r = s.in_review;
    const version = str(r) ?? str(r.version);
    const since = str(r.submitted);
    return { stage: "review", detail: [version, since && `submitted ${since}`].filter(Boolean).join(" · ") || null };
  }
  if (key === "play") {
    const t = s.tracks ?? {};
    const track = ["beta", "alpha", "internal"].find((k) => t[k] != null);
    if (track) return { stage: "testers", detail: typeof t[track] === "number" ? `build ${t[track]}` : `${track} track` };
  }
  if (key === "app_store" && Array.isArray(s.testflight?.valid_builds) && s.testflight.valid_builds.length > 0) {
    return { stage: "testers", detail: `TestFlight build ${Math.max(...s.testflight.valid_builds)}` };
  }
  if (s.deployed) return { stage: "deployed", detail: str(s.version) ?? str(s.deployed?.revision) };
  return null;
}

/**
 * @param {{ features: { slug: string, status: string | null }[], release: any }} input
 *   `release` is the parsed release.yml, or null when the product has none.
 */
export function funnelOf({ features, release }) {
  const items = Object.fromEntries(STAGE_ORDER.map((s) => [s, []]));
  const setAside = Object.fromEntries(SET_ASIDE.map((s) => [s, 0]));
  let shipped = 0;
  for (const f of features) {
    if (f.status in BY_STATUS) items[BY_STATUS[f.status]].push({ name: featureName(f.slug) });
    else if (f.status === "shipped") shipped += 1;
    else if (SET_ASIDE.includes(f.status)) setAside[f.status] += 1;
  }

  const stages = new Set(["plan", "build"]);
  let furthest = -1;
  /* `verified: false` is the file saying its own block is a guess. */
  const surfaces = Object.entries(release?.surfaces ?? {}).filter(([k, s]) => k in SURFACES && s && s.verified !== false);
  for (const [key, s] of surfaces) {
    const { name, mobile } = SURFACES[key];
    (mobile ? ["testers", "review"] : ["deployed"]).forEach((x) => stages.add(x));
    stages.add("live");
    const at = surfaceStage(key, s);
    if (!at) continue;
    items[at.stage].push({ name, detail: at.detail, surface: true });
    furthest = Math.max(furthest, STAGE_ORDER.indexOf(at.stage));
  }

  /* A shipped feature sits wherever its build has got to: the furthest any
     surface has reached. With no build out yet, it is still in Build. */
  const shippedAt = furthest >= 0 ? STAGE_ORDER[furthest] : "build";

  const list = STAGE_ORDER.filter((s) => stages.has(s)).map((id) => ({
    id,
    items: items[id],
    shipped: id === shippedAt ? shipped : 0,
    count: items[id].length + (id === shippedAt ? shipped : 0),
  }));
  /* Work waits at the furthest stage short of Live that holds anything. */
  const waits = [...list].reverse().find((s) => s.id !== "live" && s.count > 0)?.id ?? null;
  return { stages: list, waits, setAside, asOf: str(release?.updated) };
}
