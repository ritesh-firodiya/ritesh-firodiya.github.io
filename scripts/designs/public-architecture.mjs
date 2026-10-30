/**
 * What of a product's architecture page may reach this public host: the names of
 * its parts and the path of each thing a user does. Nothing else leaves the repo.
 *
 * The rest of the file is written for the owner: costs, what breaks, weaknesses
 * still open and what is not known. Parts on no path are left out too, because
 * they are in the file for their cost. This is an allow-list so a field added to
 * the format later stays private until someone chooses to publish it.
 */
export function publicArchitecture(architecture) {
  const flows = (architecture.flows ?? []).map(({ name, path }) => ({ name, path }));
  const onAPath = new Set(flows.flatMap((flow) => flow.path));
  const parts = (architecture.parts ?? [])
    .filter((part) => onAPath.has(part.id))
    .map(({ id, area, label }) => ({ id, area, label }));
  const used = new Set(parts.map((part) => part.area));
  const areas = (architecture.areas ?? []).filter((area) => used.has(area.id)).map(({ id, label }) => ({ id, label }));
  return parts.length ? { areas, parts, flows } : null;
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
