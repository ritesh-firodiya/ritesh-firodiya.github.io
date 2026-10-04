import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Calendar, FileText, MapPin } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { HireBand } from "@/components/ui";
import { ShotImage } from "@/components/picture";
import { ProjectCard } from "@/components/project-card";
import { Board, BoardLegend } from "@/components/stage";
import { products, shotsOf, stageCounts, totalScreens } from "@/lib/products";
import { onBoard } from "@/lib/board";
import { profile } from "@/lib/profile";
import { totalWikiPages } from "@/lib/wiki";

/* The first three products in products.json are the three this page leads
   with. To change what leads, re-order the file. */
const leads = products.slice(0, 3);

/* Every page states its own canonical — an inherited one silently becomes a
   duplicate-content claim the moment a route is added. */
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  /* The lead app stands in the middle, a step forward. */
  const hero = [leads[1], leads[0], leads[2]].map((p) => ({ p, shot: shotsOf(p, 1)[0] }));
  const recent = profile.experiences.slice(0, 4);
  const earlier = profile.experiences.slice(4);

  return (
    <>
      <SiteHeader />
      <main id="main">
        <div className="hero-wash">
          <section className="wrap grid items-center gap-10 pb-10 pt-10 lg:grid-cols-[1.15fr_1fr] lg:pt-14">
            <div>
              <p className="inline-flex items-center gap-2 rounded-pill bg-success-bg px-3 py-1 text-xs font-semibold text-success-fg">
                <span className="h-1.5 w-1.5 rounded-pill bg-success" aria-hidden /> Open to senior, staff and tech-lead roles
              </p>
              <h1 className="hero-title mt-4">{profile.headline}</h1>
              <p className="mt-4 max-w-[54ch] text-lead text-ink-2">
                Nine years of production TypeScript at Walmart, Swiggy, Speechify and Globant. React, React Native,
                Next.js and NestJS, from the Postgres schema to the Play Store release.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="/resume/" className="btn btn-primary">
                  <FileText size={16} aria-hidden /> Read the résumé
                </Link>
                <Link href="/work/" className="btn btn-quiet">
                  See the work
                </Link>
                <a href={`mailto:${profile.email}`} className="text-link ml-1 text-base">
                  {profile.email}
                </a>
              </div>
              <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-3">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={16} aria-hidden /> {profile.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={16} aria-hidden /> Shipping since 2017
                </span>
              </p>
            </div>
            <div className="mx-auto grid w-full max-w-md grid-cols-3 items-center gap-3">
              {hero.map(({ p, shot }, i) =>
                shot ? (
                  <Link key={p.slug} href={`/products/${p.slug}/`} className={i === 1 ? "relative z-10 scale-110" : ""}>
                    <ShotImage shot={shot} name={p.name} className="shot--lift" />
                  </Link>
                ) : (
                  <div key={p.slug} className="slot grid aspect-[9/19] place-items-center rounded-lg">
                    <p className="eyebrow">No screenshot yet</p>
                  </div>
                ),
              )}
            </div>
          </section>
        </div>

        <section className="border-y border-line bg-surface">
          <div className="wrap flex flex-wrap items-center gap-x-9 gap-y-2 py-4">
            <p className="eyebrow">Worked at</p>
            {profile.workedAt.map((c) => (
              <span key={c} className="text-body font-bold text-ink-2">
                {c}
              </span>
            ))}
          </div>
        </section>

        <section className="wrap py-8">
          <dl className="facts">
            <Stat n={9} label="years shipping production code" />
            <Stat n={products.length} label="projects of my own" />
            <Stat n={stageCounts.live} label="live today" />
            <Stat n={totalScreens} label={`screens designed, ${totalWikiPages} wiki pages written`} />
          </dl>
        </section>

        <section className="wrap pb-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Selected work</p>
              <h2 className="section-title mt-1.5">Three I would talk through in an interview.</h2>
            </div>
            <Link href="/work/" className="text-link text-base">
              All {products.length} projects
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {leads.map((p) => (
              <ProjectCard key={p.slug} p={p} detail />
            ))}
          </div>
        </section>

        <section className="border-y border-line bg-surface">
          <div className="wrap py-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">How I build</p>
                <h2 className="section-title mt-1.5 max-w-[30ch]">The same eight stages, from an idea to a product people use.</h2>
              </div>
              <Link href="/process/" className="btn btn-quiet">
                See the whole process <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
            <div className="card mt-6 overflow-x-auto bg-page">
              <Board products={leads.filter(onBoard)} />
            </div>
            <BoardLegend />
          </div>
        </section>

        <section className="wrap grid gap-8 py-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow">Experience</p>
            <h2 className="section-title mt-1.5">Nine years, mostly end to end.</h2>
            <Link href="/resume/" className="text-link mt-3 inline-block text-base">
              Full résumé
            </Link>
          </div>
          <ol>
            {recent.map((e) => (
              <li key={e.company} className="grid gap-1 border-t border-line py-3 sm:grid-cols-[12rem_1fr] sm:items-baseline">
                <p className="font-mono text-xs text-ink-3">
                  {e.from} — {e.to}
                </p>
                <p className="text-body">
                  <b className="font-semibold">{e.position}</b> <span className="text-ink-3">·</span> {e.company}
                </p>
              </li>
            ))}
            <li className="grid gap-1 border-y border-line py-3 sm:grid-cols-[12rem_1fr] sm:items-baseline">
              <p className="font-mono text-xs text-ink-3">
                {earlier.at(-1)?.from.split(" ").at(-1)} — {earlier[0]?.to.split(" ").at(-1)}
              </p>
              <p className="text-body text-ink-2">{earlier.map((e) => e.company.replace(/\s*\(.*\)/, "")).join(" · ")}</p>
            </li>
          </ol>
        </section>
      </main>
      <HireBand title="Hiring for a senior, staff or tech-lead role?" />
      <SiteFooter />
    </>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <dd className="figure">{n}</dd>
      <dt className="mt-1.5 text-sm text-ink-2">{label}</dt>
    </div>
  );
}
