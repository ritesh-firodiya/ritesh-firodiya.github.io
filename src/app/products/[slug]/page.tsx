import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { ModelPill, StatePill, Label } from "@/components/pills";
import {
  IconGit, IconDesign, IconLive, IconAndroid, IconApple,
} from "@/components/icons";
import {
  products, bySlug, mediaFor, screensFor, galleriesFor, MODEL,
  type Product, type Gallery,
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

const SURFACE_LABEL: Record<string, string> = { mobile: "Phone", web: "Web" };
const TERMS = "/legal/terms.html";

/* Row one: the places this product actually exists. Only what is real — a
   disabled icon in a nav row is noise, and what is unavailable is said in
   words underneath, once, where it can carry the reason. */
function ProductLinks({ p, galleries }: { p: Product; galleries: Gallery[] }) {
  const open = (v?: { state: string; url: string | null }) =>
    v && v.url && (v.state === "live" || v.state === "beta") ? v.url : null;
  const { web, ios, android } = p.platforms;

  const links = [
    open(web) && { href: open(web)!, label: "Live", Icon: IconLive, out: true },
    open(android) && { href: open(android)!, label: "Google Play", Icon: IconAndroid, out: true },
    open(ios) && { href: open(ios)!, label: ios!.state === "beta" ? "TestFlight" : "App Store", Icon: IconApple, out: true },
    ...galleries.map((g) => ({
      href: g.href,
      label: galleries.length > 1 ? `${SURFACE_LABEL[g.surface] ?? g.surface} designs` : "Designs",
      Icon: IconDesign,
      out: false,
    })),
    p.repo && { href: p.repo, label: "Source", Icon: IconGit, out: true },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof IconGit; out: boolean }[];

  /* Row two: the documents. Quieter than an install button and never in place
     of one, but a store listing points here for them, so they are one click
     from the top of the page rather than buried at the bottom. */
  const docs = [
    p.legal.privacy && { href: p.legal.privacy, label: "Privacy" },
    { href: TERMS, label: "Terms" },
    p.legal.delete && { href: p.legal.delete, label: "Delete account" },
    { href: "/support/", label: "Support" },
  ].filter(Boolean) as { href: string; label: string }[];

  const shut = (["ios", "android", "web"] as const)
    .map((k) => [k, p.platforms[k]] as const)
    .filter(([, v]) => v && !open(v))
    .map(([k, v]) => `${k === "ios" ? "iOS" : k === "android" ? "Android" : "Web"}: ${v!.note || v!.label}`);

  return (
    <>
      {links.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {links.map((l) => (
            <a key={l.label} href={l.href}
               className="inline-flex items-center gap-1.5 rounded-pill border border-line-2 bg-surface px-2.5 py-1 text-small font-medium transition hover:border-accent hover:text-accent">
              <l.Icon size={14} strokeWidth={1.75} aria-hidden /> {l.label}
            </a>
          ))}
        </div>
      )}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs2 text-ink-3">
        {docs.map((d, i) => (
          <span key={d.label} className="flex items-center gap-3">
            {i > 0 && <span aria-hidden>·</span>}
            <a href={d.href} className="link-u hover:text-accent">{d.label}</a>
          </span>
        ))}
      </div>
      {shut.length > 0 && (
        <p className="mt-2 font-mono text-xs2 text-ink-3">Not available — {shut.join(" · ")}</p>
      )}
    </>
  );
}

/* The facts the site exists to state, in one strip above everything else.
   `ads` and `offline` were in products.json and on no page — which is exactly
   the drift this rebuild was for. */
function Facts({ p }: { p: Product }) {
  const rows = [
    { k: "Model", v: MODEL[p.model].label },
    { k: "You pay", v: p.price ?? "—", note: p.priceNote },
    {
      k: "Ads",
      v: p.ads ?? "—",
      loud: p.model === "free-ads",
      // The surfaces get their own block below; here just name them.
      note: p.adSurfaces.filter((s) => !s.absent).map((s) => s.kind).join(" · ") || undefined,
    },
    { k: "Offline", v: p.offline ?? "—" },
    { k: "Analytics", v: p.analytics ?? "—", loud: !!p.analytics && p.analytics !== "None" },
    p.version ? { k: "Version", v: p.version } : null,
  ].filter(Boolean) as { k: string; v: string; note?: string; loud?: boolean }[];

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
      {rows.map((r) => (
        <div key={r.k}>
          <dt className="font-mono text-label uppercase tracking-label text-ink-3">{r.k}</dt>
          <dd className={`mt-0.5 text-small font-medium ${r.loud ? "text-m-ads" : ""}`}>
            {r.v}
            {r.note && <span className="mt-0.5 block text-xs2 font-normal text-ink-3">{r.note}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) notFound();

  const m = mediaFor(p.slug);
  const screens = screensFor(p.slug);
  const galleries = galleriesFor(p.slug);
  const study = studyBySlug(p.slug);
  const others = products.filter((o) => o.slug !== p.slug).slice(0, 5);
  const live = Object.values(p.platforms).find((v) => v?.state === "live");

  return (
    <>
      <SiteHeader active="/products" />
      <main id="main">
        {/* 1 · who it is, where it is, what it costs */}
        <section className="mx-auto max-w-page px-gutter pb-7 pt-8">
          <Link href="/products" className="link-u inline-flex items-center gap-1.5 text-xs2 text-ink-3 hover:text-ink">
            ← All products
          </Link>

          <div className="mt-4 flex flex-wrap items-start gap-5">
            {m.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.icon} alt={`${p.name} icon`} width={64} height={64}
                   className="h-16 w-16 shrink-0 rounded-card border border-line" />
            ) : (
              <span className="shot-ph h-16 w-16 shrink-0 rounded-card font-mono text-xs2 text-ink-3">—</span>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h1 className="font-display text-d2 font-semibold">{p.name}</h1>
                <ModelPill model={p.model} />
                {p.price && <span className="nums text-small font-medium">{p.price}</span>}
                {live && <StatePill state="live">Live</StatePill>}
              </div>
              <p className="mt-1.5 max-w-measure font-display text-lead italic text-ink-2">{p.tagline}</p>
              {p.fullName && p.fullName !== p.name && (
                <p className="mt-1 font-mono text-xs2 text-ink-3">Listed as &ldquo;{p.fullName}&rdquo;</p>
              )}
              <p className="mt-2 max-w-prose text-small text-ink-2">{p.blurb}</p>
              <ProductLinks p={p} galleries={galleries} />
              {p.unreleasedNote && (
                <p className="mt-2.5 max-w-prose border-l-2 border-line-2 pl-3 text-small text-ink-2">
                  {p.unreleasedNote}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* 2 · the facts, stated before anything asks you to install */}
        <section className="border-y border-line bg-paper-2">
          <div className="mx-auto max-w-page px-gutter py-5">
            <Facts p={p} />
            {p.modelDetail && (
              <p className="mt-4 max-w-prose text-small text-ink-2">{p.modelDetail}</p>
            )}
            {/* Where each ad actually appears. The format names the surface that
                is NOT used too — "Rewarded: none" is a fact someone deciding
                whether to install is entitled to, and hiding it would be the
                same omission this site was rebuilt to stop. */}
            {p.adSurfaces.length > 0 && (
              <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
                {p.adSurfaces.map((s) => (
                  <div key={s.kind} className={s.absent ? "text-ink-3" : ""}>
                    <dt className="font-mono text-xs2 font-medium">{s.kind}</dt>
                    <dd className="text-xs2 text-ink-2">{s.where}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </section>

        {/* 3 · what each tier actually charges */}
        {p.tiers && p.tiers.length > 0 && (
          <section className="mx-auto max-w-page px-gutter py-7">
            <Label>What you get for what</Label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {p.tiers.map((t) => (
                <div key={t.label} className="rounded-card border border-line bg-surface p-3.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="nums font-display text-h3 font-semibold">{t.amount}</span>
                    <span className="font-mono text-xs2 text-ink-3">{t.unit}</span>
                  </div>
                  <div className="mt-0.5 text-small font-medium">{t.label}</div>
                  <p className="mt-1.5 text-xs2 text-ink-2">{t.note}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4 · tech */}
        {p.stack.length > 0 && (
          <section className="border-y border-line">
            <div className="mx-auto flex max-w-page flex-wrap items-baseline gap-x-6 gap-y-2 px-gutter py-4">
              <Label>Tech</Label>
              <ul className="flex flex-wrap gap-1.5">
                {p.stack.map((s) => (
                  <li key={s} className="rounded-pill border border-line-2 bg-surface px-2.5 py-0.5 font-mono text-xs2 text-ink-2">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* 5 · screenshots */}
        {m.shots.length > 0 && (
          <section className="mx-auto max-w-page px-gutter py-7">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-h2 font-semibold">Screenshots</h2>
              {m.kind === "web" && (
                <span className="font-mono text-xs2 text-ink-3">
                  Public card only — screens behind the sign-in are not published.
                </span>
              )}
            </div>
            <div className="rail mt-4 flex gap-4 overflow-x-auto pb-3">
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
                  <div key={s.src} className="device w-[172px] shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.src} alt={`${p.name} — ${s.label}`} loading="lazy" className="device-screen w-full" />
                  </div>
                ),
              )}
            </div>
          </section>
        )}

        {/* 5b · the screens, named, when there is no picture of them. A product
               with nothing shipped still has a shape worth stating. */}
        {m.shots.length === 0 && p.screens.length > 0 && (
          <section className="mx-auto max-w-page px-gutter py-7">
            <h2 className="font-display text-h2 font-semibold">Screens</h2>
            <p className="mt-1 text-xs2 text-ink-3">No store screenshots yet — these are the screens it is built around.</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {p.screens.map((s) => (
                <li key={s} className="rounded-pill border border-line-2 bg-surface px-2.5 py-0.5 font-mono text-xs2 text-ink-2">
                  {s}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 6 · designs — the app repo's own gallery, at its own URL */}
        {galleries.length > 0 && (
          <section className="border-y border-line bg-paper-2">
            <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-4 px-gutter py-5">
              <div>
                <Label>Designs · {screens.length} screens</Label>
                <p className="mt-1 max-w-prose text-small text-ink-2">
                  The HTML wireframes this was built from, rendering live — the same gallery the
                  screens were reviewed against.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {galleries.map((g) => (
                  <a key={g.href} href={g.href}
                     className="inline-flex items-center gap-2 rounded-pill bg-ink px-3.5 py-1.5 text-small font-medium text-ink-inv transition hover:bg-accent">
                    <IconDesign size={14} strokeWidth={1.75} aria-hidden />
                    {galleries.length > 1 ? SURFACE_LABEL[g.surface] ?? g.surface : "Open the design set"}
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 7 · what it does */}
        {p.features.length > 0 && (
          <section className="mx-auto max-w-page px-gutter py-7">
            <h2 className="font-display text-h2 font-semibold">What it does</h2>
            <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {p.features.map((f) => (
                <div key={f.title}>
                  <dt className="text-small font-semibold">{f.title}</dt>
                  <dd className="mt-1 text-small text-ink-2">{f.body}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* 8 · the quieter facts */}
        {(p.permissions.length > 0 || study) && (
          <section className="border-t border-line">
            <div className="mx-auto grid max-w-page gap-8 px-gutter py-7 lg:grid-cols-[2fr_1fr] lg:gap-14">
              {p.permissions.length > 0 && (
                <div>
                  <h2 className="font-display text-h2 font-semibold">Permissions &amp; data</h2>
                  <dl className="mt-3 divide-y divide-line border-y border-line">
                    {p.permissions.map((perm) => (
                      <div key={perm.name} className="grid gap-0.5 py-2.5 sm:grid-cols-[9rem_1fr] sm:gap-5">
                        <dt className={`text-small font-medium ${perm.absent ? "text-ink-3" : ""}`}>{perm.name}</dt>
                        <dd className="text-small text-ink-2">{perm.why}</dd>
                      </div>
                    ))}
                  </dl>
                  {p.analyticsNote && <p className="mt-2.5 max-w-prose text-small text-ink-2">{p.analyticsNote}</p>}
                </div>
              )}
              {study && (
                <div>
                  <h2 className="font-display text-h2 font-semibold">Written up in full</h2>
                  <p className="mt-2 max-w-prose text-small text-ink-2">
                    The problem, the architecture, and the decisions worth defending.
                  </p>
                  <Link href={`/work/${study.slug}/`}
                        className="mt-3 inline-flex items-center gap-2 rounded-pill border border-line-2 px-3.5 py-1.5 text-small font-medium transition hover:border-accent hover:text-accent">
                    Read the case study →
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="border-t border-line">
          <div className="mx-auto max-w-page px-gutter py-5">
            <Label>More products</Label>
            <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-2">
              {others.map((o) => (
                <Link key={o.slug} href={`/products/${o.slug}/`} className="link-u text-small font-medium hover:text-accent">
                  {o.name}
                </Link>
              ))}
              <Link href="/products" className="link-u ml-auto text-small font-medium text-accent">
                All {products.length} →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
