import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Label } from "@/components/pills";
import { IconBack, IconExternal } from "@/components/icons";
import {
  products,
  bySlug,
  screensFor,
  galleriesFor,
  designsGeneratedOn,
} from "@/lib/products";

/* This page deliberately does NOT lay the screens out itself.
   Every design set already ships an index.html — the gallery the app was
   actually designed and reviewed against, written alongside the screens in its
   own repo. A second, prettier grid invented here would be a different
   document that drifts the moment a screen is added. So the real page is
   embedded, and the site only supplies the frame around it. */

export function generateStaticParams() {
  return products
    .filter((p) => galleriesFor(p.slug).length > 0)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) return {};
  return {
    title: `${p.name} — designs`,
    description: `The design gallery ${p.name} was built from: ${screensFor(slug).length} HTML wireframes, rendering live.`,
  };
}

const SURFACE_LABEL: Record<string, string> = { mobile: "Phone", web: "Web" };

export default async function DesignsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) notFound();
  const galleries = galleriesFor(slug);
  if (galleries.length === 0) notFound();
  const screens = screensFor(slug);

  return (
    <>
      <SiteHeader active="/products" />
      <main id="main">
        <section className="mx-auto max-w-page px-gutter pb-5 pt-section">
          <Link
            href={`/products/${p.slug}/`}
            className="link-u inline-flex items-center gap-1.5 text-small text-ink-3 hover:text-ink"
          >
            <IconBack size={14} strokeWidth={1.75} aria-hidden /> {p.name}
          </Link>
          <Label>
            {screens.length} screens · synced {designsGeneratedOn}
          </Label>
          <h1 className="mt-2 max-w-[22ch] font-display text-d1 font-semibold">
            {p.name} — the design set
          </h1>
          <p className="mt-3 max-w-measure text-body text-ink-2">
            The gallery from {p.name}&rsquo;s own repository, unchanged — the page the screens
            were reviewed against. Every frame below is live HTML, not a screenshot, so open
            one and click through it the way the app is meant to read.
          </p>
        </section>

        {galleries.map((g) => (
          <section key={g.path} className="mx-auto max-w-page px-gutter pb-section">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line pb-2">
              <h2 className="font-display text-h2 font-semibold">
                {SURFACE_LABEL[g.surface] ?? g.surface}
              </h2>
              <a
                href={g.path}
                className="link-u inline-flex items-center gap-1.5 font-mono text-xs2 text-ink-3 hover:text-accent"
              >
                Open full size <IconExternal size={13} strokeWidth={1.75} aria-hidden />
              </a>
            </div>
            {/* Tall by design: this is a gallery page, and a short frame turns it
                into a scroll-within-a-scroll that nobody reaches the bottom of. */}
            <div className="mt-4 overflow-hidden rounded-card border border-line bg-surface shadow-lift">
              <iframe
                src={g.path}
                title={`${p.name} — ${SURFACE_LABEL[g.surface] ?? g.surface} design gallery`}
                loading="lazy"
                className="h-[min(85vh,900px)] w-full border-0"
              />
            </div>
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
