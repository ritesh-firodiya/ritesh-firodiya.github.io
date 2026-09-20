import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { ModelPill, StatePill, Label } from "@/components/pills";
import { products, shipped, mediaFor } from "@/lib/products";
import { profile } from "@/lib/profile";

const DOORS = [
  { kicker: "You are hiring", title: "Read the résumé", body: "Senior / staff IC and tech-lead. Full history, on the web or as a PDF.", href: "/resume", cta: "Résumé" },
  { kicker: "You need it built", title: "Work with me", body: "MVP from zero, a team to lead, or AI tooling on Anthropic SDK + MCP.", href: "/hire", cta: "What I take on" },
  { kicker: "You are curious", title: "See the products", body: "Eight apps, and exactly what each one costs before you install it.", href: "/products", cta: "Products" },
];

const FEATURED = ["charades", "tic-tac-toe", "chitragupt"];
const LOGOS = ["Walmart", "Swiggy", "Globant", "Speechify", "Masai", "TopLegal"];

export default function Home() {
  const featured = FEATURED.map((s) => products.find((p) => p.slug === s)!).filter(Boolean);
  const live = products.filter((p) =>
    Object.values(p.platforms).some((v) => v && v.state === "live"),
  ).length;

  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* ══ hero ══ */}
        <section className="grain relative overflow-hidden">
          <div className="mx-auto max-w-page px-gutter pb-14 pt-section">
            <p className="inline-flex items-center gap-2 rounded-pill border border-live/25 bg-live-wash px-3 py-1 font-mono text-label uppercase tracking-label text-live">
              <span className="h-1.5 w-1.5 rounded-pill bg-live" /> Open to senior &amp; staff roles · and consulting
            </p>
            <h1 className="mt-7 max-w-[16ch] font-display text-d1 font-semibold">{profile.headline}</h1>
            <p className="mt-7 max-w-measure text-lead text-ink-2">
              Nine years of production TypeScript across web, mobile and backend — Walmart, Swiggy,
              Globant, Speechify. Now building{" "}
              <b className="font-semibold text-ink">{profile.projects.length} products for India</b> —
              {" "}{products.length} of them apps, {live} live on the Play Store — plus agent tooling
              on the Anthropic SDK.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-xs2 uppercase tracking-label text-ink-3">
              <span>{profile.location}</span>
              <span>~9 years shipping</span>
              <span>{products.length} apps</span>
              <span>{live} on Google Play</span>
            </div>
          </div>
        </section>

        {/* ══ the three doors ══ Three readers land here and each wants a
            different thing. Naming them costs one band and removes the guessing
            the old sidebar forced. */}
        <section className="border-y border-line bg-paper-2">
          <div className="mx-auto grid max-w-page gap-px bg-line sm:grid-cols-3">
            {DOORS.map((d) => (
              <Link key={d.href} href={d.href} className="group bg-paper-2 px-gutter py-9 transition hover:bg-surface">
                <Label>{d.kicker}</Label>
                <h2 className="mt-3 font-display text-h3 font-semibold text-ink">{d.title}</h2>
                <p className="mt-2 max-w-[34ch] text-small text-ink-2">{d.body}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-small font-medium text-accent">
                  {d.cta} <span className="transition group-hover:translate-x-1">→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-b border-line bg-paper">
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
            <Link href="/products" className="link-u inline-flex items-center gap-1.5 pb-1 text-small font-medium text-accent">
              All {products.length} apps, with prices →
            </Link>
          </div>
          <div className="rule-fade mt-8" />

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {featured.map((p) => (
              <article key={p.slug} className="flex flex-col">
                {(() => {
                  const m = mediaFor(p.slug);
                  return m.shots[0] ? (
                    <div className="flex h-[320px] items-center justify-center overflow-hidden rounded-card border border-line bg-paper-2 p-5">
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
                {p.price && <p className="nums mt-3 text-small font-medium">{p.price}<span className="font-normal text-ink-3"> · {p.priceNote}</span></p>}
                <Link href={`/products/${p.slug}/`} className="link-u mt-auto inline-flex items-center gap-1.5 pt-5 text-small font-medium text-accent">
                  What it costs, and why →
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-section">
            <div className="rule-fade mb-8" />
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-display text-h2 font-semibold">The rest, honestly labelled</h3>
              <p className="font-mono text-xs2 text-ink-3">Prices on the products page</p>
            </div>
            <div className="mt-7 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {shipped.filter((p) => !FEATURED.includes(p.slug)).map((p) => (
                <Link key={p.slug} href={`/products/${p.slug}/`} className="group bg-surface p-5 transition hover:bg-paper-2">
                  <ModelPill model={p.model} />
                  <h4 className="mt-3 font-display text-h3 font-semibold group-hover:text-accent">{p.name}</h4>
                  <p className="mt-1.5 text-small text-ink-2">{p.blurb}</p>
                  <p className="mt-3 font-mono text-xs2 text-ink-3">{p.stack.slice(0, 4).join(" · ")}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══ experience ══ */}
        <section id="experience" className="mt-section scroll-mt-20 border-y border-line bg-paper-2">
          <div className="mx-auto max-w-page px-gutter py-section">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Label>Experience</Label>
                <h2 className="mt-3 max-w-[22ch] font-display text-d2 font-semibold">Nine years, mostly end-to-end.</h2>
              </div>
              <Link href="/resume" className="link-u inline-flex items-center gap-1.5 pb-1 text-small font-medium text-accent">Full résumé →</Link>
            </div>
            <ol className="mt-10 border-t border-line">
              {profile.experiences.map((e) => (
                <li key={e.company} className="grid gap-1 border-b border-line py-5 md:grid-cols-[11rem_1fr] md:items-baseline md:gap-6">
                  <p className="font-mono text-xs2 uppercase tracking-label text-ink-3">{e.from} — {e.to}</p>
                  <div>
                    <h3 className="font-display text-h3 font-semibold">
                      {e.position} · <span className="text-accent">{e.company}</span>
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
        <section id="contact" className="scroll-mt-20 border-t border-line bg-ink text-ink-inv">
          <div className="mx-auto max-w-page px-gutter py-section">
            <p className="font-mono text-label uppercase tracking-label text-ink-inv/55">Contact</p>
            <h2 className="mt-4 max-w-[18ch] font-display text-d2 font-semibold">Hiring, building, or just want to argue about tooling?</h2>
            <p className="mt-5 max-w-measure text-lead text-ink-inv/70">{profile.currently}</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 rounded-pill bg-paper px-5 py-3 text-body font-medium text-ink transition hover:bg-accent hover:text-ink-inv">
                {profile.email}
              </a>
              <Link href="/resume" className="inline-flex items-center gap-2 rounded-pill border border-ink-inv/25 px-5 py-3 text-body font-medium text-ink-inv transition hover:border-ink-inv">Résumé</Link>
              <Link href="/hire" className="inline-flex items-center gap-2 rounded-pill border border-ink-inv/25 px-5 py-3 text-body font-medium text-ink-inv transition hover:border-ink-inv">Work with me</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
