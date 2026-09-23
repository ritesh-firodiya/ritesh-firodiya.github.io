import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Label } from "@/components/pills";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Legal",
  description: "Privacy policies and account-deletion pages for every app, in one place.",
};

const withLegal = products.filter((p) => p.legal.privacy || p.legal.delete);

export default function LegalPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="mx-auto max-w-page px-gutter pb-10 pt-section">
          <Label>Legal</Label>
          <h1 className="mt-4 max-w-[20ch] font-display text-d1 font-semibold">Every policy, for every product, at a URL that will not move.</h1>
          <p className="mt-7 max-w-measure text-lead text-ink-2">
            Both stores require a privacy policy at a URL they can fetch, and an account-deletion
            page a reviewer can open without signing in. These are those pages.
          </p>
        </section>

        <section className="mx-auto max-w-page px-gutter">
          <div className="tbl-wrap overflow-hidden rounded-card border border-line bg-surface shadow-lift">
            <div className="tbl-scroll">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-line bg-muted">
                    <th scope="col" className="tbl-stick bg-muted px-4 py-3.5 font-mono text-label uppercase tracking-label text-ink-3">App</th>
                    <th scope="col" className="px-4 py-3.5 font-mono text-label uppercase tracking-label text-ink-3">Documents</th>
                  </tr>
                </thead>
                <tbody className="text-small">
                  {withLegal.map((p) => (
                    <tr key={p.slug} className="border-b border-line last:border-0">
                      <th scope="row" className="tbl-stick px-4 py-4 text-left font-display text-h3 font-semibold">
                        <Link href={`/products/${p.slug}/`} className="link-u hover:text-brand-500">{p.name}</Link>
                      </th>
                      <td className="px-4 py-4">
                        {p.legal.privacy && <Link href={p.legal.privacy} className="link-u text-brand-500">Privacy</Link>}
                        {p.legal.privacy && p.legal.delete && <span className="text-ink-3"> · </span>}
                        {p.legal.delete && <Link href={p.legal.delete} className="link-u text-brand-500">Delete account</Link>}
                        {p.legal.privacyNote && <span className="mt-1 block text-xs2 text-ink-3">{p.legal.privacyNote}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-10 grid gap-6 pb-section lg:grid-cols-2">
            <div className="rounded-card border border-line bg-surface p-7">
              <Label>Why one copy</Label>
              <p className="mt-4 text-small text-ink-2">
                Each document exists once, so there is one place to fix a mistake. The one exception
                is Chitragupt, whose policy is a real page of its own product rather than a copy —
                only its deletion page lives here, because a store reviewer must be able to open it
                without signing in.
              </p>
            </div>
            <div className="rounded-card border border-line bg-surface p-7">
              <Label>Old links still work</Label>
              <p className="mt-4 text-small text-ink-2">
                These documents used to live on ritvi-apps.github.io, and those URLs are hardcoded
                inside shipped app builds that will never update — an install from a year ago still
                asks for the old address. So every old URL still resolves and redirects here, and
                that redirect is permanent infrastructure rather than a transition step. Deleting it
                would 404 a privacy policy that two live store listings point at.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
