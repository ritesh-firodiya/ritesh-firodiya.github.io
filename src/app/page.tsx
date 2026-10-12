import Link from "next/link";
import type { Metadata } from "next";
import { Briefcase, FileText, GitBranch } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { ProjectCard } from "@/components/project-card";
import { Board, BoardLegend } from "@/components/board";
import { products, stageCounts, totalScreens } from "@/lib/products";
import { onBoard } from "@/lib/board";
import { profile } from "@/lib/profile";
import { totalWikiPages } from "@/lib/wiki";

/* Every page states its own canonical — an inherited one silently becomes a
   duplicate-content claim the moment a route is added. */
export const metadata: Metadata = { alternates: { canonical: "/" } };

/* Every project is one card, in the order of products.json: four to a row
   from tablet up, two on a phone. To change the order, re-order the file. */

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap pb-10">
        <section className="flex flex-wrap items-center gap-x-8 gap-y-3 py-5">
          <div className="min-w-0 flex-1 basis-[30rem]">
            <h1 className="hero-title">{profile.headline}</h1>
            <p className="mt-2 text-body text-ink-2">
              Nine years of TypeScript at {profile.workedAt.slice(0, 4).join(", ")}. {profile.location}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/resume/" className="btn btn-primary">
              <FileText size={16} aria-hidden /> Résumé
            </Link>
            <a href={`https://linkedin.com/in/${profile.linkedin}`} className="btn btn-quiet">
              <Briefcase size={16} aria-hidden /> LinkedIn
            </a>
            <a href={`https://github.com/${profile.github}`} className="btn btn-quiet">
              <GitBranch size={16} aria-hidden /> GitHub
            </a>
          </div>
        </section>

        <section id="work" className="scroll-mt-16">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="section-title">Work</h2>
            <p className="font-mono text-xs text-ink-3">
              {products.length} projects · {stageCounts.live} live · {totalScreens} screens · {totalWikiPages} wiki pages
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
            {products.map((p) => (
              <ProjectCard key={p.slug} p={p} />
            ))}
          </div>
        </section>

        <section id="process" className="mt-8 scroll-mt-16">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="section-title">Process</h2>
            <BoardLegend />
          </div>
          <div className="mt-3">
            <Board products={products.filter(onBoard)} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
