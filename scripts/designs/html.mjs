/** What a wiki page may carry into this site's HTML. */

export const escapeHtml = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** A link this site can honour: another site, an email, an anchor, or a path
 *  on this host. `//host` is another site wearing a path's clothes. */
export const isSafeHref = (href) => /^(https?:|mailto:|#)/i.test(href) || (href.startsWith("/") && !href.startsWith("//"));

/** The page a relative Markdown link names inside one wiki — `x.md`,
 *  `concepts/x.md` or `../decisions/x.md` — or null. Anything that climbs
 *  further points outside the wiki, at a file this site does not have. */
export const wikiSlugOf = (href) => /^(?:\.\.\/)?(?:[a-z]+\/)?([a-z0-9-]+)\.md(?:#.*)?$/.exec(href)?.[1] ?? null;
