import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

/* The three ways out are not the nav repeated. Legal is first-class here
   because the most likely way to reach a 404 on this site is a stale policy
   URL from a store listing — six shipped app builds hardcode those paths and
   installed builds never update. That reader wants a document, not a home
   page. */
const OUT = [
  { href: "/legal", label: "Legal documents", body: "Privacy, terms and deletion, for every product." },
  { href: "/products", label: "Products", body: "Every product, and how each one is paid for." },
  { href: "/work", label: "Work", body: "What I built, and what it took." },
];

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="grid flex-1 place-items-center px-gutter py-20 text-center">
        <div className="max-w-[46ch]">
          <p className="text-d1 font-bold tabular-nums text-line-strong">404</p>
          <h1 className="mt-4 text-d2 font-semibold">That page is not here.</h1>
          <p className="mt-4 text-lead text-ink-2">
            It may have moved. The legal documents never move — if you came from a store listing
            looking for a policy, it is one link away.
          </p>
          <div className="mt-9 grid gap-px overflow-hidden rounded-card border border-line bg-line text-left sm:grid-cols-3">
            {OUT.map((o) => (
              <Link key={o.href} href={o.href} className="group bg-surface p-5 transition hover:bg-muted">
                <p className="text-small font-semibold transition group-hover:text-brand-500">{o.label}</p>
                <p className="mt-1 text-xs2 text-ink-3">{o.body}</p>
              </Link>
            ))}
          </div>
          <Link href="/" className="mt-7 inline-block text-small font-medium text-brand-500 underline decoration-brand-200 underline-offset-4">
            ← Back to the start
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
