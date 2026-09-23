import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { ModelPill, StatePill, Label } from "@/components/pills";
import { products, shipped, mediaFor } from "@/lib/products";
import { profile } from "@/lib/profile";

const DOORS = [
  { kicker: "You are hiring", title: "Read the résumé", body: "Senior / staff IC and tech-lead. Full history, on the web or as a PDF.", href: "/resume", cta: "Résumé" },
  { kicker: "You need it built", title: "Work with me", body: "MVP from zero, a team to lead, or AI tooling on Anthropic SDK + MCP.", href: "/hire", cta: "What I take on" },
  { kicker: "You are curious", title: "See the products", body: "Thirteen products — how each is paid for, what it shows you, what it measures.", href: "/products", cta: "Products" },
];

// The first three of products.json, named rather than sliced so a reorder of
// the file cannot silently promote something with no screenshot to the top.
const FEATURED = ["chitragupt", "askcal", "aakalan"];
const LOGOS = ["Walmart", "Swiggy", "Globant", "Speechify", "Masai", "TopLegal"];

export default function Home() {
  const featured = FEATURED.map((s) => products.find((p) => p.slug === s)!).filter(Boolean);
  // Two different numbers that were previously one. "Live" counts anything
  // open to the public including the web products; "on Google Play" must mean
  // the Play listing specifically, or it is a claim the store does not support.
  const live = products.filter((p) =>
    Object.values(p.platforms).some((v) => v && v.state === "live"),
  ).length;
  const onPlay = products.filter((p) => p.platforms.android?.state === "live").length;
  const apps = products.filter((p) => p.kind === "app").length;

  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* ══ hero ══ A face, a claim, and two things to press. The old hero
            was three stacked paragraphs and no way out of it except scrolling —
            the two people this page is for (hiring, or needing something built)
            both had to read to the second band before they were offered
            anything. */}
        <section className="grain relative overflow-hidden">
          <div className="mx-auto grid max-w-page items-center gap-10 px-gutter pb-12 pt-section lg:grid-cols-[1fr_auto] lg:gap-16">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-pill border border-live/25 bg-live-wash px-3 py-1 font-mono text-label uppercase tracking-label text-live">
                <span className="h-1.5 w-1.5 rounded-pill bg-live" /> Open to senior &amp; staff roles · and consulting
              </p>
              <h1 className="mt-5 max-w-[16ch] font-display text-d1 font-semibold">{profile.headline}</h1>
              <p className="mt-5 max-w-measure text-lead text-ink-2">
                Nine years of production TypeScript across web, mobile and backend — Walmart, Swiggy,
                Globant, Speechify. Now building{" "}
                <b className="font-semibold text-ink">{products.length} products for India</b> —
                {" "}{apps} of them apps, {onPlay} on Google Play — plus agent tooling on the
                Anthropic SDK.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="/resume" className="inline-flex items-center gap-2 rounded-pill bg-ink px-5 py-2.5 text-small font-medium text-ink-inverse transition hover:bg-brand-500">
                  Read the résumé
                </Link>
                <Link href="/hire" className="inline-flex items-center gap-2 rounded-pill border border-line-strong bg-surface px-5 py-2.5 text-small font-medium transition hover:border-brand-500 hover:text-brand-500">
                  Work with me
                </Link>
                <a href={`mailto:${profile.email}`} className="link-u text-small font-medium text-ink-3 hover:text-brand-500">
                  {profile.email}
                </a>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-xs2 uppercase tracking-label text-ink-3">
                <span>{profile.location}</span>
                <span>~9 years shipping</span>
                <span>{products.length} products · {apps} apps</span>
                <span>{live} usable today</span>
              </div>
            </div>

            {/* Not decoration: a portfolio is a person, and the face is the
                fastest way to say which one. Square and small enough that it
                never outranks the claim beside it. */}
            <div className="order-first shrink-0 lg:order-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/me.webp"
                alt={profile.name}
                width={208}
                height={208}
                className="h-40 w-40 rounded-card border border-line object-cover shadow-lift sm:h-52 sm:w-52"
              />
            </div>
          </div>
        </section>

        {/* ══ the three doors ══ Three readers land here and each wants a
            different thing. Naming them costs one band and removes the guessing
            the old sidebar forced. */}
        <section className="border-y border-line bg-muted">
          <div className="mx-auto grid max-w-page gap-px bg-line sm:grid-cols-3">
            {DOORS.map((d) => (
              <Link key={d.href} href={d.href} className="group bg-muted px-gutter py-9 transition hover:bg-surface">
                <Label>{d.kicker}</Label>
                <h2 className="mt-3 font-display text-h3 font-semibold text-ink">{d.title}</h2>
                <p className="mt-2 max-w-[34ch] text-small text-ink-2">{d.body}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-small font-medium text-brand-500">
                  {d.cta} <span className="transition group-hover:translate-x-1">→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-b border-line bg-page">
          <div className="mx-auto flex max-w-page flex-wrap items-center gap-x-10 gap-y-4 px-gutter py-7">
            <Label>Shipped for</Label>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 font-display text-h3 font-medium text-ink-2">
              {LOGOS.map((l) => <span key={l}>{l}</span>)}
            </div>
          </div>
        </section>

        {/* ══ featured products ══ Every card carries its model. A picture is
            the entry fee for the top of this band. */}
        <section id="products" className="mx-auto max-w-page scroll-mt-20 px-gutter pt-section">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Label>Products</Label>
              <h2 className="mt-3 max-w-[20ch] font-display text-d2 font-semibold">Things I built and put in front of people.</h2>
            </div>
            <Link href="/products" className="link-u inline-flex items-center gap-1.5 pb-1 text-small font-medium text-brand-500">
              All {products.length} products →
            </Link>
          </div>
          <div className="rule-fade mt-8" />

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {featured.map((p) => (
              <article key={p.slug} className="flex flex-col">
                {(() => {
                  const m = mediaFor(p.slug);
                  return m.shots[0] ? (
                    <div className="flex h-[320px] items-center justify-center overflow-hidden rounded-card border border-line bg-muted p-5">
                      {m.kind === "web" ? (
                        <div className="browser w-full">
                          <div className="browser-bar"><span className="browser-dot" /><span className="browser-dot" /><span className="browser-dot" /></div>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={m.shots[0].src} alt={`${p.name} — ${m.shots[0].label}`} loading="lazy" className="block w-full" />
                        </div>
                      ) : (
                        <div className="device w-[150px]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={m.shots[0].src} alt={`${p.name} — ${m.shots[0].label}`} loading="lazy" className="device-screen w-full" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="shot-ph flex h-[320px] items-center justify-center rounded-card border border-line">
                      <p className="px-6 font-mono text-xs2 uppercase tracking-label text-ink-3">No screenshot yet · {p.name}</p>
                    </div>
                  );
                })()}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <ModelPill model={p.model} />
                  {Object.entries(p.platforms)
                    .filter(([, v]) => v && v.state === "live")
                    .slice(0, 1)
                    .map(([k, v]) => <StatePill key={k} state={v!.state}>Live</StatePill>)}
                </div>
                <h3 className="mt-3 font-display text-h2 font-semibold">{p.name}</h3>
                <p className="mt-1 font-display text-small italic text-ink-2">{p.tagline}</p>
                <p className="mt-3 text-small text-ink-2">{p.blurb}</p>
                <Link href={`/products/${p.slug}/`} className="link-u mt-auto inline-flex items-center gap-1.5 pt-5 text-small font-medium text-brand-500">
                  How it is paid for →
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-section">
            <div className="rule-fade mb-8" />
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-display text-h2 font-semibold">The rest, honestly labelled</h3>
              <p className="font-mono text-xs2 text-ink-3">Full comparison on the products page</p>
            </div>
            <div className="mt-7 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {shipped.filter((p) => !FEATURED.includes(p.slug)).map((p) => (
                <Link key={p.slug} href={`/products/${p.slug}/`} className="group bg-surface p-5 transition hover:bg-muted">
                  <ModelPill model={p.model} />
                  <h4 className="mt-3 font-display text-h3 font-semibold group-hover:text-brand-500">{p.name}</h4>
                  <p className="mt-1.5 text-small text-ink-2">{p.blurb}</p>
                  <p className="mt-3 font-mono text-xs2 text-ink-3">{p.stack.slice(0, 4).join(" · ")}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══ experience ══ */}
        <section id="experience" className="mt-section scroll-mt-20 border-y border-line bg-muted">
          <div className="mx-auto max-w-page px-gutter py-section">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Label>Experience</Label>
                <h2 className="mt-3 max-w-[22ch] font-display text-d2 font-semibold">Nine years, mostly end-to-end.</h2>
              </div>
              <Link href="/resume" className="link-u inline-flex items-center gap-1.5 pb-1 text-small font-medium text-brand-500">Full résumé →</Link>
            </div>
            <ol className="mt-10 border-t border-line">
              {profile.experiences.map((e) => (
                <li key={e.company} className="grid gap-1 border-b border-line py-5 md:grid-cols-[11rem_1fr] md:items-baseline md:gap-6">
                  <p className="font-mono text-xs2 uppercase tracking-label text-ink-3">{e.from} — {e.to}</p>
                  <div>
                    <h3 className="font-display text-h3 font-semibold">
                      {e.position} · <span className="text-brand-500">{e.company}</span>
                    </h3>
                    <p className="mt-1 max-w-prose text-small text-ink-2">{e.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ══ about ══ */}
        <section id="about" className="mx-auto max-w-page scroll-mt-20 px-gutter py-section">
          <Label>About</Label>
          <h2 className="mt-3 max-w-[20ch] font-display text-d2 font-semibold">Postgres schema to Play Store release.</h2>
          <div className="mt-7 max-w-prose space-y-5 text-body text-ink-2">
            {profile.about.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(profile.skills).map(([group, items]) => (
              <div key={group}>
                <Label>{group}</Label>
                <p className="mt-2 text-small text-ink-2">{items.join(" · ")}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ contact ══ */}
        <section id="contact" className="scroll-mt-20 border-t border-line bg-ink text-ink-inverse">
          <div className="mx-auto max-w-page px-gutter py-section">
            <p className="font-mono text-label uppercase tracking-label text-ink-inverse/55">Contact</p>
            <h2 className="mt-4 max-w-[18ch] font-display text-d2 font-semibold">Hiring, building, or just want to argue about tooling?</h2>
            <p className="mt-5 max-w-measure text-lead text-ink-inverse/70">{profile.currently}</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 rounded-pill bg-page px-5 py-3 text-body font-medium text-ink transition hover:bg-brand-500 hover:text-ink-inverse">
                {profile.email}
              </a>
              <Link href="/resume" className="inline-flex items-center gap-2 rounded-pill border border-ink-inverse/25 px-5 py-3 text-body font-medium text-ink-inverse transition hover:border-ink-inverse">Résumé</Link>
              <Link href="/hire" className="inline-flex items-center gap-2 rounded-pill border border-ink-inverse/25 px-5 py-3 text-body font-medium text-ink-inverse transition hover:border-ink-inverse">Work with me</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
