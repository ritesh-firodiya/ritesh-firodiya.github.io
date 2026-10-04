import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { HireBand, StatePill } from "@/components/ui";
import { Board, BoardLegend, STAGE_ICON } from "@/components/stage";
import { STAGES, onBoard } from "@/lib/board";
import { products, galleriesFor, screensFor, totalScreens, withheldFor } from "@/lib/products";
import { totalWikiPages, wikiOf, wikiHref } from "@/lib/wiki";

export const metadata: Metadata = {
  title: "How I build",
  description:
    "The eight stages every product of mine goes through, from an idea to running it, where each project is on them, and the design set and wiki each one left behind.",
  alternates: { canonical: "/process/" },
};

export default function ProcessPage() {
  const placed = products.filter(onBoard);
  const unplaced = products.filter((p) => !onBoard(p));

  return (
    <>
      <SiteHeader on="process" />
      <main id="main">
        <section className="wrap pb-10 pt-8 lg:pt-10">
          <p className="eyebrow">How I build</p>
          <h1 className="page-title mt-3 max-w-[22ch]">From an idea to a product people use, in eight stages.</h1>
          <p className="mt-4 max-w-[62ch] text-lead text-ink-2">
            Every project goes through the same stages in the same order. Each one leaves something behind that you can
            open.
          </p>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STAGES.map((s, i) => {
              const Icon = STAGE_ICON[s.icon];
              return (
                <li key={s.key} className="card flex flex-col p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-ink-3">0{i + 1}</span>
                    <Icon size={20} className="text-brand-500" aria-hidden />
                  </div>
                  <h2 className="mt-4 text-h3 font-bold">{s.name}</h2>
                  <p className="mb-4 mt-2 text-sm text-ink-2">{s.what}</p>
                  <p className="mt-auto border-t border-line pt-3">
                    <span className="eyebrow block">Leaves behind</span>
                    <span className="mt-1 block text-sm font-semibold">{s.leaves}</span>
                  </p>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="border-y border-line bg-surface">
          <div className="wrap py-10">
            <p className="eyebrow">Where each project is</p>
            <h2 className="section-title mt-2 max-w-[30ch]">Every project, placed on the eight stages.</h2>
            <p className="mt-3 max-w-[62ch] text-base text-ink-2">
              Counted from each project&rsquo;s own repository. A filled dot means that stage&rsquo;s work exists and can
              be opened.
            </p>
            <div className="card mt-8 overflow-x-auto bg-page">
              <Board products={placed} />
            </div>
            <BoardLegend />
            {unplaced.length > 0 && (
              <p className="mt-3 text-sm text-ink-3">Not on the board yet: {unplaced.map((p) => p.name).join(", ")}.</p>
            )}
          </div>
        </section>

        <section className="wrap py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Open the work</p>
              <h2 className="section-title mt-2">
                {totalScreens} screens and {totalWikiPages} wiki pages.
              </h2>
            </div>
            <p className="font-mono text-xs text-ink-3">Read from each project&rsquo;s repo at build time. Nothing is copied here.</p>
          </div>
          <div className="card mt-8 overflow-x-auto">
            <table className="tbl min-w-[720px]">
              <thead>
                <tr>
                  <th scope="col">Project</th>
                  <th scope="col">State</th>
                  <th scope="col" className="text-right">Screens</th>
                  <th scope="col" className="text-right">Wiki pages</th>
                  <th scope="col">Open</th>
                </tr>
              </thead>
              <tbody>
                {placed.map((p) => {
                  const galleries = galleriesFor(p.slug);
                  const withheld = withheldFor(p.slug);
                  const wiki = wikiOf(p.slug);
                  return (
                    <tr key={p.slug}>
                      <td>
                        <Link href={`/products/${p.slug}/`} className="font-semibold hover:text-brand-500">
                          {p.name}
                        </Link>
                      </td>
                      <td>
                        <StatePill p={p} />
                      </td>
                      <td className="text-right font-mono">
                        {galleries.length ? screensFor(p.slug).length : <span className="text-ink-3">withheld</span>}
                      </td>
                      <td className="text-right font-mono">{wiki?.total ?? "—"}</td>
                      <td>
                        {galleries.length ? (
                          /* A plain anchor: the gallery is the product's own static page, not a route. */
                          <a href={galleries[0].href} className="text-link">
                            Flow chart
                          </a>
                        ) : (
                          <span
                            className="text-ink-3 line-through"
                            title={`Not published: ${withheld.flatMap((w) => w.failed.map((f) => f.id)).join(", ") || "no design set"}`}
                          >
                            Flow chart
                          </span>
                        )}
                        {wiki && (
                          <>
                            {" · "}
                            <Link href={wikiHref(p.slug)} className="text-link">
                              Wiki
                            </Link>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <HireBand title="Want an engineer who takes it the whole way?" />
      <SiteFooter />
    </>
  );
}
