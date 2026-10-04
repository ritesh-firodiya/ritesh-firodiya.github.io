import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Apple, ArrowLeft, BookOpen, ExternalLink, FlaskConical, Monitor, Play, type LucideIcon } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Chips, StatePill, SurfaceTags } from "@/components/ui";
import { ProductPicture } from "@/components/picture";
import { gmailCompose } from "@/lib/mail";
import { products, bySlug, mediaFor, galleriesFor, screensFor, type Platform, type Product } from "@/lib/products";
import { studyBySlug } from "@/lib/case-studies";
import { wikiOf, wikiHref } from "@/lib/wiki";

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
 *   live / beta  the store, the site, the public TestFlight
 *   closed       a build behind a tester list: the button opens a written
 *                email asking to be added, and the store's test page sits
 *                beside it where there is one
 */
function Access({ p }: { p: Product }) {
  const platforms = Object.entries(p.platforms).filter(([, v]) => v) as [string, Platform][];
  const open = platforms.filter(([, v]) => v.state === "live" || v.state === "beta");
  const closed = platforms.filter(([, v]) => v.state === "closed");
  if (open.length + closed.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {open.map(([k, v], i) => {
        const { Icon } = PLATFORM[k];
        return (
          <a key={k} href={v.url!} className={`btn ${i === 0 ? "btn-primary" : "btn-quiet"}`}>
            {k === "web" ? <ExternalLink size={16} aria-hidden /> : <Icon size={16} aria-hidden />} {v.label}
          </a>
        );
      })}
      {closed.map(([k, v], i) => {
        const account = k === "android" ? "Google account" : "Apple ID";
        const draft = {
          subject: `Tester access: ${p.name} on ${PLATFORM[k].name}`,
          body: `Please add me to the ${p.name} test.\nThe ${account} email I use on my phone:\n`,
        };
        return (
          <span key={k} className="contents">
            <a
              href={gmailCompose(draft)}
              target="_blank"
              rel="noopener"
              title={v.note || v.label}
              className={`btn ${open.length === 0 && i === 0 ? "btn-primary" : "btn-quiet"}`}
            >
              <FlaskConical size={16} aria-hidden /> Join the {PLATFORM[k].name} test
            </a>
            {v.testUrl && (
              <a href={v.testUrl} target="_blank" rel="noopener" className="btn btn-quiet">
                <ExternalLink size={16} aria-hidden /> {k === "android" ? "Play test page" : "TestFlight"}
              </a>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) notFound();

  const study = studyBySlug(p.slug);
  const icon = mediaFor(p.slug).icon;
  const galleries = galleriesFor(p.slug);
  const wiki = wikiOf(p.slug);
  const count = (surface: string) => screensFor(p.slug).filter((x) => x.surface === surface).length;
  const sections = study
    ? study.sections
    : p.features.length > 1
      ? [{ h: "What it does", list: p.features.map((f) => ({ t: f.title, b: f.body })) }]
      : [];

  return (
    <>
      <SiteHeader on="work" />
      <main id="main" className="wrap pb-10">
        <section className="grid items-center gap-8 py-6 lg:grid-cols-[1fr_1fr]">
          <div>
            <Link href="/#work" className="inline-flex items-center gap-1 text-sm text-ink-3 hover:text-ink">
              <ArrowLeft size={14} aria-hidden /> Work
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              {icon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={icon} alt="" width={40} height={40} className="h-10 w-10 rounded-lg border border-line" />
              )}
              <h1 className="page-title">{p.name}</h1>
              <StatePill p={p} />
              <SurfaceTags p={p} />
            </div>
            <p className="mt-3 max-w-[58ch] text-body text-ink-2">{study?.lead ?? `${p.tagline} ${p.blurb}`}</p>
            <Access p={p} />
            <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {/* Plain anchors: a design set is the product's own static page. */}
              {galleries.map((g) => (
                <a key={g.surface} href={g.href} className="text-link">
                  {count(g.surface)} {g.surface} screens
                </a>
              ))}
              {wiki && (
                <Link href={wikiHref(p.slug)} className="text-link inline-flex items-center gap-1">
                  <BookOpen size={14} aria-hidden /> {wiki.total} wiki pages
                </Link>
              )}
              {p.legal.privacy && <a href={p.legal.privacy} className="text-ink-3 hover:text-ink">Privacy</a>}
              {p.legal.delete && <a href={p.legal.delete} className="text-ink-3 hover:text-ink">Delete account</a>}
            </p>
            <div className="mt-4">
              <Chips items={study?.stack ?? p.stack} />
            </div>
          </div>
          <ProductPicture p={p} />
        </section>

        {sections.length > 0 && (
          <section className="grid gap-x-10 gap-y-6 border-t border-line pt-6 lg:grid-cols-2">
            {sections.map((s) => (
              <div key={s.h}>
                <h2 className="text-h3 font-bold">{s.h}</h2>
                {s.p?.map((t) => (
                  <p key={t.slice(0, 32)} className="mt-2 text-base text-ink-2">{t}</p>
                ))}
                {s.list && (
                  <ul className="mt-2 grid gap-1.5 text-base">
                    {s.list.map((f) => (
                      <li key={f.t}>
                        <b className="font-semibold">{f.t}</b>{" "}
                        <span className="text-ink-2">{/^[a-z—–-]/.test(f.b) ? f.b : `— ${f.b}`}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
