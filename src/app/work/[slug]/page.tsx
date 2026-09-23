import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { StatePill, Label } from "@/components/pills";
import { CASE_STUDIES, studyBySlug } from "@/lib/case-studies";

export function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = studyBySlug(slug);
  return c ? { title: `${c.product} — case study`, description: c.title } : {};
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = studyBySlug(slug);
  if (!c) notFound();

  return (
    <>
      <SiteHeader />
      <main id="main">
        <article>
          <div className="mx-auto max-w-page px-gutter pb-12 pt-section">
            <Link href="/products" className="link-u inline-flex items-center gap-1.5 text-small text-ink-3 hover:text-ink">← Work</Link>
            <div className="mt-7 flex flex-wrap items-center gap-2">
              <StatePill state="live">{c.status}</StatePill>
              <span className="rounded-pill bg-muted px-2.5 py-1 font-mono text-label uppercase tracking-label text-ink-3">Solo build</span>
              <span className="rounded-pill bg-muted px-2.5 py-1 font-mono text-label uppercase tracking-label text-ink-3">{c.period}</span>
            </div>
            <h1 className="mt-6 max-w-[14ch] font-display text-d1 font-semibold">{c.product}</h1>
            <p className="mt-5 max-w-measure font-display text-lead italic text-ink-2">{c.title}</p>
            {c.link && (
              <a href={c.link.url} className="mt-9 inline-flex items-center gap-2 rounded-pill bg-ink px-4 py-2 text-small font-medium text-ink-inverse transition hover:bg-brand-500">
                Open {c.link.label} ↗
              </a>
            )}
          </div>

          <div className="mx-auto max-w-page px-gutter">
            <dl className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {c.facts.map((f) => (
                <div key={f.k} className="bg-surface px-5 py-5">
                  <dt className="font-mono text-label uppercase tracking-label text-ink-3">{f.k}</dt>
                  <dd className="mt-2 text-small text-ink">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mx-auto max-w-page px-gutter py-section">
            <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-20">
              <div className="max-w-prose">
                {c.sections.map((s) => (
                  <section key={s.h} className="[&:not(:first-child)]:mt-12">
                    <h2 className="font-display text-h2 font-semibold">{s.h}</h2>
                    {s.p?.map((para, i) => <p key={i} className="mt-4 text-body text-ink-2">{para}</p>)}
                    {s.list && (
                      <div className="mt-6 space-y-5">
                        {s.list.map((li) => (
                          <div key={li.t} className="rounded-card border border-line bg-surface p-5">
                            <p className="font-mono text-label uppercase tracking-label text-brand-500">{li.t}</p>
                            <p className="mt-2.5 text-small text-ink-2">{li.b}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
              <aside className="lg:sticky lg:top-24 lg:self-start">
                <Label>Stack</Label>
                <ul className="mt-3 space-y-1.5 text-small text-ink-2">
                  {c.stack.map((s) => <li key={s}>{s}</li>)}
                </ul>
                <div className="mt-8 rounded-card border border-line bg-muted p-5">
                  <p className="text-small text-ink-2">Building something in this shape?</p>
                  <Link href="/hire" className="mt-3 inline-flex items-center gap-1.5 text-small font-medium text-brand-500">Work with me →</Link>
                </div>
              </aside>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
