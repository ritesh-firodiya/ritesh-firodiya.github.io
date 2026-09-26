/**
 * The invariants CLAUDE.md states in prose, asserted.
 *
 * This site exists because a claim about every app decayed silently — the thing
 * that broke it lived in a different repo. A rule that is only written down
 * decays the same way, so the rules that CAN be checked from inside this repo
 * are checked here rather than trusted.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));

const productsFile = read("src/data/products.json");
const products = productsFile.products;
const media = read("src/data/media.json");
const profile = read("src/data/profile.json");

const MODELS = ["one-time", "subscription", "per-period", "free-ads", "undecided"];
const STATES = ["live", "beta", "closed", "none"];
/** live and beta are the two states that promise something installable. */
const OPEN_STATES = ["live", "beta"];

/* ── shape ──────────────────────────────────────────────────────────────── */

test("every product has the fields the pages read", () => {
  for (const p of products) {
    for (const field of ["slug", "name", "tagline", "blurb", "model", "platforms", "legal"]) {
      assert.ok(p[field] != null, `${p.slug ?? "?"} is missing ${field}`);
    }
  }
});

test("slugs are unique", () => {
  const seen = new Set();
  for (const p of products) {
    assert.ok(!seen.has(p.slug), `duplicate slug: ${p.slug}`);
    seen.add(p.slug);
  }
});

test("slugs are URL-safe, because each one is a route", () => {
  for (const p of products) {
    assert.match(p.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${p.slug} is not a clean slug`);
  }
});

test("every model is one the pages can render", () => {
  for (const p of products) {
    assert.ok(MODELS.includes(p.model), `${p.slug} has unknown model ${p.model}`);
  }
});

/* ── the availability promise ───────────────────────────────────────────── */

test("a platform that claims to be open has somewhere to go", () => {
  for (const p of products) {
    for (const [name, v] of Object.entries(p.platforms)) {
      if (!v) continue;
      assert.ok(STATES.includes(v.state), `${p.slug}.${name}: unknown state ${v.state}`);
      if (OPEN_STATES.includes(v.state)) {
        assert.ok(v.url, `${p.slug}.${name} is "${v.state}" but has no url — rule 3 says an unavailable platform renders disabled with the reason, it does not render as a dead button`);
      }
    }
  }
});

test("a platform that is not open carries a reason instead of a link", () => {
  for (const p of products) {
    for (const [name, v] of Object.entries(p.platforms)) {
      if (!v || OPEN_STATES.includes(v.state)) continue;
      assert.equal(v.url, null, `${p.slug}.${name} is "${v.state}" but still has a url`);
      assert.ok(v.note?.trim(), `${p.slug}.${name} is "${v.state}" and says nothing about why`);
    }
  }
});

test("every platform url is https and points at the store it claims", () => {
  const host = {
    android: "play.google.com",
    ios: ["apps.apple.com", "testflight.apple.com"],
  };
  for (const p of products) {
    for (const [name, v] of Object.entries(p.platforms)) {
      if (!v?.url) continue;
      const u = new URL(v.url);
      assert.equal(u.protocol, "https:", `${p.slug}.${name} is not https`);
      const want = host[name];
      if (!want) continue;
      const ok = [].concat(want).includes(u.hostname);
      assert.ok(ok, `${p.slug}.${name} points at ${u.hostname}, not ${want}`);
    }
  }
});

test("an iOS link labelled TestFlight is a TestFlight link, and an App Store one is not", () => {
  for (const p of products) {
    const ios = p.platforms.ios;
    if (!ios?.url) continue;
    const isTestFlight = new URL(ios.url).hostname === "testflight.apple.com";
    assert.equal(
      /testflight/i.test(ios.label),
      isTestFlight,
      `${p.slug}.ios is labelled "${ios.label}" but links to ${ios.url}`,
    );
    if (isTestFlight) {
      assert.equal(ios.state, "beta", `${p.slug}.ios links to TestFlight but claims state "${ios.state}"`);
    } else {
      assert.equal(ios.state, "live", `${p.slug}.ios links to the App Store but claims state "${ios.state}"`);
    }
  }
});

/* ── legal ──────────────────────────────────────────────────────────────── */

test("every legal path on this host resolves to a real file", () => {
  for (const p of products) {
    for (const kind of ["privacy", "delete"]) {
      const href = p.legal[kind];
      if (!href || href.startsWith("http")) continue;
      assert.ok(
        existsSync(join(root, "public", href)),
        `${p.slug}.legal.${kind} points at ${href}, which does not exist in public/ — both stores fetch these URLs and a 404 is grounds for an app to be pulled`,
      );
    }
  }
});

test("anything installable from a store has a privacy policy", () => {
  // Both stores require a policy at a URL they can fetch before a listing can
  // go out, so this one is not a preference.
  for (const p of products) {
    const onAStore = ["android", "ios"].some(
      (k) => p.platforms[k] && OPEN_STATES.includes(p.platforms[k].state),
    );
    if (!onAStore) continue;
    assert.ok(p.legal.privacy, `${p.slug} is installable from a store but declares no privacy policy`);
  }
});

/**
 * A reachable web product taking sign-ups needs a policy too — the stores are
 * not the only reason to have one. This is not yet true of everything, so the
 * exceptions are pinned by name with a reason rather than waved through: the
 * day a fourteenth product goes live without a policy, this fails.
 */
const WEB_WITHOUT_POLICY = new Set([
  // A demo on a Vercel preview hostname that products.json already marks for a
  // move to a real domain. It has Login and Sign Up, so it does need a policy.
  "learning-platform",
]);

test("every live web product either has a privacy policy or is a known exception", () => {
  const missing = products
    .filter((p) => p.platforms.web && OPEN_STATES.includes(p.platforms.web.state))
    .filter((p) => !p.legal.privacy)
    .map((p) => p.slug);
  const unexpected = missing.filter((s) => !WEB_WITHOUT_POLICY.has(s));
  assert.deepEqual(unexpected, [],
    `live web products with no privacy policy and no recorded reason: ${unexpected.join(", ")}`);
  const fixed = [...WEB_WITHOUT_POLICY].filter((s) => !missing.includes(s));
  assert.deepEqual(fixed, [],
    `these are listed as exceptions but now have a policy — drop them from WEB_WITHOUT_POLICY: ${fixed.join(", ")}`);
});

/* ── media ──────────────────────────────────────────────────────────────── */

test("every screenshot and icon in media.json is a file that shipped", () => {
  for (const [slug, m] of Object.entries(media.media)) {
    const srcs = [m.icon, ...(m.shots ?? []).map((s) => s.src)].filter(Boolean);
    for (const src of srcs) {
      assert.ok(existsSync(join(root, "public", src)), `${slug}: ${src} is referenced but missing`);
    }
  }
});

test("no orphan files in public/media", () => {
  const referenced = new Set();
  for (const m of Object.values(media.media)) {
    if (m.icon) referenced.add(m.icon);
    for (const s of m.shots ?? []) referenced.add(s.src);
  }
  const dir = join(root, "public", "media");
  for (const slug of readdirSync(dir)) {
    if (!statSync(join(dir, slug)).isDirectory()) continue;
    for (const f of readdirSync(join(dir, slug))) {
      const href = `/media/${slug}/${f}`;
      assert.ok(referenced.has(href), `${href} ships but nothing references it`);
    }
  }
});

/* ── freshness ──────────────────────────────────────────────────────────── */

/**
 * `bin/products` — which will re-derive each fact from the app repos and refuse
 * to emit on a disagreement — does not exist yet. Until it does, `verifiedOn`
 * is the only guarantee, and a guarantee nobody checks is not one. Thirty days
 * is the ceiling: long enough not to nag, short enough that a shipped release
 * cannot sit misdescribed for a quarter.
 */
const MAX_AGE_DAYS = 30;

test("verifiedOn is a real date, and not in the future", () => {
  assert.match(productsFile.verifiedOn, /^\d{4}-\d{2}-\d{2}$/);
  const when = new Date(`${productsFile.verifiedOn}T00:00:00Z`);
  assert.ok(!Number.isNaN(+when), "verifiedOn is not parseable");
  const todayUTC = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
  assert.ok(+when <= +todayUTC, `verifiedOn is ${productsFile.verifiedOn}, which is in the future`);
});

test(`verifiedOn is no more than ${MAX_AGE_DAYS} days old`, () => {
  const when = new Date(`${productsFile.verifiedOn}T00:00:00Z`);
  const days = Math.floor((Date.now() - +when) / 86_400_000);
  assert.ok(
    days <= MAX_AGE_DAYS,
    `products.json was last verified ${days} days ago (${productsFile.verifiedOn}). Re-check every fact against the app repos and the stores, then bump verifiedOn. A site whose whole premise is that the facts are checked must not serve facts nobody has looked at in a month.`,
  );
});

/* ── the rules that exist because they were broken once ─────────────────── */

const appFiles = (() => {
  const out = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if ([".tsx", ".ts"].includes(extname(e.name))) out.push(p);
    }
  };
  walk(join(root, "src", "app"));
  return out;
})();

test("no price figure reaches a page (CLAUDE.md rule 2b)", () => {
  // price, priceNote and tiers stay in products.json as the verified record and
  // are rendered nowhere. Reading one in JSX is the failure this catches.
  for (const f of appFiles) {
    const src = readFileSync(f, "utf8");
    for (const field of ["price", "priceNote", "tiers"]) {
      const re = new RegExp(`\\.${field}\\b`);
      assert.ok(!re.test(src), `${f.slice(root.length)} reads p.${field} — prices are not published on this site`);
    }
    assert.ok(!/₹\s?\d/.test(src), `${f.slice(root.length)} contains a rupee figure`);
  }
});

test("no studio-wide claim about ads or subscriptions (CLAUDE.md rule 1)", () => {
  const banned = [
    /no ads in (our|any of my|my) (games|apps)/i,
    /one-time purchases,? not subscriptions/i,
    /(none|no) of (my|our) apps (have|carry|show) ads/i,
    /every app is free/i,
  ];
  for (const f of appFiles) {
    const src = readFileSync(f, "utf8");
    for (const re of banned) {
      assert.ok(!re.test(src), `${f.slice(root.length)} makes a studio-wide claim matching ${re}`);
    }
  }
});

/* ── the two data files must agree ──────────────────────────────────────── */

test("profile.json does not describe an app as beta-only when products.json says it is live", () => {
  const byName = new Map(products.map((p) => [p.name.toLowerCase(), p]));
  for (const proj of profile.projects ?? []) {
    const p = byName.get((proj.name ?? "").split("—")[0].trim().toLowerCase());
    if (!p) continue;
    const iosLive = p.platforms.ios?.state === "live";
    if (iosLive) {
      assert.ok(
        !/testflight beta on ios/i.test(proj.description ?? ""),
        `profile.json still calls ${p.slug} an iOS TestFlight beta, but products.json says the App Store version is live`,
      );
    }
  }
});
