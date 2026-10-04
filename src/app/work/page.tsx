import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { HireBand, StatePill } from "@/components/ui";
import { CardPicture } from "@/components/picture";
import { WorkGrid, type Filter, type Item } from "@/components/work-grid";
import { products, hasBuild, stageOf, stageCounts, STAGE_LABEL, type Product } from "@/lib/products";
import { evidenceLine } from "@/lib/evidence";

const NUMBER = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen"];
const say = (n: number) => NUMBER[n] ?? String(n);

const title = `${say(products.length)} projects. ${say(stageCounts.live)} ${stageCounts.live === 1 ? "is" : "are"} live.`;

export const metadata: Metadata = {
  title: "Work",
  description: `${products.length} projects of my own: ${stageCounts.live} live, ${stageCounts.test} in testing. Each one opens to its screens, its wiki and its store listing.`,
  alternates: { canonical: "/work/" },
};

/** Something with a build is a card with its picture. */
function Card({ p }: { p: Product }) {
  return (
    <Link href={`/products/${p.slug}/`} className="card overflow-hidden">
      <CardPicture p={p} />
      <div className="p-5">
        <StatePill p={p} />
        <h3 className="mt-3 text-h3 font-bold">{p.name}</h3>
        <p className="mt-1 text-base text-ink-2">{p.tagline}</p>
        <p className="mt-4 border-t border-line pt-3 font-mono text-xs text-ink-3">{evidenceLine(p)}</p>
      </div>
    </Link>
  );
}

/** Something with nothing to show yet is a row, not a card with an empty picture. */
function Row({ p }: { p: Product }) {
  return (
    <Link
      href={`/products/${p.slug}/`}
      className="grid items-center gap-x-6 gap-y-1 border-b border-line px-5 py-4 last:border-b-0 hover:bg-muted sm:grid-cols-[8rem_14rem_1fr_auto]"
    >
      <span>
        <StatePill p={p} />
      </span>
      <span className="text-body font-bold">{p.name}</span>
      <span className="text-base text-ink-2">{p.tagline}</span>
      <span className="font-mono text-xs text-ink-3">{evidenceLine(p)}</span>
    </Link>
  );
}

export default function WorkPage() {
  const item = (p: Product, node: React.ReactNode): Item => ({ key: p.slug, stage: stageOf(p), node });
  const cards = products.filter(hasBuild).map((p) => item(p, <Card p={p} />));
  const rows = products.filter((p) => !hasBuild(p)).map((p) => item(p, <Row p={p} />));
  const counts: { key: Filter; label: string; n: number }[] = [
    { key: "all", label: "All", n: products.length },
    ...(["live", "test", "build", "draft"] as const).map((k) => ({ key: k, label: STAGE_LABEL[k], n: stageCounts[k] })),
  ];

  return (
    <>
      <SiteHeader on="work" />
      <main id="main" className="wrap pb-16 pt-12 lg:pt-16">
        <p className="eyebrow">Work</p>
        <h1 className="page-title mt-3">{title}</h1>
        <p className="mt-4 max-w-[60ch] text-lead text-ink-2">
          Each one opens to its screens, its wiki and, where there is one, its store listing.
        </p>
        <WorkGrid counts={counts} cards={cards} rows={rows} />
      </main>
      <HireBand title="Seen enough to talk?" />
      <SiteFooter />
    </>
  );
}
