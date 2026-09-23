import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Label } from "@/components/pills";
import { profile } from "@/lib/profile";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "About",
  description:
    "Full-stack engineer and lead, ~9 years. Postgres schema to Play Store release. Pune, India.",
  alternates: { canonical: "/about" },
};

export default function About() {
  const live = products.filter((p) =>
    Object.values(p.platforms).some((v) => v && v.state === "live"),
  ).length;

  return (
    <>
      <SiteHeader active="/about" cta={{ href: "/resume", label: "Résumé" }} />
      <main id="main">
        <section className="grain relative overflow-hidden border-b border-line">
          <div className="mx-auto max-w-page px-gutter py-14">
            <Label>About</Label>
            <h1 className="mt-3 max-w-[22ch] text-d1 font-semibold">
              Postgres schema to Play Store release.
            </h1>
            <div className="mt-8 flex flex-wrap items-start gap-10 lg:gap-14">
              <div className="max-w-prose space-y-4 text-body text-ink-2">
                {profile.about.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
                <p>
                  {products.length} products built solo — {live} usable today — and agent tooling
                  on the Anthropic SDK and MCP. Building alone is what taught me to write the
                  design set before the code: a component that appears in no HTML file does not
                  ship.
                </p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/me.webp"
                alt={profile.name}
                width={176}
                height={176}
                className="h-44 w-44 shrink-0 rounded-card border border-line object-cover"
              />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/resume" className="rounded-pill bg-ink px-5 py-2.5 text-small font-medium text-ink-inverse transition hover:bg-brand-500">
                Read the résumé
              </Link>
              <Link href="/contact" className="rounded-pill border border-line-strong px-5 py-2.5 text-small font-medium transition hover:border-brand-500 hover:text-brand-500">
                Get in touch
              </Link>
            </div>
          </div>
        </section>

        {/* The full history lives here, not on the landing page — eight rows
            there would turn Home into a CV. */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-page px-gutter py-12">
            <Label>Experience</Label>
            <h2 className="mt-2 text-d2 font-semibold">Nine years, mostly end-to-end.</h2>
            <ol className="mt-8 border-t border-line">
              {profile.experiences.map((e) => (
                <li key={`${e.company}-${e.from}`} className="grid gap-1 border-b border-line py-5 md:grid-cols-[11rem_1fr] md:items-baseline md:gap-8">
                  <p className="font-mono text-label uppercase tracking-label text-ink-3">
                    {e.from} — {e.to}
                  </p>
                  <div>
                    <h3 className="text-h3 font-semibold">
                      {e.position} · <span className="text-brand-500">{e.company}</span>
                    </h3>
                    <p className="mt-1 max-w-prose text-small text-ink-2">{e.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Groups with the real tools in each, not a wall of logos. A tag
            cloud says nothing about depth and survives no reader who knows
            the domain. */}
        <section className="mx-auto max-w-page px-gutter py-12">
          <Label>What I work in</Label>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(profile.skills).map(([group, items]) => (
              <div key={group}>
                <p className="font-mono text-label uppercase tracking-label text-ink-3">{group}</p>
                <p className="mt-2 text-small text-ink-2">{items.join(" · ")}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
