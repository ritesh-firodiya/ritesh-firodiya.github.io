import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { ModelPill, StatePill, Label } from "@/components/pills";
import { products, bySlug, mediaFor, MODEL, type Product, type Platform } from "@/lib/products";
import { studyBySlug } from "@/lib/case-studies";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) return {};
  const price = p.price ? ` ${p.price}.` : "";
  return {
    title: p.name,
    description: `${p.tagline} ${MODEL[p.model].label}.${price} ${p.blurb}`.trim(),
  };
}

const PLATFORM_LABEL: Record<string, string> = { web: "Web", ios: "iOS", android: "Android" };

/* One Get block, always the same order, and an unavailable platform renders
   DISABLED WITH THE REASON rather than hidden. "Not on iOS yet" is
   information; a missing button is a dead end. */
function GetBlock({ p }: { p: Product }) {
  const entries = Object.entries(p.platforms).filter(([, v]) => v) as [string, Platform][];
  const order = ["web", "ios", "android"];
  entries.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  const anyOpen = entries.some(([, v]) => v.state === "live" || v.state === "beta");

  return (
    <div id="get" className="mt-6 scroll-mt-24 rounded-card border border-line bg-surface p-6 shadow-lift">
      <Label>Get the app</Label>
      <div className={`mt-4 grid gap-3 ${entries.length > 2 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {entries.map(([key, v]) => {
          const open = v.state === "live" || v.state === "beta";
          const inner = (
            <span className="min-w-0">
              <span className={`block font-mono text-label uppercase tracking-label ${open ? "opacity-70" : "text-ink-3"}`}>
                {PLATFORM_LABEL[key]}
              </span>
              <span className="block truncate text-small">{v.label}</span>
            </span>
          );
          return open ? (
            <Link
              key={key}
              href={v.url ?? "#"}
              className="flex items-center gap-3 rounded-pill bg-ink px-5 py-3 font-medium text-ink-inv transition hover:bg-accent"
            >
              {inner}
            </Link>
          ) : (
            <div
              key={key}
              aria-disabled="true"
              title={v.note || v.label}
              className="btn-off flex items-center gap-3 rounded-pill border border-line-2 bg-paper-2 px-5 py-3 font-medium text-ink-2"
            >
              {inner}
            </div>
          );
        })}
      </div>
      {!anyOpen && p.unreleasedNote && (
        <p className="mt-5 max-w-prose text-small text-ink-2">{p.unreleasedNote}</p>
      )}
      {anyOpen ? (
        <p className="mt-4 font-mono text-xs2 text-ink-3">
          One short link sends a phone to the right one of these:{" "}
          <Link href={`/go/${p.slug}/`} className="link-u text-accent">/go/{p.slug}</Link>
        </p>
      ) : (
        <Link
          href="/support"
          className="mt-5 inline-flex items-center gap-2 rounded-pill bg-ink px-4 py-2 text-small font-medium text-ink-inv transition hover:bg-accent"
        >
          Email me when it opens
        </Link>
      )}
    </div>
  );
}

/* The model block. Above the Get block, never below it. The wash is the model's
   own token so the page is colour-coded by what it charges, not by how good
   that is. */
function ModelBlock({ p }: { p: Product }) {
  const m = MODEL[p.model];
  const border =
    p.model === "free-ads" ? "border-m-ads/30" :
    p.model === "subscription" ? "border-m-sub/30" :
    p.model === "one-time" ? "border-m-once/30" :
    p.model === "per-period" ? "border-m-year/30" : "border-line-2";
  const solid =
    p.model === "free-ads" ? "bg-m-ads" :
    p.model === "subscription" ? "bg-m-sub" :
    p.model === "one-time" ? "bg-m-once" :
    p.model === "per-period" ? "bg-m-year" : "bg-ink";

  return (
    <div className={`mt-10 rounded-card border ${border} ${m.bg} p-7`}>
      <div className="flex flex-wrap items-center gap-3">
        <span className={`rounded-pill ${solid} px-3 py-1 font-mono text-label uppercase tracking-label text-ink-inv`}>
          {m.label}
        </span>
        {p.priceNote && (
          <span className={`font-mono text-xs2 uppercase tracking-label ${m.fg}`}>{p.priceNote}</span>
        )}
      </div>

      {p.price && (
        <p className="nums mt-5 font-display text-d2 font-semibold text-ink">{p.price}</p>
      )}
      <p className="mt-4 max-w-prose text-body text-ink-2">{p.modelDetail}</p>

      {p.tiers && p.tiers.length > 0 && (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {p.tiers.map((t) => (
            <div key={t.label} className={`rounded-card border ${border} bg-surface p-6`}>
              <Label>{t.label}</Label>
              <p className="nums mt-2 font-display text-d2 font-semibold">
                {t.amount}
                <span className="font-sans text-lead font-normal text-ink-3">{t.unit}</span>
              </p>
              <p className="mt-2 text-small text-ink-2">{t.note}</p>
            </div>
          ))}
        </div>
      )}

      {p.adSurfaces.length > 0 && (
        <dl className="mt-7 grid gap-px overflow-hidden rounded-card border border-m-ads/20 bg-m-ads/20 sm:grid-cols-3">
          {p.adSurfaces.map((a) => (
            <div key={a.kind} className="bg-surface px-5 py-4">
              <dt className="font-mono text-label uppercase tracking-label text-ink-3">{a.kind}</dt>
              <dd className={`mt-1.5 text-small ${a.absent ? "text-ink-3" : "text-ink"}`}>{a.where}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) notFound();

  const others = products.filter((o) => o.slug !== p.slug).slice(0, 4);
  const m = mediaFor(p.slug);
  const study = studyBySlug(p.slug);

  return (
    <>
      <SiteHeader active="/products" cta={{ href: "#get", label: "Get the app" }} />
      <main id="main">
        <section className="grain relative overflow-hidden border-b border-line">
          <div className="mx-auto max-w-page px-gutter pb-14 pt-section">
            <Link href="/products" className="link-u inline-flex items-center gap-1.5 text-small text-ink-3 hover:text-ink">
              ← All products
            </Link>

            <div className="mt-7 flex flex-wrap items-start gap-7">
              {m.icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.icon}
                  alt={`${p.name} app icon`}
                  width={120}
                  height={120}
                  className="h-[120px] w-[120px] shrink-0 rounded-card border border-line"
                />
              ) : (
                <span className="shot-ph h-[120px] w-[120px] shrink-0 rounded-card font-mono text-xs2 text-ink-3">
                  No icon yet
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {Object.entries(p.platforms)
                    .filter(([, v]) => v && (v.state === "live" || v.state === "beta"))
                    .map(([k, v]) => (
                      <StatePill key={k} state={v!.state}>
                        {v!.state === "live" ? `Live · ${PLATFORM_LABEL[k]}` : `${PLATFORM_LABEL[k]} beta`}
                      </StatePill>
                    ))}
                  {p.notBuilt && <StatePill state="none">In design — no code yet</StatePill>}
                </div>
                <h1 className="mt-4 max-w-[16ch] font-display text-d1 font-semibold">{p.name}</h1>
                <p className="mt-3 max-w-measure font-display text-lead italic text-ink-2">{p.tagline}</p>
                <p className="mt-3 max-w-measure text-body text-ink-2">{p.blurb}</p>
              </div>
            </div>

            <ModelBlock p={p} />
            <GetBlock p={p} />

            {(p.version || p.offline || p.analytics) && (
              <dl className="mt-6 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
                {p.version && (
                  <div className="bg-surface px-5 py-4"><dt className="font-mono text-label uppercase tracking-label text-ink-3">Version</dt><dd className="nums mt-1.5 font-display text-h3 font-semibold">{p.version}</dd></div>
                )}
                <div className="bg-surface px-5 py-4"><dt className="font-mono text-label uppercase tracking-label text-ink-3">Ads</dt><dd className="mt-1.5 font-display text-h3 font-semibold">{p.ads ?? "—"}</dd></div>
                <div className="bg-surface px-5 py-4"><dt className="font-mono text-label uppercase tracking-label text-ink-3">Offline</dt><dd className="mt-1.5 font-display text-h3 font-semibold">{p.offline ?? "—"}</dd></div>
                <div className="bg-surface px-5 py-4"><dt className="font-mono text-label uppercase tracking-label text-ink-3">Analytics</dt><dd className="mt-1.5 font-display text-h3 font-semibold">{p.analytics ?? "—"}</dd></div>
              </dl>
            )}
            {p.analyticsNote && <p className="mt-3 max-w-prose font-mono text-xs2 text-ink-3">{p.analyticsNote}</p>}
            {study && (
              <Link href={`/work/${study.slug}/`} className="mt-6 inline-flex items-center gap-2 rounded-pill border border-line-2 px-4 py-2 text-small font-medium transition hover:border-accent hover:text-accent">
                How it was built →
              </Link>
            )}
          </div>
        </section>

        {(p.features.length > 0 || p.permissions.length > 0) && (
          <section className="mx-auto max-w-page px-gutter py-section">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              {p.features.length > 0 && (
                <div>
                  <h2 className="font-display text-d2 font-semibold">What it does</h2>
                  <ul className="mt-6 space-y-5">
                    {p.features.map((f) => (
                      <li key={f.title}>
                        <h3 className="font-display text-h3 font-semibold">{f.title}</h3>
                        <p className="mt-1.5 max-w-prose text-body text-ink-2">{f.body}</p>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-7 font-mono text-xs2 text-ink-3">{p.stack.join(" · ")}</p>
                </div>
              )}
              {p.permissions.length > 0 && (
                <div>
                  <h2 className="font-display text-d2 font-semibold">Permissions</h2>
                  <dl className="mt-6 divide-y divide-line border-y border-line">
                    {p.permissions.map((perm) => (
                      <div key={perm.name} className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-5">
                        <dt className={`font-medium ${perm.absent ? "text-ink-3" : ""}`}>{perm.name}</dt>
                        <dd className="text-small text-ink-2">{perm.why}</dd>
                      </div>
                    ))}
                  </dl>
                  {/* These go straight to the document. Sending someone who
                      wants a privacy policy to an index of privacy policies is
                      one click of friction for no reason — and store reviewers
                      follow these links too. */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {p.legal.privacy && (
                      <a href={p.legal.privacy} className="inline-flex items-center gap-2 rounded-pill border border-line-2 px-4 py-2 text-small font-medium transition hover:border-accent hover:text-accent">Privacy policy</a>
                    )}
                    {p.legal.delete && (
                      <a href={p.legal.delete} className="inline-flex items-center gap-2 rounded-pill border border-line-2 px-4 py-2 text-small font-medium transition hover:border-accent hover:text-accent">Delete my account</a>
                    )}
                    <Link href="/support" className="inline-flex items-center gap-2 rounded-pill border border-line-2 px-4 py-2 text-small font-medium transition hover:border-accent hover:text-accent">Support</Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {(m.shots.length > 0 || p.screens.length > 0) && (
          <section className="border-t border-line bg-paper-2">
            <div className="mx-auto max-w-page px-gutter py-section">
              <h2 className="font-display text-h2 font-semibold">Screens</h2>
              <div className="rail mt-7 flex gap-6 overflow-x-auto pb-4">
                {m.shots.length > 0
                  ? m.shots.map((s) => (
                      <div key={s.src} className="device w-[210px] shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={s.src}
                          alt={`${p.name} — ${s.label}`}
                          loading="lazy"
                          className="device-screen w-full"
                        />
                      </div>
                    ))
                  : p.screens.map((s) => (
                      <div key={s} className="device w-[210px] shrink-0">
                        <div className="device-screen shot-ph aspect-[9/19.5]">
                          <p className="px-4 font-mono text-xs2 uppercase tracking-label text-ink-3">{s}</p>
                        </div>
                      </div>
                    ))}
              </div>
              {p.model === "free-ads" && (
                <p className="mt-3 max-w-prose font-mono text-xs2 text-ink-3">
                  The banner appears in the first screenshot on purpose — a store screenshot that
                  crops the ad out is a small lie.
                </p>
              )}
            </div>
          </section>
        )}

        <section className="border-t border-line">
          <div className="mx-auto max-w-page px-gutter py-section">
            <h2 className="font-display text-h2 font-semibold">More products</h2>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {others.map((o) => (
                <Link key={o.slug} href={`/products/${o.slug}/`} className="group rounded-card border border-line bg-surface p-4 transition hover:border-accent/40">
                  <span className="block truncate font-semibold group-hover:text-accent">{o.name}</span>
                  <span className="mt-2 block"><ModelPill model={o.model} /></span>
                  {o.price && <span className="nums mt-2 block text-small text-ink-2">{o.price}</span>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
