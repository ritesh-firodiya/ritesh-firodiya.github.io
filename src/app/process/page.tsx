import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Label } from "@/components/pills";
import { STAGES } from "@/lib/process";

export const metadata: Metadata = {
  title: "Process",
  description: "How one person ships apps without a team — eight stages from idea to money, where every gate is answered with a number rather than a feeling.",
};

const RULES = [
  { title: "Never fabricate a number", body: "A failed scrape must not quietly read as “not ranked” — that invents a regression in the next report. It throws, or records an explicit null. Every total names what it excludes." },
  { title: "Claims are whitelisted before they can be said", body: "Every claim any marketing surface may make is written down once, with the file that proves it. Anything not on the list cannot be published — including by me, which is the point." },
  { title: "Some steps refuse to be automated", body: "The funnel report prints the four dashboards to read by hand rather than pretending to have numbers it does not have. A tool that fakes completeness is worse than one that admits a gap." },
];

export default function ProcessPage() {
  return (
    <>
      <SiteHeader active="/process" />
      <main id="main">
        <section className="grain relative overflow-hidden">
          <div className="mx-auto max-w-page px-gutter pb-12 pt-section">
            <Label>Process · idea → money</Label>
            <h1 className="mt-4 max-w-[18ch] font-display text-d1 font-semibold">Eight stages, and every gate is a number.</h1>
            <p className="mt-7 max-w-measure text-lead text-ink-2">
              This is how one person ships apps without a team. It is not advice — it is the actual
              working document, written down because a process that only exists in someone&rsquo;s
              head cannot be audited, handed over, or improved.
            </p>
          </div>
        </section>

        <section className="border-y border-line bg-paper-2">
          <div className="mx-auto max-w-page px-gutter py-section">
            <h2 className="max-w-[24ch] font-display text-d2 font-semibold">
              Most process writing stops at &ldquo;it builds&rdquo;. That is the halfway point.
            </h2>
            <div className="tbl-wrap mt-10 overflow-hidden rounded-card border border-line bg-surface">
              <div className="tbl-scroll">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-line bg-paper-2">
                      <th scope="col" className="tbl-stick bg-paper-2 px-4 py-3.5 font-mono text-label uppercase tracking-label text-ink-3">Stage</th>
                      <th scope="col" className="px-4 py-3.5 font-mono text-label uppercase tracking-label text-ink-3">The gate — answered with a number, not a feeling</th>
                    </tr>
                  </thead>
                  <tbody className="text-small">
                    {STAGES.map((s) => (
                      <tr key={s.n} className={`border-b border-line last:border-0 ${s.n === 4 ? "bg-accent-wash/40" : ""}`}>
                        <th scope="row" className={`tbl-stick px-4 py-4 text-left font-display text-h3 font-semibold ${s.n === 4 ? "bg-accent-wash/40" : ""}`}>
                          <span className="text-accent">{s.n}</span>&nbsp; {s.name}
                        </th>
                        <td className="px-4 py-4 text-ink-2">
                          {s.gate}{" "}
                          {"link" in s && s.link && (
                            <Link href={s.link} className="link-u font-medium text-accent">{s.linkText} →</Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-6 max-w-prose text-body text-ink-2">
              Stages 1–4 are the part everyone writes about. Stages 5–8 are the part that decides
              whether any of it was worth doing, and they are where a solo developer actually loses.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-page px-gutter py-section">
          <h2 className="max-w-[22ch] font-display text-d2 font-semibold">Three rules that shape all eight.</h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {RULES.map((r) => (
              <div key={r.title} className="rounded-card border border-line bg-surface p-7">
                <h3 className="font-display text-h3 font-semibold">{r.title}</h3>
                <p className="mt-3 text-small text-ink-2">{r.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2">
            <Link href="/process/build" className="group bg-surface p-7 transition hover:bg-paper-2">
              <Label>Stage 4, in full</Label>
              <h3 className="mt-3 font-display text-h2 font-semibold group-hover:text-accent">How an app gets built</h3>
              <p className="mt-2 max-w-[40ch] text-small text-ink-2">Five stages with two hard gates, and the rule that a plan approved is not code approved.</p>
            </Link>
            <Link href="/process/pipeline" className="group bg-surface p-7 transition hover:bg-paper-2">
              <Label>Stages 5–8, in full</Label>
              <h3 className="mt-3 font-display text-h2 font-semibold group-hover:text-accent">What happens after it builds</h3>
              <p className="mt-2 max-w-[40ch] text-small text-ink-2">Launch, marketing, money and iteration — the half nobody documents.</p>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
