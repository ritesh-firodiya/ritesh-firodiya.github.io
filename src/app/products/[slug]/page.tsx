import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Apple, BookOpen, Check, ExternalLink, Monitor, Play, Workflow, type LucideIcon } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Chips, HireBand, StatePill } from "@/components/ui";
import { Embed } from "@/components/embed";
import { ShotImage, embedPathOf } from "@/components/picture";
import { StageTrack } from "@/components/stage";
import {
  products, bySlug, mediaFor, galleriesFor, screensFor, surfacesOf, withheldFor, hasBuild,
  MODEL_LABEL, type Platform, type Product,
} from "@/lib/products";
import { levelsOf, onBoard, progressLine } from "@/lib/board";
import { studyBySlug } from "@/lib/case-studies";
import { wikiOf, wikiHref, WIKI_TYPES } from "@/lib/wiki";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) return {};
  return {
    title: p.fullName,
    description: `${p.tagline} ${p.blurb}`,
    alternates: { canonical: `/products/${p.slug}/` },
  };
}

const PLATFORM: Record<string, { name: string; Icon: LucideIcon }> = {
  web: { name: "Web", Icon: Monitor },
  ios: { name: "App Store", Icon: Apple },
  android: { name: "Google Play", Icon: Play },
};
const isOpen = (v: Platform) => v.state === "live" || v.state === "beta";

/** The two most numerous page types, as the small print on the wiki card. */
function wikiBreakdown(slug: string): string {
  const byType = wikiOf(slug)?.byType ?? {};
  return WIKI_TYPES.map((t) => ({ label: t.label.toLowerCase(), n: byType[t.type] ?? 0 }))
    .filter((t) => t.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 2)
    .map((t) => `${t.n} ${t.label}`)
    .join(" · ");
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) notFound();

  const study = studyBySlug(p.slug);
  const media = mediaFor(p.slug);
  const embed = embedPathOf(p);
  const platforms = Object.entries(p.platforms).filter(([, v]) => v) as [string, Platform][];
  const open = platforms.filter(([, v]) => isOpen(v));
  const shut = platforms.filter(([, v]) => !isOpen(v));
  const galleries = galleriesFor(p.slug);
  const withheld = withheldFor(p.slug);
  const wiki = wikiOf(p.slug);
  const next = products[(products.indexOf(p) + 1) % products.length];
  const hasEvidence = galleries.length > 0 || withheld.length > 0 || wiki !== null;

  return (
    <>
      <SiteHeader on="work" />
      <main id="main">
        {/* What it is and where to get it. This half is for anyone. */}
        <section className="wrap pb-10 pt-10 lg:pt-12">
          <p className="text-sm text-ink-3">
            <Link href="/work/" className="hover:text-ink">Work</Link> / {p.name}
          </p>
          <div className="mt-5 grid items-start gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <div className="flex items-center gap-4">
                {media.icon && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={media.icon} alt="" width={56} height={56} className="h-14 w-14 rounded-xl border border-line" />
                )}
                <StatePill p={p} />
              </div>
              <h1 className="page-title mt-5">{p.name}</h1>
              <p className="mt-3 max-w-[46ch] text-lead text-ink-2">{study?.lead ?? `${p.tagline} ${p.blurb}`}</p>

              {open.length === 0 && (
                <p className="mt-6 rounded-lg border border-line bg-muted p-4 text-base text-ink-2">
                  <b className="font-semibold text-ink">Nothing to install.</b>{" "}
                  {p.unreleasedNote ?? (p.notBuilt ? "No application code exists yet. What exists is listed below." : "A build exists, and it is not public yet.")}
                </p>
              )}

              {/* An open platform is a button. A closed one is drawn disabled
                  with its reason — never hidden, never a link to nowhere. */}
              <div className="mt-6 grid gap-2.5 sm:max-w-md">
                {open.map(([k, v], i) => {
                  const { Icon } = PLATFORM[k];
                  return (
                    <a key={k} href={v.url!} className={`btn ${i === 0 ? "btn-primary" : "btn-quiet"}`}>
                      {k === "web" ? <ExternalLink size={16} aria-hidden /> : <Icon size={16} aria-hidden />} {v.label}
                    </a>
                  );
                })}
                {shut.map(([k, v]) => {
                  const { name, Icon } = PLATFORM[k];
                  return (
                    <span key={k} className="btn btn-off justify-between whitespace-normal text-left" aria-disabled="true">
                      <span className="inline-flex items-center gap-2">
                        <Icon size={16} aria-hidden /> {name}
                      </span>
                      <span className="text-right text-xs font-normal">{v.note || v.label}</span>
                    </span>
                  );
                })}
              </div>
              {open.some(([, v]) => v.note) && (
                <p className="mt-2 text-xs text-ink-3">{open.map(([, v]) => v.note).filter(Boolean).join(" ")}</p>
              )}

              {study && (
                <dl className="mt-8 grid gap-5 border-t border-line pt-6 sm:grid-cols-2">
                  {study.facts.map((f) => (
                    <div key={f.k}>
                      <dt className="eyebrow">{f.k}</dt>
                      <dd className="mt-1 text-base font-semibold">{f.v}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            {/* Every picture is the product's own: its design screen embedded
                live, then its store art. With neither, a slot that says so. */}
            <div className="grid gap-4">
              {embed && (
                <div className="overflow-hidden rounded-lg border border-line-strong shadow-lg">
                  <Embed src={embed} title={`${p.name} design screen`} />
                </div>
              )}
              {media.shots.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {media.shots.map((s) => (
                    <ShotImage key={s.src} shot={s} name={p.name} />
                  ))}
                </div>
              )}
              {!embed && media.shots.length === 0 && (
                <div className="slot grid aspect-[16/10] place-items-center rounded-lg">
                  <p className="eyebrow">{hasBuild(p) ? "No screenshot yet" : "No screenshot — nothing is built"}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* How far it has got, and the two things it left behind. */}
        {(onBoard(p) || hasEvidence) && (
          <section className="border-y border-line bg-surface">
            <div className="wrap py-12">
              {onBoard(p) && (
                <>
                  <p className="eyebrow">How far it has got</p>
                  <h2 className="section-title mt-2">{progressLine(levelsOf(p))}</h2>
                  <div className="mt-7">
                    <StageTrack levels={levelsOf(p)} />
                  </div>
                </>
              )}
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {galleries.length > 0 && (
                  /* A plain anchor: the gallery is the product's own static page. */
                  <a href={galleries[0].href} className="card bg-page p-6">
                    <div className="flex items-center justify-between">
                      <Workflow size={24} className="text-brand-500" aria-hidden />
                      <span className="font-mono text-xs text-ink-3">{surfacesOf(p.slug).join(" · ")}</span>
                    </div>
                    <p className="figure mt-5">{screensFor(p.slug).length}</p>
                    <h3 className="mt-1 text-h3 font-bold">screens in the design set</h3>
                    <p className="mt-2 text-base text-ink-2">A flow chart of every screen, and each one as a live HTML page.</p>
                    <p className="text-link mt-4 inline-block text-base">Open the flow chart</p>
                  </a>
                )}
                {withheld.map((w) => (
                  <div key={w.surface} className="card border-dashed bg-page p-6">
                    <div className="flex items-center justify-between">
                      <Workflow size={24} className="text-ink-3" aria-hidden />
                      <span className="font-mono text-xs text-ink-3">{w.surface}</span>
                    </div>
                    <h3 className="mt-5 text-h3 font-bold">Design set withheld</h3>
                    <p className="mt-2 text-base text-ink-2">
                      The screens are drawn, but the set does not follow the style guide yet, so it is not published.
                    </p>
                    <ul className="mt-4 grid gap-1 border-t border-line pt-4 font-mono text-xs text-ink-3">
                      {w.failed.map((c) => (
                        <li key={c.id}>{c.detail}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                {wiki && (
                  <Link href={wikiHref(p.slug)} className="card bg-page p-6">
                    <div className="flex items-center justify-between">
                      <BookOpen size={24} className="text-brand-500" aria-hidden />
                      <span className="font-mono text-xs text-ink-3">{wikiBreakdown(p.slug)}</span>
                    </div>
                    <p className="figure mt-5">{wiki.total}</p>
                    <h3 className="mt-1 text-h3 font-bold">pages in the wiki</h3>
                    <p className="mt-2 text-base text-ink-2">Why each screen is drawn the way it is, and every decision with its reason.</p>
                    <p className="text-link mt-4 inline-block text-base">Read the wiki</p>
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* The case study, for the hiring reader. */}
        <section className="wrap grid gap-12 py-14 lg:grid-cols-[1fr_20rem]">
          <div className="max-w-[68ch]">
            {study ? (
              study.sections.map((s, i) => (
                <div key={s.h} className={i > 0 ? "mt-12" : ""}>
                  <h2 className="section-title">{s.h}</h2>
                  {s.p?.map((t) => (
                    <p key={t.slice(0, 32)} className="mt-4 text-body text-ink-2">{t}</p>
                  ))}
                  {s.list && <StudyList heading={s.h} items={s.list} />}
                </div>
              ))
            ) : p.features.length > 0 ? (
              <>
                <h2 className="section-title">What it does</h2>
                <StudyList heading="What it does" items={p.features.map((f) => ({ t: f.title, b: f.body }))} />
              </>
            ) : (
              <>
                <h2 className="section-title">What it is</h2>
                <p className="mt-4 text-body text-ink-2">{p.blurb}</p>
              </>
            )}
          </div>

          <aside className="grid content-start gap-6">
            <div className="card p-5">
              <p className="eyebrow">{p.notBuilt ? "Planned stack" : "Stack"}</p>
              <div className="mt-3">
                <Chips items={study?.stack ?? p.stack} />
              </div>
            </div>
            {/* The model, never a price. The store listing is where a price belongs. */}
            <div className="card p-5">
              <p className="eyebrow">{p.notBuilt ? "How it will be paid for" : "How it is paid for"}</p>
              <p className="mt-3 text-base font-semibold">{MODEL_LABEL[p.model]}</p>
              <p className="mt-1 text-sm text-ink-2">{p.modelDetail}</p>
              <Disclosure p={p} />
            </div>
            <div className="card p-5">
              <p className="eyebrow">Privacy and help</p>
              <ul className="mt-3 grid gap-2 text-sm">
                {p.legal.privacy && (
                  <li>
                    <a href={p.legal.privacy} className="text-link">Privacy policy</a>
                  </li>
                )}
                {p.legal.delete && (
                  <li>
                    <a href={p.legal.delete} className="text-link">Delete your account</a>
                  </li>
                )}
                <li>
                  <Link href="/support/" className="text-link">Get support</Link>
                </li>
              </ul>
              {p.legal.privacyNote && <p className="mt-3 text-xs text-ink-3">{p.legal.privacyNote}</p>}
            </div>
          </aside>
        </section>

        <section className="wrap pb-14">
          <div className="flex items-center justify-between gap-4 border-t border-line pt-6">
            <Link href="/work/" className="text-link text-base">All projects</Link>
            <Link href={`/products/${next.slug}/`} className="text-right">
              <span className="eyebrow block">Next project</span>
              <span className="text-h3 font-bold">{next.name}</span>
            </Link>
          </div>
        </section>
      </main>
      <HireBand title={hasBuild(p) ? "Like how this one was built?" : "Want to see how the built ones turned out?"} />
      <SiteFooter />
    </>
  );
}

/** A decision reads as a card; anything else reads as a checked list. */
function StudyList({ heading, items }: { heading: string; items: { t: string; b: string }[] }) {
  if (/decision/i.test(heading)) {
    return (
      <div className="mt-4 grid gap-4">
        {items.map((d) => (
          <div key={d.t} className="card p-6">
            <h3 className="text-h3 font-bold">{d.t}</h3>
            <p className="mt-2 text-base text-ink-2">{d.b}</p>
          </div>
        ))}
      </div>
    );
  }
  return (
    <ul className="mt-4">
      {items.map((f) => (
        <li key={f.t} className="flex gap-3 border-t border-line py-3.5 text-body">
          <Check size={16} className="mt-1 shrink-0 text-brand-500" aria-hidden />
          <span>
            <b className="font-semibold">{f.t}</b> <span className="text-ink-2">{f.b}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Ads, analytics and offline: disclosure, stated per app, only where known. */
function Disclosure({ p }: { p: Product }) {
  const rows = [
    ["Ads", p.ads],
    ["Analytics", p.analytics],
    ["Works offline", p.offline],
  ].filter((r): r is [string, string] => Boolean(r[1]));
  if (rows.length === 0) return null;
  return (
    <>
      <dl className="mt-4 grid gap-2 border-t border-line pt-4 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <dt className="text-ink-3">{k}</dt>
            <dd className="text-right font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      {p.analyticsNote && <p className="mt-3 text-xs text-ink-3">{p.analyticsNote}</p>}
    </>
  );
}
