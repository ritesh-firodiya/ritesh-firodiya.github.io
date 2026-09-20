import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Label } from "@/components/pills";
import { RULES } from "@/lib/design";

export const metadata: Metadata = {
  title: "Design",
  description:
    "Nine design rules extracted from nine design systems by noticing which arguments recurred independently — plus the screens they produced and an honest account of where the system drifted.",
};

const CARDS = [
  { href: "/design/system", title: "The system", body: "Tokens, the type scale, and the split between config and CSS that makes them un-driftable." },
  { href: "/design/gallery", title: "The screens", body: "Selected screens per product, with the reasoning that produced each one." },
  { href: "/design/drift", title: "Where it drifted", body: "Four of nine sets break the rules. Which, how, and the order they get fixed in." },
];

export default function DesignPage() {
  return (
    <>
      <SiteHeader active="/design" />
      <main id="main">
        <section className="grain relative overflow-hidden">
          <div className="mx-auto max-w-page px-gutter pb-12 pt-section">
            <Label>Design · 9 sets · 264 screens</Label>
            <h1 className="mt-4 max-w-[18ch] font-display text-d1 font-semibold">Every screen is drawn in HTML before any app code exists.</h1>
            <p className="mt-7 max-w-measure text-lead text-ink-2">
              Nine apps, each with a full design set of plain HTML and Tailwind — no React, no build
              step. A screen with no HTML file does not ship. This section is that system, the rules
              it produced, and an honest account of where it has drifted.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/design/system" className="inline-flex items-center gap-2 rounded-pill bg-ink px-5 py-3 text-body font-medium text-ink-inv transition hover:bg-accent">The system →</Link>
              <Link href="/design/gallery" className="inline-flex items-center gap-2 rounded-pill border border-line-2 px-5 py-3 text-body font-medium transition hover:border-accent hover:text-accent">The screens</Link>
              <Link href="/design/drift" className="inline-flex items-center gap-2 rounded-pill border border-line-2 px-5 py-3 text-body font-medium transition hover:border-accent hover:text-accent">Where it drifted</Link>
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-paper-2">
          <div className="mx-auto max-w-page px-gutter py-section">
            <Label>The rules</Label>
            <h2 className="mt-3 max-w-[24ch] font-display text-d2 font-semibold">Nine rules, none of them invented on purpose.</h2>
            <p className="mt-5 max-w-prose text-body text-ink-2">
              Each was found by reading nine design systems written months apart and noticing which
              arguments kept being made independently. A rule one app follows is a preference. A rule
              six apps arrived at separately is a finding.
            </p>
            <ol className="mt-12 grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-2">
              {RULES.map((r) => (
                <li key={r.n} className={`bg-surface p-7 ${"wide" in r && r.wide ? "md:col-span-2" : ""}`}>
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-h2 font-semibold text-accent">{r.n}</span>
                    <h3 className="font-display text-h3 font-semibold">{r.title}</h3>
                  </div>
                  <p className="mt-3 max-w-prose text-small text-ink-2">{r.body}</p>
                  <p className="mt-3 font-mono text-xs2 text-ink-3">{r.found}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-page px-gutter py-section">
          <div className="grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-3">
            {CARDS.map((c) => (
              <Link key={c.href} href={c.href} className="group bg-surface p-7 transition hover:bg-paper-2">
                <h3 className="font-display text-h3 font-semibold group-hover:text-accent">{c.title}</h3>
                <p className="mt-2 text-small text-ink-2">{c.body}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
