/**
 * What of a product's architecture page reaches this public host: everything but
 * its risk notes (owner's choice, 2026-10-31). Costs, failures, flows and open
 * questions are published. A note that names a weakness someone could use is not.
 *
 * Fields are an allow-list, so one added to the format later stays private until
 * someone chooses to publish it. Risk notes are found by their label and by the
 * words a weakness is described with; a false match only hides a line.
 */
const RISK_WORDS = /risk|looks wrong|secur|unencrypt|plain ?text|password|credential|secret|token|cookie|\bkeys?\b|\.env|\bleak|attack|abuse|ssrf|bypass|not enforced|app check|app attest|take over|anyone (can|could|who)|any url|rate limit|limited to \d|no (rate )?limit|no byte cap|no size limit|content-length|fixed (otp|code)|123456|swallow|privacy policy|personalised|child|row rules|kms|deletion|deleted|status 40\d|to the log|in the log|gets the code|\bstub|failed account payment|org billing|billing\b.*refus/i;

const isRisk = (text) => RISK_WORDS.test(text ?? "");
const pick = (from, keys) => Object.fromEntries(keys.filter((k) => from?.[k] !== undefined).map((k) => [k, from[k]]));
const sourced = (from, keys) => {
  const kept = pick(from, [...keys, "basis", "source"]);
  if (keys.some((k) => isRisk(kept[k]))) return null;
  if (isRisk(kept.source)) delete kept.source;
  return kept;
};

export function publicArchitecture(a) {
  const flows = (a.flows ?? []).map((f) => ({ ...pick(f, ["name", "cost", "path"]), ...(isRisk(f.note) ? {} : pick(f, ["note"])), steps: (f.steps ?? []).filter((s) => !isRisk(s)) }));
  const parts = (a.parts ?? []).map((p) => {
    const cost = p.cost && sourced(p.cost, ["today", "grows"]);
    const ifDown = p.ifDown && sourced(p.ifDown, ["user", "data"]);
    return { ...pick(p, ["id", "area", "label", "price"]), does: isRisk(p.does) ? "" : p.does, ...(cost ? { cost } : {}), ...(ifDown ? { ifDown } : {}) };
  });
  if (!parts.length) return null;
  return {
    ...pick(a, ["verified", "growth"]),
    summary: isRisk(a.summary) ? "" : a.summary,
    headlines: (a.headlines ?? []).filter((h) => !isRisk(h.label) && !isRisk(h.value) && !isRisk(h.note)),
    areas: (a.areas ?? []).map((area) => pick(area, ["id", "label"])),
    parts,
    flows,
    data: (a.data ?? []).filter((d) => !isRisk(d.what) && !isRisk(d.where)),
    unknowns: (a.unknowns ?? []).filter((u) => !isRisk(u)),
  };
}

/**
 * The page a published design set's Architecture item opens. Canon's shell links to
 * architecture.html beside the set, which only `canon ui` serves, so this host
 * publishes one that forwards to the product's own public page.
 */
export function architectureRedirect(slug) {
  const href = `/products/${slug}/architecture/`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Architecture</title><link rel="canonical" href="${href}"><meta http-equiv="refresh" content="0; url=${href}"></head><body><a href="${href}">Architecture</a></body></html>\n`;
}
