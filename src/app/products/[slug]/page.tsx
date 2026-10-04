import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Apple, BookOpen, ExternalLink, FlaskConical, Mail, Monitor, Play, Workflow, type LucideIcon } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Chips, HireBand, StatePill } from "@/components/ui";
import { Embed } from "@/components/embed";
import { ShotImage, embedPathOf, isPhoneEmbed } from "@/components/picture";
import { CopyButton } from "@/components/copy-button";
import { gmailCompose, mailto } from "@/lib/mail";
import {
  products, bySlug, mediaFor, shotsOf, galleriesFor, screensFor, withheldFor, hasBuild,
  MODEL_LABEL, type Platform, type Product,
} from "@/lib/products";
import { STAGES, levelsOf, onBoard } from "@/lib/board";
import { studyBySlug } from "@/lib/case-studies";
import { wikiOf, wikiHref } from "@/lib/wiki";
import { profile } from "@/lib/profile";

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
  ios: { name: "iOS", Icon: Apple },
  android: { name: "Android", Icon: Play },
};

/**
 * Every way to get the product, as one row of buttons.
 *
 *   live / beta  a link: the store, the site, the public TestFlight
 *   closed       a build exists behind a tester list. The button jumps to the
 *                steps under it, which hold real links: write to me (in Gmail,
 *                or any mail app), then the store's own tester page
 *   none         nothing exists; drawn disabled with its reason, never hidden
 */
function Access({ p }: { p: Product }) {
  const platforms = Object.entries(p.platforms).filter(([, v]) => v) as [string, Platform][];
  const open = platforms.filter(([, v]) => v.state === "live" || v.state === "beta");
  const closed = platforms.filter(([, v]) => v.state === "closed");
  const none = platforms.filter(([, v]) => v.state === "none");

  return (
    <>
      <div className="mt-5 flex flex-wrap gap-2.5">
        {open.map(([k, v], i) => {
          const { Icon } = PLATFORM[k];
          return (
            <a key={k} href={v.url!} className={`btn ${i === 0 ? "btn-primary" : "btn-quiet"}`}>
              {k === "web" ? <ExternalLink size={16} aria-hidden /> : <Icon size={16} aria-hidden />} {v.label}
            </a>
          );
        })}
        {closed.map(([k], i) => (
          <a key={k} href={`#join-${k}`} className={`btn ${open.length === 0 && i === 0 ? "btn-primary" : "btn-quiet"}`}>
            <FlaskConical size={16} aria-hidden /> Join the {PLATFORM[k].name} test
          </a>
        ))}
        {none.map(([k, v]) => {
          const { Icon } = PLATFORM[k];
          return (
            <span key={k} className="btn btn-off" aria-disabled="true" title={v.note}>
              <Icon size={16} aria-hidden /> {v.label}
            </span>
          );
        })}
      </div>

      {closed.map(([k, v]) => {
        const account = k === "android" ? "Google account" : "Apple ID";
        const draft = {
          subject: `Tester access: ${p.name} on ${PLATFORM[k].name}`,
          body: `The ${account} email I use on my phone:\n`,
        };
        return (
          <div key={k} id={`join-${k}`} className="card mt-4 max-w-[34rem] scroll-mt-24 p-4 text-sm">
            <p className="font-semibold">Join the {PLATFORM[k].name} test</p>
            <p className="mt-1 text-ink-3">{v.note || v.label}.</p>
            <ol className="mt-3 grid gap-3">
              <li>
                <span className="text-ink-2">1. Send me the {account} email you use on your phone.</span>
                <span className="mt-2 flex flex-wrap gap-2">
                  <a href={gmailCompose(draft)} target="_blank" rel="noopener" className="btn btn-quiet">
                    <Mail size={16} aria-hidden /> Write in Gmail
                  </a>
                  <a href={mailto(draft)} className="btn btn-quiet">Open mail app</a>
                  <CopyButton text={profile.email} />
                </span>
              </li>
              <li>
                <span className="text-ink-2">
                  2. I add you and reply, usually within two working days.
                  {v.testUrl ? " Then open the test page on your phone:" : " The reply carries the install link."}
                </span>
                {v.testUrl && (
                  <span className="mt-2 flex">
                    <a href={v.testUrl} target="_blank" rel="noopener" className="btn btn-quiet">
                      <ExternalLink size={16} aria-hidden /> {k === "android" ? "Google Play test page" : "TestFlight"}
                    </a>
                  </span>
                )}
              </li>
            </ol>
          </div>
        );
      })}
    </>
  );
}

/** How it is paid for, in one line: the model, never a price, then ads and
 *  analytics only where they are known. */
function paidLine(p: Product): string {
  const bits = [MODEL_LABEL[p.model]];
  if (p.ads) bits.push(p.ads === "None" ? "no ads" : `ads: ${p.ads.toLowerCase()}`);
  if (p.analytics) bits.push(p.analytics === "None" ? "no analytics" : `analytics: ${p.analytics}`);
  return bits.join(" · ");
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) notFound();

  const study = studyBySlug(p.slug);
  const media = mediaFor(p.slug);
  const icon = media.icon;
  const shots = shotsOf(p, 3);
  const embed = embedPathOf(p);
  const galleries = galleriesFor(p.slug);
  const withheld = withheldFor(p.slug);
  const wiki = wikiOf(p.slug);
  const levels = onBoard(p) ? levelsOf(p) : null;
  const reached = levels ? STAGES[levels.findLastIndex((v) => v > 0)] : null;
  const next = products[(products.indexOf(p) + 1) % products.length];
  const facts = (study?.facts ?? []).slice(0, 3);

  return (
    <>
      <SiteHeader on="work" />
      <main id="main">
        {/* What it is and how to get it. */}
        <div className="hero-wash">
          <section className="wrap grid items-center gap-10 pb-10 pt-8 lg:grid-cols-[1.1fr_1fr] lg:pt-10">
            <div>
              <p className="text-sm text-ink-3">
                <Link href="/work/" className="hover:text-ink">Work</Link> / {p.name}
              </p>
              <div className="mt-4 flex items-center gap-4">
                {icon && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={icon} alt="" width={52} height={52} className="h-13 w-13 rounded-xl border border-line" />
                )}
                <div>
                  <h1 className="page-title">{p.name}</h1>
                  <div className="mt-1.5">
                    <StatePill p={p} />
                  </div>
                </div>
              </div>
              <p className="mt-4 max-w-[52ch] text-lead text-ink-2">{study?.lead ?? `${p.tagline} ${p.blurb}`}</p>
              <Access p={p} />
              <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                {p.legal.privacy && <a href={p.legal.privacy} className="text-link">Privacy policy</a>}
                {p.legal.delete && <a href={p.legal.delete} className="text-link">Delete account</a>}
                <Link href="/support/" className="text-link">Support</Link>
              </p>
            </div>

            {/* The product's own pictures: its design screen, live, or its store art. */}
            <div>
              {embed ? (
                <>
                  <div className={`overflow-hidden border border-line-strong shadow-lg ${isPhoneEmbed(p) ? "mx-auto w-56 rounded-xl" : "rounded-lg"}`}>
                    <Embed src={embed} title={`${p.name} design screen`} phone={isPhoneEmbed(p)} />
                  </div>
                  {galleries.length > 0 && media.shots.length === 0 && (
                    <p className="mt-3 text-center text-xs text-ink-3">A screen from the design set, live. Nothing is built or captured yet.</p>
                  )}
                  {/* It has an app as well as a site: the app's shots sit under. */}
                  {shots.length > 0 && (
                    <div className="mx-auto mt-4 grid max-w-xs grid-cols-3 gap-3">
                      {shots.map((s) => (
                        <ShotImage key={s.src} shot={s} name={p.name} className="shot--lift" />
                      ))}
                    </div>
                  )}
                </>
              ) : shots.length > 0 ? (
                <div className="mx-auto grid max-w-md grid-cols-3 gap-3">
                  {shots.map((s) => (
                    <ShotImage key={s.src} shot={s} name={p.name} className="shot--lift" />
                  ))}
                </div>
              ) : (
                <div className="slot grid aspect-[16/9] place-items-center rounded-lg">
                  <p className="eyebrow">{hasBuild(p) ? "No screenshot yet" : "No screenshot — nothing is built"}</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* The facts, in one ruled row. */}
        <section className="wrap py-8">
          <dl className="facts" style={{ "--n": facts.length + 1 + (reached ? 1 : 0) } as React.CSSProperties}>
            {facts.map((f) => (
              <Fact key={f.k} k={f.k} v={f.v} />
            ))}
            <Fact k={p.notBuilt ? "Will be paid for by" : "Paid for by"} v={paidLine(p)} />
            {reached && <Fact k="Stage reached" v={`${reached.name} — ${levels!.filter((v) => v === 2).length} of ${STAGES.length} done`} />}
          </dl>
          <div className="mt-4">
            <Chips items={study?.stack ?? p.stack} />
          </div>
        </section>

        {/* What it left behind: the screens and the reasoning. */}
        {(galleries.length > 0 || withheld.length > 0 || wiki) && (
          <section className="wrap grid gap-5 pb-10 sm:grid-cols-2">
            {galleries.map((g) => (
              /* A plain anchor: the gallery is the product's own static page.
                 One per surface, so a product with a phone app and a site
                 links to both charts. */
              <a key={g.surface} href={g.href} className="card flex items-center gap-4 p-5">
                <Workflow size={24} className="shrink-0 text-brand-500" aria-hidden />
                <span>
                  <span className="block text-body font-bold">
                    {screensFor(p.slug).filter((x) => x.surface === g.surface).length} {g.surface} screens
                  </span>
                  <span className="text-sm text-ink-2">Open the flow chart, and every screen as a live page.</span>
                </span>
              </a>
            ))}
            {withheld.map((w) => (
              <div key={w.surface} className="card flex items-center gap-4 border-dashed p-5">
                <Workflow size={24} className="shrink-0 text-ink-3" aria-hidden />
                <span>
                  <span className="block text-body font-bold">Design set withheld ({w.surface})</span>
                  <span className="text-sm text-ink-2">Drawn, but it does not pass the style guide yet: {w.failed.map((c) => c.id).join(", ")}.</span>
                </span>
              </div>
            ))}
            {wiki && (
              <Link href={wikiHref(p.slug)} className="card flex items-center gap-4 p-5">
                <BookOpen size={24} className="shrink-0 text-brand-500" aria-hidden />
                <span>
                  <span className="block text-body font-bold">{wiki.total} pages in the wiki</span>
                  <span className="text-sm text-ink-2">Why each screen is drawn the way it is, and every decision.</span>
                </span>
              </Link>
            )}
          </section>
        )}

        {/* The write-up: one column, headings and paragraphs, nothing nested. */}
        <section className="border-t border-line bg-surface">
          <div className="wrap py-10">
            <div className="max-w-[70ch]">
              {study ? (
                study.sections.map((s, i) => (
                  <div key={s.h} className={i > 0 ? "mt-8" : ""}>
                    <h2 className="section-title">{s.h}</h2>
                    {s.p?.map((t) => (
                      <p key={t.slice(0, 32)} className="mt-3 text-body text-ink-2">{t}</p>
                    ))}
                    {s.list && <Points items={s.list} />}
                  </div>
                ))
              ) : p.features.length > 0 ? (
                <>
                  <h2 className="section-title">What it does</h2>
                  <Points items={p.features.map((f) => ({ t: f.title, b: f.body }))} />
                </>
              ) : (
                <>
                  <h2 className="section-title">What it is</h2>
                  <p className="mt-3 text-body text-ink-2">{p.blurb}</p>
                </>
              )}
              <p className="mt-6 text-sm text-ink-3">{p.modelDetail}</p>
            </div>
          </div>
        </section>

        <section className="wrap py-6">
          <div className="flex items-center justify-between gap-4">
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

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="eyebrow">{k}</dt>
      <dd className="mt-1 text-sm font-semibold">{v}</dd>
    </div>
  );
}

/** A point is a bold lead and what follows it. Where the two halves are one
 *  sentence — "Shows a range" + "where a single number would be false" — they
 *  run on in one line; where the second half is its own sentence, it sits under. */
function Points({ items }: { items: { t: string; b: string }[] }) {
  return (
    <dl className="mt-3">
      {items.map((f) => {
        const runsOn = /^[a-z—–-]/.test(f.b);
        return (
          <div key={f.t} className="border-t border-line py-3 text-body first:border-t-0 first:pt-0">
            <dt className={runsOn ? "inline font-semibold" : "font-semibold"}>{f.t}</dt>{" "}
            <dd className={runsOn ? "inline text-ink-2" : "mt-0.5 text-base text-ink-2"}>{f.b}</dd>
          </div>
        );
      })}
    </dl>
  );
}
