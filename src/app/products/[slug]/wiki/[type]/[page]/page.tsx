import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Chips } from "@/components/ui";
import { Embed } from "@/components/embed";
import { WikiRail } from "@/components/wiki";
import { bySlug } from "@/lib/products";
import { WIKI_TYPES, wikiHref, wikiPage, wikiPages, wikiSlugs } from "@/lib/wiki";

type Params = { slug: string; type: string; page: string };

export function generateStaticParams(): Params[] {
  return wikiSlugs
    .filter(bySlug)
    .flatMap((slug) => wikiPages(slug).map((x) => ({ slug, type: x.type, page: x.slug })));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug, type, page } = await params;
  const p = bySlug(slug);
  const w = wikiPage(slug, type, page);
  if (!p || !w) return {};
  return {
    title: `${w.slug} — ${p.name} wiki`,
    description: w.summary || `${w.slug}, a page of the ${p.name} wiki.`,
    alternates: { canonical: wikiHref(slug, w) },
  };
}

export default async function WikiPageRoute({ params }: { params: Promise<Params> }) {
  const { slug, type, page } = await params;
  const p = bySlug(slug);
  const w = wikiPage(slug, type, page);
  if (!p || !w) notFound();

  const kind = WIKI_TYPES.find((t) => t.type === w.type)!;
  const all = wikiPages(slug);
  const linkedFrom = w.backlinks.map((b) => all.find((x) => x.slug === b)).filter((x) => x !== undefined);
  /* The frontmatter is what tells a reader how far to trust the page, so it is
     shown rather than dropped. */
  const meta = [kind.one, w.status, w.lastVerified ? `verified ${w.lastVerified}` : null].filter((x): x is string => Boolean(x));

  return (
    <>
      <SiteHeader on="work" />
      <main id="main" className="wrap pb-10 pt-6">
        <div className="grid gap-8 lg:grid-cols-[14rem_1fr_15rem]">
          <WikiRail p={p} on={w.type} />
          <article className="min-w-0">
            <p className="text-sm text-ink-3">
              <Link href="/#work" className="hover:text-ink">Work</Link> /{" "}
              <Link href={`/products/${slug}/`} className="hover:text-ink">{p.name}</Link> /{" "}
              <Link href={wikiHref(slug)} className="hover:text-ink">Wiki</Link> / {kind.label}
            </p>
            <h1 className="page-title mt-2 break-words">{w.slug}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Chips items={meta} />
              {w.id && <span className="font-mono text-xs text-ink-3">{w.id}</span>}
            </div>
            {/* The product's own Markdown, rendered at build time by
                scripts/sync-context.mjs. The site adds nothing to the text. */}
            <div className="wiki-prose mt-5" dangerouslySetInnerHTML={{ __html: w.html }} />
          </article>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            {w.wireframe && (
              <>
                <p className="eyebrow">The screen</p>
                <div className={`mt-3 overflow-hidden rounded-xl border border-line-strong ${w.wireframe.includes("/mobile/") ? "w-40" : "w-full"}`}>
                  <Embed src={w.wireframe} title={`${w.slug} wireframe`} phone={w.wireframe.includes("/mobile/")} />
                </div>
                <a href={w.wireframe} className="btn btn-quiet mt-4">
                  <ExternalLink size={16} aria-hidden /> Open the wireframe
                </a>
              </>
            )}
            {linkedFrom.length > 0 && (
              <>
                <p className={`eyebrow${w.wireframe ? " mt-8" : ""}`}>Linked from</p>
                <ul className="mt-2 grid gap-1.5 text-sm">
                  {linkedFrom.map((b) => (
                    <li key={b.slug} className="break-words">
                      <Link href={wikiHref(slug, b)} className="text-link">{b.slug}</Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
