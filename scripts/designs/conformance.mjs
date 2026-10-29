/**
 * Does a design set follow the design-sets standard (a Babul set)?
 *
 * This is the publish gate. It checks what decides whether a set works once
 * it is copied onto a public host: the files are there, the shell is the
 * canonical copy, the CDNs are pinned, and the set's own scan passes. A size
 * that fails is not published and its reasons are recorded, so the product
 * page says what is missing instead of quietly dropping the section.
 *
 * The rest of the standard (routes, app-flow, copy) needs the app's source and
 * belongs to `canon check` in the product repo, not to a website's build.
 */
import { readFile, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { exists } from "./fs.mjs";

/* The canonical set: every set's `_shell/` must match its copy byte for byte
   (design-sets §13). Babul is the shell's source, not the nearest set. */
export const CANONICAL = "babul";

/** The size folders a set may have. */
export const SIZES = ["mobile", "tablet", "web", "email"];

/* Each a strict JSON file behind one assignment, and the folders beside them. */
const REQUIRED = ["babul.js", "tokens.js", "assets", "_shell"];

/* Pinned in `_shell/boot.js`: an unpinned CDN restyles every set overnight. */
const PINS = [
  { name: "tailwind", version: "3.4.17", re: /cdn\.tailwindcss\.com\/([\w.]+)/g },
  { name: "lucide", version: "0.544.0", re: /lucide@([\w.]+)/g },
];

/* scan.mjs comes from another repo. It runs in its own process with an empty
   environment, so it cannot read DESIGNS_TOKEN or the deploy keys. */
const SCAN_TIMEOUT_MS = 30_000;

/** The shell's files, name → bytes. */
export async function shellOf(designsDir) {
  const dir = join(designsDir, "_shell");
  const out = new Map();
  if (!(await exists(dir))) return out;
  for (const f of await readdir(dir)) out.set(f, await readFile(join(dir, f)));
  return out;
}

/** Run the set's own `_shell/scan.mjs <size> --json`. */
export function scanSize(designsDir, size) {
  try {
    const out = execFileSync(process.execPath, [join(designsDir, "_shell", "scan.mjs"), size, "--json"], {
      env: {},
      encoding: "utf8",
      timeout: SCAN_TIMEOUT_MS,
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { model: JSON.parse(out) };
  } catch (e) {
    const why = String(e.stderr || e.message).split("\n").find((l) => /Error/.test(l)) ?? e.message;
    return { error: `scan.mjs ${size} did not run: ${why.trim()}` };
  }
}

const trim = (a) => `${a.slice(0, 3).join("; ")}${a.length > 3 ? `; and ${a.length - 3} more` : ""}`;

/**
 * Check one set. Returns one verdict per size folder, each with every check
 * passing or not (so a page can show the whole scorecard), and the scan model
 * of each size that passed.
 */
export async function checkSet(designsDir, canonicalShell) {
  const shared = [];
  const add = (id, ok, detail) => shared.push({ id, ok, detail });

  const missing = [];
  for (const f of REQUIRED) if (!(await exists(join(designsDir, f)))) missing.push(f);
  add("files", missing.length === 0, missing.length ? `missing ${missing.join(", ")}` : "babul.js, tokens.js, assets/, _shell/");

  const shell = await shellOf(designsDir);
  const drifted = [...canonicalShell.keys()].filter((f) => !shell.get(f)?.equals(canonicalShell.get(f)));
  const extra = [...shell.keys()].filter((f) => !canonicalShell.has(f));
  add("shell", drifted.length + extra.length === 0,
    drifted.length + extra.length
      ? [drifted.length ? `${drifted.join(", ")} differ${drifted.length === 1 ? "s" : ""} from ${CANONICAL}'s _shell` : "",
         extra.length ? `${extra.join(", ")} not in ${CANONICAL}'s _shell` : ""].filter(Boolean).join("; ")
      : `byte-identical to ${CANONICAL}'s _shell`);

  const boot = shell.get("boot.js")?.toString("utf8") ?? "";
  const pinned = (p) => {
    const found = [...boot.matchAll(p.re)].map((m) => m[1]);
    return found.length > 0 && found.every((v) => v === p.version);
  };
  const unpinned = PINS.filter((p) => !pinned(p));
  add("pinned-cdns", unpinned.length === 0,
    unpinned.length
      ? `_shell/boot.js does not pin ${unpinned.map((p) => `${p.name} ${p.version}`).join(", ")}`
      : PINS.map((p) => `${p.name} ${p.version}`).join(", "));

  const sizes = {};
  const models = {};
  for (const size of SIZES) {
    if (!(await exists(join(designsDir, size)))) continue;
    const checks = [...shared];
    const hasIndex = await exists(join(designsDir, size, "index.html"));
    checks.push({ id: "journey", ok: hasIndex, detail: hasIndex ? `${size}/index.html` : `no ${size}/index.html` });

    /* Never run code from a set whose shell is not the canonical copy. */
    if (shared.every((c) => c.ok)) {
      const r = scanSize(designsDir, size);
      const errors = r.error ? [r.error] : r.model.errors ?? [];
      checks.push({ id: "scan", ok: errors.length === 0,
        detail: errors.length ? trim(errors) : `${r.model.pages.length} pages, ${r.model.components.length} components` });
      if (r.model && errors.length === 0) models[size] = r.model;
    } else {
      checks.push({ id: "scan", ok: false, detail: "not run: the set's shell is not the canonical copy" });
    }
    sizes[size] = { pass: checks.every((c) => c.ok), checks };
  }
  return { sizes, models };
}
