import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Label } from "@/components/pills";

export const metadata: Metadata = {
  title: "What happens after it builds",
  description: "Launch, market, money and improve — the four stages nobody documents, and the positioning method that reads competitors' one-star reviews.",
};

const STAGES = [
  { n: "05", title: "Launch", body: "The listing is the product for everyone who has not installed yet. The title carries roughly 30 characters and is the single heaviest ranking signal either store has — it is written before the screenshots, not after.", gate: "Listing complete, screenshots uploaded, and the review prompt actually firing in the build — not merely written." },
  { n: "06", title: "Market — one channel, thirty days", body: "One channel at a time, judged after 30 days. The reason is mechanical rather than philosophical: editing a store listing restarts the store's re-indexing, which invalidates the ranking series for one to two weeks. Change two things and you have learned nothing about either.", extra: "Content is generated from the product's own data rather than filmed. The format rules are blunt: a hook inside the first 1.2 seconds, no logo before the payoff, one idea per clip, and the call to action is a search instruction rather than a link, because descriptions are not clickable and pinned comments are. Expect 30–60 clips before one works." },
  { n: "07", title: "Money", body: "Install → paid conversion as a known number. Where the data cannot be fetched honestly, the tool prints the dashboards to read by hand instead of inventing a figure. Every total states what it excludes.", gate: "You can say the conversion rate out loud without hedging." },
  { n: "08", title: "Improve", body: "The backlog is ranked from two sources only: themes in the reviews, and where the funnel drops. Not from whichever idea is loudest that week." },
];

const FORBIDDEN = [
  "Never cite a rating, ranking or install count. Zero ratings means no rating may be quoted.",
  "Never name a competitor. Attack the category's behaviour, never a company.",
  "Never buy followers or ratings. It is fraud, both stores detect it, and the penalty is removal.",
  "Never say “the app is free” when only part of it is.",
];

export default function PipelinePage() {
  return (
    <>
      <SiteHeader active="/process" />
      <main id="main">
        <section className="grain relative overflow-hidden">
          <div className="mx-auto max-w-page px-gutter pb-12 pt-section">
            <Link href="/process" className="link-u inline-flex items-center gap-1.5 text-small text-ink-3 hover:text-ink">← Process</Link>
            <Label>Stages 5–8 · launch, market, money, improve</Label>
            <h1 className="mt-4 max-w-[20ch] font-display text-d1 font-semibold">The half nobody documents.</h1>
            <p className="mt-7 max-w-measure text-lead text-ink-2">
              Plenty of writing exists about building an app. Almost none exists about the four
              stages after it builds, which is where a solo developer&rsquo;s apps actually die.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-page px-gutter py-section">
          <ol className="border-t border-line">
            {STAGES.map((s) => (
              <li key={s.n} className="grid gap-3 border-b border-line py-8 md:grid-cols-[4rem_1fr] md:gap-8">
                <span className="font-display text-d2 font-semibold text-accent">{s.n}</span>
                <div>
                  <h2 className="font-display text-h2 font-semibold">{s.title}</h2>
                  <p className="mt-3 max-w-prose text-body text-ink-2">{s.body}</p>
                  {s.extra && <p className="mt-3 max-w-prose text-small text-ink-2">{s.extra}</p>}
                  {s.gate && <p className="mt-3 max-w-prose text-small text-ink-2"><b className="text-ink">Gate:</b> {s.gate}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-y border-line bg-paper-2">
          <div className="mx-auto max-w-page px-gutter py-section">
            <Label>The method underneath stage 3</Label>
            <h2 className="mt-3 max-w-[24ch] font-display text-d2 font-semibold">Positioning comes out of competitors&rsquo; one-star reviews.</h2>
            <div className="mt-9 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-20">
              <div className="max-w-prose space-y-5 text-body text-ink-2">
                <p>
                  Pull every negative review for the five biggest incumbents in a category. Theme
                  them. Count them. For one category that came to 218 reviews across five apps, and
                  they sorted into price, ads, bugs and depth — in that order, with price and ads
                  together accounting for nearly half.
                </p>
                <p>
                  Then: <b className="text-ink">the single loudest complaint in a category is the one
                  thing you structurally do not do.</b> Not a feature you add — a thing your product
                  cannot do by construction. That sentence becomes the marketing, the onboarding and
                  the paywall copy.
                </p>
                <p>
                  It also becomes a constraint you have to keep. Which is exactly how this site ended
                  up claiming &ldquo;no ads in our games&rdquo; while one of the games shipped an ad
                  banner — the positioning outlived the fact.{" "}
                  <Link href="/products" className="link-u font-medium text-accent">The fix is on the products page.</Link>
                </p>
              </div>
              <aside>
                <div className="rounded-card border border-line bg-surface p-7">
                  <Label>The forbidden list</Label>
                  <ul className="mt-5 space-y-3 text-small text-ink-2">
                    {FORBIDDEN.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                  <p className="mt-6 border-t border-line pt-5 text-small text-ink-2">
                    Every allowed claim is listed separately, each with the file that proves it. If it
                    is not on that list it cannot be published.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
