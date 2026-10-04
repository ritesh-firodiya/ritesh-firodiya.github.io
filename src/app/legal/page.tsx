import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Legal",
  description: "Privacy policies, account-deletion pages and terms for every app, at addresses that do not move.",
  alternates: { canonical: "/legal/" },
};

const withLegal = products.filter((p) => p.legal.privacy || p.legal.delete).sort((a, b) => a.name.localeCompare(b.name));
const onThisHost = (href: string) => !href.startsWith("http");

/* A table, because the reader is a store reviewer or a user looking for one
   document. Nobody browses this page. The documents themselves are static
   files in public/legal/ whose paths are hardcoded in shipped builds. */
export default function LegalPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap pb-12 pt-8 lg:pt-10">
        <p className="eyebrow">Legal</p>
        <h1 className="page-title mt-3">Privacy and legal documents.</h1>
        <p className="mt-4 max-w-[60ch] text-lead text-ink-2">One row per app. These addresses do not move.</p>
        <div className="card mt-8 overflow-hidden">
          <table className="tbl">
            <thead>
              <tr>
                <th scope="col" className="w-[30%]">App</th>
                <th scope="col">Documents</th>
              </tr>
            </thead>
            <tbody>
              {withLegal.map((p) => (
                <tr key={p.slug}>
                  <td className="font-semibold">
                    <Link href={`/products/${p.slug}/`} className="hover:text-brand-500">{p.name}</Link>
                  </td>
                  <td>
                    {p.legal.privacy && (
                      <a href={p.legal.privacy} className="text-link">
                        {onThisHost(p.legal.privacy) ? "Privacy policy" : `Privacy policy on ${new URL(p.legal.privacy).hostname}`}
                      </a>
                    )}
                    {p.legal.privacy && p.legal.delete && " · "}
                    {p.legal.delete && <a href={p.legal.delete} className="text-link">Delete account</a>}
                    {p.legal.privacyNote && <span className="mt-1 block text-xs text-ink-3">{p.legal.privacyNote}</span>}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="font-semibold">All apps</td>
                <td>
                  <a href="/legal/terms.html" className="text-link">Terms of use</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-6 max-w-[70ch] text-sm text-ink-3">
          Older links on ritvi-apps.github.io still work and redirect here. Questions about any of these:{" "}
          <Link href="/support/" className="text-link">Support</Link>.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
