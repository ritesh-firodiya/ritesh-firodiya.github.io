import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, FileText, PencilRuler, Rocket } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Chips, HireBand } from "@/components/ui";
import { profile } from "@/lib/profile";
import { products, stageCounts } from "@/lib/products";
import { totalWikiPages, wikiSlugs, wikiHref } from "@/lib/wiki";

export const metadata: Metadata = {
  title: "About",
  description: "Who I am, how I work, and what I am looking for: a full-stack engineer and lead with about nine years of production TypeScript.",
  alternates: { canonical: "/about/" },
};

export default function AboutPage() {
  const last = profile.experiences[0];
  return (
    <>
      <SiteHeader on="about" />
      <main id="main">
        <section className="wrap grid gap-12 pb-14 pt-12 lg:grid-cols-[20rem_1fr] lg:pt-16">
          <aside>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/me.webp" alt={profile.name} width={640} height={640} className="aspect-square w-full max-w-[20rem] rounded-xl border border-line object-cover" />
            <dl className="card mt-5 grid gap-4 p-5 text-sm">
              <Fact k="Based in" v={profile.location} />
              <Fact k="Experience" v="About nine years, since 2017" />
              <Fact k="Last role" v={`${last.position}, ${last.company}`} />
              <Fact k="Open to" v="Senior / staff IC and tech-lead roles" />
            </dl>
          </aside>
          <div>
            <p className="eyebrow">About</p>
            <h1 className="page-title mt-3 max-w-[18ch]">I like owning the whole thing.</h1>
            <div className="mt-6 grid max-w-[66ch] gap-4 text-body text-ink-2">
              {profile.about.map((t) => (
                <p key={t.slice(0, 32)}>{t}</p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/resume/" className="btn btn-primary">
                <FileText size={16} aria-hidden /> Read the résumé
              </Link>
              <Link href="/contact/" className="btn btn-quiet">Get in touch</Link>
            </div>
          </div>
        </section>

        {/* Each habit links to where it can be checked. A value nobody can
            verify is decoration. */}
        <section className="border-y border-line bg-surface">
          <div className="wrap py-14">
            <p className="eyebrow">How I work</p>
            <h2 className="section-title mt-2">Three habits you can check on this site.</h2>
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="card bg-page p-6">
                <PencilRuler size={24} className="text-brand-500" aria-hidden />
                <h3 className="mt-4 text-h3 font-bold">Draw it first</h3>
                <p className="mt-2 text-base text-ink-2">Every screen and every state is an HTML page before it is a component. The wireframe is the spec.</p>
                <Link href="/process/" className="text-link mt-4 inline-block text-sm">The design sets</Link>
              </div>
              <div className="card bg-page p-6">
                <BookOpen size={24} className="text-brand-500" aria-hidden />
                <h3 className="mt-4 text-h3 font-bold">Write down why</h3>
                <p className="mt-2 text-base text-ink-2">
                  Each decision gets a dated page saying what was tried and why it lost. {totalWikiPages} pages across {wikiSlugs.length} projects.
                </p>
                <Link href={wikiHref(products[0].slug)} className="text-link mt-4 inline-block text-sm">A project wiki</Link>
              </div>
              <div className="card bg-page p-6">
                <Rocket size={24} className="text-brand-500" aria-hidden />
                <h3 className="mt-4 text-h3 font-bold">Ship it myself</h3>
                <p className="mt-2 text-base text-ink-2">
                  Schema, API, UI, payments and the store release. {stageCounts.live} of {products.length} projects are live today.
                </p>
                <Link href="/work/" className="text-link mt-4 inline-block text-sm">The work</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="wrap py-14">
          <p className="eyebrow">Skills</p>
          <h2 className="section-title mt-2">What I have shipped with.</h2>
          <div className="mt-6 border-b border-line">
            {Object.entries(profile.skills).map(([k, v]) => (
              <div key={k} className="grid gap-2 border-t border-line py-3 sm:grid-cols-[10rem_1fr]">
                <p className="eyebrow pt-1">{k}</p>
                <Chips items={v} />
              </div>
            ))}
          </div>
        </section>
      </main>
      <HireBand title="Want the short version?" />
      <SiteFooter />
    </>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="eyebrow">{k}</dt>
      <dd className="mt-1 font-semibold">{v}</dd>
    </div>
  );
}
