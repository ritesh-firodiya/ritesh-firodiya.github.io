import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Label } from "@/components/pills";
import { DRIFT, MIGRATION, VERDICT } from "@/lib/design";

export const metadata: Metadata = {
  title: "Where the design system drifted",
  description:
    "Four of nine design sets break the rules. The lint matrix, and the migration order — cheapest-to-change first, not worst first.",
};

const cell = (v: boolean | null) => (v === null ? "cell-na" : v ? "cell-pass" : "cell-fail");
const COLS = ["Set", "Screens", "Tokens are vars", "Role names", "No style=", "No component classes", "Verdict"];

export default function DriftPage() {
  return (
    <>
      <SiteHeader active="/design" />
      <main id="main">
        <section className="grain relative overflow-hidden">
          <div className="mx-auto max-w-page px-gutter pb-12 pt-section">
            <Link href="/design" className="link-u inline-flex items-center gap-1.5 text-small text-ink-3 hover:text-ink">← Design</Link>
            <Label>Drift · audited 20 Sep 2026</Label>
            <h1 className="mt-4 max-w-[20ch] font-display text-d1 font-semibold">Four of the nine sets break the rules.</h1>
            <p className="mt-7 max-w-measure text-lead text-ink-2">
              Publishing a design system without publishing where it fails is marketing, not
              documentation. This page is the lint output. It is linked from the design index at the
              same weight as the system itself, on purpose.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-page px-gutter">
          <div className="tbl-wrap overflow-hidden rounded-card border border-line bg-surface shadow-lift">
            <div className="tbl-scroll">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">Design system compliance by set and rule</caption>
                <thead>
                  <tr className="border-b border-line bg-paper-2">
                    {COLS.map((c, i) => (
                      <th key={c} scope="col" className={`px-4 py-3.5 font-mono text-label uppercase tracking-label text-ink-3 ${i === 0 ? "tbl-stick bg-paper-2" : ""}`}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-small">
                  {DRIFT.map((d) => {
                    const v = VERDICT[d.verdict];
                    return (
                      <tr key={d.set} className="border-b border-line last:border-0">
                        <th scope="row" className="tbl-stick px-4 py-4 text-left font-display text-h3 font-semibold">{d.set}</th>
                        <td className="nums px-4 py-4 text-ink-2">{d.screens}</td>
                        <td className={`${cell(d.vars)} px-4 py-4`} />
                        <td className={`${cell(d.roles)} px-4 py-4`}>{d.note && !d.roles && <span className="ml-1.5 text-xs2 text-ink-3">{d.note}</span>}</td>
                        <td className={`${cell(d.nostyle)} px-4 py-4`}>{d.note && d.roles && !d.nostyle && <span className="ml-1.5 text-xs2 text-ink-3">{d.note}</span>}</td>
                        <td className={`${cell(d.nocomp)} px-4 py-4`}>{d.note && d.nocomp === false && d.roles && d.nostyle && <span className="ml-1.5 text-xs2 text-ink-3">{d.note}</span>}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-block whitespace-nowrap rounded-pill px-2 py-0.5 font-mono text-label uppercase tracking-label ${v.bg} ${v.fg}`}>{v.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-3 font-mono text-xs2 text-ink-3">
            Two website sets are omitted — they are this site, and auditing yourself in your own table is not a check.
          </p>
        </section>

        <section className="mx-auto max-w-page px-gutter py-section">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-20">
            <div>
              <h2 className="max-w-[22ch] font-display text-d2 font-semibold">The order they get fixed in, and why that order.</h2>
              <p className="mt-5 max-w-prose text-body text-ink-2">
                Not worst-first. Cheapest-to-change first, because a retoken on a design set with no
                app behind it costs nothing downstream, and a retoken on a shipped app means
                re-reviewing every screen a person has already approved.
              </p>
              <ol className="mt-10 border-t border-line">
                {MIGRATION.map((m) => (
                  <li key={m.n} className="grid gap-2 border-b border-line py-5 sm:grid-cols-[3rem_1fr] sm:gap-6">
                    <span className="font-display text-h2 font-semibold text-accent">{m.n}</span>
                    <div>
                      <h3 className="font-display text-h3 font-semibold">{m.title}</h3>
                      <p className="mt-1.5 max-w-prose text-small text-ink-2">{m.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <aside className="lg:pt-20">
              <div className="rounded-card border border-line bg-paper-2 p-7">
                <Label>Why publish this at all</Label>
                <p className="mt-4 text-small text-ink-2">
                  A design system page that shows only the compliant examples is a portfolio piece.
                  The useful artifact is the one that says which rules got broken, by whom, and what
                  it would cost to fix — because that is the part another team actually recognises.
                </p>
                <p className="mt-4 text-small text-ink-2">
                  It is the same standard applied to the apps themselves on the{" "}
                  <Link href="/products" className="link-u text-accent">products page</Link>: state
                  the real model, including the inconvenient one.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
