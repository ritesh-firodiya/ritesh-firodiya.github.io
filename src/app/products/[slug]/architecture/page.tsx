import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArchitectureMap } from "@/components/architecture-map";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { architectureHref, architectureOf, architectureSlugs } from "@/lib/architecture";
import { bySlug } from "@/lib/products";

export function generateStaticParams() {
  return architectureSlugs.filter(bySlug).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p || !architectureOf(slug)) return {};
  return {
    title: `${p.name} architecture`,
    description: `How ${p.name} fits together: its parts, and the path of each thing a user does.`,
    alternates: { canonical: architectureHref(slug) },
  };
}

export default async function ArchitecturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = bySlug(slug);
  const architecture = architectureOf(slug);
  if (!p || !architecture) notFound();

  return (
    <>
      <SiteHeader on="work" />
      <main id="main" className="wrap pb-10 pt-6">
        <p className="text-sm text-ink-3">
          <Link href="/#work" className="hover:text-ink">Work</Link> /{" "}
          <Link href={`/products/${slug}/`} className="hover:text-ink">{p.name}</Link> / Architecture
        </p>
        <h1 className="page-title mt-2">{p.name} architecture</h1>
        <p className="mt-2 text-ink-3">The parts of {p.name}, and the path of each thing a user does.</p>
        <div className="mt-5">
          <ArchitectureMap architecture={architecture} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
