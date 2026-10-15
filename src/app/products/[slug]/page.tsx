import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Apple, ArrowLeft, BookOpen, ExternalLink, FlaskConical, Mail, Monitor, Play, Smartphone, Users, type LucideIcon } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Chips, StatePill, SurfaceTags } from "@/components/ui";
import { ProductPicture } from "@/components/picture";
import { gmailCompose } from "@/lib/mail";
import { products, bySlug, mediaFor, galleriesFor, screensFor, sheetFor, type Platform, type Product } from "@/lib/products";
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
 * Every way to get the product, as one row of buttons. Each opens in a new
 * tab: they all leave this site.
 *
 *   live / beta  the store, the site, the public TestFlight
 *   closed       the direct way in, where there is one: the Google Group and
 *                then the Play opt-in page on Android, the TestFlight link on
 *                iOS. Only a track with no door of its own falls back to a
 *                written email asking to be added.
 */
type Door = { key: string; href: string; label: string; Icon: LucideIcon; title?: string };

function doorsOf(p: Product): Door[] {
  const platforms = Object.entries(p.platforms).filter(([, v]) => v) as [string, Platform][];
  const doors: Door[] = [];
  for (const [k, v] of platforms) {
    if (v.state !== "live" && v.state !== "beta") continue;
    doors.push({ key: k, href: v.url!, label: v.label, Icon: k === "web" ? ExternalLink : PLATFORM[k].Icon });
  }
  for (const [k, v] of platforms) {
    if (v.state !== "closed") continue;
    const name = PLATFORM[k].name;
    if (k === "android" && v.groupUrl && v.testUrl) {
      doors.push({ key: `${k}-group`, href: v.groupUrl, label: "1. Join the tester group", Icon: Users, title: "One click, no approval" });
      doors.push({ key: `${k}-install`, href: v.testUrl, label: "2. Install from Play", Icon: Play, title: "Use the same Google account" });
    } else if (k === "ios" && v.testUrl) {
      doors.push({ key: k, href: v.testUrl, label: "Join on TestFlight", Icon: FlaskConical, title: v.note || v.label });
    } else {
      const account = k === "android" ? "Google account" : "Apple ID";
      const draft = {
        subject: `Tester access: ${p.name} on ${name}`,
        body: `Please add me to the ${p.name} test.\nThe ${account} email I use on my phone:\n`,
      };
      doors.push({ key: k, href: gmailCompose(draft), label: `Ask to join the ${name} test`, Icon: Mail, title: v.note || v.label });
    }
  }
  return doors;
}

/**
 * What a tester does after the button, written out. It used to live in each
 * button's title, which a phone never shows, and testers got stuck at exactly
 * these two places: a test app is not in Play search, and an iPhone beta is
 * not in the App Store.
 */
const STEPS = {
  android: "join the group with the Google account on your phone. Then open step 2, tap Become a tester, and use its Google Play link. A test app does not show up in Play search.",
  ios: "install TestFlight from the App Store first, then open the link. The app installs through TestFlight, not from the App Store.",
};

const isTestFlight = (url?: string | null) => !!url && url.startsWith("https://testflight.apple.com/");

function stepsOf(p: Product): { key: string; who: string; text: string }[] {
  const { android, ios } = p.platforms;
  const steps = [];
  if (android?.state === "closed" && android.groupUrl && android.testUrl) steps.push({ key: "android", who: "Android", text: STEPS.android });
  if (ios && (isTestFlight(ios.testUrl) || (ios.state === "beta" && isTestFlight(ios.url)))) steps.push({ key: "ios", who: "iPhone", text: STEPS.ios });
  return steps;
}

function Access({ p }: { p: Product }) {
  const doors = doorsOf(p);
  if (doors.length === 0) return null;
  const steps = stepsOf(p);
  return (
    <>
      <div className="mt-3 flex flex-wrap gap-2">
        {doors.map((d, i) => (
          <a key={d.key} href={d.href} target="_blank" rel="noopener" title={d.title} className={`btn ${i === 0 ? "btn-primary" : "btn-quiet"}`}>
            <d.Icon size={16} aria-hidden /> {d.label}
          </a>
        ))}
      </div>
      {steps.length > 0 && (
        <ul className="mt-2 max-w-[58ch] space-y-1 text-sm text-ink-3">
          {steps.map((s) => (
            <li key={s.key}>
              <strong className="text-ink-2">{s.who}:</strong> {s.text}
            </li>
          ))}
        </ul>
      )}
    </>
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
        <section className="grid items-center gap-6 py-5 lg:grid-cols-[1fr_1fr]">
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
            <p className="mt-2.5 max-w-[58ch] text-body text-ink-2">{study?.lead ?? `${p.tagline} ${p.blurb}`}</p>
            <Access p={p} />
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {/* Plain anchors: a design set is the product's own static page.
                  Each opens its contact sheet in a new tab. */}
              {galleries.map((g) => {
                const Icon = g.surface === "mobile" ? Smartphone : Monitor;
                return (
                  <a key={g.surface} href={sheetFor(p.slug, g)} target="_blank" rel="noopener" className="text-link inline-flex items-center gap-1">
                    <Icon size={14} aria-hidden /> {count(g.surface)} {g.surface} screens
                  </a>
                );
              })}
              {wiki && (
                <Link href={wikiHref(p.slug)} className="text-link inline-flex items-center gap-1">
                  <BookOpen size={14} aria-hidden /> {wiki.total} wiki pages
                </Link>
              )}
              {p.legal.privacy && <a href={p.legal.privacy} className="text-ink-3 hover:text-ink">Privacy</a>}
              {p.legal.delete && <a href={p.legal.delete} className="text-ink-3 hover:text-ink">Delete account</a>}
            </p>
            <div className="mt-3">
              <Chips items={study?.stack ?? p.stack} />
            </div>
          </div>
          <ProductPicture p={p} />
        </section>

        {sections.length > 0 && (
          <section className="gap-x-10 border-t border-line pt-5 lg:columns-2">
            {sections.map((s) => (
              <div key={s.h} className="mb-5 break-inside-avoid">
                <h2 className="section-title">{s.h}</h2>
                {s.p?.map((t) => (
                  <p key={t.slice(0, 32)} className="mt-1.5 max-w-[68ch] text-base text-ink-2">{t}</p>
                ))}
                {s.list && (
                  <ul className="mt-1.5 grid max-w-[68ch] gap-1.5 text-base">
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
