import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Apple, ArrowLeft, Ban, ExternalLink, FlaskConical, Mail, Monitor, Play, Users, type LucideIcon } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { StatePill, SurfaceTags } from "@/components/ui";
import { ProductPicture } from "@/components/picture";
import { gmailCompose } from "@/lib/mail";
import { products, bySlug, mediaFor, galleriesFor, screensFor, sheetFor, type Platform, type Product } from "@/lib/products";
import { studyBySlug } from "@/lib/case-studies";
import { wikiOf, wikiHref } from "@/lib/wiki";
import { zenoFor } from "@/lib/zeno";
import { funnelFor } from "@/lib/funnel";
import { flowFor } from "@/lib/flow";
import { Funnel } from "@/components/funnel";

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

/** Why there is nothing to install, for a product with no door at all. */
function noDoorReason(p: Product): string {
  if (p.notBuilt) return "Not built yet — designs only";
  return p.unreleasedNote ?? "Not released yet";
}

function Access({ p }: { p: Product }) {
  const doors = doorsOf(p);
  const steps = stepsOf(p);
  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        {doors.length === 0 ? (
          <button type="button" className="btn btn-quiet" disabled>
            <Ban size={16} aria-hidden /> {noDoorReason(p)}
          </button>
        ) : (
          doors.map((d, i) => (
            <a key={d.key} href={d.href} target="_blank" rel="noopener" title={d.title} className={`btn ${i === 0 ? "btn-primary" : "btn-quiet"}`}>
              <d.Icon size={16} aria-hidden /> {d.label}
            </a>
          ))
        )}
      </div>
      {steps.length > 0 && (
        <details className="mt-2 text-sm text-ink-3">
          <summary className="cursor-pointer text-ink-2">How to join the test</summary>
          <ul className="mt-1.5 max-w-[58ch] space-y-1">
            {steps.map((s) => (
              <li key={s.key}>
                <strong className="text-ink-2">{s.who}:</strong> {s.text}
              </li>
            ))}
          </ul>
        </details>
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
    : p.features.length > 0
      ? [{ h: "What it does", list: p.features.map((f) => ({ t: f.title, b: f.body })) }]
      : [];

  const zeno = zenoFor(p.slug);
  const funnel = funnelFor(p.slug);
  const flow = flowFor(p.slug);

  return (
    <>
      <SiteHeader on="work" />
      <main id="main" className="wrap pb-12">
        <section className="glow -mx-4 grid items-center gap-6 px-4 py-6 md:-mx-7 md:px-7 lg:grid-cols-[1fr_1fr]">
          <div>
            <Link href="/#work" className="inline-flex items-center gap-1 text-sm text-ink-3 hover:text-ink">
              <ArrowLeft size={14} aria-hidden /> Work
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={icon} alt="" width={40} height={40} className="app-icon" />
              ) : (
                <span className="app-icon app-icon--none" aria-hidden>
                  {p.name[0].toUpperCase()}
                </span>
              )}
              <h1 className="page-title grad-text">{p.name}</h1>
              <StatePill p={p} />
            </div>
            <p className="mt-2 text-lead text-ink-2">{p.tagline}</p>
            <p className="mt-2.5 flex flex-wrap gap-1.5">
              <SurfaceTags p={p} />
              {(study?.stack ?? p.stack).map((x) => (
                <span key={x} className="chip">
                  {x}
                </span>
              ))}
            </p>
            <Access p={p} />
          </div>
          <ProductPicture p={p} />
        </section>

        {/* One strip, the same four facts on every product page. A fact with
            nothing behind it says so rather than dropping out. */}
        <dl className="glass grid grid-cols-2 gap-px overflow-hidden text-sm md:grid-cols-4">
          <div className="p-3">
            <dt className="text-xs text-ink-3">Screens</dt>
            <dd className="mt-0.5">
              {galleries.length === 0 ? (
                <span className="text-ink-3">None yet</span>
              ) : (
                galleries.map((g, i) => (
                  <span key={g.surface}>
                    {i > 0 && " · "}
                    {/* Plain anchors: a design set is the product's own static page. */}
                    <a href={sheetFor(p.slug, g)} target="_blank" rel="noopener" className="text-link">
                      {count(g.surface)} {g.surface}
                    </a>
                  </span>
                ))
              )}
            </dd>
          </div>
          <div className="p-3">
            <dt className="text-xs text-ink-3">Wiki</dt>
            <dd className="mt-0.5">
              {wiki ? (
                <Link href={wikiHref(p.slug)} className="text-link">
                  {wiki.total} pages
                </Link>
              ) : (
                <span className="text-ink-3">None yet</span>
              )}
            </dd>
          </div>
          <div className="p-3">
            <dt className="text-xs text-ink-3">Checked by zeno</dt>
            <dd className="mt-0.5">
              {zeno ? (
                <Link href="/products/zeno/" className="text-link">
                  {zeno.modules.length} modules{zeno.version ? ` · zeno ${zeno.version}` : ""}
                </Link>
              ) : (
                <span className="text-ink-3">Not on zeno yet</span>
              )}
            </dd>
          </div>
          <div className="p-3">
            <dt className="text-xs text-ink-3">Privacy</dt>
            <dd className="mt-0.5">
              {p.legal.privacy ? (
                <>
                  <a href={p.legal.privacy} className="text-link">
                    Policy
                  </a>
                  {p.legal.delete && (
                    <>
                      {" · "}
                      <a href={p.legal.delete} className="text-link">
                        delete account
                      </a>
                    </>
                  )}
                </>
              ) : (
                <span className="text-ink-3">{p.notBuilt ? "No app yet, no data" : "No policy published"}</span>
              )}
            </dd>
          </div>
        </dl>

        {flow && <Funnel name={p.name} flow={flow} release={funnel} />}

        <section className={`mt-3 grid gap-3 ${sections.length > 1 ? "md:grid-cols-2 lg:grid-cols-3" : ""}`}>
          {sections.length === 0 ? (
            <div className="slot grid place-items-center rounded-xl p-4 text-center">
              <p className="text-sm text-ink-3">
                <b className="block text-ink-2">No feature list yet</b>
                It is still being designed. The screens and wiki are linked above.
              </p>
            </div>
          ) : (
            sections.map((s) => (
              <div key={s.h} className="glass p-4">
                <h2 className="font-bold">{s.h}</h2>
                {s.p?.map((t) => (
                  <p key={t.slice(0, 32)} className="mt-1.5 text-sm text-ink-2">
                    {t}
                  </p>
                ))}
                {s.list && (
                  <ul className="mt-1.5 grid gap-1.5 text-sm text-ink-2">
                    {s.list.map((f) => (
                      <li key={f.t}>
                        {/* A body that carries on the title's sentence starts lowercase and
                        joins it; anything else is a sentence of its own. */}
                        <b className="font-semibold text-ink">{/^[a-z]/.test(f.b) ? f.t : `${f.t}.`}</b> {f.b.replace(/^[—–-]\s*/, "")}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
