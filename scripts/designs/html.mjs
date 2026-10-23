/** What a wiki page may carry into this site's HTML. */

export const escapeHtml = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** A link this site can honour: another site, an email, an anchor, or a path
 *  on this host. `//host` is another site wearing a path's clothes. */
export const isSafeHref = (href) => /^(https?:|mailto:|#)/i.test(href) || (href.startsWith("/") && !href.startsWith("//"));
