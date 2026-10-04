import Link from "next/link";
import type { Metadata } from "next";

/**
 * A forwarding address.
 *
 * GitHub Pages cannot answer with a 301, and Next's `redirect()` under a static
 * export only works once the page's JavaScript has run. A meta refresh works
 * for a browser with scripts off and for a crawler, and the link under it
 * works for anything else.
 *
 * A forwarding address is not a page: it is noindex, has no canonical, and is
 * left out of the sitemap.
 */
export const forwardMetadata = (to: string): Metadata => ({
  title: "Moved",
  robots: { index: false, follow: true },
  other: { "forward-to": to },
});

export function Forward({ to, why }: { to: string; why: string }) {
  return (
    <main id="main" className="wrap grid min-h-dvh place-items-center py-24 text-center">
      {/* React hoists this into <head>. */}
      <meta httpEquiv="refresh" content={`0; url=${to}`} />
      <div>
        <p className="eyebrow">Moved</p>
        <h1 className="page-title mt-4">This page has moved.</h1>
        <p className="mx-auto mt-4 max-w-[44ch] text-lead text-ink-2">{why}</p>
        <Link href={to} className="btn btn-primary mt-8">
          Go there now
        </Link>
      </div>
    </main>
  );
}
