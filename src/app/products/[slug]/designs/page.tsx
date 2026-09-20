import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Label } from "@/components/pills";
import { products, bySlug, screensFor, designsGeneratedOn } from "@/lib/products";

export function generateStaticParams() {
  return products.filter((p) => screensFor(p.slug).length > 0).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) return {};
  return {
    title: `${p.name} — designs`,
    description: `The ${screensFor(slug).length} design screens ${p.name} was built from — the original HTML wireframes, rendering live.`,
  };
}

export default async function DesignsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) notFound();
  const screens = screensFor(slug);
  if (screens.length === 0) notFound();

  // Group by the folder the screen lives in — that is the app's own flow
  // structure, so the index mirrors how the product is actually organised.
  const groups = new Map<string, typeof screens>();
  for (const s of screens) {
    const k = s.area ?? s.surface;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(s);
  }

  return (
    <>
      <SiteHeader active="/products" />
      <main id="main">
        <section className="mx-auto max-w-page px-gutter pb-6 pt-section">
          <Link href={`/products/${p.slug}/`} className="link-u inline-flex items-center gap-1.5 text-small text-ink-3 hover:text-ink">
            ← {p.name}
          </Link>
          <Label>
            {screens.length} screens · {groups.size} areas · synced {designsGeneratedOn}
          </Label>
          <h1 className="mt-2 max-w-[22ch] font-display text-d1 font-semibold">
            {p.name} — every screen
          </h1>
          <p className="mt-3 max-w-measure text-body text-ink-2">
            The original HTML wireframes this was built from, rendering live. Not screenshots —
            open any of them full size.
          </p>
        </section>

        {[...groups.entries()].map(([area, items]) => (
          <section key={area} className="mx-auto max-w-page px-gutter pb-section">
            <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
              <h2 className="font-display text-h2 font-semibold capitalize">{area.replace(/-/g, " ")}</h2>
              <span className="font-mono text-xs2 text-ink-3">{items.length}</span>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((s) => (
                <figure key={s.path} className="min-w-0">
                  <div className="overflow-hidden rounded-card border border-line bg-surface">
                    <iframe src={s.path} title={s.title} loading="lazy" className="h-[420px] w-full border-0" />
                  </div>
                  <figcaption className="mt-2">
                    <a href={s.path} className="link-u block truncate text-small font-medium hover:text-accent">
                      {s.title}
                    </a>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
