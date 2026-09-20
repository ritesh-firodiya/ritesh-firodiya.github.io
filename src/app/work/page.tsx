import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Label } from "@/components/pills";
import { profile, otherProjects, appProjects, STATUS_TOKEN } from "@/lib/profile";

export const metadata: Metadata = {
  title: "Work",
  description: "Everything I have built — platforms, tools and client-scale systems. The consumer apps live on the products page, with prices.",
};

export default function WorkPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="grain relative overflow-hidden">
          <div className="mx-auto max-w-page px-gutter pb-10 pt-section">
            <Label>Work · {profile.projects.length} projects</Label>
            <h1 className="mt-4 max-w-[18ch] font-display text-d1 font-semibold">Everything I have built.</h1>
            <p className="mt-7 max-w-measure text-lead text-ink-2">
              Labelled by how real each one is, not by how good the idea sounds. {appProjects.length} are
              consumer apps and{" "}
              <Link href="/products" className="link-u font-medium text-accent">carry a price on the products page</Link>;
              the rest are platforms and tools.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-page px-gutter pb-section">
          <div className="rule-fade mb-10" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {otherProjects.map((p) => {
              const t = STATUS_TOKEN(p.status);
              return (
                <article key={p.name} className="flex flex-col overflow-hidden rounded-card border border-line bg-surface p-5 shadow-lift">
                  <span className={`inline-block w-fit rounded-pill px-2 py-0.5 font-mono text-label uppercase tracking-label ${t.bg} ${t.fg}`}>
                    {p.status}
                  </span>
                  <h2 className="mt-3 font-display text-h3 font-semibold">{p.name}</h2>
                  <p className="mt-1 font-display text-small italic text-ink-2">{p.tagline}</p>
                  <p className="mt-3 text-small text-ink-2">{p.description}</p>
                  <p className="mt-auto pt-4 font-mono text-xs2 text-ink-3">{p.stack.join(" · ")}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <p className="max-w-prose border-l-2 border-line-2 pl-5 text-small text-ink-2">
              Most of these are closed-source while they are commercial. Where there is a public
              artifact — a store listing, a live URL — it is linked from the product page. Happy to
              walk through architecture and code in a call.
            </p>
            <div className="rounded-card border border-line bg-paper-2 p-6">
              <Label>The apps are elsewhere</Label>
              <p className="mt-3 text-small text-ink-2">
                Consumer apps have prices, ad surfaces and store states, so they get their own page
                each rather than a card here.
              </p>
              <Link href="/products" className="mt-4 inline-flex items-center gap-2 rounded-pill bg-ink px-4 py-2 text-small font-medium text-ink-inv transition hover:bg-accent">
                All {appProjects.length} apps, with prices →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
