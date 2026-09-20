import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { ModelPill, StatePill, Label } from "@/components/pills";
import { IconGit, IconDesign, IconLive, IconAndroid, IconApple } from "@/components/icons";
import {
  products, bySlug, mediaFor, screensFor, MODEL, type Product,
} from "@/lib/products";
import { studyBySlug } from "@/lib/case-studies";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: `${p.tagline} ${MODEL[p.model].label}${p.price ? `, ${p.price}` : ""}. ${p.blurb}`.trim(),
  };
}

/* One row of small links, and only the ones that exist. A disabled icon in a
   nav row is noise; what is genuinely unavailable is said in words underneath,
   once, where it can carry the reason. */
function LinkRow({ p, hasDesigns }: { p: Product; hasDesigns: boolean }) {
  const web = p.platforms.web, ios = p.platforms.ios, android = p.platforms.android;
  const open = (v?: { state: string; url: string | null }) =>
    v && v.url && (v.state === "live" || v.state === "beta") ? v.url : null;

  const links = [
    p.repo ? { href: p.repo, label: "Source", Icon: IconGit, external: true } : null,
    hasDesigns ? { href: `/products/${p.slug}/designs/`, label: "Designs", Icon: IconDesign, external: false } : null,
    open(web) ? { href: open(web)!, label: "Live", Icon: IconLive, external: true } : null,
    open(android) ? { href: open(android)!, label: "Google Play", Icon: IconAndroid, external: true } : null,
    open(ios) ? { href: open(ios)!, label: ios!.state === "beta" ? "TestFlight" : "App Store", Icon: IconApple, external: true } : null,
  ].filter(Boolean) as { href: string; label: string; Icon: typeof IconGit; external: boolean }[];

  const shut = (["ios", "android", "web"] as const)
    .map((k) => [k, p.platforms[k]] as const)
    .filter(([, v]) => v && !open(v))
    .map(([k, v]) => `${k === "ios" ? "iOS" : k === "android" ? "Android" : "Web"}: ${v!.note || v!.label}`);

  return (
    <>
      {links.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {links.map((l) =>
            l.external ? (
              <a key={l.label} href={l.href}
                 className="inline-flex items-center gap-2 rounded-pill border border-line-2 bg-surface px-3 py-1.5 text-small font-medium transition hover:border-accent hover:text-accent">
                <l.Icon /> {l.label}
              </a>
            ) : (
              <Link key={l.label} href={l.href}
                    className="inline-flex items-center gap-2 rounded-pill border border-line-2 bg-surface px-3 py-1.5 text-small font-medium transition hover:border-accent hover:text-accent">
                <l.Icon /> {l.label}
              </Link>
            ),
          )}
        </div>
      )}
      {shut.length > 0 && (
        <p className="mt-3 font-mono text-xs2 text-ink-3">Not available — {shut.join(" · ")}</p>
      )}
    </>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) notFound();

  const m = mediaFor(p.slug);
  const screens = screensFor(p.slug);
  const study = studyBySlug(p.slug);
  const others = products.filter((o) => o.slug !== p.slug).slice(0, 4);

  return (
    <>
      <SiteHeader active="/products" />
      <main id="main">
        {/* 1 · icon, name, description, links */}
        <section className="mx-auto max-w-page px-gutter pb-section pt-section">
          <Link href="/products" className="link-u inline-flex items-center gap-1.5 text-small text-ink-3 hover:text-ink">
            ← All products
          </Link>

          <div className="mt-6 flex flex-wrap items-start gap-6">
            {m.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.icon} alt={`${p.name} icon`} width={88} height={88}
                   className="h-[88px] w-[88px] shrink-0 rounded-card border border-line" />
            ) : (
              <span className="shot-ph h-[88px] w-[88px] shrink-0 rounded-card font-mono text-xs2 text-ink-3">
                No icon
              </span>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <ModelPill model={p.model} />
                {p.price && <span className="nums text-small font-medium">{p.price}</span>}
                {p.priceNote && <span className="text-xs2 text-ink-3">{p.priceNote}</span>}
                {Object.entries(p.platforms)
                  .filter(([, v]) => v && v.state === "live")
                  .slice(0, 1)
                  .map(([k, v]) => <StatePill key={k} state={v!.state}>Live</StatePill>)}
              </div>
              <h1 className="mt-3 font-display text-d1 font-semibold">{p.name}</h1>
              <p className="mt-2 max-w-measure font-display text-lead italic text-ink-2">{p.tagline}</p>
              <p className="mt-3 max-w-prose text-body text-ink-2">{p.blurb}</p>
              <LinkRow p={p} hasDesigns={screens.length > 0} />
            </div>
          </div>
        </section>

        {/* 2 · tech */}
        {p.stack.length > 0 && (
          <section className="border-y border-line bg-paper-2">
            <div className="mx-auto flex max-w-page flex-wrap items-baseline gap-x-8 gap-y-3 px-gutter py-6">
              <Label>Tech</Label>
              <ul className="flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <li key={s} className="rounded-pill border border-line-2 bg-surface px-2.5 py-1 font-mono text-xs2 text-ink-2">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* 3 · screenshots */}
        {m.shots.length > 0 && (
          <section className="mx-auto max-w-page px-gutter py-section">
            <h2 className="font-display text-h2 font-semibold">Screenshots</h2>
            <div className="rail mt-5 flex gap-5 overflow-x-auto pb-3">
              {m.shots.map((s) =>
                m.kind === "web" ? (
                  <div key={s.src} className="browser w-full max-w-3xl shrink-0">
                    <div className="browser-bar">
                      <span className="browser-dot" /><span className="browser-dot" /><span className="browser-dot" />
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.src} alt={`${p.name} — ${s.label}`} loading="lazy" className="block w-full" />
                  </div>
                ) : (
                  <div key={s.src} className="device w-[196px] shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.src} alt={`${p.name} — ${s.label}`} loading="lazy" className="device-screen w-full" />
                  </div>
                ),
              )}
            </div>
            {m.kind === "web" && (
              <p className="mt-2 font-mono text-xs2 text-ink-3">
                The product&rsquo;s own public card. Screens behind the sign-in are not published.
              </p>
            )}
          </section>
        )}

        {/* 4 · designs, as a link rather than 80 embedded frames */}
        {screens.length > 0 && (
          <section className="border-t border-line bg-paper-2">
            <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-4 px-gutter py-6">
              <div>
                <Label>Designs · {screens.length} screens</Label>
                <p className="mt-1 max-w-prose text-small text-ink-2">
                  The HTML wireframes this was built from, rendering live.
                </p>
              </div>
              <Link href={`/products/${p.slug}/designs/`}
                    className="inline-flex items-center gap-2 rounded-pill bg-ink px-4 py-2 text-small font-medium text-ink-inv transition hover:bg-accent">
                <IconDesign /> Browse the design set →
              </Link>
            </div>
          </section>
        )}

        {/* 5 · the quieter facts */}
        {(p.permissions.length > 0 || p.analytics || study) && (
          <section className="mx-auto max-w-page px-gutter py-section">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              {p.permissions.length > 0 && (
                <div>
                  <h2 className="font-display text-h2 font-semibold">Permissions &amp; data</h2>
                  <dl className="mt-4 divide-y divide-line border-y border-line">
                    {p.permissions.map((perm) => (
                      <div key={perm.name} className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-5">
                        <dt className={`text-small font-medium ${perm.absent ? "text-ink-3" : ""}`}>{perm.name}</dt>
                        <dd className="text-small text-ink-2">{perm.why}</dd>
                      </div>
                    ))}
                  </dl>
                  {p.analyticsNote && <p className="mt-3 max-w-prose text-small text-ink-2">{p.analyticsNote}</p>}
                  <div className="mt-4 flex flex-wrap gap-3">
                    {p.legal.privacy && (
                      <a href={p.legal.privacy} className="link-u text-small font-medium text-accent">Privacy policy</a>
                    )}
                    {p.legal.delete && (
                      <a href={p.legal.delete} className="link-u text-small font-medium text-accent">Delete my account</a>
                    )}
                  </div>
                </div>
              )}
              {study && (
                <div>
                  <h2 className="font-display text-h2 font-semibold">Written up in full</h2>
                  <p className="mt-3 max-w-prose text-small text-ink-2">
                    The problem, the architecture, and the decisions worth defending.
                  </p>
                  <Link href={`/work/${study.slug}/`}
                        className="mt-4 inline-flex items-center gap-2 rounded-pill border border-line-2 px-4 py-2 text-small font-medium transition hover:border-accent hover:text-accent">
                    Read the case study →
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="border-t border-line">
          <div className="mx-auto max-w-page px-gutter py-6">
            <Label>More products</Label>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {others.map((o) => (
                <Link key={o.slug} href={`/products/${o.slug}/`} className="link-u text-small font-medium hover:text-accent">
                  {o.name}
                </Link>
              ))}
              <Link href="/products" className="link-u ml-auto text-small font-medium text-accent">All 13 →</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
