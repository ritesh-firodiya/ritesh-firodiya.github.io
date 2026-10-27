import Link from "next/link";
import type { Metadata } from "next";
import { ArrowDown, FileText, Library, ShieldCheck } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { StatePill } from "@/components/ui";
import { CardPicture } from "@/components/picture";
import { products, stageCounts, mediaFor, type Product } from "@/lib/products";
import { profile } from "@/lib/profile";

/* Every page states its own canonical — an inherited one silently becomes a
   duplicate-content claim the moment a route is added. */
export const metadata: Metadata = { alternates: { canonical: "/" } };

/* Three parts: who, work, the tools (2026-10-27). The order of products.json
   is the running order: the first four are the large cards, the rest are
   tiles. To change either, re-order the file. Each product's funnel is on its
   own page, not here. */
const FEATURED = 4;

function Tile({ p }: { p: Product }) {
  const icon = mediaFor(p.slug).icon;
  return (
    <Link href={`/products/${p.slug}/`} className="glass flex items-center gap-3 p-3">
      {icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={icon} alt="" width={40} height={40} className="app-icon" />
      ) : (
        <span className="app-icon app-icon--none" aria-hidden>
          {p.name[0].toUpperCase()}
        </span>
      )}
      <span className="min-w-0">
        <b className="block truncate text-sm font-semibold">{p.name}</b>
        {/* A long state ("In App Store review") wraps rather than widening a phone tile. */}
        <span className="mt-1 inline-block [&>.state]:whitespace-normal">
          <StatePill p={p} />
        </span>
      </span>
    </Link>
  );
}

/** "A, B and C" */
const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

export default function Home() {
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
              {products.length} projects · {stageCounts.live} live
            </p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, FEATURED).map((p) => (
              <Link key={p.slug} href={`/products/${p.slug}/`} className="glass overflow-hidden">
                <CardPicture p={p} h="aspect-[4/3]" />
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-body font-bold">{p.name}</h3>
                    <StatePill p={p} />
                  </div>
                  <p className="mt-1 text-sm text-ink-2">{p.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {products.slice(FEATURED).map((p) => (
              <Tile key={p.slug} p={p} />
            ))}
          </div>
        </section>

        {/* Said once, here. Each project page shows what they do for that product. */}
        <section id="tools" className="wrap mt-12 scroll-mt-16">
          <h2 className="text-h2 font-extrabold">Tools I built to ship them</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {/* canon's repo is private, so its card links nowhere. */}
            <div className="glass flex gap-3 p-4">
              <span className="tool-mark tool-mark--canon">
                <Library size={20} aria-hidden />
              </span>
              <p className="text-base text-ink-2">
                <b className="text-ink">canon</b> — one searchable home for every product&apos;s specs, decisions and runbooks.
              </p>
            </div>
            <Link href="/products/canon/" className="glass flex gap-3 p-4">
              <span className="tool-mark tool-mark--canon">
                <ShieldCheck size={20} aria-hidden />
              </span>
              <p className="text-base text-ink-2">
                <b className="text-ink">canon</b> — checks every AI request against a product&apos;s own rules and past decisions before work starts.
              </p>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
