import Link from "next/link";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { ArrowDown, FileText } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { StatePill } from "@/components/ui";
import { CardPicture } from "@/components/picture";
import { products, stageCounts } from "@/lib/products";
import { profile } from "@/lib/profile";

/* Every page states its own canonical — an inherited one silently becomes a
   duplicate-content claim the moment a route is added. */
export const metadata: Metadata = { alternates: { canonical: "/" } };

/* Two parts: who, then work (2026-10-27). The order of products.json is the
   running order: the first row is AskCal, Babul, canon, Chitragupt. Every
   project is the same card, picture first. Each product's funnel is on its own page, not here. */
function Card({ href, picture, name, state, tagline }: { href: string; picture: ReactNode; name: string; state: ReactNode; tagline: string }) {
  return (
    <Link href={href} className="glass overflow-hidden">
      {picture}
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-body font-bold">{name}</h3>
          {state}
        </div>
        <p className="mt-1 text-sm text-ink-2">{tagline}</p>
      </div>
    </Link>
  );
}

/** "A, B and C" */
const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

export default function Home() {
  const cards = products.map((p) => (
    <Card key={p.slug} href={`/products/${p.slug}/`} picture={<CardPicture p={p} h="aspect-[4/3]" />} name={p.name} state={<StatePill p={p} />} tagline={p.tagline} />
  ));
  return (
    <>
      <SiteHeader />
      <main id="main" className="pb-12">
        <section className="glow">
          <div className="grid-bg absolute inset-0 -z-10" aria-hidden />
          <div className="wrap pb-10 pt-10 text-center md:pb-12 md:pt-16">
            <p className="eyebrow">
              {profile.name} · Senior full-stack engineer · {profile.location.split(",")[0]}
            </p>
            <h1 className="display grad-text mx-auto mt-3 max-w-[16ch]">{profile.headline}</h1>
            <p className="mx-auto mt-3 max-w-[52ch] text-lead text-ink-2">
              Nine years of TypeScript at {list(profile.workedAt.slice(0, 3))}. {products.length} products of my own, idea to store.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <a href="#work" className="btn btn-primary">
                See my work <ArrowDown size={16} aria-hidden />
              </a>
              <Link href="/resume/" className="btn btn-quiet">
                <FileText size={16} aria-hidden /> Résumé
              </Link>
            </div>
          </div>
        </section>

        <section id="work" className="wrap mt-12 scroll-mt-16">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-h2 font-extrabold">Work</h2>
            <p className="text-sm text-ink-3">
              {cards.length} projects · {stageCounts.live} live
            </p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{cards}</div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
