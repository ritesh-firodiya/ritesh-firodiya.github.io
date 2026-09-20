import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { ModelPill, StatePill, Label } from "@/components/pills";
import { products, shipped, unbuilt, verifiedOn, mediaFor, type Product, type Model } from "@/lib/products";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Every app, its real monetization model and its real price — one is free with ads, two are a single payment, three are subscriptions, one re-charges every tax year.",
};

const EXPLAINER: { model: Model; body: string }[] = [
  { model: "one-time", body: "You pay once and keep it. Nothing renews, nothing expires, and it restores on a new phone from your store account." },
  { model: "free-ads", body: "Free to install with no purchase available. It is paid for by a banner and an interstitial between games, which means it needs a network and the ad network sees a device identifier." },
  { model: "subscription", body: "It charges again every month or every year until you cancel. Cancelling is done in the store account, not in the app, and access runs to the end of the period you paid for." },
  { model: "per-period", body: "Not a subscription and not quite one-time. Each assessment year is its own purchase, so the charge repeats annually but only if you come back. Nothing auto-renews." },
  { model: "free", body: "No ads, no purchases, nothing to buy. Nothing currently sits here — it is on the table so the absence is visible rather than implied." },
];

const appsFor = (m: Model) =>
  products.filter((p) => p.model === m).map((p) => p.name).join(" · ") || "None today";

/* `closed` and `none` are never hidden and never softened — a person deciding
   whether to install needs to know a button is missing on purpose. */
function Availability({ p }: { p: Product }) {
  const open = Object.entries(p.platforms).filter(
    ([, v]) => v && (v.state === "live" || v.state === "beta"),
  );
  if (open.length === 0)
    return (
      <>
        <StatePill state="none">Not out</StatePill>
        <span className="mt-1 block text-xs2 text-ink-3">
          {p.notBuilt ? "not built yet" : "no public track yet"}
        </span>
      </>
    );
  const [firstKey, first] = open[0];
  const rest = open.slice(1);
  const name = firstKey === "web" ? "Live" : first!.state === "live" ? "Play" : "TestFlight";
  return (
    <>
      <StatePill state={first!.state}>{name}</StatePill>
      {rest.length > 0 && (
        <span className="mt-1 block text-xs2 text-ink-3">
          {rest.map(([k]) => (k === "ios" ? "iOS TestFlight" : "Android")).join(", ")}
        </span>
      )}
    </>
  );
}

const dash = <span className="text-ink-3">—</span>;

function Row({ p }: { p: Product }) {
  return (
    <tr className="border-b border-line last:border-0">
      <th scope="row" className={`tbl-stick px-4 py-4 text-left font-display text-h3 font-semibold ${p.notBuilt ? "text-ink-2" : ""}`}>
        <span className="flex items-start gap-3">
          {mediaFor(p.slug).icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaFor(p.slug).icon!} alt="" width={34} height={34} className="mt-0.5 h-[34px] w-[34px] shrink-0 rounded-lg border border-line" />
          ) : (
            <span className="shot-ph mt-0.5 h-[34px] w-[34px] shrink-0 rounded-lg" aria-hidden="true" />
          )}
          <span className="min-w-0">
            {p.notBuilt ? p.name : <Link href={`/products/${p.slug}/`} className="link-u hover:text-accent">{p.name}</Link>}
            <span className="mt-0.5 block font-sans text-xs2 font-normal text-ink-3">
              {p.fullName.includes("—") ? p.fullName.split("—")[1].trim() : p.tagline}
            </span>
          </span>
        </span>
      </th>
      <td className="px-4 py-4"><ModelPill model={p.model} /></td>
      <td className="nums px-4 py-4 font-medium">
        {p.price ?? dash}
        {p.priceNote && <span className="block text-xs2 font-normal text-ink-3">{p.priceNote}</span>}
      </td>
      <td className={`px-4 py-4 ${p.model === "free-ads" ? "font-medium text-m-ads" : "text-ink-2"}`}>{p.ads ?? dash}</td>
      <td className="px-4 py-4 text-ink-2">{p.offline ?? dash}</td>
      <td className={`px-4 py-4 ${p.analytics && p.analytics !== "None" ? "font-medium text-m-year" : "text-ink-2"}`}>{p.analytics ?? dash}</td>
      <td className="px-4 py-4"><Availability p={p} /></td>
    </tr>
  );
}

const HEADERS = ["App", "Model", "You pay", "Ads", "Offline", "Analytics", "Get it"];

export default function ProductsPage() {
  return (
    <>
      <SiteHeader active="/products" />
      <main id="main">
        <section className="grain relative overflow-hidden">
          <div className="mx-auto max-w-page px-gutter pb-12 pt-section">
            <Label>Products · {products.length} apps</Label>
            <h1 className="mt-4 max-w-[17ch] font-display text-d1 font-semibold">What each one costs, before you install it.</h1>
            <p className="mt-7 max-w-measure text-lead text-ink-2">
              One of these is free and carries ads. Two are a single payment. Three are subscriptions.
              One re-charges every tax year. The table says which is which, and so does every product page.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-page px-gutter">
          <div className="tbl-wrap overflow-hidden rounded-card border border-line bg-surface shadow-lift">
            <div className="tbl-scroll">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">Every app with its monetization model, price, ad surfaces, offline behaviour, analytics and availability</caption>
                <thead>
                  <tr className="border-b border-line bg-paper-2">
                    {HEADERS.map((h, i) => (
                      <th key={h} scope="col" className={`whitespace-nowrap px-4 py-3.5 font-mono text-label uppercase tracking-label text-ink-3 ${i === 0 ? "tbl-stick bg-paper-2" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-small">
                  {shipped.map((p) => <Row key={p.slug} p={p} />)}
                  {unbuilt.length > 0 && (
                    <tr className="border-b border-line bg-paper-2">
                      <td colSpan={HEADERS.length} className="px-4 py-2.5 font-mono text-label uppercase tracking-label text-ink-3">Not built yet — listed so the list is complete</td>
                    </tr>
                  )}
                  {unbuilt.map((p) => <Row key={p.slug} p={p} />)}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-3 font-mono text-xs2 text-ink-3 lg:hidden">Scroll the table sideways — the app name stays pinned.</p>
        </section>

        <section className="mx-auto max-w-page px-gutter py-section">
          <h2 className="max-w-[22ch] font-display text-d2 font-semibold">What each of those words commits you to.</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {EXPLAINER.map((m) => (
              <div key={m.model} className="rounded-card border border-line bg-surface p-6">
                <ModelPill model={m.model} />
                <p className="mt-4 text-body text-ink-2">{m.body}</p>
                <p className="mt-3 font-mono text-xs2 text-ink-3">{appsFor(m.model)}</p>
              </div>
            ))}
            <div className="rounded-card border border-dashed border-line-2 bg-paper-2 p-6">
              <Label>And the rule</Label>
              <p className="mt-4 text-body text-ink-2">
                Whichever it is, the model is on the product page <b className="text-ink">above</b> the
                install button — never below it, never in a footnote, and never softened into a word
                like &ldquo;unlock&rdquo;.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-paper-2">
          <div className="mx-auto max-w-page px-gutter py-section">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-20">
              <div>
                <Label>Why this page exists</Label>
                <h2 className="mt-3 max-w-[20ch] font-display text-d2 font-semibold">This site used to say something that was not true.</h2>
                <div className="mt-7 max-w-prose space-y-5 text-body text-ink-2">
                  <p>An earlier version of these pages carried two studio-wide promises: <i>no ads in our games</i>, and <i>one-time purchases, not subscriptions you forget about</i>. Both read well. Neither was true.</p>
                  <p>Tic Tac Toe ships an AdMob banner and an interstitial. Four of the eight apps are subscriptions. A third page said Chitragupt was free and would stay free, while its own config defined three priced tiers.</p>
                  <p>The mistake was not the wording, it was the <b className="text-ink">shape of the claim</b>. A promise made on behalf of every app is only as true as the least convenient app, and it goes stale the moment one of them changes. A fact stated per app cannot do that.</p>
                  <p>So there are no studio promises here any more. There is a table, and every row is checked against the app&rsquo;s own source.</p>
                </div>
              </div>
              <aside className="lg:pt-16">
                <div className="rounded-card border border-line bg-surface p-7">
                  <Label>How this stays true</Label>
                  <ul className="mt-5 space-y-4 text-small text-ink-2">
                    <li>Every fact here is read from the app repositories, not typed into a page.</li>
                    <li>The next step is a generator that refuses to build when a stated fact disagrees with the source — so an app that gains an ad SDK breaks the build rather than the promise.</li>
                    <li>The date below is when a human last checked every row by hand.</li>
                  </ul>
                  <p className="mt-6 border-t border-line pt-5 font-mono text-xs2 text-ink-3">
                    Last verified <span className="text-ink-2">{verifiedOn}</span>
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
