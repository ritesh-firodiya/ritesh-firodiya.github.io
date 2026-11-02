/**
 * A product's "How it ships" canvas: its own stages (`pipelines.default` in
 * context.yaml), the forks between them, its records' counts by status and each
 * surface's release state. Nothing is typed by hand. Pure: the sync reads the
 * files and passes them in, the test passes fixtures.
 */

const WIDTH = 1200;
const COLUMNS = 7;
const COLUMN = WIDTH / COLUMNS;
const LANES = { top: 100, mid: 220, bottom: 340 };
const SECOND_ROW = 470;
const WRAP_Y = 460;
const ONE_ROW_HEIGHT = 450;
const TILE_HALF = 28;

const STAGES = {
  problem: { label: "Problem", icon: "circle-alert", what: "what hurts", tone: "problem", unit: "problems" },
  idea: { label: "Idea", icon: "lightbulb", what: "ways to solve it", tone: "think", unit: "ideas" },
  research: { label: "Research", icon: "search", what: "discoveries, findings", tone: "think" },
  experiment: { label: "Experiment", icon: "flask-conical", what: "try it, keep or discard", tone: "think", unit: "experiments" },
  dropped: { label: "Dropped", icon: "archive", what: "stays on file", tone: "problem", unit: "dropped" },
  plan: { label: "Plan", icon: "list-checks", what: "the approach", tone: "think", unit: "plans" },
  feature: { label: "Feature", icon: "file-text", what: "what gets built", tone: "make", unit: "features" },
  bug: { label: "Bug", icon: "bug", what: "what gets fixed", tone: "problem", unit: "bugs" },
  design: { label: "Design", icon: "pencil-ruler", what: "every screen, in HTML", tone: "make" },
  code: { label: "Code", icon: "code", what: "the build", tone: "make" },
  review: { label: "Review", icon: "git-pull-request", what: "a merged pull request", tone: "make" },
  release: { label: "Release", icon: "tag", what: "a version", tone: "ship" },
  live: { label: "Live", icon: "globe", what: "anyone can use it", tone: "ship" },
  marketing: { label: "Marketing", icon: "megaphone", what: "posts drafted", tone: "ship" },
  video: { label: "Video", icon: "clapperboard", what: "script, render, publish", tone: "ship" },
  result: { label: "Result", icon: "activity", what: "did it work", tone: "ship" },
};

/** The stages canon's default flow has, for the canon page. */
export const DEFAULT_PIPELINE = [
  { id: "problem" }, { id: "idea" }, { id: "research" }, { id: "plan", gate: true }, { id: "feature" },
  { id: "design", gate: true, optional: true }, { id: "code" }, { id: "review", gate: true }, { id: "release" }, { id: "result" },
];

/** canon's stages that default to a person's approval, when a repo does not say. */
const DEFAULT_GATES = new Set(["plan", "design", "review"]);

const SURFACES = {
  app_store: { label: "iOS", icon: "smartphone" },
  play: { label: "Android", icon: "smartphone" },
  web: { label: "Web", icon: "monitor" },
  /* A web product's staging is its store review (owner, 2026-11-01). */
  staging: { label: "Staging", icon: "monitor" },
};

const STATUS_WORDS = { solving: "being solved" };

const str = (v) => (typeof v === "string" || typeof v === "number" ? String(v) : null);

/** The `status:` in a record's frontmatter, or null. */
export const statusOf = (text) => text.match(/^---\n[\s\S]*?^status:\s*([a-z-]+)/m)?.[1] ?? null;

/** Where one surface stands, in the words the page shows. `live` is the only state that opens the Live stage. */
export function surfaceState(key, s) {
  if (s.live != null) return { live: true, what: ["live", str(s.live) ?? str(s.live.version)].filter(Boolean).join(" · ") };
  if (s.in_review) {
    const r = s.in_review;
    const version = str(r.version) ?? (key === "play" ? null : str(r));
    return { live: false, what: ["in store review", version].filter(Boolean).join(" · ") };
  }
  if (key === "play") {
    const t = s.tracks ?? {};
    const track = ["beta", "alpha", "internal"].find((k) => t[k] != null);
    if (track) return { live: false, what: typeof t[track] === "number" ? `with testers · build ${t[track]}` : "with testers" };
  }
  if (key === "app_store" && s.testflight?.valid_builds?.length > 0) {
    return { live: false, what: `with testers · build ${Math.max(...s.testflight.valid_builds)}` };
  }
  if (s.deployed) return { live: false, what: ["deployed, not launched", str(s.version)].filter(Boolean).join(" · ") };
  return null;
}

/** `verified: false` is the file saying its own block is a guess. */
export function surfacesOf(release) {
  return Object.entries(release?.surfaces ?? {})
    .filter(([k, s]) => k in SURFACES && s && s.verified !== false)
    .map(([k, s]) => ({ key: k, ...SURFACES[k], state: surfaceState(k, s) }));
}

function breakdown(statuses) {
  const counts = new Map();
  for (const s of statuses) counts.set(s, (counts.get(s) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]).map(([status, count]) => ({ count, status: STATUS_WORDS[status] ?? status }));
}

function edgePath(a, b) {
  const x1 = a.x + TILE_HALF;
  const x2 = b.x - TILE_HALF;
  if (a.y < WRAP_Y && WRAP_Y < b.y) {
    return `M${x1} ${a.y} C${x1 + 70} ${a.y} ${x1 + 70} ${WRAP_Y} ${a.x} ${WRAP_Y} L${b.x} ${WRAP_Y} C${x2 - 70} ${WRAP_Y} ${x2 - 70} ${b.y} ${x2} ${b.y}`;
  }
  const k = Math.round((x2 - x1) / 2);
  return `M${x1} ${a.y} C${x1 + k} ${a.y} ${x2 - k} ${b.y} ${x2} ${b.y}`;
}

/**
 * @param pipeline the repo's stages: `{ id, gate?, optional? }`
 * @param records  statuses by kind: `{ problems: string[], ideas, experiments, plans, features, bugs }`
 * @param release  the parsed release.yml, or null
 * @param started  which undated stages have anything on disk: `{ research, design, code, review, release, marketing, video, result }`
 * @param turnedDown owner rejections by stage id, from the history metrics
 * @param all      draw every stage as started, for the generic map on the canon page
 */
export function stageMap({ pipeline, records = {}, release = null, started = {}, turnedDown = {}, all = false }) {
  const has = new Set(pipeline.map((s) => s.id));
  const gate = (id) => pipeline.find((s) => s.id === id)?.gate ?? DEFAULT_GATES.has(id);
  const surfaces = surfacesOf(release);
  const anyLive = surfaces.some((s) => s.state?.live);
  const ideas = records.ideas ?? [];
  const list = {
    problem: records.problems, idea: ideas, experiment: records.experiments, plan: records.plans, feature: records.features, bug: records.bugs,
    dropped: ideas.filter((s) => s === "dropped"),
  };
  const isOn = {
    problem: list.problem?.length, idea: ideas.length, experiment: list.experiment?.length, dropped: list.dropped.length,
    plan: list.plan?.length || list.feature?.length, feature: list.feature?.length, bug: list.bug?.length, live: anyLive, ...started,
  };

  const nodes = [];
  const edges = [];
  let column = -1;
  const place = (id, lane, extra = {}) => {
    const row = column >= COLUMNS ? 1 : 0;
    const node = {
      id, ...STAGES[id], ...extra,
      x: Math.round(COLUMN * ((column % COLUMNS) + 0.5)),
      y: LANES[lane] + row * SECOND_ROW,
      lane,
      gate: gate(id) && has.has(id),
      off: !all && !(extra.on ?? isOn[id]),
    };
    if (!all && turnedDown[id]) node.rejected = turnedDown[id];
    if (!all && list[id]?.length) {
      node.n = list[id].length;
      node.unit = node.n === 1 && id !== "dropped" ? node.unit.slice(0, -1) : node.unit;
      node.counts = id === "dropped" ? [{ count: node.n, status: "ideas not taken" }] : breakdown(list[id]);
    }
    nodes.push(node);
    return node;
  };
  const link = (from, to) => { for (const a of from) edges.push({ a, b: to }); };
  /** The next column: each of `tails` leads to every stage in `step`. */
  let tails = [];
  const step = (ids, tailsFrom = tails) => {
    column += 1;
    const placed = ids.map(([id, lane, extra]) => place(id, lane, extra));
    for (const n of placed) link(tailsFrom, n);
    return placed;
  };

  if (has.has("problem")) tails = step([["problem", "mid"]]);
  if (has.has("idea")) tails = step([["idea", "mid"]]);
  if (has.has("idea")) {
    const fork = step([...(has.has("research") ? [["research", "mid"]] : []), ["experiment", "top"], ["dropped", "bottom"]]);
    tails = fork.filter((n) => n.id !== "dropped");
  } else if (has.has("research")) tails = step([["research", "mid"]]);
  if (has.has("plan")) tails = step([["plan", "mid"]]);

  const building = has.has("code");
  const design = has.has("design");
  let feature;
  if (has.has("feature")) {
    const fork = step([["feature", "top"], ...(building ? [["bug", "bottom"]] : [])]);
    feature = fork[0];
    tails = fork;
  }
  if (design) {
    const before = feature ? [feature] : tails;
    const [d] = step([["design", feature ? "top" : "mid"]], before);
    tails = feature ? [d, ...tails.filter((n) => n !== feature)] : [d];
  }
  let bypass = null;
  if (building) {
    const [code] = step([["code", "mid"]]);
    if (feature && design) bypass = { from: feature, to: code };
    tails = [code];
  }
  if (has.has("review")) tails = step([["review", "mid"]]);
  if (has.has("release")) tails = step([["release", "mid"]]);

  if (surfaces.length > 0) {
    const lanes = surfaces.length === 1 ? ["mid"] : surfaces.length === 2 ? ["top", "bottom"] : ["top", "mid", "bottom"];
    /* A product can list more surfaces than the canvas has lanes; the status lines below still name them all. */
    tails = step(surfaces.slice(0, lanes.length).map((s, i) => [`surface-${s.key}`, lanes[i], { label: s.label, icon: s.icon, tone: "ship", what: s.state?.what ?? "not started", on: Boolean(s.state) }]));
  }
  if (has.has("live") || surfaces.length > 0) tails = step([["live", "mid"]]);

  const market = has.has("marketing");
  const end = has.has("result");
  if (market || end) {
    const fork = step([...(market ? [["marketing", end ? "top" : "mid"]] : []), ...(end ? [["result", market ? "bottom" : "mid"]] : [])]);
    if (market && started.video) step([["video", fork[0].lane]], [fork[0]]);
  }

  const twoRows = column >= COLUMNS;
  const height = twoRows ? (Math.max(...nodes.map((n) => n.y)) + 90) : ONE_ROW_HEIGHT;
  return {
    width: WIDTH,
    height,
    lines: [
      ...edges.map(({ a, b }) => ({ d: edgePath(a, b), tone: b.tone, off: a.off || b.off })),
      ...(bypass ? [{ d: `M${bypass.from.x} ${bypass.from.y - 32} C${bypass.from.x} 14 ${bypass.to.x} 14 ${bypass.to.x} ${bypass.to.y - TILE_HALF}`, tone: null, off: true }] : []),
    ],
    label: bypass ? { text: "design is optional", x: Math.round((bypass.from.x + bypass.to.x) / 2), y: 24 } : null,
    nodes: nodes.map(({ x, y, lane, ...n }) => ({
      ...n,
      id: n.id,
      left: +((x / WIDTH) * 100).toFixed(2),
      top: +((y / height) * 100).toFixed(2),
      branch: lane !== "mid",
    })),
  };
}

/** The lines under the canvas: each surface's state, and what is still to come. */
export function shipStatus(release, features) {
  const surfaces = surfacesOf(release).filter((s) => s.state).map((s) => ({ name: s.label, what: s.state.what }));
  const n = (st) => features.filter((f) => f === st).length;
  const next = [n("planned") && `${n("planned")} planned`, n("building") && `${n("building")} building`, n("shelved") && `${n("shelved")} shelved`].filter(Boolean);
  return { surfaces, next, anyLive: surfacesOf(release).some((s) => s.state?.live) };
}

/**
 * `metrics/history/YYYY-MM.csv` (metric,period,value). `turned_down_<stage>` is
 * monthly, so it sums. The rest are snapshots: the newest period wins.
 */
export function historyOf(csvTexts) {
  const turnedDown = {};
  const snapshot = {};
  const period = {};
  for (const text of csvTexts) {
    for (const line of text.trim().split("\n").slice(1)) {
      const [metric, at, value] = line.split(",");
      const n = Number(value);
      if (!metric || !Number.isFinite(n)) throw new Error(`bad metrics line: ${line}`);
      if (metric.startsWith("turned_down_")) {
        const stage = metric.slice("turned_down_".length);
        turnedDown[stage] = (turnedDown[stage] ?? 0) + n;
      } else if (!period[metric] || at > period[metric]) {
        period[metric] = at;
        snapshot[metric] = n;
      }
    }
  }
  return { turnedDown, snapshot };
}
