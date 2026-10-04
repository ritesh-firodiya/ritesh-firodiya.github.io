import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Calendar, FileText, MapPin } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { HireBand, StatePill } from "@/components/ui";
import { ShotImage } from "@/components/picture";
import { Board, BoardLegend, StageTrack } from "@/components/stage";
import { products, mediaFor, stageCounts, totalScreens } from "@/lib/products";
import { onBoard } from "@/lib/board";
import { profile } from "@/lib/profile";
import { studyBySlug } from "@/lib/case-studies";

/* The first three products in products.json are the three this page leads
   with. To change what leads, re-order the file. */
const [lead, second, third] = products;
const side = [second, third];

/* Every page states its own canonical — an inherited one silently becomes a
   duplicate-content claim the moment a route is added. */
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  const study = studyBySlug(lead.slug);
  const leadShots = mediaFor(lead.slug).shots;
  /* The second listing shot is usually the one that shows what the product
     does; the first is its home screen. */
  const hero = [mediaFor(second.slug).shots[0], leadShots[1] ?? leadShots[0], mediaFor(third.slug).shots[0]];
  const heroNames = [second.name, lead.name, third.name];
  const recent = profile.experiences.slice(0, 4);
  const earlier = profile.experiences.slice(4);

  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="wrap grid items-center gap-12 pb-16 pt-12 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-pill bg-success-bg px-3 py-1 text-xs font-semibold text-success-fg">
              <span className="h-1.5 w-1.5 rounded-pill bg-success" aria-hidden /> Open to senior, staff and tech-lead roles
            </p>
            <h1 className="hero-title mt-5">{profile.headline}</h1>
            <p className="mt-5 max-w-[54ch] text-lead text-ink-2">
              Nine years of production TypeScript at Walmart, Swiggy, Speechify and Globant. React, React Native, Next.js
              and NestJS, from the Postgres schema to the Play Store release.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
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
            <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-3">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={16} aria-hidden /> {profile.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={16} aria-hidden /> Shipping since 2017
              </span>
            </p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            {hero.map((shot, i) =>
              shot ? (
                <ShotImage key={shot.src} shot={shot} name={heroNames[i]} className={i === 1 ? "scale-110 shadow-lg" : ""} />
              ) : (
                <div key={heroNames[i]} className="slot grid aspect-[9/19] place-items-center rounded-lg">
                  <p className="eyebrow">No screenshot yet</p>
                </div>
              ),
            )}
          </div>
        </section>

        <section className="border-y border-line bg-surface">
          <div className="wrap flex flex-wrap items-center gap-x-10 gap-y-3 py-5">
            <p className="eyebrow">Worked at</p>
            {profile.workedAt.map((c) => (
              <span key={c} className="text-lead font-bold text-ink-2">
                {c}
              </span>
            ))}
          </div>
        </section>

        <section className="wrap grid grid-cols-2 gap-4 py-12 lg:grid-cols-4">
          <Stat n={9} label="years shipping production code" />
          <Stat n={products.length} label="projects of my own" />
          <Stat n={stageCounts.live} label="live today, on the web and in the stores" />
          <Stat n={totalScreens} label="screens designed" />
        </section>

        <section className="wrap pb-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Selected work</p>
              <h2 className="section-title mt-2">Three I would talk through in an interview.</h2>
            </div>
            <Link href="/work/" className="text-link text-base">
              All {products.length} projects
            </Link>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Link href={`/products/${lead.slug}/`} className="card grid overflow-hidden lg:col-span-2 lg:grid-cols-[1fr_1.05fr]">
              <div className="p-7">
                <StatePill p={lead} />
                <h3 className="mt-3 text-h2 font-bold">{lead.name}</h3>
                <p className="mt-2 text-body text-ink-2">
                  {lead.tagline} {lead.blurb}
                </p>
                {study && (
                  <dl className="mt-6 grid gap-4 border-t border-line pt-5">
                    {study.facts.slice(0, 3).map((f) => (
                      <div key={f.k}>
                        <dt className="eyebrow">{f.k}</dt>
                        <dd className="mt-1 text-sm font-semibold">{f.v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 bg-muted p-5">
                {leadShots.slice(1, 3).map((s) => (
                  <ShotImage key={s.src} shot={s} name={lead.name} />
                ))}
              </div>
            </Link>
            <div className="grid gap-6">
              {side.map((p) => {
                const shot = mediaFor(p.slug).shots[0];
                return (
                  <Link key={p.slug} href={`/products/${p.slug}/`} className="card flex gap-5 overflow-hidden p-5">
                    {shot && (
                      <div className="w-24 shrink-0">
                        <ShotImage shot={shot} name={p.name} />
                      </div>
                    )}
                    <div>
                      <StatePill p={p} />
                      <h3 className="mt-3 text-h3 font-bold">{p.name}</h3>
                      <p className="mt-1 text-sm text-ink-2">{p.blurb}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-surface">
          <div className="wrap py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">How I build</p>
                <h2 className="section-title mt-2 max-w-[26ch]">The same eight stages, from an idea to a product people use.</h2>
              </div>
              <Link href="/process/" className="btn btn-quiet">
                See the whole process <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
            <div className="mt-8">
              <StageTrack />
            </div>
            <div className="card mt-8 overflow-x-auto bg-page">
              <Board products={[lead, ...side].filter(onBoard)} />
            </div>
            <BoardLegend />
          </div>
        </section>

        <section className="wrap grid gap-10 py-16 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow">Experience</p>
            <h2 className="section-title mt-2">Nine years, mostly end to end.</h2>
            <Link href="/resume/" className="text-link mt-4 inline-block text-base">
              Full résumé
            </Link>
          </div>
          <ol>
            {recent.map((e) => (
              <li key={e.company} className="grid gap-1 border-t border-line py-4 sm:grid-cols-[12rem_1fr] sm:items-baseline">
                <p className="font-mono text-xs text-ink-3">
                  {e.from} — {e.to}
                </p>
                <p className="text-body">
                  <b className="font-semibold">{e.position}</b> <span className="text-ink-3">·</span> {e.company}
                </p>
              </li>
            ))}
            <li className="grid gap-1 border-y border-line py-4 sm:grid-cols-[12rem_1fr] sm:items-baseline">
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
    <div className="card p-5">
      <p className="figure">{n}</p>
      <p className="mt-2 text-sm text-ink-2">{label}</p>
    </div>
  );
}
