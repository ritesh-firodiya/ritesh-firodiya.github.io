import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { WikiRail } from "@/components/wiki";
import { WikiIndex, type Group } from "@/components/wiki-index";
import { bySlug } from "@/lib/products";
import { WIKI_TYPES, wikiHref, wikiOf, wikiPages, wikiSlugs } from "@/lib/wiki";

export function generateStaticParams() {
  return wikiSlugs.filter(bySlug).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = bySlug(slug);
  const wiki = wikiOf(slug);
  if (!p || !wiki) return {};
  return {
    title: `${p.name} wiki`,
    description: `The ${wiki.total} pages of the ${p.name} wiki: why each screen is drawn the way it is, the rules the product keeps, and every decision with its reason.`,
    alternates: { canonical: wikiHref(slug) },
  };
}

export default async function WikiIndexPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = bySlug(slug);
  const wiki = wikiOf(slug);
  if (!p || !wiki) notFound();

  const pages = wikiPages(slug);
  const groups: Group[] = WIKI_TYPES.map((t) => ({
    type: t.type,
    label: t.label,
    second: t.type === "surfaces" ? "Screen" : t.type === "decisions" ? "Decided" : "Owns",
    rows: pages.filter((x) => x.type === t.type).map((x) => ({ slug: x.slug, owns: x.owns, href: wikiHref(slug, x) })),
  })).filter((g) => g.rows.length > 0);

  return (
    <>
      <SiteHeader on="process" />
      <main id="main" className="wrap pb-12 pt-8 lg:pt-10">
        <div className="grid gap-10 lg:grid-cols-[15rem_1fr]">
          <WikiRail p={p} />
          <div className="min-w-0">
            <p className="text-sm text-ink-3">
              <Link href="/work/" className="hover:text-ink">Work</Link> /{" "}
              <Link href={`/products/${slug}/`} className="hover:text-ink">{p.name}</Link> / Wiki
            </p>
            <h1 className="page-title mt-3">{p.name} wiki</h1>
            <p className="mt-3 max-w-[60ch] text-lead text-ink-2">
              What a picture cannot hold: the rules that only break across screens, the product&rsquo;s own names and
              numbers, and why each screen is drawn the way it is.
            </p>
            <p className="mt-4 font-mono text-xs text-ink-3">
              {wiki.total} pages{wiki.verified ? ` · last verified ${wiki.verified}` : ""}
            </p>
            <WikiIndex groups={groups} total={wiki.total} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
