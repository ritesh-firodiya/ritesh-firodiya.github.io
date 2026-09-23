import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Label } from "@/components/pills";
import { CASE_STUDIES } from "@/lib/case-studies";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Long-form writeups: what the problem was, what was tried, what lost, and what shipped.",
  alternates: { canonical: "/work" },
};

/* This page exists because the case study was orphaned. /work/chitragupt was
   linked from exactly one place — the bottom of one product page — with no
   index and no mention in the nav, so the strongest asset for both recruiters
   and clients was effectively hidden. */
export default function Work() {
  const written = new Set(CASE_STUDIES.map((c) => c.slug));
  const shippedWithoutStudy = products.filter(
    (p) => !p.notBuilt && !written.has(p.slug) && Object.values(p.platforms).some((v) => v && (v.state === "live" || v.state === "beta")),
  );

  return (
    <>
      <SiteHeader active="/work" />
      <main id="main">
        <section className="border-b border-line">
          <div className="mx-auto max-w-page px-gutter py-14">
            <Label>Work</Label>
            <h1 className="mt-3 max-w-[22ch] text-d1 font-semibold">
              What I built, and what it actually took.
            </h1>
            <p className="mt-5 max-w-measure text-lead text-ink-2">
              Long-form, one per product. Not a gallery — what the problem was, what was tried,
              what lost, and what shipped.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-page px-gutter py-12">
          <div className="space-y-6">
            {CASE_STUDIES.map((c) => (
              <Link
                key={c.slug}
                href={`/work/${c.slug}/`}
                className="group grid gap-8 rounded-card border border-line bg-surface p-7 transition hover:border-brand-200 lg:grid-cols-[1.4fr_1fr] lg:p-8"
              >
                <div>
                  <Label>
                    Case study · {c.period}
                  </Label>
                  <h2 className="mt-3 max-w-[26ch] text-d2 font-semibold transition group-hover:text-brand-500">
                    {c.title}
                  </h2>
                  <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-5">
                    {c.facts.map((f) => (
                      <div key={f.k}>
                        <dt className="font-mono text-label uppercase tracking-label text-ink-3">{f.k}</dt>
                        <dd className="mt-1 max-w-[28ch] text-small font-medium">{f.v}</dd>
                      </div>
                    ))}
                  </dl>
                  <span className="mt-6 inline-block text-small font-medium text-brand-500">Read it →</span>
                </div>
                <div className="slot hidden rounded lg:block" aria-hidden />
              </Link>
            ))}
          </div>

          {/* The gap is stated rather than padded. A thin case study damages
              the one that says something. */}
          {shippedWithoutStudy.length > 0 && (
            <div className="mt-8 rounded-card border border-dashed border-line-strong p-8">
              <Label>
                {CASE_STUDIES.length === 1 ? "One written so far" : `${CASE_STUDIES.length} written so far`}
              </Label>
              <p className="mt-2 max-w-prose text-small text-ink-2">
                {shippedWithoutStudy.map((p) => p.name).join(", ")}{" "}
                {shippedWithoutStudy.length === 1 ? "is" : "are"} shipping and{" "}
                {shippedWithoutStudy.length === 1 ? "has" : "have"} no writeup yet. Listed under{" "}
                <Link href="/products" className="text-brand-500 underline decoration-brand-200 underline-offset-4">
                  Products
                </Link>{" "}
                with their facts until one is written.
              </p>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
