import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { published, noteBySlug } from "@/lib/notes";

export function generateStaticParams() {
  return published.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const n = noteBySlug(slug);
  return n ? { title: n.title, description: n.kicker } : {};
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = noteBySlug(slug);
  if (!n) notFound();

  return (
    <>
      <SiteHeader active="/notes" />
      <main id="main">
        <article>
          <div className="mx-auto max-w-page px-gutter pb-10 pt-section">
            <Link href="/notes" className="link-u inline-flex items-center gap-1.5 text-small text-ink-3 hover:text-ink">← Notes</Link>
            <p className="mt-7 font-mono text-xs2 uppercase tracking-label text-ink-3">
              {n.date} · {n.topic} · {n.readingTime}
            </p>
            <h1 className="mt-4 max-w-[20ch] font-display text-d1 font-semibold">{n.title}</h1>
          </div>

          <div className="mx-auto max-w-page px-gutter pb-section">
            <div className="max-w-prose space-y-6 text-body text-ink-2">
              {n.lede && <p className="text-lead">{n.lede}</p>}
              {n.body?.map((b, i) => (
                <section key={i} className="space-y-6">
                  {b.h && <h2 className="pt-4 font-display text-h2 font-semibold text-ink">{b.h}</h2>}
                  {b.p.map((para, j) => <p key={j}>{para}</p>)}
                </section>
              ))}
            </div>

            <div className="mt-12 max-w-prose rounded-card border border-line bg-paper-2 p-7">
              <p className="font-mono text-label uppercase tracking-label text-ink-3">The result</p>
              <p className="mt-3 text-body text-ink-2">Every app&rsquo;s real model, including the inconvenient ones.</p>
              <Link href="/products" className="mt-4 inline-flex items-center gap-2 rounded-pill bg-ink px-4 py-2 text-small font-medium text-ink-inv transition hover:bg-accent">
                See the table →
              </Link>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
